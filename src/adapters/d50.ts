import type { ColorBuffer } from '../types';
import { createBuffer } from '../utils';

const EPSILON = 0.008856;
const KAPPA = 903.3;

const WHITE_D50 = createBuffer([0.96422, 1.0, 0.82521]);

const INV_WHITE_D50 = createBuffer([
  1 / WHITE_D50[0],
  1 / WHITE_D50[1],
  1 / WHITE_D50[2],
]);

function lab_f(t: number): number {
  return t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116;
}

function lab_inv_f(f: number): number {
  const f3 = f * f * f;
  return f3 > EPSILON ? f3 : (116 * f - 16) / KAPPA;
}

export function xyz50ToLab(input: ColorBuffer, output: ColorBuffer): void {
  const xr = input[0] * INV_WHITE_D50[0];
  const yr = input[1] * INV_WHITE_D50[1];
  const zr = input[2] * INV_WHITE_D50[2];

  const fx = lab_f(xr);
  const fy = lab_f(yr);
  const fz = lab_f(zr);

  output[0] = 116 * fy - 16;
  output[1] = 500 * (fx - fy);
  output[2] = 200 * (fy - fz);
}

export function labToXyz50(input: ColorBuffer, output: ColorBuffer): void {
  const fy = (input[0] + 16) / 116;
  const fx = input[1] / 500 + fy;
  const fz = fy - input[2] / 200;

  output[0] = lab_inv_f(fx) * WHITE_D50[0];
  output[1] = lab_inv_f(fy) * WHITE_D50[1];
  output[2] = lab_inv_f(fz) * WHITE_D50[2];
}
