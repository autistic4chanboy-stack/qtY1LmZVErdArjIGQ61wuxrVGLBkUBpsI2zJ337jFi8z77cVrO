// ============================================================================
//  MOINS DE TEXTE (N15) : ne pas décrire par écrit tout ce qui se passe.
//  Une couche posée sur les sous-titres (ui.subtitle) et le texte des fondus
//  (ui.fade). Chaque ligne est rangée dans une de ces sortes :
//    dialogue    quelqu'un parle (un nom), des paroles entre « » : toujours.
//    necessaire  ce qu'il faut savoir : danger et blessures, faim, état, quête,
//                argent et objets gagnés ou perdus, une condition (« Il faut une
//                pelle », « Pas sous l'orage »), une heure, une direction, une
//                règle dite une fois (penser.une), une cinématique, un long
//                texte de récit : toujours, mais jamais deux fois de suite à
//                quelques secondes d'écart.
//    descriptif  une « pensée » qui redit ce que le joueur voit, entend ou fait
//                déjà (« (La clé tourne.) », « (Vous laissez tomber.) », un son
//                mis en mots, une chose regardée de nouveau) : la PREMIÈRE fois
//                seulement (mémoire par ligne dans farm.s.texteN15), puis plus.
//    rappel      « c'est vide », « il n'y a plus rien », « personne ne répond » :
//                une fois par jour de jeu et par ligne (on l'a déjà constaté).
//    redondant   la liste de ce qu'on vient de ramasser, quand la colonne des
//                trouvailles (feed) vient de l'afficher : jamais.
//  Option « Moins de texte » (Options, section Jeu), cochée par défaut ;
//  décochée, tout s'affiche comme avant. Rien ne change pour ui.read, ui.choice,
//  les dialogues, les lettres, le carnet : seules ces deux portes sont filtrées.
//  API : texte.classe(nom, ligne, durée) ; texte.regler(bool) ; texte.actif() ;
//        texte.stats (compte de la session) ; texte.tus (les dernières lignes tues).
//  État : farm.s.texteN15 = { 'ligne': jour où elle a été montrée }.
// ============================================================================
if (settings.moinsTexte === undefined) settings.moinsTexte = true;

// gestes et confirmations qui se voient déjà : une fois, même s'ils ressemblent à une condition
const N15_DESC = [
  /^\(Vous laissez tomber\.\)$/, /^\(La clé tourne\.\)$/, /^\(Une cachette…\)$/, /^\(Le pont est baissé\.\)$/,
  /^\(La grille est levée\.\)$/, /^\(La corde est neuve\.\)$/, /^\(La charrette est attelée\.\)$/, /^\(C’est de niveau\.\)$/,
  /^\(Il s’est décroché\.( Encore\.)?\)$/, /^\(Un grincement à réveiller les morts\.\)$/, /^\(Elle se refermera derrière vous\.\)$/,
  /^\(Vous posez un caillou au pied du cairn, avec les autres\.\)$/, /^\(Vous écrivez votre nom, au crayon, sous les autres\.\)$/,
  /^\(Le cadenas cède\. Le coffre est vide\.\)$/, /^\(La terre boit l’engrais\.\)$/,
];
// ce qu'il faut savoir (une ligne entre parenthèses qui n'est dans aucune de ces familles est descriptive)
const N15_NEC = [
  // chiffres (heure, prix, compte), argent, objets, savoir, quêtes
  /\d/, /pièce|bourse|dette|loyer|payer|paie|coût|gratuit/i,
  /Nouvelle|carnet|grimoire|recette|légende|quête|lettre|noté|est à vous|reviennent|Vous trouvez|Vous gagnez|Vous reprenez|dans votre (main|poche|paume|sacoche)|vous met dans la main|Il vous manque|Il manque des/i,
  // une condition, un refus, une limite
  /Il (vous |lui )?fau(t|drait)|faudra|Il manque|n’avez|ne pouvez|^\(Pas\b|\bpas (encore|ici|maintenant|à cette|avant|si souvent|le jour|en plein|cette fois|sous|pendant|avec|sans|tout à fait|d’ici|aujourd’hui)/i,
  /^\(Trop\b|trop (sombre|tard|lourd|haut|étroit|dur|près|humide|en pente|fragiles?)|impossible|refuse|résiste|ne bouge (pas|plus)|fermée? à clé|Fermé|scellé|cadenas|verrou|Dételez|Videz|\bE pour\b/i,
  /\bvides?\b|est pleine?|déjà|par jour|une fois par|aujourd’hui|demain|ce matin|ce soir|cette nuit|Revenez|l’heure|^\(Il n’y a (plus )?rien|^\(Rien\.|plus rien à|Rien (ici|encore|à prendre|qui)|n’est pas (à vous|là|encore)|Ce n’est pas|^\(On ne|ne s’ouvre|Avec cette jambe|Sans crochets/i,
  /^\(Personne|Personne ne (vous|réclamera)|La tête se|^\(Rien à vous|Aucune clé|ni poignée|tient encore|trop bu|crâne|n’est plus dans|Rien ne passe|nerveux|filon|On vous répond|plus mince/,
  // ce qui empêche de bâtir, de poser, de creuser ; l'outil qu'il faut ; une règle
  /gêne|couperait|Reculez|emprise|touche un autre|dans le chemin|se pose|ne pose|abîmeriez|s’effondre|s’éboule|posé là|poussent là|pioche|hache|pelle|houe|sans fumée|ne se laisse pas|ne ferme plus|ressorts|Appuyez|à quelqu’un|pas votre|ne savez pas|n’osez pas|L’alchimiste|cuit encore|Rien pour|niche|sur une tombe|Ni ce qui/i,
  // le savoir, le calendrier, les jeux
  /savez désormais|retenez|Vous notez|oublierez pas|noces|rendez-vous|points|classement|concours|Quille|vous tend|savez maintenant|illisible|lit plus rien|Le pli est pour|Primedi|Ferdi|Marchedi|Lavedi|Nahédi|Chassedi|Pêchedi|Orédi|Foiredi|Veilledi|Chômedi|Vorndi/i,
  // l'état du corps (ivresse, sommeil), les menaces sur la ferme, l'orage
  /ivresse|gueule de bois|mal de tête|fatigue|sommeil|bâill|rôde|fouille la terre|ne leur fait plus peur|ça se passe mal|cheveux se dressent|soufre/i,
  // danger, blessures, corps
  /sang|saign|jambe|poison|brûl|morsure|mord|piqûre|piège|tiré dessus|balle|cassé|bless|faim|soif|froid à|Le froid|vos doigts|fièvre|vomi|crampe|ventre|Vite|feu a pris|déborde|L’eau monte|sirène|Brèche|Aïe|sangsue|orage|La lanterne|huile|bougie|La flamme baisse|cartouche|on vous (cherche|a)|vous a vu|Libre|cachot|geôlier|effet|soleil tape|nuit est devenue/i,
  // une direction, une mesure (les instruments, les indices)
  /\bnord\b|\bsud\b|ouest|[ld]’est\b|à gauche|à droite|du côté|aiguille|encoches/i,
];

// ce qu'on a déjà constaté (vide, plus rien, personne) : une fois par jour
const N15_RAPPEL = /^\(Vide\b|^\(Il n’y a (plus )?rien|^\(Rien\.|plus rien à prendre|Personne ne répond|^\(Ses poches sont vides|besace est vide|cachette est vide|^\(Des poches vides/;

const texte = {
  stats: { appels: {}, tus: {} },
  tus: [],
  _vu: {},          // ligne → dernier affichage (temps réel, pour les doublons rapprochés)
  _passe: 0,        // >0 pendant penser.une / penser.pas (déjà décidés à la main)
  _feedT: -1e9,     // la colonne des trouvailles vient-elle d'afficher quelque chose ?
  _etats: null,
  actif() { return settings.moinsTexte !== false; },
  regler(v) {
    settings.moinsTexte = !!v;
    try { store.set('prairie.settings', settings); } catch (e) { /* stockage indisponible */ }
    const c = $('#o-moinstexte'); if (c) c.checked = !!v;
  },
  S() {
    const s = farm.s;
    if (!s) return null;
    if (!s.texteN15 || typeof s.texteN15 !== 'object') s.texteN15 = {};
    return s.texteN15;
  },
  cle(t) { return String(t || '').replace(/\s+/g, ' ').trim(); },
  // les lignes d'état du personnage (humeur, faim, maux, ivresse) : ce sont les seules jauges du jeu
  etats() {
    if (this._etats) return this._etats;
    const E = new Set();
    const ramasser = (v, d) => {
      if (d > 5 || v == null) return;
      if (typeof v === 'string') { if (v.startsWith('(')) E.add(this.cle(v)); return; }
      if (typeof v === 'object') for (const k in v) ramasser(v[k], d + 1);
    };
    for (const nom of ['ESPRIT_PENSEES', 'FAIM_PHRASES', 'MAL_NUIT', 'EFFETS', 'ALIMENTS_EFFETS', 'ALCOOL_PALIERS', 'FATIGUE_PENSEES', 'FATIGUE_ENTREE']) {
      try { ramasser(new Function(`return typeof ${nom} !== 'undefined' ? ${nom} : null;`)(), 0); } catch (e) { /* table absente */ }
    }
    return (this._etats = E);
  },
  classe(nom, ligne, dur) {
    const t = this.cle(ligne);
    if (nom) return 'dialogue';
    if (!t) return 'necessaire';
    if (!t.startsWith('(')) return t.startsWith('«') ? 'dialogue' : 'necessaire';
    if (/^\((Vous trouvez|Vos doigts ressortent de la poche|Vous reprenez vos affaires|Vos affaires reviennent dans la sacoche) ?:/.test(t)) return 'redondant';
    if (N15_DESC.some((r) => r.test(t))) return 'descriptif';
    if (t.includes('«')) return 'necessaire';
    if ((dur || 0) >= 5) return 'necessaire';
    if (this.etats().has(t)) return 'necessaire';
    if (N15_NEC.some((r) => r.test(t))) return N15_RAPPEL.test(t) ? 'rappel' : 'necessaire';
    return 'descriptif';
  },
  // décide si la ligne se montre ; compte
  montrer(nom, ligne, dur) {
    let c = this.classe(nom, ligne, dur);
    if (this._passe > 0 || (typeof cine !== 'undefined' && cine.on)) c = c === 'dialogue' ? c : 'necessaire';
    const A = this.stats.appels; A[c] = (A[c] || 0) + 1;
    if (!this.actif() || c === 'dialogue') return true;
    const k = this.cle(ligne), now = performance.now() / 1000;
    let ok = true;
    if (c === 'redondant') ok = now - this._feedT > 1.5;
    else if (this._vu[k] !== undefined && now - this._vu[k] < Math.max(6, (dur || 3) + 1)) ok = false;   // la même, encore à l'écran
    else if (c === 'rappel') { const S = this.S(), j = (farm.s && farm.s.day) || 1; if (S && S[k] === j) ok = false; else if (S) S[k] = j; }
    else if (c === 'descriptif') { const S = this.S(); if (S && S[k]) ok = false; else if (S) S[k] = farm.s.day || 1; }
    if (ok) { this._vu[k] = now; return true; }
    const T = this.stats.tus; T[c] = (T[c] || 0) + 1;
    this.tus.push(k); if (this.tus.length > 60) this.tus.shift();
    return false;
  },

  // ------------------------------------------------------------- la case dans les Options (section Jeu)
  caseOptions() {
    const box = $('#dlg-options .cols') || $('#dlg-options .box');
    if (!box) return;
    let c = $('#o-moinstexte');
    if (!c) {
      const lab = document.createElement('label');
      lab.className = 'row';
      lab.innerHTML = '<input type="checkbox" id="o-moinstexte"> Moins de texte';
      lab.title = 'Les pensées qui décrivent ce qui se voit déjà ne s’affichent que la première fois. Les paroles et le nécessaire restent.';
      const apres = ($('#o-wiki') && $('#o-wiki').closest('label')) || ($('#o-subs') && $('#o-subs').closest('label'));
      if (apres && apres.parentNode) apres.parentNode.insertBefore(lab, apres.nextSibling); else box.appendChild(lab);
      c = $('#o-moinstexte');
      c.onchange = () => this.regler(c.checked);
    }
    c.checked = this.actif();
  },
};

// la section « Jeu » des Options de M15
try { if (typeof menus !== 'undefined' && menus.SECTIONS) { const J = menus.SECTIONS.find((x) => x[0] === 'Jeu'); if (J && !J[1].includes('o-moinstexte')) J[1].push('o-moinstexte'); } } catch (e) { /* menus absents */ }

// les pensées déjà décidées à la main (une fois par vie, espacées) passent telles quelles
if (typeof penser !== 'undefined') {
  for (const m of ['une', 'pas']) {
    const f = penser[m];
    if (typeof f === 'function') penser[m] = function (...a) { texte._passe++; try { return f.apply(this, a); } finally { texte._passe--; } };
  }
}
// la colonne des trouvailles : retenir quand elle vient de montrer quelque chose
if (typeof feed !== 'undefined') {
  const _push = feed.push;
  feed.push = function (id, n, note) {
    if (n > 0 && !ui.panel && game.started && game.mode === 'play' && !game.dying) texte._feedT = performance.now() / 1000;
    return _push.call(this, id, n, note);
  };
}
// les deux portes, posées en dernier (après la traduction, qui emballe ui.subtitle plus loin dans le fichier) :
// le tri se fait sur le texte français d'origine
Promise.resolve().then(() => {
  const _sub = ui.subtitle;
  ui.subtitle = function (nom, ligne, dur) {
    if (!settings.subs) return _sub.call(this, nom, ligne, dur);
    let ok = true;
    try { ok = texte.montrer(nom, ligne, dur); } catch (e) { console.error(e); }
    if (ok) return _sub.call(this, nom, ligne, dur);
  };
  const _fade = ui.fade;
  ui.fade = function (on, t, ms) {
    if (on && t && texte.actif() && farm.s && game.started) {
      try {
        const c = texte.classe('', '(' + t + ')', 0);
        if (c === 'descriptif') { const S = texte.S(), k = 'fondu:' + texte.cle(t); if (S && S[k]) t = ''; else if (S) S[k] = farm.s.day || 1; }
      } catch (e) { console.error(e); }
    }
    return _fade.call(this, on, t, ms);
  };
});

HOOKS.load.push(() => { try { texte.caseOptions(); } catch (e) { console.error(e); } });
try { texte.caseOptions(); } catch (e) { /* la page n'est pas encore là */ }
