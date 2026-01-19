import type { ColorFn, ColorSpace } from "../types";

const hsvToHsl: ColorFn<"hsv", "hsl"> = (input) => {
  const h = input[0];
  const s = input[1];
  const v = input[2];

  const l = v * (1 - s * 0.5);
  const sl = l > 0 && l < 1 ? (v - l) / Math.min(l, 1 - l) : 0;

  return [h, sl, l] as ColorSpace<"hsl">;
};

const hslToHsv: ColorFn<"hsl", "hsv"> = (input) => {
  const h = input[0];
  const s = input[1];
  const l = input[2];

  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);

  return [h, sv, v] as ColorSpace<"hsv">;
};

export { hsvToHsl, hslToHsv };
