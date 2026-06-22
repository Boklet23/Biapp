# Agent 11 — Onboarding og første kjøring

## Metainfo
- Filer lest: `app/(auth)/index.tsx`, `welcome.tsx`, `onboarding.tsx`, `register.tsx`, `login.tsx`, `services/googleAuth.ts`, `app/(app)/_layout.tsx`, `components/home/ActivationGuide.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/ny.tsx`. Grep: `app.json` (scheme `bivokter`), `lib/supabase.ts` (`detectSessionInUrl: false`). Glob `app/**/callback*` → ingen treff.
- Diff mot forrige (`archive/2026-06-18/agent-11-onboarding.md`): lest. **Verifisert fikset:** (1) ActivationGuide steg 2 ruter nå til `/kuber/[id]/inspeksjon/ny` ved nøyaktig 1 kube via `firstHiveId` (`ActivationGuide.tsx:108-111`) — forrige MEDIUM løst; (2) ActivationGuide skjules helt ved 0 kuber — `hjem/index.tsx:410` rendrer kun ved `hives.length > 0`, så CTA-overlapp (forrige MEDIUM) er borte. Ingen regresjon på disse.

## Sammendrag
Onboarding-flyten er moden og lite-friksjons: splash → 5 verdislides → register/welcome med synlig Google, fungerende glemt-passord, forklarende varsel-pre-prompt, og en ActivationGuide som nå dyplenker både kube- og inspeksjonssteg. De to MEDIUM-funnene fra 18. juni (steg-2-ruting + 0-kube-overlapp) er bekreftet løst. Gjenstående friksjon er e-postverifisering uten deep-link (krever manuell re-innlogging), at førstegangsbruker aldri ser den polerte welcome-skjermen, inkonsistente passordkrav, og en tom-tilstand som beskriver verdi i stedet for å demonstrere den.

## Fungerer godt (ikke rør)
1. **Pre-auth gate** — `(auth)/index.tsx:13-16` ruter førstegang→onboarding, retur→welcome via `ONBOARDING_KEY`; `finishOnboarding` setter nøkkelen ved både «Kom i gang» og «Hopp over» (`onboarding.tsx:69-72`), så avbrutt flyt lander riktig.
2. **Slides selger verdi, ikke funksjoner** — slide 3 (AI teller varroa) og 5 (Mattilsynet-rapport) er konkrete løfter; hoppbar hele veien.
3. **ActivationGuide leder hele veien til aha** — steg 1→`/kuber/ny`, steg 2→inspeksjon ved 1 kube, steg 3→varsel-prompt med forklarende pre-dialog (`ActivationGuide.tsx:67-93`); auto-dismiss + persistert ved fullført (`:52-58`).
4. **`ny.tsx` nybegynnervennlig** — kun navn påkrevd (`:131-135`); InfoSheets forklarer kubetype/etasjer/rammer pedagogisk; GPS-feil → innstillinger-lenke.
5. **Sikker auth-UX** — glemt-passord røper ikke kontoeksistens (`login.tsx:66-71`); Google-feil vises i stedet for å svelges (`welcome.tsx:122-123`); verifiseringsboks har resend + «Åpne e-postappen».

## Funn

**[MEDIUM]** `app/(auth)/register.tsx:70-74` + `lib/supabase.ts:18` — E-postverifisering er fortsatt blokkerende uten deep-link. `signUp` sender ingen `emailRedirectTo`, klienten har `detectSessionInUrl: false`, og det finnes ingen `auth/callback`-rute (Glob: ingen treff). Koden faller derfor til `setPendingVerification(true)` og ber brukeren «kom tilbake hit og logg inn» (`register.tsx:118-121`) og taste e-post+passord på nytt. — Konsekvens: momentum-tap i e-posttrakten; app-bytte + manuell re-innlogging rett før første verdi. — Løsning: `emailRedirectTo: Linking.createURL('auth/callback')` på `signUp` + en `auth/callback`-rute som kaller `exchangeCodeForSession` (mønsteret finnes alt i `googleAuth.ts:31-35`); eller auto-confirm i testfasen. — Innsats: M — Konfidens: HØY (kodenivå bekreftet; server-mal ikke synlig).

**[LAV]** `app/(auth)/onboarding.tsx:117,143` — Førstegangsbruker ser aldri welcome-skjermen. Både «Kom i gang» og «Hopp over» kaller `finishOnboarding('/(auth)/register')` med `router.replace`. Den polerte welcome (animerte bier, Google-førstevalg, feature-kort) nås kun av returnerende brukere. `replace` gir også tom back-stack → Android hardware-back fra register avslutter appen, uten vei tilbake til slidene. — Konsekvens: bortkastet design + ingen angre-vei. — Løsning: la onboarding lande på `welcome` (som ruter videre), eller bruk `push`. — Innsats: S — Konfidens: MEDIUM.

**[LAV]** `app/(auth)/register.tsx:14` vs `app/(auth)/login.tsx:13` — Passordkrav inkonsistent: registrering `min(8)`, login `min(6)`. Uendret siden forrige runde, ikke regresjon. — Konsekvens: kosmetisk (login avviser aldri et gyldig 8-tegns passord), men forvirrer ved feilmelding. — Løsning: `min(8)` begge steder. — Innsats: S — Konfidens: HØY.

**[LAV]** `app/(app)/(tabs)/hjem/index.tsx:361-378` — Tom-tilstand «selger» ikke. 0-kube-bruker ser hero med tomme tall (KUBER 0, SNITT 0, KG –) + ett tekstlig CTA-kort, men ingen demo/ghost-kort som viser hvordan helsescore eller AI-varroaanalyse faktisk ser ut. Verdien forblir abstrakt til etter første inspeksjon. — Konsekvens: svakere konvertering fra registrert→aktivert. — Løsning: ett ghost-/eksempelkort («Slik ser kuben din ut etter første inspeksjon») i empty-state. — Innsats: M — Konfidens: MEDIUM.

**[LAV]** `app/(auth)/index.tsx:20` — 2 s tvungen splash (`setTimeout(resolveEntry, 2000)`) ved hver kald start for utloggede; tappbar, men venter unødig på AsyncStorage-lesing som tar millisekunder. Uendret. — Konsekvens: liten oppstartsfriksjon. — Løsning: naviger straks `getItem` returnerer (med min. ~600 ms for merkevarefølelse). — Innsats: S — Konfidens: HØY.

### Flyt-kart (faktisk, verifisert)
Kald start → `(auth)/index` (2 s splash, tappbar) → **førstegang:** `onboarding` (5 slides, hoppbar) → «Kom i gang» (`replace`) → `register` (3 felt + vilkår-checkbox ELLER Google 1 trykk). **Retur:** `welcome` (Google-førstevalg / e-post / login). Google/auto-confirm → rett til `hjem`; e-post → verifiseringsboks (forlater appen, manuell re-innlogging). `hjem` ved 0 kuber → kun empty-state-CTA (ActivationGuide skjult, bekreftet `:410`) → `kuber/ny` (1 påkrevd felt) → kubeprofil. ActivationGuide vises først ved ≥1 kube: steg 2→inspeksjon ved 1 kube, ellers kubeliste; steg 3→varsel-prompt. **Aha-moment:** første helsescore / AI-varroa etter første inspeksjon. Google-vei: ~8-12 trykk, ~4-8 min fra installasjon; e-postveien legger til app-bytte + re-innlogging. Varsel-permission ligger korrekt ETTER aha (steg 3), ikke ved oppstart (`(app)/_layout.tsx:20-30`).

## Topp-3 anbefalinger
1. **Wire e-postverifisering med deep-link** (`register.tsx`, `lib/supabase.ts`, ny `auth/callback`-rute): `emailRedirectTo: bivokter://auth/callback` + `exchangeCodeForSession`. Innsats: M. Effekt: fjerner det eneste gjenværende momentum-tapet i e-posttrakten.
2. **La førstegangsbrukere se welcome + gi back-vei** (`onboarding.tsx:117,143`): rut til `welcome` eller bruk `push`. Innsats: S. Effekt: gjenbruker polert design og fjerner appavslutt-på-back.
3. **Selg tom-tilstanden** (`hjem/index.tsx:361-378`): ett ghost-/eksempelkort som viser helsescore/AI-resultat. Innsats: M. Effekt: gjør verdien konkret før første inspeksjon → høyere aktiveringsrate.
