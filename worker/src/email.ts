import type { featureValues } from '../../src/lib/intakeSchema';
import { preferenceLabels, slotLabels, type IntakeData } from '../../src/lib/intakeSchema';

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const featureLabels: Record<(typeof featureValues)[number], string> = {
  boeken: 'Online boeken',
  accounts: 'Klantaccounts',
  betalen: 'Online betalen',
  koppelingen: 'Koppelingen',
  meertalig: 'Meertalig',
  ai: 'AI-assistent',
  rapportages: 'Rapportages',
  team: 'Team en rechten',
};

const kindLabels: Record<IntakeData['soort'], string> = {
  website: 'Een website',
  app: 'Een applicatie',
  beheer: 'Beheer of overname',
  onbekend: 'Weet ik nog niet',
};

export interface Mail {
  to: { email: string; name?: string };
  subject: string;
  text: string;
  replyTo?: { email: string; name?: string };
}

/**
 * Tekstmails: geen HTML, dus niets om te escapen naar HTML en geen tracking.
 * Regeleinden uit de invoer halen we weg zodat niemand extra kopregels of
 * valse "velden" in de mail kan zetten.
 */
export function clean(value: string): string {
  return value.replace(/[\r\n\t]+/g, ' ').trim();
}

export function buildNotification(data: IntakeData, toEmail: string): Mail {
  const lines = [
    'Nieuwe intake-aanvraag via polarfoxbv.nl',
    '',
    `Naam:       ${clean(data.naam)}`,
    `Bedrijf:    ${clean(data.bedrijf) || '-'}`,
    `E-mail:     ${clean(data.email)}`,
    `Telefoon:   ${clean(data.telefoon) || '-'}`,
    `Plaats:     ${clean(data.plaats)}`,
    '',
    `Wat:        ${kindLabels[data.soort]}`,
    `Functies:   ${data.functies.length ? data.functies.map((f) => featureLabels[f]).join(', ') : '-'}`,
    `Wanneer:    ${preferenceLabels[data.voorkeur]}`,
    `Dagdeel:    ${data.dagdeel ? slotLabels[data.dagdeel] : 'geen voorkeur'}`,
    '',
    'Akkoord met privacyverklaring: ja',
  ];
  return {
    to: { email: toEmail, name: 'Polar Fox' },
    subject: `Intake-aanvraag: ${clean(data.naam)} (${kindLabels[data.soort]})`,
    text: lines.join('\n'),
    replyTo: { email: clean(data.email), name: clean(data.naam) },
  };
}

export function buildConfirmation(data: IntakeData, fromEmail: string, phone: string): Mail {
  const name = clean(data.naam);
  const lines = [
    `Beste ${name},`,
    '',
    'Dank je wel voor je aanvraag. We nemen binnen één werkdag contact met je op om de intake bij jou op locatie in te plannen.',
    '',
    'Dit hebben we ontvangen:',
    `- Wat: ${kindLabels[data.soort]}`,
    `- Functies: ${data.functies.length ? data.functies.map((f) => featureLabels[f]).join(', ') : 'nog geen gekozen'}`,
    `- Plaats: ${clean(data.plaats)}`,
    `- Wanneer: ${preferenceLabels[data.voorkeur]}${data.dagdeel ? `, ${slotLabels[data.dagdeel].toLowerCase()}` : ''}`,
    '',
    'De intake duurt 1 à 2 uur en is gratis. Daarna krijg je binnen 5 werkdagen een voorstel met een vaste prijs.',
    '',
    `Liever direct contact? Mail naar ${fromEmail} of bel ${phone}.`,
    '',
    'Met vriendelijke groet,',
    'Polar Fox',
    '',
    'Polar Fox B.V., Huizen. KvK 75362538.',
    'Je gegevens gebruiken we alleen om deze aanvraag af te handelen; zie https://polarfoxbv.nl/juridisch/privacyverklaring',
  ];
  return {
    to: { email: clean(data.email), name },
    subject: 'Je intake-aanvraag bij Polar Fox',
    text: lines.join('\n'),
  };
}

export interface BrevoClient {
  send(mail: Mail): Promise<void>;
}

/** Brevo transactionele e-mail (EU). Alleen textContent, dus geen tracking-pixel. */
export function createBrevoClient(
  apiKey: string,
  from: { email: string; name: string },
  fetchFn: typeof fetch = fetch,
): BrevoClient {
  return {
    async send(mail) {
      const response = await fetchFn(BREVO_URL, {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: from,
          to: [mail.to],
          ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
          subject: mail.subject,
          textContent: mail.text,
          tags: ['intake'],
        }),
      });
      if (!response.ok) {
        // Geen body loggen: die kan persoonsgegevens bevatten.
        throw new Error(`Brevo antwoordde met status ${response.status}`);
      }
    },
  };
}
