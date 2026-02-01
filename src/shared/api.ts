import type { Color, ColorArray, ColorSpace } from '~/types';
import { formatCss } from '~/format';
import { parseColor } from '~/parse';
import { createBuffer, deriveColor, updateColor } from '~/utils';

interface ColorApi {
  readonly space: ColorSpace;
  readonly value: Float32Array;
  to(space: ColorSpace): ColorApi;
  update(values: Float32Array | number[]): ColorApi;
  format(alpha?: number, asHex?: boolean, precision?: number): string;
  clone(): ColorApi;
  raw(): Color;
}

const SPACES = new Set(['rgb', 'hsl', 'hwb', 'lab', 'lch', 'oklab', 'oklch']);

const ColorProto = {
  to(targetSpace: ColorSpace) {
    return sidechain(deriveColor(this.raw(), targetSpace));
  },

  update(values: Float32Array | number[]) {
    const fresh = deriveColor(this.raw(), this.space);
    updateColor(fresh, values as ColorArray);
    return sidechain(fresh);
  },

  format(alpha?: number, asHex?: boolean, precision?: number) {
    return formatCss(this.raw(), alpha, asHex, precision);
  },

  clone() {
    return sidechain(deriveColor(this.raw(), this.space));
  },

  raw() {
    return { space: this.space, value: this.value };
  },
} as ColorApi;

const sidechain = (color: Color): ColorApi => {
  const instance = Object.create(ColorProto);

  Object.defineProperties(instance, {
    space: { value: color.space, enumerable: true },
    value: { value: color.value, enumerable: true },
  });
  return instance;
};

export function color(input: string): ColorApi;
export function color(
  space: ColorSpace,
  values: Float32Array | number[],
): ColorApi;
export function color(
  arg1: string | ColorSpace,
  arg2?: Float32Array | number[],
): ColorApi {
  if (arg2 !== undefined) {
    return sidechain({
      space: arg1 as ColorSpace,
      value: createBuffer(arg2) as ColorArray,
    });
  }

  if (SPACES.has(arg1)) {
    throw new Error('Color values are required when space is provided');
  }

  return sidechain(parseColor(arg1));
}
