# Agent 7 — Robusthet og feilhåndtering

## Metainfo
- Filer lest: `app/(app)/_layout.tsx`, `app/_layout.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `services/subscription.ts`, `services/hive.ts`, `services/inspection.ts`, `lib/supabase.ts`, `lib/queryClient.ts`, `components/ui/ErrorBoundary.tsx`
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

## Sammendrag

Appen har en solid grunnmur: global ErrorBoundary med Sentry, React Query med retry-logikk, draft-lagring i wizard og `Promise.allSettled` ved bilde-opplasting. Svakhetene er konsentrert rundt tre mønstre: (1) svelgte catch-blokker som skjuler tilstandskorrupsjon, (2) manglende negativ-validering av varroa-count, og (3) en enkelt `Promise.all` i rapport-generering som kan miste data lydløst ved nettverksfeil.

---

## Funn

### Kritisk

**[KRITISK]** `app/(app)/_layout.tsx:26` — `initPurchases → syncTierToSupabase` svelges helt med `.catch(() => {})`. Dersom RevenueCat returnerer en tier og Supabase-sync feiler, bruker appen feil tier (f.eks. `starter` i stedet for `hobbyist`) uten at bruker eller Sentry varsles. Bruker mister tilgang til betalte funksjoner.
- **Løsning:** Logg feilen til Sentry og vis en diskret toast: `catch((e) => { Sentry.captureException(e); showToast('Abonnement ikke synkronisert', 'warning'); })`.

---

### Høy

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:207` — `Promise.all([fetchAllInspections(), fetchAllTreatments()])` brukes i rapport-generering. Hvis én av kallene feiler, avbrytes begge og hele rapporten feiler. `Promise.allSettled` ville tillatt at delresultater brukes og at brukeren informeres spesifikt om hva som feilet.
- **Løsning:** Bytt til `Promise.allSettled`, les `status === 'fulfilled'` og vis `'Behandlinger utilgjengelig — rapport ufullstendig'` ved behov.

**[HØY]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:218–232` — Validering av `varroaCount` sjekker kun `isNaN`, men ikke negative verdier. En bruker kan taste inn `-5`, som passerer valideringen og sendes til Supabase som et negativt tall. Downstream beregner `computeHealthScore` og Varroa-trend feil, og varslingen i `buildAlerts` (terskel 3) fungerer ikke korrekt for negative verdier.
- **Løsning:** Legg til: `if (Number(varroaCount) < 0) { showToast('Varroa-telling kan ikke være negativ', 'error'); return; }` mellom linje 218 og 222.

**[HØY]** `app/(app)/_layout.tsx:19–20` — `requestNotificationPermission` og `registerPushToken` svelger sine catch-blokker uten logging. Push-token registreres kanskje aldri, og bruker mottar ingen varsler uten synlig feil. Det finnes ingen retry-mekanisme.
- **Løsning:** Logg til Sentry minst på produksjon: `catch((e) => { if (!__DEV__) Sentry.captureException(e); })`.

---

### Medium

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:99–124` — Draft-gjenoppretting ved mount mangler behandling av korrumperte partial drafts. Feltet `varroaCount` leses som streng fra JSON, men det finnes ingen validering av at verdien faktisk er et gyldig tall-streng. En korrupt draft kan sette `varroaCount` til `'undefined'` eller `'NaN'`, som passerer `isNaN`-sjekken på linje 218 siden `isNaN('undefined') === true` og blokkerer innlevering.
- **Løsning:** Valider `draft.varroaCount` med `isNaN(Number(draft.varroaCount ?? '')) ? '' : draft.varroaCount` ved draft-restore, linje 113.

**[MEDIUM]** `services/hive.ts:87–100` — `fetchHives` har en 10-sekunders timeout via `Promise.race`, men `fetchHive` (enkelt-oppslag brukt i wizard) har ingen timeout. En hengende nettverksforbindelse vil fryse wizard-skjermen uten at bruker informeres eller kan avbryte.
- **Løsning:** Wrap `fetchHive` i samme timeout-mønster som `fetchHives`.

**[MEDIUM]** `services/subscription.ts:71–92` — `syncTierToSupabase` henter session med `supabase.auth.getSession()` uten å håndtere utløpt JWT midt i flyten. Supabase-klienten er konfigurert med `autoRefreshToken: true`, men det er ingen garanti for at refresh er fullført når denne funksjonen kalles (f.eks. ved oppstart). Funnet at kallet er uten retry ved `401`-feil.
- **Konsekvens:** Tier synces ikke; bruker havner på feil tier.
- **Løsning:** Bruk `supabase.auth.refreshSession()` med fallback, eller sjekk `session.expires_at` før sync.

**[MEDIUM]** `components/ui/ErrorBoundary.tsx` — ErrorBoundary dekker kun rot-nivå (i `app/_layout.tsx:107`). Kritiske enkelt-skjermer som kubeprofil (`kuber/[id]/index.tsx`) og inspeksjons-wizard (`ny.tsx`) har ingen lokal ErrorBoundary. En uventet `throw` i disse skjermene vil propagere opp til rot-ErrorBoundary og nullstille hele navigasjonsstacken, og bruker mister ulagret wizard-data.
- **Løsning:** Wrap `NyInspeksjon`-skjermen og kubeprofil med en lokal `<ErrorBoundary>` som viser en skjerm-spesifikk feilmelding uten å resette stacks.

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:130–133` — `lastInspectionByHive`-query har ingen `isError`-sjekk i UI. Dersom RPC-kallet `get_latest_inspections_per_hive` feiler, vises `avgHealth = 0` og alle kuber fremstår som "ikke inspisert" i alert-logikken. Bruker ser feil varsler uten noen indikasjon på at data mangler.
- **Løsning:** Destrukturer `isError: lastInspError` og vis en diskret advarsel om helse-data er utilgjengelig.

---

### Lav

**[LAV]** `app/(app)/(tabs)/hjem/index.tsx:192` — `scheduleInspectionReminderDeduped` svelges med `.catch(() => {})`. Hvis notifikasjon-scheduling feiler (f.eks. tillatelse trukket tilbake), vet ikke appen det, og bruker mottar ikke påminnelse.

**[LAV]** `lib/supabase.ts:4` — `EXPO_PUBLIC_SUPABASE_URL!` bruker non-null assertion etter at null-sjekken er gjort på linje 7. Dette er logisk inkonsistent — throw-sjekken på linje 7–10 er korrekt defensiv programmering, men `!`-assertion på linje 4 er overflødig og misvisende for videre vedlikehold.

**[LAV]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:147–159` — Vær-autoinnhenting ved wizard-åpning svelger feil med `.catch(() => {})`. Ingen visuell indikator vises dersom GPS eller Yr.no er utilgjengelig utover at feltene forblir tomme. `weatherLoading`-tilstanden er korrekt implementert, men ingen feilmelding vises.

---

## Topp-3 anbefalinger

1. **Logg og varsle ved tier-sync-feil** (`app/(app)/_layout.tsx:26`). Den svelgte catch-blokken rundt `syncTierToSupabase` er den eneste kritiske feilen med direkte forretningskonsekvens — bruker mister betalte funksjoner lydløst. Bytt `.catch(() => {})` med Sentry-logging og en `'warning'`-toast.

2. **Legg til lokal ErrorBoundary rundt inspeksjons-wizard** (`ny.tsx`). Rot-ErrorBoundary resetter hele navigasjonsstacken og sletter ulagret draft. En skjerm-lokal boundary kan fange crashes uten stack-reset og bevare AsyncStorage-draftet til brukeren.

3. **Valider negativ varroa-count** (`ny.tsx:218`). Legg til en enlinjes sjekk `Number(varroaCount) < 0` før mutation kalles. Dette er en lav-kostnad fix som forhindrer korrupte data i Supabase som påvirker helse-score, Varroa-trend og alert-logikk i hele appen.
