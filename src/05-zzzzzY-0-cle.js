// ============================================================================
//  LA BIBLIOTHÈQUE, SECONDE PARTIE (agent Y, quatorzième vague) — les données
//  - LES RAYONS : chaque livre a sa place. En bas, dans la salle de lecture :
//    contes, chroniques, almanachs, mémoires ; à la galerie (l'étage de B1) :
//    histoire naturelle, traités, réserve, langues d'avant, cartes ; sous terre,
//    dans la salle des archives : L'ENFER, les livres qui ne sortent pas (on les
//    lit sur place, en entier, et ils ne sont pas des objets). Les livres d'avant
//    y reçoivent seulement une étiquette (Y2_ANCIENS) : rien ne change pour eux.
//  - LES LIVRES NOUVEAUX : y2Livres({ id: { titre, auteur, col, desc, rayon,
//    pages: [{ titre, texte }], … } }) les ajoute à LIVRES (05-zzz4-livres.js)
//    et en fait des objets « livre_<id> » (à emprunter au comptoir), sauf ceux de
//    l'Enfer et du livre creux. Drapeaux : enfer (ne sort pas), creux (le livre
//    creux : ne se prête pas), serrures (compte pour la compétence de crochetage
//    de U).
//    Les textes : 05-zzzzzY-1-… à 05-zzzzzY-4-….
//  - LA CLÉ DE LA GRANDE PORTE (`cle_grande_porte`, catégorie « quete », ne se
//    vend pas) : son icône (forme « y2_cle »). Elle dort dans le livre creux de
//    la galerie ; la logique est dans 11-zzzzY-bibliotheque.js.
// ============================================================================
const Y2_CLE = 'cle_grande_porte';
const Y2_CREUX = 'y_tables_mesures';
// les rayons, dans l'ordre où on les présente ; ou : la salle du bas, la galerie, les archives
const Y2_RAYONS = {
  contes: { nom: 'Contes et légendes', ou: 'bas' },
  chroniques: { nom: 'Chroniques de la vallée', ou: 'bas' },
  almanachs: { nom: 'Almanachs', ou: 'bas' },
  memoires: { nom: 'Mémoires et voyages', ou: 'bas' },
  nature: { nom: 'Histoire naturelle', ou: 'galerie' },
  traites: { nom: 'Traités et manuels', ou: 'galerie' },
  reserve: { nom: 'Réserve', ou: 'galerie' },
  langues: { nom: 'Langues d’avant', ou: 'galerie' },
  cartes: { nom: 'Cartes', ou: 'galerie' },
  enfer: { nom: 'L’Enfer', ou: 'archives' },
};
const Y2_RAYONS_ORDRE = Object.keys(Y2_RAYONS);
// les livres d'avant (05-zzz4-livres.js) : leur rayon (l'étiquette seulement)
const Y2_ANCIENS = {
  chroniques: 'chroniques', archives: 'reserve', contes: 'contes', memoires_chasseur: 'memoires', almanach_nuits: 'almanachs',
  atlas_ancien: 'cartes', les_trois: 'reserve', temple_montagne: 'reserve', maledictions: 'reserve', geants: 'reserve', peuple_bas: 'reserve',
  lexique_aelin: 'langues', lexique_aelin2: 'langues', lexique_gorrain: 'langues', lexique_gorrain2: 'langues',
};
// les livres nouveaux, dans l'ordre (rempli par y2Livres)
const Y2_LIVRES = [];
function y2Livres(o) {
  for (const id in o) {
    const L = Object.assign({ biblio: !(o[id].enfer || o[id].creux), y: 1 }, o[id]);
    LIVRES[id] = L;
    Y2_LIVRES.push(id);
    if (L.enfer || L.creux) continue;
    defItem('livre_' + id, L.titre, 'livre', 0, ['livre', L.col || '#6a2a24'], { book: id, desc: (L.desc ? L.desc + ' ' : '') + 'Un livre de la grande bibliothèque : il faudra le rendre à temps.' });
    ITEMS['livre_' + id].biblio = true;
  }
}

// ---------------------------------------------------------------- la clé
defItem(Y2_CLE, 'Clé de la Grande Porte', 'quete', 0, ['y2_cle', '#34322f', '#9a8456'], {
  desc: 'Clic : la regarder. Une clé de fer noir, longue comme l’avant-bras et lourde comme un outil. L’anneau est gravé de Hautes Lettres ; le panneton a des dents qu’aucune serrure d’ici ne connaît. Elle appartient à la grande bibliothèque.',
  unique: true,
});
// l'inscription de l'anneau (aëlin : « clé de la porte, reviens ici »)
const Y2_CLE_INSCR = 'kel na-dal , teh rhua';

// ---------------------------------------------------------------- son icône : une grande clé ancienne, l'anneau en trèfle
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (shape !== 'y2_cle') return _ip(shape, c1, c2);
    const pb = new PixelBuf(16, 16), P = rampOf(c1 || '#34322f'), Q = rampOf(c2 || '#9a8456');
    const px = (x, y, c) => pb.set(Math.round(x), Math.round(y), c);
    // l'anneau : trois lobes autour d'un jour
    for (const [cx, cy] of [[3.2, 3.2], [5.6, 2.2], [2.2, 5.6]]) for (let a = 0; a < 20; a++) { const t = a / 20 * Math.PI * 2; px(cx + Math.cos(t) * 1.6, cy + Math.sin(t) * 1.6, a < 8 ? P[3] : P[2]); }
    px(3.6, 3.6, P[1]); px(4.4, 4.4, P[1]);
    pb.set(3, 3, [0, 0, 0], 0); pb.set(5, 2, [0, 0, 0], 0); pb.set(2, 5, [0, 0, 0], 0);
    // la tige, en biais, avec une bague
    for (let i = 0; i < 8; i++) { px(5 + i, 5 + i, P[2]); px(6 + i, 5 + i, P[3]); px(5 + i, 6 + i, P[1]); }
    px(7, 7, Q[3]); px(8, 7, Q[2]); px(7, 8, Q[2]);
    // le panneton : deux dents en escalier, et une encoche
    for (const [x, y] of [[12, 14], [13, 14], [14, 14], [14, 13], [13, 15], [11, 15], [10, 14], [10, 15]]) px(x, y, P[2]);
    px(14, 12, P[3]); px(15, 13, P[1]); pb.set(12, 15, [0, 0, 0], 0);
    // la rouille et l'usure, dans les creux
    px(9, 9, Q[1]); px(12, 12, Q[1]); px(4, 6, Q[1]);
    return pb;
  };
}
