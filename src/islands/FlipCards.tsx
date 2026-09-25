import { useId, useState } from 'react';

export interface FlipItem {
  id: string;
  question: string;
  answer: string;
}

export interface FlipCardsProps {
  items: readonly FlipItem[];
  /** Aantal kaarten dat op mobiel direct zichtbaar is; de rest achter "Meer vragen". */
  mobileVisible?: number;
}

/**
 * FAQ als draaikaarten. Klik of Enter draait de kaart (rotateY 180°, 600 ms);
 * zonder animatie wisselt de kaart direct van inhoud (zie islands.css).
 * De voorkant is een knop met aria-expanded en aria-controls naar de
 * achterkant; de niet-zichtbare kant is inert zodat Tab er niet in blijft hangen.
 */
export default function FlipCards({ items, mobileVisible = 3 }: FlipCardsProps) {
  const [flipped, setFlipped] = useState<ReadonlySet<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const baseId = useId();

  const toggle = (id: string) => {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const isFlipped = flipped.has(item.id);
          const backId = `${baseId}-${item.id}`;
          const hiddenOnMobile = !showAll && index >= mobileVisible;
          return (
            <li
              key={item.id}
              className={`flip ${hiddenOnMobile ? 'hidden md:block' : ''}`}
              data-flipped={isFlipped}
              data-testid="flipcard"
            >
              <div className="flip-inner">
                <button
                  type="button"
                  className="flip-face flip-front card flex h-full w-full flex-col justify-between p-6 text-left"
                  aria-expanded={isFlipped}
                  aria-controls={backId}
                  inert={isFlipped}
                  onClick={() => toggle(item.id)}
                >
                  <span className="text-2xl font-bold tracking-tight">{item.question}</span>
                  <span className="mt-4 inline-flex items-center gap-2 font-bold">
                    Antwoord <span aria-hidden="true">↻</span>
                  </span>
                </button>
                <div
                  id={backId}
                  className="flip-face flip-back card on-ink flex h-full w-full flex-col justify-between bg-ink p-6 text-paper"
                  inert={!isFlipped}
                >
                  <p className="text-lg">{item.answer}</p>
                  <button
                    type="button"
                    className="mt-4 self-start font-bold text-lime underline underline-offset-4"
                    onClick={() => toggle(item.id)}
                  >
                    Terug naar de vraag
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {items.length > mobileVisible && (
        <button
          type="button"
          className="btn mt-6 md:hidden"
          aria-expanded={showAll}
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? 'Minder vragen' : `Meer vragen (${items.length - mobileVisible})`}
        </button>
      )}
    </div>
  );
}
