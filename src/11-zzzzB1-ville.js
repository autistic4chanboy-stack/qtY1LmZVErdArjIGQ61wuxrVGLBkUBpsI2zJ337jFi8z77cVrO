// ============================================================================
//  LA VILLE, ET TOUT CE QUI A UN ÉTAGE (agent B1)
//  « Je veux qu'on puisse rentrer dans chaque bâtiment. »
//  - Les ÉTAGES : la mairie (les archives, le garde-meuble de la commune),
//    l'auberge (six chambres d'hôtes, et la sept), la boulangerie (la réserve de
//    farine, le coin d'Émile), la poste (les lettres en souffrance), les maisons
//    aux volets bleus, du tisserand, Rivière, aux lilas, Vernet, Delorme, du
//    Rempart, l'échoppe de l'alchimiste, le ranch, et les deux niveaux de la
//    bibliothèque. On y monte par une échelle de meunier, contre un mur, à
//    travers une trappe (le battant relevé) ; E au pied de l'échelle, E au bord
//    de la trappe : on grimpe, on voit le plafond passer, on prend pied.
//  - Les HUIT TOURS des remparts : creusées (murs de 0,55 m, 0,5 aux portes),
//    une porte au pied côté ville (fermée la nuit, comme les autres), un magasin
//    ou le treuil du pont-levis au pied, une salle haute (le corps de garde :
//    paillasses, râtelier, le coffre des gardes) aux tours d'angle, et en haut,
//    au niveau du CHEMIN DE RONDE, des passages : on marche sur les remparts d'une
//    tour à l'autre (une main courante côté ville).
//  - Le CLOCHER : un beffroi à 11,3 m (une baie et ses abat-sons sur chaque
//    face, la cloche à sa poutre, sa corde jusqu'au porche) ; l'échelle ferme la
//    nuit et pendant la messe ; « Regarder la vallée » se fait là-haut. La TENTE
//    de la diseuse : on y entre, jusqu'à sa table (un rideau quand elle n'y est pas).
//  - Ce qu'il y a là-haut : meubles, endroits à fouiller (11-zzz98-fouilles.js :
//    chez quelqu'un, c'est voler ; chez les disparus, non), lits (11-zzz95), des
//    lampes qui ne brillent que la nuit, des papiers (sacoche, onglet Lettres),
//    des détails qui disent qui vit là.
//  - Les règles qui regardent « dans quel bâtiment est-on » valent à l'étage
//    (game.insideBuilding : location, crochetage, vol ; les témoins d'en bas ne
//    voient pas l'étage, ils entendent parfois) ; à l'étage d'une maison louée ou
//    achetée, on meuble (11-zzzz4-meubles.js).
//  Génération : après tout le reste (dernière passe : 11-zzzz9-souterrain0.js),
//  tirage propre (graine ^ 0xB1B1) ; les blocs des tours et des plafonds sont
//  transformés sur place, le reste est ajouté au bout des listes.
//  État : farm.s.b1 = { vus: {…} } (presque rien : le monde est régénéré).
//  API : b1 (niveau(x, y, z), etage(), grimper(it), tours()).
// ============================================================================
Object.assign(LIEU_NAMES, {
  tour_se: 'la tour des Douves', tour_ne: 'la tour du Guet', tour_nw: 'la tour aux Corneilles', tour_sw: 'la tour de la Poudre',
  tour_sud_e: 'la tour est de la porte sud', tour_sud_o: 'la tour ouest de la porte sud', tour_nord_e: 'la tour est de la porte nord', tour_nord_o: 'la tour ouest de la porte nord',
});
const B1_TOURS_NOMS = new Set(['tour_se', 'tour_ne', 'tour_nw', 'tour_sw', 'tour_sud_e', 'tour_sud_o', 'tour_nord_e', 'tour_nord_o']);

// ---------------------------------------------------------------- endroits à fouiller nouveaux, et leurs titres
Object.assign(F2_TYPES, {
  b1_registres: { lab: 'Feuilleter les registres', table: 'f2_archives', d: 1.8, son: 'papier', p: 0.55, r: 4, h: 1.0 },
  b1_souffrance: { lab: 'Fouiller le casier des lettres en souffrance', table: 'f2_tri', d: 1.6, son: 'papier', p: 0.85, r: 3, h: 1.2 },
  b1_draps: { lab: 'Fouiller les rouleaux de drap', table: 'f2_tissus', d: 1.3, son: 'tissu', p: 0.2, r: 4, h: 0.8 },
  b1_farine: { lab: 'Fouiller les sacs de farine', table: 'f2_farine', d: 1.2, son: 'farine', p: 0, r: 2, h: 0.6 },
});
if (typeof BU_TITRES !== 'undefined') Object.assign(BU_TITRES, { b1_registres: 'Les registres', b1_souffrance: 'Les lettres en souffrance', b1_draps: 'Les rouleaux de drap', b1_farine: 'Les sacs de farine' });

// ---------------------------------------------------------------- les papiers de là-haut (onglet Lettres de la sacoche)
const B1_PAPIERS = {
  b1_inventaire: { pool: 'b1_mairie', t: 'Inventaire après décès', x: 'Succession de la veuve Varenne. Un lit de noyer, sa paillasse. Une armoire à deux portes. Une horloge, arrêtée à trois heures dix. Un fauteuil. Linge : néant. Numéraire : néant.\n\nEn marge, de la main de {npc:maire} : « Aucun héritier ne s’est présenté. Il n’y a pas d’héritiers. Au garde-meuble. »' },
  b1_remparts: { pool: 'b1_mairie', t: 'Rapport sur les remparts', x: 'Tour de la Poudre : vide, la poudre vendue depuis longtemps. Tour du Guet : sert au garde. Tour des Douves : on y entend l’eau, même par temps sec. Tour aux Corneilles : les oiseaux y nichent ; personne ne les a jamais vus y entrer.\n\nConclusion : « Les murs tiendront. Je ne sais pas contre quoi. »', s: 'L’ingénieur des ponts, en tournée' },
  b1_voyageur: { pool: 'b1_auberge', t: 'Lettre d’un voyageur, jamais postée', x: 'Ma chère Louise,\n\nJe suis retenu dans une petite ville où l’on relève les ponts le soir, comme au temps des sièges. L’auberge est propre, la soupe est bonne. On m’a donné la cinq.\n\nCette nuit, dans la chambre d’à côté, quelqu’un a tourné une cuillère dans un bol, longtemps. Ce matin, l’aubergiste m’a dit que la sept était vide depuis des années.\n\nJe repars demain. Je t’embrasse.', s: 'Ton Henri' },
  b1_anselme: { pool: 'b1_souffrance', t: 'Lettre en souffrance', x: 'Adressée à « Monsieur Anselme, la vieille ferme ». Le cachet est intact.\n\nAu dos, la postière a noté : « Le destinataire ne vient plus chercher son courrier. » Puis, plus tard, d’une autre encre : « Il est venu. Il a regardé la lettre longtemps, et il l’a laissée. »' },
  b1_lefevre: { pool: 'b1_souffrance', t: 'Lettre en souffrance', x: '« Aux enfants Lefèvre, maison aux volets bleus. »\n\nOuverte, puis recollée. Une seule feuille : « Votre tante nous écrit que le petit ne parle plus. Il dessine des fenêtres. Ne revenez pas, c’est nous qui viendrons. »\n\nPersonne n’est venu.' },
  b1_sept: { pool: 'b1_souffrance', t: 'Lettre en souffrance', x: '« À celui qui dort dans la sept, auberge du Coq Tordu. »\n\nL’enveloppe ne contient qu’un brin de thym sec. Le timbre n’est pas oblitéré : la lettre n’est jamais passée par la poste. Elle était dans la boîte, un matin.' },
  b1_ferrand: { pool: 'b1_sergent', t: 'Ordre d’affectation', x: 'Le sergent Lucien Ferrand rejoindra son poste à {ville}, au guet des remparts, le premier Primedi du mois. Un logement lui sera fourni par la commune.\n\nAgrafé dessous, un télégramme : « FERRAND PARTI À L’HEURE. ARRIVÉE ? »\n\nPuis un autre : « RÉPONDEZ. »' },
  b1_augustin: { pool: 'b1_augustin', t: 'Carnet d’Augustin', x: 'Les comptes du ranch, d’une écriture appliquée : les foins, les fers, l’avoine de la jument grise.\n\nLa dernière page n’a pas de chiffres : « Ils se tournent tous vers le hameau, même la grise. Je vais voir. Je rentre pour la traite. »' },
  b1_billet_garde: { pool: 'b1_garde', t: 'Billet du garde', x: 'Au crayon, sur un papier plié en quatre : « Si je ne redescends pas avant le lever des ponts, ne montez pas me chercher. Fermez la trappe, et faites dire une messe. »', s: '{npc:garde}' },
  b1_cahier_bleu: { pool: 'maison_a', t: 'Un cahier de dessins', x: 'Des pages et des pages de fenêtres, au crayon bleu. Sur les premières, un monsieur se tient derrière la vitre. Sur les suivantes, il est assis au bord du lit.\n\nLes dernières pages sont blanches, sauf une, où le petit a écrit son nom, et un autre nom, qu’on ne lit pas.' },
  b1_commandes: { pool: 'maison_b', t: 'Livre des commandes', x: 'La dernière ligne, d’une main qui tremble : « Douze aunes de drap couleur de nuit, pour la maison aux lilas. Livré. » Dans la colonne du prix, rien.\n\nÀ la maison aux lilas, on n’avait commandé aucun drap.' },
  b1_craie: { pool: 'maison_c', t: 'Billet coincé sous la plinthe', x: '« Une croix à la craie au pied de chaque lit. Si, au matin, la croix est effacée, compter les enfants. »\n\nDessous, de la même main : « Les croix étaient effacées. Le compte était bon. Ils avaient les pieds noirs de terre. »' },
  b1_regiment: { pool: 'maison_d', t: 'Lettre du régiment', x: 'Madame,\n\nNous avons le regret de vous apprendre que votre mari est porté disparu depuis le combat du 14. Ses effets vous seront renvoyés.\n\nEn travers, de la main de la veuve : « Ses effets sont arrivés. Ses bottes étaient crottées de frais. »' },
  b1_vernet: { pool: 'vide4', t: 'Lettre de la veuve Vernet', x: 'Ma fille,\n\nJe te rejoins avant l’hiver. Je laisse la maison au maire, avec ce qu’il y a dedans. Ne me demande pas de revenir chercher le reste.\n\nLe petit cahier, je l’ai laissé exprès. Qu’il reste là où il a été écrit.' },
  b1_delorme: { pool: 'vide5', t: 'Mot plié sous le lit', x: 'Au crayon, d’une écriture d’enfant : « Il fait clair, en haut, le Vorndi. Maman dit que c’est nous qui allumons. Ce n’est pas nous. »' },
  b1_fauvel: { pool: 'alchimiste', t: 'Note de Fauvel', x: '« Le bocal ne se trouble que les nuits de lune rouge. Ces nuits-là, ne pas monter. Noter quand même. »\n\nEn dessous, d’une main moins sûre : « Monté. Noté. Il dormait. »' },
};
for (const id in B1_PAPIERS) { if (F2_PAPIERS[id]) continue; F2_PAPIERS[id] = B1_PAPIERS[id]; (F2_POOLS[B1_PAPIERS[id].pool] || (F2_POOLS[B1_PAPIERS[id].pool] = [])).push(id); }

// ---------------------------------------------------------------- géométrie (repère d'un bâtiment : x le long de la façade, z vers le fond)
const b1W = (f, lx, lz) => { const c = Math.cos(f.r), s = Math.sin(f.r); return [f.x + lx * c + lz * s, f.z - lx * s + lz * c]; };
const b1L = (f, x, z) => { const c = Math.cos(f.r), s = Math.sin(f.r), dx = x - f.x, dz = z - f.z; return [dx * c - dz * s, dx * s + dz * c]; };
// rectangle local [x0, x1, z0, z1] → bloc (repère f), de y0 à y1 (relatifs à f.y)
function b1Bloc(w, f, R, y0, y1, m, o) {
  const [x, z] = b1W(f, (R[0] + R[1]) / 2, (R[2] + R[3]) / 2);
  const b = { x, y: f.y + y0, z, sx: R[1] - R[0], sy: y1 - y0, sz: R[3] - R[2], r: f.r, m, sh: 0 };
  if (o) Object.assign(b, o);
  w.blocks.push(b);
  return b;
}
// le même, mais un bloc qui existe déjà (transformé sur place)
function b1Reposer(b, f, R, y0, y1) {
  const [x, z] = b1W(f, (R[0] + R[1]) / 2, (R[2] + R[3]) / 2);
  Object.assign(b, { x, y: f.y + y0, z, sx: R[1] - R[0], sy: y1 - y0, sz: R[3] - R[2], r: f.r });
}
// le rectangle local d'un bloc tourné comme f
function b1Rect(f, b) { const [cx, cz] = b1L(f, b.x, b.z); return [cx - b.sx / 2, cx + b.sx / 2, cz - b.sz / 2, cz + b.sz / 2]; }
// C privé de H : les morceaux qui restent
function b1Moins(C, H) {
  const ix0 = Math.max(C[0], H[0]), ix1 = Math.min(C[1], H[1]), iz0 = Math.max(C[2], H[2]), iz1 = Math.min(C[3], H[3]);
  if (ix0 >= ix1 || iz0 >= iz1) return [C];
  const out = [];
  if (ix0 - C[0] > 0.03) out.push([C[0], ix0, C[2], C[3]]);
  if (C[1] - ix1 > 0.03) out.push([ix1, C[1], C[2], C[3]]);
  if (iz0 - C[2] > 0.03) out.push([ix0, ix1, C[2], iz0]);
  if (C[3] - iz1 > 0.03) out.push([ix0, ix1, iz1, C[3]]);
  return out;
}
// percer un plancher (ses blocs, tournés comme f) : le premier morceau garde le bloc, les autres s'ajoutent au bout
function b1Percer(w, f, blocs, H) {
  const out = [];
  for (const b of blocs) {
    const R = b1Rect(f, b), P = b1Moins(R, H);
    if (P.length === 1 && P[0] === R) { out.push(b); continue; }
    const y0 = b.y - f.y, y1 = y0 + b.sy;
    if (!P.length) { Object.assign(b, { sx: 0.001, sy: 0.001, sz: 0.001, y: f.y - 2 }); continue; } // (rien ne reste : enfoui, minuscule)
    b1Reposer(b, f, P[0], y0, y1); out.push(b);
    for (let i = 1; i < P.length; i++) { const nb = b1Bloc(w, f, P[i], y0, y1, b.m, { plafond: b.plafond }); out.push(nb); }
  }
  return out;
}
// la trémie contre un mur : 'B' le fond (+z), 'F' la façade (−z), 'L' la gauche (−x), 'R' la droite (+x) ; centrée en u le long du mur
function b1Geo(IX, IZ, mur, u, larg, prof) {
  const n = { B: [0, -1], F: [0, 1], L: [1, 0], R: [-1, 0] }[mur], P = { B: [u, IZ], F: [u, -IZ], L: [-IX, u], R: [IX, u] }[mur], a = [Math.abs(n[1]), Math.abs(n[0])];
  const pt = (k, t) => [P[0] + n[0] * k + a[0] * t, P[1] + n[1] * k + a[1] * t];
  const c = [pt(0, -larg / 2), pt(0, larg / 2), pt(prof, -larg / 2), pt(prof, larg / 2)];
  const R = [Math.min(...c.map((q) => q[0])), Math.max(...c.map((q) => q[0])), Math.min(...c.map((q) => q[1])), Math.max(...c.map((q) => q[1]))];
  return { n, a, P, pt, R, larg, prof, rr: mur === 'B' || mur === 'F' ? 0 : Math.PI / 2 };
}

// ---------------------------------------------------------------- une échelle entre deux planchers (yA en bas, yB en haut, relatifs à f.y)
// pose l'échelle, le battant relevé (un bloc), le cadre de la trappe, et les deux interactions qui transportent (data.to)
function b1Echelle(w, B, f, key, G, yA, yB, o) {
  o = o || {};
  const { pt, n, larg, prof } = G, ep = o.ep ?? 0.16;
  // l'échelle, contre le mur (barreaux face à la pièce), un mètre au-dessus du plancher du haut (o.echelle === false : elle y est déjà)
  const [ex, ez] = b1W(f, ...pt(0.07, 0));
  if (o.echelle !== false) B.prop('echelle', ex, f.y + yA, ez, f.r + G.rr, { h: yB - yA + 0.95 });
  // le battant relevé, debout au bord « −a » de la trappe (o.cote : 1 pour l'autre bord)
  const s = o.cote || -1, [q0, q1] = [pt(0, s * (larg / 2 + 0.04)), pt(prof, s * (larg / 2 + 0.04))];
  const RL = [Math.min(q0[0], q1[0]) - (G.a[0] ? 0.03 : 0), Math.max(q0[0], q1[0]) + (G.a[0] ? 0.03 : 0), Math.min(q0[1], q1[1]) - (G.a[1] ? 0.03 : 0), Math.max(q0[1], q1[1]) + (G.a[1] ? 0.03 : 0)];
  b1Bloc(w, f, RL, yB, yB + Math.min(larg, 1.0), M_PLANKS, { plafond: true });
  // le cadre (au ras du plancher, et vu d'en dessous) : son x le long du mur, ses gonds du côté du battant
  const [cx, cz] = b1W(f, ...pt(prof / 2, 0));
  B.prop('b1_tremie', cx, f.y + yB, cz, f.r + (G.rr ? -Math.PI / 2 : 0) + (s > 0 ? Math.PI : 0), { w: larg, d: prof, ep });
  // les deux interactions
  const W = (k, y) => { const [x, z] = b1W(f, ...pt(k, 0)); return [x, f.y + y, z]; };
  const pied = W(0.45, yA + 0.02), haut = W(0.45, yB + 0.02), toH = W(prof + 0.55, yB + 0.02), toB = W(0.95, yA + 0.02);
  const dir = b1W({ x: 0, z: 0, r: f.r }, -n[0], -n[1]), yaw = Math.atan2(-dir[0], -dir[1]);
  const base = { key, pied, haut, yaw, niv: o.niv || 1 };
  const iu = W(0.32, yA + 1.25), id = W(0.6, yB + 0.2);
  B.inter('b1_echelle', 'b1:' + key + ':' + (o.id || 'e') + ':haut', iu[0], iu[1], iu[2], o.labH || 'Monter à l’étage', Object.assign({ sens: 'haut', to: toH }, base));
  B.inter('b1_echelle', 'b1:' + key + ':' + (o.id || 'e') + ':bas', id[0], id[1], id[2], o.labB || 'Redescendre', Object.assign({ sens: 'bas', to: toB }, base));
  return { pied, haut, toH, toB };
}
// un garde-corps de bois au bord d'un trou (une lisse à 0,9 m, des poteaux) : rectangle local R, plancher à ly (relatif à f.y)
function b1Garde(w, f, R, ly, poteaux) {
  b1Bloc(w, f, R, ly + 0.86, ly + 0.94, M_LOGS, { plafond: true });
  for (const [x, z] of poteaux) b1Bloc(w, f, [x - 0.04, x + 0.04, z - 0.04, z + 0.04], ly, ly + 0.86, M_LOGS, { plafond: true });
}
// un bloc généré, retrouvé par sa place dans le repère f (centre lx, lz ; bas à y au-dessus de f.y) et ses dimensions
function b1Trouve(w, f, lx, lz, y, sx, sy, sz) {
  return w.blocks.find((b) => {
    if (b.hidden || b.under || Math.abs(b.sx - sx) > 0.03 || Math.abs(b.sy - sy) > 0.03 || Math.abs(b.sz - sz) > 0.03 || Math.abs(b.y - f.y - y) > 0.05 || Math.abs(Math.sin(b.r - f.r)) > 0.01) return false;
    const [x, z] = b1L(f, b.x, b.z);
    return Math.abs(x - lx) < 0.05 && Math.abs(z - lz) < 0.05;
  });
}

// ---------------------------------------------------------------- un étage de maison : le plafond du rez-de-chaussée devient son plancher
// spec : { mur, u, larg?, prof?, cote?, plafond?: bois au plafond, poutres?: n }
function b1Etage(w, B, key, spec) {
  const b = w.bld[key];
  if (!b || !b.f) return null;
  const f = b.f, t = 0.3, IX = b.W / 2 - t, IZ = b.D / 2 - t;
  const plaf = w.blocks.find((q) => Math.abs(q.x - f.x) < 0.06 && Math.abs(q.z - f.z) < 0.06 && Math.abs(q.y - (f.y + 2.95)) < 0.03 && Math.abs(q.sy - 0.16) < 0.02 && Math.abs(q.sx - (b.W - 2 * t + 0.02)) < 0.05);
  if (!plaf) return null;
  const ly = plaf.y - f.y + plaf.sy, H = b.H || 5.6;
  plaf.plafond = true;
  const G = b1Geo(IX, IZ, spec.mur, spec.u, spec.larg || 1.0, spec.prof || 1.15);
  b1Percer(w, f, [plaf], G.R);
  const e = b1Echelle(w, B, f, key, G, 0.15, ly, { cote: spec.cote });
  // le plafond de l'étage : des planches sous le toit, des poutres
  const yH = spec.haut ?? H;
  if (spec.plafond !== false) b1Bloc(w, f, [-IX, IX, -IZ, IZ], yH - 0.08, yH, M_PLANKS, { plafond: true });
  const np = spec.poutres ?? Math.max(2, Math.round(b.W / 3.2));
  for (let i = 0; i < np; i++) { const x = -IX + (i + 0.5) * (2 * IX / np); b1Bloc(w, f, [x - 0.11, x + 0.11, -IZ, IZ], yH - 0.3, yH - 0.08, M_LOGS, { plafond: true }); }
  // le conduit de la cheminée (sous la souche du toit)
  const souche = w.blocks.find((q) => q.m === M_BRICK && Math.abs(q.y - (f.y + H - 0.2)) < 0.05 && Math.abs(q.sx - 0.7) < 0.02 && Math.hypot(q.x - f.x, q.z - f.z) < Math.max(b.W, b.D) / 2);
  if (souche) { const [cx, cz] = b1L(f, souche.x, souche.z); b1Bloc(w, f, [cx - 0.35, cx + 0.35, cz - 0.35, cz + 0.35], ly, H - 0.2, M_BRICK, { plafond: true }); }
  const N = { key, b, f, y: f.y + ly, y1: f.y + yH - 0.3, ly, IX, IZ, trappe: G.R, G, e, conduit: souche ? b1L(f, souche.x, souche.z) : null };
  ((w.b1.niveaux[key]) || (w.b1.niveaux[key] = [])).push({ y: N.y, y1: N.y1, trappe: G.R, niv: 1 });
  return N;
}

// ---------------------------------------------------------------- meubler un niveau (repère du bâtiment, plancher ly)
function b1Ctx(w, B, b, ly, opts) {
  const f = b.f, key = b.key, own0 = opts && opts.own !== undefined ? opts.own : (NPC_DATA.find((q) => q.home === key && (q.age || 30) >= 16) || {}).id || null;
  const C = {
    w, B, b, f, key, ly, props: [],
    // un objet posé
    P(id, lx, lz, rr, data, s, dy) { const q = B.propRel(f, id, lx, ly + (dy || 0), lz, rr || 0, data || undefined, s); C.props.push(q); return q; },
    // un drap sur un meuble (sa place, selon sa forme)
    T(forme, lx, lz, rr) {
      const q = C.P('b1_toile', lx, lz, rr, { f: forme }), c = B1_TOILE_COLL[forme];
      if (c) { const blk = { x: q.x, y: q.y, z: q.z, sx: c[0] * 2, sy: c[2], sz: c[1] * 2, r: q.r, m: 0, sh: 0, hidden: true }; q.blk = blk; w.blocks.push(blk); }
      return q;
    },
    // un meuble qu'on fouille, et son interaction (comme 11-zzz98-fouilles.js)
    F(pid, t, lx, lz, rr, o) {
      o = o || {};
      const q = C.P(pid, lx, lz, rr, Object.assign({ vide: false }, o.data || {}), o.s, o.dy);
      const id = 'f2:b1:' + key + ':' + (o.slot || t);
      if (w.inter.some((i) => i.id === id)) return q;
      q.f2 = id;
      const c = PROP_COLL[pid], hz = (c ? c[1] : 0.2) * (o.s || 1), d = o.av ?? hz + 0.3, r = q.r;
      const own = o.own !== undefined ? o.own : own0, lieu = o.lieu || (own ? 'maison' : 'abandon');
      const data = { t, own, bld: key, lieu };
      for (const k of ['table', 'pool', 'lock', 'cle', 'refill']) if (o[k] !== undefined) data[k] = o[k];
      B.inter('f2', id, q.x + Math.sin(r) * d, q.y + (o.h ?? F2_TYPES[t].h), q.z + Math.cos(r) * d, o.lab || F2_TYPES[t].lab, data);
      return q;
    },
    // les contenants ordinaires (étagère, tonneau, caisse, sac, table) : comme partout dans la vallée (11-zzzz1-butin.js)
    A(pid, lx, lz, rr, data, s, o) {
      o = o || {};
      const q = C.P(pid, lx, lz, rr, data, s, o.dy);
      const R = typeof BU_MEUBLES !== 'undefined' && BU_MEUBLES[pid];
      if (!R || o.non) return q;
      const own = o.own !== undefined ? o.own : own0, lieu = o.lieu || (own ? 'maison' : 'abandon');
      let t = R.t, table = o.table || null;
      if (!table) {
        if (t === 'bu_etagere') table = data && data.kind === 'livres' && key !== 'mairie' ? 'bu_etagere_livres' : (typeof BU_ETAGERE_BLD !== 'undefined' && BU_ETAGERE_BLD[key]) || (data && data.kind === 'pain' ? 'f2_pains' : lieu === 'abandon' ? 'bu_etagere_vide' : 'bu_etagere');
        else if (t === 'bu_tiroir') table = lieu === 'abandon' ? 'bu_tiroir_vide' : 'bu_tiroir';
        else if (t === 'bu_tonneau') table = lieu === 'abandon' ? 'bu_vieux_tonneau' : 'bu_tonneau';
        else if (t === 'bu_caisse' || t === 'bu_caisses') table = key === 'poste' ? 'f2_colis' : 'bu_caisse';
        else if (t === 'bu_sac' || t === 'sacs_grain') table = key === 'boulangerie' ? 'f2_farine' : t === 'bu_sac' ? 'bu_sac' : null;
      }
      if (table && LOOT && !LOOT[table]) table = null;
      const sc = s || 1, av = (R.av || 0) * sc, r = q.r, id = 'f2:b1:' + key + ':' + (o.slot || pid + C.props.length);
      if (w.inter.some((i) => i.id === id)) return q;
      const d = { t, own, bld: key, lieu, bu: 1 };
      if (table) d.table = table;
      const pool = o.pool || (own && F2_POOLS[own] ? own : null);
      if (pool) d.pool = pool;
      if (lieu === 'abandon') d.refill = 6;
      w.inter.push({ kind: 'f2', id, x: q.x + Math.sin(r) * av, y: q.y + R.h * sc, z: q.z + Math.cos(r) * av, name: F2_TYPES[t].lab, data: d });
      q.f2 = id;
      return q;
    },
    // une interaction (repère du bâtiment, à h au-dessus du plancher)
    I(kind, id, lx, h, lz, name, data) { return B.interRel(f, kind, id, lx, ly + h, lz, name, data || {}); },
    // un papier qu'on lit sur place
    L(id, lx, h, lz, titre, texte, sig) { return C.I('lire', 'b1:' + key + ':' + id, lx, h, lz, 'Lire', { text: [titre, texte, sig || ''] }); },
    // un bloc (cloison, rebord…) : rectangle local, du plancher + y0 au plancher + y1
    K(R, y0, y1, m, o) { return b1Bloc(w, f, R, ly + y0, ly + y1, m, Object.assign({ plafond: true }, o || {})); },
  };
  return C;
}
// une cloison le long de x (en z) ou de z (en x), percée de portes [a0, a1] (hauteur 2,05), de ly à ly + h
function b1Cloison(C, axe, pos, a0, a1, portes, h, m) {
  const e = 0.12, cuts = [a0];
  for (const [p0, p1] of portes) cuts.push(p0, p1);
  cuts.push(a1);
  for (let i = 0; i + 1 < cuts.length; i += 2) {
    const u0 = cuts[i], u1 = cuts[i + 1];
    if (u1 - u0 > 0.02) C.K(axe === 'x' ? [u0, u1, pos - e / 2, pos + e / 2] : [pos - e / 2, pos + e / 2, u0, u1], 0, h, m);
    if (i + 2 < cuts.length) { const p0 = cuts[i + 1], p1 = cuts[i + 2]; C.K(axe === 'x' ? [p0, p1, pos - e / 2, pos + e / 2] : [pos - e / 2, pos + e / 2, p0, p1], 2.05, h, m); }
  }
}

// ============================================================================
//  CE QU'IL Y A LÀ-HAUT (repère de chaque bâtiment : x le long de la façade, z vers le fond ; la porte est en −z)
//  (les maisons de 8 × 7 : la trappe au fond, à droite, entre l'armoire et la cheminée du rez-de-chaussée)
// ============================================================================
const B1PI = Math.PI, B1PI2 = Math.PI / 2;
const B1_MAISON = { mur: 'B', u: 1.85 };
const B1_ETAGES = {
  // ------------------------------------------------ la maison aux volets bleus : la chambre des enfants Lefèvre
  maison_a: { spec: B1_MAISON, meubler(C) {
    C.P('tapis', -1.3, 0.5, 0);
    C.P('lit', -3.2, 2.3, B1PI, { col: '#5a7ab0' }, 0.85);
    C.P('poupee', -3.25, 1.75, 0.5, null, 1, 0.43);
    C.P('b1_berceau', -1.95, 2.7, 0);
    C.P('b1_jouets', -1.2, 0.35, 0.3);
    C.P('chaise', 0.3, -2.5, B1PI);
    C.F('commode', 'commode', -3.42, -0.7, B1PI2, { slot: 'commode_haut', table: 'f2_abandon_commode', pool: 'maison_a' });
    C.F('malle', 'malle', 2.9, -2.9, 0, { slot: 'malle_haut', table: 'f2_abandon', pool: 'maison_a' });
    C.P('b1_dessin', -3.68, -2.2, B1PI2, { v: 0 }, 1, 1.15);
    C.L('dessin', -3.35, 1.15, -2.2, 'Un dessin d’enfant', 'Une fenêtre aux volets grands ouverts. Derrière la vitre, un monsieur tout bleu, très long, qui lève la main. Devant, un petit garçon en rouge lui répond.\n\nAu dos, au crayon : « Il en refait un chaque soir. »');
  } },
  // ------------------------------------------------ la maison du tisserand : l'atelier
  maison_b: { spec: B1_MAISON, meubler(C) {
    C.P('b1_metier', -1.0, 0.4, 0, { bande: '#3a1420' });
    C.L('metier', -1.0, 1.0, 1.35, 'Le métier', 'Une pièce de drap montée sur le métier, presque finie. Au milieu, trois rangs d’une laine presque noire, d’un rouge qui ne se voit qu’en biais.\n\nDans l’atelier, pas une pelote de cette couleur.');
    C.F('b1_rouleaux', 'b1_draps', -3.36, -2.4, B1PI2, { slot: 'draps', pool: 'maison_b' });
    C.P('b1_rouet', 3.25, -2.3, -B1PI2);
    C.P('lit', -3.12, 2.13, B1PI, { col: '#7a6a5a' });
    C.A('etagere', -0.6, 3.05, B1PI, { kind: 'livres' }, 1, { slot: 'etagere_haut' });
    C.A('sac', 3.2, -0.6, 0.3, null, 1, { slot: 'laine', table: 'f2_tissus' });
    C.P('chaise', 0.7, -1.7, -0.5);
  } },
  // ------------------------------------------------ la maison Rivière : la chambre de toute la famille, la fenêtre clouée
  maison_c: { spec: B1_MAISON, meubler(C) {
    C.P('lit', -3.12, 2.13, B1PI, { col: '#8a5a4a' });
    C.P('lit', -2.88, -0.55, B1PI2, { col: '#6a8a5a' }, 0.8);
    C.P('lit', -2.88, -2.15, B1PI2, { col: '#5a6a8a' }, 0.8);
    C.P('traces', 1.55, 1.2, -B1PI2);
    C.F('commode', 'commode', 0.9, -2.92, 0, { slot: 'commode_haut', table: 'f2_abandon_commode', pool: 'maison_c' });
    for (const [x0, x1] of [[-2.7, -0.75], [0.75, 2.7]]) for (const y of [0.95, 1.5]) C.K([x0, x1, -3.2, -3.14], y, y + 0.14, M_PLANKS);
    C.P('seau_cachot', 3.25, -0.4, 0);
  } },
  // ------------------------------------------------ la maison aux lilas : la chambre de la veuve
  maison_d: { spec: B1_MAISON, meubler(C) {
    C.P('lit', -3.12, 2.13, B1PI, { col: '#9a7aa8' });
    C.P('table', 0.0, -2.75, 0, null, 0.7);
    C.P('b1_lilas', -0.15, -2.75, 0, null, 1, 0.555);
    C.P('b1_lilas', 2.95, -2.9, 0.4);
    C.P('tableau', -3.68, 0.2, B1PI2, { v: 1 }, 1, 1.35);
    C.F('commode', 'commode', -3.42, -1.6, B1PI2, { slot: 'commode_haut', table: 'f2_abandon_commode', pool: 'maison_d' });
    C.P('fauteuil', 1.9, -2.1, B1PI - 0.3, { col: '#5a4a6a' });
    C.P('b1_souliers', -2.3, 0.85, 0.2, { col: '#2a2420' });
  } },
  // ------------------------------------------------ la maison Vernet (à louer) : presque vide
  vide4: { spec: B1_MAISON, meubler(C) {
    C.F('malle', 'malle', -3.42, 2.6, B1PI2, { slot: 'malle_haut', table: 'f2_abandon', pool: 'vide4' });
    C.P('table', 2.6, -2.7, 0, null, 0.75);
    C.P('chaise', 2.6, -2.0, B1PI, null, 0.8);
    C.L('cahier', 2.6, 0.62, -2.6, 'Un cahier d’écolier', 'Une page d’écriture, à l’encre violette : « La vallée est belle. La semaine a douze jours. » Recopié jusqu’en bas.\n\nÀ la dernière ligne, la main d’enfant a écrit autre chose, puis l’a raturé si fort que le papier est troué.');
  } },
  // ------------------------------------------------ la maison Delorme (à louer) : « la chambre du haut »
  vide5: { spec: B1_MAISON, meubler(C) {
    C.P('lit', -3.12, 2.13, B1PI, { col: '#6a7a6a' });
    C.P('table', 0.0, -2.85, 0, null, 0.6);
    const q = C.P('b1_chandelle', 0.0, -2.85, 0, { lit: false }, 1, 0.48);
    C.w.b1.chandelle = C.w.props.indexOf(q);
    C.F('malle', 'malle', 2.9, -2.9, 0, { slot: 'malle_haut', table: 'f2_abandon', pool: 'vide5' });
    C.P('chaise', -1.0, -0.4, 2.4);
  } },
  // ------------------------------------------------ l'échoppe de l'alchimiste : le laboratoire
  vide6: { spec: B1_MAISON, meubler(C) {
    C.P('table', -1.2, 0.4, 0);
    C.P('b1_bocal', -1.55, 0.4, 0, null, 1, 0.79);
    C.P('b1_lampe', -0.75, 0.55, 0, null, 1, 0.79);
    C.P('livre', -1.0, 0.2, 0.4, null, 1, 0.79);
    C.L('bocal', -1.55, 1.1, 0.95, 'Le bocal', 'Un bocal de verre épais, scellé à la cire rouge. Dedans, dans un liquide trouble, quelque chose de pâle, replié sur soi, de la taille d’un poing.\n\nL’étiquette a été grattée. On lit encore : « Laboratoire du deuxième étage — ne pas déplacer ».', 'de la main de Fauvel, au crayon : « Déplacé. »');
    C.P('alambic', -3.05, 2.55, B1PI2);
    C.A('etagere', -3.56, -0.6, B1PI2, { kind: 'bocaux' }, 1, { slot: 'etagere_haut' });
    C.A('jarre', -3.3, -2.65, 0, null, 1, { slot: 'jarre1' });
    C.A('jarre', -2.75, -2.9, 0.5, null, 1, { slot: 'jarre2' });
    C.F('malle', 'malle', 2.9, -2.9, 0, { slot: 'malle_haut', pool: 'alchimiste' });
    C.P('paillasse', 3.2, -0.6, 0);
  } },
  // ------------------------------------------------ la maison du Rempart (à louer) : la malle du sergent qui n'est jamais venu
  maison_rempart: { spec: B1_MAISON, meubler(C) {
    C.F('malle', 'malle', -3.42, 2.6, B1PI2, { slot: 'malle_haut', table: 'f2_abandon', pool: 'b1_sergent', lab: 'Ouvrir la malle du sergent' });
    C.P('paillasse', 2.75, -2.65, B1PI2);
  } },
  // ------------------------------------------------ la mairie : les archives, le garde-meuble de la commune
  mairie: { spec: { mur: 'B', u: -3.75 }, meubler(C, N) {
    const h = N.y1 - N.y + 0.22;
    b1Cloison(C, 'x', 0.0, -5.7, 5.7, [[-0.5, 0.5]], h, M_PLASTER);
    // les archives (au fond)
    C.A('etagere', -1.4, 3.95, B1PI, { kind: 'livres' }, 1, { slot: 'arch1' });
    C.A('etagere', 0.2, 3.95, B1PI, { kind: 'livres' }, 1, { slot: 'arch2' });
    C.F('armoire', 'b1_registres', 2.0, 3.89, B1PI, { slot: 'registres', pool: 'b1_mairie', lock: 2, cle: 'cle_bureau' });
    C.P('table', 3.2, 1.1, 0);
    C.P('chaise', 3.2, 0.4, B1PI);
    C.P('b1_lampe', 2.85, 1.2, 0, null, 1, 0.79);
    C.P('livre', 3.5, 1.05, 0.2, null, 1, 0.79);
    C.P('b1_lutrin', -1.8, 1.6, 0);
    C.L('etat_civil', -1.8, 1.05, 1.05, 'Le registre de l’état civil', 'Ouvert à la dernière page. Naissances : aucune depuis deux ans. Décès : une colonne.\n\nUne troisième colonne, tracée à la règle, n’a pas d’en-tête. Elle est pleine.');
    // le garde-meuble (devant) : les successions sous leurs draps
    C.T('armoire', -5.0, -3.82, 0); C.T('horloge', -3.6, -3.95, 0); C.T('commode', -2.2, -3.85, 0); C.T('tableau', -0.9, -3.95, 0.1);
    C.T('lit', 4.5, -2.9, B1PI2); C.T('fauteuil', 1.3, -2.5, 0.5); C.T('fauteuil', 2.4, -3.45, -0.3); C.T('chaises', -4.95, -1.2, 0.2); C.T('commode', 4.95, -0.8, -B1PI2);
    C.P('tableau', 0.6, -4.18, 0, { v: 3 }, 1, 1.4);
    C.F('malle', 'malle', -1.5, -1.0, 0.2, { slot: 'succession', table: 'f2_malle', pool: 'b1_mairie', lab: 'Ouvrir une malle de succession' });
    C.I('b1_garde_meuble', 'b1:mairie:garde_meuble', 0.4, 1.0, -1.9, 'Les meubles des successions', {});
  } },
  // ------------------------------------------------ l'auberge : six chambres d'hôtes (et la sept), un couloir
  auberge: { spec: { mur: 'B', u: -1.0 }, meubler(C, N) {
    const h = N.y1 - N.y + 0.22, M = M_TIMBER;
    b1Cloison(C, 'x', -0.8, -5.7, 5.7, [[-4.3, -3.4], [-0.45, 0.45], [3.4, 4.3]], h, M);
    b1Cloison(C, 'z', -1.9, -4.7, -0.86, [], h, M); b1Cloison(C, 'z', 1.9, -4.7, -0.86, [], h, M);
    b1Cloison(C, 'x', 0.6, -5.7, -2.6, [[-4.6, -3.7]], h, M); b1Cloison(C, 'x', 0.6, 0.6, 5.7, [[1.4, 2.3], [3.9, 4.8]], h, M);
    b1Cloison(C, 'z', -2.6, 0.66, 4.7, [], h, M); b1Cloison(C, 'z', 0.6, 0.66, 4.7, [], h, M); b1Cloison(C, 'z', 3.15, 0.66, 4.7, [], h, M);
    const chambre = (n, lit, rr, chaise, toil, trr, plaque, prr) => {
      C.P('lit', lit[0], lit[1], rr, { col: ['#8a5a30', '#4a6a3a', '#6a4a6a', '#7a3a34', '#3a5a7a'][n % 5] });
      C.I('rentbed', 'auberge', lit[0], 0.8, lit[1], 'Dormir (chambre louée)');
      if (chaise) C.P('chaise', chaise[0], chaise[1], chaise[2]);
      if (toil) C.P('b1_toilette', toil[0], toil[1], trr);
      C.P('b1_plaque', plaque[0], plaque[1], prr, { n }, 1, 1.55);
    };
    chambre(1, [-4.65, -3.6], B1PI2, [-2.6, -3.95, 0.4], [-2.45, -2.3], -B1PI2, [-3.05, -0.73], 0);
    chambre(2, [-0.85, -3.6], B1PI2, [1.2, -3.85, -0.3], [1.35, -1.75], -B1PI2, [0.75, -0.73], 0);
    chambre(3, [4.65, -3.6], -B1PI2, [2.55, -3.95, 0.3], [2.45, -1.75], B1PI2, [4.6, -0.73], 0);
    chambre(4, [-4.65, 3.65], B1PI, [-3.2, 1.6, 2.6], [-3.1, 4.3], B1PI, [-3.4, 0.53], B1PI);
    chambre(5, [1.3, 3.65], B1PI, [2.65, 1.5, -2.6], null, 0, [2.6, 0.53], B1PI);
    C.F('malle', 'malle', 2.6, 4.35, B1PI, { slot: 'voyageur', pool: 'b1_auberge', table: 'f2_malle', lab: 'Ouvrir la malle oubliée' });
    // la sept : le lit défait, une chandelle qui brûle, un bol, des souliers crottés
    C.P('lit', 3.85, 3.65, B1PI, { col: '#5a5048' });
    C.I('b1_sept', 'b1:auberge:sept', 3.85, 0.75, 2.75, 'Le lit', {});
    C.P('table', 5.15, 3.6, B1PI2, null, 0.55);
    C.P('bougie', 5.2, 3.75, 0, null, 1, 0.435);
    C.P('b1_bol', 5.1, 3.4, 0, { c: 'vide' }, 1, 0.435);
    C.P('b1_souliers', 3.55, 2.2, B1PI, { col: '#4a3a28' });
    C.P('b1_plaque', 5.15, 0.53, B1PI, { n: 7 }, 1, 1.55);
    // le couloir : l'armoire à linge, une lampe au bout
    C.F('armoire', 'armoire', -5.39, -0.1, B1PI2, { slot: 'linge', table: 'f2_linge', lab: 'Fouiller l’armoire à linge' });
    C.P('table', 5.3, -0.1, B1PI2, null, 0.6);
    C.P('b1_lampe', 5.3, -0.1, 0, null, 1, 0.48);
  } },
  // ------------------------------------------------ la boulangerie : la réserve de farine, le coin d'Émile, les dessins de la petite
  boulangerie: { spec: { mur: 'B', u: 2.55, larg: 0.9 }, meubler(C) {
    C.F('sacs', 'b1_farine', -3.4, 3.15, B1PI, { slot: 'farine', h: 0.6 });
    C.A('sac', -2.45, 3.3, 0.4, null, 1, { slot: 'sac_farine', table: 'f2_farine' });
    C.F('petrin', 'petrin', -3.86, 0.4, B1PI2, { slot: 'huche', table: 'f2_farine', lab: 'Fouiller la huche à farine' });
    C.P('b1_patere', 4.17, -1.3, -B1PI2, { col: '#4a4038', chapeau: true });
    C.P('b1_souliers', 3.85, -2.1, -B1PI2, { col: '#6a4a2a' });
    C.P('table', 3.0, -3.25, 0, null, 0.6);
    C.P('pain_etal', 3.0, -3.25, 0.15, null, 1, 0.48);
    C.I('b1_voir', 'b1:boulangerie:miche', 3.0, 0.75, -2.8, 'La miche', { t: '(Une miche ronde, seule, sous un torchon propre. Elle est encore tendre.)' });
    C.P('b1_dessin', -4.18, -1.9, B1PI2, { v: 1 }, 1, 1.0);
    C.P('b1_dessin', -4.18, -2.5, B1PI2, { v: 2 }, 1, 1.15);
    C.L('dessins', -3.85, 1.1, -2.2, 'Des dessins d’enfant', 'Punaisés au mur, à hauteur d’enfant. La boulangerie et son four, sous un grand soleil. Deux petites filles qui se tiennent la main, au bord d’un puits : l’une en rose, l’autre toute bleue.\n\nLe troisième a été arraché. Il reste la punaise, et un coin de papier où l’on devine un plancher, et une oreille collée contre.');
  } },
  // ------------------------------------------------ la poste : les lettres en souffrance, la bouilloire
  poste: { spec: { mur: 'B', u: 3.7 }, meubler(C) {
    C.F('casier_tri', 'b1_souffrance', -3.96, 1.0, B1PI2, { slot: 'souffrance', pool: 'b1_souffrance', lock: 1 });
    C.A('sac', -3.5, 3.25, 0.3, null, 1, { slot: 'sac1', table: 'f2_tri' });
    C.A('sac', -2.95, 3.35, -0.4, null, 1, { slot: 'sac2', table: 'f2_tri' });
    C.A('caisse', 2.3, 3.2, 0.2, null, 0.7, { slot: 'colis' });
    C.P('b1_poele', 2.3, -3.25, 0);
    C.P('table', 1.0, -3.15, 0, null, 0.7);
    C.P('lettre', 0.85, -3.15, 0.3, null, 1, 0.555);
    C.L('vapeur', 1.0, 0.85, -2.65, 'Une enveloppe ouverte', 'Au-dessus de la bouilloire, une enveloppe décollée proprement : la colle a fondu à la vapeur sans déchirer le papier. La lettre a été lue, repliée, remise.\n\nIl ne reste qu’à la refermer.');
    C.P('table', -1.0, -1.0, 0);
    C.P('chaise', -1.0, -0.25, B1PI);
    C.P('b1_lampe', -1.4, -1.0, 0, null, 1, 0.79);
    C.P('livre', -0.7, -1.1, 0.3, null, 1, 0.79);
    C.A('etagere', 0.6, 3.5, B1PI, { kind: 'livres' }, 1, { slot: 'etagere_haut' });
  } },
  // ------------------------------------------------ le ranch : le fenil, les affaires d'Augustin, le bol de lait
  ranch: { spec: { mur: 'B', u: 2.6 }, meubler(C) {
    C.F('botte_foin', 'foin', -3.9, 3.25, 0, { slot: 'foin', h: 0.8 });
    C.P('botte_foin', -2.85, 3.3, 0.1);
    C.P('botte_foin', -3.4, 3.25, 0.05, null, 1, 0.6);
    C.F('sacs', 'sacs_avoine', -1.45, 3.25, B1PI, { slot: 'avoine' });
    C.P('b1_patere', -4.67, -1.2, B1PI2, { col: '#3a3a30', chapeau: true });
    C.P('b1_souliers', -4.3, -1.9, B1PI2, { col: '#3a2a1a' });
    C.P('table', 0.0, -3.2, 0, null, 0.6);
    C.P('b1_bol', 0.0, -3.2, 0, { c: 'lait' }, 1, 0.48);
    C.I('b1_voir', 'b1:ranch:bol', 0.0, 0.7, -2.7, 'Le bol', { t: '(Un bol de lait, sur le rebord de la fenêtre. Il est frais.)' });
    C.P('lit', 3.65, -2.5, -B1PI2, { col: '#6a5a8a' });
    C.F('malle', 'malle', 1.0, -3.41, 0, { slot: 'augustin', pool: 'b1_augustin', lab: 'Ouvrir la malle d’Augustin' });
  } },
};
const B1_ORDRE = ['mairie', 'auberge', 'boulangerie', 'poste', 'maison_a', 'maison_b', 'maison_c', 'maison_d', 'vide4', 'vide5', 'vide6', 'maison_rempart', 'ranch'];

// ---------------------------------------------------------------- la bibliothèque : deux niveaux au-dessus de la salle
function b1Bibliotheque(w, B) {
  const N = b1Etage(w, B, 'bibliotheque', { mur: 'L', u: -4.0, haut: 5.59, plafond: false, poutres: 7 });
  if (!N) return;
  const b = N.b, f = N.f, IX = N.IX, IZ = N.IZ;
  // le second plancher, à 5,75 m, et sa trappe (contre le mur de droite)
  const dalle = b1Bloc(w, f, [-IX, IX, -IZ, IZ], 5.59, 5.75, M_PLANKS, { plafond: true });
  const G2 = b1Geo(IX, IZ, 'R', 4.5, 1.0, 1.15);
  b1Percer(w, f, [dalle], G2.R);
  b1Echelle(w, B, f, 'bibliotheque', G2, N.ly, 5.75, { id: 'e2', niv: 2, labH: 'Monter aux combles' });
  b1Bloc(w, f, [-IX, IX, -IZ, IZ], b.H - 0.08, b.H, M_PLANKS, { plafond: true });
  for (let i = 0; i < 7; i++) { const x = -IX + (i + 0.5) * (2 * IX / 7); b1Bloc(w, f, [x - 0.12, x + 0.12, -IZ, IZ], b.H - 0.32, b.H - 0.08, M_LOGS, { plafond: true }); }
  w.b1.niveaux.bibliotheque.push({ y: f.y + 5.75, y1: f.y + b.H - 0.32, trappe: G2.R, niv: 2 });
  // ---- la galerie des cartes (premier niveau) : rayonnages au fond, tables de lecture, globes, cartes aux murs
  const C = b1Ctx(w, B, b, N.ly, { own: null });
  for (let i = 0; i < 9; i++) C.P('etagere', -8.6 + i * 1.6, 7.55, B1PI, { kind: 'livres' });
  C.I('biblio_rayon', 'b1:biblio:rayon_haut', -2.2, 1.2, 6.8, 'Parcourir les rayonnages');
  for (const [x0, s] of [[-2.7, 1], [2.7, -1]]) {
    C.P('table', x0 - 0.7, 0.6, 0); C.P('table', x0 + 0.7, 0.6, 0);
    for (const dx of [-1.0, 0.0, 1.0]) { C.P('chaise', x0 + dx, -0.2, B1PI); C.P('chaise', x0 + dx, 1.4, 0); }
    C.P('b1_quinquet', x0 + 0.3 * s, 0.6, 0, null, 1, 0.79);
    C.P('livre', x0 - 0.5, 0.5, 0.4, null, 1, 0.79);
  }
  C.P('b1_globe', -6.2, -5.4, 0.3); C.P('b1_globe', 6.6, -5.9, 1.1);
  for (const x of [-6.4, -3.2, 3.2, 6.4]) C.P('b1_carte_murale', x, -7.67, 0, null, 1, 1.55);
  for (const z of [-5.6, -4.2, -2.8]) C.P('commode', 10.42, z, -B1PI2);
  C.P('b1_lutrin', -6.4, 2.6, 0);
  C.L('retards', -6.4, 1.05, 2.05, 'Le registre des prêts, les vieilles années', 'Une colonne pour le titre, une pour le lecteur, une pour le jour du retour.\n\nQuand le jour du retour manque, quelqu’un a tracé à l’encre rouge une petite croix. Il y en a plus qu’on ne voudrait. La plus ancienne a presque cent ans ; c’est la même main.');
  // ---- les combles (second niveau) : caisses d'archives, livres en piles, ce qu'on ne prête plus
  const K = b1Ctx(w, B, b, 5.75, { own: null });
  for (const [x, z, r, s] of [[-8.6, 6.6, 0.1, 1], [-7.6, 6.9, -0.2, 0.9], [-8.2, 5.6, 0.3, 0.8], [-3.2, 6.8, 0, 1], [4.8, -6.6, 0.4, 1], [5.8, -6.8, -0.1, 0.85], [-9.6, -6.2, 0.2, 1]]) K.P('caisse', x, z, r, null, s);
  K.P('caisse', -8.6, 6.6, 0.25, null, 0.7, 0.8);
  for (const [x, z, n] of [[-1.4, 6.9, 5], [-0.6, 7.0, 3], [2.2, 6.9, 6], [6.8, 2.2, 4], [-5.2, -6.9, 7]]) for (let k = 0; k < n; k++) K.P('livre', x + (k % 2) * 0.03, z, k * 0.7, null, 1, k * 0.072);
  K.P('etagere', -5.6, 7.55, B1PI, { kind: 'livres' }); K.P('etagere', 0.6, 7.55, B1PI, { kind: 'livres' });
  K.T('chaises', 8.6, -5.6, 0.3); K.T('tableau', -9.9, 1.2, B1PI2); K.T('fauteuil', 2.4, -6.4, -0.4);
  K.P('b1_globe', -7.2, -2.0, 2.1);
  K.L('caisses', -7.9, 0.9, 5.4, 'Des caisses d’archives', 'Ficelées, marquées à la craie d’une année. Les plus vieilles n’ont plus de chiffres : un cercle, barré d’un trait.\n\nSous la ficelle de l’une d’elles, un billet : « Ne pas ouvrir avant le retour du lecteur. »', 'd’une écriture penchée, sans date');
}

// ============================================================================
//  LES TOURS DES REMPARTS
// ============================================================================
// une face de tour, percée d'ouvertures [a0, a1, y0, y1] (le long de la face ; hauteurs relatives au pavé de la ville)
// faces : 'N' (−z) et 'S' (+z) sur toute la largeur, 'O' (−x) et 'E' (+x) entre elles
function b1Face(w, tf, face, S, e, yb, yt, ouv, m) {
  const h = S / 2, A = face === 'N' || face === 'S' ? [-h, h] : [-h + e, h - e];
  const cuts = new Set([A[0], A[1]]);
  for (const o of ouv) { if (o[1] > A[0] && o[0] < A[1]) { cuts.add(Math.max(A[0], o[0])); cuts.add(Math.min(A[1], o[1])); } }
  const P = [...cuts].sort((a, b) => a - b);
  const rect = (a0, a1) => (face === 'N' ? [a0, a1, -h, -h + e] : face === 'S' ? [a0, a1, h - e, h] : face === 'O' ? [-h, -h + e, a0, a1] : [h - e, h, a0, a1]);
  for (let i = 0; i + 1 < P.length; i++) {
    const a0 = P[i], a1 = P[i + 1];
    if (a1 - a0 < 0.01) continue;
    const trous = ouv.filter((o) => o[0] <= a0 + 1e-6 && o[1] >= a1 - 1e-6).map((o) => [o[2], o[3]]).sort((p, q) => p[0] - q[0]);
    let y = yb;
    for (const [t0, t1] of trous) { if (t0 - y > 0.01) b1Bloc(w, tf, rect(a0, a1), y, t0, m); y = Math.max(y, t1); }
    if (yt - y > 0.01) b1Bloc(w, tf, rect(a0, a1), y, yt, m);
  }
}
// une meurtrière (vue du dedans : une fente sombre) sur la face intérieure d'un mur
function b1Fente(w, tf, face, S, e, a, y0) {
  const h = S / 2 - e, R = face === 'N' ? [a - 0.06, a + 0.06, -h - 0.01, -h + 0.01] : face === 'S' ? [a - 0.06, a + 0.06, h - 0.01, h + 0.01] : face === 'O' ? [-h - 0.01, -h + 0.01, a - 0.06, a + 0.06] : [h - 0.01, h + 0.01, a - 0.06, a + 0.06];
  b1Bloc(w, tf, R, y0, y0 + 0.95, M_DARK);
}
function b1Tours(w, B) {
  const T = w.townInfo, half = 46, gate = 4.4, y0 = w.heightAt(T.x, T.z);
  const L = [];
  for (let s = 0; s < 4; s++) {
    const sf = { x: T.x, y: y0, z: T.z, r: s * B1PI / 2 };
    L.push({ angle: true, s, sf, c: b1W(sf, half, half), S: 5.2, e: 0.55, Ht: 10, u: half });
    if (s === 0 || s === 2) for (const u of [-gate / 2 - 1.7, gate / 2 + 1.7]) L.push({ angle: false, s, sf, c: b1W(sf, u, half), S: 3.4, e: 0.5, Ht: 8.6, u });
  }
  const noms = (t) => {
    const ns = t.c[1] > T.z ? 'sud' : 'nord', eo = t.c[0] > T.x ? 'e' : 'o';
    return t.angle ? 'tour_' + (ns === 'sud' ? 's' : 'n') + (eo === 'e' ? 'e' : 'w') : 'tour_' + ns + '_' + eo;
  };
  for (const t of L) {
    t.key = noms(t);
    try { b1Tour(w, B, t, y0); } catch (e) { console.error('B1 : la tour ' + t.key, e); }
  }
  try { b1MainCourante(w, T, y0); } catch (e) { console.error('B1 : la main courante', e); }
}
// la main courante du chemin de ronde : une lisse de bois sur poteaux, côté ville (les merlons gardent le côté des douves) ;
// au-dessus des portes, des deux côtés
function b1MainCourante(w, T, y0) {
  const lisse = (b, zl, x0, x1) => {
    const f = { x: b.x, z: b.z, r: b.r, y: y0 + 6.25 };
    b1Bloc(w, f, [x0, x1, zl - 0.04, zl + 0.04], 0.9, 1.0, M_LOGS);
    const n = Math.max(1, Math.round((x1 - x0) / 2.3));
    for (let i = 0; i <= n; i++) { const u = x0 + 0.05 + (x1 - x0 - 0.1) * i / n; b1Bloc(w, f, [u - 0.05, u + 0.05, zl - 0.05, zl + 0.05], 0, 0.9, M_LOGS); }
  };
  const L = [];
  for (const b of w.blocks) {
    if (b.m !== M_STONE || b.hidden || b.under || b.sx < 1.5) continue;
    const dd = Math.max(Math.abs(b.x - T.x), Math.abs(b.z - T.z));
    if (dd < 44.5 || dd > 47.5) continue;
    if (Math.abs(b.y - (y0 + 5.8)) < 0.05 && Math.abs(b.sy - 0.45) < 0.02 && Math.abs(b.sz - 1.55) < 0.02) L.push([b, 1]);       // la chape d'un rempart
    else if (Math.abs(b.y - (y0 + 4.2)) < 0.05 && Math.abs(b.sy - 2.05) < 0.03 && Math.abs(b.sx - 4.8) < 0.03) L.push([b, 2]);  // le dessus d'une porte
  }
  for (const [b, k] of L) {
    if (k === 1) { const [, lz] = World.blockLocal(b, T.x, T.z), sg = Math.sign(lz) || 1; lisse(b, sg * 0.72, -b.sx / 2 + 0.05, b.sx / 2 - 0.05); }
    else for (const sg of [-1, 1]) lisse(b, sg * 0.68, -2.2, 2.2);
  }
}
function b1Tour(w, B, t, y0) {
  const { S, e, Ht } = t, h = S / 2, I = h - e, [cx, cz] = t.c;
  const tf = { x: cx, y: y0, z: cz, r: t.sf.r };
  // ---- la tour pleine devient sa fondation ; les murs qui y entrent s'arrêtent dans son mur
  const tb = w.blocks.find((b) => b.m === M_STONE && Math.abs(b.x - cx) < 0.08 && Math.abs(b.z - cz) < 0.08 && Math.abs(b.sx - S) < 0.02 && Math.abs(b.sz - S) < 0.02 && b.sy > Ht);
  if (!tb) return;
  const dedans = [cx - I + 0.01, cx + I - 0.01, cz - I + 0.01, cz + I - 0.01];
  for (const b of w.blocks) {
    if (b === tb || b.hidden || b.under || Math.abs(b.x - cx) > 14 || Math.abs(b.z - cz) > 14) continue;
    if (b.y >= y0 + Ht || b.y + b.sy <= y0 + 0.1) continue;
    const sw = Math.abs(Math.sin(b.r)) > 0.5, ex = (sw ? b.sz : b.sx) / 2, ez = (sw ? b.sx : b.sz) / 2;
    if (b.x + ex <= dedans[0] || b.x - ex >= dedans[1] || b.z + ez <= dedans[2] || b.z - ez >= dedans[3]) continue;
    if (b.m === M_SLATE && b.sh === 3) continue; // (le toit)
    // le long de son grand axe : on le recule jusque dans le mur de la tour
    const lx = ex >= ez, c0 = lx ? b.x - ex : b.z - ez, c1 = lx ? b.x + ex : b.z + ez, tc = lx ? cx : cz;
    let n0 = c0, n1 = c1;
    if ((c0 + c1) / 2 < tc) n1 = Math.min(c1, tc - h + 0.25); else n0 = Math.max(c0, tc + h - 0.25);
    if (n1 - n0 < 0.05) { Object.assign(b, { x: cx, z: cz, y: y0 - 2.4, sx: 0.001, sy: 0.001, sz: 0.001 }); continue; }
    const mid = (n0 + n1) / 2, L = n1 - n0;
    if (lx) b.x = mid; else b.z = mid;
    if (sw === lx) b.sz = L; else b.sx = L; // (le grand axe du bloc : sx s'il n'est pas tourné d'un quart de tour par rapport au monde)
  }
  Object.assign(tb, { y: y0 - 2.5, sy: 2.6 });
  // ---- les ouvertures : la porte du pied côté ville, les passages du chemin de ronde
  const ouv = { N: [], S: [], O: [], E: [] };
  let porte;
  if (t.angle) {
    // le mur de ce côté (le long de x) arrive par −x, celui du côté suivant (le long de z) par −z ; la ville est vers (−x, −z)
    const libre = (fx, fz) => { const [x, z] = b1W(tf, fx, fz); return pointFree(w, x, z, 0.45) && !w.props.some((q) => !q.gone && Math.hypot(q.x - x, q.z - z) < 1.1 && Math.abs(q.y - y0) < 2); };
    porte = libre(-1.45, -h - 1.3) ? { face: 'N', a: -1.45 } : libre(-h - 1.3, -1.45) ? { face: 'O', a: -1.45 } : { face: 'N', a: -1.45 };
    ouv.O.push([-0.675, 0.325, 6.25, 8.25]); ouv.N.push([-0.675, 0.325, 6.25, 8.25]);
  } else {
    porte = { face: 'N', a: 0 };
    const sg = t.u > 0 ? 1 : -1; // (le long mur arrive du côté +x pour la tour de droite)
    ouv[sg > 0 ? 'E' : 'O'].push([-0.675, 0.325, 6.25, 8.25]);
    ouv[sg > 0 ? 'O' : 'E'].push([-0.5, 0.5, 6.25, 8.25]);
  }
  ouv[porte.face].push([porte.a - 0.5, porte.a + 0.5, 0, 2.2]);
  for (const face of ['N', 'S', 'O', 'E']) b1Face(w, tf, face, S, e, 0.1, Ht, ouv[face], M_STONE);
  // ---- la porte (au milieu de l'épaisseur du mur), fermée la nuit comme les autres
  const pl = porte.face === 'N' ? [porte.a, -h + e / 2] : [-h + e / 2, porte.a], rr = porte.face === 'N' ? 0 : B1PI / 2;
  const [dx, dz] = b1W(tf, pl[0], pl[1]);
  w.doors.push({ x: dx, y: y0 + 0.12, z: dz, r: tf.r + rr, w: 0.94, h: 2.05, a: 0, open: 0, locked: false, bld: t.key, style: 'garde', ep: e });
  const di = w.doors.length - 1;
  // ---- planchers, échelles
  const Bf = { x: cx, y: y0 - 0.05, z: cz, r: tf.r + rr };
  const niveaux = [];
  const plancher = (yt, G) => { const d = b1Bloc(w, tf, [-I, I, -I, I], yt - 0.2, yt, M_PLANKS, { plafond: true }); b1Percer(w, tf, [d], G.R); niveaux.push({ y: y0 + yt, trappe: G.R, f: tf }); };
  const G = {};
  if (t.angle) {
    G.a = b1Geo(I, I, 'R', 1.0, 1.0, 1.15); G.b = b1Geo(I, I, 'B', -1.0, 1.0, 1.15);
    plancher(3.1, G.a); plancher(6.25, G.b);
    b1Echelle(w, B, tf, t.key, G.a, 0.1, 3.1, { id: 'e1', niv: 1, ep: 0.2, labH: 'Monter à l’échelle' });
    b1Echelle(w, B, tf, t.key, G.b, 3.1, 6.25, { id: 'e2', niv: 2, ep: 0.2, labH: 'Monter à l’échelle' });
  } else {
    const sg = t.u > 0 ? 1 : -1;
    G.a = b1Geo(I, I, 'B', 0.5 * sg, 0.9, 0.85);
    plancher(6.25, G.a);
    b1Echelle(w, B, tf, t.key, G.a, 0.1, 6.25, { id: 'e1', niv: 1, ep: 0.2, cote: -sg, labH: 'Monter à l’échelle' });
    // (le chemin de ronde passe au bord du trou : six mètres de chute ; un garde-corps de ce côté-là)
    const R = G.a.R, xa = sg > 0 ? R[0] - 0.07 : R[1] + 0.07;
    b1Garde(w, tf, [Math.min(xa, sg * I), Math.max(xa, sg * I), R[2] - 0.08, R[2]], 6.25, [[xa + 0.04 * sg, R[2] - 0.04], [sg > 0 ? R[1] : R[0], R[2] - 0.04]]);
  }
  // ---- le bâtiment (les règles des maisons : dedans, la porte, le crochetage, les fouilles)
  const ox = b1W(tf, porte.face === 'N' ? porte.a : -h - 1.3, porte.face === 'N' ? -h - 1.3 : porte.a), ix = b1W(tf, porte.face === 'N' ? porte.a : -I + 0.9, porte.face === 'N' ? -I + 0.9 : porte.a);
  const nOut = B.navNode(ox[0], ox[1], t.key + ':out'), nIn = B.navNode(ix[0], ix[1], t.key + ':in'), nMid = B.navNode(cx, cz, t.key + ':mid');
  B.navLink(nOut, nIn, 'door:' + di); B.navLink(nIn, nMid);
  w.bld[t.key] = { key: t.key, name: LIEU_NAMES[t.key] || t.key, x: cx, z: cz, y: y0 + 0.1, f: Bf, W: S, D: S, H: Ht, door: di, nOut, nIn, nMid, spots: {}, out: ox, tour: true };
  w.b1.niveaux[t.key] = niveaux.map((n, i) => ({ y: n.y, y1: i + 1 < niveaux.length ? niveaux[i + 1].y - 0.2 : y0 + Ht, trappe: n.trappe, niv: i + 1, tf: true }));
  w.b1.tours.push({ key: t.key, x: cx, z: cz, tf, angle: t.angle });
  b1MeublerTour(w, B, t, tf, y0, I);
}
// ce qu'il y a dans les tours (repère tf : la ville vers −z ; aux tours d'angle, vers −x aussi)
function b1MeublerTour(w, B, t, tf, y0, I) {
  const key = t.key, b = { key, f: { x: tf.x, y: y0 - 0.05, z: tf.z, r: tf.r } };
  const C0 = b1Ctx(w, B, b, 0.15, { own: 'garde' });
  if (t.angle) {
    // le magasin, au pied
    C0.A('tonneau', -1.55, 1.55, 0, null, 1, { slot: 'tonneau1' });
    C0.P('tonneau', -0.95, 1.6, 0.4);
    C0.A('caisse', -1.6, 0.55, 0.2, null, 1, { slot: 'caisse1' });
    C0.P('tas_bois', -0.1, 1.55, 0);
    C0.A('sac', 1.55, -1.55, 0.4, null, 1, { slot: 'sac1' });
    C0.P('roue_deco', 1.95, -0.35, 0);
    if (key === 'tour_sw') { C0.P('tonneau', -1.6, -0.4, 1.1); C0.I('b1_voir', 'b1:' + key + ':poudre', -1.25, 0.9, -0.4, 'Un tonneau', { t: '(Un tonneau marqué d’une croix. Vide. Il sent encore la poudre.)' }); }
    if (key === 'tour_se') { C0.P('filet', 0.9, -1.85, 0); C0.P('nasse', 1.6, 0.35, 0.3); }
    // la salle haute : le corps de garde
    const C1 = b1Ctx(w, B, b, 3.15, { own: 'garde' });
    C1.P('paillasse', -1.55, -1.0, 0);
    C1.P('paillasse', 0.05, -1.55, B1PI2);
    C1.P('b1_ratelier', 1.87, -0.7, -B1PI2);
    C1.P('table', -0.2, -0.45, 0, null, 0.8);
    C1.P('b1_lampe', -0.45, -0.4, 0, null, 1, 0.63);
    C1.F('malle', 'malle', 1.55, -1.76, 0, { slot: 'coffre', table: 'f2_coffre_garde', lock: 2, pool: 'b1_garde', lab: 'Ouvrir le coffre des gardes' });
    if (key === 'tour_ne') C1.L('consigne', 0.05, 0.75, -0.45, 'Consigne des tours', 'Une feuille clouée sur la table, l’encre pâlie :\n\n« Le garde monte aux tours à la tombée du jour et redescend au lever des ponts. Il ne répond pas aux appels qui viennent des douves. Il ne compte pas les lumières sur le lac. Il ne monte pas à la tour aux Corneilles. »', 'Par ordre du maire');
    if (key === 'tour_nw') { C1.P('c2_nid', 1.4, 1.75, 0.4, null, 0.6); C1.I('b1_voir', 'b1:' + key + ':plumes', 1.1, 0.4, 1.3, 'Des plumes', { t: '(Des plumes noires partout. Et pas un oiseau.)' }); }
    for (const [face, a] of [['S', 0.5], ['E', 1.85], ['O', 1.0]]) b1Fente(w, tf, face, t.S, t.e, a, 3.1 + 1.05);
    // le haut : le chemin de ronde passe par la tour
    const C2 = b1Ctx(w, B, b, 6.3, { own: 'garde' });
    C2.P('banc', 1.2, 1.72, B1PI);
    C2.P('seau_cachot', 1.7, -1.6, 0);
    for (const [face, a] of [['S', 0.9], ['E', 1.2], ['E', -1.2]]) b1Fente(w, tf, face, t.S, t.e, a, 6.25 + 1.0);
  } else {
    // au pied d'une tour de la porte : le treuil du pont-levis, ses chaînes
    const sg = t.u > 0 ? 1 : -1;
    C0.P('treuil', -0.85 * sg, 0.2, B1PI2);
    C0.P('chaine_mur', -1.15 * sg, -0.65, sg * B1PI2);
    C0.A('caisse', 0.82 * sg, -0.82, 0.3, null, 0.7, { slot: 'caisse1' });
    const C2 = b1Ctx(w, B, b, 6.3, { own: 'garde' });
    C2.P('seau_cachot', -0.75 * sg, 0.85, 0);
    b1Fente(w, tf, 'S', t.S, t.e, -0.6 * sg, 6.25 + 1.0);
  }
}

// ============================================================================
//  LE CLOCHER : une échelle jusqu'au beffroi, sous la cloche
//  (06-structures.js `church` : un puits de pierre de 16 m, ouvert au dos au-dessus du toit de la nef ; l'échelle de
//  11-zzz99-activites.js y montait à 14,5 m, dans le vide. Ici : un plancher à 11,3 m et sa trappe, une baie et ses
//  abat-sons sur chaque face, la cloche à sa poutre, sa corde jusqu'au porche. L'échelle d'avant s'arrête un mètre
//  au-dessus du plancher ; « Monter au clocher », c'est elle ; « Regarder la vallée » se fait là-haut.)
// ============================================================================
function b1Clocher(w, B) {
  const eg = w.bld.eglise, cf = eg && eg.f;
  if (!cf) return;
  const linteau = b1Trouve(w, cf, 0, -13.9, 3.2, 2.0, 12.8, 0.6), murs = [b1Trouve(w, cf, -2.3, -11.6, 0, 0.6, 16, 4.0), b1Trouve(w, cf, 2.3, -11.6, 0, 0.6, 16, 4.0)];
  const ech = w.props.find((q) => q.id === 'echelle' && q.data && q.data.h > 14 && Math.hypot(...b1L(cf, q.x, q.z).map((v, i) => v - [1.9, -12.3][i])) < 0.15);
  if (!linteau || !murs[0] || !murs[1] || !ech || !b1Trouve(w, cf, 0, -11.6, 16, 5.8, 0.4, 5.8)) return;
  const [tx, tz] = b1W(cf, 0, -11.6), tf = { x: tx, y: cf.y, z: tz, r: cf.r };
  const YP = 11.3, Y0 = 12.2, Y1 = 14.6, HT = 16.0;
  // ---- une baie de 2 m sur 2,4 m sur chaque face, à 0,9 m au-dessus du plancher
  b1Reposer(linteau, tf, [-1.0, 1.0, -2.6, -2.0], 3.2, Y0);
  b1Bloc(w, tf, [-1.0, 1.0, -2.6, -2.0], Y1, HT, M_STONE);
  for (const s of [-1, 1]) {
    const X = s > 0 ? [2.0, 2.6] : [-2.6, -2.0];
    b1Reposer(murs[s > 0 ? 1 : 0], tf, [X[0], X[1], -2.0, 2.0], 0, Y0);
    b1Bloc(w, tf, [X[0], X[1], -2.0, -1.0], Y0, Y1, M_STONE); b1Bloc(w, tf, [X[0], X[1], 1.0, 2.0], Y0, Y1, M_STONE);
    b1Bloc(w, tf, [X[0], X[1], -2.0, 2.0], Y1, HT, M_STONE);
  }
  b1Bloc(w, tf, [-2.6, 2.6, 2.0, 2.6], 7.0, Y0, M_STONE);
  b1Bloc(w, tf, [-2.6, -1.0, 2.0, 2.6], Y0, Y1, M_STONE); b1Bloc(w, tf, [1.0, 2.6, 2.0, 2.6], Y0, Y1, M_STONE);
  b1Bloc(w, tf, [-2.6, 2.6, 2.0, 2.6], Y1, HT, M_STONE);
  // les abat-sons ; dans chaque baie, une grille qu'on ne voit pas (on ne tombe pas du clocher)
  for (const [ax, az, rr] of [[0, -2.3, B1PI], [2.3, 0, B1PI2], [-2.3, 0, -B1PI2], [0, 2.3, 0]]) {
    B.propRel(tf, 'b1_abatson', ax, Y0, az, rr, { w: 2.0, h: Y1 - Y0 });
    b1Bloc(w, tf, Math.abs(ax) > 0.1 ? [ax - 0.08, ax + 0.08, -1.0, 1.0] : [-1.0, 1.0, az - 0.08, az + 0.08], Y0, Y1, 0, { hidden: true });
  }
  // ---- le plancher du beffroi, sa trappe contre le mur de l'échelle, un garde-corps autour du trou
  const G = b1Geo(2.0, 2.0, 'R', -0.7, 1.0, 1.15);
  const pl = b1Bloc(w, tf, [-2.0, 2.0, -2.0, 2.0], YP - 0.2, YP, M_PLANKS, { plafond: true });
  b1Percer(w, tf, [pl], G.R);
  ech.data = Object.assign({}, ech.data, { h: YP - (ech.y - cf.y) + 0.95 });
  const e = b1Echelle(w, B, tf, 'eglise', G, 0.05, YP, { id: 'beffroi', ep: 0.2, echelle: false, labH: 'Monter au clocher' });
  b1Garde(w, tf, [G.R[0] - 0.08, G.R[0], G.R[2] - 0.07, G.R[3] + 0.08], YP, [[G.R[0] - 0.04, G.R[2] - 0.02], [G.R[0] - 0.04, G.R[3] + 0.04]]);
  b1Garde(w, tf, [G.R[0] - 0.08, 2.0, G.R[3], G.R[3] + 0.08], YP, []);
  // ---- la cloche, sa corde (jusqu'au porche, où l'on tire), l'inscription, un nid
  B.propRel(tf, 'b1_cloche', 0, 13.8, 0, 0, { L: 4.6 });
  B.propRel(tf, 'b1_corde', -0.62, 0.95, -0.55, 0, { h: 15.05 - 0.95 });
  const C = b1Ctx(w, B, { key: 'eglise', f: tf }, YP, { own: null });
  C.I('lire', 'b1:eglise:cloche', 0.3, 2.3, 0.45, 'Lire l’inscription de la cloche', { text: ['L’inscription de la cloche', 'En lettres de bronze, tout autour de la robe :\n\n« J’APPELLE LES VIVANTS · JE PLEURE LES MORTS · JE BRISE LA FOUDRE »\n\nPlus bas : « Refondue l’an 1824. La première fut descendue en 1793 pour faire des sous. J’ai nom Marie-Jeanne. » Le nom du parrain, le vert-de-gris l’a mangé.\n\nSous la dernière ligne, quelqu’un a gravé au couteau treize petits traits.', ''] });
  C.P('c2_nid', -1.55, 1.5, 0.6, null, 0.6);
  C.I('b1_voir', 'b1:eglise:plumes', -1.3, 0.4, 1.2, 'Des plumes', { t: '(Des fientes, des plumes grises de pigeon. Et une plume blanche, longue comme la main, qui n’est pas d’un pigeon.)' });
  // « Regarder la vallée » : l'interaction de 11-zzz99-activites.js monte au beffroi (mêmes x et z, l'empreinte ne bouge pas)
  const vue = w.inter.find((i) => i.kind === 'f2a_clocher');
  if (vue) { vue.y = tf.y + YP + 1.45; vue.name = 'Regarder la vallée'; }
  w.b1.clocher = { tf, y: tf.y + YP, y1: tf.y + HT, trappe: G.R, toH: e.toH };
}

// ============================================================================
//  LA TENTE DE LA DISEUSE : on y entre (11-zzz99-activites.js lui donnait une collision pleine de 2 × 2,2 m ; elle
//  devient ses parois et la table) ; un rideau la ferme quand Mère Ysaure n'est pas là
// ============================================================================
function b1Tente(w, B) {
  const q = w.props.find((p) => p.id === 'tente_diseuse');
  if (!q || !q.blk) return;
  const g = { x: q.x, y: q.y, z: q.z, r: q.r }, H = { hidden: true };
  b1Reposer(q.blk, g, [-1.0, 1.0, -1.1, -0.95], 0, 2.2);
  b1Bloc(w, g, [-1.0, -0.78, -0.95, 1.1], 0, 2.2, 0, H);
  b1Bloc(w, g, [0.78, 1.0, -0.95, 1.1], 0, 2.2, 0, H);
  b1Bloc(w, g, [-0.36, 0.36, 0.19, 0.58], 0, 2.2, 0, H);
  const porte = b1Bloc(w, g, [-0.78, 0.78, 1.0, 1.1], 0, 2.2, 0, H);
  const rideau = B.propRel(g, 'b1_rideau', 0, 0, 0, 0, { ferme: true });
  B.paintRect(g, 0, 0.25, 1.0, 1.35, M_DIRT); // (la terre battue sous la tente et devant : l'herbe n'y pousse pas)
  const [ix, iz] = b1W(g, 0, 0.45);
  B.inter('b1_diseuse', 'b1:diseuse', ix, q.y + 0.95, iz, 'Se faire tirer les cartes', {});
  w.b1.tente = { g, porte, rideau, y: porte.y, ouvert: false };
}

// ============================================================================
//  LA GÉNÉRATION (après tout le reste, tirage propre)
// ============================================================================
function b1Generer(w, seed) {
  if (!w || !w.bld || !w.nav || !w.props || !w.blocks) return;
  w.inter = w.inter || [];
  const rnd = mulberry32((((seed | 0) * 7177) ^ 0xB1B1) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(1));
  w.grid = null;
  w.b1 = { niveaux: {}, tours: [], chandelle: -1 };
  for (const key of B1_ORDRE) {
    const E = B1_ETAGES[key];
    if (!E || !w.bld[key]) continue;
    try {
      const N = b1Etage(w, B, key, E.spec);
      if (N && E.meubler) E.meubler(b1Ctx(w, B, N.b, N.ly), N);
    } catch (e) { console.error('B1 : l’étage de ' + key, e); }
  }
  try { if (w.bld.bibliotheque) b1Bibliotheque(w, B); } catch (e) { console.error('B1 : la bibliothèque', e); }
  if (w.townInfo) {
    try { b1Tours(w, B); } catch (e) { console.error('B1 : les tours', e); }
    // les chemins : les nœuds des tours rejoignent les rues (comme 11-zzz95-sommeil.js après la maison du Rempart)
    try {
      const N = w.nav;
      for (const q of N.nodes) delete q.iso;
      finalizeNav(w);
      const seen = new Set();
      for (let i = 0; i < N.nodes.length; i++) {
        if (!/^village:/.test(N.nodes[i].tag)) continue;
        const Q = [i]; seen.add(i);
        while (Q.length) { const c = Q.shift(); N.nodes[c].iso = false; for (const e of N.adj[c]) if (!seen.has(e.to)) { seen.add(e.to); Q.push(e.to); } }
      }
    } catch (e) { console.error('B1 : les chemins', e); }
  }
  try { b1Clocher(w, B); } catch (e) { console.error('B1 : le clocher', e); }
  try { b1Tente(w, B); } catch (e) { console.error('B1 : la tente de la diseuse', e); }
  w.objectsDirty = true; w.grid = null; w.blocksDirty = true; w.coverDirty = true; w.shadeDirty = true;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { b1Generer(w, w.seed || seed); } catch (e) { console.error('B1 : génération', e); } }
    return w;
  };
}

// ============================================================================
//  LE JEU
// ============================================================================
const b1 = {
  anim: null, nivJ: null, nivT: 0, nivP: null,
  S() { const s = farm.s; if (!s) return null; const S = s.b1 && typeof s.b1 === 'object' ? s.b1 : (s.b1 = {}); if (!S.vus || typeof S.vus !== 'object') S.vus = {}; return S; },
  // le niveau d'un point : { key, niv (0 le rez-de-chaussée, 1, 2… les étages), N } ou null (hors des bâtiments à étage)
  niveau(x, y, z) {
    const w = game.world, G = w && w.b1;
    if (!G) return null;
    for (const key in G.niveaux) {
      const B = w.bld[key];
      if (!B || !B.f || Math.abs(B.f.x - x) > 14 || Math.abs(B.f.z - z) > 14) continue;
      const [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, x, z);
      if (Math.abs(lx) > B.W / 2 || Math.abs(lz) > B.D / 2) continue;
      const L = G.niveaux[key];
      for (let i = L.length - 1; i >= 0; i--) if (y >= L[i].y - 0.6 && y <= L[i].y1 + 0.3) return { key, niv: L[i].niv, N: L[i] };
      return { key, niv: 0, N: null };
    }
    return null;
  },
  // le niveau du joueur (recalculé quatre fois par seconde)
  etage() {
    const t = performance.now(), p = game.player, q = this.nivP;
    if (t < this.nivT && !this.anim && q && Math.abs(q[0] - p.pos[0]) + Math.abs(q[1] - p.pos[1]) + Math.abs(q[2] - p.pos[2]) < 0.25) return this.nivJ;
    this.nivJ = this.niveau(p.pos[0], p.pos[1], p.pos[2]); this.nivT = t + 250; this.nivP = p.pos.slice();
    return this.nivJ;
  },

  // ------------------------------------------------------------------ grimper (on voit le plafond passer)
  grimper(it) {
    const d = it.data, p = game.player;
    if (this.anim || game.sleeping || game.dying || (typeof cine !== 'undefined' && cine.on) || !d || !d.to) return;
    if (p.riding) return;
    if (typeof corps !== 'undefined' && corps.jambeCassee && corps.jambeCassee() && Math.random() < 0.5) { ui.subtitle('', '(Avec cette jambe, les barreaux vous échappent.)', 2.5); return; }
    const haut = d.sens === 'haut', P0 = p.pos.slice(), A = haut ? d.pied : d.haut, Bv = haut ? d.haut : d.pied, Z = d.to;
    const yawFin = haut ? d.yaw + Math.PI : d.yaw, dy = Math.abs(Bv[1] - A[1]);
    const d0 = Math.hypot(A[0] - P0[0], A[2] - P0[2]);
    this.anim = {
      t: 0, sonY: A[1],
      segs: [
        { a: P0, b: [A[0], P0[1] + (A[1] - P0[1]) * (haut ? 1 : 0), A[2]], dur: Math.min(0.8, 0.2 + d0 * 0.35), yaw: d.yaw, pitch: haut ? 0.3 : -0.4 },
        { a: null, b: Bv, dur: 0.35 + dy * 0.36, yaw: d.yaw, pitch: haut ? 0.12 : -0.15, barreaux: true },
        { a: null, b: Z, dur: haut ? 0.6 : 0.45, yaw: yawFin, pitch: 0 },
      ],
      i: 0, yaw0: p.yaw, pitch0: p.pitch,
    };
    game.sleeping = true;
    p.vel = [0, 0, 0];
    sound.step && sound.step('wood', 2);
  },
  update(dt) {
    const A = this.anim;
    if (!A) return;
    const p = game.player;
    if (game.dying || !farm.s) { this.anim = null; game.sleeping = false; return; }
    const S = A.segs[A.i];
    if (!S.a) S.a = p.pos.slice();
    A.t += dt;
    const k = Math.min(1, A.t / S.dur), e = k * k * (3 - 2 * k);
    p.pos = [lerp(S.a[0], S.b[0], e), lerp(S.a[1], S.b[1], e), lerp(S.a[2], S.b[2], e)];
    p.vel = [0, 0, 0];
    let dyaw = ((S.yaw - A.yaw0) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    p.yaw = A.yaw0 + dyaw * e; p.pitch = lerp(A.pitch0, S.pitch, e);
    if (S.barreaux && Math.abs(p.pos[1] - A.sonY) > 0.38) { A.sonY = p.pos[1]; sound.step && sound.step('wood', 1.5); }
    if (k >= 1) {
      A.i++; A.t = 0; A.yaw0 = S.yaw; A.pitch0 = S.pitch;
      if (A.i >= A.segs.length) {
        this.anim = null; game.sleeping = false; p.vel = [0, 0, 0]; this.nivT = 0;
        try { game.renderer.uploadCover(p.pos[0], p.pos[2]); } catch (e) { /* rien */ }
        if (typeof meubles !== 'undefined') meubles.cacheP = null;
        if (A.fin) { try { A.fin(); } catch (e) { console.error('B1', e); } }
      }
    }
  },

  // ------------------------------------------------------------------ le clocher : dans le beffroi ? ouvert ? la vue
  auClocher() {
    const w = game.world, C = w && w.b1 && w.b1.clocher, p = game.player.pos;
    if (!C) return false;
    const [lx, lz] = b1L(C.tf, p[0], p[2]);
    return Math.abs(lx) < 2.05 && Math.abs(lz) < 2.05 && p[1] > C.y - 0.6 && p[1] < C.y1;
  },
  // le curé ferme l'échelle la nuit, et pendant la messe (les heures de 11-zzz99-activites.js)
  clocherOuvert(dire) {
    const h = npcs.hour();
    if (h < 7 || h >= 20) { if (dire) ui.subtitle('', '(Une chaîne cadenassée barre l’échelle du clocher. Le curé l’ôte au matin.)', 3.5); return false; }
    if (typeof cal !== 'undefined' && cal.is('messe') && h >= 9.8 && h < 11.6) { if (dire) ui.subtitle('', '(Pas pendant la messe.)', 3); return false; }
    return true;
  },
  // « Regarder la vallée », du beffroi : la vue de 11-zzz99-activites.js (une fois par jour), sans les cent douze marches
  vueClocher(orig) {
    const h = npcs.hour();
    if (h < 7 || h >= 20) { ui.subtitle('', '(La nuit, on ne voit que les lanternes de la ville, et le noir tout autour.)', 4); return; }
    if (typeof activites !== 'undefined' && activites.fait && activites.fait('clocher')) { ui.subtitle('', '(Les toits, la place, les champs. Vous les avez déjà regardés aujourd’hui.)', 3); return; }
    if (typeof cine === 'undefined' || !cine.jouer) { orig(); return; }
    const J = cine.jouer;
    cine.jouer = function (seq, o) { cine.jouer = J; return J.call(this, (seq || []).filter((q) => !(q && /marches/.test(q.texte || ''))), o); };
    try { orig(); } finally { cine.jouer = J; }
  },

  // ------------------------------------------------------------------ la tente de la diseuse
  dansTente() {
    const w = game.world, T = w && w.b1 && w.b1.tente, p = game.player.pos;
    if (!T) return false;
    const [lx, lz] = b1L(T.g, p[0], p[2]);
    return Math.abs(lx) < 1.0 && lz > -1.1 && lz < 1.2 && Math.abs(p[1] - T.g.y) < 1.5;
  },
  // ouverte quand Mère Ysaure est là (et tant que le joueur est dedans : on ne ferme pas sur lui)
  tente(force) {
    const w = game.world, T = w && w.b1 && w.b1.tente;
    if (!T || typeof activites === 'undefined' || !activites.diseusePresente) return;
    const ouvert = !!activites.diseusePresente() || this.dansTente();
    if (!force && ouvert === T.ouvert) return;
    T.ouvert = ouvert;
    T.porte.y = ouvert ? T.y - 40 : T.y;
    T.rideau.data = Object.assign({}, T.rideau.data || {}, { ferme: !ouvert });
    farm.dirtyProps = true;
  },
  // « Entrer sous la tente » : on fait les deux pas, on s'arrête devant la table, puis elle parle
  entrerTente(fin) {
    const T = game.world.b1.tente, p = game.player;
    if (this.anim || game.sleeping || game.dying || p.riding || (typeof cine !== 'undefined' && cine.on)) { fin(); return; }
    const [ax, az] = b1W(T.g, 0, 1.75), [x, z] = b1W(T.g, 0, 0.93), y = T.g.y + 0.02;
    this.anim = {
      t: 0, sonY: 0, i: 0, yaw0: p.yaw, pitch0: p.pitch, fin,
      segs: [
        { a: null, b: [ax, y, az], dur: clamp(Math.hypot(ax - p.pos[0], az - p.pos[2]) * 0.45, 0.15, 0.8), yaw: T.g.r, pitch: -0.05 },
        { a: null, b: [x, y, z], dur: 0.7, yaw: T.g.r, pitch: -0.22 },
      ],
    };
    game.sleeping = true; p.vel = [0, 0, 0];
  },

  // ------------------------------------------------------------------ le jour, par les fenêtres et les meurtrières : une lueur douce dans la pièce où l'on est
  lumieresJour() {
    const sk = game.sky, k = sk ? clamp(sk.day || 0, 0, 1) * (1 - 0.45 * (sk.cloudCover || 0)) : 0;
    if (k < 0.05 || game.player.underground || this.anim) return [];
    if (this.auClocher()) { const C = game.world.b1.clocher, c = 0.5 * k; return [{ x: C.tf.x, y: C.y + 1.9, z: C.tf.z, r: 5.5, c: [c * 0.95, c, c * 1.08], d: 0.5 }]; }
    const E = this.etage(), w = game.world, B = E && w.bld[E.key];
    if (!B || !B.f || (!B.tour && !E.niv)) return [];
    const y = (E.niv ? E.N.y : B.y) + 1.9, c = (B.tour ? 0.55 : 0.5) * k, col = [c * 0.95, c, c * 1.08];
    if (Math.max(B.W, B.D) > 14) return [-1 / 3, 0, 1 / 3].map((u) => { const [x, z] = b1W(B.f, u * B.W, 0); return { x, y, z, r: 9.5, c: col, d: 0.5 }; });
    return [{ x: B.f.x, y, z: B.f.z, r: B.tour ? 5.5 : Math.max(B.W, B.D) * 0.85, c: col, d: 0.5 }];
  },

  // ------------------------------------------------------------------ le garde-meuble de la commune (au grenier de la mairie)
  gardeMeuble() {
    const m = npcs.byId && npcs.byId.maire;
    const la = m && m.st.alive && !m.vanished && !m.hunting && fouilles.dedans(m, 'mairie') && !(m.sleep || m.state === 'sleep') && !npcs.hostile(m) && !(m.st.anger > 0);
    if (la && typeof meubles !== 'undefined' && meubles.ouvrirGardeMeuble) {
      npcs.say(m, pick(['Vous êtes au grenier ? Regardez, regardez. Tout est à vendre. Je note d’en bas.', 'Les successions ? Choisissez, je vous fais le prix d’ici. Et ne soulevez pas les draps du fond.']), 4);
      meubles.ouvrirGardeMeuble(m);
      return;
    }
    ui.subtitle('', '(Sur chaque drap, une étiquette : « Succession Varenne », « Succession Lefèvre », « Succession — ». En dessous : « À vendre. S’adresser au maire. »)', 5);
  },
  // la chandelle de la chambre du haut, chez les Delorme : allumée le Vorndi (personne ne dit qui l'allume)
  chandelle() {
    const w = game.world, i = w && w.b1 ? w.b1.chandelle : -1, q = i >= 0 && w.props[i];
    if (!q || q.id !== 'b1_chandelle') return;
    const on = typeof cal !== 'undefined' && cal.is ? cal.is('morts') : false;
    if (!!(q.data && q.data.lit) === on) return;
    q.data = Object.assign({}, q.data || {}, { lit: on });
    farm.dirtyProps = true; w.collectLights();
  },
  charger() {
    this.anim = null; this.nivJ = null; this.nivT = 0;
    if (!farm.s || !game.world) return;
    this.S(); this.chandelle(); this.tente(true);
    if (game._b1) return;
    game._b1 = true;
    // (les étiquettes de 11-zzz99-activites.js sont posées à son chargement, juste avant)
    const _et = fouilles.etiquettes.f2a_clocher;
    fouilles.etiquettes.f2a_clocher = (it) => { const t = _et ? _et(it) : esc(it.name || ''); return t && this.auClocher() && typeof activites !== 'undefined' && activites.fait && activites.fait('clocher') ? t + ' <b>— déjà fait aujourd’hui</b>' : t; };
    // dedans, à l'étage aussi
    const _ib = game.insideBuilding.bind(game);
    game.insideBuilding = function (key) {
      if (_ib(key)) return true;
      const w = this.world, L = w && w.b1 && w.b1.niveaux[key], B = w && w.bld[key];
      if (!L || !B || !B.f) return false;
      const p = this.player.pos, [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, p[0], p[2]);
      if (Math.abs(lx) >= B.W / 2 || Math.abs(lz) >= B.D / 2) return false;
      return L.some((N) => p[1] >= N.y - 0.6 && p[1] <= N.y1 + 0.3);
    };
    // meubler l'étage de chez soi (maison louée ou achetée)
    if (typeof meubles !== 'undefined') {
      const _dans = meubles.dans.bind(meubles);
      meubles.dans = function (x, y, z, marge) {
        const k = _dans(x, y, z, marge);
        if (k) return k;
        const E = b1.niveau(x, y, z);
        if (!E || !E.niv) return null;
        const B = game.world.bld[E.key], m = marge === undefined ? 0.05 : marge, [lx, lz] = World.blockLocal({ x: B.f.x, z: B.f.z, r: B.f.r }, x, z);
        return Math.abs(lx) < B.W / 2 - m && Math.abs(lz) < B.D / 2 - m && y <= E.N.y + 2.6 ? E.key : null;
      };
      const _geo = meubles.geo.bind(meubles);
      meubles.geo = function (k) {
        const G = _geo(k);
        const E = G && b1.etage();
        if (!G || !E || E.key !== k || !E.niv || E.N.tf) return G;
        return Object.assign(G, { y: E.N.y, porte: null, trappe: E.N.trappe, niv: E.niv });
      };
      const _ver = meubles.verifier.bind(meubles);
      meubles.verifier = function (G, id, bb, k, cx, cz, y, plat, mur) {
        if (G && G.trappe) {
          const t = this.tourner(bb, k), A = [cx + t[0], cx + t[1], cz + t[2], cz + t[3]], R = G.trappe;
          if (A[0] < R[1] + 0.35 && R[0] - 0.35 < A[1] && A[2] < R[3] + 0.35 && R[2] - 0.35 < A[3]) return 'passage';
        }
        return _ver(G, id, bb, k, cx, cz, y, plat, mur);
      };
    }
  },
};

// ---------------------------------------------------------------- les témoins : d'en bas, on ne voit pas l'étage ; on entend, parfois
{
  const _tm = fouilles.temoins.bind(fouilles);
  fouilles.temoins = function (it, own) {
    const E = b1.etage();
    if (!E || !E.niv) return _tm(it, own);
    const p = game.player, out = [], T = this.type(it), fort = /metal|monnaie|verre|vaisselle/.test(T.son || '');
    for (const m of npcs.list) {
      if (!m.st.alive || m.vanished || m.hunting || m.state === 'gone' || m.state === 'dead' || m.talking) continue;
      const dist = Math.hypot(p.pos[0] - m.x, p.pos[2] - m.z);
      if (dist > 13) continue;
      // (au même niveau que vous — ce n'est pas l'habitude des habitants — on voit)
      if (m.y !== undefined && Math.abs(m.y - p.pos[1]) < 1.6) { if (Math.random() < 0.7) out.push(m); continue; }
      if (dist > 9 || !this.dedans(m, E.key)) continue;
      if (m.sleep || m.state === 'sleep') { if (Math.random() < (it.data.lock ? 0.12 : 0.06)) { m.state = 'idle'; m.sleep = false; m.goal = null; out.push(m); } continue; }
      let k = fort ? 0.35 : 0.2;
      if (p.crouch > 0.5) k *= 0.6;
      if (Math.random() < k) out.push(m);
    }
    return out;
  };
}

// ---------------------------------------------------------------- branchements
HOOKS.inter.b1_echelle = (it) => { const d = it.data; if (d && d.key === 'eglise' && d.sens === 'haut' && !b1.clocherOuvert(true)) return; b1.grimper(it); };
HOOKS.interVis.b1_echelle = (it) => { const d = it.data, y = game.player.pos[1]; return d.sens === 'haut' ? y < d.haut[1] - 1.0 : y > d.haut[1] - 0.8; };
// le clocher : la vue se prend là-haut ; la tente : on y entre, et l'on parle à la diseuse de l'intérieur
{
  const _cl = HOOKS.inter.f2a_clocher;
  if (_cl) HOOKS.inter.f2a_clocher = (it) => (game.world && game.world.b1 && game.world.b1.clocher ? b1.vueClocher(() => _cl(it)) : _cl(it));
  HOOKS.interVis.f2a_clocher = () => !(game.world && game.world.b1 && game.world.b1.clocher) || b1.auClocher();
  const _ds = HOOKS.inter.f2a_diseuse;
  if (_ds) HOOKS.inter.f2a_diseuse = (it) => { const T = game.world && game.world.b1 && game.world.b1.tente; if (!T || !T.ouvert || b1.dansTente()) _ds(it); else b1.entrerTente(() => _ds(it)); };
  HOOKS.interVis.f2a_diseuse = () => !b1.dansTente();
}
HOOKS.inter.b1_diseuse = () => { if (typeof activites !== 'undefined' && activites.diseuse) activites.diseuse(); };
HOOKS.interVis.b1_diseuse = () => b1.dansTente();
HOOKS.inter.b1_voir = (it) => { if (it.data && it.data.t) ui.subtitle('', it.data.t, 4); };
HOOKS.inter.b1_garde_meuble = () => b1.gardeMeuble();
HOOKS.inter.b1_sept = () => {
  const S = b1.S(), n = S ? (S.vus.sept = (S.vus.sept || 0) + 1) : 1;
  ui.subtitle('', n === 1 ? '(Le lit est défait. Les draps sont tièdes.)' : n % 5 === 0 ? '(Sur l’oreiller, un creux. Comme si quelqu’un venait de se lever pour vous laisser la place.)' : '(Les draps sont tièdes.)', 4);
};
LIT_INTERS.add('b1_sept');
DYN_PROPS.add('b1_chandelle');
for (const k of ['b1_voir', 'b1_garde_meuble', 'b1_sept']) fouilles.etiquettes[k] = (it) => esc(it.name || '');
fouilles.etiquettes.b1_echelle = (it) => esc(it.name || '') + (it.data && it.data.key === 'eglise' && it.data.sens === 'haut' && !b1.clocherOuvert(false) ? ' <b>— fermé</b>' : '');
fouilles.etiquettes.b1_diseuse = (it) => esc(it.name || '') + (typeof activites !== 'undefined' && activites.diseusePresente && !activites.diseusePresente() ? ' <b>— fermée</b>' : '');
HOOKS.update.push((dt) => {
  if (!farm.s || !game.world) return;
  b1.update(dt);
  const E = b1.etage(), k = E ? E.key + ':' + E.niv : '';
  if (k !== b1.nivK) { b1.nivK = k; if (typeof meubles !== 'undefined') meubles.cacheP = null; }
  b1.tenteT = (b1.tenteT || 0) - dt;
  if (b1.tenteT <= 0) { b1.tenteT = 1; b1.tente(false); }
});
HOOKS.day.push(() => { if (farm.s && game.world) b1.chandelle(); });
HOOKS.load.push(() => b1.charger());
HOOKS.lights.push(() => (farm.s && game.world && game.world.b1 ? b1.lumieresJour() : []));
