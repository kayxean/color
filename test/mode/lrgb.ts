import type { ColorFn, ColorSpace } from "../types";

const linearize = (c: number): number => {
  const abs = Math.abs(c);
  return abs < 0.04045 ? c / 12.92 : (Math.sign(c) || 1) * ((abs + 0.055) / 1.055) ** 2.4;
};

const delinearize = (c: number): number => {
  const abs = Math.abs(c);
  return abs > 0.0031308 ? (Math.sign(c) || 1) * (1.055 * abs ** (1 / 2.4) - 0.055) : c * 12.92;
};

const rgbToLrgb: ColorFn<"rgb", "lrgb"> = (input) => {
  const lr = linearize(input[0]);
  const lg = linearize(input[1]);
  const lb = linearize(input[2]);

  return [lr, lg, lb] as ColorSpace<"lrgb">;
};

const lrgbToRgb: ColorFn<"lrgb", "rgb"> = (input) => {
  const r = delinearize(input[0]);
  const g = delinearize(input[1]);
  const b = delinearize(input[2]);

  return [r, g, b] as ColorSpace<"rgb">;
};

export { rgbToLrgb, lrgbToRgb };
