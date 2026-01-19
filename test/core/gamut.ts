import type { ColorFormat, ColorMode } from "../types";

const colorGamut: {
  [T in ColorMode]: [[number, number], [number, number], [number, number]];
} = {
  rgb: [
    [0, 255],
    [0, 255],
    [0, 255],
  ],
  hsl: [
    [0, 360],
    [0, 100],
    [0, 100],
  ],
  hwb: [
    [0, 360],
    [0, 100],
    [0, 100],
  ],
  lab: [
    [0, 100],
    [-100, 100],
    [-100, 100],
  ],
  lch: [
    [0, 100],
    [0, 150],
    [0, 360],
  ],
  oklab: [
    [0, 1],
    [-0.4, 0.4],
    [-0.4, 0.4],
  ],
  oklch: [
    [0, 1],
    [0, 0.4],
    [0, 360],
  ],
};

const colorRange: {
  [T in ColorMode]: [[number, number], [number, number], [number, number]];
} = {
  rgb: [
    [0, 1],
    [0, 1],
    [0, 1],
  ],
  hsl: [
    [0, 360],
    [0.48, 0.96],
    [0.32, 0.72],
  ],
  hwb: [
    [0, 360],
    [0, 0.36],
    [0, 0.24],
  ],
  lab: [
    [20, 80],
    [-100, 100],
    [-100, 100],
  ],
  lch: [
    [48, 96],
    [70, 140],
    [0, 360],
  ],
  oklab: [
    [0.2, 0.8],
    [-0.4, 0.4],
    [-0.4, 0.4],
  ],
  oklch: [
    [0.2, 0.8],
    [0.2, 0.4],
    [0, 360],
  ],
};

const colorKind: ColorMode[] = ["rgb", "hsl", "hwb", "lab", "lch", "oklab", "oklch"];

const colorLabel: { [T in ColorMode]: [string, string, string] } = {
  rgb: ["red", "green", "blue"],
  hsl: ["hue", "saturation", "lightness"],
  hwb: ["hue", "whiteness", "blackness"],
  lab: ["lightness", "green-red", "blue-yellow"],
  lch: ["lightness", "chroma", "hue"],
  oklab: ["lightness", "green-red", "blue-yellow"],
  oklch: ["lightness", "chroma", "hue"],
};

const checkGamut = <T extends ColorMode>(input: ColorFormat<T>): string[] => {
  const [mode, ...values] = input;
  const ranges = colorGamut[mode];
  const labels = colorLabel[mode];
  const warnings: string[] = [];

  for (let i = 0; i < 3; i++) {
    const [min, max] = ranges[i] as [number, number];
    const label = labels[i] as string;
    const value = values[i] as number;

    value < min ? warnings.push(`${label} is under the range`) : value > max && warnings.push(`${label} is above the range`);
  }

  return warnings;
};

export { colorGamut, colorRange, colorKind, checkGamut };
