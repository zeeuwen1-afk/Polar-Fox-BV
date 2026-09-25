# Openstaand: wat jij nog aanlevert

Bijgewerkt op 25 september 2026, na fase 9. Zolang iets hier staat, gebruikt de site een
placeholder of ontbreekt een koppeling. De volgorde van aanpak staat in `CHECKLIST-LIVEGANG.md`.

| #   | Wat                                                                                  | Waar het terechtkomt                                                                | Status                           |
| --- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------- |
| 1   | **Btw-identificatienummer** van Polar Fox B.V.                                       | `src/content/site.ts` (`btw`), footer, juridische pagina's                          | open, staat nu als `{{BTW}}`     |
| 2   | Schermafbeeldingen HPP-Dashboard (2×)                                                | `public/images/cases/` (zie README daar), daarna `placeholder: false` in `cases.ts` | open, placeholder-illustratie    |
| 3   | Schermafbeeldingen YogaCompany.eu (2×)                                               | `public/images/cases/`                                                              | open, placeholder-illustratie    |
| 4   | Foto van een intake op locatie                                                       | `public/images/intake/op-locatie.jpg`, gebruikt op /werkwijze                       | open, placeholder                |
| 5   | Definitieve algemene voorwaarden (pdf)                                               | `public/juridisch/algemene-voorwaarden.pdf`                                         | open, placeholder-pdf staat er   |
| 6   | Model-verwerkersovereenkomst (pdf)                                                   | `public/juridisch/verwerkersovereenkomst.pdf`                                       | open, placeholder-pdf staat er   |
| 7   | Juridische teksten laten toetsen door een jurist                                     | gele blokken `[TE CONTROLEREN DOOR JURIST]` in `src/content/juridisch/*.md`         | open                             |
| 8   | Cloudflare: zone, Turnstile (site key + secret), KV-namespace, API-token voor deploy | GitHub Secrets/Variables, `wrangler secret`, `worker/wrangler.toml`                 | open                             |
| 9   | Brevo-account met API-sleutel en geverifieerd afzenderadres info@polarfoxbv.nl       | `wrangler secret put BREVO_API_KEY`                                                 | open                             |
| 10  | GitHub-remote voor deze repo                                                         | `git remote add origin …`, daarna CI en deploy                                      | open, repo heeft nog geen remote |
| 11  | Keuze: Cloudflare Web Analytics (zonder cookies) aan of geen analytics               | Cloudflare-dashboard; de cookieverklaring noemt de cookieloze variant al            | open, keuze aan jou              |

Al ingevuld: domein polarfoxbv.nl, e-mail info@polarfoxbv.nl, telefoon 085-2009981, KvK 75362538.

Al geregeld door de code: favicons, OG-afbeelding, sitemap, robots, security.txt, headers,
placeholder-pdf's, alle pagina's en componenten, tests en CI/CD-workflows.
