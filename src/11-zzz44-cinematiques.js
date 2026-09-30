// ============================================================================
//  LES CINÉMATIQUES (moteur : cine, dans le socle). Courtes ; on peut les
//  passer (Espace), sauf celles de la mort.
//  - l'arrivée (partie neuve) : survol de la vallée jusqu'à la vieille ferme ;
//  - le début d'une nuit noire ; l'ouverture du temple ; la naissance d'une
//    tornade ; l'homme au long manteau ; l'ombre qui rattrape (mort) ;
//  - les Trois : Aëla sur la colline, Durn qui se lève, Vesh qui éteint les
//    étoiles ; le réveil du Dormeur.
//  Chaque scène applique ses effets dans debut()/fin() : passer la scène ne
//  saute pas ses conséquences.
// ============================================================================
const cinAdd = (a, b, k) => [a[0] + b[0] * (k ?? 1), a[1] + b[1] * (k ?? 1), a[2] + b[2] * (k ?? 1)];
const cinEase = (t) => t * t * (3 - 2 * t);
// l'avant du regard (horizontal)
function cinAvant() { const y = game.player.yaw; return [-Math.sin(y), 0, -Math.cos(y)]; }

const cinematiques = {
  // ------------------------------------------------------------ l'arrivée : survol de la vallée jusqu'à la ferme
  intro() {
    const w = game.world, F = w.farm && w.farm.f, B = w.bld.ferme;
    if (!F || !B) return Promise.resolve();
    const fy = w.heightAt(F.x, F.z), ville = farm.names ? farm.names.ville : 'la ville';
    const bx = B.x, bz = B.z, by = B.y || fy;
    const hy = (x, z, up) => Math.max(w.heightAt(x, z), w.waterLevel) + up;
    const p1 = [F.x - 360, hy(F.x - 360, F.z + 520, 170), F.z + 520], p2 = [F.x - 240, hy(F.x - 240, F.z + 340, 120), F.z + 340];
    const p3 = [F.x - 80, hy(F.x - 80, F.z + 95, 38), F.z + 95];
    return cine.jouer([
      { dur: 6, de: { pos: p1, look: [F.x + 120, fy + 30, F.z - 700] }, a: { pos: p2, look: [F.x + 60, fy + 10, F.z - 560] }, texte: `La vallée. Les Monts au nord, le grand lac à l’ouest, les toits de ${ville}, et entre les deux, trois kilomètres de prés, de bois et de silences.` },
      { dur: 6.5, de: { pos: p2, look: [bx, by, bz] }, a: { pos: p3, look: [bx, by + 3, bz] }, texte: 'Au bout d’un chemin de terre, la vieille ferme des Varenne. Personne n’y a vécu depuis l’hiver dernier.' },
      { dur: 5.5, orbite: { c: [bx, by + 2, bz], r: 24, h: 9, a0: Math.atan2(p3[0] - bx, p3[2] - bz), a1: Math.atan2(p3[0] - bx, p3[2] - bz) + 0.9, look: [bx, by + 2.5, bz] }, texte: 'Le notaire a écrit : elle est à vous. Avec ses dettes, ses murs, et ce qui vient avec.' },
      { dur: 1.6, de: { pos: [bx + 8, by + 3, bz + 8], look: [bx, by + 1.5, bz] }, fondu: 'noir' },
    ], {});
  },
  // ------------------------------------------------------------ le début d'une nuit noire
  nuitNoire() {
    const e = game.player.eyePos(), sky = game.sky, m = sky && sky.moonDir[1] > 0.1 ? sky.moonDir : v3.norm([cinAvant()[0], 0.55, cinAvant()[2]]);
    const haut = cinAdd(e, m, 60), bas = [haut[0], e[1] + 12, haut[2]];
    return cine.jouer([
      { dur: 5.5, de: { pos: e, look: bas }, a: { pos: e, look: haut }, chaque: (t) => { evenements.noirK = Math.max(evenements.noirK, clamp(t / 5, 0, 1)); } },
      { dur: 2.5, de: { pos: e, look: haut }, a: { pos: e, look: bas }, debut: () => { sound.whisper && sound.whisper(0, 0.6); } },
    ], {});
  },
  // ------------------------------------------------------------ la porte des Trois s'ouvre
  templeOuverture() {
    const w = game.world, T = w.temple, b = temple.porte();
    const door = b ? [b.x, b.y + 2.1, b.z] : [T.x, T.y + 2, T.z + 28.6];
    const out = b ? Math.sign((T.z + 36) - b.z) || 1 : 1;
    return cine.jouer([
      { dur: 2.8, orbite: { c: [T.x, T.y + 1.2, T.z + 36], r: 6, h: 1.8, a0: 0.6, a1: -0.6 }, debut: () => { for (const k of TPL_ORDRE) temple.note(k); } },
      { dur: 5, de: { pos: [door[0] + 1.5, door[1] + 0.4, door[2] + out * 12], look: door }, a: { pos: [door[0], door[1], door[2] + out * 7], look: door }, secousse: 0.05, debut: () => temple.animer() },
      { dur: 3.2, de: { pos: [door[0], door[1], door[2] + out * 5], look: [door[0], door[1] + 1, door[2] - out * 20] }, a: { pos: [door[0], door[1] + 0.3, door[2] - out * 2], look: [door[0], door[1] + 3, door[2] - out * 40] }, texte: 'dal tora , ithim kala', qui: 'Gravé au-dessus du seuil', fin: () => { if (!temple.anim) temple.cacherPorte(true); } },
    ], { apres: () => { if (!temple.anim) temple.cacherPorte(true); } });
  },
  // ------------------------------------------------------------ une tornade se forme
  tornade(T) {
    const e = game.player.eyePos(), mid = [lerp(e[0], T.x, 0.45), 0, lerp(e[2], T.z, 0.45)];
    mid[1] = Math.max(game.world.heightAt(mid[0], mid[2]), game.world.waterLevel) + 9;
    return cine.jouer([
      { dur: 3.6, de: { pos: e, look: [T.x, T.y + 70, T.z] }, a: { pos: e, look: [T.x, T.y + 30, T.z] }, debut: () => { sound.rumble && sound.rumble(); } },
      { dur: 3.6, de: { pos: mid, look: [T.x, T.y + 20, T.z] }, a: { pos: [mid[0], mid[1] - 3, mid[2]], look: [T.x, T.y + 8, T.z] }, secousse: 0.05 },
    ], {});
  },
  // ------------------------------------------------------------ l'homme au long manteau, au bord de la lumière
  tueur(E) {
    const e = game.player.eyePos(), cible = [E.x, E.y + 1.55, E.z], pres = [lerp(e[0], E.x, 0.2), e[1], lerp(e[2], E.z, 0.2)];
    return cine.jouer([
      { dur: 3.4, de: { pos: e, look: cible }, a: { pos: pres, look: cible }, chaque: (t) => { game.fovK = 1 - 0.3 * clamp(t / 3.4, 0, 1); }, fin: () => { game.fovK = 1; } },
    ], { apres: () => { game.fovK = 1; } });
  },
  // il vous a rattrapé (on ne passe pas la mort)
  tueurMort(E, fin) {
    const e = game.player.eyePos(), cible = [E.x, E.y + 1.6, E.z];
    return cine.jouer([
      { dur: 1.1, de: { pos: e, look: cible }, secousse: 0.04, texte: '', debut: () => { sound.stab && sound.stab(); play.hurtFlash = 1; } },
      { dur: 1.4, de: { pos: e, look: [cible[0], cible[1] - 1.2, cible[2]] }, fondu: 'noir', texte: '(Le froid de la lame.)' },
    ], { passer: false, apres: fin });
  },
  // ------------------------------------------------------------ l'ombre vous rattrape (la mort)
  ombre(fin) {
    const p = game.player, e = p.eyePos(), f = cinAvant(), r = [f[2], 0, -f[0]];
    const cam = [p.pos[0] - f[0] * 2.6 + r[0] * 2.2, e[1] + 0.4, p.pos[2] - f[2] * 2.6 + r[2] * 2.2];
    malOmbre.cine = true; malOmbre.vis = true; malOmbre.rig = malOmbre.rig || humanRig(MAL_OMBRE_LOOK);
    const w = game.world;
    return cine.jouer([
      { dur: 3.4, de: { pos: cam, look: [p.pos[0], p.pos[1] + 1.3, p.pos[2]] }, a: { pos: cinAdd(cam, f, -1), look: [p.pos[0], p.pos[1] + 1.2, p.pos[2]] }, joueur: true,
        chaque: (t) => { const d = lerp(9, 0.6, cinEase(clamp(t / 3.4, 0, 1))); malOmbre.x = p.pos[0] - f[0] * d; malOmbre.z = p.pos[2] - f[2] * d; malOmbre.y = w.groundAt(malOmbre.x, malOmbre.z, p.pos[1] + 1, 1); malOmbre.heading = Math.atan2(f[0], f[2]); if (Math.random() < 0.1) sound.heartbeat && sound.heartbeat(1); } },
      { dur: 1.6, de: { pos: cam, look: [p.pos[0], p.pos[1] + 1.2, p.pos[2]] }, fondu: 'noir', texte: '(Il vous a rattrapé.)' },
    ], { passer: false, apres: () => { malOmbre.cine = false; if (fin) fin(); } });
  },
  // ------------------------------------------------------------ Aëla, debout sur une colline, avant le soleil
  aela(opts) {
    opts = opts || {};
    const w = game.world, p = game.player, e = p.eyePos();
    let best = null;
    for (let k = 0; k < 48; k++) {
      const a = Math.PI / 2 + (k / 48 - 0.5) * 2.4, r = 55 + (k % 4) * 16, x = p.pos[0] + Math.sin(a) * r, z = p.pos[2] + Math.cos(a) * r;
      if (!w.inside(x, z, 20)) continue;
      const h = w.heightAt(x, z);
      if (h < w.waterLevel + 0.5) continue;
      const sc = h - p.pos[1] + Math.random() * 3;
      if (!best || sc > best.sc) best = { x, z, y: h, sc };
    }
    if (!best) best = { x: p.pos[0] + 40, z: p.pos[2], y: w.heightAt(p.pos[0] + 40, p.pos[2]) };
    const hd = Math.atan2(p.pos[0] - best.x, p.pos[2] - best.z);
    const F = divins.fig = { qui: 'aela', x: best.x, y: best.y, z: best.z, heading: hd, t: 0, s: 2.2, lum: 0, bras: 0 };
    divins.fogMin = 320;
    const tete = [F.x, F.y + 3.8, F.z], face = (d, h) => [F.x + Math.sin(hd) * d, F.y + h, F.z + Math.cos(hd) * d];
    const fin = () => { divins.fig = null; divins.fogMin = 0; };
    return cine.jouer([
      { dur: 5, de: { pos: e, look: [F.x, F.y + 1.5, F.z] }, a: { pos: e, look: tete }, chaque: (t) => { F.lum = clamp(t / 5, 0, 1) * 0.5; } },
      { dur: 6, orbite: { c: [F.x, F.y + 3.4, F.z], r: 10, h: 0.8, a0: hd - 0.55, a1: hd + 0.35, look: tete }, debut: () => divins.parler('aela', opts.veille ? 'aela_veille' : 'aela_aube', 400) },
      { dur: 5, de: { pos: face(15, 3), look: tete }, a: { pos: face(8, 3.3), look: tete }, debut: () => { F.bras = 1; divins.parler('aela', 'aela_don', 300); }, chaque: (t) => { F.lum = 0.5 + clamp(t / 5, 0, 1) * 0.6; } },
      { dur: 1.8, de: { pos: face(8, 3.3), look: tete }, fondu: 'noir', fin: () => { fin(); divins.donAela(!!opts.veille); } },
    ], { apres: fin });
  },
  // ------------------------------------------------------------ Durn se lève, dans la montagne
  durn(opts) {
    opts = opts || {};
    const w = game.world, p = game.player, e = p.eyePos(), M = w.lm.monts || { x: 1640, z: 420 };
    const a = Math.atan2(p.pos[0] - M.x, p.pos[2] - M.z);
    const dx = M.x + Math.sin(a) * 200, dz = M.z + Math.cos(a) * 200, dy = w.heightAt(dx, dz);
    const F = divins.fig = { qui: 'durn', x: dx, y: dy - 52, z: dz, heading: a, t: 0, s: 26, lean: 0.5, bras: 0 };
    divins.fogMin = 950;
    const cx = dx + Math.sin(a) * 320, cz = dz + Math.cos(a) * 320, cam = [cx, Math.max(w.heightAt(cx, cz) + 25, dy + 30), cz];
    const cam2 = [dx + Math.sin(a + 0.25) * 170, Math.max(w.heightAt(dx + Math.sin(a + 0.25) * 170, dz + Math.cos(a + 0.25) * 170) + 20, dy + 45), dz + Math.cos(a + 0.25) * 170];
    const tete = () => [F.x, F.y + 44, F.z];
    const fin = () => { divins.fig = null; divins.fogMin = 0; };
    const poussiere = () => { for (let i = 0; i < 3; i++) particles.spawn(F.x + (Math.random() - 0.5) * 50, dy + Math.random() * 6, F.z + (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 3, 1 + Math.random() * 2, (Math.random() - 0.5) * 3, [0.55, 0.52, 0.46, 0.6], 6 + Math.random() * 6, 5, 0, false); };
    return cine.jouer([
      { dur: 3, de: { pos: e, look: [lerp(e[0], dx, 0.2), e[1] + 12, lerp(e[2], dz, 0.2)] }, secousse: 0.08, debut: () => { sound.rumble && sound.rumble(); game.shakeT = 1; } },
      { dur: 7, de: { pos: cam, look: [dx, dy + 8, dz] }, a: { pos: cam, look: [dx, dy + 30, dz] }, secousse: 0.05, debut: () => { sound.rumble && sound.rumble(); }, chaque: (t, dt) => { const k = cinEase(clamp(t / 6.5, 0, 1)); F.y = dy - 52 + k * 52; F.lean = 0.5 * (1 - k); poussiere(); if (Math.random() < (dt || 1 / 60) * 1.2) sound.rumble && sound.rumble(); } },
      { dur: 5, de: { pos: cam2, look: tete() }, a: { pos: cam2, look: tete() }, secousse: 0.03, debut: () => { F.y = dy; F.lean = 0; F.bras = 0.3; divins.parler('durn', opts.colere ? 'durn_colere' : 'durn_leve', 300); } },
      { dur: 4.5, de: { pos: cam, look: [dx, dy + 30, dz] }, a: { pos: cam, look: [dx, dy + 10, dz] }, chaque: (t) => { const k = cinEase(clamp(t / 4.5, 0, 1)); F.y = dy - k * 52; F.lean = 0.5 * k; poussiere(); } },
      { dur: 1.2, de: { pos: cam, look: [dx, dy + 10, dz] }, fondu: 'noir', fin },
    ], { apres: () => { fin(); if (typeof evenements !== 'undefined' && !evenements.actifs.seisme) evenements.lancer('seisme'); } });
  },
  // ------------------------------------------------------------ Vesh : une ombre qui éteint les étoiles
  vesh(opts) {
    const w = game.world, p = game.player, e = p.eyePos(), f = cinAvant();
    const vx = p.pos[0] + f[0] * 170, vz = p.pos[2] + f[2] * 170, vy = Math.max(w.heightAt(vx, vz), w.waterLevel);
    const F = divins.fig = { qui: 'vesh', x: vx, y: vy - 80, z: vz, heading: Math.atan2(p.pos[0] - vx, p.pos[2] - vz), t: 0, s: 40, bras: 0 };
    divins.fogMin = 420; divins.etoiles = 1;
    const ciel = [e[0] + f[0] * 50, e[1] + 32, e[2] + f[2] * 50];
    const fin = () => { divins.fig = null; divins.fogMin = 0; divins.etoiles = -1; };
    return cine.jouer([
      { dur: 3.6, de: { pos: e, look: [ciel[0], ciel[1] - 15, ciel[2]] }, a: { pos: e, look: ciel }, },
      { dur: 7, de: { pos: e, look: [vx, vy + 20, vz] }, a: { pos: e, look: [vx, vy + 55, vz] }, chaque: (t, dt) => { const k = cinEase(clamp(t / 7, 0, 1)); F.y = vy - 80 + k * 80; F.bras = k; divins.etoiles = 1 - k * 0.75; if (Math.random() < (dt || 1 / 60) * 3) sound.whisper && sound.whisper(Math.random() * 2 - 1, 0.5); } },
      { dur: 4.5, de: { pos: e, look: [vx, vy + 55, vz] }, debut: () => divins.parler('vesh', 'vesh_etoiles', 200), chaque: (t) => { divins.etoiles = 0.25 * (1 - clamp(t / 4, 0, 1)); } },
      { dur: 1.4, de: { pos: e, look: [vx, vy + 40, vz] }, fondu: 'noir', fin },
    ], { apres: fin });
  },
  // ------------------------------------------------------------ on réveille le Dormeur
  durnEveil(n) {
    const w = game.world, T = w.temple, p = game.player, q = w.props.find((x) => x.id === 'dormeur');
    if (!q || !T) return Promise.resolve();
    const tete = [q.x, q.y + 2.6, q.z + 7.4], cam = [q.x + 6, q.y + 4, q.z + 19], pres = [q.x + 2, q.y + 3.2, q.z + 12.5];
    if (n >= 2) {
      return cine.jouer([
        { dur: 2.6, de: { pos: cam, look: tete }, a: { pos: pres, look: tete }, secousse: 0.12, debut: () => { temple.yeux = 1; sound.rumble && sound.rumble(); game.shakeT = 1; } },
        { dur: 1.6, de: { pos: pres, look: [tete[0], tete[1] + 4, tete[2]] }, secousse: 0.25, fondu: 'noir' },
      ], { passer: false, apres: () => { temple.yeux = 0; game.die('Écrasé sous la montagne : Durn ne voulait pas être réveillé deux fois'); } });
    }
    const S = temple.S();
    const consequences = () => {
      if (temple.yeux === 0 && S.chasse === farm.s.day) return;
      S.chasse = farm.s.day;
      temple.yeux = 0;
      // la montagne vous rejette : dehors, près de la cascade, brisé ; la porte s'est refermée
      S.ouvert = 0; temple.cacherPorte(false); temple.allumer(null, false); temple.seq = [];
      p.pos = [T.exit[0], T.exit[1] + 0.05, T.exit[2]]; p.vel = [0, 0, 0];
      game.renderer.uploadCover(p.pos[0], p.pos[2]);
      p.hp = Math.min(p.hp, 12);
      malediction.frapper('poids', 'durn');
      setTimeout(() => malediction.frapper('malchance', 'durn'), 6000);
      setTimeout(() => { if (!game.dying) ui.subtitle('', '(Derrière la cascade, la roche s’est refermée.)', 4); }, 1200);
      setTimeout(() => { if (!game.dying && !cine.on) divins.apparaitre('durn', { colere: true }); }, 7000);
    };
    return cine.jouer([
      { dur: 3, de: { pos: cam, look: tete }, debut: () => { sound.whisper && sound.whisper(0, 0.3); } },
      { dur: 4.2, de: { pos: cam, look: tete }, a: { pos: pres, look: tete }, secousse: 0.06, debut: () => { temple.yeux = 1; sound.rumble && sound.rumble(); divins.parler('durn', 'durn_eveil', 800); } },
      { dur: 3.6, de: { pos: [q.x - 10, q.y + 6, q.z + 16], look: [q.x, q.y + 2, q.z] }, secousse: 0.25,
        debut: () => { game.shakeT = 1; sound.rumble && sound.rumble(); }, chaque: () => { if (Math.random() < 0.4) particles.spawn(q.x + (Math.random() - 0.5) * 30, q.y + 14, q.z + (Math.random() - 0.5) * 30, 0, -2, 0, [0.5, 0.48, 0.44, 1], 0.3 + Math.random() * 0.4, 2, 14, false); } },
      { dur: 1.6, de: { pos: [q.x - 10, q.y + 6, q.z + 16], look: [q.x, q.y + 2, q.z] }, fondu: 'noir', secousse: 0.3, fin: consequences },
    ], { apres: consequences });
  },
};

// ---------------------------------------------------------------- l'arrivée : au tout premier jour d'une partie neuve (pas pendant les essais automatiques)
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || game.mode !== 'play' || !game.started || game.dying || cine.on || ui.panel || game.sleeping) return;
  const S = evenements.S();
  if (S.intro || farm.s.day !== 1) return;
  if (typeof navigator !== 'undefined' && navigator.webdriver) { S.intro = 1; return; }
  const f = $('#fade');
  if (f && f.classList.contains('open')) return;
  S.intro = 1;
  cinematiques.intro();
});
