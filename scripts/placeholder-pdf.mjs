// Maakt twee placeholder-pdf's in public/juridisch/ zonder extra afhankelijkheden.
// De echte documenten komen van de jurist (zie docs/OPENSTAAND.md).
import { mkdirSync, writeFileSync } from 'node:fs';

function makePdf(title, lines) {
  const text = [title, '', ...lines];
  const content = [
    'BT',
    '/F1 18 Tf',
    '72 760 Td',
    `(${escape(text[0])}) Tj`,
    '/F1 11 Tf',
    '0 -28 Td',
    ...text.slice(1).flatMap((line) => [`(${escape(line)}) Tj`, '0 -16 Td']),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];

  let body = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(body, 'latin1');
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) body += `${String(offset).padStart(10, '0')} 00000 n \n`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

function escape(value) {
  return value.replace(/[\\()]/g, (match) => `\\${match}`);
}

mkdirSync('public/juridisch', { recursive: true });

writeFileSync(
  'public/juridisch/algemene-voorwaarden.pdf',
  makePdf('Algemene voorwaarden Polar Fox B.V. (PLACEHOLDER)', [
    'Dit is een voorlopig document. De definitieve algemene voorwaarden',
    'worden door een jurist opgesteld en vervangen dit bestand.',
    '',
    'Samenvatting: zie https://polarfoxbv.nl/juridisch/algemene-voorwaarden',
    'Polar Fox B.V., Huizen, KvK 75362538, info@polarfoxbv.nl',
  ]),
);

writeFileSync(
  'public/juridisch/verwerkersovereenkomst.pdf',
  makePdf('Modelverwerkersovereenkomst Polar Fox B.V. (PLACEHOLDER)', [
    'Dit is een voorlopig document. De definitieve modelovereenkomst',
    'conform artikel 28 AVG wordt door een jurist opgesteld.',
    '',
    'Toelichting: zie https://polarfoxbv.nl/juridisch/verwerkersovereenkomst',
    'Polar Fox B.V., Huizen, KvK 75362538, info@polarfoxbv.nl',
  ]),
);

console.warn('placeholder-pdf: 2 bestanden geschreven in public/juridisch/');
