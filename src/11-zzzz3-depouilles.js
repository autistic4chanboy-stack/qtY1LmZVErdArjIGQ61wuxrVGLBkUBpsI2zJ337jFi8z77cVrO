// ============================================================================
//  DÉPOUILLES (agent W) : les morts restent au sol.
//  - Un habitant mort (tué par le fermier, par le tueur, par une bête, emporté
//    par la fièvre…), le chien de la ferme (tué, mort de faim), un chasseur de
//    primes abattu, et le fermier d'une vie précédente restent couchés là où
//    ils sont tombés : sauvegardés, rechargés, jusqu'à ce qu'on les enterre.
//  - Ils changent avec les jours, sobrement : pâles le jour même, couleur de
//    cire les deux jours suivants, puis des restes affaissés, puis des os dans
//    des vêtements vides. Des mouches et des corbeaux, le jour.
//  - E sur un corps : fouiller ses poches (le menu de butin de l'agent U1,
//    butin.ouvrir, s'il est là ; sinon tout est donné d'un coup) ; avec une
//    pelle (en main, ou dans la sacoche quand les poches sont vides), l'enterrer
//    là : un tertre et une croix de deux bâtons liés (sur la pierre ou sous
//    terre, un tas de pierres ; dans une maison, on le porte dehors). Un clic
//    avec la pelle sur le corps l'enterre aussi. Le chien s'enterre à mains nues.
//  - Fouiller un mort sous les yeux d'un habitant : profanation (societe.crime).
//  - Les habitants qui voient un corps s'arrêtent, se signent, reculent ; la
//    nouvelle court (le meurtre « trouvé », cr.found). Dans la vallée, on ne
//    relève pas les morts : leur nom est gravé au cimetière, sur une tombe vide
//    (la tombe et les scellés de 11-npc.js / 11-zzz50 restent).
//  - Le fermier mort attend le fermier suivant, là où il est tombé, avec ce
//    qu'il avait en poche (localStorage 'prairie.depouilles', d'une partie à
//    l'autre) ; enterré, son tertre reste pour ceux qui viennent après.
//  État : farm.s.depouilles = { v, n, corps: [{ id, t: 'npc'|'chien'|'chasseur'|
//         'fermier', x, y, z, r, pose, j (jour de la mort), cause, qui, nom, poches,
//         … }], vus: { 'pnj:id': jour }, importe }
//  API : depouilles (liste(), stade(rec), ajouter(o), fouiller(rec), enterrer(rec),
//        pres(x, z, r), D() (les fermiers morts), noterFermier(cause)…)
// ============================================================================
const DEP_KEY = 'prairie.depouilles';
const DEP_OS = [0.84, 0.8, 0.7]; // des os, un peu jaunis
// couché : la tête vers +z, le visage vers le haut ; puis on le roule autour de son axe
const DEP_L = new Float32Array([-1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0]);
const DEP_ROLL = { dos: 0, lit: 0, ventre: Math.PI, cote: Math.PI / 2 };
// les pièces qui touchent le sol (les membres peuvent s'y enfoncer un peu)
const DEP_CORE = new Set(['torso', 'pelvis', 'head', 'legL', 'legR', 'rib0', 'rib1', 'rib2', 'rib3', 'torsoRag']);
const DEP_CORE_CHIEN = new Set(['body', 'neck', 'head']);
// les habits du fermier (ceux des cinématiques)
const DEP_FERMIER = { skin: '#dcb08a', hair: '#4a3020', top: '#6a5a48', bottom: '#3a3830', hat: 'paille', beard: 'courte' };
const DEP_FERMIERE = { skin: '#e2b894', hair: '#5a3a22', hairStyle: 'long', top: '#7a6a58', bottom: '#4a3c30', dress: true, bust: 0.5, hips: 0.5 };
// ce qu'ont en poche ceux qui ne sont pas dans VOL_POCHES (11-zzz90) : b pièces, m métier, p personnel
const DEP_POCHES = {
  _: { b: [1, 9], m: ['bougie', 'pain'], p: ['mouchoir_brode', 'couteau_poche'] },
  naturiste_a: { nu: true }, naturiste_b: { nu: true }, naturiste_c: { nu: true },
};
const DEP_CHASSEUR = { b: [4, 18], m: ['cartouche', 'tabac', 'pain', 'corde'], p: ['couteau_poche', 'tabatiere'] };
const DEP_CRIS = [
  'Vous fouillez un mort ?! Au garde !',
  'Sacrilège ! On ne détrousse pas les morts !',
  'Pilleur de cadavres ! Au garde ! AU GARDE !',
  'Laissez les morts en paix, malheureux !',
];
const DEP_PEUR = [
  'Mon Dieu… Il y a quelqu’un par terre, là !',
  'Seigneur… Ne regardez pas. Ne regardez pas.',
  'N’y touchez pas ! Ici, on ne touche pas aux morts.',
  'C’est un mort… Mon Dieu, c’est un mort.',
];
const DEP_MERCI = [
  'Merci… Il fallait bien que quelqu’un le fasse.',
  'Que Dieu vous le rende. Personne n’osait.',
];
const DEP_HOSTILE = /rival|méfian|créanc|débit/;

function depMat(rx, ry, rz, tx0, ty0, tz0) { return m34TR(new Float32Array(12), tx0 || 0, ty0 || 0, tz0 || 0, rx || 0, ry || 0, rz || 0); }
function depMul(A, B) { return m34Mul(new Float32Array(12), A, B); }
function depMix(hex, to, k) { const a = hexToRgb(hex), b = hexToRgb(to); return rgbToHex([0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k))); }
function depMixF(c, to, k) { return [0, 1, 2].map((i) => c[i] + (to[i] - c[i]) * k); }
const depR2 = (v) => Math.round(v * 100) / 100;
const depElide = (nom) => /^[aeiouyàâäéèêëîïôöûüh]/i.test(nom || '');

const depouilles = {
  cache: new Map(), t: 0, dit: -99, buf: null,

  // ------------------------------------------------------------------ état
  S() {
    const s = farm.s;
    if (!s) return null;
    const S = s.depouilles || (s.depouilles = {});
    if (!S.corps) Object.assign(S, { v: 1, n: 0, corps: [], vus: {} });
    if (!S.vus) S.vus = {};
    return S;
  },
  liste() { const S = this.S(); return S ? S.corps : []; },
  // les corps à moins de r mètres d'un point
  pres(x, z, r) { return this.liste().filter((c) => Math.hypot(c.x - x, c.z - z) < (r || 3)); },
  // 0 : le jour même ; 1 : cire (1-2 jours) ; 2 : restes (3-6) ; 3 : os
  stade(rec) { const a = farm.s.day - rec.j; return a <= 0 ? 0 : a <= 2 ? 1 : a <= 6 ? 2 : 3; },
  npc(rec) { return rec.t === 'npc' ? npcs.byId[rec.qui] || null : null; },
  fem(rec) { if (rec.t === 'npc') { const d = NPC_BY_ID[rec.qui]; return !!(d && d.gender === 'f'); } return !!rec.fem; },
  enfant(rec) { const d = rec.t === 'npc' && NPC_BY_ID[rec.qui]; return !!(d && (d.age || 30) < 14); },
  nu(rec) { const n = this.npc(rec); return !!(n && n.d.look && n.d.look.nude); },
  // le nom que le fermier connaît (ou rien)
  nom(rec) {
    if (rec.t === 'npc') { const n = this.npc(rec); return n && n.st.met ? n.name : null; }
    if (rec.t === 'chien') return rec.nom || null;
    if (rec.t === 'fermier') return rec.nomConnu ? rec.nom || null : null;
    return null;
  },
  nomComplet(rec) { const n = this.npc(rec); return n ? (n.st.met ? n.name + ' ' + n.d.surname : null) : this.nom(rec); },
  cachesMonde() { return strange.inEnvers() || (typeof mondes !== 'undefined' && mondes.cur === 'bonbons'); },

  // ------------------------------------------------------------------ une dépouille de plus
  // o : { t, x, y, z, r, pose, cause, qui, nom, v, fem, run, j, poches, masque, nomConnu, id }
  ajouter(o) {
    const S = this.S(), s = farm.s, w = game.world;
    if (!S || !w || !isFinite(o.x) || !isFinite(o.z)) return null;
    const rec = { id: o.id || 'c' + (++S.n), t: o.t, j: o.j ?? s.day, cause: o.cause || null };
    for (const k of ['qui', 'nom', 'v', 'fem', 'run', 'poches', 'masque', 'nomConnu']) if (o[k] !== undefined && o[k] !== null) rec[k] = o[k];
    const H = hashString(rec.id + ':' + (rec.qui || rec.t) + ':' + (s.seed | 0)) >>> 0;
    rec.pose = o.pose || (rec.t === 'chien' ? 'cote' : ['dos', 'ventre', 'cote'][H % 3]);
    const lit = rec.pose === 'lit';
    let x = o.x, z = o.z, y = o.y, r = isFinite(o.r) ? o.r : (H % 628) / 100;
    if (!lit) {
      const h = w.heightAt(x, z), g = w.groundAt(x, z, (isFinite(y) ? y : h) + 0.6, 0.8);
      y = g > -1e8 ? g : isFinite(y) ? y : h;
      if (rec.t !== 'chien') r = this.cap(x, z, y, r, 0.85);
    }
    rec.x = depR2(x); rec.y = depR2(y); rec.z = depR2(z); rec.r = depR2(r);
    // sur la terre, dehors : il épouse la pente
    if (!lit && Math.abs(w.heightAt(x, z) - y) < 0.3 && !w.covered(x, y + 1.0, z)) {
      rec.sol = 1;
      const L = rec.t === 'chien' ? 0.4 : 0.85, sx = Math.sin(r), cz = Math.cos(r), lx = Math.cos(r), lz = -Math.sin(r);
      const hH = w.heightAt(x + sx * L, z + cz * L), hF = w.heightAt(x - sx * L, z - cz * L);
      const hR = w.heightAt(x + lx * 0.3, z + lz * 0.3), hL = w.heightAt(x - lx * 0.3, z - lz * 0.3);
      rec.pa = depR2(clamp(Math.atan2(hH - hF, 2 * L), -0.5, 0.5));
      rec.pl = depR2(clamp(Math.atan2(hR - hL, 0.6), -0.4, 0.4));
    }
    S.corps.push(rec);
    this.cache.delete(rec.id);
    return rec;
  },
  // comme pointFree, mais à la hauteur donnée (sous la montagne, le sol n'est pas celui de la surface)
  libre(x, z, y, r) {
    const w = game.world, h = w.heightAt(x, z);
    if (y > h - 1 && h < w.waterLevel + 0.15) return false;
    let hit = false;
    w.query(x, z, r + 0.6, null, (b) => {
      if (hit || b.y > y + 1.7 || b.y + b.sy < y + 0.5) return;
      const [lx, lz] = World.blockLocal(b, x, z);
      if (Math.abs(lx) < b.sx / 2 + r && Math.abs(lz) < b.sz / 2 + r) hit = true;
    });
    return !hit;
  },
  // un cap où la tête et les pieds ne sont ni dans un mur ni dans le vide
  cap(x, z, y, r0, L) {
    const w = game.world;
    const ok = (r) => {
      for (const k of [-1, 1]) {
        const px = x + Math.sin(r) * L * k, pz = z + Math.cos(r) * L * k;
        if (!this.libre(px, pz, y, 0.12)) return false;
        if (Math.abs(w.groundAt(px, pz, y + 0.5, 0.6) - y) > 0.45) return false;
      }
      return true;
    };
    for (const d of [0, 0.5, -0.5, 1.1, -1.1, 1.6, -1.6, 2.3, -2.3, Math.PI]) if (ok(r0 + d)) return r0 + d;
    return r0;
  },
  // l'habitant est-il dans son lit ?
  auLit(n) {
    const B = game.world && game.world.bld[n.d.home];
    const b = B && B.spots && (B.spots[n.d.id === 'fillette' && B.spots.bed2 ? 'bed2' : 'bed']);
    return !!(b && Math.hypot(n.x - b.x, n.z - b.z) < 1.2 && Math.abs((n.y || 0) - b.y) < 0.6);
  },

  // ------------------------------------------------------------------ ceux qui meurent
  surMort(n, by, lit) {
    const S = this.S();
    if (!S || !game.world || !n || S.corps.some((c) => c.t === 'npc' && c.qui === n.id)) return null;
    // au lit : la tête sur l'oreiller (l'oreiller est du côté opposé au cap du lit)
    const rec = this.ajouter({ t: 'npc', qui: n.id, x: n.x, y: n.y, z: n.z, r: lit ? (n.heading || 0) + Math.PI : n.heading, pose: lit ? 'lit' : null, cause: by || null, masque: by === 'masque' ? 1 : undefined });
    if (rec && by === 'joueur') { rec.vu0 = 1; rec.vs = 0; rec.vj = farm.s.day; }
    return rec;
  },
  // le chien : son corps (l'entité « cadavre » du module du chien) devient une dépouille
  chienMort(e, cause, vu) {
    const s = farm.s, w = game.world, C = typeof chien !== 'undefined' ? chien.C() : null;
    if (!C || !w) return null;
    const M = C.mort || (C.mort = { day: s.day, cause: cause || 'tué', enterre: false, vu: !!vu });
    if (M.depouille) return null;
    let x, y, z, r, v = 0;
    if (e && !e.removed) { x = e.x; y = e.y; z = e.z; r = e.heading || 0; v = e.v || 0; }
    else { const p = game.player.pos; x = M.x ?? p[0]; z = M.z ?? p[2]; y = w.heightAt(x, z); r = Math.random() * TAU; }
    const rec = this.ajouter({ t: 'chien', nom: chien.nom(), x, y, z, r, v, cause: M.cause || cause || 'tué', j: M.day ?? s.day });
    if (!rec) return null;
    M.enterre = 'depouille'; M.depouille = rec.id; M.x = rec.x; M.z = rec.z;
    if (M.vu || vu) { rec.vu0 = 1; rec.vs = 0; rec.vj = s.day; }
    for (const q of entities.extra.slice()) if (q.kind === 'dog' && q.owner && (q.corpse || q.dead)) entities.remove(q);
    if (e && !e.removed && e.dead) entities.remove(e);
    return rec;
  },
  // anciennes parties, et morts du chien passées par un autre chemin
  migrerChien() {
    const s = farm.s, C = s && s.chien;
    if (!C || !C.mort || !s.dog || s.dog.alive || C.mort.depouille) return;
    if (C.mort.enterre === false || C.mort.enterre === 'non') this.chienMort(typeof chien !== 'undefined' ? chien.cadavre() : null, C.mort.cause, C.mort.vu);
  },
  chasseurMort(e) {
    const rec = this.ajouter({ t: 'chasseur', x: e.x, y: e.y, z: e.z, r: e.heading || 0, cause: 'joueur' });
    const L = societe.chasseurs, i = L.indexOf(e);
    if (i >= 0) L.splice(i, 1);
    if (rec) { rec.vu0 = 1; rec.vs = 0; rec.vj = farm.s.day; }
    return rec;
  },

  // ------------------------------------------------------------------ le fermier mort, pour celui qui vient après
  D() { const D = store.get(DEP_KEY, null); return D && Array.isArray(D.corps) ? D : { v: 1, corps: [] }; },
  noterFermier(cause) {
    const s = farm.s, p = game.player, w = game.world;
    if (!s || !w || !p) return;
    let pos = p.pos, yaw = p.yaw;
    // mort « à part » (cauchemar, Enfers) : le corps est resté dans la vallée
    if (typeof mondes !== 'undefined' && mondes.cur && MONDES[mondes.cur] && MONDES[mondes.cur].aPart) {
      const R = mondes.S().retour;
      if (!R || !R.pos) return;
      pos = R.pos; yaw = R.yaw || 0;
    }
    let x = pos[0], y = pos[1], z = pos[2], r = yaw + Math.PI, pose = null;
    if (![x, y, z].every(isFinite)) return;
    // noyé : le corps est rejeté sur la rive
    if (w.heightAt(x, z) < w.waterLevel - 0.3 && y < w.waterLevel + 0.5) { const b = this.rive(x, z); if (b) { x = b[0]; z = b[1]; y = w.heightAt(x, z); } }
    // tué dans son sommeil : dans le lit de la ferme
    const B = w.bld.ferme, bed = B && B.spots && B.spots.bed;
    if (bed && /sommeil/i.test(cause || '') && Math.hypot(bed.x - x, bed.z - z) < 6 && Math.abs(bed.y - y) < 2.5) { x = bed.x; z = bed.z; y = bed.y; pose = 'lit'; r = bed.r + Math.PI; }
    const D = this.D();
    D.corps = D.corps.filter((c) => c.run !== s.run);
    D.corps.push({ run: s.run, gen: s.gen || VALLEY_GEN, seed: s.seed, x: depR2(x), y: depR2(y), z: depR2(z), r: depR2(r), pose, fem: s.fem ? 1 : 0, nom: s.prenom || null, cause: cause || null, jour: s.day, poches: this.pochesFermier(), enterre: 0 });
    D.corps = D.corps.slice(-10);
    store.set(DEP_KEY, D);
  },
  rive(x, z) {
    const w = game.world;
    for (let k = 1; k <= 30; k++) for (let a = 0; a < 16; a++) {
      const g = a / 16 * TAU, px = x + Math.cos(g) * k * 1.5, pz = z + Math.sin(g) * k * 1.5;
      if (w.inside(px, pz, 5) && w.heightAt(px, pz) > w.waterLevel + 0.15) return [px, pz];
    }
    return null;
  },
  // ce qu'il avait sur lui : quelques pièces, quelques objets
  pochesFermier() {
    const s = farm.s, out = [];
    const m = Math.min(s.money | 0, 20 + Math.floor(Math.random() * 90));
    if (m > 0) out.push(['argent', m]);
    const ids = Object.keys(s.inv).filter((k) => { const it = ITEMS[k]; return it && s.inv[k] > 0 && !it.questItem && !it.unique && it.cat !== 'quete' && (it.price || 0) <= 200; });
    for (let i = ids.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [ids[i], ids[j]] = [ids[j], ids[i]]; }
    for (const k of ids.slice(0, 4)) out.push([k, Math.min(s.inv[k], ITEMS[k].tool ? 1 : 5)]);
    return out;
  },
  // nouvelle partie : les fermiers d'avant sont là où ils sont tombés (ou sous leur tertre)
  importer() {
    const s = farm.s, w = game.world, S = this.S();
    if (!S || S.importe) return;
    S.importe = 1;
    const G = s.gen || VALLEY_GEN;
    const ok = (E) => E.run < s.run && ((E.gen >= 3 && G >= 3) || (E.gen === G && E.seed === s.seed));
    for (const E of this.D().corps) {
      if (!ok(E)) continue;
      if (E.enterre) {
        if (!isFinite(E.tx) || !isFinite(E.tz)) continue;
        farm.addProp({ id: 'tertre', x: E.tx, y: isFinite(E.ty) ? E.ty : w.heightAt(E.tx, E.tz), z: E.tz, r: E.tr || 0, data: { t: 'fermier', nom: E.nomG || null, fem: E.fem ? 1 : 0, run: E.run, pierre: E.pierre ? 1 : 0 } });
        continue;
      }
      const age = 2 + Math.max(0, s.run - E.run - 1) * 12;
      this.ajouter({ id: 'f' + E.run, t: 'fermier', run: E.run, nom: E.nom || null, fem: E.fem ? 1 : 0, x: E.x, y: E.y, z: E.z, r: E.r, pose: E.pose || null, cause: E.cause, j: 1 - age, poches: (E.poches || []).map((q) => q.slice()), nomConnu: E.nomConnu ? 1 : undefined });
    }
  },
  // ce que l'on a pris sur lui, sa tombe : le suivant le saura
  syncFermier(rec, lieu) {
    if (!rec || rec.t !== 'fermier') return;
    const D = this.D(), E = D.corps.find((c) => c.run === rec.run);
    if (!E) return;
    E.poches = (rec.poches || []).map((q) => q.slice());
    if (rec.nomConnu) E.nomConnu = 1;
    if (lieu) { E.enterre = farm.s.run; E.tx = depR2(lieu.x); E.ty = depR2(lieu.y); E.tz = depR2(lieu.z); E.tr = depR2(lieu.r); E.pierre = lieu.mode === 'pierres' ? 1 : 0; E.nomG = rec.nomConnu ? rec.nom || null : null; }
    store.set(DEP_KEY, D);
  },

  // ------------------------------------------------------------------ l'allure, selon les jours
  lookDe(rec) {
    if (rec.t === 'npc') {
      const n = this.npc(rec);
      if (!n) return null;
      if (rec.masque && typeof KILLER_LOOK !== 'undefined') return Object.assign({}, KILLER_LOOK, { face: n.look.face, held: null });
      return Object.assign({}, n.look, { held: null });
    }
    if (rec.t === 'chasseur') return Object.assign({}, typeof SOC_CHASSEUR_LOOK !== 'undefined' ? SOC_CHASSEUR_LOOK : DEP_FERMIER, { held: null });
    if (rec.t === 'fermier') return Object.assign({}, rec.fem ? DEP_FERMIERE : DEP_FERMIER);
    return null;
  },
  lookStade(look, st) {
    const L = Object.assign({}, look, { held: null });
    const def = { top: '#6a5a48', bottom: '#4a3c30', shoe: '#2a2018', hair: '#4a3020' };
    const vet = (k, to, a) => { const c = look[k] || def[k]; if (c) L[k] = depMix(c, to, a); };
    const skin = look.skin || '#e0b896';
    if (st <= 0) L.skin = depMix(skin, '#d2ccc0', 0.32);
    else if (st === 1) { L.skin = depMix(skin, '#b3b4a2', 0.58); for (const k of ['top', 'bottom', 'apron', 'hatCol', 'belt']) vet(k, '#6e6a5e', 0.14); vet('hair', '#6a665c', 0.15); }
    else { L.skin = depMix(skin, '#5e5648', 0.74); for (const k of ['top', 'bottom', 'apron', 'hatCol', 'belt']) vet(k, '#3e3a32', 0.45); vet('hair', '#4a463e', 0.45); vet('shoe', '#2a2620', 0.3); }
    return L;
  },
  // le corps (avant les os) : pâli, puis affaissé ; les yeux fermés ; la robe et les pans du manteau retombent à plat
  humain(look, st) {
    const L = this.lookStade(look, st);
    let r = humanRig(L);
    for (const q of r.parts) {
      if (!q.s) continue;
      if (q.name === 'skirt') q.s = [q.s[0] * 0.9, q.s[1], q.s[2] * 0.42];
      else if (q.name === 'coatTail') q.s = [q.s[0] * 0.86, q.s[1] * 0.92, q.s[2] * 0.36];
      if (st < 2) continue;
      if (q.name === 'torso' || q.name === 'bustL') q.s = [q.s[0] * 0.94, q.s[1], q.s[2] * 0.78];
      else if (q.name === 'pelvis') q.s = [q.s[0] * 0.92, q.s[1], q.s[2] * 0.85];
      else if (/^(leg|shin|arm|fore)[LR]$/.test(q.name)) q.s = [q.s[0] * 0.86, q.s[1], q.s[2] * 0.86];
    }
    const F = r.tr && r.tr.face;
    if (F && r.has('head') && !r.has('paupiere')) r = rigPlus(r, [{ name: 'paupiere', parent: 'head', p: [0, F.eyeY, F.zf + 0.004], s: [F.lidW, F.rowH * 2.6, 0.006], col: v3.scale(rgbf(L.skin), 0.9), tex: TL.skin }]);
    return r;
  },
  // des os dans des vêtements vides (mêmes articulations que le corps : les poses s'y appliquent)
  squelette(look) {
    const hr = humanRig(Object.assign({}, look, { held: null }));
    const T = hr.tr || {};
    const { P, add } = rigParts();
    const osT = tx(TL.bone, TL.bone), clothT = tx(TL.cloth, TL.cloth), nu = !!look.nude;
    const rag = (k, def) => rgbf(depMix(look[k] || def, '#34302a', 0.62));
    const topR = rag('top', '#6a5a48'), botR = rag('bottom', '#4a3c30');
    const keep = new Set();
    for (const q of hr.parts) {
      const n = q.name, par = q.parent || null;
      if (par && !keep.has(par)) continue; // enfant d'une pièce ôtée (cheveux, capuche…)
      const p = q.p.slice(), s = q.s;
      switch (n) {
        case 'hips': add(n, par, p, null); break;
        case 'pelvis': add(n, par, p, [s[0] * 0.72, 0.1, s[2] * 0.42], [0, 0, 0], DEP_OS, osT); break;
        case 'legL': case 'legR': {
          const L = s[1] - 0.04;
          add(n, par, p, [0.052, L, 0.052], [0, -L / 2, 0], DEP_OS, osT);
          if (!nu) add(n + 'Rag', n, [0, 0, 0], [s[0] * 0.95, L * 0.92, 0.02], [0, -L / 2, -s[2] * 0.32], botR, clothT);
          break;
        }
        case 'shinL': case 'shinR': { const L = s[1] - 0.03; add(n, par, p, [0.045, L, 0.045], [0, -L / 2, 0], DEP_OS, osT); break; }
        case 'shoeL': case 'shoeR':
          if (nu) add(n, par, p, [0.06, 0.04, 0.16], [0, 0.02, 0.02], DEP_OS, osT);
          else add(n, par, p, s.slice(), q.o.slice(), v3.scale(q.col, 0.62), q.tex, q.shp ? { shp: q.shp } : null);
          break;
        case 'torso': {
          const tw = s[0], tH = s[1], td = s[2];
          add(n, par, p, [0.05, tH * 0.95, 0.05], [0, tH * 0.5, -td * 0.28], DEP_OS, osT);
          for (let i = 0; i < 4; i++) add('rib' + i, 'torso', [0, tH * (0.3 + i * 0.15), -td * 0.05], [tw * (0.62 + i * 0.07), 0.024, td * 0.62], [0, 0, 0], DEP_OS, osT);
          if (!nu) add('torsoRag', 'torso', [0, 0, 0], [tw * 0.96, tH * 0.8, 0.022], [0, tH * 0.42, -td * 0.46], topR, clothT);
          break;
        }
        case 'neck': add(n, par, p, [0.04, 0.12, 0.04], [0, 0.05, -0.01], DEP_OS, osT); break;
        case 'head': {
          add(n, par, p, [s[0] * 0.8, s[1] * 0.78, s[2] * 0.86], [q.o[0], q.o[1] * 0.96, q.o[2] - 0.006], DEP_OS, osT);
          const F = T.face;
          if (F) {
            const zf = F.zf * 0.86 + 0.002, sombre = [0.09, 0.08, 0.07];
            for (const sx of [-1, 1]) add(sx < 0 ? 'orbiteL' : 'orbiteR', 'head', [sx * F.lidW * 0.26, F.eyeY, zf], [F.lidW * 0.3, F.rowH * 2.6, 0.012], [0, 0, 0], sombre, TL.plain);
            add('narine', 'head', [0, F.eyeY - F.rowH * 2.6, zf], [F.lidW * 0.14, F.rowH * 1.8, 0.012], [0, 0, 0], sombre, TL.plain);
            add('dents', 'head', [0, F.mouthY, F.zf * 0.84], [F.mouthW * 1.1, F.rowH * 1.4, 0.012], [0, 0, 0], v3.scale(DEP_OS, 0.92), TL.plain);
          }
          break;
        }
        case 'armL': case 'armR': {
          const L = s[1] - 0.05;
          add(n, par, p, [0.042, L, 0.042], [0, -L / 2 + 0.01, 0], DEP_OS, osT);
          if (!nu) add(n + 'Rag', n, [0, 0, 0], [s[0] * 0.9, L * 0.8, 0.018], [0, -L / 2, -s[2] * 0.3], topR, clothT);
          break;
        }
        case 'foreL': case 'foreR': { const L = s[1] - 0.03; add(n, par, p, [0.036, L, 0.036], [0, -L / 2, 0], DEP_OS, osT); break; }
        case 'handL': case 'handR': add(n, par, p, [0.05, 0.08, 0.026], [0, -0.04, 0], DEP_OS, osT); break;
        case 'skirt': case 'coatTail': if (!nu) add(n, par, p, [s[0] * 0.92, s[1] * 0.85, 0.03], [0, q.o[1], -s[2] * 0.3], n === 'skirt' ? botR : topR, clothT); break;
        default: continue; // cheveux, barbe, nez, oreilles, chapeaux, ceinture… : partis
      }
      keep.add(n);
    }
    const r = new Rig(P);
    r.kind = 'human'; r.look = look; r.os = true;
    if (hr.hipY !== undefined) r.hipY = hr.hipY;
    r.tr = Object.assign({}, T, { skirt: false, coat: false, tail: false });
    return r;
  },
  // le chien, en os
  chienOs() {
    const { P, add } = rigParts();
    const osT = tx(TL.bone, TL.bone), sombre = [0.09, 0.08, 0.07];
    add('body', null, [0, 0.52, 0], [0.045, 0.045, 0.66], [0, 0.1, 0], DEP_OS, osT); // l'échine
    for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) add('rib' + i + (sx < 0 ? 'L' : 'R'), 'body', [sx * 0.035, 0.1, 0.2 - i * 0.075], [0.02, 0.2, 0.022], [0, -0.1, 0], DEP_OS, osT, { r0: [0, 0, sx * 0.45] });
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.09, -0.02, sz * 0.26], [0.03, 0.34, 0.03], [0, -0.17, 0], DEP_OS, osT);
    add('neck', 'body', [0, 0.12, 0.31], [0.035, 0.035, 0.12], [0, 0, 0.05], DEP_OS, osT);
    add('head', 'neck', [0, 0, 0.1], [0.15, 0.13, 0.16], [0, 0, 0.08], DEP_OS, osT);
    add('snout', 'head', [0, -0.03, 0.16], [0.07, 0.05, 0.13], [0, 0, 0.06], DEP_OS, osT);
    add('orbL', 'head', [-0.045, 0.025, 0.162], [0.035, 0.03, 0.01], [0, 0, 0], sombre, TL.plain);
    add('orbR', 'head', [0.045, 0.025, 0.162], [0.035, 0.03, 0.01], [0, 0, 0], sombre, TL.plain);
    add('tail', 'body', [0, 0.1, -0.34], [0.016, 0.26, 0.016], [0, -0.13, 0], DEP_OS, osT);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; r.os = true;
    return r;
  },
  vieillirChien(r, st) {
    const to = st >= 2 ? [0.25, 0.22, 0.19] : [0.42, 0.39, 0.35], k = st >= 2 ? 0.55 : st === 1 ? 0.22 : 0.06;
    for (const q of r.parts) if (q.s) q.col = depMixF(q.col, to, k);
    const b = r.part('body');
    if (b && st >= 1) b.s = [b.s[0] * (st >= 2 ? 0.7 : 0.84), b.s[1] * (st >= 2 ? 0.78 : 0.92), b.s[2]];
  },
  // les poses : sur le dos, sur le ventre, sur le côté, au lit (les mains jointes)
  poser(r, pose) {
    const set = (n, x, y, z) => { if (r.has(n)) r.set(n, x, y, z); };
    if (pose === 'lit') {
      set('armL', -0.42, 0, 0.12); set('armR', -0.42, 0, -0.12); set('foreL', -1.6, 0.62, 0); set('foreR', -1.6, -0.62, 0);
      set('head', 0.06, 0, 0); set('shinL', 0.04, 0, 0); set('shinR', 0.04, 0, 0);
    } else if (pose === 'ventre') {
      set('armL', -2.85, 0, -0.35); set('foreL', -0.35, 0, 0); set('armR', 0.18, 0, 0.4); set('foreR', -0.25, 0, 0);
      set('head', 0, 1.2, 0); set('legL', 0.05, 0, -0.08); set('legR', 0, 0, 0.2); set('shinL', 0.08, 0, 0); set('shinR', 0.12, 0, 0);
    } else if (pose === 'cote') {
      set('legL', -0.75, 0, 0); set('shinL', 1.0, 0, 0); set('legR', -0.35, 0, 0.05); set('shinR', 0.65, 0, 0);
      set('armL', -0.95, 0, 0.1); set('foreL', -0.85, 0, 0); set('armR', -0.55, 0, -0.1); set('foreR', -1.05, 0, 0);
      set('head', 0.3, 0, 0);
    } else {
      set('armL', 0.12, 0, -0.55); set('foreL', -0.25, 0, 0); set('armR', 0.1, 0, 0.8); set('foreR', -0.55, 0, 0);
      set('legL', 0.04, 0, -0.1); set('legR', -0.08, 0, 0.14); set('shinL', 0.1, 0, 0); set('shinR', 0.3, 0, 0);
      set('head', 0.08, 0.6, 0.1);
    }
  },
  poserChien(r) {
    const set = (n, x, y, z) => { if (r.has(n)) r.set(n, x, y, z); };
    set('legFL', -0.45, 0, 0); set('legFR', -0.7, 0, 0); set('legBL', 0.3, 0, 0); set('legBR', 0.55, 0, 0);
    set('neck', 0.1, 0, 0); set('head', 0.12, 0, 0); set('tail', 1.3, 0, 0);
  },

  // ------------------------------------------------------------------ rendu (une matrice fixe par corps, refaite quand le stade change)
  construire(rec, st) {
    let rig, F0, s = 1, core;
    if (rec.t === 'chien') {
      rig = st >= 3 ? this.chienOs() : ANIMAL_RIGS.dog(rec.v || 0);
      if (st < 3) this.vieillirChien(rig, st);
      this.poserChien(rig);
      F0 = depMul(depMat(0, 0, Math.PI / 2), depMat(0, 0, 0, 0, -0.52, 0));
      core = DEP_CORE_CHIEN;
    } else {
      const look = this.lookDe(rec);
      if (!look) return null;
      rig = st >= 3 ? this.squelette(look) : this.humain(look, st);
      const hipY = rig.hipY || 0.88;
      if (rig.has('hips')) rig.part('hips').p[1] = hipY;
      this.poser(rig, rec.pose);
      s = look.height || 1;
      F0 = depMul(depMat(0, 0, 0, 0, 0, -hipY), depMul(DEP_L, depMat(0, DEP_ROLL[rec.pose] || 0, 0)));
      core = DEP_CORE;
    }
    // posé : la plus basse des pièces principales touche le sol
    const B = this.buf || (this.buf = new InstBuf(256));
    B.reset(); rig.emit(B, F0, 0);
    let minY = Infinity;
    for (const q of rig.parts) {
      if (!q.s || q.hide || !core.has(q.name)) continue;
      const W = q.W, yc = W[4] * q.o[0] + W[5] * q.o[1] + W[6] * q.o[2] + W[7];
      minY = Math.min(minY, yc - 0.5 * (Math.abs(W[4]) * q.s[0] + Math.abs(W[5]) * q.s[1] + Math.abs(W[6]) * q.s[2]));
    }
    if (!isFinite(minY)) minY = 0;
    const Fl = depMul(depMat(0, 0, 0, 0, 0.006 - minY, 0), F0);
    const Rt = depMul(m34Root(new Float32Array(12), rec.x, rec.y, rec.z, rec.r, s), depMat(-(rec.pa || 0), 0, rec.pl || 0));
    const M = depMul(Rt, Fl);
    // pour viser : la tête, le bassin, les pieds
    const L = rec.t === 'chien' ? 0.42 : 0.85;
    const pts = [[0, 0.15, L], [0, 0.15, 0], [0, 0.15, -L]].map(([a, b, c]) => [Rt[0] * a + Rt[1] * b + Rt[2] * c + Rt[3], Rt[4] * a + Rt[5] * b + Rt[6] * c + Rt[7], Rt[8] * a + Rt[9] * b + Rt[10] * c + Rt[11]]);
    // la pose ne bouge plus : les boîtes sont calculées une fois, puis recopiées à chaque image
    const inst = new InstBuf(64);
    rig.emit(inst, M, 0);
    return { st, rig, M, pts, inst };
  },
  rt(rec) {
    const st = this.stade(rec);
    let R = this.cache.get(rec.id);
    if (R && R.st === st) return R.rig ? R : null;
    try { R = this.construire(rec, st); } catch (e) { console.error('depouilles : rendu', e); R = null; }
    if (!R) R = { st, rig: null };
    this.cache.set(rec.id, R);
    return R.rig ? R : null;
  },
  draw(buf, sbuf, cam) {
    const S = this.S();
    if (!S || !S.corps.length || this.cachesMonde()) return;
    const sky = game.sky, maxD = Math.min(95, (sky ? sky.fog[1] : 150) + 12), m2 = maxD * maxD;
    const tg = game.target && game.target.depouille;
    for (const rec of S.corps) {
      const dx = rec.x - cam[0], dz = rec.z - cam[2];
      if (dx * dx + dz * dz > m2 || Math.abs(rec.y - cam[1]) > 45) continue;
      const R = this.rt(rec);
      if (!R) continue;
      if (tg === rec || !R.inst) { drawRigM(buf, R.rig, R.M, tg === rec ? FX_HI : 0); continue; } // (visé : en surbrillance)
      const n = R.inst.n;
      while (buf.n + n > buf.cap) { const d = new Float32Array(buf.cap * 32); d.set(buf.data); buf.data = d; buf.cap *= 2; }
      buf.data.set(R.inst.data.subarray(0, n * 16), buf.n * 16);
      buf.n += n;
    }
  },
  // les habitants morts ce jour (état 'dead') ne sont plus dessinés par npcs.draw : c'est leur dépouille qu'on voit
  aCacher() {
    const out = [];
    for (const rec of this.liste()) {
      if (rec.t !== 'npc') continue;
      const n = npcs.byId[rec.qui];
      if (n && n.state === 'dead' && !n.vanished) out.push(n);
    }
    return out;
  },

  // ------------------------------------------------------------------ la touche E
  pelleEnMain() { const s = farm.s, it = ITEMS[s.hand]; return !!(it && it.tool === 'pelle' && farm.count(s.hand)); },
  aDesPoches(rec) { if (rec.t === 'chien') return false; return rec.poches == null || rec.poches.length > 0; },
  etiquette(rec) {
    const nom = this.nom(rec), pelle = this.pelleEnMain();
    if (rec.t === 'chien') return `Enterrer ${rec.nom || 'le chien'}`;
    if (!pelle && this.aDesPoches(rec)) return nom ? (depElide(nom) ? `Fouiller le corps d’${nom}` : `Fouiller le corps de ${nom}`) : 'Fouiller le corps';
    if (pelle || farm.bestTool('pelle')) return nom ? `Enterrer ${nom}` : 'Enterrer le corps';
    return 'Enterrer le corps (il faudrait une pelle)';
  },
  cible(eye, f, cand) {
    const S = this.S();
    if (!S || !S.corps.length || this.cachesMonde()) return;
    const w = game.world;
    let best = null, bt = 2.9;
    for (const rec of S.corps) {
      if (Math.abs(rec.x - eye[0]) > 4 || Math.abs(rec.z - eye[2]) > 4 || Math.abs(rec.y - eye[1]) > 3.5) continue;
      const R = this.rt(rec);
      if (!R) continue;
      const rad = rec.t === 'chien' ? 0.3 : 0.36;
      for (let i = 0; i <= 4; i++) {
        const k = i / 4, A = k <= 0.5 ? R.pts[0] : R.pts[1], B = k <= 0.5 ? R.pts[1] : R.pts[2], u = k <= 0.5 ? k * 2 : (k - 0.5) * 2;
        const px = lerp(A[0], B[0], u) - eye[0], py = lerp(A[1], B[1], u) - eye[1], pz = lerp(A[2], B[2], u) - eye[2];
        const tt = px * f[0] + py * f[1] + pz * f[2];
        if (tt < 0.2 || tt >= bt) continue;
        const qx = px - f[0] * tt, qy = py - f[1] * tt, qz = pz - f[2] * tt;
        if (qx * qx + qy * qy + qz * qz > rad * rad) continue;
        const d = Math.hypot(px, py, pz) || 1, bh = w.raycastBlocks(eye, [px / d, py / d, pz / d], d - 0.25);
        if (bh && !(bh.block && bh.block.hidden)) continue;
        bt = tt; best = rec;
      }
    }
    // un regard posé sur le corps l'emporte sur ce qui est dessous (le lit, visé par 11-zzz95, l'herbe…)
    if (best) cand({ kind: 'hook', use: () => this.utiliser(best), depouille: best, f2lab: this.etiquette(best) }, Math.max(0.25, bt * 0.5));
  },
  utiliser(rec) {
    if (!farm.s || !rec || game.sleeping || game.dying || (typeof cine !== 'undefined' && cine.on)) return;
    if (this.pelleEnMain() || rec.t === 'chien') return this.enterrer(rec);
    if (this.aDesPoches(rec)) return this.fouiller(rec);
    if (farm.bestTool('pelle')) return this.enterrer(rec);
    sound.click && sound.click();
    ui.subtitle('', '(Ses poches sont vides. Il faudrait une pelle pour lui creuser une tombe.)', 3.5);
  },

  // ------------------------------------------------------------------ fouiller
  tirer(rec) {
    const R = mulberry32((hashString('dep:' + rec.id + ':' + (farm.s.seed | 0)) >>> 0) || 7);
    const out = [];
    const add = (k, n) => {
      if (!(n > 0) || (k !== 'argent' && (!ITEMS[k] || (ITEMS[k].unique && farm.count(k))))) return;
      const e = out.find((q) => q[0] === k);
      if (e) e[1] += n; else out.push([k, n]);
    };
    const int = (a, b) => a + Math.floor(R() * (b - a + 1)), une = (L) => L[(R() * L.length) | 0];
    let P = null;
    if (rec.t === 'npc') P = (typeof VOL_POCHES !== 'undefined' && VOL_POCHES[rec.qui]) || DEP_POCHES[rec.qui] || DEP_POCHES._;
    else if (rec.t === 'chasseur') P = DEP_CHASSEUR;
    if (!P || P.nu) return out;
    if (P.b && P.b[1] > 0) add('argent', int(P.b[0], P.b[1]));
    const m = (P.m || []).slice();
    for (let k = 0, n = int(1, 2); k < n && m.length; k++) add(m.splice((R() * m.length) | 0, 1)[0], 1 + (R() < 0.3 ? 1 : 0));
    if (P.p && P.p.length && R() < 0.55) add(une(P.p), 1);
    if (P.r && P.r.length && R() < 0.12) add(une(P.r), 1);
    const Q = P.q && farm.s.quests[P.q[0]];
    if (Q && Q.st === 'actif' && !farm.count(P.q[1])) add(P.q[1], 1);
    if (rec.masque && ITEMS.masque && !farm.count('masque')) add('masque', 1);
    return out;
  },
  titrePoches(rec) {
    if (rec.t === 'chasseur') return 'Les poches du chasseur de primes';
    const nom = this.nom(rec);
    if (nom) return depElide(nom) ? `Les poches d’${nom}` : `Les poches de ${nom}`;
    return this.fem(rec) ? 'Les poches de l’inconnue' : 'Les poches de l’inconnu';
  },
  fouiller(rec) {
    const s = farm.s;
    if (rec.poches == null) rec.poches = rec.t === 'fermier' ? [] : this.tirer(rec);
    if (sound.fouille) sound.fouille('tissu'); else sound.click && sound.click();
    this.profanation(rec);
    const premier = !rec.fouille;
    rec.fouille = rec.fouille || s.day;
    // le fermier d'avant : la même lettre du notaire, un autre prénom
    if (rec.t === 'fermier' && premier) {
      rec.nomConnu = 1;
      this.syncFermier(rec);
      ui.subtitle('', rec.nom ? `(Dans la poche de sa veste, une lettre du notaire, pliée en quatre. La même que la vôtre, mot pour mot. Seul le prénom change : ${rec.nom}.)` : '(Dans la poche de sa veste, une lettre du notaire, pliée en quatre. La même que la vôtre, mot pour mot.)', 7);
    }
    if (!rec.poches.length) {
      if (this.nu(rec)) ui.subtitle('', this.fem(rec) ? '(Elle n’a rien sur elle. Aux Sources, on ne porte rien.)' : '(Il n’a rien sur lui. Aux Sources, on ne porte rien.)', 3.5);
      else if (rec.t !== 'fermier' || !premier) ui.subtitle('', '(Ses poches sont vides.)', 3);
      return;
    }
    if (typeof butin !== 'undefined' && butin && typeof butin.ouvrir === 'function') {
      try {
        butin.ouvrir({ titre: this.titrePoches(rec), objets: rec.poches.map(([k, n]) => [k, n]), cle: 'depouille:' + rec.id, proprio: null, x: rec.x, z: rec.z, onPris: (id, n) => this.retirer(rec, id, n), onFerme: () => {} });
        return;
      } catch (e) { console.error('depouilles : menu de butin', e); }
    }
    // sans le menu de butin : on prend tout
    const bits = [], pos = [rec.x, rec.y + 0.4, rec.z];
    for (const [k, n] of rec.poches) {
      if (k === 'argent') { farm.earn(n); sound.coin && sound.coin(); bits.push(n > 1 ? `${n} pièces` : 'une pièce'); continue; }
      if (!ITEMS[k]) continue;
      farm.give(k, n); play.flyer && play.flyer(k, pos, n);
      bits.push(n > 1 ? `${itemName(k).toLowerCase()} (${n})` : itemName(k).toLowerCase());
    }
    rec.poches = [];
    this.syncFermier(rec);
    ui.subtitle('', bits.length ? `(Dans ses poches : ${bits.join(', ')}.)` : '(Ses poches sont vides.)', 4);
  },
  // le menu de butin a donné n « id » au fermier : on l'ôte des poches
  retirer(rec, id, n) {
    if (!rec || !Array.isArray(rec.poches)) return;
    const e = rec.poches.find((q) => q[0] === id);
    if (!e) return;
    e[1] -= n > 0 ? n : e[1];
    if (e[1] <= 0) rec.poches.splice(rec.poches.indexOf(e), 1);
    this.syncFermier(rec);
  },
  temoins() {
    if (typeof fouilles !== 'undefined' && fouilles.temoins) { try { return fouilles.temoins({ data: {} }, null); } catch (e) { console.error(e); } }
    const p = game.player;
    return npcs.witnesses(p.pos[0], p.pos[2]);
  },
  // fouiller un mort sous les yeux de quelqu'un : une profanation
  profanation(rec) {
    if (rec.t === 'chien') return;
    const s = farm.s, p = game.player, vus = this.temoins();
    if (!vus.length) { esprit.changer(-0.8, 'fouiller un mort', 3); return; }
    npcs.say(vus[0], pick(DEP_CRIS), 3.2);
    for (const v of vus) { v.heading = Math.atan2(p.pos[0] - v.x, p.pos[2] - v.z); v.chatT = 0; }
    esprit.changer(-2, 'profaner un mort', 4);
    if (rec.prof === s.day) return;
    rec.prof = s.day;
    if (typeof societe !== 'undefined' && societe.crime) {
      try { societe.crime({ type: 'profanation', victime: rec.t === 'npc' ? rec.qui : null, x: rec.x, z: rec.z, temoins: vus, detail: 'depouille' }); } catch (e) { console.error(e); }
    } else for (const v of vus) npcs.addAmitie(v, -40);
  },

  // ------------------------------------------------------------------ enterrer
  lieuTombe(rec) {
    const w = game.world;
    // de la terre meuble, dehors, hors de l'eau et des pavés
    const meuble = (x, z) => {
      if (!w.inside(x, z, 3)) return false;
      const h = w.heightAt(x, z);
      if (h < w.waterLevel + 0.15) return false;
      const m = w.matAt(x, z);
      return m !== M_ROCK && m !== M_COBBLE && m !== M_STONE && !w.covered(x, h + 1.2, z);
    };
    // toute la fosse : libre (ni mur ni meuble) et à peu près à plat, d'un bout à l'autre ; renvoie le cap retenu
    const fosse = (x, z) => {
      if (!meuble(x, z) || !pointFree(w, x, z, 0.5)) return null;
      const h = w.heightAt(x, z);
      for (const r of [rec.r, rec.r + Math.PI / 2]) {
        let ok = true;
        for (const k of [-1, 1]) { const ex = x + Math.sin(r) * 0.95 * k, ez = z + Math.cos(r) * 0.95 * k; if (!meuble(ex, ez) || !pointFree(w, ex, ez, 0.3) || Math.abs(w.heightAt(ex, ez) - h) > 0.5) { ok = false; break; } }
        if (ok) return r;
      }
      return null;
    };
    const sousTerre = rec.y < w.heightAt(rec.x, rec.z) - 2;
    const dedans = !sousTerre && w.covered(rec.x, rec.y + 1.0, rec.z);
    if (!sousTerre && !dedans && rec.sol) { const r = fosse(rec.x, rec.z); if (r !== null) return { x: rec.x, y: w.heightAt(rec.x, rec.z), z: rec.z, r, mode: 'la' }; }
    if (!sousTerre) {
      for (let k = 1; k <= (dedans ? 30 : 22); k++) for (let a = 0; a < 16; a++) {
        const g = a / 16 * TAU + k * 0.37, x = rec.x + Math.cos(g) * k, z = rec.z + Math.sin(g) * k, r = fosse(x, z);
        if (r !== null) return { x, y: w.heightAt(x, z), z, r, mode: dedans ? 'dehors' : 'traine' };
      }
    }
    // un tas de pierres : là, ou tout près, où rien ne gêne (ni table ni mur), au niveau du sol où il gît
    const plat = (x, z) => this.libre(x, z, rec.y, 0.55) && Math.abs(w.groundAt(x, z, rec.y + 0.5, 0.6) - rec.y) < 0.4;
    for (let k = 0; k <= 6; k++) for (let a = 0; a < (k ? 12 : 1); a++) {
      const g = a / 12 * TAU, x = rec.x + Math.cos(g) * k * 0.8, z = rec.z + Math.sin(g) * k * 0.8;
      if (plat(x, z)) return { x, y: w.groundAt(x, z, rec.y + 0.5, 0.6), z, r: rec.r, mode: 'pierres' };
    }
    return { x: rec.x, y: rec.y, z: rec.z, r: rec.r, mode: 'pierres' };
  },
  texteFosse(rec, lieu, st, fem) {
    if (rec.t === 'chien') return st >= 3 ? `Il ne reste de ${rec.nom} que des os. Vous les rassemblez au fond d’un trou, et vous refermez la terre.` : `Vous creusez un trou, là, dans la terre meuble, et vous y couchez ${rec.nom}.`;
    if (st >= 3) return lieu.mode === 'pierres' ? 'Il ne reste presque rien. Vous rassemblez les os, un à un, et vous les couvrez de pierres.' : 'Il ne reste presque rien à porter. Vous rassemblez les os au fond d’une fosse, un à un, et vous refermez la terre.';
    if (lieu.mode === 'pierres') return fem ? 'Le sol est trop dur pour la pelle. Vous la recouvrez de pierres, une à une, jusqu’à ce qu’on ne la voie plus.' : 'Le sol est trop dur pour la pelle. Vous le recouvrez de pierres, une à une, jusqu’à ce qu’on ne le voie plus.';
    if (lieu.mode === 'dehors') return fem ? 'Vous la portez dehors, à bras-le-corps, et vous lui creusez une fosse au pied du mur.' : 'Vous le portez dehors, à bras-le-corps, et vous lui creusez une fosse au pied du mur.';
    if (lieu.mode === 'traine') return fem ? 'Le sol est trop dur, ici. Vous la traînez jusqu’à la terre meuble, un peu plus loin, et vous creusez.' : 'Le sol est trop dur, ici. Vous le traînez jusqu’à la terre meuble, un peu plus loin, et vous creusez.';
    return fem ? 'Vous creusez une fosse, là où elle est tombée, et vous l’y couchez. La terre retombe sur elle, pelletée après pelletée.' : 'Vous creusez une fosse, là où il est tombé, et vous l’y couchez. La terre retombe sur lui, pelletée après pelletée.';
  },
  async enterrer(rec) {
    const s = farm.s, S = this.S();
    if (!S || !S.corps.includes(rec) || game.sleeping || game.dying) return;
    const chienRec = rec.t === 'chien';
    if (!chienRec && !farm.bestTool('pelle')) { sound.click && sound.click(); ui.subtitle('', '(Il faudrait une pelle pour lui creuser une tombe.)', 3); return; }
    const lieu = this.lieuTombe(rec), st = this.stade(rec), fem = this.fem(rec);
    game.sleeping = true;
    ui.close(true);
    let fait = false;
    try {
      await ui.fade(true, this.texteFosse(rec, lieu, st, fem), 1000);
      for (let i = 0; i < 4; i++) setTimeout(() => { if (lieu.mode === 'pierres') sound.impact && sound.impact('hard'); else sound.shovel && sound.shovel(0.8); }, 250 + i * 520);
      await new Promise((r) => setTimeout(r, 2500));
      const i = S.corps.indexOf(rec);
      if (i >= 0) S.corps.splice(i, 1);
      this.cache.delete(rec.id);
      for (const k of Object.keys(S.vus)) if (k.endsWith(':' + rec.id)) delete S.vus[k];
      if (chienRec) {
        farm.addProp({ id: 'tombe_chien', x: lieu.x, y: lieu.y, z: lieu.z, r: lieu.r });
        const C = s.chien;
        if (C && C.mort && C.mort.depouille === rec.id) C.mort.enterre = true;
        esprit.changer(1.5, 'deuil');
      } else {
        const nomG = rec.t === 'npc' ? this.nomComplet(rec) : rec.t === 'fermier' && rec.nomConnu ? rec.nom || null : null;
        farm.addProp({ id: 'tertre', x: lieu.x, y: lieu.y, z: lieu.z, r: lieu.r, data: { t: rec.t, nom: nomG, fem: fem ? 1 : 0, j: rec.j, fin: s.day, pierre: lieu.mode === 'pierres' ? 1 : 0, run: rec.run || null } });
        esprit.changer(1.5, 'enterrer un mort', 3);
        this.merci(rec, lieu);
        if (rec.t === 'fermier') this.syncFermier(rec, lieu);
      }
      this.avancer(chienRec ? 0.5 : 1);
      fait = true;
    } catch (e) { console.error('depouilles : enterrer', e); }
    try { await ui.fade(false, '', 1000); } finally { game.sleeping = false; }
    if (fait) ui.subtitle('', chienRec ? '(Un petit tertre, un bâton en travers. C’est tout ce que vous avez su faire.)' : lieu.mode === 'pierres' ? '(Un tas de pierres, et une croix de deux bâtons liés. Les bêtes n’y toucheront pas.)' : '(Un tertre de terre fraîche, et une croix de deux bâtons liés. Ce n’est pas grand-chose. C’est mieux que rien.)', 4.5);
  },
  // ceux qui voient remercient ; ceux qui l'aimaient l'apprennent
  merci(rec, lieu) {
    const vus = npcs.witnesses(lieu.x, lieu.z);
    if (vus.length) { const m = vus[0]; setTimeout(() => { if (m.st.alive && !game.dying) npcs.say(m, pick(DEP_MERCI), 3.5); }, 2600); }
    for (const m of vus) npcs.addAmitie(m, 8);
    const mort = this.npc(rec);
    if (mort) for (const id in mort.d.liens || {}) {
      const m = npcs.byId[id];
      if (m && m.st.alive && !DEP_HOSTILE.test(mort.d.liens[id])) { npcs.addAmitie(m, 20); npcs.remember(m, 'enterre', { victim: mort.id }); }
    }
  },
  // le temps passe (on ne saute pas l'aube : la journée nouvelle se fait à son heure)
  avancer(h) {
    const w = game.world, H = w.time * 24, H2 = H + h;
    game.skipHours(h);
    if (!(H < 6 && H2 >= 6) && H2 < 24) { w.time = H2 / 24; game.lastT = w.time; }
  },
  // E sur un tertre : ce qui est gravé sur la croix
  lireTombe(q) {
    const d = (q && q.data) || {};
    let txt;
    if (d.t === 'fermier') {
      const v = d.run ? `\n— version n° ${d.run} —` : '';
      txt = d.nom ? (d.fem ? `${d.nom}\nfermière de la vieille ferme` : `${d.nom}\nfermier de la vieille ferme`) : (d.fem ? 'Une inconnue, en habits de ferme' : 'Un inconnu, en habits de ferme');
      txt += v;
    } else {
      const qui = d.nom || (d.fem ? 'Une inconnue' : 'Un inconnu');
      txt = d.j > 0 && typeof cal !== 'undefined' ? `${qui}\n† ${cal.nom(d.j)} ${d.j}` : qui;
    }
    ui.read('Une croix de bois', txt, '(Gravé au couteau, de travers, dans le bois de la croix.)');
  },

  // ------------------------------------------------------------------ ceux qui voient un corps
  reactions() {
    const S = this.S(), w = game.world, s = farm.s;
    if (!S.corps.length || game.sleeping || this.cachesMonde()) return;
    for (const rec of S.corps) {
      for (const n of npcs.list) {
        if (!n.st.alive || n.vanished || n.hunting || n.sleep || n.state === 'sleep' || n.state === 'gone' || n.talking || n._dep || n.id === rec.qui) continue;
        if ((n.fleeT || 0) > 0 || (n.poursuite || 0) > game.time || (n.alerte && n.alerte.t > game.time)) continue;
        const dx = rec.x - n.x, dz = rec.z - n.z;
        if (Math.abs(dx) > 11 || Math.abs(dz) > 11) continue;
        const d = Math.hypot(dx, dz);
        if (d > 11 || Math.abs((n.y || 0) - rec.y) > 2.5) continue;
        const k = n.id + ':' + rec.id;
        if (S.vus[k]) continue;
        const o = [n.x, (n.y || 0) + 1.55, n.z], vx = rec.x - o[0], vy = rec.y + 0.25 - o[1], vz = rec.z - o[2], L = Math.hypot(vx, vy, vz) || 1;
        if (L > 1.5 && w.raycastBlocks(o, [vx / L, vy / L, vz / L], L - 0.4)) continue;
        S.vus[k] = s.day;
        this.reagir(n, rec, d);
      }
    }
  },
  reagir(n, rec, d) {
    const s = farm.s, p = game.player, st = this.stade(rec), fem = this.fem(rec);
    // la nouvelle court : le corps est trouvé (et le meurtre avec lui)
    if (!rec.trouve) {
      rec.trouve = { j: s.day, par: n.id };
      if (rec.t === 'npc') { const cr = ((s.rep && s.rep.crimes) || []).find((k) => k.victim === rec.qui && !k.known); if (cr) cr.found = true; }
    }
    const dp = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]);
    if (dp > 40) return;
    const mort = this.npc(rec), lien = mort && ((n.d.liens && n.d.liens[mort.id]) || (mort.d.liens && mort.d.liens[n.id]));
    const proche = !!(lien && !DEP_HOSTILE.test(lien));
    let txt, geste = 'bras';
    if (mort && n.d.id === 'fillette' && mort.d.liens && mort.d.liens.fillette === 'fille' && st <= 1) txt = 'Maman ? Maman, réveille-toi… Maman !';
    else if (mort && proche && st <= 1) txt = `${mort.name} ! Non… Non, non, non…`;
    else if (n.d.id === 'cure') { txt = 'Requiescat in pace. Que Dieu ait son âme… et pitié de nous.'; geste = 'priere'; }
    else if (n.d.id === 'garde' && st <= 1) txt = 'Que personne n’y touche. Personne, vous m’entendez ?';
    else if (n.d.id === 'fillette' && rec.t !== 'chien') txt = st >= 3 ? 'Des os… C’est à qui, les os ?' : fem ? 'Elle dort par terre, la dame… Pourquoi elle se réveille pas ?' : 'Il dort par terre, le monsieur… Pourquoi il se réveille pas ?';
    else if (rec.t === 'chien') txt = pick(['Pauvre bête…', 'C’est votre chien, là, par terre ? Pauvre bête.']);
    else if (rec.t === 'fermier' && dp < 25) txt = 'Qui est-ce ?… On dirait… On dirait vous.';
    else if (rec.t === 'chasseur' && st <= 1) txt = 'Un chasseur de primes… Bon débarras. Mais tout de même.';
    else if (st >= 3) txt = 'Des os… Qui était-ce ? Plus personne ne s’en souvient.';
    else if (st === 2) txt = fem ? 'Elle est toujours là… Personne n’ose y toucher.' : 'Il est toujours là… Personne n’ose y toucher.';
    else if (mort) txt = Math.random() < 0.5 ? `C’est ${mort.name}… Mon Dieu, c’est ${mort.name}.` : pick(DEP_PEUR);
    else txt = pick(DEP_PEUR);
    if (txt && game.time - this.dit > 5) { this.dit = game.time; npcs.say(n, txt, 3.2); }
    // il s'arrête, regarde, puis s'écarte
    n._dep = { x: rec.x, z: rec.z, t: 0, geste, g0: n.gesture || null, recul: d < 6 };
    n.goal = null; n.path = [];
  },
  // pendant la réaction, c'est ce module qui mène l'habitant (la routine attend)
  recul(n, dt, w) {
    const D = n._dep;
    D.t += dt;
    if (!n.st.alive || n.talking || (n.fleeT || 0) > 0 || D.t > 4.5) return this.finRecul(n);
    const dx = n.x - D.x, dz = n.z - D.z, d = Math.hypot(dx, dz) || 1;
    if (D.t < 1.6) {
      n.move = lerp(n.move || 0, 0, Math.min(1, dt * 6)); n.state = 'idle'; n.lookY = 0;
      n.heading = turnToward(n.heading, Math.atan2(-dx, -dz), dt * 5);
      n.gesture = D.geste;
      return;
    }
    n.gesture = D.g0;
    if (!D.recul || d > 6.5) return this.finRecul(n);
    n.heading = turnToward(n.heading, Math.atan2(dx, dz), dt * 6);
    const sp = 1.5;
    let nx = n.x + Math.sin(n.heading) * sp * dt, nz = n.z + Math.cos(n.heading) * sp * dt;
    [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.28, 0.5, true);
    n.x = nx; n.z = nz; n.y = w.groundAt(nx, nz, n.y + 0.6, 0.6);
    n.move = 1; n.run = false; n.phase = (n.phase || 0) + dt * sp * 2.4; n.state = 'walk';
  },
  finRecul(n) {
    const D = n._dep;
    n._dep = null;
    if (D) n.gesture = D.g0;
    n.goal = null; n.path = []; n.move = 0; n.state = 'idle';
  },

  // ------------------------------------------------------------------ ce que voit le fermier
  pensee(rec, st, neuf) {
    const fem = this.fem(rec), nom = this.nom(rec);
    if (rec.t === 'chien') return st >= 3 ? `(Des os, et le creux que faisait ${rec.nom} dans l’herbe.)` : st >= 1 ? `(${rec.nom} est toujours là. Il faudrait l’enterrer.)` : `(${rec.nom} est couché là. Il ne bouge plus. Il ne se relèvera pas.)`;
    if (rec.t === 'fermier' && neuf) {
      if (st >= 3) return '(Des os, dans des habits de ferme. Les mêmes que les vôtres.)';
      return !!rec.fem === !!farm.s.fem ? '(Ce corps porte vos vêtements. Les mêmes, exactement.)' : '(Des habits de ferme, comme les vôtres, et les mêmes mains calleuses.)';
    }
    if (rec.t === 'chasseur' && st <= 1) return '(L’homme qui vous cherchait. Il ne cherchera plus personne.)';
    if (st >= 3) return this.nu(rec) ? '(Des os, blanchis. Quelqu’un est mort là, et personne n’est venu.)' : '(Des os, dans des vêtements vides. Quelqu’un est mort là, il y a longtemps, et personne n’est venu.)';
    if (st === 2) return '(L’odeur vous arrive avant tout le reste. Puis vous voyez le corps.)';
    if (st === 1) return nom ? `(${nom} est toujours là. La peau a pris la couleur de la cire.)` : '(Le corps est toujours là. La peau a pris la couleur de la cire.)';
    if (nom) return fem ? `(C’est ${nom}. Elle ne bouge plus.)` : `(C’est ${nom}. Il ne bouge plus.)`;
    if (this.enfant(rec)) return '(Une enfant est étendue là. Elle ne respire plus.)';
    return fem ? '(Une femme est étendue là. Elle ne respire plus.)' : '(Un homme est étendu là. Il ne respire plus.)';
  },
  regards() {
    const S = this.S(), s = farm.s, p = game.player;
    if (typeof espritVoit !== 'function' || this.cachesMonde()) return;
    for (const rec of S.corps) {
      const st = this.stade(rec);
      if (rec.vj === s.day && rec.vs === st) continue;
      if (Math.abs(rec.x - p.pos[0]) > 14 || Math.abs(rec.z - p.pos[2]) > 14 || Math.abs(rec.y - p.pos[1]) > 4) continue;
      if (!espritVoit(rec.x, rec.y + 0.3, rec.z, 14)) continue;
      const neuf = !rec.vu0;
      if (neuf || rec.vs !== st) { rec.vs = st; const t = this.pensee(rec, st, neuf); if (t && !ui.panel) ui.subtitle('', t, 4.5); }
      if (rec.vj !== s.day) {
        const n = this.npc(rec);
        if (rec.t === 'chien') esprit.changer(neuf ? -3 : -1, 'carcasse', 6);
        else if (!(n && n.state === 'dead')) esprit.changer(neuf ? -2 : -0.5, 'cadavre', 9);
      }
      rec.vu0 = 1; rec.vj = s.day;
    }
  },
  // des mouches, le jour ; des corbeaux, quand on arrive de loin
  ambiance(dt) {
    const S = this.S(), p = game.player, sky = game.sky;
    if (!S.corps.length || !sky || this.cachesMonde()) return;
    const jour = sky.day > 0.35 && !(weather.cur.rain > 0.35);
    if (!jour) return;
    for (const rec of S.corps) {
      const st = this.stade(rec);
      if (st < 1 || st > 2) continue;
      const dx = rec.x - p.pos[0], dz = rec.z - p.pos[2];
      if (Math.abs(dx) > 90 || Math.abs(dz) > 90) continue;
      const d = Math.hypot(dx, dz);
      if (d < 9 && Math.random() < dt * 7) particles.spawn(rec.x + (Math.random() - 0.5) * 0.9, rec.y + 0.15 + Math.random() * 0.45, rec.z + (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 1.4, (Math.random() - 0.3) * 0.6, (Math.random() - 0.5) * 1.4, [0.05, 0.05, 0.04, 1], 0.022, 0.5 + Math.random() * 0.4, 0, false);
      if (d < 5) {
        const R = this.cache.get(rec.id);
        if (R) { R.mT = (R.mT ?? 0.5) - dt; if (R.mT <= 0) { R.mT = 4 + Math.random() * 4; sound.mouches && sound.mouches(clamp(1 - d / 5, 0.2, 1)); } }
      }
      if (rec.sol && d > 24 && d < 85 && rec.cb !== farm.s.day) { rec.cb = farm.s.day; this.corbeaux(rec); }
    }
  },
  corbeaux(rec) {
    const w = game.world, n = 2 + ((hashString(rec.id + ':' + farm.s.day) >>> 0) % 2);
    for (let k = 0; k < n; k++) {
      const a = k / n * TAU + 0.7, r = 0.9 + k * 0.35, x = rec.x + Math.cos(a) * r, z = rec.z + Math.sin(a) * r;
      const e = entities.add(w, 'crow', x, z, {});
      e.baseY = w.heightAt(x, z); e.y = e.baseY; e.still = true; e.circle = 180; e.heading = Math.atan2(rec.x - x, rec.z - z);
    }
  },
  tick() {
    const s = farm.s;
    if (!s || !game.world) return;
    this.S();
    // le chien mort par un autre chemin (ou une ancienne partie)
    if (s.dog && !s.dog.alive && s.chien && s.chien.mort && !s.chien.mort.depouille && (s.chien.mort.enterre === false || s.chien.mort.enterre === 'non')) this.migrerChien();
    if (game.mode !== 'play' || game.dying) return;
    this.regards();
    this.reactions();
  },

  // la nouvelle court : celui qui a vu un corps en parle (les deux jours qui suivent)
  nouvelle(n) {
    const S = this.S();
    if (!S || !S.corps.length || Math.random() > 0.45) return null;
    const d = farm.s.day;
    const rec = S.corps.find((c) => { const j = S.vus[n.id + ':' + c.id]; return j !== undefined && d - j <= 2; });
    if (!rec) return null;
    if (rec.t === 'chien') return pick(['Votre chien… il est toujours là-bas, par terre. Vous devriez l’enterrer.', 'La pauvre bête est toujours couchée là-bas. Ça fait mal au cœur.']);
    if (rec.t === 'fermier') return 'Il y a un mort, près d’ici, dans des habits de ferme. On dirait les vôtres. Personne n’ose y toucher.';
    return pick(['Vous avez vu ? Il y a un mort, là-bas. Personne n’ose y toucher.', 'On a trouvé un corps. Personne ne veut le relever : ça porte malheur, de relever les morts.', '(À voix basse.) Le corps est toujours là-bas. Qui va l’enterrer, hein ? Pas moi.']);
  },

  // ------------------------------------------------------------------ l'avis de décès : une tombe vide (on ne relève pas les morts)
  avisDeces(text) {
    const S = this.S(), ville = farm.names && farm.names.ville;
    if (!S || !ville || typeof text !== 'string') return text;
    const phrase = `L’inhumation a eu lieu ce matin, au cimetière de ${ville}.`;
    if (text.indexOf(phrase) < 0) return text;
    const rec = S.corps.find((c) => { const n = c.t === 'npc' && npcs.byId[c.qui]; return !!(n && text.indexOf(n.name + ' ' + n.d.surname) >= 0); });
    if (!rec) return text;
    return text.replace(phrase, `Une tombe vide a été bénie ce matin au cimetière de ${ville}, comme le veut l’usage : dans la vallée, on ne relève pas les morts.`);
  },
  // les tombes du cimetière (11-strange.js, bury) retrouvent leur inscription après un rechargement
  restaurerTombes() {
    const w = game.world;
    for (const q of w.props) {
      if (q.gone || q.id !== 'tombe_neuve' || !q.data || typeof q.data.who !== 'string') continue;
      const n = npcs.list.find((m) => !m.st.alive && m.name + ' ' + m.d.surname === q.data.who);
      if (!n || w.inter.some((it) => it.kind === 'grave' && it.id === 'tombe_' + n.id)) continue;
      w.inter.push({ kind: 'grave', id: 'tombe_' + n.id, x: q.x, y: q.y + 0.9, z: q.z, name: 'Lire l’inscription', data: { who: n.id } });
    }
  },
};

// ---------------------------------------------------------------- le tertre et sa croix de bois (objet posé, sauvegardé avec les autres)
Object.assign(PROP_MODELS, {
  tertre(E, o) {
    const d = o.data || {};
    if (d.pierre) {
      const P = [[0, 0, 0.55, 0.5, 0.26, 0.42], [-0.18, 0, -0.05, 0.42, 0.24, 0.4], [0.2, 0, -0.1, 0.4, 0.22, 0.38], [0, 0, -0.6, 0.46, 0.22, 0.4],
        [-0.02, 0.2, 0.2, 0.38, 0.2, 0.34], [0.05, 0.18, -0.35, 0.34, 0.18, 0.3], [0.2, 0, 0.35, 0.3, 0.2, 0.3], [-0.22, 0, 0.4, 0.3, 0.2, 0.3]];
      for (const [x, y, z, sx, sy, sz] of P) E.bx(x, y, z, sx, sy, sz, rgbf('#8a8680'), TL.stone, ((x * 7 + z * 3) % 1) * 0.8);
    } else { // un tertre bombé, de la terre retournée, des mottes
      const T = [rgbf('#5a4331'), rgbf('#664c37'), rgbf('#4c3828'), rgbf('#70563f')];
      E.bx(0, -0.14, 0, 0.9, 0.24, 2.0, T[0], TL.plain);
      E.bx(0.02, 0.06, -0.03, 0.68, 0.12, 1.74, T[1], TL.plain, 0.03);
      E.bx(-0.02, 0.15, 0.04, 0.4, 0.08, 1.3, T[3], TL.plain, -0.04);
      const M = [[-0.34, 0.02, -0.7, 0.15], [0.36, 0.0, -0.2, 0.13], [-0.3, 0.03, 0.35, 0.14], [0.28, 0.02, 0.62, 0.12], [0.06, 0.18, -0.52, 0.11], [-0.12, 0.2, 0.1, 0.1], [0.14, 0.17, 0.5, 0.1], [0.4, -0.02, 0.9, 0.11], [-0.38, -0.02, -0.95, 0.12]];
      M.forEach(([x, y, z, k], i) => E.bx(x, y, z, k, k * 0.75, k * 1.1, T[i % 4], TL.plain, x * 4 + z));
    }
    // la croix : deux bâtons liés, à la tête
    E.bx(0, 0, 1.02, 0.07, 0.98, 0.07, WHITE, TL.darkwood, 0, -0.05);
    E.bx(0, 0.64, 1.02, 0.46, 0.065, 0.065, WHITE, TL.darkwood);
    E.bx(0, 0.625, 1.02, 0.085, 0.095, 0.085, rgbf('#8a7a5a'), TL.rope);
  },
});
PROP_COLL.tertre = null;
PROP_USE_MORE.tertre = 1;
HOOKS.propPre.tertre = (q) => { depouilles.lireTombe(q); return true; };

// ---------------------------------------------------------------- le bourdonnement des mouches
Object.assign(SoundEngine.prototype, {
  mouches(k = 1, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), p = this.pan(clamp(pan, -0.9, 0.9)), f = 170 + Math.random() * 60;
    this.voice(t, 'sawtooth', f, f * (0.92 + Math.random() * 0.16), 1.3 + Math.random() * 0.8, 0.0045 * k, p, { vib: 13 + Math.random() * 6, vibDepth: 22, bp: 480, q: 2.5 });
  },
});

// ============================================================================
//  BRANCHEMENTS (après tous les autres modules 11- : ces emballages sont les plus externes)
// ============================================================================
// un habitant meurt : sa dépouille
{
  const _kill = npcs.kill.bind(npcs);
  npcs.kill = function (n, by, wit) {
    const vivant = !!(n && n.st && n.st.alive);
    const lit = vivant && game.world ? depouilles.auLit(n) : false;
    const r = _kill(n, by, wit);
    try { if (vivant && !n.st.alive && farm.s) depouilles.surMort(n, by, lit); } catch (e) { console.error('depouilles', e); }
    return r;
  };
  // le lendemain, l'habitant est « parti » (npcs.morning) : la tombe du cimetière est posée, mais le corps reste.
  // (si la partie a été rechargée le jour même de la mort, l'habitant l'était déjà : on fait ce que le matin aurait fait)
  const _morning = npcs.morning.bind(npcs);
  npcs.morning = function (w) {
    const s = farm.s;
    const tard = s ? this.list.filter((n) => !n.st.alive && n.state === 'gone' && n.st.dead && n.st.dead.day === s.day - 1 && !n.st.gone) : [];
    const r = _morning(w);
    try {
      for (const n of tard) {
        const cr = ((s.rep && s.rep.crimes) || []).find((k) => k.victim === n.id);
        if (cr && !cr.known && cr.day === s.day - 1) cr.found = true;
        strange.bury(n);
      }
    } catch (e) { console.error('depouilles', e); }
    return r;
  };
  // le jour de sa mort, l'habitant n'est plus dessiné couché par npcs.draw : c'est sa dépouille qu'on voit
  const _draw = npcs.draw.bind(npcs);
  npcs.draw = function (buf, sbuf, cam, t, maxD) {
    const H = farm.s ? depouilles.aCacher() : [];
    if (!H.length) return _draw(buf, sbuf, cam, t, maxD);
    for (const n of H) n.vanished = true;
    try { return _draw(buf, sbuf, cam, t, maxD); } finally { for (const n of H) n.vanished = false; }
  };
  // ceux qui ont vu un corps en parlent
  const _sg = npcs.shortGreet.bind(npcs);
  npcs.shortGreet = function (n) {
    try { if (farm.s && n && !npcs.murdererKnown()) { const t = depouilles.nouvelle(n); if (t) return t; } } catch (e) { console.error('depouilles', e); }
    return _sg(n);
  };
  // ceux qui ont vu un corps : ils s'arrêtent, regardent, puis s'écartent (la routine reprend après)
  const _upd = npcs.update.bind(npcs);
  npcs.update = function (dt, w, c) {
    const R = [];
    for (const n of this.list) {
      if (!n._dep) continue;
      // (mort, disparu, en pleine conversation, ou mené par un autre module : la réaction s'arrête là)
      if (!n.st.alive || n.vanished || n.talking || n.hunting) { depouilles.finRecul(n); continue; }
      n.hunting = true; R.push(n);
    }
    try { _upd(dt, w, c); } finally { for (const n of R) n.hunting = false; }
    for (const n of R) { try { if (n._dep) depouilles.recul(n, dt, w); } catch (e) { console.error(e); n._dep = null; } }
  };
}
// le chien : mort de faim (chien.mourir), tué (par le fermier, une bête, un piège…)
{
  const _mourir = chien.mourir.bind(chien);
  chien.mourir = function (cause) {
    const r = _mourir(cause);
    if (r) try { depouilles.chienMort(this.cadavre(), cause); } catch (e) { console.error('depouilles', e); }
    return r;
  };
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) {
    const chienVivant = !!(e && e.kind === 'dog' && e.owner && !e.dead);
    const r = _hc(e, dmg, eye);
    try { if (chienVivant && e.dead && farm.s && farm.s.dog && !farm.s.dog.alive) depouilles.chienMort(e, 'tué', true); } catch (err) { console.error('depouilles', err); }
    return r;
  };
}
// le chasseur de primes abattu
{
  const _t = societe.toucher.bind(societe);
  societe.toucher = function (e, dmg) {
    const vivant = !!(e && !e.mort);
    const r = _t(e, dmg);
    try { if (vivant && e.mort && farm.s) depouilles.chasseurMort(e); } catch (err) { console.error('depouilles', err); }
    return r;
  };
}
// le fermier meurt (game.die → farm.recordDeath) : sa dépouille attendra le suivant ; il n'y en a pas quand on quitte la vallée
{
  const _rd = farm.recordDeath.bind(farm);
  farm.recordDeath = function (cause, place) {
    try { if (typeof game !== 'undefined' && game.dying && game.kind === 'farm' && this.s && !this.s.over) depouilles.noterFermier(cause); } catch (e) { console.error('depouilles', e); }
    return _rd(cause, place);
  };
  const _mail = farm.mail.bind(farm);
  farm.mail = function (from, title, text, extra) {
    try { if (title === 'Avis de décès' && this.s) text = depouilles.avisDeces(text); } catch (e) { console.error('depouilles', e); }
    return _mail(from, title, text, extra);
  };
}
// la pelle : un clic sur le corps l'enterre
{
  const _at = dig.at.bind(dig);
  dig.at = function (eye, f, held) {
    const t = typeof game !== 'undefined' ? game.target : null;
    if (!held && t && t.depouille && farm.s) { play.cool = 0.6; depouilles.enterrer(t.depouille); return; }
    return _at(eye, f, held);
  };
}
HOOKS.target.push((eye, f, cand) => { if (farm.s) depouilles.cible(eye, f, cand); });
HOOKS.draw.push((buf, sbuf, cam, t) => { if (farm.s) depouilles.draw(buf, sbuf, cam, t); });
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || game.kind !== 'farm') return;
  const D = depouilles;
  D.t -= dt;
  if (D.t <= 0) { D.t = 0.5; try { D.tick(); } catch (e) { console.error('depouilles', e); } }
  if (playing && !game.sleeping) { try { D.ambiance(dt); } catch (e) { console.error('depouilles', e); } }
});
HOOKS.day.push(() => { depouilles.cache.clear(); });
HOOKS.load.push((saved) => {
  const D = depouilles;
  D.cache.clear(); D.t = 0; D.dit = -99;
  if (!farm.s || !game.world) return;
  D.S();
  for (const n of npcs.list) n._dep = null;
  try { if (!saved) D.importer(); } catch (e) { console.error('depouilles : fermiers d’avant', e); }
  try { D.migrerChien(); } catch (e) { console.error('depouilles : chien', e); }
  try { D.restaurerTombes(); } catch (e) { console.error('depouilles : tombes', e); }
});
