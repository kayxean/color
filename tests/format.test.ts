import { describe, expect, it } from 'vitest';
import { formatCss } from '~/format';
import { createColor } from '~/utils';

describe('CSS Formatter', () => {
  describe('Hex Output (RGB only)', () => {
    it('should format RGB as Hex when requested', () => {
      const color = createColor('rgb', [1, 0, 0]);
      expect(formatCss(color, 1, true)).toBe('#ff0000');
    });

    it('should handle Hex with alpha (8-digit hex)', () => {
      const color = createColor('rgb', [0, 0, 1]);
      expect(formatCss(color, 0.5, true)).toBe('#0000ff80');
    });
  });

  describe('Common Formatting Logic (Alpha & Precision)', () => {
    it('should include alpha with the modern slash syntax', () => {
      const lab = createColor('lab', [50, 10, -10]);
      expect(formatCss(lab, 0.25)).toBe('lab(50% 10 -10 / 25%)');
    });

    it('should respect the precision parameter', () => {
      const color = createColor('rgb', [0.33333, 0.33333, 0.33333]);
      expect(formatCss(color, 1, false, 0)).toBe('rgb(85 85 85)');
    });

    it('should handle extreme precision via fallback logic', () => {
      const color = createColor('lab', [50.125, 10, -10]);
      expect(formatCss(color, 1, false, 6)).toBe('lab(50.125% 10 -10)');
    });
  });

  describe('Color Space Switch (Functional Notation)', () => {
    it('should format RGB as modern functional notation', () => {
      const color = createColor('rgb', [1, 0.5, 0]);
      expect(formatCss(color)).toBe('rgb(255 128 0)');
    });

    it('should format HSL and HWB with percentages and degrees', () => {
      const hsl = createColor('hsl', [180, 0.5, 0.5]);
      expect(formatCss(hsl)).toBe('hsl(180deg 50% 50%)');

      const hwb = createColor('hwb', [240, 0.1, 0.1]);
      expect(formatCss(hwb)).toBe('hwb(240deg 10% 10%)');
    });

    it('should format CIELAB correctly', () => {
      const lab = createColor('lab', [50, 10, -10]);
      expect(formatCss(lab)).toBe('lab(50% 10 -10)');
    });

    it('should format CIELCH correctly', () => {
      const lch = createColor('lch', [50, 30, 120]);
      expect(formatCss(lch)).toBe('lch(50% 30 120deg)');
    });

    it('should format OKLab with high precision chroma/ab', () => {
      const oklab = createColor('oklab', [0.4, 0.123456, -0.123456]);
      expect(formatCss(oklab)).toBe('oklab(40% 0.1235 -0.1235)');
    });

    it('should format OKLCH with percentage lightness and degree hue', () => {
      const oklch = createColor('oklch', [0.627, 0.123456, 29.5]);
      expect(formatCss(oklch)).toBe('oklch(62.7% 0.1235 29.5deg)');
    });

    it('should throw an error for unsupported CSS color spaces', () => {
      // @ts-expect-error - Testing runtime error for non-CSS space
      const xyz = createColor('xyz65', [0.95, 1.0, 1.08]);
      expect(() => formatCss(xyz)).toThrow(
        'Unsupported CSS format mode: xyz65',
      );
    });
  });
});
