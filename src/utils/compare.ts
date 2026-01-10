import type { ColorMode, ColorSpace } from '../core/types';
import { convertColor } from '../core/convert';

export const isEqual = <T1 extends ColorMode, T2 extends ColorMode>(
  colorA: ColorSpace<T1>,
  modeA: T1,
  colorB: ColorSpace<T2>,
  modeB: T2,
  tolerance = 0,
): boolean => {
  const isSameMode = modeA === (modeB as unknown as T1);

  if (isSameMode) {
    for (let i = 0; i < 3; i++) {
      const diff = Math.abs(colorA[i] - colorB[i]);
      if (diff > tolerance) return false;
    }
    return true;
  }

  const convertedB = convertColor(colorB, modeB, modeA as Exclude<T1, T2>);

  for (let i = 0; i < 3; i++) {
    const diff = Math.abs(colorA[i] - convertedB[i]);
    if (diff > tolerance) return false;
  }

  return true;
};

export const getDistance = <T1 extends ColorMode, T2 extends ColorMode>(
  colorA: ColorSpace<T1>,
  modeA: T1,
  colorB: ColorSpace<T2>,
  modeB: T2,
): number => {
  const needsReversionA = modeA !== 'oklab';
  const needsReversionB = modeB !== 'oklab';

  const [l1, a1, b1] = (
    needsReversionA
      ? convertColor(colorA, modeA, 'oklab' as Exclude<ColorMode, T1>)
      : colorA
  ) as ColorSpace<'oklab'>;

  const [l2, a2, b2] = (
    needsReversionB
      ? convertColor(colorB, modeB, 'oklab' as Exclude<ColorMode, T2>)
      : colorB
  ) as ColorSpace<'oklab'>;

  const dL = l1 - l2;
  const dA = a1 - a2;
  const dB = b1 - b2;

  return Math.sqrt(dL * dL + dA * dA + dB * dB);
};
