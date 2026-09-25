# Checklist livegang

Afvinken in deze volgorde. Alles wat jij moet aanleveren staat ook in `OPENSTAAND.md`.

## A. Inhoud

- [ ] Btw-identificatienummer ingevuld in `src/content/site.ts` (nu `{{BTW}}`).
- [ ] Juridische teksten getoetst door een jurist; blokken `[TE CONTROLEREN DOOR JURIST]` verwijderd;
      `updated:` in elk Markdown-bestand op de datum van akkoord.
- [ ] Definitieve pdf's in `public/juridisch/` (algemene voorwaarden, modelverwerkersovereenkomst).
- [ ] Echte schermafbeeldingen van HPP-Dashboard en YogaCompany.eu en de foto van een intake op
      locatie geplaatst; placeholders vervangen (zie RUNBOOK §5); alt-teksten ingevuld.
- [ ] Toegankelijkheidsverklaring: "bekende beperkingen" bijgewerkt (placeholders weg) en datum van
      de laatste controle gezet.
- [ ] Alle prijzen nog actueel in `src/content/packages.ts`; actievoorwaarden (eerste vijf klanten) kloppen.

## B. Cloudflare

- [ ] Zone `polarfoxbv.nl` in Cloudflare, nameservers omgezet.
- [ ] Turnstile-widget aangemaakt voor `polarfoxbv.nl` (en `www`); site key in GitHub Variables
      (`PUBLIC_TURNSTILE_SITE_KEY`), secret via `wrangler secret put TURNSTILE_SECRET`.
- [ ] KV-namespace `RATE_LIMIT` aangemaakt (productie én preview); id's in `worker/wrangler.toml`.
- [ ] `wrangler secret put BREVO_API_KEY` en `wrangler secret put LOG_SALT` (lange willekeurige string).
- [ ] Custom domain gekoppeld aan de Worker (`polarfoxbv.nl` en `www.polarfoxbv.nl`); www stuurt door naar de kale domeinnaam of andersom, maar één is canoniek (`site` in `astro.config.mjs` is `https://polarfoxbv.nl`).
- [ ] Cloudflare Web Analytics aangezet zonder cookies (optioneel; anders niets toevoegen).
- [ ] HSTS-preload aanmelden op hstspreload.org pas als HTTPS op alle subdomeinen werkt.

## C. Brevo

- [ ] Afzenderadres `info@polarfoxbv.nl` geverifieerd; domein geauthenticeerd (SPF, DKIM, DMARC).
- [ ] API-sleutel met alleen "transactional email"-rechten.
- [ ] Testaanvraag gedaan op de preview-omgeving: beide mails ontvangen, tekst en reply-to kloppen.

## D. GitHub

- [ ] Remote gekoppeld (`git remote add origin …`) en de repo gepusht.
- [ ] Secrets `CLOUDFLARE_API_TOKEN` (rechten: Workers Scripts Edit, KV Storage Edit, Account Settings Read)
      en `CLOUDFLARE_ACCOUNT_ID`; Variable `PUBLIC_TURNSTILE_SITE_KEY`.
- [ ] Environments `production` en `preview` aangemaakt (optioneel met verplichte reviewer voor productie).
- [ ] CI groen op de hoofdbranch; Dependabot actief.
- [ ] Branch protection op `main`/`master`: CI verplicht vóór merge.

## E. Controle op de live site

- [ ] Alle 14 pagina's openen; 404 geeft de vospagina met status 404.
- [ ] Intake volledig doorlopen op de live site met een echt Turnstile-token; beide mails binnen.
- [ ] Rate limiting: zesde aanvraag binnen een uur geeft de nette melding.
- [ ] Geen consolefouten (CSP) op home, prijzen en intake in Chrome, Firefox en Safari.
- [ ] Mozilla Observatory of securityheaders.com: score noteren in RUNBOOK §10.
- [ ] Lighthouse op de live URL (mobiel en desktop) ≥ 95 op alle vier de onderdelen.
- [ ] `https://polarfoxbv.nl/sitemap-index.xml`, `/robots.txt`, `/.well-known/security.txt` bereikbaar.
- [ ] Rich results test (Google) op home, prijzen en applicaties: Organization, FAQPage en Service zonder fouten.
- [ ] Open Graph-preview gecontroleerd (bijvoorbeeld via LinkedIn Post Inspector): og-image.png zichtbaar.
- [ ] Toetsenbordronde: skiplink, menu, intake, draaikaarten; schermlezer op de intake.

## F. Na livegang

- [ ] Google Search Console en Bing Webmaster Tools: domein geverifieerd, sitemap ingediend.
- [ ] `security.txt`: `Expires` jaarlijks vernieuwen (nu 25 september 2027).
- [ ] Jaarlijks: privacy- en cookieverklaring nalopen; subverwerkerslijst controleren.
