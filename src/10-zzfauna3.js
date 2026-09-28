// ============================================================================
//  FAUNE (suite) : les bêtes des milieux (chamois, lièvre variable, lagopède,
//  castor, salamandre, cistude, martre, couleuvre, martin-pêcheur, grand
//  tétras, aigle royal, chocard). Déclarées ici et non dans 05-zzspecies.js :
//  CREATURES n'existe qu'à partir de 10-entities.js.
// ============================================================================
Object.assign(CREATURES, {
  chamois: { walk: 0.9, run: 7.5, range: 26, flee: 18, radius: 0.3, idle: [2, 7], solid: true, graze: true, rig: 'chamois', h: 1.1, wild: true, shy: true },
  lievre_blanc: { walk: 1.0, run: 7.5, range: 18, flee: 10, radius: 0.16, idle: [1, 5], hop: true, rig: 'lievre_blanc', h: 0.5, wild: true },
  lagopede: { walk: 0.6, run: 3.0, range: 10, flee: 6, radius: 0.12, idle: [1, 4], rig: 'lagopede', h: 0.3, wild: true, oiseau: true, flush: true },
  castor: { walk: 0.5, run: 2.8, range: 10, flee: 9, radius: 0.22, idle: [2, 7], rig: 'castor', h: 0.35, wild: true },
  salamandre: { walk: 0.25, run: 0.8, range: 4, flee: 0, radius: 0.06, idle: [3, 9], rig: 'salamandre', h: 0.08, wild: true, nuit: true },
  cistude: { walk: 0.15, run: 0.3, range: 4, flee: 0, radius: 0.12, idle: [4, 12], rig: 'cistude', h: 0.12, wild: true },
  martre: { walk: 1.0, run: 6.5, range: 20, flee: 11, radius: 0.12, idle: [1, 4], rig: 'martre', h: 0.3, wild: true, arbre: true },
  couleuvre: { walk: 0.35, run: 1.6, range: 7, flee: 3, radius: 0.1, idle: [3, 9], rig: 'couleuvre', h: 0.1, wild: true },
  martin: { walk: 0.3, run: 1.5, range: 8, flee: 8, radius: 0.08, idle: [2, 6], rig: 'martin', h: 0.18, wild: true, oiseau: true },
  tetras: { walk: 0.6, run: 3.2, range: 12, flee: 7, radius: 0.18, idle: [2, 6], rig: 'tetras', h: 0.6, wild: true, oiseau: true, flush: true },
  aigle: { fly: true, rig: 'aigle', flock: 1, soar: true },
  chocard: { fly: true, rig: 'chocard', flock: 6, crow: true },
});
Object.assign(PREY, {
  chamois: { hp: 35, drop: [['viande', 2, 3], ['cuir', 1, 1]] }, lievre_blanc: { hp: 10, drop: [['viande', 1, 1], ['fourrure', 0, 1]] },
  lagopede: { hp: 5, drop: [['viande', 1, 1], ['plume', 1, 2]] }, castor: { hp: 18, drop: [['fourrure', 1, 1], ['viande', 0, 1]] },
  salamandre: { hp: 2, drop: [['peau_salamandre', 1, 1]] }, cistude: { hp: 8, drop: [['ecaille_tortue', 1, 1]] }, martre: { hp: 12, drop: [['fourrure', 1, 1]] },
  couleuvre: { hp: 5, drop: [['mue_serpent', 1, 1]] }, martin: { hp: 3, drop: [['plume_bleue', 1, 1]] }, tetras: { hp: 10, drop: [['viande', 1, 2], ['plume_noire', 1, 2]] },
  aigle: { hp: 12, drop: [['plume_aigle', 1, 2]] }, chocard: { hp: 3, drop: [['plume_noire', 1, 1]] },
});

OBJ_TYPES.push(
  { id: 'chamoix', name: 'Chamois', cat: 'Animaux', spr: ['a_deer'], h: [1.1, 1.1], animal: 'chamois', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'lievres_blancs', name: 'Lièvre variable', cat: 'Animaux', spr: ['a_rabbit'], h: [0.5, 0.5], animal: 'lievre_blanc', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'lagopedes', name: 'Lagopède', cat: 'Animaux', spr: ['a_bird'], h: [0.3, 0.3], animal: 'lagopede', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'castors', name: 'Castor', cat: 'Animaux', spr: ['a_rabbit'], h: [0.35, 0.35], animal: 'castor', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'salamandres', name: 'Salamandre', cat: 'Animaux', spr: ['a_rabbit'], h: [0.08, 0.08], animal: 'salamandre', col: 0, sway: 0, spacing: 2, sink: 0 },
  { id: 'cistudes', name: 'Cistude', cat: 'Animaux', spr: ['a_rabbit'], h: [0.12, 0.12], animal: 'cistude', col: 0, sway: 0, spacing: 2, sink: 0 },
  { id: 'martres', name: 'Martre', cat: 'Animaux', spr: ['a_rabbit'], h: [0.3, 0.3], animal: 'martre', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'couleuvres', name: 'Couleuvre', cat: 'Animaux', spr: ['a_rabbit'], h: [0.1, 0.1], animal: 'couleuvre', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'martins', name: 'Martin-pêcheur', cat: 'Animaux', spr: ['a_bird'], h: [0.18, 0.18], animal: 'martin', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'tetras_', name: 'Grand tétras', cat: 'Animaux', spr: ['a_bird'], h: [0.6, 0.6], animal: 'tetras', col: 0, sway: 0, spacing: 3, sink: 0 },
  { id: 'aigles', name: 'Aigle royal', cat: 'Animaux', spr: ['a_bird'], h: [0.6, 0.6], animal: 'aigle', col: 0, sway: 0, spacing: 20, sink: 0 },
  { id: 'chocards', name: 'Chocards', cat: 'Animaux', spr: ['a_bird'], h: [0.3, 0.3], animal: 'chocard', col: 0, sway: 0, spacing: 10, sink: 0 },
);
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });


// ---------------------------------------------------------------- modèles (boîtes)
Object.assign(ANIMAL_RIGS, {
  chamois: () => {
    const c = rgbf('#7a5a3a'), noir = [0.1, 0.08, 0.06];
    const r = quadRig({ col: c, body: [0.32, 0.4, 0.78], bodyY: 0.74, leg: [0.08, 0.54], hoof: true, dark: noir,
      neck: [0, 0.14], neckS: [0.14, 0.34, 0.17], neckO: [0, 0.16, 0.04], headP: [0, 0.31, 0.04], head: [0.15, 0.17, 0.27], headCol: rgbf('#e6dac4'), face: TL.deerF,
      ears: [0.08, 0.04, 0.04], tail: [0.05, 0.09, 0.04] });
    const u = [];
    for (const s of [-1, 1]) {
      u.push({ name: 'bande' + s, parent: 'head', p: [s * 0.05, 0.015, 0.14], s: [0.035, 0.1, 0.27], col: noir, tex: TL.fur });
      u.push({ name: 'corne' + s, parent: 'head', p: [s * 0.035, 0.09, 0.07], s: [0.024, 0.13, 0.024], o: [0, 0.065, 0], col: noir, tex: TL.bone, r0: [-0.15, 0, 0] });
      u.push({ name: 'crochet' + s, parent: 'corne' + s, p: [0, 0.13, 0], s: [0.022, 0.06, 0.022], o: [0, 0.02, 0], col: noir, tex: TL.bone, r0: [-1.7, 0, 0] });
    }
    u.push({ name: 'raie', parent: 'body', p: [0, 0.2, 0], s: [0.06, 0.02, 0.74], col: noir, tex: TL.fur });
    return rigPlus(r, u);
  },
  lievre_blanc: () => {
    const r = scaleRig(ANIMAL_RIGS.rabbit(), 1.3);
    for (const q of r.parts) if (q.s) q.col = [0.95, 0.95, 0.93];
    return rigPlus(r, [
      { name: 'boutL', parent: 'earL', p: [0, 0.2, 0], s: [0.055, 0.04, 0.042], col: [0.1, 0.1, 0.1], tex: TL.fur },
      { name: 'boutR', parent: 'earR', p: [0, 0.2, 0], s: [0.055, 0.04, 0.042], col: [0.1, 0.1, 0.1], tex: TL.fur },
    ]);
  },
  lagopede: () => {
    const r = birdParts({ col: [0.94, 0.94, 0.92], body: [0.16, 0.15, 0.24], bodyY: 0.16, head: [0.08, 0.08, 0.09], beak: [0.025, 0.02, 0.03], beakCol: [0.1, 0.1, 0.1],
      tail: [0.08, 0.03, 0.07], tailCol: [0.12, 0.12, 0.12], leg: [0.025, 0.08], legCol: [0.95, 0.95, 0.95] });
    return rigPlus(r, [{ name: 'sourcil', parent: 'head', p: [0, 0.075, 0.02], s: [0.085, 0.015, 0.03], col: [0.85, 0.12, 0.1], tex: TL.plain }]);
  },
  castor: () => {
    const r = quadRig({ col: rgbf('#6a4a2e'), body: [0.3, 0.24, 0.56], bodyY: 0.17, leg: [0.07, 0.11], neck: [0, 0.04], head: [0.18, 0.16, 0.18], face: TL.dogF,
      snout: [0.1, 0.07, 0.06, -0.03], snoutCol: rgbf('#4a3020'), ears: [0.03, 0.03, 0.02] });
    return rigPlus(r, [
      { name: 'queue', parent: 'body', p: [0, -0.07, -0.27], s: [0.17, 0.03, 0.3], o: [0, 0, -0.15], col: rgbf('#3a3230'), tex: TL.scales },
      { name: 'dents', parent: 'snout', p: [0, -0.045, 0.061], s: [0.045, 0.035, 0.01], col: [0.95, 0.72, 0.3], tex: TL.plain },
    ]);
  },
  salamandre: () => {
    const { P, add } = rigParts();
    const noir = [0.07, 0.07, 0.07], jaune = rgbf('#f0c020');
    add('body', null, [0, 0.025, 0], [0.045, 0.03, 0.11], [0, 0, 0], noir, TL.fur);
    [[-0.012, 0.03], [0.012, -0.02], [-0.01, -0.035], [0.014, 0.012]].forEach(([x, z], k) => add('tache' + k, 'body', [x, 0.016, z], [0.015, 0.004, 0.02], [0, 0, 0], jaune, TL.plain));
    add('neck', 'body', [0, 0.005, 0.055], null);
    add('head', 'neck', [0, 0, 0], [0.04, 0.025, 0.04], [0, 0, 0.02], noir, tx(TL.fur, TL.henF));
    add('tacheT', 'head', [0, 0.013, 0.02], [0.03, 0.004, 0.015], [0, 0, 0], jaune, TL.plain);
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.028, 0, sz * 0.035], [0.012, 0.025, 0.012], [0, -0.012, 0], noir, TL.fur);
    add('queue', 'body', [0, 0, -0.055], [0.025, 0.02, 0.1], [0, 0, -0.05], noir, TL.fur);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  cistude: () => {
    const { P, add } = rigParts();
    const sh = rgbf('#3a3a2a'), sk = rgbf('#4a4a30');
    add('body', null, [0, 0.06, 0], [0.16, 0.06, 0.2], [0, 0, 0], sk, TL.scales);
    add('carapace', 'body', [0, 0.035, 0], [0.18, 0.05, 0.22], [0, 0, 0], sh, TL.scales);
    add('dome', 'body', [0, 0.07, 0], [0.13, 0.03, 0.16], [0, 0, 0], v3.scale(sh, 0.8), TL.scales);
    add('neck', 'body', [0, 0, 0.1], [0.04, 0.035, 0.05], [0, 0, 0.02], sk, TL.scales);
    add('head', 'neck', [0, 0.005, 0.04], [0.05, 0.04, 0.05], [0, 0, 0.02], sk, tx(TL.scales, TL.henF));
    for (const [n, sx, sz] of [['legFL', -1, 1], ['legFR', 1, 1], ['legBL', -1, -1], ['legBR', 1, -1]]) add(n, 'body', [sx * 0.07, -0.02, sz * 0.07], [0.04, 0.04, 0.04], [0, -0.02, 0], sk, TL.scales);
    add('queue', 'body', [0, -0.01, -0.1], [0.02, 0.02, 0.04], [0, 0, -0.02], sk, TL.scales);
    const r = new Rig(P); r.kind = 'quad'; r.cfg = {}; return r;
  },
  martre: () => {
    const r = quadRig({ col: rgbf('#5a3a24'), body: [0.14, 0.13, 0.42], bodyY: 0.145, leg: [0.05, 0.14], neck: [0, 0.04], head: [0.12, 0.11, 0.13], face: TL.foxF,
      snout: [0.06, 0.05, 0.05, -0.02], ears: [0.035, 0.04, 0.02], tail: [0.07, 0.07, 0.3] });
    return rigPlus(r, [{ name: 'bavette', parent: 'body', p: [0, -0.01, 0.2], s: [0.1, 0.09, 0.03], col: rgbf('#e8c880'), tex: TL.fur }]);
  },
  couleuvre: () => {
    const r = scaleRig(ANIMAL_RIGS.snake(), 1.3);
    for (const q of r.parts) if (q.s) q.col = q.name === 'head' ? rgbf('#2a3020') : /[02468]$/.test(q.name) ? rgbf('#4a5a3a') : rgbf('#3e4c30');
    return rigPlus(r, [{ name: 'collier', parent: 'head', p: [0, 0, -0.01], s: [0.08, 0.04, 0.025], col: rgbf('#e8d040'), tex: TL.plain }]);
  },
  martin: () => {
    const r = birdParts({ col: rgbf('#2a90d0'), body: [0.07, 0.07, 0.12], bodyY: 0.08, head: [0.06, 0.06, 0.06], headCol: rgbf('#1a70b0'), beak: [0.015, 0.015, 0.06], beakCol: [0.1, 0.1, 0.1],
      tail: [0.03, 0.01, 0.04], wingCol: rgbf('#1a6aa0'), leg: [0.01, 0.03], legCol: rgbf('#d04020') });
    return rigPlus(r, [{ name: 'ventre', parent: 'body', p: [0, -0.02, 0.01], s: [0.072, 0.035, 0.1], col: rgbf('#e87a30'), tex: TL.fur }]);
  },
  tetras: () => {
    const r = birdParts({ col: [0.12, 0.12, 0.14], body: [0.26, 0.28, 0.44], bodyY: 0.36, neck: [0.08, 0.12, 0.08], head: [0.12, 0.12, 0.14], beak: [0.04, 0.04, 0.05], beakCol: rgbf('#e8e0c8'),
      tail: [0.06, 0.04, 0.08], leg: [0.04, 0.21], legCol: [0.3, 0.28, 0.25] });
    return rigPlus(r, [
      { name: 'sourcil', parent: 'head', p: [0, 0.1, 0.03], s: [0.13, 0.025, 0.04], col: [0.85, 0.1, 0.1], tex: TL.plain },
      { name: 'eventail', parent: 'body', p: [0, 0.1, -0.22], s: [0.38, 0.34, 0.04], o: [0, 0.12, 0], col: [0.1, 0.1, 0.12], tex: TL.fur, r0: [-0.25, 0, 0] },
      { name: 'poitrail', parent: 'body', p: [0, 0.05, 0.2], s: [0.2, 0.14, 0.05], col: rgbf('#1a4a3a'), tex: TL.fur },
    ]);
  },
  aigle: () => {
    const r = scaleRig(ANIMAL_RIGS.crow(), 2.4);
    for (const q of r.parts) if (q.s) q.col = q.name === 'beak' ? rgbf('#e8c040') : q.name === 'head' ? rgbf('#b08040') : rgbf('#4a3220');
    return r;
  },
  chocard: () => {
    const r = ANIMAL_RIGS.crow();
    for (const q of r.parts) if (q.s) { if (q.name === 'beak') q.col = rgbf('#f0d020'); else if (q.name.startsWith('leg')) q.col = rgbf('#d02a20'); }
    return r;
  },
});
// l'aigle plane très haut, en larges cercles lents
{
  const _spawnFrom = entities.spawnFrom.bind(entities);
  entities.spawnFrom = function (w, o, kind) {
    const arr = _spawnFrom(w, o, kind);
    if (kind === 'aigle') for (const e of arr) { e.flyR = 40 + Math.random() * 30; e.flyH = 38 + Math.random() * 25; e.flyS = 0.07 * (Math.random() < 0.5 ? 1 : -1); }
    return arr;
  };
}
