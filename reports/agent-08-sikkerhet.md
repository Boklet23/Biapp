# Agent 8 — Sikkerhet og GDPR

## Metainfo
- **Filer lest:** `supabase/migrations/0001`, `0008`, `0010`, `0011`, `0015`, `0021`, `0022`, `0034`, `0035`, `0036`, `0037`, `0040`, `0041`, `0042`, `0043`, `0044`, `0045`, `0046`, `0047`, `0048`, `0049`, `0050`, `0051`; `supabase/functions/{delete-account,revenuecat-webhook,analyze-varroa,weekly-hive-alerts}/index.ts`; `lib/supabase.ts`, `services/{hive,feed}.ts`, `components/inspection/Step3.tsx`, `components/samfunn/ReportSwarmModal.tsx`, `app/(auth)/register.tsx`.
- **Filer ikke funnet:** Ingen (høyeste migrasjon = 0051).
- **Diff mot forrige review:** Lest. **Fikset siden sist:** (1) KRITISK paywall-bypass på `profiles` → fikset i **0047** (`REVOKE UPDATE` + kolonne-GRANT + `WITH CHECK`). (2) Webhook timing-angrep → fikset (`timingSafeEqual`, webhook/index.ts:22). (3) AI-transparens → fikset (`Step3.tsx:171`). (4) Svermkart-samtykke → fikset (`ReportSwarmModal.tsx:58`). (5) Personvernerklæring lenket (`register.tsx:185`). (6) 0050 fikset privilegie-eskalering i `hive_collaborators` + foreldreløs `count_active_hives_for_user`-RPC (0049). **PERSISTERER:** `hive_disease_flags` DELETE-policy mangler fortsatt; AI-kvote TOCTOU; 1-årig hive-photo signed URL; ingen dataeksport.

## Sammendrag (maks 80 ord)
Forrige rundes KRITISK (paywall-bypass) er solid lukket i 0047, og 0040–0045 + 0046–0051 er korrekt implementert. Ingen nye kritiske RLS-hull. Største gjenstående: `weekly-hive-alerts` feiler åpent hvis secret-env mangler (NY), `hive_disease_flags` kan fortsatt ikke slettes av bruker, AI-kvotetelling er ikke atomisk (kostnadsmisbruk), hive-foto deler 1-årig signed URL, og GDPR-dataeksport (art. 20) finnes ennå ikke. Alt er MEDIUM/LAV — lanseringsklart med disse på backlog.

## Fungerer godt (maks 5 punkter)
- **0047 paywall-lås:** `REVOKE UPDATE ON profiles FROM authenticated` + `GRANT UPDATE (display_name, experience_level, push_token, municipality_id)` + `WITH CHECK` — bruker kan ikke lenger self-oppgradere `subscription_tier`/`tier_locked`. KRITISK fra forrige runde er borte.
- **0050 kollaborasjon:** Tettet privilegie-eskalering (innskyter må eie kuben), gated e-postoppslag til Lag-tier, `SECURITY DEFINER` med `SET search_path`.
- **delete-account** GDPR-komplett: rekursiv sletting av begge buckets under `user.id`, deretter `auth.admin.deleteUser` → CASCADE rydder alle tabeller. Verifiserer eier via `getUser` — A kan ikke slette B.
- **Storage privat:** inspection-media (0036) og hive-photos (0042) `public=false` med eier-verifisert SELECT via `(storage.foldername(name))[1]`.
- **Webhook:** `timingSafeEqual`, idempotens i korrekt rekkefølge (INSERT etter UPDATE), `tier_locked`-respekt, ukjente event-typer ignoreres trygt (`return 200`).

## Funn

**[MEDIUM]** `supabase/functions/weekly-hive-alerts/index.ts:35-40` — Auth feiler åpent: `const alertsSecret = Deno.env.get('WEEKLY_ALERTS_SECRET'); if (alertsSecret) { if (req.headers.get('x-alerts-secret') !== alertsSecret) return 401; }`. Hvis env-varen er tom/usatt hoppes hele sjekken over og funksjonen er offentlig kallbar. — **Konsekvens:** Ved feilkonfig kan hvem som helst trigge push-utsending til alle brukere (spam/DoS via Expo-kvote). Fail-open er feil standard for en secret-gate. — **Løsning:** Fail-closed: `if (!alertsSecret || req.headers.get('x-alerts-secret') !== alertsSecret) return 401;`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `supabase/migrations/0001_initial_schema.sql:251-257` — `hive_disease_flags` har SELECT/INSERT/UPDATE, men INGEN DELETE-policy med RLS på (verifisert: ingen senere migrasjon legger til den). — **Konsekvens:** Brukere kan ikke slette egne sykdomsflagg; residual helsedata, ryddes kun ved hel-konto-sletting. [PERSISTERER fra forrige review.] — **Løsning:** `CREATE POLICY "disease_flags: slett egne" ON hive_disease_flags FOR DELETE USING (exists (select 1 from hives h where h.id = hive_id and h.user_id = (select auth.uid())));`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `supabase/functions/analyze-varroa/index.ts:72-79,172-174` — Kvotetelling (`count`) skjer før Anthropic-kallet, usage-INSERT først ETTER (linje 172). To samtidige requests passerer begge `used < limit` før noen rad skrives (TOCTOU), og en bruker betaler aldri for et mislykket parse (rad skrives ikke ved feil → gratis retry). — **Konsekvens:** Månedlig AI-kvote kan overskrides ved parallelle kall → kostnadsmisbruk av Anthropic-API. [PERSISTERER.] — **Løsning:** INSERT usage-rad FØR Anthropic-kallet (kompenser ved hard feil), eller transaksjonell RPC som teller+inserter atomisk. — Innsats: M — Konfidens: MEDIUM

**[MEDIUM]** GDPR-portabilitet (art. 20) — Ingen dataeksport finnes (Grep på `eksport`/`last ned mine` i app: kun `UpgradeModal` som lover «eksport» som premium-feature). «Slett konto» finnes, men portabilitet er en lovpålagt rett. — **Konsekvens:** Manglende art. 20-etterlevelse ved lansering. — **Løsning:** Edge Function som dumper alle brukerrader til JSON/CSV; eksponer gratis i profil. — Innsats: M — Konfidens: HØY

**[LAV]** `services/hive.ts:73-78` — `uploadHivePhoto` returnerer 1-årig signed URL (`createSignedUrl(fileName, 365*24*3600)`) lagret i `hives.photo_url`. — **Konsekvens:** Lekket URL (logg, backup, delt kube) gir bildetilgang i ett år uten auth, tross privat bucket. — **Løsning:** Lagre relativ sti, generer kort-levd signed URL on-demand (som inspection-media, 1t). — Innsats: M — Konfidens: HØY [PERSISTERER.]

**[LAV]** `services/feed.ts:48-56` + `0011_feed.sql:2-9` — `createPost` inserter `{ content, image_url }` uten `user_id`; `feed_posts.user_id` har ingen DEFAULT, og INSERT-policyen krever `with check (auth.uid() = user_id)`. Funksjonen ser ut til å feile/være ubrukt, men `image_url` peker uansett på en ekstern/udefinert kilde — ingen privat feed-bucket finnes, og delete-account dekker derfor ikke feed-bilder. — **Konsekvens:** Hvis feed aktiveres med bilder mangler Storage-rydding ved kontosletting. — **Løsning:** Avklar feed-bilde-lagring; hvis privat bucket innføres, legg den til i `delete-account`. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `supabase/migrations/0035_rotate_alerts_secret.sql:35` — Anon-JWT hardkodet inline i cron-jobben. Dette er anon *publishable* key (offentlig per design — samme verdi som `EXPO_PUBLIC_SUPABASE_ANON_KEY`), ikke en secret. `x-alerts-secret` leses korrekt fra `app_config`. Reell restrisiko: at den tidligere eksponerte 0018-secreten faktisk er rotert (kun verifiserbart i Dashboard). — **Konsekvens:** Lav. — **Løsning:** Bekreft rotasjon manuelt. — Innsats: S — Konfidens: MEDIUM

## RLS-matrise (alle tabeller 0001–0051)
| Tabell | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | egne | trigger | egne (0047: kolonne-låst+WITH CHECK) ✅ | — (cascade) |
| hives | egne+team+samarb | egne+trigger-grense (0046) | egne | egne |
| inspections | egne+samarb | egne | egne | egne |
| inspection_media | eier via insp | eier | — | eier |
| harvest_records | egne | egne | egne | egne |
| treatments | egne (ALL) | egne | egne | egne |
| hive_weights | egne (ALL) | egne | egne | egne |
| queens | egne (ALL) | egne | egne | egne |
| hive_collaborators | eier+samarb | eier+eier-av-kube (0050) ✅ | eier | eier |
| calendar_events | egne | egne | egne | egne |
| swarm_reports | innlogget: open/egne | egne | egne | egen (0040) |
| hive_disease_flags | egne | egne | egne | **MANGLER** |
| ai_analysis_usage | egne | egne (0045) | — | blokkert (0043) |
| feed_posts | innlogget | eier (ALL) | eier | eier |
| feed_likes | innlogget | egne (0044) | — | egne (0044) |
| marketplace_listings | aktive (innlogget) | eier (ALL) | eier | eier |
| diseases / municipalities / beekeeper_assoc / bee_associations / equipment_vendors | offentlig/innlogget les | — | — | — |
| revenuecat_processed_events | service_role (USING false) | service_role | — | — |
| app_config | service_role (USING false) | service_role | — | — |
| teams / team_members | medlem | eier/— | — | — |

## Topp-3 anbefalinger
1. **Fail-closed på weekly-hive-alerts** (MEDIUM) — `if (!alertsSecret || header !== alertsSecret) return 401`. Aldri offentlig kallbar push-trigger. Innsats: S.
2. **GDPR + helsedata-fikser** (MEDIUM) — gratis dataeksport (art. 20) + DELETE-policy på `hive_disease_flags`. Innsats: M samlet.
3. **AI-kostnadsmisbruk + bildelekkasje** (MEDIUM/LAV) — atomisk AI-kvote (INSERT før Anthropic-kall), kort-levd hive-photo signed URL on-demand. Innsats: ~3 t samlet.
