/**
 * Kleurtonen als volledige Tailwind-klassen. Tailwind scant op letterlijke
 * klassenamen, dus `bg-${tone}` zou niet werken; deze tabel wel.
 */
export type Tone = 'lime' | 'pink' | 'sky' | 'sun' | 'paper' | 'stone' | 'ink';

export const toneBg: Record<Tone, string> = {
  lime: 'bg-lime text-ink',
  pink: 'bg-pink text-ink',
  sky: 'bg-sky text-ink',
  sun: 'bg-sun text-ink',
  paper: 'bg-paper text-ink',
  stone: 'bg-stone text-ink',
  ink: 'bg-ink text-paper',
};

export const toneShadow: Record<'ink' | 'pink' | 'lime', string> = {
  ink: 'shadow-hard',
  pink: 'shadow-hard-pink',
  lime: 'shadow-hard-lime',
};

export const toneShadowLg: Record<'ink' | 'pink' | 'lime', string> = {
  ink: 'shadow-hard-lg',
  pink: 'shadow-hard-lg-pink',
  lime: 'shadow-hard-lg-lime',
};
