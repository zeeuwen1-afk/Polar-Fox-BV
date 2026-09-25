import { describe, expect, it } from 'vitest';
import { securityHeaders, withSecurityHeaders } from './headers';

describe('withSecurityHeaders', () => {
  it('zet alle beveiligingsheaders op een antwoord', () => {
    const response = withSecurityHeaders(new Response('<html></html>', { status: 200 }));
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(response.headers.get(name)).toBe(value);
    }
    expect(response.status).toBe(200);
  });

  it('overschrijft geen headers die er al staan', () => {
    const original = new Response('x', { headers: { 'X-Frame-Options': 'SAMEORIGIN' } });
    expect(withSecurityHeaders(original).headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
  });

  it('bevat geen script-src in de CSP (die staat met hashes in de meta-tag)', () => {
    expect(securityHeaders['Content-Security-Policy']).not.toContain('script-src');
    expect(securityHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  });
});
