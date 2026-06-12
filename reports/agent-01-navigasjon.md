# Agent 1 — Navigasjonsarkitektur og informasjonsstruktur

## Metainfo
- Filer lest: `app/(app)/_layout.tsx`, `app/(app)/(tabs)/_layout.tsx`, `app/(app)/(tabs)/kuber/_layout.tsx`, `hjem/index.tsx`, `kuber/index.tsx`, `kuber/[id]/index.tsx`, `kuber/[id]/inspeksjon/ny.tsx`, `kuber/sammenlign.tsx`, `laer/index.tsx`, `samfunn/index.tsx`, `kalender/index.tsx`, `app/(app)/profil.tsx` (grep), `components/ui/ProGate.tsx`, `components/home/ActivationGuide.tsx`, `services/notifications.ts` (grep), `supabase/functions/weekly-hive-alerts/index.ts` (grep) + full grep av `router.*`-kall i `app/` og `components/`
- Filer ikke funnet: ingen
- Diff mot forrige review: lest arkiv (`reports/archive/2026-06-10/agent-01-navigasjon.md`): ja. **Fikset siden sist:** KRITISK `[id]/samarbeid` er nå registrert (`kuber/_layout.tsx:21`), kalender har fått feiltoasts (`kalender/index.tsx:58-64`), Hjem har retry-banner og AI-nudge. **Ikke reprodusert:** forrige MEDIUM om at Hjem pusher kube-detalj inn i «egen Hjem-stack» — `hjem` er én enkelt Tabs-skjerm uten stack; `/kuber/[id]` løses til Kuber-stacken og fanebytte skjer korrekt. **Fortsatt åpne:** wizard-avbryt kun på steg 1, passiv tom-tilstand i Kuber, «Info»-navngiving, manglende error-state i laer/samfunn.

## Sammendrag (maks 80 ord)
Strukturen er sunn: 5 fornuftige faner, grunn stakk (maks 3 nivåer), draft-lagring i wizard, og forrige rundes KRITISK-funn er fikset. Viktigste gjenstående hull er at push-varsler med `hiveId` (weekly-hive-alerts, lokale inspeksjonsminner) ikke rutes noe sted — kun `eventId` håndteres, og kald-start-tap av varsel mangler helt. I tillegg: «Start inspeksjon» krever 3 trykk (kravet er ≤2), wizardens avbryt-dialog lyver om datatap, og Kuber-fanens tomme tilstand er fortsatt passiv.

## Fungerer godt (maks 5 punkter)
- **Kuber-stacken er komplett registrert** (`kuber/_layout.tsx:15-23`) — alle 8 ruter inkl. `[id]/samarbeid` har tittel; modal-presentasjon på `ny`/`rediger` er riktig valgt.
- **Wizard-utkast**: AsyncStorage-draft lagres per felt-endring og gjenopprettes med toast (`inspeksjon/ny.tsx:99-145`) — exit via header-back/hardware-back mister ikke data.
- **Feil/retry på kjerneskjermer**: Kuber-listen (`kuber/index.tsx:112-127`) og Hjem (`hjem/index.tsx:370-379`) har handlingsorientert retry.
- **Tom-tilstand på Hjem** (`hjem/index.tsx:351-367`) er en selgende, trykkbar CTA rett til `/kuber/ny`.
- **Premium-gating i navigasjon** er konsistent: sammenlign/sesong sjekker tier FØR push (`kuber/index.tsx:177-187`) og åpner UpgradeModal i stedet for å la brukeren treffe en vegg.

## Funn

**[HØY]** `app/(app)/_layout.tsx:39-44` — Push-tap håndterer kun kalender-varsler: `const eventId = response.notification.request.content.data?.eventId ... if (eventId) { router.push('/(app)/(tabs)/kalender' as any); }`. Men weekly-hive-alerts sender `data: { hiveId: hive.id, type: 'inspection_overdue' }` (`supabase/functions/weekly-hive-alerts/index.ts:117`, også `varroa_trend`/`varroa_high`), og lokale minner sender `data: { hiveId, type: 'inspection_reminder' }` (`services/notifications.ts:122`). — Konsekvens: appens viktigste re-engagement-varsler («Høy varroa — behandling anbefales snarest») åpner bare appen der den sist var; brukeren må selv finne kuben. — Løsning: rut `hiveId` til `/kuber/[id]` i samme listener. — Innsats: S — Konfidens: HØY

**[HØY]** `app/(app)/_layout.tsx:35-47` — Ingen kald-start-håndtering av varseltrykk: `getLastNotificationResponseAsync`/`useLastNotificationResponse` finnes ikke i kodebasen (grep: 0 treff). Listeneren registreres først etter mount og fanger ikke responsen som startet appen. — Konsekvens: trykk på push når appen er drept → lander på Hjem uten kontekst; gjelder alle varseltyper inkl. kalender. — Løsning: les `getLastNotificationResponseAsync()` ved oppstart og rut payload. — Innsats: S — Konfidens: HØY

**[HØY]** Trykkavstand til kjernehandlingen — «Start inspeksjon» krever minimum **3 trykk** fra app-åpning: Hjem → kube-rad (`hjem/index.tsx:463`) → «+ Inspeksjon»-FAB (`kuber/[id]/index.tsx:386`), alternativt Kuber-fane → kube → FAB. Det finnes ingen direkte «Ny inspeksjon»-inngang på Hjem; oppgavelisten «Denne uken / Inspeksjoner» (`hjem/index.tsx:439-484`) ruter til kubeprofil, ikke til wizard. — Konsekvens: i sesong (juni) er dette handlingen brukere gjør oftest; kravet ≤2 trykk brytes. — Løsning: la oppgaveraden (eller en knapp i den) gå rett til `/kuber/[id]/inspeksjon/ny`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:249-263` — Avbryt-dialogen på steg 1 sier «Data du har lagt inn vil ikke bli lagret» og sletter utkastet (`AsyncStorage.removeItem(draftKey(id))`), mens exit via header-back/hardware-back (steg 2–4 har ingen Avbryt-knapp, kun «← Tilbake» ett steg) beholder utkastet og gjenoppretter det stille. — Konsekvens: tre exit-veier med tre ulike semantikker; dialogteksten er faktisk usann (draft finnes). Uendret siden forrige review. — Løsning: én konsistent exit: Avbryt-knapp på alle steg med valgene «Lagre utkast» / «Forkast». — Innsats: M — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/index.tsx:229-234` — Tom-tilstand er fortsatt passiv tekst: `<Text style={styles.emptyText}>Trykk + for å legge til din første bikube</Text>` — ingen trykkbar CTA, i kontrast til Hjems rike CTA. Uendret siden forrige review. — Konsekvens: nybegynner som åpner Kuber-fanen først må gjette at «+» er FAB-en nede til høyre. — Løsning: gjør tom-tilstanden trykkbar mot `/kuber/ny`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/laer/index.tsx:34-42` & `samfunn/index.tsx:27-39` — Fortsatt ingen `isError`-håndtering: `const { data: hives = [] } = useQuery({ queryKey: ['hives'], ... })` (laer) og `const { data: grouped = EMPTY_GROUPED, isLoading: lagLoading } = useQuery(...)` (samfunn) destrukturerer aldri `isError`. Kalender ble fikset (toasts, `kalender/index.tsx:58-64`); disse to gjenstår. — Konsekvens: nettverksfeil → stille tomme lister uten retry. — Løsning: samme retry-mønster som `kuber/index.tsx:112-127`. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `components/ui/ProGate.tsx:22-28` — Gated skjerm tilbyr kun retrett: `onPress={() => router.back()} ... <Text style={styles.btnText}>Tilbake</Text>`. Ingen oppgrader-CTA/UpgradeModal. — Konsekvens: navigasjonsmessig dead end for konvertering — brukeren som faktisk nådde en Pro-skjerm (deep link/regresjon i gating) sendes bare ut. — Løsning: legg «Se abonnement»-knapp som åpner UpgradeModal. — Innsats: S — Konfidens: HØY

**[MEDIUM]** Oppdagbarhet av AI-analyse — eneste funksjonelle inngang er fortsatt wizard-steg 3 (`inspeksjon/ny.tsx:307-321`), 4+ trykk dypt. Forbedret siden sist: Hjem nevner AI i nudge («🚀 Ubegrenset kuber · AI-analyse · Rapporter», `hjem/index.tsx:389`) og i tom-tilstand, men nudgen åpner UpgradeModal — ikke funksjonen. Betalende Hobbyist-brukere har ingen synlig påminnelse om at AI finnes. — Løsning: AI-teaser på kubeprofil (f.eks. i VarroaTrend-kortet). — Innsats: M — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/_layout.tsx:63` (`title: 'Info'`) vs. rutemappen `laer/` og CLAUDE.md («laer (vises som "Info")») — UI er nå internt konsistent (fane + header «Info», `laer/index.tsx:92`), så nedgradert fra HØY siden sist; gjenstår kun begrepsvalg: «Info» skjuler at honningprognose (et Pro-verktøy) og nybegynnerguide ligger her. — Løsning: vurder «Lær» eller splitt verktøy ut. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `components/home/ActivationGuide.tsx:70-76` — Begge de to første stegene navigerer til samme mål: `onPress: () => router.push('/(app)/(tabs)/kuber' as any)`. Steg 2 («Gjennomfør en inspeksjon») burde gått til brukerens (eneste) kube eller direkte til wizard når `hiveCount === 1`. — Innsats: S — Konfidens: HØY

**[LAV]** Profil har én eneste inngang: avatar på Hjem (`hjem/index.tsx:260`, eneste `router.push('/(app)/profil')`-treff i grep). Fra Kuber/Kalender/Info/Samfunn er innstillinger/abonnement/utlogging unåelig uten å gå via Hjem. — Innsats: M — Konfidens: HØY

**[LAV]** Skjult feed: `_layout.tsx:78` (`<Tabs.Screen name="feed" options={{ href: null }} />`) — ingen navigasjonskall utenfor `feed/` peker dit (grep verifisert), så ingen feilende ruter; kun sovende kode. — Innsats: – — Konfidens: HØY

**Øvrige verifiseringer (ingen funn):** Maks stakkdybde i Kuber er 3 (liste → `[id]` → `inspeksjon/ny`, som `router.replace`-er til `[inspId]` — riktig bruk så wizard ikke blir liggende i stacken, `ny.tsx:209`). Fanetilstand bevares ved fanebytte (standard Tabs-oppførsel, Kuber-stacken forblir montert). Hardware-back på fane-rotskjermer følger standard; ingen egne BackHandler-overstyringer (grep: 0 treff). 4-stegs-inndelingen (Grunninfo/Kubestatus/Helse/Notater) er logisk, stegnavigasjon frem/tilbake mister ikke felt (all state ligger i forelder).

## Topp-3 anbefalinger
1. **Rut push-varsler riktig** (S, ~1 t): håndter `hiveId`-payload → `/kuber/[id]` og legg til `getLastNotificationResponseAsync` for kald start. Gjør hele varslingsinvesteringen (weekly-hive-alerts) faktisk handlingsdyktig — direkte retention-effekt.
2. **Kutt «start inspeksjon» til 2 trykk** (S, ~1 t): la oppgaveradene på Hjem gå rett til inspeksjonswizard, og gjør Kuber-fanens tomme tilstand trykkbar. Fjerner friksjon i den hyppigste sesonghandlingen.
3. **Én konsistent wizard-exit** (M, ~2 t): Avbryt-knapp på alle 4 steg med «Lagre utkast»/«Forkast»-valg, og rett opp den usanne dialogteksten. Pluss: gi ProGate en oppgrader-CTA i stedet for kun «Tilbake».
