import type { ColorFn, ColorSpace } from "../types";

const lrgbToXyz65: ColorFn<"lrgb", "xyz65"> = (input) => {
  const lr = input[0];
  const lg = input[1];
  const lb = input[2];

  const xr = lr * 0.4123907992659593;
  const xg = lg * 0.357584339383878;
  const xb = lb * 0.1804807884018343;

  const yr = lr * 0.2126390058715102;
  const yg = lg * 0.715168678767756;
  const yb = lb * 0.0721923153607337;

  const zr = lr * 0.0193308187155918;
  const zg = lg * 0.119194779794626;
  const zb = lb * 0.9505321522496607;

  const x = xr + xg + xb;
  const y = yr + yg + yb;
  const z = zr + zg + zb;

  return [x, y, z] as ColorSpace<"xyz65">;
};

const xyz65ToLrgb: ColorFn<"xyz65", "lrgb"> = (input) => {
  const x = input[0];
  const y = input[1];
  const z = input[2];

  const rx = x * 3.2409699419045226;
  const ry = y * 1.5373831775700939;
  const rz = z * 0.4986107602930034;

  const gx = x * -0.9692436362808796;
  const gy = y * 1.8759675015077204;
  const gz = z * 0.0415550574071756;

  const bx = x * 0.0556300796969936;
  const by = y * 0.2039769588889765;
  const bz = z * 1.0569715142428784;

  const lr = rx - ry - rz;
  const lg = gx + gy + gz;
  const lb = bx - by + bz;

  return [lr, lg, lb] as ColorSpace<"lrgb">;
};

const xyz50ToXyz65: ColorFn<"xyz50", "xyz65"> = (input) => {
  const x = input[0];
  const y = input[1];
  const z = input[2];

  const xl = x * 0.9554734527042182;
  const yl = y * 0.0230985368742614;
  const zl = z * 0.0632593086610217;

  const xm = x * -0.0283697069632081;
  const ym = y * 1.0099954580058226;
  const zm = z * 0.021041398966943;

  const xs = x * 0.0123140016883199;
  const ys = y * 0.0205076964334779;
  const zs = z * 1.3303659366080753;

  const bx = xl - yl + zl;
  const by = xm + ym + zm;
  const bz = xs - ys + zs;

  return [bx, by, bz] as ColorSpace<"xyz65">;
};

const xyz65ToXyz50: ColorFn<"xyz65", "xyz50"> = (input) => {
  const x = input[0];
  const y = input[1];
  const z = input[2];

  const xl = x * 1.0479298208405488;
  const yl = y * 0.0229467933410191;
  const zl = z * 0.0501922295431356;

  const xm = x * 0.0296278156881593;
  const ym = y * 0.990434484573249;
  const zm = z * 0.0170738250293851;

  const xs = x * -0.0092430581525912;
  const ys = y * 0.0150551448965779;
  const zs = z * 0.7518742899580008;

  const bx = xl + yl - zl;
  const by = xm + ym - zm;
  const bz = xs + ys + zs;

  return [bx, by, bz] as ColorSpace<"xyz50">;
};

export { lrgbToXyz65, xyz65ToLrgb, xyz50ToXyz65, xyz65ToXyz50 };
