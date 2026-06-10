# Agent 3 — Konvertering

## Metainfo
**Filer lest:** `services/subscription.ts`, `hooks/useEffectiveTier.ts`, `components/ui/UpgradeModal.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `app/(app)/(tabs)/kuber/ny.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `components/inspection/Step3.tsx`, `app/(app)/onboarding.tsx`, `supabase/migrations/0017_trial_period.sql`, `services/profile.ts`
**Filer ikke funnet:** ingen (alle scope-filer funnet)
**Konfidensgrad:** Høy for kode/flyt. Middels for prisbenchmark (ingen web-tilgang brukt; basert på markedskunnskap).

## Sammendrag
Gate-arkitekturen er gjennomtenkt: AI-analyse vises som demo med blur-effekt (godt aha-moment), kubegrense gater først ved kube #4 (etter verdi), og ROI-banner forankrer pris mot kubeverdi. Men det finnes en kritisk feil: prøveperioden er inkonsistent (14 dager i DB vs «30 dager» i UI), og onboarding-knappen kjører et betalt kjøp i stedet for å aktivere den gratis trialen alle uansett får. Verdiforslag for Profesjonell/Lag er tynt kommunisert.

## Funn

**[KRITISK]** `app/(app)/onboarding.tsx:79-95` + `:149` — «Start 30 dager gratis Hobbyist»-knappen kaller `purchasePackage(hobbyist_monthly)` (et betalt kjøp), ikke en trial. Samtidig gir DB-trigger (`0017_trial_period.sql:9`) automatisk 14-dagers trial til ALLE ved signup. Brukeren lover «30 dager», får 14 i DB, og knappen trigger en Google Play-betalingsdialog. — Konsekvens: Villedende markedsføring (Play Store-brudd), forvirret bruker, mulig utilsiktet trekk. — Løsning: Fjern kjøpet fra knappen; trialen er allerede aktiv. Endre tekst til «14 dager gratis Hobbyist er allerede aktiv» og rett tallet overalt.

**[HØY]** `components/ui/UpgradeModal.tsx:46-54` — Profesjonell (149 kr) sitt verdiforslag er «Alt i Hobbyist + AI ubegrenset + CSV/PDF + prioritert support». 3x prisen for å fjerne et tak på 10 AI-analyser/mnd + eksport er svak forankring. — Konsekvens: Lav konvertering Hobbyist→Profesjonell; tier-en virker overpriset. — Løsning: Flytt konkret Pro-verdi frem: statistikk/sammenligning mellom kuber, høstingsoversikt over år, vektgrafer (nevnt i CLAUDE.md som Pro-funksjoner men ikke i modal). Vis hva tallene gir birøkteren.

**[HØY]** `components/ui/UpgradeModal.tsx:23-70` — Ingen social proof, ingen urgency utover «Mest populær»-badge, og prisforankring mangler «per kube»- eller «per dag»-nedbrytning i selve kortene (kun i ny-kube subtitle, `kuber/ny.tsx:401`). — Konsekvens: Modal overbeviser på funksjonsliste alene, ikke psykologi. — Løsning: Legg til «X birøktere bruker BiVokter», «1,6 kr/dag» under Hobbyist-pris, og en tidsbegrenset årsrabatt-urgency.

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/index.tsx:300-319` — Samarbeid-raden (Lag-tier) ligger øverst på HVER kubeprofil, også for Starter-brukere som er langt fra å trenge 50-bruker-teamfunksjon. — Konsekvens: Premature gate; «🔒 Samarbeid (Lag)» på en gratisbrukers første kube skaper friksjon/forvirring fremfor begjær. — Løsning: Skjul Lag-gaten for Starter med <2 kuber, eller flytt lenger ned. Lag-tier (499 kr) er irrelevant for solo-hobbybrukeren.

**[MEDIUM]** `components/ui/UpgradeModal.tsx:90-118` — Kjøpsmatching er heuristisk strengmatch på `product.identifier`/`offeringIdentifier`. Hvis RevenueCat-produktnavngivning avviker, faller den til «Produkt ikke tilgjengelig»-alert. — Konsekvens: Død-ende i konverteringsfunnelen ved feilkonfig; bruker som VIL betale blokkeres uten spor. — Løsning: Logg `Sentry`-event ved manglende pkg-match (i dag stille alert), og verifiser offering-IDer mot Play-konsoll før lansering.

**[MEDIUM]** Prisvurdering 49/149/499 kr — Hobbyist 49 kr/mnd (399/år) er godt plassert for norsk marked (europeiske birøkterapper ligger typisk €3-7/mnd). 149 kr Profesjonell er i øvre sjikt og krever sterkere verdi (se HØY-funn). 499 kr Lag er aggressivt for et lite norsk birøkter-team-segment. — Konsekvens: Pro/Lag kan underkonvertere. — Løsning: A/B-test Pro på 99 kr; vurder lavere Lag-pris eller flere bruker-seter inkludert.

**[LAV]** `app/(app)/(tabs)/hjem/index.tsx:381-392` — Permanent oppgraderingsnudge for Starter er bra, men teksten «🚀 Ubegrenset kuber · AI-analyse · Rapporter» nevner verken pris eller trial. — Konsekvens: Lavere klikkrate; ingen prisforankring i nudge. — Løsning: Legg til «fra 33 kr/mnd» i nudgen.

**[LAV]** `components/inspection/Step3.tsx:121-137` — AI demo-kort («12 mitter (demo)») er et utmerket aha-moment, men «(demo)» kan misforstås som ekte data. — Konsekvens: Liten risiko for forvirring. — Løsning: Tydeligere eksempel-styling, f.eks. «Slik ser et AI-resultat ut».

## Topp-3 anbefalinger

1. **Fiks trial-inkonsistensen** (KRITISK) — fjern kjøp fra onboarding-knapp, synk «14 dager» overalt, gjør den automatiske trialen tydelig synlig. Est: **2-3 t**.
2. **Styrk Profesjonell-verdiforslaget** i UpgradeModal med konkrete statistikk-/høst-/vekt-eksempler + per-dag-prisforankring og social proof. Est: **3-4 t**.
3. **Betinget Lag-gate** på kubeprofil (skjul for små Starter-brukere) + Sentry-logging på manglende RC-pakke for å tette funnel-lekkasjer. Est: **2 t**.
