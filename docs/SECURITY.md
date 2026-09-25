# Beveiliging

## Kwetsbaarheid melden

Heb je een beveiligingsprobleem gevonden in polarfoxbv.nl of het intakeformulier? Mail naar
**info@polarfoxbv.nl** met een beschrijving en, als het kan, stappen om het na te doen. We
reageren binnen twee werkdagen en lossen bevestigde problemen zo snel mogelijk op. Deel het
probleem niet publiek voordat het is verholpen. Dezelfde informatie staat machineleesbaar in
`public/.well-known/security.txt`.

## Uitgangspunten

- **Geen secrets in git.** API-sleutels alleen via omgevingsvariabelen; in productie via
  `wrangler secret`. `.env.example` bevat alleen voorbeeldwaarden.
- **Statische site.** Geen server-side rendering, geen database. De enige dynamische route is
  `POST /api/intake` in de Worker.
- **Content Security Policy.** Astro berekent hashes voor eigen inline scripts en styles; de
  volledige headerset (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options)
  staat in `public/_headers`. Enige externe bron: `challenges.cloudflare.com` (Turnstile).
- **Geen inline event handlers**, alle scripts als modules uit de eigen build.
- **Worker:** alle invoer gevalideerd met Zod, uitvoer geëscaped, Turnstile-verificatie,
  rate limiting (5 aanvragen per IP per uur), generieke foutmeldingen, geen persoonsgegevens
  in logs (alleen tijdstip, status en een gehashte IP met dagelijkse salt).
- **Afhankelijkheden:** vaste versies in `package-lock.json`, `npm audit` in CI, Dependabot.
- **Toegankelijkheid en privacy** zijn onderdeel van beveiliging: geen trackingcookies, geen
  externe lettertypen, geen analytics met cookies.

## Controles vóór livegang

- `npm audit` zonder kwetsbaarheden van niveau high of critical.
- Headertest (Mozilla Observatory of securityheaders.com); score in `docs/RUNBOOK.md`.
- CSP in de browser zonder consolefouten op elke pagina.
- Turnstile en rate limiting getest tegen de productie-Worker.
