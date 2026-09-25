# Briefing: website van Polar Fox B.V.

Dit is de oorspronkelijke opdracht, letterlijk overgenomen (25 september 2026). De ingevulde
waarden uit hoofdstuk 0 staan in `src/content/site.ts`; het btw-nummer is nog niet aangeleverd.

---

# Opdracht: bouw de website van Polar Fox B.V.

Je bent mijn senior ontwikkelaar, UI-engineer, beveiligingsexpert en AVG-adviseur. Je bouwt in deze map een **nieuw project**: de website van Polar Fox B.V. (KvK 75362538, Huizen), een maatwerkstudio die apps en websites op abonnementsbasis bouwt en beheert. De site is mijn visitekaartje en showcase: hij moet er uitgesproken uitzien, vlekkeloos werken, snel zijn, toegankelijk zijn en juridisch en technisch waterdicht.

Werk in fases (zie hoofdstuk 12). Na elke fase: draai lint, typecheck, tests en build, maak een git-commit met een duidelijke boodschap en geef mij een korte samenvatting met wat je hebt gedaan, wat er open staat en welke keuzes je hebt gemaakt. Stel vragen als iets echt ontbreekt; maak anders een verstandige keuze en noteer die in `docs/BESLUITEN.md`.

## 0. In te vullen (vervang vóór gebruik)

- `{{DOMEIN}}`: polarfoxbv.nl
- `{{EMAIL}}`: info@polarfoxbv.nl
- `{{TELEFOON}}`: 085-2009981
- `{{BTW}}`: het btw-identificatienummer van Polar Fox B.V. (nog aan te leveren)

## 1. Harde regels

1. Geen secrets in de repository. API-sleutels alleen via omgevingsvariabelen (`.env` staat in `.gitignore`; lever `.env.example` mee). In productie komen ze in Cloudflare Secrets.
2. Alle teksten in het Nederlands, `lang="nl"`. Prijzen altijd met "excl. btw" erbij (we richten ons op zakelijke klanten).
3. Geen trackingcookies, geen Google Fonts vanaf Google-servers, geen externe scripts behalve Cloudflare Turnstile. Lettertypen worden zelf gehost.
4. Toegankelijkheid WCAG 2.1 AA is een harde eis, niet een streven.
5. Elke interactieve component werkt ook met het toetsenbord, heeft zichtbare focus en respecteert `prefers-reduced-motion`.
6. Mijn naam komt nergens op de site voor. Wel: "altijd persoonlijk" en "de intake doen we bij jou op locatie".
7. Verzin geen cijfers, klantenaantallen, reviews of logo's van klanten. De enige bewijzen zijn onze twee eigen platforms: HPP-Dashboard (hpp-dashboard.nl) en YogaCompany (yogacompany.eu).
8. Schrijf code die ik kan lezen: TypeScript strict, kleine componenten, geen magie, commentaar waar een keuze niet vanzelfsprekend is.

## 2. Technische stack (vastgesteld)

- **Framework:** Astro (laatste stabiele versie) met React-islands voor de interactieve onderdelen. Statische output; alleen interactieve componenten worden gehydrateerd (`client:visible` of `client:idle`).
- **Taal:** TypeScript strict.
- **Styling:** Tailwind CSS met een eigen tokenlaag (hoofdstuk 3). Geen componentenbibliotheek.
- **Lettertype:** Space Grotesk via `@fontsource-variable/space-grotesk` (zelf gehost, `font-display: swap`).
- **Formulieren:** Cloudflare Worker (in dezelfde repo, map `worker/`) die de intake-aanvraag valideert, Turnstile controleert en een e-mail verstuurt via de Brevo API (EU). Geen database.
- **Hosting:** Cloudflare Workers met statische assets (Wrangler). Domein en DNS bij Cloudflare.
- **Analytics:** Cloudflare Web Analytics zonder cookies, of geen analytics. Geen Google Analytics.
- **Tests:** Vitest (logica), Playwright (belangrijkste flows en axe-toegankelijkheidsscan), Lighthouse CI.
- **Kwaliteit:** ESLint, Prettier, `astro check`, Husky pre-commit met lint-staged.
- **CI/CD:** GitHub Actions: lint, typecheck, test, build bij elke push; deploy naar Cloudflare bij merge op `main`.

Projectstructuur:

```
polarfox-website/
  src/
    components/        Astro-componenten (statisch)
    islands/           React-componenten (interactief)
    layouts/           BaseLayout.astro
    pages/             routes
    content/           data (pakketten, faq, cases) als TypeScript-modules
    styles/            tokens.css, global.css
    lib/               pure logica (recommender, prijsberekening), getest met Vitest
    assets/            logo, illustraties
  public/              favicons, robots.txt, _headers
  worker/              Cloudflare Worker voor het intakeformulier
  tests/               Playwright
  docs/                BRIEFING.md, BESLUITEN.md, RUNBOOK.md, SECURITY.md
```

## 3. Huisstijl: concept "Uitgesproken"

Neo-brutalistisch, uitgesproken, zakelijk. Dikke zwarte randen, harde schaduwen, felle accentkleuren, grote koppen.

Kleurtokens (CSS custom properties in `src/styles/tokens.css`, ook in Tailwind-config):

| Token     | Waarde    | Gebruik                                   |
| --------- | --------- | ----------------------------------------- |
| `--ink`   | `#111111` | tekst, randen, schaduwen, donkere vlakken |
| `--paper` | `#FFFFFF` | achtergrond                               |
| `--lime`  | `#C6F432` | primair accent, markeringen, aanraders    |
| `--pink`  | `#FF7AB6` | secundair accent, stickers, CTA-blokken   |
| `--sky`   | `#8EC5FF` | derde accent                              |
| `--sun`   | `#FFD84D` | vierde accent                             |
| `--stone` | `#F2F2F2` | lichte vlakken                            |

Vormregels:

- Randen: `3px solid var(--ink)` op kaarten, knoppen, invoervelden en tabellen.
- Harde schaduw: `5px 5px 0 var(--ink)` (knoppen, kleine kaarten), `8px 8px 0 var(--ink)` (grote kaarten), soms in een accentkleur (`--pink` of `--lime`).
- Afronding: knoppen 12 px, kaarten 18–28 px, stickers `999px`.
- Knoppen: bij hover 2 px omhoog-links met grotere schaduw, bij klik 3 px omlaag-rechts met kleinere schaduw. Alles met `transition` van 120 ms, uitgeschakeld bij `prefers-reduced-motion`.
- Typografie: Space Grotesk. H1 96–104 px op desktop (letterafstand −0,045 em, regelhoogte 0,95), H2 56–64 px, lopende tekst 17–21 px. Op mobiel H1 48–50 px.
- Koppen krijgen soms een gemarkeerd woord: achtergrond `--lime` of `--pink`, `padding: 0 10px`.
- Stickers: pilvorm met 3 px rand, licht gedraaid (−4° tot 4°), soms met een langzame wiebelanimatie.
- Contrast: alle tekst op lime, pink, sky en sun is `--ink` (voldoet aan AA). Witte tekst alleen op `--ink`.

Logo (beeldmerk): een geometrische witte poolvos met een noorderlichtband. Gebruik exact deze SVG als bron (`src/assets/logo.svg`) en exporteer favicons in 16, 32, 180 en 512 px:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Polar Fox">
  <defs>
    <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stop-color="#4FC9B8"/><stop offset="0.55" stop-color="#8BE3A8"/><stop offset="1" stop-color="#9AA8FF"/>
    </linearGradient>
    <clipPath id="head"><path d="M18 10 L46 36 L74 36 L102 10 L96 58 L60 106 L24 58 Z"/></clipPath>
  </defs>
  <path d="M18 10 L46 36 L74 36 L102 10 L96 58 L60 106 L24 58 Z" fill="#FFFFFF"/>
  <path d="M24 22 L42 38 L31 45 Z" fill="url(#aurora)"/><path d="M96 22 L78 38 L89 45 Z" fill="url(#aurora)"/>
  <g clip-path="url(#head)"><path d="M10 44 C 34 30, 62 54, 112 34 L 112 41 C 62 62, 34 38, 10 51 Z" fill="url(#aurora)" opacity="0.55"/></g>
  <path d="M24 58 L44 62 L60 106 Z" fill="#DCEAEF"/><path d="M96 58 L76 62 L60 106 Z" fill="#DCEAEF"/>
  <path d="M40 53 L52 57 L41 61 Z" fill="#0E1B24"/><path d="M80 53 L68 57 L79 61 Z" fill="#0E1B24"/><path d="M53 90 L67 90 L60 99 Z" fill="#0E1B24"/>
</svg>
```

In de menubalk staat het beeldmerk (34 px) in een zwart vierkant met afgeronde hoeken (48 px, radius 12 px), met daarnaast het woordmerk "Polar Fox" (22 px, vet). Op lichte achtergrond buiten dat vierkant krijgt de vos een `--ink` contour van 6 (in SVG-eenheden).

## 4. Gedeelde onderdelen

**Menubalk** (`src/components/Header.astro`): logo links, in het midden de links Applicaties, Websites, Prijzen, Cases, Werkwijze (actieve pagina krijgt een lime achtergrond met zwarte rand), rechts "Inloggen" (link naar `/inloggen`, een nette pagina met de tekst dat het klantportaal "Mijn Polar Fox" binnenkort beschikbaar is) en de knop "Plan een intake" (lime, naar `/intake`). Op mobiel: logo, menuknop (lime vierkant met rand en schaduw) die een volledig lime scherm opent met de menu-items als grote witte kaarten en onderaan een zwarte knop "Plan een intake op locatie". Sluiten met Escape, focus wordt netjes beheerd (focus trap in het open menu).

**Footer** (`src/components/Footer.astro`): zwart vlak. Bovenin de kop "Zullen we bij je langskomen?" met "langskomen?" gemarkeerd in lime, en een roze knop "Plan een intake op locatie". Daaronder vier kolommen: Polar Fox (logo, korte omschrijving: "Maatwerk apps en websites op abonnementsbasis. Altijd persoonlijk: de intake doen we bij jou op locatie."), Diensten (Applicaties, Websites, Prijzen), Bedrijf (Cases, Werkwijze, Intake), Juridisch (Algemene voorwaarden, Privacyverklaring, Cookieverklaring, Toegankelijkheidsverklaring, Verwerkersovereenkomst). Onderste regel: "Polar Fox B.V., Huizen. KvK 75362538. Btw {{BTW}}." en rechts "Alle prijzen excl. btw."

**Lopende band** (`src/components/Marquee.astro`): zwarte band, licht gedraaid (−1,2°), lime tekst 34 px met roze sterren ertussen: Klantportalen, Boekingssystemen, Dashboards, Websites, Ledenomgevingen, Koppelingen, Beheer. Animatie 30 s lineair, staat stil bij `prefers-reduced-motion`. `aria-hidden="true"`; de inhoud staat ook elders op de pagina in tekst.

## 5. Inhoud en data

Zet alle prijzen en pakketten in `src/content/packages.ts` (één bron van waarheid) en gebruik ze overal via import. Bedragen zijn excl. btw.

```ts
export const packages = {
  websites: {
    minTermMonths: 12,
    items: [
      { id: 'web-essentie', name: 'Website Essentie', monthly: 99,  start: 495,  hours: '30 min p/m',
        features: ['Tot 6 pagina's', 'Contactformulier en basis-SEO', '30 min aanpassingen per maand'] },
      { id: 'web-groei',    name: 'Website Groei',    monthly: 189, start: 795,  hours: '1 uur p/m', recommended: true,
        features: ['Tot 15 pagina's, zelf beheren', 'Blog en nieuwsbrief', '1 uur aanpassingen per maand'] },
      { id: 'web-maatwerk', name: 'Website Maatwerk', monthly: 299, start: 1250, hours: '2 uur p/m',
        features: ['Onbeperkt pagina's', 'Boeken of aanvragen', '2 uur aanpassingen per maand'] },
    ],
  },
  apps: {
    minTermMonths: 24,
    items: [
      { id: 'app-start',    name: 'App Start',    monthly: 449,  start: 2450, hours: '2 uur p/m',
        features: ['Eén kernproces', 'Inloggen met 2FA, 1 koppeling', '2 uur doorontwikkeling per maand'] },
      { id: 'app-pro',      name: 'App Pro',      monthly: 849,  start: 4950, hours: '4 uur p/m', recommended: true,
        features: ['Meerdere rollen, online betalen', 'Tot 3 koppelingen', '4 uur doorontwikkeling per maand'] },
      { id: 'app-platform', name: 'App Platform', monthly: 1495, start: 7500, startFrom: true, hours: 'op maat',
        features: ['Jouw eigen SaaS', 'Abonnementen en AI', 'Urenbudget op maat'] },
    ],
  },
  beheer: {
    minTermMonths: 12,
    checkFee: 295,
    items: [
      { id: 'beheer-web', name: 'Beheer Website',     monthly: 59,  hours: '30 min p/m',
        features: ['Hosting en updates', 'Back-ups en bewaking', '30 min aanpassingen per maand'] },
      { id: 'beheer-app', name: 'Beheer Applicatie',  monthly: 199, hours: '1 uur p/m', recommended: true,
        features: ['Database en hosting', 'Incidentafhandeling', '1 uur per maand'] },
    ],
  },
  extras: { hourlyRate: 95, tenHourCard: 875, yearlyMonthsCharged: 11 },
};
```

Rekenregels (in `src/lib/pricing.ts`, met Vitest-tests):

- Maandprijs bij jaarbetaling = `Math.round(monthly * 11 / 12)` ("11 maanden betalen voor 12").
- Totaal over een looptijd = startbijdrage (of overname-check € 295 bij beheer) + maanden × maandbedrag.
- Eerder stoppen binnen de minimale looptijd: 50% van de resterende maandbedragen.

Aanbevelingslogica (in `src/lib/recommend.ts`, met tests), gebruikt op de homepage en in het intakeformulier:

- Invoer: soort (`website` | `app` | `beheer` | `onbekend`) en het aantal aangezette functies `n` uit de lijst: Online boeken, Klantaccounts, Online betalen, Koppelingen, Meertalig, AI-assistent, Rapportages, Team en rechten.
- Website: `n <= 1` → Essentie, `n <= 3` → Groei, anders Maatwerk.
- App: `n <= 1` → Start, `n <= 4` → Pro, anders Platform.
- Beheer: `n > 1` → Beheer Applicatie, anders Beheer Website.
- Onbekend: "Samen bepalen".
- Complexiteitsmeter: 8 blokjes, gevuld = `min(8, n + (soort === 'app' ? 1 : 0))`.

Vaste teksten die overal terugkomen:

- Hoofdbelofte: "Maatwerk software. Vast bedrag." (tweede zin gemarkeerd in lime).
- Onderregel: "Apps en websites die precies passen bij hoe jij werkt. Gebouwd, gehost en onderhouden door één vaste partner. Geen gedoe, geen verrassingen."
- Persoonlijk: "Altijd persoonlijk. De intake doen we bij jou op locatie."
- Bewijs: "Geen beloftes. Draaiende software. We bouwen niet alleen voor anderen. We draaien zelf twee platforms, elke dag."
- Exit: "Stop je? Dan neem je alles mee. Domein, content en data zijn altijd van jou. Na de looptijd krijg je op verzoek ook je broncode."
- Proces: 1 Intake op locatie (gratis, 1 à 2 uur), 2 Voorstel (binnen 5 werkdagen, vaste prijs), 3 Ontwerpen en bouwen (klikbaar prototype, daarna bouwen met wekelijkse demo, 2 tot 10 weken), 4 Live en beheer (vast bedrag per maand).
- Altijd inbegrepen: ontwerp op maat, hosting in de EU, dagelijkse back-ups, updates en beveiliging, WCAG 2.1 AA, verwerkersovereenkomst, reactie binnen 1 werkdag, één vast aanspreekpunt.
- Reactietijden: site of app onbereikbaar → reactie binnen 4 kantooruren, werkende oplossing binnen 1 werkdag; belangrijke functie werkt niet → reactie binnen 1 werkdag, opgelost binnen 3 werkdagen; kleine wijziging → reactie binnen 2 werkdagen, binnen het urenbudget.
- Actie: "De eerste vijf klanten krijgen 50% korting op de startbijdrage."

Cases (`src/content/cases.ts`), elk met vier tabbladen:

- **HPP-Dashboard** (eigen platform, horeca). De vraag: horecaondernemers hebben hun cijfers verspreid over kassa, rooster en boekhouding, en geen tijd om ze te combineren. De oplossing: een SaaS-platform voor meerdere bedrijven tegelijk, met kassakoppelingen, AI-adviesrapporten, rollen en rechten. Techniek: React, Supabase in de EU, een eigen koppelingslaag en AI op Europese servers, data strikt gescheiden per klant. Resultaat: ondernemers zien hun stuurinformatie op één plek, automatisch bijgewerkt, zonder handwerk. Link: hpp-dashboard.nl.
- **YogaCompany.eu** (opleidingsplatform, yoga). De vraag: een opleidingsinstituut wil cursisten, lesstof, boekingen en betalingen op één plek beheren, zonder technische kennis. De oplossing: website met klantportaal, betaalde lesstof met voortgang per cursist en een eenvoudige beheeromgeving. Techniek: Next.js, Supabase in de EU, tweestapsverificatie, AVG-proof ingericht. Resultaat: cursisten volgen hun opleiding online; de organisatie heeft overzicht zonder losse lijstjes. Link: yogacompany.eu.

Schermafbeeldingen: gebruik tot ik echte beelden aanlever een duidelijk gelabelde placeholder-illustratie (geen stockfoto's). Maak `public/images/` met een README waarin staat welke beelden ik moet aanleveren en in welk formaat.

FAQ (`src/content/faq.ts`): Komen jullie echt langs? (Ja, de intake doen we altijd bij jou op locatie, gratis.) Wat kost het? (Websites vanaf € 99, apps vanaf € 449 per maand, plus een eenmalige startbijdrage. Hosting en onderhoud zitten erin.) Van wie is de code? (Na de looptijd krijg je op verzoek je broncode. Data en domein zijn altijd van jou.) Hoe snel live? (Een website in 3 tot 5 weken, een app in 2 tot 10 weken na akkoord.) Waar staat mijn data? (In de EU, met dagelijkse back-ups en een verwerkersovereenkomst.) Nemen jullie apps over? (Ja, ook uit Lovable of Bolt. We beginnen met een overname-check van € 295.) Wie schrijft de teksten van mijn website? (Jij levert de inhoud aan, wij redigeren en structureren; tekstschrijven kan als extra.) Wat gebeurt er met mijn domein als ik stop? (Je domein staat op jouw naam en blijft van jou.)

## 6. Pagina's en interactieve componenten

Bouw elke interactieve component als React-island in `src/islands/` met een duidelijke props-interface. Alle componenten: toetsenbordbediening, `aria-pressed`/`aria-expanded`/`role="tablist"` waar passend, zichtbare focusring (3 px `--ink` offset 3 px), en een variant zonder animatie bij `prefers-reduced-motion`.

### 6.1 Home (`/`)

1. **Hero**: links de roze sticker "Intake bij jou op locatie" (wiebelt licht), H1 "Maatwerk software. Vast bedrag.", onderregel, knoppen "Plan een intake" (zwart, roze schaduw) en "Bekijk de prijzen" (wit), en drie bolletjes met tekst: Hosting in de EU, Voorstel binnen 5 werkdagen, Stop je? Neem alles mee. Rechts de **CardStack**: drie kaarten (Applicaties lime "vanaf € 449 p/m", Websites roze "vanaf € 99 p/m", Beheer sky "vanaf € 59 p/m"), gestapeld met lichte draaiing en verspringing; knop "Volgende kaart" legt de volgende kaart bovenop met een animatie van 500 ms. De bovenste kaart linkt naar de betreffende pagina.
2. **Marquee** (zie hoofdstuk 4).
3. **Bewijs**: kop "Geen beloftes. Draaiende software.", twee kaarten (HPP-Dashboard, YogaCompany.eu) met een sticker "live", een voorbeeldillustratie en een korte omschrijving; linken naar `/cases`.
4. **FeatureSwitches** (zwart vlak): kop "Zet aan wat je nodig hebt.", keuze Website/App, acht schakelaars (`role="switch"`), rechts een lime resultaatkaart (roze schaduw) met pakketnaam, vanaf-prijs, complexiteitsmeter van acht blokjes, de zin "N functies aan. Vanaf-prijs excl. btw, plus startbijdrage …" en de knop "Bespreek dit bij een intake". Gebruik `recommend.ts`.
5. **Werkwijze**: vier klikbare kaarten (genummerd 1–4), de actieve kaart krijgt zijn accentkleur (lime, roze, sky, sun); elke kaart toont titel, korte tekst en een zwart label met de duur.
6. **ExitToggle**: sky-kaart "Blijf je of stop je?" met twee knoppen; rechts vier witte kaarten die van inhoud wisselen. Ik blijf: na de looptijd maandelijks opzegbaar; je software groeit mee binnen je urenbudget; updates, beveiliging en back-ups blijven geregeld; één vast aanspreekpunt dat je project kent. Ik stop: domein, teksten, beelden en data zijn altijd van jou; na de looptijd krijg je op verzoek je broncode; binnen 10 werkdagen een complete overdracht; met documentatie, zodat een ander verder kan.
7. **FlipCards** (FAQ): zes kaarten in drie kolommen; klik of Enter draait de kaart (rotateY 180°, 600 ms) en toont het antwoord op een zwarte achterkant. Zonder animatie: de kaart wisselt direct van inhoud. Schermlezers krijgen vraag en antwoord via `aria-expanded` en een verborgen antwoordtekst.
8. **SlotPicker**-CTA (roze blok): "Kies alvast een dagdeel.", vier dagdeelknoppen (di ochtend, wo middag, do ochtend, vr middag), knop "Intake aanvragen" die doorstuurt naar `/intake` met het gekozen dagdeel als query-parameter. Op de intakepagina wordt dat vooringevuld.
9. Footer.

### 6.2 Applicaties (`/applicaties`)

- Hero met sticker "Applicaties", H1 "Software die werkt zoals jij werkt." ("jij" roze gemarkeerd), onderregel, rechts een zwarte kaart "Applicaties vanaf € 449 per maand, startbijdrage vanaf € 2.450" met knop "Bespreek je idee".
- **AppExplorer**: filters (Alles, Voor klanten, Voor je team, Voor overzicht) en zes kaarten: Klantportaal (App Pro), Boekingssysteem (App Start), Teamplanning (App Start), Dashboard (App Pro), Ledenomgeving (App Pro), Eigen SaaS (App Platform). De gekozen kaart kleurt; rechts een zwart detailpaneel met omschrijving, een klein voorbeeldscherm (drie regels demo-data) en tags.
- Roze blok "Je app uit Lovable of Bolt loopt vast?" met Overname-check € 295 en Beheer Applicatie vanaf € 199 p/m, knop "Laat je app beoordelen".
- Vier tegels "Veilig vanaf de eerste regel": Inloggen met 2FA, Eigen database, Data in de EU, Verwerkersovereenkomst. Daaronder een grijze balk met de koppelingen die we kennen (kassasystemen, Mollie en Stripe, e-mail en nieuwsbrieven, Microsoft 365, boekhoudpakketten, AI op Europese servers).
- Pakketten App Start, App Pro (lime, sticker "Onze aanrader"), App Platform. Toelichting: minimale looptijd 24 maanden, daarna maandelijks opzegbaar.

### 6.3 Websites (`/websites`)

- Hero: sticker "Websites", H1 "Een website die aanvragen oplevert." ("aanvragen" lime), onderregel.
- **DevicePreview**: knoppen Desktop, Tablet, Telefoon; een voorbeeldsite ("Bakkerij Veld", fictief) in een frame met 4 px rand en harde schaduw dat vloeiend van breedte verandert (1080/640/340 px) en waarvan de indeling zich aanpast (menu wordt een hamburger op telefoon).
- Vijf tegels: Snel, Vindbaar, Toegankelijk, Zelf beheren, Geen cookiebanner.
- Pakketten met een **BillingToggle** (jaarbetaling, 1 maand gratis) die de maandprijzen omrekent.
- Roze blok "Al een website die je wilt houden?" → beheer vanaf € 59 p/m na een overname-check.
- **Accordion** met de website-FAQ (één open tegelijk, `aria-expanded`).

### 6.4 Prijzen (`/prijzen`)

- Hero: sticker "Prijzen", H1 "Alles is maatwerk. De prijs niet.", BillingToggle rechts.
- Drie groepen (Websites, Applicaties, Beheer en overname) met pakketkaarten; aanraders in lime met sticker.
- **TotalCalculator** (zwarte kaart, lime schaduw): kies een pakket (chips) en een periode (12, 24, 36 maanden); toont "startbijdrage + maanden × maandbedrag" en het totaal, met de zin "Totaal excl. btw, alles inbegrepen: bouw, hosting, onderhoud en uren."
- Rechts: stickers "Altijd inbegrepen" en een grijs blok met Extra uren (€ 95 per uur, strippenkaart 10 uur € 875), Eerder stoppen (50% van de resterende maanden) en Van jou (domein, content, data; na de looptijd de broncode).

### 6.5 Cases (`/cases`)

- Hero: sticker "Cases", H1 "Gebouwd. In gebruik. Elke dag."
- Per case een grote gekleurde kaart (HPP lime, YogaCompany roze) met **CaseTabs** (De vraag, De oplossing, Techniek, Resultaat), een voorbeeldscherm en een link naar het platform.
- Onderaan: lime kaart "Jouw project hier?" (50% korting op de startbijdrage voor de eerste vijf klanten) en een gestippelde kaart "Vastgelopen app?".

### 6.6 Werkwijze (`/werkwijze`)

- Hero: sticker "Werkwijze", H1 "Duidelijk vooraf. Betrouwbaar daarna."
- **StepTimeline**: vijf klikbare stappen (Intake op locatie, Voorstel, Ontwerp, Bouwen, Live en beheer); daaronder een zwarte kaart met titel, tekst en drie witte regels: Duur, Jij krijgt, Kosten. Inhoud: 01 1 à 2 uur / eerste advies / gratis; 02 binnen 5 werkdagen / vaste prijs / gratis; 03 1 tot 2 weken / klikbaar prototype / in startbijdrage; 04 2 tot 10 weken / wekelijkse demo / in maandbedrag; 05 zolang je wilt / maandoverzicht / in maandbedrag.
- Hostingschema: Bezoeker → Site of app (snel netwerk, SSL, aanvalsbescherming) → Database in de EU (eigen database per klant, versleuteld), plus stickers: bewaking elke minuut, updates getest vóór livegang, dagelijkse back-up plus wekelijkse kopie elders.
- Tabel "Als er iets misgaat" met de reactietijden (rijen in roze, sun en wit).
- Sun-blok "Altijd persoonlijk." met foto-placeholder en de tekst: "We werken niet vanachter een ticketsysteem. De intake doen we bij jou op locatie: we kijken mee op de werkvloer en spreken de mensen die de software gaan gebruiken. Daarna houd je één vast aanspreekpunt, van bouw tot beheer."

### 6.7 Intake (`/intake`)

**IntakeWizard**, vier stappen met voortgangsbalk (blokjes met 3 px rand: afgerond zwart, actief lime, komend wit):

1. Wat wil je laten maken? (Een website, Een applicatie, Beheer of overname, Weet ik nog niet)
2. Wat moet het kunnen? (de acht functies als aan/uit-chips)
3. Waar en wanneer? (plaats van het bedrijf; voorkeur: deze week, volgende week, ochtenden, middagen)
4. Hoe bereiken we je? (naam, bedrijf, e-mail, telefoon optioneel, akkoord met de privacyverklaring; plus een verborgen honeypotveld en een Turnstile-widget)

Rechts een zwarte samenvattingskaart (roze schaduw) die live meeloopt: Wat, Functies, Waar, Wanneer en een lime blok "Richting: <pakket>" via `recommend.ts`, met "We bevestigen dit na de intake." Na versturen: een lime sticker "Aangevraagd!" die inspringt, en de tekst "Je krijgt binnen één werkdag een bevestiging per mail." Foutafhandeling: nette meldingen per veld, serverfout zonder gegevensverlies, verzendknop niet dubbel te klikken. Daaronder drie tegels: 1 à 2 uur; Binnen 5 werkdagen een voorstel; Liever direct contact? {{EMAIL}}, {{TELEFOON}}.

De wizard slaat de tussenstand op in `sessionStorage` (geen cookies), zodat een herlaad geen invoer wist.

### 6.8 Overige pagina's

- `/inloggen`: uitleg dat klanten binnenkort inloggen op "Mijn Polar Fox" (urenbudget, verzoeken, facturen). Knop naar `/intake`.
- `/juridisch/algemene-voorwaarden`, `/juridisch/privacyverklaring`, `/juridisch/cookieverklaring`, `/juridisch/toegankelijkheidsverklaring`, `/juridisch/verwerkersovereenkomst` (zie hoofdstuk 8).
- `/404`: uitgesproken foutpagina met de vos en een knop naar home.
- `/bedankt` is niet nodig (bevestiging in de wizard), maar zorg dat een directe bezoeker van `/intake?verzonden=1` een nette melding ziet.

## 7. Intakeformulier: de Worker

Map `worker/` met Wrangler-configuratie. Eén route `POST /api/intake`.

Eisen:

- Accepteer alleen JSON van de eigen origin (CORS: alleen `https://{{DOMEIN}}` en de preview-domeinen).
- Valideer met Zod: naam (2–80 tekens), bedrijf (optioneel, max 120), e-mail (geldig, max 160), telefoon (optioneel, max 30), plaats (max 80), soort (enum), functies (array uit de vaste lijst), voorkeur (enum), dagdeel (optioneel, enum), akkoord (moet `true` zijn), honeypot (moet leeg zijn), Turnstile-token.
- Verifieer het Turnstile-token bij Cloudflare (siteverify) met `TURNSTILE_SECRET`.
- Rate limiting per IP via Cloudflare Rate Limiting of een KV-teller: maximaal 5 aanvragen per uur.
- Verstuur twee e-mails via de Brevo API (`BREVO_API_KEY`): één naar {{EMAIL}} met alle velden, één bevestiging naar de aanvrager (tekstmail zonder tracking, afzender {{EMAIL}}). Escape alle invoer; geen HTML uit de invoer overnemen.
- Sla niets op buiten de mail. Log alleen tijdstip, status en een gehashte IP (SHA-256 met dagelijkse salt) voor misbruikdetectie; geen persoonsgegevens in logs.
- Antwoord met generieke foutmeldingen (geen interne details), HTTP-statuscodes correct.
- Tests: Vitest-tests voor validatie en voor de e-mailopbouw met een gemockte Brevo-client.

## 8. Juridisch en AVG (ik ben geen jurist, jij ook niet; bouw de basis, ik laat de teksten toetsen)

Maak de juridische pagina's als Markdown-content met duidelijk gemarkeerde blokken `[TE CONTROLEREN DOOR JURIST]`. Inhoud:

- **Privacyverklaring** (art. 13 AVG): verwerkingsverantwoordelijke Polar Fox B.V., Huizen, KvK 75362538, contact {{EMAIL}}; doeleinden (beantwoorden van intake-aanvragen, contact, beveiliging van de website); grondslagen (precontractuele fase, gerechtvaardigd belang voor beveiliging); gegevens (naam, bedrijf, e-mail, telefoon, plaats, inhoud van de aanvraag, gehashte IP in beveiligingslogs); bewaartermijnen (aanvragen maximaal 12 maanden na laatste contact, beveiligingslogs 30 dagen); ontvangers en verwerkers (Cloudflare voor hosting, Turnstile en analytics; Brevo voor e-mail; beide met verwerkersovereenkomst en EU-datacenters, Cloudflare als Amerikaans bedrijf onder het EU-VS Data Privacy Framework of standaardcontractbepalingen); rechten van betrokkenen (inzage, rectificatie, verwijdering, beperking, bezwaar, overdraagbaarheid) en het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens; geen geautomatiseerde besluitvorming; datum van de laatste wijziging.
- **Cookieverklaring**: de site gebruikt geen trackingcookies; alleen functionele opslag (sessionStorage voor het formulier) en de noodzakelijke Turnstile-cookie of -opslag voor spambescherming; Cloudflare Web Analytics werkt zonder cookies. Daarom geen cookiebanner.
- **Toegankelijkheidsverklaring**: streven en status WCAG 2.1 AA, datum van de laatste controle, contactadres voor toegankelijkheidsproblemen, bekende beperkingen (bijvoorbeeld placeholder-beelden zonder definitieve alt-teksten).
- **Algemene voorwaarden**: een pagina met een korte samenvatting van het abonnementsmodel (startbijdrage, maandbedrag, minimale looptijd 12 of 24 maanden, opzegtermijn 1 maand daarna, eerder stoppen = 50% van de resterende maanden, eigendom van domein, content en data, broncode na de looptijd, licentie op het herbruikbare Polar Fox-fundament, reactietijden, aansprakelijkheid beperkt tot 12 maanden abonnementsgeld, indexatie maximaal CBS-cao-lonenindex, fair use voor hosting) en een downloadlink naar de volledige voorwaarden als pdf (`public/juridisch/algemene-voorwaarden.pdf`, voorlopig een placeholder). Voeg een artikel toe over het gebruik van AI-hulpmiddelen bij de ontwikkeling (transparant, geen klantdata naar AI-diensten zonder toestemming).
- **Verwerkersovereenkomst**: uitleg dat Polar Fox verwerker is voor klanten die persoonsgegevens laten verwerken in hun site of app, met een downloadbare modelovereenkomst (placeholder-pdf) en een subverwerkerslijst (Cloudflare, Supabase, GitHub, Brevo; regio EU).
- **Wettelijke bedrijfsgegevens** in de footer en op de contactplekken: statutaire naam, vestigingsplaats, KvK-nummer, btw-identificatienummer, e-mailadres.
- Geen prijzen zonder "excl. btw". Geen aanbiedingen zonder voorwaarden: bij de actie "eerste vijf klanten" een link naar de voorwaarden.

## 9. Beveiliging

- `public/_headers` (Cloudflare) met: `Content-Security-Policy` (default-src 'self'; script-src 'self' https://challenges.cloudflare.com plus de hashes of nonces die Astro nodig heeft; style-src 'self' 'unsafe-inline' alleen als het echt niet anders kan, liever hashes; img-src 'self' data:; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'), `Strict-Transport-Security` (2 jaar, includeSubDomains, preload), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation uit), `X-Frame-Options: DENY`.
- Geen inline event handlers; alle scripts als modules uit de eigen build.
- Dependencies: vaste versies via lockfile, `npm audit` in CI, Renovate- of Dependabot-configuratie.
- Worker: alle invoer gevalideerd, uitvoer geëscaped, secrets alleen via `wrangler secret`, geen `console.log` van persoonsgegevens.
- `SECURITY.md` met een meldadres voor kwetsbaarheden ({{EMAIL}}) en een `security.txt` in `public/.well-known/`.
- Draai vóór oplevering een check met Mozilla Observatory of een vergelijkbare headertest en documenteer de score in `docs/RUNBOOK.md`.

## 10. Prestaties, SEO en toegankelijkheid

- Lighthouse: Performance, Accessibility, Best Practices en SEO elk minimaal 95 op mobiel en desktop. Voeg Lighthouse CI toe met deze drempels.
- Afbeeldingen via `astro:assets` (WebP/AVIF, `loading="lazy"` buiten de eerste schermvulling, correcte `width`/`height`).
- Lettertype: alleen de gebruikte gewichten (400–700), `preload` van het hoofdbestand.
- Metadata per pagina: titel, beschrijving, canonical, Open Graph en Twitter-kaart met een eigen OG-afbeelding in huisstijl (genereer een statische PNG 1200×630 met logo en de belofte).
- `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, favicons.
- Structured data (JSON-LD): `Organization` (naam, adres Huizen, KvK als `identifier`, e-mail), `Service` per dienst met `offers` (vanaf-prijzen, `priceCurrency: EUR`), `FAQPage` op de homepage.
- Toegankelijkheid: één H1 per pagina, logische kopvolgorde, landmarks (`header`, `nav`, `main`, `footer`), skiplink, focusvolgorde, contrast ≥ 4,5:1, knoppen minimaal 44 × 44 px, formulieren met labels en foutmeldingen die aan velden gekoppeld zijn, geen informatie alleen via kleur, animaties uit bij `prefers-reduced-motion`. Playwright draait `@axe-core/playwright` op elke pagina; nul serieuze overtredingen.
- Responsief: breekpunten 390, 768, 1024, 1440. De mobiele home volgt het mobiele ontwerp (menu-overlay, kaartenstapel kleiner, vijf schakelaars, drie draaikaarten).

## 11. Tests en kwaliteit

- Vitest: `pricing.ts`, `recommend.ts`, Worker-validatie, e-mailopbouw.
- Playwright: home laadt en toont H1; CardStack wisselt van kaart; FeatureSwitches geeft App Pro bij 3 functies; FlipCard draait; BillingToggle rekent € 189 om naar € 173; TotalCalculator toont € 13.226 voor App Start over 24 maanden; IntakeWizard doorloopt vier stappen en toont "Aangevraagd!" met een gemockte API; mobiel menu opent en sluit met Escape; axe-scan op alle pagina's.
- GitHub Actions: `lint`, `check`, `test`, `build`, `lighthouse` bij pull requests; `deploy` naar Cloudflare bij `main`.
- Pre-commit: lint-staged met ESLint en Prettier.

## 12. Fasering

Voer de fases in deze volgorde uit. Commit na elke fase.

1. **Fundament**: repo, Astro, TypeScript strict, Tailwind, tokens, fonts, BaseLayout, Header, Footer, Marquee, logo en favicons, 404, `docs/` met BRIEFING.md (deze tekst), BESLUITEN.md, RUNBOOK.md, SECURITY.md.
2. **Data en logica**: `packages.ts`, `cases.ts`, `faq.ts`, `pricing.ts`, `recommend.ts` met tests.
3. **Islands**: CardStack, FeatureSwitches, WorkflowCards, ExitToggle, FlipCards, SlotPicker, AppExplorer, DevicePreview, BillingToggle, Accordion, TotalCalculator, CaseTabs, StepTimeline, IntakeWizard, MobileMenu. Elke component met Storybook-achtige demo-pagina onder `/dev/` (alleen in development gebouwd).
4. **Pagina's**: home, applicaties, websites, prijzen, cases, werkwijze, intake, inloggen, juridische pagina's.
5. **Worker**: `POST /api/intake` met validatie, Turnstile, rate limiting, Brevo, tests; lokaal te draaien met `wrangler dev`.
6. **Beveiliging en headers**: `_headers`, CSP getest in de browser zonder consolefouten, `security.txt`.
7. **SEO, prestaties, toegankelijkheid**: metadata, JSON-LD, sitemap, OG-afbeelding, Lighthouse CI, axe.
8. **Playwright-flows en CI/CD**: alle tests groen, GitHub Actions werkend, deploy-workflow met `wrangler deploy` en preview-omgevingen.
9. **Overdracht**: `README.md` (installatie, scripts, omgevingsvariabelen, deploy), `docs/RUNBOOK.md` (hoe ik teksten, prijzen, cases en FAQ aanpas; hoe ik beelden aanlever; hoe ik een nieuw pakket toevoeg), `docs/CHECKLIST-LIVEGANG.md`.

## 13. Definitie van klaar

- Alle pagina's uit hoofdstuk 6 bestaan, zien eruit volgens hoofdstuk 3 en werken op 390 tot 1440 px.
- Alle interactieve componenten werken met muis, aanraking en toetsenbord, ook zonder animaties.
- Intakeformulier verstuurt via de Worker, met spam- en misbruikbescherming, en levert twee e-mails op.
- Lighthouse ≥ 95 op alle vier de onderdelen; axe zonder serieuze overtredingen; geen consolefouten; CSP actief.
- Juridische pagina's staan er met duidelijke markeringen voor de jurist; bedrijfsgegevens correct; alle prijzen "excl. btw".
- Tests en CI groen; `README.md` en `docs/RUNBOOK.md` compleet; `.env.example` aanwezig; geen secrets in git.
- Openstaande punten die ik moet aanleveren staan in `docs/OPENSTAAND.md`: echte schermafbeeldingen van HPP-Dashboard en YogaCompany, foto's van een intake op locatie, definitieve juridische teksten (pdf's), {{DOMEIN}}, {{EMAIL}}, {{TELEFOON}}, {{BTW}}, Cloudflare-account en Brevo-sleutel.
