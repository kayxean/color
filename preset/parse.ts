import type { Color, ColorSpace } from './types';
import { createColor } from './utils';

export interface ParsedColor extends Color {
  alpha: number;
}

export function parseColor(css: string): ParsedColor {
  const trimmed = css.trim();

  if (trimmed[0] === '#') {
    const hex = trimmed.slice(1);
    const len = hex.length;
    let r = 0,
      g = 0,
      b = 0,
      a = 1;

    if (len === 3 || len === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      if (len === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (len === 6 || len === 8) {
      const num = parseInt(hex, 16);
      if (len === 6) {
        r = (num >> 16) & 255;
        g = (num >> 8) & 255;
        b = num & 255;
      } else {
        r = (num >> 24) & 255;
        g = (num >> 16) & 255;
        b = (num >> 8) & 255;
        a = (num & 255) / 255;
      }
    } else {
      throw new Error(`Invalid Hex length: ${css}`);
    }

    return {
      ...createColor('rgb', [r / 255, g / 255, b / 255]),
      alpha: a,
    };
  }

  const openParen = trimmed.indexOf('(');
  const closeParen = trimmed.lastIndexOf(')');

  if (openParen !== -1 && closeParen !== -1) {
    const space = trimmed
      .slice(0, openParen)
      .toLowerCase()
      .replace(/a$/, '') as ColorSpace;
    const content = trimmed.slice(openParen + 1, closeParen);

    const parts = content.split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) throw new Error(`Invalid color: ${css}`);

    const v0 = parseFloat(parts[0]);
    const v1 = parseFloat(parts[1]);
    const v2 = parseFloat(parts[2]);

    let alpha = 1;
    if (parts[3]) {
      const rawA = parts[3];
      alpha = rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA);
    }

    const color = createColor(space, [v0, v1, v2]);
    const val = color.value;

    switch (space) {
      case 'rgb':
        val[0] /= 255;
        val[1] /= 255;
        val[2] /= 255;
        break;
      case 'hsl':
      case 'hwb':
        val[1] /= 100;
        val[2] /= 100;
        break;
      case 'lab':
      case 'lch':
      case 'oklab':
      case 'oklch':
        val[0] /= 100;
        break;
    }

    return {
      ...color,
      alpha: Math.max(0, Math.min(1, alpha)),
    };
  }

  throw new Error(`Unrecognized color format: ${css}`);
}
