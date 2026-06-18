# Agent 11 — Onboarding og første kjøring

## Metainfo
- Filer lest: `app/(auth)/index.tsx`, `welcome.tsx`, `onboarding.tsx`, `register.tsx`, `login.tsx`, `_layout.tsx`, `app/(app)/_layout.tsx`, `services/googleAuth.ts`, `components/home/ActivationGuide.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/ny.tsx`. Glob: `app/**/callback*` (ingen treff), `inspeksjon/ny.tsx` (finnes).
- Diff mot forrige (`reports/archive/2026-06-12/agent-11-onboarding.md`): lest. **Fikset siden 12. juni:** (1) HØY varseltillatelse flyttet UT av oppstart — `(app)/_layout.tsx:18-30` kaller nå kun `hasNotificationPermission()`, prompten eies av ActivationGuide steg 3 med forklarende pre-prompt (`ActivationGuide.tsx:66-92`); (2) HØY stille Google-feil på welcome — viser nå `googleError` (`welcome.tsx:111,122-123`); (3) MEDIUM «Glemt passord» finnes nå med kontoenumerering-sikker melding (`login.tsx:54-72`); (4) MEDIUM ActivationGuide steg 1 → `/kuber/ny` direkte (`ActivationGuide.tsx:99`). Ikke gjenta disse.

## Sammendrag
Onboarding-flyten er nå moden: splash → 5 verdislides → register/welcome med synlig Google-alternativ, fungerende «glemt passord», forklarende varsel-pre-prompt, og en ActivationGuide som leder kube→inspeksjon→varsler. De fleste tidligere KRITISK/HØY-funn er løst. Gjenstående friksjon er mindre: e-postverifisering mangler fortsatt deep-link (re-innlogging kreves), førstegangsbruker ser aldri den polerte welcome-skjermen, ActivationGuide steg 2 lander på kubelisten i stedet for inspeksjonen, og dashboardet har tre overlappende kort ved 0 kuber. Ingen demo/tom-tilstand som «selger».

## Fungerer godt (ikke rør)
1. **Pre-auth arkitektur** — `(auth)/index.tsx:13-16` ruter førstegang→onboarding, retur→welcome via `ONBOARDING_KEY`; innloggede kortsluttes i `(auth)/_layout.tsx:14-16`.
2. **Onboarding selger verdi** — slide 3 (AI-varroa) og 5 (Mattilsynet-rapport) er konkrete løfter, ikke funksjonslister; hoppbar (`onboarding.tsx:142-148`).
3. **Trial-løftet** — `onboarding.tsx:121-123` lover 14 dager Hobbyist; banner + nedtelling vises på Hjem (`hjem/index.tsx:407-419`).
4. **`ny.tsx` nybegynnervennlig** — kun navn påkrevd (`ny.tsx:131-135`); InfoSheets forklarer etasjer/rammer/kubetype pedagogisk; GPS-feil → innstillinger-lenke.
5. **Verifiserings-UX + sikker passordreset** — resend, «Åpne e-postappen», «Jeg har bekreftet» (`register.tsx:115-148`); reset røper ikke om e-post finnes (`login.tsx:66-71`).

## Funn

**[MEDIUM]** `app/(auth)/register.tsx:70-74` + manglende `auth/callback`-rute — E-postverifisering er fortsatt blokkerende uten deep-link: `if (data.session) {...} else { setPendingVerification(true); }`. Glob bekrefter at ingen `auth/callback`-rute finnes i `app/`, så bekreftelseslenken etablerer ikke sesjon — teksten ber brukeren «kom tilbake hit og logg inn» (`register.tsx:118-121`) og taste e-post/passord på nytt. — Konsekvens: momentum-tap mellom registrering og første verdi; app-bytte + re-innlogging. — Løsning: e-postmal med `bivokter://`-redirect + callback-rute som kaller `exchangeCodeForSession` (mønster finnes i `googleAuth.ts:31-35`), eller auto-confirm i testfasen. — Innsats: M — Konfidens: MEDIUM (server-konfig ikke synlig i repo).

**[MEDIUM]** `components/home/ActivationGuide.tsx:101-106` — Steg 2 «Gjennomfør en inspeksjon» lander på kubelisten: `onPress: () => router.push('/(app)/(tabs)/kuber' as any)`. Steg 1 ble fikset til `/kuber/ny`, men steg 2 burde lande på inspeksjonsflyten — `inspeksjon/ny.tsx` finnes. — Konsekvens: ekstra leting/trykk rett før aha-momentet (første helsescore). — Løsning: med nøyaktig én kube → `/kuber/[id]/inspeksjon/ny`; ellers kubelisten. — Innsats: S — Konfidens: HØY.

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:355-404` — CTA-overlapp ved 0 kuber består: empty-state-kort «Legg til din første kube →» (`:356-371`) OG ActivationGuide steg 1 med samme tekst (`ActivationGuide.tsx:96`) vises samtidig — to identiske handlinger, nå samme destinasjon, men dobbelt visuelt budskap. Trial-banner kan også vises samtidig. — Konsekvens: rotete førsteinntrykk, uklar primærhandling. — Løsning: skjul ActivationGuide når empty-state vises (`hives.length === 0`), eller skjul empty-state mens guiden er aktiv. — Innsats: S — Konfidens: HØY.

**[LAV]** `app/(auth)/onboarding.tsx:117,125,143` — Førstegangsbruker ser aldri welcome-skjermen: «Kom i gang» og «Hopp over» går begge til `/(auth)/register` via `router.replace`. Den polerte welcome-skjermen (animerte bier, Google-førstevalg, `welcome.tsx`) nås kun av returnerende. `replace` gir tom back-stack → Android hardware-back fra register avslutter appen. — Konsekvens: bortkastet design-arbeid + ingen vei tilbake til slidene. — Løsning: la onboarding lande på welcome (som så ruter videre), eller bruk `push`. — Innsats: S — Konfidens: MEDIUM.

**[LAV]** `app/(auth)/register.tsx:14` vs `app/(auth)/login.tsx:13` — Passordkrav fortsatt inkonsistent: registrering `min(8)`, login `min(6)`. Uendret, ikke regresjon. — Konsekvens: kun kosmetisk (login avviser aldri gyldige passord). — Løsning: 8 begge steder. — Innsats: S — Konfidens: HØY.

**[LAV]** `app/(auth)/index.tsx:20` — 2 s tvungen splash (`setTimeout(resolveEntry, 2000)`) ved hver kald start for utloggede. Tappbar («Trykk for å fortsette»). Uendret. — Konsekvens: liten oppstartsfriksjon. — Løsning: reduser til ~1,2 s eller naviger når AsyncStorage-lesing er ferdig. — Innsats: S — Konfidens: HØY.

**[LAV]** `app/(app)/(tabs)/hjem/index.tsx:355-371` — Tom-tilstand «selger» ikke: 0-kuber-bruker ser hero med tomme tall (KUBER 0, SNITT 0, KG –) + ett CTA-kort, men ingen demo/ghost-kort eller eksempeldata som viser hva helsescore/AI-analyse faktisk ser ut som. — Konsekvens: verdien forblir abstrakt til etter første inspeksjon. — Løsning: vis ett ghost-/eksempelkort («Slik ser kuben din ut etter første inspeksjon») i empty-state. — Innsats: M — Konfidens: MEDIUM.

### Flyt-kart (faktisk, verifisert)
Kald start → `(auth)/index` (2 s splash, tappbar) → **førstegang:** `onboarding` (5 slides, hoppbar) → «Kom i gang» → `register` (3 felt + vilkår-checkbox, ELLER Google 1 trykk). **Retur:** `welcome` (Google-førstevalg / e-post). Ved Google/auto-confirm → rett til `hjem`; ved e-post → verifiserings-boks (forlater appen, krever re-innlogging). `hjem` → empty-state-CTA + ActivationGuide + trial-banner → `kuber/ny` (1 påkrevd felt) → kubeprofil → (steg 2) inspeksjon. **Aha-moment:** første helsescore/AI-varroa etter første inspeksjon. Med Google-login: ~8-12 trykk, ~4-8 min fra installasjon; e-postveien legger til app-bytte + re-innlogging. **Avbrudd:** `ONBOARDING_KEY` settes ved exit fra onboarding (`onboarding.tsx:70`), så avbrutt flyt lander på welcome neste gang — riktig sted. Varsel-permission ligger nå korrekt ETTER aha (ActivationGuide steg 3).

## Topp-3 anbefalinger
1. **Konsolider 0-kube-dashboardet** (`hjem/index.tsx:355-404`): skjul ActivationGuide når empty-state vises, og dyplenk steg 2 til `inspeksjon/ny`. Innsats: S. Effekt: én tydelig hovedhandling og kortere vei til aha.
2. **Wire e-postverifisering med deep-link** (`register.tsx`, ny `auth/callback`-rute): `bivokter://`-redirect + `exchangeCodeForSession`. Innsats: M. Effekt: fjerner re-innlogging — det største momentum-tapet i e-posttrakten.
3. **La førstegangsbrukere se welcome + selg tom-tilstand** (`onboarding.tsx:117,143`, `hjem` empty-state). Innsats: S-M. Effekt: gjenbruker polert design og gjør verdien konkret før første inspeksjon.
