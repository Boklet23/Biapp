# Agent 2 — Visuell design og komponentkonsistens

## Metainfo
- Filer lest: `constants/colors.ts` · `constants/typography.ts` · `constants/ui.ts` · `components/hive/HiveCard.tsx` · `components/ui/Button.tsx` · `components/ui/UpgradeModal.tsx` · `components/hive/WeightSection.tsx` · `components/hive/HealthScoreSection.tsx` · `components/ui/Toast.tsx` · `app/(app)/(tabs)/_layout.tsx` · `app/(app)/(tabs)/hjem/index.tsx` (stiler) · `app/(app)/(tabs)/kuber/[id]/index.tsx` (severity) + Grep/Bash-tellinger over hele `components/` og `app/`.
- Filer ikke funnet: ingen.
- Diff mot forrige review (`reports/archive/2026-06-12/agent-02-design.md`): lest. **Sprint 1 holder:** kart/vekt/helse-token-migreringen er intakt (WeightSection + HealthScoreSection har `fontFamily` på alle tekststiler, ingen regresjon). **Uendret siden 12. juni:** Typography fortsatt 0 importer, Radii fortsatt 1 fil, emoji-faneikoner, severity-fargedrift, Toast-hex. Tallene har knapt beveget seg (49 vs 51 filer uten fontFamily). Ingen [REGRESJON].

## Sammendrag (80 ord)
Designsystem-definisjonen er solid, men håndhevelsen står stille siden forrige review. `Typography` importeres fortsatt aldri (0 filer, 25 unike fontSize-verdier), `Radii` brukes i kun 1 fil mot ~290 numeriske borderRadius, og 49 av 72 filer setter `fontWeight` uten `fontFamily` — inkludert UpgradeModal (salgsflaten) og auth-skjermene, som dermed rendres i systemfont. Tre konkurrerende varroa-/score-fargesystemer består. Emoji-faneikoner gir leketøyspreg på en betal-app.

## Fungerer godt (maks 5)
- **Designsystem-definisjonen** (`constants/colors.ts` + `typography.ts`) er gjennomtenkt og komplett. Problemet er adopsjon, ikke design — ikke rør definisjonene.
- **HiveCard** (`components/hive/HiveCard.tsx`) er gullstandarden: `Radii`, `Shadows`, `Colors`, `FontFamily` på hver stil + memo + pressed-state. Bruk som mal.
- **WeightSection + HealthScoreSection** har konsekvent `fontFamily` etter Sprint 1 — token-migreringen holdt.
- **Shadows-presets** er fortsatt det best adopterte tokenet (brukt i WeightSection, HealthScoreSection, HiveCard, UpgradeModal m.fl.).
- **Button** har haptikk + pressed-scale (`Button.tsx:28,63-66`) — riktig interaksjonsfølelse i primitiven.

## Funn

**[HØY]** `constants/typography.ts:11-28` — `Typography`-objektet importeres fortsatt aldri (Grep `Typography` i *.tsx: 0 filer). 25 unike fontSize-verdier (8–80) over 545 forekomster; mål ≤8. Tre nesten like brødtekststørrelser konkurrerer: `13` ×101, `14` ×83, `15` ×69. — Konsekvens: ingen global typografisk kontroll; synlig ujevnhet skjerm-til-skjerm. — Løsning: refaktorer til `...Typography.x`-spreads; start med `ui/`-primitivene og hovedskjermene. — Innsats: L — Konfidens: HØY

**[HØY]** 49 filer setter `fontWeight` uten `fontFamily` (kun 23 av 72 filer har `fontFamily`). Verst: `components/ui/UpgradeModal.tsx:280` `title: { fontSize: 22, fontWeight: '800', color: Colors.dark }` — hele filen mangler `fontFamily`, så kjøpsskjermen rendres i systemfont (Roboto), ikke Manrope. Samme i `app/(auth)/login.tsx`, `register.tsx`, `app/(app)/profil.tsx`, `kuber/ny.tsx`, `sammenlign.tsx`, `Toast.tsx`, `Input.tsx`, `ErrorBoundary.tsx`. — Konsekvens: salgs- og førsteinntrykk-flatene blander to fontfamilier. — Løsning: prioriter UpgradeModal + auth + `ui/`-primitivene; vurder `AppText`-wrapper med Manrope som default. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `Radii` brukes i nøyaktig 1 fil (HiveCard) mot ~290 numeriske `borderRadius`. Fordeling: `12` ×46, `14` ×38, `10` ×34, `16` ×30, `20` ×19 — de to nest vanligste (14, 10) finnes ikke i skalaen (xs:8/sm:12/md:16/lg:18/xl:24). `Button.tsx:58` `borderRadius: 14`, `WeightSection.tsx:239` `borderRadius: 14`, `UpgradeModal.tsx:288,316,343` `12/16/12`. — Konsekvens: definert skala og faktisk bruk er to ulike systemer. — Løsning: legg 10/14 inn i Radii eller snap til sm/md; migrer `ui/`-primitivene først. — Innsats: M — Konfidens: HØY

**[MEDIUM]** Tre konkurrerende alvorlighets-fargesystemer for varroa/score, alle separate fra `Colors.sevLow/Mod/High/Crit` (definert `colors.ts:39-42`, knapt brukt): `HiveCard.tsx:72` `varroa <= 5 ? '#D4891A'` (≠ `Colors.honeyDark` `#D4890A` — drift har allerede skjedd), `kuber/[id]/index.tsx:31,70` `'#F5A623'` (= `Colors.honey` hardkodet) + `kuber/[id]/index.tsx:102` `stroke="#fff"`, `HealthScoreSection.tsx:78,80` `'#5DB346'`/`'#E67E22'`. — Konsekvens: samme varroatall får ulik farge på kort, trend og helsekort. — Løsning: én `severityColor()`-util basert på `Colors.sev*` + `constants/varroa.ts`-terskler. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/_layout.tsx:5-10` — faneikoner er fortsatt emoji: `<Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>`. `TabIcon` ignorerer `tabBarActiveTintColor` (`Colors.honey`); aktiv tilstand vises kun som 2px størrelse + opasitet. Funksjonelle emoji ellers i UI: HealthScoreSection:101,108 (⚠️/✅), WeightSection:195 (⚖️), hjem-empty:954. — Konsekvens: plattformavhengig rendering; leketøyspreg på en app som selger 149–499 kr/mnd; konkurrenter (HiveTracks, BeeKeepPal) bruker vektorikonsett. — Løsning: `lucide-react-native` i tab-bar + status-/seksjonsikoner; behold emoji kun i ren dekor. — Innsats: M — Konfidens: HØY

**[MEDIUM]** Tilstands-inkonsistens mellom faner. `kuber/index.tsx:103-118` har full loading (ActivityIndicator) + error + ListEmptyComponent. `samfunn/index.tsx:117,152` har nakne `ActivityIndicator` uten error/empty-paritet. `kalender/index.tsx` har empty-tekst men ingen liste-loading-rendering. `LoadingCard` brukes kun i `kuber/[id]`. Ingen skeletons finnes (Grep "skeleton": 0). — Konsekvens: lasting føles ulik på hver fane. — Løsning: standardiser på `LoadingCard` (evt. shimmer), legg loading-state i kalender; samme empty/error-mønster overalt. — Innsats: S–M — Konfidens: HØY

**[LAV]** `components/ui/Toast.tsx:7` — `error: { bg: '#C0392B', icon: '⚠️' }`; `#C0392B` ER `Colors.notifiable`. Duplisert sannhet i en global komponent. — Løsning: bruk `Colors.error` (semantisk korrekt for feil-toast). — Innsats: S — Konfidens: HØY

**[LAV]** `app/(app)/(tabs)/hjem/index.tsx` — flere rgba-tekstfarger hardkodet på navy (`'rgba(255,255,255,0.6)'` :625, :626, :654) og banner-/CTA-stiler (`:761,781,806,977`) mangler `fontFamily` i en ellers Manrope-komplett fil; konverteringsflatene rendres delvis i systemfont. — Innsats: S — Konfidens: MEDIUM

**Dekningsestimat:** Colors ~85–90 % (gjenværende hex mest legitime domenepaletter). FontFamily ~32 % av filer (23/72 har fontFamily; av fontWeight-filer mangler 49 fontFamily). Shadows: god. Radii: <1 % (1 fil). Typography: 0 %.

## Topp-3 anbefalinger
1. **Fiks Manrope-hullene der det selger:** legg `fontFamily` (eller Typography-spreads) i UpgradeModal, auth-skjermene, Toast, Input og hjem-bannerne (~15 prioriterte av 49). Innsats M (3–4 t). Effekt: konsistent fontidentitet på alle konverterings- og førsteinntrykksflater.
2. **Én `severityColor()`-util + `Colors.sev*`** for varroa/helse (HiveCard, kuber/[id], HealthScoreSection). Innsats S (1–2 t). Effekt: samme tall = samme farge overalt; fjerner inntruffet drift (`#D4891A` vs `#D4890A`, `#F5A623`-duplisering).
3. **Bytt tab-bar-emoji til `lucide-react-native`** + bruk `tintColor` for aktiv tilstand; ta status-ikonene (⚠️/✅) i samme slengen. Innsats M (3–4 t). Effekt: størst enkeltløft i opplevd profesjonalitet for en betal-app.

**Premium-grep rangert (innsats→effekt):** (1) severityColor-util (S); (2) vektorikoner i tab-bar (M); (3) `AppText`-wrapper med Manrope default + Typography-skala (M); (4) skeleton-shimmer med Reanimated på hjem/kubeliste i stedet for spinnere (M); (5) standardisert loading/empty/error-paritet via gjenbrukbar `<ScreenState>`-komponent (M).
