# Runbook

Hoe je de site draait, aanpast en uitrolt. Voor de technische achtergrond zie `README.md`;
voor keuzes zie `BESLUITEN.md`.

## Lokaal draaien

```bash
npm install          # eenmalig; installeert ook de git-hooks (husky)
npm run dev          # site op http://localhost:4321
npm run worker:dev   # intake-API op http://localhost:8787 (vanaf fase 5)
```

Kwaliteitschecks, in deze volgorde ook in CI:

```bash
npm run lint         # ESLint (Astro, React, a11y)
npm run check        # astro check + tsc
npm test             # Vitest (logica en Worker)
npm run build        # statische build in dist/
npm run test:e2e     # Playwright (vanaf fase 8)
npm run lighthouse   # Lighthouse CI (vanaf fase 7)
```

## Teksten, prijzen, cases en FAQ aanpassen

| Wat                                                         | Waar                                  |
| ----------------------------------------------------------- | ------------------------------------- |
| Bedrijfsgegevens, e-mail, telefoon, btw, vaste zinnen, menu | `src/content/site.ts`                 |
| Pakketten en prijzen (één bron van waarheid)                | `src/content/packages.ts` (fase 2)    |
| Cases                                                       | `src/content/cases.ts` (fase 2)       |
| FAQ                                                         | `src/content/faq.ts` (fase 2)         |
| Juridische teksten                                          | `src/content/juridisch/*.md` (fase 4) |
| Kleuren, randen, schaduwen                                  | `src/styles/tokens.css`               |

Na een wijziging: `npm run build` en kijken of `npm test` nog slaagt (prijstests rekenen met
de echte pakketdata).

## Beelden aanleveren

Zie `public/images/README.md` voor bestandsnamen en formaten. Zet de bestanden neer, voeg de
alt-tekst toe in `src/content/cases.ts`, en de placeholder verdwijnt vanzelf.

## Logo en favicons

Het logo staat in `src/assets/logo.svg`. Na een wijziging:

```bash
npm run favicons
```

Dat schrijft `favicon.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`,
`apple-touch-icon.png` en `icon-512.png` in `public/`.

## Omgevingsvariabelen en secrets

- Lokaal: kopieer `.env.example` naar `.env` (site) en `worker/.dev.vars` (Worker).
- Productie: `wrangler secret put TURNSTILE_SECRET` (en de andere namen uit `.env.example`).
- Nooit een echte sleutel in git. `.gitignore` sluit `.env*` en `.dev.vars` uit.

## Deploy

Vanaf fase 8 deployt GitHub Actions automatisch bij een merge op `main`. Handmatig:

```bash
npm run deploy       # build + wrangler deploy
```

## Headercontrole (fase 6)

Na livegang: score van Mozilla Observatory (of securityheaders.com) hier noteren met datum.

| Datum           | Tool | Score | Opmerkingen |
| --------------- | ---- | ----- | ----------- |
| nog niet gedaan |      |       |             |
