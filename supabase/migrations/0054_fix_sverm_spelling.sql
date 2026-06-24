-- Stavefeil: «sværm» (æ) er ukorrekt bokmål — riktig form er «sverm»/«sverme-».
-- Appen leser sykdommer fra diseases-tabellen (services/diseases.ts), så seed-
-- rettelsen i 0026 alene treffer ikke eksisterende prod-rader. Retter live DB her.
-- Idempotent: REPLACE er no-op når strengen allerede er rettet.

UPDATE public.diseases
SET prevention = REPLACE(prevention, 'Sværmforebygging', 'Svermeforebygging'),
    seasonal_treatment = REPLACE(seasonal_treatment::text, 'Sværmforebygging', 'Svermeforebygging')::jsonb
WHERE prevention ILIKE '%Sværm%' OR seasonal_treatment::text ILIKE '%Sværm%';
