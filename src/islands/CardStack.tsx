import { useState } from 'react';
import { toneBg, type Tone } from '../lib/tones';

export interface StackCard {
  id: string;
  title: string;
  price: string;
  href: string;
  tone: Extract<Tone, 'lime' | 'pink' | 'sky'>;
  description: string;
}

export interface CardStackProps {
  cards: readonly StackCard[];
}

/**
 * Drie gestapelde kaarten met lichte draaiing. "Volgende kaart" legt de
 * volgende kaart bovenop (animatie 500 ms via CSS, uit bij reduced motion).
 * Alleen de bovenste kaart is een link en bereikbaar met Tab; de andere zijn
 * inert. Een live-region meldt welke kaart bovenop ligt.
 */
export default function CardStack({ cards }: CardStackProps) {
  const [top, setTop] = useState(0);
  const count = cards.length;
  const topCard = cards[top];

  return (
    <div className="flex flex-col items-center gap-6 md:items-end">
      <div className="cardstack" data-testid="cardstack">
        {cards.map((card, index) => {
          // Positie 0 ligt bovenop; de rest schuift erachter.
          const pos = (index - top + count) % count;
          const isTop = pos === 0;
          return (
            <a
              key={card.id}
              href={card.href}
              data-pos={pos}
              data-testid={isTop ? 'cardstack-top' : undefined}
              aria-hidden={!isTop}
              tabIndex={isTop ? 0 : -1}
              className={`cardstack-card card-lg flex flex-col justify-between p-6 no-underline md:p-8 ${toneBg[card.tone]}`}
            >
              <span className="sticker tilt-2 self-start bg-paper">{card.title}</span>
              <span className="mt-6 block text-3xl leading-tight font-bold tracking-tight md:text-4xl">
                {card.price}
              </span>
              <span className="mt-2 block text-base md:text-lg">{card.description}</span>
              <span className="mt-6 inline-flex items-center gap-2 font-bold">
                Bekijk {card.title.toLowerCase()} <span aria-hidden="true">→</span>
              </span>
            </a>
          );
        })}
      </div>

      <button
        type="button"
        className="btn"
        onClick={() => setTop((current) => (current + 1) % count)}
      >
        Volgende kaart
        <span aria-hidden="true">↻</span>
      </button>

      <p className="sr-only" aria-live="polite">
        {topCard ? `Bovenste kaart: ${topCard.title}, ${topCard.price}.` : ''}
      </p>
    </div>
  );
}
