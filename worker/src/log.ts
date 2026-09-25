/**
 * Logging zonder persoonsgegevens: alleen tijdstip, status en een gehashte
 * IP (SHA-256 met een salt die per dag wisselt). Hetzelfde IP geeft binnen
 * één dag dezelfde hash (nodig voor rate limiting), daarna niet meer.
 */
export async function hashIp(ip: string, salt: string, now: Date = new Date()): Promise<string> {
  const day = now.toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${salt}:${day}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

export function logIntake(status: number, hashedIp: string, note?: string): void {
  // Bewust geen naam, e-mail of andere invoer.
  console.info(
    JSON.stringify({
      event: 'intake',
      at: new Date().toISOString(),
      status,
      ip: hashedIp,
      ...(note ? { note } : {}),
    }),
  );
}
