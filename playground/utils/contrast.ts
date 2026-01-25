import type { ColorState } from '../core/types';
import { xyz50ToXyz65 } from '../adapters/cat';
import {
  applyAdapter,
  convertColor,
  NATIVE_HUB,
  TO_HUB,
} from '../core/convert';
import { createBuffer, createColor } from '../core/shared';
import { createScales } from './palette';

const APCA_SCALE = 1.14;
const DARK_THRESH = 0.022;
const DARK_CLAMP = 1414 / 1000;

const XYZ_SCRATCH = createBuffer(3);
const POLAR_SCRATCH = createBuffer(3);

export function getLuminanceD65(state: ColorState): number {
  applyAdapter(TO_HUB[state.mode], state.values, XYZ_SCRATCH);

  if (NATIVE_HUB[state.mode] === 'xyz50') {
    xyz50ToXyz65(XYZ_SCRATCH, XYZ_SCRATCH);
  }

  return XYZ_SCRATCH[1];
}

export function checkContrast(
  text: ColorState,
  background: ColorState,
): number {
  const yt = getLuminanceD65(text);
  const yb = getLuminanceD65(background);

  const vt = yt > DARK_THRESH ? yt : yt + (DARK_THRESH - yt) ** DARK_CLAMP;
  const vb = yb > DARK_THRESH ? yb : yb + (DARK_THRESH - yb) ** DARK_CLAMP;

  let contrast = 0;

  if (vb > vt) {
    contrast = (vb ** 0.56 - vt ** 0.57) * APCA_SCALE;
  } else {
    contrast = (vb ** 0.65 - vt ** 0.62) * APCA_SCALE;
  }

  const res = Math.abs(contrast) < 0.1 ? 0 : contrast * 100;

  return Number(res.toFixed(2));
}

export function getContrastRating(contrast: number): string {
  const rate = Math.abs(contrast);

  if (rate >= 90) return 'platinum';
  if (rate >= 75) return 'gold';
  if (rate >= 60) return 'silver';
  if (rate >= 45) return 'bronze';
  if (rate >= 30) return 'ui';

  return 'fail';
}

export function checkContrastBulk(
  background: ColorState,
  colors: ColorState[],
): { color: ColorState; contrast: number; rating: string }[] {
  const interpolate = [];

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    const contrast = checkContrast(color, background);
    const rating = getContrastRating(contrast);

    interpolate.push({ color, contrast, rating });
  }

  return interpolate;
}

export function matchContrast(
  state: ColorState,
  background: ColorState,
  targetContrast: number,
): ColorState {
  const currentContrast = checkContrast(state, background);
  if (Math.abs(currentContrast) >= targetContrast) return state;

  const mode = state.mode;
  const needsReversion = mode !== 'oklch';

  if (needsReversion) {
    convertColor(state.values, POLAR_SCRATCH, mode, 'oklch');
  } else {
    POLAR_SCRATCH.set(state.values);
  }

  const lightness = POLAR_SCRATCH[0];
  const chroma = POLAR_SCRATCH[1];
  const hue = POLAR_SCRATCH[2];

  const luminance = getLuminanceD65(background);
  const isDark = luminance < 0.5;

  let low = isDark ? lightness : 0;
  let high = isDark ? 1 : lightness;
  let bestL = lightness;

  const testBuffer = createBuffer(3);
  testBuffer[1] = chroma;
  testBuffer[2] = hue;

  const rotated = createColor(testBuffer, 'oklch');
  const scratchBuffer = needsReversion ? createBuffer(3) : null;
  const res = scratchBuffer ? createColor(scratchBuffer, mode) : rotated;

  for (let i = 0; i < 10; i++) {
    const t = (low + high) / 2;
    testBuffer[0] = t;

    if (needsReversion && scratchBuffer) {
      convertColor(rotated.values, scratchBuffer, 'oklch', mode);
    }

    const testContrast = checkContrast(res, background);

    if (Math.abs(testContrast) < targetContrast) {
      if (isDark) low = t;
      else high = t;
    } else {
      bestL = t;
      if (isDark) high = t;
      else low = t;
    }
  }

  const resultBuffer = createBuffer(3);
  resultBuffer[0] = bestL;
  resultBuffer[1] = chroma;
  resultBuffer[2] = hue;

  if (needsReversion) {
    const finalBuffer = createBuffer(3);
    convertColor(resultBuffer, finalBuffer, 'oklch', mode);
    return createColor(finalBuffer, mode);
  }

  return createColor(resultBuffer, 'oklch');
}

export function matchScales(
  stops: ColorState[],
  background: ColorState,
  targetContrast: number,
  steps: number,
): ColorState[] {
  const scale = createScales(stops, steps);
  const interpolate: ColorState[] = [];

  for (let i = 0; i < scale.length; i++) {
    interpolate.push(matchContrast(scale[i], background, targetContrast));
  }

  return interpolate;
}
