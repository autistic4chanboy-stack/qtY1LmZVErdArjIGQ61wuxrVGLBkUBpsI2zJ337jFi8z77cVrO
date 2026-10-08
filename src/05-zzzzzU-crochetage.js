// ============================================================================
//  LA COMPÉTENCE DE CROCHETAGE ET LE CAMBRIOLAGE DE NUIT (agent U, vague 14) — les données et le modèle
//  - La main progresse avec la pratique (les goupilles calées, les serrures ouvertes, un peu les échecs), avec
//    ce qu'on lit (les livres que d'autres inscrivent dans crochetage.livres, les papiers des doubles fonds) ; un
//    vieux cadenas permet de s'exercer chez soi, jusqu'à « une main sûre » seulement. Six paliers : la zone de la
//    goupille s'élargit, les goupilles courent moins vite, retombent et cassent moins, les gestes font moins de
//    bruit ; deux serrures nouvelles (la serrure à secret, la serrure de coffre) ne s'ouvrent qu'aux derniers.
//  - Le cambriolage : chaque bruit fait près d'un dormeur (goupille, raté, porte, pas, latte qui grince, meuble
//    qu'on fouille, objet qui tombe) a une PETITE chance de le réveiller ; plus grande si l'on traîne dans la
//    maison, si l'on court, si l'on est maladroit, s'il a le sommeil léger, à l'heure où l'on dort mal ; moindre
//    avec la compétence. Avant de se réveiller, souvent, il remue (le souffle change, il marmonne).
//  Ici : les tables (paliers, serrures, bruits, sommeils), les objets, les butins, les répliques, et le modèle
//  (fonctions pures, que tools/equilibrage/U.js lit aussi). Le jeu : 11-zzzzU-1-competence.js,
//  11-zzzzU-2-cambriolage.js ; les sons : 09-zzzzzU-sons.js.
// ============================================================================

// ---------------------------------------------------------------- les paliers de la main
// pts : points de pratique ; zone, vit : la ligne dorée s'élargit, la goupille court moins vite ; casse, retombe :
// chances (×) qu'un raté casse un crochet ou fasse retomber la goupille d'avant ; bruit : le bruit des gestes de la
// serrure et des fouilles ; pas : le bruit des pas ; grince : la chance de poser le pied sur la latte qui grince ;
// maladresse : la chance, à chaque fouille, de faire tomber quelque chose ; poche : ce qu'on gagne à faire les poches
// d'un dormeur (vol à la tire).
const U_PALIERS = [
  { pts: 0, nom: 'des doigts gourds', zone: 1, vit: 1, casse: 1, retombe: 1, bruit: 1, pas: 1, grince: 1, maladresse: 0.14, poche: 0 },
  { pts: 12, nom: 'des doigts d’apprenti', zone: 1.1, vit: 0.96, casse: 0.85, retombe: 0.9, bruit: 0.88, pas: 0.93, grince: 0.85, maladresse: 0.1, poche: 0.02 },
  { pts: 35, nom: 'une main sûre', zone: 1.2, vit: 0.92, casse: 0.7, retombe: 0.78, bruit: 0.76, pas: 0.86, grince: 0.7, maladresse: 0.07, poche: 0.04 },
  { pts: 80, nom: 'une main de serrurier', zone: 1.32, vit: 0.87, casse: 0.55, retombe: 0.65, bruit: 0.64, pas: 0.78, grince: 0.55, maladresse: 0.045, poche: 0.06 },
  { pts: 150, nom: 'une main de rossignol', zone: 1.46, vit: 0.82, casse: 0.42, retombe: 0.52, bruit: 0.52, pas: 0.7, grince: 0.42, maladresse: 0.025, poche: 0.08 },
  { pts: 260, nom: 'une main de velours', zone: 1.6, vit: 0.76, casse: 0.3, retombe: 0.4, bruit: 0.42, pas: 0.62, grince: 0.3, maladresse: 0.012, poche: 0.1 },
];
// la pensée qui vient en passant un palier (la première fois)
const U_PALIER_PENSEE = [
  null,
  '(Vos doigts commencent à reconnaître le moment où une goupille cède.)',
  '(Vous n’écoutez plus la serrure avec les oreilles. Avec les doigts.)',
  '(Une serrure, maintenant, vous parle avant même que vous la touchiez.)',
  '(Vos mains savent des choses que vous préféreriez ne pas savoir.)',
  '(Il n’y a plus guère de serrure, dans la vallée, qui vous tienne tête.)',
];
// une ligne vague en tête du carnet (sacoche), à partir du premier palier (jamais de chiffre)
const U_PALIER_CARNET = [
  null,
  'Vos doigts commencent à comprendre les serrures.',
  'Devant une serrure, vous avez la main sûre.',
  'Une serrure ordinaire ne vous résiste plus guère.',
  'À vous voir devant une porte, on vous croirait du métier.',
  'Vos mains ne font plus de bruit.',
];
// ce qu'on apprend : par goupille calée (× la difficulté), par serrure ouverte (× la difficulté), par échec
const U_GAINS = { goupille: 0.06, ouverte: 1.0, echec: 0.3, nuit: 3, exercice: 0.5, exerciceMax: 35, memeSerrure: 0.25 };

// ---------------------------------------------------------------- les serrures (1 à 5 : 11-zzz97 ; 6 et 7 : nouvelles)
// (les tables CROC_* de 11-zzz97 s'allongent de ces deux-ci dans 11-zzzzU-1-competence.js)
const U_SERRURES = {
  6: { pins: 7, zone: 0.07, vit: 1.3, casse: 0.3, retombe: 0.85, nom: 'une serrure à secret', palier: 3, fins: false },
  7: { pins: 8, zone: 0.062, vit: 1.4, casse: 0.34, retombe: 0.9, nom: 'une serrure de coffre, à gorges multiples', palier: 4, fins: true },
};
const U_RETOMBE = [0, 0, 0.5, 0.65, 0.8, 0.85, 0.9]; // (1 à 5 : les chances de 11-zzz97, inchangées)
// les crochets fins : la ligne un peu plus large, beaucoup moins de casse, un peu moins de bruit ; sans eux, une
// serrure à secret demande un palier de plus
const U_FINS = { zone: 1.1, casse: 0.35, bruit: 0.85 };

// ---------------------------------------------------------------- les bruits (force : 1 = un crochet qui ripe)
const U_BRUITS = {
  goupille: 0.12, rate: 1.0, casse: 0.8, ouvre: 0.3,
  porte: 0.35, claque: 0.5,
  pas: 0.15, pasAccroupi: 0.035, pasCourus: 0.8, saut: 0.9,
  grince: 0.55, grinceChance: 0.05, grinceAccroupi: 0.025,
  chute: 1.6,
  fouille: { bois: 0.22, vaisselle: 0.42, metal: 0.42, monnaie: 0.38, verre: 0.4, papier: 0.1, tissu: 0.06, eau: 0.25, farine: 0.1, grain: 0.15, pierre: 0.35, cuir: 0.1, foin: 0.12, poule: 0.6, terre: 0.2 },
  prendre: 0.12,
  poche: 0.08,
  lanterne: 0.12, // l'agitation, par seconde, d'une lanterne allumée tout près d'un visage endormi
};
// les chaussons de lisière : des pas étouffés, la latte qui grince moins souvent
const U_CHAUSSONS = { pas: 0.55, grince: 0.6 };

// ---------------------------------------------------------------- le sommeil des habitants
// (le sommeil léger : les inquiets, les méfiants, les vieux, les gardes ; lourd : les bons vivants, les costauds)
const U_SOMMEIL_LEGER = new Set(['méfiant', 'méfiante', 'inquiet', 'inquiète', 'zélé', 'peureux', 'tourmenté', 'curieuse', 'curieux', 'mystérieuse', 'inquiétant', 'secrète', 'dangereux', 'grave', 'pointilleux', 'réservée']);
const U_SOMMEIL_LOURD = new Set(['jovial', 'joviale', 'gourmand', 'bavard', 'bavarde', 'patient', 'robuste', 'bourrue', 'rieuse', 'travailleuse', 'taiseux', 'dur', 'joyeuse', 'libre', 'rêveuse']);
const U_REVEIL = {
  K: 0.055,          // chance de base : un bruit de force 1 tout contre l'oreille, un dormeur ordinaire, au plus profond
  portee: 5,         // (m) la distance où un bruit perd la moitié de sa force
  mur: 0.5,          // de l'autre côté d'un mur (du dehors au dedans)
  etage: 0.55,       // d'un étage à l'autre
  remue: 3,          // la chance qu'il remue sans se réveiller : trois fois celle du réveil
  remueK: 2,         // pendant qu'il remue, chaque bruit compte double
  agit: 0.6,         // ce qu'un bruit ajoute à son agitation (× sa force perçue)
  agitK: 1.5,        // un dormeur agité se réveille plus facilement : × (1 + 1,5 × agitation)
  calme: 0.012,      // l'agitation qui retombe, par seconde (lentement : un dormeur dérangé reste agité un bon moment)
  traine0: 10, traine: 20, traineMax: 4, // le temps passé dans la maison (secondes réelles) : rien avant 10 s, puis +1 par 20 s
  garde: 1.5,        // une maison sur ses gardes (cambriolée ces trois derniers jours, ou réveillée cette nuit)
  max: 0.9,
  // le sommeil s'use, même sans bruit : par seconde passée dans sa maison au-delà de traine0, une chance de plus en
  // plus grande qu'il ouvre les yeux (une présence ; × le sommeil léger, l'heure)
  presence: 0.0025,
};

// ---------------------------------------------------------------- le modèle (fonctions pures)
const U_MODELE = {
  // la force d'un bruit, entendue par un dormeur à dist mètres (mur : de l'autre côté d'un mur ; etage : d'un autre étage)
  force(force, dist, mur, etage) {
    const R = U_REVEIL, att = 1 / (1 + (dist / R.portee) * (dist / R.portee));
    return force * att * (mur ? R.mur : 1) * (etage ? R.etage : 1);
  },
  // la profondeur du sommeil à l'heure h, pour qui se couche à « coucher » et se lève à « lever » (heures)
  heure(h, coucher, lever) {
    const a = ((h - coucher) % 24 + 24) % 24, b = ((lever - h) % 24 + 24) % 24;
    if (b < 1.5) return 1.6;   // le petit matin : on dort mal
    if (a < 0.75) return 1.5;  // on vient de se coucher
    if (b < 3) return 1.0;
    return 0.7;                // le plein de la nuit
  },
  // le dormeur : sommeil léger ou lourd, l'âge, le métier
  sens(d) {
    if (!d) return 1;
    let k = 1;
    for (const t of d.traits || []) { if (U_SOMMEIL_LEGER.has(t)) k *= 1.35; else if (U_SOMMEIL_LOURD.has(t)) k *= 0.75; }
    if ((d.age || 30) >= 65) k *= 1.25;
    if ((d.age || 30) < 14) k *= 0.8;
    if (d.garde || d.id === 'garde') k *= 1.6;
    return Math.max(0.4, Math.min(2.6, k));
  },
  // le temps passé dans la maison (secondes réelles)
  traine(t) { const R = U_REVEIL; return Math.min(R.traineMax, 1 + Math.max(0, t - R.traine0) / R.traine); },
  // la chance, par seconde, qu'il se réveille sans bruit (on s'attarde chez lui depuis t secondes)
  presence(t, sens, heure) { const R = U_REVEIL; return R.presence * (U_MODELE.traine(t) - 1) * (sens ?? 1) * (heure ?? 1); },
  // la chance qu'un bruit le réveille, et celle qu'il remue seulement ; o : { f (force perçue), sens, heure, traine,
  // agit (0..1), remue (il remue déjà), garde (maison sur ses gardes) }
  chances(o) {
    const R = U_REVEIL;
    let p = R.K * o.f * (o.sens ?? 1) * (o.heure ?? 1) * (o.traine ?? 1) * (1 + R.agitK * (o.agit || 0)) * (o.remue ? R.remueK : 1) * (o.garde ? R.garde : 1);
    p = Math.min(R.max, p);
    return { reveil: p, remue: Math.min(0.95, p * R.remue) };
  },
  // le palier d'un nombre de points
  palier(pts) { let L = 0; for (let i = 0; i < U_PALIERS.length; i++) if ((pts || 0) >= U_PALIERS[i].pts) L = i; return L; },
  // la force d'un pas : accroupi, marchant, courant ; la main (palier), les chaussons
  pas(mode, L, chaussons) {
    const B = U_BRUITS, P = U_PALIERS[L || 0];
    const f = mode === 'court' ? B.pasCourus : mode === 'accroupi' ? B.pasAccroupi : B.pas;
    return f * P.pas * (chaussons && mode !== 'court' ? U_CHAUSSONS.pas : 1);
  },
  grince(mode, L, chaussons) {
    const B = U_BRUITS, P = U_PALIERS[L || 0];
    if (mode === 'court') return B.grinceChance * 2;
    return (mode === 'accroupi' ? B.grinceAccroupi : B.grinceChance) * P.grince * (chaussons ? U_CHAUSSONS.grince : 1);
  },
  // peut-on tenter cette serrure ? (palier, crochets fins) → null, ou la raison
  tenable(d, L, fins) {
    const S = U_SERRURES[d];
    if (!S) return null;
    const need = S.palier + (S.fins || fins ? 0 : 1);
    if (S.fins && !fins) return 'fins';
    return L >= need ? null : 'main';
  },
};

// ---------------------------------------------------------------- les objets
defItem('cadenas_exercice', 'Vieux cadenas', 'outil', 14, ['cle', '#7a6a5a'], { desc: 'Un cadenas de fer, sans clé, qu’on a laissé rouiller dans un tiroir. En main, clic : on s’y exerce, chez soi, sans rien risquer. On y apprend les débuts, pas davantage.' });
defItem('crochets_fins', 'Crochets fins', 'outil', 190, ['cle', '#d8dce4'], { desc: 'Un rouleau de cuir noir : des tiges d’acier plus fines qu’une aiguille à tricoter, une clé de tension à ressort. Glissés dans un jeu de crochets ordinaire, ils cassent rarement, et ouvrent ce que les autres n’ouvrent pas — dans une main qui sait.' });
defItem('chaussons_lisiere', 'Chaussons de lisière', 'outil', 38, ['sachet', '#3a3a40'], { desc: 'Des chaussons de lisière de drap, à semelle de feutre, qu’on enfile par-dessus ses souliers. Dans une maison, on ne s’entend plus marcher. Il suffit de les avoir dans la sacoche.' });

// ---------------------------------------------------------------- les butins des doubles fonds (tiroirs à secret)
// (ce qu'on cache au fond d'un tiroir : les économies, un bijou, la montre du père, des lettres ; on y remet un peu chaque
// semaine. Le secrétaire, l'armoire du notable : un peu plus)
Object.assign(LOOT, {
  u_double_fond: { rolls: [1, 2], items: [['argent', 12, 40, 6], ['bijou', 1, 1, 0.8], ['montre', 1, 1, 0.35], ['medaillon_portrait', 1, 1, 0.8], ['vieille_piece', 1, 2, 1.5], ['meche_cheveux', 1, 1, 0.8], ['image_pieuse', 1, 1, 0.8], ['tabatiere', 1, 1, 0.5]] },
  u_double_fond_riche: { rolls: [1, 2], items: [['argent', 30, 80, 6], ['bijou', 1, 1, 1], ['montre', 1, 1, 0.6], ['lingot_or', 1, 1, 0.08], ['vieille_piece', 1, 3, 1.5], ['medaillon_portrait', 1, 1, 0.7], ['tabatiere', 1, 1, 0.5]] },
});
// les meubles qui peuvent en avoir un, et la serrure du tiroir à secret
const U_DOUBLES_FONDS = {
  armoire: { lock: 5, table: 'u_double_fond' },
  commode: { lock: 5, table: 'u_double_fond' },
  buffet: { lock: 5, table: 'u_double_fond' },
  malle: { lock: 5, table: 'u_double_fond' },
  secretaire: { lock: 6, table: 'u_double_fond_riche' },
};
const U_DF_PART = 0.4;      // un meuble habité sur… (tiré une fois pour toutes, selon le meuble)
const U_DF_REFILL = 9;      // jours avant qu'on y ait remis de quoi
const U_DF_PALIER = 2;      // il faut « une main sûre » pour sentir le double fond

// ---------------------------------------------------------------- les répliques
// le dormeur qui remue
const U_MURMURES = [
  'Mmh…', '… non… pas maintenant…', '… qui… mmh…', '… laisse la porte…', '… il fait froid…', '… maman ?…', '… les poules… mmh…',
  '… je l’ai rangé… je l’ai rangé…', '… pas la cave…', '… demain… demain…',
];
// réveillé, il n'a rien vu (encore)
const U_REVEIL_DOUTE = ['Hein ? … Qui est là ?', 'Il y a quelqu’un ?', '… Qu’est-ce que c’était ?', 'Qui va là ?', '… J’ai entendu quelque chose.'];
// il se recouche (il n'a trouvé personne) ; [féminin, masculin] quand la phrase s'accorde
const U_RECOUCHE = ['… Le vent. Ce n’est que le vent.', ['… Je deviens folle.', '… Je deviens fou.'], 'Les souris. Encore les souris.', '… Bon.', 'Il faudra huiler cette porte.'];
// il vous voit : s'il vous reconnaît, s'il ne vous reconnaît pas ; ceux qui ne se laissent pas faire
const U_CRI_RECONNU = ['C’est vous ! {prenom} ! Chez moi, en pleine nuit ! Au voleur !', 'Je vous vois ! Je sais qui vous êtes ! Au voleur ! Au garde !', 'Vous ?! Chez moi ?! Sortez ! Au voleur !'];
const U_CRI_INCONNU = ['Au voleur ! AU VOLEUR !', 'Qui êtes-vous ?! Au secours ! Au voleur !', 'Une ombre ! Il y a quelqu’un chez moi ! Au voleur !'];
const U_CRI_BRAVE = {
  forgeron: 'Tu es entré chez moi. Tu vas en sortir, et pas par la porte.',
  chasseur: 'Ne bouge pas. Je sais où est mon fusil, et toi tu ne sais pas où je suis.',
  eleveuse: 'Un rôdeur ! Je vais te montrer, moi, comment on reçoit au ranch !',
  nain_forgeronne: 'Des pieds de surface sur mon sol ! Je vais te les casser, tes pieds !',
  estive_baile: 'Toi. Dehors. Avant que je te jette dans le ravin.',
};
const U_BRAVES = new Set(['forgeron', 'chasseur', 'eleveuse', 'nain_forgeronne', 'estive_baile', 'gendarme', 'chevalier_guet']);
// le lendemain : on s'est plaint d'une nuit où quelqu'un est entré (sans le voir) ; on a entendu du bruit
const U_PLAINTE_NUIT = [
  'Cette nuit, on est entré chez moi. Pendant que je dormais. Je ne dors plus, maintenant : j’écoute.',
  'Ce matin, la porte était fermée à clé, comme je l’avais laissée. Et pourtant il manque des choses. Vous comprenez, vous ?',
  'J’ai rêvé que quelqu’un se penchait sur mon lit. Ce matin, mon tiroir était ouvert.',
  'Quelqu’un est venu chez moi cette nuit. Je ne sais pas qui. Mais il connaissait le chemin.',
];
const U_PLAINTE_BRUIT = [
  'Il y a eu du bruit chez moi, cette nuit. J’ai fait le tour avec une chandelle. Rien. Mais je n’ai pas rêvé.',
  ['Je me suis réveillée en pleine nuit, sûre qu’il y avait quelqu’un dans la pièce. Il n’y avait personne. Je crois.', 'Je me suis réveillé en pleine nuit, sûr qu’il y avait quelqu’un dans la pièce. Il n’y avait personne. Je crois.'],
];
