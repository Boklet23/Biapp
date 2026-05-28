# Agent 11 — Onboarding og første kjøring

## Metainfo
- Filer lest:
  - `app/(auth)/index.tsx`
  - `app/(auth)/register.tsx`
  - `app/(auth)/login.tsx`
  - `app/(auth)/_layout.tsx`
  - `services/googleAuth.ts`
  - `app/(app)/_layout.tsx`
  - `app/(app)/splash.tsx`
  - `app/(app)/onboarding.tsx`
  - `app/(app)/(tabs)/hjem/index.tsx`
  - `app/(app)/(tabs)/kuber/index.tsx`
- Filer ikke funnet: `app/(app)/(tabs)/kuber/ny.tsx` (ikke lest direkte, men referert fra onboarding-navigasjon)
- Konfidensgrad: HØY

---

## Sammendrag (maks 80 ord)

BiVokter har en solid, polert onboarding-kjede: animert velkomstskjerm → registrering (Google OAuth eller e-post) → splash → 5-slide onboarding → direkte til kubeoppretting. Tom Hjem-skjerm viser en god "Legg til din første kube"-CTA. Kubeskjemaet har innebygde InfoSheet-forklaringer for birøkterterminologi. Kritiske svakheter: e-postbekreftelse kan blokkere registrering uten klar beskjed, onboarding-slideshowet er markedsføring uten handlingspunkter, og prøveperiode-knappen på siste slide er misplassert og potensielt forvirrende.

---

## Funn

**[KRITISK]** `app/(auth)/register.tsx:70–74` — E-postbekreftelse er blokkerende — Supabase returnerer `data.session === null` når e-post ikke er bekreftet. Koden setter `setPendingVerification(true)` og viser en informasjonsboks, og det er faktisk en "Send bekreftelsesepost på nytt"-knapp (linje 104–115). Men det er ingen navigasjon tilbake til login, ingen deep-link-oppsett som returnerer brukeren til appen etter klikk i e-posten, og ingen forklaring på at appen venter. Brukere på Android kan åpne bekreftelsesl lenken i nettleseren og måtte starte appen manuelt igjen. — Legg til Supabase Deep Link-redirect slik at appen åpnes etter bekreftelsesk klikk; vurder `autoconfirm`-alternativ i dev/staging.

**[KRITISK]** `app/(app)/onboarding.tsx:136–155` — Prøveperiode-CTA på siste onboarding-slide er misplassert og ikke gjestfri — Den primære CTA-knappen på avslutningssliden er "Start 30 dager gratis Hobbyist" som prøver å kjøpe et RevenueCat-abonnement (`purchasePackage`) umiddelbart. En ny bruker som nettopp registrerte seg har ikke sett appen ennå og vet ikke om den er verdt å betale for. "Legg til din første kube" er den sekundære handlingen, og "Utforsk appen først" er en tredje, nedprioritert lenke. Prioriteringshierarkiet er omvendt: verdi bør komme før konvertering. — Gjør "Legg til din første kube" til primær CTA, flytt prøveperiode-tilbudet til etter aha-momentet (f.eks. etter første inspeksjon med AI-analyse).

**[LAV]** `app/(auth)/index.tsx:111–140` — Google OAuth er fremtredende på velkomstskjermen — Velkomstskjermen har faktisk både "Kom i gang" (primærknapp til register) OG "Fortsett med Google" som den andre CTA-en (linje 112–128), før "Har du allerede en konto? Logg inn". Dette er riktig hierarki. Ingen feil her — funnet korrekt implementert. Merk dog: Google-ikonet er bare en "G" i hvit tekst uten faktisk Google-branding, noe som kan redusere gjenkjennelighet.

**[HØY]** `app/(app)/onboarding.tsx:21–52` — Onboarding-slideshowet er enveis markedsføring uten interaksjon eller personalisering — De 5 slidene forklarer funksjoner men ber aldri brukeren om å gjøre noe (stille inn lokasjon, tillate varsler, si om de er nybegynner). Brukeren sveiper passivt gjennom generisk innhold. Det er ingen tilpasning: en erfaren birøkter som vet hva varroa er ser det samme som en nybegynner. — Vurder å erstatte ett slide med et enkelt spørsmål ("Er du nybegynner eller erfaren birøkter?") for personalisert onboarding, eller gjør slideshow interaktivt med sjekkliste-progresjon.

**[HØY]** `app/(app)/(tabs)/kuber/index.tsx:215–223` — Tom kubeskjerm bruker ukjent symbol for å veilede til opprettelse — Tom-tilstand viser "Trykk + for å legge til din første bikube" (linje 221), men FAB-knappen (+) er posisjonert `bottom: 24, right: 24` (linje 386–388) — en flytende, rund knapp uten synlig label. Nybegynnere forstår kanskje ikke symbolet. Hjem-skjermen sin CTA ("Legg til din første kube →") er mer tydelig men tar brukeren til `/kuber/ny` uten å gå innom kubelisten. Resultatet er to inngangspunkter til nytt-kube-flyten som ikke koordinerer. — Legg til et visuelt pil/peker mot FAB-knappen i tom-tilstand, eller gjør tom-tilstanden selv til en trykkbar CTA-knapp.

**[MEDIUM]** `app/(app)/splash.tsx:9–12` — Splash-screen navigasjonslogikk avhenger av AsyncStorage — `goToApp()` leser `ONBOARDING_KEY` fra AsyncStorage. Hvis AsyncStorage feiler (`.catch(() => null)`), returnerer den `null`, og brukeren sendes til onboarding på nytt. Dette er mer en defensiv `catch` enn et problem, men det betyr at brukere som har fullført onboarding kan se den på nytt ved AsyncStorage-feil (f.eks. på lav lagringsplass). — Vurder å lagre onboarding-flagg i Supabase `profiles`-tabellen som backup, slik at flagget er robust på tvers av reinstallering og enheter.

**[MEDIUM]** `app/(auth)/register.tsx:160–192` — Google-knappen er visuelt nedprioritert i registreringsskjemaet — I `register.tsx` er Google-knappen plassert *under* tre skjemafelt + terms-checkbox + primærknapp, skilt av en "eller"-divider (linje 162–166). Brukeren som allerede er på registreringsskjermen ser e-postskjemaet som default-valget. På `index.tsx` (velkomst) er Google fremtredende, men rekkefølgen er omvendt på `register.tsx`. Inkonsistens mellom disse to skjermene skaper kognitiv forvirring. — Flytt Google-knappen til toppen av `register.tsx`, over e-postfeltene, for konsistens med velkomstskjermen.

**[MEDIUM]** `app/(app)/(tabs)/kuber/index.tsx:221–223` — Tom kubeskjerm-veiledning er uklar — Tom-tilstanden sier "Trykk + for å legge til din første bikube", men FAB-knappen (+) er en flytende rund knapp i hjørnet (linje 386–388) uten synlig label i tom-tilstand. Ingen animasjon, ingen pil som peker på knappen. Det er heller ingen forklaring på hva en "kube" er i BiVokter-sammenheng (koloninivå-konsept for nybegynnere). — Legg til en pulseringsanimasjon på FAB ved tom state og en kort forklaringstekst om hva en kube representerer.

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:343–358` — Tom Hjem-skjerm er god men mangler steg-for-steg aktiveringsguide — Hjem-skjermen viser en velformulert tom-tilstand CTA (linje 343–359): honningfarget kort med emoji, tittel "Velkommen til BiVokter!", forklarende tekst og en mørk "Legg til din første kube →"-knapp. Dette er bra. Men det er ingen progressiv guide etter at kuben er lagt til — ingen "Neste steg: logg din første inspeksjon". CTA-en forsvinner når `hives.length > 0`, og brukeren er overlatt til seg selv. — Implementer en "Kom i gang"-kortrekke (3 steg: Kube / Inspeksjon / Varsler) sporbar via AsyncStorage som vises øverst på Hjem inntil alle er fullført.

**[LAV]** `app/(app)/_layout.tsx:17–26` — Varseltillatelse trigges umiddelbart ved innlogging uten brukerforklaring — `requestNotificationPermission()` kalles i `useEffect` rett etter sesjon er etablert (linje 18–20). iOS viser systemdialog uten kontekst — brukeren vet ikke *hvorfor* appen vil sende varsler. Ny bruker som nettopp logget inn ser en systemdialog om varsler uten å ha sett noe verdifullt i appen. — Be om tillatelse kontekstuelt: etter at brukeren har opprettet sin første kube og fått se dashboardet, med en forklaringsskjerm ("Vi varsler deg når en kube trenger oppmerksomhet") rett før systemdialogen.

**[LAV]** `services/googleAuth.ts:28–47` — Implisitt OAuth fallback eksisterer men testes ikke eksplisitt — `signInWithGoogle()` har en PKCE-flyt (primær) og en implicit fallback for access_token/refresh_token i URL-fragment (linje 38–47). Implisitt flyt er utdatert og kan feile stille på nyere Supabase-prosjekter. — Fjern eller log eksplisitt hvis implicit-fallback trigges, og vurder å kaste en feil i stedet for å sette session stille.

---

## Aha-moment-analyse

BiVokters aha-moment er sannsynligvis ett av to: (a) AI-varroa-telling (slide 3 i onboarding: "AI teller varroa for deg") eller (b) første push-varsel om en kube som trenger oppmerksomhet. Ingen av disse er tilgjengelige ved første åpning. Brukeren må registrere seg, se slideshow, opprette kube, logge en inspeksjon med bilde, og aktivere varsler — det er mange steg.

**Estimert tid fra registrering til aha-moment (Google OAuth-sti, raskeste mulige):**
| Steg | Estimert tid |
|---|---|
| Welcome → Google OAuth (WebBrowser + samtykke) | ~20–30 sek |
| Splash (2,5 sek auto + trykk) | ~3 sek |
| Onboarding slideshow (5 slides, lese + sveipe) | ~60–90 sek |
| Legg til kube via CTA (navn, type, bekreft) | ~60–120 sek |
| Navigert til Hjem med data | ~3 sek |
| **Totalt til første "full" dashboard** | **~2,5–4 min** |

For e-postregistrering legges e-postbekreftelse til — potensielt 5–30 min blokkering. AI-varroa-telling krever ytterligere en full inspeksjon med bilde. Aha-momentet er akseptabelt for Google-brukere, men blokkert for e-postbrukere.

---

## Topp-3 anbefalinger

1. **Løs e-postbekreftelsesblokkeringen** (`app/(auth)/register.tsx:70–74`) — Resend-knappen finnes allerede, men deep-link-retur til appen mangler. Konfigurer Supabase-prosjektets redirect URL til `bivokter://auth/callback` slik at brukeren returneres direkte til appen etter bekreftelsesklikk. Alternativt: slå på `autoconfirm` i dev/staging for å fjerne steget helt. For e-postbrukere er dette den viktigste friksjonsfaktoren og den som stopper dem fra å nå aha-momentet.

2. **Reverter CTA-hierarkiet på siste onboarding-slide** (`app/(app)/onboarding.tsx:136–155`) — "Legg til din første kube" skal være den klare primærknappen (honning/gul, full bredde). "Start 30 dager gratis Hobbyist" er en salgs-CTA og bør flyttes til et in-app banner etter at brukeren har brukt appen i 2–3 dager. Ny bruker har ikke grunnlag for å vurdere et kjøp uten å ha sett verdien av appen.

3. **Implementer en progressiv aktiveringsjekkliste post-onboarding** — Legg til et "Kom i gang"-kort øverst på Hjem med tre steg (Kube opprettet / Første inspeksjon / Varsler aktivert), sporbart via AsyncStorage (nøkler: `bivokter_first_hive_done`, `bivokter_first_inspection_done`, `bivokter_notifications_done`). Kortet forsvinner når alle steg er fullført. Dette er den mest direkte veien til å øke andelen brukere som når aha-momentet.
