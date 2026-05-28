# Agent 4 — Birøkterfaglig domeneanalyse

## Metainfo
- Filer lest:
  - `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`
  - `components/inspection/Step1.tsx`
  - `components/inspection/Step2.tsx`
  - `components/inspection/Step3.tsx`
  - `components/inspection/Step4.tsx`
  - `app/(app)/(tabs)/kalender/index.tsx`
  - `app/(app)/(tabs)/laer/index.tsx`
  - `services/inspection.ts`
  - `services/treatment.ts`
  - `services/queen.ts`
  - `supabase/migrations/0006_treatments.sql`
  - `supabase/migrations/0009_queens.sql`
  - `constants/seasonChecklist.ts`
  - `constants/seasonGuide.ts`
  - `constants/diseases.ts`
  - `constants/beginnerGuide.ts`
  - `components/hive/TreatmentSection.tsx`
  - `components/hive/TreatmentRecommendationSection.tsx`
  - `components/hive/QueenSection.tsx`
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

---

## Sammendrag

BiVokter dekker kjerneområdene i norsk birøkt solid: varroa-overvåking, sesongkalender og sykdomsguide er godt gjennomarbeidet. Kritiske mangler er fraværet av strukturert yngelregistrering (tett/åpen/flekkete), ingen støtte for brunstperiode-tilknyttet behandlingstiming, svak dronningdatafangst (ingen avlslinje/ytelsesscore), og for høy behandlingsterskel for nattefall-metoden. Disse gapene rammer presisjonen i behandlingsanbefalingene og gjør datamaterialet svakere for Norsk Birøkterlags-kompatibel rapportering.

---

## Funn

### Inspeksjonsregistrering

**[KRITISK]** `components/inspection/Step2.tsx:30–32` — Yngelregistrering er begrenset til totalt antall yngelrammer (`num_frames_brood`). Ingen felt for yngeltetthet (tett/spredt/flekkete mønster), prosentandel forseglet yngel, åpen vs. forseglet yngel, eller bikulescore. Norsk Birøkterlags inspeksjonsskjema krever vurdering av yngelkvalitet og mønster som eget punkt.
**Konsekvens:** Umulig å oppdage EFB, AFB eller dronningproblemer tidlig basert kun på rammetall. AI-anbefalinger om dronningkvalitet mangler datagrunnlag.
**Løsning:** Legg til et kvalitetsfelt for yngelmønster (f.eks. radioknapper: "tett", "spredt", "flekkete") og en boolean for "misdannede larver sett".

**[HØY]** `components/inspection/Step2.tsx:44–51` — Dronningceller er kun et ja/nei-felt (`queenCells: boolean`). Det mangler type (dronningcelle vs. nødcelle vs. svermcelle), plassering (rammebunn/side/midtre), antall og om de var åpne eller lukkede.
**Konsekvens:** Birøkteren kan ikke vurdere svermrisiko presist. En lukket svermcelle og en åpen nødcelle krever helt ulik respons — men appen skiller ikke mellom dem.
**Løsning:** Endre `queenCells` til en enum (`svermcelle | nødcelle | dronningcelle | ingen`) og legg til tellefeltet `queenCellCount: number`.

**[HØY]** `components/inspection/Step3.tsx:21` — Varroa-metodene er `['alkoholspyling', 'sukkerpuder', 'limbunn']`. "Limbunn" kalles i fagspråket korrekt "nattefall" eller "naturlig fall på klebbplate". Sukkerpudermetoden er sjelden brukt i Norge (mest vanlig i USA); norsk standard er alkoholvask (ristemetoden) eller nattefall på klebbplate.
**Konsekvens:** Nomenklatur avviker fra Norsk Birøkterlag og Mattilsynets veiledninger, noe som kan forvirre brukere fra norske kurs.
**Løsning:** Rename til `['Alkoholvask (ristemetoden)', 'Klebbplate (nattefall)', 'Sukkerpuder']` med klebbplate som første valg siden det er det vanligste i norsk praksis.

**[MEDIUM]** `services/inspection.ts:27` — `diseaseObservations` lagres som `Record<string, boolean>` men ingen UI-komponent lar brukeren sette spesifikke sykdomsobservasjoner under inspeksjon. Feltet eksisterer i databaseskjemaet men er alltid `null` i praksis.
**Konsekvens:** Sykdomspåvisning skjer kun i tekstnotater, ikke som strukturert data. Trendanalyse på sykdomsforekomst er umulig.
**Løsning:** Legg til en sykdomsavkrysningsliste (kalkyngel, nosema, EFB-mistanke) i Step 3 som mapper mot eksisterende `disease_observations`-felt.

---

### Behandlingsprotokoll

**[KRITISK]** `components/hive/TreatmentRecommendationSection.tsx:81` — Anbefaling om "Apivar (8 uker)" gis for høstbehandling (august–september) uten forbehold. Apivar (amitraz) skal ikke brukes på kuber med honningmagasin på. Appen sjekker ikke om honningmagasinene er fjernet.
**Konsekvens:** Anbefalingen kan føre til amitrazkontaminert honning — et mattrygghetsproblem og brudd på Mattilsynets retningslinjer for godkjent bruk.
**Løsning:** Legg til eksplisitt advarsel: "Fjern alltid honningmagasiner før Apivar-behandling" og sjekk om kuben har aktiv høsting registrert.

**[HØY]** `components/hive/TreatmentRecommendationSection.tsx:30–31` — Terskelverdier for varroabehandling: Nattefall (limbunn): kritisk ved ≥10 midd/dag. Dette er 5–8x for høyt. Norsk Birøkterlags veiledning og COLOSS-retningslinjer angir at >1–2 midd per dag om sommeren bør utløse tiltak. Alkoholvask-terskelen på 3 per 100 bier er korrekt.
**Konsekvens:** Behandling forsinkes kraftig for nattefall-brukere, noe som gir unødig høy parasittbelastning gjennom sesongen.
**Løsning:** Juster `isMitefall`-terskelen: `warnThresh: 1` (per dag), `critThresh: 2` (per dag) om sommeren — eller representer total 7-dagers klebbplate (warn: 20, crit: 50).

**[MEDIUM]** `components/hive/TreatmentSection.tsx:17–26` — Produktlisten staver oksalsyre inkonsekvent: `'Oxalsyre (drypp)'` og `'Oxalsyre (fordamping)'` (anglisert) vs. "oksalsyre" (norsk standard) i tekstinnhold og sjekklister.
**Konsekvens:** Inkonsistent terminologi gir feilsøk i statistikk og fremstår uprofesjonelt overfor erfarne birøktere.
**Løsning:** Standardiser til norsk stavemåte: `'Oksalsyre (drypp)'`, `'Oksalsyre (fordamping)'` i hele kodebasen.

**[MEDIUM]** `services/treatment.ts` + `supabase/migrations/0006_treatments.sql` — Behandlingstabellen mangler felt for: `brood_free` (yngelfri ved behandling) og `withholding_days` (karensdager til honning). Disse er relevante for Mattilsynets dokumentasjonskrav.
**Konsekvens:** Behandlingsloggen er ikke kompatibel med journalkrav for profesjonelle birøktere (> 10 kuber) som er pålagt dokumentasjon under Animaliehygieneforordningen.
**Løsning:** Legg til kolonner `brood_free boolean` og `withholding_days integer` i migrasjonen.

**[LAV]** `constants/diseases.ts:17` — Behandlingsanbefalingen for varroamidd nevner "Apistan" som ett av alternativene. Apistan (fluvalinate) er trukket fra det norske markedet grunnet utbredt resistens hos Varroa destructor i Norge og er ikke anbefalt av Mattilsynet.
**Konsekvens:** Birøktere kan forsøke å skaffe Apistan basert på appens veiledning, uten at det er tilgjengelig eller effektivt.
**Løsning:** Fjern Apistan fra listen, eller marker det tydelig som "ikke anbefalt i Norge (resistensrisiko)".

---

### Sesongkalender

**[HØY]** `constants/seasonGuide.ts:109–116` — Vinterfôringsanbefalingen er "ca. 15–18 kg per kube". Norsk Birøkterlag anbefaler 18–22 kg for norske forhold (sone 3–7), og opp til 25 kg i Nord-Norge (sone 8). 15 kg er underkant for soner med lang vinter (> 5 måneder).
**Konsekvens:** Birøktere i nordlige soner risikerer sultvinter hvis de følger appens minimumsanbefaling.
**Løsning:** Oppdater til "18–22 kg (Sør-Norge) / 22–25 kg (Nord-Norge)" med et generelt råd om å ta feil på sikreste side.

**[MEDIUM]** `constants/seasonChecklist.ts:36–41` — Mars-sjekklisten inneholder "Tell varroa (sukkerpulver eller alkohol)" men nevner ikke klebbplate/nattefall som alternativ, og setter ingen minste temperaturterskel for telling (alkoholvask bør kun gjøres ved > 10 °C stabilt vær for at biene er samlet i god klynge).
**Konsekvens:** Brukere kan utføre alkoholvask med spredt bieklynge og få upålitelige tellinger i tidlig vår.
**Løsning:** Legg til `detail: 'Gjøres kun ved >10 °C — biene må sitte samlet i klynge for presist uttak'`.

**[MEDIUM]** `constants/seasonChecklist.ts` — Sjekklisten mangler sone-differensiering. Svermetid starter i mai sone 1–3 (Sør-Norge), men allerede april i sone 8 (Vestlandet/Rogaland). En flat nasjonal kalender passer ikke hele landet.
**Konsekvens:** Brukere i varmere soner vil misse sverm-vinduet; brukere i nordlige soner starter svermkontroll for tidlig.
**Løsning:** Legg til bruker-input for NBF-sone (1–8) ved onboarding og parametriser sjekklisten basert på sone.

---

### Dronninghåndtering

**[HØY]** `services/queen.ts` + `components/hive/QueenSection.tsx:9` — Dronningregistreringen mangler:
- `avlslinje` / linjenummer (f.eks. NB-avlslinje, VSH-sertifisert)
- `produksjonsscore` (honningutbytte, svermtilbøyelighet 1–5)
- `hygienetest_resultat` (SMR/VSH-test prosent)
- `avlsmerke` (godkjent avler / sertifikatnummer)

Rase-alternativene inkluderer "Carniolan" — offisiell norsk betegnelse er "Carnica".
**Konsekvens:** Appen kan ikke brukes til avlsdokumentasjon. Birøktere med godkjente avlslinjer (registrert i NB's avlsregister) har ingen plass til å knytte dronningdata til avlsprogrammet.
**Løsning:** Legg til `breeding_line text` og `performance_notes text` i queens-tabellen; rename "Carniolan" til "Carnica" i UI.

**[LAV]** `components/hive/QueenSection.tsx:10` — Merkefarge-syklusen (`MARK_COLORS: ['hvit', 'gul', 'rød', 'grønn', 'blå']`) er korrekt iht. internasjonalt system. Men appen beregner ikke automatisk riktig farge basert på innføringsdato (`year % 5` → fargeindeks).
**Konsekvens:** Brukere kan velge feil farge manuelt uten å få advarsel.
**Løsning:** Auto-foreslå riktig farge basert på `introducedAt`-dato.

---

### Faglig korrekthet — terminologi og innhold

**[MEDIUM]** `constants/beginnerGuide.ts:258` — "maursyre (effektiv sommerbehandling, krever temperatur 15–25°C)" er delvis feil. MAQS (maursyre-remser, godkjent i Norge) har anbefalt bruksområde 10–29 °C hos produsenten. Øvre grense på 25 °C er for restriktiv for norske sommertemperaturer.
**Konsekvens:** Birøktere i varmere perioder (juli) kan tro de ikke kan bruke MAQS selv om det er tillatt og effektivt.
**Løsning:** Oppdater til "maursyre (MAQS: 10–29 °C; flytende maursyre: 15–25 °C)".

**[MEDIUM]** `components/hive/TreatmentRecommendationSection.tsx:13–48` — Helseanbefalingssystemet er utelukkende måneds- og terskeldrevet. Det tar ikke hensyn til kolonistyrke (antall rammer bier), yngelmengde (påvirker behandlingseffekt) eller tidligere behandlingshistorikk (resistensrisiko ved gjentatt Apivar).
**Konsekvens:** To kuber med identisk varroa-telling men svært ulik kolonistyrke får samme anbefaling — faglig upresisjonsfullt og potensielt misvisende.
**Løsning:** Innfør relativ risikomodell: `varroaCount / framesEstimatedBees * 100` og inkluder `numFramesBrood` i vurderingen.

---

### Konkurransegap mot BeeKeepPal

**[INFO]** Basert på offentlig kjente funksjoner i BeeKeepPal:

1. **Sonebaserte anbefalinger**: BeeKeepPal tilbyr klimasone-tilpassede råd. BiVokter bruker én felles nasjonal kalender som ikke differensierer mellom nord og sør.

2. **Avlsmodul med ytelsesscoring**: BeeKeepPal lar brukere registrere avlslinjer, tilbakekoble til avlsregister og score kolonier på honningutbytte, svermtilbøyelighet og hygieneadferd. BiVokter har ingen ytelsesscore-funksjon.

3. **Flerkubebehandlingsplan**: BeeKeepPal kan planlegge og koordinere behandling av alle kuber i et bihold samlet. BiVokter behandler én kube om gangen uten samlet oversikt på tvers.

4. **Offline-first med synkroniseringskø**: BeeKeepPal har fullt offline-modus for inspeksjoner i felt uten nettdekning. BiVokter har kun lokalt utkast (AsyncStorage) men krever nettverk for lagring — ingen eksplisitt offline-kø.

5. **Varroa-progresjonsgraf med behandlingsmarkører**: BeeKeepPal viser varroa-telletall over tid med innlagte behandlingsmarkører og trendlinje. BiVokter lagrer dataene men mangler en dedikert flersesongers varroa-trendvisning med behandlingskontekst.

---

## Topp-3 anbefalinger

1. **Korriger varroa-terskelen for nattefall (klebbplate/limbunn)** — Gjeldende terskel på 10 midd/dag er 5–8x for høy iht. Norsk Birøkterlags og europeiske COLOSS-retningslinjer. Endre til warn ≥ 1/dag og kritisk ≥ 2/dag (sommer). Dette er en sikkerhetskritisk feil som direkte påvirker kolonihelse og er den enkeltste feilen å rette.

2. **Legg til yngelkvalitetsvurdering i Step 2** — En enkel 3-valgs vurdering (tett / spredt / flekkete) og boolean "misdannede larver sett" gir datagrunnlag for tidlig sykdomsdeteksjon (EFB, AFB) og gjør inspeksjonsdata sammenlignbare over tid. Dette er det enkeltfeltet som gir størst faglig gevinst med minst utviklingsinnsats.

3. **Koble Apivar-anbefaling til honningmagasinstatus** — Anbefaling om Apivar uten advarsel om honningmagasiner er et mattrygghetsrisiko og potensielt rettslig problem. Legg til et vilkår "honningmagasiner fjernet" som forutsetning for å vise Apivar-anbefaling, og innfør `brood_free`-felt i behandlingsloggen for å støtte Mattilsynets dokumentasjonskrav.
