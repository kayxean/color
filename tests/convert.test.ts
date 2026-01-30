import { describe, expect, it } from 'vitest';
import { convertColor, convertHue } from '../src/convert';
import { createBuffer } from '../src/utils';

describe('Color Converter (Pathfinding & Orchestration)', () => {
  it('should handle identical source and target (Identity)', () => {
    const input = createBuffer([0.5, 0.5, 0.5]);
    const output = createBuffer([0, 0, 0]);
    convertColor(input, output, 'rgb', 'rgb');

    expect(output[0]).toBe(0.5);
    expect(output[1]).toBe(0.5);
    expect(output[2]).toBe(0.5);
  });

  it('should use DIRECT routing for sRGB cylindrical spaces', () => {
    const rgb = createBuffer([1, 0, 0]);
    const hsv = createBuffer([0, 0, 0]);
    convertColor(rgb, hsv, 'rgb', 'hsv');

    expect(hsv[0]).toBe(0);
    expect(hsv[1]).toBe(1);
    expect(hsv[2]).toBe(1);
  });

  it('should cross the Hub for complex conversions (HSL to OKLCH)', () => {
    const hsl = createBuffer([0, 1, 0.5]);
    const oklch = createBuffer([0, 0, 0]);
    convertColor(hsl, oklch, 'hsl', 'oklch');

    expect(oklch[0]).toBeCloseTo(0.628, 2);
    expect(oklch[1]).toBeGreaterThan(0.2);
    expect(oklch[2]).toBeCloseTo(29, 0);
  });

  it('should cross the Chromatic Adaptation Bridge (Lab to RGB)', () => {
    const lab = createBuffer([100, 0, 0]);
    const rgb = createBuffer([0, 0, 0]);
    convertColor(lab, rgb, 'lab', 'rgb');

    expect(rgb[0]).toBeCloseTo(1, 3);
    expect(rgb[1]).toBeCloseTo(1, 3);
    expect(rgb[2]).toBeCloseTo(1, 3);
  });

  describe('convertHue', () => {
    it('should extract hue from non-polar spaces (rgb -> hsl hue)', () => {
      const rgb = createBuffer([0, 0, 1]);
      const output = createBuffer([0, 0, 0]);
      convertHue(rgb, output, 'rgb');

      expect(output[0]).toBe(240);
    });

    it('should pass through already polar spaces', () => {
      const lch = createBuffer([50, 10, 180]);
      const output = createBuffer([0, 0, 0]);
      convertHue(lch, output, 'lch');

      expect(output[2]).toBe(180);
      expect(output[1]).toBe(10);
    });
  });
});
