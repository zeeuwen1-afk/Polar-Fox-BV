# Runbook

Hoe je de site draait, aanpast en uitrolt. Technische achtergrond staat in `README.md`,
keuzes in `BESLUITEN.md`, livegang in `CHECKLIST-LIVEGANG.md`.

## 1. Lokaal draaien

```bash
npm install
npm run dev            # site op http://localhost:4321, demo's op /dev
npm run worker:dev     # site én API op http://127.0.0.1:8787 (gebruikt worker/.dev.vars)
```

Kwaliteitschecks, in dezelfde volgorde als in CI:

```bash
npm run lint && npm run format:check && npm run check && npm test && npm run build
npm run test:e2e       # Playwright (flows en axe), start zelf een preview
npm run lighthouse     # Lighthouse CI; op Windows: powershell -File scripts/lighthouse-local.ps1
```

Elke commit draait ESLint en Prettier op de gewijzigde bestanden (Husky). Faalt dat, dan is de
commit niet gemaakt; fix de melding en commit opnieuw.

## 2. Teksten aanpassen

| Wat                                                                                        | Waar                                                               |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Bedrijfsgegevens (e-mail, telefoon, btw, KvK), vaste zinnen, menu, footerkolommen, marquee | `src/content/site.ts`                                              |
| Paginateksten (koppen, onderregels, tegels)                                                | het `.astro`-bestand van de pagina in `src/pages/`                 |
| Teksten in interactieve onderdelen (bijvoorbeeld "Ik blijf / Ik stop")                     | het island in `src/islands/`                                       |
| Juridische pagina's                                                                        | `src/content/juridisch/*.md` (Markdown; de bestandsnaam is de URL) |
| E-mailteksten van de intake                                                                | `worker/src/email.ts`                                              |

De gemarkeerde woorden in koppen zijn `<span class="mark-lime">…</span>` (of `mark-pink`,
`mark-sky`, `mark-sun`). Stickers: `<Sticker color="pink" tilt={-3} wobble>tekst</Sticker>`.

In de juridische Markdown zijn de gele blokken voor de jurist gewone blockquotes:

```md
> **[TE CONTROLEREN DOOR JURIST]** Toelichting.
```

Haal ze weg zodra de jurist akkoord is en zet de datum in `updated:` bovenaan het bestand.

## 3. Prijzen en pakketten

Alles staat in `src/content/packages.ts`. Pas daar een bedrag aan en de pakketkaarten,
de calculator, de "vanaf"-prijzen, de JSON-LD en de tests rekenen mee. Bedragen zijn hele euro's
excl. btw.

- **Maandbedrag of startbijdrage wijzigen:** verander `monthly` of `start`.
- **Jaarbetaling:** wordt berekend als `monthly × 11 / 12`, afgerond (zie `src/lib/pricing.ts`).
- **Overname-check:** `packages.beheer.checkFee`.
- **Extra uren en strippenkaart:** `packages.extras`.
- **Aanrader:** zet `recommended: true` op precies één pakket per groep (de test controleert dat).

### Een nieuw pakket toevoegen

1. Voeg het id toe aan het type `PackageId` bovenin `packages.ts`.
2. Voeg het object toe aan `items` van de juiste groep (`websites`, `apps` of `beheer`), met
   `id`, `name`, `monthly`, `start` (niet bij beheer), `hours` en precies drie `features`.
3. Wil je dat de aanbeveling (`src/lib/recommend.ts`) het pakket kiest? Pas daar de grenzen aan
   en de tests in `recommend.test.ts`.
4. Draai `npm test` en `npm run build`. De kaarten, calculator en JSON-LD volgen automatisch.

De pakketkaart zelf staat in `src/components/PackageCard.astro`; de looptijdtekst eronder in
`PackageGrid.astro`.

## 4. Cases, FAQ en app-types

- **Cases:** `src/content/cases.ts`. Vier tabbladen per case (`tabs`), drie demo-regels voor het
  voorbeeldscherm (`demoLines`) en het beeld (`image`). Zet `placeholder: false` zodra het echte
  beeld in `public/images/cases/` staat en vul `alt` in.
- **FAQ:** `src/content/faq.ts`. De eerste zes vragen staan als draaikaarten op de homepage
  (en in de FAQPage-JSON-LD); vragen met topic `website` staan op /websites. Voeg een vraag toe
  met een uniek `id`.
- **App-types** in de verkenner op /applicaties: `src/content/appTypes.ts`.
- **Werkwijze-stappen, reactietijden en "altijd inbegrepen":** onderaan `packages.ts`.

## 5. Beelden aanleveren

Zie `public/images/README.md` voor bestandsnamen en formaten. Zolang een beeld ontbreekt toont
de site een gelabelde placeholder (`src/components/Placeholder.astro`). Na het plaatsen:

1. Zet `placeholder: false` in `cases.ts` en vul de `alt`-tekst in.
2. Vervang op de betreffende pagina de `<Placeholder …/>` door een `<Image>` uit `astro:assets`
   (Astro maakt dan WebP/AVIF en zet `width`/`height`). Voorbeeld:

```astro
---
import { Image } from 'astro:assets';
import hpp from '../assets/cases/hpp-dashboard.png';
---

<Image
  src={hpp}
  alt="…"
  widths={[480, 800, 1200]}
  sizes="(min-width: 1024px) 50vw, 100vw"
  loading="lazy"
/>
```

Voor `astro:assets` horen de bestanden in `src/assets/` (niet in `public/`).

## 6. Logo, favicons en OG-afbeelding

- Logo: `src/assets/logo.svg`; inline gebruikt via `src/components/Logo.astro`.
- Favicons opnieuw maken: `npm run favicons`.
- OG-afbeelding (1200 × 630) opnieuw maken: `npm run og-image` (rendert met Playwright).

## 7. Intakeformulier en e-mail

- Velden en meldingen: `src/lib/intakeSchema.ts` (gedeeld door wizard en Worker).
- Stappen en teksten van de wizard: `src/islands/IntakeWizard.tsx`.
- Dagdelen en voorkeuren: `slotValues`/`preferenceValues` in `intakeSchema.ts`.
- Mailteksten: `worker/src/email.ts`. Alleen tekstmail, geen HTML.
- Ontvanger en afzender: `INTAKE_TO_EMAIL`/`INTAKE_FROM_EMAIL` in `worker/wrangler.toml`.
- Rate limit (5 per IP per uur): `worker/src/rateLimit.ts`.

Testen zonder echte mail: `npm run worker:dev` met de Turnstile-testsleutels; de Worker geeft
dan een 502 zodra Brevo een ongeldige sleutel ziet, alle stappen ervoor zijn wel echt.

## 8. Secrets en omgevingen

```bash
wrangler secret put TURNSTILE_SECRET --config worker/wrangler.toml
wrangler secret put BREVO_API_KEY --config worker/wrangler.toml
wrangler secret put LOG_SALT --config worker/wrangler.toml
# preview-omgeving: zelfde commando's met --env preview
```

De rate-limit-teller heeft een KV-namespace nodig:

```bash
wrangler kv namespace create RATE_LIMIT --config worker/wrangler.toml
wrangler kv namespace create RATE_LIMIT --config worker/wrangler.toml --env preview
```

Vul de id's in bij `[[kv_namespaces]]` in `worker/wrangler.toml`.

## 9. Deploy

- Merge op `main`/`master` deployt automatisch (GitHub Actions, `deploy.yml`).
- Een pull request krijgt een preview-Worker en een reactie met de URL.
- Handmatig: `npm run deploy`.
- Terugdraaien: in het Cloudflare-dashboard (Workers → Deployments → Rollback) of een eerdere
  commit opnieuw deployen.

## 10. Kwaliteitsscores

### Lighthouse (25 september 2026, lokale productie-build)

Drempel in `lighthouserc.cjs`: elke categorie minimaal 95. Gemeten op zeven pagina's, mobiel en desktop.

| Pagina                                                            | Prestaties | Toegankelijkheid | Best practices | SEO |
| ----------------------------------------------------------------- | ---------- | ---------------- | -------------- | --- |
| /, /applicaties, /websites, /prijzen, /cases, /werkwijze, /intake | 100        | 100              | 100            | 100 |

(De eerdere 96 op /intake kwam van Zod's JIT onder de CSP en is opgelost met jitless-modus.)

Op Windows faalt chrome-launcher soms met een EPERM op zijn tijdelijke profielmap; gebruik dan
`powershell -File scripts/lighthouse-local.ps1` (met `-Desktop` voor het desktop-profiel). Astro
staat één preview-server per project toe; als Lighthouse niet kan starten: `npx astro preview stop`.

### axe (toegankelijkheid)

`npm run test:e2e` draait axe-core (WCAG 2.1 A en AA) op elke pagina, desktop en mobiel, met nul
toegestane overtredingen. Laatste run: 25 september 2026, 28 van 28 groen.

### Headercontrole

Na livegang: score van Mozilla Observatory (https://observatory.mozilla.org) of
securityheaders.com hier noteren.

| Datum                                   | Tool | Score | Opmerkingen |
| --------------------------------------- | ---- | ----- | ----------- |
| nog niet gedaan (site is nog niet live) |      |       |             |

## 11. Als er iets misgaat

| Symptoom                                   | Kijk naar                                                                                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Formulier geeft "Versturen is niet gelukt" | Worker-logs in Cloudflare (Observability); `BREVO_API_KEY` en afzenderverificatie in Brevo                                              |
| Formulier geeft "spamcontrole niet gelukt" | `PUBLIC_TURNSTILE_SITE_KEY` (build) en `TURNSTILE_SECRET` (Worker) horen bij hetzelfde Turnstile-widget; domein toegevoegd in Turnstile |
| "Te veel aanvragen" bij testen             | Rate limit: 5 per IP per uur; wacht of leeg de KV-sleutel `intake:<hash>:<uur>`                                                         |
| Consolefout "Refused to …"                 | CSP-overtreding: geen inline `style`, geen externe bron buiten challenges.cloudflare.com                                                |
| Lighthouse faalt op Windows                | `scripts/lighthouse-local.ps1`; `npx astro preview stop`                                                                                |
| `astro preview` weigert te starten         | `npx astro preview stop`                                                                                                                |
