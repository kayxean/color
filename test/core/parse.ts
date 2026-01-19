import type { ColorFormat, ColorMode } from "../types";

const parseColor = (input: string): ColorFormat<ColorMode> => {
  let css = input.trim().toLowerCase();

  if (css.startsWith("#")) {
    css = css.slice(1);
  }

  if (/^[0-9a-f]{3}$/.test(css)) {
    const r = Number.parseInt(css.charAt(0) + css.charAt(0), 16);
    const g = Number.parseInt(css.charAt(1) + css.charAt(1), 16);
    const b = Number.parseInt(css.charAt(2) + css.charAt(2), 16);
    return ["rgb", r, g, b];
  }

  if (/^[0-9a-f]{6}$/.test(css)) {
    const r = Number.parseInt(css.substring(0, 2), 16);
    const g = Number.parseInt(css.substring(2, 4), 16);
    const b = Number.parseInt(css.substring(4, 6), 16);
    return ["rgb", r, g, b];
  }

  const invalidColor: ColorFormat<"rgb"> = ["rgb", 0, 0, 0];

  const match = css.match(/^([a-z]+)\((.+)\)$/) as NonNullable<[string, string, string]>;

  if (match) {
    const color = match[1];
    const decimal = match[2].trim().split(/\s*[,/\s]\s*/);

    switch (color) {
      case "rgb": {
        return [color, ...decimal.map((value) => Number.parseFloat(value) / 255)] as ColorFormat<"rgb">;
      }
      case "hsl":
      case "hwb": {
        return [
          color,
          ...decimal.map((value, index) => (index === 0 ? Number.parseFloat(value) : Number.parseFloat(value) / 100)),
        ] as ColorFormat<"hsl" | "hwb">;
      }
      case "lab":
      case "lch": {
        return [color, ...decimal.map((value) => Number.parseFloat(value))] as ColorFormat<"lab" | "lch">;
      }
      case "oklab":
      case "oklch": {
        return [
          color,
          ...decimal.map((value) => (value.endsWith("%") ? Number.parseFloat(value) / 100 : Number.parseFloat(value))),
        ] as ColorFormat<"oklab" | "oklch">;
      }
      default: {
        return invalidColor;
      }
    }
  }

  return invalidColor;
};

const parseCss = <T extends ColorMode>(input: ColorFormat<T>, percent?: boolean, degree?: boolean): string => {
  const mode = input[0];
  const rgb = mode === "rgb";
  const hsl = mode === "hsl";
  const hwb = mode === "hwb";
  const lab = mode === "lab";
  const lch = mode === "lch";
  const oklab = mode === "oklab";
  const oklch = mode === "oklch";

  const srgb = (value: number): number => value * 255;
  const hundred = (value: number): number => value * 100;
  const percentage = (value: number): string => `${value}%`;
  const angle = (value: number): string => `${value}deg`;

  const a = input[1];
  const c = rgb
    ? srgb(a)
    : hsl || hwb
      ? degree
        ? angle(a)
        : a
      : lab || lch
        ? percent
          ? percentage(a)
          : a
        : oklab || oklch
          ? percent
            ? percentage(hundred(a))
            : a
          : a;

  const i = input[2];
  const t = rgb ? srgb(i) : hsl || hwb ? (percent ? percentage(hundred(i)) : hundred(i)) : i;

  const o = input[3];
  const x = rgb
    ? srgb(o)
    : hsl || hwb
      ? percent
        ? percentage(hundred(o))
        : hundred(o)
      : lch || oklch
        ? degree
          ? angle(o)
          : o
        : o;

  return `${mode}(${[c, t, x].join(" ")})`;
};

export { parseColor, parseCss };
