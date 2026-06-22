# Agent 3 — Konvertering og monetisering

## Metainfo
- Dato: 2026-06-22 (review v3). Agent 3 av 13. Read-only.
- Filer lest: `services/subscription.ts`, `hooks/useEffectiveTier.ts`, `components/ui/UpgradeModal.tsx`, `components/ui/ProGate.tsx`, `components/inspection/Step3.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `kuber/[id]/inspeksjon/ny.tsx`, `kuber/[id]/samarbeid.tsx`, `kuber/sammenlign.tsx`, `kuber/sesongsammenligning.tsx`, `hjem/index.tsx`, `app/(auth)/onboarding.tsx` (grep), migrasjoner `0017_trial_period.sql`, `0034_tier_lock.sql`, `0046_restore_hive_limit.sql`, `0052_drop_legacy_hive_insert_policy.sql`.
- Websøk: HiveTracks Pro, BeeKeepPal Pro (kilder under Funn).
- Diff: `reports/archive/2026-06-18/agent-03-konvertering.md` lest.

## Sammendrag (maks 80 ord)
[REGRESJON] fra forrige runde er VERIFISERT FIKSET: 0052 dropper rå 0013-policy, og 0046-triggeren — som anerkjenner trial — er eneste håndhever. Klient og DB er nå i tråd. Funnelen er solid: AI-demo, trial-aware gates, årlig default, restore. Hovedmangelen er uendret og kritisk for konvertering: ingen trial-utløps-funnel (push/modal) på dag 12–14. Sekundært gjentar samarbeid-modal-konteksttapet seg, og salgsteksten mangler social proof + sesong-urgency.

## Fungerer godt (maks 5 punkter)
1. **Trial↔DB-spriket lukket** (`0052:9-11` + `0046:36-38`): policy er nå ren eierskaps-sjekk `auth.uid() = user_id`; triggeren slipper trial gjennom `IF v_trial > now() RETURN NEW`. Tidligere [REGRESJON] er borte.
2. **AI-gate som selger** (`Step3.tsx:120-145`): låst knapp + demo-resultatkort med behandlingsanbefaling + «Lås opp AI-analyse →». Verdi før betaling.
3. **Trial-aware gates konsekvent** (`ny.tsx:64-65`, `sammenlign.tsx:27`, `sesongsammenligning.tsx:108`): alle bruker `useEffectiveTier`/`tierAtLeast`.
4. **UpgradeModal-mekanikk**: årlig default + «Spar 3 mnd» (`:192`), ROI-banner (`:200`), «Mest populær» (`:212`), restore (`:254`), `userCancelled` stille (`:136`), Sentry på pakke-miss (`:114`).
5. **Graceful nedgradering**: tier eies av webhook; ingen kube-datatap (kun INSERT-/reaktiveringsgrense via trigger).

## Funn

**[HØY]** `hjem/index.tsx:392-405` + `useEffectiveTier.ts:35-42` — Ingen konvertering ved trial-utløp. `useTrialDaysLeft` returnerer `null` ved utløp; banneret byttes stille til den generiske nudge-en. Ingen scheduled push «trialen utløper i morgen», ingen utløps-modal med tilbud ved første åpning etter utløp. — Konsekvens: Høyeste-intent-øyeblikket (dag 12–14, bruker har data + vaner) passerer uten CTA; dette er det enkeltpunktet med størst konverteringspotensial. — Løsning: lokal `expo-notifications` scheduled notification dag 12 + «trial utløpt»-modal med årsrabatt ved første åpning der `trialExpiresAt < now()` og `effectiveTier === 'starter'`. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `kuber/[id]/index.tsx:378-381` — Samarbeid-raden («🔒 Samarbeid (Lag)», `:316`) åpner generisk `<UpgradeModal>` UTEN `title`/`subtitle`. Bruker som trykker for Lag-funksjon møter «Velg abonnement» med Hobbyist øverst som «Mest populær» — ikke Lag. — Konsekvens: konteksttap; 499kr-funksjonen selges ikke der intensjonen oppstår. Identisk funn som forrige runde, ikke fikset. — Løsning: `title="Samarbeid med Lag"` + Lag-spesifikk subtitle. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `UpgradeModal.tsx:23-71`, `:198-202` — Ingen social proof, ingen sesong-urgency. ROI-banneret er bra, men juni-lansering gjør sesongkoblingen gratis å utnytte («Svermesesong nå — AI fanger varroa før kollaps»). Mangler «X norske birøktere bruker BiVokter». — Konsekvens: tap-aversjon og flokk-effekt uutnyttet; svakere konvertering enn mulig. — Løsning: sesongavhengig urgency-linje + nøkternt brukertall når data finnes. — Innsats: S — Konfidens: MEDIUM

**[MEDIUM]** Prisvurdering (websøk) — Hobbyist 49 kr/mnd (33 kr/mnd årlig) er konkurransedyktig. HiveTracks Pro: $69,99/år (≈70 kr/mnd) eller $9,99/mnd, gratis opp til 5 kuber ([hivetracks.com/pro](https://www.hivetracks.com/pro), [zendesk](https://hivetracks.zendesk.com/hc/en-us/articles/22127237490203-What-is-HiveTracks-Pro)). BeeKeepPal Pro ≈$9,99/mnd, 20% årsrabatt ([beekeeppal.com](https://www.beekeeppal.com/subscription/beekeeppal-pro-monthly-subscription/)). Profesjonell 149 kr/mnd er ~1,5–2× over konsument-konkurrentene; 3×-gapet Hobbyist→Pro er aggressivt men har reelt innhold (ubegrenset AI + Mattilsynet-eksport). Konkurrentene gir ofte 30 dagers trial mot BiVokters 14. — Løsning: behold priser; vurder 30 dagers trial. — Innsats: S — Konfidens: MEDIUM

**[MEDIUM]** Ingen gratis «lead magnet» for AI — Starter får 0 AI-analyser; gates ved første trykk (`ny.tsx:65 isAiLocked = effectiveTier === 'starter'`). Trial gir tilgang, men etter utløp er AI helt stengt. Demo-kortet viser verdi, men brukeren har aldri kjørt sin egen analyse. — Konsekvens: konverteringen hviler på trial alene; uten trial-funnel (HØY over) er det ingen «aha». — Løsning: vurder 1 gratis ekte AI-analyse per Starter-bruker (livstid) som dokumentert konverteringstaktikk. — Innsats: M — Konfidens: MEDIUM

**[LAV]** `hjem/index.tsx:402` — Permanent nudge «🚀 Ubegrenset kuber · AI-analyse · Rapporter» mangler prisanker. — Løsning: «fra 33 kr/mnd». — Innsats: S — Konfidens: HØY

**[LAV]** `Step3.tsx:133` — «12 mitter (demo)» kan misforstås som ekte måling. «Slik ser et AI-resultat ut» er tydeligere salgs-/UX-tekst. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `sammenlign.tsx:47`, `ProGate.tsx:18-33` — ProGate gir ren tekstvegg uten blurret eksempel bak «se hva du får». Treffes sjelden (normalflyt via `kuber/index.tsx` åpner modal direkte), men deep-link/sesongsammenligning lander her. — Løsning: blurret eksempeltabell bak ProGate. — Innsats: M — Konfidens: MEDIUM

## Topp-3 anbefalinger
1. **Bygg trial-utløps-funnel** (HØY) — scheduled push dag 12 + utløpsmodal med årstilbud ved første åpning etter utløp. Innsats: M (3–4 t). Effekt: konvertering på appens høyeste-intent-øyeblikk; bransjestandard hos konkurrentene. Eneste gjenstående store hull etter at [REGRESJON] er lukket.
2. **Skjerp salgsteksten** (MEDIUM×3, S hver) — Lag-kontekst i samarbeid-modal (`title`/`subtitle`), sesong-urgency + social proof i UpgradeModal, prisanker i hjem-nudge, «(demo)»→«Slik ser et AI-resultat ut». Samlet ~2 t, hever rate uten ny infrastruktur.
3. **Vurder lead magnet + 30 dagers trial** (MEDIUM) — 1 gratis ekte AI-analyse for Starter gir personlig «aha»; 30 dager matcher HiveTracks/BeeKeepPal og gir mer datagrunnlag før beslutning. Innsats: M.
