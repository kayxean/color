import type { ColorMode, ColorSpace } from '../core/types';
import { xyz50ToXyz65, xyz65ToXyz50 } from '../adapters/cat';
import { FROM_HUB, NATIVE_HUB, TO_HUB } from '../core/convert';

export type DeficiencyType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';

export const simulateDeficiency = <T extends ColorMode>(
  color: ColorSpace<T>,
  mode: T,
  type: DeficiencyType,
): ColorSpace<T> => {
  let hub = TO_HUB[mode](color);

  if (NATIVE_HUB[mode] === 'xyz50') {
    hub = xyz50ToXyz65(hub as ColorSpace<'xyz50'>);
  }

  const [x, y, z] = hub as ColorSpace<'xyz65'>;
  let rx = x;
  let ry = y;
  let rz = z;

  if (type === 'protanopia') {
    rx = 0.112 * x + 0.888 * y;
    ry = 0.112 * x + 0.888 * y;
    rz = -0.001 * x + 0.001 * y + z;
  } else if (type === 'deuteranopia') {
    rx = 0.292 * x + 0.708 * y;
    ry = 0.292 * x + 0.708 * y;
    rz = -0.022 * x + 0.022 * y + z;
  } else if (type === 'tritanopia') {
    rx = 1.012 * x + 0.052 * y - 0.064 * z;
    ry = 0.877 * y + 0.123 * z;
    rz = 0.877 * y + 0.123 * z;
  } else if (type === 'achromatopsia') {
    rx = y;
    ry = y;
    rz = y;
  }

  let res = [rx, ry, rz] as ColorSpace<'xyz50' | 'xyz65'>;

  if (NATIVE_HUB[mode] === 'xyz50') {
    res = xyz65ToXyz50(res as ColorSpace<'xyz65'>);
  }

  return FROM_HUB[mode](res);
};
