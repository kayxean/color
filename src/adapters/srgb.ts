import type { ColorFn, ColorSpace } from '../types';

export const rgbToHsv: ColorFn<'rgb', 'hsv'> = (input) => {
  const R = input[0];
  const G = input[1];
  const B = input[2];

  const V = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const C = V - min;

  const S = V === 0 ? 0 : C / V;

  let H: number;
  if (C === 0) {
    H = 0;
  } else if (V === R) {
    H = (G - B) / C;
  } else if (V === G) {
    H = (B - R) / C + 2;
  } else {
    H = (R - G) / C + 4;
  }

  H *= 60;
  if (H < 0) {
    H += 360;
  }

  return [H, S, V] as ColorSpace<'hsv'>;
};

export const hsvToRgb: ColorFn<'hsv', 'rgb'> = (input) => {
  const H = input[0] / 60;
  const S = input[1];
  const V = input[2];

  if (S === 0) {
    return [V, V, V] as ColorSpace<'rgb'>;
  }

  const C = V * S;
  const X = C * (1 - Math.abs((H % 2) - 1));
  const m = V - C;

  let c: number, t: number, x: number;

  const f = Math.floor(H);

  if (f === 0 || f === 6) {
    [c, t, x] = [C, X, 0];
  } else if (f === 1) {
    [c, t, x] = [X, C, 0];
  } else if (f === 2) {
    [c, t, x] = [0, C, X];
  } else if (f === 3) {
    [c, t, x] = [0, X, C];
  } else if (f === 4) {
    [c, t, x] = [X, 0, C];
  } else {
    [c, t, x] = [C, 0, X];
  }

  const R = c + m;
  const G = t + m;
  const B = x + m;

  return [R, G, B] as ColorSpace<'rgb'>;
};

export const hsvToHsl: ColorFn<'hsv', 'hsl'> = (input) => {
  const H = input[0];
  const s = input[1];
  const v = input[2];

  const L = v * (1 - s / 2);

  let S: number;
  if (L === 0 || L === 1) {
    S = 0;
  } else {
    S = (v - L) / Math.min(L, 1 - L);
  }

  return [H, S, L] as ColorSpace<'hsl'>;
};

export const hslToHsv: ColorFn<'hsl', 'hsv'> = (input) => {
  const H = input[0];
  const s = input[1];
  const l = input[2];

  const V = l + s * Math.min(l, 1 - l);

  let S: number;
  if (V === 0) {
    S = 0;
  } else {
    S = 2 * (1 - l / V);
  }

  return [H, S, V] as ColorSpace<'hsv'>;
};

export const hsvToHwb: ColorFn<'hsv', 'hwb'> = (input) => {
  const H = input[0];
  const S = input[1];
  const V = input[2];

  const W = V * (1 - S);

  const B = 1 - V;

  return [H, W, B] as ColorSpace<'hwb'>;
};

export const hwbToHsv: ColorFn<'hwb', 'hsv'> = (input) => {
  const H = input[0];
  const W = input[1];
  const B = input[2];

  const sum = W + B;
  if (sum >= 1) {
    const V = 1 - B;
    return [H, 0, V] as ColorSpace<'hsv'>;
  }

  const V = 1 - B;

  const S = V === 0 ? 0 : (V - W) / V;

  return [H, S, V] as ColorSpace<'hsv'>;
};

export const rgbToHex = (input: ColorSpace<'rgb'>, denote = false): string => {
  const r = Math.round(input[0] * 255);
  const g = Math.round(input[1] * 255);
  const b = Math.round(input[2] * 255);

  const hex = ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);

  return denote ? hex : `#${hex}`;
};

export const hexToRgb = (input: string): ColorSpace<'rgb'> => {
  let clean = input.startsWith('#') ? input.slice(1) : input;

  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }

  const num = Number.parseInt(clean, 16);

  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  return [r, g, b] as ColorSpace<'rgb'>;
};
