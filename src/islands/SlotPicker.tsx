import { useState } from 'react';
import { slotLabels, slotValues } from '../lib/intakeSchema';

type Slot = (typeof slotValues)[number];

/**
 * "Kies alvast een dagdeel." Vier keuzes (echte radio-inputs, dus ook zonder
 * JavaScript bruikbaar) en een knop die naar /intake?dagdeel=… gaat. Het
 * formulier is een gewone GET, zodat de intakepagina het dagdeel voorvult.
 */
export default function SlotPicker() {
  const [slot, setSlot] = useState<Slot | null>(null);

  return (
    <form method="get" action="/intake" className="flex flex-col gap-6">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-3 font-bold">Wanneer komt het je uit?</legend>
        <div className="grid gap-3 lg:grid-cols-4 sm:grid-cols-2">
          {slotValues.map((value) => {
            const checked = slot === value;
            return (
              <label
                key={value}
                className={`btn cursor-pointer has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${
                  checked ? 'btn-ink' : ''
                }`}
              >
                <input
                  type="radio"
                  name="dagdeel"
                  value={value}
                  checked={checked}
                  onChange={() => setSlot(value)}
                  className="sr-only"
                />
                {slotLabels[value]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-lime text-lg">
          Intake aanvragen
        </button>
        <p className="text-sm" aria-live="polite">
          {slot ? `Gekozen: ${slotLabels[slot]}.` : 'Geen voorkeur? Dan kies je het straks.'}
        </p>
      </div>
    </form>
  );
}
