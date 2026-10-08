// ============================================================================
//  DES BÊTES À QUI L'ON PEUT PARLER (agent P) : les créatures. Elles n'ont ni
//  point d'apparition ni troupeau : chacune paraît à son endroit, à ses heures
//  (11-zzzzP-betes.js) ; bp : la bête (BP_BETES). Leur conduite et leur dessin
//  sont menés par betesParlantes (elles restent à leur place, regardent qui
//  approche, s'en vont quand on les menace) ; la chasse ne les compte pas comme
//  gibier (CHASSE_GIBIER ne les nomme pas) et on ne les dépèce pas.
// ============================================================================
Object.assign(CREATURES, {
  p_chat: { walk: 0.8, run: 5.5, range: 0, flee: 0, radius: 0.2, idle: [3, 9], rig: 'p_chat', h: 0.45, bp: 'chat' },
  p_hulotte: { walk: 0, run: 0, range: 0, flee: 0, radius: 0.16, idle: [4, 10], rig: 'p_hulotte', h: 0.45, bp: 'hulotte', oiseau: true },
  p_crapaud: { walk: 0.15, run: 0.8, range: 0, flee: 0, radius: 0.16, idle: [4, 10], rig: 'p_crapaud', h: 0.26, bp: 'crapaud' },
  p_corbeau: { walk: 0.3, run: 1.2, range: 0, flee: 0, radius: 0.18, idle: [3, 8], rig: 'p_corbeau', h: 0.45, bp: 'corbeau', oiseau: true },
  p_renarde: { walk: 1.0, run: 6.5, range: 0, flee: 0, radius: 0.25, idle: [3, 9], rig: 'p_renarde', h: 0.62, bp: 'renarde' },
  p_chevre: { walk: 0.6, run: 3.8, range: 0, flee: 0, radius: 0.35, idle: [3, 9], rig: 'p_chevre', h: 1.1, bp: 'chevre', solid: true },
  p_carpe: { walk: 0.3, run: 2.0, range: 0, flee: 0, radius: 0.3, idle: [3, 9], rig: 'p_carpe', h: 0.4, bp: 'carpe', water: true },
  p_cheval: { walk: 0.9, run: 4.5, range: 0, flee: 0, radius: 0.62, idle: [3, 9], rig: 'p_cheval', h: 2.3, bp: 'cheval', solid: true },
});
