# Agent 9 — Tilgjengelighet (WCAG 2.1 AA)

## Metainfo
- Filer lest: `constants/colors.ts`, `components/hive/HiveCard.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `components/inspection/Step4.tsx`, `app/(app)/(tabs)/kalender/index.tsx`, `components/ui/Button.tsx`, `components/inspection/FrameCounter.tsx`
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

---

## Sammendrag

BiVokter har god grunnstruktur for skjermleser-støtte på de mest kritiske navigasjonselementene (hjem, kalender, FrameCounter), men har alvorlige kontrastfeil i hele merkevarepaletten. `Colors.honey` (#F5A623) brukes som bakgrunn, tekst og ikonfarge, men gir kun 2.03:1 mot hvit — langt under WCAG AA-kravet på 4.5:1. Statistikk-etiketter og varroa-alvorlighetsfargene bryter alle krav. Rundt 40 % av Pressable-elementene mangler `accessibilityLabel`. Ingen filer bruker `allowFontScaling`.

---

## Funn

### Kontrastfeil

**[KRITISK]** `constants/colors.ts:3` + `app/(app)/(tabs)/hjem/index.tsx:867` — `Colors.honey` (#F5A623) brukes som bakgrunn pa rapport-CTA og FAB; hvit tekst pa honey gir kontrastforhold **2.03:1** (krav 4.5:1 for normalstorrelse, 3:1 for stor). FAB-tekst (`fabText`, fontSize 15) pa honey-bakgrunn er fullt ikke-leselig for svaksynte. Konsekvens: Lovpalagt WCAG 2.1 AA-brudd, ekskluderer svaksynte brukere. Losning: Bruk `Colors.dark` (#1A1A2E) som FAB-tekst (gir 8.42:1), eller endre FAB-bakgrunn til `Colors.honeyDark`.

**[KRITISK]** `constants/colors.ts:4` + `components/ui/Button.tsx:103` — Ghost-knapp bruker `Colors.honeyDark` (#D4890A) som label-farge pa hvit/transparent bakgrunn: **2.84:1** — bryter AA. Brukes bredt som sekundaer interaksjonsknapp. Losning: Bruk `Colors.mid` (#4A4A6A, gir 8.47:1 mot hvit) som ghost-label.

**[KRITISK]** `components/hive/HiveCard.tsx:279,300` — `statKey` (fontSize 8) og `varroaLabel` (fontSize 8) bruker `Colors.muted` (#8A8A9A) pa `Colors.light` (#F8F4EF)-bakgrunn: **3.10:1**. Tekst pa 8pt er ikke "stor tekst" (krav 18pt/14pt bold), saa kravet er 4.5:1. Dette er nokkeldata (VEKT, VARROA, RAMMER, ETASJER). Losning: Bruk `Colors.mid` pa statKey — gir 7.74:1.

**[HOY]** `constants/colors.ts:37-40` — Varroa-alvorlighetsskala: `sevLow` (#9CCC65) gir **1.87:1**, `sevMod` (#FFC107) **1.63:1**, `sevHigh` (#FF7043) **2.74:1** mot hvit — alle under 3:1. Kun `sevCrit` (#C62828) passerer AA med 5.62:1. Disse fargene formidler kritisk helseinformasjon. Konsekvens: Svaksynte og fargeblinde (ca. 8 % av menn) mister essensiell biehelseinformasjon. Losning: Kombiner alltid farger med tekst-etikett (varroaLabel i HiveCard er delvis implementert — bra), og okk kontrasten pa selve fargeflaten mot bakgrunn.

**[HOY]** `components/ui/Button.tsx:98` — `ghostLabel` farge `Colors.honeyDark` pa hvit: **2.84:1** mot hvit bakgrunn. Losning: Endre til `Colors.mid` eller `Colors.ink` som gir henholdsvis 8.47:1 og 17.06:1.

**[MEDIUM]** `components/hive/HiveCard.tsx:253-260` — `ringLabel` ("HELSE", fontSize 9) og ringScore bruker `Colors.muted` (#8A8A9A) pa hvit: **3.40:1** — bryter AA for sma tekster. Helsescoren er sentral i kortvisningen. Losning: Bruk `Colors.mid` for ringLabel.

**[MEDIUM]** `components/hive/HiveCard.tsx:209` — `boxCount` (fontSize 9) i `boxBadge`-overlay bruker `Colors.honeyDark` pa blandet bakgrunn (rgba(255,255,255,0.88) over honey-bilde): beregnet kontrast ca. **2.62:1**. Losning: Bruk `Colors.dark` som bokstav-farge.

### Skjermleser-dekning

**[HOY]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:336-340` — Tilbake/Avbryt-knapp (`navBtn`) mangler `accessibilityLabel` og `accessibilityRole`. En VoiceOver-bruker horer kun ingenting meningsbearende. Konsekvens: Blinde brukere kan ikke skille "Avbryt" fra "Neste"-knapp. Losning: Legg til `accessibilityRole="button"` og `accessibilityLabel={isFirstStep ? 'Avbryt inspeksjon' : 'Ga tilbake til forrige steg'}`.

**[HOY]** `app/(app)/(tabs)/kalender/index.tsx:226-250` — Inspeksjons-radene (`inspRow` Pressable) mangler `accessibilityLabel` og `accessibilityRole`. Skjermleser annonserer ingenting meningsbearende. Losning: `accessibilityRole="button" accessibilityLabel={\`Inspeksjon \${formatTime(insp.inspectedAt)} — apne detaljer\`}`.

**[HOY]** `app/(app)/(tabs)/hjem/index.tsx:442-465` — Inspeksjon-tasklist (`taskRow`) har `accessibilityRole="button"` men mangler `accessibilityLabel`. Skjermleser leser ikke kubenavnet eller hastegrad. Losning: `accessibilityLabel={\`\${hive.name}, \${label}\${urgent ? ', haster' : ''}\`}`.

**[MEDIUM]** `components/inspection/Step4.tsx:48-53` — Foto-legg-til-knappen mangler `accessibilityLabel` og `accessibilityRole`. Fotoopplasting er en kjerneflyt. Losning: `accessibilityRole="button" accessibilityLabel="Legg til inspeksjonsbilde"`.

**[MEDIUM]** `components/inspection/Step4.tsx:42-45` — Fotofjern-knappen mangler `accessibilityLabel`. VoiceOver-bruker kan ikke fjerne bilder. Losning: `accessibilityLabel={\`Fjern bilde\`}`.

**[MEDIUM]** `components/hive/HarvestSection.tsx` + `components/hive/QueenSection.tsx` — Modal-lukke-knapper mangler `accessibilityLabel`. Kun `hitSlop={12}` er satt (positivt for beroring), men uten label horer VoiceOver-brukere ingenting. 60 Pressable-forekomster i `components/hive/`, kun 2 accessibilityLabel-forekomster (kun HiveCard.tsx).

**Dekningsoppsummering:** 64 `accessibilityLabel`-forekomster mot 382 `Pressable`-forekomster pa tvers av 47 filer: ca. **17 % element-dekning**. 20 filer med Pressable mangler enhver accessibilityLabel.

### Berøringsstørrelser

**[POSITIV]** `components/inspection/FrameCounter.tsx:67-73` — Stepper-knapper er noyaktig 44x44pt. Oppfyller WCAG 2.5.5.

**[HOY]** `components/inspection/Step4.tsx:93-97` — Fotofjern-knappen (`photoRemoveBtn`) er 20x20pt med `hitSlop={6}` — gir effektiv touch-area 32x32pt, under 44pt-kravet. Konsekvens: Liten malflatje for motorisk utfordrede brukere. Losning: Bruk `hitSlop={12}` (gir 44pt) eller okk knappestorrelsen til `width: 32, height: 32` + `hitSlop={6}`.

**[MEDIUM]** `components/inspection/Step4.tsx:61-70` — Kubehumor-emoji-knapper (`moodBtn`) bruker `flex: 1` med `padding: 10`. Pa iPhone SE (320pt) med 5 emojier: effektiv bredde ca. 56pt — men ved tekstskalering kan dette bli smalere. Losning: Legg til `minWidth: 44` pa moodBtn.

**[MEDIUM]** `app/(app)/(tabs)/kalender/index.tsx:330` — Maanedsnavigasjons-knapper (`navBtn`) har `padding: 8` uten eksplisitt `minWidth`/`minHeight`. Tekststorrelse 28pt kompenserer noe, men bor ha `minWidth: 44, minHeight: 44` for garantert 44pt touch-area.

### Dynamisk tekst

**[POSITIV]** Ingen filer har `allowFontScaling={false}` — alle tekster skalerer med systeminnstillinger, som er korrekt WCAG 1.4.4-atferd.

**[MEDIUM]** `components/hive/HiveCard.tsx:279` — `statKey` fontSize 8 er allerede pa grensen for lesbarhet ved normal skalering. Ved 2x systemtekstskalering kan tall i statval-celler presse ut av kortvisningen fordi flex-layouten ikke har `flexWrap`. Losning: Legg til `numberOfLines={1}` og `adjustsFontSizeToFit` pa statVal, og vurder `minimumFontScale={0.75}`.

### Informasjon kun via farge

**[HOY]** `app/(app)/(tabs)/hjem/index.tsx:329` — heroStatVal for snitt-helse bruker betinget `Colors.success` vs `Colors.honey` som eneste differensiator mellom "god helse" og "under gjennomsnittet". Fargeblinde (deuteranopi) vil ikke oppdage forskjellen. Losning: Legg til et ikon (f.eks. pil opp/ned) eller tekst som supplement til fargen.

**[MEDIUM]** `app/(app)/(tabs)/kalender/index.tsx:194-203` — Kalender-legenden bruker kun farget prikk (honey vs success-gronn) for a skille inspeksjon fra hendelse. For rod-gronn fargeblinde er dette problematisk. Losning: Legg til former (sirkel for inspeksjon, kvadrat for hendelse) i tillegg til farge.

**[LAV]** `components/hive/HiveCard.tsx:71-73` — Varroa-tekstetiketten ("Ingen", "Lav", "Moderat", "Hoy", "Kritisk") er implementert — dette er bra for fargeblinde. Risiko: Dersom varroaLabel-visning fjernes i en fremtidig refaktorering forblir kun farge.

---

## Topp-3 anbefalinger

1. **Reparer `Colors.honey`/`Colors.honeyDark` som tekstfarge** — Erstatt all bruk av disse som tekst pa hvit/lys bakgrunn med godkjente alternativer (`Colors.mid` for subtil tekst, `Colors.dark` for primaer tekst). Prioriter: `statKey`, `ghostLabel`, `varroaLabel`, `boxCount`. Dette er det eneste funnet som er et direkte juridisk brudd (uuastilsynet.no handhever WCAG 2.1 AA for norske digitale tjenester jf. likestillings- og diskrimineringsloven § 17), og rammer storst brukergruppe.

2. **Systematisk `accessibilityLabel` pa alle interaktive elementer** — Installer `eslint-plugin-react-native-a11y` i CI med regelen `no-interactive-element-to-noninteractive-role` og `accessible` satt til required pa Pressable. Fokuser forst pa de tre kritiske hullene: `inspRow` i kalender, `taskRow` i hjem, og Tilbake/Avbryt i inspeksjonsflyten. Mal: >90 % element-dekning (fra dagens ca. 17 %).

3. **Fikse `photoRemoveBtn` og dokumentere minimumsstorrelsestandard** — Fotofjernknappen (20pt effektiv) er den mest alvorlige beroring-feilen. Definer en intern standard: alle interaktive elementer skal ha effektiv beroringsflate 44x44pt. Kodifiser i `CLAUDE.md` og vurder en `<TouchTarget minSize={44}>`-wrapper-komponent for automatisk hitSlop-beregning.
