# Fase 2 — Mine Kuber

**Status:** Implementert
**Periode:** Mai–Juli 2026
**Milepæl:** M2 — Komplett kubehåndtering med CRUD og 4-stegs inspeksjonslogg

---

## Oversikt

Fase 2 implementerer kjernen i MVP: kubehåndtering med full CRUD og en 4-stegs inspeksjonslogg. All serverstate håndteres av TanStack Query — ingen egen Zustand-store for kuber.

---

## Skjermer

### Kubeoversikt — `app/(app)/(tabs)/kuber/index.tsx`

Liste over alle aktive kuber for innlogget bruker.

- `useQuery(['hives'], fetchHives)` — henter kuber via RLS (kun egne)
- `FlatList` med `HiveCard` per kube
- `HiveWithInspection`-komponent gjør én ekstra query per kube for siste inspeksjon
- Pull-to-refresh
- Long-press (600ms) viser bekreftelsesdialog for sletting
- Tom-tilstand med emoji og tekst
- FAB (Floating Action Button) navigerer til `/kuber/ny`

### Legg til kube — `app/(app)/(tabs)/kuber/ny.tsx`

Modal-skjerm for å opprette ny kube.

**Felt:**
- Navn (påkrevd, min 1 tegn)
- Kubetype: velger med `HiveTypeChip` (Langstroth / Warré / Toppstang / Annet)
- Sted (valgfritt)
- Notater (valgfritt, multiline)

- Validering: inline feilmelding på navn
- `useMutation(createHive)` → redirect til `kuber/[id]` på suksess
- Serverfeil vises som rød banner øverst

### Kubeprofil — `app/(app)/(tabs)/kuber/[id]/index.tsx`

Detaljvisning for én kube.

- Henter kube og inspeksjoner parallelt (to queries)
- Header-tittel settes dynamisk via `useLayoutEffect`
- "Rediger"-knapp i header
- Siste inspeksjon: kompakt sammendrag med rammer-statistikk og humøremoji
- Inspeksjonshistorikk: liste med dato og "dager siden"
- Notater-seksjon (vises kun hvis satt)
- FAB: "+ Inspeksjon" → `/kuber/[id]/inspeksjon/ny`

### Rediger kube — `app/(app)/(tabs)/kuber/[id]/rediger.tsx`

Modal-skjerm, identisk struktur som `ny.tsx` men pre-fylt med eksisterende verdier.

- Henter kube via `useQuery(['hive', id])`
- `useEffect` synkroniserer state ved lasting
- `useMutation(updateHive)` → `router.back()` på suksess
- Invaliderer `['hive', id]` og `['hives']`

### 4-stegs inspeksjonsskjema — `app/(app)/(tabs)/kuber/[id]/inspeksjon/ny.tsx`

Wizard med lokal state — lagres kun til Supabase ved fullføring.

**Steg 1 — Grunninfo**
- Dato/tid (tekstfelt, format ÅÅÅÅ-MM-DDTHH:MM, forhåndsutfylt med nå)
- Temperatur (numerisk)
- Vær (tekst, f.eks. "sol", "overskyet")

**Steg 2 — Kubestatus**
- `FrameCounter` for yngelrammer, honningrammer, tomme rammer
- Toggle: Dronning sett / Dronningceller funnet

**Steg 3 — Helse**
- Varroa-telling (numerisk)
- Metode-chips: vaskemetode / sukkerpuder / limbunn
- Toggle: Behandling utført
- Produktfelt (vises kun når behandling = true)

**Steg 4 — Notater og humør**
- Fritekst-notater (multiline)
- Humørscore 1–5 med emoji-skala (😟 😐 😊 😁 🤩)

**Navigasjon:**
- `StepIndicator` øverst
- "Avbryt"-knapp på steg 1 (bekreftelsesdialog)
- "← Tilbake" på steg 2–4
- "Neste →" / "Lagre inspeksjon" (siste steg)
- Redirect til `kuber/[id]/inspeksjon/[inspId]` etter lagring

### Vis inspeksjon — `app/(app)/(tabs)/kuber/[id]/inspeksjon/[inspId].tsx`

Lesevisning for én inspeksjon.

- 4 seksjoner: Grunninfo, Kubestatus, Helse, Notater
- Humørbanner øverst (emoji + tekst) hvis satt
- `Row`/`BoolRow`/`Section`-hjelpkomponenter for konsekvent visning
- Tomt felt vises ikke (null-sjekk)

---

## Dataflyt

```
TanStack Query (client-side cache)
    ├── ['hives']              → fetchHives()
    ├── ['hive', id]           → fetchHive(id)
    ├── ['inspections', id]    → fetchInspections(hiveId)
    └── ['inspection', inspId] → fetchInspection(id)

Mutations invaliderer relevante queries automatisk
```

---

## Services

### `services/hive.ts`
| Funksjon | Handling |
|----------|---------|
| `fetchHives()` | SELECT aktive kuber (RLS: kun egne) |
| `fetchHive(id)` | SELECT én kube |
| `createHive(data)` | INSERT |
| `updateHive(id, data)` | UPDATE (patch-basert) |
| `deleteHive(id)` | Soft delete: `is_active = false` |

### `services/inspection.ts`
| Funksjon | Handling |
|----------|---------|
| `fetchInspections(hiveId)` | SELECT alle for kube, sorter desc |
| `fetchInspection(id)` | SELECT én inspeksjon |
| `createInspection(data)` | INSERT |

---

## Komponenter

### `components/hive/HiveCard.tsx`
Props: `hive: Hive`, `lastInspection?: Inspection`, `onPress: () => void`
Viser: navn, `HiveTypeChip`, sted (valgfritt), "Sist inspisert X dager siden" / rammer-oppsummering

### `components/hive/HiveTypeChip.tsx`
Props: `type: HiveType`
Farger: Langstroth=amber, Warré=grønn, Toppstang=blå, Annet=grå

### `components/inspection/StepIndicator.tsx`
Props: `current: number`, `total: number`, `labels?: string[]`
Viser fylte/tomme sirkler med strek mellom. Fullførte steg viser grønn ✓.

### `components/inspection/FrameCounter.tsx`
Props: `label: string`, `value: number`, `onChange: (n: number) => void`, `min?: number`, `max?: number`
+/− knapper med disabled-state ved grenser.

---

## Stack-layout — `app/(app)/(tabs)/kuber/_layout.tsx`

```
kuber/
  index          → headerShown: false
  ny             → modal, title: "Ny kube"
  [id]/index     → title: "" (settes dynamisk)
  [id]/rediger   → modal, title: "Rediger kube"
  [id]/inspeksjon/ny        → title: "Ny inspeksjon"
  [id]/inspeksjon/[inspId]  → title: "Inspeksjon"
```

---

## Verifikasjon

1. Opprett kube → vises i liste
2. Trykk på kube → kubeprofil vises med korrekt navn i header
3. Rediger kube → endringer lagres og vises umiddelbart
4. Start inspeksjon → gå gjennom alle 4 steg → lagre → redirect til inspeksjonsdetalj
5. Inspeksjonen vises i historikk på kubeprofilen
6. Long-press kube → slett → forsvinner fra liste
7. Pull-to-refresh oppdaterer data

---

*Sist oppdatert: 2026-03-28*
