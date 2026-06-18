# Syntese — Prioritert handlingsplan for BiVokter

Multi-agent review v3 (13 agenter) konsolidert. Generert: 2026-06-12.
Kontekst: pre-lansering (intern testing, versionCode ~19), én utvikler + Claude, mål 100 betalende første sesong. Juni = svermetid — time-to-market har egenverdi.

**Rapporter lest:** agent-01 … agent-13 (13/13) + arkivert syntese 2026-06-10.
**Status siden sist:** 8 av 10 «denne uken»-punkter fra forrige plan er verifisert fikset (Sentry-import, samarbeid-rute, trial-onboarding, webhook-rekkefølge, FAB-kontrast, mutation-toast, varroa-terskler, 0040–0045). Men 0039-ytelsesmigrasjonen innførte samtidig en **regresjon** som fjernet server-side kubegrense, og forrige plans DB-indeks ble aldri kjørt.

---

## 1. Konsensus-funn (matrise)

13 agenter med stramt adskilte scope gir få 3+-overlapp; funn rapportert uavhengig av 2+ agenter regnes her som konsensus og vektes opp. Ett funn har 3 agenter.

| # | Funn | Agenter | Grad |
|---|------|---------|------|
| K1 | **Server-side tier-håndhevelse er brutt**: profiles-UPDATE uten WITH CHECK/kolonnebegrensning (bruker kan sette egen tier='lag'+tier_locked) + 0039 droppet 3-kube-grensen fra 0013/0020 | 8 (KRITISK), 12 (HØY REGRESJON), 3 (relatert: tier-gates inkonsistente) | KRITISK |
| K2 | **Push med `hiveId` deep-linker ingen steder** — kun `eventId` håndteres; ingen kald-start-håndtering | 1 (HØY ×2), 10 (HØY) | HØY |
| K3 | **Kubefoto lagres som 1-årig signed URL** — dør etter 365 dager | 7 (LAV), 8 (LAV), 12 (MEDIUM) — *eneste 3-agent-funn* | MEDIUM |
| K4 | **Trial gir ikke det onboarding lover** — kubegrense/statistikk sjekker rå `subscription_tier`, ikke `useEffectiveTier` | 3 (HØY), 11 (implisitt: trial-løftet «innfris» kun for AI-gaten) | HØY |
| K5 | **ProGate er konverterings-blindvei** (kun «Tilbake»-knapp) | 1 (MEDIUM), 3 (MEDIUM) | MEDIUM |
| K6 | **ActivationGuide steg 1+2 peker begge på kubelisten**, ikke ny-kube/wizard | 1 (LAV), 11 (MEDIUM) | MEDIUM |
| K7 | **analyze-varroa mangler timeout begge veier** + ubeskåret base64-foto (2–4 MB) | 6 (MEDIUM), 7 (MEDIUM), 12 (MEDIUM) | MEDIUM |
| K8 | **`select('*')` i 15 queries** | 6 (MEDIUM), 12 (MEDIUM) | MEDIUM |
| K9 | **DB-indeks `inspections(user_id, hive_id, inspected_at DESC)` mangler** — ufikset fra forrige review | 6 (HØY), 12 (MEDIUM) | HØY |
| K10 | **tier_locked respekteres ikke konsekvent** — webhook-update ignorerer flagget; klient-sync svelger lesefeil | 12 (MEDIUM), 7 (LAV) | MEDIUM |

---

## 2. Konflikter — løst eksplisitt

**Konflikt 1: Polere vs. shippe (Agent 2/9 vs. 13).** Agent 2 vil ha Typography-migrering (L) og ikonsett; Agent 9 vil ha fullt a11y-løft; Agent 13 viser at Play-policy-blokkere og null tester er den reelle risikoen. **Avgjørelse:** Ship-blokkere først. Av design/a11y gjøres KUN det som treffer konverteringsflater og lovrisiko billig: kontrast-tokens (S–M) og fontFamily på UpgradeModal/auth (M). Typography-/Radii-migrering og lucide-ikoner utsettes — de flytter ikke 100-betalende-målet i juni.

**Konflikt 2: Varseltillatelse tidlig (retention-kanal) vs. sent (aksept-rate) (Agent 10 vs. 11).** Agent 10 er avhengig av push som primær retention-kanal; Agent 11 vil fjerne OS-prompten fra oppstart. **Avgjørelse:** Følg Agent 11 — Android 13+ gir i praksis ett forsøk, og prompt-før-verdi senker aksept, som *skader* Agent 10s kanal. Flytt prompten til ActivationGuide steg 3 (etter første kube) med forklarende pre-prompt. Dette maksimerer kanalen begge agenter bryr seg om.

**Konflikt 3: Flere varsler (oksalsyre, win-back) vs. varslingstretthet (Agent 10 internt + 7).** **Avgjørelse:** Legg til de to sesongkritiske vinterpåminnelsene nå (S, domene-naturlige), men utsett win-back/last_seen til etter lansering, og la server eie «forfalt inspeksjon» når dedup-arbeidet gjøres — ikke øk volum før kilde-konsolidering.

**Konflikt 4: Trial-synlighet nå vs. etter aha (Agent 3 vs. 11).** Som i forrige syntese: ikke reell konflikt. Trialen kommuniseres passivt (banner finnes), aktiv selger-CTA ved utløp (dag 12–14). Nytt i denne runden: trialen må først faktisk *virke* (K4) før utløps-funnelen bygges — avhengighet, ikke konflikt.

**Konflikt 5: `select('*')`-slanking vs. defensiv mapX (Agent 6/12 vs. 5).** Samme løsning som sist: kolonnelister utledes fra mapX()-feltene. Rekkefølge-avhengighet. Utsettes til etter lansering (lav reell gevinst ved <100 brukere).

---

## 3. Falsifisering — stikkprøve 5 KRITISK/HØY-funn

Alle 5 lest i koden av syntese-agenten selv:

| Funn | Kilde | Verifikat | Holdt? |
|------|-------|-----------|--------|
| profiles-UPDATE uten WITH CHECK/kolonnebegrensning | A8 KRITISK | `0039_rls_subselect_auth_uid.sql:9` — `FOR UPDATE USING ((SELECT auth.uid()) = id)`, ingen WITH CHECK, ingen GRANT-begrensning | ✅ |
| 0039 droppet 3-kube-grensen | A12 HØY | `0039:12-16` gjenskaper `hives: opprett egne`/`oppdater egne` med kun uid-sjekk; `0013:8-18` og `0020:19-29` hadde tier+count-logikken | ✅ |
| Push `hiveId` rutes ingen steder | A1+A10 HØY | `app/(app)/_layout.tsx:39-44` — kun `eventId` håndteres; ingen `getLastNotificationResponseAsync` | ✅ |
| Trial-gates sjekker rå tier | A3 HØY | `kuber/ny.tsx:137` — `profile?.subscriptionTier === 'starter' && cachedHives.length >= 3` (ikke useEffectiveTier) | ✅ |
| READ_MEDIA_IMAGES + ubrukt expo-media-library | A13 HØY | `app.json:32-33` (begge permissions) + `:59` (plugin) | ✅ |

**Resultat: 5/5 holdt vann.** Full tillit til agentenes funn; ingen nedjustering.

---

## 4. Topp-20 ROI-tabell

Score = (2E + 2R) × I / 10. E = effekt på lansering/konvertering/retention, R = risikoreduksjon (5 ved KRITISK), I = innsats invertert (5=S … 1=XL).

| # | Tiltak | E | R | I | Score | Agent(er) | Fil-referanser |
|---|--------|---|---|---|-------|-----------|----------------|
| 1 | Fjern `READ_MEDIA_IMAGES` + `expo-media-library` | 5 | 3 | 5 | **8.0** | 13 | `app.json:32-33,59`, `package.json` |
| 2 | Gjenopprett 3-kube-grense i hives-RLS (0039-regresjon) | 3 | 5 | 5 | **8.0** | 12, 8 | ny migrasjon; jf. `0013`, `0020`, `0039:12-17` |
| 3 | Steng profiles-tier-bypass (kolonne-GRANT eller BEFORE UPDATE-trigger) | 4 | 5 | 4 | **7.2** | 8 | `0039:9`, ny migrasjon |
| 4 | Wizard-draft: lagre foto/AI-resultat/dato | 3 | 4 | 5 | **7.0** | 7 | `inspeksjon/ny.tsx:40-54` |
| 5 | Konto-slette-web-URL + Data safety-skjema | 5 | 3 | 4 | **6.4** | 13 | ekstern side; `profil.tsx:93` |
| 6 | Flytt/guard `reset_and_rebuild.sql` | 1 | 5 | 5 | **6.0** | 12 | `supabase/migrations/reset_and_rebuild.sql` |
| 7 | `queryClient.clear()` ved SIGNED_OUT | 2 | 4 | 5 | **6.0** | 7 | `store/auth.ts:32-41`, `app/_layout.tsx:62-71` |
| 8 | EFB `isNotifiable: true` + liten kubebille/steinyngel | 2 | 4 | 5 | **6.0** | 4 | `constants/diseases.ts:53` |
| 9 | Webhook: respekter `tier_locked`, fjern SUBSCRIBER_ALIAS fra downgrade + fiks svelget lesefeil i klient-sync | 3 | 3 | 5 | **6.0** | 12, 7 | `revenuecat-webhook/index.ts:7,102-105`, `subscription.ts:75-81` |
| 10 | Trial = ekte Hobbyist (useEffectiveTier overalt + trial-sjekk i DB-policy) | 5 | 2 | 4 | **5.6** | 3 | `kuber/index.tsx:35`, `ny.tsx:137`, `laer/index.tsx:99`, 0013-erstatter |
| 11 | Fiks stille `fetchProfile`-feil (betalende nedgraderes ved transient feil) | 4 | 3 | 4 | **5.6** | 5 | `services/profile.ts:31`, `app/_layout.tsx:53` |
| 12 | Push deep-link `hiveId` + kald-start (`getLastNotificationResponseAsync`) | 4 | 1 | 5 | **5.0** | 1, 10 | `app/(app)/_layout.tsx:35-47` |
| 13 | Varseltillatelse ut av oppstart → ActivationGuide steg 3 | 4 | 1 | 5 | **5.0** | 11 | `app/(app)/_layout.tsx:18-23`, `ActivationGuide.tsx:79-90` |
| 14 | DB-indekser ×3 (user/hive/date-composite, swarm-status, hives-geo) | 3 | 2 | 5 | **5.0** | 6, 12 | ny migrasjon; jf. `0038:4` |
| 15 | Oksalsyre- (nov) + vintersjekk-påminnelse (jan) | 3 | 2 | 5 | **5.0** | 10, 4 | `constants/seasonReminders.ts:10-53` |
| 16 | Sentry-logging ved RC-pakke-miss | 3 | 2 | 5 | **5.0** | 3 | `UpgradeModal.tsx:113-119` |
| 17 | Kontrast-pass: `honeyText`-token, muted→mid, fanetekst, Toast | 3 | 3 | 4 | **4.8** | 9, 2 | `constants/colors.ts:23`, `Button.tsx:101`, `hjem:868`, `_layout.tsx:19` |
| 18 | Trial-utløps-funnel (push dag 12 + utløpsmodal) | 4 | 1 | 4 | **4.0** | 3 | `useEffectiveTier.ts:28-35`, `hjem:381-413` |
| 19 | Analytics: 8 events (app_open … purchase_completed) | 4 | 1 | 4 | **4.0** | 10, 13 | nytt; PostHog/Amplitude |
| 20 | Glemt passord + stille Google-feil på welcome | 4 | 1 | 4 | **4.0** | 11 | `login.tsx`, `welcome.tsx:114` |

Like under streken (score 4.0, gjøres når naturlig): AI-foto-resize + timeout/retry (6/7/12, K7), «Start inspeksjon» ≤2 trykk (1), ActivationGuide-deep-links + CTA-konsolidering (1, 11), jest-expo + 10 tester + CI (13 — løftes inn i sprinten av risikohensyn), dataeksport + AI-transparens (8).

---

## 5. Denne uken (< 8 t totalt)

| Tiltak | Tid | Slik verifiserer du |
|--------|-----|---------------------|
| 1. Migrasjon: gjenopprett hives-INSERT/UPDATE-policy med tier+count (0013/0020-logikk i subselect-form) **og** trial-vindu (`OR trial_expires_at > now()`) | 1,5 t | Som starter-bruker uten trial: REST-kall som inserter kube #4 → skal feile med RLS-error. Med aktiv trial → skal lykkes |
| 2. Migrasjon: lås profiles-kolonner (`REVOKE UPDATE ON profiles FROM authenticated; GRANT UPDATE (display_name, experience_level, push_token) ...`) | 1,5 t | Innlogget testbruker: `supabase.from('profiles').update({ subscription_tier: 'lag' })` → skal feile. Push-token-registrering og profilredigering i appen skal fortsatt virke |
| 3. Fjern `READ_MEDIA_IMAGES`/`READ_MEDIA_VISUAL_USER_SELECTED` + `expo-media-library` fra app.json/package.json | 0,5 t | Nytt preview-bygg: bildevalg i kube/inspeksjon virker fortsatt (Photo Picker); sjekk manifest at permissions er borte |
| 4. Flytt `reset_and_rebuild.sql` til `scripts/dev/` | 0,2 t | Filen finnes ikke lenger under `supabase/migrations/` |
| 5. Push-ruting: `hiveId` → `/kuber/[id]` + `getLastNotificationResponseAsync` ved oppstart | 1 t | Send testpush med `{hiveId}`; trykk med appen drept → lander på riktig kubeprofil |
| 6. `queryClient.clear()` ved SIGNED_OUT-event (+ ved bruker-ID-bytte) | 0,3 t | Logg ut konto A (revoker sesjon server-side), logg inn konto B → kubelisten viser aldri As kuber |
| 7. EFB `isNotifiable: true` (+ legg inn liten kubebille-oppføring) | 0,5 t | Åpne «Europeisk yngelråte» i Info-fanen → meldeplikt-banner med Mattilsynet-nummer vises |
| 8. Webhook: `.eq('tier_locked', false)` + fjern SUBSCRIBER_ALIAS fra DOWNGRADE_EVENTS; kortslutt tier-sync ved lesefeil i `subscription.ts:75-81` | 0,7 t | Simuler EXPIRATION-event mot testbruker med `tier_locked=true` → tier uendret i DB |
| 9. Utvid wizard-`DraftState` med `photoUris`/`varroaAiResult`/`inspectedAt` | 1 t | Velg foto + kjør AI-analyse i wizard, drep appen, åpne igjen → foto og AI-resultat gjenopprettet |

Sum: ~7,2 t. Punkt 1+2 er **lanseringsblokkere** — gjør dem først.

---

## 6. Sprint (2 uker) — i rekkefølge, med avhengigheter

1. **Tier-integritet komplett** (avhenger av uke-punkt 1+2): bytt til `useEffectiveTier`/`tierAtLeast` i kubegrense (`kuber/index.tsx:35`, `ny.tsx:137`) og statistikk (`laer/index.tsx:99`); fiks stille `fetchProfile`-feil (retry / React Query). Trialen leverer da det onboarding lover, og betalende mister aldri tilgang ved transient feil. (~5 t)
2. **Play-/GDPR-pakken** (uavhengig, kan parallellføres): konto-slette-webside publiseres (samme GitHub Pages som privacy), Data safety-skjema fylles (posisjon deles med andre via svermkart = «shared»), AI-transparenstekst ved analyse + synlighetsnotis i svermrapport-modal, gratis dataeksport-funksjon (art. 20). (~1 dag)
3. **Konverteringsfunnel**: trial-utløps-push (dag 12, lokal scheduled) + utløpsmodal med årstilbud; ProGate får oppgrader-CTA; Sentry på RC-pakke-miss; prisanker i hjem-nudge. (avhenger av 1 — trialen må virke før den selges) (~1 dag)
4. **Aktivering/onboarding**: varseltillatelse flyttes til ActivationGuide steg 3; glemt passord-lenke; Google-feil på welcome vises; ActivationGuide steg 1→`/kuber/ny`, steg 2→wizard; «Start inspeksjon» ≤2 trykk fra Hjem; trykkbar tom-tilstand i Kuber. (~1 dag)
5. **Måling + sikkerhetsnett**: analytics-events (8 stk — uten dette kan effekten av alt over ikke måles); DB-indeks-migrasjonen (×3); jest-expo + de 10 testene fra Agent 13 + GitHub Actions med `tsc --noEmit` + jest; AI-foto-resize + 30 s timeout/«Prøv igjen»; kontrast-pass på tokens; Sentry `environment`. (~2 dager)

---

## 7. Etter lansering (3 mnd) — strategisk

- **Offline-persistering** av React Query-cache + NetInfo-banner (A7) — viktigste felt-robusthetsløft; bevisst rett etter lansering fremfor før.
- **Skaler weekly-hive-alerts** (paginering/RPC) + konsolider «forfalt»-varsling til server-eid kilde (A12, A10). Irrelevant under ~5k brukere.
- **Retention-progresjon**: monter HoneyWidget, år-for-år i SeasonSummaryCard, milepæler, `last_seen_at` + win-back (A10).
- **Domeneutvidelse**: sykdoms-/droneyngel-/lukt-felt i wizarden (datalaget finnes), strukturert behandlingsjournal med virkestoff/tilbakeholdelse (Mattilsynet-journal = Profesjonell-salgsargument), maursyre i anbefalingene, korrektur («yngelrotte»/«svirming») (A4).
- **Designsystem-håndhevelse**: Typography-migrering via AppText-wrapper, Radii-opprydding, lucide-ikoner i tab-bar, severityColor()-util, skeletons (A2).
- **A11y-fullføring**: tekstskalering (minHeight + maxFontSizeMultiplier), a11y-labels i Weight/Treatment/Queen/Harvest-modaler, Toast-liveRegion (A9). Lovkrav — påbegynt via kontrast-passet i sprinten.
- **Teknisk gjeld**: splitt `hjem/index.tsx` (976 linjer), felles `storageUpload`/`useHiveForm`/datoformat-lib, kolonnelister i stedet for `select('*')`, photo_url → storage-path med on-demand signering (K3, 3 agenter), TTL på `revenuecat_processed_events`, CHECK-constraints, AI-kvote-atomisitet, timing-safe webhook-compare.

---

## 8. Ikke gjør (nå)

- **Ikke aktiver feed-fanen** — tom feed ved <100 brukere skader mer enn den gagner (A10s egen anbefaling). Behold sovende.
- **Ikke kjør Typography-/Radii-fullmigrering eller ikonsett-bytte før lansering** (A2) — L-innsats, null effekt på blokkere. Kun fontFamily på UpgradeModal/auth tas i sprinten.
- **Ikke paginer weekly-hive-alerts nå** (A12 HØY) — degraderer først ved 5–10k brukere; målet er 100.
- **Ikke endre priser eller trial-lengde til 30 dager** (A3 MEDIUM) — vent på konverteringsdata fra faktiske brukere; analytics må først finnes.
- **Ikke splitt `hjem/index.tsx`/`ny.tsx` nå** (A5) — refaktorering uten brukereffekt; gjøres når tester finnes som sikrer den.
- **Ikke bytt til expo-image eller slank `select('*')` nå** (A6/A12 MEDIUM) — målbar gevinst først ved datavolum; husk mapX-avhengigheten når det gjøres.
- **Ikke bygg win-back/last_seen før analytics** (A10) — kan ikke måle effekten uten events.
- **Ikke gjør konstant-tid webhook-compare som egen oppgave** (A8 HØY, men konfidens MEDIUM og reell utnyttbarhet lav) — ta den i samme commit som webhook-tier_locked-fiksen.
- **Ikke skill sukkerrull/sukkerpuder eller bygg soneavhengig sjekkliste** (A4 LAV) — nisje; etter at kjerneaktivering beviselig virker.

---

## 9. Go/no-go

**NO-GO for åpen testing/produksjon i dag — men blokkerlisten er kort og billig.**

Blokkere (kun det som faktisk hindrer lansering):
1. **Paywall-bypass server-side** (A8 KRITISK + A12 REGRESJON): enhver bruker kan sette egen tier til 'lag' permanent, og 3-kube-grensen håndheves ikke i DB. Å lansere betalt abonnement med åpen gratis-bakdør undergraver hele forretningsmodellen. — *2 migrasjoner, ~3 t inkl. test.*
2. **Play-policy**: `READ_MEDIA_IMAGES` uten galleri-kjernefunksjon (sannsynlig avslag) + manglende konto-slette-web-URL (hard blokk for produksjonsspor). — *~0,5 + 3 t.*
3. **Manuelle dashboard-punkter** (verifiseres, ikke kodes): Supabase Pro (free tier auto-pauser → appen dør), RevenueCat-produkter aktive i Play Console, webhook-secret + EAS env-vars satt. — *~1 t sjekk.*

**Samlet innsats til GO: ~1 arbeidsdag.** Trial-inkonsistensen (K4) og push-deep-link (K2) er ikke formelle blokkere, men bør med i samme bygg siden de treffer det første betalende brukere opplever. Appen er ellers i klart bedre stand enn for to dager siden: domenet er faglig sterkt, arkitekturen sunn, og 8/10 av forrige plans straksfikser er gjennomført og verifisert. Etter blokkerne + sprintens punkt 1–3 er appen klar for åpen testing med reell sjanse på 100 betalende i sesong.
