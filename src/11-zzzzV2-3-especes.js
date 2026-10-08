// ============================================================================
//  LES CRÉATURES DES TERRES D'AVANT (agent V2) — les conduites propres
//  Une conduite par sorte de bête (V2_CONDUITES[conduite](e, dt, p), appelée
//  par le moteur pour chaque bête présente) ; ce qui se passe à la naissance
//  (V2_NAISSANCE), quand le nid s'efface (V2_FIN), quand elle est touchée
//  (V2_TOUCHE), quand elle meurt (V2_MORT), quand elle frappe (V2_COUP) ; si
//  elle est là (V2_PRESENCE) ; ce qu'on dessine en plus (V2_DESSIN).
//  Les secrets : l'escarboucle de la vouivre (la pierre plate, à l'aube), le
//  miroir contre le basilic, la ronde des korrigans (« Et après ? »), la voix
//  de l'Étang (ne pas répondre), le cerf qui mène à l'arbre creux, le chien
//  gris qu'on nourrit deux fois.
// ============================================================================
const V2_RANG = { tranquille: 0, abandonne: 1, intriguee: 2, cherche: 3, alertee: 4 };
function v2Viande() { for (const id of ['viande', 'viande_fumee', 'viande_cuite', 'jambon', 'saucisson']) if (ITEMS[id] && farm.count(id)) return id; return null; }
function v2Main() { const h = farm.s.hand; return h && ITEMS[h] ? h : 'main'; }
// le chien gris s'interpose parfois (moteur : blesserJoueur)
function V2_CHIEN_PROTEGE(e, dmg) {
  const C = creaturesV2, K = C.S().chien;
  if (!K.suit || K.mort) return false;
  const ch = C.vivantes.find((q) => q.esp === 'v2_chien' && !q.mort);
  if (!ch || ch.dist > 3.5 || Math.random() > 0.3) return false;
  ch.hp -= dmg; ch.hurtT = 0.3; C.crier(ch, 'mal', 1, true);
  if (ch.hp <= 0) C.mourir(ch);
  return true;
}
// dégâts portés par une bête à une autre (le chien qui mord)
function v2Blesser(e, dmg) { if (!e || e.mort) return; e.hp -= dmg; e.hurtT = 0.3; creaturesV2.crier(e, 'mal', 1, true); if (e.hp <= 0) creaturesV2.mourir(e); }

Object.assign(V2_CONDUITES, {
  // ================================================================ les garous : la nuit en meute ; le jour, ils dorment au repaire
  meute(e, dt, p) {
    const C = this, F = e.furtif, jour = !v2DansHeures(C.h, e.nid.heures);
    const lit = e.lit || [e.hx, e.hz], chezSoi = Math.hypot(e.x - lit[0], e.z - lit[1]) < 2;
    if (jour && chezSoi && !e.dort && (e.mode === 'repos' || e.mode === 'rentre' || e.mode === 'erre')) { e.dort = true; C.sens(e, e.D.dort); }
    if (e.dort && (!jour || F.etat === 'alertee')) { e.dort = false; C.sens(e, jour ? { memoire: 8, vitesse: 1 } : null); if (F.etat === 'alertee') C.crier(e, 'grogne', 1, true); }
    const etat = C.percevoir(e, dt);
    if (e.dort) { C.arreter(e, dt); if (e.sonT <= 0 && e.dist < 30) { e.sonT = 6 + Math.random() * 6; C.crier(e, 'souffle', 0.35); } return; }
    if (etat === 'alertee' && !e.hurle) { e.hurle = true; C.crier(e, 'alerte', 1, true); furtif.alerter(e.x, e.z, 70, 0.9, e); penser.une('v2_garou_vu', V2_TEXTES.garouVu, 3); }
    if (etat !== 'alertee') e.hurle = false;
    e.flaire = etat === 'cherche';
    if (etat === 'alertee' || etat === 'cherche' || etat === 'intriguee') {
      C.traque(e, dt, p, etat, { cercle: true, peutMordre: (q) => !q.nid.ents.some((o) => o !== q && o.prep !== undefined) });
      if (e.sonT <= 0) { e.sonT = 2.5 + Math.random() * 3; C.crier(e, etat === 'cherche' ? 'souffle' : 'grogne', 0.8); }
      return;
    }
    if (C.traque(e, dt, p, etat) === 'rentre') return;
    if (jour) { e.mode = 'rentre'; C.aller(e, dt, lit[0], lit[1], e.D.marche * 1.5); return; }
    e.mode = 'erre';
    C.errer(e, dt, e.nid.r, e.D.marche);
    if (e.sonT <= 0) { e.sonT = 25 + Math.random() * 40; C.crier(e, e.k === 0 && Math.random() < 0.45 ? 'hurle' : 'souffle', 0.7); }
  },

  // ================================================================ les mange-morts : ils suivent ; ils ne mordent que ce qui saigne, ou dans le dos
  charogne(e, dt, p) {
    const C = this, F = e.furtif, J = furtif.joueur();
    const saigne = typeof corps !== 'undefined' && corps.saignement() > 0;
    if (saigne && e.dist < 70) { F.soupcon = Math.max(F.soupcon, 1.05); F.dernier = { x: J.x, y: J.y, z: J.z, t: game.time, vu: false }; }
    // un caillou qui tombe tout près : ils s'égaillent
    for (const b of furtif.bruits) if (b.nature === 'caillou' && b !== e.caillou && Math.hypot(b.x - e.x, b.z - e.z) < 5) { e.caillou = b; e.fuitT = 2; e.fuitDe = [b.x, b.z]; }
    const etat = C.percevoir(e, dt);
    const dx = e.x - J.x, dz = e.z - J.z, d = e.dist || 1, f = C.basis ? C.basis.f : [0, 0, 1];
    const fl = Math.hypot(f[0], f[2]) || 1, devant = (dx * f[0] + dz * f[2]) / (d * fl);
    const faible = game.player.hp < 55 || saigne;
    if (e.fuitT > 0) { e.fuitT -= dt; const o = e.fuitDe || [J.x, J.z]; C.pas(e, dt, Math.atan2(e.x - o[0], e.z - o[1]), e.D.course); if (e.fuitT <= 0) e.fuitDe = null; return; }
    // face à eux, quand on avance : ils reculent
    if (!faible && devant > 0.8 && d < 8 && etat !== 'tranquille' && Math.hypot(game.player.vel[0], game.player.vel[2]) > 1.2) { e.fuitT = 1.4 + Math.random(); C.crier(e, 'ricane', 0.8); return; }
    if (etat === 'alertee') {
      const dos = devant < -0.15;
      if (faible || (dos && d < 4.5)) C.traque(e, dt, p, etat);
      else {
        e.mode = 'suit';
        const a = Math.atan2(dx, dz) + Math.sin(C.t * 0.3 + e.k * 2) * 0.7, R = 10 + e.k * 1.5;
        C.aller(e, dt, J.x + Math.sin(a) * R, J.z + Math.cos(a) * R, d > 18 ? e.D.course * 0.75 : e.D.marche * 1.6);
        C.regarder(e, J.x, J.z, dt);
      }
      if (e.sonT <= 0) { e.sonT = 4 + Math.random() * 7; C.crier(e, 'alerte', 0.7); }
      return;
    }
    e.flaire = etat === 'cherche';
    if (etat === 'cherche' || etat === 'intriguee') { C.traque(e, dt, p, etat); return; }
    if (C.traque(e, dt, p, etat) === 'rentre') return;
    e.mode = 'erre';
    C.errer(e, dt, e.nid.r, e.D.marche);
    e.flaire = !!e.pause;
    if (e.sonT <= 0) { e.sonT = 14 + Math.random() * 25; C.crier(e, Math.random() < 0.5 ? 'ricane' : 'renifle', 0.5); }
  },

  // ================================================================ les pendus : aux branches ; ils tombent sur qui passe dessous, debout
  pendu(e, dt, p) {
    const C = this, F = e.furtif;
    if (e.pendu) {
      e.heading += Math.sin(C.t * 0.35 + e.seed) * dt * 0.18;
      const etat = furtif.percevoir(e, dt);
      const corde = farm.count('v2_corde_pendu') > 0;
      const sous = e.dist < 3.2 && Math.abs(p.pos[1] - (e.y + 1)) < 3 && !(p.crouch > 0.5) && !corde;
      if (sous || etat === 'alertee') {
        e.pendu = false;
        const g = zone.Z.groundAt(e.x, e.z, e.y + 1.5, 0.6);
        e.chute = { y0: e.y, y1: g, t: 0 };
        C.crier(e, 'tombe', 1, true);
        F.soupcon = 2; F.dernier = { x: p.pos[0], y: p.pos[1], z: p.pos[2], t: game.time, vu: false };
        if (F.etat !== 'alertee') furtif.changer(e, 'alertee');
        e.tchasse = 0;
        if (C.basis) { const f = C.basis.f, dx = e.x - p.pos[0], dz = e.z - p.pos[2]; if ((dx * f[0] + dz * f[2]) < 0) penser.pas('v2_pendu', 90, V2_TEXTES.pendusTombe, 3); }
      } else if (e.sonT <= 0 && e.dist < 45) { e.sonT = 4 + Math.random() * 8; C.crier(e, 'grince', 0.6); }
      return;
    }
    if (e.chute) { e.chute.t += dt; e.y = lerp(e.chute.y0, e.chute.y1, Math.min(1, e.chute.t / 0.45) ** 2); if (e.chute.t > 0.9) { e.y = e.chute.y1; e.chute = null; } return; }
    if (e.effondre) { C.arreter(e, dt); return; }
    const etat = C.percevoir(e, dt);
    e.tchasse = (e.tchasse || 0) + dt;
    if (etat === 'alertee' || etat === 'cherche') { C.traque(e, dt, p, etat); if (e.dist < 1.6) e.tchasse = Math.min(e.tchasse, 10); }
    else C.arreter(e, dt);
    if (e.tchasse > 28 || etat === 'abandonne' || (etat === 'tranquille' && e.tchasse > 4)) { e.effondre = true; furtif.oublier(e); e.mode = 'repos'; C.noter('v2_pendu', 1); }
    if (e.sonT <= 0) { e.sonT = 3 + Math.random() * 4; C.crier(e, 'rale', 0.6); }
  },

  // ================================================================ l'écoutant : aveugle ; il entend tout ; il fonce sur le bruit
  ecoute(e, dt, p) {
    const C = this, F = e.furtif;
    const etat = C.percevoir(e, dt);
    e.ecoute = false;
    if (etat === 'alertee') {
      e.mode = 'chasse';
      const L = F.dernier || { x: p.pos[0], z: p.pos[2] };
      if (!e.fonce) { e.fonce = true; C.crier(e, 'alerte', 1, true); penser.une('v2_ecoutant_vu', V2_TEXTES.ecoutantVu, 3.5); }
      const reste = C.aller(e, dt, L.x, L.z, e.D.course);
      C.regarder(e, L.x, L.z, dt, 5);
      if (e.dist < e.D.coup.portee + 0.2 && e.attT <= 0 && e.prep === undefined && Math.abs(p.pos[1] - e.y) < 2) C.lancerCoup(e);
      if (reste < 1.3 && e.dist > 2.6) { F.soupcon = Math.min(F.soupcon, 0.95); furtif.changer(e, 'cherche'); }
      return;
    }
    e.fonce = false;
    if (etat === 'intriguee' || etat === 'cherche') {
      e.ecoute = true; e.mode = 'guette';
      const L = F.dernier;
      if (L) { C.regarder(e, L.x, L.z, dt, 2); if (etat === 'cherche') C.aller(e, dt, L.x, L.z, e.D.marche); else C.arreter(e, dt); }
      if (e.sonT <= 0) { e.sonT = 1.6 + Math.random(); C.crier(e, 'clic', 0.7); }
      return;
    }
    if (C.traque(e, dt, p, etat) === 'rentre') return;
    e.ecouteT = (e.ecouteT || 0) - dt;
    if (e.ecouteT <= 0) { e.ecouteT = 7 + Math.random() * 8; e.stop = 2 + Math.random() * 2; if (e.dist < 60) C.crier(e, 'clic', 0.6); }
    if (e.stop > 0) { e.stop -= dt; e.ecoute = true; C.arreter(e, dt); e.regard = Math.sin(C.t * 0.8 + e.seed) * 0.9; return; }
    e.mode = 'erre';
    C.errer(e, dt, e.nid.r, e.D.marche);
  },

  // ================================================================ les gargouilles : la tête qui balaie ; un cri ; un seul piqué
  guet(e, dt, p) {
    const C = this, F = e.furtif;
    e.cri = Math.max(0, (e.cri || 0) - dt);
    if (e.vol) { v2GargouilleVol(e, dt, p); return; }
    const per = 8 + e.v * 1.7;
    let cible = Math.sin(C.t * TAU / per + e.seed) * 1.15;
    const etat = C.percevoir(e, dt);
    if ((etat === 'intriguee' || etat === 'cherche') && F.dernier) cible = clamp(angDiff(e.cap0, Math.atan2(F.dernier.x - e.x, F.dernier.z - e.z)), -1.45, 1.45);
    if (etat === 'alertee') {
      cible = clamp(angDiff(e.cap0, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z)), -1.5, 1.5);
      if (!e.criee) { e.criee = true; e.cri = 1.6; C.crier(e, 'alerte', 1.2, true); furtif.alerter(e.x, e.z, 70, 1.2, e); penser.pas('v2_garg', 90, V2_TEXTES.gargouilleCri, 3); }
      if (e.dist < 26 && e.attT <= 0 && e.cri < 0.8) { e.vol = { phase: 'fond', t: 0 }; C.crier(e, 'ailes', 1, true); }
    } else e.criee = false;
    const avant = e.regardG || 0;
    e.regardG = turnToward(avant, cible, dt * (etat === 'alertee' ? 2.5 : 0.6));
    if (Math.abs(e.regardG - avant) > dt * 0.3 && e.dist < 25 && e.sonT <= 0) { e.sonT = 2.5 + Math.random() * 2; C.crier(e, 'pierre', 0.5); }
    e.heading = e.cap0 + e.regardG; e.regard = e.regardG; e.capCorps = e.cap0;
    e.move = 0;
  },

  // ================================================================ les stryges : elles planent ; elles fondent sur ce qui est à découvert
  stryge(e, dt, p) {
    const C = this, F = e.furtif, Z = zone.Z;
    const eye = p.eyePos(), couvert = Z.covered(eye[0], eye[1], eye[2]);
    if (e.fond) {
      e.fond.t += dt; e.plane = false;
      const tx = p.pos[0], ty = p.pos[1] + 1.2, tz = p.pos[2], dx = tx - e.x, dy = ty - e.y, dz = tz - e.z, d = Math.hypot(dx, dy, dz) || 1;
      const v = 13 * dt;
      e.x += dx / d * v; e.y += dy / d * v; e.z += dz / d * v; e.heading = Math.atan2(dx, dz);
      if (d < 1.5) { e.fond = null; e.remonte = 2.5; e.attT = 7 + Math.random() * 4; if (!game.dying) C.blesserJoueur(e, e.D.coup.dmg); }
      else if (e.fond.t > 4 || couvert || C.feuPres(p.pos[0], p.pos[2], V2_REFUGE)) { e.fond = null; e.remonte = 2; }
      return;
    }
    // le cercle, haut, au-dessus du nid (ou de ce qui l'intrigue)
    e.ang += dt * (7 / e.R) * (e.k % 2 ? 1 : -1);
    const cx = e.cx, cz = e.cz, tx = cx + Math.cos(e.ang) * e.R, tz = cz + Math.sin(e.ang) * e.R;
    const ty = Math.max(Z.heightAt(tx, tz), Z.waterLevel) + e.alt;
    const k = Math.min(1, dt * (e.remonte > 0 ? 1.5 : 0.8));
    const nx = lerp(e.x, tx, k), nz = lerp(e.z, tz, k);
    if (Math.hypot(nx - e.x, nz - e.z) > 0.01) e.heading = Math.atan2(nx - e.x, nz - e.z);
    e.x = nx; e.z = nz; e.y = lerp(e.y, ty, Math.min(1, dt * 0.9));
    e.remonte = Math.max(0, (e.remonte || 0) - dt);
    e.plane = Math.sin(C.t * 0.3 + e.seed) > -0.3;
    const etat = C.percevoir(e, dt);
    if (etat === 'alertee' && e.attT <= 0 && !couvert && !C.feuPres(p.pos[0], p.pos[2], V2_REFUGE) && e.remonte <= 0) { e.fond = { t: 0 }; C.crier(e, 'attaque', 1, true); return; }
    // ce qui l'intrigue : le cercle glisse vers là
    const L = (etat === 'intriguee' || etat === 'cherche' || etat === 'alertee') && F.dernier;
    const bx = L ? L.x : e.nid.x, bz = L ? L.z : e.nid.z;
    e.cx = lerp(e.cx, bx, Math.min(1, dt * (L ? 0.25 : 0.08))); e.cz = lerp(e.cz, bz, Math.min(1, dt * (L ? 0.25 : 0.08)));
    if (Math.hypot(e.cx - e.nid.x, e.cz - e.nid.z) > e.D.laisse) { e.cx = lerp(e.cx, e.nid.x, 0.05); e.cz = lerp(e.cz, e.nid.z, 0.05); }
    if (e.sonT <= 0) { e.sonT = 12 + Math.random() * 20; if (e.dist < 90) C.crier(e, 'soupir', 0.7); }
  },

  // ================================================================ le basilic : ne pas le regarder ; un miroir le tue
  basilic(e, dt, p) {
    const C = this, F = e.furtif;
    const jour = v2DansHeures(C.h, e.nid.heures);
    if (!jour && !e.dort && e.mode !== 'chasse') { e.dort = true; C.sens(e, e.D.dort); }
    if (jour && e.dort) { e.dort = false; C.sens(e); if (e.dist < 80) C.crier(e, 'chant', 0.8, true); }
    const etat = C.percevoir(e, dt);
    if (e.dort && etat === 'alertee') { e.dort = false; C.sens(e); C.crier(e, 'siffle', 1, true); }
    if (e.dort) { C.arreter(e, dt); return; }
    // le regard : s'il vous voit, et que vous le regardez en face
    const eye = p.eyePos(), hy = e.y + 1.0, dx = e.x - eye[0], dy = hy - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz) || 1, f = C.basis ? C.basis.f : [0, 0, 1];
    const cosR = (dx * f[0] + dy * f[1] + dz * f[2]) / d;
    const ilVoit = F.vu > 0.06 && e.dist < 32;
    const miroir = (farm.s.hand === 'miroir_poche' || farm.s.hand === 'v2_miroir_acier') && cosR > 0.8 && e.dist < 26;
    if (ilVoit && miroir) {
      e.pierre = (e.pierre || 0) + dt * 0.7; e.fixe = true;
      if (e.pierre >= 1) { e.petrifie = true; C.mourir(e); ui.subtitle('', V2_TEXTES.basilicMiroir, 4); return; }
    } else if (ilVoit && cosR > 0.87 && F.ldv !== false) C.pierreJoueur(dt);
    e.fixe = ilVoit;
    if (etat === 'alertee' || etat === 'cherche' || etat === 'intriguee') {
      C.traque(e, dt, p, etat, { vitesse: e.D.course });
      if (e.sonT <= 0) { e.sonT = 3 + Math.random() * 3; C.crier(e, 'alerte' === etat ? 'siffle' : 'chant', 0.7); }
      return;
    }
    if (C.traque(e, dt, p, etat) === 'rentre') return;
    e.mode = 'erre';
    C.errer(e, dt, e.nid.r, e.D.marche);
    if (e.sonT <= 0) { e.sonT = 22 + Math.random() * 30; if (e.dist < 90) C.crier(e, 'chant', 0.6); }
  },

  // ================================================================ la tarasque : elle dort ; elle entend courir ; à midi elle se lève
  tarasque(e, dt, p) {
    const C = this, midi = v2DansHeures(C.h, e.nid.heures);
    e.rugit = Math.max(0, (e.rugit || 0) - dt);
    if (e.reveil > 0) { e.reveil -= dt; C.arreter(e, dt); C.regarder(e, p.pos[0], p.pos[2], dt); return; }
    const etat = C.percevoir(e, dt);
    if (e.dort) {
      C.arreter(e, dt);
      if (e.sonT <= 0) { e.sonT = 3.6 + Math.random() * 2; if (e.dist < 70) C.crier(e, 'ronfle', 0.9); }
      if (etat === 'alertee' || midi) {
        e.dort = false; C.sens(e);
        if (etat === 'alertee') { e.reveil = 2.2; e.rugit = 2.2; C.crier(e, 'alerte', 1.2, true); game.shakeT = Math.max(game.shakeT || 0, e.dist < 40 ? 0.8 : 0.25); penser.pas('v2_tar', 120, V2_TEXTES.tarasqueReveil, 3.5); }
      }
      return;
    }
    e.charge = etat === 'alertee';
    if (e.move > 0.3) { e.pasT = (e.pasT || 0) - dt; if (e.pasT <= 0) { e.pasT = e.run ? 0.45 : 0.9; C.crier(e, 'pas', 0.9, true); if (e.dist < 30) game.shakeT = Math.max(game.shakeT || 0, 0.12 * (1 - e.dist / 30)); } }
    if (etat === 'alertee' || etat === 'cherche' || etat === 'intriguee') { C.traque(e, dt, p, etat, { vitesse: e.D.course }); return; }
    if (C.traque(e, dt, p, etat) === 'rentre') return;
    if (midi) { e.mode = 'erre'; C.errer(e, dt, 30, e.D.marche); return; }
    const reste = C.aller(e, dt, e.hx, e.hz, e.D.marche);
    if (reste < 2.2) { e.dort = true; C.sens(e, e.D.dort); }
  },

  // ================================================================ la chimère : trois têtes, trois regards ; l'une dort à son tour
  chimere(e, dt, p) {
    const C = this;
    e.feu = Math.max(0, (e.feu || 0) - dt);
    const dormeuse = Math.floor((C.t + e.seed) / 25) % 3;
    e.tetesDort = [dormeuse === 0, dormeuse === 1, dormeuse === 2];
    const off = [0, 1.25 + Math.sin(C.t * 0.37) * 0.35, Math.PI], pos = [[0, 1.55, 1.15], [-0.35, 2.05, 0.35], [0, 1.25, -2.1]];
    const s = Math.sin(e.heading), c = Math.cos(e.heading);
    let etat = 'tranquille', T0 = null;
    e.tetes.forEach((T, i) => {
      T.x = e.x + pos[i][0] * c + pos[i][2] * s; T.z = e.z - pos[i][0] * s + pos[i][2] * c; T.y = e.y + pos[i][1] - 1.4;
      T.heading = e.heading + off[i];
      const F = T.furtif; F.aveugle = e.tetesDort[i]; F.sourd = e.tetesDort[i];
      if (e.tetesDort[i]) F.soupcon = Math.max(0, F.soupcon - dt * 0.5);
      const et = furtif.percevoir(T, dt);
      if (V2_RANG[et] > V2_RANG[etat]) { etat = et; T0 = T; }
    });
    if (e.dist < 30 && !e.ditTete) { e.ditTete = true; if (e.dist < 22) penser.une('v2_chimere_tete', V2_TEXTES.chimereTete, 3.5); }
    const L = T0 && T0.furtif.dernier;
    const dh = Math.hypot(e.x - e.hx, e.z - e.hz);
    if ((etat === 'alertee' || etat === 'cherche') && dh < e.D.laisse && !C.feuPres(p.pos[0], p.pos[2], V2_REFUGE)) {
      if (e.couchee) { e.couchee = false; C.crier(e, 'alerte', 1.2, true); }
      e.mode = 'chasse';
      const tx = etat === 'alertee' ? p.pos[0] : L ? L.x : e.hx, tz = etat === 'alertee' ? p.pos[2] : L ? L.z : e.hz;
      if (e.dist > 2.0 || etat !== 'alertee') C.aller(e, dt, tx, tz, etat === 'alertee' ? e.D.course : e.D.marche * 1.5); else C.arreter(e, dt);
      // le lion mord devant ; le bouc crache le feu de son côté ; le serpent frappe derrière
      const a = angDiff(e.heading, Math.atan2(p.pos[0] - e.x, p.pos[2] - e.z));
      if (etat === 'alertee' && e.dist < 2.4 && Math.abs(a) < 0.9 && e.attT <= 0 && e.prep === undefined && !e.tetesDort[0]) C.lancerCoup(e);
      if (etat === 'alertee' && e.dist < 7 && a > 0.4 && a < 2.4 && !e.tetesDort[1]) {
        e.feuT = (e.feuT || 0) - dt;
        if (e.feuT <= 0) { e.feuT = 2.6; e.feu = 1.2; C.crier(e, 'feu', 1, true); }
        if (e.feu > 0) { play.hurt(dt * 7, e, V2_TEXTES.feuChimere); v2Flammes(e, 6); }
      }
      if (etat === 'alertee' && e.dist < 2.8 && Math.abs(a) > 2.3 && !e.tetesDort[2] && e.attT <= 0) { e.attT = 2.4; C.crier(e, 'siffle', 1, true); C.blesserJoueur(e, 10, { cause: e.D.coup.cause, poison: 25 }); }
      return;
    }
    if (etat === 'intriguee' && L) { const want = angDiff(e.heading, Math.atan2(L.x - e.x, L.z - e.z)); e.regard = lerp(e.regard, clamp(want, -0.9, 0.9), Math.min(1, dt * 2)); }
    // retour à l'antre, couchée devant, face au dehors
    const reste = C.aller(e, dt, e.hx, e.hz, e.D.marche);
    if (reste < 1.2) { C.arreter(e, dt); e.heading = turnToward(e.heading, e.nid.cap, dt); e.couchee = true; e.mode = 'repos'; }
    if (e.sonT <= 0) { e.sonT = 18 + Math.random() * 25; if (e.dist < 60) C.crier(e, ['rugit', 'bele', 'siffle'][(Math.random() * 3) | 0], 0.5); }
  },

  // ================================================================ la vouivre : elle vole la nuit ; elle se baigne à l'aube ; elle dort le jour
  vouivre(e, dt, p) {
    const C = this, V = C.S().vouivre, Z = zone.Z, WL = Z.waterLevel, h = C.h, N = e.nid;
    e.cri = Math.max(0, (e.cri || 0) - dt);
    if (V.gemme === 'joueur' && !farm.count('v2_escarboucle')) V.gemme = 'perdue';
    const aveugle = V.gemme === 'joueur' || V.gemme === 'perdue';
    const paisible = V.gemme === 'rendue';
    e.aveugle = aveugle; e.paisible = paisible;
    e.gemme = !aveugle && !paisible && V.gemme !== 'pierre' && V.gemme !== 'prise';
    const nuit = h >= 19 || h < 4, aube = h >= 4 && h < 7;
    // aveugle, elle sent sa pierre : celui qui la porte, elle le trouve à l'oreille
    if (aveugle && V.gemme === 'joueur' && e.dist < 300) {
      e.flairT = (e.flairT || 0) - dt;
      if (e.flairT <= 0) {
        e.flairT = 7 + Math.random() * 5;
        const F = e.furtif, a = Math.random() * TAU, r = 3 + Math.random() * 6;
        F.dernier = { x: p.pos[0] + Math.cos(a) * r, y: p.pos[1], z: p.pos[2] + Math.sin(a) * r, t: game.time, vu: false };
        F.soupcon = Math.max(F.soupcon, 1.05);
        if (F.etat === 'tranquille' || F.etat === 'abandonne') furtif.changer(e, 'cherche');
        if (e.dist < 120) { C.crier(e, 'cri', 0.8); penser.pas('v2_vouivre_cherche', 200, V2_TEXTES.vouivreCherche, 3.5); }
      }
    }
    const etat = C.percevoir(e, dt);
    const enChasse = !paisible && (etat === 'alertee' || (aveugle && etat === 'cherche'));
    const phase = enChasse ? 'chasse' : paisible ? (nuit ? 'nuit' : 'jour') : (aube && !aveugle) ? 'bain' : (nuit || aveugle) ? 'nuit' : 'jour';
    if (phase !== e.phaseV) {
      // fin du bain : elle reprend sa pierre (si elle y est encore)
      if (e.phaseV === 'bain' && V.gemme === 'pierre') { V.gemme = 'front'; v2PierreMaj(); }
      e.phaseV = phase; e.dort = phase === 'jour'; e.posee = false;
      const yeux = paisible ? { aveugle: true, sourd: true } : aveugle ? { aveugle: true, ouie: 2.3, vitesse: 1.6, memoire: 22 } : null;
      C.sens(e, phase === 'jour' && !paisible && !aveugle ? e.D.dort : phase === 'bain' && V.gemme === 'pierre' ? { aveugle: true, ouie: 0.8 } : yeux);
    }
    // ------------------------------------------------- la chasse : elle fond, frappe, remonte
    if (phase === 'chasse') {
      const L = etat === 'alertee' && !aveugle ? { x: p.pos[0], z: p.pos[2] } : e.furtif.dernier;
      if (!L) return;
      const ty = Math.max(Z.heightAt(L.x, L.z), WL) + (e.dist < 6 ? 1.0 : 6);
      e.vol = true;
      const reste = v2Voler(e, dt, L.x, ty, L.z, e.D.course);
      if (e.dist < 2.4 && Math.abs(p.pos[1] + 1 - e.y) < 2.5 && e.attT <= 0 && e.prep === undefined) C.lancerCoup(e);
      if (reste < 2 && e.dist > 4 && aveugle) { const F = e.furtif; F.soupcon = Math.min(F.soupcon, 0.95); }
      if (e.sonT <= 0) { e.sonT = 3 + Math.random() * 3; C.crier(e, aveugle ? 'cri' : 'siffle', 0.8); }
      return;
    }
    // ------------------------------------------------- le bain, à l'aube : elle pose sa pierre, puis nage, aveugle
    if (phase === 'bain') {
      const P = N.pierre;
      if (V.gemme === 'front' || !V.gemme) {
        e.vol = false;
        const reste = v2Voler(e, dt, P.x, P.y + 0.8, P.z, 9);
        if (reste < 2.5) { V.gemme = 'pierre'; v2PierreMaj(); C.crier(e, 'eau', 1, true); C.sens(e, { aveugle: true, ouie: 0.8 }); }
        return;
      }
      e.vol = false;
      const W = N.bain;
      e.ang = (e.ang || 0) + dt * 0.12;
      const tx = W.x + Math.cos(e.ang) * 10, tz = W.z + Math.sin(e.ang) * 10;
      e.x = lerp(e.x, tx, Math.min(1, dt * 0.5)); e.z = lerp(e.z, tz, Math.min(1, dt * 0.5)); e.y = WL - 0.55;
      e.heading = Math.atan2(-Math.sin(e.ang), Math.cos(e.ang));
      if (e.sonT <= 0) { e.sonT = 5 + Math.random() * 6; C.crier(e, 'eau', 0.6); }
      return;
    }
    // ------------------------------------------------- la nuit : de grands cercles au-dessus de l'Étang
    if (phase === 'nuit') {
      e.vol = true;
      const E = N.etang;
      e.ang = (e.ang || 0) + dt * (12 / 140);
      const tx = E.x + Math.cos(e.ang) * 140, tz = E.z + Math.sin(e.ang) * 140;
      v2Voler(e, dt, tx, Math.max(Z.heightAt(tx, tz), WL) + 24, tz, e.D.marche);
      if (e.sonT <= 0) { e.sonT = 25 + Math.random() * 30; if (e.dist < 200) C.crier(e, 'chant', 0.8); }
      return;
    }
    // ------------------------------------------------- le jour : elle dort, enroulée près de la pierre
    const P = N.pierre, lx = P.x + N.lit[0], lz = P.z + N.lit[1];
    if (!e.posee) {
      const reste = v2Voler(e, dt, lx, Z.heightAt(lx, lz) + 0.1, lz, 7);
      if (reste < 1.2) { e.vol = false; e.posee = true; e.y = Z.heightAt(lx, lz); }
      return;
    }
    e.vol = false; C.arreter(e, dt);
  },

  // ================================================================ les noyés : dans l'Étang, la nuit ; ils tiennent ce qui entre dans l'eau
  noye(e, dt, p) {
    const C = this, Z = zone.Z, WL = Z.waterLevel;
    const dansLEau = p.pos[1] < WL - 0.15 && Z.heightAt(p.pos[0], p.pos[2]) < WL - 0.15;
    e.y = WL - 1.3 + Math.sin(C.t * 0.6 + e.seed) * 0.05;
    if (e.tient) {
      C.tenu = true;
      const dx = e.x - p.pos[0], dz = e.z - p.pos[2], d = Math.hypot(dx, dz) || 1;
      p.vel[0] += dx / d * dt * 6; p.vel[2] += dz / d * dt * 6;
      p.breath = Math.max(0, (p.breath || 1) - dt * 0.2);
      p.hp -= dt * 4; play.hurtFlash = Math.max(play.hurtFlash, 0.25);
      if (e.sonT <= 0) { e.sonT = 1.2; C.crier(e, 'bulles', 1); }
      if (p.hp <= 0 && !game.dying) { C.tenu = false; game.die(V2_TEXTES.noyeMort); return; }
      e.tientT = (e.tientT || 0) + dt;
      if (e.dist > 4.2 || !dansLEau || e.tientT > 9) { e.tient = false; e.tientT = 0; C.tenu = false; e.attT = 6; }
      return;
    }
    if (dansLEau && e.dist < 16 && e.attT <= 0) {
      C.aller(e, dt, p.pos[0], p.pos[2], e.D.course);
      if (e.dist < 1.3) { e.tient = true; C.crier(e, 'clapote', 1, true); penser.pas('v2_noye_tient', 30, V2_TEXTES.noyeSaisi, 3); }
      return;
    }
    C.errer(e, dt, e.nid.r, e.D.marche * 0.5);
  },

  // ================================================================ les korrigans : la ronde, la nuit, autour de la grande pierre
  ronde(e, dt, p) {
    const C = this, N = e.nid, K = C.S().korrigans, ev = N.ev || (N.ev = { etat: 'danse', t: 0 });
    e.rit = Math.max(0, (e.rit || 0) - dt);
    const ami = K.issue === 'primedi';
    if (ev.etat === 'danse') {
      e.danse = true; e.cache = false;
      e.ang += dt * 0.55;
      const R = 4.2;
      e.x = N.x + Math.cos(e.ang) * R; e.z = N.z + Math.sin(e.ang) * R;
      e.y = zone.Z.heightAt(e.x, e.z);
      e.heading = e.ang + Math.PI;
      e.move = 1; e.phase += dt * 6;
      if (e.k === 0 && e.sonT <= 0) { e.sonT = 3.1; if (e.dist < 70) { C.crier(e, 'ronde', 0.9); if (e.dist < 45) penser.une('v2_ronde', V2_TEXTES.korriganRonde, 3.5); C.noter('v2_korrigan', 0); } }
      const etat = furtif.percevoir(e, dt);
      if (!ami && K.nuit !== farm.s.day && (e.dist < 8.5 || etat === 'alertee') && !game.dying && !ui.panel) {
        ev.etat = 'arret'; ev.t = 0;
        for (const o of N.ents) { o.danse = false; o.rit = 1.5; }
        C.crier(e, 'rire', 1, true);
      }
      return;
    }
    if (ev.etat === 'arret') {
      // ils s'arrêtent tous ensemble, se tournent, et viennent faire cercle autour de vous
      ev.t += dt / Math.max(1, N.ents.length);
      e.danse = false;
      const a = (e.k / Math.max(1, N.n)) * TAU, tx = p.pos[0] + Math.cos(a) * 2.6, tz = p.pos[2] + Math.sin(a) * 2.6;
      C.aller(e, dt, tx, tz, e.D.course);
      if (Math.hypot(tx - e.x, tz - e.z) < 0.6) { e.move = 0; C.tourner(e, p.pos[0], p.pos[2], dt, 6); }
      if (ev.t > 2.4 && e.k === 0 && !ui.panel && !game.dying) { ev.etat = 'question'; v2Korrigans.question(N); }
      return;
    }
    if (ev.etat === 'question') { C.arreter(e, dt); C.tourner(e, p.pos[0], p.pos[2], dt, 6); if (!ui.panel) { ev.etat = 'parti'; } return; }
    if (ev.etat === 'fete') {
      // ils dansent autour de vous
      e.danse = true; e.ang += dt * 1.2;
      e.x = p.pos[0] + Math.cos(e.ang) * 2.8; e.z = p.pos[2] + Math.sin(e.ang) * 2.8; e.y = zone.Z.heightAt(e.x, e.z);
      e.heading = e.ang + Math.PI; e.phase += dt * 8;
      ev.t += dt / Math.max(1, N.ents.length);
      if (ev.t > 6) { ev.etat = 'danse'; for (const o of N.ents) { o.ang = (o.k / N.n) * TAU; } }
      return;
    }
    // partis : ils filent dans les pierres
    e.danse = false; e.rit = 1;
    const a = Math.atan2(e.x - N.x, e.z - N.z), tx = N.x + Math.sin(a) * 0.5, tz = N.z + Math.cos(a) * 0.5;
    if (C.aller(e, dt, tx, tz, e.D.course) < 1) e.cache = true;
  },

  // ================================================================ le cerf-aux-mains : il fuit qui court ; il guide qui vient doucement
  cerf(e, dt, p) {
    const C = this, F = e.furtif, K = C.S().cerf, N = e.nid;
    if (e.guide) { v2CerfGuide(e, dt, p); return; }
    const etat = C.percevoir(e, dt);
    if (e.fuitT > 0) { e.fuitT -= dt; C.pas(e, dt, Math.atan2(e.x - p.pos[0], e.z - p.pos[2]), e.D.course); e.broute = 0; return; }
    if (etat === 'alertee' && !(p.crouch > 0.5 && e.dist > 3)) { e.fuitT = 6; C.crier(e, 'alerte', 1, true); F.soupcon = 0.4; furtif.changer(e, 'intriguee'); return; }
    if (e.dist < 10 && !K.guide) {
      C.regarder(e, p.pos[0], p.pos[2], dt);
      C.arreter(e, dt); e.broute = 0;
      if (p.crouch > 0.5) { e.calme = (e.calme || 0) + dt; if (e.calme > 3 && N.creux) { e.guide = { phase: 'salue', t: 0 }; e.salue = true; C.crier(e, 'doigts', 0.9, true); C.noter('v2_cerf', 1); } }
      else e.calme = Math.max(0, (e.calme || 0) - dt);
      return;
    }
    e.calme = 0;
    C.errer(e, dt, N.r, e.D.marche);
    e.broute = e.pause ? 1 : 0;
    if (e.sonT <= 0) { e.sonT = 15 + Math.random() * 20; if (e.dist < 50) C.crier(e, Math.random() < 0.5 ? 'souffle' : 'doigts', 0.5); }
  },

  // ================================================================ le chien gris : il garde ses distances ; nourri deux fois, il suit
  chien(e, dt, p) {
    const C = this, K = C.S().chien, N = e.nid;
    e.remue = false; e.grogne = false;
    if (!K.suit) {
      const viande = v2Viande(), calme = viande && p.crouch > 0.5;
      e.couche = false;
      if (e.dist < (calme ? 1.6 : 8)) { C.pas(e, dt, Math.atan2(e.x - p.pos[0], e.z - p.pos[2]), e.D.marche * 2.2); C.regarder(e, p.pos[0], p.pos[2], dt); return; }
      if (e.dist < 20) { C.arreter(e, dt); C.tourner(e, p.pos[0], p.pos[2], dt, 2); C.regarder(e, p.pos[0], p.pos[2], dt); e.remue = !!calme; if (e.sonT <= 0 && calme) { e.sonT = 5 + Math.random() * 4; C.crier(e, 'gemit', 0.6); } return; }
      C.errer(e, dt, 10, e.D.marche);
      return;
    }
    // il suit : derrière, à quelques pas
    N.x = e.x; N.z = e.z;
    e.couche = false;
    const d = e.dist;
    if (d > 70) { // perdu de vue : il revient (quand on ne le regarde pas)
      const a = p.yaw, bx = p.pos[0] + Math.sin(a) * 6, bz = p.pos[2] + Math.cos(a) * 6;
      if (zone.Z.heightAt(bx, bz) > zone.Z.waterLevel + 0.2) { e.x = bx; e.z = bz; e.y = zone.Z.heightAt(bx, bz); }
    }
    if (d > 5) C.aller(e, dt, p.pos[0], p.pos[2], d > 14 ? e.D.course : e.D.marche * 2.4);
    else { C.arreter(e, dt); if (Math.hypot(p.vel[0], p.vel[2]) < 0.2) { e.reposT = (e.reposT || 0) + dt; e.couche = e.reposT > 8; } else e.reposT = 0; }
    // il gronde tout bas quand quelque chose approche
    let menace = null, md = 1e9;
    for (const o of C.vivantes) {
      if (o === e || o.mort || o.cache || o.D.nature !== 'hostile' || (o.esp === 'v2_vouivre' && o.paisible)) continue;
      const dd = Math.hypot(o.x - e.x, o.z - e.z), et = o.furtif ? o.furtif.etat : 'tranquille';
      if ((dd < 22 || (dd < 40 && et !== 'tranquille')) && dd < md && !o.pendu && !o.effondre) { md = dd; menace = o; }
    }
    if (menace) {
      e.grogne = true; e.couche = false; C.regarder(e, menace.x, menace.z, dt, 4);
      if (e.sonT <= 0) { e.sonT = 4 + Math.random() * 3; C.crier(e, 'grogne', 0.7); penser.une('v2_chien_grogne', V2_TEXTES.chienGrogne, 3); C.noter('v2_chien', 1); }
      // il mord ce qui vous attaque
      if (menace.prep !== undefined && menace.dist < 3.5 && Math.hypot(menace.x - e.x, menace.z - e.z) < 2.5 && e.attT <= 0) { e.attT = 1.6; C.crier(e, 'aboie', 1, true); v2Blesser(menace, e.D.coup.dmg); }
    } else { e.remue = d < 4; }
  },

  // ================================================================ les sans-visage : ils broutent ; effrayés, ils s'égaillent en bêlant
  troupeau(e, dt, p) {
    const C = this, F = e.furtif, N = e.nid;
    for (const b of furtif.bruits) if (b.nature === 'caillou' && b !== e.caillou && Math.hypot(b.x - e.x, b.z - e.z) < 8) { e.caillou = b; e.fuitT = 0.01; e.fuitDe = [b.x, b.z]; }
    const etat = C.percevoir(e, dt);
    if (etat === 'alertee' && !e.fuitT) { e.fuitT = 0.01; e.fuitDe = [p.pos[0], p.pos[2]]; }
    if (e.fuitT > 0) {
      if (e.fuitT < 0.05) {
        e.fuitT = 3.5 + Math.random();
        if (!N.panique || C.t - N.panique > 6) { N.panique = C.t; C.crier(e, 'alerte', 1.3, true); furtif.bruit(e.x, e.y, e.z, 30, 'troupeau'); C.noter('v2_sans_visage', 1); for (const o of N.ents) if (o !== e && !o.fuitT) { o.fuitT = 0.01; o.fuitDe = e.fuitDe; } }
      }
      e.fuitT -= dt; e.couche = false;
      const o = e.fuitDe || [p.pos[0], p.pos[2]];
      C.pas(e, dt, Math.atan2(e.x - o[0], e.z - o[1]) + Math.sin(e.seed) * 0.6, e.D.course);
      if (e.fuitT <= 0) { e.fuitT = 0; F.soupcon = 0; furtif.changer(e, 'tranquille'); }
      return;
    }
    e.couche = C.nuit > 0.65;
    if (e.couche) { C.arreter(e, dt); return; }
    C.errer(e, dt, N.r, e.D.marche);
    e.broute = e.pause ? 1 : 0;
    if (e.sonT <= 0) { e.sonT = 7 + Math.random() * 14; if (e.dist < 60) C.crier(e, e.k === 0 ? 'cloche' : 'bele', 0.5); }
  },
});

// ---------------------------------------------------------------- vols : la gargouille qui pique, puis remonte à sa place
function v2GargouilleVol(e, dt, p) {
  const C = creaturesV2, V = e.vol;
  V.t += dt;
  if (V.phase === 'fond') {
    const tx = p.pos[0], ty = p.pos[1] + 1.1, tz = p.pos[2];
    const reste = v2Voler(e, dt, tx, ty, tz, e.D.course);
    if (reste < 1.6) { V.phase = 'retour'; e.attT = 10; if (!game.dying) C.blesserJoueur(e, e.D.coup.dmg); C.crier(e, 'ailes', 1, true); }
    else if (V.t > 5 || C.feuPres(p.pos[0], p.pos[2], V2_REFUGE)) V.phase = 'retour';
    return;
  }
  const P = e.perche, reste = v2Voler(e, dt, P[0], P[1], P[2], e.D.course * 0.7);
  if (reste < 0.5) { e.vol = null; e.x = P[0]; e.y = P[1]; e.z = P[2]; e.heading = e.cap0; e.capCorps = e.cap0; }
}
// voler vers un point (sans relief à suivre, au-dessus du sol) ; renvoie la distance
function v2Voler(e, dt, tx, ty, tz, v) {
  const dx = tx - e.x, dy = ty - e.y, dz = tz - e.z, d = Math.hypot(dx, dy, dz);
  if (d < 0.05) return 0;
  const st = Math.min(d, v * dt);
  e.x += dx / d * st; e.y += dy / d * st; e.z += dz / d * st;
  const Z = zone.Z, g = Math.max(Z.heightAt(e.x, e.z), Z.waterLevel - 0.6) + 0.3;
  if (e.y < g) e.y = g;
  if (Math.hypot(dx, dz) > 0.2) e.heading = turnToward(e.heading, Math.atan2(dx, dz), dt * 4);
  e.capCorps = undefined;
  e.move = 1;
  return d;
}
// les flammes du bouc
function v2Flammes(e, n) {
  const s = Math.sin(e.heading + 1.25), c = Math.cos(e.heading + 1.25);
  const x = e.x - 0.35 * Math.cos(e.heading) + s * 0.5, z = e.z + 0.35 * Math.sin(e.heading) + c * 0.5, y = e.y + 2.0;
  for (let i = 0; i < n; i++) { const v = 4 + Math.random() * 3; particles.spawn(x, y, z, s * v + (Math.random() - 0.5), (Math.random() - 0.3) * 1.2, c * v + (Math.random() - 0.5), [1.0, 0.45 + Math.random() * 0.3, 0.1, 1], 0.14, 0.5 + Math.random() * 0.3, -1, true); }
}
// la pierre plate : l'escarboucle posée (lumière) ou non
function v2PierreMaj() {
  const Z = zone.Z, V = creaturesV2.S().vouivre;
  if (!Z || !Z.v2 || !Z.v2.pierre) return;
  const q = Z.v2.pierre, on = V.gemme === 'pierre';
  if (!!(q.data && q.data.gemme) !== on) { zone.setPropData(q, { gemme: on, lit: on }); Z.collectLights(); }
}
// le cerf qui guide jusqu'à l'arbre creux
function v2CerfGuide(e, dt, p) {
  const C = creaturesV2, G = e.guide, N = e.nid, K = C.S().cerf, T = N.creux;
  G.t += dt;
  if (G.phase === 'salue') { C.arreter(e, dt); C.regarder(e, p.pos[0], p.pos[2], dt); if (G.t > 2.5) { G.phase = 'marche'; G.t = 0; e.salue = false; } return; }
  if (G.phase === 'marche') {
    const loin = e.dist > 16;
    if (loin) { C.arreter(e, dt); C.regarder(e, p.pos[0], p.pos[2], dt, 2); if (!G.attendu && e.dist < 40) { G.attendu = true; penser.pas('v2_cerf_attend', 60, V2_TEXTES.cerfAttend, 3); } if (e.dist > 90) { e.guide = null; e.fuitT = 3; } return; }
    const reste = C.aller(e, dt, T.x + 2.2, T.z + 2.2, e.D.marche * 1.3);
    C.regarder(e, T.x, T.z, dt);
    if (reste < 1.5) { G.phase = 'montre'; G.t = 0; C.crier(e, 'doigts', 1, true); }
    return;
  }
  if (G.phase === 'montre') {
    C.arreter(e, dt); C.tourner(e, T.x, T.z, dt, 2); e.montre = true;
    if (G.t > 5 && e.dist < 20) { K.guide = farm.s.day; C.noter('v2_cerf', 2); }
    if (G.t > 7) { G.phase = 'part'; G.t = 0; e.montre = false; }
    return;
  }
  // il s'en va, et disparaît dans le bois
  C.pas(e, dt, Math.atan2(e.x - p.pos[0], e.z - p.pos[2]), e.D.marche * 2);
  if (G.t > 6 && !C.vuDuJoueur(e.x, e.y + 1, e.z, game.player, C.basis)) { e.cache = true; e.guide = null; }
}

// ---------------------------------------------------------------- les naissances : où et comment chaque sorte apparaît
const V2_NAISSANCE = {
  meute(N, L) { L.forEach((e, k) => { const a = k * 2.1 + 0.4; e.lit = [N.x + Math.cos(a) * 2.4, N.z + Math.sin(a) * 2.4]; if (!v2DansHeures(this.h, N.heures)) { e.x = e.lit[0]; e.z = e.lit[1]; e.y = zone.Z.groundAt(e.x, e.z, e.y + 1, 0.6); e.dort = true; this.sens(e, e.D.dort); e.heading = a + 1.6; } }); },
  pendu(N, L) {
    L.forEach((e, k) => {
      const B = (N.branches || [])[e.k % Math.max(1, (N.branches || []).length)] || { x: N.x, z: N.z, y: N.y + 4.6 };
      e.x = B.x; e.z = B.z; e.cordeY = B.y; e.cordeX = B.x; e.cordeZ = B.z;
      e.y = B.y - 0.62 - 1.52; e.pendu = true; e.heading = (v2Hash(N.id + k) % 628) / 100;
    });
  },
  guet(N, L) { for (const e of L) { e.perche = [N.x, N.y, N.z]; e.cap0 = N.cap; e.capCorps = N.cap; e.heading = N.cap; e.x = N.x; e.y = N.y; e.z = N.z; } },
  stryge(N, L) { L.forEach((e, k) => { e.vol = true; e.cx = N.x; e.cz = N.z; e.R = 20 + k * 7; e.ang = k * 2.3; e.alt = 15 + k * 3.5; e.x = N.x + Math.cos(e.ang) * e.R; e.z = N.z + Math.sin(e.ang) * e.R; e.y = Math.max(zone.Z.heightAt(e.x, e.z), zone.Z.waterLevel) + e.alt; }); },
  basilic(N, L) { for (const e of L) if (!v2DansHeures(this.h, N.heures)) { e.dort = true; this.sens(e, e.D.dort); } },
  tarasque(N, L) { for (const e of L) { e.heading = N.cap; e.x = N.x; e.z = N.z; e.y = zone.Z.groundAt(N.x, N.z, N.y + 1, 0.6); if (!v2DansHeures(this.h, N.heures)) { e.dort = true; this.sens(e, e.D.dort); } } },
  chimere(N, L) {
    for (const e of L) {
      e.heading = N.cap; e.couchee = true; e.x = N.x; e.z = N.z;
      e.tetes = [0, 1, 2].map((i) => { const T = { x: e.x, y: e.y, z: e.z, heading: e.heading, tete: i, chimere: e }; furtif.guetteur(T, Object.assign({}, e.D.sens)); return T; });
      furtif.oublier(e);
    }
  },
  vouivre(N, L) {
    const V = this.S().vouivre;
    if (!V.gemme) V.gemme = 'front';
    for (const e of L) {
      const h = this.h, P = N.pierre;
      if ((h >= 4 && h < 7) && V.gemme === 'front') { V.gemme = 'pierre'; v2PierreMaj(); }
      if (V.gemme === 'pierre') { e.x = N.bain.x; e.z = N.bain.z; e.y = zone.Z.waterLevel - 0.55; }
      else { e.x = P.x + N.lit[0]; e.z = P.z + N.lit[1]; e.y = zone.Z.heightAt(e.x, e.z); }
    }
  },
  noye(N, L) { for (const e of L) { e.y = zone.Z.waterLevel - 1.3; } },
  ronde(N, L) { const ev = N.ev = { etat: 'danse', t: 0 }; void ev; L.forEach((e, k) => { e.ang = (k / L.length) * TAU; e.echelle = 0.62; e.danse = true; }); },
  cerf(N, L) { for (const e of L) e.echelle = 1; },
  chien(N, L) {
    const K = this.S().chien;
    for (const e of L) { e.echelle = 1; if (K.suit && zone.dedans && game.player) { const p = game.player; const a = p.yaw + Math.PI; e.x = p.pos[0] + Math.sin(a) * 3; e.z = p.pos[2] + Math.cos(a) * 3; e.y = zone.Z.heightAt(e.x, e.z); } }
  },
};
// ---------------------------------------------------------------- présence (sinon : les heures)
const V2_PRESENCE = {
  ronde(N) {
    const K = this.S().korrigans, h = this.h;
    if (!(h >= 22 || h < 4)) return false;
    if (typeof cal !== 'undefined' && cal.is('morts')) return false;
    if (K.fache && farm.s.day - K.fache < 7) return false;
    if (K.nuit === farm.s.day && K.issue !== 'primedi' && !N.vie) return false;
    return true;
  },
  chien() { const K = this.S().chien; if (K.mort || K.parti) return false; return true; },
  cerf() { const K = this.S().cerf; if (K.mort) return false; return undefined; },
  noye() { return undefined; },
};
// ---------------------------------------------------------------- quand un nid s'efface
const V2_FIN = {
  vouivre() { const V = creaturesV2.S().vouivre; if (V.gemme === 'pierre') { V.gemme = 'front'; v2PierreMaj(); } },
  noye() { creaturesV2.tenu = false; },
  ronde(N) { if (N.ev && N.ev.etat !== 'danse') { const K = creaturesV2.S().korrigans; if (!K.issue) K.nuit = farm.s.day; } N.ev = null; },
};
// ---------------------------------------------------------------- les coups reçus : multiplicateurs, réactions
const V2_MULT = {
  tarasque() { return 0.6; },
  vouivre(e) { return e.vol ? 0.8 : 1; },
};
const V2_TOUCHE = {
  ronde(e) { const K = creaturesV2.S().korrigans; K.fache = farm.s.day; K.issue = K.issue === 'primedi' ? 'primedi' : 'frappe'; for (const o of e.nid.ents) { o.rit = 0; o.danse = false; } if (e.nid.ev) e.nid.ev.etat = 'parti'; creaturesV2.crier(e, 'cri', 1.2, true); },
  cerf(e) { e.fuitT = 8; e.guide = null; creaturesV2.S().cerf.blesse = farm.s.day; },
  chien(e) { const K = creaturesV2.S().chien; if (K.suit && e.hp > 0) { K.suit = false; K.parti = farm.s.day; e.fuit = true; ui.subtitle('', '(Le chien gris recule, la queue basse. Il ne vous suivra plus.)', 4); } },
  troupeau(e) { e.fuitT = 0.01; e.fuitDe = [game.player.pos[0], game.player.pos[2]]; },
  noye(e) { e.tient = false; creaturesV2.tenu = false; },
  meute(e) { e.dort = false; },
  tarasque(e) { if (e.dort) { e.dort = false; creaturesV2.sens(e); e.reveil = 1.5; e.rugit = 2; } },
  chimere(e) { e.couchee = false; for (const T of e.tetes || []) { const F = T.furtif; if (F) { F.soupcon = 2; F.dernier = { x: game.player.pos[0], y: game.player.pos[1], z: game.player.pos[2], t: game.time, vu: true }; if (F.etat !== 'alertee') furtif.changer(T, 'alertee'); } } },
};
// ---------------------------------------------------------------- les morts
const V2_MORT = {
  basilic(e) {
    const p = [e.x, e.y + 0.8, e.z];
    const don = [['v2_oeil_basilic', 1], ['v2_crete_basilic', 1]];
    for (const [id, n] of don) { farm.give(id, n); play.flyer(id, p, n); }
    if (e.petrifie && e.rig) { for (const q of e.rig.parts) if (q.s) { q.col = [0.5, 0.49, 0.46]; q.tex = TL.stone; q.fl = 0; } sound.v2Cri('v2_basilic', 'pierre', p, 1.2); }
  },
  tarasque(e) { const p = [e.x, e.y + 1.5, e.z]; for (const [id, n] of [['v2_ecaille_tarasque', 3], ['v2_ruban_bleu', 1]]) { farm.give(id, n); play.flyer(id, p, n); } if (e.rig && e.rig.part('ruban')) e.rig.part('ruban').hide = true; },
  chimere(e) { const p = [e.x, e.y + 1.2, e.z]; for (const [id, n] of [['v2_criniere', 1], ['v2_corne_chimere', 1], ['v2_collier_armes', 1]]) { farm.give(id, n); play.flyer(id, p, n); } for (const T of e.tetes || []) furtif.oublier(T); },
  vouivre(e) {
    const V = creaturesV2.S().vouivre, p = [e.x, e.y + 0.6, e.z];
    const don = [['v2_ecaille_vouivre', 2]];
    if (V.gemme === 'front' || V.gemme === 'pierre') don.push(['v2_escarboucle', 1]);
    for (const [id, n] of don) { farm.give(id, n); play.flyer(id, p, n); }
    V.morte = farm.s.day; if (V.gemme === 'pierre' || V.gemme === 'front') V.gemme = 'prise';
    v2PierreMaj();
    if (e.vol) { e.vol = false; e.y = Math.max(zone.Z.heightAt(e.x, e.z), zone.Z.waterLevel - 0.6); }
  },
  chien(e) { const K = creaturesV2.S().chien; K.mort = farm.s.day; K.suit = false; farm.give('v2_collier_chien', 1); play.flyer('v2_collier_chien', [e.x, e.y + 0.5, e.z], 1); },
  cerf(e) { const K = creaturesV2.S().cerf; K.mort = farm.s.day; farm.give('v2_bois_mains', 1); play.flyer('v2_bois_mains', [e.x, e.y + 1.5, e.z], 1); if (typeof esprit !== 'undefined' && esprit.changer) try { esprit.changer(-6, 'le cerf-aux-mains, tué', 8); } catch (err) { /* */ } },
  ronde(e) { const K = creaturesV2.S().korrigans; K.fache = farm.s.day; for (const o of e.nid.ents) if (o !== e) o.cache = true; if (typeof malediction !== 'undefined' && malediction.frapper) try { malediction.frapper('pierres', 'korrigan'); } catch (err) { /* */ } },
  noye(e) { e.tient = false; creaturesV2.tenu = false; },
  stryge(e) { e.vol = false; e.fond = null; e.y = Math.max(zone.Z.heightAt(e.x, e.z), zone.Z.waterLevel - 0.6); },
  guet(e) { e.vol = null; e.y = zone.Z.groundAt(e.x, e.z, e.y + 0.5, 0.5); },
};
// ---------------------------------------------------------------- les coups portés : effets en plus
const V2_COUP = {
  stryge() {
    // elles prennent ce qui brille
    if (Math.random() < (V2_ESPECES.v2_stryge.coup.vole || 0)) {
      const n = Math.min(farm.s.money, 5 + Math.floor(Math.random() * 20));
      if (n > 0 && farm.pay(n)) { penser.pas('v2_stryge_vol', 30, V2_TEXTES.strygeVol, 3); const S = creaturesV2.S(); S.strygeVol = (S.strygeVol || 0) + n; }
    }
  },
};
// ---------------------------------------------------------------- ce qu'on dessine en plus : les cordes des pendus
const V2_DESSIN = {
  pendu(N, buf) {
    PE.buf = buf; PE.fl = 0;
    const col = rgbf('#4a3a2a');
    for (const e of N.ents) {
      if (e.cordeY === undefined) continue;
      const L = e.pendu ? 0.62 : 0.9;
      PE.frame(e.pendu ? e.x : e.cordeX, e.cordeY - L, e.pendu ? e.z : e.cordeZ, 0, 1);
      PE.bx(0, 0, 0, 0.035, L, 0.035, col, TL.rope);
    }
  },
};

// ---------------------------------------------------------------- le basilic : la pierre qui gagne le joueur
creaturesV2.pierre = 0;
creaturesV2.pierreJoueur = function (dt) {
  this.pierre = clamp((this.pierre || 0) + dt * 0.42, 0, 1);
  this.pierreMaj = true;
  if (this.pierre > 0.25 && !this.pierreDit) { this.pierreDit = true; ui.subtitle('', V2_TEXTES.basilicPierre, 4); }
  if (this.pierre >= 1 && !game.dying) { this.pierre = 0; game.die(V2_TEXTES.basilicMort); }
  if (Math.random() < dt * 2) sound.heartbeat && sound.heartbeat(0.6 + this.pierre * 0.4);
};
zone.sur('update', (dt) => {
  const C = creaturesV2;
  if (!C.pierreMaj && C.pierre > 0) { C.pierre = Math.max(0, C.pierre - dt * 0.22); if (C.pierre === 0) C.pierreDit = false; }
  C.pierreMaj = false;
  // la cible (E) en surbrillance
  const t = game.target;
  if (t && t.v2e) t.v2e.highlight = true;
});
zone.sur('fx', (fx, tint) => {
  const k = creaturesV2.pierre || 0;
  if (k <= 0) return;
  tint[0] = 0.42; tint[1] = 0.41; tint[2] = 0.39; tint[3] = Math.max(tint[3], k * 0.6);
  fx[0] = Math.max(fx[0], k * 0.8);
});
// la lueur de l'escarboucle (on la voit de loin, la nuit) ; le troupeau qui cache (accroupi au milieu)
furtif.lumieresEnPlus.push((J) => {
  if (!zone.dedans || !farm.s) return 0;
  let L = 0;
  if (farm.count('v2_escarboucle')) L += farm.s.hand === 'v2_escarboucle' ? 0.35 : 0.1;
  if (J.accroupi) { let n = 0; for (const e of creaturesV2.vivantes) if (e.esp === 'v2_sans_visage' && !e.mort && Math.hypot(e.x - J.x, e.z - J.z) < 3.2) n++; if (n >= 2) L -= 0.4; }
  return L;
});
// le pas des korrigans : trois nuits où l'on ne s'entend plus marcher (emballage de furtif.joueur, en attendant un crochet de V1)
{
  const _j = furtif.joueur.bind(furtif);
  furtif.joueur = function () {
    const J = _j();
    if (J && J._v2 !== this.jT && farm.s && zone.dedans) {
      J._v2 = this.jT;
      const K = creaturesV2.S().korrigans;
      if (K.pas && farm.s.hours < K.pas) J.bruit *= 0.45;
    }
    return J;
  };
}

// ---------------------------------------------------------------- les cibles (E) : le chien, les korrigans
zone.sur('target', (eye, f, cand) => {
  const C = creaturesV2;
  for (const e of C.vivantes) {
    if (e.mort || e.cache || e.dist > 4) continue;
    if (e.esp === 'v2_chien' && !C.S().chien.suit) {
      const vi = v2Viande();
      if (!vi) continue;
      const dx = e.x - eye[0], dy = e.y + 0.5 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
      if (d > 3.2 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.75) continue;
      cand({ kind: 'hook', v2e: e, use: () => v2Chien.nourrir(e, vi) }, d);
    }
  }
});
const v2Chien = {
  nourrir(e, vi) {
    const C = creaturesV2, K = C.S().chien;
    if (!farm.take(vi, 1)) return;
    K.nourri = (K.nourri || 0) + 1;
    C.crier(e, 'gemit', 0.8, true);
    e.remue = true;
    if (K.nourri === 1) ui.read('Le chien gris', 'Il prend la viande du bout des dents, sans vous quitter des yeux, et recule pour la manger. À son cou, un collier de cuir, une plaque de laiton : FIDÈLE. Et, plus petit, une lettre à demi usée : A.');
    else if (!K.suit) { K.suit = farm.s.day; ui.subtitle('', '(Il mange dans votre main. Puis il se lève, et il attend que vous partiez.)', 4); C.noter('v2_chien', 0); }
  },
};
// le chien ne passe pas la Porte ; il attend au Seuil
zone.sur('sortir', () => { const K = creaturesV2.S().chien; if (K.suit && !K.mort) { ui.subtitle('', V2_TEXTES.chienAdieu, 3.5); if (!K.porte) { K.porte = farm.s.day; creaturesV2.noter('v2_chien', 2); } } });

// ---------------------------------------------------------------- la ronde : « Et après ? »
const v2Korrigans = {
  question(N) {
    const K = creaturesV2.S().korrigans, jours = SEMAINE.map((j) => j.nom);
    K.nuit = farm.s.day;
    const chant = '« ' + jours.slice(0, 11).join(', ') + '… »';
    ui.choice('La ronde', chant + ' Ils se taisent tous ensemble, et ils attendent.', [
      { label: jours[11] + '.', fn: () => { ui.close(); this.repondre(N, 'vorndi'); } },
      { label: jours[0] + '.', fn: () => { ui.close(); this.repondre(N, 'primedi'); } },
      { label: 'Se taire.', fn: () => { ui.close(); this.repondre(N, 'tu'); } },
    ]);
  },
  async repondre(N, r) {
    const C = creaturesV2, K = C.S().korrigans, e0 = N.ents[0];
    if (r === 'primedi') {
      if (K.issue !== 'primedi') {
        K.issue = 'primedi'; K.pas = farm.s.hours + 72;
        farm.give('v2_sou_korrigan', 3); play.flyer('v2_sou_korrigan', [game.player.pos[0], game.player.pos[1] + 1.2, game.player.pos[2]], 3);
        C.noter('v2_korrigan', 2);
      }
      if (N.ev) { N.ev.etat = 'fete'; N.ev.t = 0; }
      for (const e of N.ents) e.rit = 2;
      if (e0) { C.crier(e0, 'rire', 1.2, true); C.crier(e0, 'ronde', 1, true); }
      ui.subtitle('', '(Ils crient « Primedi ! » tous ensemble, et la ronde repart autour de vous. Vos pieds sont légers ; vous ne les entendez plus.)', 5);
      farm.save();
      return;
    }
    if (r === 'tu') {
      K.issue = K.issue === 'primedi' ? 'primedi' : 'tu';
      for (const e of N.ents) e.rit = 1.5;
      if (e0) C.crier(e0, 'rire', 1, true);
      if (N.ev) N.ev.etat = 'parti';
      ui.subtitle('', '(Ils rient, et ils filent entre les pierres.)', 3.5);
      C.noter('v2_korrigan', 1);
      return;
    }
    // le jour des morts : on ne le chante pas
    K.issue = 'vorndi'; K.fache = farm.s.day;
    if (e0) C.crier(e0, 'cri', 1.3, true);
    C.noter('v2_korrigan', 1);
    if (N.ev) N.ev.etat = 'parti';
    game.sleeping = true;
    try {
      await ui.fade(true, 'Ils vous prennent par les mains. La ronde ne s’arrête plus.', 2400);
      const w = farm.w, h = w.time * 24, jusqua = 5.2;
      const heures = ((jusqua - h) + 24) % 24;
      game.skipHours(heures);
      if (w.time * 24 > jusqua + 0.5) { w.time = jusqua / 24; }
      const p = game.player;
      p.stamina = 0; p.food = Math.max(0, p.food - 30); p.hp = Math.max(5, p.hp - 12);
      const pris = Math.min(farm.s.money, Math.round(farm.s.money * 0.1), 60);
      if (pris > 0) farm.pay(pris);
      if (farm.count('v2_sou_korrigan')) farm.take('v2_sou_korrigan', farm.count('v2_sou_korrigan'));
      farm.save();
      await ui.fade(false, '', 1600);
      ui.subtitle('', pris > 0 ? '(L’aube. Les pierres sont froides. Vos poches sont plus légères.)' : '(L’aube. Les pierres sont froides. Vous ne sentez plus vos jambes.)', 4.5);
    } finally { game.sleeping = false; }
  },
};

// ---------------------------------------------------------------- la voix de l'Étang : ne pas répondre
const v2Noyes = {
  t: 0,
  update(dt, p) {
    const C = creaturesV2, K = C.S().noyes, Z = zone.Z, h = C.h, jour = farm.s.day;
    if (!(h >= 20 || h < 5)) { this.t = 0; return; }
    if (K.nuit === jour || ui.panel || game.dying || game.sleeping) return;
    // un noyé présent tout près, et le joueur au sec, au bord
    let e0 = null;
    for (const e of C.vivantes) if (e.esp === 'v2_noye' && !e.mort && e.dist < 30) { e0 = e; break; }
    if (!e0) { this.t = Math.max(0, this.t - dt); return; }
    const sec = Z.heightAt(p.pos[0], p.pos[2]) > Z.waterLevel + 0.05;
    const dx = e0.x - p.pos[0], dz = e0.z - p.pos[2], d = Math.hypot(dx, dz) || 1;
    let bord = false;
    for (const k of [3, 6, 9]) if (Z.heightAt(p.pos[0] + dx / d * k, p.pos[2] + dz / d * k) < Z.waterLevel) { bord = true; break; }
    if (!sec || !bord) { this.t = Math.max(0, this.t - dt); return; }
    this.t += dt;
    if (this.t > 2 && !this.dit) { this.dit = true; C.crier(e0, 'voix', 1, true); ui.subtitle('', V2_TEXTES.noyesVoix, 3.5); C.noter('v2_noye', 0); }
    if (this.t > 5.5) {
      this.t = 0; this.dit = false; K.nuit = jour;
      ui.choice('Une voix, depuis l’eau', 'Elle dit votre nom. Elle a la voix de quelqu’un que vous avez connu, et qui n’est pas ici.', [
        { label: 'Répondre', fn: () => { ui.close(); this.repondre(e0); } },
        { label: 'Se taire', fn: () => { ui.close(); this.taire(e0); } },
      ]);
    }
  },
  repondre(e) {
    const C = creaturesV2, K = C.S().noyes, p = game.player;
    K.repondu = (K.repondu || 0) + 1;
    ui.subtitle('', '(Vous répondez. L’eau se lève d’un coup, froide, jusqu’à la taille.)', 3.5);
    if (e && !e.mort) {
      const dx = e.x - p.pos[0], dz = e.z - p.pos[2], d = Math.hypot(dx, dz) || 1;
      p.vel[0] += dx / d * 7; p.vel[2] += dz / d * 7; p.vel[1] += 2;
      e.x = p.pos[0] + dx / d * 2.5; e.z = p.pos[2] + dz / d * 2.5; e.attT = 0;
    }
  },
  taire(e) {
    const C = creaturesV2, K = C.S().noyes, p = game.player;
    K.tu = farm.s.day;
    if (!K.alliance && !K.allianceIci) { K.allianceIci = { x: p.pos[0], z: p.pos[2], j: farm.s.day }; }
    ui.subtitle('', '(Vous ne dites rien. La voix appelle encore, plus bas, puis plus rien.)', 4);
    C.noter('v2_noye', 1);
    void e;
  },
};
zone.sur('update', (dt) => { if (farm.s && zone.Z && creaturesV2.Zcur) try { v2Noyes.update(dt, game.player); } catch (e) { console.error(e); } });
// au matin, l'Étang rend quelque chose, là où l'on s'est tu
zone.sur('target', (eye, f, cand) => {
  const K = creaturesV2.S().noyes, A = K.allianceIci;
  if (!A || K.alliance || farm.s.day <= A.j || creaturesV2.h < 5) return;
  const y = zone.Z.heightAt(A.x, A.z), dx = A.x - eye[0], dy = y + 0.1 - eye[1], dz = A.z - eye[2], d = Math.hypot(dx, dy, dz);
  if (d > 2.6 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.7) return;
  cand({ kind: 'hook', use: () => { K.alliance = farm.s.day; farm.give('v2_alliance', 1); play.flyer('v2_alliance', [A.x, y + 0.3, A.z], 1); creaturesV2.noter('v2_noye', 2); ui.subtitle('', '(Dans la vase, un anneau.)', 3); } }, d);
});
zone.sur('draw', (buf) => {
  const K = creaturesV2.S().noyes, A = K.allianceIci;
  if (!A || K.alliance || !farm.s || farm.s.day <= A.j || creaturesV2.h < 5) return;
  PE.buf = buf; PE.fl = FX_EMIT; PE.frame(A.x, zone.Z.heightAt(A.x, A.z) + 0.02, A.z, 0, 1);
  PE.bx(0, 0, 0, 0.06, 0.02, 0.06, [0.9, 0.75, 0.3], TL.gold);
  PE.fl = 0;
});
