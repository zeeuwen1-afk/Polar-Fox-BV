// Lighthouse CI: elke categorie minimaal 0,95 op de belangrijkste pagina's.
// Standaard mobiel (Lighthouse-default); `npm run lighthouse:desktop` draait
// hetzelfde met het desktop-profiel. Rapporten komen in .lighthouseci/.
const pages = ['/', '/applicaties', '/websites', '/prijzen', '/cases', '/werkwijze', '/intake'];

module.exports = {
  ci: {
    collect: {
      // Astro staat één preview-server per project toe: stop een lopende eerst
      // met `npx astro preview stop` als deze stap faalt.
      startServerCommand: 'npx astro preview --host 127.0.0.1 --port 4173',
      startServerReadyPattern: 'Local',
      url: pages.map((path) => `http://127.0.0.1:4173${path}`),
      numberOfRuns: 1,
      settings: {
        // Turnstile en analytics zijn extern; lokaal niet aanwezig.
        skipAudits: ['uses-http2'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
