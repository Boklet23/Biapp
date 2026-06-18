# Agent 6 — Ytelse og React Native-optimalisering

## Metainfo
- Filer lest: `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `app/(app)/(tabs)/samfunn/index.tsx`, `services/inspection.ts`, `services/hive.ts`, `components/hive/HiveCard.tsx`, `components/hive/HivesMapView.tsx`, `components/inspection/Step3.tsx`, `components/animations/BeeParticles.tsx`, `components/animations/HiveScene.tsx`, `components/animations/HivePlaceholder.tsx`, `lib/queryClient.ts`, `package.json`, migrasjoner (CREATE INDEX-søk 0001–0045)
- Filer ikke funnet: ingen
- Diff mot forrige review: lest arkiv: ja. **Fikset siden sist:** hjem-skjermen har nå `useMemo` på `activeHives`/`alerts`/`urgentInspHives`/`avgHealth` og `useCallback` på rapportgenerering. **Ikke fikset:** manglende `user_id`-indeks for RPC, ustabile closures i kubelisten, `select('*')` i hive.ts, dobbel inspeksjonshenting på hjem, RN `Image` i stedet for expo-image. **Korreksjon:** forrige rapport hevdet expo-image var dependency — det stemmer ikke (kun `expo-image-picker` i package.json:29).

## Sammendrag (maks 80 ord)
Grunnarkitekturen er fortsatt sunn: batch-RPC uten N+1, FlatList for kubelisten, memoized HiveCard, fornuftig staleTime per datatype og lazy-lastede kart. Men tre HØY/MEDIUM-funn fra forrige review står urørt (DB-indeks, kubeliste-closures, dobbel inspeksjonshenting), og et nytt funn er at AI-varroa-analysen sender ubeskåret base64-foto (2–4 MB JSON) over mobilnett uten resize. Skalerer OK til 20 kuber, men med unødvendig payload og re-renders.

## Fungerer godt (maks 5 punkter)
- `fetchLastInspectionPerHive` (services/inspection.ts:47-57) er ett RPC-kall — ingen N+1; brukes på både hjem og kuber.
- Hjem-skjermens avledede verdier er nå memoized (hjem/index.tsx:169-194) — forbedring siden sist.
- React Query-konfig er fornuftig: global `staleTime: 5 min, retry: 2` (lib/queryClient.ts:24-25), vær 1 t, foreninger/utstyr 1 t + gcTime 7 d. Ingen refetch-storm ved fanebytte observert.
- Kart (`HiveMap`, `SwarmMap`) og animasjoner lazy-lastes med `lazy()`/`Suspense`; HivePlaceholder bruker Reanimated SharedValue (HivePlaceholder.tsx:317-336) og BeeParticles bruker `useNativeDriver: true` — ingen setState/rAF-antimønster funnet.
- `fetchInspections`/`fetchAllInspections` har eksplisitt kolonneliste, limit (200/500) og 1-års datofilter.

## Funn

**[HØY]** `supabase/migrations/0038_performance_indexes.sql:4` — Fortsatt ingen indeks med `user_id` som ledende kolonne på `inspections`; eneste er `idx_inspections_hive_inspected_desc`. RPC-en `get_latest_inspections_per_hive` filtrerer på `user_id = auth.uid()` og kalles på både hjem og kuber-fanen. Ingen av migrasjonene 0039–0045 adresserer dette. — Konsekvens: seq-scan som vokser lineært med total inspeksjonsmengde; rammer dashboard-lastetid for alle brukere. — Løsning: `CREATE INDEX idx_inspections_user_hive_inspected ON inspections(user_id, hive_id, inspected_at DESC);` — Innsats: S — Konfidens: HØY

**[HØY]** `app/(app)/(tabs)/kuber/index.tsx:217-224` — `renderItem` lager nye closures hver render: `onPress={() => router.push(...)}` inni inline `renderItem`, og `filtered`/`hivesWithScore` (linje 86-100) beregnes uten `useMemo`. `HiveCard` er `memo`-ert (HiveCard.tsx:54), men får ny `onPress`-referanse hver gang → memo treffer aldri. — Konsekvens: hele listen re-renderes ved hvert filter-/refresh-trykk; merkbart ved 20+ kuber. Hjem-skjermen fikk tilsvarende fiks i Sprint 1; kubelisten ble hoppet over. — Løsning: `useCallback` på `renderItem`/handler (send `hive.id`, la HiveCard kalle `onPress(id)`), `useMemo` på `filtered`. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `components/inspection/Step3.tsx:64-82` — AI-analyse sender ubeskåret kamerabilde: `quality: 0.5, base64: true` uten bredde-resize, så `analyzeVarroa(asset.base64!, …)` POST-er hele bildet som JSON (services/inspection.ts:203). Et 12 MP-foto gir 1,5–3 MB JPEG → ~2–4 MB base64 i JS-minne og over mobilnett i felt. — Konsekvens: treg analyse på dårlig dekning ved bigården, minnepress, risiko for at AI-API avviser store bilder. — Løsning: `expo-image-manipulator` resize til ~1280 px bredde + compress 0.7 før base64. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:138-142,397` — Hjem henter fortsatt både RPC-en og `fetchAllInspections` (500 rader, alle kolonner inkl. notes/AI-tekst). Brukes til `allInspections.length` (ActivationGuide, linje 397) og `SeasonSummaryCard` (linje 487-492). Rapporten henter nå ferskt selv (linje 215-218), så dashboard-querien finnes kun for count + sesongkort. — Konsekvens: tung payload ved hver kald dashboard-last; verst for aktive brukere (500 rader × ~1 kB). — Løsning: `count: 'exact', head: true`-query for ActivationGuide; gi SeasonSummaryCard en slankere query (kun `inspected_at, varroa_count, hive_id`). — Innsats: M — Konfidens: HØY

**[MEDIUM]** `services/hive.ts:93,109` — `fetchHives`/`fetchHive` bruker fortsatt `select('*')` (henter også `notes` og lang signert `photo_url` for alle kuber). Samme mønster i `harvest.ts:17`, `calendarEvent.ts:31`, `queen.ts:27`, `weight.ts:14`, `treatment.ts:19,30`, `swarmReport.ts:45`. — Konsekvens: moderat — radene er små bortsett fra notes/photo_url; mest påtagelig på kubelisten. — Løsning: eksplisitt kolonneliste etter mønsteret i `fetchInspections`. — Innsats: S–M — Konfidens: HØY

**[MEDIUM]** `components/hive/HiveCard.tsx:86` + `kuber/[id]/index.tsx:244` — Kubefoto rendres med RN `Image`; `expo-image` er IKKE installert (package.json har kun `expo-image-picker`). Signerte URL-er er stabile i 1 år (hive.ts:76), så RN Image-cache fungerer delvis, men uten disk-cache-garanti, placeholder eller downsampling av store foto til 76×76-thumbnail. — Konsekvens: re-nedlasting og dekoding av fullstørrelses-foto per kort. — Løsning: `npx expo install expo-image`, bytt til `<Image cachePolicy="memory-disk" />` i HiveCard + hero. — Innsats: M — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/kuber/[id]/index.tsx:341-342` — Historikk rendres fortsatt som `.map()` i ScrollView; ved «Vis alle» monteres opptil 200 ikke-memoized `InspectionRow` samtidig. — Konsekvens: hakk ved utvidelse på datatunge kuber. — Løsning: `memo` på InspectionRow; vurder paginert «vis 50 til». — Innsats: S — Konfidens: HØY

**[LAV]** `app/(app)/(tabs)/samfunn/index.tsx:18,124-126` — `STALE_24H` er definert men ubrukt (queries bruker 1 t), og lag-søk rendrer alle treff (potensielt ~250 `AssociationCard`) i ScrollView uten virtualisering. — Konsekvens: liten — statiske data, sjelden skjerm. — Løsning: fjern død konstant; FlatList hvis listen vokser. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `services/inspection.ts:176-178` — `createSignedUrls(paths, 3600)`: signerte media-URL-er lever 1 t; cachet query-data kan vise utløpte URL-er i lange økter. — Konsekvens: brutte bilder etter 1 t. — Løsning: `staleTime`/`gcTime` < 3600 s på media-query. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/kuber/index.tsx:86` — `hives.filter((h) => h.isActive)` er redundant; `fetchHives` filtrerer allerede `.eq('is_active', true)` (hive.ts:94). — Konsekvens: minimal. — Løsning: fjern eller kommenter intensjon. — Innsats: S — Konfidens: HØY

## Topp-3 anbefalinger
1. **DB-indeks `inspections(user_id, hive_id, inspected_at DESC)`** — én migrasjon, ~30 min inkl. EXPLAIN-verifisering. Største skaleringsgevinst; treffer hjem + kuber for alle brukere. Står ufikset fra forrige review.
2. **Resize AI-foto før opplasting (Step3)** — `expo-image-manipulator` til 1280 px, ~1 t. Kutter analysepayload ~80–90 % og gjør funksjonen brukbar på dårlig dekning i felt — direkte kvalitet på betalt kjernefunksjon.
3. **Stabiliser kubelisten** — `useCallback`/`useMemo` i `kuber/index.tsx` slik at HiveCard-memoiseringen faktisk virker, ~1 t. Samme fiks som allerede ble gjort på hjem i Sprint 1.
