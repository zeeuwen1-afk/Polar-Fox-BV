import { findPackage, groupOf, packages, type PackageId } from '../content/packages';

/**
 * Rekenregels voor prijzen. Pure functies, getest in pricing.test.ts.
 * Alle bedragen in hele euro's, excl. btw.
 */

/** Maandprijs bij jaarbetaling: 11 maanden betalen voor 12, afgerond op hele euro's. */
export function yearlyMonthly(monthly: number): number {
  return Math.round((monthly * packages.extras.yearlyMonthsCharged) / 12);
}

/** Eenmalig bedrag bij de start: startbijdrage, of de overname-check bij beheer. */
export function upfrontFor(id: PackageId): number {
  const item = findPackage(id);
  if (item.start !== undefined) return item.start;
  return groupOf(id).checkFee ?? 0;
}

export interface TotalBreakdown {
  upfront: number;
  months: number;
  monthly: number;
  total: number;
  /** De startbijdrage is een vanaf-prijs, dus het totaal ook. */
  isFrom: boolean;
}

/** Totaal over een looptijd: eenmalig bedrag + maanden × maandbedrag. */
export function totalFor(id: PackageId, months: number): TotalBreakdown {
  if (!Number.isInteger(months) || months < 1) {
    throw new RangeError('Looptijd moet een geheel aantal maanden van minimaal 1 zijn.');
  }
  const item = findPackage(id);
  const upfront = upfrontFor(id);
  return {
    upfront,
    months,
    monthly: item.monthly,
    total: upfront + months * item.monthly,
    isFrom: item.startFrom === true,
  };
}

/**
 * Eerder stoppen binnen de minimale looptijd: 50% van de resterende maandbedragen.
 * `monthsUsed` is het aantal al betaalde maanden.
 */
export function earlyExitFee(id: PackageId, monthsUsed: number): number {
  if (!Number.isInteger(monthsUsed) || monthsUsed < 0) {
    throw new RangeError('Aantal gebruikte maanden moet 0 of hoger zijn.');
  }
  const item = findPackage(id);
  const remaining = Math.max(0, groupOf(id).minTermMonths - monthsUsed);
  return Math.round(remaining * item.monthly * 0.5);
}

/** Euro-notatie zoals op de site: "€ 1.250". Zonder decimalen, met punt als duizendtal. */
export function formatEuro(amount: number): string {
  const formatted = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  // Intl zet een (smalle) no-break space tussen het euroteken en het bedrag (U+00A0 of U+202F);
  // we maken er een gewone spatie van, zodat teksten en tests voorspelbaar zijn.
  return formatted.replace(/[\u00a0\u202f]/g, ' ');
}
