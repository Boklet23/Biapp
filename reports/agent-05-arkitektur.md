# Agent 5 — Kodekvalitet og arkitektur

## Metainfo
- Filer lest: `services/hive.ts`, `services/inspection.ts`, `services/subscription.ts`, `types/index.ts`, `lib/supabase.ts`, `lib/queryClient.ts`, `hooks/useEffectiveTier.ts`
- Grep-søk: `as any`/`: any` i services/ og types/, `TODO`/`FIXME`/`HACK`/`XXX` i .ts/.tsx, `queryKey`/`staleTime`/`onError` i hele prosjektet, `as unknown as` i services/
- Ekstra lest: `services/collaboration.ts` (indirekte via grep), `components/hive/QueenSection.tsx`, `app/(tabs)/kuber/index.tsx`
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

## Sammendrag

Service-laget er gjennomgående konsistent og profesjonelt: alle mapX()-funksjoner kaster ved manglende required-felt og bruker nullable-guard for valgfrie felt, CRUD-mønsteret er komplett i hive/inspection/queen/treatment/weight/harvest, og React Query-oppsettet er solid med global error-handler og fornuftig staleTime-konfigurasjon. To avvik skiller seg ut: `subscription.ts` bruker fire `as unknown as CustomerInfo`-caster som omgår typesystemet fullstendig, og `QueenSection`-mutasjoner for delete/markReplaced mangler `onError`. Ingen TODO/FIXME/HACK-kommentarer ble funnet. Teknisk gjeld er lav.

## Funn

### TypeScript-strenghet

**[HØY]** `services/subscription.ts:22,32,49,58` — Fire steder returneres `{ entitlements: { active: {} } } as unknown as CustomerInfo` som iOS-stub. Dobbelcasting via `unknown` er en type-safety-bypass og skjuler at iOS-støtte ikke er implementert. Konsekvens: kompilator gir ingen advarsel om CustomerInfo-strukturen endres fra RevenueCat. Løsning: definer en lokal `IOS_STUB_CUSTOMER_INFO` konstant med korrekt type, eller bruk et discriminated union `PlatformCustomerInfo = CustomerInfo | null` og håndter null eksplisitt i kallere.

**[MEDIUM]** `types/index.ts:63` — `diseaseObservations` er typet `Record<string, unknown> | null`, mens `services/inspection.ts:27` definerer `CreateInspectionData.diseaseObservations` som `Record<string, boolean>`. De to er ikke synkronisert. Konsekvens: skrivelag sender `boolean`-verdier, leselag forventer `unknown` og kan feile stille. Løsning: sett begge til `Record<string, boolean> | null` og behold type guard i mapInspection.

**[LAV]** `services/collaboration.ts:30` — `row.profiles as unknown as Record<string, unknown> | null` er eneste `as unknown as` utenfor subscription. Akseptabelt for Supabase join-rader uten generert type, men bør erstattes av generert type fra `supabase gen types` på sikt.

### Service-lag konsistens

**[POSITIV]** `services/hive.ts:190–215`, `services/inspection.ts:211–238` — mapHive() og mapInspection() følger identisk mønster: kast ved manglende required-felt, `typeof x === 'number' ? x : null` for nullable numeriske felt. Konsistent og korrekt.

**[MEDIUM]** `services/hive.ts:98` — `Promise.race([query, timeout]) as Awaited<typeof query>` er en eksplisitt type-assertion for å overtale TypeScript om at timeout-grenen aldri returnerer data. Fungerer i praksis, men er skjør: dersom Supabase-klienten endrer returtype, kompilerer casten fortsatt uten feil. Løsning: bruk en hjelpefunksjon `withTimeout<T>(p: Promise<T>, ms: number): Promise<T>` med korrekt generisk signatur.

**[LAV]** `services/hive.ts:44–49`, `services/inspection.ts:127–132` — `content://`-håndtering for Android er duplisert mellom `uploadHivePhoto` og `uploadInspectionPhoto`. Identisk logikk (kopier til cache, finn ext, sett tmpExt). Løsning: trekk ut `resolveUploadUri(localUri: string): Promise<string>` som delt hjelpefunksjon.

### React Query-mønstre

**[HØY]** `components/hive/QueenSection.tsx:124–132` — `deleteQueen`-mutasjonen og `markReplaced`-mutasjonen mangler begge `onError`. Feil forplanter seg til global MutationCache som kun logger til Sentry (lib/queryClient.ts:13–15), men viser ingen toast til brukeren. Konsekvens: bruker ser ingen tilbakemelding ved nettverksfeil. Løsning: legg til `onError: (e: Error) => Alert.alert('Feil', e.message)` slik de øvrige seksjonene (TreatmentSection, WeightSection, HarvestSection) gjør.

**[MEDIUM]** `app/(tabs)/kuber/sammenlign.tsx:24,26` og `app/(tabs)/kuber/sesongsammenligning.tsx:105–107` — Bruker queryKey `'all-inspections'` (fetchAllInspections, grense 500 inspeksjoner, siste år). Samme key brukes i `kalender/index.tsx:49`. staleTime er ikke satt lokalt, arver global 5 min. For kalender-visningen er 5 min OK, men for sesongsammenligning bør den være lenger siden dataen sjelden endres. Løsning: sett `staleTime: 15 * 60 * 1000` på sesong-queries.

**[POSITIV]** `lib/queryClient.ts:6–23` — Global QueryCache.onError viser toast + Sentry, MutationCache.onError logger til Sentry, defaultOptions.queries.staleTime = 5 min. Solid grunnoppsett. Krever imidlertid at mutation-spesifikke onError-handlers (som mangler i QueenSection) faktisk er satt for brukersynlig tilbakemelding.

**[POSITIV]** `lib/supabase.ts:4–20` — Validerer env-variabler ved oppstart og kaster umiddelbart. Korrekt fail-fast-mønster.

**[LAV]** queryKey-konsistens er god: `['hives']`, `['hive', id]`, `['inspections', id]`, `['last-inspection-per-hive']`, `['all-inspections']` er konsistente på tvers av alle kallsteder. `['harvests']` brukes uten hive-id, noe som betyr at invalidering av en enkelt kubes høstdata invaliderer alle — vurder `['harvests', hiveId]` på kubeprofil-queries.

### Komponentstørrelse

**[MEDIUM]** `app/(tabs)/kuber/[id]/index.tsx` — 548 linjer. Kombinerer kubeprofil-visning, varroa-graflogikk, SVG-rendering og alle sub-seksjonene. Over 800-linjersgrensen er ikke nådd, men 548 er nær grensen for enkelt ansvar. VarroaTrend SVG-grafen (linjer 29–90) kan med fordel flyttes til `components/hive/VarroaTrendChart.tsx`.

**[MEDIUM]** `app/(tabs)/kuber/[id]/inspeksjon/ny.tsx` — over 200+ linjer (eksakt antall ikke målt, men har 4-stegs wizard + varroa-kamera-flyt + draft-lagring + mutations). Flytt draft-logikk til en custom hook `useInspectionDraft(hiveId)` og varroa-kamera-flyten til `components/inspection/VarroaCamera.tsx`.

**[LAV]** `components/hive/QueenSection.tsx` — inneholder AddQueenModal som en nestet komponent (linjer 36–109) og QueenSection (115+). To logisk separate komponenter i én fil. Flytt AddQueenModal til egen fil for å holde filer < 400 linjer.

### Teknisk gjeld

**[POSITIV]** Grep over alle .ts/.tsx-filer finner null TODO/FIXME/HACK/XXX-kommentarer. Ingen halvferdige stub-implementasjoner ble funnet, med ett unntak:

**[HØY]** `services/subscription.ts:20–23,31–34,48–50,57–59` — iOS RevenueCat returnerer tom stub (`entitlements: { active: {} }`). Dette er dokumentert i CLAUDE.md ("iOS: ikke konfigurert ennå"), men er likevel en halvferdig implementasjon i produksjonskode. Konsekvens: iOS-brukere er alltid på starter-tier uavhengig av kjøp. Løsning: marker tydelig med `// iOS: TODO — konfigurer RevenueCat-nøkkel` og ideelt sett kast en spesifikk feil slik at platformen ikke stille returnerer feil tier.

**[LAV]** `services/inspection.ts:173` — `row.storage_path as string` er en type-assertion uten guard. Konsistent med øvrige services, men inspection_media-tabellen har ikke mapInspectionMedia()-funksjon — nullable felt håndteres ikke. Lav risiko siden storage_path er NOT NULL i schema.

## Topp-3 anbefalinger

1. **Synkroniser `diseaseObservations`-typen og legg `onError` på QueenSection-mutations** — To separate HØY/MEDIUM-funn som begge er enkle endringer: endre `types/index.ts:63` til `Record<string, boolean> | null`, og legg til `onError: (e: Error) => Alert.alert('Feil', e.message)` på `deleteQueen`- og `markReplaced`-mutasjonene i `components/hive/QueenSection.tsx:124–131`.

2. **Eliminer `as unknown as CustomerInfo`-dobbelcasting i subscription.ts** — Definer én konstant `const IOS_STUB: null = null` og endre alle iOS-return-paths til å returnere `null`, med tilsvarende endring av returtype til `Promise<CustomerInfo | null>`. Oppdater kallere til å håndtere null. Dette gjør at TypeScript vil advare ved fremtidige CustomerInfo-strukturendringer i RevenueCat-SDK.

3. **Trekk ut VarroaTrendChart og useInspectionDraft** — `kuber/[id]/index.tsx` (548 linjer) og `inspeksjon/ny.tsx` er de to filene nærmest brudd på 800-linjersregelen. Å flytte SVG-grafen til `components/hive/VarroaTrendChart.tsx` og draft-logikken til `hooks/useInspectionDraft.ts` reduserer begge filer under 400 linjer og forbedrer testbarhet vesentlig.
