-- Data: Kontaktinfo for alle norske birøkterlag fra norbi.no/finn-fylkes-og-lokallag/
-- Kilde: norbi.no (hentet mai 2026)

-- ============================================================
-- STEP 1: Korriger fylkeslagnavn til å matche norbi.no
-- ============================================================
UPDATE public.bee_associations SET name = 'Buskerud Birøkterlag'
  WHERE name = 'Buskerud Fylkes Birøkterlag';
UPDATE public.bee_associations SET name = 'Troms Fylkeslag'
  WHERE name = 'Troms Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET name = 'Hordaland Birøktarlag'
  WHERE name = 'Hordaland Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET name = 'Oslo og Akershus Fylkesbirøkterlag'
  WHERE name = 'Oslo og Akershus Birøkterlag' AND type = 'fylke';

-- ============================================================
-- STEP 2: Kontaktinfo for fylkeslag
-- ============================================================
UPDATE public.bee_associations SET contact_person = 'Anders Blom',                  email = 'anders@logosag.no',                      phone = '90992987'
  WHERE name = 'Aust-Agder Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Vegard Sveiven',               email = 'vegtomme@frisurf.no',                    phone = '90919825'
  WHERE name = 'Buskerud Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Jan Olsen',                    email = 'olsen-jan@outlook.com',                  phone = '91167186'
  WHERE name = 'Hedmark Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Vegard Helland',               email = 'Vegard@bi1.no',                          phone = '40307000'
  WHERE name = 'Hordaland Birøktarlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Kari-Anne Thygesen',           email = 'moreogromsdal@norbi.no',                 phone = '98834466'
  WHERE name = 'Møre og Romsdal Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Einar Johansen',               email = 'einar_j_93@hotmail.com',                 phone = '48239655'
  WHERE name = 'Nordland Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Øyvind Strand',                email = 'oyvstra@gmail.com',                      phone = '91804402'
  WHERE name = 'Oppland Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Tor Øvrum',                    email = 'honningfarmen@gmail.com',                phone = '92278768', website = 'https://www.oabi.no'
  WHERE name = 'Oslo og Akershus Fylkesbirøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Benedicte Myhre',              email = 'obrestbirokt@gmail.com',                 phone = '46652882'
  WHERE name = 'Rogaland Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Lars Hustveit',                email = 'l.hustveit@outlook.com',                 phone = '41530972'
  WHERE name = 'Sogn og Fjordane Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Sven Tore Løkslid',            email = 'sven.tore.lokslid@telemarkfylke.no',    phone = '97698619'
  WHERE name = 'Telemark Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Kjell Lind',                   email = 'kjpedl@gmail.com',                       phone = '94842744'
  WHERE name = 'Troms Fylkeslag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Paul Gjervan',                 email = 'paul.gjervan@saksvik.no',                phone = '90587903'
  WHERE name = 'Trøndelag Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Kristoffer Birkeland Salvesen',email = 'k-salv@online.no',                       phone = '95207383'
  WHERE name = 'Vest-Agder Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Odd Arne Gaarder',             email = 'oagaarder@gmail.com',                    phone = '90891398'
  WHERE name = 'Vestfold Fylkes Birøkterlag' AND type = 'fylke';
UPDATE public.bee_associations SET contact_person = 'Jens Martin Nybøle',           email = 'jens.nybole@bier.no',                    phone = '92097748'
  WHERE name = 'Østfold Birøkterlag' AND type = 'fylke';

-- ============================================================
-- STEP 3: Kontaktinfo for eksisterende lokallag
-- ============================================================

-- Buskerud
UPDATE public.bee_associations SET contact_person = 'Vegard Sveiven',      email = 'vegtomme@frisurf.no',           phone = '90919825' WHERE name = 'Drammen og omegns Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Espen Bekkevold',      email = 'ebekkevold61@gmail.com',        phone = '92017810' WHERE name = 'Eiker Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Oddvar Espegard',      email = 'oddvar.espegard@gmail.com',     phone = '90918894', facebook_url = 'https://www.facebook.com/groups/239603626601310'  WHERE name = 'Hallingdal Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Geir Hanssen',         email = 'Hanssen65@outlook.com',         phone = '90030058' WHERE name = 'Kongsberg og Sandsvær Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Helge Nybakken',       email = 'helge.jnybakken@gmail.com',     phone = '91150987', facebook_url = 'https://www.facebook.com/groups/1051462071540053/' WHERE name = 'Lier, Røyken og Hurum Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Audun Eriksen',        email = 'audun.formo@gmail.com',         phone = '90167853' WHERE name = 'Modum Birøkterlag';

-- Hedmark
UPDATE public.bee_associations SET contact_person = 'Lars Waastad Gillerhaugen', email = 'lars@dbf.no', phone = '95135095', website = 'https://ringsbi.no' WHERE name = 'Ringsaker Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Geir Skirbekk',        email = 'geir.skirbekk@outlook.com',    phone = '98464504' WHERE name = 'Stange Birøkterlag';

-- Oppland
UPDATE public.bee_associations SET contact_person = 'Hege Marit L. Lund',   email = 'hege.marit.lund@gmail.com',    phone = '97709044' WHERE name = 'Land og Etnedal Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Christopher Ralph Aurlien', email = 'post@haugegaard.no',       phone = '45070068' WHERE name = 'Lillehammer Birøkterlag';

-- Telemark
UPDATE public.bee_associations SET contact_person = 'Anders Kristian Asdal', email = 'andersasdal@gmail.com',       phone = '95063401' WHERE name = 'Bamble Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Heleen Klok',           email = 'klok.birokt@gmail.com',        phone = '90758294', facebook_url = 'https://www.facebook.com/groups/135299810649062/' WHERE name = 'Drangedal Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Olav Arne Sønderland',  email = 'o.a.sonderland@gmail.com',     phone = '92015224' WHERE name = 'Treungen Birøktarlag';
UPDATE public.bee_associations SET contact_person = 'Andreas Myklebust',     email = 'andreas@egil.net',             phone = '91345231' WHERE name = 'Vest-Telemark Birøkterlag';

-- Agder (eksisterende fra seed — Vest-Agder-lokallag)
UPDATE public.bee_associations SET contact_person = 'Osmund Nilsen',         email = 'osmund-nilsen@vabb.no',        phone = '99274272' WHERE name = 'Bjelland, Grindheim og Åser Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Alf Stålesen',          email = 'alf@sfp.no',                   phone = '40432602' WHERE name = 'Eiken Birøkterlag' AND type = 'lokal';
UPDATE public.bee_associations SET contact_person = 'Kristoffer Birkeland Salvesen', email = 'k-salv@online.no',    phone = '95207383' WHERE name = 'Lister Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Karsten Skarpeid',      email = 'karstenskarpeid@live.no',      phone = '93640442' WHERE name = 'Songdalen Birøkterlag';

-- Rogaland
UPDATE public.bee_associations SET contact_person = 'Ali Alidani',           email = 'alidani13no@gmail.com',        phone = '98442568' WHERE name = 'Haugaland Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Morten Svanes',         email = 'morten.svanes@lyse.net',       phone = '92059385' WHERE name = 'Jæren Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Edvar Kalstø',          email = 'burrebi@online.no',            phone = '95025665' WHERE name = 'Karmøy Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Magne Handeland',       email = 'magne.handeland@dabb.no',      phone = '91529320' WHERE name = 'Lund Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Asbjørn Magnar Ask',    email = 'magnar4567@gmail.com',         phone = '90728784', website = 'https://ryfylkebirokterlag.no' WHERE name = 'Ryfylke Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Ragnhild Rodvelt',      email = 'rodvelt@online.no',            phone = '98644361' WHERE name = 'Sokndal Birøkterlag';

-- Vestland
UPDATE public.bee_associations SET contact_person = 'Vegard Helland',        email = 'Vegard@bi1.no',                phone = '40307000' WHERE name = 'Bergen og Omegn Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Svein Terje Nødseth',   email = 'svein_nodseth@hotmail.com',    phone = '47883744' WHERE name = 'Fjordane Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Lars Hustveit',         email = 'l.hustveit@outlook.com',       phone = '41530972' WHERE name = 'Sogn Birøkterlag';

-- Trøndelag
UPDATE public.bee_associations SET contact_person = 'Eilif Ramberg',         email = 'eiliframberg@gmail.com',       phone = '98243511' WHERE name = 'Nord-Innherred Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Gunnar Konradsen',      email = 'gunkon@online.no',             phone = '99497938' WHERE name = 'Orkdal og Omegn Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Anders Dalland Mona',   email = 'andalmona@gmail.com',          phone = '48246509' WHERE name = 'Snåsa Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Reidar Unstad',         email = 'reidarun@online.no',           phone = '90955144' WHERE name = 'Stjørdal Birøkterlag';

-- Nordland
UPDATE public.bee_associations SET contact_person = 'Arild Bjørge',          email = 'arildbj3@online.no',           phone = '48194895', facebook_url = 'https://www.facebook.com/groups/1423533454738289' WHERE name = 'Helgeland Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Einar Johansen',        email = 'einar_j_93@hotmail.com',       phone = '48239655' WHERE name = 'Salten Birøkterlag';

-- Vestfold
UPDATE public.bee_associations SET contact_person = 'Erik Pedersen',         email = 'erikepc01@gmail.com',          phone = '92030951' WHERE name = 'Larvik og Omegn Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Jørn Skaane',           email = 'jorn.skaane@gmail.com',        phone = '48102409' WHERE name = 'Nordre Vestfold Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Svein Erik Numme',      email = 'snumme@yahoo.no',              phone = '92064435' WHERE name = 'Sandar Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Odd Arne Gaarder',      email = 'oagaarder@gmail.com',          phone = '90891398' WHERE name = 'Tønsberg og Omegn Birøkterlag';

-- Østfold
UPDATE public.bee_associations SET contact_person = 'Halvor Fjeld',          email = 'halvor@fjeld-gard.no',         phone = '92656916', facebook_url = 'https://www.facebook.com/groups/488181428779417' WHERE name = 'Borgen og Omegn Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Bart-Kees Otten',       email = 'bkotten@live.no',              phone = '92661408' WHERE name = 'Eidsberg og Marker Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Nina Frønsdal Bøckmann',email = 'ninaboekmann@gmail.com',       phone = '41220774', facebook_url = 'https://www.facebook.com/groups/1401241246867385' WHERE name = 'Fredrikstad Birøkterlag';

-- Oslo / Akershus
UPDATE public.bee_associations SET contact_person = 'Eva Johansen',          email = 'eva.storen@gmail.com',         phone = '98109552' WHERE name = 'Asker Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Ole Markussen',         email = 'olenyborgmarkussen@hotmail.com', phone = '40553077' WHERE name = 'Aurskog-Høland Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Arwin Khoshnewiszadeh', email = 'arwin.khosh@gmail.com',        phone = '46116168' WHERE name = 'ByBi Oslo Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Leiv Roald Stensen',    email = 'lerost@live.no',               phone = '95106128' WHERE name = 'Bærum Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Øyvind Smedseng',       email = 'lb8ge@yahoo.no',               phone = '90043645' WHERE name = 'Eidsvoll Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Trond Bylterud',        email = 'sibylter@online.no',           phone = '91162383' WHERE name = 'Enebakk Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Svein Olaf Heggedal',   email = 'oheggeda@online.no',           phone = '93066323' WHERE name = 'Fet Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Roar Andre Øimo',       email = 'roaroimo@gmail.com',           phone = '92804878' WHERE name = 'Hurdal Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Elisabeth Munthe',      email = 'elisabeth.munthe@gmail.com',   phone = '92405075' WHERE name = 'Nedre Romerike Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Arild Hansen',          email = 'arildhansen77@hotmail.no',     phone = '90761586' WHERE name = 'Oslo og Omegnen Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Tor Øvrum',             email = 'honningfarmen@gmail.com',      phone = '92278768' WHERE name = 'Raumnes Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Christin Retvedt',      email = 'christin@retvedt.no',          phone = '91138255' WHERE name = 'Ski og Omegn Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Olav J. Ramse',         email = 'olav@romerikshonning.no',      phone = '48286692' WHERE name = 'Ullensaker Birøkterlag';
UPDATE public.bee_associations SET contact_person = 'Ragnar Joakim Nese',    email = 'lyserealv@gmail.com',          phone = '97163332', facebook_url = 'https://www.facebook.com/groups/226004937813352' WHERE name = 'Ås og Omegn Birøkterlag';

-- ============================================================
-- STEP 4: Sett inn manglende lokallag
-- ============================================================
INSERT INTO public.bee_associations (name, county, type, website, email, phone, contact_person) VALUES
-- Buskerud
('Numedal Birøkterlag',              'Buskerud',             'lokal', NULL,                          'monabo@outlook.com',             '93091018', 'Mona Britt Borgersen'),
('Ringerikes Birøkterlag',           'Buskerud',             'lokal', 'https://ringbi.no',           'carsten@trelyst.no',             '96756969', 'Carsten Elbe'),
('Sigdal Birøkterlag',               'Buskerud',             'lokal', NULL,                          'perfr@bfk.no',                   '99480525', 'Per Lyder Frøvoll'),
('Ytre Sandsvær Birøkterlag',        'Buskerud',             'lokal', NULL,                          'rune.eid@gmail.com',             '92646798', 'Rune Eid'),
-- Hedmark
('Eidskog Birøkterlag',              'Innlandet (Hedmark)',  'lokal', 'https://eidbi.no',            'aecorn@gmail.com',               '98099595', 'Carl Franklin Corneil'),
('Odal Birøkterlag',                 'Innlandet (Hedmark)',  'lokal', NULL,                          'gudrun@bikubeluba.no',            '90971600', 'Gudrun Grydeland'),
('Solør Birøkterlag',                'Innlandet (Hedmark)',  'lokal', NULL,                          'olsen-jan@outlook.com',          '91167186', 'Jan Olsen'),
('Østerdal Birøkterlag',             'Innlandet (Hedmark)',  'lokal', NULL,                          'torerik.rodsdalen@gmail.com',    '95135663', 'Tor Erik Rødsdalen'),
-- Oppland
('Biri og Snertingdal Birøkterlag',  'Innlandet (Oppland)', 'lokal', NULL,                          'lise.overjordet@moelven.com',    '48196280', 'Lise Øverjordet'),
('Gjøvik og Toten Birøkterlag',      'Innlandet (Oppland)', 'lokal', NULL,                          'geirfrode63@gmail.com',          '48060542', 'Geir Frode Johansen'),
('Gudbrandsdal Birøkterlag',         'Innlandet (Oppland)', 'lokal', NULL,                          'kamlom14@outlook.com',           '41764323', 'Kjell Arne Morken'),
('Hadeland Birøkterlag',             'Innlandet (Oppland)', 'lokal', NULL,                          'oyvstra@gmail.com',              '91804402', 'Øyvind Strand'),
('Valdres Birøkterlag',              'Innlandet (Oppland)', 'lokal', NULL,                          'e-bringsli@hotmail.com',         '46680058', 'Erlend Bringsli'),
-- Telemark
('Midt-Telemark Birøkterlag',        'Telemark',             'lokal', NULL,                          'gunleikvibeto@gmail.com',        '48023415', 'Gunleik Vibeto'),
('Notodden Birøkterlag',             'Telemark',             'lokal', NULL,                          'hal.kasin@outlook.com',          '90874581', 'Halvor T. Kåsin'),
('Porsgrunn Birøkterlag',            'Telemark',             'lokal', NULL,                          'toh-lars@online.no',             '95120145', 'Thorbjørn M Larsen'),
('Sannidal Birøkterlag',             'Telemark',             'lokal', NULL,                          'tro.ols3@hotmail.com',           '97090899', 'Trond Olsen'),
('Siljan Birøkterlag',               'Telemark',             'lokal', NULL,                          'tobiasruud@hotmail.com',         '94805155', 'Tobias Ruud'),
('Skien Birøkterlag',                'Telemark',             'lokal', NULL,                          'henrik@rosenvold.no',            '99706335', 'Henrik Rosenvold'),
-- Aust-Agder
('Froland Birøkterlag',              'Agder',                'lokal', NULL,                          'aloevjom@online.no',             '91346684', 'Alf Løvjomås'),
('Otra Birøkterlag',                 'Agder',                'lokal', NULL,                          'steinar@bjellas.no',             '99799823', 'Steinar Bjellås'),
('Sand Birøkterlag',                 'Agder',                'lokal', NULL,                          'vivian.stolen@gmail.com',        '45212551', 'Vivian Stølen'),
('Åmli Birøkterlag',                 'Agder',                'lokal', NULL,                          'odd.arvid.bjornbakk@gmail.com',  '45386843', 'Odd Arvid Bjørnbakk'),
('Østre Agder Birøkterlag',          'Agder',                'lokal', NULL,                          'honningmoen@outlook.com',        '95757490', 'Helene Songedal'),
-- Vest-Agder
('Hægeland Birøkterlag',             'Agder',                'lokal', NULL,                          'anna.he@online.no',              '91382835', 'Anna Heggland'),
('Kristiansand Birøkterlag',         'Agder',                'lokal', NULL,                          'martin.traelandshei@gmail.com',  '97178771', 'Martin Trælandshei'),
('Kvinesdal Birøkterlag',            'Agder',                'lokal', NULL,                          'tomtob@online.no',               '41564461', 'Tom Arne Tobiassen'),
('Lindesnes Birøkterlag',            'Agder',                'lokal', NULL,                          'siri@fjeldheimgard.no',          '91139059', 'Siri Cathrine Rølland'),
('Søgne og Songdalen Birøkterlag',   'Agder',                'lokal', NULL,                          'karstenskarpeid@live.no',        '93640442', 'Karsten Skarpeid'),
-- Vestland / Hordaland
('Hardanger Birøkterlag',            'Vestland (Hordaland)', 'lokal', NULL,                          'solrun.borve@ineos.com',         '91750866', 'Solrun Børve'),
('Sunnhordland Birøktarlag',         'Vestland (Hordaland)', 'lokal', NULL,                          'trond.arnevik@gmail.com',        '46623899', 'Trond Arnevik'),
-- Møre og Romsdal (alle mangler i seed)
('Averøy Birøkterlag',               'Møre og Romsdal',      'lokal', NULL,                          'karianne.thygesen@gmail.com',    '98834466', 'Kari-Anne Forsmo Thygesen'),
('Molde og omland Birøktarlag',      'Møre og Romsdal',      'lokal', NULL,                          'Sveingod@gmail.com',             '95817444', 'Sveinung Godø'),
('Nordmøre Birøktarlag',             'Møre og Romsdal',      'lokal', NULL,                          'erik.skjotskift@gmail.com',      '92040084', 'Erik Skjøtskift'),
('Smøla Birøkterlag',                'Møre og Romsdal',      'lokal', NULL,                          'kystgull@gmail.com',             '41205320', 'Lars Magne Roksvåg'),
('Sunnmøre Birøktarlag',             'Møre og Romsdal',      'lokal', NULL,                          'geirmund.o@gmail.com',           '40047980', 'Geirmund Oltedal'),
('Vestre Sunnmøre Birøktarlag',      'Møre og Romsdal',      'lokal', NULL,                          'torhild.oie@gmail.com',          '45027839', 'Torhild Øie'),
-- Trøndelag
('Fosen Birøkterlag',                'Trøndelag',            'lokal', NULL,                          'hanna@haagaas.com',              '99555124', 'Hanna Maria Pfarr Haagaas'),
('Hitra og Frøya Birøkterlag',       'Trøndelag',            'lokal', NULL,                          'g-maoe@online.no',               '92032997', 'Gunhild Øyen'),
('Inderøy Birøkterlag',              'Trøndelag',            'lokal', NULL,                          'idar_stavran@hotmail.com',       '98206874', 'Idar Stavran'),
('Levanger Birøkterlag',             'Trøndelag',            'lokal', NULL,                          'lleithe@hotmail.com',            '41762914', 'Linda Leithe'),
('Malvik Birøkterlag',               'Trøndelag',            'lokal', NULL,                          'paul.gjervan@saksvik.no',        '90587903', 'Paul Gjervan'),
('Trondheim og omland Birøkterlag',  'Trøndelag',            'lokal', NULL,                          'karambraut@gmail.com',           '90261991', 'Kent-Andre Rambraut'),
-- Nordland
('Vesterålen Birøkterlag',           'Nordland',             'lokal', NULL,                          'frank.ludvigsen@vkbb.no',        '99094208', 'Frank Ludvigsen'),
-- Troms (lokallag — fylkeslaget er omdøpt til Troms Fylkeslag)
('Troms Birøkterlag',                'Troms',                'lokal', NULL,                          'knut.eide.65@gmail.com',         '40029700', 'Knut Eide'),
-- Østfold
('Halden og Omegn Birøkterlag',      'Østfold',              'lokal', 'https://haldenbi.no',         'l-lar2@online.no',               '92453083', 'Lars Larsen'),
('Indre Østfold Birøkterlag',        'Østfold',              'lokal', NULL,                          'viviana_reimundo@hotmail.com',   '90759803', 'Viviana Reimundo'),
('Rakkestad Birøkterlag',            'Østfold',              'lokal', NULL,                          'svanhild@live.no',               '41254449', 'Svanhild Fosser'),
('Råde Birøkterlag',                 'Østfold',              'lokal', NULL,                          'runar@ottesen.net',              '93441081', 'Runar Ottesen'),
('Skiptvet Birøkterlag',             'Østfold',              'lokal', NULL,                          'haugsbraten@gmail.com',          '90540774', 'Alexander Berntsen'),
('Tune og omegn Birøkterlag',        'Østfold',              'lokal', NULL,                          'jens.nybole@bier.no',            '92097748', 'Jens Martin Nybøle');

-- Facebook URLs for nye lokallag
UPDATE public.bee_associations SET facebook_url = 'https://www.facebook.com/groups/2250993625045450' WHERE name = 'Vesterålen Birøkterlag';
UPDATE public.bee_associations SET facebook_url = 'https://www.facebook.com/groups/2020697621548620/' WHERE name = 'Fosen Birøkterlag';
UPDATE public.bee_associations SET facebook_url = 'https://www.facebook.com/bierimalvik/' WHERE name = 'Malvik Birøkterlag';
UPDATE public.bee_associations SET facebook_url = 'https://www.facebook.com/HadelandBirokterlag/' WHERE name = 'Hadeland Birøkterlag';

-- ============================================================
-- STEP 5: Koble lokallag til fylkeslag via parent_id
-- ============================================================

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Aust-Agder Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Froland Birøkterlag','Otra Birøkterlag','Sand Birøkterlag','Åmli Birøkterlag','Østre Agder Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Buskerud Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Drammen og omegns Birøkterlag','Eiker Birøkterlag','Hallingdal Birøkterlag','Kongsberg og Sandsvær Birøkterlag','Lier, Røyken og Hurum Birøkterlag','Modum Birøkterlag','Numedal Birøkterlag','Ringerikes Birøkterlag','Sigdal Birøkterlag','Ytre Sandsvær Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Hedmark Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Eidskog Birøkterlag','Elverum og Omegn Birøkterlag','Odal Birøkterlag','Ringsaker Birøkterlag','Solør Birøkterlag','Stange Birøkterlag','Østerdal Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Oppland Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Biri og Snertingdal Birøkterlag','Gjøvik og Toten Birøkterlag','Gudbrandsdal Birøkterlag','Hadeland Birøkterlag','Land og Etnedal Birøkterlag','Lillehammer Birøkterlag','Toten Birøkterlag','Valdres Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Vestfold Fylkes Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Larvik og Omegn Birøkterlag','Nordre Vestfold Birøkterlag','Sandar Birøkterlag','Tønsberg og Omegn Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Telemark Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Bamble Birøkterlag','Drangedal Birøkterlag','Midt-Telemark Birøkterlag','Notodden Birøkterlag','Porsgrunn Birøkterlag','Sannidal Birøkterlag','Siljan Birøkterlag','Skien Birøkterlag','Treungen Birøktarlag','Vest-Telemark Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Østfold Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Borgen og Omegn Birøkterlag','Eidsberg og Marker Birøkterlag','Fredrikstad Birøkterlag','Halden og Omegn Birøkterlag','Indre Østfold Birøkterlag','Rakkestad Birøkterlag','Råde Birøkterlag','Skiptvet Birøkterlag','Tune og omegn Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Vest-Agder Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Bjelland, Grindheim og Åser Birøkterlag','Eiken Birøkterlag','Hægeland Birøkterlag','Kristiansand Birøkterlag','Kvinesdal Birøkterlag','Lindesnes Birøkterlag','Lister Birøkterlag','Songdalen Birøkterlag','Søgne og Songdalen Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Rogaland Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Haugaland Birøkterlag','Jæren Birøkterlag','Karmøy Birøkterlag','Lund Birøkterlag','Ryfylke Birøkterlag','Sokndal Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Hordaland Birøktarlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Bergen og Omegn Birøkterlag','Hardanger Birøkterlag','Sunnhordland Birøktarlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Sogn og Fjordane Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Fjordane Birøkterlag','Sogn Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Møre og Romsdal Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Averøy Birøkterlag','Molde og omland Birøktarlag','Nordmøre Birøktarlag','Smøla Birøkterlag','Sunnmøre Birøktarlag','Vestre Sunnmøre Birøktarlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Trøndelag Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Fosen Birøkterlag','Hitra og Frøya Birøkterlag','Inderøy Birøkterlag','Levanger Birøkterlag','Malvik Birøkterlag','Nord-Innherred Birøkterlag','Orkdal og Omegn Birøkterlag','Snåsa Birøkterlag','Stjørdal Birøkterlag','Trondheim og omland Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Nordland Birøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Helgeland Birøkterlag','Lofoten Birøkterlag','Salten Birøkterlag','Vesterålen Birøkterlag');

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Troms Fylkeslag' AND type = 'fylke' LIMIT 1)
  WHERE name = 'Troms Birøkterlag' AND type = 'lokal';

UPDATE public.bee_associations SET parent_id = (SELECT id FROM public.bee_associations WHERE name = 'Oslo og Akershus Fylkesbirøkterlag' AND type = 'fylke' LIMIT 1)
  WHERE name IN ('Asker Birøkterlag','Aurskog-Høland Birøkterlag','ByBi Oslo Birøkterlag','Bærum Birøkterlag','Eidsvoll Birøkterlag','Enebakk Birøkterlag','Fet Birøkterlag','Hurdal Birøkterlag','Nedre Romerike Birøkterlag','Oslo og Omegnen Birøkterlag','Raumnes Birøkterlag','Ski og Omegn Birøkterlag','Ullensaker Birøkterlag','Ås og Omegn Birøkterlag');
