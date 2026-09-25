import type { PackageId } from './packages';

/**
 * De zes soorten applicaties in de AppExplorer op /applicaties.
 */
export type AppFilter = 'alles' | 'klanten' | 'team' | 'overzicht';

export const appFilters: readonly { id: AppFilter; label: string }[] = [
  { id: 'alles', label: 'Alles' },
  { id: 'klanten', label: 'Voor klanten' },
  { id: 'team', label: 'Voor je team' },
  { id: 'overzicht', label: 'Voor overzicht' },
];

export interface AppType {
  id: string;
  name: string;
  packageId: PackageId;
  filters: readonly Exclude<AppFilter, 'alles'>[];
  description: string;
  /** Drie regels demo-data voor het voorbeeldscherm. */
  demoLines: readonly [string, string, string];
  tags: readonly string[];
}

export const appTypes: readonly AppType[] = [
  {
    id: 'klantportaal',
    name: 'Klantportaal',
    packageId: 'app-pro',
    filters: ['klanten'],
    description:
      'Je klanten loggen in, zien hun gegevens, documenten en status, en regelen zaken zelf. Jij hebt minder mail en meer overzicht.',
    demoLines: [
      'Order 2041: onderweg',
      'Factuur augustus: betaald',
      'Nieuw verzoek: offerte aanvragen',
    ],
    tags: ['Inloggen met 2FA', 'Documenten', 'Statusupdates'],
  },
  {
    id: 'boekingssysteem',
    name: 'Boekingssysteem',
    packageId: 'app-start',
    filters: ['klanten'],
    description:
      'Klanten boeken online een afspraak, plek of dienst. Bevestiging, herinnering en betaling gaan automatisch.',
    demoLines: ['Di 10:00: 2 plekken vrij', 'Wo 14:00: volgeboekt', 'Herinnering: 24 uur vooraf'],
    tags: ['Agenda', 'Online betalen', 'Herinneringen'],
  },
  {
    id: 'teamplanning',
    name: 'Teamplanning',
    packageId: 'app-start',
    filters: ['team'],
    description:
      'Roosters, beschikbaarheid en taken op één plek. Je team ziet op de telefoon wat er vandaag moet gebeuren.',
    demoLines: ['Ochtend: 4 van 4 bezet', 'Middag: 1 plek open', 'Taak: voorraad tellen'],
    tags: ['Rooster', 'Taken', 'Mobiel'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    packageId: 'app-pro',
    filters: ['overzicht'],
    description:
      'Cijfers uit kassa, boekhouding en andere systemen automatisch bij elkaar, met rapporten die je echt leest.',
    demoLines: ['Omzet week 38: bijgewerkt', 'Marge: per dagdeel', 'Rapport: elke maandag'],
    tags: ['Koppelingen', 'Rapportages', 'AI-advies'],
  },
  {
    id: 'ledenomgeving',
    name: 'Ledenomgeving',
    packageId: 'app-pro',
    filters: ['klanten', 'overzicht'],
    description:
      'Leden of cursisten krijgen een eigen omgeving met lesstof, voortgang en betalingen. Jij beheert alles zonder losse lijstjes.',
    demoLines: ['Module 3 van 8: afgerond', 'Abonnement: actief', 'Volgende les: zaterdag'],
    tags: ['Abonnementen', 'Lesstof', 'Voortgang'],
  },
  {
    id: 'saas',
    name: 'Eigen SaaS',
    packageId: 'app-platform',
    filters: ['klanten', 'team', 'overzicht'],
    description:
      'Jouw idee als product voor meerdere bedrijven tegelijk, met abonnementen, rollen en data strikt gescheiden per klant.',
    demoLines: [
      'Klanten: gescheiden per omgeving',
      'Abonnementen: maandelijks',
      'Rollen: beheerder, medewerker',
    ],
    tags: ['Multi-tenant', 'Abonnementen', 'AI'],
  },
];
