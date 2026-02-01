import type { Color } from './types';

const F_FACTORS = [1, 10, 100, 1000, 10000, 100000];

function normalize(num: number, precision: number): number {
  const f = F_FACTORS[precision] ?? 10 ** precision;
  return Math.round(num * f) / f;
}

export function formatCss(
  color: Color,
  alpha?: number,
  asHex?: boolean,
  precision = 2,
): string {
  const { space, value } = color;
  const v1 = value[0];
  const v2 = value[1];
  const v3 = value[2];

  const isTransparent = typeof alpha === 'number' && alpha < 1;

  if (space === 'rgb' && asHex) {
    const r = (v1 * 255 + 0.5) | 0;
    const g = (v2 * 255 + 0.5) | 0;
    const b = (v3 * 255 + 0.5) | 0;

    const hex = ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);

    if (isTransparent) {
      const a = (alpha * 255 + 0.5) | 0;
      return `#${hex}${((1 << 8) | a).toString(16).slice(1)}`;
    }

    return `#${hex}`;
  }

  const a = isTransparent ? ` / ${normalize(alpha * 100, precision)}%` : '';

  switch (space) {
    case 'rgb':
      return `rgb(${(v1 * 255 + 0.5) | 0} ${(v2 * 255 + 0.5) | 0} ${(v3 * 255 + 0.5) | 0}${a})`;

    case 'hsl':
    case 'hwb':
      return `${space}(${normalize(v1, precision)}deg ${normalize(v2 * 100, precision)}% ${normalize(v3 * 100, precision)}%${a})`;

    case 'lab':
      return `lab(${normalize(v1, precision)}% ${normalize(v2, precision)} ${normalize(v3, precision)}${a})`;

    case 'lch':
      return `lch(${normalize(v1, precision)}% ${normalize(v2, precision)} ${normalize(v3, precision)}deg${a})`;

    case 'oklab':
      return `oklab(${normalize(v1 * 100, precision)}% ${normalize(v2, 4)} ${normalize(v3, 4)}${a})`;

    case 'oklch':
      return `oklch(${normalize(v1 * 100, precision)}% ${normalize(v2, 4)} ${normalize(v3, precision)}deg${a})`;

    default:
      throw new Error(`Unsupported CSS format mode: ${space}`);
  }
}
