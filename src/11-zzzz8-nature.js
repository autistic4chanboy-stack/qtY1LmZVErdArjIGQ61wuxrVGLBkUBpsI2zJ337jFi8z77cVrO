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
