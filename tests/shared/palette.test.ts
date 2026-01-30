import { describe, expect, it } from 'vitest';
import {
  createHarmony,
  createScales,
  createShades,
  mixColor,
} from '../../src/shared/palette';
import { createColor } from '../../src/utils';

describe('Palette & Harmony Utilities', () => {
  describe('mixColor (Interpolation)', () => {
    it('should interpolate linear values (RGB) correctly', () => {
      const red = createColor('rgb', [1, 0, 0]);
      const blue = createColor('rgb', [0, 0, 1]);

      const middle = mixColor(red, blue, 0.5);
      expect(middle.value[0]).toBe(0.5);
      expect(middle.value[2]).toBe(0.5);
    });

    it('should take the shortest path for Hues', () => {
      const start = createColor('hsl', [350, 1, 0.5]);
      const end = createColor('hsl', [10, 1, 0.5]);

      const middle = mixColor(start, end, 0.5);
      expect(middle.value[0]).toBe(0);
    });

    it('should clamp t-weight between 0 and 1', () => {
      const start = createColor('rgb', [0, 0, 0]);
      const end = createColor('rgb', [1, 1, 1]);

      expect(mixColor(start, end, -5).value[0]).toBe(0);
      expect(mixColor(start, end, 5).value[0]).toBe(1);
    });
  });

  describe('createHarmony', () => {
    it('should create a complementary harmony (180deg)', () => {
      const base = createColor('hsl', [0, 1, 0.5]);
      const variants = [{ name: 'comp', ratios: [180] }];

      const [harmony] = createHarmony(base, variants);
      expect(harmony.name).toBe('comp');
      expect(harmony.colors[0].value[0]).toBe(180);
    });

    it('should work with non-polar spaces (RGB -> HSL Harmony)', () => {
      const base = createColor('rgb', [1, 0, 0]);
      const variants = [{ name: 'analogous', ratios: [30] }];

      const [harmony] = createHarmony(base, variants);

      expect(harmony.colors[0].space).toBe('rgb');
      expect(harmony.colors[0].value[0]).toBeCloseTo(1, 5);
      expect(harmony.colors[0].value[1]).toBeGreaterThan(0.1);
      expect(harmony.colors[0].value[2]).toBe(0);
    });
  });

  describe('createShades & createScales', () => {
    it('should generate the correct number of steps in a shade', () => {
      const start = createColor('rgb', [0, 0, 0]);
      const end = createColor('rgb', [1, 1, 1]);
      const steps = 5;

      const shades = createShades(start, end, steps);
      expect(shades.length).toBe(steps);
      expect(shades[2].value[0]).toBe(0.5);
    });

    it('should generate a multi-stop scale', () => {
      const stops = [
        createColor('rgb', [1, 0, 0]),
        createColor('rgb', [0, 1, 0]),
        createColor('rgb', [0, 0, 1]),
      ];

      const scale = createScales(stops, 3);
      expect(scale.length).toBe(3);
      expect(scale[0].value).toEqual(stops[0].value);
      expect(scale[1].value).toEqual(stops[1].value);
      expect(scale[2].value).toEqual(stops[2].value);
    });
  });
});
