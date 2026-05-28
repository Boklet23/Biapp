# BiVokter — Multi-Agent App Review v2

12 parallelle agenter + syntese. Kjør agentene simultant. Syntese kjøres ETTER alle er ferdige.

---

## UNIVERSELLE INSTRUKSJONER (gjelder alle agenter)

**Verktøy:** Bruk `Read` for filer, `Grep` for søk, `Glob` for å finne filer, `Bash` for enkle kommandoer.

**Pre-flight:** Hvis en fil ikke finnes, dokumenter det i rapporten og fortsett. Ikke anta at filen eksisterer.

**Sitering:** Alle funn skal referere til `filsti:linjenummer`. Ingen generiske påstander uten kodebevis.

**Lengde:** Maks 300 ord per seksjon, maks 2500 ord totalt per rapport.

**Output:** Skriv rapporten til `reports/agent-{nummer}-{navn}.md` i prosjektroten. Lag mappen hvis den mangler.

**Rapportmal (obligatorisk for alle agenter):**
```
# Agent {N} — {Navn}

## Metainfo
- Filer lest: [liste med faktiske filstier]
- Filer ikke funnet: [liste, eller "ingen"]
- Konfidensgrad: HØY / MEDIUM / LAV

## Sammendrag (maks 80 ord)
[Én-paragraf vurdering av det viktigste funnet]

## Funn
[Rangert liste: KRITISK → HØY → MEDIUM → LAV]
[Format: **[ALVORLIGHETSGRAD]** `fil:linje` — Problem — Konsekvens — Løsning]

## Topp-3 anbefalinger
1. [Konkret handling med estimert implementeringstid]
2. [...]
3. [...]
```

---

## KONTEKST (lim inn øverst i alle agenter)

```
BiVokter er en norsk birøkterapp.
Stack: React Native 0.83 · Expo SDK 55 (New Architecture) · expo-router v3 ·
Supabase (PostgreSQL + Storage + Edge Functions) · React Query · Zustand ·
Sentry · Mapbox · RevenueCat (Android IAP) · Skia + Reanimated · Zod

Abonnementer:
  Starter:       gratis, maks 3 kuber
  Hobbyist:      49 kr/mnd — AI varroa-analyse
  Profesjonell:  149 kr/mnd — statistikk, høstingsoversikt
  Lag:           499 kr/mnd — samarbeid, kubedeling

Prosjektrot: C:\Users\andre\claudecode\Prosjekter\Bier\biapp

Nøkkelfiler:
  app/(auth)/login.tsx                              — Innlogging (Google OAuth + e-post)
  app/(auth)/register.tsx                           — Registrering (Google OAuth + e-post)
  app/(app)/_layout.tsx                             — Auth-guard, oppstart, push-tillatelse
  app/(app)/(tabs)/hjem/index.tsx                   — Dashboard
  app/(app)/(tabs)/kuber/index.tsx                  — Kubeliste
  app/(app)/(tabs)/kuber/[id]/index.tsx             — Kubeprofil
  app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx     — Ny inspeksjon (4-stegs wizard)
  app/(app)/(tabs)/laer/index.tsx                   — Sykdomsguide
  app/(app)/(tabs)/kalender/index.tsx               — Kalender + sesongsjekkliste
  app/(app)/(tabs)/samfunn/index.tsx                — Birøkterlag, utstyr, svermekart
  components/inspection/Step1.tsx                   — Inspeksjonssteg 1 (dato/vær)
  components/inspection/Step2.tsx                   — Inspeksjonssteg 2 (rammer/dronning)
  components/inspection/Step3.tsx                   — Inspeksjonssteg 3 (varroa/AI-analyse)
  components/inspection/Step4.tsx                   — Inspeksjonssteg 4 (notater/bilder)
  components/inspection/StepIndicator.tsx           — Progress indicator for wizard
  components/inspection/FrameCounter.tsx            — Stepper-UI for rammer
  services/hive.ts · inspection.ts · subscription.ts · diseases.ts · googleAuth.ts
  constants/colors.ts                               — Design system (Colors, Shadows, Radii, SeasonColors)
  supabase/migrations/0001–0039                     — Komplett skjema (39 migrasjoner)
  supabase/functions/weekly-hive-alerts/            — pg_cron mandag 07:00
  supabase/functions/revenuecat-webhook/            — Syncer subscription_tier
  supabase/functions/delete-account/               — GDPR-sletting

IKKE les: revenuecat-key.json, google-play-service-account.json, graphify-out/, .claude/
```

---

## AGENT 1 — Navigasjonsarkitektur og informasjonsstruktur

**Scope:** Navigasjonsstruktur og skjermflyt ETTER innlogging. Onboarding/første kjøring dekkes av Agent 11.

**Output-fil:** `reports/agent-01-navigasjon.md`

**Les disse filene:**
- `app/(app)/_layout.tsx`
- `app/(app)/(tabs)/hjem/index.tsx`
- `app/(app)/(tabs)/kuber/index.tsx`
- `app/(app)/(tabs)/kuber/[id]/index.tsx`
- `app/(app)/(tabs)/laer/index.tsx`
- `app/(app)/(tabs)/samfunn/index.tsx`
- `app/(app)/(tabs)/kalender/index.tsx`

Bruk `Grep -r "router\." app/ --include="*.tsx"` for å kartlegge alle navigasjonskall.

**Evaluer:**

1. **Fanstruktur** — Er Hjem/Kuber/Kalender/Lær/Samfunn riktig prioritert for en birøkter? Er den viktigste handlingen (start inspeksjon) nåbar på ≤2 trykk?

2. **Navigasjonsdybde** — Hva er maksimal stakkdybde (antall skjermer dypt) i Kuber-fanen? Er det dead ends (ingen tilbakeknapp)?

3. **Oppdagbarhet** — Vil brukere finne AI-analyse, samarbeidsverktøy og statistikk uten hjelp? Er premium-funksjoner synlige fra riktig kontekst?

4. **Tomme tilstander** — Hva vises med 0 kuber? 0 inspeksjoner? Er det handlingsorienterte oppfordringer?

5. **Inspeksjonswizarden** — Er 4 steg rimelig? Er feltnavnene (Step1–4) forståelige for norske birøktere? Hva skjer med data ved avbrudd?

---

## AGENT 2 — Visuell design og komponentkonsistens

**Scope:** Designsystem-overholdelse og visuell polish. Tilgjengelighet (kontrast, a11y) dekkes av Agent 9.

**Output-fil:** `reports/agent-02-design.md`

**Les disse filene:**
- `constants/colors.ts`
- `components/hive/HiveCard.tsx`
- `components/ui/Button.tsx` (hvis den finnes — sjekk med Glob)
- `components/hive/WeightSection.tsx` (hvis den finnes)
- `components/hive/HealthScoreSection.tsx` (hvis den finnes)
- `app/(app)/(tabs)/hjem/index.tsx`
- `app/(app)/(tabs)/kuber/[id]/index.tsx`

Bruk `Grep -r "borderRadius\|padding\|margin\|fontSize\|color:" components/ --include="*.tsx"` for å finne hardkodede verdier.

**Evaluer:**

1. **Designsystem-brudd** — Hardkodede farger, radier, skygger og spacing-verdier i stedet for `Colors.*`, `Radii.*`, `Shadows.*`. List konkrete brudd med fil:linje.

2. **Typografiskala** — Er fontstørrelser og -vekter konsistente på tvers av komponenter?

3. **Komponentkvalitet** — Er HiveCard polert nok for en betalt app? Er datavisualisering (grafer, varroa-statistikk) lesbar og attraktiv?

4. **"Billig"-liste** — Konkrete elementer som ser uprofesjonelt ut (placeholder-tekst, manglende loading states, generiske ikoner).

5. **Premium-muligheter** — 5 spesifikke designgrep som ville løftet appen visuelt (mikro-animasjoner, onboarding-illustrasjoner, osv.).

---

## AGENT 3 — Konvertering og monetisering

**Scope:** Flyt fra gratis til betalt. Inkluderer gate-plassering, upgrade-modal og prisstrategi.

**Output-fil:** `reports/agent-03-konvertering.md`

**Les disse filene:**
- `services/subscription.ts`
- `hooks/useEffectiveTier.ts` (eller Glob `hooks/*.ts` for å finne riktig fil)
- `app/(app)/(tabs)/kuber/[id]/index.tsx` (tier-gates)
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (AI-analyse-gate i Step3)
- `app/(app)/(tabs)/hjem/index.tsx`
- Bruk `Glob components/ui/Upgrade*.tsx` for å finne upgrade-komponenter

**Evaluer:**

1. **Verdiforslag per tier** — Er verdien av 49/149/499 kr tydelig kommunisert i appen? Er det konkrete eksempler på hva AI-analyse eller statistikk gir?

2. **Gate-tidspunkt** — Møter brukeren paywall etter de har sett verdien, eller før? Finnes det premature gates som frustrerer?

3. **Under-/over-monetisering** — Funksjoner som burde vært gratis (lead magnets) men er betalt, og omvendt.

4. **Upgrade-modal** — Er den overbevisende? Viser den konkret hva man får? Finnes det prisforankring?

5. **Friksjon** — Antall trykk fra "vil oppgradere" til "betalt". Forklares abonnementet på norsk?

6. **Psykologiske mekanismer** — Er det social proof, urgency, aha-moment eller FOMO-elementer?

7. **Prisvurdering** — Er 49/149/499 kr riktig for norsk marked sammenlignet med europeiske birøkterappers prising?

---

## AGENT 4 — Birøkterfaglig domeneanalyse

**Scope:** Faglig korrekthet og dekning av norsk birøkt-domene. Evaluer mot Norsk Birøkterlags retningslinjer og praksis i norsk klima (sone 1–8).

**Output-fil:** `reports/agent-04-domene.md`

**Les disse filene:**
- `app/(app)/(tabs)/kuber/[id]/index.tsx`
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`
- `components/inspection/Step1.tsx`
- `components/inspection/Step2.tsx`
- `components/inspection/Step3.tsx`
- `components/inspection/Step4.tsx`
- `app/(app)/(tabs)/kalender/index.tsx`
- `app/(app)/(tabs)/laer/index.tsx`
- `services/inspection.ts`
- `services/treatment.ts`
- `services/queen.ts`
- `supabase/migrations/0006_treatments.sql`
- `supabase/migrations/0009_queens.sql`
- `supabase/migrations/0025_diseases.sql`

**Evaluer:**

1. **Inspeksjonsregistrering** — Mangler det viktige observasjoner (droneleg, bienes temperament, lukter, sykdomstegn)? Støttes kun Langstroth, eller også Warré og topbar-bistader? Er varroa-tellemetodene (alkoholspyling, pudderfall, sukkerrull) korrekt representert?

2. **Behandlingsprotokoll** — Er ApiLife Var, Apivar, oksalsyre (drypp/fordamping) og MAQS støttet? Er behandlingstiming koblet til brunstperioder? Finnes Mattilsynet-relevant dokumentasjon?

3. **Sesongkalender** — Dekker sjekklisten faktiske sesongoppgaver for norsk klima: vinterklargjøring (august–september), vinterdødelighetsregistrering (mars), vårrevisjon, svermetid (mai–juni), slynging, varroa-behandling etter honningsesongen?

4. **Dronninghåndtering** — Er rase, alder, opphav og avlslinje registrerbart? Støttes nukleusbokser og dronningavl?

5. **Faglig korrekthet** — Er terminologien norsk og korrekt (f.eks. "ramme" ikke "frame")? Er helsepoeng og anbefalinger faglig forsvarlige?

6. **Konkurransegap** — Hvilke 5 funksjoner gjør BeeKeepPal eller Beekeeper's Notebook som BiVokter ikke gjør? Hva er unikt norsk?

---

## AGENT 5 — Kodekvalitet og arkitektur

**Scope:** Strukturell kodekvalitet, mønstre og teknisk gjeld. Runtime-ytelse dekkes av Agent 6.

**Output-fil:** `reports/agent-05-arkitektur.md`

**Les disse filene:**
- `services/hive.ts`
- `services/inspection.ts`
- `services/subscription.ts`
- `types/index.ts`
- `lib/supabase.ts`
- Bruk `Glob hooks/*.ts` og les alle hook-filer

**Evaluer:**

1. **Service-lag konsistens** — Har alle services konsistent mønster for create/update/delete/fetch? Er mapX()-funksjoner korrekt implementert for nullable felt?

2. **TypeScript-strenghet** — Finn alle `any`-typer med `Grep -r ": any\|as any" services/ types/ --include="*.ts"`. Er interface-definisjonene synkronisert med Supabase-skjema?

3. **React Query-mønster** — Er queryKeys konsistente? Er staleTime og gcTime satt fornuftig? Er mutations alltid ledsaget av `onError: (e: Error) => showToast(...)`?

4. **Komponentstørrelse** — Bruk `Bash wc -l components/**/*.tsx` for å identifisere filer over 300 linjer (for mye ansvar).

5. **Teknisk gjeld** — Finn med `Grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.tsx" --include="*.ts"`. Er det halvferdige implementasjoner?

---

## AGENT 6 — Ytelse og React Native-optimalisering

**Scope:** Runtime-ytelse, rendering og nettverksoptimalisering.

**Output-fil:** `reports/agent-06-ytelse.md`

**Les disse filene:**
- `app/(app)/(tabs)/hjem/index.tsx`
- `app/(app)/(tabs)/kuber/index.tsx`
- `app/(app)/(tabs)/kuber/[id]/index.tsx`
- `services/inspection.ts` (fokus på `fetchLastInspectionPerHive`)
- `components/hive/HiveCard.tsx`
- `app/(app)/(tabs)/samfunn/index.tsx`

Bruk `Grep -r "React.memo\|useMemo\|useCallback" components/ --include="*.tsx"` for å se memoization-dekning.
Bruk `Grep -r "FlatList\|FlashList\|ScrollView" app/ --include="*.tsx"` for å se listestrategi.
Bruk `Grep -r "select\('\*'\|\.select\(\)" services/ --include="*.ts"` for å finne SELECT *.

**Evaluer:**

1. **N+1-problemer** — Er det én Supabase-query per kube i kubellisten? Er `fetchLastInspectionPerHive` riktig implementert som batch-kall?

2. **Lister** — Er kuberlisten virtualisert? Er HiveCard memoized?

3. **React Query-konfig** — Er staleTime fornuftig (f.eks. 1 time for foreninger, 5 min for inspeksjoner)?

4. **SELECT-selektivitet** — Identifiser alle `select('*')`-kall og vurder om de burde begrenses.

5. **Bilder** — Er inspeksjonsbilder og sykdomsbilder korrekt cachet? Er det progressiv loading?

6. **20+ kuber** — Vil appen skalere for en bruker med 20 kuber og 500 inspeksjoner?

---

## AGENT 7 — Robusthet og feilhåndtering

**Scope:** Alle scenarioer der appen kan feile, miste data eller gi dårlig opplevelse.

**Output-fil:** `reports/agent-07-robusthet.md`

**Les disse filene:**
- `app/(app)/_layout.tsx`
- `app/(app)/(tabs)/hjem/index.tsx`
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`
- `services/subscription.ts`
- `services/hive.ts`
- Bruk `Glob components/ui/Error*.tsx` for Error Boundary-komponenter

Bruk `Grep -r "catch\s*{}" --include="*.tsx" --include="*.ts"` for å finne svelgte feil.
Bruk `Grep -r "Promise.all\b" --include="*.tsx" --include="*.ts"` for å finne ikke-allSettled bruk.

**Evaluer:**

1. **Nettverksfeil** — Hva vises ved Supabase-feil? Er det retry-logikk? Kan brukeren se cachet data offline?

2. **Datamisting i wizard** — Hva skjer med inspeksjonsdata ved bakgrunnsdrap (Android) eller hard kill? Er det auto-save / draft?

3. **Edge cases i data** — Varroa-count som tom streng, NaN eller negativ. GPS-posisjon utilgjengelig. RevenueCat-sync som feiler ved oppstart.

4. **JWT-utløp** — Håndteres token refresh midt i en pågående handling? Hva skjer om brukeren er logget ut på annen enhet?

5. **Error Boundaries** — Dekker de kritiske skjermer (hjem, kubeprofil, inspeksjon)? Gir de brukeren en vei ut?

6. **mapX()-sikkerhet** — Finn alle mapX()-kall og sjekk om nullable felt er forsvarlig håndtert.

---

## AGENT 8 — Sikkerhet og GDPR

**Scope:** RLS-dekning, Edge Function-sikkerhet, input-validering og GDPR-overholdelse.

**Viktig kontekst:** Migrasjoner 0035–0039 inneholder nylige sikkerhetsfikser (secret rotation, inspection-media privat, swarm_reports auth-krav, ytelsesindekser, RLS subselect). Evaluer om disse er korrekt implementert i tillegg til resten.

**Output-fil:** `reports/agent-08-sikkerhet.md`

**Les disse filene:**
- `supabase/migrations/0001_initial_schema.sql`
- `supabase/migrations/0031_inspection_media_bucket.sql`
- `supabase/migrations/0034_tier_lock.sql`
- `supabase/migrations/0035_rotate_alerts_secret.sql`
- `supabase/migrations/0036_inspection_media_private.sql`
- `supabase/migrations/0037_swarm_reports_auth_required.sql`
- `supabase/migrations/0039_rls_subselect_auth_uid.sql`
- `supabase/functions/delete-account/index.ts`
- `supabase/functions/revenuecat-webhook/index.ts`
- `lib/supabase.ts`

Bruk `Grep -r "ENABLE ROW LEVEL SECURITY\|ROW LEVEL SECURITY" supabase/migrations/` for å finne tabeller med/uten RLS.
Bruk `Grep -r "auth\.uid()\|auth\.jwt()" supabase/migrations/` for å kartlegge policy-mønstre.

**Evaluer:**

1. **RLS-matrise** — Lag en tabell: tabellnavn × (SELECT / INSERT / UPDATE / DELETE): OK / MANGLER / FEIL

2. **0037-fix** — Er `swarm_reports` SELECT nå korrekt begrenset til innloggede brukere og egne rapporter?

3. **0036-fix** — Er `inspection-media`-bucket faktisk privat? Er SELECT-policy riktig owner-verifisert?

4. **delete-account** — Slettes ALL brukerdata? Sjekk at `inspection_media` Storage-filer, `hive_photos` og alle tabellrader er dekket.

5. **revenuecat-webhook** — Er det replay-beskyttelse? Er Authorization-header-validering korrekt?

6. **EXPO_PUBLIC_-lekkasje** — Er det hemmeligheter som er satt med `EXPO_PUBLIC_`-prefiks som ikke burde vært offentlige?

---

## AGENT 9 — Tilgjengelighet (WCAG 2.1 AA)

**Scope:** Tilgjengelighet for brukere med nedsatt funksjonsevne. Norsk lov krever WCAG 2.1 AA for digitale tjenester.

**Output-fil:** `reports/agent-09-tilgjengelighet.md`

**Les disse filene:**
- `constants/colors.ts` (beregn kontrastratio for alle fargekombinasjoner)
- `components/hive/HiveCard.tsx`
- `components/ui/Button.tsx` (Glob for å bekrefte filnavn)
- `app/(app)/(tabs)/hjem/index.tsx`
- `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`
- `components/inspection/Step4.tsx`
- `app/(app)/(tabs)/kalender/index.tsx`

Bruk `Grep -r "accessibilityLabel\|accessibilityRole\|accessibilityHint" --include="*.tsx"` for dekning.
Bruk `Grep -r "hitSlop" --include="*.tsx"` for berøringsstørrelser.

**Evaluer:**

1. **Kontrastratio** — Beregn manuelt: primærtekst vs bakgrunn, `Colors.honey` (#F5A623?) vs mørk bakgrunn, grå tekst vs mørk bakgrunn. Møter de WCAG AA (4.5:1 normal, 3:1 stor)?

2. **Skjermleser-dekning** — Hvilken andel av `Pressable`/`TouchableOpacity`-elementer mangler `accessibilityLabel`? Finn med Grep.

3. **Berøringsstørrelser** — Er stepper-knapper (FrameCounter), mood-emoji-knapper (Step4) og fotoknapper minst 44pt?

4. **Dynamisk tekst** — Brukes hardkodede `fontSize`-verdier uten `allowFontScaling`? Krasjer layout ved 200% skriftstørrelse?

5. **Informasjon kun via farge** — Er det steder der farge er eneste informasjonsbærer (f.eks. varroa-alvorlighetssystem)?

---

## AGENT 10 — Retention og brukerengasjement

**Scope:** Hva holder brukere aktive og hindrer frafall.

**Output-fil:** `reports/agent-10-retention.md`

**Les disse filene:**
- `app/(app)/(tabs)/hjem/index.tsx`
- `services/notifications.ts`
- `supabase/functions/weekly-hive-alerts/index.ts`
- `app/(app)/(tabs)/kalender/index.tsx`
- `app/(app)/(tabs)/kuber/[id]/index.tsx`
- Bruk `Glob components/home/*.tsx` og les alle

**Evaluer:**

1. **Push-varslingsdekning** — Hvilke hendelser trigger varsler? Er de handlingsorienterte? Er sesongbaserte varsler implementert (vårrevisjon, svermetid)?

2. **Daily driver** — Finnes det et daglig insentiv til å åpne appen? Er dashboardet dynamisk nok?

3. **Mellom-inspeksjons-verdi** — Hva gir appen verdi de 7–14 dagene mellom inspeksjoner? Er læringsinnhold, svermekart og kalender effektive retention-mekanismer?

4. **Progresjon og mestring** — Vises historisk fremgang (varroa-trend over sesong, honningutbytte år-for-år)? Er det milepæler?

5. **Churn-forebygging** — Er det re-engagement for inaktive brukere? Er det varsler som fanger opp birøktere som nærmer seg vinterperioden uten å ha gjort vinterklargjøring?

6. **Sosiale mekanismer** — Brukes lag-funksjonen (Lag-tier) aktivt nok til å skape retention gjennom sosiale bånd?

---

## AGENT 11 — Onboarding og første kjøring

**Scope:** Opplevelsen fra app-åpning til første verdimoment. Navigasjonsarkitektur ETTER onboarding dekkes av Agent 1.

**Output-fil:** `reports/agent-11-onboarding.md`

**Les disse filene:**
- `app/(auth)/register.tsx`
- `app/(auth)/login.tsx`
- `services/googleAuth.ts`
- `app/(app)/_layout.tsx`
- `app/(app)/(tabs)/hjem/index.tsx` (hva ser en NY bruker med 0 kuber?)
- `app/(app)/(tabs)/kuber/index.tsx` (tomt kubebibliotek)
- Bruk `Glob app/(app)/(tabs)/kuber/ny.tsx` og les hvis den finnes

**Evaluer:**

1. **Registreringsfriksjon** — Antall obligatoriske steg fra app-åpning til logget inn. Er Google OAuth tilgjengelig og fremtredende? Er e-postbekreftelse et blokkerende friksjonspunkt?

2. **Tom app** — Hva ser en ny bruker på Hjem med 0 kuber? Er det en velkomstmelding? En "Kom i gang"-guide? En CTA?

3. **Første kube** — Er "Opprett din første kube"-flyten intuitiv? Er birøkt-terminologi forklart for nybegynnere? Er eksempeldata/demo-modus tilgjengelig?

4. **Aha-moment** — Hva er BiVokters aha-moment (øyeblikket brukeren forstår verdien)? Er det designet inn i onboarding, eller skjer det tilfeldig? Beregn tid fra registrering til aha-moment.

5. **Onboarding-sjekkliste** — Er det en progressiv guide (Opprett kube → Gjør inspeksjon → Sett opp varsler) som leder brukeren til aktivering?

---

## AGENT 12 — Databasearkitektur og backend

**Scope:** Supabase-skjema, queries, Edge Functions og skalerbarhet.

**Output-fil:** `reports/agent-12-database.md`

**Les disse filene:**
- `supabase/migrations/0001_initial_schema.sql`
- `supabase/migrations/0012_latest_inspections_per_hive.sql` (RPC-funksjon)
- `supabase/migrations/0028_hive_map_rpc.sql`
- `supabase/migrations/0033_missing_indexes.sql`
- `supabase/migrations/0038_performance_indexes.sql`
- `supabase/migrations/0039_rls_subselect_auth_uid.sql`
- `services/inspection.ts`
- `services/hive.ts`
- `supabase/functions/weekly-hive-alerts/index.ts`
- `supabase/functions/revenuecat-webhook/index.ts`

Bruk `Grep -r "\.select\('\*'\)" services/ --include="*.ts"` for ubegrensede queries.
Bruk `Grep -r "Promise\.all\b" services/ --include="*.ts"` for parallelliseringsmuligheter.

**Evaluer:**

1. **Skjema-normalisering** — Mangler det foreign key-constraints? Er datoer timestamptz (ikke timestamp)? Mangler NOT NULL-constraints der de burde finnes?

2. **Indeksstrategi** — Er det indekser på `user_id`, `hive_id`, `inspected_at` og andre hyppige WHERE-felt? Beskriv hull med konkrete `CREATE INDEX`-setninger.

3. **RPC-kvalitet** — Er `get_latest_inspections_per_hive` optimal (DISTINCT ON er bra — er den indeksert riktig)? Er `get_hive_map_data` effektiv?

4. **Edge Function-robusthet** — Er `revenuecat-webhook` idempotent (to identiske webhooks gir ikke dobbel upgrade)? Er `weekly-hive-alerts` skalerbar til 10 000 brukere?

5. **SELECT *-problemer** — Identifiser alle queries som henter unødvendig mye data.

6. **Skaleringsrisiko** — Hvilke deler av skjemaet vil skalere dårlig? Estimert max brukere før ytelsesdegrasjon?

---

## SYNTESE-AGENT — Prioritert handlingsplan

**Kjør ETTER at alle 12 agenter har fullført og skrevet sine rapporter.**

**Les alle rapporter:**
```
reports/agent-01-navigasjon.md
reports/agent-02-design.md
reports/agent-03-konvertering.md
reports/agent-04-domene.md
reports/agent-05-arkitektur.md
reports/agent-06-ytelse.md
reports/agent-07-robusthet.md
reports/agent-08-sikkerhet.md
reports/agent-09-tilgjengelighet.md
reports/agent-10-retention.md
reports/agent-11-onboarding.md
reports/agent-12-database.md
```

**Kontekst:** BiVokter er i pre-lansering. Én til to utviklere. Mål: 100 betalende brukere.

**Output-fil:** `reports/syntese-handlingsplan.md`

**Syntese-oppgaver:**

1. **Konsensus-funn** — Funn som dukker opp hos 3+ agenter (høyeste reliabilitet).

2. **Motstridende anbefalinger** — Identifiser og løs konflikter mellom agenter.

3. **Topp-20 ROI-rangering** — Ranger de 20 viktigste endringene etter: Konverteringseffekt × (1 / Implementeringskostnad) × (1 + Sikkerhetsrisiko).

4. **Denne uken (< 4 timer)** — Rask-fixer som burde gjøres umiddelbart.

5. **Sprint 1 (2 uker)** — De 5 viktigste endringene for konvertering.

6. **Roadmap (3 måneder)** — Strategiske funksjoner og arkitekturarbeid.

7. **Ikke-prioriter nå** — For å unngå prematur optimalisering.

8. **Appens nåværende tilstand** — Én setning: er den klar til å nå 100 betalende brukere?

---

*Versjon: v2 | Oppdatert: 2026-05-27 | Migrasjoner: 0001–0039 | versionCode: 14*
