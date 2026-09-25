import { useEffect, useState } from 'react';

export const BILLING_ATTRIBUTE = 'data-billing';

/**
 * Schakelaar "Jaarbetaling: 1 maand gratis". Zet `data-billing="yearly"` op
 * <html>; de statisch gerenderde pakketkaarten tonen dan via CSS het
 * jaarbedrag (beide bedragen staan al in de HTML, berekend met pricing.ts).
 * Zo hoeven de kaarten zelf niet gehydrateerd te worden.
 */
export default function BillingToggle() {
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (yearly) root.setAttribute(BILLING_ATTRIBUTE, 'yearly');
    else root.removeAttribute(BILLING_ATTRIBUTE);
  }, [yearly]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={yearly}
        onClick={() => setYearly((current) => !current)}
        className="flex min-h-12 items-center gap-3 rounded-[12px] border-[3px] border-ink bg-paper px-4 font-bold shadow-hard"
        data-testid="billing-toggle"
      >
        <span
          aria-hidden="true"
          className={`relative h-7 w-12 shrink-0 rounded-full border-[3px] border-ink ${
            yearly ? 'bg-ink' : 'bg-paper'
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full transition-[left] duration-[120ms] ${
              yearly ? 'left-6 bg-lime' : 'left-0.5 bg-ink'
            }`}
          />
        </span>
        Jaarbetaling
        <span className="sticker tilt-2 bg-lime text-xs">1 maand gratis</span>
      </button>
      <p className="text-sm" aria-live="polite">
        {yearly
          ? 'Je ziet de maandprijs bij jaarbetaling: 11 maanden betalen voor 12.'
          : 'Je ziet de maandprijs bij maandbetaling.'}
      </p>
    </div>
  );
}
