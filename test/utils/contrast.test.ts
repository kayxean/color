import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import {
  checkContrast,
  checkContrastBulk,
  getContrastRating,
  getLuminanceD65,
  matchContrast,
  matchScales,
} from '~/utils/contrast';

describe('contrast utils', () => {
  describe('getLuminanceD65', () => {
    it('should return 1 for white and 0 for black', () => {
      expect(
        getLuminanceD65([1, 1, 1] as ColorSpace<'rgb'>, 'rgb'),
      ).toBeCloseTo(1, 5);
      expect(getLuminanceD65([0, 0, 0] as ColorSpace<'rgb'>, 'rgb')).toBe(0);
    });

    it('should handle cross-hub conversion for Lab (D50 -> D65)', () => {
      const lum = getLuminanceD65([100, 0, 0] as ColorSpace<'lab'>, 'lab');
      expect(lum).toBeCloseTo(1, 2);
    });
  });

  describe('checkContrast (APCA)', () => {
    it('should return 0 for identical colors', () => {
      const color = [0.5, 0.5, 0.5] as ColorSpace<'rgb'>;
      expect(checkContrast(color, color, 'rgb')).toBe(0);
    });

    it('should return a negative value for light text on dark background', () => {
      const white = [1, 1, 1] as ColorSpace<'rgb'>;
      const black = [0, 0, 0] as ColorSpace<'rgb'>;
      const contrast = checkContrast(white, black, 'rgb');
      expect(contrast).toBeLessThan(0);
      expect(Math.abs(contrast)).toBeGreaterThan(100);
    });

    it('should return a positive value for dark text on light background', () => {
      const black = [0, 0, 0] as ColorSpace<'rgb'>;
      const white = [1, 1, 1] as ColorSpace<'rgb'>;
      const contrast = checkContrast(black, white, 'rgb');
      expect(contrast).toBeGreaterThan(0);
      expect(contrast).toBeGreaterThan(100);
    });
  });

  describe('getContrastRating', () => {
    it('should return appropriate labels for contrast levels', () => {
      expect(getContrastRating(105)).toBe('platinum');
      expect(getContrastRating(-80)).toBe('gold');
      expect(getContrastRating(65)).toBe('silver');
      expect(getContrastRating(50)).toBe('bronze');
      expect(getContrastRating(35)).toBe('ui');
      expect(getContrastRating(10)).toBe('fail');
    });
  });

  describe('matchContrast', () => {
    it('should not change color if target contrast is already met', () => {
      const black = [0, 0, 0] as ColorSpace<'rgb'>;
      const white = [1, 1, 1] as ColorSpace<'rgb'>;
      const result = matchContrast(black, white, 'rgb', 60);
      expect(result).toEqual(black);
    });

    it('should adjust lightness to meet target contrast on dark background', () => {
      const background = [0.1, 0.1, 0.1] as ColorSpace<'rgb'>;
      const text = [0.2, 0.2, 0.2] as ColorSpace<'rgb'>;
      const target = 60;
      const adjusted = matchContrast(text, background, 'rgb', target);
      const newContrast = checkContrast(adjusted, background, 'rgb');
      expect(Math.abs(newContrast)).toBeGreaterThanOrEqual(target);
      expect(adjusted[0]).toBeGreaterThan(text[0]);
    });

    it('should adjust lightness to meet target contrast on light background', () => {
      const background = [0.9, 0.9, 0.9] as ColorSpace<'rgb'>;
      const text = [0.8, 0.8, 0.8] as ColorSpace<'rgb'>;
      const target = 45;
      const adjusted = matchContrast(text, background, 'rgb', target);
      const newContrast = checkContrast(adjusted, background, 'rgb');
      expect(Math.abs(newContrast)).toBeGreaterThanOrEqual(target);
      expect(adjusted[0]).toBeLessThan(text[0]);
    });

    it("should adjust lightness in 'oklch' mode", () => {
      const background = [0.9, 0.2, 200] as ColorSpace<'oklch'>;
      const text = [0.8, 0.2, 200] as ColorSpace<'oklch'>;
      const target = 45;
      const adjusted = matchContrast(text, background, 'oklch', target);
      const newContrast = checkContrast(adjusted, background, 'oklch');
      expect(Math.abs(newContrast)).toBeGreaterThanOrEqual(target);
      expect(adjusted[0]).toBeLessThan(text[0]);
    });
  });

  describe('checkContrastBulk', () => {
    it('should return the correct contrast and rating for a given set of colors', () => {
      const background = [0.9, 0.9, 0.9] as ColorSpace<'rgb'>;
      const colors = [
        [0.1, 0.1, 0.1],
        [0.5, 0.5, 0.5],
      ] as ColorSpace<'rgb'>[];
      const result = checkContrastBulk(background, colors, 'rgb');
      expect(result).toHaveLength(2);
      expect(result[0].contrast).toBeGreaterThan(60);
      expect(result[0].rating).toBe('platinum');
      expect(result[1].contrast).toBeGreaterThan(0);
      expect(result[1].rating).toBe('bronze');
    });
  });

  describe('matchScales', () => {
    it('should return a scale of colors that meet the target contrast', () => {
      const background = [0.9, 0.9, 0.9] as ColorSpace<'rgb'>;
      const stops = [
        [0.1, 0.1, 0.1],
        [0.5, 0.5, 0.5],
      ] as ColorSpace<'rgb'>[];
      const target = 60;
      const steps = 5;
      const result = matchScales(stops, background, 'rgb', target, steps);
      expect(result).toHaveLength(steps);
      result.forEach((color) => {
        const contrast = checkContrast(color, background, 'rgb');
        expect(Math.abs(contrast)).toBeGreaterThanOrEqual(target);
      });
    });
  });
});
