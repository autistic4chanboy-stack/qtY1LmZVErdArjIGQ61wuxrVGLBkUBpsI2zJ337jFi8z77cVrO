// ============================================================================
//  LES TRAJETS DES HABITANTS (agent Z, vague 14) — 1. LA CARTE DES PAS
//  « refait aussi tout le math travel des PNJ pour tout fixe »
//  Une grille fine (0,25 m), calculée par carreaux de 16 m quand on en a besoin et gardée en mémoire,
//  qui sait où un habitant pose le pied : le sol (relief, planchers, marches, tabliers des ponts), l'eau
//  et les douves, les murs, les meubles, les arbres et les rochers, les portes (et à qui elles sont), les
//  ponts-levis (baissés ou levés) — avec la place qu'il faut à un corps (0,3 m de rayon, de la cheville
//  à 1,75 m). Trois sortes de couches : la surface, le dessous (la halle des nains, sous la falaise), et les étages
//  (les planchers hauts des maisons, qu'on rejoint par l'échelle de meunier — 11-zzzzB1-ville.js).
//  Sur cette grille : un A* borné (tas binaire), la vue dégagée d'un point à un autre (pour couper au
//  plus court), le point libre le plus proche (pour s'approcher d'un lit, d'un banc, d'un établi).
//  API (interne : trajets.grille) : reset(w), couche(x, y, z), cellule(x, z, c), libre(x, z, c, r, opts),
//  vue(x0, z0, x1, z1, c, opts), chemin(x0, z0, x1, z1, c, opts), carreauxFaits(), oublier(x, z, r).
// ============================================================================
const ZG_C = 0.25, ZG_N = 64, ZG_R = 0.3, ZG_RM = 0.22, ZG_PAS = 0.5, ZG_TETE = 1.75, ZG_PENTE = 1.0;
// drapeaux d'une cellule
const ZG_BLOQ = 1, ZG_EAU = 2, ZG_PORTE = 4, ZG_PONT = 8, ZG_BLOC = 16, ZG_MEUBLE = 32, ZG_BORD = 64, ZG_SOLIDE = 128;
const ZG_K = 8; // surfaces retenues par cellule pendant le calcul d'un carreau
const ZG_TOUTES = { portes: true }; // (les portes comptent ouvertes)
// un objet posé large, plat et mince (les planches d'un pont de bois, un caillebotis) se marche comme un plancher ;
// les autres (lits, tables, bancs, coffres) sont des meubles qu'on contourne
const zgPlancher = (b) => b.sy <= 0.35 && Math.min(b.sx, b.sz) >= 0.9;

const zgrille = {
  w: null, carreaux: new Map(), couches: [], nCarreaux: 0, tCarreaux: 0, gridRef: null, image: 0,
  // tampons partagés (un carreau à la fois)
  lb: new Float32Array(ZG_N * ZG_N * ZG_K), lt: new Float32Array(ZG_N * ZG_N * ZG_K), le: new Uint8Array(ZG_N * ZG_N * ZG_K), ln: new Uint8Array(ZG_N * ZG_N),
  vuB: new Uint32Array(16), vuO: new Uint32Array(16), tampon: 1,

  reset(w) { this.w = w; this.carreaux.clear(); this.couches = []; this.gridRef = w ? w.grid : null; this.nCarreaux = 0; this.tCarreaux = 0; this.file = []; this.fileK = new Set(); this.T = null; },
  // la couche d'un point : 0 = surface ; k ≥ 1 = un dessous (plus de 2 m sous le relief) ou un étage (plus de 2,2 m
  // au-dessus du relief ou de l'eau), repérés par leur hauteur
  couche(x, y, z) {
    const w = this.w;
    if (!w || y === undefined || y === null) return 0;
    const terr = w.heightAt(x, z), type = y < terr - 2 ? -1 : y > Math.max(terr, w.waterLevel) + 2.2 ? 1 : 0;
    if (!type) return 0;
    for (let k = 0; k < this.couches.length; k++) { const C = this.couches[k]; if (C.type === type && Math.abs(C.y - y) < (type < 0 ? 3 : 1.0)) return k + 1; }
    if (this.couches.length >= 15) return 0;
    this.couches.push({ type, y });
    return this.couches.length;
  },
  cle(tx, tz, c) { return (tx * 2048 + tz) * 16 + c; },
  carreau(tx, tz, c) {
    const k = this.cle(tx, tz, c);
    let T = this.carreaux.get(k);
    if (!T) { T = this.construire(tx, tz, c); this.carreaux.set(k, T); }
    T.t = this.image;
    return T;
  },
  // le monde a changé autour de (x, z) : on refera les carreaux
  oublier(x, z, r) {
    const S = ZG_N * ZG_C;
    for (const [k, T] of this.carreaux) {
      const cx = (T.tx + 0.5) * S, cz = (T.tz + 0.5) * S;
      if (r === undefined || (Math.abs(cx - x) < r + S && Math.abs(cz - z) < r + S)) this.carreaux.delete(k);
    }
  },
  // des carreaux à préparer d'avance, un par image quand on a le temps (pour qu'un A* n'en calcule pas dix d'un coup)
  file: [], fileK: new Set(),
  prechauffer(x, z, r, c) {
    const S = ZG_N * ZG_C, t0x = Math.floor((x - r) / S), t1x = Math.floor((x + r) / S), t0z = Math.floor((z - r) / S), t1z = Math.floor((z + r) / S);
    for (let tx = t0x; tx <= t1x; tx++) for (let tz = t0z; tz <= t1z; tz++) {
      const k = this.cle(tx, tz, c || 0);
      if (this.carreaux.has(k) || this.fileK.has(k)) continue;
      if (this.file.length > 400) return;
      this.fileK.add(k); this.file.push([tx, tz, c || 0]);
    }
  },
  preparer(ms) {
    const t0 = performance.now();
    while (this.file.length && performance.now() - t0 < ms) {
      const [tx, tz, c] = this.file.shift(), k = this.cle(tx, tz, c);
      this.fileK.delete(k);
      if (!this.carreaux.has(k)) this.carreau(tx, tz, c);
    }
  },
  // garder la mémoire raisonnable : on oublie les carreaux les moins servis
  ranger(max) {
    if (this.carreaux.size <= max) return;
    const L = [...this.carreaux.entries()].sort((a, b) => a[1].t - b[1].t);
    for (let i = 0; i < L.length - max * 0.8; i++) this.carreaux.delete(L[i][0]);
  },

  // ------------------------------------------------------------------ calcul d'un carreau
  construire(tx, tz, c) {
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    const w = this.w, N = ZG_N, C = ZG_C, x0 = tx * N * C, z0 = tz * N * C, WL = w.waterLevel;
    const Lc = c > 0 ? this.couches[c - 1] : null, sous = Lc && Lc.type < 0 ? Lc.y : null, etage = Lc && Lc.type > 0 ? Lc.y : null;
    const sol = new Float32Array(N * N), f = new Uint8Array(N * N);
    let porte = null;
    const lb = this.lb, lt = this.lt, le = this.le, ln = this.ln;
    ln.fill(0);
    if (!w.grid) w.rebuildGrid();
    // les blocs et les objets du coin (tamponnés : chacun une fois)
    const tb = ++this.tampon;
    if (this.vuB.length < w.blocks.length) this.vuB = new Uint32Array(w.blocks.length + 1024);
    if (this.vuO.length < w.objects.length) this.vuO = new Uint32Array(w.objects.length + 4096);
    const blocs = [], objs = [], G = w.grid, m = 1.2;
    const gx0 = Math.max(0, Math.floor((x0 - m) / GRID_CELL)), gx1 = Math.min(G.gw - 1, Math.floor((x0 + N * C + m) / GRID_CELL));
    const gz0 = Math.max(0, Math.floor((z0 - m) / GRID_CELL)), gz1 = Math.min(G.gw - 1, Math.floor((z0 + N * C + m) / GRID_CELL));
    for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
      const cell = G.cells[gz * G.gw + gx];
      if (!cell) continue;
      for (const it of cell) {
        if (it >= 0) { if (this.vuO[it] !== tb) { this.vuO[it] = tb; const o = w.objects[it]; if (w.live(o)) objs.push(o); } }
        else { const bi = -1 - it; if (this.vuB[bi] !== tb) { this.vuB[bi] = tb; const b = w.blocks[bi]; if (!(b.ver && !(b.ver & w.curVer))) blocs.push(b); } }
      }
    }
    // (sous terre : les blocs du dessous, et tout ce qui s'y dresse à hauteur — les murs des salles des nains ne sont pas
    //  tous marqués « under » ; à l'étage et en surface, rien de ce qui est sous terre)
    const pour = (b) => (sous === null ? !b.under : !!b.under || (b.y < sous + 3 && b.y + b.sy > sous - 2));
    // parcourt les cellules dont le centre est à moins de « marge » du rectangle du bloc
    const balayer = (b, marge, fn) => {
      const co = Math.cos(b.r), si = Math.sin(b.r), hx = b.sx / 2, hz = b.sz / 2;
      const ex = Math.abs(co) * hx + Math.abs(si) * hz + marge, ez = Math.abs(si) * hx + Math.abs(co) * hz + marge;
      const i0 = Math.max(0, Math.floor((b.x - ex - x0) / C)), i1 = Math.min(N - 1, Math.floor((b.x + ex - x0) / C));
      const j0 = Math.max(0, Math.floor((b.z - ez - z0) / C)), j1 = Math.min(N - 1, Math.floor((b.z + ez - z0) / C));
      for (let j = j0; j <= j1; j++) {
        const cz = z0 + (j + 0.5) * C, dz = cz - b.z;
        for (let i = i0; i <= i1; i++) {
          const dx = x0 + (i + 0.5) * C - b.x, lx = dx * co - dz * si, lz = dx * si + dz * co;
          const ox = Math.abs(lx) - hx, oz = Math.abs(lz) - hz;
          if (ox > marge || oz > marge) continue;
          const px = ox > 0 ? ox : 0, pz = oz > 0 ? oz : 0, d = px > 0 || pz > 0 ? Math.sqrt(px * px + pz * pz) : 0;
          if (d > marge) continue;
          fn(j * N + i, lx, lz, d, hx, hz);
        }
      }
    };
    // 1. les surfaces de chaque cellule (relief, dessus des blocs « de structure », planches posées : pas les meubles)
    for (const b of blocs) {
      if ((b.hidden && !zgPlancher(b)) || !pour(b)) continue;
      const eau = b.m === M_WATERB ? 1 : 0;
      balayer(b, 0, (k, lx, lz) => {
        const n = ln[k];
        if (n >= ZG_K) return;
        const q = k * ZG_K + n;
        lb[q] = b.y; lt[q] = b.sh ? b.y + World.blockTop(b, lx, lz) : b.y + b.sy; le[q] = eau; ln[k] = n + 1;
      });
    }
    const cand = new Float32Array(ZG_K + 1), candB = new Uint8Array(ZG_K + 1);
    const Md = w.moat && Math.abs(w.moat.x - (x0 + N * C / 2)) < w.moat.outer + N * C && Math.abs(w.moat.z - (z0 + N * C / 2)) < w.moat.outer + N * C ? w.moat : null;
    // le relief (même triangulation que World.heightAt, sans appel par cellule)
    const terrH = this.terrH || (this.terrH = new Float32Array(N * N));
    {
      const HH = w.heights, Wd = w.W, ce = w.cell, NN = w.N - 1e-4;
      for (let j = 0; j < N; j++) {
        let gz = (z0 + (j + 0.5) * C) / ce; gz = gz < 0 ? 0 : gz > NN ? NN : gz;
        const jj = Math.floor(gz), fz = gz - jj, r0 = jj * Wd, r1 = r0 + Wd;
        for (let i = 0; i < N; i++) {
          let gx = (x0 + (i + 0.5) * C) / ce; gx = gx < 0 ? 0 : gx > NN ? NN : gx;
          const ii = Math.floor(gx), fx = gx - ii;
          const ha = HH[r0 + ii], hb = HH[r0 + ii + 1], hc = HH[r1 + ii], hd = HH[r1 + ii + 1];
          terrH[j * N + i] = fx + fz <= 1 ? ha + (hb - ha) * fx + (hc - ha) * fz : hd + (hc - hd) * (1 - fx) + (hb - hd) * (1 - fz);
        }
      }
    }
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i;
      const terr = terrH[k], n = ln[k];
      // les candidats, du plus bas au plus haut
      let nc = 0;
      if (sous === null && (etage === null || Math.abs(terr - etage) < 1.0)) { cand[nc] = terr; candB[nc++] = 0; }
      for (let e = 0; e < n; e++) { const q = k * ZG_K + e; if (le[q]) continue; cand[nc] = lt[q]; candB[nc++] = 1; }
      for (let a = 1; a < nc; a++) { const v = cand[a], vb = candB[a]; let b = a - 1; while (b >= 0 && cand[b] > v) { cand[b + 1] = cand[b]; candB[b + 1] = candB[b]; b--; } cand[b + 1] = v; candB[b + 1] = vb; }
      const bas = sous !== null ? sous - 1.6 : etage !== null ? etage - 1.0 : terr - 0.05, haut = sous !== null ? sous + 1.2 : etage !== null ? etage + 1.0 : 1e9;
      let s = NaN, deBloc = false, mouille = false;
      for (let a = 0; a < nc; a++) {
        const T = cand[a];
        if (T < bas || T > haut) continue;
        if (sous === null && T < WL + 0.12) { mouille = true; continue; }
        let couvert = false, dansEau = false;
        for (let e = 0; e < n; e++) {
          const q = k * ZG_K + e;
          if (le[q]) { if (lb[q] <= T + 0.02 && lt[q] > T + 0.05) dansEau = true; continue; }
          if (lb[q] < T + ZG_TETE && lt[q] > T + 0.02) { couvert = true; break; }
        }
        if (couvert) continue;
        if (dansEau) { mouille = true; continue; }
        s = T; deBloc = candB[a] === 1; break;
      }
      // (un dessus de mur, un toit restent des cases « libres » mais sans voisin à leur hauteur : on n'y va jamais ;
      //  un tablier de pont haut au-dessus d'une rivière, lui, se rejoint par ses rampes)
      if (s !== s) { sol[k] = sous !== null ? sous : etage !== null ? etage : terr; f[k] = mouille ? (ZG_EAU | ZG_BLOQ) : (ZG_SOLIDE | ZG_BLOQ); }
      else { sol[k] = s; f[k] = deBloc ? ZG_BLOC : 0; }
      // (les douves de la ville : l'eau, et ses berges en pente — on ne s'y promène pas ; on les passe sur les ponts)
      if (Md && sous === null && etage === null && !(f[k] & ZG_EAU)) {
        const dc = Math.max(Math.abs(x0 + (i + 0.5) * C - Md.x), Math.abs(z0 + (j + 0.5) * C - Md.z));
        if (dc > Md.inner + 0.2 && dc < Md.outer - 0.2) f[k] = ZG_EAU | ZG_BLOQ;
      }
    }
    // 2. les tabliers des ponts-levis (on les compte baissés ; levés, on ne passe pas : voir passe())
    if (sous === null && etage === null) for (let bi = 0; bi < w.bridges.length; bi++) {
      const br = w.bridges[bi];
      if (Math.abs(br.x - (x0 + N * C / 2)) > N * C / 2 + br.L + 4 || Math.abs(br.z - (z0 + N * C / 2)) > N * C / 2 + br.L + 4) continue;
      const dx = Math.sin(br.r), dz = Math.cos(br.r);
      const deck = { x: br.x + dx * br.L / 2, y: br.y - 0.25, z: br.z + dz * br.L / 2, sx: br.w, sy: 0.25, sz: br.L + 0.6, r: br.r };
      balayer(deck, 0.05, (k) => {
        if (!porte) { porte = new Int16Array(N * N); porte.fill(-1); }
        sol[k] = br.y; f[k] = (f[k] & ~(ZG_EAU | ZG_BLOQ | ZG_SOLIDE)) | ZG_PONT | ZG_BLOC; porte[k] = -10 - bi;
      });
    }
    // (le bord de l'eau — une berge, le bord d'un tablier de pont — : on ne le rase pas)
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const k = j * N + i;
      if (f[k] & ZG_BLOQ) continue;
      if ((i > 0 && (f[k - 1] & ZG_EAU)) || (i < N - 1 && (f[k + 1] & ZG_EAU)) || (j > 0 && (f[k - N] & ZG_EAU)) || (j < N - 1 && (f[k + N] & ZG_EAU))) f[k] |= ZG_BORD;
    }
    // 3. les portes : l'embrasure (on y passe en ouvrant ; une porte fermée à clé n'est qu'à ses gens) ;
    //    dans l'embrasure on se fait mince et l'on baisse la tête (les portes basses des cabanes, des roulottes)
    if (sous === null && etage === null) for (let di = 0; di < w.doors.length; di++) {
      const d = w.doors[di];
      if (d.x < x0 - 3 || d.x > x0 + N * C + 3 || d.z < z0 - 3 || d.z > z0 + N * C + 3) continue;
      const box = { x: d.x, z: d.z, r: d.r, sx: d.w + 0.1, sz: 1.3 };
      balayer(box, 0, (k) => {
        if (!porte) { porte = new Int16Array(N * N); porte.fill(-1); }
        if (porte[k] <= -10) return;
        porte[k] = di; f[k] |= ZG_PORTE;
      });
    }
    // 4. les obstacles, à hauteur de corps, gonflés du rayon (et une bordure, qu'on évite de raser)
    const R = ZG_R, RB = ZG_R + 0.3;
    for (const b of blocs) {
      if (!pour(b)) continue;
      const meuble = !!b.hidden && !zgPlancher(b);
      balayer(b, RB, (k, lx, lz, d, hx, hz) => {
        const fk = f[k];
        if (fk & (ZG_SOLIDE | ZG_EAU)) return;
        const em = fk & ZG_PORTE, s = sol[k], lo = s + (meuble ? 0.05 : ZG_PAS - 0.03), hi = s + (em ? 1.5 : ZG_TETE);
        if (b.y >= hi) return;
        const top = b.sh ? b.y + World.blockTop(b, lx < -hx ? -hx : lx > hx ? hx : lx, lz < -hz ? -hz : lz > hz ? hz : lz) : b.y + b.sy;
        if (top <= lo) return;
        // (un meuble bas devant une porte — un banc, une malle — s'enjambe au besoin ; les autres meubles, on les contourne
        //  d'un peu plus près que les murs)
        if (d <= (em ? 0.17 : meuble ? ZG_RM : R)) f[k] = fk | ZG_BLOQ | (meuble && em && top - s <= 0.56 ? ZG_MEUBLE : ZG_SOLIDE);
        else f[k] = fk | ZG_BORD;
      });
    }
    for (const o of objs) {
      const t = OBJ_TYPES[o.t], r = objRadius(t, o);
      if (!r) continue;
      const oy = w.objectY(o), top = oy + o.h * 0.8;
      const disque = { x: o.x, z: o.z, r: 0, sx: 0, sz: 0 };
      balayer(disque, r + RB, (k, lx, lz, d) => {
        const fk = f[k];
        if (fk & (ZG_SOLIDE | ZG_EAU)) return;
        const s = sol[k];
        if (oy >= s + ZG_TETE || top <= s + 0.3) return;
        if (d <= r + R) f[k] = fk | ZG_BLOQ | ZG_SOLIDE;
        else f[k] = fk | ZG_BORD;
      });
    }
    this.nCarreaux++;
    if (t0) this.tCarreaux += performance.now() - t0;
    return { tx, tz, c, sol, f, porte, t: this.image };
  },

  // ------------------------------------------------------------------ lecture
  // cellule globale (gx, gz) d'une couche : renvoie l'indice dans son carreau (et le carreau dans this.T)
  T: null,
  lire(gx, gz, c) {
    const tx = gx >> 6, tz = gz >> 6;
    let T = this.T;
    if (!T || T.tx !== tx || T.tz !== tz || T.c !== c) T = this.T = this.carreau(tx, tz, c);
    return (gz & 63) * 64 + (gx & 63);
  },
  cellule(x, z, c) {
    const gx = Math.floor(x / ZG_C), gz = Math.floor(z / ZG_C), k = this.lire(gx, gz, c || 0), T = this.T;
    return { gx, gz, sol: T.sol[k], f: T.f[k], porte: T.porte ? T.porte[k] : -1 };
  },
  // peut-on se tenir dans cette cellule ? (qui : l'habitant, pour les portes à clé ; opts.enjamber : le meuble bas d'une embrasure)
  passe(T, k, qui, opts) {
    const fk = T.f[k];
    if (fk & ZG_BLOQ) {
      if (!(opts && opts.enjamber && (fk & ZG_MEUBLE) && !(fk & (ZG_SOLIDE | ZG_EAU)))) return false;
    }
    if (fk & (ZG_PORTE | ZG_PONT)) {
      const p = T.porte[k];
      if (p <= -10) { const br = this.w.bridges[-10 - p]; if (br && br.a >= 0.3) return false; }
      else if (p >= 0 && !(opts && opts.portes)) {
        const dr = this.w.doors[p];
        if (dr && dr.locked && !(qui && qui.d && (dr.bld === qui.d.home || dr.bld === qui.d.work || dr.bld === qui.zDedans)) && !(opts && opts.cles)) return false;
      }
    }
    return true;
  },
  // la marche d'une cellule à sa voisine (marche de bloc, pente du relief)
  marche(s0, f0, s1, f1, dist) {
    const dh = Math.abs(s1 - s0);
    if ((f0 | f1) & (ZG_BLOC | ZG_PONT)) return dh <= ZG_PAS;
    return dh <= Math.max(0.2, ZG_PENTE * dist);
  },

  // ------------------------------------------------------------------ vue dégagée (on suit les cellules traversées)
  vue(x0, z0, x1, z1, c, opts) {
    const qui = opts && opts.qui;
    let gx = Math.floor(x0 / ZG_C), gz = Math.floor(z0 / ZG_C);
    const gx1 = Math.floor(x1 / ZG_C), gz1 = Math.floor(z1 / ZG_C);
    const dx = x1 - x0, dz = z1 - z0, sx = dx > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    const tdx = dx !== 0 ? Math.abs(ZG_C / dx) : 1e9, tdz = dz !== 0 ? Math.abs(ZG_C / dz) : 1e9;
    let tmx = dx !== 0 ? ((sx > 0 ? (gx + 1) * ZG_C - x0 : x0 - gx * ZG_C) / Math.abs(dx)) : 1e9;
    let tmz = dz !== 0 ? ((sz > 0 ? (gz + 1) * ZG_C - z0 : z0 - gz * ZG_C) / Math.abs(dz)) : 1e9;
    let k = this.lire(gx, gz, c), T = this.T;
    if (!(opts && opts.depart) && !this.passe(T, k, qui, opts)) return false;
    let s = T.sol[k], fl = T.f[k];
    const max = 4 + Math.abs(gx1 - gx) + Math.abs(gz1 - gz);
    for (let n = 0; n < max && (gx !== gx1 || gz !== gz1); n++) {
      if (tmx < tmz) { tmx += tdx; gx += sx; } else { tmz += tdz; gz += sz; }
      k = this.lire(gx, gz, c); T = this.T;
      const fin = gx === gx1 && gz === gz1;
      if (!this.passe(T, k, qui, opts)) return false;
      const s1 = T.sol[k], f1 = T.f[k];
      if (!this.marche(s, fl, s1, f1, ZG_C)) return false;
      s = s1; fl = f1;
    }
    return true;
  },

  // ------------------------------------------------------------------ le point libre le plus proche (en spirale)
  // opts : qui, y (le niveau voulu), hors (pas la case même), ouvert (pas un recoin fermé : margelle de fontaine, enclos)
  // (meme : { x, z } — du même côté des murs que ce point : pas de point d'approche derrière la cloison)
  libre(x, z, c, rmax, opts) {
    const gx0 = Math.floor(x / ZG_C), gz0 = Math.floor(z / ZG_C), qui = opts && opts.qui, ouvert = opts && opts.ouvert, meme = opts && opts.meme;
    let k = this.lire(gx0, gz0, c);
    if (this.passe(this.T, k, qui, opts) && !(opts && opts.hors) && (!ouvert || !this.poche(gx0, gz0, c))) return { x: (gx0 + 0.5) * ZG_C, z: (gz0 + 0.5) * ZG_C, y: this.T.sol[k], d: 0 };
    // (on reste au même niveau : le plancher sous le meuble visé, pas le dessus d'un mur)
    const R = Math.ceil((rmax || 3) / ZG_C), ref = opts && opts.y !== undefined && opts.y !== null ? opts.y : this.T.sol[k];
    const cand = [];
    for (let r = 1; r <= R; r++) {
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        const gx = gx0 + dx, gz = gz0 + dz;
        k = this.lire(gx, gz, c);
        const T = this.T;
        if (!this.passe(T, k, qui, null)) continue;
        if (Math.abs(T.sol[k] - ref) > 0.8) continue;
        cand.push([Math.hypot(dx, dz), gx, gz, T.sol[k]]);
      }
      // (assez de candidats à cette distance : la spirale s'arrête un anneau plus loin)
      if (!meme && cand.length && cand.reduce((m, q) => Math.min(m, q[0]), 1e9) <= r - (ouvert ? 2 : 0)) break;
    }
    cand.sort((a, b) => a[0] - b[0]);
    let essais = 0, essaisM = 0;
    for (const [d, gx, gz, s] of cand) {
      if (ouvert && essais++ < 10 && this.poche(gx, gz, c)) continue;
      if (meme) { if (essaisM++ >= 24) break; if (this.murEntre((gx + 0.5) * ZG_C, (gz + 0.5) * ZG_C, meme.x, meme.z, s)) continue; }
      return { x: (gx + 0.5) * ZG_C, z: (gz + 0.5) * ZG_C, y: s, d: d * ZG_C };
    }
    return null;
  },
  // un mur (un bloc de structure haut — pas un meuble, pas un muret, pas un banc de pierre) entre deux points, à hauteur
  // de corps ? (le dernier tiers de mètre avant le point visé ne compte pas : on s'assoit SUR un banc de pierre)
  murEntre(x0, z0, x1, z1, y) {
    const w = this.w, L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(L / 0.1));
    let hit = false;
    for (let k = 1; k < n && !hit; k++) {
      const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n;
      if (Math.hypot(x1 - x, z1 - z) < 0.3) break;
      w.query(x, z, 0.2, null, (b) => {
        if (hit || b.hidden || (b.ver && !(b.ver & w.curVer))) return;
        const [lx, lz] = World.blockLocal(b, x, z);
        if (Math.abs(lx) > b.sx / 2 - 0.01 || Math.abs(lz) > b.sz / 2 - 0.01) return;
        if (b.y > y + 0.5 || b.y + World.blockTop(b, lx, lz) < y + 1.3) return;
        hit = true;
      });
    }
    return hit;
  },
  // un recoin fermé ? (on compte les cases qu'on atteint à pied, jusqu'à « lim » : moins, c'est une margelle, un enclos, un îlot)
  PQ: null, PV: null, PS: null, PF: null, pgen: 0,
  poche(gx0, gz0, c, lim) {
    lim = lim || 480;
    const W = 96, H = W >> 1;
    if (!this.PQ) { this.PQ = new Int32Array(W * W); this.PV = new Uint32Array(W * W); this.PS = new Float32Array(W * W); this.PF = new Uint8Array(W * W); }
    const g = ++this.pgen, Q = this.PQ, V = this.PV, sols = this.PS, fls = this.PF;
    let qa = 0, qb = 0, n = 0;
    Q[qb++] = H * W + H; V[H * W + H] = g;
    let k = this.lire(gx0, gz0, c);
    sols[H * W + H] = this.T.sol[k]; fls[H * W + H] = this.T.f[k];
    const DX = [1, -1, 0, 0], DZ = [0, 0, 1, -1];
    while (qa < qb) {
      const cur = Q[qa++]; n++;
      if (n >= lim) return false;
      const cx = cur % W, cz = (cur / W) | 0;
      for (let d = 0; d < 4; d++) {
        const nx = cx + DX[d], nz = cz + DZ[d];
        if (nx < 0 || nz < 0 || nx >= W || nz >= W) return false; // (on sort de la fenêtre : c'est ouvert)
        const ni = nz * W + nx;
        if (V[ni] === g) continue;
        k = this.lire(gx0 + nx - H, gz0 + nz - H, c);
        const T = this.T;
        if (!this.passe(T, k, null, ZG_TOUTES)) continue;
        if (!this.marche(sols[cur], fls[cur], T.sol[k], T.f[k], ZG_C)) continue;
        V[ni] = g; sols[ni] = T.sol[k]; fls[ni] = T.f[k];
        Q[qb++] = ni;
      }
    }
    return true;
  },

  // ------------------------------------------------------------------ A* sur la grille (fenêtre bornée, tas binaire)
  F: null,
  fenetre(n) {
    if (this.F && this.F.cap >= n) return this.F;
    const cap = Math.max(n, 160000);
    return (this.F = { cap, g: new Float32Array(cap), par: new Int32Array(cap), st: new Uint32Array(cap), fer: new Uint32Array(cap), sol: new Float32Array(cap), fl: new Uint8Array(cap), tas: new Int32Array(cap * 2), cle: new Float32Array(cap * 2), gen: 0 });
  },
  // chemin(x0, z0, x1, z1, c, opts) → [{x, z, y}…] (le départ exclu, l'arrivée comprise) ou null
  // opts : qui (portes à clé), marge (m, autour du rectangle départ-arrivée), max (expansions), rayonBut, yBut, yDep,
  //        portes (ignorer les clés), proche (accepter d'arriver à moins de … m si l'arrivée est inaccessible)
  chemin(x0, z0, x1, z1, c, opts) {
    opts = opts || {};
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    const C = ZG_C, qui = opts.qui;
    // une arrivée impossible (dans un meuble, un mur, l'eau) : la cellule libre la plus proche (le « point d'approche ») ;
    // un départ dans la bordure d'un obstacle : on part de la cellule libre voisine
    this.approche = null; this.raison = null;
    {
      const kg = this.lire(Math.floor(x1 / C), Math.floor(z1 / C), c);
      if (!this.passe(this.T, kg, qui, opts)) {
        const L = this.libre(x1, z1, c, opts.rayonBut || 2.5, { qui, portes: opts.portes, cles: opts.cles, y: opts.yBut, meme: { x: x1, z: z1 } });
        if (!L) { this.stat.echec++; this.raison = 'but'; return null; }
        x1 = L.x; z1 = L.z; this.approche = L;
      }
      const ks = this.lire(Math.floor(x0 / C), Math.floor(z0 / C), c);
      if (!this.passe(this.T, ks, qui, opts)) {
        const L = this.libre(x0, z0, c, 3, { qui, portes: opts.portes, cles: opts.cles, y: opts.yDep });
        if (L) { x0 = L.x; z0 = L.z; }
      }
    }
    const sx = Math.floor(x0 / C), sz = Math.floor(z0 / C), ex = Math.floor(x1 / C), ez = Math.floor(z1 / C);
    const marge = Math.ceil((opts.marge ?? 14) / C);
    let wx0 = Math.min(sx, ex) - marge, wz0 = Math.min(sz, ez) - marge, wx1 = Math.max(sx, ex) + marge, wz1 = Math.max(sz, ez) + marge;
    const ww = wx1 - wx0 + 1, wh = wz1 - wz0 + 1;
    if (ww * wh > 640000) { this.stat.trop++; this.raison = 'max'; return null; }
    const F = this.fenetre(ww * wh);
    const gen = ++F.gen;
    const idx = (gx, gz) => (gz - wz0) * ww + (gx - wx0);
    // départ : la cellule même, ou la plus proche libre
    let k = this.lire(sx, sz, c);
    let s0 = this.T.sol[k], f0 = this.T.f[k];
    const start = idx(sx, sz), goal = idx(ex, ez);
    const H = (i) => { const gx = i % ww, gz = (i / ww) | 0, ax = Math.abs(gx + wx0 - ex), az = Math.abs(gz + wz0 - ez); return (Math.max(ax, az) + 0.4142 * Math.min(ax, az)) * C; };
    let nt = 0;
    const push = (i, key) => { let p = nt++; F.tas[p] = i; F.cle[p] = key; while (p > 0) { const q = (p - 1) >> 1; if (F.cle[q] <= key) break; F.tas[p] = F.tas[q]; F.cle[p] = F.cle[q]; F.tas[q] = i; F.cle[q] = key; p = q; } };
    const pop = () => { const top = F.tas[0]; nt--; if (nt > 0) { const i = F.tas[nt], key = F.cle[nt]; let p = 0; for (;;) { let q = 2 * p + 1; if (q >= nt) break; if (q + 1 < nt && F.cle[q + 1] < F.cle[q]) q++; if (F.cle[q] >= key) break; F.tas[p] = F.tas[q]; F.cle[p] = F.cle[q]; p = q; } F.tas[p] = i; F.cle[p] = key; } return top; };
    F.st[start] = gen; F.g[start] = 0; F.par[start] = -1; F.sol[start] = s0; F.fl[start] = f0;
    push(start, H(start));
    const max = opts.max || 30000;
    let it = 0, best = -1, bestH = 1e9;
    const DX = [1, -1, 0, 0, 1, 1, -1, -1], DZ = [0, 0, 1, -1, 1, -1, 1, -1];
    const aOpts = { portes: opts.portes, cles: opts.cles, enjamber: true };
    let found = -1;
    while (nt > 0 && it++ < max) {
      const cur = pop();
      if (F.fer[cur] === gen) continue;
      F.fer[cur] = gen;
      if (cur === goal) { found = cur; break; }
      const hc = H(cur);
      if (hc < bestH) { bestH = hc; best = cur; }
      const cgx = cur % ww + wx0, cgz = ((cur / ww) | 0) + wz0, cs = F.sol[cur], cf = F.fl[cur], cg = F.g[cur];
      for (let d = 0; d < 8; d++) {
        const ngx = cgx + DX[d], ngz = cgz + DZ[d];
        if (ngx < wx0 || ngx > wx1 || ngz < wz0 || ngz > wz1) continue;
        const ni = idx(ngx, ngz);
        if (F.fer[ni] === gen) continue;
        const kk = this.lire(ngx, ngz, c), T = this.T;
        if (!this.passe(T, kk, qui, aOpts)) continue;
        const ns = T.sol[kk], nf = T.f[kk], diag = d >= 4, dist = diag ? C * 1.4142 : C;
        if (!this.marche(cs, cf, ns, nf, dist)) continue;
        if (diag) { // pas de coin rogné
          const ka = this.lire(cgx + DX[d], cgz, c), Ta = this.T;
          if (!this.passe(Ta, ka, qui, aOpts)) continue;
          const kb = this.lire(cgx, cgz + DZ[d], c), Tb = this.T;
          if (!this.passe(Tb, kb, qui, aOpts)) continue;
        }
        let cost = dist;
        if (nf & ZG_BORD) cost *= 1.7;
        if (nf & ZG_PORTE) cost += 0.05;
        if (nf & ZG_BLOQ) cost *= 4; // (un banc enjambé devant une porte : en dernier recours)
        const ng = cg + cost;
        if (F.st[ni] === gen && F.g[ni] <= ng) continue;
        F.st[ni] = gen; F.g[ni] = ng; F.par[ni] = cur; F.sol[ni] = ns; F.fl[ni] = nf;
        push(ni, ng + H(ni));
      }
    }
    this.stat.astar++; this.stat.exp += it;
    // (pourquoi rien : la fenêtre épuisée — on ne passe pas —, ou le compte d'expansions atteint — on ne sait pas)
    this.raison = found >= 0 ? null : nt > 0 && it >= max ? 'max' : 'ferme';
    if (found < 0 && opts.proche && best >= 0 && bestH <= opts.proche) found = best;
    if (found < 0) { this.stat.echec++; if (t0) this.stat.ms += performance.now() - t0; return null; }
    // les cellules, de l'arrivée au départ
    const cells = [];
    for (let i = found; i >= 0 && i !== start; i = F.par[i]) cells.push(i);
    cells.reverse();
    const pt = (i) => ({ x: (i % ww + wx0 + 0.5) * C, z: (((i / ww) | 0) + wz0 + 0.5) * C, y: F.sol[i] });
    // on tire le fil : du point d'ancrage, le plus loin qu'on voit (pas doublés, puis dichotomie)
    const out = [], n = cells.length;
    const vOpts = { qui, depart: true, portes: opts.portes, cles: opts.cles };
    const voit = (ax, az, b) => { const P = pt(cells[b]); return this.vue(ax, az, P.x, P.z, c, vOpts); };
    let ax = x0, az = z0, a = -1;
    while (a < n - 1) {
      let good = a + 1, bad = -1, step = 1;
      for (;;) {
        const t = good + step;
        if (t >= n) { if (good < n - 1) { if (voit(ax, az, n - 1)) good = n - 1; else bad = n - 1; } break; }
        if (voit(ax, az, t)) { good = t; step *= 2; } else { bad = t; break; }
      }
      if (bad > 0) while (bad - good > 1) { const m = (good + bad) >> 1; if (voit(ax, az, m)) good = m; else bad = m; }
      const P = pt(cells[good]);
      out.push(P); ax = P.x; az = P.z; a = good;
      if (out.length > 600) break;
    }
    // l'arrivée exacte (si elle est dans la cellule but)
    if (found === goal && out.length) { const L = out[out.length - 1]; L.x = x1; L.z = z1; }
    if (t0) this.stat.ms += performance.now() - t0;
    return out;
  },
  stat: { astar: 0, exp: 0, ms: 0, echec: 0, trop: 0 },
};
