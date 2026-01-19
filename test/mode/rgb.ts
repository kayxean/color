import type { ColorFormat } from "../types";

const rgbToHex = (input: ColorFormat<"rgb">, denote = false): string => {
  const hex = ((1 << 24) | (input[1] << 16) | (input[2] << 8) | input[3]).toString(16).slice(1);
  return denote ? hex : `#${hex}`;
};

const hexToRgb = (input: string): ColorFormat<"rgb"> => {
  const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(input) as [string, string, string, string] | null;

  if (!hex) {
    return ["rgb", 0, 0, 0] as ColorFormat<"rgb">;
  }

  const r = Number.parseInt(hex[1], 16);
  const g = Number.parseInt(hex[2], 16);
  const b = Number.parseInt(hex[3], 16);

  return ["rgb", r, g, b] as ColorFormat<"rgb">;
};

export { rgbToHex, hexToRgb };
