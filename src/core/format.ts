import type { ColorMode, ColorSpace } from './types';

const format = (num: number, precision = 2): string => {
  if (num % 1 === 0) return num.toString();
  const factor = precision === 4 ? 10000 : 100;
  return (Math.round(num * factor) / factor).toString();
};

export const formatCss = (
  mode: ColorMode,
  values: ColorSpace<ColorMode>,
  alpha?: number,
): string => {
  const [v1, v2, v3] = values;

  const a = alpha !== undefined && alpha < 1 ? ` / ${format(alpha)}` : '';

  if (mode === 'rgb') {
    return `rgb(${Math.round(v1 * 255)} ${Math.round(v2 * 255)} ${Math.round(v3 * 255)}${a})`;
  }

  let c1: string;
  let c2: string;
  let c3: string;

  if (mode === 'hsl' || mode === 'hwb') {
    c1 = `${format(v1)}deg`;
    c2 = `${format(v2 * 100)}%`;
    c3 = `${format(v3 * 100)}%`;
  } else if (mode === 'lab' || mode === 'lch') {
    c1 = `${format(v1)}%`;
    c2 = format(v2);
    c3 = mode === 'lch' ? `${format(v3)}deg` : format(v3);
  } else if (mode === 'oklab' || mode === 'oklch') {
    c1 = `${format(v1 * 100)}%`;
    c2 = format(v2, 4);
    c3 = mode === 'oklch' ? `${format(v3)}deg` : format(v3, 4);
  } else {
    throw new Error(`Unsupported mode: ${mode}`);
  }

  return `${mode}(${c1} ${c2} ${c3}${a})`;
};
