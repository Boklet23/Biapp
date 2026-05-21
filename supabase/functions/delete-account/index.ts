import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function cleanStorageBucket(
  client: SupabaseClient,
  bucket: string,
  folder: string,
): Promise<void> {
  const { data: items } = await client.storage.from(bucket).list(folder);
  if (!items?.length) return;

  const filePaths: string[] = [];
  const subFolders: string[] = [];

  for (const item of items) {
    const fullPath = `${folder}/${item.name}`;
    if (item.id) {
      filePaths.push(fullPath);
    } else {
      subFolders.push(fullPath);
    }
  }

  if (filePaths.length > 0) {
    await client.storage.from(bucket).remove(filePaths);
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

  // Clean up storage files before deleting user (GDPR compliance)
  await Promise.all([
    cleanStorageBucket(supabaseAdmin, 'hive-photos', user.id),
    cleanStorageBucket(supabaseAdmin, 'inspection-media', user.id),
  ]);

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
