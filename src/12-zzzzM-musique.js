// ============================================================================
//  LA MUSIQUE (agent M) — 3. DANS LE JEU
//  De temps en temps, pas tout le temps : un morceau, puis de longues minutes
//  de silence, au hasard. Le morceau dépend de l'endroit où l'on est quand il
//  commence (les prés et la ferme, la forêt et les bouleaux, le marais et le
//  lac, la lande et les hauteurs, la ville et le hameau, la nuit, le Dessous,
//  et les autres mondes : bonbons, Ténèbres, Enfers, la cité vaisseau ; rien
//  dans le cauchemar). Il va jusqu'au bout, même si l'on change de pré ; il
//  s'efface en fondu si l'on change de monde, si la peur monte, si la nuit
//  devient noire ou rouge, si le violoneux joue, ou si on la coupe.
//  Réglages (Options) : « Musique » (case) et son volume ; enregistrés dans
//  prairie.settings (settings.musique, settings.musiqueVol). Rien n'est
//  sauvegardé dans la partie.
//  Le son : un bus à part (MusJeu → bus musique → sous le volume général),
//  très bas. Les notes sont programmées à l'avance sur l'horloge audio, par
//  une minuterie toutes les 100 ms (rien à chaque image).
//  Essais : musique.jouer(id), musique.arreter(), musique.etat(),
//  musique.liste(groupe), musique.suivant() (le prochain morceau, tout de suite).
// ============================================================================

// ---------------------------------------------------------------- les réglages
DEFAULT_SETTINGS.musique = true;
DEFAULT_SETTINGS.musiqueVol = 0.5;
if (settings.musique === undefined) settings.musique = true;
if (settings.musiqueVol === undefined) settings.musiqueVol = 0.5;

// les groupes : biome → groupe (de jour) ; la nuit, le Dessous et les mondes à part ont les leurs
const MUS_BIOME = { plaine: 'pres', ferme: 'pres', foret: 'foret', bouleaux: 'foret', marais: 'eau', lac: 'eau', lande: 'lande', hauteurs: 'lande', ville: 'village' };
const MUS_MONDES = { bonbons: 'bonbons', tenebres: 'tenebres', enfers: 'enfers', vaisseau: 'vaisseau' }; // (pas le cauchemar)
// niveau du bus quand le curseur est au maximum (la musique reste sous l'ambiance)
const MUS_NIVEAU = 0.55;
// silences (secondes) : avant le premier morceau, entre deux morceaux, en arrivant dans un autre monde
const MUS_SILENCE = { premier: [50, 130], entre: [270, 660], monde: [25, 75], reprise: [30, 90] };

const musique = {
  bus: null, jeu: null, id: null, groupe: null, cle: null, phase: 'repos', prochain: -1, finT: -1e9, debutT: 0,
  sacs: {}, recents: [], timer: null, zoneT: 0, z: null, cleVue: null, seq: 0, err: false,

  // ------------------------------------------------ le bus (créé quand le son du jeu l'est)
  sortie() {
    if (this.bus || !sound.ctx) return this.bus;
    const c = sound.ctx;
    this.bus = c.createGain();
    this.bus.gain.value = this.volume();
    this.bus.connect(sound.trim || sound.lim || sound.vol || c.destination);
    return this.bus;
  },
  volume() { return settings.musique === false ? 0 : MUS_NIVEAU * Math.pow(clamp(+settings.musiqueVol || 0, 0, 1), 1.5); },
  actif() { return settings.musique !== false && (+settings.musiqueVol || 0) > 0.001; },
  // le curseur et la case ont bougé
  appliquer() {
    if (!sound.ctx || !this.bus) return;
    const t = sound.ctx.currentTime;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setTargetAtTime(this.volume(), t, 0.25);
    if (!this.actif()) { if (this.jeu) this.couper(2.5); this.prochain = -1; }
    else if (!this.jeu && this.phase === 'repos' && (this.prochain < 0 || this.prochain - t > MUS_SILENCE.reprise[1])) this.prochain = t + this.tirer(MUS_SILENCE.reprise);
  },
  tirer([a, b]) { return a + Math.random() * (b - a); },

  // ------------------------------------------------ où l'on est : { g: groupe, cle: monde } ou null (silence)
  zone() {
    const G = typeof game !== 'undefined' ? game : null;
    if (!G || !G.world || !G.player || G.kind !== 'farm' || G.dying) return null;
    const M = typeof mondes !== 'undefined' && mondes.actuel ? mondes.actuel() : null;
    if (M) return MUS_MONDES[M] ? { g: MUS_MONDES[M], cle: 'monde:' + M } : null;
    if (typeof strange !== 'undefined') {
      if (strange.inEnvers() || strange.redNight() || strange.fear > 0.15 || strange.freezeT > 0) return null;
    }
    if (typeof slender !== 'undefined' && slender.actif && slender.actif()) return null;
    if (typeof evenements !== 'undefined' && evenements.noirK > 0.3) return null;
    if (typeof activites !== 'undefined' && activites.musique) return null; // le violoneux joue
    const p = G.player;
    if ((typeof souterrain !== 'undefined' && souterrain.dedans && souterrain.dedans()) || p.underground) return { g: 'dessous', cle: 'dessous' };
    let h = 12;
    try { h = npcs.hour(); } catch (e) { /* rien */ }
    if (h >= 21 || h < 5) return { g: 'nuit', cle: 'vallee' };
    let g = MUS_BIOME[G.biomeAt(p.pos)] || 'pres';
    const w = G.world, H = w.lm && w.lm.hameau;
    if (H && Math.hypot(p.pos[0] - H.x, p.pos[2] - H.z) < (H.r || 60) + 40) g = 'village';
    return { g, cle: 'vallee' };
  },

  // ------------------------------------------------ le choix : un sac par groupe (tous joués avant qu'un revienne)
  choisir(g) {
    const ids = MUSIQUE.ordre.filter((k) => { const d = MUSIQUE.morceaux[k]; return d.groupe === g || (d.aussi || []).includes(g); });
    if (!ids.length) return null;
    let sac = this.sacs[g];
    if (!sac || !sac.length) {
      sac = ids.slice().sort(() => Math.random() - 0.5);
      // pas deux fois de suite le même morceau
      if (sac.length > 1 && sac[0] === this.recents[this.recents.length - 1]) sac.push(sac.shift());
      this.sacs[g] = sac;
    }
    const id = sac.shift();
    this.recents.push(id);
    if (this.recents.length > 6) this.recents.shift();
    return id;
  },

  // ------------------------------------------------ jouer un morceau (promesse : il a commencé)
  async lancer(id, groupe, cle, force) {
    const def = MUSIQUE.morceaux[id];
    if (!def || !sound.ctx) return false;
    const seq = ++this.seq;
    this.phase = 'prepare'; this.id = id; this.groupe = groupe; this.cle = cle; this.force = !!force; this.autreT = 0;
    const C = MUSIQUE.compiler(id);
    try { await MUS_BANQUE.preparer(C, sound.ctx); } catch (e) { console.error('musique : préparation', e); this.phase = 'repos'; this.prochain = sound.ctx.currentTime + 120; return false; }
    if (seq !== this.seq || this.phase !== 'prepare') return false; // annulé entre-temps
    const c = sound.ctx, J = new MusJeu(c, this.sortie(), def, C);
    J.demarrer(c.currentTime + 0.35);
    J.pompe(c.currentTime + 1.6);
    this.jeu = J; this.phase = 'joue'; this.debutT = c.currentTime;
    return true;
  },
  // fondu puis silence ; le prochain morceau après un long silence (ou plus tôt : « silence » [a, b])
  couper(fondu, silence) {
    const J = this.jeu;
    this.seq++;
    if (J) { try { J.arreter(sound.ctx.currentTime, fondu || 3); } catch (e) { /* déjà */ } }
    this.jeu = null; this.phase = 'repos'; this.id = null; this.force = false;
    if (sound.ctx) { this.finT = sound.ctx.currentTime; this.prochain = this.finT + this.tirer(silence || MUS_SILENCE.entre); }
  },

  // ------------------------------------------------ toutes les 100 ms
  tic() {
    const c = sound.ctx;
    if (!c || c.state !== 'running') return;
    const now = c.currentTime;
    // le morceau en cours : programmer la suite, puis le laisser s'éteindre
    if (this.jeu) {
      this.jeu.pompe(now + 1.6);
      if (this.jeu.fini && now > this.jeu.t0 + this.jeu.longueur) {
        const J = this.jeu;
        this.jeu = null; this.phase = 'repos'; this.id = null; this.force = false;
        setTimeout(() => J.debrancher(), 100);
        this.finT = now; this.prochain = now + this.tirer(MUS_SILENCE.entre);
      }
    }
    // la zone : deux fois par seconde
    this.zoneT -= 0.1;
    if (this.zoneT > 0) return;
    this.zoneT = 0.5;
    const z = this.z = this.zone(), cle = z ? z.cle : null, avant = this.cleVue;
    this.cleVue = cle;
    // un morceau en cours (ou en préparation) : coupé tout de suite si on la coupe ou si l'on quitte l'onglet ; en
    // fondu si l'endroit ne lui va plus depuis quelques secondes (un autre monde, la peur, la nuit noire… — une cave
    // où l'on descend un instant ne l'interrompt pas)
    if (this.jeu || this.phase === 'prepare') {
      if (!this.actif() || document.hidden) { this.couper(2.5); return; }
      if (this.force || (z && z.cle === this.cle)) { this.autreT = 0; return; }
      this.autreT = (this.autreT || 0) + 0.5;
      if (this.autreT < 4) return;
      // ailleurs : la musique de l'autre monde viendra bientôt ; sinon un long silence
      this.couper(4, z && /^monde:/.test(z.cle) ? MUS_SILENCE.monde : z ? MUS_SILENCE.reprise.map((x) => x * 3) : MUS_SILENCE.entre);
      return;
    }
    // on arrive dans un autre monde (bonbons, Ténèbres, Enfers, la cité) : sa musique sans trop attendre
    if (cle && avant && avant !== cle && /^monde:/.test(cle) && now - this.finT > 60 && this.actif()) {
      const t = now + this.tirer(MUS_SILENCE.monde);
      if (this.prochain < 0 || t < this.prochain) this.prochain = t;
    }
    if (this.phase !== 'repos' || !this.actif() || !z) return;
    if (this.prochain < 0) { this.prochain = now + this.tirer(MUS_SILENCE.premier); return; }
    if (now < this.prochain || document.hidden) return;
    if (typeof game === 'undefined' || game.mode !== 'play' || (typeof cine !== 'undefined' && cine.on)) return;
    const id = this.choisir(z.g);
    if (!id) { this.prochain = now + 60; return; }
    this.lancer(id, z.g, z.cle);
  },
  demarrer() {
    if (this.timer) return;
    this.timer = setInterval(() => { try { this.tic(); } catch (e) { if (!this.err) { this.err = true; console.error('musique', e); } } }, 100);
  },

  // ------------------------------------------------ pour les essais
  // jouer(id) : ce morceau tout de suite, où que l'on soit (il ne s'interrompt que si on coupe la musique)
  jouer(id) {
    if (!MUSIQUE.morceaux[id]) return Promise.resolve(false);
    sound.init();
    this.demarrer();
    if (this.jeu) this.couper(1);
    const z = this.zone();
    return this.lancer(id, MUSIQUE.morceaux[id].groupe, z ? z.cle : null, true);
  },
  arreter() { this.couper(1.5); },
  suivant() { if (this.jeu || this.phase === 'prepare') this.couper(1); this.prochain = sound.ctx ? sound.ctx.currentTime : 0; },
  liste(g) { return MUSIQUE.ordre.filter((k) => !g || MUSIQUE.morceaux[k].groupe === g); },
  etat() {
    const c = sound.ctx, now = c ? c.currentTime : 0;
    return { phase: this.phase, id: this.id, groupe: this.groupe, zone: this.z && this.z.g, depuis: this.jeu ? +(now - this.debutT).toFixed(1) : 0, duree: this.jeu ? +this.jeu.longueur.toFixed(1) : 0, prochainDans: this.prochain >= 0 ? +(this.prochain - now).toFixed(1) : null, volume: +this.volume().toFixed(3) };
  },
};

// ---------------------------------------------------------------- les Options : la case et le curseur
{
  const _init = ui.init.bind(ui);
  ui.init = function () {
    const r = _init();
    try {
      const amb = $('#o-amb'), lab = amb && amb.closest('label');
      if (lab && !$('#o-musique-vol')) {
        const l = document.createElement('label');
        l.innerHTML = 'Musique <output id="o-musique-vol-v"></output><input type="range" id="o-musique-vol" min="0" max="1" step="0.05">';
        lab.after(l);
        const sub = $('#o-subs'), labSub = sub && sub.closest('label');
        const l2 = document.createElement('label');
        l2.className = 'row';
        l2.innerHTML = '<input type="checkbox" id="o-musique"> Musique de temps en temps';
        if (labSub) labSub.before(l2); else l.after(l2);
        const vol = $('#o-musique-vol'), out = $('#o-musique-vol-v'), box = $('#o-musique');
        const maj = () => { out.textContent = Math.round(settings.musiqueVol * 100) + ' %'; };
        vol.value = settings.musiqueVol; box.checked = settings.musique !== false; maj();
        vol.oninput = vol.onchange = () => { settings.musiqueVol = +vol.value; maj(); store.set('prairie.settings', settings); game.applySettings(); };
        box.onchange = () => { settings.musique = box.checked; store.set('prairie.settings', settings); game.applySettings(); };
      }
      // le réglage passe par game.applySettings (comme les autres) ; la musique se met en route avec le son
      if (!game._musApply) {
        game._musApply = true;
        const _apply = game.applySettings.bind(game);
        game.applySettings = function () { const r2 = _apply(); try { musique.appliquer(); } catch (e) { /* rien */ } return r2; };
      }
      musique.demarrer();
    } catch (e) { console.error('musique : options', e); }
    return r;
  };
}

// ---------------------------------------------------------------- la boîte à musique des mondes en surimpression se tait pendant un morceau
if (typeof MSON !== 'undefined' && MSON.melodie) {
  const _mel = MSON.melodie;
  MSON.melodie = function (dt, mode) {
    if (musique.jeu && (mode === 'bonbons' || mode === 'tenebres')) {
      if (this.mel && sound.ctx) this.mel.next = sound.ctx.currentTime + 1.5;
      return;
    }
    return _mel.call(this, dt, mode);
  };
}
