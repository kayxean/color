import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import { convertColor, convertHue } from '~/core/convert';

describe('convertColor', () => {
  describe('Direct Conversions', () => {
    it('should use direct mapping for RGB to HSL', () => {
      const result = convertColor([1, 1, 1] as ColorSpace<'rgb'>, 'rgb', 'hsl');
      expect(result[2]).toBe(1);
    });

    it('should use direct mapping for Lab to LCH', () => {
      const result = convertColor(
        [50, 0, 0] as ColorSpace<'lab'>,
        'lab',
        'lch',
      );
      expect(result).toEqual([50, 0, 0]);
    });

    it('should use direct mapping for HSL to RGB', () => {
      const result = convertColor(
        [0, 1, 0.5] as ColorSpace<'hsl'>,
        'hsl',
        'rgb',
      );
      expect(result[0]).toBe(1);
    });

    it('should use direct mapping for LCH to Lab', () => {
      const result = convertColor(
        [50, 0, 0] as ColorSpace<'lch'>,
        'lch',
        'lab',
      );
      expect(result).toEqual([50, 0, 0]);
    });

    it('should use direct mapping for HWB to RGB', () => {
      const result = convertColor([0, 1, 0] as ColorSpace<'hwb'>, 'hwb', 'rgb');
      expect(result).toEqual([1, 1, 1]);
    });

    it('should use direct mapping for RGB to HWB', () => {
      const result = convertColor([1, 1, 1] as ColorSpace<'rgb'>, 'rgb', 'hwb');
      expect(result[1]).toBe(1);
    });

    it('should use direct mapping for oklab to oklch', () => {
      const result = convertColor(
        [0.5, 0.5, 0.5] as ColorSpace<'oklab'>,
        'oklab',
        'oklch',
      );
      expect(result[0]).toBe(0.5);
    });
  });

  describe('Hub-based Conversions (Same Hub)', () => {
    it('should convert RGB to OKLab (both use XYZ D65)', () => {
      const result = convertColor(
        [0, 0, 0] as ColorSpace<'rgb'>,
        'rgb',
        'oklab',
      );
      expect(result).toEqual([0, 0, 0]);
    });

    it('should convert RGB to OKLCH (both use XYZ D65)', () => {
      const result = convertColor(
        [0, 0, 0] as ColorSpace<'rgb'>,
        'rgb',
        'oklch',
      );
      expect(result).toEqual([0, 0, 0]);
    });

    it('should convert RGB to HWB (both use XYZ D65)', () => {
      const result = convertColor([1, 0, 0] as ColorSpace<'rgb'>, 'rgb', 'hwb');
      expect(result[0]).toBe(0);
    });

    it('should convert HWB to OKLab (both use XYZ D65)', () => {
      const result = convertColor(
        [0, 0, 1] as ColorSpace<'hwb'>,
        'hwb',
        'oklab',
      );
      expect(result[0]).toBeCloseTo(0);
    });
  });

  describe('Cross-Hub Conversions (CAT)', () => {
    it('should convert RGB (D65) to Lab (D50) via CAT', () => {
      const whiteRgb = [1, 1, 1] as ColorSpace<'rgb'>;
      const result = convertColor(whiteRgb, 'rgb', 'lab');
      expect(result[0]).toBeCloseTo(100, 1);
      expect(result[1]).toBeCloseTo(0, 1);
      expect(result[2]).toBeCloseTo(0, 1);
    });

    it('should convert RGB (D65) to LCH (D50) via CAT', () => {
      const whiteRgb = [1, 1, 1] as ColorSpace<'rgb'>;
      const result = convertColor(whiteRgb, 'rgb', 'lch');
      expect(result[0]).toBeCloseTo(100, 1);
    });

    it('should convert Lab (D50) to OKLCH (D65)', () => {
      const result = convertColor(
        [100, 0, 0] as ColorSpace<'lab'>,
        'lab',
        'oklch',
      );
      expect(result[0]).toBeCloseTo(1, 2);
    });

    it('should convert HWB (D65) to LCH (D50) via CAT', () => {
      const result = convertColor([0, 1, 0] as ColorSpace<'hwb'>, 'hwb', 'lch');
      expect(result[0]).toBeCloseTo(100, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for unsupported source mode', () => {
      // @ts-expect-error testing runtime error
      expect(() => convertColor([1, 1, 1], 'invalid', 'rgb')).toThrow(
        'Unsupported source mode: invalid',
      );
    });

    it('should throw error for unsupported target mode', () => {
      // @ts-expect-error testing runtime error
      expect(() => convertColor([1, 1, 1], 'rgb', 'invalid')).toThrow(
        'Unsupported target mode: invalid',
      );
    });

    it('should return the same color if from and to are the same', () => {
      // @ts-expect-error testing runtime error
      const result = convertColor([1, 1, 1] as ColorSpace<'rgb'>, 'rgb', 'rgb');
      expect(result).toEqual([1, 1, 1]);
    });
  });
});

describe('convertHue', () => {
  it('should extract hue from RGB via HSL conversion', () => {
    const result = convertHue([1, 0, 0] as ColorSpace<'rgb'>, 'rgb');
    expect(result[0]).toBe(0);
  });

  it('should extract hue from Lab via LCH conversion', () => {
    const result = convertHue([50, 10, 10] as ColorSpace<'lab'>, 'lab');
    expect(result[2]).toBeCloseTo(45, 1);
  });

  it('should extract hue from OKLab via OKLCH conversion', () => {
    const result = convertHue([0.5, 10, 10] as ColorSpace<'oklab'>, 'oklab');
    expect(result[2]).toBeCloseTo(45, 1);
  });

  it('should return input as-is if no huerizer exists (Identity)', () => {
    const input = [180, 0.5, 0.5] as ColorSpace<'hsl'>;
    const result = convertHue(input, 'hsl');
    expect(result).toEqual(input);
  });
});
