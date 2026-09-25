import { useState } from 'react';

type Choice = 'blijven' | 'stoppen';

const content: Record<Choice, { label: string; intro: string; cards: readonly string[] }> = {
  blijven: {
    label: 'Ik blijf',
    intro: 'Dan blijft alles draaien en groeit je software mee.',
    cards: [
      'Na de looptijd maandelijks opzegbaar.',
      'Je software groeit mee binnen je urenbudget.',
      'Updates, beveiliging en back-ups blijven geregeld.',
      'Eén vast aanspreekpunt dat je project kent.',
    ],
  },
  stoppen: {
    label: 'Ik stop',
    intro: 'Dan neem je alles mee. Zonder gedoe.',
    cards: [
      'Domein, teksten, beelden en data zijn altijd van jou.',
      'Na de looptijd krijg je op verzoek je broncode.',
      'Binnen 10 werkdagen een complete overdracht.',
      'Met documentatie, zodat een ander verder kan.',
    ],
  },
};

/**
 * "Blijf je of stop je?" Twee knoppen (aria-pressed) wisselen de inhoud van
 * vier kaarten. De kaarten staan in een live-region zodat schermlezers de
 * wissel horen.
 */
export default function ExitToggle() {
  const [choice, setChoice] = useState<Choice>('blijven');
  const current = content[choice];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-10">
      <div className="card-lg bg-sky p-6 md:p-8">
        <h3 className="text-3xl tracking-tight md:text-4xl">Blijf je of stop je?</h3>
        <p className="mt-3 text-lg">{current.intro}</p>
        <div role="group" aria-label="Keuze" className="mt-6 flex flex-wrap gap-3">
          {(Object.keys(content) as Choice[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={choice === key}
              onClick={() => setChoice(key)}
              className={`btn ${choice === key ? 'btn-ink' : ''}`}
            >
              {content[key].label}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2" aria-live="polite" data-testid="exit-cards">
        {current.cards.map((text, index) => (
          <li key={`${choice}-${index}`} className="card flex items-start gap-3 p-5">
            <span
              aria-hidden="true"
              className={`mt-1 inline-block h-4 w-4 shrink-0 rounded-full border-[3px] border-ink ${
                choice === 'blijven' ? 'bg-lime' : 'bg-pink'
              }`}
            />
            <span className="font-bold">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
