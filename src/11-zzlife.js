// ============================================================================
//  DES HABITANTS HUMAINS : leur histoire racontée chapitre après chapitre, les
//  questions qu'ils vous posent (et dont ils se souviennent), leur humeur du jour,
//  leurs souvenirs de vous, leurs réactions, leurs conversations entre eux, ce
//  qu'ils marmonnent en vaquant, leurs gestes, leurs paupières et leurs lèvres
// ============================================================================
const LIFE_MOODS = ['joyeux', 'triste', 'fatigue', 'inquiet', 'agace'];
const life = {
  L(n) { return (typeof NPC_LIFE !== 'undefined' && NPC_LIFE[n.id]) || null; },
  st(n) { n.st.life = n.st.life || { story: 0, storyDay: 0, answers: {}, askDay: 0, lastDay: 0, secret: false, rappel: {} }; return n.st.life; },
  fete(n) { const L = this.L(n); return !!L && L.fete === ((farm.s.day - 1) % 28) + 1; },
  // --------------------------------------------------------------- l'humeur du jour
  mood(n) {
    const s = farm.s;
    if (n.moodDay === s.day && n.mood) return n.mood;
    const rnd = mulberry32(s.seed * 7 + s.day * 131 + n.id.length * 17 + n.id.charCodeAt(0));
    const W = { joyeux: 1.2, triste: 0.7, fatigue: 0.8, inquiet: 0.6, agace: 0.7 };
    if (weather.cur.rain > 0.4) { W.triste += 0.5; W.fatigue += 0.4; W.joyeux -= 0.4; }
    if (strange.tension() > 0.5) W.inquiet += 1.2;
    if (s.dead.length && s.dead[s.dead.length - 1].day >= s.day - 3) { W.triste += 1.2; W.inquiet += 1; W.joyeux = 0.1; }
    if (npcs.level(n) >= 5) W.joyeux += 0.6;
    if (n.st.anger > 0) W.agace += 2;
    if (this.fete(n)) W.joyeux += 3;
    if (strange.wasRedNight()) W.fatigue += 1.5;
    let r = rnd() * Object.values(W).reduce((a, b) => a + Math.max(0, b), 0), m = 'joyeux';
    for (const k of LIFE_MOODS) { r -= Math.max(0, W[k]); if (r <= 0) { m = k; break; } }
    n.mood = m; n.moodDay = s.day;
    return m;
  },
  // --------------------------------------------------------------- ce que l'on tient en main
  handKey() {
    const id = farm.s.hand, it = ITEMS[id], h = npcs.hour();
    if (id === 'main' || !it) return 'rien';
    if (it.tool === 'pelle') return 'pelle';
    if (['hache', 'arc', 'fourche', 'faux'].includes(it.tool)) return 'arme';
    if (it.potion) return 'potion';
    if (it.cat === 'relique') return 'relique';
    if (id === 'fleur' || id === 'fleur_lune') return 'fleurs';
    if (typeof FISH !== 'undefined' && FISH[id]) return 'poisson';
    if (id === 'lanterne' && h > 7 && h < 19) return 'lanterne_jour';
    if (it.cat === 'chasse' && (id === 'viande' || id === 'cuir' || id === 'fourrure')) return 'animal_mort';
    return null;
  },
  // --------------------------------------------------------------- une salutation plus humaine (remplace le salut banal)
  greeting(n, lastDay) {
    const L = this.L(n), s = farm.s, S = this.st(n);
    if (!L) return null;
    if (this.fete(n) && S.feteDay !== s.day && L.fete_lignes) { S.feteDay = s.day; return { text: pick(L.fete_lignes) }; }
    if (lastDay && s.day - lastDay >= 5 && L.souvenirs && L.souvenirs.absence) return { text: pick(L.souvenirs.absence) };
    const d = s.dead.length && s.dead[s.dead.length - 1];
    if (d && d.id !== n.id && s.day - d.day >= 1 && s.day - d.day <= 4 && S.victimeDay !== d.day && L.souvenirs && L.souvenirs.victime && Math.random() < 0.5) { S.victimeDay = d.day; return { text: pick(L.souvenirs.victime) }; }
    // un souvenir récent de ce que vous avez fait
    const m = n.st.mem.slice().reverse().find((e) => !e.cb && s.day - e.day <= 4 && ['cadeau', 'aide', 'nuit', 'coup'].includes(e.t));
    if (m && L.souvenirs && Math.random() < 0.55) {
      const key = m.t === 'cadeau' ? (m.k === 'adore' ? 'cadeau_adore' : m.k === 'deteste' ? 'cadeau_deteste' : null) : m.t === 'aide' ? 'aide' : m.t === 'nuit' ? 'toque_nuit' : 'coup';
      if (key && L.souvenirs[key]) { m.cb = 1; return { text: pick(L.souvenirs[key]), extra: { objet: m.item ? itemName(m.item).toLowerCase() : null } }; }
    }
    // la foi du joueur se voit
    const F = faith.s(), R = L.reaction_piete || {};
    if (S.pieteDay !== s.day && Math.random() < 0.4) {
      if (faith.lvl('dessous') >= 2 && R.dessous) { S.pieteDay = s.day; npcs.addAmitie(n, -3); return { text: R.dessous }; }
      if (L.foi === 'eglise' && faith.lvl('eglise') >= 3 && R.eglise) { S.pieteDay = s.day; return { text: R.eglise }; }
      if (L.foi === 'anciens' && faith.lvl('anciens') >= 3 && R.anciens) { S.pieteDay = s.day; return { text: R.anciens }; }
    }
    // ce que vous tenez
    const hk = this.handKey();
    if (hk && hk !== 'rien' && L.tenue && L.tenue[hk] && S.tenueKey !== hk + s.day && Math.random() < 0.55) { S.tenueKey = hk + s.day; return { text: L.tenue[hk] }; }
    // son humeur
    if (L.humeurs && Math.random() < 0.5) return { text: pick(L.humeurs[this.mood(n)] || L.humeurs.joyeux) };
    return null;
  },
  // --------------------------------------------------------------- son histoire, un chapitre à la fois
  story(n) {
    const L = this.L(n), S = this.st(n), s = farm.s, lvl = npcs.level(n), H = L.histoire || [];
    const next = H[S.story];
    if (next && lvl >= (next.min || 0) && S.storyDay !== s.day) { S.story++; S.storyDay = s.day; npcs.addAmitie(n, 8); return next.texte; }
    if (next && S.storyDay === s.day) return pick(['Je vous en ai assez dit pour aujourd’hui. Revenez demain, si ça vous intéresse vraiment.', 'Demain, peut-être. Il y a des choses qui ne se racontent pas d’une traite.', 'Pas tout à la fois. Laissez-moi un peu de moi-même pour demain.']);
    if (next) return pick(['Ça, c’est une histoire pour plus tard. On ne se connaît pas encore assez.', 'Vous êtes bien curieux… Un jour, peut-être. Pas encore.', 'Il faudrait que je vous connaisse mieux. Ne le prenez pas mal.']);
    return H.length ? H[(Math.random() * H.length) | 0].texte : pick(n.d.lines.about);
  },
  // --------------------------------------------------------------- les questions qu'il vous pose
  dueQuestion(n) {
    const L = this.L(n), S = this.st(n), s = farm.s, lvl = npcs.level(n);
    if (!L || !L.questions || S.askDay === s.day || Math.random() > 0.4) return null;
    return L.questions.find((q) => !(q.id in S.answers) && lvl >= (q.min || 0)) || null;
  },
  ask(n, q) { const S = this.st(n); S.askDay = farm.s.day; return talk.view(q.texte, q.reponses.map((r, i) => ({ label: r.label, act: 'ans:' + q.id + ':' + i }))); },
  answer(n, act) {
    const L = this.L(n), S = this.st(n), [, qid, i] = act.split(':'), q = L.questions.find((x) => x.id === qid), r = q && q.reponses[+i];
    if (!r) return talk.view('…', talk.options());
    S.answers[qid] = +i;
    npcs.addAmitie(n, r.amitie || 0);
    npcs.remember(n, 'reponse', { q: qid, i: +i });
    return talk.view(r.reaction, talk.options());
  },
  // --------------------------------------------------------------- bavarder
  chat(n) {
    const L = this.L(n), S = this.st(n), s = farm.s, r = Math.random();
    if (!L) return null;
    const answered = Object.keys(S.answers).filter((qid) => S.rappel[qid] !== s.day && s.day - (n.st.mem.find((m) => m.t === 'reponse' && m.q === qid) || { day: s.day }).day >= 1);
    if (r < 0.2 && answered.length) { const qid = answered[(Math.random() * answered.length) | 0], q = L.questions.find((x) => x.id === qid); if (q && q.rappel) { S.rappel[qid] = s.day; return q.rappel[S.answers[qid]] || null; } }
    if (r < 0.4 && L.humeurs) return pick(L.humeurs[this.mood(n)] || L.humeurs.joyeux);
    if (r < 0.5 && L.foi_lignes && (L.devotion || 0) >= 2) return pick(L.foi_lignes);
    return null;
  },
  // --------------------------------------------------------------- activités, gestes, visages
  activityKind(n) {
    const h = npcs.hour();
    if (weather.cur.rain > 0.4 && !n.inside) return 'pluie';
    if (n.place === 'messe' || (n.place === 'eglise' && n.id !== 'cure')) return 'priere';
    if (n.place === 'auberge' && h >= 11.5 && h < 14) return 'repas';
    if (n.state === 'walk') return 'promenade';
    if (h >= 18.5) return 'soir';
    if (n.place === 'work') return 'travail';
    return 'promenade';
  },
};

// ---------------------------------------------------------------- dialogues : branchements
let lifeHooksOn = false;
function installLifeHooks() {
  if (lifeHooksOn) return;
  lifeHooksOn = true;
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const S = life.st(n), s = farm.s, st = n.st, lastDay = S.lastDay;
    const special = !st.met || npcs.murdererKnown() || st.anger > 0 || (strange.wasRedNight() && st.redSeen !== s.day) || (s.dead.length && s.dead[s.dead.length - 1].day >= s.day - 2 && st.deuil !== s.dead[s.dead.length - 1].id && s.dead[s.dead.length - 1].id !== n.id);
    const v = _open(n);
    if (!special && v && v.text) {
      const alt = life.greeting(n, lastDay);
      if (alt) { v.text = fmtLine(alt.text, n, alt.extra); n.speakT = Math.min(6, 1 + v.text.length * 0.04); }
    }
    S.lastDay = s.day;
    n.nodT = 2;
    return v;
  };
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const n = this.n, opts = _options(), L = life.L(n);
    const i = opts.findIndex((o) => o.act === 'about');
    const extra = [];
    if ((L && L.mythes && L.mythes.length) || NPC_MYTHS[n.id]) extra.push({ label: 'Vous connaissez des légendes ?', act: 'myth' });
    if (L && L.foi_lignes) extra.push({ label: 'Et la foi, pour vous ?', act: 'faith' });
    if (n.id === 'cure' && faith.s().confDay !== farm.s.day) extra.push({ label: 'Je voudrais me confesser', act: 'confesse' });
    if (n.id === 'guerisseuse') extra.push({ label: 'Apprenez-moi les plantes', act: 'plantes' });
    if (L && L.secret && npcs.level(n) >= 8 && !life.st(n).secret) extra.push({ label: 'Vous me faites confiance ?', act: 'secret' });
    opts.splice(i >= 0 ? i + 1 : 1, 0, ...extra);
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    const n = this.n, L = n && life.L(n);
    n.nodT = 1.5;
    if (L) {
      if (act === 'about') return this.view(life.story(n), this.options());
      if (act === 'chat') { const q = life.dueQuestion(n); if (q) return life.ask(n, q); const t = life.chat(n); if (t) return this.view(t, this.options()); }
      if (act.startsWith('ans:')) return life.answer(n, act);
      if (act === 'faith') return this.view(pick(L.foi_lignes), this.options());
      if (act === 'secret') { life.st(n).secret = true; npcs.addAmitie(n, 30); return this.view(L.secret, this.options()); }
    }
    if (act === 'myth') {
      const r = myths.tell(n);
      if (!r) return this.view('Des légendes ? Non. Demandez à d’autres.', this.options());
      const name = n.name;
      setTimeout(() => ui.read(r.titre, r.intro + '\n\n' + r.texte, 'Raconté par ' + name), 30);
      npcs.addAmitie(n, 4);
      return 'keep';
    }
    if (act === 'confesse') {
      const F = faith.s(); F.confDay = farm.s.day;
      faith.add('eglise', 2); if (F.dessous > 0) faith.add('dessous', -4);
      npcs.addAmitie(n, 10);
      const heavy = F.pacts > 0 || farm.s.rep.crimes.length;
      return this.view(heavy ? 'Je vous écoute… (Il vous écoute longtemps. Quand vous avez fini, il ne dit rien pendant un moment.) … Il y a des choses que même le bon Dieu met du temps à porter. Revenez. Revenez souvent. Et ne descendez plus là où vous êtes descendu.' : pick(['Mon enfant, ce ne sont pas des péchés, ce sont des soucis. Mais on peut aussi les poser ici. Allez en paix.', 'Trois Je vous salue Marie, et dormez la porte fermée. C’est ma pénitence préférée, par ici.', 'Vous voilà plus léger. Moi, je porte les vôtres avec les miens. Ne vous en faites pas : j’ai de larges épaules, sous la soutane.']), this.options());
    }
    if (act === 'plantes') {
      const learned = ['potion_soin', 'potion_vigueur', 'antidote'].filter((id) => alchemy.learn(id, true));
      if (learned.length) { farm.give('fiole', 2); npcs.addAmitie(n, 10); return this.view('Les herbes et le miel pour les plaies. La truffe et le miel pour tenir la nuit — mais ne t’y habitue pas. Le venin, le lait et les herbes contre le venin : c’est le mal qui guérit le mal. Tiens, deux fioles. Mon alambic est là, derrière toi ; sers-t’en quand tu veux, mais rince-le.', this.options()); }
      return this.view(pick(['Le reste, tu l’apprendras en essayant. Ou dans les livres des moines, si tu trouves où ils les ont cachés.', 'La fleur de lune ne s’ouvre qu’au cercle, la nuit. Ce qu’elle montre, je ne le dirai pas.', 'La rosée se prend à l’aube, avant que le soleil la boive. Avec une fiole propre.']), this.options());
    }
    return _choose(act);
  };
  const _gift = talk.gift.bind(talk);
  talk.gift = function () {
    const n = this.n, before = n.st.giftDay, v = _gift();
    if (life.fete(n) && before !== farm.s.day && n.st.giftDay === farm.s.day) npcs.addAmitie(n, 40);
    return v;
  };
  // on vous salue de la main
  const _short = npcs.shortGreet.bind(npcs);
  npcs.shortGreet = function (n) { n.waveT = 1.4; return _short(n); };
  // visages : paupières, lèvres
  for (const n of npcs.list) addFace(n);
  npcs.preDraw = (n, t) => {
    const lid = n.rig.part('paupiere'), mouth = n.rig.part('bouche');
    if (lid) { n.blinkT = (n.blinkT ?? 2 + Math.random() * 4) - 0.016; if (n.blinkT < -0.12) n.blinkT = 2.5 + Math.random() * 4; lid.hide = !(n.blinkT < 0) && n.state !== 'sleep' ? true : false; if (n.state === 'sleep' || n.state === 'dead') lid.hide = false; }
    if (mouth) mouth.hide = !((n.talking && n.speakT > 0) || n.chatT > 0 || n.bubbleT > 0.3) || Math.sin(t * 17 + n.id.length) < 0;
    n.waveT = Math.max(0, (n.waveT || 0) - 0.016); n.nodT = Math.max(0, (n.nodT || 0) - 0.016);
    if (n.talking && n.speakT > 0) n.speakT -= 0.016;
    const m = n.moodDay === farm.s.day ? n.mood : null;
    n.gesture = n.place === 'messe' ? 'priere' : (m === 'agace' && n.state === 'idle' && !n.talking && n.goal && n.goal.pose !== 'sit') ? 'bras' : null;
    n.lookP = m === 'triste' && !n.talking ? 0.3 : 0;
  };
}
function addFace(n) {
  if (!n.rig || n.faceParts || !n.rig.has('head')) return;
  n.faceParts = true;
  const kid = (n.look.height || 1) < 0.8, H = kid ? 0.31 : 0.27, hy = H * 0.52;
  const skin = v3.scale(rgbf(n.look.skin || '#e0b896'), 0.93);
  n.rig = rigPlus(n.rig, [
    { name: 'paupiere', parent: 'head', p: [0, hy + H * 0.03, H / 2 + 0.004], s: [H * 0.78, H * 0.13, 0.006], col: skin, tex: TL.skin, hide: true },
    { name: 'bouche', parent: 'head', p: [0, hy - H * 0.29, H / 2 + 0.004], s: [H * 0.26, H * 0.09, 0.006], col: [0.28, 0.08, 0.08], tex: TL.plain, hide: true },
  ]);
}
HOOKS.load.push(() => { installLifeHooks(); for (const n of npcs.list) addFace(n); const s = farm.s; if (!s.prenom) s.prenom = randomFirstName(!!s.fem); });

// ---------------------------------------------------------------- la vie autour de vous
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!playing || typeof NPC_LIFE === 'undefined') return;
  const s = farm.s, h = npcs.hour(), p = game.player;
  // ce qu'ils marmonnent en vaquant
  life.murT = (life.murT || 4) - dt;
  if (life.murT <= 0) {
    life.murT = 3;
    const near = npcs.list.filter((n) => n.st.alive && !n.vanished && !n.hunting && !n.talking && n.state !== 'sleep' && n.dist < 11 && !(n.chatT > 0) && life.L(n) && (n.murT || 0) < game.time);
    if (near.length && Math.random() < 0.45) {
      const n = near[(Math.random() * near.length) | 0], L = life.L(n), k = life.activityKind(n);
      const arr = L.activites && (L.activites[k] || L.activites.promenade);
      if (arr) { n.murT = game.time + 45 + Math.random() * 60; npcs.say(n, pick(arr), 3.5); life.murT = 10; }
    }
  }
  // chez eux, sans y être invité
  life.homeT = (life.homeT || 1) - dt;
  if (life.homeT <= 0) {
    life.homeT = 1;
    for (const n of npcs.list) {
      const L = life.L(n);
      if (!L || !L.chez_soi || !n.st.alive || n.vanished || n.talking || n.inside !== n.d.home || SHOP_DOORS.has(n.d.home) || npcs.level(n) >= 5 || n.dist > 9) continue;
      if (!game.insideBuilding(n.d.home)) continue;
      const S = life.st(n), key = s.day + (h >= 20 || h < 6 ? 'n' : 'j');
      if (S.chezSoi === key) continue;
      S.chezSoi = key;
      npcs.say(n, h >= 20 || h < 6 ? L.chez_soi.nuit : L.chez_soi.jour, 4.5);
      if (h >= 20 || h < 6) npcs.addAmitie(n, -10);
      break;
    }
  }
  // conversations entre habitants (quand on passe à côté)
  lifeChats(dt, p);
});
const chatState = { cur: null, cd: {} };
function lifeChats(dt, p) {
  const C = chatState;
  if (C.cur) {
    const c = C.cur, [a, b] = c.who;
    const broken = [a, b].some((n) => !n.st.alive || n.vanished || n.talking || n.hunting || n.fleeT > 0);
    if (broken) { a.chatT = 0; b.chatT = 0; C.cur = null; return; }
    for (const [n, o] of [[a, b], [b, a]]) { n.heading = turnToward(n.heading, Math.atan2(o.x - n.x, o.z - n.z), dt * 4); n.lookY = 0; n.chatT = 1; }
    c.t -= dt;
    if (c.t <= 0) {
      if (c.i >= c.lines.length) { a.chatT = 0; b.chatT = 0; C.cur = null; return; }
      const [id, txt] = c.lines[c.i++];
      const who = npcs.byId[id];
      if (who) { who.waveT = c.i === 1 ? 1.2 : 0; npcs.say(who, txt, Math.min(6, 2 + txt.length * 0.045)); }
      c.t = Math.min(6.2, 2.4 + txt.length * 0.045);
    }
    return;
  }
  C.t = (C.t || 2) - dt;
  if (C.t > 0) return;
  C.t = 2;
  const now = game.time;
  const idle = (n) => n.st.alive && !n.vanished && !n.hunting && !n.talking && n.state === 'idle' && !n.sleep && n.dist < 17 && !(n.fleeT > 0);
  for (const a of npcs.list) {
    const L = life.L(a);
    if (!L || !L.discussions || !idle(a)) continue;
    for (let k = 0; k < L.discussions.length; k++) {
      const D = L.discussions[(k + (a.discI || 0)) % L.discussions.length], b = npcs.byId[D.avec];
      if (!b || !idle(b) || Math.hypot(a.x - b.x, a.z - b.z) > 7) continue;
      const key = [a.id, b.id].sort().join('+');
      if ((C.cd[key] || 0) > now) continue;
      C.cd[key] = now + 420 + Math.random() * 300;
      a.discI = (a.discI || 0) + 1;
      C.cur = { who: [a, b], lines: D.lignes.slice(), i: 0, t: 0.3 };
      return;
    }
  }
}
// le lavoir : quelques après-midi, on y va laver et parler
HOOKS.load.push(() => {
  if (life.schedOn) return;
  life.schedOn = true;
  const _sched = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    const w = game.world, s = farm.s;
    if (w.lavoir && ['boulangere', 'grainetiere', 'postiere', 'eleveuse'].includes(n.id) && h >= 15.5 && h < 16.8 && (s.day + n.id.length) % 3 === 0 && !strange.redNight() && weather.cur.rain < 0.4) return { place: 'lavoir', sleep: false };
    return _sched(n, h);
  };
});
