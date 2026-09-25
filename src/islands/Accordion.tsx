import { useId, useRef, useState } from 'react';
import { nextIndexForKey } from '../lib/keyboard';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: readonly AccordionItem[];
}

/**
 * Accordeon met één open paneel tegelijk. Koppen zijn knoppen met
 * aria-expanded en aria-controls; pijltjestoetsen springen tussen koppen.
 */
export default function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const baseId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndexForKey(event.key, index, items.length);
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const buttonId = `${baseId}-${item.id}-knop`;
        const panelId = `${baseId}-${item.id}-paneel`;
        return (
          <div key={item.id} className="card overflow-hidden">
            <h3 className="m-0 text-lg">
              <button
                type="button"
                id={buttonId}
                ref={(element) => {
                  buttons.current[index] = element;
                }}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={`flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3 text-left font-bold transition-colors duration-[120ms] ${
                  isOpen ? 'bg-lime' : 'bg-paper hover:bg-stone'
                }`}
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-paper text-xl leading-none"
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="border-t-[3px] border-ink px-5 py-4"
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
