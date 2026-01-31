import { describe, expect, it } from 'vitest';
import {
  cloneColor,
  createBuffer,
  createColor,
  deriveColor,
  mutateColor,
  updateColor,
} from '~/utils';

describe('Utility Helpers', () => {
  describe('createBuffer', () => {
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
  });

  describe('createColor', () => {
    it('should create a color object with the correct space and buffer', () => {
      const color = createColor('rgb', [1, 0, 0]);
      expect(color.space).toBe('rgb');
      expect(color.value).toBeInstanceOf(Float32Array);
      expect(color.value[0]).toBe(1);
    });
  });

  describe('cloneColor', () => {
    it('should clone a color into a new memory reference', () => {
      const original = createColor('rgb', [1, 1, 1]);
      const clone = cloneColor(original);

      expect(clone).not.toBe(original);
      expect(clone.value).not.toBe(original.value);
      expect(clone.value).toEqual(original.value);
    });
  });

  describe('updateColor', () => {
    it('should update the buffer values from an array', () => {
      const color = createColor('rgb', [0, 0, 0]);
      updateColor(color, [1, 1, 1]);
      expect(color.value[0]).toBe(1);
      expect(color.value[1]).toBe(1);
      expect(color.value[2]).toBe(1);
    });

    it('should update the buffer values from a Float32Array', () => {
      const color = createColor('rgb', [0, 0, 0]);
      const newValues = new Float32Array([0.5, 0.5, 0.5]);
      updateColor(color, newValues);
      expect(color.value[0]).toBe(0.5);
    });
  });

  describe('mutateColor', () => {
    it('should mutate the color in-place', () => {
      const color = createColor('rgb', [1, 0, 0]);
      const originalBuffer = color.value;

      mutateColor(color, 'hsv');

      expect(color.space).toBe('hsv');
      expect(color.value).toBe(originalBuffer);
    });

    it('should early return if the target space is the same as the current space', () => {
      const color = createColor('rgb', [1, 1, 1]);
      const originalValue = color.value[0];

      mutateColor(color, 'rgb');

      expect(color.space).toBe('rgb');
      expect(color.value[0]).toBe(originalValue);
    });
  });

  describe('deriveColor', () => {
    it('should create a new instance when deriving to a different space', () => {
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
