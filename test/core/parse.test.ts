import { describe, expect, it } from 'vitest';
import { parseColor } from '~/core/parse';

describe('parseColor', () => {
  describe('Hexadecimal Parsing', () => {
    it('should parse 3-digit hex', () => {
      const result = parseColor('#f00');
      expect(result).toEqual({
        mode: 'rgb',
        alpha: 1,
        values: [1, 0, 0],
      });
    });

    it('should parse 4-digit hex (with alpha)', () => {
      const result = parseColor('#000f');
      expect(result.alpha).toBe(1);
      expect(result.values).toEqual([0, 0, 0]);
    });

    it('should parse 6-digit hex', () => {
      const result = parseColor('#00ff00');
      expect(result.values).toEqual([0, 1, 0]);
    });

    it('should parse 8-digit hex', () => {
      const result = parseColor('#ffffff80');
      expect(result.alpha).toBeCloseTo(0.5, 2);
      expect(result.values).toEqual([1, 1, 1]);
    });
  });

  describe('Functional Notations (Modern and Legacy)', () => {
    it('should parse modern space-separated rgb', () => {
      const result = parseColor('rgb(255 128 0)');
      expect(result.mode).toBe('rgb');
      expect(result.values).toEqual([1, 128 / 255, 0]);
    });

    it('should parse legacy comma-separated rgba', () => {
      const result = parseColor('rgba(255, 255, 255, 0.5)');
      expect(result.mode).toBe('rgb');
      expect(result.alpha).toBe(0.5);
    });

    it('should parse modern slash alpha notation', () => {
      const result = parseColor('rgb(0 0 0 / 25%)');
      expect(result.alpha).toBe(0.25);
    });
  });

  describe('Normalization Logic per Mode', () => {
    it('should normalize HSL/HWB percentages', () => {
      const hsl = parseColor('hsl(180 50% 20%)');
      expect(hsl.values).toEqual([180, 0.5, 0.2]);
    });

    it('should normalize OKLab/OKLCH lightness', () => {
      const oklab = parseColor('oklab(70% 0.1 0.1)');
      expect(oklab.values).toEqual([0.7, 0.1, 0.1]);
    });

    it('should keep Lab/LCH values raw (except L as percentage-like)', () => {
      const lab = parseColor('lab(50 20 -20)');
      expect(lab.values).toEqual([50, 20, -20]);
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid CSS strings', () => {
      expect(() => parseColor('not-a-color')).toThrow('Invalid CSS color');
    });

    it('should throw on missing values', () => {
      expect(() => parseColor('rgb(255, 255)')).toThrow('Invalid color values');
    });

    it('should throw on non-numeric values', () => {
      expect(() => parseColor('rgb(255, red, 0)')).toThrow(
        'Invalid color values',
      );
    });

    it('should throw on unsupported modes', () => {
      expect(() => parseColor('device-cmyk(0 0 0 1)')).toThrow(
        'Unsupported mode',
      );
    });
  });

  describe('Utility behaviors', () => {
    it('should trim whitespace', () => {
      const result = parseColor('  #fff  ');
      expect(result.values).toEqual([1, 1, 1]);
    });

    it('should clamp alpha between 0 and 1', () => {
      const high = parseColor('rgba(0,0,0,5)');
      const low = parseColor('rgba(0,0,0,-1)');
      expect(high.alpha).toBe(1);
      expect(low.alpha).toBe(0);
    });
  });
});
