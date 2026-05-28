# Agent 2 — Visuell design og komponentkonsistens

## Metainfo
- Filer lest: `constants/colors.ts`, `components/hive/HiveCard.tsx`, `components/ui/Button.tsx`, `components/hive/WeightSection.tsx`, `components/hive/HealthScoreSection.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

## Sammendrag

Designsystemet (Colors, Radii, Shadows) er godt definert og brukes konsistent i kjerne-komponentene HiveCard og Button. Svakheten er bredden: `hjem/index.tsx` alene har 14 hardkodede borderRadius-verdier, og 34+ komponenter bruker `fontWeight` uten `fontFamily` — inkonsistent typografi på Android. Emoji-ikoner i funksjonell UI og platform-native Alert er de tydeligste "billig"-signalene.

## Funn

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:554,570,601,620,631,698,709,725,742,815,834,848` — 14 hardkodede `borderRadius`-verdier (8–28) uten `Radii.*` — Tilfeldig radius-landskap; divergens øker for hvert nytt feature-ship — Erstatt med nærmeste Radii-token: `28→Radii.hero`, `22→Radii.xl`, `14→Radii.md`, `12→Radii.sm`.

**[HØY]** `components/hive/HivesMapView.tsx:166,194,210–214,223,235` — 7 rå hex-verdier (`#1a1a1a`, `#fff`, `#999`, `#666`, `#444`) — Kart-UI ute av sync med brand — `#1a1a1a→Colors.ink`, `#fff→Colors.white`, `#999/#666→Colors.muted`, `#444→Colors.mid`.

**[HØY]** `components/hive/HealthScoreSection.tsx:103–104` — `⚠️` emoji som funksjonelt ikon — Emoji varierer mellom Apple og Google; ser hobby-utviklet ut på Android — Bytt til `Ionicons` `warning` / `alert-circle`.

**[HØY]** `components/hive/WeightSection.tsx:39` — `Alert.alert()` for sletting — Native dialog bryter appens visuelle identitet — Lag `ConfirmSheet`-komponent basert på `Modal` + `Button`.

**[HØY]** 34+ komponenter bruker `fontWeight` uten `fontFamily` — `WeightSection.tsx`, `HealthScoreSection.tsx`, `SeasonGuide.tsx`, `WeatherCard.tsx` m.fl. — Bold-tekst vises med systemvekt på Android — Koble `fontWeight:'700'→FontFamily.bold` i alle StyleSheet-objekter.

**[MEDIUM]** `components/hive/HealthScoreSection.tsx:82` — `'#5DB346'` og `'#E67E22'` hardkodet i `scoreColor()` — Kan divergere ved brand-oppdatering — Legg til named tokens i colors.ts.

**[MEDIUM]** `components/hive/HiveCard.tsx:71–73` — `'#D4891A'` for moderat varroa-farge — Ikke et Colors-token — Definer named token og bruk det.

**[MEDIUM]** `components/hive/HiveCard.tsx:279,296` — `fontSize: 8` på stat-etiketter (VEKT, VARROA, RAMMER, ETASJER) — Under anbefalt minimum; bryter WCAG 1.4.4 på lav-DPI-skjermer — Øk til `fontSize: 10` minimum.

**[MEDIUM]** `components/hive/WeightSection.tsx:60` — Datoinput er vanlig `TextInput` med placeholder `ÅÅÅÅ-MM-DD` — Brukere må skrive ISO-dato manuelt — Integrer `@react-native-community/datetimepicker`.

**[MEDIUM]** `components/inspection/Step3.tsx:25–26` — `'#D4891A'`, `'#E67E22'`, `'#FEF3E2'` for varroa-alvorlighet — Ikke Colors-tokens — Definer named tokens og bruk dem.

**[LAV]** `app/(app)/(tabs)/kuber/[id]/index.tsx:314` — Tom inspeksjons-tilstand med `📋` emoji og plaintext — Erstatt med illustrert placeholder eller Lottie-animasjon.

## Premium-muligheter

1. **Skeletonlastere** — Erstatt `ActivityIndicator` med animated skeleton-cards. Gir følelse av rask app og profesjonell onboarding.
2. **Konsistent haptic feedback** — HiveCard, InspectionRow og FAB mangler haptics. Lett haptic på `onPress`, medium på destruktive handlinger.
3. **Gradient-hero med glassmorfisme** — Hjem-skjermens hero er flat `Colors.dark`. En subtil gradient + `expo-blur` glass-kort løfter nivået betraktelig.
4. **Animert helseringen** — Reanimated-drevet oppstartsanimasjon (arc tegnes fra 0 til score ved mount) gir umiddelbar "wow"-effekt.
5. **Fargekodet varroa-celle i HiveCard** — Bytt bakgrunnen på VARROA-cellen til lav-opacity alvorlighetsgrad-farge. Kommuniserer status visuelt uten at brukeren må huske tersklene.

## Topp-3 anbefalinger

1. **Tving all `borderRadius` gjennom `Radii`-tokens** (~2 timer) — Opprett ESLint-regel. Prioriter `hjem/index.tsx` (14 brudd). Største langsiktige designkonsistens-gevinst med lavest kostnad.
2. **Erstatt emoji-ikoner i funksjonell UI med vektorikoner** (~1 time) — `@expo/vector-icons` er allerede transitiv avhengighet. Enkeltste tiltak som løfter appen fra "hobby" til "profesjonell" på Android.
3. **Legg til `fontFamily` overalt der `fontWeight` brukes** (~3 timer) — Lag `TextStyles`-eksport i `constants/typography.ts`. Android-typografisk konsistens er kritisk for et betalt produkt.
