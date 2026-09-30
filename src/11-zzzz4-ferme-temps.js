// ============================================================================
//  LA FERME ET LE TEMPS (sixième vague, agent X) — ce qui accompagne les règles
//  de la terre (11-farm-state.js : TERRE, farm.tick, farm.water, farm.fertilize,
//  farm.recolte ; la météo : 10-weather.js dayPlan ; les crues : 11-zzvallee.js) :
//  - la portée des arroseurs (trois cases autour, quatre pour celui de fer) se voit
//    quand on en tient un, ou qu'on en vise un : un carré de piquets bleutés ;
//  - sous la pluie (ou la neige), les petites bêtes s'en vont : papillons, lucioles,
//    libellules, abeilles montent et s'effacent (les papillons et lucioles dessinés
//    par la carte graphique : 08-renderer.js) ;
//  - la grainetière sait ce qu'il faut savoir de la terre.
// ============================================================================

const fermeTemps = {
  sprList: [], sprT: 0, fuiteT: 0,
  // arroseurs posés (liste rafraîchie de temps en temps, comme les épouvantails)
  arroseurs() {
    const now = performance.now(), w = game.world;
    if (now > this.sprT) { this.sprT = now + 1500; this.sprList = w.props.filter((q) => w.live(q) && PLACEABLES[q.id] && PLACEABLES[q.id].sprinkler); }
    return this.sprList;
  },
  // l'arroseur que l'on regarde, de près (il n'a pas d'usage à la touche E : on suit le regard)
  vise() {
    const p = game.player, e = p.eyePos(), f = cameraBasis(p.yaw, p.pitch).f;
    let best = null, bd = 0.45;
    for (const q of this.arroseurs()) {
      const dx = q.x - e[0], dy = q.y + 0.4 - e[1], dz = q.z - e[2], t = dx * f[0] + dy * f[1] + dz * f[2];
      if (t < 0.3 || t > 6) continue;
      const d = Math.hypot(dx - f[0] * t, dy - f[1] * t, dz - f[2] * t);
      if (d < bd) { bd = d; best = q; }
    }
    return best;
  },
  // le carré arrosé : pendant qu'on tient un arroseur (celui qu'on pose, et ceux d'à côté), ou qu'on en regarde un
  dessiner(buf) {
    const s = farm.s, it = ITEMS[s.hand], w = game.world, p = game.player;
    const P = it && it.place && PLACEABLES[it.place];
    const carres = [];
    if (P && P.sprinkler) {
      const g = play.ghost;
      if (g) carres.push([g.x, g.z, P.sprinkler, true]);
      for (const q of this.arroseurs()) if (Math.hypot(q.x - p.pos[0], q.z - p.pos[2]) < 45) carres.push([q.x, q.z, PLACEABLES[q.id].sprinkler, false]);
    } else if (game.mode === 'play' && !ui.panel) { const q = this.vise(); if (q) carres.push([q.x, q.z, PLACEABLES[q.id].sprinkler, false]); }
    if (!carres.length) return;
    PE.buf = buf; PE.fl = FX_EMIT;
    for (const [cx, cz, R, fantome] of carres) {
      // les cases arrosées : de floor(x) − R à floor(x) + R (farm.tick) ; le bord du carré passe entre les cases
      const x0 = Math.floor(cx) - R, x1 = Math.floor(cx) + R + 1, z0 = Math.floor(cz) - R, z1 = Math.floor(cz) + R + 1;
      const col = fantome ? [0.62, 0.92, 1.4] : [0.45, 0.72, 1.1];
      const n = x1 - x0;
      for (let k = 0; k < n; k++) {
        for (const [x, z, a] of [[x0 + k + 0.5, z0, 0], [x0 + k + 0.5, z1, 0], [x0, z0 + k + 0.5, Math.PI / 2], [x1, z0 + k + 0.5, Math.PI / 2]]) {
          PE.frame(x, w.heightAt(x, z) + 0.08, z, a, 1);
          PE.box(0, 0, 0, 0.55, 0.06, 0.1, col, TL.plain);
        }
      }
      for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { PE.frame(x, w.heightAt(x, z), z, 0, 1); PE.bx(0, 0, 0, 0.07, 0.55, 0.07, col, TL.plain); }
    }
    PE.fl = 0;
  },
  // la pluie arrive : les petites bêtes volantes (particules de 10-zzcreatures-more.js) s'en vont
  update(dt) {
    this.fuiteT -= dt;
    if (this.fuiteT > 0) return;
    this.fuiteT = 0.25;
    if (!(weather.cur.rain > 0.3 || (typeof vallee !== 'undefined' && vallee.snowK > 0.3))) return;
    const R = Math.random;
    for (const q of particles.list) {
      if (!(q.flutter || q.blink || q.dart)) continue;
      q.flutter = 0; q.blink = 0; q.dart = 0;
      q.vx = q.vx * 0.5 + (R() - 0.5) * 1.6; q.vz = q.vz * 0.5 + (R() - 0.5) * 1.6; q.vy = 0.6 + R() * 0.8; q.grav = -0.4;
      q.life = Math.min(q.life, 1.2 + R() * 1.6);
    }
  },
};
HOOKS.draw.push((buf) => { if (farm.s && game.world) fermeTemps.dessiner(buf); });
HOOKS.update.push((dt) => fermeTemps.update(dt));

// ---------------------------------------------------------------- ce que sait la grainetière
{
  const G = NPC_DATA.find((d) => d.id === 'grainetiere');
  if (G && G.lines && G.lines.rumeurs) G.lines.rumeurs.push(
    'Une terre, ça se fatigue comme une bête de trait. Cinq récoltes sans engrais, et elle traîne ; dix, et elle ne donne plus qu’à contrecœur.',
    'Une terre bien arrosée tient deux jours sans pluie. Après, la plante tient encore deux jours. Pas un de plus.',
    'Un champ qu’on laisse retourner à l’herbe se refait tout seul, doucement. L’engrais va plus vite, et il ne coûte presque rien.',
  );
}
