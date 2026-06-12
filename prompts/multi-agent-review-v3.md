# BiVokter — Multi-Agent App Review v3

13 parallelle agenter + syntese. Kjør agentene simultant (general-purpose agenter via Agent-verktøyet, parallelt). Syntese kjøres ETTER at alle 13 er ferdige.

---

## KJØREINSTRUKS (gjøres av orkestratoren FØR agentene startes)

1. **Arkiver forrige review:** Flytt alle eksisterende `reports/agent-*.md` og `reports/syntese-*.md` til `reports/archive/2026-06-10/` (eller faktisk dato fra filene). Agentene skal kunne lese arkivet for å diffe, men aldri overskrive det.
2. Start alle 13 agenter parallelt. Hver agent får: universelle instruksjoner + kontekstblokk + sin egen agentseksjon.
3. Når alle 13 rapporter finnes i `reports/`, start syntese-agenten.

---

## UNIVERSELLE INSTRUKSJONER (gjelder alle agenter)

**Verktøy:** `Read` for filer, `Grep` for innholdssøk, `Glob` for å finne filer, `Bash` kun for enkle ting Grep/Glob ikke dekker (f.eks. linjetelling). Grep-verktøyet tar parametre — eksempel: `pattern: "router\\."`, `path: "app"`, `glob: "*.tsx"`, `output_mode: "content"`. IKKE bruk shell-syntaks som `grep -r --include`.

**Read-only:** Du skal IKKE endre, opprette eller slette kode. Eneste fil du skriver er din egen rapport.

**Pre-flight:** Hvis en fil ikke finnes, bruk Glob for å finne riktig sti før du gir opp. Dokumenter avvik i rapporten og fortsett.

**Diff mot forrige review:** Les din tilsvarende rapport i `reports/archive/` hvis den finnes. Sprint 1 (10. juni) fikset bl.a.: pre-auth onboarding, e-postverifisering-UX, samlede varroa-terskler i `constants/varroa.ts`, ProGate/rutegating for sammenligning, webhook-idempotens (migrasjon 0041), design-token-migrering i kart/vekt/helse-komponenter. IKKE gjenta funn som er fikset — verifiser i koden. Hvis et tidligere fikset problem har gjenoppstått, merk funnet **[REGRESJON]**.

**Sitering:** Hvert funn skal referere `filsti:linjenummer` OG sitere de relevante kodelinjene (maks 3 linjer). Ingen påstander uten kodebevis. Faglige/markedsmessige påstander (Agent 3, 4, 10) skal ha kildehenvisning ved websøk.

**Alvorlighetsrubrikk (felles for alle):**
- **KRITISK** — datatap, sikkerhetshull, GDPR-brudd, krasj i hovedflyt, eller noe som direkte hindrer betalende brukere
- **HØY** — ødelegger konvertering/retention målbart, faglig feil som kan skade bier, eller stor friksjon i kjerneflyt
- **MEDIUM** — kvalitetsbrist som merkes av brukere, teknisk gjeld med konkret risiko
- **LAV** — polish, konsistens, nice-to-have

**Innsats-skala (per funn):** S = < 1 t · M = 1–4 t · L = 1–3 dager · XL = > 3 dager

**Lengde:** Maks 300 ord per seksjon, maks 2500 ord totalt.

**Output:** Skriv rapporten til `reports/agent-{nummer}-{navn}.md`. Lag mappen hvis den mangler.

**Rapportmal (obligatorisk):**
```
# Agent {N} — {Navn}

## Metainfo
- Filer lest: [faktiske filstier]
- Filer ikke funnet: [liste, eller "ingen"]
- Diff mot forrige review: [lest arkiv: ja/nei — hva er fikset siden sist]

## Sammendrag (maks 80 ord)
[Én-paragraf vurdering av det viktigste funnet]

## Fungerer godt (maks 5 punkter)
[Det som IKKE skal røres — hindrer at syntesen anbefaler å rive ned noe bra]

## Funn
[Rangert: KRITISK → HØY → MEDIUM → LAV]
[Format per funn:
**[GRAD]** `fil:linje` — Problem (med kodesitat) — Konsekvens — Løsning — Innsats: S/M/L/XL — Konfidens: HØY/MEDIUM/LAV]

## Topp-3 anbefalinger
1. [Konkret handling + innsats + forventet effekt]
2. [...]
3. [...]
```

---

## KONTEKST (lim inn øverst i alle agenter)

```
BiVokter er en norsk birøkterapp i pre-lansering (intern testing i Play Console, versionCode ~19).
Stack: React Native 0.83 · Expo SDK 55 (New Architecture) · expo-router v3 ·
Supabase (PostgreSQL + Storage + Edge Functions, eu-west-1) · React Query · Zustand (kun auth) ·
Sentry · Mapbox · RevenueCat (Android IAP) · Skia + Reanimated · Zod

Abonnementer:
  Starter:       gratis, maks 3 kuber
  Hobbyist:      49 kr/mnd — AI varroa-analyse
  Profesjonell:  149 kr/mnd — statistikk, høstingsoversikt, kube-/sesongsammenligning
  Lag:           499 kr/mnd — samarbeid, kubedeling
  (+ prøveperiode finnes: se migrasjon 0017_trial_period og 0034_tier_lock)

Prosjektrot: C:\Users\andre\claudecode\Prosjekter\Bier\biapp

Faner (5 synlige + 1 skjult):
  hjem · kuber (Stack) · kalender · laer (vises som "Info") · samfunn
  feed er registrert men skjult (href: null i app/(app)/(tabs)/_layout.tsx)

Nøkkelfiler (verifisert 2026-06-12):
  app/(auth)/welcome.tsx · onboarding.tsx · index.tsx     — Pre-auth onboarding (NY siden v2)
  app/(auth)/login.tsx · register.tsx                     — Innlogging/registrering (Google OAuth + e-post)
  app/(app)/_layout.tsx                                   — Auth-guard, oppstart, push-tillatelse
  app/(app)/profil.tsx                                    — Profil/innstillinger
  app/(app)/(tabs)/_layout.tsx                            — Fanedefinisjon
  app/(app)/(tabs)/hjem/index.tsx                         — Dashboard
  app/(app)/(tabs)/kuber/index.tsx · ny.tsx               — Kubeliste + opprett kube
  app/(app)/(tabs)/kuber/[id]/index.tsx · rediger.tsx     — Kubeprofil + rediger
  app/(app)/(tabs)/kuber/[id]/samarbeid.tsx               — Kubedeling (Lag-tier)
  app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx           — Ny inspeksjon (4-stegs wizard)
  app/(app)/(tabs)/kuber/[id]/inspeksjon/[inspId].tsx     — Inspeksjonsdetalj
  app/(app)/(tabs)/kuber/sammenlign.tsx                   — Kubesammenligning (ProGate)
  app/(app)/(tabs)/kuber/sesongsammenligning.tsx          — Sesongsammenligning (ProGate)
  app/(app)/(tabs)/laer/index.tsx · [slug].tsx · guide/[slug].tsx — Sykdomsguide + nybegynnerguide
  app/(app)/(tabs)/kalender/index.tsx                     — Kalender + sesongsjekkliste
  app/(app)/(tabs)/samfunn/index.tsx                      — Birøkterlag, utstyr, svermekart
  components/inspection/Step1–4.tsx · StepIndicator.tsx · FrameCounter.tsx
  components/ui/Button.tsx · UpgradeModal.tsx · ProGate.tsx · ErrorBoundary.tsx · Toast.tsx
  components/hive/HiveCard.tsx · WeightSection.tsx · HealthScoreSection.tsx · HiveMap.tsx · HivesMapView.tsx
  components/home/ActivationGuide.tsx · HiveStatusCard.tsx · WeatherCard.tsx · SeasonSummaryCard.tsx
  hooks/useEffectiveTier.ts                               — Eneste hook-fil
  services/ (19 filer): hive · inspection · subscription · diseases · googleAuth · weather ·
    notifications · treatment · queen · harvest · weight · swarmReport · calendarEvent ·
    profile · report · collaboration · feed · associations · location
  constants/colors.ts · typography.ts · varroa.ts · ui.ts — Designsystem + samlede varroa-terskler
  constants/seasonChecklist.ts · seasonReminders.ts · seasonGuide.ts · pollenCalendar.ts ·
    beginnerGuide.ts · diseases.ts                        — Faglig innhold
  supabase/migrations/0001–0045                           — 45 migrasjoner (0040–0045 er nyest:
    swarm delete-policy, revenuecat_processed_events (idempotens), hive_photos privat,
    ai_usage no-delete, feed_likes delete-fix, ai_usage insert-policy)
  supabase/functions/analyze-varroa/                      — AI varroa-analyse (Hobbyist+)
  supabase/functions/weekly-hive-alerts/                  — pg_cron mandag 07:00
  supabase/functions/revenuecat-webhook/                  — Syncer subscription_tier (idempotent via 0041)
  supabase/functions/delete-account/                      — GDPR-sletting

IKKE les: revenuecat-key.json, google-play-service-account.json, graphify-out/, .claude/,
node_modules/, reports/ (unntatt reports/archive/ for diff)
```

---

## AGENT 1 — Navigasjonsarkitektur og informasjonsstruktur

**Scope:** Navigasjonsstruktur og skjermflyt ETTER innlogging. Onboarding/første kjøring dekkes av Agent 11. Visuell utforming dekkes av Agent 2.

**Output-fil:** `reports/agent-01-navigasjon.md`

**Les:** `app/(app)/(tabs)/_layout.tsx`, `app/(app)/_layout.tsx`, `hjem/index.tsx`, `kuber/index.tsx`, `kuber/[id]/index.tsx`, `kuber/sammenlign.tsx`, `laer/index.tsx`, `samfunn/index.tsx`, `kalender/index.tsx`, `app/(app)/profil.tsx`

Kartlegg alle navigasjonskall: Grep `pattern: "router\\.(push|replace|back|navigate)"`, `path: "app"`, `glob: "*.tsx"`, `output_mode: "content"`. Gjør samme søk i `components/`.

**Evaluer:**

1. **Fanestruktur** — Er Hjem/Kuber/Kalender/Info/Samfunn riktig prioritert for en birøkter i sesong (juni = sverming/trekk)? Er den viktigste handlingen (start inspeksjon) nåbar på ≤2 trykk fra app-åpning? Tell trykkene konkret.

2. **Navigasjonsdybde og dead ends** — Maksimal stakkdybde i Kuber-fanen? Finnes skjermer uten tilbakevei? Hvordan oppfører Android hardware-back seg i wizard og på fane-rotskjermer? Bevares scroll-/stack-tilstand ved fanebytte?

3. **Oppdagbarhet** — Vil brukere finne AI-analyse, kube-/sesongsammenligning, samarbeid (`[id]/samarbeid.tsx`) og profil uten hjelp? Hvor mange innganger har hver premium-funksjon? Er den skjulte feed-fanen nåbar via navigasjonskall som vil feile?

4. **Deep links** — Hvor lander push-varsler (weekly-hive-alerts)? Håndteres deep link til kube/inspeksjon når appen er kald-startet?

5. **Tomme tilstander** — Hva vises med 0 kuber, 0 inspeksjoner, 0 kalenderhendelser? Er det handlingsorienterte CTA-er eller bare tom flate?

6. **Inspeksjonswizarden** — Er 4 steg riktig oppdeling? Kan man hoppe mellom steg / gå tilbake uten å miste data? Hva skjer ved avbrudd (back, fanebytte)? (Datapersistens ved prosessdrap dekkes av Agent 7 — her vurderes kun flyten.)

---

## AGENT 2 — Visuell design og komponentkonsistens

**Scope:** Designsystem-overholdelse og visuell polish. Kontrast/a11y dekkes av Agent 9.

**Output-fil:** `reports/agent-02-design.md`

**Les:** `constants/colors.ts`, `constants/typography.ts`, `constants/ui.ts`, `components/hive/HiveCard.tsx`, `components/ui/Button.tsx`, `components/ui/UpgradeModal.tsx`, `components/hive/WeightSection.tsx`, `components/hive/HealthScoreSection.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `app/(app)/(tabs)/_layout.tsx`

Finn hardkodede verdier: Grep `pattern: "(#[0-9a-fA-F]{3,8}|borderRadius:\\s*\\d|fontSize:\\s*\\d)"`, `path: "components"`, `glob: "*.tsx"`, `output_mode: "content"`. Gjenta for `app/`. Merk: design-token-migrering ble gjort i Sprint 1 for kart/vekt/helse — verifiser at den er komplett og finn det som gjenstår.

**Evaluer:**

1. **Designsystem-brudd** — Hardkodede farger/radier/skygger/fontstørrelser i stedet for `Colors.*`, `Radii.*`, `Shadows.*`, `Typography.*`. List konkrete brudd med fil:linje, gruppert per komponent. Estimer dekning i prosent (token-bruk vs hardkodet).

2. **Typografiskala** — Brukes `constants/typography.ts` konsekvent? Hvor mange unike fontSize-verdier finnes totalt (bør være ≤ 8)?

3. **Faneikoner** — Tab-baren bruker emoji (🏠🐝📅📖🌍) som ikoner. Er det godt nok for en betalt app, eller bør det byttes til et ikonsett? Vurder mot konkurrenter.

4. **Tilstands-konsistens** — Har loading/empty/error-tilstander samme visuelle språk på tvers av skjermer (LoadingCard, skeletons, spinners)? List skjermer som mangler loading state.

5. **"Billig"-liste** — Konkrete elementer som ser uprofesjonelle ut (placeholder-tekst, brå overganger, inkonsistent spacing, generiske ikoner).

6. **Premium-muligheter** — 5 spesifikke designgrep som ville løftet appen visuelt, rangert etter innsats/effekt (mikro-animasjoner med Reanimated, illustrasjoner, haptikk, osv.).

---

## AGENT 3 — Konvertering og monetisering

**Scope:** Flyt fra gratis til betalt: gate-plassering, upgrade-modal, prøveperiode, prisstrategi.

**Output-fil:** `reports/agent-03-konvertering.md`

**Les:** `services/subscription.ts`, `hooks/useEffectiveTier.ts`, `components/ui/UpgradeModal.tsx`, `components/ui/ProGate.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` + `components/inspection/Step3.tsx` (AI-gate), `app/(app)/(tabs)/kuber/sammenlign.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `supabase/migrations/0017_trial_period.sql`, `supabase/migrations/0034_tier_lock.sql`

Kartlegg alle gates: Grep `pattern: "useEffectiveTier|UpgradeModal|ProGate|tier"`, `path: "app"`, `glob: "*.tsx"`, `output_mode: "files_with_matches"`.

Du HAR lov til å bruke WebSearch for punkt 7 (konkurrentpriser).

**Evaluer:**

1. **Verdiforslag per tier** — Er verdien av 49/149/499 kr kommunisert med konkrete eksempler i appen (hva AI-analysen faktisk gir, hva statistikken viser)? Siter teksten i UpgradeModal og vurder den som salgstekst.

2. **Gate-tidspunkt** — Møter brukeren paywall etter å ha sett verdien (f.eks. blurret forhåndsvisning av statistikk) eller før (kald vegg)? Gå gjennom hver gate enkeltvis.

3. **Prøveperiode** — Hvordan fungerer trial (0017)? Eksponeres den i UI? Hva skjer når den utløper — graceful nedgradering eller datatap-følelse (kuber over Starter-grensen)?

4. **Kjøpsflyt-friksjon** — Antall trykk fra "vil oppgradere" til RevenueCat-kjøpsdialog. Finnes "Gjenopprett kjøp"? Hva skjer ved kjøpsfeil eller avbrutt kjøp — får brukeren beskjed?

5. **Under-/over-monetisering** — Funksjoner som burde vært gratis lead magnets (f.eks. én gratis AI-analyse som aha-moment?) og omvendt. Er 3 kuber riktig gratis-grense for norske hobbyister (median 2–5 kuber)?

6. **Psykologiske mekanismer** — Prisforankring (499 får 149 til å se billig ut?), social proof, sesong-urgency ("svermetid nå — få varsler"), tap-aversjon. Hva finnes, hva mangler?

7. **Prisvurdering** — Sammenlign 49/149/499 kr med faktisk prising hos BeeKeepPal, Apiary Book, HiveTracks o.l. (websøk, oppgi kilder). Er Hobbyist→Profesjonell-gapet (3×) riktig?

---

## AGENT 4 — Birøkterfaglig domeneanalyse

**Scope:** Faglig korrekthet og dekning av norsk birøkt. Evaluer mot Norsk Birøkterlags praksis, Mattilsynets regelverk og norsk klima (sone 1–8).

**Output-fil:** `reports/agent-04-domene.md`

**Les:** `app/(app)/(tabs)/kuber/[id]/index.tsx`, `components/inspection/Step1–4.tsx`, `app/(app)/(tabs)/kalender/index.tsx`, `constants/seasonChecklist.ts`, `constants/seasonReminders.ts`, `constants/seasonGuide.ts`, `constants/pollenCalendar.ts`, `constants/varroa.ts`, `constants/diseases.ts`, `constants/beginnerGuide.ts`, `services/inspection.ts`, `services/treatment.ts`, `services/queen.ts`, `supabase/migrations/0006_treatments.sql`, `supabase/migrations/0009_queens.sql`, `supabase/migrations/0025_diseases.sql`

Du HAR lov til å bruke WebSearch for punkt 6 (konkurransegap) og for å verifisere faglige påstander (Norsk Birøkterlag, Mattilsynet). Oppgi kilder.

**Evaluer:**

1. **Inspeksjonsregistrering** — Mangler viktige observasjoner (droneyngel, temperament, lukt, yngelmønster, sykdomstegn)? Støttes kun Langstroth/Norsk standard, eller også andre kassetyper? Er varroa-tellemetodene (nedfallsprøve, alkoholvask, sukkerrull) korrekt representert, og er tersklene i `constants/varroa.ts` faglig riktige for norsk praksis (typisk: behandling ved >1–3 % infestasjon avhengig av sesong)?

2. **Behandlingsprotokoll** — Er oksalsyre (drypp desember + fordamping), maursyre, Apivar og ApiLife Var støttet? Er behandlingstiming koblet til yngelfrie perioder (ikke "brunstperioder" — det er feil begrep)? Finnes dokumentasjon Mattilsynet kan kreve (behandlingsjournal)?

3. **Sesongkalender** — Dekker sjekklisten norsk årssyklus: vårrevisjon (april), svermekontroll (mai–juni), sommertrekk + slynging (juli), lyngtrekk (august, unikt norsk!), innvintring/fôring (august–september), oksalsyrebehandling (november–desember), vinterdødelighet-registrering (mars)? Stemmer pollenCalendar med norske trekkplanter (selje, løvetann, bringebær, kløver, lyng)?

4. **Sykdommer og meldeplikt** — Dekker sykdomsguiden meldepliktige sykdommer korrekt (åpen yngelråte, lukket yngelråte, liten kubebille)? Sier appen tydelig at funn SKAL meldes Mattilsynet? Er bilder og symptombeskrivelser faglig riktige?

5. **Dronning og terminologi** — Er rase (krainer, buckfast, nordisk brun), alder, merking (årsfarger) registrerbart? Er all terminologi korrekt norsk birøkterspråk ("ramme", "yngelleie", "trekk", "innvintring" — ikke anglisismer)? List konkrete språkfeil med fil:linje.

6. **Konkurransegap og norsk fortrinn** — 5 funksjoner BeeKeepPal/Apiary Book har som BiVokter mangler, og 3 ting som er/kan bli unikt norske (Yr-integrasjon, lyngtrekk-varsel, Mattilsynet-journal, norske birøkterlag).

---

## AGENT 5 — Kodekvalitet og arkitektur

**Scope:** Strukturell kodekvalitet, mønstre, teknisk gjeld. Runtime-ytelse dekkes av Agent 6.

**Output-fil:** `reports/agent-05-arkitektur.md`

**Les:** `services/hive.ts`, `services/inspection.ts`, `services/subscription.ts`, `services/feed.ts`, `services/collaboration.ts`, `types/index.ts`, `lib/supabase.ts`, `hooks/useEffectiveTier.ts`

Søk: Grep `pattern: ":\\s*any\\b|as any"`, `path: "services"`, `glob: "*.ts"`, `output_mode: "content"` (gjenta for `types/`, `hooks/`, `components/`). Grep `pattern: "TODO|FIXME|HACK|XXX"`, `glob: "*.{ts,tsx}"`, `output_mode: "content"`. Linjetelling: Bash `Get-ChildItem -Recurse -Include *.tsx components, app | ForEach-Object { "$($_.FullName): $((Get-Content $_ | Measure-Object -Line).Lines)" }` eller tilsvarende.

**Evaluer:**

1. **Service-lag konsistens** — Har alle 19 services samme mønster for fetch/create/update/delete og mapX()? Er mapX() trygge for nullable felt (mønsteret `typeof row.x === 'string' ? row.x : null`)? List avvikere.

2. **TypeScript-strenghet** — Alle `any`-forekomster med fil:linje (skill legitime Expo Router-`as any` fra reelle hull). Er `types/index.ts` synkronisert med Supabase-skjemaet etter migrasjon 0040–0045?

3. **React Query-mønster** — Er queryKeys konsistente og kollisjonsfrie? staleTime/gcTime fornuftig per datatype? Har alle mutations `onError` med toast? Brukes invalidering vs setQueryData konsekvent?

4. **Død/sovende kode** — `feed`-fanen er skjult og `collaboration` har delvis UI (`samarbeid.tsx`). Er disse kodeveiene vedlikeholdt eller råtnende? Finnes ubrukte komponenter/services (Grep etter importer)?

5. **Filstørrelse og ansvar** — Filer over 400 linjer (spesielt skjermfiler som `kuber/[id]/index.tsx`). Hvilke bør splittes, og i hva?

6. **Teknisk gjeld** — TODO/FIXME/HACK-funn, halvferdige implementasjoner, duplisert logikk på tvers av komponenter (f.eks. varroa-visning, datoformatering).

---

## AGENT 6 — Ytelse og React Native-optimalisering

**Scope:** Runtime-ytelse, rendering, nettverk, bilder.

**Output-fil:** `reports/agent-06-ytelse.md`

**Les:** `app/(app)/(tabs)/hjem/index.tsx`, `kuber/index.tsx`, `kuber/[id]/index.tsx`, `services/inspection.ts` (fokus `fetchLastInspectionPerHive`), `components/hive/HiveCard.tsx`, `components/hive/HivesMapView.tsx`, `app/(app)/(tabs)/samfunn/index.tsx`

Søk: Grep `pattern: "React\\.memo|useMemo|useCallback"`, `path: "components"`, `glob: "*.tsx"` (dekning). Grep `pattern: "FlatList|FlashList|ScrollView"`, `path: "app"`, `glob: "*.tsx"`, `output_mode: "content"` (listestrategi). Grep `pattern: "select\\('\\*'\\)|\\.select\\(\\)"`, `path: "services"`, `glob: "*.ts"`, `output_mode: "content"` (SELECT *). Grep `pattern: "Image|expo-image"`, `path: "components"`, `glob: "*.tsx"` (bildestrategi).

**Evaluer:**

1. **N+1 og batching** — Én Supabase-query per kube i kubelisten, eller batch? Er `fetchLastInspectionPerHive` (RPC) brukt overalt der den bør? Kjøres uavhengige queries parallelt (`Promise.all`) på dashboard?

2. **Lister** — Er kubelisten og inspeksjonshistorikk virtualisert (FlatList/FlashList) eller ScrollView+map? Er HiveCard memoized med stabile props?

3. **React Query-konfig** — staleTime per datatype: foreninger/utstyr (statisk, timer), vær (1 t TTL), inspeksjoner (minutter). Refetch-storm ved fanebytte?

4. **SELECT-selektivitet** — Alle `select('*')` med vurdering: hvilke kolonner trengs faktisk, og hvor stor er raden (spesielt inspections med AI-felter)?

5. **Bilder** — Brukes expo-image med caching for kubefoto/sykdomsbilder? Resizes bilder før opplasting (inspeksjonsfoto til analyze-varroa)? Hvor stor er en typisk opplasting?

6. **Skalering 20+ kuber** — Konkret: hvilke skjermer degraderer først med 20 kuber × 25 inspeksjoner? Hva er anslått payload på dashboard i dag?

7. **Skia/Reanimated** — Kjører animasjoner (HiveScene, BeeParticles, grafer) på UI-tråden (SharedValue), eller finnes setState/rAF-drevne animasjoner (kjent antimønster i prosjektet)?

---

## AGENT 7 — Robusthet og feilhåndtering

**Scope:** Alle scenarioer der appen kan feile, miste data eller etterlate inkonsistent tilstand.

**Output-fil:** `reports/agent-07-robusthet.md`

**Les:** `app/(app)/_layout.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `components/inspection/Step3.tsx`, `services/subscription.ts`, `services/hive.ts`, `components/ui/ErrorBoundary.tsx`, `components/ui/Toast.tsx`, `lib/supabase.ts`

Søk: Grep `pattern: "catch\\s*(\\(\\w*\\))?\\s*\\{\\s*\\}"`, `glob: "*.{ts,tsx}"`, `output_mode: "content"` (svelgte feil). Grep `pattern: "Promise\\.all\\b"`, `glob: "*.{ts,tsx}"`, `output_mode: "content"` (vs allSettled). Grep `pattern: "ErrorBoundary"`, `path: "app"`, `glob: "*.tsx"` (dekning).

**Evaluer:**

1. **Nettverksfeil** — Hva ser brukeren ved Supabase-timeout på dashboard/kubeliste? Retry-logikk? Vises cachet React Query-data offline, eller blank skjerm? Finnes offline-indikator?

2. **Datamisting i wizard** — Hva skjer med 20 minutters inspeksjonsdata ved Android-bakgrunnsdrap eller krasj? Finnes draft/auto-save (AsyncStorage)? Hvis nei: dette er sannsynligvis appens største datataps-risiko — vurder alvorlighet deretter.

3. **AI-analyse-feilstier** — Hva skjer når analyze-varroa feiler (timeout, kvote brukt opp, uleselig bilde)? Mister brukeren bildet? Får de beskjed på norsk? Kan de prøve igjen uten å miste wizard-data?

4. **Edge cases i input** — Varroa-count som tom streng/NaN/negativ. Vekt med komma vs punktum (norsk tastatur!). GPS utilgjengelig ved kubeoppretting. RevenueCat-init-feil ved oppstart (Expo Go-guard).

5. **Auth-livssyklus** — JWT-refresh midt i mutation? Utlogging på annen enhet? Hva skjer med en pågående wizard hvis sesjonen dør?

6. **Error Boundaries og svelgte feil** — Dekker ErrorBoundary alle kritiske skjermer, og gir den en vei ut (ikke bare "noe gikk galt")? List alle tomme catch-blokker og `Promise.all` som burde vært `allSettled`.

---

## AGENT 8 — Sikkerhet og GDPR

**Scope:** RLS-dekning, Edge Function-sikkerhet, input-validering, GDPR.

**Viktig kontekst:** 0035–0039 var forrige rundes sikkerhetsfikser. NYTT siden sist: 0040 (swarm_reports delete-policy), 0041 (revenuecat_processed_events — webhook-idempotens), 0042 (hive_photos privat), 0043 (ai_usage no-delete), 0044 (feed_likes delete-fix), 0045 (ai_usage insert-policy). Verifiser at disse er korrekt implementert, og let etter det NESTE hullet — ikke bare bekreft fiksene.

**Output-fil:** `reports/agent-08-sikkerhet.md`

**Les:** `supabase/migrations/0001_initial_schema.sql`, `0031`, `0034`, `0036`, `0037`, `0039`, `0040`, `0041`, `0042`, `0043`, `0044`, `0045`, `supabase/functions/delete-account/index.ts`, `supabase/functions/revenuecat-webhook/index.ts`, `supabase/functions/analyze-varroa/index.ts`, `lib/supabase.ts`

Søk: Grep `pattern: "ENABLE ROW LEVEL SECURITY"`, `path: "supabase/migrations"` og Grep `pattern: "CREATE TABLE"`, `path: "supabase/migrations"`, `output_mode: "content"` — kryss av hvilke tabeller som mangler RLS. Grep `pattern: "EXPO_PUBLIC_"`, `glob: "*.{ts,tsx,json}"`, `output_mode: "content"`. Grep `pattern: "service_role|SERVICE_ROLE"`, `glob: "*.{ts,tsx}"`.

**Evaluer:**

1. **RLS-matrise** — Tabell: tabellnavn × SELECT/INSERT/UPDATE/DELETE → OK / MANGLER / FEIL. Inkluder ALLE tabeller fra 0001–0045 (også feed_*, ai_usage, revenuecat_processed_events, bee_associations, equipment_vendors). Husk: manglende DELETE-policy med RLS på = ingen kan slette (kan være feil begge veier).

2. **analyze-varroa (NY)** — Krever den gyldig JWT? Verifiserer den tier server-side (Hobbyist+), eller stoler den på klienten? Er det rate limiting / kvote (ai_usage) som hindrer kostnadsmisbruk av AI-API-et? Kan en bruker analysere en annens bilde?

3. **revenuecat-webhook** — Er idempotensen (0041) korrekt: sjekkes event-ID FØR prosessering, atomisk? Authorization-header validert med konstant-tid-sammenligning? Hva skjer med ukjente event-typer?

4. **delete-account** — Slettes ALT: alle tabellrader (inkl. feed, ai_usage, collaborators der brukeren er medlem), Storage-filer i inspection-media OG hive-photos? List tabeller som IKKE dekkes. Er funksjonen beskyttet mot at bruker A sletter bruker B?

5. **Storage-policies** — Er inspection-media (0036) og hive-photos (0042) reelt private med owner-verifisert SELECT? Genereres signed URLs med fornuftig levetid?

6. **GDPR utover sletting** — Finnes dataeksport (portabilitet, art. 20)? Personvernerklæring lenket i appen? Samtykke for posisjonsdata (svermekart viser posisjoner til andre)? Sendes persondata til AI-tjenesten i analyze-varroa, og opplyses det om dette?

---

## AGENT 9 — Tilgjengelighet (WCAG 2.1 AA)

**Scope:** Tilgjengelighet. Norsk lov (likestillings- og diskrimineringsloven + UU-direktivet) krever WCAG 2.1 AA.

**Output-fil:** `reports/agent-09-tilgjengelighet.md`

**Les:** `constants/colors.ts`, `constants/typography.ts`, `components/hive/HiveCard.tsx`, `components/ui/Button.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `components/inspection/Step4.tsx`, `components/inspection/FrameCounter.tsx`, `app/(app)/(tabs)/_layout.tsx`, `components/hive/HealthScoreSection.tsx`

Søk: Grep `pattern: "accessibilityLabel|accessibilityRole|accessibilityHint"`, `glob: "*.tsx"`, `output_mode: "count"` vs Grep `pattern: "Pressable|TouchableOpacity"`, `glob: "*.tsx"`, `output_mode: "count"` — beregn dekningsgrad. Grep `pattern: "hitSlop"`, `glob: "*.tsx"`. Grep `pattern: "allowFontScaling"`, `glob: "*.tsx"`.

**Evaluer:**

1. **Kontrastratio** — Beregn faktisk (WCAG-formel) for: primærtekst/bakgrunn, `Colors.honey` mot mørk bakgrunn, sekundær grå tekst, inaktiv fanetekst (`rgba(255,255,255,0.40)` i _layout — sannsynlig brudd). Tabell: kombinasjon → ratio → AA-krav → bestått/ikke.

2. **Skjermleser** — Dekningsgrad accessibilityLabel på trykkbare elementer (tall fra Grep). Emoji som faneikoner og i UI: TalkBack leser emoji-navn ("honeybee") — er det meningsfullt? Annonseres Toast-meldinger?

3. **Berøringsmål** — Er FrameCounter-steppere, mood-knapper (Step4), foto-knapper og fane-elementer ≥ 44×44 pt? Mål mot faktiske style-verdier.

4. **Tekstskalering** — `allowFontScaling`-status. Hva knekker ved 200 % systemskrift (tall fra typography.ts + faste høyder)? List komponenter med fast høyde + tekst.

5. **Farge som eneste bærer** — Varroa-alvorlighet, helse-ring, bieflukt-sirkler, sesongfarger: finnes tekst/ikon-redundans? Test mot deuteranopi (rød/grønn).

6. **Grafer** — Skia/SVG-grafer (vekt, honning, varroa-trend): har de tekstlig alternativ eller accessible sammendrag?

---

## AGENT 10 — Retention og brukerengasjement

**Scope:** Hva som holder brukere aktive uke etter uke.

**Output-fil:** `reports/agent-10-retention.md`

**Les:** `app/(app)/(tabs)/hjem/index.tsx`, alle `components/home/*.tsx` (Glob først), `services/notifications.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `constants/seasonReminders.ts`, `app/(app)/(tabs)/kalender/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`

**Evaluer:**

1. **Push-dekning** — Hvilke hendelser trigger varsler i dag (weekly-hive-alerts + lokale)? Er de handlingsorienterte («Kube 3 har ikke vært inspisert på 14 dager — svermetid!») eller generiske? Brukes seasonReminders til faktiske push, eller bare in-app?

2. **Daily/weekly driver** — Hva gir grunn til å åpne appen mellom inspeksjoner? Vær + trekkprognose er naturlige kandidater (Yr-data finnes) — utnyttes de? Er dashboardet dynamisk (endrer seg daglig) eller statisk?

3. **Progresjon og mestring** — Vises varroa-trend over sesong, honningutbytte år-for-år, vektkurver med innsikt («kuben la på seg 2,1 kg denne uka — godt trekk»)? Finnes milepæler/streaks som passer voksne hobbyister (ikke barnslig gamification)?

4. **Sesongdrevet re-engagement** — Fanger appen opp brukere som IKKE har innvintret innen september? Varsler før oksalsyre-vinduet (november)? Dette er domene-naturlige churn-brytere — finnes de?

5. **Sosialt** — Svermekart og samfunn-fane: skaper de gjentatt bruk? Er den skjulte feed-fanen en retention-mulighet som bør aktiveres, eller distraksjon som bør slettes? Gi en anbefaling.

6. **Målbarhet** — Finnes analytics/events til å måle retention i det hele tatt (utover Sentry)? Hvis nei, foreslå minimal event-instrumentering (5–8 events) for å kunne måle aktivering og churn.

---

## AGENT 11 — Onboarding og første kjøring

**Scope:** Fra app-åpning til første verdimoment. Navigasjon ETTER aktivering dekkes av Agent 1.

**Viktig kontekst:** Pre-auth onboarding ble bygget i Sprint 1 (10. juni): `welcome.tsx` + `onboarding.tsx` + e-postverifisering-UX. Evaluer den FAKTISKE nye flyten — ikke anta at gammel kritikk fortsatt gjelder.

**Output-fil:** `reports/agent-11-onboarding.md`

**Les:** `app/(auth)/index.tsx`, `app/(auth)/welcome.tsx`, `app/(auth)/onboarding.tsx`, `app/(auth)/register.tsx`, `app/(auth)/login.tsx`, `services/googleAuth.ts`, `app/(app)/_layout.tsx`, `components/home/ActivationGuide.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/ny.tsx`

**Evaluer:**

1. **Flyt-kart** — Tegn faktisk sekvens: app-åpning → welcome → onboarding → register/login → verifisering → hjem. Tell skjermer og obligatoriske felt. Hvor kan brukeren falle av, og hva skjer ved hver avbrytelse (kommer de tilbake til riktig sted)?

2. **Onboarding-innhold** — Selger onboarding-skjermene verdi (vis frem AI-analyse, helsescore, varsler) eller beskriver de bare funksjoner? Kan den hoppes over? Vises den igjen ved reinstall?

3. **Registreringsfriksjon** — Er Google OAuth førstevalg visuelt? Er e-postverifisering blokkerende, og hva er UX-en mens man venter (resend? åpne e-postapp-knapp)?

4. **Første kube og første inspeksjon** — Er `ny.tsx` forståelig for en nybegynner (forklares «etasjer», «rammer»)? Leder ActivationGuide brukeren gjennom kube → inspeksjon → varsler? Hva skjer når guiden er fullført?

5. **Aha-moment** — Definer BiVokters aha-moment (forslag: første helsescore/AI-analyse på egen kube). Hvor mange minutter og trykk fra installasjon dit? Er det noe i flyten som kan flyttes ETTER aha-momentet (permission-prompts, profilfelter)?

6. **Tom-tilstand som selger** — Ser en bruker med 0 kuber et dødt dashboard eller en demo av hva appen blir (eksempeldata, ghost-kort)?

---

## AGENT 12 — Databasearkitektur og backend

**Scope:** Supabase-skjema, queries, Edge Functions, skalerbarhet. RLS-korrekthet dekkes av Agent 8 — her vurderes RLS kun for ytelse.

**Output-fil:** `reports/agent-12-database.md`

**Les:** `supabase/migrations/0001_initial_schema.sql`, `0012_latest_inspections_per_hive.sql`, `0028_hive_map_rpc.sql`, `0033_missing_indexes.sql`, `0038_performance_indexes.sql`, `0039_rls_subselect_auth_uid.sql`, `0041_revenuecat_processed_events.sql`, `services/inspection.ts`, `services/hive.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `supabase/functions/analyze-varroa/index.ts`, `supabase/migrations/reset_and_rebuild.sql` (hva er denne? risiko?)

Søk: Grep `pattern: "\\.select\\('\\*'\\)"`, `path: "services"`, `glob: "*.ts"`, `output_mode: "content"`. Grep `pattern: "timestamp\\b(?! ?tz)|timestamp without"`, `path: "supabase/migrations"`, `output_mode: "content"`. Grep `pattern: "CREATE INDEX"`, `path: "supabase/migrations"`, `output_mode: "content"` (full indeksoversikt).

**Evaluer:**

1. **Skjemakvalitet** — Manglende FK-constraints, `timestamp` vs `timestamptz`, manglende NOT NULL/CHECK (negativ vekt? varroa_count < 0?). ON DELETE-oppførsel: CASCADE der det skal, RESTRICT der det må.

2. **Indeksstrategi** — Etter 0033+0038: gjenstår hull? Sjekk spesielt composite-indekser for RPC-ene (DISTINCT ON (hive_id) ORDER BY inspected_at DESC trenger `(hive_id, inspected_at DESC)`), og partial indexes for vanlige filtre. Gi konkrete `CREATE INDEX`-setninger.

3. **RPC-kvalitet** — Er `get_latest_inspections_per_hive` og `get_hive_map_data` optimale? SECURITY DEFINER vs INVOKER — riktig valgt? Returnerer de minimale kolonner?

4. **Edge Function-skalerbarhet** — `weekly-hive-alerts`: looper den per bruker med N queries (dør ved 10 000 brukere), eller batch? `analyze-varroa`: synkron ventetid på AI-API — timeout-håndtering, kostnadstak? `reset_and_rebuild.sql`: kan denne kjøres ved uhell mot prod?

5. **Datavekst** — inspections med AI-felter + media: anslå radstørrelse og vekst per aktiv bruker per sesong. Når trengs arkivering/partisjonering? Hva er flaskehalsen ved 1 000 / 10 000 brukere på Supabase Pro?

6. **Backup og migrasjonshygiene** — PITR-behov før lansering. Er migrasjonene idempotente (IF NOT EXISTS)? Manglende 0012/0013-rekkefølgeavvik eller andre nummereringsproblemer?

---

## AGENT 13 — Testdekning og lanseringsklarhet (NY i v3)

**Scope:** Automatisert testing, release-konfigurasjon og Play Store-krav. Dette er hullet ingen andre agenter dekker.

**Output-fil:** `reports/agent-13-lansering.md`

**Les:** `package.json`, `app.json` (eller `app.config.ts`), `eas.json`, `tsconfig.json`, `.github/workflows/` (Glob først), `lib/supabase.ts`, `app/(app)/_layout.tsx` (Sentry-init)

Søk: Glob `**/*.test.{ts,tsx}` og `**/__tests__/**` (finnes tester i det hele tatt?). Grep `pattern: "console\\.(log|warn)"`, `path: "services"`, `glob: "*.ts"`, `output_mode: "count"`. Grep `pattern: "Sentry"`, `glob: "*.{ts,tsx}"`, `output_mode: "files_with_matches"`.

**Evaluer:**

1. **Testtilstand** — Finnes enhetstester? Hvis null: foreslå de 10 første testene med høyest verdi (rene funksjoner først: varroa-terskler, mapX()-funksjoner, helsescore-beregning, datologikk i kalender) og oppsett (jest-expo). Estimer innsats.

2. **CI** — Kjøres tsc/eslint/tester automatisk på push? Hvis nei: minimal GitHub Actions-workflow som forslag.

3. **Release-konfig** — eas.json-profiler fornuftige? versionCode-autoIncrement på riktige profiler? Sentry: er sourcemaps-opplasting konfigurert for EAS-bygg? Er Sentry-DSN og andre EXPO_PUBLIC-variabler riktig satt opp per miljø?

4. **Play Store-krav** — Data safety-skjema: stemmer det med faktisk datainnsamling (posisjon, foto, e-post)? Konto-sletting-URL (Google-krav — delete-account finnes, men er den eksponert som web-URL?). Target API-nivå. App-tillatelser i app.json: brukes alle (kamera, posisjon, varsler), og er det noen som ikke brukes (vil gi avslag)?

5. **Oppstartshelse** — Init-rekkefølge i `_layout.tsx`: hva skjer hvis Sentry/RevenueCat/push-registrering feiler ved kald start? Blokkerer noe av det første render?

6. **Lanserings-sjekkliste** — Sammenstill kjente gjenstående punkter fra koden (ikke gjett): Supabase Pro-oppgradering (auto-pause-risiko på free tier), RevenueCat-produkter i Play Console, webhook-secret satt, delete-account-URL publisert. Marker hva som er verifiserbart i kode vs må sjekkes manuelt i dashboards.

---

## SYNTESE-AGENT — Prioritert handlingsplan

**Kjør ETTER at alle 13 agenter har skrevet sine rapporter.**

**Les alle:** `reports/agent-01` … `reports/agent-13` (+ skum `reports/archive/syntese-handlingsplan.md` for å se hva som var planlagt sist og faktisk ble gjort).

**Kontekst:** Pre-lansering, intern testing i Play Console. Én utvikler + Claude. Mål: lansering + 100 betalende brukere første sesong. Det er juni — svermetid og høysesong for birøkt: time-to-market har egenverdi.

**Output-fil:** `reports/syntese-handlingsplan.md`

**Skåringsmodell (bruk denne, ikke skjønn):**
For hvert kandidat-tiltak, sett 1–5 på:
- **E** = Effekt på lansering/konvertering/retention
- **R** = Risikoreduksjon (sikkerhet, datatap, GDPR — sett 5 ved KRITISK-funn)
- **I** = Innsats (1 = XL, 5 = S — altså høyere er billigere)

**Score = (2E + 2R) × I / 10.** Rangér etter score. Vis E/R/I-verdiene i tabellen så rangeringen er etterprøvbar.

**Syntese-oppgaver:**

1. **Konsensus-funn** — Funn rapportert av 3+ agenter (matrise: funn × agenter). Disse har høyest reliabilitet og skal vektes opp.

2. **Konflikter** — Identifiser motstridende anbefalinger (f.eks. Agent 3 vil gate tidligere, Agent 11 vil utsette gates; Agent 2 vil polere, Agent 13 vil shippe). Løs hver konflikt eksplisitt med begrunnelse forankret i målet (100 betalende, sesongen er NÅ).

3. **Falsifiser** — Stikkprøv 5 tilfeldige KRITISK/HØY-funn ved å lese koden selv. Rapporter hvor mange som holdt vann. Hvis < 4/5 holder, senk tilliten til den agentens øvrige funn og noter det.

4. **Topp-20 ROI-tabell** — Tiltak, score (E/R/I synlig), kilde-agent(er), fil-referanser, innsats.

5. **Denne uken (< 8 t totalt)** — Rask-fixer. Hver med verifikasjonssteg («slik tester du at det virker»).

6. **Sprint (2 uker)** — De 5 viktigste endringene for lansering + konvertering, i rekkefølge, med avhengigheter.

7. **Etter lansering (3 mnd)** — Strategisk, inkl. det som bevisst utsettes.

8. **Ikke gjør** — Eksplisitt liste over anbefalinger fra agentene som IKKE bør følges nå, med hvorfor (prematur optimalisering, konflikt med time-to-market, lav konfidens).

9. **Go/no-go** — Én avsluttende vurdering: kan appen lanseres til åpen testing/produksjon i nåværende tilstand? Hvis nei: den korteste listen av blokkere (kun KRITISK), med samlet innsatsestimat i dager.

---

*Versjon: v3 | Oppdatert: 2026-06-12 | Migrasjoner: 0001–0045 | versionCode: ~19 | Forrige review: 2026-06-10 (arkiveres til reports/archive/)*
