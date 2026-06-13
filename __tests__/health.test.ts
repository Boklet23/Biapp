import { computeHealthScore } from '@/utils/health';
import type { Inspection } from '@/types';

/** Bygger en frisk basisinspeksjon (i dag, lav varroa, dronning sett). */
function makeInspection(overrides: Partial<Inspection> = {}): Inspection {
  return {
    id: 'i1',
    hiveId: 'h1',
    userId: 'u1',
    inspectedAt: new Date().toISOString(),
    weatherTemp: null,
    weatherCondition: null,
    numFramesBrood: 4,
    numFramesHoney: 3,
    numFramesEmpty: 1,
    queenSeen: true,
    queenCellsFound: false,
    varroaCount: 0,
    varroaMethod: null,
    varroaAiCount: null,
    varroaAiSeverity: null,
    varroaAiRecommendation: null,
    diseaseObservations: null,
    treatmentApplied: false,
    treatmentProduct: null,
    notes: null,
    moodScore: null,
    ...overrides,
  };
}

describe('computeHealthScore', () => {
  it('gir 50 (nøytral) når det ikke finnes inspeksjon', () => {
    expect(computeHealthScore(undefined)).toBe(50);
  });

  it('gir nær full score for en frisk kube med lav varroa', () => {
    // 100 - 5 (varroa <= 1) = 95
    expect(computeHealthScore(makeInspection({ varroaCount: 0 }))).toBe(95);
  });

  it('trapper ned scoren etter varroa-nivå', () => {
    expect(computeHealthScore(makeInspection({ varroaCount: 1 }))).toBe(95); // -5
    expect(computeHealthScore(makeInspection({ varroaCount: 2 }))).toBe(80); // -20
    expect(computeHealthScore(makeInspection({ varroaCount: 3 }))).toBe(65); // -35
    expect(computeHealthScore(makeInspection({ varroaCount: 5 }))).toBe(48); // -52
    expect(computeHealthScore(makeInspection({ varroaCount: 12 }))).toBe(32); // -68
  });

  it('behandler manglende varroatelling som 0', () => {
    expect(computeHealthScore(makeInspection({ varroaCount: null }))).toBe(95);
  });

  it('trekker fra når det ikke er yngel', () => {
    // 100 - 5 (varroa) - 20 (ingen yngel) = 75
    expect(computeHealthScore(makeInspection({ numFramesBrood: 0 }))).toBe(75);
  });

  it('straffer svermceller uten dronning hardere enn med dronning sett', () => {
    const utenDronning = computeHealthScore(
      makeInspection({ queenCellsFound: true, queenSeen: false }),
    );
    const medDronning = computeHealthScore(
      makeInspection({ queenCellsFound: true, queenSeen: true }),
    );
    expect(utenDronning).toBe(80); // 100 - 5 - 15
    expect(medDronning).toBe(87); // 100 - 5 - 8
    expect(utenDronning).toBeLessThan(medDronning);
  });

  it('trekker fra for utdatert inspeksjon (>21 og >42 dager)', () => {
    const d30 = new Date(Date.now() - 30 * 86400000).toISOString();
    const d50 = new Date(Date.now() - 50 * 86400000).toISOString();
    expect(computeHealthScore(makeInspection({ inspectedAt: d30 }))).toBe(85); // -5 -10
    expect(computeHealthScore(makeInspection({ inspectedAt: d50 }))).toBe(75); // -5 -10 -10
  });

  it('klamper aldri scoren under 0', () => {
    const score = computeHealthScore(
      makeInspection({
        varroaCount: 50,
        numFramesBrood: 0,
        queenCellsFound: true,
        queenSeen: false,
        inspectedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      }),
    );
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBe(0);
  });
});
