import type { ColorBuffer } from '../core/types';

export function rgbToLrgb(input: ColorBuffer, output: ColorBuffer): void {
  for (let i = 0; i < 3; i++) {
    const c = input[i];
    if (c <= 0.04045) {
      output[i] = c / 12.92;
    } else {
      output[i] = ((c + 0.055) / 1.055) ** 2.4;
    }
  }
}

export function lrgbToRgb(input: ColorBuffer, output: ColorBuffer): void {
  for (let i = 0; i < 3; i++) {
    const l = input[i];
    const c = l < 0 ? 0 : l;

    if (c <= 0.0031308) {
      output[i] = c * 12.92;
    } else {
      output[i] = 1.055 * c ** (1 / 2.4) - 0.055;
    }
  }
}
