import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import {
  lrgbToXyz65,
  oklabToXyz65,
  xyz65ToLrgb,
  xyz65ToOklab,
} from '~/adapters/d65';

describe('d65 adapter', () => {
  describe('Linear RGB <-> XYZ D65', () => {
    it('should convert Linear RGB white to XYZ D65', () => {
      const whiteLRGB = [1, 1, 1] as ColorSpace<'lrgb'>;
      const result = lrgbToXyz65(whiteLRGB);
      expect(result[0]).toBeCloseTo(0.95047, 4);
      expect(result[1]).toBeCloseTo(1.0, 4);
      expect(result[2]).toBeCloseTo(1.08883, 4);
    });

    it('should be reversible (LRGB -> XYZ -> LRGB)', () => {
      const original = [0.2, 0.5, 0.8] as ColorSpace<'lrgb'>;
      const xyz = lrgbToXyz65(original);
      const back = xyz65ToLrgb(xyz);
      expect(back[0]).toBeCloseTo(original[0], 5);
      expect(back[1]).toBeCloseTo(original[1], 5);
      expect(back[2]).toBeCloseTo(original[2], 5);
    });
  });

  describe('OKLab <-> XYZ D65', () => {
    it('should convert XYZ D65 white to OKLab white', () => {
      const result = xyz65ToOklab([
        0.95047, 1.0, 1.08883,
      ] as ColorSpace<'xyz65'>);
      expect(result[0]).toBeCloseTo(1, 4);
      expect(result[1]).toBeCloseTo(0, 4);
      expect(result[2]).toBeCloseTo(0, 3);
    });

    it('should convert OKLab black to XYZ black', () => {
      const result = oklabToXyz65([0, 0, 0] as ColorSpace<'oklab'>);
      expect(result).toEqual([0, 0, 0]);
    });

    it('should be reversible (OKLab -> XYZ -> OKLab)', () => {
      const original = [0.5, 0.1, -0.1] as ColorSpace<'oklab'>;
      const xyz = oklabToXyz65(original);
      const back = xyz65ToOklab(xyz);
      expect(back[0]).toBeCloseTo(original[0], 5);
      expect(back[1]).toBeCloseTo(original[1], 5);
      expect(back[2]).toBeCloseTo(original[2], 5);
    });

    it('should maintain lightness L for XYZ Y=1', () => {
      const result = xyz65ToOklab([
        0.95047, 1.0, 1.08883,
      ] as ColorSpace<'xyz65'>);
      expect(result[0]).toBeCloseTo(1, 4);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle zero values without NaN', () => {
      const result = xyz65ToOklab([0, 0, 0] as ColorSpace<'xyz65'>);
      expect(result).not.toContain(NaN);
      expect(result).toEqual([0, 0, 0]);
    });

    it('should handle very small values near zero', () => {
      const small = [0.0001, 0.0001, 0.0001] as ColorSpace<'xyz65'>;
      const oklab = xyz65ToOklab(small);
      const back = oklabToXyz65(oklab);
      expect(back[0]).toBeCloseTo(small[0], 6);
    });
  });
});
