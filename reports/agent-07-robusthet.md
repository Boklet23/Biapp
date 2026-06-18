# Agent 7 — Robusthet og feilhåndtering

## Metainfo
- Filer lest: `app/_layout.tsx`, `app/(app)/_layout.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `components/inspection/Step3.tsx`, `services/subscription.ts`, `services/hive.ts`, `services/inspection.ts` (analyzeVarroa/mapInspection/media), `lib/supabase.ts`, `lib/queryClient.ts`, `store/auth.ts`, `components/ui/ErrorBoundary.tsx`, `components/ui/Toast.tsx`. Grep: tomme catch, `Promise.all`, ErrorBoundary, NetInfo/AppState, tier_locked, signed URLs.
- Filer ikke funnet: ingen
- Diff mot forrige review (`reports/archive/2026-06-12/agent-07-robusthet.md`): lest. **Fikset siden sist:** HØY draft uten foto/AI/dato (`DraftState` har nå `photoUris`/`varroaAiResult`/`inspectedAt`), HØY SIGNED_OUT-cache-lekkasje (`_layout.tsx:71-76` rydder cache + kontobytte-sjekk `:57-63`), MEDIUM analyzeVarroa-timeout (AbortController 30s + try/catch på `res.json()` + norske meldinger + «Prøv igjen»-knapp Step3:161-169), LAV tier_locked-guard (klienten skriver ikke lenger tier — eies av webhook med service_role + `tier_locked`-sjekk server-side), `fetchHives` har nå 10s timeout. Tomme catch-blokker: 0 igjen (alle fjernet/kommentert). Alvorlig forbedret runde.

## Sammendrag
Robusthet er markant bedre enn forrige runde: alle tre HØY-funn og to MEDIUM/LAV er lukket. Wizard-draftet dekker nå foto, AI-resultat og dato — det reelle datataps-hullet er tettet. Cache-lekkasje mellom kontoer og hengende AI-spinner er fikset. Gjenstående svakheter er strukturelle: ingen offline-evne (in-memory cache, ingen NetInfo), ubetinget `retry: 2` med rå feilmeldinger i toast, ErrorBoundary kun på rot, og manglende AppState-token-refresh.

## Fungerer godt (ikke rør)
1. **Wizard-draft komplett** (`ny.tsx:40-159`) — alle felt inkl. `photoUris`/`varroaAiResult`/`inspectedAt` lagres per endring, gjenopprettes med toast, ryddes ved suksess/avbryt. Datataps-hullet fra forrige runde er borte.
2. **AI-feilstier** (`inspection.ts:189-232` + `Step3.tsx:57-99,161-169`) — AbortController-timeout, try/catch på `res.json()`, norske meldinger, «Prøv igjen med samme bilde» som beholder `imageUri`.
3. **Auth-livssyklus** (`_layout.tsx:52-77`) — SIGNED_OUT og kontobytte rydder React Query-cache + rcTier; `signOut` rydder uansett nettverksfeil (`auth.ts:38-47`).
4. **Bildeopplasting med `allSettled`** (`ny.tsx:205-213`) — inspeksjonen lagres selv om enkeltbilder feiler, eksplisitt teller-toast.
5. **GPS-feilhåndtering** (`kuber/ny.tsx:57-72`) — skiller PERMISSION_DENIED/SERVICES_DISABLED, norske meldinger via `locationErrorMessage`.

## Funn

**[HØY]** `lib/queryClient.ts:5-28` + hele kodebasen — Ingen offline-persistering/nettverkshåndtering: `defaultOptions: { queries: { staleTime: 5*60*1000, retry: 2 } }`. Grep `NetInfo|onlineManager|persistQueryClient|networkMode` = 0 treff. — Konsekvens: Birøkter i felt uten dekning ser tom kubeliste etter prosessdrap (cache kun in-memory); `fetchHives` har 10s timeout men `retry: 2` betyr 3 forsøk × backoff før noe vises. Ingen offline-indikator. `hjem/index.tsx:374-383` har retry-banner kun for `hivesError`, ikke for inspeksjoner/vær. — Løsning: `@tanstack/query-async-storage-persister` + `persistQueryClient`, `onlineManager` koblet til NetInfo, offline-banner. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `lib/queryClient.ts:24-26` + `:9,:18` — `retry: 2` ubetinget, og `useToastStore.getState().show(error.message, 'error')` viser rå feilmelding. — Konsekvens: 401/`mapX()`-valideringskast («Ugyldig hive: mangler id») og «Network request failed» retryes meningsløst og vises som engelske/tekniske toasts fra bakgrunns-refetch. — Løsning: `retry`-funksjon som hopper over 401/PGRST/`Ugyldig`-feil; oversett kjente feilkoder til norsk før toast. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:219-233` — `const [reportInspections, treatments] = await Promise.all([fetchAllInspections(), fetchAllTreatments()])` → feiler én, feiler alt med generisk «Kunne ikke generere rapport». Uendret siden forrige to runder. — Konsekvens: Ingen rapport selv når inspeksjonsdataene var tilgjengelige men f.eks. treatments-spørringen feilet. — Løsning: `Promise.allSettled`, generer på det som lyktes, spesifiser hva som manglet. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `lib/supabase.ts:13-20` + hele kodebasen — `autoRefreshToken: true` men ingen `AppState`-lytter (grep: 0 treff) som kaller `startAutoRefresh()/stopAutoRefresh()` — Supabase RN-docs anbefaler dette. — Konsekvens: Refresh-timeren throttles i bakgrunn; etter lang inspeksjonspause kan første lagring feile med JWT-feil (draftet redder dataene, men UX er «feil → prøv igjen»). — Løsning: AppState-lytter i `app/_layout.tsx`. — Innsats: S — Konfidens: MEDIUM (runtime-avhengig)

**[MEDIUM]** `components/ui/ErrorBoundary.tsx` montert kun i `app/_layout.tsx:113` (grep i `app/`: eneste forekomst). — Konsekvens: Et kast i én skjerm (f.eks. `mapInspection`/`mapHive` ved korrupt rad) river hele app-treet; «Last inn på nytt» resetter bare `hasError` uten å invalidere cache, så samme cachede rad kan kaste igjen umiddelbart → uendelig feilskjerm. — Løsning: Lokal boundary rundt kubeprofil/wizard; la reset også invalidere relevante queries. — Innsats: M — Konfidens: HØY

**[LAV]** `ny.tsx:233` — Varroa-validering: `if (varroaCount !== '' && (isNaN(Number(varroaCount)) || Number(varroaCount) < 0))` — `Number('1,5')` = NaN, så komma avvises med toast først på siste steg, mens vekt/høsting aksepterer komma (`replace(',', '.')`). `Step3.tsx:113` bruker `keyboardType="numeric"` (ikke decimal-pad). — Konsekvens: Inkonsistent og sen tilbakemelding på norsk tastatur. — Løsning: Normaliser komma + valider inline i Step3. — Innsats: S — Konfidens: HØY

**[LAV]** `services/hive.ts:73-78` — `createSignedUrl(fileName, 365*24*3600)` lagres permanent som `photo_url`. Kontrast: `inspection.ts:176-178` genererer ferske signed URLs (3600s) ved visning — riktig mønster. — Konsekvens: Kubefoto blir 403/broken etter nøyaktig 1 år. — Løsning: Lagre storage-path, generer signed URL ved visning slik inspeksjonsmedia gjør. — Innsats: M — Konfidens: HØY

**[LAV]** `services/subscription.ts:19-25` + `app/(app)/_layout.tsx:31-37` — `initPurchases` kaster ved RC-konfigfeil; fanges i `_layout.tsx` med Sentry + toast «Abonnementsstatus kunne ikke synkroniseres». Men `applyCustomerInfo` kjøres aldri da, så `rcTier` forblir `null`. — Konsekvens: Ved transient RC-init-feil ved oppstart faller en betalende bruker tilbake til DB-tier (akseptabelt via `useEffectiveTier`), men kjøp samme sesjon krever app-restart for å reflekteres. Lav alvorlighet. — Løsning: Re-prøv `getCustomerInfo` ved neste forgrunn, eller manuell «gjenopprett kjøp». — Innsats: S — Konfidens: MEDIUM

Svelgte feil / `Promise.all`: 0 tomme catch-blokker igjen (forbedring). `Promise.all` i `notifications.ts:145/189` (kansellering) og `SeasonChecklist.tsx:22` (AsyncStorage-les) er lav-risiko; `delete-account` edge function bruker `Promise.all` på storage-rydding — bør vurderes `allSettled` så delvis sletting ikke avbryter, men utenfor klient-scope.

## Topp-3 anbefalinger
1. **Offline-persistering + NetInfo-indikator** (M, 2–4 t) — eneste gjenstående HØY. Birøkt skjer der dekningen er dårligst; sist-kjente data offline er forskjellen på «ubrukelig i felt» og «pålitelig verktøy».
2. **Betinget retry + norsk feiloversettelse i queryClient** (M, 1–2 t) — fjerner meningsløse retries på valideringsfeil og engelske tekniske toasts fra bakgrunns-refetch.
3. **`Promise.allSettled` i rapportgenerering + lokal ErrorBoundary** (S+M) — to uavhengige lavhengende frukter: rapport på delvis data, og hindre at én korrupt rad river hele appen i en uendelig feilskjerm.
