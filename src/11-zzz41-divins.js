// ============================================================================
//  LES TROIS : Aëla l'Aube, Durn la Pierre (le Dormeur), Vesh la Nuit noire.
//  Dans de très, très rares cas, ils viennent sur le monde (cinématiques) :
//  Aëla, figure de lumière debout sur une colline avant le soleil ; Durn, un
//  pan de montagne qui se lève ; Vesh, une ombre qui éteint les étoiles.
//  Ils prennent aussi contact : rêves pendant le sommeil, voix ; Aëla se montre
//  à qui a veillé une nuit entière sans lumière et sans peur (une fois dans une
//  vie) ; Vesh appelle pendant les nuits noires (divins.voix : répondre mène à
//  un pacte — un don qui se paie — ou à une malédiction).
//  Ils parlent aëlin : on montre la phrase, puis ce que le personnage en
//  comprend (langues.traduire si le module des langues est là).
//  Bénédictions (BUFF) : « aube » (Aëla), « pierre » (Durn). État : farm.s.divins.
// ============================================================================
const DIV_NOMS = { aela: 'Aëla', durn: 'Durn', vesh: 'Vesh' };
// [phrase en aëlin, sens]
const DIV_PAROLES = {
  aela_aube: ['ael teh , o hemim', 'La lumière est ici, ô hommes.'],
  aela_veille: ['o ta ne ves ulen , ael vor ves', 'Ô toi qui as fait taire la nuit : la lumière vient avant la nuit.'],
  aela_don: ['aela ven , ta ven', 'Aëla est la vie. Et toi, tu vis.'],
  aela_lever: ['oth nai , ta ven', 'Pas la mort. Toi, la vie.'],
  aela_appel: ['aela teh , thalen neth mora', 'Aëla est là-bas : le temple, sous la montagne.'],
  durn_eveil: ['hem , mi sae , ta nai', 'Homme. Moi, je dors. Toi, tu n’es rien.'],
  durn_colere: ['mora fala , hemim ulen', 'La montagne tombe. Les hommes se taisent.'],
  durn_leve: ['durn sae nai', 'Durn ne dort pas.'],
  durn_don: ['thal ven , ta rim', 'La pierre vit. Elle te garde.'],
  vesh_appel: ['kala , kala , ta ne ves', 'J’appelle, j’appelle, toi qui es de la nuit.'],
  vesh_offre: ['mi ves , aur ma sel ma ves , ta rhua', 'Moi, la nuit. L’or, le secret, la nuit. Toi, tu rendras.'],
  vesh_nom: ['ta kala mi', 'Tu m’as appelé.'],
  vesh_etoiles: ['estel ulen , ves vesa', 'Les étoiles se taisent. La nuit noire.'],
  vesh_prix: ['rhua', 'Rends.'],
};
const DIV_LOOK = {
  aela: { skin: '#fff6dc', hair: '#fff0c8', hairStyle: 'long', top: '#fffaf0', bottom: '#fff6e4', dress: true, shoe: '#fff4dc', face: TL.blankF, height: 1.05, build: 'mince' },
  durn: { skin: '#77736c', hair: '#5e5a54', hairStyle: 'court', beard: 'longue', top: '#6c6862', bottom: '#625e58', shoe: '#55514c', build: 'rond', face: TL.faceOld },
  vesh: { skin: '#020203', hair: '#020203', hairStyle: 'long', top: '#020203', bottom: '#020203', dress: true, shoe: '#020203', coat: true, face: TL.blankF, height: 1.1, build: 'mince' },
};
BUFF_NAMES.aube = 'La lumière d’Aëla';
BUFF_NAMES.pierre = 'La patience de Durn';

const divins = {
  fig: null, fogMin: 0, etoiles: -1,
  S() {
    const s = farm.s;
    const S = s.divins || (s.divins = {});
    for (const k of ['aela', 'durn', 'vesh']) if (!S[k] || typeof S[k] !== 'object') S[k] = {};
    if (!Array.isArray(S.vesh.prix)) S.vesh.prix = [];
    if (!S.veille || typeof S.veille !== 'object') S.veille = {};
    return S;
  },
  // ------------------------------------------------------------ les chances (très, très rares ; tools/equilibrage/hasard.js)
  // Chacun des Trois prend contact environ une fois en six à douze semaines (surtout en rêve : six rêves en tout), et ne
  // vient sur le monde qu'une fois dans une vie.
  // un rêve, par nuit de sommeil : 3 % × bizarrerie (+2 % si l'on a vu le temple, +2 % après un pacte avec Vesh)
  chanceReve() {
    const S = this.S(), tvu = typeof temple !== 'undefined' && temple.S && temple.S().vu;
    return 0.03 * EV_BIZ() + (tvu ? 0.02 : 0) + ((S.vesh.pactes || 0) ? 0.02 : 0);
  },
  // Aëla au lever du jour, à qui veille dehors (dès le dixième jour) ; Vesh, une nuit noire, à qui veille dehors vers
  // 23 h (dès le huitième) ; Durn, quand la terre tremble : pour un joueur ordinaire, chacun dans une partie sur trois
  // ou quatre au bout de six mois de jeu
  chanceAela(d) { return d >= 10 && !this.S().aela.vu ? 0.012 * EV_BIZ() : 0; },
  chanceVesh(d) { return d >= 8 && !this.S().vesh.vu ? 0.06 * EV_BIZ() : 0; },
  chanceDurn() { return this.S().durn.vu ? 0 : 0.03 * EV_BIZ(); },
  // ------------------------------------------------------------ parler aëlin : la phrase, puis ce qu'on en comprend
  comprendre(txt, sens) {
    let t = null;
    try { if (typeof langues !== 'undefined' && langues.traduire) t = langues.traduire('aelin', txt); } catch (e) { t = null; }
    if (typeof t === 'string' && t.trim() && t.trim() !== txt.trim()) return [`(Vous traduisez : « ${t.trim()} »)`, `(Et le reste vous arrive sans les mots : « ${sens} »)`];
    const mots = langWords(txt), lex = LANGUES.aelin.lex;
    const connus = mots.filter((m) => savoir.motConnu('aelin', m) && lex[m]);
    if (connus.length && connus.length < mots.length) return [`(Vous reconnaissez des mots : ${connus.map((m) => lex[m]).join(', ')}.)`, `(Le reste, vous le comprenez sans l’entendre : « ${sens} »)`];
    if (connus.length) return [`(Vous comprenez chaque mot : « ${sens} »)`];
    return [`(Vous ne connaissez pas cette langue. Pourtant le sens vous arrive, comme un souvenir : « ${sens} »)`];
  },
  parler(qui, cle, delai) {
    const P = DIV_PAROLES[cle];
    if (!P) return;
    const [txt, sens] = P;
    setTimeout(() => {
      if (game.dying) return;
      ui.subtitle(DIV_NOMS[qui] || '???', txt, 5);
      const L = this.comprendre(txt, sens);
      L.forEach((l, i) => setTimeout(() => ui.subtitle('', l, 5.5), 1800 + i * 2600));
      // entendre un dieu, c'est retenir un ou deux de ses mots
      const mots = langWords(txt).filter((m) => LANGUES.aelin.lex[m] && !savoir.motConnu('aelin', m));
      if (mots.length) savoir.apprendreMots('aelin', mots.sort(() => Math.random() - 0.5).slice(0, 2));
    }, delai || 0);
  },

  // ------------------------------------------------------------ chaque image
  update(dt, eye, basis, sky, playing) {
    const s = farm.s;
    if (!s || game.mode === 'menu' || game.dying || !game.world) return;
    const S = this.S(), p = game.player, hh = evHH(), d = s.day;
    // les bénédictions
    if (BUFF.on('aube')) { if (p.hp < 100 && !game.sleeping) p.hp = Math.min(100, p.hp + dt * 0.3); strange.fear = (strange.fear || 0) * 0.5; }
    if (this.fig) this.fig.t += dt;
    if (game.sleeping || cine.on) return;
    // --- la veille d'Aëla : toute une nuit debout, sans lumière et sans peur
    if (hh >= 21 && hh < 29.4 && game.mode === 'play') {
      let V = S.veille;
      if (V.d !== d) V = S.veille = { d, ok: hh < 21.6, h0: hh };
      if (V.ok) {
        const lum = game.lantern || game.nearFire(p.pos) || (typeof evenements !== 'undefined' && evenements.actifs.aurore);
        if (lum) V.ok = false, V.pourquoi = 'lumiere';
        else if ((strange.fear || 0) > 0.5) V.ok = false, V.pourquoi = 'peur';
      }
    }
    if (hh >= 29.1 && hh < 29.9 && S.veille.d === d && S.veille.ok && !S.aela.vu && !p.underground && game.mode === 'play') { S.veille.ok = false; this.apparaitre('aela', { veille: true }); }
    // --- Aëla, rarissime, au lever du jour (une fois dans une vie)
    if (hh >= 29.2 && hh < 29.8 && S.aela.tirage !== d) {
      S.aela.tirage = d;
      if (Math.random() < this.chanceAela(d) && evenements.dehors()) this.apparaitre('aela', {});
      // quand l'ombre est tout près, une voix chaude, à l'aube, dit où chercher
      else if (malediction.a('ombre') && malediction.S().ombre && malediction.S().ombre.d < 45 && Math.random() < 0.6) { sound.ok && sound.voice(sound.at(), 'sine', 440, 660, 2.5, 0.015, sound.lp(1200, sound.amb)); this.parler('aela', 'aela_appel', 600); }
    }
    // --- Vesh : pendant une nuit noire, rarissime, il vient éteindre les étoiles
    if (typeof evenements !== 'undefined' && evenements.noirK > 0.9 && hh >= 23 && hh < 25.5 && S.vesh.tirage !== d) {
      S.vesh.tirage = d;
      if (Math.random() < this.chanceVesh(d) && evenements.dehors()) this.apparaitre('vesh', {});
    }
  },
  sky(sky) {
    if (this.fogMin > 0) { sky.fog = [Math.max(sky.fog[0], this.fogMin * 0.35), Math.max(sky.fog[1], this.fogMin)]; }
    if (this.etoiles >= 0) { sky.stars = this.etoiles; sky.moonVis *= this.etoiles; }
    const F = this.fig;
    if (F && F.qui === 'aela' && F.lum > 0) { const k = F.lum; sky.amb = v3.add(sky.amb, v3.scale([0.2, 0.17, 0.1], k)); sky.hor = v3.lerp(sky.hor, [1.1, 0.85, 0.5], 0.35 * k); sky.haze = v3.lerp(sky.haze, [0.9, 0.75, 0.5], 0.2 * k); }
  },
  lights(eye) {
    const F = this.fig;
    if (!F || F.qui !== 'aela') return [];
    return [{ x: F.x, y: F.y + 4, z: F.z, r: 40 + 30 * (F.lum || 0), c: [1.6, 1.35, 0.85], d: Math.hypot(F.x - eye[0], F.z - eye[2]) }];
  },
  draw(buf, sbuf, cam, t) {
    const F = this.fig;
    if (!F) return;
    const r = F.rig || (F.rig = humanRig(DIV_LOOK[F.qui]));
    if (F.qui === 'aela') {
      poseHuman(r, { move: 0, t, lookY: 0, reach: F.bras || 0, tilt: Math.sin(t * 0.8) * 0.05 });
      drawRig(buf, r, F.x, F.y + Math.sin(t * 1.3) * 0.1, F.z, F.heading, F.s || 2.2, FX_EMIT);
      PE.buf = buf; PE.fl = FX_EMIT; PE.frame(F.x, F.y, F.z, F.heading, F.s || 2.2);
      PE.box(0, 1.72, -0.12, 0.72, 0.72, 0.02, [1.9, 1.6, 0.9], TL.gold, 0, 0, t * 0.2);
      PE.fl = 0;
      if (Math.random() < 0.5) particles.spawn(F.x + (Math.random() - 0.5) * 3, F.y + Math.random() * 4, F.z + (Math.random() - 0.5) * 3, 0, 0.6 + Math.random(), 0, [1.4, 1.2, 0.7, 0.9], 0.08, 2.5, -0.1, true);
    } else if (F.qui === 'durn') {
      poseHuman(r, { move: F.marche || 0, phase: t * 0.6, t, lookY: 0, lean: F.lean || 0, reach: F.bras || 0 });
      drawRig(buf, r, F.x, F.y, F.z, F.heading, F.s || 24, 0);
    } else if (F.qui === 'vesh') {
      poseHuman(r, { move: 0, t, pale: true, lookY: 0, reach: F.bras || 0, tilt: Math.sin(t * 0.3) * 0.08 });
      drawRig(buf, r, F.x, F.y, F.z, F.heading, F.s || 30, 0);
    }
  },

  // ------------------------------------------------------------ les apparitions
  apparaitre(qui, opts) {
    if (typeof cinematiques === 'undefined' || cine.on || game.dying) return false;
    opts = opts || {};
    const S = this.S(), s = farm.s;
    if (qui === 'aela') { S.aela.vu = s.day; S.aela.veille = opts.veille ? s.day : S.aela.veille || 0; cinematiques.aela(opts); }
    else if (qui === 'durn') { S.durn.vu = s.day; cinematiques.durn(opts); }
    else if (qui === 'vesh') { S.vesh.vu = s.day; cinematiques.vesh(opts); }
    else return false;
    if (typeof evenements !== 'undefined') evenements.retenir('divin_' + qui);
    return true;
  },
  // ce qu'Aëla donne quand elle se montre
  donAela(veille) {
    const p = game.player;
    BUFF.add('aube', veille ? 72 : 36);
    malediction.lever('toutes', true);
    p.hp = 100; p.stamina = 1; p.food = Math.max(p.food, 70);
    if (corps.jambeCassee()) corps.soignerJambe(true);
    corps.panser();
    savoir.apprendreMots('aelin', ['aela', 'ael', 'ven', 'vor', 'ves', 'oth', 'ta', 'teh']);
    if (typeof faith !== 'undefined') faith.add('anciens', 6);
    setTimeout(() => ui.subtitle('', '(Vous êtes à genoux dans l’herbe mouillée. Tout ce qui pesait sur vous est parti. Le soleil se lève, et il est chaud.)', 6), 800);
  },

  // ------------------------------------------------------------ la voix des nuits noires (Vesh)
  voix() {
    const S = this.S(), s = farm.s;
    ui.choice('Dans le noir', `(La voix murmure votre nom, tout contre vous. « ${s.prenom || (s.fem ? 'Jeanne' : 'Jean')}… » Elle attend.)`, [
      { label: 'Répondre', fn: () => { ui.close(true); S.vesh.repondu = (S.vesh.repondu || 0) + 1; evenements.S().nuit.repondu = s.day; evenements.voix = null; sound.whisper && sound.whisper(0, 1); this.parler('vesh', 'vesh_offre', 300); setTimeout(() => this.pacte('voix'), 5200); } },
      { label: 'Dire son nom : « Vesh »', fn: () => { ui.close(true); evenements.S().nuit.repondu = s.day; evenements.voix = null; this.parler('vesh', 'vesh_nom', 200); S.vesh.nom = s.day; setTimeout(() => { malediction.frapper('ombre', 'voix'); if (!S.vesh.vu && evenements.dehors()) this.apparaitre('vesh', { nom: true }); }, 3800); } },
      { label: 'Se taire, et reculer', fn: () => { ui.close(); evenements.S().nuit.tu = s.day; evenements.voix = null; setTimeout(() => ui.subtitle('', '(Vous ne dites rien. Le murmure s’éloigne, déçu. Il reviendra une autre nuit.)', 4), 400); } },
    ]);
  },
  // un pacte avec Vesh : un don, qui se paiera
  pacte(source) {
    const S = this.S(), s = farm.s;
    if (S.vesh.pacteJour === s.day) { ui.subtitle('Vesh', '… pas deux fois la même nuit …', 3); return; }
    const opts = [
      { label: 'La richesse', fn: () => this.conclure('or', source) },
      { label: 'La nuit : qu’elle ne me voie plus', fn: () => this.conclure('nuit', source) },
      { label: 'Le savoir des Aëlim', fn: () => this.conclure('savoir', source) },
    ];
    if (malediction.a()) opts.push({ label: 'Qu’on m’ôte ce qui pèse sur moi', fn: () => this.conclure('lever', source) });
    opts.push({ label: 'Refuser', fn: () => { ui.close(); if (source === 'voix') { setTimeout(() => { ui.subtitle('Vesh', 'ta kala … ta rhua', 4); malediction.frapper('sommeil', 'voix'); }, 800); } else ui.subtitle('', '(Vous retirez votre main. La pierre noire est froide, maintenant, comme vexée.)', 3.5); } });
    ui.choice('Vesh', '(Une voix sans souffle, tout contre votre oreille. Elle vous offre quelque chose. Ce qui est donné sera repris, d’une manière ou d’une autre.)', opts);
  },
  conclure(quoi, source) {
    const S = this.S(), s = farm.s;
    ui.close(true);
    S.vesh.pacteJour = s.day; S.vesh.pactes = (S.vesh.pactes || 0) + 1;
    BUFF.add('pacte', 30);
    if (typeof faith !== 'undefined') { faith.add('dessous', 3); faith.add('eglise', -3); }
    sound.whisper && sound.whisper(0, 1); strange.glitchT = Math.max(strange.glitchT || 0, 0.8);
    if (quoi === 'or') { const n = 250 + Math.floor(Math.random() * 300); farm.earn(n); sound.coin && sound.coin(); ui.subtitle('', `(Vos poches sont lourdes : ${n} pièces. Elles sont froides comme la nuit.)`, 4.5); }
    else if (quoi === 'nuit') { BUFF.add('pacte_nuit', 72); BUFF.add('nyctalopie', 72); ui.subtitle('Vesh', '… la nuit ne te voit plus. Toi, tu la vois …', 4.5); }
    else if (quoi === 'savoir') {
      const lex = Object.keys(LANGUES.aelin.lex).filter((m) => !savoir.motConnu('aelin', m)).sort(() => Math.random() - 0.5).slice(0, 16);
      savoir.apprendreMots('aelin', lex);
      ui.subtitle('Vesh', '… sous les Monts, là où naît la rivière, derrière ce qui tombe … l’aube, le sommeil, la nuit …', 6);
      setTimeout(() => ui.subtitle('', `(Des mots d’une langue que vous n’avez jamais apprise vous reviennent. ${lex.length} mots.)`, 4.5), 6500);
    } else if (quoi === 'lever') { const ids = malediction.liste(); malediction.lever(ids.includes('ombre') ? 'ombre' : ids[0]); }
    // le prix : dans deux à quatre jours
    S.vesh.prix.push({ jour: s.day + 2 + ((Math.random() * 3) | 0), type: pick(['bete', 'argent', 'malediction', 'souvenir']), quoi });
    void source;
  },
  // le prix d'un pacte, un matin
  payer() {
    const S = this.S(), s = farm.s;
    const dus = S.vesh.prix.filter((P) => P.jour <= s.day);
    if (!dus.length) return;
    S.vesh.prix = S.vesh.prix.filter((P) => P.jour > s.day);
    for (const P of dus) {
      let txt = 'Nous sommes venus prendre ce qui était dû.';
      if (P.type === 'bete') { const a = s.animals.find((q) => !q.dead && !q.lost); if (a) { a.lost = 1; game.syncAnimals(); txt = `${a.name} n’est plus dans l’étable. Nous l’avons prise. C’était le prix.`; } else P.type = 'argent'; }
      if (P.type === 'argent') { const n = Math.floor(s.money * 0.4); s.money -= n; txt = n ? `Il manque ${n} pièces dans votre bourse. Ne les cherchez pas.` : txt; }
      if (P.type === 'malediction') { malediction.frapper('sommeil', 'vesh'); txt = 'Cette nuit, vous ne dormirez pas. Ni les suivantes. C’était le prix.'; }
      if (P.type === 'souvenir') {
        const L = savoir.S().lieux, ks = Object.keys(L).filter((k) => k !== 'ferme').sort(() => Math.random() - 0.5).slice(0, 3);
        for (const k of ks) delete L[k];
        txt = 'Nous avons pris des chemins dans votre tête. Vous ne vous souviendrez plus où ils menaient.';
      }
      farm.mail('?', 'Sans signature', txt, { strange: true });
      setTimeout(() => { ui.subtitle('Vesh', DIV_PAROLES.vesh_prix[0], 3); }, 5000);
    }
  },

  // ------------------------------------------------------------ Durn, le Dormeur (au temple)
  reveil() {
    const S = this.S();
    S.durn.eveil = (S.durn.eveil || 0) + 1;
    if (typeof cinematiques !== 'undefined') cinematiques.durnEveil(S.durn.eveil);
  },
  // Aëla, à son autel du temple
  autelAela(it) {
    const S = this.S(), s = farm.s, hand = s.hand;
    const offrandes = { fleur_temple: 4, poussiere_etoile: 5, bougie: 1, fleur: 1, miel: 2, fleur_lune: 3, cendre_sacree: 3, lys_cimes: 3 };
    const opts = [{ label: S.aela.prie === s.day ? 'Prier encore' : 'Prier', fn: () => this.prierAela(it, null) }];
    if (offrandes[hand] && farm.count(hand)) opts.push({ label: 'Déposer en offrande : ' + itemName(hand), fn: () => this.prierAela(it, hand, offrandes[hand]) });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice('L’autel d’Aëla', 'Une pierre blanche, tiède, où la mousse pousse en forme de soleil. Des Hautes Lettres usées : « lira na-aela ». Le chant d’Aëla.', opts);
  },
  async prierAela(it, item, val) {
    const S = this.S(), s = farm.s, p = game.player;
    if (item && !farm.take(item, 1)) return;
    ui.close(true);
    const premier = S.aela.prie !== s.day;
    S.aela.prie = s.day;
    game.sleeping = true;
    await ui.fade(true, item ? 'Vous posez l’offrande sur la pierre blanche. Il fait plus chaud, d’un coup, comme au soleil.' : 'Vous vous agenouillez. La pierre est tiède. Quelque chose écoute.', 900);
    await new Promise((r) => setTimeout(r, 2200));
    await ui.fade(false, '', 900);
    game.sleeping = false;
    if (!premier && !item) { ui.subtitle('', '(Rien. La pierre a déjà donné, aujourd’hui.)', 3); return; }
    p.hp = Math.min(100, p.hp + 35);
    BUFF.add('aube', item ? 6 + (val || 1) * 3 : 3);
    // elle ôte les petites malédictions, et les lourdes contre une offrande qui compte
    const ids = malediction.liste();
    if (ids.length) {
      const lourdes = ids.filter((k) => !MALEDICTIONS[k].petite);
      if (item && (val || 0) >= 4) malediction.lever('toutes');
      else if (item && (val || 0) >= 2 && lourdes.some((k) => k !== 'ombre')) { malediction.lever(lourdes.find((k) => k !== 'ombre')); malediction.leverPetites(true); }
      else if (!malediction.leverPetites()) ui.subtitle('', lourdes.includes('ombre') ? '(La chaleur recule devant ce qui vous suit. Il faudrait plus : une fleur de ce temple, ou une poussière d’étoile.)' : '(Ce qui pèse sur vous est trop lourd pour une simple prière.)', 5);
    }
    this.parler('aela', ids.length ? 'aela_lever' : 'aela_don', 1200);
    if (typeof faith !== 'undefined') faith.add('anciens', 1);
  },
  // Vesh, à son autel noir : un pacte
  autelVesh(it) {
    const s = farm.s, h = npcs.hour();
    if (h > 6 && h < 20 && !(typeof evenements !== 'undefined' && evenements.noirK > 0.3)) { ui.subtitle('', '(La pierre noire ne répond pas. Pas en plein jour. Même ici, sous la montagne, elle sait quelle heure il est.)', 4.5); return; }
    sound.whisper && sound.whisper(0, 0.9);
    this.parler('vesh', 'vesh_appel', 200);
    setTimeout(() => { if (!game.dying) this.pacte('autel'); }, 4200);
    void s; void it;
  },
};

// ---------------------------------------------------------------- les rêves (pendant le sommeil, parfois)
const DIV_REVES = [
  { qui: 'aela', t: 'Vous rêvez d’une colline, avant l’aube. Une femme s’y tient, faite de lumière, et elle vous regarde comme on regarde un enfant qui dort. Elle dit un mot : « aela ». Au réveil, vous le savez encore.', mots: ['aela'] },
  { qui: 'aela', t: 'Dans votre rêve, vous veillez toute une nuit, sans lanterne, sans peur. Au bout de la nuit, quelqu’un vous attend sur une colline. Vous vous réveillez avant de voir son visage.', mots: ['ael'] },
  { qui: 'durn', t: 'Vous rêvez que vous dormez sous une montagne, depuis mille ans. Trois pierres gardent votre porte : l’une brille comme l’aube, l’autre dort, la dernière n’a pas de reflet. Quelqu’un les touche dans le désordre, et vous vous retournez dans votre lit de roche.', mots: ['durn', 'sae'] },
  { qui: 'durn', t: 'Vous rêvez d’une rivière qui sort d’une montagne, et derrière l’eau qui tombe, d’un escalier. En bas, quelqu’un respire, très lentement. Une respiration par jour.', mots: ['mora', 'ser'] },
  { qui: 'vesh', t: 'Dans votre rêve, il n’y a pas d’étoiles. Une voix compte, à rebours, les lettres de votre nom. Quand elle arrive à la première, vous vous réveillez en sursaut.', mots: ['ves'] },
  { qui: 'vesh', t: 'Vous rêvez qu’on vous offre tout : l’or, la nuit, les mots des morts. Il suffit de répondre. Vous ouvrez la bouche, et vous vous réveillez, la gorge sèche.', mots: ['vesh'] },
];
HOOKS.load.push(() => {
  if (game._divHooks) return;
  game._divHooks = true;
  const _sleep = game.sleep.bind(game);
  game.sleep = async function (where) {
    const s = farm.s, S = divins.S();
    const reste = DIV_REVES.filter((R) => !(S.reves || {})[DIV_REVES.indexOf(R)]);
    const reve = s && !s.over && reste.length && Math.random() < divins.chanceReve() ? pick(reste) : null;
    await _sleep(where);
    if (reve && !game.dying && farm.s && !farm.s.over) {
      S.reves = S.reves || {}; S.reves[DIV_REVES.indexOf(reve)] = farm.s.day;
      savoir.apprendreMots('aelin', reve.mots);
      setTimeout(() => { if (!game.dying && !ui.panel) ui.read('Un rêve', reve.t, ''); }, 2600);
    }
  };
  // la patience de Durn : les coups portent moins, les os tiennent
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) { if (BUFF.on('pierre') && dmg > 0 && dmg < 900) dmg *= 0.5; return _hurt(dmg, src, cause); };
  const _cj = corps.casserJambe.bind(corps);
  corps.casserJambe = function (cause) { if (BUFF.on('pierre')) { ui.subtitle('', '(Le choc remonte dans vos os, mais ils tiennent. La pierre est avec vous.)', 3); return; } return _cj(cause); };
});

// ---------------------------------------------------------------- branchements
HOOKS.load.push((saved) => { divins.fig = null; divins.fogMin = 0; divins.etoiles = -1; if (farm.s) { if (!saved) farm.s.divins = null; divins.S(); } });
HOOKS.update.push((dt, eye, basis, sky, playing) => divins.update(dt, eye, basis, sky, playing));
HOOKS.sky.push((sky) => divins.sky(sky));
HOOKS.lights.push((eye) => divins.lights(eye));
HOOKS.draw.push((buf, sbuf, cam, t) => divins.draw(buf, sbuf, cam, t));
HOOKS.day.push(() => { if (farm.s) divins.payer(); });
