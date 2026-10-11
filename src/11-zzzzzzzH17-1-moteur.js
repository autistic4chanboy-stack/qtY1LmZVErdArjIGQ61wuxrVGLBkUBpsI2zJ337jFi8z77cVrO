// ============================================================================
//  L'HISTOIRE (agent H17) — 2. LE MOTEUR DES CINÉMATIQUES, EN PLUS
//  Sur le moteur cine du socle (11-zzz00-socle.js), sans rien changer aux
//  scènes d'avant :
//  - des CHEMINS de caméra : plan.chemin = [{ pos, look }, …] (au moins deux
//    clés), une courbe passant par chaque clé (Catmull-Rom), avec un
//    adoucissement (plan.ease : 'doux' par défaut, 'lin', 'entre', 'sort') ;
//  - des FIGURANTS : plan.figurants = [{ look (allure humanRig), de, a, cap,
//    marche }] : une silhouette posée, qui marche de « de » à « a » ;
//  - des CARTES : plan.carte = { haut, titre, bas } (le titre d'un chapitre,
//    au milieu de l'écran) ; plan.generique : le générique qui défile ;
//  - h17Cine.jouer(plans, opts) : une scène de l'histoire. On la PASSE en
//    MAINTENANT Espace ou Échap (une jauge sous l'invite) ; la partie est
//    tenue pendant ce temps : le temps de la vallée arrêté, ni coup ni mort,
//    ni faim ; à la fin, le personnage est rendu tel qu'il était (place,
//    regard). opts.musique : un morceau (musique.jouer), coupé en fondu à la
//    fin (opts.garderMusique : il continue) ; opts.h : l'heure de la lumière
//    (le ciel de la scène, comme les scènes des quêtes T).
// ============================================================================
const H17_TENIR = 0.9; // secondes à maintenir Espace ou Échap pour passer

function h17Ease(k, e) {
  k = clamp(k, 0, 1);
  if (e === 'lin') return k;
  if (e === 'entre') return k * k;
  if (e === 'sort') return 1 - (1 - k) * (1 - k);
  return k * k * (3 - 2 * k);
}
// un point de la courbe qui passe par les clés (Catmull-Rom uniforme ; u de 0 à 1 sur toute la courbe)
function h17Courbe(pts, u) {
  const n = pts.length;
  if (n === 1) return pts[0].slice();
  const s = clamp(u, 0, 1) * (n - 1), i = Math.min(n - 2, Math.floor(s)), t = s - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
  const t2 = t * t, t3 = t2 * t;
  return [0, 1, 2].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3));
}

const h17Cine = {
  on: false, snap: null, tenu: 0, esc: false, pauseVoulue: false, mus: null, opts: null, rigs: {}, auto: false,
  // ------------------------------------------------------------- jouer une scène de l'histoire
  jouer(plans, opts) {
    if (typeof cine === 'undefined' || !game.player) return Promise.resolve(false);
    if (cine.on) cine.finir(true);
    opts = Object.assign({ tenir: true }, opts || {});
    const apres = opts.apres;
    opts.apres = () => { try { if (apres) apres(); } catch (e) { console.error(e); } this.fin(); };
    this.debut(opts);
    return cine.jouer(plans, opts).then(() => true);
  },
  debut(opts) {
    const p = game.player;
    this.on = true; this.opts = opts; this.tenu = 0; this.esc = false; this.pauseVoulue = false;
    this.snap = { pos: p.pos.slice(), yaw: p.yaw, pitch: p.pitch, hp: p.hp, food: p.food, ts: game.timeScale, riding: p.riding };
    game.timeScale = 0;
    p.vel = [0, 0, 0];
    this.dom();
    $('#h17').classList.add('on');
    if (opts.h !== undefined && typeof qtScenes !== 'undefined') qtScenes.lumiere({ h: opts.h, dedans: false, lum: opts.lum || [] });
    this.mus = null;
    try {
      if (opts.musique && typeof musique !== 'undefined' && musique.actif() && MUSIQUE.morceaux[opts.musique]) { this.mus = opts.musique; musique.jouer(opts.musique); }
    } catch (e) { console.error(e); }
  },
  fin() {
    if (!this.on) return;
    const p = game.player, S = this.snap;
    this.on = false;
    if (S && p) {
      if (game.timeScale === 0) game.timeScale = S.ts || 1;
      if (!game.dying) { p.pos = S.pos.slice(); p.yaw = S.yaw; p.pitch = S.pitch; p.vel = [0, 0, 0]; p.hp = Math.max(p.hp, S.hp); p.food = Math.max(p.food, S.food); }
    }
    this.snap = null;
    if (typeof qtScenes !== 'undefined') qtScenes.lumiere(null);
    this.carte(null); this.generique(0);
    const el = $('#h17'); if (el) el.classList.remove('on');
    try { if (this.mus && typeof musique !== 'undefined' && musique.id === this.mus && !(this.opts && this.opts.garderMusique)) musique.couper(3); } catch (e) { console.error(e); }
    this.mus = null;
    const pv = this.pauseVoulue;
    this.pauseVoulue = false; this.esc = false; this.tenu = 0;
    if (pv && game.mode === 'play' && !ui.panel && !game.dying && !(typeof input !== 'undefined' && input.locked)) game.pause();
  },
  // ------------------------------------------------------------- chaque image : la jauge, la partie tenue
  update(dt) {
    if (!this.on) return;
    if (!cine.on) { this.fin(); return; }
    const p = game.player, S = this.snap;
    if (S && p) { p.hp = Math.max(p.hp, S.hp); p.food = Math.max(p.food, S.food); p.vel = [0, 0, 0]; }
    if (typeof play !== 'undefined') play.hurtFlash = 0;
  },
  // la jauge sous l'invite
  jauge() {
    const b = $('#h17-jauge');
    if (b) b.style.width = Math.round(clamp(this.tenu / H17_TENIR, 0, 1) * 100) + '%';
  },
  // ------------------------------------------------------------- l'écran (cartes, générique, jauge)
  dom() {
    if ($('#h17')) return;
    const st = document.createElement('style');
    st.id = 'h17-css';
    st.textContent = `#h17{position:fixed;inset:0;pointer-events:none;z-index:41;display:none}
#h17.on{display:block}
#h17-carte{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;color:#e8e0cc;font-family:Georgia,serif;opacity:0;transition:opacity 1.1s ease;text-shadow:0 1px 3px #000}
#h17-carte.on{opacity:1}
#h17-carte .h{font-size:13px;letter-spacing:.32em;text-transform:uppercase;color:#a89878}
#h17-carte .t{font-size:clamp(24px,4.4vw,40px);margin:10px 0 6px;letter-spacing:.03em}
#h17-carte .b{font-size:14px;color:#a89878;font-style:italic}
#h17-gen{position:absolute;left:0;right:0;top:0;bottom:0;overflow:hidden;opacity:0;transition:opacity 1.2s}
#h17-gen.on{opacity:1}
#h17-gen .rouleau{position:absolute;left:0;right:0;top:100%;text-align:center;color:#d8d0bc;font-family:Georgia,serif}
#h17-gen .rouleau div{margin:4px 16px;font-size:15px}
#h17-gen .rouleau .titre{font-size:clamp(24px,4vw,36px);margin:0 16px 8px;color:#e8e0cc}
#h17-gen .rouleau .role{margin-top:34px;font-size:12px;letter-spacing:.26em;text-transform:uppercase;color:#a89070}
#h17-gen .rouleau .fin{margin-top:60px;font-style:italic;color:#e8e0cc}
#h17-passer{position:absolute;right:14px;top:calc(11vh + 8px);width:190px;text-align:right;color:#8a8070;font:12px Georgia,serif;opacity:.75}
#h17-passer .barre{height:2px;margin-top:4px;background:rgba(138,128,112,.25)}
#h17-jauge{height:2px;width:0;background:#c8b890}
body.cine #cine-skip.h17x{display:none!important}`;
    document.head.appendChild(st);
    const d = document.createElement('div');
    d.id = 'h17';
    d.innerHTML = `<div id="h17-gen"><div class="rouleau"></div></div><div id="h17-carte"><div class="h"></div><div class="t"></div><div class="b"></div></div><div id="h17-passer"><span></span><div class="barre"><div id="h17-jauge"></div></div></div>`;
    document.body.appendChild(d);
  },
  carte(c) {
    this.dom();
    const el = $('#h17-carte');
    if (!c) { el.classList.remove('on'); return; }
    el.querySelector('.h').textContent = c.haut || '';
    el.querySelector('.t').textContent = c.titre || '';
    el.querySelector('.b').textContent = c.bas || '';
    el.classList.add('on');
  },
  // le générique : il défile pendant dur secondes (0 : on le cache)
  generique(dur) {
    this.dom();
    const el = $('#h17-gen'), r = el.querySelector('.rouleau');
    if (!dur) { el.classList.remove('on'); r.style.transition = 'none'; r.style.transform = ''; return; }
    r.innerHTML = H17_GENERIQUE.map(([k, t]) => `<div class="${k}">${esc(t)}</div>`).join('');
    r.style.transition = 'none'; r.style.transform = 'translateY(0)';
    void r.offsetHeight;
    const h = (r.offsetHeight || 600) + (window.innerHeight || 600) * 0.62;
    r.style.transition = `transform ${dur}s linear`;
    r.style.transform = `translateY(-${Math.round(h)}px)`;
    el.classList.add('on');
  },
  // ------------------------------------------------------------- les figurants
  rig(look) {
    const k = JSON.stringify(look || {});
    return this.rigs[k] || (this.rigs[k] = humanRig(look || {}));
  },
  dessiner(buf, sbuf, t) {
    const P = cine.on && cine.plans && cine.plans[cine.i];
    if (!P || !P.figurants) return;
    const k = clamp(cine.t / (P.dur || 3), 0, 1);
    for (const F of P.figurants) {
      const r = this.rig(F.look), a = F.a || F.de;
      const x = lerp(F.de[0], a[0], k), y = lerp(F.de[1], a[1], k), z = lerp(F.de[2], a[2], k);
      const bouge = F.a && Math.hypot(a[0] - F.de[0], a[2] - F.de[2]) > 0.1;
      const cap = F.cap !== undefined ? F.cap : bouge ? Math.atan2(a[0] - F.de[0], a[2] - F.de[2]) : 0;
      poseHuman(r, { move: bouge ? 1 : 0, phase: bouge ? cine.t * 5.2 : 0, t, lookY: 0 });
      drawRig(buf, r, x, y, z, cap, F.s || 1, 0);
      if (sbuf) drawShadow(sbuf, x, y, z, 0.34);
    }
  },
};

// ---------------------------------------------------------------- les chemins de caméra
{
  const _cam = cine.camera.bind(cine);
  cine.camera = function () {
    if (!this.on) return null;
    const P = this.plans && this.plans[this.i];
    if (!P || !P.chemin || P.chemin.length < 2) return _cam();
    const u = h17Ease(this.t / (P.dur || 3), P.ease);
    const pos = h17Courbe(P.chemin.map((c) => c.pos), u);
    const look = h17Courbe(P.chemin.map((c) => c.look), u);
    if (P.secousse) { const t = game.time, s = P.secousse; pos[0] += Math.sin(t * 37) * s; pos[1] += Math.sin(t * 41) * s; }
    return this.vue(pos, look);
  };
}
// ---------------------------------------------------------------- passer en maintenant Espace ou Échap (scènes de l'histoire)
{
  const _upd = cine.update.bind(cine);
  cine.update = function (dt) {
    if (!this.on || !(this.opts && this.opts.tenir)) return _upd(dt);
    const P = this.plans[this.i];
    if (!P) { this.finir(); return; }
    this.t += dt;
    if (P.chaque) try { P.chaque(this.t, dt); } catch (e) { console.error(e); }
    if (this.t >= (P.dur || 3)) this.next();
    if (!this.on) return;
    const H = h17Cine, tient = input.down('Space') || H.esc;
    H.tenu = tient ? H.tenu + dt : Math.max(0, H.tenu - dt * 2);
    H.jauge();
    if (H.tenu >= H17_TENIR && this.opts.passer !== false) { H.tenu = 0; H.jauge(); this.passer(); }
  };
  // les cartes et le générique suivent les plans
  const _next = cine.next.bind(cine);
  cine.next = function () {
    const r = _next();
    if (this.on && this.opts && this.opts.tenir) {
      const N = this.plans && this.plans[this.i];
      h17Cine.carte(N && N.carte);
      if (N && N.generique) h17Cine.generique(N.dur || 20);
    }
    return r;
  };
  // l'invite : « Maintenir Espace ou Échap : passer » (avec sa jauge) pour les scènes de l'histoire
  const _dom = cine.dom.bind(cine);
  cine.dom = function (on) {
    const r = _dom(on);
    const t = this.opts && this.opts.tenir, sk = $('#cine-skip');
    if (sk) sk.classList.toggle('h17x', !!(on && t));
    const ps = $('#h17-passer');
    if (ps) { ps.style.display = on && t && this.opts.passer !== false ? '' : 'none'; ps.querySelector('span').textContent = H17_TEXTES.passer; }
    return r;
  };
}
// (ils tournent aussi dans les Terres d'Avant : fn.zone)
HOOKS.update.push(Object.assign((dt) => h17Cine.update(dt), { zone: true }));
HOOKS.draw.push(Object.assign((buf, sbuf, cam, t) => { if (h17Cine.on) h17Cine.dessiner(buf, sbuf, t); }, { zone: true }));
// Échap pendant une scène de l'histoire : on la passe (en maintenant), le menu ne s'ouvre pas
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || typeof cine === 'undefined' || !cine.on || !(cine.opts && cine.opts.tenir)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    h17Cine.esc = true;
  }, true);
  window.addEventListener('keyup', (e) => { if (e.key === 'Escape') h17Cine.esc = false; }, true);
  window.addEventListener('blur', () => { h17Cine.esc = false; });
}
// pendant une scène de l'histoire : ni pause (le pointeur relâché par Échap), ni mort, ni coups
HOOKS.load.push(() => {
  if (game._h17) return;
  game._h17 = true;
  const _pause = game.pause.bind(game);
  game.pause = function () { if (h17Cine.on && cine.on && !this.dying) { h17Cine.pauseVoulue = true; return; } return _pause(); };
  const _die = game.die.bind(game);
  game.die = function (cause) { if (h17Cine.on && cine.on && !this.dying && this.player) { this.player.hp = Math.max(this.player.hp, 1); return; } return _die(cause); };
  if (typeof play !== 'undefined' && play.hurt && !play._h17) {
    play._h17 = true;
    const _hurt = play.hurt.bind(play);
    play.hurt = function (dmg, src, cause) { if (h17Cine.on) return; return _hurt(dmg, src, cause); };
  }
});
HOOKS.load.push(() => { if (h17Cine.on) { h17Cine.on = false; h17Cine.snap = null; } });
