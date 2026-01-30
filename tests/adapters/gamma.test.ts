import { describe, expect, it } from 'vitest';
import { lrgbToRgb, rgbToLrgb } from '../../src/adapters/gamma';
import { createBuffer } from '../../src/utils';

describe('Gamma Adapter (sRGB Transfer Function)', () => {
  it('should handle white correctly (Identity)', () => {
    const rgb = createBuffer([1, 1, 1]);
    const lrgb = createBuffer([0, 0, 0]);
    rgbToLrgb(rgb, lrgb);

    expect(lrgb[0]).toBeCloseTo(1, 5);
    expect(lrgb[1]).toBeCloseTo(1, 5);
    expect(lrgb[2]).toBeCloseTo(1, 5);
  });

  it('should handle black correctly (Identity)', () => {
    const rgb = createBuffer([0, 0, 0]);
    const lrgb = createBuffer([0, 0, 0]);
    rgbToLrgb(rgb, lrgb);

    expect(lrgb[0]).toBe(0);
    expect(lrgb[1]).toBe(0);
    expect(lrgb[2]).toBe(0);
  });

  it('should handle the linear "toe" of the curve (very dark colors)', () => {
    const darkRgb = createBuffer([0.03, 0.03, 0.03]);
    const lrgb = createBuffer([0, 0, 0]);
    rgbToLrgb(darkRgb, lrgb);

    expect(lrgb[0]).toBeCloseTo(0.03 / 12.92, 5);
  });

  it('should handle midtones (exponential part)', () => {
    const midRgb = createBuffer([0.5, 0.5, 0.5]);
    const lrgb = createBuffer([0, 0, 0]);
    rgbToLrgb(midRgb, lrgb);

    expect(lrgb[0]).toBeCloseTo(0.21404, 4);
  });

  it('should maintain round-trip integrity', () => {
    const original = createBuffer([0.75, 0.25, 0.5]);
    const temp = createBuffer([0, 0, 0]);
    const result = createBuffer([0, 0, 0]);

    rgbToLrgb(original, temp);
    lrgbToRgb(temp, result);

    expect(result[0]).toBeCloseTo(original[0], 5);
    expect(result[1]).toBeCloseTo(original[1], 5);
    expect(result[2]).toBeCloseTo(original[2], 5);
  });

  it('should clamp negative linear values to black', () => {
    const negativeLrgb = createBuffer([-0.1, -0.5, 0]);
    const rgb = createBuffer([0, 0, 0]);
    lrgbToRgb(negativeLrgb, rgb);

    expect(rgb[0]).toBe(0);
    expect(rgb[1]).toBe(0);
    expect(rgb[2]).toBe(0);
  });
});
