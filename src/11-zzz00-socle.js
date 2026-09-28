// ============================================================================
//  SOCLE des nouveautés : ce qui doit attendre que la ferme (11-farm-play.js)
//  soit chargée, et ce que partagent les autres modules 11-zzz* :
//   - la journée de dix minutes ;
//   - savoir : ce que le personnage connaît (lieux, espèces vues, plantes
//     identifiées, recettes, mots des langues perdues, livres lus) ;
//   - corps : chutes, jambe cassée, saignements, pentes trop raides ;
//   - cine : les cinématiques (caméra, bandes noires, paroles) ;
//   - où l'on ne bâtit pas (villes, villages, lieux saints) ;
//   - les échelles des douves, la pêche dans les bassins.
// ============================================================================
DYN_PROPS.add('cascade'); DYN_PROPS.add('feu_geant'); DYN_PROPS.add('pierre_trois'); DYN_PROPS.add('piege_loup');

// ---------------------------------------------------------------- traduction : le module 14-i18n.js remplace T (T = function…)
// À appeler pour tout texte dessiné sur un canevas (les textes du DOM sont traduits automatiquement).
function T(s) { return s; }

// ---------------------------------------------------------------- une journée : dix minutes
const JOUR_SECONDES = 600;
HOOKS.load.push(() => { if (game.world) game.world.dayLength = JOUR_SECONDES; });

// ---------------------------------------------------------------- où l'on ne bâtit pas (ni ne laboure, ni ne pose)
// renvoie la zone protégée qui couvre (x, z) (marge r en plus), ou null
function interditDeBatir(x, z, r) {
  const w = game.world;
  if (!w || !w.noBuild) return null;
  for (const P of w.noBuild) if (Math.hypot(x - P.x, z - P.z) < P.r + (r || 0)) return P;
  return null;
}

// ============================================================================
//  SAVOIR : ce que le personnage connaît (sauvegardé dans farm.s.savoir)
// ============================================================================
const savoir = {
  onLieu: [], onVu: [], onPlante: [], onRecette: [], onMots: [],
  S() {
    const s = farm.s;
    const K = s.savoir || (s.savoir = {});
    for (const k of ['lieux', 'vus', 'plantes', 'recettes', 'mots', 'lus']) if (!K[k]) K[k] = {};
    return K;
  },
  // -- les lieux où l'on est allé (les cartes ne montrent que ceux-là)
  lieuConnu(k) { return !!this.S().lieux[k]; },
  connaitreLieu(k) {
    const L = this.S().lieux;
    if (!k || L[k]) return false;
    L[k] = farm.s.day;
    for (const fn of this.onLieu) fn(k);
    return true;
  },
  // -- les espèces vues ou prises (bêtes : e.kind ; poissons : id d'objet ; plantes et arbres : id OBJ_TYPES)
  vu(id) { return this.S().vus[id] || 0; },
  voir(id, n) {
    if (!id) return false;
    const V = this.S().vus, first = !V[id];
    V[id] = (V[id] || 0) + (n || 1);
    if (first) for (const fn of this.onVu) fn(id);
    return first;
  },
  // -- les plantes que l'alchimiste a nommées (sans lui, on ne connaît que leur allure)
  planteConnue(id) { return typeof PLANT_LOOK === 'undefined' || !PLANT_LOOK[id] || !!this.S().plantes[id]; },
  identifier(id) {
    const P = this.S().plantes;
    if (P[id]) return false;
    P[id] = farm.s.day;
    for (const fn of this.onPlante) fn(id);
    return true;
  },
  // -- les recettes : celles de base, et celles qu'on a trouvées (ou apprises dans un livre, d'un habitant)
  recetteConnue(out) { return CRAFT_BASE.has(out) || !!this.S().recettes[out]; },
  apprendreRecette(out, source) {
    const R = this.S().recettes;
    if (CRAFT_BASE.has(out) || R[out]) return false;
    R[out] = source || 'essai';
    for (const fn of this.onRecette) fn(out, source);
    return true;
  },
  // -- les mots des langues perdues (aelin, gorrain)
  motConnu(lang, mot) { const M = this.S().mots[lang]; return !!(M && M[mot]); },
  motsConnus(lang) { return Object.keys(this.S().mots[lang] || {}); },
  apprendreMots(lang, liste) {
    const M = this.S().mots[lang] || (this.S().mots[lang] = {});
    let n = 0;
    for (const m of liste) if (m && !M[m]) { M[m] = farm.s.day; n++; }
    if (n) for (const fn of this.onMots) fn(lang, n);
    return n;
  },
  // -- les livres lus
  lu(id) { return !!this.S().lus[id]; },
  lire(id) { const L = this.S().lus; const first = !L[id]; L[id] = L[id] || farm.s.day; return first; },
};

// ce qu'on voit passe dans la mémoire : bêtes croisées, lieux traversés, plantes cueillies, poissons pris
{
  let lookT = 0;
  HOOKS.update.push((dt, eye, basis, sky, playing) => {
    if (!playing || !farm.s) return;
    lookT -= dt;
    if (lookT > 0) return;
    lookT = 0.5;
    const w = game.world, p = game.player, f = basis.f;
    for (const e of entities.list) {
      if (e.dead || e.removed || !e.kind) continue;
      const dx = e.x - eye[0], dz = e.z - eye[2], d = Math.hypot(dx, dz);
      if (d > 32 || d < 0.5) continue;
      if ((dx * f[0] + dz * f[2]) / d < 0.82) continue;
      if (e.hidden) continue;
      savoir.voir(e.kind);
    }
    for (const k in w.lm || {}) {
      const L = w.lm[k];
      if (L.under && !p.underground) continue;
      if (Math.hypot(L.x - p.pos[0], L.z - p.pos[2]) < Math.max(12, (L.r || 20) * 0.9)) savoir.connaitreLieu(k);
    }
    const t = game.target;
    if (t && (t.kind === 'pick' || t.kind === 'tree') && t.o) { const T = OBJ_TYPES[t.o.t]; if (T) savoir.voir(T.id); }
  });
  const _collect = play.collect.bind(play);
  play.collect = function (o, idx, H, p) { const ok = _collect(o, idx, H, p); if (ok && o && OBJ_TYPES[o.t]) savoir.voir(OBJ_TYPES[o.t].id); return ok; };
  const _give = farm.give.bind(farm);
  farm.give = function (id, n) { _give(id, n); if ((n === undefined || n > 0) && typeof FISH !== 'undefined' && FISH[id] && this.s) savoir.voir(id); };
}

// ============================================================================
//  CORPS : chutes, jambe cassée, saignements, pentes
// ============================================================================
const corps = {
  PENTE_MAX: 1.05,  // au-delà (46°), on ne monte plus
  PENTE_CHEMIN: 2.2, // sur un chemin de terre ou de pavés, on grimpe plus raide (il y a des marches taillées)
  PENTE_GLISSE: 1.45, // au-delà, on glisse
  C() { const s = farm.s; return s.corps || (s.corps = { jambe: 0, attelle: 0, saigne: 0, cause: '' }); },
  jambeCassee() { const C = this.C(); return C.jambe > farm.s.hours; },
  casserJambe(cause) {
    const C = this.C(), s = farm.s;
    const deja = this.jambeCassee();
    C.jambe = Math.max(C.jambe, s.hours + 48); C.attelle = 0;
    sound.impact && sound.impact('hard'); sound.hurt && sound.hurt(30);
    game.shakeT = 0.8;
    ui.subtitle('', deja ? '(La jambe cassée cède encore. La douleur vous coupe le souffle.)' : '(Un craquement sec. Votre jambe ne vous porte plus : elle est cassée.)', 4);
    if (deja) play.hurt(15, null, cause || 'Une mauvaise chute');
  },
  soignerJambe(total) {
    const C = this.C(), s = farm.s;
    if (!this.jambeCassee()) return false;
    C.jambe = total ? 0 : Math.min(C.jambe, s.hours + 12);
    return true;
  },
  // k : points de vie perdus par seconde (0.05 : une égratignure ; 1 : une artère)
  saigner(k, cause) {
    const C = this.C();
    C.saigne = Math.min(3, (C.saigne || 0) + k);
    if (cause) C.cause = cause;
  },
  saignement() { return this.C().saigne || 0; },
  panser() { const C = this.C(); if (!C.saigne) return false; C.saigne = 0; return true; },
  // atterrissage à la vitesse v (m/s)
  chute(v) {
    const p = game.player;
    if (BUFF.on('legerete') || p.riding) return;
    let k = 1;
    if (p.wading) k = 0.4;
    if (v <= 10.5) return;
    const dmg = Math.pow(v - 10.5, 1.5) * 3.4 * k;
    const casse = v > 13 && Math.random() < clamp((v - 13) / 6, 0, 1) * 0.85 * k;
    if (casse) this.casserJambe('Une mauvaise chute');
    if (v > 16.5 && Math.random() < 0.5) this.saigner(0.08 + (v - 16.5) * 0.04, 'Une mauvaise chute');
    play.hurt(dmg, null, v > 19 ? 'Une chute de très haut' : 'Une mauvaise chute');
  },
  // monter en douceur jusqu'à un point (échelles des douves, murs)
  hisser(to, dur) {
    if (this.hisse) return Promise.resolve();
    const p = game.player, from = p.pos.slice();
    return new Promise((res) => { this.hisse = { from, to: to.slice(), t: 0, dur: dur || 1.6, res }; sound.step('wood', 1); });
  },
  update(dt) {
    const p = game.player, s = farm.s, C = this.C();
    // se hisser
    const H = this.hisse;
    if (H) {
      H.t += dt;
      const k = Math.min(1, H.t / H.dur), up = Math.min(1, k / 0.75), fw = clamp((k - 0.6) / 0.4, 0, 1);
      p.pos = [lerp(H.from[0], H.to[0], fw), lerp(H.from[1], H.to[1] + 0.05, up * up * (3 - 2 * up)), lerp(H.from[2], H.to[2], fw)];
      p.vel = [0, 0, 0];
      if (Math.floor(H.t * 3) !== Math.floor((H.t - dt) * 3)) sound.step('wood', 0.8);
      if (k >= 1) { this.hisse = null; H.res(); }
    }
    // saignement : on meurt petit à petit, ou on s'en remet si ce n'est qu'une égratignure
    if (C.saigne > 0) {
      p.hp -= C.saigne * dt;
      if (C.saigne < 0.25) C.saigne = Math.max(0, C.saigne - dt * 0.0025);
      this.gouttesT = (this.gouttesT || 0) - dt;
      if (this.gouttesT <= 0) {
        this.gouttesT = clamp(1.2 / (C.saigne * 4 + 0.2), 0.15, 3);
        const w = game.world, y = w.groundAt(p.pos[0], p.pos[2], p.pos[1] + 0.3, 0.5);
        for (let i = 0; i < 2; i++) particles.spawn(p.pos[0] + (Math.random() - 0.5) * 0.4, p.pos[1] + 0.9, p.pos[2] + (Math.random() - 0.5) * 0.4, 0, -1, 0, [0.45, 0.02, 0.02, 1], 0.05, 0.7, 9, false);
        void y;
      }
      if (!this.ditSaigne || s.hours > this.ditSaigne + 2) { this.ditSaigne = s.hours; ui.subtitle('', C.saigne > 0.5 ? '(Vous perdez beaucoup de sang. Il faut un bandage, vite.)' : '(Vous saignez. Un bandage arrêterait ça.)', 3.5); }
      if (p.hp <= 0) game.die(C.cause || 'Mort de ses blessures, lentement');
    }
    if (this.jambeCassee()) {
      this.douleurT = (this.douleurT || 0) - dt;
      if (this.douleurT <= 0) { this.douleurT = 14 + Math.random() * 20; sound.hurtHuman ? sound.hurtHuman(0.3) : sound.hurt && sound.hurt(5); }
    } else if (C.jambe && C.jambe <= s.hours) { C.jambe = 0; C.attelle = 0; ui.subtitle('', '(Votre jambe vous porte de nouveau.)', 3); }
  },
};
// déplacements : jambe cassée, pentes trop raides, chutes (remplace l'ancien calcul des chutes)
{
  const _upd = Player.prototype.update;
  Player.prototype.update = function (dt, w, c) {
    if (game.kind !== 'farm' || !farm.s || this.fly) return _upd.call(this, dt, w, c);
    if (corps.hisse) { this.vel = [0, 0, 0]; return; }
    if (typeof cine !== 'undefined' && cine.on) c = { fwd: 0, right: 0, up: false, down: false, sprint: false };
    const casse = corps.jambeCassee() && !this.riding;
    const x0 = this.pos[0], y0 = this.pos[1], z0 = this.pos[2], vy0 = this.vel[1], g0 = this.onGround;
    const c2 = Object.assign({}, c, { onFall: null });
    const sp = this.mods.speed;
    if (casse) { c2.sprint = false; if (!this.swimming) c2.up = false; this.mods.speed = sp * (corps.C().attelle ? 0.55 : 0.4); }
    try { _upd.call(this, dt, w, c2); } finally { this.mods.speed = sp; }
    if (casse && this.onGround && Math.hypot(this.vel[0], this.vel[2]) > 0.5) this.eyeOffset += Math.sin(this.bobPhase * 2) * 0.012; // on boite
    // atterrissage
    if (!g0 && this.onGround && vy0 < -10.5 && !this.swimming) corps.chute(-vy0);
    // pentes : impossible de monter trop raide, et l'on glisse sur les parois
    if (this.onGround && !this.swimming && !this.underground) {
      const hN = w.heightAt(this.pos[0], this.pos[2]);
      if (Math.abs(this.pos[1] - hN) < 0.12) {
        const dx = this.pos[0] - x0, dz = this.pos[2] - z0, d = Math.hypot(dx, dz);
        if (d > 1e-4) {
          const h0 = w.heightAt(x0, z0);
          const m = w.matAt(this.pos[0], this.pos[2]), chemin = m === M_DIRT || m === M_COBBLE || m === M_SAND;
          if ((hN - h0) / d > (chemin ? corps.PENTE_CHEMIN : corps.PENTE_MAX) && Math.abs(y0 - h0) < 0.25) {
            this.pos[0] = x0; this.pos[2] = z0; this.pos[1] = Math.max(y0, h0);
            // on garde le glissé le long de la pente, pas la montée
            const n = w.normalAt(x0, z0), nl = Math.hypot(n[0], n[2]) || 1, gx = n[0] / nl, gz = n[2] / nl;
            const vd = this.vel[0] * gx + this.vel[2] * gz;
            if (vd < 0) { this.vel[0] -= vd * gx; this.vel[2] -= vd * gz; }
          }
        }
        const n = w.normalAt(this.pos[0], this.pos[2]), tan = Math.hypot(n[0], n[2]) / Math.max(0.05, n[1]);
        if (tan > corps.PENTE_GLISSE) {
          const nl = Math.hypot(n[0], n[2]) || 1, k = Math.min(1, (tan - corps.PENTE_GLISSE) * 2) * 3.2 * dt;
          const nx = this.pos[0] + n[0] / nl * k, nz = this.pos[2] + n[2] / nl * k;
          const [cx, cz] = this.collide(w, nx, nz, 0.3);
          this.pos[0] = cx; this.pos[2] = cz; this.pos[1] = w.groundAt(cx, cz, this.pos[1] + 0.3, 0.6);
        }
      }
    }
  };
}
HOOKS.update.push((dt, eye, basis, sky, playing) => { if (farm.s && !game.dying) corps.update(playing ? dt : 0); });
// soigner : bandage, attelle
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held) return false;
  if (id === 'bandage') {
    if (!corps.saignement()) { ui.subtitle('', '(Vous ne saignez pas.)', 2); return true; }
    farm.take('bandage', 1); corps.panser(); sound.equip && sound.equip();
    ui.subtitle('', '(Vous serrez le bandage. Le sang s’arrête.)', 3); play.cool = 0.8;
    return true;
  }
  if (id === 'attelle') {
    if (!corps.jambeCassee()) { ui.subtitle('', '(Vos jambes vont bien.)', 2); return true; }
    if (corps.C().attelle) { ui.subtitle('', '(L’attelle tient déjà la jambe.)', 2); return true; }
    farm.take('attelle', 1); corps.C().attelle = 1; corps.soignerJambe(false); sound.equip && sound.equip();
    ui.subtitle('', '(Vous immobilisez la jambe entre deux planchettes. Elle se remettra plus vite ; on marche un peu mieux.)', 4); play.cool = 0.8;
    return true;
  }
  return false;
});
// la mort lente a sa propre cause ; une nouvelle partie repart en bonne santé
HOOKS.load.push((saved) => { if (!saved && farm.s) farm.s.corps = { jambe: 0, attelle: 0, saigne: 0, cause: '' }; corps.hisse = null; });

// ---------------------------------------------------------------- les échelles des douves : on se hisse
HOOKS.inter.grimper = (it) => {
  const to = it.data && it.data.to;
  if (!to) return;
  if (corps.jambeCassee() && Math.random() < 0.6) { ui.subtitle('', '(Avec cette jambe, vous glissez des barreaux.)', 2.5); return; }
  corps.hisser(to, 1.5 + Math.max(0, to[1] - game.player.pos[1]) * 0.25);
};

// ---------------------------------------------------------------- pêche dans les bassins (sources chaudes, souterrains, temple)
{
  const _spot = strange.fishingSpot.bind(strange);
  strange.fishingSpot = function (eye, dir) {
    const r = _spot(eye, dir);
    if (r) return r;
    for (const P of game.world.pools || []) {
      if (Math.hypot(eye[0] - P.x, eye[2] - P.z) > 16) continue;
      const t = (P.y - eye[1]) / (dir[1] || -1e-3);
      if (!(t > 0 && t < 16)) continue;
      const x = eye[0] + dir[0] * t, z = eye[2] + dir[2] * t;
      const c = Math.cos(P.r || 0), sn = Math.sin(P.r || 0), dx = x - P.x, dz = z - P.z, lx = dx * c - dz * sn, lz = dx * sn + dz * c;
      if (Math.abs(lx) < P.w / 2 && Math.abs(lz) < P.d / 2) return { x, y: P.y, z, kind: P.kind };
    }
    return null;
  };
}

// ============================================================================
//  CINÉMATIQUES : une suite de plans filmés, bandes noires, paroles
//  cine.jouer([{ dur, de: { pos, look } | { pos, yaw, pitch }, a: {...}, texte, qui, fondu, debut(), fin(), joueur }], { passer })
//  - de / a : positions de caméra (a facultatif : plan fixe) ; look : point regardé
//  - orbite : { c:[x,y,z], r, h, a0, a1 } à la place de de/a
//  - joueur : dessine le personnage là où il se tient
//  Renvoie une promesse, résolue à la fin (ou quand on passe avec Espace).
// ============================================================================
const cine = {
  on: false, plans: null, i: 0, t: 0, res: null, opts: null, el: null, lastTxt: '',
  vue(pos, look) {
    const dx = look[0] - pos[0], dy = look[1] - pos[1], dz = look[2] - pos[2];
    return { pos: pos.slice(), yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) };
  },
  cam(k) {
    if (!k) return null;
    if (k.look) return this.vue(k.pos, k.look);
    return { pos: k.pos.slice(), yaw: k.yaw || 0, pitch: k.pitch || 0 };
  },
  jouer(plans, opts) {
    if (this.on) this.finir(true);
    this.plans = plans.filter(Boolean); this.i = -1; this.t = 0; this.opts = opts || {};
    this.on = true; game.noHand = true;
    this.dom(true);
    ui.close(true);
    this.next();
    return new Promise((res) => { this.res = res; });
  },
  next() {
    const P = this.plans[this.i];
    if (P && P.fin) try { P.fin(); } catch (e) { console.error(e); }
    this.i++; this.t = 0;
    const N = this.plans[this.i];
    if (!N) { this.finir(); return; }
    if (N.debut) try { N.debut(); } catch (e) { console.error(e); }
    this.texte(N.texte || '', N.qui || '');
    if (N.fondu === 'noir') $('#cine-veil').classList.add('on'); else $('#cine-veil').classList.remove('on');
  },
  finir(silent) {
    if (!this.on) return;
    const P = this.plans && this.plans[this.i];
    if (P && P.fin && !silent) try { P.fin(); } catch (e) { console.error(e); }
    this.on = false; game.noHand = false; this.plans = null;
    this.dom(false);
    const r = this.res; this.res = null;
    if (this.opts && this.opts.apres) try { this.opts.apres(); } catch (e) { console.error(e); }
    if (r) r();
  },
  passer() {
    if (!this.on || (this.opts && this.opts.passer === false)) return;
    // on joue les effets de tous les plans restants (sans les montrer)
    for (let k = this.i; k < this.plans.length; k++) { const P = this.plans[k]; if (k > this.i && P.debut) try { P.debut(); } catch (e) { console.error(e); } if (P.fin) try { P.fin(); } catch (e) { console.error(e); } }
    this.plans = []; this.i = 0;
    this.finir(true);
  },
  texte(t, qui) {
    const el = $('#cine-txt');
    if (!el) return;
    el.innerHTML = t ? (qui ? `<b>${esc(qui)}</b> — ` : '') + esc(t) : '';
    el.classList.toggle('on', !!t);
  },
  dom(on) {
    if (!$('#cine')) {
      const st = document.createElement('style');
      st.textContent = `#cine{position:fixed;inset:0;pointer-events:none;z-index:40}
#cine .bar{position:absolute;left:0;right:0;height:0;background:#000;transition:height .8s ease}
#cine .bar.t{top:0}#cine .bar.b{bottom:0}
#cine.on .bar{height:11vh}
#cine-txt{position:absolute;left:10%;right:10%;bottom:3.2vh;text-align:center;color:#e8e0cc;font:16px/1.4 Georgia,serif;opacity:0;transition:opacity .5s;text-shadow:0 1px 2px #000}
#cine-txt.on{opacity:1}#cine-txt b{color:#d8b878;font-weight:normal}
#cine-veil{position:absolute;inset:0;background:#000;opacity:0;transition:opacity 1s}
#cine-veil.on{opacity:1}
#cine-skip{position:absolute;right:14px;top:calc(11vh + 8px);color:#8a8070;font:12px Georgia,serif;opacity:0;transition:opacity .5s}
#cine.on #cine-skip{opacity:.7}
body.cine #hud,body.cine #hotbar,body.cine #dot,body.cine #pickups{visibility:hidden}`;
      document.head.appendChild(st);
      const d = document.createElement('div');
      d.id = 'cine';
      d.innerHTML = '<div id="cine-veil"></div><div class="bar t"></div><div class="bar b"></div><div id="cine-txt"></div><div id="cine-skip">Espace : passer</div>';
      document.body.appendChild(d);
    }
    $('#cine').classList.toggle('on', on);
    document.body.classList.toggle('cine', on);
    if (!on) { this.texte(''); $('#cine-veil').classList.remove('on'); }
    $('#cine-skip').style.display = this.opts && this.opts.passer === false ? 'none' : '';
  },
  update(dt) {
    if (!this.on) return;
    const P = this.plans[this.i];
    if (!P) { this.finir(); return; }
    this.t += dt;
    if (P.chaque) try { P.chaque(this.t, dt); } catch (e) { console.error(e); }
    if (this.t >= (P.dur || 3)) this.next();
    if (input.down('Space') && this.t > 0.6 && (this.i > 0 || this.t > 1)) this.passer();
  },
  camera() {
    if (!this.on) return null;
    const P = this.plans[this.i];
    if (!P) return null;
    const k0 = clamp(this.t / (P.dur || 3), 0, 1), k = k0 * k0 * (3 - 2 * k0);
    if (P.orbite) {
      const O = P.orbite, a = lerp(O.a0 || 0, O.a1 ?? (O.a0 || 0) + 0.6, k);
      const pos = [O.c[0] + Math.sin(a) * O.r, O.c[1] + (O.h ?? 3), O.c[2] + Math.cos(a) * O.r];
      return this.vue(pos, O.look || O.c);
    }
    const A = this.cam(P.de), B = this.cam(P.a) || A;
    if (!A) return null;
    let dy = B.yaw - A.yaw;
    while (dy > Math.PI) dy -= TAU;
    while (dy < -Math.PI) dy += TAU;
    const pos = [lerp(A.pos[0], B.pos[0], k), lerp(A.pos[1], B.pos[1], k), lerp(A.pos[2], B.pos[2], k)];
    const shake = P.secousse ? P.secousse * (1 - k0 * 0.5) : 0;
    if (shake) { const t = game.time; pos[0] += Math.sin(t * 37) * shake; pos[1] += Math.sin(t * 41) * shake; }
    return { pos, yaw: A.yaw + dy * k, pitch: lerp(A.pitch, B.pitch, k) };
  },
  // le personnage lui-même, vu de l'extérieur
  rigJoueur() {
    const fem = !!farm.s.fem;
    const key = fem ? 'f' : 'm';
    if (this._rig && this._rigK === key) return this._rig;
    this._rigK = key;
    this._rig = humanRig(fem ? { skin: '#e2b894', hair: '#5a3a22', hairStyle: 'long', top: '#7a6a58', bottom: '#4a3c30', dress: true, bust: 0.5, hips: 0.5 } : { skin: '#dcb08a', hair: '#4a3020', top: '#6a5a48', bottom: '#3a3830', hat: 'paille', beard: 'courte' });
    return this._rig;
  },
};
HOOKS.update.push((dt) => cine.update(dt));
HOOKS.camera.push(() => cine.camera());
HOOKS.draw.push((buf, sbuf, cam, t) => {
  if (!cine.on) return;
  const P = cine.plans && cine.plans[cine.i];
  if (!P || !P.joueur) return;
  const p = game.player, r = cine.rigJoueur();
  poseHuman(r, { move: 0, t, lookY: 0 });
  drawRig(buf, r, p.pos[0], p.pos[1], p.pos[2], p.yaw + Math.PI, 1, 0);
  if (sbuf) drawShadow(sbuf, p.pos[0], p.pos[1], p.pos[2], 0.34);
});
// pendant une cinématique : ni clic, ni touche E (Espace pour passer)
HOOKS.primary.unshift(() => cine.on);
HOOKS.secondary.unshift(() => cine.on);
// (game est défini plus loin, dans 13-main.js : on s'y branche au premier chargement)
HOOKS.load.unshift(() => {
  if (game._socle) return;
  game._socle = true;
  const _interact = game.interact.bind(game);
  game.interact = function () { if (cine.on || corps.hisse) return; return _interact(); };
  const _die = game.die.bind(game);
  game.die = function (cause) { if (cine.on) cine.finir(true); corps.hisse = null; return _die(cause); };
});
