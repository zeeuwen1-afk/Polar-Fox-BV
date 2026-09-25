# Openstaand: wat jij nog aanlevert

Bijgewerkt per fase. Zolang iets hier staat, gebruikt de site een placeholder.

| #   | Wat                                                                                             | Waar het terechtkomt                                       | Status                           |
| --- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------- |
| 1   | **Btw-identificatienummer** van Polar Fox B.V.                                                  | `src/content/site.ts` (`btw`), footer, juridische pagina's | open, staat nu als `{{BTW}}`     |
| 2   | Schermafbeeldingen HPP-Dashboard (2×)                                                           | `public/images/cases/` (zie README daar)                   | open, placeholder                |
| 3   | Schermafbeeldingen YogaCompany.eu (2×)                                                          | `public/images/cases/`                                     | open, placeholder                |
| 4   | Foto van een intake op locatie                                                                  | `public/images/intake/op-locatie.jpg`                      | open, placeholder                |
| 5   | Definitieve algemene voorwaarden (pdf)                                                          | `public/juridisch/algemene-voorwaarden.pdf`                | open, placeholder vanaf fase 4   |
| 6   | Model-verwerkersovereenkomst (pdf)                                                              | `public/juridisch/verwerkersovereenkomst.pdf`              | open, placeholder vanaf fase 4   |
| 7   | Juridische teksten laten toetsen door een jurist                                                | blokken `[TE CONTROLEREN DOOR JURIST]`                     | open                             |
| 8   | Cloudflare-account: zone voor polarfoxbv.nl, Turnstile site key + secret, API-token voor deploy | GitHub Secrets, `wrangler secret`                          | open                             |
| 9   | Brevo-account met API-sleutel en geverifieerd afzenderadres info@polarfoxbv.nl                  | `wrangler secret put BREVO_API_KEY`                        | open                             |
| 10  | GitHub-remote voor deze repo                                                                    | `git remote add origin …`                                  | open, repo heeft nog geen remote |

Al ingevuld: domein polarfoxbv.nl, e-mail info@polarfoxbv.nl, telefoon 085-2009981, KvK 75362538.
