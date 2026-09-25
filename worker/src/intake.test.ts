import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from './index';
import { handleIntake } from './intake';
import type { Env } from './env';
import type { Mail } from './email';
import { RATE_LIMIT_MAX } from './rateLimit';

type WorkerRequest = Parameters<typeof worker.fetch>[0];
function cfRequest(url: string, init?: RequestInit): WorkerRequest {
  return new Request(url, init) as unknown as WorkerRequest;
}

/** KV-namespace in het geheugen. */
function memoryKv() {
  const store = new Map<string, string>();
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  } as unknown as KVNamespace;
}

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    ASSETS: { fetch: async () => new Response('asset') } as unknown as Fetcher,
    RATE_LIMIT: memoryKv(),
    ALLOWED_ORIGINS: 'https://polarfoxbv.nl',
    INTAKE_TO_EMAIL: 'info@polarfoxbv.nl',
    INTAKE_FROM_EMAIL: 'info@polarfoxbv.nl',
    INTAKE_FROM_NAME: 'Polar Fox',
    TURNSTILE_SECRET: 'geheim',
    BREVO_API_KEY: 'sleutel',
    LOG_SALT: 'zout',
    ...overrides,
  };
}

function makeCtx() {
  const promises: Promise<unknown>[] = [];
  return {
    ctx: {
      waitUntil: (p: Promise<unknown>) => {
        promises.push(p);
      },
      passThroughOnException: vi.fn(),
    } as unknown as ExecutionContext,
    settle: () => Promise.all(promises),
  };
}

const valid = {
  naam: 'Jansen',
  bedrijf: 'Bakkerij Veld',
  email: 'jansen@example.com',
  telefoon: '',
  plaats: 'Huizen',
  soort: 'app',
  functies: ['boeken'],
  voorkeur: 'deze-week',
  akkoord: true,
  website: '',
  turnstileToken: 'token',
};

function makeRequest(
  body: unknown,
  init: { origin?: string | null; ip?: string; contentType?: string } = {},
) {
  const headers = new Headers({ 'Content-Type': init.contentType ?? 'application/json' });
  if (init.origin !== null) headers.set('Origin', init.origin ?? 'https://polarfoxbv.nl');
  headers.set('CF-Connecting-IP', init.ip ?? '203.0.113.10');
  return new Request('https://polarfoxbv.nl/api/intake', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/** Turnstile-mock: slaagt als het token 'token' is. */
const turnstileFetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
  const token = (init?.body as URLSearchParams).get('response');
  return new Response(JSON.stringify({ success: token === 'token' }), { status: 200 });
}) as unknown as typeof fetch;

function makeMailer() {
  const sent: Mail[] = [];
  return {
    sent,
    mailer: {
      send: vi.fn(async (mail: Mail) => {
        sent.push(mail);
      }),
    },
  };
}

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(vi.fn());
  vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  vi.spyOn(console, 'error').mockImplementation(vi.fn());
});

describe('POST /api/intake', () => {
  it('verstuurt twee mails bij een geldige aanvraag', async () => {
    const env = makeEnv();
    const { ctx, settle } = makeCtx();
    const { mailer, sent } = makeMailer();

    const response = await handleIntake(makeRequest(valid), env, ctx, {
      fetchFn: turnstileFetch,
      mailer,
    });
    await settle();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(sent).toHaveLength(2);
    expect(sent[0]?.to.email).toBe('info@polarfoxbv.nl');
    expect(sent[1]?.to.email).toBe('jansen@example.com');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://polarfoxbv.nl');
  });

  it('weigert een vreemde origin', async () => {
    const { mailer } = makeMailer();
    const response = await handleIntake(
      makeRequest(valid, { origin: 'https://kwaad.example' }),
      makeEnv(),
      makeCtx().ctx,
      { fetchFn: turnstileFetch, mailer },
    );
    expect(response.status).toBe(403);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('weigert een verzoek zonder Origin-header', async () => {
    const { mailer } = makeMailer();
    const response = await handleIntake(
      makeRequest(valid, { origin: null }),
      makeEnv(),
      makeCtx().ctx,
      { fetchFn: turnstileFetch, mailer },
    );
    expect(response.status).toBe(403);
  });

  it('geeft 400 met veldfouten bij ongeldige invoer', async () => {
    const { mailer } = makeMailer();
    const response = await handleIntake(
      makeRequest({ ...valid, email: 'nee', akkoord: false }),
      makeEnv(),
      makeCtx().ctx,
      { fetchFn: turnstileFetch, mailer },
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { errors: Record<string, string> };
    expect(Object.keys(body.errors).sort()).toEqual(['akkoord', 'email']);
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('geeft 400 bij kapotte JSON en 415 bij een ander content-type', async () => {
    const { mailer } = makeMailer();
    const broken = await handleIntake(makeRequest('{niet json'), makeEnv(), makeCtx().ctx, {
      fetchFn: turnstileFetch,
      mailer,
    });
    expect(broken.status).toBe(400);
    const form = await handleIntake(
      makeRequest(valid, { contentType: 'text/plain' }),
      makeEnv(),
      makeCtx().ctx,
      { fetchFn: turnstileFetch, mailer },
    );
    expect(form.status).toBe(415);
  });

  it('doet alsof een honeypot-aanvraag lukt, maar mailt niet', async () => {
    const { mailer } = makeMailer();
    const response = await handleIntake(
      makeRequest({ ...valid, website: 'http://spam.example' }),
      makeEnv(),
      makeCtx().ctx,
      { fetchFn: turnstileFetch, mailer },
    );
    expect(response.status).toBe(200);
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('weigert een ongeldig Turnstile-token met 403', async () => {
    const { mailer } = makeMailer();
    const response = await handleIntake(
      makeRequest({ ...valid, turnstileToken: 'fout' }),
      makeEnv(),
      makeCtx().ctx,
      { fetchFn: turnstileFetch, mailer },
    );
    expect(response.status).toBe(403);
    const body = (await response.json()) as { errors: Record<string, string> };
    expect(body.errors).toHaveProperty('turnstileToken');
    expect(mailer.send).not.toHaveBeenCalled();
  });

  it('beperkt tot 5 aanvragen per IP per uur', async () => {
    const env = makeEnv();
    const { mailer } = makeMailer();
    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      const ok = await handleIntake(makeRequest(valid), env, makeCtx().ctx, {
        fetchFn: turnstileFetch,
        mailer,
      });
      expect(ok.status).toBe(200);
    }
    const blocked = await handleIntake(makeRequest(valid), env, makeCtx().ctx, {
      fetchFn: turnstileFetch,
      mailer,
    });
    expect(blocked.status).toBe(429);
    // Een ander IP mag wel.
    const other = await handleIntake(
      makeRequest(valid, { ip: '203.0.113.99' }),
      env,
      makeCtx().ctx,
      { fetchFn: turnstileFetch, mailer },
    );
    expect(other.status).toBe(200);
  });

  it('geeft 502 zonder details als de melding niet verstuurd kan worden', async () => {
    const mailer = {
      send: vi.fn(async () => {
        throw new Error('Brevo antwoordde met status 500');
      }),
    };
    const response = await handleIntake(makeRequest(valid), makeEnv(), makeCtx().ctx, {
      fetchFn: turnstileFetch,
      mailer,
    });
    expect(response.status).toBe(502);
    const body = (await response.json()) as { message: string };
    expect(body.message).not.toContain('Brevo');
  });

  it('logt alleen tijdstip, status en gehashte IP', async () => {
    const { mailer } = makeMailer();
    await handleIntake(makeRequest(valid), makeEnv(), makeCtx().ctx, {
      fetchFn: turnstileFetch,
      mailer,
    });
    const logged = (console.info as unknown as { mock: { calls: string[][] } }).mock.calls
      .map((c) => c[0])
      .join('\n');
    expect(logged).toContain('"status":200');
    expect(logged).not.toContain('203.0.113.10');
    expect(logged).not.toContain('jansen@example.com');
    expect(logged).not.toContain('Jansen');
  });
});

describe('router', () => {
  it('beantwoordt OPTIONS met CORS-headers voor een toegestane origin', async () => {
    const request = cfRequest('https://polarfoxbv.nl/api/intake', {
      method: 'OPTIONS',
      headers: { Origin: 'https://polarfoxbv.nl' },
    });
    const response = await worker.fetch(request, makeEnv(), makeCtx().ctx);
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  it('geeft 405 bij GET op /api/intake en 404 bij andere /api-paden', async () => {
    const get = await worker.fetch(
      new Request('https://polarfoxbv.nl/api/intake'),
      makeEnv(),
      makeCtx().ctx,
    );
    expect(get.status).toBe(405);
    const other = await worker.fetch(
      new Request('https://polarfoxbv.nl/api/anders'),
      makeEnv(),
      makeCtx().ctx,
    );
    expect(other.status).toBe(404);
  });

  it('serveert al het andere uit de statische assets', async () => {
    const response = await worker.fetch(
      new Request('https://polarfoxbv.nl/prijzen'),
      makeEnv(),
      makeCtx().ctx,
    );
    expect(await response.text()).toBe('asset');
  });
});
