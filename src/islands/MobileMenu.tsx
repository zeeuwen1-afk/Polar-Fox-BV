import { useCallback, useEffect, useId, useRef, useState } from 'react';

export interface MobileMenuItem {
  href: string;
  label: string;
}

export interface MobileMenuProps {
  items: readonly MobileMenuItem[];
  currentPath: string;
}

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * Mobiel menu: lime vierkant met rand en schaduw dat een volledig lime scherm
 * opent. Menu-items zijn grote witte kaarten, onderaan een zwarte knop.
 * Sluit met Escape of de sluitknop; de focus blijft in het open menu en gaat
 * bij sluiten terug naar de menuknop.
 */
export default function MobileMenu({ items, currentPath }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Focus terug naar de knop die het menu opende.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Scrollen van de pagina achter het menu blokkeren.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Eerste focusbare element in het paneel krijgt focus.
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;

      // Focus trap: Tab op het laatste element gaat naar het eerste en andersom.
      const list = focusables();
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-lime h-12 w-12 min-w-12 p-0"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Menu sluiten' : 'Menu openen'}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <MenuIcon open={open} />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-lime p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">Menu</span>
            <button
              type="button"
              className="btn h-12 w-12 min-w-12 p-0"
              aria-label="Menu sluiten"
              onClick={close}
            >
              <MenuIcon open />
            </button>
          </div>

          <nav aria-label="Hoofdmenu (mobiel)" className="mt-6 flex flex-1 flex-col gap-3">
            {items.map((item) => {
              const active = currentPath === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="card flex min-h-16 items-center justify-between px-5 text-2xl font-bold no-underline"
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true">→</span>
                </a>
              );
            })}
            <a
              href="/inloggen"
              className="card flex min-h-16 items-center px-5 text-2xl font-bold no-underline"
            >
              Inloggen
            </a>
          </nav>

          <a href="/intake" className="btn btn-ink mt-6 w-full text-lg">
            Plan een intake op locatie
          </a>
        </div>
      )}
    </>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {open ? (
        <>
          <path d="M5 5l14 14" />
          <path d="M19 5L5 19" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
