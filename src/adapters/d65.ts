import type { ColorBuffer } from '../types';
import { createBuffer, createMatrix } from '../utils';
import { multiplyMatrixVector } from './cat';

const M_SRGB = createMatrix(
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
);

const M_SRGB_INV = createMatrix(
  [3.2404542, -1.5371385, -0.4985314],
  [-0.969266, 1.876, 0.041556],
  [0.0556434, -0.2040259, 1.0572252],
);

const M_OKLAB = createMatrix(
  [0.8189330101, 0.3618667424, -0.1288597137],
  [0.0329845436, 0.9293118715, 0.0361456387],
  [0.0482003018, 0.2643662691, 0.633851707],
);

const M_OKLAB_INV = createMatrix(
  [1.2270138511, -0.5577999807, 0.281256149],
  [-0.0405801784, 1.1122568696, -0.0716766787],
  [-0.0763812845, -0.4214819784, 1.5861632204],
);

const d65Scratch = createBuffer(new Float32Array(3));

export function xyz65ToLrgb(input: ColorBuffer, output: ColorBuffer): void {
  multiplyMatrixVector(M_SRGB_INV, input, output);
}

export function lrgbToXyz65(input: ColorBuffer, output: ColorBuffer): void {
  multiplyMatrixVector(M_SRGB, input, output);
}

export function xyz65ToOklab(input: ColorBuffer, output: ColorBuffer): void {
  multiplyMatrixVector(M_OKLAB, input, d65Scratch);

  const l = Math.cbrt(d65Scratch[0]);
  const m = Math.cbrt(d65Scratch[1]);
  const s = Math.cbrt(d65Scratch[2]);

  output[0] = 0.2104542553 * l + 0.7936177046 * m - 0.0040704681 * s;
  output[1] = 1.9779984951 * l - 2.4285921822 * m + 0.4505936871 * s;
  output[2] = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
}

export function oklabToXyz65(input: ColorBuffer, output: ColorBuffer): void {
  const L = input[0];
  const a = input[1];
  const b = input[2];

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  d65Scratch[0] = l_ * l_ * l_;
  d65Scratch[1] = m_ * m_ * m_;
  d65Scratch[2] = s_ * s_ * s_;

  multiplyMatrixVector(M_OKLAB_INV, d65Scratch, output);
}
