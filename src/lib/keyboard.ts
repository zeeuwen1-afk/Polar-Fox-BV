/**
 * Pijltjestoetsen voor tablists, radiogroepen en accordeons (WAI-ARIA
 * Authoring Practices): links/omhoog vorige, rechts/omlaag volgende,
 * Home eerste, End laatste, met omloop. Geeft null als de toets niet telt.
 */
export function nextIndexForKey(key: string, index: number, length: number): number | null {
  if (length === 0) return null;
  const last = length - 1;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return index >= last ? 0 : index + 1;
    case 'ArrowLeft':
    case 'ArrowUp':
      return index <= 0 ? last : index - 1;
    case 'Home':
      return 0;
    case 'End':
      return last;
    default:
      return null;
  }
}
