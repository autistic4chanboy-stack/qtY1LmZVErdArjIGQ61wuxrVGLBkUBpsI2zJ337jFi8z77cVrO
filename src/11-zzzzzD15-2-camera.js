// ============================================================================
//  OUTILS DE MISE AU POINT, suite (agent D15) : la caméra libre, et « tout
//  débloquer » dans le wiki. Deux rangées de plus dans l'onglet « Le monde » du
//  panneau caché (11-zzzzz-admin.js), sans y toucher : on emballe son rendu.
//  Caméra libre : on vole (ZQSD/WASD, Espace monte, C descend, Maj vite, Ctrl
//  lent), le personnage reste où il est ; Échap rend la caméra.
// ============================================================================
const camLibre = {
  on: false, pos: [0, 0, 0], yaw: 0, pitch: 0, garde: null, etiquette: null,
  demarrer() {
    if (this.on || !game.world || !game.player) return;
    const p = game.player;
    this.on = true; this.verrouT = 0;
    this.pos = p.eyePos().slice(); this.yaw = p.yaw; this.pitch = p.pitch;
    this.garde = { yaw: p.yaw, pitch: p.pitch, pos: p.pos.slice() };
    if (!this.etiquette) {
      const e = document.createElement('div');
      e.id = 'cam-libre';
      e.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:7;padding:3px 10px;font:13px Georgia,serif;color:#f4ead2;background:rgba(20,14,8,.55);border:1px solid rgba(240,220,180,.25);pointer-events:none;display:none';
      e.textContent = 'Caméra libre · Échap';
      document.body.appendChild(e);
      this.etiquette = e;
    }
    this.etiquette.style.display = '';
    if (game.mode === 'play' && !input.locked && !ui.panel) try { game.lock(); } catch (e) { /* */ }
  },
  arreter() {
    if (!this.on) return;
    this.on = false;
    const p = game.player;
    if (p && this.garde) { p.yaw = this.garde.yaw; p.pitch = this.garde.pitch; p.vel = [0, 0, 0]; }
    if (this.etiquette) this.etiquette.style.display = 'none';
  },
  // la caméra : passe en dernier (après les cinématiques)
  camera(dt) {
    if (!this.on) return null;
    const p = game.player, g = this.garde;
    if (!p || game.dying) { this.arreter(); return null; }
    // le personnage ne bouge pas : la souris tourne la caméra, pas lui
    if (game.mode !== 'menu' && !ui.panel) {
      this.yaw -= (p.yaw - g.yaw);
      this.pitch = clamp(this.pitch - (p.pitch - g.pitch), -1.55, 1.55);
    }
    p.yaw = g.yaw; p.pitch = g.pitch;
    if (input.locked && !this.verrouT) this.verrouT = performance.now();
    if (!ui.panel && game.mode === 'play') {
      const K = (a, b) => (input.down(a) || (b && input.down(b)) ? 1 : 0);
      const av = K('KeyW', 'ArrowUp') - K('KeyS', 'ArrowDown'), dr = K('KeyD', 'ArrowRight') - K('KeyA', 'ArrowLeft'), ht = K('Space') - K('KeyC');
      const v = (input.down('ShiftLeft') || input.down('ShiftRight') ? 40 : input.down('ControlLeft') ? 2.5 : 10) * dt;
      const b = cameraBasis(this.yaw, this.pitch);
      for (let i = 0; i < 3; i++) this.pos[i] += (b.f[i] * av + b.r[i] * dr) * v;
      this.pos[1] += ht * v;
    }
    return { pos: this.pos.slice(), yaw: this.yaw, pitch: this.pitch };
  },
};

HOOKS.load.push(() => {
  camLibre.arreter();
  if (camLibre.branche) return;
  camLibre.branche = true;
  // la caméra en dernier : on se place au bout de la liste à chaque image si quelqu'un s'est ajouté après
  const cam = (dt) => camLibre.camera(dt);
  cam.zone = true;
  HOOKS.camera.push(cam);
  HOOKS.update.push(Object.assign(() => { if (HOOKS.camera[HOOKS.camera.length - 1] !== cam) { const i = HOOKS.camera.indexOf(cam); if (i >= 0) { HOOKS.camera.splice(i, 1); HOOKS.camera.push(cam); } } }, { zone: true }));
  // le personnage reste où il est
  const _pu = Player.prototype.update;
  Player.prototype.update = function (dt, w, c) {
    if (camLibre.on && this === game.player) { this.vel = [0, 0, 0]; if (camLibre.garde) this.pos = camLibre.garde.pos.slice(); return; }
    return _pu.call(this, dt, w, c);
  };
  // ni clic, ni E pendant le vol
  HOOKS.primary.unshift(() => camLibre.on);
  HOOKS.secondary.unshift(() => camLibre.on);
  const _int = game.interact.bind(game);
  game.interact = function () { if (camLibre.on) return; return _int(); };
  // Échap : on rend la caméra (le verrou de la souris saute avec ; un clic le reprend) sans ouvrir le menu
  const _pause = game.pause.bind(game);
  // (la souris tenue un moment puis lâchée : c'est Échap ; un verrou qui saute aussitôt ne compte pas)
  game.pause = function () { if (camLibre.on) { if (camLibre.verrouT && performance.now() - camLibre.verrouT > 250) camLibre.arreter(); else camLibre.verrouT = 0; return; } return _pause(); };
  window.addEventListener('keydown', (e) => { if (camLibre.on && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); camLibre.arreter(); } }, true);
});

// ---------------------------------------------------------------- le panneau caché : deux rangées de plus (« Le monde »)
if (typeof adminPanneau !== 'undefined') {
  const _r = adminPanneau.rendre.bind(adminPanneau);
  adminPanneau.rendre = function () {
    _r();
    const el = $('#admin');
    if (!el || ui.panel !== '#admin' || this.onglet !== 'monde') return;
    const body = el.querySelector('.body');
    if (!body) return;
    const D = typeof decouvertes !== 'undefined' && farm.s ? decouvertes.S() : null;
    body.insertAdjacentHTML('beforeend', `<div class="adm-row"><b>Wiki</b><button data-d15tout>${D && D.tout ? 'Tout est débloqué — reverrouiller' : 'Tout débloquer'}</button><button data-d15wiki>Ouvrir</button></div>
      <div class="adm-row"><b>Caméra</b><button data-d15cam>Caméra libre</button><small>Échap pour revenir</small></div>`);
    const b1 = body.querySelector('[data-d15tout]'), b2 = body.querySelector('[data-d15cam]'), b3 = body.querySelector('[data-d15wiki]');
    if (b1) b1.onclick = () => { if (!D) return; decouvertes.toutDebloquer(!D.tout); this.note(D.tout ? 'Wiki : tout débloqué' : 'Wiki : reverrouillé'); this.rendre(); };
    if (b2) b2.onclick = () => { ui.close(); camLibre.demarrer(); };
    if (b3) b3.onclick = () => { if (typeof decouvertes !== 'undefined' && decouvertes.ouvrir) decouvertes.ouvrir(); };
  };
}
