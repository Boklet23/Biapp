# Agent 12 — Databasearkitektur og backend

## Metainfo
- Filer lest: `supabase/migrations/0001, 0002, 0003, 0006, 0007, 0008, 0009, 0011, 0012, 0013, 0014, 0015, 0016, 0017, 0020, 0027, 0028, 0033, 0034, 0035, 0037, 0038, 0039, 0041, reset_and_rebuild.sql`, `services/inspection.ts`, `services/hive.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `analyze-varroa/index.ts`, `revenuecat-webhook/index.ts`. Grep: `.select('*')` (services), `CREATE INDEX` (alle migrasjoner), timestamp-typer, `hives: opprett egne`-policyhistorikk.
- Filer ikke funnet: ingen
- Diff mot forrige review: lest arkiv (2026-06-10): ja. **Fikset siden sist:** revenuecat-webhook-idempotens er nå korrekt rekkefølge (`index.ts:71-119` — les-sjekk → tier-update → marker prosessert; arkivets HØY-funn løst). **Fortsatt åpent:** weekly-hive-alerts global sweep, manglende indekser (swarm_reports.status, composite for 0012-RPC), `.select('*')` (15 forekomster), bare `auth.uid()` i hives-SELECT-policyer, fire-and-forget token-nulling.

## Sammendrag (maks 80 ord)
Skjemaet er gjennomgående solid: konsekvent `timestamptz`, FK med cascade, idempotensfiksen i webhooken er korrekt implementert. Men reviewen avdekket en alvorlig regresjon: migrasjon 0039 droppet og gjenskapte hives-policyene og fjernet dermed server-side 3-kubers-grensen fra 0013/0014/0020. I tillegg ligger `reset_and_rebuild.sql` (DROP alle tabeller) i migrations-mappen, og webhooken ignorerer `tier_locked` — testere nedgraderes ved første downgrade-event.

## Fungerer godt (maks 5 punkter)
1. **Webhook-idempotens (0041)** — korrekt rekkefølge: sjekk → prosesser → marker (`revenuecat-webhook/index.ts:71-119`). Transient DB-feil gir retry, ikke tapt event. Ikke rør.
2. **RPC 0012** — `security invoker` (RLS gjelder), `DISTINCT ON`, minimale kolonner, `stable`. Riktig designet.
3. **Konsekvent `timestamptz`** i alle tabeller; `date` kun bevisst for hele-dags-felt (treated_at, weighed_at, harvested_at, event_date).
4. **Eksplisitte kolonnelister** i `fetchInspections`/`fetchAllInspections` (`services/inspection.ts:37,65`) — riktig mønster å kopiere til resten.
5. **0039-subselect-mønsteret** på de varme tabellene (inspections, harvest, treatments, weights) — én `auth.uid()`-evaluering per query.

## Funn

**[HØY] [REGRESJON]** `supabase/migrations/0039_rls_subselect_auth_uid.sql:12-17` — Ytelsesmigrasjonen droppet og gjenskapte hives-policyene uten forretningslogikken:
```sql
DROP POLICY IF EXISTS "hives: opprett egne" ON hives;
CREATE POLICY "hives: opprett egne" ON hives FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
```
0013 (INSERT-cap på 3 kuber for starter) og 0014/0020 (UPDATE-cap mot reaktivering, inkl. `count_active_hives_for_user()`) er dermed fjernet i DB. Server-side paywall-håndhevelse er borte; direkte API-kall omgår 3-kubers-grensen. — Løsning: ny migrasjon som gjenskaper begge policyer med både `(SELECT auth.uid())` OG tier-/count-sjekken fra 0020. — Innsats: S — Konfidens: HØY (overlapper Agent 8; rapportert her fordi det er migrasjonshygiene-feil).

**[HØY]** `supabase/functions/weekly-hive-alerts/index.ts:51-82` — Uendret siden forrige review: henter ALLE profiler med push_token, ALLE kuber, så `.in('hive_id', hiveIds)` med `limit(hiveIds.length * 10)` i ett kall ("`.limit(hiveIds.length * 10)`"). Ved 10 000 brukere ≈ 50k kube-IDer i én IN-liste → sprengt statement/minne, cron feiler stille. — Løsning: paginer per brukerbatch (500) eller flytt utvelgelsen til en SQL-RPC som returnerer kun varslingskandidater. — Innsats: M — Konfidens: HØY.

**[HØY]** `supabase/migrations/reset_and_rebuild.sql:7-17` — Fil i migrations-mappen som begynner med `drop table if exists swarm_reports cascade;` ×11 og header "Kjør dette i Supabase SQL Editor". Den gjenoppbygger kun 0001-skjemaet — kjørt mot prod sletter den alle data og alle tabeller fra 0002+ permanent. CLI hopper over den (mangler nummerprefiks), men den inviterer til manuell kjøring. — Løsning: flytt til `scripts/dev/` eller slett; legg inn en guard øverst (`DO $$ BEGIN IF current_database() = 'prod' THEN RAISE ...`). — Innsats: S — Konfidens: HØY.

**[MEDIUM]** `supabase/functions/revenuecat-webhook/index.ts:102-105` — `update({ subscription_tier: tier }).eq('id', userId)` ignorerer `tier_locked` (0034). Testere med låst lag-tier nedgraderes av første EXPIRATION/BILLING_ISSUE-event. I tillegg er `SUBSCRIBER_ALIAS` (index.ts:7) klassifisert som downgrade → alias-merge kan feilaktig sette betalende bruker til starter. — Løsning: `.eq('tier_locked', false)` i update + fjern SUBSCRIBER_ALIAS fra DOWNGRADE_EVENTS. — Innsats: S — Konfidens: HØY.

**[MEDIUM]** Manglende indekser (uendret fra forrige review). 0033+0038 dekker mye, men: (a) `swarm_reports.status` — SELECT-policyen (0037:11 `status = 'open'`) og kartet filtrerer på status uten indeks; (b) 0012-RPC-en filtrerer `user_id = auth.uid()` + `DISTINCT ON (hive_id) ORDER BY inspected_at DESC`, men 0038 ga kun `(hive_id, inspected_at DESC)`; (c) `get_map_hives` skanner `is_active AND location_lat IS NOT NULL` uten partiell indeks. — Løsning:
```sql
CREATE INDEX idx_swarm_reports_open ON swarm_reports(status) WHERE status = 'open';
CREATE INDEX idx_inspections_user_hive_date ON inspections(user_id, hive_id, inspected_at DESC);
CREATE INDEX idx_hives_active_geo ON hives(user_id) WHERE is_active AND location_lat IS NOT NULL;
```
— Innsats: S — Konfidens: HØY.

**[MEDIUM]** RLS-ytelse (kun ytelse — korrekthet er Agent 8): `0001:214-225` "hives: les egne"/"hives: les via team" og `0008:22-38` "les via samarbeid"-policyene (hives + inspections) bruker fortsatt bare `auth.uid()` i korrelert EXISTS per rad — 0039 hoppet over alle SELECT-policyene på hives og samarbeids-policyene. Hver inspections-SELECT evaluerer collaborator-EXISTS per rad. — Løsning: wrap i `(SELECT auth.uid())`; vurder SECURITY DEFINER-hjelpefunksjon for team-sjekken. — Innsats: S — Konfidens: HØY.

**[MEDIUM]** `services/hive.ts:74-78` — `createSignedUrl(fileName, 365 * 24 * 3600)` og URL-en lagres permanent i `hives.photo_url`. Etter 365 dager (eller ved rotering av storage-nøkkel) dør alle kubefoto stille. — Løsning: lagre storage-path i DB, signer ved lesing (mønsteret `fetchInspectionMedia` allerede bruker, `inspection.ts:176-178`). — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `.select('*')` i 15 queries (`hive.ts:93,109`, `inspection.ts:77`, `treatment.ts:19,30`, `queen.ts:27`, `weight.ts:14`, `harvest.ts:17`, m.fl.) — uendret fra forrige review. `fetchHives` henter `notes` + alle kolonner for hele kubelisten. — Løsning: eksplisitte kolonnelister. — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `supabase/functions/analyze-varroa/index.ts:80-91` — `req.json()` uten størrelsesgrense på `imageBase64`, og Anthropic-fetch (linje 91) uten timeout/AbortController. Stort bilde → minnepress og lang synkron ventetid; klienten har heller ingen timeout (`services/inspection.ts:197`). Kvote-loggen skrives etter suksess (linje 164) — to samtidige kall kan overskride månedsgrensen med 1 (akseptabelt). — Løsning: valider base64-lengde (< ~7 MB), `AbortSignal.timeout(30_000)`. — Innsats: S — Konfidens: HØY.

**[LAV]** Manglende CHECK-constraints: `0007:7 weight_kg numeric(6,2) not null` uten `> 0`; `0027:2-3 num_boxes/frames_per_box` uten `> 0`; `0015:3 varroa_ai_count integer` uten `>= 0`. Negative verdier mulig via API. — Innsats: S — Konfidens: HØY.

**[LAV]** `0041` `revenuecat_processed_events` vokser ubegrenset (ingen TTL) og `weekly-hive-alerts/index.ts:181-186` token-nulling er fortsatt fire-and-forget uten `await` — begge uendret fra forrige review. — Innsats: S — Konfidens: HØY.

**[LAV]** Migrasjonshygiene: 0006–0009, 0011 m.fl. bruker `create table`/`create policy` uten `if not exists`/`drop policy if exists` — re-kjøring feiler. Nummerering 0001–0045 er ellers komplett uten hull. PITR: prosjektet er på free tier (jf. lanseringssjekkliste) — aktiver Pro + PITR før lansering; cron-jobben (0035) og webhook gjør tabellene `app_config`/`revenuecat_processed_events` til single-point-of-truth uten backup i dag. — Innsats: S (PITR er dashboard-oppgave) — Konfidens: MEDIUM.

**Datavekst-estimat:** inspeksjonsrad ≈ 1–2 kB (notes + AI-anbefaling + jsonb); aktiv bruker ≈ 20 kuber × 25 inspeksjoner = 500 rader ≈ 1 MB/sesong. 10 000 brukere ≈ 5M rader — uproblematisk på Supabase Pro med per-bruker-indekser. Flaskehalsen er ikke lagring, men `weekly-hive-alerts`-sweepen (degraderer rundt 5–10k brukere) og Edge Function-minne. Partisjonering unødvendig før titalls millioner rader.

## Topp-3 anbefalinger
1. **Gjenopprett starter-grensen i RLS (0039-regresjonen)** — ny migrasjon som kombinerer subselect-mønsteret med 0013/0020-logikken. Innsats: S. Effekt: lukker server-side paywall-bypass før lansering.
2. **Flytt/guard `reset_and_rebuild.sql` + fiks webhookens `tier_locked`/SUBSCRIBER_ALIAS** — to S-fikser som fjerner hhv. katastrofal-datatap-fotgun og feilnedgradering av betalende/testere.
3. **Kjør indeksmigrasjonen (3 indekser) + paginer weekly-hive-alerts** — S+M. Fjerner de to kjente skaleringsblokkeringene før brukervekst.
