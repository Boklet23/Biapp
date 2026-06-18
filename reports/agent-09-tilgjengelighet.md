# Agent 9 — Tilgjengelighet (WCAG 2.1 AA)

## Metainfo
- Filer lest: `constants/colors.ts`, `constants/typography.ts`, `components/hive/HiveCard.tsx`, `components/ui/Button.tsx`, `components/inspection/FrameCounter.tsx`, `components/inspection/Step4.tsx`, `components/hive/HealthScoreSection.tsx`, `components/ui/Toast.tsx`, `app/(app)/(tabs)/_layout.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `app/(app)/(tabs)/hjem/index.tsx` (utdrag).
- Filer ikke funnet: ingen.
- Diff mot forrige review (arkiv 2026-06-12): lest **ja**. Sprint 1-fiks bekreftet: `honeyText '#8F5B00'`-token finnes (colors:11); ghost-CTA-er/`meta`/`boxCount`-tekst → honeyText (Button:101, HiveCard:233); inaktiv fanetekst → `rgba(255,255,255,0.62)` (_layout:21); `secondaryLabel` → dark (Button:98); FrameCounter-glyf bruker honeyText (FrameCounter:84). IKKE fikset (gjentas): `muted` brødtekst, tekstskalering (0 treff), Toast-stillhet, `taskSubUrgent`, photoRemoveBtn-treffmål, moodBtn-labels, navBtnBack-rolle, varroaLabel-kontrast.

## Sammendrag
Sprint 1 lukket flere KRITISK/HØY-funn: honeyText-token er innført og fjerner ghost/CTA-kontrastgjelden, inaktiv fane er nå lesbar, og FrameCounter-glyfen er trygg. Men `muted` (3.40:1) bærer fortsatt all sekundærtekst, `taskSubUrgent` (appens hastesignal) er 2.03:1, Toast-success/info er 2.78/3.15:1 og annonseres aldri for TalkBack (0 liveRegion-treff). Tekstskalering er fremdeles helt uadressert (0 `allowFontScaling`). Skjermleser-dekning ~33 % (131/398 Pressables); modal-seksjonene mangler labels.

## Fungerer godt (ikke rør)
1. `honeyText`-token (colors:9-11) med dokumentert begrunnelse — løser ghost/CTA-kontrast.
2. Inaktiv fanetekst `rgba(255,255,255,0.62)` på dark ≈ 5.3:1 (_layout:21) med god kommentar.
3. `FrameCounter`: ekte 44×44-knapper + norske `accessibilityLabel` («Reduser/Øk {label}») + glyf i honeyText.
4. `Button.tsx`: `accessibilityRole="button"`, label-fallback, primær/sekundær = dark på honey/amber (8.4:1/14:1).
5. `HealthScoreSection`: full tekst-redundans (label + issues-liste) — farge er ikke eneste bærer (1.4.1 ✓).

## Funn

### Kontrasttabell (WCAG-formel, beregnet)
| Kombinasjon | Ratio | Krav | Bestått |
|---|---|---|---|
| ink #1A1A2E / white (brødtekst) | 17.4 | 4.5 | ✅ |
| honey / dark (aktiv fane, FAB) | 8.4 | 4.5 | ✅ |
| honeyText #8F5B00 / white (ghost, CTA, meta) | 5.65 | 4.5 | ✅ |
| inaktiv fane rgba(255,255,255,.62) / dark (11pt) | ~5.3 | 4.5 | ✅ |
| mid #4A4A6A / white | 8.5 | 4.5 | ✅ |
| Toast error #C0392B + hvit tekst | 5.0 | 4.5 | ✅ |
| muted #8A8A9A / white (brødtekst <18pt) | 3.40 | 4.5 | ❌ |
| muted / light #F8F4EF | 3.10 | 4.5 | ❌ |
| warning #F5A623 / white (taskSubUrgent 12pt) | 2.03 | 4.5 | ❌ |
| success #4CAF50 / white (varroaLabel 8pt) | 2.78 | 4.5 | ❌ |
| Toast success / info + hvit tekst | 2.78 / 3.15 | 4.5 | ❌ |
| error #E53935 / white (statValBad 13pt) | 3.99 | 4.5 | ❌ |

### HØY
**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:874` — `taskSubUrgent: { color: Colors.warning }` (#F5A623 på hvit) = **2.03:1** på 12pt. Appens viktigste hastesignal («14 dager siden») er det minst leselige elementet. — Brudd 1.4.3. — Løsning: bruk `Colors.honeyText` (5.65:1) eller `Colors.error` for urgent. — Innsats: S — Konfidens: HØY

**[HØY]** `constants/colors.ts:26` — `muted: '#8A8A9A'` = 3.40:1 (3.10 på light). Bærer `breed`/`statKey`/`ringLabel`/`varroaLabel` (HiveCard:228,283,258), `taskSub`/`taskChevron` (hjem:873,889), `issueText`/`sectionTitle` (HealthScoreSection:124,139), `moodLabel`/`photoAddText` via `mid+xx` er ok, men `muted` selv feiler. — Brudd 1.4.3 i nær all sekundærtekst <18pt. — Løsning: bytt `muted`→`mid` (8.5:1) for tekst, behold `muted` kun til dekor/hairlines. — Innsats: M — Konfidens: HØY

**[HØY]** Globalt — 0 treff på `allowFontScaling`/`maxFontSizeMultiplier` (Grep). Faste høyder klipper tekst ved 200 % systemskrift: `Button.base height:52` (Button:57), tabBar `height:72` (_layout:24), `photoThumbWrap 76` + `moodBtn`-rad (Step4:91), HiveCard-stats (8–13pt tette tall). — Brudd 1.4.4. — Løsning: `height`→`minHeight` på Button/tabBar/navBtn; `maxFontSizeMultiplier={1.4}` på tall-tette paneler; test ved 200 %. — Innsats: M — Konfidens: HØY

### MEDIUM
**[MEDIUM]** `components/ui/Toast.tsx:8-9,31` — Hvit tekst på success #4CAF50 (2.78) og info #3498DB (3.15); ingen `accessibilityLiveRegion="polite"` / `AccessibilityInfo.announceForAccessibility` (0 treff globalt). Alle mutation-feil går via toast og **annonseres aldri** for TalkBack. — Brudd 1.4.3 + 4.1.3 (Status Messages). — Løsning: mørkere bg (`#2E7D32` ≈ 5.1, `#1F6FA8` ≈ 4.6) + `accessibilityLiveRegion="polite"` + `accessibilityRole="alert"` på Animated.View. — Innsats: S — Konfidens: HØY

**[MEDIUM]** Skjermleser-dekning ~33 %: 131 a11y-props i 30 filer mot 398 Pressable i 49 filer. Null props i `WeightSection` (9), `TreatmentSection` (13), `QueenSection` (16), `HarvestSection` (12), `AddEventModal` (8), `HarvestLogModal` (14), `onboarding` (9). Hele registrerings-/modal-flytene for vekt/behandling/dronning/høsting er umerket. — Brudd 4.1.2. — Løsning: `accessibilityRole`+norsk `accessibilityLabel` på modal-åpnere, lagre/avbryt. — Innsats: M — Konfidens: HØY

**[MEDIUM]** [IKKE FIKSET] `components/inspection/Step4.tsx:42,61-68,93-97` — `photoRemoveBtn` 20×20 + `hitSlop={6}` = 32×32 (< 44pt, 2.5.8); `moodBtn` mangler fortsatt `accessibilityRole/Label/State` — TalkBack leser kun rå emoji. `varroaLabel` 8pt + `statKey` 8pt under praktisk lesbarhet. — Løsning: `hitSlop={12}`, label «Fjern bilde», moodBtn rolle+`accessibilityState={{selected}}`+label «Humør {score}», min. 10pt. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:351-356` — `navBtnBack`-Pressable mangler `accessibilityRole="button"` og `accessibilityLabel` (teksten veksler «Avbryt»/«← Tilbake»; pilen «←» leses dårlig). — Brudd 4.1.2. — Løsning: legg til rolle + statisk label. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `components/hive/HiveCard.tsx:71-73,139` — `varroaLabelColor`: success #4CAF50 (2.78) / `#D4891A` (2.84) / error på 8pt `varroaLabel` («Lav/Høy»). Tekstredundans finnes (1.4.1 ✓) men selve etiketten feiler 1.4.3. — Løsning: `#2E7D32` / `Colors.honeyText` / `Colors.sevCrit` + ≥10pt. — Innsats: S — Konfidens: HØY

### LAV
**[LAV]** `components/info/HoneyForecastChart.tsx`, `components/hive/WeightSection.tsx`, `components/ui/HealthRing.tsx` — SVG/Skia-grafer (vekt/honning/varroa-trend) uten `accessibilityLabel`/tekstlig sammendrag (0 «accessib»-treff i WeightSection). — Brudd 1.1.1. — Løsning: label på graf-container («Vektutvikling siste 30 dager: +2,1 kg»). — Innsats: S — Konfidens: MEDIUM

**[LAV]** `app/(app)/(tabs)/_layout.tsx:5-9` + `HealthScoreSection:102,108` — emoji-faneikoner og dekor-emoji (⚠️✅) leses opp av TalkBack uten `importantForAccessibility="no"`; faneikon bør ha `accessibilityElementsHidden` (tittel dekker). — Innsats: S — Konfidens: MEDIUM

## Topp-3 anbefalinger
1. **Fullfør kontrast-passet (S, ~1 t):** `taskSubUrgent`→honeyText/error, `muted`→`mid` for tekst, Toast success/info-bakgrunn mørkere, varroaLabel-farger. Lukker resterende 1.4.3-brudd — lovpålagt (likestillings- og diskrimineringsloven + UU).
2. **Tekstskalering (M, 3–4 t):** `height`→`minHeight` på Button/tabBar/navBtn, `maxFontSizeMultiplier` på tall-paneler, manuell test ved 200 %. Eneste HØY-funn som har stått åpent gjennom to reviews.
3. **Skjermleser i modaler + Toast-annonsering (M, 2–3 t):** labels på Weight/Treatment/Queen/Harvest-modaler, navBtnBack-rolle, moodBtn-state, hitSlop 12, `accessibilityLiveRegion="polite"` på Toast.
