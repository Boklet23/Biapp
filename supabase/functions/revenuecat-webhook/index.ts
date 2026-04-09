import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// RevenueCat event types that affect subscription status
const DOWNGRADE_EVENTS = new Set([
  'EXPIRATION',
  'BILLING_ISSUE',
  'SUBSCRIBER_ALIAS',
]);

const UPGRADE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'TRANSFER',
]);

type SubscriptionTier = 'starter' | 'hobbyist' | 'profesjonell' | 'lag';

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
  if (webhookSecret && authHeader !== webhookSecret) {
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

  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update tier:', error.message);
    return new Response('DB error', { status: 500 });
  }

  console.log(`Updated user ${userId} to tier "${tier}" (event: ${eventType})`);
  return new Response('OK', { status: 200 });
});
