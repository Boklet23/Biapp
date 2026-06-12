# Agent 10 — Retention

## Metainfo
**Filer lest:** `app/(app)/(tabs)/hjem/index.tsx`, `services/notifications.ts`, `supabase/functions/weekly-hive-alerts/index.ts`, `app/(app)/(tabs)/kalender/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, alle `components/home/*.tsx` (SeasonSummaryCard, ActivationGuide, HiveStatusCard, HoneyWidget, WeatherCard, LocationPickerModal), `constants/seasonReminders.ts`, `supabase/migrations/0016_weekly_alerts_cron.sql`, `app/(app)/(tabs)/samfunn/index.tsx`, `app/(app)/_layout.tsx`, `app/(app)/profil.tsx`.
**Filer ikke funnet:** ingen (alle scope-filer fantes).
**Konfidensgrad:** Høy for varslings-/dashboard-flyt. Middels for sosial retention (Lag-tier UI minimal, mest DB-only).

## Sammendrag
Varslingsdekningen er solid: ukentlig server-cron for forfalte inspeksjoner + varroa-trend, lokale sesongpåminnelser (auto-på ved login) og svermvarsler. Dashboardet er informativt men statisk — samme tre tall hver dag uten daglig insentiv. Største hull: ingen år-for-år-progresjon/milepæler, ingen re-engagement for inaktive brukere, og Lag-tier gir null sosial retention (kubedeling er DB-only uten levende UI).

## Funn

**[HØY]** `services/notifications.ts:209` (+ `weekly-hive-alerts`) — Ingen win-back/re-engagement for inaktive brukere. Alle varsler forutsetter aktive kuber + nylige inspeksjoner. En bruker som slutter å logge inspeksjoner får kun "inspeksjon forfalt" (undertrykt nov–feb), ikke noe som drar dem tilbake etter f.eks. 30/60 dager total inaktivitet. — Konsekvens: Stille frafall fanges aldri opp. — Løsning: Legg til en "vi savner deg / kubene dine trenger deg"-gren i edge-funksjonen basert på siste app-aktivitet (last_seen i profiles).

**[HØY]** `app/(app)/(tabs)/kuber/[id]/index.tsx:35` / `components/home/SeasonSummaryCard.tsx:30` — Ingen år-for-år-progresjon eller mestringsfølelse. VarroaTrend viser kun siste 6 målinger innen én kube; SeasonSummaryCard filtrerer hardt på `currentYear` uten sammenligning mot i fjor. Ingen milepæler ("100. inspeksjon", "første honninghøsting", "3 år som birøkter"). — Konsekvens: Erfarne brukere ser ikke fremgang sesong-til-sesong — kjernedriveren for langtidsretention mangler. — Løsning: Legg til honning år-for-år-graf og milepæl-badges (kan bygge på eksisterende harvest/inspection-data).

**[HØY]** `components/home/HoneyWidget.tsx:1` — Komponenten er bygget (honningprognose, årsestimat) men IKKE importert/montert på dashboardet (`hjem/index.tsx` bruker den ikke). Død retention-funksjon. — Konsekvens: Et ferdig engasjementselement med fremtidsrettet prognose vises aldri. — Løsning: Monter `HoneyWidget` på hjem, eller fjern død kode.

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:328` — Dashboardet mangler daglig variasjon ("daily driver"). Hero-stats (kuber/snitt/kg) endrer seg sjelden dag-til-dag; eneste dynamiske element er vær/fly-dag. Ingen "dagens tips", rotasjons-fakta, eller dagens oppgave-fokus. — Konsekvens: Lite grunn til å åpne appen på dager uten inspeksjon. — Løsning: Legg til daglig rotert lærings-/sesongtips-kort (kan gjenbruke `seasonGuide.ts`-data).

**[MEDIUM]** `supabase/functions/weekly-hive-alerts/index.ts:111` — Varslings-kadens er kun ukentlig (man 07:00 UTC) og vinterundertrykt for inspeksjoner. Svermtid (mai–juli) krever ukentlig dronningcelle-sjekk, men det finnes ingen forhøyet frekvens i høysesong. Sesongpåminnelser (`seasonReminders.ts`) dekker 6 nøkkeldatoer — bra — men er statiske datoer, ikke tilstandsbaserte (f.eks. "du har ikke logget varroabehandling i august"). — Konsekvens: Tidskritiske svermhendelser kan gå 7 dager uvarslet. — Løsning: Vurder 2x/uke cron i mai–juli; gjør "manglende vinterklargjøring/varroabehandling"-varsel tilstandsbasert.

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/index.tsx:300` / `samfunn/index.tsx` — Lag-tier (499 kr, samarbeid) gir ingen sosial retention. Samarbeidsraden er kun en låst CTA mot UpgradeModal; faktisk kubedeling er DB-only (CLAUDE.md bekrefter "ingen UI"). Samfunn-fanen er en statisk katalog (lag-liste, svermkart, utstyr) — ingen feed, kommentarer eller delte aktiviteter. — Konsekvens: Dyreste tier mangler de sosiale båndene som faktisk holder brukere; ingen nettverkseffekt. — Løsning: Aktiver minst lese-tilgang til delte kuber + aktivitetsnotis ("X inspiserte felleskuben").

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:196` — Lokal `scheduleInspectionReminderDeduped` og server-`weekly-hive-alerts` kan begge varsle om samme forfalte inspeksjon → duplikate push. Lokal dedup er per-hiveId i AsyncStorage, men koordineres ikke med serveren. — Konsekvens: Varslingstretthet → notifikasjoner skrus av → tap av primær retention-kanal. — Løsning: Velg én kilde for "inspeksjon forfalt" (helst server), fjern lokal duplikat.

**[LAV]** `app/(app)/(tabs)/kalender/index.tsx:62` — Kalenderen er reaktiv (manuelt lagte hendelser + inspeksjonsmarkører) men foreslår ikke neste anbefalte inspeksjon-dato. SeasonChecklist/pollenkalender gir mellom-inspeksjons-verdi, men ingen "planlegg neste besøk"-handling som skaper kommende kalender-engasjement. — Konsekvens: Lavere mellom-inspeksjons-retur. — Løsning: Auto-foreslå neste inspeksjonsdato (siste + ~10 dager) som tappbar kalenderhendelse.

**[LAV]** `components/home/ActivationGuide.tsx:48` — God onboarding-guide, men forsvinner permanent etter 3 steg (eller dismiss) uten en "neste nivå"-progresjon. Etter aktivering finnes ingen videre gamification. — Konsekvens: Tomt engasjements-gap mellom onboarding og vane. — Løsning: Erstatt fullført guide med et lett ukentlig mål/streak-kort.

## Topp-3 anbefalinger
1. **År-for-år-progresjon + milepæl-badges** på hjem/kubeprofil (honning og varroa over flere sesonger). Sterkeste langtids-retention-driver, bruker eksisterende data. — Est. 1–2 dager.
2. **Re-engagement-gren i `weekly-hive-alerts`** basert på total app-inaktivitet (last_seen), uavhengig av inspeksjonsstatus. Fanger stille frafall. — Est. 0,5–1 dag (krever `last_seen`-kolonne).
3. **Monter HoneyWidget + daglig rotert tips-kort** på dashboardet for daglig variasjon. Lav innsats, HoneyWidget er allerede bygget. — Est. 0,5 dag.
