# Syntese — Prioritert handlingsplan for BiVokter

Multi-agent review v3 (13 agenter) konsolidert. Generert: 2026-06-22.
Kontekst: pre-lansering (intern testing Play Console, versionCode ~22), én utvikler + Claude, mål 100 betalende første sesong. Juni = svermetid/høysesong — time-to-market har egenverdi.

**Rapporter lest:** agent-01 … agent-13 (13/13) + arkivert syntese 2026-06-18.
**Migrasjonsstatus:** 0001–0052 på disk (0052 kjørt i prod). **Korreksjon til Agent 4:** migrasjon **0048_disease_notifiable_fixes.sql** finnes og er kjørt — den retter EFB→meldepliktig og legger til liten kubebille i DB. Agent 4 overså denne (se §3).
**Status siden 18. juni:** Forrige sprint-batch er verifisert: RevenueCat tom-nøkkel kaster, weekly-hive-alerts fail-closed (v10), 0052 dropper utdatert 0013-policy, .env.example komplett, kontrast-pass, ActivationGuide steg 2, rapport `Promise.allSettled`, Apistan fjernet fra **constants/diseases.ts** (men IKKE fra DB-seed — se KRITISK). Reviewen er moden: ett gjenstående reelt KRITISK-likeverdig funn (Apistan i DB + behandlingslogg).

---

## 1. Konsensus-funn (matrise)

Funn rapportert uavhengig av 2+ agenter. 3+ agenter øverst (høyest reliabilitet).

| # | Funn | Agenter | Grad |
|---|------|---------|------|
| K1 | **Kubefoto lagres som 1-årig signed URL** — dør stille etter 365 dager/nøkkelrotasjon; bør lagre path + signere ved lesing | **7, 8, 12** (3) | MEDIUM |
| K2 | **`select('*')` i ~15 queries** — henter `notes` + lang `photo_url` for hele kubelista | **5, 6, 12** (3) | MEDIUM |
| K3 | **`weekly-hive-alerts` global sweep** (alle profiler/kuber/inspeksjoner i 3 globale kall) — skaleringsblokkering ved 5–10k brukere | **10 (win-back), 12 (sweep)** | MEDIUM/HØY |
| K4 | **`hjem/index.tsx` >800 linjer (994) + henter 500 fulle inspeksjonsrader** for to teller-/kortbruk | **5 (linjer), 6 (payload)** | MEDIUM |
| K5 | **Emoji-faneikoner + dekor-emoji** — leketøyspreg på betal-app + TalkBack leser rå emoji; aktiv fane vises kun via størrelse/opasitet | **2 (design), 9 (a11y)** | MEDIUM |
| K6 | **Manglende `fontFamily` på konverterings-/førsteinntrykksflater** (UpgradeModal, auth, Toast, Input) → systemfont på salgsflaten | **2 (HØY), 9 (indirekte)** | MEDIUM |
| K7 | **Varroa-komma + 1-års signed URL** | **7, 5/8/12 (URL)** | LAV/MEDIUM |
| K8 | **AI-varroa-oppdagbarhet svak** + `diseaseObservations`-felt plumbet men aldri eksponert i wizard | **1 (synlighet), 4 (domene-felt)** | MEDIUM |
| K9 | **Apistan vises fortsatt til brukere** (DB-seed-tekst + behandlingslogg-produktliste) trass i TS-fiks | **4 (KRITISK)** + bekreftet av syntese | KRITISK-likeverdig |
| K10 | **Ingen offline-evne / NetInfo** (in-memory cache, retry:2 med rå feilmelding) | **7 (HØY)** + relatert 12 | HØY (utsatt) |
| K11 | **Ingen analytics/event-instrumentering** — 100-betalende-målet er umålbart | **10 (HØY)** + relatert 13 | HØY |
| K12 | **AI-kvote TOCTOU + manglende body-grense/Anthropic-timeout** i `analyze-varroa` | **8, 12** (2) | MEDIUM |

Merk: **0 KRITISK-konsensus blant 3+-funn.** Det eneste KRITISK-likeverdige (K9 Apistan) er ett-agent men verifisert av syntese. De fleste 3-agent-funnene (K1, K2) er hygiene/skalering, ikke lanseringsblokkere.

---

## 2. Konflikter — løst eksplisitt

**Konflikt 1 — Apistan «fikset» vs. «kosmetisk» (orkestrator-rapport vs. Agent 4). LØST: Agent 4 har rett om Apistan, men feil om EFB/kubebille.**
Orkestratoren rapporterte til brukeren at «Apistan er fjernet». Agent 4 hevder fiksen var kosmetisk fordi appen leser DB. Jeg verifiserte selv (se §3): appen leser DB (`fetchDiseases`), TS er kun `placeholderData`. **Apistan står fortsatt i DB-seed (`0026:16,30`) OG i behandlingslogg-produktlista (`TreatmentSection.tsx:24`).** Orkestratorens påstand var derfor ufullstendig/feil for sluttbruker — Apistan vises fortsatt i prod. **MEN** Agent 4 tok feil om at EFB-/kubebille-fiksene «aldri traff DB»: migrasjon **0048** retter begge i DB. **Avgjørelse/tiltak:** Eskalér Apistan som KRITISK-likeverdig. Ny migrasjon `UPDATE diseases SET treatment/seasonal_treatment ...` for varroamidd som fjerner Apistan, + fjern 'Apistan' fra `PRODUCTS` i TreatmentSection.tsx. EFB/kubebille trenger INGEN handling (allerede i prod via 0048).

**Konflikt 2 — Polere vs. shippe (Agent 2/9 vs. 13).** Agent 2 vil ha Typography-migrering (L) + lucide; Agent 9 vil ha fullt a11y-løft. Agent 13 viser restrisiko er manuelle dashboard-steg. **Avgjørelse:** Ship-orientert. Gjør kun billig design/a11y som treffer konvertering eller lovrisiko: `fontFamily` på UpgradeModal/auth/Toast (M), Toast `liveRegion`/`role=alert` (S), tekstskalering `minHeight` (M, UU-lovpålagt). Typography-/Radii-migrering + lucide utsettes.

**Konflikt 3 — Flere varsler vs. varslingstretthet (Agent 10 internt: win-back vs. dobbel forfalt-varsling).** **Avgjørelse:** Ikke øk varselvolum før kilde-konsolidering. La server eie «forfalt inspeksjon»; behold lokal kun som fallback uten push_token. Win-back/`last_seen_at` utsettes til etter lansering (krever uansett sweep-endring sammen med K3).

**Konflikt 4 — Aktiver feed vs. ikke (Agent 1/5 «sovende kode» vs. Agent 10 «ikke aktiver»).** **Avgjørelse:** Følg Agent 10 — ikke aktiver feed før >100 brukere. Tomt sosialt rom signaliserer død app. La `href:null`.

**Konflikt 5 — `select('*')`-slanking vs. defensiv mapX (Agent 6/12 vs. 5).** **Avgjørelse:** Ingen reell konflikt — kolonnelister utledes fra mapX-feltene. Lav gevinst ved <100 brukere → utsettes, unntatt `fetchHives` (dropp `notes`).

---

## 3. Falsifisering — stikkprøve 5 KRITISK/HØY-funn

Alle 5 lest i koden av syntese-agenten selv.

| # | Funn | Kilde | Verifikat | Holdt? |
|---|------|-------|-----------|--------|
| 1 | **Apistan vises fortsatt i prod via DB-seed (TS-fiks kosmetisk)** | A4 KRITISK | `services/diseases.ts:4-11` leser DB; `laer/index.tsx:69,72` bruker DB med `DISEASES` kun `placeholderData`. `0026:16,30` har Apistan; INGEN senere migrasjon retter treatment-teksten (grep). `TreatmentSection.tsx:24` har 'Apistan' i produktliste. | ✅ (Apistan-delen) |
| 1b | **EFB ikke-meldepliktig + kubebille mangler i DB** | A4 KRITISK | **FALSK** — `0048_disease_notifiable_fixes.sql` (på disk, kjørt) setter EFB `is_notifiable=true` (linje 4-6) og INSERT-er liten kubebille (linje 9-27). Agent 4 leste ikke 0048. | ❌ (delvis feil funn) |
| 2 | **weekly-hive-alerts fail-closed** | A8 (nå fikset) | `weekly-hive-alerts/index.ts:38-41` → `if (!alertsSecret || header !== secret) return 401`. Bekreftet. | ✅ |
| 3 | **Ingen analytics i kildekode** | A10 HØY | Grep `analytics\|posthog\|amplitude\|mixpanel\|trackEvent\|logEvent` i `services/` → **0 treff**. | ✅ |
| 4 | **Apistan i behandlingslogg-produktliste** | A4 HØY | `TreatmentSection.tsx:17-26` `PRODUCTS` inneholder `'Apistan'`. | ✅ |
| 5 | **App leser sykdommer fra DB, ikke TS-konstant** | A4 (premiss) | `services/diseases.ts:7` `.from('diseases').select('*')`; `laer/index.tsx:69` `useQuery(... placeholderData: DISEASES)`. DB er kilde, TS kun fallback. | ✅ |

**Resultat: 4,5/5 holdt.** Apistan-funnet (#1, #4, #5) er **bekreftet og eskaleres**: Apistan vises fortsatt til brukere i prod via DB-seed-tekst og behandlingslogg-produktliste, trass i at `constants/diseases.ts` ble endret. Orkestratorens «Apistan er fjernet»-rapport var ufullstendig.

**Tillitsjustering Agent 4:** Funnet om EFB/kubebille (#1b) er **feil** — 0048 retter begge i DB, men Agent 4 leste ikke migrasjonen. Senk tillit til Agent 4s øvrige DB-relaterte påstander: spesielt bør «steinyngel + trakemidd mangler» og «sværm-stavefeil i DB» dobbeltsjekkes mot faktisk DB-tilstand før handling, siden Agent 4 demonstrert ikke leste alle migrasjoner. Agent 4s rene TS-/komponent-funn (TreatmentSection, wizard `diseaseObservations`, varroaterskler) står.

---

## 4. Topp-20 ROI-tabell

Score = (2E + 2R) × I / 10. E = effekt (1–5). R = risikoreduksjon (1–5, 5=KRITISK). I = innsats (1=XL … 5=S). Sortert synkende.

| # | Tiltak | E | R | I | Score | Kilde | Filer | Innsats |
|---|--------|---|---|---|-------|-------|-------|---------|
| 1 | **Fjern Apistan fra DB-seed + behandlingslogg** (legemiddel-/lovrisiko, ikke MT-godkjent) | 3 | 5 | 5 | **8.0** | A4 | ny migrasjon (`UPDATE diseases`), `TreatmentSection.tsx:24` | S |
| 2 | Drop/verifiser 0013-policy effekt (allerede gjort i 0052 — verifiser trial kube #4) | 4 | 3 | 5 | **7.0** | A3/A12 | 0052, trial-testbruker | S |
| 3 | Steg 2 ActivationGuide → inspeksjon (verifisert gjort — regresjonstest) | 4 | 1 | 5 | **5.0** | A1/A11 | `ActivationGuide.tsx:108-111` | S |
| 4 | Minimal analytics (6–8 events) — måle 100-betalende | 5 | 2 | 3 | **4.2** | A10 | nytt `lib/analytics.ts`, `_layout.tsx:45` | M |
| 5 | DELETE-policy på `hive_disease_flags` (GDPR-residual helsedata) | 2 | 4 | 4 | **4.8** | A8 | ny migrasjon | S |
| 6 | Body-grense (413) + Anthropic-timeout i `analyze-varroa` | 2 | 4 | 4 | **4.8** | A8/A12 | `analyze-varroa/index.ts:88,99` | S |
| 7 | Reserver AI-kvote-slot før kall (TOCTOU) | 2 | 4 | 4 | **4.8** | A8/A12 | `analyze-varroa/index.ts:72-85,172` | M |
| 8 | Toast `liveRegion`+`role=alert` (mutation-feil annonseres aldri for TalkBack) | 2 | 4 | 5 | **6.0** | A9 | `Toast.tsx:31-35` | S |
| 9 | `fontFamily` på UpgradeModal + auth + Toast (salgsflater i systemfont) | 4 | 1 | 4 | **4.0** | A2 | `UpgradeModal.tsx`, `login/register.tsx`, `Toast.tsx` | M |
| 10 | Resize kube-/feed-foto før opplasting (gjenbruk Step3-mønster) | 3 | 2 | 5 | **5.0** | A6 | `kuber/ny.tsx`, `feed/ny.tsx`, `hive.ts` | S |
| 11 | Trial-utløps-funnel (push dag 12 + utløpsmodal m/årstilbud) | 5 | 1 | 3 | **3.6** | A3 | `hooks/useEffectiveTier.ts`, ny modal | M |
| 12 | Lag-kontekst i samarbeid-UpgradeModal (`title`/`subtitle`) | 3 | 1 | 5 | **4.0** | A3 | `kuber/[id]/index.tsx:378-381` | S |
| 13 | Tekstskalering `minHeight` + `maxFontSizeMultiplier` (UU-lovpålagt) | 2 | 4 | 4 | **4.8** | A9 | `Button.tsx`, `_layout.tsx`, Step4, HiveCard | M |
| 14 | Stabiliser kubeliste (useMemo + useCallback-renderItem) | 3 | 1 | 4 | **3.2** | A6 | `kuber/index.tsx:87-101,218` | S–M |
| 15 | GDPR-dataeksport (art. 20) — Edge Function dump til JSON | 2 | 4 | 3 | **3.6** | A8 | ny edge function + profil-UI | M |
| 16 | Lagre hive-photo path, signer ved lesing (3-agent K1) | 2 | 3 | 3 | **3.0** | A7/A8/A12 | `services/hive.ts:73-78` | M |
| 17 | Slank `fetchAllInspections` på dashboard (count + slank kolonne) | 3 | 2 | 4 | **4.0** | A6 | `hjem/index.tsx:139-143` | S–M |
| 18 | Skjermleser-labels på vekt/behandling/dronning/høsting/kalender-modaler | 2 | 3 | 3 | **3.0** | A9 | `WeightSection/TreatmentSection/QueenSection/...` | M |
| 19 | Sesong-urgency + prisanker i UpgradeModal/hjem-nudge | 3 | 1 | 5 | **4.0** | A3 | `UpgradeModal.tsx`, `hjem/index.tsx:402` | S |
| 20 | Eksponer sykdom/droneyngel/lukt i wizard (`diseaseObservations`) | 3 | 2 | 3 | **3.0** | A4 | `Step2/3.tsx`, `inspection.ts` | M |

(Lav score-spredning fordi det ikke gjenstår KRITISK med høy R+E samtidig — typisk moden kodebase.)

---

## 5. Denne uken (<8 t totalt) — rask-fixer

Rekkefølge etter ROI. Samlet ~6–7 t.

1. **Fjern Apistan fra DB + behandlingslogg** (~45 min) — ny migrasjon `UPDATE public.diseases SET treatment = '...(uten Apistan)...', seasonal_treatment = '...' WHERE slug='varroamidd'`; bytt høst-tipset «sett inn Apistan-strimler» → «ApiLife Var eller Apivar-gelé». Fjern `'Apistan'` fra `PRODUCTS` i `TreatmentSection.tsx:24`.
   *Verifikasjon:* SQL `SELECT treatment FROM diseases WHERE slug='varroamidd'` → ingen «Apistan»; åpne varroa-sykdomssiden + behandlingslogg-produktvelger i appen og bekreft borte. Grep `Apistan` i repo → 0 treff (etter DB-fix gjenstår kun seed-historikk; ev. rett 0026 også for nye miljøer).
2. **DELETE-policy `hive_disease_flags`** (~15 min, migrasjon) — `CREATE POLICY ... FOR DELETE USING (exists (select 1 from hives h where h.id = hive_id and h.user_id = (select auth.uid())))`.
   *Verifikasjon:* Bruker kan slette eget sykdomsflagg; ikke annens.
3. **Toast `liveRegion`+`role=alert`** (~15 min) — `Toast.tsx:31-35`: `accessibilityLiveRegion="polite"` + `accessibilityRole="alert"` på `Animated.View`.
   *Verifikasjon:* TalkBack annonserer feil-toast.
4. **analyze-varroa body-grense + Anthropic-timeout** (~30 min) — avvis `imageBase64.length > 9_400_000` med 413; `signal: AbortSignal.timeout(25_000)` på Anthropic-fetch.
   *Verifikasjon:* For stort bilde → 413; treg AI → abort ikke hengende invokasjon.
5. **Verifiser trial kube #4** (~30 min) — sett `trial_expires_at` fram i tid + `subscription_tier='starter'`, opprett kube #4. (Kode allerede fikset i 0052; dette er regresjonsverifikasjon.)
   *Verifikasjon:* Trial-bruker oppretter kube #4; vanlig starter med 3 aktive får norsk trigger-feil.
6. **Resize kube-/feed-foto** (~30 min) — `ImageManipulator.manipulateAsync(uri,[{resize:{width:1600}}],{compress:0.7})` i `normalizePhotoUri` + `feed/ny.pickImage`.
   *Verifikasjon:* Opplastet kubefoto ~<300 kB i storage.
7. **Lag-kontekst i samarbeid-modal + prisanker** (~30 min) — `title="Samarbeid med Lag"`/subtitle på modal i `kuber/[id]/index.tsx:378`; «fra 33 kr/mnd» i hjem-nudge.
   *Verifikasjon:* Trykk «Samarbeid» → modal viser Lag-kontekst.
8. **Stabiliser kubeliste** (~1 t) — `useMemo` på `filtered`/`hivesWithScore`, `useCallback`-renderItem i `kuber/index.tsx`.
   *Verifikasjon:* HiveCard-memo treffer (ingen re-render ved filter ved 20+ kuber).

---

## 6. Sprint (2 uker) — de 5 viktigste for lansering + konvertering

I rekkefølge, med avhengigheter.

1. **Alle «denne uken»-fiksene over** (avhengighet: ingen). Apistan-fjerning er KRITISK-likeverdig ship-blokker; resten billig konvertering/UU/sikkerhet. Må være ferdig før resten.
2. **Minimal analytics (6–8 events)** — `app_open`, `hive_created`, `inspection_completed`, `ai_analysis_run`, `upgrade_modal_shown`, `purchase_completed`, `push_opened`, `report_generated`. Hekt `push_opened` på `_layout.tsx:45`. *MÅ inn før lansering* — ellers er 100-betalende-målet og effekten av punkt 4 blindflyging.
3. **`fontFamily` på salgsflater** (UpgradeModal, auth, Toast, Input) + tekstskalering `minHeight`. *Avhengighet: Toast-fonten gjøres samtidig med Toast-liveRegion (uke 1) for å unngå dobbeltarbeid.* UU-delen er lovpålagt.
4. **Trial-utløps-funnel** — scheduled push dag 12 + utløpsmodal med årsrabatt ved første åpning etter utløp. *Avhengighet: trial server-side (verifisert i uke 1) + analytics (punkt 2) for å måle konvertering.*
5. **GDPR-dataeksport (art. 20)** — Edge Function som dumper brukerrader til JSON, gratis i profil. *Avhengighet: ingen. Lovpålagt før offentlig lansering; ikke intern-testing-blokker.* (`hive_disease_flags` DELETE-policy gjort i uke 1.)

---

## 7. Etter lansering (3 mnd) — strategisk

- **`weekly-hive-alerts` skalering** (A12 HØY) — paginer per brukerbatch eller SQL-RPC for kandidatutvelgelse. Degraderer først ved 5–10k brukere; ufarlig <1k. Gjøres sammen med `last_seen_at` for win-back.
- **Win-back + år-for-år-progresjon** (A10) — `last_seen_at` + reaktivering ved 30/60 dager; fjorårslinje i SeasonSummaryCard + milepæl-kort. Kjernedriver for langtidsretention; krever én sesong data for å være meningsfull.
- **Offline-persistering + NetInfo** (A7 HØY) — `persistQueryClient` + `onlineManager` + offline-banner. Reell verdi i felt; appen krasjer ikke uten det ved lansering.
- **AI-kvote-TOCTOU atomisk RPC** (A8/A12) — hvis kvotemisbruk observeres i analytics. Body-grense/timeout gjøres i uke 1.
- **Domeneutvidelser** (A4) — eksponer `diseaseObservations` i wizard (datalaget finnes), strukturert behandlingslogg (virkestoff-enum + tilbakeholdelse), maursyre i høst-anbefaling, dobbeltsjekk steinyngel/trakemidd mot DB (lavere tillit til Agent 4 her). Hever faglig troverdighet; ikke lanseringskritisk.
- **Ytelse/hygiene** (A5/A6/A12) — splitt `hjem/index.tsx`, `lib/storageUpload.ts` + `lib/date.ts`-konsolidering, harden `fetchMapHives`/`feed.toggleLike`, hive-photo signer-ved-lesing (3-agent K1), `select('*')`→kolonnelister, CHECK-constraints, SELECT-policy `(SELECT auth.uid())`-wrap, processed_events-TTL, `await` token-nulling. Lav reell risiko ved <100 brukere.
- **lucide-react-native + Typography/Radii-migrering + expo-image** (A2/A6) — størst opplevd profesjonalitetsløft, men L-innsats. Bevisst utsatt.
- **HoneyWidget montering + dato-seedet tipskort + auto-neste-inspeksjon** (A10) — billige retention-løft fra eksisterende kode/data.
- **E-postverifisering med deep-link** (A11) — `emailRedirectTo` + `auth/callback`-rute (mønster i `googleAuth.ts`). Fjerner momentum-tap i e-posttrakten; Google-veien fungerer i mellomtiden.
- **AppState token-refresh + lokal ErrorBoundary + betinget retry/norsk feiloversettelse** (A7) — robusthet; opportunistisk.

---

## 8. Ikke gjør (nå) — med begrunnelse

- **Typography-/Radii-full-migrering (A2, L)** — prematur polering; flytter ikke konvertering. Gjør kun salgsflate-`fontFamily`.
- **Aktivere feed-fanen (A1 sovende, mot A10)** — tomt sosialt rom ved <100 brukere skader mer enn det gagner. Hold `href:null`.
- **lucide-react-native + expo-image nå (A2/A6)** — M-innsats, marginal gevinst ved få kuber; etter lansering.
- **Offline-persistering før lansering (A7)** — verdifullt men ikke intern-testing-blokker; appen krasjer ikke uten det.
- **`select('*')`-slanking utover `fetchHives` (A5/A6/A12)** — neglisjerbar gevinst <100 brukere; risiko for å bryte mapX ved hastverk.
- **`weekly-hive-alerts`-paginering nå (A12)** — degraderer først ved 5–10k brukere. Ikke lanseringsblokker.
- **Splitte `hjem/index.tsx` nå (A5 HØY)** — testbarhetsgjeld, ikke brukerrisiko. Refaktorering rett før lansering = regresjonsrisiko. Etterpå.
- **Steinyngel/trakemidd-tillegg + sværm-stavefiks nå (A4)** — Agent 4 viste lav DB-tillit (overså 0048). Dobbeltsjekk faktisk DB-tilstand før handling; uansett ikke lanseringskritisk.
- **30 dagers trial / gratis lead-magnet AI-analyse (A3)** — eksperiment, ikke blokker. Test etter analytics er på plass.
- **iOS RevenueCat-arbeid** — utenfor scope (Android-only lansering per CLAUDE.md).

---

## 9. Go / No-go

**GO for intern/lukket testing i nåværende tilstand. Betinget GO for åpen testing/produksjon.**

Det finnes **ett gjenstående KRITISK-likeverdig kodefunn** (Apistan i DB-seed + behandlingslogg) som ikke er en krasj-blokker, men en legemiddel-/lovrisiko: appen anbefaler aktivt et middel uten norsk markedsføringstillatelse. Appen kan publiseres til lukket testing i dag, men Apistan bør fjernes før åpen/produksjons-lansering.

Forrige rundes ship-blokkere er alle lukket og verifisert (RevenueCat fail-fast, fail-closed weekly-alerts, 0052 trial-policy, EFB/kubebille via 0048).

**Kode-/SQL-blokkere for åpen testing/produksjon (samlet ~1 dag):**
1. **Fjern Apistan fra DB-seed + `TreatmentSection.tsx`** (S) — eneste KRITISK-likeverdige. Lovrisiko. *(¾ t)*
2. DELETE-policy `hive_disease_flags` (S) — GDPR residual helsedata. *(¼ t)*
3. analyze-varroa body-grense + Anthropic-timeout (S) — DoS/kostnadsvektor. *(½ t)*
4. Verifiser trial kube #4 fungerer (allerede kodefikset i 0052). *(½ t test)*

**Manuelle dashboard-blokkere (per `docs/lansering-sjekkliste.md`, ~1 dag):**
5. Last opp v21+-AAB til Play (v20 har brutt bildevalg).
6. Data safety-URL + datainnsamlingserklæring (inkl. Anthropic som databehandler/USA-overføring — A8 LAV).
7. Supabase Pro + PITR (single-point-of-truth uten backup i dag).
8. RevenueCat-produkter aktive i Play Console + testkjøp verifisert.

**Sterkt anbefalt før åpen lansering (ikke hard blokker, ~1 dag):**
9. Minimal analytics (uten dette er 100-betalende-målet umålbart).
10. GDPR-dataeksport (art. 20).

**Samlet innsatsestimat blokkere: ~1 dag kode/SQL + ~1 dag manuelle dashboard-steg = ~2 dager til produksjonsklar.** Ingen blokkere er arkitektoniske; alt er punktfikser eller dashboard-handlinger.
