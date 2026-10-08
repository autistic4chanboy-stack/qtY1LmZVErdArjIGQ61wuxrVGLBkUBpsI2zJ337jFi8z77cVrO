// Équilibrage des runes (agent R15, quinzième vague)
//   node tools/equilibrage.js R15
// - La pose (graine 1234, puis une autre) : quatre tablettes, trois autour de la ferme, de Valbrume et de Clairpré
//   (au sec, à plat, hors des murs, des chemins, des champs ; au pied d'un arbre ou d'un rocher), la quatrième au fond
//   d'un cul-de-sac des Galeries, qu'on atteint depuis l'échelle sans passer la dalle ; les douze runes, chacune sur une
//   seule tablette ; le caveau du bois (en forêt, au sec, à pied depuis la ferme, sans rien d'autre dedans) ; la niche
//   des Galeries (la dalle ne ferme qu'un cul-de-sac) ; le tertre des Terres d'Avant (aux Tertres).
// - Rien de ce qui était posé ne bouge : empreinte 1234, trouvailles de R (signature), listes allongées seulement.
// - Les règles : la lecture des assemblages (36 effets, 3 dalles), une fois par jour, un seul effet durable, la pierre
//   endormie avant les quatre tablettes ; les forces (bornées) ; la valeur des trois coffres (au plus trois journées de
//   travail du début, en tout).
'use strict';
const { vallee, empreinte, EMPREINTE_1234 } = require('./vm.js');

const JOURNEE_DEBUT = 375; // pièces (domaine commerce)
const BORNES = {
  recolte: [1.4, 0.7], chance: [0.5, 0.6], peche: [0.65, 0.4], pas: [1.15, 0.85], faim: [0.35, 0.4],
  filH: [6, 14], darJ: [3, 8], coffres: 3 * JOURNEE_DEBUT, passeMs: 2500,
};
const ANNEAUX = { ferme: [30, 190], valbrume: [85, 270], clairpre: [35, 210] };

module.exports = {
  titre: 'Les runes (R15) : tablettes, dalles scellées, assemblages',
  async verifier(J, log) {
    const E = [];
    const ko = (m) => { E.push(m); log('  ÉCHEC : ' + m); };
    const t0 = Date.now();
    const w = await vallee(J, 1234);
    log(`(vallée 1234 générée en ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    J.ctx.__w = w;
    const R = w.r15;
    if (!R) { ko('pas de w.r15'); return { echecs: E.length }; }

    // ---------------------------------------------------------------- 1. rien ne bouge
    log('\n# 1. Ce qui était posé ne bouge pas');
    const emp = empreinte(w, [98896, 1308, 516]);
    log(`empreinte 1234 : ${emp === EMPREINTE_1234 ? 'inchangée' : 'CHANGÉE ' + emp} ; passe : ${R.ms} ms ; ajouté : ${w.props.length - R.avant.p} objet(s) posé(s), ${w.inter.length - R.avant.i} interaction(s), ${w.blocks.length - R.avant.b} bloc(s), 0 objet`);
    if (emp !== EMPREINTE_1234) ko('empreinte 1234 changée');
    if (w.objects.length !== R.avant.o) ko('des objets ajoutés à w.objects');
    if (R.ms > BORNES.passeMs) ko(`la passe prend ${R.ms} ms`);
    const sig = J.ev('ramGen.signature(__w.ramasse.L)');
    log(`trouvailles de R : ${w.ramasse.L.length}, signature ${sig === R.avant.ram && sig === w.ramasse.sig ? 'inchangée' : 'CHANGÉE'}`);
    if (sig !== R.avant.ram || sig !== w.ramasse.sig) ko('les trouvailles de R ont changé');

    // ---------------------------------------------------------------- 2. les tablettes
    log('\n# 2. Les tablettes');
    const pose = this.tablettes(J, w, ko, log);
    // ---------------------------------------------------------------- 3. les dalles
    log('\n# 3. Les dalles scellées');
    this.caveau(J, w, ko, log);
    this.niche(J, w, ko, log);

    // ---------------------------------------------------------------- 4. une autre graine
    log('\n# 4. Une autre graine (4242)');
    {
      const J2 = require('./vm.js').charger();
      const w2 = await vallee(J2, 4242);
      const R2 = w2.r15;
      const n = R2 ? R2.tablettes.length : 0;
      log(`tablettes : ${n} (${R2 ? R2.tablettes.map((T) => T.lieu).join(', ') : '—'}) ; dalles : ${R2 ? Object.keys(R2.portes).join(', ') : '—'}`);
      if (n !== 4) ko(`graine 4242 : ${n} tablettes`);
      if (!R2 || !R2.portes.caveau || !R2.portes.niche) ko('graine 4242 : une dalle manque');
      if (R2 && pose && R2.tablettes.every((T, i) => pose[i] && Math.abs(T.x - pose[i].x) < 1)) ko('les tablettes ne changent pas de place d’une partie à l’autre');
    }

    // ---------------------------------------------------------------- 5. les Terres d'Avant
    log('\n# 5. Le tertre des Terres d’Avant');
    {
      const Z = await J.ev('zoneGen.generer(zone.graine(), () => {})');
      J.ctx.__Z = Z;
      const P = Z.r15 && Z.r15.portes.tertre;
      if (!P) ko('pas de tertre scellé dans la Zone');
      else {
        const reg = J.avec({ x: P.x, z: P.z }, 'zone.region(__v.x, __v.z)');
        log(`le tertre : ${Math.round(P.x)}, ${Math.round(P.z)} (${reg}), ${(P.y - Z.waterLevel).toFixed(1)} m au-dessus de l'eau`);
        if (reg !== 'tertres') ko('le tertre n’est pas aux Tertres');
        if (P.y < Z.waterLevel + 0.5) ko('le tertre est dans l’eau');
        if (!Z.inter.some((i) => i.kind === 'r15_porte' && i.data.porte === 'tertre')) ko('la dalle du tertre n’a pas d’interaction');
      }
    }

    // ---------------------------------------------------------------- 6. les règles
    log('\n# 6. Les règles et les forces');
    this.regles(J, ko, log);
    return { echecs: E.length };
  },

  tablettes(J, w, ko, log) {
    const R = w.r15, WL = w.waterLevel, T = R.tablettes;
    if (T.length !== 4) ko(`${T.length} tablettes (4 attendues)`);
    const centres = { ferme: w.lm.ferme, valbrume: w.townInfo || w.lm.place, clairpre: w.lm.hameau };
    const toutes = [];
    for (const t of T) {
      toutes.push(...t.runes);
      const ri = w.inter.filter((i) => i.kind === 'r15_tablette' && i.data.i === t.i).length;
      if (t.sous) { log(`tablette ${t.i + 1} (le Dessous) : ${t.x}, ${t.z}, y ${t.y} ; runes ${t.runes.join(' ')}`); if (ri !== 1) ko(`tablette ${t.i + 1} : ${ri} interaction(s)`); continue; }
      const C = centres[t.lieu], d = C ? Math.hypot(C.x - t.x, C.z - t.z) : -1, A = ANNEAUX[t.lieu];
      const h = w.heightAt(t.x, t.z), mat = w.matAt(t.x, t.z), pente = w.normalAt(t.x, t.z)[1];
      let bloc = false;
      w.query(t.x, t.z, 1.2, null, (b) => { if (b.hidden) return; const [lx, lz] = J.ev('World').blockLocal(b, t.x, t.z); if (Math.abs(lx) < b.sx / 2 + 0.4 && Math.abs(lz) < b.sz / 2 + 0.4 && b.y < h + 1.5 && b.y + b.sy > h) bloc = true; });
      let pres = 99;
      for (const i of w.inter) if (!(i.kind === 'r15_tablette')) pres = Math.min(pres, Math.hypot(i.x - t.x, i.z - t.z));
      let arbre = 99;
      w.query(t.x, t.z, 4, (o) => { const ty = J.ev('OBJ_TYPES')[o.t]; if (!o.gone && ty && (ty.cat === 'Arbres' || ty.id === 'rock' || ty.id === 'stump')) arbre = Math.min(arbre, Math.hypot(o.x - t.x, o.z - t.z)); }, null);
      log(`tablette ${t.i + 1} (${t.lieu}) : ${Math.round(d)} m du centre ; ${(h - WL).toFixed(1)} m au-dessus de l'eau ; pente ${pente.toFixed(2)} ; matière ${mat} ; tronc ou rocher à ${arbre.toFixed(1)} m ; autre interaction à ${pres.toFixed(1)} m ; runes ${t.runes.join(' ')}`);
      if (!A || d < A[0] || d > A[1]) ko(`tablette ${t.i + 1} hors de son anneau (${Math.round(d)} m)`);
      if (h < WL + 0.5) ko(`tablette ${t.i + 1} dans l'eau`);
      if (bloc) ko(`tablette ${t.i + 1} dans un mur`);
      if (pente < 0.85) ko(`tablette ${t.i + 1} sur une pente`);
      if (pres < 3) ko(`tablette ${t.i + 1} contre une interaction`);
      if (arbre > 3) ko(`tablette ${t.i + 1} à découvert`);
      if (ri !== 1) ko(`tablette ${t.i + 1} : ${ri} interaction(s)`);
      if (J.avec({ m: mat }, 'r15Pose.cheminMat(__v.m)')) ko(`tablette ${t.i + 1} sur un chemin`);
    }
    const R15_ORDRE = J.ev('R15_ORDRE');
    const manque = R15_ORDRE.filter((r) => !toutes.includes(r)), double = toutes.filter((r, i) => toutes.indexOf(r) !== i);
    log(`runes : ${toutes.length} sur les tablettes (manque : ${manque.join(', ') || 'aucune'} ; en double : ${double.join(', ') || 'aucune'})`);
    if (manque.length || double.length) ko('les douze runes ne sont pas chacune sur une tablette');
    if (!T.find((t) => t.sous && t.runes.includes('gyve'))) ko('la clé n’est pas sur la tablette du Dessous');
    return T;
  },

  // le labyrinthe : cases ouvertes, la dalle de la niche fermée ; on part de l'échelle
  laby(J, w, sansDalle) {
    const M = w.maze, G = M.G, open = M.open, P = w.r15.portes.niche;
    const ferme = new Uint8Array(G * G);
    if (P && !sansDalle) { const b = w.blocks[P.bloc]; for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const x = M.x0 + (i + 0.5) * M.R, z = M.z0 + (j + 0.5) * M.R; const [lx, lz] = J.ev('World').blockLocal(b, x, z); if (Math.abs(lx) < b.sx / 2 + 0.05 && Math.abs(lz) < b.sz / 2 + 0.05) ferme[j * G + i] = 1; } }
    const vu = new Uint8Array(G * G), Q = [];
    const ei = Math.floor((M.exit[0] - M.x0) / M.R), ej = Math.floor((M.exit[1] - M.z0) / M.R);
    vu[ej * G + ei] = 1; Q.push([ei, ej]);
    for (let h = 0; h < Q.length; h++) { const [i, j] = Q[h]; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + a, nj = j + b; if (ni < 0 || nj < 0 || ni >= G || nj >= G) continue; const k = nj * G + ni; if (vu[k] || !open[k] || ferme[k]) continue; vu[k] = 1; Q.push([ni, nj]); } }
    const at = (x, z) => vu[Math.floor((z - M.z0) / M.R) * G + Math.floor((x - M.x0) / M.R)] === 1;
    return { n: Q.length, at, ferme };
  },
  niche(J, w, ko, log) {
    const P = w.r15.portes.niche;
    if (!P) { ko('pas de niche scellée dans les Galeries'); return; }
    const A = this.laby(J, w, false), B = this.laby(J, w, true);
    const T = w.r15.tablettes.find((t) => t.sous);
    log(`la niche : ${P.x}, ${P.z} ; cases atteintes depuis l'échelle : ${A.n} (dalle fermée), ${B.n} (ouverte) : la dalle ferme ${B.n - A.n} cases ; le coffre ${A.at(...[w.props[P.coffre].x, w.props[P.coffre].z]) ? 'ATTEINT' : 'derrière la dalle'} ; la tablette du Dessous ${T && A.at(T.x, T.z) ? 'atteinte' : 'PAS ATTEINTE'}`);
    if (B.n - A.n > 60 || B.n - A.n < 4) ko(`la dalle de la niche ferme ${B.n - A.n} cases`);
    if (A.at(w.props[P.coffre].x, w.props[P.coffre].z)) ko('le coffre de la niche s’atteint sans ouvrir');
    if (!T || !A.at(T.x, T.z)) ko('la tablette du Dessous ne s’atteint pas');
    const it = w.inter.find((i) => i.kind === 'r15_porte' && i.data.porte === 'niche');
    if (!it || !A.at(it.x, it.z)) ko('on n’atteint pas la dalle de la niche');
  },
  caveau(J, w, ko, log) {
    const P = w.r15.portes.caveau;
    if (!P) { ko('pas de caveau dans la vallée'); return; }
    const F = w.lm.ferme, WL = w.waterLevel;
    const mi = J.avec({ x: P.x, z: P.z }, 'milieuAt(__w, __v.x, __v.z)');
    // rien d'autre dans le caveau : ni bloc étranger, ni objet posé, ni arbre debout
    let blocs = 0, props = 0, arbres = 0;
    w.query(P.x, P.z, 3.2, (o) => { if (!o.gone && Math.hypot(o.x - P.x, o.z - P.z) < 2.6) { const t = J.ev('OBJ_TYPES')[o.t]; if (t && J.ev('objRadius')(t, o) > 0) arbres++; } }, (b) => { if (!b.r15c && b.y + b.sy > P.y - 0.5 && b.y < P.y + 2.6) { const [lx, lz] = J.ev('World').blockLocal({ x: P.x, z: P.z, r: P.r }, b.x, b.z); if (Math.abs(lx) < 2.2 && Math.abs(lz) < 2.6) blocs++; } });
    for (let k = 0; k < w.props.length; k++) { const q = w.props[k]; if (k !== P.coffre && Math.hypot(q.x - P.x, q.z - P.z) < 3.5) props++; }
    // à pied depuis la ferme (grille de 4 m, pentes douces), jusqu'au seuil
    const C = 4, N = Math.floor(w.size / C), acc = new Uint8Array(N * N), Q = [];
    const H = (i, j) => w.heightAt((i + 0.5) * C, (j + 0.5) * C);
    const s0 = Math.floor(F.z / C) * N + Math.floor(F.x / C); acc[s0] = 1; Q.push(s0);
    const ci = Math.floor(P.devant[0] / C), cj = Math.floor(P.devant[2] / C);
    let ok = false;
    for (let h = 0; h < Q.length && !ok; h++) { const k = Q[h], i = k % N, j = (k / N) | 0; if (Math.abs(i - ci) <= 1 && Math.abs(j - cj) <= 1) { ok = true; break; } for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 1 || jj < 1 || ii >= N - 1 || jj >= N - 1) continue; const k2 = jj * N + ii; if (acc[k2]) continue; const h2 = H(ii, jj); if (h2 < WL + 0.4 || Math.abs(h2 - H(i, j)) > C * 0.9) continue; acc[k2] = 1; Q.push(k2); } }
    const d = Math.hypot(P.x - F.x, P.z - F.z);
    log(`le caveau : ${Math.round(P.x)}, ${Math.round(P.z)} (${mi}), ${Math.round(d)} m de la ferme, ${(P.y - WL).toFixed(1)} m au-dessus de l'eau ; dedans : ${blocs} bloc(s) étranger(s), ${props} objet(s) posé(s), ${arbres} tronc(s) ; à pied depuis la ferme : ${ok ? 'oui' : 'NON'}`);
    if (!['foret', 'bouleaux', 'sapiniere'].includes(mi)) ko('le caveau n’est pas en forêt');
    if (d < 240 || d > 820) ko('le caveau est trop près ou trop loin de la ferme');
    if (blocs || props || arbres) ko('quelque chose est pris dans le caveau');
    if (!ok) ko('on ne va pas à pied de la ferme au caveau');
    if (!w.lm.r15_caveau || !w.lm.r15_caveau.secret) ko('le lieu-dit du caveau manque (ou n’est pas secret)');
  },

  regles(J, ko, log) {
    const r = JSON.parse(J.ev(`(() => {
      const out = {};
      const ids = R15_ORDRE; let eff = 0, cles = 0;
      for (const a of ids) for (const b of ids) for (const c of ids) { if (a >= b || b >= c) continue; const L = runes.lire([a, b, c]); if (L && L.sorte === 'effet') eff++; if (L && L.sorte === 'cle') cles++; }
      out.effets = eff;
      out.portes = Object.keys(R15_PORTES).map((k) => { const P = R15_PORTES[k], L = runes.lire(P.runes); return k + ':' + (L && L.sorte === 'cle' ? 'ok' : 'MAUVAISE') + (P.runes.includes(P.efface) && P.efface !== 'gyve' ? '' : ':EFFACE'); });
      // une partie de rien : la pierre dort, puis s'éveille
      const sv = farm.s; farm.s = { seed: 1, day: 3, hours: 60, runes: { t: { 0: ['orne', 'sel', 'ure'] } } };
      out.dort = runes.assembler(['orne', 'aure', 'ile']).r;
      farm.s.runes.t = { 0: ['orne', 'sel', 'ure'], 1: ['rade', 'ysse', 'hale'], 2: ['aure', 'morne', 'ile'], 3: ['gyve', 'dar', 'lone'] };
      out.mauvais = runes.assembler(['orne', 'sel', 'ile']).r;
      out.effet = runes.assembler(['orne', 'aure', 'dar']).r;
      out.k = runes.k('recolte');
      out.jour = runes.assembler(['sel', 'aure', 'ile']).r;
      farm.s.day = 4; farm.s.hours = 84;
      out.effet2 = runes.assembler(['sel', 'morne', 'dar']).r;
      out.durables = Object.values(farm.s.runes.e).filter((E) => E.m === 'dar').length;
      out.kChance = runes.k('chance');
      out.porteNon = runes.assembler(['gyve', 'hale', 'aure'], 'caveau').r;
      out.porteOui = runes.assembler(['lone', 'gyve', 'hale'], 'caveau').r;
      out.sansCle = runes.assembler(['orne', 'aure', 'ile'], 'niche').r;
      farm.s.hours = 84 + R15_REGL.darJ * 24 + 1; out.fini = runes.k('chance');
      farm.s = sv;
      out.R = R15_REGL;
      // la valeur moyenne d'un coffre (prix du jeu)
      const V = (id) => (id === 'argent' ? 1 : (ITEMS[id] && ITEMS[id].price) || 0);
      out.coffres = Object.keys(R15_PORTES).map((k) => { const T = LOOT[R15_PORTES[k].table]; const tot = T.items.reduce((a, e) => a + e[3], 0); const parTirage = T.items.reduce((a, e) => a + e[3] / tot * V(e[0]) * (e[1] + e[2]) / 2, 0); return [k, Math.round(parTirage * (T.rolls[0] + T.rolls[1]) / 2), T.items.filter((e) => e[0] !== 'argent' && !ITEMS[e[0]]).map((e) => e[0])]; });
      return JSON.stringify(out);
    })()`));
    log(`assemblages qui font un effet : ${r.effets} (6 domaines × 3 signes × 2 mesures = 36) ; les dalles : ${r.portes.join(', ')}`);
    log(`essais : pierre endormie → ${r.dort} ; deux domaines → ${r.mauvais} ; Orne Aure Dar → ${r.effet} (récolte ${r.k}) ; second le même jour → ${r.jour} ; le lendemain Sel Morne Dar → ${r.effet2} (chance ${r.kChance}, durables ${r.durables}) ; ${r.R.darJ} jours après → ${r.fini}`);
    log(`dalle du caveau : mauvaises runes → ${r.porteNon}, les siennes → ${r.porteOui} ; un effet devant la niche → ${r.sansCle}`);
    if (r.effets !== 36) ko(`${r.effets} assemblages d'effet`);
    if (r.portes.some((p) => /MAUVAISE|EFFACE/.test(p))) ko('une dalle mal décrite');
    if (r.dort !== 'dort') ko('la pierre ne dort pas avant les quatre tablettes');
    if (r.mauvais !== 'rien') ko('un mauvais assemblage fait quelque chose');
    if (r.effet !== 'effet' || r.k !== 1) ko('Orne Aure Dar ne fait pas pousser');
    if (r.jour !== 'jour') ko('deux effets le même jour');
    if (r.effet2 !== 'effet' || r.kChance !== -1 || r.durables !== 1) ko('le second effet durable ne remplace pas le premier');
    if (r.fini !== 0) ko('un effet durable ne finit pas');
    if (r.porteNon !== 'non' || r.porteOui !== 'porte' || r.sansCle !== 'non') ko('les dalles s’ouvrent mal');
    const R = r.R, B = BORNES;
    log(`forces : récolte ×${R.recolte.join(' / ×')}, fouilles ${R.chance.join(' / ')}, pêche ${R.peche.join(' / ')} (fuite ${R.pecheFuite}), allure ×${R.pas.join(' / ×')}, faim ${R.faim.join(' / ')} ; passager ${R.filH} h, durable ${R.darJ} j ; ${R.parJour} par jour`);
    if (R.recolte[0] > B.recolte[0] || R.recolte[1] < B.recolte[1]) ko('récolte hors bornes');
    if (R.chance[0] > B.chance[0] || R.chance[1] > B.chance[1]) ko('chance hors bornes');
    if (R.peche[0] > B.peche[0] || R.peche[1] > B.peche[1]) ko('pêche hors bornes');
    if (R.pas[0] > B.pas[0] || R.pas[1] < B.pas[1]) ko('allure hors bornes');
    if (R.faim[0] > B.faim[0] || R.faim[1] > B.faim[1]) ko('faim hors bornes');
    if (R.filH < B.filH[0] || R.filH > B.filH[1] || R.darJ < B.darJ[0] || R.darJ > B.darJ[1]) ko('durées hors bornes');
    if (R.parJour !== 1) ko('plus d’un assemblage par jour');
    const tot = r.coffres.reduce((a, c) => a + c[1], 0);
    log(`les coffres (valeur moyenne) : ${r.coffres.map((c) => c[0] + ' ' + c[1]).join(', ')} ; en tout ${tot} pièces (${(tot / JOURNEE_DEBUT).toFixed(1)} journées de travail du début)`);
    if (tot > B.coffres) ko('les coffres valent trop');
    for (const c of r.coffres) if (c[2].length) ko(`objets inconnus dans le coffre ${c[0]} : ${c[2].join(', ')}`);
  },
};
