// ============================================================================
//  OBJETS LÉGENDAIRES ET MYTHIQUES (agent L)
//  Quinze objets uniques, en deux rangs (légendaire : nom en or ; mythique :
//  nom en violet), liés au lore de la vallée (les Aëlim, les Trois, les nains,
//  les Gorr et les géants, la Dame du Lac, le Cerf Blanc, la Chasse volante,
//  les Valmont, la Mère des Moissons, l'Envers, la Fondation…). Chacun a son
//  histoire, son pouvoir, sa manière d'être trouvé, son icône et son modèle
//  en main, lumineux. Ils sont rares : un seul exemplaire par partie.
//  API : legendaires (a, obtenir, rang, list, carte, indices, spots…)
//  Sauvegarde : farm.s.legend
// ============================================================================

const LEG_RANGS = {
  legendaire: { nom: 'Objet légendaire', col: '#9a6c06', vif: '#f2c85a', lueur: [255, 206, 96], lum: [1.0, 0.78, 0.36] },
  mythique: { nom: 'Objet mythique', col: '#7428b8', vif: '#cf9cff', lueur: [196, 128, 255], lum: [0.72, 0.42, 1.0] },
};
const LEG_ORDRE = ['pic_frappeurs', 'cognee_gorr', 'lanterne_aube', 'canne_dame', 'cor_mesnie', 'rapiere_valmont', 'pierre_durn', 'livre_sans_fin', 'arc_cerf', 'clochette_aubin',
  'faucille_mere', 'larme_aela', 'bourse_vesh', 'cle_aelim', 'chronographe'];
const LEGENDAIRES = {
  pic_frappeurs: {
    rang: 'legendaire', nom: 'Pic des Frappeurs', ic: 'leg_pic', item: { tool: 'pioche', tier: 3 },
    histoire: 'Les Frappeurs, les petits gens de la montagne, cognent dans la roche pour guider les mineurs honnêtes et perdre les avides. Ils n’ont jamais donné qu’un seul outil : ce pic, forgé avec les nains pour le premier grand qui leur laissa du pain sans rien demander. Le fer en est bleu comme l’eau sous la glace, et des signes y courent que personne n’a gravés.',
    pouvoir: 'Brise la pierre et les filons d’un seul coup, et chaque filon rend le double. Bouton droit : frapper trois coups, puis un — les Frappeurs répondent, du côté du filon le plus proche.',
    origine: 'Forgé à la forge d’en bas par la forgeronne naine, avec quatre lingots d’acier, deux gemmes et un cœur de montagne.',
    indice: 'Une forgeronne, sous la montagne, sait forger ce que les Frappeurs ont dessiné — si on lui apporte un cœur de montagne, de l’acier et deux gemmes.',
  },
  cognee_gorr: {
    rang: 'legendaire', nom: 'Cognée des Gorr', ic: 'leg_cognee', item: { tool: 'hache', tier: 3 },
    histoire: 'Avant les villages, les Gorr dressaient les pierres de la vallée, et ils abattaient des chênes que dix hommes n’auraient pas embrassés. Le fer de leur cognée dormait sous la couche d’un géant, qui s’en servait d’oreiller. Il a fallu une forgeronne naine pour l’emmancher à la mesure d’une main d’homme. Le bois se souvient de lui : il se couche avant qu’on frappe.',
    pouvoir: 'Abat n’importe quel arbre d’un seul coup — le chêne millénaire en trois — et fend les souches. Le bois tombe en plus grand nombre.',
    origine: 'Un fer de cognée trouvé sous la couche d’un géant, emmanché à la forge d’en bas.',
    indice: 'Les géants dorment sur de drôles d’oreillers : du fer, dit-on, et du très vieux. Une forgeronne naine saurait quoi en faire.',
  },
  lanterne_aube: {
    rang: 'legendaire', nom: 'Lanterne de l’Aube', ic: 'leg_lanterne', item: {},
    histoire: 'Une fois l’an, les Aëlim montaient allumer leurs lampes à la première lueur d’Aëla, au sommet des Monts. Celle-ci ne s’est jamais éteinte : elle brûle sans huile ni mèche, d’une flamme couleur de matin. Les nains l’ont posée dans la chapelle de l’Aube, sous la montagne, où elle attend quelqu’un qui se lève avant le jour.',
    pouvoir: 'Clic : l’allumer ou la voiler. Elle éclaire deux fois plus loin qu’une lanterne, et ce qui rôde la nuit — les Pâles, les loups, les autres — n’entre pas dans son cercle.',
    origine: 'Dans la chapelle d’Aëla, au temple sous la montagne ; on ne la voit qu’à l’aube.',
    indice: 'Sous la montagne, dans la chapelle de l’Aube, une lumière ne se montre qu’à l’heure où le jour hésite.',
  },
  canne_dame: {
    rang: 'legendaire', nom: 'Canne de la Dame du Lac', ic: 'leg_canne', item: { tool: 'canne', fast: 0.3 },
    histoire: 'Un roseau d’argent, une ligne fine comme un cheveu blond, qui ne casse pas. La Dame garde tout ce que l’eau a pris : les bagues, les cloches, les noyés. À qui pêche la nuit sans rien lui voler, elle rend parfois quelque chose. Cette nuit-là, elle vous a rendu de quoi pêcher.',
    pouvoir: 'Le poisson mord presque aussitôt, et les prises rares sont plus fréquentes. Parfois, le lac rend un objet qu’il avait gardé.',
    origine: 'Remontée au bout de la ligne, une nuit, dans le grand lac.',
    indice: 'Pêchez la nuit dans le grand lac, et pas seulement pour vendre : la Dame rend ce qu’on lui a donné.',
  },
  cor_mesnie: {
    rang: 'legendaire', nom: 'Cor de la Mesnie', ic: 'leg_cor', item: {},
    histoire: 'Les nuits d’orage, la Chasse volante passe au-dessus de la vallée : les veneurs morts du vieux seigneur, leurs chevaux noirs, leur meute. Un hiver, il y a longtemps, le premier piqueur a laissé tomber son cor dans une crevasse du glacier. Il n’est jamais redescendu le chercher. Quand le vent entre dans la corne, elle sonne encore, tout bas.',
    pouvoir: 'Clic : sonner le cor, une fois par jour. Toutes les bêtes à cent pas prennent la fuite, et ce qui rôde de l’autre côté recule, pour un temps.',
    origine: 'Pris dans la glace bleue, au fond d’une crevasse du glacier des Treize.',
    indice: 'Au glacier, dans une crevasse où personne n’est mort, quelque chose sonne quand le vent souffle.',
  },
  rapiere_valmont: {
    rang: 'legendaire', nom: 'Rapière du dernier comte', ic: 'leg_rapiere', item: { tool: 'rapiere' },
    histoire: 'En fuyant la vallée, en 1791, le dernier comte de Valmont enterra son or, et son épée avec, pour ne pas la rendre aux hommes de la Nation. La garde porte sa devise, à demi effacée : PLUTÔT ROMPRE QUE PLIER. La lame est restée des générations sous la terre sans prendre une tache de rouille.',
    pouvoir: 'Une arme : elle frappe vite, et plus fort que la meilleure hache.',
    origine: 'Enterrée avec l’or des Valmont, là où se croisent les flèches des quatre bornes.',
    indice: 'Quatre bornes gravées regardent le même endroit. Ce qu’elles gardent n’est pas que de l’or.',
  },
  pierre_durn: {
    rang: 'legendaire', nom: 'Pierre de Durn', ic: 'leg_pierre', item: {},
    histoire: 'Une pierre ronde, lisse, toujours tiède, ramassée contre le flanc du Dormeur. Posée sur la paume, on la sent battre, très lentement : un battement par minute. Durn la Pierre tient la montagne debout pendant qu’il dort. Il tient aussi, un peu, celui qui la porte.',
    pouvoir: 'Portée sur soi : les chutes ne blessent plus, et les jambes ne cassent plus en tombant.',
    origine: 'Contre le flanc du Dormeur, au temple sous la montagne.',
    indice: 'Le Dormeur a perdu un caillou, contre son flanc. Il ne l’a pas encore remarqué.',
  },
  livre_sans_fin: {
    rang: 'legendaire', nom: 'Le Livre sans fin', ic: 'leg_livre', item: {},
    histoire: 'Un livre des Aëlim, relié d’une peau très pâle, dont les pages se remplissent seules pendant la nuit : en Hautes Lettres d’abord, puis en français, comme s’il apprenait à qui il parle. Les moines de Montrevel l’avaient muré dans les archives parce qu’il écrivait sur eux. Chaque matin, une page de plus : ce que la vallée a murmuré.',
    pouvoir: 'Clic : lire la page du jour. Elle parle d’un lieu caché ou d’une merveille que vous n’avez pas encore trouvés — jamais tout à fait où, mais à peu près.',
    origine: 'Dans le coffre des archives secrètes, sous la bibliothèque.',
    indice: 'Sous la bibliothèque, un coffre garde un livre qui n’a pas de dernière page.',
  },
  arc_cerf: {
    rang: 'legendaire', nom: 'Arc de bouleau blanc', ic: 'leg_arc', item: { tool: 'arc', power: 2.2 },
    histoire: 'Taillé dans le bouleau où le Cerf Blanc s’est couché une aube de novembre, et tendu d’un crin de sa queue. On dit qu’il n’a jamais tiré sur une bête blanche, et qu’il se briserait plutôt. Le Cerf ne le laisse qu’à ceux qui l’ont honoré et n’ont pas tué de ses frères depuis sept jours.',
    pouvoir: 'Il se bande d’un geste, porte loin et droit, et frappe deux fois plus fort qu’un arc ordinaire. Les bêtes n’entendent pas sa corde.',
    origine: 'Laissé à l’aube près de la pierre du Cerf, pour qui a honoré le Cerf Blanc et épargné les cerfs.',
    indice: 'Qui a vu le Cerf Blanc, qui lui a laissé des offrandes et n’a pas tué de cerf depuis une semaine : qu’il aille à sa pierre, à l’aube.',
  },
  clochette_aubin: {
    rang: 'legendaire', nom: 'Clochette de Saint-Aubin', ic: 'leg_clochette', item: {},
    histoire: 'La petite cloche de l’autel de Saint-Aubin-des-Eaux, le village que le lac a pris. Le curé la sonnait à l’élévation ; elle a sonné toute seule, dit-on, la nuit où l’eau est montée, et tout le village s’est réveillé trop tard. Elle a roulé dans la vase, au pied du clocher. Son tintement ne ressemble à aucun autre : il n’a pas d’écho.',
    pouvoir: 'Clic : la sonner (deux fois par jour au plus). Ce qui n’a rien à faire dans ce monde se tait et s’éloigne : les silhouettes, les Pâles, les voix.',
    origine: 'Au fond du grand lac, dans la vase, au pied du clocher englouti.',
    indice: 'Au fond du grand lac, au pied d’un clocher, une clochette attend qu’on retienne son souffle assez longtemps.',
  },
  faucille_mere: {
    rang: 'legendaire', nom: 'Faucille d’argent de la Mère', ic: 'leg_faucille', item: { tool: 'faux' },
    histoire: 'Chaque année, la dernière gerbe est coupée avec une faucille d’argent que personne ne voit : c’est la Mère des Moissons qui la tient. À qui l’a nourrie fidèlement, elle la prête, pour un an dit-on. Personne ne sait qui la lui rend, ni comment.',
    pouvoir: 'Moissonne d’un seul geste tout ce qui est mûr autour de vous, et la terre ainsi récoltée donne un peu plus.',
    origine: 'Un don de la Mère des Moissons, sur la pierre aux offrandes, à qui l’a nourrie fidèlement.',
    indice: 'La Mère des Moissons prête sa faucille à qui lui a porté ses premiers fruits, souvent, et a déjà reçu sa poupée.',
  },
  larme_aela: {
    rang: 'mythique', nom: 'Larme d’Aëla', ic: 'leg_larme', item: {},
    histoire: 'Aëla ne se montre qu’à qui a veillé toute une nuit, sans lumière et sans peur — et encore, une fois dans une vie. Là où elle a posé les yeux, il reste au matin une goutte d’or qui ne sèche pas. Les Aëlim l’appelaient « drae na-aela », le sang de l’Aube. Elle est tiède, et elle bat au rythme de votre cœur.',
    pouvoir: 'Portée sur soi : les blessures se referment d’elles-mêmes, le sang s’arrête, les os se ressoudent. Une fois par semaine, elle refuse votre mort.',
    origine: 'Laissée par Aëla à l’aube, après une nuit entière de veille dehors, sans lumière et sans dormir.',
    indice: 'Veillez une nuit entière, dehors, sans lanterne et sans dormir (il y faut un élixir de vigueur). L’Aube récompense ceux qui l’attendent.',
  },
  bourse_vesh: {
    rang: 'mythique', nom: 'Bourse de Vesh', ic: 'leg_bourse', item: {},
    histoire: 'Vesh, la Nuit noire, offre toujours, et ce qu’il offre se paie. Cette bourse de cuir noir est tiède comme une main, et chaque matin elle est pleine. Chaque soir, quelque part, quelqu’un compte ce que vous avez pris. On a essayé de la jeter au lac, de la brûler, de l’enterrer : elle revient sous l’oreiller.',
    pouvoir: 'Clic : prendre l’or du jour. Mais tout est compté, et la Nuit vient réclamer son dû quand elle le juge bon. On ne peut pas s’en défaire.',
    origine: 'Ramassée dans l’Envers, où rien ne devrait se ramasser.',
    indice: 'Dans l’Envers, sous le vieux puits, traîne une bourse que personne n’a perdue.',
  },
  cle_aelim: {
    rang: 'mythique', nom: 'Kel, la clé des Aëlim', ic: 'leg_cle', item: {},
    histoire: '« kel neth sera luin, ne sera sae » : la clé est sous le lac bleu, là où dort le lac. Une clé de pierre bleue, longue comme la main et sans dents : elle ne s’ajuste pas à la serrure, c’est la serrure qui s’ajuste à elle. Les Aëlim s’en servaient pour ouvrir les seuils — et pas seulement ceux des maisons.',
    pouvoir: 'Ouvre toutes les portes fermées à clé. Clic, en la tournant dans le vide : ouvrir le seuil du temple sous la montagne (une fois par jour) ; tournée dans le temple, elle ramène à la cascade.',
    origine: 'Pêchée dans le trou du lac gelé, là où dort le lac.',
    indice: 'Le lac gelé dort. Ce qu’il garde sous la glace se pêche, surtout si l’on connaît le mot « kel ».',
  },
  chronographe: {
    rang: 'mythique', nom: 'Chronographe de la Fondation', ic: 'leg_chrono', item: {},
    histoire: 'Une montre qui ne vient d’aucune époque : pas de remontoir, un cadran de verre noir où trois aiguilles tournent à l’envers. Au dos, gravé : « PROPRIÉTÉ DE LA FONDATION — DIVISION CHRONOLOGIQUE — NE PAS SORTIR DU SITE ». Elle est froide, et elle tique un peu trop vite.',
    pouvoir: 'Clic : revenir dix secondes en arrière (une fois toutes les six heures). Une fois par jour, si elle vous voit mourir, elle rembobine d’elle-même.',
    origine: 'Sur la console de la machine, au cœur d’un complexe caché qui n’existe pas dans toutes les vallées.',
    indice: 'Des gens en habits jaunes gardent une montre qui tourne à l’envers. Ils ne sont pas d’ici. Ils ne sont pas de maintenant.',
  },
};

// ---------------------------------------------------------------- objets d'inventaire
{
  // la catégorie des merveilles, en tête de la sacoche
  const old = Object.assign({}, ITEM_CAT_NAMES);
  for (const k in ITEM_CAT_NAMES) delete ITEM_CAT_NAMES[k];
  ITEM_CAT_NAMES.legende = 'Objets légendaires et mythiques';
  Object.assign(ITEM_CAT_NAMES, old);
  for (const id of LEG_ORDRE) {
    const L = LEGENDAIRES[id], R = LEG_RANGS[L.rang];
    defItem(id, L.nom, 'legende', 0, [L.ic, R.col], Object.assign({ legend: L.rang, desc: (L.rang === 'mythique' ? 'Objet mythique. ' : 'Objet légendaire. ') + L.pouvoir }, L.item));
  }
  defItem('coeur_montagne', 'Cœur de montagne', 'materiau', 100, ['leg_coeur', '#e0802a'], { desc: 'Un cristal orangé, chaud au creux de la main, pris dans sa gangue de roche. Les nains disent que la montagne en a un, et que c’est un morceau de lui.' });
  defItem('fer_cognee', 'Fer de cognée des Gorr', 'quete', 0, ['leg_fer', '#6a645c'], { desc: 'Un fer de hache large comme une porte de four, trop lourd pour un manche d’homme. Une forgeronne naine saurait l’emmancher.' });
  TOOL_DMG.rapiere = 46;
  // le cœur de montagne : dans les profondeurs, chez les Frappeurs, dans les cristaux
  for (const [k, w] of [['profond', 0.5], ['frappeurs', 1], ['cristaux', 0.6], ['temple', 0.35]]) if (LOOT[k]) LOOT[k].items.push(['coeur_montagne', 1, 1, w]);
  if (HARVEST.crystal) HARVEST.crystal.drop.push(['coeur_montagne', 1, 1, 0.05]);
  // la forgeronne rachète le cœur de montagne (bon prix)
  const F = NPC_DATA.find((d) => d.id === 'nain_forgeronne');
  if (F && F.shop && !F.shop.buys.includes('coeur_montagne')) F.shop.buys.push('coeur_montagne');
}

// ---------------------------------------------------------------- icônes (16 × 16, avec leur halo)
function legHalo(pb, col, a) {
  const W = pb.w, H = pb.h, m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (pb.alpha(x, y) > 100) m[y * W + x] = 1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (m[y * W + x]) continue;
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if ((dx || dy) && X >= 0 && Y >= 0 && X < W && Y < H && m[Y * W + X] && (!dx || !dy)) { near = true; break; } }
    if (near) pb.set(x, y, col, a || 150);
  }
}
function legIcon(shape) {
  const pb = new PixelBuf(16, 16);
  const L = (x0, y0, x1, y1, c, w) => drawLine(pb, x0, y0, x1, y1, typeof c === 'string' ? hexToRgb(c) : c, w || 1);
  const R = (x0, y0, x1, y1, c, a) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) pb.set(x, y, typeof c === 'string' ? hexToRgb(c) : c, a); };
  const S = (cx, cy, r, pal, o) => drawSphere(pb, cx, cy, r, ramp(pal), (cx * 7 + cy) | 0, o || {});
  const E = (x, y, c) => pb.set(x, y, typeof c === 'string' ? hexToRgb(c) : c, EMISSIVE_A);
  let glow = LEG_RANGS.legendaire.lueur;
  switch (shape) {
    case 'leg_pic':
      L(3, 14, 10, 5, '#3a2616', 2); L(4, 13, 10, 6, '#6a4422');
      L(3, 3, 8, 5, '#4a6a96', 2); L(8, 5, 14, 9, '#4a6a96', 2); L(3, 3, 14, 9, '#a8d0f0');
      E(6, 4, '#bff0ff'); E(11, 7, '#bff0ff'); R(9, 5, 10, 6, '#7a8aa0');
      glow = [150, 220, 255]; break;
    case 'leg_cognee':
      L(3, 14, 11, 4, '#4a3018', 2);
      for (let y = 1; y <= 9; y++) { const w = 3 + Math.round(Math.sin((y - 1) / 8 * Math.PI) * 4); R(9, y, 9 + w, y, y < 3 ? '#8a847a' : '#5e5a54'); }
      for (let y = 1; y <= 9; y++) { const w = 3 + Math.round(Math.sin((y - 1) / 8 * Math.PI) * 4); E(9 + w, y, '#ffd060'); }
      break;
    case 'leg_lanterne':
      L(7, 1, 9, 1, '#b08a30'); L(8, 1, 8, 3, '#b08a30');
      R(5, 4, 11, 4, '#c8a040'); R(5, 13, 11, 14, '#c8a040'); R(5, 5, 5, 12, '#a07828'); R(11, 5, 11, 12, '#a07828');
      R(6, 5, 10, 12, [255, 236, 170], EMISSIVE_A); R(7, 7, 9, 10, [255, 252, 230], EMISSIVE_A); E(8, 8, [255, 255, 255]);
      break;
    case 'leg_canne':
      L(2, 15, 13, 2, '#dfe6ee'); L(3, 15, 13, 3, '#8a96a6'); L(13, 2, 14, 11, '#f0e0a0'); E(14, 12, '#c8f0ff'); E(14, 13, '#9ad8ff');
      glow = [190, 225, 255]; break;
    case 'leg_cor':
      for (let k = 0; k <= 12; k++) { const t = k / 12, x = 3 + t * 10, y = 11 - Math.sin(t * Math.PI) * 6 + t * 2, r = 0.8 + t * 2.2; S(x, y, r, ['#8a7a5a', '#c8b890', '#ece2c4', '#fff8e8']); }
      L(8, 3, 8, 7, '#d8a830'); L(11, 5, 11, 10, '#d8a830'); E(13, 11, '#fff0c0');
      break;
    case 'leg_rapiere':
      L(3, 13, 13, 2, '#e8eef4'); L(4, 13, 13, 3, '#9aa6b4'); E(12, 3, '#ffffff'); E(10, 5, '#ffffff');
      L(1, 11, 6, 15, '#d8a830', 1); S(3.5, 12.5, 2, ['#8a6a20', '#c8a040', '#f0d070']); L(1, 15, 2, 14, '#5a3a20');
      break;
    case 'leg_pierre':
      S(8, 9, 5.5, ['#3a3836', '#5a5752', '#7a766e', '#9a958c', '#b8b2a8'], { noise: 0.2 });
      E(6, 8, '#ff9a40'); E(7, 9, '#ffb060'); E(8, 9, '#ff9a40'); E(9, 10, '#ffc070'); E(10, 10, '#ff9a40');
      break;
    case 'leg_livre':
      R(2, 4, 13, 13, '#e8dcc0'); R(2, 4, 2, 13, '#b8a888'); R(13, 4, 13, 13, '#b8a888'); L(7, 4, 7, 13, '#a89878'); L(8, 4, 8, 13, '#c8b898');
      for (let y = 6; y <= 11; y += 2) { for (let x = 3; x <= 6; x++) if ((x + y) % 3) E(x, y, '#f0c860'); for (let x = 9; x <= 12; x++) if ((x * 3 + y) % 4) E(x, y, '#f0c860'); }
      break;
    case 'leg_arc':
      for (let y = 1; y <= 14; y++) { const t = (y - 1) / 13, x = 11 - Math.sin(t * Math.PI) * 6; pb.set(Math.round(x), y, [244, 242, 232]); pb.set(Math.round(x) + 1, y, [206, 202, 190]); }
      L(12, 1, 12, 14, '#b8e0ff'); E(12, 7, '#e8f8ff'); R(5, 7, 6, 8, '#a08050');
      glow = [220, 240, 255]; break;
    case 'leg_clochette':
      L(8, 1, 8, 4, '#6a4a2a', 2);
      for (let y = 5; y <= 12; y++) { const w = 2 + Math.round((y - 5) * 0.55); for (let x = 8 - w; x <= 8 + w; x++) pb.set(x, y, rampPick(ramp(['#6a4a1a', '#9a7030', '#c89a48', '#e8c070']), 0.85 - Math.abs(x - 7) * 0.08, x, y)); }
      R(3, 13, 13, 13, '#8a6424'); S(8, 14.5, 1.3, ['#5a4020', '#8a6a30']); E(6, 7, '#fff0c0');
      break;
    case 'leg_faucille':
      for (let a = 0; a <= 26; a++) { const t = -0.3 + a / 26 * 3.4, x = 8 + Math.cos(t) * 5.5, y = 7 - Math.sin(t) * 5.5; pb.set(Math.round(x), Math.round(y), [236, 240, 246]); pb.set(Math.round(8 + Math.cos(t) * 4.5), Math.round(7 - Math.sin(t) * 4.5), [170, 178, 190]); }
      L(12, 9, 14, 15, '#8a6a3a', 2); E(3, 6, '#ffffff'); E(8, 1, '#ffffff');
      glow = [230, 236, 255]; break;
    case 'leg_larme':
      glow = LEG_RANGS.mythique.lueur;
      S(8, 10, 4.2, ['#a06a08', '#e0a818', '#ffd84a', '#fff4b0'], { alpha: EMISSIVE_A });
      for (let y = 2; y <= 6; y++) { const w = Math.round((y - 2) * 0.8); for (let x = 8 - w; x <= 8 + w; x++) pb.set(x, y, y < 4 ? [255, 214, 80] : [240, 190, 40], EMISSIVE_A); }
      E(7, 9, '#ffffff'); E(6, 10, '#fff8d0');
      break;
    case 'leg_bourse':
      glow = LEG_RANGS.mythique.lueur;
      S(8, 10, 5, ['#08060c', '#16121e', '#262032', '#3a3048']);
      R(6, 4, 10, 5, '#1a1624'); L(5, 4, 11, 4, '#4a3a60'); S(7, 3, 1.4, ['#a07818', '#e8c040', '#fff0a0']); S(10, 3, 1.3, ['#a07818', '#e8c040', '#fff0a0']);
      E(10, 9, '#b080ff'); E(5, 11, '#9060e0');
      break;
    case 'leg_cle':
      glow = LEG_RANGS.mythique.lueur;
      for (let a = 0; a < 16; a++) { const t = a / 16 * TAU; pb.set(Math.round(4 + Math.cos(t) * 2.6), Math.round(4 + Math.sin(t) * 2.6), [60, 110, 190]); }
      L(6, 6, 14, 14, '#3a78c8', 2); L(6, 6, 13, 13, '#8ac0ff'); E(9, 9, '#c0e8ff'); E(12, 12, '#c0e8ff'); E(4, 4, '#a0d8ff');
      break;
    case 'leg_chrono':
      glow = LEG_RANGS.mythique.lueur;
      S(8, 9, 6, ['#40444c', '#7a808a', '#b0b8c2', '#e0e6ee']); S(8, 9, 4.6, ['#020204', '#08080e', '#101020']);
      R(7, 1, 9, 2, '#9aa0aa'); L(8, 9, 8, 5, [120, 240, 255]); L(8, 9, 11, 10, [200, 140, 255]); L(8, 9, 6, 12, [255, 255, 255]);
      E(8, 5, [150, 250, 255]); E(11, 10, [220, 170, 255]);
      break;
    case 'leg_coeur':
      S(8, 9, 6, ['#2e2c2a', '#4a4642', '#66625c', '#827c74']);
      for (const [x, y] of [[7, 7], [8, 7], [8, 8], [9, 8], [7, 9], [8, 9], [9, 9], [8, 10], [10, 10], [6, 8]]) E(x, y, (x + y) % 2 ? [255, 150, 60] : [255, 200, 110]);
      glow = [255, 150, 70]; break;
    case 'leg_fer':
      for (let y = 3; y <= 12; y++) { const w = 3 + Math.round(Math.sin((y - 3) / 9 * Math.PI) * 5); for (let x = 3; x <= 3 + w; x++) pb.set(x, y, rampPick(ramp(['#2e2a26', '#46403a', '#5e5850', '#7a7266']), 0.8 - (x - 3) * 0.05, x, y)); }
      R(2, 6, 3, 9, '#2a2622'); for (let k = 0; k < 6; k++) pb.set(4 + ((k * 5) % 7), 4 + ((k * 3) % 8), [120, 70, 40]);
      edgeDarken(pb, 0.8);
      return pb;
    default: return null;
  }
  edgeDarken(pb, 0.85);
  legHalo(pb, glow, 150);
  return pb;
}
{
  const _ip = iconPaint;
  iconPaint = function (shape, c1, c2) {
    if (typeof shape === 'string' && shape.startsWith('leg_')) { const pb = legIcon(shape); if (pb) return pb; }
    return _ip(shape, c1, c2);
  };
}

// ---------------------------------------------------------------- en main (120 × 100) : modèles lumineux
// halo autour d'un objet dessiné à part (ob) : un anneau vif, puis un anneau pointillé
function legGlowVM(pb, ob, col) {
  const W = ob.w, H = ob.h, m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ob.alpha(x, y) > 100) m[y * W + x] = 1;
  const ring = new Uint8Array(W * H);
  const near = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (dx * dx + dy * dy > r * r + 0.5) continue; const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && m[Y * W + X]) return true; } return false; };
  const dim = [col[0] * 0.75, col[1] * 0.75, col[2] * 0.75];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (m[y * W + x] || pb.alpha(x, y) > 100) continue;
    if (near(x, y, 1)) { pb.set(x, y, col, EMISSIVE_A); ring[y * W + x] = 1; }
    else if (((x + y) & 1) === 0 && near(x, y, 2)) pb.set(x, y, dim, EMISSIVE_A);
  }
}
function legOver(pb, ob) {
  for (let y = 0; y < ob.h; y++) for (let x = 0; x < ob.w; x++) { const a = ob.alpha(x, y); if (a > 100) { const c = ob.get(x, y); pb.set(x, y, [c[0], c[1], c[2]], a); } }
}
// outils (pic, cognée, faucille) : la tête de l'outil luit
function vmLegTool(kind, swing, o) {
  const pb = new PixelBuf(VM_W, VM_H), ob = new PixelBuf(VM_W, VM_H);
  const gx = 86, gy = 86;
  let ang = swing ? -1.25 : -0.3;
  if (kind === 'faux') ang = swing ? -1.4 : -0.35;
  vmArm(pb, gx, gy);
  const L = kind === 'faux' ? 40 : 66;
  const h = vmHandle(pb, gx, gy, ang, L, o.manche || PAL.wood, 5);
  const T = (a, b) => [h.hx + h.px * a + h.dx * b, h.hy + h.py * a + h.dy * b];
  const blade = ramp(o.lame);
  if (kind === 'pioche') {
    fillPoly(ob, [T(-22, -1), T(-8, -5), T(0, -6), T(8, -5), T(22, -1), T(8, 2), T(0, 3), T(-8, 2)], blade, (x, y) => 0.62 - ((x - h.hx) * h.dx + (y - h.hy) * h.dy) * 0.05);
    for (let k = -16; k <= 16; k += 4) { const [x, y] = T(k, -1.5); ob.set(Math.round(x), Math.round(y), o.rune, EMISSIVE_A); }
    for (const k of [-2, 2]) { const [x, y] = T(k, 0); ob.set(Math.round(x), Math.round(y), [200, 210, 220]); }
  } else if (kind === 'hache') {
    fillPoly(ob, [T(-4, 6), T(-4, -9), T(20, -17), T(26, -2), T(20, 14)], blade, (x, y) => 0.5 + ((x - h.hx) * h.px + (y - h.hy) * h.py) * 0.022);
    for (let k = -15; k <= 12; k++) { const [x, y] = T(24.5 - Math.abs(k) * 0.12, k * 0.95); ob.set(Math.round(x), Math.round(y), o.rune, EMISSIVE_A); }
    for (let k = 0; k < 5; k++) { const [x, y] = T(4 + k * 3, -2 + (k % 2) * 3); ob.set(Math.round(x), Math.round(y), blade[0]); }
  } else if (kind === 'faux') { // faucille : lame en croissant, qui part du haut du manche et revient sur le côté
    const R = 20, cx = h.hx - h.px * R, cy = h.hy - h.py * R;
    for (let i = 0; i <= 90; i++) {
      const t = i / 90, th = t * 3.3, ux = Math.cos(th) * h.px + Math.sin(th) * h.dx, uy = Math.cos(th) * h.py + Math.sin(th) * h.dy;
      const x = cx + R * ux, y = cy + R * uy, wdt = 1 + 4.5 * (1 - t) * Math.min(1, t * 6);
      for (let k = 0; k <= wdt; k += 0.5) ob.set(Math.round(x - ux * k), Math.round(y - uy * k), k < 0.6 ? o.rune : rampPick(blade, 0.9 - k * 0.12, Math.round(x), Math.round(y)), k < 0.6 ? EMISSIVE_A : 255);
    }
  }
  legGlowVM(pb, ob, o.glow);
  legOver(pb, ob);
  vmFist(pb, gx, gy);
  edgeDarken(pb, 0.8);
  return pb;
}
// la rapière : lame fine, garde dorée
function vmLegRapiere(swing) {
  const pb = new PixelBuf(VM_W, VM_H), ob = new PixelBuf(VM_W, VM_H);
  const gx = 88, gy = 84;
  vmArm(pb, gx, gy);
  const tip = swing ? [8, 58] : [26, 6];
  const steel = ramp(['#5a6270', '#8a94a2', '#c4ccd6', '#eef2f6']);
  thickLine(ob, gx - 6, gy - 8, tip[0], tip[1], 3, steel, 0.8);
  drawLine(ob, gx - 7, gy - 10, tip[0] + 1, tip[1] - 1, [255, 255, 255]);
  for (let k = 0; k < 8; k++) { const t = 0.15 + k * 0.1; ob.set(Math.round(lerp(gx - 6, tip[0], t)), Math.round(lerp(gy - 8, tip[1], t)) - 1, [240, 248, 255], EMISSIVE_A); }
  legGlowVM(pb, ob, [220, 232, 255]);
  legOver(pb, ob);
  const gold = ramp(['#6a4a10', '#a07820', '#d8b048', '#f8e090']);
  for (let a = 0; a < 40; a++) { const t = a / 40 * TAU; pb.set(Math.round(gx - 2 + Math.cos(t) * 12), Math.round(gy - 2 + Math.sin(t) * 9), rampPick(gold, 0.6 + Math.sin(t) * 0.3, a, 0)); }
  drawLine(pb, gx - 16, gy + 2, gx + 6, gy - 16, gold[2], 2);
  vmFist(pb, gx, gy);
  edgeDarken(pb, 0.8);
  return pb;
}
// la canne d'argent (repos, lancée)
function vmLegCanne(cast) {
  const pb = new PixelBuf(VM_W, VM_H), ob = new PixelBuf(VM_W, VM_H);
  vmArm(pb, 86, 88);
  const silver = ramp(['#6a7482', '#a0aab8', '#d8e0ea', '#fbfdff']);
  const ang = cast ? -0.15 : -0.6, dx = Math.sin(ang), dy = -Math.cos(ang);
  thickLine(ob, 86 - dx * 12, 88 - dy * 12, 86 + dx * 95, 88 + dy * 95, 3, silver, 0.8);
  const hx = Math.round(86 + dx * 95), hy = Math.round(88 + dy * 95);
  legGlowVM(pb, ob, [200, 230, 255]);
  legOver(pb, ob);
  if (!cast) { drawLine(pb, hx, hy, hx, hy + 30, [250, 232, 160]); pb.set(hx, hy + 31, [200, 240, 255], EMISSIVE_A); pb.set(hx, hy + 32, [150, 220, 255], EMISSIVE_A); }
  drawLine(pb, 78, 80, 70, 72, [60, 60, 66], 3);
  vmFist(pb, 86, 86);
  edgeDarken(pb, 0.8);
  return pb;
}
// l'arc blanc (repos, bandé à moitié, bandé)
function vmLegArc(draw) {
  const pb = new PixelBuf(VM_W, VM_H), ob = new PixelBuf(VM_W, VM_H), wood = ramp(['#9a978a', '#c8c5b8', '#e8e6dc', '#fbfaf4']);
  const bx = 48, top = 6, bot = 96, bend = 10 + draw * 6;
  for (let y = top; y <= bot; y++) { const t = (y - top) / (bot - top); const x = bx - Math.sin(t * Math.PI) * bend; for (let w = 0; w < 4; w++) ob.set(Math.round(x + w), y, wood[1 + (w > 1 ? 1 : 0) + (w === 3 ? 1 : 0)]); }
  legGlowVM(pb, ob, [214, 236, 255]);
  legOver(pb, ob);
  const sx = bx + 3 + draw * 26;
  drawLine(pb, bx + 3, top, Math.round(sx), 52, [190, 230, 255]); drawLine(pb, bx + 3, bot, Math.round(sx), 52, [190, 230, 255]);
  if (draw > 0) {
    drawLine(pb, Math.round(sx), 52, 18, 52, PAL.wood[2], 2);
    fillPoly(pb, [[12, 52], [20, 48], [20, 56]], ramp(['#59606a', '#7e8792', '#aeb6bf']), () => 0.7);
    for (let k = 0; k < 6; k++) { pb.set(Math.round(sx) - k, 50 - (k >> 1), [230, 230, 230]); pb.set(Math.round(sx) - k, 54 + (k >> 1), [240, 240, 250]); }
    drawSphere(pb, sx + 6, 54, 8, SKIN_HAND, 2, { sq: 0.9 });
    fillPoly(pb, [[sx + 4, 60], [VM_W, 70], [VM_W, 100], [sx + 20, 100]], SLEEVE, () => 0.7);
  }
  drawSphere(pb, bx + 2, 56, 7, SKIN_HAND, 5, { sq: 1.2 });
  fillPoly(pb, [[0, 72], [bx - 4, 56], [bx + 8, 64], [20, 100], [0, 100]], SLEEVE, () => 0.7);
  edgeDarken(pb, 0.8);
  return pb;
}
// la lanterne dorée (voilée, allumée)
function vmLegLanterne(lit) {
  const pb = new PixelBuf(VM_W, VM_H), ob = new PixelBuf(VM_W, VM_H), gold = [176, 132, 44], dark = [110, 80, 30];
  fillPoly(pb, [[0, 100], [26, 100], [34, 70], [18, 62], [0, 74]], SLEEVE, () => 0.7);
  drawSphere(pb, 26, 64, 8, SKIN_HAND, 5, { sq: 0.9 });
  drawLine(ob, 26, 56, 26, 46, gold, 2);
  for (let y = 46; y < 90; y++) for (let x = 11; x < 41; x++) {
    const edge = x < 13 || x > 38 || y < 49 || y > 87 || x === 25 || y === 68;
    if (y < 49 && (x < 17 || x > 34)) continue;
    ob.set(x, y, edge ? (y < 49 || y > 87 ? gold : dark) : lit ? (Math.hypot(x - 25.5, y - 69) < 7 ? [255, 250, 226] : [255, 226, 150]) : [74, 66, 54], edge ? 255 : lit ? EMISSIVE_A : 255);
  }
  if (lit) legGlowVM(pb, ob, [255, 214, 120]);
  legOver(pb, ob);
  drawSphere(pb, 26, 64, 7, SKIN_HAND, 5, { sq: 0.6 });
  return pb;
}
// objets tenus dans la paume : pierre, livre, cor, clochette, larme, bourse, clé, chronographe
function vmLegPaume(kind) {
  const pb = new PixelBuf(VM_W, VM_H), ob = new PixelBuf(VM_W, VM_H);
  vmArm(pb, 84, 90);
  drawSphere(pb, 82, 84, 11, SKIN_HAND, 8, { sq: 0.7 });
  const S = (cx, cy, r, pal, o) => drawSphere(ob, cx, cy, r, ramp(pal), (cx * 3 + cy) | 0, o || {});
  const E = (x, y, c) => ob.set(Math.round(x), Math.round(y), c, EMISSIVE_A);
  let glow = [255, 206, 96];
  const cx = 74, cy = 60;
  if (kind === 'pierre_durn') {
    S(cx, cy + 4, 15, ['#34322f', '#4e4b46', '#6a665e', '#8a857c', '#a8a298'], { noise: 0.22 });
    for (let k = 0; k < 18; k++) E(cx - 9 + k, cy + 2 + Math.sin(k * 0.8) * 3, k % 3 ? [255, 150, 60] : [255, 210, 120]);
  } else if (kind === 'livre_sans_fin') {
    fillPoly(ob, [[cx - 26, cy - 10], [cx, cy - 4], [cx, cy + 20], [cx - 26, cy + 14]], ramp(['#c8bca0', '#e0d6bc', '#f0e8d4']), () => 0.8);
    fillPoly(ob, [[cx, cy - 4], [cx + 26, cy - 10], [cx + 26, cy + 14], [cx, cy + 20]], ramp(['#c8bca0', '#e0d6bc', '#f0e8d4']), () => 0.7);
    for (let l = 0; l < 6; l++) for (let k = 0; k < 18; k++) { if ((k * 7 + l * 3) % 5 === 0) continue; E(cx - 22 + k, cy - 5 + l * 3.4 + k * 0.23, [240, 196, 80]); E(cx + 4 + k, cy - 1 + l * 3.4 - k * 0.23, [240, 196, 80]); }
  } else if (kind === 'cor_mesnie') {
    for (let k = 0; k <= 40; k++) { const t = k / 40, x = cx - 26 + t * 50, y = cy + 14 - Math.sin(t * Math.PI) * 22 + t * 6, r = 2 + t * 8; S(x, y, r, ['#7a6a4a', '#b8a880', '#e6dcbc', '#fff6e0']); }
    for (const t of [0.35, 0.62]) { const x = cx - 26 + t * 50, y = cy + 14 - Math.sin(t * Math.PI) * 22 + t * 6; for (let k = -5; k <= 5; k++) ob.set(Math.round(x + k * 0.3), Math.round(y + k), [216, 168, 48]); }
    E(cx + 24, cy + 20, [255, 240, 200]);
  } else if (kind === 'clochette_aubin') {
    thickLine(ob, cx, cy - 30, cx, cy - 14, 4, ramp(['#4a3018', '#6a4a2a', '#8a6a3a']), 0.8);
    for (let y = cy - 14; y <= cy + 12; y++) { const w = 7 + (y - cy + 14) * 0.5; for (let x = Math.round(cx - w); x <= cx + w; x++) ob.set(x, y, rampPick(ramp(['#5a3a10', '#8a6024', '#c08a3a', '#e8b860']), 0.85 - Math.abs(x - cx + 3) * 0.03, x, y)); }
    for (let x = cx - 21; x <= cx + 21; x++) ob.set(x, cy + 13, [120, 84, 30]);
    S(cx, cy + 17, 4, ['#4a3010', '#7a5a28']); E(cx - 6, cy - 6, [255, 240, 190]); E(cx - 5, cy - 4, [255, 240, 190]);
  } else if (kind === 'larme_aela') {
    glow = [200, 140, 255];
    S(cx, cy + 6, 13, ['#a06a08', '#e0a818', '#ffd84a', '#fff4b0'], { alpha: EMISSIVE_A });
    for (let y = cy - 20; y <= cy - 5; y++) { const w = (y - cy + 20) * 0.62; for (let x = Math.round(cx - w); x <= cx + w; x++) ob.set(x, y, [255, 212, 70], EMISSIVE_A); }
    E(cx - 4, cy + 1, [255, 255, 255]); E(cx - 5, cy + 2, [255, 255, 240]); E(cx - 3, cy, [255, 255, 240]);
  } else if (kind === 'bourse_vesh') {
    glow = [170, 110, 255];
    S(cx, cy + 6, 16, ['#050408', '#100c16', '#1e1828', '#30283e']);
    for (let x = cx - 9; x <= cx + 9; x++) { ob.set(x, cy - 10, [40, 30, 56]); ob.set(x, cy - 9, [26, 20, 36]); }
    S(cx - 5, cy - 13, 4, ['#9a7414', '#e0b838', '#fff0a0']); S(cx + 4, cy - 14, 3.6, ['#9a7414', '#e0b838', '#fff0a0']);
    E(cx + 8, cy + 4, [176, 120, 255]); E(cx - 10, cy + 10, [150, 96, 230]);
  } else if (kind === 'cle_aelim') {
    glow = [150, 120, 255];
    for (let a = 0; a < 60; a++) { const t = a / 60 * TAU; for (const r of [7, 8, 9]) ob.set(Math.round(cx - 18 + Math.cos(t) * r), Math.round(cy - 14 + Math.sin(t) * r), r === 8 ? [80, 140, 220] : [50, 96, 170]); }
    thickLine(ob, cx - 12, cy - 8, cx + 22, cy + 26, 5, ramp(['#23508a', '#3a78c8', '#6aa8f0', '#a8d8ff']), 0.8);
    for (let k = 0; k < 6; k++) E(cx - 8 + k * 5.4, cy - 4 + k * 5.4, [190, 232, 255]);
  } else if (kind === 'chronographe') {
    glow = [170, 120, 255];
    S(cx, cy + 2, 19, ['#3a3e46', '#6a7280', '#a8b0bc', '#dce2ea']);
    S(cx, cy + 2, 15, ['#010103', '#06060c', '#0e0e1a']);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; E(cx + Math.sin(a) * 12, cy + 2 - Math.cos(a) * 12, [120, 200, 230]); }
    drawLine(ob, cx, cy + 2, cx, cy - 9, [120, 240, 255]); drawLine(ob, cx, cy + 2, cx + 8, cy + 5, [210, 150, 255]); drawLine(ob, cx, cy + 2, cx - 6, cy + 10, [250, 250, 255]);
    for (let y = cy - 22; y <= cy - 17; y++) for (let x = cx - 3; x <= cx + 3; x++) ob.set(x, y, [150, 156, 166]);
  }
  legGlowVM(pb, ob, glow);
  legOver(pb, ob);
  for (let k = 0; k < 4; k++) drawLine(pb, 72 + k * 5, 80, 70 + k * 5, 76, SKIN_HAND[2], 3);
  edgeDarken(pb, 0.8);
  return pb;
}
{
  const _bvm = buildViewModels;
  buildViewModels = function () {
    _bvm();
    const blue = { lame: ['#1e3050', '#2e4c78', '#4a74a8', '#7aa8d8', '#b8dcf8'], rune: [160, 240, 255], glow: [140, 210, 255], manche: ramp(['#2a1a0e', '#3e2a18', '#5a3e24', '#7a5a36']) };
    const gorr = { lame: ['#2a2724', '#3e3a35', '#57524a', '#746d62', '#948c7e'], rune: [255, 206, 90], glow: [255, 190, 90], manche: ramp(['#3a2412', '#55361c', '#744c28', '#94663a']) };
    const argent = { lame: ['#7a808a', '#a8b0bc', '#d4dae4', '#f4f8fc'], rune: [255, 255, 255], glow: [226, 234, 255], manche: ramp(['#5a4020', '#7a5a30', '#9a7a44']) };
    VM.pic_frappeurs = [vmLegTool('pioche', false, blue), vmLegTool('pioche', true, blue)];
    VM.cognee_gorr = [vmLegTool('hache', false, gorr), vmLegTool('hache', true, gorr)];
    VM.faucille_mere = [vmLegTool('faux', false, argent), vmLegTool('faux', true, argent)];
    VM.rapiere_valmont = [vmLegRapiere(false), vmLegRapiere(true)];
    VM.canne_dame = [vmLegCanne(false), vmLegCanne(true)];
    VM.arc_cerf = [vmLegArc(0), vmLegArc(0.5), vmLegArc(1)];
    VM.lanterne_aube = [vmLegLanterne(false), vmLegLanterne(true)];
    for (const id of ['pierre_durn', 'livre_sans_fin', 'cor_mesnie', 'clochette_aubin', 'larme_aela', 'bourse_vesh', 'cle_aelim', 'chronographe']) { const f = vmLegPaume(id); VM[id] = [f, f]; }
  };
}
// objets dont l'animation suit celle d'un objet ordinaire (arc, canne, lanterne)
const LEG_VM_ALIAS = { arc_cerf: 'arc', canne_dame: 'canne', lanterne_aube: 'lanterne' };

// ============================================================================
//  L'ÉTAT, LES RANGS, LA RÉVÉLATION
// ============================================================================
const legendaires = {
  spots: [], // lieux où une merveille attend (générés, ou apparus)
  S() {
    const s = farm.s;
    const L = s.legend || (s.legend = {});
    L.got = L.got || {}; L.used = L.used || {}; L.vigil = L.vigil || null; L.vesh = L.vesh || { dette: 0, pris: 0, jour: -1 };
    return L;
  },
  est(id) { return !!LEGENDAIRES[id]; },
  rang(id) { const L = LEGENDAIRES[id]; return L ? L.rang : null; },
  couleur(id) { const r = this.rang(id); return r ? LEG_RANGS[r].col : null; },
  a(id) { return !!this.S().got[id]; },              // déjà trouvé (même s'il est dans un coffre)
  porte(id) { return !!(farm.s && farm.s.inv && farm.s.inv[id] > 0); }, // sur soi
  list() { return LEG_ORDRE.filter((id) => this.a(id)); },
  // objets qu'on peut encore trouver dans cette partie (le chronographe : seulement s'il y a le complexe)
  possibles() { return LEG_ORDRE.filter((id) => id !== 'chronographe' || (typeof fondation !== 'undefined' && fondation.presente && fondation.presente())); },
  // on reçoit une merveille (la première fois : on la découvre)
  obtenir(id, src, pos) {
    if (!LEGENDAIRES[id]) return false;
    if (this.a(id) && src !== 'retour') return false;
    farm.give(id, 1);
    if (pos) play.flyer(id, pos, 1);
    const G = this.S().got[id];
    if (G && src) G.src = src;
    return true;
  },
  // appelé à la première acquisition (quel que soit le chemin : butin, don, pêche…)
  decouvert(id) {
    const S = this.S();
    if (S.got[id]) return;
    S.got[id] = { day: farm.s.day, src: '' };
    farm.s.stats = farm.s.stats || {};
    farm.s.stats.merveilles = Object.keys(S.got).length;
    this.fanfare(this.rang(id));
    setTimeout(() => this.reveler(id), 900);
  },
  fanfare(rang) {
    if (!sound.ok) return;
    const t = sound.at ? sound.at() : sound.ctx.currentTime + 0.01, f = rang === 'mythique' ? [392, 466, 587, 698, 932] : [523, 659, 784, 1047];
    f.forEach((x, i) => sound.tone(t + i * 0.13, 'triangle', x, x, 0.9, 0.035));
    sound.tone(t, 'sine', f[0] / 2, f[0] / 2, 2.2, 0.05, null, 0.4);
    if (rang === 'mythique') sound.whisper && sound.whisper(0, 0.25);
  },
  carte(id, court) {
    const L = LEGENDAIRES[id], R = LEG_RANGS[L.rang], G = this.S().got[id];
    return `<div class="leg-carte ${L.rang === 'mythique' ? 'leg-m' : 'leg-l'}"><img src="${iconURL(id)}" alt=""><div><b class="leg-nom">${esc(L.nom)}</b><span class="leg-rang">${esc(R.nom)}</span>` +
      (court ? '' : `<p class="leg-hist">${esc(L.histoire)}</p>`) + `<p class="leg-pouv">${esc(L.pouvoir)}</p>` +
      (G ? `<p class="leg-orig">${esc(L.origine)}${G.day ? ' — trouvé le jour ' + G.day : ''}</p>` : '') + '</div></div>';
  },
  reveler(id) {
    const L = LEGENDAIRES[id];
    if (!L) return;
    if (ui.panel || game.dying || (typeof cine !== 'undefined' && cine.on)) { setTimeout(() => this.reveler(id), 1500); return; }
    ui.open('#reader', `<h3 class="${L.rang === 'mythique' ? 'leg-m' : 'leg-l'}">${esc(L.nom)}</h3>${this.carte(id)}<button class="close">Refermer</button>`);
    const b = $('#reader .close'); if (b) b.onclick = () => ui.close();
  },
  // les indices (livre sans fin, dossiers de la Fondation)
  indices() { return this.possibles().filter((id) => !this.a(id)).map((id) => ({ id, texte: LEGENDAIRES[id].indice })); },
  // pour les tests
  donnerTout() { for (const id of LEG_ORDRE) if (!this.a(id)) farm.give(id, 1); },
};

// première acquisition : quel que soit le chemin (butin, coffre, don, pêche…)
{
  const _give = farm.give.bind(farm);
  farm.give = function (id, n) {
    _give(id, n);
    if (LEGENDAIRES[id] && (n === undefined || n > 0) && this.s && typeof game !== 'undefined' && game.world) legendaires.decouvert(id);
  };
}
// butins : une merveille ne sort qu'une fois ; certaines dorment dans des butins précis
{
  const _roll = rollLoot;
  const EN_PLUS = { valmont: [['rapiere_valmont', 1]], archives: [['livre_sans_fin', 0.35]], envers: [['bourse_vesh', 0.1]] };
  rollLoot = function (key, rnd) {
    let a = _roll(key, rnd);
    if (typeof farm === 'undefined' || !farm.s) return a;
    a = a.filter(([k]) => !LEGENDAIRES[k] || !legendaires.a(k));
    for (const [id, p] of EN_PLUS[key] || []) if (!legendaires.a(id) && !a.some(([k]) => k === id) && (rnd || Math.random)() < p * (id === 'bourse_vesh' ? bizarrerie() : 1)) a.push([id, 1]);
    return a;
  };
}

// ============================================================================
//  LES POUVOIRS
// ============================================================================
const legJour = (id, heures) => { const U = legendaires.S().used, h = farm.s.hours; return !(U[id] && h - U[id] < heures); };
const legUser = (id) => { legendaires.S().used[id] = farm.s.hours; };
const legLumiere = { aube: false };

// ------------------------------------------------ outils : pic, cognée, faucille, rapière
{
  const _harvest = play.harvest.bind(play);
  play.harvest = function (o, idx, H, dmg, p) {
    const id = farm.s.hand, t = OBJ_TYPES[o.t];
    if (id === 'pic_frappeurs' && H.tool === 'pioche') dmg = 999;
    if (id === 'cognee_gorr' && H.tool === 'hache') { dmg = t.id === 'giantoak' ? 21 : 999; game.shakeT = Math.max(game.shakeT || 0, 0.25); }
    return _harvest(o, idx, H, dmg, p);
  };
  const _collect = play.collect.bind(play);
  play.collect = function (o, idx, H, p) {
    const id = farm.s.hand;
    const ok = _collect(o, idx, H, p);
    if (!ok) return ok;
    if (id === 'pic_frappeurs' && H.veins) { const V = VEINS[o.v % VEINS.length]; const n = V.n[0] + Math.floor(Math.random() * (V.n[1] - V.n[0] + 1)); farm.give(V.item, n); play.flyer(V.item, p, n); sound.knock && setTimeout(() => sound.knock(1), 300); }
    else if (id === 'cognee_gorr' && H.tool === 'hache') { const n = 2 + Math.floor(Math.random() * 3); farm.give('bois', n); play.flyer('bois', p, n); }
    return ok;
  };
  const _swing = play.swing.bind(play);
  play.swing = function (eye, basis) {
    _swing(eye, basis);
    if (farm.s.hand === 'rapiere_valmont') { this.swingT = 0.32; this.cool = 0.3; sound.swish && sound.swish(1.6); }
  };
  // la faucille : tout ce qui est mûr autour de soi, d'un geste
  const _scythe = play.scythe.bind(play);
  play.scythe = function (eye, f) {
    _scythe(eye, f);
    if (farm.s.hand !== 'faucille_mere') return;
    let n = 0;
    for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) {
      if (dx * dx + dz * dz > 12.5) continue;
      const cx = Math.floor(eye[0] + dx) + 0.5, cz = Math.floor(eye[2] + dz) + 0.5, c = farm.crop(cx, cz);
      if (c && c.c && !c.tree && farm.ripe(c)) { this.harvestCrop(cx, cz, c, true); n++; }
    }
    const w = game.world, s = farm.s;
    w.forObjectsNearRay(eye, [0, -1, 0], 4, (o, idx) => {
      if (!w.live(o)) return;
      const t = OBJ_TYPES[o.t];
      if (!['tallgrass', 'wheat', 'reeds', 'fern', 'heather'].includes(t.id) || Math.hypot(o.x - eye[0], o.z - eye[2]) > 3.6) return;
      const H = HARVEST[t.id];
      o.gone = true; n++;
      if (H && H.regrow) s.forage[idx] = s.hours; else s.removed[idx] = 1;
      farm.give(t.id === 'wheat' ? 'ble' : 'foin', 1);
    });
    if (n) { w.objectsDirty = true; w.grid = null; sound.scythe && sound.scythe(); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; particles.spawn(eye[0] + Math.cos(a) * 2, eye[1] - 1.3, eye[2] + Math.sin(a) * 2, Math.cos(a) * 2, 1 + Math.random(), Math.sin(a) * 2, [0.9, 0.95, 1.0, 1], 0.05, 0.7, 4, true); } }
  };
  const _hc = play.harvestCrop.bind(play);
  play.harvestCrop = function (x, z, c, silent) {
    const cropId = farm.s.hand === 'faucille_mere' && c ? c.c : null;
    _hc(x, z, c, silent);
    if (cropId && CROPS[cropId]) { const item = CROPS[cropId].fruit || cropId; if (ITEMS[item]) farm.give(item, 1); }
  };
  // les meilleurs outils : la merveille d'abord
  const _best = farm.bestTool.bind(farm);
  farm.bestTool = function (kind) {
    for (const id of ['pic_frappeurs', 'cognee_gorr', 'faucille_mere', 'canne_dame', 'arc_cerf']) if (ITEMS[id].tool === kind && this.s && this.s.inv[id] > 0) return id;
    return _best(kind);
  };
}
// ------------------------------------------------ l'arc blanc : se bande d'un geste, ne fait pas fuir les bêtes
{
  const _bh = play.bowHold.bind(play);
  play.bowHold = function (dt, held) {
    if (farm.s.hand === 'arc_cerf' && held && this.bow > 0 && this.bow < 1) this.bow = Math.min(1, this.bow + dt * 1.6);
    return _bh(dt, held);
  };
  const _shoot = play.shoot.bind(play);
  play.shoot = function (k) {
    if (farm.s.hand !== 'arc_cerf') return _shoot(k);
    const _sc = entities.scare;
    entities.scare = function () {};
    try { _shoot(Math.max(k, 0.8)); } finally { entities.scare = _sc; }
    const a = this.arrows[this.arrows.length - 1];
    if (a) { a.vx *= 1.35; a.vy *= 1.35; a.vz *= 1.35; a.blanc = true; }
  };
}
// ------------------------------------------------ la canne d'argent (et la pêche, avec n'importe quelle canne)
{
  const _uf = play.updateFish.bind(play);
  play.updateFish = function (dt) {
    const s = farm.s, real = s.hand, it = ITEMS[real];
    if (this.fish && real !== 'canne' && it && it.tool === 'canne') { s.hand = 'canne'; try { return _uf(dt); } finally { s.hand = real; } }
    return _uf(dt);
  };
  const _cf = play.catchFish.bind(play);
  play.catchFish = function (F) {
    const h = game.world.time * 24, night = h < 5.5 || h > 20.5, s = farm.s;
    // la Dame rend une canne d'argent (grand lac, la nuit)
    if (F.zone === 'lac' && night && !legendaires.a('canne_dame')) {
      const known = typeof myths !== 'undefined' && myths.isFound('dame_du_lac');
      if (Math.random() < (known ? 0.03 : 0.006) * bizarrerie()) {
        legendaires.obtenir('canne_dame', 'peche', [F.x, F.y + 0.3, F.z]);
        splashAt(F.x, F.y, F.z); sound.catchFish && sound.catchFish();
        ui.subtitle('', '(Au bout de votre ligne, une autre canne, d’argent et de roseau. Personne ne l’a lâchée : on vous l’a rendue.)', 5);
        return;
      }
    }
    if (s.hand === 'canne_dame') {
      // le lac rend parfois ce qu'il a gardé
      if (Math.random() < 0.07) {
        const pickT = pick([['vieille_piece', 2], ['bijou', 1], ['perle', 1], ['vieille_piece', 3], ['relique', 1]]);
        if (ITEMS[pickT[0]]) { farm.give(pickT[0], pickT[1]); this.flyer(pickT[0], [F.x, F.y + 0.3, F.z], pickT[1]); splashAt(F.x, F.y, F.z); sound.catchFish && sound.catchFish(); ui.subtitle('', '(Le lac vous rend quelque chose qu’il avait gardé.)', 3); return; }
      }
      // prises rares plus fréquentes : les poissons rares pèsent trois fois plus, le temps d'une prise
      const boost = [];
      for (const k in FISH) if (FISH[k].w < 2) { boost.push([k, FISH[k].w]); FISH[k].w *= 3; }
      try { _cf(F); } finally { for (const [k, w0] of boost) FISH[k].w = w0; }
      return;
    }
    return _cf(F);
  };
}
// ------------------------------------------------ la pierre de Durn : les chutes ne blessent plus
{
  const _chute = corps.chute.bind(corps);
  corps.chute = function (v) {
    if (legendaires.porte('pierre_durn') && v > 10.5) {
      if (v > 13) { game.shakeT = Math.max(game.shakeT || 0, 0.4); sound.impact && sound.impact('hard'); ui.subtitle('', '(Vous touchez le sol comme on pose une pierre. La pierre de Durn est chaude dans votre poche.)', 3.5); }
      return;
    }
    return _chute(v);
  };
}
// ------------------------------------------------ clics : les objets qui s'utilisent
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held || !LEGENDAIRES[id]) return false;
  const s = farm.s, p = game.player;
  switch (id) {
    case 'lanterne_aube':
      legLumiere.aube = !legLumiere.aube; sound.click();
      if (legLumiere.aube) { sound.candle && sound.candle(); ui.subtitle('', '(La flamme s’ouvre, couleur de matin.)', 2); }
      play.cool = 0.4; return true;
    case 'cor_mesnie': legCor(); play.cool = 1.2; return true;
    case 'clochette_aubin': legClochette(); play.cool = 1.2; return true;
    case 'livre_sans_fin': legLivre(); play.cool = 0.6; return true;
    case 'bourse_vesh': legBourse(); play.cool = 0.6; return true;
    case 'cle_aelim': legCle(); play.cool = 1; return true;
    case 'chronographe': legChrono(false); play.cool = 1; return true;
    case 'pierre_durn': ui.subtitle('', pick(['(La pierre bat, très lentement, dans votre paume. Un battement. Puis rien, longtemps.)', '(Elle est tiède. Sous vos pieds, la terre semble plus sûre.)']), 3.5); play.cool = 0.8; return true;
    case 'larme_aela': ui.subtitle('', pick(['(La goutte d’or bat avec votre cœur. Quand vous la regardez, il fait un peu plus jour.)', '(Elle est tiède comme une joue.)']), 3.5); play.cool = 0.8; return true;
  }
  return false;
});
// bouton droit : le pic frappe (les Frappeurs répondent) ; les autres : on les contemple
HOOKS.secondary.push((eye, basis, it, id) => {
  if (!LEGENDAIRES[id]) return false;
  if (id === 'arc_cerf' || id === 'canne_dame') return false;
  if (id === 'pic_frappeurs') { legFrapper(eye); return true; }
  legendaires.reveler(id);
  return true;
});

function legFrapper(eye) {
  const w = game.world, p = game.player;
  if (!legJour('pic_frappe', 0.25)) { ui.subtitle('', '(La roche se tait. Les Frappeurs n’aiment pas qu’on les dérange trop souvent.)', 2.5); return; }
  legUser('pic_frappe');
  sound.knock && sound.knock(3); setTimeout(() => sound.knock && sound.knock(1), 1300);
  // le filon (ou le cristal) le plus proche, dans un rayon de 90 m
  let best = null, bd = 90;
  for (let i = 0; i < w.objects.length; i += 1) {
    const o = w.objects[i];
    if (Math.abs(o.x - p.pos[0]) > bd || Math.abs(o.z - p.pos[2]) > bd || o.gone) continue;
    const t = OBJ_TYPES[o.t];
    if (t.id !== 'vein' && t.id !== 'crystal' && t.id !== 'orepile') continue;
    const d = Math.hypot(o.x - p.pos[0], o.z - p.pos[2]);
    if (d < bd) { bd = d; best = o; }
  }
  setTimeout(() => {
    if (!best) { ui.subtitle('', '(Rien ne répond. Il n’y a pas de filon à portée des Frappeurs.)', 3); return; }
    const ang = Math.atan2(best.x - p.pos[0], best.z - p.pos[2]), rel = angDiff(p.yaw + Math.PI, ang);
    const side = Math.abs(rel) < 0.5 ? 'droit devant vous' : Math.abs(rel) > 2.6 ? 'derrière vous' : rel > 0 ? 'sur votre gauche' : 'sur votre droite';
    const loin = bd < 12 ? 'tout près' : bd < 35 ? 'pas loin' : 'plus loin';
    if (sound.ok) { const pan = sound.pan(clamp(-Math.sin(rel), -0.9, 0.9)); for (let k = 0; k < 3; k++) sound.noiseHit(sound.at(k * 0.32 + 0.2), 0.07, 'lowpass', 420, 1, 0.22 * clamp(1 - bd / 100, 0.2, 1), pan); sound.noiseHit(sound.at(1.4), 0.07, 'lowpass', 420, 1, 0.22, pan); }
    ui.subtitle('', `(Trois coups, puis un : on vous répond ${side}, ${loin}.)`, 4);
  }, 2400);
}
function legCor() {
  if (!legJour('cor_mesnie', 20)) { ui.subtitle('', '(Vous soufflez : rien qu’un râle de corne. Le cor doit reprendre son souffle, jusqu’à demain.)', 3); return; }
  legUser('cor_mesnie');
  const p = game.player, w = game.world;
  // le son : une longue note grave, puis la meute au loin
  if (sound.ok) {
    const t = sound.at();
    sound.voice(t, 'sawtooth', 146, 138, 2.6, 0.06, sound.lp(900), { vib: 5, vibDepth: 3 });
    sound.voice(t + 0.05, 'sawtooth', 219, 207, 2.4, 0.03, sound.lp(1200), { vib: 5, vibDepth: 4 });
    for (let k = 0; k < 6; k++) setTimeout(() => sound.bark && sound.bark(0.25, (Math.random() - 0.5) * 30), 2600 + k * 380);
    setTimeout(() => sound.thunder && sound.thunder(0.35), 3200);
  }
  game.shakeT = Math.max(game.shakeT || 0, 0.5);
  let n = 0;
  for (const e of entities.list) {
    if (e.dead || e.owner) continue;
    if (Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) > 90) continue;
    e.angry = 0; e.scaredT = 8; entities.startFlee(e, p.pos[0], p.pos[2]); e.timer = 14; n++;
  }
  const chasses = legChasserEtrange(110);
  if (typeof slender !== 'undefined' && slender.repousser) slender.repousser('cor');
  ui.subtitle('', n || chasses ? '(Le cor sonne sur toute la vallée. Quelque part au-dessus des nuages, des chevaux répondent. Tout ce qui était là s’en va.)' : '(Le cor sonne sur toute la vallée. Quelque part au-dessus des nuages, des chevaux répondent.)', 5);
}
// fait taire ce qui n'est pas de ce monde (silhouettes, Pâles, doubles, feux follets…) : renvoie le nombre
function legChasserEtrange(r) {
  if (!strange.ents) return 0;
  const p = game.player;
  const before = strange.ents.length;
  strange.ents = strange.ents.filter((e) => {
    if (e === strange.killerE) return true;
    if (!['figure', 'pale', 'double', 'wisp', 'veilleur'].includes(e.kind)) return true;
    return Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) > r;
  });
  strange.fear = 0;
  return before - strange.ents.length;
}
function legClochette() {
  const U = legendaires.S().used, h = farm.s.hours;
  U.clochette = (U.clochette || []).filter((t) => h - t < 24);
  if (U.clochette.length >= 2) { ui.subtitle('', '(La clochette ne tinte plus. Elle a assez parlé pour aujourd’hui.)', 3); return; }
  U.clochette.push(h);
  if (sound.ok) { const t = sound.at(); for (const f of [1318, 1976, 2637]) sound.tone(t, 'sine', f, f, 2.4, 0.03); sound.tone(t + 0.02, 'triangle', 659, 659, 1.8, 0.02); }
  const n = legChasserEtrange(140);
  if (strange.glitchT) strange.glitchT = 0;
  if (typeof slender !== 'undefined' && slender.repousser) slender.repousser('clochette');
  ui.subtitle('', n ? '(Un tintement sans écho. Au bord de votre vue, des formes se défont, comme de la buée.)' : '(Un tintement clair, sans écho. Le silence qui suit est plus propre.)', 4.5);
}
// ------------------------------------------------ le livre sans fin : la page du jour
function legLivre() {
  const s = farm.s, S = legendaires.S(), w = game.world, p = game.player;
  if (!S.livre || S.livre.day !== s.day) {
    const rnd = mulberry32(s.seed * 13 + s.day * 71);
    const pts = [];
    for (const k in w.lm) { const L = w.lm[k]; if (L.secret && !savoir.lieuConnu(k)) pts.push({ k, x: L.x, z: L.z, nom: L.name || LIEU_NAMES[k] || '' }); }
    for (const it of legendaires.indices()) pts.push({ leg: it.id, texte: it.texte });
    let page;
    if (!pts.length) page = 'La page est blanche. Puis, lentement, une seule phrase paraît : « Tu as tout vu. Maintenant, regarde encore. »';
    else {
      const P = pts[(rnd() * pts.length) | 0];
      if (P.leg) page = '« ' + P.texte + ' »';
      else {
        const dx = P.x - p.pos[0], dz = P.z - p.pos[2], d = Math.hypot(dx, dz);
        const dir = ['au nord', 'au nord-est', 'à l’est', 'au sud-est', 'au sud', 'au sud-ouest', 'à l’ouest', 'au nord-ouest'][(Math.round(Math.atan2(dx, -dz) / (Math.PI / 4)) + 8) % 8];
        const loin = d < 250 ? 'tout près d’ici, à quelques minutes de marche' : d < 700 ? 'à une bonne heure de marche' : 'loin, au bout de la vallée';
        const mots = ['Il y a un lieu que tu ne connais pas', 'Quelque chose attend', 'Un seuil s’ouvre, pour qui le cherche', 'Les anciens ont caché quelque chose'][(rnd() * 4) | 0];
        page = `« ${mots}, ${dir} de l’endroit où tu lis ces lignes, ${loin}. ${P.nom ? 'Les vivants l’appellent ' + P.nom + '.' : ''} Ne le dis à personne. »`;
      }
    }
    S.livre = { day: s.day, page };
  }
  sound.page && sound.page();
  ui.read('Le Livre sans fin — page du jour ' + s.day, S.livre.page, 'L’encre est encore fraîche. Demain, il y aura une autre page.');
}
// ------------------------------------------------ la bourse de Vesh : l'or, et le prix
function legBourse() {
  const s = farm.s, V = legendaires.S().vesh;
  if (V.jour === s.day) { ui.subtitle('', '(La bourse est vide, et froide. Elle se remplira cette nuit.)', 3); return; }
  V.jour = s.day;
  const n = 80 + Math.floor(Math.random() * 90);
  farm.earn(n); V.dette += n; V.pris += n;
  sound.coin && sound.coin(); sound.whisper && sound.whisper((Math.random() - 0.5) * 2, 0.25);
  ui.subtitle('', `(${n} pièces glissent dans votre main. Elles sont tièdes. Quelque part, quelqu’un vient de compter.)`, 4);
}
HOOKS.day.push(() => {
  const s = farm.s;
  if (!s || !s.legend) return;
  const S = legendaires.S(), V = S.vesh;
  // la bourse revient toujours
  if (S.got.bourse_vesh && !legendaires.porte('bourse_vesh')) {
    for (const k in s.chests || {}) if (s.chests[k] && s.chests[k].bourse_vesh) delete s.chests[k].bourse_vesh;
    for (const q of game.world.props) if (q.data && q.data.items && q.data.items.bourse_vesh) delete q.data.items.bourse_vesh;
    if (s.ship && s.ship.bourse_vesh) delete s.ship.bourse_vesh;
    farm.give('bourse_vesh', 1);
    setTimeout(() => ui.subtitle('', '(Sous votre oreiller, quelque chose de tiède : la bourse de cuir noir. Elle est revenue.)', 5), 2500);
  }
  // le prix de la Nuit
  if (V.dette >= 400 && Math.random() < 0.6) {
    V.dette -= 400;
    const prix = pick(['bete', 'recolte', 'nuit', 'sang', 'nom']);
    if (prix === 'bete' && s.animals && s.animals.some((a) => !a.dead && !a.lost && a.kind !== 'horse')) {
      const a = pick(s.animals.filter((q) => !q.dead && !q.lost && q.kind !== 'horse')); a.lost = 1; game.syncAnimals && game.syncAnimals();
      farm.mail('?', 'Sans timbre', 'Une bête pour une poignée d’or. Le compte est juste.', { strange: true });
    } else if (prix === 'recolte' && s.crops) {
      let k = 0; for (const q in s.crops) { const c = s.crops[q]; if (c.c && !c.dead && Math.random() < 0.35) { c.dead = true; k++; } }
      farm.dirtyProps = true;
      farm.mail('?', 'Sans timbre', k ? 'Tes champs ont noirci cette nuit. C’était le prix.' : 'Nous avons compté. Nous reviendrons.', { strange: true });
    } else if (prix === 'nuit' && strange.s) { strange.s.redTonight = true; farm.mail('?', 'Sans timbre', 'Cette nuit sera rouge. Tu l’as achetée.', { strange: true }); }
    else if (prix === 'sang') { game.player.hp = Math.max(20, game.player.hp - 35); setTimeout(() => ui.subtitle('', '(Vous vous réveillez faible, avec au bras une marque de dents qui n’est pas la vôtre.)', 5), 2500); }
    else { setTimeout(() => { sound.whisper && sound.whisper(0, 0.9); ui.subtitle('???', (s.prenom || '…') + '…', 3); }, 4000); }
  }
});
// ------------------------------------------------ Kel, la clé des Aëlim
function legCle() {
  const w = game.world, p = game.player, T = w.temple;
  if (!T) { ui.subtitle('', '(Vous tournez la clé dans le vide. Rien ne s’ouvre : ici, il n’y a pas de seuil.)', 3); return; }
  const dansTemple = p.underground && Math.hypot(p.pos[0] - T.x, p.pos[2] - T.z) < 140;
  if (dansTemple) { sound.lock && sound.lock(false); game.teleport(T.exit, 'Vous tournez la clé. L’air se plie comme une page, et la cascade vous éclabousse.'); return; }
  if (!legJour('cle_seuil', 20)) { ui.subtitle('', '(La clé tourne, mais le seuil ne s’ouvre qu’une fois par jour.)', 3); return; }
  legUser('cle_seuil');
  sound.lock && sound.lock(false); strange.glitchT = Math.max(strange.glitchT || 0, 0.4);
  game.teleport(T.arrive, 'Vous tournez la clé dans le vide. Quelque chose, très loin sous la montagne, fait « clac ».');
}
HOOKS.load.push(() => {
  if (game._legPortes) return;
  game._legPortes = true;
  const _ud = game.useDoor.bind(game);
  game.useDoor = function (dr) {
    if (dr && dr.locked && legendaires.porte('cle_aelim')) { dr.locked = false; sound.lock && sound.lock(false); ui.subtitle('', '(La clé de pierre bleue entre toute seule. La serrure s’ajuste à elle.)', 3); }
    return _ud(dr);
  };
  // l'objet en main : les merveilles qui s'animent comme un objet ordinaire (arc, canne, lanterne)
  const _vm = game.viewModel.bind(game);
  let lastHand = '';
  game.viewModel = function (p, dt) {
    const s = farm.s, real = s.hand, base = LEG_VM_ALIAS[real];
    if (real !== lastHand) { lastHand = real; this.vmKey = null; }
    if (!base || !VM[real]) return _vm(p, dt);
    const saved = VM[base], lant = this.lantern;
    VM[base] = VM[real]; s.hand = base;
    if (real === 'lanterne_aube') this.lantern = legLumiere.aube;
    try { return _vm(p, dt); } finally { s.hand = real; VM[base] = saved; this.lantern = lant; }
  };
});
// ------------------------------------------------ le chronographe : dix secondes en arrière
const legChronoBuf = [];
function legChrono(auto) {
  const L = legendaires.S(), s = farm.s, p = game.player;
  if (!auto && !legJour('chrono', 6)) { ui.subtitle('', '(Les aiguilles tremblent, mais refusent de reculer. Pas encore.)', 3); return false; }
  const snap = legChronoBuf.length ? legChronoBuf[0] : null;
  if (!snap) return false;
  if (!auto) legUser('chrono');
  p.pos = snap.pos.slice(); p.vel = [0, 0, 0]; p.yaw = snap.yaw; p.pitch = snap.pitch;
  p.hp = Math.max(snap.hp, auto ? 35 : snap.hp); p.food = Math.max(p.food, snap.food);
  if (auto) { corps.panser && corps.panser(); }
  legChronoBuf.length = 0;
  game.renderer.uploadCover(p.pos[0], p.pos[2]);
  strange.glitchT = Math.max(strange.glitchT || 0, 1.2); game.shakeT = 0.4;
  if (sound.ok) { const t = sound.at(); sound.voice(t, 'sawtooth', 1400, 90, 0.9, 0.04, sound.lp(3000)); for (let k = 0; k < 10; k++) sound.tone(t + k * 0.05, 'square', 2600 - k * 180, 2600 - k * 180, 0.02, 0.01); }
  ui.subtitle('', auto ? '(Tout se déchire, se replie. Vous êtes debout, dix secondes plus tôt, et vous vous souvenez de votre mort.)' : '(Les trois aiguilles tournent à l’envers. Le monde recule de dix secondes, comme une page qu’on rembobine.)', 5);
  return true;
}
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!playing || !farm.s || !legendaires.porte('chronographe')) { legChronoBuf.length = 0; return; }
  const p = game.player;
  legendaires._chT = (legendaires._chT || 0) - dt;
  if (legendaires._chT > 0) return;
  legendaires._chT = 0.5;
  legChronoBuf.push({ pos: p.pos.slice(), yaw: p.yaw, pitch: p.pitch, hp: p.hp, food: p.food });
  while (legChronoBuf.length > 20) legChronoBuf.shift();
});
// la mort refusée : la larme d'Aëla (une fois par semaine), le chronographe (une fois par jour)
HOOKS.death.push((cause) => {
  const s = farm.s;
  if (!s) return false;
  // ce que l'homme long emporte, rien ne le rend
  if (typeof cause === 'string' && cause.indexOf('Homme long') >= 0) return false;
  const S = legendaires.S(), p = game.player;
  if (legendaires.porte('larme_aela') && !(S.larmeJour && s.day - S.larmeJour < 7)) {
    S.larmeJour = s.day;
    p.hp = 55; corps.panser && corps.panser(); corps.soignerJambe && corps.soignerJambe(true);
    game.shakeT = 0.6; play.hurtFlash = 0;
    if (sound.ok) { const t = sound.at(); for (const f of [523, 784, 1047, 1568]) sound.tone(t, 'sine', f, f, 2.5, 0.025); }
    ui.subtitle('', '(Une chaleur d’or vous traverse. La larme d’Aëla a dit non. Pas cette fois.)', 5);
    return true;
  }
  if (legendaires.porte('chronographe') && !(S.chronoMort && s.day - S.chronoMort < 1) && legChronoBuf.length) {
    S.chronoMort = s.day;
    return legChrono(true);
  }
  return false;
});
// ------------------------------------------------ la larme d'Aëla : on guérit, lentement
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!playing || !farm.s || !legendaires.porte('larme_aela')) return;
  const p = game.player;
  if (p.hp < 100 && p.hp > 0) p.hp = Math.min(100, p.hp + dt * 0.6);
  legendaires._lT = (legendaires._lT || 0) - dt;
  if (legendaires._lT > 0) return;
  legendaires._lT = 20;
  if (corps.saignement() > 0) { corps.panser(); ui.subtitle('', '(Le sang s’arrête de lui-même. La larme est chaude contre votre peau.)', 3); }
  if (corps.jambeCassee() && !corps.C().aela) { corps.soignerJambe(false); corps.C().aela = 1; ui.subtitle('', '(Les os de votre jambe se cherchent, et se trouvent.)', 3); }
});

// ============================================================================
//  LES LUMIÈRES : la lueur des merveilles, la lanterne de l'Aube, les lieux
// ============================================================================
HOOKS.lights.push((eye) => {
  const L = [];
  if (!farm.s) return L;
  const p = game.player, id = farm.s.hand, t = game.time;
  if (legLumiere.aube && legendaires.porte('lanterne_aube')) {
    const fl = 1 + Math.sin(t * 3.1) * 0.04;
    L.push({ x: eye[0], y: eye[1] - 0.3, z: eye[2], r: 22, c: [1.25 * fl, 1.02 * fl, 0.62 * fl], d: 0 });
  } else if (LEGENDAIRES[id] && !game.noHand) {
    const R = LEG_RANGS[LEGENDAIRES[id].rang], k = 0.35 + Math.sin(t * 2.2) * 0.08;
    const b = cameraBasis(p.yaw, p.pitch);
    L.push({ x: eye[0] + b.f[0] * 0.5 + b.r[0] * 0.3, y: eye[1] - 0.35, z: eye[2] + b.f[2] * 0.5 + b.r[2] * 0.3, r: 3.2, c: R.lum.map((v) => v * k), d: 0.1 });
  }
  for (const sp of legendaires.spots) {
    if (sp.cache || !legSpotVisible(sp)) continue;
    const d = Math.hypot(sp.x - eye[0], sp.z - eye[2]);
    if (d > 40 || Math.abs(sp.y - eye[1]) > 20) continue;
    const R = LEG_RANGS[LEGENDAIRES[sp.item] ? LEGENDAIRES[sp.item].rang : 'legendaire'];
    L.push({ x: sp.x, y: sp.y + 0.6, z: sp.z, r: sp.item === 'lanterne_aube' ? 9 : 4.5, c: R.lum.map((v) => v * (0.8 + Math.sin(t * 2 + sp.x) * 0.15)), d });
  }
  return L;
});
// la lanterne de l'Aube : ce qui rôde n'entre pas dans son cercle
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!playing || !farm.s || !legLumiere.aube || !legendaires.porte('lanterne_aube')) return;
  const p = game.player;
  for (const e of strange.ents || []) {
    if (e.kind !== 'pale' && e.kind !== 'figure' && e.kind !== 'double') continue;
    const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
    if (d < 20 && d > 0.1) { const k = (20 - d) / d; e.x += (e.x - p.pos[0]) * k * Math.min(1, dt * 3); e.z += (e.z - p.pos[2]) * k * Math.min(1, dt * 3); e.y = game.world.heightAt(e.x, e.z); }
  }
  legendaires._wT = (legendaires._wT || 0) - dt;
  if (legendaires._wT > 0) return;
  legendaires._wT = 0.5;
  for (const e of entities.list) if (!e.dead && e.cfg && (e.cfg.pack || e.cfg.charge) && Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) < 16) { e.angry = 0; entities.startFlee(e, p.pos[0], p.pos[2]); e.timer = 4; }
});

// ============================================================================
//  OÙ LES TROUVER : lieux générés (après tout le reste), dons, forge, veille
// ============================================================================
// une merveille qui attend quelque part : { id, item, x, y, z, quand: [h0, h1] | null, cond, give, pioche, sousEau }
function legSpotVisible(sp) {
  if (!farm.s) return false;
  const give = sp.give || sp.item;
  if (legendaires.a(sp.item) || (give !== sp.item && (farm.s.legend && farm.s.legend.pris && farm.s.legend.pris[sp.id]))) return false;
  if (sp.jour && farm.s.day < sp.jour) return false;
  if (sp.quand) { const h = npcs.hour(); if (!(h >= sp.quand[0] && h < sp.quand[1])) return false; }
  if (sp.cond && !sp.cond()) return false;
  return true;
}
HOOKS.interVis.leg_spot = (it) => { const sp = legendaires.spots.find((q) => q.id === it.id); return !!sp && legSpotVisible(sp); };
HOOKS.inter.leg_spot = (it) => {
  const sp = legendaires.spots.find((q) => q.id === it.id);
  if (!sp || !legSpotVisible(sp)) return;
  const S = legendaires.S();
  if (sp.pioche && !farm.bestTool('pioche')) { ui.subtitle('', sp.pioche, 3.5); return; }
  if (sp.avant) { const r = sp.avant(); if (r === false) return; }
  const give = sp.give || sp.item;
  S.pris = S.pris || {}; S.pris[sp.id] = farm.s.day;
  if (LEGENDAIRES[give]) legendaires.obtenir(give, sp.id, [sp.x, sp.y + 0.4, sp.z]);
  else { farm.give(give, 1); play.flyer(give, [sp.x, sp.y + 0.4, sp.z], 1); }
  sound.lootOpen && sound.lootOpen();
  if (sp.apres) sp.apres();
};
// génération : les lieux où dorment les merveilles (seulement des points d'interaction : rien ne bouge dans le monde)
function addLegendaires(w, seed) {
  const rnd = mulberry32(seed * 313 + 17), H = (x, z) => w.heightAt(x, z);
  const pts = [];
  const push = (id, item, x, y, z, name, extra) => { pts.push(Object.assign({ id, item, x, y, z }, extra || {})); w.inter.push({ kind: 'leg_spot', id, x, y: y + 0.5, z, name, data: { item } }); };
  // le fer de la cognée : sous la couche du géant
  const lit = w.props.find((q) => q.id === 'lit_geant');
  if (lit) push('leg_fer_cognee', 'cognee_gorr', lit.x + Math.sin(lit.r) * 0.2, lit.y + 0.6, lit.z + Math.cos(lit.r) * 0.2, 'Glisser la main sous la couche du géant', { give: 'fer_cognee', cache: true });
  // le temple : la lanterne (chapelle d'Aëla, à l'aube), la pierre (contre le Dormeur)
  if (w.temple) {
    const T = w.temple;
    push('leg_lanterne', 'lanterne_aube', T.x - 54.3, T.y, T.z - 9, 'Une lanterne, au pied du mur, qui brûle sans huile', { quand: [4.5, 8.5] });
    push('leg_pierre', 'pierre_durn', T.x + 4.4, T.y + 0.1, T.z - 45.5, 'Une pierre ronde et tiède, contre le flanc du Dormeur', {
      apres: () => { game.shakeT = 1.2; sound.rumble && sound.rumble(); setTimeout(() => { sound.whisper && sound.whisper(0, 0.4); ui.subtitle('', '(Sous vos pieds, toute la montagne a bougé. Un peu. Comme un dormeur qui se retourne.)', 5); }, 900); },
    });
  }
  // le cor : dans une crevasse où personne n'est mort
  const C = w.crevasses && w.crevasses[7];
  if (C) { const [[ax, az], [bx, bz]] = C, x = lerp(ax, bx, 0.42), z = lerp(az, bz, 0.42); push('leg_cor', 'cor_mesnie', x, H(x, z) + 0.05, z, 'Quelque chose de corne, pris dans la glace bleue', { pioche: '(La glace tient la corne comme un poing. Il faudrait une pioche.)', avant: () => { sound.impact && sound.impact('hard'); puffAt(x, H(x, z) + 0.4, z, [190, 220, 240], 12, 2, true); } }); }
  // la clochette : au pied du clocher englouti
  if (w.drowned) { const D = w.drowned, a = rnd() * TAU, x = D.x + Math.cos(a) * 3.2, z = D.z + Math.sin(a) * 3.2; push('leg_clochette', 'clochette_aubin', x, H(x, z) + 0.05, z, 'Une clochette de bronze, dans la vase'); }
  w.legSpots = pts;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w.designed) { try { addLegendaires(w, w.seed || seed); } catch (e) { console.error('légendaires', e); } }
    return w;
  };
}
// dons : l'arc (pierre du Cerf, à l'aube), la faucille (pierre aux offrandes)
function legDons() {
  const w = game.world, s = farm.s, S = legendaires.S();
  legendaires.spots = (w.legSpots || []).slice();
  const add = (sp, name) => { legendaires.spots.push(sp); if (!w.inter.some((i) => i.id === sp.id)) w.inter.push({ kind: 'leg_spot', id: sp.id, x: sp.x, y: sp.y + 0.5, z: sp.z, name, data: { item: sp.item } }); };
  const pc = w.props.find((q) => q.id === 'pierre_cerf');
  if (S.donArc && pc && !legendaires.a('arc_cerf')) add({ id: 'leg_arc', item: 'arc_cerf', x: pc.x + 1.1, y: pc.y, z: pc.z + 0.6, quand: [4.5, 9], jour: S.donArc, cond: () => !!legendaires.S().donArc }, 'Un arc blanc, posé contre la pierre');
  const po = w.props.find((q) => q.id === 'pierre_offrandes');
  if (S.donFaucille && po && !legendaires.a('faucille_mere')) add({ id: 'leg_faucille', item: 'faucille_mere', x: po.x, y: po.y + 0.5, z: po.z, jour: S.donFaucille }, 'Une faucille d’argent, sur la pierre');
}
HOOKS.load.push(() => { if (farm.s) { legendaires.S(); legLumiere.aube = false; legChronoBuf.length = 0; legDons(); } });
HOOKS.day.push(() => {
  const s = farm.s;
  if (!s) return;
  const S = legendaires.S(), F = typeof faith !== 'undefined' ? faith.s() : null;
  // le Cerf Blanc laisse son arc à qui l'a honoré et n'a pas tué de cerf depuis sept jours
  if (!S.donArc && !legendaires.a('arc_cerf') && typeof myths !== 'undefined' && myths.isFound('cerf_blanc') && F && faith.lvl('anciens') >= 1 && ((F.offers.cerf || 0) + (F.prayed.cerf ? 1 : 0)) >= 2 && s.day - (S.cerfTue || -99) >= 7 && Math.random() < 0.4 * bizarrerie()) S.donArc = s.day;
  // la Mère des Moissons prête sa faucille
  if (!S.donFaucille && !legendaires.a('faucille_mere') && s.flags && s.flags.got_relique_poupee && F && (F.offers.mere || 0) >= 7) S.donFaucille = s.day;
  legDons();
});
// tuer un cerf : le Cerf Blanc s'en souvient
{
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) {
    const r = _hc(e, dmg, eye);
    if (e && e.dead && /deer|roe|stag|cerf|chevreuil|biche/.test(e.kind || '')) { const S = legendaires.S(); S.cerfTue = farm.s.day; if (S.donArc && !legendaires.a('arc_cerf')) S.donArc = 0; }
    return r;
  };
}
// ------------------------------------------------ la forge d'en bas : la forgeronne naine
const LEG_FORGE = {
  pic_frappeurs: { need: { coeur_montagne: 1, lingot_acier: 4, gemme: 2 }, dit: 'Les Frappeurs m’ont montré un dessin, quand j’étais petite. Un pic bleu. Je ne l’ai jamais forgé : il faut un cœur de montagne.', fait: 'Tiens. Ne le prête à personne. Et quand tu frappes, frappe poliment.' },
  cognee_gorr: { need: { fer_cognee: 1, lingot_acier: 2, cuir: 2, bois: 6 }, dit: 'Un fer de Gorr… Ça se voit à la trempe : personne n’en fait plus depuis que les pierres sont debout. Je peux te l’emmancher.', fait: 'Voilà. Le manche est à ta taille. Le fer, lui, n’est à la taille de personne.' },
};
{
  const _opt = talk.options.bind(talk);
  talk.options = function () {
    const opts = _opt(), n = this.n;
    // on n'offre pas une merveille à un habitant
    const gi = opts.findIndex((o) => o.act === 'gift');
    if (gi >= 0 && LEGENDAIRES[farm.s.hand]) opts.splice(gi, 1);
    if (n && n.id === 'nain_forgeronne' && n.st && n.st.alive !== false) {
      const i = opts.findIndex((o) => o.act === 'bye');
      opts.splice(i >= 0 ? i : opts.length, 0, { label: 'Pourriez-vous forger une pièce de maître ?', act: 'leg_forge' });
    }
    return opts;
  };
  const _ch = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (act === 'leg_forge') {
      const lines = [], opts = [];
      for (const id of ['pic_frappeurs', 'cognee_gorr']) {
        if (legendaires.a(id)) continue;
        const F = LEG_FORGE[id];
        if (id === 'cognee_gorr' && !farm.count('fer_cognee')) continue;
        lines.push(F.dit + ' Il me faut : ' + Object.keys(F.need).map((k) => F.need[k] + ' ' + itemName(k).toLowerCase()).join(', ') + '.');
        opts.push({ label: (farm.has(F.need) ? 'Forgez-moi : ' : 'Il me manque encore de quoi faire : ') + LEGENDAIRES[id].nom, act: 'leg_forge:' + id });
      }
      opts.push({ label: 'Une autre fois', act: 'chat' });
      if (!lines.length) return this.view(legendaires.a('pic_frappeurs') && legendaires.a('cognee_gorr') ? 'J’ai forgé ce que j’avais à forger. Le reste, ce sont des clous.' : 'Des pièces de maître ? Apporte-moi quelque chose qui en vaille la peine. Un fer que personne ne sait plus faire, ou un cœur de montagne.', this.options());
      return this.view(lines.join(' '), opts);
    }
    if (act.startsWith('leg_forge:')) {
      const id = act.slice(10), F = LEG_FORGE[id];
      if (!F || legendaires.a(id)) return this.view('Hm.', this.options());
      if (!farm.has(F.need)) return this.view('Il te manque des choses, grand. Reviens quand tu auras tout. Je ne forge pas à moitié.', this.options());
      for (const k in F.need) farm.take(k, F.need[k]);
      sound.anvil && sound.anvil(); setTimeout(() => sound.anvil && sound.anvil(), 600); setTimeout(() => sound.anvil && sound.anvil(), 1200);
      npcs.addAmitie(this.n, 20);
      setTimeout(() => legendaires.obtenir(id, 'forge'), 1500);
      return this.view(F.fait, this.options());
    }
    return _ch(act);
  };
}
// ------------------------------------------------ la veille d'Aëla : toute une nuit dehors, sans lumière, sans dormir
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  const s = farm.s;
  if (!s || legendaires.a('larme_aela') || game.dying || (typeof cine !== 'undefined' && cine.on)) return;
  legendaires._vT = (legendaires._vT || 0) - dt;
  if (legendaires._vT > 0) return;
  legendaires._vT = 0.5;
  const S = legendaires.S(), w = game.world, p = game.player, h = npcs.hour();
  const nuit = h >= 22 || h < 5.6;
  if (!nuit) {
    // l'aube (le jour change à six heures) : la nuit a-t-elle été veillée ?
    if (S.vigil && h >= 6 && h < 8.5 && S.vigil.day === s.day && !S.vigil.rompu && S.vigil.ok >= 6.4) { S.vigil = null; legAela(); }
    else if (S.vigil && !(h >= 5.6 && h < 8.5)) S.vigil = null;
    return;
  }
  // la veille appartient au jour qui se lèvera à six heures
  const jour = s.day + 1;
  if (!S.vigil || S.vigil.day !== jour) S.vigil = { day: jour, ok: 0, hors: 0, rompu: false, last: s.hours };
  const V = S.vigil, dH = s.hours - (V.last ?? s.hours);
  V.last = s.hours;
  if (V.rompu) return;
  if (dH > 0.75) { V.rompu = true; return; } // on a dormi (ou on s'est effondré)
  const dehors = !p.underground && !w.covered(eye[0], eye[1], eye[2]);
  const lumiere = game.lantern || legLumiere.aube || (typeof fondation !== 'undefined' && fondation.torche && fondation.torche());
  if (dehors && !lumiere) V.ok += Math.max(0, dH);
  else { V.hors += Math.max(0, dH); if (V.hors > 0.5) V.rompu = true; }
});
async function legAela() {
  const s = farm.s, p = game.player, w = game.world;
  if (legendaires.a('larme_aela')) return;
  const f = cameraBasis(p.yaw, 0).f, x = p.pos[0] + f[0] * 4, z = p.pos[2] + f[2] * 4, y = w.heightAt(x, z);
  const vu = { x, y, z, t: 0 };
  legendaires.aela = vu;
  if (sound.ok) { const t = sound.at(); for (const [k, fr] of [[0, 392], [0.4, 523], [0.8, 659], [1.2, 784], [1.8, 1047]]) sound.tone(t + k, 'sine', fr, fr, 3.2, 0.028, null, 0.3); }
  const eye = p.eyePos();
  await cine.jouer([
    { dur: 3.5, de: { pos: eye, look: [x, y + 1.2, z] }, a: { pos: [eye[0] + f[0] * 0.8, eye[1] + 0.1, eye[2] + f[2] * 0.8], look: [x, y + 1.6, z] }, texte: 'Le ciel pâlit. Au bout du pré, la lumière ne vient pas du soleil.' },
    { dur: 4, orbite: { c: [x, y + 1.4, z], r: 5, h: 0.6, a0: Math.atan2(eye[0] - x, eye[2] - z), a1: Math.atan2(eye[0] - x, eye[2] - z) + 0.5 }, texte: 'Elle ne dit rien. Elle vous regarde comme on regarde un enfant qui a tenu toute la nuit.', qui: 'Aëla' },
    { dur: 3, de: { pos: [x + f[0] * -2.5, y + 1.6, z + f[2] * -2.5], look: [x, y + 0.2, z] }, texte: 'Là où elle a posé les yeux, il reste une goutte d’or.', fondu: null },
  ], { passer: true });
  legendaires.aela = null;
  legendaires.obtenir('larme_aela', 'veille', [x, y + 0.3, z]);
}
// ------------------------------------------------ le Kel : pêché dans le trou du lac gelé
HOOKS.load.push(() => {
  if (game._legGlace) return;
  game._legGlace = true;
  const _pg = HOOKS.inter.peche_glace;
  if (!_pg) return;
  HOOKS.inter.peche_glace = (it) => {
    // n'importe quelle canne fait l'affaire
    if (!farm.count('canne') && farm.bestTool('canne')) { farm.s.inv.canne = 1; try { return legGlace(it, _pg); } finally { delete farm.s.inv.canne; } }
    return legGlace(it, _pg);
  };
});
function legGlace(it, _pg) {
  const F = typeof vallee !== 'undefined' ? vallee.fish : null;
  if (F && F.bite > 0 && !legendaires.a('cle_aelim')) {
    const mot = savoir.motConnu('aelin', 'kel') || savoir.motConnu('aelin', 'sera');
    if (Math.random() < (mot ? 0.12 : 0.03) * bizarrerie()) {
      vallee.fish = null;
      legendaires.obtenir('cle_aelim', 'glace', [it.x, it.y + 0.3, it.z]);
      sound.splash && sound.splash();
      ui.subtitle('', '(La ligne se tend, très lourde, puis cède d’un coup : au bout, une clé de pierre bleue, sans dents, qui luit sous le givre.)', 5.5);
      return;
    }
  }
  return _pg(it);
}

// ============================================================================
//  LE DESSIN DES MERVEILLES QUI ATTENDENT (et de l'Aube)
// ============================================================================
function legModele(E, item, t) {
  const R = LEG_RANGS[LEGENDAIRES[item] ? LEGENDAIRES[item].rang : 'legendaire'];
  switch (item) {
    case 'lanterne_aube':
      E.bx(0, 0, 0, 0.26, 0.04, 0.26, rgbf('#b08a30'), TL.gold); E.fl = FX_EMIT; E.bx(0, 0.04, 0, 0.2, 0.3, 0.2, [1.4, 1.2, 0.8], TL.glass); E.fl = 0;
      E.bx(0, 0.34, 0, 0.26, 0.04, 0.26, rgbf('#b08a30'), TL.gold); E.bx(0, 0.38, 0, 0.03, 0.12, 0.03, rgbf('#b08a30'), TL.gold); break;
    case 'pierre_durn':
      E.box(0, 0.14, 0, 0.3, 0.26, 0.3, rgbf('#6a665e'), TL.stone, t * 0.02); E.fl = FX_EMIT; E.box(0, 0.16, 0.151, 0.2, 0.02, 0.01, [1.3, 0.6, 0.2], 0); E.fl = 0; break;
    case 'cor_mesnie':
      E.fl = FX_EMIT; E.bx(0, 0, 0, 0.9, 0.35, 0.6, [0.35, 0.55, 0.75], TL.glass); E.fl = 0;
      for (let k = 0; k < 5; k++) E.box(-0.3 + k * 0.15, 0.28 + Math.sin(k / 4 * Math.PI) * 0.12, 0, 0.12 + k * 0.03, 0.12 + k * 0.03, 0.14, rgbf('#e6dcbc'), TL.bone, 0, 0, k * 0.2); break;
    case 'clochette_aubin':
      E.box(0, 0.12, 0, 0.22, 0.2, 0.22, rgbf('#a07430'), TL.gold, 0, 0.9, 0.3); E.box(0.02, 0.2, 0.1, 0.05, 0.18, 0.05, rgbf('#6a4a2a'), TL.wood, 0, 0.9, 0.3); break;
    case 'arc_cerf':
      for (let k = 0; k < 7; k++) E.box(Math.sin(k / 6 * Math.PI) * 0.18, 0.1 + k * 0.2, 0, 0.05, 0.22, 0.05, rgbf('#f0eee4'), TL.plain, 0, 0, (k - 3) * 0.09);
      E.fl = FX_EMIT; E.bx(-0.02, 0.1, 0, 0.01, 1.3, 0.01, [0.8, 0.95, 1.2], 0); E.fl = 0; break;
    case 'faucille_mere':
      for (let k = 0; k < 6; k++) { const a = k / 5 * 2.6; E.box(Math.cos(a) * 0.22, 0.03, Math.sin(a) * 0.22, 0.12, 0.02, 0.05, [1.1, 1.12, 1.2], TL.metal, -a); }
      E.bx(0.3, 0, -0.1, 0.18, 0.04, 0.05, rgbf('#8a6a3a'), TL.wood); break;
    default:
      E.fl = FX_EMIT; E.box(0, 0.15, 0, 0.14, 0.14, 0.14, R.lum.map((v) => v * 1.4), 0, t, t * 0.7); E.fl = 0;
  }
}
HOOKS.draw.push((buf, sbuf, cam, t) => {
  if (!farm.s) return;
  const p = game.player;
  for (const sp of legendaires.spots) {
    if (sp.cache || !legSpotVisible(sp)) continue;
    if (Math.abs(sp.x - cam[0]) > 45 || Math.abs(sp.z - cam[2]) > 45 || Math.abs(sp.y - cam[1]) > 25) continue;
    PE.buf = buf; PE.fl = 0; PE.frame(sp.x, sp.y, sp.z, sp.r || (sp.x * 0.37), 1);
    legModele(PE, sp.item, t);
    if (Math.random() < 0.04) particles.spawn(sp.x + (Math.random() - 0.5) * 0.6, sp.y + 0.3, sp.z + (Math.random() - 0.5) * 0.6, 0, 0.5, 0, sp.item === 'larme_aela' ? [1, 0.9, 0.5, 1] : [1, 0.85, 0.45, 1], 0.05, 1.2, -0.2, true);
  }
  // l'Aube, au matin de la veille
  const A = legendaires.aela;
  if (A) {
    A.t += 0.016;
    PE.buf = buf; PE.frame(A.x, A.y, A.z, Math.atan2(p.pos[0] - A.x, p.pos[2] - A.z), 1);
    PE.fl = FX_EMIT;
    const k = Math.min(1, A.t / 2), c = [1.35 * k, 1.2 * k, 0.8 * k];
    PE.bx(0, 0, 0, 0.5, 1.4, 0.36, c, TL.cloth); PE.bx(0, 1.4, 0, 0.36, 0.42, 0.26, c, TL.cloth); PE.bx(0, 1.82, 0, 0.24, 0.28, 0.24, [1.5 * k, 1.4 * k, 1.1 * k], TL.skin);
    PE.box(0, 2.1, -0.18, 1.5, 1.5, 0.04, [1.2 * k, 1.0 * k, 0.5 * k], TL.gold); PE.fl = 0;
  }
});
HOOKS.lights.push((eye) => {
  const A = legendaires.aela;
  if (!A) return [];
  return [{ x: A.x, y: A.y + 1.6, z: A.z, r: 18, c: [1.4, 1.2, 0.8], d: Math.hypot(A.x - eye[0], A.z - eye[2]) }];
});
