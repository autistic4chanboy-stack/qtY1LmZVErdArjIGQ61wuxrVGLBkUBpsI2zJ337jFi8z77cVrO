// Équilibrage — les cascades, les Grottes de la Chute, les coins de paradis (agent P18, dix-huitième vague)
//   node tools/equilibrage.js P18
// - Chaque chose à sa place (graines 1234 et 77) : rien d'avant ne bouge (empreintes), ce qu'on ajoute vient après
//   tout le reste ; là où le terrain est creusé ou noyé, ni chemin, ni maison, ni objet posé, ni interaction, ni
//   nœud de chemin, ni autre chose que des herbes, des arbres, des cailloux (ôtés) ; les chutes et les coins loin
//   les uns des autres, loin des lieux d'avant et des endroits de la montagne où l'on bâtirait (refuge, col, lacs
//   d'en haut, estive) ; l'eau tient dans ses bassins (le bord est plus haut que l'eau).
// - Les grottes : chaque salle, le lac, la rivière, le Sanctuaire sont atteints à pied depuis l'arrivée ; les deux
//   sorties aussi ; chaque galerie part d'une salle et arrive dans une autre ; le Dessous n'a pas bougé (sa grille,
//   hors de la boîte des grottes, est la même avec et sans elles ; aucun de ses creuseurs n'entre dans la boîte) ;
//   dans la boîte, sous terre, rien d'autre que les grottes.
// - Ce qu'on y gagne reste petit : les trouvailles d'une fois (le coffre, les fossiles, les perles, les filons)
//   valent moins de deux journées du début ; ce qui repousse, moins d'un tiers de journée par jour ; s'asseoir dans
//   un coin, le bain : quelques PV, un peu d'esprit, une fois par jour.
// - Le coût : objets ajoutés, objets posés, blocs, interactions, nappes d'eau, petites chutes, boîtes par image au
//   pied de chaque chute (comptées sur le vrai dessin) ; la décoration des grottes visible d'un point (au plus).
// - Les textes : chaque lieu a un nom, chaque salle aussi, chaque scène un titre ; les habitants en parlent ; les
//   deux morceaux de musique se lisent sans erreur.
'use strict';
const { vallee, empreinte, EMPREINTE_1234, charger } = require('./vm.js');

const JOURNEE_DEBUT = 375;   // pièces (domaine commerce)
const N_C3 = [103331, 3384, 931], EMPREINTE_C3 = '103331/3384/931/48142f0b97c7';
const BORNES = {
  objets: 450, props: 650, blocs: 260, inter: 45, nappes: 140, minis: 80, boitesChute: 520, decoVue: 520, passeMs: 6000,
  ecartChutes: 140, ecartCoins: 90, loinMontagne: 250, uneFois: 2 * JOURNEE_DEBUT, parJour: JOURNEE_DEBUT / 3,
};

module.exports = {
  titre: 'Les cascades, les Grottes de la Chute, les coins de paradis (P18)',
  async verifier(J, log) {
    const E = [];
    const ko = (m) => { E.push(m); log('  ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- 1. la vallée, deux graines
    for (const graine of [1234, 77]) {
      log(`\n# 1. La vallée (graine ${graine})`);
      const JJ = graine === 1234 ? J : charger();
      const t0 = Date.now();
      const w = await vallee(JJ, graine);
      log(`(vallée générée en ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      JJ.ctx.__w = w;
      if (!w.p18) { ko('pas de w.p18'); continue; }
      const R = w.p18;
      const e1 = empreinte(w, [98896, 1308, 516]), e3 = empreinte(w, N_C3);
      log(`empreintes : d'origine ${e1 === EMPREINTE_1234 ? 'inchangée' : 'CHANGÉE ' + e1} ; huitième vague ${e3 === EMPREINTE_C3 ? 'inchangée' : 'CHANGÉE ' + e3}`);
      if (e1 !== EMPREINTE_1234) ko('empreinte d’origine changée');
      if (graine === 1234 && e3 !== EMPREINTE_C3) ko('empreinte de la huitième vague changée'); // (celle-ci n'est relevée que pour la graine 1234)
      // ce qu'on ajoute vient après tout le reste
      const fin = [w.objects.length - R.n.o, w.props.length - R.n.p, w.inter.length - R.n.i, w.blocks.length - R.n.b];
      if (fin[0] !== R.n0.o || fin[1] !== R.n0.p || fin[2] !== R.n0.i || fin[3] !== R.n0.b) ko(`la passe n’est pas la dernière (${fin.join('/')} contre ${R.n0.o}/${R.n0.p}/${R.n0.i}/${R.n0.b})`);
      log(`ajouté : ${R.n.o} objets, ${R.n.p} objets posés, ${R.n.i} interactions, ${R.n.b} blocs ; ${R.n.eaux} nappes d’eau, ${R.n.minis} petites chutes ; ${R.n.sommets} sommets du terrain touchés ; ${R.otes} herbes, arbres ou cailloux ôtés ; passe : ${R.ms} ms`);
      if (R.n.o > BORNES.objets) ko(`${R.n.o} objets ajoutés (> ${BORNES.objets})`);
      if (R.n.p > BORNES.props) ko(`${R.n.p} objets posés ajoutés (> ${BORNES.props})`);
      if (R.n.b > BORNES.blocs) ko(`${R.n.b} blocs ajoutés (> ${BORNES.blocs})`);
      if (R.n.i > BORNES.inter) ko(`${R.n.i} interactions ajoutées (> ${BORNES.inter})`);
      if (R.n.eaux > BORNES.nappes) ko(`${R.n.eaux} nappes d’eau (> ${BORNES.nappes})`);
      if (R.n.minis > BORNES.minis) ko(`${R.n.minis} petites chutes (> ${BORNES.minis})`);
      if (R.ms > BORNES.passeMs) ko(`la passe prend ${R.ms} ms`);
      // chaque chose à sa place
      const P = JSON.parse(JJ.ev(`JSON.stringify((() => {
        const w = __w, R = w.p18, WL = w.waterLevel, out = { routes: R.routes, ecartes: R.ecartes.length, gene: [], chutes: [], coins: [], fuites: [], ecarts: [], montagne: [], dessous: 0, n0: R.n0 };
        // le terrain touché : une grille des sommets changés (plus de 20 cm)
        const C = w.cell, Wd = w.W, chg = new Set();
        // (on n'a plus la hauteur d'avant : la passe la garde dans R.chg ? non : on la recalcule en régénérant sans P18 serait trop long ;
        //  on prend les nappes et les bassins, et les chutes, comme zones à tenir libres)
        const zones = [];
        for (const E of R.eaux) if (!E.sous) zones.push({ x: E.x, z: E.z, r: Math.hypot(E.hx, E.hz) + 2, E });
        for (const D of R.chutes) if (!D.sous) { zones.push({ x: D.x, z: D.z, r: (D.l || 4) + 8 }); if (D.bassin) zones.push({ x: D.bassin.x, z: D.bassin.z, r: D.bassin.r + 6 }); }
        for (const Q of R.coins) zones.push({ x: Q.x, z: Q.z, r: Q.r });
        const dans = (x, z, m) => zones.some((Z) => Math.hypot(x - Z.x, z - Z.z) < Z.r + (m || 0));
        // ce qui était là avant (indices < n0) et qui ne doit pas être dans une zone : objets posés, interactions, blocs de surface, maisons, nœuds de chemin
        for (let i = 0; i < R.n0.p; i++) { const q = w.props[i]; if (q.y > -30 && !q.gone && dans(q.x, q.z, 1)) out.gene.push('objet posé ' + q.id + ' @' + Math.round(q.x) + ',' + Math.round(q.z)); }
        for (let i = 0; i < R.n0.i; i++) { const it = w.inter[i]; if ((it.y || 0) > -30 && dans(it.x, it.z, 1)) out.gene.push('interaction ' + it.kind + ' @' + Math.round(it.x) + ',' + Math.round(it.z)); }
        for (let i = 0; i < R.n0.b; i++) { const b = w.blocks[i]; if (!b.under && b.y > -30 && dans(b.x, b.z, Math.max(b.sx, b.sz) / 2)) out.gene.push('bloc @' + Math.round(b.x) + ',' + Math.round(b.z)); }
        for (const k in w.bld) { const b = w.bld[k]; if (dans(b.x, b.z, 10)) out.gene.push('maison ' + k); }
        for (const n of w.nav.nodes) if (dans(n.x, n.z, 4) && !/p18/.test(n.tag || '')) out.gene.push('nœud de chemin ' + (n.tag || '') + ' @' + Math.round(n.x) + ',' + Math.round(n.z));
        for (const d of w.doors || []) if (d && dans(d.x, d.z, 2)) out.gene.push('porte @' + Math.round(d.x) + ',' + Math.round(d.z));
        // les lieux d'avant (pas les nôtres, pas ceux d'en dessous) : à l'écart
        for (const k in w.lm) { const L = w.lm[k]; if (/^p18/.test(k) || L.under) continue; const r = Math.min(L.r || 8, 60); if (zones.some((Z) => !Z.E && Math.hypot(L.x - Z.x, L.z - Z.z) < Z.r + r * 0.5 + 6)) out.gene.push('lieu ' + k + ' @' + Math.round(L.x) + ',' + Math.round(L.z)); }
        // les chutes et les coins, entre eux
        const pts = R.chutes.filter((D) => !D.sous).map((D) => ['chute ' + D.k, D.bassin ? D.bassin.x : D.x, D.bassin ? D.bassin.z : D.z, 'c', D.k]).concat(R.coins.map((Q) => ['coin ' + Q.k, Q.x, Q.z, 'q', Q.k]));
        const lies = { saule: 'saules', fees: 'cascatelles', belvedere: 'voile' }; // (un coin posé sur sa chute : au pied, sur l'îlot, en haut)
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const A = pts[i], B = pts[j], d = Math.hypot(A[1] - B[1], A[2] - B[2]);
          if (lies[A[4]] === B[4] || lies[B[4]] === A[4]) continue;
          const min = A[3] === 'c' && B[3] === 'c' ? ${BORNES.ecartChutes} : ${BORNES.ecartCoins};
          if (d < min) out.ecarts.push(A[0] + ' / ' + B[0] + ' : ' + Math.round(d) + ' m');
        }
        // loin des endroits de la montagne où l'on bâtirait (un hôtel, un chalet)
        for (const k of ['refuge', 'col', 'lac_gele', 'lac_noir', 'combe', 'estive', 'glacier', 'faille', 'fente_nains']) { const L = w.lm[k]; if (!L) continue; for (const A of pts) { const d = Math.hypot(A[1] - L.x, A[2] - L.z) - (k === 'glacier' || k === 'combe' ? (L.r || 0) * 0.6 : 0); if (d < ${BORNES.loinMontagne}) out.montagne.push(A[0] + ' / ' + k + ' : ' + Math.round(d) + ' m'); } }
        // l'eau tient dans ses bassins : sur le pourtour (un peu dehors), le terrain est plus haut que l'eau (sauf à l'endroit où elle s'en va)
        for (const D of R.chutes) {
          if (D.sous || !D.bassin) continue;
          const B = D.bassin; let bas = 0;
          for (let a = 0; a < 32; a++) { const t = a / 32 * Math.PI * 2, lx = Math.cos(t) * B.rx * 1.18, lz = Math.sin(t) * B.rz * 1.18, x = B.x + lx * Math.cos(B.rot) - lz * Math.sin(B.rot), z = B.z + lx * Math.sin(B.rot) + lz * Math.cos(B.rot); if (w.heightAt(x, z) < B.y + 0.05) bas++; }
          out.chutes.push({ k: D.k, haut: +(D.y0 - D.y1).toFixed(1), larg: D.l, bassin: [Math.round(B.x), Math.round(B.z)], fuites: bas });
        }
        for (const Q of R.coins) out.coins.push({ k: Q.k, x: Math.round(Q.x), z: Math.round(Q.z), y: +(Q.y - WL).toFixed(1), sec: w.heightAt(Q.x, Q.z) > WL + 0.5 });
        // sous terre, dans la boîte des grottes : rien d'avant (indices < n0)
        const Bx = P18_GROTTE.boite, inB = (x, z) => x > Bx[0] && x < Bx[2] && z > Bx[1] && z < Bx[3];
        for (let i = 0; i < R.n0.p; i++) { const q = w.props[i]; if (q.y < -30 && inB(q.x, q.z)) out.dessous++; }
        for (let i = 0; i < R.n0.b; i++) { const b = w.blocks[i]; if (b.y < -30 && inB(b.x, b.z)) out.dessous++; }
        for (let i = 0; i < R.n0.i; i++) { const it = w.inter[i]; if ((it.y || 0) < -30 && inB(it.x, it.z)) out.dessous++; }
        for (let i = 0; i < R.n0.o; i++) { const o = w.objects[i]; if (o.y !== undefined && o.y < -30 && inB(o.x, o.z)) out.dessous++; }
        return out;
      })())`));
      for (const C of P.chutes) log(`  ${C.k} : ${C.haut} m de haut, ${C.larg} m de large, bassin en ${C.bassin.join(', ')} ; ${C.fuites} point(s) bas sur 32 au bord du bassin`);
      log(`  coins : ${P.coins.map((Q) => `${Q.k} (${Q.x}, ${Q.z}, ${Q.y} m)`).join(' ; ')}`);
      log(`  à leur place : ${P.gene.length ? P.gene.length + ' gêne(s) : ' + P.gene.slice(0, 8).join(' ; ') : 'rien dans les bassins, les cirques, les coins'} ; chemins touchés : ${P.routes} ; objets non végétaux sous l’eau ou la terre creusée : ${P.ecartes}`);
      if (P.gene.length) ko(`${P.gene.length} chose(s) d’avant dans les zones des chutes et des coins`);
      if (P.routes) ko(`${P.routes} sommet(s) de chemin touché(s)`);
      if (P.ecartes) ko(`${P.ecartes} objet(s) qui ne s’ôtent pas sous la terre creusée`);
      if (P.ecarts.length) ko('trop près les uns des autres : ' + P.ecarts.join(' ; '));
      log(`  écarts : ${P.ecarts.length ? P.ecarts.join(' ; ') : 'chutes à plus de ' + BORNES.ecartChutes + ' m les unes des autres, coins à plus de ' + BORNES.ecartCoins + ' m'} ; montagne : ${P.montagne.length ? P.montagne.join(' ; ') : 'tout à plus de ' + BORNES.loinMontagne + ' m du refuge, du col, des lacs d’en haut, de l’estive'}`);
      if (P.montagne.length) ko('trop près des hauteurs où l’on bâtirait : ' + P.montagne.join(' ; '));
      for (const C of P.chutes) if (C.fuites > 3) ko(`le bassin de ${C.k} fuit (${C.fuites} points sur 32 plus bas que l’eau)`);
      for (const Q of P.coins) if (!Q.sec) ko(`le coin ${Q.k} est dans l’eau`);
      if (P.chutes.length < 4 || P.chutes.length > 6) ko(`${P.chutes.length} chutes (4 à 6)`);
      if (P.coins.length < 5 || P.coins.length > 7) ko(`${P.coins.length} coins (5 à 7)`);
      log(`  dessous, dans la boîte des grottes : ${P.dessous} chose(s) d’avant`);
      if (P.dessous) ko(`${P.dessous} chose(s) d’avant sous terre dans la boîte des grottes`);
      if (graine === 1234) this.cout(JJ, w, ko, log);
    }
    // ---------------------------------------------------------------- 2. les grottes
    log('\n# 2. Les grottes');
    this.grottes(J, ko, log);
    // ---------------------------------------------------------------- 3. ce qu'on y gagne
    log('\n# 3. Ce qu’on y gagne');
    this.gains(J, ko, log);
    // ---------------------------------------------------------------- 4. les textes, la musique
    log('\n# 4. Les textes, la musique');
    const T = JSON.parse(J.ev(`JSON.stringify((() => {
      const out = { sansNom: [], sansSalle: [], sansTitre: [], rumeurs: 0, musique: [] };
      for (const C of P18_CHUTES) if (!LIEU_NAMES['p18_' + C.k]) out.sansNom.push(C.k);
      for (const C of P18_COINS) if (!LIEU_NAMES['p18_' + C.k]) out.sansNom.push(C.k);
      for (const S of P18_GROTTE.salles) if (!P18_SALLES_NOMS[S[0]] || !LIEU_NAMES['p18g_' + S[0]]) out.sansSalle.push(S[0]);
      for (const k of Object.keys(P18_SCENES_TITRES)) if (!H17_CINES[k] || !H17_CINES[k].titre || !H17_ORDRE_CINES.includes(k)) out.sansTitre.push(k);
      for (const id in P18_RUMEURS) { const d = NPC_DATA.find((x) => x.id === id) || (typeof C2_HABITANTS !== 'undefined' && C2_HABITANTS.find((x) => x.id === id)); if (d && d.lines && d.lines.rumeurs && P18_RUMEURS[id].every((l) => d.lines.rumeurs.includes(l))) out.rumeurs++; }
      for (const id of ['paradis_pre', 'paradis_eau']) { const C = MUSIQUE.morceaux[id] && musCompiler(MUSIQUE.morceaux[id], 1); out.musique.push([id, C ? C.erreurs.length : -1, C ? +(C.duree || 0).toFixed(0) : 0]); }
      return out;
    })())`));
    log(`noms : ${T.sansNom.length ? 'manquent ' + T.sansNom.join(', ') : 'chaque chute, chaque coin'} ; salles : ${T.sansSalle.length ? 'manquent ' + T.sansSalle.join(', ') : 'chacune'} ; scènes : ${T.sansTitre.length ? 'sans titre ' + T.sansTitre.join(', ') : 'chacune a son titre, dans les Souvenirs'} ; habitants qui en parlent : ${T.rumeurs} ; musique : ${T.musique.map((m) => m[0] + ' (' + (m[1] ? m[1] + ' erreur(s)' : 'sans erreur') + ')').join(', ')}`);
    if (T.sansNom.length || T.sansSalle.length || T.sansTitre.length) ko('des noms ou des titres manquent');
    if (T.rumeurs < 6) ko(`${T.rumeurs} habitants seulement en parlent`);
    for (const [id, n] of T.musique) if (n) ko(`le morceau ${id} a ${n} erreur(s) de notation`);
    return { echecs: E.length };
  },

  // ---------------------------------------------------------------- le coût (graine 1234)
  cout(J, w, ko, log) {
    const C = JSON.parse(J.ev(`JSON.stringify((() => {
      const w = __w, R = w.p18, out = { chutes: [], vue: 0, vueOu: null };
      game.world = w;
      const buf = new InstBuf(4096);
      for (const D of R.chutes) { buf.reset(); PE.buf = buf; p18Rendu.chute(D, 10, 3.7, false); out.chutes.push([D.k, buf.n]); }
      let mini = 0; for (const M of R.minis) { buf.reset(); PE.buf = buf; p18Rendu.chute(Object.assign({ mini: true }, M), 10, 1.3, true); mini = Math.max(mini, buf.n); }
      out.mini = mini;
      // la décoration des grottes (objets posés d'en bas) qu'on peut avoir à dessiner d'un point : au plus (rayon 130 m)
      const deco = w.props.slice(R.n0.p).filter((q) => q.y < -30);
      for (const S of P18_GROTTE.salles) { const n = deco.filter((q) => Math.hypot(q.x - S[1], q.z - S[2]) < 130).length; if (n > out.vue) { out.vue = n; out.vueOu = S[0]; } }
      out.deco = deco.length;
      return out;
    })())`));
    log(`  boîtes par image au pied de chaque chute (de près) : ${C.chutes.map(([k, n]) => k + ' ' + n).join(', ')} ; une petite chute : ${C.mini} ; décoration des grottes : ${C.deco} objets posés, au plus ${C.vue} à dessiner d’un point (${C.vueOu})`);
    for (const [k, n] of C.chutes) if (n > BORNES.boitesChute) ko(`la chute ${k} coûte ${n} boîtes par image`);
    if (C.vue > BORNES.decoVue) ko(`${C.vue} objets posés à dessiner d’un point des grottes`);
  },

  // ---------------------------------------------------------------- les grottes : tout se rejoint, le Dessous n'a pas bougé
  grottes(J, ko, log) {
    // sans les grottes (le moteur seul) : la grille hors de la boîte
    const J0 = charger();
    J0.ev('souterrain._p18 = true');
    const h0 = J0.ev(`(() => { souterrain.construire(); const F = souterrain.F, V = souterrain.V, B = P18_GROTTE.boite; let h = 0; for (let j = 0; j < SOUT_W; j += 2) for (let i = 0; i < SOUT_W; i += 2) { const x = i * SOUT_CELL, z = j * SOUT_CELL; if (x > B[0] - 30 && x < B[2] + 30 && z > B[1] - 30 && z < B[3] + 30) continue; const k = j * SOUT_W + i; h = (h * 31 + Math.round(F[k] * 10) * 7 + Math.round(V[k] * 10)) | 0; } return h; })()`);
    const R = JSON.parse(J.ev(`JSON.stringify((() => {
      const S = souterrain, t0 = Date.now(); S.construire();
      const F = S.F, V = S.V, W = SOUT_W, C = SOUT_CELL, B = P18_GROTTE.boite, out = { ms: Date.now() - t0 };
      let h = 0; for (let j = 0; j < W; j += 2) for (let i = 0; i < W; i += 2) { const x = i * C, z = j * C; if (x > B[0] - 30 && x < B[2] + 30 && z > B[1] - 30 && z < B[3] + 30) continue; const k = j * W + i; h = (h * 31 + Math.round(F[k] * 10) * 7 + Math.round(V[k] * 10)) | 0; }
      out.h = h;
      // les creuseurs : les nôtres dans la boîte, les siens dehors
      out.siensDedans = S._cv.filter((c) => !c.p18 && c.x1 > B[0] && c.x0 < B[2] && c.z1 > B[1] && c.z0 < B[3]).length + S._post.filter((c) => !c.p18 && c.x1 > B[0] && c.x0 < B[2] && c.z1 > B[1] && c.z0 < B[3]).length;
      out.notresDehors = S._cv.filter((c) => c.p18 && (c.x0 < B[0] || c.x1 > B[2] || c.z0 < B[1] || c.z1 > B[3])).length;
      out.notres = S._cv.filter((c) => c.p18).length;
      // à pied depuis l'arrivée (cases de 2 m ; 1,7 m sous la voûte ; marche de 1,25 m au plus ; on nage dans l'eau d'en bas)
      const ok = (k) => V[k] - F[k] > 1.7 && F[k] < SOUT_ROCK - 1;
      const idx = (x, z) => Math.round(z / C) * W + Math.round(x / C);
      const dist = new Int32Array(W * W).fill(-1), file = new Int32Array(W * W);
      const s0 = idx(P18_GROTTE.arrivee[0], P18_GROTTE.arrivee[2]);
      let a = 0, b = 0; dist[s0] = 0; file[b++] = s0;
      while (a < b) { const k = file[a++], i = k % W, j = (k / W) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (j + dj) * W + i + di; if (dist[q] >= 0 || !ok(q)) continue; if (Math.max(F[q], SOUT_WL - 1.2) - Math.max(F[k], SOUT_WL - 1.2) > 1.25) continue; dist[q] = dist[k] + 1; file[b++] = q; } }
      const proche = (x, z) => { const k0 = idx(x, z); if (dist[k0] >= 0) return dist[k0]; for (let r = 1; r < 4; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { const q = k0 + dj * W + di; if (q >= 0 && q < W * W && dist[q] >= 0) return dist[q]; } return -1; };
      out.salles = P18_GROTTE.salles.map((q) => [q[0], proche(q[1], q[2])]).concat(P18_GROTTE.lacs.map((q) => [q[0], proche(q[1], q[2])]));
      const T = P18_GROTTE.torrent; out.salles.push(['torrent', proche(T[4][0] + T[4][3] * 0.75, T[4][1])]);
      // les sorties : le Vestibule (vers la chute), les racines de l'aven
      const [cx, cz] = P18_GROTTE.cheminees[0];
      out.sorties = [['chute', proche(P18_GROTTE.arrivee[0] + 4.5, P18_GROTTE.arrivee[2])], ['aven', proche(cx + 2.2, cz)]];
      // chaque galerie relie deux salles
      p18Grotte.creuseurs();
      out.galeries = p18Grotte._gal.map(([k, pts, a, b]) => [k, p18Grotte.salle(pts[0][0], pts[0][1]) === a, p18Grotte.salle(pts[pts.length - 1][0], pts[pts.length - 1][1]) === b]);
      out.boyaux = p18Grotte._br.length;
      out.aire = 0; for (let k = 0; k < dist.length; k++) if (dist[k] >= 0) out.aire++;
      out.aire *= C * C;
      let lmax = 0; for (let k = 0; k < dist.length; k++) if (dist[k] > lmax) lmax = dist[k];
      out.loin = lmax * C;
      return out;
    })())`));
    log(`grille faite en ${R.ms} ms ; ${R.notres} creuseurs pour les grottes, ${R.boyaux} boyaux tirés au sort ; ${Math.round(R.aire)} m² où l’on marche ; la salle la plus loin à ${R.loin} m de marche de l’arrivée`);
    log(`le Dessous : grille hors de la boîte ${R.h === h0 ? 'inchangée' : 'CHANGÉE'} ; ses creuseurs dans la boîte : ${R.siensDedans} ; les nôtres hors de la boîte : ${R.notresDehors}`);
    if (R.h !== h0) ko('la grille du Dessous a changé hors de la boîte des grottes');
    if (R.siensDedans) ko(`${R.siensDedans} creuseur(s) du Dessous dans la boîte des grottes`);
    if (R.notresDehors) ko(`${R.notresDehors} creuseur(s) des grottes hors de leur boîte`);
    const non = R.salles.filter(([, d]) => d < 0).map(([k]) => k);
    log(`atteintes à pied depuis l’arrivée : ${R.salles.map(([k, d]) => k + (d < 0 ? ' NON' : ' ' + d * 2 + ' m')).join(', ')}`);
    if (non.length) ko('salles qu’on n’atteint pas : ' + non.join(', '));
    log(`sorties : ${R.sorties.map(([k, d]) => k + (d < 0 ? ' NON' : ' ok')).join(', ')}`);
    for (const [k, d] of R.sorties) if (d < 0) ko(`la sortie ${k} ne s’atteint pas`);
    const gb = R.galeries.filter(([, a, b]) => !a || !b).map(([k]) => k);
    log(`galeries : ${R.galeries.length}, ${gb.length ? 'mal accrochées : ' + gb.join(', ') : 'chacune d’une salle à une autre'}`);
    if (gb.length) ko('galeries mal accrochées : ' + gb.join(', '));
    if (P18GrottesMin > R.salles.length) ko('pas assez de salles');
    if (R.aire < 25000) ko(`les grottes sont petites (${Math.round(R.aire)} m²)`);
  },

  // ---------------------------------------------------------------- ce qu'on y gagne
  gains(J, ko, log) {
    const G = JSON.parse(J.ev(`JSON.stringify((() => {
      const w = __w, R = w.p18.grotte, prix = (id) => (ITEMS[id] ? ITEMS[id].price : 0), out = { fois: 0, detailFois: [], jour: 0, detailJour: {}, items: [] };
      for (const T of R.trouvailles) for (const [id, n] of T.items) { const v = id === 'argent' ? n : prix(id) * n; out.fois += v; out.detailFois.push(id + '×' + n + '=' + v); }
      // les cueillettes des grottes : une fois (every 0 ou filon), ou qui repoussent (every jours)
      const L = (w.soutCueillettes || []).map((i) => w.props[i]).filter((q) => q && q.data && /^p18c/.test(q.data.k || ''));
      for (const q of L) {
        const d = q.data, n = q.id === 'sout_guano' ? 2.5 : 1;
        if (q.id === 'sout_filon') { const v = prix(d.it) * (d.n || 3); out.fois += v; continue; }
        if (!d.every) { out.fois += prix(d.it) * n; continue; }
        const v = prix(d.it) * n / d.every; out.jour += v; out.detailJour[d.it] = +((out.detailJour[d.it] || 0) + v).toFixed(1);
      }
      out.jour += prix('ocre') * 2;
      out.ocre = prix('ocre');
      out.items = ['ocre'].map((id) => [id, ITEMS[id] && ITEMS[id].name, prix(id), !!(ITEMS[id] && ITEMS[id].ic)]);
      out.repos = [P18_REPOS_SOIN, P18_BAIN_SOIN, P18_REPOS_ESPRIT, P18_PREMIERE_FOIS];
      out.soinPotion = ITEMS.potion_soin ? (ITEMS.potion_soin.heal || 0) : 0;
      return out;
    })())`));
    log(`une fois pour toutes : ${Math.round(G.fois)} pièces (${G.detailFois.join(', ')} + perles et filons) ; ce qui repousse : ${G.jour.toFixed(1)} pièce(s) par jour (${Object.entries(G.detailJour).map(([k, v]) => k + ' ' + v).join(', ')}, l’ocre)`);
    log(`s’asseoir dans un coin : ${G.repos[0]} PV et ${G.repos[2]} d’esprit (une fois par jour et par coin ; l’esprit, 6 au plus par jour) ; le bain tiède : ${G.repos[1]} PV ; trouver un coin : ${G.repos[3]} d’esprit`);
    if (G.fois > BORNES.uneFois) ko(`les trouvailles d’une fois valent ${Math.round(G.fois)} pièces (> ${BORNES.uneFois})`);
    if (G.jour > BORNES.parJour) ko(`ce qui repousse rapporte ${G.jour.toFixed(0)} pièces par jour (> ${BORNES.parJour})`);
    if (G.repos[0] > 20 || G.repos[1] > 30 || G.repos[2] > 4 || G.repos[3] > 6) ko('le repos rapporte trop');
    for (const [id, nom, p, ic] of G.items) { if (!nom || !ic) ko(`l’objet ${id} n’a pas de nom ou d’icône`); if (p > 10) ko(`l’objet ${id} vaut ${p}`); }
  },
};
const P18GrottesMin = 12;
