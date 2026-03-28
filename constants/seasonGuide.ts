export interface SeasonMonth {
  month: number;
  icon: string;
  title: string;
  description: string;
  tasks: string[];
}

export const SEASON_GUIDE: SeasonMonth[] = [
  {
    month: 1,
    icon: '❄️',
    title: 'Januar',
    description: 'Biene sitter i vinterklynge. Minst mulig forstyrrelse.',
    tasks: [
      'Sjekk at kubeåpningen er fri for snø og is',
      'Kontroller fôrreserver (lytt etter summing)',
      'Vedlikehold og reparer utstyr innendørs',
      'Les og planlegg neste sesong',
    ],
  },
  {
    month: 2,
    icon: '🌨️',
    title: 'Februar',
    description: 'Tidlig egg­legging starter. Kolonien begynner å vokse forsiktig.',
    tasks: [
      'Vurder nødfôring hvis reserver er lave',
      'Rens bakplate for døde bier ved varm dag',
      'Sjekk at ventilasjon fungerer',
      'Bestill pakker og dronninger om nødvendig',
    ],
  },
  {
    month: 3,
    icon: '🌱',
    title: 'Mars',
    description: 'Første inspeksjon mulig på varme dager (>10°C). Kolonien ekspanderer.',
    tasks: [
      'Utfør første vårinseksjon ved +10°C',
      'Sjekk dronningstatus og yngelmengde',
      'Vurder fôring med kandissukker eller sirup',
      'Forbered kubekasser og rammer til sesong',
    ],
  },
  {
    month: 4,
    icon: '🌸',
    title: 'April',
    description: 'Aktiv vekstperiode. Sværmforebygging begynner.',
    tasks: [
      'Inspiser ukentlig – noter antall besatte rammer',
      'Start sværmforebygging (klipp dronningceller)',
      'Tilsett rom etter behov',
      'Varroa-telling: limbunn-metode',
    ],
  },
  {
    month: 5,
    icon: '🐝',
    title: 'Mai',
    description: 'Høysesong for sværming. Aktiv honningproduksjon starter.',
    tasks: [
      'Sværmtid – inspiser hvert 7. til 9. dag',
      'Legg på honningkropp ved 6–7 besatte rammer',
      'Fang sverm eller del kolonier',
      'Kontroller varroanivå',
    ],
  },
  {
    month: 6,
    icon: '🌻',
    title: 'Juni',
    description: 'Tidlig honninginnhøsting mulig. Koloniene er på topp.',
    tasks: [
      'Vurder første honninginnhøsting (lindeblomst)',
      'Sjekk dronningkvalitet',
      'Evaluer sværmstatus',
      'Varroa-behandling dersom nivå >3 pr. 100 bier',
    ],
  },
  {
    month: 7,
    icon: '☀️',
    title: 'Juli',
    description: 'Sommerstille mulig. Andre honninginnhøsting.',
    tasks: [
      'Andre honninginnhøsting ved sommerstille',
      'Sørg for vannforsyning i nærheten',
      'Sjekk varroatelling nøye',
      'Ny dronning ved behov (ennå mulig)',
    ],
  },
  {
    month: 8,
    icon: '🍯',
    title: 'August',
    description: 'Siste innhøsting. Varroabehandling og vinterforberedelser starter.',
    tasks: [
      'Siste honninginnhøsting (lyng­honning)',
      'Start varroabehandling etter innhøsting',
      'Begynn vinterfôring (sirup/invertert sukker)',
      'Varroa-telling etter behandling',
    ],
  },
  {
    month: 9,
    icon: '🍂',
    title: 'September',
    description: 'Vinterfôring fullføres. Siste varroabehandling.',
    tasks: [
      'Avslutt varroabehandlingen',
      'Fullfør vinterfôring (ca. 15–18 kg per kube)',
      'Sett inn muserist i flyåpningen',
      'Sjekk at koloni­styrken er god nok for overvintring',
    ],
  },
  {
    month: 10,
    icon: '🍁',
    title: 'Oktober',
    description: 'Innvintring. Minimalt med forstyrrelser.',
    tasks: [
      'Siste fôrkontroll',
      'Gjør kuben vinterklar (tettsikring, ventilasjon)',
      'Oksalsyre­drypping når kolonien er yngelfri',
      'Fjern og lagre honningkropper',
    ],
  },
  {
    month: 11,
    icon: '🌧️',
    title: 'November',
    description: 'Biene samler seg til vinterklynge. Ro i kubene.',
    tasks: [
      'Evt. oksalsyre­drypping ved yngelfri koloni',
      'Sjekk at kuben er vindsikret',
      'Rens og steriliser brukt utstyr',
      'Dokumenter sesongen og oppdater notater',
    ],
  },
  {
    month: 12,
    icon: '⛄',
    title: 'Desember',
    description: 'Rolig periode. Planlegg og lær til neste sesong.',
    tasks: [
      'La biene hvile – unngå unødige forstyrrelser',
      'Planlegg neste sesong og bestill utstyr',
      'Delta på kurs eller birøkterlagets møter',
      'Les og oppdater kunnskapen din',
    ],
  },
];
