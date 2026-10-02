// ============================================================================
//  DIX PLANTES NOUVELLES PAR BIOME : la forêt, le bois de bouleaux, le marais,
//  le bord du lac (agent D2, douzième vague) — le jeu.
//  Données : 05-zzzzzD2-plantes.js (D2_PLANTES) ; sprites et icônes :
//  03-zzzzD2-plantes.js.
//  - les types du décor, ajoutés APRÈS tous les autres (les numéros des types
//    d'avant ne bougent pas) ;
//  - ce que fait chaque plante mangée (ALIMENTS_EFFETS), et quatre effets à
//    elles : le paxille qu'on mange cent fois sans mal, puis plus jamais ; le
//    rire de l'œnanthe ; les os de verre de la narthécie ; le souffle de la
//    lobélie ;
//  - ce qu'en dit l'alchimiste quand on les lui montre, qui les achète, les
//    recettes (pâte de guimauve, chandelles de jonc, lait caillé à la grassette),
//    les butins ;
//  - LA PASSE DE GÉNÉRATION (d2Peupler) : après tout le reste, son propre tirage ;
//    chaque plante dans son milieu (sous-bois, pied des chênes, bois mort, bois
//    de bouleaux, abords des mares, rives, eau peu profonde, eau libre du lac).
//  État : farm.s.d2 = { v, pax, paxSeuil }
//  API : d2 (S(), peupler = d2Peupler)
// ============================================================================

// ---------------------------------------------------------------- les types du décor (après tous les autres)
for (const P of D2_PLANTES) {
  const grand = P.h[1] > 1.1, eau = P.pl === 'eau';
  OBJ_TYPES.push({ id: P.o, name: P.nom, cat: P.cat, spr: ['d2_' + P.o], h: P.h, col: 0, sway: P.cat === 'Champignons' || eau || P.o === 'amadouvier' ? 0 : P.o === 'lierre' ? 0.05 : grand ? 0.1 : 0.15, spacing: grand ? 1.6 : 0.9, sink: eau ? 0 : 0.04 });
}
OBJ_TYPES.forEach((t, i) => { OBJ_INDEX[t.id] = i; });

// ---------------------------------------------------------------- l'état
const d2 = {
  S() {
    const s = farm.s;
    if (!s) return null;
    const D = s.d2 && typeof s.d2 === 'object' ? s.d2 : (s.d2 = {});
    if (!D.v) D.v = 1;
    if (!(D.pax >= 0)) D.pax = 0;
    if (!(D.paxSeuil > 0)) D.paxSeuil = 3 + Math.floor(Math.random() * 4); // le paxille : combien de fois sans mal
    return D;
  },
};

// ---------------------------------------------------------------- les effets à elles
Object.assign(EFFETS, {
  // le paxille enroulé : rien, des fois et des fois ; puis le corps se retourne contre lui, et chaque fois davantage
  d2_paxille: {
    instant: true,
    start() {
      const D = d2.S();
      if (!D) return;
      D.pax++;
      if (D.pax <= D.paxSeuil || BUFF.on('antidote')) return;
      const c = 'le paxille enroulé', k = D.pax > D.paxSeuil + 1 ? 3 : 2;
      effets.declencher('coliques', { delai: 40 + Math.random() * 60, k: 2, src: 'paxille', cause: c });
      effets.declencher('fievre', { delai: 70 + Math.random() * 80, k: 1, src: 'paxille', cause: c });
      effets.declencher('poison', { delai: 90 + Math.random() * 120, k, duree: 120 + Math.random() * 60, src: 'paxille', cause: c });
    },
  },
  // l'œnanthe : le visage se tord, le corps se raidit, comme un rire
  d2_rire: {
    dur: [25, 50],
    debut: ['(Votre visage se tord malgré vous.)'],
    tick(A, dt) {
      const p = game.player;
      p.mods.speed *= 0.65;
      A.T.s = (A.T.s ?? 1 + Math.random() * 2) - dt;
      if (A.T.s <= 0) { A.T.s = 2.5 + Math.random() * 3; game.shakeT = Math.max(game.shakeT || 0, 0.35); }
    },
    fx(A, fx, tint) { fx[0] = Math.max(fx[0], 0.18); teinte(tint, [0.5, 0.45, 0.35], 0.05); },
  },
  // la narthécie, le brise-os : un long moment, la moindre chute casse quelque chose (rien ne le dit)
  d2_os_fragiles: { dur: [400, 700] },
  // la lobélie : la poitrine s'ouvre ; on tient longtemps sous l'eau
  d2_souffle: { dur: [90, 180], buff: 'apnee' },
});
// les os de verre : une chute compte comme si l'on tombait de plus haut
{
  const _chute = corps.chute.bind(corps);
  corps.chute = function (v) {
    try { if (v > 7 && typeof effets !== 'undefined' && effets.actif('d2_os_fragiles')) v += 3.2; } catch (e) { console.error(e); }
    return _chute(v);
  };
}

// ---------------------------------------------------------------- ce que fait chaque plante, mangée ou mâchée
// [effet, probabilité, délai min (s), délai max (s), intensité, durée min (s), durée max (s)] ; c : cause de la mort
Object.assign(ALIMENTS_EFFETS, {
  // ---- la forêt
  lierre: { c: 'les baies de lierre', r: [['nausee', 0.6, 20, 90], ['vomir', 0.35, 40, 120], ['coliques', 0.2, 60, 180]] },
  oreille_judas: { r: [['remede', 0.4, 5, 20], ['calme', 0.1, 10, 40]] },
  sanicle: { r: [['sang_arrete', 0.9, 0, 0, 1], ['soin', 0.35, 5, 20]] },
  gouet: { c: 'le gouet', r: [['pique', 0.95, 0, 0], ['nausee', 0.6, 10, 60], ['vomir', 0.3, 30, 120], ['coliques', 0.3, 60, 180]] },
  fragon: { r: [['remede', 0.5, 5, 20], ['coliques', 0.12, 60, 180]] },
  langue_boeuf: { r: [['force', 0.1, 20, 60], ['nausee', 0.05, 30, 90]] },
  martagon: { r: [['vigueur', 0.15, 10, 40], ['chanceux', 0.08, 0, 10, 1, 120, 200]] },
  oronge: { r: [['vigueur', 0.3, 10, 40, 1, 120, 220], ['force', 0.12, 20, 60]] },
  sabot_venus: { r: [['calme', 0.6, 10, 40], ['somnolence', 0.25, 30, 90]] },
  gui_chene: { c: 'les baies de gui', r: [['calme', 0.6, 10, 40, 2], ['chanceux', 0.3, 0, 10, 1, 200, 300], ['nausee', 0.35, 20, 90], ['vomir', 0.15, 30, 120]] },
  // ---- le bois de bouleaux
  amadou: { r: [['sang_arrete', 0.95, 0, 0, 2], ['nausee', 0.2, 20, 60]] },
  bolet_rude: { r: [['vigueur', 0.08, 20, 60], ['coliques', 0.05, 60, 180]] },
  paxille: { c: 'le paxille enroulé', r: [['d2_paxille', 1, 0, 0], ['nausee', 0.08, 30, 90]] },
  tormentille: { r: [['remede', 0.8, 5, 20], ['sang_arrete', 0.5, 0, 0, 1]] },
  germandree: { r: [['vigueur', 0.25, 10, 40], ['remede', 0.3, 5, 20]] },
  verge_or: { r: [['soin', 0.3, 5, 20], ['remede', 0.4, 5, 20]] },
  lactaire: { c: 'un lactaire à toison', r: [['pique', 0.9, 0, 0], ['coliques', 0.8, 30, 120, 2], ['vomir', 0.6, 40, 150], ['nausee', 0.7, 20, 90]] },
  pyrole: { r: [['sang_arrete', 0.6, 0, 0, 1], ['soin', 0.4, 5, 20]] },
  trientale: { r: [['chanceux', 0.5, 0, 10, 1, 150, 260], ['calme', 0.2, 10, 40]] },
  linnee: { r: [['reve', 0.7, 0, 20, 1, 200, 300], ['calme', 0.4, 10, 40]] },
  // ---- le marais
  jonc: { r: [['nausee', 0.05, 30, 90]] },
  lycope: { r: [['calme', 0.5, 10, 40], ['remede', 0.3, 5, 20]] },
  lysimaque: { r: [['calme', 0.5, 10, 40], ['sang_arrete', 0.4, 0, 0, 1]] },
  pediculaire: { c: 'la pédiculaire', r: [['nausee', 0.6, 20, 90], ['coliques', 0.3, 60, 180]] },
  gratiole: { c: 'la gratiole', r: [['vomir', 0.85, 20, 90, 2], ['coliques', 0.85, 30, 120, 2], ['poison', 0.3, 60, 180, 1]] },
  grassette: { r: [['remede', 0.3, 5, 20], ['nausee', 0.1, 30, 90]] },
  canneberge: { r: [['vigueur', 0.12, 10, 40], ['remede', 0.2, 5, 20]] },
  oenanthe: { c: 'l’œnanthe safranée', r: [['d2_rire', 0.85, 15, 60, 1, 30, 60], ['poison', 0.95, 20, 90, 3, 150, 220], ['paralysie', 0.5, 40, 110, 1, 6, 12], ['panique', 0.5, 10, 50, 2]] },
  narthecie: { c: 'la narthécie', r: [['d2_os_fragiles', 0.9, 5, 20], ['nausee', 0.3, 20, 90]] },
  oeil_bouc: { r: [['sangfroid', 0.5, 5, 20, 1, 150, 260], ['voyance', 0.3, 10, 40, 1, 90, 180]] },
  // ---- le bord du lac
  scirpe: { r: [['vigueur', 0.05, 10, 40]] },
  plantain_eau: { c: 'le plantain d’eau', r: [['pique', 0.8, 0, 0], ['nausee', 0.4, 20, 90]] },
  eupatoire: { r: [['remede', 0.5, 5, 20], ['coliques', 0.15, 60, 180]] },
  nuphar: { r: [['calme', 0.4, 10, 40], ['somnolence', 0.2, 30, 90]] },
  scrofulaire: { r: [['sang_arrete', 0.6, 0, 0, 1], ['nausee', 0.15, 20, 90]] },
  guimauve_off: { r: [['remede', 0.7, 5, 20], ['calme', 0.2, 10, 40]] },
  macre: { r: [['force', 0.08, 20, 60], ['coliques', 0.15, 60, 180]] },
  acore: { r: [['chaleur', 0.5, 5, 20, 1, 90, 180], ['remede', 0.4, 5, 20], ['vigueur', 0.2, 10, 40]] },
  fritillaire: { c: 'le bulbe de fritillaire', r: [['nausee', 0.6, 20, 90], ['vomir', 0.35, 40, 120], ['paralysie', 0.15, 60, 150, 1, 4, 8]] },
  lobelie: { c: 'la lobélie', r: [['vomir', 0.6, 20, 90], ['d2_souffle', 0.7, 5, 20], ['nausee', 0.5, 10, 60]] },
  // ---- ce qu'on en fait
  pate_guimauve: { r: [['remede', 0.6, 5, 20], ['calme', 0.3, 10, 40]] },
});

// ---------------------------------------------------------------- ce que dit l'alchimiste quand on les lui montre
Object.assign(alchimie.REM, {
  oreille_judas: 'Une oreille-de-Judas. Elle pousse sur le sureau, l’arbre où il s’est pendu, dit-on. Elle écoute. Cuite dans du lait, elle soigne la gorge ; elle n’a aucun goût, ce qui vaut mieux.',
  sanicle: 'De la sanicle. « Qui a la bugle et la sanicle fait au chirurgien la nique. » Le chirurgien n’a jamais trouvé ça drôle. Sur une plaie, elle arrête le sang.',
  gouet: 'Du gouet, le pied-de-veau. Ne le goûtez pas : c’est comme mâcher du verre pilé. Les enfants mangent ses baies rouges une fois. Une seule.',
  fragon: 'Du fragon, le petit-houx. Les bouchers en font des balais, les apothicaires des tisanes. Je préfère les apothicaires, mais les bouchers sont plus propres.',
  langue_boeuf: 'Une langue-de-bœuf ! Coupez-la : elle saigne. Elle se mange crue, en salade. Oui, je sais. Mangez-la quand même.',
  martagon: 'Un lis martagon. Le bulbe est jaune d’or : mes prédécesseurs ont cru qu’il changeait le plomb en or. Ils ont surtout changé leur or en bulbes.',
  oronge: 'Une oronge vraie. La reine des champignons. Les empereurs en mangeaient. L’un d’eux en est mort, mais ce n’était pas la faute de l’oronge. Ne la confondez jamais avec sa cousine.',
  sabot_venus: 'Un sabot-de-Vénus… Vous l’avez cueilli. Il y a des messieurs, en ville, qui paieraient cher pour savoir où. Ne leur dites pas.',
  gui_chene: 'Du gui… sur un chêne ? Montrez. Oui. Du gui de chêne. Les druides le coupaient à la serpe d’or et en faisaient tout un sabbat. Je ne l’avais jamais tenu. Gardez-le au sec, et ne mangez pas les baies.',
  bolet_rude: 'Un bolet rude. Le cèpe des pauvres, et le pauvre ne s’en plaint pas. Faites-le sécher.',
  paxille: 'Un paxille enroulé. On en mange partout dans l’Est. Mon maître disait que le corps s’en lasse, un jour, et qu’il le fait payer. Il est mort dans son lit, mon maître. Mais il n’en mangeait plus.',
  tormentille: 'De la tormentille. Cassez la racine : rouge, comme une plaie. Contre les flux de ventre, il n’y a pas mieux.',
  germandree: 'De la germandrée, la sauge des bois. Les brasseurs du Nord en mettent dans leur bière. Ça explique la bière du Nord.',
  verge_or: 'De la verge d’or. Une herbe à plaies, et une teinture pour la laine. Une plante qui sert à deux choses, c’est rare. Chez les gens aussi.',
  lactaire: 'Un lactaire à toison. Goûtez le lait, du bout de la langue. Voilà : maintenant vous savez. Crachez.',
  pyrole: 'De la pyrole ! Elle reste verte sous la neige. Pilée, sur une plaie, elle la ferme. On ne la trouve plus guère.',
  trientale: 'Une trientale. Sept pétales. Comptez. Les bergers ne la cueillaient pas, pour ne pas froisser la chance. Vous, vous l’avez cueillie.',
  linnee: 'Mon Dieu. Une linnée. La fleur de Linné. Je n’en avais vu qu’en gravure. Deux clochettes, toujours deux, comme deux sœurs. Où l’avez-vous… non. Ne me le dites pas. Je n’y résisterais pas.',
  lycope: 'Du lycope, le chanvre d’eau. Les Bohémiens s’en noircissent la peau, dit-on. Moi, je m’en sers pour le cœur, quand il cogne trop.',
  lysimaque: 'De la lysimaque. On en mettait au joug des bœufs pour qu’ils ne se battent plus. Je devrais en mettre sur le comptoir de l’auberge.',
  pediculaire: 'De la pédiculaire, l’herbe aux poux. Les bêtes qui en mangent attrapent des poux, disent les bergers ; pilée, elle les chasse. Les bergers ne sont jamais d’accord avec eux-mêmes.',
  gratiole: 'De la gratiole. L’herbe au pauvre homme. Elle purge le pauvre de tout, et souvent de la vie. Ne la donnez à personne.',
  grassette: 'De la grassette. Elle mange les moucherons, voyez. Mettez-en une feuille dans le lait : il caillera sans feu. C’est ce que font les bergers du Nord.',
  canneberge: 'Des canneberges. Acides comme une belle-mère. Elles se gardent tout l’hiver, et les marins les emportent contre le scorbut.',
  oenanthe: 'Lâchez ça. Tout de suite. De l’œnanthe safranée. Une racine, une seule, et l’on meurt en riant. Lavez-vous les mains, et ne vous touchez pas la bouche avant ce soir.',
  narthecie: 'De la narthécie, le brise-os. Les bergers jurent que leurs brebis se cassent les pattes après en avoir brouté. Je n’y crois pas. Ne sautez pas de haut, quand même.',
  oeil_bouc: 'Une saxifrage œil-de-bouc ! On n’en voit plus. Mon maître en avait une, séchée, dans un livre qu’il ne prêtait pas. Il disait qu’elle pousse là où le bouc a dansé. Je préfère ne pas savoir où vous étiez.',
  plantain_eau: 'Du plantain d’eau. On a cru qu’il guérissait la rage. Les chiens enragés ne sont pas venus le confirmer.',
  eupatoire: 'De l’eupatoire. Les papillons l’adorent ; les intestins aussi, mais pas de la même façon.',
  nuphar: 'Un nénuphar jaune. Sentez la fleur : l’eau-de-vie. On l’appelle la chopine, au bord des étangs. C’est la seule chopine qui fasse dormir sans faire chanter.',
  scrofulaire: 'De la scrofulaire, l’herbe du siège. Les assiégés de La Rochelle en ont vécu. Elle sent mauvais : c’est le prix.',
  guimauve_off: 'De la guimauve, la vraie. La racine, cuite avec du miel et un blanc d’œuf, donne la pâte que les apothicaires vendent si cher. Faites-la vous-même.',
  macre: 'Une châtaigne d’eau. Regardez ces cornes : une petite tête de diable. Bouillie, elle se mange comme une châtaigne. Sèche, on la garde dans sa poche, pour la chance. Les deux se font.',
  acore: 'De l’acore. Sentez : la mandarine, la cannelle. Il vient d’Orient, et il a trouvé notre lac à son goût. Mâchez la racine si vous avez froid à l’estomac.',
  fritillaire: 'Une fritillaire. Le damier, la fleur de deuil : elle baisse la tête. Le bulbe est un poison. La fleur, on la pose sur les tombes.',
  lobelie: 'Une lobélie de Dortmann. Elle vit sous l’eau, et ne sort que la tête. Ses cousines d’Amérique ouvrent la poitrine des asthmatiques. Après les avoir fait vomir, bien sûr.',
});

// ---------------------------------------------------------------- qui les achète
{
  const S = (id) => { const d = NPC_DATA.find((x) => x.id === id); return d && d.shop ? d.shop : null; };
  const ajoute = (id, L) => { const s = S(id); if (s) { s.buys = s.buys || []; for (const k of L) if (ITEMS[k] && !s.buys.includes(k)) s.buys.push(k); } };
  ajoute('guerisseuse', ['sanicle', 'oreille_judas', 'lierre', 'tormentille', 'germandree', 'verge_or', 'pyrole', 'lycope', 'lysimaque', 'grassette', 'canneberge', 'eupatoire', 'scrofulaire', 'guimauve_off', 'pate_guimauve', 'amadou', 'plantain_eau']);
  ajoute('alchimiste', ['gouet', 'fragon', 'martagon', 'gui_chene', 'sabot_venus', 'lactaire', 'paxille', 'trientale', 'linnee', 'gratiole', 'pediculaire', 'oenanthe', 'narthecie', 'oeil_bouc', 'acore', 'fritillaire', 'lobelie', 'nuphar']);
  ajoute('aubergiste', ['langue_boeuf', 'oronge', 'bolet_rude', 'canneberge', 'macre', 'pate_guimauve']);
  ajoute('maire', ['sabot_venus', 'linnee', 'oeil_bouc', 'trientale', 'gui_chene']);
  ajoute('planches_vanniere', ['jonc', 'scirpe']);
  ajoute('chasseur', ['amadou']);
  // l'alchimiste aime qu'on lui montre les plus rares (il en garde un brin)
  const A = NPC_DATA.find((x) => x.id === 'alchimiste');
  if (A) { A.likes = A.likes || []; for (const k of ['martagon', 'gui_chene', 'oeil_bouc', 'linnee', 'trientale']) if (!A.likes.includes(k)) A.likes.push(k); }
}

// ---------------------------------------------------------------- recettes
defItem('lait_caille', 'Lait caillé', 'nourriture', 23, ['bol', '#f4f0e4'], { food: 16, heal: 4, desc: 'Du lait pris en une nuit, sans feu, par une feuille de grassette, comme dans le Nord. Ça se mange à la cuillère, avec un peu de miel.' });
RECIPES.push(
  { out: 'pate_guimauve', n: 2, need: { guimauve_off: 2, miel: 1, oeuf: 1 }, st: 'feu' },
  { out: 'bougie', n: 2, need: { jonc: 3, cire: 1 }, st: null },
  { out: 'lait_caille', n: 1, need: { lait: 1, grassette: 1 }, st: null },
);
ALIMENTS_EFFETS.lait_caille = { r: [['calme', 0.2, 10, 40]] };
if (typeof LIVRES !== 'undefined' && LIVRES.manuel_cuisine) for (const id of ['pate_guimauve', 'lait_caille']) if (!LIVRES.manuel_cuisine.recettes.includes(id)) LIVRES.manuel_cuisine.recettes.push(id);
{
  const d = NPC_DATA.find((x) => x.id === 'aubergiste');
  if (d && d.shop) { d.shop.buys = d.shop.buys || []; if (!d.shop.buys.includes('lait_caille')) d.shop.buys.push('lait_caille'); }
}

// ---------------------------------------------------------------- les butins : ce qu'on trouve dans les sacs, les tiroirs, les cabanes
{
  const met = (k, L) => { if (LOOT[k]) for (const e of L) if (ITEMS[e[0]] && !LOOT[k].items.some((x) => x[0] === e[0])) LOOT[k].items.push(e); };
  met('marais', [['canneberge', 1, 3, 2], ['jonc', 2, 4, 1.5]]);
  met('f2_apothicaire', [['pate_guimauve', 1, 2, 1], ['guimauve_off', 1, 1, 0.8], ['amadou', 1, 1, 0.6], ['acore', 1, 1, 0.4]]);
  met('c2_bucheron', [['amadou', 1, 2, 1.5]]);
  met('c2_charbonnier', [['amadou', 1, 2, 1.5]]);
  met('c2_pecheur', [['macre', 1, 3, 1]]);
  met('campement', [['amadou', 1, 1, 1]]);
}

// ============================================================================
//  LA PASSE DE GÉNÉRATION : chaque plante dans son milieu, après tout le reste
// ============================================================================
// Touffes par rareté (commune … introuvable) et pieds par touffe ; les milieux sont échantillonnés tous les 16 m (le
// marais, petit, tous les 4 m). On ne pose jamais sur un chemin, dans une ville ou un lieu-dit, sur un objet posé, devant
// une interaction ni trop près d'une autre plante. Les plantes d'eau flottent ou ont les pieds dans l'eau du lac.
const D2_GEN = { PER: [20, 12, 6, 3, 2], PIEDS: [[2, 4], [2, 3], [1, 2], [1, 2], [1, 1]], MIL: { foret: 1, bouleaux: 0.85, marais: 0.6, lac: 0.75 } };
function d2Peupler(w, seed) {
  if (!w || !w.biome || !w.objects || typeof milieuAt !== 'function') return 0;
  const rnd = mulberry32(((seed | 0) ^ 0x44325031) >>> 0), WL = w.waterLevel, S = w.size, BW = w.biomeW;
  const B = new Builder(w, rnd, new Uint8Array(1));
  const n0 = w.objects.length;
  let n = 0;
  const bAt = (x, z) => BIOMES[w.biome[clamp(Math.floor(z / 8), 0, BW - 1) * BW + clamp(Math.floor(x / 8), 0, BW - 1)]];
  // ce qu'il faut éviter : villes et zones protégées, lieux-dits (le marais, le lac, la forêt eux-mêmes : seulement leur
  // cœur), objets posés, interactions
  const zones = (w.noBuild || []).map((P) => [P.x, P.z, P.r + 4]);
  for (const k in w.lm || {}) { const L = w.lm[k]; if (L && !L.under) zones.push([L.x, L.z, /^(marais|lac|foret|bouleaux|combe)$/.test(k) ? 10 : Math.min(L.r || 10, 40) * 0.8 + 3]); }
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
  const ajoute = (x, z, o) => { const k = cleO(x, z); if (!tous.has(k)) tous.set(k, []); tous.get(k).push(x, z, o); };
  for (let i = 0; i < n0; i++) { const o = w.objects[i]; if (o && !o.gone && !o.cleared) ajoute(o.x, o.z, o); }
  const voisin = (x, z, r, sauf) => {
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const L = tous.get((((x / CO) | 0) + dx) * 4096 + ((z / CO) | 0) + dz);
      if (L) for (let i = 0; i < L.length; i += 3) if (L[i + 2] !== sauf && Math.hypot(L[i] - x, L[i + 1] - z) < r) return true;
    }
    return false;
  };
  // o : { pres (m), pente (vrai : pentes permises), eau : [min, max] (hauteur relative à l'eau), sauf : l'arbre hôte }
  const libre = (x, z, o) => {
    o = o || {};
    if (!w.inside(x, z, 20)) return false;
    const h = w.heightAt(x, z) - WL;
    if (o.eau ? h < o.eau[0] || h > o.eau[1] : h < 0.05) return false;
    for (const [zx, zz, zr] of zones) if (Math.abs(x - zx) < zr && Math.abs(z - zz) < zr && Math.hypot(x - zx, z - zz) < zr) return false;
    if (pres(x, z, 2)) return false;
    const i = Math.round(x / w.cell), j = Math.round(z / w.cell), m = w.mats[j * w.W + i];
    if (m === M_DIRT || m === M_COBBLE || m === M_ICE) return false;
    if (!o.pente && w.normalAt(x, z)[1] < (o.eau ? 0.6 : 0.8)) return false;
    if (voisin(x, z, o.pres || 0.9, o.sauf)) return false;
    let ok = true;
    w.query(x, z, 1.5, (q) => { if (ok && q && q !== o.sauf && !q.gone && Math.hypot(q.x - x, q.z - z) < 1.1) ok = false; }, (b) => {
      if (!ok || b.under) return;
      const [lx, lz] = World.blockLocal(b, x, z);
      if (Math.abs(lx) < b.sx / 2 + 0.6 && Math.abs(lz) < b.sz / 2 + 0.6) ok = false;
    });
    return ok;
  };
  const pose = (id, x, z, extra) => { const o = B.obj(id, x, z, undefined, extra); ajoute(x, z, o); n++; return o; };
  const tir = (L) => L[(rnd() * L.length) | 0];

  // ---- les milieux (16 m) : sous-bois, sapinières de la forêt, bois de bouleaux, rives du lac
  const pts = { foret: [], foret_mont: [], bouleaux: [], marais: [], berge: [] };
  for (let z = 24; z < S - 24; z += 16) for (let x = 24; x < S - 24; x += 16) {
    const jx = x + (rnd() - 0.5) * 14, jz = z + (rnd() - 0.5) * 14;
    if (w.heightAt(jx, jz) < WL + 0.05) continue;
    const b = bAt(jx, jz);
    if (b !== 'foret' && b !== 'bouleaux' && b !== 'lac') continue;
    const m = milieuAt(w, jx, jz);
    if (b === 'foret') { if (m === 'foret' || m === 'combe') pts.foret.push([jx, jz]); else if (m === 'sapiniere') pts.foret_mont.push([jx, jz]); }
    else if (b === 'bouleaux') { if (m === 'bouleaux' || m === 'sapiniere') pts.bouleaux.push([jx, jz]); }
    else pts.berge.push([jx, jz]);
  }
  // ---- le marais (4 m) : les abords bas des mares, et les prés mouillés qui les entourent (à moins de 1,6 m de l'eau)
  const mares = (w.fishZones || []).filter((Z) => Z.kind === 'marais');
  if (mares.length) {
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (const Z of mares) { x0 = Math.min(x0, Z.x - Z.r * 2); x1 = Math.max(x1, Z.x + Z.r * 2); z0 = Math.min(z0, Z.z - Z.r * 2); z1 = Math.max(z1, Z.z + Z.r * 2); }
    for (let z = z0; z < z1; z += 4) for (let x = x0; x < x1; x += 4) {
      const jx = x + (rnd() - 0.5) * 3, jz = z + (rnd() - 0.5) * 3, h = w.heightAt(jx, jz) - WL;
      if (h < 0.05 || h > 1.6) continue;
      const m = milieuAt(w, jx, jz);
      if (m === 'marais' || m === 'berges' || m === 'pres') pts.marais.push([jx, jz]);
    }
  }
  // ---- l'eau des grands lacs (3 m) : eau libre (plantes flottantes) et bord (les pieds dans l'eau)
  const eauLac = [], bordLac = [];
  for (const L of w.lakes || []) {
    if (L.kind) continue;
    for (let z = L.z - L.r * 1.5; z < L.z + L.r * 1.5; z += 3) for (let x = L.x - L.r * 1.5; x < L.x + L.r * 1.5; x += 3) {
      const jx = x + (rnd() - 0.5) * 2.5, jz = z + (rnd() - 0.5) * 2.5, h = w.heightAt(jx, jz) - WL;
      if (h < -2 || h > 0.3) continue;
      if (h < -0.3) eauLac.push([jx, jz, h]); else bordLac.push([jx, jz, h]);
    }
  }
  // ---- les arbres hôtes (le lierre, la langue-de-bœuf, l'oronge, le gui ; l'oreille-de-Judas ; l'amadouvier)
  const hotes = { arbre: [], chene: [], mort: [], bouleau: [] };
  const ARBRE = new Set(['oak', 'hetre', 'chataignier', 'erable', 'tilleul', 'noyer', 'aulne']);
  for (let i = 0; i < n0; i++) {
    const o = w.objects[i];
    if (!o || o.gone) continue;
    const T = OBJ_TYPES[o.t], id = T && T.id;
    if (!id) continue;
    const b = bAt(o.x, o.z);
    if (b === 'foret') {
      if (ARBRE.has(id)) hotes.arbre.push(o);
      if (id === 'oak' || id === 'chataignier') hotes.chene.push(o);
      if (id === 'sureau' || id === 'deadtree' || id === 'stump') hotes.mort.push(o);
    } else if (b === 'bouleaux') {
      if (id === 'birch' || id === 'deadtree') hotes.bouleau.push(o);
      if (id === 'sureau' || id === 'deadtree') hotes.mort.push(o);
    }
  }

  // ---- chaque plante
  for (const P of D2_PLANTES) {
    if (OBJ_INDEX[P.o] === undefined) continue;
    const grand = P.h[1] > 1.1, touffes = Math.max(1, Math.round(D2_GEN.PER[P.r] * (D2_GEN.MIL[P.mil] || 1)));
    const [p0, p1] = grand ? [1, 2] : D2_GEN.PIEDS[P.r];
    const essais = P.r >= 2 ? 10 : 2;
    const pieds = () => p0 + ((rnd() * (p1 - p0 + 1)) | 0);
    // au pied d'un arbre, contre le tronc (le lierre ; la langue-de-bœuf au pied d'un chêne)
    if (P.pl === 'pied_arbre' || (P.pl === 'pied_chene' && P.o === 'langue_boeuf')) {
      const L = P.pl === 'pied_arbre' ? hotes.arbre : hotes.chene;
      for (let k = 0; k < touffes * 2 && L.length; k++) for (let e = 0; e < essais; e++) {
        const a = tir(L), t = rnd() * TAU, d = 0.45 + rnd() * 0.2, x = a.x + Math.cos(t) * d, z = a.z + Math.sin(t) * d;
        if (libre(x, z, { sauf: a, pres: 0.4, pente: true })) { pose(P.o, x, z); break; }
      }
      continue;
    }
    // sous les chênes, à quelques pas (l'oronge ; le gui tombé)
    if (P.pl === 'pied_chene') {
      const L = P.o === 'gui_chene' ? hotes.chene.filter((o) => OBJ_TYPES[o.t].id === 'oak') : hotes.chene;
      for (let k = 0; k < touffes && L.length; k++) for (let e = 0; e < essais; e++) {
        const a = tir(L), t = rnd() * TAU, d = P.o === 'gui_chene' ? 1.3 + rnd() * 1.6 : 1.6 + rnd() * 2.6, x = a.x + Math.cos(t) * d, z = a.z + Math.sin(t) * d;
        if (!libre(x, z)) continue;
        pose(P.o, x, z);
        for (let j = 1, m = P.o === 'gui_chene' ? 1 : pieds(); j < m; j++) { const tx = x + (rnd() - 0.5) * 1.6, tz = z + (rnd() - 0.5) * 1.6; if (libre(tx, tz, { pres: 0.5 })) pose(P.o, tx, tz); }
        break;
      }
      continue;
    }
    // sur le bois mort : au pied d'un sureau, d'un arbre mort, d'une souche
    if (P.pl === 'bois_mort') {
      const L = hotes.mort;
      for (let k = 0; k < touffes && L.length; k++) for (let e = 0; e < essais; e++) {
        const a = tir(L), t = rnd() * TAU, d = 0.6 + rnd() * 0.7, x = a.x + Math.cos(t) * d, z = a.z + Math.sin(t) * d;
        if (libre(x, z, { sauf: a, pres: 0.5 })) { pose(P.o, x, z); break; }
      }
      continue;
    }
    // un chicot de bouleau mort, parmi les bouleaux
    if (P.pl === 'bouleau') {
      const L = hotes.bouleau.length ? hotes.bouleau : [];
      for (let k = 0; k < touffes && L.length; k++) for (let e = 0; e < essais; e++) {
        const a = tir(L), t = rnd() * TAU, d = 1.6 + rnd() * 2.4, x = a.x + Math.cos(t) * d, z = a.z + Math.sin(t) * d;
        if (libre(x, z, { pres: 1.2 })) { pose(P.o, x, z); break; }
      }
      continue;
    }
    // sur l'eau libre du lac (feuilles à plat, fleurs au-dessus) : le nénuphar jaune plus loin du bord que la macre
    if (P.pl === 'eau') {
      const prof = P.o === 'nuphar' ? [-1.9, -0.6] : [-1.3, -0.35], L = eauLac.filter((q) => q[2] >= prof[0] && q[2] <= prof[1]);
      for (let k = 0; k < touffes && L.length; k++) for (let e = 0; e < essais; e++) {
        const [cx, cz] = tir(L);
        if (!libre(cx, cz, { eau: prof, pres: 1.2 })) continue;
        pose(P.o, cx, cz, { y: WL + 0.02 });
        for (let j = 1, m = pieds(); j < m; j++) { const tx = cx + (rnd() - 0.5) * 5, tz = cz + (rnd() - 0.5) * 5; if (libre(tx, tz, { eau: prof, pres: 1.2 })) pose(P.o, tx, tz, { y: WL + 0.02 }); }
        break;
      }
      continue;
    }
    // les pieds dans l'eau du bord (le scirpe, le plantain d'eau, l'acore ; la lobélie, sous l'eau claire)
    if (P.pl === 'bord_eau') {
      const prof = P.o === 'lobelie' ? [-0.4, -0.05] : P.o === 'scirpe' ? [-0.6, 0.1] : [-0.35, 0.25], L = bordLac.concat(eauLac).filter((q) => q[2] >= prof[0] && q[2] <= prof[1]);
      for (let k = 0; k < touffes && L.length; k++) for (let e = 0; e < essais; e++) {
        const [cx, cz] = tir(L);
        if (!libre(cx, cz, { eau: prof, pres: grand ? 1.0 : 0.8 })) continue;
        pose(P.o, cx, cz);
        for (let j = 1, m = pieds(); j < m; j++) { const tx = cx + (rnd() - 0.5) * 4, tz = cz + (rnd() - 0.5) * 4; if (libre(tx, tz, { eau: prof, pres: grand ? 1.0 : 0.8 })) pose(P.o, tx, tz); }
        break;
      }
      continue;
    }
    // au sol, en touffes, dans son milieu (les rives du lac pour « berge »)
    const cand = P.pl === 'berge' ? pts.berge : P.mil === 'foret' ? (P.hab.includes('sapiniere') ? pts.foret.concat(pts.foret_mont) : pts.foret) : pts[P.mil] || [];
    if (!cand.length) continue;
    const sp = P.mil === 'marais' ? 4 : grand ? 7 : 5;
    for (let k = 0; k < touffes; k++) for (let e = 0; e < essais; e++) {
      const [cx, cz] = tir(cand);
      let posees = 0;
      for (let j = 0, m = pieds(); j < m; j++) {
        const x = j ? cx + (rnd() - 0.5) * sp : cx, z = j ? cz + (rnd() - 0.5) * sp : cz;
        if (!libre(x, z, { pres: grand ? 1.3 : 0.9 })) continue;
        pose(P.o, x, z); posees++;
      }
      if (posees) break;
    }
  }
  if (n) { w.objectsDirty = true; w.grid = null; w.shadeDirty = true; }
  w.d2Plantes = n;
  return n;
}
d2.peupler = d2Peupler;
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    try { if (w) d2Peupler(w, w.seed || seed); } catch (e) { console.error(e); }
    return w;
  };
}
// (une partie chargée : l'état de D2 a ses valeurs par défaut)
HOOKS.load.push(() => { try { d2.S(); } catch (e) { console.error(e); } });
