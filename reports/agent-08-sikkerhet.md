# Agent 8 — Sikkerhet og GDPR

## Metainfo
- **Dato:** 2026-06-22 (review v3)
- **Filer lest:** `supabase/migrations/0001`, `0032`, `0042`, `0045`, `0049`, `0052`; `supabase/functions/{delete-account,revenuecat-webhook,analyze-varroa,weekly-hive-alerts}/index.ts`; `lib/supabase.ts`, `services/hive.ts`. Grep: `create table`, `for delete`, `ENABLE ROW LEVEL SECURITY`, `EXPO_PUBLIC_`, `service_role`, `createSignedUrl`, `eksport`, `hive_disease_flags` over migrasjoner/app.
- **Filer ikke funnet:** Ingen (høyeste migrasjon = 0052).
- **Diff mot 2026-06-18:** Lest. **VERIFISERT FIKSET:** (1) `weekly-hive-alerts` er nå FAIL-CLOSED — `if (!alertsSecret || req.headers.get('x-alerts-secret') !== alertsSecret) return 401` (index.ts:38-41). Solid. (2) 0052 droppet utdatert 0013-INSERT-policy; ny policy er ren `WITH CHECK (auth.uid() = user_id)`, kubegrensen håndheves av trigger (0046). Korrekt. (3) 0047 paywall-lås på `profiles` står fortsatt (ikke regressert). Ingen [REGRESJON] funnet.
- **PERSISTERER (uendret siden 18. juni):** `hive_disease_flags` mangler DELETE-policy; AI-kvote TOCTOU; 1-årig hive-photo signed URL; ingen GDPR-dataeksport.

## Sammendrag (maks 80 ord)
De to fiksene fra forrige runde (fail-closed weekly-alerts, 0052 policy-rydding) er verifisert korrekte — ingen regresjon. Ingen nye KRITISKE/HØY-hull. Største gjenstående er uendret: `hive_disease_flags` kan ikke slettes av bruker (residual helsedata), AI-kvotetelling er ikke atomisk (kostnadsmisbruk ved parallelle kall), hive-foto deler 1-årig signed URL, og GDPR-dataeksport (art. 20) mangler fortsatt. Ett nytt LAV-funn: `media_type` videresendes uvalidert til Anthropic. Lanseringsklart med disse på backlog.

## Fungerer godt (maks 5 punkter)
- **weekly-hive-alerts fail-closed** (index.ts:38-41): mangler secret-env ELLER feil header → 401. Tidligere fail-open er borte.
- **0052 policy-rydding**: utdatert 0013-policy droppet; `WITH CHECK (auth.uid() = user_id)` + trigger som eneste grensehåndhever — trial-brukere på kube #4 fungerer, ingen self-INSERT av annens rad.
- **delete-account**: rekursiv sletting av begge buckets (`hive-photos`, `inspection-media`) under `user.id`, så `auth.admin.deleteUser` → CASCADE rydder alle tabeller. Eierverifisert via `getUser(token)` — A kan ikke slette B.
- **revenuecat-webhook**: `timingSafeEqual` konstant-tid, idempotens i riktig rekkefølge (INSERT etter vellykket UPDATE → trygg retry), `tier_locked=false`-guard, ukjente/CANCELLATION-events → 200 uten endring.
- **Storage privat**: 0042 setter `hive-photos public=false` + eierverifisert SELECT; inspection-media (0036) tilsvarende. service_role brukes kun i Edge Functions, aldri i klient.

## Funn

**[MEDIUM]** `supabase/migrations/0001_initial_schema.sql:251-257` — `hive_disease_flags` har RLS på med SELECT/INSERT/UPDATE, men INGEN DELETE-policy (verifisert: ingen migrasjon 0002–0052 legger til den). — **Konsekvens:** Bruker kan aldri slette egne sykdomsflagg; residual helsedata ryddes kun ved hel-konto-sletting (CASCADE). [PERSISTERER.] — **Løsning:** `CREATE POLICY "disease_flags: slett egne" ON hive_disease_flags FOR DELETE USING (exists (select 1 from hives h where h.id = hive_id and h.user_id = (select auth.uid())));`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `supabase/functions/analyze-varroa/index.ts:72-85,172-174` — Kvotetelling (`count`) skjer FØR Anthropic-kallet, usage-INSERT først ETTER (linje 172), og bare ved vellykket JSON-parse. To samtidige requests passerer begge `used < limit` før noen rad skrives (TOCTOU); mislykket parse/feil → ingen rad → gratis retry. — **Konsekvens:** Månedlig AI-kvote kan overskrides ved parallelle kall → kostnadsmisbruk av Anthropic-API. [PERSISTERER.] — **Løsning:** INSERT usage-rad FØR Anthropic-kallet (kompenser/slett ved hard feil), eller atomisk RPC som teller+inserter i én transaksjon. — Innsats: M — Konfidens: MEDIUM

**[MEDIUM]** GDPR-portabilitet (art. 20) — Ingen dataeksport finnes (Grep `eksport`/`last ned mine` traff kun `export const`-deklarasjoner + `UpgradeModal` som lover «eksport» som premium-feature). «Slett konto» (art. 17) er på plass, men portabilitet er en separat lovpålagt rett. — **Konsekvens:** Manglende art. 20-etterlevelse ved lansering. — **Løsning:** Edge Function som dumper alle brukerrader (hives, inspections, treatments, weights, queens, harvest, calendar, disease_flags, swarm_reports) til JSON; eksponer gratis i profil. — Innsats: M — Konfidens: HØY

**[LAV]** `services/hive.ts:73-78` — `uploadHivePhoto` returnerer 1-årig signed URL (`createSignedUrl(fileName, 365*24*3600)`) lagret i `hives.photo_url`. — **Konsekvens:** Lekket URL (logg, DB-backup, delt kube) gir bildetilgang i ett år uten auth, tross privat bucket. — **Løsning:** Lagre relativ sti i `photo_url`, generer kort-levd signed URL on-demand (som inspection-media). — Innsats: M — Konfidens: HØY [PERSISTERER.]

**[LAV]** `supabase/functions/analyze-varroa/index.ts:89,114-118` — `mediaType` fra request-body videresendes uvalidert til Anthropic som `media_type` (`const { imageBase64, mediaType = 'image/jpeg' } = body`). — **Konsekvens:** Lav — Anthropic validerer selv (gyldige verdier: image/jpeg|png|gif|webp), worst case 400/502. Ingen injeksjon mot egen DB. — **Løsning:** Whitelist: `const mt = ['image/jpeg','image/png','image/webp'].includes(mediaType) ? mediaType : 'image/jpeg'`. — Innsats: S — Konfidens: HØY

**[LAV]** `supabase/functions/analyze-varroa/index.ts` (hele) — Persondata-transparens: bilde sendes til Anthropic (tredjeparts AI/USA-overføring). Step3.tsx ble flagget transparent forrige runde; bekreft at personvernerklæringen nevner Anthropic som databehandler og overføring utenfor EØS. — **Konsekvens:** GDPR art. 13/28/44 hvis udokumentert. — **Løsning:** Verifiser personvernerklæring-tekst. — Innsats: S — Konfidens: MEDIUM

## RLS-matrise (alle tabeller 0001–0052)
| Tabell | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | egne | trigger | egne (0047 kolonne-låst+WITH CHECK) ✅ | — (cascade) |
| hives | egne+team+samarb | egne (0052 ren WITH CHECK) ✅ | egne | egne |
| inspections | egne+samarb | egne | egne | egne |
| inspection_media | eier via insp | eier | — | eier |
| harvest_records | egne | egne | egne | egne |
| treatments | egne (ALL) | egne | egne | egne |
| hive_weights | egne (ALL) | egne | egne | egne |
| queens | egne (ALL) | egne | egne | egne |
| hive_collaborators | eier+samarb | eier-av-kube (0050) ✅ | eier | eier |
| calendar_events | egne | egne | egne | egne |
| swarm_reports | innlogget: open/egne | egne | egne | egne (0040) |
| hive_disease_flags | egne | egne | egne | **MANGLER** ❌ |
| ai_analysis_usage | egne | egne (0045) | — | blokkert (0043) |
| feed_posts | innlogget | eier | eier | eier |
| feed_likes | innlogget | egne (0044) | — | egne (0044) |
| marketplace_listings | aktive | eier | eier | eier |
| diseases/municipalities/beekeeper_assoc/bee_associations/equipment_vendors | offentlig les | — | — | — |
| revenuecat_processed_events | service_role (USING false) | service_role | — | — |
| app_config | service_role (USING false) | service_role | — | — |
| teams/team_members | medlem | eier/— | — | — |

## Topp-3 anbefalinger
1. **GDPR + helsedata** (MEDIUM) — gratis dataeksport (art. 20) + DELETE-policy på `hive_disease_flags`. Begge lovpålagte/forventede før lansering. Innsats: M samlet.
2. **AI-kostnadsmisbruk** (MEDIUM) — atomisk AI-kvote: INSERT usage-rad FØR Anthropic-kallet, eller transaksjonell RPC. Hindrer parallell-overskridelse. Innsats: M.
3. **Bildelekkasje + input** (LAV) — kort-levd hive-photo signed URL on-demand; whitelist `mediaType` i analyze-varroa. Innsats: ~2 t samlet.
