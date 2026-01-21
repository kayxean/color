import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import { getDistance, isEqual } from '~/utils/compare';

describe('compare utils', () => {
  describe('isEqual', () => {
    it('should return true for identical colors in the same mode', () => {
      const colorA = [1, 0, 0] as ColorSpace<'rgb'>;
      const colorB = [1, 0, 0] as ColorSpace<'rgb'>;
      expect(isEqual(colorA, 'rgb', colorB, 'rgb')).toBe(true);
    });

    it('should respect the tolerance parameter in same-mode comparison', () => {
      const colorA = [0.5, 0.5, 0.5] as ColorSpace<'rgb'>;
      const colorB = [0.501, 0.501, 0.501] as ColorSpace<'rgb'>;
      expect(isEqual(colorA, 'rgb', colorB, 'rgb', 0)).toBe(false);
      expect(isEqual(colorA, 'rgb', colorB, 'rgb', 0.01)).toBe(true);
    });

    it('should return true for equivalent colors in different modes', () => {
      const colorRGB = [1, 0, 0] as ColorSpace<'rgb'>;
      const colorHSL = [0, 1, 0.5] as ColorSpace<'hsl'>;
      expect(isEqual(colorRGB, 'rgb', colorHSL, 'hsl', 0.001)).toBe(true);
    });

    it('should return false for different colors in different modes', () => {
      const colorRGB = [1, 0, 0] as ColorSpace<'rgb'>;
      const colorHSL = [240, 1, 0.5] as ColorSpace<'hsl'>;
      expect(isEqual(colorRGB, 'rgb', colorHSL, 'hsl')).toBe(false);
    });
  });

  describe('getDistance', () => {
    it('should return 0 for the same color', () => {
      const color = [0.2, 0.4, 0.6] as ColorSpace<'rgb'>;
      expect(getDistance(color, 'rgb', color, 'rgb')).toBe(0);
    });

    it('should calculate distance between two different colors', () => {
      const white = [1, 1, 1] as ColorSpace<'rgb'>;
      const black = [0, 0, 0] as ColorSpace<'rgb'>;
      const distance = getDistance(white, 'rgb', black, 'rgb');
      expect(distance).toBeCloseTo(1, 2);
    });

    it('should work between different color modes (RGB vs OKLab)', () => {
      const redRgb = [1, 0, 0] as ColorSpace<'rgb'>;
      const redOklab = [0.627955, 0.224863, 0.125846] as ColorSpace<'oklab'>;
      const distance = getDistance(redRgb, 'rgb', redOklab, 'oklab');
      expect(distance).toBeLessThan(0.001);
    });

    it('should show larger distance for perceptually different colors', () => {
      const red = [1, 0, 0] as ColorSpace<'rgb'>;
      const darkRed = [0.5, 0, 0] as ColorSpace<'rgb'>;
      const blue = [0, 0, 1] as ColorSpace<'rgb'>;
      const dRedVsDarkRed = getDistance(red, 'rgb', darkRed, 'rgb');
      const dRedVsBlue = getDistance(red, 'rgb', blue, 'rgb');
      expect(dRedVsBlue).toBeGreaterThan(dRedVsDarkRed);
    });
  });
});
