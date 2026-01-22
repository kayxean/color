import type { ColorMode, ColorSpace } from './types';

export const parseColor = (
  css: string,
): { alpha: number; mode: ColorMode; values: ColorSpace<ColorMode> } => {
  const trimmed = css.trim();

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    let r = 0,
      g = 0,
      b = 0,
      a = 1;

    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      if (hex.length === 8) a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
      throw new Error('Invalid Hexadecimal length');
    }

    return {
      alpha: a,
      mode: 'rgb',
      values: [r / 255, g / 255, b / 255] as ColorSpace<'rgb'>,
    };
  }

  const openParen = trimmed.indexOf('(');
  const closeParen = trimmed.lastIndexOf(')');

  if (openParen !== -1 && closeParen !== -1) {
    const rawMode = trimmed.slice(0, openParen).toLowerCase();
    const mode = rawMode.replace(/a$/, '') as ColorMode;
    const content = trimmed.slice(openParen + 1, closeParen);

    const parts = content.split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) throw new Error(`Invalid color values: ${css}`);

    const v0 = parseFloat(parts[0]);
    const v1 = parseFloat(parts[1]);
    const v2 = parseFloat(parts[2]);

    let alpha = 1;
    if (parts[3]) {
      const rawAlpha = parts[3];
      alpha = rawAlpha.endsWith('%')
        ? parseFloat(rawAlpha) / 100
        : parseFloat(rawAlpha);
    }

    if (Number.isNaN(v0) || Number.isNaN(v1) || Number.isNaN(v2)) {
      throw new Error(`Invalid color values: ${css}`);
    }

    let normalizedValues: number[];
    switch (mode) {
      case 'rgb':
        normalizedValues = [v0 / 255, v1 / 255, v2 / 255];
        break;
      case 'hsl':
      case 'hwb':
        normalizedValues = [v0, v1 / 100, v2 / 100];
        break;
      case 'lab':
      case 'lch':
        normalizedValues = [v0, v1, v2];
        break;
      case 'oklab':
      case 'oklch':
        normalizedValues = [v0 / 100, v1, v2];
        break;
      default:
        throw new Error(`Unsupported mode: ${mode}`);
    }

    return {
      alpha: Math.max(0, Math.min(1, alpha)),
      mode,
      values: normalizedValues as ColorSpace<ColorMode>,
    };
  }

  throw new Error(`Invalid CSS color: ${css}`);
};
