import { Disease } from '@/types';

const BASE = 'https://zujvhbnuqocquthbujmp.supabase.co/storage/v1/object/public/disease-images/';

export const DISEASES: Disease[] = [
  {
    id: '1',
    slug: 'varroamidd',
    nameNo: 'Varroamidd',
    isNotifiable: false,
    severity: 'alvorlig',
    description:
      'Varroamidd (Varroa destructor) er den alvorligste parasitten i norsk birøkt. Den suger blod fra bier og yngel, svekker immunforsvaret og sprer virus.',
    symptoms:
      'Misdannede vinger (deformed wing virus), krympede bier, larver som dør i celler, synlige rødbrune midd på bienes bakkropp.',
    treatment:
      'Oksalsyre (vinterstid når det er yngelfritt), maursyre (gjennom forseglet yngel), ApiLife Var (timol) eller Apivar (amitraz, krever godkjenningsfritak). Kombinér alltid med tellemetode for å vurdere tetthet.',
    prevention:
      'Regelmessig varroatelling (limbunn, vaskemetode eller sukkerpuder). Svermeforebygging reduserer yngelmengde og gir naturlig behandlingsvindu.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}varroamidd-01.png?v=1`, caption: 'Varroamidd på bie — nærbilde', bg: '#F5F0FF' },
      { uri: `${BASE}varroamidd-02.png?v=1`, caption: 'Nærbilde av Varroa destructor', bg: '#FFF0F0' },
      { uri: `${BASE}varroamidd-03.png?v=1`, caption: 'Bie med misdannede vinger og varroamidd', bg: '#F0F8FF' },
    ],
  },
  {
    id: '2',
    slug: 'kalkyngel',
    nameNo: 'Kalkyngel',
    isNotifiable: false,
    severity: 'moderat',
    description:
      'Kalkyngel (Ascosphaera apis) er en soppinfeksjon som dreper forseglet og åpen yngel. Kadaverene stivner til hvite eller svarte kalk-lignende klumper.',
    symptoms:
      'Hvite, kritt-aktige larver i eller utenfor cellene. Kan ligne tørket kalk. Svarte kadavere indikerer sporesporulering.',
    treatment:
      'Ingen godkjent kjemisk behandling. Bytt dronning til en mer hygienisk rase. Sørg for god ventilasjon, unngå fuktighet i kuben.',
    prevention:
      'Hygieniske bier (f.eks. Buckfast) fjerner smittet yngel raskt. Unngå overcrowding og dårlig ventilasjon.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}kalkyngel-01.png?v=1`, caption: 'Ascosphaera apis — soppsporet som forårsaker kalkyngel', bg: '#F8F8F8' },
      { uri: `${BASE}kalkyngel-02.png?v=1`, caption: 'Hvite, kritt-aktige larver i åpne celler', bg: '#F0F0F0' },
      { uri: `${BASE}kalkyngel-03.png?v=1`, caption: 'Svarte kadavere ved sporulering — høy smitterisiko', bg: '#FAF5E4' },
    ],
  },
  {
    id: '3',
    slug: 'europeisk-yngelraate',
    nameNo: 'Europeisk yngelråte',
    isNotifiable: true,
    severity: 'alvorlig',
    description:
      'Europeisk yngelråte (EFB) skyldes bakterien Melissococcus plutonius. Rammer åpen yngel og gir tap av yngelrammer og kolonier.',
    symptoms:
      'Gul til brun, myk og illeluktende yngel. Larvene dør i inngangen til cellen, ofte med vridd posisjon. Flekkete yngelbilde.',
    treatment:
      'Oksytetrasyklinbehandling (veterinærpåkrevet i Norge). Dronningbytte og syklusbryting kan hjelpe i milde tilfeller.',
    prevention:
      'Unngå stress på kolonien (sulting, trangboddhet). Bruk av hygieniske bier. Behandle med antibiotika kun etter veterinærdirektiv.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}europeisk-yngelraate-01.png?v=1`, caption: 'Europeisk yngelråte — gulfargede, misformede larver', bg: '#FFFDE7' },
      { uri: `${BASE}europeisk-yngelraate-02.png?v=1`, caption: 'Kliniske symptomer på EFB i åpne celler', bg: '#FFF8E1' },
      { uri: `${BASE}europeisk-yngelraate-03.png?v=1`, caption: 'Flekkete yngelbilde med tomme og fylte celler', bg: '#FFF3E0' },
    ],
  },
  {
    id: '4',
    slug: 'amerikansk-yngelraate',
    nameNo: 'Amerikansk yngelråte',
    isNotifiable: true,
    severity: 'kritisk',
    description:
      'Amerikansk yngelråte (AFB) er forårsaket av Paenibacillus larvae og er den mest ødeleggende biysykdommen. Sporene overlever i over 50 år og smitter alt utstyr.',
    symptoms:
      'Forseglet yngel med innsunkne, misfargede lokk. Kakebrun, seig masse med karakteristisk, søt-råtten lukt. Tråddtrekk ved pinnetest (>2 cm). Mørkfarget larverester.',
    treatment:
      'Ingen godkjent behandling i Norge. Kolonien og alt trevirke MÅ brennes. Metall og glass kan steriliseres. Mattilsynet MÅ varsles umiddelbart.',
    prevention:
      'Kjøp kun utstyr og pakker fra godkjente kilder. Desinfiser alltid brukt utstyr. Meld mistanke til Mattilsynet.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}amerikansk-yngelraate-01.png?v=1`, caption: 'AFB i kaker — innsunkne lokk og mørke avleiringer', bg: '#FFF8E1' },
      { uri: `${BASE}amerikansk-yngelraate-02.png?v=1`, caption: 'Innsunkne lokk og seig tråddtrekksmasse', bg: '#FFF3E0' },
      { uri: `${BASE}amerikansk-yngelraate-03.png?v=1`, caption: 'Yngel angrepet av Paenibacillus larvae', bg: '#FBE9E7' },
    ],
  },
  {
    id: '5',
    slug: 'sekkyngelvirus',
    nameNo: 'Sekkyngelvirus',
    isNotifiable: false,
    severity: 'lav',
    description:
      'Sekkyngelvirus (SBV – Sacbrood virus) er et vanlig bievirus som normalt holder seg på et lavt nivå. Kraftige utbrudd er sjeldne.',
    symptoms:
      'Forseglet yngel med gule, posesekk-lignende larver fulle av væske. Innsunkne lokk med hull. Tørkede larver forblir i cellene.',
    treatment:
      'Ingen spesifikk behandling. Sterk koloni bekjemper normalt viruset selv. Dronningbytte kan hjelpe ved vedvarende problemer.',
    prevention:
      'Unngå stress. Varroabehandling reduserer sekundærinfeksjoner. Hygieniske bier fjerner sykt yngel raskt.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}sekkyngelvirus-01.png?v=1`, caption: 'Sekkyngelvirus — syke larver i kaker', bg: '#FFFDE7' },
      { uri: `${BASE}sekkyngelvirus-02.png?v=1`, caption: 'Typiske symptomer: posesekk-form og innsunkne lokk', bg: '#F8F9FA' },
      { uri: `${BASE}sekkyngelvirus-03.png?v=1`, caption: 'Tørkede larveskal som forblir i cellene', bg: '#F3F8FF' },
    ],
  },
  {
    id: '6',
    slug: 'nosema',
    nameNo: 'Nosema',
    isNotifiable: false,
    severity: 'moderat',
    description:
      'Nosema (Nosema apis og N. ceranae) er mikrosporie-infeksjoner i biers fordøyelseskanal. N. ceranae er nå den dominerende arten og kan gi stille nedgang uten tydelige symptomer.',
    symptoms:
      'Diare (brun flekkete front), unormalt mange bier som dør om vinteren/våren, svak vekst om våren. N. ceranae gir ofte få synlige symptomer.',
    treatment:
      'Fumagillin brukes i noen land, men er ikke godkjent i Norge. Dronningbytte og sterk sommerkoloni er beste tilnærming.',
    prevention:
      'Unngå lang vinterstid på gamle vokskaker. Sørg for god vinterforsyning av mat. Flytt kuber til tidlig blomstring om mulig.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}nosema-01.png?v=1`, caption: 'Nosema apis-infeksjon — forskningsbilde', bg: '#F5F0FF' },
      { uri: `${BASE}nosema-02.png?v=1`, caption: 'Brunflekkete front og fluktplate — tegn på dysenteri', bg: '#FFF8E1' },
      { uri: `${BASE}nosema-03.png?v=1`, caption: 'Kolonien krymper unormalt raskt tidlig vår', bg: '#F0F4FF' },
    ],
  },
  {
    id: '7',
    slug: 'tropilaelaps',
    nameNo: 'Tropilaelaps',
    isNotifiable: true,
    severity: 'kritisk',
    description:
      'Tropilaelaps (Tropilaelaps clareae/mercedesae) er asiatiske parasittmidd som ikke er påvist i Norge. Funn skal umiddelbart meldes til Mattilsynet. Potensielt verre enn Varroa.',
    symptoms:
      'Lignende Varroa: misdannede vinger, svekket yngel. Midd er mindre enn Varroa og beveger seg raskere. Krever laboratoriebekreftelse.',
    treatment:
      'Ikke aktuelt i Norge. Ved mistanke: isolér kuben og kontakt Mattilsynet umiddelbart.',
    prevention:
      'Ikke importer bier fra Asia. Inspiser alltid importerte bier. Meld all mistanke til Mattilsynet.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}tropilaelaps-01.png?v=1`, caption: 'Tropilaelaps på honningbier — misdannet bie synlig (CSIRO)', bg: '#FFF0F0' },
      { uri: `${BASE}tropilaelaps-02.png?v=1`, caption: 'Apis mellifera-larver infisert av Tropilaelaps mercedesae', bg: '#F0F8FF' },
      { uri: `${BASE}tropilaelaps-03.png?v=1`, caption: 'Yngel angrepet av Tropilaelaps — typisk skademønster', bg: '#FFF5F5' },
    ],
  },
  {
    id: '8',
    slug: 'voksmoell',
    nameNo: 'Voksmøll',
    isNotifiable: false,
    severity: 'lav',
    description:
      'Voksmøll (stor: Galleria mellonella, liten: Achroia grisella) er møll som legger egg i kuber. Larvene ødelegger voks og yngeltrekk, men angriper sjelden sterke kolonier.',
    symptoms:
      'Grå, silkete tunneler og tråder i voksen. Sølvfarget larvehud. Yngeltrekket ser ut som ost (Swiss-cheese). Sterk koloni bekjemper normalt selv.',
    treatment:
      'Fjern og bren angrepte kaker. Frys tomme kaker (-18°C i 24 timer) for å drepe egg og larver. Rengjør kubekroppen.',
    prevention:
      'Hold sterke kolonier – svake kolonier klarer ikke å beskytte alt voks. Frys og lagre tomme kaker riktig. Tett alle sprekker i kuben.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}voksmoell-01.png?v=1`, caption: 'Voksmøll (Galleria mellonella) — voksen møll', bg: '#F8F8F8' },
      { uri: `${BASE}voksmoell-02.png?v=1`, caption: 'Voksmølllarve som ødelegger kaken', bg: '#F5F5F0' },
      { uri: `${BASE}voksmoell-03.png?v=1`, caption: 'Kokonger festet til kubeveggen', bg: '#FFFDE7' },
    ],
  },
  {
    id: '9',
    slug: 'maur',
    nameNo: 'Maur',
    isNotifiable: false,
    severity: 'lav',
    description:
      'Maur invaderer kuber på jakt etter honning og varme. Sterke kolonier forsvarer seg selv, men svake kolonier kan bli overveldet.',
    symptoms:
      'Synlige maur inne i kuben, særlig i bunnbrettet. Bier som virker urolige. Honningtap.',
    treatment:
      'Sett kuben på bein med maurkopper (olje, vann eller limfeller rundt benene). Rengjør omgivelsene rundt kubestandplassen.',
    prevention:
      'Bruk kubebein med feller. Ikke plasser kuber direkte på bakken. Fjern vegetasjon rundt kubeunderlaget.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}maur-01.png?v=1`, caption: 'Skogmaur (Formica rufa) — en av artene som angriper svake kuber', bg: '#FFF8E1' },
      { uri: `${BASE}maur-02.png?v=1`, caption: 'Maurskåler med olje rundt kubeben', bg: '#F0FFF4' },
      { uri: `${BASE}maur-03.png?v=1`, caption: 'Vegetasjon rundt kuben gir maur adgang', bg: '#F0F8F0' },
    ],
  },
  {
    id: '10',
    slug: 'mus',
    nameNo: 'Mus',
    isNotifiable: false,
    severity: 'lav',
    description:
      'Mus søker varme og mat i kuber om vinteren. De ødelegger kaker og forurenser kuben med avføring, noe som stresser overvintrende kolonier.',
    symptoms:
      'Biter i voks og propolis. Museavføring i bunnbrettet. Gnageskader på kubekassene. Urolige vinterklynger.',
    treatment:
      'Fjerning av musen ved hjelp av musefeller. Grundig rengjøring av kuben etter angrep.',
    prevention:
      'Sett inn muserist (åpning maks 9–10 mm) i flyåpningen ved innvintring. Fjern alle inngangspunkter for mus.',
    thumbnailPath: null,
    photos: [
      { uri: `${BASE}mus-01.png?v=1`, caption: 'Husmus (Mus musculus) — søker varme og mat i kuber om vinteren', bg: '#F8F8F8' },
      { uri: `${BASE}mus-02.png?v=1`, caption: 'Gnageskader på kubekasse og kaker', bg: '#F5F0E8' },
      { uri: `${BASE}mus-03.png?v=1`, caption: 'Muserist i flyåpning — maks 9–10 mm høyde', bg: '#F0F8FF' },
    ],
  },
  {
    id: '11',
    slug: 'liten-kubebille',
    nameNo: 'Liten kubebille',
    isNotifiable: true,
    severity: 'kritisk',
    description:
      'Liten kubebille (Aethina tumida) er en eksotisk skadegjører som ennå ikke er påvist i Norge. Larvene borer seg gjennom kaker, ødelegger honning og pollen, og kan få hele kolonien til å kollapse. Påvisning er meldepliktig til Mattilsynet (A-sykdom) og må varsles umiddelbart ved mistanke.',
    symptoms:
      'Små (5–7 mm) mørkebrune til svarte biller som løper raskt unna lys på bunnbrett og mellom rammer. Hvite larver med ryggpigger i kakene. Gjæret, slimete honning som renner ut av cellene og lukter råtne appelsiner.',
    treatment:
      'Ingen behandling i Norge — påvisning utløser offentlig bekjempelse. Mistanke MÅ varsles Mattilsynet umiddelbart (tlf. 22 40 00 00). Ikke flytt kuber, utstyr eller bifolk ved mistanke.',
    prevention:
      'Kjøp aldri bier eller brukt utstyr fra utlandet uten godkjenning. Kontroller bunnbrett jevnlig for raske, mørke biller. Vær ekstra årvåken i importutsatte områder og havnenære standplasser.',
    thumbnailPath: null,
    // Emoji-fallback — det finnes ingen opplastede bilder for kubebille ennå
    photos: [
      { emoji: '🪲', caption: 'Aethina tumida — voksen liten kubebille', bg: '#F5F0E8' },
      { emoji: '🐛', caption: 'Billelarver med ryggpigger i ødelagt kake', bg: '#FFF8E1' },
    ],
  },
];
