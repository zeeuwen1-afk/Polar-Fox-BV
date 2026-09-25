import type { Env } from './env';

/**
 * Alleen de eigen origins mogen het intake-endpoint aanroepen. Een verzoek
 * zonder Origin-header (bijvoorbeeld curl) is geen browserverzoek en wordt
 * apart afgevangen in intake.ts.
 */
export function allowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function isAllowedOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  // Zelfde origin als de Worker zelf is altijd goed (site en API draaien samen).
  const self = new URL(request.url).origin;
  return origin === self || allowedOrigins(env).includes(origin);
}

export function corsHeaders(request: Request, env: Env): Record<string, string> {
  if (!isAllowedOrigin(request, env)) return {};
  return {
    'Access-Control-Allow-Origin': request.headers.get('Origin') ?? '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
