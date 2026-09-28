// Construit src/14-i18n-en.js (données de la traduction anglaise) à partir de lots traduits.
//
//   node tools/i18n-build.js <dossier>… [--fresh] [--out src/14-i18n-en.js]
//
// Chaque <dossier> est une vague de traduction (voir tools/i18n-delta.js) : des out_XX.json ({ clé: texte anglais })
// et, pour retrouver le français de chaque clé, les in_XX.json ({ clé: texte français }) et/ou un manifest.json
// ({ clé: texte français } pour toute la vague). La clé est cherchée d'abord dans le in_XX du même numéro, puis
// dans le manifeste : la façon de numéroter les clés n'a pas d'importance.
// - Les traductions déjà présentes dans src/14-i18n-en.js sont gardées (sauf --fresh) ; une traduction nouvelle
//   remplace l'ancienne pour le même texte français.
// - Espaces normalisés des deux côtés (comme l'extracteur et 14-i18n.js), retours à la ligne gardés.
// - Contrôles : mêmes jetons ({0}, {1}…, {fermier}, {npc:garde}…) en français et en anglais, sinon la paire est
//   rejetée ; nombre de lignes différent : avertissement (la paire est gardée).
// - Les textes avec {0}, {1}… vont dans « patterns » (gabarits), les autres dans « exact ».
// On peut aussi donner un fichier { français: anglais } tout fait (ex. merged.json) à la place d'un dossier.
// Sans dossier : relit et réécrit le fichier (tri, normalisation) et affiche la couverture des sources.
//
// Exemple (première vague) : node tools/i18n-build.js /chemin/scratchpad/tr --fresh
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const DATA = path.join(root, 'src', '14-i18n-en.js');
const norm = (s) => String(s).replace(/[ \t\u00a0\u202f\u2009]+/g, ' ').replace(/ *\n */g, '\n').trim();
const TOKEN = /\{(\d{1,2}|[a-z]+(?::[A-Za-z0-9_]+)?)\}/g;
const tokens = (s) => (String(s).match(TOKEN) || []).sort().join(' ');
const isPattern = (s) => /\{\d{1,2}\}/.test(s);

// ------------------------------------------------------------------ lecture / écriture du fichier de données
function loadData(file = DATA) {
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  const txt = fs.readFileSync(file, 'utf8');
  const i = txt.indexOf('const I18N_EN = ');
  if (i < 0) throw new Error(file + ' : « const I18N_EN = » introuvable');
  const json = txt.slice(i + 'const I18N_EN = '.length, txt.lastIndexOf('}') + 1);
  const D = JSON.parse(json);
  for (const [fr, en] of [...(D.exact || []), ...(D.patterns || [])]) map.set(fr, en);
  return map;
}
function writeData(map, file = DATA) {
  const keys = [...map.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const ex = [], pat = [];
  for (const k of keys) (isPattern(k) ? pat : ex).push(JSON.stringify([k, map.get(k)]));
  const head = `// ============================================================================
//  TRADUCTION ANGLAISE : les données. FICHIER GÉNÉRÉ par tools/i18n-build.js
//  et tools/i18n-delta.js — ne pas modifier à la main : corriger les lots
//  (out_XX.json) puis relancer l'outil.
//  exact : [français, anglais] (espaces normalisés, retours à la ligne gardés ;
//  les jetons {fermier}, {npc:x}… restent tels quels) ; patterns : gabarits
//  avec {0}, {1}… (ce qui occupe leur place est traduit à part). Lu par 14-i18n.js.
// ============================================================================
`;
  const body = 'const I18N_EN = {"v":1,"exact":[\n' + ex.join(',\n') + '\n],"patterns":[\n' + pat.join(',\n') + '\n]};\n';
  if (/<\/script/i.test(body)) throw new Error('« </script » dans une traduction : le fichier HTML serait cassé.');
  fs.writeFileSync(file, head + body);
  return { exact: ex.length, patterns: pat.length, bytes: Buffer.byteLength(head + body) };
}

// ------------------------------------------------------------------ contrôle d'une paire
function checkPair(fr, en) {
  if (typeof en !== 'string' || !en.trim()) return 'traduction vide';
  if (/<\/script/i.test(en)) return '« </script »';
  if (tokens(fr) !== tokens(en)) return `jetons différents : [${tokens(fr)}] / [${tokens(en)}]`;
  return null;
}

// ------------------------------------------------------------------ fusion d'une vague
const newReport = () => ({ added: 0, replaced: 0, same: 0, rejected: [], missing: [], unknown: [], warn: [], batches: 0, noOut: [] });
// une paire (contrôlée, normalisée) ; renvoie false si rejetée
function addPair(map, rep, key, frRaw, enRaw) {
  const fr = norm(frRaw), en = typeof enRaw === 'string' ? norm(enRaw) : enRaw;
  const bad = checkPair(fr, en);
  if (bad) { rep.rejected.push([key, bad + ' — ' + JSON.stringify(fr).slice(0, 80)]); return false; }
  if (fr.split('\n').length !== en.split('\n').length) rep.warn.push(`${key} lignes ${fr.split('\n').length} / ${en.split('\n').length}`);
  const old = map.get(fr);
  if (old === undefined) rep.added++; else if (old === en) rep.same++; else rep.replaced++;
  map.set(fr, en);
  return true;
}
// un fichier { français: anglais } tout fait (ex. merged.json)
function mergeFlat(map, file) {
  const rep = newReport();
  let O;
  try { O = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { rep.rejected.push([file, 'JSON illisible : ' + e.message]); return rep; }
  rep.batches = 1;
  for (const fr of Object.keys(O)) addPair(map, rep, JSON.stringify(fr).slice(0, 40), fr, O[fr]);
  return rep;
}
// un dossier de vague, ou un fichier { français: anglais }
const mergeAny = (map, p) => (fs.statSync(p).isDirectory() ? mergeDir(map, p) : mergeFlat(map, p));

// Formats acceptés (dans le même dossier) :
//   - in_XX.json { clé: français } + out_XX.json { clé: anglais } (clé cherchée d'abord dans le in_XX du même numéro) ;
//   - manifest.json { clé: français } (toutes les clés de la vague) + out_XX.json { clé: anglais }.
// renvoie { added, replaced, same, rejected: [[clé, raison]], missing: [clé], unknown: [clé], warn: [..], noOut: [in_XX] }
function mergeDir(map, dir) {
  const rep = newReport();
  const read = (f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { rep.rejected.push([f, 'JSON illisible : ' + e.message]); return null; } };
  const files = fs.readdirSync(dir).sort();
  const all = {}; // clé -> français (manifeste, puis lots in_XX)
  if (files.includes('manifest.json')) Object.assign(all, read('manifest.json') || {});
  const ins = {};
  for (const f of files.filter((x) => /^in_[\w-]+\.json$/.test(x))) {
    const I = read(f);
    if (!I) continue;
    ins[f.slice(3, -5)] = I;
    for (const k of Object.keys(I)) if (!(k in all)) all[k] = I[k];
  }
  const done = new Set();
  for (const f of files.filter((x) => /^out_[\w-]+\.json$/.test(x))) {
    const id = f.slice(4, -5), O = read(f);
    if (!O) continue;
    rep.batches++;
    const I = ins[id] || {};
    for (const k of Object.keys(O)) {
      const frRaw = k in I ? I[k] : all[k];
      if (typeof frRaw !== 'string') { rep.unknown.push(id + ':' + k); continue; }
      if (addPair(map, rep, id + ':' + k, frRaw, O[k])) done.add(k);
    }
  }
  for (const id of Object.keys(ins)) if (!files.includes('out_' + id + '.json')) rep.noOut.push('in_' + id + '.json');
  for (const k of Object.keys(all)) if (!done.has(k)) rep.missing.push(k);
  return rep;
}

// ------------------------------------------------------------------ couverture des sources actuelles
function coverage(map, ex) {
  if (!ex) ex = require('./i18n-extract.js').extract();
  const miss = { strings: ex.strings.filter((s) => !map.has(s)), patterns: ex.patterns.filter((s) => !map.has(s)) };
  return { total: ex.strings.length + ex.patterns.length, missing: miss.strings.length + miss.patterns.length, miss, ex };
}

function printReport(dir, rep) {
  console.log(`${dir} : ${rep.batches} lot(s), ${rep.added} ajout(s), ${rep.replaced} remplacement(s), ${rep.same} inchangé(s)`);
  if (rep.noOut.length) console.log(`  sans out_XX.json (pas encore traduits) : ${rep.noOut.join(', ')}`);
  if (rep.missing.length) console.log(`  clés sans traduction valable : ${rep.missing.length} (${rep.missing.slice(0, 12).join(', ')}${rep.missing.length > 12 ? '…' : ''})`);
  if (rep.unknown.length) console.log(`  clés inconnues (ni dans in_XX.json ni dans manifest.json) : ${rep.unknown.length} (${rep.unknown.slice(0, 12).join(', ')})`);
  if (rep.rejected.length) { console.log(`  REJETÉES : ${rep.rejected.length}`); for (const [k, r] of rep.rejected.slice(0, 30)) console.log(`    ${k} : ${r}`); }
  if (rep.warn.length) console.log(`  avertissements (nombre de lignes) : ${rep.warn.length} (${rep.warn.slice(0, 6).join(' ; ')})`);
}

module.exports = { DATA, norm, tokens, loadData, writeData, mergeDir, mergeFlat, mergeAny, checkPair, coverage, printReport };

if (require.main === module) {
  const args = process.argv.slice(2);
  const oi = args.indexOf('--out');
  const out = oi >= 0 ? path.resolve(args[oi + 1]) : DATA;
  const dirs = args.filter((a, i) => !a.startsWith('--') && !(oi >= 0 && i === oi + 1));
  const map = args.includes('--fresh') ? new Map() : loadData(out);
  const before = map.size;
  for (const d of dirs) printReport(d, mergeAny(map, d));
  const w = writeData(map, out);
  console.log(`${path.relative(root, out)} : ${w.exact} textes, ${w.patterns} gabarits (${(w.bytes / 1024).toFixed(0)} Ko) — ${map.size - before >= 0 ? '+' : ''}${map.size - before}`);
  const c = coverage(map);
  console.log(`Couverture des sources : ${c.total - c.missing} / ${c.total} traduits ; ${c.missing} à traduire (node tools/i18n-delta.js lots <dossier>)`);
}
