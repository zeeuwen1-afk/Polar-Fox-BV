import { describe, expect, it } from 'vitest';
import { earlyExitFee, formatEuro, totalFor, upfrontFor, yearlyMonthly } from './pricing';
import {
  allPackages,
  findPackage,
  lowestMonthly,
  lowestStart,
  packageGroups,
} from '../content/packages';

describe('yearlyMonthly', () => {
  it('rekent 11 maanden voor 12: € 189 wordt € 173', () => {
    expect(yearlyMonthly(189)).toBe(173);
  });

  it('rondt af op hele euro’s', () => {
    expect(yearlyMonthly(99)).toBe(91); // 90,75
    expect(yearlyMonthly(449)).toBe(412); // 411,58
    expect(yearlyMonthly(1495)).toBe(1370); // 1370,42
  });

  it('is nooit hoger dan het maandbedrag', () => {
    for (const item of allPackages) {
      expect(yearlyMonthly(item.monthly)).toBeLessThanOrEqual(item.monthly);
    }
  });
});

describe('upfrontFor', () => {
  it('geeft de startbijdrage bij websites en apps', () => {
    expect(upfrontFor('web-essentie')).toBe(495);
    expect(upfrontFor('app-platform')).toBe(7500);
  });

  it('geeft de overname-check bij beheer', () => {
    expect(upfrontFor('beheer-web')).toBe(295);
    expect(upfrontFor('beheer-app')).toBe(295);
  });
});

describe('totalFor', () => {
  it('App Start over 24 maanden is € 13.226', () => {
    const result = totalFor('app-start', 24);
    expect(result).toEqual({
      upfront: 2450,
      months: 24,
      monthly: 449,
      total: 13226,
      isFrom: false,
    });
  });

  it('Beheer Website over 12 maanden is overname-check plus 12 maanden', () => {
    expect(totalFor('beheer-web', 12).total).toBe(295 + 12 * 59);
  });

  it('markeert App Platform als vanaf-prijs', () => {
    expect(totalFor('app-platform', 36).isFrom).toBe(true);
    expect(totalFor('web-groei', 36).isFrom).toBe(false);
  });

  it('weigert een ongeldige looptijd', () => {
    expect(() => totalFor('app-start', 0)).toThrow(RangeError);
    expect(() => totalFor('app-start', 1.5)).toThrow(RangeError);
  });
});

describe('earlyExitFee', () => {
  it('is 50% van de resterende maanden binnen de minimale looptijd', () => {
    // App Start: 24 maanden minimaal, 10 gebruikt, 14 resterend × 449 × 0,5 = 3.143
    expect(earlyExitFee('app-start', 10)).toBe(3143);
  });

  it('is 0 na de minimale looptijd', () => {
    expect(earlyExitFee('web-essentie', 12)).toBe(0);
    expect(earlyExitFee('web-essentie', 30)).toBe(0);
  });

  it('weigert negatieve maanden', () => {
    expect(() => earlyExitFee('web-essentie', -1)).toThrow(RangeError);
  });
});

describe('formatEuro', () => {
  it('schrijft bedragen zoals op de site', () => {
    expect(formatEuro(99)).toBe('€ 99');
    expect(formatEuro(1250)).toBe('€ 1.250');
    expect(formatEuro(13226)).toBe('€ 13.226');
  });
});

describe('packages (data-integriteit)', () => {
  it('heeft unieke id’s', () => {
    const ids = allPackages.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('heeft per groep precies één aanrader', () => {
    for (const group of packageGroups) {
      expect(group.items.filter((item) => item.recommended).length).toBe(1);
    }
  });

  it('kent de vanaf-prijzen uit de briefing', () => {
    expect(lowestMonthly('websites')).toBe(99);
    expect(lowestMonthly('apps')).toBe(449);
    expect(lowestMonthly('beheer')).toBe(59);
    expect(lowestStart('apps')).toBe(2450);
  });

  it('vindt pakketten op id en faalt duidelijk op onbekende id’s', () => {
    expect(findPackage('app-pro').monthly).toBe(849);
    expect(() => findPackage('bestaat-niet' as never)).toThrow(/Onbekend pakket/);
  });
});
