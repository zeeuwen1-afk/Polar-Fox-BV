import { useId, useRef, useState } from 'react';
import { nextIndexForKey } from '../lib/keyboard';

export interface CaseTab {
  id: string;
  label: string;
  text: string;
}

export interface CaseTabsProps {
  tabs: readonly CaseTab[];
  /** Naam van de case, voor de toegankelijke naam van de tablist. */
  name: string;
}

/**
 * Tabbladen (De vraag, De oplossing, Techniek, Resultaat) volgens het
 * tabs-patroon: role="tablist", pijltjestoetsen, één tabpanel zichtbaar.
 */
export default function CaseTabs({ tabs, name }: CaseTabsProps) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndexForKey(event.key, index, tabs.length);
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={`${name}: onderdelen`} className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => {
          const selected = index === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`min-h-11 rounded-[10px] border-[3px] border-ink px-4 font-bold transition-colors duration-[120ms] ${
                selected ? 'bg-ink text-paper' : 'bg-paper hover:bg-stone'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={index !== active}
          tabIndex={0}
          className="card mt-4 bg-paper p-5 text-lg"
        >
          {tab.text}
        </div>
      ))}
    </div>
  );
}
