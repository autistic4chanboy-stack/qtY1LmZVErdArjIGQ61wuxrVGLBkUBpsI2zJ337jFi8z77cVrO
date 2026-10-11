// ============================================================================
//  L'HISTOIRE (agent H17) — 3. LE JEU : la quête principale et ses scènes
//  - Huit chapitres (05-zzzzzzzH17-histoire.js). Un chapitre s'ouvre quand le
//    précédent est achevé et que son jour est venu (des) ; il s'achève quand
//    toutes ses étapes sont faites, dans n'importe quel ordre. Chaque étape se
//    lit dans ce que les autres modules retiennent déjà (les notes lues, le
//    temple, les inscriptions et les mots, les tablettes, la Zone, le Ver) :
//    rien n'oblige, rien ne se bloque, la ferme continue à côté. Ce qui a été
//    fait d'avance compte (une ancienne partie reprend au bon chapitre).
//  - Chaque chapitre s'ouvre sur une scène (h17Cine), jouée au premier moment
//    tranquille (pas pendant un danger, un panneau, un sommeil) ; plusieurs
//    chapitres d'un coup : seule la dernière scène se joue, les autres
//    rejoignent les souvenirs. L'ouverture (chapitre I) est l'arrivée d'une
//    partie neuve (cinematiques.intro, remplacée).
//  - La fin : quand le Ver est délivré (« L'aube ») ou tué (« La cendre »),
//    où qu'en soit l'histoire : une scène sur place, puis l'épilogue dans la
//    vallée (au retour, s'il le faut), puis le générique.
//  - Pour les succès (et d'autres) : un événement sur window,
//      'prairie:histoire' { type: 'debut'|'etape'|'chapitre'|'fin'|'generique'|'cinematique',
//                           chapitre, etape, fin, cine, succes }
//    et histoire.ecouter(fn). window.prairieHistoire = histoire.
//  État : farm.s.histoire = { v, ch (chapitre en cours, 0-7 ; 8 : au-delà), ouv: { c: jour }, e: { 'c.etape': jour },
//         fini: { c: jour }, fin: null|'aube'|'cendre', finJ, vus: { cine: jour }, aVoir: cine à jouer, file: [scènes de
//         la fin à jouer], ancienne: 1 (partie d'avant l'histoire) }
//  API : histoire (S, chapitre, etapes, faite, tick, jouer, rejouer, souvenirs, indice, ecouter, test),
//        H17_SCENES (les scènes : { plans, opts } ou null).
// ============================================================================
const H17_ANSELME = { skin: '#d4ad8e', hair: '#c8c0b4', hairStyle: 'court', beard: 'courte', top: '#3e3a34', bottom: '#34302a', shoe: '#2a2018', hat: 'chapeau', coat: true, old: true, build: 'mince' };
const H17_VALLEE = { ouverture: 1, c2: 1, c3: 1, c4: 1, c5: 1, c6: 1, fin_aube: 1, fin_cendre: 1 }; // scènes qui se jouent dans la vallée
const H17_SOUV_KEY = 'prairie.souvenirs';

// ---------------------------------------------------------------- les outils des scènes
const h17 = {
  monde() { return typeof qtMonde === 'function' ? qtMonde() : null; },
  sol(x, z) { const w = game.world; return Math.max(w.heightAt(x, z), w.waterLevel); },
  lieu(k) { const w = this.monde(), L = w && w.lm && w.lm[k]; return L ? { x: L.x, z: L.z, r: L.r || 20, y: this.sol(L.x, L.z) } : null; },
  // une note posée (titre de LORE_NOTES) : où elle est
  noteId(titre) { const i = LORE_NOTES.findIndex((n) => n.titre === titre); return i < 0 ? null : 'L' + i; },
  note(titre) {
    const w = this.monde(), id = this.noteId(titre);
    const it = w && id && w.inter.find((i) => i.kind === 'note' && i.id === id);
    return it ? [it.x, it.y, it.z] : null;
  },
  // une caméra dehors qui voit T, à d mètres, haut au-dessus du sol (ni dans un mur, ni sous un toit) ; a0 : d'où l'on part
  cadre(T, d, haut, a0) {
    const w = game.world;
    a0 = a0 || 0;
    let L = [];
    try { L = qtBlocs(w, T[0], T[2], d + 10); } catch (e) { L = []; }
    for (let k = 0; k < 16; k++) {
      const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * TAU / 16;
      const x = T[0] + Math.sin(a) * d, z = T[2] + Math.cos(a) * d;
      if (!w.inside(x, z, 8)) continue;
      const P = [x, Math.max(this.sol(x, z) + haut, T[1] + haut * 0.4), z];
      try {
        if (!qtScenes.libreDehors(w, L, P)) continue;
        if (!qtScenes.voit(w, L, P, T, 1)) continue;
      } catch (e) { continue; }
      return P;
    }
    return [T[0] + Math.sin(a0) * d, T[1] + haut + 18, T[2] + Math.cos(a0) * d];
  },
  vers(A, B, k) { return [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)]; },
  haut(P, dy) { return [P[0], P[1] + dy, P[2]]; },
  // la vue du joueur (un plan noir, un départ)
  joueur() { const p = game.player; return { pos: p.eyePos(), yaw: p.yaw, pitch: p.pitch }; },
  // une parole (et la phrase en aëlin : ce qu'on en comprend)
  dire(P) {
    if (!P) return { texte: '', qui: '' };
    const [qui, txt, sens] = P;
    if (!sens) return { texte: txt, qui };
    let tr = null;
    try { tr = divins.comprendre(txt, sens); } catch (e) { tr = null; }
    return { texte: tr ? `« ${txt} » (${tr})` : `« ${txt} »`, qui };
  },
  paroles(k, i) { const C = H17_CINES[k]; return this.dire(C && C.paroles && C.paroles[i]); },
  carteChapitre(id) { const C = H17_CHAPITRES.find((c) => c.id === id); return C ? { haut: H17_TEXTES.chapitre + ' ' + C.num, titre: C.titre } : null; },
  // un plan noir avec une carte
  noir(dur, carte, de) { return { dur, de: de || this.joueur(), fondu: 'noir', carte }; },
  // de la cendre qui tombe autour d'un point
  cendre(T, n) {
    for (let i = 0; i < n; i++) particles.spawn(T[0] + (Math.random() - 0.5) * 40, T[1] + 8 + Math.random() * 10, T[2] + (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 0.4, -0.5 - Math.random() * 0.4, (Math.random() - 0.5) * 0.4, [0.5, 0.48, 0.46, 0.85], 0.06, 7, 0.02, false);
  },
  // l'avant de la Grande Porte (de la façade vers la route)
  porte() {
    const w = this.monde(), P = w && w.v1porte;
    if (!P) return null;
    const S = P.sortie || { x: P.x, z: P.z - 11 };
    const dx = S.x - P.x, dz = S.z - P.z, d = Math.hypot(dx, dz) || 1;
    return { P, f: [dx / d, 0, dz / d], y: this.sol(S.x, S.z) };
  },
};

// ---------------------------------------------------------------- les scènes (chacune : { plans, opts } ou null si son lieu manque)
const H17_SCENES = {
  // ------------------------------------------------------------ I. l'arrivée : la vallée, la forêt noire, la ferme
  ouverture() {
    const w = h17.monde(), F = w && w.farm && w.farm.f, B = w && w.bld.ferme;
    if (!F || !B) return null;
    const fy = w.heightAt(F.x, F.z), bx = B.x, bz = B.z, by = B.y || fy;
    const FO = h17.lieu('foret') || { x: F.x - 400, z: F.z - 300, y: fy };
    const hy = (x, z, up) => h17.sol(x, z) + up;
    const p0 = [F.x - 420, hy(F.x - 420, F.z + 560, 190), F.z + 560];
    const pA = [lerp(F.x, FO.x, 0.35) - 120, hy(lerp(F.x, FO.x, 0.35) - 120, lerp(F.z, FO.z, 0.35) + 180, 140), lerp(F.z, FO.z, 0.35) + 180];
    const pB = [lerp(F.x, FO.x, 0.55), hy(lerp(F.x, FO.x, 0.55), lerp(F.z, FO.z, 0.55) + 60, 85), lerp(F.z, FO.z, 0.55) + 60];
    const p2 = [F.x - 200, hy(F.x - 200, F.z + 260, 70), F.z + 260], p3 = [F.x - 80, hy(F.x - 80, F.z + 95, 38), F.z + 95];
    const foret = [FO.x, FO.y + 12, FO.z], a3 = Math.atan2(p3[0] - bx, p3[2] - bz);
    return {
      opts: { h: 7.4, musique: H17_MUSIQUES.ouverture },
      plans: [
        { dur: 3.4, de: { pos: p0, look: foret }, fondu: 'noir', carte: { titre: H17_TITRE_JEU } },
        { dur: 9, chemin: [{ pos: p0, look: [F.x + 120, fy + 30, F.z - 700] }, { pos: pA, look: foret }, { pos: pB, look: [FO.x, FO.y + 4, FO.z] }], ease: 'lin', ...h17.paroles('ouverture', 0) },
        { dur: 7.5, chemin: [{ pos: pB, look: [FO.x, FO.y + 4, FO.z] }, { pos: p2, look: [bx, by, bz] }, { pos: p3, look: [bx, by + 3, bz] }], ...h17.paroles('ouverture', 1) },
        { dur: 6, orbite: { c: [bx, by + 2, bz], r: 24, h: 9, a0: a3, a1: a3 + 0.9, look: [bx, by + 2.5, bz] }, ...h17.paroles('ouverture', 2) },
        { dur: 3.2, de: { pos: [bx + 8, by + 3, bz + 8], look: [bx, by + 1.5, bz] }, fondu: 'noir', carte: h17.carteChapitre('c1') },
      ],
    };
  },
  // ------------------------------------------------------------ II. le cimetière au soir : Anselme, de dos
  c2() {
    const N = h17.note('Une tombe sans date') || (() => { const L = h17.lieu('cimetiere'); return L && [L.x, L.y + 0.4, L.z]; })();
    if (!N) return null;
    const T = [N[0], h17.sol(N[0], N[2]) + 1.2, N[2]];
    const C = h17.cadre(T, 15, 3.2, 0.4), dir = [T[0] - C[0], 0, T[2] - C[2]], dl = Math.hypot(dir[0], dir[2]) || 1;
    const f = [dir[0] / dl, 0, dir[2] / dl];
    const pied = (k) => { const x = T[0] + f[0] * k, z = T[2] + f[2] * k; return [x, h17.sol(x, z), z]; };
    const cap = Math.atan2(f[0], f[2]);
    const C2 = h17.vers(C, T, 0.3), C3 = h17.vers(C, T, 0.45);
    return {
      opts: { h: 18.1, musique: H17_MUSIQUES.c2 },
      plans: [
        h17.noir(2.8, h17.carteChapitre('c2')),
        { dur: 7, de: { pos: C, look: T }, a: { pos: C2, look: h17.haut(T, 0.3) }, ...h17.paroles('c2', 0), figurants: [{ look: H17_ANSELME, de: pied(2.2), cap }] },
        { dur: 6.5, de: { pos: C2, look: h17.haut(T, 0.3) }, a: { pos: C3, look: h17.haut(pied(5), 1.2) }, ...h17.paroles('c2', 1), figurants: [{ look: H17_ANSELME, de: pied(2.2), a: pied(9) }],
          debut: () => { sound.crow && sound.crow(0.6); } },
        { dur: 1.6, de: { pos: C3, look: h17.haut(pied(9), 1.2) }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ III. la cascade à l'aube : une voix dans l'eau
  c3() {
    const L = h17.lieu('cascade');
    if (!L) return null;
    const T = [L.x, L.y + 4, L.z], C = h17.cadre(T, 28, 6, 0), C2 = h17.vers(C, T, 0.5);
    return {
      opts: { h: 5.9, musique: H17_MUSIQUES.c3 },
      plans: [
        h17.noir(2.8, h17.carteChapitre('c3')),
        { dur: 7, de: { pos: C, look: T }, a: { pos: h17.vers(C, T, 0.25), look: h17.haut(T, 2) }, ...h17.paroles('c3', 0), debut: () => { sound.whisper && sound.whisper(0, 0.4); } },
        { dur: 5, de: { pos: h17.vers(C, T, 0.25), look: h17.haut(T, 2) }, a: { pos: C2, look: h17.haut(T, -1.5) }, debut: () => { sound.whisper && sound.whisper(-0.5, 0.35); } },
        { dur: 1.4, de: { pos: C2, look: h17.haut(T, -1.5) }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ IV. une pierre levée, le soir : ce qui est gravé
  c4() {
    const L = h17.lieu('dolmen') || h17.lieu('menhirs') || h17.lieu('cercle');
    if (!L) return null;
    const T = [L.x, L.y + 1.4, L.z], a0 = 2.2;
    return {
      opts: { h: 17.6, musique: H17_MUSIQUES.c4 },
      plans: [
        h17.noir(2.8, h17.carteChapitre('c4')),
        { dur: 8, orbite: { c: T, r: 13, h: 3, a0, a1: a0 + 0.8, look: T }, ...h17.paroles('c4', 0) },
        { dur: 4.5, orbite: { c: T, r: 6, h: 1, a0: a0 + 0.8, a1: a0 + 1.1, look: h17.haut(T, -0.4) } },
        { dur: 1.4, de: { pos: [T[0] + 6, T[1] + 1, T[2]], look: T }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ V. le cercle de pierres, la nuit
  c5() {
    const L = h17.lieu('cercle') || h17.lieu('menhirs') || h17.lieu('dolmen');
    if (!L) return null;
    const T = [L.x, L.y + 1.2, L.z], r = Math.max(14, Math.min(30, (L.r || 20) * 0.9));
    const pts = [0, 1, 2].map((k) => { const a = 0.5 + k * 0.55, x = T[0] + Math.sin(a) * r, z = T[2] + Math.cos(a) * r; return { pos: [x, h17.sol(x, z) + 4 - k, z], look: T }; });
    return {
      opts: { h: 22.4, musique: H17_MUSIQUES.c5 },
      plans: [
        h17.noir(2.8, h17.carteChapitre('c5')),
        { dur: 9, chemin: pts, ...h17.paroles('c5', 0), debut: () => { sound.rumble && sound.rumble(); } },
        { dur: 1.4, de: pts[2], fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ VI. la Grande Porte au crépuscule ; Anselme y entre
  c6() {
    const G = h17.porte();
    if (!G) return null;
    const { P, f } = G, y0 = G.y;
    const at = (d, h) => { const x = P.x + f[0] * d, z = P.z + f[2] * d; return [x, Math.max(h17.sol(x, z), y0) + h, z]; };
    const seuil = at(2, 0), haut = [P.x, P.y + 17, P.z];
    return {
      opts: { h: 19.3, musique: H17_MUSIQUES.c6 },
      plans: [
        h17.noir(2.8, h17.carteChapitre('c6')),
        { dur: 8, chemin: [{ pos: at(75, 9), look: at(0, 8) }, { pos: at(48, 6), look: at(0, 10) }, { pos: at(28, 3), look: haut }], ...h17.paroles('c6', 0) },
        { dur: 7, de: { pos: at(22, 2.2), look: h17.haut(seuil, 2) }, a: { pos: at(16, 2), look: h17.haut(seuil, 3) }, ...h17.paroles('c6', 1),
          figurants: [{ look: H17_ANSELME, de: at(12, 0), a: at(1, 0) }] },
        { dur: 1.6, de: { pos: at(16, 2), look: h17.haut(seuil, 3) }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ VII. les Terres d'Avant : le regard monte vers le Pic
  c7() {
    const e = game.player.eyePos();
    let cible = null;
    try { if (typeof zone !== 'undefined' && zone.dedans && zone.Z && typeof dragonV3 !== 'undefined') { const A = dragonV3.lieux().aire; cible = [A.x, A.y + 10, A.z]; } } catch (e2) { cible = null; }
    if (!cible) { const G = h17.porte(); cible = G ? [G.P.x, G.P.y + 12, G.P.z] : [e[0], e[1] + 30, e[2] - 200]; }
    const dx = cible[0] - e[0], dz = cible[2] - e[2], d = Math.hypot(dx, dz) || 1, loin = [e[0] + dx / d * 60, e[1] + 2, e[2] + dz / d * 60];
    return {
      opts: { musique: H17_MUSIQUES.c7 },
      plans: [
        h17.noir(2.8, h17.carteChapitre('c7')),
        { dur: 8, de: { pos: e, look: loin }, a: { pos: h17.haut(e, 4), look: cible }, ...h17.paroles('c7', 0), debut: () => { sound.rumble && sound.rumble(); } },
        { dur: 1.4, de: { pos: h17.haut(e, 4), look: cible }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ VIII. l'aire, en haut du Pic ; le carnet du Guet
  c8() {
    const e = game.player.eyePos();
    let A = null;
    try { if (typeof zone !== 'undefined' && zone.dedans && zone.Z && typeof dragonV3 !== 'undefined') A = dragonV3.lieux().aire; } catch (e2) { A = null; }
    const plans = [h17.noir(2.8, h17.carteChapitre('c8'))];
    if (A) {
      const T = [A.x, A.y + 3, A.z], o = (a, r, h) => [A.x + Math.sin(a) * r, A.y + h, A.z + Math.cos(a) * r];
      plans.push({ dur: 7, chemin: [{ pos: o(0.3, 140, 60), look: T }, { pos: o(0.8, 90, 40), look: T }, { pos: o(1.2, 55, 22), look: T }], ...h17.paroles('c8', 0) });
      plans.push({ dur: 6.5, orbite: { c: T, r: 40, h: 14, a0: 1.2, a1: 1.7, look: T }, ...h17.paroles('c8', 1) });
      plans.push({ dur: 1.4, de: { pos: o(1.7, 40, 17), look: T }, fondu: 'noir' });
    } else {
      plans.push({ dur: 6.5, de: { pos: e, look: h17.haut(e, 6) }, a: { pos: h17.haut(e, 1), look: h17.haut(e, 40) }, ...h17.paroles('c8', 0) });
      plans.push({ dur: 6, de: { pos: h17.haut(e, 1), look: h17.haut(e, 40) }, ...h17.paroles('c8', 1) });
      plans.push({ dur: 1.4, de: { pos: h17.haut(e, 1), look: h17.haut(e, 40) }, fondu: 'noir' });
    }
    return { opts: { musique: H17_MUSIQUES.c8 }, plans };
  },
  // ------------------------------------------------------------ la fin, sur place : le regard monte au ciel
  finale(fin) {
    const e = game.player.eyePos(), p = game.player, f = [-Math.sin(p.yaw), 0, -Math.cos(p.yaw)];
    const devant = [e[0] + f[0] * 30, e[1] + 2, e[2] + f[2] * 30], ciel = [e[0] + f[0] * 30, e[1] + 45, e[2] + f[2] * 30];
    const P = fin === 'cendre' ? H17_CINES.finale.parolesCendre[0] : H17_CINES.finale.paroles[0];
    return {
      opts: {},
      plans: [
        { dur: 7, de: { pos: e, look: devant }, a: { pos: h17.haut(e, 3), look: ciel }, ...h17.dire(P),
          chaque: (t, dt) => { if (fin === 'cendre' && Math.random() < (dt || 0.02) * 4) h17.cendre(ciel, 2); } },
        { dur: 2.2, de: { pos: h17.haut(e, 3), look: ciel }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ L'aube : la ferme au matin, la pierre d'Anselme
  fin_aube() {
    const w = h17.monde(), B = w && w.bld.ferme, F = w && w.farm && w.farm.f;
    if (!B || !F) return null;
    const by = B.y || w.heightAt(B.x, B.z), M = [B.x, by + 2, B.z];
    const N = h17.note('Une tombe sans date'), T = N ? [N[0], h17.sol(N[0], N[2]) + 1, N[2]] : null;
    const C1 = h17.cadre(M, 40, 12, 3.6), C2 = h17.vers(C1, M, 0.45);
    const plans = [
      h17.noir(1.6),
      { dur: 7, chemin: [{ pos: C1, look: M }, { pos: h17.vers(C1, M, 0.25), look: M }, { pos: C2, look: h17.haut(M, -1) }], ...h17.paroles('fin_aube', 0), h: 6.3 },
    ];
    if (T) { const CT = h17.cadre(T, 12, 2.6, 0.4); plans.push({ dur: 6, de: { pos: CT, look: T }, a: { pos: h17.vers(CT, T, 0.3), look: T }, ...h17.paroles('fin_aube', 1), h: 6.8 }); }
    plans.push({ dur: 7, orbite: { c: M, r: 34, h: 14, a0: 3.6, a1: 4.5, look: M }, ...h17.paroles('fin_aube', 2), h: 7.2 });
    const v5 = farm.s && farm.s.v5 && H17_V5[farm.s.v5.fin];
    if (v5) plans.push({ dur: 5.5, orbite: { c: M, r: 60, h: 30, a0: 4.5, a1: 4.9, look: M }, texte: v5, h: 7.6 });
    plans.push({ dur: 3.6, de: { pos: [M[0] + 30, M[1] + 20, M[2]], look: M }, fondu: 'noir', carte: { haut: H17_TEXTES.fin, titre: H17_FINS.aube.titre } });
    return { opts: { h: 6.3, musique: H17_MUSIQUES.fin_aube, garderMusique: true }, plans };
  },
  // ------------------------------------------------------------ La cendre : la vallée au soir, la Porte, trois coups
  fin_cendre() {
    const w = h17.monde(), B = w && w.bld.ferme;
    if (!B) return null;
    const by = B.y || w.heightAt(B.x, B.z), M = [B.x, by + 2, B.z];
    const C1 = h17.cadre(M, 46, 16, 2.4), CP = h17.cadre(M, 9, 1.7, 2.4);
    const G = h17.porte();
    const plans = [
      h17.noir(1.6),
      { dur: 7.5, de: { pos: C1, look: M }, a: { pos: h17.vers(C1, M, 0.2), look: M }, ...h17.paroles('fin_cendre', 0), h: 19.6,
        chaque: (t, dt) => { if (Math.random() < (dt || 0.02) * 6) h17.cendre(h17.vers(C1, M, 0.5), 3); } },
    ];
    if (G) {
      const at = (d, h) => { const x = G.P.x + G.f[0] * d, z = G.P.z + G.f[2] * d; return [x, Math.max(h17.sol(x, z), G.y) + h, z]; };
      plans.push({ dur: 6, de: { pos: at(60, 8), look: at(0, 9) }, a: { pos: at(40, 5), look: at(0, 11) }, ...h17.paroles('fin_cendre', 1), h: 22.8 });
    }
    plans.push({ dur: 6, de: { pos: CP, look: M }, a: { pos: h17.vers(CP, M, 0.15), look: h17.haut(M, -0.6) }, ...h17.paroles('fin_cendre', 2), h: 23.4,
      debut: () => { setTimeout(() => { if (cine.on) sound.knock && sound.knock(3); }, 900); } });
    plans.push({ dur: 3.6, de: { pos: CP, look: M }, fondu: 'noir', carte: { haut: H17_TEXTES.fin, titre: H17_FINS.cendre.titre } });
    return { opts: { h: 19.6, musique: H17_MUSIQUES.fin_cendre, garderMusique: true }, plans };
  },
  // ------------------------------------------------------------ le générique
  generique() {
    return { opts: { musique: H17_MUSIQUES.generique, garderMusique: true }, plans: [{ dur: 26, de: h17.joueur(), fondu: 'noir', generique: true }, { dur: 1.2, de: h17.joueur(), fondu: 'noir' }] };
  },
};
// la lumière d'un plan (son heure : plan.h)
{
  const _next = cine.next.bind(cine);
  cine.next = function () {
    const r = _next();
    const N = this.on && this.opts && this.opts.tenir && this.plans && this.plans[this.i];
    if (N && N.h !== undefined && typeof qtScenes !== 'undefined') qtScenes.lumiere({ h: N.h, dedans: false, lum: [] });
    return r;
  };
}

// ---------------------------------------------------------------- l'histoire
const histoire = {
  auditeurs: [], tickT: 0, pretT: 0, joue: null, indiceT: 0,
  S() {
    const s = farm.s;
    if (!s) return null;
    const H = s.histoire || (s.histoire = { v: 1, ch: 0 });
    for (const k of ['ouv', 'e', 'fini', 'vus']) if (!H[k] || typeof H[k] !== 'object') H[k] = {};
    if (!Array.isArray(H.file)) H.file = [];
    if (typeof H.ch !== 'number' || !(H.ch >= 0)) H.ch = 0;
    if (H.fin === undefined) H.fin = null;
    return H;
  },
  chapitre() { const H = this.S(); return H && !H.fin ? H17_CHAPITRES[H.ch] || null : null; },
  faite(c, e) { const H = this.S(); return !!(H && H.e[c + '.' + e]); },
  // les étapes du chapitre en cours qui restent
  restantes() { const C = this.chapitre(); return C ? C.etapes.filter((E) => !this.faite(C.id, E.id)) : []; },
  ouvert(c) { const H = this.S(); return !!(H && H.ouv[c]); },

  // ------------------------------------------------------------- les étapes : ce que la partie retient déjà
  noteLue(titre) { const id = h17.noteId(titre); return !!(id && farm.s.notes && farm.s.notes[id]); },
  TESTS: {
    lettre: () => histoire.noteLue('Lettre à celui qui viendra') || histoire.noteLue('Journal d’Anselme, avril'),
    nuit: () => farm.s.day >= 2,
    tombe: () => histoire.noteLue('Une tombe sans date'),
    page: () => histoire.noteLue('Dernière page d’Anselme'),
    temple: () => typeof temple !== 'undefined' && (!!temple.S().vu || temple.ouvert()),
    trois: () => typeof temple !== 'undefined' && temple.ouvert(),
    pierres: () => { const L = farm.s.livres && farm.s.livres.ins; return !!L && Object.keys(L).length >= 3; },
    mots: () => typeof savoir !== 'undefined' && savoir.motsConnus('aelin').length + savoir.motsConnus('gorrain').length >= 6,
    tablettes: () => typeof runes !== 'undefined' && runes.nTablettes() >= R15_REGL.tablettes,
    cercle: () => typeof runes !== 'undefined' && (runes.S().n || 0) >= 1,
    aller: () => savoir.lieuConnu('grande_porte') || (typeof zone !== 'undefined' && zone.S().entrees > 0),
    passer: () => typeof zone !== 'undefined' && zone.S().entrees > 0,
    feu: () => typeof zone !== 'undefined' && Object.keys(zone.S().feux).length > 0,
    carnet: () => typeof dragonV3 !== 'undefined' && !!(dragonV3.S().carnet || dragonV3.S().lus.carnet),
    cle: () => typeof dragonV3 !== 'undefined' && !!(dragonV3.S().cle || dragonV3.S().fin),
    choix: () => typeof dragonV3 !== 'undefined' && !!dragonV3.S().fin,
  },
  test(id) { try { const f = this.TESTS[id]; return !!(f && f()); } catch (e) { return false; } },
  // la fin du Ver (V3), traduite : 'aube' | 'cendre' | null
  finV3() { try { const f = farm.s.v3 && farm.s.v3.fin; return f === 'delivre' ? 'aube' : f === 'tue' ? 'cendre' : null; } catch (e) { return null; } },

  // ------------------------------------------------------------- pour les succès
  ecouter(fn) { if (typeof fn === 'function') this.auditeurs.push(fn); },
  dire(type, o) {
    const d = Object.assign({ type }, o || {});
    if (type === 'chapitre') d.succes = 'histoire_' + d.chapitre;
    if (type === 'fin') d.succes = 'histoire_fin_' + d.fin;
    if (type === 'generique') d.succes = 'histoire_generique';
    for (const fn of this.auditeurs) try { fn(d); } catch (e) { console.error(e); }
    try { if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('prairie:histoire', { detail: d })); } catch (e) { /* rien */ }
  },

  // ------------------------------------------------------------- avancer (deux fois par seconde)
  tick(o) {
    o = o || {};
    const H = this.S(), s = farm.s;
    if (!H || s.over) return;
    const f = this.finV3();
    if (f && !H.fin) { this.finir(f, o); return; }
    if (H.fin) return;
    for (let garde = 0; garde < H17_CHAPITRES.length + 1; garde++) {
      const C = H17_CHAPITRES[H.ch];
      if (!C) break;
      if (!H.ouv[C.id]) {
        if (s.day < C.des) break;
        H.ouv[C.id] = s.day;
        this.dire('debut', { chapitre: C.id });
        if (C.id !== 'c1') {
          if (H.aVoir && H.aVoir !== C.cine) this.souvenir(H.aVoir);
          H.aVoir = C.cine;
          this.pretT = 2.5;
        }
      }
      let neuf = false;
      for (const E of C.etapes) {
        const k = C.id + '.' + E.id;
        if (!H.e[k] && this.test(E.id)) { H.e[k] = s.day; neuf = true; this.dire('etape', { chapitre: C.id, etape: E.id }); }
      }
      if (C.etapes.every((E) => H.e[C.id + '.' + E.id])) {
        H.fini[C.id] = s.day;
        this.dire('chapitre', { chapitre: C.id });
        H.ch++;
        continue;
      }
      if (neuf && !o.silence) this.indice(1.5);
      break;
    }
  },
  // la fin : le Ver délivré ou tué
  finir(fin, o) {
    const H = this.S(), s = farm.s;
    o = o || {};
    H.fin = fin; H.finJ = s.day;
    const C = H17_CHAPITRES[H.ch];
    if (C && C.id === 'c8') { for (const E of C.etapes) if (!H.e['c8.' + E.id]) H.e['c8.' + E.id] = s.day; H.fini.c8 = s.day; this.dire('chapitre', { chapitre: 'c8' }); }
    H.ch = H17_CHAPITRES.length;
    if (H.aVoir) { this.souvenir(H.aVoir); H.aVoir = null; }
    this.dire('fin', { chapitre: C ? C.id : null, fin });
    if (o.silence) { for (const k of ['finale', H17_FINS[fin].cine]) this.souvenir(k); H.file = []; }
    else { H.file = ['finale', H17_FINS[fin].cine, 'generique']; this.pretT = 1.5; }
  },
  // une scène qu'on n'a pas vue jouer, mais qui rejoint les souvenirs
  souvenir(k) {
    const H = this.S();
    if (H && !H.vus[k]) H.vus[k] = farm.s.day;
    try { const G = store.get(H17_SOUV_KEY, {}) || {}; if (!G[k]) { G[k] = 1; store.set(H17_SOUV_KEY, G); } } catch (e) { /* rien */ }
  },
  souvenirs() {
    const H = this.S(), G = (() => { try { return store.get(H17_SOUV_KEY, {}) || {}; } catch (e) { return {}; } })();
    return H17_ORDRE_CINES.filter((k) => (H && H.vus[k]) || G[k]);
  },

  // ------------------------------------------------------------- jouer une scène
  // un moment tranquille ? (monde : la scène veut la vallée)
  peutJouer(k) {
    if (!game.started || game.mode !== 'play' || game.dying || game.sleeping || ui.panel || cine.on || (farm.s && farm.s.over)) return false;
    if (typeof navigator !== 'undefined' && navigator.webdriver && !h17Cine.auto) return false;
    const f = typeof document !== 'undefined' && $('#fade');
    if (f && f.classList.contains('open')) return false;
    if (typeof play !== 'undefined' && play.hurtFlash > 0.05) return false;
    if (typeof strange !== 'undefined' && (strange.fear > 0.15 || strange.inEnvers() || strange.redNight() || strange.freezeT > 0)) return false;
    if (typeof evenements !== 'undefined' && evenements.noirK > 0.3) return false;
    if (typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel()) return false;
    if (corps && corps.hisse) return false;
    if (H17_VALLEE[k] && (!h17.monde() || (typeof zone !== 'undefined' && zone.dedans) || game.player.underground)) return false;
    // dans les Terres d'Avant : pas si quelque chose vous cherche, ni pendant une attaque du Ver
    if (typeof zone !== 'undefined' && zone.dedans) {
      if (typeof furtif !== 'undefined' && (furtif.max || 0) >= 1) return false;
      try { if (typeof dragonV3 !== 'undefined' && dragonV3.enAttaque && dragonV3.D && dragonV3.enAttaque()) return false; } catch (e) { /* rien */ }
    }
    return true;
  },
  // k : une clé de H17_SCENES ; rejeu : depuis les souvenirs (rien ne change dans la partie)
  jouer(k, rejeu) {
    const B = H17_SCENES[k], H = this.S();
    if (!B || !H) return Promise.resolve(false);
    let sc = null;
    try { sc = B(H.fin); } catch (e) { console.error('histoire : scène ' + k, e); sc = null; }
    if (!sc) { if (!rejeu) { this.souvenir(k); this.apres(k); } return Promise.resolve(false); }
    const premier = !H.vus[k];
    this.souvenir(k);
    if (!rejeu && premier) this.dire('cinematique', { cine: k, chapitre: (H17_CINES[k] && H17_CINES[k].chapitre) || null });
    this.joue = k;
    // (la suite se décide à la fin de la scène, jouée ou passée, sans attendre la promesse)
    const apres = () => { this.joue = null; if (!rejeu) this.apres(k); else if (k === 'fin_aube' || k === 'fin_cendre') this.rejeuGen = true; };
    return h17Cine.jouer(sc.plans, Object.assign({}, sc.opts, { cle: k, apres }));
  },
  // après une scène : l'indice, la suite
  apres(k) {
    const H = this.S();
    if (!H) return;
    if (k === 'generique') { if (!H.gen) { H.gen = farm.s.day; this.dire('generique', { fin: H.fin }); } farm.save(); return; }
    if (k === 'fin_aube' || k === 'fin_cendre') { this.pretT = 0.15; return; } // le générique suit tout de suite
    if (k === 'finale') { this.pretT = 1.2; return; }
    this.indice(0.8);
  },
  rejouer(k) {
    if (cine.on || !H17_SCENES[k]) return Promise.resolve(false);
    if (H17_VALLEE[k] && (!h17.monde() || (typeof zone !== 'undefined' && zone.dedans) || game.player.underground)) { ui.subtitle('', '(Pas d’ici.)', 3); return Promise.resolve(false); }
    ui.close(true);
    return this.jouer(k, true);
  },
  // ------------------------------------------------------------- chaque image
  update(dt) {
    if (!farm.s || !game.started) return;
    this.tickT -= dt;
    if (this.tickT <= 0) { this.tickT = 0.5; this.tick(); }
    const H = this.S();
    if (this.indiceT > 0 && !cine.on) { this.indiceT -= dt; if (this.indiceT <= 0) this.montrerIndice(); }
    if (cine.on || h17Cine.on) return;
    this.joue = null;
    if (this.pretT > 0) { this.pretT -= dt; return; }
    // un épilogue revu depuis les souvenirs : le générique suit
    if (this.rejeuGen) { this.rejeuGen = false; if (!game.dying && !ui.panel) this.jouer('generique', true); return; }
    if (H.file.length) {
      const k = H.file[0];
      if (!this.peutJouer(k)) return;
      H.file.shift();
      this.jouer(k);
      return;
    }
    if (H.aVoir && this.peutJouer(H.aVoir)) {
      const k = H.aVoir;
      H.aVoir = null;
      this.jouer(k);
    }
  },
  // ------------------------------------------------------------- l'indice discret, à l'écran (quelques secondes)
  indice(delai) { this.indiceT = Math.max(0.01, delai || 0.01); },
  montrerIndice() {
    const C = this.chapitre(), R = this.restantes();
    if (!C || !R.length || !this.ouvert(C.id) || typeof document === 'undefined' || cine.on) return;
    let el = $('#h17-but');
    if (!el) {
      const st = document.createElement('style');
      st.textContent = `#h17-but{position:fixed;left:22px;top:54px;max-width:min(420px,70vw);color:#e8e0cc;font:13px/1.4 Georgia,serif;text-shadow:0 1px 2px #000;opacity:0;transition:opacity 1.2s;pointer-events:none;z-index:20}
#h17-but.on{opacity:.85}#h17-but small{display:block;font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#b8a888}
body.cine #h17-but{visibility:hidden}`;
      document.head.appendChild(st);
      el = document.createElement('div');
      el.id = 'h17-but';
      document.body.appendChild(el);
    }
    el.innerHTML = `<small>${esc(H17_TEXTES.chapitre + ' ' + C.num + ' · ' + C.titre)}</small>${esc(R[0].texte)}`;
    el.classList.add('on');
    clearTimeout(this._butT);
    this._butT = setTimeout(() => el.classList.remove('on'), 7000);
  },
};
if (typeof window !== 'undefined') window.prairieHistoire = histoire;

// ---------------------------------------------------------------- l'arrivée d'une partie neuve : l'ouverture de l'histoire
cinematiques.intro = function () { return histoire.jouer('ouverture'); };

// ---------------------------------------------------------------- branchements
HOOKS.update.push(Object.assign((dt) => { try { histoire.update(dt); } catch (e) { if (!histoire._err) { histoire._err = true; console.error('histoire', e); } } }, { zone: true }));
// au chargement : une partie d'avant l'histoire reprend au bon chapitre (sans rejouer ce qui est passé)
HOOKS.load.push((saved) => {
  histoire.joue = null; histoire.pretT = 3; histoire.tickT = 0.5; histoire.indiceT = 0;
  if (!farm.s) return;
  const neuve = !farm.s.histoire;
  const H = histoire.S();
  if (saved && neuve) {
    H.ancienne = 1;
    try { histoire.tick({ silence: true }); } catch (e) { console.error('histoire : reprise', e); }
    // ce qui a été fait d'avance rejoint les souvenirs ; seule la scène du chapitre en cours reste à voir
    for (const C of H17_CHAPITRES) if (H.fini[C.id] && C.cine !== H.aVoir) histoire.souvenir(C.cine);
  }
  // une fin déjà jouée d'une partie d'avant : rien à rejouer
  if (saved && H.fin && neuve) H.file = [];
  if (saved && !H.fin) histoire.indice(6);
});
