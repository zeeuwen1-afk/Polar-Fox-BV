import type { Env } from './env';
import { handleIntake } from './intake';
import { corsHeaders, isAllowedOrigin } from './cors';

/**
 * Eén route: POST /api/intake. Al het andere komt uit de statische assets.
 * OPTIONS-preflights krijgen alleen CORS-headers als de origin is toegestaan.
 */
export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/intake') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(request, env),
        });
      }
      if (request.method !== 'POST') {
        return json({ ok: false, message: 'Methode niet toegestaan.' }, 405, request, env, {
          Allow: 'POST, OPTIONS',
        });
      }
      return handleIntake(request, env, ctx);
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, message: 'Niet gevonden.' }, 404, request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

/** JSON-antwoord met CORS- en beveiligingsheaders. */
export function json(
  body: unknown,
  status: number,
  request: Request,
  env: Env,
  extraHeaders: Record<string, string> = {},
): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  if (isAllowedOrigin(request, env)) {
    for (const [key, value] of Object.entries(corsHeaders(request, env))) headers.set(key, value);
  }
  return new Response(JSON.stringify(body), { status, headers });
}
