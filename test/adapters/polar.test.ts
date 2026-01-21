import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import {
  labToLch,
  lchToLab,
  oklabToOklch,
  oklchToOklab,
} from '~/adapters/polar';

describe('polar adapter (Lab/Oklab <-> LCH/Oklch)', () => {
  describe('Lab <-> LCH', () => {
    it('should convert Lab to LCH correctly (Quadrant 1)', () => {
      const result = labToLch([50, 10, 10] as ColorSpace<'lab'>);
      expect(result[0]).toBe(50);
      expect(result[1]).toBeCloseTo(Math.sqrt(200), 5);
      expect(result[2]).toBeCloseTo(45, 5);
    });

    it('should handle negative coordinates and wrap Hue correctly', () => {
      const result = labToLch([50, 0, -10] as ColorSpace<'lab'>);
      expect(result[2]).toBe(270);
    });

    it('should convert LCH back to Lab', () => {
      const input = [70, 20, 180] as ColorSpace<'lch'>;
      const result = lchToLab(input);
      expect(result[0]).toBe(70);
      expect(result[1]).toBeCloseTo(-20, 5);
      expect(result[2]).toBeCloseTo(0, 5);
    });
  });

  describe('Oklab <-> Oklch', () => {
    it('should convert Oklab to Oklch correctly', () => {
      const result = oklabToOklch([0.5, 0.1, 0.1] as ColorSpace<'oklab'>);
      expect(result[0]).toBe(0.5);
      expect(result[1]).toBeCloseTo(Math.sqrt(0.02), 5);
      expect(result[2]).toBeCloseTo(45, 5);
    });

    it('should convert Oklch back to Oklab', () => {
      const input = [1, 0.1, 90] as ColorSpace<'oklch'>;
      const result = oklchToOklab(input);
      expect(result[0]).toBe(1);
      expect(result[1]).toBeCloseTo(0, 5);
      expect(result[2]).toBeCloseTo(0.1, 5);
    });
  });

  describe('Round-tripping and Neutral Colors', () => {
    it('should be reversible', () => {
      const original = [50, 30, 125] as ColorSpace<'lch'>;
      const lab = lchToLab(original);
      const back = labToLch(lab);
      expect(back[0]).toBeCloseTo(original[0], 5);
      expect(back[1]).toBeCloseTo(original[1], 5);
      expect(back[2]).toBeCloseTo(original[2], 5);
    });

    it('should handle neutral colors (chroma 0)', () => {
      const result = labToLch([50, 0, 0] as ColorSpace<'lab'>);
      expect(result[1]).toBe(0);
      expect(result[2]).toBe(0);
    });
  });
});
