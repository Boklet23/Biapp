# Agent 4 — Birøkterfaglig domeneanalyse

## Metainfo
- **Filer lest:** `constants/varroa.ts`, `diseases.ts`, `seasonChecklist.ts`, `seasonReminders.ts`, `seasonGuide.ts`, `pollenCalendar.ts`, `beginnerGuide.ts`, `components/inspection/Step1–4.tsx`, `components/hive/TreatmentRecommendationSection.tsx`, `services/inspection.ts`, `treatment.ts`, `queen.ts`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `kalender/index.tsx`, `laer/[slug].tsx` (grep), `supabase/migrations/0006_treatments.sql`, `0009_queens.sql`, `0025_diseases.sql`
- **Diff mot forrige (`reports/archive/2026-06-12/agent-04-domene.md`):** **FIKSET:** (1) EFB `isNotifiable: true` (var false). (2) Liten kubebille lagt til (id 11, notifiable, kritisk). (3) Språkfeil «yngelrotte»/«svirving»/«vokseldansen»/«hofstaten» rettet i `beginnerGuide.ts`. Verifisert ikke gjentatt. **IKKE fikset (gjentas):** sykdoms-/droneyngel-/lukt-observasjon mangler i wizard; behandlingslogg er fritekst uten virkestoff/tilbakeholdelse; vinter-oksalsyre koblet til måned ikke yngelstatus. **NYE funn:** Apistan-anbefaling (ikke MT-godkjent), manglende steinyngel + trakemidd, æ-stavefeil i `seasonGuide.ts`.

## Sammendrag
Domenet er solid norsk-forankret og klart forbedret siden sist (meldeplikt-data og språk ryddet). Tre faglige svakheter står igjen: appen anbefaler «Apistan» som ikke har markedsføringstillatelse i Norge, to meldepliktige sykdommer (steinyngel, trakemidd) mangler fortsatt, og inspeksjonswizarden eksponerer fortsatt ikke det allerede plumbede `diseaseObservations`-feltet eller droneyngel/lukt. Behandlingsloggen mangler journalstruktur.

## Fungerer godt (ikke rør)
1. **Sentraliserte varroaterskler** (`constants/varroa.ts`) — metodespesifikke (~3/100 vaskemetode), delt mellom Health- og Recommendation-seksjon. Faglig riktig økonomisk terskel.
2. **Meldeplikt-banner** (`laer/[slug].tsx:72`) med Mattilsynet-nr 22 40 00 00 — nå korrekt for EFB og kubebille.
3. **Oksalsyre-detaljer** i `beginnerGuide.ts:270` (3,5 % drypp, 2,1 g fordamping, FFP2) er presise og DMP-konforme.
4. **Lyngtrekk + norsk pollenkalender** (`pollenCalendar.ts`, august Calluna) — unikt norsk, riktig fenologi (selje apr, lind jul).
5. **AI-varroaanalyse av klisterplate** (`Step3.tsx`) — sterkt differensierende mot konkurrenter.

## Funn

**[HØY]** `constants/diseases.ts:17` — Varroa-behandling anbefaler `'Apistan'` (`treatment: '...Apistan, ApiLife Var eller Apivar'`). Apistan (tau-fluvalinat) har **ikke markedsføringstillatelse i Norge** — kun Api-Bioxal (oksalsyre) har full MT; øvrige krever godkjenningsfritak, og tau-fluvalinat er under miljørevurdering (TFA). — Birøkter rådes til et middel som ikke lovlig kan skaffes/brukes uten søknad; gir også voksresistens-risiko. — Erstatt med oksalsyre + maursyre + ApiLife Var (timol) + evt. Apivar (amitraz, krever fritak); fjern Apistan. — Innsats: S — Konfidens: HØY. ([DMP terapianbefaling](https://www.dmp.no/veterinermedisin/terapianbefalinger-og-forskrivning-av-legemidler-til-dyr/terapianbefaling-behandling-av-bier-for-bekjempelse-av-varroa-destructor))

**[HØY]** `constants/diseases.ts` (hele lista) — **Steinyngel (Aspergillus)** og **trakemidd (Acarapis woodi)** mangler fortsatt — begge er **meldepliktige** etter Mattilsynets bisykdomsliste sammen med åpen/lukket yngelråte, kubebille og Tropilaelaps. — Birøkter som ser symptomer finner ingen oppføring og melder kanskje ikke lovpålagt. — Legg til begge med `isNotifiable: true`. — Innsats: M — Konfidens: HØY. ([Mattilsynet: lukket yngelråte / meldepliktige bisykdommer](https://www.mattilsynet.no/dyr/dyresykdommer/lukket-yngelrate))

**[HØY]** `components/inspection/Step1–4.tsx` + `services/inspection.ts:27,107` — `diseaseObservations` er plumbet gjennom `CreateInspectionData` og `createInspection`, men **eksponeres ingen steder i wizarden**. Step2 fanger kun rammer + 2 dronning-toggles; **droneyngel/leggarbeider** (dronningløshetsindikator, beskrevet i `beginnerGuide.ts:194`) og **lukt** (yngelråte-screening) mangler helt. — Tidlige sykdoms-/dronningløshetssignaler registreres aldri; død datavei. — Legg toggles for droneyngel + lukt i Step2/3 og koble `diseaseObservations` til `DISEASES`. — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `services/treatment.ts:4-11` + `0006_treatments.sql:7-9` — Behandlingslogg er fritekst (`product/dose/method text`, placeholder `'Oxalsyre, ApiLife Var'` i `Step3.tsx:241`). Mangler **virkestoff** og **tilbakeholdelsestid**. Birøktere er journalpliktige; legemiddelbruk skal kunne dokumenteres. — Ingen etterprøvbar journal til Mattilsynet/veterinær. — Strukturér med virkestoff-enum (oksalsyre-drypp/-damp, maursyre, timol, amitraz) + tilbakeholdelse. — Innsats: M — Konfidens: MEDIUM.

**[MEDIUM]** `TreatmentRecommendationSection.tsx:94-107` — Vinter-oksalsyre anbefales rent på `month === 12 || 1`, uavhengig av registrert yngelstatus («Yngelfri koloni gir ideal effekt» påstås, men sjekkes ikke). Maursyre/MAQS — eneste middel som virker gjennom forseglet yngel, relevant for norsk sen-sommer med yngel — nevnes ikke i høst-anbefalingen (`:77` kun Apivar/oksalsyre). — Potensielt feiltimet råd; ufullstendig høst-meny. — Koble vinter-oksalsyre til yngelfri-flagg og legg maursyre i aug/sep-rec. — Innsats: M — Konfidens: MEDIUM.

**[LAV]** `constants/seasonGuide.ts:50,53,62,64,78` & `diseases.ts:19` — Stavefeil **«Sværm…»** (sværmforebygging, sværming, sværmtid, sværmstatus) med æ. Korrekt norsk er «sverm» (jf. `beginnerGuide.ts` slug `svermforebygging` og `TreatmentRecommendationSection`). Inkonsekvent i samme app. — Svekker faglig inntrykk i betalt app. — Søk/erstatt «sværm»→«sverm». — Innsats: S — Konfidens: HØY.

**[LAV]** `components/inspection/Step3.tsx:21` & `QueenSection`/`0009_queens.sql` — (a) `VARROA_METHODS` slår «sukkerpuder» og «alkoholspyling» sammen til samme terskel; «sukkerrull» (rist i melis, %-basis) skilles ikke fra nedfall — birøktere skiller dem. (b) Dronning mangler **auto-foreslått merkefarge fra årstall** (fargesyklus beskrevet i `beginnerGuide.ts:118` men ikke validert mot `introduced_at`). — Mindre tolknings-/UX-tap. — Auto-foreslå merkefarge; vurder å skille tellemetodene. — Innsats: S — Konfidens: MEDIUM.

## Konkurransegap og norsk fortrinn
**5 funksjoner BeeKeepPal/Apiary Book har som BiVokter mangler:**
1. **Fôring-logg** (sukker/fondant kg) — migrasjon `0011_feed` finnes, ingen UI.
2. **Strukturert sykdoms-/diagnoseflyt i inspeksjon** — datalag finnes (`diseaseObservations`), UI mangler.
3. **Avlegger/splitt-sporing** med mor-kube-kobling (sentralt for svermkontroll).
4. **Eksport av behandlingsjournal (PDF)** — `services/report.ts` finnes, men ikke behandlingsspesifikt.
5. **Kontinuerlig sensor-/vekt-integrasjon** (BLE-vekt).

**3 ting som er/kan bli unikt norske:**
1. **AI-varroaanalyse av klisterplate** — allerede implementert, sterk differensiator.
2. **Yr.no + norsk pollenkalender med lyngtrekk-varsel (august)** — unikt norsk fenologi.
3. **Mattilsynet-/NBL-forankret meldeplikt-flyt** — «Meld til Mattilsynet»-knapp + nasjonal vintertapsrapportering når sykdomsdata blir komplett (etter HØY-funn).

## Topp-3 anbefalinger
1. **Fiks legemiddel-/meldeplikt-data** (2×HØY): fjern Apistan fra varroa-`treatment`; legg til steinyngel + trakemidd som meldepliktige. Direkte lov-/legemiddelkonsekvens. ~2 t.
2. **Eksponer sykdoms-/droneyngel-/lukt-observasjon i wizarden** og koble eksisterende `diseaseObservations` (HØY). Lav teknisk risiko — datalaget finnes. ~5 t.
3. **Strukturér behandlingslogg** (virkestoff-enum + tilbakeholdelse) og legg maursyre + yngelstatus-kobling i anbefalingene (2×MEDIUM). ~5 t.

---
**Kilder:** [DMP — Terapianbefaling varroa](https://www.dmp.no/veterinermedisin/terapianbefalinger-og-forskrivning-av-legemidler-til-dyr/terapianbefaling-behandling-av-bier-for-bekjempelse-av-varroa-destructor) · [Mattilsynet — lukket yngelråte (meldepliktige bisykdommer)](https://www.mattilsynet.no/dyr/dyresykdommer/lukket-yngelrate) · [Mattilsynet — åpen yngelråte](https://www.mattilsynet.no/dyr/dyresykdommer/apen-yngelrate) · [Forskrift om birøkt (Lovdata)](https://lovdata.no/dokument/LTI/forskrift/2009-04-06-416)
