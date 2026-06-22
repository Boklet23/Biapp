# Agent 6 — Ytelse og React Native-optimalisering

## Metainfo
- Filer lest: `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `services/inspection.ts`, `services/hive.ts` (utdrag), `components/hive/HiveCard.tsx`, `components/hive/HivesMapView.tsx`, `app/(app)/(tabs)/samfunn/index.tsx`, `components/inspection/Step3.tsx`, `app/(app)/(tabs)/kuber/ny.tsx` (utdrag), `app/(app)/(tabs)/feed/ny.tsx` (utdrag), `supabase/migrations/0051_query_indexes.sql`, `0033`/`0038`. Søk: memo-dekning (components), FlatList/ScrollView (app), `select('*')` (services), Image/expo-image (components).
- Filer ikke funnet: ingen.
- Diff mot forrige review (arkiv 2026-06-12): lest. **Fikset siden sist:** (1) DB-indeks `inspections(user_id, hive_id, inspected_at DESC)` lagt til i `0051_query_indexes.sql` — forrige topp-1 HØY er LØST. (2) AI-foto resizes nå til 1280 px + compress 0.6 før base64 i `Step3.tsx:63-67` — forrige topp-2 MEDIUM er LØST. (3) Partiell indeks på `swarm_reports(reported_at DESC) WHERE status='open'` lagt til. **Ikke fikset (gjentas):** kubeliste-closures (`kuber/index.tsx`), `select('*')` i hive.ts/m.fl., dobbel inspeksjonshenting på hjem, RN `Image` (expo-image fortsatt ikke installert), redundant `.filter(isActive)`.

## Sammendrag (maks 80 ord)
Arkitekturen er solid og to av tre tyngste funn fra forrige runde er nå fikset (DB-indeks + AI-foto-resize). Kjernen skalerer bra: batch-RPC uten N+1, FlatList for kubeliste, memoized HiveCard, lazy-lastede kart, fornuftig staleTime. Gjenstående funn er moderate: kubelistens `renderItem`/avledede verdier mangler memoisering så HiveCard-memo aldri treffer, dashboard henter fortsatt 500 fulle inspeksjonsrader, `select('*')` overalt, og kube-/feed-foto lastes opp i full oppløsning uten bredde-resize.

## Fungerer godt (maks 5 punkter)
- `fetchLastInspectionPerHive` (`services/inspection.ts:47-57`) er ett RPC-kall — ingen N+1; brukes på både hjem og kuber-fanen, og dekkes nå av indeks `0051`.
- Hjem-skjermens avledede verdier er memoized (`hjem/index.tsx:170-198`) og rapport-Promise.all er `useCallback` (linje 216-237).
- AI-foto resizes nå korrekt før opplasting (`Step3.tsx:63-67`, `resize 1280 / compress 0.6 / base64`) — kutter ~80-90 % av analysepayload. Inkl. AbortController-timeout (`inspection.ts:201`).
- Skia/Reanimated: ingen `setState`/`rAF`-antimønster funnet i animasjonskomponentene; kartene (`HiveMap`, `SwarmMap`) lazy-lastes med `lazy()`/`Suspense`.
- `samfunn/index.tsx` bruker `useMemo` på `allAssociations`/`filteredAll` og stabil `EMPTY_GROUPED` (linje 26, 41-58); 1t staleTime + 7d gcTime på statiske data.

## Funn

**[MEDIUM]** `app/(app)/(tabs)/kuber/index.tsx:87-101,218-224` — `activeHives`/`hivesWithScore`/`filtered` beregnes uten `useMemo`, og `renderItem` lager ny `onPress`-closure per rad (`onPress={() => router.push(...)}`). — Konsekvens: `HiveCard` er `memo`-ert (`HiveCard.tsx:54`) men får ny `onPress`-referanse hver render → memo treffer aldri; hele listen re-renderes ved hvert filter-/refresh-trykk. Merkbart ved 20+ kuber. Samme fiks ble gjort på hjem, men kubelisten står urørt. — Løsning: `useMemo` på `hivesWithScore`/`filtered`; `useCallback`-basert `renderItem` der HiveCard kaller `onPress(id)`. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:139-143,404,493-499` — Dashboard henter fortsatt `fetchAllInspections` (500 rader, alle kolonner inkl. `notes`/`varroa_ai_recommendation`). Brukes kun til `allInspections.length` (ActivationGuide, linje 404) og `SeasonSummaryCard` (linje 493-499). Rapporten henter ferskt selv (linje 219-222). — Konsekvens: tung kald-last-payload (500 × ~1 kB) for aktive brukere; verst på dårlig dekning. — Løsning: `count:'exact', head:true` for ActivationGuide; slank query til SeasonSummaryCard (`inspected_at, varroa_count, hive_id, ...`). — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/ny.tsx:115-120` + `app/(app)/(tabs)/feed/ny.tsx:27-32` — Kube-/feed-foto plukkes med `quality: 0.7`/`0.8` og `aspect:[4,3]`, men uten bredde-resize. `uploadHivePhoto` POST-er hele binæren i full kameraoppløsning (12 MP → ofte 1-3 MB). Step3 fikk `ImageManipulator`-resize, men kube-/feed-bilder ble ikke fikset. — Konsekvens: treg opplasting i felt, unødvendig storage/båndbredde. — Løsning: kjør `ImageManipulator.manipulateAsync(uri, [{resize:{width:1600}}], {compress:0.7})` før upload, samme mønster som Step3. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `components/hive/HiveCard.tsx:86` + `kuber/[id]/index.tsx:244` + `feed/index.tsx:51` — Kube-/hero-/feed-foto rendres med RN `Image`; `expo-image` er fortsatt IKKE i package.json (verifisert: kun `expo-image-picker`/`-manipulator`). Signerte URL-er lever 1 år (`hive.ts:76`), så RN-cache fungerer delvis, men uten disk-cache-garanti, placeholder eller downsampling til 76×76-thumbnail. — Konsekvens: re-dekoding av fullstørrelses-foto per kort; minnebruk i lange kubelister. — Løsning: `npx expo install expo-image`, `<Image cachePolicy="memory-disk" />`. — Innsats: M — Konfidens: MEDIUM

**[MEDIUM]** `services/hive.ts:93,109` (+ `weight.ts:14`, `swarmReport.ts:45`, `treatment.ts:19,30`, `queen.ts:27`, `calendarEvent.ts:31`, `harvest.ts:17`, `profile.ts:35`, `diseases.ts:7,17`) — `fetchHives`/`fetchHive` bruker `select('*')` (henter `notes` + lang signert `photo_url` for alle kuber i lista). — Konsekvens: moderat oppblåst kubeliste-payload; rammer hjem + kuber. — Løsning: eksplisitt kolonneliste etter mønster fra `fetchInspections`; minst slank `fetchHives` (dropp `notes`). — Innsats: S-M — Konfidens: HØY

**[LAV]** `app/(app)/(tabs)/kuber/[id]/index.tsx:136-162,341-343` — Historikk rendres som `.map()` i ScrollView; `InspectionRow` er IKKE `memo`-ert, og «Vis alle» monterer opptil 200 rader samtidig. — Konsekvens: hakk ved utvidelse på datatunge kuber. — Løsning: `memo` på `InspectionRow`; vurder paginert «vis 50 til». — Innsats: S — Konfidens: HØY

**[LAV]** `app/(app)/(tabs)/samfunn/index.tsx:18,124-140` — `STALE_24H` definert men ubrukt (queries bruker 1t). Lag-listen rendrer alle treff (~250 `AssociationCard`/`FylkeslagSection`) i ScrollView uten virtualisering. — Konsekvens: liten — sjelden skjerm, statiske data. — Løsning: fjern død konstant; FlatList/SectionList hvis listen vokser. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `services/inspection.ts:176-178` — `createSignedUrls(paths, 3600)`: media-URL-er lever 1t; cachet query-data kan vise utløpte URL-er i lange økter. — Konsekvens: brutte bilder etter 1t. — Løsning: `staleTime`/`gcTime` < 3600 s på media-query, eller lengre signert TTL. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/kuber/index.tsx:87` — `hives.filter((h) => h.isActive)` er redundant; `fetchHives` filtrerer allerede `.eq('is_active', true)` (`hive.ts:94`). Samme redundans på `hjem/index.tsx:170`. — Konsekvens: minimal. — Løsning: fjern, eller kommenter intensjon (defensivt). — Innsats: S — Konfidens: HØY

## Topp-3 anbefalinger
1. **Stabiliser kubelisten** (`kuber/index.tsx`) — `useMemo` på `filtered`/`hivesWithScore` + `useCallback`-renderItem så HiveCard-memo faktisk virker. Største runtime-gevinst ved 20+ kuber; samme fiks som allerede er gjort på hjem. ~1 t.
2. **Slank dashboard-payload** — bytt `fetchAllInspections` på hjem til en count-query (ActivationGuide) + slank kolonneliste til SeasonSummaryCard. Kutter den tyngste kald-last-spørringen for aktive brukere. ~1 t.
3. **Resize kube-/feed-foto før opplasting** — gjenbruk `ImageManipulator`-mønsteret fra Step3 i `kuber/ny.tsx` og `feed/ny.tsx`. Raskere opplasting i felt, mindre storage. ~30 min.
