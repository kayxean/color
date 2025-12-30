import type { ColorFn, ColorSpace, ColorValues } from '../types';

const EPSILON = 0.008856;
const KAPPA = 903.3;

const WHITE_D50: ColorValues = [0.96422, 1.0, 0.82521];

const lab_f = (t: number): number => {
  return t > EPSILON ? Math.cbrt(t) : t / KAPPA + 4 / 29;
};

const lab_inv_f = (f: number): number => {
  const f_pow3 = f * f * f;
  return f > 6 / 29 ? f_pow3 : 3 * (6 / 29) * (6 / 29) * (f - 4 / 29);
};

export const xyz50ToLab: ColorFn<'xyz50', 'lab'> = (input) => {
  const xr = input[0] / WHITE_D50[0];
  const yr = input[1] / WHITE_D50[1];
  const zr = input[2] / WHITE_D50[2];

  const fx = lab_f(xr);
  const fy = lab_f(yr);
  const fz = lab_f(zr);

  const L = 116 * fy - 16;
  const A = 500 * (fx - fy);
  const B = 200 * (fy - fz);

  return [L, A, B] as ColorSpace<'lab'>;
};

export const labToXyz50: ColorFn<'lab', 'xyz50'> = (input) => {
  const fy = (input[0] + 16) / 116;
  const fx = input[1] / 500 + fy;
  const fz = fy - input[2] / 200;

  const xr = lab_inv_f(fx);
  const yr = lab_inv_f(fy);
  const zr = lab_inv_f(fz);

  const X = xr * WHITE_D50[0];
  const Y = yr * WHITE_D50[1];
  const Z = zr * WHITE_D50[2];

  return [X, Y, Z] as ColorSpace<'xyz50'>;
};
