export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

/** Minimale KV-interface, zodat tests een Map kunnen meegeven. */
export interface Counter {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/**
 * Maximaal 5 aanvragen per (gehasht) IP per uur. De sleutel bevat het
 * uurvenster, zodat de teller vanzelf verloopt; de KV-TTL ruimt hem op.
 * Geeft true als de aanvraag door mag.
 */
export async function allowRequest(
  counter: Counter,
  hashedIp: string,
  now: Date = new Date(),
): Promise<boolean> {
  const windowStart = Math.floor(now.getTime() / 1000 / RATE_LIMIT_WINDOW_SECONDS);
  const key = `intake:${hashedIp}:${windowStart}`;
  const current = Number((await counter.get(key)) ?? '0');
  if (current >= RATE_LIMIT_MAX) return false;
  await counter.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS + 60 });
  return true;
}
