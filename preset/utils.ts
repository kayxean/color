import type {
  Color,
  ColorArray,
  ColorBuffer,
  ColorMatrix,
  ColorSpace,
} from './types';

function createBuffer(data: number[] | Float32Array): ColorBuffer {
  if (data.length !== 3) throw new Error('ColorBuffer must have length 3');
  return (
    data instanceof Float32Array ? data : new Float32Array(data)
  ) as ColorBuffer;
}

export function createMatrix(
  v1: [number, number, number],
  v2: [number, number, number],
  v3: [number, number, number],
): ColorMatrix {
  return [
    createBuffer(new Float32Array(v1)),
    createBuffer(new Float32Array(v2)),
    createBuffer(new Float32Array(v3)),
  ];
}

export function createColor<S extends ColorSpace>(
  space: S,
  values: [number, number, number],
): Color {
  const buffer = createBuffer(values);
  const value = buffer as ColorArray<S>;
  return { space, value };
}
