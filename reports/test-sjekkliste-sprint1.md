# Test-sjekkliste — Sprint 1 + denne-uken-fikser

Manuell enhetsverifisering av endringene fra denne økten. Fokuserer på det `tsc` IKKE fanger:
navigasjon, gating, visuelt og dataflyt. Kryss av på enhet (Android preview-bygg).

Forkortelser: **F** = forventet resultat.

---

## 1. Pre-auth onboarding (størst risiko — navigasjonsomlegging)

Forberedelse: simuler ny bruker — avinstaller appen, ELLER logg ut og tøm app-data.

- [ ] Åpne appen ulogget → **F:** splash-gate vises («BiVokter», bie-scene)
- [ ] Etter ~2 s (eller ved trykk) → **F:** 5 verdi-slides vises — **uten** å måtte registrere seg først
- [ ] Sveip gjennom slidene → **F:** prikker oppdateres; slide 3 = «AI teller varroa» (aha-momentet)
- [ ] Siste slide «Kom i gang →» → **F:** registreringsskjerm. Notis: «Få 14 dager gratis Hobbyist når du registrerer deg»
- [ ] «Hopp over» (slide 1–4) → **F:** registreringsskjerm
- [ ] «Har du allerede konto? Logg inn» (siste slide) → **F:** innloggingsskjerm
- [ ] Lukk og åpne appen på nytt (fortsatt ulogget) → **F:** går rett til welcome-skjerm (bie-animasjon), **IKKE** slidene igjen
- [ ] Logg inn → **F:** rett til Hjem, **ingen** onboarding-slides på nytt (ingen dobbel onboarding)

## 2. E-postbekreftelse (UX-forbedring)

- [ ] Registrer med ny e-post → **F:** boks «Sjekk e-posten din 📬» med e-postadressen synlig
- [ ] «Åpne e-postappen» → **F:** åpner e-postapp (eller e-post-compose som fallback)
- [ ] «Jeg har bekreftet — logg inn» → **F:** innloggingsskjerm
- [ ] «Fikk du ingen e-post? Send på nytt» → **F:** sender på nytt uten feilmelding
- [ ] Bekreft i innboks → logg inn → **F:** kommer inn i appen
- [ ] (Hvis «Confirm email» er AV i Supabase) Registrer → **F:** rett inn i appen, ingen pending-boks

## 3. Pro-gating — sammenligning

Test som **Starter** eller **Hobbyist** (trial-aktiv = hobbyist):

- [ ] Mine Kuber → **F:** «Sammenlign»- og «Sesong»-knappene viser 🔒
- [ ] Trykk «🔒 Sammenlign» → **F:** UpgradeModal med tittel «Oppgrader til Profesjonell» + undertittel om sammenligning
- [ ] I modalen, Profesjonell-kortet → **F:** lister «Sammenlign kuber og år-over-år sesonger»

Test som **Profesjonell** eller **Lag**:

- [ ] Mine Kuber → **F:** knappene viser 📊/📈 (ingen lås)
- [ ] Trykk «📊 Sammenlign» → **F:** sammenligningstabell med kuber
- [ ] Trykk «📈 Sesong» → **F:** år-over-år-grafer og statstabell
- [ ] (Safety net) Hvis du kan deep-linke til skjermen som ikke-Pro → **F:** ProGate-skjerm («Profesjonell-funksjon», 🔒, «Tilbake»)

Kubegrense (uendret, verifiser ikke-regresjon):
- [ ] Starter med 3 kuber → trykk **+** → **F:** UpgradeModal «Oppgrader for flere kuber»

## 4. Varroa-terskler (konsistens — den fiksede bugen)

Lag/ha en inspeksjon med varroatelling. **Hovedpoeng:** Helsestatus og Anbefalinger skal
ALDRI motsi hverandre for samme telletall.

Metode **limbunn** (nedfall per dag):
- [ ] Telletall **6 eller mer** → **F:** Helsestatus «Høyt varroatall» **OG** Anbefalinger «Behandling nødvendig»
- [ ] Telletall **4–5** → **F:** Helsestatus «Forhøyet» + Anbefalinger «Følg med på varroa»
- [ ] Telletall **2–3** → **F:** Helsestatus «Moderat», ingen behandlingsanbefaling

Metode **alkoholspyling/sukkerpuder** (per 100 bier):
- [ ] Telletall **3 eller mer** → **F:** kritisk i begge seksjoner

## 5. Denne-uken-fikser

- [ ] Kalender → FAB «+ Hendelse» → **F:** mørk tekst på honninggul (lesbar, ikke hvit-på-gul)
- [ ] Kubeprofil → «Samarbeid»-rad (som Lag-bruker) → **F:** Samarbeid-skjerm med riktig header «Samarbeid» (ikke tom)
- [ ] Fremtving en mutasjonsfeil (f.eks. slett noe uten nett) → **F:** feiltoast vises (ingen stille feil); handlinger med egen feilmelding gir **ikke** dobbel toast
- [ ] Generelt: appen krasjer ikke ved oppstart selv om abonnementssync skulle feile (Sentry-import)

## 6. Typografi / visuelt

- [ ] Mine Kuber → kartvisning (🗺) → **F:** callout (kubenavn i fet), legend «Mine/Lag/Delt» med honning/blå/grønn — farger matcher paletten
- [ ] Kubeprofil → Kubevekt-seksjon → **F:** vekttall i fet, graf og historikk; fonter ser riktig vektet ut (ikke «tynne»)
- [ ] Generelt på endrede skjermer: ingen tekst som ser tynnere ut enn forventet (Manrope-vekt)

## 7. Webhook (server — ikke enhet)

Kan ikke testes på enhet. Valgfritt/avansert via RevenueCat sandbox:
- [ ] Testkjøp i sandbox → **F:** `profiles.subscription_tier` oppdateres
- [ ] (Idempotens) Gjentatt webhook-levering → **F:** ingen dobbel oppgradering; et kjøp mistes ikke ved transient feil

---

**Prioritet hvis du har lite tid:** seksjon 1 (onboarding-omlegging) og 3 (Pro-gating) er de
mest risikable endringene og bør testes først.
