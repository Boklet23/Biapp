/**
 * Single source of truth for varroa-tellingens alvorlighetsterskler.
 *
 * Tidligere definerte HealthScoreSection og TreatmentRecommendationSection
 * sine egne terskler, som hadde drevet fra hverandre (limbunn: 10 vs 3) og ga
 * motstridende råd for samme telletall. Begge importerer nå herfra.
 *
 * Tersklene er metodespesifikke og angir det laveste telletallet som utløser
 * hvert nivå (count >= nivå). MERK: nedfall-tersklene (limbunn) er sjablong­verdier
 * for midtsesong — bør ratifiseres faglig og evt. sesongjusteres senere.
 */
export interface VarroaThresholds {
  /** Begynn å følge med. */
  moderate: number;
  /** Forhøyet — tell på nytt snart. */
  elevated: number;
  /** Behandling nødvendig. */
  critical: number;
  /** Enhet for visning, f.eks. " per 100 bier". */
  unit: string;
}

export function varroaThresholds(method?: string | null): VarroaThresholds {
  const m = method?.toLowerCase();

  // Vaskemetode — mitter per 100 bier. Økonomisk terskel ~3 % (3 mitter/100).
  if (m === 'alkoholspyling' || m === 'sukkerpuder') {
    return { moderate: 1, elevated: 2, critical: 3, unit: ' per 100 bier' };
  }

  // Limbunn / klisterplate — naturlig nedfall per dag (midtsesong-sjablong).
  if (m === 'limbunn') {
    return { moderate: 2, elevated: 4, critical: 6, unit: ' per dag' };
  }

  // Ukjent/annen metode — konservativ standard.
  return { moderate: 3, elevated: 5, critical: 8, unit: '' };
}
