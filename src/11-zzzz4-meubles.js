// ============================================================================
//  MEUBLER SA MAISON, ET L'ACHETER (agent Y)
//  - Les trois maisons de la commune (11-zzz96-location.js) se louent, et
//    désormais s'ACHÈTENT : chez le maire (« Les maisons de la commune ») ou sur
//    l'écriteau, vingt semaines de loyer, comptant. La maison est alors à vous
//    pour toujours : la clé, le lit, le coffre, plus de loyer ni d'expulsion.
//    Un bail en cours se change en achat (le coffre suit). On peut la revendre
//    à la commune, moitié prix.
//  - MEUBLER : chez soi (la maison de la ferme, une maison louée ou achetée),
//    on pose des meubles sur le plancher, avec l'objet en main : le fantôme
//    suit le regard, se colle aux murs, tourne d'un quart de tour (clic droit
//    ou R), refuse les murs, les autres meubles, le passage devant la porte et
//    devant ce qui sert (cheminée, fouilles), et la place où l'on se tient. Le
//    tableau s'accroche au mur. On REPREND un meuble avec E (ou en maintenant
//    E quand il sert à autre chose : dormir, ouvrir, allumer) ; il revient en
//    main, prêt à être posé ailleurs.
//  - Les meubles : lit, lit clos, armoire, commode, buffet, malle, étagère,
//    horloge comtoise (elle sonne les heures), chandelier, guéridon et sa lampe
//    (E : allumer, éteindre), tableau, fauteuil, et ceux qui existaient (table,
//    chaise, banc, coffre, tapis, pot de fleurs). Un lit posé sert à dormir
//    (11-zzz95-sommeil.js les connaît) ; coffre, armoire, commode, buffet et
//    malle sont des rangements. Les nouveaux ne se posent qu'à l'intérieur.
//  - Ils s'achètent au GARDE-MEUBLE DE LA COMMUNE (le grenier de la mairie : le
//    maire vend les successions que personne n'a réclamées) et, d'occasion, chez
//    Lazare le brocanteur, le Marchedi ; ils se FABRIQUENT à l'établi (recettes
//    à trouver en assemblant, dans le Manuel du menuisier, auprès de gens de
//    métier ; les clous se forgent au four).
//  - Casser ses propres meubles n'est pas un crime (11-zzzz2-objets.js). Les
//    meubles d'une maison rendue reviennent dans la sacoche ; ceux d'une maison
//    saisie partent à la mairie avec le coffre (on les reprend contre la dette).
//  État : farm.s.meubles = { v, maisons: { clé: { jour, prix, coffre } }, vus }
//         (les meubles posés sont des objets posés ordinaires : farm.s.props)
//  API : meubles (S(), proprio(k), acheter(k), revendre(k), prixAchat(k),
//        prixRevente(k), chezMoi(k), dans(x, y, z), meublesDans(k),
//        reprendre(q), ouvrirGardeMeuble(n))
// ============================================================================

// ---------------------------------------------------------------- le catalogue
// nom, prix (ce que rend la caisse d'expédition : la valeur du bois), vente (le garde-meuble de la commune),
// le / pr (« le lit », « le reprendre »), dedans (ne se pose qu'à l'intérieur), range (rangement), lit, lampe, heure,
// mur (s'accroche), plat (se pose sous les autres), data (données du modèle), recette (établi)
const MEUBLES = {
  lit: { nom: 'Lit', prix: 12, vente: 180, le: 'le lit', pr: 'le', dedans: 1, lit: 1, data: { col: '#8a3a34' }, recette: { bois: 10, toile: 3, laine: 2 },
    desc: 'Un lit de bois, sa paillasse et une courtepointe rouge. Posé chez vous, on y dort.' },
  lit_clos: { nom: 'Lit clos', prix: 14, vente: 320, le: 'le lit clos', pr: 'le', dedans: 1, lit: 1, data: { col: '#5a4a72' }, recette: { bois: 16, toile: 2, laine: 2, clous: 2 },
    desc: 'Un lit fermé comme une armoire, à volets coulissants. On y dort au chaud, à l’abri des courants d’air et de ce qui passe la nuit dans la pièce.' },
  armoire: { nom: 'Armoire', prix: 8, vente: 260, le: 'l’armoire', pr: 'la', dedans: 1, range: 1, data: { vide: false }, recette: { bois: 14, clous: 2 },
    desc: 'Une armoire de chêne à deux portes. Chez vous, on y range ce qu’on veut.' },
  commode: { nom: 'Commode', prix: 12, vente: 190, le: 'la commode', pr: 'la', dedans: 1, range: 1, data: { vide: false }, recette: { bois: 10, clous: 2, lingot_cuivre: 1 },
    desc: 'Trois tiroirs à poignées de laiton. On y range le linge, et le reste.' },
  buffet: { nom: 'Buffet', prix: 8, vente: 240, le: 'le buffet', pr: 'le', dedans: 1, range: 1, recette: { bois: 12, clous: 2, lingot_fer: 1 },
    desc: 'Un buffet à vaisselier, avec ses assiettes. Dans le bas, de quoi ranger.' },
  malle: { nom: 'Malle', prix: 10, vente: 110, le: 'la malle', pr: 'la', dedans: 1, range: 1, data: { vide: false }, recette: { bois: 8, cuir: 2, lingot_fer: 1 },
    desc: 'Une malle cerclée de fer, pour les voyages qu’on ne fait plus. On y range ce qu’on veut.' },
  etagere: { nom: 'Étagère', prix: 3, vente: 70, le: 'l’étagère', pr: 'la', dedans: 1, data: { kind: 'livres' }, recette: { bois: 6, clous: 1 },
    desc: 'Des rayonnages de bois, avec quelques livres dont personne ne se souvient d’avoir lu la fin.' },
  horloge_comtoise: { nom: 'Horloge comtoise', prix: 60, vente: 450, le: 'l’horloge', pr: 'la', dedans: 1, heure: 1,
    desc: 'Une grande horloge à balancier. Elle compte les heures de la maison, et les sonne.' },
  chandelier: { nom: 'Chandelier', prix: 30, vente: 120, le: 'le chandelier', pr: 'le', dedans: 1, lampe: 1, data: { lit: true }, recette: { lingot_fer: 1, bougie: 3 },
    desc: 'Un chandelier de fer forgé, haut sur pied, à trois bougies. On l’allume et on l’éteint d’une main.' },
  gueridon: { nom: 'Guéridon et sa lampe', prix: 12, vente: 95, le: 'le guéridon', pr: 'le', dedans: 1, lampe: 1, data: { lit: true }, recette: { bois: 4, lingot_cuivre: 1, huile: 1 },
    desc: 'Un petit guéridon rond, une lampe à huile dessus, et son globe d’opaline.' },
  tableau: { nom: 'Tableau', prix: 10, vente: 140, le: 'le tableau', pr: 'le', dedans: 1, mur: 1,
    desc: 'Une toile dans un cadre doré : la vallée au soir, un aïeul, des fruits, le lac la nuit. Il s’accroche au mur.' },
  fauteuil: { nom: 'Fauteuil', prix: 12, vente: 150, le: 'le fauteuil', pr: 'le', dedans: 1, data: { col: '#6a3434' }, recette: { bois: 6, toile: 2, laine: 1 },
    desc: 'Un fauteuil de velours, un peu affaissé du côté où quelqu’un s’asseyait toujours.' },
  // ceux qui existaient déjà (objets et recettes d'avant)
  table: { vente: 90, le: 'la table', pr: 'la' }, chaise: { vente: 30, le: 'la chaise', pr: 'la' }, banc: { vente: 45, le: 'le banc', pr: 'le' },
  coffre: { vente: 60, le: 'le coffre', pr: 'le', range: 1 }, tapis: { vente: 80, le: 'le tapis', pr: 'le', plat: 1 }, pot_fleurs: { vente: 25, le: 'le pot de fleurs', pr: 'le' },
};
// maisons à vendre : le prix, en semaines de loyer (équilibrage : tools/equilibrage/commerce.js, section « coûts »)
const MEU_SEMAINES = 20;
// objets posés à plat (on pose un meuble dessus) ; ceux qu'on ne recouvre jamais (la trappe de la cave)
const MEU_PLATS = new Set(['tapis', 'plancher', 'dalle', 'allee', 'sang', 'traces', 'lettre', 'fouille']);
const MEU_BLOQUE_TOUT = new Set(['trappe']);
// le garde-meuble de la commune (le grenier de la mairie)
const MEUBLES_GARDE = { name: 'Le garde-meuble de la commune', sells: Object.keys(MEUBLES).map((id) => [id, MEUBLES[id].vente]), buys: [] };

// ---------------------------------------------------------------- objets, recettes, sons, casse
for (const id in MEUBLES) {
  const M = MEUBLES[id];
  if (!M.nom) continue; // (objet d'avant)
  PLACEABLES[id] = { name: M.nom, price: M.prix, meuble: true };
  defItem(id, M.nom, 'objet', M.prix, ['objet', id], { place: id, desc: M.desc });
  if (M.recette) RECIPES.push({ out: id, n: 1, need: M.recette, st: 'etabli' });
}
for (const id of ['table', 'chaise', 'banc', 'coffre', 'tapis', 'pot_fleurs']) if (PLACEABLES[id]) PLACEABLES[id].meuble = true;
// les clous se forgent au four (un lingot de fer, cinq poignées)
if (ITEMS.clous) RECIPES.push({ out: 'clous', n: 5, need: { lingot_fer: 1 }, st: 'four' });
// les lits nouveaux, pour le sommeil (demi-largeur, demi-longueur, hauteur du dessus)
LIT_TAILLE.lit_clos = [0.9, 0.42, 0.53];
// ce que donnent les meubles nouveaux quand on les casse (11-zzzz2-objets.js)
Object.assign(OBJ_CASSE, {
  lit_clos: ['bois', 90, [['bois', 2, 4], ['toile', 1, 1, 0.5]], { lourd: 1 }],
  horloge_comtoise: ['bois', 55, [['bois', 1, 2], ['ferraille', 1, 1], ['lingot_cuivre', 1, 1, 0.3]], { lourd: 1 }],
  chandelier: ['metal', 35, [['ferraille', 1, 1]]],
  gueridon: ['bois', 20, [['bois', 1, 1], ['eclats_verre', 1, 1]]],
  tableau: ['tissu', 6, [['toile', 1, 1, 0.5], ['bois', 0, 1]]],
  fauteuil: ['bois', 30, [['bois', 1, 1], ['toile', 1, 1, 0.5]]],
});
// le Manuel du menuisier les enseigne ; quelques gens de métier aussi
if (typeof LIVRES !== 'undefined' && LIVRES.manuel_menuisier) for (const id of ['lit', 'lit_clos', 'armoire', 'commode', 'buffet', 'malle', 'etagere', 'fauteuil']) if (!LIVRES.manuel_menuisier.recettes.includes(id)) LIVRES.manuel_menuisier.recettes.push(id);
if (typeof fabrication !== 'undefined' && fabrication.LECONS) {
  const L = fabrication.LECONS;
  if (L.forgeron) { L.forgeron.splice(2, 0, ['clous', 0, 10]); L.forgeron.push(['chandelier', 3, 30]); }
  if (L.aubergiste) L.aubergiste.push(['etagere', 1, 15], ['fauteuil', 3, 30]);
  if (L.colporteur) L.colporteur.push(['gueridon', 3, 40]);
  if (L.colporteuse) L.colporteuse.push(['lit', 2, 30]);
}
// Lazare le brocanteur (le Marchedi) : quelques meubles d'occasion, une pièce de chaque par semaine
if (typeof ACT_ETALS !== 'undefined') {
  const R = ACT_ETALS.find((e) => e.id === 'brocanteur');
  if (R) { R.vend.push(['tableau', 90], ['fauteuil', 110], ['chandelier', 95]); R.n = Math.max(R.n || 3, 4); }
}
// l'horloge comtoise sonne les heures
Object.assign(SoundEngine.prototype, {
  comtoise(k = 1) {
    if (!this.ok) return;
    const t = this.at(), out = this.lp(2600, this.sfx), v = 0.05 * k;
    for (const [f, a, d] of [[587, 1, 2.2], [1174, 0.35, 1.2], [1480, 0.18, 0.8], [293, 0.3, 1.8]]) this.tone(t, 'sine', f, f * 0.997, d, v * a, out, 0.003);
    this.noiseHit(t, 0.03, 'bandpass', 2600, 2, 0.02 * k);
  },
});
DYN_PROPS.add('horloge_comtoise'); DYN_PROPS.add('chandelier');

// ============================================================================
//  LE MODULE
// ============================================================================
const meubles = {
  cacheP: null, cacheT: 0, penseT: {}, toile: -1, chimeH: null, gardeDit: false, bldJ: null, bldJT: 0,

  // ------------------------------------------------------------------ l'état
  S() {
    const s = farm.s;
    if (!s) return null;
    const M = s.meubles && typeof s.meubles === 'object' ? s.meubles : (s.meubles = {});
    if (!M.v) M.v = 1;
    if (!M.maisons || typeof M.maisons !== 'object') M.maisons = {};
    if (!M.vus || typeof M.vus !== 'object') M.vus = {};
    return M;
  },
  maison(k) { const M = farm.s && farm.s.meubles; return M && M.maisons && M.maisons[k] ? M.maisons[k] : null; },
  proprio(k) { return !!this.maison(k); },
  prixAchat(k) { const M = LOC_MAISONS[k]; return M ? M.loyer * MEU_SEMAINES : 0; },
  prixRevente(k) { return Math.round(this.prixAchat(k) / 20) * 10; },
  titre(k) { const M = LOC_MAISONS[k]; return M ? M.nom.charAt(0).toUpperCase() + M.nom.slice(1) : ''; },
  pense(cle, texte, d) { const t = performance.now(); if ((this.penseT[cle] || 0) > t) return; this.penseT[cle] = t + 5000; ui.subtitle('', texte, d || 2.6); },
  actif() {
    if (!farm.s || game.kind !== 'farm' || !game.world || game.world !== farm.w || game.dying) return false;
    try {
      if (typeof strange !== 'undefined' && strange.inEnvers && strange.inEnvers()) return false;
      if (typeof mondes !== 'undefined' && mondes.actuel && mondes.actuel() && mondes.aPart && mondes.aPart()) return false;
    } catch (e) { return false; }
    return true;
  },

  // ------------------------------------------------------------------ chez soi : la ferme, une maison louée ou achetée
  chezMoi(k) { return k === 'ferme' || (!!LOC_MAISONS[k] && typeof locations !== 'undefined' && locations.locataire(k)); },
  // le bâtiment où se trouve un point (ou null)
  dans(x, y, z, marge) {
    const w = game.world, m = marge === undefined ? 0.05 : marge;
    for (const k in w.bld) {
      const B = w.bld[k];
      if (!B || !B.f || !B.W || !B.D || B.under) continue;
      if (Math.abs(B.f.x - x) > 12 || Math.abs(B.f.z - z) > 12 || Math.abs(y - B.y) > 2.6) continue;
      const [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, x, z);
      if (Math.abs(lx) < B.W / 2 - m && Math.abs(lz) < B.D / 2 - m) return k;
    }
    return null;
  },
  // le bâtiment du joueur (recalculé quatre fois par seconde)
  bldJoueur() {
    const t = performance.now();
    if (t < this.bldJT) return this.bldJ;
    const p = game.player;
    this.bldJ = this.dans(p.pos[0], p.pos[1], p.pos[2], 0.05); this.bldJT = t + 250;
    return this.bldJ;
  },
  // la pièce : repère, plancher, murs intérieurs, porte
  geo(k) {
    const w = game.world, B = w.bld[k];
    if (!B || !B.f) return null;
    const f = { x: B.f.x, z: B.f.z, r: B.f.r }, G = { k, B, f, y: B.y, IX: B.W / 2 - 0.3, IZ: B.D / 2 - 0.3, porte: null };
    const dr = B.door >= 0 ? w.doors[B.door] : null;
    if (dr) {
      const [dx, dz] = World.blockLocal(f, dr.x, dr.z), surZ = Math.abs(dz) / (B.D / 2) > Math.abs(dx) / (B.W / 2);
      G.porte = { x: dx, z: dz, w: dr.w || 1.2, surZ, s: surZ ? Math.sign(dz) : Math.sign(dx) };
    }
    return G;
  },
  loc(G, x, z) { return World.blockLocal(G.f, x, z); },
  monde(G, lx, lz) { const c = Math.cos(G.f.r), s = Math.sin(G.f.r); return [G.f.x + lx * c + lz * s, G.f.z - lx * s + lz * c]; },

  // ------------------------------------------------------------------ empreintes (repère de la pièce)
  // boîte du modèle d'un meuble (repère du modèle)
  bbModele(id, data) {
    let bb = null;
    try { bb = objMesure({ id, data: data || null }); } catch (e) { bb = null; }
    if (bb) return bb;
    const c = PROP_COLL[id];
    return c ? { x0: -c[0], x1: c[0], y0: 0, y1: c[2], z0: -c[1], z1: c[1] } : { x0: -0.3, x1: 0.3, y0: 0, y1: 0.8, z0: -0.3, z1: 0.3 };
  },
  // un quart de tour k (repère de la pièce) : l'emprise [x0, x1, z0, z1] autour du centre
  tourner(bb, k) {
    switch (k & 3) {
      case 0: return [bb.x0, bb.x1, bb.z0, bb.z1];
      case 1: return [bb.z0, bb.z1, -bb.x1, -bb.x0];
      case 2: return [-bb.x1, -bb.x0, -bb.z1, -bb.z0];
      default: return [-bb.z1, -bb.z0, bb.x0, bb.x1];
    }
  },
  // les objets posés dans la pièce, avec leur emprise (repère de la pièce) ; renouvelé trois fois par seconde
  objetsPiece(G) {
    const w = game.world, t = performance.now(), C = this.cacheP;
    if (C && C.k === G.k && C.n === w.props.length && t < this.cacheT) return C.L;
    const L = [];
    for (const q of w.props) {
      if (!w.live(q) || Math.abs(q.x - G.f.x) > 9 || Math.abs(q.z - G.f.z) > 9 || q.y < G.y - 0.6 || q.y > G.y + 2.8) continue;
      const [cx, cz] = this.loc(G, q.x, q.z);
      if (Math.abs(cx) > G.IX + 0.9 || Math.abs(cz) > G.IZ + 0.9) continue;
      let bb = null;
      try { bb = objMesure(q); } catch (e) { bb = null; }
      if (!bb) { const c = PROP_COLL[q.id]; if (!c) continue; bb = { x0: -c[0], x1: c[0], y0: 0, y1: c[2], z0: -c[1], z1: c[1] }; }
      const s = q.s || 1, d = (q.r || 0) - G.f.r, co = Math.cos(d), si = Math.sin(d);
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (const [mx, mz] of [[bb.x0, bb.z0], [bb.x1, bb.z0], [bb.x0, bb.z1], [bb.x1, bb.z1]]) {
        const lx = cx + (mx * co + mz * si) * s, lz = cz + (-mx * si + mz * co) * s;
        x0 = Math.min(x0, lx); x1 = Math.max(x1, lx); z0 = Math.min(z0, lz); z1 = Math.max(z1, lz);
      }
      L.push({ q, a: [x0, x1, z0, z1], y0: q.y + bb.y0 * s, y1: q.y + bb.y1 * s, plat: MEU_PLATS.has(q.id) || bb.y1 * s < 0.06, tout: MEU_BLOQUE_TOUT.has(q.id) });
    }
    this.cacheP = { k: G.k, n: w.props.length, L }; this.cacheT = t + 330;
    return L;
  },
  // le passage devant la porte (repère de la pièce)
  zonePorte(G) {
    const P = G.porte;
    if (!P) return null;
    const lg = P.w / 2 + 0.3, prof = 1.25;
    if (P.surZ) { const z = P.s * G.IZ; return [P.x - lg, P.x + lg, Math.min(z, z - P.s * prof), Math.max(z, z - P.s * prof)]; }
    const x = P.s * G.IX;
    return [Math.min(x, x - P.s * prof), Math.max(x, x - P.s * prof), P.z - lg, P.z + lg];
  },
  croise(a, b, m) { m = m || 0; return a[0] < b[1] - m && b[0] < a[1] - m && a[2] < b[3] - m && b[2] < a[3] - m; },

  // ------------------------------------------------------------------ le fantôme de pose, chez soi
  // le rayon du regard dans la pièce : le plancher, ou le premier mur (repère de la pièce) ; null au-delà de la portée
  viser(G, eye, f) {
    const [ex, ez] = this.loc(G, eye[0], eye[2]), c = Math.cos(G.f.r), s = Math.sin(G.f.r);
    const dx = f[0] * c - f[2] * s, dz = f[0] * s + f[2] * c, dy = f[1], R = 4.6;
    let best = null;
    if (dy < -0.02) { const t = (G.y - eye[1]) / dy; if (t > 0 && t <= R) best = { t, sol: true }; }
    const murs = [[dx, G.IX - ex, 0, 1], [-dx, G.IX + ex, 0, -1], [dz, G.IZ - ez, 1, 1], [-dz, G.IZ + ez, 1, -1]];
    for (const [v, d, axe, sg] of murs) {
      if (v <= 1e-6) continue;
      const t = d / v;
      if (t > 0 && t <= R && (!best || t < best.t)) best = { t, sol: false, axe, sg };
    }
    if (!best) return null;
    return Object.assign(best, { x: ex + dx * best.t, z: ez + dz * best.t, y: eye[1] + dy * best.t });
  },
  // le fantôme, calculé dans la pièce G (id : le modèle ; item : l'objet en main)
  fantome(G, id, item, eye, f) {
    const M = MEUBLES[id] || {}, V = this.viser(G, eye, f);
    if (!V) return null;
    const data = this.dataPose(id);
    const bb = this.bbModele(id, data);
    let k, cx, cz, y = G.y;
    if (M.mur) {
      // au mur : le mur regardé (ou le plus proche du point visé au sol), à hauteur de regard
      let axe = V.axe, sg = V.sg;
      if (V.sol) { const gx = G.IX - Math.abs(V.x), gz = G.IZ - Math.abs(V.z); if (gx < gz) { axe = 0; sg = Math.sign(V.x) || 1; } else { axe = 1; sg = Math.sign(V.z) || 1; } if (Math.min(gx, gz) > 1.2) return Object.assign({ id, item, data, meuble: true, mur: true, ok: false, why: 'mur' }, this.poser(G, V.x, V.z, 0, G.y + 1.2)); }
      k = axe === 0 ? (sg > 0 ? 3 : 1) : (sg > 0 ? 2 : 0);
      const h = V.sol ? G.y + 1.35 : clamp(V.y - 0.3, G.y + 0.8, G.y + 2.0);
      const demi = (bb.x1 - bb.x0) / 2 + 0.02;
      if (axe === 0) { cx = sg * (G.IX - 0.004); cz = clamp(V.z, -G.IZ + demi, G.IZ - demi); }
      else { cz = sg * (G.IZ - 0.004); cx = clamp(V.x, -G.IX + demi, G.IX - demi); }
      y = h;
    } else {
      // au sol : le point visé, l'emprise gardée dans la pièce, collée au mur si elle en est tout près
      const yaw = game.player.yaw, base = Math.round((yaw - G.f.r) / (Math.PI / 2)), pas = Math.round(play.rotY / (Math.PI / 4));
      k = ((base + pas) % 4 + 4) % 4;
      const a = this.tourner(bb, k);
      cx = V.x; cz = V.z;
      if (a[1] - a[0] > 2 * G.IX || a[3] - a[2] > 2 * G.IZ) return Object.assign({ id, item, data, meuble: true, ok: false, why: 'place' }, this.poser(G, cx, cz, k, y));
      const aimant = 0.28, e = 0.012;
      const colle = (c, lo, hi, I) => {
        let v = c;
        if (v + lo < -I + e) v = -I + e - lo; else if (v + hi > I - e) v = I - e - hi;
        if (v + lo < -I + aimant) v = -I + e - lo; else if (v + hi > I - aimant) v = I - e - hi;
        return v;
      };
      cx = colle(cx, a[0], a[1], G.IX); cz = colle(cz, a[2], a[3], G.IZ);
    }
    const g = Object.assign({ id, item, data, meuble: true, mur: !!M.mur }, this.poser(G, cx, cz, k, y));
    const why = this.verifier(G, id, bb, k, cx, cz, y, !!M.plat, !!M.mur);
    g.ok = !why; g.why = why;
    return g;
  },
  poser(G, cx, cz, k, y) { const [x, z] = this.monde(G, cx, cz); return { x, y, z, r: G.f.r + k * Math.PI / 2, k, lx: cx, lz: cz }; },
  // pourquoi ça ne va pas (ou null)
  verifier(G, id, bb, k, cx, cz, y, plat, mur) {
    const t = this.tourner(bb, k), A = [cx + t[0], cx + t[1], cz + t[2], cz + t[3]], y0 = y + bb.y0, y1 = y + bb.y1;
    // la porte : on passe (un tapis, lui, peut y être)
    const zp = plat ? null : this.zonePorte(G);
    if (zp) {
      if (mur) { const P = G.porte; if (P && ((P.surZ && Math.abs(cz - P.s * G.IZ) < 0.1) || (!P.surZ && Math.abs(cx - P.s * G.IX) < 0.1)) && this.croise(A, [zp[0] - 0.05, zp[1] + 0.05, zp[2] - 0.05, zp[3] + 0.05])) return 'porte'; }
      else if (this.croise(A, zp)) return 'porte';
    }
    // les autres objets de la pièce (un tapis passe sous tout ; rien ne recouvre la trappe)
    for (const O of this.objetsPiece(G)) {
      if (!O.tout && O.plat !== plat) continue;
      if (O.y0 > y1 - 0.02 || O.y1 < y0 + 0.02) continue;
      if (this.croise(A, O.a, 0.01)) return 'meuble';
    }
    if (mur || plat) return null;
    // ce qui sert (cheminée, lit, fouilles…) : on laisse la place devant
    for (const it of game.world.inter) {
      if (Math.abs(it.x - G.f.x) > 9 || Math.abs(it.z - G.f.z) > 9 || it.y < G.y - 0.5 || it.y > G.y + 2.4) continue;
      const [lx, lz] = this.loc(G, it.x, it.z);
      if (lx > A[0] - 0.12 && lx < A[1] + 0.12 && lz > A[2] - 0.12 && lz < A[3] + 0.12) return 'passage';
    }
    // on ne pose pas un meuble sur soi
    const p = game.player.pos, [px, pz] = this.loc(G, p[0], p[2]);
    if (Math.hypot(Math.max(0, A[0] - px, px - A[1]), Math.max(0, A[2] - pz, pz - A[3])) < 0.3) return 'vous';
    return null;
  },
  // les données du modèle posé (le tableau : une toile au hasard, gardée tant qu'on le tient)
  dataPose(id) {
    const M = MEUBLES[id] || {}, d = M.data ? JSON.parse(JSON.stringify(M.data)) : {};
    if (M.range) d.items = {};
    if (id === 'tableau') { if (this.toile < 0) this.toile = (Math.random() * MEU_TOILES.length) | 0; d.v = this.toile; }
    return Object.keys(d).length ? d : null;
  },
  RAISONS: {
    porte: '(Pas devant la porte : il faut pouvoir passer.)',
    meuble: '(Ça touche un autre meuble.)',
    passage: '(Il faut laisser la place devant.)',
    vous: '(Vous êtes dans le chemin.)',
    mur: '(Il faudrait un mur, tout près.)',
    place: '(Il n’y a pas la place, dans cette pièce.)',
    dehors: '(Un meuble pareil, ça se pose à l’intérieur, chez soi.)',
    ailleurs: '(Ce n’est pas chez vous, ici.)',
    pasMeuble: '(Dans une maison de la ville, on ne pose que des meubles.)',
  },
  // play.updateGhost : chez soi, les meubles suivent la pièce ; ailleurs, les nouveaux ne se posent pas
  majFantome(eye, f) {
    const g = play.ghost, id0 = farm.s.hand, it = ITEMS[id0];
    if (!it || !it.place || !this.actif()) return;
    const P = PLACEABLES[it.place] || {}, meuble = !!P.meuble;
    const k = this.bldJoueur(), chez = k && this.chezMoi(k);
    if (chez) {
      if (!meuble) {
        if (k === 'ferme') return; // (à la ferme, le reste se pose comme avant)
        if (g) { g.ok = false; g.why = 'pasMeuble'; }
        return;
      }
      const G = this.geo(k);
      if (!G) return;
      play.ghost = this.fantome(G, it.place, id0, eye, f);
      return;
    }
    if (!meuble || !(MEUBLES[it.place] && MEUBLES[it.place].dedans)) return;
    if (g) { g.ok = false; g.why = k ? 'ailleurs' : 'dehors'; }
  },
  // play.place : un meuble chez soi
  pose(held) {
    const g = play.ghost;
    if (!g || !g.meuble) return false;
    if (held) return true;
    if (!g.ok) { sound.click && sound.click(); if (g.why && this.RAISONS[g.why]) this.pense('pose', this.RAISONS[g.why], 2.4); return true; }
    if (!farm.take(g.item, 1)) return true;
    const data = g.data ? JSON.parse(JSON.stringify(g.data)) : null;
    const q = farm.addProp({ id: g.id, x: g.x, y: g.y, z: g.z, r: g.r, data });
    if (PROP_LIGHTS[g.id]) game.world.collectLights();
    if (g.id === 'tableau') this.toile = -1;
    this.cacheP = null;
    play.cool = 0.3;
    sound.place && sound.place();
    puffAt(g.x, g.y + (g.mur ? 0.3 : 0.05), g.z, [150, 130, 100], 5, 1, false);
    this.premiereFois(q);
    return true;
  },
  // quelques pensées, la première fois
  premiereFois(q) {
    const V = this.S().vus, k = this.dans(q.x, q.y + 0.3, q.z, 0), dire = (cle, t, d) => { if (V[cle]) return; V[cle] = farm.s.day; setTimeout(() => { if (!game.dying && !ui.panel) ui.subtitle('', t, d || 4); }, 500); };
    if (k && LOC_MAISONS[k] && !V['maison:' + k]) { dire('maison:' + k, '(Le premier meuble à vous, ici. La pièce a l’air moins vide. Un peu moins.)'); return; }
    if (q.id === 'horloge_comtoise') dire('horloge', '(Vous poussez le balancier du bout du doigt. Tic. Tac. La maison a un cœur, maintenant.)', 4.5);
    else if (q.id === 'lit' || q.id === 'lit_clos') dire('lit', '(Vous tapotez l’oreiller. Il sent le propre, et un peu le grenier.)');
    else if (q.id === 'tableau' && q.data && q.data.v === 1) dire('portrait', '(Le monsieur du portrait vous regarde faire. Il a l’air d’attendre quelque chose.)', 4.5);
    else if (q.id === 'tableau' && q.data && q.data.v === 3) dire('lac', '(Il y a quelqu’un sur la rive, dans le tableau. Vous ne l’aviez pas remarqué, au grenier.)', 4.5);
  },

  // ------------------------------------------------------------------ vos meubles : E pour s'en servir, maintenir E (ou E) pour les reprendre
  aMoi(q) { const w = game.world, i = w.props.indexOf(q); return i >= farm.genProps && !!MEUBLES[q.id] && farm.s.props.some((p) => p.id === q.id && Math.abs(p.x - q.x) < 0.01 && Math.abs(p.z - q.z) < 0.01); },
  plein(q) { const I = q.data && q.data.items; return !!(I && Object.keys(I).some((k) => I[k] > 0)); },
  etiquette(q) {
    const M = MEUBLES[q.id] || {}, le = M.le || 'le meuble', pr = M.pr || 'le', rep = `maintenir E : ${pr === 'la' ? 'la' : 'le'} reprendre`;
    if (M.lit) return `Dormir ici · ${rep}`;
    if (M.range) return `Ouvrir ${le} · ${rep}`;
    if (M.lampe) return `${q.data && q.data.lit ? 'Éteindre' : 'Allumer'} ${q.id === 'gueridon' ? 'la lampe' : le} · ${rep}`;
    if (M.heure) return `Regarder l’heure · ${rep}`;
    return 'Reprendre ' + le;
  },
  // E (appui court)
  utiliser(q) {
    const M = MEUBLES[q.id] || {};
    if (M.lit) { if (typeof sommeil !== 'undefined' && sommeil.litE) sommeil.litE(q); return; }
    if (M.range) {
      const items = (q.data && q.data.items) || {};
      farm.setPropData(q, { items });
      sound.lootOpen && sound.lootOpen();
      ui.openStore(M.nom || itemName(q.id), items, 'chest');
      return;
    }
    if (M.lampe) {
      const on = !(q.data && q.data.lit);
      farm.setPropData(q, { lit: on });
      game.world.collectLights(); this.cacheP = null;
      sound.click && sound.click();
      if (on && q.id === 'chandelier') sound.candle && sound.candle();
      return;
    }
    if (M.heure) { const h = game.world.time * 24; ui.subtitle('', `(Il est ${Math.floor(h)} h ${String(Math.floor((h % 1) * 60)).padStart(2, '0')}.)`, 2.5); return; }
    this.reprendre(q);
  },
  reprendre(q) {
    if (!q || !this.aMoi(q) || !game.world.live(q)) return false;
    const M = MEUBLES[q.id] || {};
    if (this.plein(q)) { sound.impact && sound.impact('wood'); this.pense('plein', `(Il faudrait d’abord ${M.pr === 'la' ? 'la' : 'le'} vider.)`, 2.5); return false; }
    const id = q.id, pos = [q.x, q.y + 0.4, q.z];
    if (typeof objets !== 'undefined' && objets.retirer) objets.retirer(q);
    else { farm.removeProp(q); q.gone = true; if (PROP_LIGHTS[q.id]) game.world.collectLights(); }
    if (PROP_LIGHTS[id]) game.world.collectLights();
    if (game.hiProp === q) game.hiProp = null;
    this.cacheP = null;
    farm.give(id, 1); play.flyer(id, pos, 1);
    sound.remove && sound.remove();
    play.select(id); // en main : on le repose ailleurs
    play.cool = 0.35;
    return true;
  },
  // la cible de E : vos meubles, sous le regard, dans la même pièce que vous
  cible(eye, f, cand) {
    const w = game.world, n0 = farm.genProps, ici = this.bldJoueur();
    let best = null, bt = 2.7;
    for (let i = n0; i < w.props.length; i++) {
      const q = w.props[i];
      if (!MEUBLES[q.id] || !w.live(q)) continue;
      if (Math.abs(q.x - eye[0]) > 3.6 || Math.abs(q.z - eye[2]) > 3.6 || Math.abs(q.y - eye[1]) > 3.5) continue;
      let t = null;
      try {
        const fm = objets.rayForme(q, eye, f);
        if (fm) t = fm.t;
        else if (fm === undefined) { const B = objets.boite(q, true, true), h = B && w.raycastBlock(B, eye, f); if (h) t = h.t; }
      } catch (e) { t = null; }
      if (t === null || t >= bt) continue;
      if ((this.dans(q.x, q.y + 0.3, q.z, 0) || null) !== ici) continue;
      if (!this.aMoi(q)) continue;
      best = q; bt = t;
    }
    if (!best) return;
    const q = best;
    cand({ kind: 'hook', lit: q, meuble: q, use: () => meubles.utiliser(q), f2lab: this.etiquette(q) }, Math.max(0.12, bt * 0.5));
  },
  // maintenir E : reprendre (ce qui sert à autre chose)
  maintien(playing) {
    if (!playing || !game.holdE || game.holdDone || game.holdE < 0.55 || !input.down('KeyE')) return;
    const t = game.target;
    if (!t || t.kind !== 'hook' || !t.meuble) return;
    game.holdDone = true;
    this.reprendre(t.meuble);
  },

  // ------------------------------------------------------------------ les meubles d'une maison : rendus, saisis
  meublesDans(k) {
    const w = game.world, out = [];
    for (let i = farm.genProps; i < w.props.length; i++) {
      const q = w.props[i];
      if (!w.live(q) || !ITEMS[q.id]) continue;
      if (this.dans(q.x, q.y + 0.3, q.z, 0) !== k) continue;
      if (!farm.s.props.some((p) => p.id === q.id && Math.abs(p.x - q.x) < 0.01 && Math.abs(p.z - q.z) < 0.01)) continue;
      out.push(q);
    }
    return out;
  },
  // retire les meubles de la maison k : { objet: n } (les meubles et ce qu'ils contenaient)
  viderMaison(k) {
    const O = {};
    for (const q of this.meublesDans(k)) {
      const id = q.id === 'citrouille' ? 'citrouille_sculptee' : q.id;
      const I = q.data && q.data.items;
      if (I) for (const it in I) if (I[it] > 0 && ITEMS[it]) O[it] = (O[it] || 0) + I[it];
      if (typeof objets !== 'undefined' && objets.retirer) objets.retirer(q); else { farm.removeProp(q); q.gone = true; }
      if (ITEMS[id]) O[id] = (O[id] || 0) + 1;
    }
    if (Object.keys(O).length) { this.cacheP = null; game.world.collectLights(); farm.dirtyProps = true; }
    return O;
  },
  noms(O) { return Object.keys(O).map((id) => (O[id] > 1 ? `${itemName(id).toLowerCase()} (${O[id]})` : itemName(id).toLowerCase())); },

  // ------------------------------------------------------------------ acheter, revendre
  acheter(k) {
    const M = LOC_MAISONS[k], s = farm.s;
    if (!M || !locations.existe(k)) return 'absente';
    if (this.proprio(k)) return 'deja';
    const L = locations.S(), Z = L.saisies[k], B = L.baux[k], prix = this.prixAchat(k);
    if (Z && Z.dette > 0) return 'dette';
    if (B && B.du > 0) return 'loyer';
    if (!farm.pay(prix)) return 'pauvre';
    const coffre = B && B.coffre ? Object.assign({}, B.coffre) : {};
    if (B) delete L.baux[k];
    this.S().maisons[k] = { jour: s.day, prix, coffre };
    if (ITEMS[M.cle] && !farm.count(M.cle)) farm.give(M.cle, 1);
    sound.coin && sound.coin(); setTimeout(() => sound.lock && sound.lock(false), 200);
    farm.mail(locations.signataire(), 'Acte de vente — ' + M.court,
      `Par-devant le maire de ${farm.names.ville}, la commune vend à ${s.prenom || 'l’occupant de la vieille ferme'}, qui accepte, ${M.nom}, ${M.rue}, avec ses murs, son coffre et sa clé, pour la somme de ${prix} pièces, payée comptant ce jour.\n\n` +
      `La maison est à l’acquéreur, pour lui et les siens, sans loyer ni terme. La commune n’y entrera plus sans y être invitée.\n\nFait à la mairie, le ${locations.jourNom(s.day)}.`);
    farm.dirtyProps = true;
    locations.appliquerPortes();
    return 'ok';
  },
  revendre(k) {
    const M = LOC_MAISONS[k], P = this.maison(k), s = farm.s;
    if (!M || !P) return 'rien';
    const O = this.viderMaison(k);
    for (const id in P.coffre || {}) if (ITEMS[id] && P.coffre[id] > 0) O[id] = (O[id] || 0) + P.coffre[id];
    for (const id in O) farm.give(id, O[id]);
    delete this.S().maisons[k];
    if (farm.count(M.cle)) farm.take(M.cle, farm.count(M.cle));
    const p = this.prixRevente(k);
    farm.earn(p);
    sound.coin && sound.coin();
    farm.mail(locations.signataire(), 'Rétrocession — ' + M.court, `La commune reprend ${M.nom}, cédée par ${s.prenom || 'son propriétaire'}, pour la somme de ${p} pièces, versée ce jour. Les clés ont été rendues.\n\nLa maison redevient libre, à louer ou à vendre.`);
    farm.dirtyProps = true;
    locations.appliquerPortes(true);
    return this.noms(O);
  },

  // ------------------------------------------------------------------ le garde-meuble de la commune (chez le maire)
  ouvrirGardeMeuble(n) {
    const vn = Object.create(n);
    vn.d = Object.assign(Object.create(n.d), { shop: MEUBLES_GARDE });
    ui.openShop(vn);
  },

  // ------------------------------------------------------------------ l'horloge comtoise sonne les heures (celle qu'on entend)
  sonner() {
    const h = Math.floor(npcs.hour());
    if (this.chimeH === null) { this.chimeH = h; return; }
    if (h === this.chimeH) return;
    this.chimeH = h;
    if (game.sleeping || game.dying || !this.actif()) return;
    const w = game.world, p = game.player.pos, ici = this.bldJoueur();
    let pres = null;
    for (let i = farm.genProps; i < w.props.length; i++) {
      const q = w.props[i];
      if (q.id !== 'horloge_comtoise' || !w.live(q)) continue;
      const d = Math.hypot(q.x - p[0], q.z - p[2]);
      if (d > 16 || (d > 7 && this.dans(q.x, q.y + 0.3, q.z, 0) !== ici)) continue;
      pres = q; break;
    }
    if (!pres) return;
    const n = h % 12 || 12, k = ici && this.dans(pres.x, pres.y + 0.3, pres.z, 0) === ici ? 1 : 0.45;
    for (let i = 0; i < n; i++) setTimeout(() => { if (!game.dying && !game.sleeping) sound.comtoise && sound.comtoise(k); }, 400 + i * 1500);
  },
};

// ============================================================================
//  LES MAISONS DE LA COMMUNE : à vendre
// ============================================================================
{
  // propriétaire : la clé, le lit, le coffre, la porte qui s'ouvre (tout ce que connaissent les autres modules du locataire)
  const _loc = locations.locataire.bind(locations);
  locations.locataire = function (k) { return _loc(k) || meubles.proprio(k); };
  // on ne loue pas sa propre maison
  const _louer = locations.louer.bind(locations);
  locations.louer = function (k) { if (meubles.proprio(k)) return 'deja'; return _louer(k); };
  // rendre les clés : les meubles reviennent dans la sacoche, avec le coffre
  const _rendre = locations.rendre.bind(locations);
  locations.rendre = function (k) {
    const O = locations.bail(k) ? meubles.viderMaison(k) : {};
    for (const id in O) farm.give(id, O[id]);
    const r = _rendre(k), noms = meubles.noms(O);
    if (!noms.length) return r;
    return (Array.isArray(r) ? r : []).concat(noms);
  };
  // l'expulsion : les meubles sont saisis avec le coffre
  const _exp = locations.expulser.bind(locations);
  locations.expulser = function (k) {
    const avait = !!locations.bail(k), O = avait ? meubles.viderMaison(k) : {};
    _exp(k);
    const Z = locations.S().saisies[k], M = LOC_MAISONS[k];
    if (Z && Object.keys(O).length) {
      Z.objets = Z.objets || {};
      for (const id in O) Z.objets[id] = (Z.objets[id] || 0) + O[id];
      if (M) farm.mail(locations.signataire(), 'Inventaire — ' + M.court, `Les meubles que vous aviez installés dans ${M.nom} ont été démontés et portés à la mairie, avec le reste : ${meubles.noms(O).join(', ')}.\n\nIls vous seront rendus contre le paiement de la dette.`);
    }
  };
  // le coffre cerclé de fer : au propriétaire, le sien
  const _cl = HOOKS.propPre.coffre_loc;
  HOOKS.propPre.coffre_loc = (q) => {
    const k = q.data && q.data.loc, P = k && meubles.maison(k);
    if (!P) return _cl ? _cl(q) : false;
    P.coffre = P.coffre || {};
    sound.lootOpen && sound.lootOpen();
    ui.openStore('Coffre — ' + LOC_MAISONS[k].court, P.coffre, 'chest');
    return true;
  };
  // l'écriteau : « vendue » en travers, pour une maison achetée
  const _ecr = PROP_MODELS.ecriteau_louer;
  PROP_MODELS.ecriteau_louer = function (E, o, t) {
    const k = o.data && o.data.loc;
    if (!k || typeof meubles === 'undefined' || !meubles.proprio(k)) return _ecr(E, o, t);
    E.bx(0, 0, 0, 0.09, 1.72, 0.09, WHITE, TL.darkwood); E.bx(0, 1.6, 0.18, 0.06, 0.06, 0.42, WHITE, TL.darkwood);
    E.bx(-0.2, 1.1, 0.34, 0.012, 0.5, 0.012, rgbf('#555'), TL.iron); E.bx(0.2, 1.1, 0.34, 0.012, 0.5, 0.012, rgbf('#555'), TL.iron);
    E.bx(0, 0.86, 0.34, 0.62, 0.34, 0.035, [1.12, 1.02, 0.94], tx(TL.wood, TL.sign));
    E.box(0, 1.03, 0.36, 0.66, 0.08, 0.012, rgbf('#2e4a36'), TL.plain, 0, 0, -0.28);
  };
  // l'écriteau : acheter (maison libre ou louée), ou, à qui l'a achetée, sa maison
  const _ecriteau = locations.ecriteau.bind(locations);
  locations.ecriteau = function (k) {
    if (meubles.proprio(k)) return meubles.ecriteauProprio(k);
    const M = LOC_MAISONS[k];
    if (!M || !locations.existe(k)) return _ecriteau(k);
    const prix = meubles.prixAchat(k), _ch = ui.choice;
    ui.choice = function (titre, desc, opts) {
      try {
        const i = opts.findIndex((o) => /^(Pas maintenant|Refermer)$/.test(o.label));
        opts.splice(i >= 0 ? i : opts.length, 0, { label: `Acheter la maison (${prix} pièces)`, fn: () => meubles.confirmerAchat(k) });
        desc = (desc || '') + ` La commune la vend aussi : ${prix} pièces, comptant.`;
      } catch (e) { console.error(e); }
      return _ch.call(this, titre, desc, opts);
    };
    try { return _ecriteau(k); } finally { ui.choice = _ch; }
  };
}
Object.assign(meubles, {
  confirmerAchat(k) {
    const M = LOC_MAISONS[k], prix = this.prixAchat(k), B = locations.bail(k);
    ui.choice('Acheter ' + M.nom, `${this.titre(k)}, ${prix} pièces, comptant : la somme dans la fente de l’écriteau, la commune passe la relever et vous envoie l’acte par la poste. La maison sera à vous pour toujours, sans loyer ni terme.${B ? ' Le bail en cours prend fin ; le coffre reste où il est.' : ''}`, [
      { label: `Acheter pour ${prix} pièces`, fn: () => {
        ui.close(true);
        const r = this.acheter(k), L = locations.S();
        if (r === 'pauvre') ui.subtitle('', `(Vous n’avez pas ${prix} pièces.)`, 2.5);
        else if (r === 'loyer') ui.subtitle('', `(Sous l’écriteau, un papier à votre nom : « Loyer dû : ${locations.bail(k).du} pièces. Réglez d’abord. »)`, 4);
        else if (r === 'dette') ui.subtitle('', `(Sous l’écriteau, un papier à votre nom : « Dette de ${L.saisies[k].dette} pièces. Voir le maire. »)`, 4);
        else if (r === 'ok') ui.subtitle('', `(Les pièces tombent dans la fente, une à une ; c’est long. ${this.titre(k)} est à vous, pour toujours.)`, 5);
      } },
      { label: 'Pas maintenant', fn: () => ui.close() },
    ]);
  },
  ecriteauProprio(k) {
    const P = this.maison(k), n = this.meublesDans(k).length, pr = this.prixRevente(k);
    ui.choice(`${this.titre(k)} — à vous`, `Vous en êtes propriétaire depuis le ${locations.jourNom(P.jour)}. La clé ouvre la porte, et personne d’autre n’en a le double.${n ? ` Vous y avez installé ${n > 1 ? n + ' meubles' : 'un meuble'}.` : ''}`, [
      { label: `Revendre la maison à la commune (${pr} pièces)`, fn: () => this.confirmerRevente(k) },
      { label: 'Refermer', fn: () => ui.close() },
    ]);
  },
  confirmerRevente(k) {
    const pr = this.prixRevente(k);
    ui.choice('Revendre ' + LOC_MAISONS[k].nom, `La commune la reprendrait pour ${pr} pièces, la moitié de ce que vous l’avez payée. Vos meubles et ce qu’il y a dans le coffre reviendront dans votre sacoche ; la clé retournera à la mairie.`, [
      { label: `Revendre pour ${pr} pièces`, fn: () => { ui.close(true); const r = this.revendre(k); if (Array.isArray(r)) ui.subtitle('', r.length ? `(Vous reprenez vos affaires : ${r.join(', ')}. La clé retourne à la mairie.)` : '(La clé retourne à la mairie.)', 5); } },
      { label: 'Garder la maison', fn: () => ui.close() },
    ]);
  },
});
// le maire : « Les maisons de la commune » (à louer, à vendre), « Le garde-meuble de la commune »
Object.assign(locations, {
  texteMaire() {
    const L = this.S(), lignes = [], ks = Object.keys(LOC_MAISONS).filter((k) => this.existe(k));
    if (ks.length && ks.every((k) => meubles.proprio(k))) return 'Les maisons de la commune sont toutes à vous. Je n’ai plus rien à louer, ni à vendre. Vous êtes un peu la commune, maintenant.';
    for (const k of ks) {
      const M = LOC_MAISONS[k], B = L.baux[k], Z = L.saisies[k], P = meubles.maison(k), T = meubles.titre(k), prix = meubles.prixAchat(k);
      if (P) lignes.push(`${T} : à vous, depuis le ${this.jourNom(P.jour)}.`);
      else if (B) lignes.push(`${T} : louée par vous${B.du > 0 ? `, ${B.du} pièces dues` : `, réglée jusqu’au ${this.jourNom(B.echeance)}`} ; à vendre, ${prix} pièces.`);
      else lignes.push(`${T}, ${M.rue} : libre, ${M.loyer} pièces la semaine, ou ${prix} pièces pour l’acheter.${Z ? ` (Vos affaires y sont gardées : ${Z.dette} pièces de dette.)` : ''}`);
    }
    return 'La commune loue ses maisons à la semaine de douze jours, payée d’avance ; elle les vend aussi, comptant, à qui veut s’établir. ' + lignes.join(' ');
  },
  optionsMaire() {
    const L = this.S(), o = [];
    for (const k in LOC_MAISONS) {
      if (!this.existe(k)) continue;
      const M = LOC_MAISONS[k], B = L.baux[k], Z = L.saisies[k];
      if (meubles.proprio(k)) { o.push({ label: `Revendre ${M.nom} à la commune (${meubles.prixRevente(k)} pièces)`, act: 'meu:revendre:' + k }); continue; }
      if (!B) o.push({ label: `Louer ${M.nom} (${M.loyer} pièces)`, act: 'loc:louer:' + k });
      else {
        o.push({ label: B.du > 0 ? `Payer le loyer de ${M.nom} (${B.du} pièces)` : `Payer une semaine d’avance pour ${M.nom} (${M.loyer} pièces)`, act: 'loc:payer:' + k });
        o.push({ label: `Rendre les clés de ${M.nom}`, act: 'loc:rendre:' + k });
      }
      o.push({ label: `Acheter ${M.nom} (${meubles.prixAchat(k)} pièces)`, act: 'meu:acheter:' + k });
      if (Z) o.push({ label: `Reprendre mes affaires de ${M.nom} (${Z.dette} pièces)`, act: 'loc:saisie:' + k });
    }
    o.push({ label: 'Parlons d’autre chose', act: 'chat' });
    return o;
  },
});
{
  const _opts = talk.options.bind(talk);
  talk.options = function () {
    const opts = _opts();
    try {
      const n = this.n;
      if (n && n.d.id === 'maire' && farm.s) {
        const l = opts.find((o) => o.act === 'loc:liste');
        if (l) l.label = 'Les maisons de la commune';
        const i = opts.findIndex((o) => o.act === 'bye');
        opts.splice(i >= 0 ? i : opts.length, 0, { label: 'Le garde-meuble de la commune', act: 'meu:garde' });
      }
    } catch (e) { console.error(e); }
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (typeof act !== 'string' || !act.startsWith('meu:') || !this.n) return _choose(act);
    const [, cmd, k] = act.split(':'), n = this.n, M = LOC_MAISONS[k], L = locations.S();
    const liste = () => locations.optionsMaire();
    if (cmd === 'garde') {
      if (!meubles.gardeDit) {
        meubles.gardeDit = true;
        npcs.say(n, 'Le grenier de la mairie. Des lits, des armoires, une horloge… Des successions que personne n’a réclamées. On ne sait pas toujours à qui c’était. On ne demande pas.', 5);
      }
      meubles.ouvrirGardeMeuble(n);
      return 'keep';
    }
    if (!M) return this.view('…', liste());
    const T = meubles.titre(k);
    if (cmd === 'acheter') {
      const prix = meubles.prixAchat(k), B = L.baux[k];
      return this.view(`${T} ? ${prix} pièces, comptant. C’est le prix que le conseil a voté, et le conseil, c’est moi. Les murs, la clé, le coffre : tout sera à vous, pour toujours. Enfin, pour aussi longtemps que durent les choses, ici.${B ? ' Le bail prendra fin, bien sûr.' : ''}`,
        [{ label: `Acheter pour ${prix} pièces`, act: 'meu:achat:' + k }, { label: 'Non, pas maintenant', act: 'loc:liste' }]);
    }
    if (cmd === 'achat') {
      const r = meubles.acheter(k);
      if (r === 'pauvre') return this.view(`${meubles.prixAchat(k)} pièces, et pas une de moins. Revenez quand votre bourse aura la taille de vos ambitions.`, liste());
      if (r === 'loyer') return this.view(`Réglez d’abord le loyer en retard : ${L.baux[k].du} pièces. On n’achète pas une maison avec des dettes dessus.`, liste());
      if (r === 'dette') return this.view(`Vous nous devez encore ${L.saisies[k].dette} pièces pour ${M.nom}. Réglez d’abord, on verra ensuite.`, liste());
      if (r !== 'ok') return this.view(locations.texteMaire(), liste());
      return this.view(`Signé. Voici la clé, et l’acte partira par la poste. ${T} est à vous : plus de loyer, plus de rappels, plus de serrure changée. Je vous envie presque. Presque.`, liste());
    }
    if (cmd === 'revendre') {
      const pr = meubles.prixRevente(k);
      return this.view(`La commune vous la reprendrait pour ${pr} pièces. C’est la moitié, je sais. Les murs ne valent plus ce qu’ils valaient quand vous les avez achetés : vous y avez vécu.`,
        [{ label: `Revendre pour ${pr} pièces`, act: 'meu:revente:' + k }, { label: 'Je la garde', act: 'loc:liste' }]);
    }
    if (cmd === 'revente') {
      const r = meubles.revendre(k);
      if (!Array.isArray(r)) return this.view(locations.texteMaire(), liste());
      return this.view(`C’est fait. ${T} revient à la commune.${r.length ? ' Vos affaires vous ont été rendues : le coffre, et les meubles que vous y aviez mis.' : ''} Les murs, eux, gardent le reste.`, liste());
    }
    return this.view(locations.texteMaire(), liste());
  };
}

// ============================================================================
//  BRANCHEMENTS
// ============================================================================
// la pose : chez soi, le fantôme des meubles ; le clic pose
{
  const _ug = play.updateGhost.bind(play);
  play.updateGhost = function (eye, f) {
    _ug(eye, f);
    try { if (farm.s) meubles.majFantome(eye, f); } catch (e) { console.error('meubles', e); }
  };
  const _pl = play.place.bind(play);
  play.place = function (held) {
    let fait = false;
    try { fait = meubles.pose(held); } catch (e) { console.error('meubles', e); }
    if (fait) return;
    const g = this.ghost;
    if (g && !g.ok && g.why && !held && meubles.RAISONS[g.why]) { sound.click && sound.click(); meubles.pense('pose', meubles.RAISONS[g.why], 2.4); return; }
    return _pl(held);
  };
  // le marteau ne démonte pas un rangement plein
  const _dm = play.dismantle.bind(play);
  play.dismantle = function (q) {
    if (q && MEUBLES[q.id] && meubles.plein(q)) { sound.impact && sound.impact('wood'); meubles.pense('plein', `(Il faudrait d’abord ${MEUBLES[q.id].pr === 'la' ? 'la' : 'le'} vider.)`, 2.5); return; }
    const r = _dm(q);
    meubles.cacheP = null;
    return r;
  };
}
HOOKS.target.push((eye, f, cand) => { if (meubles.actif()) { try { meubles.cible(eye, f, cand); } catch (e) { console.error('meubles.cible', e); } } });
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || game.kind !== 'farm') return;
  try { meubles.maintien(playing); meubles.sonner(); } catch (e) { console.error('meubles', e); }
});
HOOKS.load.push(() => {
  meubles.cacheP = null; meubles.toile = -1; meubles.chimeH = null; meubles.gardeDit = false; meubles.bldJ = null; meubles.bldJT = 0;
  if (!farm.s) return;
  meubles.S();
  try { locations.appliquerPortes(); } catch (e) { /* rien */ }
  farm.dirtyProps = true;
});
