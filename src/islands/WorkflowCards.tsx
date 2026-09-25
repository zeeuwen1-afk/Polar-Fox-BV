import { useRef, useState } from 'react';
import { nextIndexForKey } from '../lib/keyboard';
import { toneBg, type Tone } from '../lib/tones';

export interface WorkflowStep {
  number: string;
  title: string;
  short: string;
  duration: string;
  tone: Extract<Tone, 'lime' | 'pink' | 'sky' | 'sun'>;
}

export interface WorkflowCardsProps {
  steps: readonly WorkflowStep[];
}

/**
 * Vier klikbare kaarten (1 t/m 4). De actieve kaart krijgt haar accentkleur.
 * Knoppen met aria-pressed; pijltjestoetsen springen tussen de kaarten.
 */
export default function WorkflowCards({ steps }: WorkflowCardsProps) {
  const [active, setActive] = useState(0);

  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndexForKey(event.key, index, steps.length);
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = index === active;
        return (
          <li key={step.number}>
            <button
              type="button"
              aria-pressed={isActive}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`card flex h-full w-full flex-col items-start gap-3 p-5 text-left transition-colors duration-[120ms] ${
                isActive ? toneBg[step.tone] : 'bg-paper hover:bg-stone'
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-paper text-lg font-bold">
                {index + 1}
              </span>
              <span className="text-xl font-bold tracking-tight">{step.title}</span>
              <span className="text-base">{step.short}</span>
              <span className="mt-auto inline-block rounded-[8px] bg-ink px-3 py-1 text-sm font-bold text-paper">
                {step.duration}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
