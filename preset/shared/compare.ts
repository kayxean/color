import type { Color, ColorBuffer } from '../types';
import { convertColor } from '../convert';
import { createBuffer } from '../utils';

const COMPARE_SCRATCH_B = createBuffer(new Float32Array(3));
const DISTANCE_SCRATCH_A = createBuffer(new Float32Array(3));
const DISTANCE_SCRATCH_B = createBuffer(new Float32Array(3));

export function isEqual(a: Color, b: Color, tolerance = 0): boolean {
  if (a.value === b.value && a.space === b.space) return true;

  const valA: ColorBuffer = a.value;
  let valB: ColorBuffer = b.value;

  if (a.space !== b.space) {
    convertColor(b.value, COMPARE_SCRATCH_B, b.space, a.space);
    valB = COMPARE_SCRATCH_B;
  }

  for (let i = 0; i < 3; i++) {
    if (Math.abs(valA[i] - valB[i]) > tolerance) return false;
  }

  return true;
}

export function getDistance(a: Color, b: Color): number {
  const spaceA = a.space;
  const spaceB = b.space;

  const labA = spaceA === 'oklab' ? a.value : DISTANCE_SCRATCH_A;
  if (spaceA !== 'oklab') {
    convertColor(a.value, DISTANCE_SCRATCH_A, spaceA, 'oklab');
  }

  const labB = spaceB === 'oklab' ? b.value : DISTANCE_SCRATCH_B;
  if (spaceB !== 'oklab') {
    convertColor(b.value, DISTANCE_SCRATCH_B, spaceB, 'oklab');
  }

  const dL = labA[0] - labB[0];
  const da = labA[1] - labB[1];
  const db = labA[2] - labB[2];

  return Math.sqrt(dL * dL + da * da + db * db);
}
