import { describe, expect, it } from 'vitest';
import {
  checkContrast,
  checkContrastBulk,
  getContrastRating,
  getLuminanceD65,
  matchContrast,
  matchScales,
} from '~/shared/contrast';
import { createColor } from '~/utils';

describe('Contrast & Readability (APCA)', () => {
  describe('getLuminanceD65', () => {
    it('should return 1.0 for White and 0.0 for Black', () => {
      const white = createColor('rgb', [1, 1, 1]);
      const black = createColor('rgb', [0, 0, 0]);

      expect(getLuminanceD65(white)).toBeCloseTo(1.0, 5);
      expect(getLuminanceD65(black)).toBeCloseTo(0.0, 5);
    });

    it('should trigger D50 to D65 conversion for Lab colors', () => {
      const labWhite = createColor('lab', [100, 0, 0]);
      const luminance = getLuminanceD65(labWhite);

      expect(luminance).toBeCloseTo(1, 4);
    });

    it('should calculate luminance for native D65 spaces (RGB)', () => {
      const rgbWhite = createColor('rgb', [1, 1, 1]);
      const luminance = getLuminanceD65(rgbWhite);

      expect(luminance).toBeCloseTo(1, 4);
    });
  });

  describe('checkContrast', () => {
    it('should calculate positive contrast for dark text on light background', () => {
      const text = createColor('rgb', [0, 0, 0]);
      const bg = createColor('rgb', [1, 1, 1]);
      const contrast = checkContrast(text, bg);

      expect(contrast).toBeGreaterThan(100);
    });

    it('should calculate negative contrast for light text on dark background', () => {
      const text = createColor('rgb', [1, 1, 1]);
      const bg = createColor('rgb', [0, 0, 0]);
      const contrast = checkContrast(text, bg);

      expect(contrast).toBeLessThan(-100);
    });
  });

  describe('getContrastRating', () => {
    it('should return correct descriptive ratings for all tiers', () => {
      expect(getContrastRating(105)).toBe('platinum');
      expect(getContrastRating(80)).toBe('gold');
      expect(getContrastRating(65)).toBe('silver');
      expect(getContrastRating(50)).toBe('bronze');
      expect(getContrastRating(35)).toBe('ui');
      expect(getContrastRating(15)).toBe('fail');
    });

    it('should handle negative contrast values', () => {
      expect(getContrastRating(-100)).toBe('platinum');
      expect(getContrastRating(-35)).toBe('ui');
    });
  });

  describe('matchContrast', () => {
    it('should increase lightness of text to meet target on dark background', () => {
      const bg = createColor('rgb', [0.1, 0.1, 0.1]);
      const text = createColor('rgb', [0.2, 0.2, 0.2]);

      const target = 60;
      const adjusted = matchContrast(text, bg, target);
      const newContrast = checkContrast(adjusted, bg);

      expect(Math.abs(newContrast)).toBeGreaterThanOrEqual(target);
      expect(adjusted.value[0]).toBeGreaterThan(text.value[0]);
    });

    it('should return the same color if target is already met', () => {
      const white = createColor('rgb', [1, 1, 1]);
      const black = createColor('rgb', [0, 0, 0]);
      const result = matchContrast(white, black, 30);

      expect(result.value).toEqual(white.value);
    });

    it('should handle native OKLCH colors without reversion', () => {
      const bg = createColor('rgb', [0, 0, 0]);
      const text = createColor('oklch', [0.2, 0.1, 0]);

      const target = 70;
      const result = matchContrast(text, bg, target);

      expect(result.space).toBe('oklch');
      expect(result.value[0]).toBeGreaterThan(0.2);
      expect(Math.abs(checkContrast(result, bg))).toBeGreaterThanOrEqual(
        target - 1,
      );
    });

    it('should decrease lightness for contrast on a light background', () => {
      const bg = createColor('rgb', [1, 1, 1]);
      const text = createColor('rgb', [0.9, 0.9, 0.9]);

      const target = 60;
      const adjusted = matchContrast(text, bg, target);
      const newContrast = checkContrast(adjusted, bg);

      expect(Math.abs(newContrast)).toBeGreaterThanOrEqual(target - 1);
      expect(adjusted.value[0]).toBeLessThan(0.9);
    });
  });

  describe('checkContrastBulk', () => {
    it('should calculate contrast and ratings for an array of colors', () => {
      const background = createColor('rgb', [0, 0, 0]);
      const colors = [
        createColor('rgb', [1, 1, 1]),
        createColor('rgb', [0.2, 0.2, 0.2]),
      ];

      const results = checkContrastBulk(background, colors);

      expect(results).toHaveLength(2);
      expect(results[0].color).toBe(colors[0]);
      expect(Math.abs(results[0].contrast)).toBeGreaterThan(90);
      expect(results[0].rating).toBe('platinum');

      expect(results[1].color).toBe(colors[1]);
      expect(Math.abs(results[1].contrast)).toBeLessThan(30);
      expect(results[1].rating).toBe('fail');
    });
  });

  describe('matchScales', () => {
    it('should generate a scale and adjust all colors to a target contrast', () => {
      const background = createColor('rgb', [0, 0, 0]);
      const stops = [
        createColor('rgb', [0.2, 0, 0]),
        createColor('rgb', [0, 0.2, 0]),
      ];
      const targetContrast = 60;
      const steps = 3;

      const result = matchScales(stops, background, targetContrast, steps);

      expect(result).toHaveLength(steps);

      result.forEach((color) => {
        const contrast = checkContrast(color, background);
        expect(Math.abs(contrast)).toBeGreaterThanOrEqual(targetContrast - 1);
      });

      expect(result[1].value[0]).toBeGreaterThan(0);
      expect(result[1].value[1]).toBeGreaterThan(0);
    });
  });
});
