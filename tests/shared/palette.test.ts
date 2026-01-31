import { describe, expect, it } from 'vitest';
import {
  createHarmony,
  createScales,
  createShades,
  mixColor,
} from '~/shared/palette';
import { createColor } from '~/utils';

describe('Palette & Harmony Utilities', () => {
  describe('createHarmony', () => {
    it('should create a complementary harmony', () => {
      const base = createColor('hsl', [0, 1, 0.5]);
      const variants = [{ name: 'comp', ratios: [180] }];
      const [harmony] = createHarmony(base, variants);
      expect(harmony.name).toBe('comp');
      expect(harmony.colors[0].value[0]).toBe(180);
    });

    it('should work with non-polar spaces', () => {
      const base = createColor('rgb', [1, 0, 0]);
      const variants = [{ name: 'analogous', ratios: [30] }];
      const [harmony] = createHarmony(base, variants);
      expect(harmony.colors[0].space).toBe('rgb');
      expect(harmony.colors[0].value[0]).toBeCloseTo(1, 5);
      expect(harmony.colors[0].value[1]).toBeGreaterThan(0.1);
      expect(harmony.colors[0].value[2]).toBe(0);
    });

    it('should handle CIELCH harmony', () => {
      const base = createColor('lab', [50, 20, 20]);
      const variants = [{ name: 'rotate', ratios: [90] }];
      const [harmony] = createHarmony(base, variants);
      expect(harmony.colors[0].space).toBe('lab');
      expect(harmony.colors[0].value[0]).toBeCloseTo(50, 1);
    });

    it('should handle OKLCH harmony', () => {
      const base = createColor('oklch', [0.7, 0.1, 180]);
      const variants = [{ name: 'rotate', ratios: [40] }];
      const [harmony] = createHarmony(base, variants);
      expect(harmony.colors[0].space).toBe('oklch');
      expect(harmony.colors[0].value[2]).toBeCloseTo(220, 5);
    });
  });

  describe('mixColor', () => {
    it('should interpolate linear values correctly', () => {
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

    it('should wrap hues correctly when diff > 180', () => {
      const start = createColor('hsl', [10, 1, 0.5]);
      const end = createColor('hsl', [350, 1, 0.5]);
      const middle = mixColor(start, end, 0.5);
      expect(middle.value[0]).toBe(0);
    });

    it('should identify hue index for OKLCH during mixing', () => {
      const start = createColor('oklch', [0.7, 0.1, 0]);
      const end = createColor('oklch', [0.7, 0.1, 100]);
      const middle = mixColor(start, end, 0.5);
      expect(middle.value[2]).toBe(50);
    });
  });

  describe('createShades', () => {
    it('should generate the correct number of steps', () => {
      const start = createColor('rgb', [0, 0, 0]);
      const end = createColor('rgb', [1, 1, 1]);
      const shades = createShades(start, end, 5);
      expect(shades.length).toBe(5);
      expect(shades[2].value[0]).toBe(0.5);
    });

    it('should return only the start color if steps is 1 or less', () => {
      const start = createColor('rgb', [1, 0, 0]);
      const end = createColor('rgb', [0, 0, 1]);
      const singleStep = createShades(start, end, 1);
      const zeroSteps = createShades(start, end, 0);
      expect(singleStep).toHaveLength(1);
      expect(singleStep[0].value).toEqual(start.value);
      expect(zeroSteps).toHaveLength(1);
      expect(zeroSteps[0].value).toEqual(start.value);
    });
  });

  describe('createScales', () => {
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

    it('should handle scales with fewer than two stops', () => {
      const singleStop = [createColor('rgb', [1, 0, 0])];
      const result = createScales(singleStop, 5);
      expect(result).toHaveLength(1);
      expect(result[0].value).toEqual(singleStop[0].value);
      expect(result[0].value).not.toBe(singleStop[0].value);
    });
  });
});
