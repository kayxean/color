import type { Color, ColorArray, ColorSpace } from '../types';
import { convertColor, convertHue } from '../convert';
import { createBuffer } from '../utils';

const HARMONY_SCRATCH = createBuffer(new Float32Array(3));

export function createHarmony(
  input: Color,
  variants: { name: string; ratios: number[] }[],
): { name: string; colors: Color[] }[] {
  const { space, value } = input;

  convertHue(value, HARMONY_SCRATCH, space);

  let polarSpace: ColorSpace = 'hsl';
  let hueIndex = 0;

  if (space === 'lab' || space === 'lch') {
    polarSpace = 'lch';
    hueIndex = 2;
  } else if (space === 'oklab' || space === 'oklch') {
    polarSpace = 'oklch';
    hueIndex = 2;
  }

  const baseHue = HARMONY_SCRATCH[hueIndex];
  const needsReversion = polarSpace !== space;
  const results: { name: string; colors: Color[] }[] = [];

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const colors: Color[] = [];

    for (let j = 0; j < variant.ratios.length; j++) {
      const h = (((baseHue + variant.ratios[j]) % 360) + 360) % 360;
      const res = new Float32Array(3) as ColorArray<ColorSpace>;

      if (needsReversion) {
        const originalHue = HARMONY_SCRATCH[hueIndex];
        HARMONY_SCRATCH[hueIndex] = h;
        convertColor(HARMONY_SCRATCH, res, polarSpace, space);
        HARMONY_SCRATCH[hueIndex] = originalHue;

        colors.push({ space, value: res as ColorArray<typeof space> });
      } else {
        res.set(HARMONY_SCRATCH);
        res[hueIndex] = h;
        colors.push({
          space: polarSpace,
          value: res as ColorArray<typeof polarSpace>,
        });
      }
    }
    results.push({ name: variant.name, colors });
  }

  return results;
}

export function mixColor(start: Color, end: Color, t: number): Color {
  const space = start.space;
  const weight = Math.max(0, Math.min(1, t));

  const hueIndex =
    space === 'hsl' || space === 'hwb'
      ? 0
      : space === 'lch' || space === 'oklch'
        ? 2
        : -1;

  const sV = start.value;
  const eV = end.value;
  const res = new Float32Array(3) as ColorArray<typeof space>;

  for (let c = 0; c < 3; c++) {
    if (c === hueIndex) {
      const sH = sV[c];
      let eH = eV[c];
      const diff = eH - sH;

      if (diff > 180) eH -= 360;
      else if (diff < -180) eH += 360;

      const h = sH + (eH - sH) * weight;
      res[c] = ((h % 360) + 360) % 360;
    } else {
      res[c] = sV[c] + (eV[c] - sV[c]) * weight;
    }
  }

  return { space, value: res };
}

export function createShades(start: Color, end: Color, steps: number): Color[] {
  if (steps <= 1) return [start];
  const shades: Color[] = [];
  const total = steps - 1;

  for (let i = 0; i < steps; i++) {
    shades.push(mixColor(start, end, i / total));
  }
  return shades;
}

export function createScales(stops: Color[], steps: number): Color[] {
  if (stops.length < 2) {
    return stops.map((s) => ({
      space: s.space,
      value: new Float32Array(s.value) as ColorArray<typeof s.space>,
    }));
  }

  const scale: Color[] = [];
  const totalSegments = stops.length - 1;
  const stepInterval = 1 / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const globalRatio = i * stepInterval;
    const segmentRaw = globalRatio * totalSegments;

    let index = Math.floor(segmentRaw);
    if (index >= totalSegments) index = totalSegments - 1;

    const t = segmentRaw - index;
    scale.push(mixColor(stops[index], stops[index + 1], t));
  }

  return scale;
}
