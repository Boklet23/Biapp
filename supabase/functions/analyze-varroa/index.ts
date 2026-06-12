import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Monthly analysis limits per subscription tier
const LIMITS: Record<string, number> = {
  starter:      0,
  hobbyist:     10,
  profesjonell: 9999,
  lag:          9999,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // ── Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Ikke autorisert' }, { status: 401, headers: CORS });
    }

    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authErr } = await userSupabase.auth.getUser();
    if (authErr || !user) {
      return Response.json({ error: 'Ikke innlogget' }, { status: 401, headers: CORS });
    }

    // ── Subscription check ────────────────────────────────────────────────
    const { data: profile } = await userSupabase
      .from('profiles')
      .select('subscription_tier, trial_expires_at')
      .eq('id', user.id)
      .single();

    let tier = profile?.subscription_tier ?? 'starter';
    // Aktiv prøveperiode gir Hobbyist-tilgang — samme logikk som klientens useEffectiveTier
    if (
      tier === 'starter' &&
      typeof profile?.trial_expires_at === 'string' &&
      new Date(profile.trial_expires_at) > new Date()
    ) {
      tier = 'hobbyist';
    }
    const limit = LIMITS[tier] ?? 0;

    if (limit === 0) {
      return Response.json(
        { error: 'AI-analyse krever Hobbyist-abonnement eller høyere. Oppgrader for å bruke funksjonen.' },
        { status: 403, headers: CORS },
      );
    }

    // ── Rate limit ────────────────────────────────────────────────────────
    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await adminSupabase
      .from('ai_analysis_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('analysis_type', 'varroa')
      .gte('used_at', startOfMonth.toISOString());

    const used = count ?? 0;
    if (used >= limit) {
      return Response.json(
        { error: `Månedlig grense nådd (${limit} analyser). Oppgrader for ubegrenset tilgang.` },
        { status: 429, headers: CORS },
      );
    }

    // ── Parse body ────────────────────────────────────────────────────────
    const body = await req.json();
    const { imageBase64, mediaType = 'image/jpeg' } = body as {
      imageBase64: string;
      mediaType?: string;
    };

    if (!imageBase64) {
      return Response.json({ error: 'Mangler bilde' }, { status: 400, headers: CORS });
    }

    // ── Call Anthropic API ─────────────────────────────────────────────────
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            {
              type:   'image',
              source: {
                type:       'base64',
                media_type: mediaType,
                data:       imageBase64,
              },
            },
            {
              type: 'text',
              text: `Du er ekspert på birøkt og varroaanalyse. Analyser dette bildet nøye.

Bildet viser sannsynligvis en klisterplate (klisterbrett/innleggsplate) fra under en bikube — varroa-midd er brune/rødbrune ovale prikker, ca 1–2 mm store. Noen ganger vises bier direkte.

Svar KUN med gyldig JSON (ingen forklaringstekst rundt):
{
  "count": <antall varroamitter du teller. Bruk -1 hvis bildet er uegnet eller for uklart>,
  "type": "sticky_board",
  "severity": "<none|low|medium|high>",
  "recommendation": "<norsk anbefaling, maks 110 tegn>",
  "confidence": "<high|medium|low>"
}

Alvorlighetsgrader for klisterplate (24-timers fall):
- "none":   0 mitter
- "low":    1–3 mitter/dag — overvåk
- "medium": 4–10 mitter/dag — behandling bør vurderes
- "high":   over 10 mitter/dag — behandling anbefales snart`,
            },
          ],
        }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errText);
      return Response.json({ error: 'AI-tjenesten er ikke tilgjengelig akkurat nå. Prøv igjen.' }, { status: 502, headers: CORS });
    }

    const aiData = await anthropicRes.json() as {
      content: Array<{ type: string; text: string }>;
    };

    const rawText  = aiData.content?.[0]?.text ?? '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return Response.json({ error: 'Kunne ikke tolke AI-svar. Prøv med et tydeligere bilde.' }, { status: 500, headers: CORS });
    }

    const result = JSON.parse(jsonMatch[0]) as {
      count:          number;
      type:           string;
      severity:       string;
      recommendation: string;
      confidence:     string;
    };

    // ── Log usage ─────────────────────────────────────────────────────────
    await adminSupabase
      .from('ai_analysis_usage')
      .insert({ user_id: user.id, analysis_type: 'varroa' });

    return Response.json({
      count:          result.count,
      type:           result.type,
      severity:       result.severity,
      recommendation: result.recommendation,
      confidence:     result.confidence,
      usageThisMonth: used + 1,
      monthlyLimit:   limit,
    }, { headers: CORS });

  } catch (err) {
    console.error('analyze-varroa error:', err);
    return Response.json({ error: 'Analyse feilet. Prøv igjen.' }, { status: 500, headers: CORS });
  }
});
