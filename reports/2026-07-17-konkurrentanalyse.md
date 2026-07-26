# Konkurrentanalyse — BiVokter vs. 26 birøkterapper

_Utarbeidet 2026-07-17. Mål: gjøre BiVokter til den beste birøkterappen som finnes._

---

## 1. Sammendrag

Markedet for birøkterapper er modent men fragmentert: ingen enkelt app dominerer, og de fleste er single-plattform (spesielt iOS-tunge) eller web/PWA. BiVokter har allerede et sterkt fundament — Android-først, ekte Supabase-backend, Mapbox med bieflukt-sirkler, sesongbasert kalender, sykdomsguide med bilder, og et unikt norsk fellesskapslag (67 birøkterlag + svermerapporter på kart). Dette norske fokuset er vår sterkeste og mest forsvarbare differensiator — ingen internasjonal konkurrent har det.

De tre teknologitrendene som definerer topp-appene i 2026 er: (1) **stemmestyrt hands-free inspeksjonslogging** (Apiary Book, APiLOG, HiveSense, Imkado, Beentry, Queenright), (2) **AI foto-analyse av varroamidd** fra rammebilder (BeeScanning, HiveLog AI, Gratheon), og (3) **on-device / offline-først AI** for personvern og feltbruk uten dekning (HiveSense, HiveBook). BiVokter har ingen av disse ennå.

Sekundære gap: strukturert varroa-behandlingslogg med PHI-varsler (tilbakeholdelsestid), QR/NFC-kubeidentifikasjon, økonomisporing, utstyrsinventar, PDF/CSV-eksport med lovpålagt behandlingsbok, og faktisk UI for kubedeling (som allerede ligger i vår DB). De vanligste klagene mot konkurrentene — gjerrige gratisnivå (1–2 kuber), tvungen innlogging, manglende sync, og overkomplekse grensesnitt — er fallgruver BiVokter kan unngå bevisst. Anbefalt strategi: behold norsk fellesskap som moat, legg til stemmelogging + AI-varroatelling + PHI-varsler som «wow»-funksjoner, og hold gratisnivået sjenerøst (3 kuber er allerede bedre enn de fleste).

---

## 2. Oversiktstabell — alle 26 apper

| App | Plattform | Pris | Rating | Viktigste styrke |
|-----|-----------|------|--------|------------------|
| **Apiary Book (ApiNote)** | Android, iOS, Web | Gratis basis + Pro ~4,99 USD/mnd / 29,99 USD/år | Høyt rangert, 260 000+ nedl. | AI-stemmeassistent + QR-koder, bred alt-i-ett |
| **HiveTracks** | Android, iOS, Web | Gratis ≤5 kuber; ~50 USD/år | Positiv, ingen tallscore | Modent web-dashboard + lokalt birøkter-fellesskap |
| **BeeKeepPal** | Android, iOS, Web | Freemium (1 bigård/2 kuber gratis) | Ingen tallscore | Værbaserte 3-nivå anbefalinger + split/fôr-forslag |
| **ApiManager** | Android, iOS, Mac, Win, Web | Gratis ≤20 kuber; 14,99–64,99 USD/år | Solid Play/AppBrain | Rollebasert flerbruker (Queen/Bee/Drone) + Excel-eksport, 40+ språk (norsk) |
| **BeeScanning** | Android (fjernet aug-25), iOS | Gratis begrenset + abonnement, 2 ukers prøve | 3,0/5 (75 vurd.) | AI varroatelling fra foto, ikke-destruktiv |
| **BeePlus** | iOS | Betalt engangskjøp, ingen abonnement | #1-markedsført, tynn 3.parts | Ingen abonnement/kubegrense + økonomi + utstyrsinventar m/plassering |
| **APiLOG** | Web / PWA (offline) | Gratis ≤2 kuber; ~9,95 USD | Positiv i FB-grupper | Stemme- + video-inspeksjon m/auto-transkribering + AI-assistent |
| **HiveSmartHQ** | Android, iOS | Pay-per-inspection, ~100 gratis, <0,10 USD/kreditt | Ingen bred score | Offline-først, ingen innlogging, inspeksjon-til-salg sporbarhet |
| **HiveSense** | iOS, Android | Gratis ≤15 kuber; 3,99–8,99 USD/mnd | Nylansert (juli-26) | On-device stemme + BLE-sensorer (BroodMinder m.fl.) + PHI-varsler |
| **HiveBloom** | iOS, Android, Web | Gratis ≤2 kuber; 5,99 USD/mnd / 59,99 USD/år | Positiv App Store | Stemme-til-form AI + ekte 3-plattform m/auto sky-sync |
| **HiveFlow** | Android, iOS, Web | Gratis ≤8 kuber + 8 feller; PRO | Ingen tallscore | Svermfelle→koloni-arbeidsflyt + nedlastbare offline GPS-kart |
| **Bee Manager (Servodio)** | Android | Gratis (mulige IAP) | Ikke funnet | Obskur — ingen bekreftede styrker |
| **BeeKeeper Pro** | Android | Gratis (mulige IAP) | Ikke funnet | Værbaserte anbefalinger + detaljert helsesporing |
| **HiveLog AI** | Web/PWA (offline drafts) | Gratis (1 kube, 3 AI/mnd); 3–8 EUR/mnd | Ingen tallscore | AI foto-varroatelling m/% og konfidens <3 sek + dronningcelle-flagg |
| **Apiarist** | iOS (iCloud-sync) | Helt gratis, ingen data | Ingen tallscore | Ubegrenset alt gratis, sterkt personvern, offline |
| **HiveBook** | iOS | Gratis ≤5 kuber; Pro 4,99 USD/mnd; Premium 9,99 USD/mnd | For ny | On-device AI briefing + kvitteringsskanning, local-first + iCloud |
| **Hive Logger** | iOS | Gratis 1 kube; Pro IAP | Ros for rent UI | Smart Voice Logs + Multi-Hive Log (én logg → flere kuber) |
| **The Bee Hive** | iOS 17+ | Gratis, ingen data | Ingen tallscore | QR **og** NFC-skanning + team/oppgavefordeling |
| **Bee2 (bee²)** | iOS | 3 mnd prøve; 2,99 USD/mnd / 24,99 USD/år | Ingen tallscore | Kubekart m/pins + rammelogg + forbruksvarer, BeePlus-import |
| **Beentry** | iOS, Android, Web | 30 dg prøve; gratis + betalt | Brukt i 30+ land | AI-rådgiver på egne data + automatiske sykdomsvarsler ved nærliggende utbrudd |
| **Queenright** | iOS, Android | Gratis ubegr. kuber; Pro IAP | For ny | Ubegrenset kuber gratis + ukentlig auto bigård-analyse |
| **BEEP** | Web + iOS/Android | Gratis (open source) | ~5000+ brukere | Manuell inspeksjon + sensordata forent, åpent API, tilpassbare ark |
| **Hiveeyes / Swarm** | Web + DIY-HW | Gratis (open source) | Community-prosjekt | Åpen DIY-telemetri (Grafana/InfluxDB/MQTT), ikke-invasiv |
| **Gratheon** | Web + mobil + IoT | Freemium; 7–55 EUR/mnd; HW 600–3000 EUR | Ingen tallscore | Full AI-verktøykasse (dronning/celler/varroa/LLM) + Entrance Observer bie-telling |
| **BeeInTouch (Willi)** | iOS, Android, Web | Freemium ~2 kuber; 3–49 EUR/mnd | 22 000+ brukere | QR/NFC per bifolk + honningpris-kalkulator, moden tysk app |
| **Imkado (KIM)** | iOS, Android | Gratis kjerne (ubegr. bifolk, 10 AI/mnd); Plus 8,99 EUR/mnd / 69 EUR/år | **4,8** App Store | KI-stemmeinnmating offline + lovpålagt PDF-behandlingsbok |

---

## 3. Funksjonsgap-analyse — hva konkurrentene har som BiVokter mangler

### 3.1 Stemmestyrt / hands-free inspeksjonslogging (STØRSTE GAP)
Den mest utbredte og mest berømmede differensiatoren i markedet. Lar birøkteren logge mens hendene er opptatt av rammer og røyk.
- **Har det:** Apiary Book (AI-stemmeassistent), APiLOG (stemme + video + auto-transkribering), HiveSense (on-device, offline), HiveBloom (stemme-til-form som fyller skjema), Hive Logger (Smart Voice Logs), Imkado (KI-taleinnmating offline med birøkter-terminologi), Beentry (AI stemme→strukturerte felt), Queenright, The Bee Hive.
- **BiVokter:** ingenting.

### 3.2 AI foto-analyse av varroamidd
Automatiserer den mest tidkrevende og feilutsatte oppgaven — manuell middtelling.
- **Har det:** BeeScanning (AI-telling fra bilder av 3000–6000 bier, ikke-destruktivt + syk yngel-deteksjon), HiveLog AI (telling + % + konfidens <3 sek + dronningcelle-flagg + klimasone-terskler), Gratheon (varroatelling + dronning-deteksjon + celle-deteksjon fra telefonkamera).
- **BiVokter:** har varroa-trendgraf, men all telling er manuell inntasting.

### 3.3 Sensorer / IoT-integrasjon (kubevekt, temp, fuktighet)
- **Har det:** HiveSense (BLE: BroodMinder, BEEP, Govee, SensorPush, Inkbird), BEEP (egen open source-vekt + åpent API), Hiveeyes (DIY-telemetri), Gratheon (ESP32-sensorer + Entrance Observer bie-teller med YOLO 11).
- **BiVokter:** manuell vektlogging finnes, men ingen automatisk sensoravlesning.

### 3.4 Strukturert varroa-behandling + PHI/tilbakeholdelsestid
Kritisk for matsikkerhet og lovpålagt dokumentasjon (honning kan ikke høstes i tilbakeholdelsesperioden).
- **Har det:** HiveSense (PHI-varsler + påminnelser), HiveBook (behandlingsterskler), Queenright (behandlingsgrafer/trender), Imkado (lovpålagt PDF-behandlingsbok, veterinær-kompatibel), BeeInTouch.
- **BiVokter:** har behandlingslogg, men ingen PHI-varsel eller terskel/rotasjonsplan. _(Ekspertkritikk av Apiary Book gjelder også oss: mangler PHI-sporing, terskelvarsler, effektscoring, rotasjonsplan, midd-fokusert dashboard.)_

### 3.5 QR / NFC-kubeidentifikasjon
Skann kuben → hopp rett til historikk. Reduserer feilregistrering i store bigårder.
- **Har det:** Apiary Book, BeePlus, HiveFlow, APiLOG (QR + NFC), HiveBloom, Hive Logger, The Bee Hive (QR + NFC), Bee2, Queenright, BeeInTouch (QR/NFC per bifolk).
- **BiVokter:** ingenting.

### 3.6 Økonomi / salg / inventar
- **Har det:** BeePlus (økonomi + utstyrsinventar m/plasseringssporing), ApiManager (økonomi + Excel/CSV-eksport), Apiarist, HiveBook (utgift/inntekt + AI-kvitteringsskanning + skatterapporter), Bee2 (finans + salg + forbruksvarer), BeeInTouch (honningpris-kalkulator + lager), BeeKeepPal.
- **BiVokter:** ingen økonomimodul. Har høstingslogg, men ikke koblet til salg/pris.

### 3.7 Fellesskap / samarbeid / deling av kuber
- **Har det:** HiveTracks (lokalt birøkter-fellesskap — fremhevet som beste funksjon), ApiManager (rollebasert Queen/Bee/Drone), HiveSense (team ≤20), The Bee Hive (oppgavefordeling), Queenright Pro (deling m/mentor), HiveBloom (read-only deling), Beentry.
- **BiVokter:** `hive_collaborators` finnes **i DB uten UI**. Vårt unike norske lag: 67 birøkterlag + svermerapporter på kart — dette matcher **ingen** konkurrent.

### 3.8 Proaktiv AI-rådgiver / anbefalinger på egne data
- **Har det:** APiLOG (AI-mentor), HiveBloom (mentor-i-lomma), Beentry (AI-rådgiver på reell historikk + vær), Queenright (ukentlig auto-analyse), Gratheon (LLM-assistent), Imkado (AI-rådgiver), HiveBook (daglig AI-briefing), BeeKeepPal (split/fôr-forslag).
- **BiVokter:** har statiske «anbefalinger», men ingen AI/historikk-drevet personalisering.

### 3.9 Svermfelle-/lokkekube-arbeidsflyt
- **Har det:** HiveFlow (felle→koloni med bevart historikk + GPS-pin).
- **BiVokter:** har svermerapporter (samfunn), men ikke felle-forvaltning for egen drift.

### 3.10 Ekte kryssplattform-sync + eksport
- **Har det:** HiveBloom, Beentry, ApiManager, Apiary Book (web + mobil, auto sky-sync). Eksport: ApiManager (Excel/CSV), HiveBook (CSV/PDF/skatt), Imkado (PDF), Apiarist.
- **BiVokter:** Supabase gir sync, men Android-først uten web-app; PDF-rapport per kube finnes (bra!), men ingen CSV-eksport.

### 3.11 Automatiske sykdomsvarsler (geografisk)
- **Har det:** Beentry (varsler når sykdom rapporteres i nærheten).
- **BiVokter:** har sykdomsguide (10 sykdommer) og svermkart — men kobler ikke sykdomsutbrudd geografisk. **Vi har allerede kart-infrastrukturen** til å gjøre dette.

---

## 4. TOPP 15 KOPIERINGSKANDIDATER (prioritert)

Innsats: **Liten** (dager) · **Middels** (1–2 uker) · **Stor** (>2 uker / ekstern avhengighet). Tier-forslag basert på eksisterende: Starter (gratis) · Hobbyist (49) · Profesjonell (149) · Lag (499).

| # | Funksjon | Verdi for norske birøktere | Innsats | Anbefalt tier |
|---|----------|----------------------------|---------|---------------|
| **1** | **Stemmestyrt inspeksjonslogging** (tale→skjema, gjerne on-device) | Størst tidsbesparelse i felt; loggføring med hansker og røyk. Mest berømmede funksjon i markedet. | Stor | Hobbyist+ (basis-versjon), avansert AI i Profesjonell |
| **2** | **PHI / tilbakeholdelsestid-varsel på behandlinger** | Direkte matsikkerhet + lovkrav; hindrer høsting i tilbakeholdelsesperiode. Bygger på eksisterende behandlingslogg. | Liten–Middels | Starter (sikkerhet bør være gratis) |
| **3** | **AI foto-varroatelling** fra rammebilde (%, konfidens, terskelvarsel) | Automatiserer mest feilutsatte oppgave; passer perfekt inn i eksisterende varroa-trendgraf. | Stor | Profesjonell (AI-kostnad) |
| **4** | **QR/NFC-kubeidentifikasjon** | Rask kube-oppslag i store bigårder, mindre feilregistrering. Enkelt oppå eksisterende kube-modell. | Liten–Middels | Hobbyist+ |
| **5** | **UI for kubedeling/samarbeid** (`hive_collaborators` finnes i DB!) | Lag, mentorer, familie deler kuber. Nesten «gratis» — DB er klar. Naturlig for Lag-tier (499). | Middels | Lag (kjernefunksjon) + basis i Profesjonell |
| **6** | **Geografiske sykdoms-/svermvarsler** (utbrudd i nærheten) | Proaktiv beskyttelse; vi har allerede Mapbox + svermerapporter + sykdoms-DB. Unik i norsk kontekst. | Middels | Starter/Hobbyist |
| **7** | **PDF/CSV-eksport av behandlingsbok** (Mattilsyn-kompatibel) | Norske birøktere trenger dokumentasjon; Imkado gjør dette til salgsargument i DE. Bygger på `report.ts`. | Liten–Middels | Hobbyist+ |
| **8** | **Økonomimodul** (utgift/inntekt + honningpris-kalkulator, salg per kube) | Deltidsbirøktere som selger honning; skatteregnskap. Kobler til eksisterende høstingslogg. | Middels | Profesjonell |
| **9** | **Proaktiv «neste steg»-motor på egne data** (uten LLM først) | Regelbasert: varroa-terskel, sesong, siste inspeksjon → konkrete oppgaver. Lav terskel for nybegynnere. | Middels | Hobbyist+ (avansert AI i Profesjonell) |
| **10** | **Multi-hive log** (én logg → flere kuber samtidig) | Stor tidsbesparelse ved lik behandling/fôring av mange kuber. Enkel datamodell-utvidelse. | Liten | Hobbyist+ |
| **11** | **Svermfelle-/lokkekube-forvaltning** m/GPS + konvertering til koloni | Norske birøktere fanger svermer aktivt; bevart historikk felle→kube. Bygger på Mapbox. | Middels | Hobbyist+ |
| **12** | **Utstyrsinventar m/plasseringssporing** (ramme/kasse/utstyr) | Vet hvor hvert utstyr er i bruk; sjeldent hos konkurrenter (kun BeePlus). Kobler til etasje/ramme-modell vi allerede har. | Middels | Profesjonell |
| **13** | **BLE-sensorintegrasjon** (BroodMinder/kubevekt) på eksisterende vekt-tidslinje | Fremtidsrettet; forener manuell + automatisk vekt. Stort løft, men fint for Lag/Profesjonell. | Stor | Profesjonell/Lag |
| **14** | **Utstyr-/oppgave-sjekklister med «hakes av»** (ikke bare slette) | Direkte respons på BeePlus-klage; forhåndsutfylte sesong-sjekklister. Bygger på kalender. | Liten | Starter/Hobbyist |
| **15** | **Web-dashboard** (les-tilgang til data i nettleser) | Seriøse/kommersielle vil ha historikk på stor skjerm; Supabase-backend gjør dette mulig uten ny backend. | Stor | Profesjonell/Lag |

**Rask-vinn-cluster (start her):** #2 PHI-varsel, #4 QR, #5 kubedeling-UI, #7 behandlingsbok-eksport, #10 multi-hive log, #14 sjekklister — alle liten/middels innsats med høy verdi, flere bygger direkte på det som allerede finnes.

**Flaggskip-cluster (differensiator):** #1 stemmelogging, #3 AI-varroatelling, #6 geografiske varsler — dette er «wow»-funksjonene som gjør BiVokter konkurransedyktig med markedslederne.

---

## 5. Hva BiVokter allerede gjør bedre enn konkurrentene

1. **Norsk fellesskapslag — helt unikt.** 67 norske birøkterlag + 8 utstyrsleverandører i katalog + svermerapporter på kart (open/resolved). Ingen internasjonal konkurrent har lokal norsk kontekst. HiveTracks' «fellesskap» fremheves som deres beste funksjon — vi har en rikere, lokalisert versjon.
2. **Bieflukt-sirkler på Mapbox (500m/1km/2km/3km).** Visualiserer beiteområde/foraging radius direkte. De fleste konkurrenter har bare kube-pins; dette er en genuint nyttig visualisering som få matcher.
3. **Detaljert kube-struktur: etasjer (1–8) + rammer per etasje.** Mer granulær fysisk modellering enn de fleste loggapper som bare har «kube».
4. **Sesongbasert sykdomsguide med bilder (10 sykdommer + sesongvis behandling).** Innebygd kunnskap, ikke bare tom logg — senker terskelen for nybegynnere. Mange konkurrenter mangler kunnskapsinnhold helt.
5. **Ekte skybackend fra dag én (Supabase, eu-west-1).** Auto-sync uten «manuell tungvint prosess» — den vanligste klagen mot BeePlus, Apiarist og andre local-first/iOS-apper. EU-hosting er også GDPR-vennlig for norske brukere.
6. **Android-først.** Flere av de beste appene (BeePlus, HiveBook, Hive Logger, The Bee Hive, Apiarist, Bee2, Imkado tidlig) er iOS-only eller iOS-modne. BiVokter møter Android-flertallet i Norge direkte.
7. **Sjenerøst gratisnivå (3 kuber).** Bedre enn BeeKeepPal (2), APiLOG (2), HiveBloom (2), Hive Logger (1), HiveLog AI (1), BeeInTouch (~2). Mindre enn HiveSense (15)/HiveTracks (5), men langt over median.
8. **Innebygd Yr.no-værintegrasjon per bigård (TTL 1t).** Norsk værkilde, ikke generisk — mer presis for norske forhold enn internasjonale apper.
9. **PDF-rapport per kube allerede på plass.** Med korrekt HTML-escaping (`esc()`). Flere konkurrenter låser rapporter bak Pro.
10. **GDPR slett-konto-funksjon.** Ryddig personvern, viktig for EU/norske brukere og Play-krav.

---

## 6. Fallgruver — det brukere klager mest på hos konkurrentene

_(Så BiVokter unngår dem bevisst.)_

1. **For gjerrige gratisnivå.** Gjentatt klage mot BeeKeepPal (2 kuber), APiLOG (2), HiveBloom (2), Hive Logger (1 kube/1 bigård), HiveLog AI (1 kube, 3 AI/mnd). → **BiVokter: behold minst 3 kuber gratis; vurder å heve.** Ikke lås grunnleggende logging.

2. **Tvungen konto/innlogging bare for å logge én inspeksjon.** Eksplisitt klage mot HiveTracks («konto + e-postverifisering + passord bare for å logge en inspeksjon»). HiveSmartHQ og Apiarist vinner ros for det motsatte. → **Gjør onboarding-friksjonen minimal; vurder lokal-modus/gjestemodus for førstegangsbruk.**

3. **Manglende/tungvint sync mellom enheter.** Stor klage mot BeePlus («ingen auto iCloud-backup, fikk ikke synkronisert iPad↔iPhone») og Apiarist (iCloud-bundet). → **BiVokter har allerede Supabase-sync — markedsfør dette tydelig som en fordel.**

4. **Overkomplekst grensesnitt / for mange funksjoner man betaler for men ikke bruker.** Klage mot ApiManager («overveldende»), HiveTracks («funksjoner for store operasjoner hobbyfolk aldri bruker»), HiveSmartHQ («minst 3 måter å logge på»). → **Hold UI enkelt; progressiv avsløring — skjul avanserte funksjoner til de trengs. Ikke tving hobbybrukere gjennom kommersiell kompleksitet.**

5. **Beste funksjoner låst bak dyreste tier / betaling for å opprette records i det hele tatt.** Klage mot HiveBook (AI bak 9,99 USD/mnd Premium), Bee2 (abonnement kreves for å lage **nye** registreringer etter prøve), mange «Pro låser alt». → **Hold kjerne-logging alltid gratis; lås kun genuint avanserte/kostbare funksjoner (AI, sensorer, team). Aldri betalingsmur på å lagre en inspeksjon.**

6. **Uklar/forvirrende prising.** Klage mot Beentry (pris «lite synlig»), HiveSense (varierer mellom kilder), HiveFlow (PRO-pris ikke spesifisert). → **BiVokter: vis tydelig 49/149/499 kr med hva hver tier gir.**

7. **Pay-per-inspection / kredittmodell skremmer.** Klage mot HiveSmartHQ («månedlig kredittkonto skremmer, hvorfor betaler få-kube-eiere like mye»). → **BiVokter: unngå kredittmodell; forutsigbart abonnement er tryggere.**

8. **Navneforvirring / rebranding.** Hive Logger («byttet navn flere ganger»), BeeKeeper Pro (kolliderer med bedrifts-«Beekeeper»). → **BiVokter: hold merkenavnet stabilt.**

9. **To-do som bare kan slettes, ikke hakes av; ingen forhåndsutfylt sjekkliste.** Konkret BeePlus-klage. → **BiVokter: implementer «fullfør»-status + sesong-sjekklister (kandidat #14).**

10. **AI som kun fanger ~80 % / ikke nøyaktig nok for terskelbeslutninger.** Klage mot BeeScanning (fanger ~80 % av synlige midd, ikke kalibrert for 1 %-vinterterskel; krever fotografering av 3000–6000 bier). → **Hvis vi bygger AI-varroatelling: vær ærlig om usikkerhet, oppgi konfidens (som HiveLog AI), og la manuell telling supplere — ikke oversell nøyaktighet.**

11. **Personvern-bekymringer ved tredjeparts-datadeling.** Klage mot HiveBloom (deler app-aktivitet/enhets-ID med tredjeparter per Play datasikkerhet). → **BiVokter: minimer tredjepartsdeling, vær transparent i Play datasikkerhet — vår GDPR-fokus er et konkurransefortrinn.**

12. **Web/PWA-only avskrekker native-brukere; iOS-only utelukker Android.** Klage mot APiLOG, HiveLog AI (PWA) og alle iOS-only. → **BiVokter er allerede native Android — hold ytelsen god (Skia/Reanimated), og prioriter web-dashboard som *supplement*, ikke erstatning.**

---

_Konklusjon: BiVokter har et forsvarbart norsk moat (fellesskap + Yr.no + Android-først + ekte backend) som ingen konkurrent kan kopiere raskt. Legg til stemmelogging, PHI-varsler og AI-varroatelling for å matche markedslederne på funksjon, hold gratisnivået sjenerøst og UI enkelt for å unngå de vanligste klagene — så er veien til «beste birøkterapp» kort._
