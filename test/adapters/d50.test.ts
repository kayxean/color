import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import { labToXyz50, xyz50ToLab } from '~/adapters/d50';

describe('d50 adapter (XYZ D50 <-> Lab)', () => {
  const whiteXYZ = [0.96422, 1.0, 0.82521] as ColorSpace<'xyz50'>;
  const whiteLab = [100, 0, 0] as ColorSpace<'lab'>;
  const blackXYZ = [0, 0, 0] as ColorSpace<'xyz50'>;
  const blackLab = [0, 0, 0] as ColorSpace<'lab'>;

  describe('xyz50ToLab', () => {
    it('should convert D50 white point to Lab white', () => {
      const result = xyz50ToLab(whiteXYZ);
      expect(result[0]).toBeCloseTo(whiteLab[0], 4);
      expect(result[1]).toBeCloseTo(whiteLab[1], 4);
      expect(result[2]).toBeCloseTo(whiteLab[2], 4);
    });

    it('should convert XYZ black to Lab black', () => {
      const result = xyz50ToLab(blackXYZ);
      expect(result).toEqual(blackLab);
    });

    it('should handle mid-range values (e.g., 18% Gray)', () => {
      const grayXYZ = [0.1777, 0.1843, 0.1521] as ColorSpace<'xyz50'>;
      const result = xyz50ToLab(grayXYZ);
      expect(result[0]).toBeCloseTo(50, 1);
    });
  });

  describe('labToXyz50', () => {
    it('should convert Lab white back to XYZ D50', () => {
      const result = labToXyz50(whiteLab);
      expect(result[0]).toBeCloseTo(whiteXYZ[0], 5);
      expect(result[1]).toBeCloseTo(whiteXYZ[1], 5);
      expect(result[2]).toBeCloseTo(whiteXYZ[2], 5);
    });

    it('should convert Lab black back to XYZ black', () => {
      const result = labToXyz50(blackLab);
      expect(result[0]).toBeCloseTo(0, 5);
      expect(result[1]).toBeCloseTo(0, 5);
      expect(result[2]).toBeCloseTo(0, 5);
    });
  });

  describe('Round-tripping (Inversion)', () => {
    it('should be reversible for standard colors', () => {
      const original = [60, 25, -35] as ColorSpace<'lab'>;
      const toXYZ = labToXyz50(original);
      const backToLab = xyz50ToLab(toXYZ);
      expect(backToLab[0]).toBeCloseTo(original[0], 5);
      expect(backToLab[1]).toBeCloseTo(original[1], 5);
      expect(backToLab[2]).toBeCloseTo(original[2], 5);
    });

    it('should be reversible for very dark colors (near threshold)', () => {
      const darkLab = [8, 0, 0] as ColorSpace<'lab'>;
      const toXYZ = labToXyz50(darkLab);
      const backToLab = xyz50ToLab(toXYZ);
      expect(backToLab[0]).toBeCloseTo(darkLab[0], 4);
      expect(backToLab[1]).toBeCloseTo(darkLab[1], 4);
      expect(backToLab[2]).toBeCloseTo(darkLab[2], 4);
    });
  });
});
