import type { ColorMatrix, ColorSpace, ColorValues } from '~/core/types';
import { describe, expect, it } from 'vitest';
import {
  multiplyMatrixVector,
  xyz50ToXyz65,
  xyz65ToXyz50,
} from '~/adapters/cat';

describe('cat adapter (Chromatic Adaptation Transform)', () => {
  describe('multiplyMatrixVector', () => {
    it('should correctly multiply a matrix and a vector', () => {
      const matrix: ColorMatrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      const vector: ColorValues = [1, 1, 1];
      expect(multiplyMatrixVector(matrix, vector)).toEqual([6, 15, 24]);
    });

    it('should return zeros for a zero vector', () => {
      const matrix: ColorMatrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];
      expect(multiplyMatrixVector(matrix, [0, 0, 0])).toEqual([0, 0, 0]);
    });
  });

  describe('D65 to D50 Conversion', () => {
    it('should map D65 white point to D50 white point', () => {
      const whiteD65 = [0.95047, 1.0, 1.08883] as ColorSpace<'xyz65'>;
      const result = xyz65ToXyz50(whiteD65);
      expect(result[0]).toBeCloseTo(0.96422, 4);
      expect(result[1]).toBeCloseTo(1.0, 4);
      expect(result[2]).toBeCloseTo(0.82521, 4);
    });

    it('should map Black to Black', () => {
      const black = [0, 0, 0] as ColorSpace<'xyz65'>;
      const result = xyz65ToXyz50(black);
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe('D50 to D65 Conversion', () => {
    it('should map D50 white point to D65 white point', () => {
      const whiteD50 = [0.96422, 1.0, 0.82521] as ColorSpace<'xyz50'>;
      const result = xyz50ToXyz65(whiteD50);
      expect(result[0]).toBeCloseTo(0.95047, 4);
      expect(result[1]).toBeCloseTo(1.0, 4);
      expect(result[2]).toBeCloseTo(1.08883, 4);
    });
  });

  describe('Round-tripping (Inversion)', () => {
    it('should be reversible (D65 -> D50 -> D65)', () => {
      const original = [0.4, 0.5, 0.6] as ColorSpace<'xyz65'>;
      const toD50 = xyz65ToXyz50(original);
      const backToD65 = xyz50ToXyz65(toD50);
      expect(backToD65[0]).toBeCloseTo(original[0], 4);
      expect(backToD65[1]).toBeCloseTo(original[1], 4);
      expect(backToD65[2]).toBeCloseTo(original[2], 4);
    });
  });
});
