# Agent 7 — Robusthet og feilhåndtering

## Metainfo
- Filer lest: `app/_layout.tsx`, `app/(app)/_layout.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `components/inspection/Step3.tsx`, `services/subscription.ts`, `services/hive.ts`, `components/ui/ErrorBoundary.tsx`, `components/ui/Toast.tsx`, `lib/supabase.ts`, `lib/queryClient.ts`. Grep: tomme catch (0 treff), `Promise.all` (5 treff), ErrorBoundary i `app/` (kun rot), `NetInfo|onlineManager|persistQueryClient|networkMode|AppState` (0 treff), komma/keyboardType i `components/`.
- Filer ikke funnet: ingen
- Diff mot forrige (`reports/archive/2026-06-18/agent-07-robusthet.md`): **Bekreftet fikset:** rapportgenerering bruker nå `Promise.allSettled` (`hjem/index.tsx:221-238`) — den tidligere MEDIUM er lukket, og delvis suksess gir egen info-toast. `subscription.ts:24-26` kaster eksplisitt ved manglende Android-nøkkel (fail-fast). Ingen [REGRESJON]. **Gjenstår uendret fra forrige:** offline-evne (HØY), ubetinget `retry:2` + rå feilmelding (MEDIUM), AppState-token-refresh (MEDIUM), rot-only ErrorBoundary (MEDIUM), varroa-komma (LAV), 1-års signed URL (LAV).

## Sammendrag
De to diff-punktene er reelt lukket: rapporten lages nå på delvis data, og RevenueCat feiler raskt uten nøkkel. Wizard-draftet (inkl. foto, AI-resultat, dato) og bilde-allSettled er fortsatt solide. De fire strukturelle svakhetene fra forrige runde står imidlertid uendret: ingen offline-persistering eller nettverksindikator, ubetinget retry med engelske/tekniske toasts, ingen AppState-styrt token-refresh, og ErrorBoundary kun på rot. Varroa-komma-inkonsistensen og 1-års signed URL er også uendret.

## Fungerer godt (ikke rør)
1. **Wizard-draft komplett** (`ny.tsx:40-159`) — alle felt inkl. `photoUris`/`varroaAiResult`/`inspectedAt` auto-lagres, gjenopprettes med toast, ryddes ved suksess/avbryt. Reelt datatap ved Android-bakgrunnsdrap er tettet.
2. **Bilde-opplasting med `allSettled`** (`ny.tsx:205-213`) — inspeksjonen lagres selv om enkeltbilder feiler; teller-toast på feil.
3. **Rapport med `allSettled`** (`hjem/index.tsx:221-238`) — NYTT: genererer på det som lyktes, info-toast ved delvis feil.
4. **AI-feilstier** (`Step3.tsx:57-99,161-169`) — try/catch, «Prøv igjen med samme bilde» beholder `imageUri`, norske meldinger.
5. **Fail-fast RevenueCat** (`subscription.ts:24-26`) — kaster ved manglende nøkkel i stedet for å gi betalende feil tier.

## Funn

**[HØY]** `lib/queryClient.ts:22-27` + hele kodebasen — Ingen offline-persistering eller nettverkshåndtering. Grep `NetInfo|onlineManager|persistQueryClient|networkMode` = 0 treff; cache er kun in-memory (`defaultOptions: { queries: { staleTime, retry: 2 } }`). — Konsekvens: Birøkter i felt uten dekning får tom kubeliste/dashboard etter prosessdrap; `retry: 2` betyr 3 forsøk × backoff (med `fetchHives` 10s timeout) før noe vises. Ingen offline-banner; `hjem/index.tsx:381-390` har retry-banner kun for `hivesError`, ikke inspeksjoner/vær. — Løsning: `@tanstack/query-async-storage-persister` + `persistQueryClient`, `onlineManager` koblet til `@react-native-community/netinfo`, offline-indikator. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `lib/queryClient.ts:9,18,24-26` — `retry: 2` ubetinget og `show(error.message, 'error')` viser rå feilmelding. — Konsekvens: 401/valideringskast (`mapHive`: «Ugyldig hive: mangler id», `hive.ts:194`) og «Network request failed» retryes meningsløst og vises som engelske/tekniske toasts fra bakgrunns-refetch. — Løsning: `retry`-funksjon som hopper over 401/PGRST/`Ugyldig`-feil; oversett kjente koder til norsk før toast. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `components/ui/ErrorBoundary.tsx` montert kun i `app/_layout.tsx:113` (grep i `app/`: eneste forekomst). — Konsekvens: Et kast i én skjerm (f.eks. `mapHive`/`mapInspection` på korrupt rad) river hele app-treet; «Last inn på nytt» (`ErrorBoundary.tsx:36`) resetter bare `hasError` uten å invalidere cache — samme cachede rad kan kaste igjen umiddelbart → uendelig feilskjerm. — Løsning: Lokal boundary rundt kubeprofil/wizard; la reset også invalidere relevante queries. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `lib/supabase.ts:16` + hele kodebasen — `autoRefreshToken: true` men ingen `AppState`-lytter (grep: 0 treff) som kaller `startAutoRefresh()/stopAutoRefresh()` som Supabase RN-docs anbefaler. — Konsekvens: Refresh-timeren throttles i bakgrunn; etter lang inspeksjonspause kan første lagring feile med JWT-feil (draftet redder data, men UX blir «feil → prøv igjen», forsterket av rå-feilmelding-toast over). — Løsning: AppState-lytter i `app/_layout.tsx` som styrer auto-refresh. — Innsats: S — Konfidens: MEDIUM (runtime-avhengig)

**[LAV]** `ny.tsx:233` + `Step3.tsx:111-116` — Varroa-validering: `if (varroaCount !== '' && (isNaN(Number(varroaCount)) ...))` og `keyboardType="numeric"`. `Number('1,5')` = NaN, så komma avvises — først på siste steg. Kontrast: vekt/høsting normaliserer (`WeightSection.tsx:30` `replace(',', '.')`) og bruker `decimal-pad`. — Konsekvens: Inkonsistent og sen tilbakemelding på norsk tastatur. — Løsning: Normaliser komma + valider inline i Step3; `decimal-pad`. — Innsats: S — Konfidens: HØY

**[LAV]** `services/hive.ts:74-78` — `createSignedUrl(fileName, 365*24*3600)` lagres permanent som `photo_url`. Kontrast: inspeksjonsmedia genererer ferske signed URLs ved visning. — Konsekvens: Kubefoto blir 403/broken etter nøyaktig 1 år. — Løsning: Lagre storage-path, generer signed URL ved visning. — Innsats: M — Konfidens: HØY

**[LAV]** `services/subscription.ts:15-30` + `app/(app)/_layout.tsx:31-37` — Ved transient RC-init-feil fanges feilen (Sentry + toast), men `applyCustomerInfo` kjøres aldri, så `rcTier` forblir `null`. — Konsekvens: Betalende faller tilbake til DB-tier (akseptabelt via `useEffectiveTier`), men kjøp samme sesjon krever app-restart. — Løsning: Re-prøv `getCustomerInfo` ved neste forgrunn (passer med AppState-lytteren over), eller «gjenopprett kjøp». — Innsats: S — Konfidens: MEDIUM

Svelgte feil / `Promise.all`: 0 tomme catch-blokker (uendret bra). Klient-`Promise.all` i `notifications.ts:145/189` (kansellering) og `SeasonChecklist.tsx:22` (AsyncStorage-les) er lav-risiko. `delete-account/index.ts:34,61` bruker `Promise.all` på storage-rydding — bør vurderes `allSettled` så delvis sletting ikke avbryter, men utenfor klient-scope (edge function).

## Topp-3 anbefalinger
1. **Offline-persistering + NetInfo-indikator** (M) — eneste gjenstående HØY og uendret i to runder. Birøkt skjer der dekningen er dårligst; sist-kjente data offline er forskjellen på «ubrukelig i felt» og «pålitelig verktøy».
2. **Betinget retry + norsk feiloversettelse i queryClient** (M) — fjerner meningsløse retries på valideringsfeil og engelske tekniske toasts fra bakgrunns-refetch; forsterker også JWT-pause-UX.
3. **Lokal ErrorBoundary med cache-invalidering + AppState-token-refresh** (M+S) — hindrer at én korrupt rad river hele appen i uendelig feilskjerm, og lukker JWT-feil etter lang inspeksjonspause.
