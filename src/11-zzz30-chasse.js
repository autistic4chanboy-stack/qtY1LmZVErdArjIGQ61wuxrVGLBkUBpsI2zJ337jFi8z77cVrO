// ============================================================================
//  LA CHASSE
//  - le fusil de chasse à lunette : bouton droit maintenu, on vise à la
//    lunette (la respiration fait danser le réticule ; Maj retient le souffle
//    un moment) ; clic : on tire (une cartouche), puis on réarme ;
//  - les dépouilles : la bête abattue reste où elle tombe, on la dépèce (E) ;
//    une bête blessée fuit en saignant et laisse une piste de sang ;
//  - les pièges à loup : armés à la pose, ils prennent les bêtes, les
//    habitants… et celui qui ne regarde pas où il marche (E pour se dégager) ;
//  - les bêtes dangereuses : ours et sangliers n'attaquent que rarement, quand
//    on les menace (trop près trop longtemps, surpris en courant, blessés,
//    leurs petits à côté, les battues) ; sinon ils fuient ;
//  - les chasseurs du Chassedi : battues, coups de feu au loin, pièges dans
//    les bois, et parfois l'accident (pris pour un gibier) ;
//  - l'appeau.
//  État sauvegardé : farm.s.chasse. API : chasse.* (voir la fin du fichier).
// ============================================================================

// dégâts : 135 au corps (un ours, 260 PV, en demande deux jusqu'à 200 m) ; ×1,6 à la tête, ×0,3 aux pattes
const CHASSE_FUSIL = { portee: 350, degats: 135, rearme: 1.2, zoom: 0.22, sens: 0.36, hanche: 0.03, souffle: 0.0042 };
// le gibier que les chasseurs du Chassedi tirent
const CHASSE_GIBIER = new Set(['deer', 'roe', 'boar', 'rabbit', 'pheasant', 'partridge', 'lievre_blanc', 'chamois', 'tetras', 'lagopede', 'fox', 'badger']);
// bêtes qui peuvent attaquer quand on les menace (rarement)
const CHASSE_DANGER = {
  bear: { alerte: 26, proche: 11, patience: 5, surprise: 8, pSurprise: 0.5, pProche: 0.35, pPetits: 0.85, pBlesse: 0.7, pChasseur: 0.12, portee: 1.8, degats: [26, 40], saigne: [0.12, 0.3], cause: 'Lacéré par un ours', coupsMax: 3 },
  boar: { alerte: 14, proche: 6, patience: 3, surprise: 5, pSurprise: 0.4, pProche: 0.3, pPetits: 0, pBlesse: 0.6, pChasseur: 0.05, portee: 1.2, degats: [14, 22], saigne: [0.05, 0.12], cause: 'Encorné par un sanglier', coupsMax: 2 },
};
// ce qu'on tire en plus d'une bête en la dépeçant (en plus de PREY)
const CHASSE_BONUS = {
  bear: [['griffe_ours', 2, 4], ['graisse_ours', 1, 2]],
  fox: [['fourrure', 1, 1, 0.6]],
  wolf: [['croc', 0, 1]],
  boar: [['viande', 0, 1]],
};
// ce qui se prend, la nuit, dans un piège laissé tendu (selon le milieu)
const CHASSE_PRISES = {
  foret: ['fox', 'boar', 'roe', 'badger', 'wolf', 'rabbit'], bouleaux: ['roe', 'fox', 'badger', 'boar'], sapiniere: ['fox', 'wolf', 'martre', 'boar', 'bear'],
  pres: ['rabbit', 'fox', 'badger'], lande: ['rabbit', 'fox'], alpage: ['marmot', 'fox', 'chamois'], combe: ['fox', 'badger', 'wolf'], marais: ['otter', 'fox'],
};
const CHASSE_GROS = new Set(['bear', 'boar', 'deer', 'wolf', 'wildhorse', 'ibex', 'chamois']);
const CHASSE_NOMS = {
  deer: 'le cerf', roe: 'le chevreuil', boar: 'le sanglier', bear: 'l’ours', wolf: 'le loup', fox: 'le renard', rabbit: 'le lapin', badger: 'le blaireau',
  chamois: 'le chamois', ibex: 'le bouquetin', marmot: 'la marmotte', lynx: 'le lynx', otter: 'la loutre', castor: 'le castor', martre: 'la martre',
  lievre_blanc: 'le lièvre', wildhorse: 'le cheval', swan: 'le cygne', squirrel: 'l’écureuil', goat: 'la chèvre', sheep: 'le mouton', pig: 'le cochon', cow: 'la vache',
};
const CHASSE_VEGETATION = new Set(['tallgrass', 'fern', 'reeds', 'heather', 'bush', 'wheat']);

// ---------------------------------------------------------------- objets en plus : le brassard rouge, le trophée
defItem('brassard_rouge', 'Brassard rouge', 'outil', 12, ['laine', '#c8281e'], { passive: true, desc: 'Un brassard de laine rouge. Le Chassedi, les chasseurs voient du rouge avant de voir un chevreuil. En principe.' });
// trophée : un cerf sur six ou sept en donne un ; il vaut trois cerfs dépecés (équilibrage : était 180)
PLACEABLES.trophee = { name: 'Trophée de cerf', price: 60 };
defItem('trophee', 'Trophée de cerf', 'objet', 60, ['objet', 'trophee'], { place: 'trophee', desc: 'Une tête de cerf naturalisée sur sa planche. À poser au mur, ou sur une table.' });
if (NPC_BY_ID.chasseur && NPC_BY_ID.chasseur.shop && !NPC_BY_ID.chasseur.shop.sells.some((x) => x[0] === 'brassard_rouge')) NPC_BY_ID.chasseur.shop.sells.push(['brassard_rouge', 14]);
if (NPC_BY_ID.chasseur && NPC_BY_ID.chasseur.shop && NPC_BY_ID.chasseur.shop.buys && !NPC_BY_ID.chasseur.shop.buys.includes('trophee')) NPC_BY_ID.chasseur.shop.buys.push('trophee');

// les ours et les sangliers « calmes » : c'est la menace qui décide (voir chasse.danger)
const CHASSE_CALME = {};
for (const k of ['bear', 'boar']) if (CREATURES[k]) CHASSE_CALME[k] = Object.assign({}, CREATURES[k], { charge: 0, flee: 0, calme: true });
if (CREATURES.bear) CHASSE_CALME.ourson = Object.assign({}, CREATURES.bear, { charge: 0, flee: 0, calme: true, range: 5, walk: 1.0, run: 6.2, radius: 0.35 });

const chasse = {
  f: { vise: 0, lunette: false, rearme: 0, sonRearme: -1, tir: 0, flash: 0, reserve: 1, retenu: false, essouffle: 0, aimYaw: 0, aimPitch: 0, fovSet: false, noHand: false, force: false, vmSig: '', vide: 0 },
  pris: null,            // le joueur, pris dans un piège : { t, force }
  blesses: new Set(),    // bêtes blessées qui saignent
  hasard: null,          // tests : probabilité forcée d'un accident de chasse (par seconde)
  hasardLetal: null,     // tests : probabilité forcée que la balle tue d'un coup
  accident: null,        // l'accident en cours (un chasseur vise le joueur)
  immobileT: 0, trapT: 0, accT: 0, listeT: 0, listePieges: [], appeauT: 0, flashPNJ: null,

  // ------------------------------------------------------------- état sauvegardé
  S() {
    const s = farm.s;
    const C = s.chasse || (s.chasse = {});
    if (!C.pieges) C.pieges = [];          // pièges des chasseurs (posés le Chassedi)
    if (!C.depouilles) C.depouilles = [];  // bêtes abattues, pas encore dépecées
    if (!C.signal) C.signal = {};          // habitant -> jour où on l'a prévenu
    if (!C.tableau) C.tableau = {};        // tableau de chasse
    if (C.accidents === undefined) C.accidents = 0;
    if (C.siffle === undefined) C.siffle = 0;
    return C;
  },
  nom(kind) { return CHASSE_NOMS[kind] || 'la bête'; },

  // ============================================================== sons
  spatial(x, z) {
    const p = game.player, dx = x - p.pos[0], dz = z - p.pos[2], d = Math.hypot(dx, dz) || 0.001, b = cameraBasis(p.yaw, 0);
    return { d, pan: clamp((dx * b.r[0] + dz * b.r[2]) / d, -1, 1) };
  },
  // un coup de feu : le son met le temps de venir (340 m/s), puis l'écho roule dans la vallée
  sonTir(pos, soi) {
    if (!sound.ok) return;
    const { d, pan } = soi ? { d: 0, pan: 0 } : this.spatial(pos[0], pos[2]);
    if (d > 1300) return;
    const k = Math.pow(clamp(1 - d / 1300, 0, 1), 1.7), t = sound.ctx.currentTime + 0.02 + d / 340;
    if (soi) sound.shot();
    else {
      const out = sound.pan(pan * Math.min(1, d / 30) * 0.85);
      sound.noiseHit(t, 0.22 + (1 - k) * 0.5, 'lowpass', 350 + 4200 * k, 0.6, 0.02 + 0.5 * k, out, 110);
      sound.tone(t, 'sine', 125, 36, 0.28 + (1 - k) * 0.3, 0.03 + 0.55 * k, out);
    }
    const e1 = 0.35 + Math.random() * 0.6;
    sound.noiseHit(t + e1, 0.7, 'lowpass', 420, 0.5, 0.012 + 0.09 * k, sound.amb, 120);
    sound.noiseHit(t + e1 + 0.5 + Math.random() * 0.6, 0.9, 'lowpass', 300, 0.5, 0.006 + 0.045 * k, sound.amb, 90);
  },
  sonImpact(pt, kind) {
    if (!sound.ok) return;
    const { d, pan } = this.spatial(pt[0], pt[2]);
    if (d > 260) return;
    const k = clamp(1 - d / 260, 0.05, 1), t = sound.ctx.currentTime + 0.02 + d / 340, out = sound.pan(pan * 0.7);
    if (kind === 'dur') { sound.tone(t, 'triangle', 1700, 600, 0.06, 0.05 * k, out); sound.noiseHit(t, 0.04, 'bandpass', 2600, 1.5, 0.06 * k, out); }
    else if (kind === 'chair') sound.noiseHit(t, 0.08, 'lowpass', 500, 0.8, 0.16 * k, out);
    else if (kind === 'eau') sound.noiseHit(t, 0.3, 'lowpass', 1100, 0.6, 0.12 * k, out, 250);
    else sound.noiseHit(t, 0.1, 'lowpass', 700, 0.8, 0.1 * k, out);
  },
  sonMachoires(x, z) {
    if (!sound.ok) return;
    const { d, pan } = this.spatial(x, z);
    if (d > 70) return;
    const k = clamp(1 - d / 70, 0, 1), t = sound.ctx.currentTime + 0.01, out = sound.pan(pan * 0.8 * Math.min(1, d / 4));
    sound.noiseHit(t, 0.06, 'bandpass', 2600, 1.4, 0.42 * k, out);
    sound.tone(t, 'square', 1100, 260, 0.07, 0.1 * k, out);
    sound.tone(t + 0.005, 'triangle', 2400, 1500, 0.2, 0.07 * k, out);
    sound.noiseHit(t + 0.04, 0.2, 'lowpass', 700, 0.7, 0.14 * k, out);
  },
  sonRessort() { if (!sound.ok) return; const t = sound.ctx.currentTime + 0.01; sound.tone(t, 'sawtooth', 300, 200, 0.25, 0.012, sound.lp ? sound.lp(900) : null); sound.noiseHit(t + 0.1, 0.05, 'bandpass', 1900, 2, 0.05); },
  sonGrogne(e, fort) {
    if (!sound.ok) return;
    const { d, pan } = this.spatial(e.x, e.z); // e.dist n'existe pas encore pour une bête qui vient d'apparaître
    if (!(d < 70)) return;
    const k = clamp(1 - d / 70, 0.1, 1) * (fort ? 1.4 : 1);
    if (e.kind === 'bear') { sound.growl && sound.growl(k); if (fort) sound.noiseHit(sound.ctx.currentTime + 0.02, 0.6, 'lowpass', 260, 0.7, 0.12 * k, null, 120); }
    else sound.animal('pig', pan, k);
  },

  // ============================================================== le fusil
  tient() { const s = farm.s; return s && s.hand === 'fusil' && farm.count('fusil') > 0; },
  lunetteDom() {
    if (this.domL) return this.domL;
    const st = document.createElement('style');
    st.textContent = `#lunette{position:fixed;inset:0;pointer-events:none;z-index:2;display:none;overflow:hidden}
#lunette.on{display:block}
#lunette .m{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 0,rgba(0,0,0,0) 35.5vmin,rgba(0,0,0,.55) 37.3vmin,#000 38.6vmin)}
#lunette .s{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 16vmin,rgba(0,0,0,.45) 36vmin);opacity:0;transition:opacity .8s}
#lunette.essouffle .s{opacity:1}
#lunette .r{position:absolute;left:50%;top:50%;width:0;height:0}
#lunette .r i{position:absolute;background:rgba(6,6,6,.92)}
#lunette .r .h{left:-37vmin;width:74vmin;top:-.5px;height:1px}
#lunette .r .v{top:-37vmin;height:74vmin;left:-.5px;width:1px}
#lunette .r .pl{left:-38vmin;width:24vmin;top:-2px;height:4px}
#lunette .r .pr{left:14vmin;width:24vmin;top:-2px;height:4px}
#lunette .r .pb{top:14vmin;height:24vmin;left:-2px;width:4px}`;
    document.head.appendChild(st);
    const d = document.createElement('div');
    d.id = 'lunette';
    d.innerHTML = '<div class="m"></div><div class="s"></div><div class="r"><i class="h"></i><i class="v"></i><i class="pl"></i><i class="pr"></i><i class="pb"></i></div>';
    document.body.appendChild(d);
    return (this.domL = d);
  },
  lunette(on) {
    const F = this.f;
    F.lunette = on;
    this.lunetteDom().classList.toggle('on', on);
    if (on) { F.noHand = true; game.noHand = true; sound.equip && sound.equip(); }
    else if (F.noHand) { F.noHand = false; if (!(typeof cine !== 'undefined' && cine.on)) game.noHand = false; }
  },
  majFusil(dt, playing) {
    const F = this.f, p = game.player;
    const veut = this.tient() && playing && !game.sleeping && !game.dying && !(typeof cine !== 'undefined' && cine.on) && (F.force || (input.locked && (input.buttons & 2)));
    F.vise = clamp(F.vise + (veut ? dt / 0.2 : -dt / 0.14), 0, 1);
    const lun = !!veut && F.vise >= 1;
    if (lun !== F.lunette) this.lunette(lun);
    // champ de vision : la lunette grossit quatre fois et demie
    if (F.vise > 0 || F.fovSet) {
      game.fovK = lun ? CHASSE_FUSIL.zoom : lerp(1, 0.84, F.vise);
      F.fovSet = F.vise > 0;
      if (!F.fovSet) game.fovK = 1;
    }
    // le souffle : Maj le retient quelques secondes ; après, on halète
    const maj = lun && (input.down('ShiftLeft') || input.down('ShiftRight'));
    if (F.essouffle > 0) { F.essouffle -= dt; F.retenu = false; F.reserve = Math.min(1, F.reserve + dt * 0.12); if (F.essouffle <= 0 && this.domL) this.domL.classList.remove('essouffle'); }
    else if (maj && F.reserve > 0) {
      if (!F.retenu) { F.retenu = true; sound.breath && sound.breath(0.35); }
      F.reserve -= dt / 4.5;
      if (F.reserve <= 0) { F.reserve = 0; F.retenu = false; F.essouffle = 3; sound.breath && sound.breath(1); if (this.domL) this.domL.classList.add('essouffle'); }
    } else { if (F.retenu) { F.retenu = false; sound.breath && sound.breath(0.5); } F.reserve = Math.min(1, F.reserve + dt / 6); }
    // réarmement (culasse), pose de tir, éclair
    if (F.rearme > 0) { F.rearme -= dt; if (F.sonRearme > 0 && F.rearme <= F.sonRearme) { F.sonRearme = -1; sound.reload && sound.reload(); } }
    F.tir = Math.max(0, F.tir - dt);
    F.flash = Math.max(0, F.flash - dt);
    void p;
  },
  // balancement de la respiration (lunette), sensibilité réduite, visée mémorisée pour le tir
  camera(dt, pos, yaw, pitch) {
    if (typeof cine !== 'undefined' && cine.on) return null;
    const F = this.f, p = game.player;
    if (!F.lunette) { F.aimYaw = yaw; F.aimPitch = pitch; return null; }
    const k = 1 - CHASSE_FUSIL.sens, sn = settings.sens * 0.0022;
    const dy = input.dx * sn * k, dp = input.dy * sn * k * (settings.invertY ? -1 : 1);
    p.yaw += dy; p.pitch = clamp(p.pitch + dp, -1.55, 1.55);
    yaw += dy; pitch += dp;
    const t = game.time, moving = Math.hypot(p.vel[0], p.vel[2]) > 0.5;
    let A = CHASSE_FUSIL.souffle * (p.crouch > 0.5 ? 0.6 : 1) * (1 + (1 - p.stamina) * 1.5) * (p.riding ? 2.6 : 1) * (moving ? 1.8 : 1) * (corps.jambeCassee() ? 1.3 : 1) * (p.hp < 40 ? 1.5 : 1) * (this.pris ? 1.4 : 1);
    if (F.retenu) A *= 0.14; else if (F.essouffle > 0) A *= 2.3;
    yaw += (Math.sin(t * 0.83) + 0.5 * Math.sin(t * 2.1 + 1.3) + 0.25 * Math.sin(t * 5.3)) * A;
    pitch += (Math.sin(t * 1.27 + 0.7) * 0.8 + 0.4 * Math.sin(t * 2.9) + 0.2 * Math.sin(t * 6.1 + 2)) * A;
    F.aimYaw = yaw; F.aimPitch = pitch;
    return { pos, yaw, pitch };
  },
  // l'objet en main : repos, visée (fusil levé), tir (recul) — installé au premier chargement
  vueEnMain(r) {
    const F = this.f;
    if (!this.tient() || typeof VM === 'undefined' || !VM.fusil) return r;
    const pose = F.tir > 0 ? 2 : F.vise > 0.05 ? 1 : 0;
    const key = game.vmKey + '|' + pose;
    if (r.dirty || F.vmSig !== key) {
      const cv = game.vmCanvas, ctx = cv.getContext('2d'), pb = VM.fusil[pose];
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, VM_W, VM_H);
      ctx.drawImage(pb._cv || (pb._cv = pb.canvas()), 0, 0);
      F.vmSig = key; r.dirty = true;
    }
    // recul, levée du fusil, culasse qu'on manœuvre
    const reco = F.tir > 0 ? F.tir / 0.14 : 0;
    const culasse = F.rearme > 0 ? Math.sin(Math.PI * clamp(1 - F.rearme / CHASSE_FUSIL.rearme, 0, 1)) : 0;
    r.oy += reco * 0.05 - culasse * 0.07 + F.vise * 0.02;
    r.ox += reco * 0.03 - F.vise * 0.05 + culasse * 0.02;
    return r;
  },
  tirer() {
    const F = this.f, p = game.player, s = farm.s;
    if (!this.tient() || game.dying) return false;
    if (F.rearme > 0) return false;
    if (!farm.count('cartouche')) {
      sound.dryFire && sound.dryFire(); F.rearme = 0.35;
      if ((F.vide = (F.vide || 0) + 1) % 3 === 1) ui.subtitle('', '(Clic. Plus de cartouches.)', 2);
      return false;
    }
    farm.take('cartouche', 1);
    const eye = p.eyePos();
    let yaw = F.aimYaw ?? p.yaw, pitch = F.aimPitch ?? p.pitch;
    if (!F.lunette) { // à la hanche, on tire à peu près
      const sp = CHASSE_FUSIL.hanche * (1 - 0.6 * F.vise);
      yaw += (Math.random() + Math.random() - 1) * sp; pitch += (Math.random() + Math.random() - 1) * sp;
    }
    const dir = cameraBasis(yaw, pitch).f;
    const hit = this.rayon(eye, dir, CHASSE_FUSIL.portee);
    // le coup part
    this.sonTir(eye, true);
    p.kickPitch = (p.kickPitch || 0) + (F.lunette ? 0.07 : 0.11);
    game.shakeT = Math.max(game.shakeT || 0, 0.28);
    F.tir = 0.14; F.flash = 0.07; F.rearme = CHASSE_FUSIL.rearme; F.sonRearme = CHASSE_FUSIL.rearme - 0.28;
    for (let k = 0; k < 6; k++) particles.spawn(eye[0] + dir[0] * 1.1, eye[1] + dir[1] * 1.1 - 0.1, eye[2] + dir[2] * 1.1, dir[0] * 2 + (Math.random() - 0.5), 0.4 + Math.random() * 0.4, dir[2] * 2 + (Math.random() - 0.5), [0.75, 0.74, 0.72, 0.5], 0.12, 1.2, -0.1, false);
    const S = this.S(); S.tirs = (S.tirs || 0) + 1;
    this.bruitDeTir(eye);
    if (hit) this.impact(hit, eye, dir);
    return hit || true;
  },
  // tir instantané le long du regard : relief, blocs, troncs, eau, bêtes, habitants, choses étranges
  rayon(o, d, max) {
    const w = game.world, at = (t) => [o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t];
    let best = null, lim = max;
    const th = w.raycastTerrain(o, d, max);
    if (th) { best = { t: th.t, kind: 'terrain', p: [th.x, th.y, th.z] }; lim = th.t; }
    const bh = w.raycastBlocks(o, d, lim);
    if (bh && bh.t < lim) { best = { t: bh.t, kind: 'bloc', b: bh.block, p: at(bh.t) }; lim = bh.t; }
    const oh = this.rayonTroncs(o, d, lim);
    if (oh && oh.t < lim) { best = { t: oh.t, kind: 'tronc', o: oh.obj, p: at(oh.t) }; lim = oh.t; }
    // l'eau arrête la balle
    if (d[1] < -1e-3 && o[1] > w.waterLevel) {
      const tw = (w.waterLevel - o[1]) / d[1];
      if (tw > 0 && tw < lim) { const q = at(tw); if (w.heightAt(q[0], q[2]) < w.waterLevel - 0.05) { best = { t: tw, kind: 'eau', p: q }; lim = tw; } }
    }
    const eh = this.rayonBetes(o, d, lim);
    if (eh && eh.t < lim) { best = { t: eh.t, kind: 'bete', e: eh.e, p: eh.p }; lim = eh.t; }
    const nh = npcs.raycast(o, d, lim);
    if (nh && nh.t < lim) { best = { t: nh.t, kind: 'npc', n: nh.n, p: nh.p }; lim = nh.t; }
    const sh = strange.raycast(o, d, lim);
    if (sh && sh.t < lim) { best = { t: sh.t, kind: 'etrange', s: sh.s, p: sh.p }; lim = sh.t; }
    return best;
  },
  // troncs et rochers seulement (l'herbe haute et les fleurs ne gênent pas) ; par tronçons, pour profiter de la grille
  rayonTroncs(o, d, max) {
    const w = game.world, dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (let t0 = 0; t0 < max; t0 += 30) {
      const seg = Math.min(30, max - t0), o2 = [o[0] + d[0] * t0, o[1] + d[1] * t0, o[2] + d[2] * t0];
      let best = null;
      w.forObjectsNearRay(o2, d, seg, (ob) => {
        const T = OBJ_TYPES[ob.t];
        if (!T || T.animal || !w.live(ob)) return;
        const r = objRadius(T, ob);
        if (!(r > 0.05)) return;
        const cx = ob.x - o2[0], cz = ob.z - o2[2];
        const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
        if (tc < 0 || tc > seg) return;
        const px = d[0] * tc - cx, pz = d[2] * tc - cz;
        if (px * px + pz * pz > r * r) return;
        const y = o2[1] + d[1] * tc, oy = w.objectY(ob);
        if (y < oy - 0.2 || y > oy + ob.h) return;
        if (!best || tc < best.t) best = { t: tc, obj: ob };
      });
      if (best) return { t: t0 + best.t, obj: best.obj };
    }
    return null;
  },
  // bêtes : comme entities.raycast, mais aussi au-delà de 220 m (la lunette porte loin)
  rayonBetes(o, d, max) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const e of entities.list) {
      if (e.hidden || e.dead || e.ridden || e.removed) continue;
      const cx = e.x - o[0], cz = e.z - o[2];
      if (Math.abs(cx) > max + 3 || Math.abs(cz) > max + 3) continue;
      const r = Math.max(0.25, e.cfg.radius * 1.3 * (e.scale || 1) + (e.cfg.fly ? 0.2 : 0));
      const tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > max) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz;
      if (px * px + pz * pz > r * r) continue;
      const y = o[1] + d[1] * tc;
      if (y < e.y - 0.1 || y > e.y + e.h * (e.scale || 1) + 0.1) continue;
      if (!best || tc < best.t) best = { t: tc, e, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },
  impact(hit, eye, dir) {
    const w = game.world, [x, y, z] = hit.p, dist = hit.t;
    const loin = dist > 200 ? lerp(1, 0.85, clamp((dist - 200) / 150, 0, 1)) : 1;
    switch (hit.kind) {
      case 'terrain': { const m = w.matAt(x, z); puffAt(x, y + 0.05, z, (MATERIALS[m] && MATERIALS[m].avg) || [110, 90, 60], 9, 2.2, m === M_ROCK); this.sonImpact(hit.p, m === M_ROCK ? 'dur' : 'sol'); break; }
      case 'bloc': { const b = hit.b; puffAt(x - dir[0] * 0.05, y - dir[1] * 0.05, z - dir[2] * 0.05, (MATERIALS[b.m] && MATERIALS[b.m].avg) || [150, 150, 150], 8, 2, true); this.sonImpact(hit.p, 'dur'); break; }
      case 'tronc': puffAt(x - dir[0] * 0.1, y, z - dir[2] * 0.1, [96, 70, 44], 8, 1.8, false); this.sonImpact(hit.p, 'sol'); break;
      case 'eau': splashAt(x, y, z); this.sonImpact(hit.p, 'eau'); break;
      case 'bete': {
        const e = hit.e, rel = (y - e.y) / Math.max(0.1, e.h * (e.scale || 1));
        // de loin, la balle ne fait parfois qu'érafler : la bête file en saignant
        const eraflure = dist > 80 && Math.random() < 0.15;
        const part = eraflure ? 0.25 : rel > 0.72 ? 1.6 : rel < 0.3 ? 0.3 : 1;
        puffAt(x, y, z, [150, 24, 24], 10, 1.6, false);
        this.sonImpact(hit.p, 'chair');
        play.hurtCreature(e, CHASSE_FUSIL.degats * part * loin, eye);
        break;
      }
      case 'npc': this.toucherHabitant(hit.n, hit.p); break;
      case 'etrange': strange.hit(hit.s, 150, eye); break;
    }
  },
  // une balle dans un habitant : blessure, ou mort ; la société s'en souviendra
  toucherHabitant(n, pt) {
    const rel = (pt[1] - n.y) / (1.85 * (n.look.height || 1));
    const dmg = rel > 0.8 ? 220 : rel < 0.45 ? 45 : 120;
    const vivant = n.st.alive;
    puffAt(pt[0], pt[1], pt[2], [140, 20, 20], 10, 1.6, false);
    this.sonImpact(pt, 'chair');
    npcs.hurt(n, dmg, 'joueur');
    if (!vivant) return;
    const mort = !n.st.alive;
    if (typeof societe !== 'undefined' && societe.crime) societe.crime({ type: mort ? 'meurtre' : 'agression', victime: n.id, x: n.x, z: n.z });
  },
  // le bruit d'un coup de fusil : les bêtes fuient, les ours s'agitent, la ville s'affole, le garde se fâche
  bruitDeTir(pos) {
    const w = game.world, s = farm.s;
    entities.scare(pos[0], pos[2], 140);
    for (const e of entities.list) if (!e.dead && !e.far && (e.kind === 'bear' || e.kind === 'boar') && Math.hypot(e.x - pos[0], e.z - pos[2]) < 170) e.agite = 60;
    const P = interditDeBatir(pos[0], pos[2], 90);
    const peuple = !!(P && /ville|hameau|église|cimetière|campement|Sources|bibliothèque|abbaye|château|chapelle/.test(P.why || ''));
    let dit = false;
    for (const n of npcs.list) {
      if (!n.st.alive || n.vanished || n.hunting || n.sleep || n.state === 'dead' || n.state === 'gone' || n.d.id === 'garde' || this.enBattue(n)) continue;
      const dd = Math.hypot(n.x - pos[0], n.z - pos[2]);
      if (dd > (peuple ? 90 : 40)) continue;
      n.fleeT = Math.max(n.fleeT || 0, 3 + Math.random() * 3); n.talking = false;
      npcs.addAmitie(n, peuple ? -4 : -1);
      if (!dit && dd < 45) { dit = true; npcs.say(n, pick(['Un coup de feu ! Mon Dieu !', 'Qu’est-ce qui vous prend ? Vous êtes fou ?', 'Ne tirez pas ! Ne tirez pas !', 'Au secours ! Il tire !']), 2.5); }
    }
    if (!peuple) return;
    const g = npcs.byId.garde, S = this.S();
    if (S.villeJour !== s.day) { S.villeJour = s.day; S.villeTirs = 0; }
    S.villeTirs++;
    if (!g || !g.st.alive || g.vanished || g.sleep) return;
    npcs.addAmitie(g, -12); npcs.remember(g, 'coup_de_feu');
    const dg = Math.hypot(g.x - pos[0], g.z - pos[2]);
    if (dg < 80) {
      if (S.villeTirs >= 2 && s.money > 0) { const amende = Math.min(s.money, 30); s.money -= amende; npcs.say(g, `Encore ! Ce sera ${amende} pièces d’amende, et que je ne vous y reprenne pas.`, 4); sound.coin && sound.coin(); }
      else npcs.say(g, 'Hé ! Rangez-moi ce fusil ! On ne tire pas en ville.', 3.5);
    } else if (S.villeTirs === 1) ui.subtitle('', '(Au loin, le sifflet du garde.)', 3);
  },

  // ============================================================== bêtes abattues, blessées, dépouilles
  aDepouille(e) {
    if (e.owner || e.cfg.fly || e.cfg.oiseau || e.cfg.boss || e.kind === 'bete') return false;
    const P = PREY[e.kind];
    if (!P || !P.drop || !P.drop.length) return false;
    return (e.h || 1) * (e.scale || 1) >= 0.28;
  },
  // la bête tombe : elle reste là, couchée, jusqu'à ce qu'on la dépèce (ou qu'elle pourrisse)
  abattre(e, par) {
    const s = farm.s, S = this.S();
    e.dead = true; e.hidden = false; e.corpse = true; e.move = 0; e.furie = null; e.saigne = 0; e.hurtT = 0.3;
    e.mortJour = s.day;
    this.blesses.delete(e);
    if (par && par !== 'joueur' && par.id) { e.proie = par.id; }
    else if (!e.piege) {
      const D = { k: e.kind, x: Math.round(e.x * 100) / 100, y: Math.round(e.y * 100) / 100, z: Math.round(e.z * 100) / 100, h: Math.round(e.heading * 100) / 100, v: e.v || 0, sc: e.scale || 1, j: s.day };
      S.depouilles.push(D); e.depRec = D;
      while (S.depouilles.length > 40) S.depouilles.shift();
    }
    if (!par || par === 'joueur') { S.tableau[e.kind] = (S.tableau[e.kind] || 0) + 1; this.sacre(e); }
  },
  // cygne de la Dame, cerf blanc : on ne les tue pas
  sacre(e) {
    if (e.kind === 'swan' || (e.cfg && e.cfg.sacre)) this.sacrilege('Un cygne de la Dame, abattu');
    else if (e.white || e.kind === 'cerf_blanc' || e.blanc) this.sacrilege('Le Cerf blanc, abattu');
  },
  sacrilege(cause) {
    const S = this.S();
    S.sacrileges = (S.sacrileges || 0) + 1;
    if (typeof malediction !== 'undefined' && malediction.frapper) malediction.frapper('sacrilege', cause);
    sound.whisper && sound.whisper(0, 0.6);
    ui.subtitle('', '(Un froid vous traverse. Quelque chose, quelque part, a vu.)', 4);
  },
  blesser(e, dmg) {
    if (e.dead || e.owner) return;
    e.saigne = Math.min(4, (e.saigne || 0) + clamp(dmg / 45, 0.4, 2.5));
    this.blesses.add(e);
  },
  majBlesses(dt) {
    if (!this.blesses.size) return;
    const p = game.player, w = game.world;
    for (const e of this.blesses) {
      if (e.dead || e.removed) { this.blesses.delete(e); continue; }
      if (e.far) continue;
      e.hp -= e.saigne * dt;
      e.gouttes = (e.gouttes || 0) - dt;
      if (e.gouttes <= 0) {
        e.gouttes = clamp(0.5 / e.saigne, 0.18, 0.8);
        const gx = e.x + (Math.random() - 0.5) * 0.4, gz = e.z + (Math.random() - 0.5) * 0.4;
        particles.spawn(gx, w.groundAt(gx, gz, e.y + 0.4, 0.6) + 0.03, gz, 0, 0, 0, [0.42, 0.03, 0.03, 1], 0.07, 70, 0, false);
      }
      if (e.hp <= 0) { e.hp = 0; this.abattre(e, e.tireur || 'joueur'); continue; }
      const P = PREY[e.kind], hp0 = (P && P.hp) || 30;
      if (e.hp < hp0 * 0.2 && !e.furie) { e.state = 'idle'; e.timer = 2; e.move = 0; continue; } // à bout de forces
      if (!e.furie && !e.piege && e.state !== 'flee' && (e.dist || 999) < 70) { entities.startFlee(e, p.pos[0], p.pos[2]); e.timer = 4; }
    }
  },
  // dépecer une dépouille : viande, cuir, fourrure, bois, trophées
  butin(kind, scale, e) {
    const P = PREY[kind], out = [];
    if (!P) return out;
    const k = (scale || 1) < 0.7 ? 0.4 : 1;
    const add = (id, n) => { if (n > 0 && ITEMS[id]) { const q = out.find((x) => x[0] === id); if (q) q[1] += n; else out.push([id, n]); } };
    for (const [item, a, b, pr] of P.drop) { if (pr !== undefined && Math.random() > pr) continue; add(item, Math.round((a + Math.floor(Math.random() * (b - a + 1))) * k)); }
    if (k === 1) for (const [item, a, b, pr] of CHASSE_BONUS[kind] || []) { if (pr !== undefined && Math.random() > pr) continue; add(item, a + Math.floor(Math.random() * (b - a + 1))); }
    if (kind === 'deer' && k === 1 && e && (e.v | 0) % 2 === 0 && Math.random() < 0.3) add('trophee', 1);
    return out;
  },
  depecer(e) {
    const s = farm.s, S = this.S();
    if (e.piege) { this.releverPiege(e.piege); return; }
    if (!e.corpse || e.removed) return;
    const L = this.butin(e.kind, e.scale, e), pos = [e.x, e.y + 0.4, e.z];
    for (const [id, n] of L) { farm.give(id, n); play.flyer(id, pos, n); }
    puffAt(e.x, e.y + 0.3, e.z, [120, 30, 26], 12, 1.4, false);
    sound.scythe && sound.scythe(); sound.pop && sound.pop();
    if (e.depRec) { const i = S.depouilles.indexOf(e.depRec); if (i >= 0) S.depouilles.splice(i, 1); }
    // la prise d'un chasseur : c'est du vol, s'il le voit
    if (e.proie) { const n = npcs.byId[e.proie]; if (n && n.st.alive && npcs.witnesses(e.x, e.z).includes(n)) { npcs.say(n, 'Hé ! C’est ma bête, ça !', 3); npcs.addAmitie(n, -40); if (typeof societe !== 'undefined' && societe.crime) societe.crime({ type: 'vol', victime: n.id, x: e.x, z: e.z }); } if (n && n.recup === e) { n.recup = null; n.goal = null; } }
    this.oter(e);
    ui.subtitle('', L.length ? `(Vous dépecez ${this.nom(e.kind)}.)` : '(Il n’y a rien à en tirer.)', 2.5);
    S.depecees = (S.depecees || 0) + 1;
    void s;
  },
  // les dépouilles se ciblent avec E
  cible(eye, f, cand) {
    for (const e of entities.list) {
      if (!e.corpse || e.removed || e.hidden) continue;
      const dx = e.x - eye[0], dy = e.y + 0.3 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.8) continue;
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.6) continue;
      cand({ kind: 'hook', corpse: e, use: () => this.depecer(e) }, d + 0.05);
    }
    // les pièges des chasseurs (ils ne se voient que de près)
    for (const t of this.S().pieges) {
      const dx = t.x - eye[0], dy = t.y + 0.2 - eye[1], dz = t.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 2.5) continue;
      if ((dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.7) continue;
      cand({ kind: 'hook', piege: t, use: () => this.usePiege(t) }, d + 0.1);
    }
  },

  // ============================================================== les pièges à loup
  // accès commun : un piège posé (w.props, données dans q.data) ou un piège de chasseur (farm.s.chasse.pieges)
  D(t) { return t.id === 'piege_loup' ? (t.data || {}) : t; },
  majPiege(t, patch) { if (t.id === 'piege_loup') farm.setPropData(t, patch); else Object.assign(t, patch); },
  estAuJoueur(t) { return t.id === 'piege_loup'; },
  pieges() {
    const w = game.world;
    if (this.listeT <= 0 || farm.dirtyProps) {
      this.listeT = 2;
      this.listePieges = w.props.filter((q) => q.id === 'piege_loup' && w.live(q));
    }
    return this.listePieges.concat(this.S().pieges);
  },
  // la bête tenue par un piège (table à part : les pièges des chasseurs sont sauvegardés tels quels)
  entPieges: new WeakMap(),
  piegeEnt(t) { const e = this.entPieges.get(t); return e && !e.removed && e.piege === t ? e : null; },
  // retirer une bête pour de bon (même si elle vient d'un point d'apparition, elle ne doit plus être dessinée)
  oter(e) { e.corpse = false; e.dead = true; e.hidden = true; e.piege = null; entities.remove(e); },
  // une bête prise dans un piège (apparaît auprès du piège si elle n'est pas là)
  prisonniere(t) {
    const D = this.D(t);
    if (!D.prise) return null;
    let e = this.piegeEnt(t);
    if (e) return e;
    if (!CREATURES[D.prise]) { this.majPiege(t, { prise: 0, vivant: 0 }); return null; }
    e = entities.add(game.world, D.prise, t.x, t.z, {});
    e.piege = t; e.heading = Math.random() * TAU; e.state = 'idle';
    this.entPieges.set(t, e);
    if (!D.vivant) { e.dead = true; e.corpse = true; e.hidden = false; }
    return e;
  },
  prendreBete(t, e) {
    const s = farm.s;
    this.majPiege(t, { arme: 0, shut: 1, prise: e.kind, vivant: 1, heure: s.hours, meurt: s.hours + 2 + Math.random() * 3, sang: 1 });
    e.piege = t; e.x = t.x; e.z = t.z; e.state = 'idle'; e.move = 0; e.furie = null; e.hurtT = 0.4;
    this.entPieges.set(t, e);
    this.blesses.delete(e);
    this.sonMachoires(t.x, t.z);
    if ((e.dist || 999) < 40) sound.hurtAnimal && sound.hurtAnimal(e.kind);
  },
  seDebat(e, dt, w, c) {
    const t = e.piege, D = this.D(t), s = farm.s;
    e.x = t.x; e.z = t.z; e.y = entities.groundY(w, e, e.x, e.z);
    e.hurtT = Math.max(0, (e.hurtT || 0) - dt);
    const k = 0.5 + 0.5 * Math.sin(c.t * 3 + e.seed);
    e.phase += dt * 16 * k; e.move = 0.4 + 0.5 * k; e.run = true;
    e.heading += Math.sin(c.t * 7 + e.seed) * dt * 2.2;
    e.cri = (e.cri ?? 1 + Math.random() * 3) - dt;
    if (e.cri <= 0) { e.cri = 3 + Math.random() * 6; if (e.dist < 45) { sound.hurtAnimal && sound.hurtAnimal(e.kind); if (Math.random() < 0.5) this.sonRessort(); } }
    // les grosses bêtes s'arrachent parfois
    e.arracheT = (e.arracheT ?? 6 + Math.random() * 6) - dt;
    if (e.arracheT <= 0) {
      e.arracheT = 8 + Math.random() * 6;
      const pA = e.kind === 'bear' ? 0.3 : CHASSE_GROS.has(e.kind) ? 0.14 : 0;
      if (Math.random() < pA) {
        e.piege = null; this.majPiege(t, { prise: 0, vivant: 0, sang: 1 });
        this.blesser(e, 30); entities.startFlee(e, c.px, c.pz); e.timer = 6;
        if (e.dist < 50) { this.sonRessort(); sound.hurtAnimal && sound.hurtAnimal(e.kind); ui.subtitle('', '(La bête s’arrache au piège et s’enfuit en boitant. Du sang sur les dents de fer.)', 3.5); }
        return;
      }
    }
    // un ours pris reste un ours : on ne l'approche pas
    if (e.kind === 'bear' && e.dist < 1.9 && c.alive && (e.attackT || 0) <= 0 && !c.inside) {
      e.attackT = 1.6; this.sonGrogne(e, true);
      corps.saigner(0.1, 'Lacéré par un ours pris au piège'); play.hurt(18 + Math.random() * 8, e, 'Lacéré par un ours pris au piège');
    }
    e.attackT = Math.max(0, (e.attackT || 0) - dt);
    void D; void s;
  },
  prendreJoueur(t) {
    const p = game.player;
    this.majPiege(t, { arme: 0, shut: 1, sang: 1 });
    this.pris = { t, force: 0, x: t.x, z: t.z };
    p.vel = [0, 0, 0];
    this.sonMachoires(t.x, t.z);
    sound.hurtHuman && sound.hurtHuman(farm.s.fem ? 1.25 : 0.95);
    game.shakeT = 0.9; play.hurtFlash = 1;
    const cause = this.estAuJoueur(t) ? 'Pris dans son propre piège à loup' : 'Pris dans un piège à loup, au fond des bois';
    corps.saigner(0.35, cause);
    if (Math.random() < 0.3) corps.casserJambe(cause);
    play.hurt(16 + Math.random() * 10, null, cause);
    if (!game.dying) ui.subtitle('', '(Des mâchoires de fer se referment sur votre jambe. Vous ne pouvez plus bouger. E pour tenter de les écarter.)', 5);
  },
  degager() {
    const P = this.pris;
    if (!P) return;
    P.force += 0.14 + Math.random() * 0.16 + (corps.jambeCassee() ? 0 : 0.06);
    this.sonRessort();
    game.shakeT = Math.max(game.shakeT || 0, 0.15);
    if (P.force >= 1) {
      this.pris = null;
      ui.subtitle('', '(Vous écartez les mâchoires et retirez votre jambe. Le sang coule.)', 3.5);
      return;
    }
    if (Math.random() < 0.3) { corps.saigner(0.02, 'Pris dans un piège à loup'); sound.hurt && sound.hurt(3); }
    if (!P.dit || game.time > P.dit) { P.dit = game.time + 2.5; ui.subtitle('', pick(['(Les ressorts sont durs. Encore.)', '(Le fer mord plus fort à chaque essai.)', '(Vous forcez. Les dents grincent.)']), 2); }
  },
  // la monture met le sabot dans le piège : elle se cabre, on tombe, elle s'arrache
  prendreMonture(t, e) {
    this.majPiege(t, { arme: 0, shut: 1, sang: 1 });
    this.sonMachoires(t.x, t.z);
    sound.animal && sound.animal(e.kind === 'donkey' ? 'donkey' : 'horse', 0, 1);
    game.dismount();
    game.player.vel[1] = 3;
    play.hurt(8 + Math.random() * 6, null, 'Désarçonné près d’un piège à loup');
    entities.startFlee(e, t.x, t.z); e.timer = 3;
    ui.subtitle('', '(Votre monture met le sabot dans un piège. Elle se cabre, vous jette à terre et s’arrache au fer en hennissant.)', 4.5);
  },
  prendreHabitant(t, n) {
    const D = this.D(t);
    this.majPiege(t, { arme: 0, shut: 1, sang: 1 });
    this.sonMachoires(t.x, t.z);
    npcs.hurt(n, 22 + Math.random() * 12, 'piege');
    if (!n.st.alive) return;
    npcs.say(n, pick(['Aaah ! Ma jambe ! Un piège !', 'Qui a posé ça ici ?! Qui ?!', 'Mon Dieu… un piège à loup… en plein passage…']), 3.5);
    if (!this.estAuJoueur(t)) return;
    const p = game.player, pres = Math.hypot(p.pos[0] - t.x, p.pos[2] - t.z) < 30;
    const vus = npcs.witnesses(t.x, t.z, n);
    if (D.vu || pres || vus.length) {
      npcs.addAmitie(n, -60); npcs.remember(n, 'piege');
      for (const m of vus) npcs.remember(m, 'piege', { victim: n.id });
      if (typeof societe !== 'undefined' && societe.crime) societe.crime({ type: 'agression', victime: n.id, x: t.x, z: t.z });
    }
  },
  // chaque image : le joueur ; tous les quarts de seconde : les bêtes et les habitants ; et la mort lente des prises
  majPieges(dt, playing) {
    const p = game.player, s = farm.s, w = game.world;
    this.listeT -= dt;
    const L = this.pieges();
    if (this.pris) {
      const P = this.pris;
      p.pos[0] = lerp(p.pos[0], P.x, Math.min(1, dt * 10)); p.pos[2] = lerp(p.pos[2], P.z, Math.min(1, dt * 10)); p.vel[0] = 0; p.vel[2] = 0;
      if (game.dying) this.pris = null;
    } else if (playing && !p.fly && p.onGround && !game.sleeping) {
      for (const t of L) {
        const D = this.D(t);
        if (!D.arme || Math.abs(p.pos[0] - t.x) > 0.6 || Math.abs(p.pos[2] - t.z) > 0.6 || (t._grace && game.time < t._grace)) continue;
        if (Math.hypot(p.pos[0] - t.x, p.pos[2] - t.z) > 0.48 || Math.abs(p.pos[1] - t.y) > 0.7) continue;
        if (p.riding) this.prendreMonture(t, p.riding); else this.prendreJoueur(t);
        break;
      }
    }
    this.trapT -= dt;
    if (this.trapT > 0) return;
    this.trapT = 0.25;
    for (const t of L) {
      const D = this.D(t);
      // la prise meurt au bout de quelques heures
      if (D.prise && D.vivant && s.hours >= (D.meurt || 0)) {
        this.majPiege(t, { vivant: 0 });
        const e = this.piegeEnt(t);
        if (e && !e.dead) { e.hp = 0; e.dead = true; e.corpse = true; e.hidden = false; e.move = 0; }
      }
      // la prise se montre quand on approche
      if (D.prise && Math.abs(t.x - p.pos[0]) < 120 && Math.abs(t.z - p.pos[2]) < 120) this.prisonniere(t);
      if (!D.arme) continue;
      // les bêtes
      for (const e of entities.list) {
        if (e.dead || e.hidden || e.far || e.ridden || e.piege || e.removed || e.cfg.fly || e.cfg.water || (e.fly || 0) > 0) continue;
        if (Math.abs(e.x - t.x) > 0.7 || Math.abs(e.z - t.z) > 0.7) continue;
        if (Math.hypot(e.x - t.x, e.z - t.z) > 0.55 + e.cfg.radius * 0.5) continue;
        if (e.owner) { // les bêtes de la ferme : blessées, elles s'arrachent
          this.majPiege(t, { arme: 0, shut: 1, sang: 1 }); this.sonMachoires(t.x, t.z);
          play.hurtCreature(e, 8, [t.x, 0, t.z]); if (!e.dead) { entities.startFlee(e, t.x, t.z); e.timer = 3; }
          break;
        }
        if ((e.h || 1) * (e.scale || 1) < 0.25) continue; // trop petite, elle passe entre les dents
        this.prendreBete(t, e);
        break;
      }
      if (!this.D(t).arme) continue;
      // les habitants (les chasseurs connaissent leurs pièges)
      for (const n of npcs.list) {
        if (!n.st.alive || n.vanished || n.hunting || n.sleep || n.inside || n.state === 'dead' || n.state === 'gone') continue;
        if (!this.estAuJoueur(t) && this.estChasseur(n)) continue;
        if (Math.abs(n.x - t.x) > 0.6 || Math.abs(n.z - t.z) > 0.6 || Math.hypot(n.x - t.x, n.z - t.z) > 0.45) continue;
        this.prendreHabitant(t, n);
        break;
      }
    }
    void w;
  },
  // E sur un piège : achever la bête, relever la prise et réarmer, ou ramasser le piège
  usePiege(t) {
    const D = this.D(t), aMoi = this.estAuJoueur(t);
    const e = D.prise ? this.prisonniere(t) : null;
    if (e && !e.dead) {
      if (e.kind === 'bear') { ui.subtitle('', '(Un ours, même pris, ne se laisse pas approcher à mains nues. Un coup de fusil, plutôt.)', 3.5); return; }
      e.hp = 0; e.dead = true; e.corpse = true; e.hidden = false; e.move = 0;
      this.majPiege(t, { vivant: 0 });
      sound.hurtAnimal && sound.hurtAnimal(e.kind); puffAt(e.x, e.y + 0.3, e.z, [130, 24, 24], 8, 1.2, false);
      ui.subtitle('', '(Vous l’achevez d’un coup sec. Elle ne se débat plus.)', 3);
      return;
    }
    if (D.prise) { this.releverPiege(t); return; }
    const titre = aMoi ? 'Piège à loup' : 'Piège à loup (celui d’un chasseur)';
    const opts = [];
    if (D.arme) opts.push({ label: aMoi ? 'Le désarmer et le ramasser' : 'Le désarmer', fn: () => { ui.close(); this.majPiege(t, { arme: 0, shut: 1 }); this.sonMachoires(t.x, t.z); if (aMoi) this.ramasserPiege(t); } });
    else {
      opts.push({ label: 'Le retendre', fn: () => { ui.close(); this.majPiege(t, { arme: 1, shut: 0, sang: 0, jour: farm.s.day }); this.sonRessort(); sound.place && sound.place(); } });
      opts.push({ label: 'Le ramasser', fn: () => { ui.close(); this.ramasserPiege(t); } });
    }
    opts.push({ label: 'Le laisser', fn: () => ui.close() });
    ui.choice(titre, D.arme ? 'Il est tendu, les mâchoires ouvertes.' : 'Il est refermé.' + (D.sang ? ' Il y a du sang sur les dents.' : ''), opts);
  },
  ramasserPiege(t) {
    if (this.estAuJoueur(t)) farm.removeProp(t);
    else {
      const S = this.S(), i = S.pieges.indexOf(t);
      if (i >= 0) S.pieges.splice(i, 1);
      const n = npcs.byId.chasseur;
      if (n && n.st.alive && npcs.witnesses(t.x, t.z).includes(n)) { npcs.say(n, 'Reposez ça ! C’est mon piège !', 3); npcs.addAmitie(n, -40); if (typeof societe !== 'undefined' && societe.crime) societe.crime({ type: 'vol', victime: n.id, x: t.x, z: t.z }); }
    }
    farm.give('piege_loup', 1); play.flyer('piege_loup', [t.x, t.y + 0.3, t.z], 1);
    sound.pop && sound.pop();
    this.listeT = 0;
  },
  releverPiege(t) {
    const D = this.D(t), e = this.piegeEnt(t), aMoi = this.estAuJoueur(t);
    const L = this.butin(D.prise, e ? e.scale : 1, e), pos = [t.x, t.y + 0.4, t.z];
    for (const [id, n] of L) { farm.give(id, n); play.flyer(id, pos, n); }
    if (e) this.oter(e);
    sound.pop && sound.pop(); sound.scythe && sound.scythe();
    const kind = D.prise;
    this.S().tableau[kind] = (this.S().tableau[kind] || 0) + 1;
    if (aMoi) {
      this.majPiege(t, { prise: 0, vivant: 0, sang: 0, arme: 1, shut: 0, jour: farm.s.day });
      this.sonRessort();
      ui.subtitle('', `(Vous retirez ${this.nom(kind)} du piège, puis vous le retendez.)`, 3);
    } else {
      this.majPiege(t, { prise: 0, vivant: 0 });
      ui.subtitle('', `(Vous prenez ${this.nom(kind)} dans le piège du chasseur.)`, 3);
      const n = npcs.byId.chasseur;
      if (n && n.st.alive && npcs.witnesses(t.x, t.z).includes(n)) { npcs.say(n, 'Hé ! C’est ma prise ! Voleur !', 3); npcs.addAmitie(n, -50); if (typeof societe !== 'undefined' && societe.crime) societe.crime({ type: 'vol', victime: n.id, x: t.x, z: t.z }); }
    }
  },
  // la nuit, un piège laissé tendu prend parfois quelque chose (loin des yeux)
  prisesDeLaNuit() {
    const p = game.player, s = farm.s, w = game.world;
    for (const t of this.pieges()) {
      const D = this.D(t);
      if (!D.arme || Math.hypot(t.x - p.pos[0], t.z - p.pos[2]) < 100) continue;
      if (Math.random() > (this.estAuJoueur(t) ? 0.3 : 0.25)) continue;
      const L = CHASSE_PRISES[milieuAt(w, t.x, t.z)] || ['rabbit', 'fox'];
      const kind = L[(Math.random() * L.length) | 0];
      if (!CREATURES[kind]) continue;
      if (CHASSE_GROS.has(kind) && Math.random() < 0.4) { this.majPiege(t, { arme: 0, shut: 1, sang: 1 }); continue; } // arraché
      const vivant = Math.random() < 0.35;
      this.majPiege(t, { arme: 0, shut: 1, sang: 1, prise: kind, vivant: vivant ? 1 : 0, heure: s.hours, meurt: s.hours + 1 + Math.random() * 3 });
    }
  },
  // pose (item piege_loup) : armé tout de suite ; on retient si quelqu'un vous a vu faire
  surPose(q) {
    if (q.id !== 'piege_loup') return;
    const vus = npcs.witnesses(q.x, q.z);
    q.data = Object.assign({ arme: 1, shut: 0, own: 1, vu: vus.length ? 1 : 0, jour: farm.s.day }, q.data || {});
    this.listeT = 0;
  },

  // ============================================================== pièges des chasseurs (le Chassedi)
  poserPiegesChasseurs() {
    const S = this.S(), s = farm.s, w = game.world;
    if (S.piegesJour === s.day) return;
    S.piegesJour = s.day;
    const Z = this.postes().foret, rnd = mulberry32((s.seed | 0) * 7 + s.day * 131);
    let n = 0;
    for (let k = 0; k < 40 && n < 5; k++) {
      const [px, pz] = Z[(rnd() * Z.length) | 0], a = rnd() * TAU, r = 4 + rnd() * 14, x = px + Math.cos(a) * r, z = pz + Math.sin(a) * r;
      if (!w.inside(x, z, 20) || w.heightAt(x, z) < w.waterLevel + 0.4) continue;
      const m = w.matAt(x, z);
      if (m === M_DIRT || m === M_COBBLE || m === M_SAND || interditDeBatir(x, z, 4) || !pointFree(w, x, z, 0.5)) continue;
      S.pieges.push({ id: 'pc' + s.day + '_' + n, x: Math.round(x * 100) / 100, y: w.heightAt(x, z), z: Math.round(z * 100) / 100, r: rnd() * TAU, arme: 1, shut: 0, prise: 0, vivant: 0, sang: 0, jour: s.day, chasseur: 1 });
      n++;
    }
  },
  leverPiegesChasseurs() {
    const S = this.S(), s = farm.s;
    S.pieges = S.pieges.filter((t) => {
      if (t.jour > s.day - 2) return true;
      const e = this.piegeEnt(t);
      if (e) this.oter(e);
      return false;
    });
  },
  dessinerPieges(buf) {
    const p = game.player, S = this.S();
    if (!S.pieges.length) return;
    PE.buf = buf;
    const T = { night: false, t: game.time };
    for (const t of S.pieges) {
      const d = Math.hypot(t.x - p.pos[0], t.z - p.pos[2]);
      if (d > (p.crouch > 0.5 ? 8 : 6)) continue; // on ne les voit que de près
      PE.frame(t.x, t.y, t.z, t.r || 0, 1);
      PE.fl = game.target && game.target.piege === t ? FX_HI : 0;
      PROP_MODELS.piege_loup(PE, { data: { shut: t.shut, prise: t.prise && !this.piegeEnt(t) ? 1 : 0, sang: t.sang } }, T);
      PE.fl = 0;
    }
  },

  // ============================================================== bêtes dangereuses : ours, sangliers
  menaceDecide(e, p, cible) {
    if (Math.random() < p) this.furie(e, cible || 'joueur');
    else { const px = cible && cible.x !== undefined ? cible.x : game.player.pos[0], pz = cible && cible.z !== undefined ? cible.z : game.player.pos[2]; entities.startFlee(e, px, pz); e.timer = 5 + Math.random() * 3; e.calmeT = 14; }
  },
  furie(e, cible) {
    if (e.dead || e.piege) return;
    e.furie = { cible: cible || 'joueur', t: 0, coups: 0, fin: -1, passe: 0 };
    e.state = 'charge'; e.calmeT = 0;
    this.sonGrogne(e, true);
    if (e.kind === 'bear' && cible === 'joueur' && e.dist < 40) game.shakeT = Math.max(game.shakeT || 0, 0.3);
  },
  finFurie(e, x, z) { e.furie = null; entities.startFlee(e, x, z); e.timer = 6 + Math.random() * 4; e.calmeT = 25; },
  danger(e, dt, w, c) {
    const T = CHASSE_DANGER[e.kind];
    e.attackT = Math.max(0, (e.attackT || 0) - dt);
    e.agite = Math.max(0, (e.agite || 0) - dt);
    e.calmeT = Math.max(0, (e.calmeT || 0) - dt);
    if (e.furie) return this.charger(e, T, dt, w, c);
    // les petits suivent leur mère
    if (e.mere) {
      const m = e.mere;
      if (!m.dead && !m.removed) {
        e.hx = m.x; e.hz = m.z;
        const dm = Math.hypot(m.x - e.x, m.z - e.z);
        if ((m.state === 'flee' || m.furie) && dm > 3) { entities.goTo(e, m.x, m.z, 'walk', true); }
        else if (dm > 7 && e.state !== 'flee') entities.goTo(e, m.x + (Math.random() - 0.5) * 3, m.z + (Math.random() - 0.5) * 3, 'walk', dm > 14);
      } else if (e.dist < 20 && e.state !== 'flee') { entities.startFlee(e, c.px, c.pz); }
      return false;
    }
    if (!c.alive || c.inside) return false;
    const ag = e.agite > 0 ? 1.5 : 1, d = e.dist;
    if (e.calmeT > 0) { if (d < T.proche && e.state !== 'flee') { entities.startFlee(e, c.px, c.pz); e.timer = 4; } return false; }
    // surprise : on arrive en courant tout près d'elle
    if (c.sprint && d < T.surprise) { this.menaceDecide(e, T.pSurprise * ag); return !!e.furie; }
    // trop près, trop longtemps
    if (d < T.proche) { e.procheT = (e.procheT || 0) + dt * (c.crouch ? 0.6 : 1); if (e.procheT > T.patience) { e.procheT = 0; this.menaceDecide(e, T.pProche * ag); return !!e.furie; } }
    else e.procheT = Math.max(0, (e.procheT || 0) - dt);
    // ses petits
    if (e.petits && T.pPetits) for (const b of e.petits) if (!b.dead && !b.removed && Math.hypot(b.x - c.px, b.z - c.pz) < 12) { this.menaceDecide(e, T.pPetits); return !!e.furie; }
    // les battues
    if (this.battueActive) {
      e.chasseurT = (e.chasseurT || 0) - dt;
      if (e.chasseurT <= 0) {
        e.chasseurT = 2;
        for (const n of this.chasseurs()) if (Math.hypot(n.x - e.x, n.z - e.z) < 28 && Math.random() < T.pChasseur * ag) { this.furie(e, n); return true; }
      }
    }
    // en alerte : elle fait face, grogne, ne bouge plus
    if (d < T.alerte * ag && e.state !== 'flee') {
      e.state = 'idle'; e.timer = 2; e.move = lerp(e.move || 0, 0, Math.min(1, dt * 6)); e.grazeT = 0;
      e.heading = turnToward(e.heading, Math.atan2(c.px - e.x, c.pz - e.z), dt * 2);
      e.lookY = 0;
      e.grogneT = (e.grogneT || 0) - dt;
      if (e.grogneT <= 0) { e.grogneT = 2.5 + Math.random() * 3; this.sonGrogne(e, d < T.proche); }
      return true;
    }
    return false;
  },
  charger(e, T, dt, w, c) {
    const F = e.furie;
    F.t += dt;
    let tx, tz, n = null;
    if (F.cible === 'joueur') {
      if (!c.alive || c.inside || game.dying) { this.finFurie(e, c.px, c.pz); return false; }
      tx = c.px; tz = c.pz;
    } else {
      n = F.cible;
      if (!n.st.alive || n.state === 'gone' || n.vanished) { this.finFurie(e, n.x, n.z); return false; }
      tx = n.x; tz = n.z;
    }
    const d = Math.hypot(tx - e.x, tz - e.z);
    if (d > 45 || F.t > 25) { this.finFurie(e, tx, tz); return false; }
    if (F.fin >= 0) { F.fin -= dt; if (F.fin <= 0) { this.finFurie(e, tx, tz); return false; } }
    if (F.passe > 0) F.passe -= dt; // le sanglier passe sur sa lancée
    else e.heading = turnToward(e.heading, Math.atan2(tx - e.x, tz - e.z), dt * (e.kind === 'bear' ? 3.2 : 3.8));
    const faible = e.hp < (e.hp0 || e.hp) * 0.3 ? 0.7 : 1;
    if (d > T.portee * 0.8 || F.passe > 0) { entities.stepMove(e, dt, w, e.cfg.run * faible); e.move = 1; e.run = true; e.phase += dt * 9; }
    else e.move = lerp(e.move, 0.3, Math.min(1, dt * 8));
    e.grogneT = (e.grogneT || 0) - dt;
    if (e.grogneT <= 0) { e.grogneT = 1.5 + Math.random() * 2; this.sonGrogne(e, true); }
    if (d < T.portee && e.attackT <= 0 && F.fin < 0) {
      e.attackT = e.kind === 'bear' ? 1.4 : 1.2;
      F.coups++;
      const [a, b] = T.degats;
      let dmg = a + Math.random() * (b - a);
      if (n) {
        npcs.hurt(n, dmg * 1.2, e.kind === 'bear' ? 'ours' : 'sanglier');
        if (n.st.alive) npcs.say(n, pick(['Aaah ! À l’aide !', 'Recule ! Recule, sale bête !', 'Mon Dieu !']), 2);
      } else {
        const p = game.player;
        if (e.kind === 'bear' && p.hp < 30 && Math.random() < 0.45) dmg = p.hp + 5; // un coup de patte, et c'est fini
        const [s0, s1] = T.saigne;
        corps.saigner(s0 + Math.random() * (s1 - s0), T.cause);
        play.hurt(dmg, e, T.cause);
        game.shakeT = Math.max(game.shakeT || 0, e.kind === 'bear' ? 0.7 : 0.45);
      }
      this.sonGrogne(e, true);
      // puis la bête rompt, le plus souvent
      let pFin = F.coups >= T.coupsMax ? 1 : F.coups === 1 ? 0.3 : 0.55;
      const p = game.player, immobile = !n && c.crouch && Math.hypot(p.vel[0], p.vel[2]) < 0.3;
      if (immobile) pFin = Math.max(pFin, 0.75); // faire le mort
      if (Math.random() < pFin) F.fin = 1 + Math.random();
      if (e.kind === 'boar' && F.fin < 0) F.passe = 1.4;
    }
    return true;
  },
  // blessée sans être tuée : elle charge (souvent), ou elle fuit en saignant
  blesseReagit(e, src) {
    const T = CHASSE_DANGER[e.kind];
    if (!T || e.furie || e.dead || e.piege || e.mere) return;
    if (Math.random() < T.pBlesse) this.furie(e, src || 'joueur');
  },

  // ============================================================== les chasseurs du Chassedi
  estChasseur(n) { return n && (n.d.id === 'chasseur' || n.d.id === 'garde'); },
  fenetreBattue(n, h) {
    if (!farm.s || typeof cal === 'undefined' || !cal.is('chasse')) return false;
    if (strange.redNight && strange.redNight()) return false;
    if (n.d.id === 'chasseur') return (h >= 5.5 && h < 11) || (h >= 14 && h < 18.5);
    if (n.d.id === 'garde') return h >= 6 && h < 8.5;
    return false;
  },
  enBattue(n) { return !!(n && this.estChasseur(n) && n.place === 'battue' && n.st.alive && !n.vanished && !n.hunting && !n.sleep && n.state !== 'dead' && n.state !== 'gone'); },
  chasseurs() { const out = []; for (const id of ['chasseur', 'garde']) { const n = npcs.byId[id]; if (this.enBattue(n)) out.push(n); } return out; },
  // les postes de chasse : bois autour du relais (matin), lande (après-midi)
  postes() {
    const w = game.world;
    if (w._chassePostes) return w._chassePostes;
    const R = w.relais || (w.lm.relais_chasse ? { x: w.lm.relais_chasse.x, z: w.lm.relais_chasse.z } : w.lm.foret ? { x: w.lm.foret.x, z: w.lm.foret.z } : { x: w.size / 2, z: w.size / 2 });
    const rnd = mulberry32(((farm.s && farm.s.seed) | 0) * 13 + 7), foret = [], lande = [];
    for (let k = 0; k < 1600 && (foret.length < 30 || lande.length < 16); k++) {
      const a = rnd() * TAU, r = 45 + rnd() * 1050, x = R.x + Math.cos(a) * r, z = R.z + Math.sin(a) * r;
      if (!w.inside(x, z, 40) || w.heightAt(x, z) < w.waterLevel + 0.6 || w.normalAt(x, z)[1] < 0.82 || interditDeBatir(x, z, 6)) continue;
      const b = game.biomeAt([x, 0, z]);
      if ((b === 'foret' || b === 'bouleaux') && r < 380 && foret.length < 30) { if (pointFree(w, x, z, 0.8)) foret.push([x, z]); }
      else if (b === 'lande' && lande.length < 16) { if (pointFree(w, x, z, 0.8)) lande.push([x, z]); }
    }
    if (!foret.length) foret.push([R.x + 18, R.z + 12], [R.x - 16, R.z + 20]);
    return (w._chassePostes = { foret, lande: lande.length ? lande : foret, R });
  },
  destBattue(n) {
    if (n.recup && !n.recup.removed) return { node: npcs.nearestReach(n.recup.x, n.recup.z, (q) => !/:(in|mid)$/.test(q.tag)), x: n.recup.x + 0.8, z: n.recup.z + 0.8, pose: null };
    n.recup = null;
    const Z = this.postes(), h = npcs.hour(), L = n.d.id === 'chasseur' && h >= 12 ? Z.lande : Z.foret;
    const [x, z] = L[(Math.random() * L.length) | 0];
    return { node: npcs.nearestReach(x, z, (q) => !/:(in|mid)$/.test(q.tag)), x, z, pose: null };
  },
  // un habitant vise : il s'arrête, se tourne, épaule (le fusil passe du dos aux mains)
  viser(n, cible, duree) {
    n.vise = cible; n.viseT = duree;
    if (n.state === 'walk') { n.chasseMarche = true; n.state = 'idle'; }
    if (n.goal) { if (n.goal.pose !== 'fish') n.goalPose0 = n.goal.pose; n.goal.pose = 'fish'; }
    n.move = 0;
  },
  finVise(n) {
    n.vise = null; n.viseT = 0;
    if (n.goal && n.goal.pose === 'fish') n.goal.pose = n.goalPose0 ?? null;
    n.goalPose0 = undefined;
    if (n.chasseMarche) { n.chasseMarche = false; if (n.state === 'idle' && n.goal && ((n.path && n.pi < n.path.length) || Math.hypot(n.goal.x - n.x, n.goal.z - n.z) > 0.5)) n.state = 'walk'; }
  },
  // un habitant tire : le son vient de loin ; la bête tombe, ou elle file
  tirPNJ(n) {
    const V = n.vise;
    this.sonTir([n.x, n.y + 1.5, n.z]);
    n.flashT = 0.08;
    entities.scare(n.x, n.z, 80);
    for (const e of entities.list) if (!e.dead && (e.kind === 'bear' || e.kind === 'boar') && Math.hypot(e.x - n.x, e.z - n.z) < 160) e.agite = 60;
    const e = V && V.e;
    if (e && !e.dead && !e.removed) {
      const d = Math.hypot(e.x - n.x, e.z - n.z), pHit = clamp(0.85 - d / 180, 0.3, 0.85);
      if (Math.random() < pHit) {
        this._src = n;
        const died = entities.damage(e, 140 + Math.random() * 60, n.x, n.z);
        this._src = null;
        if (died) { this.abattre(e, n); if (!n.recup && e.kind !== 'bear') { n.recup = e; n.goal = null; } }
        else { e.tireur = n; this.blesser(e, 70); }
      } else entities.scare(e.x, e.z, 50);
    }
    this.finVise(n);
  },
  chercherGibier(n) {
    let best = null, bd = 95;
    for (const e of entities.list) {
      if (e.dead || e.hidden || e.owner || e.removed || e.piege || !CHASSE_GIBIER.has(e.kind)) continue;
      const d = Math.hypot(e.x - n.x, e.z - n.z);
      if (d < bd && d > 6) { bd = d; best = e; }
    }
    if (best) this.viser(n, { e: best }, 0.9 + Math.random() * 0.8);
    else if (Math.random() < 0.35) this.viser(n, { e: null, a: Math.random() * TAU }, 0.8);
  },
  majChasseurs(dt) {
    const L = this.chasseurs();
    this.battueActive = L.length > 0;
    for (const id of ['chasseur', 'garde']) {
      const n = npcs.byId[id];
      if (!n) continue;
      n.flashT = Math.max(0, (n.flashT || 0) - dt);
      if (n.accourt) { this.majAccourt(n, dt); continue; }
      if (!L.includes(n)) { if (n.viseT) this.finVise(n); continue; }
      // une bête le charge : il fait face et tire (un coup toutes les secondes et demie)
      n.riposteT = (n.riposteT || 0) - dt;
      if (!n.viseT && n.riposteT <= 0) {
        n.riposteT = 0.3;
        for (const e of entities.list) if (e.furie && e.furie.cible === n && !e.dead) { this.viser(n, { e, bete: true }, 0.7); n.riposteT = 1.5; break; }
      }
      if (n.viseT > 0) {
        const V = n.vise;
        const tx = V.joueur ? game.player.pos[0] : V.e ? V.e.x : n.x + Math.sin(V.a || 0), tz = V.joueur ? game.player.pos[2] : V.e ? V.e.z : n.z + Math.cos(V.a || 0);
        n.heading = turnToward(n.heading, Math.atan2(tx - n.x, tz - n.z), dt * 5);
        n.move = 0; n.state = 'idle';
        n.viseT -= dt;
        if (V.joueur && this.accidentAnnule(n)) continue;
        if (n.viseT <= 0) { if (V.joueur) this.tirAccident(n); else this.tirPNJ(n); }
        continue;
      }
      // la prise : il va la chercher
      if (n.recup) {
        if (n.recup.removed) { n.recup = null; n.goal = null; }
        else if (n.state === 'idle' && Math.hypot(n.recup.x - n.x, n.recup.z - n.z) < 3) { this.oter(n.recup); n.recup = null; n.goal = null; }
      }
      // de poste en poste
      if (n.state === 'idle' && !n.recup) { n.posteT = (n.posteT ?? 18 + Math.random() * 25) - dt; if (n.posteT <= 0) { n.posteT = null; n.goal = null; } }
      else if (n.state === 'idle') n.heading += Math.sin(game.time * 0.4 + n.id.length) * dt * 0.3;
      n.tirT = (n.tirT ?? 12 + Math.random() * 25) - dt;
      if (n.tirT <= 0) { n.tirT = 20 + Math.random() * 40; this.chercherGibier(n); }
    }
  },
  // le fusil dessiné sur les chasseurs : dans le dos en marchant, aux mains pour tirer
  armerPNJ() {
    for (const id of ['chasseur', 'garde']) {
      const n = npcs.byId[id];
      if (!n || !n.rig || n.fusilParts || !n.rig.has('torso') || !n.rig.has('handR')) continue;
      n.fusilParts = true;
      const bois = rgbf('#5a3a22'), acier = rgbf('#34363c');
      n.rig = rigPlus(n.rig, [
        { name: 'fusilD0', parent: 'torso', p: [0.04, 0.3, -0.16], s: [0.05, 0.72, 0.035], o: [0, 0.14, 0], col: acier, tex: TL.iron, r0: [0.12, 0, 0.5], hide: true },
        { name: 'fusilD1', parent: 'torso', p: [0.04, 0.3, -0.16], s: [0.07, 0.34, 0.09], o: [0, -0.34, 0], col: bois, tex: TL.darkwood, r0: [0.12, 0, 0.5], hide: true },
        { name: 'fusilD2', parent: 'torso', p: [0.04, 0.3, -0.16], s: [0.045, 0.26, 0.045], o: [0, 0.02, -0.05], col: acier, tex: TL.iron, r0: [0.12, 0, 0.5], hide: true },
        { name: 'fusilM0', parent: 'handR', p: [0, -0.03, 0.04], s: [0.035, 0.035, 0.72], o: [0, 0, 0.36], col: acier, tex: TL.iron, r0: [0.9, 0, 0], hide: true },
        { name: 'fusilM1', parent: 'handR', p: [0, -0.03, 0.04], s: [0.07, 0.1, 0.36], o: [0, -0.02, -0.16], col: bois, tex: TL.darkwood, r0: [0.9, 0, 0], hide: true },
        { name: 'fusilM2', parent: 'handR', p: [0, -0.03, 0.04], s: [0.045, 0.045, 0.26], o: [0, 0.06, 0.1], col: acier, tex: TL.iron, r0: [0.9, 0, 0], hide: true },
      ]);
    }
  },
  poseFusilPNJ(n) {
    if (!n.fusilParts) return;
    const on = this.enBattue(n) || !!n.accourt, main = on && n.viseT > 0, r = n.rig;
    for (let k = 0; k < 3; k++) { const a = r.part('fusilD' + k), b = r.part('fusilM' + k); if (a) a.hide = !on || main; if (b) b.hide = !main; }
    // le garde range sa hallebarde pour la battue
    if (n.d.id === 'garde') for (const nm of ['it0', 'it1']) { const q = r.part(nm); if (!q) continue; if (on) { if (q.s) { q._s = q.s; q.s = null; } } else if (q._s) { q.s = q._s; q._s = null; } }
  },

  // ============================================================== pris pour un gibier
  signale(n) {
    const S = this.S(), s = farm.s;
    if (S.signal[n.d.id] === s.day || S.siffle > s.hours) return true;
    if (game.lantern && farm.count('lanterne')) return true;
    if (farm.count('brassard_rouge')) return true;
    return false;
  },
  dansLesFougeres(p) {
    const b = game.biomeAt(p.pos);
    if (b === 'foret' || b === 'bouleaux') return true;
    let v = false;
    game.world.query(p.pos[0], p.pos[2], 1.3, (o) => { if (v || !o || o.gone) return; const T = OBJ_TYPES[o.t]; if (T && CHASSE_VEGETATION.has(T.id) && Math.hypot(o.x - p.pos[0], o.z - p.pos[2]) < 1.3) v = true; }, null);
    return v;
  },
  ligneDeVue(a, b) {
    const w = game.world, dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], d = Math.hypot(dx, dy, dz) || 1, dir = [dx / d, dy / d, dz / d];
    const th = w.raycastTerrain(a, dir, d);
    if (th && th.t < d - 0.5) return false;
    const bh = w.raycastBlocks(a, dir, d);
    return !(bh && bh.t < d - 0.5);
  },
  verifAccident(dt) {
    this.accT -= dt;
    if (this.accT > 0) return;
    this.accT = 1;
    const p = game.player;
    if (game.dying || game.sleeping || p.riding || p.underground || strange.inEnvers()) return;
    for (const n of this.chasseurs()) {
      if (n.viseT > 0 || n.accourt) continue;
      const d = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]);
      if (d < 12 || d > 110) continue;
      if (this.signale(n) || !this.dansLesFougeres(p)) continue;
      if (!(p.crouch > 0.5 || this.immobileT > 4)) continue;
      if (!this.ligneDeVue([n.x, n.y + 1.6, n.z], [p.pos[0], p.pos[1] + 0.9, p.pos[2]])) continue;
      const h = npcs.hour();
      let P = (1 / 700) * (p.crouch > 0.5 ? 1.4 : 1) * (h < 7.5 || h > 17.5 ? 1.5 : 1);
      if (this.hasard !== null) P = this.hasard;
      if (Math.random() < P) { this.debutAccident(n); return; }
    }
  },
  debutAccident(n) {
    this.accident = { n };
    this.viser(n, { joueur: true }, 1.2);
    // un bruit sec, au loin : il a armé son fusil
    if (sound.ok) { const { d, pan } = this.spatial(n.x, n.z), k = clamp(1 - d / 120, 0.05, 1); sound.tone(sound.ctx.currentTime + 0.02, 'square', 900, 700, 0.03, 0.03 * k, sound.pan(pan)); }
  },
  // pendant qu'il vise : se lever, courir, siffler, allumer la lanterne… et il baisse son arme
  accidentAnnule(n) {
    const p = game.player, bouge = Math.hypot(p.vel[0], p.vel[2]) > 2.5 && p.crouch < 0.5;
    if (!bouge && !this.signale(n)) return false;
    this.finVise(n); this.accident = null;
    n.tirT = 30;
    npcs.say(n, pick(['Il y a quelqu’un ? Holà !', 'Qui va là ? Parlez, bon sang !', 'C’est vous ? J’ai failli…']), 3);
    return true;
  },
  tirAccident(n) {
    const p = game.player, S = this.S();
    this.finVise(n);
    this.accident = null;
    n.tirT = 120;
    this.sonTir([n.x, n.y + 1.5, n.z]);
    n.flashT = 0.08;
    S.accidents++;
    npcs.remember(n, 'accident_chasse');
    const letal = this.hasardLetal !== null ? this.hasardLetal : 0.25 + (p.hp < 50 ? 0.15 : 0);
    if (Math.random() < letal) { game.die(`Pris pour un gibier par ${n.name} ${n.d.surname}, un jour de chasse`); return; }
    const cause = 'Une balle de chasseur, reçue dans les fougères';
    corps.saigner(0.1 + Math.random() * 0.18, cause);
    if (Math.random() < 0.2) corps.casserJambe(cause);
    play.hurt(26 + Math.random() * 18, null, cause);
    game.shakeT = 1; play.hurtFlash = 1;
    if (game.dying) return;
    ui.subtitle('', '(Un choc, puis la brûlure. On vous a tiré dessus.)', 4);
    n.accourt = { t: 0, dit: -1 }; n.talking = true; n.fleeT = 0;
  },
  // horrifié, il accourt, panse comme il peut, s'excuse
  majAccourt(n, dt) {
    const A = n.accourt, p = game.player, w = game.world;
    A.t += dt;
    if (!n.st.alive || game.dying || A.t > 60) { n.accourt = null; n.talking = false; return; }
    const dx = p.pos[0] - n.x, dz = p.pos[2] - n.z, d = Math.hypot(dx, dz);
    n.heading = turnToward(n.heading, Math.atan2(dx, dz), dt * 6);
    if (A.dit < 0) {
      if (d > 1.7) {
        let nx = n.x + Math.sin(n.heading) * 4.4 * dt, nz = n.z + Math.cos(n.heading) * 4.4 * dt;
        [nx, nz] = w.collideCircle(nx, nz, n.y, n.y + 1.7, 0.28, 0.5, true);
        if (Math.hypot(nx - n.x, nz - n.z) < 4.4 * dt * 0.2) { A.bloque = (A.bloque || 0) + dt; if (A.bloque > 2.5) { nx = p.pos[0] - dx / d * 2; nz = p.pos[2] - dz / d * 2; A.bloque = 0; } }
        n.x = nx; n.z = nz; n.y = w.groundAt(nx, nz, n.y + 0.6, 0.6);
        n.move = 1; n.run = true; n.phase += dt * 8;
        if (!A.cri && A.t > 0.8) { A.cri = true; npcs.say(n, 'Non ! Non, non, non… Ne bougez pas ! J’arrive !', 3); }
        return;
      }
      A.dit = 0; A.t2 = 0;
    }
    n.move = 0; n.run = false;
    A.t2 += dt;
    const L = [
      'Mon Dieu… Je vous ai pris pour un chevreuil. Dans les fougères, tapi… Je n’ai vu que le mouvement.',
      'Serrez ça sur la plaie. Fort. Plus fort. Voilà.',
      'Le Chassedi, portez du rouge. Ou parlez, sifflez, n’importe quoi. Pour l’amour du ciel.',
    ];
    if (A.dit < L.length && A.t2 > A.dit * 3.2) {
      npcs.say(n, L[A.dit], 3.4);
      if (A.dit === 1) { corps.C().saigne = (corps.C().saigne || 0) * 0.4; farm.give('bandage', 1); play.flyer('bandage', [n.x, n.y + 1.2, n.z], 1); }
      A.dit++;
    }
    if (A.dit >= L.length && A.t2 > L.length * 3.2 + 1) { npcs.addAmitie(n, 40); n.accourt = null; n.talking = false; n.posteT = 40; n.goal = null; }
  },

  // ============================================================== l'appeau
  appeau() {
    if (game.time < this.appeauT) return;
    this.appeauT = game.time + 4;
    const p = game.player, h = npcs.hour(), nuit = h < 5.5 || h > 21;
    if (sound.ok) { const t = sound.ctx.currentTime + 0.02; for (let i = 0; i < 2; i++) sound.voice(t + i * 0.42, 'sawtooth', 520, 330, 0.3, 0.05, sound.sfx, { bp: 900, q: 2.2 }); }
    let n = 0;
    for (const e of entities.list) {
      if (e.dead || e.hidden || e.owner || e.removed || e.piege || e.furie || e.cfg.fly) continue;
      const d = Math.hypot(e.x - p.pos[0], e.z - p.pos[2]);
      const loup = e.kind === 'wolf' && nuit && d < 160, ours = e.kind === 'bear' && d < 120 && Math.random() < 0.25;
      if (!(loup || ours || (d < 90 && (CHASSE_GIBIER.has(e.kind) || e.kind === 'ibex')))) continue;
      if (e.state === 'flee') continue;
      const k = Math.min(1, 14 / Math.max(d, 1));
      entities.goTo(e, p.pos[0] + (e.x - p.pos[0]) * k, p.pos[2] + (e.z - p.pos[2]) * k, 'walk', false);
      n++;
    }
    return n;
  },

  // ============================================================== chaque image
  update(dt, eye, basis, sky, playing) {
    if (!farm.s || !game.world) return;
    const p = game.player;
    this.majFusil(dt, playing);
    if (playing) this.immobileT = Math.hypot(p.vel[0], p.vel[2]) < 0.3 ? this.immobileT + dt : 0;
    this.majPieges(dt, playing);
    if (!playing) return;
    this.majBlesses(dt);
    this.majChasseurs(dt);
    this.verifAccident(dt);
    // la dépouille visée s'éclaire
    const t = game.target;
    if (t && t.kind === 'hook' && t.corpse) t.corpse.highlight = true;
  },
  // nouveau jour : les dépouilles pourrissent, les pièges prennent, les chasseurs relèvent et reposent
  jour() {
    const s = farm.s, S = this.S();
    S.depouilles = S.depouilles.filter((D) => s.day - D.j < 2);
    for (const e of entities.list.slice()) if (e.corpse && !e.piege && e.mortJour !== undefined && s.day - e.mortJour >= 2) this.oter(e);
    this.prisesDeLaNuit();
    this.leverPiegesChasseurs();
    if (typeof cal !== 'undefined' && cal.is('chasse')) this.poserPiegesChasseurs();
    for (const id of ['chasseur', 'garde']) { const n = npcs.byId[id]; if (n && n.st.alive) n.hp = Math.min(100, (n.hp || 100) + 40); }
    this.listeT = 0;
  },
  // chargement : on retrouve les dépouilles, les prises, les pièges des chasseurs
  auChargement(saved) {
    const s = farm.s;
    this.pris = null; this.accident = null; this.blesses = new Set(); this.listeT = 0; this.trapT = 0;
    const F = this.f;
    F.vise = 0; F.rearme = 0; F.tir = 0; F.flash = 0; F.reserve = 1; F.retenu = false; F.essouffle = 0; F.vmSig = '';
    if (F.lunette) this.lunette(false);
    if (F.fovSet) { F.fovSet = false; game.fovK = 1; }
    if (!saved) { s.chasse = null; }
    const S = this.S(), w = game.world;
    S.depouilles = S.depouilles.filter((D) => s.day - D.j < 2);
    for (const D of S.depouilles) {
      if (!CREATURES[D.k]) continue;
      const e = entities.add(w, D.k, D.x, D.z, { v: D.v, scale: D.sc || 1 });
      e.y = D.y ?? e.y; e.heading = D.h || 0; e.dead = true; e.corpse = true; e.hidden = false; e.depRec = D; e.mortJour = D.j;
    }
    this.armerPNJ();
    if (typeof cal !== 'undefined' && cal.is('chasse')) this.poserPiegesChasseurs();
  },
};

// ---------------------------------------------------------------- branchements (entités : au chargement du module)
{
  // les ours et les sangliers sauvages sont « calmes » : c'est la menace qui les fait charger
  const _make = entities.make.bind(entities);
  entities.make = function (w, kind, x, z, o, opts) {
    const e = _make(w, kind, x, z, o, opts);
    if (CHASSE_CALME[kind] && !(opts && opts.owner)) e.cfg = CHASSE_CALME[kind];
    e.hp0 = e.hp;
    return e;
  };
  // une ourse sur deux a ses petits (toujours les mêmes : tirés de la place de l'ourse)
  const _sf = entities.spawnFrom.bind(entities);
  entities.spawnFrom = function (w, o, kind) {
    const arr = _sf(w, o, kind);
    if (kind !== 'bear' || arr.length !== 1 || !CHASSE_CALME.ourson) return arr;
    const rnd = mulberry32(((o.x * 131) | 0) ^ ((o.z * 71) | 0) ^ 0x5eed);
    if (rnd() > 0.45) return arr;
    const m = arr[0];
    m.petits = [];
    const n = 1 + (rnd() < 0.4 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const c = this.make(w, 'bear', o.x + 1.5 + k, o.z + 1 - k, o, { scale: 0.42, v: m.v });
      c.cfg = CHASSE_CALME.ourson; c.hp = 45; c.hp0 = 45; c.mere = m; c.ourson = true;
      m.petits.push(c); arr.push(c);
    }
    return arr;
  };
  // dégâts : une bête dangereuse blessée réagit (charge ou fuite)
  const _dmg = entities.damage.bind(entities);
  entities.damage = function (e, dmg, fx, fz) {
    const src = chasse._src; chasse._src = null;
    const died = _dmg(e, dmg, fx, fz);
    if (!died && !e.dead && !e.owner && CHASSE_DANGER[e.kind]) chasse.blesseReagit(e, src || 'joueur');
    return died;
  };
  // comportement : bête prise au piège, bête dangereuse
  const _uw = entities.updateWalker.bind(entities);
  entities.updateWalker = function (e, dt, w, c) {
    if (e.piege) { chasse.seDebat(e, dt, w, c); return; }
    if (!e.owner && CHASSE_DANGER[e.kind] && game.kind === 'farm' && chasse.danger(e, dt, w, c)) return;
    return _uw(e, dt, w, c);
  };
  // bêtes tuées : une dépouille pour le gibier sauvage ; le sacrilège (cygne de la Dame)
  const _hc = play.hurtCreature.bind(play);
  play.hurtCreature = function (e, dmg, eye) {
    if (!chasse.aDepouille(e)) {
      const r = _hc(e, dmg, eye);
      if (e.dead && !e.owner) { const S = chasse.S(); S.tableau[e.kind] = (S.tableau[e.kind] || 0) + 1; chasse.sacre(e); }
      return r;
    }
    const died = entities.damage(e, dmg, eye[0], eye[2]);
    sound.hurtAnimal && sound.hurtAnimal(e.kind);
    if (!died) { chasse.blesser(e, dmg); return; }
    if (e.piege) { e.dead = true; e.corpse = true; e.hidden = false; chasse.majPiege(e.piege, { vivant: 0 }); return; }
    chasse.abattre(e, 'joueur');
    entities.scare(e.x, e.z, 20);
  };
  // le cerf blanc (chose étrange) : le toucher est un sacrilège, quelle que soit l'arme
  const _sh = strange.hit.bind(strange);
  strange.hit = function (e, dmg, from) {
    if (e && e.kind === 'stag' && !e.sacrilegeFait) { e.sacrilegeFait = true; chasse.sacrilege('Le Cerf blanc, visé et touché'); }
    return _sh(e, dmg, from);
  };
  // le joueur : pris au piège, il ne bouge plus ; à la lunette, on marche lentement et on ne court pas
  const _pu = Player.prototype.update;
  Player.prototype.update = function (dt, w, c) {
    if (typeof game !== 'undefined' && game.kind === 'farm' && farm.s && this === game.player) {
      if (chasse.pris) c = Object.assign({}, c, { fwd: 0, right: 0, up: false, sprint: false });
      else if (chasse.f.lunette) {
        c = Object.assign({}, c, { sprint: false });
        const sp = this.mods.speed;
        this.mods.speed = sp * 0.45;
        try { return _pu.call(this, dt, w, c); } finally { this.mods.speed = sp; }
      }
    }
    return _pu.call(this, dt, w, c);
  };
  // les pièges posés sont armés (et l'on retient qui vous a vu les poser)
  const _add = farm.addProp.bind(farm);
  farm.addProp = function (p) {
    if (p && p.id === 'piege_loup') chasse.surPose(p);
    const q = _add(p);
    if (q && q.id === 'piege_loup') q._grace = game.time + 1.5; // le temps de retirer le pied
    return q;
  };
  // la battue : le Chassedi, aux heures de chasse, le chasseur (et le garde) vont de poste en poste
  const _sp = npcs.schedulePlace.bind(npcs);
  npcs.schedulePlace = function (n, h) {
    const r = _sp(n, h);
    if (chasse.estChasseur(n) && chasse.fenetreBattue(n, h) && !r.sleep) return { place: 'battue', sleep: false };
    return r;
  };
  const _dest = npcs.dest.bind(npcs);
  npcs.dest = function (n, pl, sleep) {
    if (pl === 'battue') { try { const D = chasse.destBattue(n); if (D && D.node >= 0) return D; } catch (err) { console.error(err); } pl = 'foret'; }
    return _dest(n, pl, sleep);
  };
}
// à la lunette, on voit loin : les bêtes et les habitants dans le champ de la lunette sont dessinés jusqu'à ~380 m
{
  const dansLaLunette = (x, z, cam, near) => {
    const F = chasse.f, f = cameraBasis(F.aimYaw, F.aimPitch).f, dx = x - cam[0], dz = z - cam[2], d = Math.hypot(dx, dz), fh = Math.hypot(f[0], f[2]) || 1;
    return d > near && d < 380 && (dx * f[0] + dz * f[2]) / (d * fh) > 0.975;
  };
  const _ed = entities.draw.bind(entities);
  entities.draw = function (buf, sbuf, cam, maxD, t, flags) {
    _ed(buf, sbuf, cam, maxD, t, flags);
    if (!chasse.f.lunette) return;
    const far = this.list.filter((e) => !e.hidden && !e.removed && (!e.dead || e.corpse) && dansLaLunette(e.x, e.z, cam, maxD));
    if (!far.length) return;
    const L = this.list, farF = far.map((e) => e.far);
    this.list = far;
    for (const e of far) e.far = false;
    try { _ed(buf, sbuf, cam, 385, t, flags); } finally { this.list = L; far.forEach((e, i) => { e.far = farF[i]; }); }
  };
  const _nd = npcs.draw.bind(npcs);
  npcs.draw = function (buf, sbuf, cam, t, maxD) {
    _nd(buf, sbuf, cam, t, maxD);
    if (!chasse.f.lunette) return;
    const far = this.list.filter((n) => n.state !== 'gone' && !n.vanished && !n.hunting && dansLaLunette(n.x, n.z, cam, maxD));
    if (!far.length) return;
    const L = this.list;
    this.list = far;
    try { _nd(buf, sbuf, cam, t, 385); } finally { this.list = L; }
  };
}
// le piège : lueur quand on le vise, sang sur les dents
{
  const _pl = PROP_MODELS.piege_loup;
  PROP_MODELS.piege_loup = function (E, o, t) {
    const hi = typeof game !== 'undefined' && game.hiProp === o;
    if (hi) E.fl = FX_HI;
    const o2 = o.data && o.data.prise && chasse.piegeEnt(o) ? Object.assign({}, o, { data: Object.assign({}, o.data, { prise: 0 }) }) : o;
    _pl(E, o2, t);
    if (o.data && o.data.sang) { E.bx(0.08, 0.035, 0.04, 0.26, 0.012, 0.2, [0.42, 0.04, 0.03], TL.plain); E.bx(-0.12, 0.035, -0.1, 0.12, 0.012, 0.1, [0.35, 0.03, 0.02], TL.plain); }
    if (hi) E.fl = 0;
  };
}
PROP_USE_MORE.piege_loup = 1;
HOOKS.propPre.piege_loup = (q) => { chasse.usePiege(q); return true; };
HOOKS.target.push((eye, f, cand) => chasse.cible(eye, f, cand));
HOOKS.camera.push((dt, pos, yaw, pitch) => chasse.camera(dt, pos, yaw, pitch));
HOOKS.update.push((dt, eye, basis, sky, playing) => chasse.update(dt, eye, basis, sky, playing));
HOOKS.day.push(() => chasse.jour());
HOOKS.draw.push((buf) => chasse.dessinerPieges(buf));
HOOKS.lights.push((eye) => {
  const L = [], F = chasse.f;
  if (F.flash > 0) L.push({ x: eye[0], y: eye[1], z: eye[2], r: 16, c: [1.7, 1.25, 0.7], d: 0 });
  for (const id of ['chasseur', 'garde']) { const n = npcs.byId[id]; if (n && n.flashT > 0 && Math.hypot(n.x - eye[0], n.z - eye[2]) < 90) L.push({ x: n.x, y: n.y + 1.5, z: n.z, r: 12, c: [1.6, 1.2, 0.7], d: Math.hypot(n.x - eye[0], n.z - eye[2]) }); }
  return L;
});
// le fusil : clic = tirer ; la visée se lit au maintien du bouton droit ; l'appeau
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (id === 'fusil') { if (!held) chasse.tirer(); return true; }
  if (id === 'appeau') { if (!held) chasse.appeau(); return true; }
  return false;
});
HOOKS.secondary.push((eye, basis, it, id) => id === 'fusil');
HOOKS.death.push(() => { chasse.pris = null; if (chasse.f.lunette) chasse.lunette(false); if (chasse.f.fovSet) { chasse.f.fovSet = false; game.fovK = 1; } return false; });
// ---------------------------------------------------------------- au premier chargement : game, talk, preDraw
let chasseHooksOn = false;
HOOKS.load.push((saved) => {
  if (!chasseHooksOn) {
    chasseHooksOn = true;
    // l'objet en main : poses du fusil (repos, visée, tir)
    const _vm = game.viewModel.bind(game);
    game.viewModel = function (p, dt) { return chasse.vueEnMain(_vm(p, dt)); };
    // pris au piège, la touche E sert à se dégager
    const _int = game.interact.bind(game);
    game.interact = function () {
      if (chasse.pris && !(typeof cine !== 'undefined' && cine.on)) { chasse.degager(); return; }
      return _int();
    };
    // siffler : les chasseurs vous entendent
    const _wh = game.whistle.bind(game);
    game.whistle = function () {
      _wh();
      const p = this.player, S = chasse.S();
      let dit = false;
      for (const n of chasse.chasseurs()) {
        const d = Math.hypot(n.x - p.pos[0], n.z - p.pos[2]);
        if (d > 160) continue;
        S.siffle = farm.s.hours + 3;
        if (n.viseT > 0 && n.vise && n.vise.joueur) { chasse.finVise(n); chasse.accident = null; }
        if (!dit && d < 110) { dit = true; setTimeout(() => { if (!game.dying) npcs.say(n, pick(['Je vous entends ! Je ne tire pas de ce côté !', 'Compris ! Restez où vous êtes, je m’éloigne.', 'Holà ! Merci de prévenir !']), 3); }, 900); }
      }
    };
    // prévenir le chasseur (ou le garde) : lui parler le matin du Chassedi suffit
    const _open = talk.open.bind(talk);
    talk.open = function (n) {
      const v = _open(n);
      if (chasse.estChasseur(n) && typeof cal !== 'undefined' && cal.is('chasse') && npcs.hour() < 12.5) chasse.S().signal[n.d.id] = farm.s.day;
      return v;
    };
    const _opts = talk.options.bind(talk);
    talk.options = function () {
      const opts = _opts(), n = this.n;
      if (n && chasse.estChasseur(n) && typeof cal !== 'undefined' && cal.is('chasse') && npcs.hour() < 19) {
        const i = opts.findIndex((o) => o.act === 'bye');
        opts.splice(i >= 0 ? i : opts.length, 0, { label: 'Je serai dans les bois aujourd’hui.', act: 'chasse_signal' });
      }
      return opts;
    };
    const _choose = talk.choose.bind(talk);
    talk.choose = function (act) {
      if (act === 'chasse_signal' && this.n) {
        const n = this.n;
        chasse.S().signal[n.d.id] = farm.s.day;
        npcs.addAmitie(n, 3);
        return this.view(n.d.id === 'garde' ? 'Bien. Je préviendrai Brossard. Et vous, restez près des chemins.' : 'Bon. Je ferai attention. Portez du rouge, et ne restez pas tapi dans les fougères.', this.options());
      }
      return _choose(act);
    };
    // le fusil sur le modèle des chasseurs
    const _pd = npcs.preDraw;
    npcs.preDraw = (n, t) => { if (_pd) _pd(n, t); chasse.poseFusilPNJ(n); };
    // la barre d'outils : une case « fusil » possible (comme l'arc)
    if (typeof BAR_TOKENS !== 'undefined' && !BAR_TOKENS['@fusil']) BAR_TOKENS['@fusil'] = { name: 'Fusil de chasse', tool: 'fusil' };
  }
  chasse.auChargement(saved);
});
