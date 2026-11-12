# BiVokter på Apple App Store — komplett oppskrift

Skrevet 2026-11-12, tilpasset akkurat dette prosjektet (Expo SDK 55 + EAS).
**Du trenger INGEN Mac** — EAS bygger på Apples maskiner i skyen. Alt
administrativt skjer i nettleseren.

**Kostnad:** Apple Developer Program 99 USD/år (~1 100 kr).
**Realistisk tidslinje:** 1–3 dager venting på Apple-innmelding → 1 dag oppsett
→ 1–2 dager TestFlight → 1–3 dager App Review. Totalt ca. 1–2 uker.

---

## Fase 0 — Status i repoet (hva som allerede er klart)

| Klart ✅ | Mangler ❌ |
|---|---|
| `bundleIdentifier: no.biapp.app` i app.json | Apple Developer-konto |
| iOS-tillatelsestekster (posisjon, kamera, bilder) via plugins | **Sign in with Apple** (obligatorisk — se fase 4) |
| `ITSAppUsesNonExemptEncryption: false` (slipper eksport-spørsmål) | RevenueCat iOS er mock — ekte IAP må settes opp (fase 5) |
| Konto-sletting i appen (Apple-krav 5.1.1(v)) | `submit.production.ios` i eas.json |
| Personvernerklæring på boklet23.github.io | Skjermbilder i iPhone-format |
| eas.json har iOS-byggprofiler | APNs push-nøkkel (EAS ordner ved første bygg) |

---

## Fase 1 — Apple Developer-konto

1. Gå til https://developer.apple.com/programs/enroll/
2. Logg inn med Apple-ID-en din (må ha tofaktor skrudd på — gjøres på
   https://appleid.apple.com under «Pålogging og sikkerhet»).
3. Velg **Enrolling as an Individual** (enkeltperson — enklest; firmanavn i
   App Store blir da «Andre Haukeland». Vil du ha firmanavn, kreves
   organisasjonsnummer + D-U-N-S-nummer og det tar uker — ikke verdt det nå;
   kan endres senere).
4. Fyll inn navn/adresse NØYAKTIG som i offentlig ID (Apple kan kreve
   ID-verifisering via Apple Developer-appen på en iPhone).
5. Betal 99 USD. Godkjenning tar vanligvis **noen timer til 2 døgn**
   (e-post: «Welcome to the Apple Developer Program»).

> Har du ikke iPhone selv? Innmelding går vanligvis fint i nettleser, men
> ID-verifisering kan kreve Apple Developer-appen på en iOS-enhet. Lån en
> om nødvendig — det er et engangstilfelle.

## Fase 2 — App Store Connect: opprett appen

1. Gå til https://appstoreconnect.apple.com → **Apps** → «+» → **New App**.
2. Felter:
   - **Platform:** iOS
   - **Name:** `BiVokter` (unikt i hele App Store; ha «BiVokter – Birøkt» som
     reserve hvis opptatt)
   - **Primary language:** Norwegian (Bokmål)
   - **Bundle ID:** velg «Register a new Bundle ID» hvis listen er tom →
     https://developer.apple.com/account/resources/identifiers → «+» →
     App IDs → App → Description `BiVokter`, Bundle ID **Explicit**:
     `no.biapp.app`. Huk av capabilities: **Sign in with Apple** og
     **Push Notifications**. Lagre, gå tilbake og velg den.
   - **SKU:** `bivokter-ios` (internt, vises aldri)
3. Noter **Apple ID (ascAppId)** for appen (tallet under App Information →
   General) og **Team ID** (developer.apple.com → Membership) — begge skal inn
   i eas.json i fase 6.

## Fase 3 — App Store Connect API-nøkkel (lar EAS gjøre alt headless)

Dette er nøkkelen som lar Claude/EAS bygge, signere og laste opp uten
interaktiv Apple-innlogging hver gang.

1. App Store Connect → **Users and Access** → fanen **Integrations** →
   App Store Connect API → «+».
2. Name: `EAS`, Access: **App Manager**.
3. Last ned `.p8`-filen (KAN BARE LASTES NED ÉN GANG — lagre trygt, f.eks.
   samme sted som google-play-service-account.json, og hold den utenfor git).
4. Noter **Key ID** og **Issuer ID**.
5. Koble til EAS (gjøres én gang, i terminal):
   ```
   npx eas credentials --platform ios
   ```
   → velg production → «App Store Connect API Key» → «Set up» → pek på
   .p8-filen + Key ID + Issuer ID. (Alternativt skjer dette automatisk
   under første `eas submit`.)

## Fase 4 — KODE: Sign in with Apple (OBLIGATORISK før innsending)

Apple-regel 4.8: tilbyr appen tredjeparts-innlogging (Google), MÅ den også
tilby Sign in with Apple. Avslag er garantert uten. Arbeidsliste (Claude kan
gjøre hele denne fasen på forespørsel):

1. `npx expo install expo-apple-authentication`
2. app.json → `"ios": { ..., "usesAppleSignIn": true }` (setter entitlement).
3. Supabase Dashboard → Authentication → Providers → **Apple** → Enable.
   For NATIV innlogging (som vi bruker) er det nok å legge `no.biapp.app`
   i «Client IDs»-feltet (Authorized Client IDs). Secret key trengs kun for
   web-OAuth-varianten — ikke vår flyt.
4. Ny `services/appleAuth.ts`:
   ```ts
   import * as AppleAuthentication from 'expo-apple-authentication';
   import { supabase } from '@/lib/supabase';

   export async function signInWithApple(): Promise<void> {
     const credential = await AppleAuthentication.signInAsync({
       requestedScopes: [
         AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
         AppleAuthentication.AppleAuthenticationScope.EMAIL,
       ],
     });
     if (!credential.identityToken) throw new Error('Ingen identity token fra Apple');
     const { error } = await supabase.auth.signInWithIdToken({
       provider: 'apple',
       token: credential.identityToken,
     });
     if (error) throw error;
     // fullName kommer KUN ved første innlogging — lagre display_name da
   }
   ```
5. «Fortsett med Apple»-knapp i welcome/login/register — KUN på iOS
   (`Platform.OS === 'ios'`), med Apples offisielle knappekomponent
   (`AppleAuthentication.AppleAuthenticationButton`) — Apple er kresne på
   knappens utseende.
6. Kant: Apple gir e-post/navn bare ved FØRSTE innlogging (ev. skjult
   relay-adresse @privaterelay.appleid.com) — `handle_new_user`-triggeren
   håndterer display_name fra metadata; sett fallback «Birøkter» ved null.

## Fase 5 — KODE + butikk: RevenueCat/abonnementer på iOS

I dag returnerer `services/subscription.ts` en mock (starter) på iOS. Apple
krever at betalfunksjoner faktisk virker via In-App Purchase.

**Strategivalg:** Du KAN sende inn v1 til App Store UTEN abonnementer synlige
(gjem oppgrader-knappene på iOS, alle får starter) — men da må paywall-koden
være helt utilgjengelig, ellers avslag. Anbefalt: gjør IAP ferdig med én gang,
det er samme jobb nå som senere.

1. **App Store Connect → appen → Monetization → Subscriptions:**
   - Lag Subscription Group: `BiVokter Premium`
   - Lag 6 produkter (match Android-ID-mønsteret):
     `hobbyist_monthly` 49 kr · `hobbyist_annual` · `profesjonell_monthly`
     149 kr · `profesjonell_annual` · `lag_monthly` 499 kr · `lag_annual`
   - Hvert produkt trenger norsk visningsnavn + beskrivelse + pris
     (Apple-pristier) + et «review screenshot» (skjermbilde av paywallen).
2. **App Store Connect → Users and Access → Integrations → In-App Purchase:**
   generer **In-App Purchase Key** (.p8) — RevenueCat trenger den for
   StoreKit 2.
3. **RevenueCat-dashboard** (prosjekt proj886f3830) → Apps → + New App →
   App Store → bundle ID `no.biapp.app`, lim inn In-App Purchase Key.
   Noter den nye **Apple API key** (`appl_…`).
4. Koble produktene til de eksisterende entitlements (`hobbyist`,
   `profesjonell`, `lag`) og offerings i RevenueCat.
5. **Kode:** sett `EXPO_PUBLIC_REVENUECAT_IOS_KEY` i EAS-miljøene, og endre
   `services/subscription.ts`: fjern iOS-mocken, kall
   `Purchases.configure({ apiKey: Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY })`.
6. Webhooken (v18) er plattformnøytral — ingen endring der. Testkjøp i
   TestFlight-sandbox verifiserer hele kjeden.

## Fase 6 — eas.json: legg til iOS-submit

```jsonc
"submit": {
  "production": {
    "android": { ...som i dag... },
    "ios": {
      "ascAppId": "<Apple ID-tallet fra fase 2>",
      "appleTeamId": "<Team ID fra developer.apple.com/Membership>"
    }
  }
}
```

## Fase 7 — Første iOS-bygg

```
npx eas build --profile production --platform ios
```
Første gang spør EAS om Apple-innlogging (eller bruker API-nøkkelen fra
fase 3) og **oppretter automatisk**: distribusjonssertifikat, provisioning
profile og **APNs push-nøkkel** (svar Yes på «Set up Push Notifications»).
Alt lagres hos Expo — ingen Keychain/Xcode-styr.

Vanlige førstegangsfeil:
- «Bundle ID not found» → fase 2-registreringen mangler/skrivefeil.
- Mapbox pod-feil (403 ved nedlasting) → sett EAS-secret
  `MAPBOX_DOWNLOADS_TOKEN` (secret token med DOWNLOADS:READ-scope fra
  account.mapbox.com) — Android-byggene har klart seg uten, men iOS/CocoaPods
  kan kreve den avhengig av SDK-versjon.
- Sentry sourcemaps: produksjonsprofilen krever `SENTRY_AUTH_TOKEN` som
  EAS-secret (samme som Android-produksjon).

## Fase 8 — TestFlight

1. Last opp bygget: `npx eas submit --platform ios --latest`
   (bruker API-nøkkelen — helt headless).
2. App Store Connect → TestFlight: bygget dukker opp etter ~5–15 min
   «processing».
3. Første bygg trigger spørsmål om **eksportkryptering** — allerede besvart i
   app.json (`ITSAppUsesNonExemptEncryption: false`), så det hoppes over.
4. **Intern testing:** legg deg selv til (App Store Connect-brukere, inntil
   100) — ingen review, tilgjengelig umiddelbart. Installer TestFlight-appen
   på en iPhone, godta invitasjonen, test ALT (spesielt: Google-innlogging,
   Apple-innlogging, kart, kamera, push, kjøp i sandbox).
5. **Ekstern testing** (valgfritt, inntil 10 000 testere via lenke): krever en
   lett «Beta App Review» (~1 døgn).

## Fase 9 — App Store-oppføringen

App Store Connect → appen → «1.0 Prepare for Submission»:

1. **Skjermbilder** (obligatorisk): 6,9"-format (1320×2868) — ta dem fra
   TestFlight på en stor iPhone, eller generer fra simulator-bygg. Apple
   nedskalerer selv til mindre formater. 4–6 stk: Hjem-dashboard, kubeprofil
   med helsescore, inspeksjonsflyt, kart med bieflukt-sirkler, kalender,
   svermekart.
2. **Beskrivelse** (norsk): gjenbruk Play-teksten fra docs/store-listing.md.
3. **Nøkkelord:** `birøkt,bikube,bier,varroa,honning,inspeksjon,sverm,
   birøkter,beekeeping`
4. **Support-URL:** https://boklet23.github.io/Biapp/ ·
   **Privacy Policy URL:** https://boklet23.github.io/biapp/privacy
5. **Aldersgrense:** spørreskjema → 4+.
6. **App Privacy** («nutrition labels» — VIKTIG, må stemme med virkeligheten):
   - *Kontaktinfo:* e-post + navn — kontoopprettelse — knyttet til identitet
   - *Posisjon:* presis — appfunksjonalitet (kubekart/vær; svermekart deles
     med andre brukere) — knyttet til identitet
   - *Bilder:* brukerinnhold — appfunksjonalitet — knyttet til identitet
   - *Kjøpshistorikk:* — appfunksjonalitet (RevenueCat)
   - *Krasjdata/diagnostikk:* Sentry — appfunksjonalitet — IKKE knyttet
     (sendDefaultPii er av)
   - Ingen sporing (ingen ATT-prompt nødvendig).
7. **Priser:** Gratis (med IAP).

## Fase 10 — Innsending og review

1. Velg bygget fra TestFlight, fyll «What's New».
2. **App Review Information:** legg inn en DEMOKONTO (lag en testbruker med
   lag-tier via tier_locked-SQL-malen) med e-post+passord, og notat på
   engelsk: *«Norwegian beekeeping management app. Demo account has premium
   tier enabled. Location is used for hive placement and weather. Account
   deletion is available under Profile → Slett konto.»*
3. Submit for Review. Normal ventetid: **24–48 timer**.
4. Vanligste avslagsgrunner (og vår status):
   - 4.8 mangler Apple-innlogging → fase 4 fikser
   - 2.1 krasj/feil under review → test grundig i TestFlight først
   - 3.1.1 betalinger utenom IAP → vi bruker kun RevenueCat/IAP ✅
   - 5.1.1 konto-sletting mangler → finnes ✅
   - Guideline 2.3 metadata matcher ikke appen → ærlige skjermbilder
5. Ved avslag: svar i Resolution Center — ofte løst med forklaring + nytt bygg.
6. Godkjent → velg manuell eller automatisk utgivelse. Ferdig! 🍏

## Vedlikehold etterpå

- Nye versjoner: `eas build -p ios --profile production` →
  `eas submit -p ios --latest` → ny versjon i App Store Connect → review.
  (OTA-oppdateringer via EAS Update går utenom review for JS-endringer på
  samme runtime-versjon.)
- iOS-spesifikke ting å følge med på: RevenueCat «StoreKit 2»-modus,
  APNs-nøkkelens gyldighet (evig, men én per konto), årlig fornyelse av
  utviklerkontoen (ellers forsvinner appen fra butikken).

## Hva Claude kan gjøre vs. hva bare du kan gjøre

| Claude (på forespørsel) | Bare du |
|---|---|
| Hele fase 4 (Apple-innlogging i koden) | Fase 1 (betale/verifisere Apple-konto) |
| Fase 5-koden + RevenueCat-dashboard-oppsett (API-nøkler finnes) | Fase 2–3 (App Store Connect-opprettelser, .p8-nedlastinger) |
| Fase 6 (eas.json) + kjøre bygg/submit når API-nøkkel er koblet | Godta avtaler/priser i App Store Connect |
| Skjermbilde-tekster, beskrivelse, nøkkelord, privacy-labels-utkast | Ta/velge endelige skjermbilder |
