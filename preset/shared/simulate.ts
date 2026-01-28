import type { Color, ColorArray } from '../types';
import { xyz50ToXyz65, xyz65ToXyz50 } from '../adapters/cat';
import { applyAdapter, FROM_HUB, NATIVE_HUB, TO_HUB } from '../convert';
import { createBuffer } from '../utils';
import { clampColor } from './gamut';

export type DeficiencyType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';

const SIM_HUB_SCRATCH = createBuffer(new Float32Array(3));
const SIM_RES_SCRATCH = createBuffer(new Float32Array(3));

export function simulateDeficiency(color: Color, type: DeficiencyType): Color {
  const { space, value } = color;

  applyAdapter(TO_HUB[space], value, SIM_HUB_SCRATCH);

  if (NATIVE_HUB[space] === 'xyz50') {
    xyz50ToXyz65(SIM_HUB_SCRATCH, SIM_HUB_SCRATCH);
  }

  const x = SIM_HUB_SCRATCH[0];
  const y = SIM_HUB_SCRATCH[1];
  const z = SIM_HUB_SCRATCH[2];

  let rx = x,
    ry = y,
    rz = z;

  switch (type) {
    case 'protanopia':
      rx = 0.112 * x + 0.888 * y;
      ry = 0.112 * x + 0.888 * y;
      rz = -0.001 * x + 0.001 * y + z;
      break;
    case 'deuteranopia':
      rx = 0.292 * x + 0.708 * y;
      ry = 0.292 * x + 0.708 * y;
      rz = -0.022 * x + 0.022 * y + z;
      break;
    case 'tritanopia':
      rx = 1.012 * x + 0.052 * y - 0.064 * z;
      ry = 0.877 * y + 0.123 * z;
      rz = 0.877 * y + 0.123 * z;
      break;
    case 'achromatopsia':
      rx = ry = rz = y;
      break;
  }

  SIM_HUB_SCRATCH[0] = rx;
  SIM_HUB_SCRATCH[1] = ry;
  SIM_HUB_SCRATCH[2] = rz;

  if (NATIVE_HUB[space] === 'xyz50') {
    xyz65ToXyz50(SIM_HUB_SCRATCH, SIM_HUB_SCRATCH);
  }

  applyAdapter(FROM_HUB[space], SIM_HUB_SCRATCH, SIM_RES_SCRATCH);

  const resValue = new Float32Array(SIM_RES_SCRATCH) as ColorArray<
    typeof space
  >;
  const result: Color = { space, value: resValue };

  return clampColor(result);
}
