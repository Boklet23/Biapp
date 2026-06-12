# Agent 10 — Retention og brukerengasjement

## Metainfo
- Filer lest: `app/(app)/(tabs)/hjem/index.tsx`, `components/home/*` (HoneyWidget, SeasonSummaryCard, ActivationGuide, HiveStatusCard, WeatherCard, LocationPickerModal — via Glob), `services/notifications.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `constants/seasonReminders.ts`, `app/(app)/(tabs)/kalender/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `app/(app)/(tabs)/samfunn/index.tsx`, `app/(app)/_layout.tsx`, `app/(app)/(tabs)/kuber/[id]/samarbeid.tsx`, `services/hive.ts`, `supabase/migrations/0008_hive_collaborators.sql`, `0016/0018_weekly_alerts*.sql`
- Filer ikke funnet: ingen
- Diff mot forrige review: lest arkiv: ja. **Endret siden sist:** Samarbeid har nå reell UI (`samarbeid.tsx` — inviter/fjern via e-post) og RLS gir kollaboratører lesetilgang til delte kuber/inspeksjoner (`0008:22-37`) — forrige funn «DB-only uten UI» er utdatert. **Ikke fikset:** HoneyWidget fortsatt umontert, ingen år-for-år-progresjon, ingen win-back, ingen analytics, dobbel varslingskilde.

## Sammendrag (maks 80 ord)
Varslingsmotoren er handlingsorientert og god (varroa-trend, forfalte inspeksjoner, svermnærhet), men tre strukturelle hull dominerer: (1) null analytics — retention kan ikke måles i det hele tatt; (2) push-trykk lander ikke på riktig skjerm (kun kalender-eventId håndteres); (3) appen er helt stille november–februar — ingen oksalsyre-påminnelse i det viktigste vinduet og vinterundertrykte alerts gir 4 måneders kontaktpause rett før vårchurn.

## Fungerer godt (maks 5 punkter)
- `weekly-hive-alerts/index.ts:122-148` — varroa-trenddeteksjon (3 stigende målinger) og høy-varroa med behandlingssjekk er konkrete, handlingsorienterte varsler. Ikke rør.
- `services/notifications.ts:209-250` — svermnærhetsvarsel (30 km haversine mot egne kuber) er unikt og sesongriktig.
- `hjem/index.tsx:269-326` — vær + «FLY-DAG» + 5-dagers prognose gir reell daglig grunn til å åpne appen.
- `components/home/ActivationGuide.tsx` — 3-stegs aktivering med progressbar og auto-dismiss er solid.
- `app/(app)/_layout.tsx:20-23` — sesongpåminnelser auto-aktiveres ved innlogging når tillatelse gis.

## Funn

**[HØY]** `(hele repo)` — Ingen analytics/event-instrumentering. Grep etter `analytics|posthog|amplitude|mixpanel|trackEvent` gir null treff; kun Sentry finnes. — Konsekvens: aktivering, churn og konverteringsmål («100 betalende») kan ikke måles; alle retention-tiltak blir blindflyging. — Løsning: minimal instrumentering (PostHog/Amplitude RN): `app_open`, `hive_created`, `inspection_completed`, `ai_analysis_run`, `upgrade_modal_shown`, `purchase_completed`, `push_opened`, `report_generated`. — Innsats: M — Konfidens: HØY

**[HØY]** `app/(app)/_layout.tsx:40-43` — Push-trykk deep-linker ikke til kube: `const eventId = ...data?.eventId; if (eventId) { router.push('/(app)/(tabs)/kalender' ...)}` — men `weekly-hive-alerts/index.ts:117` sender `data: { hiveId: hive.id, type: 'inspection_overdue' }` og lokale påminnelser sender `{ hiveId, type: 'inspection_reminder' }` (`notifications.ts:122`). Ingen handler for `hiveId`. — Konsekvens: primær retention-kanal konverterer ikke til handling — brukeren lander på forrige skjerm og må selv finne kuben. — Løsning: håndter `hiveId` i listener: `router.push({ pathname: '/kuber/[id]', params: { id: hiveId }})`. — Innsats: S — Konfidens: HØY

**[HØY]** `constants/seasonReminders.ts:10-53` + `weekly-hive-alerts/index.ts:111-112` — 4 måneders total stillhet nov–feb. Siste sesongpåminnelse er 1. oktober; ingen oksalsyre-påminnelse for nov–des-vinduet (yngelfri periode — viktigste vinterbehandling). Samtidig undertrykker serveren forfalte-varsler om vinteren: `const isWinter = [10, 11, 0, 1].includes(now.getMonth())`. — Konsekvens: null kontakt november–februar er et domene-naturlig churn-vindu; brukere som glemmer oksalsyre får også dårligere overvintring → mister bier → mister appen. — Løsning: legg til `season_oxalic` (ca. 20. november) og `season_winter_check` (januar, «lytt til kuben/sjekk fôr») i SEASON_REMINDERS. — Innsats: S — Konfidens: HØY

**[HØY]** `components/home/SeasonSummaryCard.tsx:32-34` — Ingen år-for-år-progresjon eller milepæler (vedvarer fra forrige review): `inspections.filter((i) => i.inspectedAt.startsWith(currentYear))` — fjoråret finnes i data men vises aldri; ingen «X kg mer enn i fjor», ingen milepæler (100. inspeksjon, første høsting). — Konsekvens: mestringsfølelse over sesonger — kjernedriver for langtidsretention hos voksne hobbyister — mangler helt. — Løsning: år-for-år-linje i SeasonSummaryCard + diskrete milepæl-kort basert på eksisterende harvest/inspection-data. — Innsats: L — Konfidens: HØY

**[HØY]** `supabase/functions/weekly-hive-alerts/index.ts:51-54` — Ingen win-back for inaktive brukere (vedvarer). Funksjonen velger kun `profiles ... .not('push_token','is',null)` og varsler bare om kube-tilstand; en bruker som slutter helt å bruke appen får aldri et «vi savner deg»-varsel, og `last_seen` finnes ikke i skjemaet (grep i migrations: 0 treff). — Konsekvens: stille frafall fanges aldri. — Løsning: `last_seen_at`-kolonne (oppdater ved app-åpning) + win-back-gren i edge-funksjonen ved 30/60 dager. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `components/home/HoneyWidget.tsx:44` (vedvarer) — `export function HoneyWidget(...)` er fortsatt ikke importert noe sted (grep: kun definisjonen). Ferdig bygget honningprognose-widget vises aldri. — Konsekvens: død retention-funksjon; årsestimat er nettopp den fremoverskuende kroken dashboardet mangler. — Løsning: monter på hjem under hero-stats, eller slett. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:196-202` + `weekly-hive-alerts/index.ts:112-120` (vedvarer) — Dobbel varslingskilde for forfalt inspeksjon: klienten planlegger lokal påminnelse per forfalt kube (`scheduleInspectionReminderDeduped(hiveId, hiveName)`) mens serveren sender ukentlig push for samme tilstand. Dedup er kun lokal (AsyncStorage per hiveId), aldri koordinert med server. — Konsekvens: duplikatvarsler → varslingstretthet → brukere skrur av push. — Løsning: la serveren eie «forfalt»-varsler; behold lokal kun som fallback uten push-token. — Innsats: M — Konfidens: MEDIUM

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:329-347` (vedvarer, delvis) — Hero-stats (`KUBER / SNITT / KG`) er statiske dag-til-dag; vær/fly-dag er eneste daglige variasjon. Ingen «dagens tips»-rotasjon selv om `seasonGuide.ts`/`beginnerGuide.ts`-innhold finnes. — Konsekvens: svak daglig åpningsgrunn utenom inspeksjonsdager. — Løsning: daglig rotert tipskort (dato-seedet indeks i eksisterende innhold). — Innsats: S — Konfidens: MEDIUM

**[MEDIUM]** `app/(app)/(tabs)/samfunn/index.tsx:27-39` — Samfunn er en statisk katalog (lag/utstyr cached 24t+) pluss svermkart; ingen brukergenerert aktivitet. Feed-fanen er bygget men skjult (`_layout.tsx:78`: `<Tabs.Screen name="feed" options={{ href: null }} />`). Samarbeid har nå UI, men delte kuber gir ingen aktivitetsvarsler («X inspiserte felleskuben»). — Konsekvens: ingen nettverkseffekt; svermkartet brukes kun i sesong. — Anbefaling: IKKE aktiver feed før lansering (tom feed skader mer enn den gagner ved <100 brukere); prioriter heller aktivitetsvarsel for delte kuber (Lag-tier-verdi). — Innsats: M — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/kalender/index.tsx:66-84` (vedvarer) — Kalenderen er reaktiv; `createMutation` krever manuell hendelse, ingen «foreslå neste inspeksjon»-handling etter fullført inspeksjon (siste + 10 dager). — Konsekvens: lavere mellom-inspeksjons-retur. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `components/home/ActivationGuide.tsx:50-56` (vedvarer) — Guiden auto-dismisses permanent ved fullføring (`AsyncStorage.setItem(DISMISSED_KEY, '1')`); ingenting erstatter den. — Konsekvens: engasjements-gap mellom aktivering og vane. — Løsning: ukentlig mål-kort («1 inspeksjon denne uken») i samme slot. — Innsats: M — Konfidens: MEDIUM

## Topp-3 anbefalinger
1. **Fiks push-deep-link for `hiveId` + legg til oksalsyre/vinter-påminnelser** (`_layout.tsx` + `seasonReminders.ts`). To S-fikser som reparerer den eksisterende retention-kanalen før lansering. — Innsats: S+S, effekt: push→handling-konvertering + tetter 4-måneders stillhetsvindu.
2. **Minimal analytics-instrumentering (8 events)** før lansering — ellers kan verken aktivering, churn eller effekten av alle andre tiltak måles. — Innsats: M.
3. **Monter HoneyWidget + år-for-år i SeasonSummaryCard** — fremoverskuende prognose (S) nå, fjorårssammenligning (L) som første post-lansering-løft for langtidsretention.
