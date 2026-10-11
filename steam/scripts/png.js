// Petit encodeur PNG (RGBA 8 bits) avec zlib, et assemblage ICO / ICNS à partir de PNG.
// Rien d'autre que Node : node scripts/icons.js, node scripts/achievements.js.
'use strict';
const zlib = require('zlib');

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// img : { w, h, data: Uint8Array RGBA }
function encodePNG(img) {
  const { w, h, data } = img;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(data.buffer, data.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function image(w, h) { return { w, h, data: new Uint8Array(w * h * 4) }; }
// agrandissement au plus proche voisin (pixel art) puis, si besoin, réduction par moyenne
function scale(img, W, H) {
  const out = image(W, H);
  if (W >= img.w) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const sx = Math.floor(x * img.w / W), sy = Math.floor(y * img.h / H), i = (sy * img.w + sx) * 4, o = (y * W + x) * 4;
      for (let c = 0; c < 4; c++) out.data[o + c] = img.data[i + c];
    }
    return out;
  }
  const fx = img.w / W, fy = img.h / H;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let yy = Math.floor(y * fy); yy < Math.floor((y + 1) * fy); yy++) for (let xx = Math.floor(x * fx); xx < Math.floor((x + 1) * fx); xx++) {
      const i = (yy * img.w + xx) * 4, al = img.data[i + 3];
      r += img.data[i] * al; g += img.data[i + 1] * al; b += img.data[i + 2] * al; a += al; n++;
    }
    const o = (y * W + x) * 4;
    if (a) { out.data[o] = r / a; out.data[o + 1] = g / a; out.data[o + 2] = b / a; }
    out.data[o + 3] = a / n;
  }
  return out;
}
// ICO : des PNG (Windows Vista et plus) ; tailles ≤ 256
function encodeICO(pngs) {
  const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let off = 6 + 16 * pngs.length;
  pngs.forEach(({ size, png }, i) => {
    const d = i * 16;
    dir[d] = size >= 256 ? 0 : size; dir[d + 1] = size >= 256 ? 0 : size; dir[d + 2] = 0; dir[d + 3] = 0;
    dir.writeUInt16LE(1, d + 4); dir.writeUInt16LE(32, d + 6); dir.writeUInt32LE(png.length, d + 8); dir.writeUInt32LE(off, d + 12);
    off += png.length;
  });
  return Buffer.concat([head, dir, ...pngs.map((p) => p.png)]);
}
// ICNS : entrées PNG (ic07 128, ic08 256, ic09 512, ic10 1024)
function encodeICNS(pngs) {
  const TYPES = { 128: 'ic07', 256: 'ic08', 512: 'ic09', 1024: 'ic10' };
  const parts = [];
  for (const { size, png } of pngs) {
    if (!TYPES[size]) continue;
    const h = Buffer.alloc(8); h.write(TYPES[size], 0, 'ascii'); h.writeUInt32BE(png.length + 8, 4);
    parts.push(h, png);
  }
  const body = Buffer.concat(parts);
  const h = Buffer.alloc(8); h.write('icns', 0, 'ascii'); h.writeUInt32BE(body.length + 8, 4);
  return Buffer.concat([h, body]);
}
module.exports = { encodePNG, image, scale, encodeICO, encodeICNS, crc32 };
