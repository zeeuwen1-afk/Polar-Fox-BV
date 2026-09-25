const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Controleert een Turnstile-token bij Cloudflare. Geeft false bij een
 * ongeldig token of een netwerkfout: liever een aanvraag te veel weigeren
 * dan spam doorlaten.
 */
export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp: string | null,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetchFn(SITEVERIFY, { method: 'POST', body });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
