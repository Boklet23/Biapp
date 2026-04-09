export interface ChecklistItem {
  id: string;
  task: string;
  detail?: string;
}

export interface MonthChecklist {
  month: number;
  title: string;
  icon: string;
  items: ChecklistItem[];
}

export const SEASON_CHECKLISTS: MonthChecklist[] = [
  {
    month: 1, title: 'Januar', icon: '❄️',
    items: [
      { id: 'jan1', task: 'Sjekk mattilgang utenfra', detail: 'Lytt etter surring — forsiktig uten å åpne' },
      { id: 'jan2', task: 'Merk vekt om mulig', detail: 'Lett kube kan trenge påfôring' },
      { id: 'jan3', task: 'Oxalsyre-drypp hvis yngelfri', detail: 'Mest effektivt i yngelfri periode' },
      { id: 'jan4', task: 'Sjekk mus-sikring' },
    ],
  },
  {
    month: 2, title: 'Februar', icon: '❄️',
    items: [
      { id: 'feb1', task: 'Sjekk mattilgang utenfra' },
      { id: 'feb2', task: 'Flytt inn reservemat ved behov' },
      { id: 'feb3', task: 'Notér tidlig pollensanking (tegn på aktivitet)' },
    ],
  },
  {
    month: 3, title: 'Mars', icon: '🌬️',
    items: [
      { id: 'mar1', task: 'Vårgjennomgang når temp > 10 °C' },
      { id: 'mar2', task: 'Sjekk yngelmønster og dronning' },
      { id: 'mar3', task: 'Rengjør bunnen' },
      { id: 'mar4', task: 'Fjern mus-sikring' },
      { id: 'mar5', task: 'Tell varroa (sukkerpulver eller alkohol)' },
    ],
  },
  {
    month: 4, title: 'April', icon: '🌸',
    items: [
      { id: 'apr1', task: 'Ukentlig inspeksjon starter' },
      { id: 'apr2', task: 'Tilsett rom ved behov' },
      { id: 'apr3', task: 'Sjekk for svermceller' },
      { id: 'apr4', task: 'Vurder avlegger-dannelse' },
      { id: 'apr5', task: 'Registrer dronning om ukjent alder' },
    ],
  },
  {
    month: 5, title: 'Mai', icon: '🌼',
    items: [
      { id: 'mai1', task: 'Ukentlig sverm-kontroll' },
      { id: 'mai2', task: 'Sett på honningmagasiner' },
      { id: 'mai3', task: 'Vurder avleggere og dronningstell' },
      { id: 'mai4', task: 'Noter blomstring og pollenkilder' },
      { id: 'mai5', task: 'Tell varroa' },
    ],
  },
  {
    month: 6, title: 'Juni', icon: '☀️',
    items: [
      { id: 'jun1', task: 'Høydepunkt: kløver og lindeblomst' },
      { id: 'jun2', task: 'Sjekk honningmagasiner ukentlig' },
      { id: 'jun3', task: 'Fortsett sverm-kontroll' },
      { id: 'jun4', task: 'Tell varroa midt i måneden' },
    ],
  },
  {
    month: 7, title: 'Juli', icon: '🌞',
    items: [
      { id: 'jul1', task: 'Første høsting ved moden honning' },
      { id: 'jul2', task: 'Sluffe honning på godkjent sluffe' },
      { id: 'jul3', task: 'Sjekk vannkilde nær kuben' },
      { id: 'jul4', task: 'Varroa-telling etter høsting' },
    ],
  },
  {
    month: 8, title: 'August', icon: '🍯',
    items: [
      { id: 'aug1', task: 'Avslutt honninghøsting' },
      { id: 'aug2', task: 'Start høstbehandling mot varroa' },
      { id: 'aug3', task: 'Sikre vinterproviant (> 20 kg honning/sukkerløsning)' },
      { id: 'aug4', task: 'Tell varroa etter behandling' },
    ],
  },
  {
    month: 9, title: 'September', icon: '🍂',
    items: [
      { id: 'sep1', task: 'Avslutt varroabehandling' },
      { id: 'sep2', task: 'Kontroller vinterforsyning' },
      { id: 'sep3', task: 'Avsluttende tunge inspeksjon for sesongen' },
      { id: 'sep4', task: 'Sett inn vinteråpning' },
    ],
  },
  {
    month: 10, title: 'Oktober', icon: '🍁',
    items: [
      { id: 'okt1', task: 'Vinterklargjøring komplett' },
      { id: 'okt2', task: 'Sett på vinterbunner' },
      { id: 'okt3', task: 'Montér mus-sikring' },
      { id: 'okt4', task: 'Noter vekt av kubene' },
      { id: 'okt5', task: 'Isolasjon ved behov' },
    ],
  },
  {
    month: 11, title: 'November', icon: '🌧️',
    items: [
      { id: 'nov1', task: 'Siste vektnotering før vinter' },
      { id: 'nov2', task: 'Sjekk at flygehullet er åpent (ikke tettes av døde bier)' },
      { id: 'nov3', task: 'Bestill utstyr og preparater for neste sesong' },
    ],
  },
  {
    month: 12, title: 'Desember', icon: '🎄',
    items: [
      { id: 'des1', task: 'Lytt etter surring (forsiktig)' },
      { id: 'des2', task: 'Oksylsyre-drypp hvis yngelfri og ikke behandlet i januar' },
      { id: 'des3', task: 'Planlegg neste sesong og bestill dronningsmateriale' },
    ],
  },
];
