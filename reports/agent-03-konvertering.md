# Agent 3 — Konvertering og monetisering

## Metainfo
- Filer lest: `services/subscription.ts`, `hooks/useEffectiveTier.ts`, `components/ui/UpgradeModal.tsx`, `components/ui/ProGate.tsx`, `components/inspection/Step3.tsx`, `components/info/HoneyForecastChart.tsx` (grep), `app/(app)/(tabs)/kuber/[id]/index.tsx`, `kuber/[id]/inspeksjon/ny.tsx`, `kuber/sammenlign.tsx`, `kuber/ny.tsx`, `kuber/index.tsx`, `laer/index.tsx` (grep), `hjem/index.tsx`, `app/(auth)/onboarding.tsx` (grep), `app/(app)/profil.tsx` (grep), `supabase/migrations/0013_hive_starter_limit.sql`, `0017_trial_period.sql`, `0034_tier_lock.sql`, `supabase/functions/` (grep)
- Filer ikke funnet: ingen
- Diff mot forrige review (`reports/archive/2026-06-12/agent-03-konvertering.md`): lest. **Fikset i Sprint 1+:** (1) klient-kubegrense bruker nå `useEffectiveTier` (`kuber/ny.tsx:140`, `kuber/index.tsx:37`) — trial-brukere passerer; (2) statistikk-gate får nå `effectiveTier` (`laer/index.tsx:101`) → HoneyForecastChart trial-aware; (3) ProGate har oppgraderings-CTA + UpgradeModal (`ProGate.tsx:26-48`); (4) Sentry logges ved RC-pakke-miss (`UpgradeModal.tsx:114`); (5) Lag-rad flyttet under «Siste inspeksjon». **Ikke fikset:** trial-utløps-funnel, DB-policy trial-sjekk (nå [REGRESJON]-risiko), social proof, sesong-urgency, prisanker i nudge, «(demo)»-merking.

## Sammendrag (maks 80 ord)
Funnelen er nå moden: AI-demo med opplåsings-CTA, kubegrense etter verdi, trial-aware klientgates, årlig default. Sprint 1 lukket de fleste forrige funn. To gjenstår tungt: (1) DB-policy 0013 sjekker fortsatt rå `subscription_tier != 'starter'`, så trial-brukere som klienten slipper gjennom på kube #4 avvises av databasen — løfte og opplevelse spriker. (2) Ingen konverteringsmekanisme ved trial-utløp; appens høyeste-intent-øyeblikk passerer stille.

## Fungerer godt (maks 5 punkter)
1. **AI-gate som selger** (`Step3.tsx:120-145`): låst knapp + demo-resultatkort med behandlingsanbefaling + «Lås opp AI-analyse →». Viser verdi før betaling.
2. **Trial-aware klientgates** (`kuber/ny.tsx:140`, `kuber/index.tsx:37`, `laer/index.tsx:101`): kubegrense og statistikk bruker nå `useEffectiveTier` — trial gir reell Hobbyist i UI. Forrige HØY langt på vei løst.
3. **UpgradeModal-mekanikk**: årlig default + «Spar 3 mnd» (`:191`), ROI-banner «redde en bikube verdt 3 000–8 000 kr» (`:200`), «Mest populær» på Hobbyist, «Gjenopprett tidligere kjøp» (`:250`), `userCancelled` håndtert stille (`:136`), Sentry på pakke-miss (`:114`).
4. **Graceful nedgradering**: `useEffectiveTier` faller til starter uten datatap — kuber beholdes (0013 gjelder kun INSERT).
5. **Trial-banner med nedtelling** (`hjem/index.tsx:407-419`) + permanent nudge for Starter etter utløp (`:388-398`).

## Funn

**[HØY]** `0013_hive_starter_limit.sql:11` — DB-INSERT-policy bruker rå tier mens klienten nå bruker effektiv tier: `(SELECT subscription_tier FROM profiles WHERE id = auth.uid()) != 'starter'`. Trial-brukeren har `subscription_tier = 'starter'` i DB (trial = kun `trial_expires_at`), men klienten (`kuber/ny.tsx:140`) slipper hen forbi kube #3 fordi `effectiveTier === 'hobbyist'`. — Konsekvens: Trial-bruker fyller skjemaet for kube #4, trykker Lagre, og `createHive` feiler på RLS-policyen. Toast viser rå feil (`onError`), ikke oppgraderingstilbud. Onboarding lover «14 dager gratis Hobbyist» + «Ubegrenset antall kuber» — løftet brytes ved databasen. Dette er en [REGRESJON]-klasse: klientfiksen i Sprint 1 introduserte sprik mot serveren. — Løsning: utvid policyen med `OR (SELECT trial_expires_at FROM profiles WHERE id = auth.uid()) > now()`. — Innsats: S — Konfidens: HØY

**[HØY]** `hooks/useEffectiveTier.ts:35-42` + `hjem/index.tsx:388` — Ingen konvertering ved trial-utløp. `useTrialDaysLeft` returnerer `null` ved utløp; banneret byttes stille til generisk nudge. Grep «trial» i `services/` og `supabase/functions/` gir null treff utenom AI-månedsgrense — ingen push «trialen utløper i morgen», ingen utløps-skjerm med tilbud. — Konsekvens: Høyeste kjøpsintensjons-øyeblikk (dag 12–14, bruker har data + vaner) passerer uten CTA. Konkurrentene bygger funnelen rundt dette. — Løsning: lokal scheduled notification dag 12 + «trial utløpt»-modal med årsrabatt ved første åpning etter utløp. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `kuber/[id]/index.tsx:300-319` + `:378-381` — Samarbeid-raden er flyttet under «Siste inspeksjon» (bra), men trykk på låst rad åpner generisk `<UpgradeModal>` UTEN Lag-kontekst — ingen `title`/`subtitle`. Bruker som trykket «🔒 Samarbeid (Lag)» møter «Velg abonnement» med Hobbyist øverst som «Mest populær», ikke Lag. — Konsekvens: kontekst-tap; 499kr-funksjonen selges ikke der intensjonen oppstår. — Løsning: send `title="Samarbeid med Lag"` + Lag-spesifikk subtitle. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `UpgradeModal.tsx:23-71` — Ingen social proof og ingen sesong-urgency i salgsteksten. ROI-banneret er bra, men juni-lansering gjør sesongkoblingen gratis å utnytte («Svermesesong nå — AI-analysen fanger varroa før kollaps»). Ingen «X norske birøktere bruker BiVokter». — Konsekvens: svakere konvertering enn mulig; tap-aversjon og flokk-effekt uutnyttet. — Løsning: legg urgency-linje (sesongavhengig) + et nøkternt bruker-/anmeldelsestall når data finnes. — Innsats: S — Konfidens: MEDIUM

**[MEDIUM]** Prisvurdering (websøk): Hobbyist 49 kr/mnd (33 kr/mnd årlig) er konkurransedyktig. HiveTracks Pro: $69,99/år / $6,99 mnd (≈70 kr/mnd) ([hivetracks.zendesk.com](https://hivetracks.zendesk.com/hc/en-us/articles/22127237490203-What-is-HiveTracks-Pro), [hivetracks.com/pro](https://www.hivetracks.com/pro)). BeeKeepPal Pro ≈ $9,99/mnd, 20% årsrabatt ([beekeeppal.com](https://www.beekeeppal.com/subscription/beekeeppal-pro-monthly-subscription/)). Profesjonell 149 kr/mnd er 1,5–2× over konsument-konkurrenter — forsvarlig bare hvis ubegrenset AI + Mattilsynet-eksport selges hardt; 3×-gapet Hobbyist→Pro er aggressivt men har reelt innhold. Lag 499 kr OK mot kommersielle verktøy. Konkurrentene gir 30 dagers trial mot BiVokters 14. — Løsning: behold priser; vurder 30 dagers trial og «per kube»-forankring. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `hjem/index.tsx:395` — Permanent nudge «🚀 Ubegrenset kuber · AI-analyse · Rapporter» mangler fortsatt prisanker. — Løsning: «fra 33 kr/mnd». — Innsats: S — Konfidens: HØY

**[LAV]** `Step3.tsx:133` — «12 mitter (demo)» kan misforstås som ekte måling; «Slik ser et AI-resultat ut» er tydeligere salgs- og UX-tekst. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `kuber/sammenlign.tsx:47` — `ProGate` rendres etter at `useQuery` allerede har kjørt (riktignok `enabled: hasPro`, så ingen nettkall), men gaten gir ren tekstvegg uten blurret eksempelgraf bak. Normalflyt intercepts i `kuber/index.tsx:178` (åpner modal direkte), så ProGate treffes sjelden ved deep-link. — Løsning: legg blurret eksempeltabell bak ProGate for «se hva du får». — Innsats: M — Konfidens: MEDIUM

## Topp-3 anbefalinger
1. **Lukk klient↔DB-spriket for trial** — utvid policy 0013 med `OR trial_expires_at > now()`. Innsats: S (30 min). Effekt: fjerner [REGRESJON]-risiko der trial-bruker avvises på kube #4 tross «ubegrenset»-løfte; uten dette feiler den lovede trial-opplevelsen hardt.
2. **Bygg trial-utløps-funnel** — scheduled push dag 12 + utløpsmodal med årstilbud ved første åpning etter utløp. Innsats: M (3–4 t). Effekt: konvertering på høyeste-intent-øyeblikk; bransjestandard hos konkurrentene.
3. **Skjerp salgsteksten** — Lag-kontekst i samarbeid-modal, sesong-urgency + social proof i UpgradeModal, prisanker i hjem-nudge, «(demo)» → «Slik ser et AI-resultat ut». Innsats: S×4 (2 t samlet). Effekt: tetter konteksttap og hever konverteringsrate uten ny infrastruktur.
