import type { ColorMode, ColorSpace } from '../core/types';

type Bounds3 = [
  [min: number, max: number],
  [min: number, max: number],
  [min: number, max: number],
];

const CLAMP_MAP: { [T in ColorMode]: Bounds3 } = {
  rgb: [
    [0, 1],
    [0, 1],
    [0, 1],
  ],
  hsl: [
    [0, 360],
    [0, 1],
    [0, 1],
  ],
  hwb: [
    [0, 360],
    [0, 1],
    [0, 1],
  ],
  lab: [
    [0, 100],
    [-128, 128],
    [-128, 128],
  ],
  lch: [
    [0, 100],
    [0, 150],
    [0, 360],
  ],
  oklab: [
    [0, 1],
    [-0.4, 0.4],
    [-0.4, 0.4],
  ],
  oklch: [
    [0, 1],
    [0, 0.4],
    [0, 360],
  ],
};

export const clampColor = <T extends ColorMode>(
  color: ColorSpace<T>,
  mode: T,
): ColorSpace<T> => {
  const bounds = CLAMP_MAP[mode];

  return color.map((val, i) => {
    const [min, max] = bounds[i];

    if (max === 360) {
      return ((val % 360) + 360) % 360;
    }

    return Math.max(min, Math.min(max, val));
  }) as ColorSpace<T>;
};

export const checkGamut = <T extends ColorMode>(
  color: ColorSpace<T>,
  mode: T,
  tolerance = 0,
): boolean => {
  const bounds = CLAMP_MAP[mode];

  for (let i = 0; i < 3; i++) {
    const val = color[i];
    const [min, max] = bounds[i];

    if (max === 360) continue;

    if (val < min - tolerance || val > max + tolerance) {
      return false;
    }
  }

  return true;
};
