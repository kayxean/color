import { bench, describe } from 'vitest';
import { formatCss } from '~/format';
import { color } from '~/index';
import { parseColor } from '~/parse';
import { getDistance, isEqual } from '~/shared/compare';
import { checkContrast, matchContrast } from '~/shared/contrast';
import { checkGamut, clampColor } from '~/shared/gamut';
import { createHarmony, createScales, createShades } from '~/shared/palette';
import { simulateDeficiency } from '~/shared/simulate';
import { createColor, deriveColor, mutateColor } from '~/utils';

describe('Color API Benchmarks', () => {
  describe('Creating and Mutating', () => {
    bench('mutate in-place and derive new copies', () => {
      const red = createColor('rgb', [1, 0, 0]);
      mutateColor(red, 'oklch');
      deriveColor(red, 'hsl');
    });
  });

  describe('Reading and Writing CSS', () => {
    bench('parse oklab and format back', () => {
      const css = 'oklab(62% -0.07 -0.15)';
      const c = parseColor(css);
      formatCss(c);
    });
  });

  describe('Contrast & Accessibility', () => {
    const text = parseColor('#ff0000');
    const bg = parseColor('#000000');

    bench('calculate APCA and match contrast targets', () => {
      checkContrast(text, bg);
      matchContrast(text, bg, 60);
    });
  });

  describe('Making things look nice (Palettes)', () => {
    const blue = parseColor('#0000ff');
    const red = parseColor('#ff0000');
    const black = parseColor('#000000');

    bench('generate harmonies, shades, and scales', () => {
      createHarmony(blue, [{ name: 'analogous', ratios: [-30, 30] }]);
      createShades(red, black, 5);
      createScales([red, parseColor('#ffff00'), parseColor('#00ff00')], 7);
    });
  });

  describe('Safety and Comparison', () => {
    const outOfGamut = createColor('rgb', [1.2, -0.1, 0.5]);
    const r1 = parseColor('#ff0000');
    const r2 = parseColor('#ee0000');
    const hslRed = parseColor('hsl(0, 100%, 50%)');

    bench('validate gamut and handle comparisons', () => {
      checkGamut(outOfGamut);
      clampColor(outOfGamut);
      getDistance(r1, r2);
      isEqual(r1, hslRed);
    });
  });

  describe('Accessibility Simulation', () => {
    const brand = parseColor('#32cd32');

    bench('simulate protanopia', () => {
      simulateDeficiency(brand, 'protanopia');
    });
  });
});

describe('Public API (color factory)', () => {
  bench('create wrapper from CSS string', () => {
    color('rgb(255, 0, 0)');
  });

  bench('create wrapper from space and values', () => {
    color('hsl', [180, 1, 0.5]);
  });

  bench('fluent conversion and formatting', () => {
    color('rgb(255, 0, 0)').to('hsl').format(0.5, false, 0);
  });

  bench('updating values immutably', () => {
    const c1 = color('rgb', [1, 0, 0]);
    c1.update([0, 1, 0]);
  });

  bench('cloning', () => {
    const c1 = color('lab', [50, 20, 20]);
    c1.clone();
  });
});
