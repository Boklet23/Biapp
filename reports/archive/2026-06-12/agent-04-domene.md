# Agent 4 — Birøkterfaglig domeneanalyse

## Metainfo
- **Filer lest:** `constants/varroa.ts`, `seasonChecklist.ts`, `seasonReminders.ts`, `seasonGuide.ts`, `pollenCalendar.ts`, `diseases.ts`, `beginnerGuide.ts`, `components/inspection/Step1–4.tsx`, `services/inspection.ts`, `services/treatment.ts`, `services/queen.ts`, `components/hive/HealthScoreSection.tsx`, `TreatmentRecommendationSection.tsx`, `QueenSection.tsx`, `app/(app)/(tabs)/laer/[slug].tsx`, `supabase/migrations/0006_treatments.sql`
- **Filer ikke funnet:** `constants/diseases.ts` ligger i `constants/` (ikke 0025-seed lest i detalj — DB-fallback er `diseases.ts`); `kuber/[id]/index.tsx` lest indirekte via seksjonskomponentene
- **Diff mot forrige review:** Lest arkiv (`reports/archive/2026-06-10/agent-04-domene.md`). **FIKSET siden sist:** Varroaterskler er nå sentralisert i `constants/varroa.ts` og både `HealthScoreSection` og `TreatmentRecommendationSection` importerer derfra (`varroaThresholds()`) — fjorårets HØY-inkonsistens (limbunn 10 vs 3) er løst. Inspeksjonsskjema, behandlingslogg-struktur og dronning-avlslinje er **ikke** endret — gjentas her der fortsatt gyldig.

## Sammendrag
Domenet er sterkt norsk-forankret og forbedret siden sist. Men jeg fant en ny **faglig feil med konsekvens for sykdomskontroll**: europeisk yngelråte er feilmerket som ikke-meldepliktig, og to–tre meldepliktige sykdommer (liten kubebille, steinyngel, trakémidd) mangler helt. Inspeksjonsskjemaet fanger fortsatt ikke droneyngel/lukt/sykdomstegn, og behandlingsloggen mangler journalstruktur Mattilsynet/legemiddelmyndighet forventer.

## Fungerer godt (ikke rør)
1. **Sentraliserte varroaterskler** (`constants/varroa.ts`) — metodespesifikke, dokumenterte, delt mellom moduler. Solid fiks.
2. **Meldeplikt-banner** i sykdomsdetalj (`laer/[slug].tsx:69-75`) med Mattilsynet-nummer — god UX når flagget er riktig satt.
3. **Sykdomsbeskrivelsene** (AFB pinnetest >2 cm, oksalsyre kun yngelfri) er faglig presise.
4. **Nybegynnerguiden** (`beginnerGuide.ts`) er bred og norsk-praktisk (Husdyrregisteret, 15–20 kg vinterfôr, fargesyklus for merking).
5. **Sesongstruktur** dekker norsk årssyklus inkl. oksalsyre-vindu og lyng.

## Funn

**[HØY]** `constants/diseases.ts:53` — Europeisk yngelråte merket `isNotifiable: false`. Mattilsynet krever **umiddelbar melding** ved mistanke om europeisk yngelråte (B-sykdom), på linje med amerikansk yngelråte. — Birøkteren får ikke meldeplikt-banneret og kan unnlate lovpålagt varsling → spredningsrisiko. — Sett `isNotifiable: true` og kvalitetssikre EFB-teksten (antibiotika kun på veterinærdirektiv stemmer). — Innsats: S — Konfidens: HØY. ([Mattilsynet: krav til undersøkelse for visse bisykdommer](https://www.mattilsynet.no/dyr/produksjonsdyr/bier/krav-til-dyrehelse-ved-flytting-av-bier-i-norge/krav-til-undersokelse-for-visse-bisykdommer))

**[HØY]** `constants/diseases.ts` (hele lista) — Meldepliktige sykdommer **mangler**: **liten kubebille (Aethina tumida)** — den viktigste eksotiske trusselen som overvåkes i EU, **steinyngel (Aspergillus)** og **trakémidd (Acarapis woodi)**. Lista har Tropilaelaps men ikke kubebille. — En norsk birøkter som ser kubebille finner ingen oppføring og melder kanskje ikke. — Legg til minst liten kubebille (notifiable, med symptom: biller/larver i bunnbrett og lagerrom) og steinyngel. — Innsats: M — Konfidens: HØY. ([Mattilsynet: liten kubebille](https://www.mattilsynet.no/dyr/dyresykdommer/liten-kubebille/hva-gjores-for-a-bekjempe-liten-kubebille-i-europa), [Forskrift om birøkt](https://lovdata.no/dokument/SFO/forskrift/2009-04-06-416))

**[HØY]** `components/inspection/Step2.tsx` + `Step4.tsx` + `services/inspection.ts:27,107` — Inspeksjonen mangler sentrale observasjonsfelt: **droneyngel/leggarbeider-tegn** (dronningløshets- og varroaindikator), **lukt** (yngelråte-screening), og **sykdomstegn** — feltet `diseaseObservations` er plumbet gjennom typen og `createInspection`, men **eksponeres ingen steder i wizarden** (Step1–4 samler kun ramme-tall, dronning-toggles, varroa, humør, foto). — Tidlige sykdoms-/svermsignaler registreres ikke; død datavei. — Legg til toggles for droneyngel + lukt-flagg i Step2 og koble `diseaseObservations` til `DISEASES`-lista. — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `services/treatment.ts` + `0006_treatments.sql:7-9` — Behandlingsloggen er fritekst (`product text`, `dose text`, placeholder `'Oxalsyre, ApiLife Var'` i Step3:218). Mangler **virkestoff**, **tilbakeholdelsestid** og journalstruktur. Birøktere er journalpliktige og oksalsyre/maursyre har tilbakeholdelseskrav. — Ingen etterprøvbar behandlingsjournal for Mattilsynet/mistanke. — Strukturér med virkestoff-enum (oksalsyre-drypp/-damp, maursyre/MAQS, ApiLife Var/timol, Apivar) + dose/tilbakeholdelse. — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `TreatmentRecommendationSection.tsx:68-107` — Behandlingstiming er koblet til **kalendermåned**, ikke koloniens yngelstatus. Vinter-oksalsyre anbefales på måned 12/1 uavhengig av om kolonien faktisk er yngelfri (forutsetningen for effekt). Maursyre/MAQS — det eneste midlet som virker gjennom forseglet yngel, relevant for norsk sen-sommer med yngel — nevnes ikke i anbefalingene (kun Apivar/oksalsyre). — Ufullstendig og potensielt feiltimet råd. — Koble vinter-oksalsyre til registrert yngelfri-status og legg maursyre inn for aug/sep. — Innsats: M — Konfidens: MEDIUM.

**[MEDIUM]** `constants/beginnerGuide.ts:78,302` & `:182,322,329,186,198` — Språk-/terminologifeil: **"Amerikansk yngelrotte"** (2×) skal være «yngel*råte*» (rotte = gnager). **"Svirming/svirming/sverver"** brukes om sverming gjennom hele svermforebygging-artikkelen — korrekt norsk er «sverming/svermer» (slug heter riktig `svermforebygging`). Også «vokseldansen» (riktig: vrikke-/svingedans) og «hofstaten» (riktig: hoffstaten). — Svekker faglig troverdighet i en betalt app. — Korrekturles guiden. — Innsats: S — Konfidens: HØY.

**[LAV]** `Step3.tsx:21` — `VARROA_METHODS = ['alkoholspyling','sukkerpuder','limbunn']`. «Sukkerrull» (rist 300 bier i melis, %-basis) og «sukkerpuder» (drysse på bunnbrett, nedfall) er to ulike metoder med ulik terskelbasis, men slås her sammen. Konsistent med `varroa.ts` (begge = per 100 bier), men birøktere skiller dem. — Mindre tolkningsrisiko. — Vurder å skille metodene. — Innsats: S — Konfidens: MEDIUM.

**[LAV]** `QueenSection.tsx:10` & `constants/seasonChecklist.ts` — Dronning mangler **avlslinje/morlinje** og **auto-foreslått merkefarge fra årstall** (hvit=1/6, gul=2/7 … — fargesyklusen er beskrevet i guiden men ikke validert i QueenSection). Sesongchecklist er statisk uten **klimasone-justering** (sone 1–8) og mangler eksplisitt **vintertaps-/vårdødelighet-registrering i mars** (NBL fører nasjonal vintertapsstatistikk). — Begrenset for seriøse birøktere; checklist passer Sør-Norge bedre enn Nord. — Auto-foreslå merkefarge fra `introducedAt`; legg vårtaps-logging i mars. — Innsats: M — Konfidens: MEDIUM.

## Konkurransegap og norsk fortrinn

**5 funksjoner BeeKeepPal/Apiary Book har som BiVokter mangler:**
1. **Fôring-logg** (sukker/fondant kg) — migrasjon `0011_feed` finnes men ingen UI.
2. **Strukturert sykdoms-/diagnoseflyt i inspeksjon** — data finnes (`diseaseObservations`), flyt mangler.
3. **Avlegger/splitt-sporing** med mor-kube-kobling (relevant for svermkontroll).
4. **Eksport av behandlingsjournal** (PDF til Mattilsynet) — `services/report.ts` finnes for PDF, men ikke behandlingsspesifikt.
5. **Sensor-/kontinuerlig vekt-integrasjon**.

**3 ting som er/kan bli unikt norske:**
1. **AI-varroaanalyse av klisterplate** (`analyze-varroa`) — sterkt differensierende.
2. **Yr.no-værintegrasjon + norsk pollenkalender** med selje/lyng — lyngtrekk-varsel (august) er unikt norsk.
3. **Mattilsynet-/NBL-forankret meldeplikt-flyt** — når sykdomsdata over (se HØY-funn) blir komplett, kan «meld til Mattilsynet»-knapp bli et reelt fortrinn.

## Topp-3 anbefalinger
1. **Fiks meldeplikt-data** (HØY+HØY): sett EFB `isNotifiable: true` og legg til liten kubebille + steinyngel. Direkte konsekvens for lovpålagt sykdomsvarsling. ~3 t.
2. **Eksponer sykdoms-/droneyngel-/lukt-observasjon i wizarden** og koble eksisterende `diseaseObservations`-felt (HØY). Lav teknisk risiko — datalaget finnes. ~5 t.
3. **Strukturér behandlingslogg** med virkestoff-enum + tilbakeholdelse, og legg maursyre/MAQS + yngelstatus-kobling i anbefalingene (MEDIUM). ~5 t.

---

**Kilder:** [Mattilsynet — krav til undersøkelse for visse bisykdommer](https://www.mattilsynet.no/dyr/produksjonsdyr/bier/krav-til-dyrehelse-ved-flytting-av-bier-i-norge/krav-til-undersokelse-for-visse-bisykdommer) · [Mattilsynet — liten kubebille](https://www.mattilsynet.no/dyr/dyresykdommer/liten-kubebille/hva-gjores-for-a-bekjempe-liten-kubebille-i-europa) · [Forskrift om birøkt (Lovdata)](https://lovdata.no/dokument/SFO/forskrift/2009-04-06-416) · [DMP — Terapianbefaling: behandling av bier mot Varroa destructor](https://www.dmp.no/veterinermedisin/terapianbefalinger-og-forskrivning-av-legemidler-til-dyr/terapianbefaling-behandling-av-bier-for-bekjempelse-av-varroa-destructor)
