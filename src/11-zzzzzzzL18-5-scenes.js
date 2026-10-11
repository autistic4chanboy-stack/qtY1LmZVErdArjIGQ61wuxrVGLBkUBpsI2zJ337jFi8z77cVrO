// ============================================================================
//  LE GRAND HÔTEL DES CIMES (agent L18) — 5. LES SCÈNES, LE FUNICULAIRE, LA VOITURE
//  Sur le moteur des scènes de l'histoire (h17Cine : chemins de caméra, figurants,
//  cartes, bandes noires, sous-titres, une musique, on passe en maintenant Espace
//  ou Échap) :
//   - l'arrivée (la première fois qu'on approche, ou qu'on monte) : la vallée,
//     l'hôtel sur son replat, la voie du funiculaire, la façade et ses lettres,
//     le hall ; la terrasse au couchant (la première fois qu'on y est, le soir) ;
//     le bal du Veilledi (la première fois qu'on entre dans la salle, un soir de
//     bal) ; l'aile Nord (la première fois qu'on y entre) ; l'embauche ;
//   - les scènes des histoires (la montre, l'adieu de la comtesse, le concert,
//     le départ ou non de Firmin, le plateau de onze heures, la porte sans numéro,
//     la fin de la treize), avec leurs variantes ;
//   - le funiculaire (on monte, on descend : la cabine roule pour de vrai sur sa
//     voie) et la voiture des Cimes (de la fourche au nord de Valbrume à la cour).
//  Les scènes vues se revoient au carnet (« Le Grand Hôtel »).
// ============================================================================
const L18_FIG = {
  comtesse: L18_GENS.comtesse.look, wolanski: Object.assign({}, L18_GENS.wolanski.look, { held: null }), firmin: L18_GENS.firmin.look, gaspard: L18_GENS.gaspard.look,
  directeur: L18_GENS.directeur.look, chef: L18_GENS.chef.look, treize: L18_GENS.treize.look, cocher: L18_GENS.cocher.look,
  dame: { dress: true, hairStyle: 'chignon', hair: '#3a2a1a', top: '#7a2a3a', bottom: '#6a2232', skin: '#ecd0bc' },
  dame2: { dress: true, hairStyle: 'boucle', hair: '#c8a060', top: '#2a3a6a', bottom: '#24325a', skin: '#ecd0bc' },
  dame3: { dress: true, hairStyle: 'chignon', hair: '#5a3a24', top: '#e8e0d0', bottom: '#d8d0c0', skin: '#e8c8b0' },
  homme: { hair: '#2a2420', beard: 'moustache', top: '#141418', bottom: '#141418', coat: true, skin: '#e0bca0' },
  homme2: { hair: '#6a6a6a', beard: 'courte', top: '#1a1a22', bottom: '#1a1a22', coat: true, skin: '#dcb898', build: 'rond' },
};
const hotelScenes = {
  cache: new Set(),
  // ------------------------------------------------------------- outils
  W(lx, ly, lz) { return hotel18.monde3(lx, ly, lz); },
  dire(k, i) { const C = L18_CINES[k]; const P = C && C.paroles && C.paroles[i]; return P ? { texte: P[1], qui: P[0] } : { texte: '', qui: '' }; },
  noir(dur, carte) { return { dur, de: h17.joueur(), fondu: 'noir', carte }; },
  peutJouer() {
    if (!game.started || game.mode !== 'play' || game.dying || game.sleeping || ui.panel || cine.on || (farm.s && farm.s.over)) return false;
    if (typeof navigator !== 'undefined' && navigator.webdriver && !h17Cine.auto) return false;
    if (typeof strange !== 'undefined' && (strange.fear > 0.15 || strange.inEnvers() || strange.redNight())) return false;
    if (typeof zone !== 'undefined' && zone.dedans) return false;
    return true;
  },
  // jouer une scène (k : L18_SCENES) ; rejeu : depuis le carnet
  jouer(k, o, rejeu) {
    const B = L18_SCENES[k], V = hotel18.V();
    if (!B || !V || !game.player) return Promise.resolve(false);
    let sc = null;
    try { sc = B(o || {}); } catch (e) { console.error('L18 scène ' + k, e); sc = null; }
    if (!sc) return Promise.resolve(false);
    const S = hotel18.S();
    if (!rejeu) { S.cines[k] = S.cines[k] || farm.s.day; }
    try { const G = store.get('prairie.l18souvenirs', {}) || {}; if (!G[k]) { G[k] = 1; store.set('prairie.l18souvenirs', G); } } catch (e) { /* */ }
    try { game.renderer && game.renderer.uploadCover && game.renderer.uploadCover(V.x, V.z); } catch (e) { /* */ }
    this.cache = new Set(sc.cache || []);
    const apres = sc.apres;
    return h17Cine.jouer(sc.plans, Object.assign({ musique: L18_MUSIQUES[k], cle: 'l18_' + k }, sc.opts || {}, {
      apres: () => {
        this.cache = new Set();
        try { if (apres && !rejeu) apres(); } catch (e) { console.error(e); }
        try { const p = game.player; if (p) game.renderer.uploadCover(p.pos[0], p.pos[2]); } catch (e) { /* */ }
      },
    }));
  },
  souvenirs() { const S = hotel18.S(); let G = {}; try { G = store.get('prairie.l18souvenirs', {}) || {}; } catch (e) { G = {}; } return L18_ORDRE_CINES.filter((k) => S.cines[k] || G[k]); },
  rejouer(k) { if (cine.on || !L18_SCENES[k]) return Promise.resolve(false); if (!hotel18.dansLaVallee() || (game.player && game.player.underground)) { ui.subtitle('', '(Pas d’ici.)', 3); return Promise.resolve(false); } ui.close(true); return this.jouer(k, this.optsRejeu(k), true); },
  optsRejeu(k) {
    const S = hotel18.S(), A = (id) => S.arcs[id] || { choix: {} };
    if (k === 'comtesse_fin') return { fin: A('lucien').fin || 'reste', loin: !!A('lucien').choix.audela };
    if (k === 'concert') return { jouer: A('symphonie').fin !== 'vienne' };
    if (k === 'treize_fin') return { fin: A('treize').fin || 'descendu' };
    if (k === 'funiculaire') return { sens: 'monter', rejeu: true };
    if (k === 'voiture') return { sens: 'monter', rejeu: true };
    return {};
  },
  // ------------------------------------------------------------- la cabine du funiculaire
  cabine() { const V = hotel18.V(), w = hotel18.monde(); return V && V.funi && w ? w.props[V.funi.cabine] : null; },
  // t : 0 en haut, 1 en bas
  poserCabine(t) {
    const V = hotel18.V(), F = V && V.funi, q = this.cabine();
    if (!F || !q) return;
    t = clamp(t, 0.02, 0.98);
    q.x = F.A[0] + F.ux * F.L * t; q.z = F.A[2] + F.uz * F.L * t; q.y = lerp(F.A[1], F.B[1], t) + 0.2;
    q.data = Object.assign({}, q.data, { t });
  },
  funiPos(t, haut, cote) {
    const F = hotel18.V().funi;
    const x = F.A[0] + F.ux * F.L * t - F.uz * (cote || 0), z = F.A[2] + F.uz * F.L * t + F.ux * (cote || 0);
    return [x, lerp(F.A[1], F.B[1], t) + (haut || 0), z];
  },
  funiculaire(it) {
    const h = hotel18.heure(), bas = it && it.data && it.data.gare === 'bas';
    if (h < 6 || h >= 21) { hotel18.dire('', L18_TEXTES.funiNuit, 4); return; }
    ui.choice('Le funiculaire', (bas ? 'La cabine attend, ses trois compartiments en gradins, vernis de rouge. ' : 'La cabine attend au quai, la vallée sous les pieds. ') + L18_TEXTES.funiPrix, [
      { label: bas ? 'Monter (2 pièces)' : 'Descendre (2 pièces)', fn: () => { ui.close(); if (!hotel18.S().embauche && !farm.pay(L18_REGL.funiculaire)) { hotel18.dire('', L18_TEXTES.pasDArgent, 3); return; } this.jouer('funiculaire', { sens: bas ? 'monter' : 'descendre' }); } },
      { label: 'Rester sur le quai', fn: () => ui.close() },
    ]);
  },
  voiture(sens) {
    const h = hotel18.heure();
    if (h < 6 || h >= 21) { hotel18.dire('', L18_TEXTES.voitureNuit, 4); return; }
    if (sens === 'monter') {
      ui.choice('La voiture des Cimes', 'Une calèche verte à capote, les armes des Cimes sur la portière, attelée à deux chevaux qui s’ennuient. ' + L18_TEXTES.voiturePrix, [
        { label: 'Monter aux Cimes (6 pièces)', fn: () => { ui.close(); if (!farm.pay(L18_REGL.voiture)) { hotel18.dire('', L18_TEXTES.pasDArgent, 3); return; } this.jouer('voiture', { sens: 'monter' }); } },
        { label: 'Lire le poteau', fn: () => ui.read('Un poteau indicateur', L18_TEXTES.poteauArret) },
        { label: 'S’en aller', fn: () => ui.close() },
      ]);
    } else {
      if (!hotel18.S().embauche && !farm.pay(L18_REGL.voiture)) { hotel18.dire('', L18_TEXTES.pasDArgent, 3); return; }
      this.jouer('voiture', { sens: 'descendre' });
    }
  },
  // ------------------------------------------------------------- les déclencheurs (chaque seconde)
  tic() {
    const S = hotel18.S(), V = hotel18.V(), p = game.player, h = hotel18.heure();
    if (!V || !p || !this.peutJouer()) return;
    const d = hotel18.distance();
    if (!S.cines.arrivee && d < 170 && p.pos[1] > V.y - 12) { this.jouer('arrivee'); return; }
    const piece = hotel18.pieceDu(p.pos[0], p.pos[1], p.pos[2]);
    if (!S.cines.terrasse && S.cines.arrivee && piece === 'terrasse' && h >= 17 && h < 20) { this.jouer('terrasse'); return; }
    if (!S.cines.bal && piece === 'bal' && hotelScenes.bal() && !hotelHistoires.est('symphonie', 'concert')) { this.jouer('bal'); return; }
    if (!S.cines.aile && (piece === 'aile' || piece === 'treize' || this.dansAile(p))) { this.jouer('aile'); return; }
    // la longue-vue de la terrasse : quand on la regarde, la vallée
  },
  dansAile(p) { const V = hotel18.V(); const [lx, lz] = hotel18.local(p.pos[0], p.pos[2]); return lx > 30.3 && lx < 41.5 && lz > -6.5 && lz < 6.5 && p.pos[1] > V.y - 1; },
  // un soir de bal : le Veilledi, de 20 h 30 à 23 h 30
  bal() { const h = hotel18.heure(); return typeof cal !== 'undefined' && cal.is('veillee') && h >= 20.5 && h < 23.5; },
  longueVue() {
    const S = hotel18.S();
    if (!S.cines.terrasse) { this.jouer('terrasse'); return; }
    const w = hotel18.monde(), lieux = ['chateau', 'abbaye', 'ferme', 'lac', 'grande_porte'].filter((k) => w.lm[k]);
    ui.choice('La longue-vue', 'Le laiton est tiède. On voit la vallée comme à travers une goutte d’eau.', lieux.map((k) => ({ label: 'Regarder ' + (LIEU_NAMES[k] || w.lm[k].name), fn: () => { ui.close(); this.regarder(k); } })).concat([{ label: 'Lâcher la longue-vue', fn: () => ui.close() }]));
  },
  regarder(k) {
    const w = hotel18.monde(), L = w.lm[k], P = this.W(0, 1.4, -39.2);
    if (!L) return;
    const T = [L.x, w.heightAt(L.x, L.z) + 6, L.z], dx = T[0] - P[0], dz = T[2] - P[2], d = Math.hypot(dx, dz);
    const pres = [T[0] - dx / d * 70, Math.max(T[1] + 18, w.heightAt(T[0] - dx / d * 70, T[2] - dz / d * 70) + 14), T[2] - dz / d * 70];
    const dit = { chateau: 'Le château, ses tours mangées de lierre. Une fenêtre, en haut, qui n’a plus de vitre.', abbaye: 'L’abbaye de Montrevel, ses murs sans toit. Un corbeau sur le clocher, ou un moine. D’ici, on ne sait pas.', ferme: 'La vieille ferme des Varenne, sur sa butte. La vôtre. De la fumée sort de la cheminée, ou c’est la brume.', lac: 'Le grand lac, plat comme un miroir, et le phare tout au bout.', grande_porte: 'Au bout de la route de Clairpré, dans la paroi de l’Est : la Grande Porte. Même d’ici, on dirait qu’elle regarde.' }[k] || '';
    h17Cine.jouer([{ dur: 6.5, de: { pos: P, look: T }, a: { pos: pres, look: T }, texte: dit, qui: '' }, { dur: 1.2, de: { pos: pres, look: T }, fondu: 'noir' }], { musique: null });
  },
};

// ---------------------------------------------------------------- les scènes
const L18_SCENES = {
  // ------------------------------------------------------------ l'arrivée
  arrivee() {
    const V = hotel18.V(), W = (a, b, c) => hotelScenes.W(a, b, c), F = V.funi;
    const c = W(0, 9, 0);
    const pB = hotelScenes.funiPos(0.95, 14, 10), pM = hotelScenes.funiPos(0.5, 9, 7), pH = hotelScenes.funiPos(0.08, 6, 5);
    const loge = W(-4.2, 1.2, -6.6);
    return {
      opts: { h: 18.0 },
      plans: [
        { dur: 3.2, de: { pos: W(-80, 80, -480), look: c }, fondu: 'noir', carte: { haut: 'Les monts de l’Est', titre: 'Le Grand Hôtel des Cimes' } },
        { dur: 9, chemin: [{ pos: W(-80, 80, -480), look: c }, { pos: W(-110, 48, -260), look: W(0, 12, 0) }, { pos: W(-70, 22, -120), look: W(0, 10, -4) }], ease: 'lin', ...hotelScenes.dire('arrivee', 0) },
        { dur: 7.5, chemin: [{ pos: pB, look: hotelScenes.funiPos(0.4, 2) }, { pos: pM, look: hotelScenes.funiPos(0.1, 3) }, { pos: pH, look: W(-20, 12, -6) }], ...hotelScenes.dire('arrivee', 1),
          debut: () => hotelScenes.poserCabine(0.9), chaque: (t) => hotelScenes.poserCabine(0.9 - t / 7.5 * 0.85) },
        { dur: 6.5, de: { pos: W(-16, 3.2, -34), look: W(0, 12, -9) }, a: { pos: W(9, 4.2, -26), look: W(0, 15, -8) } },
        { dur: 6.5, de: { pos: W(1.6, 1.75, -8.0), look: loge }, a: { pos: W(0.2, 1.75, -5.2), look: W(-4.6, 1.5, -6.6) }, ...hotelScenes.dire('arrivee', 2), h: 18.4 },
        { dur: 1.8, de: { pos: W(0.2, 1.75, -5.2), look: W(-4.6, 1.5, -6.6) }, fondu: 'noir' },
      ],
      apres: () => { hotel18.voir('sys:l18_hotel'); hotel18.voir('li:l18_hotel'); void F; },
    };
  },
  // ------------------------------------------------------------ l'embauche
  embauche() {
    const W = (a, b, c) => hotelScenes.W(a, b, c);
    return {
      opts: { h: 10 }, cache: ['directeur', 'gaspard'],
      plans: [
        { dur: 1.4, de: h17.joueur(), fondu: 'noir' },
        { dur: 6, de: { pos: W(1.6, 1.7, -2.4), look: W(-3.5, 1.4, -6.4) }, a: { pos: W(0.6, 1.7, -3.6), look: W(-3.6, 1.4, -6.6) }, ...hotelScenes.dire('embauche', 0),
          figurants: [{ look: L18_FIG.directeur, de: W(-2.6, 0.15, -5.6), cap: Math.PI }, { look: L18_FIG.gaspard, de: W(-4.9, 0.15, -6.6), cap: Math.PI / 2 }] },
        { dur: 6.5, de: { pos: W(-1.4, 1.6, -5.4), look: W(-4.9, 1.5, -6.6) }, a: { pos: W(-2.0, 1.6, -5.9), look: W(-4.9, 1.6, -6.6) }, ...hotelScenes.dire('embauche', 1),
          figurants: [{ look: L18_FIG.directeur, de: W(-2.6, 0.15, -5.6), cap: Math.PI }, { look: L18_FIG.gaspard, de: W(-4.9, 0.15, -6.6), a: W(-3.3, 0.15, -6.2), cap: Math.PI / 2 }] },
        { dur: 1.6, de: { pos: W(-2.0, 1.6, -5.9), look: W(-4.9, 1.6, -6.6) }, fondu: 'noir', carte: { haut: 'Le Grand Hôtel des Cimes', titre: 'Concierge', bas: 'stagiaire' } },
      ],
    };
  },
  // ------------------------------------------------------------ la terrasse au couchant
  terrasse() {
    const W = (a, b, c) => hotelScenes.W(a, b, c), w = hotel18.monde();
    const ch = w.lm.chateau, cx = ch ? [ch.x, w.heightAt(ch.x, ch.z) + 8, ch.z] : W(0, -20, -500);
    const val = W(-40, -25, -900);
    return {
      opts: { h: 18.6 }, cache: ['comtesse'],
      plans: [
        { dur: 7.5, de: { pos: W(-14, 1.7, -30), look: W(0, 1.5, -39) }, a: { pos: W(-6, 1.8, -36.5), look: val }, ...hotelScenes.dire('terrasse', 0),
          figurants: [{ look: L18_FIG.comtesse, de: W(0.6, 0, -38.6), cap: Math.PI }] },
        { dur: 8, chemin: [{ pos: W(-2, 3, -41), look: cx }, { pos: W(-2, 14, -60), look: cx }, { pos: W(10, 26, -110), look: val }] },
        { dur: 6.5, de: { pos: W(3, 1.6, -37.2), look: W(0.6, 1.5, -38.6) }, a: { pos: W(2.4, 1.6, -37.6), look: W(0.4, 1.6, -38.8) }, ...hotelScenes.dire('terrasse', 1), h: 18.9,
          figurants: [{ look: L18_FIG.comtesse, de: W(0.6, 0, -38.6), cap: Math.PI * 0.9 }] },
        { dur: 1.6, de: { pos: W(2.4, 1.6, -37.6), look: W(0.4, 1.6, -38.8) }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ le bal du Veilledi
  bal() {
    const W = (a, b, c) => hotelScenes.W(a, b, c);
    const couple = (a0, r, k) => { const L = []; for (let i = 0; i < 2; i++) { const a = a0 + i * Math.PI, b = a + 0.9; L.push({ look: i ? L18_FIG[['homme', 'homme2'][k % 2]] : L18_FIG[['dame', 'dame2', 'dame3'][k % 3]], de: W(-39 + Math.cos(a) * r, 0.15, Math.sin(a) * r), a: W(-39 + Math.cos(b) * r, 0.15, Math.sin(b) * r) }); } return L; };
    const danseurs = (t0) => [...couple(t0, 4.5, 0), ...couple(t0 + 1.6, 6.2, 1), ...couple(t0 + 3.2, 3.2, 2), ...couple(t0 + 4.6, 7.4, 3)];
    return {
      opts: { h: 21.5 }, cache: [],
      plans: [
        { dur: 7, de: { pos: W(-31.5, 2.2, 9), look: W(-40, 1.5, -2) }, a: { pos: W(-32, 3.2, 5), look: W(-42, 3, -3) }, ...hotelScenes.dire('bal', 0), figurants: danseurs(0) },
        { dur: 6.5, orbite: { c: W(-39, 1.4, 0), r: 9, h: 2.2, a0: 1.2, a1: 2.2, look: W(-39, 1.4, 0) }, figurants: danseurs(0.9) },
        { dur: 6.5, de: { pos: W(-44.5, 1.7, -8.6), look: W(-38, 2.5, 2) }, a: { pos: W(-45, 4.5, -8), look: W(-40, 7.4, 0) }, ...hotelScenes.dire('bal', 1), figurants: danseurs(1.8).concat([{ look: L18_FIG.gaspard, de: W(-31.6, 0.15, -8.8), cap: -Math.PI / 2 }]) },
        { dur: 1.6, de: { pos: W(-45, 4.5, -8), look: W(-40, 7.4, 0) }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ l'aile Nord
  aile() {
    const W = (a, b, c) => hotelScenes.W(a, b, c);
    return {
      opts: { h: 1.0 },
      plans: [
        { dur: 1.2, de: h17.joueur(), fondu: 'noir' },
        { dur: 7, de: { pos: W(31.4, 1.6, 5.6), look: W(37, 1, -2) }, a: { pos: W(33, 1.8, 3), look: W(39, 1.2, -3) }, ...hotelScenes.dire('aile', 0) },
        { dur: 7, de: { pos: W(31, 5.6, 0), look: W(38, 5.2, 1.2) }, a: { pos: W(35, 5.6, 0), look: W(38, 5.0, 1.2) }, ...hotelScenes.dire('aile', 1), debut: () => sonL18.timbre(true, 0.5) },
        { dur: 1.6, de: { pos: W(35, 5.6, 0), look: W(38, 5.0, 1.2) }, fondu: 'noir' },
      ],
      apres: () => { hotel18.voir('li:l18_aile'); },
    };
  },
  // ------------------------------------------------------------ le funiculaire
  funiculaire(o) {
    const monter = (o && o.sens) !== 'descendre', V = hotel18.V(), F = V.funi;
    const t0 = monter ? 0.96 : 0.04, t1 = monter ? 0.04 : 0.96, D = o && o.rejeu ? 12 : 13;
    const at = (k) => lerp(t0, t1, k);
    const plans = [
      { dur: D, chemin: [{ pos: hotelScenes.funiPos(at(0), 5, 9), look: hotelScenes.funiPos(at(0), 2) }, { pos: hotelScenes.funiPos(at(0.35), 7, 10), look: hotelScenes.funiPos(at(0.4), 2) }, { pos: hotelScenes.funiPos(at(0.7), 6, -9), look: hotelScenes.funiPos(at(0.75), 2) }, { pos: hotelScenes.funiPos(at(1), 4, -7), look: monter ? hotelScenes.W(-30, 10, -9) : hotelScenes.funiPos(1, 0) }],
        ease: 'entre', ...hotelScenes.dire('funiculaire', 0), debut: () => hotelScenes.poserCabine(t0), chaque: (t) => hotelScenes.poserCabine(lerp(t0, t1, h17Ease(t / D, 'doux'))) },
      { dur: 1.2, de: { pos: hotelScenes.funiPos(t1, 4, -7), look: hotelScenes.funiPos(t1, 1) }, fondu: 'noir' },
    ];
    return {
      opts: { h: hotel18.heure() }, plans,
      apres: () => {
        const Q = monter ? F.quaiH : F.quaiB;
        if (h17Cine.snap) { h17Cine.snap.pos = [Q.x, Q.y + 0.05, Q.z]; h17Cine.snap.yaw = Q.cap + Math.PI / 2; h17Cine.snap.pitch = 0; }
        hotelScenes.poserCabine(t1);
        hotel18.voir('li:l18_funi_' + (monter ? 'haut' : 'bas'));
      },
    };
  },
  // ------------------------------------------------------------ la voiture des Cimes
  voiture(o) {
    const monter = (o && o.sens) !== 'descendre', V = hotel18.V(), w = hotel18.monde(), R = V.route;
    const A = V.arret, ch = w.lm.chateau;
    const P = (x, z, h) => [x, w.heightAt(x, z) + h, z];
    const plans = monter ? [
      { dur: 6, de: { pos: P(A.x - 14, A.z + 10, 4), look: P(A.x + 30, A.z - 30, 1) }, a: { pos: P(A.x + 40, A.z - 30, 6), look: P(A.x + 200, A.z - 70, 2) }, ...hotelScenes.dire('voiture', 0) },
      { dur: 7, chemin: [{ pos: P(R[0][0] - 60, R[0][1] + 20, 22), look: P(R[0][0], R[0][1], 2) }, { pos: P(R[2][0], R[2][1] + 30, 18), look: P(R[3][0], R[3][1], 2) }, { pos: P(R[4][0] - 20, R[4][1] + 40, 26), look: hotelScenes.W(0, 10, 0) }] },
      { dur: 5.5, de: { pos: hotelScenes.W(30, 3, -30), look: hotelScenes.W(0, 6, -9) }, a: { pos: hotelScenes.W(22, 2.4, -20), look: hotelScenes.W(0, 4, -9) } },
      { dur: 1.2, de: { pos: hotelScenes.W(22, 2.4, -20), look: hotelScenes.W(0, 4, -9) }, fondu: 'noir' },
    ] : [
      { dur: 5.5, de: { pos: hotelScenes.W(24, 2.4, -20), look: hotelScenes.W(46, 1.5, -4) }, a: { pos: hotelScenes.W(10, 6, -40), look: hotelScenes.W(-20, 0, -120) }, ...hotelScenes.dire('voiture', 0) },
      { dur: 7, chemin: [{ pos: P(R[4][0] - 20, R[4][1] + 40, 26), look: P(R[3][0], R[3][1], 2) }, { pos: P(R[1][0], R[1][1] + 30, 18), look: ch ? P(ch.x, ch.z, 6) : P(R[0][0], R[0][1], 2) }, { pos: P(A.x + 60, A.z - 40, 12), look: P(A.x, A.z, 2) }] },
      { dur: 1.2, de: { pos: P(A.x + 60, A.z - 40, 12), look: P(A.x, A.z, 2) }, fondu: 'noir' },
    ];
    return {
      opts: { h: hotel18.heure() }, plans,
      apres: () => {
        let to;
        if (monter) to = hotelScenes.W(6, 0.05, -14); else to = [A.x + 2.2, w.heightAt(A.x + 2.2, A.z + 3) + 0.05, A.z + 3];
        if (h17Cine.snap) { h17Cine.snap.pos = to; h17Cine.snap.pitch = 0; h17Cine.snap.yaw = monter ? V.r + Math.PI : 0; }
      },
    };
  },
  // ------------------------------------------------------------ la montre de Lucien (la terrasse au couchant)
  montre() {
    const W = (a, b, c) => hotelScenes.W(a, b, c);
    return {
      opts: { h: 18.7 }, cache: ['comtesse'],
      plans: [
        { dur: 1.2, de: h17.joueur(), fondu: 'noir' },
        { dur: 7, de: { pos: W(2.6, 1.6, -36.6), look: W(0.6, 1.4, -38.6) }, a: { pos: W(2.0, 1.55, -37.3), look: W(0.6, 1.5, -38.6) }, ...hotelScenes.dire('montre', 0),
          figurants: [{ look: L18_FIG.comtesse, de: W(0.6, 0, -38.6), cap: Math.PI * 0.75 }] },
        { dur: 6.5, chemin: [{ pos: W(-1, 2.4, -41.5), look: W(0.6, 1.6, -38.6) }, { pos: W(-4, 3, -43), look: hotelScenes.W(-200, -30, -700) }], ...hotelScenes.dire('montre', 1),
          figurants: [{ look: L18_FIG.comtesse, de: W(0.6, 0, -38.6), cap: Math.PI }] },
      ],
    };
  },
  // ------------------------------------------------------------ l'adieu de la comtesse (au matin)
  comtesse_fin(o) {
    const W = (a, b, c) => hotelScenes.W(a, b, c), reste = (o && o.fin) === 'reste';
    const plans = [{ dur: 1.4, de: h17.joueur(), fondu: 'noir' }];
    if (reste) {
      plans.push({ dur: 7.5, de: { pos: W(-4, 1.7, -34), look: W(0.6, 1.4, -38.6) }, a: { pos: W(-2, 1.7, -36), look: W(0.6, 1.5, -38.6) }, texte: 'Je reste. S’il revient, c’est par ici qu’il passera : il faudra bien que quelqu’un lui ouvre.', qui: 'La comtesse', h: 7.2,
        figurants: [{ look: L18_FIG.comtesse, de: W(0.6, 0, -38.6), cap: Math.PI }] });
      plans.push({ dur: 7, chemin: [{ pos: W(0, 2.5, -41), look: W(-300, -30, -700) }, { pos: W(-10, 20, -90), look: W(-400, -40, -900) }], texte: o && o.loin ? 'Vous avez porté ma lettre de l’autre côté. Il la trouvera. Il a toujours trouvé ce qui est par terre.' : 'Je lui écris encore. Je ne poste plus. Je lis la lettre à la vallée, le soir ; la vallée la lui portera.', qui: 'La comtesse', h: 7.6 });
    } else {
      plans.push({ dur: 7.5, de: { pos: W(12, 2, -18), look: W(30, 1.4, -10) }, a: { pos: W(16, 2, -16), look: W(40, 1.4, -6) }, texte: 'Je rentre à Paris. Il y a un caveau, au Père-Lachaise, avec son nom déjà gravé, et la date en blanc. Je ferai graver la date.', qui: 'La comtesse', h: 7.4,
        figurants: [{ look: L18_FIG.comtesse, de: W(14, 0, -14), a: W(38, 0, -10) }, { look: L18_FIG.cocher, de: W(44, 0, -8), cap: -Math.PI / 2 }] });
      plans.push({ dur: 6.5, chemin: [{ pos: W(30, 4, -30), look: W(44, 1, -6) }, { pos: W(10, 18, -60), look: W(-200, -40, -500) }], texte: 'Merci de ne pas m’avoir menti. C’est la seule chose que je ne pardonne pas, la politesse.', qui: 'La comtesse', h: 7.8 });
    }
    plans.push({ dur: 3, de: { pos: W(-10, 20, -90), look: W(-400, -40, -900) }, fondu: 'noir', carte: { haut: 'Lucien', titre: reste ? 'La longue-vue' : 'La date en blanc' } });
    return { opts: { h: 7.2 }, cache: ['comtesse'], plans };
  },
  // ------------------------------------------------------------ Firmin s'en va
  firmin_depart() {
    const W = (a, b, c) => hotelScenes.W(a, b, c);
    return {
      opts: { h: 6.6 }, cache: ['firmin', 'gaspard', 'cocher'],
      plans: [
        { dur: 1.4, de: h17.joueur(), fondu: 'noir' },
        { dur: 7, de: { pos: W(30, 1.8, -20), look: W(44, 1.2, -4) }, a: { pos: W(34, 1.8, -16), look: W(46, 1.4, -2) }, ...hotelScenes.dire('firmin_depart', 0),
          figurants: [{ look: L18_FIG.firmin, de: W(38, 0, -9), a: W(45, 0, -3), s: 0.86 }, { look: L18_FIG.cocher, de: W(45.4, 0.15, 1.8), cap: -Math.PI / 2 }, { look: L18_FIG.gaspard, de: W(32, 0, -12), cap: Math.PI / 4 }] },
        { dur: 7, chemin: [{ pos: W(34, 1.8, -16), look: W(32, 1.5, -12) }, { pos: W(30, 3, -24), look: W(-60, -10, -300) }], ...hotelScenes.dire('firmin_depart', 1),
          figurants: [{ look: L18_FIG.gaspard, de: W(32, 0, -12), cap: Math.PI }] },
        { dur: 3, de: { pos: W(30, 3, -24), look: W(-60, -10, -300) }, fondu: 'noir', carte: { haut: 'Firmin veut voir Paris', titre: 'Le boulevard des Capucines' } },
      ],
      apres: () => { setTimeout(() => { try { farm.mail('Firmin', 'Une carte de Paris', 'Cher chef concierge (Gaspard dit que c’est vous maintenant),\n\nJ’ai vu les chevaux de l’Opéra. Ils sont plus grands que sur la carte postale, je m’étais trompé. Le Grand Hôtel a sept cents chambres et un ascenseur qui monte tout seul, il fait un bruit de soupir. On m’a donné un gilet à boutons dorés et un numéro, le 43. Je porte des valises de lords anglais. Ils ne donnent pas plus d’un sou non plus.\n\nLe soir je regarde vers le sud-est. On ne voit rien, il y a des toits. Mais je sais que c’est par là.\n\nVotre groom pour toujours,\nFirmin\n\nP.-S. Dites à Mlle Fauvel que j’ai plié mes draps moi-même.'); } catch (e) { /* */ } }, 1000); },
    };
  },
  firmin_reste() {
    const W = (a, b, c) => hotelScenes.W(a, b, c);
    return {
      opts: { h: 7.4 }, cache: ['firmin', 'gaspard'],
      plans: [
        { dur: 1.4, de: h17.joueur(), fondu: 'noir' },
        { dur: 7, de: { pos: W(0.6, 1.6, -4.4), look: W(-3.4, 1.2, -6.4) }, a: { pos: W(-0.4, 1.5, -5.0), look: W(-3.4, 1.0, -6.4) }, ...hotelScenes.dire('firmin_reste', 0),
          figurants: [{ look: L18_FIG.firmin, de: W(-2.6, 0.15, -6.0), cap: -Math.PI / 2, s: 0.86 }, { look: L18_FIG.gaspard, de: W(-3.8, 0.15, -6.5), cap: Math.PI / 2 }] },
        { dur: 7, de: { pos: W(-1.2, 1.4, -5.6), look: W(-3.8, 1.5, -6.5) }, a: { pos: W(-1.6, 1.4, -5.9), look: W(-3.8, 1.6, -6.5) }, ...hotelScenes.dire('firmin_reste', 1),
          figurants: [{ look: L18_FIG.firmin, de: W(-2.6, 0.15, -6.0), cap: -Math.PI / 2, s: 0.86 }, { look: L18_FIG.gaspard, de: W(-3.8, 0.15, -6.5), cap: Math.PI / 2 }] },
        { dur: 3, de: { pos: W(-1.6, 1.4, -5.9), look: W(-3.8, 1.6, -6.5) }, fondu: 'noir', carte: { haut: 'Firmin veut voir Paris', titre: 'Le second' } },
      ],
    };
  },
  // ------------------------------------------------------------ le concert
  concert(o) {
    const W = (a, b, c) => hotelScenes.W(a, b, c), jouer = !!(o && o.jouer);
    const pub = [];
    const L = [L18_FIG.dame, L18_FIG.homme, L18_FIG.dame2, L18_FIG.homme2, L18_FIG.dame3, L18_FIG.directeur, L18_FIG.comtesse, L18_FIG.chef, L18_FIG.gaspard, L18_FIG.firmin];
    for (let i = 0; i < L.length; i++) pub.push({ look: L[i], de: W(-40 + (i % 5) * 1.6, 0.15, -3.2 + Math.floor(i / 5) * 1.8 - 1), cap: Math.PI / 2 * -1, s: L[i] === L18_FIG.firmin ? 0.86 : 1 });
    const pianiste = { look: L18_FIG.wolanski, de: W(-47.4, 0.6, 2.0), cap: Math.PI / 2 };
    const fig = pub.concat([pianiste]);
    const plans = [
      { dur: 1.4, de: h17.joueur(), fondu: 'noir', carte: { haut: 'Salle de bal du Grand Hôtel des Cimes', titre: 'La Vallée', bas: 'symphonie en quatre mouvements de Casimir Wolański' } },
      { dur: 7, de: { pos: W(-31.5, 2.6, 6), look: W(-46, 1.4, 1) }, a: { pos: W(-35, 2.2, 4), look: W(-47, 1.3, 2) }, texte: 'I. L’eau. Un la très grave, qui ne s’arrête jamais ; la main gauche, comme une cascade qu’on entend de loin.', qui: '', figurants: fig },
      { dur: 6.5, de: { pos: W(-45, 1.5, 5), look: W(-47.4, 1.3, 2) }, a: { pos: W(-45.6, 1.6, 4), look: W(-47.4, 1.5, 2) }, texte: 'II. Les cloches. Douze accords, et le treizième qui ne vient pas : le bourdon tient la place.', qui: '', figurants: fig },
      { dur: 6.5, orbite: { c: W(-40, 1.6, -2), r: 7, h: 2.6, a0: 2.4, a1: 3.2, look: W(-40, 1.5, -2) }, texte: 'III. Le vent. Trois notes de berger, montantes ; une quatrième, plus haut, qu’on n’ose pas tout à fait jouer.', qui: '', figurants: fig },
    ];
    if (jouer) {
      plans.push({ dur: 7.5, de: { pos: W(-44, 2, -6), look: W(-47.4, 1.4, 2) }, a: { pos: W(-45, 2.4, -4), look: W(-47.4, 1.6, 2) }, texte: 'IV. Le silence. Puis, dans le silence, quatre notes, une phrase qui ne finit pas. Les bougies baissent toutes ensemble.', qui: '', figurants: fig, h: 23.2, debut: () => sonL18.fredonner() });
      plans.push({ dur: 6.5, de: { pos: W(-36, 3, 8), look: W(-40, 2, -2) }, a: { pos: W(-36, 4, 8), look: W(-40, 6, -2) }, texte: 'Personne n’applaudit. Très loin, au fond de l’hôtel, une sonnette tinte deux fois. Et puis les applaudissements, d’un coup, comme une averse.', qui: '', figurants: fig, debut: () => setTimeout(() => sonL18.timbre(true, 0.7), 1800) });
    } else {
      plans.push({ dur: 7, de: { pos: W(-44, 2, -6), look: W(-47.4, 1.4, 2) }, a: { pos: W(-45, 2.4, -4), look: W(-47.4, 1.6, 2) }, texte: 'IV. Le silence. Il lève les mains au-dessus du clavier, et il les y laisse, une longue minute. Personne ne tousse. Puis il referme le piano.', qui: '', figurants: fig });
      plans.push({ dur: 6, de: { pos: W(-36, 3, 8), look: W(-40, 2, -2) }, a: { pos: W(-36, 4, 8), look: W(-40, 6, -2) }, texte: 'Les applaudissements. Le directeur pleure, et dira demain que c’était le pollen.', qui: '', figurants: fig });
    }
    plans.push({ dur: 3, de: { pos: W(-36, 4, 8), look: W(-40, 6, -2) }, fondu: 'noir', carte: { haut: 'La symphonie de la vallée', titre: jouer ? 'Le quatrième mouvement' : 'Le silence' } });
    return { opts: { h: 21.5 }, cache: ['wolanski', 'comtesse', 'directeur', 'gaspard', 'chef', 'firmin'], plans };
  },
  // ------------------------------------------------------------ le plateau de onze heures
  plateau() {
    const W = (a, b, c) => hotelScenes.W(a, b, c);
    const chef = Object.assign({}, L18_FIG.chef, { held: 'lanterne' });
    return {
      opts: { h: 23 }, cache: ['chef'],
      plans: [
        { dur: 8, de: { pos: W(14, 1.6, 4.2), look: W(26, 1.2, 6) }, a: { pos: W(18, 1.6, 4.6), look: W(29, 1.4, 6) }, ...hotelScenes.dire('plateau', 0),
          figurants: [{ look: chef, de: W(16, 0.15, 5.2), a: W(29.2, 0.15, 6) }] },
        { dur: 5, de: { pos: W(24, 1.5, 4.6), look: W(29.8, 1.2, 6) }, a: { pos: W(25, 1.5, 4.8), look: W(30.5, 1.2, 6) }, texte: '(Il frappe deux fois, du bout du pied. Il ne dit rien. La porte se referme derrière lui.)', qui: '',
          figurants: [{ look: chef, de: W(29.2, 0.15, 6), a: W(31.5, 0.15, 6) }], debut: () => { try { sound.knock && sound.knock(2); } catch (e) { /* */ } } },
        { dur: 1.4, de: { pos: W(25, 1.5, 4.8), look: W(30.5, 1.2, 6) }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ la porte sans numéro
  treize_porte() {
    const W = (a, b, c) => hotelScenes.W(a, b, c);
    return {
      opts: { h: 0.5 },
      plans: [
        { dur: 6.5, de: { pos: W(33, 5.6, 0), look: W(38, 5.4, 1.2) }, a: { pos: W(36.6, 5.5, 0), look: W(38, 5.0, 1.25) }, texte: '(La porte n’a pas de numéro. Sur la poignée de cuivre, une fleur de givre. Elle n’a pas fondu sous votre main.)', qui: '' },
        { dur: 6, de: { pos: W(36.6, 5.5, 0), look: W(38, 5.0, 1.25) }, a: { pos: W(37.3, 5.3, 0.2), look: W(38, 4.9, 1.25) }, ...hotelScenes.dire('treize_porte', 0), debut: () => sonL18.timbre(true, 0.4) },
        { dur: 1.2, de: { pos: W(37.3, 5.3, 0.2), look: W(38, 4.9, 1.25) }, fondu: 'noir' },
      ],
    };
  },
  // ------------------------------------------------------------ la fin de la treize (au matin)
  treize_fin(o) {
    const W = (a, b, c) => hotelScenes.W(a, b, c), V = hotel18.V(), descend = (o && o.fin) !== 'veille';
    const etienne = L18_FIG.treize;
    if (descend) {
      const L = V.chemin || [[V.funi.B[0], V.funi.B[2]], [V.funi.A[0], V.funi.A[2]]], w = hotel18.monde();
      const P = (k, h) => { const q = L[Math.max(0, Math.min(L.length - 1, k))]; return [q[0], w.heightAt(q[0], q[1]) + (h || 0), q[1]]; };
      const n = L.length - 1;
      return {
        opts: { h: 5.6 }, cache: ['treize', 'chef'],
        plans: [
          { dur: 1.4, de: h17.joueur(), fondu: 'noir' },
          { dur: 7, de: { pos: W(42, 1.8, -36), look: W(40, 1, -41) }, a: { pos: W(40, 2.4, -34), look: P(n - 1, 0) }, texte: 'Au lever du jour, un homme en manteau de berger descend le chemin des mulets, sans se presser, un chapeau à la main.', qui: '', figurants: [{ look: etienne, de: W(40, 0, -40), a: P(n - 1, 0) }] },
          { dur: 7.5, chemin: [{ pos: P(n - 2, 14), look: P(n - 3, 0) }, { pos: P(2, 18), look: P(1, 0) }], texte: 'À chaque lacet, il est un peu moins net, comme la brume quand le soleil y entre.', qui: '', figurants: [{ look: etienne, de: P(n - 2, 0), a: P(1, 0) }], h: 6.1 },
          { dur: 6.5, de: { pos: P(0, 10), look: P(0, 0) }, a: { pos: P(0, 16), look: hotelScenes.W(-100, -20, -400) }, texte: 'En bas, au pied de la voie, il n’y a plus personne. Dans la loge, le treizième timbre n’a plus de battant.', qui: '', h: 6.5, debut: () => sonL18.timbre(true, 0.25) },
          { dur: 3, de: { pos: P(0, 16), look: hotelScenes.W(-100, -20, -400) }, fondu: 'noir', carte: { haut: 'La treize', titre: 'Redescendu' } },
        ],
        apres: () => { try { hotel18.monde().doors[V.portes.treize].open = 1; } catch (e) { /* */ } },
      };
    }
    return {
      opts: { h: 5.8 }, cache: ['treize', 'chef'],
      plans: [
        { dur: 1.4, de: h17.joueur(), fondu: 'noir' },
        { dur: 7.5, de: { pos: W(37.2, 5.6, 2.6), look: W(39.6, 5.4, 6.2) }, a: { pos: W(37.6, 5.5, 3.2), look: W(40.2, 5.6, 7) }, texte: 'Au lever du jour, on a déposé les planches de la fenêtre de la treize. Un homme y est assis, et regarde le col.', qui: '',
          figurants: [{ look: etienne, de: W(39.0, 4, 5.6), cap: Math.PI * 0.85 }, { look: Object.assign({}, L18_FIG.chef, { held: null }), de: W(37.6, 4, 4.6), cap: 0.6 }] },
        { dur: 7, chemin: [{ pos: W(43, 9, 8), look: W(40, 5.5, 6.6) }, { pos: W(60, 30, 40), look: hotelScenes.W(-200, 30, 600) }], texte: 'Le col est clair. La neige se repose. Quelqu’un veille, et ce n’est plus une peine.', qui: '', h: 6.4 },
        { dur: 3, de: { pos: W(60, 30, 40), look: hotelScenes.W(-200, 30, 600) }, fondu: 'noir', carte: { haut: 'La treize', titre: 'Le veilleur du col' } },
      ],
    };
  },
};

// ---------------------------------------------------------------- les gens cachés pendant une scène (les figurants les remplacent)
hotelGens.surcharges.unshift((id) => (hotelScenes.cache.has(id) && cine.on ? { place: null, pose: 'absent' } : null));
// ---------------------------------------------------------------- la cabine : elle fait l'aller-retour toute seule, de jour (une course toutes les quatre minutes)
{
  let t = 0;
  HOOKS.update.push((dt) => {
    if (!farm.s || !hotel18.V() || cine.on) return;
    t += dt;
    const h = hotel18.heure(), cyc = 240, k = (t % cyc) / cyc;
    // de 6 h à 21 h : en haut, elle descend, attend en bas, remonte, attend en haut
    if (h < 6 || h >= 21) { hotelScenes.poserCabine(0.02); return; }
    const pos = k < 0.15 ? 0 : k < 0.45 ? (k - 0.15) / 0.3 : k < 0.6 ? 1 : k < 0.9 ? 1 - (k - 0.6) / 0.3 : 0;
    if (hotel18.distance() < 600 || Math.hypot(game.player.pos[0] - hotel18.V().funi.B[0], game.player.pos[2] - hotel18.V().funi.B[2]) < 300) hotelScenes.poserCabine(h17Ease(pos, 'doux'));
  });
}
// ---------------------------------------------------------------- les bals du Veilledi : les clients dansent
hotelGens.surcharges.push((id, h, g) => {
  if (!g.client || !hotelScenes.bal()) return null;
  const S = hotel18.S(), i = S.clients.L.findIndex((c) => c.id === id);
  return i >= 0 ? { place: 'bal_danse' + (i % 8), pose: 'danse' } : null;
});
// ---------------------------------------------------------------- branchements
HOOKS.inter.l18_funi = (it) => hotelScenes.funiculaire(it);
HOOKS.inter.l18_voiture = (it) => hotelScenes.voiture(it.data && it.data.sens === 'monter' ? 'monter' : 'descendre');
HOOKS.inter.l18_longue_vue = () => hotelScenes.longueVue();
{
  let t = 0;
  HOOKS.update.push((dt) => { t -= dt; if (t > 0 || !farm.s || !hotel18.V()) return; t = 1; try { hotelScenes.tic(); } catch (e) { if (!hotelScenes._err) { hotelScenes._err = true; console.error('L18 scènes', e); } } });
}
HOOKS.load.push(() => { hotelScenes.cache = new Set(); });
