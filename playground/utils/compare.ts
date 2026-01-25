import type { ColorState } from '../core/types';
import { convertColor } from '../core/convert';
import { createBuffer } from '../core/shared';

const COMPARE_SCRATCH_B = createBuffer(3);
const DISTANCE_SCRATCH_A = createBuffer(3);
const DISTANCE_SCRATCH_B = createBuffer(3);

export function isEqual(a: ColorState, b: ColorState, tolerance = 0): boolean {
  if (a.values === b.values && a.mode === b.mode) return true;

  const valA = a.values;
  let valB = b.values;

  if (a.mode !== b.mode) {
    convertColor(b.values, COMPARE_SCRATCH_B, b.mode, a.mode);
    valB = COMPARE_SCRATCH_B;
  }

  for (let i = 0; i < 3; i++) {
    if (Math.abs(valA[i] - valB[i]) > tolerance) return false;
  }

  return true;
}

export function getDistance(a: ColorState, b: ColorState): number {
  const modeA = a.mode;
  const modeB = b.mode;

  const labA = modeA === 'oklab' ? a.values : DISTANCE_SCRATCH_A;
  if (modeA !== 'oklab') {
    convertColor(a.values, labA, modeA, 'oklab');
  }

  const labB = modeB === 'oklab' ? b.values : DISTANCE_SCRATCH_B;
  if (modeB !== 'oklab') {
    convertColor(b.values, labB, modeB, 'oklab');
  }

  const dL = labA[0] - labB[0];
  const da = labA[1] - labB[1];
  const db = labA[2] - labB[2];

  return Math.sqrt(dL * dL + da * da + db * db);
}
