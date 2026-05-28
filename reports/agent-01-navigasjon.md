# Agent 1 — Navigasjonsarkitektur og informasjonsstruktur

## Metainfo

- Filer lest:
  - `app/(app)/_layout.tsx`
  - `app/(app)/(tabs)/_layout.tsx`
  - `app/(app)/(tabs)/hjem/index.tsx`
  - `app/(app)/(tabs)/kuber/index.tsx`
  - `app/(app)/(tabs)/kuber/_layout.tsx`
  - `app/(app)/(tabs)/kuber/[id]/index.tsx`
  - `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`
  - `app/(app)/(tabs)/laer/index.tsx`
  - `app/(app)/(tabs)/laer/_layout.tsx`
  - `app/(app)/(tabs)/samfunn/index.tsx`
  - `app/(app)/(tabs)/kalender/index.tsx`
- Grep: `router\.` i hele `app/`-mappen
- Filer ikke funnet: `app/(app)/(tabs)/kuber/[id]/samarbeid.tsx` (finnes som fil men ikke lest), `app/(app)/(tabs)/kuber/[id]/inspeksjon/[inspId].tsx` (ikke lest)
- Konfidensgrad: HØY

---

## Sammendrag (70 ord)

BiVokter har en solid 5-fane-struktur der Kuber-fanen bærer den største navigasjonsdybden (4 nivåer). Kjerneoppgaven — start ny inspeksjon — nås på 3 trykk, ikke 2. Samarbeidsverktøyet er nærmest usynlig. Hjem-skjermen er overbelastet med 6 parallelle informasjonsblokker som konkurrerer om oppmerksomhet. Inspeksjonswizarden har god utkasthåndtering. Kritisk svakhet er fravær av tydelig tom tilstand for nye brukere og manglende oppdagbarhet for premium-funksjoner.

---

## Funn

### [KRITISK] `app/(app)/(tabs)/hjem/index.tsx:449` — Inkonsekvent rutestil skaper potensiell navigasjonsfeil

- **Problem:** Hjem-skjermen navigerer til kubeprofil med `pathname: '/kuber/[id]'` (relativ sti), mens `app/(app)/(tabs)/kuber/index.tsx:210` bruker samme stil. Dette er konsekvent, men `app/(app)/_layout.tsx:37` bruker absolutt sti `/(app)/(tabs)/kalender`. Blanding av relative og absolutte stier gjennom kodebasen er udokumentert og kan gi feil på tvers av nøstede navigatorer i expo-router v3.
- **Konsekvens:** Vanskelig å forutsi hvilken stack som aktiveres fra Hjem-fanen. Feil stack = "tilbake"-knapp sender bruker feil sted.
- **Løsning:** Standardiser på absolutte stier (med `as any`) for alle `router.push()`-kall, eller dokumenter den bevisste blandingen.

---

### [KRITISK] `app/(app)/(tabs)/kuber/[id]/index.tsx:355–373` — Samarbeidsverktøy er effektivt usynlig

- **Problem:** Samarbeids-raden vises kun nederst på kube-profilsiden, etter noter, vektlogg og behandlingslogg. Den er dimmet til 70% opacity for ikke-Lag-brukere og gir ingen hint om hva funksjonen gjør. Ruten `kuber/[id]/samarbeid` har ingen inngang fra Kuber-oversikten.
- **Konsekvens:** Lag-planen koster 499 kr/mnd — den sterkeste upsell-muligheten — er gjemt 3+ scrollelengder inn og kun synlig for brukere som allerede er på kube-profilsiden. Konverteringspotensialet er nær null.
- **Løsning:** Legg et synlig "Inviter medbirøkter"-kort i øvre del av kubeprofilen med tydelig lock-overlay og "Lag-plan"-CTA for ikke-Lag-brukere.

---

### [HØY] `app/(app)/(tabs)/hjem/index.tsx` — Hjem-skjermen er overbelastet (6 konkurrerende seksjoner)

- **Problem:** Hjem-skjermen inneholder i rekkefølge: (1) hilsning/dato, (2) vær-widget, (3) 5-dagers prognose, (4) statistikk-strip, (5) oppgradering/prøveperiode-banner, (6) varsler, (7) inspeksjonsoppgaver, (8) sesongguide, (9) rapport-CTA. Det er ingen klar primær handling.
- **Konsekvens:** Brukere med 2+ kuber og aktiv prøveperiode ser rapport-CTAen kun etter 9 scroll-elementer. Viktigste oppgave (starte inspeksjon) er ikke tilgjengelig direkte fra Hjem.
- **Løsning:** Reduser til maks 4 seksjoner på Hjem. Flytt rapport-CTA til Kuber-fanen eller profilmodalen. Skill statusvisning (kuber, helse) fra handlings-CTA (start inspeksjon).

---

### [HØY] `app/(app)/(tabs)/hjem/index.tsx:343–359` — Tom tilstand for 0 kuber mangler kontekst for ny bruker

- **Problem:** Tom tilstand viser en tekst om å legge til kube med lenke til `/kuber/ny`, men etter at kuben er opprettet (via onboarding eller direkte) finnes det ingen "neste steg"-guide. Brukeren går til kubeprofilen og ser en tom inspeksjonsliste uten noen oppfordring.
- **Konsekvens:** Ny bruker vet ikke at inspeksjoner er kjernehandlingen. Risiko for churn dag 1.
- **Løsning:** Etter første kube-oppretting, vis ett enkelt "Logg første inspeksjon"-banner på kubeprofilen som forsvinner etter at inspeksjonen er logget.

---

### [HØY] Inspeksjon krever 3 trykk, ikke 2 — `app/(app)/(tabs)/kuber/[id]/index.tsx:385`

- **Problem:** Fra Hjem/Kuber-oversikten: (1) Trykk på kube → (2) Scroll til FAB/finn "Inspeksjon" → (3) Trykk "+ Inspeksjon". FABen er kun synlig nede til høyre på kubeprofilen, potensielt skjult av tastatur eller innhold. Det er 3 trykk og 1 scroll.
- **Konsekvens:** Inspeksjon er kjernehandlingen. Hver ekstra trykk øker dropp-raten.
- **Løsning:** Legg til "Start inspeksjon"-knapp direkte på hvert HiveCard i liste-visningen, eller sørg for at FABen alltid er synlig uten scroll.

---

### [MEDIUM] `app/(app)/(tabs)/kuber/index.tsx:165–172` — Sammenlign/Sesong er oppdagbare, men ikke intuitivt plassert

- **Problem:** "Sammenlign" og "Sesong"-knappene ligger i header-baren på Mine Kuber som små, halvgjennomsiktige knapper ved siden av liste/kart-toggle. De er vanskelige å se og har ingen label som forklarer hva de gjør.
- **Konsekvens:** Statistikk-funksjonene — sentrale for hobbyist/pro-brukere — brukes trolig lite.
- **Løsning:** Flytt til en dedikert "Statistikk"-seksjon i bunnen av Kuber-oversikten, eller gi dem egne ikoner med tooltip.

---

### [MEDIUM] `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx:257–267` — Avbryt-dialogen sletter utkast uten å varsle tydelig

- **Problem:** Når bruker trykker "Avbryt" på steg 1 vises en Alert med tekst "Data du har lagt inn vil ikke bli lagret." men dette er misvisende — utkastet _er_ lagret til AsyncStorage og gjenopprettes neste gang. Kun ved å bekrefte avbryt slettes utkastet (`AsyncStorage.removeItem` på linje 258).
- **Konsekvens:** Brukeren tror de mister data, men de gjør det ikke — med mindre de bekrefter avbryt. Dette er forvirrende.
- **Løsning:** Endre alertteksten til "Utkastet vil bli lagret. Du kan fortsette inspeksjonen senere." og gi valg "Lagre utkast" / "Slett og avbryt".

---

### [MEDIUM] `app/(app)/(tabs)/laer/index.tsx:105–123` — Fane heter "Info" i tab-bar, men kalles "Lær" internt

- **Problem:** `app/(app)/(tabs)/_layout.tsx:62` setter `title: 'Info'` som tab-label og tab-ikon-tekst "📖 Info", men mappen heter `laer/` og ruten i intern navigasjon er `/laer/guide/[slug]` og `/laer/[slug]`. Brukeren ser "Info" i tab-baren men URL-stiene sier "laer".
- **Konsekvens:** Ingen synlig brukerkonsekvens i dag, men inkonsekvent navngivning gjør kodebasen forvirrende å vedlikeholde og kan bryte deep links.
- **Løsning:** Velg ett navn konsekvent — enten "Lær" i UI og mapper, eller "Info" begge steder.

---

### [MEDIUM] `app/(app)/(tabs)/kalender/index.tsx:230–250` — Kalender lenker til inspeksjondetalj, men ikke til ny inspeksjon for den datoen

- **Problem:** Trykk på en dag i kalenderen viser inspeksjoner og hendelser for den datoen. Det finnes en FAB for å legge til hendelse, men ingen for å opprette inspeksjon med datoen forhåndsutfylt.
- **Konsekvens:** Brukeren planlegger en inspeksjon i kalenderen, men må navigere til kuber-fanen for å logge den etterpå — dato hentes ikke med.
- **Løsning:** Gi FABen i kalender et valg: "Hendelse" eller "Inspeksjon". Inspeksjon-alternativet navigerer til `/kuber` for kubevelg, deretter til wizard med dato forhåndsutfylt.

---

### [LAV] `app/(app)/(tabs)/_layout.tsx:78` — `feed`-fanen er registrert men skjult (`href: null`)

- **Problem:** Feed-fanen er skjult fra tab-baren men kode og ruter eksisterer. Dette er trolig en "under utvikling"-tilstand.
- **Konsekvens:** Ingen for bruker. Men det betyr at filer i `app/(app)/(tabs)/feed/` vedlikeholdes uten synlig bruksmål.
- **Løsning:** Enten aktiver fanen eller flytt koden til en feature-branch.

---

### [LAV] `app/(app)/(tabs)/kuber/[id]/index.tsx:319–332` — Inspeksjonshistorikk viser maks 50 rader, men "Vis alle" er i-fil state

- **Problem:** `showAllInspections`-state er lokal til `KubeProfil`-komponenten. Hvis bruker navigerer bort og tilbake, tilbakestilles staten til 50.
- **Konsekvens:** Bruker som blar gjennom 60 inspeksjoner, navigerer til en inspeksjon og trykker tilbake — mister posisjonen og må trykke "Vis alle" igjen.
- **Løsning:** Persister `showAllInspections`-state med `useRef` eller flytt til URL-params.

---

### [LAV] `app/(app)/(tabs)/samfunn/index.tsx` — Ingen navigasjonskall til interne ruter

- **Problem:** Samfunn-fanen bruker `Linking.openURL()` for eksterne lenker men har ingen `router.push()`-kall. Svermkartet er lukket — det finnes ingen måte å gå fra et svermvarsel til relevant birøkterlag.
- **Konsekvens:** Svarmkart og lagliste er isolerte øyer uten kobling til resten av appen.
- **Løsning:** Legg til "Se nærmeste lag"-knapp på hvert svermvarsel i kartet.

---

## Maksimal navigasjonsdybde i Kuber-fanen

```
Tabs (nivå 0)
└── Kuber (nivå 1) — KuberOversikt
    └── [id] (nivå 2) — KubeProfil
        ├── inspeksjon/ny (nivå 3) — NyInspeksjon (wizard, 4 steg)
        ├── inspeksjon/[inspId] (nivå 3) — InspeksjonDetalj
        ├── rediger (nivå 3, modal) — RedigerKube
        ├── samarbeid (nivå 3) — Samarbeid
        ├── sammenlign (nivå 2, fra KuberOversikt) — Sammenlign
        └── sesongsammenligning (nivå 2, fra KuberOversikt) — SesongSammenligning
```

Maksimal dybde: 3 (KubeProfil → Ny inspeksjon). Ingen dead ends identifisert — alle skjermer har "Tilbake"-knapp eller navigerer til en logisk overordnet skjerm.

---

## Topp-3 anbefalinger

1. **Gjor samarbeid synlig fra kubeprofilen (KRITISK)** — Flytt "Inviter medbirøkter"-kortet til toppen av kube-profilen med lock-overlay for ikke-Lag-brukere. Lag-planen selger seg ikke selv fra bunnen av en lang scroll-side. Dette er den enkeltendringen med størst upsell-potensiale.

2. **Reduser Hjem-skjermen til 4 seksjoner (HØY)** — Primær-handlingen (starte inspeksjon) er ikke tilgjengelig direkte fra Hjem. Fjern rapport-CTAen fra Hjem, komprimer sesongguiden til ett klikk og prioriter varsler + kubeoversikt. Behold vær-widget som sekundær informasjon.

3. **Legg til aktiveringsguide etter første kube (HØY)** — En enkel 3-stegs banner ("Logg inspeksjon → Skru på varsler → Se varroa-trend") som forsvinner steg for steg er kjent som "activation checklist" og reduserer churn dag 1 markant. Implementer som en AsyncStorage-styrt banner på kubeprofilen.
