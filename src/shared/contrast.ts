import type { Color, ColorArray } from '../types';
import { xyz50ToXyz65 } from '../adapters/cat';
import { applyAdapter, convertColor, NATIVE_HUB, TO_HUB } from '../convert';
import { createBuffer } from '../utils';
import { createScales } from './palette';

const APCA_SCALE = 1.14;
const DARK_THRESH = 0.022;
const DARK_CLAMP = 1414 / 1000;

const XYZ_SCRATCH = createBuffer(new Float32Array(3));
const POLAR_SCRATCH = createBuffer(new Float32Array(3));

export function getLuminanceD65(color: Color): number {
  applyAdapter(TO_HUB[color.space], color.value, XYZ_SCRATCH);

  if (NATIVE_HUB[color.space] === 'xyz50') {
    xyz50ToXyz65(XYZ_SCRATCH, XYZ_SCRATCH);
  }

  return XYZ_SCRATCH[1];
}

export function checkContrast(text: Color, background: Color): number {
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

export function matchContrast(
  color: Color,
  background: Color,
  targetContrast: number,
): Color {
  const currentContrast = checkContrast(color, background);
  if (Math.abs(currentContrast) >= targetContrast) return color;

  const space = color.space;
  const needsReversion = space !== 'oklch';

  if (needsReversion) {
    convertColor(color.value, POLAR_SCRATCH, space, 'oklch');
  } else {
    POLAR_SCRATCH.set(color.value);
  }

  const chroma = POLAR_SCRATCH[1];
  const hue = POLAR_SCRATCH[2];

  const backgroundLum = getLuminanceD65(background);
  const isDarkBg = backgroundLum < 0.5;

  let low = isDarkBg ? POLAR_SCRATCH[0] : 0;
  let high = isDarkBg ? 1 : POLAR_SCRATCH[0];
  let bestL = POLAR_SCRATCH[0];

  const testBuffer = new Float32Array([
    bestL,
    chroma,
    hue,
  ]) as ColorArray<'oklch'>;
  const testColor: Color = { space: 'oklch', value: testBuffer };

  const scratchBuffer = needsReversion
    ? (new Float32Array(3) as ColorArray<typeof space>)
    : null;
  const compareTarget: Color = scratchBuffer
    ? { space, value: scratchBuffer }
    : testColor;

  for (let i = 0; i < 10; i++) {
    const t = (low + high) / 2;
    testBuffer[0] = t;

    if (scratchBuffer) {
      convertColor(testBuffer, scratchBuffer, 'oklch', space);
    }

    const testContrast = checkContrast(compareTarget, background);

    if (Math.abs(testContrast) < targetContrast) {
      if (isDarkBg) low = t;
      else high = t;
    } else {
      bestL = t;
      if (isDarkBg) high = t;
      else low = t;
    }
  }

  const res = new Float32Array([bestL, chroma, hue]) as ColorArray<'oklch'>;

  if (needsReversion) {
    const revertedValue = new Float32Array(3) as ColorArray<typeof space>;
    convertColor(res, revertedValue, 'oklch', space);
    return { space, value: revertedValue };
  }

  return { space: 'oklch', value: res };
}

export function checkContrastBulk(
  background: Color,
  colors: Color[],
): { color: Color; contrast: number; rating: string }[] {
  return colors.map((color) => ({
    color,
    contrast: checkContrast(color, background),
    rating: getContrastRating(checkContrast(color, background)),
  }));
}

export function matchScales(
  stops: Color[],
  background: Color,
  targetContrast: number,
  steps: number,
): Color[] {
  const scale = createScales(stops, steps);
  return scale.map((s) => matchContrast(s, background, targetContrast));
}
