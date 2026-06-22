# Agent 10 — Retention og brukerengasjement

## Metainfo
- Filer lest: `app/(app)/(tabs)/hjem/index.tsx`, `components/home/*` (HoneyWidget, SeasonSummaryCard, ActivationGuide, HiveStatusCard, WeatherCard, LocationPickerModal — via Glob), `services/notifications.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `constants/seasonReminders.ts`, `app/(app)/(tabs)/kalender/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx` (VarroaTrend, WeightSection), `app/(app)/_layout.tsx`, `app/(app)/(tabs)/_layout.tsx`, `components/hive/WeightSection.tsx`
- Filer ikke funnet: ingen
- Diff mot forrige review (2026-06-12): **FIKSET:** (1) push-deep-link for `hiveId` håndteres nå korrekt — `_layout.tsx:49-50` `if (hiveId) { router.push('/(app)/(tabs)/kuber/${hiveId}') }`, inkl. kald start via `getLastNotificationResponseAsync`. (2) Oksalsyre- (`season_oxalic_acid`, 20. nov) og vintersjekk-påminnelse (`season_winter_check`, 15. jan) lagt til i `seasonReminders.ts:53-66` — 4-måneders stillhetshull tettet. **IKKE fikset (vedvarer):** ingen analytics, HoneyWidget fortsatt umontert, ingen år-for-år-progresjon, ingen win-back, dobbel forfalt-varslingskilde.

## Sammendrag (maks 80 ord)
To av forrige rundes HØY-funn er nå reparert (push→kube-deep-link og oksalsyre/vintersjekk-påminnelser), så varslingskanalen er nå både handlingsorientert OG riktig rutet. Tre strukturelle hull dominerer fortsatt: (1) null analytics — aktivering og churn kan ikke måles før lansering; (2) ingen win-back for stille frafall (`last_seen` finnes ikke); (3) ingen år-for-år-mestring. HoneyWidget er fortsatt ferdigbygget men aldri montert. Dobbel forfalt-varsling (klient + server) gir varslingstretthet-risiko.

## Fungerer godt (maks 5 punkter)
- `weekly-hive-alerts/index.ts:122-148` — varroa-trend (3 stigende) + høy-varroa med 30-dagers behandlingssjekk er konkrete, handlingsorienterte push. Ikke rør.
- `_layout.tsx:44-60` — push-respons-listener håndterer nå `hiveId` og kald start korrekt. Forrige HØY-funn lukket.
- `seasonReminders.ts:54-66` — oksalsyre (yngelfri) + vintersjekk dekker nå hele lavsesongen; god domenetekst.
- `hjem/index.tsx:273-330` — vær + «FLY-DAG» + 5-dagers prognose (Yr, TTL 1t) gir reell daglig åpningsgrunn.
- `notifications.ts:209-262` — svermnærhetsvarsel (30 km haversine) er unikt og sesongriktig.

## Funn

**[HØY]** `(hele repo)` — Ingen analytics/event-instrumentering (vedvarer). Grep `analytics|posthog|amplitude|mixpanel|trackEvent|logEvent` gir kun treff i `reports/`+`docs/` — null i kildekode; kun Sentry. — Konsekvens: aktivering, retention og konverteringsmålet («100 betalende») er blindflyging; effekten av alle andre retention-tiltak kan ikke verifiseres. — Løsning: lett RN-instrumentering (PostHog/Amplitude) med 6–8 events: `app_open`, `hive_created`, `inspection_completed`, `ai_analysis_run`, `upgrade_modal_shown`, `purchase_completed`, `push_opened`, `report_generated`. `push_opened` kan hektes på eksisterende listener i `_layout.tsx:45`. — Innsats: M — Konfidens: HØY

**[HØY]** `supabase/functions/weekly-hive-alerts/index.ts:51-54` — Ingen win-back for inaktive brukere (vedvarer). Funksjonen velger kun `profiles … .not('push_token','is',null)` og varsler bare om kube-*tilstand*; en bruker som slutter helt å åpne appen (men har sunne kuber) får aldri kontakt. `last_seen`-kolonne finnes ikke (grep i migrations: 0 treff). — Konsekvens: stille frafall — den vanligste churn-formen — fanges aldri; ingen reaktivering før neste sesong. — Løsning: `last_seen_at`-kolonne (oppdater ved `app_open`) + win-back-gren ved 30/60 dager («Det er X dager siden sist — kubene dine venter»). — Innsats: M — Konfidens: HØY

**[HØY]** `components/home/SeasonSummaryCard.tsx:30-34` — Ingen år-for-år-progresjon eller milepæler (vedvarer). `inspections.filter((i) => i.inspectedAt.startsWith(currentYear))` — fjorårsdata finnes i `allInspections`/`harvests` men vises aldri; ingen «X kg mer enn i fjor», ingen milepæler (100. inspeksjon, første høsting, 3 år som birøkter). WeightSection (`:182-208`) viser kun diff mellom to siste veiinger — ikke sesongnarrativ. — Konsekvens: mestringsfølelse over sesonger — kjernedriveren for langtidsretention hos voksne hobbyister — mangler helt. — Løsning: fjorårslinje i SeasonSummaryCard + diskrete milepæl-kort (ikke gamification-badges) fra eksisterende data. — Innsats: L — Konfidens: HØY

**[MEDIUM]** `components/home/HoneyWidget.tsx:44` — Ferdigbygget honningprognose-widget importeres fortsatt aldri (grep `HoneyWidget`: kun egen definisjon). Beregner årsestimat fra sesongfaktorer + viser logget vs. estimat — nettopp den fremoverskuende kroken dashboardet mangler. — Konsekvens: død retention-funksjon; vedlikeholdsbyrde uten verdi. — Løsning: monter på `hjem` under hero-stats (props finnes alt: `activeHives.length`, `harvestedKgThisYear`), eller slett filen. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `hjem/index.tsx:200-206` + `weekly-hive-alerts/index.ts:112-120` — Dobbel forfalt-varslingskilde (vedvarer). Klienten planlegger lokal påminnelse per forfalt kube (`scheduleInspectionReminderDeduped`) mens serveren sender ukentlig push for samme tilstand (`type: 'inspection_overdue'`). Dedup er kun lokal (AsyncStorage per hiveId), aldri koordinert. — Konsekvens: duplikatvarsler → varslingstretthet → brukere skrur av push (taper hele kanalen). — Løsning: la serveren eie forfalt-varsler; behold lokal kun som fallback når `push_token` mangler. — Innsats: M — Konfidens: MEDIUM

**[MEDIUM]** `hjem/index.tsx:333-351` — Hero-stats (`KUBER / SNITT / KG`) er statiske dag-til-dag; vær/fly-dag er eneste daglige variasjon (vedvarer). Ingen rotert «dagens tips» tross at `SeasonGuide`/`pollenCalendar`-innhold finnes. — Konsekvens: svak åpningsgrunn utenom inspeksjonsdager og fly-dager. — Løsning: dato-seedet tipskort fra eksisterende sesonginnhold. — Innsats: S — Konfidens: MEDIUM

**[MEDIUM]** `app/(app)/(tabs)/_layout.tsx:88` — Feed-fane bygget men skjult (`href: null`). Samarbeid har nå UI, men delte kuber gir ingen aktivitetsvarsler. — Anbefaling: IKKE aktiver feed før lansering — tom feed ved <100 brukere skader mer enn den gagner (tomt sosialt rom signaliserer død app). Prioriter i stedet aktivitetsvarsel for delte kuber («X inspiserte felleskuben») som konkret Lag-tier-verdi. — Innsats: M — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/kalender/index.tsx:66-84` — Kalenderen er rent reaktiv (vedvarer); ingen «foreslå neste inspeksjon»-handling (siste + ~10 dager) etter fullført inspeksjon. — Konsekvens: lavere planlagt retur mellom inspeksjoner. — Løsning: auto-foreslå neste-inspeksjon-event ved lagring. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `components/home/ActivationGuide.tsx` — Aktiveringsguiden auto-dismisses permanent ved fullføring; ingenting erstatter slot'en (vedvarer). — Konsekvens: engasjements-gap mellom aktivering og vane. — Løsning: ukentlig mål-kort («1 inspeksjon denne uken») i samme posisjon. — Innsats: M — Konfidens: MEDIUM

## Topp-3 anbefalinger
1. **Minimal analytics (6–8 events) før lansering** — uten dette kan verken aktivering, churn eller effekten av punkt 2/3 måles. Hekt `push_opened` på eksisterende listener (`_layout.tsx:45`). — Innsats: M.
2. **`last_seen_at` + win-back-gren i weekly-hive-alerts** — fanger stille frafall, den dominerende churn-formen, og gjenbruker eksisterende push-infrastruktur. — Innsats: M.
3. **Monter HoneyWidget (S) nå + år-for-år i SeasonSummaryCard (L)** — fremoverskuende prognose umiddelbart; fjorårssammenligning som første post-lansering-løft for langtidsretention. Begge bruker data som allerede hentes på dashboardet.
