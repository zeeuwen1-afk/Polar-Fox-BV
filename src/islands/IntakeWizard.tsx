import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { formatEuro } from '../lib/pricing';
import {
  features,
  projectKinds,
  recommendFor,
  type FeatureId,
  type ProjectKind,
} from '../lib/recommend';
import {
  fieldErrors,
  intakeSchema,
  preferenceLabels,
  preferenceValues,
  slotLabels,
  slotValues,
  type IntakeData,
} from '../lib/intakeSchema';
import { loadTurnstile } from '../lib/turnstile';

export interface IntakeWizardProps {
  /** Turnstile site key. Leeg = geen widget (alleen lokaal ontwikkelen). */
  turnstileSiteKey: string;
  /** Endpoint van de Worker; standaard /api/intake op dezelfde origin. */
  apiUrl: string;
  /** Privacyverklaring waar het akkoord naar verwijst. */
  privacyHref: string;
}

type Preference = (typeof preferenceValues)[number];
type Slot = (typeof slotValues)[number];

interface FormState {
  soort: ProjectKind | '';
  functies: FeatureId[];
  plaats: string;
  voorkeur: Preference | '';
  dagdeel: Slot | '';
  naam: string;
  bedrijf: string;
  email: string;
  telefoon: string;
  akkoord: boolean;
}

type FieldName = keyof FormState | 'turnstileToken' | 'website';
type Errors = Partial<Record<FieldName, string | undefined>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const STORAGE_KEY = 'polarfox-intake';
const STEPS = [
  'Wat wil je laten maken?',
  'Wat moet het kunnen?',
  'Waar en wanneer?',
  'Hoe bereiken we je?',
];
const LAST_STEP = STEPS.length - 1;

const emptyState: FormState = {
  soort: '',
  functies: [],
  plaats: '',
  voorkeur: '',
  dagdeel: '',
  naam: '',
  bedrijf: '',
  email: '',
  telefoon: '',
  akkoord: false,
};

/** Welke velden per stap gecontroleerd worden voordat je verder mag. */
const stepFields: readonly (keyof IntakeData)[][] = [
  ['soort'],
  ['functies'],
  ['plaats', 'voorkeur', 'dagdeel'],
  ['naam', 'bedrijf', 'email', 'telefoon', 'akkoord', 'turnstileToken', 'website'],
];

function isFeatureId(value: string): value is FeatureId {
  return features.some((feature) => feature.id === value);
}
function isKind(value: string): value is ProjectKind {
  return projectKinds.some((kind) => kind.id === value);
}
function isSlot(value: string): value is Slot {
  return (slotValues as readonly string[]).includes(value);
}

/** Tussenstand uit sessionStorage; nooit cookies. */
function readStored(): { state: FormState; step: number } | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: Partial<FormState>; step?: number };
    return {
      state: { ...emptyState, ...parsed.state, akkoord: false },
      step: Math.min(LAST_STEP, Math.max(0, parsed.step ?? 0)),
    };
  } catch {
    return null;
  }
}

/**
 * Intake in vier stappen met voortgangsbalk, live samenvatting, opslag in
 * sessionStorage, validatie per veld (gedeeld Zod-schema), honeypot en
 * Turnstile. Verstuurt JSON naar de Worker; bij een serverfout blijft alle
 * invoer staan en is de knop niet dubbel te klikken.
 */
export default function IntakeWizard({ turnstileSiteKey, apiUrl, privacyHref }: IntakeWizardProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [token, setToken] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidget = useRef<string | null>(null);
  const baseId = useId();

  // Eerste render: tussenstand herstellen en URL-parameters (dagdeel, soort,
  // functies, verzonden) toepassen. Alleen in de browser.
  // Deze effect zet bewust state na de eerste render: de server kent de URL
  // en sessionStorage niet, dus dit is de enige plek om ze toe te passen.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verzonden') === '1') {
      setStatus('success');
      setHydrated(true);
      return;
    }
    const stored = readStored();
    let next = stored?.state ?? emptyState;
    let nextStep = stored?.step ?? 0;

    const soort = params.get('soort');
    if (soort && isKind(soort)) next = { ...next, soort };
    const functies = params.get('functies');
    if (functies) next = { ...next, functies: functies.split(',').filter(isFeatureId) };
    const dagdeel = params.get('dagdeel');
    if (dagdeel && isSlot(dagdeel)) next = { ...next, dagdeel };
    // Wie via de dagdeelkiezer komt, heeft al gekozen: begin bij "Waar en wanneer?"
    // tenzij het soort project nog ontbreekt.
    if (dagdeel && !stored && next.soort) nextStep = 2;

    setForm(next);
    setStep(nextStep);
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Tussenstand bewaren (zonder akkoord, token of honeypot).
  useEffect(() => {
    if (!hydrated || status === 'success') return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state: form, step }));
    } catch {
      // Opslag kan geblokkeerd zijn; dan werkt het formulier gewoon zonder.
    }
  }, [form, step, hydrated, status]);

  // Focus naar de stapkop bij een stapwissel.
  useEffect(() => {
    if (hydrated) headingRef.current?.focus();
  }, [step, hydrated]);

  // Turnstile pas renderen op de laatste stap.
  useEffect(() => {
    if (step !== LAST_STEP || !turnstileSiteKey || status === 'success') return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !turnstileRef.current || turnstileWidget.current) return;
        turnstileWidget.current = api.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          language: 'nl',
          theme: 'light',
          size: 'flexible',
          callback: (value) => {
            setToken(value);
            setErrors((current) => ({ ...current, turnstileToken: undefined }));
          },
          'expired-callback': () => setToken(''),
          'error-callback': () => setToken(''),
        });
      })
      .catch(() => {
        setErrors((current) => ({
          ...current,
          turnstileToken: 'De spamcontrole kon niet laden. Herlaad de pagina of mail ons.',
        }));
      });
    return () => {
      cancelled = true;
      if (turnstileWidget.current && window.turnstile) {
        window.turnstile.remove(turnstileWidget.current);
        turnstileWidget.current = null;
      }
    };
  }, [step, turnstileSiteKey, status]);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }, []);

  const toggleFeature = (id: FeatureId) => {
    update(
      'functies',
      form.functies.includes(id) ? form.functies.filter((f) => f !== id) : [...form.functies, id],
    );
  };

  /** Payload zoals de Worker hem verwacht. */
  const payload = () => ({
    ...form,
    dagdeel: form.dagdeel || undefined,
    website: honeypotRef.current?.value ?? '',
    turnstileToken: turnstileSiteKey ? token : 'geen-sitekey',
  });

  /** Controleert alleen de velden van de huidige stap. */
  const validateStep = (index: number): boolean => {
    const fields = stepFields[index] ?? [];
    const result = intakeSchema.safeParse(payload());
    if (result.success) return true;
    const all = fieldErrors(result.error);
    const relevant: Errors = {};
    for (const field of fields) {
      if (all[field]) relevant[field] = all[field];
    }
    setErrors((current) => ({ ...current, ...relevant }));
    return Object.keys(relevant).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(LAST_STEP, current + 1));
  };
  const goBack = () => setStep((current) => Math.max(0, current - 1));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'submitting') return;
    if (!validateStep(LAST_STEP)) return;

    setStatus('submitting');
    setServerMessage('');
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload()),
      });
      if (response.ok) {
        setStatus('success');
        try {
          window.sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // niets
        }
        return;
      }
      const body = (await response.json().catch(() => null)) as {
        errors?: Record<string, string>;
        message?: string;
      } | null;
      if (response.status === 400 && body?.errors) {
        setErrors(body.errors as Errors);
        // Terug naar de eerste stap met een fout.
        const firstBad = stepFields.findIndex((fields) =>
          fields.some((field) => body.errors?.[field]),
        );
        if (firstBad >= 0) setStep(firstBad);
      }
      setServerMessage(
        body?.message ??
          (response.status === 429
            ? 'Je hebt kort geleden al een aanvraag gedaan. Probeer het over een uur nog eens, of mail ons.'
            : 'Versturen is niet gelukt. Je invoer staat er nog; probeer het opnieuw of mail ons.'),
      );
      setStatus('error');
      if (turnstileWidget.current) window.turnstile?.reset(turnstileWidget.current);
      setToken('');
    } catch {
      setServerMessage('Geen verbinding. Je invoer staat er nog; probeer het zo nog eens.');
      setStatus('error');
    }
  };

  const recommendation = recommendFor(form.soort || 'onbekend', form.functies);
  const errorId = (field: FieldName) => `${baseId}-${field}-fout`;

  if (status === 'success') {
    return (
      <div className="card-lg bg-paper p-8 text-center md:p-12" data-testid="intake-success">
        <span className="sticker pop-in tilt-n3 bg-lime text-xl">Aangevraagd!</span>
        <h2 className="mt-6">Dank je wel.</h2>
        <p className="mt-4 text-xl">Je krijgt binnen één werkdag een bevestiging per mail.</p>
        <a href="/" className="btn mt-8">
          Terug naar de homepage
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
      <form
        onSubmit={submit}
        noValidate
        className="card-lg bg-paper p-6 md:p-8"
        aria-busy={status === 'submitting'}
      >
        {/* Voortgang: afgerond zwart, actief lime, komend wit. */}
        <div className="flex gap-2" aria-hidden="true">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className="progress-block"
              data-state={index < step ? 'done' : index === step ? 'active' : 'todo'}
            />
          ))}
        </div>
        <p className="mt-2 text-sm font-bold">
          Stap {step + 1} van {STEPS.length}
        </p>
        <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl outline-none md:text-4xl">
          {STEPS[step]}
        </h2>

        {serverMessage && (
          <p
            role="alert"
            className="mt-4 rounded-[12px] border-[3px] border-ink bg-sun p-4 font-bold"
          >
            {serverMessage}
          </p>
        )}

        {step === 0 && (
          <fieldset className="mt-6 border-0 p-0">
            <legend className="sr-only">Soort project</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {projectKinds.map((kind) => {
                const checked = form.soort === kind.id;
                return (
                  <label
                    key={kind.id}
                    className={`btn min-h-16 cursor-pointer justify-start text-lg has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${
                      checked ? 'btn-lime' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="soort"
                      value={kind.id}
                      checked={checked}
                      onChange={() => update('soort', kind.id)}
                      className="sr-only"
                      aria-describedby={errors.soort ? errorId('soort') : undefined}
                    />
                    {kind.label}
                  </label>
                );
              })}
            </div>
            {errors.soort && <FieldError id={errorId('soort')} text={errors.soort} />}
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="mt-6 border-0 p-0">
            <legend className="mb-3">Zet aan wat je nodig hebt. Twijfel je? Sla het over.</legend>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => {
                const on = form.functies.includes(feature.id);
                return (
                  <label
                    key={feature.id}
                    className={`sticker tilt-0 cursor-pointer text-base has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${
                      on ? 'bg-lime' : 'bg-paper'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="functies"
                      value={feature.id}
                      checked={on}
                      onChange={() => toggleFeature(feature.id)}
                      className="sr-only"
                    />
                    {on ? '✓ ' : ''}
                    {feature.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div className="mt-6 flex flex-col gap-6">
            <TextField
              id={`${baseId}-plaats`}
              label="Plaats van je bedrijf"
              value={form.plaats}
              onChange={(value) => update('plaats', value)}
              error={errors.plaats}
              errorId={errorId('plaats')}
              autoComplete="address-level2"
              required
            />
            <fieldset className="border-0 p-0">
              <legend className="mb-3 font-bold">Wanneer komt het je uit?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {preferenceValues.map((value) => {
                  const checked = form.voorkeur === value;
                  return (
                    <label
                      key={value}
                      className={`btn cursor-pointer justify-start has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink ${
                        checked ? 'btn-lime' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="voorkeur"
                        value={value}
                        checked={checked}
                        onChange={() => update('voorkeur', value)}
                        className="sr-only"
                        aria-describedby={errors.voorkeur ? errorId('voorkeur') : undefined}
                      />
                      {preferenceLabels[value]}
                    </label>
                  );
                })}
              </div>
              {errors.voorkeur && <FieldError id={errorId('voorkeur')} text={errors.voorkeur} />}
            </fieldset>
            <div>
              <label htmlFor={`${baseId}-dagdeel`} className="mb-2 block font-bold">
                Voorkeur voor een dagdeel (optioneel)
              </label>
              <select
                id={`${baseId}-dagdeel`}
                name="dagdeel"
                value={form.dagdeel}
                onChange={(event) => update('dagdeel', event.target.value as Slot | '')}
                className="field"
              >
                <option value="">Geen voorkeur</option>
                {slotValues.map((value) => (
                  <option key={value} value={value}>
                    {slotLabels[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === LAST_STEP && (
          <div className="mt-6 flex flex-col gap-5">
            <TextField
              id={`${baseId}-naam`}
              label="Je naam"
              value={form.naam}
              onChange={(value) => update('naam', value)}
              error={errors.naam}
              errorId={errorId('naam')}
              autoComplete="name"
              required
            />
            <TextField
              id={`${baseId}-bedrijf`}
              label="Bedrijf (optioneel)"
              value={form.bedrijf}
              onChange={(value) => update('bedrijf', value)}
              error={errors.bedrijf}
              errorId={errorId('bedrijf')}
              autoComplete="organization"
            />
            <TextField
              id={`${baseId}-email`}
              label="E-mailadres"
              type="email"
              value={form.email}
              onChange={(value) => update('email', value)}
              error={errors.email}
              errorId={errorId('email')}
              autoComplete="email"
              required
            />
            <TextField
              id={`${baseId}-telefoon`}
              label="Telefoon (optioneel)"
              type="tel"
              value={form.telefoon}
              onChange={(value) => update('telefoon', value)}
              error={errors.telefoon}
              errorId={errorId('telefoon')}
              autoComplete="tel"
            />

            {/* Honeypot: onzichtbaar voor mensen, bots vullen het in. */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor={`${baseId}-website`}>Laat dit veld leeg</label>
              <input
                ref={honeypotRef}
                id={`${baseId}-website`}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="akkoord"
                  checked={form.akkoord}
                  onChange={(event) => update('akkoord', event.target.checked)}
                  aria-invalid={errors.akkoord ? true : undefined}
                  aria-describedby={errors.akkoord ? errorId('akkoord') : undefined}
                  className="mt-1 h-6 w-6 shrink-0 accent-ink"
                  required
                />
                <span>
                  Ik ga akkoord met de{' '}
                  <a href={privacyHref} className="underline underline-offset-4">
                    privacyverklaring
                  </a>
                  . We gebruiken je gegevens alleen om de intake te plannen.
                </span>
              </label>
              {errors.akkoord && <FieldError id={errorId('akkoord')} text={errors.akkoord} />}
            </div>

            <div>
              {turnstileSiteKey ? (
                <div ref={turnstileRef} data-testid="turnstile" />
              ) : (
                <p className="text-sm">
                  Spamcontrole staat uit (geen Turnstile-sleutel ingesteld).
                </p>
              )}
              {errors.turnstileToken && (
                <FieldError id={errorId('turnstileToken')} text={errors.turnstileToken} />
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {step > 0 ? (
            <button type="button" className="btn" onClick={goBack}>
              <span aria-hidden="true">←</span> Vorige
            </button>
          ) : (
            <span />
          )}
          {step < LAST_STEP ? (
            <button type="button" className="btn btn-lime" onClick={goNext}>
              Volgende <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-lime"
              disabled={status === 'submitting'}
              aria-disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Versturen…' : 'Intake aanvragen'}
            </button>
          )}
        </div>
      </form>

      <aside
        className="card-lg on-ink self-start bg-ink p-6 text-paper shadow-hard-lg-pink md:p-8"
        aria-label="Samenvatting van je aanvraag"
      >
        <h2 className="text-2xl text-paper">Samenvatting</h2>
        <dl className="mt-4 flex flex-col gap-3">
          <SummaryRow
            label="Wat"
            value={projectKinds.find((k) => k.id === form.soort)?.label ?? 'Nog te kiezen'}
          />
          <SummaryRow
            label="Functies"
            value={
              form.functies.length
                ? features
                    .filter((f) => form.functies.includes(f.id))
                    .map((f) => f.label)
                    .join(', ')
                : 'Geen gekozen'
            }
          />
          <SummaryRow label="Waar" value={form.plaats || 'Nog in te vullen'} />
          <SummaryRow
            label="Wanneer"
            value={
              [
                form.voorkeur ? preferenceLabels[form.voorkeur] : '',
                form.dagdeel ? slotLabels[form.dagdeel] : '',
              ]
                .filter(Boolean)
                .join(', ') || 'Nog te kiezen'
            }
          />
        </dl>
        <div
          className="mt-6 rounded-[12px] border-[3px] border-ink bg-lime p-4 text-ink"
          aria-live="polite"
        >
          <p className="text-sm font-bold tracking-wide uppercase">Richting</p>
          <p className="text-2xl font-bold tracking-tight" data-testid="intake-recommendation">
            {recommendation.label}
          </p>
          {recommendation.pkg && (
            <p className="mt-1 font-bold">
              vanaf {formatEuro(recommendation.pkg.monthly)} p/m excl. btw
            </p>
          )}
          <p className="mt-2 text-sm">We bevestigen dit na de intake.</p>
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b-[3px] border-paper/20 pb-3">
      <dt className="text-sm font-bold tracking-wide text-lime uppercase">{label}</dt>
      <dd className="m-0 mt-1">{value}</dd>
    </div>
  );
}

function FieldError({ id, text }: { id: string; text: string }) {
  return (
    <p id={id} className="mt-2 text-sm font-bold text-[#b3001b]" role="alert">
      {text}
    </p>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  errorId: string;
  type?: 'text' | 'email' | 'tel';
  autoComplete?: string;
  required?: boolean;
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  errorId,
  type = 'text',
  autoComplete,
  required,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-bold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="field"
      />
      {error && <FieldError id={errorId} text={error} />}
    </div>
  );
}
