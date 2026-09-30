// ============================================================================
//  Outils de mise au point (caché). Console du navigateur : admin('prairie')
//  ouvre le panneau ; ensuite F9 l'ouvre et le ferme ; admin('off') le retire.
//  Objets (un, dix, cent, tout), bêtes, objets à poser, événements, argent,
//  heure, météo, soins, invincibilité, lieux, habitants.
// ============================================================================

const ADMIN_KEY = 'prairie.admin';

const admin = {
  onglet: 'objets', filtre: '', dieu: false, meteo: null,
  actif() { return store.get(ADMIN_KEY, 0) === 1; },
  // devant le joueur, à d mètres
  devant(d) {
    const p = game.player, w = game.world, b = cameraBasis(p.yaw, 0);
    const x = p.pos[0] + b.f[0] * d, z = p.pos[2] + b.f[2] * d;
    return [x, w.heightAt(x, z), z];
  },
  note(t) { const e = $('#adm-note'); if (e) { e.textContent = t; e.classList.remove('adm-flash'); void e.offsetWidth; e.classList.add('adm-flash'); } },

  // ---------------------------------------------------------------- les actions
  donner(id, n) { if (!ITEMS[id]) return; farm.give(id, n); sound.pop && sound.pop(); this.note(`+${n} ${itemName(id)}`); this.majCompte(id); },
  toutDonner(n) { let k = 0; for (const id in ITEMS) { if (ITEMS[id].cat === 'quete') continue; farm.give(id, n); k++; } sound.coin && sound.coin(); this.note(`${k} objets × ${n}`); this.rendre(); },
  viderSacoche() { const s = farm.s; for (const id of Object.keys(s.inv)) delete s.inv[id]; s.hand = null; farm.dirtyProps = true; this.note('Sacoche vidée'); this.rendre(); },
  bete(kind) {
    const [x, , z] = this.devant(5);
    try { entities.add(game.world, kind, x, z, {}); this.note(`${this.nomBete(kind)} : apparu(e)`); } catch (e) { console.error('admin', e); this.note(`${kind} : impossible (${e.message})`); }
  },
  toutesBetes() {
    const ks = Object.keys(CREATURES), p = game.player, w = game.world;
    let ok = 0;
    ks.forEach((k, i) => { const a = i / ks.length * TAU, r = 9 + (i % 3) * 3, x = p.pos[0] + Math.cos(a) * r, z = p.pos[2] + Math.sin(a) * r; try { entities.add(w, k, x, z, {}); ok++; } catch (e) { console.error('admin', k, e); } });
    this.note(`${ok} bêtes autour de vous`);
  },
  poser(id) {
    const [x, y, z] = this.devant(3), p = game.player;
    try { farm.addProp({ id, x, y, z, r: p.yaw + Math.PI }); this.note(`${(PLACEABLES[id] && PLACEABLES[id].name) || id} : posé`); } catch (e) { console.error('admin', e); this.note(`${id} : impossible (${e.message})`); }
  },
  toutPoser() {
    const ids = Object.keys(PLACEABLES), p = game.player, w = game.world, n = Math.ceil(Math.sqrt(ids.length));
    let ok = 0;
    ids.forEach((id, i) => { const gx = (i % n) - n / 2, gz = Math.floor(i / n) + 3, b = cameraBasis(p.yaw, 0), x = p.pos[0] + b.f[0] * gz * 2.2 + b.r[0] * gx * 2.2, z = p.pos[2] + b.f[2] * gz * 2.2 + b.r[2] * gx * 2.2; try { farm.addProp({ id, x, y: w.heightAt(x, z), z, r: p.yaw + Math.PI }); ok++; } catch (e) { console.error('admin', id, e); } });
    this.note(`${ok} objets posés devant vous`);
  },
  evenement(id) { let r = false; try { r = evenements.declencher(id); } catch (e) { console.error('admin', e); } this.note(r ? `${id} : lancé` : `${id} : pas maintenant`); },
  argent(n) { farm.earn(n); sound.coin && sound.coin(); this.note(`+${n} pièces`); },
  soigner() {
    const p = game.player; p.hp = 100; p.food = 100; p.stamina = 1; p.breath = 1;
    try { if (typeof corps !== 'undefined') { const C = farm.s.corps; if (C) { C.jambe = 0; C.saigne = 0; } } } catch (e) { /* rien */ }
    try { if (typeof sommeil !== 'undefined' && farm.s.sommeil) farm.s.sommeil.debout = farm.s.hours; } catch (e) { /* rien */ }
    try { if (typeof lanterne !== 'undefined') lanterne.S().huile = lanterne.MAX; } catch (e) { /* rien */ }
    this.note('Vie, faim, endurance, fatigue, lanterne : au plein');
  },
  heure(h) { const w = game.world; w.time = h / 24; game.lastT = w.time; if (farm.s) farm.s.hours = Math.floor(farm.s.hours / 24) * 24 + h; this.note(`${h} h`); },
  jourSuivant() { try { game.skipHours ? game.skipHours(((30 - game.world.time * 24) % 24) || 24) : null; } catch (e) { console.error('admin', e); } this.note('Le lendemain, six heures'); },
  temps(st) { this.meteo = st; this.note(st ? `Météo : ${st}` : 'Météo : celle du jour'); },
  invincible() { this.dieu = !this.dieu; this.note(this.dieu ? 'Invincible' : 'Mortel, de nouveau'); this.rendre(); },
  aller(k) {
    const w = game.world, L = w.lm[k] || w.bld[k];
    if (!L) return;
    ui.close(true);
    game.teleport([L.x, w.heightAt(L.x, L.z), L.z + 2], L.name || k);
  },
  appeler(id) {
    const n = npcs.byId[id], p = game.player;
    if (!n || !n.st.alive) return;
    const [x, y, z] = this.devant(2.5);
    n.x = x; n.z = z; n.y = y; n.path = null; n.state = 'idle'; n.sleep = false;
    this.note(`${n.name} est là`);
  },
  nomBete(k) { const noms = typeof BETES_NOMS !== 'undefined' ? BETES_NOMS : null; return (noms && noms[k]) || k; },

  // ---------------------------------------------------------------- le panneau
  ouvrir() {
    if (!game.world || game.kind !== 'farm') return;
    if (!$('#admin')) { const d = document.createElement('div'); d.id = 'admin'; d.className = 'pp-panel'; $('#paper').appendChild(d); }
    this.css();
    ui.open('#admin', '');
    this.rendre();
  },
  majCompte(id) { const e = document.querySelector(`#admin [data-it="${id}"] i`); if (e) e.textContent = farm.count(id) || ''; },
  rendre() {
    const el = $('#admin');
    if (!el || ui.panel !== '#admin') return;
    const O = [['objets', 'Objets'], ['betes', 'Bêtes'], ['poser', 'À poser'], ['evenements', 'Événements'], ['monde', 'Le monde'], ['lieux', 'Lieux et gens']];
    const f = this.filtre.toLowerCase();
    const garde = (t) => !f || String(t).toLowerCase().includes(f);
    let corps = '';
    if (this.onglet === 'objets') {
      const ids = Object.keys(ITEMS).filter((id) => garde(id) || garde(itemName(id))).sort((a, b) => itemName(a).localeCompare(itemName(b)));
      corps = `<div class="adm-row"><button data-tout="1">Tout donner (× 1)</button><button data-tout="10">Tout donner (× 10)</button><button data-vider>Vider la sacoche</button><small>clic : 1 · Maj : 10 · Ctrl : 100</small></div>
        <div class="adm-grid">${ids.map((id) => `<button class="it" data-it="${esc(id)}" title="${esc(id)}"><img src="${iconURL(id)}" alt=""><span>${esc(itemName(id))}</span><i>${farm.count(id) || ''}</i></button>`).join('')}</div>`;
    } else if (this.onglet === 'betes') {
      const ks = Object.keys(CREATURES).filter((k) => garde(k) || garde(this.nomBete(k)));
      corps = `<div class="adm-row"><button data-toutesbetes>Une de chaque, autour de vous</button></div><div class="adm-liste">${ks.map((k) => `<button data-bete="${esc(k)}">${esc(this.nomBete(k))}</button>`).join('')}</div>`;
    } else if (this.onglet === 'poser') {
      const ks = Object.keys(PLACEABLES).filter((k) => garde(k) || garde(PLACEABLES[k].name));
      corps = `<div class="adm-row"><button data-toutposer>Tout poser devant vous</button></div><div class="adm-grid">${ks.map((k) => `<button class="it" data-poser="${esc(k)}"><img src="${ITEMS[k] ? iconURL(k) : ''}" alt=""><span>${esc(PLACEABLES[k].name || k)}</span></button>`).join('')}</div>`;
    } else if (this.onglet === 'evenements') {
      const base = [['nuit_noire', 'Nuit noire'], ['neige', 'Neige partout'], ['soleil', 'Soleil écrasant'], ['tornade', 'Tornade'], ['tueur', 'L’homme au long manteau'], ['esprit', 'La lavandière']];
      const pro = typeof PRODIGES !== 'undefined' ? Object.keys(PRODIGES).map((k) => [k, (PRODIGES[k] && PRODIGES[k].nom) || k]) : [];
      corps = `<div class="adm-liste">${base.concat(pro).filter(([k, n]) => garde(k) || garde(n)).map(([k, n]) => `<button data-ev="${esc(k)}">${esc(n)}</button>`).join('')}</div>`;
    } else if (this.onglet === 'monde') {
      corps = `<div class="adm-row"><b>Argent</b><button data-argent="100">+100</button><button data-argent="1000">+1 000</button><button data-argent="10000">+10 000</button></div>
        <div class="adm-row"><b>Corps</b><button data-soigner>Tout remettre au plein</button><button data-dieu>${this.dieu ? 'Redevenir mortel' : 'Invincible'}</button></div>
        <div class="adm-row"><b>Heure</b>${[6, 9, 12, 15, 18, 21, 0, 3].map((h) => `<button data-heure="${h}">${h} h</button>`).join('')}<button data-lendemain>Le lendemain</button></div>
        <div class="adm-row"><b>Météo</b>${[['clear', 'Beau'], ['cloudy', 'Couvert'], ['rain', 'Pluie'], ['storm', 'Orage'], ['fog', 'Brouillard'], ['frost', 'Gel']].map(([k, n]) => `<button data-meteo="${k}">${n}</button>`).join('')}<button data-meteo="">Celle du jour</button></div>`;
    } else {
      const w = game.world, L = Object.keys(w.lm || {}).filter((k) => w.lm[k] && !w.lm[k].secret || f).map((k) => [k, w.lm[k].name || k]).concat(Object.keys(w.bld || {}).map((k) => [k, (w.bld[k] && w.bld[k].name) || k]));
      const vus = new Set(), lieux = L.filter(([k]) => (vus.has(k) ? false : vus.add(k))).filter(([k, n]) => garde(k) || garde(n)).sort((a, b) => String(a[1]).localeCompare(String(b[1])));
      const gens = npcs.list.filter((n) => n.st.alive && (garde(n.name) || garde(n.id)));
      corps = `<h4>Aller à</h4><div class="adm-liste">${lieux.map(([k, n]) => `<button data-aller="${esc(k)}">${esc(n)}</button>`).join('')}</div>
        <h4>Faire venir</h4><div class="adm-liste">${gens.map((n) => `<button data-appeler="${esc(n.id)}">${esc(n.name)}</button>`).join('')}</div>`;
    }
    el.innerHTML = `<div class="tabs"><b>Mise au point</b>${O.map(([k, t]) => `<button class="${k === this.onglet ? 'on' : ''}" data-onglet="${k}">${t}</button>`).join('')}<button class="x" data-fermer title="Fermer">✕</button></div>
      <div class="body"><div class="adm-row"><input id="adm-filtre" type="search" placeholder="Chercher…" value="${esc(this.filtre)}"><span id="adm-note"></span></div>${corps}</div>`;
    this.brancher(el);
  },
  brancher(el) {
    const on = (sel, fn) => el.querySelectorAll(sel).forEach((b) => (b.onclick = (e) => fn(b, e)));
    on('[data-onglet]', (b) => { this.onglet = b.dataset.onglet; this.filtre = ''; this.rendre(); });
    on('[data-fermer]', () => ui.close());
    on('[data-it]', (b, e) => this.donner(b.dataset.it, e.ctrlKey ? 100 : e.shiftKey ? 10 : 1));
    on('[data-tout]', (b) => this.toutDonner(+b.dataset.tout));
    on('[data-vider]', () => this.viderSacoche());
    on('[data-bete]', (b) => this.bete(b.dataset.bete));
    on('[data-toutesbetes]', () => this.toutesBetes());
    on('[data-poser]', (b) => this.poser(b.dataset.poser));
    on('[data-toutposer]', () => this.toutPoser());
    on('[data-ev]', (b) => this.evenement(b.dataset.ev));
    on('[data-argent]', (b) => this.argent(+b.dataset.argent));
    on('[data-soigner]', () => this.soigner());
    on('[data-dieu]', () => this.invincible());
    on('[data-heure]', (b) => this.heure(+b.dataset.heure));
    on('[data-lendemain]', () => this.jourSuivant());
    on('[data-meteo]', (b) => this.temps(b.dataset.meteo || null));
    on('[data-aller]', (b) => this.aller(b.dataset.aller));
    on('[data-appeler]', (b) => this.appeler(b.dataset.appeler));
    const inp = el.querySelector('#adm-filtre');
    if (inp) {
      inp.oninput = () => { this.filtre = inp.value; clearTimeout(this.tf); this.tf = setTimeout(() => { this.rendre(); const i2 = $('#adm-filtre'); if (i2) { i2.focus(); i2.setSelectionRange(i2.value.length, i2.value.length); } }, 180); };
      inp.onkeydown = (e) => { if (e.key === 'Escape') { inp.blur(); ui.close(); } e.stopPropagation(); };
    }
  },
  css() {
    if ($('#admin-css')) return;
    const st = document.createElement('style');
    st.id = 'admin-css';
    st.textContent = `#admin{width:min(900px,94vw);max-height:86vh;overflow:auto}
#admin .adm-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0 8px}
#admin .adm-row b{min-width:70px}
#admin .adm-row small{opacity:.7}
#admin input[type=search]{flex:1;min-width:180px;padding:4px 8px;font:inherit;background:#f6efdc;border:1px solid #8a6a44}
#admin .adm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:4px}
#admin .adm-grid .it{display:flex;align-items:center;gap:6px;text-align:left;padding:3px 6px}
#admin .adm-grid .it img{width:24px;height:24px;image-rendering:pixelated}
#admin .adm-grid .it span{flex:1;font-size:13px}
#admin .adm-grid .it i{font-style:normal;opacity:.7;font-size:12px}
#admin .adm-liste{display:flex;flex-wrap:wrap;gap:4px}
#admin h4{margin:8px 0 4px}
#admin #adm-note{min-width:160px;font-style:italic;opacity:.85}
#admin #adm-note.adm-flash{animation:admflash .6s}
@keyframes admflash{from{color:#a03020}to{color:inherit}}`;
    document.head.appendChild(st);
  },
};

// la console : admin('prairie') ouvre (et retient le mode) ; admin('off') le retire
window.admin = function (mot) {
  if (mot === 'off') { store.set(ADMIN_KEY, 0); admin.dieu = false; admin.meteo = null; if (ui.panel === '#admin') ui.close(); return 'Mode admin retiré.'; }
  if (mot !== 'prairie') return undefined;
  store.set(ADMIN_KEY, 1);
  admin.ouvrir();
  return 'Mode admin : F9 ouvre et ferme le panneau.';
};

HOOKS.load.push(() => {
  if (admin.branche) return;
  admin.branche = true;
  // F9 : ouvrir, fermer (une fois le mode donné dans la console)
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'F9' || !admin.actif()) return;
    e.preventDefault();
    if (ui.panel === '#admin') ui.close(); else admin.ouvrir();
  });
  // invincible : ni blessure, ni mort
  const _hurt = play.hurt.bind(play);
  play.hurt = function (dmg, src, cause) { if (admin.dieu) return; return _hurt(dmg, src, cause); };
  HOOKS.death.push(() => { if (!admin.dieu) return false; const p = game.player; p.hp = 100; return true; });
  // la météo choisie
  const _today = weather.today.bind(weather);
  weather.today = function () {
    const P = _today();
    if (!admin.meteo || !P) return P;
    return Object.assign({}, P, { plan: [[0, admin.meteo]], rain: admin.meteo === 'rain' || admin.meteo === 'storm', storm: admin.meteo === 'storm' });
  };
});
