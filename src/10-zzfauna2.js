// ============================================================================
//  FAUNE (suite) : pigeons des villes, chevaux sauvages (harde des prés)
// ============================================================================
ANIMAL_RIGS.pigeon = () => birdParts({ col: rgbf('#8a8e98'), body: [0.12, 0.12, 0.2], bodyY: 0.13, head: [0.07, 0.07, 0.08], headCol: rgbf('#6a7080'), beak: [0.02, 0.02, 0.03], beakCol: rgbf('#d8c8b0'), tail: [0.07, 0.02, 0.1], wingCol: rgbf('#7a7e88'), leg: [0.015, 0.06], legCol: rgbf('#c86a6a') });
Object.assign(CREATURES, {
  pigeon: { walk: 0.55, run: 2.2, range: 7, flee: 3.2, radius: 0.08, idle: [1, 4], rig: 'pigeon', h: 0.25, oiseau: true, city: true },
  // cheval sauvage : plus vif, erre loin ; la fuite est gérée par le dressage (11-zzhorses)
  wildhorse: { walk: 1.1, run: 8.8, range: 26, flee: 0, radius: 0.6, idle: [3, 9], call: 'horse', solid: true, graze: true, rig: 'horse', h: 2.2, wild: true },
});
PREY.pigeon = { hp: 4, drop: [['plume', 1, 1]] };
PREY.wildhorse = { hp: 80, drop: [['viande', 4, 5], ['cuir', 2, 3]] };
OBJ_TYPES.push({ id: 'pigeons', name: 'Pigeons', cat: 'Animaux', spr: ['a_bird'], h: [0.25, 0.25], animal: 'pigeon', col: 0, sway: 0, spacing: 2, sink: 0 });
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });
// les pigeons vont par petits groupes
{
  const _spawnFrom = entities.spawnFrom.bind(entities);
  entities.spawnFrom = function (w, o, kind) {
    if (kind !== 'pigeon') return _spawnFrom(w, o, kind);
    const arr = [];
    for (let k = 0; k < 4; k++) arr.push(this.make(w, 'pigeon', o.x + (Math.random() - 0.5) * 3, o.z + (Math.random() - 0.5) * 3, o, { v: k }));
    return arr;
  };
}
