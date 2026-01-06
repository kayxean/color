import type { ColorMode, ColorSpace } from './types';
import { convertColor } from './convert';
import { createScales } from './interpolate';
import { checkContrast, getLuminanceD65 } from './luminance';

export const matchContrast = <T extends ColorMode>(
  color: ColorSpace<T>,
  background: ColorSpace<T>,
  mode: T,
  targetContrast: number,
): ColorSpace<T> => {
  const currentContrast = checkContrast(color, background, mode);

  if (Math.abs(currentContrast) >= targetContrast) return color;

  const needsReversion = mode !== 'oklch';
  const polarValues = (
    needsReversion ? convertColor(color, mode, 'oklch' as Exclude<ColorMode, T>) : color
  ) as ColorSpace<'oklch'>;

  const lightness = polarValues[0];
  const chroma = polarValues[1];
  const hue = polarValues[2];

  const luminance = getLuminanceD65(background, mode);
  const isDark = luminance < 0.5;

  let low = isDark ? lightness : 0;
  let high = isDark ? 1 : lightness;
  let bestL = lightness;

  for (let i = 0; i < 10; i++) {
    const t = (low + high) / 2;
    const rotated = [t, chroma, hue] as ColorSpace<'oklch'>;

    const res = (
      needsReversion ? convertColor(rotated, 'oklch', mode as Exclude<ColorMode, 'oklch'>) : rotated
    ) as ColorSpace<T>;

    const testContrast = checkContrast(res, background, mode);

    if (Math.abs(testContrast) < targetContrast) {
      if (isDark) low = t;
      else high = t;
    } else {
      bestL = t;
      if (isDark) high = t;
      else low = t;
    }
  }

  const rotated = [bestL, chroma, hue] as ColorSpace<'oklch'>;

  if (needsReversion) {
    return convertColor(rotated, 'oklch', mode as Exclude<ColorMode, 'oklch'>) as ColorSpace<T>;
  }

  return rotated as unknown as ColorSpace<T>;
};

export const matchContrastScale = <T extends ColorMode>(
  stops: ColorSpace<T>[],
  background: ColorSpace<T>,
  mode: T,
  targetContrast: number,
  steps: number,
): ColorSpace<T>[] => {
  const scale = createScales(stops, mode, steps);
  const interpolate: ColorSpace<T>[] = [];

  for (let i = 0; i < scale.length; i++) {
    interpolate.push(matchContrast(scale[i], background, mode, targetContrast));
  }

  return interpolate;
};
