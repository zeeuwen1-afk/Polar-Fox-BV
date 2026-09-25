import { z } from 'zod';

// Zod compileert parsers standaard met `new Function`; dat blokkeert de CSP
// (geen 'unsafe-eval'). Jitless is iets trager, maar hier verwaarloosbaar.
z.config({ jitless: true });

/**
 * Validatie van een intake-aanvraag. Gedeeld door de IntakeWizard (client)
 * en de Worker (server), zodat beide dezelfde regels hanteren.
 * Foutmeldingen zijn in het Nederlands en worden per veld getoond.
 */

export const projectKindValues = ['website', 'app', 'beheer', 'onbekend'] as const;
export const featureValues = [
  'boeken',
  'accounts',
  'betalen',
  'koppelingen',
  'meertalig',
  'ai',
  'rapportages',
  'team',
] as const;
export const preferenceValues = ['deze-week', 'volgende-week', 'ochtenden', 'middagen'] as const;
export const slotValues = ['di-ochtend', 'wo-middag', 'do-ochtend', 'vr-middag'] as const;

export const preferenceLabels: Record<(typeof preferenceValues)[number], string> = {
  'deze-week': 'Deze week',
  'volgende-week': 'Volgende week',
  ochtenden: 'Ochtenden',
  middagen: 'Middagen',
};

export const slotLabels: Record<(typeof slotValues)[number], string> = {
  'di-ochtend': 'Dinsdag ochtend',
  'wo-middag': 'Woensdag middag',
  'do-ochtend': 'Donderdag ochtend',
  'vr-middag': 'Vrijdag middag',
};

// Elke tekst heeft een Nederlandse melding voor "ontbreekt" (schema-niveau) en "te lang".
const text = (max: number, label: string, missing: string) =>
  z.string({ error: missing }).trim().max(max, `${label} mag maximaal ${max} tekens zijn.`);

export const intakeSchema = z.object({
  naam: text(80, 'Je naam', 'Vul je naam in.').min(2, 'Vul je naam in (minimaal 2 tekens).'),
  bedrijf: text(120, 'De bedrijfsnaam', 'Ongeldige bedrijfsnaam.').optional().default(''),
  email: z
    .string({ error: 'Vul een geldig e-mailadres in.' })
    .trim()
    .max(160, 'Het e-mailadres mag maximaal 160 tekens zijn.')
    .pipe(z.email('Vul een geldig e-mailadres in.')),
  telefoon: text(30, 'Het telefoonnummer', 'Ongeldig telefoonnummer.').optional().default(''),
  plaats: text(80, 'De plaats', 'Vul de plaats van je bedrijf in.').min(
    1,
    'Vul de plaats van je bedrijf in.',
  ),
  soort: z.enum(projectKindValues, { error: 'Kies wat je wilt laten maken.' }),
  functies: z
    .array(z.enum(featureValues, { error: 'Onbekende functie.' }), { error: 'Ongeldige functies.' })
    .max(featureValues.length, 'Te veel functies.')
    .default([]),
  voorkeur: z.enum(preferenceValues, { error: 'Kies wanneer de intake je uitkomt.' }),
  dagdeel: z.enum(slotValues, { error: 'Onbekend dagdeel.' }).optional(),
  akkoord: z.literal(true, { error: 'Ga akkoord met de privacyverklaring om te versturen.' }),
  /** Honeypot: mensen zien dit veld niet, bots vullen het in. Moet leeg zijn. */
  website: z
    .string({ error: 'Ongeldige aanvraag.' })
    .max(0, 'Ongeldige aanvraag.')
    .optional()
    .default(''),
  turnstileToken: z
    .string({ error: 'De spamcontrole is nog niet afgerond.' })
    .min(1, 'De spamcontrole is nog niet afgerond.')
    .max(4096, 'Ongeldige spamcontrole.'),
});

export type IntakeInput = z.input<typeof intakeSchema>;
export type IntakeData = z.output<typeof intakeSchema>;

/** Veldnaam -> eerste foutmelding, voor weergave per veld. */
export function fieldErrors(error: z.ZodError): Partial<Record<keyof IntakeData, string>> {
  const result: Partial<Record<keyof IntakeData, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in result)) {
      result[key as keyof IntakeData] = issue.message;
    }
  }
  return result;
}
