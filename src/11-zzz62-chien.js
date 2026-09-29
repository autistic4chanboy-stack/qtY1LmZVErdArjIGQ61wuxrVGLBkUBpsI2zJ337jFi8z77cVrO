// ============================================================================
//  CORPS ET ESPRIT (3) : le CHIEN de la ferme (farm.s.dog : nom, en vie ;
//  farm.s.chien : { rassasie (heure de jeu jusqu'où il a mangé), ordre, … }).
//  - il faut le nourrir : E sur lui (« Lui donner… »), ou une gamelle posée et
//    remplie (E dessus avec de la viande, du poisson, du pain, un os en main) ;
//  - trois jours sans manger, et il meurt ; avant, il gémit, maigrit, se couche
//    et ne se relève plus ;
//  - bien nourri et caressé, il remonte le moral de son maître ;
//  - E sur lui : le nourrir, le caresser, « À la niche ! » (il y va et y reste :
//    la niche posée la plus proche de la ferme, sinon le seuil de la maison),
//    « Au pied ! » (il vous suit partout), « Pas bouger ! », ou le laisser libre ;
//    le sifflet (G) le fait sortir de sa niche.
//  API : chien.faim() (heures sans manger), chien.stade() (0 à 3), chien.nourrir(id),
//        chien.ordonner(ordre), chien.entite(), chien.mourir(cause), chien.adopter(nom).
//  Essais : chien.affamer(heures), chien.etat().
// ============================================================================
// ce qui le nourrit (heures de ventre plein) ; les poissons crus : 14 h
const CHIEN_REPAS = {
  viande: 26, viande_grillee: 24, viande_fumee: 24, brochette: 20, ragout: 24, patee: 30, os: 10, poisson_grille: 16, poisson_fume: 16,
  soupe_poisson: 12, pain: 8, brioche: 6, pain_mais: 8, oeuf: 6, omelette: 10, fromage: 10, fromage_chevre: 10, lait: 6, soupe: 8, porridge: 10, galette: 8, crepes: 6,
};
function chienValeur(id) {
  const it = ITEMS[id];
  if (!it) return 0;
  if (CHIEN_REPAS[id]) return CHIEN_REPAS[id];
  if (it.cat === 'poisson' && it.raw) return 14;
  return 0;
}
const CHIEN_NOMS = ['Filou', 'Médor', 'Pataud', 'Finaud', 'Mirza', 'Fidèle', 'Ravageot', 'Brisquet', 'Sultan', 'Pastis'];

// ---------------------------------------------------------------- la gamelle, la pâtée, le chiot, la tombe
PLACEABLES.gamelle = { name: 'Gamelle du chien', price: 14 };
defItem('gamelle', 'Gamelle du chien', 'objet', 14, ['objet', 'gamelle'], { place: 'gamelle', desc: 'À poser à la ferme. E dessus avec de quoi manger en main pour la remplir : le chien y mange quand il a faim.' });
defItem('patee', 'Pâtée pour chien', 'nourriture', 14, ['bol', '#8a6a4a'], { food: 6, heal: 0, desc: 'Des restes, de la viande, du pain trempé. Pour le chien. En principe.' });
defItem('chiot', 'Chiot', 'objet', 120, ['animal', '#b08450'], { desc: 'Clic : l’adopter. Un chien pour la ferme (s’il n’y en a plus).' });
RECIPES.push(
  { out: 'gamelle', n: 1, need: { bois: 2 }, st: null },
  { out: 'patee', n: 2, need: { viande: 1, pain: 1 }, st: 'feu' },
  { out: 'patee', n: 2, need: { poisson: 1, pain: 1 }, st: 'feu' },
);
for (const id of ['gamelle', 'niche', 'patee']) CRAFT_BASE.add(id);
PROP_USE_MORE.gamelle = 1;
Object.assign(PROP_MODELS, {
  gamelle(E, o) {
    const n = (o.data && o.data.n) || 0;
    E.bx(0, 0, 0, 0.44, 0.1, 0.44, rgbf('#8a8a92'), TL.iron);
    E.bx(0, 0.1, 0, 0.48, 0.03, 0.48, rgbf('#6a6a72'), TL.iron);
    E.bx(0, 0.101, 0, 0.36, 0.01, 0.36, [0.12, 0.1, 0.08], 0);
    if (n > 0) E.bx(0, 0.06, 0, 0.32, 0.05 + 0.02 * Math.min(3, n), 0.32, rgbf((o.data && o.data.col) || '#8a4a2a'), TL.plain);
  },
  tombe_chien(E) {
    E.bx(0, -0.12, 0, 0.7, 0.26, 1.0, rgbf('#6a5038'), TL.soil);
    E.bx(0, 0, -0.44, 0.07, 0.62, 0.07, WHITE, TL.darkwood);
    E.bx(0, 0.4, -0.44, 0.36, 0.07, 0.07, WHITE, TL.darkwood);
    E.bx(0.12, 0.13, 0.1, 0.12, 0.03, 0.12, rgbf('#e8dcc0'), TL.bone);
  },
});
{
  const S = (id) => NPC_DATA.find((d) => d.id === id);
  const E = S('eleveuse');
  if (E && E.shop) E.shop.sells.push(['gamelle', 14], ['niche', 45], ['patee', 12], ['chiot', 120]);
}

const chien = {
  tickT: 0, gemirT: 20, laisseT: 0, dejaParle: false,
  C() {
    const s = farm.s;
    if (!s) return null;
    return s.chien || (s.chien = { rassasie: s.hours + 14, ordre: 'libre', caresse: -99, signe: 0, nourriJour: 0 });
  },
  nom() { const d = farm.s && farm.s.dog; return (d && d.name) || 'Le chien'; },
  vivant() { const d = farm.s && farm.s.dog; return !!(d && d.alive); },
  faim() { const C = this.C(); return C ? Math.max(0, farm.s.hours - C.rassasie) : 0; },
  // 0 : repu ; 1 : a faim (8 h) ; 2 : maigrit (un jour) ; 3 : ne se lève plus (deux jours) ; mort à trois jours
  stade() { const h = this.faim(); return h >= 48 ? 3 : h >= 24 ? 2 : h >= 8 ? 1 : 0; },
  entite() { for (const e of entities.extra) if (e.kind === 'dog' && e.owner && !e.dead && !e.removed) return e; return null; },
  cadavre() { for (const e of entities.extra) if (e.kind === 'dog' && e.owner && e.corpse && !e.removed) return e; return null; },
  // la niche : celle qu'on a posée (la plus proche de la ferme), sinon le seuil ; [x, z, cap, posée]
  // (on ne parcourt les objets posés qu'une fois toutes les deux secondes)
  niche() {
    const now = performance.now(), w = game.world;
    if (this.nicheC && this.nicheC.w === w && now - this.nicheC.t < 2000) return this.nicheC.v;
    const fm = w.farm, q = farm.propByKind('niche', [fm.f.x, fm.f.z], 260);
    let v;
    if (q) { const r = q.r || 0; v = [q.x + Math.sin(r) * 0.85, q.z + Math.cos(r) * 0.85, r + Math.PI, true]; }
    else { const n = fm.niche || [fm.f.x, fm.f.z]; v = [n[0], n[1], null, false]; }
    this.nicheC = { t: now, w, v };
    return v;
  },
  meilleurRepas() {
    let best = null, bv = 0;
    for (const id in farm.s.inv) { const v = chienValeur(id); if (v > bv && farm.count(id)) { bv = v; best = id; } }
    return best;
  },

  // ------------------------------------------------------------- nourrir, caresser, commander
  nourrir(id, e) {
    const s = farm.s, C = this.C(), nom = this.nom();
    if (!this.vivant()) return false;
    const v = chienValeur(id);
    if (!v) { ui.subtitle('', `(${nom} renifle, puis vous regarde, déçu. Ça ne se mange pas, pour un chien.)`, 3); return false; }
    if (C.rassasie > s.hours + 24) { ui.subtitle('', `(${nom} renifle, et se détourne : il n’a plus faim.)`, 3); return false; }
    if (!farm.take(id, 1)) return false;
    const st0 = this.stade();
    this.repas(v, true);
    e = e || this.entite();
    if (e) { e.mange = 2.4; e.gamelle = null; }
    sound.lapement && sound.lapement(1);
    ui.subtitle('', st0 >= 2 ? `(${nom} mange comme s’il n’avait rien avalé depuis des jours. C’est le cas.)` : pick([`(${nom} engloutit tout et vous lèche la main.)`, `(${nom} ne fait qu’une bouchée de ${itemName(id).toLowerCase()}.)`, `(${nom} mange, la queue battante.)`]), 3.5);
    return true;
  },
  repas(h, main) {
    const s = farm.s, C = this.C();
    C.rassasie = Math.min(s.hours + 36, Math.max(C.rassasie, s.hours) + h);
    C.signe = 0;
    s.dog.love = (s.dog.love || 0) + 1;
    const first = C.nourriJour !== s.day;
    C.nourriJour = s.day;
    esprit.changer(main ? (first ? 0.8 : 0.2) : (first ? 0.5 : 0.1), 'chien nourri', 1.2);
  },
  caresser(e) {
    const s = farm.s, C = this.C(), nom = this.nom(), st = this.stade();
    if (e) { e.wag = st < 2; e.lookY = 0; }
    sound.bark && sound.bark(0.35);
    s.dog.love = (s.dog.love || 0) + 1;
    if (s.hours - (C.caresse ?? -99) > 2) esprit.changer(st >= 1 ? 0.2 : 0.4, 'caresser le chien', 0.8);
    C.caresse = s.hours;
    ui.subtitle('', st >= 2 ? `(${nom} se laisse faire. Sous la main, on sent les côtes.)` : st === 1 ? `(${nom} se laisse gratter, mais son ventre gargouille.)` : pick([`(${nom} remue la queue et vous pousse la main du museau.)`, `(${nom} se roule dans l’herbe, les pattes en l’air.)`, `(${nom} pose la tête sur votre genou et ferme les yeux.)`]), 3);
  },
  ordonner(o) {
    const C = this.C(), nom = this.nom(), e = this.entite();
    if (!C || !['niche', 'suivre', 'reste', 'libre'].includes(o)) return false;
    C.ordre = o;
    if (e) { e.state = 'idle'; e.timer = 0; e.gamelle = null; e.bloque = 0; if (o === 'reste') { e.hx = e.x; e.hz = e.z; } }
    if (o === 'niche') { const n = this.niche(); ui.subtitle('', n[3] ? `(${nom} baisse la tête et file vers sa niche.)` : `(${nom} n’a pas de niche : il va se coucher sur le seuil de la maison.)`, 3); }
    else if (o === 'suivre') ui.subtitle('', `(${nom} se colle à vos talons.)`, 2.5);
    else if (o === 'reste') ui.subtitle('', `(${nom} se couche et ne bouge plus. Il vous suit des yeux.)`, 2.5);
    else ui.subtitle('', `(${nom} part renifler le monde.)`, 2.5);
    sound.bark && sound.bark(0.5);
    return true;
  },
  description() {
    const st = this.stade(), C = this.C();
    const d = ['Il remue la queue et vous regarde, la tête penchée.', 'Il vous suit du regard, le ventre creux. Il a faim.', 'Il a maigri. Ses côtes se voient sous le poil, et il ne remue plus la queue.', 'Il est couché et ne se relève pas. Son souffle est court.'][st];
    const o = { niche: ' Vous lui avez dit d’aller à la niche.', suivre: ' Il vous suit partout.', reste: ' Vous lui avez dit de ne pas bouger.', libre: '' }[C.ordre] || '';
    return d + o;
  },
  // E sur le chien : un petit choix
  parler(e) {
    const s = farm.s, C = this.C(), nom = this.nom();
    const hand = s.hand, enMain = chienValeur(hand) && farm.count(hand) ? hand : null;
    const best = enMain || this.meilleurRepas();
    const opts = [];
    if (best) opts.push({ label: 'Lui donner : ' + itemName(best).toLowerCase(), fn: () => { ui.close(); this.nourrir(best, e); } });
    else opts.push({ label: 'Lui donner à manger', fn: () => { ui.close(); ui.subtitle('', `(Vous n’avez rien pour lui : il faudrait de la viande, du poisson, du pain, un os… ${nom} vous regarde, plein d’espoir.)`, 4); } });
    opts.push({ label: 'Le caresser', fn: () => { ui.close(); this.caresser(e); } });
    opts.push({ label: C.ordre === 'niche' ? 'À la niche ! (il y est déjà)' : 'À la niche !', fn: () => { ui.close(); this.ordonner('niche'); } });
    opts.push({ label: 'Au pied ! (qu’il vous suive partout)', fn: () => { ui.close(); this.ordonner('suivre'); } });
    opts.push({ label: 'Pas bouger !', fn: () => { ui.close(); this.ordonner('reste'); } });
    if (C.ordre !== 'libre') opts.push({ label: 'Va, promène-toi !', fn: () => { ui.close(); this.ordonner('libre'); } });
    opts.push({ label: 'Rien', fn: () => ui.close() });
    ui.choice(nom, this.description(), opts);
  },
  // remplir la gamelle (E dessus)
  remplir(q) {
    const s = farm.s, n = (q.data && q.data.n) || 0;
    if (n >= 3) { ui.subtitle('', '(La gamelle est pleine.)', 2); sound.click(); return; }
    const hand = s.hand, id = chienValeur(hand) && farm.count(hand) ? hand : this.meilleurRepas();
    if (!id) { ui.subtitle('', '(Il faudrait de la viande, du poisson, du pain, un os… pour remplir la gamelle.)', 3); sound.click(); return; }
    farm.take(id, 1);
    const col = { viande: '#9a3a30', patee: '#8a6a4a', pain: '#c48846', os: '#e8dcc0', lait: '#f4f2ea', oeuf: '#f2ede2' }[id] || (ITEMS[id].cat === 'poisson' ? '#9aa0a8' : '#8a4a2a');
    farm.setPropData(q, { n: n + 1, id, col });
    sound.place && sound.place();
    ui.subtitle('', `(Vous mettez ${itemName(id).toLowerCase()} dans la gamelle.)`, 2.5);
  },
  gamelles() {
    const now = performance.now(), w = game.world;
    if (!this.gamC || this.gamC.w !== w || now - this.gamC.t > 3000) this.gamC = { t: now, w, v: w.props.filter((q) => q.id === 'gamelle') };
    return this.gamC.v;
  },
  gamellePleine(near) {
    let best = null, bd = 260;
    for (const q of this.gamelles()) {
      if (q.gone || !(q.data && q.data.n > 0)) continue;
      const d = Math.hypot(q.x - near[0], q.z - near[1]);
      if (d < bd) { bd = d; best = q; }
    }
    return best;
  },
  mangerGamelle(e, q) {
    const n = q.data.n, id = q.data.id;
    farm.setPropData(q, { n: n - 1, id: n - 1 > 0 ? id : null });
    this.repas(chienValeur(id) || 12, false);
    if (e) { e.mange = 2.6; e.gamelle = null; if (e.dist < 30) sound.lapement && sound.lapement(clamp(1 - e.dist / 30, 0.15, 1)); }
  },
  adopter(nom) {
    const s = farm.s;
    if (this.vivant()) return false;
    s.dog = { name: nom || pick(CHIEN_NOMS.filter((n) => n !== (s.dog && s.dog.name))), alive: true, love: 0 };
    s.chien = { rassasie: s.hours + 14, ordre: 'libre', caresse: -99, signe: 0, nourriJour: 0 };
    for (const e of entities.extra.slice()) if (e.kind === 'dog' && e.owner) entities.remove(e); // l'ancien (son corps)
    game.syncAnimals();
    return true;
  },

  // ------------------------------------------------------------- la mort, l'enterrement
  mourir(cause) {
    const s = farm.s, C = this.C();
    if (!this.vivant()) return false;
    s.dog.alive = false;
    const e = this.entite(), n = this.niche();
    const pos = e ? [e.x, e.z] : [n[0], n[1]];
    C.mort = { day: s.day, cause: cause || 'faim', x: Math.round(pos[0] * 10) / 10, z: Math.round(pos[1] * 10) / 10, enterre: false, vu: false };
    if (e) { e.dead = true; e.corpse = true; e.state = 'sheltered'; e.move = 0; e.alarm = null; e.gamelle = null; e.wag = false; this.maigrir(e, 3); }
    esprit.changer(-10, 'chien mort');
    const p = game.player;
    if (e && Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) < 30) { C.mort.vu = true; ui.subtitle('', `(${this.nom()} ne bouge plus.)`, 4); }
    return true;
  },
  async enterrer(e) {
    const s = farm.s, C = this.C(), w = game.world;
    if (!C || !C.mort || C.mort.enterre || game.sleeping) return;
    const nom = this.nom(), x = e ? e.x : C.mort.x, z = e ? e.z : C.mort.z;
    game.sleeping = true;
    ui.close(true);
    await ui.fade(true, `Vous creusez un trou, là, dans la terre meuble, et vous y couchez ${nom}.`, 1000);
    await new Promise((r) => setTimeout(r, 2400));
    if (e) entities.remove(e);
    farm.addProp({ id: 'tombe_chien', x, y: w.heightAt(x, z), z, r: game.player.yaw });
    C.mort.enterre = true;
    esprit.changer(1.5, 'deuil');
    game.skipHours(0.5);
    await ui.fade(false, '', 1000);
    game.sleeping = false;
    ui.subtitle('', '(Un petit tertre, un bâton en travers. C’est tout ce que vous avez su faire.)', 4.5);
  },

  // ------------------------------------------------------------- le chien maigrit
  maigrir(e, st) {
    const body = e.rig && e.rig.part('body');
    if (!body || !body.s) return;
    if (!e.s0) e.s0 = body.s.slice();
    const k = st >= 3 ? 0.74 : st >= 2 ? 0.86 : 1;
    if (e.kMaigre === k) return;
    e.kMaigre = k;
    body.s = [e.s0[0] * k, e.s0[1] * (0.55 + 0.45 * k), e.s0[2]];
  },

  // ------------------------------------------------------------- deux fois par seconde
  tick(dt) {
    const s = farm.s, C = this.C(), p = game.player;
    if (!C) return;
    if (!this.vivant()) return this.tickMort();
    const h = this.faim();
    if (h >= 72) { this.mourir('faim'); return; }
    const st = this.stade(), e = this.entite();
    if (!e) {
      // pas de chien dans le monde (l'Envers) : il mange quand même à sa gamelle
      if (h > 4) { const n = this.niche(), q = this.gamellePleine([n[0], n[1]]); if (q) this.mangerGamelle(null, q); }
      return;
    }
    const n = this.niche();
    e.shelter = { x: n[0], z: n[1] };
    this.maigrir(e, st);
    if (h > 4 && !e.gamelle && !(e.mange > 0)) { const q = this.gamellePleine([e.x, e.z]); if (q) e.gamelle = q; }
    // il gémit
    if (st >= 1 && e.dist < 30 && !(e.mange > 0)) {
      this.gemirT -= dt;
      if (this.gemirT <= 0) {
        this.gemirT = st >= 3 ? 22 + Math.random() * 20 : st === 2 ? 25 + Math.random() * 25 : 45 + Math.random() * 45;
        const eye = p.eyePos(), b = cameraBasis(p.yaw, p.pitch), dx = e.x - eye[0], dz = e.z - eye[2], d = Math.hypot(dx, dz) || 1;
        sound.gemissement && sound.gemissement(clamp(1 - e.dist / 30, 0.15, 1) * (st >= 3 ? 0.55 : 1), (dx * b.r[0] + dz * b.r[2]) / d);
      }
    }
    // quand son état empire, on le voit
    if (st > (C.signe || 0) && e.dist < 22 && espritVoit(e.x, e.y + 0.4, e.z, 22)) {
      C.signe = st;
      const nom = this.nom();
      ui.subtitle('', [null, `(${nom} vous suit en gémissant. Il a faim.)`, `(${nom} a maigri. Il vous regarde sans remuer la queue.)`, `(${nom} ne se lève presque plus. On lui voit les côtes.)`][st], 4);
    }
  },
  tickMort() {
    const s = farm.s, C = this.C(), p = game.player, w = game.world;
    if (!C.mort) { C.mort = { day: s.day, cause: 'tué', x: p.pos[0], z: p.pos[2], enterre: 'non', vu: true }; return; }
    const M = C.mort;
    if (M.enterre !== false) return;
    let e = this.cadavre();
    if (!e && !strange.inEnvers()) {
      e = entities.add(w, 'dog', M.x, M.z, { owner: 'joueur', aid: 'chien', v: 0 });
      e.dead = true; e.corpse = true; e.state = 'sheltered'; e.move = 0;
      this.maigrir(e, 3);
    }
    if (e && !M.vu && Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) < 14) { M.vu = true; ui.subtitle('', `(${this.nom()} est couché là. Il ne bouge plus. Il ne se relèvera pas.)`, 4.5); }
  },

  // ------------------------------------------------------------- ce qu'il fait (remplace une partie de entities.dogAI)
  // true : géré ; false : la suite habituelle ; undefined : le comportement d'origine
  ia(e, dt, w, c) {
    const C = this.C(), st = this.stade();
    if (!C) return undefined;
    // il mange
    if (e.mange > 0) { e.mange -= dt; e.move = 0; e.state = 'idle'; e.grazeT = 1; if (e.mange <= 0) e.grazeT = 0; return true; }
    // il va à sa gamelle
    if (e.gamelle) {
      const q = e.gamelle;
      if (q.gone || !(q.data && q.data.n > 0)) e.gamelle = null;
      else {
        const d = Math.hypot(q.x - e.x, q.z - e.z);
        if (d > 0.75) { this.marcher(e, dt, w, q.x, q.z, d > 10); return true; }
        this.mangerGamelle(e, q); return true;
      }
    }
    // trop faible : couché, il ne se relève plus
    if (st >= 3) { e.alarm = null; e.move = 0; e.state = 'sheltered'; e.wag = false; return true; }
    if (e.alarm) return undefined; // il aboie après ce qui rôde
    const O = C.ordre;
    if (O === 'niche') {
      const n = this.niche(), d = Math.hypot(n[0] - e.x, n[1] - e.z);
      if (d > 0.8) this.marcher(e, dt, w, n[0], n[1], d > 12);
      else { e.move = 0; e.state = 'sheltered'; if (n[2] !== null) e.heading = turnToward(e.heading, n[2], dt * 3); }
      e.wag = false; return true;
    }
    if (O === 'reste') { e.move = 0; e.state = 'sheltered'; e.wag = e.dist < 4 && st < 1; return true; }
    if (O === 'suivre') {
      const d = e.dist;
      if (d > 120) this.rattraper(e, w, c);
      if (d > 3.2) { this.marcher(e, dt, w, c.px + Math.sin(e.seed) * 1.4, c.pz + Math.cos(e.seed) * 1.4, d > 7); return true; }
      e.move = 0; e.state = 'idle'; e.wag = st < 1; e.bloque = 0;
      return true;
    }
    // libre : le comportement d'origine ; affamé, il se couche souvent
    if (st === 2) {
      e.cycle = (e.cycle || 0) + dt;
      if (e.cycle % 34 < 20) { e.move = 0; e.state = 'sheltered'; e.wag = false; return true; }
      if (e.state === 'sheltered') e.state = 'idle';
    }
    const r = entities._dogAIh(e, dt, w, c);
    if (st >= 1) e.wag = false;
    return r;
  },
  marcher(e, dt, w, x, z, run) {
    const cfg = e.cfg, sp = (run ? cfg.run : cfg.walk * 1.8) * (this.stade() >= 2 ? 0.6 : 1);
    e.heading = turnToward(e.heading, Math.atan2(x - e.x, z - e.z), dt * 6);
    e.state = 'walk'; e.tx = x; e.tz = z; e.timer = 5;
    const x0 = e.x, z0 = e.z;
    entities.stepMove(e, dt, w, sp);
    e.state = 'walk';
    e.bloque = Math.hypot(e.x - x0, e.z - z0) < sp * dt * 0.2 ? (e.bloque || 0) + dt : 0;
    if (e.bloque > 4) { e.x = x; e.z = z; e.y = entities.groundY(w, e, x, z); e.bloque = 0; } // il trouve son chemin (on ne l'a pas vu passer)
    e.move = 1; e.run = run; e.phase += dt * sp * 2.6 / Math.max(0.5, e.h);
  },
  // resté trop loin (on est parti à cheval) : il revient, par-derrière
  rattraper(e, w, c) {
    const p = game.player;
    for (let k = 0; k < 8; k++) {
      const a = p.yaw + (Math.random() - 0.5) * 1.2, r = 22 + Math.random() * 8;
      const x = p.pos[0] + Math.sin(a) * r, z = p.pos[2] + Math.cos(a) * r;
      if (!w.inside(x, z, 5) || w.heightAt(x, z) < w.waterLevel + 0.2) continue;
      e.x = x; e.z = z; e.y = entities.groundY(w, e, x, z); e.bloque = 0;
      return;
    }
  },
  // ---------------------------------------------------------------- essais
  affamer(h) { const C = this.C(); if (C) C.rassasie -= +h || 0; return this.faim(); },
  etat() {
    const C = this.C(), e = this.entite() || this.cadavre();
    return { vivant: this.vivant(), nom: this.nom(), faim: +this.faim().toFixed(1), stade: this.stade(), ordre: C && C.ordre, mort: C && C.mort, x: e && +e.x.toFixed(1), z: e && +e.z.toFixed(1), state: e && e.state, corps: e && e.kMaigre };
  },
};

// ---------------------------------------------------------------- points d'accroche
{
  const _dogAI = entities.dogAI.bind(entities);
  entities._dogAIh = _dogAI;
  entities.dogAI = function (e, dt, w, c) {
    if (!e.owner || !farm.s || game.kind !== 'farm') return _dogAI(e, dt, w, c);
    let r;
    try { r = chien.ia(e, dt, w, c); } catch (err) { console.error(err); r = undefined; }
    return r === undefined ? _dogAI(e, dt, w, c) : r;
  };
}
HOOKS.propPre.gamelle = (q) => { chien.remplir(q); return true; };
// adopter un chiot
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (id !== 'chiot' || held) return false;
  play.cool = 0.6;
  if (chien.vivant()) { ui.subtitle('', `(Vous avez déjà ${chien.nom()}. Il ne partagerait pas sa gamelle.)`, 3); return true; }
  if (!farm.take('chiot', 1)) return true;
  chien.adopter();
  sound.bark && sound.bark(0.7);
  ui.subtitle('', `(Le chiot vous mordille les doigts. Vous l’appelez ${chien.nom()}. Il faudra le nourrir.)`, 4.5);
  return true;
});
// le cadavre se désigne avec E (pour l'enterrer)
HOOKS.target.push((eye, f, cand) => {
  const C = farm.s && farm.s.chien;
  if (!C || !C.mort || C.mort.enterre !== false) return;
  const e = chien.cadavre();
  if (!e) return;
  const dx = e.x - eye[0], dy = e.y + 0.3 - eye[1], dz = e.z - eye[2], d = Math.hypot(dx, dy, dz);
  if (d > 2.8 || (dx * f[0] + dy * f[1] + dz * f[2]) / (d || 1) < 0.7) return;
  cand({ kind: 'animal', e }, d);
});
HOOKS.load.push((saved) => {
  const s = farm.s;
  if (!s.dog) s.dog = { name: 'Filou', alive: true };
  if (!saved || !s.chien) s.chien = { rassasie: s.hours + 14, ordre: 'libre', caresse: -99, signe: 0, nourriJour: 0 };
  chien.C();
  chien.tickT = 0; chien.gemirT = 20;
  chien.nicheC = null; chien.gamC = null;
  if (chien.branche) return;
  chien.branche = true;
  // une niche, une gamelle posée ou retirée : on regarde de nouveau
  const _ap = farm.addProp.bind(farm);
  farm.addProp = function (p) { const r = _ap(p); if (p && (p.id === 'niche' || p.id === 'gamelle')) { chien.nicheC = null; chien.gamC = null; } return r; };
  const _rp = farm.removeProp.bind(farm);
  farm.removeProp = function (q) { const r = _rp(q); if (q && (q.id === 'niche' || q.id === 'gamelle')) { chien.nicheC = null; chien.gamC = null; } return r; };
  // E sur le chien : le petit choix (ou l'enterrer)
  const _ua = game.useAnimal.bind(game);
  game.useAnimal = function (e) {
    if (e && e.kind === 'dog' && e.owner && farm.s) { if (e.corpse) return chien.enterrer(e); if (!e.dead) return chien.parler(e); }
    return _ua(e);
  };
  // le sifflet : il sort de sa niche et accourt
  const _wh = game.whistle.bind(game);
  game.whistle = function () {
    const r = _wh();
    const C = chien.C(), e = chien.entite(), p = game.player;
    if (C && e && (C.ordre === 'niche' || C.ordre === 'reste') && Math.hypot(e.x - p.pos[0], e.z - p.pos[2]) < 180 && chien.stade() < 3) {
      C.ordre = 'suivre';
      setTimeout(() => ui.subtitle('', `(${chien.nom()} dresse les oreilles et accourt.)`, 2.5), 700);
    }
    return r;
  };
});
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || game.mode !== 'play' || game.dying || game.sleeping) return;
  chien.tickT -= dt;
  if (chien.tickT > 0) return;
  const step = 0.5 - chien.tickT;
  chien.tickT = 0.5;
  try { chien.tick(step); } catch (e) { console.error(e); }
});
// le surlendemain matin : un corps qu'on n'a pas enterré a disparu
HOOKS.day.push(() => {
  const C = farm.s.chien;
  if (!C || !C.mort || C.mort.enterre !== false || C.mort.day > farm.s.day - 2) return;
  C.mort.enterre = 'emporte';
  const e = chien.cadavre();
  if (e) entities.remove(e);
  esprit.changer(-2, 'le corps du chien');
  setTimeout(() => { if (!game.dying) ui.subtitle('', `(Le corps de ${chien.nom()} a disparu pendant la nuit. Il ne reste qu’une trace dans l’herbe, qui s’en va vers le bois.)`, 5); }, 4000);
});

// ---------------------------------------------------------------- les bruits du chien
Object.assign(SoundEngine.prototype, {
  gemissement(k = 1, pan = 0) {
    if (!this.ok) return;
    const t = this.at(), p = this.pan(clamp(pan, -0.9, 0.9));
    this.voice(t, 'triangle', 1150, 780, 0.75, 0.032 * k, p, { vib: 6, vibDepth: 45, bp: 1300, q: 2 });
    this.voice(t + 0.85, 'triangle', 980, 700, 0.5, 0.022 * k, p, { vib: 7, vibDepth: 35, bp: 1200, q: 2 });
  },
  lapement(k = 1) {
    if (!this.ok) return;
    const t = this.at();
    for (let i = 0; i < 7; i++) this.noiseHit(t + i * 0.16 + Math.random() * 0.04, 0.05, 'lowpass', 900 + Math.random() * 500, 1, 0.05 * k);
    this.noiseHit(t + 1.2, 0.08, 'bandpass', 1800, 1.5, 0.04 * k);
  },
});
