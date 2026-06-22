# Agent 9 — Tilgjengelighet (WCAG 2.1 AA)

## Metainfo
- Review v3, 2026-06-22. Read-only.
- Filer lest: `constants/colors.ts`, `constants/typography.ts`, `components/hive/HiveCard.tsx`, `components/ui/Button.tsx`, `components/inspection/FrameCounter.tsx`, `components/inspection/Step4.tsx`, `components/hive/HealthScoreSection.tsx`, `components/ui/Toast.tsx`, `app/(app)/(tabs)/_layout.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` (navbar-utdrag), `app/(app)/(tabs)/hjem/index.tsx` (utdrag).
- Diff mot arkiv 2026-06-18: lest. **Verifiserte fikser (IKKE gjentatt som funn):** `muted` #8A8A9A→`#6E6E80` (colors:27), `taskSubUrgent`→honeyText (hjem:886), Toast success→`#2E7D32`/info→`#1F6FA8` (Toast:8-10), HiveCard `varroaLabelColor` → #2E7D32/honeyText/notifiable + fontSize 10 (HiveCard:71-73,296). Alle reberegnet under — INGEN [REGRESJON] funnet.

## Sammendrag
Kontrast-passet fra 18. juni holder: alle tidligere strøkne 1.4.3-funn passerer nå reberegnet (muted 4.86:1, taskSubUrgent 5.6:1, Toast 5.4/4.7:1, varroaLabel ≥5.0:1). Ingen regresjon. Tre HØY-funn står fortsatt helt åpne: tekstskalering er uadressert (0 `allowFontScaling`, faste høyder), Toast annonseres aldri for TalkBack (0 liveRegion), og skjermleser-dekning er ~33 % (131/398 Pressable) med hele vekt/behandling/dronning/høsting/kalender-modaler umerket. Step4 photoRemoveBtn (32×32) og mood-knapper mangler fortsatt mål/labels.

## Fungerer godt (ikke rør)
1. Kontrast-token-disiplin: `honeyText` (colors:9-11) + `muted` mørknet med dokumentert ratio-kommentar (colors:26) — eksemplarisk.
2. Toast-bakgrunner mørknet med begrunnelse (Toast:7) — kontrast løst.
3. `FrameCounter`: ekte 44×44 (FrameCounter:67-68) + norske `accessibilityLabel` «Reduser/Øk {label}» + glyf i honeyText.
4. `Button.tsx`: `accessibilityRole`, label-fallback, dark på honey/amber (kommentert WCAG-valg Button:98).
5. `HealthScoreSection`: full tekst-redundans (label + issues-liste) — farge aldri eneste bærer (1.4.1 ✓).

## Funn

### Kontrasttabell (WCAG-formel, reberegnet)
| Kombinasjon | Ratio | Krav | Bestått |
|---|---|---|---|
| ink #1A1A2E / white | 17.4 | 4.5 | ✅ |
| honeyText #8F5B00 / white (ghost/CTA/meta/taskSubUrgent) | 5.6 | 4.5 | ✅ |
| muted #6E6E80 / white (sekundærtekst <18pt) | 4.86 | 4.5 | ✅ |
| muted #6E6E80 / light #F8F4EF | 4.46 | 4.5 | ⚠️ grense |
| mid #4A4A6A / white | 8.5 | 4.5 | ✅ |
| inaktiv fane rgba(255,255,255,.62) / dark (11pt) | 5.3 | 4.5 | ✅ |
| Toast success #2E7D32 + hvit | 5.4 | 4.5 | ✅ |
| Toast info #1F6FA8 + hvit | 4.7 | 4.5 | ✅ |
| Toast error #C0392B + hvit | 5.0 | 4.5 | ✅ |
| varroaLabel #2E7D32 / white (10pt) | 5.4 | 4.5 | ✅ |
| varroaLabel honeyText / white | 5.6 | 4.5 | ✅ |
| varroaLabel notifiable #C0392B / white | 5.0 | 4.5 | ✅ |
| statValBad error #E53935 / white (13pt) | 3.99 | 4.5 | ❌ |

Eneste gjenstående rene kontrastbrudd: `statValBad` (HiveCard:292) `#E53935` = 3.99:1 (LAV — det finnes tekstredundans via varroaLabel). `muted` på `light` er marginalt under (4.46) — påvirker `statKey`/`ringLabel` på lys stripe.

### HØY
**[HØY]** Globalt — 0 treff på `allowFontScaling`/`maxFontSizeMultiplier` (Grep, bekreftet). Faste `height` klipper tekst ved 200 % systemskrift: `Button.base height:52` (Button:57), `tabBar height:72` (_layout:24), `photoThumbWrap/photoAddBtn 76` + `moodBtn`-rad (Step4:91,100,78), HiveCard 8–13pt tette tall (HiveCard:279,287). — Brudd 1.4.4 Resize Text. — Løsning: `height`→`minHeight` på Button/tabBar/navBtn; `maxFontSizeMultiplier={1.3}` på tall-tette paneler; manuell test ved 200 %. — Innsats: M — Konfidens: HØY

**[HØY]** `components/ui/Toast.tsx:31-35` — `Animated.View` mangler `accessibilityLiveRegion="polite"` og `accessibilityRole="alert"`; 0 `announceForAccessibility`/`liveRegion` globalt (Grep). Alle mutation-feil (CLAUDE.md-mønster `onError: showToast`) går via denne toasten og **annonseres aldri** for TalkBack-brukere. — Brudd 4.1.3 Status Messages. — Løsning: `accessibilityLiveRegion="polite"` + `accessibilityRole="alert"` på Animated.View (kontrast er allerede løst). — Innsats: S — Konfidens: HØY

**[HØY]** Globalt — skjermleser-dekning ~33 % (131 a11y-props/30 filer mot 398 Pressable/49 filer; uendret fra 18. juni). Null props i `WeightSection`, `TreatmentSection`, `QueenSection`, `HarvestSection`, `AddEventModal` (0 treff bekreftet), `HarvestLogModal`, `onboarding`, `samfunn/ReportSwarmModal`. Hele registrerings-/modalflytene for vekt/behandling/dronning/høsting/kalender er umerket. — Brudd 4.1.2 Name, Role, Value. — Løsning: `accessibilityRole="button"` + norsk `accessibilityLabel` på modal-åpnere, Lagre/Avbryt-knapper. — Innsats: M — Konfidens: HØY

### MEDIUM
**[MEDIUM]** `components/inspection/Step4.tsx:42,61-68,93-97` — `photoRemoveBtn` 20×20 + `hitSlop={6}` = 32×32 (< 44pt, 2.5.8); `moodBtn` (Step4:61-68) mangler `accessibilityRole`/`accessibilityLabel`/`accessibilityState` — TalkBack leser kun rå emoji + tall, valgt tilstand annonseres ikke. — Brudd 2.5.8 + 4.1.2. — Løsning: `hitSlop={12}`, label «Fjern bilde»; moodBtn rolle + `accessibilityState={{ selected: moodScore === score }}` + label «Humør {score}». — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:351-356` — `navBtnBack`-Pressable mangler `accessibilityRole="button"` og `accessibilityLabel`; teksten veksler «Avbryt»/«← Tilbake» og pilen «←» leses dårlig av TalkBack. — Brudd 4.1.2. — Løsning: legg til rolle + statisk label («Tilbake» / «Avbryt»). — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:480-494` — oppgave-tile har `accessibilityRole="button"` men ingen samlet `accessibilityLabel`; TalkBack leser løse fragmenter (kubenavn, hex-emoji ⏰/✅, sub-tekst, «Haster»-chip) hver for seg. Hastesignalet er nå riktig farge (honeyText) men ikke semantisk eksponert. — Brudd 1.3.1/4.1.2. — Løsning: `accessibilityLabel={\`${hive.name}, ${label}${urgent ? ', haster' : ''}\`}` + `importantForAccessibility="no"` på dekor-emoji. — Innsats: S — Konfidens: MEDIUM

### LAV
**[LAV]** `app/(app)/(tabs)/_layout.tsx:5-11` — emoji-faneikoner (🏠🐝📅📖🌍) i `TabIcon` uten `accessibilityElementsHidden`/`importantForAccessibility="no"`; TalkBack kan annonsere «house», «honeybee» foran fane-tittelen. `label`-prop mottas men brukes ikke. — Brudd 1.1.1 (redundant/forvirrende). — Løsning: `importantForAccessibility="no"` på `<Text>`-emoji (fane-tittel dekker navnet). — Innsats: S — Konfidens: MEDIUM

**[LAV]** `components/hive/HealthScoreSection.tsx:101,108` — dekor-emoji ⚠️/✅ leses av TalkBack i tillegg til issue-teksten (duplisering). — Brudd 1.1.1. — Løsning: `importantForAccessibility="no"` på `issueIcon`/`allGoodIcon`. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `components/hive/WeightSection.tsx`, `components/info/HoneyForecastChart.tsx`, `components/ui/HealthRing.tsx` — SVG/Skia-grafer (vekt/honning/varroa-trend) uten `accessibilityLabel`/tekstlig sammendrag. — Brudd 1.1.1 Non-text Content. — Løsning: label på graf-container («Vektutvikling 30 dager: +2,1 kg»). — Innsats: S — Konfidens: MEDIUM

**[LAV]** `components/hive/HiveCard.tsx:135,292` — `statValBad` `#E53935` = 3.99:1 på 13pt. Tekstredundans (varroaLabel) finnes (1.4.1 ✓) men tallet selv feiler 1.4.3. — Løsning: `Colors.sevCrit` (#C62828 ≈ 5.9:1). — Innsats: S — Konfidens: HØY

## Topp-3 anbefalinger
1. **Tekstskalering (M, 3–4 t):** `height`→`minHeight` på Button/tabBar/navBtn, `maxFontSizeMultiplier` på tall-paneler, test ved 200 %. Eneste HØY-funn som har stått åpent gjennom tre reviews — lovpålagt (likestillings- og diskrimineringsloven + UU).
2. **Toast-annonsering + skjermleser i modaler (M, 2–3 t):** `accessibilityLiveRegion="polite"`+`role="alert"` på Toast; labels på Weight/Treatment/Queen/Harvest/AddEvent-modaler; navBtnBack-rolle.
3. **Berøringsmål + dekor-emoji (S, ~1 t):** Step4 `hitSlop={12}` + moodBtn rolle/state/label; `importantForAccessibility="no"` på faneikoner og HealthScore-emoji; `statValBad`→sevCrit.
