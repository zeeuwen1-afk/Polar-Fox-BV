/**
 * Alle pakketten en prijzen: één bron van waarheid. Bedragen in euro, excl. btw.
 * Pagina's, calculators en JSON-LD importeren dit bestand; nergens staan losse bedragen.
 */

export type PackageId =
  | 'web-essentie'
  | 'web-groei'
  | 'web-maatwerk'
  | 'app-start'
  | 'app-pro'
  | 'app-platform'
  | 'beheer-web'
  | 'beheer-app';

export type PackageGroupId = 'websites' | 'apps' | 'beheer';

export interface Package {
  id: PackageId;
  name: string;
  /** Maandbedrag excl. btw. */
  monthly: number;
  /** Eenmalige startbijdrage excl. btw. Beheerpakketten hebben er geen (wel een overname-check). */
  start?: number;
  /** Startbijdrage is een vanaf-prijs. */
  startFrom?: boolean;
  /** Urenbudget, als tekst zoals het op de site staat. */
  hours: string;
  recommended?: boolean;
  features: readonly [string, string, string];
}

export interface PackageGroup {
  id: PackageGroupId;
  title: string;
  minTermMonths: number;
  /** Alleen bij beheer: eenmalige overname-check in plaats van een startbijdrage. */
  checkFee?: number;
  items: readonly Package[];
}

export const packages = {
  websites: {
    id: 'websites',
    title: 'Websites',
    minTermMonths: 12,
    items: [
      {
        id: 'web-essentie',
        name: 'Website Essentie',
        monthly: 99,
        start: 495,
        hours: '30 min p/m',
        features: [
          'Tot 6 pagina’s',
          'Contactformulier en basis-SEO',
          '30 min aanpassingen per maand',
        ],
      },
      {
        id: 'web-groei',
        name: 'Website Groei',
        monthly: 189,
        start: 795,
        hours: '1 uur p/m',
        recommended: true,
        features: [
          'Tot 15 pagina’s, zelf beheren',
          'Blog en nieuwsbrief',
          '1 uur aanpassingen per maand',
        ],
      },
      {
        id: 'web-maatwerk',
        name: 'Website Maatwerk',
        monthly: 299,
        start: 1250,
        hours: '2 uur p/m',
        features: ['Onbeperkt pagina’s', 'Boeken of aanvragen', '2 uur aanpassingen per maand'],
      },
    ],
  },
  apps: {
    id: 'apps',
    title: 'Applicaties',
    minTermMonths: 24,
    items: [
      {
        id: 'app-start',
        name: 'App Start',
        monthly: 449,
        start: 2450,
        hours: '2 uur p/m',
        features: [
          'Eén kernproces',
          'Inloggen met 2FA, 1 koppeling',
          '2 uur doorontwikkeling per maand',
        ],
      },
      {
        id: 'app-pro',
        name: 'App Pro',
        monthly: 849,
        start: 4950,
        hours: '4 uur p/m',
        recommended: true,
        features: [
          'Meerdere rollen, online betalen',
          'Tot 3 koppelingen',
          '4 uur doorontwikkeling per maand',
        ],
      },
      {
        id: 'app-platform',
        name: 'App Platform',
        monthly: 1495,
        start: 7500,
        startFrom: true,
        hours: 'op maat',
        features: ['Jouw eigen SaaS', 'Abonnementen en AI', 'Urenbudget op maat'],
      },
    ],
  },
  beheer: {
    id: 'beheer',
    title: 'Beheer en overname',
    minTermMonths: 12,
    checkFee: 295,
    items: [
      {
        id: 'beheer-web',
        name: 'Beheer Website',
        monthly: 59,
        hours: '30 min p/m',
        features: ['Hosting en updates', 'Back-ups en bewaking', '30 min aanpassingen per maand'],
      },
      {
        id: 'beheer-app',
        name: 'Beheer Applicatie',
        monthly: 199,
        hours: '1 uur p/m',
        recommended: true,
        features: ['Database en hosting', 'Incidentafhandeling', '1 uur per maand'],
      },
    ],
  },
  extras: {
    /** Extra uren buiten het budget, excl. btw. */
    hourlyRate: 95,
    /** Strippenkaart van 10 uur, excl. btw. */
    tenHourCard: 875,
    /** Bij jaarbetaling betaal je 11 maanden voor 12. */
    yearlyMonthsCharged: 11,
  },
} as const satisfies {
  websites: PackageGroup;
  apps: PackageGroup;
  beheer: PackageGroup;
  extras: { hourlyRate: number; tenHourCard: number; yearlyMonthsCharged: number };
};

export const packageGroups: readonly PackageGroup[] = [
  packages.websites,
  packages.apps,
  packages.beheer,
];

/** Alle pakketten plat, in de volgorde van de site. */
export const allPackages: readonly Package[] = packageGroups.flatMap((group) => group.items);

export function findPackage(id: PackageId): Package {
  const found = allPackages.find((item) => item.id === id);
  if (!found) throw new Error(`Onbekend pakket: ${id}`);
  return found;
}

export function groupOf(id: PackageId): PackageGroup {
  const group = packageGroups.find((candidate) => candidate.items.some((item) => item.id === id));
  if (!group) throw new Error(`Geen groep voor pakket: ${id}`);
  return group;
}

/** Laagste maandbedrag per groep, voor "vanaf € … p/m". */
export function lowestMonthly(groupId: PackageGroupId): number {
  return Math.min(...packages[groupId].items.map((item) => item.monthly));
}

/** Laagste startbijdrage per groep, voor "startbijdrage vanaf € …". */
export function lowestStart(groupId: 'websites' | 'apps'): number {
  return Math.min(...packages[groupId].items.map((item) => item.start));
}

/** Altijd inbegrepen, bij elk pakket. */
export const alwaysIncluded = [
  'Ontwerp op maat',
  'Hosting in de EU',
  'Dagelijkse back-ups',
  'Updates en beveiliging',
  'WCAG 2.1 AA',
  'Verwerkersovereenkomst',
  'Reactie binnen 1 werkdag',
  'Eén vast aanspreekpunt',
] as const;

/** Reactietijden bij storingen en verzoeken. */
export const responseTimes = [
  {
    situation: 'Site of app onbereikbaar',
    response: 'Reactie binnen 4 kantooruren',
    resolution: 'Werkende oplossing binnen 1 werkdag',
    tone: 'pink',
  },
  {
    situation: 'Belangrijke functie werkt niet',
    response: 'Reactie binnen 1 werkdag',
    resolution: 'Opgelost binnen 3 werkdagen',
    tone: 'sun',
  },
  {
    situation: 'Kleine wijziging',
    response: 'Reactie binnen 2 werkdagen',
    resolution: 'Binnen het urenbudget',
    tone: 'paper',
  },
] as const;

/** Het proces in vier stappen (homepage) en vijf stappen (werkwijze). */
export const processSteps = [
  {
    number: '01',
    title: 'Intake op locatie',
    short: 'We komen langs, kijken mee op de werkvloer en spreken de mensen die ermee gaan werken.',
    duration: '1 à 2 uur',
    youGet: 'Eerste advies',
    cost: 'Gratis',
    tone: 'lime',
  },
  {
    number: '02',
    title: 'Voorstel',
    short: 'Binnen 5 werkdagen een voorstel met een vaste prijs. Geen verrassingen achteraf.',
    duration: 'Binnen 5 werkdagen',
    youGet: 'Vaste prijs',
    cost: 'Gratis',
    tone: 'pink',
  },
  {
    number: '03',
    title: 'Ontwerp',
    short: 'Eerst een klikbaar prototype, zodat je ziet en voelt wat het wordt voordat we bouwen.',
    duration: '1 tot 2 weken',
    youGet: 'Klikbaar prototype',
    cost: 'In startbijdrage',
    tone: 'sky',
  },
  {
    number: '04',
    title: 'Bouwen',
    short: 'We bouwen in korte rondes en laten elke week zien wat er af is.',
    duration: '2 tot 10 weken',
    youGet: 'Wekelijkse demo',
    cost: 'In maandbedrag',
    tone: 'sun',
  },
  {
    number: '05',
    title: 'Live en beheer',
    short: 'Hosting, updates, back-ups en doorontwikkeling voor een vast bedrag per maand.',
    duration: 'Zolang je wilt',
    youGet: 'Maandoverzicht',
    cost: 'In maandbedrag',
    tone: 'lime',
  },
] as const;
