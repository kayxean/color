import { describe, expect, it } from 'vitest';
import {
  checkContrast,
  getContrastRating,
  getLuminanceD65,
  matchContrast,
} from '../../src/shared/contrast';
import { createColor } from '../../src/utils';

describe('Contrast & Readability (APCA)', () => {
  describe('getLuminanceD65', () => {
    it('should return 1.0 for White and 0.0 for Black', () => {
      const white = createColor('rgb', [1, 1, 1]);
      const black = createColor('rgb', [0, 0, 0]);

      expect(getLuminanceD65(white)).toBeCloseTo(1.0, 5);
      expect(getLuminanceD65(black)).toBeCloseTo(0.0, 5);
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
  });

  describe('getContrastRating', () => {
    it('should return correct descriptive ratings', () => {
      expect(getContrastRating(105)).toBe('platinum');
      expect(getContrastRating(80)).toBe('gold');
      expect(getContrastRating(15)).toBe('fail');
    });
  });
});
