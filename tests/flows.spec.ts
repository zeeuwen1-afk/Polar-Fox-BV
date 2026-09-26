import { expect, test, type Page } from '@playwright/test';

/**
 * De belangrijkste flows uit de briefing (hoofdstuk 11), tegen de productie-build.
 * Islands met client:visible hydrateren pas in beeld; `reveal` scrollt ernaartoe.
 */
/**
 * Wacht tot het island rond een element gehydrateerd is: Astro haalt dan het
 * `ssr`-attribuut van <astro-island> weg. Zonder deze wachtstap kan een klik
 * op een nog statische knop verloren gaan.
 */
async function hydrated(page: Page, selector: string) {
  await page.waitForFunction(
    (sel) => {
      const island = document.querySelector(sel)?.closest('astro-island');
      return !!island && !island.hasAttribute('ssr');
    },
    selector,
    { timeout: 15_000 },
  );
}

async function reveal(page: Page, selector: string) {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  await hydrated(page, selector);
  return locator;
}

/** Klikt het label van een visueel verborgen radio/checkbox. */
const label = (page: Page, text: string | RegExp) => page.locator('label', { hasText: text });

test('home laadt en toont de H1 met de belofte', async ({ page }) => {
  await page.goto('/');
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText('Maatwerk software.');
  await expect(h1).toContainText('Vast bedrag.');
  await expect(page).toHaveTitle(/Polar Fox/);
});

test('CardStack wisselt van kaart', async ({ page }) => {
  await page.goto('/');
  await hydrated(page, '[data-testid="cardstack"]');
  const top = page.getByTestId('cardstack-top');
  await expect(top).toContainText('Applicaties');
  await page.getByRole('button', { name: 'Volgende kaart' }).click();
  await expect(top).toContainText('Websites');
  await expect(top).toHaveAttribute('href', '/websites');
});

test('FeatureSwitches geeft App Pro bij 3 functies', async ({ page }) => {
  await page.goto('/');
  await reveal(page, '[data-testid="feature-result"]');
  await expect(page.getByTestId('feature-package')).toHaveText('App Start');
  for (const name of ['Online boeken', 'Klantaccounts', 'Online betalen']) {
    const toggle = page.getByRole('switch', { name });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  }
  await expect(page.getByTestId('feature-package')).toHaveText('App Pro');
  await expect(page.getByTestId('feature-result')).toContainText('3 functies aan');
});

test('FlipCard draait en toont het antwoord', async ({ page }) => {
  await page.goto('/');
  await reveal(page, '[data-testid="flipcard"]');
  const card = page.getByTestId('flipcard').first();
  const front = card.getByRole('button', { name: /Komen jullie echt langs/ });
  await front.click();
  await expect(card).toHaveAttribute('data-flipped', 'true');
  await expect(front).toHaveAttribute('aria-expanded', 'true');
  await expect(
    card.getByText('Ja, de intake doen we altijd bij jou op locatie, gratis.'),
  ).toBeVisible();
  await card.getByRole('button', { name: 'Terug naar de vraag' }).click();
  await expect(card).toHaveAttribute('data-flipped', 'false');
});

test('BillingToggle rekent € 189 om naar € 173', async ({ page }) => {
  await page.goto('/websites');
  await reveal(page, '[data-testid="billing-toggle"]');
  await expect(page.getByTestId('web-groei-monthly')).toHaveText('€ 189');
  await expect(page.getByTestId('web-groei-yearly')).toBeHidden();
  await page.getByTestId('billing-toggle').click();
  await expect(page.getByTestId('web-groei-yearly')).toHaveText('€ 173');
  await expect(page.getByTestId('web-groei-monthly')).toBeHidden();
});

test('TotalCalculator toont € 13.226 voor App Start over 24 maanden', async ({ page }) => {
  await page.goto('/prijzen');
  await reveal(page, '[data-testid="calc-total"]');
  await expect(page.getByTestId('calc-total')).toHaveText('€ 13.226');
  await label(page, 'Website Groei').click();
  await label(page, '12 maanden').click();
  await expect(page.getByTestId('calc-total')).toHaveText('€ 3.063');
});

test('IntakeWizard doorloopt vier stappen en toont "Aangevraagd!"', async ({ page }) => {
  const requests: unknown[] = [];
  await page.route('**/api/intake', async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/intake?dagdeel=wo-middag');
  await hydrated(page, 'form[novalidate]');

  await expect(
    page.getByRole('heading', { level: 2, name: 'Wat wil je laten maken?' }),
  ).toBeVisible();
  await label(page, 'Een applicatie').click();
  await page.getByRole('button', { name: /Volgende/ }).click();

  await expect(page.getByRole('heading', { level: 2, name: 'Wat moet het kunnen?' })).toBeVisible();
  await label(page, 'Online boeken').click();
  await label(page, 'Online betalen').click();
  await expect(page.getByTestId('intake-recommendation')).toHaveText('App Pro');
  await page.getByRole('button', { name: /Volgende/ }).click();

  await expect(page.getByRole('heading', { level: 2, name: 'Waar en wanneer?' })).toBeVisible();
  await page.getByRole('button', { name: /Volgende/ }).click();
  await expect(page.getByRole('alert').first()).toContainText('Vul de plaats');
  await page.getByLabel('Plaats van je bedrijf').fill('Huizen');
  await label(page, 'Volgende week').click();
  await expect(page.getByLabel(/dagdeel/)).toHaveValue('wo-middag');
  await page.getByRole('button', { name: /Volgende/ }).click();

  await expect(page.getByRole('heading', { level: 2, name: 'Hoe bereiken we je?' })).toBeVisible();
  // Bij aankomst op stap 4 mag nog geen enkel veld een foutmelding tonen.
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByLabel('Je naam').fill('Testpersoon');
  await page.getByLabel('E-mailadres').fill('test@example.com');
  await label(page, 'Ik ga akkoord').click();
  await page.getByRole('button', { name: 'Intake aanvragen' }).click();

  await expect(page.getByTestId('intake-success')).toContainText('Aangevraagd!');
  await expect(page.getByTestId('intake-success')).toContainText('binnen één werkdag');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    naam: 'Testpersoon',
    email: 'test@example.com',
    soort: 'app',
    functies: ['boeken', 'betalen'],
    plaats: 'Huizen',
    voorkeur: 'volgende-week',
    dagdeel: 'wo-middag',
    akkoord: true,
    website: '',
  });
});

test('IntakeWizard houdt invoer vast bij een serverfout', async ({ page }) => {
  await page.route('**/api/intake', (route) =>
    route.fulfill({ status: 502, contentType: 'application/json', body: '{"ok":false}' }),
  );
  await page.goto('/intake');
  await hydrated(page, 'form[novalidate]');
  await label(page, 'Een website').click();
  await page.getByRole('button', { name: /Volgende/ }).click();
  await page.getByRole('button', { name: /Volgende/ }).click();
  await page.getByLabel('Plaats van je bedrijf').fill('Huizen');
  await label(page, 'Ochtenden').click();
  await page.getByRole('button', { name: /Volgende/ }).click();
  await page.getByLabel('Je naam').fill('Testpersoon');
  await page.getByLabel('E-mailadres').fill('test@example.com');
  await label(page, 'Ik ga akkoord').click();
  await page.getByRole('button', { name: 'Intake aanvragen' }).click();

  await expect(page.getByRole('alert').first()).toContainText('niet gelukt');
  await expect(page.getByLabel('Je naam')).toHaveValue('Testpersoon');
  await expect(page.getByRole('button', { name: 'Intake aanvragen' })).toBeEnabled();
});

test('/intake?verzonden=1 toont direct de bevestiging', async ({ page }) => {
  await page.goto('/intake?verzonden=1');
  await expect(page.getByTestId('intake-success')).toContainText('Aangevraagd!');
});

test('SlotPicker stuurt het dagdeel mee naar de intake', async ({ page }) => {
  await page.goto('/');
  await reveal(page, 'form[action="/intake"]');
  await label(page, 'Donderdag ochtend').click();
  await page.getByRole('button', { name: 'Intake aanvragen' }).click();
  await expect(page).toHaveURL(/\/intake\?dagdeel=do-ochtend/);
});

test('mobiel menu opent en sluit met Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobiel', 'alleen op mobiel');
  await page.goto('/');
  await hydrated(page, 'button[aria-controls]');
  const open = page.getByRole('button', { name: 'Menu openen' });
  await open.click();
  const dialog = page.getByRole('dialog', { name: 'Menu' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Prijzen' })).toBeVisible();
  // Focus gaat naar de sluitknop ín het menu (de menuknop zelf heet nu ook "Menu sluiten").
  await expect(dialog.getByRole('button', { name: 'Menu sluiten' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test('desktop menu markeert de actieve pagina', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'alleen op desktop');
  await page.goto('/prijzen');
  const active = page
    .getByRole('navigation', { name: 'Hoofdmenu' })
    .getByRole('link', { name: 'Prijzen' });
  await expect(active).toHaveAttribute('aria-current', 'page');
});

test('404-pagina toont de vos en een knop naar home', async ({ page }) => {
  const response = await page.goto('/deze-pagina-bestaat-niet');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('niets');
  await expect(page.getByRole('link', { name: 'Naar de homepage', exact: true })).toBeVisible();
});
