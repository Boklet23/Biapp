# Agent 12 — Databasearkitektur og backend

## Metainfo
- Filer lest: `supabase/migrations/0001, 0003, 0006, 0007, 0012, 0015, 0027, 0028, 0033, 0038, 0039, 0041, 0046, 0049, 0050, 0051, 0052`, `services/inspection.ts`, `services/hive.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `supabase/functions/analyze-varroa/index.ts`. Grep: `.select('*')` (15 treff i services), `timestamp uten tz` (0 treff), full indeksoversikt 0001–0052.
- Filer ikke funnet: `reset_and_rebuild.sql` (slettet — bekreftet borte). RPC heter `get_map_hives` (0028), ikke `get_hive_map_data`; collaboration-RPCer i 0050: `lookup_user_id_by_email`, `get_hive_collaborators`.
- Diff mot forrige runde (2026-06-18): lest. **Verifisert fikset:** hive-grense (0046-trigger + 0049 REVOKE/opprydding + 0052 droppet redundant 0013-INSERT-policy), reset-fil slettet, RPC 0012 composite-indeks + swarm partiell indeks (0051), kubedeling-eskalering tettet (0050). **INGEN regresjoner.** Gjenstående fra forrige: alle re-verifisert som fortsatt åpne (se under).

## Sammendrag (maks 80 ord)
Skjemaet er fortsatt solid: konsekvent `timestamptz`, FK med riktig cascade, gode CHECK på inspections/harvest. Alle tre tidligere HØY-funn er reelt fikset, og 0052 retter en subtil trial-bruker-bug uten å svekke grensen. Eneste gjenværende skaleringsblokkering er `weekly-hive-alerts`-sweepen (henter alle profiler/kuber/inspeksjoner i tre globale kall — degraderer ~5–10k brukere, feiler stille). Resten er hygiene/ytelse: `.select('*')` ×15, manglende body-grense + Anthropic-timeout, CHECK-constraints, TTL, fire-and-forget token-nulling.

## Fungerer godt (maks 5 punkter)
1. **0046+0049+0052 hive-grense** — BEFORE-trigger skiller reaktivering fra redigering, anerkjenner prøveperiode; foreldreløs DEFINER-funksjon slettet, trigger REVOKEd, og 0052 fjernet den redundante 0013-policyen som feilaktig avviste trial-brukere på kube #4. Robust ende-til-ende.
2. **0050 kubedeling** — `WITH CHECK` krever nå eierskap av kuben (eskalering tettet), e-postoppslag via gated SECURITY DEFINER (Lag-tier, REVOKE anon/public).
3. **RPC 0012** — `security invoker`, `DISTINCT ON`, minimale kolonner, `stable`, dekket av composite-indeks (0051). Index-only-traversal mulig på dashboard-hot-path.
4. **Konsekvent `timestamptz`** i hele migrasjonssettet (0 treff på `timestamp without time zone`); `date` kun for hele-dags-felt.
5. **analyze-varroa rekkefølge** — abonnement + rate-limit sjekkes FØR body parses og FØR Anthropic-kall; klient har AbortController-timeout (`inspection.ts:201`).

## Funn

**[HØY]** `supabase/functions/weekly-hive-alerts/index.ts:52-83` — Uendret global sweep: henter ALLE profiler med push_token, så ALLE aktive kuber, så inspeksjoner i ett kall med:
```ts
.in('hive_id', hiveIds)
.order('inspected_at', { ascending: false })
.limit(hiveIds.length * 10);
```
Ved 10k brukere ≈ titusener kube-IDer i én IN-liste → sprengt statement-størrelse/minne; cron-catch returnerer 500 uten retry. — Konsekvens: ukentlige varsler slutter å gå ut ved vekst, uten synlig alarm. — Løsning: paginer per brukerbatch (~500), eller flytt kandidat-utvelgelsen til en SQL-RPC som returnerer kun varslingskandidater (overdue/varroa-trend) i stedet for å hente rådata til Edge-runtime. — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `supabase/functions/analyze-varroa/index.ts:88,99` — `await req.json()` uten størrelsesgrense på `imageBase64`, og ingen `AbortSignal` på selve Anthropic-fetch (kun klienten har timeout). Stort bilde → minnepress + lang synkron ventetid + unødig token-kostnad; treg AI-respons holder Edge-invokasjon åpen. — Løsning: avvis `imageBase64.length > ~9_400_000` (≈7 MB binær) med 413, og `signal: AbortSignal.timeout(25_000)` på fetch (linje 99). — Innsats: S — Konfidens: HØY.

**[MEDIUM]** `analyze-varroa/index.ts:72-85,172-174` — Rate-limit teller eksisterende rader og logger bruk KUN ved suksess etter AI-kallet. Ingen slot reserveres før kallet → samtidige requests fra samme bruker leser samme `count` og kan alle passere grensen (TOCTOU). Hobbyist (10/mnd) kan overskrides ved burst; profesjonell/lag = 9999 så liten praktisk effekt. — Løsning: insert usage-rad FØR AI-kallet (rull tilbake/marker ved feil), eller bruk en atomisk RPC med `count(*) ... FOR UPDATE`-mønster. — Innsats: M — Konfidens: MEDIUM.

**[MEDIUM]** RLS-ytelse (kun ytelse — korrekthet=Agent 8): `0001:214-225` "hives: les egne"/"hives: les via team" bruker fortsatt bare `auth.uid()` (0039 hoppet over alle hives-SELECT-policyene); `0001:232` inspections-SELECT ble fikset i 0039, men hives-SELECT re-evaluerer `auth.uid()` + korrelert team-EXISTS per rad. — Løsning: wrap i `(SELECT auth.uid())`; vurder STABLE SECURITY DEFINER-hjelpefunksjon for team/collaborator-sjekken slik at den evalueres én gang. — Innsats: S — Konfidens: HØY.

**[MEDIUM]** `services/hive.ts:73-78` — `createSignedUrl(fileName, 365*24*3600)` lagres permanent i `hives.photo_url`. Etter 365 dager (eller nøkkelrotasjon) dør alle kubefoto stille. — Konsekvens: tause bilde-feil for tidlige brukere etter ett år. — Løsning: lagre storage-path i DB, signer ved lesing (mønsteret `fetchInspectionMedia` allerede bruker, `inspection.ts:176-178`). — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `.select('*')` i 15 queries (`hive.ts:93,109`, `inspection.ts:77`, `treatment.ts:19,30`, `queen.ts:27`, `weight.ts:14`, `harvest.ts:17`, `swarmReport.ts:45`, `calendarEvent.ts:31`, `profile.ts:35`, `associations.ts:37,56`, `diseases.ts:7,17`). `fetchHives` (`hive.ts:93`) henter hele `notes`-kolonnen for hele kubelisten ved hver dashboard-lasting. — Løsning: eksplisitte kolonnelister (mønsteret `fetchInspections`/`fetchAllInspections` allerede bruker). — Innsats: M — Konfidens: HØY.

**[LAV]** Manglende CHECK-constraints: `0007:7 weight_kg numeric(6,2) not null` uten `> 0`; `0027:1-3 num_boxes/frames_per_box INTEGER` uten `> 0`; `0015:3 varroa_ai_count integer` uten `>= 0`. Negative verdier mulig via direkte API. (`harvest_records.quantity_kg` HAR `> 0` (0003:9); inspections-rammer/varroa_count har `>= 0` (0001:111-117) — kun disse tre mangler.) — Løsning: `ALTER TABLE ... ADD CONSTRAINT ... CHECK (...)`. — Innsats: S — Konfidens: HØY.

**[LAV]** `0041 revenuecat_processed_events` vokser ubegrenset (ingen TTL), og `weekly-hive-alerts/index.ts:181-188` token-nulling er fortsatt fire-and-forget uten `await` (kjøres etter retur → kan dø i Edge-runtime-teardown; ugyldige tokens forblir → unødig push-trafikk neste uke). — Løsning: periodisk `DELETE WHERE processed_at < now()-interval '90 days'` (pg_cron); `await` token-update før retur. — Innsats: S — Konfidens: MEDIUM.

**[LAV]** Migrasjonshygiene/backup: 0003/0006/0009 m.fl. bruker `create table`/`create policy` uten `if not exists`/`drop policy if exists` — re-kjøring feiler (CLI sporer kjørte migrasjoner, så lav reell risiko). Nummerering 0001–0052 komplett uten hull (0012 ligger etter 0013 i filnavn-sortering, men numerisk komplett). PITR: aktiver Supabase Pro + PITR før lansering — `app_config` (cron-secret) og `revenuecat_processed_events` er single-point-of-truth uten backup i dag. — Innsats: S (PITR er dashboard-toggle) — Konfidens: MEDIUM.

**Datavekst-estimat:** inspeksjonsrad ≈ 1–2 kB (notes + AI-anbefaling + jsonb disease_observations); media i egen tabell + storage-bucket (ikke i raden). Aktiv bruker ≈ 20 kuber × 25 inspeksjoner = 500 rader ≈ 0,5–1 MB/sesong. 10k brukere ≈ 5M rader — uproblematisk på Pro med per-bruker-indeksene (0051/0038/0033). Flaskehalsen er ikke lagring, men `weekly-hive-alerts`-sweepen (degraderer ~5–10k brukere) og Edge-funksjon-minne. Partisjonering unødvendig før titalls millioner rader; vurder arkivering av inspections eldre enn 3 sesonger ved >50k brukere.

## Topp-3 anbefalinger
1. **Paginer/RPC-fier weekly-hive-alerts** — eneste gjenværende skaleringsblokkering. Sweepen feiler stille ved vekst og varsler stopper uten alarm. Innsats: M.
2. **Hardne analyze-varroa:** body-grense (413) + `AbortSignal.timeout` på Anthropic-fetch + reserver rate-limit-slot før AI-kall (TOCTOU). Fjerner DoS/kostnadsvektor og kvote-omgåelse. Innsats: S–M.
3. **Hygiene-sett (alle S):** flytt hive-foto til signer-ved-lesing, wrap hives-SELECT-policyene i `(SELECT auth.uid())`, legg CHECK på weight_kg/num_boxes/frames_per_box/varroa_ai_count, pg_cron-TTL på processed_events, `await` token-nulling. Aktiver PITR før lansering.
