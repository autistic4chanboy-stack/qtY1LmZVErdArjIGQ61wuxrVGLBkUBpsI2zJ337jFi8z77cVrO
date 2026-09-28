// ============================================================================
//  VIE DES HABITANTS : histoire personnelle, questions au joueur, humeurs,
//  souvenirs, activités, conversations entre eux, foi, légendes
//  (données pures ; remplies par les fichiers 05-zzlife-a.js … d.js)
// ============================================================================
//
// NPC_LIFE.<id> = {
//   foi: 'eglise' | 'anciens' | 'aucune', devotion: 0..3, fete: 1..28 (jour de fête dans un cycle de 28 jours),
//   mythes: [ids de MYTHS], mythe_intro: [2 phrases],
//   histoire: [8 × { titre, texte, min (niveau d'amitié 0..8) }],
//   questions: [4 × { id, min, texte, reponses: [3 × { label, amitie, reaction }], rappel: [3] }],
//   humeurs: { joyeux, triste, fatigue, inquiet, agace } (3 phrases chacune),
//   souvenirs: { cadeau_adore, cadeau_deteste, aide, toque_nuit, coup, absence, victime } (2 phrases chacune),
//   tenue: { arme, pelle, potion, animal_mort, fleurs, poisson, lanterne_jour, relique, rien },
//   chez_soi: { jour, nuit },
//   activites: { travail, repas, priere, promenade, soir, pluie } (3 phrases chacune),
//   discussions: [3 × { avec, lignes: [[id, texte], …] }],
//   foi_lignes: [4], reaction_piete: { eglise, anciens, dessous }, fete_lignes: [2], secret: '',
// };
const NPC_LIFE = {};
