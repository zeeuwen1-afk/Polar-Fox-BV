import { useId, useRef, useState } from 'react';
import { nextIndexForKey } from '../lib/keyboard';
import { toneBg, type Tone } from '../lib/tones';

export interface TimelineStep {
  number: string;
  title: string;
  short: string;
  duration: string;
  youGet: string;
  cost: string;
  tone: Extract<Tone, 'lime' | 'pink' | 'sky' | 'sun'>;
}

export interface StepTimelineProps {
  steps: readonly TimelineStep[];
}

/**
 * Vijf klikbare stappen (tabs) met daaronder een zwarte kaart die titel,
 * tekst en drie witte regels toont: Duur, Jij krijgt, Kosten.
 */
export default function StepTimeline({ steps }: StepTimelineProps) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const step = steps[active];
  if (!step) return null;

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndexForKey(event.key, index, steps.length);
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Stappen" className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {steps.map((item, index) => {
          const selected = index === active;
          return (
            <div key={item.number}>
              <button
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                ref={(element) => {
                  buttons.current[index] = element;
                }}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={`card flex min-h-24 w-full flex-col items-start gap-1 p-4 text-left transition-colors duration-[120ms] ${
                  selected ? toneBg[item.tone] : 'bg-paper hover:bg-stone'
                }`}
              >
                <span className="text-sm font-bold tracking-wide">{item.number}</span>
                <span className="text-lg leading-tight font-bold tracking-tight">{item.title}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
        className="card-lg on-ink mt-6 bg-ink p-6 text-paper md:p-8"
      >
        <p className="text-sm font-bold tracking-wide text-lime">Stap {step.number}</p>
        <h3 className="mt-1 text-3xl text-paper">{step.title}</h3>
        <p className="mt-3 text-lg text-paper/85">{step.short}</p>
        <dl className="mt-6 grid gap-3 md:grid-cols-3">
          {(
            [
              ['Duur', step.duration],
              ['Jij krijgt', step.youGet],
              ['Kosten', step.cost],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-[12px] border-[3px] border-ink bg-paper p-4 text-ink"
            >
              <dt className="text-sm font-bold tracking-wide uppercase">{label}</dt>
              <dd className="m-0 mt-1 text-lg font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
