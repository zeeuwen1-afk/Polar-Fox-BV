import { describe, expect, it } from 'vitest';
import { COMPLEXITY_BLOCKS, featureIds, recommend, recommendFor } from './recommend';

describe('recommend: website', () => {
  it.each([
    [0, 'Website Essentie'],
    [1, 'Website Essentie'],
    [2, 'Website Groei'],
    [3, 'Website Groei'],
    [4, 'Website Maatwerk'],
    [8, 'Website Maatwerk'],
  ])('%i functies geeft %s', (n, expected) => {
    expect(recommend('website', n).label).toBe(expected);
  });
});

describe('recommend: app', () => {
  it.each([
    [0, 'App Start'],
    [1, 'App Start'],
    [2, 'App Pro'],
    [3, 'App Pro'],
    [4, 'App Pro'],
    [5, 'App Platform'],
    [8, 'App Platform'],
  ])('%i functies geeft %s', (n, expected) => {
    expect(recommend('app', n).label).toBe(expected);
  });
});

describe('recommend: beheer', () => {
  it('geeft Beheer Website bij 0 of 1 functie', () => {
    expect(recommend('beheer', 0).label).toBe('Beheer Website');
    expect(recommend('beheer', 1).label).toBe('Beheer Website');
  });

  it('geeft Beheer Applicatie bij meer dan 1 functie', () => {
    expect(recommend('beheer', 2).label).toBe('Beheer Applicatie');
  });
});

describe('recommend: onbekend', () => {
  it('geeft "Samen bepalen" zonder pakket', () => {
    const result = recommend('onbekend', 3);
    expect(result.pkg).toBeNull();
    expect(result.label).toBe('Samen bepalen');
  });
});

describe('complexiteitsmeter', () => {
  it('telt het aantal functies, plus 1 voor een app', () => {
    expect(recommend('website', 3).complexity).toBe(3);
    expect(recommend('app', 3).complexity).toBe(4);
  });

  it('gaat nooit boven 8', () => {
    expect(recommend('app', 8).complexity).toBe(COMPLEXITY_BLOCKS);
    expect(recommend('website', 20).complexity).toBe(COMPLEXITY_BLOCKS);
  });

  it('gaat nooit onder 0', () => {
    expect(recommend('website', -5).complexity).toBe(0);
    expect(recommend('website', -5).featureCount).toBe(0);
  });
});

describe('recommendFor', () => {
  it('telt unieke functies uit een set of lijst', () => {
    expect(recommendFor('app', ['boeken', 'accounts', 'betalen']).label).toBe('App Pro');
    expect(recommendFor('app', ['boeken', 'boeken']).label).toBe('App Start');
  });

  it('kent precies acht functies', () => {
    expect(featureIds).toHaveLength(8);
    expect(new Set(featureIds).size).toBe(8);
  });
});
