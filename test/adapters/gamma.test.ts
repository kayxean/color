import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import { lrgbToRgb, rgbToLrgb } from '~/adapters/gamma';

describe('gamma adapter (sRGB Transfer Function)', () => {
  describe('rgbToLrgb (Linearization)', () => {
    it('should handle the linear segment (c <= 0.04045)', () => {
      const result = rgbToLrgb([0.04, 0.04, 0.04] as ColorSpace<'rgb'>);
      expect(result[0]).toBeCloseTo(0.0030959, 6);
    });

    it('should handle the power segment (c > 0.04045)', () => {
      const result = rgbToLrgb([0.5, 0.5, 0.5] as ColorSpace<'rgb'>);
      expect(result[0]).toBeCloseTo(0.214041, 6);
    });

    it('should map 1.0 to 1.0', () => {
      const result = rgbToLrgb([1, 1, 1] as ColorSpace<'rgb'>);
      expect(result).toEqual([1, 1, 1]);
    });

    it('should map 0.0 to 0.0', () => {
      const result = rgbToLrgb([0, 0, 0] as ColorSpace<'rgb'>);
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('lrgbToRgb (Companding)', () => {
    it('should handle the linear segment (l <= 0.0031308)', () => {
      const input = [0.003, 0.003, 0.003] as ColorSpace<'lrgb'>;
      const result = lrgbToRgb(input);
      expect(result[0]).toBeCloseTo(0.03876, 5);
    });

    it('should handle the power segment (l > 0.0031308)', () => {
      const input = [0.214041, 0.214041, 0.214041] as ColorSpace<'lrgb'>;
      const result = lrgbToRgb(input);
      expect(result[0]).toBeCloseTo(0.5, 5);
    });

    it('should clamp negative values to 0 before processing', () => {
      const result = lrgbToRgb([-0.5, -0.5, -0.5] as ColorSpace<'lrgb'>);
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('Round-tripping', () => {
    it('should be reversible across the entire range', () => {
      const testValues = [0, 0.01, 0.04045, 0.05, 0.5, 0.9, 1];
      testValues.forEach((val) => {
        const input = [val, val, val] as ColorSpace<'rgb'>;
        const linear = rgbToLrgb(input);
        const back = lrgbToRgb(linear);
        expect(back[0]).toBeCloseTo(val, 6);
      });
    });
  });
});
