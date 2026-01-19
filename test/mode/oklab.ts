import type { ColorFn, ColorSpace } from "../types";

const lrgbToOklab: ColorFn<"lrgb", "oklab"> = (input) => {
  const lr = input[0];
  const lg = input[1];
  const lb = input[2];

  const cr = lr * 0.41222147079999993;
  const cg = lg * 0.5363325363;
  const cb = lb * 0.0514459929;

  const tr = lr * 0.2119034981999999;
  const tg = lg * 0.6806995450999999;
  const tb = lb * 0.1073969566;

  const xr = lr * 0.08830246189999998;
  const xg = lg * 0.2817188376;
  const xb = lb * 0.6299787005000002;

  const L = Math.cbrt(cr + cg + cb);
  const M = Math.cbrt(tr + tg + tb);
  const S = Math.cbrt(xr + xg + xb);

  const ll = L * 0.2104542553;
  const lm = M * 0.793617785;
  const ls = S * 0.0040720468;

  const al = L * 1.9779984951;
  const am = M * 2.428592205;
  const as = S * 0.4505937099;

  const bl = L * 0.0259040371;
  const bm = M * 0.7827717662;
  const bs = S * 0.808675766;

  const l = ll + lm - ls;
  const a = al - am + as;
  const b = bl + bm - bs;

  return [l, a, b] as ColorSpace<"oklab">;
};

const oklabToLrgb: ColorFn<"oklab", "lrgb"> = (input) => {
  const l = input[0];
  const a = input[1];
  const b = input[2];

  const cl = l * 0.99999999845051981432;
  const ca = a * 0.39633779217376785678;
  const cb = b * 0.21580375806075880339;

  const tl = l * 1.0000000088817607767;
  const ta = a * 0.1055613423236563494;
  const tb = b * 0.063854174771705903402;

  const xl = l * 1.0000000546724109177;
  const xa = a * 0.089484182094965759684;
  const xb = b * 1.2914855378640917399;

  const L = (cl + ca + cb) ** 3;
  const M = (tl - ta - tb) ** 3;
  const S = (xl - xa - xb) ** 3;

  const rl = L * +4.076741661347994;
  const rm = M * 3.307711590408193;
  const rs = S * 0.230969928729428;

  const gl = L * -1.2684380040921763;
  const gm = M * 2.6097574006633715;
  const gs = S * 0.3413193963102197;

  const bl = L * -0.004196086541837188;
  const bm = M * 0.7034186144594493;
  const bs = S * 1.7076147009309444;

  const lr = rl - rm + rs;
  const lg = gl + gm - gs;
  const lb = bl - bm + bs;

  return [lr, lg, lb] as ColorSpace<"lrgb">;
};

export { lrgbToOklab, oklabToLrgb };
