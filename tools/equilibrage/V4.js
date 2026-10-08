// Équilibrage — le château des Hauts, Hautguet (agent V4, quatorzième vague)
//  - le château est bâti sur son site (zone.site('chateau')), sans déborder (hors le chemin et la borne du fossé) ;
//    il reste léger : blocs (tous dessinés à chaque image), objets posés, interactions comptés ;
//  - on entre partout : chaque niveau de chaque bâtiment (sous chaque toit) est ouvert ou desservi par un escalier,
//    une échelle, une trappe (la même mesure que les bâtiments de la vallée, tools/equilibrage/batiments.js) ;
//  - les portes font 2,05 m au moins, et la baie au-dessus d'elles aussi ;
//  - les escaliers à vis, échelles, conduits déposent le joueur sur un sol, jamais dans un mur ;
//  - l'éclairage du dedans : chaque salle couverte est à l'ombre (la carte des abris), et presque rien du dehors ne l'est ;
//  - les clés : chacune posée une fois, chacune ouvre une porte qui existe, et aucune n'est derrière sa propre porte ;
//  - les raccourcis à sens unique sont là (pont-levis, herse, deux poternes barrées, grille du charnier, escalier des cachots) ;
//  - le butin : ce que rapporte tout le château, fouillé de fond en comble (espérance), reste borné ;
//  - les places (pour V2) et les abris (pour V3) existent, sur un sol, avec des ids « v4_… ».
'use strict';
const { examiner } = require('./batiments.js');
module.exports = {
  titre: 'Le château des Hauts, Hautguet (V4)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    const t0 = Date.now();
    const Z = await J.ev('zoneGen.generer(zone.graine(), () => {})');
    const V = Z.v4;
    if (!V) { ko('le château n’est pas bâti'); return { echecs }; }
    J.ctx.__Z = Z;
    const M = V.mesures, st = J.ev('zone.site("chateau")');
    log(`Hautguet : ${M.blocs} blocs, ${M.props} objets posés, ${M.inter} interactions, ${M.portes} portes, ${M.tours} tours ; ${V.salles.length} salles, ${V.places.length} places, ${V.abris.length} abris (Zone générée en ${Date.now() - t0} ms ; la passe : ${J.ev('zone.mesures.etapes["passe V4-chateau"]')} ms)`);
    if (M.blocs > 2500) ko('trop de blocs (' + M.blocs + ' > 2 500 : tous sont dessinés à chaque image)');
    if (M.props > 900) ko('trop d’objets posés (' + M.props + ')');
    // ---------------------------------------------------------------- sur son site
    const R0 = Math.hypot(st.x - V.cx, st.z - V.cz);
    if (R0 > 0.5) ko('le château n’est pas au centre de son site');
    let hors = 0;
    for (const b of Z.blocks) { const d = Math.hypot(b.x - V.cx, b.z - V.cz); if (d > st.r && d < st.r + 60 && b.m !== undefined) hors++; }
    if (hors > 2) ko(`${hors} blocs hors du site`);
    // ---------------------------------------------------------------- on entre partout
    const blocks = Z.blocks.filter((b) => Math.hypot(b.x - V.cx, b.z - V.cz) < st.r + 30);
    const proxy = { blocks, heightAt: (x, z) => Z.heightAt(x, z), inter: Z.inter, lm: Z.lm, bld: {}, doors: Z.doors };
    const toits = examiner(J, proxy);
    const compte = {}, mal = [];
    for (const T of toits) for (const n of T.niveaux) {
      compte[n.etat] = (compte[n.etat] || 0) + 1;
      if (n.etat === 'clos' || (n.etat === 'plein' && !T.plat)) mal.push(`(${Math.round(T.R.x - V.cx)}, ${Math.round(T.R.z - V.cz)}) +${(n.plancher - V.y0).toFixed(1)} m : ${n.etat}`);
    }
    log(`bâtiments : ${toits.length} toits, ${toits.reduce((s, T) => s + T.niveaux.length, 0)} niveaux — ${Object.entries(compte).map(([k, v]) => `${v} ${k}`).join(', ')}`);
    if (mal.length) { ko(`${mal.length} niveau(x) sans accès`); for (const m of mal) log('       ' + m); }
    // ---------------------------------------------------------------- les portes : 2,05 m au moins, la baie aussi
    const World = J.ev('World');
    const portes = Z.doors.filter((d) => d.v4);
    let basses = 0;
    for (const d of portes) {
      if (d.h < 2.05) { basses++; log(`       porte ${d.v4.id || '?'} : ${d.h.toFixed(2)} m`); continue; }
      // la baie : rien au-dessus du seuil avant 2,05 m, sur la largeur de la porte
      let haut = 1e9;
      for (const b of blocks) {
        if (b.hidden || b.y + b.sy < d.y + 0.3 || b.y > d.y + 3) continue;
        for (const u of [-0.35, 0, 0.35]) {
          const x = d.x + Math.cos(d.r) * u * d.w, z = d.z - Math.sin(d.r) * u * d.w, [lx, lz] = World.blockLocal(b, x, z);
          if (Math.abs(lx) <= b.sx / 2 - 0.02 && Math.abs(lz) <= b.sz / 2 - 0.02 && b.y > d.y + 0.3) haut = Math.min(haut, b.y - d.y);
          else if (Math.abs(lx) <= b.sx / 2 - 0.02 && Math.abs(lz) <= b.sz / 2 - 0.02 && b.y <= d.y + 0.3) haut = -1;
        }
      }
      if (haut < 2.05) { basses++; log(`       baie de la porte ${d.v4.id || '?'} : ${haut < 0 ? 'bouchée' : haut.toFixed(2) + ' m'}`); }
    }
    log(`portes : ${portes.length}, de ${Math.min(...portes.map((d) => d.h)).toFixed(2)} à ${Math.max(...portes.map((d) => d.h)).toFixed(2)} m de haut`);
    if (basses) ko(`${basses} porte(s) ou baie(s) de moins de 2,05 m`);
    // ---------------------------------------------------------------- les passages (vis, échelles, conduits, trappes) déposent sur un sol, hors des murs
    let mauvais = 0, n = 0;
    for (const it of Z.inter) {
      const to = it.data && it.data.to;
      if (!to || !String(it.kind).startsWith('v4_')) continue;
      n++;
      const g = Z.groundAt(to[0], to[2], to[1] + 0.6, 0.8);
      let dans = false;
      for (const b of blocks) { if (b.hidden) continue; const [lx, lz] = World.blockLocal(b, to[0], to[2]); if (Math.abs(lx) < b.sx / 2 + 0.2 && Math.abs(lz) < b.sz / 2 + 0.2 && to[1] + 0.5 > b.y && to[1] + 0.5 < b.y + b.sy) { dans = true; break; } }
      if (Math.abs(g - to[1]) > 0.7 || dans) { mauvais++; log(`       ${it.id} : ${dans ? 'dans un mur' : 'pas de sol (' + (g - to[1]).toFixed(1) + ')'}`); }
    }
    log(`passages : ${n}, ${mauvais} à revoir`);
    if (mauvais) ko('des passages déposent le joueur dans le vide ou dans un mur');
    // ---------------------------------------------------------------- les escaliers : 1,9 m libres au-dessus de chaque marche
    let tetes = 0;
    for (const mq of V.marches || []) {
      for (const b of blocks) {
        if (b.y <= mq.top + 0.05 || b.y >= mq.top + 1.9) continue;
        let touche = false;
        for (const [u, v] of [[0, 0], [-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) {
          const [lx, lz] = World.blockLocal(b, mq.x + u * (mq.sx - 0.3), mq.z + v * (mq.sz - 0.3));
          if (Math.abs(lx) < b.sx / 2 && Math.abs(lz) < b.sz / 2) { touche = true; break; }
        }
        if (touche) { tetes++; if (tetes <= 6) log(`       marche (${(mq.x - V.cx).toFixed(1)}, ${(mq.top - V.y0).toFixed(2)}, ${(mq.z - V.cz).toFixed(1)}) : un bloc ${(b.y - mq.top).toFixed(2)} m au-dessus`); break; }
      }
    }
    log(`escaliers : ${(V.marches || []).length} marches, ${tetes} où l'on se cogne la tête`);
    if (tetes) ko('des marches sans place pour la tête');
    // ---------------------------------------------------------------- l'éclairage du dedans (la carte des abris, 05-world.js)
    // chaque salle couverte est « à l'ombre » jusqu'à 2,2 m au-dessus de son plancher (hors les trous d'un toit crevé) ;
    // et le château n'assombrit presque pas de dehors (un seuil de porte, le bord d'un trou)
    {
      World.prototype.computeCover.call(Z, V.cx, V.cz);
      const base = Float32Array.from(Z.cover);
      Z.computeCover(V.cx, V.cz);
      const S = Z.coverW, [ox, oz] = Z.coverO, cov = Z.cover;
      const dansOcto = (x, z, o) => { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; if ((x - o[0]) * Math.sin(a) + (z - o[1]) * Math.cos(a) > o[2]) return false; } return true; };
      const couvertes = V.salles.filter((s) => s.couvert && !s.dessous);
      const dans = (x, z, s, r) => {
        if (s.trous && s.trous.some(([a, b, c, d]) => x > a && x < b && z > c && z < d)) return false;
        if (s.octo) return dansOcto(x, z, s.octo);
        const [x0, x1, z0, z1] = (r && s.abri) || [s.x0, s.x1, s.z0, s.z1];
        return x > x0 && x < x1 && z > z0 && z < z1;
      };
      const auJour = [];
      for (const s of couvertes) {
        const [x0, x1, z0, z1] = s.abri || [s.x0, s.x1, s.z0, s.z1];
        let bad = 0;
        for (let j = Math.floor(z0 - oz); j <= Math.floor(z1 - oz); j++) for (let i = Math.floor(x0 - ox); i <= Math.floor(x1 - ox); i++) {
          if (i < 0 || j < 0 || i >= S || j >= S) continue;
          const x = ox + i, z = oz + j;
          if (![[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]].some(([a, b]) => dans(x + a, z + b, s, true))) continue;
          if (cov[j * S + i] <= s.y0 + 2.2) bad++;
        }
        if (bad) auJour.push(`${s.id} (${bad} cases)`);
      }
      const murs = blocks.filter((b) => !b.hidden && !b.under && b.sy >= 1.5);
      const dansMur = (x, z, y) => murs.some((b) => { if (b.y > y + 0.5 || b.y + b.sy < y + 2) return false; const [lx, lz] = World.blockLocal(b, x, z); return Math.abs(lx) <= b.sx / 2 && Math.abs(lz) <= b.sz / 2; });
      // (une case compte si le sol du dehors, hors des murs, y passe de la lumière à l'ombre : lu à 8 cm, à 5 cm près)
      let dehors = 0, plus = 0;
      for (let k = 0; k < S * S; k++) {
        if (!(cov[k] > base[k] + 0.01)) continue;
        plus++;
        const i = k % S, j = (k - i) / S;
        let nd = 0;
        for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
          const x = ox + i + (a + 0.5) / 4, z = oz + j + (b + 0.5) / 4;
          if (couvertes.some((s) => dans(x, z, s))) continue;
          const g = Math.max(Z.heightAt(x, z), V.y0) + 0.08;
          if (g < base[k] - 0.05 || !(g < cov[k] - 0.05)) continue;
          if (!dansMur(x, z, g - 0.08)) nd++;
        }
        if (nd >= 3) dehors++;
      }
      log(`éclairage du dedans : ${couvertes.length} salles couvertes, ${auJour.length} au jour ; ${plus} cases relevées par le château, dont ${dehors} où le sol du dehors passe à l'ombre`);
      if (auJour.length) ko('des salles couvertes sont claires comme dehors : ' + auJour.join(', '));
      if (dehors > 40) ko(`le château assombrit trop de dehors (${dehors} cases)`);
    }
    // ---------------------------------------------------------------- les clés
    const cles = { v4_cle_poterne: ['poterne'], v4_cle_chapelle: ['sacristie'], v4_cle_donjon: ['donjon'], v4_cle_tour: ['tour_dame'], v4_trousseau: ['cellule_n2', 'cachots'] };
    const ou = {}; for (const id in V.objets) ou[V.objets[id]] = (ou[V.objets[id]] || 0) + 1;
    const derriere = { v4_cle_poterne: null, v4_cle_chapelle: null, v4_cle_donjon: 'sacristie', v4_cle_tour: 'donjon', v4_trousseau: 'donjon' };
    for (const k in cles) {
      if (ou[k] !== 1) ko(`la clé ${k} est posée ${ou[k] || 0} fois`);
      if (!J.avec({ k }, '!!ITEMS[__v.k]')) ko(`la clé ${k} n’existe pas`);
      for (const pid of cles[k]) { const d = V.portes[pid], g = V.grilles[pid], e = Z.inter.some((i) => i.kind === 'v4_escalier' && i.data && i.data.id === pid && i.data.cle === k); if (!d && !g && !e) ko(`la clé ${k} n’ouvre rien (${pid})`); }
      if (derriere[k] && cles[k].includes(derriere[k])) ko(`la clé ${k} est derrière sa propre porte`);
    }
    log(`clés : ${Object.keys(cles).map((k) => k + (derriere[k] ? ' (derrière : ' + derriere[k] + ')' : '')).join(', ')}`);
    // ---------------------------------------------------------------- les raccourcis à sens unique
    const R = {
      pont: !!(V.ponts.pont && V.ponts.pont.a > 1.4) && Z.inter.some((i) => i.id === 'v4_lev_pont'),
      herse: !!(V.herses.herse && V.herses.herse.blk) && Z.inter.some((i) => i.id === 'v4_lev_herse'),
      depense: !!(V.portes.depense && V.portes.depense.v4.barre === 'dedans'),
      poterne: !!(V.portes.poterne && V.portes.poterne.v4.barre === 'dedans' && V.portes.poterne.v4.cle),
      charnier: Z.inter.some((i) => i.id === 'v4_g_charnier_bas' && i.data.dessous) && Z.inter.some((i) => i.id === 'v4_g_charnier_haut' && !i.data.dessous),
      cachots: Z.inter.filter((i) => i.kind === 'v4_escalier' && i.data.id === 'cachots' && i.data.cle === 'v4_trousseau').length === 2,
    };
    log(`raccourcis : ${Object.entries(R).map(([k, v]) => k + (v ? '' : ' NON')).join(', ')}`);
    for (const k in R) if (!R[k]) ko('il manque le raccourci ' + k);
    // les murs creux et les recoins
    const murs = Object.keys(V.murs).filter((k) => V.murs[k].blocs.length);
    log(`murs creux : ${murs.join(', ')} ; fouilles : ${Object.keys(V.fouilles).length} ; objets à prendre : ${Object.keys(V.objets).length}`);
    if (murs.length < 4) ko('trop peu de murs creux');
    if (Object.keys(V.fouilles).length < 25) ko('trop peu de recoins à fouiller');
    // ---------------------------------------------------------------- le butin : l'espérance de tout le château
    const fouilles = Z.inter.filter((i) => i.kind === 'v4_fouille');
    const E = JSON.parse(J.avec({ F: fouilles.map((i) => ({ t: i.data.table, f: i.data.fixe })) }, `(()=>{
      const val = (k) => k === 'argent' ? 1 : ((ITEMS[k] && ITEMS[k].price) || 0);
      const esp = (key) => { const T = LOOT[key]; if (!T) return 0; const it = T.items.filter((e) => e[3] > 0 && (e[0] === 'argent' || ITEMS[e[0]])); const tot = it.reduce((a, e) => a + e[3], 0); const n = (T.rolls[0] + T.rolls[1]) / 2; return n * it.reduce((a, e) => a + e[3] / tot * (e[1] + e[2]) / 2 * val(e[0]), 0); };
      let s = 0, max = 0, tr = 0; for (const f of __v.F) { let v = f.t ? esp(f.t) : 0; if (f.f) for (const [k, q] of f.f) v += q * val(k); s += v; if (f.t === 'v4_tresor') tr += v; max = Math.max(max, v); }
      return JSON.stringify({ s: Math.round(s), max: Math.round(max), tr: Math.round(tr), anneau: ITEMS.v4_anneau ? ITEMS.v4_anneau.price : 0 });})()`));
    log(`butin : tout le château fouillé ≈ ${E.s} pièces (le trésor ≈ ${E.tr}, l’anneau ${E.anneau}) ; la plus riche fouille ≈ ${E.max}`);
    if (E.s + E.anneau > 4000) ko('le château rapporte trop');
    if (E.s < 600) ko('le château ne rapporte presque rien');
    // ---------------------------------------------------------------- les places (V2) et les abris (V3)
    const ids = new Set();
    let pmal = 0;
    for (const p of V.places) {
      if (!/^v4_/.test(p.id) || ids.has(p.id)) { pmal++; log('       place : id ' + p.id); }
      ids.add(p.id);
      if (!['gardien', 'rodeur', 'paisible'].includes(p.type)) { pmal++; log('       place : type ' + p.type); }
      const g = p.perche ? p.perche : Z.groundAt(p.x, p.z, p.y + 0.6, 0.8);
      if (Math.abs(g - p.y) > 0.8) { pmal++; log(`       place ${p.id} : pas sur un sol (${(g - p.y).toFixed(1)})`); }
    }
    const types = {}; for (const p of V.places) types[p.type] = (types[p.type] || 0) + 1;
    log(`places : ${V.places.length} (${Object.entries(types).map(([k, v]) => v + ' ' + k).join(', ')}, dont ${V.places.filter((p) => p.dessous).length} sous terre) ; abris : ${V.abris.length}`);
    if (pmal) ko(pmal + ' place(s) mal posée(s)');
    if (V.places.length < 20 || V.abris.length < 20) ko('trop peu de places ou d’abris');
    return { echecs };
  },
};
