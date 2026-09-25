/**
 * Cases: de twee eigen platforms. Dit is het enige bewijs op de site; geen
 * verzonnen cijfers of klantenlogo's. Beelden zijn placeholders tot de echte
 * schermafbeeldingen in public/images/cases/ staan (zie README daar).
 */

import type { ImageMetadata } from 'astro';
import hppDashboardImage from '../assets/cases/hpp-dashboard.png';
import yogaCompanyImage from '../assets/cases/yogacompany.png';

export type CaseId = 'hpp-dashboard' | 'yogacompany';

export interface CaseTab {
  id: 'vraag' | 'oplossing' | 'techniek' | 'resultaat';
  label: string;
  text: string;
}

export interface CaseImage {
  /** Beeld uit src/assets/cases/ (astro:assets), of null zolang het ontbreekt. */
  src: ImageMetadata | null;
  alt: string;
  /** Zolang het echte beeld ontbreekt, toont de site een gelabelde placeholder. */
  placeholder: boolean;
}

export interface Case {
  id: CaseId;
  name: string;
  sector: string;
  kind: string;
  url: string;
  urlLabel: string;
  summary: string;
  tone: 'lime' | 'pink';
  tabs: readonly CaseTab[];
  image: CaseImage;
  /** Drie regels demo-inhoud voor het voorbeeldscherm in de placeholder. */
  demoLines: readonly [string, string, string];
}

export const cases: readonly Case[] = [
  {
    id: 'hpp-dashboard',
    name: 'HPP-Dashboard',
    sector: 'Horeca',
    kind: 'Eigen SaaS-platform',
    url: 'https://hpp-dashboard.nl',
    urlLabel: 'hpp-dashboard.nl',
    summary:
      'Stuurinformatie voor horecaondernemers op één plek: kassa, rooster en boekhouding automatisch gecombineerd.',
    tone: 'lime',
    tabs: [
      {
        id: 'vraag',
        label: 'De vraag',
        text: 'Horecaondernemers hebben hun cijfers verspreid over kassa, rooster en boekhouding, en geen tijd om ze te combineren.',
      },
      {
        id: 'oplossing',
        label: 'De oplossing',
        text: 'Een SaaS-platform voor meerdere bedrijven tegelijk, met kassakoppelingen, AI-adviesrapporten, rollen en rechten.',
      },
      {
        id: 'techniek',
        label: 'Techniek',
        text: 'React, Supabase in de EU, een eigen koppelingslaag en AI op Europese servers. Data strikt gescheiden per klant.',
      },
      {
        id: 'resultaat',
        label: 'Resultaat',
        text: 'Ondernemers zien hun stuurinformatie op één plek, automatisch bijgewerkt, zonder handwerk.',
      },
    ],
    image: {
      src: hppDashboardImage,
      alt: 'Dashboard van HPP-Dashboard met omzet van vandaag, gemiddelde bon, voorraad, HACCP-taken, omzet per groep en top 5 artikelen.',
      placeholder: false,
    },
    demoLines: [
      'Omzet deze week: automatisch uit de kassa',
      'Personeelskosten: uit het rooster',
      'AI-advies: marge per dagdeel',
    ],
  },
  {
    id: 'yogacompany',
    name: 'YogaCompany.eu',
    sector: 'Yoga-opleidingen',
    kind: 'Opleidingsplatform',
    url: 'https://yogacompany.eu',
    urlLabel: 'yogacompany.eu',
    summary:
      'Website met klantportaal waar cursisten hun opleiding online volgen en de organisatie alles op één plek beheert.',
    tone: 'pink',
    tabs: [
      {
        id: 'vraag',
        label: 'De vraag',
        text: 'Een opleidingsinstituut wil cursisten, lesstof, boekingen en betalingen op één plek beheren, zonder technische kennis.',
      },
      {
        id: 'oplossing',
        label: 'De oplossing',
        text: 'Website met klantportaal, betaalde lesstof met voortgang per cursist en een eenvoudige beheeromgeving.',
      },
      {
        id: 'techniek',
        label: 'Techniek',
        text: 'Next.js, Supabase in de EU, tweestapsverificatie, AVG-proof ingericht.',
      },
      {
        id: 'resultaat',
        label: 'Resultaat',
        text: 'Cursisten volgen hun opleiding online; de organisatie heeft overzicht zonder losse lijstjes.',
      },
    ],
    image: {
      src: yogaCompanyImage,
      alt: 'Homepage van YogaCompany.eu: menu met Academy, workshops en privéyoga, en een foto van een yogahouding met de knoppen Boek privé yoga en Ontdek de opleidingen.',
      placeholder: false,
    },
    demoLines: ['Module 3 van 8: afgerond', 'Volgende les: zaterdag 10:00', 'Betaling: voldaan'],
  },
];

export function findCase(id: CaseId): Case {
  const found = cases.find((item) => item.id === id);
  if (!found) throw new Error(`Onbekende case: ${id}`);
  return found;
}
