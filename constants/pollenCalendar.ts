export interface PollenPlant {
  plant: string;
  icon: string;
}

export const POLLEN_BY_MONTH: Record<number, PollenPlant[]> = {
  1:  [],
  2:  [],
  3:  [
    { plant: 'Hassel', icon: '🌿' },
    { plant: 'Or', icon: '🌿' },
  ],
  4:  [
    { plant: 'Selje/Vier', icon: '🌾' },
    { plant: 'Løvetann', icon: '🌼' },
    { plant: 'Frukttrær (kirsebær, eple)', icon: '🌸' },
    { plant: 'Blåveis', icon: '💜' },
  ],
  5:  [
    { plant: 'Frukttrær (plomme, pære)', icon: '🌸' },
    { plant: 'Hvitkløver', icon: '🍀' },
    { plant: 'Raps', icon: '🌻' },
    { plant: 'Rips og stikkelsbær', icon: '🫐' },
    { plant: 'Løvetann', icon: '🌼' },
    { plant: 'Bjørk', icon: '🌳' },
  ],
  6:  [
    { plant: 'Hvitkløver', icon: '🍀' },
    { plant: 'Rødkløver', icon: '🌺' },
    { plant: 'Raps', icon: '🌻' },
    { plant: 'Bringebær', icon: '🫐' },
    { plant: 'Storkenebb', icon: '🌸' },
    { plant: 'Legete kattost', icon: '🌿' },
  ],
  7:  [
    { plant: 'Hvitkløver', icon: '🍀' },
    { plant: 'Rødkløver', icon: '🌺' },
    { plant: 'Sommerblomster', icon: '🌸' },
    { plant: 'Lind', icon: '🌳' },
    { plant: 'Firblad', icon: '🌿' },
  ],
  8:  [
    { plant: 'Hvitkløver', icon: '🍀' },
    { plant: 'Calluna lyng', icon: '🌸' },
    { plant: 'Facelia', icon: '💜' },
    { plant: 'Bokhvete', icon: '🌾' },
    { plant: 'Solsikke', icon: '🌻' },
  ],
  9:  [
    { plant: 'Calluna lyng', icon: '🌸' },
    { plant: 'Vinterraps', icon: '🌻' },
    { plant: 'Høstblomster', icon: '🌼' },
  ],
  10: [
    { plant: 'Eføy', icon: '🌿' },
  ],
  11: [],
  12: [],
};
