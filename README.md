# Color

Type-safe, blazingly-fast, and zero-dependency. Most color tools are either too heavy or too inaccurate, so I made this. It handles complex color space conversions correctly using CIEXYZ, but keeps the footprint small and the performance high.

## What it actually does

It uses CIEXYZ (D65/D50) and Bradford CAT to move colors around. I'm told this is the "correct" way to do it so the colors don't look weird.

- **Converts stuff**: Changes colors between `rgb`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, and `oklch`.
- **Reads CSS**: You give it a string like `#ff0000` or `oklab(59% 0.22 0.12)` and it figures it out.
- **Writes CSS**: It turns the color objects back into strings you can actually use in your CSS.
- **Checks contrast**: Calculates APCA contrast and can find a color that meets a specific contrast target.
- **Makes palettes**: It can generate harmonies, shades, and multi-color scales.
- **Validates & Fixes**: Checks if a color is actually displayable on a screen and clamps it if it's not.
- **Simulates vision**: Shows you how colors look to people with different types of color blindness.

## How to use it

### Changing color modes

Use `convertColor`. You tell it what you have and what you want.

```typescript
import type { ColorSpace } from './core/types';
import { convertColor } from './core/convert';
import { formatCss } from './core/format';

const redRgb = [1, 0, 0] as ColorSpace<'rgb'>;

// Move it to Oklch
const redOklch = convertColor(redRgb, 'rgb', 'oklch');

// Now make it a string so CSS understands it
const css = formatCss('oklch', redOklch);
// oklch(0.6279 0.2576 29.2332)
```

### Reading and writing CSS

`parseColor` turns a string into an object with mode and values. `formatCss` does the opposite.

```typescript
import { parseColor } from './core/parse';
import { formatCss } from './core/format';

const color = parseColor('oklab(0.62 -0.07 -0.15)');
// color -> { mode: 'oklab', values: [0.62, -0.07, -0.15] }

const backToString = formatCss('rgb', [0, 0.5, 1]);
// backToString -> 'rgb(0 128 255)'
```

### Checking and matching contrast

It uses APCA for contrast checking, which is a more perceptually accurate model.

```typescript
import type { ColorSpace } from './core/types';
import { checkContrast, matchContrast } from './utils/contrast';

const textColor = [0.95, 0.05, 0.2] as ColorSpace<'oklab'>; // A pinkish color
const bgColor = [0.2, 0, 0] as ColorSpace<'oklab'>; // A very dark color

// Get APCA contrast value (Lc)
const contrast = checkContrast(textColor, bgColor, 'oklab');
// contrast -> 78.79

// Find a new text color that meets a target contrast of Lc 60
// It will darken the pink to meet the target against the dark background
const newTextColor = matchContrast(textColor, bgColor, 'oklab', 60);
```

### Making things look nice

`createHarmony` for matching colors, `createShades` for a simple gradient, and `createScales` for when you have a bunch of colors and want a smooth line between them.

```typescript
import type { ColorSpace } from './core/types';
import { createHarmony, createShades, createScales } from './utils/palette';

const blue = [0, 0, 1] as ColorSpace<'rgb'>;

// Get analogous colors
const mix = createHarmony(blue, 'rgb', [{ name: 'analogous', ratios: [-30, 30] }]);

// 5 steps from white to black in Oklab
const shades = createShades(
  [1, 0, 0] as ColorSpace<'oklab'>,
  [0, 0, 0] as ColorSpace<'oklab'>,
  'oklab',
  5
);

// Scale between Red -> Yellow -> Green
const scale = createScales(
  [
    [1, 0, 0] as ColorSpace<'rgb'>,
    [1, 1, 0] as ColorSpace<'rgb'>,
    [0, 1, 0] as ColorSpace<'rgb'>,
  ],
  'rgb',
  7
);
```

### Safety and Comparison

`checkGamut` tells you if a color is "imaginary" (out of bounds), and `clampColor` brings it back to reality so your CSS doesn't break. Use `isEqual` to check if two colors are the same, even if they are in different modes.

```typescript
import { checkGamut, clampColor } from './utils/gamut';
import { isEqual, getDistance } from './utils/compare';

const superBright = [1.2, -0.1, 0.5] as ColorSpace<'rgb'>;

const isSafe = checkGamut(superBright, 'rgb'); // false
const safeColor = clampColor(superBright, 'rgb'); // [1, 0, 0.5]

// Perceptual distance (Delta E OK)
const diff = getDistance([1, 0, 0], 'rgb', [0.9, 0, 0], 'rgb');

// Compare an RGB color to its HSL equivalent
const same = isEqual([1, 0, 0], 'rgb', [0, 1, 0.5], 'hsl'); // true
```

### Accessibility Simulation

See through the eyes of others. This projects colors into a reduced space to simulate color vision deficiency accurately.

```typescript
import { simulateDeficiency } from './utils/simulate';

const brandColor = [0.2, 0.8, 0.4] as ColorSpace<'rgb'>;

// How does a person with red-blindness see this?
const protanopiaView = simulateDeficiency(brandColor, 'rgb', 'protanopia');
```

## How the math works (The "Hub" thing)

I didn't want to write a thousand different math formulas for every possible conversion. Instead, everything converts to a "Hub" first (CIEXYZ). This makes the conversions more accurate.

-   **The Hubs**: Modern spaces (`rgb`, `oklab`, etc.) go to **CIEXYZ D65**. Older ones (`lab`, `lch`) go to **CIEXYZ D50**.
-   **The Bridge**: To get between the two hubs, I used the **Bradford CAT**. It’s a translator so the colors don't shift weirdly when they change illuminants.

Basically: `Your Color` -> Hub -> `(Bridge if needed)` -> `New Color`. It's fast, and it works.
