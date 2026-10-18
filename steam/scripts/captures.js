// Captures du vrai jeu pour la page Steam (Playwright, rendu logiciel) :
//   node scripts/captures.js [app/Prairie.html] [filtre]
// → store/screenshots/<id>.jpg (1920 × 1080) et store/captures/hero_raw.jpg (3840 × 1240, sans texte).
// Playwright : require('playwright') ou PLAYWRIGHT=<chemin du module>. Long (le rendu est
// logiciel : une à quelques minutes par image). Repris de la vitrine (vitrine/), même méthode.
'use strict';
const fs = require('fs');
const path = require('path');
const pw = require(process.env.PLAYWRIGHT || 'playwright');

const ROOT = path.join(__dirname, '..');
const FILE = path.resolve(process.argv[2] || path.join(ROOT, 'app', 'Prairie.html'));
const FILTRE = process.argv[3] ? new RegExp(process.argv[3]) : null;
const SHOTS = path.join(ROOT, 'store', 'screenshots');
const CAPS = path.join(ROOT, 'store', 'captures');

// [id, préparation, options] — V.h(heure) · V.cam(x,y,z, tx,ty,tz) · V.orbite(tx,tz, d, azimut, hauteur, visée) · V.sol(x,z)
// options : vue (distance), clair (brouillard), pose (pas de simulation), ecran (avec l'interface), taille, langue, dossier
const VUES = [
  ['01_ferme_matin', `game.mode = 'play'; V.h(9.3); V.cam(1499, V.sol(1499, 2174) + 1.62, 2174, 1512, V.sol(1512, 2156) + 2.5, 2156); game.player.fly = false;`, { pose: 20, ecran: true, langue: 'en' }],
  ['02_valbrume_soir', `V.h(17.5); V.orbite(1572, 1600, 110, 5.3, 26, 8);`, { vue: 500, clair: 500 }],
  ['03_foret_brume', `window.__meteo = 'fog'; V.h(8.2); V.cam(978, V.sol(978, 1478) + 1.7, 1478, 990, V.sol(990, 1445) + 4, 1445);`],
  ['04_ferme_nuit', `V.h(23); V.orbite(1512, 2156, 30, 4.4, 4, 2);`],
  ['05_marche', `V.jour('marche', 10.6); try { npcs.snap(game.world, true); } catch (e) {} V.orbite(1579, 1604, 26, 5.5, 12, 0.5);`, { pose: 120 }],
  ['06_lac_couchant', `V.h(17.85); V.cam(1140, Math.max(V.sol(1140, 1915), game.world.waterLevel ?? 0) + 14, 1915, 884, 22, 1836);`, { vue: 600, clair: 800 }],
  ['07_lande_chateau', `V.h(17.6); V.orbite(2232, 1302, 120, 3.5, 25, 10);`, { clair: 500 }],
  ['08_pierre_nuit', `V.h(22.2); V.orbite(274, 1727, 11, 2.1, 1.6, 1.5);`],
  ['09_sacoche', `game.mode = 'play'; V.h(16.5); V.cam(1505, V.sol(1505, 2168) + 1.62, 2168, 1512, V.sol(1512, 2156) + 2.5, 2156); game.player.fly = false; __step(10); for (const [k, n] of [['chicoree', 4], ['gentiane_jaune', 2], ['lis_martagon', 1], ['pain', 3], ['lanterne', 1], ['oronge', 3]]) { try { if (ITEMS[k]) farm.give(k, n); } catch (e) {} } ui.openSatchel('sac');`, { pose: 4, ecran: true, langue: 'en', apres: `ui.close(true);` }],
  ['hero_raw', `V.h(17.4); V.cam(1540, V.sol(1540, 2420) + 120, 2420, 1572, 60, 1620);`, { vue: 1000, clair: 1800, taille: [3840, 1240], dossier: CAPS }],
];

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.mkdirSync(CAPS, { recursive: true });
  const b = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  const errs = [];
  let unique = null;
  // une seule page (le jeu ne se charge qu'une fois) ; on change la taille de la fenêtre selon la vue
  async function page(W, H) {
    if (unique) { await unique.setViewportSize({ width: W, height: H }); await unique.evaluate(() => { window.dispatchEvent(new Event('resize')); __step(2); }); return unique; }
    const p = await b.newPage({ viewport: { width: W, height: H } });
    p.on('pageerror', (e) => errs.push('PAGEERROR ' + (e.message || e)));
    await p.goto('file://' + FILE, { timeout: 900000 });
    await p.waitForFunction(() => { try { return game.world && !document.querySelector('#loading').classList.contains('open'); } catch (e) { return false; } }, null, { timeout: 900000 });
    await p.evaluate(async () => {
      await game.newFarm(12345, false);
      window.__step = (n, dt = 50) => { const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; try { for (let i = 0; i < n; i++) game.loop(game.last + dt); } finally { window.requestAnimationFrame = raf; } };
      const RENDER = game.renderer.render.bind(game.renderer);
      window.__render = (on) => { game.renderer.render = on ? RENDER : () => {}; };
      __render(false); __step(20);
      // le fondu du premier jour (« Jour 1. La vieille ferme. ») : le laisser passer
      await new Promise((r) => setTimeout(r, 6000));
      for (const id of ['fade', 'menu']) { const el = document.getElementById(id); if (el) el.classList.remove('open'); }
      const _u = weather.update.bind(weather);
      weather.update = function (dt, w) { const r = _u(dt, w); if (window.__meteo) { weather.state = window.__meteo; Object.assign(weather.cur, WEATHER_PRESETS[window.__meteo]); } return r; };
      window.__meteo = 'clear';
      HOOKS.sky.push((sky) => { if (window.__clair) { sky.fog = [window.__clair * 0.4, window.__clair]; sky.mist = 0; } });
      settings.subs = false; settings.showFps = false;
      // la plus belle qualité (le rendu logiciel prendrait sinon la Basse d'office), et pas de garde-fou
      try { bureau.appliquer('tres'); game.renderer.gardeE.off = true; } catch (e) { /* rien */ }
      play.hurt = function () {}; game.die = function () {};
      window.V = {
        h(h) { const w = game.world; w.time = h / 24; game.lastT = w.time; },
        jour(cle, h) { const s = farm.s; let d = s.day; for (let k = 0; k < 12 && cal.jour(d).cle !== cle; k++) d++; s.day = d; V.h(h); },
        sol(x, z) { return game.world.heightAt(x, z); },
        cam(x, y, z, tx, ty, tz) { const p = game.player; p.fly = true; p.pos = [x, y - 1.62, z]; p.vel = [0, 0, 0]; const dx = tx - x, dy = ty - y, dz = tz - z; p.yaw = Math.atan2(-dx, -dz); p.pitch = Math.atan2(dy, Math.hypot(dx, dz)); },
        orbite(tx, tz, d, az, haut, vise) { const x = tx + Math.sin(az) * d, z = tz + Math.cos(az) * d, w = game.world; const gy = Math.max(w.heightAt(x, z), (w.waterLevel ?? 0) + 0.5); V.cam(x, gy + haut, z, tx, w.heightAt(tx, tz) + (vise ?? 2), tz); },
      };
    });
    unique = p;
    return p;
  }
  for (const [id, prep, o = {}] of VUES) {
    if (FILTRE && !FILTRE.test(id)) continue;
    const t0 = Date.now();
    const [W, H] = o.taille || [1920, 1080];
    try {
      const p = await page(W, H);
      await p.evaluate(async ({ prep, o }) => {
        __render(false); window.__meteo = 'clear'; ui.close && ui.close(true);
        const pl = game.player; pl.hp = 100; pl.food = Math.max(pl.food, 80); pl.stamina = 1; pl.breath = 1; play.hurtFlash = 0;
        try { i18n.set(o.langue || 'fr'); } catch (e) { /* rien */ }
        settings.viewDist = o.vue || 420; window.__clair = o.clair || 0;
        await (new Function('return (async () => {' + prep + '})()'))();
        __step(o.pose ?? 40);
      }, { prep, o });
      let data;
      if (o.ecran) {
        await p.evaluate(() => { game.player.hp = 100; play.hurtFlash = 0; __render(true); __step(3); play.hurtFlash = 0; });
        await p.waitForTimeout(300);
        data = await p.screenshot({ type: 'jpeg', quality: 90 });
      } else {
        const url = await p.evaluate(() => { game.player.hp = 100; play.hurtFlash = 0; __render(true); __step(3); return document.querySelector('#gl').toDataURL('image/jpeg', 0.92); });
        data = Buffer.from(url.split(',')[1], 'base64');
      }
      fs.writeFileSync(path.join(o.dossier || SHOTS, id + '.jpg'), data);
      console.log(`OK   ${id} ${W}×${H} (${((Date.now() - t0) / 1000).toFixed(0)} s, ${Math.round(data.length / 1024)} Ko)`);
      if (o.apres) await p.evaluate(async (a) => { __render(false); await (new Function('return (async () => {' + a + '})()'))(); __step(5); }, o.apres);
      await p.evaluate(() => { __render(false); game.player.fly = false; try { i18n.set('fr'); } catch (e) { /* rien */ } });
    } catch (e) { console.log(`ÉCHEC ${id} : ${String(e.message || e).slice(0, 200)}`); }
  }
  const U = [...new Set(errs)];
  console.log('ERRORS', U.length); for (const e of U.slice(0, 10)) console.log(e.slice(0, 300));
  await b.close();
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
