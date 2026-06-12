# Agent 5 — Arkitektur

## Metainfo
- **Filer lest:** `services/hive.ts`, `services/inspection.ts`, `services/subscription.ts`, `types/index.ts`, `lib/supabase.ts`, `lib/queryClient.ts`, `hooks/useEffectiveTier.ts`, utdrag av `components/hive/WeightSection.tsx`, `app/(app)/(tabs)/kuber/ny.tsx`, `services/collaboration.ts` (utdrag).
- **Filer ikke funnet:** Kun én hook-fil eksisterer (`hooks/useEffectiveTier.ts`) — ingen `hooks/`-katalog med flere filer som antydet i oppgaven.
- **Konfidensgrad:** Høy for service-/type-lag og React Query. Middels for komponentinterna (kun line-count + stikkprøver, ikke full lesing).

## Sammendrag
Kodebasen er ryddig: konsistent service-mønster med defensive `mapX()`-validatorer, ingen `: any`/`as any` i services/ eller types/, ingen TODO/FIXME/HACK i app-kode. Hovedfunn er arkitektoniske: muterende uten egen `onError` feiler stille (global mutationCache logger kun til Sentry, viser ingen toast), 9 komponenter over 300 linjer (hjem 976), og duplisert opplastings-/`mapX`-logikk mellom hive og inspection.

## Funn

### HØY
**[HØY]** `lib/queryClient.ts:12-16` — Global `mutationCache.onError` logger kun til Sentry og viser **ingen** toast (i motsetning til `queryCache.onError:9` som gjør begge). Muterende uten egen `onError` (f.eks. `components/hive/WeightSection.tsx:167-170`, `QueenSection`/`HarvestSection`/`TreatmentSection` delete-muterende, `feed`-muterende) feiler dermed stille for brukeren. — Konsekvens: Bruker tror sletting/lagring lyktes når den feilet. — Løsning: Legg `useToastStore.getState().show(error.message,'error')` i den globale `mutationCache.onError`, og fjern repeterte per-mutation `onError`-callbacks (DRY).

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx` (976 linjer) — Langt over 800-grensen for én skjerm. — Konsekvens: Vanskelig å teste/vedlikeholde, høy koblingsgrad (6+ queries: hives, vær, høsting, inspeksjoner i samme fil). — Løsning: Trekk ut dashboard-seksjoner til `components/home/*` og en `useDashboardData()`-hook.

### MEDIUM
**[MEDIUM]** `services/hive.ts:37-79` vs `services/inspection.ts:120-156` — `uploadHivePhoto` og `uploadInspectionPhoto` er nær identiske (content:// → file:// kopiering, ext/contentType-utledning, `FileSystem.uploadAsync`). — Konsekvens: Duplisert teknisk gjeld; én fiks må gjøres to steder. — Løsning: Ekstraher `lib/storageUpload.ts` med felles `uploadBinaryToStorage(bucket, fileName, uri, token)`.

**[MEDIUM]** `app/(app)/(tabs)/kuber/ny.tsx` (609), `kuber/[id]/index.tsx` (548), `kuber/[id]/rediger.tsx` (517), `kalender/index.tsx` (424), `inspeksjon/ny.tsx` (394), `components/ui/UpgradeModal.tsx` (366), `components/hive/TreatmentSection.tsx` (314), `app/(app)/profil.tsx` (307) — 8 filer mellom 300–800 linjer. — Konsekvens: Lav kohesjon; skjema-state, mutasjoner og presentasjon blandet. — Løsning: Trekk skjemalogikk ut i custom hooks; del seksjoner i underkomponenter.

**[MEDIUM]** `services/hive.ts:171-181` (`fetchMapHives`) — RPC-rader mappes med usikre `row.x as string`/`as number`-cast uten validering, i motsetning til `mapHive`/`mapInspection` som validerer required-felt og kaster ved feil. — Konsekvens: Inkonsistent robusthet; korrupte RPC-rader gir runtime-feil lenger nede. — Løsning: Gjenbruk samme defensive mønster (typeof-sjekk + kast på manglende required).

**[MEDIUM]** `services/inspection.ts:233` & `types/index.ts:63` — `diseaseObservations` typet som `Record<string, unknown>` selv om input (`inspection.ts:27`) bruker `Record<string, boolean>`. — Konsekvens: Type-asymmetri inn vs ut; konsumenter må re-narrowe boolean. — Løsning: Bruk `Record<string, boolean> | null` begge veier.

### LAV
**[LAV]** `services/subscription.ts:22,32,49,58` — Fire repeterte `{ entitlements: { active: {} } } as unknown as CustomerInfo` for iOS-mock. — Konsekvens: Duplisering; `as unknown as` omgår typesikkerhet. — Løsning: Én delt `const IOS_MOCK_CUSTOMER_INFO`-konstant.

**[LAV]** `services/hive.ts:101` — `Promise.race([query, timeout]) as Awaited<typeof query>` finnes kun i `fetchHives`; ingen andre fetch har timeout. — Konsekvens: Inkonsistent timeout-policy. — Løsning: Vurder felles `withTimeout()`-helper hvis timeout ønskes konsistent.

**[LAV]** `services/inspection.ts:206` — `fetch().json() as VarroaAnalysis` uten Zod-validering av Edge Function-respons. — Konsekvens: Ekstern data ikke validert ved systemgrense (jf. coding-style). — Løsning: Zod-parse responsen.

**[POSITIVT]** Ingen `: any`/`as any` i services/ eller types/; ingen TODO/FIXME/HACK/XXX i app-kode (kun i docs/reports); konsistente `queryKey`-konvensjoner (`['entitet', id]`); fornuftig global `staleTime` 5 min + `retry: 2`; `mapHive`/`mapInspection` validerer korrekt og bruker `typeof === 'string' ? x : null` for nullable felt iht. CLAUDE.md.

## Topp-3 anbefalinger
1. **Vis toast i global `mutationCache.onError`** og fjern repeterte per-mutation `onError`. Hindrer stille feil ved sletting/lagring. (~1 t)
2. **Ekstraher felles binær-opplasting** (`lib/storageUpload.ts`) brukt av hive- og inspection-foto. Fjerner duplisert teknisk gjeld. (~1,5 t)
3. **Del opp `hjem/index.tsx` (976 linjer)** i seksjonskomponenter + `useDashboardData`-hook. Forbedrer testbarhet og kohesjon. (~3 t)
