import { describe, expect, it } from 'vitest';
import { checkGamut, clampColor } from '../../src/shared/gamut';
import { createColor } from '../../src/utils';

describe('Gamut Management', () => {
  describe('checkGamut', () => {
    it('should return true for valid sRGB colors', () => {
      const color = createColor('rgb', [0.5, 0.2, 0.9]);
      expect(checkGamut(color)).toBe(true);
    });

    it('should return false for out-of-bounds RGB', () => {
      const color = createColor('rgb', [1.1, 0, 0]);
      expect(checkGamut(color)).toBe(false);
    });

    it('should respect tolerance for floating point noise', () => {
      const color = createColor('rgb', [1.0001, 0, 0]);
      expect(checkGamut(color)).toBe(false);
      expect(checkGamut(color, 0.001)).toBe(true);
    });

    it('should ignore hue range in checkGamut (always valid via wrapping)', () => {
      const color = createColor('hsl', [400, 0.5, 0.5]);
      expect(checkGamut(color)).toBe(true);
    });
  });

  describe('clampColor', () => {
    it('should clip linear values to bounds', () => {
      const color = createColor('rgb', [1.5, -0.2, 0.5]);
      clampColor(color);

      expect(color.value[0]).toBe(1);
      expect(color.value[1]).toBe(0);
      expect(color.value[2]).toBe(0.5);
    });

    it('should wrap hue values (circular clamping)', () => {
      const color = createColor('lch', [50, 20, 370]);
      clampColor(color);
      expect(color.value[2]).toBe(10);

      color.value[2] = -10;
      clampColor(color);
      expect(color.value[2]).toBe(350);
    });

    it('should return a new object when mutate=false', () => {
      const color = createColor('rgb', [2, 2, 2]);
      const clamped = clampColor(color, false);

      expect(clamped).not.toBe(color);
      expect(clamped.value).not.toBe(color.value);
      expect(clamped.value[0]).toBe(1);
      expect(color.value[0]).toBe(2);
    });
  });
});
