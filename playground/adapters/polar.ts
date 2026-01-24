import type { ColorBuffer } from '../core/types';

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

export function lchToLab(input: ColorBuffer, output: ColorBuffer): void {
  const L = input[0];
  const C = input[1];
  const H = input[2];

  const rad = H * DEG_TO_RAD;

  output[0] = L;
  output[1] = C * Math.cos(rad);
  output[2] = C * Math.sin(rad);
}

export function labToLch(input: ColorBuffer, output: ColorBuffer): void {
  const L = input[0];
  const a = input[1];
  const b = input[2];

  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * RAD_TO_DEG;

  if (H < 0) H += 360;

  output[0] = L;
  output[1] = C;
  output[2] = H;
}

export function oklchToOklab(input: ColorBuffer, output: ColorBuffer): void {
  const L = input[0];
  const C = input[1];
  const H = input[2];

  const rad = H * DEG_TO_RAD;

  output[0] = L;
  output[1] = C * Math.cos(rad);
  output[2] = C * Math.sin(rad);
}

export function oklabToOklch(input: ColorBuffer, output: ColorBuffer): void {
  const L = input[0];
  const a = input[1];
  const b = input[2];

  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * RAD_TO_DEG;

  if (H < 0) H += 360;

  output[0] = L;
  output[1] = C;
  output[2] = H;
}
