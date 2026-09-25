import { useId, useState } from 'react';
import { appFilters, appTypes, type AppFilter } from '../content/appTypes';
import { findPackage } from '../content/packages';
import { formatEuro } from '../lib/pricing';

/**
 * Verkenner op /applicaties: filters (aria-pressed), zes kaarten (aria-pressed)
 * en een zwart detailpaneel met omschrijving, voorbeeldscherm en tags.
 */
export default function AppExplorer() {
  const [filter, setFilter] = useState<AppFilter>('alles');
  const [selectedId, setSelectedId] = useState(appTypes[0]?.id ?? '');
  const panelId = useId();

  const visible = appTypes.filter((app) => filter === 'alles' || app.filters.includes(filter));
  const selected = appTypes.find((app) => app.id === selectedId) ?? appTypes[0];
  if (!selected) return null;
  const pkg = findPackage(selected.packageId);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
      <div>
        <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
          {appFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`sticker tilt-0 min-h-11 cursor-pointer ${
                filter === item.id ? 'bg-lime' : 'bg-paper hover:bg-stone'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2" aria-live="polite">
          {visible.map((app) => {
            const isSelected = app.id === selected.id;
            const appPkg = findPackage(app.packageId);
            return (
              <li key={app.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-controls={panelId}
                  onClick={() => setSelectedId(app.id)}
                  className={`card flex h-full w-full flex-col items-start gap-2 p-5 text-left transition-colors duration-[120ms] ${
                    isSelected ? 'bg-lime' : 'bg-paper hover:bg-stone'
                  }`}
                >
                  <span className="text-xl font-bold tracking-tight">{app.name}</span>
                  <span className="text-sm font-bold">
                    {appPkg.name} · vanaf {formatEuro(appPkg.monthly)} p/m
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {visible.length === 0 && <p className="mt-4">Geen apps in dit filter.</p>}
      </div>

      <div
        id={panelId}
        className="card-lg on-ink self-start bg-ink p-6 text-paper shadow-hard-lg-pink md:p-8"
        aria-live="polite"
      >
        <p className="text-sm font-bold tracking-wide text-lime uppercase">{pkg.name}</p>
        <h3 className="mt-2 text-3xl text-paper">{selected.name}</h3>
        <p className="mt-3 text-paper/85">{selected.description}</p>

        <div className="mt-6 rounded-[12px] border-[3px] border-paper/30 bg-paper/5 p-4">
          <p className="text-xs font-bold tracking-wide text-paper/60 uppercase">Voorbeeldscherm</p>
          <ul className="mt-2 flex flex-col gap-2">
            {selected.demoLines.map((line) => (
              <li key={line} className="flex items-center gap-2 text-sm">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-lime" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Kenmerken">
          {selected.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border-[3px] border-paper px-3 py-1 text-sm font-bold"
            >
              {tag}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-lg font-bold">vanaf {formatEuro(pkg.monthly)} p/m excl. btw</p>
        <a href={`/intake?soort=app`} className="btn btn-lime mt-4 w-full">
          Bespreek je idee
        </a>
      </div>
    </div>
  );
}
