import { useState } from 'react';
import { allPackages, groupOf, type PackageId } from '../content/packages';
import { formatEuro, totalFor } from '../lib/pricing';

const periods = [12, 24, 36] as const;

/**
 * Totaalberekening: kies een pakket en een periode, zie
 * "startbijdrage + maanden × maandbedrag" en het totaal (excl. btw).
 * Chips zijn radiogroepen met echte inputs; de uitkomst staat in een live-region.
 */
export default function TotalCalculator() {
  const [packageId, setPackageId] = useState<PackageId>('app-start');
  const [months, setMonths] = useState<(typeof periods)[number]>(24);

  const breakdown = totalFor(packageId, months);
  const group = groupOf(packageId);
  const upfrontLabel = group.id === 'beheer' ? 'overname-check' : 'startbijdrage';
  const shortTerm = months < group.minTermMonths;

  return (
    <div className="card-lg on-ink bg-ink p-6 text-paper shadow-hard-lg-lime md:p-8">
      <h3 className="text-3xl text-paper">Reken het uit</h3>

      <fieldset className="mt-6 border-0 p-0">
        <legend className="mb-3 font-bold text-lime">Pakket</legend>
        <div className="flex flex-wrap gap-2">
          {allPackages.map((item) => {
            const checked = item.id === packageId;
            return (
              <label
                key={item.id}
                className={`sticker tilt-0 cursor-pointer has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-lime ${
                  checked ? 'bg-lime' : 'bg-paper'
                }`}
              >
                <input
                  type="radio"
                  name="pakket"
                  value={item.id}
                  checked={checked}
                  onChange={() => setPackageId(item.id)}
                  className="sr-only"
                />
                {item.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-0 p-0">
        <legend className="mb-3 font-bold text-lime">Periode</legend>
        <div className="flex flex-wrap gap-2">
          {periods.map((period) => {
            const checked = period === months;
            return (
              <label
                key={period}
                className={`sticker tilt-0 cursor-pointer has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-lime ${
                  checked ? 'bg-lime' : 'bg-paper'
                }`}
              >
                <input
                  type="radio"
                  name="periode"
                  value={period}
                  checked={checked}
                  onChange={() => setMonths(period)}
                  className="sr-only"
                />
                {period} maanden
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 rounded-[12px] border-[3px] border-paper/30 p-4" aria-live="polite">
        <p className="text-paper/80">
          {upfrontLabel} {formatEuro(breakdown.upfront)} + {breakdown.months} ×{' '}
          {formatEuro(breakdown.monthly)}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl" data-testid="calc-total">
          {breakdown.isFrom ? 'vanaf ' : ''}
          {formatEuro(breakdown.total)}
        </p>
        <p className="mt-2 text-sm text-paper/80">
          Totaal excl. btw, alles inbegrepen: bouw, hosting, onderhoud en uren.
        </p>
        {shortTerm && (
          <p className="mt-2 text-sm text-sun">
            Let op: de minimale looptijd van dit pakket is {group.minTermMonths} maanden.
          </p>
        )}
      </div>
    </div>
  );
}
