# Agent 12 — Database

## Metainfo
- **Filer lest**: `0001_initial_schema.sql`, `0002`, `0003`, `0008`, `0012`, `0015`, `0016`, `0017`, `0020`, `0027`, `0028`, `0033`, `0034`, `0035`, `0037`, `0038`, `0039`, `0040`, `0041`, `services/inspection.ts`, `services/hive.ts`, `functions/weekly-hive-alerts/index.ts`, `functions/revenuecat-webhook/index.ts`. Grep: `.select('*')` + `Promise.all` i `services/`.
- **Filer ikke funnet**: 0028 het `get_map_hives` (ikke `get_hive_map_data`). Migrasjon 0046 finnes ikke (siste er 0045).
- **Konfidensgrad**: Høy for skjema/indeks/RPC/Edge Functions. Middels for runtime-volum (kunne ikke kjøre EXPLAIN mot live-DB).

## Sammendrag
Skjemaet er solid normalisert med konsekvent `timestamptz`, FK med `on delete cascade`, og god RLS-dekning (0039 optimaliserte til `(SELECT auth.uid())`). Indeksstrategien er nesten komplett. Hovedrisiko: `weekly-hive-alerts` skanner ALLE brukere/kuber/inspeksjoner i én sweep (skalerer dårlig forbi ~5–10k brukere), `revenuecat-webhook` har en idempotens-race ved DB-feil, manglende indeks på `swarm_reports.status`, og utbredt `.select('*')`.

## Funn

### KRITISK
Ingen kritiske datatap-/sikkerhetsfeil i databaselaget (RLS er konsekvent og FK-cascades korrekte).

### HØY
**[HØY]** `functions/weekly-hive-alerts/index.ts:51-82` — Funksjonen henter ALLE profiler med push_token, deretter ALLE aktive kuber for disse, deretter `hiveIds.length * 10` inspeksjoner i ett kall. Ved 10 000 brukere á 5 kuber = 50k kuber → ett `.in('hive_id', [50000 ids])`-kall som sprenger URL/statement-grenser og minne. — Konsekvens: cron-jobben feiler stille (timeout/500) forbi noen tusen brukere; ingen varsler sendes. — Løsning: paginer over brukere i batcher (f.eks. 500), eller flytt varroa-trend/forfall-logikken til en SQL-RPC/materialized view som returnerer kun kuber som trenger varsel.

**[HØY]** `functions/revenuecat-webhook/index.ts:72-101` — Idempotens-raden settes inn FØR `profiles`-oppdateringen. Hvis tier-oppdateringen (linje 98) feiler med 500, er event-id allerede lagret → RevenueCats retry treffer 23505 og hopper over (linje 76-79), så oppdateringen skjer aldri. — Konsekvens: tapt oppgradering/nedgradering ved transient DB-feil. — Løsning: gjør insert + update i én transaksjon (RPC), eller slett event-raden i feilgrenen før retur av 500.

**[HØY]** `0001:191-201` mangler indeks på `swarm_reports.status`. SELECT-policyen (0037) filtrerer på `status = 'open'` og realtime-kartet spør `status='open'`. — Konsekvens: seq-scan ved voksende rapportvolum. — Løsning: `CREATE INDEX idx_swarm_reports_status ON swarm_reports(status) WHERE status = 'open';` (partiell indeks).

### MEDIUM
**[MEDIUM]** Utbredt `.select('*')` i 15 queries (`hive.ts:93,109`, `inspection.ts:77`, `treatment.ts`, `harvest.ts`, `queen.ts`, `weight.ts`, m.fl.). `fetchInspection` (`inspection.ts:74-83`) og `fetchHive` henter alle kolonner inkl. store `disease_observations` jsonb / `notes`. — Konsekvens: unødvendig payload, treghet på mobilnett, brytes ikke ved skjemaendring men kostbart. — Løsning: eksplisitte kolonnelister (slik `fetchInspections` allerede gjør).

**[MEDIUM]** `0001:216-225` RLS-policy «hives: les via team» bruker IKKE `(SELECT auth.uid())`-mønsteret fra 0039 og har en korrelert subquery (`team_members JOIN profiles`) per rad. 0039 hoppet over denne og «hives: les egne» SELECT-policyen. — Konsekvens: per-rad auth.uid()-evaluering degraderer SELECT på `hives` ved mange rader. — Løsning: wrap i `(SELECT auth.uid())` og vurder SECURITY DEFINER-hjelpefunksjon for team-sjekken.

**[MEDIUM]** `0012` `get_latest_inspections_per_hive` bruker `DISTINCT ON (hive_id) ... ORDER BY hive_id, inspected_at DESC`. Optimal form, men trenger sammensatt indeks `(user_id, hive_id, inspected_at DESC)` for indeks-only-plan. 0038 la til `(hive_id, inspected_at DESC)` men ikke med `user_id` først (RPC filtrerer på `user_id = auth.uid()`). — Konsekvens: filter på user_id gir bitmap/seq før DISTINCT ON ved mange brukere. — Løsning: `CREATE INDEX idx_inspections_user_hive_inspected ON inspections(user_id, hive_id, inspected_at DESC);`

**[MEDIUM]** `0028` `get_map_hives` er `SECURITY DEFINER` og kjører tre `UNION ALL`-grener med `LEFT JOIN profiles` + JOIN. `is_active=true AND location_lat IS NOT NULL`-filteret skanner uten partiell indeks. — Konsekvens: akseptabelt for én bruker, men unødvendig skann. — Løsning: `CREATE INDEX idx_hives_active_geo ON hives(user_id) WHERE is_active AND location_lat IS NOT NULL;`

**[MEDIUM]** `functions/weekly-hive-alerts/index.ts:181-187` — Token-nullstilling er fire-and-forget (`.then().catch()`) uten `await`. I Deno edge-runtime kan funksjonen returnere før update fullføres → ugyldige tokens forblir. — Løsning: `await` oppdateringen før retur.

### LAV
**[LAV]** `0001:117` `varroa_count int` har `>= 0`-check men ingen øvre grense; useriøse verdier mulig. Lav risiko.

**[LAV]** Inkonsistens: `harvest_records.harvested_at` og `calendar_events.event_date` er `date` (ikke timestamptz). Bevisst for hele-dager, men 0038 indekserte `harvest_records(hive_id, harvested_at)` mens 0003 allerede har `(user_id, harvested_at)` — delvis overlappende indekser.

**[LAV]** `0016` original cron sendte INGEN `x-alerts-secret` (rettet i 0035 via `unschedule` i DO-block med exception-swallow). Verifiser `cron.job`-tabellen for duplikat-jobb.

**[LAV]** `revenuecat_processed_events` (0041) vokser ubegrenset uten TTL/cleanup. — Løsning: periodisk `DELETE WHERE processed_at < now() - interval '90 days'`.

## Topp-3 anbefalinger
1. **Paginer `weekly-hive-alerts` per brukerbatch + flytt utvelgelse til RPC** (4–6t). Fjerner den primære skaleringsblokkeringen forbi ~5k brukere.
2. **Gjør revenuecat-webhook transaksjonell** (insert-event + update-tier i én RPC, eller slett event ved feil) (1–2t). Hindrer tapte tier-endringer.
3. **Legg til manglende indekser** (1t): `idx_swarm_reports_status` (partiell), `idx_inspections_user_hive_inspected`, `idx_hives_active_geo`.

**Estimert maks brukere før degradering**: App-queries (per-bruker RLS) skalerer til titusenvis. **Flaskehalsen er `weekly-hive-alerts` global sweep** — degraderer rundt 5 000–10 000 brukere uten paginering.
