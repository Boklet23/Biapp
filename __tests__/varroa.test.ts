import { varroaThresholds } from '@/constants/varroa';

describe('varroaThresholds', () => {
  it('bruker vaskemetode-terskler for alkoholspyling (økonomisk terskel ~3 %)', () => {
    expect(varroaThresholds('alkoholspyling')).toEqual({
      moderate: 1,
      elevated: 2,
      critical: 3,
      unit: ' per 100 bier',
    });
  });

  it('bruker samme vaskemetode-terskler for sukkerpuder', () => {
    expect(varroaThresholds('sukkerpuder')).toEqual(varroaThresholds('alkoholspyling'));
  });

  it('bruker nedfallsterskler for limbunn', () => {
    expect(varroaThresholds('limbunn')).toEqual({
      moderate: 2,
      elevated: 4,
      critical: 6,
      unit: ' per dag',
    });
  });

  it('er case-insensitiv', () => {
    expect(varroaThresholds('ALKOHOLSPYLING')).toEqual(varroaThresholds('alkoholspyling'));
    expect(varroaThresholds('Limbunn')).toEqual(varroaThresholds('limbunn'));
  });

  it('faller tilbake på konservativ standard for ukjent metode', () => {
    expect(varroaThresholds('noe-helt-annet')).toEqual({
      moderate: 3,
      elevated: 5,
      critical: 8,
      unit: '',
    });
  });

  it('faller tilbake på standard for null/undefined', () => {
    const fallback = { moderate: 3, elevated: 5, critical: 8, unit: '' };
    expect(varroaThresholds(null)).toEqual(fallback);
    expect(varroaThresholds(undefined)).toEqual(fallback);
  });

  it('har monotont stigende terskler for alle metoder', () => {
    for (const method of ['alkoholspyling', 'limbunn', 'ukjent']) {
      const t = varroaThresholds(method);
      expect(t.moderate).toBeLessThan(t.elevated);
      expect(t.elevated).toBeLessThan(t.critical);
    }
  });
});
