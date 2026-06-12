# Agent 9 — Tilgjengelighet

## Metainfo
- **Filer lest:** `constants/colors.ts`, `components/hive/HiveCard.tsx`, `components/ui/Button.tsx`, `components/inspection/Step4.tsx`, `components/inspection/FrameCounter.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `app/(app)/(tabs)/kalender/index.tsx`
- **Filer ikke funnet:** ingen (alle målfiler eksisterte)
- **Konfidensgrad:** Høy for kontrast/berøring/skjermleser (lest kode + Grep over 48 filer). Middels for dynamisk tekst (ingen runtime-test kjørt).

## Sammendrag
Skjermleser-dekning er overraskende god (128 a11y-props over 29 filer), og kjerneknapper (Button, FrameCounter, mood, avatar) har label + role + 44pt-størrelse. Hovedproblemene er: hvit tekst på honey (FAB ~2.1:1 — under AA), grå `muted`-tekst (~3.5:1), `allowFontScaling` brukes ingen steder (0 treff), og varroa-alvorlighet formidles delvis kun via farge. Norsk lov (WCAG 2.1 AA) krever utbedring av kontrast.

## Funn

### KRITISK
**[KRITISK]** `app/(app)/(tabs)/kalender/index.tsx:423` (fabText) — Hvit tekst (`Colors.white`) på `Colors.honey #F5A623` gir kontrast ~2.1:1. FAB-en «+ Hendelse» feiler AA grovt. (`flyDayLabel`/`reportBtnText` bruker derimot mørk tekst og er OK.) — Konsekvens: knappen er uleselig for svaksynte; bryter WCAG 1.4.3. — Løsning: bruk `Colors.dark` på honey-bakgrunn (slik Button primary gjør), eller `honeyDark`-bakgrunn med hvit tekst.

### HØY
**[HØY]** `constants/colors.ts:23` (`muted #8A8A9A`) — Mot hvit ~3.5:1, mot `light #F8F4EF` ~3.3:1. Brukt utstrakt: `statKey`, `breed`, `heroStatSub`, `taskSub`, `legendText`, `emptyText`, kalender `inspSub`. — Konsekvens: brødtekst/etiketter feiler AA 4.5:1 (kun OK som «stor tekst» ≥18pt bold, men de fleste er 8–13pt). — Løsning: erstatt med `Colors.mid #4A4A6A` (~7:1) for tekst under 18pt.

**[HØY]** Globalt — `allowFontScaling` finnes 0 steder (Grep over alle .tsx). Alle `fontSize` er hardkodet (9–30pt). Faste høyder dominerer: `Button.base height:52`, `FrameCounter.button 44x44`, `moodBtn`, hero-rader. — Konsekvens: ved 150–200% systemskrift klippes/overlapper tekst (mood `fontSize:12` i 44pt-boks, `statKey` 8pt, ring-score absolutt posisjonert). Bryter WCAG 1.4.4 (Resize Text). — Løsning: la tekst skalere; bytt faste `height` til `minHeight` + padding; test ved 200%.

**[HØY]** `components/inspection/Step4.tsx:42` (photoRemoveBtn) — Slett-knapp er 20x20px med `hitSlop={6}` → effektivt ~32x32px, under 44pt. — Konsekvens: vanskelig treffmål (WCAG 2.5.5/2.5.8). — Løsning: øk `hitSlop` til 12 eller knapp til 44pt.

### MEDIUM
**[MEDIUM]** `components/hive/HiveCard.tsx:135-139,292` — `statValBad` (linje 292) gjør varroa-tallet rødt uten tekstendring. Tekst-label «Lav/Moderat/Høy» finnes (linje 138-139), så ikke fullt kun-farge, men selve tallet signaliserer alvorlighet kun via rødfarge. — Konsekvens: fargeblinde mister «dårlig»-signal på tallet. — Løsning: behold alltid tekst-label; vurder ikon/symbol ved siden av tallet.

**[MEDIUM]** `app/(app)/(tabs)/kalender/index.tsx:194-203` (legend + dots) — Inspeksjon vs hendelse skilles av honey- vs grønn 8px-prikk. Tekst-label finnes i legenden, men i `MonthView`-rutenettet formidles type trolig kun via farge. — Konsekvens: kalenderprikker uten tekst er kun-farge (WCAG 1.4.1). — Løsning: legg form/ikon på prikker eller a11y-label på datoceller.

**[MEDIUM]** `components/ui/Button.tsx:100-102` (ghostLabel `honeyDark #D4890A`) — På hvit ~4.0:1 — borderline under 4.5:1 ved 16pt regular. Kommentar linje 98 viser bevissthet om problemet for secondary. — Konsekvens: ghost-knapper akkurat under AA. — Løsning: mørkere farge (`honeyDeep`) ved <18pt.

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:336` (navBtnBack) — «Tilbake/Avbryt»-Pressable mangler `accessibilityRole`/`accessibilityLabel` (kun synlig tekst). — Konsekvens: skjermleser leser teksten men mister knapp-rolle. — Løsning: legg til `accessibilityRole="button"`.

### LAV
**[LAV]** `components/inspection/Step4.tsx:61-70` (mood-emoji) — `moodBtn` mangler `accessibilityRole`/`Label`/`State`; kun emoji + tall. — Konsekvens: skjermleser leser emoji-navn uten kontekst og uten valgt-tilstand. — Løsning: `accessibilityLabel={'Humør ${score} av 5'}` + `accessibilityState={{ selected: moodScore === score }}`.

**[LAV]** `components/hive/HiveCard.tsx:97-100` (boxBadge/BoxStack) — Etasjeantall som visuelle striper uten a11y-label. — Konsekvens: redundant (RAMMER/ETASJER finnes i stats), lav risiko. — Løsning: valgfri label.

**[LAV]** `app/(app)/(tabs)/hjem/index.tsx` — Mange dekorative emoji (🐝⏰✅🚀⏳) i tekst uten skjuling for skjermleser. — Konsekvens: emoji-navn leses opp. — Løsning: marker dekorativ emoji med `accessibilityElementsHidden`/`importantForAccessibility="no"`.

## Topp-3 anbefalinger
1. **Fiks FAB-kontrast + audit hvit-på-honey** (1t) — Bytt `fabText` til mørk tekst; grep `color: Colors.white` mot honey-bakgrunner. Løser KRITISK WCAG 1.4.3.
2. **Erstatt `muted` med `mid` for liten tekst + aktiver fontskalering** (3–4t) — Global erstatt på tekststiler <18pt; bytt faste `height` til `minHeight` på Button/FrameCounter/moodBtn; test ved 200%. Løser to HØY-funn (1.4.3 + 1.4.4).
3. **A11y-labels på mood-emoji, kalenderceller og navBtnBack + større hitSlop på fotosletting** (2t) — Legg til manglende `accessibilityRole`/`Label`/`State` og øk treffmål til 44pt.
