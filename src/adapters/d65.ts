import type { ColorFn, ColorMatrix, ColorSpace } from '../types';
import { multiplyMatrixVector } from './cat';

const M_SRGB: ColorMatrix = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];

const M_SRGB_INV: ColorMatrix = [
  [3.2404542, -1.5371385, -0.4985314],
  [-0.969266, 1.876, 0.041556],
  [0.0556434, -0.2040259, 1.0572252],
];

export const xyz65ToLrgb: ColorFn<'xyz65', 'lrgb'> = (input) => {
  return multiplyMatrixVector(M_SRGB_INV, input) as ColorSpace<'lrgb'>;
};

export const lrgbToXyz65: ColorFn<'lrgb', 'xyz65'> = (input) => {
  return multiplyMatrixVector(M_SRGB, input) as ColorSpace<'xyz65'>;
};

const M_OKLAB: ColorMatrix = [
  [0.8189330101, 0.3618667424, -0.1288597137],
  [0.0329845436, 0.9293118715, 0.0361456387],
  [0.0482003018, 0.2643662691, 0.633851707],
];

const M_OKLAB_INV: ColorMatrix = [
  [1.2270138511, -0.5577999807, 0.281256149],
  [-0.0405801784, 1.1122568696, -0.0716766787],
  [-0.0763812845, -0.4214819784, 1.5861632204],
];

export const xyz65ToOklab: ColorFn<'xyz65', 'oklab'> = (input) => {
  const lms65 = multiplyMatrixVector(M_OKLAB, input);

  const c = Math.cbrt(lms65[0]);
  const t = Math.cbrt(lms65[1]);
  const x = Math.cbrt(lms65[2]);

  const L = 0.2104542553 * c + 0.7936177046 * t - 0.0040704681 * x;
  const A = 1.9779984951 * c - 2.4285921822 * t + 0.4505936871 * x;
  const B = 0.0259040371 * c + 0.7827717662 * t - 0.808675766 * x;

  return [L, A, B] as ColorSpace<'oklab'>;
};

export const oklabToXyz65: ColorFn<'oklab', 'xyz65'> = (input) => {
  const L = input[0];
  const A = input[1];
  const B = input[2];

  const c = L + 0.3963377774 * A + 0.2158037573 * B;
  const t = L - 0.1055613458 * A - 0.0638541728 * B;
  const x = L - 0.0894841775 * A - 1.291485548 * B;

  const XYZ = multiplyMatrixVector(M_OKLAB_INV, [c * c * c, t * t * t, x * x * x]);

  return XYZ as ColorSpace<'xyz65'>;
};
