-- Seed: Norwegian beekeeping associations
-- Sources: norbi.no kontingentsatser 2025, oabi.no lokallag 2025/2026, boobi.no, innbi.no
-- NBF uses pre-2020 county structure internally (Hedmark/Oppland separate, Aust-/Vest-Agder separate, etc.)
-- All fylkeslag emails follow confirmed pattern: [kortnavn]@norbi.no (NBF organisasjonshandbok jan 2025)

INSERT INTO public.bee_associations (name, county, type, website, email, phone) VALUES

-- NASJONAL
('Norges Birøkterlag (NBF)',          'Nasjonalt',                   'nasjonal', 'https://norbi.no',               'post@norbi.no',              '63 94 20 80'),

-- FYLKESLAG
('Oslo og Akershus Birøkterlag',      'Oslo / Akershus',             'fylke',    'https://www.oabi.no',            'oslo-og-akershus@norbi.no',  NULL),
('Hedmark Birøkterlag',               'Innlandet (Hedmark)',         'fylke',    'https://innbi.no',               'hedmark@norbi.no',           '911 67 186'),
('Oppland Birøkterlag',               'Innlandet (Oppland)',         'fylke',    NULL,                             'oppland@norbi.no',           NULL),
('Buskerud Fylkes Birøkterlag',       'Buskerud',                    'fylke',    NULL,                             'buskerud@norbi.no',          NULL),
('Vestfold Fylkes Birøkterlag',       'Vestfold',                    'fylke',    NULL,                             'vestfold@norbi.no',          NULL),
('Telemark Birøkterlag',              'Telemark',                    'fylke',    NULL,                             'telemark@norbi.no',          NULL),
('Østfold Birøkterlag',               'Østfold',                     'fylke',    NULL,                             'ostfold@norbi.no',           NULL),
('Aust-Agder Birøkterlag',            'Agder',                       'fylke',    NULL,                             'aust-agder@norbi.no',        NULL),
('Vest-Agder Birøkterlag',            'Agder',                       'fylke',    NULL,                             'vest-agder@norbi.no',        NULL),
('Rogaland Birøkterlag',              'Rogaland',                    'fylke',    NULL,                             'rogaland@norbi.no',          NULL),
('Hordaland Birøkterlag',             'Vestland (Hordaland)',         'fylke',    NULL,                             'hordaland@norbi.no',         NULL),
('Sogn og Fjordane Birøkterlag',      'Vestland (Sogn og Fjordane)', 'fylke',    NULL,                             'sognog-fjordane@norbi.no',   NULL),
('Møre og Romsdal Birøkterlag',       'Møre og Romsdal',             'fylke',    NULL,                             'more-og-romsdal@norbi.no',   NULL),
('Trøndelag Birøkterlag',             'Trøndelag',                   'fylke',    NULL,                             'trondelag@norbi.no',         NULL),
('Nordland Birøkterlag',              'Nordland',                    'fylke',    NULL,                             'nordland@norbi.no',          NULL),
('Troms Birøkterlag',                 'Troms',                       'fylke',    NULL,                             'troms@norbi.no',             NULL),

-- LOKALLAG — Oslo / Akershus (kilde: oabi.no 2025/2026)
('ByBi Oslo Birøkterlag',             'Oslo',                        'lokal',    'https://bybi.no',                'post@bybi.no',               NULL),
('Bærum Birøkterlag',                 'Akershus',                    'lokal',    'https://baerumbirokterlag.no',   'post@baerumbirokterlag.no',  '951 06 128'),
('Asker Birøkterlag',                 'Akershus',                    'lokal',    NULL,                             NULL,                         '913 65 258'),
('Aurskog-Høland Birøkterlag',        'Akershus',                    'lokal',    NULL,                             NULL,                         '405 53 077'),
('Eidsvoll Birøkterlag',              'Akershus',                    'lokal',    NULL,                             NULL,                         '900 43 645'),
('Enebakk Birøkterlag',               'Akershus',                    'lokal',    NULL,                             NULL,                         '911 62 383'),
('Fet Birøkterlag',                   'Akershus',                    'lokal',    NULL,                             NULL,                         '930 66 323'),
('Hurdal Birøkterlag',                'Akershus',                    'lokal',    NULL,                             NULL,                         '928 04 878'),
('Nedre Romerike Birøkterlag',        'Akershus',                    'lokal',    'https://www.landbi.no',          NULL,                         '924 05 075'),
('Oslo og Omegnen Birøkterlag',       'Oslo',                        'lokal',    NULL,                             NULL,                         '907 61 586'),
('Raumnes Birøkterlag',               'Akershus',                    'lokal',    NULL,                             NULL,                         '922 78 768'),
('Ski og Omegn Birøkterlag',          'Akershus',                    'lokal',    NULL,                             NULL,                         '911 38 255'),
('Ullensaker Birøkterlag',            'Akershus',                    'lokal',    NULL,                             NULL,                         NULL),
('Ås og Omegn Birøkterlag',           'Akershus',                    'lokal',    NULL,                             NULL,                         '971 63 332'),

-- LOKALLAG — Innlandet / Hedmark (kilde: innbi.no + kontingentsatser-PDF)
('Elverum og Omegn Birøkterlag',      'Innlandet (Hedmark)',         'lokal',    NULL,                             NULL,                         NULL),
('Ringsaker Birøkterlag',             'Innlandet (Hedmark)',         'lokal',    NULL,                             NULL,                         NULL),
('Stange Birøkterlag',                'Innlandet (Hedmark)',         'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Innlandet / Oppland (kilde: kontingentsatser-PDF 2025)
('Land og Etnedal Birøkterlag',       'Innlandet (Oppland)',         'lokal',    NULL,                             NULL,                         NULL),
('Lillehammer Birøkterlag',           'Innlandet (Oppland)',         'lokal',    NULL,                             NULL,                         NULL),
('Toten Birøkterlag',                 'Innlandet (Oppland)',         'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Østfold (kilde: kontingentsatser-PDF 2025)
('Borgen og Omegn Birøkterlag',       'Østfold',                     'lokal',    NULL,                             NULL,                         NULL),
('Eidsberg og Marker Birøkterlag',    'Østfold',                     'lokal',    NULL,                             NULL,                         NULL),
('Fredrikstad Birøkterlag',           'Østfold',                     'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Vestfold (kilde: kontingentsatser-PDF 2025)
('Larvik og Omegn Birøkterlag',       'Vestfold',                    'lokal',    NULL,                             NULL,                         NULL),
('Nordre Vestfold Birøkterlag',       'Vestfold',                    'lokal',    NULL,                             NULL,                         NULL),
('Sandar Birøkterlag',                'Vestfold',                    'lokal',    NULL,                             NULL,                         NULL),
('Tønsberg og Omegn Birøkterlag',     'Vestfold',                    'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Telemark (kilde: kontingentsatser-PDF 2025)
('Bamble Birøkterlag',                'Telemark',                    'lokal',    NULL,                             NULL,                         NULL),
('Drangedal Birøkterlag',             'Telemark',                    'lokal',    NULL,                             NULL,                         NULL),
('Treungen Birøktarlag',              'Telemark',                    'lokal',    NULL,                             NULL,                         NULL),
('Vest-Telemark Birøkterlag',         'Telemark',                    'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Agder (kilde: kontingentsatser-PDF 2025)
('Bjelland, Grindheim og Åser Birøkterlag', 'Agder',                'lokal',    NULL,                             NULL,                         NULL),
('Eiken Birøkterlag',                 'Agder',                       'lokal',    NULL,                             NULL,                         NULL),
('Lister Birøkterlag',                'Agder',                       'lokal',    NULL,                             NULL,                         NULL),
('Songdalen Birøkterlag',             'Agder',                       'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Rogaland (kilde: kontingentsatser-PDF 2025 + birokterlaget.no)
('Haugaland Birøkterlag',             'Rogaland',                    'lokal',    NULL,                             NULL,                         NULL),
('Jæren Birøkterlag',                 'Rogaland',                    'lokal',    'https://www.birokterlaget.no',   NULL,                         NULL),
('Karmøy Birøkterlag',                'Rogaland',                    'lokal',    NULL,                             NULL,                         NULL),
('Lund Birøkterlag',                  'Rogaland',                    'lokal',    NULL,                             NULL,                         NULL),
('Ryfylke Birøkterlag',               'Rogaland',                    'lokal',    NULL,                             NULL,                         NULL),
('Sokndal Birøkterlag',               'Rogaland',                    'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Vestland (kilde: boobi.no + kontingentsatser-PDF 2025)
('Bergen og Omegn Birøkterlag',       'Vestland (Hordaland)',         'lokal',    'https://boobi.no',               NULL,                         NULL),
('Fjordane Birøkterlag',              'Vestland (Sogn og Fjordane)', 'lokal',    NULL,                             NULL,                         NULL),
('Sogn Birøkterlag',                  'Vestland (Sogn og Fjordane)', 'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Trøndelag (kilde: kontingentsatser-PDF 2025)
('Nord-Innherred Birøkterlag',        'Trøndelag',                   'lokal',    NULL,                             NULL,                         NULL),
('Orkdal og Omegn Birøkterlag',       'Trøndelag',                   'lokal',    NULL,                             NULL,                         NULL),
('Snåsa Birøkterlag',                 'Trøndelag',                   'lokal',    NULL,                             NULL,                         NULL),
('Stjørdal Birøkterlag',              'Trøndelag',                   'lokal',    NULL,                             NULL,                         NULL),

-- LOKALLAG — Nordland (kilde: Statsforvalteren i Nordland)
('Helgeland Birøkterlag',             'Nordland',                    'lokal',    NULL,                             NULL,                         NULL),
('Lofoten Birøkterlag',               'Nordland',                    'lokal',    NULL,                             NULL,                         NULL),
('Salten Birøkterlag',                'Nordland',                    'lokal',    NULL,                             NULL,                         NULL);
