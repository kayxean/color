import { describe, expect, it } from 'vitest';
import { labToLch, lchToLab, oklabToOklch } from '../../src/adapters/polar';
import { createBuffer } from '../../src/utils';

describe('Polar Adapter (Cartesian <-> Polar)', () => {
  it('should calculate Chroma correctly using Pythagorean theorem', () => {
    const lab = createBuffer([50, 3, 4]);
    const lch = createBuffer([0, 0, 0]);
    labToLch(lab, lch);

    expect(lch[0]).toBe(50);
    expect(lch[1]).toBeCloseTo(5, 5);
  });

  it('should calculate Hue angles correctly across quadrants', () => {
    const output = createBuffer([0, 0, 0]);

    labToLch(createBuffer([50, 10, 10]), output);
    expect(output[2]).toBeCloseTo(45, 4);

    labToLch(createBuffer([50, 10, -10]), output);
    expect(output[2]).toBeCloseTo(315, 4);
  });

  it('should maintain identity for achromatic colors (Chroma = 0)', () => {
    const lab = createBuffer([75, 0, 0]);
    const lch = createBuffer([0, 0, 0]);
    labToLch(lab, lch);

    expect(lch[1]).toBe(0);
    expect(lch[2]).toBe(0);
  });

  it('should accurately convert LCH back to Lab (Polar to Cartesian)', () => {
    const originalLch = createBuffer([60, 20, 180]);
    const lab = createBuffer([0, 0, 0]);
    const resultLch = createBuffer([0, 0, 0]);

    lchToLab(originalLch, lab);

    expect(lab[1]).toBeCloseTo(-20, 5);
    expect(lab[2]).toBeCloseTo(0, 5);

    labToLch(lab, resultLch);
    expect(resultLch[2]).toBeCloseTo(180, 5);
  });

  it('should treat OKLab and Lab polar conversions identically', () => {
    const input = createBuffer([0.5, 0.1, 0.1]);
    const outLch = createBuffer([0, 0, 0]);
    const outOklch = createBuffer([0, 0, 0]);

    labToLch(input, outLch);
    oklabToOklch(input, outOklch);

    expect(outLch[1]).toBe(outOklch[1]);
    expect(outLch[2]).toBe(outOklch[2]);
  });
});
