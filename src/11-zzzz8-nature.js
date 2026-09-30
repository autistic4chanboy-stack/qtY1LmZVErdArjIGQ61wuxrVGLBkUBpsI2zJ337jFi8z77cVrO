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
// la souche d'un arbre abattu donne le bois de cet arbre (les souches d'origine : des bûches)
{
  const _collect = play.collect.bind(play);
  play.collect = function (o, idx, H, p) {
    if (o && o.fromStump !== undefined && H && H.drop) {
      const w = game.world, src = w && w.objects[o.fromStump], T = src && OBJ_TYPES[src.t], bois = T && NAT_BOIS_DE[T.id];
      if (bois) H = Object.assign({}, H, { drop: H.drop.map((d) => (d[0] === 'bois' ? [bois].concat(d.slice(1)) : d)) });
    }
    return _collect(o, idx, H, p);
  };
}
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
//  LE MODULE
// ============================================================================
const nature2 = {
  S() {
    const s = farm.s;
    if (!s) return null;
    const N = s.nature2 && typeof s.nature2 === 'object' ? s.nature2 : (s.nature2 = {});
    if (!N.v) N.v = 1;
    return N;
  },
};

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
