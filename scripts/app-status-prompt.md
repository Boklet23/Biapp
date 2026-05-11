# BiVokter — Fullstendig statusbriefing

> **Bruk:** Lim inn denne prompten som første melding i en ny Claude Code-sesjon
> åpnet i mappen `C:\Users\andre\claudecode\Prosjekter\Bier\biapp`.
> Gir agenten komplett kontekst om hva appen er, hva som er gjort, og hva som gjenstår.

---

## Hva er BiVokter?

BiVokter er en norsk mobilapp for birøktere. Den lar birøktere:
- Administrere birekuber (opprette, redigere, slette, se status)
- Loggføre inspeksjoner av kuber (trinn-for-trinn-veiviser, 4 steg)
- Analysere varroainfeksjon via AI (bilde → estimert alvorsgrad)
- Se sesongkalender og sjekklister
- Motta ukentlige helsevarsler via push-notifikasjoner
- Sammenligne kuber og generere rapporter (PDF/CSV)
- Samarbeide med andre birøktere (Lag-abonnement)
- Lære om birøkt via læringsmodul

Appen selges på abonnement: Starter (gratis, maks 3 kuber), Hobbyist (49 kr/mnd),
Profesjonell (149 kr/mnd), Lag (499 kr/mnd). Nye brukere får 14 dagers gratis prøveperiode.

---

## Teknisk stack

| Komponent | Teknologi |
|-----------|-----------|
| Framework | React Native 0.83 + Expo SDK 55 (New Architecture aktivert) |
| Navigasjon | expo-router v3 (filbasert, typed routes) |
| Backend | Supabase (eu-west-1) — PostgreSQL + RLS + Edge Functions (Deno) |
| State | TanStack React Query (server state) + Zustand (auth state) |
| Autentisering | Supabase Auth (email/passord) |
| Abonnement | RevenueCat (Android — iOS er mock starter-tier) |
| Kart | Mapbox (@rnmapbox/maps) |
| Vær | Yr.no API (TTL 1 time) |
| Feilsporing | Sentry (@sentry/react-native) |
| Animasjoner | Skia + Reanimated (ALLTID SharedValue — aldri setState/rAF) |
| OTA-oppdateringer | expo-updates (automatisk ved app-åpning) |
| Bygg | EAS Build + EAS Submit (Android AAB) |

**Supabase project ID:** `zujvhbnuqocquthbujmp`
**EAS project:** `@boklet23/biapp`
**Android package:** `no.biapp.app`
**GitHub repo:** `Boklet23/Biapp`
**GitHub Pages:** `https://boklet23.github.io/Biapp/`

---

## Mappestruktur (nøkkelfiler)

```
app/
  (auth)/
    index.tsx          — innloggingsside
    register.tsx       — registrering med GDPR-samtykke + vilkår
  (app)/
    _layout.tsx        — auth-guard, push-tillatelse, registerPushToken
    splash.tsx         — onboarding-sjekk, eier all routing etter login
    profil.tsx         — brukerprofilside
    (tabs)/
      _layout.tsx      — tab-bar konfigurasjon (5 faner)
      hjem/index.tsx   — dashboard: vær, helse-ring, varsler, siste inspeksjoner
      kuber/           — kubehåndtering (Stack-navigator)
        index.tsx      — kubeoversikt med HiveCard
        ny.tsx         — opprett ny kube
        [id]/
          index.tsx    — kubeprofil: helse, anbefalinger, varroa, dronning, høsting
          rediger.tsx  — rediger kube
          samarbeid.tsx — Lag-tier samarbeidsskjerm
          inspeksjon/
            ny.tsx     — ny inspeksjon (4-stegs veiviser)
            [inspId].tsx — vis inspeksjon
      kalender/index.tsx — sesongkalender + sjekklister
      laer/index.tsx   — læringsmodul
      samfunn/index.tsx — samfunnsside (WIP)

services/
  hive.ts            — CRUD for kuber, bildeopplasting (FileSystem legacy)
  inspection.ts      — inspeksjoner, fetchLastInspectionPerHive (RPC)
  subscription.ts    — RevenueCat + syncTierToSupabase
  report.ts          — PDF-generering
  weather.ts         — Yr.no API, TTL-caching
  queen.ts           — dronningregistrering
  treatment.ts       — behandlingslogging
  weight.ts          — vektlogging
  harvest.ts         — høstlogging
  notifications.ts   — push-token registrering
  collaboration.ts   — Lag-tier samarbeid (DB-only, har UI i samarbeid.tsx)
  calendarEvent.ts   — kalenderoppføringer
  swarmReport.ts     — svermrapportering

constants/
  colors.ts          — Colors, Shadows, Radii, SeasonColors (ALDRI inline verdier)
  typography.ts      — skriftstørrelser og -vekter

store/
  auth.ts            — Zustand: session, profile, signIn, signOut

lib/
  supabase.ts        — Supabase-klient
  queryClient.ts     — React Query-klient med Sentry QueryCache onError

utils/
  health.ts          — computeHealthScore (0–100 basert på inspeksjonsdata)

supabase/
  functions/
    weekly-hive-alerts/  — Edge Function: push-varsler til brukere med gammel inspeksjon
    revenuecat-webhook/  — Edge Function: synker abonnementstier fra RevenueCat
  migrations/
    0001–0018            — alle migrasjoner kjørt i produksjon

scripts/
  create-play-subscriptions.js  — oppretter 6 abonnementsprodukter via Google Play API
  generate-splash.js             — genererte splash-screen PNG
  automate-remaining.md          — automatiseringsprompt (local-only, ikke i git)

assets/
  icon.png                     — 1024×1024 BiVokter-ikon (navy + honning)
  android-icon-foreground.png  — 108×108 adaptive icon foreground
  splash-icon.png              — 1284×2778 splash screen

docs/
  privacy.html           — personvernerklæring (live på GitHub Pages)
  terms.html             — vilkår for bruk (live på GitHub Pages)
  manuell-oppsett.html   — oppsettguide med gjenstående manuelle steg
```

---

## Viktige gotchas og regler

- `as any` på **alle** dynamiske Expo Router-ruter (typed routes begrensning)
- `expo-file-system/legacy` (IKKE `expo-file-system`) — SDK 55 flyttet `uploadAsync`,
  `FileSystemUploadType` og `cacheDirectory` til legacy-modulen
- Skia-animasjoner: ALLTID `Reanimated SharedValue` — aldri `setState` eller `rAF`
- `swarm_reports.status`: `'open'` | `'resolved'` (IKKE `'active'`)
- `mapX()` funksjoner kaster ved manglende required fields; nullable felt:
  `typeof row.x === 'string' ? row.x : null`
- Mutations: alltid `onError: (e: Error) => showToast(e.message, 'error')`
- `react-native-svg`: importer `Text as SvgText` (unngår konflikt med RN Text)
- RevenueCat: guard med `Constants.appOwnership === 'expo'` — krasjer i Expo Go
- iOS RevenueCat: returnerer mock starter-tier (ikke konfigurert)
- `useEffectiveTier()` returnerer `'hobbyist'` under aktiv 14-dagers prøveperiode
- `fetchLastInspectionPerHive()` bruker RPC `get_latest_inspections_per_hive` (DISTINCT ON)
- Design system: bruk `Colors.*`, `Radii.*`, `Shadows.*`, `SeasonColors.*` — aldri
  hardkodede hex-verdier eller inline styles

---

## Hva som er ferdig ✅

### Kode og arkitektur
- [x] Alle 5 faner fungerer: Hjem, Mine Kuber, Kalender, Lær, Samfunn
- [x] Autentisering (email/passord, GDPR-samtykke, ToS-avkrysning ved registrering)
- [x] 14-dagers gratis prøveperiode (`useEffectiveTier` hook)
- [x] Abonnementssystem (RevenueCat + UpgradeModal + tier-gating)
- [x] AI varroa-analyse med tier-gating (Hobbyist: 10/mnd, Pro: ubegrenset)
- [x] Lag-tier samarbeidsskjerm (`[id]/samarbeid.tsx`)
- [x] Ukentlige push-varsler (`weekly-hive-alerts` Edge Function v3)
- [x] HealthRing-komponent og computeHealthScore
- [x] Kubeprofil med alle seksjoner (Dronning, Behandling, Vekt, Høsting, Varroa-trend)
- [x] 4-stegs inspeksjonsveiviser med bildeopplasting
- [x] PDF-rapport generering
- [x] Sesongkalender med sjekklister
- [x] OTA-oppdateringer (expo-updates)
- [x] Error boundary + Sentry feilsporing
- [x] Sentry QueryCache onError (global fangst)
- [x] Design system: navy/honning-fargepalett, Radii, Shadows, SeasonColors
- [x] Norsk ToS (`docs/terms.html`) + personvernerklæring (`docs/privacy.html`)

### Infrastruktur
- [x] Supabase-migrasjoner 0001–0018 kjørt i produksjon
- [x] RLS-policyer for alle tabeller
- [x] Starter-cap: maks 3 kuber for gratis-brukere (migrasjon 0013 + 0014)
- [x] `get_latest_inspections_per_hive()` RPC med GRANT EXECUTE (migrasjon 0012)
- [x] `revenuecat-webhook` Edge Function deployet
- [x] `weekly-hive-alerts` Edge Function v3 deployet (verify_jwt: false, x-alerts-secret)
- [x] pg_cron-jobb: kjører `weekly-hive-alerts` hver mandag 07:00 UTC (migrasjon 0018)
- [x] GitHub Pages aktiv: `boklet23.github.io/Biapp/` (terms + privacy live)

### Bygg og deploy
- [x] App-ikon 1024×1024 generert og committet (`assets/icon.png`)
- [x] Android adaptive foreground-ikon (`assets/android-icon-foreground.png`)
- [x] Splash screen 1284×2778 generert og committet (`assets/splash-icon.png`)
- [x] `eas.json` preview-profil: AAB-format (Play Store-kompatibelt)
- [x] `eas.json` production submit-konfig: `serviceAccountKeyPath`, `track: internal`
- [x] `.eas/workflows/build-submit.yml`: automatisk bygg + submit ved push til master
- [x] `scripts/create-play-subscriptions.js`: oppretter 6 produkter via Play API
- [x] `RECORD_AUDIO`-tillatelse fjernet (Google Play compliance)

---

## Hva som gjenstår ❌

### Kritisk (blokkerer lansering)

**1. RevenueCat webhook — manuelt i dashboard (ingen API)**
- Gå til `app.revenuecat.com` → Integrations → Webhooks → Add webhook
- URL: `https://zujvhbnuqocquthbujmp.supabase.co/functions/v1/revenuecat-webhook`
- Generer et nytt token: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Legg tokenet inn som `REVENUECAT_WEBHOOK_SECRET` i Supabase Dashboard →
  Edge Functions → revenuecat-webhook → Secrets
- Authorization header i RevenueCat: `Bearer <tokenet>`
- Events: INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION, BILLING_ISSUE
- Estimert tid: ~10 min

**2. Google Service Account — kan delvis automatiseres med gcloud CLI**
- Kjør scriptet i `scripts/automate-remaining.md` for gcloud-basert oppsett
- Manuelt steg: Google Play Console → Setup → API access → link service account
  → gi "Release Manager"-rolle
- Estimert tid: ~20 min (inkl. gcloud-installasjon første gang)

### Høy prioritet (kreves for kjøp)

**3. Første manuelle AAB-opplasting til Google Play**
- Google krever én manuell opplasting til intern testing før API fungerer
- Bygg: `npx eas build --profile preview --platform android --non-interactive`
- Last ned AAB fra EAS Dashboard → last opp i Play Console → Internal testing
- Estimert tid: ~10 min (pluss ~10 min byggtid)
- **Etter dette tar EAS Workflow over automatisk**

**4. Kjør subscription-scriptet**
- Krever at `google-play-service-account.json` finnes i rotmappen (fra steg 2)
- `node scripts/create-play-subscriptions.js --dry-run` (forhåndsvis)
- `node scripts/create-play-subscriptions.js` (opprett)
- Estimert tid: ~1 min

**5. RevenueCat entitlements + offerings**
- Importer de 6 produktene i RevenueCat → Products → Google Play
- Opprett entitlements: `hobbyist`, `profesjonell`, `lag`
- Koble produkter til entitlements
- Opprett offering kalt `default` med packages
- Estimert tid: ~15 min

### Siste steg

**6. Produksjons-build + auto-submit**
- Kjøres etter at alt over er på plass
- `npx eas build --profile production --platform android --auto-submit --non-interactive`
- EAS bygger AAB og laster den rett opp til Play Store Internal testing
- Estimert tid: ~15 min (pluss ~15 min byggtid)

---

## Database-oversikt (migrasjoner kjørt)

| Migrasjon | Innhold |
|-----------|---------|
| 0001–0005 | Grunnleggende tabeller: hives, inspections, swarm_reports, calendar_events, profiles |
| 0006 | treatments |
| 0007 | hive_weights |
| 0008 | hive_collaborators (Lag-tier, ingen UI ennå) |
| 0009 | queens |
| 0010 | marketplace (ingen UI) |
| 0011 | feed (ingen UI) |
| 0012 | get_latest_inspections_per_hive() RPC + GRANT EXECUTE |
| 0013 | INSERT policy — maks 3 kuber for starter-tier |
| 0014 | UPDATE policy — blokkerer reaktivering av soft-deleted kuber for starter |
| 0015–0017 | (diverse forbedringer fra ultrareview) |
| 0018 | pg_cron-jobb med x-alerts-secret header |

---

## Abonnements-arkitektur

```
RevenueCat (kjøp) → revenuecat-webhook (Edge Function)
                  → profiles.subscription_tier oppdateres
                  → useEffectiveTier() hook leser tier

Tier-hierarki: starter < hobbyist < profesjonell < lag
Prøveperiode: 14 dager etter registrering → tier = 'hobbyist'
iOS: returnerer alltid mock starter-tier (ikke konfigurert)
```

---

## Kommandoer du kan bruke

```bash
# Bygg preview (AAB)
npx eas build --profile preview --platform android --non-interactive

# Bygg produksjon + auto-submit
npx eas build --profile production --platform android --auto-submit --non-interactive

# Submit siste bygg manuelt
npx eas submit --platform android --latest

# Opprett Play Store-produkter (krever google-play-service-account.json)
node scripts/create-play-subscriptions.js --dry-run
node scripts/create-play-subscriptions.js

# Generer splash screen på nytt
node scripts/generate-splash.js

# Sjekk TypeScript
npx tsc --noEmit

# Kjør linter
npx eslint . --ext .ts,.tsx
```

---

## Kjente begrensninger

- **iOS er ikke konfigurert** — ingen Apple Developer-konto ennå. iOS returnerer
  mock starter-tier fra RevenueCat. Krever separat TestFlight-oppsett.
- **Collaboration UI** — `hive_collaborators`-tabellen eksisterer og
  `samarbeid.tsx`-skjermen er bygget, men invitasjonsflyt via e-post er ikke testet end-to-end.
- **Samfunn-fanen** er en plassholder uten reell funksjonalitet.
- **Feed-fanen** eksisterer i kode (`app/(app)/(tabs)/feed/`) men er ikke i tab-baren.
- **Marketplace** (`services/marketplace.ts`) er i DB men har ingen UI.
- **Rive-animasjoner** er planlagt men ikke implementert (brief finnes i `docs/`).
