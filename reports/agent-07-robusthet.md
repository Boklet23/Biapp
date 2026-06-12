# Agent 7 — Robusthet og feilhåndtering

## Metainfo
- Filer lest: `app/_layout.tsx`, `app/(app)/_layout.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `app/(app)/(tabs)/kuber/ny.tsx` (delvis), `components/inspection/Step3.tsx`, `services/subscription.ts`, `services/hive.ts`, `services/inspection.ts` (analyzeVarroa/mapInspection), `services/location.ts`, `lib/supabase.ts`, `lib/queryClient.ts`, `store/auth.ts`, `components/ui/ErrorBoundary.tsx`, `components/ui/Toast.tsx`, `components/hive/WeightSection.tsx` (delvis)
- Filer ikke funnet: ingen
- Diff mot forrige review: lest arkiv (`reports/archive/2026-06-10/agent-07-robusthet.md`): ja. **Fikset siden sist:** KRITISK Sentry-import i `(app)/_layout.tsx` er på plass (`import * as Sentry from '@sentry/react-native';` linje 5) — verifisert. **Fortsatt åpne:** offline-persistering, `Promise.all` i rapport, ubetinget `retry: 2`, manglende AppState-token-refresh, rot-only ErrorBoundary, `tier_locked`-lesefeil ignoreres.

## Sammendrag
Ingen kjente krasj i hovedflyt lenger — forrige rundes KRITISK (manglende Sentry-import) er fikset. Wizard-draft i AsyncStorage beskytter inspeksjonsdata godt, men draftet dekker IKKE foto og AI-resultat: prosessdrap etter betalt AI-analyse mister resultatet og forbruker kvote. Største gjenstående svakheter: null offline-evne (in-memory cache, ingen NetInfo), React Query-cache tømmes ikke ved SIGNED_OUT-event (potensiell datalekkasje mellom kontoer på delt enhet), og `analyzeVarroa` uten timeout kan henge for alltid.

## Fungerer godt (ikke rør)
1. **Draft-autolagring i wizard** (`ny.tsx:127-145`) — alle tekst-/tallfelt lagres per tastetrykk, gjenopprettes med toast, ryddes ved suksess/avbryt.
2. **GPS-feilhåndtering** (`services/location.ts` + `kuber/ny.tsx:49-75`) — skiller SERVICES_DISABLED/PERMISSION_DENIED/TIMEOUT, norske meldinger, «Åpne innstillinger»-knapp, 15 s timeout.
3. **`Promise.allSettled` ved bildeopplasting** (`ny.tsx:190-197`) — inspeksjonen lagres selv om enkeltbilder feiler, med eksplisitt teller-toast.
4. **Global feilkanal** (`lib/queryClient.ts:6-21`) — QueryCache/MutationCache → Sentry + toast, med dedupe mot lokale onError.
5. **Komma-håndtering i vekt/høsting** (`WeightSection.tsx:30`, `HarvestSection.tsx:38`) — `parseFloat(s.replace(',', '.'))` + `decimal-pad`.

## Funn

**[HØY]** `lib/queryClient.ts:5-28` — Ingen offline-persistering eller nettverkshåndtering: `new QueryClient({ ... defaultOptions: { queries: { staleTime: 5*60*1000, retry: 2 } } })`. Grep etter `NetInfo|onlineManager|persistQueryClient|networkMode` gir 0 treff i hele kodebasen. — Konsekvens: Birøkter i felt uten dekning ser tom kubeliste/feilbanner etter prosessdrap (cache er kun in-memory); `retry: 2` gjør at hver feilende query prøver 3 ganger med backoff før noe vises. Ingen offline-indikator finnes. — Løsning: `@tanstack/query-async-storage-persister` + `persistQueryClient`, `onlineManager` koblet til NetInfo, og offline-banner. — Innsats: M — Konfidens: HØY

**[HØY]** `store/auth.ts:32-41` + `app/_layout.tsx:62-71` — `queryClient.clear()` kjøres kun i den manuelle `signOut`-actionen. `onAuthStateChange`-lytteren (`if (event === 'INITIAL_SESSION') return; setSession(session);`) rydder aldri cachen ved SIGNED_OUT/token-revokering. — Konsekvens: Logges bruker ut server-side (utløpt/revokert sesjon) og en annen konto logger inn på samme enhet, serveres forrige brukers `['hives']`/`['all-inspections']`-cache som fersk data i opptil 5 min (staleTime). Datalekkasje mellom kontoer + inkonsistent tilstand. — Løsning: `if (event === 'SIGNED_OUT') queryClient.clear();` i lytteren (evt. også ved brukerbytte: sammenlign user.id). — Innsats: S — Konfidens: HØY

**[HØY]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:40-54` — `DraftState` mangler `photoUris`, `varroaAiResult` og `inspectedAt` (kun tekst/tall/bool-feltene lagres). — Konsekvens: Android-bakgrunnsdrap midt i wizard mister valgte foto OG et betalt AI-analyseresultat (kvoten i `ai_usage` er allerede forbrukt — `aiResult.usageThisMonth` teller opp). Dato resettes stille til «nå». — Løsning: Utvid `DraftState` med `photoUris`, `varroaAiResult` og `inspectedAt` (ISO-streng). — Innsats: S — Konfidens: HØY

**[MEDIUM]** `services/inspection.ts:197-207` — `const res = await fetch(url, {...}); const data = await res.json()` — ingen timeout/AbortController, og `res.json()` kaster rå parse-feil ved ikke-JSON-svar (f.eks. gateway-timeout-HTML). — Konsekvens: Henger AI-API-et, står `analyzing`-spinneren i Step3 evig (knappen disabled); ved 504 får brukeren engelsk «JSON Parse error»-toast i stedet for norsk melding. Brukeren må dessuten velge bildet på nytt for å prøve igjen. — Løsning: `AbortController` med ~30 s timeout, try/catch rundt `res.json()` med norsk fallback, og «Prøv igjen»-knapp som gjenbruker `imageUri`. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:215-218` — `const [reportInspections, treatments] = await Promise.all([fetchAllInspections(), fetchAllTreatments()]);` — feiler én, feiler alt med generisk «Kunne ikke generere rapport» (l. 229). Uendret siden forrige review. — Konsekvens: Ingen rapport selv når 90 % av dataene var tilgjengelige. — Løsning: `Promise.allSettled`, generer på det som lyktes, spesifiser hva som manglet. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `lib/supabase.ts:13-20` — `autoRefreshToken: true` men ingen `AppState`-lytter i kodebasen (grep: 0 treff) som kaller `supabase.auth.startAutoRefresh()/stopAutoRefresh()`. — Konsekvens: Refresh-timeren throttles når appen er i bakgrunn (anbefalt mønster i Supabase RN-docs); etter lang inspeksjonspause feiler første lagring med JWT-feil (draftet redder dataene, men UX-en er «feil → prøv igjen»). — Løsning: AppState-lytter i `app/_layout.tsx` som starter/stopper auto-refresh. — Innsats: S — Konfidens: MEDIUM (runtime-avhengig)

**[MEDIUM]** `lib/queryClient.ts:24-26` + `:9` — `retry: 2` ubetinget, og `useToastStore.getState().show(error.message, 'error')` viser rå feilmeldinger. — Konsekvens: 401/`mapX()`-valideringskast retryes meningsløst; brukeren kan få engelske toasts («JWT expired», «Network request failed», «TypeError: ...») fra bakgrunns-refetch. — Løsning: `retry`-funksjon som hopper over 401/PGRST/`Ugyldig`-feil; oversett kjente feilkoder til norsk før toast. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `components/ui/ErrorBoundary.tsx:14` montert kun i `app/_layout.tsx:107` (grep: eneste forekomst i `app/`). — Konsekvens: Et kast i én skjerm (f.eks. `mapInspection` ved korrupt rad) river hele app-treet; «Last inn på nytt» resetter bare `hasError`, så samme cachede data kan kaste igjen umiddelbart. — Løsning: Lokal boundary rundt kubeprofil og wizard; la reset også invalidere relevante queries. — Innsats: M — Konfidens: HØY

**[LAV]** `services/subscription.ts:75-81` — `const { data: profileCheck } = await supabase.from('profiles').select('tier_locked')...single();` — `error` destruktureres ikke; ved lesefeil er `profileCheck` undefined og `tier_locked`-guarden faller stille gjennom til update. Uendret siden sist. — Konsekvens: Tier-sync kan overskrive låst tier ved transient lesefeil. — Løsning: Kortslutt (return/throw) når select-kallet returnerer error. — Innsats: S — Konfidens: HØY

**[LAV]** `ny.tsx:218` — Varroa-telling: `if (varroaCount !== '' && (isNaN(Number(varroaCount)) || Number(varroaCount) < 0))` — `Number('1,5')` = NaN, så komma avvises med toast først på siste steg, mens vekt/høsting aksepterer komma. — Konsekvens: Inkonsistent og sen tilbakemelding. — Løsning: Normaliser komma + valider inline i Step3. — Innsats: S — Konfidens: HØY

**[LAV]** `services/hive.ts:74-78` — `createSignedUrl(fileName, 365 * 24 * 3600)` lagres permanent som `photo_url`. — Konsekvens: Kubefoto blir 403/broken etter nøyaktig 1 år. — Løsning: Lagre storage-path og generer signed URL ved visning. — Innsats: M — Konfidens: HØY

Svelgte feil: alle tomme catch-blokker funnet (`notifications.ts:162/179/247/272`, `location.ts:53`, `HiveScene.tsx:46`, `auth.ts:35`) er kommenterte og gjelder nice-to-have-stier — akseptabelt. `Promise.all` i `notifications.ts:133/177` (kansellering) og `SeasonChecklist.tsx:22` (AsyncStorage-les) er lav-risiko.

## Topp-3 anbefalinger
1. **Rydd cache ved SIGNED_OUT + sjekk tier_locked-feil** (S, < 1 t totalt) — lukker datalekkasje mellom kontoer og stille tier-overskriving. To små, kirurgiske endringer.
2. **Utvid wizard-draft med foto/AI-resultat/dato** (S, ~1 t) — fjerner siste reelle datataps-hull i appens viktigste flyt; AI-resultat koster brukeren kvote og må overleve prosessdrap.
3. **Offline-persistering av React Query-cache + NetInfo-indikator** (M, 2–4 t) — birøkt skjer der dekningen er dårligst; sist-kjente-data offline er forskjellen på «ubrukelig i felt» og «pålitelig verktøy».
