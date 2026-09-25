/**
 * Bedrijfs- en sitegegevens: één bron van waarheid voor footer, metadata,
 * JSON-LD, juridische pagina's en contactplekken.
 */
export const site = {
  legalName: 'Polar Fox B.V.',
  name: 'Polar Fox',
  city: 'Huizen',
  kvk: '75362538',
  /** TODO: btw-identificatienummer invullen (zie docs/OPENSTAAND.md). */
  btw: '{{BTW}}',
  domain: 'polarfoxbv.nl',
  url: 'https://polarfoxbv.nl',
  email: 'info@polarfoxbv.nl',
  phone: '085-2009981',
  /** Internationale notatie voor tel:-links. */
  phoneHref: 'tel:+31852009981',
  tagline: 'Maatwerk apps en websites op abonnementsbasis.',
  description:
    'Polar Fox bouwt en beheert maatwerk apps en websites voor een vast bedrag per maand. Altijd persoonlijk: de intake doen we bij jou op locatie.',
} as const;

/** Vaste zinnen die op meerdere plekken terugkomen (briefing hoofdstuk 5). */
export const copy = {
  promise: 'Maatwerk software.',
  promiseMark: 'Vast bedrag.',
  subline:
    'Apps en websites die precies passen bij hoe jij werkt. Gebouwd, gehost en onderhouden door één vaste partner. Geen gedoe, geen verrassingen.',
  personal: 'Altijd persoonlijk. De intake doen we bij jou op locatie.',
  proofTitle: 'Geen beloftes. Draaiende software.',
  proofText: 'We bouwen niet alleen voor anderen. We draaien zelf twee platforms, elke dag.',
  exit: 'Stop je? Dan neem je alles mee. Domein, content en data zijn altijd van jou. Na de looptijd krijg je op verzoek ook je broncode.',
  promo: 'De eerste vijf klanten krijgen 50% korting op de startbijdrage.',
  priceNote: 'Alle prijzen excl. btw.',
} as const;

/** Menubalk: volgorde is de volgorde in de briefing. */
export const navigation = [
  { href: '/applicaties', label: 'Applicaties' },
  { href: '/websites', label: 'Websites' },
  { href: '/prijzen', label: 'Prijzen' },
  { href: '/cases', label: 'Cases' },
  { href: '/werkwijze', label: 'Werkwijze' },
] as const;

export const footerColumns = [
  {
    title: 'Diensten',
    links: [
      { href: '/applicaties', label: 'Applicaties' },
      { href: '/websites', label: 'Websites' },
      { href: '/prijzen', label: 'Prijzen' },
    ],
  },
  {
    title: 'Bedrijf',
    links: [
      { href: '/cases', label: 'Cases' },
      { href: '/werkwijze', label: 'Werkwijze' },
      { href: '/intake', label: 'Intake' },
    ],
  },
  {
    title: 'Juridisch',
    links: [
      { href: '/juridisch/algemene-voorwaarden', label: 'Algemene voorwaarden' },
      { href: '/juridisch/privacyverklaring', label: 'Privacyverklaring' },
      { href: '/juridisch/cookieverklaring', label: 'Cookieverklaring' },
      { href: '/juridisch/toegankelijkheidsverklaring', label: 'Toegankelijkheidsverklaring' },
      { href: '/juridisch/verwerkersovereenkomst', label: 'Verwerkersovereenkomst' },
    ],
  },
] as const;
