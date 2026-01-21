import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import { checkGamut, clampColor } from '~/utils/gamut';

describe('gamut utils', () => {
  describe('checkGamut', () => {
    it('should return true for colors within valid sRGB range', () => {
      const color = [0.5, 0.5, 0.5] as ColorSpace<'rgb'>;
      expect(checkGamut(color, 'rgb')).toBe(true);
    });

    it('should return false for colors outside sRGB range', () => {
      const color = [1.1, 0, 0] as ColorSpace<'rgb'>;
      expect(checkGamut(color, 'rgb')).toBe(false);
    });

    it('should respect tolerance for marginal out-of-gamut values', () => {
      const color = [1.005, 0, 0] as ColorSpace<'rgb'>;
      expect(checkGamut(color, 'rgb', 0)).toBe(false);
      expect(checkGamut(color, 'rgb', 0.01)).toBe(true);
    });

    it('should ignore hue in checkGamut (max === 360)', () => {
      const color = [400, 0.5, 0.5] as ColorSpace<'hsl'>;
      expect(checkGamut(color, 'hsl')).toBe(true);
    });

    it('should validate OKLab specific bounds', () => {
      const valid = [0.5, 0.2, -0.2] as ColorSpace<'oklab'>;
      const invalid = [0.5, 0.5, 0] as ColorSpace<'oklab'>;
      expect(checkGamut(valid, 'oklab')).toBe(true);
      expect(checkGamut(invalid, 'oklab')).toBe(false);
    });
  });

  describe('clampColor', () => {
    it('should clamp standard ranges (0-1)', () => {
      const input = [1.5, -0.2, 0.5] as ColorSpace<'rgb'>;
      const expected = [1, 0, 0.5] as ColorSpace<'rgb'>;
      expect(clampColor(input, 'rgb')).toEqual(expected);
    });

    it('should wrap hue values (circular 360)', () => {
      const input = [400, 0.5, 0.5] as ColorSpace<'hsl'>;
      const result = clampColor(input, 'hsl');
      expect(result[0]).toBe(40);
      const negativeInput = [-30, 0.5, 0.5] as ColorSpace<'hsl'>;
      const negativeResult = clampColor(negativeInput, 'hsl');
      expect(negativeResult[0]).toBe(330);
    });

    it('should handle large multi-rotations for hue', () => {
      const input = [70, 50, 720 + 45] as ColorSpace<'lch'>;
      const result = clampColor(input, 'lch');
      expect(result[2]).toBe(45);
    });

    it('should clamp Lab lightness (0-100) and chromaticity (-128 to 128)', () => {
      const input = [110, 150, -200] as ColorSpace<'lab'>;
      const expected = [100, 128, -128] as ColorSpace<'lab'>;
      expect(clampColor(input, 'lab')).toEqual(expected);
    });

    it('should clamp OKLCH chroma (0-0.4)', () => {
      const input = [0.5, 0.5, 180] as ColorSpace<'oklch'>;
      const result = clampColor(input, 'oklch');
      expect(result[1]).toBe(0.4);
    });
  });
});
