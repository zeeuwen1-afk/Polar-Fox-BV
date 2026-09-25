/**
 * Beveiligingsheaders, identiek aan public/_headers. De Worker zet ze op elk
 * antwoord uit de statische assets als vangnet; bestaande headers (uit
 * _headers) blijven staan.
 *
 * De CSP hier bevat bewust geen script-src of style-src: die staan met
 * per-pagina hashes in de <meta> die Astro genereert. Een header met
 * script-src zonder die hashes zou de eigen scripts blokkeren.
 */
export const securityHeaders: Readonly<Record<string, string>> = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Content-Security-Policy':
    "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
