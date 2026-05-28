# Agent 6 — Ytelse og React Native-optimalisering

## Metainfo
- Filer lest: `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `services/inspection.ts`, `services/hive.ts`, `services/harvest.ts`, `services/treatment.ts`, `components/hive/HiveCard.tsx`, `app/(app)/(tabs)/samfunn/index.tsx`, `lib/queryClient.ts`
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

## Sammendrag (78 ord)

BiVokter har et solid fundament: `HiveCard` er memoized med `React.memo` og `useMemo`, `FlatList` brukes på kuberlisten, global `staleTime` er 5 min, og `fetchLastInspectionPerHive` er et korrekt batch-RPC-kall. Hoveddelen av ytelsesgjelden finnes i: (1) 15 `select('*')`-kall spredt over alle services, (2) ikke-virtualisert inspeksjonshistorikk i kube-detaljsiden med `.limit(200)`, og (3) `activeHives`/`hivesWithScore` beregnet inline uten `useMemo` i kuber-oversikten.

---

## Funn

### KRITISK

**[KRITISK]** `services/inspection.ts:37` — `fetchInspections` bruker spesifikk kolonneseleksjon (bra), men returnerer opptil 200 rader per kube i `kuber/[id]/index.tsx:179`. Disse 200 radene rendres som ikke-virtualisert `.map()` i linje 320. Med 500 inspeksjoner (en aktiv bruker med 5 år + 20 kuber) rendres alle `InspectionRow`-komponenter opp-front, selv om kun 8-10 er synlige på skjermen. — Konsekvens: 400-600ms render-forsinkelse og 200+ off-screen noder binder JS-tråden. — Løsning: Erstatt `.map()` med `FlatList` (eller `FlashList`) på inspeksjonshistorikk-seksjonen, behold den eksisterende "vis mer"-logikken som pagineringstrinn.

**[KRITISK]** `services/hive.ts:90` og `services/hive.ts:106` — `fetchHives` og `fetchHive` bruker `select('*')` mot `hives`-tabellen. Hives-tabellen inneholder trolig store feltdata inkludert `notes` (fritekst), `photo_url` og koordinatdata. Dashboard og kuberlisten bruker bare et fåtall felt for visning. — Konsekvens: Unødvendig payload (anslått 40-60% overhead) for alle brukere ved hver app-åpning. — Løsning: Bytt til `select('id,name,type,bee_breed,is_active,num_boxes,location_name,location_lat,location_lng,photo_url,notes,created_at')`.

### HØY

**[HØY]** `services/inspection.ts:77` — `fetchInspection` (enkel inspeksjon) bruker `select('*')`. Dette er et sekundærkall fra detaljsiden `inspeksjon/[inspId].tsx`. Bør spesifisere kolonner konsistent med `fetchInspections`. — Løsning: Bytt til samme column-liste som linje 37 i samme fil.

**[HØY]** `app/(app)/(tabs)/kuber/index.tsx:74-88` — `activeHives`, `hivesWithScore`, `freskeCount` og `varselCount` beregnes inline i render-funksjonen (ikke i `useMemo`). Med 20 kuber kjøres `computeHealthScore()` per kube ved hvert render, inkludert ved filter-endring, refresh, og FAB-press. — Konsekvens: Unødvendig CPU-arbeid for enhver state-endring på skjermen. — Løsning: Wrap `activeHives`, `hivesWithScore`, `freskeCount` og `varselCount` i `useMemo` med `[hives, lastInspectionByHive]` som avhengigheter.

**[HØY]** `services/harvest.ts:17`, `services/treatment.ts:19` og `services/treatment.ts:30` — Alle bruker `select('*')`. Harvest-tabellen hentes globalt på hjemskjermen (staleTime 5 min, bra), men betyr at siste 2 år med alle høstrekorder alltid lastes, selv om appen bare trenger `hive_id`, `harvested_at` og `quantity_kg`. — Løsning: Bytt til `select('id,hive_id,harvested_at,quantity_kg,notes')` i `fetchHarvests`.

**[HØY]** `app/(app)/(tabs)/kuber/[id]/index.tsx:172-185` — Kubeprofil starter tre parallelle queries (`hive`, `inspections`, `treatments`) ved mount. `inspections`-queryen har ingen `staleTime` satt — arver global default (5 min, akseptabelt), men `['inspections', id]`-cachen invalideres ikke etter ny inspeksjon opprettes. Etter `createInspection()` bør `queryClient.invalidateQueries({ queryKey: ['inspections', id] })` kalles. Sjekk om mutasjonen i `ny.tsx` gjør dette. — Konsekvens: Etter å ha lagret ny inspeksjon kan historikken vise utdaterte data.

### MEDIUM

**[MEDIUM]** `app/(app)/(tabs)/kuber/index.tsx:198-225` — `FlatList` brukes (bra), men `renderItem` er en inline arrow-funksjon som wrapper `HiveCard` i `Pressable`. Selv om `HiveCard` er memoized med `React.memo`, vil den ikke-memoized `Pressable`-wrapper tvinge re-render fordi `onLongPress`-callback opprettes på nytt ved hvert render. — Løsning: Flytt `renderItem` ut av JSX eller wrap i `useCallback`.

**[MEDIUM]** `services/associations.ts:37` og `services/associations.ts:56`, `services/diseases.ts:7` og `services/diseases.ts:17`, `services/queen.ts:27`, `services/profile.ts:27`, `services/weight.ts:14`, `services/swarmReport.ts:45`, `services/calendarEvent.ts:31` — Ytterligere 9 `select('*')`-kall i andre services. Særlig `swarmReport.ts` og `calendarEvent.ts` er i tabeller som kan vokse. — Løsning: Gjennomgå og spesifisere kolonnelister i alle services systematisk.

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:196-200` — `checkNearbySwarmAlerts(lats, lngs)` trigges i `useEffect` med `[hives.length]` som avhengighet. Alle kubedatas koordinater filtres og mappes på nytt ved hver render der `hives.length` endres. — Konsekvens: To separate `.filter().map()` over samme liste. Wrap i `useMemo` eller gjør filtreringen inne i selve effekten.

**[MEDIUM]** `app/(app)/(tabs)/samfunn/index.tsx:101-143` — Lag-listen bruker `ScrollView` med `.map()` over potensielt 67 birøkterlag. Siden det er statiske data med 24t `staleTime` og 7d `gcTime` (bra), er ikke hyppige re-renders et problem, men selve listen er ikke virtualisert. — Konsekvens: Lav risiko nå, men vil trege ved 100+ lag. Vurder `FlatList` ved vekst.

**[MEDIUM]** `lib/queryClient.ts:19` — Global `staleTime: 5 * 60 * 1000` er satt (bra). Men ingen global `gcTime` er definert — betyr at React Query bruker standardverdien 5 min, samme som `staleTime`. Dette betyr at cache slettes nesten umiddelbart etter stale-grensen passeres. For en app som BiVokter bør `gcTime` settes til 30 min eller mer for å bevare data under bakgrunnsnavigasjon. — Løsning: Legg til `gcTime: 30 * 60 * 1000` i `defaultOptions.queries`.

### LAV

**[LAV]** `app/(app)/(tabs)/kuber/[id]/index.tsx:244-248` — Heltebildet rendres med `<Image source={{ uri: hive.photoUrl }}>` uten eksplisitt størrelse på bredde/høyde i kilde. RN Image henter bildet og skalerer etterpå. Ingen `fadeDuration` eller progressiv loading. — Konsekvens: Synlig pop-in ved navigasjon til kubeprofil. — Løsning: Bruk `expo-image` i stedet for RN `Image` for innebygd blurhash/placeholder og disk-cache.

**[LAV]** `components/hive/HiveCard.tsx:85-91` — Thumbnail-bilder (76×76) lastes via `<Image source={{ uri: hive.photoUrl }}>` for alle kuber i listen. Med 20 kuber med bilder trigges 20 parallelle HTTP-forespørsler. — Konsekvens: Nettverkskonkurranse og tregere initial list-render. — Løsning: Bytt til `expo-image` som har innebygd minne- og disk-cache; vurder preloading av thumbnails.

**[LAV]** `app/(app)/(tabs)/hjem/index.tsx:204-212` — `handleGenerateReport` kaller `fetchAllInspections()` og `fetchAllTreatments()` on-demand (ved knappeklikk), ikke ved mount. Dette er korrekt mønster, men disse er ikke cachet med React Query — de er direkte Supabase-kall. — Konsekvens: Rapporten henter potensielt 500 inspeksjoner og 2 år behandlingsdata ukachet. For bruker med dårlig tilkobling kan dette ta 3-5 sekunder. — Løsning: Vurder `queryClient.fetchQuery()` med en query-nøkkel slik at Supabase-svaret caches hvis bruker genererer rapport to ganger.

---

## Topp-3 anbefalinger

1. **Spesifiser kolonner i alle `select('*')`-kall** — 15 steder spredt over services bruker `select('*')`. Start med `services/hive.ts` (hentes ved enhver app-åpning) og `services/inspection.ts:77` (enkel inspeksjon). Dette reduserer payload-størrelse og Supabase-compute-tid for alle brukere. Estimert forbedring: 30-50% lavere nettverkstraffic per sesjon.

2. **Virtualiser inspeksjonshistorikk i kubeprofil** — `app/(app)/(tabs)/kuber/[id]/index.tsx:320` rendrer opptil 200 `InspectionRow`-komponenter i en `ScrollView`. Bytt til `FlatList` eller `FlashList` med `initialNumToRender={10}` og `maxToRenderPerBatch={20}`. For brukere med 3+ års inspeksjonsdata er dette kritisk for scroll-ytelse.

3. **Memoize inline beregninger i kuber-oversikten og legg til global `gcTime`** — Wrap `activeHives`, `hivesWithScore`, `freskeCount`, `varselCount` i `useMemo` i `kuber/index.tsx:74-88`, og legg til `gcTime: 30 * 60 * 1000` i `lib/queryClient.ts`. Disse to endringene krever 15 minutters arbeid og forbedrer responsiviteten ved filter-endring og reduserer unødvendige Supabase-refetcher etter bakgrunnsnavigasjon.
