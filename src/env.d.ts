/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Turnstile site key (publiek). Leeg = geen widget, alleen lokaal. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  /** Volledige URL van de intake-API. Leeg = /api/intake op dezelfde origin. */
  readonly PUBLIC_INTAKE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
