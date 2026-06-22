# Agent 5 — Kodekvalitet og arkitektur

## Metainfo
- Dato: 2026-06-22. Read-only.
- Filer lest: `services/hive.ts`, `inspection.ts`, `subscription.ts`, `feed.ts`, `collaboration.ts`, `types/index.ts`, `lib/supabase.ts`, `lib/queryClient.ts`, `hooks/useEffectiveTier.ts`, utdrag `app/(app)/(tabs)/hjem/index.tsx`.
- Grep over repo: `:\s*any\b|as any` (26 treff / 14 filer), `TODO|FIXME|HACK|XXX` (0 treff), `toLocaleDateString('nb-NO')` (9 filer), `queryKey`/`setQueryData`, service- og feed/collaboration-importer. Linjetelling `app/` + `components/` (>400 linjer).
- Migrasjoner: bekreftet 0001–0052 alle på disk (siste = `0052_drop_legacy_hive_insert_policy.sql`). `collaboration.ts:14` refererer 0050 — **finnes** (`0050_collaboration_rpcs.sql`). Forrige rundes påstand om manglende 0050 var feil; gjentas IKKE.
- Diff mot 2026-06-18: rapport-generering i `hjem/index.tsx` bruker nå `Promise.allSettled` (linje 221) — bekreftet, IKKE flagget. `hjem/index.tsx` vokst 982 → 994 linjer.

## Sammendrag
Service-laget er fortsatt solid og defensivt; mapX-mønsteret holder, ingen TODO/FIXME, og alle `any` er legitime Expo Router/Mapbox-cast pluss ett kjent hull. Gjenstående gjeld er strukturell og uendret fra forrige runde: `hjem/index.tsx` har vokst forbi 800-grensen, tre uvaliderte RPC-mappere bryter mønsteret, `feed.toggleLike` svelger alle feil, og to nær-identiske opplastere samt 9 datoformatere mangler felles modul. Ingen kritiske arkitekturfeil.

## Fungerer godt (ikke rør)
1. **mapX()-mønsteret** — `mapHive`/`mapInspection`/`mapPost` kaster på manglende required-felt og narrower nullable med `typeof` (`hive.ts:193-218`, `inspection.ts:234-261`).
2. **Global React Query-feilhåndtering** — Sentry + toast i query- og mutationCache med dobbel-toast-guard (`queryClient.ts:6-21`).
3. **Tier-logikk** — `useEffectiveTier` tar høyeste av DB/RC/prøveperiode, robust mot transient feil og kontobytte (`useEffectiveTier.ts:22-32`). DB-tier eies av webhook; klient skriver ikke (`subscription.ts:73-83`).
4. **analyzeVarroa** — AbortController-timeout + try/catch på fetch og `res.json()` med norske feilmeldinger (`inspection.ts:200-231`).
5. **Sovende kode er ryddig** — `feed` (skjult fane) importeres reelt; `collaboration` har UI (`samarbeid.tsx`) + RPC (0050). Alle 19 services i bruk. Ingen død kode.

## Funn

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx` (994 linjer, opp fra 982) — appens mest endrede skjerm har 6 inline `useQuery` + derivert state + presentasjon + lokal `formatDate` + stilark i én fil, langt over 800-grensen (`index.tsx:128-170`). — Konsekvens: minst testbare og mest konfliktutsatte fil; vokser hver sprint. — Løsning: trekk queries ut i `useDashboardData()` (finnes ikke) og seksjoner til `components/home/*`. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `services/feed.ts:58-71` — `toggleLike` sjekker ikke `error` på noen av tre kall, og oppdaterer denormalisert teller via read-then-write: `await supabase.from('feed_likes').delete()...`; `update({ likes: count ?? 0 })`. — Konsekvens: stille feil + race på likes-teller; sovende (skjult fane) men arves når feed aktiveres. — Løsning: sjekk `error`; flytt tellerøkning til DB-trigger/RPC. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `services/hive.ts:171-181` — `fetchMapHives` bruker usikre cast uten validering: `id: row.id as string`, `locationLat: row.location_lat as number`, `ownerId: row.owner_id as string`. Bryter med det validerende mapHive rett nedenfor. — Konsekvens: korrupt/manglende RPC-rad gir kryptisk runtime-feil i kart-laget i stedet for tidlig kast. — Løsning: samme `typeof`-sjekk + kast på required-felt. — Innsats: S — Konfidens: HØY. (NB: `collaboration.ts:23-30` bruker `typeof … ? … : ''`-fallback i stedet for kast — tolererer tom rad, mindre alvorlig men inkonsistent med mapX.)

**[MEDIUM]** `services/hive.ts:37-79` vs `inspection.ts:120-156` — `uploadHivePhoto`/`uploadInspectionPhoto` fortsatt nær identiske (content://-kopiering, ext/contentType-utledning, `FileSystem.uploadAsync` med samme headers). Har divergert: `hive.ts:70` inkluderer `response.body` i feilmelding, `inspection.ts:152` ikke. — Konsekvens: bugfiks må gjøres to steder; divergens øker. — Løsning: `lib/storageUpload.ts` med `uploadBinaryToStorage(bucket, fileName, uri, token)`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** Filer >400 linjer (9): `hjem/index.tsx` 994 · `kuber/ny.tsx` 612 · `kuber/[id]/index.tsx` 548 · `kuber/[id]/rediger.tsx` 517 · `HivePlaceholder.tsx` 432 · `kalender/index.tsx` 424 · `kuber/index.tsx` 418 · `HoneyForecastChart.tsx` 414 · `inspeksjon/ny.tsx` 409. `ny.tsx`/`rediger.tsx` dupliserer skjema-state for samme entitet. — Løsning: felles `useHiveForm()`; del kalender/dashboard i seksjoner. — Innsats: L — Konfidens: HØY

**[LAV]** Duplisert datoformatering i 9 filer (`kuber/[id]/index.tsx`, `[inspId].tsx`, `HarvestSection.tsx`, `QueenSection.tsx`, `TreatmentSection.tsx`, `WeightSection.tsx`, `report.ts`, `AddEventModal.tsx`, `HarvestLogModal.tsx`) med ulike `toLocaleDateString('nb-NO', …)`-options. Ingen `lib/date.ts` finnes. — Løsning: `lib/date.ts` med 2–3 navngitte formatter. — Innsats: S — Konfidens: HØY

**[LAV]** `services/subscription.ts:21,35,52,61` — fire repeterte `{ entitlements: { active: {} } } as unknown as CustomerInfo` (iOS/ikke-Android-mock). — Løsning: én delt `const MOCK_CUSTOMER_INFO`. — Innsats: S — Konfidens: HØY

**[LAV]** `services/inspection.ts:226` — `await res.json() as VarroaAnalysis & { error?: string }` — Edge Function-respons type-castes uten Zod-validering (Zod er i stacken; `VarroaAnalysis` har 8 felt fra ekstern AI). — Løsning: Zod-parse. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `types/index.ts:63` — `diseaseObservations: Record<string, unknown> | null` ut, mens input (`inspection.ts:27`) er `Record<string, boolean>`. Asymmetrisk. — Løsning: `Record<string, boolean> | null` begge veier. — Innsats: S — Konfidens: HØY

**[LAV]** `services/hive.ts:88-104` — timeout-via-`Promise.race` finnes kun i `fetchHives`; ingen andre fetch (inkl. `fetchHive`, `fetchInspections`) har det. Inkonsistent policy. — Løsning: generaliser i wrapper eller dokumenter hvorfor kun denne. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/feed/index.tsx:108` — `currentUserId={(profile as any)?.id}` — unødvendig cast; `profile` er `User | null` med `id`. Eneste reelle `any`-hull utenom 25 legitime Expo Router/Mapbox-cast. — Løsning: fjern cast. — Innsats: S — Konfidens: HØY

**React Query (pkt. 3):** `staleTime` 5 min + `retry: 2` fornuftig default; statiske data (`forecast`/`weather` 1t, `all-inspections` 10 min) overstyrt fornuftig. queryKeys konsistente streng-array-konvensjon, kollisjonsfrie. `setQueryData(['hive', id], …)` brukt riktig ved hive-mutasjon; ellers `invalidateQueries` konsekvent. Mindre inkonsistens: `['harvests']` er global mens `['weights', hiveId]`/`['treatments', hiveId]`/`['queens', hiveId]` er hive-scopet — harvests invalideres derfor bredere enn nødvendig (LAV, ikke eget funn).

## Topp-3 anbefalinger
1. **Splitt `hjem/index.tsx`** (994 linjer) i `useDashboardData()` + seksjonskomponenter. Står igjen fra forrige review, vokser hver sprint, blokkerer testbarhet av appens viktigste skjerm. (M)
2. **Harden `fetchMapHives` + sjekk `error` i `feed.toggleLike`.** To små fikser som lukker det gjenstående gapet i service-lagets ellers konsistente defensive mønster. (S)
3. **Konsolider duplikasjon:** `lib/storageUpload.ts` (to opplastere) + `lib/date.ts` (9 datoformatere) + `useHiveForm()` (ny/rediger). Reduserer divergens-risiko og linjetall. (M)
