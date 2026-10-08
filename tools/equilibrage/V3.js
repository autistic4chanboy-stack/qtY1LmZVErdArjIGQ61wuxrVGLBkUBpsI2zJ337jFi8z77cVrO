// Équilibrage — le Ver, le dragon qui surveille (agent V3, quatorzième vague)
//  - l'aire et les perchoirs : posés au sec, à plat, sans rien là où il se pose ; l'aire, le tas, l'anneau et le dernier
//    guetteur s'atteignent à pied depuis l'arrivée ; la loge du Guet aussi (le carnet, la cloche) ;
//  - le vol : six journées simulées (de l'aube au soir, hasard à graine fixe) : jamais dans le relief ni dans les toits ;
//    il se pose, il fait ses rondes, il passe sur les régions — souvent, mais pas sans cesse (passages à moins de 250 m
//    d'un point, par jour), et chaque jour au-dessus de la région du joueur ;
//  - le regard : de jour, debout, à découvert, il voit de loin ; accroupi dans les herbes hautes, de près seulement ; la
//    nuit, sans lanterne, à peine ; la lanterne se voit de loin ; sous un toit, rien ;
//  - le feu : une passe ne tue pas d'un coup (on a le temps de se cacher), trois passes, oui ; on le vérifie en simulant
//    une attaque sur un joueur debout dans un champ ;
//  - ce qu'il garde : le tas (six fouilles) et les écailles valent quelques journées de travail, pas davantage ;
//  - le tuer : « presque impossible » (au moins huit balles dans la plaie, une vingtaine de flèches de fer bien tirées) ;
//  - aucune passe de génération de la vallée (la vallée ne bouge pas) ; les matières : 64 au plus.
'use strict';
const fs = require('fs');
const path = require('path');
// le hasard des rondes, à graine fixe (Math est partagé avec node : on le rend toujours) : les mesures sont reproductibles
function graine(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function avecGraine(seed, fn) { const r0 = Math.random; Math.random = graine(seed); try { return fn(); } finally { Math.random = r0; } }
const JOURS = 6;
module.exports = {
  titre: 'Le Ver, le dragon qui surveille (V3)',
  async verifier(J, log) {
    let echecs = 0;
    const ko = (m) => { echecs++; log('ÉCHEC : ' + m); };
    // ---------------------------------------------------------------- la vallée n'est pas touchée
    const src = fs.readdirSync(path.join(__dirname, '..', '..', 'src')).filter((f) => /V3/.test(f));
    const touche = src.filter((f) => /generateValley/.test(fs.readFileSync(path.join(__dirname, '..', '..', 'src', f), 'utf8')));
    log(`fichiers V3 : ${src.join(', ')} ; passe de la vallée : ${touche.length ? touche.join(', ') : 'aucune'}`);
    if (touche.length) ko('une passe de génération de la vallée dans les fichiers V3');
    const nm = J.ev('MATERIALS.length');
    log(`matières : ${nm} (64 au plus)`);
    if (nm > 64) ko('trop de matières');
    // ---------------------------------------------------------------- la Zone et ce que pose V3
    const t0 = Date.now();
    const Z = await J.ev('zoneGen.generer(zone.graine(), () => {})');
    J.ctx.__Z = Z;
    log(`la Zone générée en ${Date.now() - t0} ms (passe V3 : ${J.ev('zone.mesures.etapes["passe V3"]')} ms)`);
    const G = JSON.parse(J.ev(`(() => { zone.Z = __Z; const Z = __Z, V = Z.v3, WL = Z.waterLevel, S = Z.size, C = 4, N = Math.floor(S / C), acc = new Uint8Array(N * N), Q = [];
      const H = new Float32Array(N * N); for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) H[j * N + i] = Z.heightAt((i + 0.5) * C, (j + 0.5) * C);
      const pont = new Float32Array(N * N).fill(-1e9); for (const p of Z.v1.ponts) { for (let s = -p.L / 2; s <= p.L / 2; s += 1) for (let l = -p.w / 2; l <= p.w / 2; l += 1) { const x = p.x + Math.sin(p.r) * s + Math.cos(p.r) * l, z = p.z + Math.cos(p.r) * s - Math.sin(p.r) * l, i = Math.floor(x / C), j = Math.floor(z / C); if (i >= 0 && j >= 0 && i < N && j < N) pont[j * N + i] = p.y; } }
      const hh = (k) => pont[k] > -1e8 ? pont[k] : H[k];
      const A = Z.v1.arrivee, s0 = Math.floor(A.z / C) * N + Math.floor(A.x / C); acc[s0] = 1; Q.push(s0);
      // la chaîne du Guet : du pied de la roche au bord de l'aire (on la monte)
      const CHn = V.chaine, cb = CHn ? Math.floor(CHn.bas.z / C) * N + Math.floor(CHn.bas.x / C) : -1, chh = CHn ? Math.floor(CHn.haut.z / C) * N + Math.floor(CHn.haut.x / C) : -1;
      let chaineMontee = false;
      for (let h = 0; h < Q.length; h++) { const k = Q[h], i = k % N, j = (k / N) | 0;
        if (CHn && !chaineMontee && Math.abs(i - (cb % N)) <= 1 && Math.abs(j - ((cb / N) | 0)) <= 1) { chaineMontee = true; if (!acc[chh]) { acc[chh] = 1; Q.push(chh); } }
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 1 || jj < 1 || ii >= N - 1 || jj >= N - 1) continue; const k2 = jj * N + ii; if (acc[k2]) continue; const h2 = hh(k2); if ((h2 < WL + 0.4 && pont[k2] < -1e8) || Math.abs(h2 - hh(k)) > C * 1.05) continue; acc[k2] = 1; Q.push(k2); } }
      const atteint = (x, z, r) => { const i0 = Math.floor(x / C), j0 = Math.floor(z / C), R = Math.max(1, Math.ceil((r || 3) / C)); for (let j = j0 - R; j <= j0 + R; j++) for (let i = i0 - R; i <= i0 + R; i++) { if (i < 0 || j < 0 || i >= N || j >= N) continue; if (acc[j * N + i]) return true; } return false; };
      const out = { aire: {}, perchoirs: {}, poses: {} };
      for (const k of ['tas', 'anneau', 'reste', 'loge', 'cloche', 'couche']) { const q = V[k]; out.aire[k] = q ? { ok: atteint(q.x, q.z, 3), eau: Z.heightAt(q.x, q.z) < WL + 0.3 } : null; }
      for (const id in V.perchoirs) { const q = V.perchoirs[id]; out.perchoirs[id] = atteint(q.x, q.z, 6); }
      // là où il se pose : rien (bloc, objet posé) à moins de 5 m du centre
      const L = dragonV3.lieux(), pts = [L.aire].concat(L.perchoirs);
      for (const q of pts) { let n = 0; for (const b of Z.blocks) if (!b.hidden && Math.hypot(b.x - q.x, b.z - q.z) < 5 + Math.max(b.sx, b.sz) / 2) n++; for (const p of Z.props) if (Math.hypot(p.x - q.x, p.z - q.z) < 5) n++; out.poses[q.id] = { libre: n === 0, eau: Z.heightAt(q.x, q.z) < WL + 0.5 }; }
      // les objets posés, les interactions
      out.props = Z.props.filter((q) => q.id.startsWith('v3_')).length; out.inter = Z.inter.filter((i) => i.kind.startsWith('v3_')).length;
      out.chaine = CHn ? { bas: atteint(CHn.bas.x, CHn.bas.z, 3), haut: +(CHn.haut.y - CHn.bas.y).toFixed(1) } : null;
      return JSON.stringify(out); })()`));
    log(`la chaîne du Guet : ${G.chaine ? (G.chaine.bas ? 'son pied s’atteint à pied' : 'son pied NE s’atteint PAS') + ', ' + G.chaine.haut + ' m jusqu’au bord de l’aire' : 'ABSENTE'}`);
    if (!G.chaine || !G.chaine.bas) ko('on ne monte pas à l’aire');
    log(`aire : ${Object.entries(G.aire).map(([k, v]) => k + (v ? (v.ok ? '' : ' (hors d’atteinte)') + (v.eau ? ' (dans l’eau)' : '') : ' ABSENT')).join(', ')} ; ${G.props} objets posés, ${G.inter} interactions`);
    for (const k of ['tas', 'anneau', 'reste', 'couche', 'loge', 'cloche']) { const v = G.aire[k]; if (!v) ko(`${k} absent`); else { if (!v.ok) ko(`${k} : on n’y va pas à pied`); if (v.eau) ko(`${k} : dans l’eau`); } }
    log(`perchoirs atteints à pied : ${Object.entries(G.perchoirs).map(([k, v]) => k.replace('dragon_', '') + (v ? '' : ' (non : il faut grimper)')).join(', ')}`);
    for (const [k, v] of Object.entries(G.poses)) { if (!v.libre) ko(`là où il se pose (${k}), il y a quelque chose`); if (v.eau) ko(`là où il se pose (${k}), c'est l'eau`); }
    if (G.props < 30 || G.inter < 10) ko('l’aire et les perchoirs sont presque vides');
    // ---------------------------------------------------------------- le vol : une journée simulée
    J.ev(`(() => {
      const Z = __Z;
      zone.Z = Z; zone.dedans = true;
      farm.s = { seed: 1234, day: 3, hours: 2 * 24 + 6.6, inv: {}, flags: {}, v3: { premiere: 1 } };
      farm.w = { time: 6.6 / 24, dayLength: JOUR_SECONDES };
      game.world = Z; game.time = 0; game.lantern = false;
      game.sky = { day: 1, night: 0, amb: [0.42, 0.42, 0.45], sunCol: [0.8, 0.76, 0.7], moonCol: [0, 0, 0], fog: [90, 300], sunDir: [0.35, 0.8, 0.45], moonDir: [0, -1, 0] };
      const A = Z.v1.arrivee;
      game.player = { pos: [A.x, Z.heightAt(A.x, A.z), A.z], vel: [0, 0, 0], hp: 100, crouch: 0, yaw: 0, pitch: 0, sprinting: false, swimming: false, wading: false, underground: false, onGround: true,
        eyePos() { return [this.pos[0], this.pos[1] + 1.6, this.pos[2]]; } };
      globalThis.__degats = 0; play.hurt = (d) => { __degats += d; };
    })()`);
    // six journées (le hasard des rondes, à graine fixe) : le joueur est au Seuil, à l'abri sous terre (le Ver ne le voit
    // pas, mais il surveille sa région) ; on compte ses passages à moins de 250 m de quelques points de la Zone
    const ronde = (seed) => JSON.parse(avecGraine(seed, () => J.ev(`(() => {
      const Z = __Z, V = dragonV3, dt = 0.1, S = Z.size;
      game.player.underground = true;
      const obs = { seuil: V1_REGIONS.seuil, bois_mort: V1_REGIONS.bois_mort, ville_basse: V1_REGIONS.ville_basse, tertres: V1_REGIONS.tertres, cendrieres: V1_REGIONS.cendrieres, degres: V1_REGIONS.degres, ravines: V1_REGIONS.ravines };
      const pas = {}, dedans = {};
      for (const k in obs) { pas[k] = 0; dedans[k] = false; }
      let minClear = 1e9, minPh = '', poses = 0, prev = '', t = 0, vol = 0, ronde = 0, soirs = 0, fins = [];
      const sol = (x, z) => Math.max(Z.heightAt(x, z), Z.waterLevel, V.toitAt(x, z));
      for (let jour = 0; jour < ${JOURS}; jour++) {
        farm.w.time = 6.6 / 24; farm.s.hours = (2 + jour) * 24 + 6.6;
        V.D = null; V.placer('test'); V.grace = 0;
        let sommeil = false;
        while (farm.w.time * 24 < 22.2) {
          game.time += dt; t += dt; farm.w.time += dt / JOUR_SECONDES; farm.s.hours += dt * 24 / JOUR_SECONDES;
          V.update(dt);
          const D = V.D;
          if (!D) break;
          if (D.mode === 'vol') { vol += dt; if (D.phase === 'ronde' || D.phase === 'cercle') { ronde += dt; const c = D.y - sol(D.x, D.z); if (c < minClear) { minClear = c; minPh = D.phase; } } }
          if (D.mode === 'pose' && prev !== 'pose') poses++;
          prev = D.mode;
          for (const k in obs) { const R = obs[k], d = Math.hypot(D.x - R.x * S, D.z - R.z * S), x = d < 250 && D.mode === 'vol'; if (x && !dedans[k]) pas[k]++; dedans[k] = x; }
          if (D.mode === 'dort') sommeil = true;
        }
        if (sommeil) soirs++;
        fins.push(V.D ? V.D.mode + '/' + V.D.phase : null);
      }
      return JSON.stringify({ t: Math.round(t / ${JOURS}), vol: Math.round(vol / ${JOURS}), ronde: Math.round(ronde / ${JOURS}), minClear: +minClear.toFixed(1), minPh, poses: +(poses / ${JOURS}).toFixed(1), pas, soirs, fins });
    })()`)));
    // (EQ_V3_GRAINES=1,2,3… : la même mesure pour plusieurs graines, pour voir ce que le hasard y change)
    if (process.env.EQ_V3_GRAINES) for (const g of process.env.EQ_V3_GRAINES.split(',')) { const R = ronde(+g); log(`  graine ${g} : passages ${Object.values(R.pas).reduce((a, b) => a + b, 0)} (${Object.entries(R.pas).map(([k, v]) => k + ' ' + v).join(', ')}), posé ${R.poses} fois par jour, au plus près ${R.minClear} m, soirs ${R.soirs}`); }
    const J1 = ronde(14);
    log(`${JOURS} journées (de 6 h 36 à 22 h 12, ${J1.t} s chacune) : en vol ${J1.vol} s par jour (en ronde ${J1.ronde} s), posé ${J1.poses} fois par jour ; au plus près du relief en ronde : ${J1.minClear} m (${J1.minPh}) ; le soir : ${J1.fins.join(', ')}`);
    log(`passages à moins de 250 m, en ${JOURS} jours (le joueur est au Seuil) : ${Object.entries(J1.pas).map(([k, v]) => k + ' ' + v).join(', ')}`);
    if (J1.minClear < 15) ko('en ronde, il passe trop près du relief');
    if (J1.poses < 1.5) ko('il ne se pose presque jamais');
    if (J1.soirs < JOURS) ko('le soir, il ne rentre pas toujours dans son aire');
    const total = Object.values(J1.pas).reduce((a, b) => a + b, 0);
    if (total < 4 * JOURS) ko('il ne passe presque jamais sur les régions');
    if (J1.pas.seuil < JOURS) ko('il ne vient pas voir là où est le joueur');
    if (Math.max(...Object.values(J1.pas)) > 20 * JOURS) ko('il passe sans cesse au même endroit');
    // ---------------------------------------------------------------- le regard (la formule)
    const P = JSON.parse(J.ev(`(() => { const V = dragonV3, e = (l, c, ca, im, ac, co, n, f) => V.expoPure(l, c, ca, im, ac, co, n, f);
      return JSON.stringify({
        jourDebout: V.porteeVue(1, 300, false, e(0.95, 0, 1, false, false, false, false, false)),
        jourImmobile: V.porteeVue(1, 300, false, e(0.95, 0, 1, true, false, false, false, false)),
        jourCourt: V.porteeVue(1, 300, false, e(0.95, 0, 1, false, false, true, false, false)),
        herbesAccroupi: V.porteeVue(1, 300, false, e(0.95, 0.85, 1, true, true, false, false, false)),
        sousArbres: V.porteeVue(1, 300, false, e(0.95, 0, 0.3, false, false, false, false, false)),
        brume: V.porteeVue(1, 55, false, e(0.95, 0, 1, false, false, false, false, false)),
        nuit: V.porteeVue(0, 120, false, e(0.15, 0, 1, false, false, false, false, false)),
        nuitLanterne: V.porteeVue(0, 120, true, e(0.7, 0, 1, false, false, false, false, false)),
      }); })()`));
    log(`portée du regard (m) : ${Object.entries(P).map(([k, v]) => k + ' ' + Math.round(v)).join(', ')}`);
    if (P.jourDebout < 120) ko('de jour, debout à découvert, il devrait voir de loin');
    if (P.herbesAccroupi > 70) ko('accroupi dans les herbes hautes, il voit de trop loin');
    if (P.nuit > 45) ko('la nuit, sans lanterne, il voit de trop loin');
    if (P.nuitLanterne < 120) ko('la lanterne devrait se voir de loin');
    if (P.brume > 110) ko('dans la brume, il voit plus loin que nous');
    // ---------------------------------------------------------------- l'attaque : un joueur debout, en plein champ, de jour
    const AT = JSON.parse(avecGraine(7, () => J.ev(`(() => {
      const Z = __Z, V = dragonV3, dt = 0.05, p = game.player, S = Z.size;
      farm.w.time = 11 / 24; farm.s.hours = 2 * 24 + 11;
      // un champ dégagé des Tertres
      const x = V1_REGIONS.tertres.x * S + 40, z = V1_REGIONS.tertres.z * S - 30;
      p.pos = [x, Z.heightAt(x, z), z]; p.vel = [0, 0, 0]; p.underground = false; furtif.J = null;
      V.D = null; V.placer('test'); V.grace = 0;
      Object.assign(V.D, { mode: 'vol', phase: 'ronde', x: x - 230, z: z - 30, y: Z.heightAt(x, z) + 80, yaw: Math.atan2(230, 30), v: V3.vitesse, cible: { id: 'x', x: x + 400, z: z + 50, r: 100 } });
      __degats = 0;
      let tAlerte = null, tFeu = null, dPasse1 = null, passes = 0, t = 0, avant = '';
      for (let i = 0; i < 1600; i++) {
        game.time += dt; t += dt; furtif.J = null;
        V.update(dt);
        const D = V.D, F = D.furtif;
        if (tAlerte === null && F.etat === 'alertee') tAlerte = t;
        if (tFeu === null && V.souffle) tFeu = t;
        if (avant === 'feu' && D.phase !== 'feu') { passes++; if (dPasse1 === null) dPasse1 = __degats; }
        avant = D.phase;
      }
      return JSON.stringify({ tAlerte, tFeu, dPasse1, total: __degats, passes, brule: V.flammes.size + Object.keys(V.S().brule).length });
    })()`)));
    log(`attaque (debout, en plein champ, midi) : alerté après ${AT.tAlerte === null ? 'jamais' : AT.tAlerte.toFixed(1) + ' s'}, premier jet après ${AT.tFeu === null ? 'jamais' : AT.tFeu.toFixed(1) + ' s'} ; ${AT.passes} passes ; dégâts de la première passe ${AT.dPasse1 === null ? '—' : Math.round(AT.dPasse1)}, en tout ${Math.round(AT.total)} ; herbe qui brûle ${AT.brule}`);
    if (AT.tAlerte === null || AT.tAlerte > 25) ko('debout en plein champ, de jour, il ne le voit pas');
    if (AT.tAlerte !== null && AT.tAlerte < 1.5) ko('il alerte trop vite (pas le temps de se cacher)');
    if (AT.tFeu === null) ko('il ne crache pas');
    if (AT.dPasse1 !== null && AT.dPasse1 >= 100) ko('une seule passe tue d’un coup');
    if (AT.total < 40) ko('le feu ne fait presque rien');
    // ---------------------------------------------------------------- ce qu'il garde
    const T = JSON.parse(avecGraine(3, () => J.ev(`(() => { const val = (k, n) => k === 'argent' ? n : (ITEMS[k] ? ITEMS[k].price * n : 0); let tot = 0; const N = 600;
      for (let r = 0; r < N; r++) for (let f = 0; f < 6; f++) for (const [k, n] of rollLoot('v3_tas')) tot += val(k, n);
      return JSON.stringify({ tas: Math.round(tot / N), ecaille: ITEMS.v3_ecaille.price, dent: ITEMS.v3_dent.price, coeur: ITEMS.v3_coeur.price }); })()`)));
    const ecailles = 3 * T.ecaille;
    log(`ce qu'il garde : le tas (six fouilles) ≈ ${T.tas} pièces ; les écailles des perchoirs ${ecailles} ; mort : le cœur ${T.coeur}, quatre écailles ${4 * T.ecaille}, trois dents ${3 * T.dent}`);
    if (T.tas > 1800) ko('le tas rapporte trop');
    if (T.tas < 250) ko('le tas ne vaut pas le risque');
    // ---------------------------------------------------------------- le tuer
    const balles = Math.ceil(J.ev('V3.pv') / 150), fleches = Math.ceil(J.ev('V3.pv') / 63);
    log(`le tuer : ${balles} balles de fusil dans la plaie, ou ${fleches} flèches de fer tirées à fond ; il guérit en ${J.ev('V3.guerison')} jours`);
    if (balles < 8) ko('trop facile à tuer');
    // ---------------------------------------------------------------- les textes
    const tx = JSON.parse(J.ev(`JSON.stringify(Object.entries(V3_TEXTES).filter(([k, v]) => !(typeof v === 'string' ? v.trim() : Array.isArray(v) && v.length)).map(([k]) => k))`));
    if (tx.length) ko('textes vides : ' + tx.join(', '));
    return { echecs };
  },
};
