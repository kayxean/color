import type { ColorFn, ColorFormat, ColorMode, ColorSpace } from "../types";
import { hslToHsv, hsvToHsl } from "../mode/hsl";
import { hsvToRgb, rgbToHsv } from "../mode/hsv";
import { hsvToHwb, hwbToHsv } from "../mode/hwb";
import { labToXyz50, xyz50ToLab } from "../mode/lab";
import { labToLch, lchToLab } from "../mode/lch";
import { lrgbToRgb, rgbToLrgb } from "../mode/lrgb";
import { lrgbToOklab, oklabToLrgb } from "../mode/oklab";
import { oklabToOklch, oklchToOklab } from "../mode/oklch";
import { lrgbToXyz50, xyz50ToLrgb } from "../mode/xyz50";
import { lrgbToXyz65, xyz50ToXyz65, xyz65ToLrgb, xyz65ToXyz50 } from "../mode/xyz65";

const compose = <T extends ColorMode, R extends ColorMode>(
  converter: Array<(input: ColorSpace<any>) => ColorSpace<any>>,
): ((input: ColorSpace<T>) => ColorSpace<R>) => {
  return (input: ColorSpace<any>) => converter.reduceRight((acc, fn) => fn(acc), input) as ColorSpace<R>;
};

const rgbToHsl = compose<"rgb", "hsl">([hsvToHsl, rgbToHsv]);
const rgbToHwb = compose<"rgb", "hwb">([hsvToHwb, rgbToHsv]);
const rgbToLab = compose<"rgb", "lab">([xyz50ToLab, lrgbToXyz50, rgbToLrgb]);
const rgbToLch = compose<"rgb", "lch">([labToLch, xyz50ToLab, lrgbToXyz50, rgbToLrgb]);
const rgbToOklab = compose<"rgb", "oklab">([lrgbToOklab, rgbToLrgb]);
const rgbToOklch = compose<"rgb", "oklch">([oklabToOklch, lrgbToOklab, rgbToLrgb]);

const hslToRgb = compose<"hsl", "rgb">([hsvToRgb, hslToHsv]);
const hslToHwb = compose<"hsl", "hwb">([hsvToHwb, hslToHsv]);
const hslToLab = compose<"hsl", "lab">([rgbToLab, hslToRgb]);
const hslToLch = compose<"hsl", "lch">([rgbToLch, hslToRgb]);
const hslToOklab = compose<"hsl", "oklab">([rgbToOklab, hslToRgb]);
const hslToOklch = compose<"hsl", "oklch">([rgbToOklch, hslToRgb]);

const hwbToRgb = compose<"hwb", "rgb">([hsvToRgb, hwbToHsv]);
const hwbToHsl = compose<"hwb", "hsl">([hsvToHsl, hwbToHsv]);
const hwbToLab = compose<"hwb", "lab">([rgbToLab, hwbToRgb]);
const hwbToLch = compose<"hwb", "lch">([rgbToLch, hwbToRgb]);
const hwbToOklab = compose<"hwb", "oklab">([rgbToOklab, hwbToRgb]);
const hwbToOklch = compose<"hwb", "oklch">([rgbToOklch, hwbToRgb]);

const labToRgb = compose<"lab", "rgb">([lrgbToRgb, xyz50ToLrgb, labToXyz50]);
const labToHsl = compose<"lab", "hsl">([rgbToHsl, labToRgb]);
const labToHwb = compose<"lab", "hwb">([rgbToHwb, labToRgb]);
const labToOklab = compose<"lab", "oklab">([lrgbToOklab, xyz65ToLrgb, xyz50ToXyz65, labToXyz50]);
const labToOklch = compose<"lab", "oklch">([oklabToOklch, labToOklab]);

const lchToRgb = compose<"lch", "rgb">([labToRgb, lchToLab]);
const lchToHsl = compose<"lch", "hsl">([labToHsl, lchToLab]);
const lchToHwb = compose<"lch", "hwb">([labToHwb, lchToLab]);
const lchToOklab = compose<"lch", "oklab">([labToOklab, lchToLab]);
const lchToOklch = compose<"lch", "oklch">([labToOklch, lchToLab]);

const oklabToRgb = compose<"oklab", "rgb">([lrgbToRgb, oklabToLrgb]);
const oklabToHsl = compose<"oklab", "hsl">([rgbToHsl, oklabToRgb]);
const oklabToHwb = compose<"oklab", "hwb">([rgbToHwb, oklabToRgb]);
const oklabToLab = compose<"oklab", "lab">([xyz50ToLab, xyz65ToXyz50, lrgbToXyz65, oklabToLrgb]);
const oklabToLch = compose<"oklab", "lch">([labToLch, oklabToLab]);

const oklchToRgb = compose<"oklch", "rgb">([oklabToRgb, oklchToOklab]);
const oklchToHsl = compose<"oklch", "hsl">([oklabToHsl, oklchToOklab]);
const oklchToHwb = compose<"oklch", "hwb">([oklabToHwb, oklchToOklab]);
const oklchToLab = compose<"oklch", "lab">([oklabToLab, oklchToOklab]);
const oklchToLch = compose<"oklch", "lch">([oklabToLch, oklchToOklab]);

const converter: { [T in ColorMode]: { [R in Exclude<ColorMode, T>]: ColorFn<T, R> } } = {
  rgb: {
    hsl: rgbToHsl,
    hwb: rgbToHwb,
    lab: rgbToLab,
    lch: rgbToLch,
    oklab: rgbToOklab,
    oklch: rgbToOklch,
  },
  hsl: {
    rgb: hslToRgb,
    hwb: hslToHwb,
    lab: hslToLab,
    lch: hslToLch,
    oklab: hslToOklab,
    oklch: hslToOklch,
  },
  hwb: {
    rgb: hwbToRgb,
    hsl: hwbToHsl,
    lab: hwbToLab,
    lch: hwbToLch,
    oklab: hwbToOklab,
    oklch: hwbToOklch,
  },
  lab: {
    rgb: labToRgb,
    hsl: labToHsl,
    hwb: labToHwb,
    lch: labToLch,
    oklab: labToOklab,
    oklch: labToOklch,
  },
  lch: {
    rgb: lchToRgb,
    hsl: lchToHsl,
    hwb: lchToHwb,
    lab: lchToLab,
    oklab: lchToOklab,
    oklch: lchToOklch,
  },
  oklab: {
    rgb: oklabToRgb,
    hsl: oklabToHsl,
    hwb: oklabToHwb,
    lab: oklabToLab,
    lch: oklabToLch,
    oklch: oklabToOklch,
  },
  oklch: {
    rgb: oklchToRgb,
    hsl: oklchToHsl,
    hwb: oklchToHwb,
    lab: oklchToLab,
    lch: oklchToLch,
    oklab: oklchToOklab,
  },
};

const convertColor = <T extends ColorMode, R extends Exclude<ColorMode, T>>(
  input: ColorFormat<T>,
  output: R,
): ColorFormat<R> => {
  const [mode, ...value] = input;
  const color = converter[mode][output];

  return [output, ...color(value as ColorSpace<T>)] as ColorFormat<R>;
};

const convertHue = <T extends ColorMode>(input: ColorFormat<T>): ColorFormat<"hsl" | "hwb" | "lch" | "oklch"> => {
  const [mode, ...value] = input;
  let output: ColorFormat<"hsl" | "hwb" | "lch" | "oklch">;

  if (mode === "rgb") {
    output = ["hsl", ...rgbToHsl(value as ColorSpace<"rgb">)] as ColorFormat<"hsl">;
  } else if (mode === "lab") {
    output = ["lch", ...labToLch(value as ColorSpace<"lab">)] as ColorFormat<"lch">;
  } else if (mode === "oklab") {
    output = ["oklch", ...oklabToOklch(value as ColorSpace<"oklab">)] as ColorFormat<"oklch">;
  } else {
    output = input as ColorFormat<"hsl" | "hwb" | "lch" | "oklch">;
  }

  return output;
};

export { compose, converter, convertColor, convertHue };
