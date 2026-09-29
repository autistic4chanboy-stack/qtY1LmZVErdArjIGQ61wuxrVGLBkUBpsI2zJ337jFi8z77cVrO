// ============================================================================
//  LA PRISON : le cachot sous la maison du garde de la ville
//  - quand le garde (ou un chasseur de primes) arrête le fermier, on remplace
//    le cachot « en fondu » de la société par une vraie cellule : paillasse,
//    seau, barreaux, soupirail, un geôlier (Honoré Brac) ;
//  - les objets volés sont rendus à leurs propriétaires, les armes gardées au
//    greffe ; la peine se compte en jours, selon les crimes, la prime et les
//    récidives ;
//  - on en sort en payant la RANÇON (libéré aussitôt, prime levée), en purgeant
//    sa peine (dormir sur la paille : le temps passe), ou plus vite par les
//    TRAVAUX FORCÉS : casser des blocs à la carrière du cachot, sous l'œil du
//    geôlier (une journée de carrière vaut deux jours de paille) ;
//  - la ferme vit sans vous : les cultures sèchent, le chien a faim ;
//  - l'ÉVASION est possible et difficile : une lime cachée derrière une pierre
//    et trois nuits à scier un barreau du soupirail, ou le trousseau pris à la
//    ceinture du geôlier quand il s'endort sur son tabouret. Rattrapé : deux
//    jours de plus. Évadé : les crimes reprennent, et l'évasion s'y ajoute ;
//  - à la sortie : la prime est levée, la réputation abîmée.
//  Génération : deux salles souterraines (le cachot, la carrière) ajoutées
//  après tout le reste de la vallée, avec leur propre tirage.
//  État : farm.s.prison. API : prison (incarcerer, liberer, evader, enPrison…)
// ============================================================================
defItem('lime', 'Lime de forçat', 'quete', 0, ['cle', '#7a7a82'], { desc: 'Une lime plate, ébréchée, enveloppée dans un chiffon. Quelqu’un l’a laissée là pour le suivant.' });
defItem('trousseau', 'Trousseau du geôlier', 'quete', 0, ['cle', '#5a5a62'], { desc: 'Six clés de fer sur un anneau. L’une d’elles ouvre votre grille.' });
defItem('masse_forcat', 'Masse de forçat', 'outil', 0, ['marteau', '#6a6a70'], { tool: 'masse', desc: 'Clic : frapper le bloc. Douze blocs par jour, et la journée compte double.' });
Object.assign(LIEU_NAMES, { cachot: 'le cachot de la ville', carriere_cachot: 'la carrière du cachot' });
if (typeof CRIME_DEF !== 'undefined' && !CRIME_DEF.evasion) CRIME_DEF.evasion = { prime: 250, grav: 3, oubli: 12, violent: false };
{
  const _lib = societe.libelle.bind(societe);
  societe.libelle = function (C) { return C && C.type === 'evasion' ? 'une évasion du cachot' : _lib(C); };
}

// ---------------------------------------------------------------- modèles : grilles, paillasse, seau, soupirail, blocs
function kGrille(E, W) {
  const H = 3.4;
  for (let x = -W / 2 + 0.07; x < W / 2; x += 0.15) E.bx(x, 0, 0, 0.045, H, 0.045, PC.iron, TL.iron);
  for (const y of [0.12, 1.3, 2.4, 3.3]) E.box(0, y, 0, W, 0.07, 0.05, PC.iron, TL.iron);
}
Object.assign(PROP_MODELS, {
  grille_cachot(E) { kGrille(E, 6.0); },
  grille_courte(E) { kGrille(E, 2.4); },
  porte_grille(E, o) {
    const a = o.data && o.data.open ? 1.35 : 0, W = 1.2, H = 3.4, hx = -0.6;
    const at = (u) => [hx + Math.cos(a) * u, -Math.sin(a) * u];
    for (let u = 0.08; u < W; u += 0.15) { const [x, z] = at(u); E.bx(x, 0.02, z, 0.045, H - 0.08, 0.045, PC.iron, TL.iron); }
    for (const y of [0.15, 1.3, 2.4, 3.25]) { const [x, z] = at(W / 2); E.box(x, y, z, W, 0.07, 0.05, PC.iron, TL.iron, a); }
    const [lx, lz] = at(W - 0.14); E.box(lx, 1.15, lz, 0.16, 0.22, 0.1, rgbf('#34343a'), TL.iron, a);
    E.bx(hx, 0, 0, 0.1, H, 0.1, PC.iron, TL.iron);
  },
  paillasse(E) {
    E.bx(0, 0, 0, 0.9, 0.14, 1.9, WHITE, TL.straw);
    E.bx(0, 0.14, 0.35, 0.84, 0.04, 1.05, rgbf('#6a5a48'), TL.blanket);
    E.bx(0, 0.14, -0.7, 0.5, 0.1, 0.3, rgbf('#b8a070'), TL.sack);
  },
  seau_cachot(E) {
    E.bx(0, 0, 0, 0.34, 0.38, 0.34, WHITE, TL.wood);
    for (const y of [0.05, 0.3]) E.bx(0, y, 0, 0.36, 0.04, 0.36, PC.iron, TL.iron);
    E.bx(0, 0.35, 0, 0.28, 0.02, 0.28, [0.2, 0.18, 0.12], TL.plain);
  },
  chaine_mur(E) {
    E.box(0, 1.62, 0, 0.14, 0.14, 0.05, PC.iron, TL.iron);
    for (let k = 0; k < 6; k++) E.box(0, 1.5 - k * 0.12, 0.04, k % 2 ? 0.05 : 0.02, 0.11, k % 2 ? 0.02 : 0.05, PC.iron, TL.iron);
    E.box(0, 0.74, 0.07, 0.16, 0.07, 0.16, PC.iron, TL.iron);
  },
  soupirail(E, o) {
    // (le côté +z du modèle regarde la cellule)
    const scie = o.data && o.data.scie;
    E.box(0, 0, -0.03, 0.8, 0.5, 0.04, rgbf('#8e9aac'), TL.plain);
    E.box(0, 0.28, 0.02, 0.9, 0.07, 0.1, PC.stone, TL.stone); E.box(0, -0.28, 0.02, 0.9, 0.07, 0.1, PC.stone, TL.stone);
    for (const x of [-0.26, 0, 0.26]) {
      if (x === 0 && scie) { E.box(0.02, 0.16, 0.05, 0.04, 0.2, 0.04, PC.iron, TL.iron, 0, 0.5); continue; }
      E.box(x, 0, 0.03, 0.04, 0.52, 0.04, PC.iron, TL.iron);
    }
  },
  lanterne_cachot(E) {
    E.bx(0, 0, 0, 0.2, 0.05, 0.2, rgbf('#2e2e34'), TL.iron);
    E.bx(0, 0.05, 0, 0.15, 0.2, 0.15, [1, 0.82, 0.5], TL.glass);
    E.bx(0, 0.25, 0, 0.2, 0.05, 0.2, rgbf('#2e2e34'), TL.iron);
    E.bx(0, 0.3, 0, 0.04, 0.08, 0.04, rgbf('#2e2e34'), TL.iron);
  },
  bloc_pierre(E) {
    E.bx(0, 0, 0, 0.8, 0.55, 0.7, WHITE, TL.stone);
    E.bx(0.08, 0.55, -0.04, 0.55, 0.22, 0.46, WHITE, TL.stone);
  },
  gravats(E) {
    const P = [[0, 0, 0.5], [0.3, 0.1, 0.34], [-0.28, -0.12, 0.3], [0.1, -0.3, 0.26], [-0.1, 0.32, 0.28], [0.36, -0.28, 0.2], [-0.4, 0.2, 0.22]];
    for (const [x, z, s] of P) E.bx(x, 0, z, s, s * 0.6, s * 0.8, WHITE, TL.stone);
  },
  pierre_mur(E) { E.box(0, 0, 0.02, 0.38, 0.26, 0.12, rgbf('#b8b0a2'), TL.stone); },
});
Object.assign(PROP_COLL, { grille_cachot: [3.0, 0.07, 3.4], grille_courte: [1.2, 0.07, 3.4], porte_grille: [0.6, 0.07, 3.4], bloc_pierre: [0.4, 0.35, 0.78] });
Object.assign(PROP_LIGHTS, { lanterne_cachot: { c: [1.3, 0.92, 0.55], r: 10, y: 0.25, flicker: true }, soupirail: { c: [0.6, 0.68, 0.82], r: 5.5, y: 0 } });

// ---------------------------------------------------------------- génération (après tout le reste de la vallée)
const PRISON_POS = { x: 60, z: 560, cx: 60, cz: 612, H: 3.4 };
function addPrison(w, seed) {
  const rnd = mulberry32((((seed | 0) * 613) + 29) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
  const H = PRISON_POS.H;
  const under = (fn) => { const n0 = w.blocks.length; fn(); for (let k = n0; k < w.blocks.length; k++) w.blocks[k].under = true; };
  // ------------------------------------------------ le cachot : trois cellules, un couloir, le coin du geôlier
  const f = B.underRoom(PRISON_POS.x, PRISON_POS.z, 18, 14, H, 26, M_STONE, M_COBBLE);
  under(() => {
    B.block(f, -3, 0, 4.8, 0.4, H, 4.4, M_STONE);
    B.block(f, 3, 0, 4.8, 0.4, H, 4.4, M_STONE);
    B.block(f, -6, 0, -3.4, 0.6, H, 0.6, M_STONE); // piliers
    B.block(f, 1.5, 0, -3.4, 0.6, H, 0.6, M_STONE);
  });
  B.propRel(f, 'grille_cachot', -6, 0, 2.6, 0);
  B.propRel(f, 'grille_courte', -1.8, 0, 2.6, 0);
  const porte = B.propRel(f, 'porte_grille', 0, 0, 2.6, 0, { open: false });
  B.propRel(f, 'grille_courte', 1.8, 0, 2.6, 0);
  B.propRel(f, 'grille_cachot', 6, 0, 2.6, 0);
  // la cellule du milieu
  B.propRel(f, 'paillasse', -1.5, 0, 5.8, Math.PI / 2);
  B.propRel(f, 'seau_cachot', 2.25, 0, 6.5, 0);
  B.propRel(f, 'chaine_mur', 0.9, 0, 6.95, Math.PI);
  const soup = B.propRel(f, 'soupirail', 1.0, H - 1.0, 6.97, Math.PI, { scie: false });
  B.propRel(f, 'pierre_mur', -2.55, 0.3, 6.96, Math.PI);
  // les deux autres, vides
  B.propRel(f, 'paillasse', -6.2, 0, 5.9, Math.PI / 2); B.propRel(f, 'seau_cachot', -8.4, 0, 6.5, 0); B.propRel(f, 'chaine_mur', -4.5, 0, 6.95, Math.PI);
  B.propRel(f, 'paillasse', 6.4, 0, 5.9, Math.PI / 2); B.propRel(f, 'chaine_mur', 4.8, 0, 6.95, Math.PI); B.propRel(f, 'chaine_mur', 7.9, 0, 6.95, Math.PI);
  // le coin du geôlier : table, chaise, tabouret de nuit devant la grille, coffre du greffe, échelle
  B.propRel(f, 'table', 5, 0, -4.6, 0);
  B.propRel(f, 'chaise', 5, 0, -5.4, Math.PI);
  B.propRel(f, 'chaise', 1.3, 0, 1.75, 0);
  B.propRel(f, 'coffre', 8.2, 0, -6.4, 0);
  B.propRel(f, 'echelle', -8.55, 0, -6.2, Math.PI / 2, { h: H });
  B.propRel(f, 'tonneau', 7.9, 0, -4.4, 0);
  B.propRel(f, 'lanterne_cachot', 5.35, 0.8, -4.55, 0);
  B.propRel(f, 'lanterne_cachot', -8.5, 0, 0.9, 0);
  B.propRel(f, 'lanterne_cachot', 8.5, 0, 0.9, 0);
  B.propRel(f, 'lanterne_cachot', -3.7, 0, 1.3, 0); B.propRel(f, 'lanterne_cachot', 3.7, 0, 1.3, 0);
  B.propRel(f, 'lanterne_cachot', -7.0, 0, -6.5, 0);
  // ce qu'on peut faire (touche E)
  B.interRel(f, 'k_porte', 'k_porte', 0, 1.2, 2.45, 'La grille');
  B.interRel(f, 'k_paillasse', 'k_paillasse', -1.5, 0.35, 5.8, 'Dormir sur la paille');
  B.interRel(f, 'k_soupirail', 'k_soupirail', 1.0, H - 1.0, 6.85, 'Le soupirail');
  B.interRel(f, 'k_pierre', 'k_pierre', -2.55, 0.35, 6.85, 'Une pierre descellée');
  B.interRel(f, 'k_traits', 'k_traits', 2.72, 1.3, 4.4, 'Des traits gravés');
  B.interRel(f, 'k_greffe', 'k_greffe', 8.2, 0.7, -6.4, 'Le coffre du greffe');
  B.interRel(f, 'k_echelle', 'k_echelle', -8.3, 1.2, -6.0, 'L’échelle');
  B.landmark('cachot', f.x, f.z, 8, { under: true, secret: true });
  const W = (lx, lz, ly) => { const [x, z] = B.toWorld(f, lx, lz); return [x, f.y + (ly || 0), z]; };
  // ------------------------------------------------ la carrière : des blocs à casser, sous l'œil du geôlier
  const g = B.underRoom(PRISON_POS.cx, PRISON_POS.cz, 16, 12, 5, 26, M_ROCK, M_ROCK);
  const blocs = [];
  for (let i = 0; i < 15; i++) {
    const lx = -5.5 + (i % 5) * 2.75 + (rnd() - 0.5) * 0.6, lz = -1.4 + Math.floor(i / 5) * 2.5 + (rnd() - 0.5) * 0.5;
    B.propRel(g, 'bloc_pierre', lx, 0, lz, rnd() * TAU);
    blocs.push(w.props.length - 1);
  }
  B.propRel(g, 'brouette', 6.1, 0, -4.2, 0.4);
  B.propRel(g, 'gravats', -6.4, 0, 4.4, 0); B.propRel(g, 'gravats', 6.3, 0, 4.5, 1.2); B.propRel(g, 'gravats', 0.5, 0, 4.9, 2.1);
  for (const [lx, lz] of [[-7.4, -5.4], [7.4, -5.4], [-7.4, 5.4], [7.4, 5.4]]) B.propRel(g, 'lanterne_cachot', lx, 0, lz, 0);
  B.landmark('carriere_cachot', g.x, g.z, 8, { under: true, secret: true });
  const Wg = (lx, lz) => { const [x, z] = B.toWorld(g, lx, lz); return [x, g.y, z]; };
  w.prison = {
    f, porteIdx: w.props.indexOf(porte), soupIdx: w.props.indexOf(soup),
    cellule: { x0: f.x - 2.72, x1: f.x + 2.72, z0: f.z + 2.78, z1: f.z + 6.9 },
    centre: W(0.2, 4.4), lit: W(-1.5, 5.8), tabouret: W(1.3, 1.9), table: W(5, -5.25), echelle: W(-8.2, -6.0),
    zone: { x0: f.x - 9, x1: f.x + 9, z0: f.z - 7, z1: f.z + 7 },
    cour: { f: g, entree: Wg(0, -4.3), garde: Wg(-5.6, -4.6), blocs, zone: { x0: g.x - 8, x1: g.x + 8, z0: g.z - 6, z1: g.z + 6 } },
  };
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed) { try { addPrison(w, w.seed || seed); } catch (e) { console.error('prison', e); } }
    return w;
  };
}

// ---------------------------------------------------------------- le geôlier
const GEOLIER = { nom: 'Brac, le geôlier', look: { skin: '#c89a78', hair: '#6a6560', hairStyle: 'court', beard: 'longue', hat: 'casquette', hatCol: '#2a2a30', top: '#4a4238', bottom: '#2e2a26', dress: false, apron: null, coat: true, build: 'rond', height: 1.02, held: null } };
const GEOLIER_DIT = {
  accueil: 'Honoré Brac, geôlier. Vous en avez pour {jours}. La rançon, c’est {rancon} pièces. Ou la carrière, au petit jour : une journée de cailloux vaut deux jours de paille. Sinon, la paille : on dort, et les jours passent. Frappez à la grille quand vous vous serez décidé{e}.',
  combien: ['Encore {jours}. Je compte pour vous, ne vous en faites pas.', 'Il vous reste {jours}. Ici, les jours sont longs, mais ils passent. Comme partout.', '{jours}, et puis la porte. Si vous êtes sage.'],
  pauvre: 'Vous n’avez pas le compte. Ici, on ne fait pas crédit : on fait des jours.',
  rancon: 'C’est bien de l’argent. Il sent la ferme. Allez, dehors. Et que je ne vous revoie pas.',
  carriere: 'La carrière ? Bon. Suivez-moi, et pas de bêtises : j’ai de bonnes jambes et une mauvaise humeur.',
  carriere_tard: 'La carrière, c’est au petit jour. Là, c’est trop tard. Demain.',
  carriere_fait: 'Vous avez déjà cassé vos cailloux pour aujourd’hui. Dormez.',
  consigne: 'Douze blocs. En cailloux, pour les chemins. Quand c’est fait, on rentre.',
  travail: ['Au travail.', 'On ne rêvasse pas, à la carrière.', 'Les blocs ne se cassent pas en les regardant.'],
  fin_travail: 'C’est bon pour aujourd’hui. Ça vous fera un jour de moins.',
  fin_tard: 'Il est tard. Votre journée ne comptera pas. Demain, frappez plus fort.',
  nuit: 'Dormez. C’est tout ce qu’il y a à faire, ici, la nuit.',
  dort: '(Le geôlier ronfle, la tête sur la poitrine.)',
  reveil: 'Hein ? … Qu’est-ce que vous fabriquez ? Dormez, ou je vous fais dormir.',
  halte: 'Halte ! Vous me prenez pour un imbécile ?',
  mains: 'Hé ! Bas les pattes, voleur ! Vous vous croyez où ?',
  rattrape: 'Deux jours de plus. Et la prochaine fois, je vous mets aux fers.',
  libere: 'C’est fini pour vous. Vos affaires sont là. Ce qui n’était pas à vous est retourné à qui de droit.',
  soupe: '(Le geôlier glisse une écuelle de soupe sous la grille.)',
  pain: '(Pain sec et cruche d’eau, glissés sous la grille.)',
};
const PRISON_PEINE = { vol: 1, braconnage: 1, profanation: 3, agression: 2, meurtre: 6, evasion: 2 };
const PRISON_TRAITS = ['Des traits gravés dans la pierre, par paquets de cinq. Des centaines. Quelqu’un a compté longtemps.', 'Sous les traits, gravé plus profond : « Ils ne reviennent pas tous de la carrière. »', 'Un nom, à moitié effacé. Une date. Et un dessin d’enfant : une maison, un soleil, un chien.'];

const prison = {
  g: null, busy: false, pv: {}, t: 0, attente: null, ronfleT: 0, criT: 0, hPrev: -1,
  S() {
    const s = farm.s;
    if (!s) return null;
    const P = s.prison || (s.prison = {});
    if (P.fois === undefined) Object.assign(P, { v: 1, actif: false, fois: 0, evasions: 0, casier: [], saisie: {} });
    if (!P.saisie) P.saisie = {};
    if (!P.casier) P.casier = [];
    return P;
  },
  enPrison() { const P = this.S(); return !!(P && P.actif); },
  // ------------------------------------------------------------------ lieux
  W() { return game.world && game.world.prison; },
  dans(Z, x, z, m) { return x > Z.x0 - (m || 0) && x < Z.x1 + (m || 0) && z > Z.z0 - (m || 0) && z < Z.z1 + (m || 0); },
  dansCellule(m) { const R = this.W(), p = game.player; return !!R && this.dans(R.cellule, p.pos[0], p.pos[2], m || 0); },
  placer(pos, yaw) {
    const p = game.player;
    p.pos = [pos[0], pos[1] + 0.05, pos[2]]; p.vel = [0, 0, 0];
    if (yaw !== undefined) p.yaw = yaw;
    p.pitch = -0.05;
    try { game.renderer.uploadCover(p.pos[0], p.pos[2]); } catch (e) { /* rendu pas prêt */ }
  },
  mettreEnCellule() { const R = this.W(); if (R) this.placer(R.centre, 0); },
  // devant (ou derrière, la nuit) la maison du garde
  dehors(derriere) {
    const w = game.world, B = w.bld.garde, p = game.player;
    let x, z, yaw = 0;
    if (B) {
      const bb = new Builder(w, Math.random, new Uint8Array(1));
      [x, z] = derriere ? bb.toWorld(B.f, 0.5, B.D / 2 + 1.8) : [B.out[0], B.out[1]];
      yaw = B.f.r + (derriere ? Math.PI : 0); // (on tourne le dos à la maison)
    } else { x = w.townInfo ? w.townInfo.x : p.pos[0]; z = w.townInfo ? w.townInfo.z : p.pos[2]; }
    const y = w.groundAt(x, z, w.heightAt(x, z) + 1.5, 2);
    this.placer([x, y, z], yaw);
  },
  porte() { const R = this.W(); return R ? game.world.props[R.porteIdx] : null; },
  appliquerPorte() {
    const q = this.porte(), P = this.S(), w = game.world;
    if (!q || !P) return;
    const open = !!(P.actif && P.porte);
    q.data = Object.assign({}, q.data || {}, { open });
    if (open && q.blk) removePropCollider(w, q);
    if (!open && !q.blk) { addPropCollider(w, q); w.grid = null; }
    const so = this.W() && w.props[this.W().soupIdx];
    if (so) so.data = Object.assign({}, so.data || {}, { scie: !!(P.actif && P.lime >= 3) });
    farm.dirtyProps = true;
  },
  // ------------------------------------------------------------------ la peine, la rançon
  peine(A, prime) {
    const P = this.S();
    let j = 0;
    for (const C of A) j += PRISON_PEINE[C.type] || 1;
    // (un jour de plus par tranche de 400 pièces de prime, et par séjour déjà fait, jusqu'à trois)
    j += Math.floor(prime / 400) + Math.min(3, P.fois || 0);
    return clamp(j, 1, 20);
  },
  // la rançon : la prime et un tiers, chaque jour de cachot racheté au prix de ce qu'on gagne en une demi-journée les
  // premiers jours, et la part de la commune sur ce qu'on a en poche (un dixième) : lourde, mais payable (un vol :
  // un peu plus d'une journée de travail des débuts ; un meurtre : une semaine, deux jours plus tard dans la partie)
  prixRancon(prime, jours, bourse) { return Math.max(50, Math.round((prime * 1.3 + jours * 120 + (bourse || 0) * 0.1) / 5) * 5); },
  // (les jours faits ne se rachètent plus : la rançon baisse avec la peine qui reste)
  majRancon() { const P = this.S(); if (P && P.actif && P.jours > 0) P.rancon = this.prixRancon(P.prime || 0, P.jours, P.bourse ?? farm.s.money); },
  jours(n) { return n > 1 ? `${n} jours` : 'un jour'; },
  txt(t) { const P = this.S(); return fmtLine(String(t).replace(/\{jours\}/g, this.jours(Math.max(1, P.jours || 1))).replace(/\{rancon\}/g, String(P.rancon || 0)).replace(/\{e\}/g, farm.s.fem ? 'e' : ''), null); },
  dire(t, dur) { const s = this.txt(t); ui.subtitle(s.startsWith('(') ? '' : GEOLIER.nom, s, dur || Math.min(7, 2 + s.length * 0.045)); if (!s.startsWith('(')) sound.mumble && sound.mumble(0.8, s.length, 0); },
  // ------------------------------------------------------------------ l'arrestation : au cachot
  async incarcerer(R, repli) {
    const s = farm.s, w = game.world, P = this.S();
    if (!w.prison || !P) return repli ? repli(R) : null;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    if (game.player.riding) game.dismount();
    game.sleeping = true;
    ui.close(true);
    try {
      await ui.fade(true, `On vous mène au cachot, sous la maison du garde de ${farm.names.ville}.`, 1200);
      const A = societe.actifs().filter((C) => societe.connuQuelquePart(C));
      const prime = A.reduce((a, C) => a + C.prime, 0) || (R ? R.prime : 0);
      let jours = this.peine(A, prime);
      let mot = null;
      if (typeof sentiments !== 'undefined' && sentiments.auCachot) { const r = sentiments.auCachot(jours); if (r) { jours = r.jours; mot = r.texte; } }
      for (const C of A) { C.leve = 'prison'; C.leveJour = s.day; }
      for (const m of npcs.list) { m.poursuite = 0; m.alerte = null; m.sommeT = 0; m.attaque = false; }
      societe.majAffiches(true);
      Object.assign(P, { actif: true, entree: s.day, jours, total: jours, prime, bourse: s.money, rancon: this.prixRancon(prime, jours, s.money), crimes: A.map((C) => C.id), travail: null, porte: false, lime: 0, limeVue: false, liberable: false, fois: (P.fois || 0) + 1, dernierTravail: 0, visite: 0, reveilNuit: 0 });
      const pris = this.confisquer();
      this.appliquerPorte();
      this.mettreEnCellule();
      this.g = null;
      $('#fade-text').textContent = pris.length ? `On vous fouille. On vous prend : ${pris.join(', ')}.` : 'On vous fouille. On ne vous prend rien.';
      await wait(2200);
      $('#fade-text').textContent = mot || `${this.jours(jours)} de cachot.`;
      await wait(1600);
      farm.save();
      await ui.fade(false, '', 1000);
    } catch (e) { console.error(e); } finally { game.sleeping = false; }
    this.dire(GEOLIER_DIT.accueil, 8);
    return null;
  },
  confisquer() {
    const s = farm.s, P = this.S(), out = [];
    if (typeof vol !== 'undefined' && vol.confisquer) { const v = vol.confisquer(); if (v.length) out.push(...v.map((x) => x + ' (volé)')); }
    for (const id of Object.keys(s.inv)) {
      if (!(typeof vol !== 'undefined' && vol.arme ? vol.arme(id) : false)) continue;
      const k = farm.count(id);
      if (!k || !farm.take(id, k)) continue;
      P.saisie[id] = (P.saisie[id] || 0) + k;
      out.push(itemName(id).toLowerCase() + (k > 1 ? ' ×' + k : ''));
    }
    for (const id of ['lime', 'trousseau', 'masse_forcat']) { const k = farm.count(id); if (k) farm.take(id, k); }
    return out;
  },
  // ------------------------------------------------------------------ sortir : peine purgée, rançon
  async liberer(raison) {
    const s = farm.s, P = this.S();
    if (!P || !P.actif || this.busy) return;
    this.busy = true;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    game.sleeping = true;
    ui.close(true);
    try {
      if (raison === 'rancon') { this.dire(GEOLIER_DIT.rancon, 4); await wait(1500); }
      await ui.fade(true, raison === 'rancon' ? 'La grille grince. Le geôlier compte vos pièces une deuxième fois, puis vous rend vos affaires.' : 'Un matin, la grille s’ouvre, et personne ne vous dit de rester.', 1100);
      const S = societe.S();
      for (const C of S.crimes) if ((P.crimes || []).includes(C.id) && C.leve === 'prison') { C.leve = raison === 'rancon' ? 'rancon' : 'cachot'; C.leveJour = s.day; }
      societe.majAffiches(true);
      const rendu = [];
      for (const id in P.saisie) { if (ITEMS[id] && P.saisie[id] > 0) { farm.give(id, P.saisie[id]); rendu.push(itemName(id).toLowerCase()); } }
      P.saisie = {};
      for (const id of ['masse_forcat', 'lime', 'trousseau']) { const k = farm.count(id); if (k) farm.take(id, k); }
      P.casier.push({ entree: P.entree, sortie: s.day, jours: P.total, raison });
      Object.assign(P, { actif: false, travail: null, liberable: false, porte: false, lime: 0 });
      this.appliquerPorte(); this.remettreBlocs();
      s.rep.infamy = (s.rep.infamy || 0) + 1;
      this.dehors(false);
      if (npcs.hour() < 6.5 || npcs.hour() > 20.5) { /* la nuit : on vous laisse sortir quand même */ }
      const sig = npcs.alive('garde') ? npcs.byId.garde.name + ' ' + npcs.byId.garde.d.surname + ', garde' : 'Le greffe de ' + farm.names.ville;
      farm.mail(sig, 'Levée d’écrou', raison === 'rancon'
        ? `${s.prenom || 'Le détenu'}, de la vieille ferme, a été ${s.fem ? 'libérée' : 'libéré'} ce jour contre une rançon de ${P.rancon} pièces, versée à la commune.\n\nLa prime est levée. L’affaire est close. Elle ne sera pas oubliée.`
        : `${s.prenom || 'Le détenu'}, de la vieille ferme, a été ${s.fem ? 'relâchée' : 'relâché'} ce matin après ${this.jours(P.total)} de cachot.\n\nLa prime est levée. Qu’on ne vous y reprenne pas.`);
      farm.save();
      $('#fade-text').textContent = rendu.length ? `On vous rend : ${rendu.join(', ')}.` : 'Dehors, l’air a un goût de neuf.';
      await wait(1500);
      await ui.fade(false, '', 1100);
    } catch (e) { console.error(e); } finally { game.sleeping = false; this.busy = false; }
    ui.subtitle('', raison === 'rancon' ? '(Libre. La bourse plus légère, et la réputation aussi.)' : '(Libre. Les gens de la ville vous regardent passer, et se taisent.)', 5);
  },
  payer() {
    const P = this.S();
    if (this.dortMaintenant()) { this.dire(GEOLIER_DIT.dort); return; }
    if (!farm.pay(P.rancon)) { this.dire(GEOLIER_DIT.pauvre); return; }
    sound.coin && sound.coin(); setTimeout(() => sound.coin && sound.coin(), 140);
    this.liberer('rancon');
  },
  // ------------------------------------------------------------------ la carrière (travaux forcés)
  async carriere() {
    const P = this.S(), h = npcs.hour(), s = farm.s, R = this.W();
    if (this.dortMaintenant()) { this.dire(GEOLIER_DIT.dort); return; }
    if (P.dernierTravail === s.day) { this.dire(GEOLIER_DIT.carriere_fait); return; }
    if (h < 5.5 || h >= 10) { this.dire(GEOLIER_DIT.carriere_tard); return; }
    this.busy = true;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    ui.close(true);
    this.dire(GEOLIER_DIT.carriere, 4);
    await wait(1400);
    game.sleeping = true;
    try {
      await ui.fade(true, 'Le geôlier vous mène à la carrière, une masse sur l’épaule.', 1000);
      this.remettreBlocs();
      P.travail = { jour: s.day, casses: [], quota: 12, dernierCoup: game.time };
      farm.give('masse_forcat', 1); s.hand = 'masse_forcat';
      this.placer(R.cour.entree, Math.PI);
      this.g = null;
      await wait(700);
      await ui.fade(false, '', 900);
    } catch (e) { console.error(e); } finally { game.sleeping = false; this.busy = false; }
    this.dire(GEOLIER_DIT.consigne, 5);
  },
  remettreBlocs() {
    const R = this.W(), w = game.world;
    if (!R) return;
    for (const i of R.cour.blocs) { const q = w.props[i]; if (!q) continue; q.gone = false; if (!q.blk) addPropCollider(w, q); }
    this.pv = {}; w.grid = null; farm.dirtyProps = true;
  },
  blocVise(eye, f) {
    const R = this.W(), w = game.world;
    let best = -1, bt = 2.7;
    for (const i of R.cour.blocs) {
      const q = w.props[i];
      if (!q || q.gone) continue;
      const cx = q.x - eye[0], cy = q.y + 0.45 - eye[1], cz = q.z - eye[2];
      const t = cx * f[0] + cy * f[1] + cz * f[2];
      if (t < 0 || t > bt) continue;
      const px = f[0] * t - cx, py = f[1] * t - cy, pz = f[2] * t - cz;
      if (px * px + py * py + pz * pz > 0.62 * 0.62) continue;
      best = i; bt = t;
    }
    return best;
  },
  frapper(i) {
    const P = this.S(), w = game.world, q = w.props[i], p = game.player;
    if (!P.travail || !q || q.gone) return;
    P.travail.dernierCoup = game.time;
    this.pv[i] = (this.pv[i] ?? 4) - 1;
    sound.shovelHit && sound.shovelHit(); sound.impact && sound.impact('hard');
    typeof puffAt === 'function' && puffAt(q.x, q.y + 0.6, q.z, [150, 146, 136], 8, 0.5, true);
    game.shakeT = Math.max(game.shakeT || 0, 0.08);
    p.stamina = Math.max(0, (p.stamina ?? 1) - 0.05); p.food = Math.max(0, p.food - 0.5);
    if (this.pv[i] > 0) return;
    q.gone = true; removePropCollider(w, q); farm.dirtyProps = true;
    P.travail.casses.push(i);
    const reste = P.travail.quota - P.travail.casses.length;
    if (reste <= 0) { this.finTravail(true); return; }
    if (reste % 3 === 0 || reste <= 2) ui.subtitle('', reste > 1 ? `(Encore ${reste} blocs.)` : '(Encore un bloc.)', 2);
  },
  async finTravail(ok) {
    const P = this.S(), s = farm.s, p = game.player;
    if (!P.travail || this.busy) return;
    this.busy = true;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    this.dire(ok ? GEOLIER_DIT.fin_travail : GEOLIER_DIT.fin_tard, 4);
    await wait(1600);
    game.sleeping = true;
    try {
      await ui.fade(true, 'Le geôlier vous ramène en cellule. Vos mains ne se ferment plus.', 1000);
      P.travail = null; P.dernierTravail = s.day;
      if (ok) { P.jours -= 1; this.majRancon(); }
      const k = farm.count('masse_forcat'); if (k) farm.take('masse_forcat', k);
      this.remettreBlocs();
      this.mettreEnCellule();
      p.food = Math.max(0, p.food - 12);
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-1, 'la carrière', 2);
      await wait(700);
      await ui.fade(false, '', 900);
    } catch (e) { console.error(e); } finally { game.sleeping = false; this.busy = false; }
    ui.subtitle('', ok ? `(La journée compte double. Il vous reste ${this.jours(Math.max(0, P.jours))}.)` : '(Une journée pour rien.)', 4);
    if (P.jours <= 0) setTimeout(() => this.liberer('peine'), 1500);
  },
  // ------------------------------------------------------------------ l'évasion
  dortCetteNuit() { const s = farm.s; return mulberry32(((s.seed | 0) * 7 + s.day * 131) >>> 0)() < 0.68; },
  dortMaintenant() {
    const h = npcs.hour(), P = this.S();
    if (!P.actif || P.travail) return false;
    if (P.reveilNuit === farm.s.day) return false;
    return (h >= 23 || h < 4.5) && this.dortCetteNuit();
  },
  nuit() { const h = npcs.hour(); return h >= 22 || h < 5.5; },
  async limer() {
    const P = this.S(), h = npcs.hour(), w = game.world;
    if (!(h >= 21.5 || h < 2)) { ui.subtitle('', h < 21.5 && h >= 5.5 ? '(En plein jour ? Le geôlier vous entendrait du bout du couloir.)' : '(Bientôt l’aube. Pas le temps.)', 3); return; }
    this.busy = true;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    game.sleeping = true;
    let pris = false;
    try {
      await ui.fade(true, 'Vous limez, lentement, en comptant les ronflements.', 900);
      game.skipHours(1); w.time = (w.time + 1 / 24) % 1; game.lastT = w.time;
      sound.scratch && sound.scratch();
      await wait(900);
      const dort = this.dortMaintenant();
      if (!dort && Math.random() < 0.45) pris = true;
      else if (dort && Math.random() < 0.12) { P.reveilNuit = farm.s.day; $('#fade-text').textContent = 'Le geôlier grogne, se retourne. Vous arrêtez tout.'; await wait(1100); }
      else { P.lime = (P.lime || 0) + 1; this.appliquerPorte(); $('#fade-text').textContent = P.lime >= 3 ? 'Le barreau cède.' : P.lime === 2 ? 'Le barreau ne tient plus que par un fil de fer.' : 'Une entaille, à peine. Il faudra d’autres nuits.'; await wait(1100); }
      await ui.fade(false, '', 700);
    } catch (e) { console.error(e); } finally { game.sleeping = false; this.busy = false; }
    if (pris) this.rattrape(GEOLIER_DIT.halte);
  },
  // le trousseau, à la ceinture du geôlier endormi sur son tabouret
  clefs() {
    if (this.attente || this.busy) return;
    sound.scratch && sound.scratch();
    this.attente = { t: 0.5, k: this.dortMaintenant() ? 0.55 : 0.07 };
  },
  resoudreClefs() {
    const A = this.attente, P = this.S();
    this.attente = null;
    if (Math.random() < A.k) { farm.give('trousseau', 1); ui.subtitle('', '(Vous décrochez le trousseau de sa ceinture, clé par clé, sans un bruit.)', 4); return; }
    P.reveilNuit = farm.s.day;
    this.rattrape(GEOLIER_DIT.mains);
  },
  async ouvrir() {
    const P = this.S();
    ui.close(true);
    P.porte = true; this.appliquerPorte();
    sound.lock && sound.lock(false); sound.door && sound.door(true);
    ui.subtitle('', '(La troisième clé tourne. La grille s’entrouvre, avec un grincement à réveiller les morts.)', 4);
    if (this.dortMaintenant() && Math.random() < 0.2) P.reveilNuit = farm.s.day;
  },
  async evader(voie) {
    const s = farm.s, P = this.S();
    if (!P.actif || this.busy) return;
    this.busy = true;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    game.sleeping = true;
    ui.close(true);
    try {
      await ui.fade(true, voie === 'soupirail' ? 'Vous vous glissez par le soupirail. La pierre vous arrache la peau des épaules. Et puis l’air de la nuit.' : 'Vous montez l’échelle, barreau par barreau, sans respirer. La trappe cède. La nuit.', 1400);
      const S = societe.S();
      for (const C of S.crimes) if ((P.crimes || []).includes(C.id) && C.leve === 'prison') { C.leve = null; delete C.leveJour; }
      for (const id of ['masse_forcat', 'lime', 'trousseau']) { const k = farm.count(id); if (k) farm.take(id, k); }
      Object.assign(P, { actif: false, travail: null, porte: false, liberable: false, lime: 0, evasions: (P.evasions || 0) + 1 });
      this.appliquerPorte(); this.remettreBlocs();
      const B = game.world.bld.garde;
      societe.crime({ type: 'evasion', victime: null, x: B ? B.x : game.player.pos[0], z: B ? B.z : game.player.pos[2], temoins: [], preuve: 'valbrume' });
      this.dehors(true);
      farm.save();
      await wait(1200);
      await ui.fade(false, '', 1000);
    } catch (e) { console.error(e); } finally { game.sleeping = false; this.busy = false; }
    ui.subtitle('', '(Libre. Pour l’instant. Demain, votre visage sera sur toutes les portes.)', 5);
  },
  async rattrape(txt) {
    const P = this.S();
    if (this.busy) return;
    this.busy = true;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    game.sleeping = true;
    ui.close(true);
    try {
      this.dire(txt, 3);
      sound.chain && sound.chain();
      await wait(1200);
      await ui.fade(true, 'Le geôlier vous ramène en cellule, sans douceur.', 900);
      P.jours += 2; P.total += 2; P.prime = (P.prime || 0) + 100; this.majRancon();
      for (const id of ['lime', 'trousseau']) { const k = farm.count(id); if (k) farm.take(id, k); }
      P.porte = false; P.lime = 0; P.limeVue = true; P.reveilNuit = farm.s.day;
      this.appliquerPorte();
      this.mettreEnCellule();
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2, 'évasion manquée');
      await wait(900);
      await ui.fade(false, '', 900);
    } catch (e) { console.error(e); } finally { game.sleeping = false; this.busy = false; }
    this.dire(GEOLIER_DIT.rattrape, 4);
  },
  // ------------------------------------------------------------------ la grille (touche E)
  menuPorte() {
    const P = this.S(), s = farm.s;
    if (!P.actif) { ui.subtitle('', '(Une grille de fer, scellée dans la pierre.)', 2.5); return; }
    const dort = this.dortMaintenant();
    const opts = [];
    if (farm.count('trousseau') && !P.porte) opts.push({ label: 'Ouvrir la grille avec le trousseau', fn: () => this.ouvrir() });
    opts.push({ label: `Payer la rançon (${P.rancon} pièces)`, fn: () => { ui.close(true); this.payer(); } });
    opts.push({ label: 'Demander à travailler à la carrière', fn: () => { ui.close(true); this.carriere(); } });
    opts.push({ label: 'Appeler le geôlier', fn: () => { ui.close(true); if (dort) { if (Math.random() < 0.5) { P.reveilNuit = s.day; this.dire(GEOLIER_DIT.reveil); } else this.dire(GEOLIER_DIT.dort); } else this.dire(this.nuit() ? GEOLIER_DIT.nuit : pick(GEOLIER_DIT.combien)); } });
    opts.push({ label: 'Rien', fn: () => ui.close() });
    ui.choice('La grille', `${this.jours(Math.max(1, P.jours))} de cachot encore. Rançon : ${P.rancon} pièces ; vous en avez ${s.money}.${dort ? ' Le geôlier dort sur son tabouret.' : ''}`, opts);
  },
  // ------------------------------------------------------------------ le geôlier : où il est, ce qu'il fait
  placeGeolier() {
    const R = this.W(), P = this.S(), p = game.player;
    if (!R) return null;
    const g = this.g || (this.g = { rig: humanRig(Object.assign({}, GEOLIER.look)), x: 0, y: 0, z: 0, heading: 0, sit: true, lookY: 0 });
    if (P && P.actif && P.travail) {
      const c = R.cour.garde; g.x = c[0]; g.y = c[1]; g.z = c[2]; g.sit = false;
      g.heading = Math.atan2(p.pos[0] - g.x, p.pos[2] - g.z);
    } else if (this.nuit()) { const c = R.tabouret; g.x = c[0]; g.y = c[1]; g.z = c[2]; g.sit = true; g.heading = Math.PI; }
    else { const c = R.table; g.x = c[0]; g.y = c[1]; g.z = c[2]; g.sit = true; g.heading = 0; }
    return g;
  },
  // ------------------------------------------------------------------ chaque image
  update(dt, playing) {
    const P = this.S(), R = this.W(), p = game.player;
    if (!P || !R) return;
    if (this.attente) { this.attente.t -= dt; if (this.attente.t <= 0) this.resoudreClefs(); }
    if (!P.actif) return;
    const h = npcs.hour();
    if (!this.busy && !game.sleeping && playing) {
      // libérable (peine purgée au matin)
      if (P.liberable) { this.liberer('peine'); return; }
      // la carrière
      if (P.travail) {
        if (!this.dans(R.cour.zone, p.pos[0], p.pos[2], 0.5)) this.placer(R.cour.entree);
        if (h >= 17) { this.finTravail(false); return; }
        if (game.time - (P.travail.dernierCoup || 0) > 40) { P.travail.dernierCoup = game.time; this.dire(pick(GEOLIER_DIT.travail), 2.5); }
      } else if (!P.porte) {
        // la grille est fermée : on est dans la cellule (et pas ailleurs)
        if (!this.dansCellule(0.7)) this.mettreEnCellule();
      } else if (!this.dansCellule(0.2)) {
        // on est sorti de la cellule : le geôlier voit-il, entend-il ?
        const g = this.placeGeolier(), d = Math.hypot(g.x - p.pos[0], g.z - p.pos[2]);
        if (!this.dortMaintenant()) { this.rattrape(GEOLIER_DIT.halte); return; }
        this.bruitT = (this.bruitT || 0) - dt;
        if (this.bruitT <= 0) {
          this.bruitT = 0.5;
          const v = Math.hypot(p.vel[0], p.vel[2]);
          if (d < 6 && v > 2.4 && Math.random() < 0.3) { P.reveilNuit = farm.s.day; this.rattrape(GEOLIER_DIT.halte); return; }
        }
      }
      // pain du matin (au jour qui se lève), soupe de midi (une par jour : au retour de la carrière aussi)
      if (h >= 12 && h < 20 && P.soupe !== farm.s.day && !P.travail) { P.soupe = farm.s.day; this.dire(GEOLIER_DIT.soupe, 3); p.food = Math.min(100, p.food + 15); }
      // la visite de l'être cher, le lendemain de l'arrestation, vers dix heures
      if (this.hPrev >= 0 && this.hPrev < 10 && h >= 10 && farm.s.day - (P.visite || 0) >= 2 && farm.s.day > P.entree && typeof sentiments !== 'undefined' && sentiments.visiteCachot) {
        P.visite = farm.s.day;
        const V = sentiments.visiteCachot();
        if (V) { ui.subtitle(V.qui, V.texte, 6); for (const [id, k] of V.objets || []) if (ITEMS[id]) farm.give(id, k); }
      }
    }
    this.hPrev = h;
    // ronflements
    if (this.dortMaintenant() && !P.travail) {
      this.ronfleT -= dt;
      const g = this.placeGeolier();
      if (this.ronfleT <= 0 && g && Math.hypot(g.x - p.pos[0], g.z - p.pos[2]) < 16) { this.ronfleT = 2.6 + Math.random(); sound.breath && sound.breath(1.4); }
    }
  },
  // chaque nouveau jour (6 h) : un jour de moins, pain sec, un peu de soi qui s'en va
  jour() {
    const P = this.S(), p = game.player;
    if (!P || !P.actif) return;
    P.jours -= 1;
    this.majRancon();
    // (le geôlier nourrit ses prisonniers : maigre, mais on ne meurt pas de faim au cachot, même en y dormant ses jours)
    p.food = Math.min(100, Math.max(p.food + 25, 60));
    setTimeout(() => { if (P.actif) this.dire(GEOLIER_DIT.pain, 3); }, 3500);
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2, 'le cachot', 4);
    if (P.jours <= 0) P.liberable = true;
  },
  draw(buf, sbuf, cam, t) {
    const R = this.W(), p = game.player;
    if (!R || !farm.s) return;
    if (Math.abs(p.pos[0] - R.f.x) > 60 || Math.abs(p.pos[2] - R.f.z - 26) > 70) return;
    const g = this.placeGeolier(), P = this.S();
    if (!g) return;
    const dort = this.dortMaintenant();
    const talk = !dort && (ui.subtitleWho ? ui.subtitleWho === GEOLIER.nom : false);
    poseHuman(g.rig, { move: 0, t, sit: g.sit, lookY: dort ? 0 : Math.sin(t * 0.3) * 0.4, lookP: dort ? 0.55 : 0, talk });
    drawRig(buf, g.rig, g.x, g.y, g.z, g.heading, GEOLIER.look.height || 1, this.cibleClefs ? FX_HI : 0);
    if (sbuf) drawShadow(sbuf, g.x, g.y, g.z, 0.36);
    if (P && P.actif && P.travail) { /* debout dans la carrière */ }
  },
};

// ---------------------------------------------------------------- interactions (touche E)
HOOKS.inter.k_porte = () => prison.menuPorte();
HOOKS.inter.k_paillasse = () => {
  const P = prison.S();
  if (!P.actif) { ui.subtitle('', '(De la paille qui pique, et qui sent la peur des autres.)', 3); return; }
  game.sleep('cachot');
};
HOOKS.inter.k_soupirail = () => {
  const P = prison.S();
  if (!P.actif) { ui.subtitle('', '(Un soupirail, trop haut, trop étroit.)', 2.5); return; }
  if (P.lime >= 3) { ui.choice('Le soupirail', 'Le barreau du milieu est scié. L’ouverture est tout juste assez large.', [{ label: 'Se glisser dehors', fn: () => { ui.close(true); prison.evader('soupirail'); } }, { label: 'Pas encore', fn: () => ui.close() }]); return; }
  if (!farm.count('lime')) { ui.subtitle('', '(Un soupirail, trop haut, trop étroit. Trois barreaux scellés dans la pierre, et un filet de jour, ou de nuit.)', 4); return; }
  ui.choice('Le soupirail', `Trois barreaux. ${P.lime ? `Celui du milieu est entamé (${P.lime} nuit${P.lime > 1 ? 's' : ''} de lime).` : 'Avec la lime, et quelques nuits…'}`, [{ label: 'Limer le barreau du milieu (une heure)', fn: () => { ui.close(true); prison.limer(); } }, { label: 'Pas maintenant', fn: () => ui.close() }]);
};
HOOKS.inter.k_pierre = () => {
  const P = prison.S();
  if (!P.actif) { ui.subtitle('', '(Une pierre descellée.)', 2); return; }
  if (!prison.nuit() && !prison.dortMaintenant()) { ui.subtitle('', '(Une pierre bouge un peu, derrière la paillasse. Pas sous le nez du geôlier.)', 3.5); return; }
  if (P.limeVue) { ui.subtitle('', '(Le trou, derrière la pierre, est vide.)', 2.5); return; }
  P.limeVue = true;
  farm.give('lime', 1);
  sound.scratch && sound.scratch();
  ui.subtitle('', '(Derrière la pierre, dans un trou, une lime plate enveloppée dans un chiffon. Quelqu’un l’a laissée là pour le suivant.)', 5);
};
HOOKS.inter.k_traits = () => { const P = prison.S(); ui.read('Des traits gravés', PRISON_TRAITS.slice(0, 1 + Math.min(2, (P && P.fois) || 0)).join('\n\n')); };
HOOKS.inter.k_greffe = () => {
  const P = prison.S();
  const ids = Object.keys(P.saisie || {}).filter((id) => ITEMS[id] && P.saisie[id] > 0);
  if (!ids.length) { ui.subtitle('', '(Le coffre du greffe. Des registres, des menottes rouillées. Rien à vous.)', 3); return; }
  for (const id of ids) farm.give(id, P.saisie[id]);
  P.saisie = {};
  sound.lootOpen && sound.lootOpen();
  ui.subtitle('', `(Vous reprenez vos affaires : ${ids.map((id) => itemName(id).toLowerCase()).join(', ')}.)`, 4);
};
HOOKS.inter.k_echelle = () => {
  const P = prison.S();
  if (P.actif && !prison.dansCellule(0.2)) { prison.evader('echelle'); return; }
  ui.subtitle('', '(L’échelle monte vers une trappe, dans la cour de la maison du garde.)', 3);
};
// le trousseau du geôlier endormi, à travers les barreaux (accroupi, dans son dos)
HOOKS.target.push((eye, f, cand) => {
  prison.cibleClefs = false;
  const P = prison.S(), R = prison.W(), p = game.player;
  if (!P || !P.actif || !R || P.travail || P.porte || !prison.nuit() || farm.count('trousseau') || !(p.crouch > 0.5)) return;
  const T = R.tabouret, dx = T[0] - p.pos[0], dz = T[2] - p.pos[2], d = Math.hypot(dx, dz);
  if (d > 1.8) return;
  if ((dx * f[0] + dz * f[2]) / (d * (Math.hypot(f[0], f[2]) || 1)) < 0.5) return;
  prison.cibleClefs = true;
  cand({ kind: 'hook', geolier: true, use: () => prison.clefs() }, 0.02);
});
// la masse, à la carrière
HOOKS.primary.push((eye, basis, held, it, id) => {
  const P = prison.S();
  if (!P || !P.actif || !P.travail) return false;
  if (id !== 'masse_forcat') return false;
  if (play.cool > 0 || prison.busy) return true;
  const i = prison.blocVise(eye, basis.f);
  play.swingT = 0.42; play.swingHit = true; play.cool = 0.55;
  sound.swish && sound.swish(1.2);
  if (i >= 0) setTimeout(() => prison.frapper(i), 200);
  return true;
});
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s) prison.update(dt, playing); });
HOOKS.day.push(() => { if (farm.s) prison.jour(); });
HOOKS.draw.push((buf, sbuf, cam, t) => { if (farm.s && game.world && game.world.prison) prison.draw(buf, sbuf, cam, t); });
// l'arrestation de la société mène désormais à la cellule
{
  const _cachot0 = societe.cachot.bind(societe);
  societe.cachot = function (R) { return prison.incarcerer(R, _cachot0); };
}
HOOKS.load.push(() => {
  const P = prison.S(), w = game.world;
  prison.g = null; prison.busy = false; prison.attente = null; prison.hPrev = -1; prison.pv = {};
  if (typeof VM !== 'undefined' && !VM.masse && VM.marteau) VM.masse = VM.marteau;
  if (P.actif && !w.prison) {
    // (une vallée sans cachot : on relâche)
    const S = societe.S();
    for (const C of S.crimes) if ((P.crimes || []).includes(C.id) && C.leve === 'prison') C.leve = 'cachot';
    for (const id in P.saisie) if (ITEMS[id]) farm.give(id, P.saisie[id]);
    Object.assign(P, { actif: false, saisie: {}, travail: null, porte: false });
  }
  if (w.prison) {
    prison.remettreBlocs();
    if (P.actif && P.travail) { P.travail = null; const k = farm.count('masse_forcat'); if (k) farm.take('masse_forcat', k); prison.mettreEnCellule(); }
    prison.appliquerPorte();
    if (P.actif && !P.porte && !prison.dansCellule(0.7)) prison.mettreEnCellule();
  }
  if (prison.hooked) return;
  prison.hooked = true;
  // s'évanouir d'épuisement au cachot : on se réveille sur la paille (ou rattrapé, hors de la cellule)
  const _faint = game.faint.bind(game);
  game.faint = async function () {
    const P2 = prison.S();
    if (P2 && P2.actif) {
      if (!P2.travail && P2.porte && !prison.dansCellule(0.2)) return prison.rattrape(GEOLIER_DIT.halte);
      if (P2.travail) { P2.travail = null; const k = farm.count('masse_forcat'); if (k) farm.take('masse_forcat', k); prison.remettreBlocs(); }
      prison.mettreEnCellule();
      return game.sleep('cachot');
    }
    return _faint();
  };
});
