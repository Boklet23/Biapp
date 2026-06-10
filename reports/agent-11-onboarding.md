# Agent 11 — Onboarding

## Metainfo
**Filer lest:** `app/(auth)/index.tsx`, `app/(auth)/login.tsx`, `app/(auth)/register.tsx`, `services/googleAuth.ts`, `app/(app)/_layout.tsx`, `app/(app)/splash.tsx`, `app/(app)/onboarding.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/index.tsx`, `app/(app)/(tabs)/kuber/ny.tsx`, `components/home/ActivationGuide.tsx`
**Filer ikke funnet:** `supabase/config.toml` (e-postbekreftelse styres server-side, ikke i repo)
**Konfidensgrad:** Høy for UI-flyt. Middels for e-postbekreftelse (server-konfig ikke synlig).

## Sammendrag
Onboarding er gjennomtenkt: animert velkomstskjerm → registrering med fremtredende Google OAuth → 5-slides intro → "Legg til første kube". Tom Hjem har god velkomst-CTA, og ActivationGuide gir en 3-stegs aktiveringssjekkliste. Hovedsvakheter: en navigasjonsbug der `splash`/`onboarding` ligger inne i auth-beskyttet rute, e-postbekreftelse blokkerer innlogging, og tre konkurrerende "kom i gang"-mekanismer.

## Funn

**[KRITISK]** `app/(app)/_layout.tsx:54-56` + `app/(app)/splash.tsx` — Splash- og onboarding-skjermene ligger inne i `(app)`-gruppen som er auth-beskyttet (`if (!session) return <Redirect href="/(auth)" />`). En uinnlogget bruker kan derfor aldri se splash/onboarding-introen — de redirectes rett til `(auth)`. Onboarding-slidene (inkl. AI-varroa aha-momentet) vises kun ETTER innlogging via `initialRouteName="splash"`. — Konsekvens: verdiløftet kommuniseres for sent; intro-skjermene kan ikke konvertere nye besøkende før konto opprettes. — Løsning: Flytt `onboarding`/`splash` til en offentlig rute (egen gruppe utenfor auth-guard) eller vis intro før registrering.

**[HØY]** `app/(auth)/register.tsx:70-74` — Hvis Supabase krever e-postbekreftelse (`data.session` er null) blokkeres brukeren med `pendingVerification` og må forlate appen, åpne e-post, bekrefte, og logge inn manuelt igjen. — Konsekvens: stort frafall i aktivering; bruker mister momentum mellom registrering og første verdimoment. — Løsning: Skru av e-postbekreftelse (auto-confirm) for raskere aktivering, eller bruk deep-link-bekreftelse som tar brukeren rett tilbake i appen med aktiv sesjon.

**[HØY]** `app/(app)/onboarding.tsx:136-153` vs `app/(app)/(tabs)/hjem/index.tsx:351-367` + `components/home/ActivationGuide.tsx` — Tre overlappende "kom i gang"-mekanismer for samme handling. Onboarding tilbyr "Legg til din første kube"; deretter møter brukeren på Hjem BÅDE en empty-state-CTA OG ActivationGuide. — Konsekvens: beslutningsfriksjon, uklart hva som er hovedhandlingen. — Løsning: Konsolider; skjul empty-state-CTA når ActivationGuide er aktiv.

**[MEDIUM]** `app/(app)/onboarding.tsx:79-95` — "Start 30 dager gratis Hobbyist"-knappen utløser kjøp (`purchasePackage`) midt i onboarding, før brukeren har sett noen verdi eller opprettet en eneste kube. — Konsekvens: for tidlig betalingsfriksjon kan skremme nybegynnere bort. — Løsning: Utsett trial-tilbudet til etter første kube/inspeksjon (aha-moment først).

**[MEDIUM]** `app/(app)/(tabs)/kuber/ny.tsx:168-336` — Skjemaet er omfattende for første kube (navn, bilde, type, bierase, etasjer, rammer, GPS, notater). InfoSheet forklarer terminologi godt for nybegynnere, men det er mye i steg 1. — Konsekvens: skjema-overveldelse ved første verdimoment. — Løsning: Vurder et minimalt "hurtigopprett" (kun navn påkrevd, resten valgfritt senere).

**[MEDIUM]** `app/(app)/(tabs)/kuber/ny.tsx:94-98` + `components/home/ActivationGuide.tsx:72-77` — Etter første kube sendes brukeren til kubeprofilen uten tydelig oppfordring til neste steg (inspeksjon). ActivationGuide steg 2 lenker bare til kuber-listen, ikke til inspeksjonsflyten. — Konsekvens: bruker når ikke aha-momentet (AI-varroatelling/inspeksjon) — tid til aha forlenges unødig. — Løsning: Vis tydelig "Gjør din første inspeksjon"-CTA etter kube-opprett; koble steg 2 direkte til inspeksjon.

**[LAV]** `app/(app)/splash.tsx:16` — 2,5 s hardkodet splash-forsinkelse på HVER kald oppstart for innloggede brukere (ikke bare første gang). — Konsekvens: oppleves tregt for returnerende brukere. — Løsning: Reduser/hopp over splash når onboarding allerede er sett.

**[LAV]** `app/(auth)/register.tsx:14` vs `app/(auth)/login.tsx:13` — Passordkrav inkonsistent: registrering krever min 8 tegn, innlogging min 6. — Konsekvens: forvirrende, lavt praktisk problem. — Løsning: Bruk samme minimum begge steder.

**[LAV]** `components/home/ActivationGuide.tsx:35-42` — I Expo Go vises steg 3 "Aktiver varsler" alltid som ufullført (notifications hoppes over), så guiden når aldri 3/3 og auto-dismisses ikke. Kun dev/testproblem. — Konsekvens: guiden henger i utvikling. — Løsning: Marker steget N/A i Expo Go.

## Topp-3 anbefalinger

1. **Flytt onboarding/splash ut av auth-guarden** så intro (inkl. AI-aha-momentet) vises FØR registrering. Største konverteringsgevinst. (Est: 2–4 t — omstrukturering av router-grupper + redirect-logikk.)

2. **Fjern e-post-bekreftelsesblokkering** via auto-confirm eller deep-link-bekreftelse, slik at registrering → aktiv sesjon skjer i ett steg. (Est: 1–3 t — server-config + evt. deep-link-handler.)

3. **Konsolider de tre "kom i gang"-CTAene til én lineær aktiveringsflyt** (Opprett kube → Gjør inspeksjon → Aktiver varsler), og koble ActivationGuide steg 2 direkte til inspeksjonsflyten så aha-momentet nås raskere. (Est: 3–5 t.)
