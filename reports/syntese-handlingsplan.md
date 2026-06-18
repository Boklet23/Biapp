# Syntese — Prioritert handlingsplan for BiVokter

Multi-agent review v3 (13 agenter) konsolidert. Generert: 2026-06-18.
Kontekst: pre-lansering (intern testing Play Console, versionCode ~21), én utvikler + Claude, mål 100 betalende første sesong. Juni = svermetid/høysesong — time-to-market har egenverdi.

**Rapporter lest:** agent-01 … agent-13 (13/13) + arkivert syntese 2026-06-12.
**Migrasjonsstatus:** Bekreftet på disk: høyeste migrasjon = **0051** (Agent 8 og 12 leste 0046–0051; den opprinnelige promptkonteksten stoppet på 0045). Flere «fikset siden sist»-påstander hviler på 0046–0051 og er verifisert mot faktiske filer (se §2 og §3).
**Status siden 12. juni:** Forrige syntese satte 5 ship-blokkere; alle 5 er nå **verifisert lukket**: (1) paywall-bypass på `profiles` (0047 REVOKE+WITH CHECK), (2) server-side kubegrense gjenopprettet (0046-trigger + 0049-herding), (3) push `hiveId`-deeplink + kald start, (4) READ_MEDIA-permissions blokkert + `expo-media-library` fjernet, (5) jest+CI etablert. Reviewen er i en **modnet** tilstand: ingen åpne KRITISK-funn i kode.

---

## 1. Konsensus-funn (matrise)

13 agenter med stramt adskilte scope gir få 3+-overlapp. Funn rapportert uavhengig av 2+ agenter regnes som konsensus og vektes opp. Funn med 3+ agenter er øverst (høyest reliabilitet).

| # | Funn | Agenter | Grad |
|---|------|---------|------|
| K1 | **Kubefoto lagres som 1-årig signed URL** — dør stille etter 365 dager / nøkkelrotasjon; bør lagre path + signere ved lesing | **7, 8, 12** (3 agenter) | MEDIUM |
| K2 | **`select('*')` i ~15 queries** — henter `notes` + lang `photo_url` for hele kubelista | **5, 6, 12** (3 agenter) | MEDIUM |
| K3 | **`weekly-hive-alerts` global sweep** (henter alle profiler/kuber/inspeksjoner i ett kall) — skaleringsblokkering + fail-open-secret | **8 (fail-open), 10 (win-back), 12 (sweep)** | MEDIUM/HØY |
| K4 | **`hjem/index.tsx` >800 linjer + henter 500 fulle inspeksjonsrader** for to teller-/kortbruk | **5 (982 linjer), 6 (payload)** | MEDIUM |
| K5 | **Emoji-faneikoner + dekor-emoji** — leketøyspreg på betal-app + TalkBack leser rå emoji | **2 (design), 9 (a11y)** | MEDIUM |
| K6 | **Manglende `fontFamily` på konverterings-/førsteinntrykksflater** (UpgradeModal, auth, Toast) → systemfont på salgsflaten | **2 (HØY), 9 (indirekte)** | MEDIUM |
| K7 | **ActivationGuide steg 2 lander på kubeliste, ikke inspeksjonsflyt** + CTA-overlapp ved 0 kuber | **1, 11** | MEDIUM |
| K8 | **`Promise.all` i rapportgenerering** feiler alt hvis én query feiler | **5 (relatert), 7** | MEDIUM |
| K9 | **AI-varroa-oppdagbarhet/eksponering svak** + `diseaseObservations`-felt plumbet men ikke i wizard | **1 (synlighet), 4 (domene-felt)** | MEDIUM |
| K10 | **Ingen offline-evne / NetInfo** (in-memory cache, retry:2 med rå feilmelding) | **7 (HØY)** + relatert 12 | HØY |

Merk: Sammenlignet med forrige runde (10 konsensusfunn, ett KRITISK) er det nå **0 KRITISK-konsensus**. Reliabiliteten er høy fordi de fleste 3-agent-funnene (K1, K2) er rene hygiene-/skaleringsfunn, ikke lanseringsblokkere.

---

## 2. Konflikter — løst eksplisitt

**Konflikt 1 — 0013-regresjonspåstanden (Agent 3 vs. Agent 12/8). LØST: Agent 12/8 har rett; Agent 3 tar feil.**
Agent 3 melder `[REGRESJON]`: at INSERT-policyen i `0013_hive_starter_limit.sql:11` fortsatt sjekker rå `subscription_tier != 'starter'`, så trial-brukere avvises på kube #4. Jeg leste de tre migrasjonene selv:
- `0013:11` har faktisk den rå tier-sjekken — *isolert sett* er observasjonen korrekt.
- MEN `0046_restore_hive_limit.sql` erstatter håndhevelsen med en **BEFORE INSERT/UPDATE-trigger** (`enforce_starter_hive_limit`) som eksplisitt anerkjenner trial: `IF v_trial IS NOT NULL AND v_trial > now() THEN RETURN NEW;` (linje 36–38). `0049` herder funksjonen (REVOKE EXECUTE, sletter foreldreløs `count_active_hives_for_user`).
- Trigger fyrer på alle INSERT/UPDATE uavhengig av policyen. Trial-brukeren slipper derfor gjennom på server-siden — **det er ingen klient↔DB-sprik**. 0013-policyen er nå overflødig dødkode (begge må passere; triggeren er den brede gaten og 0013-policyen blokkerer aldri en trial-bruker som triggeren slipper gjennom, fordi `WITH CHECK` på 0013 kun gjelder rå tier — en trial-starter med 3 kuber *ville* blitt blokkert av 0013-policyen).

**Viktig nyanse:** 0013-policyen sjekker rå tier OG count<3. En trial-bruker har `subscription_tier='starter'` i DB. På kube #4 gir 0013-policyen `'starter' != 'starter'` = false OG `count<3` = false → **INSERT blokkeres av 0013-policyen selv om triggeren ville sluppet den gjennom**. Agent 3s *symptom* (trial-bruker avvises på kube #4) kan derfor fortsatt inntreffe — ikke pga. manglende fiks, men fordi **den utdaterte 0013-policyen aldri ble droppet da 0046-triggeren overtok**. Agent 12 antok 0046 erstattet 0013 fullstendig; det gjorde den ikke.
**Avgjørelse / tiltak:** Drop den utdaterte 0013 INSERT-policyen (den dupliserer og er strengere enn triggeren). Triggeren skal være eneste håndhever. Dette er en **S-fiks (ny migrasjon: `DROP POLICY "hives: opprett egne" ON hives;` + gjenskap en ren `WITH CHECK (auth.uid() = user_id)`)**. Begge agenter hadde delvis rett: fiksen *ble* gjort (0046/0049), men en gammel, strengere policy ble stående og kan fortsatt avvise trial-brukere. Verifiser med et trial-testtilfelle før lansering.

**Konflikt 2 — Polere vs. shippe (Agent 2/9 vs. 13).** Agent 2 vil ha Typography-migrering (L) + lucide-ikonsett; Agent 9 vil ha fullt a11y-løft. Agent 13 viser at restrisikoen er manuelle dashboard-steg, ikke kode. **Avgjørelse:** Ship-orientert. Gjør KUN billig design/a11y som treffer konvertering eller lovrisiko: kontrast-tokens (S) og `fontFamily` på UpgradeModal/auth/Toast (M). Typography-/Radii-full-migrering + lucide utsettes — flytter ikke 100-betalende-målet i juni. (Uendret fra forrige syntese; fortsatt riktig.)

**Konflikt 3 — Flere varsler vs. varslingstretthet (Agent 10 vs. 7/10 internt).** Agent 10 vil ha win-back + år-for-år; Agent 7 og 10 advarer mot dobbel forfalt-varsling (klient + server). **Avgjørelse:** Ikke øk varselvolum før kilde-konsolidering. La server eie «forfalt inspeksjon»; behold lokal kun som fallback uten push_token. Win-back/`last_seen_at` er verdifullt men utsettes til rett etter lansering (krever DB-kolonne + sweep-endring som uansett trengs for K3).

**Konflikt 4 — Aktiver feed vs. ikke (Agent 1/5 «sovende kode» vs. Agent 10 «ikke aktiver»).** **Avgjørelse:** Følg Agent 10 — ikke aktiver feed før >100 brukere. Tomt sosialt rom signaliserer død app. La den ligge `href:null`. Ingen handling.

**Konflikt 5 — `select('*')`-slanking vs. defensiv mapX (Agent 6/12 vs. 5).** **Avgjørelse:** Kolonnelister utledes fra mapX()-feltene (ingen reell konflikt). Lav gevinst ved <100 brukere → utsettes til etter lansering, unntatt `fetchHives` (dropp `notes`) som er billig og treffer dashboardet.

**Ikke-konflikt verdt å merke:** Agent 5 flagger at `collaboration.ts:14` refererer migrasjon `0050` som «ikke finnes på disk (siste=0049)», mens Agent 8/12 leser 0050 OG 0051. Jeg bekreftet via Glob at **0046, 0049, 0050, 0051 alle finnes**. Agent 5 hadde et utdatert/ufullstendig filsyn — noter lavere tillit til Agent 5s migrasjons-relaterte påstander (men service-laget-funnene står).

---

## 3. Falsifisering — stikkprøve 5 KRITISK/HØY-funn

Alle 5 lest i koden av syntese-agenten selv:

| # | Funn | Kilde | Verifikat | Holdt? |
|---|------|-------|-----------|--------|
| 1 | `Typography` importeres aldri (0 filer) | A2 HØY | Grep `Typography` i `*.tsx` → **0 treff** | ✅ |
| 2 | Apistan anbefales (ikke MT-godkjent i Norge) | A4 HØY | `constants/diseases.ts:17` → `'...Apistan, ApiLife Var eller Apivar...'` | ✅ |
| 3 | `weekly-hive-alerts` secret feiler åpent | A8 MEDIUM | `weekly-hive-alerts/index.ts:35-40` → `if (alertsSecret) { ... }` — hopper sjekk hvis env tom (fail-open) | ✅ |
| 4 | `expo-image` ikke installert | A6 MEDIUM | Grep `expo-image"` i `package.json` → **0 treff** (kun picker/manipulator) | ✅ |
| 5 | Ingen analytics i kildekode | A10 HØY | Grep `analytics\|posthog\|amplitude\|mixpanel\|trackEvent\|logEvent` i `services/app/components/lib/hooks` → **0 treff** | ✅ |

**Resultat: 5/5 holdt vann.** Full tillit til agentenes funn; ingen nedjustering. (Eneste tillitsjustering: Agent 5s migrasjons-*filsyn* — se Konflikt 5 — men det er en kontekstmangel, ikke et falskt funn.)

---

## 4. Topp-20 ROI-tabell

Score = (2E + 2R) × I / 10. E = effekt på lansering/konvertering/retention (1–5). R = risikoreduksjon (1–5, 5=KRITISK). I = innsats (1=XL … 5=S). Sortert synkende.

| # | Tiltak | E | R | I | Score | Kilde | Filer | Innsats |
|---|--------|---|---|---|-------|-------|-------|---------|
| 1 | Kast eksplisitt feil ved tom RevenueCat-nøkkel (Android) | 4 | 4 | 5 | **8.0** | A13 | `services/subscription.ts:11,24` | S |
| 2 | Fjern Apistan fra varroa-`treatment` (legemiddel-lovrisiko) | 3 | 5 | 5 | **8.0** | A4 | `constants/diseases.ts:17` | S |
| 3 | Fail-closed på `weekly-hive-alerts`-secret | 2 | 5 | 5 | **7.0** | A8 | `weekly-hive-alerts/index.ts:35-40` | S |
| 4 | Drop utdatert 0013 INSERT-policy (trial blokkeres på kube #4) | 4 | 3 | 5 | **7.0** | A3/A12 (konflikt) | ny migrasjon, `0013` | S |
| 5 | `.env.example` komplett (RC-nøkkel + APP_ENV) | 3 | 4 | 5 | **7.0** | A13 | `.env.example` | S |
| 6 | Kontrast-pass: `taskSubUrgent`→honeyText, `muted`→`mid`, Toast-bg, varroaLabel (UU-lovpålagt) | 3 | 4 | 4 | **5.6** | A9 | `colors.ts`, `hjem`, `Toast.tsx`, `HiveCard.tsx` | S |
| 7 | Steg 2 ActivationGuide → `inspeksjon/ny` + skjul guide/empty-overlapp | 4 | 1 | 5 | **5.0** | A1/A11 | `ActivationGuide.tsx:101`, `hjem:355` | S |
| 8 | `Promise.allSettled` i rapportgenerering | 3 | 3 | 4 | **4.8** | A7 | `hjem/index.tsx:219-233` | S |
| 9 | Minimal analytics (6–8 events) — måle 100-betalende-målet | 5 | 2 | 3 | **4.2** | A10 | nytt `lib/analytics.ts`, `_layout.tsx:45` | M |
| 10 | DELETE-policy på `hive_disease_flags` (GDPR-residual) | 2 | 4 | 4 | **4.8** | A8 | ny migrasjon | S |
| 11 | `fontFamily` på UpgradeModal + auth + Toast (salgsflater) | 4 | 1 | 4 | **4.0** | A2 | `UpgradeModal.tsx`, `login/register.tsx`, `Toast.tsx` | M |
| 12 | Trial-utløps-funnel (push dag 12 + utløpsmodal m/årstilbud) | 5 | 1 | 3 | **3.6** | A3 | `hooks/useEffectiveTier.ts`, ny modal | M |
| 13 | Body-grense + Anthropic-timeout i `analyze-varroa` | 2 | 4 | 4 | **4.8** | A8/A12 | `analyze-varroa/index.ts:88,99` | S |
| 14 | Offline-persistering + NetInfo-banner (felt-bruk) | 4 | 2 | 2 | **2.4** | A7 | `lib/queryClient.ts` | M |
| 15 | Stabiliser kubeliste (useMemo + useCallback-renderItem) | 3 | 1 | 4 | **3.2** | A6 | `kuber/index.tsx:87-101,218` | S–M |
| 16 | Lagre hive-photo path, signer ved lesing (3-agent K1) | 2 | 3 | 3 | **3.0** | A7/A8/A12 | `services/hive.ts:73-78` | M |
| 17 | Eksponer sykdom/droneyngel/lukt i wizard (`diseaseObservations`) | 3 | 2 | 3 | **3.0** | A4 | `Step2/3.tsx`, `inspection.ts` | M |
| 18 | Slank `fetchAllInspections` på dashboard (count + slank kolonne) | 2 | 2 | 4 | **3.2** | A6 | `hjem/index.tsx:139-143` | S–M |
| 19 | Resize kube-/feed-foto før opplasting (gjenbruk Step3-mønster) | 2 | 2 | 5 | **4.0** | A6 | `kuber/ny.tsx`, `feed/ny.tsx` | S |
| 20 | Steinyngel + trakemidd som meldepliktige sykdommer | 2 | 3 | 4 | **4.0** | A4 | `constants/diseases.ts` | M |

(Score-spredningen er lav fordi det ikke gjenstår KRITISK med høy R+E samtidig — typisk for en moden kodebase.)

---

## 5. Denne uken (<8 t totalt) — rask-fixer

Rekkefølge etter ROI. Alle er S. Samlet estimat ~6–7 t.

1. **RevenueCat tom-nøkkel kaster** (~15 min) — `subscription.ts:11`: `if (Platform.OS === 'android' && !ANDROID_KEY) throw new Error('RevenueCat Android-nøkkel mangler')` før `configure`.
   *Verifikasjon:* Bygg lokalt uten `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` → appen skal kaste tydelig feil, ikke stille konfigurere.
2. **Fjern Apistan** (~10 min) — `diseases.ts:17`: erstatt med «Oksalsyre (vinter/yngelfritt), maursyre (gjennom forseglet yngel), ApiLife Var (timol) eller Apivar (amitraz, krever godkjenningsfritak)».
   *Verifikasjon:* Grep `Apistan` → 0 treff; åpne varroa-sykdomssiden i appen og bekreft ny tekst.
3. **Fail-closed weekly-alerts** (~10 min) — `weekly-hive-alerts/index.ts:35`: `if (!alertsSecret || req.headers.get('x-alerts-secret') !== alertsSecret) return 401`.
   *Verifikasjon:* Kall edge-funksjonen uten header → 401; med riktig header → 200.
4. **Drop utdatert 0013-policy** (~30 min, NY migrasjon) — `DROP POLICY IF EXISTS "hives: opprett egne" ON hives;` + `CREATE POLICY ... WITH CHECK (auth.uid() = user_id)` (la triggeren håndheve grensen).
   *Verifikasjon:* Test-trial-bruker (sett `trial_expires_at` fram i tid, `subscription_tier='starter'`) skal kunne opprette kube #4; vanlig starter med 3 aktive skal få norsk trigger-feilmelding på kube #4.
5. **`.env.example`** (~10 min) — legg til `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` + `EXPO_PUBLIC_APP_ENV` med kommentar.
   *Verifikasjon:* Diff viser begge variabler; ny utvikler kan kopiere fila uten å mangle runtime-vars.
6. **Kontrast-pass** (~1 t) — `hjem:874` `taskSubUrgent`→`Colors.honeyText`; `colors.ts:26` bytt `muted`→`mid` der det bærer tekst; `Toast.tsx:8-9` success `#2E7D32`/info `#1F6FA8`; `HiveCard` varroaLabel-farger + ≥10pt.
   *Verifikasjon:* Kjør kontrast mot WCAG-formel (alle ≥4.5:1 på <18pt); visuell sjekk av «X dager siden»-tekst på hjem.
7. **ActivationGuide steg 2 + 0-kube-overlapp** (~45 min) — `ActivationGuide.tsx:101`: ved `hiveCount===1` rut til `/kuber/[id]/inspeksjon/ny`; skjul guide når `hives.length===0 && empty-state vises`.
   *Verifikasjon:* Ny bruker med 1 kube trykker steg 2 → lander i wizard; 0-kube-dashboard viser kun ett CTA.
8. **`Promise.allSettled` i rapport** (~30 min) — `hjem:219-233`: generer rapport på det som lyktes, spesifiser hva som manglet.
   *Verifikasjon:* Mock `fetchAllTreatments` til å feile → rapport genereres fortsatt med inspeksjonsdata.

---

## 6. Sprint (2 uker) — de 5 viktigste for lansering + konvertering

I rekkefølge, med avhengigheter.

1. **Alle «denne uken»-fiksene over** (avhengighet: ingen). Ship-blokkere + billig konvertering/UU. Må være ferdig før resten.
2. **Minimal analytics (6–8 events)** — `app_open`, `hive_created`, `inspection_completed`, `ai_analysis_run`, `upgrade_modal_shown`, `purchase_completed`, `push_opened`, `report_generated`. Hekt `push_opened` på eksisterende listener (`_layout.tsx:45`). *Avhengighet: ingen, men MÅ inn før lansering* — ellers er 100-betalende-målet blindflyging og effekten av alt annet i denne sprinten kan ikke måles.
3. **`fontFamily` på salgsflater** (UpgradeModal, auth, Toast) — konsistent Manrope der det selger og ved førsteinntrykk. *Avhengighet: kontrast-passet (#6 over) bør gjøres samtidig på Toast for å unngå dobbeltarbeid.*
4. **Trial-utløps-funnel** — scheduled push dag 12 + utløpsmodal med årsrabatt ved første åpning etter utløp. *Avhengighet: krever at trial faktisk virker server-side (sprint-punkt 1, 0013-fiks) + analytics (punkt 2) for å måle konvertering.*
5. **GDPR + helsedata-hygiene** — DELETE-policy på `hive_disease_flags` + gratis dataeksport (art. 20, Edge Function som dumper brukerrader til JSON). *Avhengighet: ingen. Dataeksport er lovpålagt og bør være på plass ved offentlig lansering, men er ikke en intern-testing-blokker.*

---

## 7. Etter lansering (3 mnd) — strategisk

- **`weekly-hive-alerts` skalering** (A12 HØY) — paginer per brukerbatch eller flytt utvelgelse til SQL-RPC. Degraderer først ved 5–10k brukere; ufarlig ved <1k. Gjøres sammen med `last_seen_at`-kolonne for win-back.
- **Win-back + år-for-år-progresjon** (A10) — `last_seen_at` + reaktiverings-gren ved 30/60 dager; fjorårslinje i SeasonSummaryCard + milepæl-kort. Kjernedriver for langtidsretention, men krever data fra én sesong for å være meningsfull.
- **Offline-persistering + NetInfo** (A7 HØY) — `persistQueryClient` + onlineManager + offline-banner. Reell verdi i felt, men betal-app fungerer uten det ved lansering.
- **Domeneutvidelser** (A4) — strukturert behandlingslogg (virkestoff-enum + tilbakeholdelse), eksponer `diseaseObservations` i wizard, steinyngel/trakemidd, maursyre i høst-anbefaling, sværm→sverm-stavefiks. Hever faglig troverdighet; ikke lanseringskritisk.
- **Ytelse/hygiene** (A5/A6/A12) — splitt `hjem/index.tsx`, `lib/storageUpload.ts` + `lib/date.ts`-konsolidering, harden de 3 uvaliderte mapperne, hive-photo signer-ved-lesing (3-agent K1), `select('*')`→kolonnelister, CHECK-constraints, SELECT-policy `(SELECT auth.uid())`-wrap, processed_events-TTL. Alt lav reell risiko ved <100 brukere.
- **expo-image** (A6) — disk-cache + downsampling for kubelister. Marginalt ved få kuber.
- **lucide-react-native + Typography/Radii-migrering** (A2) — størst opplevd profesjonalitetsløft, men L-innsats. Bevisst utsatt.
- **HoneyWidget montering + dato-seedet tipskort + auto-neste-inspeksjon** (A10) — billige retention-løft fra eksisterende data/kode.
- **AppState token-refresh + lokal ErrorBoundary + betinget retry/norsk feiloversettelse** (A7) — robusthet; gjøres opportunistisk.

---

## 8. Ikke gjør (nå) — med begrunnelse

- **Typography-/Radii-full-migrering (A2, L)** — prematur polering; flytter ikke konvertering. Gjør kun salgsflate-fontFamily.
- **Aktivere feed-fanen (A1 sovende, mot A10)** — tomt sosialt rom ved <100 brukere skader mer enn det gagner. Hold `href:null`.
- **lucide-react-native ikonsett nå (A2)** — M-innsats, ren kosmetikk; etter lansering.
- **Offline-persistering før lansering (A7)** — verdifullt men ikke intern-testing-blokker; appen krasjer ikke uten det.
- **`select('*')`-slanking utover `fetchHives` (A5/A6/A12)** — neglisjerbar gevinst ved <100 brukere; risiko for å bryte mapX ved hastverk.
- **`weekly-hive-alerts`-paginering nå (A12)** — degraderer først ved 5–10k brukere. Ikke en lanseringsblokker for første sesong.
- **Strukturert behandlingslogg / wizard-domeneutvidelser nå (A4 MEDIUM)** — verdifullt men M+M; ikke blokker. Apistan-fjerning og meldeplikt er det eneste lov-/faglig-kritiske, og bare Apistan er S.
- **Splitte `hjem/index.tsx` nå (A5 HØY)** — testbarhetsgjeld, ikke brukerrisiko. Refaktorering rett før lansering introduserer regresjonsrisiko. Etterpå.
- **iOS RevenueCat-arbeid** — utenfor scope (Android-only lansering per CLAUDE.md).

---

## 9. Go / No-go

**GO for intern/lukket testing i nåværende tilstand. Betinget GO for åpen testing/produksjon.**

Det finnes **ingen åpne KRITISK-funn i kode** (verifisert: forrige rundes 5 ship-blokkere er alle lukket i 0046–0051 + Sprint 1). Appen kan publiseres til lukket testing i dag.

For **åpen testing / produksjon** gjenstår følgende — alle små:

**Kode-blokkere (KRITISK-likeverdige for betaling/lov), samlet ~1 dag:**
1. RevenueCat tom-nøkkel-kast (S) — uten dette får betalende brukere stille feil tier. *(½ t)*
2. Drop utdatert 0013-policy (S) — uten dette avvises trial-brukere på kube #4 tross «ubegrenset»-løfte. *(½ t + test)*
3. Fjern Apistan (S) — legemiddel-/lovrisiko (anbefaler ikke-godkjent middel). *(¼ t)*

**Manuelle dashboard-blokkere (per `docs/lansering-sjekkliste.md`, ikke kode), ~1 dag:**
4. Last opp v21-AAB til Play (v20 har brutt bildevalg).
5. Data safety-URL + datainnsamlingserklæring.
6. Supabase Pro + PITR (single-point-of-truth uten backup i dag).
7. RevenueCat-produkter aktive i Play Console + testkjøp verifisert.

**Sterkt anbefalt før åpen lansering (ikke hard blokker), ~1 dag:**
8. Minimal analytics (uten dette er 100-betalende-målet umålbart).
9. GDPR-dataeksport (art. 20) + `hive_disease_flags` DELETE-policy.

**Samlet innsatsestimat blokkere: ~2 dager kode/SQL + ~1 dag manuelle dashboard-steg = 3 dager til produksjonsklar.** Ingen av blokkerne er arkitektoniske; alt er punktfikser eller dashboard-handlinger.
