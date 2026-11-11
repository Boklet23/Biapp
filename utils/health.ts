import { varroaThresholds } from '@/constants/varroa';
import { Inspection } from '@/types';

export function computeHealthScore(insp: Inspection | undefined): number {
  if (!insp) return 50;
  let score = 100;

  // Metodespesifikke terskler — samme kilde som kubeprofilens helsestatus og
  // behandlingsrådene, slik at liste/dashboard og profil aldri motsier hverandre.
  // (Tidligere hardkodet denne egne bånd som ignorerte varroaMethod.)
  const { moderate, elevated, critical } = varroaThresholds(insp.varroaMethod);
  const varroa = insp.varroaCount ?? 0;
  if (varroa >= critical)      score -= 68;
  else if (varroa >= elevated) score -= 52;
  else if (varroa >= moderate) score -= 35;
  else if (varroa > 0)         score -= 20;
  else                         score -= 5;

  if (insp.numFramesBrood === 0) score -= 20;

  if (insp.queenCellsFound && !insp.queenSeen) score -= 15;
  else if (insp.queenCellsFound) score -= 8;

  const days = Math.floor((Date.now() - new Date(insp.inspectedAt).getTime()) / 86400000);
  if (days > 21) score -= 10;
  if (days > 42) score -= 10;

  return Math.max(0, score);
}
