# Agent 13 — Testdekning og lanseringsklarhet

## Metainfo
- Filer lest: `package.json`, `app.json`, `eas.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `lib/supabase.ts`, `lib/queryClient.ts`, `app/_layout.tsx`, `app/(app)/_layout.tsx`, `services/subscription.ts`, `utils/health.ts`, `constants/varroa.ts`, `app/(app)/profil.tsx` (grep)
- Filer ikke funnet: `.github/workflows/` (finnes ikke), `app.config.ts` (kun `app.json`), ingen testfiler, ingen eslint-/jest-konfig
- Diff mot forrige review: NY agent i v3 — ingen arkivrapport å diffe mot

## Sammendrag
Appen har **null automatiserte tester og null CI** — all verifisering er manuell. Release-konfigurasjonen (eas.json, versjonering, Sentry-integrasjon) er derimot overraskende solid. Største konkrete lanseringsrisiko er Play-policy: `READ_MEDIA_IMAGES`-tillatelse + ubrukt `expo-media-library`-plugin kan gi avslag i Play-review, og konto-slettings-web-URL (Google-krav) finnes ikke. Testgapet er håndterbart: kodebasen har flere rene, testbare funksjoner (helsescore, varroa-terskler, tier-mapping) som kan dekkes på én dag.

## Fungerer godt
1. **Sentry-integrasjon**: global `QueryCache`/`MutationCache` onError → Sentry + toast med dedup-logikk (`lib/queryClient.ts:12–21`), `Sentry.wrap` på rotlayout, ErrorBoundary i treet.
2. **Null `console.log/warn`** i hele `app/`, `components/`, `services/`, `lib/`, `hooks/`, `store/` (grep: 0 treff) — uvanlig rent.
3. **Secrets-hygiene**: `.env.local`, `google-play-service-account.json`, `revenuecat-key.json` er gitignorert (`.gitignore:43–47`); kun `.env.example` er sporet i git.
4. **eas.json**: `autoIncrement: true` på både preview og production, `appVersionSource: "remote"`, AAB på butikk-profiler, APK kun på dev — riktig oppsett.
5. **Robust oppstart**: alle init-feil (RevenueCat, push, fonts) er fanget; `getSession().catch()` tvinger `isLoading=false` (`app/_layout.tsx:58–60`); fontError skjuler splash i stedet for å henge.

## Funn

**[HØY]** `package.json:5–10` — Ingen tester, ingen testrunner, ikke engang et `test`-script: `"scripts": { "start": "expo start", ... }` — kun expo-kommandoer. Glob `**/*.test.{ts,tsx}` gir 0 treff utenfor node_modules. — Regresjoner (f.eks. i tier-logikk eller varroa-terskler som styrer behandlingsråd) oppdages først av betalende brukere. — Løsning: `jest-expo`-oppsett + de 10 testene under. — Innsats: M — Konfidens: HØY

**De 10 første testene (rangert etter verdi, alle rene funksjoner):**
1. `utils/health.ts:3` `computeHealthScore` — grensetester varroa 1/2/3/5/6, `undefined`→50, 21/42-dagers straff
2. `constants/varroa.ts:23` `varroaThresholds` — per metode, case-følsomhet, `null`/ukjent → konservativ default
3. `services/subscription.ts:38` `mapEntitlementToTier` — prioritet lag > profesjonell > hobbyist > starter
4. `services/report.ts:14` `esc()` — HTML-escaping i PDF (XSS), null/undefined-input
5. `services/inspection.ts:211` `mapInspection` — nullable-felt-robusthet (krever `export`, triviell endring)
6. `services/hive.ts:193` `mapHive` — samme
7. Vekt-parsing `parseFloat(weightStr.replace(',', '.'))` (`components/hive/WeightSection.tsx:30`) — bør ekstraheres til `utils/` og testes med komma/punktum/tom streng
8. `constants/seasonReminders.ts` — datologikk/månedsgrenser
9. `services/swarmReport.ts:21` `mapReport` — status `'open'`/`'resolved'`-mapping
10. `lib/queryClient.ts:17` — mutation-onError-dedup (lokal handler → ingen global toast)

Estimat: oppsett 1–2 t, 10 tester 3–4 t.

**[HØY]** `app.json:32–33` + `app.json:58–63` — `"android.permission.READ_MEDIA_VISUAL_USER_SELECTED", "android.permission.READ_MEDIA_IMAGES"` er eksplisitt deklarert, og `expo-media-library`-pluginen er installert — men `MediaLibrary`-API-et brukes ingen steder (grep: kun `ImagePicker.requestMediaLibraryPermissionsAsync`). Googles «Photos and Videos»-policy krever at apper med `READ_MEDIA_IMAGES` har galleri som kjernefunksjon; engangsvalg av bilder skal bruke Android Photo Picker (som expo-image-picker gjør uten tillatelse på Android 13+). — Konsekvens: sannsynlig avslag eller krav om policy-erklæring ved Play-review. — Løsning: fjern begge permissions fra `app.json`, fjern `expo-media-library` fra plugins og `package.json`, rebuild. — Innsats: S — Konfidens: HØY

**[HØY]** Ingen CI — `.github/workflows/` finnes ikke, og eslint er ikke installert i det hele tatt (ingen config, ingen dependency). `tsc` kjøres aldri automatisk (`tsconfig.json` har `strict: true`, men ingen `typecheck`-script). — Konsekvens: typefeil kan nå EAS-bygg; bygget feiler sent (20+ min) i stedet for på 2 min i CI. — Løsning: minimal workflow: `on: push` → `npm ci` → `npx tsc --noEmit` → `npx jest --ci` (+ `npx expo-doctor`). Legg til `"typecheck": "tsc --noEmit"` i scripts. — Innsats: S — Konfidens: HØY

**[HØY]** Konto-slettings-URL mangler — in-app-sletting finnes (`app/(app)/profil.tsx:93`: `supabase.functions.invoke('delete-account')`), men Google krever en **web-URL** for kontosletting i Data safety-skjemaet for apper med kontooppretting. Edge-funksjonen er JWT-beskyttet API, ikke en webside; ingen URL finnes i koden. — Konsekvens: Play Console-blokkering ved publisering til produksjon. — Løsning: enkel statisk side (f.eks. på `boklet23.github.io/biapp/delete-account`) med instruks + e-postkontakt, eller liten webform mot Edge-funksjonen. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/_layout.tsx:22–26` — `Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, sendDefaultPii: false, enableLogs: true })` — ingen `environment`, ingen `tracesSampleRate`. Dev- og prod-events blandes; ytelsesdata mangler. Sourcemaps-pluginen er konfigurert (`app.json:65–71`), men `"project": "react-native"` ser ut som default-navnet, og opplasting krever `SENTRY_AUTH_TOKEN` som EAS-secret (ikke verifiserbart i kode — sjekk at prod-stacktraces faktisk er symboliserte). — Løsning: `environment: __DEV__ ? 'development' : 'production'` + verifiser sourcemaps i ett testbygg. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `eas.json` (hele filen) — ingen `env`-blokker per profil, og `.env.local` er gitignorert (lastes ikke opp til EAS). Alle `EXPO_PUBLIC_*`-variabler må derfor ligge som EAS environment variables i dashboardet — fungerer åpenbart i dag (versionCode ~19), men er usynlig i koden og udokumentert. I tillegg: `.env.example` mangler `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` som brukes i `services/subscription.ts:12` med fallback `?? ''` — tom nøkkel gir stille feilende `Purchases.configure`. — Løsning: legg variabelen til `.env.example`, og kast eksplisitt feil ved tom nøkkel på Android. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `lib/supabase.ts:4–11` — `process.env.EXPO_PUBLIC_SUPABASE_URL!` + `throw new Error(...)` på modulnivå. Throw skjer under modul-evaluering, FØR `Sentry.init` (linje 22 i `_layout.tsx`) og før ErrorBoundary er montert. — Konsekvens: et feilkonfigurert bygg gir hvit skjerm uten Sentry-rapport. — Løsning: aksepter som fail-fast, men flytt Sentry.init til egen modul som importeres først, eller logg til konsoll med tydelig melding. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `eas.json:40–48` — submit-profilen har `"track": "internal", "releaseStatus": "draft"` — riktig nå, men må huskes endret ved produksjonslansering (lett å glemme at `eas submit` fortsatt sender til intern testing). — Innsats: S — Konfidens: HØY

**Oppstartshelse (vurdert, ingen funn):** Init-rekkefølgen er sunn. Sentry/RevenueCat/push blokkerer ikke første render: RevenueCat-feil → Sentry + toast (`app/(app)/_layout.tsx:28–31`), push-feil svelges bevisst (`:20–22`), kun font-lasting gater render med fontError-fallback. Eneste avhengighet som kan krasje oppstart er Supabase-env (funnet over).

## Lanserings-sjekkliste

**Verifiserbart i kode (status):**
- ✅ delete-account Edge Function + in-app-inngang (`profil.tsx:93`)
- ✅ Personvernerklæring lenket (`app/(auth)/register.tsx:185`: `https://boklet23.github.io/biapp/privacy`) — men at siden faktisk er publisert må sjekkes manuelt
- ✅ autoIncrement + AAB på preview/production
- ✅ Target-API: Expo SDK 55 kompilerer mot API 36 — oppfyller Plays krav (35+)
- ❌ READ_MEDIA_IMAGES-tillatelse (funn over)
- ❌ Konto-slettings-web-URL (funn over)
- ❌ Tester/CI (funn over)

**Må sjekkes manuelt i dashboards:**
- Supabase Pro-oppgradering (free tier auto-pauser etter 7 dagers inaktivitet → appen dør)
- RevenueCat-produkter aktivert i Play Console + webhook-secret satt i Edge Function-secrets
- EAS env-vars: `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY/MAPBOX_TOKEN/SENTRY_DSN/REVENUECAT_ANDROID_KEY`
- `SENTRY_AUTH_TOKEN` som EAS-secret (sourcemaps)
- Data safety-skjema: må deklarere posisjon (deles med ANDRE brukere via svermekart — «shared»-flagget!), foto, e-post

## Topp-3 anbefalinger
1. **Fjern `READ_MEDIA_IMAGES` + `expo-media-library` fra app.json/package.json** (S, ~30 min) — eliminerer den mest sannsynlige Play-avvisningen før åpen testing.
2. **Sett opp jest-expo + de 10 testene + minimal GitHub Actions (tsc + jest)** (M–L, ~1 dag) — låser fast faglig kritisk logikk (varroa-terskler, helsescore, tier-mapping) som i dag kan regrede stille.
3. **Publiser konto-slettings-webside og fullfør Data safety-skjemaet** (M, 2–3 t) — begge er harde Google-krav som blokkerer produksjonslansering, ikke polish.
