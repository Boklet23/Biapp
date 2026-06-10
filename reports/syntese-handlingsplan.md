# Syntese — Konsolidert handlingsplan for BiVokter

Multi-agent gjennomgang (12 agenter) konsolidert til én prioritert handlingsplan.
Generert: 2026-06-10. Status: pre-lansering, mål 100 betalende brukere.

---

## 1. Metainfo

**Rapporter lest (12/12):**
agent-01-navigasjon · agent-02-design · agent-03-konvertering · agent-04-domene · agent-05-arkitektur · agent-06-ytelse · agent-07-robusthet · agent-08-sikkerhet · agent-09-tilgjengelighet · agent-10-retention · agent-11-onboarding · agent-12-database

**Funn per alvorlighetsgrad (på tvers av alle agenter):**

| Agent | KRITISK | HØY | MEDIUM | LAV | Sum |
|-------|:--:|:--:|:--:|:--:|:--:|
| 01 Navigasjon | 1 | 2 | 4 | 2 | 9 |
| 02 Design | 2 | 2 | 3 | 2 | 9 |
| 03 Konvertering | 1 | 2 | 3 | 2 | 8 |
| 04 Domene | 0 | 3 | 3 | 2 | 8 |
| 05 Arkitektur | 0 | 2 | 4 | 3 | 9 |
| 06 Ytelse | 0 | 2 | 3 | 3 | 8 |
| 07 Robusthet | 1 | 2 | 3 | 2 | 8 |
| 08 Sikkerhet | 1 | 2 | 3 | 2 | 8 |
| 09 Tilgjengelighet | 1 | 3 | 4 | 3 | 11 |
| 10 Retention | 0 | 3 | 4 | 2 | 9 |
| 11 Onboarding | 1 | 2 | 3 | 3 | 9 |
| 12 Database | 0 | 3 | 5 | 4 | 12 |
| **TOTALT** | **8** | **28** | **42** | **30** | **108** |

8 KRITISKE, 28 HØY, 42 MEDIUM, 30 LAV = **108 funn totalt.**

---

## 2. Konsensus-funn (3+ agenter — høyeste reliabilitet)

Disse funnene rapporteres uavhengig av flere agenter og bør prioriteres høyest.

**K1 — `revenuecat-webhook` idempotens-race (tapt tier-oppgradering)**
Agenter: **8 (HØY)**, **12 (HØY)**. Idempotens-INSERT skjer FØR `profiles.update`; feiler update med 500, markeres eventet som prosessert og RevenueCat-retry hoppes over → kunde betaler men beholder starter-tier.
Fil: `supabase/functions/revenuecat-webhook/index.ts:72-101`. Direkte inntektslekkasje.

**K2 — Manglende indeks `inspections(user_id, hive_id, inspected_at DESC)`**
Agenter: **6 (HØY)**, **12 (MEDIUM)**. Batch-RPC `get_latest_inspections_per_hive` filtrerer på `user_id` men 0038 indekserte kun `(hive_id, inspected_at)`. Kjøres på BÅDE hjem og kuber-fanen → seq-scan + sort per dashboard-last.
Fil: `supabase/migrations/0012` + `0038:4`.

**K3 — Utbredt `.select('*')`**
Agenter: **6 (MEDIUM)**, **12 (MEDIUM)**, **5 (implisitt, mapX-robusthet)**. 15 queries henter alle kolonner inkl. tunge `disease_observations` jsonb / `notes` / `photo_url`. `fetchInspections` gjør det allerede riktig med eksplisitt kolonneliste — bruk samme mønster.
Fil: `services/hive.ts:93,109`, `services/inspection.ts:77`, treatment/harvest/queen/weight.

**K4 — Trial-forvirring (14 vs 30 dager + betalt kjøp i onboarding)**
Agenter: **3 (KRITISK)**, **11 (MEDIUM)**. Onboarding-knapp «Start 30 dager gratis» kaller `purchasePackage` (et betalt kjøp), mens DB-trigger gir 14-dagers trial til alle. Villedende markedsføring (Play Store-brudd) + utilsiktet betalingsdialog.
Fil: `app/(app)/onboarding.tsx:79-95,149` + `0017_trial_period.sql:9`.

**K5 — Kontrast/WCAG-svikt (hvit på honey + design-token-drift)**
Agenter: **9 (KRITISK)**, **2 (HØY)**. FAB hvit-på-honey ~2.1:1 (feiler AA grovt). Samme honey-farge (`#F5A623`) er både hardkodet hex (design) og kontrastproblem (a11y). Felles løsning: mørk tekst på honey + sentraliser i `Colors.*`.
Fil: `app/(app)/(tabs)/kalender/index.tsx:423` (a11y) · `HiveCard.tsx:72`, `HealthScoreSection.tsx:82-84` (design).

**K6 — Stille feil ved mutasjoner**
Agenter: **5 (HØY)**, **1 (MEDIUM, mangler isError i laer/samfunn)**, **7 (relatert: maskert feil)**. Global `mutationCache.onError` logger kun til Sentry, viser ingen toast → bruker tror sletting/lagring lyktes når den feilet.
Fil: `lib/queryClient.ts:12-16`.

**K7 — Samarbeid/Lag-tier er død funksjonalitet**
Agenter: **1 (KRITISK, manglende rute)**, **3 (MEDIUM, prematur gate)**, **10 (MEDIUM, null sosial retention)**. Lag-tier (499 kr) gates overalt men kubedeling er DB-only uten UI; ruten `[id]/samarbeid` er ikke registrert i `_layout`.
Fil: `kuber/_layout.tsx:14-23` · `kuber/[id]/index.tsx:300-319`.

**K8 — `weekly-hive-alerts` global sweep + duplikat-varsling**
Agenter: **12 (HØY)**, **10 (MEDIUM, duplikat push)**. Henter ALLE brukere/kuber/inspeksjoner i én sweep (degraderer ~5–10k brukere); lokal + server-varsling dupliserer «inspeksjon forfalt».
Fil: `supabase/functions/weekly-hive-alerts/index.ts:51-82,111`.

---

## 3. Motstridende anbefalinger

Få reelle konflikter. To spenninger verdt å løse eksplisitt:

**Konflikt 1 — Trial-timing: tydeliggjør vs. utsett.**
Agent 3 vil gjøre den automatiske trialen tydelig synlig tidlig (forankre verdi). Agent 11 vil utsette trial-tilbudet til ETTER første kube/inspeksjon (aha-moment først).
**Løsning:** Ikke i konflikt — kombinér. Fjern det villedende betalte kjøpet fra onboarding-knappen umiddelbart (begge enige), kommuniser «14 dager gratis er aktiv» passivt, men reserver det aktive *oppgraderings*-tilbudet til etter aha-momentet. Ett konsistent budskap, riktig timing.

**Konflikt 2 — `select('*')` vs. defensiv mapX.**
Agent 5 roser `mapHive`/`mapInspection` for å validere alle felt; agent 6/12 vil slanke payload via eksplisitte kolonnelister. Risiko: dropper man en kolonne som `mapX` krever, kaster mappingen.
**Løsning:** Ikke en konflikt, men en rekkefølge-avhengighet — kolonnelistene må inkludere alle felt `mapX()` leser. Utled listen fra mapper-funksjonen, ikke omvendt.

**Ingen øvrige reelle konflikter.** Design (agent 2) vil ha vektorikoner mens andre ikke nevner emoji — komplementært, ikke motstridende. Retention (agent 10) vil ha mer varsling mens samme agent advarer mot varslingstretthet — løses ved å konsolidere kilder, ikke legge til volum.

---

## 4. Topp-20 ROI-rangering

Formel: Konverteringseffekt × (1 / Implementeringskostnad) × (1 + Sikkerhetsrisiko).
Effekt/Kostnad: H=høy, M=middels, L=lav.

| Rang | Funn | Agent(er) | Effekt | Kostnad | Fil:linje |
|:--:|------|:--:|:--:|:--:|------|
| 1 | Importer Sentry (produksjonskrasj ved sync-feil) | 7 | H | L (5 min) | `app/(app)/_layout.tsx:28` |
| 2 | Fjern betalt kjøp fra onboarding + synk «14 dager» | 3,11 | H | L (2-3t) | `app/(app)/onboarding.tsx:79-95,149` |
| 3 | DB-indeks `inspections(user_id,hive_id,inspected_at)` | 6,12 | H | L (30 min) | `migrations/0012`+`0038` |
| 4 | revenuecat-webhook idempotens-race (tapt inntekt) | 8,12 | M | L (1-2t) | `revenuecat-webhook:72-101` |
| 5 | Toast i global `mutationCache.onError` | 5 | H | L (1t) | `lib/queryClient.ts:12-16` |
| 6 | FAB-kontrast hvit→mørk på honey (WCAG) | 9,2 | M | L (1t) | `kalender/index.tsx:423` |
| 7 | Registrer `[id]/samarbeid`-rute i `_layout` | 1 | M | L (15 min) | `kuber/_layout.tsx:14-23` |
| 8 | Manglende indekser swarm_reports.status + hives geo | 12 | M | L (1t) | `migrations/0001:191` |
| 9 | Fjern hardkodet anon-JWT i 0035 + verifiser rotasjon | 8 | L | L (45 min) | `0035_rotate_alerts_secret.sql:35` |
| 10 | Eksplisitte kolonnelister (drop `select('*')`) | 6,12,5 | M | M (2t) | `hive.ts:93,109`, `inspection.ts:77` |
| 11 | Styrk Profesjonell-verdiforslag i UpgradeModal | 3 | H | M (3-4t) | `UpgradeModal.tsx:46-54` |
| 12 | Sentraliser varroaterskler (faglig tillit) | 4 | M | M (3t) | `HealthScoreSection.tsx:37` + `TreatmentRec:30` |
| 13 | Onboarding/splash ut av auth-guard (intro før reg.) | 11 | H | M (2-4t) | `app/(app)/_layout.tsx:54-56` |
| 14 | Fjern e-postbekreftelse-blokkering (auto-confirm) | 11 | H | M (1-3t) | `register.tsx:70-74` |
| 15 | Stabiliser kubeliste-render (useCallback/useMemo) | 6 | M | L (1t) | `kuber/index.tsx:205-212,74` |
| 16 | Promise.all→allSettled i rapport + retry-guard 401 | 7 | M | L (1-2t) | `hjem/index.tsx:215` |
| 17 | Monter HoneyWidget + daglig tips-kort (daily driver) | 10 | M | L (0.5d) | `components/home/HoneyWidget.tsx:1` |
| 18 | DELETE-policy hive_disease_flags + slett Storage-fil | 8 | L | L (30 min) | `0001:251-257`, `inspection.ts:184` |
| 19 | Konsolider 3 «kom i gang»-CTAer til én flyt | 11,1 | M | M (3-5t) | `onboarding.tsx` + `ActivationGuide` + empty-state |
| 20 | Offline-persistering React Query (felt uten dekning) | 7 | M | M (2-3t) | `lib/queryClient.ts:17-22` |

---

## 5. Denne uken (< 4 timer hver — gjør umiddelbart)

Rask-fixer med høy verdi og lav risiko:

1. **Importer Sentry** i `app/(app)/_layout.tsx:28` — én linje, fjerner produksjonskrasj. (5 min, agent 7)
2. **Registrer `[id]/samarbeid`-rute** i `kuber/_layout.tsx` — `<Stack.Screen name="[id]/samarbeid" options={{ title: 'Samarbeid' }} />`. (15 min, agent 1)
3. **DB-indeks** `CREATE INDEX idx_inspections_user_hive_inspected ON inspections(user_id, hive_id, inspected_at DESC);` + partielle indekser for `swarm_reports.status` og `hives` geo. (1t, agent 6/12)
4. **Toast i global `mutationCache.onError`** + fjern repeterte per-mutation onError. (1t, agent 5)
5. **FAB-kontrast** `kalender/index.tsx:423` til mørk tekst + grep andre hvit-på-honey. (1t, agent 9)
6. **Fjern betalt kjøp fra onboarding-knapp** + rett «30 dager»→«14 dager» overalt. (2-3t, agent 3/11)
7. **revenuecat-webhook**: flytt idempotens-INSERT etter vellykket update. (1-2t, agent 8/12)
8. **Fjern hardkodet anon-JWT i 0035** + verifiser secret-rotasjon i Dashboard. (45 min, agent 8)
9. **DELETE-policy hive_disease_flags** + slett Storage-fil i `deleteInspectionMedia`. (30 min, agent 8)
10. **Ensrett fanenavn** «Info»→«Lær» + Kuber tom-tilstand til trykkbar CTA. (1t, agent 1)

---

## 6. Sprint 1 (2 uker) — 5 viktigste for konvertering

1. **Fiks aktiveringstrakten** (agent 11): onboarding/splash ut av auth-guard så AI-aha-momentet vises før registrering + auto-confirm av e-post. Største enkeltgevinst på aktivering. (~4-7t)
2. **Trial-konsistens fullført** (agent 3/11): trial tydelig + aktivt oppgraderingstilbud flyttet til etter første inspeksjon. Lukk villedende-markedsføring-risikoen. (inkluderer denne-uken-punkt 6)
3. **Styrk Profesjonell + Lag verdiforslag** (agent 3): konkret statistikk/høst/vekt-verdi i UpgradeModal, per-dag-prisforankring, social proof; betinget Lag-gate (skjul for små Starter-brukere) + Sentry-logging på manglende RC-pakke. (~5-6t)
4. **Øk oppdagbarhet av AI-varroa** (agent 1/3): teaser på Hjem/kubeprofil + tydeligere demo-styling i Step3. AI er hovddifferensiatoren men ligger 3+ trykk dypt. (~2-3t)
5. **Ytelse + robusthet for felt** (agent 6/7): expo-image disk-cache, stabiliser kubeliste-render, dropp dobbel inspeksjonshenting på hjem, offline-persistering av cache. Birøkteren i felt med dårlig dekning må se cachet data. (~4-5t)

---

## 7. Roadmap (3 måneder) — strategisk

- **Skaler `weekly-hive-alerts`** (agent 12): paginer per brukerbatch eller flytt utvelgelse til SQL-RPC/materialized view. Primær skaleringsblokkering forbi ~5k brukere — kritisk før vekst mot 100→1000+ brukere. Velg samtidig én kilde for «inspeksjon forfalt» (server) og fjern lokal duplikat (agent 10).
- **Langtidsretention** (agent 10): år-for-år honning/varroa-progresjon + milepæl-badges (bruker eksisterende harvest/inspection-data); re-engagement-gren basert på `last_seen`; aktiver lese-tilgang til delte Lag-kuber for faktisk nettverkseffekt.
- **Faglig domeneutvidelse** (agent 4): sentraliser varroaterskler med kilder; utvid inspeksjonsskjema (droneyngel, lukt, koble `diseaseObservations` til sykdomslista); strukturer behandlingslogg for Mattilsynet-journalplikt (virkestoff-enum, dose, tilbakeholdelse) — også et reelt Profesjonell-tier-salgsargument.
- **Designsystem-håndhevelse** (agent 2): innfør `Typography`-skalaen overalt (sikrer Manrope-rendering — 155 fontWeight vs 43 fontFamily), eliminer rå hex i kart/score-farger, bytt emoji til vektorikoner.
- **A11y-løft til WCAG 2.1 AA** (agent 9): erstatt `muted`→`mid` for liten tekst, aktiver fontskalering (minHeight i stedet for faste høyder), a11y-labels på mood/kalender/navBtn. Norsk lovkrav.
- **Arkitektur-opprydding** (agent 5): ekstraher `lib/storageUpload.ts` (duplisert opplasting), del opp `hjem/index.tsx` (976 linjer) i seksjoner + `useDashboardData`-hook, lokale ErrorBoundaries på wizard/kubeprofil (agent 7).
- **TTL-cleanup** `revenuecat_processed_events` + analyze-varroa TOCTOU-fiks (agent 8/12).

---

## 8. Ikke-prioriter nå (unngå prematur optimalisering)

- **Pris-A/B-test (Pro 99kr, lavere Lag)** — vent til faktisk konverteringsdata fra reelle brukere finnes (agent 3).
- **Paginering av inspeksjonshistorikk / Flat+memo InspectionRow** — 50-grensen holder ved nåværende datavolum (agent 1/6 LAV).
- **`get_map_hives` partiell geo-indeks utover de tre kjerneindeksene** — akseptabelt per-bruker nå (agent 12 MEDIUM).
- **CORS-innstramming på Edge Functions** — native-app, auth kreves; kun relevant ved web-klient (agent 8 LAV).
- **Soneavhengig sesong-checklist, avlslinje-felt, separat aggresjon/ro-skala** — verdifullt men nisje; etter kjerneaktivering virker (agent 4 LAV).
- **Splash-optimalisering, passordkrav-konsistens, dekorativ-emoji-skjuling** — kosmetisk polish, samle i én bolk senere.
- **Konstant-tid webhook-compare, pg_net header-logging** — lav reell risiko bak auth; gjør sammen med webhook-transaksjonsfiksen, ikke separat (agent 8).

---

## 9. Appens nåværende tilstand

BiVokter har et solid, faglig sterkt domene og en gjennomtenkt arkitektur, men er **ikke helt klar til å nå 100 betalende brukere før denne-uken-fiksene er gjort** — særlig Sentry-krasjen, trial-forvirringen (Play Store-risiko) og webhook-inntektslekkasjen; med disse pluss aktiveringstrakt-fiksene i Sprint 1 er den godt posisjonert for målet.
