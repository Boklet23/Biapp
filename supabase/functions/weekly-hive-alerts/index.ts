import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-alerts-secret',
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const OVERDUE_DAYS = 21;
const DAY_MS = 86_400_000;

interface HiveRow { id: string; name: string; user_id: string }
interface InspRow {
  hive_id: string;
  inspected_at: string;
  varroa_count: number | null;
  treatment_applied: boolean;
}
interface PushMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
}
interface ExpoPushTicket {
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // ── Auth check ──────────────────────────────────────────────────────────
  const alertsSecret = Deno.env.get('WEEKLY_ALERTS_SECRET');
  if (alertsSecret) {
    if (req.headers.get('x-alerts-secret') !== alertsSecret) {
      return new Response('Unauthorized', { status: 401, headers: CORS });
    }
  }

  try {
    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const now = new Date();

    // ── 1. Users with push tokens ────────────────────────────────────────
    const { data: profiles, error: profilesErr } = await adminSupabase
      .from('profiles')
      .select('id, push_token')
      .not('push_token', 'is', null);

    if (profilesErr) throw profilesErr;
    if (!profiles?.length) return Response.json({ sent: 0 }, { headers: CORS });

    const pushTokenByUser = new Map<string, string>(
      (profiles as { id: string; push_token: string }[]).map(p => [p.id, p.push_token]),
    );
    const userIds = [...pushTokenByUser.keys()];

    // ── 2. Active hives ──────────────────────────────────────────────────
    const { data: hives, error: hivesErr } = await adminSupabase
      .from('hives')
      .select('id, name, user_id')
      .eq('is_active', true)
      .in('user_id', userIds);

    if (hivesErr) throw hivesErr;
    if (!hives?.length) return Response.json({ sent: 0 }, { headers: CORS });

    const hiveIds = (hives as HiveRow[]).map(h => h.id);

    // ── 3. Recent inspections — fetch more, then group per hive ─────────
    const { data: inspections, error: inspErr } = await adminSupabase
      .from('inspections')
      .select('hive_id, inspected_at, varroa_count, treatment_applied')
      .in('hive_id', hiveIds)
      .order('inspected_at', { ascending: false })
      .limit(hiveIds.length * 10);

    if (inspErr) throw inspErr;

    // Keep only the 3 most recent inspections per hive (results arrive newest-first)
    const inspByHive = new Map<string, InspRow[]>();
    for (const insp of (inspections ?? []) as InspRow[]) {
      const existing = inspByHive.get(insp.hive_id) ?? [];
      if (existing.length < 3) {
        existing.push(insp);
        inspByHive.set(insp.hive_id, existing);
      }
    }

    // ── 4. Generate alert messages ───────────────────────────────────────
    const messages: PushMessage[] = [];

    for (const hive of hives as HiveRow[]) {
      const token = pushTokenByUser.get(hive.user_id);
      if (!token?.startsWith('ExponentPushToken')) continue;

      const hivInsp = inspByHive.get(hive.id) ?? [];
      const latest = hivInsp[0];

      const daysSince = latest
        ? Math.floor((now.getTime() - new Date(latest.inspected_at).getTime()) / DAY_MS)
        : 999;

      if (daysSince > OVERDUE_DAYS) {
        messages.push({
          to: token,
          title: '🐝 Inspeksjon forfalt',
          body: `${hive.name} er ikke inspisert på ${daysSince} dager`,
          data: { hiveId: hive.id, type: 'inspection_overdue' },
        });
        continue;
      }

      const recent3 = hivInsp.slice(0, 3).filter(i => i.varroa_count != null);
      if (recent3.length === 3) {
        const [newest, mid, oldest] = recent3.map(i => i.varroa_count!);
        if (newest > mid && mid > oldest) {
          messages.push({
            to: token,
            title: '⚠️ Varroa øker',
            body: `${hive.name}: ${oldest}→${mid}→${newest} mitter/dag. Vurder behandling.`,
            data: { hiveId: hive.id, type: 'varroa_trend' },
          });
        }
      }

      if (latest?.varroa_count != null && latest.varroa_count > 10) {
        const treatedRecently = hivInsp.some(
          i => i.treatment_applied &&
            (now.getTime() - new Date(i.inspected_at).getTime()) < 30 * DAY_MS,
        );
        if (!treatedRecently) {
          messages.push({
            to: token,
            title: '🚨 Høy varroa',
            body: `${hive.name}: ${latest.varroa_count} mitter/dag — behandling anbefales snarest`,
            data: { hiveId: hive.id, type: 'varroa_high' },
          });
        }
      }
    }

    if (messages.length === 0) return Response.json({ sent: 0 }, { headers: CORS });

    // ── 5. Send in batches of 100, handle DeviceNotRegistered ────────────
    let sentCount = 0;
    const invalidTokens: string[] = [];

    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(batch),
      });

      if (!res.ok) continue;

      const json = await res.json() as { data?: ExpoPushTicket[] };
      const tickets = json.data ?? [];
      for (let j = 0; j < tickets.length; j++) {
        const ticket = tickets[j];
        if (ticket.status === 'ok') {
          sentCount++;
        } else if (ticket.details?.error === 'DeviceNotRegistered') {
          invalidTokens.push(batch[j].to);
        }
      }
    }

    // ── 6. Null out stale push tokens (best-effort) ──────────────────────
    if (invalidTokens.length > 0) {
      adminSupabase
        .from('profiles')
        .update({ push_token: null })
        .in('push_token', invalidTokens)
        .then(() => {})
        .catch(() => {});
    }

    console.log(`weekly-hive-alerts: sent ${sentCount}/${messages.length} notifications, invalidated ${invalidTokens.length} tokens`);
    return Response.json({ sent: sentCount, total: messages.length }, { headers: CORS });

  } catch (err) {
    console.error('weekly-hive-alerts error:', err);
    return Response.json({ error: 'Alerts feilet.' }, { status: 500, headers: CORS });
  }
});
