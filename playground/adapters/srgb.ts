import type { ColorBuffer } from '../core/types';

export function rgbToHsv(input: ColorBuffer, output: ColorBuffer): void {
  const r = input[0];
  const g = input[1];
  const b = input[2];

  const v = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const c = v - min;

  const s = v === 0 ? 0 : c / v;

  let h = 0;
  if (c !== 0) {
    if (v === r) h = (g - b) / c;
    else if (v === g) h = (b - r) / c + 2;
    else h = (r - g) / c + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  output[0] = h;
  output[1] = s;
  output[2] = v;
}

export function hsvToRgb(input: ColorBuffer, output: ColorBuffer): void {
  const h = input[0] / 60;
  const s = input[1];
  const v = input[2];

  if (s === 0) {
    output[0] = v;
    output[1] = v;
    output[2] = v;
    return;
  }

  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;
  const f = Math.floor(h);

  let r = 0,
    g = 0,
    b = 0;

  if (f === 0 || f === 6) {
    r = c;
    g = x;
    b = 0;
  } else if (f === 1) {
    r = x;
    g = c;
    b = 0;
  } else if (f === 2) {
    r = 0;
    g = c;
    b = x;
  } else if (f === 3) {
    r = 0;
    g = x;
    b = c;
  } else if (f === 4) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  output[0] = r + m;
  output[1] = g + m;
  output[2] = b + m;
}

export function hsvToHsl(input: ColorBuffer, output: ColorBuffer): void {
  const h = input[0];
  const s = input[1];
  const v = input[2];

  const l = v * (1 - s / 2);
  let sL = 0;
  if (l > 0 && l < 1) {
    sL = (v - l) / Math.min(l, 1 - l);
  }

  output[0] = h;
  output[1] = sL;
  output[2] = l;
}

export function hslToHsv(input: ColorBuffer, output: ColorBuffer): void {
  const h = input[0];
  const s = input[1];
  const l = input[2];

  const v = l + s * Math.min(l, 1 - l);
  const sV = v === 0 ? 0 : 2 * (1 - l / v);

  output[0] = h;
  output[1] = sV;
  output[2] = v;
}

export function hsvToHwb(input: ColorBuffer, output: ColorBuffer): void {
  const h = input[0];
  const s = input[1];
  const v = input[2];

  output[0] = h;
  output[1] = v * (1 - s);
  output[2] = 1 - v;
}

export function hwbToHsv(input: ColorBuffer, output: ColorBuffer): void {
  const h = input[0];
  const w = input[1];
  const b = input[2];

  const v = 1 - b;
  const s = v === 0 ? 0 : (v - w) / v;

  output[0] = h;
  output[1] = s < 0 ? 0 : s;
  output[2] = v;
}

export function rgbToHex(input: ColorBuffer, denote = false): string {
  const r = Math.round(input[0] * 255);
  const g = Math.round(input[1] * 255);
  const b = Math.round(input[2] * 255);
  const hex = ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  return denote ? `#${hex}` : hex;
}

export function hexToRgb(input: string, output: ColorBuffer): void {
  let clean = input.startsWith('#') ? input.slice(1) : input;
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  const num = parseInt(clean, 16);
  output[0] = ((num >> 16) & 255) / 255;
  output[1] = ((num >> 8) & 255) / 255;
  output[2] = (num & 255) / 255;
}
