#!/usr/bin/env node
/**
 * Oppretter alle 6 BiVokter-abonnementsprodukter i Google Play via Developer API v3.
 *
 * Forutsetninger:
 *   1. google-play-service-account.json i prosjektets rotmappe
 *   2. Service account er linket til Play Console med "Release Manager"-rolle
 *   3. Appen er lastet opp til intern testing minst én gang (Google-krav)
 *
 * Bruk:
 *   node scripts/create-play-subscriptions.js           (oppretter produktene)
 *   node scripts/create-play-subscriptions.js --dry-run (printer, gjør ingenting)
 */

const path = require('path');
const { google } = require('googleapis');

const PACKAGE_NAME = 'no.biapp.app';
const KEY_FILE = path.resolve(__dirname, '..', 'google-play-service-account.json');
const DRY_RUN = process.argv.includes('--dry-run');

const SUBSCRIPTIONS = [
  {
    productId: 'hobbyist_monthly',
    title: 'Hobbyist månedlig',
    description: 'BiVokter Hobbyist — ubegrenset kuber, AI varroa 10/mnd',
    price: 4900,   // øre (49 NOK)
    period: 'P1M',
  },
  {
    productId: 'hobbyist_annual',
    title: 'Hobbyist årlig',
    description: 'BiVokter Hobbyist — ubegrenset kuber, AI varroa 10/mnd (spar 33%)',
    price: 39900,  // øre (399 NOK)
    period: 'P1Y',
  },
  {
    productId: 'profesjonell_monthly',
    title: 'Profesjonell månedlig',
    description: 'BiVokter Profesjonell — alt i Hobbyist + ubegrenset AI varroa + CSV/PDF-eksport',
    price: 14900,  // øre (149 NOK)
    period: 'P1M',
  },
  {
    productId: 'profesjonell_annual',
    title: 'Profesjonell årlig',
    description: 'BiVokter Profesjonell — alt i Hobbyist + ubegrenset AI varroa + CSV/PDF-eksport (spar 33%)',
    price: 119000, // øre (1190 NOK)
    period: 'P1Y',
  },
  {
    productId: 'lag_monthly',
    title: 'Lag månedlig',
    description: 'BiVokter Lag — opptil 50 brukere, delt kubeoversikt, teamadministrasjon',
    price: 49900,  // øre (499 NOK)
    period: 'P1M',
  },
  {
    productId: 'lag_annual',
    title: 'Lag årlig',
    description: 'BiVokter Lag — opptil 50 brukere, delt kubeoversikt, teamadministrasjon (spar 33%)',
    price: 399000, // øre (3990 NOK)
    period: 'P1Y',
  },
];

async function main() {
  if (DRY_RUN) {
    console.log('[DRY RUN] Følgende produkter ville blitt opprettet i', PACKAGE_NAME, ':\n');
    for (const sub of SUBSCRIPTIONS) {
      const nok = (sub.price / 100).toFixed(0);
      console.log(`  ${sub.productId.padEnd(28)} ${nok} NOK  ${sub.period}`);
    }
    console.log('\nKjør uten --dry-run for å opprette dem.');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const androidpublisher = google.androidpublisher({ version: 'v3', auth });

  let ok = 0;
  let fail = 0;

  for (const sub of SUBSCRIPTIONS) {
    try {
      await androidpublisher.monetization.subscriptions.create({
        packageName: PACKAGE_NAME,
        productId: sub.productId,
        requestBody: {
          productId: sub.productId,
          listings: {
            'nb-NO': {
              title: sub.title,
              description: sub.description,
              benefits: [],
            },
          },
          basePlans: [
            {
              basePlanId: 'base',
              state: 'ACTIVE',
              autoRenewingBasePlanType: {
                billingPeriodDuration: sub.period,
                resubscribeState: 'RESUBSCRIBE_STATE_ACTIVE',
                prorationMode: 'SUBSCRIPTION_PRORATION_MODE_CHARGE_ON_NEXT_BILLING_DATE',
              },
              regionalConfigs: [
                {
                  regionCode: 'NO',
                  price: {
                    currencyCode: 'NOK',
                    units: String(Math.floor(sub.price / 100)),
                    nanos: (sub.price % 100) * 10_000_000,
                  },
                  newSubscriberAvailability: true,
                },
              ],
            },
          ],
        },
      });
      console.log(`  [OK] ${sub.productId}`);
      ok++;
    } catch (err) {
      const msg = err?.response?.data?.error?.message ?? err.message;
      // 409 = already exists — treat as success
      if (err?.response?.status === 409) {
        console.log(`  [FINNES ALLEREDE] ${sub.productId}`);
        ok++;
      } else {
        console.error(`  [FEIL] ${sub.productId}: ${msg}`);
        fail++;
      }
    }
  }

  console.log(`\nFerdig: ${ok} OK, ${fail} feilet.`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Uventet feil:', err.message);
  process.exit(1);
});
