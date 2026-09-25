// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Productiedomein. Wordt gebruikt voor canonical-URL's, sitemap en Open Graph.
const SITE = 'https://polarfoxbv.nl';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  // Nette URL's zonder .html: /prijzen -> dist/prijzen/index.html
  build: { format: 'directory' },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  security: {
    // Astro genereert per pagina hashes voor de eigen inline scripts en styles,
    // zodat we geen 'unsafe-inline' nodig hebben. De overige directives staan
    // in public/_headers (fase 6); hier alleen wat Astro zelf moet weten.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://challenges.cloudflare.com",
        'frame-src https://challenges.cloudflare.com',
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", 'https://challenges.cloudflare.com'],
      },
      styleDirective: {
        resources: ["'self'"],
      },
    },
  },
  // Juridische pagina's zijn Markdown zonder codeblokken; Shiki zou inline styles
  // toevoegen die botsen met de CSP.
  markdown: { syntaxHighlight: false },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  devToolbar: { enabled: false },
});
