type ColorKind = 'rgb' | 'hsl' | 'hsv' | 'hwb' | 'lab' | 'lch' | 'lrgb' | 'oklab' | 'oklch' | 'xyz50' | 'xyz65';

export type ColorMode = Exclude<ColorKind, 'hsv' | 'lrgb' | 'xyz50' | 'xyz65'>;

export type ColorHue = Exclude<ColorMode, 'rgb' | 'lab' | 'oklab'>;

export type ColorValues = [number, number, number];

export type ColorMatrix = [ColorValues, ColorValues, ColorValues];

declare const __mode: unique symbol;

export type ColorSpace<T extends ColorKind> = ColorValues & {
  [__mode]: T;
};

export type ColorFn<T extends ColorKind, X extends Exclude<ColorKind, T>> = (input: ColorSpace<T>) => ColorSpace<X>;
