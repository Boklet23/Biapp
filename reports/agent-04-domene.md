# Agent 4 — Domene

## Metainfo
- **Filer lest:** `kuber/[id]/index.tsx`, `kuber/[id]/inspeksjon/ny.tsx`, `Step1–4.tsx`, `kalender/index.tsx`, `laer/index.tsx`, `services/inspection.ts`, `services/treatment.ts`, `services/queen.ts`, `0006_treatments.sql`, `0009_queens.sql`, `0025_diseases.sql`, `0026_seed_diseases.sql`, `0004_hive_bee_breed.sql`, `0027_hive_boxes_and_frames.sql`, `HealthScoreSection.tsx`, `TreatmentRecommendationSection.tsx`, `QueenSection.tsx`, `HiveTypeChip.tsx`, `seasonChecklist.ts`, `SeasonGuide.tsx`, `types/index.ts`
- **Filer ikke funnet:** ingen (alle relevante filer lokalisert; `0025`/`0026` delt i schema + seed)
- **Konfidensgrad:** Høy

## Sammendrag
Domenet er solid og tydelig norsk-forankret: sykdomsguiden (10 tilstander) er faglig fremragende med Mattilsynet/Veterinærinstituttet-kilder, meldepliktmarkering og sesongvise tiltak. Inspeksjon, varroatelling (3 metoder), behandling og dronning dekkes godt. Hovedsvakheter: inspeksjonsskjemaet mangler droneleg/lukt/sykdomstegn-felter, varroametode-listen er ufullstendig og terskler er inkonsistente mellom to moduler, og behandlingsloggen mangler Mattilsynet-påkrevd dokumentasjonsstruktur.

## Funn

**[HØY]** `components/hive/HealthScoreSection.tsx:37-39` & `TreatmentRecommendationSection.tsx:30-32` — Varroaterskler for samme metode er inkonsistente mellom de to modulene. HealthScore bruker limbunn crit=10/warn=5/mod=2 (mitefall/dag), mens Recommendation bruker limbunn crit=3/warn=1. Brukeren kan se "Bra helse" og samtidig "Behandling nødvendig" for samme tall. — Faglig forvirring og tap av tillit. — Sentraliser tersklene i én `constants/varroaThresholds.ts` med dokumenterte kilder (NBL: ~3 % vaskeprøve = behandling; limbunn >1 midd/dag vår, >4/dag høst).

**[HØY]** `components/inspection/Step3.tsx:21` — `VARROA_METHODS = ['alkoholspyling', 'sukkerpuder', 'limbunn']`. Mangler "sukkerrull/pudderfall" som distinkt metode og CO2/EasyCheck. Seed-data (`0026:17,40`) nevner også "vaskemetode" og "sukkerpudder" — terminologien er ikke konsistent mot UI-chips. — Telleresultat kan ikke tolkes korrekt uten standardisert metode→terskel. — Standardiser metodeliste og koble eksplisitt %-basis (vaske/sukkerrull) vs midd/dag (limbunn).

**[HØY]** `components/inspection/Step2.tsx` + `services/inspection.ts:12-32` — Inspeksjonen mangler sentrale norske observasjonsfelter: **droneleg/droneyngel** (varroaindikator), **lukt** (råte-screening), **sykdomstegn** (`diseaseObservations` finnes i typen men eksponeres ikke i UI), **pollen/nektarinngang**, og **temperament** finnes kun som "humør" 1–5. — Inspeksjoner fanger ikke tidlige sykdoms- og svermsignaler som NBL anbefaler. — Legg til toggles for droneyngel, lukt-flagg og koble `diseaseObservations` til sykdomslista.

**[MEDIUM]** `services/treatment.ts` + `0006_treatments.sql` — Behandlingsloggen mangler Mattilsynet/legemiddel-dokumentasjon: virkestoff, batch/lot-nr, tilbakeholdelsestid og kobling til journalkrav. `product` er fritekst (placeholder `'Oxalsyre, ApiLife Var'`). — Birøktere er journalpliktige; appen gir ikke etterprøvbar dokumentasjon. — Legg til strukturerte felt (virkestoff-enum: oksalsyre-drypp/-damp, maursyre/MAQS, ApiLife Var, Apivar, Apistan) + dose/tilbakeholdelse.

**[MEDIUM]** `TreatmentRecommendationSection.tsx:38,81,107` — Anbefaler kun oksalsyre, Apivar, "oxalsyre-fordamping". MAQS/maursyre (eneste middel som virker gjennom forseglet yngel, relevant for norsk høst) og ApiLife Var nevnes ikke i anbefalingene (kun i sykdomsseed). Timing kobles til måned, ikke til kolonien sin yngelstatus/brunstperiode. — Ufullstendig behandlingsrådgivning for norsk klima. — Inkluder maursyre/MAQS for sen-sommer og koble vinter-oksalsyre til registrert yngelfri-status, ikke kun kalendermåned.

**[MEDIUM]** `QueenSection.tsx:8-13` — Dronninghåndtering dekker opphav, rase, merkefarge og alder. Mangler **avlslinje/morlinje**, **5-års merkefargesyklus-validering** (farge bør avledes/sjekkes mot årstall — hvit=1/6, gul=2/7 osv.), og **nukleus/avleggerkobling**. Ingen kobling til dronningavl/celleoppdrett. — Avlsdokumentasjon og sporbarhet er begrenset for seriøse birøktere. — Legg til avlslinje-felt og auto-foreslå merkefarge fra `introducedAt`-år.

**[LAV]** `kalender/index.tsx` + `seasonChecklist.ts` — Sesongdekningen er god (vinterklargjøring aug–okt, oksalsyre des/jan, vårrevisjon mars, svermkontroll mai–jun, slynging jul, høstbehandling aug–sep). Mangler eksplisitt **vinterdødelighet-registrering i mars** (NBL fører nasjonal vintertapsstatistikk) og **sonejustering** (sone 1–8: Nord-Norge har annen timing enn Sør). — Checklist er statisk uavhengig av brukerens klimasone. — Gjør checklist-timing soneavhengig og legg inn vårtaps-logging.

**[LAV]** `Step4.tsx:20,56` — "Kubehumør"/temperament er 1–5 emoji uten faglig forankring (aggresjon, svermtendens, ro er separate akser). — Mindre presis enn NBL sin temperamentsvurdering. — Vurder separat aggresjon/ro-skala.

## Topp-3 anbefalinger
1. **Sentraliser varroaterskler** i delt konstantfil med metode→terskel→kilde, og fiks inkonsistensen mellom HealthScore og Recommendation (HØY). ~3 t.
2. **Utvid inspeksjonsskjema** med droneyngel, lukt, og koble eksisterende `diseaseObservations`-felt til sykdomslista (HØY). ~6 t.
3. **Strukturér behandlingslogg** med virkestoff-enum + dose/tilbakeholdelse for journalplikt, og legg MAQS/maursyre inn i anbefalinger (MEDIUM). ~5 t.

### Konkurransegap (BeeKeepPal / Beekeeper's Notebook)
1. Strukturert sykdomsdiagnose-flyt i inspeksjon (BiVokter har data, men ikke flyt).
2. Vekt/sensor-integrasjon for kontinuerlig overvåking.
3. Foring-logg (sukker/fondant kg) — finnes som migrasjon `0011_feed` men ingen UI.
4. Avlegger/splitt-sporing med mor-kube-kobling.
5. Eksport av behandlingsjournal (PDF til Mattilsynet).

**Unikt norsk i BiVokter:** AI-varroaanalyse av klisterplate, Yr.no-værintegrasjon, norsk pollenkalender, NBL-/Mattilsynet-forankret sykdomsguide med meldeplikt, og norsk landbie som førstevalg-rase.
