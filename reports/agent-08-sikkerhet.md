# Agent 8 — Sikkerhet og GDPR

## Metainfo
- **Filer lest:** `supabase/migrations/0001_initial_schema.sql`, `0010`, `0011`, `0013`, `0014`, `0015`, `0017`, `0031`, `0032`, `0034`, `0035`, `0036`, `0039`, `0040`, `0041`, `0042`, `0043`, `0044`, `0045`; `supabase/functions/{delete-account,revenuecat-webhook,analyze-varroa}/index.ts`; `lib/supabase.ts`, `hooks/useEffectiveTier.ts`, `services/{inspection,hive,profile,subscription,swarmReport}.ts`, `components/samfunn/{SwarmMap,ReportSwarmModal}.tsx`, `app/(auth)/register.tsx`, `app/(app)/profil.tsx`.
- **Filer ikke funnet:** Ingen (høyeste migrasjon = 0045, som forventet).
- **Diff mot forrige review:** Ja, lest. **Fikset siden sist:** webhook idempotens-race (INSERT skjer nå ETTER `profiles.update`, ikke før — den HØY-funnen er borte). 0040/0042/0043/0044/0045 bekreftet korrekt. Forrige «KRITISK» om hardkodet anon-JWT i 0035 nedjusteres: det er anon *publishable* key (offentlig per design) — ikke en secret. Nytt hovedfunn i år: paywall-bypass via `profiles`-UPDATE.

## Sammendrag (maks 80 ord)
Migrasjon 0040–0045 er korrekt implementert og forrige rundes webhook-race er fikset. Men det NESTE hullet er kritisk: `profiles`-UPDATE-policyen (0039) mangler `WITH CHECK` og kolonne-GRANT, så enhver innlogget bruker kan sette sin egen `subscription_tier` til `lag` og `tier_locked = true` direkte — full betalingsmur-bypass, permanent. RLS kan ikke begrense kolonner; klienten er ikke sikkerhetsgrensen. GDPR: ingen dataeksport og ingen opplysning om at inspeksjonsfoto sendes til Anthropic.

## Fungerer godt (maks 5 punkter)
- **delete-account** er GDPR-komplett: rekursiv sletting av begge Storage-buckets under `user.id`, deretter `auth.admin.deleteUser` → ON DELETE CASCADE rydder alle tabellrader. Validerer eier via `getUser(token)` — bruker A kan ikke slette B.
- **0044 feed_likes** + **0045/0043 ai_analysis_usage** + **0040 swarm delete** er presist skrevet (eksplisitte select/insert/delete, ingen `FOR ALL`-hull, DELETE blokkert på usage så kvote ikke nullstilles).
- **Storage privat:** inspection-media (0036) og hive-photos (0042) er `public=false` med eier-verifisert SELECT via `(storage.foldername(name))[1]`; klient bruker `createSignedUrls` TTL 1t for inspeksjon.
- **revenuecat-webhook idempotens** nå korrekt rekkefølge — transient DB-feil gir 500 og RevenueCat-retry, ikke permanent tap.
- **Ingen EXPO_PUBLIC-lekkasje:** kun anon/url/mapbox/sentry/revenuecat-android (alle klient-by-design). Ingen service_role eller webhook-secret eksponert.

## Funn

**[KRITISK]** `supabase/migrations/0039_rls_subselect_auth_uid.sql:9` — `CREATE POLICY "profiles: oppdater egne" ON profiles FOR UPDATE USING ((SELECT auth.uid()) = id);` — Ingen `WITH CHECK`, ingen kolonne-GRANT, ingen UPDATE-trigger (verifisert: kun `handle_new_user`/`set_trial_on_signup` som begge er BEFORE INSERT). PostgreSQL-RLS kan ikke begrense hvilke kolonner som oppdateres. — **Konsekvens:** Enhver innlogget bruker kan kjøre `supabase.from('profiles').update({ subscription_tier:'lag', tier_locked:true }).eq('id', minId)` og gi seg selv dyreste betalt-tier gratis og permanent. `tier_locked=true` hindrer attpåtil webhooken i å nedgradere (`subscription.ts:81`). Omgår også 3-kube-grensen (0013/0014 leser `profiles.subscription_tier`). Hele monetiseringen kan nulles ut med ett API-kall. — **Løsning:** Tilbakekall kolonne-UPDATE på `subscription_tier`/`tier_locked`/`trial_expires_at` fra `authenticated` (`REVOKE UPDATE (...) ON profiles FROM authenticated; GRANT UPDATE (display_name, experience_level, push_token) ON profiles TO authenticated;`), ELLER en BEFORE UPDATE-trigger som avviser endring av disse feltene for ikke-service_role. — Innsats: M — Konfidens: HØY

**[HØY]** `supabase/functions/revenuecat-webhook/index.ts:38` — `if (authHeader?.trim() !== webhookSecret.trim())` bruker ikke-konstant-tid strengsammenligning. — **Konsekvens:** Teoretisk timing-angrep mot webhook-secret; `.trim()` kan også maskere konfig-feil. — **Løsning:** Konstant-tid sammenligning (`crypto.timingSafeEqual` over `TextEncoder`-buffere av lik lengde). — Innsats: S — Konfidens: MEDIUM

**[MEDIUM]** `supabase/migrations/0001_initial_schema.sql:251-257` — `hive_disease_flags` har SELECT/INSERT/UPDATE-policy, men INGEN DELETE-policy med RLS på. — **Konsekvens:** Brukere kan ikke slette egne sykdomsflagg (RLS blokkerer); residual helsedata, GDPR-hull (slettes kun ved hel-konto-sletting). [PERSISTERER fra forrige review.] — **Løsning:** `CREATE POLICY ... FOR DELETE USING (exists (select 1 from hives h where h.id = hive_id and h.user_id = (select auth.uid())))`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `services/inspection.ts:184-187` — `deleteInspectionMedia` sletter kun DB-raden, ikke filen i `inspection-media`. — **Konsekvens:** Foreldreløse bildefiler ligger igjen i Storage (GDPR-residual; ryddes kun ved kontosletting). [PERSISTERER.] — **Løsning:** Hent `storage_path` først, kall `storage.from('inspection-media').remove([path])` før/etter DB-delete. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `supabase/functions/analyze-varroa/index.ts:64-69,164-166` — Kvotetelling (`count`) og usage-INSERT er ikke atomisk (service-role). To samtidige requests kan begge passere `used < limit` før noen skriver rad (TOCTOU). — **Konsekvens:** Bruker kan overskride månedlig AI-kvote ved parallelle kall → kostnadsmisbruk av Anthropic-API. [PERSISTERER.] — **Løsning:** Sett inn usage-rad FØR Anthropic-kallet (kompenser ved feil), eller transaksjonell RPC som teller+inserter. — Innsats: M — Konfidens: MEDIUM

**[MEDIUM]** GDPR-portabilitet (art. 20) — Ingen dataeksport finnes. `app/(app)/profil.tsx` har «Slett konto», men ingen «Last ned mine data». `UpgradeModal.tsx:52` lover «Full eksport (PDF/CSV)» som premium-funksjon — men portabilitet er en lovpålagt rett, ikke en betalt feature. — **Konsekvens:** Manglende art. 20-etterlevelse ved lansering. — **Løsning:** Edge Function som dumper alle brukerrader til JSON/CSV; eksponer gratis i profil. — Innsats: M — Konfidens: HØY

**[MEDIUM]** GDPR-transparens (art. 13/14) — `analyze-varroa` sender inspeksjonsfoto (`imageBase64`) til Anthropic (`index.ts:91-136`), men ingen UI/personvern-tekst opplyser at bilder behandles av en tredjeparts AI-tjeneste i USA. Grep i `components/inspection` ga ingen treff på «Anthropic»/«AI-tjeneste»/«sendes til». — **Konsekvens:** Manglende informasjon om tredjepartsoverføring; mulig art. 13/28-brudd (databehandleravtale). — **Løsning:** Opplysningstekst ved AI-analyse + dekning i personvernerklæringen (databehandler, overføringsgrunnlag). — Innsats: S — Konfidens: MEDIUM

**[LAV]** `services/hive.ts:74-78` — `uploadHivePhoto` returnerer en 1-årig signed URL (`createSignedUrl(fileName, 365*24*3600)`) som lagres i `hives.photo_url`. — **Konsekvens:** Lekker URL-en (logg, delt kube, backup) er bildet tilgjengelig i et år uten auth, tross privat bucket. — **Løsning:** Lagre relativ sti og generer kort-levd signed URL on-demand (som inspection-media gjør, 1t). — Innsats: M — Konfidens: HØY

**[LAV]** `components/samfunn/SwarmMap.tsx:61-66` + `ReportSwarmModal.tsx:47-53` — Svermrapport lagrer eksakt GPS-posisjon og valgfri kontaktinfo (telefon/e-post), synlig for ALLE innloggede via `swarm_reports` SELECT (0037). Ingen eksplisitt samtykketekst om at posisjon + kontakt blir offentlig for andre birøktere. — **Konsekvens:** Bruker kan dele hjemmeadresse-presis GPS uoppfordret. — **Løsning:** Kort samtykke-/synlighetsnotis i modalen («Posisjon og kontakt vises for andre birøktere»); vurder grovkornet posisjon. — Innsats: S — Konfidens: HØY

**[LAV]** `supabase/migrations/0035_rotate_alerts_secret.sql:35` — Anon-JWT hardkodet inline i cron-jobben. Dette er anon *publishable* key (offentlig per design — samme verdi som `EXPO_PUBLIC_SUPABASE_ANON_KEY`), så ikke en secret-lekkasje. Reell rest-risiko: at den TIDLIGERE eksponerte `weekly_alerts_secret` (0018) faktisk er rotert — kun verifiserbart i Dashboard, ikke i kode. `x-alerts-secret` leses korrekt fra `app_config`. — **Konsekvens:** Lav. — **Løsning:** Bekreft rotasjon manuelt i Supabase Dashboard. — Innsats: S — Konfidens: MEDIUM

## RLS-matrise (alle tabeller 0001–0045)
| Tabell | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | egne | trigger | egne (**KOLONNE-HULL**) | — (cascade) |
| hives | egne+team | egne+starter-grense | egne | egne |
| inspections | egne | egne | egne | egne |
| inspection_media | eier via insp | eier | — | eier |
| harvest_records | egne | egne | egne | egne |
| treatments | egne (ALL) | egne | egne | egne |
| hive_weights | egne (ALL) | egne | egne | egne |
| queens | egne (ALL) | egne | egne | egne |
| hive_collaborators | eier+samarb | eier | eier | eier |
| calendar_events | egne | egne | egne | egne |
| swarm_reports | innlogget: open/egne | egne | egne | egen (0040) |
| hive_disease_flags | egne | egne | egne | **MANGLER** |
| ai_analysis_usage | egne | egne (0045) | — | blokkert (0043) |
| feed_posts | innlogget | eier (ALL) | eier | eier |
| feed_likes | innlogget | egne | — | egne (0044) |
| marketplace_listings | aktive (innlogget) | eier (ALL) | eier | eier |
| diseases / municipalities / beekeeper_assoc / equipment_vendors | offentlig les | — | — | — |
| revenuecat_processed_events | service_role (USING false) | service_role | — | — |
| app_config | service_role (USING false) | service_role | — | — |
| teams / team_members | medlem | eier/—  | — | — |

## Topp-3 anbefalinger
1. **Steng paywall-bypass på `profiles`** (KRITISK) — `REVOKE UPDATE` på alle kolonner + `GRANT UPDATE (display_name, experience_level, push_token)` til `authenticated`, eller BEFORE UPDATE-trigger som låser `subscription_tier`/`tier_locked`/`trial_expires_at`. Test: prøv å self-update tier som vanlig bruker → skal feile. Innsats: M.
2. **GDPR-pakke før lansering** (MEDIUM) — gratis dataeksport (art. 20) + AI-transparenstekst (art. 13) + samtykke-/synlighetsnotis på svermkart. Innsats: M samlet.
3. **Småfikser** (HØY/MEDIUM) — timing-safe webhook-compare, DELETE-policy på `hive_disease_flags`, slett Storage-fil i `deleteInspectionMedia`, atomisk AI-kvote. Innsats: ~3 t samlet.
