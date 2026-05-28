# BiVokter — Prioritert handlingsplan
*Syntese av 12 agentrapporter · 2026-05-28*

---

## 1. Konsensus-funn (3+ agenter)

| Funn | Agenter |
|------|---------|
| `select('*')` i alle services — unødvendig payload og skjult API-kontrakt | 6, 12, 5 |
| iOS RevenueCat er ikke konfigurert — ingen iOS-inntekt mulig | 3, 5, 7 |
| Manglende `accessibilityLabel` på ~83% av interaktive elementer | 9, 2 |
| Samarbeidsfunksjonen er usynlig og selger ikke Lag-tier (499 kr) | 1, 3, 10 |
| Hjem-skjermen er overbelastet og mangler én klar primærhandling | 1, 2, 11 |
| Ingen aktiveringsguide etter første kube — churn dag 1 | 1, 10, 11 |
| `weekly-hive-alerts` skalerer ikke og sender varsler om vinteren | 10, 12, 7 |
| Onboarding slide 5 ber om kjøp før bruker har sett verdien | 3, 11 |
| Varroa nattefall-terskel (10/dag) er 5–8x for høy per COLOSS/Norsk Birøkterlag | 4, 7 |
| `Colors.honey` som tekst/FAB-farge gir 2.03:1 kontrast — WCAG AA-brudd | 2, 9 |
| Ingen vinterengasjement-strategi — appen mister kontakt 4 mnd/år | 10, 12 |

---

## 2. Motstridende anbefalinger

**Conflict 1: Hjem-skjerm redesign vs. "monter SeasonSummaryCard"**
Agent 1 sier kutt til 4 seksjoner. Agent 10 sier monter `SeasonSummaryCard` (ny seksjon).
*Løsning:* Monter `SeasonSummaryCard` som en av de fire tillatte seksjonene. Fjern rapport-CTA og komprimer sesongguiden.

**Conflict 2: Prøveperiode-timing**
Agent 3 sier flytt trial-CTA til etter aha-moment. Agent 11 sier det samme. Ingen reell konflikt — begge peker samme vei.
*Løsning:* Flytt trial-kjøp til dag 2–3. Behold "trial utløpt"-modal ved utløp.

**Conflict 3: Alert.alert vs. egne modaler**
Agent 2 sier erstatt `Alert.alert()` med `ConfirmSheet`. Agent 5 sier mønsteret er akseptabelt der det brukes.
*Løsning:* Prioriter kun for destruktive handlinger (slett kube, slett vektregistrering). Vanlige alerts er OK.

---

## 3. Topp-20 ROI-rangering

*Formel: Konverteringseffekt × (1/kostnad) × (1+sikkerhetsrisiko)*

**[1]. iOS RevenueCat konfigurering** — `services/subscription.ts:20–23` — 2–4t — Blokkerer 100% av iOS-inntekt. Ingen UX-arbeid nødvendig.

**[2]. Alerts-secret i git-historikk** — `0018_weekly_alerts_secret.sql:20` — 1t — Eksponert hemmelighet; alle med repo-tilgang kan sende push til alle brukere. Høy sikkerhetsrisiko.

**[3]. Samarbeid synlig øverst i kubeprofil** — `kuber/[id]/index.tsx:355–373` — 1–2t — Lag-tier (499 kr) er primær upsell. I dag gjemt 3+ scrollelengder ned. Nær null konvertering.

**[4]. Onboarding slide 5: snu CTA-hierarkiet** — `onboarding.tsx:136–155` — 30 min — "Legg til kube" primær, "Start trial" sekundær. Direkte effekt på aktiveringsrate.

**[5]. Aktiveringsguide post-onboarding (3-stegs kort)** — `hjem/index.tsx` — 3t — Dokumentert sterkeste single retention-tiltak for hobbypregede apper. Reduserer churn dag 1–7.

**[6]. GDPR: paginering i delete-account** — `delete-account/index.ts:8` — 1t — Brukere med >100 bilder får ikke slettet all data. Konkret GDPR Art. 17-brudd.

**[7]. `feed_likes` DELETE-policy** — `0011_feed.sql:37–40` — 15 min — Alle innloggede brukere kan slette andres likes. To-linjers SQL-fix.

**[8]. `ai_analysis_usage` INSERT-policy** — `0015_inspection_ai_fields.sql:20–22` — 15 min — Rate-limit er ikke-funksjonelt uten denne. Ubegrenset AI-bruk mulig.

**[9]. Varroa nattefall-terskel** — `TreatmentRecommendationSection.tsx:30–31` — 30 min — Terskel 10/dag er 5–8x for høy. Direkte kolonihelseproblem og faglig feilinformasjon.

**[10]. Apivar-advarsel: honningmagasin** — `TreatmentRecommendationSection.tsx:81` — 30 min — Mattrygghetsproblem og potensiell rettslig eksponering uten advarsel om magasinrens.

**[11]. PDF-rapport begrenset for Starter** — `hjem/index.tsx:482–503` — 1–2t — Profesjonell-tier sin sterkeste feature er gratis for alle. Undergraver konvertering.

**[12]. Overdue-terskel harmonisering + gjentakende varsler** — `weekly-hive-alerts/index.ts:9`, `notifications.ts:113` — 1t — `OVERDUE_DAYS=21` vs. 14 dager i UI. Brukere ignorerer ett varsel og hører aldri mer.

**[13]. E-postbekreftelse deep-link** — `register.tsx:70–74` — 2–3t — Blokkerer e-postbrukere fra å returnere til appen etter klikk i e-post. Tap av registrerte brukere.

**[14]. SeasonSummaryCard montert** — `components/home/SeasonSummaryCard.tsx` — 30 min — Ferdigimplementert komponent aldri montert. Gir daglig verdi og øker retention.

**[15]. Tier-sync feil svelges** — `_layout.tsx:26` — 30 min — Betalende bruker kan havne på feil tier lydløst. Sentry-logging + toast.

**[16]. weekly-hive-alerts server-side refaktor** — `weekly-hive-alerts/index.ts:67–82` — 4–8t — Feiler hardt ved ~2 000 aktive brukere. Kritisk for skalerbarhet.

**[17]. select('*') → eksplisitte kolonner** — Alle services — 2–3t — 30–50% lavere nettverkstraffic. Stabil API-kontrakt og synlig payload.

**[18]. Colors.honey kontrastfix** — `colors.ts`, `Button.tsx`, `HiveCard.tsx` — 1–2t — WCAG-brudd. Svaksynte kan ikke lese FAB-tekst, statkey-etiketter eller ghost-knapper.

**[19]. Vintermodus i Edge Function og dashboard** — `weekly-hive-alerts/index.ts:110`, `hjem/index.tsx:62` — 2t — Uten dette mister appen kontakt med brukere 4 mnd/år og betaler med churn til neste sesong.

**[20]. Negativ varroa-count validering** — `ny.tsx:218` — 15 min — Korrupte data i Supabase påvirker helsescore, trend og alertlogikk permanent.

---

## 4. Denne uken (< 4 timer totalt)

1. **Fiks `feed_likes` DELETE-policy** — 15 min — Én SQL-migrasjon. (`agent-08`)
2. **Legg til `ai_analysis_usage` INSERT-policy** — 15 min — Rate-limit fungerer ikke uten. (`agent-08`)
3. **Valider negativ varroa-count** — 15 min — `Number(varroaCount) < 0`-sjekk i `ny.tsx:218`. (`agent-07`)
4. **Snu CTA-hierarkiet på onboarding slide 5** — 30 min — "Legg til kube" primær, trial sekundær. (`agent-11`)
5. **Juster varroa nattefall-terskel** — 30 min — `warnThresh: 1`, `critThresh: 2` per dag. (`agent-04`)
6. **Monter SeasonSummaryCard i Hjem** — 30 min — Importer og legg til i render-treet. (`agent-10`)

*Totalt: ~2 timer 15 min*

---

## 5. Sprint 1 (neste 2 uker)

**1. iOS RevenueCat konfigurering** — Høyeste ROI. Ingen iOS-inntekt uten dette.
Fil: `services/subscription.ts:20–23`. Estimat: 2–4 timer.

**2. Samarbeid synlig øverst + Lag-tier upsell** — Flytt "Inviter medbirøkter"-kort til øverst i kubeprofil med lock-overlay for ikke-Lag-brukere.
Fil: `kuber/[id]/index.tsx:355–373`. Estimat: 2 timer.

**3. Aktiveringsguide: 3-stegs kom-i-gang-kort** — Sporbar via AsyncStorage: Kube / Inspeksjon / Varsler. Forsvinner når alle er fullført.
Fil: `hjem/index.tsx` (ny komponent). Estimat: 3–4 timer.

**4. GDPR delete-account paginering** — Paginerings-loop i `cleanStorageBucket`. Juridisk krav.
Fil: `supabase/functions/delete-account/index.ts:8`. Estimat: 1 time.

**5. weekly-hive-alerts: vintermodus + harmonisering** — Hopp over overdue-varsler november–februar. Sett `OVERDUE_DAYS=14`. Gjør påminnelse ukentlig gjentakende.
Fil: `weekly-hive-alerts/index.ts`. Estimat: 2–3 timer.

---

## 6. Roadmap (3 måneder)

**Måned 1: Monetisering og sikkerhet**
- Fjern alerts-secret fra git-historikk med `git filter-repo` og verifiser rotasjon i Supabase Dashboard
- Begrens PDF-rapport til 1 kube for Starter-tier — styrk Profesjonell-differensiering
- RevenueCat-webhook idempotency: flytt `processed_events`-insert til etter vellykket tier-update (atomisk RPC)
- Legg til "Spar X kr"-badge (konkret beløp) i UpgradeModal istedenfor "Spar 3 mnd"
- E-postbekreftelse deep-link (`bivokter://auth/callback`) slik at e-postbrukere returnerer til appen
- Tier-sync feil: bytt `.catch(() => {})` med Sentry-logging + `'warning'`-toast

**Måned 2: Faglig korrekthet og domene**
- Yngelkvalitetsvurdering i Step 2 (tett/spredt/flekkete + boolean "misdannede larver")
- Apivar-advarsel med honningmagasinsjekk + `brood_free`-felt i treatments-tabellen
- Dronningceller: endre til enum (svermcelle/nødcelle/dronningcelle) + tellefeltet
- Terminologi: "Klebbplate (nattefall)", "Oksalsyre (drypp/fordamping)", "Carnica"
- Fjern Apistan fra sykdomsguide (ikke tilgjengelig i Norge, resistens)
- Vinterfôringsanbefaling: 18–22 kg (Sør) / 22–25 kg (Nord)

**Måned 2–3: Ytelse og arkitektur**
- `weekly-hive-alerts` refaktor til server-side SQL med cursor-paginering (100 brukere → 10 000)
- Alle `select('*')` → eksplisitte kolonner i alle services
- Virtualiser inspeksjonshistorikk med FlatList/FlashList i kubeprofil
- `gcTime: 30 min` i queryClient; memoize `activeHives`/`hivesWithScore`/`varselCount` i kuber-oversikten
- Systematisk `accessibilityLabel` på alle Pressable (mål >90%, fra dagens ~17%)

**Måned 3: Vekstfunksjoner**
- Invite-by-link for samarbeid (viral vekst — i dag krever mottaker eksisterende konto)
- Sonebaserte sesongkalendre: NBF-sone 1–8 registrert ved onboarding
- Personalisert upgrade-nudge basert på kubetall og varroa-nivå (ikke statisk banner)
- "Årets beste kube"-sesongsammendrag på Hjem med vs. forrige sesong

---

## 7. Ikke-prioriter nå

- **PostGIS-migrering for svermkart** — Client-side filtrering fungerer for 100 brukere. Stor migrasjon med lav ROI på dette stadiet.
- **Offline-first synkroniseringskø** — AsyncStorage-utkast er tilstrekkelig. Full offline-kø er 2–3 ukers arbeid.
- **Avlsmodul (avlslinje, ytelsesscore, VSH-test)** — Relevant for <5% av målgruppen nå. Fase 2.
- **Haptic feedback og Lottie-animasjoner** — Design-polish som ikke påvirker konvertering til 100 brukere.
- **Glassmorfisme og gradient-hero** — Prematur estetisk optimalisering.
- **Flerkubebehandlingsplan** — Konkurrerer med BeeKeepPal men krever betydelig UI-arbeid. Fase 2.
- **`updated_at`-trigger på alle tabeller** — Teknisk rydding. Ingen brukereffekt i dag.
- **`team_members` RLS UPDATE/DELETE-policyer** — Team-UI er ikke implementert ennå. Adresser ved lansering.

---

## 8. Appens nåværende tilstand

BiVokter er funksjonell og faglig gjennomarbeidet nok til å nå 100 betalende brukere, men iOS-inntekt er blokkert, en hemmelighet ligger eksponert i git-historikken, og aktiveringsflyten mister brukere på dag 1 — disse tre punktene må lukkes umiddelbart.
