import { describe, expect, it } from 'vitest';
import { xyz50ToXyz65, xyz65ToXyz50 } from '../../src/adapters/cat';
import { createBuffer } from '../../src/utils';

describe('CAT Adapter (Bradford Transform)', () => {
  const D65_WHITE = [0.95047, 1.0, 1.08883];
  const D50_WHITE = [0.96422, 1.0, 0.82521];

  it('should accurately transform D65 white to D50 white', () => {
    const input = createBuffer(D65_WHITE);
    const output = createBuffer([0, 0, 0]);
    xyz65ToXyz50(input, output);

    expect(output[0]).toBeCloseTo(D50_WHITE[0], 4);
    expect(output[1]).toBeCloseTo(D50_WHITE[1], 4);
    expect(output[2]).toBeCloseTo(D50_WHITE[2], 4);
  });

  it('should accurately transform D50 white back to D65 white', () => {
    const input = createBuffer(D50_WHITE);
    const output = createBuffer([0, 0, 0]);
    xyz50ToXyz65(input, output);

    expect(output[0]).toBeCloseTo(D65_WHITE[0], 4);
    expect(output[1]).toBeCloseTo(D65_WHITE[1], 4);
    expect(output[2]).toBeCloseTo(D65_WHITE[2], 4);
  });

  it('should be reversible (round-trip integrity)', () => {
    const original = createBuffer([0.5, 0.4, 0.3]);
    const temp = createBuffer([0, 0, 0]);
    const result = createBuffer([0, 0, 0]);

    xyz65ToXyz50(original, temp);
    xyz50ToXyz65(temp, result);

    expect(result[0]).toBeCloseTo(original[0], 4);
    expect(result[1]).toBeCloseTo(original[1], 4);
    expect(result[2]).toBeCloseTo(original[2], 4);
  });
});
