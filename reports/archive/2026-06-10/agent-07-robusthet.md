# Agent 7 — Robusthet

## Metainfo
- **Filer lest:** `app/_layout.tsx`, `app/(app)/_layout.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `app/(app)/(tabs)/kuber/ny.tsx` (delvis), `services/subscription.ts`, `services/hive.ts`, `services/inspection.ts`, `lib/supabase.ts`, `lib/queryClient.ts`, `components/ui/ErrorBoundary.tsx`
- **Filer ikke funnet:** ingen (alle scope-filer eksisterer)
- **Konfidensgrad:** Høy for funn i leste filer; Middels for offline/JWT-atferd som avhenger av runtime.

## Sammendrag
Grunnmuren er god: global ErrorBoundary + Sentry, React Query med retry, draft-autolagring i wizard, GPS-feilhåndtering og `Promise.allSettled` ved bildeopplasting. Men det finnes én KRITISK krasj: `Sentry` brukes uimportert i `(app)/_layout.tsx` og kaster `ReferenceError` ved abonnementssync-feil under oppstart. Øvrige svakheter: ingen offline-cache, `Promise.all` i rapport, og rot-only ErrorBoundary.

## Funn

**[KRITISK]** `app/(app)/_layout.tsx:28` — `Sentry.captureException(...)` kalles, men `Sentry` er **ikke importert** i filen (verifisert med grep — ingen `@sentry/react-native`-import). Når `initPurchases→syncTier`-kjeden (linje 24-30) feiler på produksjons-Android (RevenueCat-nettverksfeil, ikke-konfigurert offering, eller Supabase-feil i `syncTierToSupabase`), kaster `.catch`-handleren `ReferenceError: Sentry is not defined` inne i en `.catch` uten ytre boundary → ubehandlet promise-rejection. — **Konsekvens:** Feilen som skulle logges maskeres, toasten vises aldri, og oppstartsflyten kan krasje ved RevenueCat-feil. — **Løsning:** Legg til `import * as Sentry from '@sentry/react-native';` øverst i filen.

**[HØY]** `lib/queryClient.ts:17-22` + `lib/supabase.ts` — Ingen offline-persistering. React Query bruker kun in-memory cache (ingen `persistQueryClient`/AsyncStorage-persister, ingen `gcTime`/`networkMode`). Ved hard kill / Android bakgrunnsdrap tømmes hele cachen; uten nett viser hjem/kuber tomme tilstander i stedet for sist kjente data. — **Konsekvens:** Birøkteren i felt (dårlig dekning) ser «ingen kuber»/feilbanner i stedet for cachet data. — **Løsning:** Legg til `@tanstack/query-async-storage-persister` + `persistQueryClient` med AsyncStorage, og sett `networkMode: 'offlineFirst'`.

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:215` — `Promise.all([fetchAllInspections(), fetchAllTreatments()])` i rapportgenerering. Feiler én, avbrytes begge og hele rapporten feiler med generisk «Kunne ikke generere rapport» (linje 229). — **Konsekvens:** Delvis tilgjengelig data går tapt; brukeren får ingen rapport selv om f.eks. kun behandlinger feilet. — **Løsning:** Bruk `Promise.allSettled`, generer rapport på det som lyktes, og varsle spesifikt om hva som manglet.

**[MEDIUM]** `lib/queryClient.ts:20` — `retry: 2` gjelder *alle* query-feil, inkludert ikke-retriable 401/JWT-utløp og valideringsfeil fra `mapX()` (som kaster `Error`). Ved utløpt token retryes 3 ganger med backoff før feil vises; `mapX`-kast retryes meningsløst. — **Konsekvens:** Treg, forvirrende feilopplevelse ved utlogging/token-utløp. — **Løsning:** Gjør `retry` til en funksjon som ikke retryer på 401/PGRST301/«Ugyldig …»-meldinger.

**[MEDIUM]** `lib/supabase.ts:16` (`autoRefreshToken: true`) — Ingen `AppState`-lytter som driver token-refresh når appen kommer fra bakgrunn. Ved lang inspeksjon (token utløper mens wizard `ny.tsx` er åpen) feiler `mutation.mutate` med JWT-feil. Draftet bevares (`ny.tsx:127-145`), så data tapes ikke — men første lagring feiler. — **Konsekvens:** Lagring feiler ved første forsøk etter lang inaktivitet; bruker må prøve igjen. — **Løsning:** Registrer `AppState`-lytter som kaller `supabase.auth.startAutoRefresh()`/`stopAutoRefresh()`.

**[MEDIUM]** `components/ui/ErrorBoundary.tsx:14` montert kun i `app/_layout.tsx:107` (rot). Kritiske enkeltskjermer (kubeprofil `kuber/[id]/index.tsx`, wizard `ny.tsx`) har ingen lokal boundary. Et uventet `throw` (f.eks. `mapInspection`/`mapHive` ved korrupt rad i et `.map`) propagerer til rot og nullstiller hele navigasjonsstacken. — **Konsekvens:** Bruker kastes ut til toppnivå; «Last inn på nytt» resetter `hasError` men ikke nødvendigvis underliggende feiltilstand. — **Løsning:** Wrap wizard og kubeprofil i lokal `<ErrorBoundary>`.

**[LAV]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:218` — Varroa-validering finnes (avviser NaN/negativ ved siste steg via `isNaN(Number(...)) || < 0`). `Number('1,5')=NaN` fanges korrekt, men brukeren får ingen inline-tilbakemelding før innsending, og desimaler med komma blokkeres stille. `mapInspection` håndterer nullable felt forsvarlig (`typeof === 'number'`). — **Konsekvens:** Mindre god UX ved feiltasting. — **Løsning:** Inline-validering i Step3 + `keyboardType="numeric"`.

**[LAV]** `services/subscription.ts:75-81` — `syncTierToSupabase` gjør `.single()`-kall på `profiles` uten å sjekke `error`. Ved leseproblem er `profileCheck` undefined → `profileCheck?.tier_locked` faller gjennom og fortsetter til update. — **Konsekvens:** Tier-sync kan skrive selv ved leseproblem (overstyrer evt. tier_locked). — **Løsning:** Sjekk og kortslutt på `error` fra select-kallet.

## Topp-3 anbefalinger
1. **Importer Sentry i `(app)/_layout.tsx`** (KRITISK). Én linje. ~5 min. Fjerner produksjonskrasj/maskert feil ved abonnementssync.
2. **Legg til offline-persistering av React Query-cache** (HØY). `persistQueryClient` + AsyncStorage + `networkMode: 'offlineFirst'`. ~2-3 t. Avgjørende for birøktere uten dekning i felt.
3. **`Promise.all`→`allSettled` i rapport + retry-guard på 401/valideringsfeil** (HØY/MEDIUM). ~1-2 t. Hindrer total datatap i rapport og treg feilopplevelse ved token-utløp.
