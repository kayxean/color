import type { ColorFormat, ColorMode } from "../types";
import { colorKind } from "./gamut";

const createParams = <T extends ColorMode>(input: ColorFormat<T>): string => {
  const mode = input[0];
  let c = input[1];
  let t = input[2];
  let x = input[3];

  if (mode === "rgb") {
    c *= 255;
    t *= 255;
    x *= 255;
  } else if (mode === "hsl" || mode === "hwb") {
    t *= 100;
    x *= 100;
  }

  return [`?${mode}=`, c, ",", t, ",", x].join("");
};

const getParams = (request: URLSearchParams, onError?: () => void): [ColorMode, string] => {
  for (const mode of colorKind) {
    const values = request.get(mode);
    if (values) {
      return [mode, values];
    }
  }

  if (onError && typeof onError === "function") {
    onError();
  }

  return ["rgb", "null"];
};

const getValues = (param: string): number[] => {
  const values: number[] = [];
  const parts = param.split(",");

  for (const part of parts) {
    let parse = Number.parseFloat(part);
    if (Number.isNaN(parse)) {
      parse = 0;
    }
    values.push(parse);
  }

  return values;
};

const getColor = <T extends ColorMode>(mode: T, values: number[]): ColorFormat<T> => {
  let c = values[0] || 0;
  let t = values[1] || 0;
  let x = values[2] || 0;

  if (mode === "rgb") {
    c /= 255;
    t /= 255;
    x /= 255;
  } else if (mode === "hsl" || mode === "hwb") {
    t /= 100;
    x /= 100;
  }

  return [mode, c, t, x] as ColorFormat<T>;
};

export { createParams, getParams, getValues, getColor };
