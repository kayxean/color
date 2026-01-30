import { describe, expect, it } from 'vitest';
import { simulateDeficiency } from '../../src/shared/simulate';
import { createColor } from '../../src/utils';

describe('Color Deficiency Simulation', () => {
  it('should simulate Achromatopsia (Total Color Blindness)', () => {
    const red = createColor('rgb', [1, 0, 0]);
    const simulated = simulateDeficiency(red, 'achromatopsia');
    const [r, g, b] = simulated.value;

    expect(Math.abs(r - g)).toBeLessThan(0.08);
    expect(Math.abs(g - b)).toBeLessThan(0.08);
    expect(r).toBeGreaterThan(0.4);
    expect(r).toBeLessThan(0.7);
  });

  it('should significantly change Red in Protanopia', () => {
    const red = createColor('rgb', [1, 0, 0]);
    const simulated = simulateDeficiency(red, 'protanopia');

    expect(simulated.value[0]).toBeLessThan(1);
    expect(simulated.value[1]).toBeGreaterThan(0);
  });

  it('should keep Blue relatively stable in Deuteranopia', () => {
    const blue = createColor('rgb', [0, 0, 1]);
    const simulated = simulateDeficiency(blue, 'deuteranopia');

    expect(simulated.value[2]).toBeGreaterThan(0.8);
  });

  it('should collapse Blue/Yellow distinction in Tritanopia', () => {
    const yellow = createColor('rgb', [1, 1, 0]);
    const simulated = simulateDeficiency(yellow, 'tritanopia');

    expect(simulated.value[2]).toBeGreaterThan(0);
  });

  it('should handle colors in non-D65 spaces (Lab)', () => {
    const labRed = createColor('lab', [53, 80, 67]);
    const simulated = simulateDeficiency(labRed, 'protanopia');

    expect(simulated.space).toBe('lab');
    expect(Math.abs(simulated.value[1])).toBeLessThan(80);
  });
});
