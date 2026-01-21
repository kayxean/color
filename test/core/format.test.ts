import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import { formatCss } from '~/core/format';

describe('formatCss', () => {
  describe('RGB Mode', () => {
    it('should format standard RGB', () => {
      const result = formatCss('rgb', [0.5, 0.5, 0.5] as ColorSpace<'rgb'>);
      expect(result).toBe('rgb(128 128 128)');
    });

    it('should handle alpha in rgb notation', () => {
      const result = formatCss('rgb', [1, 0, 0] as ColorSpace<'rgb'>, 0.5);
      expect(result).toBe('rgb(255 0 0 / 50%)');
    });

    it('should format as 6-digit Hex', () => {
      const result = formatCss('rgb', [1, 1, 1] as ColorSpace<'rgb'>, 1, true);
      expect(result).toBe('#ffffff');
    });

    it('should format as 8-digit Hex (Hex8) with alpha', () => {
      const result = formatCss(
        'rgb',
        [0, 0, 0] as ColorSpace<'rgb'>,
        0.1,
        true,
      );
      expect(result).toBe('#0000001a');
    });
  });

  describe('Cylindrical Spaces (HSL, HWB)', () => {
    it('should format HSL with degrees and percentages', () => {
      const result = formatCss('hsl', [180, 0.5, 0.5] as ColorSpace<'hsl'>);
      expect(result).toBe('hsl(180deg 50% 50%)');
    });

    it('should format HWB', () => {
      const result = formatCss(
        'hwb',
        [200, 0.1, 0.2] as ColorSpace<'hwb'>,
        0.8,
      );
      expect(result).toBe('hwb(200deg 10% 20% / 80%)');
    });
  });

  describe('Device-Independent Spaces (LAB, LCH)', () => {
    it('should format LAB with percentages for Lightness', () => {
      const result = formatCss('lab', [50, 20, -20] as ColorSpace<'lab'>);
      expect(result).toBe('lab(50% 20 -20)');
    });

    it('should format LCH with degrees for Hue', () => {
      const result = formatCss('lch', [75, 40, 90] as ColorSpace<'lch'>);
      expect(result).toBe('lch(75% 40 90deg)');
    });
  });

  describe('Perceptual Spaces (OKLAB, OKLCH)', () => {
    it('should format OKLAB with 4-decimal precision for a/b', () => {
      const result = formatCss('oklab', [
        0.7, 0.123456, -0.123456,
      ] as ColorSpace<'oklab'>);
      expect(result).toBe('oklab(70% 0.1235 -0.1235)');
    });

    it('should format OKLCH with 4-decimal precision for Chroma', () => {
      const result = formatCss('oklch', [
        0.6, 0.056789, 150,
      ] as ColorSpace<'oklch'>);
      expect(result).toBe('oklch(60% 0.0568 150deg)');
    });
  });

  describe('Edge Cases & Internal Logic', () => {
    it('should not show alpha if alpha is 1', () => {
      const result = formatCss('hsl', [0, 1, 0.5] as ColorSpace<'hsl'>, 1);
      expect(result).not.toContain('/');
      expect(result).toBe('hsl(0deg 100% 50%)');
    });

    it('should round fractional percentages to 2 decimals', () => {
      const result = formatCss('hsl', [0, 0.333333, 0.5] as ColorSpace<'hsl'>);
      expect(result).toBe('hsl(0deg 33.33% 50%)');
    });

    it('should return integers without decimals where possible', () => {
      const result = formatCss('oklch', [0.5, 0, 100] as ColorSpace<'oklch'>);
      expect(result).toBe('oklch(50% 0 100deg)');
    });

    it('should throw error for unsupported modes', () => {
      // @ts-expect-error testing runtime error
      expect(() => formatCss('invalid', [0, 0, 0])).toThrow(
        'Unsupported mode: invalid',
      );
    });
  });
});
