# Agent 2 — Design

## Metainfo
**Filer lest:** constants/colors.ts · constants/typography.ts · components/hive/HiveCard.tsx · components/ui/Button.tsx · components/hive/WeightSection.tsx · components/hive/HealthScoreSection.tsx · components/hive/HivesMapView.tsx · app/(app)/(tabs)/hjem/index.tsx · app/(app)/(tabs)/kuber/[id]/index.tsx (delvis)
**Filer ikke funnet:** ingen
**Konfidensgrad:** HØY (designsystem-filene + nøkkelskjermene lest direkte; bredde-funn via Grep over 43 komponenter)

## Sammendrag
Designsystemet er godt definert (Colors/Shadows/Radii/Typography/FontFamily), men dårlig håndhevet. `Typography`-skalaen brukes ingensteds og `Radii` kun i HiveCard — resten av appen hardkoder radier, fontstørrelser og farger. Verst er `HivesMapView` og `HiveMap` med rå hex-verdier (#1a1a1a, #fff, #666). 155 `fontWeight` mot bare 43 `fontFamily` betyr at Manrope-fonten ofte ikke trer i kraft. HiveCard og hjem-hero er polerte; kartet og enkelte seksjoner ser billige ut.

## Funn

**[KRITISK]** `constants/typography.ts:11-28` + hele app — `Typography`-skalaen importeres aldri (0 treff utenfor definisjon). Hver komponent hardkoder `fontSize`/`fontWeight` ad hoc → ingen typografisk konsistens. Konsekvens: tilfeldige størrelser (12/13/14/16/18/22/26/28/30/32 om hverandre), umulig å justere globalt. Løsning: refaktorer tekststiler til `Typography.*`-spreads.

**[KRITISK]** Hele `components/` — 155 `fontWeight:` mot 43 `fontFamily:`. RN ignorerer numerisk `fontWeight` for custom-fonter; uten `fontFamily: FontFamily.bold` rendres Manrope alltid i Regular. Konsekvens: «bold» tekst i WeightSection, HealthScoreSection, HivesMapView m.fl. ser tynn/systemfont-aktig ut — direkte synlig billighet. Løsning: par alltid `fontWeight` med riktig `FontFamily`, eller bruk `Typography.*`.

**[HØY]** `components/hive/HivesMapView.tsx:166-235` — gjennomgående rå hex (`#1a1a1a`, `#fff`, `#666`, `#444`, `#999`, `#2196F3`, `#4CAF50`) i stedet for Colors.*. Callout-tekst mangler `fontFamily`. Konsekvens: kartet matcher ikke palettens honning/navy-toner; ser ut som en annen app. Løsning: erstatt med Colors.ink/white/muted/info/success + FontFamily.

**[HØY]** `app/.../kuber/[id]/index.tsx:31,70` + `HiveCard.tsx:72` + `HealthScoreSection.tsx:82-84` — hardkodet `'#F5A623'`, `'#D4891A'`, `'#5DB346'`, `'#E67E22'` for varroa/score-farger. `#F5A623` ER `Colors.honey`. Konsekvens: duplisert sannhet, drift ved palettendring. Løsning: bruk `Colors.sev*` (finnes allerede!) + introduser `Colors.scoreGood/scoreWarn`.

**[MEDIUM]** `components/ui/Button.tsx:57-58,84,90` — `height: 52`, `borderRadius: 14`, `borderWidth: 1.5`, `fontSize: 16` hardkodet i den mest gjenbrukte primitiven. `borderRadius: 14` finnes ikke i `Radii` (mellom sm=12 og md=16). Konsekvens: knapper avviker fra radius-skalaen. Løsning: bruk `Radii.sm`/`Radii.md` + `Typography.bodyStrong`.

**[MEDIUM]** `components/hive/WeightSection.tsx:238-276` — `borderRadius: 14` (3x), alle tekststiler uten `fontFamily`, `Colors.mid + '12'`/`'20'` opacity-hex inline (4x). Konsekvens: inkonsistent radius + ikke-Manrope tekst i en seksjon brukeren ser ofte. Løsning: `Radii`, `FontFamily`, og en `Colors.hair`-variant for kantlinjer.

**[MEDIUM]** Emoji som ikoner — `HealthScoreSection.tsx:104,111` (⚠️/✅), `WeightSection.tsx:195` (⚖️), `hjem/index.tsx` (🐝⏰⏳🚀). Konsekvens: emoji rendres plattform-spesifikt og ser leketøyaktig ut i en betalt app. Løsning: bytt til vektor-ikoner (lucide/feather) med palettfarge.

**[LAV]** `HiveCard.tsx:44,199,201` — `borderRadius: 1`/`6`, `'rgba(255,255,255,0.88)'` inline. Mindre, men avviker fra Radii/Colors.

**[LAV]** `hjem/index.tsx:564,578,592,…` — mange `'rgba(255,255,255,0.xx)'` inline på navy-hero. Akseptabelt for overlay-toner, men bør samles i `Colors.onDark*`-konstanter.

## Topp-3 anbefalinger

1. **Innfør `Typography`-skalaen overalt** (kritisk visuell gevinst, sikrer Manrope-rendering). Refaktorer tekststiler i de 43 komponentene til `...Typography.x`. ~6-8t.

2. **Eliminer rå hex** — start med `HivesMapView`/`HiveMap`, deretter score/varroa-fargene → Colors.*. Legg til manglende tokens (`scoreGood`, `border`, `onDark`). ~3-4t.

3. **Bytt emoji-ikoner mot vektorikoner** (lucide-react-native) i helse-, vekt- og hjem-seksjonene; legg subtil gradient på HiveCard-thumbnail-fallback og report-CTA for premium-løft. ~4-5t.
