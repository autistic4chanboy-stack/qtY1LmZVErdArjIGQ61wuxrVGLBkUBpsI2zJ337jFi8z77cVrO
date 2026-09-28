// ============================================================================
//  TROIS LIEUX À VIVRE
//  - Les Sources : on se baigne dans l'eau chaude (E sur un bassin) : fondu,
//    soins lents, chaleur qui tient au corps dans la montagne, la tête qui se
//    vide ; la vapeur monte. Les gens des Sources vivent là (bassins, potager,
//    repas en commun, veillée au bord de l'eau) et s'habillent pour aller au
//    hameau.
//  - Le village caché des nains : à la fente de la falaise (E frappe) ; il faut
//    frapper trois coups, puis un, puis trois (des silences entre les groupes).
//    Le sifflet d'argent, soufflé devant la fente, frappe à votre place. Mauvais
//    rythme : « Passe ton chemin. » Les nains ne sortent pas ; ils commercent,
//    parlent parfois leurs vieilles langues, et échangent des mots contre du pain.
//  - Les géants : trois, à leur camp des hauteurs de l'est. Ils vont du feu à la
//    table et aux lits, à pas lents qui font trembler le sol ; l'un d'eux monte
//    parfois voir l'aube sur la crête. Paisibles, sauf si on les frappe (un
//    revers de main suffit). Ils parlent gorrain, lentement. On peut leur porter
//    du pain ou du miel.
//  État sauvegardé : farm.s.lieux.
// ============================================================================
Object.assign(BUFF_NAMES, { bains: 'Chaleur des Sources' });
Object.assign(SoundEngine.prototype, {
  // pas d'un géant : un coup sourd, très bas
  pasGeant(k = 1) { if (!this.ok) return; const t = this.at(); this.tone(t, 'sine', 52, 30, 0.7, 0.2 * k, this.lp(200)); this.noiseHit(t, 0.45, 'lowpass', 160, 0.7, 0.12 * k); },
  // la pierre qui pivote
  pierre() { if (!this.ok) return; const t = this.at(); this.voice(t, 'sawtooth', 70, 48, 2.2, 0.035, this.lp(420), { vib: 7, vibDepth: 6 }); this.noiseHit(t, 2.0, 'lowpass', 300, 0.6, 0.1, null, 120); this.noiseHit(t + 2.0, 0.3, 'lowpass', 500, 0.8, 0.2); },
  // un coup unique frappé à la paroi
  coup() { if (!this.ok) return; const t = this.at(); this.noiseHit(t, 0.07, 'lowpass', 380, 0.8, 0.32); this.tone(t, 'sine', 110, 60, 0.09, 0.28); },
  // le sifflet d'argent : trois, un, trois
  siffletNains() { if (!this.ok) return; const t = this.at(); [0, 0.22, 0.44, 1.2, 1.95, 2.17, 2.39].forEach((d) => this.tone(t + d, 'sine', 2300, 2500, 0.14, 0.045)); },
  // un chant grave, sous la montagne
  chantNains() { if (!this.ok) return; const t = this.at(), out = this.lp(600, this.amb); [98, 110, 131, 110, 98].forEach((f, i) => this.voice(t + i * 0.9, 'triangle', f, f * 0.99, 1.1, 0.018, out, { vib: 5, vibDepth: 2 })); },
});

// ---------------------------------------------------------------- phrases (langue, texte, sens)
const NAINS_PHRASES = [
  ['aelin', 'durn sae , ve lir', 'Durn dort ; nous chantons.'],
  ['aelin', 'garim rimen na-thalen', 'Les nains, gardiens du temple.'],
  ['aelin', 'ael vor ves', 'La lumière avant la nuit.'],
  ['aelin', 'thal , ser , vir', 'Pierre, eau, feu.'],
  ['gorrain', 'dwerr-dwerr bul mor', 'Les nains, sous la montagne.'],
  ['gorrain', 'aal mek , hol dunn', 'Petite lumière, grande nuit.'],
  ['aelin', 'ves vesa nai tor', 'La nuit noire n’ouvre pas.'],
];
const GEANTS_PHRASES = [
  ['mek hak , lokka', 'Petit homme, regarde.'],
  ['ho ta , mek hak', 'Ô toi, petit homme.'],
  ['dunn mor , ulm-ulm hum', 'Haute montagne ; les géants dorment.'],
  ['vok dunn', 'Grand feu.'],
  ['olm lokka , hol zogga', 'Regarde la lune, va dans la nuit.'],
  ['grum nuk', 'Pas de tonnerre.'],
  ['hak nuk brek gor-gor', 'L’homme ne casse pas les pierres.'],
  ['trek ulm-ulm , ek bruk', 'Trois géants, une table.'],
  ['vogga zogga , olm ruk', 'Le soleil s’en va, la lune marche.'],
  ['dwerr-dwerr bul mor', 'Les nains, sous la montagne.'],
];
const GEANTS_DON = [['ya , ya , mek hak', 'Oui, oui, petit homme.'], ['drum dunn', 'Grand cœur.'], ['ma-ma hum , ta zogga', 'Nous dormons ; toi, va.']];
const GEANTS_COLERE = [['hak brek ! nuk !', 'L’homme casse ! Non !'], ['grum ! grum !', 'Tonnerre ! Tonnerre !']];
const GEANTS_AUBE = [['vogga … vogga', 'Le soleil… le soleil.'], ['skaa rum , vogga dun', 'Le ciel est rond, le soleil haut.']];
// ce qu'on apprend d'eux, deux mots par cadeau (mots du lexique gorrain)
const GEANTS_MOTS = ['vok', 'hak', 'mek', 'dunn', 'ulm', 'mor', 'olm', 'vogga', 'hum', 'zogga', 'lokka', 'gor', 'bruk', 'drum', 'kran', 'ya', 'nuk', 'rag', 'hol', 'aal', 'skaa', 'grum', 'tunn', 'ruk', 'dor', 'ek', 'dek', 'trek'];
// les nains : un pain, un mot (aëlin avec l'ancien, gorrain avec la forgeronne)
const NAINS_MOTS = {
  aelin: ['ael', 'thal', 'ser', 'vir', 'mora', 'dal', 'kel', 'mir', 'oth', 'ven', 'ves', 'sae', 'rim', 'tor', 'kor', 'ith', 'gar', 'orm', 'hal', 'lir', 'durn', 'aela', 'vesh', 'thalen', 'noth', 'sera', 'vira', 'lun', 'estel', 'hem'],
  gorrain: ['gor', 'dwerr', 'aal', 'mor', 'bul', 'rag', 'vok', 'ulm', 'hak', 'kran', 'tro', 'trom', 'dor', 'lok', 'zog', 'hum', 'gar', 'olm', 'vogga', 'drum'],
};
const GEANT_LOOKS = [
  { skin: '#c4a07e', hair: '#5a4a38', hairStyle: 'long', beard: 'longue', top: '#6a5438', bottom: '#4a3a28', shoe: '#3a2a1e', build: 'rond', apron: '#7a6446' },
  { skin: '#caa482', hair: '#7a5a3a', hairStyle: 'queue', beard: null, top: '#5a4a36', bottom: '#4a3e2e', shoe: '#3a2e22', build: 'normal', dress: true, bust: 0.7, hips: 0.9 },
  { skin: '#d0ac8a', hair: '#6a5238', hairStyle: 'court', beard: null, top: '#7a6242', bottom: '#50402e', shoe: '#3a2a1e', build: 'normal' },
];
const GEANT_NOMS = ['Dunn', 'Olma', 'Mek'];
const GEANT_TAILLES = [4.8, 4.4, 4.0]; // quatre à cinq fois la taille d'un homme

const lieux = {
  baignade: null, frappes: [], geants: [], silhouette: null, oeil: null,
  S() {
    const s = farm.s;
    const L = s.lieux || (s.lieux = {});
    L.bains = L.bains || { n: 0, jour: 0 };
    L.nains = L.nains || { ouvert: 0, entrees: 0 };
    L.geants = L.geants || { dons: 0, colere: 0, morts: [] };
    return L;
  },
  // une phrase dans une langue perdue : lente, et comprise si l'on connaît les mots
  dire(qui, lang, texte, sens, dur, lent) {
    const mots = langWords(texte);
    let aff = lent ? mots.join('… ') + '…' : texte, tr = null;
    if (typeof langues !== 'undefined' && langues && typeof langues.traduire === 'function') { try { const r = langues.traduire(lang, texte); if (typeof r === 'string' && r && r !== texte) tr = r; } catch (e) { /* rien */ } }
    if (!tr && mots.length && mots.every((m) => savoir.motConnu(lang, m))) tr = sens;
    ui.subtitle(qui, tr ? `« ${aff} » (${tr})` : `« ${aff} »`, dur || 6);
  },

  // ================================================================ les Sources : le bain
  bassinDe(x, z) {
    let best = null, bd = 12;
    for (const P of game.world.pools || []) { if (P.kind !== 'bains') continue; const d = Math.hypot(P.x - x, P.z - z); if (d < bd) { bd = d; best = P; } }
    return best;
  },
  async bain(it) {
    if (this.baignade) { this.sortirBain(); return; }
    const P = this.bassinDe(it.x, it.z), p = game.player;
    if (!P || game.sleeping || game.dying) return;
    if (weather.cur.storm > 0.5) { ui.subtitle('', '(Il tonne. On ne se baigne pas sous l’orage.)', 3); return; }
    if (typeof societe !== 'undefined' && npcs.byId.naturiste_b && societe.crimesSus(npcs.byId.naturiste_b).some((C) => C.type === 'meurtre')) { ui.subtitle('', '(On vous regarde. Personne ne dit rien. L’eau ne veut pas de vous.)', 3.5); return; }
    game.sleeping = true;
    await ui.fade(true, '(Vous posez vos vêtements sur la pierre tiède, et vous entrez dans l’eau.)', 800);
    const c = Math.cos(P.r || 0), sn = Math.sin(P.r || 0), lx = (Math.random() - 0.5) * (P.w - 1.6), lz = (Math.random() - 0.5) * (P.d - 1.6);
    p.pos = [P.x + lx * c + lz * sn, P.y + 0.02, P.z - lx * sn + lz * c]; p.vel = [0, 0, 0];
    this.baignade = { P, t: 0, dit: false };
    const L = this.S(); L.bains.n++;
    await new Promise((r) => setTimeout(r, 400));
    await ui.fade(false, '', 900);
    game.sleeping = false;
    sound.splash && sound.splash();
    ui.subtitle('', '(L’eau est chaude, presque trop. Elle sent la pierre et le fer.)', 4);
    // les gens des Sources vous saluent, une fois par jour
    if (L.bains.jour !== farm.s.day) {
      L.bains.jour = farm.s.day;
      const n = npcs.list.find((m) => m.d.area === 'sources' && m.st.alive && m.place === 'bains' && Math.hypot(m.x - p.pos[0], m.z - p.pos[2]) < 14);
      if (n) { npcs.addAmitie(n, 6); setTimeout(() => npcs.say(n, pick(['L’eau vous va bien, vous savez.', 'Restez tant que vous voulez. L’eau ne se fatigue jamais.', 'Vous voyez ? Plus rien ne presse, ici.', 'Fermez les yeux. Écoutez la montagne respirer.']), 4), 2500); }
    }
  },
  async sortirBain() {
    const B = this.baignade;
    if (!B || game.sleeping) return;
    const p = game.player, P = B.P;
    game.sleeping = true;
    await ui.fade(true, '(Vous sortez de l’eau. L’air vous paraît froid, puis plus du tout.)', 700);
    const c = Math.cos(P.r || 0), sn = Math.sin(P.r || 0), lz = -(P.d / 2 + 1.3);
    const x = P.x + lz * sn, z = P.z + lz * c, w = game.world;
    p.pos = [x, w.groundAt(x, z, w.heightAt(x, z) + 1, 1.2) + 0.02, z]; p.vel = [0, 0, 0];
    BUFF.add('bains', clamp(B.t / 12, 1, 8));
    this.baignade = null;
    await ui.fade(false, '', 700);
    game.sleeping = false;
  },
  majBain(dt) {
    const B = this.baignade;
    if (!B) return;
    const p = game.player, s = farm.s;
    if (Math.hypot(p.pos[0] - B.P.x, p.pos[2] - B.P.z) > Math.max(B.P.w, B.P.d) + 2 || game.dying) { this.baignade = null; return; } // (emmené ailleurs)
    B.t += dt;
    p.vel = [0, 0, 0];
    if (p.hp < 100) p.hp = Math.min(100, p.hp + dt * 1.2);
    play.nausea = Math.max(0, (play.nausea || 0) - dt * 2);
    play.poisonT = Math.max(0, (play.poisonT || 0) - dt * 1.5);
    // la jambe cassée se remet trois fois plus vite dans l'eau chaude
    const C = corps.C();
    if (corps.jambeCassee()) C.jambe -= dt * 24 / game.world.dayLength * 2;
    if (!B.dit && B.t > 9) { B.dit = true; ui.subtitle('', corps.saignement() > 0 ? '(L’eau rosit autour de vous. Il faudrait serrer un bandage.)' : '(Vos épaules se dénouent. Pour la première fois depuis des jours, vous ne pensez à rien.)', 4.5); }
    if (weather.cur.storm > 0.5 && B.t > 2) { ui.subtitle('', '(Le tonnerre roule. Il faut sortir de l’eau.)', 2.5); this.sortirBain(); return; }
    if (B.t > 1.2 && ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'].some((k) => input.down(k))) this.sortirBain();
  },
  vapeur(dt, eye) {
    const w = game.world;
    if (!w.sources || Math.hypot(eye[0] - w.sources.x, eye[2] - w.sources.z) > 70) return;
    const night = game.sky && game.sky.night > 0.5;
    for (const P of w.pools) {
      if (P.kind !== 'bains' || Math.random() > dt * (P.w * P.d) * (night ? 0.5 : 0.3)) continue;
      const c = Math.cos(P.r), sn = Math.sin(P.r), lx = (Math.random() - 0.5) * P.w, lz = (Math.random() - 0.5) * P.d;
      particles.spawn(P.x + lx * c + lz * sn, P.y + 0.05, P.z - lx * sn + lz * c, (Math.random() - 0.5) * 0.2, 0.25 + Math.random() * 0.2, (Math.random() - 0.5) * 0.2, [0.88, 0.9, 0.92, 0.18], 0.25, 3 + Math.random() * 2, -0.02, false);
      particles.list[particles.list.length - 1].grow = 1.1;
    }
  },
  // les gens des Sources s'habillent pour quitter les bassins (et se dévêtent en rentrant)
  habits() {
    const w = game.world;
    if (!w.sources) return;
    for (const n of npcs.list) {
      if (!n.d.look || !n.d.look.nude || !n.st.alive || n.state === 'gone') continue;
      const loin = Math.hypot(n.x - w.sources.x, n.z - w.sources.z) > 55;
      if (!!n.habille === loin) continue;
      n.habille = loin;
      const L = Object.assign({}, n.d.look, { held: null, old: n.d.age >= 60 });
      if (loin) Object.assign(L, { nude: false, top: n.d.gender === 'f' ? '#d8cfbc' : '#cfc8b4', bottom: n.d.gender === 'f' ? '#7a6a5a' : '#5a4e40', dress: n.d.gender === 'f', shoe: '#4a3a2a', hat: n.d.gender === 'f' ? 'paille' : null });
      n.look = L; n.rig = humanRig(L); n.faceParts = false;
      if (typeof addFace === 'function') addFace(n);
    }
  },

  // ================================================================ les nains : frapper comme eux
  frapper(it) {
    const L = this.S(), p = game.player;
    if (this.ouverture) return;
    if (sound.knock) sound.knock(1); else if (sound.coup) sound.coup();
    const now = game.time;
    if (!this.frappes.length && !L.nains.vu) { L.nains.vu = 1; ui.subtitle('', '(Une fente étroite dans la paroi, en forme de serrure. La roche sonne creux.)', 4); }
    this.frappes.push(now);
    this.fente = it;
    void p;
  },
  // groupes de coups séparés par des silences ; on juge après un long silence
  majFrappes() {
    const F = this.frappes;
    if (!F.length || game.time - F[F.length - 1] < 2.3) return;
    const groupes = [1];
    for (let i = 1; i < F.length; i++) { if (F[i] - F[i - 1] > 0.85) groupes.push(1); else groupes[groupes.length - 1]++; }
    this.frappes = [];
    if (groupes.join('-') === '3-1-3') this.ouvrir('coups');
    else this.refus(groupes);
  },
  refus(groupes) {
    const L = this.S();
    L.nains.rates = (L.nains.rates || 0) + 1;
    if (groupes.length === 1 && groupes[0] <= 2 && Math.random() < 0.5) return; // deux coups en passant : personne ne répond
    setTimeout(() => {
      if (Math.random() < 0.8) ui.subtitle('???', pick(['Passe ton chemin.', 'Passe ton chemin, grand.', 'Il n’y a personne. Passe ton chemin.']), 3);
      else sound.coup && sound.coup();
    }, 1200 + Math.random() * 800);
  },
  sang() { return typeof societe !== 'undefined' && npcs.byId.nain_ancien && societe.crimesSus(npcs.byId.nain_ancien).some((C) => C.type === 'meurtre'); },
  ouvrir(par) {
    const w = game.world, N = w.nains, L = this.S();
    if (!N || !N.door || this.ouverture) return;
    if (this.sang()) { setTimeout(() => ui.subtitle('???', 'Tu portes du sang. La porte ne s’ouvrira plus.', 4), 1300); return; }
    if (!npcs.alive('nain_ancien') && !npcs.alive('nain_forgeronne')) { setTimeout(() => ui.subtitle('', '(Rien. La roche ne répond plus. Il n’y a plus personne pour ouvrir.)', 4), 1300); return; }
    this.ouverture = true;
    const [fx, fy, fz, face] = N.door, nx = Math.sin(face), nz = Math.cos(face);
    const devant = [fx + nx * 3.2, fy + 1.6, fz + nz * 3.2], fente = [fx, fy + 1.25, fz], pres = [fx + nx * 0.75, fy + 1.3, fz + nz * 0.75];
    const premier = !L.nains.ouvert;
    L.nains.ouvert = L.nains.ouvert || farm.s.day; L.nains.entrees++;
    const fin = () => { this.ouverture = false; this.oeil = null; };
    cine.jouer([
      { dur: 2.6, de: { pos: devant, look: fente }, a: { pos: [fx + nx * 2.4, fy + 1.45, fz + nz * 2.4], look: fente }, joueur: true, debut() { sound.pierre && sound.pierre(); game.shakeT = 0.6; }, chaque(t) { if (t < 2) game.shakeT = Math.max(game.shakeT, 0.15); } },
      { dur: 3.0, de: { pos: pres, look: fente }, texte: premier ? 'Qui frappe comme nous ?' : 'Ah. C’est toi, grand.', qui: '???', debut: () => { this.oeil = { x: fx, y: fy + 1.25, z: fz, face, t: 0 }; } },
      { dur: 2.2, fondu: 'noir', texte: premier ? '(La paroi pivote vers l’intérieur. Un escalier taillé descend dans le noir, vers une lueur dorée.)' : '(La paroi pivote. Vous descendez.)', fin: () => { const to = N.inside; game.player.pos = [to[0], to[1] + 0.05, to[2]]; game.player.vel = [0, 0, 0]; game.renderer.uploadCover && game.renderer.uploadCover(to[0], to[2]); savoir.connaitreLieu('nains'); } },
    ], { apres: fin });
    if (par === 'sifflet') L.nains.sifflet = 1;
  },
  // les nains parlent entre eux ; le soir, ils chantent pour Durn
  majNains(dt) {
    const w = game.world, p = game.player, N = w.nains;
    if (!N || !p.underground || Math.hypot(p.pos[0] - N.hall.x, p.pos[2] - N.hall.z) > 32) return;
    this.nainT = (this.nainT || 8) - dt;
    if (this.nainT > 0) return;
    this.nainT = 28 + Math.random() * 30;
    const L = npcs.list.filter((n) => n.d.area === 'nains' && n.st.alive && !n.talking && n.state !== 'sleep' && n.dist < 16);
    if (!L.length) return;
    const n = L[(Math.random() * L.length) | 0], h = npcs.hour();
    if (n.place === 'nain:chant' || (h >= 19.5 && h < 21)) { sound.chantNains && sound.chantNains(); this.dire(n.st.met ? n.name : '???', 'aelin', 'lira na-aela , durn sae', 'Le chant d’Aëla ; Durn dort.', 6, true); return; }
    const [lang, t, sens] = pick(NAINS_PHRASES);
    this.dire(n.st.met ? n.name : '???', lang, t, sens, 5.5);
  },

  // ================================================================ les géants
  camp() {
    const w = game.world, G = w.geants;
    if (!G) return null;
    if (this.campW === w) return this.campInfo;
    const near = (id) => w.props.filter((q) => q.id === id && Math.hypot(q.x - G.x, q.z - G.z) < 40);
    const feu = near('feu_geant')[0], lit = near('lit_geant')[0], os = near('os_geant'), pierres = near('pierre_dressee');
    const r = lit ? lit.r : 0, c = Math.cos(r), sn = Math.sin(r);
    const loc = (lx, lz) => [G.x + lx * c + lz * sn, G.z - lx * sn + lz * c];
    // la table : on s'y tient debout, tout autour
    const table = [[0, -4.4], [0, 4.4], [-7.2, 0], [7.2, 0]].map(([a, b]) => loc(a, b));
    // la crête de l'aube : le point le plus haut, du côté de la vallée
    const T = w.townInfo || { x: G.x - 400, z: G.z + 500 }, dir = Math.atan2(T.x - G.x, T.z - G.z);
    let crete = null, best = -1e9;
    for (let k = 0; k < 160; k++) {
      const a = dir + (k % 16 - 7.5) * 0.11, d = 70 + Math.floor(k / 16) * 18, x = G.x + Math.sin(a) * d, z = G.z + Math.cos(a) * d;
      if (!w.inside(x, z, 30)) continue;
      const h = w.heightAt(x, z), n = w.normalAt(x, z);
      if (h < w.waterLevel + 3 || n[1] < 0.55) continue;
      if (h > best) { best = h; crete = [x, z]; }
    }
    this.campW = w;
    this.campInfo = { G, r, loc, feu: feu ? [feu.x, feu.z] : loc(9, 7), lit: lit ? [lit.x, lit.z, lit.r] : null, os: os.map((q) => [q.x, q.z]), pierres: pierres.map((q) => [q.x, q.z]), table, crete };
    return this.campInfo;
  },
  initGeants() {
    const C = this.camp(), L = this.S();
    this.geants = [];
    if (!C) return;
    const w = game.world;
    for (let i = 0; i < 3; i++) {
      if (L.geants.morts.some((m) => m.i === i)) { const m = L.geants.morts.find((q) => q.i === i); this.geants.push({ geant: true, i, nom: GEANT_NOMS[i], mort: true, x: m.x, z: m.z, y: w.heightAt(m.x, m.z), heading: m.h || 0, rig: humanRig(GEANT_LOOKS[i]), s: GEANT_TAILLES[i], hp: 0 }); continue; }
      const a = i * 2.1, x = C.G.x + Math.cos(a) * 9, z = C.G.z + Math.sin(a) * 9;
      this.geants.push({ geant: true, i, nom: GEANT_NOMS[i], x, z, y: w.heightAt(x, z), heading: a, move: 0, phase: 0, rig: humanRig(GEANT_LOOKS[i]), s: GEANT_TAILLES[i], hp: 1400, act: '', tgt: null, t: 0, attT: 0, colere: 0, parleT: 10 + i * 7 });
    }
  },
  activite(g, h) {
    const L = this.S(), d = farm.s.day;
    if (g.colere > game.time || (L.geants.colere >= d && Math.hypot(game.player.pos[0] - g.x, game.player.pos[2] - g.z) < 40) || L.geants.haine) return 'colere';
    if (h >= 21.5 || h < 5) return 'dort';
    if (g.i === 0 && h >= 5 && h < 7.6 && (mulberry32(farm.s.seed * 7 + d * 13)() < 0.5)) return 'crete';
    if (h >= 12 && h < 13.5) return 'repas';
    if (h >= 19 || (h >= 5 && h < 7.5)) return 'feu';
    return 'vaque';
  },
  // un point où aller pour cette activité
  but(g, act) {
    const C = this.camp(), R = Math.random;
    if (act === 'crete' && C.crete) return { x: C.crete[0], z: C.crete[1], pose: 'debout' };
    if (act === 'repas') { const t = C.table[g.i % C.table.length]; return { x: t[0], z: t[1], pose: 'table', face: [C.G.x, C.G.z] }; }
    if (act === 'feu' || act === 'dort') {
      if (act === 'dort' && g.i === 0 && C.lit) return { x: C.lit[0], z: C.lit[1], pose: 'lit', r: C.lit[2] };
      const a = g.i * 2.4 + 0.5, f = C.feu; return { x: f[0] + Math.cos(a) * 6.5, z: f[1] + Math.sin(a) * 6.5, pose: act === 'dort' ? 'sol' : 'assis', face: f };
    }
    // vaquer : du feu aux pierres, aux os, à la table
    const P = [C.feu].concat(C.pierres, C.os, C.table);
    const q = P[(R() * P.length) | 0] || [C.G.x, C.G.z], a = R() * TAU;
    return { x: q[0] + Math.cos(a) * 5, z: q[1] + Math.sin(a) * 5, pose: R() < 0.4 ? 'travail' : 'debout', dur: 12 + R() * 20 };
  },
  majGeants(dt) {
    if (!this.geants.length) return;
    const w = game.world, p = game.player, h = npcs.hour(), C = this.camp();
    for (const g of this.geants) {
      if (g.mort) continue;
      g.attackAnim = Math.max(0, (g.attackAnim || 0) - dt); g.hurtT = Math.max(0, (g.hurtT || 0) - dt);
      const dxp = p.pos[0] - g.x, dzp = p.pos[2] - g.z, dp = Math.hypot(dxp, dzp);
      const act = this.activite(g, h);
      if (act !== g.act || !g.tgt || (g.tgt.dur && g.t > g.tgt.dur && g.arrive)) { g.act = act; g.tgt = act === 'colere' ? null : this.but(g, act); g.t = 0; g.arrive = false; }
      g.t += dt;
      // la colère : il vient, il frappe du revers de la main
      if (act === 'colere') {
        if (dp > 90) { g.calmeT = (g.calmeT || 0) + dt; if (g.calmeT > 30) { g.colere = 0; g.calmeT = 0; } }
        else g.calmeT = 0;
        g.heading = turnToward(g.heading, Math.atan2(dxp, dzp), dt * 1.6);
        if (dp > 4.3) this.marcher(g, 3.8, dt, w, p);
        else {
          g.move = lerp(g.move, 0, dt * 4);
          g.attT += dt;
          if (g.attT > 0.9) { g.attT = -1.4; g.attackAnim = 0.6; sound.pasGeant && sound.pasGeant(1.4); game.shakeT = 0.9; if (dp < 5.4 && !game.dying) play.hurt(500, g, 'Balayé d’un revers de main par un géant'); }
        }
        if (Math.random() < dt * 0.08 && dp < 40) { const [t, sens] = pick(GEANTS_COLERE); this.dire(g.nom, 'gorrain', t, sens, 3.5); }
        continue;
      }
      g.attT = 0;
      const T = g.tgt, dx = T.x - g.x, dz = T.z - g.z, d = Math.hypot(dx, dz);
      if (d > 1.5 && !g.arrive) {
        g.heading = turnToward(g.heading, Math.atan2(dx, dz), dt * 1.2); g.pose = null;
        // loin des yeux, un géant va vite (ses enjambées font trois hommes)
        if (dp > 170) { const k = Math.min(d, 14 * dt); g.x += dx / d * k; g.z += dz / d * k; g.move = 1; g.phase += dt * 3; }
        else this.marcher(g, act === 'crete' ? 3 : 2.2, dt, w, p);
      }
      else {
        g.arrive = true; g.move = lerp(g.move, 0, dt * 3); g.pose = T.pose;
        if (T.face) g.heading = turnToward(g.heading, Math.atan2(T.face[0] - g.x, T.face[1] - g.z), dt * 0.8);
        else if (T.r !== undefined) g.heading = turnToward(g.heading, T.r, dt * 0.8);
        if (act === 'crete' && C.crete) { const sun = Math.atan2(1, 0.2); g.heading = turnToward(g.heading, sun, dt * 0.5); }
      }
      g.y = w.heightAt(g.x, g.z);
      // il repousse ce qui est dans ses jambes
      const R = 1.25 * g.s / 4.4;
      if (dp < R + 0.35 && !p.underground && Math.abs(p.pos[1] - g.y) < 3) { const k = (R + 0.35) / (dp || 0.01); p.pos[0] = g.x + dxp * k; p.pos[2] = g.z + dzp * k; if (g.move > 0.3) { p.vel[0] += dxp / (dp || 1) * 3; p.vel[2] += dzp / (dp || 1) * 3; } }
      // il parle, lentement, quand on est là
      g.parleT -= dt;
      if (g.parleT <= 0 && dp < 24 && g.pose !== 'sol') {
        g.parleT = 30 + Math.random() * 35;
        const [t, sens] = act === 'crete' ? pick(GEANTS_AUBE) : pick(GEANTS_PHRASES);
        this.dire(g.nom, 'gorrain', t, sens, 7, true);
        sound.mumble && sound.mumble(0.3, 30, 0, 1.3);
      }
    }
    // aperçu à l'aube, sur les crêtes de l'est, loin du camp
    this.majSilhouette(dt, h);
  },
  marcher(g, sp, dt, w, p) {
    const nx = g.x + Math.sin(g.heading) * sp * dt, nz = g.z + Math.cos(g.heading) * sp * dt;
    if (w.heightAt(nx, nz) < w.waterLevel + 0.2) { g.move = 0; return; }
    g.x = nx; g.z = nz; g.move = 1;
    const ph0 = g.phase; g.phase += dt * sp * 2.4 / (g.s * 0.9);
    // chaque pas fait trembler le sol
    if (Math.floor(ph0 / Math.PI) !== Math.floor(g.phase / Math.PI)) {
      const d = Math.hypot(p.pos[0] - g.x, p.pos[2] - g.z);
      if (d < 90) { sound.pasGeant && sound.pasGeant(clamp(1.2 - d / 80, 0.15, 1)); if (d < 60 && !p.underground) game.shakeT = Math.max(game.shakeT, 0.35 * (1 - d / 60)); }
    }
  },
  majSilhouette(dt, h) {
    const S = this.silhouette, p = game.player, w = game.world, C = this.camp();
    if (S) {
      S.t += dt;
      S.x += Math.sin(S.heading) * 1.1 * dt; S.z += Math.cos(S.heading) * 1.1 * dt; S.y = w.heightAt(S.x, S.z); S.phase += dt * 1.1 * 2.4 / 4;
      const vu = (() => { const f = cameraBasis(p.yaw, p.pitch).f, dx = S.x - p.pos[0], dz = S.z - p.pos[2], d = Math.hypot(dx, dz) || 1; return (dx * f[0] + dz * f[2]) / d > 0.5; })();
      if (h >= 7.2 || S.t > 90 || (S.t > 25 && !vu)) this.silhouette = null;
      return;
    }
    if (!C || h < 5.1 || h > 6.4 || p.underground || this.silDay === farm.s.day) return;
    this.silDay = farm.s.day;
    if (Math.hypot(p.pos[0] - C.G.x, p.pos[2] - C.G.z) < 260 || p.pos[0] < 1300 || mulberry32(farm.s.seed * 31 + farm.s.day * 7)() > 0.35 || this.geants.every((g) => g.mort)) return;
    let best = null, bh = -1e9;
    for (let k = 0; k < 60; k++) {
      const a = -0.9 + Math.random() * 1.8 + Math.PI / 2, r = 150 + Math.random() * 110, x = p.pos[0] + Math.sin(a) * r, z = p.pos[2] + Math.cos(a) * r;
      if (!w.inside(x, z, 40)) continue;
      const hh = w.heightAt(x, z);
      if (hh > bh && hh > p.pos[1] + 12) { bh = hh; best = [x, z]; }
    }
    if (best) this.silhouette = { x: best[0], z: best[1], y: bh, heading: Math.random() < 0.5 ? 0.3 : Math.PI - 0.3, phase: 0, t: 0, rig: this.geants[0].rig, s: 4.4 };
  },
  // cadeau : du pain ou du miel
  donner(g) {
    const L = this.S(), hand = farm.s.hand;
    if (g.act === 'colere') return;
    const id = ['pain', 'miel', 'brioche', 'tarte'].includes(hand) && farm.count(hand) ? hand : ['pain', 'miel'].find((k) => farm.count(k));
    if (!id) { this.dire(g.nom, 'gorrain', 'mek hak , lokka', 'Petit homme, regarde.', 5, true); ui.subtitle('', '(Il vous regarde longtemps, la tête penchée. On dit qu’ils aiment le pain, et le miel.)', 4); return; }
    farm.take(id, 1); sound.pop && sound.pop();
    L.geants.dons++;
    const [t, sens] = pick(GEANTS_DON);
    g.pose = 'travail'; g.attackAnim = 0.4;
    setTimeout(() => this.dire(g.nom, 'gorrain', t, sens, 6, true), 900);
    // en échange : des mots, et parfois une chose trouvée là-haut
    const neufs = GEANTS_MOTS.filter((m) => LANGUES.gorrain.lex[m] && !savoir.motConnu('gorrain', m)).slice(0, 2);
    if (neufs.length) { savoir.apprendreMots('gorrain', neufs); setTimeout(() => ui.subtitle('', `(Il pose un doigt énorme sur le feu, puis sur le ciel, et répète lentement : « ${neufs.join(' », « ')} ». Vous retenez ${neufs.length > 1 ? 'ces mots' : 'ce mot'} : ${neufs.map((m) => LANGUES.gorrain.lex[m]).join(', ')}.)`, 7), 3500); }
    const cadeau = L.geants.dons === 1 ? 'gemme' : L.geants.dons % 3 === 0 ? pick(['fossile', 'plume_aigle', 'vieille_piece', 'os']) : null;
    if (cadeau && ITEMS[cadeau]) { setTimeout(() => { farm.give(cadeau, 1); play.flyer(cadeau, [g.x, g.y + 1.2, g.z], 1); ui.subtitle('', L.geants.dons === 1 ? '(Entre deux doigts grands comme des bûches, il vous tend une pierre brillante, grosse comme un poing.)' : '(Il ouvre la main : quelque chose de petit, trouvé là-haut, pour vous.)', 5); }, 5200); }
  },
  frapperGeant(g, dmg) {
    const L = this.S();
    if (g.mort) return;
    g.hp -= dmg; g.hurtT = 0.4; g.colere = game.time + 90;
    for (const o of this.geants) if (!o.mort && Math.hypot(o.x - g.x, o.z - g.z) < 80) o.colere = game.time + 60;
    L.geants.colere = farm.s.day + 2;
    sound.pasGeant && sound.pasGeant(1); sound.growl && sound.growl(1.5);
    if (g.hp <= 0) {
      g.mort = true; g.move = 0; game.shakeT = 1.5; sound.rumble && sound.rumble();
      L.geants.morts.push({ i: g.i, x: Math.round(g.x), z: Math.round(g.z), h: g.heading, day: farm.s.day }); L.geants.haine = true;
      ui.subtitle('', '(Le géant s’effondre. La terre tremble longtemps. Quelque part, très loin sous la montagne, quelque chose se retourne.)', 6);
    }
  },
  drawGeants(buf, sbuf, cam, t, fogEnd) {
    const max = Math.max(160, Math.min(900, fogEnd + 80));
    const L = this.geants.slice();
    if (this.silhouette) L.push(this.silhouette);
    for (const g of L) {
      const dx = g.x - cam[0], dz = g.z - cam[2];
      if (dx * dx + dz * dz > max * max) continue;
      const r = g.rig, s = g.s;
      if (g.mort || (g.act === 'dort' && g.arrive)) {
        poseHuman(r, { move: 0, t, lookY: 0 });
        const y = g.mort ? g.y + 0.3 * s / 4.4 : g.tgt && g.tgt.pose === 'lit' && g.arrive ? g.y + 1.2 : g.y + 0.2;
        const M = this._M || (this._M = new Float32Array(12)), R0 = this._R || (this._R = new Float32Array(12)), TR = this._T || (this._T = new Float32Array(12));
        m34Root(R0, g.x, y, g.z, g.heading, s); m34TR(TR, 0, 0, -0.9, Math.PI / 2, 0, 0); m34Mul(M, R0, TR); drawRigM(buf, r, M, g.hurtT > 0 ? FX_HI : 0);
        continue;
      }
      const assis = g.pose === 'assis' && !g.move;
      poseHuman(r, { move: g.move || 0, phase: g.phase || 0, t, sit: assis, work: g.pose === 'travail' || g.pose === 'table', attack: g.attackAnim > 0 ? g.attackAnim / 0.6 : 0, lookY: 0 });
      drawRig(buf, r, g.x, g.y - (assis ? 0.42 * s * 0.95 : 0), g.z, g.heading, s, g.hurtT > 0 ? FX_HI : 0);
      if (sbuf && dx * dx + dz * dz < 120 * 120) drawShadow(sbuf, g.x, g.y, g.z, 0.34 * s);
    }
  },
  raycast(o, d, maxDist) {
    let best = null;
    const dh = Math.hypot(d[0], d[2]) || 1e-6;
    for (const g of this.geants) {
      if (g.mort) continue;
      const cx = g.x - o[0], cz = g.z - o[2], tc = (cx * d[0] + cz * d[2]) / (dh * dh);
      if (tc < 0 || tc > maxDist) continue;
      const px = d[0] * tc - cx, pz = d[2] * tc - cz, R = 0.55 * g.s;
      if (px * px + pz * pz > R * R) continue;
      const y = o[1] + d[1] * tc;
      if (y < g.y - 0.2 || y > g.y + 1.9 * g.s) continue;
      if (!best || tc < best.t) best = { t: tc, s: g, p: [o[0] + d[0] * tc, y, o[2] + d[2] * tc] };
    }
    return best;
  },
};

// ============================================================================
//  GÉNÉRATION : aux Sources, un potager, une table commune, un fil à linge
//  (ajoutés après tout le reste, avec leur propre tirage)
// ============================================================================
function lieuxSourcesGen(w, seed) {
  const S = w.sources, P0 = (w.pools || []).find((p) => p.kind === 'bains');
  if (!S || !P0) return;
  const rnd = mulberry32(seed * 313 + 51), B = new Builder(w, rnd, new Uint8Array(w.W * w.W));
  const f = { x: S.x, y: S.y, z: S.z, r: P0.r || 0 };
  const occupe = (x, z, r) => w.props.some((q) => Math.hypot(q.x - x, q.z - z) < r) || w.nav.nodes.some((q) => Math.hypot(q.x - x, q.z - z) < r * 0.8) || (w.inter || []).some((i) => Math.hypot(i.x - x, i.z - z) < r);
  const essai = (id, cands, data, r) => {
    for (const [lx, lz, rr] of cands) for (const [jx, jz] of [[0, 0], [1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2], [2.2, 1], [-2.2, -1]]) {
      const [x, z] = B.toWorld(f, lx + jx, lz + jz);
      if (!pointFree(w, x, z, r) || occupe(x, z, r + 0.4) || w.heightAt(x, z) < w.waterLevel + 0.4) continue;
      const p = B.prop(id, x, w.heightAt(x, z), z, f.r + (rr || 0), data || null);
      return p;
    }
    return null;
  };
  const plus = { potager: [], table: null, linge: null, stele: null };
  for (const c of [[[-14.5, 0.5, Math.PI / 2]], [[-14.5, -3, Math.PI / 2]]]) { const p = essai('potager', c, { c: ['laitue', 'carotte', 'fraise', 'basilic', 'thym', 'haricot'], k: 0.85 }, 1.5); if (p) plus.potager.push({ x: p.x, z: p.z, r: p.r }); }
  const t = essai('table', [[-10.5, 12.5, 0], [10.5, 15, 0]], null, 1.0);
  if (t) {
    plus.table = { x: t.x, z: t.z, r: t.r, sieges: [] };
    for (const s of [-1, 1]) {
      const lx = s * 0.95, [x, z] = [t.x + Math.sin(t.r) * lx, t.z + Math.cos(t.r) * lx];
      const b = B.prop('banc', x, w.heightAt(x, z), z, t.r + (s > 0 ? Math.PI : 0));
      for (const k of [-0.45, 0.45]) plus.table.sieges.push({ x: b.x + Math.cos(t.r) * k, z: b.z - Math.sin(t.r) * k, r: t.r + (s > 0 ? Math.PI : 0), y: b.y + 0.02 });
    }
  }
  const l = essai('corde_linge', [[12.5, 13, 0], [-3, -13, 0]], null, 1.9);
  if (l) plus.linge = { x: l.x, z: l.z, r: l.r };
  const st = w.props.find((q) => q.id === 'stele' && q.data && q.data.ins === 'a_nains' && Math.hypot(q.x - S.x, q.z - S.z) < 40);
  if (st) plus.stele = { x: st.x, z: st.z, r: st.r };
  w.sourcesPlus = plus;
}
{
  const _gv = generateValley;
  generateValley = async function (seed, progress, gen) {
    const w = await _gv(seed, progress, gen);
    if (w.designed) { try { lieuxSourcesGen(w, w.seed || seed); } catch (e) { console.error(e); } }
    return w;
  };
}

// ============================================================================
//  BRANCHEMENTS
// ============================================================================
HOOKS.inter.bain = (it) => lieux.bain(it);
HOOKS.inter.fente_nains = (it) => lieux.frapper(it);
// le sifflet d'argent, soufflé devant la fente
HOOKS.primary.push((eye, basis, held, it, id) => {
  if (held || id !== 'sifflet_argent') return false;
  const N = game.world.nains, p = game.player;
  sound.siffletNains && sound.siffletNains(); play.cool = 1;
  if (N && N.door && Math.hypot(p.pos[0] - N.door[0], p.pos[2] - N.door[2]) < 6) { lieux.frappes = []; ui.subtitle('', '(Le sifflet chante trois fois, une fois, trois fois. Dans la roche, quelque chose répond.)', 3.5); setTimeout(() => lieux.ouvrir('sifflet'), 2600); }
  else ui.subtitle('', '(Un son aigu, en trois fois. Rien ne répond, ici.)', 2.5);
  return true;
});
// les géants se touchent (coups, flèches) comme les autres ombres ; on les approche (E) pour leur donner
{
  const _ray = strange.raycast.bind(strange);
  strange.raycast = function (o, d, max) {
    const a = _ray(o, d, max), b = lieux.raycast(o, d, a ? a.t : max);
    return b && (!a || b.t < a.t) ? b : a;
  };
  const _hit = strange.hit.bind(strange);
  strange.hit = function (e, dmg, from) { if (e && e.geant) return lieux.frapperGeant(e, dmg); return _hit(e, dmg, from); };
}
HOOKS.target.push((eye, f, cand) => {
  for (const g of lieux.geants) {
    if (g.mort || g.act === 'colere') continue;
    const dx = g.x - eye[0], dz = g.z - eye[2], d = Math.hypot(dx, dz);
    if (d > 5.5 || (dx * f[0] + dz * f[2]) / (d || 1) < 0.5) continue;
    cand({ kind: 'hook', use: () => lieux.donner(g) }, 2.9);
  }
});
HOOKS.update.push((dt, eye, basis, sky, playing) => {
  if (!farm.s || !game.world) return;
  lieux.majBain(dt);
  lieux.majFrappes();
  if (playing) lieux.majNains(dt);
  lieux.majGeants(dt);
  lieux.vapeur(dt, eye);
  if (lieux.oeil) lieux.oeil.t += dt;
  lieux.habT = (lieux.habT || 0) - dt;
  if (lieux.habT <= 0) { lieux.habT = 1; lieux.habits(); }
  // la chaleur des Sources tient au corps : le froid de la montagne ne mord pas
  if (BUFF.on('bains')) { vallee.coldAcc = 0; const p = game.player; if (p.hp < 100 && p.food > 20) p.hp = Math.min(100, p.hp + dt * 0.06); }
});
HOOKS.camera.push((dt, pos, yaw, pitch) => (lieux.baignade && !cine.on ? { pos: [pos[0], pos[1] - 1.05, pos[2]], yaw, pitch } : null));
HOOKS.draw.push((buf, sbuf, cam, t) => {
  lieux.drawGeants(buf, sbuf, cam, t, game.sky ? game.sky.fog[1] : 300);
  const O = lieux.oeil;
  if (O) { // un œil, dans la fente, qui cligne
    PE.buf = buf; PE.frame(O.x + Math.sin(O.face) * 0.23, O.y, O.z + Math.cos(O.face) * 0.23, O.face, 1);
    const ouvert = !(O.t > 1.3 && O.t < 1.45);
    PE.fl = FX_EMIT;
    if (ouvert) { PE.bx(0, -0.035, 0, 0.16, 0.07, 0.02, [0.95, 0.9, 0.8], 0); PE.fl = 0; PE.bx(0, -0.03, 0.012, 0.055, 0.06, 0.012, [0.12, 0.1, 0.06], 0); }
    PE.fl = 0;
  }
});
// pendant le bain : on ne marche pas (on sort avec E, ou en bougeant)
{
  const _pu = Player.prototype.update;
  Player.prototype.update = function (dt, w, c) {
    if (lieux.baignade && game.kind === 'farm') c = { fwd: 0, right: 0, up: false, down: false, sprint: false, onFall: null };
    return _pu.call(this, dt, w, c);
  };
}
HOOKS.load.push(() => {
  lieux.S();
  lieux.baignade = null; lieux.frappes = []; lieux.ouverture = false; lieux.oeil = null; lieux.silhouette = null; lieux.campW = null;
  lieux.initGeants();
  const w = game.world;
  // les deux petits bassins aussi
  if (w.pools) w.pools.filter((P) => P.kind === 'bains').forEach((P, i) => { if (i && !(w.inter || []).some((q) => q.id === 'bain_' + i)) w.inter.push({ kind: 'bain', id: 'bain_' + i, x: P.x, y: P.y + 0.2, z: P.z, name: 'Se baigner', data: {} }); });
  for (const n of npcs.list) n.habille = undefined;
  if (lieux.hooked) return;
  lieux.hooked = true;
  const _interact = game.interact.bind(game);
  game.interact = function () { if (lieux.baignade) { lieux.sortirBain(); return; } return _interact(); };
  // les nains : un pain, un mot
  const _options = talk.options.bind(talk);
  talk.options = function () {
    const n = this.n, opts = _options();
    if (!n || !farm.s || !['nain_ancien', 'nain_forgeronne'].includes(n.d.id) || !farm.count('pain')) return opts;
    const i = opts.findIndex((o) => o.act === 'bye');
    opts.splice(i >= 0 ? i : opts.length, 0, { label: n.d.id === 'nain_ancien' ? 'Un pain pour un mot (l’aëlin)' : 'Un pain pour un mot (la langue des pierres)', act: 'lieux:mot' });
    return opts;
  };
  const _choose = talk.choose.bind(talk);
  talk.choose = function (act) {
    const n = this.n;
    if (n && act === 'lieux:mot') {
      const lang = n.d.id === 'nain_ancien' ? 'aelin' : 'gorrain';
      const mot = NAINS_MOTS[lang].find((m) => LANGUES[lang].lex[m] && !savoir.motConnu(lang, m));
      if (!mot) return this.view(n.d.id === 'nain_ancien' ? 'Tu sais tout ce qu’un pain peut acheter. Le reste, les pierres te le diront.' : 'Plus de mots pour du pain. Apporte-moi du charbon, plutôt.', this.options());
      farm.take('pain', 1); savoir.apprendreMots(lang, [mot]); npcs.addAmitie(n, 6); sound.page && sound.page();
      return this.view(`(Il rompt le pain, le sent, et en mange un morceau.) « ${mot} ». ${LANGUES[lang].lex[mot].replace(/^./, (c) => c.toUpperCase())}. Répète. … Non. Encore. … Voilà.`, this.options());
    }
    return _choose(act);
  };
});
