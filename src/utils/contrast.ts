/** WCAG 2.x contrast helpers. See https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio */

function parseHex(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    throw new Error(`Expected a 6-digit hex colour like #3a3335, got "${hex}"`);
  }
  const value = match[1];
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/** The colour seen where `top` lies over `bottom` with the given opacity, as browsers mix them. */
export function blend(top: string, bottom: string, alpha: number): string {
  const over = parseHex(top);
  const under = parseHex(bottom);
  return `#${over
    .map((channel, i) => Math.round(channel * alpha + under[i] * (1 - alpha)))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** A hex colour as a CSS colour with the given opacity, e.g. `rgb(253 240 213 / 0.85)`. */
export function translucent(hex: string, alpha: number): string {
  return `rgb(${parseHex(hex).join(' ')} / ${alpha})`;
}
