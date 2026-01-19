import type { ColorFn, ColorSpace } from "../types";

const hsvToHwb: ColorFn<"hsv", "hwb"> = (input) => {
  const h = input[0];
  const s = input[1];
  const v = input[2];

  const w = (1 - s) * v;
  const b = 1 - v;

  return [h, w, b] as ColorSpace<"hwb">;
};

const hwbToHsv: ColorFn<"hwb", "hsv"> = (input) => {
  const h = input[0];
  const w = input[1];
  const b = input[2];

  const v = 1 - b;
  const s = v === 0 ? 0 : 1 - w / v;

  return [h, s, v] as ColorSpace<"hsv">;
};

export { hsvToHwb, hwbToHsv };
