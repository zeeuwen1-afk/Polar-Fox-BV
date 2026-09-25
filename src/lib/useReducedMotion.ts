import { useEffect, useState } from 'react';

/**
 * Leest `prefers-reduced-motion`. Tijdens server-side rendering en vóór
 * hydratatie is de waarde `false`; CSS-media-queries vangen dat op voor
 * animaties die puur in CSS staan. Gebruik deze hook alleen voor gedrag dat
 * in JavaScript anders moet zijn (bijvoorbeeld wachten op een transition-einde).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}
