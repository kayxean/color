/**
 * Supported Color Spaces
 */
export type ColorSpace =
  | 'rgb'
  | 'hsv'
  | 'hsl'
  | 'hwb'
  | 'lab'
  | 'lch'
  | 'oklab'
  | 'oklch'
  | 'xyz50'
  | 'xyz65';

/**
 * A Float32Array branded with a fixed length of 3.
 */
export type ColorBuffer = Float32Array & {
  readonly __length: 3;
};

/**
 * A ColorBuffer branded with its specific ColorSpace.
 */
export type ColorArray<S extends ColorSpace = ColorSpace> = ColorBuffer & {
  readonly __space: S;
};

/**
 * Higher-level Color object for application state.
 */
export type Color<S extends ColorSpace = ColorSpace> = {
  space: S;
  value: ColorArray<S>;
  alpha?: number;
};

/**
 * Core Logic: The Functional Pool
 */
const MAX_POOL_SIZE = 100;
const pool: ColorBuffer[] = [];

/**
 * Acquires a 3-element Float32Array from the pool or allocates a new one.
 * The return type is automatically branded to the requested ColorSpace.
 */
export function acquireColor<S extends ColorSpace>(space: S): ColorArray<S>;
export function acquireColor<S extends ColorSpace>(): ColorArray<S> {
  return (pool.pop() ?? (new Float32Array(3) as ColorBuffer)) as ColorArray<S>;
}

/**
 * Returns a buffer to the pool.
 * Use this when a transformation is complete or a Color object is destroyed.
 */
export function releaseColor(arr: ColorBuffer): void {
  if (pool.length < MAX_POOL_SIZE) {
    arr.fill(0); // Prevents data leakage between reuses
    pool.push(arr);
  }
}

/**
 * Standard interface for color conversion functions.
 */
export type ColorAdapter = (input: ColorBuffer, output: ColorBuffer) => void;

/**
 * Pre-allocates buffers to the pool to ensure zero allocations during
 * the first execution cycle.
 */
export function preallocatePool(size: number): void {
  const count = Math.min(size, MAX_POOL_SIZE);
  for (let i = 0; i < count; i++) {
    pool.push(new Float32Array(3) as ColorBuffer);
  }
}
