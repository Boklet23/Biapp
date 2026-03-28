-- Sykdomsdata — kjør ETTER initial schema
-- 10 birøkt-relevante tilstander, 2 meldepliktige

insert into diseases (slug, name_no, is_notifiable, severity, description, symptoms, treatment, prevention) values
(
  'varroa',
  'Varroa',
  false,
  'alvorlig',
  'Varroa destructor er en parasittisk midd som er den vanligste og alvorligste parasittiske trussel mot honningbier i Norge. Den lever og formerer seg på bienes larver og pupper.',
  'Misdannede vinger (deformert vingesyndrom), bier med kortere abdomen, synlige midder på bier og rammene, redusert biestyrke og populasjonsnedgang.',
  'Oksalsyre (Oxalic acid) er godkjent behandling i Norge. Behandles mest effektivt om høsten når det er lite yngel. Maursyre brukes om sommeren. Telle fall for å vurdere behandlingsbehov.',
  'Regelmessig varroatelling (sukkerpudringsmetode eller alkoholvask). Bruk av dronningbur i perioder for å bryte yngelperioden. Velg varroa-tolerante bieslag.'
),
(
  'kalkyngel',
  'Kalkyngel (Ascosphaera apis)',
  false,
  'moderat',
  'Soppsykdom som angriper bienes larver og gjør dem til kalkaktige, hvite eller grå klumper. Vanlig i fuktige forhold og svake folk.',
  'Hvite eller svarte stenharde larveklumper i og rundt kubeinngangen. Rammene kan vise spredte døde larver. Sterkest synlig om våren.',
  'Bedre ventilasjon i kuba. Bytt ut gamle rammer. Sterk biestyrke motvirker infeksjonen. Dronningskifte til mer hygienisk bierase.',
  'God ventilasjon og tørre forhold. Unngå overbefolkning. Bruk hygieniske bieslag.'
),
(
  'europeisk-yngelraate',
  'Europeisk yngelråte (Melissococcus plutonius)',
  false,
  'alvorlig',
  'Bakteriesykdom som angriper unge larver. Vanlig i Europa. Kan forveksles med amerikansk yngelråte, men er ikke meldepliktig.',
  'Gule eller brune visne larver i åpne celler. Larvene er ikke trådtrekkende. Sur lukt. Uregelmessig yngelbilde.',
  'Fôring med antibiotika (kun av veterinær). Skifte av dronning og rammer. Bortfall av visse sykdomsår. Sterk folk klarer seg gjerne selv.',
  'Holde sterke og sunne folk. Hygienisk avl. Dronningskifte.'
),
(
  'amerikansk-yngelraate',
  'Amerikansk yngelråte (Paenibacillus larvae)',
  true,
  'kritisk',
  'MELDEPLIKTIG. Den mest ødeleggende birøktsykdommen. Dannes sporer som kan overleve i 40+ år i utstyr. Meldepliktig til Mattilsynet. Bekjempelse er lovpålagt.',
  'Trådtrekkende brun masse i forseglete celler (kakaotest). Sur fiskaktig lukt. Forseglet yngel har sunket, mørket og hull. Uregelmessig yngelbilde.',
  'Meldes umiddelbart til Mattilsynet. Alt utstyr brennes eller autoklaveres. Biene kan i noen tilfeller reddes via antibiotika-behandling under tilsyn av Mattilsynet.',
  'Aldri bytte utstyr mellom ukjente folk. Kjøp bare utstyr fra pålitelige kilder. Regelmessig kontroll. Dypp alltid brukte rammer i 5% natriumhypokloritt-løsning.'
),
(
  'sekkyngelvirus',
  'Sekkyngelvirus (Sacbrood)',
  false,
  'moderat',
  'Virussykdom der infiserte larver ikke klarer å fullføre puppeforvandlingen og dør som gule, væskefylte "sekker".',
  'Dødelige larver i forseglete og åpne celler. Mørkt hodet, gult til brunt skinn som er lett å fjerne. Lite lukt.',
  'Ingen direkte behandling. Dronningskifte til mer motstandsdyktig bierase. Sterke folk klarer gjerne infeksjonen selv.',
  'Unngå svake folk. God ernæring og hygienisk avl hjelper.'
),
(
  'nosema',
  'Nosema (Nosema apis / ceranae)',
  false,
  'moderat',
  'Sopp-parasitt som angriper mellomtarmen til voksne bier. Reduserer bienes levealder og koloniytelse. Nosema ceranae er den vanligste formen i Norge nå.',
  'Bier med oppblåst bakkropp, diarré ved kubeåpning (Nosema apis). Svekkede folk om våren uten åpenbare andre årsaker. Bier som kryper foran kuba.',
  'Fumagillin er ikke lenger tillatt i Norge. Fokus på sterke folk med ung dronning. Bytt ut gamle rammer. Godt vårfôr.',
  'Holde unge og sunne dronninger. Bytt rammer regelmessig. Unngå langvarig vinterkonfinement.'
),
(
  'tropilaelaps',
  'Tropilaelaps (Tropilaelaps spp.)',
  true,
  'kritisk',
  'MELDEPLIKTIG. Eksotisk midd som ikke finnes i Norge ennå (per 2026), men er på Mattilsynets overvåkingsliste. Formerer seg raskere enn Varroa. Meldepliktig ved mistanke.',
  'Lik varroa-skade: misdannede vinger og bein, redusert populasjon. Skilles fra varroa ved å se under middens kropp (tropilaelaps er mer oval).',
  'Meldes umiddelbart til Mattilsynet ved mistanke. Behandlingsregime fastsettes av Mattilsynet. Oksalsyre er trolig effektiv.',
  'Streng grensekontroll. Ikke importer bier eller utstyr fra land der tropilaelaps er kjent.'
),
(
  'voksmoell',
  'Voksmøll (Galleria mellonella)',
  false,
  'lav',
  'Mølllarven lever av bivoks og kan ødelegge tomme rammer raskt. Er ikke farlig for sterke folk, men svake folk og lagrede rammer er sårbare.',
  'Silketråder og ekskrementspor i rammen. Tunneler gjennom kakene. Larver og møll ved rammen. Yngel "bridget" av silke.',
  'Sterk biestyrke er det beste forsvar. Rens og destruer angrepte rammer. Frys tomme rammer i 48 timer (-20°C) for å drepe egg og larver.',
  'Lagre tomme rammer frosset eller i lufttette beholdere. Hold sterke folk.'
),
(
  'maur',
  'Maur',
  false,
  'lav',
  'Maur kan etablere seg i og rundt kubene og plage biene, særlig svake folk. Maurtuer under kuba er et vanlig problem i varme sommermåneder.',
  'Maur i og rundt kuba, synlige maurtuer, bier som forstyrres i yngelpleien.',
  'Påfør motorolje, Vaseline eller spesielle insektbarrierer på kubefoten. Flytt kuba fra maurtue. Bruk kubefot med vannbeholder.',
  'Plasser kuba på kubefot med barrierer mot maur fra dag én.'
),
(
  'mus',
  'Mus',
  false,
  'lav',
  'Mus søker skjul i kuber om vinteren, ødelegger rammer og forstyrrer vinterbiene. Et relativt vanlig problem i norske kubér.',
  'Gnagespor på rammer, museekskrementene i kuba, tygging på isolasjon og rammer. Biene forstyrres og kan dø av kulde.',
  'Fjern mus umiddelbart. Rengjør og bytt ødelagte rammer. Sett muserist på kubeinngangen.',
  'Sett alltid muserist på kubeinngangen om høsten. Inspiser kubene regelmessig tidlig i sesongen.'
);
