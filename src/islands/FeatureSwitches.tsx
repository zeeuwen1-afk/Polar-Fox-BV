import { useId, useState } from 'react';
import { lowestStart, type PackageId } from '../content/packages';
import { formatEuro } from '../lib/pricing';
import {
  COMPLEXITY_BLOCKS,
  features,
  recommendFor,
  type FeatureId,
  type ProjectKind,
} from '../lib/recommend';

export interface FeatureSwitchesProps {
  /** Aantal schakelaars dat op mobiel direct zichtbaar is; de rest achter "Meer functies". */
  mobileVisible?: number;
}

type Kind = Extract<ProjectKind, 'website' | 'app'>;

/**
 * "Zet aan wat je nodig hebt." Keuze Website/App, acht schakelaars
 * (role="switch") en een lime resultaatkaart met pakketadvies en
 * complexiteitsmeter, berekend door recommend.ts.
 */
export default function FeatureSwitches({ mobileVisible = 5 }: FeatureSwitchesProps) {
  const [kind, setKind] = useState<Kind>('app');
  const [selected, setSelected] = useState<ReadonlySet<FeatureId>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const headingId = useId();

  const result = recommendFor(kind, selected);
  const pkg = result.pkg;
  const count = result.featureCount;
  const startFrom = kind === 'app' ? lowestStart('apps') : lowestStart('websites');

  const toggle = (id: FeatureId) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const intakeHref = `/intake?soort=${kind}${
    selected.size ? `&functies=${[...selected].join(',')}` : ''
  }`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
      <div>
        <div
          role="group"
          aria-label="Soort project"
          className="inline-flex rounded-[12px] border-[3px] border-paper p-1"
        >
          {(
            [
              ['website', 'Website'],
              ['app', 'App'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={kind === id}
              onClick={() => setKind(id)}
              className={`min-h-11 rounded-[8px] px-5 font-bold transition-colors duration-[120ms] ${
                kind === id ? 'bg-lime text-ink' : 'text-paper hover:bg-paper/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2" aria-labelledby={headingId}>
          <li className="sr-only" id={headingId}>
            Functies
          </li>
          {features.map((feature, index) => {
            const on = selected.has(feature.id);
            const hiddenOnMobile = !showAll && index >= mobileVisible;
            return (
              <li key={feature.id} className={hiddenOnMobile ? 'hidden sm:block' : ''}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(feature.id)}
                  className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-[12px] border-[3px] border-paper px-4 text-left font-bold transition-colors duration-[120ms] ${
                    on ? 'bg-lime text-ink' : 'bg-transparent text-paper hover:bg-paper/10'
                  }`}
                >
                  <span>{feature.label}</span>
                  <span
                    aria-hidden="true"
                    className={`relative h-7 w-12 shrink-0 rounded-full border-[3px] ${
                      on ? 'border-ink bg-ink' : 'border-paper bg-transparent'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full transition-[left] duration-[120ms] ${
                        on ? 'left-6 bg-lime' : 'left-0.5 bg-paper'
                      }`}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {features.length > mobileVisible && (
          <button
            type="button"
            className="mt-4 font-bold text-paper underline underline-offset-4 sm:hidden"
            aria-expanded={showAll}
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? 'Minder functies' : `Meer functies (${features.length - mobileVisible})`}
          </button>
        )}
      </div>

      <div
        className="card-lg on-paper self-start bg-lime p-6 text-ink shadow-hard-lg-pink md:p-8"
        aria-live="polite"
        data-testid="feature-result"
      >
        <p className="text-sm font-bold tracking-wide uppercase">Ons advies</p>
        <p
          className="mt-2 text-3xl font-bold tracking-tight md:text-4xl"
          data-testid="feature-package"
        >
          {result.label}
        </p>
        {pkg && <p className="mt-1 text-xl font-bold">vanaf {formatEuro(pkg.monthly)} p/m</p>}

        <div className="mt-6">
          <p className="text-sm font-bold">
            Complexiteit: {result.complexity} van {COMPLEXITY_BLOCKS}
          </p>
          <div className="mt-2 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: COMPLEXITY_BLOCKS }, (_, index) => (
              <span key={index} className="meter-block" data-filled={index < result.complexity} />
            ))}
          </div>
        </div>

        <p className="mt-6">
          {count} {count === 1 ? 'functie' : 'functies'} aan. Vanaf-prijs excl. btw, plus
          startbijdrage vanaf {formatEuro(startFrom)}.
        </p>

        <a href={intakeHref} className="btn btn-ink mt-6 w-full">
          Bespreek dit bij een intake
        </a>
      </div>
    </div>
  );
}

export type { PackageId };
