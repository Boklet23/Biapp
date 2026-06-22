# Agent 13 — Testdekning og lanseringsklarhet

## Metainfo
- **Dato:** 2026-06-22 · **Review v3** · Agent 13/13 · Read-only
- **Filer lest:** `package.json`, `app.json`, `eas.json`, `tsconfig.json`, `jest.config.js`, `.env.example`, `lib/supabase.ts`, `app/_layout.tsx`, `app/(app)/_layout.tsx`, `app/(app)/(tabs)/_layout.tsx`, `services/subscription.ts`, `services/report.ts` (utdrag), `.github/workflows/ci.yml`, `.github/workflows/supabase-keepalive.yml`, `__tests__/varroa.test.ts`, `__tests__/health.test.ts`, `docs/lansering-sjekkliste.md`
- **Glob:** 2 prosjekt-testfiler (`__tests__/varroa.test.ts`, `__tests__/health.test.ts`), 2 workflows
- **Grep `console.(log|warn)` i `services/*.ts`:** 0 treff
- **Grep `Sentry` i `*.{ts,tsx}`:** 5 filer (`app/_layout.tsx`, `app/(app)/_layout.tsx`, `lib/queryClient.ts`, `components/ui/ErrorBoundary.tsx`, `components/ui/UpgradeModal.tsx`)
- **Diff mot** `reports/archive/2026-06-18/agent-13-lansering.md`

## Sammendrag
Begge MEDIUM-funn fra 18. juni er nå LØST og verifisert (ingen regresjon): `subscription.ts` kaster eksplisitt ved manglende Android-nøkkel (linje 24-26), og `.env.example` lister både `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` og `EXPO_PUBLIC_APP_ENV`. Tier-arkitekturen er forbedret — DB-tier eies av webhook, klient skriver ikke. Ingen KRITISK/HØY i kode. Restrisiko er nesten utelukkende manuelle dashboard-steg (Supabase Pro, Play-produkter, Data safety-URL), godt dokumentert. Testdekning er smal (2 filer); neste verdi ligger i `mapEntitlementToTier` + datologikk.

## Fungerer godt
1. **MEDIUM-funn lukket** — fail-fast på tom RevenueCat-nøkkel (`subscription.ts:24-26`) og komplett `.env.example` (linje 11-15). Begge tidligere funn bekreftet fikset.
2. **CI solid** (`ci.yml:23-27`): `npm run typecheck` + `npm run test:ci` på push/PR mot master, `npm ci` + Node 20.
3. **Tier-eierskap herdet** (`subscription.ts:73-83`): klient skriver ikke `subscription_tier`; webhook (service_role) eier DB-tier, `useEffectiveTier()` tar høyeste — betalende nedgraderes aldri stille ved transient profilfeil.
4. **Robust oppstart** (`app/_layout.tsx:30-50`): `getSession()` setter `isLoading=false` selv ved feil; font-/profil-/RevenueCat-feil fanges og rapporteres til Sentry uten å blokkere render.
5. **Play-tillatelser ryddet** (`app.json:33-37`): `READ_MEDIA_*` blokkert, kun CAMERA + LOCATION i `permissions`. `feed`-tab korrekt skjult (`href: null`, `(tabs)/_layout.tsx:88`).

## Funn

**[LAV]** `eas.json:52-59` — submit-profil låst til intern testing: `"track": "internal", "releaseStatus": "draft"`. Korrekt for nå, men lett å glemme ved produksjonsrollout. Dokumentert i sjekklisten. — Konsekvens: produksjonsutgivelse krever manuell endring. — Løsning: legg evt. egen `production`-track-profil. — Innsats: S — Konfidens: HØY

**[LAV]** `ci.yml` — ingen ESLint (ikke i deps) og ingen `npx expo-doctor`. Ikke regresjon. — Konsekvens: avhengighets-/config-drift fanges ikke i CI. — Løsning: legg `npx expo-doctor` som rask sanity-sjekk (krever ingen ny dep). — Innsats: S — Konfidens: MEDIUM

**[LAV]** `app/_layout.tsx:17-25` — `Sentry.init` mangler `tracesSampleRate`/`profilesSampleRate`. `enableLogs: true` er satt, krasjrapportering virker, men ingen ytelses-/transaksjonsdata. Sannsynlig bevisst. — Løsning: eksplisitt `tracesSampleRate: 0` med kommentar for å vise intensjon. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `lib/supabase.ts:7-11` — `throw` på modulnivå skjer ved import, før `Sentry.init` praktisk er aktiv for denne modulen. Bygg uten Supabase-env gir hvit skjerm uten Sentry-event. Akseptabel fail-fast siden EAS-env er verifisert satt. — Løsning: ingen hvis env garanteres i EAS/CI. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `jest.config.js:7` — `testMatch` dekker kun `**/__tests__/**/*.test.ts` (ikke `.tsx`). Greit for ren domenelogikk i dag, men en framtidig komponenttest i `.tsx` vil stille ignoreres. — Løsning: utvid til `*.test.{ts,tsx}` når komponenttester legges til. — Innsats: S — Konfidens: HØY

**Testdekning — status og neste høyest-verdi (rene funksjoner, ~2-3 t):**
Nåværende: `varroaThresholds` (7 caser, grundig) og `computeHealthScore` (9 caser, dekker varroa-nedtrapping, dato-straff, klamping) — nettopp den faglig kritiske logikken.
Neste, i prioritert rekkefølge:
1. `services/subscription.ts:41` `mapEntitlementToTier` — allerede eksportert, ingen native mock nødvendig; prioritet lag>profesjonell>hobbyist>starter (betalingskritisk). **Lavest innsats, høyest verdi.** (S)
2. `constants/seasonReminders.ts` / sesong-datologikk — månedsgrenser, skuddår. (S)
3. `services/report.ts` `esc()` — XSS-relevant HTML-escaping; krever `export` (i dag intern). (S)
4. `services/inspection.ts mapInspection` / `services/swarmReport.ts mapReport` — nullable-felt-robusthet + `'open'`/`'resolved'`; krever `export`. (M)

## Lanseringsklarhet (kode-verifisert vs manuelt)

**Verifiserbart i kode (status):**
- ✅ Tester + CI (typecheck + jest på push/PR)
- ✅ `READ_MEDIA_*` blokkert; kun CAMERA + LOCATION deklarert
- ✅ Sentry environment per profil (`_layout.tsx:22`) + sourcemaps kun production (`eas.json:42`)
- ✅ RevenueCat fail-fast + `.env.example` komplett (begge tidl. MEDIUM, nå fikset)
- ✅ `autoIncrement` + AAB på preview/production; `appVersionSource: "remote"` (`eas.json:5`) — versionCode styres av EAS-server, korrekt
- ✅ Target API: SDK 55 → API 36, oppfyller Plays krav

**Må gjøres manuelt i dashboards (per `docs/lansering-sjekkliste.md`, kan ikke kodebekreftes):**
- ⬜ Last opp v21 (IKKE v20 — brutt bildevalg) til Play intern testing
- ⬜ Lim slette-URL (`…/Biapp/slett-konto.html`) i Data safety + bekreft datainnsamling (posisjon delt, foto, e-post, Sentry)
- ⬜ **Supabase Pro** (auto-pause; keepalive-workflow er kun stopgap, ikke erstatning)
- ⬜ RevenueCat-produkter aktive i Play Console + testkjøp-verifisering
- ◻️ `SUPABASE_ANON_KEY` GitHub-secret må være satt (keepalive feiler tydelig uten — `supabase-keepalive.yml:22-25`)
- ✅ (docs-bekreftet) webhook-secret, ANTHROPIC_API_KEY, WEEKLY_ALERTS_SECRET, slette-side live, Supabase ACTIVE_HEALTHY

## Topp-3 anbefalinger
1. **Legg til `mapEntitlementToTier`-test** (S, ~20 min) — eksportert, ingen native mock, dekker betalingskritisk prioritetslogikk. Høyest verdi/innsats av all gjenstående testing.
2. **Fullfør de manuelle dashboard-stegene** (særlig Supabase Pro + Data safety-URL) — eneste reelle lanseringsblokkere; alt kodbart er levert.
3. **Legg `npx expo-doctor` i CI** + utvid `jest.config testMatch` til `.tsx` (S, ~30 min) — billig framtidssikring mot config-drift og stille-ignorerte komponenttester.
