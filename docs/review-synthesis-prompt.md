# BiVokter — Gjennomgang av multi-agent-review

Kjør ETTER at alle 12 agenter og syntese-agenten har fullført og skrevet sine rapporter.  
Dette er et **meta-review**: evaluer kvaliteten på analysene, valider sentrale påstander mot faktisk kode, og produser en korrigert handlingsplan.

---

## KONTEKST

```
BiVokter er en norsk birøkterapp.
Stack: React Native 0.83 · Expo SDK 55 (New Architecture) · expo-router v3 ·
Supabase (PostgreSQL + Storage + Edge Functions) · React Query · Zustand ·
Sentry · Mapbox · RevenueCat (Android IAP) · Skia + Reanimated · Zod

Prosjektrot: C:\Users\andre\claudecode\Prosjekter\Bier\biapp
Én til to utviklere. Pre-lansering. Mål: 100 betalende brukere.
Migrasjoner: 0001–0039 kjørt i produksjon. versionCode: 14.

IKKE les: revenuecat-key.json, google-play-service-account.json, graphify-out/, .claude/
```

---

## INNDATA (les alle disse filene)

```
reports/agent-01-navigasjon.md
reports/agent-02-design.md
reports/agent-03-konvertering.md
reports/agent-04-domene.md
reports/agent-05-arkitektur.md
reports/agent-06-ytelse.md
reports/agent-07-robusthet.md
reports/agent-08-sikkerhet.md
reports/agent-09-tilgjengelighet.md
reports/agent-10-retention.md
reports/agent-11-onboarding.md
reports/agent-12-database.md
reports/syntese-handlingsplan.md
```

Hvis en rapport mangler: noter det i Metainfo og fortsett uten den.

**Output-fil:** `reports/syntese-gjennomgang.md`

---

## FASE 1 — Validering av sentrale påstander

Velg de **10 mest alvorlige funnene** på tvers av alle rapporter (KRITISK og HØY). For hvert funn:

1. Les den angitte `fil:linje` direkte med `Read`-verktøyet
2. Bekreft at koden faktisk er slik rapporten beskriver
3. Merk funnet som: ✅ BEKREFTET / ⚠️ DELVIS / ❌ FEIL

Dokumenter avvik: Hvis et funn er feil (koden er allerede fikset, problemet gjelder en annen fil, eller beskrivelsen er unøyaktig), noter den faktiske tilstanden.

**Tillegg — sjekk disse fire punktene uavhengig av agentenes funn:**

A. Kjør `Grep -r "console\.log\|console\.error\|console\.warn" app/ services/ --include="*.ts" --include="*.tsx"` — Er det debug-logging som bør fjernes?

B. Kjør `Grep -r "TODO\|FIXME\|HACK" --include="*.ts" --include="*.tsx"` — List alle med fil:linje.

C. Les `services/subscription.ts` linje 1–50: Er RevenueCat-initialisering riktig guard-et mot Expo Go?

D. Sjekk `supabase/migrations/0039_rls_subselect_auth_uid.sql`: Er auth.uid()-subselect-mønsteret konsistent med det alle relevante migrasjoner bruker?

---

## FASE 2 — Agentenes analysekvalitet

Ranger hver av de 12 agentene på en skala 1–5 etter disse tre kriteriene:

| Kriterium | Vekt |
|-----------|------|
| **Dekning** — Dekket agenten alle problemene i sitt scope? | 40% |
| **Sitering** — Hadde funn konkrete fil:linje-referanser? | 40% |
| **Nytteverdi** — Er anbefalingene handlingsbare for én utvikler? | 20% |

**Format for hvert funn:**
```
Agent N (navn): X/5
- Sterkeste funn: [konkret eksempel]
- Svakeste punkt: [hva ble oversett eller var for vagt]
```

Identifiser de **to agentene med lavest score** og list de konkrete problemene de ikke fanget, basert på hva du har lest direkte i kodebasen.

---

## FASE 3 — Gap-analyse

Hva fanget **ingen** av de 12 agentene?

Utfør disse søkene og rapporter funn:

1. `Grep -r "\.catch\(\s*\)" --include="*.ts" --include="*.tsx"` — Tomme catch-blokker
2. `Grep -r "Math\.random\(\)" --include="*.ts" --include="*.tsx"` — Usikker tilfeldighet
3. `Grep -r "async.*useEffect" --include="*.tsx"` — Async i useEffect uten cleanup
4. `Grep -r "\.env\." --include="*.ts" --include="*.tsx"` — Direkte env-lesing utenfor konfig
5. Les `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx` linje 1–50 og sjekk: Er det noen form for auto-save/draft-lagring ved avbrudd?
6. `Glob supabase/migrations/*.sql` — Teller faktisk antall migrasjoner og noter om det er gap i nummerering

Dokumenter konkrete funn med fil:linje. Marker som "Ingen funn" hvis søket returnerer tomt.

---

## FASE 4 — Konflikthåndtering

Finn steder der to eller flere agenter gir motstridende anbefalinger. For hvert konfliktpar:

1. Beskriv konflikten konkret (hvilke agenter, hvilket tema)
2. Les den relevante koden direkte
3. Gi en begrunnert avgjørelse: hvilken anbefaling er riktig og hvorfor

**Eksempler på typiske konflikter å se etter:**
- Agent 5 (arkitektur) foreslår refaktorering av en komponent som Agent 6 (ytelse) sier er godt optimalisert
- Agent 3 (konvertering) foreslår å vise premium-innhold som teaser — Agent 8 (sikkerhet) advarer mot RLS-svakheter i samme data
- Agent 10 (retention) foreslår mer push-varsler — Agent 11 (onboarding) sier varsler bør opt-in etter verdimoment

---

## FASE 5 — Korrigert handlingsplan

Basert på fase 1–4 (bekreftet kode, agentenes kvalitet, gap-analyse og konfliktløsning): skriv en korrigert versjon av prioriteringslisten fra `reports/syntese-handlingsplan.md`.

### 5A — Fjern ugyldige funn
List funn fra agentene som var **feil eller utdaterte** (allerede fikset i kodebasen, feil fil, eller basert på misforståelse). Disse skal ikke implementeres.

### 5B — Legg til funn fra gap-analysen
Funn fra Fase 3 som ingen agent rapporterte — ranger etter alvorlighetsgrad.

### 5C — Endelig prioriteringsliste

**Denne uken (< 4 timer totalt — kritiske fikser):**
Maks 5 tiltak. For hvert: hva, hvilken fil, estimert tid, og om noen agent bekreftet det.

**Sprint 1 — neste 2 uker (konvertering og kvalitet):**
Maks 8 tiltak. Ranger etter: Konverteringseffekt × (1 / Implementeringskostnad).

**Roadmap — 3 måneder (strategisk):**
Maks 5 tiltak. Kun om de ikke kan begynnes nå.

**Utsett disse:**
Tiltak fra agentene som er for kostbare, for risikable, eller ikke relevante for 100-bruker-stadiet.

---

## OUTPUT-FORMAT

```markdown
# Syntese-gjennomgang — BiVokter multi-agent review

## Metainfo
- Rapporter lest: [liste]
- Rapporter ikke funnet: [liste eller "ingen"]
- Valideringsdato: [dato]

## Fase 1 — Validering av topp-10 funn
[For hvert funn: agent, original påstand, fil:linje lest, status ✅/⚠️/❌, kommentar]

### Uavhengige sjekk
[Resultat av A–D-sjekkene]

## Fase 2 — Agentenes analysekvalitet
[Tabell: Agent | Score | Sterkeste funn | Svakeste punkt]

### De to svakeste agentene
[Hva de konkret gikk glipp av]

## Fase 3 — Gap-analyse
[Funn ingen agent rapporterte, med fil:linje-bevis]

## Fase 4 — Konflikthåndtering
[Konfliktpar med begrunnede avgjørelser]

## Fase 5 — Korrigert handlingsplan

### 5A — Ugyldige funn (ikke implementer disse)
[Liste]

### 5B — Nye funn fra gap-analysen
[Liste med alvorlighetsgrad]

### 5C — Endelig prioriteringsliste
#### Denne uken
#### Sprint 1
#### Roadmap
#### Utsett

## Konklusjon
[Én setning: appens faktiske tilstand etter validert analyse]
```

---

*Versjon: v1 | Oppdatert: 2026-05-27 | Kjøres etter review-prompt-v2.md*
