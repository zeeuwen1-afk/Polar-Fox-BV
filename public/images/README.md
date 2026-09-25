# Beelden aanleveren

Zolang een beeld ontbreekt, toont de site een duidelijk gelabelde
placeholder-illustratie (geen stockfoto's). Schermafbeeldingen van de cases staan
in `src/assets/cases/` en gaan via `astro:assets` (zie RUNBOOK §5); de eerste
versies zijn op 25 september 2026 geplaatst. De foto van een intake komt in deze map.

| Bestand                          | Wat                                                                         | Formaat     | Afmeting               |
| -------------------------------- | --------------------------------------------------------------------------- | ----------- | ---------------------- |
| `cases/hpp-dashboard.png`        | Schermafbeelding HPP-Dashboard (overzichtsscherm)                           | PNG of WebP | 1600 × 1000 px (16:10) |
| `cases/hpp-dashboard-detail.png` | Tweede scherm HPP-Dashboard (bijvoorbeeld AI-rapport)                       | PNG of WebP | 1600 × 1000 px         |
| `cases/yogacompany.png`          | Schermafbeelding YogaCompany.eu (klantportaal)                              | PNG of WebP | 1600 × 1000 px         |
| `cases/yogacompany-detail.png`   | Tweede scherm YogaCompany.eu (lesstof met voortgang)                        | PNG of WebP | 1600 × 1000 px         |
| `intake/op-locatie.jpg`          | Foto van een intake op locatie (geen herkenbare klanten zonder toestemming) | JPG         | 1600 × 1200 px (4:3)   |

Richtlijnen:

- Geen persoonsgegevens in schermafbeeldingen (gebruik demo-data of maak ze onherkenbaar).
- Lever bij elk beeld een korte alt-tekst aan (één zin, wat zie je). Die zet ik in `src/content/cases.ts`.
- Beelden onder 400 kB houden; Astro maakt er zelf WebP/AVIF-varianten van.
