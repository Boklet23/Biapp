# Agent 6 — Ytelse og React Native-optimalisering

## Metainfo
- Dato: 2026-06-22. Modell: claude-opus-4-8. Read-only.
- Filer lest: `app/(app)/(tabs)/hjem/index.tsx`, `kuber/index.tsx`, `kuber/[id]/index.tsx`, `kuber/ny.tsx` (utdrag), `feed/ny.tsx` (utdrag), `samfunn/index.tsx`, `services/inspection.ts`, `services/hive.ts` (utdrag), `components/hive/HiveCard.tsx`, `components/hive/HivesMapView.tsx`, `package.json` (utdrag).
- Søk: memo-dekning (`React.memo|useMemo|useCallback` i components), FlatList/ScrollView (app), `select('*')` (services), `Image|expo-image` (components), `ImageManipulator|quality:` (app).
- DIFF mot arkiv 2026-06-18: lest. **Bekreftet fortsatt fikset (gjentas IKKE):** DB-indeks 0051 for inspections; AI-foto-resize i Step3 (1280px/0.6). **Verifisert at gjenstår:** kubeliste-closures (memo treffer ikke), dobbel inspeksjonshenting på hjem, `select('*')` overalt, expo-image ikke installert (kun `expo-image-picker`/`-manipulator` i package.json), kube-/feed-foto uten resize (`normalizePhotoUri` gjør kun `copyAsync`). Ingen regresjoner.

## Sammendrag (maks 80 ord)
Kjernearkitekturen er solid: ett batch-RPC (`fetchLastInspectionPerHive`) uten N+1, FlatList for kubelisten, memoized HiveCard, lazy-lastede kart, fornuftig staleTime, ingen Skia/rAF-antimønster. De fire moderate funnene fra forrige runde består uendret: kubelistens avledede verdier og renderItem-closure mangler memoisering så HiveCard-memo aldri treffer; dashboard henter fortsatt 500 fulle inspeksjonsrader; `select('*')` overalt; og kube-/feed-foto lastes opp i full kameraoppløsning. Ingen nye kritiske funn.

## Fungerer godt (maks 5 punkter)
- `fetchLastInspectionPerHive` (`services/inspection.ts:47-57`) er ett RPC-kall (`get_latest_inspections_per_hive`) — ingen N+1; brukes på både hjem og kuber, dekket av indeks 0051.
- Kubelisten bruker `FlatList` med `keyExtractor` (`kuber/index.tsx:211-238`); HiveCard er `memo` + intern `useMemo` på healthScore (`HiveCard.tsx:54,60`).
- Kart lazy-lastes med `lazy()`/`Suspense` (`kuber/[id]/index.tsx:25,252`; `samfunn/index.tsx:12,94`); Mapbox guardes mot Expo Go (`HivesMapView.tsx:11-16`).
- `samfunn/index.tsx` bruker `useMemo` (`allAssociations`/`filteredAll`, linje 41-58) + stabil `EMPTY_GROUPED` (linje 26); 1t staleTime + 7d gcTime på statiske data.
- Ingen Skia `setState`/`rAF`-antimønster funnet; VarroaTrend er ren SVG-render uten animasjons-loop (`kuber/[id]/index.tsx:35-121`).

## Funn

**[MEDIUM]** `app/(app)/(tabs)/kuber/index.tsx:87-101,218-224` — `activeHives`/`hivesWithScore`/`filtered` beregnes uten `useMemo`, og `renderItem` lager ny `onPress`-closure per rad (`onPress={() => router.push(...)}`). — Konsekvens: HiveCard er `memo`-ert (`HiveCard.tsx:54`) men får ny `onPress`-referanse hver render → memo treffer aldri; hele listen re-renderes ved hvert filter-/refresh-trykk. Merkbart ved 20+ kuber. Samme fiks ble gjort på hjem, men kubelisten står urørt. — Løsning: `useMemo` på `hivesWithScore`/`filtered`; `useCallback`-renderItem der HiveCard kaller `onPress(id)`. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:139-143,414,505-510` — Dashboard henter fortsatt `fetchAllInspections` (500 rader, alle kolonner inkl. `notes`/`varroa_ai_recommendation`). Brukes kun til `allInspections.length` (ActivationGuide, linje 414) og `SeasonSummaryCard` (linje 505-510). Rapporten henter ferskt selv (linje 221-224). — Konsekvens: tung kald-last-payload (500 × ~1 kB) for aktive brukere; verst på dårlig dekning. — Løsning: `count:'exact', head:true` for ActivationGuide; slank query til SeasonSummaryCard (`inspected_at, varroa_count, hive_id, num_frames_*, mood_score`). — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/ny.tsx:115-129` + `services/hive.ts:22-35` + `feed/ny.tsx:27-38` — Kube-/feed-foto plukkes med `quality: 0.7`/`0.8` + `aspect:[4,3]`, men uten bredde-resize. `normalizePhotoUri` gjør kun `FileSystem.copyAsync` (ingen `ImageManipulator`), så `uploadHivePhoto` POST-er full kameraoppløsning (12 MP → ofte 1-3 MB). Step3 fikk resize, men kube-/feed-bilder ble ikke fikset. — Konsekvens: treg opplasting i felt, unødvendig storage/båndbredde. — Løsning: kjør `ImageManipulator.manipulateAsync(uri, [{resize:{width:1600}}], {compress:0.7})` i `normalizePhotoUri`/`feed/ny.pickImage`, samme mønster som Step3. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `components/hive/HiveCard.tsx:86` + `kuber/[id]/index.tsx:244` + `feed/index.tsx` — Kube-/hero-/feed-foto rendres med RN `Image`; `expo-image` er fortsatt IKKE i package.json (verifisert: kun `expo-image-picker`/`-manipulator`). Signerte URL-er lever 1 år (`hive.ts:76`), så RN-cache fungerer delvis, men uten disk-cache-garanti, placeholder eller downsampling til 76×76-thumbnail. — Konsekvens: re-dekoding av fullstørrelses-foto per kort; minnebruk i lange kubelister. — Løsning: `npx expo install expo-image`, `<Image cachePolicy="memory-disk" />`. — Innsats: M — Konfidens: MEDIUM

**[MEDIUM]** `services/hive.ts:93,109` (+ `weight.ts:14`, `swarmReport.ts:45`, `treatment.ts:19,30`, `queen.ts:27`, `calendarEvent.ts:31`, `harvest.ts:17`, `profile.ts:35`, `diseases.ts:7,17`, `inspection.ts:77`) — `fetchHives`/`fetchHive` bruker `select('*')` (henter `notes` + lang signert `photo_url` for alle kuber i lista). — Konsekvens: moderat oppblåst kubeliste-payload; rammer hjem + kuber. — Løsning: eksplisitt kolonneliste etter mønster fra `fetchInspections`; minst slank `fetchHives` (dropp `notes`). — Innsats: S-M — Konfidens: HØY

**[LAV]** `app/(app)/(tabs)/kuber/[id]/index.tsx:136-162,341-343` — Historikk rendres som `.map()` i ScrollView; `InspectionRow` er IKKE `memo`-ert, og «Vis alle» monterer opptil 200 rader (`fetchInspections` limit 200) samtidig. — Konsekvens: hakk ved utvidelse på datatunge kuber. — Løsning: `memo` på `InspectionRow`; vurder paginert «vis 50 til». — Innsats: S — Konfidens: HØY

**[LAV]** `app/(app)/(tabs)/samfunn/index.tsx:18,124-140` — `STALE_24H` definert men ubrukt (queries bruker 1t inline). Lag-listen rendrer alle treff (~250 `AssociationCard`/`FylkeslagSection`) i ScrollView uten virtualisering. — Konsekvens: liten — sjelden skjerm, statiske data. — Løsning: fjern død konstant; FlatList/SectionList hvis listen vokser. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `services/inspection.ts:176-178` — `createSignedUrls(paths, 3600)`: media-URL-er lever 1t; cachet query-data kan vise utløpte URL-er i lange økter (inkonsekvent med hive-photos sin 1-års TTL på `hive.ts:76`). — Konsekvens: brutte bilder etter 1t. — Løsning: `staleTime`/`gcTime` < 3600 s på media-query, eller lengre signert TTL. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/kuber/index.tsx:87` — `hives.filter((h) => h.isActive)` er redundant; `fetchHives` filtrerer allerede `.eq('is_active', true)` (`hive.ts:94`). Samme redundans på `hjem/index.tsx:170`. — Konsekvens: minimal. — Løsning: fjern, eller kommenter intensjon (defensivt). — Innsats: S — Konfidens: HØY

## Topp-3 anbefalinger
1. **Stabiliser kubelisten** (`kuber/index.tsx`) — `useMemo` på `filtered`/`hivesWithScore` + `useCallback`-renderItem så HiveCard-memo faktisk virker. Største runtime-gevinst ved 20+ kuber; identisk fiks som allerede er gjort på hjem. ~1 t.
2. **Slank dashboard-payload** — bytt `fetchAllInspections` på hjem til en count-query (ActivationGuide) + slank kolonneliste til SeasonSummaryCard. Kutter den tyngste kald-last-spørringen for aktive brukere. ~1 t.
3. **Resize kube-/feed-foto før opplasting** — legg `ImageManipulator.manipulateAsync` inn i `normalizePhotoUri` (og `feed/ny.pickImage`), gjenbruk Step3-mønsteret. Raskere opplasting i felt, mindre storage. ~30 min.
