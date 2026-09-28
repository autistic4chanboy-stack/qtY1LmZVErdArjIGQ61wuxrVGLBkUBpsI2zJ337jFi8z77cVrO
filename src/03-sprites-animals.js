// ============================================================================
//  SPRITES : ANIMAUX, VILLAGEOIS (vues côté / face / dos × 2 pas) et accessoires
// ============================================================================

const APAL = {
  wool: ramp(['#8d887e', '#aea99e', '#ccc6ba', '#e1dcd0', '#f1ede3']),
  dark: ramp(['#141210', '#221f1c', '#322e2a', '#46413b']),
  cow: ramp(['#7c776f', '#a39e95', '#c8c3ba', '#e3dfd6', '#f5f2ea']),
  pink: ramp(['#9a5560', '#b96a76', '#d4828d', '#e89ea7', '#f5b9c0']),
  horse: ramp(['#33200f', '#4a2c16', '#62391e', '#7a4a27', '#935c32']),
  deer: ramp(['#50341a', '#694422', '#83562c', '#9d6a38', '#b67f46']),
  cream: ramp(['#9c927c', '#bfb49b', '#ddd3b9', '#f0e8d2']),
  horn: ramp(['#8a826e', '#b3aa92', '#d8d0b8']),
  antler: ramp(['#4a3c2c', '#6b5a44', '#8d7a60']),
};
const C = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

// Toison bouclée : ellipse + boucles en périphérie
function woolBody(pb, cx, cy, rx, ry, seed) {
  drawSphere(pb, cx, cy, rx, APAL.wool, seed, { sq: ry / rx, noise: 0.25 });
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU;
    drawSphere(pb, cx + Math.cos(a) * rx * 0.82, cy + Math.sin(a) * ry * 0.8, Math.max(2, ry * 0.36), APAL.wool, seed + k, { noise: 0.3 });
  }
}

// Quadrupède générique : sp définit corps / tête / queue ; view = 'side' | 'front' | 'back'
function quadSprite(sp, view, frame) {
  const pb = new PixelBuf(sp.W, sp.H), G = sp.H - 1;
  const bl = sp.bodyLen, bh = sp.bodyH, cx = sp.cx, cy = G - sp.legLen - bh * 0.42;
  const leg = (x0, x1, top, lift, dark) => {
    const y1 = G - lift;
    for (let y = Math.round(top); y <= y1; y++) {
      const t = (y - top) / Math.max(1, y1 - top), x = Math.round(lerp(x0, x1, t));
      for (let k = 0; k < sp.legW; k++) {
        const sock = sp.sock && y > y1 - sp.sock;
        pb.set(x + k, y, y > y1 - 2 ? sp.hoof : rampPick(sp.legPal, (k === 0 ? 0.8 : 0.5) - (dark ? 0.35 : 0) - (sock ? 0.45 : 0), x + k, y));
      }
    }
  };
  const top = cy + bh * 0.1;
  if (view === 'side') {
    const fx = cx + bl * 0.32, bx = cx - bl * 0.34, s = frame ? 2 : 0;
    leg(fx + 1, fx + 1 - s, top, 0, true); leg(bx + 1, bx + 1 + s, top, 0, true);
    sp.tail(pb, cx - bl / 2, cy, 'side', frame);
    sp.body(pb, cx, cy, bl / 2, bh / 2, 'side');
    leg(fx - 1, fx - 1 + s, top, 0, false); leg(bx - 1, bx - 1 - s, top, 0, false);
    sp.head(pb, cx + bl / 2, cy, 'side', frame);
  } else {
    const rx = bh * 0.58, near = rx * 0.4, far = rx * 0.66, front = view === 'front';
    if (!front) sp.head(pb, cx, cy, 'back', frame);
    leg(cx - far - 1, cx - far - 1, top, 0, true); leg(cx + far - 1, cx + far - 1, top, 0, true);
    sp.body(pb, cx, cy, rx, bh / 2, view);
    leg(cx - near - 1, cx - near - 1, cy + bh * 0.3, frame ? 1 : 0, false); leg(cx + near - 1, cx + near - 1, cy + bh * 0.3, frame ? 0 : 1, false);
    if (front) sp.head(pb, cx, cy, 'front', frame); else sp.tail(pb, cx, cy, 'back', frame);
  }
  edgeDarken(pb, 0.72);
  return pb;
}

const SPECIES = {
  sheep: {
    W: 34, H: 26, cx: 15, bodyLen: 22, bodyH: 14, legLen: 7, legW: 2, legPal: APAL.dark, hoof: [18, 16, 14],
    body(pb, cx, cy, rx, ry) { woolBody(pb, cx, cy, rx, ry, 71); },
    head(pb, x, cy, view, f) {
      if (view === 'side') {
        const hy = cy - 3 + (f ? 1 : 0);
        drawSphere(pb, x + 1, hy, 4.2, APAL.dark, 5, { sq: 0.8 });
        pb.set(x - 3, hy - 2, APAL.dark[2]); pb.set(x - 4, hy - 2, APAL.dark[1]); pb.set(x + 2, hy - 1, [210, 200, 170]);
      } else if (view === 'front') {
        drawSphere(pb, x, cy - 1, 4.4, APAL.dark, 5, { sq: 1.1 });
        for (const s of [-1, 1]) { pb.set(x + s * 5, cy - 3, APAL.dark[2]); pb.set(x + s * 6, cy - 3, APAL.dark[1]); pb.set(x + s * 2, cy - 2, [210, 200, 170]); }
        drawSphere(pb, x, cy - 5, 2.5, APAL.wool, 9);
      }
    },
    tail(pb, x, cy, view) { drawSphere(pb, view === 'back' ? x : x + 1, cy - 2, 2.6, APAL.wool, 3, { noise: 0.3 }); },
  },
  cow: {
    W: 54, H: 40, cx: 24, bodyLen: 34, bodyH: 17, legLen: 11, legW: 3, legPal: APAL.cow, hoof: [40, 34, 30],
    body(pb, cx, cy, rx, ry, view) {
      drawSphere(pb, cx, cy, rx, APAL.cow, 12, { sq: ry / rx, noise: 0.1 });
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        if (pb.alpha(x, y) === 255 && hash2i(x >> 2, y >> 2, view === 'side' ? 7 : 8) > 0.62 && hash2i(x >> 1, y >> 1, 3) > 0.25) pb.set(x, y, rampPick(APAL.dark, 0.5 - (y - cy) / ry * 0.3, x, y));
      }
      if (view === 'side') drawSphere(pb, cx - 2, cy + ry - 1, 3, APAL.pink, 4, { sq: 0.7 });
    },
    head(pb, x, cy, view, f) {
      if (view === 'side') {
        const hx = x + 3, hy = cy - 3 + (f ? 1 : 0);
        drawSphere(pb, hx, hy, 5.5, APAL.cow, 6, { sq: 0.85 });
        drawSphere(pb, hx + 4, hy + 2, 3, APAL.pink, 7, { sq: 0.8 });
        for (let k = 0; k < 4; k++) pb.set(hx - 1 + k, hy - 5 - (k > 2 ? 1 : 0), APAL.horn[1 + (k > 1 ? 1 : 0)]);
        pb.set(hx - 4, hy - 3, APAL.cow[1]); pb.set(hx - 5, hy - 3, APAL.cow[2]); pb.set(hx + 1, hy - 1, [16, 14, 12]);
        for (let y = hy - 4; y < hy + 1; y++) for (let xx = hx - 3; xx < hx; xx++) if (pb.alpha(xx, y) === 255) pb.set(xx, y, APAL.dark[1]);
      } else if (view === 'front') {
        drawSphere(pb, x, cy - 3, 6, APAL.cow, 6, { sq: 1.15 });
        drawSphere(pb, x, cy + 2, 3.8, APAL.pink, 7, { sq: 0.7 });
        for (const s of [-1, 1]) {
          for (let k = 0; k < 4; k++) pb.set(x + s * (4 + k), cy - 9 - (k > 2 ? 1 : 0), APAL.horn[1 + (k > 1 ? 1 : 0)]);
          pb.set(x + s * 7, cy - 6, APAL.cow[1]); pb.set(x + s * 8, cy - 6, APAL.cow[2]); pb.set(x + s * 3, cy - 4, [16, 14, 12]);
        }
        pb.set(x - 1, cy + 2, [80, 40, 44]); pb.set(x + 1, cy + 2, [80, 40, 44]);
      }
    },
    tail(pb, x, cy, view) {
      const tx = view === 'back' ? x : x + 1;
      for (let y = cy - 6; y < cy + 9; y++) pb.set(tx + (view === 'back' ? 0 : -((y - cy + 6) > 8 ? 1 : 0)), y, APAL.cow[1]);
      for (let k = 0; k < 3; k++) pb.set(tx - 1 + k, cy + 9, APAL.dark[1]);
    },
  },
  pig: {
    W: 34, H: 22, cx: 15, bodyLen: 24, bodyH: 13, legLen: 4, legW: 3, legPal: APAL.pink, hoof: [120, 70, 70],
    body(pb, cx, cy, rx, ry) { drawSphere(pb, cx, cy, rx, APAL.pink, 21, { sq: ry / rx, noise: 0.06 }); },
    head(pb, x, cy, view, f) {
      if (view === 'side') {
        const hy = cy - 1 + (f ? 1 : 0);
        drawSphere(pb, x + 1, hy, 5, APAL.pink, 22, { sq: 0.9 });
        drawSphere(pb, x + 5, hy + 1, 2.4, APAL.pink, 23, { sq: 1.2 });
        pb.set(x + 7, hy, [110, 50, 60]); pb.set(x + 7, hy + 2, [110, 50, 60]);
        pb.set(x, hy - 5, APAL.pink[2]); pb.set(x + 1, hy - 5, APAL.pink[3]); pb.set(x + 2, hy - 4, APAL.pink[2]); pb.set(x + 2, hy - 2, [20, 14, 14]);
      } else if (view === 'front') {
        drawSphere(pb, x, cy - 1, 5.5, APAL.pink, 22, { sq: 1 });
        drawSphere(pb, x, cy + 1, 2.6, APAL.pink, 23, { sq: 0.8 });
        pb.set(x - 1, cy + 1, [110, 50, 60]); pb.set(x + 1, cy + 1, [110, 50, 60]);
        for (const s of [-1, 1]) { pb.set(x + s * 4, cy - 6, APAL.pink[3]); pb.set(x + s * 5, cy - 5, APAL.pink[2]); pb.set(x + s * 2, cy - 3, [20, 14, 14]); }
      }
    },
    tail(pb, x, cy, view) {
      const tx = view === 'back' ? x : x - 1, ty = cy - 3;
      for (const [dx, dy] of [[0, 0], [-1, -1], [-2, 0], [-1, 1], [0, 1]]) pb.set(tx + dx, ty + dy, APAL.pink[3]);
    },
  },
  horse: {
    W: 60, H: 56, cx: 26, bodyLen: 36, bodyH: 16, legLen: 20, legW: 3, legPal: APAL.horse, hoof: [30, 26, 22], sock: 6,
    body(pb, cx, cy, rx, ry) { drawSphere(pb, cx, cy, rx, APAL.horse, 31, { sq: ry / rx, noise: 0.08 }); },
    head(pb, x, cy, view, f) {
      const mane = APAL.dark;
      if (view === 'side') {
        const bob = f ? 1 : 0;
        for (let k = 0; k <= 6; k++) drawSphere(pb, x - 5 + k * 1.7, cy - 5 - k * 2.4 + bob, 4.2, APAL.horse, 32 + k, { noise: 0.05 });
        for (let k = 0; k <= 12; k++) { pb.set(Math.round(x - 7 + k * 0.9), Math.round(cy - 6 - k * 1.25 + bob), mane[1]); pb.set(Math.round(x - 8 + k * 0.9), Math.round(cy - 6 - k * 1.25 + bob), mane[2]); }
        drawSphere(pb, x + 7, cy - 21 + bob, 4.4, APAL.horse, 40, { noise: 0.05 });
        drawSphere(pb, x + 11, cy - 16 + bob, 3, APAL.horse, 41, { sq: 0.9 });
        pb.set(x + 13, cy - 16 + bob, [30, 20, 16]); pb.set(x + 8, cy - 22 + bob, [12, 10, 8]);
        pb.set(x + 5, cy - 26 + bob, APAL.horse[2]); pb.set(x + 5, cy - 27 + bob, APAL.horse[3]);
      } else {
        const front = view === 'front';
        for (let k = 0; k < 5; k++) drawSphere(pb, x, cy - 6 - k * 2.5, 4.2, APAL.horse, 33 + k, { noise: 0.05 });
        drawSphere(pb, x, cy - 19, 4.2, APAL.horse, 42);
        if (front) {
          drawSphere(pb, x, cy - 13, 3.2, APAL.horse, 43);
          for (let y = cy - 21; y < cy - 10; y++) pb.set(x, y, [226, 214, 196]);
          for (const s of [-1, 1]) { pb.set(x + s * 3, cy - 20, [12, 10, 8]); pb.set(x + s * 2, cy - 24, APAL.horse[3]); pb.set(x + s * 2, cy - 25, APAL.horse[2]); }
        } else for (let y = cy - 23; y < cy - 4; y++) { pb.set(x, y, mane[1]); pb.set(x - 1, y, mane[2]); }
      }
    },
    tail(pb, x, cy, view) {
      if (view === 'back') { for (let y = cy - 5; y < cy + 14; y++) for (let k = -1; k <= 1; k++) pb.set(x + k + (y > cy + 8 ? (y % 2) : 0), y, APAL.dark[1 + (k === 0 ? 1 : 0)]); return; }
      for (let k = 0; k < 16; k++) for (let w = 0; w < 3; w++) pb.set(Math.round(x + 1 - k * 0.35 - w * 0.5), cy - 5 + k, APAL.dark[1 + (w === 1 ? 1 : 0)]);
    },
  },
  deer: {
    W: 44, H: 50, cx: 19, bodyLen: 26, bodyH: 12, legLen: 17, legW: 2, legPal: APAL.deer, hoof: [30, 24, 20],
    body(pb, cx, cy, rx, ry, view) {
      drawSphere(pb, cx, cy, rx, APAL.deer, 51, { sq: ry / rx, noise: 0.08 });
      if (view === 'back') drawSphere(pb, cx, cy, rx * 0.6, APAL.cream, 52, { sq: 0.9 });
      else if (view === 'side') for (let x = Math.floor(cx - rx * 0.6); x < cx + rx * 0.6; x++) for (let y = Math.round(cy + ry * 0.55); y <= cy + ry; y++) if (pb.alpha(x, y) === 255) pb.set(x, y, APAL.cream[2]);
    },
    head(pb, x, cy, view, f) {
      const antler = (ax, ay, s) => {
        const pts = [[0, 0], [s, -2], [s * 2, -4], [s * 2, -6], [s * 3, -8], [s * 3, -10], [s * 4, -11]];
        pts.forEach(([dx, dy]) => pb.set(ax + dx, ay + dy, APAL.antler[2]));
        pb.set(ax + s * 3, ay - 5, APAL.antler[1]); pb.set(ax + s * 4, ay - 6, APAL.antler[1]); pb.set(ax + s, ay - 7, APAL.antler[1]); pb.set(ax + s, ay - 8, APAL.antler[2]);
      };
      if (view === 'side') {
        const bob = f ? 1 : 0;
        for (let k = 0; k <= 5; k++) drawSphere(pb, x - 3 + k * 1.3, cy - 4 - k * 2.2 + bob, 3, APAL.deer, 53 + k, { noise: 0.05 });
        drawSphere(pb, x + 5, cy - 17 + bob, 3.4, APAL.deer, 60);
        drawSphere(pb, x + 8, cy - 15 + bob, 2.2, APAL.deer, 61);
        pb.set(x + 10, cy - 15 + bob, [20, 16, 14]); pb.set(x + 5, cy - 18 + bob, [10, 8, 8]);
        pb.set(x + 2, cy - 20 + bob, APAL.deer[3]); pb.set(x + 1, cy - 21 + bob, APAL.deer[2]);
        antler(x + 4, cy - 20 + bob, -1); antler(x + 6, cy - 20 + bob, 1);
      } else {
        for (let k = 0; k < 4; k++) drawSphere(pb, x, cy - 5 - k * 2.4, 3, APAL.deer, 54 + k);
        drawSphere(pb, x, cy - 16, 3.4, APAL.deer, 60);
        for (const s of [-1, 1]) { pb.set(x + s * 4, cy - 18, APAL.deer[3]); pb.set(x + s * 5, cy - 19, APAL.deer[2]); antler(x + s * 2, cy - 19, s); if (view === 'front') pb.set(x + s * 2, cy - 16, [10, 8, 8]); }
        if (view === 'front') pb.set(x, cy - 13, [20, 16, 14]);
      }
    },
    tail(pb, x, cy, view) { drawSphere(pb, view === 'back' ? x : x + 1, cy - 4, 1.8, APAL.cream, 5); },
  },
};

function speciesFrames(sp) {
  return ['side', 'front', 'back'].flatMap((v) => [quadSprite(sp, v, 0), quadSprite(sp, v, 1)]);
}

// ---------------------------------------------------------------- petits animaux
function henFrames(pal) {
  const red = [200, 40, 30], yel = [230, 170, 40];
  const f = (view, frame) => {
    const pb = new PixelBuf(16, 16), b = frame ? 1 : 0;
    const legs = (x0, x1) => { drawLine(pb, x0, 11, x0 - (frame ? 1 : 0), 15, yel); drawLine(pb, x1, 11, x1 + (frame ? 1 : 0), 15, C(yel, 0.8)); };
    if (view === 'side') {
      legs(7, 9);
      drawSphere(pb, 3.5, 6, 3, pal, 2, { sq: 1.2 });
      drawSphere(pb, 7.5, 8.5, 4.6, pal, 3, { sq: 0.75 });
      drawSphere(pb, 11.5, 4.5 + b, 2.4, pal, 4);
      pb.set(11, 2 + b, red); pb.set(12, 2 + b, red); pb.set(12, 1 + b, red);
      pb.set(14, 4 + b, yel); pb.set(14, 5 + b, C(yel, 0.7)); pb.set(13, 6 + b, red); pb.set(12, 4 + b, [10, 10, 10]);
      for (let x = 5; x < 10; x++) pb.shade(x, 9, 0.8);
    } else {
      legs(7, 9);
      if (view === 'back') drawSphere(pb, 8, 5, 3, pal, 2, { sq: 1.1 });
      drawSphere(pb, 8, 9, 4.5, pal, 3, { sq: 0.85 });
      if (view === 'front') {
        drawSphere(pb, 8, 4.5 + b, 2.4, pal, 4);
        pb.set(8, 2 + b, red); pb.set(8, 1 + b, red); pb.set(8, 5 + b, yel); pb.set(8, 6 + b, red); pb.set(7, 4 + b, [10, 10, 10]); pb.set(9, 4 + b, [10, 10, 10]);
      }
    }
    return pb;
  };
  return ['side', 'front', 'back'].flatMap((v) => [f(v, 0), f(v, 1)]);
}

function rabbitFrames() {
  const pal = ramp(['#5b4b3c', '#76634f', '#917c65', '#aa957c']), tail = [236, 232, 222];
  const f = (view, frame) => {
    const pb = new PixelBuf(16, 14), u = frame ? 2 : 0;
    if (view === 'side') {
      if (frame) drawLine(pb, 4, 10, 1, 13, pal[1], 2); else drawSphere(pb, 5, 11, 2.5, pal, 3);
      drawSphere(pb, 7, 9 - u, 4.5, pal, 1, { sq: 0.8 });
      drawSphere(pb, 11, 6.5 - u, 2.8, pal, 2);
      drawLine(pb, 10, 4 - u, 9, 0, pal[2], 1); drawLine(pb, 11, 4 - u, 11, 0, pal[3], 1);
      drawSphere(pb, 2.5, 8 - u, 1.6, ramp(['#cfcac0', '#ece8de']), 4);
      pb.set(12, 6 - u, [12, 10, 10]); pb.set(10, 12 - u, pal[1]); pb.set(11, 12 - u, pal[1]);
    } else {
      drawSphere(pb, 8, 9 - u, 4, pal, 1, { sq: 0.95 });
      drawSphere(pb, 8, 6 - u, 3, pal, 2);
      for (const s of [-1, 1]) drawLine(pb, 8 + s, 3 - u, 8 + s * 2, 0, pal[view === 'front' ? 3 : 1], 1);
      if (view === 'front') { pb.set(7, 6 - u, [12, 10, 10]); pb.set(9, 6 - u, [12, 10, 10]); pb.set(8, 7 - u, [220, 150, 150]); }
      else drawSphere(pb, 8, 10 - u, 1.6, ramp(['#cfcac0', '#ece8de']), 4);
    }
    return pb;
  };
  return ['side', 'front', 'back'].flatMap((v) => [f(v, 0), f(v, 1)]);
}

function duckFrames() {
  const body = ramp(['#5a4a3a', '#76624d', '#927c62', '#ab9579']), head = ramp(['#0e3a1e', '#155228', '#1f6c34', '#2e8a45']), bill = [236, 150, 40];
  const f = (view, frame) => {
    const pb = new PixelBuf(18, 14), b = frame ? 1 : 0;
    if (view === 'side') {
      drawSphere(pb, 8, 9.5, 6, body, 1, { sq: 0.5 });
      pb.set(1, 7, body[2]); pb.set(2, 7, body[2]); pb.set(1, 6, body[3]);
      drawSphere(pb, 13.5, 5 + b, 2.7, head, 2);
      for (let x = 12; x < 16; x++) pb.set(x, 7 + b, [236, 236, 230]);
      pb.set(16, 5 + b, bill); pb.set(17, 5 + b, bill); pb.set(16, 6 + b, C(bill, 0.75)); pb.set(14, 4 + b, [8, 8, 8]);
    } else {
      drawSphere(pb, 9, 10, 5.5, body, 1, { sq: 0.55 });
      drawSphere(pb, 9, 5 + b, 2.8, head, 2);
      for (let x = 7; x < 12; x++) pb.set(x, 7 + b, [236, 236, 230]);
      if (view === 'front') { pb.set(9, 6 + b, bill); pb.set(8, 4 + b, [8, 8, 8]); pb.set(10, 4 + b, [8, 8, 8]); }
    }
    return pb;
  };
  return ['side', 'front', 'back'].flatMap((v) => [f(v, 0), f(v, 1)]);
}

function birdFrames() {
  const c = [26, 24, 30];
  const a = new PixelBuf(14, 8), b = new PixelBuf(14, 8);
  drawLine(a, 1, 1, 6, 5, c); drawLine(a, 12, 1, 7, 5, c); a.set(6, 6, c); a.set(7, 6, c);
  drawLine(b, 1, 6, 6, 4, c); drawLine(b, 12, 6, 7, 4, c); b.set(6, 4, c); b.set(7, 4, c); b.set(6, 5, c); b.set(7, 5, c);
  return [a, b];
}

// ---------------------------------------------------------------- villageois
const VILLAGER_LOOKS = [
  { skin: [232, 190, 160], hair: [70, 45, 25], shirt: [160, 52, 40], pants: [72, 56, 40] },
  { skin: [206, 158, 118], hair: [32, 26, 20], shirt: [60, 92, 150], pants: [52, 52, 62], hat: [206, 176, 96] },
  { skin: [240, 202, 172], hair: [214, 172, 92], dress: [92, 124, 70], shirt: [232, 222, 202] },
  { skin: [150, 102, 72], hair: [26, 20, 18], shirt: [204, 172, 80], pants: [92, 72, 50] },
  { skin: [226, 182, 150], hair: [156, 156, 156], dress: [122, 62, 112], shirt: [204, 194, 174] },
  { skin: [236, 196, 166], hair: [142, 62, 30], shirt: [72, 122, 82], pants: [62, 52, 46], hat: [70, 50, 40] },
];

function villagerFrames(v) {
  const f = (view, frame) => {
    const pb = new PixelBuf(18, 44), cx = 9;
    const sh = (c, x) => C(c, 1.12 - (x - 4) * 0.035);
    const rect = (x0, y0, x1, y1, col) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, sh(col, x)); };
    const shoes = [48, 34, 26];
    if (view === 'side') {
      const s = frame ? 3 : 0;
      if (v.dress) {
        for (let y = 25; y <= 39; y++) { const w = lerp(2.5, 4.5, (y - 25) / 14); rect(Math.round(cx - w), y, Math.round(cx + w - 1), y, v.dress); }
        rect(cx - 2 - (frame ? 1 : 0), 40, cx - 1 - (frame ? 1 : 0), 41, C(v.skin, 0.8)); rect(cx - 2 - (frame ? 1 : 0), 42, cx + (frame ? 0 : 1), 43, shoes);
      } else {
        drawLine(pb, cx - 1, 26, cx - 1 - s, 41, C(v.pants, 0.7), 3);
        drawLine(pb, cx, 26, cx + s, 41, v.pants, 3);
        rect(cx - 1 - s, 42, cx + 2 - s, 43, C(shoes, 0.8)); rect(cx + s, 42, cx + 3 + s, 43, shoes);
      }
      rect(cx - 2, 11, cx + 2, 25, v.shirt);
      rect(cx - 2, 25, cx + 2, 25, [60, 40, 26]);
      if (frame) { drawLine(pb, cx, 12, cx + 3, 22, C(v.shirt, 0.85), 2); rect(cx + 3, 22, cx + 4, 23, v.skin); }
      else { rect(cx - 1, 12, cx + 1, 22, C(v.shirt, 0.85)); rect(cx - 1, 23, cx + 1, 24, v.skin); }
      rect(cx - 1, 9, cx + 1, 10, C(v.skin, 0.9));
      drawSphere(pb, cx, 6.5, 3.7, ramp([rgbToHex(C(v.skin, 0.7)), rgbToHex(C(v.skin, 0.88)), rgbToHex(v.skin)]), 5);
      for (let y = 2; y <= 9; y++) for (let x = cx - 4; x <= cx + 4; x++) if (pb.alpha(x, y) === 255 && (y < 5 || x < cx - 1)) pb.set(x, y, sh(v.hair, x));
      pb.set(cx + 4, 7, C(v.skin, 0.85)); pb.set(cx + 2, 6, [20, 16, 14]);
    } else {
      const back = view === 'back', l = frame ? 1 : 0;
      if (v.dress) {
        for (let y = 25; y <= 39; y++) { const w = lerp(4, 6, (y - 25) / 14); rect(Math.round(cx - w), y, Math.round(cx + w - 1), y, v.dress); }
        rect(cx - 3, 40, cx - 2, 41 - l, C(v.skin, 0.8)); rect(cx + 1, 40, cx + 2, 41 - (1 - l), C(v.skin, 0.8));
        rect(cx - 4, 42 - l, cx - 2, 43 - l, shoes); rect(cx + 1, 42 - (1 - l), cx + 3, 43 - (1 - l), shoes);
      } else {
        rect(cx - 4, 26, cx - 1, 40 - l, v.pants); rect(cx, 26, cx + 3, 40 - (1 - l), C(v.pants, 0.92));
        rect(cx - 4, 41 - l, cx - 1, 43 - l, shoes); rect(cx, 41 - (1 - l), cx + 3, 43 - (1 - l), shoes);
      }
      rect(cx - 4, 11, cx + 3, 25, v.shirt);
      if (!v.dress) rect(cx - 4, 25, cx + 3, 25, [60, 40, 26]);
      rect(cx - 6, 12 + l, cx - 5, 23 + l, C(v.shirt, 0.9)); rect(cx + 4, 13 - l, cx + 5, 24 - l, C(v.shirt, 0.8));
      rect(cx - 6, 24 + l, cx - 5, 25 + l, v.skin); rect(cx + 4, 25 - l, cx + 5, 26 - l, C(v.skin, 0.9));
      rect(cx - 1, 9, cx, 10, C(v.skin, 0.9));
      drawSphere(pb, cx - 0.5, 6.5, 3.8, ramp([rgbToHex(C(v.skin, 0.7)), rgbToHex(C(v.skin, 0.88)), rgbToHex(v.skin)]), 5);
      for (let y = 2; y <= 10; y++) for (let x = cx - 5; x <= cx + 4; x++) if (pb.alpha(x, y) === 255 && (back ? y < 10 : y < 5 || (v.dress && (x < cx - 3 || x > cx + 2)))) pb.set(x, y, sh(v.hair, x));
      if (!back) { pb.set(cx - 2, 7, [20, 16, 14]); pb.set(cx + 1, 7, [20, 16, 14]); pb.set(cx - 1, 9, C(v.skin, 0.75)); }
    }
    if (v.hat) {
      const hs = view === 'side' ? 0 : -0.5;
      for (let x = cx - 6; x <= cx + 5; x++) pb.set(Math.round(x + hs), 3, sh(v.hat, x));
      for (let y = 0; y < 3; y++) for (let x = cx - 3; x <= cx + 2; x++) pb.set(Math.round(x + hs), y, sh(C(v.hat, y === 2 ? 0.7 : 1), x));
    }
    edgeDarken(pb, 0.8);
    return pb;
  };
  return ['side', 'front', 'back'].flatMap((vw) => [f(vw, 0), f(vw, 1)]);
}

// ---------------------------------------------------------------- accessoires (village, mine)
function spriteLantern() {
  const pb = new PixelBuf(10, 14);
  for (let x = 2; x < 8; x++) { pb.set(x, 2, PAL.iron[2]); pb.set(x, 3, PAL.iron[1]); pb.set(x, 12, PAL.iron[1]); pb.set(x, 13, PAL.iron[0]); }
  pb.set(4, 0, PAL.iron[2]); pb.set(5, 0, PAL.iron[2]); pb.set(3, 1, PAL.iron[1]); pb.set(6, 1, PAL.iron[1]);
  for (let y = 4; y < 12; y++) {
    pb.set(2, y, PAL.iron[1]); pb.set(7, y, PAL.iron[0]);
    for (let x = 3; x < 7; x++) pb.set(x, y, y < 6 || x === 3 ? [255, 246, 200] : [255, 200, 100], EMISSIVE_A);
  }
  return pb;
}
function spriteMinecart() {
  const pb = new PixelBuf(30, 20), metal = ramp(['#1e2024', '#33373d', '#4c525a', '#69717b', '#8b949e']);
  fillPoly(pb, [[2, 4], [28, 4], [25, 16], [5, 16]], metal, (x, y) => 0.65 - (y - 4) * 0.03 + (y < 6 ? 0.3 : 0) + ((x % 6) === 0 ? -0.15 : 0));
  for (let k = 0; k < 7; k++) drawSphere(pb, 6 + k * 3 + (k % 2), 3.5 - (k % 3 === 1 ? 1 : 0), 2.4, k % 3 === 0 ? ramp(['#8a6a1a', '#c49a2a', '#f0cc50']) : PAL.rock, k);
  for (const wx of [8, 22]) drawSphere(pb, wx, 17, 2.8, ramp(['#101113', '#26282c', '#3d4046']), wx);
  edgeDarken(pb);
  return pb;
}
function spriteOrePile() {
  const pb = new PixelBuf(24, 14), rnd = mulberry32(81);
  for (let k = 0; k < 9; k++) drawSphere(pb, 4 + rnd() * 16, 8 + rnd() * 3, 2.5 + rnd() * 2.5, k % 3 === 0 ? ramp(['#6e5212', '#a88420', '#e2bc48']) : PAL.rock, k, { sq: 0.8, flatBottom: 0.6 });
  for (let k = 0; k < 10; k++) { const x = (3 + rnd() * 18) | 0, y = (5 + rnd() * 7) | 0; if (pb.alpha(x, y) === 255) pb.set(x, y, [250, 214, 90]); }
  edgeDarken(pb);
  return pb;
}
function spriteCrystal() {
  const pb = new PixelBuf(16, 22);
  const shards = [[8, 21, 2.6, 18, 0], [4, 21, 2, 12, -0.25], [12, 21, 2, 13, 0.3], [6, 21, 1.6, 8, -0.5], [11, 21, 1.5, 7, 0.55]];
  for (const [bx, by, w, h, lean] of shards) {
    for (let y = 0; y < h; y++) {
      const t = y / h, cxp = bx + lean * y, hw = w * (1 - t * 0.85);
      for (let x = Math.floor(cxp - hw); x <= Math.ceil(cxp + hw); x++) {
        const u = (x - cxp) / (hw + 0.01);
        if (Math.abs(u) > 1) continue;
        const c = u < -0.3 ? [180, 250, 255] : u < 0.4 ? [90, 200, 240] : [60, 110, 210];
        pb.set(x, by - y, c, EMISSIVE_A);
      }
    }
  }
  return pb;
}
function spriteHay() {
  const pb = new PixelBuf(24, 18), P = ramp(['#6e5a22', '#8c742e', '#a88c3a', '#c2a548', '#d6bc5c']);
  for (let y = 1; y < 18; y++) for (let x = 1; x < 23; x++) {
    if ((x < 3 || x > 20) && (y < 3 || y > 15)) continue;
    let v = 0.55 + (hash2i(x, y >> 1, 5) - 0.5) * 0.45 - (y - 1) * 0.015 + (x < 4 ? 0.15 : 0) - (x > 19 ? 0.2 : 0);
    if (x === 7 || x === 16) v = 0.05;
    pb.set(x, y, rampPick(P, v, x, y));
  }
  edgeDarken(pb);
  return pb;
}
function spriteCart() {
  const pb = new PixelBuf(40, 26);
  for (let y = 6; y < 16; y++) for (let x = 6; x < 34; x++) pb.set(x, y, rampPick(PAL.wood, 0.6 + ((y - 6) % 3 === 0 ? -0.3 : 0) + (x === 6 ? 0.2 : 0) + (x === 33 ? -0.3 : 0), x, y));
  drawLine(pb, 33, 13, 39, 17, PAL.wood[1], 2);
  for (const [wx, r] of [[12, 7], [28, 7]]) {
    for (let a = 0; a < 48; a++) { const t = (a / 48) * TAU; pb.set(Math.round(wx + Math.cos(t) * r), Math.round(18 + Math.sin(t) * r), PAL.wood[0]); pb.set(Math.round(wx + Math.cos(t) * (r - 1)), Math.round(18 + Math.sin(t) * (r - 1)), PAL.wood[3]); }
    for (let k = 0; k < 4; k++) { const t = (k / 4) * Math.PI; drawLine(pb, Math.round(wx - Math.cos(t) * (r - 1)), Math.round(18 - Math.sin(t) * (r - 1)), Math.round(wx + Math.cos(t) * (r - 1)), Math.round(18 + Math.sin(t) * (r - 1)), PAL.wood[2]); }
    pb.set(wx, 18, PAL.iron[2]);
  }
  edgeDarken(pb);
  return pb;
}
function spriteScarecrow() {
  const pb = new PixelBuf(20, 36), straw = [214, 184, 90];
  for (let y = 8; y < 36; y++) { pb.set(9, y, PAL.wood[2]); pb.set(10, y, PAL.wood[1]); }
  for (let x = 1; x < 19; x++) { pb.set(x, 13, PAL.wood[2]); pb.set(x, 14, PAL.wood[1]); }
  for (let y = 11; y < 24; y++) for (let x = 5; x < 15; x++) pb.set(x, y, ((x >> 1) + (y >> 1)) % 2 ? [150, 50, 40] : [110, 34, 30]);
  for (let x = 1; x < 5; x++) for (let y = 12; y < 16; y++) pb.set(x, y, [140, 46, 36]);
  for (let x = 15; x < 19; x++) for (let y = 12; y < 16; y++) pb.set(x, y, [140, 46, 36]);
  for (const x of [0, 19]) for (let y = 13; y < 17; y++) pb.set(x, y + (y % 2), straw);
  drawSphere(pb, 9.5, 7, 4, ramp(['#8e7a52', '#b09a6a', '#cbb586']), 3);
  pb.set(8, 6, [30, 24, 20]); pb.set(11, 6, [30, 24, 20]); for (let x = 8; x < 12; x++) pb.set(x, 9, [60, 44, 30]);
  for (let x = 3; x < 17; x++) pb.set(x, 3, [180, 150, 70]);
  for (let y = 0; y < 3; y++) for (let x = 6; x < 13; x++) pb.set(x, y, [200, 170, 80]);
  return pb;
}
function spriteWheat(seed) {
  const pb = new PixelBuf(24, 24), rnd = mulberry32(seed);
  const stalk = ramp(['#7a6428', '#9a8034', '#b89c42']), ear = ramp(['#a07c28', '#c49c38', '#e0bc52', '#f0d470']);
  for (let i = 0; i < 16; i++) {
    const x0 = 2 + rnd() * 20, top = 3 + rnd() * 5, lean = (rnd() - 0.5) * 3;
    drawLine(pb, Math.round(x0 + lean), Math.round(top) + 4, Math.round(x0), 23, stalk[(rnd() * 3) | 0]);
    for (let k = 0; k < 5; k++) pb.set(Math.round(x0 + lean + (k % 2 ? 0.5 : -0.5)), Math.round(top) + k, ear[1 + ((k + i) % 3)]);
  }
  return pb;
}
function spriteWoodpile() {
  const pb = new PixelBuf(30, 16), end = ramp(['#6e5230', '#8e6c42', '#b08a58', '#caa570']);
  const rows = [[4, 13, 6], [7.5, 8.5, 5], [11, 4, 4]];
  for (const [x0, y, n] of rows) for (let k = 0; k < n; k++) {
    const cx = x0 + k * 4.2;
    drawSphere(pb, cx, y, 2.4, PAL.bark, k);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (Math.abs(dx) + Math.abs(dy) < 2) pb.set(Math.round(cx + dx), Math.round(y + dy), end[dx === 0 && dy === 0 ? 1 : 3]);
  }
  edgeDarken(pb);
  return pb;
}
function spriteProduce() {
  const pb = new PixelBuf(22, 14), rnd = mulberry32(5);
  for (let y = 6; y < 14; y++) for (let x = 1; x < 21; x++) pb.set(x, y, rampPick(PAL.wood, 0.55 + ((y - 6) % 3 === 0 ? -0.35 : 0), x, y));
  const cols = [ramp(['#7a1612', '#b8261e', '#e24a38']), ramp(['#2e5a1c', '#4a8a2c', '#76b448']), ramp(['#9a4a0c', '#d8741c', '#f49a3a']), ramp(['#8a6a10', '#c49a22', '#eccb4c'])];
  for (let k = 0; k < 9; k++) drawSphere(pb, 3 + k * 2.1, 5.5 - (k % 2), 2, cols[(rnd() * 4) | 0], k);
  edgeDarken(pb);
  return pb;
}
function spriteTomb() {
  const pb = new PixelBuf(12, 16), P = ramp(['#4a4b4f', '#5f6166', '#76787d', '#8e9095', '#a6a8ac']);
  for (let y = 1; y < 16; y++) for (let x = 1; x < 11; x++) {
    if (y < 5 && Math.hypot(x + 0.5 - 6, y - 5) > 5) continue;
    let v = 0.6 - (x - 1) * 0.04 + (hash2i(x, y, 3) - 0.5) * 0.25;
    if ((x === 5 || x === 6) && y > 3 && y < 11) v = 0.1;
    if (y === 6 && x > 2 && x < 9) v = 0.1;
    let c = rampPick(P, v, x, y);
    if (y > 12 && hash2i(x, y, 9) > 0.5) c = PAL.moss[1];
    pb.set(x, y, c);
  }
  edgeDarken(pb);
  return pb;
}

// Ajoutés à l'atlas par buildSpriteAtlas()
function addExtraSprites(add) {
  add('a_sheep', speciesFrames(SPECIES.sheep));
  add('a_cow', speciesFrames(SPECIES.cow));
  add('a_pig', speciesFrames(SPECIES.pig));
  add('a_horse', speciesFrames(SPECIES.horse));
  add('a_deer', speciesFrames(SPECIES.deer));
  add('a_hen0', henFrames(ramp(['#b3aa98', '#d8d0bf', '#f0ebe0', '#fbf8f2'])));
  add('a_hen1', henFrames(ramp(['#6a3a1c', '#8c5026', '#aa6834', '#c48246'])));
  add('a_rabbit', rabbitFrames());
  add('a_duck', duckFrames());
  add('a_bird', birdFrames());
  VILLAGER_LOOKS.forEach((v, i) => add('v' + i, villagerFrames(v)));
  add('lantern', spriteLantern());
  add('minecart', spriteMinecart());
  add('orepile', spriteOrePile());
  add('crystal', spriteCrystal());
  add('hay', spriteHay());
  add('cart', spriteCart());
  add('scarecrow', spriteScarecrow());
  add('wheat0', spriteWheat(91)); add('wheat1', spriteWheat(92));
  add('woodpile', spriteWoodpile());
  add('produce', spriteProduce());
  add('tomb', spriteTomb());
}
