import { describe, expect, it } from 'vitest';
import {
  lrgbToXyz65,
  oklabToXyz65,
  xyz65ToLrgb,
  xyz65ToOklab,
} from '../../src/adapters/d65';
import { createBuffer } from '../../src/utils';

describe('D65 Adapter (LRGB & Oklab)', () => {
  const D65_WHITE_XYZ = [0.95047, 1.0, 1.08883];

  describe('Linear RGB (LRGB)', () => {
    it('should convert XYZ D65 white to full LRGB (1, 1, 1)', () => {
      const xyz = createBuffer(D65_WHITE_XYZ);
      const lrgb = createBuffer([0, 0, 0]);
      xyz65ToLrgb(xyz, lrgb);

      expect(lrgb[0]).toBeCloseTo(1, 4);
      expect(lrgb[1]).toBeCloseTo(1, 4);
      expect(lrgb[2]).toBeCloseTo(1, 4);
    });

    it('should maintain round-trip integrity for LRGB', () => {
      const original = createBuffer([0.2, 0.5, 0.8]);
      const xyz = createBuffer([0, 0, 0]);
      const result = createBuffer([0, 0, 0]);

      lrgbToXyz65(original, xyz);
      xyz65ToLrgb(xyz, result);

      expect(result[0]).toBeCloseTo(original[0], 5);
      expect(result[1]).toBeCloseTo(original[1], 5);
      expect(result[2]).toBeCloseTo(original[2], 5);
    });
  });

  describe('Oklab', () => {
    it('should convert XYZ D65 white to Oklab white (1, 0, 0)', () => {
      const xyz = createBuffer(D65_WHITE_XYZ);
      const oklab = createBuffer([0, 0, 0]);
      xyz65ToOklab(xyz, oklab);

      expect(oklab[0]).toBeCloseTo(1, 4);
      expect(oklab[1]).toBeCloseTo(0, 3);
      expect(oklab[2]).toBeCloseTo(0, 3);
    });

    it('should convert black to Oklab (0, 0, 0)', () => {
      const xyz = createBuffer([0, 0, 0]);
      const oklab = createBuffer([0, 0, 0]);
      xyz65ToOklab(xyz, oklab);

      expect(oklab[0]).toBeCloseTo(0, 4);
      expect(oklab[1]).toBeCloseTo(0, 4);
      expect(oklab[2]).toBeCloseTo(0, 4);
    });

    it('should maintain round-trip integrity for Oklab', () => {
      const original = createBuffer([0.6, 0.1, -0.1]);
      const xyz = createBuffer([0, 0, 0]);
      const result = createBuffer([0, 0, 0]);

      oklabToXyz65(original, xyz);
      xyz65ToOklab(xyz, result);

      expect(result[0]).toBeCloseTo(original[0], 4);
      expect(result[1]).toBeCloseTo(original[1], 4);
      expect(result[2]).toBeCloseTo(original[2], 4);
    });
  });
});
