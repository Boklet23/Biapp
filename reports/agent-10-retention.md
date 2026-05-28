# Agent 10 — Retention og brukerengasjement

## Metainfo
- Filer lest:
  - `app/(app)/(tabs)/hjem/index.tsx`
  - `services/notifications.ts`
  - `supabase/functions/weekly-hive-alerts/index.ts`
  - `app/(app)/(tabs)/kalender/index.tsx`
  - `app/(app)/(tabs)/kuber/[id]/index.tsx` (første 200 linjer)
  - `components/home/HiveStatusCard.tsx`
  - `components/home/SeasonSummaryCard.tsx`
  - `components/home/HoneyWidget.tsx`
  - `components/home/WeatherCard.tsx`
  - `components/home/LocationPickerModal.tsx`
  - `constants/seasonReminders.ts`
  - `services/collaboration.ts`
  - `app/(app)/(tabs)/kuber/[id]/samarbeid.tsx`
  - `app/(app)/_layout.tsx`
- Filer ikke funnet: ingen — alle filer funnet
- Konfidensgrad: HØY

---

## Sammendrag

BiVokter har solid retention-infrastruktur for aktive sesonger: overdue-varsler, varroa-trendvarsler fra Edge Function, sesongpåminnelser og flydagindikator på dashboardet. De største svakhetene er manglende re-engagement for inaktive brukere om vinteren, at mellom-inspeksjons-innhold er begrenset, og at samarbeidsfunksjonen (lag-tier) er gjemt bak betalingsmur uten sosial synlighet.

---

## Funn

### Push-varslingsdekning

[HØY] `supabase/functions/weekly-hive-alerts/index.ts:9` — `OVERDUE_DAYS = 21` er for slapt. Varslingsterskelen i Edge Function er 21 dager, men dashboardet i appen viser "Haster"-chip etter 14 dager (`hjem/index.tsx:26`). Inkonsistens gjør at brukere ser alarmer i appen men ikke får push-varsel de 7 dagene i mellom. — Sett `OVERDUE_DAYS = 14` i Edge Function for å harmonisere.

[HØY] `services/notifications.ts:104–128` — `scheduleInspectionReminder` sender ett engangsvarsel til "i morgen kl 09" og sletter det aldri automatisk etter at inspeksjon er fullført. En bruker som inspiserer kube etter påminning vil ikke bli renullstilt med mindre `clearScheduledReminder` kalles eksplisitt. — Kall `clearScheduledReminder(hiveId)` ved vellykket lagring av ny inspeksjon i inspeksjonsformen.

[MEDIUM] `services/notifications.ts:138` + `app/(app)/_layout.tsx:19` — `scheduleSeasonalReminders()` kalles automatisk i `_layout.tsx` etter at push-tillatelse er innvilget (rettet fra tidligere versjon), men det finnes ingen sjekk på om sesongvarslene allerede er satt for inneværende år. Funksjon bruker `SEASONAL_IDS_KEY` i AsyncStorage, men nullstiller ikke ved nytt kalenderår. Sesongvarslene risikerer å forfalle og aldri bli reopprettet neste år. — Legg til en år-nøkkel i AsyncStorage og kall `scheduleSeasonalReminders` på nytt ved sesongstart (f.eks. 1. januar).

[LAV] `constants/seasonReminders.ts` — Sesongdekning er god (mars, mai, juli, august, september, oktober), men mangler januarvarsel for "kontroller vinterklynge" og februar for "bestill nytt utstyr". Disse månedene er birøkternes planleggingsperiode.

### Daily driver

[HØY] `app/(app)/(tabs)/hjem/index.tsx:164–170` — `urgentInspHives` viser de 3 kubene sortert etter inspeksjonsdato (eldst først), men ingen daglig variasjon. Dashboardet ser identisk ut dag 2 til dag 13 mellom inspeksjoner — det finnes ingenting som gir brukeren ny informasjon daglig. Konsekvens: ingen årsak til å åpne appen på dager uten inspeksjon, noe som er realiteten 5–6 av 7 dager i uka. — Legg til en "Dagens tips"-modul som roterer fra sesongguideinnholdet.

[MEDIUM] `components/home/HoneyWidget.tsx:17–27` — Honningprognosen bruker en fast `AVG_KG_PER_HIVE_PER_YEAR = 20` uten å ta hensyn til brukerens historiske avkastning. For en bruker med 5 kuber og 80 kg logget forrige sesong er estimatet meningsløst. — Bruk gjennomsnitt fra brukerens egne høstdata som basis.

[LAV] `app/(app)/(tabs)/hjem/index.tsx:233–235` — `flyDay` (flydag-indikatoren) er god daglig kontekst, men vises bare hvis brukeren har konfigurert en lokasjon. Brukere uten lokasjon ser ingen daglig vær-kontekst. Onboarding bør presse lokasjonskonfigurasjon hardere.

### Mellom-inspeksjons-verdi

[KRITISK] Ingen innhold mellom inspeksjoner — Det finnes ingen funksjonalitet som gir appen verdi i dagene mellom inspeksjoner utover statisk sesongguide og vær. Det er ingen: læringsinnhold knyttet til aktuelle kubers tilstand, fremgangsindikator mot neste inspeksjon, mini-quiz om birøkt eller "visste du at"-kort. Konsekvens: appen åpnes kun når noe er feil eller inspeksjon forfaller, og retention på dag 7–14 vil være lav. — Implementer en roterende "ukestips" basert på aktuell sesong og kubedata (f.eks. "Alfa-dronning i Kube 2 er over 2 år — vurder å avle ny").

[MEDIUM] `app/(app)/(tabs)/kalender/index.tsx:262–280` — Pollenkalenderen er bra mellom-inspeksjons-innhold men er gjemt i Kalender-fanen og ikke referert fra dashboardet. Brukere som ikke åpner Kalender finner det aldri. — Legg en "Denne uken i naturen"-snuttwidget på Hjem-dashboardet.

### Progresjon og mestring

[HØY] `app/(app)/(tabs)/kuber/[id]/index.tsx:35–121` — VarroaTrend-grafen viser historisk utvikling per kube (opptil 6 punkter), men grafen er kun tilgjengelig per kube inne i kubeprofilen. Det finnes ingen sesong-aggregert varroa-trend på tvers av alle kuber, og ingen "årets beste kube"-statistikk. — Legg til et sesongsammendrag-kort på Hjem med varroa-snitt, honning og inspeksjonsfrekvens vs. forrige sesong.

[MEDIUM] `components/home/SeasonSummaryCard.tsx:32–68` — Sesongkortet eksisterer som komponent men brukes ikke i `hjem/index.tsx` (ikke importert eller brukt i render-treet). Kortet viser inspeksjonsantall, gjennomsnittlig varroa og dronning-sett — verdifull fremgangsdata som aldri vises. — Importer og monter `SeasonSummaryCard` i Hjem-skjermen.

[LAV] `components/home/HiveStatusCard.tsx` — Kortene viser kubens navn, dager siden sist inspeksjon og moodEmoji. Mangler helsepoeng-tall som er beregnet og tilgjengelig via `computeHealthScore`. Et helsescore-tall på kortet ville gitt umiddelbar progresjonsfølelse.

### Churn-forebygging

[KRITISK] Ingen vinterengasjement-strategi — Det finnes ingen kode som håndterer perioden november–februar spesifikt. `buildAlerts` i `hjem/index.tsx:62–82` baserer alle varsler på inspeksjonsintervall, noe som er irrelevant om vinteren (kubene skal ikke inspiseres). Konsekvens: brukere som slutter å inspisere om høsten mottar ingenting fra appen fra oktober til mars, og vil ha churn-sjanse svært høy til neste sesong. — Legg til vintermodus: erstat overdue-varsler med "Vintersjekk"-påminnelse en gang i måneden (november–februar), og send en "Sesongen starter snart"-push i slutten av februar.

[HØY] `supabase/functions/weekly-hive-alerts/index.ts:110` — Edge Function sender `inspection_overdue`-push til brukere uten hensyn til sesong. Brukere som frivillig har lagt kubene til vinterro vil motta "inspisert"-varsler gjennom hele vinteren. Konsekvens: varseltrøtthet og varseldeprekering. — Sjekk gjeldende måned i Edge Function og hopp over overdue-varsler i november–februar.

[HØY] `services/notifications.ts:81–93` — `scheduleInspectionReminderDeduped` sjekker om en reminder allerede eksisterer i AsyncStorage, men invaliderer aldri eksisterende ID-er som kan ha utløpt (en enkelt trigger til "i morgen kl 09" er ikke gjentakende). En bruker som har 14 dagers gammel kube og ikke inspiserer, mottar kun ett varsel totalt. — Bruk en ukentlig repeterende trigger i stedet for en one-shot dato-trigger.

### Sosiale mekanismer

[HØY] `app/(app)/(tabs)/kuber/[id]/samarbeid.tsx:59–76` — Samarbeidsfunksjonen er bak Lag-tier (499 kr/md) og er skjult i en sub-fane av kubeprofilen. Det finnes ingen sosial oppdagelsesflyt — ingen notifisering til inviterte medarbeidere via push eller e-post, ingen aktivitetsstrøm for delte kuber. En invitert samarbeidspartner har ingen annen måte å vite om ny aktivitet enn å åpne appen manuelt. — Send push-varsel til alle samarbeidspartnere når eier logger ny inspeksjon på delt kube.

[MEDIUM] `services/collaboration.ts:42–70` — `addCollaboratorByEmail` krever at mottakeren allerede er registrert bruker. Det finnes ingen invite-by-link flyt. Dette blokkerer viral vekst og peer-to-peer onboarding. — Implementer unik invitasjonslenke som oppretter bruker og kobler samarbeid i én flyt.

---

## Topp-3 anbefalinger

1. **Implementer vintermodus i Edge Function og dashboardet** (`supabase/functions/weekly-hive-alerts/index.ts:110` og `hjem/index.tsx:62`) — Sesongbevisst logikk som bytter fra "inspeksjon forfalt" til "månedlig vintersjekk" i november–februar er den viktigste churn-forebyggende endringen. Uten dette mister appen kontakten med brukerne i 4 måneder hvert år og betaler prisen om våren med lav reaktivering.

2. **Monter `SeasonSummaryCard` i Hjem-skjermen og legg til daglig innhold** (`components/home/SeasonSummaryCard.tsx` + `hjem/index.tsx`) — Komponenten er ferdigimplementert men aldri montert. Å vise sesongaggregert statistikk gir brukeren en daglig grunn til å åpne appen selv uten inspeksjon, og fremgangsdata er dokumentert som den sterkeste engasjementsdriveren i hobbypregede apper.

3. **Harmoniser overdue-terskelen og gjør inspeksjonspåminneren gjentakende** (`supabase/functions/weekly-hive-alerts/index.ts:9` og `services/notifications.ts:113–128`) — `OVERDUE_DAYS = 21` i Edge Function mot 14 dager i dashboardet skaper inkonsistens. Kombinert med at `scheduleInspectionReminder` er en one-shot trigger betyr dette at en bruker som ignorerer det ene varselet mottar ingen oppfølging. Gjøres begge i en PR: sett `OVERDUE_DAYS = 14` og bruk ukentlig repeterende trigger.
