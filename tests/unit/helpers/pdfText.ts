/**
 * Reads the text back from an uncompressed PDF made with the built-in fonts,
 * where every line is written as a TJ array of hex-encoded Latin-1 strings.
 */
export function pdfText(pdf: Uint8Array): string {
  const source = Buffer.from(pdf).toString('latin1');
  const lines = source.match(/\[[^\]]*\] TJ/g) ?? [];
  return lines
    .map((line) =>
      [...line.matchAll(/<([0-9a-f]*)>/gi)]
        .map(([, hex]) => Buffer.from(hex, 'hex').toString('latin1'))
        .join(''),
    )
    .join(' ')
    .replace(/\s+/g, ' ');
}
