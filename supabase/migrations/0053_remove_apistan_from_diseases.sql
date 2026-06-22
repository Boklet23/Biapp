-- Apistan (tau-fluvalinat) har ingen norsk markedsføringstillatelse (DMP) og skal
-- ikke anbefales norske birøktere. constants/diseases.ts ble rettet 2026-06-18, men
-- appen leser sykdommer fra diseases-tabellen (services/diseases.ts → from('diseases')),
-- så DB-seeden (0026) viste fortsatt Apistan i varroamidd-raden. Retter de faktiske
-- radene her. Idempotent: kan kjøres flere ganger uten skade.

-- 1) Hovedbehandlingstekst (uten Apistan, konsistent med constants/diseases.ts)
UPDATE public.diseases
SET treatment = 'Oksalsyre (vinterstid når det er yngelfritt), maursyre (gjennom forseglet yngel), ApiLife Var (timol) eller Apivar (amitraz, krever godkjenningsfritak). Kombinér alltid med tellemetode for å vurdere tetthet. Roter mellom virkemidler for å hindre resistens.'
WHERE slug = 'varroamidd';

-- 2) Sesongvis behandling — fjern Apistan fra Høst-tipset
UPDATE public.diseases
SET seasonal_treatment = REPLACE(
      seasonal_treatment::text,
      'Etter siste slynging: sett inn Apistan-strimler, ApiLife Var eller Apivar-gelé.',
      'Etter siste slynging: sett inn maursyre (MAQS), ApiLife Var eller Apivar-gelé.'
    )::jsonb
WHERE slug = 'varroamidd'
  AND seasonal_treatment::text ILIKE '%Apistan%';
