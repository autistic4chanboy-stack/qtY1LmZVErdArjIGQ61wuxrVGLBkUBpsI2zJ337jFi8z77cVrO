// ============================================================================
//  FAUNE (suite) : pigeons des villes, chevaux sauvages (harde des prés)
// ============================================================================
// pigeon : gris bleuté, gorge irisée, deux barres noires sur l'aile repliée, pattes rouges (un corps d'oiseau : e1Oiseau)
ANIMAL_RIGS.pigeon = () => {
  const body = [0.11, 0.11, 0.2], head = [0.065, 0.065, 0.07];
  return e1Oiseau({
    body, bodyY: 0.13, dos: rgbf('#8a8e98'), bodyTex: TL.m19Plumes, ventre: rgbf('#9a9ea8'), ventreS: 0.6, head, headCol: rgbf('#6a7080'), beak: [0.014, 0.012, 0.022], beakCol: rgbf('#d8c8b0'),
    tail: [0.07, 0.012, 0.1], tailCol: rgbf('#6a6e78'), wing: [0.27, 0.012, 0.11], wingCol: rgbf('#7a7e88'), wingTip: rgbf('#2a2c32'), pliCol: rgbf('#7a7e88'),
    leg: [0.012, 0.045], legCol: rgbf('#c86a6a'), batF: 15, batA: 0.85,
    plus: [{ name: 'gorge', parent: 'body', p: [0, body[1] * 0.25, body[2] * 0.4], s: [body[0] * 0.9, body[1] * 0.5, 0.05], o: [0, 0, 0], col: rgbf('#5a7a6a'), tex: TL.m19Plumes },
      { name: 'barreL', parent: 'pliL', p: [-0.003, 0, -0.01], s: [0.004, body[1] * 0.5, 0.015], o: [0, 0, 0], col: [0.12, 0.12, 0.14], tex: TL.plain },
      { name: 'barreL2', parent: 'pliL', p: [-0.003, 0, -0.045], s: [0.004, body[1] * 0.5, 0.015], o: [0, 0, 0], col: [0.12, 0.12, 0.14], tex: TL.plain },
      { name: 'barreR', parent: 'pliR', p: [0.003, 0, -0.01], s: [0.004, body[1] * 0.5, 0.015], o: [0, 0, 0], col: [0.12, 0.12, 0.14], tex: TL.plain },
      { name: 'barreR2', parent: 'pliR', p: [0.003, 0, -0.045], s: [0.004, body[1] * 0.5, 0.015], o: [0, 0, 0], col: [0.12, 0.12, 0.14], tex: TL.plain },
      ...e1Yeux(head, [0.9, 0.5, 0.2], 0.9, 0.6, 0.6)],
  });
};
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
