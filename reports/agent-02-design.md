# Agent 2 — Visuell design og komponentkonsistens

## Metainfo
- Dato: 2026-06-22. Modell: claude-opus-4-8.
- Filer lest: `constants/colors.ts` · `constants/typography.ts` · `constants/ui.ts` · `components/hive/HiveCard.tsx` · `components/ui/Button.tsx` · `components/ui/UpgradeModal.tsx` · `components/hive/WeightSection.tsx` · `components/hive/HealthScoreSection.tsx` · `components/ui/Toast.tsx` · `app/(app)/(tabs)/_layout.tsx` · `app/(app)/(tabs)/kuber/[id]/index.tsx` (severity+stiler) · `app/(app)/(tabs)/samfunn/index.tsx` (tilstander) + Grep/Bash-tellinger over hele `components/` og `app/`.
- Filer ikke funnet: ingen.
- Diff mot 18. juni (`reports/archive/2026-06-18/agent-02-design.md`): lest. **Verifisert fikset, ingen [REGRESJON]:** Toast `success:'#2E7D32'`, `info:'#1F6FA8'` (`Toast.tsx:9-10`); `Colors.muted '#6E6E80'` (`colors.ts:27`); HiveCard varroaLabelColor `#2E7D32`/`honeyText`/`notifiable` + `varroaLabel` fontSize 10 (`HiveCard.tsx:71-73,296`); hjem `taskSubUrgent: Colors.honeyText` (`hjem/index.tsx:886`). Alle holder.
- Tallene står stille siden 18. juni: Typography 0 importer, Radii 1 fil, 23/72 filer med fontFamily, emoji-faner uendret.

## Sammendrag (80 ord)
Designsystem-definisjonene er solide; håndhevelsen står fortsatt stille. `Typography` importeres aldri (0 forekomster, 25 unike fontSize-verdier), `Radii` brukes i kun 1 fil mot ~290 numeriske borderRadius, og 49 av 72 filer setter `fontWeight` uten `fontFamily` — inkludert hele UpgradeModal (salgsflaten) som dermed rendres i systemfont. Tre konkurrerende varroa-/score-fargesystemer består, med inntruffet drift. Emoji-faneikoner gir leketøyspreg på en 49–499 kr/mnd-app. Sprint-fiksene fra 18. juni er intakte.

## Fungerer godt (maks 5)
- **Designsystem-definisjonen** (`constants/colors.ts` + `typography.ts`): gjennomtenkt, WCAG-kommentert, komplett. Problemet er adopsjon — ikke rør definisjonene.
- **HiveCard** (`components/hive/HiveCard.tsx`): gullstandarden — `Radii`, `Shadows`, `Colors`, `FontFamily` på hver stil + memo + pressed-state.
- **WeightSection + HealthScoreSection** har konsekvent `fontFamily` på alle tekststiler (Sprint 1 holder).
- **Shadows-presets** er det best adopterte tokenet (HiveCard, WeightSection, HealthScoreSection, UpgradeModal m.fl.).
- **Button** har haptikk + pressed-scale (`Button.tsx:28,64-65`) — riktig interaksjonsfølelse i primitiven.

## Funn

**[HØY]** `constants/typography.ts:11-28` — `Typography`-objektet importeres fortsatt aldri (Grep `Typography.`: 0 forekomster). 25 unike fontSize-verdier (8–80); tre nesten like brødtekststørrelser konkurrerer: `13` ×101, `14` ×84, `15` ×72, dessuten `12` ×63 og `16` ×50. Mål ≤8. — Konsekvens: ingen global typografisk kontroll; synlig ujevnhet skjerm-til-skjerm. — Løsning: refaktorer til `...Typography.x`-spreads; start med `ui/`-primitivene og hovedskjermene. — Innsats: L — Konfidens: HØY

**[HØY]** 49 av 72 filer setter `fontWeight` uten `fontFamily` (kun 23 har `fontFamily`). Verst: `components/ui/UpgradeModal.tsx` — hele filen mangler `fontFamily`, f.eks. `title: { fontSize: 22, fontWeight: '800', color: Colors.dark }` (`:280`), `tierLabel` (`:334`), `buyBtnText` (`:348`). Kjøpsskjermen rendres dermed i systemfont (Roboto), ikke Manrope. Samme i `(auth)/login.tsx`, `register.tsx`, `welcome.tsx`, `(app)/profil.tsx`, `Toast.tsx`, `Input.tsx`, `ErrorBoundary.tsx`. — Konsekvens: salgs- og førsteinntrykk-flatene blander to fontfamilier. — Løsning: prioriter UpgradeModal + auth + `ui/`-primitivene; vurder `AppText`-wrapper med Manrope default. — Innsats: M — Konfidens: HØY

**[MEDIUM]** `Radii` brukes i nøyaktig 1 fil (HiveCard) mot ~290 numeriske `borderRadius`. De to nest vanligste verdiene (`14`, `10`) finnes ikke i skalaen (xs:8/sm:12/md:16/lg:18/xl:24). `Button.tsx:58` `borderRadius: 14`, `WeightSection.tsx:239` `borderRadius: 14`, `UpgradeModal.tsx:288,316,343` `12/16/12`. — Konsekvens: definert skala og faktisk bruk er to ulike systemer; `Radii` er reelt død kode utenfor HiveCard. — Løsning: legg 10/14 inn i Radii eller snap til sm/md; migrer `ui/`-primitivene først. — Innsats: M — Konfidens: HØY

**[MEDIUM]** Tre konkurrerende alvorlighets-fargesystemer for varroa/score, alle separate fra `Colors.sevLow/Mod/High/Crit` (definert `colors.ts:40-43`, knapt brukt): `kuber/[id]/index.tsx:31,70` `'#F5A623'` (hardkodet duplikat av `Colors.honey`) + `:102` `stroke="#fff"`; `HealthScoreSection.tsx:78,80` `'#5DB346'`/`'#E67E22'` (ikke i paletten); HiveCard bruker derimot `#2E7D32`/`honeyText`/`notifiable`. — Konsekvens: samme varroatall/score får ulik farge på kort, trend og helsekort. — Løsning: én `severityColor()`-util basert på `Colors.sev*` + `constants/varroa.ts`-terskler. — Innsats: S — Konfidens: HØY

**[MEDIUM]** `app/(app)/(tabs)/_layout.tsx:5-10` — faneikoner er fortsatt emoji: `<Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>` (🏠🐝📅📖🌍). `TabIcon` ignorerer `tabBarActiveTintColor` (`Colors.honey`, satt :18); aktiv tilstand vises kun som 2px størrelse + opasitet. Funksjonelle emoji ellers: `HealthScoreSection:101,108` (⚠️/✅), `WeightSection:195` (⚖️). — Konsekvens: plattformavhengig rendering; leketøyspreg på en betal-app; konkurrenter bruker vektorikonsett. — Løsning: `lucide-react-native` i tab-bar + status-/seksjonsikoner; behold emoji kun i ren dekor (mood). — Innsats: M — Konfidens: HØY

**[MEDIUM]** Tilstands-inkonsistens mellom faner. `kuber/index.tsx` har full loading + error + ListEmptyComponent. `samfunn/index.tsx:117,152` har nakne `ActivityIndicator` uten error/empty-paritet for de to seksjonene; `kalender/index.tsx` har empty-tekst men ingen liste-loading. `LoadingCard` brukes kun i `kuber/[id]`. Ingen skeletons finnes (Grep "skeleton": 0). — Konsekvens: lasting føles ulik på hver fane. — Løsning: standardiser på `LoadingCard` (evt. shimmer); samme empty/error-mønster overalt via gjenbrukbar `<ScreenState>`. — Innsats: S–M — Konfidens: HØY

**[LAV]** `components/ui/Toast.tsx:8` — `error: { bg: '#C0392B', icon: '⚠️' }`; `#C0392B` ER `Colors.notifiable`, ikke `Colors.error` (#E53935). Duplisert/feilsemantisk sannhet i en global komponent (success/info ble token-justert i forrige sprint, error ble stående). — Løsning: definer en mørk error-token og bruk den semantisk. — Innsats: S — Konfidens: MEDIUM

**[LAV]** `UpgradeModal.tsx` bruker opasitet-suffiks-hack på farger gjennomgående: `Colors.mid + '18'` (`:278,287`), `Colors.honey + '22'` (`:304,328`), `Colors.mid + 'AA'` (`:361`). Fungerer, men er udokumenterte ad-hoc-toner utenom paletten. — Konsekvens: vanskelig å vedlikeholde konsistente overflater. — Løsning: definer faste surface/overlay-toner i `Colors`. — Innsats: S — Konfidens: MEDIUM

**Dekningsestimat:** Colors ~85–90 % (gjenværende hex mest legitime domenepaletter + opasitet-hacks). FontFamily ~32 % (23/72 filer). Shadows: god. Radii: <1 % (1 fil). Typography: 0 %.

## Topp-3 anbefalinger
1. **Fiks Manrope-hullene der det selger:** legg `fontFamily` (eller Typography-spreads) i UpgradeModal, auth-skjermene, Toast og Input (~12 prioriterte av 49). Innsats M (3–4 t). Effekt: konsistent fontidentitet på alle konverterings- og førsteinntrykksflater.
2. **Én `severityColor()`-util + `Colors.sev*`** for varroa/helse (HiveCard, kuber/[id]:31,70, HealthScoreSection:78,80). Innsats S (1–2 t). Effekt: samme tall = samme farge overalt; fjerner `#F5A623`-duplisering og `#5DB346`/`#E67E22`-driften.
3. **Bytt tab-bar-emoji til `lucide-react-native`** + bruk `tintColor` for aktiv tilstand; ta status-ikonene (⚠️/✅) i samme slengen. Innsats M (3–4 t). Effekt: størst enkeltløft i opplevd profesjonalitet for en betal-app.

**Premium-grep rangert (innsats→effekt):** (1) severityColor-util (S); (2) faste overlay/surface-toner som erstatter `+ '18'`-hack (S); (3) vektorikoner i tab-bar + status (M); (4) `AppText`-wrapper med Manrope default + Typography-skala (M); (5) skeleton-shimmer med Reanimated på hjem/kubeliste i stedet for spinnere (M).
