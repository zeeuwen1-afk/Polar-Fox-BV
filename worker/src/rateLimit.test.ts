import { describe, expect, it } from 'vitest';
import { allowRequest, RATE_LIMIT_MAX } from './rateLimit';
import { hashIp } from './log';

function counter() {
  const store = new Map<string, string>();
  return {
    store,
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe('allowRequest', () => {
  it('laat 5 aanvragen door en blokkeert de zesde', async () => {
    const kv = counter();
    const now = new Date('2026-09-25T10:00:00Z');
    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      expect(await allowRequest(kv, 'abc', now)).toBe(true);
    }
    expect(await allowRequest(kv, 'abc', now)).toBe(false);
  });

  it('begint opnieuw in het volgende uur', async () => {
    const kv = counter();
    const now = new Date('2026-09-25T10:59:00Z');
    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) await allowRequest(kv, 'abc', now);
    expect(await allowRequest(kv, 'abc', now)).toBe(false);
    expect(await allowRequest(kv, 'abc', new Date('2026-09-25T11:01:00Z'))).toBe(true);
  });
});

describe('hashIp', () => {
  it('is stabiel binnen een dag en anders op een andere dag', async () => {
    const a = await hashIp('203.0.113.10', 'zout', new Date('2026-09-25T08:00:00Z'));
    const b = await hashIp('203.0.113.10', 'zout', new Date('2026-09-25T20:00:00Z'));
    const c = await hashIp('203.0.113.10', 'zout', new Date('2026-09-26T08:00:00Z'));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toHaveLength(32);
    expect(a).not.toContain('203');
  });

  it('hangt af van de salt', async () => {
    const now = new Date('2026-09-25T08:00:00Z');
    expect(await hashIp('1.2.3.4', 'zout', now)).not.toBe(await hashIp('1.2.3.4', 'peper', now));
  });
});
