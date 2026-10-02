// ============================================================================
//  LES BÊTES DES BOIS ET DU MARAIS (agent E3, douzième vague) : leur vie
//  (données : 05-zzzzzE3-betes.js ; créatures : 10-zzzzE3-betes.js ; modèles :
//  07-zzzzzzzzzzzzE3-betes.js ; cris : 09-zzzzE3-cris.js ; icônes :
//  03-zzzzzE3-icones.js)
//  - OÙ ET QUAND (E3_VIE) : aucune passe de génération. Les bêtes naissent
//    autour du joueur, hors de sa vue (de 25 à 90 m), dans leur milieu (la
//    forêt, le bois de bouleaux, le marais), à leur heure, selon leur rareté ;
//    peu à la fois (E3_MAX groupes), et elles s'en vont quand on s'éloigne ou
//    quand leur temps est passé (jamais sous les yeux du joueur).
//  - LE MARAIS : dans la vallée dessinée, la carte des biomes n'a pas de marais
//    (game.biomeAt y répond « plaine ») ; le marais, ce sont les mares du marais
//    (w.fishZones « marais ») et le bas-fond qui les entoure (e3.marais).
//  - LEURS COMPORTEMENTS (E3_COMPORTE) : le daim et le mâle qui tient tête,
//    l'autour qui défend son arbre, les pics au tronc, la croule de la bécasse,
//    les échassiers, le sonneur qui montre son ventre, les papillons, la
//    bondrée qui déterre un nid de guêpes, le busard qui rase les roseaux, le
//    râle qu'on entend sans le voir, la bécassine qui bêle, la poule d'eau qui
//    court sur l'eau, la rainette sur son roseau, la crossope qui plonge…
//  - CE QU'ON EN FAIT : le filet (papillons, coléoptères ; nature2.PRISES), la
//    main (E : le capricorne, la cicindèle, la sangsue ; la coronelle et la
//    crossope mordent), les sangsues qui se collent aux jambes de qui entre dans
//    l'eau du marais, le bois du daim mâle, la chasse (noms, pièges).
//  État : farm.s.e3 = { v, sangsues (prises aux jambes), morsures }
//  API : e3 (milieu(w, x, z), marais(w), apparaitre(kind, x, z), liste(), oter(e))
// ============================================================================
const E3_MAX = 5;                                   // groupes à la fois, au plus
const E3_ESSAI = 3.5;                               // un essai d'apparition toutes les 3,5 s
const E3_POIDS = [0.3, 0.1, 0.025, 0.006, 0.002];  // chance par essai, selon la rareté (si tout le reste convient)
// où et quand : mil (milieux), h (heures [[de, à]…]), n (taille du groupe), lieu (sol, arbre, chene, bouleau, rive,
// eau, ciel, humide), soleil (beau temps, pas de neige), vie (secondes avant de s'en aller, hors de vue)
const E3_VIE = {
  daim: { mil: ['foret', 'bouleaux'], h: [[5, 21.5]], n: [2, 4], lieu: 'sol', vie: [240, 420] },
  autour: { mil: ['foret'], h: [[6.5, 19]], lieu: 'arbre', vie: [200, 360] },
  pic_noir: { mil: ['foret'], h: [[6, 19.5]], lieu: 'arbre', vie: [200, 360] },
  becasse: { mil: ['foret', 'bouleaux'], h: [[0, 24]], lieu: 'sol', vie: [200, 400] },
  cigogne_noire: { mil: ['foret'], h: [[7, 19]], lieu: 'rive', vie: [180, 300] },
  sonneur: { mil: ['foret'], h: [[0, 24]], lieu: 'humide', n: [1, 3], froid: true, vie: [200, 400] },
  coronelle: { mil: ['foret'], h: [[9, 18]], lieu: 'sol', soleil: true, vie: [160, 300] },
  capricorne: { mil: ['foret'], h: [[18.5, 24], [0, 1.5]], lieu: 'chene', froid: true, vie: [240, 420] },
  grand_mars: { mil: ['foret'], h: [[8, 13.5]], lieu: 'sol', soleil: true, vie: [150, 280] },
  oreillard: { mil: ['foret', 'bouleaux'], h: [[20.5, 24], [0, 5]], lieu: 'arbre', froid: true, vie: [200, 360] },
  gelinotte: { mil: ['bouleaux'], h: [[6, 19.5]], lieu: 'sol', n: [1, 2], vie: [200, 360] },
  pic_epeiche: { mil: ['bouleaux', 'foret'], h: [[6, 19.5]], lieu: 'arbre', vie: [200, 360] },
  bondree: { mil: ['bouleaux'], h: [[9, 17]], lieu: 'ciel', froid: true, vie: [200, 360] },
  moyen_duc: { mil: ['bouleaux'], h: [[19.5, 24], [0, 6]], lieu: 'arbre', vie: [240, 420] },
  musaraigne: { mil: ['bouleaux', 'foret'], h: [[0, 24]], lieu: 'sol', vie: [120, 240] },
  muscardin: { mil: ['bouleaux'], h: [[20, 24], [0, 5]], lieu: 'arbre', froid: true, vie: [200, 360] },
  lezard_vivipare: { mil: ['bouleaux'], h: [[9, 18]], lieu: 'sol', soleil: true, vie: [160, 300] },
  grenouille_rousse: { mil: ['bouleaux', 'foret'], h: [[0, 24]], lieu: 'sol', froid: true, pluie: 3, vie: [160, 300] },
  morio: { mil: ['bouleaux'], h: [[9.5, 16.5]], lieu: 'bouleau', soleil: true, vie: [150, 280] },
  cicindele: { mil: ['bouleaux'], h: [[9, 17]], lieu: 'sol', soleil: true, vie: [150, 280] },
  busard_roseaux: { mil: ['marais'], h: [[7, 19]], lieu: 'ciel', vie: [200, 360] },
  bihoreau: { mil: ['marais'], h: [[0, 24]], lieu: 'rive', vie: [240, 420] },
  aigrette: { mil: ['marais'], h: [[7, 19.5]], lieu: 'rive', vie: [200, 360] },
  rale_eau: { mil: ['marais'], h: [[0, 24]], lieu: 'rive', vie: [240, 420] },
  becassine: { mil: ['marais'], h: [[5, 21.5]], lieu: 'rive', vie: [200, 360] },
  poule_eau: { mil: ['marais'], h: [[5.5, 20.5]], lieu: 'eau', n: [1, 2], vie: [240, 420] },
  rainette: { mil: ['marais'], h: [[0, 24]], lieu: 'rive', n: [1, 3], froid: true, vie: [240, 420] },
  sangsue: { mil: ['marais'], h: [[0, 24]], lieu: 'eau', n: [2, 4], froid: true, vie: [240, 420] },
  crossope: { mil: ['marais'], h: [[0, 24]], lieu: 'rive', vie: [200, 360] },
  cuivre_marais: { mil: ['marais'], h: [[9.5, 17]], lieu: 'sol', soleil: true, vie: [150, 280] },
};
const E3_SANS_OMBRE = new Set(['grand_mars', 'morio', 'cuivre_marais', 'capricorne', 'cicindele', 'sangsue']); // (trop petits : pas d'ombre)
const E3_RARE = {};
for (const [k, , , r] of E3_BETES) E3_RARE[k] = r;
const E3_CHENES = new Set(['oak', 'chataignier', 'hetre']);
const E3_BOULEAUX = new Set(['birch']);

// ---------------------------------------------------------------- petits outils
const e3Heure = () => { try { return ((game.world.time * 24) % 24 + 24) % 24; } catch (e) { return 12; } };
const e3Dans = (h, P) => P.some(([a, b]) => h >= a && h < b);
// un cri, placé sur la bête (son 3D), plus doux avec la distance
const e3Cri = (e, kind, c, portee, k) => {
  const d = e.dist ?? Math.hypot(e.x - c.px, e.z - c.pz);
  if (d > portee || !sound.e3Cri || (c.silent && kind !== 'plouf')) return;
  sound.e3Cri(kind, e, clamp(1 - d / portee, 0, 1) * (k || 1));
};
const e3Alerte = (e, c, base) => base * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.5 : 1);
// un arbre près d'un point (pour se percher), loin d'un autre si l'on change d'arbre
const e3Arbre = (w, x, z, R, loin, ids) => {
  const L = [];
  w.query(x, z, R, (o) => {
    if (!o || o.gone) return;
    const id = OBJ_TYPES[o.t].id;
    if (!(ids ? ids.has(id) : NAT_ARBRES.has(id))) return;
    if (loin && Math.hypot(o.x - loin.x, o.z - loin.z) < 6) return;
    L.push(o);
  }, null);
  return L.length ? L[(Math.random() * L.length) | 0] : null;
};
// les ailes des rapaces : déployées en vol, repliées au repos
const e3Ailes = (e, vol) => {
  const r = e.rig;
  if (!r || !r.e3Rapace) return;
  if (r._vol === vol) return;
  r._vol = vol;
  for (const n of ['wingL', 'wingR']) r.part(n).hide = !vol;
  for (const n of ['plieL', 'plieR']) r.part(n).hide = vol;
};
// les ailes des coléoptères (en vol seulement)
const e3Elytres = (e, vol) => { const r = e.rig; if (!r || r._vol === vol) return; r._vol = vol; for (const n of ['wingL', 'wingR']) { const q = r.part(n); if (q) q.hide = !vol; } };

const e3 = {
  vivantes: [], t: 2, mar: null, marW: null, sangT: 0, collees: 0, mouille: false, dejaDit: 0,
  // ------------------------------------------------------------ état sauvegardé
  S() {
    const s = farm.s;
    if (!s) return null;
    const E = s.e3 && typeof s.e3 === 'object' ? s.e3 : (s.e3 = {});
    if (!E.v) E.v = 1;
    if (typeof E.sangsues !== 'number') E.sangsues = 0;
    if (typeof E.morsures !== 'number') E.morsures = 0;
    return E;
  },
  liste() { return this.vivantes.slice(); },
  // ------------------------------------------------------------ le marais
  // (les mares du marais : leur centre et leur rayon, une fois par monde)
  marais(w) {
    if (this.marW === w) return this.mar;
    this.marW = w; this.mar = null;
    const Z = (w.fishZones || []).filter((f) => f.kind === 'marais');
    if (!Z.length) return null;
    const x = Z.reduce((a, f) => a + f.x, 0) / Z.length, z = Z.reduce((a, f) => a + f.z, 0) / Z.length;
    const r = Math.max(...Z.map((f) => Math.hypot(f.x - x, f.z - z) + f.r)) + 35;
    this.mar = { x, z, r: Math.min(r, 220) };
    return this.mar;
  },
  // le milieu d'un point, pour ces bêtes : 'foret', 'bouleaux', 'marais', ou null
  milieu(w, x, z) {
    if (!w || !w.biome) return null;
    const i = clamp(Math.floor(x / 8), 0, w.biomeW - 1), j = clamp(Math.floor(z / 8), 0, w.biomeW - 1), b = BIOMES[w.biome[j * w.biomeW + i]];
    if (b === 'marais') return 'marais';
    const M = this.marais(w);
    if (M && Math.hypot(x - M.x, z - M.z) < M.r && w.heightAt(x, z) - w.waterLevel < 5) return 'marais';
    if (b === 'foret' || b === 'bouleaux') return b;
    return null;
  },
  // de l'eau près d'un point : la rive (terre ferme au bord) et l'eau
  eauPres(w, x, z, R) {
    const WL = w.waterLevel;
    for (let k = 0; k < 40; k++) {
      const a = Math.random() * TAU, d = 2 + Math.random() * R, ex = x + Math.cos(a) * d, ez = z + Math.sin(a) * d;
      if (!w.inside(ex, ez, 8) || w.heightAt(ex, ez) > WL - 0.08) continue;
      // de l'eau vers le point : la première terre ferme
      for (let s = 0.5; s < d + 0.5; s += 0.5) {
        const bx = ex + (x - ex) * s / d, bz = ez + (z - ez) * s / d, h = w.heightAt(bx, bz);
        if (h > WL + 0.06) return h < WL + 1.6 ? { bx, bz, wx: ex, wz: ez } : null;
      }
    }
    return null;
  },
  // le temps qu'il fait convient-il ?
  tempsOk(V, sky) {
    const pluie = weather.cur.rain || 0, neige = typeof vallee !== 'undefined' ? (vallee.snowK || 0) : 0;
    if (V.soleil && (pluie > 0.08 || weather.cur.fog > 0.5 || neige > 0.05 || !['clear', 'cloudy', 'heat'].includes(weather.state))) return false;
    if (V.froid && neige > 0.3) return false;
    return true;
  },
  // ------------------------------------------------------------ apparitions
  maj(dt, eye, basis, sky) {
    const w = game.world, p = game.player;
    if (!w || !farm.s || game.kind !== 'farm' || game.mode !== 'play') return;
    this.t -= dt;
    if (this.t > 0) return;
    this.t = E3_ESSAI;
    // le ménage : les mortes, les ôtées, les lointaines, celles dont le temps est passé (hors de vue)
    const h = e3Heure();
    this.vivantes = this.vivantes.filter((e) => {
      if (e.removed) return false;
      if (e.dead || e.corpse || e.piege) { if (e.dead && !e.corpse && !e.piege) entities.remove(e); return false; }
      e.e3vie -= E3_ESSAI;
      const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]), V = E3_VIE[e.kind];
      const vu = !e.hidden && d < 70 && ((e.x - eye[0]) * basis.f[0] + (e.z - eye[2]) * basis.f[2]) / (d || 1) > 0.35;
      const partir = d > 200 || ((e.e3vie <= 0 || !e3Dans(h, V.h) || e.e3Partir) && !vu && d > 30);
      if (partir) { entities.remove(e); return false; }
      return true;
    });
    if (p.underground || p.riding || strange.inEnvers() || (typeof mondes !== 'undefined' && mondes.cur) || (strange.redNight && strange.redNight())) return;
    if (w.covered(p.pos[0], p.pos[1] + 1.5, p.pos[2])) return;
    const groupes = new Set(this.vivantes.map((e) => e.e3g));
    if (groupes.size >= E3_MAX) return;
    this.essai(w, p, basis, h, sky);
  },
  essai(w, p, basis, h, sky) {
    // un point au hasard, plutôt derrière ou sur les côtés (on ne voit pas naître une bête)
    for (let k = 0; k < 4; k++) {
      const dos = Math.random() < 0.75, yaw = Math.atan2(basis.f[0], basis.f[2]);
      const a = dos ? yaw + Math.PI + (Math.random() - 0.5) * 2.8 : Math.random() * TAU, d = 25 + Math.random() * 60;
      const x = p.pos[0] + Math.sin(a) * d, z = p.pos[2] + Math.cos(a) * d;
      if (!w.inside(x, z, 20)) continue;
      const m = this.milieu(w, x, z);
      if (!m) continue;
      const presentes = new Set(this.vivantes.map((e) => e.kind));
      const cand = [];
      for (const kind in E3_VIE) {
        const V = E3_VIE[kind];
        if (!V.mil.includes(m) || presentes.has(kind) || !e3Dans(h, V.h) || !this.tempsOk(V, sky)) continue;
        let pr = E3_POIDS[E3_RARE[kind] || 0];
        if (V.pluie && (weather.cur.rain || 0) > 0.2) pr *= V.pluie;
        cand.push([kind, pr]);
      }
      // chacune tente sa chance (dans le désordre) ; la première qui la saisit paraît
      for (let i = cand.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [cand[i], cand[j]] = [cand[j], cand[i]]; }
      for (const [kind, pr] of cand) {
        if (Math.random() >= pr) continue;
        if (this.apparaitre(kind, x, z)) return true;
      }
      return false;
    }
    return false;
  },
  // la place d'une bête près d'un point (selon son lieu) : { x, z, o (arbre), eau } ou null
  place(kind, w, x, z) {
    const V = E3_VIE[kind], WL = w.waterLevel;
    const solOk = (tx, tz) => { const hh = w.heightAt(tx, tz); return hh > WL + 0.08 && w.normalAt(tx, tz)[1] > 0.72 && !w.covered(tx, hh + 1, tz) && !interditDeBatir(tx, tz, 0); };
    switch (V.lieu) {
      case 'sol': case 'ciel': return solOk(x, z) ? { x, z } : null;
      case 'arbre': case 'chene': case 'bouleau': {
        const o = e3Arbre(w, x, z, 22, null, V.lieu === 'chene' ? E3_CHENES : V.lieu === 'bouleau' ? E3_BOULEAUX : null) || (V.lieu !== 'arbre' ? e3Arbre(w, x, z, 22) : null);
        return o ? { x: o.x + 1.2, z: o.z + 1.2, o } : null;
      }
      case 'rive': case 'humide': {
        const R = this.eauPres(w, x, z, 26);
        if (R) return { x: R.bx, z: R.bz, eau: R };
        if (V.lieu === 'humide' && (weather.cur.rain || 0) > 0.15 && solOk(x, z)) return { x, z }; // les ornières, quand il pleut
        return null;
      }
      case 'eau': {
        const R = this.eauPres(w, x, z, 26);
        if (!R) return null;
        // un peu au large, là où l'eau n'est pas trop profonde pour une sangsue
        const dx = R.wx - R.bx, dz = R.wz - R.bz, L = Math.hypot(dx, dz) || 1;
        for (let s = kind === 'sangsue' ? 1.2 : 3; s > 0.6; s -= 0.4) { const tx = R.bx + dx / L * s, tz = R.bz + dz / L * s, hh = w.heightAt(tx, tz); if (hh < WL - 0.12 && (kind !== 'sangsue' || hh > WL - 1.2)) return { x: tx, z: tz, eau: R }; }
        return null;
      }
    }
    return null;
  },
  apparaitre(kind, x, z, force) {
    const w = game.world, V = E3_VIE[kind];
    if (!w || !V || !CREATURES[kind]) return null;
    const P = this.place(kind, w, x, z) || (force ? { x, z } : null);
    if (!P) return null;
    const n = V.n ? V.n[0] + ((Math.random() * (V.n[1] - V.n[0] + 1)) | 0) : 1, g = kind + ':' + Math.random().toString(36).slice(2, 7), out = [];
    for (let k = 0; k < n; k++) {
      const jx = k ? (Math.random() - 0.5) * (kind === 'daim' ? 7 : 2.4) : 0, jz = k ? (Math.random() - 0.5) * (kind === 'daim' ? 7 : 2.4) : 0;
      // (le daim : un mâle une fois sur deux, en tête ; les autres sont des biches)
      const v = kind === 'daim' ? (k === 0 && Math.random() < 0.5 ? 0 : 1) : (Math.random() * 4) | 0;
      const e = entities.add(w, kind, P.x + jx, P.z + jz, { v });
      e.e3g = g; e.e3vie = lerp(V.vie[0], V.vie[1], Math.random()); e.hx = e.x; e.hz = e.z;
      if (P.o) e.arbre0 = P.o;
      if (V.lieu === 'ciel') e.y = Math.max(w.heightAt(e.x, e.z), w.waterLevel) + (kind === 'busard_roseaux' ? 6 : 26 + Math.random() * 8);
      if (P.eau) e.eau = P.eau;
      out.push(e); this.vivantes.push(e);
    }
    return out;
  },
  oter(e) { entities.remove(e); this.vivantes = this.vivantes.filter((q) => q !== e); },

  // ------------------------------------------------------------ les sangsues : qui entre dans l'eau du marais
  majSangsues(dt) {
    const w = game.world, p = game.player, s = farm.s;
    if (!w || !s || game.kind !== 'farm' || game.mode !== 'play' || p.underground) return;
    this.sangT -= dt;
    if (this.sangT > 0) return;
    this.sangT = 2;
    const WL = w.waterLevel, h = w.heightAt(p.pos[0], p.pos[2]);
    const dansLEau = h < WL - 0.18 && p.pos[1] < WL + 0.4 && !p.riding;
    const marais = dansLEau && this.milieu(w, p.pos[0], p.pos[2]) === 'marais';
    if (marais) {
      this.mouille = true;
      // deux secondes jambes dans l'eau : une chance sur dix qu'une sangsue s'y colle (davantage si l'on reste)
      if (this.collees < 6 && Math.random() < 0.1 + this.collees * 0.02) {
        this.collees++;
        if (this.collees === 1 && s.hours - this.dejaDit > 6) { this.dejaDit = s.hours; ui.subtitle('', '(Quelque chose de froid s’est collé à votre mollet.)', 3.5); }
      }
      return;
    }
    // sorti de l'eau : on les détache, une à une
    if (this.mouille && h > WL + 0.05) {
      this.mouille = false;
      if (this.collees > 0) {
        const n = this.collees, E = this.S();
        this.collees = 0;
        farm.give('sangsue', n); play.flyer('sangsue', [p.pos[0], p.pos[1] + 0.4, p.pos[2]], n);
        E.sangsues += n;
        corps.saigner(Math.min(0.12, 0.04 * n), 'Saigné par les sangsues');
        ui.subtitle('', n > 1 ? '(Vous détachez les sangsues de vos jambes. Les morsures saignent un peu.)' : '(Vous détachez une sangsue de votre jambe. La morsure saigne un peu.)', 3.5);
      }
    }
  },
};

// ---------------------------------------------------------------- les comportements
// Un comportement renvoie true quand il a tout fait (le comportement commun ne joue pas).
// -- se percher : au tronc (les pics, le capricorne) ou sur une branche (l'autour, le moyen-duc, le bihoreau, la
// gélinotte levée) ; changer d'arbre en volant (vol ondulé des pics). o : { tronc, haut, R, v, onde }
function e3Perche(e, dt, w, c, o) {
  if (!e.perch || e.bouge) {
    const T = (!e.perch && e.arbre0 && !e.arbre0.gone ? e.arbre0 : null) || e3Arbre(w, e.perch ? e.perch.x : e.hx, e.perch ? e.perch.z : e.hz, o.R || 30, e.perch, o.ids);
    let P;
    if (T) {
      const hT = T.h || 8, a = Math.random() * TAU;
      if (o.tronc) { const rr = 0.3 + Math.min(0.4, hT * 0.025); P = { x: T.x + Math.sin(a) * rr, z: T.z + Math.cos(a) * rr, y: w.objectY(T) + lerp(o.tronc[0], o.tronc[1], Math.random()), cap: a + Math.PI, T }; }
      else { const rr = 0.5 + Math.random() * 0.8; P = { x: T.x + Math.sin(a) * rr, z: T.z + Math.cos(a) * rr, y: w.objectY(T) + hT * lerp(o.haut[0], o.haut[1], Math.random()), cap: Math.random() * TAU, T }; }
    } else P = { x: e.hx + (Math.random() - 0.5) * 20, z: e.hz + (Math.random() - 0.5) * 20, y: 0, cap: Math.random() * TAU, sol: true };
    if (P.sol) P.y = w.heightAt(P.x, P.z);
    if (!e.perch) { e.x = P.x; e.z = P.z; e.y = P.y; }
    e.perch = P; e.vole = !!e.bouge; e.bouge = false;
  }
  const P = e.perch;
  if (e.vole) {
    const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz);
    e.heading = Math.atan2(dx, dz); e.fly = 1; e.phase += dt * 5;
    const sp = Math.min(d, dt * (o.v || 8));
    e.x += dx / (d || 1) * sp; e.z += dz / (d || 1) * sp;
    const sol = Math.max(w.heightAt(e.x, e.z), w.waterLevel);
    const cible = Math.max(P.y, sol + 1.5) + (o.onde ? Math.abs(Math.sin(d * 0.5)) * 1.5 : Math.min(3, d * 0.15));
    e.y = lerp(e.y, d < 1.2 ? P.y : cible, Math.min(1, dt * 3));
    if (e.rig) e.rig.set('body', 0, 0, 0);
    e3Ailes(e, true);
    if (d < 0.25) { e.vole = false; e.y = P.y; }
    return false;
  }
  e.fly = 0; e.move = 0; e.x = P.x; e.z = P.z; e.y = P.y;
  e.heading = turnToward(e.heading, o.tronc ? P.cap : e.heading, dt * 6);
  if (e.rig) e.rig.set('body', o.tronc ? -1.15 : 0, 0, 0);
  e3Ailes(e, false);
  return true;
}
// -- partir d'un coup d'aile (oiseaux qu'on lève) : loin du joueur, bas, puis se reposer plus loin
function e3Lever(e, c, o) {
  e.envol = { t: lerp(o.t[0], o.t[1], Math.random()), v: o.v, h: o.h, zig: o.zig || 0, eau: !!o.eau };
  e.heading = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 0.8;
  e.state = 'idle'; e.timer = 2;
}
function e3Envol(e, dt, w, c) {
  const V = e.envol;
  V.t -= dt;
  e.fly = 1; e.phase += dt * 6;
  if (V.zig) { V.zt = (V.zt || 0) - dt; if (V.zt <= 0) { V.zt = 0.25 + Math.random() * 0.3; e.heading += (Math.random() < 0.5 ? -1 : 1) * V.zig; } }
  e.x += Math.sin(e.heading) * dt * V.v; e.z += Math.cos(e.heading) * dt * V.v;
  if (!w.inside(e.x, e.z, 12)) e.heading += Math.PI;
  const sol = Math.max(w.heightAt(e.x, e.z), w.waterLevel), monte = V.t > 1.2;
  e.y = lerp(e.y, monte ? sol + V.h : sol, Math.min(1, dt * (monte ? 1.6 : 2.4)));
  e3Ailes(e, true);
  if (V.t <= 0) {
    // au-dessus de l'eau, on ne se pose pas (sauf les oiseaux d'eau)
    if (w.heightAt(e.x, e.z) < w.waterLevel + 0.05 && !V.eau && (V.prol = (V.prol || 0) + 1) < 6) { V.t = 1.5; return true; }
    e.envol = null; e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z); e.hx = e.x; e.hz = e.z; e.state = 'idle'; e.timer = 1 + Math.random() * 3;
    e3Ailes(e, false);
  }
  return true;
}
// -- tournoyer, planer (rapaces, la croule, la bécassine qui bêle, l'oreillard) : o = { R, H, v, sol, eau }
function e3Tourne(e, dt, w, c, o) {
  if (e.cx === undefined) { e.cx = e.x; e.cz = e.z; e.ang = Math.random() * TAU; e.sens = Math.random() < 0.5 ? 1 : -1; }
  // le centre du cercle dérive lentement (et reste dans son milieu si possible)
  e.derT = (e.derT || 0) - dt;
  if (e.derT <= 0) {
    e.derT = 6 + Math.random() * 8;
    const tx = e.hx + (Math.random() - 0.5) * (o.der || 60), tz = e.hz + (Math.random() - 0.5) * (o.der || 60);
    if (!o.mil || e3.milieu(w, tx, tz) === o.mil) { e.vx = tx; e.vz = tz; }
  }
  if (e.vx !== undefined) { e.cx = lerp(e.cx, e.vx, Math.min(1, dt * 0.08)); e.cz = lerp(e.cz, e.vz, Math.min(1, dt * 0.08)); }
  e.ang += e.sens * dt * (o.v / o.R);
  const nx = e.cx + Math.cos(e.ang) * o.R, nz = e.cz + Math.sin(e.ang) * o.R;
  e.heading = Math.atan2(nx - e.x, nz - e.z) || e.heading;
  e.x = nx; e.z = nz;
  const sol = Math.max(w.heightAt(e.x, e.z), w.waterLevel);
  e.y = lerp(e.y, sol + o.H + Math.sin(c.t * 0.4 + e.seed) * (o.ondule ?? 1.5), Math.min(1, dt * 0.8));
  e.fly = 1; e.phase += dt * 4;
  e3Ailes(e, true);
  return true;
}
// -- le mâle du daim qui tient tête : face au joueur, la tête basse, il rait ; si l'on avance encore, il charge
function e3Charge(e, dt, w, c) {
  const F = e.charge;
  F.t += dt;
  e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 3.2);
  entities.stepMove(e, dt, w, e.cfg.run * 0.85);
  e.move = 1; e.run = true; e.phase += dt * 9; e.grazeT = 0.6;
  if (e.dist < 1.4 && !F.coup && c.alive) {
    F.coup = true;
    const dmg = 8 + Math.random() * 6;
    c.hurt(dmg, e, 'Encorné par un daim');
    corps.saigner(0.04 + Math.random() * 0.04, 'Encorné par un daim');
    game.shakeT = Math.max(game.shakeT || 0, 0.35);
    e3Cri(e, 'raire', c, 60, 1.3);
  }
  if (F.coup || F.t > 4 || e.dist > 25 || !c.alive || c.inside) { e.charge = null; e.calmeT = 90; entities.startFlee(e, c.px, c.pz); e.timer = 5; }
  return true;
}

const E3_COMPORTE = {
  // ------------------------------------------------------------ la forêt
  daim(e, dt, w, c) {
    e.calmeT = Math.max(0, (e.calmeT || 0) - dt);
    // les biches et les jeunes suivent le premier de la harde quand il fuit
    if (e.charge) return e3Charge(e, dt, w, c);
    const male = (e.v | 0) % 2 === 0;
    // blessé, le mâle charge une fois sur trois
    if (male && e.hp < (e.hpVu ?? e.hp)) { if (Math.random() < 0.35 && c.alive && !c.inside && e.dist < 22) { e.charge = { t: 0 }; e.hpVu = e.hp; return true; } }
    e.hpVu = e.hp;
    // le mâle tient tête, parfois (un sur trois) : il ne fuit pas, il fait face et rait ; trop près, il charge
    if (male && e.fier === undefined) e.fier = Math.random() < 0.33;
    if (male && e.fier && !e.calmeT && c.alive && !c.inside && e.state !== 'flee') {
      const d = e.dist;
      if (d < 16) {
        e.state = 'idle'; e.timer = 2; e.move = lerp(e.move || 0, 0, Math.min(1, dt * 6));
        e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 2.5);
        e.grazeT = d < 9 ? 1.1 : 0; e.lookY = 0;
        e.raireT = (e.raireT ?? 0) - dt;
        if (e.raireT <= 0) { e.raireT = 3 + Math.random() * 3; e3Cri(e, 'raire', c, 70, d < 9 ? 1.2 : 0.8); }
        e.proche = d < 6 ? (e.proche || 0) + dt * (c.crouch ? 0.5 : 1) : Math.max(0, (e.proche || 0) - dt);
        if (e.proche > 2.2 || (c.sprint && d < 7)) { e.proche = 0; if (Math.random() < 0.7) e.charge = { t: 0 }; else { e.calmeT = 60; entities.startFlee(e, c.px, c.pz); } }
        return true;
      }
    }
    // en fuite, la queue levée (le miroir blanc)
    if (e.state === 'flee' && e.rig) e.rig.set('tail', -0.6, 0, 0);
    // la harde : quand l'un fuit, tous fuient
    if (e.state === 'flee' && !e.ditFuite) { e.ditFuite = true; for (const q of e3.vivantes) if (q !== e && q.e3g === e.e3g && q.state !== 'flee' && !q.charge) entities.startFlee(q, c.px, c.pz); }
    if (e.state !== 'flee') e.ditFuite = false;
    // le rut : à la tombée du jour, le mâle rait de loin en loin
    if (male) { e.rutT = (e.rutT ?? 20 + Math.random() * 40) - dt; if (e.rutT <= 0) { e.rutT = 40 + Math.random() * 70; const h = e3Heure(); if (h > 17.5 || h < 7) e3Cri(e, 'raire', c, 140, 0.8); } }
    return false;
  },
  // l'autour : sur une branche ; dérangé, il file entre les troncs ; près de son arbre, il crie, puis fond sur l'intrus
  autour(e, dt, w, c) {
    if (e.pique) { // il fond sur le joueur, griffe, et s'en va
      const P = e.pique; P.t += dt;
      const tx = c.px, tz = c.pz, ty = w.heightAt(c.px, c.pz) + 1.7, dx = tx - e.x, dz = tz - e.z, d = Math.hypot(dx, dz);
      e.heading = Math.atan2(dx, dz); e.fly = 1; e.phase += dt * 8; e3Ailes(e, true);
      const sp = Math.min(d, dt * 13);
      e.x += dx / (d || 1) * sp; e.z += dz / (d || 1) * sp; e.y = lerp(e.y, ty, Math.min(1, dt * 4));
      if (d < 0.9 && !P.coup) { P.coup = true; c.hurt(3 + Math.random() * 3, e, 'Griffé par un autour'); corps.saigner(0.05, 'Griffé par un autour'); e3Cri(e, 'kiak', c, 60, 1.4); e.bouge = true; e.perch = null; e.arbre0 = null; }
      if (P.coup || P.t > 4) { e.pique = null; e.bouge = true; e.e3Partir = true; }
      return true;
    }
    const r = e3Perche(e, dt, w, c, { haut: [0.3, 0.42], R: 45, v: 11 });
    if (!r) return true;
    e.lookY = clamp(angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)), -1.3, 1.3);
    const d = e.dist, alerte = e3Alerte(e, c, e.cfg.flee);
    if (d < alerte) { e.bouge = true; sound.flutter && sound.flutter(0.5, 0); e3Cri(e, 'kiak', c, 70); e.garde = 0; return true; }
    // sous son arbre, trop longtemps (accroupi) : il crie, puis il pique
    if (d < 9 && c.alive && !c.inside) {
      e.garde = (e.garde || 0) + dt;
      if (e.garde > 2.5 && !e.averti) { e.averti = true; e3Cri(e, 'kiak', c, 70, 1.2); }
      if (e.garde > 6) { e.garde = 0; e.pique = { t: 0 }; e3Cri(e, 'kiak', c, 70, 1.4); }
    } else { e.garde = Math.max(0, (e.garde || 0) - dt); if (!e.garde) e.averti = false; }
    // de loin en loin, il change d'arbre de lui-même
    e.chasseT = (e.chasseT ?? 40 + Math.random() * 60) - dt;
    if (e.chasseT <= 0) { e.chasseT = 60 + Math.random() * 80; e.bouge = true; }
    return true;
  },
  // les pics : au tronc, le corps dressé ; ils tambourinent ; dérangés, ils filent vers un autre arbre en criant
  pic(e, dt, w, c) {
    const noir = e.kind === 'pic_noir';
    const r = e3Perche(e, dt, w, c, { tronc: noir ? [2, 6] : [1.6, 4.5], R: 35, v: 8, onde: true });
    if (!r) { e.volCri = (e.volCri ?? 0) - dt; if (e.volCri <= 0) { e.volCri = 2.5; e3Cri(e, noir ? 'pic_noir_vol' : 'kik', c, 90); } return true; }
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) { e.bouge = true; sound.flutter && sound.flutter(0.4, 0); e3Cri(e, noir ? 'pic_noir_vol' : 'kik', c, 90); return true; }
    e.tamT = (e.tamT ?? 4 + Math.random() * 12) - dt;
    if (e.tamT <= 0) {
      e.tamT = (noir ? 18 : 10) + Math.random() * 25;
      const tam = Math.random() < 0.65;
      e3Cri(e, tam ? (noir ? 'tambour_noir' : 'tambour_epeiche') : (noir ? 'pic_noir' : 'kik'), c, noir ? 160 : 100);
      if (tam) e.tape = noir ? 2.2 : 0.8;
    }
    if (e.tape > 0) { e.tape -= dt; e.rig.set('head', Math.max(0, Math.sin(e.tape * (noir ? 45 : 70))) * 0.5, 0, 0); }
    // de loin en loin, il change d'arbre
    e.arbreT = (e.arbreT ?? 50 + Math.random() * 60) - dt;
    if (e.arbreT <= 0) { e.arbreT = 60 + Math.random() * 60; e.bouge = true; }
    return true;
  },
  // la bécasse : tapie au sol, elle ne part qu'au dernier moment ; au crépuscule, la croule au-dessus des arbres
  becasse(e, dt, w, c) {
    const h = e3Heure(), croule = (h >= 19.4 && h < 21.4) || (h >= 4.8 && h < 6.2);
    if (e.envol) return e3Envol(e, dt, w, c);
    if (croule) {
      if (!e.croule) { e.croule = true; e.cx = undefined; e.hx = e.x; e.hz = e.z; }
      e3Tourne(e, dt, w, c, { R: 45, H: 14, v: 7, der: 120, mil: null, ondule: 2 });
      e.criT = (e.criT ?? 2 + Math.random() * 3) - dt;
      if (e.criT <= 0) { e.criT = 3.5 + Math.random() * 2.5; e3Cri(e, 'croule', c, 120); }
      return true;
    }
    if (e.croule) { // la croule finie : elle se pose
      e.croule = false; e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z); e.hx = e.x; e.hz = e.z;
    }
    e.fly = 0;
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) {
      e3Lever(e, c, { t: [2.4, 3.6], v: 9, h: 2.5, zig: 0.6 });
      sound.flutter && sound.flutter(1, 0); e3Cri(e, 'froissement', c, 20, 1.5);
      e.levees = (e.levees || 0) + 1; if (e.levees > 2) e.e3Partir = true;
      return true;
    }
    // elle sonde la terre, sans presque bouger
    e.peck = Math.sin(c.t * 0.7 + e.seed) > 0.6;
    if (e.state === 'walk' && Math.random() < dt * 0.5) { e.state = 'idle'; e.timer = 4; }
    return false;
  },
  // les échassiers (cigogne noire, aigrette) : au bord de l'eau, à pas lents ; ils piquent ; levés, ils vont plus loin
  echassier(e, dt, w, c) {
    if (e.envol) return e3Envol(e, dt, w, c);
    e.fly = 0;
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) {
      e3Lever(e, c, { t: [5, 8], v: 6, h: 9 });
      sound.flutter && sound.flutter(0.7, 0); if (e.kind === 'aigrette') e3Cri(e, 'aigrette', c, 80);
      e.levees = (e.levees || 0) + 1; if (e.levees > 1) e.e3Partir = true;
      return true;
    }
    // il pique dans l'eau, de temps en temps
    e.peck = e.state === 'idle' && Math.sin(c.t * 0.9 + e.seed) > 0.75;
    if (e.kind === 'cigogne_noire') { e.criT = (e.criT ?? 30 + Math.random() * 60) - dt; if (e.criT <= 0) { e.criT = 70 + Math.random() * 90; e3Cri(e, 'cigogne', c, 60); } }
    return false;
  },
  // le sonneur : dans l'ornière ; il chante (une cloche fêlée, très douce) ; dérangé de trop près, il montre son ventre
  sonneur(e, dt, w, c) {
    e.montre = Math.max(0, (e.montre || 0) - dt);
    if (e.dist < 1.6 && !c.crouch && !e.montre && !e.montreFait) { e.montre = 4; e.montreFait = true; }
    if (e.dist > 4) e.montreFait = false;
    if (e.rig) e.rig.set('body', 0, 0, e.montre > 0 ? 1.15 * Math.min(1, e.montre * 2, (4 - e.montre) * 4) : 0);
    if (e.montre > 0) { e.move = 0; e.state = 'idle'; e.timer = 2; return true; }
    const h = e3Heure();
    if (h >= 18.5 || h < 6 || (weather.cur.rain || 0) > 0.2) {
      e.chantT = (e.chantT ?? 3 + Math.random() * 10) - dt;
      if (e.chantT <= 0) { e.chantT = 18 + Math.random() * 40; e3Cri(e, 'sonneur', c, 35); }
    }
    return false;
  },
  // la coronelle : lente ; elle mord si on la prend (voir e3.toucher)
  coronelle(e, dt, w, c) {
    e.raise = e.dist < 2.2;
    if (e.dist < 1.2 && !e.siffleT) { e.siffleT = 1; e3Cri(e, 'siffle', c, 10); }
    if (e.dist > 4) e.siffleT = 0;
    return false;
  },
  // le grand capricorne : sur l'écorce d'un chêne, il monte lentement ; au crépuscule, il vole lourdement
  capricorne(e, dt, w, c) {
    if (e.volT > 0) {
      e.volT -= dt; e.fly = 1; e.phase += dt * 20; e3Elytres(e, true);
      e.x += Math.sin(e.heading) * dt * 1.6; e.z += Math.cos(e.heading) * dt * 1.6; e.heading += (Math.random() - 0.5) * dt * 2;
      e.y = lerp(e.y, w.heightAt(e.x, e.z) + 2.4, Math.min(1, dt * 2));
      if (e.volT <= 0) { e.perch = null; e.arbre0 = e3Arbre(w, e.x, e.z, 15, null, E3_CHENES) || e3Arbre(w, e.x, e.z, 15); e3Elytres(e, false); }
      return true;
    }
    if (!e.perch) {
      const T = e.arbre0 && !e.arbre0.gone ? e.arbre0 : e3Arbre(w, e.hx, e.hz, 20, null, E3_CHENES) || e3Arbre(w, e.hx, e.hz, 20);
      if (!T) { e.fly = 0; return false; }
      const a = Math.random() * TAU, rr = 0.3 + Math.min(0.4, (T.h || 8) * 0.025);
      e.perch = { x: T.x + Math.sin(a) * rr, z: T.z + Math.cos(a) * rr, y: w.objectY(T) + 0.6 + Math.random() * 1.2, cap: a + Math.PI };
      e.x = e.perch.x; e.z = e.perch.z; e.y = e.perch.y;
    }
    e.fly = 0; e.move = 0; e.heading = e.perch.cap; e.x = e.perch.x; e.z = e.perch.z;
    e.perch.y += dt * 0.012; if (e.perch.y > w.heightAt(e.x, e.z) + 3.2) e.perch.y -= 1.5; // il monte, il redescend
    e.y = e.perch.y;
    if (e.rig) e.rig.set('body', -1.4, 0, 0);
    if (Math.random() < dt * 0.012) { e.volT = 3 + Math.random() * 3; e.heading = Math.random() * TAU; e3Cri(e, 'bourdon', c, 20); if (e.rig) e.rig.set('body', 0, 0, 0); }
    return true;
  },
  // les papillons : une danse au-dessus du sol ; ils se posent (sur le sol des chemins, sur l'écorce d'un bouleau, sur
  // une fleur) ; ils fuient qui s'approche trop vite ; le grand mars change de couleur selon l'angle
  papillon(e, dt, w, c) {
    const sol = w.heightAt(e.x, e.z);
    if (e.part > 0 || c.night > 0.45 || c.rain > 0.25) { // il s'en va
      e.part = (e.part > 0 ? e.part : 8) - dt; e.fly = 1; e.y += dt * 2; e.x += Math.sin(e.heading) * dt * 2.5; e.z += Math.cos(e.heading) * dt * 2.5;
      if (e.part <= 0) e.e3Partir = true;
      return true;
    }
    if (e.y < sol) e.y = sol + 0.6;
    const alerte = c.crouch ? 1.6 : c.sprint ? 6 : 3;
    if ((e.dist < alerte || e.effraye) && !(e.fuite > 0)) {
      e.effraye = false;
      e.fuite = 2.5; e.pose = 0; e.peur = (e.peur || 0) + 1;
      const a = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 1.2, d = 6 + Math.random() * 6;
      e.hx = e.x + Math.sin(a) * d; e.hz = e.z + Math.cos(a) * d; e.cible = null;
      if (e.peur > 4) { e.part = 9; e.heading = a; return true; }
    }
    e.fuite = Math.max(0, (e.fuite || 0) - dt);
    // le grand mars : violet quand on le voit sous le bon angle
    if (e.rig && e.rig.e3Ailes && e.kind === 'grand_mars') {
      const k = Math.pow(Math.abs(Math.cos(e.heading - Math.atan2(c.px - e.x, c.pz - e.z))), 4), [a0, a1] = e.rig.e3Ailes;
      const col = [lerp(a0[0], a1[0], k), lerp(a0[1], a1[1], k), lerp(a0[2], a1[2], k)];
      for (const n of ['wingL', 'wingR', 'basL', 'basR']) { const q = e.rig.part(n); if (q) q.col = col; }
    }
    if (e.pose > 0) { e.pose -= dt; e.fly = 0; e.y = e.poseY ?? sol + 0.02; return true; }
    e.fly = 1;
    e.cibleT = (e.cibleT || 0) - dt;
    if (!e.cible || e.cibleT <= 0) {
      const r = e.fuite > 0 ? 2.5 : 1.8, haut = e.kind === 'grand_mars' && !(e.fuite > 0) && Math.random() < 0.15;
      e.cible = [e.hx + (Math.random() - 0.5) * r * 2, sol + (e.fuite > 0 ? 1.5 + Math.random() * 1.5 : haut ? 3 + Math.random() * 3 : 0.3 + Math.random() * 1.1), e.hz + (Math.random() - 0.5) * r * 2];
      e.cibleT = 0.5 + Math.random() * 1.1;
      if (!(e.fuite > 0) && Math.random() < 0.14) {
        e.pose = 3 + Math.random() * 6; e.poseY = undefined;
        if (e.kind === 'morio') { const T = e3Arbre(w, e.x, e.z, 6, null, E3_BOULEAUX); if (T) { const a = Math.random() * TAU; e.x = T.x + Math.sin(a) * 0.32; e.z = T.z + Math.cos(a) * 0.32; e.poseY = w.objectY(T) + 1 + Math.random() * 0.8; e.heading = a + Math.PI; } }
        else if (e.kind === 'cuivre_marais') e.poseY = sol + 0.25;
      }
      if (!(e.fuite > 0)) { e.hx += (Math.random() - 0.5) * 2; e.hz += (Math.random() - 0.5) * 2; }
    }
    const [tx, ty, tz] = e.cible, dx = tx - e.x, dy = ty - e.y, dz = tz - e.z, d = Math.hypot(dx, dy, dz) || 1, v = (e.fuite > 0 ? 3.2 : 1.3) * dt;
    e.x += dx / d * Math.min(v, d) + (Math.random() - 0.5) * dt * 0.8;
    e.z += dz / d * Math.min(v, d) + (Math.random() - 0.5) * dt * 0.8;
    e.y = Math.max(sol + 0.15, e.y + dy / d * Math.min(v, d) + Math.sin(c.t * 9 + e.seed) * dt * 0.5);
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 8);
    return true;
  },
  // l'oreillard : la nuit, lentement entre les arbres ; il s'arrête en l'air pour cueillir une phalène
  oreillard(e, dt, w, c) {
    if (c.night < 0.4 || c.rain > 0.6) { e.hidden = true; return true; }
    e.hidden = false; e.fly = 1;
    if (e.cx === undefined) { const T = e.arbre0 || e3Arbre(w, e.hx, e.hz, 20); e.cx = T ? T.x : e.hx; e.cz = T ? T.z : e.hz; e.ang = Math.random() * TAU; e.cy = (T ? w.objectY(T) : w.heightAt(e.hx, e.hz)) + 2.5 + Math.random() * 2; }
    e.surplace = Math.max(0, (e.surplace || 0) - dt);
    if (!e.surplace && Math.random() < dt * 0.25) e.surplace = 0.8 + Math.random() * 1.2;
    if (!e.surplace) e.ang += dt * 0.9;
    if (Math.random() < dt * 0.05) { const T = e3Arbre(w, e.cx, e.cz, 18, { x: e.cx, z: e.cz }); if (T) { e.cx = T.x; e.cz = T.z; } }
    const R = 3.5 + Math.sin(c.t * 0.3 + e.seed) * 1.2, nx = e.cx + Math.cos(e.ang) * R, nz = e.cz + Math.sin(e.ang) * R;
    e.heading = Math.atan2(nx - e.x, nz - e.z) || e.heading;
    e.x = lerp(e.x, nx, Math.min(1, dt * 2)); e.z = lerp(e.z, nz, Math.min(1, dt * 2));
    e.y = lerp(e.y, e.cy + Math.sin(c.t * 1.3 + e.seed) * 0.8, Math.min(1, dt * 1.5));
    e.criT = (e.criT ?? 10 + Math.random() * 20) - dt;
    if (e.criT <= 0) { e.criT = 25 + Math.random() * 40; e3Cri(e, 'oreillard', c, 18); }
    return true;
  },
  // ------------------------------------------------------------ le bois de bouleaux
  // la gélinotte : tapie, puis un grand fracas ; elle se pose dans un arbre, droite contre le tronc
  gelinotte(e, dt, w, c) {
    if (e.dansArbre) {
      const r = e3Perche(e, dt, w, c, { haut: [0.22, 0.32], R: 25, v: 7 });
      if (!r) return true;
      if (e.dist < e3Alerte(e, c, 7)) { e.dansArbre = false; e.perch = null; e3Lever(e, c, { t: [3, 4], v: 9, h: 4, zig: 0.3 }); sound.flutter && sound.flutter(1, 0); e.e3Partir = true; }
      return true;
    }
    if (e.envol) return e3Envol(e, dt, w, c);
    e.fly = 0;
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) { e.dansArbre = true; e.perch = null; e.bouge = true; e.arbre0 = null; sound.flutter && sound.flutter(1.2, 0); return true; }
    e.peck = e.state === 'idle' && Math.sin(c.t * 1.1 + e.seed) > 0.5;
    e.criT = (e.criT ?? 10 + Math.random() * 30) - dt;
    if (e.criT <= 0) { e.criT = 50 + Math.random() * 70; e3Cri(e, 'gelinotte', c, 70); }
    return false;
  },
  // la bondrée : elle tourne haut au-dessus des bois ; parfois elle se pose pour déterrer un nid de guêpes
  rapace(e, dt, w, c) {
    if (e.creuse > 0) { // au sol : elle creuse, la terre vole
      e.creuse -= dt; e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z); e3Ailes(e, false);
      e.peck = true;
      if (Math.random() < dt * 3) particles.spawn(e.x + Math.sin(e.heading) * 0.25, e.y + 0.05, e.z + Math.cos(e.heading) * 0.25, (Math.random() - 0.5) * 0.8, 0.6 + Math.random() * 0.5, (Math.random() - 0.5) * 0.8, [0.36, 0.26, 0.18, 1], 0.035, 0.6, 6, false);
      if (e.dist < e3Alerte(e, c, e.cfg.flee) || e.creuse <= 0) { e.creuse = 0; e.peck = false; e.y += 0.5; sound.flutter && sound.flutter(0.7, 0); e3Cri(e, 'bondree', c, 90); }
      return true;
    }
    e.peck = false;
    e3Tourne(e, dt, w, c, { R: 30, H: 28, v: 7, der: 160, mil: 'bouleaux' });
    e.criT = (e.criT ?? 20 + Math.random() * 40) - dt;
    if (e.criT <= 0) { e.criT = 60 + Math.random() * 90; e3Cri(e, 'bondree', c, 180); }
    // de loin en loin, elle descend (une fois ou deux)
    e.descT = (e.descT ?? 40 + Math.random() * 80) - dt;
    if (e.descT <= 0 && e.dist > 25) {
      e.descT = 120 + Math.random() * 120;
      const hh = w.heightAt(e.x, e.z);
      if (hh > w.waterLevel + 0.2 && e3.milieu(w, e.x, e.z) === 'bouleaux') { e.creuse = 20 + Math.random() * 25; e.y = hh; }
    }
    return true;
  },
  // le moyen-duc : la nuit, sur une branche ; il suit des yeux ; dérangé, il claque des ailes et change d'arbre
  duc(e, dt, w, c) {
    if (c.night < 0.4) { e.hidden = true; return true; }
    e.hidden = false;
    const r = e3Perche(e, dt, w, c, { haut: [0.3, 0.42], R: 30, v: 6 });
    if (!r) return true;
    e.lookY = clamp(angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z)), -1.5, 1.5);
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) { e.bouge = true; e3Cri(e, 'claque', c, 30); return true; }
    e.criT = (e.criT ?? 15 + Math.random() * 30) - dt;
    if (e.criT <= 0) { e.criT = 40 + Math.random() * 50; e3Cri(e, 'hou', c, 120); }
    return true;
  },
  // la musaraigne : des courses brèves dans les feuilles, et des cris aigus
  musaraigne(e, dt, w, c) {
    if (e.state === 'walk' && Math.random() < dt * 0.8) { e.state = 'idle'; e.timer = 0.3 + Math.random() * 0.8; }
    if (e.state === 'flee') { e.zigT = (e.zigT || 0) - dt; if (e.zigT <= 0) { e.zigT = 0.2 + Math.random() * 0.25; e.fleeDir += (Math.random() - 0.5) * 2; } }
    e.criT = (e.criT ?? 5 + Math.random() * 20) - dt;
    if (e.criT <= 0) { e.criT = 20 + Math.random() * 40; e3Cri(e, Math.random() < 0.5 ? 'musaraigne' : 'froissement', c, 18); }
    return false;
  },
  // le muscardin : la nuit, au pied des arbres ; inquiété, il file dans les branches
  muscardin(e, dt, w, c) {
    if (e.dansArbre > 0) { e.dansArbre -= dt; e.hidden = true; if (e.dansArbre <= 0) { e.hidden = false; e.state = 'idle'; } return true; }
    if (e.versArbre) {
      const T = e.versArbre, dx = T.x - e.x, dz = T.z - e.z, d = Math.hypot(dx, dz);
      if (d < 0.5) { e.dansArbre = 15 + Math.random() * 15; e.versArbre = null; e3Cri(e, 'froissement', c, 12); return true; }
      e.heading = Math.atan2(dx, dz); entities.stepMove(e, dt, w, e.cfg.run); e.move = 1; e.run = true; e.phase += dt * 18;
      return true;
    }
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) { const T = e3Arbre(w, e.x, e.z, 8); if (T) { e.versArbre = T; e3Cri(e, 'muscardin', c, 15); return true; } }
    return false;
  },
  // le lézard vivipare : au soleil seulement ; il file sous la mousse
  lezard(e, dt, w, c) {
    const soleil = c.night < 0.3 && (weather.state === 'clear' || weather.state === 'heat' || weather.state === 'cloudy') && (weather.cur.rain || 0) < 0.1;
    if (!soleil) { e.hidden = true; return true; }
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) e.hidden = false; return true; }
    if (e.state === 'flee' && !e.fuite) { e.fuite = true; e3Cri(e, 'froissement', c, 10); }
    if (e.fuite && e.state !== 'flee') { e.fuite = false; e.cache = 8 + Math.random() * 10; }
    return false;
  },
  // la grenouille rousse : des bonds en zigzag ; elle ronronne doucement, la nuit, les soirs de pluie
  grenouille(e, dt, w, c) {
    if (e.state === 'flee') { e.zigT = (e.zigT || 0) - dt; if (e.zigT <= 0) { e.zigT = 0.35 + Math.random() * 0.3; e.fleeDir += (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.5); } }
    if (c.night > 0.5 || (weather.cur.rain || 0) > 0.3) { e.criT = (e.criT ?? 10 + Math.random() * 30) - dt; if (e.criT <= 0) { e.criT = 30 + Math.random() * 60; e3Cri(e, 'rousse', c, 30); } }
    return false;
  },
  // la cicindèle : de courtes courses, des arrêts ; approchée, elle s'envole et se repose trois pas plus loin
  cicindele(e, dt, w, c) {
    if (e.volT > 0) {
      e.volT -= dt; e.fly = 1; e.phase += dt * 30; e3Elytres(e, true);
      e.x += Math.sin(e.heading) * dt * 3.5; e.z += Math.cos(e.heading) * dt * 3.5;
      e.y = w.heightAt(e.x, e.z) + Math.sin(Math.PI * clamp(1 - e.volT / 1.3, 0, 1)) * 0.6;
      if (e.volT <= 0) { e.fly = 0; e3Elytres(e, false); e.y = entities.groundY(w, e, e.x, e.z); e.hx = e.x; e.hz = e.z; }
      return true;
    }
    if (e.dist < (c.crouch ? 0.9 : 1.8)) { e.volT = 1.3; e.heading = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 1.2; e.envols = (e.envols || 0) + 1; if (e.envols > 6) e.e3Partir = true; return true; }
    if (e.state === 'walk') { e.dashT = (e.dashT ?? 0.3) - dt; if (e.dashT <= 0) { e.dashT = 0.2 + Math.random() * 0.3; e.state = 'idle'; e.timer = 0.4 + Math.random() * 1.6; } }
    return false;
  },
  // ------------------------------------------------------------ le marais
  // le busard des roseaux : bas au-dessus des roseaux, les ailes en V ; il se laisse tomber, et repart
  busard(e, dt, w, c) {
    if (e.tombe > 0) { e.tombe -= dt; const sol = Math.max(w.heightAt(e.x, e.z), w.waterLevel); e.y = lerp(e.y, sol + (e.tombe > 1 ? 0.3 : 4), Math.min(1, dt * 2.5)); e.fly = 1; e.phase += dt * 4; return true; }
    e3Tourne(e, dt, w, c, { R: 22, H: 5, v: 5, der: 70, mil: 'marais', ondule: 1 });
    if (e.dist < e3Alerte(e, c, 10)) { e.hx = e.x + (e.x - c.px); e.hz = e.z + (e.z - c.pz); }
    if (Math.random() < dt * 0.02) e.tombe = 2.5;
    e.criT = (e.criT ?? 20 + Math.random() * 40) - dt;
    if (e.criT <= 0) { e.criT = 60 + Math.random() * 80; e3Cri(e, 'busard', c, 140); }
    return true;
  },
  // le bihoreau : le jour, voûté dans un arbre près de l'eau ; au crépuscule et la nuit, il pêche au bord de l'eau
  bihoreau(e, dt, w, c) {
    const h = e3Heure(), jour = h >= 7 && h < 19;
    if (e.envol) { const r = e3Envol(e, dt, w, c); if (!e.envol && jour) { e.bouge = true; e.perch = null; } return r; }
    if (jour) {
      const r = e3Perche(e, dt, w, c, { haut: [0.26, 0.38], R: 30, v: 6 });
      if (e.rig) e.rig.set('neckB', r ? -0.9 : 0.4, 0, 0);
      if (!r) return true;
      if (e.dist < e3Alerte(e, c, e.cfg.flee)) { e.bouge = true; e3Cri(e, 'couac', c, 120); }
      return true;
    }
    // la nuit : au bord de l'eau, immobile ; il frappe
    if (e.perch) { e.perch = null; e3Ailes(e, false); if (e.eau) { e.x = e.eau.bx; e.z = e.eau.bz; } e.y = entities.groundY(w, e, e.x, e.z); e.hx = e.x; e.hz = e.z; }
    if (e.rig) e.rig.set('neckB', -0.4, 0, 0);
    e.fly = 0;
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) { e3Lever(e, c, { t: [4, 6], v: 6, h: 6 }); e3Cri(e, 'couac', c, 120); return true; }
    e.criT = (e.criT ?? 20 + Math.random() * 40) - dt;
    if (e.criT <= 0) { e.criT = 50 + Math.random() * 70; e3Cri(e, 'couac', c, 160); }
    e.peck = Math.sin(c.t * 0.6 + e.seed) > 0.85;
    if (e.state === 'walk' && Math.random() < dt * 0.3) { e.state = 'idle'; e.timer = 6; }
    return false;
  },
  // le râle d'eau : caché dans les roseaux, il crie comme un goret qu'on égorge ; parfois il sort, la queue relevée
  rale(e, dt, w, c) {
    if (e.dehors === undefined) { e.dehors = 0; e.cache = 5 + Math.random() * 20; }
    if (e.cache > 0) {
      e.cache -= dt; e.hidden = true;
      e.criT = (e.criT ?? 3 + Math.random() * 10) - dt;
      if (e.criT <= 0) { e.criT = 15 + Math.random() * 35; e3Cri(e, 'rale', c, 90); }
      if (e.cache <= 0) { e.hidden = false; e.dehors = 10 + Math.random() * 15; e.state = 'idle'; e.timer = 1; }
      return true;
    }
    e.dehors -= dt;
    if (e.rig) e.rig.set('tail', 0.6 + Math.max(0, Math.sin(c.t * 7)) * 0.4, 0, 0);
    if (e.dist < e3Alerte(e, c, e.cfg.flee) || e.dehors <= 0) { e.cache = 25 + Math.random() * 40; e3Cri(e, 'froissement', c, 15); return true; }
    return false;
  },
  // la bécassine : sur la vase, elle sonde ; levée, un cri rauque et un vol en zigzag ; au crépuscule, elle bêle là-haut
  becassine(e, dt, w, c) {
    const h = e3Heure();
    if (e.envol) return e3Envol(e, dt, w, c);
    if ((h >= 19 && h < 21.5) || (h >= 5 && h < 6.3)) {
      if (!e.bele) { e.bele = true; e.cx = undefined; e.hx = e.x; e.hz = e.z; e.belT = 3; }
      e3Tourne(e, dt, w, c, { R: 35, H: 26, v: 9, der: 40, mil: null, ondule: 3 });
      e.belT -= dt;
      if (e.belT <= 0) { e.belT = 6 + Math.random() * 6; e.pique = 1.6; e3Cri(e, 'chevre', c, 160); }
      if (e.pique > 0) { e.pique -= dt; e.y -= dt * 9; }
      return true;
    }
    if (e.bele) { e.bele = false; e.fly = 0; e.y = entities.groundY(w, e, e.x, e.z); e.hx = e.x; e.hz = e.z; }
    e.fly = 0;
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) {
      e3Lever(e, c, { t: [2.5, 3.5], v: 11, h: 5, zig: 0.8 }); e3Cri(e, 'scaap', c, 60); sound.flutter && sound.flutter(0.8, 0);
      e.levees = (e.levees || 0) + 1; if (e.levees > 2) e.e3Partir = true;
      return true;
    }
    e.peck = e.state === 'idle' && Math.sin(c.t * 2 + e.seed) > 0.2;
    return false;
  },
  // la poule d'eau : elle nage en hochant la tête ; inquiète, elle court sur l'eau jusqu'aux roseaux, et s'y cache
  poule_eau(e, dt, w, c) {
    const WL = w.waterLevel;
    if (w.heightAt(e.x, e.z) > WL - 0.05 && !(e.court > 0)) { e.y = entities.groundY(w, e, e.x, e.z); e.e3Partir = true; return false; } // (hors de l'eau : elle s'en va)
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) e.hidden = false; return true; }
    if (e.court > 0) {
      e.court -= dt; e.fly = 1; e.phase += dt * 9;
      e.x += Math.sin(e.heading) * dt * 3.2; e.z += Math.cos(e.heading) * dt * 3.2; e.y = WL + 0.05;
      if (e.court <= 0) { e.fly = 0; e.cache = 15 + Math.random() * 25; }
      return true;
    }
    e.fly = 0; e.y = WL - 0.06;
    if (e.dist < e3Alerte(e, c, e.cfg.flee)) { e.court = 1.6 + Math.random() * 0.8; e.heading = Math.atan2(e.x - c.px, e.z - c.pz); sound.flutter && sound.flutter(0.6, 0); e3Cri(e, 'kurruk', c, 70); return true; }
    // nager : vers un point d'eau voisin
    e.nageT = (e.nageT || 0) - dt;
    if (e.nageT <= 0 || !e.nage) {
      e.nageT = 4 + Math.random() * 6; e.nage = null;
      for (let k = 0; k < 8; k++) { const a = Math.random() * TAU, d = 1 + Math.random() * 6, tx = e.hx + Math.cos(a) * d, tz = e.hz + Math.sin(a) * d; if (w.heightAt(tx, tz) < WL - 0.15) { e.nage = [tx, tz]; break; } }
    }
    if (e.nage) {
      const dx = e.nage[0] - e.x, dz = e.nage[1] - e.z, d = Math.hypot(dx, dz);
      if (d > 0.2) { e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 3); const sp = Math.min(d, dt * 0.45); const nx = e.x + Math.sin(e.heading) * sp, nz = e.z + Math.cos(e.heading) * sp; if (w.heightAt(nx, nz) < WL - 0.1) { e.x = nx; e.z = nz; } else e.nage = null; }
    }
    e.peck = Math.sin(c.t * 5 + e.seed) > 0.3; // elle hoche la tête en nageant
    if (e.rig) e.rig.set('tail', 0.6 + Math.sin(c.t * 5 + e.seed) * 0.2, 0, 0);
    e.criT = (e.criT ?? 20 + Math.random() * 40) - dt;
    if (e.criT <= 0) { e.criT = 50 + Math.random() * 60; e3Cri(e, 'kurruk', c, 80); }
    return true;
  },
  // la rainette : sur un roseau, à mi-hauteur ; la nuit, elle chante un moment ; de trop près, elle saute et disparaît
  rainette(e, dt, w, c) {
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) { e.hidden = false; e.roseauY = undefined; } return true; }
    if (e.roseauY === undefined) e.roseauY = 0.25 + Math.random() * 0.5;
    e.move = 0; e.state = 'idle'; e.timer = 5;
    e.y = w.heightAt(e.x, e.z) + e.roseauY;
    if (e.dist < 1.2 && !c.crouch) { e.cache = 20 + Math.random() * 20; e3Cri(e, 'plouf', c, 10); return true; }
    if (c.night > 0.5 || (weather.cur.rain || 0) > 0.3) { e.criT = (e.criT ?? 4 + Math.random() * 20) - dt; if (e.criT <= 0) { e.criT = 25 + Math.random() * 50; e3Cri(e, 'rainette', c, 40); } }
    return true;
  },
  // la sangsue : elle nage en ondulant sous la surface ; elle vient à qui entre dans l'eau
  sangsue(e, dt, w, c) {
    const WL = w.waterLevel, p = game.player, pied = w.heightAt(c.px, c.pz) < WL - 0.18 && p.pos[1] < WL + 0.4;
    if (w.heightAt(e.x, e.z) > WL - 0.05) { e.hidden = true; e.e3Partir = true; return true; } // (hors de l'eau)
    e.y = WL - 0.05;
    e.hidden = e.dist > 9;
    let tx, tz;
    if (pied && e.dist < 6) { tx = c.px; tz = c.pz; if (e.dist < 0.6) { if (e3.collees < 6) e3.collees++; e3.oter(e); return true; } }
    else { e.nageT = (e.nageT || 0) - dt; if (e.nageT <= 0 || !e.nage) { e.nageT = 3 + Math.random() * 4; const a = Math.random() * TAU, d = Math.random() * 2.5; e.nage = [e.hx + Math.cos(a) * d, e.hz + Math.sin(a) * d]; } [tx, tz] = e.nage; }
    const dx = tx - e.x, dz = tz - e.z, d = Math.hypot(dx, dz);
    if (d > 0.1) { e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 3); const sp = Math.min(d, dt * (pied ? 0.35 : 0.12)), nx = e.x + Math.sin(e.heading) * sp, nz = e.z + Math.cos(e.heading) * sp; if (w.heightAt(nx, nz) < WL - 0.06) { e.x = nx; e.z = nz; } else e.nage = null; }
    e.move = 1; e.phase += dt * 4;
    return true;
  },
  // la crossope : au bord de l'eau ; elle plonge dans un nuage de bulles d'argent et reparaît plus loin
  crossope(e, dt, w, c) {
    if (e.plonge > 0) {
      e.plonge -= dt; e.hidden = true;
      if (Math.random() < dt * 4 && e.eau) particles.spawn(e.eau.wx + (Math.random() - 0.5), w.waterLevel + 0.02, e.eau.wz + (Math.random() - 0.5), 0, 0.15, 0, [0.85, 0.9, 0.95, 1], 0.025, 0.5, 0, false);
      if (e.plonge <= 0) { const R = e3.eauPres(w, e.hx, e.hz, 12); if (R) { e.x = R.bx; e.z = R.bz; e.eau = R; } e.y = entities.groundY(w, e, e.x, e.z); e.hidden = false; }
      return true;
    }
    if (e.dist < e3Alerte(e, c, e.cfg.flee) || Math.random() < dt * 0.03) {
      e.plonge = 5 + Math.random() * 6; e3Cri(e, 'plouf', c, 15);
      if (e.eau) for (let k = 0; k < 6; k++) particles.spawn(e.eau.wx + (Math.random() - 0.5) * 0.6, w.waterLevel + 0.02, e.eau.wz + (Math.random() - 0.5) * 0.6, 0, 0.3, 0, [0.85, 0.9, 0.95, 1], 0.03, 0.6, 0, false);
      return true;
    }
    e.criT = (e.criT ?? 5 + Math.random() * 20) - dt;
    if (e.criT <= 0) { e.criT = 25 + Math.random() * 40; e3Cri(e, 'crossope', c, 15); }
    return false;
  },
};
{
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    const B = e.cfg.e3 && E3_COMPORTE[e.cfg.e3];
    if (B && !e.owner && !e.piege) { try { if (B(e, dt, w, c)) return; } catch (err) { console.error(err); } }
    _uw(e, dt, w, c);
  };
}
// Au dessin : l'ombre de ces bêtes est à leur taille, et seulement quand elles touchent le sol ; les ailes du busard
// en V (rig.e3V) ; les rapaces et les échassiers battent des ailes lentement et planent (rig.lent, 11-zzzz8-nature.js)
{
  const MIENNES = [];
  for (const [kind] of E3_BETES) { const C = CREATURES[kind]; if (!C) continue; if (!E3_SANS_OMBRE.has(kind)) C.ombreE3 = C.radius <= 0.12 ? C.radius * 1.3 : Math.max(0.2, C.radius * 1.1); MIENNES.push(C); }
  const _draw = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) {
    const avant = MIENNES.map((C) => C.fly);
    for (const C of MIENNES) C.fly = true; // (au dessin, « fly » ne sert qu'à taire l'ombre commune)
    try { _draw(buf, sbuf, cam, maxD, t, flags); } finally { MIENNES.forEach((C, i) => { if (avant[i]) C.fly = avant[i]; else delete C.fly; }); }
    const w = game.world;
    if (!sbuf || !w) return;
    const m2 = maxD * maxD;
    for (const e of e3.vivantes) {
      if (e.hidden || e.far || e.dead || e.removed || !e.rig || !e.cfg.ombreE3) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz < m2 && e.y < w.heightAt(e.x, e.z) + 0.3 && e.y > w.waterLevel - 0.1) drawShadow(sbuf, e.x, e.y, e.z, e.cfg.ombreE3 * (e.scale || 1));
    }
  };
  const _pb = poseBird;
  poseBird = function (rig, st) {
    _pb(rig, st);
    if (rig.e3V && st.fly > 0) { const L = rig.parts[rig.idx.wingL].r, R = rig.parts[rig.idx.wingR].r; L[2] += 0.3; R[2] -= 0.3; }
  };
}
// le busard : les ailes en V
{
  const _r = ANIMAL_RIGS.e3_busard_roseaux;
  ANIMAL_RIGS.e3_busard_roseaux = (v) => { const r = _r(v); r.e3V = true; return r; };
}

// ---------------------------------------------------------------- la main, le filet, la chasse
// (E) le capricorne et la cicindèle se prennent à la main ; la sangsue aussi, dans l'eau ; la coronelle et la crossope
// mordent qui les prend
const E3_MAIN = { capricorne: 'capricorne', cicindele: 'cicindele', sangsue: 'sangsue', coronelle: null, crossope: null };
e3.toucher = function (e) {
  const p = game.player, E = this.S();
  if (e.kind === 'coronelle' || e.kind === 'crossope') {
    E.morsures++;
    play.hurt(e.kind === 'coronelle' ? 2 : 1, e, e.kind === 'coronelle' ? 'Mordu par une coronelle' : 'Mordu par une crossope');
    sound.e3Cri && sound.e3Cri(e.kind === 'coronelle' ? 'siffle' : 'crossope', e, 1);
    if (e.kind === 'crossope') { e.plonge = 6; } else entities.startFlee(e, p.pos[0], p.pos[2]);
    if (E.morsures === 1) ui.subtitle('', e.kind === 'coronelle' ? '(Elle a mordu. Ce n’est rien, mais ça saigne un peu.)' : '(Une morsure minuscule, qui engourdit le doigt.)', 3);
    if (e.kind === 'coronelle') corps.saigner(0.03, 'Mordu par une coronelle');
    return;
  }
  const id = E3_MAIN[e.kind];
  if (!id) return;
  // la cicindèle file entre les doigts, une fois sur deux
  if (e.kind === 'cicindele' && Math.random() < 0.5) { e.volT = 1.3; e.heading = Math.random() * TAU; return; }
  farm.give(id, 1); play.flyer(id, [e.x, e.y + 0.1, e.z], 1);
  sound.pop && sound.pop();
  if (e.kind === 'capricorne') sound.e3Cri && sound.e3Cri('grince', e, 1);
  this.oter(e);
};
HOOKS.target.push((eye, f, cand) => {
  if (!e3.vivantes.length) return;
  for (const e of e3.vivantes) {
    if (!(e.kind in E3_MAIN) || e.hidden || e.dead || e.removed) continue;
    const dx = e.x - eye[0], dy = e.y + 0.03 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > 2.4) continue;
    if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.85) continue;
    cand({ kind: 'hook', e3: e, use: () => e3.toucher(e) }, d + 0.05);
  }
});
// le filet : les papillons et les coléoptères (posés, presque à coup sûr ; en vol, plus difficile)
if (typeof nature2 !== 'undefined' && nature2.PRISES) Object.assign(nature2.PRISES, { grand_mars: 'grand_mars', morio: 'morio', cuivre_marais: 'cuivre_marais', capricorne: 'capricorne', cicindele: 'cicindele' });
{
  const _cf = nature2.coupFilet.bind(nature2);
  nature2.coupFilet = function (eye, basis) {
    const e = this.cibleFilet(eye, basis.f);
    if (e && E3_VIE[e.kind] && e.fly > 0 && !(e.pose > 0) && Math.random() < (game.player.crouch > 0.5 ? 0.3 : 0.5)) {
      play.swingT = 0.42; play.cool = 0.7; sound.natCri && sound.natCri('filet', 0, 1);
      e.fuite = 0; e.effraye = true; if (e.kind === 'cicindele' || e.kind === 'capricorne') e.volT = 1.3; // (manqué : il s'effraie)
      return;
    }
    const avant = e && e3.vivantes.includes(e);
    _cf(eye, basis);
    if (avant && e.removed) e3.vivantes = e3.vivantes.filter((q) => q !== e);
  };
}
// la chasse : leurs noms, le bois du daim mâle, le daim pris au piège
if (typeof CHASSE_NOMS !== 'undefined') Object.assign(CHASSE_NOMS, {
  daim: 'le daim', autour: 'l’autour', pic_noir: 'le pic noir', becasse: 'la bécasse', cigogne_noire: 'la cigogne noire', sonneur: 'le sonneur', coronelle: 'la coronelle',
  capricorne: 'le capricorne', grand_mars: 'le grand mars', oreillard: 'l’oreillard', gelinotte: 'la gélinotte', pic_epeiche: 'le pic épeiche', bondree: 'la bondrée',
  moyen_duc: 'le hibou', musaraigne: 'la musaraigne', muscardin: 'le muscardin', lezard_vivipare: 'le lézard', grenouille_rousse: 'la grenouille', morio: 'le morio',
  cicindele: 'la cicindèle', busard_roseaux: 'le busard', bihoreau: 'le bihoreau', aigrette: 'l’aigrette', rale_eau: 'le râle', becassine: 'la bécassine',
  poule_eau: 'la poule d’eau', rainette: 'la rainette', sangsue: 'la sangsue', crossope: 'la crossope', cuivre_marais: 'le cuivré',
});
if (typeof CHASSE_PRISES !== 'undefined') for (const m of ['foret', 'bouleaux']) if (CHASSE_PRISES[m] && !CHASSE_PRISES[m].includes('daim')) CHASSE_PRISES[m].push('daim');
if (typeof chasse !== 'undefined') {
  const _bt = chasse.butin.bind(chasse);
  chasse.butin = function (kind, scale, e) {
    const L = _bt(kind, scale, e);
    if (kind === 'daim' && e && (e.v | 0) % 2 === 0 && (scale || 1) >= 0.7 && Math.random() < 0.85) { const q = L.find((x) => x[0] === 'bois_daim'); if (q) q[1]++; else L.push(['bois_daim', 1]); }
    return L;
  };
}
// la sangsue, posée sur la peau : elle boit le mauvais sang (le venin d'une vipère, la nausée) ; on y perd un peu
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held || id !== 'sangsue') return false;
  const p = game.player;
  if (!farm.take('sangsue', 1)) return false;
  play.cool = 1.2;
  const avait = (play.poisonT || 0) > 0 || (play.nausea || 0) > 0.3;
  play.poisonT = Math.max(0, (play.poisonT || 0) - 30); play.nausea = Math.min(play.nausea || 0, 0.2);
  p.hp = Math.max(1, p.hp - 2);
  corps.saigner(0.03, 'Saigné par une sangsue');
  ui.subtitle('', avait ? '(Elle s’attache, se gonfle de sang noir, puis tombe. La tête vous tourne moins.)' : '(Elle s’attache, se gonfle, puis tombe d’elle-même.)', 3.5);
  return true;
});

// ---------------------------------------------------------------- branchements
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!playing) return;
  try { e3.maj(dt, eye, basis, sky); e3.majSangsues(dt); } catch (err) { console.error(err); }
});
HOOKS.load.push(() => { e3.vivantes = []; e3.t = 3; e3.collees = 0; e3.mouille = false; e3.marW = null; e3.S(); });
