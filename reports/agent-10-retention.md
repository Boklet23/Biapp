# Agent 10 — Retention og brukerengasjement

## Metainfo
- Dato: 2026-06-22 · Agent 10/13 (review v3) · read-only
- Filer lest: `app/(app)/(tabs)/hjem/index.tsx`, `components/home/*` (HoneyWidget, SeasonSummaryCard, ActivationGuide, WeatherCard, HiveStatusCard, LocationPickerModal — via Glob), `services/notifications.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `constants/seasonReminders.ts`, `app/(app)/(tabs)/kalender/index.tsx`, `app/(app)/(tabs)/_layout.tsx`, `app/(app)/_layout.tsx`
- Diff mot forrige (2026-06-18): **Begge tidligere fikser holder** — push→kube-deep-link inkl. kald start (`app/(app)/_layout.tsx:49-50`, `:56-57`) og oksalsyre/vintersjekk-påminnelser (`seasonReminders.ts:54-66`). Ingen regresjon. **Vedvarer:** ingen analytics, ingen last_seen/win-back, ingen år-for-år, HoneyWidget umontert, dobbel forfalt-varsling.

## Sammendrag (maks 80 ord)
Varslingskanalen er solid: server-side varroa-trend/høy-varroa er handlingsorienterte, deep-link til kube fungerer, sesongpåminnelser dekker hele året inkl. lavsesong. Begge forrige HØY-fikser holder, ingen regresjoner. Tre strukturelle hull dominerer fortsatt før lansering: (1) null analytics — aktivering/churn er umålbart; (2) ingen last_seen/win-back — stille frafall fanges aldri; (3) ingen år-for-år-mestring. HoneyWidget er ferdigbygget men aldri montert. Dobbel forfalt-varsling (klient + server) gir varslingstretthet-risiko.

## Fungerer godt (maks 5 punkter)
- `weekly-hive-alerts/index.ts:123-149` — varroa-trend (3 stigende verdier) + høy-varroa med 30-dagers behandlingssjekk gir konkrete, handlingsorienterte push. Ikke rør.
- `app/(app)/_layout.tsx:44-60` — push-respons-listener håndterer `hiveId`/`eventId` og kald start korrekt. Forrige HØY-funn fortsatt lukket.
- `seasonReminders.ts:54-66` — oksalsyre (yngelfri) + vintersjekk dekker hele lavsesongen; god domenetekst. Stillhetshull tettet.
- `hjem/index.tsx:281-337` — vær + «FLY-DAG» + 5-dagers prognose (Yr, TTL 1t, `:160`) gir reell daglig åpningsgrunn utenom inspeksjon.
- `notifications.ts:221-262` — svermnærhetsvarsel (30 km haversine, dedupet via `SWARM_CHECKED_KEY`) er unikt og sesongriktig.

## Funn

**[HØY]** `(hele kildekoden)` — Ingen analytics/event-instrumentering (vedvarer). Grep `analytics|posthog|amplitude|trackEvent|logEvent` gir kun treff i HoneyWidget (falsk positiv på «forecast»); null reelle event-kall, kun Sentry. — Konsekvens: aktivering, retention og målet om «100 betalende» er blindflyging; effekten av alle andre retention-tiltak kan ikke verifiseres. — Løsning: lett RN-instrumentering (PostHog/Amplitude) med 6–8 events: `app_open`, `hive_created`, `inspection_completed`, `ai_analysis_run`, `upgrade_modal_shown`, `purchase_completed`, `push_opened`, `report_generated`. `push_opened` hektes på eksisterende listener (`app/(app)/_layout.tsx:45`). — Innsats: M — Konfidens: HØY

**[HØY]** `supabase/functions/weekly-hive-alerts/index.ts:52-55` — Ingen win-back for inaktive brukere (vedvarer). Funksjonen velger kun `profiles … .not('push_token','is',null)` og varsler bare om kube-*tilstand*; en bruker som slutter å åpne appen (men har sunne kuber) får aldri kontakt. `last_seen`-kolonne finnes ikke (grep i `supabase/`: 0 treff). — Konsekvens: stille frafall — den vanligste churn-formen — fanges aldri; ingen reaktivering før neste sesong. — Løsning: `last_seen_at`-kolonne (oppdater ved `app_open`/oppstart i `app/(app)/_layout.tsx:18`) + win-back-gren ved 30/60 dager («Det er X dager siden sist — kubene dine venter»). — Innsats: M — Konfidens: HØY

**[HØY]** `components/home/SeasonSummaryCard.tsx:32-34` — Ingen år-for-år-progresjon eller milepæler (vedvarer). `inspections.filter((i) => i.inspectedAt.startsWith(currentYear))` — fjorårsdata finnes i `allInspections`/`harvests` (hentes alt på dashbordet, `hjem/index.tsx:139,145`) men vises aldri; ingen «X kg mer enn i fjor», ingen milepæler. — Konsekvens: mestringsfølelse over sesonger — kjernedriveren for langtidsretention hos voksne hobbyister — mangler helt. — Løsning: fjorårslinje i SeasonSummaryCard + diskrete milepæl-kort (ikke gamification-badges) fra eksisterende data. — Innsats: L — Konfidens: HØY

**[MEDIUM]** `components/home/HoneyWidget.tsx:44` — Ferdigbygget honningprognose-widget importeres fortsatt aldri (grep `HoneyWidget`: kun egen definisjon). Beregner årsestimat fra sesongfaktorer + viser logget vs. estimat — nettopp den fremoverskuende kroken dashbordet mangler. — Konsekvens: død retention-funksjon; vedlikeholdsbyrde uten verdi. — Løsning: monter på `hjem` under hero-stats (props finnes alt: `activeHives.length`, `harvestedKgThisYear`, `hjem/index.tsx:170,185`), eller slett filen. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `hjem/index.tsx:200-206` + `weekly-hive-alerts/index.ts:113-119` — Dobbel forfalt-varslingskilde (vedvarer). Klienten planlegger lokal påminnelse per forfalt kube (`scheduleInspectionReminderDeduped`) mens serveren sender ukentlig push for samme tilstand (`type: 'inspection_overdue'`). Dedup er kun lokal (AsyncStorage per hiveId), aldri koordinert med server. — Konsekvens: duplikatvarsler → varslingstretthet → brukere skrur av push (taper hele kanalen). — Løsning: la serveren eie forfalt-varsler; behold lokal kun som fallback når `push_token` mangler. — Innsats: M — Konfidens: MEDIUM

**[MEDIUM]** `hjem/index.tsx:340-358` — Hero-stats (`KUBER / SNITT / KG`) er statiske dag-til-dag; vær/fly-dag er eneste daglige variasjon (vedvarer). Ingen rotert «dagens tips» tross at `SeasonGuide`/`POLLEN_BY_MONTH`-innhold finnes. — Konsekvens: svak åpningsgrunn utenom inspeksjons- og fly-dager. — Løsning: dato-seedet tipskort fra eksisterende sesonginnhold. — Innsats: S — Konfidens: MEDIUM

**[MEDIUM]** `app/(app)/(tabs)/_layout.tsx:88` — Feed-fane bygget men skjult (`href: null`). — Anbefaling: IKKE aktiver feed før lansering — tom feed ved <100 brukere skader mer enn den gagner (tomt sosialt rom signaliserer død app). Prioriter i stedet aktivitetsvarsel for delte kuber («X inspiserte felleskuben») som konkret Lag-tier-verdi når samarbeid får UI. Behold `href: null` til kritisk masse. — Innsats: M — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/kalender/index.tsx:66-84` — Kalenderen er rent reaktiv (vedvarer); ingen «foreslå neste inspeksjon»-handling (siste + ~10 dager) etter fullført inspeksjon. — Konsekvens: lavere planlagt retur mellom inspeksjoner. — Løsning: auto-foreslå neste-inspeksjon-event ved lagring av inspeksjon. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `components/home/ActivationGuide.tsx:52-58` — Aktiveringsguiden auto-dismisses permanent ved fullføring; ingenting erstatter slot'en (vedvarer). — Konsekvens: engasjements-gap mellom aktivering og vane. — Løsning: ukentlig mål-kort («1 inspeksjon denne uken») i samme posisjon. — Innsats: M — Konfidens: MEDIUM

## Topp-3 anbefalinger
1. **Minimal analytics (6–8 events) før lansering** — uten dette kan verken aktivering, churn eller effekten av punkt 2/3 måles. Hekt `push_opened` på eksisterende listener (`app/(app)/_layout.tsx:45`). — Innsats: M.
2. **`last_seen_at` + win-back-gren i weekly-hive-alerts** — fanger stille frafall, den dominerende churn-formen, og gjenbruker eksisterende push-infrastruktur. — Innsats: M.
3. **Monter HoneyWidget (S) nå + år-for-år i SeasonSummaryCard (L)** — fremoverskuende prognose umiddelbart; fjorårssammenligning som første post-lansering-løft for langtidsretention. Begge bruker data som allerede hentes på dashbordet.
