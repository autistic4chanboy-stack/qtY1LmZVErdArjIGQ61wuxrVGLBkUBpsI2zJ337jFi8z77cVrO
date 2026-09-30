// ============================================================================
//  LE SON EN 3D, BRANCHÉ SUR LE MONDE (agent C5)
//  Les bruits qui ont une place viennent de cette place : les bêtes (cris,
//  aboiements, grognements, envols), les habitants (paroles, cris, pas, portes
//  qu'ils ouvrent), les choses étranges (pas qui suivent, murmures), les coups
//  de feu et les pièges des chasseurs, la foudre (de l'arbre frappé), le
//  violoneux, la tornade. Réglage « Son 3D pour casque » dans les Options.
//  Rien n'est sauvegardé dans la partie (réglage : settings.son3d).
// ============================================================================

// ---------------------------------------------------------------- le réglage
DEFAULT_SETTINGS.son3d = true;
if (settings.son3d === undefined) settings.son3d = true;
{
  const _apply = game.applySettings.bind(game);
  game.applySettings = function () { const r = _apply(); try { sound.set3D(settings.son3d !== false); } catch (e) { /* rien */ } return r; };
  const _init = ui.init.bind(ui);
  ui.init = function () {
    const r = _init();
    try {
      const amb = $('#o-amb'), lab = amb && amb.closest('label');
      if (lab && !$('#o-son3d')) {
        const l = document.createElement('label');
        l.className = 'row';
        l.innerHTML = '<input type="checkbox" id="o-son3d"> Son 3D pour casque';
        lab.after(l);
        const el = $('#o-son3d');
        el.checked = settings.son3d !== false;
        el.onchange = () => { settings.son3d = el.checked; store.set('prairie.settings', settings); game.applySettings(); sound.click(); };
      }
    } catch (e) { console.error('son3d option', e); }
    return r;
  };
}

// ---------------------------------------------------------------- les bêtes : leurs bruits viennent d'elles
const SON3D_BETE = { att: 'phys', ref: 10, roll: 0.5, suivre: true };
{
  const _uw = entities.updateWalker, _ub = entities.updateBird;
  entities.updateWalker = function (e, dt, w, c) { const k = sound.entrer(e, SON3D_BETE); try { return _uw.call(this, e, dt, w, c); } finally { sound.sortir(k); } };
  entities.updateBird = function (e, dt, w, c) { const k = sound.entrer(e, SON3D_BETE); try { return _ub.call(this, e, dt, w, c); } finally { sound.sortir(k); } };
  // les cris spontanés : on entend plus loin qu'avant, et d'où ils viennent
  const _calls = entities.calls;
  entities.calls = function (dt, c) {
    if (!sound.ctx) return _calls.call(this, dt, c);
    this.callT -= dt;
    if (this.callT > 0) return;
    this.callT = 1.2 + Math.random() * 3.5;
    if (c.rain > 0.7 || c.silent) return;
    const near = this.list.filter((e) => e.cfg.call && !e.hidden && !e.far && !e.dead && Math.hypot(e.x - c.px, e.z - c.pz) < 40);
    if (!near.length) return;
    const e = near[(Math.random() * near.length) | 0], d = Math.hypot(e.x - c.px, e.z - c.pz);
    sound.ici(e, () => sound.animal(e.cfg.call, 0, clamp(1.15 - d / 45, 0.25, 1)), { att: 'phys', ref: 6, roll: 0.7, suivre: true });
  };
}

// ---------------------------------------------------------------- les habitants : leur voix, leurs cris, leurs pas
const SON3D_VOIX = { att: 'phys', ref: 3, roll: 1, suivre: true };
{
  const _say = npcs.say.bind(npcs);
  npcs.say = function (n, text, dur) { const k = sound.entrer(n, SON3D_VOIX); try { return _say(n, text, dur); } finally { sound.sortir(k); } };
  const _hurt = npcs.hurt.bind(npcs);
  npcs.hurt = function (n, dmg, by) { const k = sound.entrer(n, SON3D_VOIX); try { return _hurt(n, dmg, by); } finally { sound.sortir(k); } };
  const _kill = npcs.kill.bind(npcs);
  npcs.kill = function (n, by, wit) { const k = sound.entrer(n, { att: 'phys', ref: 8, roll: 0.6 }); try { return _kill(n, by, wit); } finally { sound.sortir(k); } };
  const _knock = npcs.knock.bind(npcs);
  npcs.knock = function (dr) { const k = sound.entrer(dr ? [dr.x, (dr.y || 0) + 1.2, dr.z] : null, { att: 'phys', ref: 3 }); try { return _knock(dr); } finally { sound.sortir(k); } };
  const _view = talk.view.bind(talk);
  talk.view = function (text, options, raw) { const k = sound.entrer(talk.n, SON3D_VOIX); try { return _view(text, options, raw); } finally { sound.sortir(k); } };
}
// les pas des habitants qui marchent près de soi, et les portes qu'ils ouvrent ou referment
const son3d = {
  portes: null, porteT: 0,
  sol(w, x, y, z) {
    try {
      if (w.covered(x, y + 1.2, z)) return 'wood';
      const m = w.matAt(x, z);
      if (m === M_PLANKS || m === M_LOGS || m === M_CRATE) return 'wood';
      if (m === M_DIRT || m === M_SAND || m === M_THATCH) return 'soft';
      if (m === M_ROCK || m === M_COBBLE || m >= M_STONE) return 'hard';
    } catch (e) { /* rien */ }
    return 'grass';
  },
  update(dt) {
    if (!sound.ok || !farm.s || !game.world) return;
    const w = game.world, p = game.player;
    // pas
    for (const n of npcs.list) {
      if (!(n.dist < 22) || !n.st || !n.st.alive || n.vanished || n.state !== 'walk' || !(n.move > 0.4) || n.hunting) { n._pasK = undefined; continue; }
      const k = Math.floor(n.phase / Math.PI);
      if (n._pasK === undefined) { n._pasK = k; continue; }
      if (k === n._pasK) continue;
      n._pasK = k;
      const t = sound.entrer([n.x, (n.y || 0) + 0.1, n.z], { att: 'phys', ref: 2, roll: 1 });
      try { sound.step(this.sol(w, n.x, n.y || 0, n.z), n.run ? 5 : 2.5); } finally { sound.sortir(t); }
    }
    // portes (ouvertes ou fermées par d'autres que soi)
    this.porteT -= dt;
    if (this.porteT > 0) return;
    this.porteT = 0.15;
    if (!this.portes || this.portes.w !== w) this.portes = { w, etat: new Map() };
    const E = this.portes.etat;
    for (let i = 0; i < w.doors.length; i++) {
      const dr = w.doors[i], d = Math.hypot(dr.x - p.pos[0], dr.z - p.pos[2]);
      if (d > 20) { E.delete(i); continue; }
      const o = dr.open ? 1 : 0, avant = E.get(i);
      E.set(i, o);
      if (avant === undefined || avant === o || d < 2.6) continue;
      sound.ici([dr.x, (dr.y || 0) + (dr.h || 2) * 0.5, dr.z], () => sound.door(!!o), { att: 'phys', ref: 3 });
    }
  },
};
HOOKS.update.push((dt) => { try { son3d.update(dt); } catch (e) { if (!son3d.err) { son3d.err = true; console.error('son3d', e); } } });

// ---------------------------------------------------------------- les choses étranges : elles ont une place, elles aussi
{
  const OPT = { att: 'aucune', suivre: true };
  for (const k of Object.keys(strange)) {
    if (!k.startsWith('E_') || typeof strange[k] !== 'function') continue;
    const f = strange[k];
    strange[k] = function (e, dt, c) { const t = sound.entrer(e, OPT); try { return f.call(this, e, dt, c); } finally { sound.sortir(t); } };
  }
}

// ---------------------------------------------------------------- la foudre : le tonnerre vient de l'arbre frappé
if (typeof vallee !== 'undefined' && vallee.strike) {
  const _strike = vallee.strike.bind(vallee);
  vallee.strike = function (o, i) {
    let pos = null;
    try { pos = [o.x, game.world.objectY(o) + (o.h || 8), o.z]; } catch (e) { /* rien */ }
    const k = sound.entrer(pos, { att: 'aucune' });
    try { return _strike(o, i); } finally { sound.sortir(k); }
  };
}

// ---------------------------------------------------------------- la chasse : coups de feu, impacts, pièges, grognements, d'où ils viennent
if (typeof chasse !== 'undefined') {
  const O = { att: 'aucune' };
  const scoped = (nom, posOf) => {
    const f = chasse[nom];
    if (typeof f !== 'function') return;
    chasse[nom] = function (...a) { const P = posOf(...a); const k = sound.entrer(P, O); try { return f.apply(this, a); } finally { sound.sortir(k); } };
  };
  scoped('sonTir', (pos, soi) => (soi || !pos ? null : [pos[0], (pos[1] !== undefined ? pos[1] : 0) + 0.5, pos[2]]));
  scoped('sonImpact', (pt) => (pt ? [pt[0], pt[1], pt[2]] : null));
  scoped('sonMachoires', (x, z) => [x, z]);
  scoped('sonGrogne', (e) => e);
}

// ---------------------------------------------------------------- le violoneux : sa musique vient de lui
if (typeof activites !== 'undefined' && activites.jouerMusique) {
  const _jm = activites.jouerMusique.bind(activites);
  activites.jouerMusique = function (dt) {
    const r = _jm(dt);
    try {
      const m = this.musique, V = game.world.act && game.world.act.violon;
      if (m && V && m.g && !m.em && sound.ctx) {
        m.em = sound.tenir([V.x, (V.y || 0) + 1.3, V.z], sound.B.sfx.inp, { att: 'aucune' });
        m.g.disconnect(); m.g.connect(m.em.inp);
        const em = m.em, g = m.g;
        // quand la musique s'arrête, on rend la source (après le fondu)
        const libere = () => { if (activites.musique === m) { setTimeout(libere, 1500); return; } setTimeout(() => { try { g.disconnect(); } catch (e) { /* rien */ } sound.lacher(em); }, 1500); };
        setTimeout(libere, 1500);
      }
    } catch (e) { /* rien */ }
    return r;
  };
}

// ---------------------------------------------------------------- la tornade : le grondement vient d'elle
if (typeof tornade !== 'undefined' && tornade.sonMaj) {
  const _sm = tornade.sonMaj.bind(tornade);
  tornade.sonMaj = function (k) {
    const r = _sm(k);
    try {
      const S = this.son, E = this.E;
      if (S && E && sound.ctx) {
        const pos = [E.x, (E.y || game.world.heightAt(E.x, E.z)) + 12, E.z];
        if (!S.em) {
          S.em = sound.tenir(pos, sound.B.amb.inp, { att: 'aucune' });
          S.g.disconnect(); S.g2.disconnect(); S.g.connect(S.em.inp); S.g2.connect(S.em.inp);
          const em = S.em, T = this, S0 = S;
          const libere = () => { if (T.son === S0) { setTimeout(libere, 1500); return; } setTimeout(() => sound.lacher(em), 1500); };
          setTimeout(libere, 1500);
        } else sound._place(S.em, pos, true);
      }
    } catch (e) { /* rien */ }
    return r;
  };
}

// ---------------------------------------------------------------- une nouvelle partie : les boucles d'ambiance repartent de zéro
HOOKS.load.push(() => { try { sound.sourcesStop(); if (sound.sc) { sound.sc.grillons = []; sound.sc.arbres = []; sound.sc.arbresP = null; } } catch (e) { /* rien */ } });
