import type { ColorFormat, ColorMode } from "./types";

const clamp = (value: number, min = 0, max = 1): number => {
  return Math.max(min, Math.min(max, value));
};

const round = (value: number, float = 0): number => {
  if (float === 0) {
    return Math.round(value);
  }
  const digit = 10 ** float;
  return Math.round(value * digit) / digit;
};

const nearest = <T extends ColorMode>(input: ColorFormat<T>, float = 0): ColorFormat<T> => {
  const mode = input[0];
  let c = input[1];
  let t = input[2];
  let x = input[3];

  const rgbGamut = 255;
  const hsvGamut = 100;

  if (mode === "rgb") {
    c = round(clamp(c) * rgbGamut, float);
    t = round(clamp(t) * rgbGamut, float);
    x = round(clamp(x) * rgbGamut, float);
  } else if (mode === "hsl" || mode === "hwb") {
    c = round(c, float);
    t = round(clamp(t) * hsvGamut, float);
    x = round(clamp(x) * hsvGamut, float);
  } else {
    c = round(c, float);
    t = round(t, float);
    x = round(x, float);
  }

  return [mode, c, t, x];
};

export { clamp, round, nearest };
