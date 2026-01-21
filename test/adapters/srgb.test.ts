import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import {
  hexToRgb,
  hslToHsv,
  hsvToHsl,
  hsvToHwb,
  hsvToRgb,
  hwbToHsv,
  rgbToHex,
  rgbToHsv,
} from '~/adapters/srgb';

describe('srgb adapter (HSV, HSL, HWB, HEX)', () => {
  describe('HSV <-> RGB', () => {
    it('should convert Red correctly', () => {
      const hsv = rgbToHsv([1, 0, 0] as ColorSpace<'rgb'>);
      expect(hsv).toEqual([0, 1, 1]);
    });

    it('should convert Green correctly', () => {
      const hsv = rgbToHsv([0, 1, 0] as ColorSpace<'rgb'>);
      expect(hsv).toEqual([120, 1, 1]);
    });

    it('should convert Blue correctly', () => {
      const hsv = rgbToHsv([0, 0, 1] as ColorSpace<'rgb'>);
      expect(hsv).toEqual([240, 1, 1]);
    });

    it('should handle negative hue correctly', () => {
      const hsv = rgbToHsv([1, 0, 1] as ColorSpace<'rgb'>);
      expect(hsv[0]).toBe(300);
    });

    it('should handle grayscale (Saturation 0)', () => {
      const hsv = rgbToHsv([0.5, 0.5, 0.5] as ColorSpace<'rgb'>);
      expect(hsv[1]).toBe(0);
      expect(hsv[2]).toBe(0.5);
    });

    it('should round-trip RGB -> HSV -> RGB', () => {
      const original = [0.2, 0.8, 0.4] as ColorSpace<'rgb'>;
      const hsv = rgbToHsv(original);
      const back = hsvToRgb(hsv);
      expect(back[0]).toBeCloseTo(original[0], 5);
      expect(back[1]).toBeCloseTo(original[1], 5);
      expect(back[2]).toBeCloseTo(original[2], 5);
    });
  });

  describe('hsvToRgb branches', () => {
    it('should convert hue 0-60', () => {
      const rgb = hsvToRgb([30, 1, 1] as ColorSpace<'hsv'>);
      expect(rgb[0]).toBe(1);
      expect(rgb[1]).toBe(0.5);
      expect(rgb[2]).toBe(0);
    });

    it('should convert hue 60-120', () => {
      const rgb = hsvToRgb([90, 1, 1] as ColorSpace<'hsv'>);
      expect(rgb[0]).toBe(0.5);
      expect(rgb[1]).toBe(1);
      expect(rgb[2]).toBe(0);
    });

    it('should convert hue 120-180', () => {
      const rgb = hsvToRgb([150, 1, 1] as ColorSpace<'hsv'>);
      expect(rgb[0]).toBe(0);
      expect(rgb[1]).toBe(1);
      expect(rgb[2]).toBe(0.5);
    });

    it('should convert hue 180-240', () => {
      const rgb = hsvToRgb([210, 1, 1] as ColorSpace<'hsv'>);
      expect(rgb[0]).toBe(0);
      expect(rgb[1]).toBe(0.5);
      expect(rgb[2]).toBe(1);
    });

    it('should convert hue 240-300', () => {
      const rgb = hsvToRgb([270, 1, 1] as ColorSpace<'hsv'>);
      expect(rgb[0]).toBe(0.5);
      expect(rgb[1]).toBe(0);
      expect(rgb[2]).toBe(1);
    });

    it('should convert hue 300-360', () => {
      const rgb = hsvToRgb([330, 1, 1] as ColorSpace<'hsv'>);
      expect(rgb[0]).toBe(1);
      expect(rgb[1]).toBe(0);
      expect(rgb[2]).toBe(0.5);
    });
  });

  describe('HSL <-> HSV', () => {
    it('should convert mid-tone HSL to HSV', () => {
      const hsv = hslToHsv([0, 1, 0.5] as ColorSpace<'hsl'>);
      expect(hsv).toEqual([0, 1, 1]);
    });

    it('should round-trip HSL -> HSV -> HSL', () => {
      const original = [200, 0.5, 0.5] as ColorSpace<'hsl'>;
      const hsv = hslToHsv(original);
      const back = hsvToHsl(hsv);
      expect(back).toEqual(original);
    });

    it('should convert black HSL to HSV', () => {
      const hsv = hslToHsv([0, 0, 0] as ColorSpace<'hsl'>);
      expect(hsv).toEqual([0, 0, 0]);
    });
  });

  describe('HWB <-> HSV', () => {
    it('should convert Red correctly to HWB', () => {
      const hwb = hsvToHwb([0, 1, 1] as ColorSpace<'hsv'>);
      expect(hwb).toEqual([0, 0, 0]);
    });

    it('should handle the "sum >= 1" HWB normalization case', () => {
      const hsv = hwbToHsv([0, 0.6, 0.6] as ColorSpace<'hwb'>);
      expect(hsv[1]).toBe(0);
      expect(hsv[2]).toBeCloseTo(0.4, 5);
    });

    it('should handle B=1 correctly', () => {
      const hsv = hwbToHsv([0, 0, 1] as ColorSpace<'hwb'>);
      expect(hsv).toEqual([0, 0, 0]);
    });
  });

  describe('HEX <-> RGB', () => {
    it('should convert RGB to Hex string', () => {
      expect(rgbToHex([1, 0, 0] as ColorSpace<'rgb'>)).toBe('#ff0000');
      expect(rgbToHex([1, 1, 1] as ColorSpace<'rgb'>, true)).toBe('ffffff');
      expect(rgbToHex([0.5, 0.5, 0.5] as ColorSpace<'rgb'>)).toBe('#808080');
    });

    it('should convert 6-digit Hex to RGB', () => {
      const rgb = hexToRgb('#00ff00');
      expect(rgb).toEqual([0, 1, 0]);
    });

    it('should convert 3-digit shorthand Hex to RGB', () => {
      const rgb = hexToRgb('f00');
      expect(rgb).toEqual([1, 0, 0]);
    });

    it('should handle lowercase/mixed hex strings', () => {
      const rgb = hexToRgb('#AbC123');
      expect(rgb).not.toContain(NaN);
    });
  });
});
