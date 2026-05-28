# Agent 8 — Sikkerhet og GDPR

## Metainfo

- **Filer lest:** `0001_initial_schema.sql`, `0002_calendar_events_and_swarm_contact.sql`, `0003_harvest_records.sql`, `0006_treatments.sql`, `0007_hive_weights.sql`, `0008_hive_collaborators.sql`, `0009_queens.sql`, `0010_marketplace.sql`, `0011_feed.sql`, `0015_inspection_ai_fields.sql`, `0016_weekly_alerts_cron.sql`, `0018_weekly_alerts_secret.sql`, `0031_inspection_media_bucket.sql`, `0032_hive_photos_bucket.sql`, `0034_tier_lock.sql`, `0035_rotate_alerts_secret.sql`, `0036_inspection_media_private.sql`, `0037_swarm_reports_auth_required.sql`, `0039_rls_subselect_auth_uid.sql`, `0040_swarm_reports_delete_policy.sql`, `0041_revenuecat_processed_events.sql`, `0042_hive_photos_private.sql`, `0043_ai_usage_no_delete.sql`, `supabase/functions/delete-account/index.ts`, `supabase/functions/revenuecat-webhook/index.ts`, `lib/supabase.ts`, `.env.example`
- **Filer ikke funnet:** ingen (alle navngitte filer eksisterer)
- **Konfidensgrad:** HØY (alle migrasjoner lest, RLS-matrise komplett)

---

## Sammendrag

BiVokter har et solid sikkerhetsgrunnlag: RLS er aktivert på alle tabeller, inspection-media og hive-photos er nå private buckets, og RevenueCat-webhook har idempotency-beskyttelse. Tre kritiske problemer gjenstår: et eksponert alerts-secret i git-historikk (0018), `ai_analysis_usage` mangler INSERT-policy slik at rate-limit kan omgås, og `feed_likes` DELETE-policy tillater alle autentiserte brukere å slette andres likes. EXPO_PUBLIC-bruk er korrekt for anon-key og Mapbox — ingen private hemmeligheter er eksponert i klientkoden.

---

## Funn

### [KRITISK] `supabase/migrations/0018_weekly_alerts_secret.sql:20` — Hardkodet alerts-secret i git

**Problem:** Secret `6d6a5787d3b8afd928056df7246e25e430dccifcb2c795163a281f6265321342e` er hardkodet i klartekst i en SQL-migrasjon som er committet til git-historikken.

**Konsekvens:** Alle med lesetilgang til repoet kan kalle `weekly-hive-alerts` Edge Function uten begrensning og trigge push-varsler til alle brukere i bulk. Secreten er heller ikke rotert bare ved å lage 0035 — den må eksplisitt endres i Supabase Dashboard.

**Løsning:** (1) Verifiser at `WEEKLY_ALERTS_SECRET` er rotert til en ny verdi i Supabase Dashboard under `Functions → weekly-hive-alerts → Secrets`. (2) Fjern secreten fra git-historikken med `git filter-repo` eller be GitHub Support aktivere Secret Scanning-varsling og rydde historikken.

---

### [HØY] `supabase/migrations/0015_inspection_ai_fields.sql:20-22` — `ai_analysis_usage` mangler INSERT-policy

**Problem:** Tabellen har kun en `FOR SELECT`-policy. Det finnes ingen `FOR INSERT`-policy, som betyr at ingen authenticated bruker kan inserte rader via klienten (INSERT blokkeres av RLS-default-deny).

**Konsekvens:** Klienten kan ikke registrere AI-bruk, noe som gjør hele rate-limit-systemet ikke-funksjonelt fra klientsiden. Dersom registreringen skjer via Edge Function med service_role omgår den RLS, men en angriper som kaller API-et direkte vil ikke få sine forbruksrader registrert og kan bruke ubegrenset AI.

**Løsning:**
```sql
CREATE POLICY "ai_usage: insert egne"
  ON ai_analysis_usage FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);
```

---

### [HØY] `supabase/migrations/0011_feed.sql:37-40` — `feed_likes` DELETE-policy tillater alle autentiserte brukere å slette andres likes

**Problem:** `feed_likes_all`-policyen er definert som `FOR ALL USING (auth.uid() is not null) WITH CHECK (auth.uid() = user_id)`. `USING`-klausulen gjelder SELECT og DELETE, mens `WITH CHECK` kun gjelder INSERT/UPDATE. DELETE-operasjoner sjekker kun `USING`, som er `auth.uid() is not null` — altså enhver innlogget bruker.

**Konsekvens:** Bruker A kan slette bruker B sin like. Dette muliggjør manipulasjon av feed-statistikk og innholds-moderering utenom eierens kontroll.

**Løsning:**
```sql
DROP POLICY "feed_likes_all" ON feed_likes;
CREATE POLICY "feed_likes_read" ON feed_likes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "feed_likes_insert" ON feed_likes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "feed_likes_delete" ON feed_likes FOR DELETE USING ((SELECT auth.uid()) = user_id);
```

---

### [HØY] `supabase/functions/delete-account/index.ts:8` — Storage-sletting mangler paginering (GDPR Art. 17)

**Problem:** `cleanStorageBucket` kaller `client.storage.from(bucket).list(folder)` uten `limit`/`offset`. Supabase Storage returnerer maks 100 objekter per kall som standard.

**Konsekvens:** Brukere med mer enn 100 bilder i én mappe vil ikke få alle filer slettet ved kontoavslutning. Rester av persondata i Storage bryter med GDPR Art. 17 (rett til sletting/glemme-retten).

**Løsning:** Legg til paginerings-loop i `cleanStorageBucket`:
```typescript
const { data: items } = await client.storage.from(bucket).list(folder, { limit: 1000, offset: 0 });
```
Alternativt: iterer med offset til `items.length < limit`.

---

### [MEDIUM] `supabase/migrations/0031_inspection_media_bucket.sql:5-11` — Bucket opprettet som public med åpen SELECT (rettet i 0036)

**Problem:** `inspection-media`-bucketen ble opprettet med `public = true` og åpen SELECT-policy uten auth-krav. Rettet i 0036, men bilder lastet opp mellom 0031 og 0036 var offentlig tilgjengelige.

**Konsekvens (GDPR):** Inspeksjonsbilder kan inneholde GPS-metadata (EXIF) og sensitiv informasjon om brukerens birøktvirksomhet. Tilsvarende gjaldt `hive-photos` mellom 0032 og 0042.

**Løsning (reaktivt):** Vurder om historisk eksponering utgjør et databrudd som krever varsling til Datatilsynet (GDPR Art. 33, 72-timers frist). Dokumenter vurderingen.

---

### [MEDIUM] `supabase/functions/revenuecat-webhook/index.ts:38` — String-sammenligning for webhook-secret (timing-angrep)

**Problem:** `authHeader?.trim() !== webhookSecret.trim()` bruker JavaScript-strengsammenligning som ikke er constant-time.

**Konsekvens:** Timing-angrep er teoretisk mulig. Praktisk risiko er lav i Deno-miljø der nettverkslatens dominerer, men OWASP anbefaler alltid constant-time sammenligning for hemmeligheter.

**Løsning:**
```typescript
const encoder = new TextEncoder();
const a = encoder.encode(authHeader?.trim() ?? '');
const b = encoder.encode(webhookSecret.trim());
if (a.length !== b.length || !crypto.subtle.timingSafeEqual(a, b)) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

### [MEDIUM] `supabase/migrations/0001_initial_schema.sql:207-210` — `profiles` mangler eksplisitt INSERT-policy

**Problem:** Profiler opprettes via `handle_new_user()`-triggeren (SECURITY DEFINER), men det finnes ingen eksplisitt INSERT RLS-policy. Triggeren omgår RLS, men intensjonen er ikke dokumentert i skjemaet.

**Konsekvens:** Lav direkte risiko. Hvis triggeren deaktiveres, vil authenticated-brukere potensielt kunne opprette vilkårlige profil-rader.

**Løsning:**
```sql
CREATE POLICY "profiles: kun via trigger"
  ON profiles FOR INSERT WITH CHECK (false);
```

---

### [MEDIUM] `supabase/migrations/0001_initial_schema.sql:274-282` — `teams` og `team_members` mangler UPDATE/DELETE-policyer

**Problem:** `teams`-tabellen har kun SELECT og INSERT. `team_members` har kun SELECT. Det finnes ingen policyer for å oppdatere teamets navn, legge til/fjerne medlemmer, eller slette et team via klienten.

**Konsekvens:** Team-eiere kan ikke administrere teamet sitt via klient-API-et. Funksjonaliteten fungerer kun via service_role (admin-konsollet). Siden CLAUDE.md bekrefter at team-UI ikke er implementert ennå, er dette akseptabelt inntil videre, men bør adresseres før team-funksjonalitet lanseres.

**Løsning:** Legg til policyer for team-eier ved lansering av team-UI.

---

### [LAV] `supabase/migrations/0001_initial_schema.sql:251-257` — `hive_disease_flags` mangler DELETE-policy

**Problem:** `hive_disease_flags` har SELECT, INSERT, og UPDATE, men ingen DELETE-policy.

**Konsekvens:** Brukere kan ikke slette egne sykdomsflagg via klienten. Funksjonell begrensning, men ikke en sikkerhetsrisiko.

**Løsning:**
```sql
CREATE POLICY "disease_flags: slett egne" ON hive_disease_flags FOR DELETE
  USING (exists (select 1 from hives h where h.id = hive_id and h.user_id = (SELECT auth.uid())));
```

---

### [LAV] `services/subscription.ts:12` og `lib/supabase.ts:4-5` — EXPO_PUBLIC-bruk er korrekt

`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_MAPBOX_TOKEN`, og `EXPO_PUBLIC_SENTRY_DSN` er alle designet for klienteksponering. Ingen private hemmeligheter (service_role-nøkkel, RevenueCat-secret-key) er eksponert med EXPO_PUBLIC-prefiks. **Ingen funn.**

---

## RLS-matrise

| Tabell | RLS | SELECT | INSERT | UPDATE | DELETE |
|--------|-----|--------|--------|--------|--------|
| `profiles` | ✅ | ✅ egne | ⚠️ kun via trigger | ✅ egne | — |
| `hives` | ✅ | ✅ egne+team+samarbeid | ✅ egne | ✅ egne | ✅ egne |
| `inspections` | ✅ | ✅ egne+samarbeid | ✅ egne | ✅ egne | ✅ egne |
| `inspection_media` | ✅ | ✅ via inspections | ✅ via inspections | — | ✅ via inspections |
| `calendar_events` | ✅ | ✅ egne | ✅ egne | ✅ egne | ✅ egne |
| `harvest_records` | ✅ | ✅ egne | ✅ egne | ✅ egne | ✅ egne |
| `treatments` | ✅ | ✅ egne | ✅ egne | ✅ egne | ✅ egne |
| `hive_weights` | ✅ | ✅ egne | ✅ egne | ✅ egne | ✅ egne |
| `queens` | ✅ | ✅ egne | ✅ egne | ✅ egne | ✅ egne |
| `swarm_reports` | ✅ | ✅ auth+eier (0037) | ✅ egne | ✅ egne | ✅ egne (0040) |
| `hive_disease_flags` | ✅ | ✅ via hives | ✅ via hives | ✅ via hives | ❌ MANGLER |
| `hive_collaborators` | ✅ | ✅ eier+samarbeidspart. | ✅ eier | ✅ eier | ✅ eier |
| `teams` | ✅ | ✅ via team_members | ✅ eier | ❌ MANGLER | ❌ MANGLER |
| `team_members` | ✅ | ✅ eget team | ❌ MANGLER | ❌ MANGLER | ❌ MANGLER |
| `marketplace_listings` | ✅ | ✅ aktive (auth) | ✅ egne | ✅ egne | ✅ egne |
| `feed_posts` | ✅ | ✅ auth | ✅ egne | ✅ egne | ✅ egne |
| `feed_likes` | ✅ | ✅ auth | ✅ egne | — | ❌ FEIL: alle auth |
| `ai_analysis_usage` | ✅ | ✅ egne | ❌ MANGLER | — | ✅ blokkert (0043) |
| `app_config` | ✅ | ✅ blokkert | — | — | — |
| `revenuecat_processed_events` | ✅ | ✅ blokkert | — | — | — |
| `diseases` | ✅ | ✅ alle | — | — | — |
| `municipalities` | ✅ | ✅ alle | — | — | — |
| `beekeeper_associations` | ✅ | ✅ alle | — | — | — |

---

## Topp-3 anbefalinger

1. **Rens git-historikken for alerts-secret fra `0018_weekly_alerts_secret.sql:20` og verifiser rotasjon.** Bruk `git filter-repo` for å fjerne secreten permanent fra historikken. Bekreft at den nye verdien er satt i Supabase Dashboard. Dette er eneste kritiske funn med ekstern eksponeringsrisiko.

2. **Legg til INSERT-policy på `ai_analysis_usage` og fiks `feed_likes` DELETE-policy.** Uten INSERT-policy er rate-limit-systemet ikke-funksjonelt fra klientsiden. `feed_likes` DELETE-feilen lar alle brukere slette andres likes — begge fixes er enkle SQL-endringer i ny migrasjon.

3. **Legg til paginering i `delete-account` Storage-cleanup (GDPR Art. 17).** Brukere med >100 bilder vil ikke få komplett sletting ved kontoavslutning. Dette er en konkret GDPR-forpliktelse som bør løses før lansering med reelle brukerdata.
