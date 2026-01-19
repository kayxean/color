import type { ColorFn, ColorSpace } from "../types";

const lrgbToXyz50: ColorFn<"lrgb", "xyz50"> = (input) => {
  const lr = input[0];
  const lg = input[1];
  const lb = input[2];

  const xr = lr * 0.436065742824811;
  const xg = lg * 0.3851514688337912;
  const xb = lb * 0.14307845442264197;

  const yr = lr * 0.22249319175623702;
  const yg = lg * 0.7168870538238823;
  const yb = lb * 0.06061979053616537;

  const zr = lr * 0.013923904500943465;
  const zg = lg * 0.09708128566574634;
  const zb = lb * 0.7140993584005155;

  const x = xr + xg + xb;
  const y = yr + yg + yb;
  const z = zr + zg + zb;

  return [x, y, z] as ColorSpace<"xyz50">;
};

const xyz50ToLrgb: ColorFn<"xyz50", "lrgb"> = (input) => {
  const x = input[0];
  const y = input[1];
  const z = input[2];

  const rx = x * 3.1341359569958707;
  const ry = y * 1.6173863321612538;
  const rz = z * 0.4906619460083532;

  const gx = x * -0.978795502912089;
  const gy = y * 1.916254567259524;
  const gz = z * 0.03344273116131949;

  const bx = x * 0.07195537988411677;
  const by = y * 0.2289768264158322;
  const bz = z * 1.405386058324125;

  const lr = rx - ry - rz;
  const lg = gx + gy + gz;
  const lb = bx - by + bz;

  return [lr, lg, lb] as ColorSpace<"lrgb">;
};

export { lrgbToXyz50, xyz50ToLrgb };
