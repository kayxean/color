import type { ColorBuffer, ColorMode, ColorState } from '../core/types';
import { createColor } from '../core/shared';

const CLAMP_BOUNDS: Record<ColorMode, Float32Array> = {
  rgb: new Float32Array([0, 1, 0, 1, 0, 1]),
  hsv: new Float32Array([0, 360, 0, 1, 0, 1]),
  hsl: new Float32Array([0, 360, 0, 1, 0, 1]),
  hwb: new Float32Array([0, 360, 0, 1, 0, 1]),
  lab: new Float32Array([0, 100, -128, 128, -128, 128]),
  lch: new Float32Array([0, 100, 0, 150, 0, 360]),
  oklab: new Float32Array([0, 1, -0.4, 0.4, -0.4, 0.4]),
  oklch: new Float32Array([0, 1, 0, 0.4, 0, 360]),
};

export function clampColor(state: ColorState, mutate = true): ColorState {
  const { values, mode } = state;
  const bounds = CLAMP_BOUNDS[mode];
  const res = mutate ? values : new Float32Array(values);

  for (let i = 0; i < 3; i++) {
    const min = bounds[i * 2];
    const max = bounds[i * 2 + 1];
    let val = values[i];

    if (max === 360) {
      val = ((val % 360) + 360) % 360;
    } else {
      if (val < min) val = min;
      else if (val > max) val = max;
    }

    res[i] = val;
  }

  return mutate ? state : createColor(res as ColorBuffer, mode);
}

export function checkGamut(state: ColorState, tolerance = 0): boolean {
  const { values, mode } = state;
  const bounds = CLAMP_BOUNDS[mode];

  for (let i = 0; i < 3; i++) {
    const max = bounds[i * 2 + 1];
    if (max === 360) continue;

    const val = values[i];
    const min = bounds[i * 2];

    if (val < min - tolerance || val > max + tolerance) {
      return false;
    }
  }

  return true;
}
