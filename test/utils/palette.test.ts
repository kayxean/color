import type { ColorSpace } from '~/core/types';
import { describe, expect, it } from 'vitest';
import {
  createHarmony,
  createScales,
  createShades,
  mixColor,
} from '~/utils/palette';

describe('palette utils', () => {
  describe('createHarmony', () => {
    it('should create a complementary harmony (180deg)', () => {
      const red = [1, 0, 0] as ColorSpace<'rgb'>;
      const variants = [{ name: 'complementary', ratios: [180] }];
      const result = createHarmony(red, 'rgb', variants);
      expect(result[0].name).toBe('complementary');
      const harmonyColor = result[0].colors[0];
      expect(harmonyColor[0]).toBeCloseTo(0, 1);
      expect(harmonyColor[1]).toBeCloseTo(1, 1);
      expect(harmonyColor[2]).toBeCloseTo(1, 1);
    });

    it('should wrap hue correctly for harmonies', () => {
      const blue = [240, 1, 0.5] as ColorSpace<'hsl'>;
      const variants = [{ name: 'split', ratios: [150] }];
      const result = createHarmony(blue, 'hsl', variants);
      expect(result[0].colors[0][0]).toBe(30);
    });
  });

  describe('mixColor (Interpolation)', () => {
    it('should linearly interpolate non-hue channels', () => {
      const start = [0, 0, 0] as ColorSpace<'rgb'>;
      const end = [1, 1, 1] as ColorSpace<'rgb'>;
      const mid = mixColor(start, end, 'rgb', 0.5);
      expect(mid).toEqual([0.5, 0.5, 0.5]);
    });

    it('should use shortest path for hue (across 0/360 boundary)', () => {
      const start = [350, 1, 0.5] as ColorSpace<'hsl'>;
      const end = [10, 1, 0.5] as ColorSpace<'hsl'>;
      const mid = mixColor(start, end, 'hsl', 0.5);
      expect(mid[0]).toBe(0);
    });

    it('should use shortest path for hue (backwards across boundary)', () => {
      const start = [10, 1, 0.5] as ColorSpace<'hsl'>;
      const end = [350, 1, 0.5] as ColorSpace<'hsl'>;
      const mid = mixColor(start, end, 'hsl', 0.5);
      expect(mid[0]).toBe(0);
    });
  });

  describe('createShades & createScales', () => {
    it('should generate correct number of steps', () => {
      const start = [0, 0, 0] as ColorSpace<'rgb'>;
      const end = [1, 1, 1] as ColorSpace<'rgb'>;
      const result = createShades(start, end, 'rgb', 5);
      expect(result).toHaveLength(5);
      expect(result[2]).toEqual([0.5, 0.5, 0.5]);
    });

    it('should handle multi-stop scales', () => {
      const stops: ColorSpace<'rgb'>[] = [
        [1, 0, 0] as ColorSpace<'rgb'>,
        [0, 1, 0] as ColorSpace<'rgb'>,
        [0, 0, 1] as ColorSpace<'rgb'>,
      ];
      const scale = createScales(stops, 'rgb', 3);
      expect(scale).toHaveLength(3);
      expect(scale[0]).toEqual(stops[0]);
      expect(scale[1]).toEqual(stops[1]);
      expect(scale[2]).toEqual(stops[2]);
    });

    it('should interpolate hue across segments in scales', () => {
      const stops: ColorSpace<'oklch'>[] = [
        [0.7, 0.1, 350] as ColorSpace<'oklch'>,
        [0.7, 0.1, 10] as ColorSpace<'oklch'>,
      ];
      const scale = createScales(stops, 'oklch', 3);
      expect(scale[1][2]).toBe(0);
    });
  });
});
