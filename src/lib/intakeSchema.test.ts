import { describe, expect, it } from 'vitest';
import { fieldErrors, intakeSchema } from './intakeSchema';

const valid = {
  naam: 'Jansen',
  bedrijf: 'Bakkerij Veld',
  email: 'info@example.com',
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

describe('intakeSchema', () => {
  it('accepteert een geldige aanvraag en trimt tekst', () => {
    const result = intakeSchema.safeParse({ ...valid, naam: '  Jansen  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.naam).toBe('Jansen');
  });

  it('vult optionele velden met lege strings', () => {
    const { bedrijf: _b, telefoon: _t, website: _w, ...rest } = valid;
    const result = intakeSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bedrijf).toBe('');
      expect(result.data.telefoon).toBe('');
      expect(result.data.website).toBe('');
    }
  });

  it.each([
    ['naam', { naam: 'J' }],
    ['naam', { naam: 'x'.repeat(81) }],
    ['email', { email: 'geen-mail' }],
    ['plaats', { plaats: '' }],
    ['soort', { soort: 'iets-anders' }],
    ['functies', { functies: ['telepathie'] }],
    ['voorkeur', { voorkeur: 'ooit' }],
    ['dagdeel', { dagdeel: 'ma-nacht' }],
    ['akkoord', { akkoord: false }],
    ['website', { website: 'http://spam.example' }],
    ['turnstileToken', { turnstileToken: '' }],
  ])('weigert een ongeldige waarde voor %s', (field, override) => {
    const result = intakeSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error)).toHaveProperty(field);
    }
  });

  it('geeft Nederlandse meldingen als verplichte velden helemaal ontbreken', () => {
    const result = intakeSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(Object.keys(errors).sort()).toEqual([
        'akkoord',
        'email',
        'naam',
        'plaats',
        'soort',
        'turnstileToken',
        'voorkeur',
      ]);
      for (const message of Object.values(errors)) {
        expect(message).not.toMatch(/invalid input|expected|received/i);
      }
      expect(errors.naam).toBe('Vul je naam in.');
      expect(errors.soort).toBe('Kies wat je wilt laten maken.');
    }
  });

  it('geeft per veld één Nederlandse foutmelding', () => {
    const result = intakeSchema.safeParse({ ...valid, naam: '', email: 'nee' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.naam).toMatch(/naam/i);
      expect(errors.email).toMatch(/e-mailadres/i);
      expect(Object.keys(errors)).toHaveLength(2);
    }
  });
});
