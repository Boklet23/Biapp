# Agent 12 — Databasearkitektur og backend

## Metainfo
- Filer lest: `0001_initial_schema.sql`, `0006_treatments.sql`, `0007_hive_weights.sql`, `0008_hive_collaborators.sql`, `0009_queens.sql`, `0012_latest_inspections_per_hive.sql`, `0016_weekly_alerts_cron.sql`, `0020_fix_hive_update_policy_recursion.sql`, `0027_hive_boxes_and_frames.sql`, `0028_hive_map_rpc.sql`, `0033_missing_indexes.sql`, `0034_tier_lock.sql`, `0038_performance_indexes.sql`, `0039_rls_subselect_auth_uid.sql`, `0041_revenuecat_processed_events.sql`, `0043_ai_usage_no_delete.sql`, `services/inspection.ts`, `services/hive.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `supabase/functions/revenuecat-webhook/index.ts`
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

---

## Sammendrag

Skjemaet er godt normalisert med UUID PKer, timestamptz datoer og konsistente FK-kaskader. RLS er aktivert overalt og optimalisert med `(SELECT auth.uid())`-mønsteret (0039). Kritiske hull: 14 `select('*')`-kall i services, weekly-alerts-funksjonen skalerer ikke til 10 000 brukere, `treated_at`/`weighed_at`/`introduced_at` er `date` ikke `timestamptz`, og `get_map_hives` mangler indeks for team-join-stien.

---

## Funn

### KRITISK

**[KRITISK]** `supabase/functions/weekly-hive-alerts/index.ts:67-82` — Alle aktive kuber lastes inn i minnet med `.in('user_id', userIds)`, deretter alle inspeksjoner med `.in('hive_id', hiveIds)`. Ved 10 000 brukere med gjennomsnittlig 5 kuber = 50 000 hive-IDer i én IN-klausul, etterfulgt av `LIMIT hiveIds.length * 10` (= 500 000 rader). PostgreSQL vil avvise IN-lister over ~65 000 elementer, og selv ved lavere tall vil minnet i Edge Function-prosessen sprenge grensen (128 MB standard).
- **Konsekvens:** Cron-kjøring feiler fullstendig når brukerbase vokser forbi ~2 000 aktive brukere med >3 kuber.
- **Løsning:** Erstatt med en enkelt SQL-spørring eller RPC som gjør all logikk server-side, alternativt behandle én side (f.eks. 500 brukere) per kjøring med cursor-paginering.

**[KRITISK]** `supabase/functions/weekly-hive-alerts/index.ts:82` — `.limit(hiveIds.length * 10)` er ikke en riktig paginering av siste inspeksjon per kube. Dersom en enkelt kube har svært mange inspeksjoner, kan andre kubers siste inspeksjon havne utenfor vinduet.
- **Konsekvens:** Noen kuber vurderes aldri, og varsler sendes aldri for dem — selv om siste inspeksjon er 60 dager gammel.
- **Løsning:** Bruk RPC `get_latest_inspections_per_hive` (som allerede finnes) og utvid den med user_id-parameter, eller bygg en DISTINCT ON-spørring i Edge Function-SQL.

---

### HØY

**[HØY]** `services/hive.ts:90` — `fetchHives()` bruker `.select('*')` som henter alle kolonner inkludert `notes` (fri tekst, potensielt stor) og fremtidige kolonner automatisk.
- **Konsekvens:** Overfører unødvendig data til klienten; brytende endringer ved nye kolonner er usynlige.
- **Løsning:** Eksplisitt kolonneliste: `select('id,name,type,bee_breed,location_lat,location_lng,location_name,is_active,photo_url,num_boxes,frames_per_box,created_at')`.

**[HØY]** `services/hive.ts:106` — `fetchHive(id)` bruker `.select('*')`. Samme problem som over, men for enkelt-oppslag.

**[HØY]** `services/inspection.ts:77` — `fetchInspection(id)` bruker `.select('*')`. Mapper mot `mapInspection` som allerede lister alle forventede felt eksplisitt — `select('*')` er ikke nødvendig og returnerer potensielt AI-felt som `varroa_ai_count`/`varroa_ai_recommendation` også for eldre rader.

**[HØY]** `services/treatment.ts:19,30` — To `select('*')` i behandlingsservice. `treatments`-tabellen inkluderer `notes`-feltet som kan inneholde lang fritekst.

**[HØY]** `supabase/functions/weekly-hive-alerts/index.ts:35-38` — `WEEKLY_ALERTS_SECRET`-sjekken er valgfri: dersom miljøvariabelen ikke er satt, kjøres funksjonen uten autentisering. `0016_weekly_alerts_cron.sql` sender heller ikke `x-alerts-secret`-headeren — cron-kallet går uten hemmelighet.
- **Konsekvens:** Funksjonen er ubeskyttet mot uautoriserte kall; enhver aktør kan trigge masseutsending av push-notifikasjoner.
- **Løsning:** Gjør sjekken obligatorisk (`if (!alertsSecret) return new Response('Misconfigured', { status: 500 })`), og send `x-alerts-secret` i cron-kallet via `pg_net`-headere.

**[HØY]** `supabase/migrations/0006_treatments.sql:9` — `treated_at date` (ikke `timestamptz`). Tilsvarende `weighed_at date` i `0007` og `introduced_at date` / `replaced_at date` i `0009_queens.sql`.
- **Konsekvens:** Dato-komparering på tvers av tidssoner er upålitelig. En behandling registrert som `2024-05-01` i UTC+2 kan tilsynelatende ha skjedd `2024-04-30` for serveren. `weekly-hive-alerts` sammenligner `inspected_at timestamptz` med `treated_at date` implisitt — blandingen er trygg i JS, men inkonsekvens i DB er villedende.
- **Løsning:** Migrere til `timestamptz` der tidszone-nøyaktighet er viktig (behandlinger, vekt-målinger). For dronning er `date` akseptabelt.

**[HØY]** `supabase/migrations/0028_hive_map_rpc.sql:38-48` — `get_map_hives()` gjør UNION ALL over tre stier. Team-stien joiner `team_members tm ON tm.user_id = h.user_id` uten dedikert indeks på `team_members(user_id)` — kun `unique(team_id, user_id)` eksisterer (B-tree på begge, men team_id er ledende kolonne).
- **Konsekvens:** Kart-lasting blir treg for brukere i store team.
- **Løsning:**
  ```sql
  CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
  ```

**[HØY]** `supabase/migrations/0001_initial_schema.sql:163-173` — `hive_disease_flags` mangler indeks på `disease_id`. Søk på sykdomsflagg per sykdom (f.eks. "alle kuber med amerikansk råte") vil gjøre full sekvensiell scan.
- **Løsning:**
  ```sql
  CREATE INDEX IF NOT EXISTS idx_disease_flags_disease_id ON hive_disease_flags(disease_id);
  ```

---

### MEDIUM

**[MEDIUM]** `services/diseases.ts:7,17`, `services/swarmReport.ts:45`, `services/harvest.ts:17`, `services/calendarEvent.ts:31`, `services/associations.ts:37,56`, `services/queen.ts:27`, `services/weight.ts:14`, `services/profile.ts:27` — Ytterligere 10 `select('*')`-kall i services. Disse utgjør unødvendig nettverkstraffic og skjuler hvilke felt applikasjonen faktisk er avhengig av.
- **Løsning:** Gå gjennom `mapX()`-funksjonen i hver service og eksplisitter kolonnevalg tilsvarende `inspection.ts`-mønsteret.

**[MEDIUM]** `supabase/functions/revenuecat-webhook/index.ts:72-79` — Idempotency-logikken er god (duplikatsjekk via unik event_id), men rekkefølgen er feil: `revenuecat_processed_events`-insert skjer _før_ `profiles.update()`. Dersom tier-oppdateringen feiler og funksjonen returnerer 500, vil RevenueCat prøve på nytt — men event_id er allerede lagret og event droppes permanent ved retry.
- **Konsekvens:** En forbigående DB-feil under tier-oppdatering fører til tapt betalingshendelse uten mulighet for automatisk gjenoppretting.
- **Løsning:** Flytt `processed_events`-insert til etter vellykket tier-oppdatering, eller bruk en SECURITY DEFINER RPC som gjør begge operasjoner atomisk i én transaksjon.

**[MEDIUM]** `supabase/migrations/0001_initial_schema.sql:191-199` — `swarm_reports` har kun indeks på `reported_at`. For geospatiale spørringer (finn svermer nær bruker) finnes det ingen PostGIS-indeks.
- **Konsekvens:** Avstandsfiltrering gjøres client-side eller med full tabellscan i SQL.
- **Løsning:** Vurder `CREATE EXTENSION postgis` og erstatt `lat/lng double precision` med `location geography(POINT,4326)` med `GIST`-indeks.

**[MEDIUM]** `supabase/migrations/0001_initial_schema.sql:45-53` — `profiles` mangler `updated_at`-kolonne. Tilsvarende mangler `hives` og `inspections` denne kolonnen.
- **Konsekvens:** Vanskeliggjør cache-invalidering, audit-logging og inkrementell sync.
- **Løsning:** Legg til `updated_at timestamptz DEFAULT now()` og en `moddatetime`-trigger på de sentrale tabellene.

**[MEDIUM]** `supabase/migrations/0001_initial_schema.sql:280-283` — `team_members`-policyen for SELECT er rekursiv: den sjekker `team_members tm2` inne i en policy på `team_members`. Dette er den samme rekursjonsrisikoen som ble reparert i 0020 for `hives`, og introduserer ytelseshull for team med mange medlemmer.
- **Løsning:** Bruk `(SELECT auth.uid())`-mønsteret fra 0039 og vurder en SECURITY DEFINER-funksjon tilsvarende `count_active_hives_for_user`.

---

### LAV

**[LAV]** `supabase/migrations/0016_weekly_alerts_cron.sql:10-16` — Hardkodet Supabase-prosjekt-URL i `pg_cron`-kallet. Ved prosjektmigrasjon eller URL-endring feiler cron-jobben stille.
- **Løsning:** Bruk `current_setting('app.settings.supabase_url')` eller definer URL som en `pg_net`-konfigurasjonsvariabel.

**[LAV]** `supabase/migrations/0001_initial_schema.sql:87-94` — `hives.location_lat` og `hives.location_lng` er `double precision` uten CHECK-constraints. Ugyldig input (`lat > 90`, `lng > 180`) aksepteres stille.
- **Løsning:**
  ```sql
  ALTER TABLE hives
    ADD CONSTRAINT chk_lat CHECK (location_lat BETWEEN -90 AND 90),
    ADD CONSTRAINT chk_lng CHECK (location_lng BETWEEN -180 AND 180);
  ```

**[LAV]** `services/inspection.ts:39,64` — `fetchInspections(hiveId)` har LIMIT 200, `fetchAllInspections()` har LIMIT 500. Ingen av disse er paginerte. En aktiv birøkter med 5+ år og hyppige inspeksjoner vil trykke mot limiten.
- **Løsning:** Innfør cursor-paginering (`inspected_at < cursor`-filter) eller `range()`-paginering via Supabase.

**[LAV]** `supabase/migrations/0041_revenuecat_processed_events.sql:3` — `revenuecat_processed_events` mangler TTL/cleanup-policy. Tabellen vokser ubegrenset med alle historiske event-IDer.
- **Løsning:** Legg til en `pg_cron`-jobb: `DELETE FROM revenuecat_processed_events WHERE processed_at < NOW() - INTERVAL '90 days'`.

---

## Topp-3 anbefalinger

1. **Refaktorér `weekly-hive-alerts` til server-side SQL** — Funksjonen henter alle kuber og inspeksjoner i Edge Function-minnet og vil feile hardt ved vekst forbi ~2 000 aktive brukere. Flytt logikken til en enkelt RPC/SQL-spørring som returnerer ferdige push-meldinger, og behandle brukere i sider på 500 om gangen med cursor-paginering. Dette er den eneste endringen som hindrer en hard produksjonsfeil ved organisk vekst.

2. **Erstatt alle `select('*')` med eksplisitte kolonner** — 14 steder i `services/` bruker wildcard-select. Prioriter `hive.ts:90`, `hive.ts:106`, og `treatment.ts` som henter de største tabellene. En sesjon med søk-og-erstatt basert på kolonnelister fra de tilsvarende `mapX()`-funksjonene gir umiddelbar nettverksbesparelse og gjør API-kontrakten eksplisitt og stabil mot fremtidige skjemaendringer.

3. **Fiks idempotency-rekkefølgen i `revenuecat-webhook`** — Flytt `INSERT INTO revenuecat_processed_events` til _etter_ at `profiles.update()` lykkes, slik at en forbigående DB-feil ikke permanent dropper en betalingshendelse. Den sikreste løsningen er en SECURITY DEFINER RPC som utfører begge operasjoner i én PostgreSQL-transaksjon, slik at de enten begge lykkes eller begge rulles tilbake.
