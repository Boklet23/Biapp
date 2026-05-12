/**
 * Laster opp sykdomsbilder til Supabase Storage og oppdaterer image_url i diseases-tabellen.
 *
 * Bruk:
 *   1. Legg bildene i assets/disease-images/ med filnavn = slug (f.eks. varroamidd.png)
 *   2. Legg til SUPABASE_SERVICE_ROLE_KEY i .env.local
 *   3. Kjør: node scripts/upload-disease-images.mjs
 *      eller:  node scripts/upload-disease-images.mjs --dry-run  (forhåndsvis uten å laste opp)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const IMAGE_DIR = join(ROOT, 'assets', 'disease-images');
const DRY_RUN = process.argv.includes('--dry-run');
const BUCKET = 'disease-images';

// Les .env.local
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) throw new Error('.env.local ikke funnet');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const VALID_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function getMimeType(ext) {
  return { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[ext] ?? 'image/jpeg';
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env['EXPO_PUBLIC_SUPABASE_URL'];
  const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!supabaseUrl) throw new Error('Mangler EXPO_PUBLIC_SUPABASE_URL i .env.local');
  if (!serviceKey) throw new Error('Mangler SUPABASE_SERVICE_ROLE_KEY i .env.local\nFinn den i: Supabase Dashboard → Project Settings → API → service_role key');

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  if (!existsSync(IMAGE_DIR)) {
    console.error(`Mappen finnes ikke: ${IMAGE_DIR}`);
    console.error('Opprett mappen og legg inn bilder med filnavn = slug (f.eks. varroamidd.png)');
    process.exit(1);
  }

  const files = readdirSync(IMAGE_DIR).filter(f => VALID_EXT.has(extname(f).toLowerCase()));

  if (files.length === 0) {
    console.log('Ingen bilder funnet i assets/disease-images/');
    console.log('Forventede filnavn: varroamidd.png, kalkyngel.png, ...');
    process.exit(0);
  }

  // Opprett bucket hvis det ikke finnes
  if (!DRY_RUN) {
    const { error: bucketError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (bucketError && !bucketError.message.includes('already exists')) {
      throw new Error(`Bucket-feil: ${bucketError.message}`);
    }
  }

  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Laster opp ${files.length} bilder til ${BUCKET}/...\n`);

  const results = [];

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const slug = basename(file, ext);
    const storagePath = `${slug}${ext}`;
    const localPath = join(IMAGE_DIR, file);

    if (DRY_RUN) {
      console.log(`  [dry-run] ${file} → ${BUCKET}/${storagePath}`);
      results.push({ slug, ok: true, dry: true });
      continue;
    }

    const fileData = readFileSync(localPath);

    // Last opp (upsert = erstatt hvis finnes)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileData, { contentType: getMimeType(ext), upsert: true });

    if (uploadError) {
      console.error(`  FEIL ${file}: ${uploadError.message}`);
      results.push({ slug, ok: false, error: uploadError.message });
      continue;
    }

    // Hent offentlig URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const imageUrl = urlData.publicUrl;

    // Oppdater diseases.image_url
    const { error: dbError } = await supabase
      .from('diseases')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('slug', slug);

    if (dbError) {
      console.error(`  FEIL db-oppdatering for ${slug}: ${dbError.message}`);
      results.push({ slug, ok: false, error: dbError.message });
    } else {
      console.log(`  ✓ ${slug} → ${imageUrl}`);
      results.push({ slug, ok: true, url: imageUrl });
    }
  }

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Ferdig: ${results.filter(r => r.ok).length}/${results.length} vellykket`);

  if (!DRY_RUN) {
    const failed = results.filter(r => !r.ok);
    if (failed.length > 0) {
      console.log('\nMislyktes:');
      failed.forEach(r => console.log(`  ${r.slug}: ${r.error}`));
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('\nFeil:', err.message);
  process.exit(1);
});
