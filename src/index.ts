export * from './types';

export {
  createColor,
  mutateColor,
  deriveColor,
  cloneColor,
  updateColor,
  createBuffer,
} from './utils';

export { convertColor } from './convert';
export { parseColor } from './parse';
export { formatCss } from './format';

import * as compare from './shared/compare';
import * as contrast from './shared/contrast';
import * as gamut from './shared/gamut';
import * as palette from './shared/palette';
import * as simulate from './shared/simulate';

export { compare, contrast, gamut, palette, simulate };

export { isEqual, getDistance } from './shared/compare';
export { checkContrast, matchContrast } from './shared/contrast';
export { checkGamut, clampColor } from './shared/gamut';
export {
  createHarmony,
  createShades,
  createScales,
  mixColor,
} from './shared/palette';
export { simulateDeficiency } from './shared/simulate';
