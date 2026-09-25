import { findPackage, type Package } from '../content/packages';

/**
 * Aanbevelingslogica voor de functieschakelaars op de homepage en de
 * samenvatting in het intakeformulier. Pure functie, getest in recommend.test.ts.
 */

export type ProjectKind = 'website' | 'app' | 'beheer' | 'onbekend';

export const projectKinds: readonly { id: ProjectKind; label: string }[] = [
  { id: 'website', label: 'Een website' },
  { id: 'app', label: 'Een applicatie' },
  { id: 'beheer', label: 'Beheer of overname' },
  { id: 'onbekend', label: 'Weet ik nog niet' },
];

export type FeatureId =
  'boeken' | 'accounts' | 'betalen' | 'koppelingen' | 'meertalig' | 'ai' | 'rapportages' | 'team';

export const features: readonly { id: FeatureId; label: string }[] = [
  { id: 'boeken', label: 'Online boeken' },
  { id: 'accounts', label: 'Klantaccounts' },
  { id: 'betalen', label: 'Online betalen' },
  { id: 'koppelingen', label: 'Koppelingen' },
  { id: 'meertalig', label: 'Meertalig' },
  { id: 'ai', label: 'AI-assistent' },
  { id: 'rapportages', label: 'Rapportages' },
  { id: 'team', label: 'Team en rechten' },
];

export const featureIds: readonly FeatureId[] = features.map((feature) => feature.id);

export const COMPLEXITY_BLOCKS = 8;

export interface Recommendation {
  /** Het aanbevolen pakket, of null bij "Samen bepalen". */
  pkg: Package | null;
  /** Naam om te tonen: pakketnaam of "Samen bepalen". */
  label: string;
  /** Aantal gevulde blokjes van de complexiteitsmeter (0 t/m 8). */
  complexity: number;
  featureCount: number;
}

export function recommend(kind: ProjectKind, featureCount: number): Recommendation {
  const n = Math.max(0, Math.min(COMPLEXITY_BLOCKS, Math.floor(featureCount)));
  const complexity = Math.min(COMPLEXITY_BLOCKS, n + (kind === 'app' ? 1 : 0));

  let pkg: Package | null;
  switch (kind) {
    case 'website':
      pkg = findPackage(n <= 1 ? 'web-essentie' : n <= 3 ? 'web-groei' : 'web-maatwerk');
      break;
    case 'app':
      pkg = findPackage(n <= 1 ? 'app-start' : n <= 4 ? 'app-pro' : 'app-platform');
      break;
    case 'beheer':
      pkg = findPackage(n > 1 ? 'beheer-app' : 'beheer-web');
      break;
    case 'onbekend':
      pkg = null;
      break;
  }

  return {
    pkg,
    label: pkg?.name ?? 'Samen bepalen',
    complexity,
    featureCount: n,
  };
}

/** Handig voor componenten die een set van FeatureId's bijhouden. */
export function recommendFor(kind: ProjectKind, selected: Iterable<FeatureId>): Recommendation {
  return recommend(kind, new Set(selected).size);
}
