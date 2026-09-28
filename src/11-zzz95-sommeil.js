// ============================================================================
//  LE SOMMEIL
//  - On dort à toute heure : se coucher mène au lendemain matin, six heures (la
//    nuit, au matin qui vient ; le jour, on le demande d'abord).
//  - Plus d'évanouissement à trois heures du matin. À la place, la FATIGUE
//    (heures passées sans dormir, sauvegardées) : paupières lourdes, vue qui se
//    voile, endurance qui revient moins vite, pensées du personnage, la
//    mentalité qui s'abîme plus vite (raison « fatigue », et les coups durs
//    pèsent plus lourd), l'étrange un peu plus fréquent ; très tard, des yeux
//    qui se ferment tout seuls, une seconde. Dormir remet tout à zéro.
//  - Chaque lit de la vallée : E dessus, « Dormir ici ». Chez soi, dans une
//    maison louée, dans un lieu public ou abandonné : on dort. Dans le lit de
//    quelqu'un : s'il est là et réveillé, il proteste ; s'il rentre pendant la
//    nuit (ou s'il dort dans la pièce), il vous trouve : réplique, amitié en
//    chute, souvenir, intrusion (societe.crime), et dehors.
//  - La génération nouvelle de ce lot (après tout le reste, tirage propre) :
//    la maison du Rempart (troisième maison à louer), coffres et écriteaux des
//    maisons à louer, la poterne du mur est (voir 11-zzz97-crochetage.js).
//  État : farm.s.sommeil = { debout (heures de jeu au réveil), nuits, veilleMax }.
//  API : sommeil (veille(), stade(), k(), litE(q), infoLit(q), lits).
// ============================================================================
Object.assign(LIEU_NAMES, { maison_rempart: 'la maison du Rempart', poterne: 'la poterne' });
const LOC_CLES = ['vide4', 'vide5', 'maison_rempart'];
// lits : demi-largeur, demi-longueur, hauteur du dessus
const LIT_TAILLE = { lit: [0.53, 1.03, 0.5], lit_geant: [2.8, 5.5, 1.2], paillasse: [0.45, 0.95, 0.16], fond_lit: [0.5, 0.9, 0.48], fond_paillasse: [0.55, 0.5, 0.42] };
const LIT_INTERS = new Set(['bed', 'rentbed', 'refuge', 'k_paillasse']);

const FATIGUE_PENSEES = [
  null,
  ['(Vous bâillez sans pouvoir vous retenir.)', '(Un bon lit ne serait pas de refus.)', '(La journée a été longue. Les jambes le disent avant la tête.)'],
  ['(Vos paupières pèsent de plus en plus lourd.)', '(Vous vous surprenez à fixer le vide, la bouche ouverte.)', '(Il faudrait dormir. Un lit, une paillasse, n’importe quoi.)', '(Vos pensées s’emmêlent comme de la laine mouillée.)'],
  ['(Vous relisez trois fois la même pensée sans la comprendre.)', '(Le sol tangue doucement. Ce n’est pas le sol.)', '(Vos mains tremblent un peu. Le froid, sans doute. Ce n’est pas le froid.)', '(Vous avez oublié ce que vous étiez venu faire ici.)', '(Chaque bruit vous fait sursauter, et vous ne savez plus d’où il vient.)'],
  ['(Quelqu’un a parlé, tout près. Ou vous avez rêvé debout.)', '(Les contours des choses bougent quand on ne les regarde pas.)', '(Dormir. Il faut dormir. Tout de suite, n’importe où.)', '(Vos yeux se sont fermés. Combien de temps ?)', '(Vous ne savez plus depuis quand vous êtes debout. La vallée, elle, le sait.)'],
];
const FATIGUE_ENTREE = [null, '(La fatigue vient. Une bonne fatigue, pour l’instant.)', '(Vous devriez aller dormir. Le corps le réclame.)', '(Vous n’avez pas dormi. Tout devient lointain, et un peu faux.)', '(Cela fait trop longtemps. Quelque chose, en vous, commence à céder.)'];
// l'habitant qui vous trouve dans son lit
const LIT_DECOUVERT = {
  ami: ['Vous ? Dans mon lit ? … Vous auriez pu demander, au moins. Allez, debout. Et on n’en parle plus.', 'Ça alors. Je rentre, et je vous trouve là, comme chez vous. Debout, voyons. Vous me devez une explication, un jour.'],
  autre: ['Qu’est-ce que vous faites dans mon lit ?! Dehors ! Dehors, ou j’appelle le garde !', 'Au voleur ! … Non, pire : dans mon lit ! Sortez de chez moi, tout de suite !', 'Mais… qui êtes-vous ? Qu’est-ce que vous faites là ? Dehors ! Et que je ne vous revoie pas !'],
  matin: ['Je me lève, et qu’est-ce que je trouve ? Vous, dans le lit, comme un chat de gouttière ! Dehors !', 'Vous avez dormi ici ? Chez moi ? Toute la nuit ? … Sortez. Sortez avant que je crie.'],
  enfant: 'Dans le lit de ma fille ?! Mais vous êtes fou ! Sortez de chez moi, sortez, ou j’appelle le garde !',
  garde: 'Dans le lit du garde ! Vous ne manquez pas d’air. Dehors. Et estimez-vous heureux que je ne vous mette pas au cachot.',
};
const LIT_PROTESTE = ['Hé ! C’est mon lit, ça. Vous vous croyez à l’auberge ?', 'Pas question. Mon lit, c’est mon lit.', 'Vous plaisantez ? Allez dormir chez vous.', 'Ah non. On ne se couche pas chez les gens comme ça.'];

const sommeil = {
  lits: null, nProps: -1, ctx: null, tickT: 0, lastH: null, lastSt: null, stadePrev: 0,
  pensT: 90, blinkT: 8, blink: 0, blinkPh: 0, blinkHold: 0, vignette: 0, ferme: 0, flou: 0, murmT: 80, figT: 120,
  el: null, elH: null, elB: null, elK: -1, elF: -1,

  // ------------------------------------------------------------------ l'état
  S() {
    const s = farm.s;
    if (!s) return null;
    if (!s.sommeil || typeof s.sommeil.debout !== 'number' || !isFinite(s.sommeil.debout)) s.sommeil = { debout: s.hours - this.depuisAube(), nuits: 0, veilleMax: 0 };
    return s.sommeil;
  },
  depuisAube() { return typeof game !== 'undefined' && game.world ? (game.world.time * 24 - 6 + 24) % 24 : 0; },
  veille() { const S = this.S(); return S ? Math.max(0, farm.s.hours - S.debout) : 0; },
  // fatigue ressentie (la vigueur la repousse)
  eff() { let v = this.veille(); if (typeof BUFF !== 'undefined' && BUFF.on('vigueur')) v -= 10; return Math.max(0, v); },
  stade() { const v = this.eff(); return v >= 34 ? 4 : v >= 26 ? 3 : v >= 20 ? 2 : v >= 16 ? 1 : 0; },
  k() { return farm.s ? clamp((this.eff() - 16) / 24, 0, 1) : 0; },
  reveille(heures) {
    const S = this.S(), s = farm.s;
    if (!S) return;
    S.veilleMax = Math.max(S.veilleMax || 0, this.veille());
    if (heures === undefined) S.debout = s.hours;
    else S.debout = Math.min(s.hours, S.debout + heures);
    this.stadePrev = this.stade(); this.pensT = 120 + Math.random() * 120;
  },

  // ------------------------------------------------------------------ chaque image
  update(dt, eye, basis, sky, playing) {
    const s = farm.s, p = game.player, S = this.S();
    if (!S) return;
    const actif = game.mode === 'play' && !game.dying && !game.sleeping && !(typeof cine !== 'undefined' && cine.on);
    const st = actif ? this.stade() : 0, k = this.k();
    // l'endurance revient moins vite
    if (actif && this.lastSt !== null && p.stamina > this.lastSt && p.stamina - this.lastSt < 0.08 && st >= 1) {
      const f = [1, 0.85, 0.65, 0.45, 0.35][st];
      p.stamina = this.lastSt + (p.stamina - this.lastSt) * f;
    }
    this.lastSt = p.stamina;
    // la mentalité s'use (deux fois par seconde, au prorata des heures de jeu)
    this.tickT -= dt;
    if (this.tickT <= 0) {
      this.tickT = 0.5;
      let dh = this.lastH === null ? 0 : s.hours - this.lastH;
      this.lastH = s.hours;
      if (!(dh > 0) || dh > 3 || game.sleeping) dh = 0;
      if (dh && st >= 2 && typeof esprit !== 'undefined' && esprit.changer) {
        const rate = ([0, 0, 0.45, 0.9, 1.5][st]) + Math.max(0, this.eff() - 40) * 0.05;
        esprit.changer(-rate * dh, 'fatigue', 18);
      }
      if (this.lits && game.world.props.length !== this.nProps) this.listerLits();
    }
    // pensées : à chaque palier franchi, puis de temps en temps
    if (actif && st > this.stadePrev && FATIGUE_ENTREE[st]) { this.dire(FATIGUE_ENTREE[st], 4.5); this.pensT = 90 + Math.random() * 60; }
    if (actif) this.stadePrev = st;
    this.pensT -= dt;
    if (actif && st >= 1 && this.pensT <= 0) {
      this.pensT = [0, 260, 170, 115, 80][st] * (0.7 + Math.random() * 0.6);
      this.dire(pick(FATIGUE_PENSEES[st]), 4);
      if (st >= 1 && Math.random() < 0.5) sound.breath && sound.breath(1.3);
    }
    // l'étrange : des murmures, une silhouette au coin de l'œil
    if (actif && st >= 3) {
      this.murmT -= dt;
      if (this.murmT <= 0) { this.murmT = (st >= 4 ? 45 : 90) + Math.random() * 90; sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.12 + k * 0.2); }
      if (st >= 4 && typeof esprit !== 'undefined' && esprit.silhouette) {
        this.figT -= dt;
        if (this.figT <= 0) { this.figT = 100 + Math.random() * 140; if (!esprit.silhouette(eye, basis)) this.figT = 15; }
      }
    }
    // les paupières : lourdes, des clignements lents ; à bout, les yeux se ferment tout seuls une seconde
    let base = actif ? [0, 0, 0.05, 0.1, 0.16][st] + (st >= 2 ? Math.sin(game.time * 0.7) * 0.02 : 0) : 0;
    if (actif && st >= 2) {
      this.blinkT -= dt;
      if (this.blinkPh === 0 && this.blinkT <= 0) {
        const micro = st >= 4 && Math.random() < 0.4;
        this.blinkPh = 1; this.blinkHold = micro ? 0.8 + Math.random() * 0.9 : 0.05 + Math.random() * (st >= 3 ? 0.35 : 0.15);
        this.blinkT = micro ? 35 + Math.random() * 35 : [0, 0, 11, 7, 5][st] * (0.6 + Math.random() * 0.8);
        if (micro) setTimeout(() => sound.breath && sound.breath(1.1), 400);
      }
    } else { this.blinkPh = 0; this.blink = 0; }
    if (this.blinkPh === 1) { this.blink = Math.min(1, this.blink + dt / 0.28); if (this.blink >= 1) this.blinkPh = 2; }
    else if (this.blinkPh === 2) { this.blinkHold -= dt; if (this.blinkHold <= 0) this.blinkPh = 3; }
    else if (this.blinkPh === 3) { this.blink = Math.max(0, this.blink - dt / 0.4); if (this.blink <= 0) this.blinkPh = 0; }
    this.ferme = Math.min(1.12, base + this.blink * (st >= 3 ? 1.12 : 0.85));
    this.flou = actif && st >= 3 ? 0.35 + k * 0.8 : 0;
    this.vignette = actif && st >= 2 ? 0.1 + k * 0.4 : 0;
    this.paupieres();
  },
  dire(t, dur) {
    if (!t || ui.panel || (typeof cine !== 'undefined' && cine.on)) return;
    ui.subtitle('', t, dur || 4);
  },
  // voile noir en haut et en bas de l'écran, flou léger
  paupieres() {
    if (typeof document === 'undefined' || !document.body) return;
    const c = Math.round(this.ferme * 100) / 100, f = Math.round(this.flou * 20) / 20;
    if (c === this.elK && f === this.elF) return;
    if (!this.el) {
      const el = this.el = document.createElement('div');
      el.id = 'm95-paupieres';
      el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
      const mk = (top) => { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:-5%;right:-5%;height:62%;${top ? 'top:0' : 'bottom:0'};background:linear-gradient(${top ? 'to bottom' : 'to top'},#000 0%,#000 78%,rgba(0,0,0,0.6) 90%,rgba(0,0,0,0) 100%);transform:translateY(${top ? -101 : 101}%);will-change:transform;`; el.appendChild(d); return d; };
      this.elH = mk(true); this.elB = mk(false);
      const gl = document.getElementById('gl');
      if (gl && gl.parentNode) gl.parentNode.insertBefore(el, gl.nextSibling); else document.body.appendChild(el);
    }
    this.elK = c; this.elF = f;
    const t = -101 + Math.min(1, c) * 101;
    this.elH.style.transform = `translateY(${t.toFixed(1)}%)`;
    this.elB.style.transform = `translateY(${(-t).toFixed(1)}%)`;
    const fl = f > 0.05 ? `blur(${f.toFixed(2)}px)` : '';
    this.el.style.backdropFilter = fl; this.el.style.webkitBackdropFilter = fl;
  },

  // ------------------------------------------------------------------ les lits
  listerLits() {
    const w = game.world;
    this.nProps = w.props.length;
    const old = new Map((this.lits || []).map((L) => [L.q, L]));
    this.lits = [];
    for (const q of w.props) {
      if (!LIT_TAILLE[q.id] || q.gone) continue;
      if (old.has(q)) { this.lits.push(old.get(q)); continue; }
      const aInter = (w.inter || []).some((it) => LIT_INTERS.has(it.kind) && Math.hypot(it.x - q.x, it.z - q.z) < 1.6 && Math.abs(it.y - q.y) < 3);
      this.lits.push({ q, bld: this.bldDe(q), aInter });
    }
  },
  bldDe(q) {
    const w = game.world;
    for (const k in w.bld) {
      const B = w.bld[k], f = B.f;
      if (!f || Math.abs(q.y - B.y) > 3) continue;
      const [lx, lz] = World.blockLocal({ x: f.x, z: f.z, r: f.r }, q.x, q.z);
      if (Math.abs(lx) < B.W / 2 + 0.2 && Math.abs(lz) < B.D / 2 + 0.2) return k;
    }
    return null;
  },
  // à qui est ce lit ? { cat: ferme|location|conjoint|vide|public|autrui|mort|cachot|geant, bld, n (propriétaire), co (autres habitants) }
  infoLit(q) {
    const L = (this.lits || []).find((l) => l.q === q) || { q, bld: this.bldDe(q) };
    const w = game.world, bld = L.bld, B = bld && w.bld[bld];
    if (q.id === 'paillasse' && w.prison && Math.hypot(q.x - PRISON_POS.x, q.z - PRISON_POS.z) < 30) return { cat: 'cachot', bld };
    if (q.id === 'lit_geant') return { cat: 'geant', bld };
    if (!bld) return { cat: q.id === 'fond_lit' || q.id === 'fond_paillasse' ? 'public' : 'vide', bld };
    if (bld === 'ferme') return { cat: 'ferme', bld };
    if (typeof locations !== 'undefined' && locations.locataire(bld)) return { cat: 'location', bld };
    const vivants = npcs.list.filter((n) => n.d.home === bld && n.st.alive && !n.vanished);
    const morts = npcs.list.filter((n) => n.d.home === bld && !n.st.alive);
    let n = null;
    if (vivants.length) {
      // le lit de qui ? (le second lit de la boulangerie est celui de la petite)
      const sp = B.spots || {}, dB2 = sp.bed2 ? Math.hypot(sp.bed2.x - q.x, sp.bed2.z - q.z) : 99;
      n = (dB2 < 0.6 && vivants.find((m) => m.id === 'fillette')) || vivants.find((m) => m.id !== 'fillette') || vivants[0];
    } else {
      const trav = npcs.list.find((m) => m.d.work === bld && m.st.alive && !m.vanished);
      if (trav) n = trav;
    }
    const conj = typeof sentiments !== 'undefined' && sentiments.conjoint ? sentiments.conjoint() : null;
    if (n && conj && (n === conj || (n.id === 'fillette' && conj.id === 'boulangere'))) return { cat: 'conjoint', bld, n };
    if (n) return { cat: 'autrui', bld, n, co: vivants.filter((m) => m !== n) };
    if (morts.length) return { cat: 'mort', bld, n: morts[0] };
    return { cat: bld === 'refuge' || bld === 'relais_chasse' ? 'public' : 'vide', bld };
  },
  // E sur un lit
  litE(q) {
    const I = this.infoLit(q), s = farm.s;
    switch (I.cat) {
      case 'cachot': {
        const P = typeof prison !== 'undefined' && prison.S();
        if (P && P.actif) { game.sleep('cachot'); return; }
        ui.subtitle('', '(De la paille qui pique, et qui sent la peur des autres.)', 3); return;
      }
      case 'ferme': return this.coucher('ferme', q, I);
      case 'location': return this.coucher('location', q, I);
      case 'conjoint': return this.coucher('lit', q, I);
      case 'geant': return this.coucher('geant', q, I);
      case 'mort': return this.coucher('lit', q, I);
      case 'vide': case 'public': return this.coucher(q.id === 'paillasse' || q.id === 'fond_paillasse' ? 'paille' : 'lit', q, I);
    }
    // le lit de quelqu'un
    const n = I.n, B = game.world.bld[I.bld], p = game.player;
    const ici = (m) => m.st.alive && m.inside === I.bld && Math.hypot(m.x - p.pos[0], m.z - p.pos[2]) < 16;
    if (ici(n) && n.state === 'sleep') {
      const dans = Math.hypot(n.x - q.x, n.z - q.z) < 1.3;
      if (dans) { ui.subtitle('', `(${n.st.met ? n.name : 'Quelqu’un'} dort déjà dans ce lit, et ronfle doucement.)`, 3); return; }
    }
    const debout = [n, ...(I.co || [])].find((m) => ici(m) && m.state !== 'sleep' && !m.sleep);
    if (debout) {
      npcs.say(debout, pick(LIT_PROTESTE), 3);
      npcs.addAmitie(debout, -3); npcs.remember(debout, 'lit_demande');
      return;
    }
    // quelqu'un dort dans la pièce : il vous trouvera au matin ; le propriétaire rentre-t-il avant six heures ?
    const dormeur = [n, ...(I.co || [])].find((m) => ici(m) && (m.state === 'sleep' || m.sleep));
    const arrivee = ici(n) ? null : this.arrivee(n, I.bld);
    I.arrivee = arrivee; I.matin = !arrivee && dormeur ? dormeur : null;
    this.coucher('lit', q, I);
  },
  // heure (0..30) à laquelle l'habitant rentre chez lui avant le matin qui vient, ou null
  arrivee(n, bld) {
    if (!n || !n.st.alive || n.vanished || n.hunting || n.d.home !== bld) return null;
    const h0 = npcs.hour(), fin = h0 < 6 ? 6 : 30;
    for (let h = h0 + 0.25; h < fin - 0.25; h += 0.25) {
      const sp = npcs.schedulePlace(n, h % 24);
      if (sp && sp.place === 'home') return h;
    }
    return null;
  },
  coucher(where, q, I) {
    this.ctx = { where, q, I, x: q.x, z: q.z };
    game.trySleep(where);
  },
  // le contexte d'un coucher (valable si l'on est encore près du lit)
  prendreCtx(where) {
    const c = this.ctx, p = game.player;
    this.ctx = null;
    if (!c || c.where !== where || Math.hypot(c.x - p.pos[0], c.z - p.pos[2]) > 5) return null;
    return c;
  },
  // réveil : ce que la mentalité en pense (un vrai lit vaut celui de l'auberge)
  pourEsprit(where) {
    if (where === 'location' || where === 'lit' || where === 'geant') return 'auberge';
    return where;
  },
  apres(where, c) {
    this.reveille();
    const S = this.S(), s = farm.s;
    S.nuits = (S.nuits || 0) + 1;
    S.dernier = { jour: s.day, ou: where };
    if (c && c.I) {
      const I = c.I;
      if (I.matin) setTimeout(() => this.decouvert(I.matin, I, 'matin'), 2400);
      else if (I.cat === 'mort') { if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2, 'le lit d’un mort', 4); setTimeout(() => ui.subtitle('', `(Le lit de ${I.n.name}. Les draps ont gardé son odeur. Personne n’y dormira plus.)`, 5), 2600); }
      else if (I.cat === 'geant') setTimeout(() => ui.subtitle('', '(Vous avez dormi dans un pli de la fourrure, comme un enfant dans le manteau de son père. Ça sentait la fumée et la bête.)', 5), 2600);
      else if (I.cat === 'conjoint') setTimeout(() => ui.subtitle('', `(Chez ${I.n.name}, dans ses draps. Vous avez bien dormi.)`, 4), 2600);
    }
    if (where === 'ferme' && typeof sentiments !== 'undefined' && sentiments.conjoint) {
      const cj = sentiments.conjoint();
      if (cj && Math.random() < 0.5) setTimeout(() => { if (!game.dying && !ui.panel) ui.subtitle('', `(${cj.name} s’est levé${cj.d.gender === 'f' ? 'e' : ''} sans vous réveiller. Sa place est encore tiède.)`, 4.5); }, 5200);
    }
  },
  // l'habitant rentre et vous trouve : on se réveille en pleine nuit
  async interrompu(where, c) {
    const w = game.world, p = game.player, s = farm.s, I = c.I, n = I.n;
    game.sleeping = true;
    ui.close(true);
    await ui.fade(true, '', 1100);
    try {
      const h0 = npcs.hour(), dh = Math.max(0.25, I.arrivee - h0);
      game.skipHours(dh);
      w.time = (I.arrivee % 24) / 24; game.lastT = w.time;
      npcs.snap(w);
      p.hp = Math.min(100, p.hp + 5 * dh); p.stamina = Math.max(p.stamina, 0.6);
      this.reveille(dh * 1.5);
      $('#fade-text').textContent = '';
      await new Promise((r) => setTimeout(r, 700));
    } catch (e) { console.error(e); }
    await ui.fade(false, '', 600);
    game.sleeping = false;
    this.decouvert(n, I, 'nuit');
  },
  // la scène : l'habitant (ou sa mère) vous trouve ; amitié, souvenir, intrusion ; et dehors
  decouvert(n, I, quand) {
    if (!n || !n.st.alive || game.dying) return;
    const w = game.world, p = game.player, B = w.bld[I.bld];
    let qui = n, txt;
    const mere = n.id === 'fillette' && npcs.alive('boulangere') && npcs.byId.boulangere.d.home === I.bld ? npcs.byId.boulangere : null;
    if (mere) { qui = mere; txt = LIT_DECOUVERT.enfant; }
    else if (n.id === 'garde') txt = LIT_DECOUVERT.garde;
    else if (npcs.level(n) >= 6) txt = pick(LIT_DECOUVERT.ami);
    else txt = pick(quand === 'matin' ? LIT_DECOUVERT.matin : LIT_DECOUVERT.autre);
    // il est là, au pied du lit
    const q = I.q || null, bx = q ? q.x : p.pos[0], bz = q ? q.z : p.pos[2];
    const m = B && w.nav.nodes[B.nMid];
    if (m) { qui.x = m.x; qui.z = m.z; qui.y = B.y; }
    qui.state = 'idle'; qui.inside = I.bld; qui.heading = Math.atan2(p.pos[0] - qui.x, p.pos[2] - qui.z); qui.move = 0; qui.path = []; qui.pi = 0;
    npcs.say(qui, txt, 4.5);
    const ami = npcs.level(qui) >= 6 && !mere;
    npcs.addAmitie(qui, ami ? -15 : mere ? -60 : -45);
    npcs.remember(qui, 'lit', { quand });
    if (!ami) {
      try { if (typeof societe !== 'undefined' && societe.crime && CRIME_DEF.intrusion) societe.crime({ type: 'intrusion', victime: qui.id, x: bx, z: bz, temoins: [qui.id] }); } catch (e) { console.error(e); }
      if (typeof esprit !== 'undefined' && esprit.changer) esprit.changer(-2, 'honte', 4);
    }
    // dehors, devant la porte
    setTimeout(() => {
      if (game.dying || !B) return;
      ui.fade(true, '', 500).then(() => {
        const o = w.nav.nodes[B.nOut] || { x: B.out[0], z: B.out[1] };
        p.pos = [o.x, w.groundAt(o.x, o.z, B.y + 1, 0.8), o.z]; p.vel = [0, 0, 0];
        const dr = w.doors[B.door];
        if (dr) { dr.open = 0; dr.a = 0; const h = npcs.hour(); if (h >= 20.5 || h < 6) dr.locked = true; }
        ui.subtitle('', ami ? '(Vous voilà sur le pas de la porte, les cheveux en bataille.)' : '(La porte claque dans votre dos. Un verrou. Puis plus rien.)', 4);
        ui.fade(false, '', 700);
      });
    }, 4300);
  },
};

// ---------------------------------------------------------------- l'étrange suit la fatigue
{
  const _biz = bizarrerie;
  bizarrerie = function () { const b = _biz(); try { return b * (1 + 0.5 * sommeil.k()); } catch (e) { return b; } };
}
// quand on est fatigué, les coups durs pèsent plus lourd sur la mentalité
if (typeof esprit !== 'undefined' && esprit.changer) {
  const _ch = esprit.changer.bind(esprit);
  esprit.changer = function (delta, raison, plafond) {
    if (delta < 0 && raison !== 'fatigue' && farm.s) { const st = sommeil.stade(); if (st >= 2) delta *= [1, 1, 1.2, 1.4, 1.6][st]; }
    return _ch(delta, raison, plafond);
  };
}
// la chambre de l'auberge se loue aussi le jour (on peut dormir de jour)
{
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    if (act === 'rent' && this.n && this.n.d.id === 'aubergiste' && farm.s) {
      const h = npcs.hour();
      if (h > 5 && h < 18) {
        if (!farm.pay(20)) return this.view('Vingt pièces, même en plein jour. Et je ne fais pas crédit.', this.options());
        farm.s.flags.rented = farm.s.day; sound.coin && sound.coin();
        return this.view('En plein jour ? … Chacun ses heures. Vingt pièces, et je vous tire les rideaux. Le lit du fond est à vous.', this.options());
      }
    }
    return _choose(act);
  };
}

// ---------------------------------------------------------------- branchements
// dormir à toute heure : la version de base passe avant tous les emballages (bibliothèque…)
HOOKS.load.unshift(() => {
  if (game._m95Base) return;
  game._m95Base = true;
  game.trySleep = function (where) {
    const h = npcs.hour();
    if (h >= 6 && h < 18.5) {
      const c = sommeil.ctx;
      ui.choice('Dormir', 'Il fait jour. Si vous vous couchez maintenant, vous ne vous réveillerez que demain matin, à six heures.', [
        { label: 'Dormir jusqu’à demain matin', fn: () => { ui.close(true); sommeil.ctx = c; this.sleep(where); } },
        { label: 'Pas maintenant', fn: () => { sommeil.ctx = null; ui.close(); } },
      ]);
      return;
    }
    this.sleep(where);
  };
});
HOOKS.load.push((saved) => {
  sommeil.lits = null; sommeil.nProps = -1; sommeil.ctx = null; sommeil.lastH = null; sommeil.lastSt = null;
  sommeil.blink = 0; sommeil.blinkPh = 0; sommeil.ferme = 0; sommeil.flou = 0; sommeil.vignette = 0;
  if (farm.s) { if (!saved) farm.s.sommeil = null; sommeil.S(); sommeil.stadePrev = sommeil.stade(); }
  sommeil.listerLits();
  sommeil.paupieres();
  if (game._m95) return;
  game._m95 = true;
  // le sommeil (par-dessus tous les autres emballages : cauchemars, rêves, prison…)
  const _sleep = game.sleep.bind(game);
  game.sleep = async function (where) {
    if (this.sleeping || this.dying || !farm.s) return _sleep(where);
    const s0 = farm.s, d0 = s0.day, c = sommeil.prendreCtx(where);
    if (c && c.I && c.I.arrivee) return sommeil.interrompu(where, c);
    const r = await _sleep(where);
    try { if (farm.s === s0 && farm.s.day > d0 && !game.dying) sommeil.apres(where, c); } catch (e) { console.error(e); }
    return r;
  };
  // plus d'évanouissement à trois heures du matin : la fatigue a pris sa place
  sommeil._faint = game.faint.bind(game);
  game.faint = function () { return undefined; };
  // le réveil vu par la mentalité : un lit loué ou prêté vaut celui de l'auberge
  if (typeof esprit !== 'undefined' && esprit.reveil) {
    const _rv = esprit.reveil.bind(esprit);
    esprit.reveil = function (where, ...a) { return _rv(sommeil.pourEsprit(where), ...a); };
  }
});
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || game.kind !== 'farm') return;
  sommeil.update(dt, eye, basis, sky, playing);
  const t = game.target;
  if (t && t.kind === 'hook' && t.lit) game.hiProp = t.lit;
});
HOOKS.fx.push((fx) => { if (sommeil.vignette > 0) fx[0] = Math.max(fx[0], sommeil.vignette); });
// E sur un lit : « Dormir ici »
HOOKS.target.push((eye, f, cand) => {
  if (!farm.s || !sommeil.lits) return;
  const w = game.world;
  for (const L of sommeil.lits) {
    const q = L.q;
    if (L.aInter || q.gone) continue;
    const T = LIT_TAILLE[q.id], R = Math.max(T[0], T[1]) + 2.6;
    if (Math.abs(q.x - eye[0]) > R || Math.abs(q.z - eye[2]) > R) continue;
    // point du lit le plus proche du regard
    const [lx, lz] = World.blockLocal({ x: q.x, z: q.z, r: q.r }, eye[0], eye[2]);
    const cx = clamp(lx, -T[0] + 0.15, T[0] - 0.15), cz = clamp(lz, -T[1] + 0.15, T[1] - 0.15);
    const [wx, wz] = World.blockToWorldDir({ r: q.r }, cx, cz);
    const px = q.x + wx, pz = q.z + wz, py = q.y + T[2];
    const dx = px - eye[0], dy = py - eye[1], dz = pz - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > 2.7) continue;
    if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.62) continue;
    const bh = w.raycastBlocks(eye, [dx / d, dy / d, dz / d], d - 0.35);
    if (bh && !bh.block.hidden) continue;
    cand({ kind: 'hook', lit: q, use: () => sommeil.litE(q) }, d + 0.3);
  }
});

// ---------------------------------------------------------------- modèles : coffre de la maison louée, écriteau « À louer »
Object.assign(PROP_MODELS, {
  coffre_loc(E) {
    E.bx(0, 0, 0, 0.9, 0.48, 0.56, WHITE, tx(TL.wood, TL.chest)); E.bx(0, 0.48, 0, 0.94, 0.14, 0.6, WHITE, TL.darkwood);
    for (const x of [-0.3, 0.3]) E.bx(x, 0, 0, 0.06, 0.63, 0.61, PC.iron, TL.iron);
    E.bx(0, 0.28, 0.29, 0.1, 0.13, 0.04, rgbf('#3a3a40'), TL.iron); E.bx(0, 0.37, 0.305, 0.06, 0.06, 0.02, rgbf('#6a6a72'), TL.iron);
  },
  ecriteau_louer(E, o) {
    E.bx(0, 0, 0, 0.09, 1.72, 0.09, WHITE, TL.darkwood); E.bx(0, 1.6, 0.18, 0.06, 0.06, 0.42, WHITE, TL.darkwood);
    E.bx(-0.2, 1.1, 0.34, 0.012, 0.5, 0.012, rgbf('#555'), TL.iron); E.bx(0.2, 1.1, 0.34, 0.012, 0.5, 0.012, rgbf('#555'), TL.iron);
    E.bx(0, 0.86, 0.34, 0.62, 0.34, 0.035, [1.12, 1.02, 0.94], tx(TL.wood, TL.sign));
    const loue = o.data && o.data.loc && typeof locations !== 'undefined' && locations.locataire(o.data.loc);
    if (loue) E.box(0, 1.03, 0.36, 0.66, 0.08, 0.012, rgbf('#8a2a22'), TL.plain, 0, 0, 0.28);
  },
});
Object.assign(PROP_COLL, { coffre_loc: [0.45, 0.28, 0.62], ecriteau_louer: [0.08, 0.08, 1.7] });

// ============================================================================
//  GÉNÉRATION (après tout le reste de la vallée, tirage propre) : la maison du
//  Rempart, coffres et écriteaux des trois maisons à louer, la poterne du mur est
// ============================================================================
// segment [a, b] coupe-t-il le rectangle (repère f, demi-côtés hw, hd) ?
function m95SegRect(f, hw, hd, ax, az, bx, bz) {
  const [x0, z0] = World.blockLocal(f, ax, az), [x1, z1] = World.blockLocal(f, bx, bz);
  let t0 = 0, t1 = 1;
  const dx = x1 - x0, dz = z1 - z0;
  for (const [p, q] of [[-dx, x0 + hw], [dx, hw - x0], [-dz, z0 + hd], [dz, hd - z0]]) {
    if (Math.abs(p) < 1e-9) { if (q < 0) return false; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
  }
  return t0 <= t1;
}
function m95Libre(w, f, hw, hd, y0) {
  for (let lz = -hd; lz <= hd + 0.01; lz += 1) for (let lx = -hw; lx <= hw + 0.01; lx += 1) {
    const c = Math.cos(f.r), s = Math.sin(f.r), x = f.x + lx * c + lz * s, z = f.z - lx * s + lz * c;
    if (Math.abs(w.heightAt(x, z) - y0) > 0.35 || !pointFree(w, x, z, 0.3)) return false;
    let obj = false;
    w.query(x, z, 1.2, (o) => { if (!o.gone && Math.hypot(o.x - x, o.z - z) < 1.0) obj = true; }, null);
    if (obj) return false;
  }
  return true;
}
function m95Generer(w, seed) {
  const T = w.townInfo;
  if (!T || !w.bld || !w.bld.vide4) return;
  const rnd = mulberry32((((seed | 0) * 977) + 53) >>> 0);
  const B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
  const y0 = w.heightAt(T.x, T.z), N = w.nav;
  w.grid = null;
  // ------------------------------------------------ la maison du Rempart (au nord-est, entre le garde et le rempart)
  let maison = null;
  for (const [lx, lz] of [[22, -37], [21, -36.5], [23, -37.5], [20, -37], [22, -35.5]]) {
    const f = { x: T.x + lx, y: y0, z: T.z + lz, r: Math.PI };
    if (!m95Libre(w, f, 5.2, 4.7, y0)) continue;
    const n0 = N.nodes.length;
    maison = B.building('maison_rempart', f, 8, 7, { floors: 2, wall: M_STONE, win: M_STONEWIN, roof: M_SLATE, chimney: true, roofH: 3, noLight: true }, function (bf, W, D, B2) {
      this.furnishHome(bf, W, D, B2, { bedCol: '#6a4a7a', shelf: 'livres' });
    });
    // les chemins qui traversaient la parcelle
    N.edges = N.edges.filter(([a, b, fl]) => fl || a >= n0 || b >= n0 || !m95SegRect(f, 4.6, 4.1, N.nodes[a].x, N.nodes[a].z, N.nodes[b].x, N.nodes[b].z));
    for (const [px, pz] of [[-2.6, -4.2], [2.6, -4.2]]) B.propRel(f, 'pot_fleurs', px, 0, pz, 0);
    break;
  }
  // ------------------------------------------------ coffres et écriteaux des maisons à louer
  w.locations = {};
  for (const key of LOC_CLES) {
    const Bk = w.bld[key];
    if (!Bk || !Bk.f) continue;
    const f = Bk.f, W = Bk.W, D = Bk.D;
    const coffre = B.propRel(f, 'coffre_loc', -W / 2 + 2.05, 0.15, D / 2 - 0.62, Math.PI, { loc: key });
    const panneau = B.propRel(f, 'ecriteau_louer', 1.55, 0, -D / 2 - 0.62, Math.PI, { loc: key });
    const it = B.interRel(f, 'louer', 'louer_' + key, 1.55, 1.15, -D / 2 - 0.62, 'Lire l’écriteau', { maison: key });
    w.locations[key] = { coffre: [coffre.x, coffre.y, coffre.z], ecriteau: [it.x, it.y, it.z], door: Bk.door };
  }
  // ------------------------------------------------ la poterne : une porte basse dans le mur est
  try { m95Poterne(w, T, y0); } catch (e) { console.error('poterne', e); }
  // ------------------------------------------------ le réseau des chemins (îlots repartis de zéro, villages habités)
  if (maison) {
    for (const q of N.nodes) delete q.iso;
    finalizeNav(w);
    const seen = new Set();
    for (let i = 0; i < N.nodes.length; i++) {
      if (!/^village:/.test(N.nodes[i].tag)) continue;
      const Q = [i]; seen.add(i);
      while (Q.length) { const c = Q.shift(); N.nodes[c].iso = false; for (const e of N.adj[c]) if (!seen.has(e.to)) { seen.add(e.to); Q.push(e.to); } }
    }
  }
  w.objectsDirty = true; w.grid = null; w.blocksDirty = true; w.coverDirty = true; w.shadeDirty = true;
}
// la poterne : le segment de rempart est découpé (deux morceaux, un linteau, un seuil) et encadré de pierre
function m95Poterne(w, T, y0) {
  const X = T.x + 46, cible = T.z + 4.4;
  const b = w.blocks.find((q) => q.m === M_STONE && Math.abs(q.x - X) < 0.08 && Math.abs(Math.abs(q.r) - Math.PI / 2) < 0.02 && q.sy > 7 && q.sz > 1.1 && q.sz < 1.3 && Math.abs(q.z - cible) < q.sx / 2 - 1.4);
  if (!b) return;
  const ow = 1.2, oh = 2.2, zc = cible;
  // repère du bloc : u (x local) va vers -z monde
  const z0 = b.z, u0 = z0 - zc, uA = -b.sx / 2, uB = b.sx / 2, top = b.y + b.sy, zOf = (u) => z0 - u;
  const piece = (ua, ub, y, sy, m, dz, sz, dx) => ({ x: b.x + (dx || 0), y, z: zOf((ua + ub) / 2) + (dz || 0), sx: ub - ua, sy, sz: sz || b.sz, r: b.r, m: m ?? b.m, sh: b.sh || 0 });
  const droite = piece(u0 + ow / 2, uB, b.y, b.sy);
  Object.assign(b, piece(uA, u0 - ow / 2, b.y, b.sy));
  w.blocks.push(droite);
  w.blocks.push(piece(u0 - ow / 2 - 0.01, u0 + ow / 2 + 0.01, y0 + oh, top - (y0 + oh)));     // linteau (jusqu'au chemin de ronde)
  w.blocks.push(piece(u0 - ow / 2 - 0.01, u0 + ow / 2 + 0.01, b.y, y0 + 0.02 - b.y));        // seuil et fondation
  // encadrement : pierres de taille moussues côté douves, montants et linteau de bois côté ville
  const out = b.sz / 2 + 0.05, inn = -b.sz / 2 - 0.05;
  w.blocks.push(piece(u0 - ow / 2 - 0.34, u0 - ow / 2, y0 - 0.9, oh + 0.9, M_MOSSY, 0, 0.12, out));
  w.blocks.push(piece(u0 + ow / 2, u0 + ow / 2 + 0.34, y0 - 0.9, oh + 0.9, M_MOSSY, 0, 0.12, out));
  w.blocks.push(piece(u0 - ow / 2 - 0.4, u0 + ow / 2 + 0.4, y0 + oh, 0.42, M_MOSSY, 0, 0.14, out));
  w.blocks.push(piece(u0 - ow / 2 - 0.22, u0 - ow / 2, y0, oh, M_LOGS, 0, 0.12, inn));
  w.blocks.push(piece(u0 + ow / 2, u0 + ow / 2 + 0.22, y0, oh, M_LOGS, 0, 0.12, inn));
  w.blocks.push(piece(u0 - ow / 2 - 0.3, u0 + ow / 2 + 0.3, y0 + oh, 0.2, M_LOGS, 0, 0.14, inn));
  // la porte, au nu intérieur du mur ; elle s'ouvre vers la ville
  const d = { x: b.x - b.sz / 2 + 0.045, y: y0 + 0.03, z: zc, r: -Math.PI / 2, w: 1.14, h: 2.12, a: 0, open: 0, locked: true, bld: null, poterne: true };
  w.doors.push(d);
  w.poterne = { door: w.doors.length - 1, x: d.x, z: d.z, y: y0, dehors: [b.x + b.sz / 2 + 0.7, zc], dedans: [b.x - b.sz / 2 - 1.2, zc] };
  const Lm = w.lm || (w.lm = {});
  Lm.poterne = { key: 'poterne', name: LIEU_NAMES.poterne, x: d.x, z: d.z, y: y0, r: 4 };
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w && w.designed && w.townInfo) { try { m95Generer(w, w.seed || seed); } catch (e) { console.error('sommeil : génération', e); } }
    return w;
  };
}
