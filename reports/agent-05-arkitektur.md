# Agent 5 — Kodekvalitet og arkitektur

## Metainfo
- Filer lest: `services/hive.ts`, `services/inspection.ts`, `services/subscription.ts`, `services/feed.ts`, `services/collaboration.ts`, `services/profile.ts`, `services/queen.ts` (utdrag), `services/weight.ts` (utdrag), `services/swarmReport.ts` (utdrag), `types/index.ts`, `lib/supabase.ts`, `lib/queryClient.ts`, `hooks/useEffectiveTier.ts`, `app/_layout.tsx`, `constants/varroa.ts` (utdrag), grep-resultater på tvers av `app/`, `components/`, `services/`, `store/`
- Filer ikke funnet: ingen
- Diff mot forrige review: lest arkiv: ja. **FIKSET siden 10. juni:** (1) global `mutationCache.onError` viser nå toast når mutasjonen mangler egen handler (`lib/queryClient.ts:17-19`) — forrige HØY-funn løst; (2) varroa-terskler samlet i `constants/varroa.ts` med dokumentert historikk. **IKKE fikset:** `hjem/index.tsx` fortsatt 976 linjer, duplisert opplastingslogikk, usikre cast i `fetchMapHives`, iOS-mock-duplisering, manglende Zod på `analyzeVarroa`-respons.

## Sammendrag
Service-laget er gjennomgående solid: 13 av 14 `mapX()`-funksjoner validerer required-felt og bruker `typeof`-mønsteret for nullable, null `any` i services/types/hooks, null TODO/FIXME i hele kodebasen, og queryKeys er konsistente og kollisjonsfrie. Viktigste nye funn: `fetchProfile` svelger alle feil og returnerer `null` (`profile.ts:31`) — siden profilen bor i Zustand uten retry, nedgraderes en betalende bruker stille til starter-tier for hele sesjonen ved én transient nettverksfeil ved oppstart.

## Fungerer godt (ikke rør)
1. **mapX()-mønsteret** — `mapHive`, `mapInspection`, `mapQueen`, `mapWeight`, `mapSwarmReport`, `mapProfile` m.fl. kaster på manglende required-felt og narrower nullable korrekt (`services/hive.ts:193-218`).
2. **Global feilhåndtering i React Query** — `lib/queryClient.ts` med Sentry + toast i både query- og mutationCache, med dobbel-toast-guard.
3. **queryKey-disiplin** — konsekvent `['entitet', id]`-konvensjon, delte nøkler (`['all-inspections']` gjenbrukes av hjem/kalender/sammenlign) uten kollisjoner.
4. **Ingen død kode i service-laget** — alle 19 services importeres av minst 1 fil; ingen TODO/FIXME/HACK/XXX i `*.ts`/`*.tsx`.
5. **`constants/varroa.ts`** — eksemplarisk konsolidering med dokumentert hvorfor (HealthScore vs TreatmentRecommendation hadde drevet fra hverandre).

## Funn

**[HØY]** `services/profile.ts:31` — `if (error) return null;` i `fetchProfile` svelger alle DB-feil, og `app/_layout.tsx:53` gjør det samme: `.catch(() => setProfile(null))`. Profilen bor i Zustand (ikke React Query), så ingen retry/refetch skjer. `hooks/useEffectiveTier.ts:19`: `if (!profile) return 'starter';` — Konsekvens: én transient nettverksfeil ved kald start nedgraderer en betalende bruker stille til starter (paywalls overalt) for hele sesjonen, uten feilmelding. — Løsning: skill «feil» fra «mangler profil» (kast ved error), legg retry (eller flytt profil-fetch til React Query og speil til Zustand). — Innsats: M — Konfidens: HØY

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx` (976 linjer) — uendret siden forrige review (da 976). 6 queries + presentasjon + `formatDate` + stilark i én fil. — Konsekvens: appens mest endrede skjerm er den minst testbare; over 800-grensen. — Løsning: trekk ut seksjoner til `components/home/*` + `useDashboardData()`-hook. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `services/feed.ts:62-70` — `toggleLike` ignorerer alle feil (ingen `error`-destrukturering): `await supabase.from('feed_likes').delete()...` etterfulgt av read-then-write av denormalisert teller: `const { count } = ...; await supabase.from('feed_posts').update({ likes: count ?? 0 })`. — Konsekvens: stille feil + race condition på likes-teller; RLS kan dessuten blokkere update av andres post-rad uten at noen merker det. Koden er sovende (skjult fane) men vedlikeholdt — feilen arves den dagen feed aktiveres. — Løsning: sjekk `error` på alle tre kall; flytt tellerøkning til DB-trigger eller RPC. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `services/hive.ts:37-79` vs `services/inspection.ts:120-156` — `uploadHivePhoto`/`uploadInspectionPhoto` fortsatt nær identiske (content://-kopiering, ext/contentType-utledning, `FileSystem.uploadAsync`-kall med samme headers). Uendret siden forrige review. — Konsekvens: én bugfiks må gjøres to steder; de har alt divergert i feilmelding (`hive.ts:70` inkluderer `response.body`, `inspection.ts:152` ikke). — Løsning: `lib/storageUpload.ts` med felles `uploadBinaryToStorage(bucket, fileName, uri, token)`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `services/hive.ts:171-181` — `fetchMapHives` mapper RPC-rader med usikre cast uten validering: `id: row.id as string, ... locationLat: row.location_lat as number`. Samme mønster i `services/associations.ts:64-77` og `services/diseases.ts:26-36` (`id: row.id as string` osv.). — Konsekvens: inkonsistent med de 9 validerende mapX-ene; korrupte rader gir kryptiske runtime-feil nedstrøms i kart/lister. — Løsning: samme defensive mønster (typeof-sjekk + kast). — Innsats: S — Konfidens: HØY

**[MEDIUM]** Filer over 400 linjer (7 stk): `hjem/index.tsx` 976 · `kuber/ny.tsx` 609 · `kuber/[id]/index.tsx` 548 · `kuber/[id]/rediger.tsx` 517 · `components/animations/HivePlaceholder.tsx` 432 · `kalender/index.tsx` 424 · `kuber/index.tsx` 417 · `components/info/HoneyForecastChart.tsx` 414. `ny.tsx` og `rediger.tsx` dupliserer dessuten skjema-state for samme entitet. — Løsning: felles `useHiveForm()`-hook for ny/rediger; del kalender i seksjoner. — Innsats: L — Konfidens: HØY

**[LAV]** `types/index.ts:63` — `diseaseObservations: Record<string, unknown> | null` ut, men input (`inspection.ts:27`) er `Record<string, boolean>`. Uendret siden forrige review. — Løsning: `Record<string, boolean> | null` begge veier. — Innsats: S — Konfidens: HØY

**[LAV]** `services/subscription.ts:22,32,49,58` — fire repeterte `{ entitlements: { active: {} } } as unknown as CustomerInfo`. Uendret. — Løsning: én delt konstant. — Innsats: S — Konfidens: HØY

**[LAV]** `services/inspection.ts:206` — `await res.json() as VarroaAnalysis & { error?: string }` — Edge Function-respons valideres ikke (Zod finnes i stacken). — Innsats: S — Konfidens: HØY

**[LAV]** `services/hive.ts:88-101` — timeout-via-`Promise.race` finnes kun i `fetchHives`; ingen andre fetch har det. Inkonsistent policy. — Innsats: S — Konfidens: HØY

**[LAV]** Duplisert datoformatering — lokal `formatDate`/`toLocaleDateString('nb-NO', ...)` definert i 10 filer (`kuber/[id]/index.tsx:123`, `HarvestSection.tsx:9`, `QueenSection.tsx:16`, `TreatmentSection.tsx:29`, `WeightSection.tsx:11`, `report.ts:6,10` m.fl.) med subtilt ulike options (med/uten år, short/long måned). — Løsning: `lib/date.ts` med 2–3 navngitte formatter. — Innsats: S — Konfidens: HØY

**[LAV]** `app/(app)/(tabs)/feed/index.tsx:108` — `currentUserId={(profile as any)?.id}` — unødvendig `as any`; `profile` er typet `User | null` med `id`. Eneste reelle `any`-hull utenom legitime Expo Router-cast (18 stk, alle ruter/Mapbox). — Innsats: S — Konfidens: HØY

**React Query-vurdering (pkt. 3):** Global `staleTime` 5 min + `retry: 2` er fornuftig default; vær har egen TTL i service. Statiske data (foreninger, utstyr, sykdommer) kunne hatt timer-lang staleTime, men dagens oppsett er ikke feil. Invalidering brukes konsekvent; `rediger.tsx:145-146` kombinerer korrekt `setQueryData(['hive', id])` + invalidate `['hives']`. Ingen kollisjoner funnet.

## Topp-3 anbefalinger
1. **Fiks stille profil-feil** (`profile.ts:31` + `_layout.tsx:53`): kast ved DB-feil og legg retry/refetch på profil-lasting. Hindrer at betalende brukere mister tilgang ved transient feil. (M, direkte konverterings-/retentionseffekt)
2. **Harden de tre usikre mapperne** (`fetchMapHives`, `associations`, `diseases`) + sjekk `error` i `feed.toggleLike`. Fire små fikser som lukker hele gapet i service-lagets ellers konsistente defensive mønster. (S–M samlet)
3. **Splitt `hjem/index.tsx`** (976 linjer) i seksjonskomponenter + `useDashboardData()`. Står igjen fra forrige review og blokkerer testbarhet av appens viktigste skjerm. (M)
