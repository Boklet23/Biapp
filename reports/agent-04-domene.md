# Agent 4 — Birøkterfaglig domeneanalyse

## Metainfo
- **Dato:** 2026-06-22 (review v3)
- **Filer lest:** `constants/varroa.ts`, `diseases.ts`, `seasonGuide.ts`, `seasonChecklist.ts`, `pollenCalendar.ts`, `beginnerGuide.ts` (grep), `components/inspection/Step1–4.tsx`, `components/hive/TreatmentRecommendationSection.tsx`, `TreatmentSection.tsx`, `QueenSection.tsx`, `services/inspection.ts`, `treatment.ts`, `queen.ts`, `diseases.ts` (service), `app/(app)/(tabs)/laer/index.tsx` + `[slug].tsx` (grep), `supabase/migrations/0025_diseases.sql`, `0026_seed_diseases.sql`, `0009_queens.sql`
- **Diff mot 2026-06-18:** **VERIFISERT FIKSET I TS:** Apistan fjernet fra `constants/diseases.ts:17` (nå oksalsyre/maursyre/ApiLife Var/Apivar); EFB `isNotifiable: true` (`:52`); liten kubebille (id 11, notifiable, kritisk) finnes (`:217`). **MEN:** disse fikses kun i TS-konstanten — appen leser primært DB-tabellen (`fetchDiseases`, TS er bare `placeholderData`/`fallback`), og DB-seeden er **ikke** oppdatert. Se KRITISK-funn.

## Sammendrag
TS-laget er ryddet siden sist, men appen leser sykdommer fra DB-tabellen (`services/diseases.ts`), ikke fra `constants/diseases.ts`. DB-seeden `0026_seed_diseases.sql` inneholder fortsatt **Apistan** (×2) og **EFB som ikke-meldepliktig**, og mangler liten kubebille — så alle tre «fiksene» fra 18. juni er kosmetiske i praksis. I tillegg: Apistan ligger som valgbart produkt i behandlingsloggen, steinyngel + trakemidd (begge meldepliktige) mangler, «sværm»-stavefeil består, og `diseaseObservations` eksponeres fortsatt ikke i wizarden.

## Fungerer godt (ikke rør)
1. **Sentraliserte, metodespesifikke varroaterskler** (`constants/varroa.ts`) — vaskemetode 3/100 (≈3 %) er faglig korrekt økonomisk terskel; delt mellom Health- og Recommendation-seksjon.
2. **AI-varroaanalyse av klisterplate** (`Step3.tsx`) — sterk differensiator mot BeeKeepPal/Apiary Book.
3. **Norsk pollenkalender med lyngtrekk** (`pollenCalendar.ts`: august Calluna, juli lind, april selje/løvetann) — riktig norsk fenologi.
4. **Dronningmerking-fargesyklus** (`beginnerGuide.ts:118`: hvit 1/6, gul 2/7, rød 3/8, grønn 4/9, blå 5/0) — matcher internasjonal standard; `QueenSection` MARK_COLORS korrekt.
5. **Oksalsyre-detaljer** (3,5 % drypp, 5 ml/ramme, >90 % effekt, vernemaske) i seed `diagnostic_tips` — presise og DMP-konforme.

## Funn

**[KRITISK]** `supabase/migrations/0026_seed_diseases.sql:16,30` — DB-seeden (den appen faktisk viser) anbefaler fortsatt Apistan: `'...Oksalsyre..., Apistan, ApiLife Var eller Apivar...'` og `"...sett inn Apistan-strimler..."`. `laer/index.tsx:69` henter fra `fetchDiseases` (DB); `constants/diseases.ts` er kun `placeholderData`. Apistan (tau-fluvalinat) har **ingen markedsføringstillatelse i Norge** — kun via godkjenningsfritak; dokumentert pyretroid-resistens hos Varroa. — Brukeren ser ulovlig/utdatert råd til tross for at TS er «fikset». — Oppdater DB-seeden (ny migrasjon eller `UPDATE diseases`) — fjern Apistan, bruk maursyre/ApiLife Var/Apivar. — Innsats: S — Konfidens: HØY. ([DMP terapianbefaling varroa](https://www.dmp.no/globalassets/documents/veterinarmedisin/terapianbefalinger/terapianbefaling---behandling-av-bier-for-bekjempelse-av-varroa-destructor_korrigert-190517.pdf))

**[KRITISK]** `supabase/migrations/0026_seed_diseases.sql:99` — EFB seedet med `is_notifiable = false` (`'europeisk-yngelraate', 'Europeisk yngelråte', false, ...`). Liten kubebille mangler helt fra seeden (kun 10 sykdommer, slutter på `mus`). TS-fiksene fra 18. juni traff aldri DB. Europeisk yngelråte **er meldepliktig** etter forskrift om birøkt. — Appen viser EFB som ikke-meldepliktig og mangler kubebille-oppføringen helt → birøkter melder kanskje ikke lovpålagt funn. — Sett EFB `is_notifiable = true`; legg til liten kubebille i seeden. — Innsats: S — Konfidens: HØY. ([Mattilsynet — krav til undersøkelse for visse bisykdommer](https://www.mattilsynet.no/dyr/produksjonsdyr/bier/krav-til-dyrehelse-ved-flytting-av-bier-i-norge/krav-til-undersokelse-for-visse-bisykdommer))

**[HØY]** `constants/diseases.ts` + `0026_seed_diseases.sql` — **Steinyngel (Aspergillus)** og **trakemidd (Acarapis woodi)** mangler fortsatt i begge kilder. Begge er eksplisitt **meldepliktige** etter forskrift om birøkt (sammen med yngelråte, kubebille, tropilaelaps). — Birøkter med symptomer finner ingen oppføring, melder ikke. — Legg til begge med `is_notifiable: true` i seed + TS. — Innsats: M — Konfidens: HØY. ([Forskrift om birøkt — Lovdata](https://lovdata.no/dokument/LTI/forskrift/2009-04-06-416))

**[HØY]** `components/hive/TreatmentSection.tsx:24` — Behandlingsloggens produktvelger har `'Apistan'` som valgbart alternativ. — Oppfordrer aktivt til å logge/bruke et middel uten norsk MT. — Fjern Apistan fra `PRODUCTS`-lista; behold MAQS/Api-Bioxal/oksalsyre/Apivar. — Innsats: S — Konfidens: HØY.

**[HØY]** `components/inspection/Step1–4.tsx` + `services/inspection.ts:27,107` — `diseaseObservations` er plumbet gjennom `CreateInspectionData`/`createInspection`/`mapInspection`, men eksponeres **ingen steder** i wizarden. Step2 har kun rammer + 2 dronning-toggles; **droneyngel/leggarbeider** (dronningløshetsindikator, jf. seed-tips «droneyngel har 10× mer midd») og **lukt** (yngelråte-screening) registreres aldri. — Tidlige sykdoms-/dronningløshetssignaler fanges ikke; død datavei. — Legg toggles for droneyngel + lukt i Step2/3 og koble `diseaseObservations` til sykdomslista. — Innsats: M — Konfidens: HØY.

**[MEDIUM]** `services/treatment.ts:4-11` + `0006_treatments.sql` — Behandlingslogg er fritekst (`product/dose/method text`); placeholder `'Oxalsyre, ApiLife Var'` i `Step3.tsx:241`. Mangler strukturert **virkestoff** og **tilbakeholdelsestid**. Birøktere er journalpliktige for legemiddelbruk. — Ingen etterprøvbar journal til Mattilsynet/veterinær. — Strukturér med virkestoff-enum (oksalsyre-drypp/-damp, maursyre, timol, amitraz) + tilbakeholdelse. — Innsats: M — Konfidens: MEDIUM.

**[MEDIUM]** `TreatmentRecommendationSection.tsx:94-107` — Vinter-oksalsyre anbefales rent på `month === 12 || 1` («Yngelfri koloni gir ideal effekt» påstås, men yngelstatus sjekkes ikke). Maursyre/MAQS — eneste middel som virker gjennom forseglet yngel, relevant for norsk sen-sommeryngel — nevnes ikke i høst-anbefalingen (`:77` kun Apivar/oksalsyre). — Potensielt feiltimet råd; ufullstendig høst-meny. — Koble vinter-oksalsyre til yngelfri-flagg; legg maursyre i aug/sep-rec. — Innsats: M — Konfidens: MEDIUM.

**[LAV]** `constants/seasonGuide.ts:50,54,62,64,79` + `0026_seed_diseases.sql:17,21` — Stavefeil **«Sværm…»** (sværmforebygging, sværmtid, sværmstatus) med æ. Korrekt norsk er «sverm» (jf. `seasonChecklist.ts` «sverm-kontroll», `TreatmentRecommendationSection` «Sverm-forebygging», beginnerGuide-slug). Inkonsekvent i samme app. — Svekker faglig inntrykk i betalt app. — Søk/erstatt «sværm»→«sverm». — Innsats: S — Konfidens: HØY.

**[LAV]** `components/hive/QueenSection.tsx:10` + `Step3.tsx:21` — (a) Merkefarge velges fritt uten **auto-forslag fra årstall** (fargesyklusen finnes i `beginnerGuide.ts:118`, men kobles ikke til `introducedAt`). (b) `VARROA_METHODS` slår «sukkerpuder» og «alkoholspyling» til samme terskel; «sukkerrull» (% av prøve) skilles ikke metodisk fra nedfall. — Mindre UX-/tolkningstap. — Auto-foreslå merkefarge fra innsatt-år. — Innsats: S — Konfidens: MEDIUM.

## Konkurransegap og norsk fortrinn
**5 funksjoner BeeKeepPal/Apiary Book har som BiVokter mangler:**
1. **Fôring-logg** (sukker/fondant kg) — `0011_feed` finnes, ingen UI.
2. **Strukturert sykdoms-/diagnoseflyt i inspeksjon** — datalag (`diseaseObservations`) finnes, UI mangler.
3. **Avlegger/splitt-sporing** med mor-kube-kobling (sentralt for svermkontroll).
4. **Eksport av behandlingsjournal (PDF)** med virkestoff/dato til Mattilsynet.
5. **BLE-vekt/sensor-integrasjon** (kontinuerlig vektovervåking).

**3 unikt norske muligheter:**
1. **AI-varroaanalyse av klisterplate** — allerede implementert.
2. **Yr.no + lyngtrekk-varsel (august Calluna)** — unik norsk fenologi.
3. **Mattilsynet/forskrift-forankret meldeplikt-flyt** — «Meld til Mattilsynet»-knapp + soneregler (varroa region C, trakemidd sone B1) når sykdomsdata blir komplett og korrekt i DB.

## Topp-3 anbefalinger
1. **Fiks DB-seeden, ikke bare TS** (2×KRITISK): ny migrasjon som fjerner Apistan og setter EFB `is_notifiable=true` + legger til kubebille. Fiksene fra 18. juni er ellers virkningsløse i appen. ~2 t.
2. **Legg til steinyngel + trakemidd (meldepliktige)** i seed + TS, og fjern Apistan fra `TreatmentSection.tsx` produktliste (2×HØY). ~3 t.
3. **Eksponer droneyngel-/lukt-/sykdomsobservasjon i wizarden** og koble eksisterende `diseaseObservations` (HØY) — datalaget finnes allerede. ~5 t.

---
**Kilder:** [DMP — Terapianbefaling varroa (PDF)](https://www.dmp.no/globalassets/documents/veterinarmedisin/terapianbefalinger/terapianbefaling---behandling-av-bier-for-bekjempelse-av-varroa-destructor_korrigert-190517.pdf) · [Mattilsynet — krav til undersøkelse for visse bisykdommer](https://www.mattilsynet.no/dyr/produksjonsdyr/bier/krav-til-dyrehelse-ved-flytting-av-bier-i-norge/krav-til-undersokelse-for-visse-bisykdommer) · [Mattilsynet — åpen yngelråte](https://www.mattilsynet.no/dyr/dyresykdommer/apen-yngelrate) · [Forskrift om birøkt — Lovdata](https://lovdata.no/dokument/LTI/forskrift/2009-04-06-416)
