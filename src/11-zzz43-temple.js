// ============================================================================
//  LE TEMPLE SOUS LA MONTAGNE
//  On y entre derrière la cascade où naît la rivière (« temple_entree »). La
//  porte des Trois (le bloc marqué templeDoor) ne s'ouvre qu'en touchant les
//  trois pierres dans l'ordre du jour : Aëla (l'aube), Durn (le sommeil), Vesh
//  (la nuit). Mauvais ordre : un grondement, tout s'éteint, on recommence (et la
//  voûte finit par se fâcher). L'ouverture est une cinématique ; elle est
//  sauvegardée et réappliquée au chargement.
//  Dedans : l'autel d'Aëla (prières, offrandes, malédictions levées), l'autel
//  noir de Vesh (pactes), le Dormeur (le réveiller est une très mauvaise idée),
//  le tombeau des Aëlim (on le lit ; le piller attire l'ombre), les coffres
//  (voler, c'est se maudire ; on peut rendre), le bassin (eau lustrale), les
//  cristaux qui chantent. État sauvegardé : farm.s.temple.
// ============================================================================
const TPL_ORDRE = ['aela', 'durn', 'vesh'];
const TPL_VER_OUVERT = 1 << 27; // une « version du monde » qui n'est jamais affichée : la porte disparaît
const TPL_TOMBEAU = ['o ta , hem na-aelim teh sae , dal nai tora', 'Ô toi : un homme des Aëlim dort ici. N’ouvre pas la porte.'];

const temple = {
  seq: [], erreurs: 0, anim: null, yeux: 0, cristaux: [], _porte: null,
  S() {
    const s = farm.s;
    const S = s.temple || (s.temple = {});
    if (typeof S.ouvert !== 'number') S.ouvert = 0;
    return S;
  },
  ouvert() { return !!(farm.s && this.S().ouvert); },
  porte() {
    const w = game.world;
    if (!w) return null;
    if (this._porte && w.blocks.includes(this._porte)) return this._porte;
    return (this._porte = w.blocks.find((b) => b.templeDoor) || null);
  },
  pierres() { return game.world.props.filter((q) => q.id === 'pierre_trois'); },
  allumer(k, on) {
    for (const q of this.pierres()) if (!k || (q.data && q.data.k === k)) q.data = Object.assign({}, q.data || {}, { lit: !!on });
    farm.dirtyProps = true;
  },
  cacherPorte(cache) {
    const b = this.porte(), w = game.world;
    if (!b) return;
    if (cache) b.ver = TPL_VER_OUVERT; else delete b.ver;
    w.grid = null; w.blocksDirty = true; w.coverDirty = true;
    if (!w.shadeDirty) { w.shadeDirty = true; w.shadeRegion = [b.x - 8, b.z - 8, b.x + 8, b.z + 8]; }
  },
  // ------------------------------------------------------------ au chargement : la porte reste ouverte, les pierres allumées
  appliquer() {
    this.seq = []; this.erreurs = 0; this.anim = null; this.yeux = 0; this._porte = null;
    const w = game.world;
    if (!w || !w.temple) return;
    const o = this.ouvert();
    this.cacherPorte(o);
    this.allumer(null, o);
    const T = w.temple;
    this.cristaux = w.props.filter((q) => q.id === 'cristal_lumineux' && Math.hypot(q.x - T.x, q.z - T.z) < 110 && Math.abs(q.y - T.y) < 12);
    // la sortie (au pied de la cascade) : posée au niveau du sol, pas en l'air au-dessus du bassin
    // (le même tableau sert à l'échelle du vestibule : on le corrige sur place)
    const X = T.exit;
    if (X && !X._sol) { X._sol = true; X[1] = Math.max(w.heightAt(X[0], X[2]), w.waterLevel - 0.5) + 0.1; }
  },

  // ------------------------------------------------------------ l'entrée, derrière la cascade
  entrer(it) {
    const w = game.world, S = this.S(), s = farm.s;
    if (!w.temple) return;
    const premier = !S.vu;
    S.vu = S.vu || s.day;
    savoir.connaitreLieu('temple');
    game.teleport(w.temple.arrive, premier ? 'Derrière le rideau d’eau, un escalier descend dans le noir.' : '');
    void it;
  },
  // ------------------------------------------------------------ les trois pierres
  toucher(it) {
    const k = it.data && it.data.k;
    if (!TPL_ORDRE.includes(k)) return;
    if (this.ouvert()) return;
    if (this.seq.includes(k)) return;
    const attendu = TPL_ORDRE[this.seq.length];
    if (k === attendu) {
      this.seq.push(k); this.allumer(k, true);
      this.note(k);
      if (this.seq.length === 3) setTimeout(() => this.ouvrir(true), 1500);
      return;
    }
    // mauvais ordre : un grondement, tout s'éteint
    this.erreurs++; this.seq = []; this.allumer(null, false);
    sound.rumble && sound.rumble(); game.shakeT = Math.max(game.shakeT || 0, 0.7);
    const p = game.player.pos;
    for (let i = 0; i < 14; i++) particles.spawn(p[0] + (Math.random() - 0.5) * 8, p[1] + 5 + Math.random() * 2, p[2] + (Math.random() - 0.5) * 8, 0, -1, 0, [0.6, 0.58, 0.52, 0.8], 0.06, 2, 6, false);
    if (this.erreurs >= 3) {
      this.erreurs = 0;
      setTimeout(() => { sound.impact && sound.impact('hard'); play.hurt(14, null, 'Écrasé par une pierre tombée de la voûte du temple'); ui.subtitle('', '(Une pierre se détache de la voûte.)', 3); }, 900);
    }
  },
  note(k) {
    if (!sound.ok) return;
    const f = { aela: 660, durn: 196, vesh: 311 }[k], t = sound.at(), out = sound.lp(2400, sound.amb);
    sound.tone(t, 'sine', f, f, 2.2, 0.07, out, 0.02); sound.tone(t, 'sine', f * 2, f * 2, 1.6, 0.02, out, 0.02);
  },
  // la porte s'ouvre (avec la cinématique, ou d'un coup au chargement)
  ouvrir(scene) {
    const S = this.S();
    if (S.ouvert) return;
    S.ouvert = farm.s.day;
    this.allumer(null, true);
    savoir.apprendreMots('aelin', ['dal', 'tor', 'ithim']);
    if (typeof evenements !== 'undefined') evenements.retenir('temple');
    if (scene && typeof cinematiques !== 'undefined') cinematiques.templeOuverture();
    else { this.cacherPorte(true); }
  },
  // l'animation de la porte qui s'enfonce (dessinée pendant que le bloc est caché)
  animer() {
    const b = this.porte();
    if (!b) return;
    this.anim = { t: 0, dur: 4.2, b: { x: b.x, y: b.y, z: b.z, sx: b.sx, sy: b.sy, sz: b.sz, r: b.r || 0, m: b.m } };
    this.cacherPorte(true);
    sound.rumble && sound.rumble(); setTimeout(() => sound.rumble && sound.rumble(), 1800);
  },
  draw(buf, sbuf, cam, t) {
    const A = this.anim;
    if (A) {
      const k = clamp(A.t / A.dur, 0, 1), drop = k * k * (A.b.sy + 0.3), B = A.b;
      PE.buf = buf; PE.fl = 0; PE.frame(B.x, B.y, B.z, B.r, 1);
      PE.bx(0, -drop, 0, B.sx, B.sy, B.sz, WHITE, mt(B.m));
    }
    // les yeux du Dormeur, quand on l'a réveillé
    if (this.yeux > 0) {
      const q = game.world.props.find((p) => p.id === 'dormeur');
      if (q) { PE.buf = buf; PE.fl = FX_EMIT; PE.frame(q.x, q.y, q.z, q.r, 1); const c = [2.2 * this.yeux, 1.3 * this.yeux, 0.4 * this.yeux]; PE.bx(-0.55, 2.55, 8.42, 0.4, 0.2, 0.06, c, TL.plain); PE.bx(0.55, 2.55, 8.42, 0.4, 0.2, 0.06, c, TL.plain); PE.fl = 0; }
    }
  },
  update(dt, eye) {
    const A = this.anim;
    if (A) {
      A.t += dt;
      if (Math.random() < dt * 30 && A.t < A.dur) { const B = A.b, u = (Math.random() - 0.5) * B.sx, c = Math.cos(B.r), s = Math.sin(B.r); particles.spawn(B.x + u * c, B.y + 0.1, B.z - u * s, (Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 0.6, (Math.random() - 0.5) * 0.6, [0.6, 0.58, 0.52, 0.6], 0.2, 1.8, 0.2, false); }
      if (A.t > A.dur) this.anim = null;
    }
    // l'ambiance : sous la montagne, quelque chose respire
    const w = game.world, p = game.player;
    if (!w.temple || !p.underground || Math.hypot(p.pos[0] - w.temple.x, p.pos[2] - w.temple.z) > 110) return;
    this.ambT = (this.ambT || 5) - dt;
    if (this.ambT <= 0 && sound.ok) {
      this.ambT = 9 + Math.random() * 14;
      const r = Math.random();
      if (r < 0.45) sound.voice(sound.at(), 'sine', 52, 49, 5, 0.05, sound.lp(220, sound.amb));
      else if (r < 0.8) sound.drip && sound.drip();
      else { sound.voice(sound.at(), 'sine', 180, 176, 3.5, 0.012, sound.lp(900, sound.amb)); sound.voice(sound.at(0.2), 'sine', 270, 266, 3.3, 0.008, sound.lp(900, sound.amb)); }
    }
  },

  // ------------------------------------------------------------ le Dormeur
  dormeur(it) {
    ui.choice('Le Dormeur', 'Une statue couchée, longue de quatorze mètres. La pierre de sa poitrine se soulève, très lentement : une fois, peut-être, dans la journée. Personne ne sait depuis quand il dort.', [
      { label: 'Le laisser dormir', fn: () => ui.close() },
      { label: 'Poser la main sur la pierre', fn: () => this.toucherDormeur() },
      { label: 'L’appeler par son nom', fn: () => ui.choice('Réveiller le Dormeur ?', 'Les nains l’ont dit, les livres aussi : on ne réveille pas Durn. Il n’aime pas qu’on le réveille.', [
        { label: 'Crier son nom : « Durn ! »', fn: () => { ui.close(true); divins.reveil(); } },
        { label: 'Non. Le laisser dormir.', fn: () => ui.close() },
      ]) },
    ]);
    void it;
  },
  toucherDormeur() {
    const S = this.S(), s = farm.s;
    ui.close();
    sound.heartbeat && sound.heartbeat(0.35);
    setTimeout(() => sound.heartbeat && sound.heartbeat(0.25), 2600);
    if (farm.count('cendre_sacree') && S.durnDon !== s.day) {
      farm.take('cendre_sacree', 1);
      S.durnDon = s.day; BUFF.add('pierre', 24);
      divins.parler('durn', 'durn_don', 3500);
      return;
    }
  },

  // ------------------------------------------------------------ le tombeau des Aëlim
  tombeau(it) {
    const S = this.S();
    const opts = [{ label: 'Lire l’inscription', fn: () => { const L = divins.comprendre(TPL_TOMBEAU[0], TPL_TOMBEAU[1]); ui.read('Le tombeau', `Gravé en Hautes Lettres, de haut en bas :\n\n« ${TPL_TOMBEAU[0]} »${L ? `\n\n(« ${L} »)` : ''}`, 'Sur la dalle, une main ouverte, sculptée.'); } }];
    if (!S.pille) opts.push({ label: 'Faire glisser la dalle', fn: () => this.piller(it) });
    if (S.pille && malediction.cause('ombre') === 'tombeau' && farm.count('couronne_aelim')) opts.push({ label: 'Remettre le diadème à sa place', fn: () => this.rendreTombeau() });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice('Le tombeau', S.pille ? 'La dalle a été poussée. Dedans, un corps très ancien, enveloppé de lin gris. Il manque quelque chose, sur son front.' : 'Une longue dalle de pierre, scellée. Des lettres anguleuses courent sur le bord. Rien n’y a été touché depuis des siècles.', opts);
  },
  piller(it) {
    const S = this.S();
    ui.close(true);
    S.pille = farm.s.day;
    sound.impact && sound.impact('hard'); sound.rumble && sound.rumble();
    const pos = [it.x, it.y + 0.4, it.z];
    for (const [k, n] of [['couronne_aelim', 1], ['bijou', 2], ['vieille_piece', 5]]) { farm.give(k, n); play.flyer(k, pos, n); }
    setTimeout(() => malediction.frapper('ombre', 'tombeau'), 2500);
  },
  rendreTombeau() {
    const S = this.S();
    ui.close(true);
    if (!farm.take('couronne_aelim', 1)) return;
    S.pille = 0;
    setTimeout(() => malediction.lever('tombeau'), 2500);
  },

  // ------------------------------------------------------------ les coffres : voler, c'est se maudire
  coffre(it) {
    const s = farm.s, last = s.looted[it.id], vide = last !== undefined && s.day - last < 3, or = it.data.table === 'temple_or';
    const opts = [];
    if (!vide) opts.push({ label: 'Prendre', fn: () => { ui.close(true); game.lootBox(it); this.S().vols = (this.S().vols || 0) + 1; setTimeout(() => malediction.frapper(or ? 'poids' : 'malchance', 'temple'), 1200); } });
    if (malediction.liste().some((k) => malediction.cause(k) === 'temple')) opts.push({ label: 'Rendre ce qui a été pris', fn: () => this.rendre(it) });
    opts.push({ label: 'Laisser', fn: () => ui.close() });
    ui.choice(or ? 'Le trésor des Trois' : 'Un coffre du temple', vide ? 'Le coffre est vide. Quelqu’un est déjà passé.' : 'De l’or, des pierres, des choses données aux Trois il y a très longtemps. Rien ne vous empêche de les prendre. Rien, sinon ce qui regarde.', opts);
  },
  rendre(it) {
    ui.close(true);
    const k = ['lingot_or', 'couronne_aelim', 'gemme', 'bijou'].find((x) => farm.count(x));
    if (k) farm.take(k, Math.min(farm.count(k), 2));
    else if (!farm.pay(300)) { ui.subtitle('', '(Ni ce qui a été pris, ni de quoi le remplacer.)', 3.5); return; }
    puffAt(it.x, it.y, it.z, [220, 200, 140], 8, 1, true);
    ui.subtitle('', k ? `(Vous remettez ${itemName(k).toLowerCase()}.)` : '(Trois cents pièces, faute de mieux.)', 3);
    setTimeout(() => malediction.lever('temple'), 1800);
  },

  // ------------------------------------------------------------ le bassin, les cristaux
  bassin() {
    const S = this.S(), s = farm.s, p = game.player;
    const opts = [{ label: 'Boire dans le creux de la main', fn: () => {
      ui.close();
      p.hp = Math.min(100, p.hp + 20); p.food = Math.min(100, p.food + 5);
      if (S.bu !== s.day) { S.bu = s.day; if (!malediction.leverPetites(true)) ui.subtitle('', '(Une eau si froide qu’elle brûle.)', 3); else ui.subtitle('', '(Quelque chose de lourd s’en va.)', 3.5); }
      else ui.subtitle('', '(Elle a déjà donné, aujourd’hui.)', 3);
      sound.pour && sound.pour();
    } }];
    if (farm.count('fiole')) opts.push({ label: 'Remplir une fiole', fn: () => {
      ui.close();
      if (S.fiole === s.day) { ui.subtitle('', '(L’eau refuse la fiole. Une par jour.)', 3); return; }
      S.fiole = s.day; farm.take('fiole', 1); farm.give('eau_lustrale', 1); play.flyer('eau_lustrale', p.eyePos(), 1); sound.pour && sound.pour();
    } });
    opts.push({ label: 'Partir', fn: () => ui.close() });
    ui.choice('Le bassin sacré', 'Une eau immobile, si claire qu’on voit les lettres gravées au fond. Des poissons pâles y tournent sans bruit.', opts);
  },
  cristal(q) {
    const S = this.S();
    if (sound.ok) { const f = 520 + ((Math.abs(q.x * 13 + q.z * 7) | 0) % 7) * 70, t = sound.at(), out = sound.lp(3000, sound.amb); sound.tone(t, 'sine', f, f, 3, 0.05, out, 0.01); sound.tone(t, 'sine', f * 1.5, f * 1.5, 2.2, 0.015, out, 0.01); }
    if (!S.cristal) { S.cristal = 1; savoir.apprendreMots('aelin', ['lira']); }
  },
};

// ---------------------------------------------------------------- interactions
HOOKS.inter.temple_entree = (it) => temple.entrer(it);
HOOKS.inter.pierre_trois = (it) => temple.toucher(it);
HOOKS.inter.autel_aela = (it) => divins.autelAela(it);
HOOKS.inter.autel_vesh = (it) => divins.autelVesh(it);
HOOKS.inter.dormeur = (it) => temple.dormeur(it);
HOOKS.inter.tombeau = (it) => temple.tombeau(it);
{
  const _lp = HOOKS.interPre.loot;
  HOOKS.interPre.loot = (it) => { if (it.data && it.data.temple) { temple.coffre(it); return true; } return _lp ? _lp(it) : false; };
}
// le bassin et les cristaux (touche E)
HOOKS.target.push((eye, f, cand) => {
  const w = game.world, p = game.player;
  if (!w.temple || !p.underground || Math.hypot(eye[0] - w.temple.x, eye[2] - w.temple.z) > 100) return;
  const P = (w.pools || []).find((q) => q.kind === 'temple');
  if (P && f[1] < -0.25) {
    const dx = eye[0] - P.x, dz = eye[2] - P.z;
    if (Math.abs(dx) < P.w / 2 + 1.6 && Math.abs(dz) < P.d / 2 + 1.6) cand({ kind: 'hook', use: () => temple.bassin() }, 2.2);
  }
  for (const q of temple.cristaux) {
    const dx = q.x - eye[0], dy = q.y + 0.8 - eye[1], dz = q.z - eye[2], d = Math.hypot(dx, dy, dz);
    if (d > 2.4 || (dx * f[0] + dy * f[1] + dz * f[2]) / d < 0.7) continue;
    cand({ kind: 'hook', use: () => temple.cristal(q) }, d);
  }
});

// ---------------------------------------------------------------- branchements
HOOKS.load.push((saved) => { if (!farm.s) return; if (!saved) farm.s.temple = null; temple.S(); temple.appliquer(); });
HOOKS.update.push((dt, eye) => { if (farm.s && game.mode !== 'menu') temple.update(dt, eye); });
HOOKS.draw.push((buf, sbuf, cam, t) => { if (farm.s) temple.draw(buf, sbuf, cam, t); });
