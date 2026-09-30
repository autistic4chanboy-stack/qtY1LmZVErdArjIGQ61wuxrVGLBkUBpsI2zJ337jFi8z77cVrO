// ============================================================================
//  LA NATURE (agent C2, huitième vague) — données : 05-zzzz-nature.js ;
//  sprites et icônes : 03-zzzz-sprites-nature.js
//  - CHAQUE PLANTE SON OBJET ET SON EFFET : ce qu'on mange cru ou cuit a sa
//    règle (ALIMENTS_EFFETS, 11-zzz61-nourriture.js) ; quelques effets
//    nouveaux passent par les « états » de l'alchimie (BUFF) sans rien dire.
//    Les herbes des plaies (plantain, achillée…) arrêtent le sang, même le
//    ventre plein.
//  - LES GROUPES « AU CHOIX » (fleur, baies, bois) contiennent l'objet d'avant :
//    farm.take ne tourne pas en rond ; l'alambic reconnaît ses recettes.
//  État : farm.s.nature2 (voir nature2.S)
//  API : nature2
// ============================================================================

// ---------------------------------------------------------------- prendre dans un groupe qui se contient lui-même
// (farm.take d'origine rappelle take(membre) : pour le membre qui porte le nom du groupe, on puise directement)
{
  const _take = farm.take;
  farm.take = function (id, n = 1) {
    const G = ITEM_GROUPS[id];
    if (!G || !G.includes(id)) return _take.call(this, id, n);
    let left = n;
    for (const k of G) {
      const c = Math.min(left, this.s.inv[k] || 0);
      if (!c) continue;
      if (k === id) { this.s.inv[k] -= c; if (this.s.inv[k] <= 0) { delete this.s.inv[k]; if (this.s.hand === k) this.s.hand = 'main'; } }
      else this.take(k, c);
      left -= c;
      if (!left) break;
    }
    return left === 0;
  };
}

// ---------------------------------------------------------------- l'alambic : une fleur, une baie, des bûches « au choix »
// (les recettes de l'alambic nomment « fleur » ou « champignon » : n'importe quelle fleur du groupe fait l'affaire)
if (typeof alchemy !== 'undefined') {
  const _match = alchemy.match.bind(alchemy);
  alchemy.match = function (ids) {
    const r = _match(ids);
    if (r) return r;
    const L = ids.filter(Boolean);
    const groupe = (id) => Object.keys(ITEM_GROUPS).filter((g) => ITEMS[g] && ITEM_GROUPS[g].includes(id) && g !== id);
    for (const pid in POTIONS) {
      const need = POTIONS[pid].need;
      if (!need || need.length !== L.length) continue;
      const reste = need.slice();
      let ok = true;
      for (const id of L) {
        let i = reste.indexOf(id);
        if (i < 0) for (const g of groupe(id)) { i = reste.indexOf(g); if (i >= 0) break; }
        if (i < 0) { ok = false; break; }
        reste.splice(i, 1);
      }
      if (ok) return pid;
    }
    return null;
  };
}

// ---------------------------------------------------------------- effets nouveaux (sans phrase : on sent, on devine)
Object.assign(EFFETS, {
  yeux: { dur: [60, 150], buff: 'soleil' },
  chaleur: { dur: [90, 200], buff: 'chaleur', debut: ['(Une chaleur au creux du ventre.)'] },
  voyance: { dur: [60, 150], buff: 'clairvoyance' },
  reve: { dur: [150, 300], buff: 'songe' },
  charme: { dur: [90, 200], buff: 'charme' },
  sangfroid: { dur: [60, 150], buff: 'sang_froid' },
  leger: { dur: [45, 110], buff: 'legerete' },
  chanceux: { dur: [120, 260], buff: 'chance' },
  discret: { dur: [40, 100], buff: 'silence' },
  // les herbes des plaies : le sang s'arrête (ou ralentit)
  sang_arrete: { instant: true, start(A) { const C = corps.C(); if (C.saigne > 0) C.saigne = A.k >= 2 ? 0 : C.saigne * 0.35; } },
  // les os : une jambe cassée se remet plus vite (comme une attelle)
  os: { instant: true, start() { if (corps.jambeCassee()) corps.soignerJambe(false); } },
});

// ---------------------------------------------------------------- ce que fait chaque plante, crue ou cuite
// [effet, probabilité, délai min (s), délai max (s), intensité, durée min (s), durée max (s)] ; c : cause de la mort
Object.assign(ALIMENTS_EFFETS, {
  // ---- les plantes d'avant qui n'avaient pas encore d'effet
  valeriane: { r: [['somnolence', 0.7, 30, 90, 1, 90, 180], ['calme', 0.6, 10, 40], ['endormir', 0.1, 120, 240]] },
  serpolet: { r: [['soin', 0.2, 5, 20], ['chaleur', 0.25, 10, 30]] },
  genepi: { r: [['chaleur', 0.7, 5, 20, 1, 120, 240], ['vigueur', 0.25, 10, 30]] },
  lichen: { r: [['nausee', 0.12, 30, 90]] },
  rossolis: { r: [['remede', 0.5, 5, 20], ['calme', 0.2, 10, 30]] },
  prele: { r: [['os', 0.35, 5, 20]] },
  girolle: { r: [['vigueur', 0.1, 20, 60]] },
  trompette: { r: [['calme', 0.15, 20, 60]] },
  lycopode: { c: 'le lycopode', r: [['nausee', 0.35, 20, 80], ['vomir', 0.15, 40, 120]] },
  perce_neige: { c: 'le bulbe de perce-neige', r: [['nausee', 0.45, 20, 90], ['vomir', 0.25, 40, 120]] },
  linaigrette: { r: [['leger', 0.35, 10, 30, 1, 60, 120]] },
  edelweiss: { r: [['sangfroid', 0.45, 5, 20, 1, 90, 180]] },
  orchidee: { r: [['charme', 0.5, 10, 30, 1, 120, 240]] },
  pissenlit: { r: [['soin', 0.15, 10, 30]] },
  mousse_nains: { r: [['vision_nuit', 0.7, 10, 40, 1, 150, 260]] },
  asphodele: { r: [['voyance', 0.35, 10, 40, 1, 90, 180], ['calme', 0.3, 10, 40]] },
  fleur_temple: { r: [['voyance', 0.6, 5, 20, 1, 150, 260], ['calme', 0.6, 5, 30, 2]] },
  trefle: { r: [['chanceux', 0.85, 0, 10, 1, 180, 300]] },
  noix: { r: [['force', 0.06, 20, 60]] },
  pomme: { r: [['soin', 0.05, 10, 30]] },
  poire: { r: [['calme', 0.05, 10, 30]] },
  lavande: { r: [['calme', 0.5, 10, 40], ['somnolence', 0.15, 30, 90]] },
  tournesol: { r: [['vigueur', 0.15, 10, 40]] },
  // ---- les fleurs d'avant, chacune la sienne
  coquelicot: { r: [['somnolence', 0.4, 20, 90, 1, 60, 150], ['calme', 0.35, 10, 40]] },
  marguerite: { r: [['soin', 0.25, 5, 20]] },
  bleuet: { r: [['yeux', 0.6, 5, 20, 1, 90, 200]] },
  bruyere: { r: [['calme', 0.2, 10, 40]] },
  jacinthe: { c: 'la jacinthe', r: [['nausee', 0.7, 20, 90], ['vomir', 0.4, 40, 120], ['coliques', 0.3, 60, 180]] },
  lupin: { c: 'des graines de lupin', r: [['nausee', 0.4, 20, 90], ['coliques', 0.2, 60, 180]] },
  lupin_blanc: { c: 'des graines de lupin', r: [['nausee', 0.3, 20, 90]] },
  iris: { c: 'l’iris', r: [['coliques', 0.8, 30, 120, 2], ['vomir', 0.5, 40, 150]] },
  bouton_or: { c: 'des boutons d’or', r: [['pique', 0.95, 0, 0], ['nausee', 0.4, 20, 90]] },
  primevere: { r: [['calme', 0.35, 10, 40], ['somnolence', 0.12, 30, 90]] },
  violette: { r: [['soin', 0.25, 5, 20], ['remede', 0.2, 10, 30]] },
  trefle_fleur: { r: [['vigueur', 0.1, 10, 40]] },
  campanule: { r: [['calme', 0.1, 10, 40]] },
  chardon: { r: [['pique', 0.4, 0, 0]] },
  mauve: { r: [['remede', 0.5, 5, 20], ['soin', 0.2, 10, 30]] },
  rhododendron: { c: 'le rhododendron', r: [['nausee', 0.8, 10, 60, 2], ['vomir', 0.5, 30, 90], ['paralysie', 0.35, 20, 90, 1, 5, 10], ['poison', 0.35, 30, 120, 1], ['vue_trouble', 0.3, 20, 60]] },
  myosotis: { r: [['calme', 0.2, 10, 40], ['voyance', 0.08, 20, 60]] },
  jonquille: { c: 'le bulbe de jonquille', r: [['vomir', 0.6, 20, 90], ['nausee', 0.6, 10, 60], ['coliques', 0.3, 60, 180]] },
  // ---- buissons, fougères, roseaux, nénuphars, souches, baies
  prunelle: { r: [['coliques', 0.15, 60, 180]] },
  fougere: { c: 'la fougère', r: [['coliques', 0.3, 60, 180], ['nausee', 0.2, 30, 90], ['discret', 0.05, 10, 30, 1, 60, 120]] },
  roseau: { r: [['vigueur', 0.05, 10, 40]] },
  nenuphar: { r: [['somnolence', 0.35, 20, 90], ['calme', 0.45, 10, 40]] },
  armillaire: { c: 'des armillaires crus', r: [['coliques', 0.5, 60, 180], ['nausee', 0.4, 30, 120]] },
  mure: { r: [['vigueur', 0.08, 10, 40]] },
  fraise_bois: { r: [['soin', 0.1, 10, 30], ['vigueur', 0.08, 10, 40]] },
  airelle: { r: [['vigueur', 0.1, 10, 40]] },
  // ---- les plats
  soupe_orties: { r: [['vigueur', 0.35, 10, 40, 1, 120, 220]] },
  omelette_champignons: { r: [['force', 0.15, 20, 60], ['calme', 0.2, 10, 40]] },
  tarte_baies: { r: [['sprint', 0.15, 10, 40]] },
});
// le trèfle à quatre feuilles se mange (pour la chance) ; les herbes des plaies arrêtent le sang
if (ITEMS.trefle && !ITEMS.trefle.heal && !ITEMS.trefle.food) ITEMS.trefle.heal = 1;
// toute plante cueillie se porte à la bouche (sinon, pas d'effet possible) : une bouchée, au moins
function natComestibles() {
  for (const t of OBJ_TYPES) {
    if (!['Fleurs', 'Végétation', 'Champignons'].includes(t.cat)) continue;
    const H = HARVEST[t.id], d = H && H.drop && H.drop[0] && H.drop[0][0], it = d && ITEMS[d];
    if (!it || d === 'fibre' || d === 'foin' || it.cat === 'materiau' || it.food || it.heal) continue;
    it.food = 1;
  }
}
natComestibles();
for (const id of ['plantain', 'achillee', 'sphaigne', 'usnee']) if (ITEMS[id]) ITEMS[id].panse = id === 'plantain' ? 1 : 2;
(ALIMENTS_EFFETS.achillee = ALIMENTS_EFFETS.achillee || { r: [] }).r.push(['sang_arrete', 0.95, 0, 0, 2]);

// ---------------------------------------------------------------- les plats (cuits)
defItem('soupe_orties', 'Soupe d’orties', 'nourriture', 7, ['bol', '#4a7a30'], { food: 28, heal: 10, desc: 'Verte, épaisse, avec une pomme de terre. Les orties ne piquent plus.' });
defItem('omelette_champignons', 'Omelette aux champignons', 'nourriture', 18, ['pain', '#e8c860'], { food: 32, heal: 12, desc: 'Deux œufs, une poignée de champignons des bois, et la poêle bien chaude.' });
defItem('tarte_baies', 'Tarte aux baies', 'nourriture', 14, ['tarte', '#4a2a5a'], { food: 36, heal: 12, desc: 'Une pâte, des baies des bois, et le four. Les dents en restent bleues.' });
RECIPES.push(
  { out: 'soupe_orties', n: 1, need: { ortie: 3, patate: 1 }, st: 'feu' },
  { out: 'omelette_champignons', n: 1, need: { oeuf: 2, champi_bon: 2 }, st: 'feu' },
  { out: 'tarte_baies', n: 1, need: { farine: 1, baies: 3, oeuf: 1 }, st: 'four' },
);
if (typeof LIVRES !== 'undefined' && LIVRES.manuel_cuisine) for (const id of ['soupe_orties', 'omelette_champignons', 'tarte_baies']) if (!LIVRES.manuel_cuisine.recettes.includes(id)) LIVRES.manuel_cuisine.recettes.push(id);

// ---------------------------------------------------------------- qui achète quoi
{
  const S = (id) => { const d = NPC_DATA.find((x) => x.id === id); return d && d.shop ? d.shop : null; };
  const ajoute = (id, L) => { const s = S(id); if (s) { s.buys = s.buys || []; for (const k of L) if (ITEMS[k] && !s.buys.includes(k)) s.buys.push(k); } };
  ajoute('guerisseuse', ['marguerite', 'mauve', 'violette', 'primevere', 'bleuet', 'coquelicot', 'nenuphar', 'myrtille', 'prunelle']);
  ajoute('aubergiste', ['mure', 'fraise_bois', 'airelle', 'myrtille', 'soupe_orties', 'omelette_champignons', 'tarte_baies']);
  ajoute('alchimiste', ['rhododendron', 'jacinthe', 'fougere', 'nenuphar', 'iris', 'armillaire']);
}

// ============================================================================
//  LES BOIS : chaque arbre donne le sien (05-zzzz-nature.js : NAT_BOIS) ; la souche
//  d'un arbre abattu aussi. Recettes à eux : manches, arc d'if, bâton de houx,
//  meubles fins.
// ============================================================================
// (la souche d'un arbre abattu donne le bois de cet arbre : voir play.collect, plus bas ; les souches d'origine : des bûches)
RECIPES.push(
  { out: 'manche', n: 2, need: { bois_dur: 2 }, st: 'etabli' },
  { out: 'arc_if', n: 1, need: { bois_if: 4, corde: 2, cuir: 1 }, st: 'etabli' },
  { out: 'baton_houx', n: 1, need: { bois_houx: 3 }, st: null },
  { out: 'commode_noyer', n: 1, need: { bois_noyer: 10, clous: 2, lingot_cuivre: 1 }, st: 'etabli' },
  { out: 'armoire_chene', n: 1, need: { bois_chene: 16, clous: 3 }, st: 'etabli' },
  { out: 'table_merisier', n: 1, need: { bois_merisier: 8, clous: 2 }, st: 'etabli' },
  { out: 'lit_noyer', n: 1, need: { bois_noyer: 10, toile: 3, laine: 2 }, st: 'etabli' },
);
HAND_GROUPS[4].splice(HAND_GROUPS[4].indexOf('arc_long'), 0, 'arc_if');
HAND_GROUPS[8].push('baton_houx');
if (typeof LIVRES !== 'undefined') {
  const apprend = (livre, L) => { if (LIVRES[livre] && LIVRES[livre].recettes) for (const id of L) if (!LIVRES[livre].recettes.includes(id)) LIVRES[livre].recettes.push(id); };
  apprend('manuel_menuisier', ['manche', 'commode_noyer', 'armoire_chene', 'table_merisier', 'lit_noyer']);
  apprend('manuel_chasse', ['arc_if']);
}
if (typeof fabrication !== 'undefined' && fabrication.LECONS && fabrication.LECONS.chasseur) fabrication.LECONS.chasseur.push(['arc_if', 6, 90]);
// les meubles fins : le même meuble (tout ce qui le concerne marche pareil), d'un bois qui se voit
const NAT_TEINTES = { noyer: [0.56, 0.44, 0.38], chene: [0.8, 0.7, 0.56], merisier: [1.0, 0.7, 0.6], hetre: [1.08, 1.0, 0.86] };
const NAT_FINS = {}; // « commode:noyer » -> objet
for (const id in ITEMS) { const it = ITEMS[id]; if (it.fin && it.place) NAT_FINS[it.place + ':' + it.fin] = id; }
{
  const teinter = (E, c) => {
    const T = Object.create(E);
    const w = (col, code) => (col === WHITE && (code === TL.wood || code === TL.darkwood) ? c : col);
    T.bx = (cx, y0, cz, sx, sy, sz, col, code, ry, rx, rz) => E.bx(cx, y0, cz, sx, sy, sz, w(col, code), code, ry, rx, rz);
    T.box = (cx, cy, cz, sx, sy, sz, col, code, ry, rx, rz) => E.box(cx, cy, cz, sx, sy, sz, w(col, code), code, ry, rx, rz);
    return T;
  };
  for (const base of new Set(Object.keys(NAT_FINS).map((k) => k.split(':')[0]))) {
    const _m = PROP_MODELS[base];
    if (!_m) continue;
    PROP_MODELS[base] = function (E, o, t) {
      const fin = (o && o.data && o.data.fin) || nature2.finIcone, c = fin && NAT_TEINTES[fin];
      return _m.call(this, c ? teinter(E, c) : E, o, t);
    };
  }
  if (typeof meubles !== 'undefined') {
    // posé : le bois du meuble reste dans ses données ; repris : on retrouve le meuble fin
    const _dp = meubles.dataPose.bind(meubles);
    meubles.dataPose = function (id) {
      const d = _dp(id), it = ITEMS[farm.s && farm.s.hand];
      if (!it || !it.fin || it.place !== id) return d;
      return Object.assign(d || {}, { fin: it.fin });
    };
    const _rep = meubles.reprendre.bind(meubles);
    meubles.reprendre = function (q) {
      const fin = q && q.data && q.data.fin, id = q && q.id, fid = fin && NAT_FINS[id + ':' + fin];
      const r = _rep(q);
      if (r && fid && farm.take(id, 1)) { farm.give(fid, 1); play.select(fid); }
      return r;
    };
  }
}
// le bâton de houx, en main : on grimpe un peu plus raide (les réglages d'avant reviennent quand on le range)
HOOKS.update.push(() => {
  if (!farm.s || typeof corps === 'undefined') return;
  const on = farm.s.hand === 'baton_houx';
  if (on === !!nature2.pente0) return;
  if (on) { nature2.pente0 = [corps.PENTE_MAX, corps.PENTE_GLISSE]; corps.PENTE_MAX *= 1.1; corps.PENTE_GLISSE *= 1.07; }
  else { [corps.PENTE_MAX, corps.PENTE_GLISSE] = nature2.pente0; nature2.pente0 = null; }
});

// ============================================================================
//  LES PLANTES NOUVELLES (05-zzzz-nature.js : NAT_PLANTES) — types du décor
//  (après tous les autres : les numéros des types d'avant ne bougent pas),
//  effets, remarques de l'alchimiste, l'herbe d'égarement, le peuplement.
// ============================================================================
for (const P of NAT_PLANTES) {
  const grand = P.h[1] > 1.1;
  OBJ_TYPES.push({ id: P.o, name: P.nom, cat: P.cat, spr: ['w4_' + P.o], h: P.h, col: 0, sway: P.cat === 'Champignons' ? 0 : grand ? 0.1 : 0.15, spacing: grand ? 1.6 : 0.9, sink: 0.04 });
}
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });
natComestibles();

// l'égarement : le monde tourne doucement ; on marche en rond sans s'en apercevoir (herbe d'égarement, datura)
EFFETS.egarement = {
  dur: [60, 150],
  debut: ['(Par où étiez-vous venu ?)'],
  start(A) { A.T.dir = Math.random() < 0.5 ? -1 : 1; },
  tick(A, dt) {
    const p = game.player;
    A.T.t = (A.T.t || 0) + dt;
    p.yaw += dt * A.T.dir * (0.09 + 0.05 * Math.sin(A.T.t * 0.37)) * A.k;
    A.T.m = (A.T.m ?? 9 + Math.random() * 9) - dt;
    if (A.T.m <= 0) { A.T.m = 11 + Math.random() * 14; sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.16); }
  },
  fx(A, fx, tint) { teinte(tint, [0.55, 0.62, 0.5], 0.06); fx[0] = Math.max(fx[0], 0.12); },
};
Object.assign(ALIMENTS_EFFETS, {
  paquerette: { r: [['soin', 0.25, 5, 20]] },
  oseille: { r: [['vigueur', 0.1, 10, 40], ['coliques', 0.08, 60, 180]] },
  plantain: { r: [['sang_arrete', 0.9, 0, 0, 1], ['soin', 0.2, 5, 20]] },
  barbe_bouc: { r: [['vigueur', 0.12, 10, 40]] },
  cardamine: { r: [['vigueur', 0.15, 10, 40]] },
  verveine: { r: [['voyance', 0.25, 10, 40, 1, 90, 180], ['calme', 0.35, 10, 40]] },
  mouron: { c: 'le mouron rouge', r: [['poison', 0.4, 60, 180, 1], ['nausee', 0.6, 20, 90]] },
  bouillon_blanc: { r: [['remede', 0.5, 5, 20], ['calme', 0.2, 10, 40]] },
  armoise: { r: [['reve', 0.4, 0, 20, 1, 200, 300], ['somnolence', 0.2, 30, 90]] },
  coprin: { r: [['vigueur', 0.06, 10, 40]] },
  jusquiame: { c: 'la jusquiame', r: [['hallucinations', 0.9, 20, 90, 2, 150, 280], ['poison', 0.6, 60, 180, 2], ['panique', 0.4, 30, 90], ['vision_nuit', 0.3, 20, 60]] },
  datura: { c: 'le datura', r: [['hallucinations', 0.95, 20, 80, 3, 180, 300], ['egarement', 0.7, 30, 90, 1, 120, 200], ['panique', 0.6, 30, 90, 2], ['poison', 0.5, 60, 200, 2]] },
  chelidoine: { c: 'la chélidoine', r: [['pique', 0.9, 0, 0], ['coliques', 0.5, 40, 150], ['nausee', 0.4, 20, 90]] },
  rue: { c: 'la rue', r: [['sangfroid', 0.5, 5, 20, 1, 120, 240], ['calme', 0.4, 10, 40], ['nausee', 0.5, 20, 90]] },
  anemone: { c: 'l’anémone', r: [['pique', 0.8, 0, 0], ['vomir', 0.3, 30, 120]] },
  pervenche: { r: [['calme', 0.3, 10, 40], ['voyance', 0.1, 20, 60]] },
  sceau_salomon: { c: 'les baies du sceau-de-Salomon', r: [['vomir', 0.5, 30, 120], ['nausee', 0.4, 20, 90], ['soin', 0.2, 10, 30]] },
  parisette: { c: 'la parisette', r: [['poison', 0.9, 30, 150, 2], ['vomir', 0.7, 30, 120], ['vue_trouble', 0.5, 20, 60], ['paralysie', 0.2, 60, 150, 1, 5, 9]] },
  oxalis: { r: [['vigueur', 0.1, 10, 40], ['coliques', 0.05, 60, 180]] },
  asperule: { r: [['calme', 0.4, 10, 40], ['somnolence', 0.3, 30, 90]] },
  mousse: { r: [['nausee', 0.1, 30, 120]] },
  usnee: { r: [['sang_arrete', 0.9, 0, 0, 2], ['soin', 0.2, 10, 30]] },
  herbe_egaree: { r: [['egarement', 0.95, 5, 20, 1, 120, 200], ['hallucinations', 0.3, 30, 120]] },
  pied_mouton: { r: [['vigueur', 0.1, 20, 60]] },
  coulemelle: { r: [['vigueur', 0.1, 20, 60]] },
  bolet_satan: { c: 'un bolet Satan', r: [['vomir', 0.95, 20, 90, 2], ['coliques', 0.9, 40, 150, 2], ['nausee', 0.9, 10, 60, 2], ['poison', 0.2, 60, 180, 1]] },
  vesse_loup: { r: [['coliques', 0.05, 60, 180]] },
  // le mal vient longtemps après, quand on croit que tout va bien
  phalloide: { c: 'une amanite phalloïde', r: [['coliques', 0.9, 200, 260, 2], ['vomir', 0.85, 210, 280, 2], ['poison', 0.97, 240, 300, 3]] },
  populage: { c: 'le populage', r: [['pique', 0.9, 0, 0], ['nausee', 0.5, 20, 90], ['coliques', 0.3, 60, 180]] },
  salicaire: { r: [['remede', 0.9, 5, 20], ['soin', 0.2, 10, 30]] },
  massette: { r: [['vigueur', 0.05, 10, 40]] },
  menyanthe: { r: [['remede', 0.6, 5, 20], ['vigueur', 0.4, 10, 40]] },
  sphaigne: { r: [['sang_arrete', 0.9, 0, 0, 2]] },
  consoude: { r: [['os', 0.95, 5, 30], ['soin', 0.4, 10, 30]] },
  genet: { c: 'le genêt', r: [['sprint', 0.25, 10, 40], ['panique', 0.15, 20, 60]] },
  pulsatille: { c: 'la pulsatille', r: [['nausee', 0.6, 20, 90], ['vomir', 0.3, 40, 120], ['somnolence', 0.3, 60, 150]] },
  euphraise: { r: [['yeux', 0.7, 5, 20, 1, 120, 240], ['vision_nuit', 0.2, 20, 60, 1, 90, 160]] },
  absinthe: { r: [['chaleur', 0.6, 5, 20, 1, 120, 240], ['hallucinations', 0.15, 60, 180], ['faim', 0.3, 20, 60]] },
  soldanelle: { r: [['chaleur', 0.4, 5, 20]] },
  saxifrage: { r: [['force', 0.15, 20, 60]] },
  nigritelle: { r: [['charme', 0.6, 5, 20, 1, 150, 260]] },
  ancolie: { c: 'l’ancolie', r: [['nausee', 0.6, 20, 90], ['panique', 0.3, 20, 60], ['poison', 0.3, 60, 180, 1]] },
  chardon_bleu: { r: [['sangfroid', 0.4, 5, 20], ['pique', 0.3, 0, 0]] },
});
// ce que dit l'alchimiste quand on les lui montre
Object.assign(alchimie.REM, {
  barbe_bouc: 'Du salsifis des prés, la barbe-de-bouc. Il se ferme à midi, comme un fonctionnaire. La racine est bonne, cuite.',
  cardamine: 'De la cardamine. Le cresson des prés. Mangez-la, elle ne vous veut aucun mal. C’est rare, par ici.',
  verveine: 'De la verveine. Pas celle des tisanes : la vraie, l’herbe sacrée. Les druides la cueillaient sans la regarder. Je ne sais pas pourquoi. J’ai essayé ; ça ne change rien.',
  mouron: 'Du mouron rouge. Regardez-le avant de sortir : s’il est fermé, prenez un parapluie. Et ne le donnez pas aux poules.',
  armoise: 'De l’armoise. Mettez-en sous votre oreiller, et racontez-moi. Non : ne me racontez pas. Si. Racontez-moi.',
  coprin: 'Un coprin. Mangez-le aujourd’hui, pas demain : demain, ce sera de l’encre. Et pas de vin avec. Croyez-moi sur parole.',
  jusquiame: 'De la jusquiame. La plante des sorcières, la vraie. Lavez-vous les mains avant de toucher votre visage, et surtout vos yeux.',
  datura: 'Du datura. L’herbe du diable. Ceux qui en prennent parlent à des gens qui ne sont pas là, puis ils ne savent plus rentrer chez eux. On les retrouve dans les bois, assis.',
  chelidoine: 'De la chélidoine. Le lait orange brûle les verrues. Il brûle aussi le reste. Ne le mettez que sur les verrues.',
  rue: 'De la rue ! Où l’avez-vous trouvée ? Dans un vieux jardin de curé, je parie. On la disait contre le mauvais œil. Elle est surtout contre les enfants à naître.',
  anemone: 'Des anémones des bois. Jolies, et elles brûlent. Tout ce qui fleurit trop tôt se protège.',
  pervenche: 'De la pervenche. Toujours verte, même sous la neige. On en couronnait les pendus. Je ne sais pas si c’était pour les consoler.',
  sceau_salomon: 'Du sceau-de-Salomon. Voyez les cicatrices sur la racine ? Une par année. Celle-ci a vu passer plus d’hivers que vous.',
  parisette: 'La parisette ! Une seule baie, au milieu de quatre feuilles. Elle vous regarde, n’est-ce pas ? Ne la regardez pas trop longtemps, et surtout ne la mangez pas.',
  oxalis: 'De l’oxalis, le pain-de-coucou. Il plie ses feuilles avant l’orage. Plus fiable que l’almanach.',
  asperule: 'De l’aspérule. Laissez-la faner : elle sentira le foin et la vanille. Les bonnes choses prennent leur temps.',
  usnee: 'De l’usnée, la barbe des vieux sapins. Sur une plaie, elle vaut tous les onguents. Elle ne pousse que là où l’air est propre. Pas en ville, donc.',
  herbe_egaree: 'De l’herbe. Non… attendez. Où l’avez-vous prise ? Vous en êtes revenu sans mal ? L’herbe d’égarement. Je croyais que c’était une fable. Mettez-la dans une boîte, et ne marchez plus jamais à cet endroit.',
  pied_mouton: 'Un pied-de-mouton. Regardez dessous : des aiguillons, pas des lamelles. Le seul champignon qu’on ne confond avec rien. Le champignon des prudents.',
  coulemelle: 'Une coulemelle. Grande et bonne. Méfiez-vous seulement de ses petites sœurs : si c’est plus petit que votre main, ce n’est pas elle.',
  bolet_satan: 'Un bolet Satan. Il ne tue pas, rassurez-vous. Vous souhaiterez seulement qu’il l’ait fait.',
  vesse_loup: 'Une vesse-de-loup. Tant qu’elle est blanche dedans, elle se mange. Après, c’est de la fumée. On en mettait sur les plaies, autrefois ; je ne le recommande pas.',
  phalloide: 'Posez ça. Doucement. Lavez-vous les mains. L’amanite phalloïde. Elle a bon goût, paraît-il, et pendant une journée on se croit sauvé. Puis le foie s’en va. Il n’y a rien à faire, après.',
  populage: 'Du populage, le souci d’eau. Un bouton d’or qui aurait les pieds dans la vase. Il brûle la bouche, comme toute la famille.',
  salicaire: 'De la salicaire. Contre les flux de ventre, rien de mieux. Gardez-en dans votre sac. On ne sait jamais ce qu’on mangera.',
  menyanthe: 'Du trèfle d’eau. Amer à pleurer. La fièvre déteste ça, et c’est ce qu’on lui demande.',
  sphaigne: 'De la sphaigne. Elle boit l’eau, elle garde les plaies propres. Et dans les tourbières, elle garde les morts. Intacts. On en a sorti un, il y a trente ans, qui avait encore sa corde au cou.',
  consoude: 'De la consoude. L’herbe à souder les os. En cataplasme sur une fracture, elle fait des merveilles. Mangée, moins. Mais un peu quand même.',
  pulsatille: 'Une pulsatille. Velue comme un chaton. Et vénéneuse comme un chat en colère.',
  euphraise: 'De l’euphraise, le casse-lunettes. Pour les yeux. Donnez-m’en, je lis trop.',
  absinthe: 'De la grande absinthe. La plus amère de toutes. Contre les vers, contre le froid. En liqueur, contre la raison.',
  soldanelle: 'Une soldanelle ! Elle fait fondre la neige autour d’elle pour fleurir. Une fleur qui a chaud. On aimerait en dire autant de certains.',
  saxifrage: 'De la saxifrage. Elle fend la pierre, dit-on. Surtout celle des reins. Je vous l’accorde, c’est moins poétique.',
  nigritelle: 'Une nigritelle. Sentez. La vanille, n’est-ce pas ? Les bergères en cachaient dans leur corsage. Je ne vous dirai pas pourquoi.',
  ancolie: 'Une ancolie des Alpes. Cinq colombes autour d’un plat. Toutes empoisonnées.',
  chardon_bleu: 'Un chardon bleu. La reine des Alpes. Il en reste si peu… Vous l’avez cueilli. Bien sûr. Tout le monde les cueille. C’est pour ça qu’il en reste si peu.',
});
// qui les achète
{
  const S = (id) => { const d = NPC_DATA.find((x) => x.id === id); return d && d.shop ? d.shop : null; };
  const ajoute = (id, L) => { const s = S(id); if (s) { s.buys = s.buys || []; for (const k of L) if (ITEMS[k] && !s.buys.includes(k)) s.buys.push(k); } };
  ajoute('guerisseuse', ['plantain', 'consoude', 'salicaire', 'menyanthe', 'euphraise', 'verveine', 'bouillon_blanc', 'sphaigne', 'usnee', 'paquerette', 'asperule']);
  ajoute('alchimiste', ['jusquiame', 'datura', 'parisette', 'herbe_egaree', 'rue', 'armoise', 'absinthe', 'bolet_satan', 'phalloide', 'chelidoine', 'mouron', 'pervenche', 'sceau_salomon', 'nigritelle', 'ancolie']);
  ajoute('aubergiste', ['oseille', 'pied_mouton', 'coulemelle', 'coprin', 'cardamine', 'barbe_bouc']);
  ajoute('maire', ['chardon_bleu', 'nigritelle', 'soldanelle']);
}
// cueillir : la souche d'un arbre abattu donne son bois ; une vieille vesse-de-loup fume ; les ronces griffent
{
  const _collect = play.collect.bind(play);
  play.collect = function (o, idx, H, p) {
    const T = o && OBJ_TYPES[o.t];
    if (o && o.fromStump !== undefined && H && H.drop) {
      const w = game.world, src = w && w.objects[o.fromStump], TS = src && OBJ_TYPES[src.t], bois = TS && NAT_BOIS_DE[TS.id];
      if (bois) H = Object.assign({}, H, { drop: H.drop.map((d) => (d[0] === 'bois' ? [bois].concat(d.slice(1)) : d)) });
    }
    const r = _collect(o, idx, H, p);
    if (r && T && T.id === 'vesse_loup' && Math.random() < 0.4) {
      const y = game.world.objectY ? game.world.objectY(o) : (p ? p[1] : 0);
      for (let k = 0; k < 22; k++) particles.spawn(o.x, y + 0.1, o.z, (Math.random() - 0.5) * 0.9, 0.3 + Math.random() * 0.7, (Math.random() - 0.5) * 0.9, [0.45, 0.36, 0.22, 0.75], 0.07 + Math.random() * 0.05, 1.2 + Math.random() * 1.2, -0.05, false);
    }
    if (r && T && T.id === 'ronce' && Math.random() < 0.15 && typeof corps !== 'undefined') corps.saigner(0.02);
    return r;
  };
}
// l'herbe d'égarement : qui marche dessus sans la voir (une fois par jour et par touffe)
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!playing || !farm.s || game.dying) return;
  nature2.pasT = (nature2.pasT || 0) - dt;
  if (nature2.pasT > 0) return;
  nature2.pasT = 0.4;
  const w = game.world, p = game.player, ti = OBJ_INDEX.herbe_egaree;
  if (!w || ti === undefined || p.riding || p.underground || !w.objectsGrid) return;
  const N = nature2.S(), E = N.egare || (N.egare = {});
  // (la grille de tous les objets : w.query ne connaît que les objets solides)
  const G = w.objectsGrid(), gx = clamp(Math.floor(p.pos[0] / G.C), 0, G.gw - 1), gz = clamp(Math.floor(p.pos[2] / G.C), 0, G.gw - 1);
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    const c = G.cells[clamp(gz + dz, 0, G.gw - 1) * G.gw + clamp(gx + dx, 0, G.gw - 1)];
    if (c) for (const i of c) {
      const o = w.objects[i];
      if (!o || o.t !== ti || o.gone || Math.hypot(o.x - p.pos[0], o.z - p.pos[2]) > 0.75 || E[i] === farm.s.day) continue;
      E[i] = farm.s.day;
      effets.declencher('egarement', { delai: 3 + Math.random() * 5, k: 1 });
    }
  }
});

// ---------------------------------------------------------------- le peuplement (après tout le reste, son propre tirage)
// Les plantes nouvelles poussent dans leurs milieux (touffes de deux à cinq pieds, selon la rareté), jamais dans
// l'eau, sur un chemin, dans une ville, un lieu-dit, sur un objet posé ou devant une interaction. La mousse pousse au
// nord des arbres ; l'usnée tombe au pied des sapins ; les plantes des décombres, près des murs.
function natPeupler(w, seed) {
  if (!w || !w.designed || typeof milieuAt !== 'function') return 0;
  const rnd = mulberry32(((seed | 0) ^ 0x6e617432) >>> 0), WL = w.waterLevel, S = w.size;
  const B = new Builder(w, rnd, new Uint8Array(1));
  const n0 = w.objects.length;
  let n = 0;
  // ce qu'il faut éviter : villes et zones protégées, lieux-dits, objets posés, interactions
  const zones = (w.noBuild || []).map((P) => [P.x, P.z, P.r + 4]);
  for (const k in w.lm || {}) { const L = w.lm[k]; if (L && !L.under) zones.push([L.x, L.z, Math.min(L.r || 10, 40) * 0.8 + 3]); }
  const C = 16, grille = new Map(), cle = (x, z) => ((x / C) | 0) * 4096 + ((z / C) | 0);
  const marque = (x, z) => { const k = cle(x, z); if (!grille.has(k)) grille.set(k, []); grille.get(k).push(x, z); };
  for (const q of w.props) if (q && !q.gone) marque(q.x, q.z);
  for (const it of w.inter || []) marque(it.x, it.z);
  const pres = (x, z, r) => {
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const L = grille.get((((x / C) | 0) + dx) * 4096 + ((z / C) | 0) + dz);
      if (L) for (let i = 0; i < L.length; i += 2) if (Math.abs(L[i] - x) < r && Math.abs(L[i + 1] - z) < r) return true;
    }
    return false;
  };
  // tous les objets du décor (w.query ne connaît que les objets solides) : une grille de 4 m, et ce qu'on y ajoute
  const CO = 4, tous = new Map(), cleO = (x, z) => ((x / CO) | 0) * 4096 + ((z / CO) | 0);
  const ajoute = (x, z) => { const k = cleO(x, z); if (!tous.has(k)) tous.set(k, []); tous.get(k).push(x, z); };
  for (let i = 0; i < n0; i++) { const o = w.objects[i]; if (o && !o.gone && !o.cleared) ajoute(o.x, o.z); }
  const voisin = (x, z, r) => {
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const L = tous.get((((x / CO) | 0) + dx) * 4096 + ((z / CO) | 0) + dz);
      if (L) for (let i = 0; i < L.length; i += 2) if (Math.hypot(L[i] - x, L[i + 1] - z) < r) return true;
    }
    return false;
  };
  const libre = (x, z, o) => {
    o = o || {};
    if (!w.inside(x, z, 20)) return false;
    const h = w.heightAt(x, z);
    if (h < WL + 0.05) return false;
    for (const [zx, zz, zr] of zones) if (Math.abs(x - zx) < zr && Math.abs(z - zz) < zr && Math.hypot(x - zx, z - zz) < zr) return false;
    if (pres(x, z, 2)) return false;
    const i = Math.round(x / w.cell), j = Math.round(z / w.cell), m = w.mats[j * w.W + i];
    if (m === M_DIRT || m === M_COBBLE || m === M_ICE) return false;
    if (!o.pente && w.normalAt(x, z)[1] < 0.8) return false;
    if (voisin(x, z, o.pres || 0.8)) return false;
    let ok = true;
    w.query(x, z, 1.5, (q) => { if (ok && q && !q.gone && Math.hypot(q.x - x, q.z - z) < 1.1) ok = false; }, (b) => {
      if (!ok || b.under) return;
      const [lx, lz] = World.blockLocal(b, x, z);
      if (Math.abs(lx) < b.sx / 2 + 0.6 && Math.abs(lz) < b.sz / 2 + 0.6) ok = false;
    });
    return ok;
  };
  const pose = (id, x, z) => { B.obj(id, x, z); ajoute(x, z); n++; };
  // les milieux (échantillonnage grossier : 24 m) ; les abords des maisons et des ruines (plantes des décombres)
  const pts = {};
  for (let z = 40; z < S - 40; z += 24) for (let x = 40; x < S - 40; x += 24) {
    const jx = x + (rnd() - 0.5) * 20, jz = z + (rnd() - 0.5) * 20;
    if (w.heightAt(jx, jz) < WL - 0.2) continue;
    const k = milieuAt(w, jx, jz);
    (pts[k] || (pts[k] = [])).push([jx, jz]);
  }
  const murs = [];
  for (const k in w.bld || {}) {
    const b = w.bld[k];
    if (!b || !(b.x > 0)) continue;
    const R = Math.max(b.W || 8, b.D || 8) * 0.6 + 2;
    for (let a = 0; a < 6; a++) { const t = rnd() * TAU, d = R + rnd() * 6; murs.push([b.x + Math.cos(t) * d, b.z + Math.sin(t) * d]); }
  }
  pts.ville = (pts.ville || []).concat(murs); pts.ferme = murs.concat(pts.pres || []);
  // les arbres (pour la mousse et l'usnée)
  const FEUILLUS = new Set(['oak', 'hetre', 'chataignier', 'erable', 'birch', 'noyer', 'tilleul', 'aulne']), RESINEUX = new Set(['sapin', 'sapin_neige', 'meleze', 'pine']);
  const feuillus = [], resineux = [];
  for (let i = 0; i < n0; i++) {
    const o = w.objects[i];
    if (!o || o.gone) continue;
    const id = OBJ_TYPES[o.t] && OBJ_TYPES[o.t].id;
    if (FEUILLUS.has(id)) feuillus.push(o); else if (RESINEUX.has(id)) resineux.push(o);
  }
  const PER = [60, 32, 14, 5, 3], tir = (L) => L[(rnd() * L.length) | 0];

  for (const P of NAT_PLANTES) {
    if (OBJ_INDEX[P.o] === undefined) continue;
    const grand = P.h[1] > 1.1, touffes = PER[P.r] || 2;
    // la mousse : au nord des arbres (le nord : −z) ; l'usnée : au pied des sapins
    if (P.o === 'mousse' || P.o === 'usnee') {
      const L = P.o === 'mousse' ? feuillus.concat(resineux) : resineux;
      for (let k = 0; k < touffes * 3 && L.length; k++) {
        const a = tir(L), x = P.o === 'mousse' ? a.x + (rnd() - 0.5) * 0.9 : a.x + (rnd() - 0.5) * 3.5, z = P.o === 'mousse' ? a.z - 1.15 - rnd() * 0.5 : a.z + (rnd() - 0.5) * 3.5;
        if (P.o === 'usnee' && Math.hypot(x - a.x, z - a.z) < 1.2) continue;
        if (libre(x, z, { pente: true })) pose(P.o, x, z);
      }
      continue;
    }
    const cand = P.hab.flatMap((h) => pts[h] || []);
    if (!cand.length) continue;
    for (let k = 0; k < touffes; k++) {
      // (une plante rare cherche plus longtemps sa place : jusqu'à huit endroits pour une touffe)
      for (let essai = 0, pose1 = 0; essai < (P.r >= 2 ? 8 : 1) && !pose1; essai++) {
        const [cx, cz] = tir(cand), m = P.r >= 4 ? 1 : grand ? 1 + ((rnd() * 2) | 0) : 2 + ((rnd() * 4) | 0), sp = grand ? 8 : 6;
        for (let j = 0; j < m; j++) {
          const x = cx + (rnd() - 0.5) * sp, z = cz + (rnd() - 0.5) * sp;
          if (!libre(x, z, { pente: P.hab.includes('rochers'), pres: grand ? 1.4 : 1.0 })) continue;
          pose(P.o, x, z); pose1++;
        }
      }
    }
  }
  // les bêtes nouvelles (points d'apparition), selon leur rareté, dans leurs milieux ; les taupinières
  const NB = [18, 10, 5, 3, 1];
  for (const [kind, , hab, rar] of NAT_BETES) {
    const oid = 'nat_' + kind;
    if (kind === 'papillon_or' || OBJ_INDEX[oid] === undefined) continue;
    let cand = hab.flatMap((h) => pts[h] || []);
    if (kind === 'effraie' && murs.length) cand = murs.concat(cand); // près des granges et des clochers, ou des prés
    if (!cand.length) continue;
    const nb = kind === 'grue' ? 2 : NB[rar] || 1;
    for (let k = 0; k < nb; k++) {
      for (let essai = 0; essai < 6; essai++) {
        let [x, z] = tir(cand);
        x += (rnd() - 0.5) * 8; z += (rnd() - 0.5) * 8;
        if (kind === 'grebe') { // sur l'eau libre, pas loin de la berge
          let ok = false;
          for (let j = 0; j < 12 && !ok; j++) { const a = rnd() * TAU, d = 6 + rnd() * 30, tx = x + Math.cos(a) * d, tz = z + Math.sin(a) * d; if (w.inside(tx, tz, 20) && w.heightAt(tx, tz) < WL - 0.6) { x = tx; z = tz; ok = true; } }
          if (!ok) continue;
          pose(oid, x, z); break;
        }
        if (kind === 'cincle' && Math.abs(w.heightAt(x, z) - WL) > 1.2) continue;
        if (!libre(x, z, { pente: hab.includes('rochers') })) continue;
        pose(oid, x, z);
        if (kind === 'taupe') { pose('taupiniere', x, z); for (let j = 0; j < 4; j++) { const tx = x + (rnd() - 0.5) * 8, tz = z + (rnd() - 0.5) * 8; if (libre(tx, tz)) pose('taupiniere', tx, tz); } }
        break;
      }
    }
  }
  if (n) { w.objectsDirty = true; w.grid = null; w.shadeDirty = true; }
  return n;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    try { if (w && w.designed) natPeupler(w, w.seed || seed); } catch (e) { console.error(e); }
    return w;
  };
}

// ============================================================================
//  LES BÊTES NOUVELLES (05-zzzz-nature.js : NAT_BETES, notices, butins) : leurs
//  comportements, leurs modèles en boîtes, leurs cris ; le PAPILLON D'OR et le
//  filet à papillons.
// ============================================================================
Object.assign(CREATURES, {
  hermine: { walk: 0.9, run: 6.0, range: 14, flee: 7, radius: 0.06, idle: [1, 4], rig: 'hermine', h: 0.14, wild: true, nat: 'hermine' },
  taupe: { walk: 0.2, run: 0.6, range: 1.5, flee: 0, radius: 0.05, idle: [2, 6], rig: 'taupe', h: 0.07, wild: true, nat: 'taupe' },
  mulot: { walk: 0.8, run: 4.5, range: 8, flee: 5, radius: 0.03, idle: [0.5, 2.5], rig: 'mulot', h: 0.05, wild: true, nuit: true, nat: 'mulot' },
  loir: { walk: 0.7, run: 4.0, range: 10, flee: 6, radius: 0.05, idle: [2, 6], rig: 'loir', h: 0.1, wild: true, nuit: true, arbre: true, nat: 'loir' },
  lievre: { walk: 1.1, run: 9.0, range: 22, flee: 5, radius: 0.16, idle: [4, 12], hop: true, rig: 'lievre', h: 0.5, wild: true, nat: 'lievre' },
  chat_sauvage: { walk: 0.9, run: 7.0, range: 24, flee: 10, radius: 0.14, idle: [3, 8], rig: 'chat_sauvage', h: 0.42, wild: true, nuit: true, nat: 'chat_sauvage' },
  lezard: { walk: 0.4, run: 5.0, range: 5, flee: 3.5, radius: 0.03, idle: [5, 15], rig: 'lezard', h: 0.03, wild: true, nat: 'lezard' },
  orvet: { walk: 0.15, run: 0.4, range: 4, flee: 0, radius: 0.04, idle: [5, 15], rig: 'orvet', h: 0.04, wild: true },
  crapaud: { walk: 0.15, run: 0.5, range: 5, flee: 0, radius: 0.06, idle: [3, 10], rig: 'crapaud', h: 0.1, wild: true, nuit: true, call: 'crapaud' },
  triton: { walk: 0.2, run: 0.8, range: 4, flee: 2, radius: 0.03, idle: [3, 10], rig: 'triton', h: 0.03, wild: true, nat: 'triton' },
  pic_vert: { walk: 0, run: 0, range: 30, flee: 9, radius: 0.1, idle: [4, 10], rig: 'pic_vert', h: 0.3, wild: true, nat: 'pic_vert' },
  coucou: { walk: 0, run: 0, range: 40, flee: 10, radius: 0.1, idle: [4, 10], rig: 'coucou', h: 0.3, wild: true, nat: 'coucou' },
  geai: { walk: 0.7, run: 2.5, range: 12, flee: 14, radius: 0.08, idle: [1, 4], rig: 'geai', h: 0.3, wild: true, oiseau: true, nat: 'geai' },
  alouette: { walk: 0.6, run: 2.5, range: 10, flee: 7, radius: 0.05, idle: [1, 4], rig: 'alouette', h: 0.18, wild: true, oiseau: true, nat: 'alouette' },
  effraie: { walk: 0, run: 0, range: 30, flee: 7, radius: 0.12, idle: [4, 10], rig: 'effraie', h: 0.4, wild: true, perch: true, nat: 'effraie' },
  grand_corbeau: { fly: true, rig: 'grand_corbeau', flock: 2, nat: 'grand_corbeau' },
  cincle: { walk: 0.3, run: 1.5, range: 5, flee: 6, radius: 0.05, idle: [2, 6], rig: 'cincle', h: 0.16, wild: true, nat: 'cincle' },
  grebe: { walk: 0.4, run: 1.2, range: 14, flee: 0, radius: 0.12, idle: [2, 6], water: true, rig: 'grebe', h: 0.35, nat: 'grebe' },
  butor: { walk: 0.2, run: 1.0, range: 6, flee: 5, radius: 0.1, idle: [5, 15], rig: 'butor', h: 0.7, wild: true, oiseau: true, nat: 'butor' },
  grue: { fly: true, rig: 'grue', flock: 7, nat: 'grue' },
  lucane: { walk: 0.08, run: 0.2, range: 3, flee: 0, radius: 0.03, idle: [4, 12], rig: 'lucane', h: 0.03, wild: true, nat: 'lucane' },
  mante: { walk: 0.05, run: 0.3, range: 2, flee: 0, radius: 0.03, idle: [8, 20], rig: 'mante', h: 0.09, wild: true, nat: 'mante' },
  papillon_or: { fly: true, rig: 'papillon_or', flock: 1, nat: 'papillon' },
});
// ---------------------------------------------------------------- les modèles (boîtes ; l'avant regarde +z)
Object.assign(ANIMAL_RIGS, {
  hermine: (v) => {
    const blanc = v === 7, c = blanc ? [0.95, 0.95, 0.93] : rgbf('#8a5a34');
    const r = quadRig({ col: c, body: [0.07, 0.07, 0.24], bodyY: 0.075, leg: [0.03, 0.05], neck: [0, 0.03], head: [0.06, 0.055, 0.07], face: TL.foxF, ears: [0.02, 0.02, 0.01], tail: [0.025, 0.025, 0.1] });
    return rigPlus(r, [
      { name: 'ventre', parent: 'body', p: [0, -0.02, 0.02], s: [0.066, 0.03, 0.18], col: [0.95, 0.9, 0.78], tex: TL.fur },
      { name: 'bout', parent: 'tail', p: [0, -0.02, -0.1], s: [0.028, 0.028, 0.045], col: [0.06, 0.05, 0.05], tex: TL.fur },
    ]);
  },
  taupe: () => {
    const { P, add } = rigParts();
    const c = [0.16, 0.15, 0.17], rose = rgbf('#e8a8a0');
    add('body', null, [0, 0.035, 0], [0.06, 0.05, 0.12], [0, 0, 0], c, TL.fur);
    add('neck', 'body', [0, 0.005, 0.06], null);
    add('head', 'neck', [0, 0, 0], [0.04, 0.035, 0.04], [0, 0, 0.02], c, TL.fur);
    add('museau', 'head', [0, -0.005, 0.045], [0.015, 0.012, 0.02], [0, 0, 0], rose, TL.skin);
    for (const [n, s] of [['legFL', -1], ['legFR', 1]]) add(n, 'body', [s * 0.035, -0.01, 0.04], [0.03, 0.012, 0.025], [s * 0.012, -0.005, 0], rose, TL.skin);
    add('tail', 'body', [0, 0, -0.06], [0.008, 0.008, 0.02], [0, 0, -0.01], rose, TL.skin);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  mulot: () => quadRig({ col: rgbf('#8a6a4a'), body: [0.035, 0.035, 0.07], bodyY: 0.035, leg: [0.012, 0.02], neck: [0, 0.012], head: [0.03, 0.03, 0.035], face: TL.rabbitF,
    ears: [0.016, 0.018, 0.006], tail: [0.006, 0.006, 0.08] }),
  loir: () => {
    const r = quadRig({ col: rgbf('#8a8a86'), body: [0.06, 0.06, 0.13], bodyY: 0.06, leg: [0.02, 0.035], neck: [0, 0.02], head: [0.055, 0.05, 0.06], face: TL.rabbitF,
      ears: [0.02, 0.02, 0.01], tail: [0.045, 0.045, 0.12], tailCol: rgbf('#9a9a96') });
    return rigPlus(r, [{ name: 'lunettes', parent: 'head', p: [0, 0.012, 0.045], s: [0.058, 0.014, 0.02], col: [0.12, 0.11, 0.1], tex: TL.fur }]);
  },
  lievre: () => {
    const r = scaleRig(ANIMAL_RIGS.rabbit(), 1.35);
    for (const q of r.parts) if (q.s && q.name !== 'tail') q.col = rgbf('#9a7a52');
    const u = [];
    for (const [e, s] of [['earL', -1], ['earR', 1]]) { const ear = r.part(e); if (ear) { ear.s = [ear.s[0], ear.s[1] * 1.35, ear.s[2]]; u.push({ name: 'bout' + s, parent: e, p: [0, ear.s[1] * 1.0, 0], s: [ear.s[0] + 0.004, 0.04, ear.s[2] + 0.004], col: [0.08, 0.07, 0.06], tex: TL.fur }); } }
    return rigPlus(r, u);
  },
  chat_sauvage: () => {
    const r = scaleRig(ANIMAL_RIGS.cat(2), 1.25);
    for (const q of r.parts) if (q.s) { q.col = rgbf(q.name === 'tail' ? '#6a5a44' : '#8a7a60'); if (q.name === 'body') q.tex = TL.stripes; }
    const tl = r.part('tail'); if (tl) tl.s = [0.075, tl.s[1] * 0.85, 0.075];
    return rigPlus(r, [
      { name: 'bout', parent: 'tail', p: [0, -0.4, 0], s: [0.08, 0.07, 0.08], col: [0.08, 0.07, 0.06], tex: TL.fur },
      { name: 'oeilL', parent: 'head', p: [-0.04, 0.03, 0.2], s: [0.022, 0.014, 0.01], col: [0.85, 0.8, 0.3], tex: TL.plain, fl: FX_EMIT },
      { name: 'oeilR', parent: 'head', p: [0.04, 0.03, 0.2], s: [0.022, 0.014, 0.01], col: [0.85, 0.8, 0.3], tex: TL.plain, fl: FX_EMIT },
    ]);
  },
  lezard: () => {
    const { P, add } = rigParts();
    const c = rgbf('#6a7040'), c2 = rgbf('#4a4a30');
    add('body', null, [0, 0.012, 0], [0.022, 0.012, 0.06], [0, 0, 0], c, TL.scales);
    add('neck', 'body', [0, 0.002, 0.03], null);
    add('head', 'neck', [0, 0, 0], [0.018, 0.011, 0.026], [0, 0, 0.012], c2, TL.scales);
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.012, -0.002, sz * 0.02], [0.018, 0.006, 0.006], [sx * 0.009, -0.003, 0], c2, TL.scales);
    add('tail', 'body', [0, 0, -0.03], [0.012, 0.008, 0.08], [0, 0, -0.04], c2, TL.scales);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  orvet: () => { const r = scaleRig(ANIMAL_RIGS.snake(), 0.75); for (const q of r.parts) if (q.s) q.col = q.name === 'head' ? rgbf('#8a6038') : rgbf(/[02468]$/.test(q.name) ? '#a87a48' : '#98703e'); return r; },
  crapaud: () => { const r = scaleRig(ANIMAL_RIGS.frog(), 1.3); for (const q of r.parts) if (q.s) { if (q.name.startsWith('oeil')) q.col = [0.7, 0.46, 0.2]; else { q.col = rgbf('#7a6a48'); q.tex = TL.scales; } } return r; },
  triton: () => {
    const { P, add } = rigParts();
    const c = [0.14, 0.13, 0.12], o = rgbf('#e87a20');
    add('body', null, [0, 0.01, 0], [0.016, 0.012, 0.045], [0, 0, 0], c, TL.scales);
    add('ventre', 'body', [0, -0.006, 0], [0.014, 0.004, 0.04], [0, 0, 0], o, TL.plain);
    add('crete', 'body', [0, 0.009, -0.005], [0.003, 0.006, 0.04], [0, 0, 0], c, TL.scales);
    add('neck', 'body', [0, 0, 0.022], null);
    add('head', 'neck', [0, 0, 0], [0.014, 0.01, 0.016], [0, 0, 0.008], c, TL.scales);
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.009, -0.002, sz * 0.015], [0.012, 0.004, 0.004], [sx * 0.006, -0.002, 0], c, TL.scales);
    add('tail', 'body', [0, 0, -0.022], [0.004, 0.012, 0.045], [0, 0, -0.022], c, TL.scales);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  pic_vert: () => rigPlus(birdParts({ col: rgbf('#6a9a40'), body: [0.08, 0.11, 0.16], bodyY: 0.1, head: [0.06, 0.06, 0.07], headCol: rgbf('#7aaa48'), beak: [0.012, 0.012, 0.05], beakCol: rgbf('#5a5a50'),
    tail: [0.05, 0.012, 0.07], tailCol: rgbf('#4a6a2a'), leg: [0.012, 0.04], legCol: rgbf('#6a6a60') }), [
    { name: 'calotte', parent: 'head', p: [0, 0.06, 0.01], s: [0.04, 0.015, 0.06], col: rgbf('#d02a20'), tex: TL.fur },
    { name: 'croupion', parent: 'body', p: [0, 0.01, -0.07], s: [0.06, 0.04, 0.03], col: rgbf('#d8d040'), tex: TL.fur },
  ]),
  coucou: () => rigPlus(birdParts({ col: rgbf('#8a8e94'), body: [0.07, 0.08, 0.16], bodyY: 0.1, head: [0.05, 0.05, 0.06], beak: [0.012, 0.01, 0.025], beakCol: rgbf('#3a3a30'),
    tail: [0.04, 0.012, 0.14], tailCol: rgbf('#6a6e74'), leg: [0.01, 0.03], legCol: rgbf('#d8b040') }), [
    { name: 'ventre', parent: 'body', p: [0, -0.02, 0.02], s: [0.066, 0.04, 0.12], col: rgbf('#d8d8d0'), tex: TL.stripes },
  ]),
  geai: () => rigPlus(birdParts({ col: rgbf('#b09080'), body: [0.09, 0.1, 0.18], bodyY: 0.11, head: [0.065, 0.065, 0.07], beak: [0.014, 0.014, 0.03], beakCol: rgbf('#2a2a2a'),
    tail: [0.05, 0.012, 0.1], tailCol: [0.08, 0.08, 0.09], wingCol: rgbf('#6a5a50'), leg: [0.012, 0.05], legCol: rgbf('#a08070') }), [
    { name: 'miroirL', parent: 'wingL', p: [0, 0.02, 0.05], s: [0.024, 0.03, 0.04], col: rgbf('#3a6ad0'), tex: TL.stripes },
    { name: 'miroirR', parent: 'wingR', p: [0, 0.02, 0.05], s: [0.024, 0.03, 0.04], col: rgbf('#3a6ad0'), tex: TL.stripes },
    { name: 'moustache', parent: 'head', p: [0, 0.01, 0.03], s: [0.068, 0.012, 0.02], col: [0.08, 0.08, 0.09], tex: TL.fur },
  ]),
  alouette: () => rigPlus(birdParts({ col: rgbf('#9a8060'), body: [0.07, 0.07, 0.14], bodyY: 0.08, head: [0.05, 0.05, 0.055], beak: [0.01, 0.01, 0.02], beakCol: rgbf('#8a8070'),
    tail: [0.04, 0.01, 0.07], leg: [0.01, 0.035], legCol: rgbf('#c0a080') }), [
    { name: 'huppe', parent: 'head', p: [0, 0.055, -0.01], s: [0.015, 0.025, 0.03], col: rgbf('#7a6048'), tex: TL.fur, r0: [-0.5, 0, 0] },
  ]),
  effraie: () => birdParts({ col: rgbf('#e0c898'), body: [0.2, 0.3, 0.2], bodyY: 0.22, head: [0.18, 0.16, 0.14], face: TL.catF, headCol: rgbf('#f4f0e8'), beak: [0.025, 0.03, 0.02], beakCol: rgbf('#e8d8c0'),
    tail: [0.1, 0.08, 0.05], wingCol: rgbf('#d0b080'), leg: [0.03, 0.08], legCol: rgbf('#f0ece0') }),
  grand_corbeau: () => { const r = scaleRig(ANIMAL_RIGS.crow(), 1.55); r.lent = [14, 0.7]; return r; },
  cincle: () => rigPlus(birdParts({ col: rgbf('#3a2a24'), body: [0.07, 0.07, 0.11], bodyY: 0.08, head: [0.05, 0.05, 0.05], headCol: rgbf('#5a3a2a'), beak: [0.01, 0.01, 0.02], beakCol: [0.1, 0.1, 0.1],
    tail: [0.035, 0.01, 0.04], tailUp: 0.6, leg: [0.012, 0.04], legCol: rgbf('#8a7a60') }), [
    { name: 'bavette', parent: 'body', p: [0, 0.01, 0.05], s: [0.06, 0.05, 0.02], col: [0.95, 0.95, 0.92], tex: TL.fur },
  ]),
  grebe: () => rigPlus(birdParts({ col: rgbf('#6a5a4a'), body: [0.14, 0.1, 0.3], bodyY: 0.1, neck: [0.04, 0.16, 0.04], neckR: [-0.15, 0, 0], neckCol: [0.95, 0.95, 0.93], head: [0.05, 0.05, 0.07],
    headCol: [0.95, 0.95, 0.93], beak: [0.012, 0.012, 0.06], beakCol: rgbf('#c07070'), tail: [0.04, 0.02, 0.02], leg: [0.01, 0.01] }), [
    { name: 'crete', parent: 'head', p: [0, 0.05, -0.01], s: [0.04, 0.035, 0.04], col: [0.1, 0.08, 0.07], tex: TL.fur },
    { name: 'collerette', parent: 'head', p: [0, 0.015, -0.005], s: [0.075, 0.035, 0.04], col: rgbf('#c86030'), tex: TL.fur },
  ]),
  butor: () => birdParts({ col: rgbf('#9a7a4a'), body: [0.18, 0.22, 0.3], bodyY: 0.4, neck: [0.07, 0.22, 0.07], neckR: [0.1, 0, 0], neckCol: rgbf('#b8945a'), head: [0.07, 0.07, 0.09], headCol: rgbf('#7a5a34'),
    beak: [0.025, 0.025, 0.12], beakCol: rgbf('#c8b050'), tail: [0.08, 0.04, 0.06], leg: [0.025, 0.3], legCol: rgbf('#8a9a40') }),
  grue: () => {
    const r = rigPlus(birdParts({ col: rgbf('#9aa0a8'), body: [0.22, 0.2, 0.46], bodyY: 0.9, neck: [0.05, 0.4, 0.05], neckR: [0.2, 0, 0], neckCol: [0.1, 0.1, 0.1], head: [0.07, 0.07, 0.1],
      headCol: [0.9, 0.9, 0.9], beak: [0.02, 0.02, 0.12], beakCol: rgbf('#8a8060'), tail: [0.14, 0.06, 0.12], wing: [0.8, 0.02, 0.3], wingCol: rgbf('#8a9098'), leg: [0.025, 0.7], legCol: [0.15, 0.15, 0.15] }), [
      { name: 'calotte', parent: 'head', p: [0, 0.065, 0.01], s: [0.04, 0.012, 0.04], col: rgbf('#c02020'), tex: TL.plain },
    ]);
    r.lent = [11, 0.55]; r.vol = [1.3, -1.3, 1.35, 0.2]; // en vol : le cou tendu devant, les pattes derrière
    return r;
  },
  lucane: () => {
    const { P, add } = rigParts();
    const c = rgbf('#4a2a1a'), m = rgbf('#8a4a2a');
    add('body', null, [0, 0.012, 0], [0.026, 0.014, 0.045], [0, 0, 0], c, TL.scales);
    add('neck', 'body', [0, 0.002, 0.024], null);
    add('head', 'neck', [0, 0, 0], [0.022, 0.01, 0.014], [0, 0, 0.007], c, TL.scales);
    for (const s of [-1, 1]) add('mandibule' + s, 'head', [s * 0.007, 0.003, 0.014], [0.004, 0.004, 0.026], [0, 0, 0.013], m, TL.plain, { r0: [0, s * -0.35, 0] });
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.013, -0.004, sz * 0.012], [0.02, 0.004, 0.004], [sx * 0.01, -0.004, 0], c, TL.plain);
    add('wingL', 'body', [-0.01, 0.008, 0], [0.04, 0.002, 0.03], [-0.02, 0, 0], rgbf('#c8b8a0'), TL.plain, { hide: true });
    add('wingR', 'body', [0.01, 0.008, 0], [0.04, 0.002, 0.03], [0.02, 0, 0], rgbf('#c8b8a0'), TL.plain, { hide: true });
    const r = new Rig(P); r.kind = 'bird'; return r;
  },
  mante: () => {
    const { P, add } = rigParts();
    const v = rgbf('#7ab040'), v2 = rgbf('#5a9030');
    add('body', null, [0, 0.03, 0], [0.012, 0.014, 0.05], [0, 0, 0], v, TL.fur);
    add('thorax', 'body', [0, 0.005, 0.022], [0.008, 0.008, 0.035], [0, 0.015, 0.012], v2, TL.fur, { r0: [-0.9, 0, 0] });
    add('neck', 'thorax', [0, 0.035, 0.022], null);
    add('head', 'neck', [0, 0, 0], [0.016, 0.012, 0.01], [0, 0, 0.004], v, TL.fur);
    for (const s of [-1, 1]) add('bras' + s, 'thorax', [s * 0.006, 0.025, 0.02], [0.004, 0.025, 0.004], [0, -0.012, 0.004], v2, TL.fur, { r0: [0.9, 0, 0] });
    for (const [n, sx, sz] of [['legBL', -1, -1], ['legBR', 1, -1], ['legFL', -1, 0.3], ['legFR', 1, 0.3]]) add(n, 'body', [sx * 0.006, -0.005, sz * 0.012], [0.024, 0.003, 0.003], [sx * 0.012, -0.006, 0], v2, TL.fur);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  papillon_or: () => {
    const { P, add } = rigParts();
    const or = [1.0, 0.78, 0.26], bord = [0.55, 0.36, 0.08];
    add('body', null, [0, 0, 0], [0.012, 0.012, 0.05], [0, 0, 0], [0.18, 0.12, 0.06], TL.fur);
    add('neck', 'body', [0, 0, 0.025], null);
    add('head', 'neck', [0, 0, 0], [0.012, 0.012, 0.012], [0, 0, 0.005], [0.15, 0.1, 0.05], TL.fur);
    for (const s of [-1, 1]) add('antenne' + s, 'head', [s * 0.004, 0.005, 0.006], [0.002, 0.002, 0.03], [0, 0, 0.015], [0.1, 0.08, 0.05], TL.plain, { r0: [-0.6, s * 0.3, 0] });
    add('wingL', 'body', [-0.006, 0.002, 0.004], [0.075, 0.003, 0.06], [-0.0375, 0, 0.005], or, TL.plain, { fl: FX_EMIT });
    add('wingR', 'body', [0.006, 0.002, 0.004], [0.075, 0.003, 0.06], [0.0375, 0, 0.005], or, TL.plain, { fl: FX_EMIT });
    add('bordL', 'wingL', [-0.07, 0.001, 0], [0.012, 0.003, 0.056], [0, 0, 0.005], bord, TL.plain);
    add('bordR', 'wingR', [0.07, 0.001, 0], [0.012, 0.003, 0.056], [0, 0, 0.005], bord, TL.plain);
    add('basL', 'body', [-0.006, 0, -0.012], [0.045, 0.003, 0.04], [-0.022, 0, -0.01], [0.95, 0.66, 0.2], TL.plain, { fl: FX_EMIT, r0: [0, 0, 0] });
    add('basR', 'body', [0.006, 0, -0.012], [0.045, 0.003, 0.04], [0.022, 0, -0.01], [0.95, 0.66, 0.2], TL.plain, { fl: FX_EMIT, r0: [0, 0, 0] });
    const r = new Rig(P); r.kind = 'bird'; r.papillon = true; return r;
  },
});
// les points d'apparition (objets du monde « animaux », ajoutés après tous les autres types) ; les taupinières
for (const [kind, nom] of NAT_BETES) if (kind !== 'papillon_or') OBJ_TYPES.push({ id: 'nat_' + kind, name: nom, cat: 'Animaux', spr: ['a_rabbit'], h: [0.2, 0.2], animal: kind, col: 0, sway: 0, spacing: 3, sink: 0 });
OBJ_TYPES.push({ id: 'taupiniere', name: 'Taupinière', cat: 'Végétation', spr: ['w4_taupiniere'], h: [0.14, 0.2], col: 0, sway: 0, spacing: 1, sink: 0.05 });
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });
// quelques réglages à l'apparition : les grands oiseaux planent haut ; l'hermine des neiges est blanche
{
  const _spawnFrom = entities.spawnFrom.bind(entities);
  entities.spawnFrom = function (w, o, kind) {
    const arr = _spawnFrom(w, o, kind);
    if (kind === 'grand_corbeau') for (const e of arr) { e.flyR = 30 + Math.random() * 25; e.flyH = 28 + Math.random() * 18; e.flyS = 0.1 * (Math.random() < 0.5 ? 1 : -1); }
    if (kind === 'grue') { const s = Math.random() < 0.5 ? 1 : -1, R = 90 + Math.random() * 40, H = 55 + Math.random() * 15; arr.forEach((e, k) => { e.flyR = R + k * 2.5; e.flyH = H + (k % 2) * 1.5; e.flyS = 0.045 * s; e.flyA = k * 0.035 * -s; e.pack0 = arr[0]; }); }
    if (kind === 'hermine' && w.snowLine && w.heightAt(o.x, o.z) > w.snowLine - 12) for (const e of arr) { e.v = 7; e.rig = ANIMAL_RIGS.hermine(7); }
    return arr;
  };
}
// (les dépouilles de la chasse : leur nom)
if (typeof CHASSE_NOMS !== 'undefined') Object.assign(CHASSE_NOMS, {
  hermine: 'l’hermine', taupe: 'la taupe', mulot: 'le mulot', loir: 'le loir', lievre: 'le lièvre', chat_sauvage: 'le chat sauvage', lezard: 'le lézard', orvet: 'l’orvet',
  crapaud: 'le crapaud', triton: 'le triton', pic_vert: 'le pic', coucou: 'le coucou', geai: 'le geai', alouette: 'l’alouette', effraie: 'la chouette', grand_corbeau: 'le corbeau',
  cincle: 'le cincle', grebe: 'le grèbe', butor: 'le butor', grue: 'la grue', lucane: 'la lucane', mante: 'la mante',
});
// ---------------------------------------------------------------- les cris (courts, discrets ; aucun ne se répète en boucle)
// les cris d'oiseaux (et leur durée, s) ; ceux qui reviennent d'eux-mêmes attendent qu'aucun autre oiseau ne chante
const NAT_CRI_OISEAU = { coucou: 0.7, pic: 1.1, alouette: 1.6, cincle: 0.15, grebe: 0.35, corbeau: 0.55, grue: 1, geai: 0.6, effraie: 1.1, butor: 2.3 };
const NAT_CRI_PATIENT = new Set(['coucou', 'cincle', 'grebe', 'corbeau', 'alouette']);
Object.assign(SoundEngine.prototype, {
  natCri(kind, pan, k) {
    if (!this.ok) return;
    const t = this.at ? this.at() : this.ctx.currentTime + 0.02, v = clamp(k === undefined ? 1 : k, 0, 1), R = Math.random;
    // (les oiseaux chantent chacun leur tour : un cri qui revient de lui-même attend qu'un autre oiseau se taise)
    const dur = NAT_CRI_OISEAU[kind];
    if (dur !== undefined) {
      if (NAT_CRI_PATIENT.has(kind) && (this.oiseauxFin || 0) > t + 0.3) return;
      this.oiseauxFin = Math.max(this.oiseauxFin || 0, t + dur);
    }
    const p = this.pan(clamp(pan || 0, -1, 1), this.amb);
    switch (kind) {
      case 'crapaud': for (let i = 0; i < 4; i++) this.voice(t + i * 0.13, 'sine', 520, 490, 0.09, 0.03 * v, p, { lp: 900 }); return;
      case 'geai': for (let i = 0; i < 2; i++) { this.voice(t + i * 0.3, 'sawtooth', 1150, 780, 0.26, 0.04 * v, p, { bp: 1600, q: 1.1 }); this.noiseHit(t + i * 0.3, 0.24, 'bandpass', 2400, 1.2, 0.03 * v, p); } return;
      case 'alouette': for (let i = 0; i < 18; i++) { const f = 2600 + R() * 1900; this.tone(t + i * 0.085 + R() * 0.02, 'sine', f, f * (R() < 0.5 ? 1.15 : 0.85), 0.06, 0.009 * v, p, 0.006); } return;
      case 'coucou': this.voice(t, 'sine', 690, 680, 0.24, 0.05 * v, p, { lp: 1400 }); this.voice(t + 0.36, 'sine', 570, 560, 0.34, 0.05 * v, p, { lp: 1400 }); return;
      case 'pic': for (let i = 0; i < 10; i++) this.voice(t + i * 0.11, 'triangle', 1650 - i * 30, 1450 - i * 30, 0.07, 0.022 * v, p, { bp: 1800, q: 1.5 }); return;
      case 'tambour': for (let i = 0; i < 14; i++) this.noiseHit(t + i * 0.05, 0.02, 'bandpass', 900, 3, 0.05 * v * (1 - i / 18), p); return;
      case 'effraie': this.noiseHit(t, 1.1, 'bandpass', 3400, 1.5, 0.05 * v, p, 2600); this.voice(t, 'sawtooth', 1500, 1100, 1.0, 0.02 * v, p, { vib: 23, vibDepth: 90, bp: 2200, q: 1 }); return;
      case 'corbeau': for (let i = 0; i < 2; i++) this.voice(t + i * 0.32, 'sawtooth', 330, 250, 0.2, 0.045 * v, p, { bp: 700, q: 1.3 }); return;
      case 'cincle': for (let i = 0; i < 2; i++) this.tone(t + i * 0.09, 'sine', 4200, 3600, 0.04, 0.014 * v, p, 0.004); return;
      case 'grebe': this.voice(t, 'sawtooth', 420, 300, 0.32, 0.03 * v, p, { bp: 800, q: 1.4 }); return;
      case 'butor': for (let i = 0; i < 3; i++) { this.voice(t + i * 0.9, 'sine', 150, 125, 0.55, 0.09 * v, p, { lp: 300 }); this.noiseHit(t + i * 0.9 - 0.08, 0.1, 'lowpass', 300, 0.8, 0.02 * v, p); } return;
      case 'grue': for (let i = 0; i < 3; i++) { const f = 640 + R() * 140; this.voice(t + i * 0.34, 'sawtooth', f, f * 0.93, 0.26, 0.03 * v, p, { vib: 18, vibDepth: 25, bp: 1100, q: 1.3 }); } return;
      case 'hermine': for (let i = 0; i < 6; i++) this.tone(t + i * 0.045, 'square', 1900 + R() * 300, 1700, 0.025, 0.008 * v, p, 0.003); return;
      case 'loir': this.voice(t, 'sawtooth', 300, 280, 0.6, 0.02 * v, p, { vib: 28, vibDepth: 60, lp: 800 }); return;
      case 'lucane': this.voice(t, 'sawtooth', 115, 105, 1.4, 0.018 * v, p, { vib: 9, vibDepth: 8, bp: 420, q: 2 }); return;
      case 'feule': this.noiseHit(t, 0.6, 'highpass', 2600, 0.8, 0.04 * v, p, 4200); this.voice(t + 0.1, 'sawtooth', 160, 120, 0.5, 0.03 * v, p, { lp: 500 }); return;
      case 'froissement': this.noiseHit(t, 0.14, 'bandpass', 2200, 1.2, 0.02 * v, p); return;
      case 'terre': this.noiseHit(t, 0.22, 'lowpass', 600, 0.7, 0.04 * v, p); return;
      case 'plouf': this.noiseHit(t, 0.18, 'lowpass', 1400, 0.7, 0.03 * v, p, 400); return;
      case 'filet': this.noiseHit(t, 0.18, 'bandpass', 1300, 0.9, 0.05 * v, this.sfx, 500); return;
    }
  },
});
{
  const _an = SoundEngine.prototype.animal;
  SoundEngine.prototype.animal = function (kind, pan, k) { if (kind === 'crapaud') return this.natCri('crapaud', pan, k); return _an.call(this, kind, pan, k); };
}
// ---------------------------------------------------------------- les comportements
const natCri = (e, kind, c, portee) => {
  const d = Math.hypot(e.x - c.px, e.z - c.pz);
  if (d > portee || !sound.natCri) return;
  sound.natCri(kind, ((e.x - c.px) * c.right[0] + (e.z - c.pz) * c.right[2]) / (d || 1), 1 - d / portee);
};
const NAT_ARBRES = new Set(['oak', 'pine', 'birch', 'apple', 'deadtree', 'hetre', 'chataignier', 'noyer', 'erable', 'tilleul', 'aulne', 'saule', 'peuplier']);
const natArbre = (w, x, z, R, loin) => {
  const L = [];
  w.query(x, z, R, (o) => { if (o && !o.gone && NAT_ARBRES.has(OBJ_TYPES[o.t].id) && (!loin || Math.hypot(o.x - loin.x, o.z - loin.z) > 6)) L.push(o); }, null);
  return L.length ? L[(Math.random() * L.length) | 0] : null;
};
const NAT_COMPORTE = {
  // se dresse pour regarder, puis file dans les pierres
  hermine(e, dt, w, c) {
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) { e.hidden = false; e.state = 'idle'; } return true; }
    const alerte = e.cfg.flee * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.5 : 1);
    if (e.dist < alerte) { if (!e.fuitT) { e.fuitT = 1.2; natCri(e, 'hermine', c, 25); } }
    if (e.fuitT > 0) { e.fuitT -= dt; if (e.fuitT <= 0) { e.fuitT = 0; e.cache = 10 + Math.random() * 12; } e.rig.set('body', 0, 0, 0); return false; }
    const dresse = e.dist < 18 && e.state === 'idle';
    e.rig.set('body', dresse ? -0.95 : 0, 0, 0);
    if (dresse) { e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 3); e.move = 0; return true; }
    return false;
  },
  // sous la terre ; elle sort le museau de temps en temps, et rentre si l'on approche
  taupe(e, dt, w, c) {
    e.move = 0;
    e.sortT = (e.sortT ?? 8 + Math.random() * 30) - dt;
    if (e.dehors > 0) {
      e.dehors -= dt;
      if (e.dist < 3 && !c.crouch) e.dehors = Math.min(e.dehors, 0.2);
      e.hidden = false; e.y = w.heightAt(e.x, e.z) - 0.03;
      if (e.dehors <= 0) { e.hidden = true; e.sortT = 15 + Math.random() * 45; natCri(e, 'terre', c, 12); }
      return true;
    }
    e.hidden = true;
    if (e.sortT <= 0 && e.dist < 60) {
      e.dehors = 3 + Math.random() * 4; e.heading = Math.random() * TAU;
      const y = w.heightAt(e.x, e.z);
      for (let k = 0; k < 8; k++) particles.spawn(e.x, y + 0.05, e.z, (Math.random() - 0.5) * 0.8, 0.5 + Math.random() * 0.6, (Math.random() - 0.5) * 0.8, [0.36, 0.26, 0.18, 1], 0.04, 0.6, 6, false);
      natCri(e, 'terre', c, 12);
    }
    return true;
  },
  // bonds brusques, arrêts, couinements
  mulot(e, dt, w, c) {
    if (e.state === 'flee') { e.zigT = (e.zigT || 0) - dt; if (e.zigT <= 0) { e.zigT = 0.25 + Math.random() * 0.3; e.fleeDir += (Math.random() - 0.5) * 1.8; if (Math.random() < 0.3 && sound.squeak) sound.squeak(); } }
    return false;
  },
  // la nuit, dans les arbres ; il grogne
  loir(e, dt, w, c) {
    e.grT = (e.grT ?? 20 + Math.random() * 40) - dt;
    if (e.grT <= 0) { e.grT = 30 + Math.random() * 60; if (c.night > 0.5 && !e.hidden) natCri(e, 'loir', c, 30); }
    return false;
  },
  // reste au gîte jusqu'au dernier moment, puis zigzague
  lievre(e, dt, w, c) {
    if (e.state === 'flee') { e.zigT = (e.zigT || 0) - dt; if (e.zigT <= 0) { e.zigT = 0.35 + Math.random() * 0.4; e.fleeDir += (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.6); } }
    return false;
  },
  // crache quand on insiste ; les yeux luisent
  chat_sauvage(e, dt, w, c) {
    e.feuleT = Math.max(0, (e.feuleT || 0) - dt);
    if (e.dist < 4.5 && e.feuleT <= 0 && !e.hidden) { e.feuleT = 6; natCri(e, 'feule', c, 20); }
    return false;
  },
  // au soleil seulement ; il file dans une fente
  lezard(e, dt, w, c) {
    const soleil = c.night < 0.3 && (weather.state === 'clear' || weather.state === 'heat') && weather.cur.rain < 0.1;
    if (!soleil) { e.hidden = true; return true; }
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) e.hidden = false; return true; }
    if (e.state === 'flee' && !e.fuite) { e.fuite = true; natCri(e, 'froissement', c, 10); }
    if (e.fuite && e.state !== 'flee') { e.fuite = false; e.cache = 8 + Math.random() * 10; }
    return false;
  },
  // plonge dès qu'on approche
  triton(e, dt, w, c) {
    if (e.cache > 0) { e.cache -= dt; e.hidden = true; if (e.cache <= 0) e.hidden = false; return true; }
    if (e.dist < 2.2 && !c.crouch) { e.cache = 8 + Math.random() * 8; natCri(e, 'plouf', c, 10); return true; }
    return false;
  },
  // accroché au tronc, le jour ; il tambourine et il rit ; dérangé, il file vers un autre arbre
  pic_vert(e, dt, w, c) {
    if (c.night > 0.5) { e.hidden = true; return true; }
    e.hidden = false;
    if (!e.perch || e.bouge) {
      const o = natArbre(w, e.hx, e.hz, 30, e.perch);
      const a = Math.random() * TAU, rr = o ? 0.35 + Math.min(0.5, (o.h || 8) * 0.03) : 0;
      const P = o ? { x: o.x + Math.sin(a) * rr, z: o.z + Math.cos(a) * rr, y: w.objectY(o) + 1.4 + Math.random() * 1.8, cap: a + Math.PI } : { x: e.hx, z: e.hz, y: w.heightAt(e.hx, e.hz) + 2, cap: 0 };
      if (!e.perch) { e.x = P.x; e.z = P.z; e.y = P.y; }
      e.perch = P; e.vole = !!e.bouge; e.bouge = false;
    }
    const P = e.perch;
    if (e.vole) {
      const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz);
      e.heading = Math.atan2(dx, dz); e.fly = 1; e.phase += dt * 5;
      const sp = Math.min(d, dt * 8);
      e.x += dx / (d || 1) * sp; e.z += dz / (d || 1) * sp;
      e.y = lerp(e.y, P.y + Math.abs(Math.sin(d * 0.5)) * 1.5, Math.min(1, dt * 3)); // vol ondulé
      if (d < 0.25) { e.vole = false; e.y = P.y; }
      return true;
    }
    e.fly = 0; e.heading = P.cap; e.move = 0;
    if (e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1)) { e.bouge = true; sound.flutter && sound.flutter(0.5, 0); natCri(e, 'pic', c, 60); return true; }
    e.tamT = (e.tamT ?? 5 + Math.random() * 15) - dt;
    if (e.tamT <= 0) { e.tamT = 12 + Math.random() * 25; natCri(e, Math.random() < 0.6 ? 'tambour' : 'pic', c, 70); e.tape = 0.7; }
    if (e.tape > 0) { e.tape -= dt; e.rig.set('head', Math.max(0, Math.sin(e.tape * 60)) * 0.5, 0, 0); }
    return true;
  },
  // haut dans les arbres ; on l'entend, on ne le voit pas
  coucou(e, dt, w, c) {
    if (c.night > 0.5) { e.hidden = true; return true; }
    e.hidden = false;
    if (!e.perch || e.bouge) {
      const o = natArbre(w, e.hx, e.hz, 40, e.perch);
      const P = o ? { x: o.x + (Math.random() - 0.5), z: o.z + (Math.random() - 0.5), y: w.objectY(o) + (o.h || 8) * 0.72 } : { x: e.hx, z: e.hz, y: w.heightAt(e.hx, e.hz) + 6 };
      if (!e.perch) { e.x = P.x; e.z = P.z; e.y = P.y; }
      e.perch = P; e.vole = !!e.bouge; e.bouge = false;
    }
    const P = e.perch;
    if (e.vole) {
      const dx = P.x - e.x, dz = P.z - e.z, d = Math.hypot(dx, dz);
      e.heading = Math.atan2(dx, dz); e.fly = 1; e.phase += dt * 6;
      const sp = Math.min(d, dt * 9);
      e.x += dx / (d || 1) * sp; e.z += dz / (d || 1) * sp; e.y = lerp(e.y, P.y, Math.min(1, dt * 2));
      if (d < 0.3) e.vole = false;
      return true;
    }
    e.fly = 0; e.move = 0;
    if (e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1)) { e.bouge = true; sound.flutter && sound.flutter(0.5, 0); return true; }
    e.criT = (e.criT ?? 10 + Math.random() * 30) - dt;
    if (e.criT <= 0) { e.criT = 70 + Math.random() * 90; if (c.night < 0.4) natCri(e, 'coucou', c, 110); }
    return true;
  },
  // la sentinelle : quand il part, il crie, et toutes les bêtes alentour savent
  geai(e, dt, w, c) {
    e.cT = Math.max(0, (e.cT || 0) - dt);
    const alerte = e.cfg.flee * (c.crouch ? 0.5 : 1) * (c.sprint ? 1.4 : 1);
    if (!(e.flyT > 0) && e.dist < alerte && e.cT <= 0) { e.cT = 8; natCri(e, 'geai', c, 90); entities.scare(e.x, e.z, 35); }
    else if (!(e.flyT > 0) && e.dist < alerte * 1.8 && e.cT <= 0 && Math.random() < dt * 0.3) { e.cT = 10; natCri(e, 'geai', c, 90); }
    return false;
  },
  // dérangée, elle monte droit dans le ciel en chantant, puis se laisse tomber plus loin
  alouette(e, dt, w, c) {
    if (e.chante > 0) {
      e.chante -= dt; e.fly = 1; e.phase += dt * 8;
      const sol = w.heightAt(e.x, e.z), haut = e.chante > 5 ? 26 : 0;
      e.y = e.chante > 5 ? Math.min(sol + haut, e.y + dt * 3) : Math.max(sol, e.y - dt * 7);
      if (e.chante <= 5) { e.x += Math.sin(e.heading) * dt * 2; e.z += Math.cos(e.heading) * dt * 2; }
      e.chantT = (e.chantT || 0) - dt;
      if (e.chantT <= 0 && e.chante > 5) { e.chantT = 2.2; natCri(e, 'alouette', c, 80); }
      if (e.chante <= 0) { e.fly = 0; e.y = w.heightAt(e.x, e.z); e.state = 'idle'; e.timer = 2; e.hx = e.x; e.hz = e.z; }
      return true;
    }
    if (e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1)) { e.chante = 14 + Math.random() * 6; e.heading = Math.atan2(e.x - c.px, e.z - c.pz); sound.flutter && sound.flutter(0.6, 0); return true; }
    return false;
  },
  // la dame blanche : perchée la nuit ; elle crie comme quelqu'un qu'on étrangle
  effraie(e, dt, w, c) {
    e.hootT = 999; // (pas le hululement de la hulotte)
    e.criT = (e.criT ?? 20 + Math.random() * 60) - dt;
    if (e.criT <= 0) { e.criT = 50 + Math.random() * 90; if (c.night > 0.5 && !e.hidden) natCri(e, 'effraie', c, 80); }
    return false;
  },
  // fait des révérences sur les pierres ; plonge, et reparaît plus loin
  cincle(e, dt, w, c) {
    if (e.plonge > 0) {
      e.plonge -= dt; e.hidden = true;
      if (e.plonge <= 0) { e.hidden = false; for (let k = 0; k < 6; k++) { const a = Math.random() * TAU, x = e.hx + Math.cos(a) * (2 + Math.random() * 5), z = e.hz + Math.sin(a) * (2 + Math.random() * 5); const h = w.heightAt(x, z); if (h > w.waterLevel + 0.02 && h < w.waterLevel + 1.5) { e.x = x; e.z = z; e.y = h; break; } } }
      return true;
    }
    e.rig.set('body', Math.sin(c.t * 5 + e.seed) * 0.25, 0, 0);
    e.criT = (e.criT ?? 5 + Math.random() * 10) - dt;
    if (e.criT <= 0) { e.criT = 25 + Math.random() * 35; natCri(e, 'cincle', c, 30); }
    if (e.dist < e.cfg.flee * (c.crouch ? 0.5 : 1) || Math.random() < dt * 0.04) { e.plonge = 4 + Math.random() * 5; natCri(e, 'plouf', c, 15); return true; }
    return false;
  },
  // sur l'eau : il plonge au lieu de s'envoler, et ressort bien plus loin
  grebe(e, dt, w, c) {
    if (e.plonge > 0) {
      e.plonge -= dt; e.hidden = true;
      if (e.plonge <= 0) {
        e.hidden = false;
        for (let k = 0; k < 10; k++) { const a = Math.atan2(e.x - c.px, e.z - c.pz) + (Math.random() - 0.5) * 1.6, d = 8 + Math.random() * 8, x = e.x + Math.sin(a) * d, z = e.z + Math.cos(a) * d; if (w.inside(x, z, 5) && w.heightAt(x, z) < w.waterLevel - 0.4) { e.x = x; e.z = z; break; } }
        e.y = entities.groundY(w, e, e.x, e.z);
      }
      return true;
    }
    e.criT = (e.criT ?? 10 + Math.random() * 30) - dt;
    if (e.criT <= 0) { e.criT = 50 + Math.random() * 60; natCri(e, 'grebe', c, 60); }
    if (e.dist < 10 * (c.crouch ? 0.6 : 1)) { e.plonge = 8 + Math.random() * 8; natCri(e, 'plouf', c, 20); return true; }
    return false;
  },
  // le bœuf des marais : il mugit au crépuscule ; approché, il se fige le bec au ciel
  butor(e, dt, w, c) {
    const h = typeof npcs !== 'undefined' && npcs.hour ? npcs.hour() : 12;
    e.boumT = (e.boumT ?? 10 + Math.random() * 30) - dt;
    if (e.boumT <= 0) { e.boumT = 30 + Math.random() * 40; if (h >= 19 || h < 6) natCri(e, 'butor', c, 180); }
    const fige = !(e.flyT > 0) && e.dist < 13 && e.dist >= e.cfg.flee * (c.crouch ? 0.5 : 1);
    e.rig.set('neckB', fige ? -0.35 : 0.1, 0, 0); e.rig.set('head', fige ? -1.2 : 0, 0, 0);
    if (fige) { e.move = 0; e.state = 'idle'; e.timer = 2; return true; }
    return false;
  },
  // au crépuscule, il marche, et parfois vole lourdement en bourdonnant
  lucane(e, dt, w, c) {
    const h = typeof npcs !== 'undefined' && npcs.hour ? npcs.hour() : 12;
    if (!(h >= 18.5 || h < 1)) { e.hidden = true; return true; }
    e.hidden = false;
    if (e.vol > 0) {
      e.vol -= dt; e.fly = 1; e.phase += dt * 20;
      e.x += Math.sin(e.heading) * dt * 1.4; e.z += Math.cos(e.heading) * dt * 1.4; e.heading += (Math.random() - 0.5) * dt * 3;
      e.y = w.heightAt(e.x, e.z) + Math.min(2.2, (e.vol > 1.5 ? 2.2 : e.vol * 1.4));
      for (const q of ['wingL', 'wingR']) { const pa = e.rig.part(q); if (pa) pa.hide = false; }
      if (e.vol <= 0) { e.fly = 0; e.y = w.heightAt(e.x, e.z); for (const q of ['wingL', 'wingR']) { const pa = e.rig.part(q); if (pa) pa.hide = true; } }
      return true;
    }
    if (Math.random() < dt * 0.03) { e.vol = 3 + Math.random() * 4; natCri(e, 'lucane', c, 18); }
    return false;
  },
  // immobile ; elle tourne la tête pour vous suivre ; de tout près, elle lève les bras
  mante(e, dt, w, c) {
    e.move = 0; e.state = 'idle'; e.timer = 5;
    const a = angDiff(e.heading, Math.atan2(c.px - e.x, c.pz - e.z));
    e.lookY = clamp(a, -0.9, 0.9); // (poseQuad tourne le cou)
    const haut = e.dist < 1.2;
    e.rig.set('bras-1', haut ? -0.4 : 0.9, 0, 0); e.rig.set('bras1', haut ? -0.4 : 0.9, 0, 0);
    return true;
  },
};
{
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    const B = e.cfg.nat && NAT_COMPORTE[e.cfg.nat];
    if (B && !e.owner) { try { if (B(e, dt, w, c)) return; } catch (err) { console.error(err); } }
    _uw(e, dt, w, c);
  };
  const _ub = entities.updateBird.bind(entities);
  entities.updateBird = function (e, dt, w, c) {
    const k = e.cfg.nat;
    if (k === 'papillon') return nature2.volPapillon(e, dt, w, c);
    _ub(e, dt, w, c);
    if (k === 'grand_corbeau' && !e.hidden) { e.criT = (e.criT ?? 10 + Math.random() * 30) - dt; if (e.criT <= 0) { e.criT = 45 + Math.random() * 55; natCri(e, 'corbeau', c, 140); } }
    if (k === 'grue' && !e.hidden && e === (e.pack0 || e)) { e.criT = (e.criT ?? 5 + Math.random() * 20) - dt; if (e.criT <= 0) { e.criT = 15 + Math.random() * 25; natCri(e, 'grue', c, 260); } }
  };
}
// Au dessin : l'ombre des bêtes nouvelles est à leur taille (l'ombre commune fait au moins 40 cm de large : elle
// trahirait un lézard de loin), et seulement quand elles touchent le sol (pas sous un pic accroché au tronc, ni sous
// l'alouette qui monte) ; les grands oiseaux battent des ailes lentement, et planent (rig.lent = [vitesse, ampleur]).
{
  const MIENNES = [];
  for (const [kind] of NAT_BETES) { const C = CREATURES[kind]; if (C && !C.fly) { C.ombreNat = C.radius <= 0.12 ? C.radius * 1.3 : Math.max(0.2, C.radius * 1.1); MIENNES.push(C); } }
  const _draw = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) {
    for (const C of MIENNES) C.fly = true; // (dans le dessin, « fly » ne sert qu'à taire l'ombre commune)
    try { _draw(buf, sbuf, cam, maxD, t, flags); } finally { for (const C of MIENNES) delete C.fly; }
    const w = game.world;
    if (!sbuf || !w) return;
    const m2 = maxD * maxD;
    for (const e of this.list) {
      if (!e.cfg.ombreNat || e.hidden || e.far || e.dead || e.corpse || e.removed || !e.rig) continue;
      const dx = e.x - cam[0], dz = e.z - cam[2];
      if (dx * dx + dz * dz < m2 && e.y < w.heightAt(e.x, e.z) + 0.3) drawShadow(sbuf, e.x, e.y, e.z, e.cfg.ombreNat * (e.scale || 1));
    }
  };
  const _pb = poseBird;
  poseBird = function (rig, st) {
    _pb(rig, st);
    if (rig.papillon) { // posé, les ailes levées s'ouvrent et se ferment lentement ; les ailes de derrière suivent
      if (!(st.fly > 0)) { const bat = -0.5 - Math.sin(st.t * 2.5 + (st.seed || 0)) * 0.35; rig.set('wingL', 0, 0, bat); rig.set('wingR', 0, 0, -bat); }
      const a = rig.parts[rig.idx.wingL].r[2]; rig.set('basL', 0, 0, a * 0.85); rig.set('basR', 0, 0, -a * 0.85);
      return;
    }
    if (!rig.lent) return;
    const vol = st.fly > 0, V = rig.vol;
    if (V) { rig.set('neckB', vol ? V[0] : V[3], 0, 0); if (vol) { rig.set('neck', V[1], 0, 0); rig.set('legFL', V[2], 0, 0); rig.set('legFR', V[2], 0, 0); } }
    if (!vol) return;
    const ph = st.t * rig.lent[0] + (st.seed || 0), k = clamp((Math.sin(ph * 0.13) - 0.1) * 3, 0, 1), a = Math.sin(ph) * rig.lent[1] * (1 - k) + 0.06 * k;
    rig.set('wingL', 0, 0, a); rig.set('wingR', 0, 0, -a);
  };
}

// ============================================================================
//  LE MODULE
// ============================================================================
// LE PAPILLON D'OR : très rare (voir tools/equilibrage/nature.js, qui mesure sa fréquence avec ces fonctions) :
// seulement le jour (9 h - 17 h), par beau temps, dehors, dans les prés, la lande et les alpages, jamais avant le
// cinquième jour ni à moins de six jours du précédent ; alors, une chance sur cent par heure de jeu qu'il paraisse,
// à quelques dizaines de pas. Le joueur typique le voit ainsi une fois tous les quarante jours environ, celui qui le
// cherche toutes les trois semaines (la mesure). Il vit quelques minutes, fuit qui s'approche trop vite, et s'en va
// pour de bon s'il a eu trop peur. On le prend au filet, accroupi, ou posé sur une fleur.
const PAPILLON = { heure: 0.01, h0: 9, h1: 17, jour0: 5, ecart: 6, vie: [200, 320], milieux: ['pres', 'lande', 'alpage'] };
const nature2 = {
  S() {
    const s = farm.s;
    if (!s) return null;
    const N = s.nature2 && typeof s.nature2 === 'object' ? s.nature2 : (s.nature2 = {});
    if (!N.v) N.v = 1;
    if (!N.pap || typeof N.pap !== 'object') N.pap = { vus: 0, pris: 0, dernier: -99 };
    return N;
  },
  // ------------------------------------------------------------ le papillon d'or : quand peut-il paraître ?
  // (jour, heure, état du ciel, milieu, dernier vu) -> vrai ou faux ; les mêmes règles servent à la mesure
  papillonPossible(jour, heure, ciel, milieu, dernier) {
    if (jour < PAPILLON.jour0 || jour - dernier < PAPILLON.ecart) return false;
    if (heure < PAPILLON.h0 || heure >= PAPILLON.h1) return false;
    if (!['clear', 'cloudy', 'heat'].includes(ciel)) return false;
    return PAPILLON.milieux.includes(milieu);
  },
  chanceHeure() { return PAPILLON.heure; },
  papT: 5, pap: null,
  majPapillon(dt) {
    const s = farm.s, w = game.world, p = game.player;
    if (!s || !w || game.mode !== 'play' || game.dying || game.sleeping) return;
    this.papT -= dt;
    if (this.papT > 0) return;
    this.papT = 10;
    if (this.pap && !this.pap.removed) return;
    this.pap = null;
    if (p.underground || p.riding || strange.inEnvers() || (typeof mondes !== 'undefined' && mondes.cur)) return;
    if (weather.cur.rain > 0.05 || weather.cur.fog > 0.4 || (typeof vallee !== 'undefined' && vallee.snowK > 0.05)) return;
    if (w.covered(p.pos[0], p.pos[1] + 1.5, p.pos[2])) return;
    const N = this.S(), h = w.time * 24;
    if (!this.papillonPossible(s.day, h, weather.state, typeof milieuAt === 'function' ? milieuAt(w, p.pos[0], p.pos[2]) : 'pres', N.pap.dernier)) return;
    // dix secondes réelles : une fraction d'heure de jeu
    const k = 10 / (JOUR_SECONDES / 24);
    if (Math.random() >= 1 - Math.pow(1 - this.chanceHeure(), k)) return;
    this.apparaitre();
  },
  apparaitre(x, z) {
    const w = game.world, p = game.player, N = this.S();
    if (x === undefined) {
      for (let k = 0; k < 12; k++) {
        const a = Math.random() * TAU, d = 14 + Math.random() * 16, tx = p.pos[0] + Math.sin(a) * d, tz = p.pos[2] + Math.cos(a) * d;
        if (!w.inside(tx, tz, 10) || w.heightAt(tx, tz) < w.waterLevel + 0.3 || w.covered(tx, w.heightAt(tx, tz) + 1, tz)) continue;
        x = tx; z = tz; break;
      }
      if (x === undefined) return null;
    }
    const sol = w.heightAt(x, z);
    const e = entities.add(w, 'papillon_or', x, z, { hx: x, hz: z });
    Object.assign(e, { y: sol + 0.8, sol, fly: 1, vie: lerp(PAPILLON.vie[0], PAPILLON.vie[1], Math.random()), peur: 0, cible: null, cibleT: 0, pose: 0, part: 0, flyA: 0, flyR: 0 });
    this.pap = e;
    N.pap.vus++; N.pap.dernier = farm.s.day;
    if (typeof savoir !== 'undefined') savoir.voir('papillon_or');
    return e;
  },
  // son vol : une danse erratique autour des fleurs ; il se pose parfois ; il fuit qui s'approche trop vite
  volPapillon(e, dt, w, c) {
    e.hidden = false;
    const sol = w.heightAt(e.x, e.z);
    if (e.part > 0) { // il s'en va, pour de bon
      e.part -= dt; e.fly = 1; e.y += dt * 2.2; e.x += Math.sin(e.heading) * dt * 3; e.z += Math.cos(e.heading) * dt * 3;
      if (e.part <= 0) { entities.remove(e); if (this.pap === e) this.pap = null; }
      return;
    }
    e.vie -= dt;
    if (e.vie <= 0 || c.night > 0.45 || c.rain > 0.2) { e.part = 8; e.heading = Math.random() * TAU; return; }
    const alerte = c.crouch ? 1.9 : c.sprint ? 7 : 3.8;
    if (e.dist < alerte && !(e.fuite > 0)) this.fuir(e, c.px, c.pz);
    if (e.part > 0) return;
    e.fuite = Math.max(0, (e.fuite || 0) - dt);
    if (e.pose > 0) { // posé sur une fleur (les ailes : au dessin, poseBird)
      e.pose -= dt; e.fly = 0; e.y = sol + 0.28;
      return;
    }
    e.fly = 1;
    e.cibleT -= dt;
    if (!e.cible || e.cibleT <= 0) {
      const r = e.fuite > 0 ? 2.5 : 1.6;
      e.cible = [e.hx + (Math.random() - 0.5) * r * 2, sol + (e.fuite > 0 ? 1.5 + Math.random() * 1.5 : 0.35 + Math.random() * 1.1), e.hz + (Math.random() - 0.5) * r * 2];
      e.cibleT = 0.5 + Math.random() * 1.1;
      if (!(e.fuite > 0) && Math.random() < 0.12) e.pose = 2 + Math.random() * 4;
      // le centre de sa danse dérive doucement
      if (!(e.fuite > 0)) { e.hx += (Math.random() - 0.5) * 2; e.hz += (Math.random() - 0.5) * 2; }
    }
    const [tx, ty, tz] = e.cible, dx = tx - e.x, dy = ty - e.y, dz = tz - e.z, d = Math.hypot(dx, dy, dz) || 1;
    const v = (e.fuite > 0 ? 3.2 : 1.3) * dt;
    e.x += dx / d * Math.min(v, d) + (Math.random() - 0.5) * dt * 0.8;
    e.z += dz / d * Math.min(v, d) + (Math.random() - 0.5) * dt * 0.8;
    e.y = Math.max(sol + 0.2, e.y + dy / d * Math.min(v, d) + Math.sin(c.t * 9 + e.seed) * dt * 0.5);
    e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 8);
  },
  fuir(e, px, pz) {
    e.fuite = 3; e.peur = (e.peur || 0) + 1; e.pose = 0;
    const a = Math.atan2(e.x - px, e.z - pz) + (Math.random() - 0.5) * 1.2, d = 7 + Math.random() * 7;
    e.hx = e.x + Math.sin(a) * d; e.hz = e.z + Math.cos(a) * d; e.cible = null;
    if (e.peur > 4) { e.part = 10; e.heading = a; }
  },
  // ------------------------------------------------------------ le filet à papillons
  PRISES: { papillon_or: 'papillon_or', lucane: 'lucane', mante: 'mante' },
  cibleFilet(eye, f) {
    let best = null, bd = 2.7;
    for (const e of entities.list) {
      if (e.dead || e.hidden || e.removed || !this.PRISES[e.kind]) continue;
      const dx = e.x - eye[0], dy = e.y + 0.05 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > bd) continue;
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.82) continue;
      best = e; bd = d;
    }
    return best;
  },
  coupFilet(eye, basis) {
    const p = game.player, e = this.cibleFilet(eye, basis.f);
    play.swingT = 0.42; play.cool = 0.7;
    sound.natCri && sound.natCri('filet', 0, 1);
    if (!e) return;
    const accroupi = p.crouch > 0.5;
    const chance = e.kind === 'papillon_or' ? (e.pose > 0 ? 0.92 : accroupi ? 0.72 : 0.45) : 0.9;
    if (Math.random() >= chance) { if (e.kind === 'papillon_or') this.fuir(e, p.pos[0], p.pos[2]); return; }
    const id = this.PRISES[e.kind];
    farm.give(id, 1); play.flyer(id, [e.x, e.y, e.z], 1);
    entities.remove(e);
    if (e === this.pap) { this.pap = null; this.S().pap.pris++; }
    sound.pop && sound.pop();
  },
};
// le filet : on le fabrique (un manche et des fibres, ou du bois), ou on l'achète à la colporteuse
RECIPES.push({ out: 'filet_papillons', n: 1, need: { manche: 1, fibre: 6 }, st: null }, { out: 'filet_papillons', n: 1, need: { bois: 2, fibre: 8 }, st: null });
HAND_GROUPS[4].push('filet_papillons');
if (typeof HOTTES !== 'undefined' && HOTTES.colporteuse && !HOTTES.colporteuse.fonds.includes('filet_papillons')) HOTTES.colporteuse.fonds.push('filet_papillons');
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (!it || it.tool !== 'filet') return false;
  if (!held) nature2.coupFilet(eye, basis);
  return true;
});
HOOKS.update.push((dt) => { try { nature2.majPapillon(dt); } catch (e) { console.error(e); } });
// (rechargement d'une partie : le papillon d'une autre vie ne revient pas)
HOOKS.load.push(() => { nature2.pap = null; nature2.papT = 5; });

// les herbes des plaies : on les applique même le ventre plein, si l'on saigne
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held || !it || !it.panse || !corps.saignement()) return false;
  if (!farm.take(id, 1)) return false;
  const C = corps.C();
  C.saigne = it.panse >= 2 ? 0 : C.saigne * 0.35;
  sound.equip && sound.equip();
  play.cool = 0.8;
  return true;
});
HOOKS.load.push(() => {
  nature2.S();
  if (nature2.branche) return;
  nature2.branche = true;
  // l'icône d'un meuble fin : son modèle, dans son bois
  if (typeof ICON3D !== 'undefined' && ICON3D.boxesFor) {
    const _bf = ICON3D.boxesFor.bind(ICON3D);
    ICON3D.boxesFor = function (id) { const it = ITEMS[id]; nature2.finIcone = (it && it.fin) || null; try { return _bf(id); } finally { nature2.finIcone = null; } };
  }
});
