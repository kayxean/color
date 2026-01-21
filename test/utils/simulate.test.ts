import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import { simulateDeficiency } from '~/utils/simulate';

describe('simulateDeficiency', () => {
  const red = [1, 0, 0] as ColorSpace<'rgb'>;
  const white = [1, 1, 1] as ColorSpace<'rgb'>;

  describe('Protanopia (Red-Blind)', () => {
    it('should significantly shift red towards olive/yellow', () => {
      const result = simulateDeficiency(red, 'rgb', 'protanopia');
      expect(result[0]).toBeLessThan(1);
      expect(result[1]).toBeGreaterThan(0);
    });

    it('should keep white relatively neutral', () => {
      const result = simulateDeficiency(white, 'rgb', 'protanopia');
      expect(result[0]).toBeCloseTo(1, 0);
      expect(result[1]).toBeCloseTo(1, 0);
    });
  });

  describe('Deuteranopia (Green-Blind)', () => {
    it('should shift red and green toward similar values', () => {
      const redSim = simulateDeficiency(red, 'rgb', 'deuteranopia');
      const green = [0, 1, 0] as ColorSpace<'rgb'>;
      const greenSim = simulateDeficiency(green, 'rgb', 'deuteranopia');
      expect(Math.abs(redSim[0] - greenSim[0])).toBeLessThan(0.3);
    });
  });

  describe('Achromatopsia (Total Color Blindness)', () => {
    it('should result in nearly equal R, G, and B values', () => {
      const result = simulateDeficiency(red, 'rgb', 'achromatopsia');
      const maxDiff = Math.max(
        Math.abs(result[0] - result[1]),
        Math.abs(result[1] - result[2]),
      );
      expect(maxDiff).toBeLessThan(0.1);
    });
  });

  describe('Cross-Hub Support', () => {
    it('should correctly handle Lab (D50) inputs', () => {
      const labWhite = [100, 0, 0] as ColorSpace<'lab'>;
      const result = simulateDeficiency(labWhite, 'lab', 'achromatopsia');
      expect(result[0]).toBeGreaterThan(95);
      expect(Math.abs(result[1])).toBeLessThan(10);
      expect(Math.abs(result[2])).toBeLessThan(10);
    });
  });
});
