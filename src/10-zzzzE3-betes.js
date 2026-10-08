// ============================================================================
//  LES BÊTES DES BOIS ET DU MARAIS (agent E3) : les créatures (CREATURES).
//  « e3 » : le comportement (E3_COMPORTE, 11-zzzzE3-betes.js) ; « oiseau » :
//  la chasse les traite en oiseaux (le butin d'un coup, pas de dépouille).
//  Elles n'ont pas de point d'apparition : elles naissent autour du joueur,
//  dans leurs milieux et à leurs heures (11-zzzzE3-betes.js).
// ============================================================================
Object.assign(CREATURES, {
  // la forêt
  daim: { walk: 1.0, run: 8.0, range: 20, flee: 24, radius: 0.32, idle: [2, 7], solid: true, graze: true, rig: 'e3_daim', h: 1.45, wild: true, shy: true, e3: 'daim' },
  autour: { walk: 0, run: 0, range: 30, flee: 11, radius: 0.12, idle: [3, 8], rig: 'e3_autour', h: 0.45, wild: true, oiseau: true, e3: 'autour' },
  pic_noir: { walk: 0, run: 0, range: 30, flee: 10, radius: 0.1, idle: [3, 8], rig: 'e3_pic_noir', h: 0.32, wild: true, oiseau: true, e3: 'pic' },
  becasse: { walk: 0.25, run: 1.2, range: 5, flee: 3.2, radius: 0.08, idle: [6, 16], rig: 'e3_becasse', h: 0.2, wild: true, oiseau: true, e3: 'becasse' },
  cigogne_noire: { walk: 0.45, run: 1.6, range: 10, flee: 22, radius: 0.2, idle: [3, 9], rig: 'e3_cigogne_noire', h: 1.05, wild: true, oiseau: true, e3: 'echassier' },
  sonneur: { walk: 0.1, run: 1.0, range: 2.5, flee: 0, radius: 0.025, idle: [4, 12], hop: true, rig: 'e3_sonneur', h: 0.035, wild: true, e3: 'sonneur' },
  coronelle: { walk: 0.3, run: 0.9, range: 5, flee: 2.2, radius: 0.08, idle: [4, 12], rig: 'e3_coronelle', h: 0.07, wild: true, e3: 'coronelle' },
  capricorne: { walk: 0.03, run: 0.08, range: 0.6, flee: 0, radius: 0.02, idle: [6, 16], rig: 'e3_capricorne', h: 0.02, wild: true, e3: 'capricorne' },
  grand_mars: { walk: 0, run: 0, range: 5, flee: 0, radius: 0.03, idle: [1, 3], rig: 'e3_grand_mars', h: 0.04, wild: true, e3: 'papillon' },
  oreillard: { walk: 0, run: 0, range: 12, flee: 0, radius: 0.06, idle: [1, 3], rig: 'e3_oreillard', h: 0.1, wild: true, oiseau: true, e3: 'oreillard' },
  // le bois de bouleaux
  gelinotte: { walk: 0.45, run: 2.4, range: 8, flee: 3.8, radius: 0.1, idle: [2, 6], rig: 'e3_gelinotte', h: 0.28, wild: true, oiseau: true, e3: 'gelinotte' },
  pic_epeiche: { walk: 0, run: 0, range: 30, flee: 8, radius: 0.08, idle: [3, 8], rig: 'e3_pic_epeiche', h: 0.22, wild: true, oiseau: true, e3: 'pic' },
  bondree: { walk: 0.3, run: 1.0, range: 6, flee: 12, radius: 0.14, idle: [3, 8], rig: 'e3_bondree', h: 0.45, wild: true, oiseau: true, e3: 'rapace' },
  moyen_duc: { walk: 0, run: 0, range: 30, flee: 7, radius: 0.1, idle: [4, 10], rig: 'e3_moyen_duc', h: 0.4, wild: true, oiseau: true, e3: 'duc' },
  musaraigne: { walk: 0.5, run: 1.6, range: 3, flee: 2, radius: 0.02, idle: [0.3, 1.5], rig: 'e3_musaraigne', h: 0.04, wild: true, e3: 'musaraigne' },
  muscardin: { walk: 0.35, run: 2.2, range: 4, flee: 2.5, radius: 0.03, idle: [1, 4], rig: 'e3_muscardin', h: 0.05, wild: true, e3: 'muscardin' },
  lezard_vivipare: { walk: 0.3, run: 3.5, range: 3, flee: 2.6, radius: 0.025, idle: [5, 15], rig: 'e3_lezard_vivipare', h: 0.025, wild: true, e3: 'lezard' },
  grenouille_rousse: { walk: 0.3, run: 2.8, range: 6, flee: 2.6, radius: 0.05, idle: [1, 5], hop: true, rig: 'e3_grenouille_rousse', h: 0.07, wild: true, e3: 'grenouille' },
  morio: { walk: 0, run: 0, range: 5, flee: 0, radius: 0.03, idle: [1, 3], rig: 'e3_morio', h: 0.04, wild: true, e3: 'papillon' },
  cicindele: { walk: 0.25, run: 2.2, range: 3, flee: 0, radius: 0.015, idle: [0.5, 2.5], rig: 'e3_cicindele', h: 0.012, wild: true, e3: 'cicindele' },
  // le marais
  busard_roseaux: { walk: 0.3, run: 1.0, range: 6, flee: 14, radius: 0.14, idle: [3, 8], rig: 'e3_busard_roseaux', h: 0.45, wild: true, oiseau: true, e3: 'busard' },
  bihoreau: { walk: 0.3, run: 1.4, range: 6, flee: 9, radius: 0.16, idle: [4, 12], rig: 'e3_bihoreau', h: 0.55, wild: true, oiseau: true, e3: 'bihoreau' },
  aigrette: { walk: 0.5, run: 1.6, range: 8, flee: 15, radius: 0.15, idle: [3, 9], rig: 'e3_aigrette', h: 0.8, wild: true, oiseau: true, e3: 'echassier' },
  rale_eau: { walk: 0.35, run: 2.6, range: 4, flee: 6, radius: 0.06, idle: [2, 7], rig: 'e3_rale_eau', h: 0.2, wild: true, oiseau: true, e3: 'rale' },
  becassine: { walk: 0.3, run: 1.4, range: 5, flee: 3.2, radius: 0.06, idle: [4, 12], rig: 'e3_becassine', h: 0.15, wild: true, oiseau: true, e3: 'becassine' },
  poule_eau: { walk: 0.45, run: 2.2, range: 7, flee: 8, radius: 0.1, idle: [2, 6], rig: 'e3_poule_eau', h: 0.25, wild: true, oiseau: true, e3: 'poule_eau' },
  rainette: { walk: 0.12, run: 1.6, range: 2, flee: 0, radius: 0.02, idle: [5, 14], hop: true, rig: 'e3_rainette', h: 0.035, wild: true, e3: 'rainette' },
  sangsue: { walk: 0.12, run: 0.3, range: 3, flee: 0, radius: 0.01, idle: [1, 4], rig: 'e3_sangsue', h: 0.01, wild: true, e3: 'sangsue' },
  crossope: { walk: 0.45, run: 2.0, range: 5, flee: 3, radius: 0.025, idle: [1, 4], rig: 'e3_crossope', h: 0.045, wild: true, e3: 'crossope' },
  cuivre_marais: { walk: 0, run: 0, range: 5, flee: 0, radius: 0.025, idle: [1, 3], rig: 'e3_cuivre_marais', h: 0.03, wild: true, e3: 'papillon' },
});
