# Agent 9 — Tilgjengelighet (WCAG 2.1 AA)

## Metainfo
- Filer lest: `constants/colors.ts`, `constants/typography.ts`, `components/ui/Button.tsx`, `components/inspection/FrameCounter.tsx`, `components/inspection/Step4.tsx`, `components/inspection/Step3.tsx`, `components/hive/HiveCard.tsx`, `components/hive/HealthScoreSection.tsx`, `components/ui/HealthRing.tsx`, `components/ui/Toast.tsx`, `components/calendar/MonthView.tsx`, `app/(app)/(tabs)/_layout.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `app/(app)/(tabs)/kalender/index.tsx` (utdrag)
- Filer ikke funnet: ingen
- Diff mot forrige review: lest arkiv: **ja**. Fikset siden sist: **FAB-kontrast i kalender** (KRITISK — `fabText` er nå `Colors.dark` på honey = 8.42:1, kalender:423), **MonthView-celler** har a11y-label med inspeksjon/hendelse-info (MonthView:69), **Button secondary** bruker dark på amber (Button:98). IKKE fikset: muted-kontrast, tekstskalering, photoRemoveBtn-treffmål, moodBtn-labels, navBtnBack-rolle, ghost-label.

## Sammendrag
Forrige rundes KRITISK (FAB) er fikset, men kontrastgjelden i paletten består og er målbart verre enn antatt: `honeyDark` på hvit er **2.84:1** (ikke ~4.0 som sist anslått) og brukes på ghost-knapper og CTA-lenker; `muted` (3.40:1) bærer fortsatt brødtekst; nye beregninger avdekker 2.0–3.2:1 på urgent-tekst, kalenderdato og Toast. Tekstskalering er fortsatt uadressert (0 treff på `allowFontScaling`/`maxFontSizeMultiplier` + faste høyder). Skjermleser-dekning er god på kjerneskjermer, men null i alle modal-seksjoner.

## Fungerer godt (ikke rør)
1. Kalender-FAB: mørk tekst på honey = 8.42:1 (kalender:423) — riktig fikset.
2. `Button.tsx`: `accessibilityRole="button"`, label-fallback, 52pt høyde, primær/sekundær = 8.42:1/14:1.
3. `FrameCounter`: 44×44-knapper med norske `accessibilityLabel` («Reduser/Øk {label}»).
4. MonthView-datoceller: 44×44 + label som annonserer inspeksjon/hendelse — løser fargeprikk-problemet for skjermleser.
5. Hjem-skjermen: 19 a11y-props, alle Pressables har rolle + beskrivende norsk label; helsescore har tekstlig redundans (HealthScoreSection label + issues-liste).

## Funn

### Kontrasttabell (WCAG-formel, beregnet)
| Kombinasjon | Ratio | Krav | Bestått |
|---|---|---|---|
| ink/white (brødtekst) | 17.06 | 4.5 | ✅ |
| honey/dark (aktiv fane, FAB) | 8.42 | 4.5 | ✅ |
| mid/white | 8.47 | 4.5 | ✅ |
| muted #8A8A9A/white | 3.40 | 4.5 | ❌ |
| muted/light #F8F4EF | 3.10 | 4.5 | ❌ |
| honeyDark #D4890A/white (ghost, CTA-er) | 2.84 | 4.5 | ❌ |
| warning/white (taskSubUrgent 12pt) | 2.03 | 4.5 | ❌ |
| white/honey (valgt kalenderdato 15pt) | 2.03 | 4.5 | ❌ |
| honey/white (todayDayText) | 2.03 | 4.5 | ❌ |
| inaktiv fanetekst rgba(255,255,255,.40)/dark (11pt) | 3.80 | 4.5 | ❌ |
| success/white (varroaLabel 8pt) | 2.78 | 4.5 | ❌ |
| error/white (statValBad 13pt bold) | 4.23 | 4.5 | ❌ |
| error/errorSoft (alertTitle 13pt bold) | 3.70 | 4.5 | ❌ |
| white/success + white/info (Toast) | 2.78 / 3.15 | 4.5 | ❌ |
| honeyDark/amber (FrameCounter +/− glyf) | 2.59 | 3.0 (1.4.11) | ❌ |

### HØY
**[HØY]** `constants/colors.ts:23` — `muted: '#8A8A9A'` = 3.40:1 på hvit, 3.10 på light. Brukes for `breed`, `statKey`, `taskSub`, `heroStatSub`, `ringLabel`, `sectionKicker` m.fl. (HiveCard:228, hjem:867). — Brudd på 1.4.3 i nesten all sekundærtekst. — Løsning: bytt til `Colors.mid` (8.47:1) for tekst <18pt; behold muted kun på mørk bakgrunn (5.02:1 der). — Innsats: M — Konfidens: HØY

**[HØY]** `components/ui/Button.tsx:101` — `ghostLabel: { color: Colors.honeyDark }` = **2.84:1** (verre enn sist antatt 4.0). Samme farge i `trialBannerCta`/`upgradeNudgeCta` (hjem:782,807), `boxCount` (HiveCard:209), `meta` (HiveCard:233). — Ghost-knapper og oppgrader-CTA-er nær uleselige for svaksynte — rammer konvertering. — Løsning: ny token `honeyText: '#8F5B00'` (5.73:1) for honey-farget tekst på lys flate. — Innsats: S — Konfidens: HØY

**[HØY]** Globalt — 0 treff på `allowFontScaling` og `maxFontSizeMultiplier` (Grep). RN skalerer tekst som default, men faste høyder klipper: `Button.base height: 52` (Button:57), tabBar `height: 72` (_layout:23), `CELL_SIZE = 44` (MonthView:95), `photoThumbWrap 76` (Step4:91). — Ved 200 % systemskrift klippes knappetekst, fanetekst og kalenderdatoer (WCAG 1.4.4). — Løsning: `height` → `minHeight` på Button/navBar; `maxFontSizeMultiplier={1.5}` på tall-tette komponenter (HiveCard-stats, hero); test ved 200 %. — Innsats: M — Konfidens: HØY

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:868` — `taskSubUrgent: { color: Colors.warning }` (#F5A623 på hvit) = **2.03:1** på 12pt: «14 dager siden»-varselet — appens viktigste hastesignal er det minst leselige. Tilsvarende `selectedDayText`/`todayDayText` (MonthView:128-134) = 2.03. — Løsning: `honeyText`-token for urgent-tekst; valgt dato: behold hvit tekst men mørkere bakgrunn (`honeyDark`-bakgrunn gir ~4.2, eller `Colors.dark`-tekst = 8.42). — Innsats: S — Konfidens: HØY

### MEDIUM
**[MEDIUM]** `app/(app)/(tabs)/_layout.tsx:19` — `tabBarInactiveTintColor: 'rgba(255,255,255,0.40)'` = 3.80:1 på 11pt fanetekst. — Under 4.5-kravet for liten tekst. — Løsning: `rgba(255,255,255,0.70)` (8.74:1). — Innsats: S — Konfidens: HØY

**[MEDIUM]** `components/ui/Toast.tsx:8-9,31` — Hvit tekst på success (2.78) og info (3.15); og toasten har ingen `accessibilityLiveRegion="polite"`/`AccessibilityInfo.announceForAccessibility` — feilmeldinger (alle mutations!) annonseres aldri for TalkBack. — Løsning: mørkere bg (`#2E7D32` = 5.13) + `accessibilityLiveRegion="polite"` på Animated.View. — Innsats: S — Konfidens: HØY

**[MEDIUM]** Skjermleser-dekning: 126 a11y-props i 30 filer mot 392 Pressable-forekomster i 49 filer (~30 %). Null props i `WeightSection` (9 Pressables), `TreatmentSection` (13), `QueenSection` (16), `HarvestSection` (12), `AddEventModal`, `HarvestLogModal`, `onboarding.tsx`, `samarbeid.tsx`. — Hele registrerings-flytene for vekt/behandling/dronning/høsting er umerket for TalkBack. — Løsning: label + rolle på modal-åpnere, lagre/avbryt. — Innsats: M — Konfidens: HØY

**[MEDIUM]** [IKKE FIKSET] `components/inspection/Step4.tsx:42,93-97` — `photoRemoveBtn` 20×20 + `hitSlop={6}` = 32×32, under 44pt (2.5.8); og moodBtn (Step4:61-68) mangler fortsatt `accessibilityRole/Label/State` — TalkBack leser kun emoji-navn. `navBtnBack` (ny.tsx:336-341) mangler fortsatt rolle. — Løsning: hitSlop 12 + labels som i forrige rapport. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `components/hive/HiveCard.tsx:71-73,139` — `varroaLabelColor`: success (2.78) / `#D4891A` (2.84) / error på 8pt `varroaLabel` — alvorlighetsetiketten («Lav/Høy») er selv uleselig. Tekstredundansen finnes (bra mot 1.4.1), men feiler 1.4.3. — Løsning: `#2E7D32`/`#8F5B00`/`Colors.sevCrit` (5.62) + min. 10pt. — Innsats: S — Konfidens: HØY

### LAV
**[LAV]** `components/hive/WeightSection.tsx`, `components/info/HoneyForecastChart.tsx`, `components/ui/HealthRing.tsx:29` — SVG-grafer uten `accessibilityLabel`/tekstlig sammendrag (0 Grep-treff på «accessib» i WeightSection). — Løsning: label på graf-container («Vektutvikling: siste 30 dager, +2,1 kg»). — Innsats: S — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/_layout.tsx:7-9` + hjem — emoji som faneikoner og dekorativ emoji (⏰✅🚀⏳) leses opp av TalkBack uten `importantForAccessibility="no"`. — Innsats: S — Konfidens: MEDIUM

## Topp-3 anbefalinger
1. **Kontrast-pass på paletten (S–M, ~2 t):** ny token `honeyText '#8F5B00'`; erstatt honeyDark-tekst på lys flate; `muted`→`mid` for tekst <18pt; `taskSubUrgent`, inaktiv fanetekst → 0.70, Toast-bakgrunner. Lukker alle 1.4.3-brudd i tabellen — lovpålagt (likestillings- og diskrimineringsloven).
2. **Tekstskalering (M, 3–4 t):** `height`→`minHeight` på Button/navBar/taskRow, `maxFontSizeMultiplier` på tall-paneler, manuell test ved 200 % — lukker HØY-funnet som har stått åpent siden forrige review.
3. **A11y-labels i modal-seksjonene + restene fra sist (M, 2–3 t):** Weight/Treatment/Queen/Harvest-modaler, moodBtn-state, navBtnBack-rolle, hitSlop 12 på fotosletting, `accessibilityLiveRegion` på Toast.
