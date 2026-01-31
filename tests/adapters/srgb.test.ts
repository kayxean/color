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
import { createBuffer } from '~/utils';

describe('sRGB Adapter (Cylindrical & Hex)', () => {
  describe('rgbToHsv', () => {
    it('should convert RGB Red to HSV (0, 1, 1)', () => {
      const rgb = createBuffer([1, 0, 0]);
      const hsv = createBuffer([0, 0, 0]);
      rgbToHsv(rgb, hsv);
      expect(hsv[0]).toBe(0);
      expect(hsv[1]).toBe(1);
      expect(hsv[2]).toBe(1);
    });

    it('should handle pure black', () => {
      const rgb = createBuffer([0, 0, 0]);
      const hsv = createBuffer([1, 1, 1]);
      rgbToHsv(rgb, hsv);
      expect(hsv[2]).toBe(0);
      expect(hsv[1]).toBe(0);
      expect(hsv[0]).toBe(0);
    });

    it('should handle grayscale', () => {
      const rgb = createBuffer([0.5, 0.5, 0.5]);
      const hsv = createBuffer([1, 1, 1]);
      rgbToHsv(rgb, hsv);
      expect(hsv[1]).toBe(0);
      expect(hsv[0]).toBe(0);
    });

    it('should cover all hue sectors (v=g, v=b, and wrap-around)', () => {
      const hsv = createBuffer([0, 0, 0]);
      rgbToHsv(createBuffer([0, 1, 0]), hsv);
      expect(hsv[0]).toBe(120);
      rgbToHsv(createBuffer([0, 0, 1]), hsv);
      expect(hsv[0]).toBe(240);
      rgbToHsv(createBuffer([1, 0, 0.5]), hsv);
      expect(hsv[0]).toBe(330);
    });
  });

  describe('hsvToRgb', () => {
    it('should convert HSV back to RGB across hue sectors', () => {
      const hsv = createBuffer([0, 0, 0]);
      const rgb = createBuffer([0, 0, 0]);
      hsv.set([0, 1, 1]);
      hsvToRgb(hsv, rgb);
      expect(rgb[0]).toBe(1);
      hsv.set([120, 1, 1]);
      hsvToRgb(hsv, rgb);
      expect(rgb[1]).toBe(1);
      hsv.set([240, 1, 1]);
      hsvToRgb(hsv, rgb);
      expect(rgb[2]).toBe(1);
    });

    it('should cover specific sectors (1 and 5)', () => {
      const hsv = createBuffer([0, 0, 0]);
      const rgb = createBuffer([0, 0, 0]);
      hsv.set([60, 1, 1]);
      hsvToRgb(hsv, rgb);
      expect(rgb[1]).toBe(1);
      hsv.set([300, 1, 1]);
      hsvToRgb(hsv, rgb);
      expect(rgb[2]).toBe(1);
    });
  });

  describe('hsvToHsl', () => {
    it('should convert HSV to HSL accurately', () => {
      const hsv = createBuffer([0, 1, 1]);
      const hsl = createBuffer([0, 0, 0]);
      hsvToHsl(hsv, hsl);
      expect(hsl[2]).toBe(0.5);
      expect(hsl[1]).toBe(1);
    });

    it('should handle lightness boundaries (L=0 and L=1)', () => {
      const hsv = createBuffer([0, 0, 0]);
      const hsl = createBuffer([0, 0, 0]);
      hsv.set([0, 1, 0]);
      hsvToHsl(hsv, hsl);
      expect(hsl[1]).toBe(0);
      hsv.set([0, 0, 1]);
      hsvToHsl(hsv, hsl);
      expect(hsl[1]).toBe(0);
    });
  });

  describe('hslToHsv', () => {
    it('should maintain round-trip with hsvToHsl', () => {
      const originalHsl = createBuffer([210, 0.5, 0.5]);
      const hsv = createBuffer([0, 0, 0]);
      const resultHsl = createBuffer([0, 0, 0]);
      hslToHsv(originalHsl, hsv);
      hsvToHsl(hsv, resultHsl);
      expect(resultHsl[0]).toBeCloseTo(210, 5);
      expect(resultHsl[1]).toBeCloseTo(0.5, 5);
      expect(resultHsl[2]).toBeCloseTo(0.5, 5);
    });

    it('should handle pure black', () => {
      const hsl = createBuffer([0, 1, 0]);
      const hsv = createBuffer([1, 1, 1]);
      hslToHsv(hsl, hsv);
      expect(hsv[1]).toBe(0);
    });
  });

  describe('hsvToHwb', () => {
    it('should convert HSV to HWB accurately', () => {
      const hsv = createBuffer([0, 1, 1]);
      const hwb = createBuffer([0, 0, 0]);
      hsvToHwb(hsv, hwb);
      expect(hwb[1]).toBe(0);
      expect(hwb[2]).toBe(0);
    });
  });

  describe('hwbToHsv', () => {
    it('should convert HWB back to HSV', () => {
      const hwb = createBuffer([0, 0.5, 0]);
      const hsv = createBuffer([0, 0, 0]);
      hwbToHsv(hwb, hsv);
      expect(hsv[1]).toBe(0.5);
      expect(hsv[2]).toBe(1);
    });

    it('should handle boundary cases (v=0 and s<0)', () => {
      const hwb = createBuffer([0, 0, 0]);
      const hsv = createBuffer([1, 1, 1]);
      hwb.set([0, 0, 1]);
      hwbToHsv(hwb, hsv);
      expect(hsv[1]).toBe(0);
      hwb.set([0, 0.8, 0.4]);
      hwbToHsv(hwb, hsv);
      expect(hsv[1]).toBe(0);
    });
  });

  describe('rgbToHex', () => {
    it('should format RGB to Hex with and without denote', () => {
      const rgb = createBuffer([1, 0.5, 0]);
      expect(rgbToHex(rgb, true)).toBe('#ff8000');
      expect(rgbToHex(rgb, false)).toBe('ff8000');
      expect(rgbToHex(rgb)).toBe('ff8000');
    });
  });

  describe('hexToRgb', () => {
    it('should parse Hex strings (including shorthand and no prefix)', () => {
      const output = createBuffer([0, 0, 0]);
      hexToRgb('#fff', output);
      expect(output[0]).toBe(1);
      hexToRgb('000000', output);
      expect(output[2]).toBe(0);
      hexToRgb('#ff0000', output);
      expect(output[0]).toBe(1);
    });
  });
});
