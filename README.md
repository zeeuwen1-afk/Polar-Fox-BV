# Polar Fox B.V. – website

Statische website van Polar Fox B.V. (maatwerk apps en websites op abonnementsbasis), gebouwd
met Astro, React-islands en Tailwind, gehost op Cloudflare Workers. Het intakeformulier praat
met een Cloudflare Worker in `worker/`.

## Vereisten

- Node 22 of hoger (gebouwd met Node 24)
- npm 9 of hoger

## Installatie

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Script                            | Doet                                                 |
| --------------------------------- | ---------------------------------------------------- |
| `npm run dev`                     | Ontwikkelserver op http://localhost:4321             |
| `npm run build`                   | Statische build in `dist/`                           |
| `npm run preview`                 | Build lokaal bekijken                                |
| `npm run check`                   | `astro check` en `tsc --noEmit`                      |
| `npm run lint` / `lint:fix`       | ESLint                                               |
| `npm run format` / `format:check` | Prettier                                             |
| `npm test`                        | Vitest (logica en Worker)                            |
| `npm run test:e2e`                | Playwright-flows en axe-scan                         |
| `npm run lighthouse`              | Lighthouse CI                                        |
| `npm run favicons`                | Favicons opnieuw genereren uit `src/assets/logo.svg` |
| `npm run worker:dev`              | Worker lokaal met `wrangler dev`                     |
| `npm run deploy`                  | Build en `wrangler deploy`                           |

## Mappen

```
src/components   Astro-componenten (statisch)
src/islands      React-componenten (interactief)
src/layouts      BaseLayout.astro
src/pages        routes
src/content      data: site.ts, packages.ts, cases.ts, faq.ts
src/styles       tokens.css, global.css
src/lib          pure logica met Vitest-tests
src/assets       logo en illustraties
public           favicons, robots.txt, _headers, security.txt
worker           Cloudflare Worker voor /api/intake
tests            Playwright
docs             BRIEFING, BESLUITEN, RUNBOOK, SECURITY, OPENSTAAND
```

## Omgevingsvariabelen

Zie `.env.example`. Secrets nooit committen; in productie via `wrangler secret put`.

## Meer

- `docs/RUNBOOK.md`: teksten, prijzen en beelden aanpassen; deploy.
- `docs/BESLUITEN.md`: waarom het zo gebouwd is.
- `docs/SECURITY.md`: kwetsbaarheid melden.
