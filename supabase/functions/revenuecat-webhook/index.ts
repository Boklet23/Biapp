import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// RevenueCat event types that affect subscription status.
// SUBSCRIBER_ALIAS is NOT a downgrade — it only links a new app_user_id to an
// existing subscriber and must never reset a paying user to starter.
const DOWNGRADE_EVENTS = new Set([
  'EXPIRATION',
  'BILLING_ISSUE',
]);

const UPGRADE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'TRANSFER',
]);

type SubscriptionTier = 'starter' | 'hobbyist' | 'profesjonell' | 'lag';

/** Constant-time string comparison to avoid leaking the secret via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function entitlementsToTier(entitlements: string[]): SubscriptionTier {
  if (entitlements.includes('lag'))          return 'lag';
  if (entitlements.includes('profesjonell')) return 'profesjonell';
  if (entitlements.includes('hobbyist'))     return 'hobbyist';
  return 'starter';
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify RevenueCat authorization header
  const authHeader = req.headers.get('Authorization');
  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!webhookSecret) {
    return new Response('Server misconfiguration', { status: 500 });
  }
  if (!authHeader || !timingSafeEqual(authHeader.trim(), webhookSecret.trim())) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const event = body.event as Record<string, unknown> | undefined;
  if (!event) return new Response('Missing event', { status: 400 });

  const eventId = event.id as string | undefined;
  const eventType = event.type as string;
  const appUserId = event.app_user_id as string; // this is the Supabase user ID
  const aliases = (event.aliases as string[]) ?? [];

  // Find the real Supabase UUID — app_user_id or first alias that looks like a UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const userId = [appUserId, ...aliases].find((id) => uuidPattern.test(id));

  if (!userId) {
    // Anonymous or unlinked user — nothing to sync
    return new Response('No linked user ID', { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Idempotency check — skip duplicate deliveries from RevenueCat retries.
  // We only READ here; the event is marked processed AFTER the tier update
  // succeeds, so a transient DB failure can be safely retried by RevenueCat
  // instead of being permanently swallowed as "already processed".
  if (eventId) {
    const { data: existing } = await supabase
      .from('revenuecat_processed_events')
      .select('event_id')
      .eq('event_id', eventId)
      .maybeSingle();
    if (existing) {
      return new Response('Already processed', { status: 200 });
    }
  }

  let tier: SubscriptionTier;

  if (DOWNGRADE_EVENTS.has(eventType)) {
    // On expiration/billing issue: downgrade to starter
    tier = 'starter';
  } else if (UPGRADE_EVENTS.has(eventType)) {
    // On purchase/renewal: read active entitlements from event
    const entitlements = Object.keys(
      (event.entitlement_ids as Record<string, unknown>) ?? {}
    );
    tier = entitlementsToTier(entitlements);
  } else {
    // CANCELLATION etc. — user still has access until period ends, keep current tier
    return new Response('Event ignored', { status: 200 });
  }

  // tier_locked = manuelt tildelt tier (f.eks. testere med lag-tilgang).
  // Webhooken skal aldri overstyre låste profiler — verken opp eller ned.
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', userId)
    .eq('tier_locked', false);

  if (error) {
    // Not marked processed — RevenueCat will retry this event.
    console.error('Failed to update tier:', error.message);
    return new Response('DB error', { status: 500 });
  }

  // Tier update succeeded — now mark the event processed so retries are ignored.
  // The update above is idempotent, so a rare concurrent duplicate is harmless.
  if (eventId) {
    await supabase
      .from('revenuecat_processed_events')
      .insert({ event_id: eventId });
  }

  console.log(`Updated user ${userId} to tier "${tier}" (event: ${eventType})`);
  return new Response('OK', { status: 200 });
});
