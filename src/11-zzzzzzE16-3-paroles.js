// ============================================================================
//  CLINS D'ŒIL (agent E16, seizième vague) — 4. LES MOTS, LES PETITS MOMENTS
//  - En bavardant, un habitant laisse parfois échapper un mot (e16Paroles :
//    chacun une seule fois par partie, une chance sur vingt) ; les gardes, en
//    saluant, parlent de leur genou (The Elder Scrolls V : Skyrim).
//  - Le nain ancien donne de quoi s'éclairer (The Legend of Zelda) ; la postière
//    remet la lettre d'un grand-père (Stardew Valley) ; la fillette rit si l'on
//    se retourne pour voir le singe (The Secret of Monkey Island).
//  - Le colporteur fredonne Korobeiniki, parfois (Tetris).
//  - Les nuits de brume, une sirène au loin, et la brume qui s'épaissit (Silent Hill).
//  - Tomber de haut dans une botte de foin : pas de mal, un cri d'aigle (Assassin's Creed).
//  - Un trou à la pelle qui fait sonner des pièces (Shovel Knight).
//  - La mort : parfois « Mort de dysenterie. » (The Oregon Trail), parfois
//    « Non… Ce n'est pas ainsi que ça s'est passé. » (Prince of Persia : les Sables du Temps).
//  - Les objets « e16 » n'entrent pas dans les découvertes (le wiki du jeu).
// ============================================================================
const e16Mots = {
  brume: 0, singe: null,
  // un mot pas encore dit, pour cet habitant (au hasard : une chance sur vingt)
  mot(n) {
    if (!n || !n.d || !farm.s) return null;
    const L = e16Paroles[n.d.id];
    if (!L) return null;
    const S = e16.S(), j = farm.s.day;
    const reste = L.filter(([k]) => !S.dit[n.d.id + ':' + k] && !(n.d.id === 'postiere' && k === 'grand_pere' && j < 7));
    if (!reste.length || Math.random() >= e16Regl.parler) return null;
    const [k, t] = reste[0];
    S.dit[n.d.id + ':' + k] = j;
    this.suite(n, k);
    return t;
  },
  suite(n, k) {
    const S = e16.S();
    if (n.d.id === 'nain_ancien' && k === 'seul') { farm.give('bougie', 2); try { play.flyer('bougie', [n.x, (n.y || 0) + 1.2, n.z], 2); } catch (e) { /* rien */ } }
    if (n.d.id === 'postiere' && k === 'grand_pere') S.lettreGP = 1;
    if (n.d.id === 'fillette' && k === 'singe') this.singe = { n, yaw: game.player.yaw, t: 0 };
  },
  maj(dt, C) {
    const S = e16.S(), p = game.player;
    // la lettre du grand-père, quand la conversation est finie
    if (S.lettreGP === 1 && !ui.panel && !talk.n) { S.lettreGP = 2; const T = e16Textes.grandPere; setTimeout(() => { try { ui.read(T[0], T[1], T[2]); } catch (e) { console.error(e); } }, 400); }
    // le singe à trois têtes : on s'est retourné ?
    const M = this.singe;
    if (M) {
      M.t += dt;
      if (Math.abs(angDiff(p.yaw, M.yaw)) > 2.2) { this.singe = null; e16.son('rire', M.n, 0.8); }
      else if (M.t > 8) this.singe = null;
    }
    if (!C) return;
    const h = C.h;
    // le colporteur fredonne (une fois par jour, au plus)
    const col = typeof npcs !== 'undefined' && npcs.byId ? npcs.byId.colporteur : null;
    if (col && col.st && col.st.alive && !col.talking && col.state !== 'sleep' && h >= 8 && h < 19 && Math.hypot(col.x - C.x, col.z - C.z) < 10 && S.der.korobeiniki !== farm.s.day) {
      S.der.korobeiniki = farm.s.day;
      if (Math.random() < 0.35) e16.son('korobeiniki', col, 1);
    }
    // la sirène des nuits de brume, près de Valbrume
    this.brume = Math.max(0, this.brume - dt);
    const town = C.w.townInfo || e16.lm('place');
    const nuitK = h >= 12 ? farm.s.day : farm.s.day - 1;
    if (C.nuit && !C.sous && C.fog > 0.35 && town && Math.hypot(town.x - C.x, town.z - C.z) < 350 && S.der.sirene !== nuitK) {
      S.der.sirene = nuitK;
      if (Math.random() < 0.15) this.sirene();
    }
  },
  sirene() {
    const town = farm.w.townInfo || e16.lm('place'), p = game.player;
    const pos = town ? [town.x, (farm.w.heightAt(town.x, town.z) || 0) + 20, town.z] : [p.pos[0] + 200, p.pos[1] + 20, p.pos[2]];
    try { sound.e16 && sound.e16('sirene', pos, 1.6); } catch (e) { /* rien */ }
    this.brume = 45;
  },
};

// ---------------------------------------------------------------- les habitants
{
  const _cl = talk.chatLine.bind(talk);
  talk.chatLine = function () { try { const t = e16Mots.mot(this.n); if (t) return t; } catch (e) { console.error('e16', e); } return _cl(); };
  const gardes = ['garde', 'garde_champetre', 'gendarme', 'chevalier_guet'];
  const _sg = npcs.shortGreet.bind(npcs);
  npcs.shortGreet = function (n) {
    try {
      if (n && n.d && gardes.includes(n.d.id) && farm.s && !this.murdererKnown() && !(n.st && n.st.anger > 0) && Math.random() < e16Regl.garde) {
        const S = e16.S();
        if (S.der.genou !== farm.s.day) { S.der.genou = farm.s.day; return 'J’étais aventurier, moi aussi. Et puis j’ai pris une flèche dans le genou.'; }
      }
    } catch (e) { console.error('e16', e); }
    return _sg(n);
  };
}
// ---------------------------------------------------------------- la botte de foin
{
  const _chute = corps.chute.bind(corps);
  corps.chute = function (v) {
    try {
      const w = game.world, p = game.player;
      if (v > 10.5 && w && w === farm.w && !p.riding) {
        const x = p.pos[0], z = p.pos[2], y = p.pos[1];
        let foin = (w.props || []).some((q) => {
          if (!q || (q.id !== 'botte_foin' && q.id !== 'meule') || q.gone || Math.abs(q.x - x) > 1.6 || Math.abs(q.z - z) > 1.6) return false;
          const qy = typeof q.y === 'number' ? q.y : w.heightAt(q.x, q.z);
          return y > qy - 0.5 && y < qy + 2.5;
        });
        if (!foin) w.query(x, z, 2.5, (o) => { if (foin || o.gone) return; const T = OBJ_TYPES[o.t]; if (T && T.id === 'hay' && Math.hypot(o.x - x, o.z - z) < 1.7) foin = true; }, null);
        if (foin) {
          puffAt(x, y + 0.4, z, [216, 192, 122], 26, 2.6, false);
          sound.land && sound.land(0.5);
          if (sound.eagle) { if (sound.ici) sound.ici([x, y + 30, z], () => sound.eagle()); else sound.eagle(); }
          const S = e16.S(); S.fait.foin = S.fait.foin || farm.s.day;
          return;
        }
      }
    } catch (e) { console.error('e16', e); }
    return _chute(v);
  };
}
// ---------------------------------------------------------------- la pelle
if (typeof dig !== 'undefined' && dig.hole) {
  const _h = dig.hole.bind(dig);
  dig.hole = function (x, z, save) {
    const r = _h(x, z, save);
    try {
      if (save && farm.s && Math.random() < e16Regl.pelle) {
        const [a, b] = e16Regl.pelleSous, n = a + ((Math.random() * (b - a + 1)) | 0), w = game.world, y = w.heightAt(x, z);
        farm.earn(n);
        e16.son('pieces', { x, y, z });
        for (let i = 0; i < 8; i++) particles.spawn(x, y + 0.2, z, (Math.random() - 0.5) * 2, 2 + Math.random() * 2, (Math.random() - 0.5) * 2, [1, 0.85, 0.3, 1], 0.05, 0.6, 12, true);
        const S = e16.S(); S.fait.pelle = (S.fait.pelle || 0) + 1;
      }
    } catch (e) { console.error('e16', e); }
    return r;
  };
}
// ---------------------------------------------------------------- la mort (ui.showDeath vient plus tard : branché au chargement)
HOOKS.load.push(() => {
  if (typeof ui === 'undefined' || !ui.showDeath || ui._e16Mort) return;
  ui._e16Mort = true;
  const _sd = ui.showDeath.bind(ui);
  ui.showDeath = function (cause, day, run) {
    const r = _sd(cause, day, run);
    try {
      const el = $('#death .cause');
      if (el && /poison|malad|fièvre|intoxi|ventre/i.test(cause || '') && Math.random() < 0.25) el.textContent = 'Mort de dysenterie.';
      else if (el && Math.random() < 0.06) el.textContent = (cause || '') + ' — Non… Non. Ce n’est pas ainsi que ça s’est passé.';
    } catch (e) { console.error('e16', e); }
    return r;
  };
});
// ---------------------------------------------------------------- la brume de la sirène
HOOKS.sky.push((sky) => {
  const k = Math.min(1, e16Mots.brume / 8, (45 - e16Mots.brume) / 6);
  if (!(k > 0) || !e16.ici()) return;
  sky.fog = [lerp(sky.fog[0], 2, k * 0.8), lerp(sky.fog[1], 40, k * 0.8)];
  sky.amb = v3.scale(sky.amb, 1 - 0.15 * k);
});
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (!playing || !e16.ici()) return; try { e16Mots.maj(dt, e16.C); } catch (e) { console.error('e16', e); } });
// ---------------------------------------------------------------- hors des découvertes (les objets cachés)
if (typeof decouvertes !== 'undefined') {
  const cache = (id) => typeof id === 'string' && id.startsWith('it:') && ITEMS[id.slice(3)] && ITEMS[id.slice(3)].e16;
  const _v = decouvertes.voir.bind(decouvertes);
  decouvertes.voir = function (id, k) { if (cache(id)) return false; return _v(id, k); };
  const _c = decouvertes.catalogue.bind(decouvertes);
  decouvertes.catalogue = function () { const L = _c(); if (L && L.some(cache)) { const M = L.filter((id) => !cache(id)); this.cat = M; return M; } return L; };
}
