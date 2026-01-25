import type { ColorBuffer, ColorMode, ColorState } from '../core/types';
import { convertColor, convertHue } from '../core/convert';
import { createBuffer, createColor } from '../core/shared';

const HARMONY_SCRATCH = createBuffer(3);

export function createHarmony(
  input: ColorState,
  variants: { name: string; ratios: number[] }[],
): { name: string; colors: ColorState[] }[] {
  const { mode, values } = input;

  convertHue(values, HARMONY_SCRATCH, mode);

  let polarMode: ColorMode = 'hsl';
  let hueIndex = 0;

  if (mode === 'lab' || mode === 'lch') {
    polarMode = 'lch';
    hueIndex = 2;
  } else if (mode === 'oklab' || mode === 'oklch') {
    polarMode = 'oklch';
    hueIndex = 2;
  }

  const baseHue = HARMONY_SCRATCH[hueIndex];
  const needsReversion = polarMode !== mode;
  const interpolate: { name: string; colors: ColorState[] }[] = [];

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const ratios = variant.ratios;
    const colors: ColorState[] = [];

    for (let j = 0; j < ratios.length; j++) {
      const h = (((baseHue + ratios[j]) % 360) + 360) % 360;

      const res = new Float32Array(3) as ColorBuffer;

      if (needsReversion) {
        const originalHue = HARMONY_SCRATCH[hueIndex];
        HARMONY_SCRATCH[hueIndex] = h;

        convertColor(HARMONY_SCRATCH, res, polarMode, mode);

        HARMONY_SCRATCH[hueIndex] = originalHue;
        colors.push(createColor(res, mode));
      } else {
        res.set(HARMONY_SCRATCH);
        res[hueIndex] = h;
        colors.push(createColor(res, polarMode));
      }
    }

    interpolate.push({ name: variant.name, colors: colors });
  }

  return interpolate;
}

export function createShades(
  start: ColorState,
  end: ColorState,
  steps: number,
): ColorState[] {
  if (steps <= 1) return [start];

  const interpolate: ColorState[] = [];
  const total = steps - 1;
  const mode = start.mode;

  const hueIndex =
    mode === 'hsl' || mode === 'hwb'
      ? 0
      : mode === 'lch' || mode === 'oklch'
        ? 2
        : -1;

  const sV = start.values;
  const eV = end.values;

  const s0 = sV[0];
  const s1 = sV[1];
  const s2 = sV[2];

  let e0 = eV[0];
  const e1 = eV[1];
  let e2 = eV[2];

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

    if (hueIndex === 0) {
      c0 = ((c0 % 360) + 360) % 360;
    } else if (hueIndex === 2) {
      c2 = ((c2 % 360) + 360) % 360;
    }

    const res = new Float32Array([c0, c1, c2]) as ColorBuffer;
    interpolate.push(createColor(res, mode));
  }

  return interpolate;
}

export function createScales(stops: ColorState[], steps: number): ColorState[] {
  if (stops.length < 2) {
    return stops.map((s) =>
      createColor(new Float32Array(s.values) as ColorBuffer, s.mode),
    );
  }

  const interpolate: ColorState[] = [];
  const mode = stops[0].mode;
  const totalSegments = stops.length - 1;
  const stepInterval = 1 / (steps - 1);

  const hueIndex =
    mode === 'hsl' || mode === 'hwb'
      ? 0
      : mode === 'lch' || mode === 'oklch'
        ? 2
        : -1;

  for (let i = 0; i < steps; i++) {
    const globalRatio = i * stepInterval;
    const segmentRaw = globalRatio * totalSegments;

    let index = Math.floor(segmentRaw);
    if (index >= totalSegments) index = totalSegments - 1;

    const start = stops[index].values;
    const end = stops[index + 1].values;
    const t = segmentRaw - index;

    const res = new Float32Array(3) as ColorBuffer;

    for (let c = 0; c < 3; c++) {
      const sV = start[c];
      let eV = end[c];

      if (c === hueIndex) {
        const diff = eV - sV;
        if (diff > 180) eV -= 360;
        else if (diff < -180) eV += 360;

        const h = sV + (eV - sV) * t;
        res[c] = ((h % 360) + 360) % 360;
      } else {
        res[c] = sV + (eV - sV) * t;
      }
    }

    interpolate.push(createColor(res, mode));
  }

  return interpolate;
}

export function mixColor(
  start: ColorState,
  end: ColorState,
  t: number,
): ColorState {
  const mode = start.mode;
  const weight = t < 0 ? 0 : t > 1 ? 1 : t;

  const hueIndex =
    mode === 'hsl' || mode === 'hwb'
      ? 0
      : mode === 'lch' || mode === 'oklch'
        ? 2
        : -1;

  const sV = start.values;
  const eV = end.values;
  const res = new Float32Array(3) as ColorBuffer;

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

  return createColor(res, mode);
}
