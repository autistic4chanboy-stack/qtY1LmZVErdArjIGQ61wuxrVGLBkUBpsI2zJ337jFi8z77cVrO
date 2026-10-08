// ============================================================================
//  LA DISCRÉTION (agent V1, quatorzième vague) — le cadre commun « furtif »
//  Tout, dans la Zone, doit pouvoir se faire en évitant les monstres. Ce module
//  dit ce que le joueur MONTRE, et ce qu'un GUETTEUR perçoit ; les créatures (V2),
//  le dragon (V3), les gardiens du château (V4) et les gens d'en bas (V5) s'en
//  servent pour décider (elles bougent elles-mêmes).
//  - Le joueur (furtif.joueur(), recalculé dix fois par seconde) :
//      lumiere 0..1  (le jour, la lune, la lanterne, les feux tout près, l'ombre d'un toit)
//      mouvement 0..1 (immobile 0, accroupi 0,25, au pas 0,55, en courant 1)
//      bruit (m)     (portée des pas : accroupi 2,5, au pas 8, en courant 18 ; l'eau, le bois
//                    sonnent plus ; une chute, un objet brisé : des bruits ponctuels, furtif.bruit)
//      couvert 0..1  (herbes hautes, roseaux, buissons autour, surtout accroupi ; l'ombre)
//      visibilite 0..1 (ce que tout cela laisse voir)
//  - Un guetteur (furtif.guetteur(e, réglages)) : e.x, e.y, e.z, e.heading (radians, 0 = +z) ;
//    réglages { vue (m, de jour, 32), cone (degrés, 120), nuit (0..1, ce qu'il garde de sa vue
//    la nuit, 0,45), ouie (m, portée pour un bruit de 10 m, 1 = normal), hauteur (yeux, 1,6),
//    vitesse (montée du soupçon, 1), oubli (descente, 0,25 par seconde), memoire (s, 14),
//    lumiere (0..1 : sensible à la lanterne), aveugle, sourd, onEtat(e, avant, apres) }.
//  - Ses états (e.furtif.etat) : 'tranquille' → 'intriguee' (le soupçon passe 0,35 : il regarde
//    vers le dernier endroit) → 'alertee' (1 : il a vu, il vient) → 'cherche' (il ne voit plus :
//    il va au dernier endroit, il fouille, e.furtif.dernier) → 'abandonne' (au bout de sa mémoire)
//    → 'tranquille'. furtif.percevoir(e, dt) fait tourner tout cela et renvoie l'état.
//  - furtif.voit(e) → 0..1 ; furtif.entend(e) → 0..1 ; furtif.alerter(x, z, r, force) (un cri,
//    une cloche, une bête qui appelle les autres) ; furtif.bruit(x, y, z, portee, nature)
//    (un caillou jeté, une jarre brisée) ; furtif.oublier(e).
//  - La diversion : la pierre en main (objet « pierre »), clic droit : on la jette où l'on
//    regarde (25 m au plus) ; les guetteurs qui l'entendent vont voir là.
//  - L'œil, en haut de l'écran (12-zzzzzV1-zone.js) : fermé, rien ; mi-clos, quelque chose
//    s'inquiète ; ouvert, on vous a vu ; il cherche, il regarde de côté.
// ============================================================================
const FURTIF_ETATS = ['tranquille', 'intriguee', 'alertee', 'cherche', 'abandonne'];
const furtif = {
  liste: new Set(), bruits: [], J: null, jT: 0, max: 0, maxEtat: 'tranquille', actif: false,

  // ------------------------------------------------------------- ce que montre le joueur
  joueur() {
    if (this.J && game.time - this.jT < 0.1) return this.J;
    this.jT = game.time;
    const p = game.player, w = game.world, sky = game.sky;
    const J = this.J || (this.J = {});
    J.x = p.pos[0]; J.y = p.pos[1]; J.z = p.pos[2];
    const eye = p.eyePos(), abri = w && w.covered(eye[0], eye[1], eye[2]);
    // la lumière : le ciel (le jour, la lune), la lanterne, les feux tout près
    let L = 0;
    if (sky) { const a = sky.amb, sun = sky.sunCol, moon = sky.moonCol; L = (a[0] + a[1] + a[2]) / 3 * 1.6 + (sun[0] + sun[1] + sun[2]) / 3 * 0.9 + (moon[0] + moon[1] + moon[2]) / 3 * 1.4; }
    if (abri) L *= 0.45;
    if (game.lantern && farm.count('lanterne')) L += 0.55;
    if (w && w.lights) for (const l of w.lights) { const d = Math.hypot(l.x - J.x, l.z - J.z); if (d < l.r * 0.8) L += 0.4 * (1 - d / (l.r * 0.8)); }
    for (const fn of this.lumieresEnPlus) try { L += fn(J) || 0; } catch (e) { /* */ }
    J.lumiere = clamp(L, 0, 1);
    // le mouvement, le bruit des pas
    const v = Math.hypot(p.vel[0], p.vel[2]), acc = p.crouch > 0.5;
    J.immobile = v < 0.3;
    J.accroupi = acc;
    J.mouvement = J.immobile ? 0 : acc ? 0.25 : p.sprinting ? 1 : 0.55;
    const sol = p.swimming || p.wading ? 1.6 : 1;
    J.bruit = J.immobile ? 0 : (acc ? 2.5 : p.sprinting ? 18 : 8) * sol * (p.onGround || p.swimming ? 1 : 0.3) * this.pas();
    // le couvert : herbes hautes, roseaux, buissons (accroupi, on s'y cache vraiment)
    let cv = 0;
    if (w) w.forObjectsNearRay([J.x - 1.2, J.y, J.z], [1, 0, 0], 2.4, (o) => {
      if (!o || o.gone) return;
      const T = OBJ_TYPES[o.t], k = FURTIF_COUVERT[T.id];
      if (!k || Math.hypot(o.x - J.x, o.z - J.z) > 1.4) return;
      cv = Math.max(cv, k * (acc ? 1 : 0.35) * clamp(o.h / (acc ? 1.0 : 1.7), 0, 1));
    });
    if (abri && J.lumiere < 0.35) cv = Math.max(cv, 0.35);
    J.couvert = clamp(cv, 0, 0.92);
    // ce qui reste visible
    J.visibilite = clamp((0.18 + J.lumiere * 0.82) * (acc ? 0.62 : 1) * (1 - J.couvert) * (0.75 + J.mouvement * 0.35), 0, 1);
    return J;
  },
  lumieresEnPlus: [], // fn(J) → lumière en plus (un autre agent : un sort, une torche portée…)

  // ------------------------------------------------------------- un guetteur
  guetteur(e, R) {
    const F = e.furtif || (e.furtif = {});
    Object.assign(F, { vue: 32, cone: 120, nuit: 0.45, ouie: 1, hauteur: 1.6, vitesse: 1, oubli: 0.25, memoire: 14, lumiere: 0.6 }, R || {});
    F.etat = F.etat || 'tranquille'; F.soupcon = F.soupcon || 0; F.dernier = F.dernier || null; F.tVue = Math.random() * 0.2; F.vu = 0; F.entendu = 0; F.tEtat = 0; F.perdu = 0;
    this.liste.add(e);
    return F;
  },
  oublier(e) { this.liste.delete(e); },

  // ------------------------------------------------------------- voir
  // 0..1 : ce que le guetteur voit du joueur maintenant (cône, distance, lumière, couvert, ligne de vue)
  voit(e) {
    const F = e.furtif;
    if (!F || F.aveugle || game.dying) return 0;
    const J = this.joueur(), w = game.world, sky = game.sky;
    const dx = J.x - e.x, dz = J.z - e.z, d = Math.hypot(dx, dz);
    // la portée : la vue de jour, réduite la nuit (sauf la lanterne, qu'on voit de loin), multipliée par ce qui se montre
    const nuit = sky ? sky.night : 0;
    let portee = F.vue * lerp(1, F.nuit, nuit);
    if (game.lantern && farm.count('lanterne')) portee = Math.max(portee, F.vue * (0.6 + F.lumiere * 0.9));
    portee *= 0.35 + J.visibilite * 0.85;
    if (d > portee) return 0;
    // le cône (de côté, on voit moins ; dans le dos, rien, sauf tout près et bruyamment)
    const a = Math.atan2(dx, dz), da = Math.abs(((a - (e.heading || 0)) % TAU + TAU + Math.PI) % TAU - Math.PI) * 180 / Math.PI;
    let k;
    if (da <= F.cone / 2) k = 1;
    else if (da <= F.cone / 2 + 35) k = 0.35;
    else k = d < 2.2 && J.mouvement > 0.5 ? 0.5 : 0;
    if (!k) return 0;
    // la ligne de vue (blocs, relief) : coûteuse, gardée 0,2 s
    if (!this.ligneDeVue(e, J, d)) return 0;
    return clamp((1 - d / portee) * 1.6, 0, 1) * k;
  },
  ligneDeVue(e, J, d) {
    const F = e.furtif;
    if (F.ldvT && game.time - F.ldvT < 0.2) return F.ldv;
    F.ldvT = game.time;
    const w = game.world, o = [e.x, (e.y || 0) + (F.hauteur || 1.6), e.z], c = [J.x, J.y + (J.accroupi ? 0.8 : 1.3), J.z];
    const v = [c[0] - o[0], c[1] - o[1], c[2] - o[2]], L = Math.hypot(v[0], v[1], v[2]) || 1, dir = [v[0] / L, v[1] / L, v[2] / L];
    let ok = true;
    const bh = w.raycastBlocks(o, dir, L - 0.4);
    if (bh && !bh.block.hidden) ok = false;
    if (ok && o[1] > w.heightAt(o[0], o[2]) - 0.5) { const th = w.raycastTerrain(o, dir, L - 0.5); if (th) ok = false; }
    F.ldv = ok;
    return ok;
  },

  // ------------------------------------------------------------- entendre
  // 0..1 : les pas du joueur, et les bruits ponctuels récents (le plus fort)
  entend(e) {
    const F = e.furtif;
    if (!F || F.sourd) return 0;
    const J = this.joueur();
    let best = 0, ou = null;
    const d = Math.hypot(J.x - e.x, J.z - e.z), por = J.bruit * F.ouie;
    if (por > 0 && d < por) { best = (1 - d / por) * 0.8; ou = [J.x, J.y, J.z]; }
    for (const b of this.bruits) {
      const db = Math.hypot(b.x - e.x, b.z - e.z), pb = b.portee * F.ouie;
      if (db < pb) {
        const k = 1 - db / pb;
        if (k > best) { best = k; ou = [b.x, b.y, b.z]; }
        // un bruit soudain fait sursauter, une fois (un caillou tout près suffit à intriguer)
        if (!b.ont) b.ont = new Set();
        if (!b.ont.has(e)) { b.ont.add(e); F.sursaut = Math.max(F.sursaut || 0, k); }
      }
    }
    F.ouLeBruit = ou;
    return best;
  },

  // ------------------------------------------------------------- percevoir (à chaque image, pour les guetteurs actifs)
  percevoir(e, dt) {
    const F = e.furtif;
    if (!F) return 'tranquille';
    if (!this.liste.has(e)) this.liste.add(e);
    F.tVue -= dt;
    if (F.tVue <= 0) { F.tVue = 0.15 + Math.random() * 0.1; F.vu = this.voit(e); F.entendu = this.entend(e); }
    const J = this.joueur(), avant = F.etat;
    if (F.sursaut) { F.soupcon = Math.min(2, F.soupcon + 0.12 + F.sursaut * 0.5); F.sursaut = 0; }
    const gain = F.vu * 1.6 + F.entendu * 0.9;
    if (gain > 0.02) {
      F.soupcon = Math.min(2, F.soupcon + gain * dt * F.vitesse * (F.etat === 'cherche' ? 1.6 : 1));
      if (F.vu > 0.05) F.dernier = { x: J.x, y: J.y, z: J.z, t: game.time, vu: true };
      else if (F.ouLeBruit) F.dernier = { x: F.ouLeBruit[0], y: F.ouLeBruit[1], z: F.ouLeBruit[2], t: game.time, vu: false };
    } else F.soupcon = Math.max(0, F.soupcon - dt * F.oubli * (F.etat === 'alertee' ? 0.4 : 1));
    F.tEtat += dt;
    switch (F.etat) {
      case 'tranquille': if (F.soupcon > 0.35) this.changer(e, 'intriguee'); break;
      case 'intriguee': if (F.soupcon >= 1) this.changer(e, 'alertee'); else if (F.soupcon < 0.12) this.changer(e, 'tranquille'); break;
      case 'alertee':
        if (F.vu > 0.05) F.perdu = 0; else F.perdu += dt;
        if (F.perdu > 1.6) this.changer(e, 'cherche');
        break;
      case 'cherche':
        if (F.vu > 0.25) { F.soupcon = Math.max(F.soupcon, 1); this.changer(e, 'alertee'); }
        else if (F.tEtat > F.memoire) this.changer(e, 'abandonne');
        break;
      case 'abandonne': if (F.vu > 0.35) { F.soupcon = 1; this.changer(e, 'alertee'); } else if (F.tEtat > 3) { F.soupcon = Math.min(F.soupcon, 0.2); this.changer(e, 'tranquille'); } break;
    }
    if (F.etat !== avant && F.onEtat) try { F.onEtat(e, avant, F.etat); } catch (err) { console.error(err); }
    return F.etat;
  },
  changer(e, etat) {
    const F = e.furtif, avant = F.etat;
    F.etat = etat; F.tEtat = 0; F.perdu = 0;
    if (etat === 'alertee' && avant !== 'cherche' && typeof sonV1 !== 'undefined' && game.time - (this.sonT || 0) > 6) { this.sonT = game.time; sonV1.alerte(0.8); }
  },
  // ------------------------------------------------------------- d'un guetteur aux autres
  alerter(x, z, r, force, sauf) {
    for (const e of this.liste) {
      if (e === sauf || !e.furtif || e.mort || e.dead) continue;
      if (Math.hypot(e.x - x, e.z - z) > r) continue;
      const F = e.furtif;
      F.soupcon = Math.min(2, F.soupcon + (force === undefined ? 1 : force));
      F.dernier = { x, y: game.world.heightAt(x, z), z, t: game.time, vu: false };
      if (F.soupcon >= 1 && F.etat !== 'alertee') this.changer(e, 'cherche');
      else if (F.etat === 'tranquille' && F.soupcon > 0.35) this.changer(e, 'intriguee');
    }
  },
  bruit(x, y, z, portee, nature) { this.bruits.push({ x, y, z, portee: portee || 10, nature: nature || '', t: game.time }); },

  // ------------------------------------------------------------- chaque image : les bruits passés s'éteignent, l'œil
  update(dt) {
    const t = game.time;
    if (this.bruits.length) this.bruits = this.bruits.filter((b) => t - b.t < 0.6);
    let max = 0, etat = 'tranquille';
    const p = game.player.pos;
    for (const e of this.liste) {
      const F = e.furtif;
      if (!F || e.mort || e.dead || e.removed) { this.liste.delete(e); continue; }
      if (Math.abs(e.x - p[0]) > 90 || Math.abs(e.z - p[2]) > 90) continue;
      const k = F.etat === 'alertee' ? 2 : F.etat === 'cherche' ? 1.5 : F.etat === 'intriguee' ? Math.min(1, F.soupcon) : 0;
      if (k > max) { max = k; etat = F.etat; }
    }
    this.max = max; this.maxEtat = etat;
    if (typeof oeilV1 !== 'undefined') oeilV1.montrer(max, etat);
  },
  // ------------------------------------------------------------- la diversion : jeter une pierre où l'on regarde
  lancer(eye, f) {
    if (!farm.count('pierre')) return false;
    const w = game.world, maxD = 25;
    const th = w.raycastTerrain(eye, f, maxD), bh = w.raycastBlocks(eye, f, th ? th.t : maxD);
    let d = th ? th.t : maxD;
    if (bh && bh.t < d) d = bh.t;
    const x = eye[0] + f[0] * d, z = eye[2] + f[2] * d, y = th && (!bh || th.t <= bh.t) ? th.y : w.groundAt(x, z, eye[1] + f[1] * d + 0.5, 1);
    farm.take('pierre', 1);
    play.cool = 0.6;
    const vol = Math.max(0.35, d / 14);
    setTimeout(() => { this.bruit(x, y, z, 16, 'caillou'); if (typeof sonV1 !== 'undefined') sonV1.caillou([x, y + 0.3, z], true); puffAt(x, y + 0.05, z, [110, 105, 100], 5, 1.2, false); }, vol * 1000);
    sound.swish && sound.swish(0.6);
    return true;
  },
};
// ce qui cache (accroupi, au milieu) : herbes hautes, roseaux, buissons, fougères
const FURTIF_COUVERT = { tallgrass: 0.85, reeds: 0.9, bush: 0.8, berry: 0.75, fern: 0.55, heather: 0.4, wheat: 0.7, sunflower: 0.5 };

// les bruits du joueur dans la Zone : une chute, un coup de fusil, un coup d'outil, une porte, s'entendent
{
  const ici = (portee, nature) => { if (zone.dedans && game.player) { const P = game.player.pos; furtif.bruit(P[0], P[1], P[2], portee, nature); } };
  const emballer = (nom, fn) => { if (typeof sound[nom] !== 'function') return; const f = sound[nom].bind(sound); sound[nom] = function (...a) { try { fn(...a); } catch (e) { /* */ } return f(...a); }; };
  emballer('land', (k) => ici(8 + (k || 0.5) * 14, 'chute'));
  emballer('shot', () => ici(90, 'coup de feu'));
  emballer('impact', (k) => ici(k === 'soft' ? 5 : 9, 'coup'));
  emballer('door', () => ici(10, 'porte'));
  emballer('splash', () => ici(12, 'eau'));
}
// les pas : plus sourds avec des chaussons de lisière (agent U), plus lourds avec des bottes
furtif.pas = function () {
  const inv = farm.s && farm.s.inv;
  if (!inv) return 1;
  let k = 1;
  if (typeof ITEMS !== 'undefined' && ITEMS.chaussons_lisiere && inv.chaussons_lisiere) k *= 0.6;
  else if (inv.bottes) k *= 1.15;
  for (const fn of this.pasEnPlus) try { k *= fn() || 1; } catch (e) { /* */ }
  return k;
};
furtif.pasEnPlus = []; // fn() → multiplicateur du bruit des pas (un autre agent)
HOOKS.update.push(Object.assign((dt) => { if (zone.dedans) furtif.update(dt); else if (furtif.max) { furtif.max = 0; if (typeof oeilV1 !== 'undefined') oeilV1.montrer(0, 'tranquille'); } }, { zone: true }));
// les mains nues (ou la pierre en main), clic droit, dans la Zone : on jette une pierre, si l'on en a
HOOKS.secondary.push((eye, basis, it, id) => { if (!zone.dedans || (id !== 'pierre' && id !== 'main') || !farm.count('pierre')) return false; furtif.lancer(eye, basis.f); return true; });
