import type { ColorHue, ColorMode, ColorSpace } from './types';
import { convertColor, convertHue } from './convert';

export const createHarmony = <T extends ColorMode>(
  input: ColorSpace<T>,
  mode: T,
  variants: { name: string; ratios: number[] }[],
): { name: string; colors: ColorSpace<T>[] }[] => {
  const polarValues = convertHue(input, mode);
  const polarMode = (mode === 'rgb' ? 'hsl' : mode === 'lab' ? 'lch' : mode === 'oklab' ? 'oklch' : mode) as ColorHue;

  const hueIndex = polarMode === 'hsl' || polarMode === 'hwb' ? 0 : 2;
  const baseHue = polarValues[hueIndex];
  const needsReversion = mode === 'rgb' || mode === 'lab' || mode === 'oklab';

  const interpolate: { name: string; colors: ColorSpace<T>[] }[] = [];

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const ratios = variant.ratios;
    const colors: ColorSpace<T>[] = [];

    for (let j = 0; j < ratios.length; j++) {
      let h = (baseHue + ratios[j]) % 360;
      if (h < 0) h += 360;

      const rotated = [polarValues[0], polarValues[1], polarValues[2]] as ColorSpace<ColorHue>;
      rotated[hueIndex] = h;

      if (needsReversion) {
        colors.push(convertColor(rotated, polarMode, mode) as ColorSpace<T>);
      } else {
        colors.push(rotated as unknown as ColorSpace<T>);
      }
    }

    interpolate.push({ name: variant.name, colors });
  }

  return interpolate;
};

export const createShades = <T extends ColorMode>(
  start: ColorSpace<T>,
  end: ColorSpace<T>,
  mode: T,
  steps: number,
): ColorSpace<T>[] => {
  if (steps <= 1) return [start];

  const interpolate: ColorSpace<T>[] = [];
  const total = steps - 1;

  const hueIndex = mode === 'hsl' || mode === 'hwb' ? 0 : mode === 'lch' || mode === 'oklch' ? 2 : -1;

  const s0 = start[0];
  const s1 = start[1];
  const s2 = start[2];

  let e0 = end[0];
  const e1 = end[1];
  let e2 = end[2];

  if (hueIndex === 0) {
    const diff = e0 - s0;
    if (diff > 180) e0 -= 360;
    else if (diff < -180) e0 += 360;
  } else if (hueIndex === 2) {
    const diff = e2 - s2;
    if (diff > 180) e2 -= 360;
    else if (diff < -180) e2 += 360;
  }

  const d0 = e0 - s0;
  const d1 = e1 - s1;
  const d2 = e2 - s2;

  for (let i = 0; i < steps; i++) {
    const t = i / total;

    let c0 = s0 + d0 * t;
    const c1 = s1 + d1 * t;
    let c2 = s2 + d2 * t;

    if (hueIndex === 0) c0 = c0 < 0 ? c0 + 360 : c0 % 360;
    else if (hueIndex === 2) c2 = c2 < 0 ? c2 + 360 : c2 % 360;

    interpolate.push([c0, c1, c2] as ColorSpace<T>);
  }

  return interpolate;
};

export const createScales = <T extends ColorMode>(stops: ColorSpace<T>[], mode: T, steps: number): ColorSpace<T>[] => {
  if (stops.length < 2) return stops;

  const interpolate: ColorSpace<T>[] = [];
  const totalSegments = stops.length - 1;
  const stepInterval = 1 / (steps - 1);

  const hueIndex = mode === 'hsl' || mode === 'hwb' ? 0 : mode === 'lch' || mode === 'oklch' ? 2 : -1;

  for (let i = 0; i < steps; i++) {
    const globalRatio = i * stepInterval;
    const segmentRaw = globalRatio * totalSegments;

    let index = Math.floor(segmentRaw);
    if (index >= totalSegments) index = totalSegments - 1;

    const start = stops[index];
    const end = stops[index + 1];
    const t = segmentRaw - index;

    const res = [0, 0, 0] as ColorSpace<T>;

    for (let c = 0; c < 3; c++) {
      if (c === hueIndex) {
        const sH = start[c];
        let eH = end[c];
        const diff = eH - sH;

        if (diff > 180) eH -= 360;
        else if (diff < -180) eH += 360;

        const h = sH + (eH - sH) * t;
        res[c] = h < 0 ? h + 360 : h % 360;
      } else {
        res[c] = start[c] + (end[c] - start[c]) * t;
      }
    }

    interpolate.push(res);
  }
  return interpolate;
};
