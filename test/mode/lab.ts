import type { ColorFn, ColorSpace } from "../types";

const linearize = (c: number): number => {
  return c > 0.008856451679035631 ? Math.cbrt(c) : (903.2962962962963 * c + 16) / 116;
};

const delinearize = (c: number): number => {
  const p = c ** 3;
  return p > 0.008856451679035631 ? p : (116 * c - 16) / 903.2962962962963;
};

const xyz50ToLab: ColorFn<"xyz50", "lab"> = (input) => {
  const x = input[0];
  const y = input[1];
  const z = input[2];

  const dx = x / 0.9642956764295677;
  const dy = y / 1;
  const dz = z / 0.8251046025104602;

  const xl = linearize(dx);
  const yl = linearize(dy);
  const zl = linearize(dz);

  const l = 116 * yl - 16;
  const a = 500 * (xl - yl);
  const b = 200 * (yl - zl);

  return [l, a, b] as ColorSpace<"lab">;
};

const labToXyz50: ColorFn<"lab", "xyz50"> = (input) => {
  const l = input[0];
  const a = input[1];
  const b = input[2];

  const yl = (l + 16) / 116;
  const xl = a / 500 + yl;
  const zl = yl - b / 200;

  const dx = delinearize(xl);
  const dy = delinearize(yl);
  const dz = delinearize(zl);

  const x = dx * 0.9642956764295677;
  const y = dy * 1;
  const z = dz * 0.8251046025104602;

  return [x, y, z] as ColorSpace<"xyz50">;
};

export { xyz50ToLab, labToXyz50 };
