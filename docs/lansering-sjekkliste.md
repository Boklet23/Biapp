# BiVokter — Lanseringssjekkliste (manuelle dashboard-punkter)

Sist verifisert: 2026-11-10 (review v4). Alt kodbart fra review v3 er levert; review v4
fikset i tillegg RevenueCat-webhookens tier-parsing (v18 — entitlement_ids er array),
fire RLS-korrelasjonsfeil i prod og storage-policy-lekkasjen på kubebilder.
Dette er de gjenstående punktene som **må gjøres manuelt i dashbordene** — de kan ikke
gjøres fra kode.

---

## ✅ Allerede verifisert (ingen handling nødvendig)

- **RevenueCat webhook-secret** — `REVENUECAT_WEBHOOK_SECRET` er satt i Supabase
  Edge Function-secrets (bekreftet via Management API 2026-06-14).
- **AI-nøkkel** — `ANTHROPIC_API_KEY` er satt (varroa-analyse virker server-side).
- **Ukesvarsler** — `WEEKLY_ALERTS_SECRET` er satt.
- **Konto-slette-side** — live på https://boklet23.github.io/Biapp/slett-konto.html
- **Supabase-prosjekt** — status `ACTIVE_HEALTHY`, Postgres 17, region eu-central-1.

---

## ⬜ Må gjøres før åpen testing / produksjon

### 1. Last opp v21 til Play Console
- **Hvor:** https://play.google.com/console → BiVokter → Test → Intern testing → «Opprett ny utgivelse»
- **Hva:** Last ned AAB fra
  https://expo.dev/accounts/boklet23/projects/biapp/builds/e267efa6-417b-4cb3-9cdd-d316e54817d1
  og last den opp.
- **VIKTIG:** Ikke rull ut v20 — den har brutt bildevalg (READ_MEDIA-fiksen kom i v21).
- **Verifiser:** Etter opplasting, sjekk at «Enhetskatalog» viser tusenvis av støttede
  enheter (ikke 0), og at apptillatelsene ikke lenger lister `READ_MEDIA_IMAGES`.

### 2. Konto-slette-URL i Data safety
- **Hvor:** Play Console → BiVokter → Policy → App-innhold → Datasikkerhet (Data safety)
- **Hva:** Lim inn slette-URL-en i feltet «URL for forespørsel om kontosletting»:
  ```
  https://boklet23.github.io/Biapp/slett-konto.html
  ```
- **Mens du er der:** Bekreft at det deklarerte datainnsamlingen stemmer med faktisk bruk:
  - Posisjon (kube-GPS + svermekart — merk svermekart som «delt med andre brukere»)
  - Bilder (kube-/inspeksjonsfoto)
  - E-post + navn (konto)
  - Appaktivitet/krasjlogg (Sentry)

### 3. Supabase Pro-oppgradering
- **Hvor:** https://supabase.com/dashboard/project/zujvhbnuqocquthbujmp → Settings → Billing
- **Hvorfor:** Free tier auto-pauser databasen etter inaktivitet → appen slutter å virke
  for betalende brukere. Må oppgraderes før første ekte bruker.
- **Bonus på Pro:** Slå på **PITR** (Point-in-Time Recovery) backup under Database → Backups.
- **Samtidig (krever Pro):** Slå på **Leaked password protection** (HaveIBeenPwned) under
  Auth → Settings → Passwords. Forsøkt aktivert via Management API 2026-11-10 → HTTP 402
  («available on Pro Plans and up») — gjøres i samme slengen som oppgraderingen.

### 4. RevenueCat-produkter aktive i Play Console
- **Hvor:** Play Console → Tjenester og API-er → Abonnementer (Monetisering)
- **Hva:** Opprett/aktiver de fire abonnementsproduktene og koble dem til RevenueCat:
  - hobbyist (49 kr/mnd) · profesjonell (149 kr/mnd) · lag (499 kr/mnd) + årsvarianter
- **RevenueCat-side:** https://app.revenuecat.com/projects/proj886f3830 → Products/Offerings
  må matche produkt-ID-ene fra Play Console. Webhook-URL skal allerede peke på
  `…/functions/v1/revenuecat-webhook` (secret er satt — se ✅ over).
- **Verifiser:** Gjør et testkjøp i intern testing → sjekk at `subscription_tier`
  oppdateres i `profiles` (webhook v17 er idempotent + respekterer tier_locked).

---

## Etter at de fire punktene er gjort

Appen er klar for åpen testing. Gjenstående ikke-blokkerende forbedringer ligger
dokumentert i `reports/syntese-handlingsplan.md` under «Etter lansering (3 mnd)»
(offline-støtte, retention-progresjon, full a11y, domeneutvidelser).
