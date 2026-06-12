# Agent 2 — Visuell design og komponentkonsistens

## Metainfo
- Filer lest: constants/colors.ts · constants/typography.ts · constants/ui.ts · components/ui/Button.tsx · components/ui/UpgradeModal.tsx · components/ui/Toast.tsx · components/ui/LoadingCard.tsx · components/ui/ProGate.tsx (delvis) · components/hive/HiveCard.tsx · components/hive/WeightSection.tsx · components/hive/HealthScoreSection.tsx · components/hive/HivesMapView.tsx · app/(app)/(tabs)/hjem/index.tsx · app/(app)/(tabs)/kuber/[id]/index.tsx (delvis) · app/(app)/(tabs)/_layout.tsx + Grep over hele components/ og app/
- Filer ikke funnet: ingen
- Diff mot forrige review: lest arkiv: ja. **Fikset siden 10. juni:** HivesMapView/HiveMap er token-migrert (Colors.* + FontFamily gjennomgående, kun `shadowColor: '#000'` igjen), WeightSection og HealthScoreSection har nå `fontFamily` på alle tekststiler. **Ikke fikset:** Typography-skalaen (fortsatt 0 bruk), Radii (fortsatt 1 fil), score-/varroa-hex i HealthScoreSection/HiveCard/[id]/index.tsx, emoji-faneikoner, Button-hardkoding.

## Sammendrag (maks 80 ord)
Sprint 1 fikset de tre verste komponentene (kart/vekt/helse), men de to systemiske funnene består: `Typography`-skalaen importeres fortsatt aldri (25 unike fontSize-verdier, 553 forekomster), og 51 filer bruker `fontWeight` uten `fontFamily` — inkludert UpgradeModal (salgsoverflaten!) og auth-skjermene, som dermed rendres i systemfont i stedet for Manrope. `Radii` brukes i én fil; de facto-radiene (14, 10) finnes ikke i skalaen. Emoji-faneikoner består.

## Fungerer godt (maks 5 punkter)
- **Designsystem-definisjonen** i `constants/colors.ts` + `typography.ts` er gjennomtenkt (Colors/Shadows/Radii/SeasonColors/FontFamily/Typography) — problemet er håndhevelse, ikke design. Ikke rør definisjonene.
- **HiveCard** (`components/hive/HiveCard.tsx`) er gullstandarden: Radii, Shadows, Colors, FontFamily på hver stil, memo, pressed-state. Bruk som mal.
- **Hjem-hero** (`hjem/index.tsx:544-714`) er polert og konsekvent FontFamily-satt; rgba-overlay-toner på navy er bevisste og ser bra ut.
- **Shadows-presets** brukes i 18 filer — best adopterte token etter Colors.
- **Button** har haptikk + pressed-scale (`Button.tsx:28,63-66`) — riktig interaksjonsfølelse i primitiven.

## Funn

**[HØY]** `constants/typography.ts:11-28` — `Typography`-objektet importeres aldri (Grep `Typography` i *.tsx: 0 filer). 25 unike fontSize-verdier (8–80) over 553 forekomster; mål ≤8. F.eks. `fontSize: 13` ×99, `14` ×82, `15` ×72 — tre nesten like brødtekststørrelser om hverandre. — Konsekvens: ingen global typografisk kontroll, synlig ujevnhet skjerm-til-skjerm. — Løsning: refaktorer til `...Typography.x`-spreads, start med ui/-primitivene og app/-skjermene. — Innsats: L — Konfidens: HØY

**[HØY]** 51 filer bruker `fontWeight` uten `FontFamily`/`Typography` (Bash-telling). Verst: `components/ui/UpgradeModal.tsx:274` `title: { fontSize: 22, fontWeight: '800', color: Colors.dark }` (hele filen mangler fontFamily — kjøpsskjermen rendres i Roboto, ikke Manrope), `app/(auth)/login.tsx`, `register.tsx`, `app/(app)/profil.tsx`, `kuber/ny.tsx`, `sammenlign.tsx`, `Toast.tsx`, `Input.tsx`, `ErrorBoundary.tsx`. RN faller tilbake til systemfont når fontFamily mangler → appen blander to fontfamilier. — Konsekvens: salgs- og førsteinntrykk-overflatene ser annerledes ut enn resten. — Løsning: prioriter UpgradeModal + auth + ui/-primitivene; vurder en `AppText`-wrapper med Manrope som default. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `Radii` brukes i nøyaktig 1 fil (HiveCard) mot 230 numeriske `borderRadius`. Fordeling: 12 ×46, **14 ×38**, **10 ×31**, 16 ×30, 20 ×19 — de to nest vanligste verdiene (14, 10) finnes ikke i skalaen (xs:8/sm:12/md:16/lg:18/xl:24). `Button.tsx:58` `borderRadius: 14`, `WeightSection.tsx:239` `borderRadius: 14`, `UpgradeModal.tsx:309` `borderRadius: 16`. — Konsekvens: den definerte skalaen og faktisk bruk er to ulike systemer; global justering umulig. — Løsning: enten legg 10/14 inn i Radii eller snap til sm/md, og migrer ui/-primitivene først. — Innsats: M — Konfidens: HØY

**[MEDIUM]** Tre konkurrerende alvorlighets-fargesystemer for varroa/score: `Colors.sevLow/Mod/High/Crit` (colors.ts:36-39, definert men lite brukt), `HiveCard.tsx:72` `: varroa <= 5 ? '#D4891A'`, `kuber/[id]/index.tsx:31,70` `if (count <= 5) return '#F5A623'` (= Colors.honey), `HealthScoreSection.tsx:78,80` `'#5DB346'`/`'#E67E22'`, `Step3.tsx:25-26` `'#D4891A'`/`'#E67E22'`. Merk: `#D4891A` ≠ `Colors.honeyDark` (`#D4890A`) — driften har allerede skjedd. — Konsekvens: samme varroatall får ulik farge på kort, trend og AI-resultat. — Løsning: én `severityColor()`-util basert på `Colors.sev*` + `constants/varroa.ts`-terskler. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/_layout.tsx:5-10` — faneikoner er fortsatt emoji: `<Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>`. TabIcon ignorerer `tabBarActiveTintColor`; aktiv tilstand vises kun som 2px størrelse + opasitet. Totalt ~2600 emoji-forekomster i UI (⚠️/✅/⚖️/🚀/⏰ m.fl. som funksjonelle ikoner i HealthScoreSection:102, WeightSection:195, hjem:358,389,467). — Konsekvens: plattformavhengig rendering, leketøyspreg i en app som skal selge 149–499 kr/mnd-abonnement; konkurrenter (HiveTracks, BeeKeepPal) bruker ikonsett. — Løsning: lucide-react-native i tab-bar + status-/seksjonsikoner; behold emoji i ren dekor (tomtilstander). — Innsats: M — Konfidens: HØY

**[MEDIUM]** Tilstands-inkonsistens: `LoadingCard` brukes i kun 1 skjerm (`kuber/[id]/index.tsx`); `kuber/index.tsx:106` og `samfunn/index.tsx:117,152` bruker nakne `ActivityIndicator`; `kalender/index.tsx:48-53` har queries uten noen loading-rendering; ingen skeletons finnes (Grep "skeleton": 0). Hjem viser `'–'` under lasting (hjem:338). — Konsekvens: lasting føles ulik på hver fane. — Løsning: standardiser på LoadingCard (evt. med shimmer), legg loading-state i kalender. — Innsats: S–M — Konfidens: HØY

**[LAV]** `components/ui/Toast.tsx:7` — `error: { bg: '#C0392B', icon: '⚠️' }`; `#C0392B` ER `Colors.notifiable`. Duplisert sannhet i en global komponent. — Løsning: bruk `Colors.notifiable` (eller `Colors.error` for semantisk korrekthet). — Innsats: S — Konfidens: HØY

**[LAV]** `hjem/index.tsx:774-784,799-808` — `trialBannerText`/`upgradeNudgeText` + CTA-er mangler `fontFamily` i en ellers komplett fil; konverteringsflatene på dashboardet rendres i systemfont. — Innsats: S — Konfidens: HØY

**[LAV]** `components/hive/HiveMap.tsx:21-24` — bieflukt-sirkler hardkoder `'#F44336'`/`'#FF9800'`/`'#FFCA28'`/`'#4CAF50'` (Material-paletten, ikke appens). Domenefarger, men bør mappes til Colors.sev*-tonene. — Innsats: S — Konfidens: MEDIUM

**Dekningsestimat:** Colors ~85–90 % (gjenværende hex er mest legitime domenepaletter: HarvestSection honningfarger, QueenSection merkefarger, HivePlaceholder Skia-illustrasjon). FontFamily ~56 % (314 fontWeight vs 175 fontFamily). Shadows god (18 filer). Radii <1 %. Typography 0 %.

## Topp-3 anbefalinger
1. **Fiks Manrope-hullene der det selger:** legg `fontFamily` (eller Typography-spreads) i UpgradeModal, auth-skjermene, Toast, Input og hjem-bannerne (~15 filer prioritert av 51). Innsats: M (3–4 t). Effekt: konsistent fontidentitet på alle konverterings- og førsteinntrykksflater.
2. **Én severityColor()-util + Colors.sev** for varroa/helse-farger (HiveCard, VarroaTrend, HealthScoreSection, Step3, HiveMap). Innsats: S (1–2 t). Effekt: samme tall = samme farge overalt; fjerner allerede inntruffet fargedrift (#D4891A vs #D4890A).
3. **Bytt tab-bar-emoji til lucide-react-native** + bruk tintColor for aktiv tilstand; ta status-ikonene (⚠️/✅) i samme slengen. Innsats: M (3–4 t). Effekt: størst enkeltløft i opplevd profesjonalitet for en betal-app.

**Premium-grep rangert (innsats→effekt):** (1) severityColor-util (S), (2) vektorikoner i tab-bar (M), (3) Manrope-komplettering via AppText-wrapper (M), (4) skeleton-shimmer med Reanimated på hjem/kubeliste i stedet for spinnere (M), (5) gjenbruk HivePlaceholder-Skia-illustrasjonen som tomtilstand på hjem/kart i stedet for emoji (M).
