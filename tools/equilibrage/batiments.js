// Équilibrage — les BÂTIMENTS : on entre dans chacun, à chaque étage.
//   node tools/equilibrage.js batiments          (autres graines : BATIMENTS_GRAINES=1234,77 — la vallée est dessinée, elle change peu ; détail : BATIMENTS_DETAIL=1)
// Un bâtiment, c'est un toit : un bloc à deux pans ou en flèche (plus de 6 m², 0,6 m de haut), ou une grande dalle
// haute (3 m × 3 m au moins, 2,2 m au-dessus du terrain) sans toit en pente juste au-dessus. Sous chaque toit, chaque
// NIVEAU (le sol, puis chaque plancher plus haut qui couvre le milieu) est examiné à hauteur d'homme sur une grille de
// 0,2 m, exactement comme le joueur se cogne (10-player.js, World.pushOut : marche de 0,55 m, 1,75 m sous un linteau,
// 0,33 m de rayon) ; les portes (w.doors) comptent comme ouvertes. Un niveau est :
//   « ouvert »  si l'on y entre à pied depuis le dehors ;
//   « échelle » si une interaction qui transporte (data.to : échelle, trappe, escalier) y dépose le joueur ;
//   « clos »    s'il y a de la place à l'intérieur mais aucun accès ;
//   « plein »   si rien n'est libre à hauteur d'homme (une tour pleine, un four, une table de géant) ;
//   « bas »     si le toit est à moins de 1,6 m du sol (un auvent de croix, une loge basse).
// Vérifie, sur chaque graine : aucun niveau clos, aucun bâtiment plein sous un toit en pente (les masses pleines à
// dessus plat — fours à chaux, table des géants — ne sont pas des bâtiments) ; et sur la graine 1234, que les objets
// d'avant ne bougent pas (empreintes d'origine et d'après la huitième vague).
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');

// la vallée entière après la huitième vague (C1 + C2 + C3) : 103 331 objets, 3 384 objets posés, 931 interactions
const N_C3 = [103331, 3384, 931], EMPREINTE_C3 = '103331/3384/931/48142f0b97c7';
const PAS = 0.2, MARGE = 0.33, MARCHE = 0.55, TETE = 1.75, BORD = 3;

function examiner(J, w) {
  const World = J.ev('World');
  // (R15 : une dalle scellée par les runes, b.r15, est une porte : elle compte comme ouverte)
  const blocs = w.blocks.filter((b) => !(b.ver && !(b.ver & 1)) && !b.r15);
  const C = 8, G = new Map(), cle = (i, j) => i * 100000 + j;
  for (const b of blocs) {
    const r = Math.hypot(b.sx, b.sz) / 2;
    for (let i = Math.floor((b.x - r) / C); i <= Math.floor((b.x + r) / C); i++) for (let j = Math.floor((b.z - r) / C); j <= Math.floor((b.z + r) / C); j++) {
      const k = cle(i, j); if (!G.has(k)) G.set(k, []); G.get(k).push(b);
    }
  }
  const pres = (x, z, R) => { const s = new Set(); for (let i = Math.floor((x - R) / C); i <= Math.floor((x + R) / C); i++) for (let j = Math.floor((z - R) / C); j <= Math.floor((z + R) / C); j++) for (const b of G.get(cle(i, j)) || []) s.add(b); return [...s]; };
  const pentes = blocs.filter((b) => (b.sh === 1 || b.sh === 3) && !b.under && !b.hidden && b.sx * b.sz >= 6 && b.sy >= 0.6);
  const plats = blocs.filter((b) => !b.sh && !b.under && !b.hidden && b.sy <= 0.8 && b.sx >= 3 && b.sz >= 3 && b.y - w.heightAt(b.x, b.z) >= 2.2 && b.y - w.heightAt(b.x, b.z) < 30
    && !pentes.some((R) => Math.hypot(R.x - b.x, R.z - b.z) < Math.max(R.sx, R.sz) / 2 && R.y >= b.y - 0.5 && R.y < b.y + 12));
  const toits = [];
  for (const R of pentes.map((b) => [b, false]).concat(plats.map((b) => [b, true])).sort((a, b) => b[0].sx * b[0].sz - a[0].sx * a[0].sz)) {
    if (toits.some((q) => Math.hypot(q.R.x - R[0].x, q.R.z - R[0].z) < 1.2 && Math.abs(q.R.y - R[0].y) < 1.5)) continue;
    toits.push({ R: R[0], plat: R[1] });
  }
  // ce qui transporte (échelles, trappes…) : où cela dépose le joueur
  const sauts = (w.inter || []).filter((it) => it.data && Array.isArray(it.data.to) && it.data.to.length >= 3);
  const lms = Object.values(w.lm || {}), blds = Object.values(w.bld || {});
  for (const T of toits) {
    const R = T.R, hx = R.sx / 2, hz = R.sz / 2;
    const nb = pres(R.x, R.z, Math.hypot(hx, hz) + BORD + 2);
    const terr = w.heightAt(R.x, R.z), dessus = [];
    for (const b of nb) {
      if (b === R || b.hidden || b.sx * b.sz < 2) continue;
      const [lx, lz] = World.blockLocal(b, R.x, R.z);
      if (Math.abs(lx) > b.sx / 2 || Math.abs(lz) > b.sz / 2) continue;
      const top = b.y + World.blockTop(b, lx, lz);
      if (top < R.y - 1.6) dessus.push(top);
    }
    let sol = terr; for (const t of dessus) if (t > sol && t < terr + 1.2) sol = t;
    const niveaux = [sol];
    for (const t of dessus.sort((a, b) => a - b)) if (t > niveaux[niveaux.length - 1] + 2.0) niveaux.push(t);
    T.niveaux = niveaux.map((plancher) => {
      if (R.y - plancher < 1.6) return { plancher, etat: 'bas' };
      const y0 = plancher + MARCHE, y1 = Math.min(plancher + TETE, R.y - 0.05);
      const nx = Math.ceil(2 * (hx + BORD) / PAS), nz = Math.ceil(2 * (hz + BORD) / PAS);
      const grille = new Uint8Array(nx * nz), c = Math.cos(R.r), s = Math.sin(R.r);
      const cand = nb.filter((b) => b !== R && b.y < y1 && b.y + b.sy > y0);
      const loc = (i, j) => [-hx - BORD + (i + 0.5) * PAS, -hz - BORD + (j + 0.5) * PAS];
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const [lx, lz] = loc(i, j), x = R.x + lx * c + lz * s, z = R.z - lx * s + lz * c;
        for (const b of cand) {
          const [bx, bz] = World.blockLocal(b, x, z), ex = b.sx / 2, ez = b.sz / 2;
          if (Math.abs(bx) > ex + MARGE || Math.abs(bz) > ez + MARGE) continue;
          if (b.y + World.blockTop(b, Math.max(-ex, Math.min(ex, bx)), Math.max(-ez, Math.min(ez, bz))) > y0) { grille[j * nx + i] = 1; break; }
        }
      }
      const vu = new Uint8Array(nx * nz), pile = [];
      const semer = (k) => { if (!grille[k] && !vu[k]) { vu[k] = 1; pile.push(k); } };
      for (let i = 0; i < nx; i++) { semer(i); semer((nz - 1) * nx + i); }
      for (let j = 0; j < nz; j++) { semer(j * nx); semer(j * nx + nx - 1); }
      const etendre = () => {
        while (pile.length) {
          const k = pile.pop(), i = k % nx, j = (k / nx) | 0;
          if (i > 0) semer(k - 1); if (i < nx - 1) semer(k + 1); if (j > 0) semer(k - nx); if (j < nz - 1) semer(k + nx);
        }
      };
      etendre();
      let libre = 0, atteint = 0;
      const dedans = (lx, lz) => Math.abs(lx) <= hx - 1.0 && Math.abs(lz) <= hz - 1.0;
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const [lx, lz] = loc(i, j); if (!dedans(lx, lz)) continue; const k = j * nx + i; if (!grille[k]) { libre++; if (vu[k]) atteint++; } }
      if (atteint) return { plancher, etat: 'ouvert', libre };
      if (!libre) return { plancher, etat: 'plein' };
      // une échelle (ou toute interaction qui transporte) dépose-t-elle le joueur sur ce niveau, à l'intérieur ?
      for (const it of sauts) {
        const [tx, ty, tz] = it.data.to;
        if (Math.abs(ty - plancher) > 0.8) continue;
        const [lx, lz] = World.blockLocal(R, tx, tz);
        if (Math.abs(lx) > hx || Math.abs(lz) > hz) continue;
        const i = Math.floor((lx + hx + BORD) / PAS), j = Math.floor((lz + hz + BORD) / PAS);
        if (i < 0 || j < 0 || i >= nx || j >= nz || grille[j * nx + i]) continue;
        semer(j * nx + i); etendre();
        let n = 0; for (let jj = 0; jj < nz; jj++) for (let ii = 0; ii < nx; ii++) { const [ax, az] = loc(ii, jj); if (dedans(ax, az) && vu[jj * nx + ii]) n++; }
        if (n) return { plancher, etat: 'échelle', libre, par: it.kind + ':' + (it.id || '') };
      }
      return { plancher, etat: 'clos', libre };
    });
    const b = blds.find((B) => Math.hypot(B.x - R.x, B.z - R.z) < 2.5);
    let L = null, dL = 1e9; for (const q of lms) { const d = Math.hypot(q.x - R.x, q.z - R.z); if (d < dL) { dL = d; L = q; } }
    T.nom = b ? b.key : L && dL < 60 ? `${L.name} (${L.key}, ${Math.round(dL)} m)` : '?';
  }
  return toits;
}

module.exports = {
  titre: 'Bâtiments : on entre dans chacun, à chaque étage',
  examiner,
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, msg) => { if (!ok) echecs++; log(`  ${ok ? 'ok ' : 'ÉCHEC'} ${msg}`); };
    const graines = (process.env.BATIMENTS_GRAINES || '1234').split(',').map(Number);
    for (const g of graines) {
      const t0 = Date.now();
      const Jg = g === graines[0] ? J : require('./vm.js').charger();
      const w = await vallee(Jg, g);
      const toits = examiner(Jg, w);
      const compte = {};
      for (const T of toits) for (const n of T.niveaux) compte[n.etat] = (compte[n.etat] || 0) + 1;
      log(`Graine ${g} (${((Date.now() - t0) / 1000).toFixed(0)} s) : ${toits.length} bâtiments, ${toits.reduce((s, T) => s + T.niveaux.length, 0)} niveaux — ${Object.entries(compte).map(([k, v]) => `${v} ${k}`).join(', ')}.`);
      const mal = [];
      for (const T of toits) T.niveaux.forEach((n, i) => {
        const etage = i ? `étage ${i} (+${(n.plancher - T.niveaux[0].plancher).toFixed(1)} m)` : 'rez-de-chaussée';
        if (n.etat === 'clos' || (n.etat === 'plein' && !T.plat)) mal.push(`${T.nom} — ${etage} : ${n.etat} (${Math.round(T.R.x)}, ${Math.round(T.R.z)})`);
      });
      verif(!mal.length, `graine ${g} : on entre partout (${mal.length} niveau(x) sans accès)`);
      for (const m of mal) log('       ' + m);
      if (process.env.BATIMENTS_DETAIL) for (const T of toits) log(`       ${T.nom} : ${T.niveaux.map((n) => n.etat + (n.par ? ' ' + n.par : '')).join(' / ')}${T.plat ? ' (dessus plat)' : ''}`);
      const bas = toits.filter((T) => T.niveaux[0].etat === 'bas');
      if (bas.length) log(`       (abris bas, non comptés : ${bas.map((T) => T.nom).join(' ; ')})`);
      if (g === 1234) {
        verif(empreinte(w, [98896, 1308, 516]) === EMPREINTE_1234, `les objets d'avant la grande mise à jour ne bougent pas (${empreinte(w, [98896, 1308, 516])})`);
        verif(empreinte(w, N_C3) === EMPREINTE_C3, `ni ceux de la huitième vague (${empreinte(w, N_C3)}) ; la vallée entière : ${empreinte(w)}`);
      }
    }
    return { echecs };
  },
};

if (require.main === module) {
  const { charger } = require('./vm.js');
  module.exports.verifier(charger(), (...a) => console.log(...a)).then((r) => { console.log(r.echecs ? `${r.echecs} échec(s)` : 'ok'); process.exit(r.echecs ? 1 : 0); });
}
