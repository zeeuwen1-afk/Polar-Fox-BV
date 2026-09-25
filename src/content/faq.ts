/**
 * Veelgestelde vragen. De homepage toont de eerste zes als draaikaarten,
 * de websitepagina toont de website-vragen in een accordeon, en de
 * FAQPage-JSON-LD gebruikt de volledige lijst.
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Waar de vraag past; 'algemeen' staat overal. */
  topics: readonly ('algemeen' | 'website' | 'app' | 'beheer')[];
}

export const faq: readonly FaqItem[] = [
  {
    id: 'langskomen',
    question: 'Komen jullie echt langs?',
    answer: 'Ja, de intake doen we altijd bij jou op locatie, gratis.',
    topics: ['algemeen', 'website', 'app'],
  },
  {
    id: 'kosten',
    question: 'Wat kost het?',
    answer:
      'Websites vanaf € 99, apps vanaf € 449 per maand, plus een eenmalige startbijdrage. Hosting en onderhoud zitten erin. Alle prijzen excl. btw.',
    topics: ['algemeen', 'website', 'app'],
  },
  {
    id: 'code',
    question: 'Van wie is de code?',
    answer: 'Na de looptijd krijg je op verzoek je broncode. Data en domein zijn altijd van jou.',
    topics: ['algemeen', 'website', 'app'],
  },
  {
    id: 'snelheid',
    question: 'Hoe snel live?',
    answer: 'Een website in 3 tot 5 weken, een app in 2 tot 10 weken na akkoord.',
    topics: ['algemeen', 'website', 'app'],
  },
  {
    id: 'data',
    question: 'Waar staat mijn data?',
    answer: 'In de EU, met dagelijkse back-ups en een verwerkersovereenkomst.',
    topics: ['algemeen', 'app', 'beheer'],
  },
  {
    id: 'overname',
    question: 'Nemen jullie apps over?',
    answer: 'Ja, ook uit Lovable of Bolt. We beginnen met een overname-check van € 295 excl. btw.',
    topics: ['algemeen', 'app', 'beheer'],
  },
  {
    id: 'teksten',
    question: 'Wie schrijft de teksten van mijn website?',
    answer:
      'Jij levert de inhoud aan, wij redigeren en structureren. Tekstschrijven kan als extra.',
    topics: ['website'],
  },
  {
    id: 'domein',
    question: 'Wat gebeurt er met mijn domein als ik stop?',
    answer: 'Je domein staat op jouw naam en blijft van jou.',
    topics: ['website', 'beheer'],
  },
];

/** De eerste zes vragen, voor de draaikaarten op de homepage. */
export const homeFaq = faq.slice(0, 6);

/** Vragen die op de websitepagina horen. */
export const websiteFaq = faq.filter((item) => item.topics.includes('website'));
