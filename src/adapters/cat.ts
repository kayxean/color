import type { ColorFn, ColorMatrix, ColorSpace, ColorValues } from '../types';

export const multiplyMatrixVector = (matrix: ColorMatrix, vector: ColorValues): ColorValues => {
  const result: ColorValues = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    result[i] = matrix[i][0] * vector[0] + matrix[i][1] * vector[1] + matrix[i][2] * vector[2];
  }

  return result;
};

const M_BRADFORD: ColorMatrix = [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
];

const M_BRADFORD_INV: ColorMatrix = [
  [0.98699, -0.14705, 0.15996],
  [0.43231, 0.51836, 0.04929],
  [-0.00853, 0.04006, 0.96848],
];

const WHITE_D65: ColorValues = [0.95047, 1.0, 1.08883];
const WHITE_D50: ColorValues = [0.96422, 1.0, 0.82521];

const LMS_D65 = multiplyMatrixVector(M_BRADFORD, WHITE_D65);
const LMS_D50 = multiplyMatrixVector(M_BRADFORD, WHITE_D50);

const SCALE_D65_TO_D50: ColorValues = [LMS_D50[0] / LMS_D65[0], LMS_D50[1] / LMS_D65[1], LMS_D50[2] / LMS_D65[2]];
const SCALE_D50_TO_D65: ColorValues = [LMS_D65[0] / LMS_D50[0], LMS_D65[1] / LMS_D50[1], LMS_D65[2] / LMS_D50[2]];

export const xyz65ToXyz50: ColorFn<'xyz65', 'xyz50'> = (input) => {
  const lms65 = multiplyMatrixVector(M_BRADFORD, input);

  const lms50_0 = lms65[0] * SCALE_D65_TO_D50[0];
  const lms50_1 = lms65[1] * SCALE_D65_TO_D50[1];
  const lms50_2 = lms65[2] * SCALE_D65_TO_D50[2];

  return multiplyMatrixVector(M_BRADFORD_INV, [lms50_0, lms50_1, lms50_2]) as ColorSpace<'xyz50'>;
};

export const xyz50ToXyz65: ColorFn<'xyz50', 'xyz65'> = (input) => {
  const lms50 = multiplyMatrixVector(M_BRADFORD, input);

  const lms65_0 = lms50[0] * SCALE_D50_TO_D65[0];
  const lms65_1 = lms50[1] * SCALE_D50_TO_D65[1];
  const lms65_2 = lms50[2] * SCALE_D50_TO_D65[2];

  return multiplyMatrixVector(M_BRADFORD_INV, [lms65_0, lms65_1, lms65_2]) as ColorSpace<'xyz65'>;
};
