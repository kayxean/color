export type ColorSpace =
  | 'rgb'
  | 'hsv'
  | 'hsl'
  | 'hwb'
  | 'lab'
  | 'lch'
  | 'oklab'
  | 'oklch';

export type ColorBuffer = Float32Array & {
  readonly __length: 3;
};

export type ColorArray<S extends ColorSpace = ColorSpace> = ColorBuffer & {
  readonly __space: S;
};

export type Color = {
  space: ColorSpace;
  value: ColorArray;
};

export type ColorAdapter = (input: ColorBuffer, output: ColorBuffer) => void;

export type ColorMatrix = readonly [ColorBuffer, ColorBuffer, ColorBuffer];
