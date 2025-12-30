import type { ColorFn, ColorHue, ColorMode, ColorSpace } from './types';
import { xyz50ToXyz65, xyz65ToXyz50 } from './adapters/cat';
import { labToXyz50, xyz50ToLab } from './adapters/d50';
import { lrgbToXyz65, oklabToXyz65, xyz65ToLrgb, xyz65ToOklab } from './adapters/d65';
import { lrgbToRgb, rgbToLrgb } from './adapters/gamma';
import { labToLch, lchToLab, oklabToOklch, oklchToOklab } from './adapters/polar';
import { hslToHsv, hsvToHsl, hsvToHwb, hsvToRgb, hwbToHsv, rgbToHsv } from './adapters/srgb';

const NATIVE_HUB: { [T in ColorMode]: 'xyz50' | 'xyz65' } = {
  rgb: 'xyz65',
  hsl: 'xyz65',
  hwb: 'xyz65',
  oklab: 'xyz65',
  oklch: 'xyz65',
  lab: 'xyz50',
  lch: 'xyz50',
};

const TO_HUB: { [T in ColorMode]: (input: ColorSpace<T>) => ColorSpace<'xyz50' | 'xyz65'> } = {
  rgb: (input) => lrgbToXyz65(rgbToLrgb(input)),
  hsl: (input) => lrgbToXyz65(rgbToLrgb(hsvToRgb(hslToHsv(input)))),
  hwb: (input) => lrgbToXyz65(rgbToLrgb(hsvToRgb(hwbToHsv(input)))),
  oklab: (input) => oklabToXyz65(input),
  oklch: (input) => oklabToXyz65(oklchToOklab(input)),
  lab: (input) => labToXyz50(input),
  lch: (input) => labToXyz50(lchToLab(input)),
};

const FROM_HUB: { [T in ColorMode]: (input: ColorSpace<'xyz50' | 'xyz65'>) => ColorSpace<T> } = {
  rgb: (input) => lrgbToRgb(xyz65ToLrgb(input as ColorSpace<'xyz65'>)),
  hsl: (input) => hsvToHsl(rgbToHsv(lrgbToRgb(xyz65ToLrgb(input as ColorSpace<'xyz65'>)))),
  hwb: (input) => hsvToHwb(rgbToHsv(lrgbToRgb(xyz65ToLrgb(input as ColorSpace<'xyz65'>)))),
  oklab: (input) => xyz65ToOklab(input as ColorSpace<'xyz65'>),
  oklch: (input) => oklabToOklch(xyz65ToOklab(input as ColorSpace<'xyz65'>)),
  lab: (input) => xyz50ToLab(input as ColorSpace<'xyz50'>),
  lch: (input) => labToLch(xyz50ToLab(input as ColorSpace<'xyz50'>)),
};

const DIRECT: { [T in ColorMode]?: Partial<{ [X in Exclude<ColorMode, T>]: ColorFn<T, X> }> } = {
  rgb: {
    hsl: (input) => hsvToHsl(rgbToHsv(input)),
    hwb: (input) => hsvToHwb(rgbToHsv(input)),
  },
  hsl: {
    rgb: (input) => hsvToRgb(hslToHsv(input)),
  },
  hwb: {
    rgb: (input) => hsvToRgb(hwbToHsv(input)),
  },
  lab: {
    lch: (input) => labToLch(input),
  },
  lch: {
    lab: (input) => lchToLab(input),
  },
  oklab: {
    oklch: (input) => oklabToOklch(input),
  },
  oklch: {
    oklab: (input) => oklchToOklab(input),
  },
};

const HUE_BASE: Partial<{ [T in ColorMode]: (input: ColorSpace<T>) => ColorSpace<ColorHue> }> = {
  rgb: (input) => hsvToHsl(rgbToHsv(input)),
  lab: (input) => labToLch(input),
  oklab: (input) => oklabToOklch(input),
};

const handleMissingMode = (mode: string, type: 'source' | 'target'): never => {
  throw new Error(`Unsupported ${type} mode: ${mode}`);
};

const toHub = <T extends ColorMode>(input: ColorSpace<T>, mode: T): ColorSpace<'xyz50' | 'xyz65'> => {
  const fn = TO_HUB[mode];
  if (!fn) {
    handleMissingMode(mode, 'source');
  }

  return fn(input);
};

const fromHub = <T extends ColorMode>(input: ColorSpace<'xyz50' | 'xyz65'>, mode: T): ColorSpace<T> => {
  const fn = FROM_HUB[mode];
  if (!fn) {
    handleMissingMode(mode, 'target');
  }

  return fn(input);
};

export const convertColor = <T extends ColorMode, R extends Exclude<ColorMode, T>>(
  input: ColorSpace<T>,
  from: T,
  to: R,
): ColorSpace<R> => {
  if (from === (to as unknown)) return input as never;

  const directMap = DIRECT[from];
  if (directMap) {
    const directFn = directMap[to];
    if (directFn) return directFn(input);
  }

  let current = toHub(input, from);

  const sourceHub = NATIVE_HUB[from];
  const targetHub = NATIVE_HUB[to];

  if (sourceHub !== targetHub) {
    current =
      sourceHub === 'xyz65' ? xyz65ToXyz50(current as ColorSpace<'xyz65'>) : xyz50ToXyz65(current as ColorSpace<'xyz50'>);
  }

  return fromHub(current, to);
};

export const convertHue = <T extends ColorMode>(input: ColorSpace<T>, mode: T): ColorSpace<ColorHue> => {
  const huerizer = HUE_BASE[mode];

  if (huerizer) {
    return huerizer(input);
  }

  return input as ColorSpace<ColorHue>;
};
