# Agent 3 — Konvertering og monetisering

## Metainfo
- Filer lest: `services/subscription.ts`, `hooks/useEffectiveTier.ts`, `components/ui/UpgradeModal.tsx`, `app/(app)/(tabs)/hjem/index.tsx`, `app/(app)/(tabs)/kuber/[id]/index.tsx`, `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`, `components/inspection/Step3.tsx`
- Filer ikke funnet: ingen
- Konfidensgrad: HØY

---

## Sammendrag (maks 80 ord)

Monetiseringsarkitekturen er solid i kjernen: gate-tidspunkt er korrekt (brukeren ser verdien i appen FØR paywall), UpgradeModal har ROI-argument, billing-toggle og "Mest populær"-merking. Kritiske svakheter er at iOS-brukere aldri kan kjøpe noe, PDF-rapport er ubegrenset gratis, Profesjonell-tier mangler sterk differensiering, og AI-demo-kortet under låsen er hardkodet istedenfor personalisert. Prissettingen er defensiv for norsk marked.

---

## Funn

**[KRITISK]** `services/subscription.ts:20-23, 31-34, 48-50, 65` — iOS returnerer alltid mock starter-tier, alle kjøpsforsøk returnerer tom `CustomerInfo`, `fetchOfferings()` returnerer `[]` — iOS-brukere kan aldri kjøpe et abonnement; UpgradeModal åpnes, finner ingen pakker og viser "Abonnementet er ikke konfigurert ennå" — Konfigurer RevenueCat iOS App Store-nøkkel og produkter, eller vis tydelig "iOS-kjøp kommer snart"-melding.

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:482-503` — PDF-årsrapport er gratis for alle tiers uten tier-sjekk — `UpgradeModal.tsx:49` lister "Full CSV/PDF-eksport" som Profesjonell-eksklusiv, men selve rapport-CTA-en på hjemskjermen er ubegrenset tilgjengelig for Starter — inkonsistensen undergraver Profesjonell-tiers verdiforslag og reduserer konverteringsinsentiv — Begrens rapporten til én side/kube for Starter, eller fjern den fra hjemskjermen for gratisbrukere.

**[HØY]** `components/ui/UpgradeModal.tsx:46-55` — Profesjonell (149 kr/mnd) differensierer kun med "AI ubegrenset + CSV/PDF-eksport + Prioritert support" fra Hobbyist — prispunktet er 3× Hobbyist men tilbyr ikke 3× verdi; ingen analytikk, ingen avansert statistikk, ingen tydelig B2B-vinkel — Tillegg av minst én substansiell Profesjonell-eksklusiv funksjon (f.eks. sesongstatistikk per år, historisk varroa-trendeksport, e-post-rapport til lag) er nødvendig for å forsvare prisen.

**[HØY]** `app/(app)/(tabs)/hjem/index.tsx:373-384` — Upgrade-nudge er statisk og eskalerer ikke — samme enkeltlinje "🚀 Ubegrenset kuber · AI-analyse · Rapporter / Oppgrader →" vises dag 1 og dag 300 uten urgency, uten pris og uten personalisering — brukere venner seg til banneret og ignorerer det (banner blindness) — Variabel nudge basert på tid siden registrering og brukeradferd (varroa-telling > terskel, nærmer seg kubegrensen).

**[HØY]** `hooks/useEffectiveTier.ts:9-11` — `trialExpiresAt` håndteres korrekt i hooken, men appen har ingen synlig "trial er over"-melding etter utløp — brukeren opplever at funksjoner plutselig forsvinner uten forklaring (silent downgrade) — Vis en modal ved neste app-åpning etter trial-utløp: "Din prøveperiode er over — fortsett med Hobbyist for 49 kr/mnd".

**[MEDIUM]** `components/inspection/Step3.tsx:121-136` — Demo-kortet under AI-låsen viser hardkodet "12 mitter (demo) — Middels" med teksten "Varroa-nivå over anbefalt terskel" — tallet er ikke forankret i brukerens data og fremstår tydelig som fake — Bruk brukerens siste manuelle varroa-telling som demo-input, eller bruk sesonggjennomsnitt fra Supabase.

**[MEDIUM]** `components/ui/UpgradeModal.tsx:83-88` — RevenueCat-offerings lastes ikke inn proaktivt; `enabled: visible` betyr kallet skjer idet modalen åpnes — brukeren ser en tom tilstandsliste i 0,5–2 sekunder akkurat i kjøpsøyeblikket — Last offerings ved app-start (`initPurchases` kalles allerede i `_layout.tsx`) og cache i React Query med `staleTime: Infinity`.

**[MEDIUM]** `components/ui/UpgradeModal.tsx:9-70` — Ingen social proof i modalen — ingen brukertall, ingen anmeldelse, ingen "Mest brukt av norske hobbybirøktere" — social proof er det sterkeste psykologiske virkemiddelet i abonnementsalg — Legg til én kort testimonial eller brukertall etter features-listen.

**[MEDIUM]** `app/(app)/(tabs)/kuber/[id]/index.tsx:355-373` — Samarbeid-raden viser "🔒 Samarbeid (Lag)" uten pris eller verdiforklaring — brukere som trykker og ser 499 kr/mnd i UpgradeModal uten kontekst avviser tilbudet — Legg til subtekst "Dele kuber med opptil 50 brukere — fra 499 kr/mnd" direkte på raden.

**[MEDIUM]** `components/ui/UpgradeModal.tsx:297-302` — Spare-badge sier "Spar 3 mnd" i tekst — norske forbrukere responderer bedre på konkrete beløp — "Spar 189 kr" (Hobbyist) er mer overbevisende enn "Spar 3 mnd" — Bytt badge-tekst til konkret kronebeløp per tier.

**[LAV]** `components/ui/UpgradeModal.tsx:127-129` — Etter vellykket kjøp kalles `onClose()` uten bekreftelse eller celebration — ingen takkmelding, ingen konfetti — øker risiko for at brukeren er usikker på om kjøpet gikk gjennom — Vis en enkel "Velkommen til Hobbyist! Du har nå ubegrenset antall kuber og AI-analyse."-melding.

**[LAV]** `components/ui/UpgradeModal.tsx:252-254` — Legal-tekst hardkoder "Google Play" — vil forvirre iOS-brukere når iOS-kjøp aktiveres — Gjør teksten plattformbetinget med `Platform.OS`.

**[LAV]** `app/(app)/(tabs)/hjem/index.tsx:386-399` — Trial-banner har identisk design og farge om det er 14 dager igjen som om det er 1 dag igjen — ingen urgency-eskalering — Endre til rødt bakgrunn og sterkere tekst de siste 3 dagene: "Kun X dager igjen — ikke mist AI-analysen din".

---

## Prisvurdering

- **Hobbyist 49 kr/mnd** er defensivt priset. For norsk birøktermarked, der en enkelt bikube er verdt 3 000–8 000 kr, tåler kundene 69–79 kr. Lav pris signaliserer lavere verdi enn appen leverer.
- **Profesjonell 149 kr/mnd** er riktig prisnivå for norsk niche-app, men feil verdiforslag. Differensieringen er for svak til å rettferdiggjøre 3× prisen. Legg til én substansiell feature.
- **Lag 499 kr/mnd** er rimelig for organisasjoner, men bør tilbys med fakturaalternativ — birøkterlag kjøper ikke 499 kr/mnd via Google Play, men gjerne via EHF-faktura.

---

## Topp-3 anbefalinger

1. **Konfigurer RevenueCat for iOS umiddelbart** — `services/subscription.ts:20-23` blokkerer all inntekt fra iPhone-brukere. Dette er den eneste endringen som øker total inntjening uten å endre et eneste UX-element. Selv en "iOS-kjøp kommer snart — registrer deg"-skjerm er bedre enn en teknisk feilmelding.

2. **Gjør PDF-rapport til en Starter-begrenset feature og styrk Profesjonell-differensieringen** — Gratis ubegrenset rapport (`hjem/index.tsx:482-503`) undergraver Profesjonell-tiers sterkeste feature. Begrens til 1 kube/rapport for Starter. Legg til én eksklusiv Profesjonell-funksjon (f.eks. historisk varroa-trendeksport per sesong) for å gjøre 3× prissteget logisk.

3. **Erstatt statiske nudges med kontekstdrevne triggers** — Det statiske banneret på hjemskjermen (`hjem/index.tsx:373-384`) og det hardkodede demo-kortet (`Step3.tsx:121-136`) er de to høyeste konverteringspunktene i appen. Begge bør trigges av brukerdata: banneret når brukeren nærmer seg 3-kubegrensen eller varroa-telling er høy, demo-kortet med brukerens eget siste varroa-tall. Personaliserte nudges konverterer typisk 2–5× bedre enn generiske.
