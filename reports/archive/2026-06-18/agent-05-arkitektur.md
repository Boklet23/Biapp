# Agent 5 — Kodekvalitet og arkitektur

## Metainfo
- Filer lest: `services/hive.ts`, `inspection.ts`, `subscription.ts`, `feed.ts`, `collaboration.ts`, `profile.ts`, `associations.ts`, `diseases.ts`, `types/index.ts`, `lib/supabase.ts`, `lib/queryClient.ts`, `hooks/useEffectiveTier.ts`, `app/_layout.tsx`, migrasjon `0044`. Grep over hele repo: `any`/`as any`, `TODO|FIXME|HACK|XXX`, datoformatering. Linjetelling `app/` + `components/`.
- Filer ikke funnet: ingen. `supabase/migrations/0050` refereres i `collaboration.ts:14` men finnes ikke på disk (siste = 0049) — flagges av Agent 1/DB, nevnes her som mulig inkonsistens.
- Diff mot forrige (2026-06-12): lest. **FIKSET:** (1) profil-feilhåndtering — `fetchProfile` har nå retry-loop + skiller «ikke innlogget» fra feil (`profile.ts:27-46`), og `_layout.tsx:38-42` lar `useEffectiveTier` falle tilbake på RC-tier; (2) collaboration har nå UI + SECURITY DEFINER-RPC-er; (3) global `mutationCache.onError`-toast består; (4) `feed_likes` DELETE-policy herdet (0044). **IKKE fikset:** `hjem/index.tsx` (982, opp fra 976), duplisert opplasting, usikre cast (`fetchMapHives`/`associations`/`diseases`), `feed.toggleLike` svelger feil, duplisert datoformatering (11 filer), iOS-mock-duplisering, manglende Zod på `analyzeVarroa`.

## Sammendrag
Service-laget er fortsatt solid og defensivt mønstret; forrige reviews viktigste HØY-funn (stille profil-nedgradering) er nå korrekt løst med retry + tier-fallback. Ingen `any` utenom legitime Expo Router/Mapbox-cast + ett kjent hull, og null TODO/FIXME. Gjenstående gjeld er strukturell: tre uvaliderte RPC-mappere bryter med det ellers konsistente mapX-mønsteret, `hjem/index.tsx` har vokst forbi 800-grensen, og `feed.toggleLike` svelger alle feil. Ingen kritiske arkitekturfeil.

## Fungerer godt (ikke rør)
1. **mapX()-mønsteret** — `mapHive`, `mapInspection`, `mapProfile`, `mapPost` validerer required-felt (kast) og narrower nullable med `typeof` (`hive.ts:193-218`, `inspection.ts:234-261`).
2. **Profil-feilhåndtering (nylig fikset)** — retry-loop + skille innlogget/feil + RC-fallback (`profile.ts:27-46`, `useEffectiveTier.ts:22-32`). Eksemplarisk.
3. **Global React Query-feilhåndtering** — Sentry + toast i query- og mutationCache med dobbel-toast-guard (`queryClient.ts:5-28`).
4. **Tier-logikk** — `useEffectiveTier` tar høyeste av DB/RC/prøve, robust mot transient feil og kontobytte (`_layout.tsx:57-70`).
5. **Ingen død kode / null TODO** — alle 19 services importeres; collaboration nå med UI; feed sovende men ryddig.

## Funn

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx` (982 linjer, opp fra 976) — appens mest endrede skjerm holder queries + presentasjon + lokal `formatDate` + stilark i én fil, over 800-grensen. — Konsekvens: minst testbare og mest konfliktutsatte fil; vokser hver sprint. — Løsning: trekk ut seksjoner til `components/home/*` + en `useDashboardData()`-hook (finnes ikke i dag). — Innsats: M — Konfidens: HØY

**[MEDIUM]** `services/feed.ts:58-71` — `toggleLike` sjekker ikke `error` på noen av tre kall: `await supabase.from('feed_likes').delete()...` + read-then-write av denormalisert teller `update({ likes: count ?? 0 })`. — Konsekvens: stille feil + race på likes-teller; sovende (skjult fane) men arves når feed aktiveres. — Løsning: sjekk `error`; flytt tellerøkning til DB-trigger/RPC. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `services/hive.ts:171-181`, `associations.ts:64-78,99-108`, `diseases.ts:26-47` — RPC/select-mappere bruker usikre cast uten validering: `id: row.id as string`, `locationLat: row.location_lat as number`, `isNotifiable: row.is_notifiable as boolean`. Bryter med de validerende mapX-ene. — Konsekvens: korrupt/manglende rad gir kryptisk runtime-feil nedstrøms (kart, foreningsliste, sykdomssider) i stedet for tidlig kast. — Løsning: samme `typeof`-sjekk + kast på required. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `services/hive.ts:37-79` vs `inspection.ts:120-156` — `uploadHivePhoto`/`uploadInspectionPhoto` fortsatt nær identiske (content://-kopiering, ext/contentType-utledning, `FileSystem.uploadAsync` med samme headers). Har alt divergert: `hive.ts:70` inkluderer `response.body` i feilmelding, `inspection.ts:152` ikke. — Konsekvens: bugfiks må gjøres to steder. — Løsning: `lib/storageUpload.ts` med `uploadBinaryToStorage(bucket, fileName, uri, token)`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** Filer >400 linjer (9): `hjem/index.tsx` 982 · `kuber/ny.tsx` 612 · `kuber/[id]/index.tsx` 548 · `kuber/[id]/rediger.tsx` 517 · `HivePlaceholder.tsx` 432 · `kalender/index.tsx` 424 · `kuber/index.tsx` 418 · `HoneyForecastChart.tsx` 414 · `inspeksjon/ny.tsx` 409. `ny.tsx`/`rediger.tsx` dupliserer skjema-state for samme entitet. — Løsning: felles `useHiveForm()`; del kalender/dashboard i seksjoner. — Innsats: L — Konfidens: HØY

**[LAV]** Duplisert datoformatering i 11 filer (`kuber/[id]/index.tsx`, `HarvestSection.tsx`, `QueenSection.tsx`, `TreatmentSection.tsx`, `WeightSection.tsx`, `report.ts`, `AddEventModal.tsx`, m.fl.) med ulike `toLocaleDateString('nb-NO', ...)`-options. Ingen `lib/date.ts` finnes. — Løsning: `lib/date.ts` med 2–3 navngitte formatter. — Innsats: S — Konfidens: HØY

**[LAV]** `services/subscription.ts:21,31,48,57` — fire repeterte `{ entitlements: { active: {} } } as unknown as CustomerInfo` (iOS/ikke-Android-mock). — Løsning: én delt `const MOCK_CUSTOMER_INFO`. — Innsats: S — Konfidens: HØY

**[LAV]** `services/inspection.ts:226` — `await res.json() as VarroaAnalysis & { error?: string }` — Edge Function-respons valideres ikke (Zod i stacken). — Løsning: Zod-parse. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `types/index.ts:63` — `diseaseObservations: Record<string, unknown> | null` ut, men input (`inspection.ts:27`) er `Record<string, boolean>`. Uendret. — Løsning: `Record<string, boolean> | null` begge veier. — Innsats: S — Konfidens: HØY

**[LAV]** `services/hive.ts:88-104` — timeout-via-`Promise.race` finnes kun i `fetchHives`; ingen andre fetch har det (inkonsistent policy). — Løsning: enten generaliser i wrapper eller dokumenter hvorfor kun denne. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/feed/index.tsx:108` — `currentUserId={(profile as any)?.id}` — unødvendig; `profile` er `User | null` med `id`. Eneste reelle `any`-hull utenom 21 legitime Expo Router/Mapbox-cast. — Løsning: fjern cast. — Innsats: S — Konfidens: HØY

**React Query (pkt. 3):** `staleTime` 5 min + `retry: 2` fornuftig default. queryKeys konsistente og kollisjonsfrie. Mutations bruker enten egen `onError`-toast eller faller på global guard. Invalidering konsekvent. Statiske data (foreninger/utstyr/sykdommer) kunne hatt timer-lang `staleTime`, men dagens er ikke feil.

## Topp-3 anbefalinger
1. **Splitt `hjem/index.tsx`** (982 linjer) i seksjonskomponenter + `useDashboardData()`. Står igjen fra forrige review, vokser, og blokkerer testbarhet av appens viktigste skjerm. (M)
2. **Harden de tre uvaliderte mapperne** (`fetchMapHives`, `associations`, `diseases`) + sjekk `error` i `feed.toggleLike`. Fire små fikser som lukker hele gapet i service-lagets ellers konsistente defensive mønster. (S–M samlet)
3. **Konsolider duplikasjon:** `lib/storageUpload.ts` (de to opplasterne) + `lib/date.ts` (11 datoformatere) + `useHiveForm()` (ny/rediger). Reduserer divergens-risiko og linjetall. (M)
