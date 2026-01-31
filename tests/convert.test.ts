import { describe, expect, it } from 'vitest';
import { convertColor, convertHue, NATIVE_HUB } from '~/convert';
import { createBuffer } from '~/utils';

describe('Color Converter (Pathfinding & Orchestration)', () => {
  describe('convertColor', () => {
    it('should handle identical source and target (Identity short-circuit)', () => {
      const input = createBuffer([0.5, 0.5, 0.5]);
      const output = createBuffer([0, 0, 0]);
      convertColor(input, output, 'rgb', 'rgb');
      expect(output).toEqual(input);
    });

    it('should throw on unsupported source mode', () => {
      const buf = createBuffer([0, 0, 0]);
      // @ts-expect-error
      expect(() => convertColor(buf, buf, 'invalid', 'rgb')).toThrow(
        'Unsupported source mode: invalid',
      );
    });

    it('should throw on unsupported target mode', () => {
      const buf = createBuffer([0, 0, 0]);
      // @ts-expect-error
      expect(() => convertColor(buf, buf, 'rgb', 'invalid')).toThrow(
        'Unsupported target mode: invalid',
      );
    });

    it('should use DIRECT routing for sRGB cylindrical spaces', () => {
      const rgb = createBuffer([1, 0, 0]);
      const hsv = createBuffer([0, 0, 0]);
      convertColor(rgb, hsv, 'rgb', 'hsv');
      expect(hsv[0]).toBe(0);
      expect(hsv[1]).toBe(1);
    });

    it('should cross the Hub for complex conversions (HSL to OKLCH)', () => {
      const hsl = createBuffer([0, 1, 0.5]);
      const oklch = createBuffer([0, 0, 0]);
      convertColor(hsl, oklch, 'hsl', 'oklch');
      expect(oklch[0]).toBeCloseTo(0.628, 2);
      expect(oklch[1]).toBeGreaterThan(0.2);
      expect(oklch[2]).toBeCloseTo(29, 0);
    });

    it('should cross from XYZ65 to XYZ50 (D65 -> D50)', () => {
      const rgb = createBuffer([1, 1, 1]);
      const lab = createBuffer([0, 0, 0]);
      convertColor(rgb, lab, 'rgb', 'lab');
      expect(lab[0]).toBeCloseTo(100, 1);
    });

    it('should cross from XYZ50 to XYZ65 (D50 -> D65)', () => {
      const lab = createBuffer([100, 0, 0]);
      const rgb = createBuffer([0, 0, 0]);
      convertColor(lab, rgb, 'lab', 'rgb');
      expect(rgb[0]).toBeCloseTo(1, 1);
    });
  });

  describe('convertHue', () => {
    it('should extract hue from non-polar spaces (rgb -> hsl hue)', () => {
      const rgb = createBuffer([0, 0, 1]);
      const output = createBuffer([0, 0, 0]);
      convertHue(rgb, output, 'rgb');
      expect(output[0]).toBe(240);
    });

    it('should extract hue for Lab', () => {
      const lab = createBuffer([50, 50, 50]);
      const output = createBuffer([0, 0, 0]);
      convertHue(lab, output, 'lab');
      expect(output[2]).toBeCloseTo(45, 0);
    });

    it('should extract hue for Oklab', () => {
      const oklab = createBuffer([0.4, 0.1, 0.1]);
      const output = createBuffer([0, 0, 0]);
      convertHue(oklab, output, 'oklab');
      expect(output[2]).toBeCloseTo(45, 0);
    });

    it('should pass through already polar spaces (e.g., LCH)', () => {
      const lch = createBuffer([50, 10, 180]);
      const output = createBuffer([0, 0, 0]);
      convertHue(lch, output, 'lch');
      expect(output[2]).toBe(180);
      expect(output[1]).toBe(10);
    });

    it('should use convertColor fallback in default case', () => {
      const input = createBuffer([1, 0, 0]);
      const output = createBuffer([0, 0, 0]);

      // @ts-expect-error
      NATIVE_HUB['mock' as any] = 'xyz65';

      try {
        // @ts-expect-error
        expect(() => convertHue(input, output, 'mock')).toThrow();
      } finally {
        // @ts-expect-error
        delete NATIVE_HUB.mock;
      }
    });

    it('should throw on unsupported hue mode', () => {
      const buf = createBuffer([0, 0, 0]);
      // @ts-expect-error
      expect(() => convertHue(buf, buf, 'invalid')).toThrow(
        'Unsupported color mode for hue conversion: invalid',
      );
    });
  });
});
