import type { Color, ColorArray, ColorSpace } from '../types';

const CLAMP_BOUNDS: Record<ColorSpace, Float32Array> = {
  rgb: new Float32Array([0, 1, 0, 1, 0, 1]),
  hsv: new Float32Array([0, 360, 0, 1, 0, 1]),
  hsl: new Float32Array([0, 360, 0, 1, 0, 1]),
  hwb: new Float32Array([0, 360, 0, 1, 0, 1]),
  lab: new Float32Array([0, 1, -128, 128, -128, 128]),
  lch: new Float32Array([0, 1, 0, 150, 0, 360]),
  oklab: new Float32Array([0, 1, -0.4, 0.4, -0.4, 0.4]),
  oklch: new Float32Array([0, 1, 0, 0.4, 0, 360]),
};

export function clampColor(color: Color, mutate = true): Color {
  const { value, space } = color;
  const bounds = CLAMP_BOUNDS[space];

  const res = mutate
    ? value
    : (new Float32Array(value) as ColorArray<typeof space>);

  for (let i = 0; i < 3; i++) {
    const min = bounds[i * 2];
    const max = bounds[i * 2 + 1];
    let val = value[i];

    if (max === 360) {
      val = ((val % 360) + 360) % 360;
    } else {
      if (val < min) val = min;
      else if (val > max) val = max;
    }

    res[i] = val;
  }

  if (mutate) return color;

  return {
    space,
    value: res as ColorArray<typeof space>,
  };
}

export function checkGamut(color: Color, tolerance = 0): boolean {
  const { value, space } = color;
  const bounds = CLAMP_BOUNDS[space];

  for (let i = 0; i < 3; i++) {
    const max = bounds[i * 2 + 1];
    if (max === 360) continue;

    const val = value[i];
    const min = bounds[i * 2];

    if (val < min - tolerance || val > max + tolerance) {
      return false;
    }
  }

  return true;
}
