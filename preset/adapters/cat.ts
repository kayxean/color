import type { ColorBuffer, ColorMatrix } from '../types';
import { createBuffer, createMatrix } from '../utils';

export function multiplyMatrixVector(
  matrix: ColorMatrix,
  vector: ColorBuffer,
  output: ColorBuffer,
): void {
  const v0 = vector[0];
  const v1 = vector[1];
  const v2 = vector[2];

  const r0 = matrix[0];
  const r1 = matrix[1];
  const r2 = matrix[2];

  output[0] = r0[0] * v0 + r0[1] * v1 + r0[2] * v2;
  output[1] = r1[0] * v0 + r1[1] * v1 + r1[2] * v2;
  output[2] = r2[0] * v0 + r2[1] * v1 + r2[2] * v2;
}

const M_BRADFORD = createMatrix(
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
);

const M_BRADFORD_INV = createMatrix(
  [0.98699, -0.14705, 0.15996],
  [0.43231, 0.51836, 0.04929],
  [-0.00853, 0.04006, 0.96848],
);

const WHITE_D65 = createBuffer([0.95047, 1.0, 1.08883]);
const WHITE_D50 = createBuffer([0.96422, 1.0, 0.82521]);

const lmsD65 = createBuffer(new Float32Array(3));
const lmsD50 = createBuffer(new Float32Array(3));

multiplyMatrixVector(M_BRADFORD, WHITE_D65, lmsD65);
multiplyMatrixVector(M_BRADFORD, WHITE_D50, lmsD50);

const SCALE_D65_TO_D50 = createBuffer([
  lmsD50[0] / lmsD65[0],
  lmsD50[1] / lmsD65[1],
  lmsD50[2] / lmsD65[2],
]);

const SCALE_D50_TO_D65 = createBuffer([
  lmsD65[0] / lmsD50[0],
  lmsD65[1] / lmsD50[1],
  lmsD65[2] / lmsD50[2],
]);

const lmsScratch = createBuffer(new Float32Array(3));

export function xyz65ToXyz50(input: ColorBuffer, output: ColorBuffer): void {
  multiplyMatrixVector(M_BRADFORD, input, lmsScratch);

  lmsScratch[0] *= SCALE_D65_TO_D50[0];
  lmsScratch[1] *= SCALE_D65_TO_D50[1];
  lmsScratch[2] *= SCALE_D65_TO_D50[2];

  multiplyMatrixVector(M_BRADFORD_INV, lmsScratch, output);
}

export function xyz50ToXyz65(input: ColorBuffer, output: ColorBuffer): void {
  multiplyMatrixVector(M_BRADFORD, input, lmsScratch);

  lmsScratch[0] *= SCALE_D50_TO_D65[0];
  lmsScratch[1] *= SCALE_D50_TO_D65[1];
  lmsScratch[2] *= SCALE_D50_TO_D65[2];

  multiplyMatrixVector(M_BRADFORD_INV, lmsScratch, output);
}
