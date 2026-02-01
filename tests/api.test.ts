import { describe, expect, it } from 'vitest';
import { formatCss } from '~/format';
import { parseColor } from '~/parse';
import { color } from '~/shared/api';
import { getDistance, isEqual } from '~/shared/compare';
import { checkContrast, matchContrast } from '~/shared/contrast';
import { checkGamut, clampColor } from '~/shared/gamut';
import { createHarmony, createScales, createShades } from '~/shared/palette';
import { simulateDeficiency } from '~/shared/simulate';
import { createColor, deriveColor, mutateColor } from '~/utils';

describe('Color API', () => {
  describe('Creating and Mutating', () => {
    it('should mutate in-place and derive new copies', () => {
      const red = createColor('rgb', [1, 0, 0]);
      const originalBuffer = red.value;

      mutateColor(red, 'oklch');
      expect(red.space).toBe('oklch');
      expect(red.value).toBe(originalBuffer);

      const hslCopy = deriveColor(red, 'hsl');
      expect(hslCopy.space).toBe('hsl');
      expect(hslCopy.value).not.toBe(originalBuffer);
    });
  });

  describe('Reading and Writing CSS', () => {
    it('should parse oklab and format back correctly', () => {
      const css = 'oklab(62% -0.07 -0.15)';
      const color = parseColor(css);

      expect(color.space).toBe('oklab');
      expect(color.value[0]).toBeCloseTo(0.62);
      expect(formatCss(color)).toBe(css);
    });
  });

  describe('Contrast & Accessibility', () => {
    it('should calculate APCA and match contrast targets', () => {
      const text = parseColor('#ff0000');
      const bg = parseColor('#000000');

      const contrast = checkContrast(text, bg);
      expect(Math.abs(contrast)).toBeGreaterThan(0);

      const target = 60;
      const matched = matchContrast(text, bg, target);
      expect(Math.abs(checkContrast(matched, bg))).toBeGreaterThanOrEqual(
        target,
      );
    });
  });

  describe('Making things look nice (Palettes)', () => {
    it('should generate harmonies, shades, and scales', () => {
      const blue = parseColor('#0000ff');

      const mix = createHarmony(blue, [
        { name: 'analogous', ratios: [-30, 30] },
      ]);
      expect(mix[0].colors).toHaveLength(2);

      const shades = createShades(
        parseColor('#ff0000'),
        parseColor('#000000'),
        5,
      );
      expect(shades).toHaveLength(5);
      expect(shades[4].value[0]).toBeCloseTo(0);

      const scale = createScales(
        [parseColor('#ff0000'), parseColor('#ffff00'), parseColor('#00ff00')],
        7,
      );
      expect(scale).toHaveLength(7);
    });
  });

  describe('Safety and Comparison', () => {
    it('should validate gamut and handle comparisons', () => {
      const outOfGamut = createColor('rgb', [1.2, -0.1, 0.5]);
      expect(checkGamut(outOfGamut)).toBe(false);

      clampColor(outOfGamut);
      expect(checkGamut(outOfGamut)).toBe(true);

      const dist = getDistance(parseColor('#ff0000'), parseColor('#ee0000'));
      expect(dist).toBeGreaterThan(0);
      expect(dist).toBeLessThan(10);

      const rgbRed = parseColor('#ff0000');
      const hslRed = parseColor('hsl(0, 100%, 50%)');
      expect(isEqual(rgbRed, hslRed)).toBe(true);
    });
  });

  describe('Accessibility Simulation', () => {
    it('should simulate protanopia correctly', () => {
      const brand = parseColor('#32cd32');
      const simulated = simulateDeficiency(brand, 'protanopia');

      expect(simulated.space).toBe(brand.space);
      expect(simulated.value).not.toEqual(brand.value);
    });
  });
});

describe('Public API (color factory)', () => {
  it('should create a wrapper from a CSS string', () => {
    const c = color('rgb(255, 0, 0)');
    expect(c.space).toBe('rgb');
    expect(c.value[0]).toBe(1);
    expect(c.format()).toBe('rgb(255 0 0)');
  });

  it('should create a wrapper from space and values', () => {
    const c = color('hsl', [180, 1, 0.5]);
    expect(c.space).toBe('hsl');
    expect(c.format(undefined, false, 0)).toBe('hsl(180deg 100% 50%)');
  });

  it('should throw if space is provided without values', () => {
    expect(() => color('rgb')).toThrow(
      'Color values are required when space is provided',
    );
  });

  it('should support fluent conversion and formatting', () => {
    const result = color('rgb(255, 0, 0)').to('hsl').format(0.5, false, 0);

    expect(result).toBe('hsl(0deg 100% 50% / 50%)');
  });

  it('should support updating values immutably', () => {
    const c1 = color('rgb', [1, 0, 0]);
    const c2 = c1.update([0, 1, 0]);

    expect(c1.value[0]).toBe(1);
    expect(c2.value[0]).toBe(0);
    expect(c2.value[1]).toBe(1);
  });

  it('should clone correctly', () => {
    const c1 = color('lab', [50, 20, 20]);
    const c2 = c1.clone();
    expect(c2.raw()).not.toBe(c1.raw());
    expect(c2.raw()).toEqual(c1.raw());
  });
});
