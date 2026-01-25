import type { ColorState } from './types';

function fastRound(num: number, precision: number): number {
  const f = 10 ** precision;
  return Math.round(num * f) / f;
}

export function formatCss(
  state: ColorState,
  alpha?: number,
  asHex?: boolean,
  precision = 2,
): string {
  const { values, mode } = state;
  const v1 = values[0];
  const v2 = values[1];
  const v3 = values[2];

  if (mode === 'rgb' && asHex) {
    const r = Math.round(v1 * 255);
    const g = Math.round(v2 * 255);
    const b = Math.round(v3 * 255);

    let hex = ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);

    if (alpha !== undefined && alpha < 1) {
      const a = Math.round(alpha * 255);
      hex += ((1 << 8) | a).toString(16).slice(1);
    }

    return `#${hex}`;
  }

  const a =
    alpha !== undefined && alpha < 1
      ? ` / ${fastRound(alpha * 100, precision)}%`
      : '';

  switch (mode) {
    case 'rgb':
      return `rgb(${Math.round(v1 * 255)} ${Math.round(v2 * 255)} ${Math.round(v3 * 255)}${a})`;

    case 'hsl':
    case 'hwb':
      return `${mode}(${fastRound(v1, precision)}deg ${fastRound(v2 * 100, precision)}% ${fastRound(v3 * 100, precision)}%${a})`;

    case 'lab':
      return `lab(${fastRound(v1, precision)}% ${fastRound(v2, precision)} ${fastRound(v3, precision)}${a})`;

    case 'lch':
      return `lch(${fastRound(v1, precision)}% ${fastRound(v2, precision)} ${fastRound(v3, precision)}deg${a})`;

    case 'oklab':
      return `oklab(${fastRound(v1 * 100, precision)}% ${fastRound(v2, 4)} ${fastRound(v3, 4)}${a})`;

    case 'oklch':
      return `oklch(${fastRound(v1 * 100, precision)}% ${fastRound(v2, 4)} ${fastRound(v3, precision)}deg${a})`;

    default:
      throw new Error(`Unsupported CSS format mode: ${mode}`);
  }
}
