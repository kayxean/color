import { describe, expect, it } from 'vitest';
import { parseColor } from '../src/parse';

describe('Color Parser', () => {
  describe('Hex Parsing', () => {
    it('should parse 3-digit hex', () => {
      const color = parseColor('#f00');
      expect(color.space).toBe('rgb');
      expect(color.value[0]).toBe(1);
      expect(color.alpha).toBe(1);
    });

    it('should parse 8-digit hex with alpha', () => {
      const color = parseColor('#0000ff80');
      expect(color.value[2]).toBe(1);
      expect(color.alpha).toBeCloseTo(0.5, 2);
    });
  });

  describe('Functional Notation (Modern & Legacy)', () => {
    it('should parse modern space-separated rgb', () => {
      const color = parseColor('rgb(255 128 0)');
      expect(color.value[0]).toBe(1);
      expect(color.value[1]).toBeCloseTo(0.5, 2);
    });

    it('should parse legacy comma-separated rgba', () => {
      const color = parseColor('rgba(0, 255, 0, 0.5)');
      expect(color.space).toBe('rgb');
      expect(color.value[1]).toBe(1);
      expect(color.alpha).toBe(0.5);
    });

    it('should parse oklch with percentage lightness', () => {
      const color = parseColor('oklch(62.8% 0.25 29)');
      expect(color.space).toBe('oklch');
      expect(color.value[0]).toBeCloseTo(0.628, 3);
      expect(color.value[1]).toBe(0.25);
      expect(color.value[2]).toBe(29);
    });

    it('should handle percentage alpha strings', () => {
      const color = parseColor('lab(50% 10 -10 / 25%)');
      expect(color.alpha).toBe(0.25);
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid hex length', () => {
      expect(() => parseColor('#ff')).toThrow('Invalid Hex length');
    });

    it('should throw on unrecognized formats', () => {
      expect(() => parseColor('not-a-color')).toThrow(
        'Unrecognized color format',
      );
    });
  });
});
