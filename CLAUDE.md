# BiApp — Prosjektkontekst for Claude

## Stack
- **React Native 0.83** + **Expo SDK 55** — New Architecture er ALLTID på (kan ikke deaktiveres)
- **expo-router** v3 (fil-basert routing)
- **Supabase** (Postgres + RLS + Auth) — region eu-west-1
- **Mapbox** (`@rnmapbox/maps`) — token fra `EXPO_PUBLIC_MAPBOX_TOKEN`
- **React Query** (`@tanstack/react-query`) — all server-state
- **Zustand** — kun auth-store (`store/auth.ts`)
- **Zod** — skjema-validering ved systemgrenser
- **Sentry** — feilrapportering, DSN fra `EXPO_PUBLIC_SENTRY_DSN`

## Fil- og mappestruktur

```
app/
  _layout.tsx               Root layout: Sentry-init, QueryClient, auth-lytter, push-listener
  (auth)/                   Login + registrering (ikke-innlogget)
  (app)/
    _layout.tsx             Auth-guard, notification-tillatelse, registerPushToken
    (tabs)/
      hjem/index.tsx        Dashboard: Yr.no-vær, kubescroll
      kuber/                Mine kuber (Stack-navigator)
        index.tsx           Kubeoversikt med FAB
        ny.tsx              Opprett kube
        [id]/
          index.tsx         Kubeprofil + Mapbox-kart + inspeksjonshistorikk
          rediger.tsx       Rediger kube
          inspeksjon/
            ny.tsx          4-stegs inspeksjonswizard (DateTimePicker for dato)
            [inspId].tsx    Vis enkeltinspeksjon
      kalender/index.tsx    Kalender: MonthView + SeasonGuide + kalender-hendelser
      laer/                 Lær-fane: begynnerguide + sykdomsguide
      samfunn/              Samfunn: birøkterlag-søk + svirm-rapportkart

services/
  hive.ts                   CRUD mot Supabase `hives`
  inspection.ts             CRUD mot Supabase `inspections` (fetchAllInspections: 1 år + LIMIT 500)
  swarmReport.ts            CRUD mot Supabase `swarm_reports` (status: 'open'|'resolved')
  calendarEvent.ts          CRUD mot Supabase `calendar_events`
  notifications.ts          Lokal scheduling + registerPushToken
  weather.ts                Yr.no API (cache maks 100 entries, TTL 1t)
  profile.ts                fetchProfile + updateProfile

store/
  auth.ts                   session, supabaseUser, profile, signOut (kaster ved feil)
  toast.ts                  global toast-state

components/
  ui/                       Button, Input, Screen, Toast, InfoSheet
  hive/                     HiveCard, HiveTypeChip
  inspection/               StepIndicator, FrameCounter
  calendar/                 MonthView, SeasonGuide, AddEventModal
  home/                     WeatherCard, HiveStatusCard
  samfunn/                  SwarmMap, ReportSwarmModal, AssociationCard
  disease/                  DiseaseCard, SeverityBadge, PhotoStrip

constants/
  colors.ts                 Fargepalett (Colors.honey, .dark, .mid, .white, .error, .success)
  diseases.ts               Sykdomsguide-innhold (10 sykdommer, 2 meldepliktige)
  beginnerGuide.ts          8-modul begynnerguide
  seasonGuide.ts            Sesongguide jan–des
  beeAssociations.ts        Norske birøkterlag (statisk database)

supabase/
  migrations/
    0001_initial_schema.sql   Komplett schema
    0002_calendar_events_and_swarm_contact.sql  calendar_events + contact_info + push_token

types/index.ts              Alle TypeScript-typer (Hive, Inspection, User, CalendarEvent, etc.)
```

## Viktige patterns

### Service-funksjoner
Alle services returnerer domeneobjekter via en `mapX()`-funksjon. Mapper-funksjoner **validerer** required fields med `typeof`-sjekker og kaster ved manglende data:
```typescript
function mapHive(row: Record<string, unknown>): Hive {
  if (typeof row.id !== 'string') throw new Error('Ugyldig hive: mangler id');
  // nullable felt bruker: typeof row.x === 'string' ? row.x : null
}
```

### Feilhåndtering
- Mutations bruker alltid `onError: (error: Error) => showToast(error.message, 'error')`
- GPS-operasjoner har alltid try/catch + toast ved feil
- `signOut` kaster ved feil (ikke svelg)

### Supabase-statuser
- `swarm_reports.status`: `'open'` | `'resolved'` (IKKE 'active')
- RLS er aktivert på alle tabeller

### Navigasjon
- Expo Router typed routes er på — bruk `as any` for dynamiske ruter som parametriserte paths
- Deep linking: notification tap → `router.push('/(app)/(tabs)/kalender' as any)`

### Mapbox
- Token settes én gang øverst i filen: `Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '')`
- Statisk kart i kubeprofil: `scrollEnabled={false} zoomEnabled={false}`
- Interaktivt kart i SwarmMap: full zoom/pan

## Miljøvariabler
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_MAPBOX_TOKEN
EXPO_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN         (kun EAS-bygg, ikke expose i kode)
MAPBOX_SECRET_TOKEN       (kun EAS-bygg for npm-autentisering)
```

## EAS Build
- **Android preview**: `npx eas build --profile preview --platform android --non-interactive`
- **Sentry**: `SENTRY_DISABLE_AUTO_UPLOAD=true` er satt som EAS preview-env (kildekart lastes ikke opp)
- Reanimated 4.x + `react-native-worklets` er konfigurert — Babel plugin: `react-native-worklets/plugin`

## Supabase-tabeller (kortversjon)
| Tabell | Nøkkelfelt |
|--------|-----------|
| profiles | id, email, display_name, experience_level, subscription_tier, push_token |
| hives | id, user_id, name, type, location_lat, location_lng, location_name, is_active |
| inspections | id, hive_id, user_id, inspected_at, queen_seen, varroa_count, mood_score, ... |
| calendar_events | id, user_id, title, event_date, notes, notification_id |
| swarm_reports | id, user_id, lat, lng, status('open'/'resolved'), description, contact_info |
| beekeeper_associations | id, name, region, website |

## Åpne oppgaver (neste sesjon)
1. Kjør `0002`-migrasjon i Supabase SQL Editor
2. Ny EAS Android-bygg med alle fixes
3. Neste funksjon etter push: Brukerprofil-redigering (municipalityId, displayName)
