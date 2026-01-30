import { describe, expect, it } from 'vitest';
import { getDistance, isEqual } from '../../src/shared/compare';
import { createColor } from '../../src/utils';

describe('Color Comparison (Similarity & Distance)', () => {
  describe('isEqual', () => {
    it('should return true for identical memory references', () => {
      const a = createColor('rgb', [1, 0, 0]);
      expect(isEqual(a, a)).toBe(true);
    });

    it('should return true for identical values in the same space', () => {
      const a = createColor('rgb', [1, 0, 0]);
      const b = createColor('rgb', [1, 0, 0]);
      expect(isEqual(a, b)).toBe(true);
    });

    it('should return true for equivalent colors in different spaces', () => {
      const rgb = createColor('rgb', [1, 1, 1]);
      const hsv = createColor('hsv', [0, 0, 1]);
      expect(isEqual(rgb, hsv, 0.001)).toBe(true);
    });

    it('should return false for different colors', () => {
      const red = createColor('rgb', [1, 0, 0]);
      const blue = createColor('rgb', [0, 0, 1]);
      expect(isEqual(red, blue)).toBe(false);
    });
  });

  describe('getDistance (Oklab ΔE)', () => {
    it('should return 0 for the same color', () => {
      const a = createColor('rgb', [0.5, 0.5, 0.5]);
      expect(getDistance(a, a)).toBe(0);
    });

    it('should calculate perceptual distance correctly', () => {
      const black = createColor('rgb', [0, 0, 0]);
      const white = createColor('rgb', [1, 1, 1]);

      const dist = getDistance(black, white);
      expect(dist).toBeCloseTo(1.0, 5);
    });

    it('should work between different source spaces (HSL and Lab)', () => {
      const hslRed = createColor('hsl', [0, 1, 0.5]);
      const labRed = createColor('lab', [53.2, 80.1, 67.2]);

      const dist = getDistance(hslRed, labRed);
      expect(dist).toBeLessThan(0.1);
    });
  });
});
