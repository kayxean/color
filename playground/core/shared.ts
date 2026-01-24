import type { ColorBuffer, ColorMatrix, ColorMode, ColorState } from './types';
import { convertColor } from './convert';

export function createBuffer(data: [number, number, number] | 3): ColorBuffer {
  const buf =
    typeof data === 'number' ? new Float32Array(data) : new Float32Array(data);
  if (buf.length !== 3) throw new Error('Buffer must be length 3');
  return buf as ColorBuffer;
}

export function createMatrix(
  r1: [number, number, number],
  r2: [number, number, number],
  r3: [number, number, number],
): ColorMatrix {
  return [createBuffer(r1), createBuffer(r2), createBuffer(r3)] as const;
}

export function createColor(
  values: [number, number, number] | ColorBuffer,
  mode: ColorMode,
): ColorState {
  return {
    values: values instanceof Float32Array ? values : createBuffer(values),
    mode,
  };
}

export function mutateColor<T extends ColorMode>(
  state: ColorState,
  to: T,
): void {
  if (state.mode === (to as ColorMode)) return;

  convertColor(state.values, state.values, state.mode, to);
  state.mode = to;
}

export function deriveColor<T extends ColorMode>(
  state: ColorState,
  to: T,
): ColorState {
  if (state.mode === (to as ColorMode)) {
    return { ...state, values: new Float32Array(state.values) as ColorBuffer };
  }

  const newValues = createBuffer(3);
  convertColor(state.values, newValues, state.mode, to);

  return {
    values: newValues,
    mode: to,
  };
}
