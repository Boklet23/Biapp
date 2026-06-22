# Agent 1 — Navigasjonsarkitektur og informasjonsstruktur

## Metainfo
- **Filer lest:** `app/(app)/_layout.tsx`, `app/(app)/(tabs)/_layout.tsx`, `app/(app)/(tabs)/kuber/_layout.tsx`, `hjem/index.tsx`, `kuber/index.tsx`, `kuber/[id]/index.tsx`, `kuber/[id]/inspeksjon/ny.tsx`, `laer/index.tsx`, `samfunn/index.tsx`, `kalender/index.tsx`, `app/(app)/profil.tsx`, `components/home/ActivationGuide.tsx`; grep av `router.*`-kall i `app/*.tsx`, BackHandler (0 treff), push-payload i `weekly-hive-alerts/index.ts`; Glob av `kuber/**`.
- **Filer ikke funnet:** ingen. `sammenlign.tsx`/`sesongsammenligning.tsx`/`[id]/samarbeid.tsx` bekreftet registrert i `kuber/_layout.tsx:21-23`.
- **Diff mot forrige review (2026-06-18):** **Verifisert fikset:** (1) Kuber-tabPress → `navigate('kuber',{screen:'index'})` (`(tabs)/_layout.tsx:55-58`); (2) `alertHiveCount` teller unike kuber (`hjem/index.tsx:174,446`); (3) ActivationGuide steg 2 går til wizard ved 1 kube + skjules ved 0 kuber (`ActivationGuide.tsx:108-111`, `hjem/index.tsx:410`); (4) Hjem-tomtilstand er nå rik trykkbar CTA mot `/kuber/ny` (`hjem/index.tsx:363-377`). **[REGRESJON] ingen.** **Fortsatt åpne:** «start inspeksjon» = 3 trykk, usann avbryt-dialog, passiv Kuber-tomtilstand, manglende `isError` i laer/samfunn.

## Sammendrag (maks 80 ord)
Navigasjonen er moden: 5 fornuftige faner, grunn stakk (maks 3), draft-lagring i wizard, push-ruting komplett, og alle fire diff-punkter fra forrige runde er verifisert fikset uten regresjon. Gjenstående hull er moderate: kjernehandlingen «start inspeksjon» krever fortsatt 3 trykk (kravet ≤2), wizardens avbryt-dialog lyver om datatap, Kuber-fanens tomme tilstand er passiv tekst (i kontrast til Hjems nye CTA), og laer/samfunn mangler feilhåndtering. Profil nås kun via Hjem.

## Fungerer godt (maks 5)
- **Push-ruting komplett + verifisert payload:** `hiveId`→kube, `eventId`→kalender, pluss kald-start (`_layout.tsx:44-58`); edge-funksjonen sender faktisk `hiveId` (`weekly-hive-alerts/index.ts:118,131,146`).
- **Kuber-fane-fix:** `tabPress` tvinger alltid oversikten, ikke sist åpnede kube (`(tabs)/_layout.tsx:55-58`).
- **Wizard-utkast:** AsyncStorage-draft lagres per felt + gjenopprettes med toast; AI-resultat (`varroaAiResult`) persisteres (`ny.tsx:103-159`).
- **Konsistent premium-gating:** sammenlign/sesong/samarbeid sjekker tier FØR push og åpner UpgradeModal (`kuber/index.tsx:178,184`, `[id]/index.tsx:307-313`).
- **Feilstater på kjerneskjermer:** Kuber (`index.tsx:113-128`), kube-detalj (`[id]/index.tsx:212-227`), Hjem (`hjem/index.tsx:381-390`), kalender-toast (`kalender/index.tsx:58-64`).

## Funn

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:481` & `[id]/index.tsx:386` — «Start inspeksjon» krever 3 trykk fra app-åpning: Hjem → oppgaverad (`router.push({ pathname: '/kuber/[id]', params: { id: hive.id } })`) → FAB «+ Inspeksjon». «Denne uken / Inspeksjoner»-radene ruter til kubeprofil, ikke til `/kuber/[id]/inspeksjon/ny`. — Konsekvens: i sesong (juni=sverming) er dette den hyppigste handlingen; ≤2-trykk-kravet brytes. — Løsning: la oppgaveradene (eller egen knapp på raden) gå rett til wizard. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:262-282` — Avbryt-dialogen (kun steg 1) sier `'Data du har lagt inn vil ikke bli lagret'` og kjører `AsyncStorage.removeItem(draftKey(id))`, mens header-/hardware-back på steg 2–4 går ett steg tilbake og beholder utkastet stille. Tre exit-veier, tre semantikker; dialogteksten er faktisk usann (draft persisteres kontinuerlig, `ny.tsx:136-159`). Uendret. — Konsekvens: forvirring + risiko for utilsiktet datatap. — Løsning: «Avbryt» på alle steg med valg «Lagre utkast»/«Forkast». — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/index.tsx:233-235` — Tom-tilstand i kubelista er passiv tekst: `<Text style={styles.emptyText}>Trykk + for å legge til din første bikube</Text>` — ingen trykkbar CTA. Hjem fikk rik CTA (`hjem/index.tsx:363-377`), men Kuber-fanen henger igjen. — Konsekvens: nybegynner som åpner Kuber-fanen først må gjette at «+»-FAB-en nederst til høyre er handlingen. — Løsning: gjør tom-tilstanden trykkbar mot `/kuber/ny` (gjenbruk Hjems CTA-mønster). — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/laer/index.tsx:36-44` & `samfunn/index.tsx:27-39` — Fortsatt ingen `isError`: laer destrukturerer kun `data` for `hives`/`harvests`/`diseases`; samfunn kun `data`/`isLoading` for `grouped`/`vendors`. Kalender bruker `error`+toast (`kalender/index.tsx:58-64`), men disse to gjenstår. — Konsekvens: nettverksfeil → stille tomme lister uten retry. — Løsning: samme retry/toast-mønster som kuber/kalender. — Innsats: S — Konfidens: HØY

**[MEDIUM]** Oppdagbarhet av AI-varroa — eneste funksjonelle inngang er wizard-steg 3 (`ny.tsx:322-336`), 4+ trykk dypt bak en kube-inspeksjon. Hjem nevner AI i tom-tilstand/nudge (`hjem/index.tsx:372,402`), men nudgen åpner UpgradeModal, ikke funksjonen. Betalende Hobbyist har ingen synlig påminnelse om at AI finnes. — Konsekvens: nøkkel-differensiatoren for Hobbyist (49kr) er nær usynlig → svak verdiopplevelse/retention. — Løsning: AI-teaser/snarvei på kubeprofil (f.eks. i VarroaTrend-kortet `[id]/index.tsx:328`). — Innsats: M — Konfidens: MEDIUM

**[LAV]** Profil har én eneste inngang: avatar på Hjem (`hjem/index.tsx:271`, eneste `router.push('/(app)/profil')`-treff). Fra Kuber/Kalender/Info/Samfunn er innstillinger/abonnement/utlogging/slett-konto unåelig uten å gå via Hjem. — Konsekvens: dårlig oppdagbarhet for abonnement (konvertering) og kontostyring. — Løsning: profilinngang (avatar/tannhjul) også på Info eller Samfunn. — Innsats: M — Konfidens: HØY

**[LAV]** `(tabs)/_layout.tsx:73` (`title: 'Info'`) for `laer/`-mappen — UI internt konsistent (header «Info», `laer/index.tsx:94`), men «Info» skjuler at Honningprognose (Pro-verktøy, `laer/index.tsx:96-105`) og nybegynnerguide ligger her. — Løsning: vurder «Lær» eller skill verktøy ut. — Innsats: S — Konfidens: MEDIUM

**[LAV]** Skjult feed: `(tabs)/_layout.tsx:88` (`href: null`). Grep bekrefter at ingen kall utenfor `feed/` peker dit; `/feed/ny` kalles kun fra `feed/index.tsx:87,98`. Ingen feilende ruter — sovende kode. — Innsats: – — Konfidens: HØY

**Øvrige verifiseringer (ingen funn):** Maks stakkdybde i Kuber = 3 (liste → `[id]` → `inspeksjon/ny`, som `router.replace`-er til `[inspId]`, `ny.tsx:224` — wizard blir ikke liggende i stacken). Ingen `BackHandler`/`beforeRemove`-overstyringer (grep: 0 treff) → standard Android-back på fane-rot og wizard. Wizard frem/tilbake mister ikke felt (all state i forelder, `ny.tsx:71-95`). Deep links kald-start + warm håndteres likt via felles `handleResponse` (`_layout.tsx:45-59`). Sammenlign/sesong/samarbeid-ruter alle registrert (`kuber/_layout.tsx:21-23`).

## Topp-3 anbefalinger
1. **Kutt «start inspeksjon» til ≤2 trykk** (S): la Hjems oppgaverader (`hjem/index.tsx:481`) gå rett til `/kuber/[id]/inspeksjon/ny`, og gjør Kuber-tomtilstanden trykkbar mot `/kuber/ny`. Fjerner friksjon i sesongens hyppigste handling.
2. **Én konsistent wizard-exit** (M): «Avbryt» på alle 4 steg med «Lagre utkast»/«Forkast», og rett den usanne dialogteksten — eliminerer datatap-risiko og forvirring.
3. **Synliggjør AI + bredere profil-tilgang** (M/S): AI-teaser på kubeprofil for Hobbyist, `isError`-retry i laer/samfunn, og profilinngang fra minst én fane til utenom Hjem (abonnements-oppdagbarhet).
