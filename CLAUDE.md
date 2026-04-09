# BiVokter — Claude-kontekst

## Stack
RN 0.83 · Expo SDK 55 (New Arch alltid på) · expo-router v3 · Supabase (eu-west-1) · React Query · Zustand (kun auth) · Zod · Sentry · Mapbox · RevenueCat (Android) · Skia + Reanimated

## Kritiske gotchas
- `as any` på alle dynamiske Expo Router-ruter
- Skia-animasjoner: ALLTID Reanimated SharedValue — aldri setState/rAF
- `swarm_reports.status`: `'open'` | `'resolved'` (IKKE 'active')
- `uploadHivePhoto`: bruker `Uint8Array.from(binaryString, c => c.charCodeAt(0))`
- RevenueCat: guard med `Constants.appOwnership === 'expo'` — krasjer i Expo Go
- iOS RevenueCat: returnerer mock starter-tier (ikke konfigurert ennå)
- `mapX()` kaster ved manglende required fields — nullable felt: `typeof row.x === 'string' ? row.x : null`
- Mutations: alltid `onError: (e: Error) => showToast(e.message, 'error')`
- `react-native-svg`: importer `Text as SvgText` for å unngå konflikt med RN Text

## Faner (5 aktive)
`hjem` · `kuber` (Stack) · `kalender` · `laer` · `samfunn`

## Nøkkelfiler
| Fil | Ansvar |
|-----|--------|
| `app/(app)/_layout.tsx` | Auth-guard, push-tillatelse, registerPushToken |
| `app/(app)/(tabs)/hjem/index.tsx` | Dashboard — bruker `fetchLastInspectionPerHive` (ikke fetchAllInspections) for UI |
| `app/(app)/(tabs)/kuber/[id]/index.tsx` | Kubeprofil: Helse, Anbefalinger, VarroaTrend, Dronning, Høsting, Behandling, Vekt |
| `services/inspection.ts` | `fetchLastInspectionPerHive()` → Record<hiveId, Inspection> (rask, minimal payload) |
| `services/report.ts` | PDF-generering med `esc()` HTML-escaping |
| `services/subscription.ts` | RevenueCat-integrasjon + `syncTierToSupabase()` |
| `supabase/functions/revenuecat-webhook/` | Edge Function: syncer tier ved kansellering/utløp |
| `constants/colors.ts` | Colors.honey · .dark · .mid · .white · .error · .success · .info · .warning |

## Services
`hive` · `inspection` · `swarmReport` · `calendarEvent` · `notifications` · `weather` (Yr.no, TTL 1t) · `profile` · `treatment` · `weight` · `harvest` · `queen` · `report` · `subscription` · `collaboration` (DB-only, ingen UI)

## DB-migrasjoner (0001–0011 kjørt)
0006 treatments · 0007 hive_weights · 0008 hive_collaborators (ingen UI) · 0009 queens · 0010 marketplace (ingen UI) · 0011 feed (ingen UI)

## Bygg
```
npx eas build --profile preview --platform android --non-interactive
```
EAS project: `@boklet23/biapp` · Android: `no.biapp.app` · Supabase: `zujvhbnuqocquthbujmp`

## Abonnementer
starter (gratis, 3 kuber) · hobbyist 49kr · profesjonell 149kr · lag 499kr
