# BiVokter — Multi-Agent App Review

12 parallelle agenter. Kjør alle samtidig. Hver prompt er selvforsynt.

---

## KONTEKST (lim inn øverst i alle agenter)

```
BiVokter er en norsk birøkterapp.
Stack: React Native 0.83 · Expo SDK 55 (New Architecture) · expo-router v3 ·
Supabase (PostgreSQL + Storage + Edge Functions) · React Query · Zustand ·
Sentry · Mapbox · RevenueCat (Android IAP) · Skia + Reanimated

Abonnementer:
  - Starter: gratis, maks 3 kuber
  - Hobbyist: 49 kr/mnd — AI varroa-analyse
  - Profesjonell: 149 kr/mnd — statistikk, høstingsoversikt
  - Lag: 499 kr/mnd — samarbeid, deling av kuber

Prosjektrot: C:\Users\andre\claudecode\Prosjekter\Bier\biapp

Viktige filer:
  app/(app)/(tabs)/hjem/index.tsx         — Dashboard
  app/(app)/(tabs)/kuber/                 — Kubehåndtering (Stack navigator)
  app/(app)/(tabs)/kuber/[id]/index.tsx   — Kubeprofil
  app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx  — Ny inspeksjon (wizard)
  app/(app)/(tabs)/laer/index.tsx         — Læringsressurser / sykdomsguide
  app/(app)/(tabs)/kalender/index.tsx     — Kalender + sesongsjekkliste
  app/(app)/(tabs)/samfunn/index.tsx      — Birøkterlag, utstyrsleverandører, sverme-kart
  app/(app)/_layout.tsx                   — Auth-guard, oppstart, push-tillatelse
  services/                               — 18 tjenester (hive, inspection, subscription, ++)
  components/                             — 47 komponenter
  constants/colors.ts                     — Design system (farger, Shadows, Radii)
  supabase/migrations/                    — 34 migrasjoner (komplett skjema)
```

---

## AGENT 1 — UX-flyt og navigasjonsarkitektur

**Oppgave:** Gjennomgå all navigasjon, brukerflyt og informasjonsarkitektur i appen.
Målet er å avdekke friksjonspunkter som hindrer brukere i å oppleve verdien av appen raskt — og dermed hindrer konvertering til betalt abonnement.

**Les disse filene:**
- `app/(app)/_layout.tsx` (full fil)
- `app/(app)/(tabs)/hjem/index.tsx` (full fil)
- `app/(app)/(tabs)/kuber/index.tsx` (full fil)
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (full fil)
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (full fil)
- `app/(app)/(tabs)/laer/index.tsx` (full fil)
- `app/(app)/(tabs)/samfunn/index.tsx` (full fil)
- `app/(app)/(tabs)/kalender/index.tsx` (full fil)

**Evaluer disse punktene:**

1. **Onboarding og tid-til-verdi**
   - Hva er det første brukeren ser etter registrering? Er det en blank skjerm eller guidet opplæring?
   - Hvor mange steg tar det å legge inn sin første kube?
   - Er det tydelig hva appen gjør og hvorfor brukeren bør fortsette å bruke den?
   - Finnes det en onboarding-flyt, eller kastes brukeren rett inn i en tom app?

2. **Navigasjonsstruktur**
   - Gir de 5 fanene (Hjem, Mine Kuber, Kalender, Lær, Samfunn) mening for en birøkter?
   - Er de viktigste handlingene (legg til kube, start inspeksjon, registrer behandling) lett tilgjengelige?
   - Finnes det dead ends eller navigasjonsveier som ikke har tilbakeknapp?
   - Hvor dypt er navigasjonsstakken i kuber-seksjonen? Er det forvirrende?

3. **Oppdagbarhet av funksjoner**
   - Vil en ny bruker finne AI-analyse, samarbeidsverktøy og statistikk uten å lete?
   - Er det tydelig hvilke funksjoner som krever betalt abonnement, og hvilken plan?
   - Finnes det funksjoner som er gjemt bak for mange trykk?

4. **Inspeksjonswizarden** (ny.tsx)
   - Er antall steg rimelig?
   - Er feltnavnene forståelige for en gjennomsnittlig norsk birøkter?
   - Er det tydelig hva som er obligatorisk vs. valgfritt?
   - Mister brukeren data hvis de avbryter halvveis?

5. **Tomme tilstander**
   - Hva ser en bruker med 0 kuber på hjem-skjermen?
   - Hva ser en bruker som ikke har gjort en inspeksjon på 30 dager?
   - Finnes det oppfordringer til handling i tomme tilstander?

**Leveranse:**
- Liste over UX-problemer, rangert etter alvorlighetsgrad (KRITISK / HØY / MEDIUM / LAV)
- For hvert problem: beskriv problemet, beskriv konsekvensen for konvertering, og gi konkret løsningsforslag
- Angi hvilken fil og hvilken komponent problemet finnes i
- Avslutt med topp-3 UX-forbedringer som vil ha størst positiv effekt på konvertering

---

## AGENT 2 — Visuell design og komponentkonsistens

**Oppgave:** Gjennomgå appens visuelle design, komponentbibliotek og konsistens.
BiVokter skal fremstå som en premium, profesjonell norsk app — ikke et hobbyprosjekt.
Vurder om designet kommuniserer kvalitet og tillit, noe som er avgjørende for at folk skal betale.

**Les disse filene:**
- `constants/colors.ts` (full fil)
- `components/hive/HiveCard.tsx` (full fil)
- `components/ui/Card.tsx` (full fil, hvis den finnes)
- `components/ui/Button.tsx` (full fil, hvis den finnes)
- `components/hive/WeightSection.tsx` (full fil)
- `components/hive/HealthScoreSection.tsx` (full fil)
- `components/home/WeatherCard.tsx` (full fil, hvis den finnes)
- `app/(app)/(tabs)/hjem/index.tsx` (full fil)
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (full fil)

**Evaluer disse punktene:**

1. **Designsystem-konsistens**
   - Bruker alle komponenter `Radii.*`, `Shadows.*` og `Colors.*` fra constants, eller finnes det hardkodede verdier?
   - Er typografiskalaen konsistent (fontstørrelser, vekter, linjeavstand)?
   - Brukes det samme spacing-system overalt, eller varierer det vilkårlig?
   - Er ikonbruk konsistent (samme ikonsett, samme størrelser)?

2. **Visuell hierarki**
   - Er det tydelig hva som er primær handling vs. sekundær på hver skjerm?
   - Kommuniserer fargene semantikk (grønn=bra, rød=problem) konsistent?
   - Er det riktig bruk av whitespace for å lede blikket?

3. **Komponentkvalitet**
   - Er HiveCard visuelt polert nok for en betalt app?
   - Er grafer og datapresentasjon (WeightSection, varroa-trend) lesbare og attraktive?
   - Har appen animasjoner og mikro-interaksjoner som kommuniserer kvalitet?

4. **Premium-følelse**
   - Hva skiller designet fra en gratis konkurrent?
   - Er det noe som ser "billig" ut og burde redesignes?
   - Brukes bilder/illustrasjoner effektivt?

5. **Mørk bakgrunn-strategi**
   - Appen bruker mørk bakgrunn (`#1A1A2E`). Er dette konsistent gjennomført?
   - Er tekst-kontrastratioer tilstrekkelige?
   - Finnes det skjermer som bryter med den mørke estetikken?

**Leveranse:**
- Designkvalitetsrapport med konkrete eksempler (fil og linje) på brudd mot designsystemet
- "Billig-liste": ting som ser uprofesjonelt ut og burde forbedres
- "Premium-muligheter": 5 konkrete designgrep som ville løftet appen til neste nivå visuelt
- Rangert liste over designfixes etter visuell impact

---

## AGENT 3 — Konvertering og monetiseringsoptimalisering

**Oppgave:** Analyser appens konverteringsstrategi fra gratis til betalt.
BiVokter lever av at folk oppgraderer. Avdekk alt som hindrer eller fremmer konvertering.

**Les disse filene:**
- `services/subscription.ts` (full fil)
- `components/ui/UpgradeModal.tsx` (full fil, eller søk etter upgrade-relaterte komponenter)
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (full fil — se etter tier-gates)
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (se etter AI-analyse-gate)
- `app/(app)/(tabs)/laer/index.tsx` (se etter premium-gating)
- `hooks/useEffectiveTier.ts` (eller lignende hooks — søk etter tier-sjekk)
- `app/(app)/(tabs)/hjem/index.tsx` (finnes det oppgraderingsoppfordringer?)

**Evaluer disse punktene:**

1. **Verdiforslag per tier**
   - Er det krystallklart hva brukeren *får* ved å oppgradere?
   - Er 49kr/mnd (Hobbyist) tydelig verdt det for brukeren? Hva er det konkrete salgsargumentet?
   - Er 499kr/mnd (Lag) for dyrt for en enkelt birøkter? Er målgruppen tydelig nok?
   - Kommuniserer appen ROI — at appen sparer deg for tid og tap?

2. **Gate-plasseringer**
   - Når brukeren møter en paywall — er det på det rette tidspunktet (etter de har sett verdien)?
   - Er det for tidlig gating som frustrerer nye brukere?
   - Er det funksjoner som burde vært gratis (lead magnets) men som er betalt?
   - Er det funksjoner som burde vært betalt men som er gratis (under-monetisering)?

3. **Upgrade-modal/dialog**
   - Er UpgradeModal overbevisende? Viser den konkret hva man får?
   - Er det en "Prøv gratis"-periode?
   - Er prisen forankret riktig (vis månedspris ved siden av et alternativ)?

4. **Friksjon ved oppgradering**
   - Hvor mange trykk tar det fra "jeg vil oppgradere" til "betalt"?
   - Forklares abonnementet på norsk og i forståelige termer?
   - Er det enkelt å se hva man betaler for?

5. **Retention-signaler**
   - Er det noe som minner gratisbrukere om hva de går glipp av?
   - Brukes aktivitetsdata (antall inspeksjoner, varroa-trend) for å vise verdien av betalte analyser?
   - Er det push-varsler knyttet til konvertering (f.eks. "Din varroa-telling er høy — analyser med AI")?

6. **Psykologiske konverteringsmekanismer**
   - Finnes det social proof (f.eks. "X birøktere bruker BiVokter")?
   - Er det urgency/scarcity-elementer?
   - Er det et "aha-moment" i appen der brukeren virkelig forstår verdien?

**Leveranse:**
- Konverteringshindre med alvorlighetsgrad
- 5 konkrete endringer som ville økt konverteringsraten mest (med begrunnelse fra konverteringspsykologi)
- Forslag til ny gate-strategi: hvilke funksjoner på hvilket tier
- Vurdering av prisstrategi: er 49/149/499 kr riktig priset for norsk marked?

---

## AGENT 4 — Birøkterfaglig domeneekspert

**Oppgave:** Vurder om BiVokter faktisk løser de riktige problemene for norske birøktere.
Du er en erfaren norsk birøkter som bruker appen kritisk. Finn mangler, feil og forbedringsmuligheter fra et faglig perspektiv.

**Les disse filene:**
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (full fil — kubeprofil med alle seksjonene)
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (full fil — inspeksjonswizard)
- `app/(app)/(tabs)/kalender/index.tsx` (full fil)
- `app/(app)/(tabs)/laer/index.tsx` (full fil)
- `services/inspection.ts` (full fil — hvilke data registreres?)
- `services/treatment.ts` (full fil — hvilke behandlingstyper støttes?)
- `services/queen.ts` (full fil — dronninghåndtering)
- `supabase/migrations/` — les migrasjonene for inspections, treatments, queens for å se databaseskjemaet

**Evaluer disse punktene:**

1. **Inspeksjonsregistrering**
   - Er feltene i inspeksjonswizarden riktige for norsk birøkt?
   - Mangler det viktige observasjoner (f.eks. droneleg, luktobservasjoner, bienes temperament)?
   - Er Langsroth-rammer riktig modellert? Støttes Warré og andre bistader?
   - Er varroa-tellingen gjennomtenkt (metode: alkoholspyling, pudderfall, sukkerrull)?

2. **Behandlingshåndtering**
   - Er de riktige varroabehandlingene støttet (ApiLife Var, Apivar, oksalsyre, MAQS)?
   - Er behandlingstiming knyttet til sesong og brunstid?
   - Er det Mattilsynet-relevant dokumentasjon (f.eks. resistensovervåking)?

3. **Sesongarbeidsflyt**
   - Dekker kalender og sjekkliste de faktiske sesongoppgavene for norsk klima?
   - Er vinterklargjøring, vinterdødelighet, vårrevision og svermetid godt representert?
   - Tar appen høyde for regionale forskjeller (nord vs. sør, kyst vs. innland)?

4. **Dronninghåndtering**
   - Er dronninginformasjonen tilstrekkelig (rase, alder, opphav, avlslinje)?
   - Støttes dronningavl og nukleusbokser?

5. **Manglende kritiske funksjoner**
   - Hva gjør konkurrenter (BeeKeepPal, Beekeeper's Notebook, Apiary Book) som BiVokter ikke gjør?
   - Hvilke funksjoner etterlyser norske birøktere oftest (basert på domenekunnskapen din)?
   - Er det integrasjoner som ville gitt stor verdi (f.eks. NBI-avlsdata, Mattilsynet, birøkterforsikring)?

6. **Faglig korrekthet**
   - Er terminologien korrekt på norsk?
   - Er helsepoengene og anbefalingene faglig forsvarlige?
   - Er sykdomsguiden oppdatert og presis?

**Leveranse:**
- Liste over faglige mangler og feil (med alvorlighetsgrad)
- 10 funksjoner som ville gjort BiVokter til den foretrukne appen for norske birøktere
- Vurdering av om appen er klar til å selges til seriøse (>50 kuber) birøktere
- Forslag til funksjoner som er unike for norsk marked (konkurransefortrinn)

---

## AGENT 5 — Kodekvalitet og arkitekturgjennomgang

**Oppgave:** Gjennomgå kodearkitektur, mønstre og teknisk gjeld i BiVokter.
Fokus er på vedlikeholdbarhet, skalerbarhet og korrekthet — ikke bugs, men strukturelle problemer.

**Les disse filene:**
- `services/hive.ts` (full fil)
- `services/inspection.ts` (full fil)
- `services/subscription.ts` (full fil)
- `components/hive/HiveCard.tsx` (full fil)
- `app/(app)/(tabs)/hjem/index.tsx` (full fil)
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (full fil)
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (full fil)
- `hooks/` — les alle hooks-filer
- `types/index.ts` (full fil)
- `lib/supabase.ts` (full fil)

**Evaluer disse punktene:**

1. **Arkitekturmønstre**
   - Er service-laget godt separert fra UI-laget?
   - Er det god separasjon mellom datahentningstypologi, forretningslogikk og presentasjon?
   - Er det god konsistens mellom services (samme mønster for create/update/delete/fetch)?
   - Er det riktig bruk av React Query (queryKeys, staleTime, caching)?

2. **Komponentdesign**
   - Er komponentene for store (>300 linjer er et tegn på for mye ansvar)?
   - Er det riktig separasjon mellom container-komponenter og presentasjons-komponenter?
   - Er det for mye prop-drilling, eller brukes Context/Zustand fornuftig?
   - Er det duplisering av kode mellom komponenter?

3. **TypeScript-bruk**
   - Er typene sterke nok, eller er det mye `any`?
   - Stemmer interface-definisjonene i `types/index.ts` med det som faktisk returneres fra Supabase?
   - Er det nullable-felter som ikke håndteres?

4. **Feilhåndtering**
   - Er feil håndtert konsistent (try/catch, .catch, onError)?
   - Er det silent failures (feil som svelges uten å varsle brukeren)?
   - Er Sentry-integrasjonen brukt riktig (capture ved riktige tidspunkt)?

5. **React Native-spesifikke gotchas**
   - Er det memory leaks (subscriptions/listeners som ikke ryddes opp)?
   - Er det unødvendig re-rendering (manglende memoization)?
   - Er det korrekt bruk av `useCallback`/`useMemo`?

6. **Teknisk gjeld**
   - Er det TODO/FIXME-kommentarer som peker på kjente problemer?
   - Er det mid-implementerte funksjoner?
   - Er det deprecated API-kall?

**Leveranse:**
- Arkitekturdiagram (tekstbasert) av nåværende struktur
- Liste over teknisk gjeld, rangert etter risiko
- Konkrete refaktoreringsforsalg med fil og linje
- Vurdering: er kodebasen skalerbar nok til 10 000 brukere?

---

## AGENT 6 — Performance og React Native-optimalisering

**Oppgave:** Avdekk ytelsesflaskehalser i BiVokter som påvirker brukeropplevelsen.
En treg app mister brukere — og betalende brukere forventer premium ytelse.

**Les disse filene:**
- `app/(app)/(tabs)/hjem/index.tsx` (full fil — ser etter unødvendige queries/re-renders)
- `app/(app)/(tabs)/kuber/index.tsx` (full fil — liste av kuber)
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (full fil — profil med mange seksjoner)
- `services/hive.ts` (full fil)
- `services/inspection.ts` (full fil — fetchLastInspectionPerHive)
- `components/hive/HiveCard.tsx` (full fil)
- `components/hive/WeightSection.tsx` (full fil)
- `app/(app)/(tabs)/samfunn/index.tsx` (full fil — liste av foreninger)
- `app/(app)/(tabs)/laer/index.tsx` (full fil)

**Evaluer disse punktene:**

1. **React Query-konfigurasjon**
   - Er `staleTime` og `gcTime` fornuftig satt per query?
   - Er det over-fetching (for hyppig refetch)?
   - Er det under-caching (data som burde vært cachet lenger)?
   - Er `enabled` riktig brukt for avhengige queries?
   - Er det N+1-problemer (én query per kube i en liste)?

2. **Rendering-ytelse**
   - Er store lister (kuber, foreninger, inspeksjoner) virtualisert med FlatList/FlashList?
   - Er HiveCard memoized (`React.memo`)?
   - Er callback-funksjoner i lister memoized (`useCallback`)?
   - Er det tunge beregninger i render-funksjoner som burde vært memoized (`useMemo`)?

3. **Navigasjons-ytelse**
   - Er skjermer lazy-loaded der det er mulig?
   - Er det tung komponentinitialisering som blokkerer navigasjon?
   - Er det Suspense-grenser på plass for tunge komponenter?

4. **Nettverksoptimalisering**
   - Er Supabase-queries selektive (`.select('id, name, ...')` vs. `.select('*')`)?
   - Er det queries som henter for mye data?
   - Er det paralleliserte queries der det er mulig?

5. **Bildehåndtering**
   - Er bilder i riktig størrelse (thumbnail vs. full)?
   - Er det image caching?
   - Er det progressiv loading?

6. **Bundle-størrelse**
   - Er det store dependencies som kan erstattes med lettere alternativer?
   - Er det tree-shaking i bruk?

**Leveranse:**
- Liste over ytelsesflaskehalser med estimert brukeropplevelseskonsekvens
- Konkrete kodeendringer for topp-5 ytelsesforbedringstiltak (med fil og linje)
- React Query-konfigurasjonsforbedringer
- Vurdering: vil appen skalere til en bruker med 20+ kuber og 200+ inspeksjoner?

---

## AGENT 7 — Robusthet, feilhåndtering og edge cases

**Oppgave:** Finn alle scenarioer der BiVokter kan feile, krasje eller gi en dårlig opplevelse.
En app folk betaler for MÅ være pålitelig. Upålitelig = frafall = churn.

**Les disse filene:**
- `app/(app)/_layout.tsx` (full fil — oppstartsfeil?)
- `app/(app)/(tabs)/hjem/index.tsx` (full fil — hva skjer ved nettverksfeil?)
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (full fil — datamisting?)
- `services/weather.ts` (full fil — hva skjer hvis Yr.no er nede?)
- `services/hive.ts` (full fil — feilhåndtering i mutations?)
- `services/subscription.ts` (full fil — hva skjer hvis RevenueCat er nede?)
- `components/ui/ErrorBoundary.tsx` (full fil, hvis den finnes)
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (full fil)

**Evaluer disse punktene:**

1. **Nettverksfeil**
   - Hva viser appen hvis Supabase-tilkoblingen feiler?
   - Er det retry-mekanismer på plass?
   - Er det offline-tilstand som brukeren varsles om?
   - Kan brukeren se sin siste kjente data uten internett?

2. **Datamisting**
   - Kan brukeren miste data hvis appen krasjer midt i inspeksjonswizarden?
   - Er det auto-save eller draft-funksjonalitet i lange former?
   - Hva skjer hvis upload av bilde feiler midt i en inspeksjon?

3. **Edge cases i data**
   - Hva skjer med en bruker som har 0 kuber?
   - Hva skjer med en bruker som har 50 kuber (godt over starter-grensen)?
   - Hva skjer hvis varroa-count er null, tom streng eller negativ?
   - Hva skjer hvis GPS-posisjon ikke kan hentes?
   - Hva skjer hvis RevenueCat-synk feiler ved oppstart?

4. **Autentisering**
   - Hva skjer hvis JWT-tokenet utløper midt i en handling?
   - Hva skjer hvis brukeren er logget ut på en annen enhet?
   - Er det token refresh-håndtering?

5. **Krasjerisiko**
   - Er det `mapX()`-kall som kan kaste exceptions ved null-verdier?
   - Er det unhandled promise rejections?
   - Er det race conditions mellom parallelle mutations?

6. **Error Boundary-dekning**
   - Er kritiske skjermer wrappet i Error Boundaries?
   - Gir Error Boundaries brukeren en vei ut (f.eks. "Last inn på nytt")?

**Leveranse:**
- Krasjerisiko-liste rangert etter sannsynlighet × konsekvens
- Datamisting-scenarioer med løsningsforslag
- Konkrete kodeendringer for å hardene appen (fil og linje)
- Vurdering: er appen klar for 1000 daglige aktive brukere uten å krasjne?

---

## AGENT 8 — Sikkerhet og personvern (GDPR)

**Oppgave:** Gjennomgå BiVokters sikkerhetsstilling og GDPR-overholdelse.
Appen håndterer persondata om norske brukere — dette er kritisk for tillit og lovpålagt.

**Les disse filene:**
- `supabase/migrations/` — les alle (se på RLS-policyer for alle tabeller)
- `supabase/functions/delete-account/index.ts` (full fil)
- `supabase/functions/revenuecat-webhook/index.ts` (full fil)
- `services/hive.ts` (full fil — validering av input?)
- `services/inspection.ts` (full fil)
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (full fil — validering i UI?)
- `lib/supabase.ts` (full fil — klientkonfigurasjon)

**Evaluer disse punktene:**

1. **Row Level Security (RLS)**
   - Har ALLE tabeller med brukerdata RLS aktivert?
   - Er SELECT-policyer korrekte (brukere ser kun egne data)?
   - Er INSERT-policyer korrekte (kan en bruker sette `user_id` til en annens ID)?
   - Er UPDATE/DELETE-policyer korrekte?
   - Er det tabeller uten RLS som burde hatt det?

2. **Edge Function-sikkerhet**
   - Er `revenuecat-webhook` beskyttet mot replay-angrep og uautoriserte kall?
   - Er `delete-account` beskyttet mot CSRF?
   - Er det rate limiting på Edge Functions?
   - Logges sensitiv data i Edge Function-logger?

3. **Input-validering**
   - Valideres brukerinput på klientsiden?
   - Er det SQL-injeksjonsrisiko (usannsynlig med Supabase client, men sjekk RPC-kall)?
   - Er bildeopplasting begrenset til riktige filtyper og størrelser?

4. **GDPR-overholdelse**
   - Sletter `delete-account`-funksjonen ALL brukerdata (sjekk alle tabeller og buckets)?
   - Finnes det data i Edge Function-logger som ikke burde lagres?
   - Er det en personvernpolicy i appen?
   - Er samtykke til push-varsler håndtert riktig?
   - Lagres det mer data enn nødvendig (dataminimering)?

5. **Hemmeligheter og nøkler**
   - Er det hardkodede secrets i kildekoden?
   - Er environment-variabler korrekt skilt mellom `EXPO_PUBLIC_*` (klient) og private (server)?

6. **Autentiseringssikkerhet**
   - Er JWT-refresh-logikk korrekt?
   - Er det token-lekkasje i logger eller feilmeldinger?

**Leveranse:**
- Sikkerhetsproblem-liste med KRITISK / HØY / MEDIUM / LAV
- RLS-matrisegjennomgang (tabell × operasjon: OK / MANGLER / FEIL)
- GDPR-hullanalyse: hva mangler for full GDPR-overholdelse
- Konkrete SQL-endringer for RLS-hull
- Vurdering: er appen trygg å lansere for norske brukere?

---

## AGENT 9 — Tilgjengelighet (accessibility)

**Oppgave:** Vurder BiVokters tilgjengelighet for brukere med nedsatt funksjonsevne.
God tilgjengelighet er lov i Norge (WCAG 2.1 AA er standard for digitale tjenester) og øker brukerbase.

**Les disse filene:**
- `components/hive/HiveCard.tsx` (full fil)
- `components/ui/Button.tsx` (full fil, hvis den finnes)
- `app/(app)/(tabs)/hjem/index.tsx` (full fil)
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (full fil)
- `constants/colors.ts` (full fil — sjekk kontrastratioer)
- `components/hive/WeightSection.tsx` (full fil — er grafer tilgjengelige?)
- `app/(app)/(tabs)/kalender/index.tsx` (full fil)

**Evaluer disse punktene:**

1. **Skjermleser-støtte**
   - Er alle interaktive elementer merket med `accessibilityLabel`?
   - Er bilder merket med alternativtekst?
   - Er det riktig `accessibilityRole` på knapper, overskrifter og navigasjon?
   - Er logiske leseordener implementert (`accessibilityViewIsModal`, fokushåndtering)?

2. **Berøringsstørrelser**
   - Er alle berøringsmål minst 44×44pt (Apple) / 48×48dp (Google)?
   - Er det nok mellomrom mellom interaktive elementer?

3. **Fargekontrast**
   - Møter tekst-bakgrunn-kombinasjonene WCAG AA-kravet (4.5:1 for normal tekst, 3:1 for stor)?
   - Sjekk spesielt: honing (#F5A623) mot mørk bakgrunn, grå tekst mot mørk bakgrunn
   - Er informasjon formidlet BARE via farge (uten tekst/ikon som backup)?

4. **Dynamisk tekststørrelse**
   - Støtter appen brukerens preferanser for større tekst (Dynamic Type / font scaling)?
   - Krasjer eller ødelegges layout ved stor tekststørrelse?

5. **Grafer og datapresentasjon**
   - Er vektgrafer, varroa-trendarmer og andre visualiseringer tilgjengelige for skjermlesere?
   - Er det tekstbaserte alternativer til grafisk data?

6. **Motoriske utfordringer**
   - Kan appen brukes uten sveipegester (alternative berøringsstier)?
   - Er wizard-trinn gjennomførbare uten fingerpresisjon?

**Leveranse:**
- WCAG 2.1 AA sjekklistegjennomgang (bestå / feile / delvis)
- Konkrete tilgjengelighetsfeil med fil og linje
- Prioritert liste over tilgjengelighetsfixes
- Vurdering: vil appen bestå App Store/Play Store tilgjengelighetsanmeldelse?

---

## AGENT 10 — Retention, engasjement og vanebygging

**Oppgave:** Analyser hva som holder brukere aktive i BiVokter over tid.
En bruker som ikke bruker appen, kansellerer abonnementet. Finn alt som kan øke daglig/ukentlig aktivisering.

**Les disse filene:**
- `app/(app)/(tabs)/hjem/index.tsx` (full fil — hva motiverer daglig besøk?)
- `services/notifications.ts` (full fil — hva varsles om og når?)
- `supabase/functions/weekly-hive-alerts/` (full fil — hva sendes ukentlig?)
- `app/(app)/(tabs)/kalender/index.tsx` (full fil — sesongsjekkliste som retention-mekanisme?)
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (full fil — hva oppfordres brukeren til å gjøre?)
- `components/home/` — les alle komponenter her

**Evaluer disse punktene:**

1. **Push-varsler**
   - Hvilke varsler sendes, og på hvilke tidspunkter?
   - Er varslene handlingsorienterte (fører til en konkret handling i appen)?
   - Er det for få varseltyper (under-aktivering)?
   - Er det varsler som kan oppleves som spam (over-aktivering)?
   - Er det sesongbaserte varsler (f.eks. "Det er tid for vårrevisjonen")?

2. **Daglige/ukentlige vaner**
   - Finnes det et daglig insentiv til å åpne appen?
   - Er dashboardet oppdatert nok til å gi ny informasjon hver dag?
   - Er det et "streak"-system eller annen gamification?
   - Gir Yr.no-integrasjonen en grunn til å sjekke appen regelmessig?

3. **Progresjon og mestring**
   - Gir appen en følelse av mestring over tid (f.eks. "Du har redusert varroa med 40% siden i fjor")?
   - Er det milepæler eller achievements?
   - Vises fremgang mot sesongmål?

4. **Tomme tilstander som retention-risiko**
   - Hva skjer mellom inspeksjoner (typisk 7-14 dager for norsk klima)?
   - Er det innhold som gir verdi selv uten ny data?
   - Brukes lærings-seksjonen som retention-mekanisme?

5. **Sosiale mekanismer**
   - Kan brukere dele innsikter fra birøkterlaget sitt?
   - Er svermekart-funksjonen en grunn til å sjekke appen regelmessig?
   - Er samarbeidsfunksjonen (Lag-tier) aktiviserende nok?

6. **Churn-signaler**
   - Er det varsler som fanger opp brukere som er i ferd med å slutte?
   - Er det re-engagement-flyt for inaktive brukere?

**Leveranse:**
- Retention-analyse: hvilke mekanismer finnes, hva mangler
- 10 konkrete retention-forbedringer rangert etter forventet effekt
- Push-varsel-strategi: hvilke nye varsler burde implementeres
- Vurdering: vil en gjennomsnittlig norsk birøkter bruke appen minst én gang per uke?

---

## AGENT 11 — Onboarding og første kjøring

**Oppgave:** Gjennomgå BiVokters onboarding-opplevelse kritisk.
Brukere bestemmer om de fortsetter innen de første 3 minuttene. Finn alt som kan forbedres.

**Les disse filene:**
- `app/(auth)/` — les alle filer i auth-mappen (registrering, innlogging)
- `app/(app)/_layout.tsx` (full fil — hva skjer etter innlogging?)
- `app/(app)/(tabs)/hjem/index.tsx` (full fil — hva ser en ny bruker?)
- `app/(app)/(tabs)/kuber/index.tsx` (full fil — hva ser en bruker uten kuber?)
- `app/(app)/(tabs)/kuber/ny.tsx` (full fil — opprett første kube)
- Se etter onboarding-spesifikke komponenter i `components/`

**Evaluer disse punktene:**

1. **Registreringsprosess**
   - Hvor mange steg tar det å registrere seg?
   - Ber appen om for mye informasjon for tidlig?
   - Er det sosial innlogging (Google, Apple) — noe som øker konvertering massivt?
   - Er e-postbekreftelse et friksjonspunkt?

2. **Første innlogging — tom app**
   - Hva er det FØRSTE brukeren ser etter at de er logget inn?
   - Er det en velkomstmelding?
   - Er det en "Kom i gang"-guide?
   - Er det tydelig hva brukeren burde gjøre NESTE?

3. **Første kube**
   - Er "Opprett din første kube"-flyten intuitiv?
   - Er feltene forståelige (hva er "birøkttype"? hva er "Langstroth"?) for nybegynnere?
   - Er det hjelp/tooltips på vanskelige begreper?
   - Er det eksempeldata eller demo-modus?

4. **Aha-moment**
   - Hva er BiVokters "aha-moment" — øyeblikket der brukeren virkelig forstår verdien?
   - Er dette øyeblikket designet inn i onboarding, eller skjer det tilfeldig?
   - Tar det for lang tid å nå aha-momentet?

5. **Tomme tilstander**
   - Er tomme tilstander engasjerende og handlingsorienterte?
   - Er det grafikk/illustrasjoner som gjør tomme tilstander hyggelige?
   - Er det innhold (tips, guider) som fyller tomme tilstander med verdi?

6. **Progresjon**
   - Er det en onboarding-sjekkliste (f.eks. "Legg til en kube → Gjør en inspeksjon → Sett opp varsler")?
   - Belønnes brukeren for å fullføre onboarding?

**Leveranse:**
- Onboarding-flytdiagram (tekstbasert) med friksjonspunkter markert
- "Tid-til-verdi"-analyse: minutter fra registrering til aha-moment
- 5 konkrete onboarding-forbedringer som ville økt aktiveringsraten
- Vurdering: vil en nybegynner birøkter klare å komme i gang uten hjelp?

---

## AGENT 12 — Dataarkitektur og backend-optimalisering

**Oppgave:** Vurder BiVokters databaseskjema, Supabase-konfigurasjon og backend-arkitektur.
Dårlig datastruktur er vanskelig å fikse etter lansering — finn problemer nå.

**Les disse filene:**
- Alle filer i `supabase/migrations/` (viktigst: de første 10 og de siste 10)
- `services/inspection.ts` (full fil — query-mønstre)
- `services/hive.ts` (full fil)
- `services/treatment.ts` (full fil)
- `supabase/functions/revenuecat-webhook/index.ts` (full fil)
- `supabase/functions/weekly-hive-alerts/index.ts` (full fil)
- `lib/supabase.ts` (full fil)

**Evaluer disse punktene:**

1. **Skjemadesign**
   - Er tabellstrukturen normalisert riktig?
   - Er det manglende foreign key-constraints?
   - Er datoer/tidsstempler riktig typet (timestamptz vs timestamp)?
   - Er det felt som burde hatt NOT NULL-constraint men mangler?
   - Er det `DEFAULT`-verdier der det er fornuftig?

2. **Indekser**
   - Er det indekser på alle foreign keys?
   - Er det indekser på felt som brukes hyppig i WHERE-klausuler (`user_id`, `hive_id`, `inspected_at`)?
   - Er det for mange indekser på tabeller med mye skriving?

3. **RLS og ytelse**
   - Er RLS-policyer ytelsesoptimale (unngår de subquery-scanning)?
   - Er det policyer som gjør fulle table scans?
   - Er `auth.uid()` brukt effektivt i policyer?

4. **Query-mønstre**
   - Er det N+1-problemer i service-laget?
   - Er det queries som henter unødvendig mye data (SELECT * i stedet for spesifikke felter)?
   - Er det suboptimale joins som burde vært RPC-funksjoner?
   - Er `get_latest_inspections_per_hive` RPC-en optimal?

5. **Edge Functions**
   - Er Edge Functions idempotente (kan kjøres to ganger uten bivirkning)?
   - Er RevenueCat-webhooken sikker mot race conditions (to kjøp på samme tid)?
   - Er weekly-hive-alerts-funksjonen effektiv nok for 10 000 brukere?

6. **Skalerings-risiko**
   - Hvilke deler av skjemaet vil skalere dårlig med vekst?
   - Er det behov for partisjonering av store tabeller?
   - Er pg_cron-jobber robuste mot overlapp?

**Leveranse:**
- Skjemakvalitetsrapport med konkrete SQL-forbedringer
- Indeks-anbefalinger med CREATE INDEX-setninger
- N+1-liste med løsningsforslag
- Vurdering: vil databasen håndtere 10 000 brukere × 5 kuber × 50 inspeksjoner each?

---

## SYNTESE-AGENT — Samle og prioritere all innsikt

Kjør denne ETTER at alle 12 agenter er ferdige.

**Oppgave:** Les rapportene fra alle 12 agenter og lag en prioritert handlingsplan for BiVokter.

**Kontekst:** BiVokter er en norsk birøkterapp i tidlig lanseringsfase. Målet er å gå fra 0 til betalende brukere.
Teamet er lite (én til to utviklere). Prioritering er kritisk — vi kan ikke gjøre alt.

**Syntese-oppgave:**

1. **Toppliste: 20 endringer med størst ROI**
   Ranger de 20 viktigste forbedringene på tvers av alle agenter etter:
   - Konverteringseffekt (vil dette hjelpe folk til å betale?)
   - Implementeringskostnad (rask vs. langvarig)
   - Risiko (sikkerhet/stabilitet vs. nice-to-have)

2. **Umiddelbare fixes (denne uken)**
   Ting som tar under 2 timer og burde gjøres nå.

3. **Sprint 1 (neste 2 uker)**
   De 5 viktigste endringene for konvertering.

4. **Roadmap (neste 3 måneder)**
   Strategiske funksjoner og arkitekturarbeid.

5. **Ting som IKKE burde prioriteres nå**
   For å unngå prematur optimalisering.

6. **Én setning om appens nåværende tilstand**
   Er den klar til å nå 100 betalende brukere?

---

*Opprettet: 2026-05-27 | Prosjekt: BiVokter | Versjon: versionCode 17*
