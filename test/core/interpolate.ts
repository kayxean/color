import type { ColorFormat, ColorMode } from "../types";
import { hexToRgb } from "../mode/rgb";
import { convertColor, convertHue } from "./convert";

const createHarmony = <T extends ColorMode>(
  input: ColorFormat<T>,
  variants: { name: string; ratio: number[] }[],
): { name: string; ratio: ColorFormat<T>[] }[] => {
  const hue = convertHue(input);
  const base = hue[0];
  const mode = input[0];

  const c = input[1];
  const t = input[2];
  const x = input[3];

  const nonHue = mode === "rgb" || mode === "lab" || mode === "oklab";
  const isHsv = base === "hsl" || base === "hwb";
  const angle = isHsv ? hue[1] : hue[3];

  const invert = (deg: number): ColorFormat<T> => {
    const h = (deg + angle) % 360;

    const color = nonHue
      ? isHsv
        ? (convertColor([base, h, t, x], mode) as ColorFormat<"rgb">)
        : (convertColor([base, c, t, h], mode) as ColorFormat<"lab" | "oklab">)
      : isHsv
        ? ([base, h, t, x] as ColorFormat<"hsl" | "hwb">)
        : ([base, c, t, h] as ColorFormat<"lch" | "oklch">);

    return color as ColorFormat<T>;
  };

  const harmony: { name: string; ratio: ColorFormat<T>[] }[] = [];

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i] || { name: "", ratio: [] };
    const ratio: ColorFormat<T>[] = [];

    for (let r = 0; r < variant.ratio.length; r++) {
      ratio.push(invert(variant.ratio[r] || 0));
    }

    harmony.push({
      name: variant.name,
      ratio: ratio,
    });
  }

  return harmony;
};

const createShades = (startColor: string, endColor: string, steps: number): ColorFormat<"rgb">[] => {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);

  const interpolate: ColorFormat<"rgb">[] = [];
  const total = steps - 1;

  for (let i = 0; i < steps; i++) {
    const ratio = total === 0 ? 0 : i / total;

    const r = Math.round(start[1] + (end[1] - start[1]) * ratio);
    const g = Math.round(start[2] + (end[2] - start[2]) * ratio);
    const b = Math.round(start[3] + (end[3] - start[3]) * ratio);

    interpolate.push(["rgb", r, g, b]);
  }

  return interpolate;
};

const createScales = (shades: string[], steps: number): ColorFormat<"rgb">[] => {
  const total = shades.length - 1;
  const ratio = Math.ceil(steps / total);

  const interpolate: ColorFormat<"rgb">[] = [];

  for (let i = 0; i < total; i++) {
    const startColor = shades[i] || "";
    const endColor = shades[i + 1] || "";

    interpolate.push(...createShades(startColor, endColor, ratio));
  }

  const seen = new Set<string>();
  const scales: ColorFormat<"rgb">[] = interpolate.filter((color) => {
    const rgb = JSON.stringify(color);

    if (seen.has(rgb)) {
      return false;
    }

    seen.add(rgb);
    return true;
  });

  if (scales.length > steps) {
    scales.splice(steps);
  }

  return scales;
};

export { createHarmony, createShades, createScales };
