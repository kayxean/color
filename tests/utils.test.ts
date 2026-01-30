import { describe, expect, it } from 'vitest';
import {
  cloneColor,
  createBuffer,
  createColor,
  deriveColor,
  mutateColor,
} from '../src/utils';

describe('Utility Helpers', () => {
  describe('Memory & Buffers', () => {
    it('should create a Float32Array buffer from an array', () => {
      const buffer = createBuffer([1, 0.5, 0]);
      expect(buffer).toBeInstanceOf(Float32Array);
      expect(buffer[0]).toBe(1);
    });

    it('should throw if the data length is not 3', () => {
      expect(() => createBuffer([1, 1] as any)).toThrow(
        'ColorArray must have length 3',
      );
    });

    it('should clone a color into a new memory reference', () => {
      const original = createColor('rgb', [1, 1, 1]);
      const clone = cloneColor(original);

      expect(clone).not.toBe(original);
      expect(clone.value).not.toBe(original.value);
      expect(clone.value).toEqual(original.value);
    });
  });

  describe('Mutation vs Derivation', () => {
    it('should mutate in-place (mutateColor)', () => {
      const color = createColor('rgb', [1, 0, 0]);
      const originalBuffer = color.value;

      mutateColor(color, 'hsv');

      expect(color.space).toBe('hsv');
      expect(color.value).toBe(originalBuffer);
      expect(color.value[0]).toBe(0);
    });

    it('should create a new instance when deriving (deriveColor)', () => {
      const color = createColor('rgb', [1, 0, 0]);
      const derived = deriveColor(color, 'hsv');

      expect(derived.space).toBe('hsv');
      expect(derived).not.toBe(color);
      expect(derived.value).not.toBe(color.value);
      expect(color.space).toBe('rgb');
    });

    it('should simply clone if deriving to the same space', () => {
      const color = createColor('rgb', [0, 1, 0]);
      const derived = deriveColor(color, 'rgb');

      expect(derived.value).toEqual(color.value);
      expect(derived).not.toBe(color);
    });
  });
});
