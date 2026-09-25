import { describe, expect, it } from 'vitest';
import { nextIndexForKey } from './keyboard';

describe('nextIndexForKey', () => {
  it('loopt rond aan beide kanten', () => {
    expect(nextIndexForKey('ArrowRight', 2, 3)).toBe(0);
    expect(nextIndexForKey('ArrowLeft', 0, 3)).toBe(2);
    expect(nextIndexForKey('ArrowDown', 0, 3)).toBe(1);
    expect(nextIndexForKey('ArrowUp', 1, 3)).toBe(0);
  });

  it('kent Home en End', () => {
    expect(nextIndexForKey('Home', 2, 5)).toBe(0);
    expect(nextIndexForKey('End', 0, 5)).toBe(4);
  });

  it('negeert andere toetsen en lege lijsten', () => {
    expect(nextIndexForKey('Enter', 0, 3)).toBeNull();
    expect(nextIndexForKey('ArrowRight', 0, 0)).toBeNull();
  });
});
