// Équilibrage — LA FERME ET LE TEMPS : arroseurs, terre humide, cultures qui sèchent, cases qui reverdissent, fatigue
// du sol et engrais, pluie, crues, petites bêtes sous la pluie.
//   node tools/equilibrage.js ferme
// Le VRAI code du jeu tourne ici (farm.tick, farm.water, farm.fertilize, farm.recolte, play.harvestCrop, farm.newDay,
// weather.dayPlan, vallee.floodTick, fermeTemps.update), sur une partie neuve posée dans un pré plat et vide.
// Les règles (11-farm-state.js, TERRE) : une case arrosée, ou mouillée par la pluie, reste humide deux jours de jeu ;
// sèche, sa culture tient encore deux jours ; une case labourée vide reverdit au même rythme ; au-delà de cinq récoltes
// sans engrais la culture pousse deux fois moins vite, au-delà de dix quatre fois ; l'engrais remet le compte à zéro.
// Les arroseurs portent à trois cases (celui de fer à quatre), deux de plus qu'avant. Il pleut deux fois moins.
'use strict';

const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
const pc = (a, b) => f1(100 * a / b) + ' %';

// ------------------------------------------------------------------ la partie « vivante », sans navigateur
function vivant(J) {
  J.ev(`globalThis.__F = { farm, play, game, weather, vallee, evenements, strange, ui, sound, particles, TERRE, PLACEABLES, CROPS, WEATHER_PRESETS,
    fermeTemps: typeof fermeTemps !== 'undefined' ? fermeTemps : null, JOUR_SECONDES }`);
  const G = J.ctx.__F;
  const noop = () => {};
  for (const k of ['subtitle', 'close', 'open', 'read']) G.ui[k] = noop;
  const proto = Object.getPrototypeOf(G.sound);
  for (const k of Object.getOwnPropertyNames(proto)) if (k !== 'constructor' && typeof G.sound[k] === 'function') G.sound[k] = noop;
  // un pré plat et sec, loin de l'eau
  const w = {
    props: [], objects: [], inter: [], time: 0.5, dayLength: G.JOUR_SECONDES, waterLevel: -10, baseWater: -10, designed: false,
    heightAt: () => 0, inside: () => true, matAt: () => 0, normalAt: () => [0, 1, 0], covered: () => false, query() {}, live: (q) => !q.gone,
  };
  G.w = w;
  G.game.world = w;
  G.game.player = { pos: [0, 0, 0], underground: false };
  G.neuf = (seed = 1) => {
    const s = G.farm.s = G.farm.blank(seed);
    G.farm.migrate(s);
    G.farm.w = w; w.props.length = 0;
    G.farm.raining = false; G.farm.sprT = 0; G.farm.dirtyProps = false;
    s.hours = 100; s.day = 5;
    return s;
  };
  // le temps passe : h heures de jeu, par pas (comme la boucle du jeu : farm.s.hours avance, puis farm.tick)
  G.avancer = (h, ctx = {}, pas = 0.25, chaque) => {
    const c = Object.assign({ rain: 0, heat: false, storm: false }, ctx);
    for (let t = 0; t < h - 1e-9; t += pas) { G.farm.s.hours += pas; G.farm.tick(pas, c); if (chaque && chaque(t + pas)) return t + pas; }
    return null;
  };
  G.case = (x, z) => G.farm.crop(x, z);
  return G;
}

module.exports = {
  titre: 'Ferme et temps : arroseurs, terre humide, fatigue du sol, engrais, pluie, crues, petites bêtes',
  async verifier(J, log) {
    let echecs = 0;
    const verif = (ok, texte) => { if (!ok) echecs++; log(`  ${ok ? 'ok   ' : 'ÉCHEC'} ${texte}`); };
    const G = vivant(J), T = G.TERRE, F = G.farm;
    const sec = { rain: 0 };

    // ============================================================ 1. les arroseurs
    log('\n1. Les arroseurs (PLACEABLES…sprinkler, 05-zfarm-content.js ; le passage : farm.tick, toutes les demi-heures)');
    for (const [id, avant] of [['arroseur', 1], ['arroseur_fer', 2]]) {
      const s = G.neuf(), R = G.PLACEABLES[id].sprinkler;
      for (let dz = -8; dz <= 8; dz++) for (let dx = -8; dx <= 8; dx++) F.till(200.5 + dx, 200.5 + dz);
      G.w.props.push({ id, x: 200.3, y: 0, z: 200.8, r: 0 });
      G.avancer(0.75, sec);
      let n = 0, carre = true;
      for (const k in s.crops) {
        const i = k.indexOf(','), x = +k.slice(0, i), z = +k.slice(i + 1), dedans = Math.abs(x - 200) <= R && Math.abs(z - 200) <= R;
        const hum = s.crops[k].wet > s.hours;
        if (hum) n++;
        if (hum !== dedans) carre = false;
      }
      // une semaine plus tard, la terre à portée est toujours humide ; l'arroseur enlevé, elle le reste deux jours
      G.avancer(24 * 7, sec, 0.5);
      const c = G.case(200.5 + R, 200.5 - R), encore = c && c.wet > s.hours;
      G.w.props.length = 0;
      const tSec = G.avancer(60, sec, 0.25, () => !(c.wet > s.hours));
      log(`  ${id} : ${R} cases autour (${avant} avant) : un carré de ${2 * R + 1} × ${2 * R + 1} = ${n} cases humides ; une semaine après, ${encore ? 'toujours humides' : 'SÈCHES'} ; l'arroseur ôté, la terre sèche en ${tSec === null ? 'plus de 60' : f1(tSec)} h`);
      verif(R === avant + 2 && n === (2 * R + 1) * (2 * R + 1) && carre, `${id} : deux cases de plus de portée, tout le carré et rien d'autre (${n} cases)`);
      verif(encore && tSec !== null && Math.abs(tSec - T.humide) <= 7, `${id} : sa terre reste humide tant qu'il est là, puis deux jours environ (${tSec === null ? '—' : f1(tSec)} h)`);
    }
    {
      // le coût du passage : trente arroseurs de fer, 1 500 objets posés, 3 000 cases labourées
      const s = G.neuf();
      for (let k = 0; k < 1500; k++) G.w.props.push({ id: 'banc', x: 100 + (k % 50) * 3, y: 0, z: 100 + Math.floor(k / 50) * 3 });
      for (let k = 0; k < 30; k++) G.w.props.push({ id: 'arroseur_fer', x: 300.5 + (k % 6) * 9, y: 0, z: 300.5 + Math.floor(k / 6) * 9 });
      for (let k = 0; k < 3000; k++) F.till(296 + (k % 60), 296 + Math.floor(k / 60));
      const n = 400, t0 = process.hrtime.bigint();
      for (let k = 0; k < n; k++) { s.hours += 0.5; F.tick(0.5, sec); }
      const ms = Number(process.hrtime.bigint() - t0) / 1e6 / n;
      log(`  coût : ${f1(ms)} ms par passage (trente arroseurs de fer, 1 500 objets posés, 3 000 cases) ; un passage toutes les demi-heures de jeu (${G.JOUR_SECONDES / 48} s réelles)`);
      verif(ms < 4, `le passage des arroseurs reste léger (${f1(ms)} ms, moins de 4 ms pour trente arroseurs et 3 000 cases)`);
    }

    // ============================================================ 2. la terre humide, les cultures qui sèchent
    log('\n2. La terre humide (farm.water, farm.tick) : deux jours de terre humide, puis deux jours avant que la culture meure');
    const essaiSec = (ctx, arroser = true) => {
      const s = G.neuf(), x = 100.5, z = 100.5;
      F.till(x, z); F.plant(x, z, 'citrouille');
      s.sol['100,100'] = { n: 10 }; // une terre épuisée : la citrouille ne mûrit pas pendant l'essai (une culture mûre ne meurt pas de soif)
      if (arroser) F.water(x, z);
      const c = G.case(x, z);
      let tSec = arroser ? null : 0, tMort = null;
      G.avancer(150, ctx, 0.25, (t) => { if (tSec === null && !(c.wet > s.hours)) tSec = t; if (c.dead) { tMort = t; return true; } return false; });
      return { tSec, tMort, c };
    };
    const A = essaiSec(sec), C = essaiSec({ heat: true }), S = essaiSec(sec, false);
    log(`  arrosée : humide ${f1(A.tSec)} h, la culture meurt ${f1(A.tMort)} h après l'arrosage (avant : 10 h, puis 30 h) ; jamais arrosée : morte au bout de ${f1(S.tMort)} h`);
    log(`  canicule sans relâche (× ${f1(T.chaleur)}) : humide ${f1(C.tSec)} h, morte au bout de ${f1(C.tMort)} h (une journée de canicule n'en retire que quelques heures)`);
    verif(Math.abs(A.tSec - 48) <= 0.5 && Math.abs(A.tMort - 96) <= 0.5, `terre humide deux jours, puis la culture tient encore deux jours (${f1(A.tSec)} h, ${f1(A.tMort)} h)`);
    verif(Math.abs(S.tMort - 48) <= 0.5, `une culture jamais arrosée tient deux jours (${f1(S.tMort)} h)`);
    verif(C.tSec >= 30 && C.tMort >= 60 && C.tMort < A.tMort, `la canicule presse la terre, sans casser la règle (${f1(C.tSec)} h et ${f1(C.tMort)} h, au moins 30 et 60)`);
    {
      // on revient à l'arrosoir une fois la demi-journée passée (sans gâcher d'eau avant)
      const s = G.neuf(), x = 50.5, z = 50.5;
      F.till(x, z);
      const a = F.water(x, z); G.avancer(6); const b = F.water(x, z); G.avancer(7); const c = F.water(x, z), wet = G.case(x, z).wet - s.hours;
      log(`  l'arrosoir : ${a ? 'versé' : 'refusé'}, six heures après ${b ? 'versé' : 'refusé (la terre est trempée)'}, treize heures après ${c ? 'versé' : 'refusé'} (humide encore ${f1(wet)} h)`);
      verif(a && !b && c && Math.abs(wet - T.humide) < 0.01, 'on arrose une case dont la terre a passé la demi-journée ; elle repart pour deux jours');
    }
    {
      // la pluie mouille toute la terre pour deux jours
      const s = G.neuf();
      F.till(60.5, 60.5); F.plant(60.5, 60.5, 'chou');
      const c = G.case(60.5, 60.5);
      G.avancer(1, { rain: 0.75 });
      const hum = c.wet > s.hours;
      const tSec = G.avancer(60, sec, 0.25, () => !(c.wet > s.hours));
      log(`  une heure de pluie : la terre est ${hum ? 'humide' : 'SÈCHE'}, et le reste ${f1(tSec)} h après la dernière goutte`);
      verif(hum && Math.abs(tSec - T.humide) <= 0.5, `la pluie mouille la terre pour deux jours (${f1(tSec)} h)`);
    }

    // ============================================================ 3. la terre labourée vide reverdit
    log('\n3. Une case labourée vide redevient de l\'herbe au même rythme (farm.tick)');
    {
      const reverdit = (arroser) => {
        const s = G.neuf();
        F.till(80.5, 80.5);
        let t = null;
        G.avancer(200, sec, 0.25, (h) => { if (arroser !== null && Math.abs(h - arroser) < 0.01) F.water(80.5, 80.5); if (!G.case(80.5, 80.5)) { t = h; return true; } return false; });
        return t;
      };
      const t0 = reverdit(null), t30 = reverdit(30);
      // sous un arroseur, la terre labourée ne reverdit jamais
      const s = G.neuf();
      F.till(90.5, 90.5); G.w.props.push({ id: 'arroseur', x: 91.5, y: 0, z: 90.5 });
      G.avancer(24 * 10, sec, 0.5);
      const garde = !!G.case(90.5, 90.5);
      log(`  jamais arrosée : l'herbe revient ${f1(t0)} h après le labour (deux jours de terre fraîche, deux jours secs) ; arrosée à la 30e heure : ${f1(t30)} h ; sous un arroseur : ${garde ? 'toujours labourée' : 'REVERDIE'} au bout de dix jours`);
      verif(t0 >= 96 && t0 <= 99.5 && t30 >= 126 && t30 <= 129.5, `deux jours humide (ou fraîchement retournée), puis deux jours secs (${f1(t0)} h ; ${f1(t30)} h)`);
      verif(garde, 'la terre gardée humide ne reverdit pas');
      void s;
    }

    // ============================================================ 4. la fatigue du sol, l'engrais
    log('\n4. La fatigue du sol (farm.s.sol : récoltes depuis le dernier engrais) et l\'engrais (farm.fertilize)');
    {
      const vitesse = (n) => {
        const s = G.neuf(), x = 120.5, z = 120.5;
        F.till(x, z); F.plant(x, z, 'citrouille');
        if (n) s.sol['120,120'] = { n };
        F.water(x, z);
        G.avancer(8);
        return G.case(x, z).g / 8;
      };
      const L = [0, 4, 5, 9, 10, 20].map((n) => [n, vitesse(n)]);
      log('  vitesse de pousse selon les récoltes depuis le dernier engrais : ' + L.map(([n, v]) => `${n} → ${Math.round(v * 100)} %`).join(', '));
      const V = Object.fromEntries(L);
      verif(V[0] === 1 && V[4] === 1 && V[5] === 0.5 && V[9] === 0.5 && V[10] === 0.25 && V[20] === 0.25, 'une case non fertilisée pousse à 50 % après 5 récoltes, à 25 % après 10');
    }
    {
      // par le vrai geste de récolte (play.harvestCrop) : le compte survit à la récolte et au semis suivant
      const s = G.neuf(), x = 130.5, z = 130.5, k = '130,130';
      F.till(x, z);
      let erreur = null;
      const recolter = () => { const c = G.case(x, z); if (!c.c) F.plant(x, z, 'radis'); c.g = G.CROPS[c.c].h; c.st = 5; try { G.play.harvestCrop(x, z, c, true); } catch (e) { erreur = e; F.recolte(x, z, c); } };
      for (let i = 0; i < 5; i++) recolter();
      const u5 = F.usure(k), plante = G.case(x, z).c;
      F.plant(x, z, 'radis');
      const ok1 = F.fertilize(x, z, 1), u0 = F.usure(k), fert = G.case(x, z).fert, refus2 = F.fertilize(x, z, 1);
      recolter();
      const u1 = F.usure(k), fertApres = G.case(x, z).fert;
      const ok2 = F.fertilize(x, z, 1);
      log(`  cinq récoltes de radis${erreur ? ' (farm.recolte : ' + erreur.message + ')' : ' (play.harvestCrop)'} : compte ${u5}, la case est ${plante ? 'plantée' : 'vide'} ; un sac sur la case lasse, ressemée : ${ok1 ? 'accepté' : 'refusé'} → compte ${u0}, coup de pouce ${fert} ; un deuxième sac tout de suite : ${refus2 ? 'accepté' : 'refusé'}`);
      log(`  une récolte plus tard : compte ${u1}, coup de pouce ${fertApres} (il vaut jusqu'à la récolte) ; un sac : ${ok2 ? 'accepté' : 'refusé'} → compte ${F.usure(k)}`);
      verif(!erreur, 'play.harvestCrop tourne ici (la vraie récolte compte)');
      verif(u5 === 5 && ok1 && u0 === 0 && fert === 1 && !refus2 && u1 === 1 && fertApres === 0 && ok2 && F.usure(k) === 0, 'le compte survit à la récolte ; l\'engrais le remet à zéro et garde son coup de pouce ; une case déjà nourrie qui n\'a rien donné ne reprend pas de sac');
      void s;
    }
    {
      // une plante qui repousse : le compte monte à chaque récolte
      const s = G.neuf(), x = 140.5, z = 140.5;
      F.till(x, z); F.plant(x, z, 'fraise');
      for (let i = 0; i < 6; i++) { const c = G.case(x, z); c.g = G.CROPS.fraise.h; G.play.harvestCrop(x, z, c, true); }
      const c = G.case(x, z), u = F.usure('140,140');
      log(`  un fraisier récolté six fois : compte ${u}, la plante ${c.c === 'fraise' ? 'repousse' : 'a disparu'}`);
      verif(u === 6 && c.c === 'fraise', 'une plante qui repousse fatigue la terre à chaque récolte');
      void s;
    }
    {
      // la jachère : la case retourne à l'herbe, son compte la suit ; deux jours d'herbe effacent une récolte
      const s = G.neuf(), x = 150.5, z = 150.5, k = '150,150';
      F.till(x, z); s.sol[k] = { n: 7 };
      G.avancer(100, sec, 0.5);
      const herbe = !G.case(x, z);
      for (let d = 0; d < 10; d++) { F.newDay({ rain: false, storm: false, heat: false, frost: false }); G.avancer(24, sec, 1); }
      const avant = F.usure(k);
      F.till(x, z);
      const apres = F.usure(k);
      // une case peu lasse, laissée sous l'herbe assez longtemps, est oubliée
      s.sol['151,150'] = { n: 2 };
      for (let d = 0; d < 6; d++) { F.newDay({ rain: false, storm: false, heat: false, frost: false }); G.avancer(24, sec, 1); }
      const oubliee = !s.sol['151,150'];
      log(`  une case lasse (7 récoltes) retournée à l'herbe : ${herbe ? 'reverdie' : 'ENCORE LABOURÉE'}, compte gardé (${avant}) ; relabourée dix jours plus tard : ${apres} ; une case à 2, six jours sous l'herbe : ${oubliee ? 'reposée' : 'toujours comptée'}`);
      verif(herbe && avant === 7 && apres === 2 && oubliee, 'le compte survit au retour à l\'herbe ; deux jours de jachère effacent une récolte');
    }
    {
      // une ancienne partie : pas de farm.s.sol
      const s = G.neuf();
      delete s.sol;
      F.migrate(s);
      const ok = s.sol && typeof s.sol === 'object' && !Object.keys(s.sol).length;
      const js = JSON.parse(JSON.stringify(Object.assign(G.neuf(), { sol: { '1,2': { n: 6, r: 12 } } }))).sol['1,2'];
      verif(ok && js.n === 6 && js.r === 12, 'une ancienne partie part de zéro (farm.s.sol = {}) ; le compte se sauvegarde (JSON)');
    }

    // ============================================================ 5. la pluie, les orages, les crues
    log('\n5. Le temps (weather.dayPlan, 10-weather.js ; neige et soleil écrasant : 11-zzz40-evenements.js ; crues : vallee.floodTick)');
    {
      const SEEDS = 200, JOURS = 288;
      const etat = (P, h) => { let st = P.plan[0][1]; for (const [hr, x] of P.plan) if (h >= hr) st = x; return st; };
      const R = { n: 0, h: 0, pluie: 0, orage: 0, joursPluie: 0, joursOrage: 0, longue: 0, brouillard: 0, gel: 0, canicule: 0, neige: 0, crueH: 0, crueJ: 0, longueCrue: 0, montees: 0 };
      const cur0 = Object.assign({}, G.weather.cur);
      for (let seed = 1; seed <= SEEDS; seed++) {
        const s = G.neuf(seed);
        G.evenements._plans.clear();
        s.vallee = null; G.vallee.st();
        for (let d = 2; d <= JOURS; d++) {
          s.day = d;
          const P = G.weather.dayPlan(seed, d);
          R.n++;
          if (P.rain) R.joursPluie++;
          if (P.storm) R.joursOrage++;
          if (P.kind === 'brouillard') R.brouillard++;
          if (P.frost) R.gel++;
          if (P.heat) R.canicule++;
          if (P.neige) R.neige++;
          let run = 0, runMax = 0, crue = false;
          // la journée de jeu : de 6 h à 6 h (après minuit, le jeu relit le début du même programme)
          for (let k = 0; k < 96; k++) {
            const st = etat(P, (6 + k * 0.25) % 24), pl = st === 'rain' || st === 'storm';
            R.h += 0.25;
            if (pl) { R.pluie += 0.25; run += 0.25; runMax = Math.max(runMax, run); } else run = 0;
            if (st === 'storm') R.orage += 0.25;
            Object.assign(G.weather.cur, G.WEATHER_PRESETS[st] || G.WEATHER_PRESETS.clear);
            const f0 = s.vallee.flood;
            G.vallee.floodTick(0.25);
            if (f0 < 0.3 && s.vallee.flood >= 0.3) R.montees++; // « L'eau monte : la rivière et les lacs débordent… »
            if (s.vallee.flood >= 0.3) { R.crueH += 0.25; crue = true; }
          }
          if (runMax >= 6) { R.longue++; if (crue) R.longueCrue++; }
          if (crue) R.crueJ++;
        }
      }
      Object.assign(G.weather.cur, cur0);
      // mesuré sur le jeu d'avant (programme météo et crues de la cinquième vague), par la même méthode, sur 200 parties
      const AVANT = { pluie: 28.5, joursPluie: 48.1, longue: 44.4, orage: 15.5, crueH: 32.8, crueJ: 63.4, montees: 5.08 };
      log(`  heures de pluie : ${pc(R.pluie, R.h)} (avant : ${f1(AVANT.pluie)} %), dont orage ${pc(R.orage, R.h)} ; jours avec de la pluie ${pc(R.joursPluie, R.n)} (avant ${f1(AVANT.joursPluie)} %) ; jours de pluie longue (six heures d'affilée) ${pc(R.longue, R.n)} (avant ${f1(AVANT.longue)} %)`);
      log(`  jours d'orage ${pc(R.joursOrage, R.n)} (avant ${f1(AVANT.orage)} % : les tornades n'en changent pas, voir « hasard ») ; brouillard ${pc(R.brouillard, R.n)} ; gel au matin ${pc(R.gel, R.n)} ; canicule ${pc(R.canicule, R.n)} ; neige partout ${pc(R.neige, R.n)}`);
      const semaine = R.montees / R.n * 12;
      log(`  crues (l'eau monte de 30 cm) : ${f1(semaine)} fois par semaine (avant ${f1(AVANT.montees)}) ; l'eau haute ${pc(R.crueH, R.h)} des heures (avant ${f1(AVANT.crueH)} %), ${pc(R.crueJ, R.n)} des jours (avant ${f1(AVANT.crueJ)} %) ; ${pc(R.longueCrue, R.longue)} des longues pluies font déborder la rivière`);
      const part = 100 * R.pluie / R.h;
      verif(part >= 12 && part <= 16.5, `il pleut environ deux fois moins : ${f1(part)} % des heures (avant ${f1(AVANT.pluie)} %)`);
      verif(Math.abs(100 * R.joursOrage / R.n - AVANT.orage) <= 2.5, `les orages restent aussi fréquents (${pc(R.joursOrage, R.n)} des jours), plus brefs`);
      verif(Math.abs(100 * R.brouillard / R.n - 6.8) <= 1 && Math.abs(100 * R.gel / R.n - 9.4) <= 1.2 && Math.abs(100 * R.neige / R.n - 3.1) <= 0.8, 'brouillard, gel du matin et neige partout gardent leur fréquence');
      verif(R.longueCrue / R.longue >= 0.9 && semaine >= 1.5 && semaine <= 0.75 * AVANT.montees && 100 * R.crueH / R.h <= AVANT.crueH / 2, `les crues suivent les longues pluies : ${f1(semaine)} par semaine, l'eau haute deux fois moins longtemps (${pc(R.crueH, R.h)} des heures)`);
    }

    // ============================================================ 6. papillons et lucioles sous la pluie
    log('\n6. Papillons et lucioles : ni les uns ni les autres sous la pluie (08-renderer.js, 10-zzcreatures-more.js, 11-zzzz4-ferme-temps.js)');
    {
      const fs = require('fs'), path = require('path');
      const src = (f) => fs.readFileSync(path.join(__dirname, '..', '..', 'src', f), 'utf8');
      const R8 = src('08-renderer.js'), C10 = src('10-zzcreatures-more.js');
      const gpu = /const fliesK = 1 - smoothstep\([^)]*Math\.max\(F\.rain[^)]*F\.snow[^)]*\)\)/.test(R8) && /110 \* fliesK/.test(R8) && /380 \* fliesK/.test(R8);
      const naissent = /papillons[\s\S]{0,120}!rain/.test(C10) && /lucioles[\s\S]{0,120}!rain/.test(C10);
      // ceux qui volaient s'en vont
      const P = G.particles, FT = G.fermeTemps, L0 = P.list, r0 = G.weather.cur.rain;
      const bete = (o) => Object.assign({ x: 0, y: 1, z: 0, vx: 0.2, vy: 0, vz: 0.1, col: [1, 1, 1, 1], size: 0.04, life: 8, max: 10, grav: 0, emissive: false }, o);
      let part = null, sec2 = null;
      try {
        P.list = [bete({ flutter: 1 }), bete({ blink: 1, emissive: true }), bete({ dart: 1 }), bete({})];
        G.weather.cur.rain = 0; FT.fuiteT = 0; FT.update(0.3);
        sec2 = P.list.map((q) => !!(q.flutter || q.blink || q.dart));
        G.weather.cur.rain = 0.8; FT.fuiteT = 0; FT.update(0.3);
        part = P.list.map((q) => ({ vole: !!(q.flutter || q.blink || q.dart), life: q.life, vy: q.vy, grav: q.grav }));
      } finally { P.list = L0; G.weather.cur.rain = r0; }
      const s = part.slice(0, 3).every((q) => !q.vole && q.life <= 2.8 && q.vy > 0 && q.grav < 0) && part[3].life === 8 && sec2.slice(0, 3).every(Boolean);
      log(`  sur la carte graphique : ${gpu ? 'moins nombreux quand la pluie ou la neige tombe, plus un seul sous l\'averse' : 'TOUJOURS LÀ SOUS LA PLUIE'} ; les petites bêtes volantes ne naissent pas sous la pluie : ${naissent ? 'oui' : 'NON'} ; celles qui volaient montent et s'effacent : ${s ? 'oui' : 'NON'}`);
      verif(gpu && naissent && s, 'ni lucioles ni papillons quand il pleut, et ceux qui volaient s\'en vont');
    }
    return { echecs };
  },
};
