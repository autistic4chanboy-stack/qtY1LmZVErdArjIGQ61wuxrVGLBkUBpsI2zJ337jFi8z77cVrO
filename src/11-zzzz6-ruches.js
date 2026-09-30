// ============================================================================
//  LES RUCHES
//  - Avoir sa ruche : l'éleveuse la vend au ranch, peuplée de son essaim ; ou on
//    la fabrique à l'établi (la recette s'apprend). Posée hors des villes, elle
//    donne chaque matin un pot de miel, deux certains jours si des fleurs
//    poussent autour (fleurs sauvages, pots, parterres, tournesols, lavande…),
//    et un pain de cire tous les trois jours. Pleine (quatre pots), elle ne
//    donne plus rien tant qu'on ne l'a pas récoltée ; sous la pluie, ses
//    abeilles restent dedans.
//  - Récolter (E) : sans enfumoir, les abeilles piquent souvent (quelques points
//    de vie, une pensée) ; avec un enfumoir (le ranch, ou l'établi), un peu de
//    fumée blanche, et pas une piqûre.
//  - La cire fait des bougies, trois pour un pain (elles rechargent la
//    lanterne) ; le miel, l'hydromel au tonneau, les gâteaux, les tisanes.
//  - Les ruches du hameau sont à quelqu'un : on les regarde, on n'y touche pas.
//  État : les données de chaque ruche posée (q.data : miel, cire, jc = jour de
//  la dernière cire).
//  API : ruches (miens(), fleursAutour(q), piquer(), recolter(q)).
// ============================================================================

const RUCHE_PLEINE = 4, RUCHE_CIRE = 2, RUCHE_FLEURS = 6;

// (7 : trois bougies à 3 pièces valent le pain de cire × 1,3, la règle des transformations du commerce)
defItem('cire_abeille', 'Pain de cire d’abeille', 'produit', 7, ['lingot', '#e8c050'], { desc: 'De la cire jaune, qui sent le miel et la fleur. Un pain fait trois bougies.' });
defItem('enfumoir', 'Enfumoir', 'outil', 8, ['seau', '#8a8680'], { desc: 'Un soufflet et un pot de fer où couve un chiffon de jute. Un peu de fumée, et les abeilles se calment : on récolte sans une piqûre.' });
RECIPES.push({ out: 'bougie', n: 3, need: { cire_abeille: 1, fibre: 1 }, st: null });
RECIPES.push({ out: 'enfumoir', n: 1, need: { lingot_fer: 1, cuir: 1, bois: 2 }, st: 'etabli' });
{
  const E = NPC_DATA.concat(typeof NPC_NEW !== 'undefined' ? NPC_NEW : []).find((d) => d.id === 'eleveuse');
  if (E && E.shop && E.shop.sells) for (const l of [['ruche', 150], ['enfumoir', 40]]) if (!E.shop.sells.some(([k]) => k === l[0])) E.shop.sells.push(l);
  if (E && E.shop && E.shop.buys) for (const id of ['miel', 'cire_abeille']) if (!E.shop.buys.includes(id)) E.shop.buys.push(id);
}
if (ITEMS.ruche) ITEMS.ruche.desc = 'Une ruche de paille et de planches, avec son essaim. Posée près des fleurs, elle donne du miel chaque matin, et de la cire. Récoltez-la avec un enfumoir.';

const ruches = {
  // les ruches à soi : posées par le joueur (après les objets de la vallée)
  miens() { const w = game.world; return w.props.filter((q, i) => q.id === 'ruche' && !q.gone && i >= farm.genProps); },
  estAMoi(q) { return game.world.props.indexOf(q) >= farm.genProps; },
  // les fleurs autour d'une ruche (douze mètres) : sauvages, en pot, parterres, cultures fleuries
  fleursAutour(q) {
    const w = game.world, s = farm.s;
    let n = 0;
    w.query(q.x, q.z, 12, (o) => { const t = OBJ_TYPES[o.t]; if (t && t.cat === 'Fleurs' && w.live(o) && Math.hypot(o.x - q.x, o.z - q.z) < 12) n++; });
    for (const p of w.props) if (!p.gone && (p.id === 'pot_fleurs' || p.id === 'parterre' || p.id === 'arche_fleurie') && Math.hypot(p.x - q.x, p.z - q.z) < 12) n += 2;
    const FLEURIES = new Set(['tournesol', 'lavande', 'fraise', 'rose', 'tulipe', 'dahlia', 'souci', 'camomille', 'bourrache', 'trefle', 'pavot', 'bouquet']);
    for (const k in s.crops) {
      const c = s.crops[k]; if (!c || !c.c || !FLEURIES.has(c.c)) continue;
      const [x, z] = k.split(',').map(Number);
      if (Math.abs(x - q.x) < 12 && Math.abs(z - q.z) < 12) n++;
    }
    return n;
  },
  // chaque matin (après la ligne d'autrefois qui remplissait toutes les ruches tous les trois jours)
  matin() {
    const s = farm.s;
    for (const q of this.miens()) {
      // (le compte est dans « pots » : la vieille règle du matin, qui remplissait toutes les ruches tous les trois
      // jours, réécrit « miel » juste avant ; on le remet d'après notre compte)
      const d = q.data || {};
      let pots = d.pots !== undefined ? d.pots : (d.miel || 0), cire = d.cire || 0;
      if (pots < RUCHE_PLEINE) pots = Math.min(RUCHE_PLEINE, pots + 1 + (this.fleursAutour(q) >= RUCHE_FLEURS && s.day % 2 === 0 ? 1 : 0));
      const jc = d.jc || 0;
      if (cire < RUCHE_CIRE && s.day - jc >= 3) { cire++; farm.setPropData(q, { jc: s.day }); }
      farm.setPropData(q, { pots, miel: pots, cire });
    }
  },
  piquer() {
    const p = game.player, n = 1 + ((Math.random() * 3) | 0);
    play.hurt(2 + n * 1.5, null, 'Piqué à mort par des abeilles');
    sound.hurt && sound.hurt(3);
    ui.subtitle('', n > 2 ? '(Elles vous tombent dessus. Une piqûre, deux, trois… Un enfumoir, la prochaine fois.)' : '(Aïe ! Une piqûre, au poignet. Elles n’aiment pas qu’on se serve sans fumée.)', 3.5);
    if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-0.3, 'piqûres');
    p.vel[0] += (Math.random() - 0.5) * 2; p.vel[2] += (Math.random() - 0.5) * 2;
  },
  recolter(q) {
    const d = q.data || {}, miel = d.pots !== undefined ? d.pots : (d.miel || 0), cire = d.cire || 0;
    if (!miel && !cire) { ui.subtitle('', '(Les abeilles vont et viennent. Rien à prendre encore : revenez demain matin.)', 3); sound.click && sound.click(); return; }
    const fumee = farm.count('enfumoir') > 0;
    if (fumee) {
      for (let k = 0; k < 10; k++) particles.spawn(q.x + (Math.random() - 0.5) * 0.6, q.y + 0.9, q.z + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4, 0.5 + Math.random() * 0.5, (Math.random() - 0.5) * 0.4, [0.85, 0.85, 0.82, 0.6], 0.16, 2.2, -0.05, false);
    } else if (Math.random() < 0.45) this.piquer();
    farm.setPropData(q, { pots: 0, miel: 0, cire: 0 });
    if (miel) { farm.give('miel', miel); play.flyer('miel', [q.x, q.y + 0.8, q.z], miel); }
    if (cire) { farm.give('cire_abeille', cire); play.flyer('cire_abeille', [q.x, q.y + 0.8, q.z], cire); }
    sound.pop && sound.pop();
    if (fumee && !this.ditFumee) { this.ditFumee = true; ui.subtitle('', '(Un peu de fumée : les abeilles se calment, et vous laissent faire.)', 3); }
  },
};

HOOKS.day.push(() => { if (farm.s && game.world) ruches.matin(); });
// E sur une ruche : la sienne se récolte ; celles du hameau sont à quelqu'un
{
  const avant = HOOKS.propPre.ruche;
  HOOKS.propPre.ruche = (q) => {
    if (avant && avant(q)) return true;
    if (!ruches.estAMoi(q)) { ui.subtitle('', '(Les ruches du hameau. Elles sont à quelqu’un : on ne se sert pas.)', 3); return true; }
    ruches.recolter(q);
    return true;
  };
}
