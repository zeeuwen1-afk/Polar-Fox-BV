/**
 * Cloudflare Turnstile laden en renderen. Het script komt van
 * challenges.cloudflare.com (toegestaan in de CSP) en wordt pas geladen als
 * de bezoeker de laatste stap van de intake bereikt.
 */

export interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  size?: 'normal' | 'compact' | 'flexible';
}

export interface TurnstileApi {
  render: (element: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let loading: Promise<TurnstileApi> | null = null;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;

  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile is geladen maar niet beschikbaar.'));
    };
    script.onerror = () => {
      loading = null;
      reject(new Error('Turnstile kon niet worden geladen.'));
    };
    document.head.append(script);
  });

  return loading;
}
