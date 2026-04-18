import { Disease } from '@/types';

// Alle foto-URLer er fra Wikimedia Commons (CC-lisensiert / public domain)
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
      'Oksalsyre (vinterstid når det er yngelfritt), Apistan, ApiLife Var eller Apivar. Kombinér alltid med tellemetode for å vurdere tetthet.',
    prevention:
      'Regelmessig varroatelling (limbunn, vaskemetode eller sukkerpuder). Sværmforebygging reduserer yngelmengde og gir naturlig behandlingsvindu.',
    thumbnailPath: null,
    photos: [
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Varroa_destructor_on_honeybee_host.jpg',
        caption: 'Varroamidd på bie — elektronmikroskopbilde (USDA)',
        bg: '#F5F0FF',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Varroa_Mite.jpg',
        caption: 'Nærbilde av Varroa destructor (USDA)',
        bg: '#FFF0F0',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Honey_bee_with_Deformed_Wing_Virus_and_Varroa_destructor.jpg',
        caption: 'Bie med misdannede vinger og synlig varroamidd',
        bg: '#F0F8FF',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Abeilles-bees-treatment-varroa.jpg',
        caption: 'Bier reagerer på Apiguard-behandling mot Varroa',
        bg: '#FFF5E6',
      },
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Ascosphaera_apis_%28Maasen_ex_Claussen%29_L.S._Olive_%26_Spiltoir_1324048.jpg',
        caption: 'Ascosphaera apis — soppsporet som forårsaker kalkyngel',
        bg: '#F8F8F8',
      },
      { emoji: '⬜', caption: 'Hvite, kritt-aktige larver i åpne celler', bg: '#F0F0F0' },
      { emoji: '⬛', caption: 'Svarte kadavere ved sporulering', bg: '#FAF5E4' },
      { emoji: '🏚️', caption: 'Flekkete yngelbilde — typisk mønster', bg: '#F5F0EA' },
    ],
  },
  {
    id: '3',
    slug: 'europeisk-yngelraate',
    nameNo: 'Europeisk yngelråte',
    isNotifiable: false,
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/European_foulbrood_CZ.jpg',
        caption: 'Europeisk yngelråte — gulfargede, misformede larver',
        bg: '#FFFDE7',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/0/00/EFB_clinical_symptoms.jpg',
        caption: 'Kliniske symptomer på EFB i åpne celler',
        bg: '#FFF8E1',
      },
      { emoji: '🗺️', caption: 'Flekkete yngelbilde med tomme og fylte celler', bg: '#FFF3E0' },
      { emoji: '🔀', caption: 'Larver i vridd posisjon — karakteristisk for EFB', bg: '#FBE9E7' },
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/AFB_in_combs.jpg',
        caption: 'AFB i kaker — innsunkne lokk og mørke avleiringer',
        bg: '#FFF8E1',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Loque_americana.jpg',
        caption: 'Innsunkne lokk og seig tråddtrekksmasse',
        bg: '#FFF3E0',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Brood_Paenibacillus_larvae.jpg',
        caption: 'Yngel angrepet av Paenibacillus larvae',
        bg: '#FBE9E7',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Fuocoarnia.JPG',
        caption: 'Brenning av kube — eneste løsning ved AFB-funn',
        bg: '#FFEBEE',
      },
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Sacbrood_BHL41830855.jpg',
        caption: 'Sekkyngelvirus — syke larver i kaker (USDA, offentlig eiendom)',
        bg: '#FFFDE7',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Sacbrood_%28Page_17%29_BHL41830850.jpg',
        caption: 'Typiske symptomer: posesekk-form og innsunkne lokk',
        bg: '#F8F9FA',
      },
      { emoji: '🧊', caption: 'Tørkede larveskal som ligger i cellene', bg: '#F3F8FF' },
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Consequences_of_Nosema_apis_infection_for_male_honey_bees_and_their_fertility_-_Figure_1.webp',
        caption: 'Nosema apis-infeksjon hos droner — forskningsbilde',
        bg: '#F5F0FF',
      },
      { emoji: '💩', caption: 'Brunflekkete frontplate — typisk tegn på dysenteri', bg: '#FFF8E1' },
      { emoji: '📉', caption: 'Kolonien krymper unormalt raskt om våren', bg: '#F0F4FF' },
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/7/76/CSIRO_ScienceImage_7018_Asian_bee_mites_Tropilaelaps_sp_on_European_honey_bees_and_a_deformed_bee_top_left.jpg',
        caption: 'Tropilaelaps på honningbier — misdannet bie øverst til venstre (CSIRO)',
        bg: '#FFF0F0',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Apis_mellifera_larvae_infected_by_Tropilaelaps_mercedesae.png',
        caption: 'Apis mellifera-larver infisert av Tropilaelaps mercedesae',
        bg: '#F0F8FF',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Brood_of_Apis_mellifera_infested_by_Tropilaelaps.png',
        caption: 'Yngel angrepet av Tropilaelaps — typisk skademønster',
        bg: '#FFF5F5',
      },
      { emoji: '🚨', caption: 'Mistanke? Ring Mattilsynet: 22 40 00 00', bg: '#FFEBEE' },
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Galleria_mellonella_1.jpg',
        caption: 'Voksmøll (Galleria mellonella) — voksen',
        bg: '#F8F8F8',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Fausse_teigne_%28larve%29.jpg',
        caption: 'Voksmølllarve som ødelegger kaken',
        bg: '#F5F5F0',
      },
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Galleria_mellonella_cocoon%2C_grote_wasmot_cocon.jpg',
        caption: 'Kokonger festet til kubeveggen',
        bg: '#FFFDE7',
      },
      { emoji: '🕸️', caption: 'Silkete tunneler og tråder gjennom voksen', bg: '#F8F8F8' },
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Formica_rufa01.jpg',
        caption: 'Formica rufa (skogmaur) — en av artene som angriper svake kuber',
        bg: '#FFF8E1',
      },
      { emoji: '🫙', caption: 'Maurkopper med olje rundt kubeben', bg: '#F0FFF4' },
      { emoji: '🌿', caption: 'Vegetasjon rundt kuben gir maur adgang', bg: '#F0F8F0' },
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
      {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/House_mouse_%28Mus_musculus%29_2808.jpg',
        caption: 'Husmus (Mus musculus) — søker varme og mat i kuber om vinteren',
        bg: '#F8F8F8',
      },
      { emoji: '🕳️', caption: 'Gnageskader på kubekasse og kaker', bg: '#F5F0E8' },
      { emoji: '🔒', caption: 'Muserist i flyåpning — maks 9 mm høyde', bg: '#F0F8FF' },
    ],
  },
];
