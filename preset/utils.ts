import type {
  Color,
  ColorArray,
  ColorBuffer,
  ColorMatrix,
  ColorSpace,
} from './types';
import { convertColor } from './convert';

export function createBuffer(data: Float32Array | number[]): ColorBuffer {
  if (data.length !== 3) throw new Error('ColorArray must have length 3');
  return (
    data instanceof Float32Array ? data : new Float32Array(data)
  ) as ColorBuffer;
}

export function createMatrix(
  v1: [number, number, number],
  v2: [number, number, number],
  v3: [number, number, number],
): ColorMatrix {
  return [createBuffer(v1), createBuffer(v2), createBuffer(v3)];
}

export function createColor<S extends ColorSpace>(
  space: S,
  values: [number, number, number],
): Color {
  const buffer = createBuffer(values);
  const value = buffer as ColorArray<S>;
  return { space, value };
}

export function cloneColor(color: Color): Color {
  return {
    space: color.space,
    value: new Float32Array(color.value) as ColorArray<ColorSpace>,
  };
}

export function updateColor(
  color: Color,
  values: [number, number, number] | Float32Array,
): void {
  color.value.set(values);
}

export function mutateColor<T extends ColorSpace>(color: Color, to: T): void {
  const from = color.space;
  if (from === (to as ColorSpace)) return;

  convertColor(color.value, color.value, from, to);
  (color as { space: ColorSpace }).space = to;
}

export function deriveColor<T extends ColorSpace>(color: Color, to: T): Color {
  if (color.space === (to as ColorSpace)) {
    return cloneColor(color);
  }

  const newValues = new Float32Array(3) as ColorArray<T>;
  convertColor(color.value, newValues, color.space, to);

  return {
    space: to,
    value: newValues,
  };
}
