export interface SeasonReminder {
  id: string;       // stable ID used as AsyncStorage key
  month: number;    // 1–12
  day: number;      // day of month to fire
  title: string;
  body: string;
}

// Key Norwegian beekeeping seasonal tasks — sent on the 1st of each relevant month
export const SEASON_REMINDERS: SeasonReminder[] = [
  {
    id: 'season_spring_check',
    month: 3,
    day: 1,
    title: '🌱 Vårsjekk',
    body: 'Tid for første vårsjekk. Se etter tegn på liv, mat og dronning.',
  },
  {
    id: 'season_swarm_watch',
    month: 5,
    day: 1,
    title: '🐝 Svermetid starter',
    body: 'Svermetiden er i gang! Sjekk for dronningceller ukentlig.',
  },
  {
    id: 'season_harvest',
    month: 7,
    day: 10,
    title: '🍯 Høsttid nærmer seg',
    body: 'Juli–august er høysesongen. Sjekk honningbyttet og vurder høsting.',
  },
  {
    id: 'season_varroa_treatment',
    month: 8,
    day: 1,
    title: '⚠️ Varroabehandling',
    body: 'August er viktigste måneden for varroabehandling. Tell og behandle nå.',
  },
  {
    id: 'season_winter_feed',
    month: 9,
    day: 1,
    title: '🍂 Vinterfôring',
    body: 'Start vinterfôringen nå. Kubene trenger 15–20 kg mat for vinteren.',
  },
  {
    id: 'season_winter_prep',
    month: 10,
    day: 1,
    title: '❄️ Vinterklargjøring',
    body: 'Trekk inn inngangen, fjern honningkroppen og klargjør for vinteren.',
  },
];
