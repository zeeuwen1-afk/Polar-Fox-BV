/**
 * Bindings en variabelen van de Worker. Secrets komen via `wrangler secret`,
 * de rest via [vars] in wrangler.toml.
 */
export interface Env {
  ASSETS: Fetcher;
  /** Optioneel: zonder binding (bijvoorbeeld lokaal) wordt rate limiting overgeslagen. */
  RATE_LIMIT?: KVNamespace;

  ALLOWED_ORIGINS: string;
  INTAKE_TO_EMAIL: string;
  INTAKE_FROM_EMAIL: string;
  INTAKE_FROM_NAME: string;

  // Secrets
  TURNSTILE_SECRET: string;
  BREVO_API_KEY: string;
  LOG_SALT: string;
}
