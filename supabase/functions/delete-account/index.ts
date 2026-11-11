import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function cleanStorageBucket(
  client: SupabaseClient,
  bucket: string,
  folder: string,
): Promise<void> {
  const PAGE_SIZE = 100;
  let offset = 0;
  const subFolders: string[] = [];

  while (true) {
    const { data: items, error: listError } = await client.storage
      .from(bucket)
      .list(folder, { limit: PAGE_SIZE, offset });
    if (listError) throw new Error(`list ${bucket}/${folder}: ${listError.message}`);
    if (!items?.length) break;

    const filePaths: string[] = [];
    for (const item of items) {
      const fullPath = `${folder}/${item.name}`;
      if (item.id) {
        filePaths.push(fullPath);
      } else {
        subFolders.push(fullPath);
      }
    }

    if (filePaths.length > 0) {
      const { error: removeError } = await client.storage.from(bucket).remove(filePaths);
      if (removeError) throw new Error(`remove ${bucket}: ${removeError.message}`);
    }

    if (items.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  await Promise.all(subFolders.map((sub) => cleanStorageBucket(client, bucket, sub)));
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
    authHeader.slice(7)
  );

  if (userError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Storage først, og ABORT hvis det feiler — en stille list/remove-feil ville
  // ellers latt bilder ligge igjen for alltid mens kontoen ble slettet (GDPR).
  // Brukeren finnes fortsatt, så klienten kan trygt prøve på nytt.
  try {
    await Promise.all([
      cleanStorageBucket(supabaseAdmin, 'hive-photos', user.id),
      cleanStorageBucket(supabaseAdmin, 'inspection-media', user.id),
    ]);
  } catch (err) {
    console.error('delete-account: storage-opprydding feilet:', err);
    return new Response(JSON.stringify({ error: 'Sletting feilet. Prøv igjen senere.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    // Detaljer kun i serverlogg — ikke rå DB-feil til klienten.
    console.error('delete-account: deleteUser feilet:', deleteError.message);
    return new Response(JSON.stringify({ error: 'Sletting feilet. Prøv igjen senere.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GDPR: be RevenueCat slette abonnentprofilen (kjøpshistorikk knyttet til
  // user.id). Best effort — kontoen er allerede slettet, svaret blokkeres ikke.
  // Krever REVENUECAT_SECRET_API_KEY i funksjonens secrets; no-op hvis usatt.
  const rcKey = Deno.env.get('REVENUECAT_SECRET_API_KEY');
  if (rcKey) {
    await fetch(`https://api.revenuecat.com/v1/subscribers/${user.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${rcKey}` },
    }).then((res) => {
      if (!res.ok) console.error('RevenueCat-sletting feilet:', res.status);
    }).catch((e) => console.error('RevenueCat-sletting feilet:', e));
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
