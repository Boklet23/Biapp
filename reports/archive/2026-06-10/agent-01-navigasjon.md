# Agent 1 — Navigasjon

## Metainfo
- Filer lest:
  - `app/(app)/_layout.tsx`
  - `app/(app)/(tabs)/_layout.tsx`
  - `app/(app)/(tabs)/hjem/index.tsx`
  - `app/(app)/(tabs)/kuber/index.tsx`
  - `app/(app)/(tabs)/kuber/_layout.tsx`
  - `app/(app)/(tabs)/kuber/ny.tsx`
  - `app/(app)/(tabs)/kuber/[id]/index.tsx`
  - `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`
  - `app/(app)/(tabs)/laer/index.tsx`
  - `app/(app)/(tabs)/samfunn/index.tsx`
  - `app/(app)/(tabs)/kalender/index.tsx`
  - (Glob over `kuber/**` + alle `router.*`-kall i `app/`)
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

## Sammendrag (maks 80 ord)
Fanstrukturen (Hjem · Kuber · Kalender · Info · Samfunn) er fornuftig prioritert, og start-inspeksjon nås på 2 trykk fra Hjem. Hovedproblemet er at underruten `[id]/samarbeid` mangler i Kuber-stackens `_layout`, at fanetittelen «Info» ikke matcher fanen «Lær» i CLAUDE.md, og at tomme tilstander er inkonsekvente. Inspeksjonswizarden er solid med utkast-lagring, men avbryt-bekreftelse mangler på steg 2–4.

## Funn

**[KRITISK]** `app/(app)/(tabs)/kuber/_layout.tsx:14-23` — Ruten `[id]/samarbeid` er IKKE registrert som `Stack.Screen`, men navigeres til fra `kuber/[id]/index.tsx:309`. — Konsekvens: skjermen får standard auto-generert header/tittel (tom eller filsti-basert) — inkonsekvent UX for en betalt Lag-tier-flyt. — Løsning: legg til `<Stack.Screen name="[id]/samarbeid" options={{ title: 'Samarbeid' }} />`.

**[HØY]** `app/(app)/(tabs)/_layout.tsx:63` vs `app/(app)/(tabs)/laer/index.tsx:92` — Fanen heter «Info» i tab-bar OG i skjermheader, men CLAUDE.md og prosjektstrukturen kaller fanen «laer/Lær». Innholdet (nybegynnerguide, sykdomsguide, honningprognose) blander læring og verktøy. — Konsekvens: begrepsforvirring; «Info» er vagt og skjuler at lærings-/prognosefunksjoner ligger her. — Løsning: ensrett til «Lær» (matcher fane-emoji 📖 og IA).

**[HØY]** `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:247-267` — Avbryt-bekreftelse (`Alert`) vises KUN på steg 1. På steg 2–4 går «← Tilbake» bare ett steg tilbake; det finnes ingen synlig vei ut av wizarden med bekreftelse uten å gå helt til steg 1. Ingen header-tilbakeknapp (Stack-tittel «Ny inspeksjon»). — Konsekvens: forvirrende exit. Data REDDES riktignok via AsyncStorage-utkast (`draftKey`), så tap er begrenset. — Løsning: vis avbryt-bekreftelse fra header-X eller en «Avbryt»-knapp synlig på alle steg.

**[MEDIUM]** `app/(app)/(tabs)/hjem/index.tsx:463` & `kuber/index.tsx:210` — Hjem og Kuber-listen navigerer begge til `/kuber/[id]` via `router.push`. Hjem er en egen Tabs-stack uten Kuber-stackens header. Trykker man en kube fra Hjem, pushes detaljskjermen inn i Hjem-fanen, mens videre `[id]/rediger` og `[id]/inspeksjon/ny` tilhører Kuber-stacken. — Konsekvens: dybde-/tilbakeoppførsel blir inkonsekvent (samme skjerm i to stacker). — Løsning: naviger fra Hjem til kube via `/(app)/(tabs)/kuber/[id]` for konsistent stack.

**[MEDIUM]** `app/(app)/(tabs)/kuber/index.tsx:215-224` vs `hjem/index.tsx:351-367` — To ulike tomme-tilstander for «0 kuber»: Hjem har en rik trykkbar CTA («Legg til din første kube →»), mens Kuber-listen kun viser teksten «Trykk + for å legge til» uten faktisk knapp (peker på FAB nederst). — Konsekvens: Kuber-fanens tomme tilstand er passiv; nybegynner må gjette at «+» er FAB-en. — Løsning: gjør tom-tilstand i Kuber til en trykkbar CTA som åpner `/kuber/ny`.

**[MEDIUM]** `app/(app)/(tabs)/laer/index.tsx:34-42` & `samfunn/index.tsx:27-39` — Ingen `isError`-håndtering for `fetchHives`/`fetchHarvests` (laer) eller `fetchGroupedAssociations`/`fetchEquipmentVendors` (samfunn). Diseases faller tilbake til konstant, men de øvrige feiler stille til tomme lister/spinner. — Konsekvens: ingen feilmelding eller retry ved nettverksfeil. — Løsning: legg feil-banner + retry, som i `kuber/index.tsx:100-115`.

**[MEDIUM]** Oppdagbarhet av premium — AI-varroaanalyse er kun synlig INNE i inspeksjonswizardens steg 3 (`ny.tsx:307-321`), ~3+ trykk dypt (Kuber → kube → Ny inspeksjon → steg 3). Statistikk («Sammenlign»/«Sesong») ligger i Kuber-headeren (`kuber/index.tsx:165-175`); samarbeid på kubeprofil (`[id]/index.tsx:301-319`). — Konsekvens: nye brukere oppdager neppe AI-analyse — appens viktigste betalte differensiator — før de er dypt i en flyt. — Løsning: legg en oppdagbar AI-teaser på Hjem eller kubeprofil.

**[LAV]** `app/(app)/(tabs)/kuber/[id]/index.tsx:341` — Inspeksjonshistorikk kappes til 50 (`slice(0, 50)`) med «Vis alle»-knapp uten paginering. — Konsekvens: minimal. — Løsning: vurder paginert lasting ved svært mange inspeksjoner.

**[LAV]** `app/(app)/(tabs)/kalender/index.tsx:284-292` vs `kuber/index.tsx:229-242` — Inkonsekvent FAB-mønster: Kalender/inspeksjon bruker tekst-FAB («+ Hendelse»), Kuber bruker rund «+»-FAB. — Konsekvens: kosmetisk. — Løsning: ensrett FAB-stil.

## Topp-3 anbefalinger
1. Registrer `[id]/samarbeid` i `kuber/_layout.tsx` og legg avbryt-bekreftelse/exit på alle inspeksjonssteg (~1 t).
2. Ensrett fanenavn «Info» vs «Lær», og gjør Kuber-fanens tomme tilstand til trykkbar CTA som matcher Hjem (~1,5 t).
3. Øk oppdagbarhet av AI-varroaanalyse med teaser på Hjem/kubeprofil, og legg feil/retry-tilstander i `laer` og `samfunn` (~2-3 t).
