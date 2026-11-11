# BiVokter — Claude-kontekst

## Stack
RN 0.83 · Expo SDK 55 (New Arch alltid på) · expo-router v3 · Supabase (eu-west-1) · React Query · Zustand (kun auth) · Zod · Sentry · Mapbox · RevenueCat (Android) · Skia + Reanimated

## Kritiske gotchas
- `as any` på alle dynamiske Expo Router-ruter
- Skia-animasjoner: ALLTID Reanimated SharedValue — aldri setState/rAF
- `swarm_reports.status`: `'open'` | `'resolved'` (IKKE 'active')
- `uploadHivePhoto`: bruker `FileSystem.uploadAsync` (native binary upload — ikke atob/Uint8Array)
- RevenueCat: guard med `Constants.appOwnership === 'expo'` — krasjer i Expo Go
- iOS RevenueCat: returnerer mock starter-tier (ikke konfigurert ennå)
- `mapX()` kaster ved manglende required fields — nullable felt: `typeof row.x === 'string' ? row.x : null`
- Mutations: alltid `onError: (e: Error) => showToast(e.message, 'error')`
- `react-native-svg`: importer `Text as SvgText` for å unngå konflikt med RN Text
- `fetchAllInspections(sinceYears)`/`fetchHarvests(sinceYears)` har valgfri parameter — bruk alltid arrow i `queryFn` (`() => fetchHarvests()`), aldri bar referanse

## Faner (5 aktive)
`hjem` · `kuber` (Stack) · `kalender` · `laer` · `samfunn`

## Nøkkelfiler
| Fil | Ansvar |
|-----|--------|
| `app/(app)/_layout.tsx` | Auth-guard, push-tillatelse, registerPushToken |
| `app/(app)/(tabs)/hjem/index.tsx` | Dashboard — bruker `fetchLastInspectionPerHive` (ikke fetchAllInspections) for UI |
| `app/(app)/(tabs)/kuber/[id]/index.tsx` | Kubeprofil: Helse, Anbefalinger, VarroaTrend, Dronning, Høsting, Behandling, Vekt |
| `services/inspection.ts` | `fetchLastInspectionPerHive()` → Record<hiveId, Inspection> (rask, minimal payload) |
| `services/report.ts` | PDF-generering med `esc()` HTML-escaping (fra `utils/escapeHtml.ts`) |
| `services/subscription.ts` | RevenueCat-integrasjon (DB-tier eies av webhooken — ingen klient-sync) |
| `hooks/useHarvestMutations.ts` | Delte høst-mutasjoner med sentral `['harvests']`-invalidering |
| `supabase/functions/revenuecat-webhook/` | Edge Function: syncer tier ved kansellering/utløp |
| `constants/colors.ts` | Colors · Shadows · Radii · SeasonColors — bruk alltid disse fremfor inline verdier |

## Services
`hive` · `inspection` · `swarmReport` · `calendarEvent` · `notifications` · `weather` (Yr.no, TTL 1t) · `profile` · `treatment` · `weight` · `harvest` · `queen` · `report` · `subscription` · `collaboration` (DB-only, ingen UI)

## DB-migrasjoner (0001–0056 kjørt i prod)
Kubegrense håndheves av `enforce_starter_hive_limit`-trigger (0046, race-fikset med advisory-lås i 0056) — IKKE policy. Tier-kolonner er låst for klient-UPDATE (0047). RLS-policies bruker `(SELECT auth.uid())` og kvalifiserte korrelasjoner (0039/0055). Private buckets: hive-photos + inspection-media. Merk: prod har også tabeller utenfor migrasjonshistorikken (teams, municipalities, app_config) — pg_policies i prod er fasit, ikke filene alene.

## Bygg
```
npx eas build --profile preview --platform android --non-interactive
```
EAS project: `@boklet23/biapp` · Android: `no.biapp.app` · Supabase: `zujvhbnuqocquthbujmp`

## Abonnementer
starter (gratis, 3 kuber) · hobbyist 49kr · profesjonell 149kr · lag 499kr
