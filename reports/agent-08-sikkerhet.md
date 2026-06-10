# Agent 8 — Sikkerhet

## Metainfo
- **Filer lest:** `0001_initial_schema.sql`, `0008`, `0010`, `0011`, `0013`, `0015`, `0031`, `0032`, `0034`, `0035`, `0036`, `0037`, `0039`, `0040`, `0041`, `0042`, `0043`, `0044`, `0045`; `supabase/functions/{delete-account,revenuecat-webhook,analyze-varroa,weekly-hive-alerts}/index.ts`; `lib/supabase.ts`; `services/inspection.ts`.
- **Filer ikke funnet:** Migrasjon 0046 finnes ikke (høyeste er 0045). 0038 (ytelsesindekser) ikke sikkerhetskritisk.
- **Konfidensgrad:** Høy for SQL/Edge Functions. Middels for runtime-RLS (kunne ikke kjøre mot DB).

## Sammendrag
Sikkerhetsfiksene 0036/0037/0039/0040/0044/0045 er korrekt implementert. RLS er aktivert på alle tabeller. delete-account og signed-URL-flyt er solide. Hovedfunn: KRITISK — migrasjon 0035 har anon-JWT hardkodet inline og bekrefter tidligere secret-eksponering i git; HØY — revenuecat-webhook mangler timing-safe sammenligning og har idempotens-race; MEDIUM — hive_disease_flags mangler DELETE-policy, og inspection-media slettes ikke fra Storage ved enkeltsletting.

## Funn

**[KRITISK]** `supabase/migrations/0035_rotate_alerts_secret.sql:35` — Anon-JWT hardkodet inline i cron-jobben (committet til git). Kommentaren linje 2–6 bekrefter at en TIDLIGERE alerts-secret ble eksponert i git (0018). — Konsekvens: Anon-nøkkel spredt i migrasjoner gjør rotasjon vanskelig; gammel eksponert secret ligger fortsatt i git-historikk. — Løsning: Les apikey fra `app_config`/vault (slik x-alerts-secret allerede gjøres); verifiser i Supabase Dashboard at gammel secret faktisk er rotert.

**[HØY]** `supabase/functions/revenuecat-webhook/index.ts:38` — `authHeader?.trim() !== webhookSecret.trim()` bruker ikke-konstant-tid strengsammenligning. — Konsekvens: Teoretisk timing-angrep mot webhook-secret. — Løsning: Konstant-tid sammenligning (Uint8Array + timingSafeEqual); dropp `.trim()` som kan maskere konfig-feil.

**[HØY]** `supabase/functions/revenuecat-webhook/index.ts:72-101` — Idempotens-INSERT skjer FØR `profiles.update`. Hvis INSERT lykkes men update feiler (500 linje 103-106), er eventet markert «prosessert» og RevenueCat-retry ignoreres (linje 76-78) → tier-oppdatering tapt permanent. — Konsekvens: Kunde betaler men beholder starter-tier ved transient DB-feil. — Løsning: Skriv idempotens-rad ETTER vellykket update, eller gjør begge atomisk i én RPC.

**[MEDIUM]** `supabase/migrations/0001_initial_schema.sql:251-257` — `hive_disease_flags` har SELECT/INSERT/UPDATE men INGEN DELETE-policy. — Konsekvens: Brukere kan ikke slette egne sykdomsflagg (RLS blokkerer); GDPR-hull for egne helsedata. — Løsning: `CREATE POLICY ... FOR DELETE USING (exists (select 1 from hives h where h.id = hive_id and h.user_id = (select auth.uid())))`.

**[MEDIUM]** `services/inspection.ts:184-187` — `deleteInspectionMedia` sletter kun DB-raden, ikke filen i `inspection-media`-bucket. — Konsekvens: Foreldreløse bildefiler blir liggende i Storage (GDPR-residualdata; ryddes kun ved hel-konto-sletting). — Løsning: Hent `storage_path` først og kall `storage.from('inspection-media').remove([path])`.

**[MEDIUM]** `supabase/functions/analyze-varroa/index.ts:64-69,164-166` — Rate-limit-telling og usage-INSERT (service-role) er ikke atomisk. To samtidige requests kan begge passere `used < limit` før noen skriver usage (TOCTOU). — Konsekvens: Bruker kan overskride månedlig AI-kvote ved parallelle kall. — Løsning: Sett inn usage-rad først, eller transaksjonell RPC som teller+inserter.

**[LAV]** `supabase/functions/*/index.ts` — Alle funksjoner bruker `Access-Control-Allow-Origin: '*'`. Akseptabelt for native-app, men analyze-varroa (kostbart Anthropic-kall) bør vurdere origin-begrensning. — Konsekvens: Lav (auth kreves). — Løsning: Stram CORS hvis web-klient ikke planlegges.

**[LAV]** `supabase/migrations/0035_rotate_alerts_secret.sql:35` — apikey og x-alerts-secret sendes i cron HTTP-header; net.http_post-kall logges potensielt i pg-logger. — Konsekvens: Lav. — Løsning: Bekreft at pg_net ikke logger headers i klartekst.

### Verifiserte fikser (OK)
- **0037** — swarm_reports SELECT korrekt `TO authenticated` med `status='open' OR auth.uid()=user_id`. Andres resolved-rapporter skjult. 0040 gir DELETE til eier. **OK.**
- **0036** — inspection-media `public=false`; SELECT owner-verifisert via `(storage.foldername(name))[1]`; klient bruker `createSignedUrls` TTL 1t (`inspection.ts:176-181`). Samme mønster 0042/hive-photos. **OK.**
- **0044** — feed_likes FOR ALL-hull (enhver kunne slette andres likes) erstattet med eksplisitte select/insert/delete. **OK.**
- **0045/0043** — ai_analysis_usage: INSERT `auth.uid()=user_id`, DELETE blokkert (`USING(false)`) så kvote ikke nullstilles. **OK.**
- **0013** — DB-håndhevet 3-kube-grense for starter-tier i INSERT-policy (hindrer paywall-bypass). **OK.**
- **delete-account** — Rekursiv sletting av begge buckets under `user.id`, deretter `auth.admin.deleteUser` → ON DELETE CASCADE rydder alle tabellrader. Auth-header validert via `getUser`. **GDPR-komplett. OK.**
- **EXPO_PUBLIC-lekkasje** — Kun klient-eksponering-by-design-nøkler (anon, url, mapbox, sentry-dsn, revenuecat-android). Ingen service_role/webhook-secret med EXPO_PUBLIC-prefiks. **Ingen funn.**

## RLS-matrise (utvalg)
| Tabell | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | egne | trigger | egne | — (cascade) |
| hives | egne+team+samarbeid | egne+starter-grense | egne | egne |
| inspections | egne+samarbeid | egne | egne | egne |
| inspection_media | eier via insp | eier | — | eier |
| swarm_reports | innlogget: open/egne | egne | egne | egen (0040) |
| hive_disease_flags | egne | egne | egne | **MANGLER** |
| ai_analysis_usage | egne | egne (0045) | — | blokkert (0043) |
| feed_likes | innlogget | egne | — | egne (0044) |
| marketplace_listings | aktive (innlogget) | eier | eier | eier |
| revenuecat_processed_events | service_role | service_role | — | — |
| app_config | service_role | service_role | — | — |

## Topp-3 anbefalinger
1. **Fjern hardkodet anon-JWT i 0035 + bekreft secret-rotasjon** (KRITISK). Les apikey fra app_config/vault i cron-jobben; verifiser at gammel alerts-secret er rotert i Dashboard. ~45 min.
2. **Fiks revenuecat-webhook: idempotens-race + timing-safe compare** (HØY). Flytt idempotens-INSERT etter vellykket update; konstant-tid sammenligning. ~1 t.
3. **DELETE-policy på hive_disease_flags + slett Storage-fil i deleteInspectionMedia** (MEDIUM, GDPR). ~30 min samlet.
