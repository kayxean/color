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
} from '../../src/adapters/srgb';
import { createBuffer } from '../../src/utils';

describe('sRGB Adapter (Cylindrical & Hex)', () => {
  describe('HSV / HSL / HWB Transforms', () => {
    it('should convert RGB Red to HSV (0, 1, 1)', () => {
      const rgb = createBuffer([1, 0, 0]);
      const hsv = createBuffer([0, 0, 0]);
      rgbToHsv(rgb, hsv);
      expect(hsv[0]).toBe(0);
      expect(hsv[1]).toBe(1);
      expect(hsv[2]).toBe(1);
    });

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

    it('should convert HSV to HSL accurately (Red)', () => {
      const hsv = createBuffer([0, 1, 1]);
      const hsl = createBuffer([0, 0, 0]);
      hsvToHsl(hsv, hsl);

      expect(hsl[2]).toBe(0.5);
      expect(hsl[1]).toBe(1);
    });

    it('should maintain round-trip between HSL and HSV', () => {
      const originalHsl = createBuffer([210, 0.5, 0.5]);
      const hsv = createBuffer([0, 0, 0]);
      const resultHsl = createBuffer([0, 0, 0]);

      hslToHsv(originalHsl, hsv);
      hsvToHsl(hsv, resultHsl);

      expect(resultHsl[0]).toBeCloseTo(210, 5);
      expect(resultHsl[1]).toBeCloseTo(0.5, 5);
      expect(resultHsl[2]).toBeCloseTo(0.5, 5);
    });

    it('should convert HSV to HWB accurately', () => {
      const hsv = createBuffer([0, 1, 1]);
      const hwb = createBuffer([0, 0, 0]);
      hsvToHwb(hsv, hwb);

      expect(hwb[1]).toBe(0);
      expect(hwb[2]).toBe(0);
    });

    it('should convert HWB back to HSV', () => {
      const hwb = createBuffer([0, 0.5, 0]);
      const hsv = createBuffer([0, 0, 0]);
      hwbToHsv(hwb, hsv);

      expect(hsv[1]).toBe(0.5);
      expect(hsv[2]).toBe(1);
    });
  });

  describe('Hex Handling', () => {
    it('should format RGB to Hex string', () => {
      const rgb = createBuffer([1, 0.5, 0]);
      expect(rgbToHex(rgb, true)).toBe('#ff8000');
    });

    it('should parse Hex strings (including shorthand)', () => {
      const output = createBuffer([0, 0, 0]);

      hexToRgb('#fff', output);
      expect(output[0]).toBe(1);

      hexToRgb('000000', output);
      expect(output[2]).toBe(0);

      hexToRgb('#ff0000', output);
      expect(output[0]).toBe(1);
      expect(output[1]).toBe(0);
    });
  });
});
