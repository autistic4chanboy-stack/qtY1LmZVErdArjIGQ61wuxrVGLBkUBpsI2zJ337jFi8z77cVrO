// ============================================================================
//  LA FERME (suite) : épouvantails à portée limitée (anneau visible), graines
//  qui changent chaque jour à la graineterie, enseignes, panneau d'affichage,
//  monument et panneaux qu'on lit, décor animé des villages, baies toxiques,
//  lettre d'arrivée pour la nouvelle ferme.
// ============================================================================
PLACEABLES.epouvantail.scare = 6; PLACEABLES.epouvantail_fer.scare = 10;
ITEMS.epouvantail.desc = 'Éloigne les corbeaux… mais seulement à six mètres à la ronde. Au-delà, ils se servent.';
ITEMS.epouvantail_fer.desc = 'Éloigne les corbeaux dans un rayon de dix mètres.';
for (const id of ['corde_linge', 'mat_drapeau', 'balancoire']) DYN_PROPS.add(id);

const farm2 = {
  scareList: [], scareT: 0,
  // épouvantails posés (liste rafraîchie de temps en temps)
  scarecrows() {
    const now = performance.now();
    if (now > this.scareT) { this.scareT = now + 1500; this.scareList = game.world.props.filter((q) => game.world.live(q) && PLACEABLES[q.id] && PLACEABLES[q.id].scare); }
    return this.scareList;
  },
  scaredAt(x, z) { for (const q of this.scarecrows()) if (Math.hypot(q.x - x, q.z - z) < PLACEABLES[q.id].scare) return q; return null; },
  // anneau de portée : pendant qu'on tient un épouvantail, ou qu'on en vise un
  drawRings(buf) {
    const s = farm.s, it = ITEMS[s.hand], w = game.world, p = game.player;
    const holding = it && it.place && PLACEABLES[it.place] && PLACEABLES[it.place].scare;
    const rings = [];
    if (holding) {
      const g = play.ghost;
      if (g) rings.push([g.x, g.z, PLACEABLES[it.place].scare, true]);
      for (const q of this.scarecrows()) if (Math.hypot(q.x - p.pos[0], q.z - p.pos[2]) < 45) rings.push([q.x, q.z, PLACEABLES[q.id].scare, false]);
    } else if (game.hiProp && PLACEABLES[game.hiProp.id] && PLACEABLES[game.hiProp.id].scare) rings.push([game.hiProp.x, game.hiProp.z, PLACEABLES[game.hiProp.id].scare, false]);
    if (!rings.length) return;
    PE.buf = buf; PE.fl = FX_EMIT;
    for (const [cx, cz, R, ghost] of rings) {
      const n = Math.round(R * 4), col = ghost ? [1.35, 1.1, 0.4] : [1.1, 0.85, 0.35];
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU, x = cx + Math.cos(a) * R, z = cz + Math.sin(a) * R, y = w.heightAt(x, z);
        PE.frame(x, y + 0.08, z, -a, 1);
        PE.box(0, 0, 0, 0.12, 0.07, 0.55, col, TL.straw);
        if (k % 4 === 0) { PE.frame(x, y, z, 0, 1); PE.bx(0, 0, 0, 0.06, 0.6, 0.06, col, TL.straw); }
      }
    }
    PE.fl = 0;
  },
  // ---------------------------------------------------------------- graineterie : graines du jour
  seedShop() {
    const d = NPC_DATA.find((q) => q.id === 'grainetiere'), S = d && d.shop;
    if (!S || !farm.s) return;
    if (!S.base) S.base = S.sells.filter(([id]) => !id.startsWith('graines_'));
    const rnd = mulberry32(farm.s.seed * 53 + farm.s.day * 7), pool = SEED_ROTATE.slice(), picks = [];
    while (picks.length < 6 && pool.length) picks.push(pool.splice((rnd() * pool.length) | 0, 1)[0]);
    S.today = picks;
    S.sells = SEED_BASE.concat(picks).filter((id) => ITEMS['graines_' + id]).map((id) => ['graines_' + id, SEED_PRICE[id]]).sort((a, b) => a[1] - b[1]).concat(S.base);
  },
  todayText() {
    const d = NPC_DATA.find((q) => q.id === 'grainetiere'), S = d && d.shop;
    if (!S || !S.today) return '';
    return S.today.map((id) => `· ${ITEMS['graines_' + id].name} — ${SEED_PRICE[id]} pièces`).join('\n');
  },
  npcName(id) { const n = npcs.byId && npcs.byId[id]; return n ? n.name + ' ' + n.d.surname : ''; },
  // où est la harde de chevaux sauvages, vu d'un point
  herdHint(x, z) {
    const h = farm.s.herd, w = game.world;
    if (!h) return '';
    const a = Math.atan2(h.x - x, h.z - z), d = Math.hypot(h.x - x, h.z - z);
    let near = null, nd = 1e9;
    for (const k in w.lm) { const L = w.lm[k]; const dd = Math.hypot(L.x - h.x, L.z - h.z); if (dd < nd && L.name && !/^(la|le|l’|l')\s?(place|marché|mairie|poste)/.test(L.name)) { nd = dd; near = L; } }
    return `vers ${w.cardinal(a)}, à ${String(Math.round(d / 100) / 10).replace('.', ',')} km environ${near && nd < 400 ? ', pas loin de ' + near.name : ''}`;
  },
};

// ---------------------------------------------------------------- corbeaux et oiseaux : l'épouvantail ne protège qu'à portée
{
  const _ub = entities.updateBird.bind(entities);
  entities.updateBird = function (e, dt, w, c) {
    if (e.cfg.crow && e.land && !e.land.done && farm.on && farm2.scaredAt(e.land.x, e.land.z) && Math.hypot(e.x - e.land.x, e.z - e.land.z) < 14) {
      e.land = null; e.scaredT = 4; sound.crow && sound.crow(0.5);
    }
    return _ub(e, dt, w, c);
  };
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    if (e.cfg.oiseau && !(e.flyT > 0) && farm.on && (e.scareCk = (e.scareCk || 0) - dt) <= 0) {
      e.scareCk = 0.6;
      const q = farm2.scaredAt(e.x, e.z);
      if (q) { e.flyT = 3 + Math.random() * 2; e.flyH0 = 0.2; e.heading = Math.atan2(e.x - q.x, e.z - q.z); sound.flutter && sound.flutter(0.5, 0); }
    }
    return _uw(e, dt, w, c);
  };
}
HOOKS.draw.push((buf) => farm2.drawRings(buf));

// ---------------------------------------------------------------- ce qu'on lit en ville
const SIGN_TXT = {
  boulangerie: ['Boulangerie', 'Pain au levain, brioches, farine.\nOuvert dès l’aube.'],
  forge: ['Forge', 'Outils, ferrures, réparations.\nChantiers d’atelier et de puits pour les fermes.'],
  graineterie: ['Graineterie', 'Graines, plants, engrais.\nDe nouvelles graines arrivent chaque matin : voyez l’ardoise devant la porte.'],
  poste: ['La Poste', 'Lettres, colis. Cartes de la vallée.'],
  auberge: ['Auberge', 'Soupe du jour, cidre, bière de la vallée. Chambres à la nuit.'],
  mairie: ['Mairie', 'Les ponts-levis sont relevés à 21 h et abaissés à 6 h.\nNul ne sort, nul n’entre entre ces heures.'],
  garde: ['Maison du garde', 'Pour tout signalement, frappez.\nNe frappez pas après la tombée de la nuit.'],
};
const HOME_OF = { boulangerie: 'boulangere', forge: 'forgeron', graineterie: 'grainetiere', poste: 'postiere', auberge: 'aubergiste', mairie: 'maire', garde: 'garde' };
HOOKS.inter.lire = (it) => {
  const d = it.data || {};
  if (d.sign) {
    const [t, txt] = SIGN_TXT[d.sign] || ['Enseigne', ''], who = farm2.npcName(HOME_OF[d.sign]);
    let extra = '';
    if (d.sign === 'graineterie') extra = '\n\nArrivages du jour :\n' + farm2.todayText();
    ui.read(t, txt + extra, who ? (d.sign === 'mairie' ? 'Le maire : ' + who + '.' : d.sign === 'garde' ? who + ', garde des ponts.' : 'Tenu par ' + who + '.') : '');
    return;
  }
  if (d.monument) {
    const fam = ['Vasseur', 'Aubert', 'Marchal', 'Grenier', 'Bonnefoy', 'Lagrange', 'Pichon', 'Grosjean', 'Chabert', 'Morel', 'Bastien', 'Varenne', 'Roux', 'Garnier', 'Perrin', 'Lefèvre'];
    const first = ['Jean', 'Louis', 'Pierre', 'Joseph', 'Étienne', 'Émile', 'Henri', 'Auguste', 'Marcel', 'Victor', 'Eugène', 'Lucien', 'Jules', 'Alphonse'];
    const rnd = mulberry32(farm.s.seed * 3 + 41), L = [];
    for (let k = 0; k < 40 && L.length < 14; k++) { const n = `${fam[(rnd() * fam.length) | 0].toUpperCase()} ${first[(rnd() * first.length) | 0]}`; if (!L.includes(n)) L.push(n); }
    L.sort();
    const H = farm.history().filter((h) => h.name).slice(-6).map((h) => h.name);
    ui.read('À nos morts', L.join('\n') + (H.length ? '\n\nEt, gravés plus fin, d’une main plus récente :\n' + H.join('\n') + '\n« fermiers de la vieille ferme »' : ''), 'La vallée se souvient.');
    return;
  }
  if (d.ranch) {
    const who = farm2.npcName('eleveuse'), hint = farm2.herdHint(it.x, it.z);
    ui.read('Ranch', `Chevaux, vaches, moutons, cochons, volailles.\nChantiers de poulailler et de grange : bâtis en un jour.\nFriandises et selles pour les chevaux.${hint ? '\n\nUne harde de chevaux sauvages broute ' + hint + '. Approchez-les accroupi, sans courir, une pomme à la main.' : ''}`, who ? who + ', éleveuse' : '');
  }
};
HOOKS.inter.arrivages = () => ui.read('Arrivages du jour', 'Graines du jour :\n' + farm2.todayText() + '\n\nToujours en rayon : ' + SEED_BASE.map((id) => CROPS[id].name.toLowerCase()).join(', ') + '.', 'Écrit à la craie, d’une écriture ronde.');
// Panneau d'affichage : quelques affiches, qui changent avec les jours
HOOKS.inter.affiche = (it) => {
  const s = farm.s, rnd = mulberry32(s.seed * 7 + s.day * 13), out = [];
  const pickR = (a) => a[(rnd() * a.length) | 0];
  out.push('AVIS DE LA MAIRIE — Les ponts-levis sont relevés à 21 h et abaissés à 6 h. Nul ne sort, nul n’entre entre ces heures.');
  const dow = s.day % 7;
  out.push(dow === 0 ? 'MESSE — Aujourd’hui, dix heures, à l’église. ' : 'MESSE — Dimanche prochain, dix heures, à l’église. ' + (farm2.npcName('cure') ? '— ' + farm2.npcName('cure') : ''));
  const today = farm2.todayText();
  if (today) out.push('GRAINETERIE — Arrivés ce matin :\n' + today);
  out.push(pickR(['RANCH — Poulaillers et granges : chantiers livrés et bâtis en un jour. S’adresser à l’éleveuse, au hameau.', 'FORGE — Pour vos fermes : chantiers d’atelier (établi, four) et de puits. Voir le forgeron.', 'CONSEIL AUX CULTIVATEURS — Un épouvantail ne garde qu’une dizaine de pas autour de lui. Les corbeaux le savent très bien.']));
  const hint = farm2.herdHint(it.x, it.z);
  if (hint && rnd() < 0.8) out.push('CHEVAUX — Une harde sauvage a été vue ' + hint + '. Qui saura les approcher ? On dit qu’ils ne résistent pas aux pommes.');
  out.push(pickR(['PERDU — Un chat tigré qui répond au nom de Mistigri. Récompense.', 'PERDU — Une montre en argent, près du lavoir. La rapporter à la mairie.', 'À VENDRE — Une charrette, bon état, une roue à revoir.', 'CHERCHE — Bras solides pour les foins. Voir au hameau.', 'TROUVÉ — Une clé, au bord du lac. Elle ne rentre dans aucune serrure du village.', 'PERDU — Un mouchoir brodé « M. V. ». Il a de la valeur pour moi.']));
  const gone = npcs.list ? npcs.list.filter((n) => !n.st.alive || n.vanished) : [];
  if (gone.length) out.push('AVIS DE RECHERCHE — ' + gone.map((n) => n.name + ' ' + n.d.surname).join(', ') + '. Toute personne ayant des nouvelles est priée de se présenter au garde.');
  if (strange.maxLevel() >= 3 && rnd() < 0.5) out.push('ON RECHERCHE — ' + (s.prenom || 'le fermier') + ', de la vieille ferme. Vu pour la dernière fois chez lui.\n(L’affiche est jaunie. Elle date d’avant votre arrivée.)');
  ui.read('Panneau d’affichage', out.join('\n\n'), 'Des punaises rouillées, et du papier qui gondole.');
};

// ---------------------------------------------------------------- baies toxiques
HOOKS.load.push(() => {
  if (farm2.hooked) { farm2.seedShop(); return; }
  farm2.hooked = true;
  const _eat = play.eat.bind(play);
  play.eat = function (id) {
    const it = ITEMS[id];
    _eat(id);
    if (it && it.poison) { play.nausea = Math.max(play.nausea || 0, 25); play.poisonT = Math.max(play.poisonT || 0, 20); ui.subtitle('', '(Un goût amer. La tête se met à tourner.)', 3); }
  };
  farm2.seedShop();
});
HOOKS.day.push(() => farm2.seedShop());
// Nouvelle ferme : un mot du notaire sur l'état des lieux
HOOKS.load.push((saved) => {
  const s = farm.s, w = game.world;
  if (saved || !w.farm.mini || s.flags.lettreEtat) return;
  s.flags.lettreEtat = 1;
  farm.mail('Maître Delorme, notaire', 'L’état des lieux', 'Madame, Monsieur,\n\nJe vous dois la vérité sur la ferme Varenne : la grange a brûlé l’hiver dernier, le poulailler s’est effondré sous la neige et l’atelier a été vendu pour payer les dettes. Il vous reste la maison, et le champ.\n\nL’éleveuse du hameau vend des chantiers de poulailler et de grange ; le forgeron, d’atelier et de puits. Avec du bois, de la pierre et un établi, vous pourriez aussi les bâtir vous-même.\n\nLa graineterie reçoit de nouvelles graines chaque matin. Semez peu, mais semez bien.\n\nVotre dévoué,\nDelorme');
});
