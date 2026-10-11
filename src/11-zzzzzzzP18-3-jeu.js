// ============================================================================
//  LES CASCADES, LES GROTTES ET LES COINS DE PARADIS (agent P18) — 4. LE JEU
//  - passer derrière le rideau de la Grande Chute : on y entre en marchant dans
//    la bouche (ou E) ; on ressort par le Vestibule, ou par les racines de
//    l'aven (dehors : avec une corde, on y descend) ;
//  - les Grottes de la Chute sont un morceau du Dessous (son moteur, sa nuit,
//    ses bêtes, les marques au charbon) : il faut une lanterne ; le nom de la
//    salle s'affiche quand on y entre ; des cairns et des flèches peintes
//    ramènent vers la sortie ; le carnet en dessine le plan (ce qu'on a vu) ;
//  - la dalle du Sanctuaire s'ouvre en posant la main dans les trois creux, dans
//    l'ordre des Trois peint dans la Galerie des Mains (l'aube, la pierre, la nuit) ;
//  - les coins de paradis : s'y asseoir (une fois par jour : un peu de forces, la
//    tête plus claire), le bain tiède, une musique à eux ; on les apprend en y
//    allant (les découvertes, le wiki) ; les habitants en parlent à demi-mot ;
//  - les découvertes : chaque chute, chaque coin, chaque salle (une cinématique la
//    première fois pour les chutes, l'entrée de la grotte, trois grandes salles et
//    les coins — voir 11-zzzzzzzP18-5-scenes.js).
//  État : farm.s.p18 = { v, vu: { clé: jour }, salles: { clé: jour }, pris: { id: jour }, porte: jour, signes: [],
//         repos: { coin: jour }, bain: jour, ocre: jour, cines: { clé: jour }, aVoir: [clés] }.
//  API : p18Jeu (S(), W(), entrer(), sortir(), …).
// ============================================================================
defItem('ocre', 'Ocre rouge', 'materiau', 3, ['tas', '#a0482c'], { desc: 'Une poudre rouge sombre, grattée sur la paroi d’une grotte. Elle tache les doigts pour la journée. On en faisait de la peinture, il y a très longtemps.' });
if (typeof ESSENCES !== 'undefined') Object.assign(ESSENCES, { ocre: { terre: 2, sang: 1 } });
DYN_PROPS.add('p18_rayon');

const P18_REPOS_SOIN = 12;     // PV rendus en s'asseyant dans un coin de paradis (une fois par jour et par coin)
const P18_REPOS_ESPRIT = 3;    // la tête plus claire (plafond : 6 par jour pour tous les coins)
const P18_BAIN_SOIN = 25;      // le bain tiède (une fois par jour)
const P18_PREMIERE_FOIS = 4;   // l'esprit, la première fois qu'on trouve un coin

const p18Jeu = {
  porteAnim: null, signes: [], salleT: 0, salle: null, coinIci: null, sonT: 0, vuT: 0, boucheT: 0,
  // ------------------------------------------------------------ l'état
  S() {
    const s = farm.s;
    if (!s) return { vu: {}, salles: {}, pris: {}, repos: {}, cines: {}, signes: [], aVoir: [] };
    const S = s.p18 || (s.p18 = { v: 1 });
    for (const k of ['vu', 'salles', 'pris', 'repos', 'cines']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    if (!Array.isArray(S.signes)) S.signes = [];
    if (!Array.isArray(S.aVoir)) S.aVoir = [];
    return S;
  },
  W() { const w = game.world; return w && w.p18 ? w.p18 : null; },
  chute(k) { const W = this.W(); return W && W.chutes.find((c) => c.k === k); },
  coin(k) { const W = this.W(); return W && W.coins.find((c) => c.k === k); },
  dansGrotte(p) { p = p || game.player.pos; return !!(game.world && game.world.p18 && p[1] < SOUT_TOP && p18Grotte.dans(p[0], p[2])); },

  // ------------------------------------------------------------ entrer, sortir
  async entrer() {
    if (game.sleeping || this._passe) return;
    const W = this.W(), P = P18_GROTTE, S = this.S();
    if (!W) return;
    this._passe = true;
    try {
      const premier = !S.entrees;
      S.entrees = (S.entrees || 0) + 1;
      const noir = !(game.lantern && farm.count('lanterne')) && !(typeof soutLuisante !== 'undefined' && soutLuisante.on);
      const to = [P.arrivee[0], souterrain.floorAt(P.arrivee[0], P.arrivee[2]) + 0.05, P.arrivee[2]];
      await game.teleport(to, P18_TEXTES.entrer);
      const p = game.player; p.yaw = Math.atan2(1, 0); p.pitch = 0; // vers l'ouest (le fond)
      if (noir) setTimeout(() => ui.subtitle('', '(' + P18_TEXTES.entrerNoir + ')', 3.5), 600);
      this.voirSalle('vestibule');
      if (premier) this.retenir('grotte');
    } finally { this._passe = false; }
  },
  async sortir() {
    if (game.sleeping || this._passe) return;
    const D = this.chute('grande'), C = P18_CHUTES.find((c) => c.k === 'grande');
    if (!D || !D.bouche) return;
    this._passe = true;
    try {
      const [x, z] = P18_GROTTE.sortie, y = game.world.heightAt(x, z) + 0.05;
      await game.teleport([x, y, z], P18_TEXTES.sortir);
      const p = game.player; p.yaw = Math.atan2(-1, 0); p.pitch = 0.05; // vers le rideau (l'est)
      this.boucheT = 2.5; // (on ne retombe pas dans la bouche en reculant)
      void C;
    } finally { this._passe = false; }
  },
  // les racines de l'aven : on monte vers le jour
  async grimper() {
    const W = this.W(), A = W && W.grotte && W.grotte.aven;
    if (!A || game.sleeping) return;
    if (corps.jambeCassee && corps.jambeCassee() && Math.random() < 0.6) { ui.subtitle('', '(Avec cette jambe, les racines vous échappent.)', 2.5); return; }
    await game.teleport(A.haut, P18_TEXTES.aven);
    this.retenir('aven');
  },
  // l'aven, dehors : on y descend avec une corde
  async aven() {
    const W = this.W(), A = W && W.grotte && W.grotte.aven;
    if (!A) return;
    if (!farm.count('corde')) { ui.subtitle('', P18_TEXTES.avenHaut + ' ' + P18_TEXTES.avenSansCorde, 4); return; }
    await game.teleport(A.bas, P18_TEXTES.avenDescendre);
    this.voirSalle('aven');
  },

  // ------------------------------------------------------------ ce qu'on retient (découvertes, cinématiques)
  retenir(k) {
    const S = this.S();
    if (S.vu[k]) return false;
    S.vu[k] = farm.s.day;
    const lm = 'p18_' + k;
    if (game.world.lm[lm]) { if (typeof savoir !== 'undefined') savoir.connaitreLieu(lm); if (typeof decouvertes !== 'undefined') { this._ok = true; try { decouvertes.voir('li:' + lm); } finally { this._ok = false; } } }
    if (typeof P18_SCENES !== 'undefined' && P18_SCENES[k] && !S.cines[k] && !S.aVoir.includes(k)) S.aVoir.push(k);
    return true;
  },
  voirSalle(k) {
    const S = this.S();
    if (!k) return;
    const neuf = !S.salles[k];
    if (neuf) S.salles[k] = farm.s.day;
    const lm = 'p18g_' + k;
    if (typeof savoir !== 'undefined') savoir.connaitreLieu(lm);
    if (typeof decouvertes !== 'undefined') { this._ok = true; try { decouvertes.voir('li:' + lm); if (Object.keys(S.salles).length >= 3) decouvertes.voir('li:p18_grotte'); } finally { this._ok = false; } }
    if (neuf && typeof P18_SCENES !== 'undefined' && P18_SCENES['g_' + k] && !S.cines['g_' + k] && !S.aVoir.includes('g_' + k)) S.aVoir.push('g_' + k);
  },

  // ------------------------------------------------------------ chaque image
  update(dt, eye, basis, sky, playing) {
    const W = this.W();
    if (!W || !farm.s || game.kind !== 'farm') return;
    const p = game.player, S = this.S();
    this.boucheT = Math.max(0, this.boucheT - dt);
    const dedans = this.dansGrotte(p.pos);
    // pendant une scène, rien à découvrir : le personnage n'est posé là que le temps de la scène (et il est rendu après)
    if (cine.on) { this.sons(dt, eye, dedans); return; }
    // la bouche, derrière le rideau : on y entre en marchant
    const G = this.chute('grande');
    if (playing && !dedans && G && G.bouche && !game.sleeping && !this._passe && this.boucheT <= 0 && !cine.on) {
      const [bx, by, bz] = G.bouche, d = Math.hypot(p.pos[0] - (bx + 0.6), p.pos[2] - bz);
      if (d < 1.15 && Math.abs(p.pos[1] - by) < 2.2) this.entrer();
      // la première fois qu'on passe derrière le rideau : une scène (l'entrée de la grotte)
      if (d < 9 && Math.abs(p.pos[1] - by) < 3 && !S.vu.bouche) this.retenir('bouche');
    }
    // les salles (deux fois par seconde)
    this.salleT -= dt;
    if (this.salleT <= 0) {
      this.salleT = 0.5;
      if (dedans) {
        const k = p18Grotte.salle(p.pos[0], p.pos[2]);
        if (k && k !== this.salle) { this.salle = k; this.voirSalle(k); if (typeof soutLieu !== 'undefined' && game.mode === 'play') soutLieu.montrer(P18_SALLES_NOMS[k] || k); }
        if (!k) this.salle = null;
      } else this.salle = null;
      // les chutes et les coins : on les trouve en y allant
      if (!dedans && !p.underground) {
        for (const C of W.chutes) {
          if (C.sous || S.vu[C.k]) continue;
          const B = C.bassin, x = B ? B.x : C.x, z = B ? B.z : C.z, r = B ? B.r + 26 : 30;
          if (Math.hypot(p.pos[0] - x, p.pos[2] - z) < r && this.voit(eye, [C.x, (C.y0 + C.y1) / 2, C.z])) this.retenir(C.k);
        }
        let ici = null;
        for (const Q of W.coins) if (Math.hypot(p.pos[0] - Q.x, p.pos[2] - Q.z) < Q.r + 2 && Math.abs(p.pos[1] - Q.y) < 12) ici = Q;
        if (ici && !S.vu[ici.k]) { this.retenir(ici.k); try { esprit.changer(P18_PREMIERE_FOIS, 'un coin de paradis', P18_PREMIERE_FOIS * 2); } catch (e) { /* rien */ } }
        if (ici !== this.coinIci) { this.coinIci = ici; if (ici) this.musiqueBientot(); }
      } else this.coinIci = null;
    }
    // le bain : on y est (dans l'eau tiède) ?
    // une scène à voir (au premier moment tranquille)
    if (S.aVoir.length && !cine.on && typeof p18Scenes !== 'undefined') p18Scenes.peutEtre(S);
    this.sons(dt, eye, dedans);
  },
  // la chute se voit-elle d'ici (le relief ne la cache pas) ?
  voit(eye, T) {
    const w = game.world, n = 10;
    for (let i = 1; i < n; i++) { const k = i / n, x = lerp(eye[0], T[0], k), y = lerp(eye[1], T[1], k), z = lerp(eye[2], T[2], k); if (w.heightAt(x, z) > y + 0.8) return false; }
    return true;
  },
  // ------------------------------------------------------------ les sons : le grondement des chutes, la rivière d'en bas, la perte
  sons(dt, eye, dedans) {
    this.sonT -= dt;
    if (this.sonT > 0 || !sound.ok || !sound.source) return;
    this.sonT = 0.3;
    const W = this.W(), w = game.world, sous = !!souterrain.actif;
    const L = [];
    for (const C of W.chutes) {
      if (!!C.sous !== sous) continue;
      const cy = C.y1 + Math.min(4, (C.y0 - C.y1) * 0.2), d = Math.hypot(C.x - eye[0], cy - eye[1], C.z - eye[2]);
      if (d < 260) L.push([d, C, cy]);
    }
    L.sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < Math.min(2, L.length); i++) {
      const [d, C, cy] = L[i];
      const H = C.y0 - C.y1, k = clamp(0.45 + H / 40 + C.l / 20, 0.5, 1.4);
      const cache = !sous && !this.voit(eye, [C.x, cy + 2, C.z]);
      sound.source('p18_' + C.k, 'chute', [C.x, cy, C.z], k * (cache ? 0.55 : 1), { ref: 12 + C.l * 0.8, roll: 1, lp: cache ? 900 : sous ? 5000 : 20000 });
    }
    // les petites chutes (les gradins, la rivière d'en bas) : la plus proche, en ruisseau
    let best = null, bd = 60;
    for (const M of W.minis) { if (!!M.sous !== sous) continue; const d = Math.hypot(M.x - eye[0], (M.y0 + M.y1) / 2 - eye[1], M.z - eye[2]); if (d < bd) { bd = d; best = M; } }
    if (best) sound.source('p18_mini', 'riviere', [best.x, best.y1 + 0.5, best.z], clamp(0.5 + (best.y0 - best.y1) * 0.25, 0.5, 1.3), { ref: 4, roll: 1 });
    // la perte : un glouglou qui descend
    const G = this.chute('grande');
    if (!sous && G && G.perte) { const [x, z, y] = G.perte, d = Math.hypot(x - eye[0], z - eye[2]); if (d < 40) sound.source('p18_perte', 'riviere', [x, y - 0.5, z], 0.7, { ref: 3, roll: 1.2, lp: 900, rate: 0.7 }); }
  },
  // la musique des coins de paradis vient sans trop attendre
  musiqueBientot() {
    try {
      if (typeof musique === 'undefined' || !sound.ctx || !musique.actif()) return;
      const now = sound.ctx.currentTime;
      if (musique.phase === 'repos' && now - (musique.finT || -1e9) > 45 && (musique.prochain < 0 || musique.prochain - now > 8)) musique.prochain = now + 4 + Math.random() * 5;
    } catch (e) { /* rien */ }
  },

  // ------------------------------------------------------------ les coins : s'asseoir, se baigner
  reposer(it) {
    const S = this.S(), k = it.data && it.data.coin, s = farm.s, p = game.player;
    if (!k) return;
    if (S.repos[k] === s.day) { ui.subtitle('', P18_TEXTES.reposDeja, 3); return; }
    S.repos[k] = s.day;
    p.hp = Math.min(p.maxHp || 100, p.hp + P18_REPOS_SOIN); p.stamina = 1;
    try { esprit.changer(P18_REPOS_ESPRIT, 'un coin de paradis', P18_REPOS_ESPRIT * 2); } catch (e) { /* rien */ }
    ui.subtitle('', P18_TEXTES.repos, 3.5);
    this.musiqueBientot();
  },
  baigner(it) {
    const S = this.S(), s = farm.s, p = game.player;
    sound.splash && sound.splash();
    if (S.bain === s.day) { ui.subtitle('', P18_TEXTES.bainDeja, 3); return; }
    S.bain = s.day;
    p.hp = Math.min(p.maxHp || 100, p.hp + P18_BAIN_SOIN); p.stamina = 1;
    try { esprit.changer(P18_REPOS_ESPRIT, 'le bain', P18_REPOS_ESPRIT * 2); } catch (e) { /* rien */ }
    if (typeof corps !== 'undefined' && corps.C && corps.C().saigne > 0) corps.C().saigne = Math.max(0, corps.C().saigne * 0.5);
    ui.subtitle('', P18_TEXTES.bain, 3.5);
  },

  // ------------------------------------------------------------ dans la grotte : peintures, ocre, signes, trouvailles
  peinture(it) {
    const d = it.data || {};
    ui.read('Sur la paroi', d.txt || '');
    if (typeof decouvertes !== 'undefined') { this._ok = true; try { decouvertes.voir('li:p18g_' + (P18_PEINTURES.find((q) => q[0] === d.k) || [0, 'mains'])[1]); } finally { this._ok = false; } }
    this.S().peint = Object.assign(this.S().peint || {}, { [d.k]: farm.s.day });
  },
  ocre() {
    const S = this.S();
    if (S.ocre === farm.s.day) { ui.subtitle('', '(La paroi est grattée jusqu’au blanc, ici. Demain, ailleurs.)', 3); return; }
    S.ocre = farm.s.day;
    farm.give('ocre', 2); play.flyer && play.flyer('ocre', [game.player.pos[0], game.player.pos[1] + 1, game.player.pos[2]], 2); sound.dig && sound.dig(0.3);
  },
  signe(it) {
    const S = this.S(), k = it.data && it.data.k;
    if (S.porte) return;
    if (!P18_SIGNES.includes(k) || this.signes.includes(k)) return;
    const attendu = P18_SIGNES[this.signes.length];
    if (k !== attendu) {
      this.signes = [];
      ui.subtitle('', P18_TEXTES.porteMauvais, 3);
      sound.rumble && sound.rumble();
      return;
    }
    this.signes.push(k);
    if (typeof temple !== 'undefined' && temple.note) temple.note(k);
    if (this.signes.length === 3) setTimeout(() => this.ouvrir(true), 900);
  },
  porte() {
    const W = this.W();
    return W && W.grotte && W.grotte.porte !== undefined ? game.world.blocks[W.grotte.porte] : null;
  },
  cacherPorte(cache) {
    const b = this.porte(), w = game.world;
    if (!b) return;
    b.ver = cache ? P18_VER_PORTE : VER_SOUS;
    w.grid = null; w.blocksDirty = true; w.coverDirty = true;
  },
  ouvrir(anim) {
    const S = this.S(), b = this.porte();
    if (S.porte || !b) return;
    S.porte = farm.s.day;
    this.cacherPorte(true);
    if (anim) {
      this.porteAnim = { t: 0, dur: 4.2, b: { x: b.x, y: b.y, z: b.z, sx: b.sx, sy: b.sy, sz: b.sz, r: b.r || 0, m: b.m } };
      sound.rumble && sound.rumble(); setTimeout(() => sound.rumble && sound.rumble(), 1600);
      ui.subtitle('', P18_TEXTES.porteOuverte, 4);
    }
  },
  tresor(it) {
    const S = this.S(), w = game.world;
    if (S.pris.p18_tresor) return;
    S.pris.p18_tresor = farm.s.day;
    const T = (this.W().grotte.trouvailles || []).find((q) => q.id === 'p18_tresor');
    const pos = [it.x, it.y + 0.3, it.z];
    for (const [id, n] of (T ? T.items : [])) { if (id === 'argent') { farm.earn(n); sound.coin && sound.coin(); continue; } farm.give(id, n); play.flyer && play.flyer(id, pos, n); }
    const q = w.props[it.data.prop]; if (q && q.id === 'coffre_vieux') { q.data = Object.assign({}, q.data, { vide: true }); farm.dirtyProps = true; }
    sound.lock && sound.lock(false);
    ui.subtitle('', '(Sous la poussière, un coffre cerclé de fer. Il n’était pas fermé.)', 3.5);
  },
  trouver(it) {
    const S = this.S(), w = game.world, d = it.data || {};
    if (S.pris[it.id]) return;
    S.pris[it.id] = farm.s.day;
    farm.give(d.item, 1); play.flyer && play.flyer(d.item, [it.x, it.y, it.z], 1); sound.pop && sound.pop();
    this.cacherTrouvailles();
  },
  // au chargement : la porte ouverte, le coffre vide, les trouvailles prises
  appliquer() {
    const W = this.W(), w = game.world;
    this.porteAnim = null; this.signes = []; this.salle = null; this.coinIci = null; this._passe = false;
    if (!W || !farm.s) return;
    const S = this.S();
    this.cacherPorte(!!S.porte);
    const T = W.grotte && W.grotte.trouvailles;
    if (S.pris.p18_tresor && W.grotte) { const it = w.inter.find((q) => q.kind === 'p18_tresor'); const q = it && w.props[it.data.prop]; if (q) q.data = Object.assign({}, q.data, { vide: true }); }
    this.cacherTrouvailles();
    void T;
  },
  cacherTrouvailles() {
    const S = this.S(), w = game.world;
    let chg = false;
    for (const it of w.inter) {
      if (it.kind !== 'p18_trouve' || !S.pris[it.id]) continue;
      const q = w.props[it.data.prop];
      if (q && !q.gone) { q.gone = true; chg = true; }
    }
    if (chg) farm.dirtyProps = true;
  },
};

// ---------------------------------------------------------------- on ne bâtit pas au bord des chutes ni dans les coins de paradis
{
  const _idb = interditDeBatir;
  interditDeBatir = function (x, z, r) {
    const P = _idb(x, z, r);
    if (P) return P;
    const W = game.world && game.world.p18;
    if (W && W.zones) for (const Z of W.zones) if (Math.hypot(x - Z.x, z - Z.z) < Z.r + (r || 0)) return Z;
    return null;
  };
}

// ---------------------------------------------------------------- les interactions
HOOKS.inter.p18_grotte = () => p18Jeu.entrer();
HOOKS.inter.p18_sortie = () => p18Jeu.sortir();
HOOKS.inter.p18_racines = () => p18Jeu.grimper();
HOOKS.inter.p18_aven = () => p18Jeu.aven();
HOOKS.inter.p18_eboulis = () => { ui.subtitle('', P18_TEXTES.eboulis, 4.5); if (typeof soutSon !== 'undefined' && soutSon.goutte) soutSon.goutte(); };
HOOKS.inter.p18_perte = () => ui.subtitle('', P18_TEXTES.perte, 3.5);
HOOKS.inter.p18_peinture = (it) => p18Jeu.peinture(it);
HOOKS.inter.p18_ocre = () => p18Jeu.ocre();
HOOKS.inter.p18_signe = (it) => { if (p18Jeu.S().porte) return; if (!p18Jeu.signes.length && !p18Jeu.S().porteDit) { p18Jeu.S().porteDit = 1; ui.subtitle('', P18_TEXTES.porteFermee, 4); } p18Jeu.signe(it); };
HOOKS.inter.p18_tresor = (it) => p18Jeu.tresor(it);
HOOKS.inter.p18_trouve = (it) => p18Jeu.trouver(it);
HOOKS.inter.p18_repos = (it) => p18Jeu.reposer(it);
HOOKS.inter.p18_bain = (it) => p18Jeu.baigner(it);
HOOKS.inter.p18_carnet = () => ui.read('Un carnet de géologue', P18_CARNET);
HOOKS.interVis.p18_tresor = () => !p18Jeu.S().pris.p18_tresor;
HOOKS.interVis.p18_trouve = (it) => !p18Jeu.S().pris[it.id];
HOOKS.interVis.p18_signe = () => !p18Jeu.S().porte;
HOOKS.interVis.p18_racines = () => true;

// le carnet du géologue (dans le Vestibule) : le seul plan qu'on ait, au début
const P18_CARNET = 'Juin 1823. J. Castan, des Mines.\n\n' +
  'Entré par derrière la chute, comme me l’avait dit le berger. L’eau fait un bruit de forge ; dedans, plus rien.\n\n' +
  'Du Vestibule, deux chemins. À droite, vers le levant, on remonte doucement : un trou dans la voûte, le jour, des racines qui pendent. On peut sortir par là, avec de bons bras.\n\n' +
  'À gauche, la Galerie des Mains. Je n’ai pas su compter les mains. Trois figures, aussi. Je les ai recopiées, dans l’ordre : la femme au soleil, l’homme de pierre, l’autre.\n\n' +
  'Plus bas, une salle si haute que la lanterne n’en trouve pas le plafond. Des chauves-souris par milliers. Une dalle, au fond, qui ne bouge pas.\n\n' +
  'Plus bas encore, un lac. Des champignons qui éclairent comme des veilleuses. J’ai laissé des cairns et des flèches à la craie rouge : elles montrent toutes la sortie.\n\n' +
  'J’ai entendu une rivière sous mes pieds tout le temps. Je ne l’ai pas trouvée. Je reviendrai avec des cordes.';

// ---------------------------------------------------------------- le Dessous : nos grottes en sont un morceau
{
  // dessous = dans la région du Dessous, ou dans la boîte des grottes
  const _dr = souterrain.dansRegion.bind(souterrain);
  souterrain.dansRegion = function (x, z) { return _dr(x, z) || (!!(game.world && game.world.p18) && p18Grotte.dans(x, z)); };
  // les zones du Dessous ne débordent pas jusqu'ici (son carnet des lieux vus reste le sien)
  const _zone = souterrain.zone.bind(souterrain);
  souterrain.zone = function (x, z) { if (p18Grotte.dans(x, z) && !(x > SOUT_X0 && x < SOUT_X1 && z > SOUT_Z0 && z < SOUT_Z1)) return null; return _zone(x, z); };
  const _nl = souterrain.nomLieu.bind(souterrain);
  souterrain.nomLieu = function (x, z) { if (p18Grotte.dans(x, z) && !(x > SOUT_X0 && x < SOUT_X1 && z > SOUT_Z0 && z < SOUT_Z1)) { const k = p18Grotte.salle(x, z); return k ? P18_SALLES_NOMS[k] : LIEU_NAMES.p18_grotte; } return _nl(x, z); };
  // (le nom de la salle : on le montre nous-mêmes ; celui du Dessous ne la connaît pas)
  if (souterrain.salleIci) {
    const _si = souterrain.salleIci.bind(souterrain);
    souterrain.salleIci = function (x, z) { if (p18Grotte.dans(x, z)) { const k = p18Grotte.salle(x, z); return k ? 'p18:' + k : null; } return _si(x, z); };
  }
  // dans les grandes salles, le noir porte plus loin ; sous l'aven, le jour descend
  const _cf = souterrain.cielFx;
  souterrain.cielFx = function (sky) {
    if (_cf) _cf.call(this, sky);
    const p = game.player;
    if (!p || !p18Grotte.dans(p.pos[0], p.pos[2])) return;
    const k = p18Jeu.salle, big = ['cathedrale', 'lac', 'tonnerre', 'draperies', 'cristaux'].includes(k) ? 1 : 0;
    this._p18F = lerp(this._p18F || 0, big, 0.02);
    sky.fog = [5 + 6 * this._p18F, 78 + 60 * this._p18F];
    if (k === 'aven') { const t = (game.world && game.world.time) || 0, j = clamp(Math.min((t - 0.26) / 0.06, (0.76 - t) / 0.06), 0, 1); sky.amb = [sky.amb[0] + 0.05 * j, sky.amb[1] + 0.055 * j, sky.amb[2] + 0.06 * j]; }
  };
  // les bêtes d'en bas : nos nids, après les leurs
  if (typeof soutBetes !== 'undefined') {
    const _cn = soutBetes.construireNids.bind(soutBetes);
    soutBetes.construireNids = function () {
      if (this.nids) return this.nids;
      const N = _cn();
      const W = game.world && game.world.p18, G = W && W.grotte;
      if (G && G.nids) for (const [k, x, y, z, n] of G.nids) N.push({ i: N.length, k, x, y, z, n, vie: 0, mort: 0, p18: 1 });
      return N;
    };
  }
}
// ---------------------------------------------------------------- les découvertes : les salles des grottes ne s'apprennent qu'en y entrant
{
  const _v = decouvertes.voir.bind(decouvertes);
  decouvertes.voir = function (id, k) {
    // (les salles, la bouche, l'aven : c'est le jeu qui les donne, quand on y est vraiment ; pas le relevé des lieux proches)
    if (!p18Jeu._ok && typeof id === 'string' && (id.startsWith('li:p18g_') || id === 'li:p18_grotte' || id === 'li:p18_bouche' || id === 'li:p18_aven')) return false;
    return _v(id, k);
  };
}

// ---------------------------------------------------------------- les habitants en parlent (à demi-mot)
{
  const tous = () => NPC_DATA.concat(typeof C2_HABITANTS !== 'undefined' ? C2_HABITANTS.filter((d) => !NPC_DATA.includes(d)) : []);
  for (const id in P18_RUMEURS) {
    const d = tous().find((x) => x.id === id);
    if (d && d.lines && Array.isArray(d.lines.rumeurs)) for (const l of P18_RUMEURS[id]) if (!d.lines.rumeurs.includes(l)) d.lines.rumeurs.push(l);
  }
  if (typeof NPC_GENERIC !== 'undefined' && Array.isArray(NPC_GENERIC.rumeurs)) for (const l of P18_RUMEURS_TOUS) if (!NPC_GENERIC.rumeurs.includes(l)) NPC_GENERIC.rumeurs.push(l);
}

// ---------------------------------------------------------------- les lumières : le jour de l'aven, les cristaux, les champignons du lac
HOOKS.lights.push((eye) => {
  const W = game.world && game.world.p18;
  if (!W || !souterrain.actif || !p18Grotte.dans(eye[0], eye[2])) return [];
  const out = [], t = (game.world.time || 0), jour = clamp(Math.min((t - 0.26) / 0.06, (0.76 - t) / 0.06), 0, 1);
  const [ax, az] = P18_GROTTE.cheminees[0];
  if (jour > 0 && Math.hypot(eye[0] - ax, eye[2] - az) < 70) out.push({ x: ax, y: souterrain.floorAt(ax, az) + 6, z: az, r: 22, c: [0.42 * jour, 0.45 * jour, 0.48 * jour], d: 0.02 });
  const C = P18_GROTTE.salles.find((q) => q[0] === 'cristaux');
  if (Math.hypot(eye[0] - C[1], eye[2] - C[2]) < 60) for (const [dx, dz, c] of [[-12, -6, [0.12, 0.16, 0.24]], [10, 8, [0.18, 0.12, 0.22]]]) out.push({ x: C[1] + dx, y: C[6] + 2, z: C[2] + dz, r: 14, c, d: 0.05 });
  const Lc = P18_GROTTE.lacs[0];
  if (Math.hypot(eye[0] - Lc[1], eye[2] - Lc[2]) < 110) for (const [dx, dz] of [[-50, -20], [40, 30], [10, -45]]) out.push({ x: Lc[1] + dx, y: SOUT_WL + 1.5, z: Lc[2] + dz, r: 16, c: [0.06, 0.2, 0.18], d: 0.1 });
  return out;
});
// derrière le rideau de la Grande Chute : le jour passe à travers l'eau, une clarté pâle qui tremble
HOOKS.lights.push((eye) => {
  const W = game.world && game.world.p18;
  if (!W || souterrain.actif) return [];
  const G = p18Jeu.chute('grande');
  if (!G || !G.bouche) return [];
  const [bx, by, bz] = G.bouche;
  if (Math.hypot(eye[0] - bx, eye[2] - bz) > 40) return [];
  const t = game.world.time || 0, jour = clamp(Math.min((t - 0.26) / 0.06, (0.76 - t) / 0.06), 0, 1);
  if (jour <= 0) return [];
  const k = jour * (0.85 + 0.15 * Math.sin(performance.now() / 260));
  return [{ x: bx + Math.cos(G.a) * 2.6, y: by + 2.4, z: bz + Math.sin(G.a) * 2.6, r: 15, c: [0.22 * k, 0.26 * k, 0.29 * k], d: 0.03 }];
});

// ---------------------------------------------------------------- branchements
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) try { p18Jeu.update(dt, eye, basis, sky, playing); } catch (e) { if (!p18Jeu._err) { p18Jeu._err = true; console.error('P18', e); } } });
HOOKS.update.push((dt) => { const A = p18Jeu.porteAnim; if (A) { A.t += dt; if (A.t > A.dur) p18Jeu.porteAnim = null; } });
HOOKS.load.push(() => { try { p18Jeu.S(); p18Jeu.appliquer(); } catch (e) { console.error('P18 chargement', e); } });
