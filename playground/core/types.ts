export type ColorSpace =
  | 'rgb'
  | 'hsl'
  | 'hsv'
  | 'hwb'
  | 'lab'
  | 'lch'
  | 'lrgb'
  | 'oklab'
  | 'oklch'
  | 'xyz50'
  | 'xyz65';

export type ColorMode = Exclude<ColorSpace, 'lrgb' | 'xyz50' | 'xyz65'>;

export type ColorBuffer = Float32Array & {
  readonly length: 3;
};

export type ColorMatrix = readonly [ColorBuffer, ColorBuffer, ColorBuffer];

export interface ColorState {
  readonly values: ColorBuffer;
  mode: ColorMode;
}
