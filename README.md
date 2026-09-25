# Polar Fox B.V. – website

Statische website van Polar Fox B.V. (maatwerk apps en websites op abonnementsbasis), gebouwd
met Astro 7, React-islands en Tailwind 4, gehost op Cloudflare Workers. Het intakeformulier praat
met een Cloudflare Worker in `worker/` die Turnstile controleert, rate-limit en mailt via Brevo.

- Huisstijl en teksten: zie `docs/BRIEFING.md` (de opdracht) en `docs/BESLUITEN.md` (waarom het zo is).
- Dagelijks gebruik: `docs/RUNBOOK.md`.
- Livegang: `docs/CHECKLIST-LIVEGANG.md`; wat nog ontbreekt: `docs/OPENSTAAND.md`.
- Beveiliging melden: `docs/SECURITY.md`.

## Vereisten

- Node 22 of hoger (gebouwd met Node 24) en npm 9 of hoger.
- Voor de Worker lokaal: een gratis Cloudflare-account is niet nodig (`wrangler dev` draait lokaal).
- Voor Lighthouse lokaal: Google Chrome.

## Installatie

```bash
npm install                                 # installeert ook de git-hooks (Husky)
cp .env.example .env                        # site-variabelen (mogen leeg blijven)
cp worker/.dev.vars.example worker/.dev.vars # Worker-secrets voor lokaal
npx playwright install chromium             # eenmalig, voor de e2e-tests
npm run dev                                 # http://localhost:4321
```

Demo-pagina's van alle interactieve componenten: http://localhost:4321/dev (alleen in development).

## Scripts

| Script                            | Doet                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`                     | Ontwikkelserver met hot reload                                                     |
| `npm run build`                   | Productie-build in `dist/` (14 pagina's, sitemap, gehashte assets)                 |
| `npm run preview`                 | De build lokaal bekijken (één preview per project; stop: `npx astro preview stop`) |
| `npm run check`                   | `astro check` plus `tsc` voor site én Worker                                       |
| `npm run lint` / `lint:fix`       | ESLint (Astro, React, jsx-a11y)                                                    |
| `npm run format` / `format:check` | Prettier                                                                           |
| `npm test`                        | Vitest: prijslogica, aanbeveling, schema, Worker (82 tests)                        |
| `npm run test:e2e`                | Playwright: flows en axe-scan, desktop en mobiel, tegen de build                   |
| `npm run lighthouse`              | Lighthouse CI mobiel (drempel 95); `lighthouse:desktop` voor desktop               |
| `npm run worker:dev`              | Worker plus statische site op http://127.0.0.1:8787                                |
| `npm run worker:deploy`           | `wrangler deploy` (productie)                                                      |
| `npm run deploy`                  | Build en deploy in één keer                                                        |
| `npm run favicons`                | Favicons opnieuw maken uit `src/assets/logo.svg`                                   |
| `npm run og-image`                | OG-afbeelding opnieuw renderen (`public/og-image.png`)                             |

Pre-commit (Husky + lint-staged) draait ESLint en Prettier op de gewijzigde bestanden.

## Mappen

```
src/components   Astro-componenten (statisch): Header, Footer, Marquee, PackageCard, …
src/islands      React-componenten (interactief): CardStack, IntakeWizard, …
src/layouts      BaseLayout.astro (metadata, skiplink, JSON-LD, header, footer)
src/pages        routes; juridisch/[slug].astro rendert Markdown; dev/ alleen in development
src/content      data: site.ts, packages.ts, cases.ts, faq.ts, appTypes.ts, juridisch/*.md
src/styles       tokens.css (huisstijl), global.css (Tailwind + componenten), islands.css
src/lib          pure logica met tests: pricing, recommend, intakeSchema, jsonld, keyboard
src/assets       logo.svg
public           favicons, og-image, robots, manifest, _headers, .well-known/security.txt, juridisch/*.pdf
worker           Cloudflare Worker: wrangler.toml, src/ (intake, email, turnstile, rateLimit, headers)
tests            Playwright: flows.spec.ts, a11y.spec.ts
scripts          favicons, og-image, placeholder-pdf, lighthouse-local.ps1
docs             BRIEFING, BESLUITEN, RUNBOOK, SECURITY, OPENSTAAND, CHECKLIST-LIVEGANG
.github          CI- en deploy-workflows, Dependabot
```

## Omgevingsvariabelen

Nooit echte sleutels in git. `.gitignore` sluit `.env*` (behalve `.env.example`) en
`worker/.dev.vars` uit.

| Naam                                                                          | Waar                                  | Doel                                                                    |
| ----------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| `PUBLIC_TURNSTILE_SITE_KEY`                                                   | `.env` lokaal, GitHub Variables in CI | Turnstile-widget in de intake (publiek). Leeg = geen widget.            |
| `PUBLIC_INTAKE_API_URL`                                                       | `.env`                                | Alleen als de API op een andere origin draait; standaard `/api/intake`. |
| `TURNSTILE_SECRET`                                                            | `worker/.dev.vars`, `wrangler secret` | Serverzijde Turnstile-controle.                                         |
| `BREVO_API_KEY`                                                               | `worker/.dev.vars`, `wrangler secret` | Mail versturen.                                                         |
| `LOG_SALT`                                                                    | `worker/.dev.vars`, `wrangler secret` | Salt voor het hashen van IP's in logs en rate limiting.                 |
| `ALLOWED_ORIGINS`, `INTAKE_TO_EMAIL`, `INTAKE_FROM_EMAIL`, `INTAKE_FROM_NAME` | `worker/wrangler.toml` `[vars]`       | Niet geheim.                                                            |

Cloudflare Turnstile heeft testsleutels die altijd slagen: site key `1x00000000000000000000AA`,
secret `1x0000000000000000000000000000000AA` (staan in de voorbeeldbestanden).

## Deploy

- **Automatisch:** een merge op `main` (of `master`) deployt naar productie; een pull request krijgt
  een preview-omgeving (`wrangler --env preview`) en een reactie met de URL. Zie `.github/workflows/deploy.yml`.
- **Handmatig:** `npm run deploy` (vereist `wrangler login` of `CLOUDFLARE_API_TOKEN`).
- **Eerste keer:** volg `docs/CHECKLIST-LIVEGANG.md` (KV-namespace, secrets, domein, DNS).

## Architectuur in het kort

- Astro bouwt alles statisch; alleen de islands in `src/islands/` worden gehydrateerd
  (`client:visible` of `client:idle`, de intake `client:load`).
- De CSP staat deels in een meta-tag (Astro berekent hashes) en deels in HTTP-headers
  (`public/_headers`, met de Worker als vangnet). Daarom: geen inline `style`-attributen.
- Prijzen staan op één plek (`src/content/packages.ts`) en worden overal berekend, ook in de JSON-LD.
- Het intake-schema (`src/lib/intakeSchema.ts`) wordt door de wizard én de Worker gebruikt.
