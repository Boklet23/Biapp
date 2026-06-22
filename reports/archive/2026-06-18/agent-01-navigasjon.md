# Agent 1 — Navigasjonsarkitektur og informasjonsstruktur

## Metainfo
- **Filer lest:** `app/(app)/_layout.tsx`, `app/(app)/(tabs)/_layout.tsx`, `app/(app)/(tabs)/kuber/_layout.tsx`, `hjem/index.tsx`, `kuber/index.tsx`, `kuber/[id]/index.tsx`, `kuber/[id]/inspeksjon/ny.tsx`, `laer/index.tsx`, `samfunn/index.tsx`, `kalender/index.tsx`, `app/(app)/profil.tsx`, `components/home/ActivationGuide.tsx`, `components/ui/ProGate.tsx` + grep av `router.*`-kall i `app/` og `components/`, push-payload i `services/notifications.ts` og `supabase/functions/weekly-hive-alerts/index.ts`, BackHandler-grep (0 treff), feed-reachability.
- **Filer ikke funnet:** ingen. `kuber/sammenlign.tsx` ikke åpnet individuelt (rute verifisert registrert i `_layout.tsx:22`).
- **Diff mot forrige review (2026-06-12):** **Fikset:** (1) Push-tap ruter nå `hiveId`→`/kuber/[id]` (`_layout.tsx:49-50`); (2) kald-start via `getLastNotificationResponseAsync` (`_layout.tsx:56-58`); (3) ProGate har oppgrader-CTA (`ProGate.tsx:26-33`). **[REGRESJON] ingen.** **Fortsatt åpne:** «start inspeksjon» = 3 trykk, usann avbryt-dialog, passiv Kuber-tom-tilstand, manglende isError i laer/samfunn, ActivationGuide steg 2.

## Sammendrag (maks 80 ord)
Navigasjonen er solid: 5 fornuftige faner, grunn stakk (maks 3), draft-lagring i wizard, og alle to KRITISK/HØY push-funn fra forrige runde er nå fikset og verifisert i koden. Gjenstående hull er moderate: kjernehandlingen «start inspeksjon» krever fortsatt 3 trykk (kravet ≤2), wizardens avbryt-dialog lyver om datatap, Kuber-fanens tomme tilstand er passiv, og laer/samfunn mangler feilhåndtering. Profil nås kun via Hjem.

## Fungerer godt (maks 5 punkter)
- **Push-ruting komplett:** `hiveId`→kube, `eventId`→kalender, pluss kald-start (`_layout.tsx:44-60`) — matcher payloaden fra weekly-hive-alerts og lokale minner.
- **Kuber-fane-fix bekreftet:** `tabPress`-listener (`(tabs)/_layout.tsx:52-59`) tvinger alltid `navigate('kuber', { screen: 'index' })` → går til oversikten, ikke sist åpnede kube. Fungerer som tiltenkt.
- **Wizard-utkast:** AsyncStorage-draft lagres per felt og gjenopprettes med toast (`ny.tsx:103-159`); AI-resultat persisteres (`varroaAiResult`).
- **Konsistent premium-gating:** sammenlign/sesong/samarbeid sjekker tier FØR push og åpner UpgradeModal (`kuber/index.tsx:178-187`, `[id]/index.tsx:307-313`).
- **Feilstater på kjerneskjermer:** Kuber (`index.tsx:113-128`), kube-detalj (`[id]/index.tsx:212-227`), Hjem (`hjem/index.tsx:374-383`) og kalender (`kalender/index.tsx:58-64`) har retry/toast.

## Funn

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:469` & `[id]/index.tsx:386` — «Start inspeksjon» krever 3 trykk fra app-åpning: Hjem → oppgaverad (`router.push({ pathname: '/kuber/[id]' ...})`) → FAB «+ Inspeksjon». Ingen direkte inngang til wizard fra Hjem; «Denne uken / Inspeksjoner»-radene ruter til kubeprofil, ikke til `/kuber/[id]/inspeksjon/ny`. — Konsekvens: i sesong (juni=sverming) er dette den hyppigste handlingen; ≤2-trykk-kravet brytes. — Løsning: la oppgaveradene (eller egen knapp) gå rett til wizard. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:262-282` — Avbryt-dialogen (kun steg 1) sier «Data du har lagt inn vil ikke bli lagret» og sletter utkastet (`AsyncStorage.removeItem`), mens header-/hardware-back på steg 2–4 går ett steg tilbake og beholder utkastet stille. Tre exit-veier, tre semantikker; dialogteksten er faktisk usann (draft finnes). Uendret. — Konsekvens: forvirring + risiko for utilsiktet datatap. — Løsning: Avbryt-knapp på alle steg med «Lagre utkast»/«Forkast». — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/index.tsx:233-235` — Tom-tilstand er passiv tekst: `<Text style={styles.emptyText}>Trykk + for å legge til din første bikube</Text>` — ingen trykkbar CTA, i kontrast til Hjems rike CTA (`hjem/index.tsx:356-370`). Uendret. — Konsekvens: nybegynner som åpner Kuber-fanen først må gjette at «+»-FAB-en nederst til høyre er handlingen. — Løsning: gjør tom-tilstanden trykkbar mot `/kuber/ny`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/laer/index.tsx:36-44` & `samfunn/index.tsx:27-39` — Fortsatt ingen `isError`: laer destrukturerer kun `data` for `hives`/`harvests`/`diseases`; samfunn kun `data`/`isLoading` for `grouped`/`vendors`. Kalender ble fikset; disse to gjenstår. — Konsekvens: nettverksfeil → stille tomme lister uten retry. — Løsning: samme retry-mønster som `kuber/index.tsx:113-128`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** Oppdagbarhet av AI-varroa — eneste funksjonelle inngang er wizard-steg 3 (`ny.tsx:322-336`), 4+ trykk dypt og bak en kube-inspeksjon. Hjem nevner AI i nudge (`hjem/index.tsx:395`) og tom-tilstand, men nudgen åpner UpgradeModal, ikke funksjonen. Betalende Hobbyist har ingen synlig påminnelse om at AI finnes. — Konsekvens: nøkkel-differensiatoren for Hobbyist-tier (49kr) er nær usynlig → svak verdiopplevelse/retention. — Løsning: AI-teaser/snarvei på kubeprofil (f.eks. i VarroaTrend-kortet). — Innsats: M — Konfidens: MEDIUM

**[LAV]** `components/home/ActivationGuide.tsx:101-106` — Steg 2 «Gjennomfør en inspeksjon» ruter til `/(app)/(tabs)/kuber` (oversikten), ikke til brukerens kube/wizard. Når `hiveCount === 1` burde det gå rett til den kuben eller wizard. — Konsekvens: ekstra trykk i den styrte onboarding-flyten. — Innsats: S — Konfidens: HØY

**[LAV]** Profil har én eneste inngang: avatar på Hjem (`hjem/index.tsx:264`, eneste `router.push('/(app)/profil')`-treff). Fra Kuber/Kalender/Info/Samfunn er innstillinger/abonnement/utlogging/slett-konto unåelig uten å gå via Hjem. — Konsekvens: dårlig oppdagbarhet for abonnement (konvertering) og kontostyring. — Innsats: M — Konfidens: HØY

**[LAV]** Skjult feed: `(tabs)/_layout.tsx:88` (`href: null`). Grep bekrefter at ingen kall utenfor `feed/` peker dit; `/feed/ny` kalles kun fra `feed/index.tsx:87,98`. Ingen feilende ruter — kun sovende kode. — Innsats: – — Konfidens: HØY

**[LAV]** `(tabs)/_layout.tsx:73` (`title: 'Info'`) for `laer/`-mappen. UI internt konsistent (header «Info», `laer/index.tsx:94`), men «Info» skjuler at Honningprognose (Pro-verktøy, `laer/index.tsx:96-105`) og nybegynnerguide ligger her. — Løsning: vurder «Lær» eller skill verktøy ut. — Innsats: S — Konfidens: MEDIUM

**Øvrige verifiseringer (ingen funn):** Maks stakkdybde i Kuber = 3 (liste → `[id]` → `inspeksjon/ny`, som `router.replace`-er til `[inspId]`, `ny.tsx:224` — wizard blir ikke liggende i stacken). Ingen `BackHandler`/`hardwareBackPress`-overstyringer (grep: 0 treff) → standard Android-back på fane-rot og wizard. Fanetilstand/scroll bevares ved fanebytte (standard Tabs; Kuber-stacken forblir montert, men `tabPress` resetter bevisst til index). 4-stegs wizard (Grunninfo/Kubestatus/Helse/Notater) er logisk; frem/tilbake mister ikke felt (all state i forelder). Deep links: kald-start + warm håndteres likt via felles `handleResponse` (`_layout.tsx:45-59`).

## Topp-3 anbefalinger
1. **Kutt «start inspeksjon» til ≤2 trykk** (S): la Hjems oppgaverader (eller en dedikert knapp) gå rett til `/kuber/[id]/inspeksjon/ny`, og gjør Kuber-tom-tilstanden trykkbar mot `/kuber/ny`. Fjerner friksjon i sesongens hyppigste handling.
2. **Én konsistent wizard-exit** (M): Avbryt-knapp på alle 4 steg med «Lagre utkast»/«Forkast», og rett den usanne dialogteksten — eliminerer datatap-risiko og forvirring.
3. **Synliggjør AI + bredere profil-tilgang** (M): AI-teaser/snarvei på kubeprofil for Hobbyist, og legg `isError`-retry i laer/samfunn. Vurder profilinngang også fra andre faner for bedre abonnements-oppdagbarhet.
