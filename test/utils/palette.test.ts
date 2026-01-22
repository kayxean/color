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

    it('should rotate hue at index 0 for HWB', () => {
      const input = [0, 0, 0] as ColorSpace<'hwb'>;
      const variants = [{ name: 'complementary', ratios: [180] }];
      const result = createHarmony(input, 'hwb', variants);
      expect(result[0].colors[0][0]).toBe(180);
      expect(result[0].colors[0][1]).toBe(0);
    });

    it('should rotate hue at index 2 for LCH', () => {
      const input = [50, 30, 0] as ColorSpace<'lch'>;
      const variants = [{ name: 'complementary', ratios: [180] }];
      const result = createHarmony(input, 'lch', variants);
      expect(result[0].colors[0][2]).toBe(180);
      expect(result[0].colors[0][0]).toBe(50);
    });

    it('should rotate hue at index 2 for OKLCH', () => {
      const input = [0.7, 0.1, 350] as ColorSpace<'oklch'>;
      const variants = [{ name: 'split', ratios: [20] }];
      const result = createHarmony(input, 'oklch', variants);
      expect(result[0].colors[0][2]).toBe(10);
      expect(result[0].colors[0][1]).toBe(0.1);
    });

    it('should create Lab harmonies by internally converting to LCH', () => {
      const input = [50, 20, 20] as ColorSpace<'lab'>;
      const variants = [{ name: 'complementary', ratios: [180] }];
      const result = createHarmony(input, 'lab', variants);
      expect(result[0].name).toBe('complementary');
      const harmonyColor = result[0].colors[0];
      expect(harmonyColor[0]).toBeCloseTo(50, 0);
      expect(harmonyColor[1]).toBeLessThan(0);
      expect(harmonyColor[2]).toBeLessThan(0);
    });

    it('should create OKLab harmonies by internally converting to OKLCH', () => {
      const input = [0.7, 0.1, 0.1] as ColorSpace<'oklab'>;
      const variants = [{ name: 'complementary', ratios: [180] }];
      const result = createHarmony(input, 'oklab', variants);
      expect(result[0].colors[0][0]).toBeCloseTo(0.7, 1);
      expect(result[0].colors[0][1]).not.toBe(0.1);
    });

    it('should normalize negative hues when ratios are negative', () => {
      const input = [30, 1, 0.5] as ColorSpace<'hsl'>;
      const variants = [{ name: 'negative-rotation', ratios: [-60] }];
      const result = createHarmony(input, 'hsl', variants);
      expect(result[0].colors[0][0]).toBe(330);
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

    it('should clamp weight t to 0 if negative', () => {
      const start = [1, 0, 0] as ColorSpace<'rgb'>;
      const end = [0, 1, 0] as ColorSpace<'rgb'>;
      const result = mixColor(start, end, 'rgb', -1);
      expect(result).toEqual(start);
    });

    it('should clamp weight t to 1 if greater than 1', () => {
      const start = [1, 0, 0] as ColorSpace<'rgb'>;
      const end = [0, 1, 0] as ColorSpace<'rgb'>;
      const result = mixColor(start, end, 'rgb', 2);
      expect(result).toEqual(end);
    });

    it('should correctly identify hue at index 2 for oklch/lch', () => {
      const start = [0.7, 0.1, 350] as ColorSpace<'oklch'>;
      const end = [0.7, 0.1, 10] as ColorSpace<'oklch'>;
      const mid = mixColor(start, end, 'oklch', 0.5);
      expect(mid[2]).toBe(0);
    });

    it('should wrap eH when diff > 180 (clockwise wrap)', () => {
      const start = [10, 1, 0.5] as ColorSpace<'hsl'>;
      const end = [350, 1, 0.5] as ColorSpace<'hsl'>;
      const mid = mixColor(start, end, 'hsl', 0.5);
      expect(mid[0]).toBe(0);
    });

    it('should normalize negative resulting hues', () => {
      const start = [20, 1, 0.5] as ColorSpace<'hsl'>;
      const end = [350, 1, 0.5] as ColorSpace<'hsl'>;
      const result = mixColor(start, end, 'hsl', 0.9);
      expect(result[0]).toBe(353);
    });

    it('should not wrap hue when diff is less than 180 (standard path)', () => {
      const start = [10, 1, 0.5] as ColorSpace<'hsl'>;
      const end = [50, 1, 0.5] as ColorSpace<'hsl'>;
      const mid = mixColor(start, end, 'hsl', 0.5);
      expect(mid[0]).toBe(30);
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

    it('createShades: should return start color if steps <= 1', () => {
      const start = [1, 0, 0] as ColorSpace<'rgb'>;
      const end = [0, 0, 1] as ColorSpace<'rgb'>;
      expect(createShades(start, end, 'rgb', 1)).toEqual([start]);
      expect(createShades(start, end, 'rgb', 0)).toEqual([start]);
    });

    it('createScales: should return stops if stops.length < 2', () => {
      const stops = [[1, 0, 0]] as ColorSpace<'rgb'>[];
      expect(createScales(stops, 'rgb', 5)).toEqual(stops);
    });

    it('createScales: should clamp index at the final step', () => {
      const stops = [
        [0, 0, 0],
        [1, 1, 1],
      ] as ColorSpace<'rgb'>[];
      const result = createScales(stops, 'rgb', 2);
      expect(result[1]).toEqual([1, 1, 1]);
    });

    it('createShades: should wrap hue for HSL (index 0)', () => {
      const start = [350, 1, 0.5] as ColorSpace<'hsl'>;
      const end = [10, 1, 0.5] as ColorSpace<'hsl'>;
      const result = createShades(start, end, 'hsl', 3);
      expect(result[1][0]).toBe(0);
    });

    it('createShades: should wrap hue for LCH (index 2)', () => {
      const start = [50, 30, 10] as ColorSpace<'lch'>;
      const end = [50, 30, 350] as ColorSpace<'lch'>;
      const result = createShades(start, end, 'lch', 3);
      expect(result[1][2]).toBe(0);
    });

    it('createShades: should normalize negative resulting hues', () => {
      const start = [10, 1, 0.5] as ColorSpace<'hsl'>;
      const end = [350, 1, 0.5] as ColorSpace<'hsl'>;
      const result = createShades(start, end, 'hsl', 10);
      expect(result[9][0]).toBeGreaterThan(0);
    });

    it('createShades: should not wrap hue for HSL when diff is small (Index 0 Else)', () => {
      const start = [10, 1, 0.5] as ColorSpace<'hsl'>;
      const end = [50, 1, 0.5] as ColorSpace<'hsl'>;
      const result = createShades(start, end, 'hsl', 3);
      expect(result[1][0]).toBe(30);
    });

    it('createShades: should not wrap hue for OKLCH when diff is small (Index 2 Else)', () => {
      const start = [0.7, 0.1, 100] as ColorSpace<'oklch'>;
      const end = [0.7, 0.1, 140] as ColorSpace<'oklch'>;
      const result = createShades(start, end, 'oklch', 3);
      expect(result[1][2]).toBe(120);
    });

    it('createShades: should skip hue logic entirely for non-polar spaces', () => {
      const start = [0, 0, 0] as ColorSpace<'rgb'>;
      const end = [1, 1, 1] as ColorSpace<'rgb'>;
      const result = createShades(start, end, 'rgb', 3);
      expect(result[1]).toEqual([0.5, 0.5, 0.5]);
    });

    it('createShades (LCH): should wrap hue clockwise (diff > 180)', () => {
      const start = [50, 30, 10] as ColorSpace<'lch'>;
      const end = [50, 30, 350] as ColorSpace<'lch'>;
      const result = createShades(start, end, 'lch', 3);
      expect(result[1][2]).toBeCloseTo(0, 1);
    });

    it('createShades (OKLCH): should wrap hue counter-clockwise (diff < -180)', () => {
      const start = [0.7, 0.1, 350] as ColorSpace<'oklch'>;
      const end = [0.7, 0.1, 10] as ColorSpace<'oklch'>;
      const result = createShades(start, end, 'oklch', 3);
      expect(result[1][2]).toBeCloseTo(0, 1);
    });

    it('createScales: should interpolate standard channels (non-hue)', () => {
      const stops = [
        [0, 0, 0],
        [100, 50, 50],
      ] as ColorSpace<'lab'>[];
      const result = createScales(stops, 'lab', 3);
      expect(result[1]).toEqual([50, 25, 25]);
    });

    it('createScales: should use hue index 0 for HSL', () => {
      const stops = [
        [0, 1, 0.5],
        [120, 1, 0.5],
      ] as ColorSpace<'hsl'>[];
      const result = createScales(stops, 'hsl', 3);
      expect(result[1][0]).toBe(60);
    });

    it('createScales: should cover all hue diff branches (wrap vs no-wrap)', () => {
      const stops = [
        [10, 1, 0.5],
        [50, 1, 0.5],
        [350, 1, 0.5],
        [10, 1, 0.5],
      ] as ColorSpace<'hsl'>[];
      const result = createScales(stops, 'hsl', 4);
      expect(result[0][0]).toBe(10);
      expect(result[1][0]).toBe(50);
      expect(result[2][0]).toBe(350);
      expect(result[3][0]).toBe(10);
    });

    it('createScales: should normalize negative hues (h < 0 path)', () => {
      const stops = [
        [10, 1, 0.5],
        [350, 1, 0.5],
      ] as ColorSpace<'hsl'>[];
      const result = createScales(stops, 'hsl', 11);
      expect(result[9][0]).toBe(352);
    });
  });
});
