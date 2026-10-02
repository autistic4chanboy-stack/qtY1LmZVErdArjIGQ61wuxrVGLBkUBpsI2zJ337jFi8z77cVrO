// ============================================================================
//  LES BÊTES DES PRÉS, DE LA FERME ET DE LA VILLE (agent E1) : les réglages
//  des créatures. Toutes marchent (même celles qui volent : leur vol est
//  conduit par 11-zzzzE1-betes.js, conduite « e1 ») ; « oiseau » : abattue,
//  elle ne laisse pas de dépouille (la chasse donne ses plumes tout de suite).
//  ombre : rayon de l'ombre (dessinée seulement quand la bête touche le sol).
// ============================================================================
{
  const B = (rig, h, radius, ombre, plus) => Object.assign({ walk: 0.4, run: 2, range: 6, flee: 0, radius, idle: [2, 6], rig: 'e1_' + rig, h, wild: true, e1: rig, ombre }, plus || {});
  Object.assign(CREATURES, {
    // les prés
    crecerelle: B('crecerelle', 0.3, 0.12, 0.1, { oiseau: true }), buse: B('buse', 0.48, 0.2, 0.16, { oiseau: true }),
    caille: B('caille', 0.14, 0.06, 0.05, { oiseau: true, walk: 0.35, run: 1.5 }), vanneau: B('vanneau', 0.3, 0.1, 0.08, { oiseau: true, walk: 0.4, run: 1.4 }),
    outarde: B('outarde', 0.55, 0.16, 0.13, { oiseau: true, walk: 0.5, run: 3.2 }), belette: B('belette', 0.08, 0.05, 0.05, { walk: 0.8, run: 5.5 }),
    campagnol_champs: B('campagnol_champs', 0.05, 0.03, 0.03, { walk: 0.3, run: 2.2 }), hanneton: B('hanneton', 0.03, 0.02, 0.02, { walk: 0.02, run: 0.05 }),
    sauterelle: B('sauterelle', 0.03, 0.02, 0.02, { walk: 0.03, run: 0.1 }), machaon: B('machaon', 0.04, 0.03, 0.025),
    // la ferme
    cheveche: B('cheveche', 0.26, 0.08, 0.07, { oiseau: true }), putois: B('putois', 0.16, 0.08, 0.08, { walk: 0.6, run: 4.2 }),
    lerot: B('lerot', 0.09, 0.05, 0.04, { walk: 0.5, run: 3.5 }), rat_noir: B('rat_noir', 0.09, 0.05, 0.04, { walk: 0.6, run: 3.8 }),
    bergeronnette: B('bergeronnette', 0.15, 0.05, 0.04, { oiseau: true, walk: 0.9, run: 2.2 }), etourneau: B('etourneau', 0.16, 0.06, 0.04, { oiseau: true, walk: 0.5, run: 1.6 }),
    esculape: B('esculape', 0.05, 0.06, 0.06, { walk: 0.25, run: 1.2 }), frelon: B('frelon', 0.03, 0.02, 0.02),
    grillon_foyer: B('grillon_foyer', 0.02, 0.015, 0.015), epeire: B('epeire', 0.03, 0.02, 0.02),
    // la ville
    hirondelle_f: B('hirondelle_f', 0.1, 0.05, 0.04, { oiseau: true }), choucas: B('choucas', 0.26, 0.1, 0.07, { oiseau: true, walk: 0.5, run: 1.6 }),
    freux: B('freux', 0.34, 0.12, 0.09, { oiseau: true, walk: 0.45, run: 1.5 }), pelerin: B('pelerin', 0.42, 0.15, 0.12, { oiseau: true }),
    petit_duc: B('petit_duc', 0.2, 0.06, 0.05, { oiseau: true }), surmulot: B('surmulot', 0.11, 0.07, 0.06, { walk: 0.6, run: 3.6 }),
    fouine: B('fouine', 0.18, 0.09, 0.08, { walk: 0.8, run: 5 }), alyte: B('alyte', 0.04, 0.03, 0.025, { walk: 0.05, run: 0.25 }),
    grand_paon: B('grand_paon', 0.05, 0.05, 0.03), escargot: B('escargot', 0.04, 0.03, 0.025, { walk: 0.006, run: 0.006 }),
  });
}
