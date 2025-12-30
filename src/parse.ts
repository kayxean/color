import type { ColorMode, ColorSpace, ColorValues } from './types';

export const parseColor = (css: string): { mode: ColorMode; values: ColorValues } => {
  const trimmed = css.trim();
  const len = trimmed.length;

  if (trimmed[0] === '#' || len === 3 || len === 6) {
    const start = trimmed[0] === '#' ? 1 : 0;
    const hex = trimmed;
    const hexLen = len - start;

    if (hexLen === 3 || hexLen === 6) {
      let r: number, g: number, b: number;
      if (hexLen === 3) {
        const r1 = hex[start];
        const g1 = hex[start + 1];
        const b1 = hex[start + 2];
        r = parseInt(r1 + r1, 16);
        g = parseInt(g1 + g1, 16);
        b = parseInt(b1 + b1, 16);
      } else {
        r = parseInt(hex.substring(start, start + 2), 16);
        g = parseInt(hex.substring(start + 2, start + 4), 16);
        b = parseInt(hex.substring(start + 4, start + 6), 16);
      }
      return { mode: 'rgb', values: [r / 255, g / 255, b / 255] as ColorValues };
    }
  }

  const openParen = trimmed.indexOf('(');
  const closeParen = trimmed.lastIndexOf(')');

  if (openParen !== -1 && closeParen !== -1) {
    const mode = trimmed.slice(0, openParen).toLowerCase() as ColorMode;
    const valuesStr = trimmed.slice(openParen + 1, closeParen);

    const parts = valuesStr.split(/[\s,]+/);
    const v0 = parseFloat(parts[0]);
    const v1 = parseFloat(parts[1]);
    const v2 = parseFloat(parts[2]);

    if (Number.isNaN(v0) || Number.isNaN(v1) || Number.isNaN(v2)) {
      throw new Error(`Invalid color values: ${css}`);
    }

    switch (mode) {
      case 'rgb':
        return { mode, values: [v0 / 255, v1 / 255, v2 / 255] as ColorValues };
      case 'hsl':
      case 'hwb':
        return { mode, values: [v0, v1 / 100, v2 / 100] as ColorValues };
      case 'lab':
      case 'lch':
        return { mode, values: [v0, v1, v2] as ColorValues };
      case 'oklab':
      case 'oklch':
        return { mode, values: [v0 / 100, v1, v2] as ColorValues };
      default:
        throw new Error(`Unsupported mode: ${mode}`);
    }
  }

  throw new Error(`Invalid CSS color: ${css}`);
};

const format = (num: number, precision = 2): string => {
  if (num % 1 === 0) return num.toString();

  const factor = precision === 4 ? 10000 : 100;

  return (Math.round(num * factor) / factor).toString();
};

export const parseCss = (mode: ColorMode, values: ColorSpace<ColorMode>, percent?: boolean, angle?: boolean): string => {
  const v1 = values[0];
  const v2 = values[1];
  const v3 = values[2];

  if (mode === 'rgb') {
    return `rgb(${Math.round(v1 * 255)} ${Math.round(v2 * 255)} ${Math.round(v3 * 255)})`;
  }

  let c1: string;
  let c2: string;
  let c3: string;

  if (mode === 'hsl' || mode === 'hwb') {
    c1 = angle ? `${format(v1)}deg` : format(v1);
    c2 = percent ? `${format(v2 * 100)}%` : format(v2 * 100);
    c3 = percent ? `${format(v3 * 100)}%` : format(v3 * 100);
  } else if (mode === 'lab' || mode === 'lch') {
    c1 = percent ? `${format(v1)}%` : format(v1);
    c2 = format(v2);
    c3 = mode === 'lch' && angle ? `${format(v3)}deg` : format(v3);
  } else if (mode === 'oklab' || mode === 'oklch') {
    c1 = percent ? `${format(v1 * 100)}%` : format(v1 * 100);
    c2 = format(v2, 4);
    c3 = mode === 'oklch' && angle ? `${format(v3)}deg` : format(v3, 4);
  } else {
    throw new Error(`Unsupported mode: ${mode}`);
  }

  return `${mode}(${c1} ${c2} ${c3})`;
};
