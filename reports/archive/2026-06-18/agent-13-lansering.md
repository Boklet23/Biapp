# Agent 13 — Testdekning og lanseringsklarhet

## Metainfo
- Filer lest: `package.json`, `app.json`, `eas.json`, `tsconfig.json`, `jest.config.js`, `.env.example`, `lib/supabase.ts`, `app/_layout.tsx`, `app/(app)/_layout.tsx`, `services/subscription.ts`, `app/(app)/profil.tsx`, `docs/lansering-sjekkliste.md`, `.github/workflows/ci.yml`, `.github/workflows/supabase-keepalive.yml`, `__tests__/varroa.test.ts`, `__tests__/health.test.ts`
- Glob: 2 testfiler funnet (`__tests__/varroa.test.ts`, `__tests__/health.test.ts`), 2 workflows
- Grep `console.(log|warn)` i `services/*.ts`: 0 treff
- Diff mot `reports/archive/2026-06-12/agent-13-lansering.md`: Sprint 1 LØSTE de fleste HØY-funn (se under)

## Sammendrag
Stor fremgang siden forrige review. Sprint 1 leverte jest-expo + CI (tsc + tester), satte Sentry `environment` per profil, blokkerte `READ_MEDIA_*`-tillatelser, fjernet `expo-media-library`, publiserte konto-slette-side og dokumenterte gjenstående dashboard-punkter. Ingen HØY-funn gjenstår i kode. Restrisiko er nå hovedsakelig manuelle dashboard-steg (Supabase Pro, Play-produkter, Data safety-URL) som er godt dokumentert, samt to små kodehygiene-punkter: tom RevenueCat-nøkkel feiler stille, og `.env.example` mangler to variabler.

## Fungerer godt
1. **CI etablert** (`.github/workflows/ci.yml:23-27`): `npm run typecheck` + `npm run test:ci` på push/PR mot master. Lukker forrige reviews «ingen CI»-funn.
2. **Enhetstester med god kvalitet**: `__tests__/health.test.ts` og `varroa.test.ts` dekker grensetilfeller (null/undefined, case-insensitivitet, klamping, monotone terskler, dato-straff) — nettopp den faglig kritiske logikken.
3. **Play-tillatelser ryddet** (`app.json:33-37`): `READ_MEDIA_IMAGES/VIDEO/VISUAL_USER_SELECTED` eksplisitt i `blockedPermissions`; `expo-media-library` fjernet fra deps. Eliminerer forrige reviews mest sannsynlige avslagsgrunn.
4. **Sentry-miljø per profil** (`app/_layout.tsx:22`, `eas.json`): `environment` fra `EXPO_PUBLIC_APP_ENV`, sourcemaps kun på production (`SENTRY_DISABLE_AUTO_UPLOAD=false`).
5. **Robust oppstart**: ingen init blokkerer første render — push/RevenueCat/font-feil fanges; `getSession().catch()` tvinger `isLoading=false` (`app/_layout.tsx:48-50`).

## Funn

**[MEDIUM]** `services/subscription.ts:11,24` — Tom RevenueCat-nøkkel feiler stille: `const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? ''` og `Purchases.configure({ apiKey: ANDROID_KEY, ... })`. Mangler env-var i et bygg ⇒ konfigureres med tom streng ⇒ kjøp/tier-sync feiler diffust i prod uten tydelig årsak. — Konsekvens: betalende brukere får ikke tier, vanskelig å diagnostisere. — Løsning: kast eksplisitt feil ved tom nøkkel på Android (`if (!ANDROID_KEY) throw new Error(...)`) før `configure`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `.env.example:1-9` — Mangler `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (brukt i `subscription.ts:11`) og `EXPO_PUBLIC_APP_ENV` (brukt i `_layout.tsx:22`). Begge er reelle runtime-variabler. — Konsekvens: ny utvikler / ny EAS-oppsett glemmer dem; stille feil (over) eller feil Sentry-miljø. — Løsning: legg begge til `.env.example` med kommentar. — Innsats: S — Konfidens: HØY

**[LAV]** `app/_layout.tsx:17-25` — `Sentry.init` mangler `tracesSampleRate`/`profilesSampleRate`. Krasjrapportering virker, men ingen ytelses-/transaksjonsdata. Bevisst valg er ok, men verdt en eksplisitt `0`-kommentar for å vise at det er intensjonelt. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `lib/supabase.ts:7-11` — `throw new Error(...)` på modulnivå skjer FØR `Sentry.init` (`_layout.tsx:17`) rekker å kjøre i praksis for denne modulen (import-rekkefølge). Et bygg uten Supabase-env gir hvit skjerm uten Sentry-event. Akseptabelt som fail-fast i dev, men usynlig i prod. — Løsning: dekkes uansett av EAS env-vars som er verifisert satt; ingen handling nødvendig hvis env garanteres i CI/EAS. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `eas.json:54-58` — submit-profil `"track": "internal", "releaseStatus": "draft"`. Riktig for intern testing nå, men må huskes endret ved produksjonsrollout (lett å glemme). Dokumentert i sjekklisten — ingen kodeendring. — Innsats: S — Konfidens: HØY

**[LAV]** `.github/workflows/ci.yml` — CI kjører typecheck + tester, men ingen ESLint (ikke installert) og ingen `expo-doctor`. Ikke en regresjon (eslint fantes ikke før heller). Lavt-hengende: legg til `npx expo-doctor` som rask sanity-sjekk på avhengighets-/config-drift. — Innsats: S — Konfidens: MEDIUM

**Testdekning — neste høyest-verdi-tester (rene funksjoner, ~2-3 t totalt):**
1. `services/subscription.ts:37` `mapEntitlementToTier` — prioritet lag>profesjonell>hobbyist>starter (kritisk for betaling, lett å regrede)
2. `services/report.ts` `esc()` — HTML-escaping i PDF (XSS-relevant)
3. `services/inspection.ts` `mapInspection` / `services/hive.ts` `mapHive` — nullable-felt-robusthet (krever `export`)
4. `services/swarmReport.ts` `mapReport` — `'open'`/`'resolved'`-status
5. `constants/seasonReminders.ts` — månedsgrense-/datologikk

**Supabase keepalive (vurdert, ok):** `supabase-keepalive.yml` pinger `diseases` (offentlig SELECT-policy) hver 5. dag — trygg margin under 7-dagers auto-pause. Krever secret `SUPABASE_ANON_KEY` (sjekkes i scriptet med tydelig feilmelding). Fornuftig stopgap, men erstatter IKKE Supabase Pro (free-tier har andre begrensninger); sjekklisten holder Pro som eget punkt — korrekt.

## Lanserings-sjekkliste (sammenstilt fra kode + docs)

**Verifiserbart i kode (status):**
- ✅ Tester + CI (typecheck + jest på push/PR)
- ✅ `READ_MEDIA_*` blokkert, `expo-media-library` fjernet
- ✅ Sentry environment per profil + sourcemaps på production
- ✅ In-app konto-sletting (`profil.tsx:99`) + slette-side dokumentert live
- ✅ autoIncrement + AAB på preview/production; target API (SDK 55 → API 36) oppfyller Plays krav
- ⚠️ Tom RevenueCat-nøkkel feiler stille (funn over)
- ⚠️ `.env.example` ufullstendig (funn over)

**Må gjøres manuelt i dashboards (per `docs/lansering-sjekkliste.md`):**
- ⬜ Last opp v21 (IKKE v20 — brutt bildevalg) til Play intern testing
- ⬜ Lim slette-URL inn i Data safety + bekreft datainnsamling (posisjon «delt», foto, e-post, Sentry)
- ⬜ Supabase Pro-oppgradering (+ PITR)
- ⬜ RevenueCat-produkter aktive i Play Console + testkjøp-verifisering
- ✅ (bekreftet i docs) webhook-secret, ANTHROPIC_API_KEY, WEEKLY_ALERTS_SECRET, slette-side live
- ◻️ Manuelt: `SUPABASE_ANON_KEY` GitHub-secret må være satt for keepalive-workflow

## Topp-3 anbefalinger
1. **Kast eksplisitt feil ved tom `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`** (`subscription.ts:11`, S, ~15 min) — gjør et feilkonfigurert betalingsbygg synlig i stedet for stille tier-feil for betalende brukere.
2. **Komplettér `.env.example`** med `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` + `EXPO_PUBLIC_APP_ENV` (S, ~10 min) — fjerner siste skjulte runtime-avhengighet.
3. **Legg til de 5 neste enhetstestene** (særlig `mapEntitlementToTier` + `esc()`) og `npx expo-doctor` i CI (S-M, ~2-3 t) — utvider dekning på betalings- og PDF-logikk uten native moduler.
