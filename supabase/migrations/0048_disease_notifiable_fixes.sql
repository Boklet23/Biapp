-- Faglig korreksjon av meldepliktige sykdommer (kilde: Mattilsynet, dyrehelseforskriften).
-- Europeisk yngelråte (EFB) er meldepliktig B-sykdom — var feilmerket is_notifiable=false,
-- så brukeren fikk ikke meldeplikt-banneret ved mistanke.
UPDATE public.diseases
   SET is_notifiable = true, updated_at = now()
 WHERE slug = 'europeisk-yngelraate';

-- Liten kubebille (Aethina tumida): eksotisk, meldepliktig skadegjører som mangler i lista.
INSERT INTO public.diseases
  (slug, name_no, is_notifiable, severity, description, symptoms, treatment, prevention,
   diagnostic_tips, goal, sources, photos, sort_order, is_active)
VALUES
(
  'liten-kubebille', 'Liten kubebille', true, 'kritisk',
  'Liten kubebille (Aethina tumida) er en eksotisk skadegjører som ennå ikke er påvist i Norge. Larvene borer seg gjennom kaker, ødelegger honning og pollen, og kan få hele kolonien til å kollapse. Påvisning er meldepliktig til Mattilsynet og må varsles umiddelbart ved mistanke.',
  'Små (5–7 mm) mørkebrune til svarte biller som løper raskt unna lys på bunnbrett og mellom rammer. Hvite larver med ryggpigger i kakene. Gjæret, slimete honning som renner ut av cellene og lukter råtne appelsiner.',
  'Ingen behandling i Norge — påvisning utløser offentlig bekjempelse. Mistanke MÅ varsles Mattilsynet umiddelbart (tlf. 22 40 00 00). Ikke flytt kuber, utstyr eller bifolk ved mistanke.',
  'Kjøp aldri bier eller brukt utstyr fra utlandet uten godkjenning. Kontroller bunnbrett jevnlig for raske, mørke biller. Vær ekstra årvåken i importutsatte områder og havnenære standplasser.',
  'Plasser en diagnosefelle (bølgepapp eller kubebille-felle) på bunnbrettet og kontroller etter 1–2 dager. Voksne biller søker mørke sprekker; larvene skiller seg fra voksmøll ved tre par bein nær hodet og tydelige ryggpigger.',
  'Tidlig påvisning og umiddelbar varsling til Mattilsynet for å hindre etablering i Norge.',
  'Mattilsynet — Liten kubebille (Aethina tumida); Veterinærinstituttet; EU referanselaboratorium for bihelse',
  '[
    {"emoji": "🪲", "caption": "Aethina tumida — voksen liten kubebille", "bg": "#F5F0E8"},
    {"emoji": "🐛", "caption": "Billelarver med ryggpigger i ødelagt kake", "bg": "#FFF8E1"}
  ]'::jsonb,
  11, true
)
ON CONFLICT (slug) DO UPDATE
   SET is_notifiable = excluded.is_notifiable,
       severity      = excluded.severity,
       updated_at    = now();
