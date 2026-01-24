import type { ColorBuffer, ColorMode } from './types';
import { xyz50ToXyz65, xyz65ToXyz50 } from '../adapters/cat';
import { labToXyz50, xyz50ToLab } from '../adapters/d50';
import {
  lrgbToXyz65,
  oklabToXyz65,
  xyz65ToLrgb,
  xyz65ToOklab,
} from '../adapters/d65';
import { lrgbToRgb, rgbToLrgb } from '../adapters/gamma';
import {
  labToLch,
  lchToLab,
  oklabToOklch,
  oklchToOklab,
} from '../adapters/polar';
import {
  hslToHsv,
  hsvToHsl,
  hsvToHwb,
  hsvToRgb,
  hwbToHsv,
  rgbToHsv,
} from '../adapters/srgb';
import { createBuffer } from './shared';

export const NATIVE_HUB: Record<ColorMode, 'xyz50' | 'xyz65'> = {
  rgb: 'xyz65',
  hsv: 'xyz65',
  hsl: 'xyz65',
  hwb: 'xyz65',
  oklab: 'xyz65',
  oklch: 'xyz65',
  lab: 'xyz50',
  lch: 'xyz50',
};

type ColorAdapter = (input: ColorBuffer, output: ColorBuffer) => void;

const convertScratch = createBuffer(3);

export const TO_HUB: Record<ColorMode, ColorAdapter[]> = {
  rgb: [rgbToLrgb, lrgbToXyz65],
  hsv: [hsvToRgb, rgbToLrgb, lrgbToXyz65],
  hsl: [hslToHsv, hsvToRgb, rgbToLrgb, lrgbToXyz65],
  hwb: [hwbToHsv, hsvToRgb, rgbToLrgb, lrgbToXyz65],
  oklab: [oklabToXyz65],
  oklch: [oklchToOklab, oklabToXyz65],
  lab: [labToXyz50],
  lch: [lchToLab, labToXyz50],
};

export const FROM_HUB: Record<ColorMode, ColorAdapter[]> = {
  rgb: [xyz65ToLrgb, lrgbToRgb],
  hsv: [xyz65ToLrgb, lrgbToRgb, rgbToHsv],
  hsl: [xyz65ToLrgb, lrgbToRgb, rgbToHsv, hsvToHsl],
  hwb: [xyz65ToLrgb, lrgbToRgb, rgbToHsv, hsvToHwb],
  oklab: [xyz65ToOklab],
  oklch: [xyz65ToOklab, oklabToOklch],
  lab: [xyz50ToLab],
  lch: [xyz50ToLab, labToLch],
};

export const DIRECT: Partial<
  Record<ColorMode, Partial<Record<ColorMode, ColorAdapter[]>>>
> = {
  rgb: {
    hsv: [rgbToHsv],
    hsl: [rgbToHsv, hsvToHsl],
    hwb: [rgbToHsv, hsvToHwb],
  },
  hsv: {
    rgb: [hsvToRgb],
    hsl: [hsvToHsl],
    hwb: [hsvToHwb],
  },
  hsl: {
    rgb: [hslToHsv, hsvToRgb],
    hsv: [hslToHsv],
  },
  hwb: {
    rgb: [hwbToHsv, hsvToRgb],
    hsv: [hwbToHsv],
  },
  lab: { lch: [labToLch] },
  lch: { lab: [lchToLab] },
  oklab: { oklch: [oklabToOklch] },
  oklch: { oklab: [oklchToOklab] },
};

function runChain(
  chain: ColorAdapter[],
  input: ColorBuffer,
  output: ColorBuffer,
): void {
  let currentInput = input;

  for (let i = 0; i < chain.length; i++) {
    const target = i === chain.length - 1 ? output : convertScratch;
    chain[i](currentInput, target);

    currentInput = convertScratch;
  }
}

export function convertColor<T extends ColorMode, R extends ColorMode>(
  input: ColorBuffer,
  output: ColorBuffer,
  from: T,
  to: R,
): void {
  if (!(from in NATIVE_HUB)) {
    throw new Error(`Unsupported source mode: ${from}`);
  }
  if (!(to in NATIVE_HUB)) {
    throw new Error(`Unsupported target mode: ${to}`);
  }

  if (from === (to as ColorMode)) {
    output.set(input);
    return;
  }

  const directChain = DIRECT[from]?.[to];
  if (directChain) {
    runChain(directChain, input, output);
    return;
  }

  const toHubChain = TO_HUB[from];
  runChain(toHubChain, input, output);

  const sourceHub = NATIVE_HUB[from];
  const targetHub = NATIVE_HUB[to];

  if (sourceHub !== targetHub) {
    if (sourceHub === 'xyz65') {
      xyz65ToXyz50(output, output);
    } else {
      xyz50ToXyz65(output, output);
    }
  }

  const fromHubChain = FROM_HUB[to];
  runChain(fromHubChain, output, output);
}

export function convertHue<T extends ColorMode>(
  input: ColorBuffer,
  output: ColorBuffer,
  mode: T,
): void {
  if (!(mode in NATIVE_HUB)) {
    throw new Error(`Unsupported color mode for hue conversion: ${mode}`);
  }

  switch (mode) {
    case 'rgb':
      rgbToHsv(input, output);
      hsvToHsl(output, output);
      break;
    case 'lab':
      labToLch(input, output);
      break;
    case 'oklab':
      oklabToOklch(input, output);
      break;
    case 'hsl':
    case 'hsv':
    case 'hwb':
    case 'lch':
    case 'oklch':
      output.set(input);
      break;
    default:
      convertColor(input, output, mode, 'hsl');
  }
}
