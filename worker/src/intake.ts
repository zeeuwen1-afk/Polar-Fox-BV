import { fieldErrors, intakeSchema } from '../../src/lib/intakeSchema';
import { isAllowedOrigin } from './cors';
import { buildConfirmation, buildNotification, createBrevoClient, type BrevoClient } from './email';
import type { Env } from './env';
import { json } from './index';
import { hashIp, logIntake } from './log';
import { allowRequest } from './rateLimit';
import { verifyTurnstile } from './turnstile';

const MAX_BODY_BYTES = 16 * 1024;
const PHONE = '085-2009981';

/** Afhankelijkheden die tests kunnen vervangen. */
export interface IntakeDeps {
  fetchFn?: typeof fetch;
  mailer?: BrevoClient;
  now?: () => Date;
}

/**
 * POST /api/intake: origin, grootte, JSON, validatie, honeypot, rate limit,
 * Turnstile, twee mails. Foutmeldingen zijn generiek; velden met een fout
 * komen als `errors` terug zodat de wizard ze kan tonen.
 */
export async function handleIntake(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  deps: IntakeDeps = {},
): Promise<Response> {
  const fetchFn = deps.fetchFn ?? fetch;
  const now = deps.now ?? (() => new Date());
  const ip = request.headers.get('CF-Connecting-IP');
  const hashedIp = await hashIp(ip ?? 'onbekend', env.LOG_SALT, now());
  const reply = (body: unknown, status: number) => {
    logIntake(status, hashedIp);
    return json(body, status, request, env);
  };

  if (!isAllowedOrigin(request, env)) {
    return reply({ ok: false, message: 'Aanvraag niet toegestaan vanaf deze bron.' }, 403);
  }

  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return reply({ ok: false, message: 'Verwacht JSON.' }, 415);
  }

  const length = Number(request.headers.get('Content-Length') ?? '0');
  if (length > MAX_BODY_BYTES) {
    return reply({ ok: false, message: 'Aanvraag is te groot.' }, 413);
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return reply({ ok: false, message: 'Aanvraag is te groot.' }, 413);
    }
    raw = JSON.parse(text);
  } catch {
    return reply({ ok: false, message: 'Ongeldige aanvraag.' }, 400);
  }

  const parsed = intakeSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    // Honeypot gevuld: een bot. Antwoord alsof het gelukt is, zonder te mailen.
    if (errors.website && Object.keys(errors).length === 1) {
      logIntake(200, hashedIp, 'honeypot');
      return json({ ok: true }, 200, request, env);
    }
    return reply({ ok: false, message: 'Controleer de gemarkeerde velden.', errors }, 400);
  }
  const data = parsed.data;

  if (env.RATE_LIMIT) {
    const allowed = await allowRequest(env.RATE_LIMIT, hashedIp, now());
    if (!allowed) {
      return reply(
        {
          ok: false,
          message: 'Te veel aanvragen in korte tijd. Probeer het over een uur nog eens.',
        },
        429,
      );
    }
  } else {
    console.warn('RATE_LIMIT-binding ontbreekt; rate limiting overgeslagen.');
  }

  const human = await verifyTurnstile(data.turnstileToken, env.TURNSTILE_SECRET, ip, fetchFn);
  if (!human) {
    return reply(
      {
        ok: false,
        message: 'De spamcontrole is niet gelukt. Probeer het opnieuw.',
        errors: { turnstileToken: 'De spamcontrole is niet gelukt. Probeer het opnieuw.' },
      },
      403,
    );
  }

  const mailer =
    deps.mailer ??
    createBrevoClient(
      env.BREVO_API_KEY,
      { email: env.INTAKE_FROM_EMAIL, name: env.INTAKE_FROM_NAME },
      fetchFn,
    );

  try {
    // Eerst de melding aan Polar Fox: als die lukt is de aanvraag binnen,
    // ook als de bevestiging aan de aanvrager daarna faalt.
    await mailer.send(buildNotification(data, env.INTAKE_TO_EMAIL));
  } catch (error) {
    console.error(
      'Melding versturen mislukt:',
      error instanceof Error ? error.message : 'onbekend',
    );
    return reply({ ok: false, message: 'Versturen is niet gelukt. Probeer het zo nog eens.' }, 502);
  }

  // De bevestiging mag na het antwoord verstuurd worden.
  ctx.waitUntil(
    mailer.send(buildConfirmation(data, env.INTAKE_FROM_EMAIL, PHONE)).catch((error: unknown) => {
      console.error(
        'Bevestiging versturen mislukt:',
        error instanceof Error ? error.message : 'onbekend',
      );
    }),
  );

  return reply({ ok: true }, 200);
}
