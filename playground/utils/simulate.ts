import type { ColorState } from '../core/types';
import { xyz50ToXyz65, xyz65ToXyz50 } from '../adapters/cat';
import { applyAdapter, FROM_HUB, NATIVE_HUB, TO_HUB } from '../core/convert';
import { createBuffer, createColor } from '../core/shared';
import { clampColor } from './gamut';

export type DeficiencyType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';

const SIM_HUB_SCRATCH = createBuffer(3);
const SIM_RES_SCRATCH = createBuffer(3);

export function simulateDeficiency(
  state: ColorState,
  type: DeficiencyType,
): ColorState {
  const { mode, values } = state;

  applyAdapter(TO_HUB[mode], values, SIM_HUB_SCRATCH);

  if (NATIVE_HUB[mode] === 'xyz50') {
    xyz50ToXyz65(SIM_HUB_SCRATCH, SIM_HUB_SCRATCH);
  }

  const x = SIM_HUB_SCRATCH[0];
  const y = SIM_HUB_SCRATCH[1];
  const z = SIM_HUB_SCRATCH[2];

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

  SIM_HUB_SCRATCH[0] = rx;
  SIM_HUB_SCRATCH[1] = ry;
  SIM_HUB_SCRATCH[2] = rz;

  if (NATIVE_HUB[mode] === 'xyz50') {
    xyz65ToXyz50(SIM_HUB_SCRATCH, SIM_HUB_SCRATCH);
  }

  applyAdapter(FROM_HUB[mode], SIM_HUB_SCRATCH, SIM_RES_SCRATCH);

  const s = createColor(createBuffer(3), mode);
  s.values.set(SIM_RES_SCRATCH);

  return clampColor(s);
}
