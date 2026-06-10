# Agent 6 — Ytelse

## Metainfo
- **Filer lest:** `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `services/inspection.ts`, `services/hive.ts`, `components/hive/HiveCard.tsx`, `app/(app)/(tabs)/samfunn/index.tsx`, migrasjoner 0012/0033/0038.
- **Filer ikke funnet:** ingen (alle scope-filer eksisterer).
- **Konfidensgrad:** Høy for lister/queries/N+1. Middels for bilde-caching (avhenger av native expo-image-oppførsel).

## Sammendrag
Arkitekturen er gjennomtenkt: `fetchLastInspectionPerHive` er ett ekte batch-RPC-kall (ingen N+1), kubelisten er virtualisert med FlatList, og HiveCard er `memo`-ert. Hovedsvakhetene er manglende DB-indeks for batch-RPC-ens `user_id`-filter, ustabile `onPress`-closures som bryter HiveCard-memoisering, og at hjem-skjermen henter samme tunge inspeksjonsdata to ganger. Skalerer trolig greit til 20 kuber / 500 inspeksjoner, men med unødvendige re-renders.

## Funn

**[HØY]** `supabase/migrations/0012` + `0038:4` — `get_latest_inspections_per_hive()` filtrerer `where user_id = auth.uid()` og sorterer `order by hive_id, inspected_at desc`, men eneste relevante indeks er `(hive_id, inspected_at DESC)` — ingen indeks med `user_id` som ledende kolonne på `inspections`. Med 500 inspeksjoner gir det seq-scan + sort per kall. RPC-et kjøres på BÅDE hjem og kuber-fanen. — Konsekvens: tregere dashboard-last som vokser lineært med inspeksjonsmengde. — Løsning: `CREATE INDEX idx_inspections_user_hive_inspected ON inspections(user_id, hive_id, inspected_at DESC);` (matcher både DISTINCT ON og filter).

**[HØY]** `app/(app)/(tabs)/kuber/index.tsx:205-212` — `renderItem` pakker `HiveCard` i en `Pressable` med inline `onLongPress`/`onPress`-closures som lages på nytt hver render. Selv om `HiveCard` er `memo`-ert, får den ny `onPress`-referanse hver gang → memo treffer aldri. I tillegg reberegnes `activeHives`/`hivesWithScore`/`filtered` uten `useMemo` (linje 74-88). — Konsekvens: hele listen re-renderes ved hver `setFilter`/refresh; merkbart ved 20 kuber. — Løsning: trekk ut `renderItem`/`keyExtractor` med `useCallback`, memoiser `filtered`. Vurder `getItemLayout` for fast korthøyde.

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:132-142,398` — Henter både `fetchLastInspectionPerHive` (RPC) og `fetchAllInspections` (opptil 500 rader, alle kolonner). `fetchAllInspections` brukes til `allInspections.length` (linje 398 — aktiveringsguide), `SeasonSummaryCard` og rapport. Aktiveringsguiden trenger bare en count. — Konsekvens: tung 500-raders payload lastes ved hver dashboard-visning. — Løsning: `count: 'exact', head: true` for count-bruken; lazy-last `fetchAllInspections` kun når `SeasonSummaryCard`/rapport trengs.

**[MEDIUM]** `services/hive.ts:93,109` + `services/inspection.ts:77` — `fetchHives`/`fetchHive`/`fetchInspection` bruker `select('*')`. `fetchHives` returnerer alle kuber med alle kolonner (inkl. `photo_url`, `notes`). `fetchInspections` (linje 37) bruker derimot korrekt eksplisitt kolonneliste. — Konsekvens: større listepayload enn nødvendig. — Løsning: eksplisitt kolonneliste på `fetchHives` etter samme mønster som `fetchInspections`.

**[MEDIUM]** `components/hive/HiveCard.tsx:86` + `app/(app)/(tabs)/kuber/[id]/index.tsx:244` — Bilder rendres med RN `Image`, ikke `expo-image` (som allerede er dependency, brukt i opplastingsflyt). RN `Image` har svakere disk-caching og ingen progressiv/placeholder-lasting. Thumbnails er signerte URL-er (1 års TTL, hive.ts:76). — Konsekvens: re-nedlasting av thumbnails, ingen blur-up. — Løsning: bytt til `expo-image` med `cachePolicy="memory-disk"` + `placeholder` for HiveCard-thumbnail og hero-foto.

**[LAV]** `app/(app)/(tabs)/kuber/[id]/index.tsx:341-343` — Inspeksjonshistorikk rendres som `.map()` i `ScrollView` (ikke virtualisert), begrenset til 50 før "Vis alle". Ved "Vis alle" monteres alle (opptil 200) `InspectionRow` samtidig. `InspectionRow` er heller ikke memo-ert. — Konsekvens: hakkete utvidelse på datatunge kuber. — Løsning: 50-grensen er ok; ved "vis alle" vurder `FlatList`, og `memo`-er `InspectionRow`.

**[LAV]** `app/(app)/(tabs)/kuber/index.tsx:74` — `activeHives = hives.filter(h => h.isActive)` re-filtrerer på `isActive`, men `fetchHives` filtrerer allerede `.eq('is_active', true)` i DB (hive.ts:94). Redundant klientfilter. — Konsekvens: minimal. — Løsning: fjern dobbeltfiltrering eller dokumenter intensjonen.

**[LAV]** `services/inspection.ts:165-182` — `fetchInspectionMedia` lager nye signerte URL-er (`createSignedUrls`, 3600s TTL) ved hvert kall. Hvis React Query cacher resultatet lengre enn 1t, kan cachede komponenter vise utløpte URL-er. — Konsekvens: potensielt brutte bilder etter 1t i lange økter. — Løsning: sett `staleTime < 3600s` på media-query og invalider før utløp.

## Topp-3 anbefalinger
1. **DB-indeks for batch-RPC** — `CREATE INDEX ... ON inspections(user_id, hive_id, inspected_at DESC)`. Største skalerings-gevinst; treffer både hjem og kuber-fanen. (~30 min inkl. migrasjon + EXPLAIN-verifisering.)
2. **Stabiliser kubeliste-rendering** — `useCallback` på `renderItem`/`onPress`, `useMemo` på `filtered`, evt. `getItemLayout`. Gjør HiveCard-memoiseringen faktisk effektiv. (~1 t.)
3. **expo-image + dropp dobbel inspeksjonshenting på hjem** — bytt HiveCard/hero til `expo-image` med disk-cache; erstatt `fetchAllInspections().length` med head-count. (~1,5 t.)
