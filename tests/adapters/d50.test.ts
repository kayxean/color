import { describe, expect, it } from 'vitest';
import { labToXyz50, xyz50ToLab } from '../../src/adapters/d50';
import { createBuffer } from '../../src/utils';

describe('D50 Adapter (XYZ <-> Lab)', () => {
  const WHITE_D50 = [0.96422, 1.0, 0.82521];

  it('should convert D50 white point to Lab white (100, 0, 0)', () => {
    const xyz = createBuffer(WHITE_D50);
    const lab = createBuffer([0, 0, 0]);
    xyz50ToLab(xyz, lab);

    expect(lab[0]).toBeCloseTo(100, 4);
    expect(lab[1]).toBeCloseTo(0, 4);
    expect(lab[2]).toBeCloseTo(0, 4);
  });

  it('should convert black to Lab (0, 0, 0)', () => {
    const xyz = createBuffer([0, 0, 0]);
    const lab = createBuffer([0, 0, 0]);
    xyz50ToLab(xyz, lab);

    expect(lab[0]).toBeCloseTo(0, 4);
    expect(lab[1]).toBeCloseTo(0, 4);
    expect(lab[2]).toBeCloseTo(0, 4);
  });

  it('should maintain round-trip integrity for a mid-tone color', () => {
    const originalXyz = createBuffer([0.4, 0.4, 0.4]);
    const lab = createBuffer([0, 0, 0]);
    const resultXyz = createBuffer([0, 0, 0]);
    xyz50ToLab(originalXyz, lab);
    labToXyz50(lab, resultXyz);

    expect(resultXyz[0]).toBeCloseTo(originalXyz[0], 4);
    expect(resultXyz[1]).toBeCloseTo(originalXyz[1], 4);
    expect(resultXyz[2]).toBeCloseTo(originalXyz[2], 4);
  });

  it('should correctly calculate the "a" and "b" chrominance axes', () => {
    const midXyz = createBuffer([
      0.96422 * 0.184,
      1.0 * 0.184,
      0.82521 * 0.184,
    ]);
    const lab = createBuffer([0, 0, 0]);
    xyz50ToLab(midXyz, lab);

    expect(lab[0]).toBeCloseTo(50, 1);
    expect(lab[1]).toBeCloseTo(0, 4);
    expect(lab[2]).toBeCloseTo(0, 4);
  });
});
