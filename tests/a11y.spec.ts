import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { allPages } from './pages';

/**
 * axe-core op elke pagina, WCAG 2.1 A en AA. Geen enkele overtreding is
 * toegestaan; de output noemt de regel, het element en de uitleg van axe.
 */
for (const path of allPages) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    // Islands met client:visible hydrateren pas in beeld: scroll de pagina door.
    await page.mouse.wheel(0, 30_000);
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const summary = results.violations.map(
      (v) =>
        `${v.impact ?? 'onbekend'} · ${v.id}: ${v.help}\n` +
        v.nodes
          .slice(0, 3)
          .map((n) => `   ${n.target.join(' ')}\n   ${n.failureSummary?.split('\n')[1] ?? ''}`)
          .join('\n'),
    );
    expect(summary, summary.join('\n\n')).toEqual([]);
  });
}
