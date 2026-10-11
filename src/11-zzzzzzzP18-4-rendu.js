// ============================================================================
//  LES CASCADES (agent P18) — 5. LE RENDU : l'eau qui tombe, l'eau qui dort
//  - les nappes d'eau (bassins, gradins, vasques, gours, la rivière d'en bas) :
//    le programme de l'eau du jeu (le même dessin, la même écume au bord),
//    posé sur un rectangle tourné à la hauteur de chaque nappe, dessiné juste
//    après l'eau du jeu ; une nappe ne se dessine que là où le fond est sous
//    elle et pas trop loin (rien ne flotte) ; celles hors de la vue ne coûtent rien ;
//  - les chutes : un voile (une boîte), des filets qui tombent par-devant, de
//    l'écume au pied — moins de filets de loin ; les petites chutes des gradins ;
//  - la brume au pied (quelques particules, de près), l'arc-en-ciel par beau
//    temps quand on a le soleil dans le dos ; les papillons et les lucioles des
//    coins de paradis ; la dalle du Sanctuaire qui s'enfonce.
//  Coût mesuré : voir tools/equilibrage/P18.js (boîtes par image, nappes dessinées).
// ============================================================================
const P18_EAU_VS = GLSL_HEAD + `
uniform mat4 uViewProj;
uniform float uWaterV;
uniform vec4 uQuad;
uniform vec2 uAxe;
out vec3 vPos;
void main() {
  vec2 c[6] = vec2[6](vec2(-1.0, -1.0), vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0), vec2(1.0, 1.0));
  vec2 t = c[gl_VertexID] * uQuad.zw;
  vec2 p = uQuad.xy + vec2(t.x * uAxe.x - t.y * uAxe.y, t.x * uAxe.y + t.y * uAxe.x);
  vPos = vec3(p.x, uWaterV, p.y);
  gl_Position = uViewProj * vec4(vPos, 1.0);
}`;
// l'eau du jeu, à qui l'on dit de ne pas se dessiner trop au-dessus du fond
const P18_EAU_FS = SH.waterFS.replace('uniform float uWater;', 'uniform float uWater;\nuniform float uProf;\nuniform float uChaud;').replace('if (depth < 0.0) discard;', 'if (depth < 0.0 || depth > uProf) discard;')
  .replace('outCol = vec4(applyFog(col, p), alpha);', 'col = mix(col, vec3(0.62, 0.7, 0.66) * light, uChaud * 0.22);\n  outCol = vec4(applyFog(col, p), alpha);');

const p18Rendu = {
  prog: null, U: null, attente: false, dedans: false,
  stats: { nappes: 0, boites: 0, minis: 0, chutes: 0 },
  // ------------------------------------------------------------ le programme, une fois
  installer() {
    if (this.prog || !game.renderer || !game.renderer.progs) return;
    const R = game.renderer;
    try {
      const pr = glProgram(P18_EAU_VS, P18_EAU_FS, 'p18eau');
      gl.useProgram(pr.p);
      const set = (n, v) => { if (pr.u[n]) gl.uniform1i(pr.u[n], v); };
      set('uHeight', TEX_H); set('uMat', TEX_M); set('uShade', TEX_S); set('uTex', TEX_A); set('uCover', TEX_C);
      this.prog = pr;
    } catch (e) { console.error('P18 eau', e); this.prog = false; return; }
    const S = this, _use = R.use.bind(R);
    R.use = function (pr, U) {
      if (S.attente && !S.dedans && pr !== this.progs.water) { S.attente = false; S.dedans = true; try { S.nappes(this); } catch (e) { if (!S._err) { S._err = true; console.error('P18 nappes', e); } } finally { S.dedans = false; } }
      if (pr === this.progs.water && !S.dedans) { S.U = U; S.attente = true; }
      return _use(pr, U);
    };
  },
  // ------------------------------------------------------------ les nappes (juste après l'eau du jeu)
  nappes(R) {
    const w = game.world, P = w && w.p18, U = this.U;
    this.stats.nappes = 0;
    if (!P || !P.eaux.length || !U || !this.prog) return;
    const sous = !!(souterrain.actif && souterrain.image), cam = U.uCamPos, far = (U.uFog ? U.uFog[1] : 200) + 30;
    const pr = this.prog;
    const blend = gl.isEnabled(gl.BLEND), cull = gl.isEnabled(gl.CULL_FACE), dm = gl.getParameter(gl.DEPTH_WRITEMASK), vao = gl.getParameter(gl.VERTEX_ARRAY_BINDING);
    let pret = false;
    const V = this._v || (this._v = { f: [0, 0, 0] });
    for (const E of P.eaux) {
      if (!!E.sous !== sous) continue;
      const dx = E.x - cam[0], dz = E.z - cam[2], r = Math.hypot(E.hx, E.hz), d = Math.hypot(dx, dz);
      if (d - r > far || Math.abs(E.y - cam[1]) > far) continue;
      if (!pret) {
        pret = true;
        gl.useProgram(pr.p);
        const O = sous && souterrain.gl ? Object.assign({}, U, souterrain.gl.ovr) : U;
        for (const k in O) if (k !== 'uRect' && k !== 'uWater' && k !== 'uWaterV') R.setU(pr, k, O[k]);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.disable(gl.CULL_FACE);
        gl.bindVertexArray(R.emptyVAO);
      }
      R.setU(pr, 'uWater', E.y); R.setU(pr, 'uWaterV', E.y); R.setU(pr, 'uProf', E.prof || P18_PROF); R.setU(pr, 'uChaud', E.chaud ? 1 : 0);
      R.setU(pr, 'uQuad', [E.x, E.z, E.hx, E.hz]); R.setU(pr, 'uAxe', [Math.cos(E.a), Math.sin(E.a)]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      this.stats.nappes++;
    }
    if (pret) {
      if (!blend) gl.disable(gl.BLEND);
      if (cull) gl.enable(gl.CULL_FACE);
      gl.depthMask(dm);
      gl.bindVertexArray(vao);
    }
  },

  // ------------------------------------------------------------ les chutes (chaque image, dans le tampon des modèles animés)
  dessiner(buf, cam, t) {
    const w = game.world, P = w && w.p18;
    this.stats.boites = 0; this.stats.chutes = 0; this.stats.minis = 0;
    if (!P || game.kind !== 'farm') return;
    const sous = !!souterrain.actif, n0 = buf.n;
    PE.buf = buf;
    const sky = game.sky || {}, nuit = sky.night || 0;
    for (const C of P.chutes) {
      if (!!C.sous !== sous) continue;
      const d = Math.hypot(C.x - cam[0], C.z - cam[2]);
      if (d > 260) continue;
      if (C.sorte === 'gradins') continue; // ses petites chutes suffisent
      this.chute(C, d, t, false);
      this.stats.chutes++;
    }
    for (const M of P.minis) {
      if (!!M.sous !== sous) continue;
      const d = Math.hypot(M.x - cam[0], M.z - cam[2]);
      if (d > 110) continue;
      this.chute({ x: M.x, z: M.z, a: M.a, y0: M.y0, y1: M.y1, l: M.l, sous: M.sous, mini: true }, d, t, true);
      this.stats.minis++;
    }
    // les papillons, les lucioles (coins de paradis), la dalle qui s'enfonce
    if (!sous) this.betes(buf, cam, t, sky);
    if (sous && p18Jeu.porteAnim) this.porte(buf, t);
    PE.fl = 0;
    this.stats.boites = buf.n - n0;
  },
  // un rideau d'eau : un voile (une boîte), des filets qui tombent, l'écume
  chute(C, d, t, mini) {
    const H = C.y0 - C.y1;
    if (H < 0.2) return;
    const fx = Math.cos(C.a), fz = Math.sin(C.a), sous = !!C.sous;
    // le voile est un rien en avant du bord ; son repère : x le long du bord, z vers l'aval
    const avance = mini ? 0.15 : C.k === 'grande' ? 0.9 : 0.4;
    const ox = C.x + fx * avance, oz = C.z + fz * avance, rot = Math.atan2(fx, fz);
    PE.frame(ox, C.y1, oz, rot, 1);
    const L = C.l, lod = d > 160 ? 4 : d > 80 ? 2 : 1;
    const voile = sous ? [0.12, 0.15, 0.17] : [0.68, 0.78, 0.86], filet = sous ? [0.2, 0.24, 0.27] : [1.0, 1.04, 1.08], ecume = sous ? [0.22, 0.25, 0.27] : [1.02, 1.04, 1.06];
    if (sous) PE.fl = FX_EMIT;
    // le voile, un peu penché vers l'aval en bas (l'eau quitte la paroi)
    const pente = mini ? 0.04 : 0.025;
    PE.box(0, H / 2, H * pente * 0.5, L, H, 0.14, voile, TL.plain, 0, -pente);
    // les filets : des colonnes, chacune son allure
    const n = Math.max(1, Math.round(L / 0.55 / lod)), lf = mini ? 0.7 : 1.9;
    const m = Math.max(1, Math.ceil(H / (mini ? 1.4 : 3.2) / (lod > 2 ? 2 : 1)));
    for (let j = 0; j < n; j++) {
      const hj = hash2i(j, Math.round(C.x), 31), v = (mini ? 3.2 : 8) + hj * 3, o = -L / 2 + (j + 0.5) * L / n;
      const wj = (L / n) * (0.55 + hj * 0.3);
      for (let k = 0; k < m; k++) {
        let y = H - ((t * v + hj * H + k * H / m) % H);
        const len = Math.min(lf * lod, H - Math.max(0, y - lf * lod));
        if (len < 0.1) continue;
        y = Math.max(0, y - len);
        PE.box(o, y + len / 2, (H - y) * pente + 0.09, wj, len, 0.08, filet, TL.plain);
      }
    }
    // l'écume au pied : des galettes blanches qui respirent
    const ne = mini ? 2 : Math.max(2, Math.round(L / 1.6 / lod));
    for (let k = 0; k < ne; k++) {
      const hk = hash2i(k, Math.round(C.z), 47), p = 0.75 + 0.25 * Math.sin(t * (3 + hk * 2) + k), s = (mini ? 0.7 : 1.6) * p;
      PE.box(-L / 2 + (k + 0.5) * L / ne, 0.04 + hk * 0.06, H * pente + 0.5 + hk * (mini ? 0.4 : 1.4), s * (L / ne) * 1.1, 0.1, s, ecume, TL.plain, hk * 3);
    }
    PE.fl = 0;
  },
  // ------------------------------------------------------------ les bêtes légères des coins de paradis
  betes(buf, cam, t, sky) {
    const w = game.world, P = w.p18;
    const jour = sky.day || 0, pluie = (typeof weather !== 'undefined' && weather.cur) ? weather.cur.rain : 0;
    for (const Q of P.coins) {
      const d = Math.hypot(Q.x - cam[0], Q.z - cam[2]);
      if (d > 70) continue;
      // papillons : le jour, sans pluie
      if (Q.papillons && jour > 0.35 && pluie < 0.2) {
        for (let i = 0; i < Q.papillons; i++) {
          const h = hash2i(i, Q.k.length, 61), a = t * (0.25 + h * 0.3) + i * 2.1, r = Q.r * (0.25 + 0.6 * hash2i(i, 3, 62));
          const x = Q.x + Math.cos(a) * r + Math.sin(t * 1.3 + i) * 1.2, z = Q.z + Math.sin(a * 1.3) * r + Math.cos(t * 1.1 + i) * 1.2;
          const y = w.heightAt(x, z) + 0.6 + 0.9 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.7)), f = Math.sin(t * 22 + i * 5) * 0.9;
          const c = [[0.95, 0.85, 0.3], [0.95, 0.95, 0.9], [0.55, 0.65, 0.95], [0.95, 0.55, 0.25], [0.85, 0.6, 0.85]][i % 5];
          PE.frame(x, y, z, a + Math.PI / 2, 1);
          PE.box(-0.06, 0, 0, 0.11, 0.012, 0.09, c, TL.plain, 0, 0, f);
          PE.box(0.06, 0, 0, 0.11, 0.012, 0.09, c, TL.plain, 0, 0, -f);
          PE.box(0, -0.01, 0, 0.02, 0.02, 0.1, [0.15, 0.12, 0.1], TL.plain);
        }
      }
      // lucioles : la nuit, au Bassin des Fées
      if (Q.lucioles && (sky.night || 0) > 0.4 && pluie < 0.2) {
        PE.fl = FX_EMIT;
        for (let i = 0; i < 22; i++) {
          const a = t * 0.2 + i * 1.7, r = Q.r * (0.2 + 0.7 * hash2i(i, 9, 63)), x = Q.x + Math.cos(a) * r, z = Q.z + Math.sin(a * 1.4) * r;
          const y = w.heightAt(x, z) + 0.5 + 1.2 * hash2i(i, 4, 64) + Math.sin(t + i) * 0.3, on = Math.max(0, Math.sin(t * (1.1 + hash2i(i, 2, 65)) + i * 3));
          if (on < 0.2) continue;
          PE.frame(x, y, z, 0, 1);
          PE.box(0, 0, 0, 0.05, 0.05, 0.05, [0.9 * on, 1.0 * on, 0.4 * on], TL.plain);
        }
        PE.fl = 0;
      }
    }
  },
  // la dalle du Sanctuaire qui s'enfonce
  porte(buf, t) {
    const A = p18Jeu.porteAnim, b = A.b;
    const k = clamp(A.t / A.dur, 0, 1), drop = k * k * (b.sy + 0.3);
    PE.frame(b.x, b.y, b.z, b.r, 1);
    PE.bx(0, -drop, 0, b.sx, b.sy, b.sz, WHITE, mt(b.m));
  },

  // ------------------------------------------------------------ la brume, l'arc-en-ciel (des particules, de près)
  brumeT: 0, arcT: 0,
  particules(dt, cam, basis, sky) {
    const w = game.world, P = w && w.p18;
    if (!P) return;
    const sous = !!souterrain.actif;
    this.brumeT -= dt; this.arcT -= dt;
    const brume = this.brumeT <= 0, arc = this.arcT <= 0;
    if (brume) this.brumeT = 0.12;
    if (arc) this.arcT = 0.9;
    for (const C of P.chutes) {
      if (!!C.sous !== sous || C.sorte === 'gradins') continue;
      const d = Math.hypot(C.x - cam[0], C.z - cam[2]);
      if (d > 120) continue;
      const fx = Math.cos(C.a), fz = Math.sin(C.a), px = -fz, pz = fx, H = C.y0 - C.y1;
      const bx = C.x + fx * (C.k === 'grande' ? 2.2 : 1.3), bz = C.z + fz * (C.k === 'grande' ? 2.2 : 1.3);
      if (brume) {
        const n = d < 50 ? 3 : 1, big = clamp(H / 30, 0.4, 1.4) * (C.l > 6 ? 1.3 : 0.8);
        for (let i = 0; i < n; i++) {
          const o = (Math.random() - 0.5) * C.l * 1.2, x = bx + px * o + fx * Math.random() * 3, z = bz + pz * o + fz * Math.random() * 3;
          const c = sous ? [0.3, 0.33, 0.36, 0.22] : [0.88, 0.92, 0.95, 0.28];
          particles.spawn(x, C.y1 + 0.3, z, fx * (0.6 + Math.random()) + (Math.random() - 0.5) * 0.6, 0.5 + Math.random() * 1.3 * big, fz * (0.6 + Math.random()) + (Math.random() - 0.5) * 0.6, c, 0.35 + Math.random() * 0.4 * big, 1.6 + Math.random() * 1.4, -0.08, false);
          particles.list[particles.list.length - 1].grow = 2.5;
        }
      }
      // l'arc-en-ciel : le jour, sans nuages, soleil dans le dos, pas trop haut (moins de 42°)
      if (arc && !sous && d < 90 && d > 8) {
        const sd = sky.sunDir || [0, 1, 0], vis = (sky.sunVis || 0) * (1 - clamp(((weather.cur && weather.cur.cloud) || 0) * 1.6 - 0.3, 0, 1)) * (1 - ((weather.cur && weather.cur.rain) || 0));
        const vx = bx - cam[0], vy = C.y1 + H * 0.25 - cam[1], vz = bz - cam[2], vl = Math.hypot(vx, vy, vz) || 1;
        const dos = -(vx * sd[0] + vy * sd[1] + vz * sd[2]) / vl;
        if (vis > 0.5 && sd[1] > 0.05 && sd[1] < 0.67 && dos > 0.55) this.arc(cam, [vx / vl, vy / vl, vz / vl], [bx, C.y1, bz], Math.max(C.l, 6), d);
      }
    }
    // la vapeur de la source tiède, les embruns des petites chutes : rien de plus (de près, la brume suffit)
    if (brume && !sous) for (const Q of P.coins) {
      if (!Q.vapeur) continue;
      const d = Math.hypot(Q.x - cam[0], Q.z - cam[2]);
      if (d > 60 || !Q.bain) continue;
      const [x, y, z] = Q.bain;
      particles.spawn(x + (Math.random() - 0.5) * 7, y + 0.1, z + (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 0.2, 0.25 + Math.random() * 0.35, (Math.random() - 0.5) * 0.2, [0.9, 0.92, 0.94, 0.18], 0.4, 3 + Math.random() * 2, -0.02, false);
      particles.list[particles.list.length - 1].grow = 2.2;
    }
  },
  // un arc posé dans la brume, face à l'œil : quatre bandes de couleur (rouge dehors, violet dedans)
  arc(cam, v, pied, R, d) {
    const up = [0, 1, 0], rx = [v[2], 0, -v[0]], rl = Math.hypot(rx[0], rx[2]) || 1;
    rx[0] /= rl; rx[2] /= rl;
    const c0 = [pied[0] - v[0] * 1.5, pied[1] - R * 0.2, pied[2] - v[2] * 1.5];
    const bandes = [[1.0, 0.35, 0.3], [1.0, 0.85, 0.35], [0.45, 0.95, 0.45], [0.45, 0.6, 1.0]];
    const a = clamp(0.32 - d / 400, 0.1, 0.3);
    bandes.forEach((col, b) => {
      const r = R * (1 - b * 0.06);
      for (let i = 0; i <= 16; i++) {
        const th = Math.PI * (0.12 + 0.76 * i / 16), x = c0[0] + rx[0] * Math.cos(th) * r, y = c0[1] + Math.sin(th) * r, z = c0[2] + rx[2] * Math.cos(th) * r;
        particles.spawn(x, y, z, 0, 0, 0, [col[0], col[1], col[2], a], 0.5 + R * 0.025, 1.0, 0, true);
      }
    });
  },
};

// ---------------------------------------------------------------- branchements
HOOKS.load.push(() => { try { p18Rendu.installer(); } catch (e) { console.error('P18 rendu', e); } });
HOOKS.draw.push((buf, sbuf, cam, t) => { try { p18Rendu.dessiner(buf, cam, t); } catch (e) { if (!p18Rendu._e2) { p18Rendu._e2 = true; console.error('P18 chutes', e); } } });
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s && game.world && game.world.p18) try { p18Rendu.particules(dt, eye, basis, sky); } catch (e) { if (!p18Rendu._e3) { p18Rendu._e3 = true; console.error('P18 brume', e); } } });
