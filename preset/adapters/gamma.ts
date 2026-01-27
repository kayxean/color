import type { ColorBuffer } from '../types';

const GAMMA_EXP = 2.4;
const GAMMA_COMP = 1 / 2.4;

export function rgbToLrgb(input: ColorBuffer, output: ColorBuffer): void {
  const r = input[0];
  output[0] = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** GAMMA_EXP;

  const g = input[1];
  output[1] = g <= 0.04045 ? g / 12.92 : ((g + 0.055) / 1.055) ** GAMMA_EXP;

  const b = input[2];
  output[2] = b <= 0.04045 ? b / 12.92 : ((b + 0.055) / 1.055) ** GAMMA_EXP;
}

export function lrgbToRgb(input: ColorBuffer, output: ColorBuffer): void {
  const lR = input[0];
  const cR = lR < 0 ? 0 : lR;
  output[0] = cR <= 0.0031308 ? cR * 12.92 : 1.055 * cR ** GAMMA_COMP - 0.055;

  const lG = input[1];
  const cG = lG < 0 ? 0 : lG;
  output[1] = cG <= 0.0031308 ? cG * 12.92 : 1.055 * cG ** GAMMA_COMP - 0.055;

  const lB = input[2];
  const cB = lB < 0 ? 0 : lB;
  output[2] = cB <= 0.0031308 ? cB * 12.92 : 1.055 * cB ** GAMMA_COMP - 0.055;
}
