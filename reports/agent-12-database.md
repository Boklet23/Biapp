# Agent 12 — Databasearkitektur og backend

## Metainfo
- Filer lest: `supabase/migrations/0001, 0003, 0007, 0012, 0015, 0027, 0028, 0033, 0038, 0039, 0041, 0046, 0049, 0050, 0051`, `services/inspection.ts`, `services/hive.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `analyze-varroa/index.ts`. Grep: `.select('*')` (15 treff i services), `timestamp uten tz` (0 treff), `CREATE INDEX` (full oversikt, 0001–0051).
- Filer ikke funnet: `supabase/migrations/reset_and_rebuild.sql` (slettet siden forrige review — FIKSET).
- Diff mot forrige review (2026-06-12): lest. **Fikset:** (1) 0039-regresjonen — starter-grensen er gjenopprettet som BEFORE-trigger i `0046` og hardnet i `0049` (foreldreløs `count_active_hives_for_user` slettet, trigger-funksjon REVOKEd). (2) `reset_and_rebuild.sql` er fjernet helt. (3) Composite-indeks for RPC 0012 lagt til i `0051` `(user_id, hive_id, inspected_at DESC)`. (4) Partiell indeks `swarm_reports WHERE status='open'` i `0051`. (5) `analyze-varroa`-timeout: klient har nå AbortController (`inspection.ts:189-222`). (6) Kubedeling-eskalering tettet i `0050`. **Fortsatt åpent:** weekly-hive-alerts global sweep, `.select('*')` ×15, SELECT-policyer på hives/team/collaborator bruker bare `auth.uid()`, manglende body-størrelsesgrense i analyze-varroa, manglende CHECK på weight_kg/num_boxes, processed_events uten TTL, fire-and-forget token-nulling.

## Sammendrag (maks 80 ord)
Skjemaet er solid: konsekvent `timestamptz`, FK med riktig cascade, gode CHECK på inspections/harvest. De tre HØY-funnene fra forrige review er reelt fikset (hive-grense via trigger, reset-fil slettet, RPC-indeks). Gjenstående blokkering før vekst er `weekly-hive-alerts`-sweepen som henter ALLE profiler/kuber i ett kall — dør rundt 5–10k brukere. Resten er ytelses- og hygienefunn (`.select('*')`, SELECT-policy-subselect, body-grense, CHECK-constraints, TTL).

## Fungerer godt (maks 5 punkter)
1. **0046+0049 hive-grense** — BEFORE-trigger som skiller reaktivering fra redigering, anerkjenner prøveperiode, gir norsk feilmelding; foreldreløs DEFINER-funksjon ryddet og trigger-funksjon REVOKEd. Solid håndtering av regresjonen.
2. **0050 kubedeling** — tettet privilegie-eskalering (`WITH CHECK` krever nå eierskap av kuben), e-postoppslag via gated SECURITY DEFINER (Lag-tier, REVOKE anon).
3. **RPC 0012** — `security invoker`, `DISTINCT ON`, minimale kolonner, `stable`; nå dekket av composite-indeks i 0051. Index-only-traversal mulig.
4. **Konsekvent `timestamptz`** overalt; `date` kun for hele-dags-felt. Ingen `timestamp without time zone` i hele migrasjonssettet.
5. **analyze-varroa-klient** — AbortController med 30s timeout + brukervennlige norske feilmeldinger (`inspection.ts:200-222`).

## Funn

**[HØY]** `supabase/functions/weekly-hive-alerts/index.ts:51-82` — Uendret: henter ALLE profiler med push_token, ALLE aktive kuber, så inspeksjoner med `.in('hive_id', hiveIds).limit(hiveIds.length * 10)` i ett enkelt kall:
```ts
.in('hive_id', hiveIds)
.limit(hiveIds.length * 10);
```
Ved 10k brukere ≈ titusener kube-IDer i én IN-liste → sprengt statement/minne, cron feiler stille (catch returnerer 500, ingen retry). — Konsekvens: varsler slutter å gå ut ved vekst, uten synlig feil. — Løsning: paginer per brukerbatch (f.eks. 500), eller flytt utvelgelsen til en SQL-RPC som returnerer kun varslingskandidater. — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `supabase/functions/analyze-varroa/index.ts:88` — `await req.json()` uten størrelsesgrense på `imageBase64` før den sendes til Anthropic. Stort bilde → minnepress i Edge Function + lang synkron ventetid + unødig token-kostnad. Ingen `AbortSignal` på selve Anthropic-fetch (linje 99) heller — kun klienten har timeout. — Løsning: avvis `imageBase64.length > ~9_400_000` (≈7 MB binær) med 413, og `signal: AbortSignal.timeout(25_000)` på fetch. — Innsats: S — Konfidens: HØY.

**[MEDIUM]** RLS-ytelse (kun ytelse — korrekthet er Agent 8): `0001:214-225` "hives: les egne"/"hives: les via team" bruker fortsatt bare `auth.uid()`; `0008` collaborator-SELECT likeså. 0039 hoppet over alle hives-SELECT-policyene. Hver `inspections`/`hives`-SELECT re-evaluerer `auth.uid()` + korrelert team/collaborator-EXISTS per rad. — Løsning: wrap i `(SELECT auth.uid())`; vurder STABLE SECURITY DEFINER-hjelpefunksjon for team-/collaborator-sjekken (kalles én gang). — Innsats: S — Konfidens: HØY.

**[MEDIUM]** `services/hive.ts:74-78` — `createSignedUrl(fileName, 365*24*3600)` lagres permanent i `hives.photo_url`. Etter 365 dager (eller nøkkelrotasjon) dør alle kubefoto stille. — Konsekvens: tause bilde-feil for tidlige brukere etter ett år. — Løsning: lagre storage-path i DB, signer ved lesing (mønsteret `fetchInspectionMedia` allerede bruker, `inspection.ts:176-178`). — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `.select('*')` i 15 queries (`hive.ts:93,109`, `inspection.ts:77`, `treatment.ts:19,30`, `queen.ts:27`, `weight.ts:14`, `harvest.ts:17`, `swarmReport.ts:45`, `calendarEvent.ts:31`, `profile.ts:35`, `associations.ts:37,56`, `diseases.ts:7,17`). `fetchHives` (`hive.ts:93`) henter hele `notes`-kolonnen for hele kubelisten på dashboard-lasting. — Løsning: eksplisitte kolonnelister (mønsteret `fetchInspections` allerede bruker). — Innsats: M — Konfidens: HØY.

**[LAV]** Manglende CHECK-constraints: `0007:7 weight_kg numeric(6,2) not null` uten `> 0`; `0027:1-3 num_boxes/frames_per_box INTEGER` uten `> 0`; `0015:3 varroa_ai_count integer` uten `>= 0`. Negative/null-verdier mulig via direkte API. (NB: `harvest_records.quantity_kg` HAR `> 0` (0003:9), og inspections-rammene har `>= 0` — bra; bare disse tre mangler.) — Løsning: `ALTER TABLE ... ADD CONSTRAINT ... CHECK (...)`. — Innsats: S — Konfidens: HØY.

**[LAV]** `0041 revenuecat_processed_events` vokser ubegrenset (ingen TTL/opprydding), og `weekly-hive-alerts/index.ts:181-186` token-nulling er fortsatt fire-and-forget uten `await` (kjøres etter at responsen er sendt → kan dø i Edge-runtime-teardown, ugyldige tokens forblir). — Løsning: periodisk `DELETE WHERE processed_at < now()-interval '90 days'` (pg_cron); `await` token-update før retur. — Innsats: S — Konfidens: MEDIUM.

**[LAV]** Migrasjonshygiene/backup: 0003/0006/0009 m.fl. bruker `create table`/`create policy` uten `if not exists`/`drop policy if exists` — re-kjøring feiler (CLI sporer kjørte migrasjoner, så lav risiko). Nummerering 0001–0051 komplett uten hull. PITR: aktiver Supabase Pro + PITR før lansering — `app_config` (cron-secret) og `revenuecat_processed_events` er single-point-of-truth uten backup i dag. — Innsats: S (PITR er dashboard) — Konfidens: MEDIUM.

**Datavekst-estimat:** inspeksjonsrad ≈ 1–2 kB (notes + AI-anbefaling + jsonb disease_observations); media i egen tabell + storage-bucket (ikke i raden). Aktiv bruker ≈ 20 kuber × 25 inspeksjoner = 500 rader ≈ 0,5–1 MB/sesong. 10k brukere ≈ 5M rader — uproblematisk på Pro med per-bruker-indeksene (0051). Flaskehalsen er ikke lagring, men `weekly-hive-alerts`-sweepen (degraderer ~5–10k brukere) og Edge-funksjon-minne. Partisjonering unødvendig før titalls millioner rader; vurder arkivering av inspections eldre enn 3 sesonger ved >50k brukere.

## Topp-3 anbefalinger
1. **Paginer/RPC-fier weekly-hive-alerts** — eneste gjenværende skaleringsblokkering. Sweepen feiler stille ved vekst og varsler stopper uten alarm. Innsats: M.
2. **Body-grense + Anthropic-timeout i analyze-varroa + flytt hive-foto til signer-ved-lesing** — to S/M-fikser som fjerner DoS/kostnadsvektor og tause bilde-feil etter ett år.
3. **Indeks- og hygienesett:** wrap SELECT-policyene (hives/team/collaborator) i `(SELECT auth.uid())`, legg CHECK på weight_kg/num_boxes/varroa_ai_count, og pg_cron-TTL på processed_events. Alle S. Aktiver PITR før lansering.
