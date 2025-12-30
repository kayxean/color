import type { ColorFn, ColorSpace } from '../types';

export const rgbToLrgb: ColorFn<'rgb', 'lrgb'> = (input) => {
  return input.map((c) => {
    if (c <= 0.04045) {
      return c / 12.92;
    } else {
      return ((c + 0.055) / 1.055) ** 2.4;
    }
  }) as ColorSpace<'lrgb'>;
};

export const lrgbToRgb: ColorFn<'lrgb', 'rgb'> = (input) => {
  return input.map((l) => {
    const c = Math.max(0, l);

    if (c <= 0.0031308) {
      return c * 12.92;
    } else {
      return 1.055 * c ** (1 / 2.4) - 0.055;
    }
  }) as ColorSpace<'rgb'>;
};
