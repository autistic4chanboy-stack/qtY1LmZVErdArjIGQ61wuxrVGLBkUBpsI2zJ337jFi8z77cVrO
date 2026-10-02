// ============================================================================
//  LA PIERRE RONDE (agent G, douzième vague) — le seul passage vers la cité
//  - Génération (après tout le reste, tirage propre) : UNE pierre ronde dans
//    toute la vallée, loin des chemins, des villages et des lieux-dits, sur une
//    hauteur où l'on peut monter à pied (on vérifie qu'un chemin praticable y
//    mène depuis la ferme). Un papier sous un caillou, à côté.
//  - Dans la vallée : la pierre luit doucement (plus fort la nuit), chante quand
//    on s'approche ; trois habitants en parlent, de loin, sans dire où.
//  - Un seul voyage : on passe la main dans la lumière (mondes.entrer
//    ('vaisseau')) ; on revient par le seuil de la cité, et les deux s'éteignent
//    pour toujours (11-zzzzG-vaisseau.js : vgRevenir).
//  État : farm.s.vaisseau (etat : 0 jamais allé, 1 là-haut, 2 revenu).
//  Essais : vgPierre.aller() (téléporte devant la pierre), vgPierre.entrer().
// ============================================================================
Object.assign(LIEU_NAMES, VG_LIEUX);

// ---------------------------------------------------------------- l'état sauvegardé
const VG = {
  S() {
    const s = farm.s;
    if (!s) return { etat: 0, pris: {}, lus: {}, dits: {}, m: {}, corps: {} };
    const V = s.vaisseau || (s.vaisseau = { etat: 0 });
    for (const k of ['pris', 'lus', 'dits', 'm', 'corps']) if (!V[k] || typeof V[k] !== 'object') V[k] = {};
    if (!V.etat) V.etat = 0;
    return V;
  },
};
function vgPierreEtat() { const s = typeof farm !== 'undefined' && farm.s; return (s && s.vaisseau && s.vaisseau.etat) || 0; }

// ---------------------------------------------------------------- les sons de la cité et de la pierre (doux, rares)
const VGSON = {
  ok() { return !!(sound.ok && sound.ctx); },
  // placer un son (position) : fn() joue ses notes, tout vient de là
  la(pos, fn) { if (!this.ok()) return; try { if (pos && sound.ici) sound.ici(pos, fn); else fn(); } catch (e) { console.error(e); } },
  // carillon de verre (la pierre, le seuil) : trois partiels inharmoniques
  verre(pos, f, k) {
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.sfx;
      for (const [m, a] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) sound.tone(t, 'sine', f * m, f * m * 0.998, 2.6 / Math.sqrt(m), 0.011 * (k || 1) * a, o, 0.01);
    });
  },
  // la pierre chante : une petite figure de trois notes
  chant(pos, k) { const B = [523.25, 659.25, 783.99, 987.77, 1174.66]; const a = B[(Math.random() * 3) | 0]; this.verre(pos, a, k); setTimeout(() => this.verre(pos, a * 1.335, k * 0.8), 520); setTimeout(() => this.verre(pos, a * 1.498, k * 0.7), 1150); },
  // un souffle (porte, sas) : bruit filtré qui descend
  souffle(pos, k, dur) { this.la(pos, () => { const t = sound.at(0.01); sound.noiseHit(t, dur || 0.7, 'bandpass', 2200, 1.2, 0.035 * (k || 1), sound.sfx, 500, 0.05); }); },
  // déclic (bouton, levier)
  clic(pos, k) { this.la(pos, () => { const t = sound.at(0.01); sound.tone(t, 'square', 1800, 1500, 0.03, 0.018 * (k || 1), sound.sfx); sound.noiseHit(t, 0.03, 'highpass', 3000, 1, 0.02 * (k || 1), sound.sfx); }); },
  // une machine qui démarre (montée) ou s'arrête (descente)
  monte(pos, k, f0) { this.la(pos, () => { const t = sound.at(0.02), f = f0 || 55; sound.tone(t, 'sawtooth', f, f * 2, 2.2, 0.03 * (k || 1), sound.sfx, 0.3); sound.tone(t + 0.4, 'sine', f * 4, f * 8, 1.8, 0.012 * (k || 1), sound.sfx, 0.4); }); },
  descend(pos, k, f0) { this.la(pos, () => { const t = sound.at(0.02), f = f0 || 110; sound.tone(t, 'sawtooth', f, f / 2.5, 2.4, 0.03 * (k || 1), sound.sfx, 0.05); sound.tone(t, 'sine', f * 6, f * 1.5, 1.6, 0.01 * (k || 1), sound.sfx); }); },
  // un coup sourd, métallique (ascenseur qui arrive, porte qui bute)
  coup(pos, k) { this.la(pos, () => { const t = sound.at(0.01); sound.tone(t, 'sine', 70, 48, 0.5, 0.06 * (k || 1), sound.sfx); sound.noiseHit(t, 0.25, 'bandpass', 600, 2, 0.03 * (k || 1), sound.sfx, 300); for (const f of [431, 977, 1544]) sound.tone(t, 'sine', f, f * 0.99, 1.1, 0.006 * (k || 1), sound.sfx); }); },
  // grésillement (hologramme)
  gresille(pos, k) { this.la(pos, () => { const t = sound.at(0.01); for (let i = 0; i < 5; i++) sound.noiseHit(t + Math.random() * 0.5, 0.02 + Math.random() * 0.04, 'bandpass', 3000 + Math.random() * 3000, 3, 0.012 * (k || 1), sound.sfx); }); },
  // bruine (la serre : l'eau qu'on pulvérise)
  bruine(pos, k) { this.la(pos, () => { const t = sound.at(0.01); sound.noiseHit(t, 2.2, 'highpass', 4200, 0.8, 0.02 * (k || 1), sound.sfx, 3000, 0.4); }); },
  // le petit carillon qui précède la voix de la Veilleuse
  voix() { if (!this.ok()) return; const t = sound.at(0.01), o = sound.voix || sound.sfx; sound.tone(t, 'sine', 1318.5, 1318.5, 1.2, 0.008, o, 0.02); sound.tone(t + 0.16, 'sine', 1975.5, 1975.5, 1.4, 0.006, o, 0.02); },
  // la pierre qui meurt : un accord qui descend et se tait, un craquement de pierre
  extinction(pos) {
    this.la(pos, () => {
      const t = sound.at(0.02), o = sound.sfx;
      for (const [f, a] of [[523.25, 1], [659.25, 0.8], [783.99, 0.7], [1046.5, 0.5]]) sound.tone(t, 'sine', f, f * 0.5, 4.5, 0.014 * a, o, 0.02);
      sound.noiseHit(t + 2.2, 0.35, 'lowpass', 900, 1, 0.08, o, 200);
      sound.tone(t + 2.2, 'sine', 90, 40, 0.6, 0.05, o);
    });
  },
};

// ---------------------------------------------------------------- génération : la pierre ronde, à un seul endroit
function vgGenerer(w, seed) {
  if (!w || !w.designed || !w.nav || !w.lm) return;
  const rnd = mulberry32((((seed | 0) ^ 0x7A11C1E7) >>> 0));
  const WL = w.waterLevel, C = 8, n = Math.floor(w.size / C);
  const H = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) H[j * n + i] = w.heightAt((i + 0.5) * C, (j + 0.5) * C);
  // où l'on peut aller à pied : parcours depuis la ferme (pentes douces, pas d'eau)
  const F = w.lm.ferme || w.lm.place || { x: w.spawn.x, z: w.spawn.z };
  const T = w.townInfo || w.lm.place || F;
  const acc = new Uint8Array(n * n), Q = new Int32Array(n * n);
  const i0 = clamp(Math.floor(F.x / C), 0, n - 1), j0 = clamp(Math.floor(F.z / C), 0, n - 1);
  let qh = 0, qt = 0;
  acc[j0 * n + i0] = 1; Q[qt++] = j0 * n + i0;
  while (qh < qt) {
    const k = Q[qh++], i = k % n, j = (k / n) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ii = i + di, jj = j + dj;
      if (ii < 3 || jj < 3 || ii >= n - 3 || jj >= n - 3) continue;
      const k2 = jj * n + ii;
      if (acc[k2] || H[k2] < WL + 0.6) continue;
      if (Math.abs(H[k2] - H[k]) > C * 0.8) continue;
      acc[k2] = 1; Q[qt++] = k2;
    }
  }
  const nav = w.nav.nodes, lms = Object.values(w.lm).filter((L) => !L.under), blds = Object.values(w.bld || {}).filter((b) => !b.under);
  const inters = w.inter || [];
  const essai = (x, z, R) => {
    const h = w.heightAt(x, z);
    if (h < WL + R.haut || !w.inside(x, z, 80)) return null;
    let mn = 1e9, mx = -1e9;
    for (let a = 0; a < 12; a++) for (const r of [1.5, 3.5, 5]) { const hh = w.heightAt(x + Math.cos(a * 0.5236) * r, z + Math.sin(a * 0.5236) * r); mn = Math.min(mn, hh); mx = Math.max(mx, hh); }
    if (mx - mn > R.plat) return null;
    if (Math.hypot(x - T.x, z - T.z) < R.ville || Math.hypot(x - F.x, z - F.z) < R.ferme) return null;
    let dn = 1e9;
    for (const q of nav) { const d = Math.abs(q.x - x) + Math.abs(q.z - z); if (d < dn * 1.42) dn = Math.min(dn, Math.hypot(q.x - x, q.z - z)); }
    if (dn < R.chemin) return null;
    for (const L of lms) if (Math.hypot(L.x - x, L.z - z) < R.lieu) return null;
    for (const b of blds) if (Math.hypot(b.x - x, b.z - z) < R.lieu + 30) return null;
    for (const it of inters) if (Math.abs(it.x - x) < 50 && Math.abs(it.z - z) < 50) return null;
    for (const P of w.noBuild || []) if (Math.hypot(P.x - x, P.z - z) < P.r + 25) return null;
    for (const q of w.props) if (Math.abs(q.x - x) < 14 && Math.abs(q.z - z) < 14) return null;
    let gene = false;
    w.query(x, z, 5, (o) => { if (!gene && o && !o.gone && OBJ_TYPES[o.t] && !OBJ_TYPES[o.t].animal && Math.hypot(o.x - x, o.z - z) < 3.6 && (o.h || 0) > 0.9) gene = true; }, (b) => { if (!gene && !b.under && Math.hypot(b.x - x, b.z - z) < 6 + Math.max(b.sx, b.sz) / 2) gene = true; });
    if (gene) return null;
    return { x, z, h, dn, score: Math.min(dn, 320) / 320 + Math.min(80, h - WL) / 80 * 0.7 + rnd() * 0.45 };
  };
  const regles = [
    { haut: 32, plat: 1.4, ville: 520, ferme: 480, chemin: 150, lieu: 110 },
    { haut: 22, plat: 1.7, ville: 430, ferme: 380, chemin: 115, lieu: 90 },
    { haut: 12, plat: 2.0, ville: 330, ferme: 300, chemin: 80, lieu: 70 },
    { haut: 4, plat: 2.4, ville: 240, ferme: 200, chemin: 50, lieu: 50 },
  ];
  const cellules = [];
  for (let k = 0; k < n * n; k++) if (acc[k]) cellules.push(k);
  let best = null, nCand = 0, regle = -1;
  for (const R of regles) {
    const L = [];
    for (let e = 0; e < 2600 && cellules.length; e++) {
      const k = cellules[(rnd() * cellules.length) | 0], x = (k % n + 0.2 + rnd() * 0.6) * C, z = (((k / n) | 0) + 0.2 + rnd() * 0.6) * C;
      const c = essai(x, z, R);
      if (c) L.push(c);
    }
    if (L.length) { L.sort((a, b) => b.score - a.score); best = L[Math.min(L.length - 1, (rnd() * Math.min(4, L.length)) | 0)]; nCand = L.length; regle = regles.indexOf(R); break; }
  }
  if (!best) return;
  const B = new Builder(w, rnd, new Uint8Array(1));
  // l'anneau regarde vers la vallée (vers la ville)
  const r = Math.atan2(T.x - best.x, T.z - best.z) + (rnd() - 0.5) * 0.6;
  const y = w.heightAt(best.x, best.z);
  const f = { x: best.x, y, z: best.z, r };
  B.prop('vg_pierre', best.x, y, best.z, r);
  const [ix, iz] = B.toWorld(f, 0, 1.05);
  B.inter('vg_pierre', 'vg_pierre', ix, y + 1.55, iz, 'Toucher la pierre ronde', {});
  // le papier d'Anselme, sous un caillou plat, au pied de la pierre
  const [px, pz] = B.toWorld(f, 2.3, 1.4);
  const py = w.heightAt(px, pz);
  B.prop('vg_caillou', px, py, pz, r + 0.7);
  B.inter('vg_papier', 'vg_papier_anselme', px, py + 0.35, pz, 'Soulever le caillou', { p: 'anselme' });
  B.landmark('vg_pierre', best.x, best.z, 10, { secret: true });
  (w.noBuild || (w.noBuild = [])).push({ x: best.x, z: best.z, r: 9, why: 'la pierre ronde' });
  // de quel côté de la vallée, vu de la ville (pour ceux qui en parlent sans dire où)
  const a = Math.atan2(best.x - T.x, -(best.z - T.z)), o = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
  const COTES = ['vers le nord', 'entre le nord et le levant', 'du côté du levant', 'entre le levant et le midi', 'du côté du midi', 'entre le midi et le couchant', 'du côté du couchant', 'entre le couchant et le nord'];
  const cote = COTES[o];
  LIEU_NAMES.vg_versant = (best.h - WL > 30 ? 'là-haut, ' : 'loin, ') + cote;
  w.vg = { x: best.x, y, z: best.z, r, ix, iz, cote, dn: Math.round(best.dn), haut: Math.round(best.h - WL), nCand, regle };
  w.grid = null;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { vgGenerer(w, seed); } catch (e) { console.error('G : la pierre ronde', e); } }
    return w;
  };
}

// ---------------------------------------------------------------- ce qu'on en dit (de loin, sans dire où)
{
  const ajouter = (id, L) => { const d = NPC_DATA.find((x) => x.id === id); if (d && d.lines && Array.isArray(d.lines.rumeurs)) for (const t of L) d.lines.rumeurs.push(t); };
  ajouter('fillette', VG_RUMEURS.fillette);
  ajouter('chasseur', VG_RUMEURS.chasseur);
  ajouter('eleveuse', VG_RUMEURS.eleveuse);
}

// après le voyage, la fillette a rêvé (une fois)
{
  const _cl = talk.chatLine.bind(talk);
  talk.chatLine = function () {
    const n = this.n, V = farm.s && farm.s.vaisseau;
    if (n && n.d && n.d.id === 'fillette' && V && V.etat === 2 && !V.fillette) { V.fillette = 1; return VG_TEXTES.fillette; }
    return _cl();
  };
}

// ---------------------------------------------------------------- dans la vallée : la pierre
const vgPierre = {
  // la pierre, telle que la génération l'a posée
  P() { const w = game.world; return w && w.vg; },
  toucher() {
    const V = VG.S(), P = this.P();
    if (!P) return;
    if (V.etat >= 2) {
      const opts = [];
      if (!V.eclat) opts.push({ label: 'Ramasser l’éclat tombé au pied de la pierre', fn: () => { V.eclat = 1; farm.give('vg_pierre_seuil', 1); play.flyer('vg_pierre_seuil', [P.x, P.y + 0.3, P.z], 1); sound.pop(); ui.close(); } });
      opts.push({ label: 'Lire les traits gravés', fn: () => langues.lireInscription('a_vg_seuil') });
      opts.push({ label: 'S’en aller', fn: () => ui.close() });
      ui.choice('La pierre ronde', VG_TEXTES.pierreMorte, opts);
      return;
    }
    if (V.etat === 1) return;
    const nuit = game.sky && game.sky.night > 0.5;
    VGSON.chant([P.x, P.y + 1.8, P.z], 1.2);
    ui.choice('La pierre ronde', nuit ? VG_TEXTES.pierreNuit : VG_TEXTES.pierreJour, [
      { label: 'Passer la main dans la lumière', fn: () => { ui.close(); this.entrer(); } },
      { label: 'Lire les traits gravés', fn: () => langues.lireInscription('a_vg_seuil') },
      { label: 'Reculer', fn: () => ui.close() },
    ]);
  },
  papier(it) {
    const D = VG_PAPIERS[(it.data && it.data.p) || 'anselme'];
    if (!D) return;
    sound.page && sound.page();
    VG.S().lus.anselme = 1;
    ui.read(D[0], D[1], D[2]);
  },
  // le passage (aller)
  async entrer() {
    const V = VG.S(), P = this.P(), p = game.player;
    if (V.etat !== 0 || this.enCours || mondes.cur) return;
    this.enCours = true;
    try {
      game.sleeping = true;
      ui.close(true);
      VGSON.verre([P.x, P.y + 1.8, P.z], 523.25, 1.6); setTimeout(() => VGSON.verre(null, 783.99, 1.2), 380); setTimeout(() => VGSON.verre(null, 1046.5, 1.0), 800);
      $('#fade').style.background = '#d8ecf8';
      await ui.fade(true, '', 1600);
      await new Promise((r) => setTimeout(r, 900));
      // on se tient devant la pierre (c'est là que le seuil ramènera)
      const s = farm.s;
      p.pos = [P.ix, w0().groundAt(P.ix, P.iz, P.y + 1, 0.6), P.iz]; p.yaw = Math.atan2(-(P.x - P.ix), -(P.z - P.iz)); p.pitch = 0; p.vel = [0, 0, 0];
      V.etat = 1; V.entre = s.day; V.depuis = s.hours;
      mondes.entrer('vaisseau', {});
      $('#fade').style.background = '#000';
      await new Promise((r) => setTimeout(r, 700));
      $('#fade').style.background = '';
      await ui.fade(false, '', 1800);
      game.sleeping = false;
      if (game.mode === 'play' && game.lock) game.lock();
      if (typeof vgCite !== 'undefined') vgCite.arrivee();
      farm.save();
    } catch (e) { console.error(e); game.sleeping = false; $('#fade').style.background = ''; ui.fade(false, '', 300); }
    this.enCours = false;
  },
  // essais : devant la pierre
  aller() { const P = this.P(); if (!P) return false; const p = game.player; p.pos = [P.ix + Math.sin(P.r) * 2, game.world.heightAt(P.ix, P.iz) + 0.1, P.iz + Math.cos(P.r) * 2]; p.yaw = P.r; p.pitch = 0.1; p.vel = [0, 0, 0]; if (game.renderer) game.renderer.uploadCover(p.pos[0], p.pos[2]); return true; },
  // chaque image (dans la vallée) : la pierre chante quand on s'approche (plus souvent la nuit, et rarement de jour)
  update(dt) {
    const P = this.P();
    if (!P || mondes.cur || vgPierreEtat() >= 2 || game.sleeping) return;
    const p = game.player, d = Math.hypot(p.pos[0] - P.x, p.pos[2] - P.z);
    if (d > 45) { this.chantT = 3; return; }
    this.chantT = (this.chantT || 3) - dt;
    if (this.chantT > 0) return;
    const nuit = game.sky ? game.sky.night : 0;
    this.chantT = (nuit > 0.5 ? 9 : 22) + Math.random() * 10;
    if (nuit > 0.5 || Math.random() < 0.5) VGSON.chant([P.x, P.y + 1.8, P.z], clamp(1.4 - d / 40, 0.25, 1.2));
  },
  lumieres(eye) {
    const P = this.P();
    if (!P || mondes.cur || vgPierreEtat() >= 2) return [];
    const d = Math.hypot(P.x - eye[0], P.z - eye[2]);
    if (d > 90) return [];
    const nuit = game.sky ? game.sky.night : 0, k = 0.35 + nuit * 0.75, b = 1 + Math.sin(game.time * 0.9) * 0.08;
    return [{ x: P.x + Math.sin(P.r) * 0.4, y: P.y + 1.85, z: P.z + Math.cos(P.r) * 0.4, r: 9 + nuit * 5, c: [0.32 * k * b, 0.6 * k * b, 1.15 * k * b], d }];
  },
};
const w0 = () => game.world;
DYN_PROPS.add('vg_pierre');
HOOKS.inter.vg_pierre = () => vgPierre.toucher();
HOOKS.inter.vg_papier = (it) => vgPierre.papier(it);
HOOKS.update.push((dt) => { if (farm.s && game.kind === 'farm') vgPierre.update(dt); });
HOOKS.lights.push((eye) => (farm.s && game.kind === 'farm' ? vgPierre.lumieres(eye) : []));
HOOKS.load.push(() => { VG.S(); vgPierre.enCours = false; });
