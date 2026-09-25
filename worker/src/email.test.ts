import { describe, expect, it, vi } from 'vitest';
import { buildConfirmation, buildNotification, clean, createBrevoClient } from './email';
import type { IntakeData } from '../../src/lib/intakeSchema';

const data: IntakeData = {
  naam: 'Jansen',
  bedrijf: 'Bakkerij Veld',
  email: 'jansen@example.com',
  telefoon: '',
  plaats: 'Huizen',
  soort: 'app',
  functies: ['boeken', 'betalen'],
  voorkeur: 'deze-week',
  dagdeel: 'di-ochtend',
  akkoord: true,
  website: '',
  turnstileToken: 'token',
};

describe('clean', () => {
  it('haalt regeleinden en tabs uit invoer', () => {
    expect(clean('Jansen\r\nBcc: iemand@example.com\tx')).toBe('Jansen Bcc: iemand@example.com x');
  });
});

describe('buildNotification', () => {
  it('bevat alle velden in leesbare vorm en antwoordt naar de aanvrager', () => {
    const mail = buildNotification(data, 'info@polarfoxbv.nl');
    expect(mail.to.email).toBe('info@polarfoxbv.nl');
    expect(mail.subject).toBe('Intake-aanvraag: Jansen (Een applicatie)');
    expect(mail.text).toContain('Bedrijf:    Bakkerij Veld');
    expect(mail.text).toContain('Telefoon:   -');
    expect(mail.text).toContain('Functies:   Online boeken, Online betalen');
    expect(mail.text).toContain('Dagdeel:    Dinsdag ochtend');
    expect(mail.replyTo).toEqual({ email: 'jansen@example.com', name: 'Jansen' });
  });

  it('neemt geen HTML of extra regels uit de invoer over', () => {
    const mail = buildNotification(
      { ...data, naam: '<b>Jansen</b>\nX-Injected: ja' },
      'info@polarfoxbv.nl',
    );
    expect(mail.subject).toBe('Intake-aanvraag: <b>Jansen</b> X-Injected: ja (Een applicatie)');
    expect(mail.text).not.toMatch(/\nX-Injected/);
  });
});

describe('buildConfirmation', () => {
  it('gaat naar de aanvrager en vat de aanvraag samen', () => {
    const mail = buildConfirmation(data, 'info@polarfoxbv.nl', '085-2009981');
    expect(mail.to).toEqual({ email: 'jansen@example.com', name: 'Jansen' });
    expect(mail.text).toContain('Beste Jansen,');
    expect(mail.text).toContain('- Wanneer: Deze week, dinsdag ochtend');
    expect(mail.text).toContain('085-2009981');
    expect(mail.text).toContain('/juridisch/privacyverklaring');
  });
});

describe('createBrevoClient', () => {
  it('stuurt een tekstmail naar de Brevo API met de juiste headers', async () => {
    const fetchFn = vi.fn(async () => new Response('{}', { status: 201 }));
    const client = createBrevoClient(
      'sleutel',
      { email: 'info@polarfoxbv.nl', name: 'Polar Fox' },
      fetchFn as unknown as typeof fetch,
    );
    await client.send(buildConfirmation(data, 'info@polarfoxbv.nl', '085-2009981'));

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect((init.headers as Record<string, string>)['api-key']).toBe('sleutel');
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.sender).toEqual({ email: 'info@polarfoxbv.nl', name: 'Polar Fox' });
    expect(body.to).toEqual([{ email: 'jansen@example.com', name: 'Jansen' }]);
    expect(body).toHaveProperty('textContent');
    expect(body).not.toHaveProperty('htmlContent');
  });

  it('gooit een fout zonder de body te lekken als Brevo faalt', async () => {
    const fetchFn = vi.fn(async () => new Response('{"message":"geheim"}', { status: 401 }));
    const client = createBrevoClient(
      'sleutel',
      { email: 'a@b.nl', name: 'A' },
      fetchFn as unknown as typeof fetch,
    );
    await expect(client.send(buildNotification(data, 'a@b.nl'))).rejects.toThrow('status 401');
  });
});
