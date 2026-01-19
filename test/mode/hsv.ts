import type { ColorFn, ColorSpace } from "../types";

const rgbToHsv: ColorFn<"rgb", "hsv"> = (input) => {
  const r = input[0];
  const g = input[1];
  const b = input[2];

  const v = Math.max(r, g, b);
  const m = Math.min(r, g, b);
  const d = v - m;

  let h: number;

  if (d === 0) {
    h = 0;
  } else if (v === r) {
    h = ((g - b) / d) % 6;
  } else if (v === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }

  h *= 60;
  if (h < 0) {
    h += 360;
  }

  const s = v === 0 ? 0 : d / v;

  return [h, s, v] as ColorSpace<"hsv">;
};

const hsvToRgb: ColorFn<"hsv", "rgb"> = (input) => {
  const h = input[0];
  const s = input[1];
  const v = input[2];

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = v;
  } else {
    const u = v * s;
    const i = u * (1 - Math.abs(((h / 60) % 2) - 1));
    const o = v - u;

    let c: number;
    let t: number;
    let x: number;

    if (h < 60) {
      c = u;
      t = i;
      x = 0;
    } else if (h < 120) {
      c = i;
      t = u;
      x = 0;
    } else if (h < 180) {
      c = 0;
      t = u;
      x = i;
    } else if (h < 240) {
      c = 0;
      t = i;
      x = u;
    } else if (h < 300) {
      c = i;
      t = 0;
      x = u;
    } else {
      c = u;
      t = 0;
      x = i;
    }

    r = c + o;
    g = t + o;
    b = x + o;
  }

  return [r, g, b] as ColorSpace<"rgb">;
};

export { rgbToHsv, hsvToRgb };
