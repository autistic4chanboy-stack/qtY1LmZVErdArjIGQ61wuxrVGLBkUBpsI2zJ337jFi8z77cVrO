// Vague de traduction : ce qui n'est pas encore traduit, découpé en lots ; puis fusion des traductions.
//
//   node tools/i18n-delta.js lots <dossier> [--taille 28000] [--force]
//       Ré-extrait les textes des sources (tools/i18n-extract.js), retire ceux qui ont déjà une traduction
//       (src/14-i18n-en.js) et écrit dans <dossier> (créé au besoin) :
//         manifest.json    { clé: texte français } pour toute la vague (clés n0, n1… textes ; m0, m1… gabarits {0})
//         in_00.json, in_01.json…   les lots (~28 Ko de français chacun, textes voisins dans les sources)
//         glossaire_XX.json          noms déjà traduits ailleurs dans le jeu et présents dans le lot (à réutiliser)
//         INSTRUCTIONS.md            consignes pour les traducteurs (format, style, glossaire)
//         origine.json               { clé: 'fichier.js:ligne' } d'où vient chaque texte (pour retrouver le contexte)
//       Un traducteur par lot : il lit INSTRUCTIONS.md, in_XX.json (et glossaire_XX.json) et écrit out_XX.json
//       (mêmes clés, texte anglais) dans le même dossier. Refuse d'écraser un dossier qui contient déjà des
//       out_XX.json (vague pas encore fusionnée), sauf --force.
//   node tools/i18n-delta.js fusion <dossier>…   (ou un fichier { français: anglais } tout fait)
//       Vérifie les out_XX.json (clés, jetons {0}/{fermier}…, lignes), les ajoute à src/14-i18n-en.js (une
//       traduction nouvelle remplace l'ancienne), et dit ce qui manque encore (lots non rendus, clés rejetées,
//       textes des sources toujours sans traduction). Même mécanisme que node tools/i18n-build.js <dossier>.
//   node tools/i18n-delta.js etat [--liste]
//       Couverture des sources actuelles (sans rien écrire) ; --liste : les textes manquants et leur fichier:ligne.
//
// Vague finale (après la fusion des branches) :
//   node tools/i18n-delta.js lots /chemin/tr3          -> N lots
//   (un traducteur par in_XX.json -> out_XX.json)
//   node tools/i18n-delta.js fusion /chemin/tr3        -> src/14-i18n-en.js mis à jour
//   node build.js --check && node --check .check.js    -> Prairie.html ; commiter src/14-i18n-en.js
const fs = require('fs');
const path = require('path');
const B = require('./i18n-build.js');
const { extract } = require('./i18n-extract.js');

const INSTRUCTIONS = `# Translating "Prairie" (French → English)

"Prairie — La vieille ferme" is a first-person retro farming game with slow-burn folk horror, set in an
invented 19th-century French valley. You translate its texts (dialogue, notes, legends, item names,
menus) from French into natural, idiomatic English.

## Input / output

- Input: a JSON object \`{ "id": "French text", ... }\` (file \`in_XX.json\`).
- Output: a JSON object with EXACTLY the same keys, \`{ "id": "English text", ... }\`, written to \`out_XX.json\`
  in the same folder. Every key must be present; values are strings.
- \`glossaire_XX.json\` (if present) lists names and short labels ALREADY translated elsewhere in the game
  (French → English) that occur in your batch: reuse exactly the same English for them.
- Check your file parses: \`node -e "const a=require('./in_XX.json'),b=require('./out_XX.json');for(const k in a)if(typeof b[k]!=='string')throw k;console.log('ok',Object.keys(b).length)"\`
  (run it from the folder that holds the files, replacing XX).
- Write the file with a script or the Write tool; do not print the whole translation in your reply.
  Reply only with a one-line confirmation.

## Must keep exactly (never translate, never drop, never add)

- Placeholders in braces: \`{0}\`, \`{1}\`… and \`{fermier}\`, \`{nom}\`, \`{prenom}\`, \`{ville}\`, \`{hameau}\`, \`{victime}\`,
  \`{objet}\`, \`{jour}\`, \`{npc:xxx}\`, \`{lieu:xxx}\` (the part after the colon is an identifier). They may move
  inside the sentence if English word order needs it. \`{fermier}\` becomes either the farmer's first name or
  "the new farmer" at run time, so write sentences that work with both ("Ah, {fermier}!").
  A text whose placeholders differ from the French is rejected.
- Newlines (\`\\n\`) and blank lines: keep the same line structure (same number of lines).
- HTML-like tags if any appear.
- Proper names of people (Théodore, Anselme Varenne, Maître Delorme…), of the town Valbrume and the hamlet
  Clairpré, the invented day names (Primedi, Ferdi, Marchedi, Lavedi, Nahédi, Chassedi, Pêchedi, Orédi,
  Foiredi, Veilledi, Chômedi, Vorndi), the word "Aëlim", and words in invented languages (they look like
  gibberish: keep them as they are).
- A text that is already English, a code-like token, or a proper noun alone: copy it unchanged.

## Style

- Rural, slightly old-fashioned, warm and wry; the horror is understated. Keep each character's voice
  (the pompous mayor, the gruff blacksmith, the child…). Keep sentence length and rhythm close to the French.
- English punctuation: no space before \`! ? : ;\`, curly quotes “ ” instead of « », em dashes kept.
  Keep parentheses used for narration, e.g. "(The door creaks.)".
- Currency "pièces" = "coins". "fermier / fermière" = "farmer". "le maire" = "the mayor".
- Short UI labels stay short (buttons, tabs, item names). Item names: natural English names
  ("Ail des ours" → "Wild garlic", "Hache de fer" → "Iron axe", "Pain" → "Bread").
- Single capitalised words that are item/animal/plant names: translate ("Carpe" → "Carp").
- A fragment (a text that starts or ends in the middle of a sentence, e.g. "(il vous faut {0})", ", pas loin de {0}")
  is translated as a fragment, keeping its leading/trailing punctuation.

## Glossary (use consistently)

- la vieille ferme → the old farm · la ville / le hameau → the town / the hamlet
- l’Envers → the Underside · Ceux d’En-Dessous / ceux d’en dessous → Those Below
- la Vieille Foi → the Old Faith · les Anciens → the Ancients · la Mère (des Moissons) → the (Harvest) Mother
- la Dame du Lac / la Dame → the Lady of the Lake / the Lady · le Cerf Blanc → the White Stag
- le Cornu → the Horned One · les Pâles → the Pale Ones · le Veilleur → the Watcher
- nuit(s) rouge(s) → red night(s) · les Treize → the Thirteen · la Bête des Combes → the Beast of the Combes
- la Combe Perdue → the Lost Combe · le lac Noir → Black Lake · les Monts Blancs → the White Peaks
- le col des Treize → the Pass of the Thirteen · les Galeries → the Galleries · le refuge du col → the pass refuge
- le glacier des Treize → the Glacier of the Thirteen · le lac gelé → the frozen lake
- l’homme au masque / le tueur masqué → the masked man / the masked killer
- le garde (des ponts) → the (bridge) warden · les ponts-levis → the drawbridges · les douves → the moat
- la guérisseuse → the healer · l’éleveuse → the stockbreeder · la grainetière → the seed merchant
- la postière → the postmistress · l’aubergiste → the innkeeper · le curé / le père X → the priest / Father X
- l’alambic → the still · le grimoire → the grimoire · le carnet → the notebook · la sacoche → the satchel
- l’établi → the workbench · le four → the furnace/oven (kitchen: oven; metal: furnace)
- la version (de la vallée) → the version (of the valley)
- colporteur → pedlar · alchimiste → alchemist · libraire / bibliothécaire → librarian
- nains → dwarves · géants → giants · naturistes → naturists

## Glossary, part 2 (new content)

- Aëla, Durn, Vesh, the Aëlim, the Gorr: keep as is. les Trois → the Three · l’Aube → the Dawn · la Pierre → the Stone
- le Dormeur → the Sleeper · la Nuit noire → the Black Night · une nuit noire / les nuits noires → a black night / black nights
- l’aëlin / aëlin → Aëlin · le gorrain / gorrain → Gorrain · les Hautes Lettres → the High Letters · les cupules → the cup-marks
- the words of these invented languages (e.g. « ael vor ves », « dwerr », « mor ») stay untranslated
- les Sources → the Springs · les naturistes → the naturists · les nains → the dwarves · le peuple d’en bas → the folk below
- les géants → the giants · la Table des Géants → the Giants’ Table · le camp des géants → the giants’ camp
- la grande bibliothèque → the great library · le libraire → the librarian · les archives → the archives
- le relais de chasse → the hunting lodge · le chasseur → the hunter · fusil (de chasse) à lunette → scoped (hunting) rifle
- cartouche → cartridge · piège à loup → wolf trap · charrette → cart · harnais → harness · attelle → splint · bandage → bandage
- table d’alchimiste → alchemist’s table · fiole → vial · essence → essence · malédiction → curse
- la roulotte → the caravan · colporteur / colporteuse → pedlar · l’échoppe → the shop
- avis de recherche → wanted poster · prime → bounty · recherché(e) → wanted · témoin → witness
- tornade → tornado · murmures → whispers · divinité → deity · les jours de la semaine (Primedi…) → keep as is
- item names that describe the look of a plant not yet identified (« Larges feuilles odorantes ») are descriptive
  phrases: translate them as descriptive phrases (“Broad fragrant leaves”), never as the real plant name.
`;

// ------------------------------------------------------------------ ce qui manque
function missing() {
  const map = B.loadData();
  const ex = extract({ where: true });
  const c = B.coverage(map, ex);
  return { map, ex, c };
}

// ------------------------------------------------------------------ glossaire d'un lot : noms courts déjà traduits présents dans le lot
function glossaryIndex(map) {
  const L = [];
  for (const [fr, en] of map) {
    if (fr.length > 40 || /\{/.test(fr) || /\n/.test(fr) || fr.split(' ').length > 5) continue;
    if (!/^[A-ZÀ-ÝŒ]/.test(fr) || fr === en) continue;
    if (fr.length < 4) continue;
    L.push([fr, en, fr.toLowerCase()]);
  }
  return L;
}
function glossaryFor(L, texts) {
  const hay = texts.join('\n').toLowerCase();
  const out = {};
  let n = 0;
  for (const [fr, en, lo] of L) {
    let i = hay.indexOf(lo);
    while (i >= 0) {
      const a = hay[i - 1], b = hay[i + lo.length];
      const wordA = a && /[a-zà-ÿœ]/.test(a), wordB = b && /[a-zà-ÿœ]/.test(b);
      if (!wordA && !wordB) break;
      i = hay.indexOf(lo, i + 1);
    }
    if (i >= 0) { out[fr] = en; if (++n >= 250) break; }
  }
  return out;
}

// ------------------------------------------------------------------ lots
function lots(dir, size, force) {
  fs.mkdirSync(dir, { recursive: true });
  const old = fs.readdirSync(dir).filter((f) => /^(out|in)_[\w-]+\.json$|^manifest\.json$|^glossaire_[\w-]+\.json$/.test(f));
  if (old.some((f) => f.startsWith('out_')) && !force) {
    console.error(`${dir} contient déjà des out_XX.json : fusionnez d'abord (node tools/i18n-delta.js fusion ${dir}) ou utilisez --force.`);
    process.exit(1);
  }
  for (const f of old) fs.unlinkSync(path.join(dir, f));
  const { map, ex, c } = missing();
  const manifest = {};
  const items = [];
  c.miss.strings.forEach((s, i) => { manifest['n' + i] = s; items.push(['n' + i, s]); });
  c.miss.patterns.forEach((s, i) => { manifest['m' + i] = s; items.push(['m' + i, s]); });
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 1));
  fs.writeFileSync(path.join(dir, 'INSTRUCTIONS.md'), INSTRUCTIONS);
  // découpe : textes voisins ensemble, ~size octets de français par lot
  const batches = [];
  let cur = [], bytes = 0;
  for (const it of items) {
    const b = Buffer.byteLength(it[1]) + it[0].length + 8;
    if (cur.length && bytes + b > size) { batches.push(cur); cur = []; bytes = 0; }
    cur.push(it); bytes += b;
  }
  if (cur.length) batches.push(cur);
  const G = glossaryIndex(map);
  const where = {};
  batches.forEach((bt, i) => {
    const id = String(i).padStart(2, '0');
    const obj = {};
    for (const [k, s] of bt) { obj[k] = s; where[k] = ex.where[s]; }
    fs.writeFileSync(path.join(dir, `in_${id}.json`), JSON.stringify(obj, null, 1));
    const g = glossaryFor(G, bt.map((x) => x[1]));
    if (Object.keys(g).length) fs.writeFileSync(path.join(dir, `glossaire_${id}.json`), JSON.stringify(g, null, 1));
  });
  fs.writeFileSync(path.join(dir, 'origine.json'), JSON.stringify(where, null, 1));
  const kb = items.reduce((a, it) => a + Buffer.byteLength(it[1]), 0) / 1024;
  console.log(`${items.length} textes à traduire (${c.miss.strings.length} textes, ${c.miss.patterns.length} gabarits, ${kb.toFixed(0)} Ko) sur ${c.total} -> ${batches.length} lot(s) dans ${dir}`);
  console.log(`Ensuite : un traducteur par lot (lire ${path.join(dir, 'INSTRUCTIONS.md')}, écrire out_XX.json), puis : node tools/i18n-delta.js fusion ${dir}`);
}

// ------------------------------------------------------------------ fusion
function fusion(dirs) {
  const map = B.loadData();
  const before = map.size;
  let bad = 0;
  for (const d of dirs) { const r = B.mergeAny(map, d); B.printReport(d, r); bad += r.rejected.length + r.missing.length + r.noOut.length; }
  const w = B.writeData(map);
  console.log(`src/14-i18n-en.js : ${w.exact} textes, ${w.patterns} gabarits (${(w.bytes / 1024).toFixed(0)} Ko), ${map.size - before} nouveau(x)`);
  const c = B.coverage(map);
  console.log(`Couverture des sources : ${c.total - c.missing} / ${c.total} ; encore ${c.missing} à traduire.`);
  if (bad) console.log('Des traductions manquent ou sont rejetées (voir plus haut) : corrigez les out_XX.json concernés et relancez la fusion, ou lancez une petite vague de plus (lots).');
  console.log('Puis : node build.js --check && node --check .check.js');
}

// ------------------------------------------------------------------ état
function etat(liste) {
  const { c, ex } = missing();
  console.log(`Couverture des sources : ${c.total - c.missing} / ${c.total} traduits ; ${c.missing} à traduire (${c.miss.strings.length} textes, ${c.miss.patterns.length} gabarits).`);
  if (liste) for (const s of [...c.miss.strings, ...c.miss.patterns]) console.log(`${ex.where[s] || '?'}\t${JSON.stringify(s).slice(0, 160)}`);
  else {
    const per = {};
    for (const s of [...c.miss.strings, ...c.miss.patterns]) { const f = (ex.where[s] || '?').split(':')[0]; per[f] = (per[f] || 0) + 1; }
    for (const [f, n] of Object.entries(per).sort((a, b) => b[1] - a[1])) console.log(`  ${f} : ${n}`);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'etat';
  const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const pos = args.slice(1).filter((a, i, A) => !a.startsWith('--') && !(i > 0 && A[i - 1] === '--taille'));
  if (cmd === 'lots') { if (!pos[0]) throw new Error('usage : node tools/i18n-delta.js lots <dossier>'); lots(path.resolve(pos[0]), +opt('--taille', 28000), args.includes('--force')); }
  else if (cmd === 'fusion') { if (!pos.length) throw new Error('usage : node tools/i18n-delta.js fusion <dossier>…'); fusion(pos.map((d) => path.resolve(d))); }
  else if (cmd === 'etat') etat(args.includes('--liste'));
  else console.log('commandes : lots <dossier> [--taille 28000] [--force] · fusion <dossier>… · etat [--liste]');
}

module.exports = { lots, fusion, etat, INSTRUCTIONS };
