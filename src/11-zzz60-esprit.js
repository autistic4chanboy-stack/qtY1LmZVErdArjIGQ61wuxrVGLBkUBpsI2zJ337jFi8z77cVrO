// ============================================================================
//  CORPS ET ESPRIT (1) : la MENTALITÉ du personnage (farm.s.esprit, de 0 à 100,
//  jamais affichée), la faim qui fait battre le cœur et coupe le souffle, et
//  l'étrange qui se montre d'autant plus que l'esprit s'assombrit.
//  - elle baisse, peu à peu : bêtes tuées, nuits dehors loin des lumières, coups
//    et meurtres, vols et profanations, nuits rouges, l'Envers, les morts ;
//  - elle remonte, peu à peu : quêtes accomplies, journées au soleil, bons repas,
//    le chien, le bon sommeil, la prière, le bain ;
//  - elle se devine : couleurs un peu éteintes, murmures, silhouettes au coin de
//    l'œil, sommeil agité, une pensée de temps en temps, une ligne du carnet.
//  Les variations sont plafonnées par jour : il faut plusieurs jours de jeu pour
//  aller d'un bout à l'autre.
//  API : esprit.niveau(), esprit.changer(delta, raison[, plafond du jour pour
//  cette raison]). Essais : esprit.fixer(v), esprit.journal (derniers changements).
// ============================================================================
const ESPRIT_DEPART = 80;
const ESPRIT_BAISSE_JOUR = 28; // au plus, par jour de jeu (toutes raisons confondues)
const ESPRIT_HAUSSE_JOUR = 20;

const ESPRIT_PENSEES = {
  haut: [
    '(Vous vous sentez bien, ici. Presque chez vous.)',
    '(L’air sent le foin coupé. Pour un peu, vous chanteriez.)',
    '(Une bonne fatigue, celle des jours utiles.)',
  ],
  bas: [
    '(Vous n’arrivez plus à penser à autre chose.)',
    '(Il y a trop de silence, dans cette vallée.)',
    '(Vous comptez vos pas sans le vouloir.)',
    '(Vous avez l’impression d’avoir oublié quelque chose d’important. Mais quoi ?)',
    '(Les gens d’ici vous regardent drôlement. Ou c’est vous qui les regardez drôlement.)',
  ],
  tres_bas: [
    '(Quelque chose vous suit. Quand vous vous retournez, il n’y a que le chemin.)',
    '(Vous ne vous souvenez plus de la dernière fois où vous avez ri.)',
    '(Vos mains tremblent. Vous les cachez, sans savoir de qui.)',
    '(Une voix, tout près, a dit votre nom. Il n’y a personne.)',
    '(La vallée vous connaît, maintenant. Elle sait où vous dormez.)',
  ],
  descend: {
    70: '(Une fatigue qui n’est pas celle du corps.)',
    50: '(Les nuits sont plus longues qu’avant.)',
    30: '(Vous ne dormez plus sans laisser une lampe allumée. Dans votre tête, au moins.)',
    15: '(Il y a quelqu’un derrière vos yeux, qui regarde avec vous.)',
  },
  remonte: {
    40: '(Le poids sur votre poitrine s’allège un peu.)',
    60: '(Vous respirez mieux. La vallée redevient une vallée.)',
    80: '(Vous vous surprenez à siffloter.)',
  },
  agite: [
    '(Vous avez mal dormi : des pas dans le grenier toute la nuit, et le même rêve, encore.)',
    '(Une nuit à guetter la porte. Vous vous êtes endormi à l’aube, les poings serrés.)',
    '(Quelqu’un vous regardait dormir. Vous en êtes sûr. Il n’y avait personne.)',
  ],
  ventre_vide: '(Le ventre vide vous a réveillé plusieurs fois.)',
  repose: [
    '(Une vraie nuit, profonde, sans rêve.)',
    '(Vous vous réveillez reposé, pour une fois.)',
  ],
};
// ce que le carnet en dit (jamais de chiffre)
const ESPRIT_CARNET = [
  [85, 'Vous dormez bien. La vallée vous semble presque hospitalière.'],
  [70, 'Les jours passent, pleins et fatigants. C’est bien ainsi.'],
  [55, 'Des pensées qui tournent en rond, le soir, près du feu.'],
  [40, 'Vous sursautez pour un rien, ces temps-ci.'],
  [25, 'Le sommeil vient mal. Il y a des bruits qu’on n’entend que la nuit, et vous les entendez tous.'],
  [10, 'Vous parlez tout seul. Parfois, quelque chose répond.'],
  [-1, 'Quelqu’un a écrit dans ce carnet, de votre écriture, des choses dont vous ne vous souvenez pas.'],
];
const FAIM_PHRASES = {
  creux: ['(Votre ventre gargouille.)', '(Vous mangeriez bien quelque chose.)'],
  faim: ['(Le cœur cogne, les mains tremblent un peu : il faut manger.)', '(Vous avez les jambes en coton. La faim.)'],
  famine: ['(Tout tourne. Si vous ne mangez pas, vous allez tomber.)', '(Votre cœur bat à tout rompre. Manger. Maintenant.)'],
};

const esprit = {
  journal: [], cumul: {}, cumulJour: -1, neg: 0, pos: 0, lastH: null, tickT: 0, sigT: {}, fig: null, figRig: null, lastSay: 0,
  voileEl: null, voileK: 1, vus: new Set(), wasRed: false, wasEnv: false,

  niveau() {
    const s = farm.s;
    if (!s) return ESPRIT_DEPART;
    if (typeof s.esprit !== 'number' || !isFinite(s.esprit)) s.esprit = ESPRIT_DEPART;
    return s.esprit;
  },
  // delta : points sur 100 ; raison : quelques mots ; plafond : cumul maximal (en valeur absolue) de cette raison dans la journée
  changer(delta, raison, plafond) {
    const s = farm.s;
    if (!s || !delta || !isFinite(delta)) return this.niveau();
    raison = raison || '?';
    if (this.cumulJour !== s.day) { this.cumulJour = s.day; this.cumul = {}; this.neg = 0; this.pos = 0; }
    let d = delta;
    if (plafond !== undefined) {
      const room = Math.max(0, plafond - Math.abs(this.cumul[raison] || 0));
      d = Math.sign(d) * Math.min(Math.abs(d), room);
    }
    // plafonds du jour : l'esprit ne bascule pas en une journée
    if (d < 0) d = -Math.min(-d, Math.max(0, ESPRIT_BAISSE_JOUR - this.neg));
    else d = Math.min(d, Math.max(0, ESPRIT_HAUSSE_JOUR - this.pos));
    if (!d) return this.niveau();
    const v0 = this.niveau(), v = clamp(v0 + d, 0, 100), eff = v - v0;
    if (!eff) return v0;
    s.esprit = v;
    this.cumul[raison] = (this.cumul[raison] || 0) + eff;
    if (eff < 0) this.neg -= eff; else this.pos += eff;
    const J = this.journal, last = J[J.length - 1];
    if (last && last.raison === raison && s.hours - last.h < 1) { last.d += eff; last.h = s.hours; }
    else { J.push({ h: s.hours, jour: s.day, d: eff, raison }); if (J.length > 60) J.shift(); }
    this.seuils(v0, v);
    return v;
  },
  // essais : fixer directement le niveau
  fixer(v) { if (farm.s) farm.s.esprit = clamp(+v || 0, 0, 100); this.voile(this.niveau(), true); return this.niveau(); },
  // pensées quand un seuil est franchi
  seuils(v0, v) {
    const P = ESPRIT_PENSEES;
    let t = null;
    if (v < v0) { for (const k of Object.keys(P.descend).map(Number).sort((a, b) => b - a)) if (v0 >= k && v < k) { t = P.descend[k]; break; } }
    else for (const k of Object.keys(P.remonte).map(Number).sort((a, b) => a - b)) if (v0 < k && v >= k) { t = P.remonte[k]; break; }
    if (t) this.dire(t, 4.5);
  },
  dire(t, dur) {
    const now = performance.now();
    if (now - this.lastSay < 45000 || typeof ui === 'undefined' || cine.on) return false;
    this.lastSay = now;
    setTimeout(() => { if (!game.dying) ui.subtitle('', t, dur || 4); }, 900);
    return true;
  },
  ligneCarnet() {
    const v = this.niveau();
    for (const [min, t] of ESPRIT_CARNET) if (v >= min) return t;
    return ESPRIT_CARNET[ESPRIT_CARNET.length - 1][1];
  },

  // ------------------------------------------------------------- chaque image (le gros du travail deux fois par seconde)
  update(dt, eye, basis, sky, playing) {
    const s = farm.s;
    this.majSilhouette(dt, eye, basis);
    faim.update(dt, playing);
    this.tickT -= dt;
    if (this.tickT > 0) return;
    const step = 0.5 - this.tickT;
    this.tickT = 0.5;
    let dh = this.lastH === null ? 0 : s.hours - this.lastH;
    this.lastH = s.hours;
    if (!(dh > 0) || dh > 3 || game.sleeping) dh = 0; // les nuits dormies se comptent au réveil
    const p = game.player, w = game.world;
    const cov = p.underground || w.covered(eye[0], eye[1], eye[2]);
    const env = strange.inEnvers(), red = strange.redNight();
    if (dh) {
      const pluie = typeof vallee !== 'undefined' && vallee.rainK !== undefined ? vallee.rainK : weather.cur.rain;
      // la journée au soleil
      if (sky.day > 0.55 && !cov && !env && !red && pluie < 0.35) this.changer(0.35 * dh, 'soleil', 4);
      // la nuit dehors, loin des lumières
      if (sky.night > 0.55 && !cov && !env && !this.presLumiere(eye)) {
        const lant = game.lantern && farm.count('lanterne');
        this.changer(-(lant ? 0.3 : 0.55) * dh, 'nuit dehors');
      }
      // les horreurs
      if (red) this.changer(-(cov ? 0.45 : 0.9) * dh, 'nuit rouge');
      if (env) this.changer(-1.6 * dh, 'l’Envers');
      const fear = strange.fear || 0;
      if (fear > 0.25) this.changer(-fear * 1.2 * dh, 'peur');
      // le bain : l'eau froide un peu, les sources chaudes beaucoup
      if (!env && !p.underground) {
        if (this.bainChaud(p)) this.changer(2.5 * dh, 'bain chaud', 6);
        else if ((p.swimming || p.wading) && sky.day > 0.4) this.changer(0.8 * dh, 'baignade', 2.5);
      }
    }
    // on entre dans une nuit rouge, dans l'Envers
    if (red && !this.wasRed) this.changer(-2, 'nuit rouge (début)');
    if (env && !this.wasEnv) this.changer(-4, 'l’Envers (entrée)');
    this.wasRed = red; this.wasEnv = env;
    // les morts qu'on voit : carcasses, habitants sans vie
    this.regarderMorts();
    this.signes(step, eye, basis, sky);
  },
  presLumiere(eye) {
    const w = game.world;
    for (const l of w.lights) {
      const dx = l.x - eye[0], dz = l.z - eye[2], r = (l.r || 8) * 0.7;
      if (dx * dx + dz * dz < r * r && Math.abs(l.y - eye[1]) < 8) return true;
    }
    return false;
  },
  bainChaud(p) {
    for (const P of game.world.pools || []) {
      if (!P.hot) continue;
      const dx = p.pos[0] - P.x, dz = p.pos[2] - P.z;
      if (Math.abs(dx) > 16 || Math.abs(dz) > 16) continue;
      const c = Math.cos(P.r || 0), sn = Math.sin(P.r || 0), lx = dx * c - dz * sn, lz = dx * sn + dz * c;
      if (Math.abs(lx) < P.w / 2 && Math.abs(lz) < P.d / 2 && p.pos[1] < P.y + 0.45) return true;
    }
    return false;
  },
  regarderMorts() {
    for (const e of entities.list) {
      if (!e.corpse || this.vus.has(e)) continue;
      if (Math.abs(e.x - game.player.pos[0]) > 20 || Math.abs(e.z - game.player.pos[2]) > 20) continue;
      if (!espritVoit(e.x, e.y + 0.3, e.z, 20)) continue;
      this.vus.add(e);
      this.changer(e.kind === 'dog' && e.owner ? -3 : -1.5, 'carcasse', 6);
    }
    for (const n of npcs.list) {
      if (n.state !== 'dead' || this.vus.has(n.id)) continue;
      if (Math.abs(n.x - game.player.pos[0]) > 16 || Math.abs(n.z - game.player.pos[2]) > 16) continue;
      if (!espritVoit(n.x, (n.y || 0) + 0.4, n.z, 16)) continue;
      this.vus.add(n.id);
      this.changer(-3, 'cadavre', 9);
    }
  },

  // ------------------------------------------------------------- les signes d'un esprit sombre
  signes(dt, eye, basis, sky) {
    const v = this.niveau(), T = this.sigT, night = sky.night > 0.5;
    this.voile(v);
    if (cine.on) return;
    // murmures
    if (v < 40) {
      T.murm = (T.murm ?? 40 + Math.random() * 60) - dt * (night ? 1.6 : 1);
      if (T.murm <= 0) { T.murm = 45 + Math.random() * 120 * (0.35 + v / 40); sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.16 + (40 - v) / 40 * 0.3); }
    } else T.murm = undefined;
    // silhouettes au coin de l'œil
    if (v < 30) {
      T.fig = (T.fig ?? 60 + Math.random() * 80) - dt * (night ? 1.5 : 1);
      if (T.fig <= 0) { T.fig = 70 + Math.random() * 150 * (0.4 + v / 30); if (!this.silhouette(eye, basis)) T.fig = 8; }
    } else T.fig = undefined;
    // une pensée, de temps en temps
    T.pens = (T.pens ?? 180 + Math.random() * 200) - dt;
    if (T.pens <= 0) {
      T.pens = 240 + Math.random() * 280;
      const L = v < 20 ? ESPRIT_PENSEES.tres_bas : v < 45 ? ESPRIT_PENSEES.bas : v >= 85 && Math.random() < 0.4 ? ESPRIT_PENSEES.haut : null;
      if (L && !ui.panel) this.dire(pick(L), 4);
    }
  },
  // les couleurs s'éteignent un peu (un voile posé sur l'image, filtre de l'arrière-plan)
  voile(v, force) {
    if (typeof document === 'undefined' || !document.body) return;
    let el = this.voileEl;
    if (!el) {
      el = this.voileEl = document.createElement('div');
      el.id = 'esprit-voile';
      el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;';
      const gl = document.getElementById('gl');
      if (gl && gl.parentNode) gl.parentNode.insertBefore(el, gl.nextSibling); else document.body.appendChild(el);
    }
    const on = game.kind === 'farm' && farm.on;
    const k = !on || v >= 50 ? 1 : Math.round((1 - 0.3 * Math.pow((50 - v) / 50, 1.1)) * 100) / 100;
    if (k === this.voileK && !force) return;
    this.voileK = k;
    const f = k >= 0.995 ? '' : `saturate(${k})`;
    el.style.backdropFilter = f; el.style.webkitBackdropFilter = f;
  },
  // une silhouette sombre, au bord du champ de vision ; elle n'est plus là quand on la regarde
  silhouette(eye, basis, o) {
    if (this.fig || !eye) return false;
    const w = game.world, p = game.player;
    if (p.underground || (!(o && o.dedans) && w.covered(eye[0], eye[1], eye[2]))) return false;
    const half = settings.fov * DEG * (game.fovK || 1) * 0.5;
    for (let k = 0; k < 6; k++) {
      const side = Math.random() < 0.5 ? -1 : 1, a = p.yaw + side * half * (0.8 + Math.random() * 0.12), d = 11 + Math.random() * 17;
      const x = eye[0] - Math.sin(a) * d, z = eye[2] - Math.cos(a) * d;
      if (!w.inside(x, z, 8) || w.heightAt(x, z) < w.waterLevel + 0.1) continue;
      const y = w.heightAt(x, z);
      const dx = x - eye[0], dy = y + 1.4 - eye[1], dz = z - eye[2], dd = Math.hypot(dx, dy, dz);
      const bh = w.raycastBlocks(eye, [dx / dd, dy / dd, dz / dd], dd);
      if (bh && !bh.block.hidden) continue;
      if (!this.figRig) this.figRig = humanRig(FIGURE_LOOK);
      this.fig = { x, y, z, t: 0, life: 1.1 + Math.random() * 0.8, heading: Math.atan2(eye[0] - x, eye[2] - z) };
      if (Math.random() < 0.3) game.dogAlarm(this.fig);
      return true;
    }
    return false;
  },
  majSilhouette(dt, eye, basis) {
    const F = this.fig;
    if (!F) return;
    F.t += dt;
    const half = settings.fov * DEG * (game.fovK || 1) * 0.5;
    const dx = F.x - eye[0], dz = F.z - eye[2], d = Math.hypot(dx, dz) || 1, fl = Math.hypot(basis.f[0], basis.f[2]) || 1;
    const cos = (dx * basis.f[0] + dz * basis.f[2]) / (d * fl);
    if (F.t > F.life || cos > Math.cos(half * 0.5) || d < 5) {
      this.fig = null;
      if (Math.random() < 0.35) sound.whisper && sound.whisper(clamp((dx * basis.r[0] + dz * basis.r[2]) / d, -1, 1), 0.2);
    }
  },

  // ------------------------------------------------------------- le réveil : a-t-on bien dormi ?
  reveil(where, v0, food0, h0) {
    const s = farm.s, p = game.player;
    const lit = where === 'ferme' || where === 'auberge';
    let bonus = where === 'ferme' ? 4 : where === 'auberge' ? 3 : -1;
    let txt = null;
    const agite = v0 < 35 && Math.random() < 0.35 + (35 - v0) / 50;
    if (agite) { bonus = lit ? 0.8 : -1.5; p.hp = Math.max(1, p.hp - 14); p.stamina = Math.min(p.stamina, 0.6); txt = pick(ESPRIT_PENSEES.agite); }
    else if (food0 < 12) { bonus *= 0.5; txt = ESPRIT_PENSEES.ventre_vide; }
    else if (lit && v0 >= 60 && Math.random() < 0.25) txt = pick(ESPRIT_PENSEES.repose);
    if (typeof alcool !== 'undefined' && alcool.S() && alcool.S().g > 2.5) bonus = Math.min(bonus, 0.5);
    this.changer(bonus, 'sommeil');
    if (txt) setTimeout(() => { if (!game.dying) ui.subtitle('', txt, 5); }, 2600);
  },
};
// quelqu'un voit-il (le joueur) ce point ?
function espritVoit(x, y, z, maxD) {
  const p = game.player, eye = p.eyePos(), dx = x - eye[0], dy = y - eye[1], dz = z - eye[2], d = Math.hypot(dx, dy, dz);
  if (d > (maxD || 40)) return false;
  if (d < 1.2) return true;
  const f = cameraBasis(p.yaw, p.pitch).f;
  if ((dx * f[0] + dy * f[1] + dz * f[2]) / d < 0.55) return false;
  const bh = game.world.raycastBlocks(eye, [dx / d, dy / d, dz / d], d - 0.4);
  return !bh || bh.block.hidden;
}

// ============================================================================
//  LA FAIM : le cœur bat de plus en plus vite et fort, l'endurance s'effondre
// ============================================================================
const faim = {
  battT: 0, episode: 0, pauseT: 0, pulse: 0, ditT: 0, stade: 0,
  update(dt, playing) {
    const p = game.player, f = p.food;
    this.pulse = Math.max(0, this.pulse - dt * 2.5);
    // l'endurance s'effondre : on ne court plus longtemps le ventre vide
    if (f < 30 && !p.riding) {
      const cap = 0.3 + 0.7 * f / 30;
      if (p.stamina > cap) p.stamina = Math.max(cap, p.stamina - dt * 0.6);
      if (p.sprinting) p.stamina = Math.max(0, p.stamina - dt * 0.035 * (1 - f / 30));
    }
    // quelques mots, quand la faim s'installe
    const st = f < 8 ? 3 : f < 18 ? 2 : f < 30 ? 1 : 0;
    this.ditT -= dt;
    if (st > this.stade || (st && this.ditT <= 0)) {
      if (playing && !cine.on) { ui.subtitle('', pick(st === 3 ? FAIM_PHRASES.famine : st === 2 ? FAIM_PHRASES.faim : FAIM_PHRASES.creux), 3); this.ditT = st === 3 ? 90 : 200; }
    }
    this.stade = st;
    // le cœur (les blessures et la peur le font déjà battre : on ne double pas)
    if (!playing || f >= 32 || cine.on || game.sleeping) { this.episode = 0; return; }
    if (p.hp < 35 || (strange.fear || 0) > 0.3) return;
    const k = 1 - f / 32;
    if (k < 0.45) { // faim légère : par moments
      if (this.episode <= 0) {
        this.pauseT -= dt;
        if (this.pauseT > 0) return;
        this.episode = 6 + ((Math.random() * 5) | 0);
        this.pauseT = 20 + Math.random() * 30;
      }
    }
    this.battT -= dt;
    if (this.battT > 0) return;
    this.battT = lerp(1.1, 0.4, k);
    sound.heartbeat(lerp(0.1, 0.8, Math.pow(k, 1.25)));
    if (this.episode > 0) this.episode--;
    if (k > 0.6) this.pulse = 0.12 + (k - 0.6) * 0.5;
  },
};

// ============================================================================
//  L'ÉTRANGE SUIT L'ESPRIT : bizarrerie() de 0,6 (esprit clair, 100) à 1
//  (esprit ordinaire, 70) puis 2,5 (esprit en ruine, 0) ; la fatigue la pousse
//  encore (11-zzz95-sommeil.js), jamais au-delà de BIZ_MAX. Elle multiplie les
//  chances de l'étrange : nuits rouges et événements (ci-dessous), nuits noires
//  imprévues, tueur errant, prodiges étranges, lavandière, rêves et venues des
//  Trois, cauchemars, marchand de joie… (mesures : tools/equilibrage/hasard.js)
// ============================================================================
const BIZ_MIN = 0.6, BIZ_MAX = 2.5;
function bizarrerieDe(v) {
  v = clamp(+v || 0, 0, 100);
  return v >= 70 ? 1 - (1 - BIZ_MIN) * (v - 70) / 30 : 1 + (BIZ_MAX - 1) * Math.pow((70 - v) / 70, 1.2);
}
bizarrerie = function () { return bizarrerieDe(esprit.niveau()); };
{
  // les événements du jour et les nuits rouges suivent l'esprit, dans les deux sens
  const _newDay = strange.newDay.bind(strange);
  strange.newDay = function (nightInfo) {
    const r = _newDay(nightInfo);
    try { espritEtrange(this); } catch (e) { console.error(e); }
    return r;
  };
  // un esprit en ruine voit plus loin dans l'étrange (pas les trois premiers jours : rien de grand avant le quatrième)
  const _maxLevel = strange.maxLevel.bind(strange);
  strange.maxLevel = function () { const l = _maxLevel(); return bizarrerie() >= 2.2 && farm.s && farm.s.day >= 4 ? Math.min(3, l + 1) : l; };
  // les petits frissons de la nuit : plus rapprochés quand l'esprit s'assombrit, plus rares quand il est clair
  // (la minuterie compte en heures de jeu : elle s'écoule ici b fois plus vite)
  const _upd = strange.update.bind(strange);
  strange.update = function (dt, c) { const b = bizarrerie(); if (this.ambT > 0) this.ambT -= heuresDeJeu(dt) * (b - 1); return _upd(dt, c); };
}
function espritEtrange(st) {
  const b = bizarrerie(), S = st.s, s = farm.s, d = s.day;
  if (!S || Math.abs(b - 1) < 0.001) return;
  const t = st.tension();
  // nuit rouge : la chance du soir multipliée par b ; jamais une nuit noire (l'almanach doit rester juste) ; la toute
  // première, qui vient toujours, reste
  const p = st.chanceRouge(), premiere = S.redCount === 0 && d >= S.redMin + 3;
  const noire = typeof evenements !== 'undefined' && evenements.nuitNoire(d);
  if (b > 1) {
    if (!S.redTonight && !noire && d >= S.redMin && S.lastRed < d - 1) { const pb = Math.min(0.5, p * b); if (Math.random() < (pb - p) / (1 - p)) S.redTonight = true; }
  } else if (S.redTonight && !premiere && Math.random() > b) S.redTonight = false;
  // événements du jour : un esprit clair en voit moins…
  if (b < 1) { S.events = S.events.filter((e) => (d === 2 && e.id === 'epouvantail') || Math.random() < b); return; }
  // … un esprit sombre, davantage
  const p0 = st.chanceEvenements(), pb = Math.min(0.9, p0 * b);
  let extra = 0;
  if (!S.events.length) { if (Math.random() < (pb - p0) / Math.max(0.01, 1 - p0)) extra = 1 + (Math.random() < t * 0.15 ? 1 : 0); }
  else if (Math.random() < (b - 1) * 0.25) extra = 1;
  if (!extra) return;
  const maxL = st.maxLevel();
  const pool = EVENT_DEFS.filter((e) => e.lvl <= maxL && (S.seen[e.id] || 0) < 3 && !S.events.some((x) => x.id === e.id));
  for (let k = 0; k < extra && pool.length; k++) {
    let e = null;
    for (let n = 0; n < 8 && !e; n++) { const c = pool[(Math.random() * pool.length) | 0]; if (Math.random() < (c.lvl === maxL ? 0.45 : 1)) e = c; }
    if (!e) continue;
    pool.splice(pool.indexOf(e), 1);
    const W = WHEN_H[e.when] || WHEN_H.nuit;
    S.events.push({ id: e.id, h: W[0] + Math.random() * (W[1] - W[0]), done: false, esprit: true });
  }
}

// ============================================================================
//  CE QUI FAIT BAISSER OU REMONTER L'ESPRIT (points d'accroche)
// ============================================================================
// tuer une bête
{
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) {
    const vivant = e && !e.dead;
    const r = _hc(e, dmg, eye);
    if (vivant && e.dead) espritBete(e);
    return r;
  };
}
function espritBete(e) {
  if (e.kind === 'dog' && e.owner) return esprit.changer(-16, 'chien tué');
  if (e.kind === 'cat') return esprit.changer(-5, 'chat tué');
  if (e.owner) return esprit.changer(-2.5, 'bête de la ferme tuée');
  const cfg = e.cfg || {};
  let d = -1.4;
  if (cfg.pack || cfg.charge || cfg.dmg) d = -0.6;          // bête dangereuse : on se défend
  else if (cfg.fly || (e.h || 1) < 0.55) d = -0.8;         // petit gibier
  esprit.changer(d, 'bête tuée', 10);
}
// frapper, tuer un habitant ; voir mourir quelqu'un
{
  const _hurt = npcs.hurt.bind(npcs);
  npcs.hurt = function (n, dmg, by) {
    const vivant = n && n.st && n.st.alive;
    const r = _hurt(n, dmg, by);
    if (vivant && by === 'joueur' && n.st.alive) esprit.changer(-2.5, 'coup', 8);
    return r;
  };
  const _kill = npcs.kill.bind(npcs);
  npcs.kill = function (n, by, wit) {
    const r = _kill(n, by, wit);
    try {
      if (by === 'joueur') esprit.changer(strange.isKiller(n.id) ? -4 : -10, 'meurtre');
      else if (by === 'masque') esprit.changer(-4, 'un homme tué');
      else if (farm.s && Math.hypot(n.x - game.player.pos[0], n.z - game.player.pos[2]) < 40 && espritVoit(n.x, (n.y || 0) + 1, n.z, 40)) esprit.changer(-6, 'mort vue');
      esprit.vus.add(n.id);
    } catch (e) { console.error(e); }
    return r;
  };
}
// les quêtes accomplies
{
  const _qc = quests.complete.bind(quests);
  quests.complete = function (q, n) { const r = _qc(q, n); esprit.changer(4, 'quête', 10); return r; };
}
// parler à des amis ; être craint de tous
{
  const _open = talk.open.bind(talk);
  talk.open = function (n) {
    const r = _open(n);
    try {
      if (npcs.murdererKnown()) esprit.changer(-0.5, 'on vous fuit', 2);
      else if (n && n.st && n.st.alive && npcs.level(n) >= 4) esprit.changer(0.4, 'amitié', 2);
    } catch (e) { console.error(e); }
    return r;
  };
}
// prier (l'Église, la Vieille Foi) ; Ceux d'En-Dessous, les pactes
if (typeof faith !== 'undefined') {
  const _pray = faith.pray.bind(faith);
  faith.pray = async function (it) {
    const f = it && it.data && it.data.faith, kind = this.shrineKind(it), first = this.s().prayed[kind] !== farm.s.day;
    const r = await _pray(it);
    if (f === 'dessous') esprit.changer(-1.5, 'prière d’en-dessous', 4);
    else esprit.changer(first ? 3 : 0.5, 'prière', 6);
    return r;
  };
  if (faith.pact) { const _pact = faith.pact.bind(faith); faith.pact = function (...a) { const r = _pact(...a); esprit.changer(-4, 'pacte'); return r; }; }
}
// au premier chargement : le jeu (game), la société (agent E), la confession, le sommeil
HOOKS.load.push((saved) => {
  const s = farm.s;
  if (!saved || typeof s.esprit !== 'number') {
    // anciennes parties : l'esprit se souvient des meurtres déjà commis
    s.esprit = saved ? clamp(ESPRIT_DEPART - 8 * meurtresDuJoueur(), 15, ESPRIT_DEPART) : ESPRIT_DEPART;
  }
  esprit.journal = []; esprit.cumulJour = -1; esprit.lastH = null; esprit.fig = null; esprit.vus = new Set(); esprit.sigT = {};
  esprit.wasRed = strange.redNight(); esprit.wasEnv = strange.inEnvers();
  faim.stade = 0; faim.episode = 0;
  esprit.voile(esprit.niveau(), true);
  if (esprit.branche) return;
  esprit.branche = true;
  // vols, profanations, braconnage (module de la société, s'il existe)
  try {
    if (typeof societe !== 'undefined' && societe && typeof societe.crime === 'function') {
      const _crime = societe.crime.bind(societe);
      societe.crime = function (o) {
        const r = _crime(o);
        try {
          const t = o && o.type, v = o && o.victime;
          const dejaCompte = (t === 'meurtre' || t === 'agression') && v && npcs.byId[v];
          if (!dejaCompte) {
            const D = { vol: -2.5, braconnage: -1, profanation: -5, agression: -2.5, meurtre: -10 }[t];
            if (D) esprit.changer(D, 'crime : ' + t);
          }
        } catch (e) { console.error(e); }
        return r;
      };
    }
  } catch (e) { console.warn('esprit : société', e); }
  // se confesser
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    const avant = act === 'confesse' && typeof faith !== 'undefined' ? faith.s().confDay : null;
    const r = _choose(act);
    if (act === 'confesse' && typeof faith !== 'undefined' && faith.s().confDay === farm.s.day && avant !== farm.s.day) esprit.changer(4, 'confession', 4);
    return r;
  };
  // bien (ou mal) dormir
  const _sleep = game.sleep.bind(game);
  game.sleep = async function (where) {
    const s0 = farm.s, day0 = s0 ? s0.day : 0, v0 = esprit.niveau(), food0 = game.player.food, h0 = s0 ? s0.hours : 0;
    const r = await _sleep(where);
    try { if (farm.s && farm.s === s0 && farm.s.day > day0 && !game.dying) esprit.reveil(where, v0, food0, h0); } catch (e) { console.error(e); }
    return r;
  };
  // s'effondrer d'épuisement
  const _faint = game.faint.bind(game);
  game.faint = async function () { const d0 = farm.s.day; const r = await _faint(); if (farm.s.day > d0 && !game.dying) esprit.changer(-1, 'évanoui'); return r; };
  // le mode création ne garde pas le voile
  const _cre = game.enterCreative.bind(game);
  game.enterCreative = function () { const r = _cre(); esprit.voile(100, true); return r; };
});
// le matin : les morts de la nuit se savent
HOOKS.day.push(() => {
  const s = farm.s;
  const morts = (s.dead || []).filter((d) => d.day === s.day - 1 && d.by !== 'joueur').length;
  if (morts) esprit.changer(-1.5 * morts, 'des morts dans la vallée', 5);
});
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || game.mode !== 'play' || game.dying) return;
  esprit.update(dt, eye, basis, sky, playing);
});
// le cœur de la faim cogne aussi dans les yeux
HOOKS.fx.push((fx) => { if (faim.pulse > 0) fx[0] = Math.max(fx[0], faim.pulse); });
// la silhouette
HOOKS.draw.push((buf, sbuf, cam, t) => {
  const F = esprit.fig;
  if (!F || !esprit.figRig) return;
  poseHuman(esprit.figRig, { move: 0, t, lookY: 0 });
  drawRig(buf, esprit.figRig, F.x, F.y, F.z, F.heading, 1, 0);
});
