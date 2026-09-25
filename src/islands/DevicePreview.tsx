import { useState } from 'react';

type Device = 'desktop' | 'tablet' | 'phone';

const devices: readonly { id: Device; label: string; width: string }[] = [
  { id: 'desktop', label: 'Desktop', width: '1080 px' },
  { id: 'tablet', label: 'Tablet', width: '640 px' },
  { id: 'phone', label: 'Telefoon', width: '340 px' },
];

/**
 * Voorbeeldsite "Bakkerij Veld" (fictief) in een frame dat vloeiend van
 * breedte verandert. Op telefoonbreedte wordt het menu een hamburger en
 * de inhoud één kolom (zie islands.css).
 */
export default function DevicePreview() {
  const [device, setDevice] = useState<Device>('desktop');
  const current = devices.find((item) => item.id === device) ?? devices[0];

  return (
    <div>
      <div role="group" aria-label="Schermformaat" className="flex flex-wrap justify-center gap-3">
        {devices.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={device === item.id}
            onClick={() => setDevice(item.id)}
            className={`btn ${device === item.id ? 'btn-ink' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Voorbeeld op {current?.label.toLowerCase()}, {current?.width} breed.
      </p>

      <div className="mt-8 overflow-x-clip px-2 pb-3">
        <div
          className="device-frame"
          data-device={device}
          data-testid="device-frame"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between border-b-[3px] border-ink px-4 py-3">
            <span className="font-bold tracking-tight">Bakkerij Veld</span>
            <ul className="device-nav flex gap-4 text-sm font-bold">
              <li>Brood</li>
              <li>Taarten</li>
              <li>Bestellen</li>
              <li>Contact</li>
            </ul>
            <span className="device-burger flex h-9 w-9 items-center justify-center rounded-[8px] border-[3px] border-ink bg-lime">
              <span className="block h-0.5 w-4 bg-ink shadow-[0_5px_0_var(--ink),0_-5px_0_var(--ink)]" />
            </span>
          </div>
          <div className="device-grid grid grid-cols-[1.2fr_1fr] gap-4 p-4">
            <div className="rounded-[12px] border-[3px] border-ink bg-sun p-4">
              <p className="text-2xl leading-tight font-bold tracking-tight">
                Vers brood, elke ochtend.
              </p>
              <p className="mt-2 text-sm">Bestel voor 18:00 en haal het morgen op.</p>
              <span className="mt-3 inline-block rounded-[8px] border-[3px] border-ink bg-ink px-3 py-1 text-sm font-bold text-paper">
                Bestel nu
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-16 rounded-[12px] border-[3px] border-ink bg-stone" />
              <div className="h-16 rounded-[12px] border-[3px] border-ink bg-pink" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
