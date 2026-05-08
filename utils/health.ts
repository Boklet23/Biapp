import { Inspection } from '@/types';

export function computeHealthScore(insp: Inspection | undefined): number {
  if (!insp) return 50;
  let score = 100;

  const varroa = insp.varroaCount ?? 0;
  if (varroa <= 1)      score -= 5;
  else if (varroa <= 2) score -= 20;
  else if (varroa <= 3) score -= 35;
  else if (varroa <= 5) score -= 52;
  else                  score -= 68;

  if (insp.queenCellsFound) score -= 15;

  const days = Math.floor((Date.now() - new Date(insp.inspectedAt).getTime()) / 86400000);
  if (days > 21) score -= 10;
  if (days > 42) score -= 10;

  return Math.max(15, score);
}
