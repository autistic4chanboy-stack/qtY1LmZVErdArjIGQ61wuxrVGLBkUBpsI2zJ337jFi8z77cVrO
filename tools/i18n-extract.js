// Extraction des textes du jeu (pour la traduction anglaise)
//   node tools/i18n-extract.js [sortie.json] [--where]
//   require('./i18n-extract.js').extract({ where }) -> { strings, patterns, where? }  (utilisé par i18n-build / i18n-delta)
// Nécessite le paquet « typescript » (utilisé seulement comme analyseur syntaxique de JavaScript).
// Sortie : { strings: [texte…], patterns: [modèle avec {0}, {1}…] } — textes uniques, dans l'ordre d'apparition
// (avec --where : where[texte] = 'fichier:ligne' de la première apparition).
// Les espaces sont normalisés (norm) ; les retours à la ligne sont gardés.
const fs = require('fs');
const path = require('path');
let ts;
try { ts = require('typescript'); } catch (e) { ts = require('/opt/node22/lib/node_modules/typescript'); }

const root = path.join(__dirname, '..');
// modules sans texte affiché (code, shaders, sons) : on n'y prend que les valeurs de propriétés « name », « label »…
const SKIP = /^(00-util|01-gl|02-|07-shaders|08-renderer|09-audio|14-i18n)/;
const NAME_PROPS = new Set(['name', 'label', 'title', 'titre', 'hint', 'desc', 'text', 'texte', 'nom']);

// Un texte lisible (et non un identifiant, un sélecteur, une couleur, du code…)
function isText(s) {
  const t = s.trim();
  if (t.length < 2 || !/[A-Za-zÀ-ÿŒœ]/.test(t)) return false;
  // (« ;» final : du code, sauf l'espace qui le précède en typographie française : « une pomme en main ; »)
  if (/^#|rgba?\(|\d+px|^\.[a-z]|\[data-|^\w+:\/\/|\.(js|png|html|json)$|=>|function\s*\(|\S;\s*$|^[a-z]+\([^)]*\)$/.test(t)) return false;
  if (/^[a-z0-9_:.-]+$/.test(t)) return false; // identifiants (un mot en minuscules sans accent)
  if (/^[a-z]+[A-Z][A-Za-z0-9]*$/.test(t)) return false; // camelCase
  if (/^(Key|Digit|Arrow|Shift|Control|Alt)[A-Z0-9]/.test(t)) return false;
  if (/^[a-z][a-z0-9]*(:[a-z0-9_]+)+$/.test(t)) return false; // bld:ferme, lieu:lac…
  if (/^[\w-]+(\s[\w-]+)*$/.test(t) && /^(bold|italic|normal)\b/.test(t)) return false; // polices
  if (/^M_[A-Z]+$|^TL\./.test(t)) return false;
  return true;
}
// mêmes règles que 14-i18n.js (nrm) : espaces fusionnés, retours à la ligne gardés (sans espaces autour)
const norm = (s) => s.replace(/[ \t\u00a0\u202f\u2009]+/g, ' ').replace(/ *\n */g, '\n').trim();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

function extract(opts = {}) {
  const src = opts.src || path.join(root, 'src');
  const out = { strings: [], patterns: [] };
  const where = {};
  const seenS = new Set(), seenP = new Set();
  let here = '';
  const addS = (s) => { const t = norm(s); if (isText(t) && !seenS.has(t)) { seenS.add(t); out.strings.push(t); where[t] = here; } };
  const addP = (p) => {
    const t = norm(p);
    if (!/\{\d+\}/.test(t)) return addS(t);
    const lit = t.replace(/\{\d+\}/g, '');
    if (!/[A-Za-zÀ-ÿ]{2,}/.test(lit) || !isText(lit)) return;
    if (!seenP.has(t)) { seenP.add(t); out.patterns.push(t); where[t] = here; }
  };
  // texte généré par CSS : content: '…'
  const addCss = (s) => { for (const m of s.matchAll(/content:\s*(['"])((?:(?!\1).)*)\1/g)) if (m[2].trim()) addS(m[2].replace(/\\a\s?/g, '\n')); };

  // Découpe un fragment qui contient du HTML : seuls les textes entre les balises comptent
  function addFragment(s, isPattern) {
    if (/content:\s*['"]/.test(s)) addCss(s);
    if (/<[a-zA-Z/][^>]*>/.test(s)) {
      for (const part of s.split(/<[^>]*>/)) { if (part.trim()) (isPattern ? addP : addS)(decode(part)); }
      // attributs title="…", placeholder="…"
      for (const m of s.matchAll(/\b(?:title|placeholder)="([^"$]*)"/g)) addS(decode(m[1]));
      return;
    }
    (isPattern ? addP : addS)(decode(s));
  }

  // Chaîne de « + » : littéraux et expressions -> modèle
  function flattenPlus(node, parts) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) { flattenPlus(node.left, parts); flattenPlus(node.right, parts); return; }
    if (ts.isParenthesizedExpression(node) && ts.isBinaryExpression(node.expression) && node.expression.operatorToken.kind === ts.SyntaxKind.PlusToken) { flattenPlus(node.expression, parts); return; }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) { parts.push({ lit: node.text }); return; }
    if (ts.isTemplateExpression(node)) { parts.push({ lit: node.head.text }); for (const sp of node.templateSpans) { parts.push({ expr: true }); parts.push({ lit: sp.literal.text }); } return; }
    parts.push({ expr: true });
  }
  function partsToPattern(parts) {
    // le modèle complet (expressions marquées), puis coupé aux balises HTML : chaque morceau de texte devient un modèle à part
    const full = parts.map((p) => (p.expr ? '\u0001' : p.lit)).join('');
    if (/content:\s*['"]/.test(full)) addCss(full.replace(/\u0001/g, ''));
    for (const m of full.matchAll(/\b(?:title|placeholder)="([^"\u0001]*)"/g)) addS(decode(m[1]));
    for (const seg of full.split(/<[^>]*>/)) {
      if (!seg.trim()) continue;
      let k = 0;
      const pat = decode(seg).replace(/\u0001/g, () => '{' + k++ + '}');
      if (/^[\s{}\d.,:;!?()«»—–-]*$/.test(pat)) continue;
      addP(pat);
    }
  }

  function walk(node, inPlus, sf) {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken && !inPlus) {
      here = loc(sf, node);
      const parts = []; flattenPlus(node, parts);
      if (parts.some((p) => p.lit !== undefined && /[A-Za-zÀ-ÿ]/.test(p.lit))) partsToPattern(parts);
      // les expressions internes peuvent contenir d'autres textes
      ts.forEachChild(node, (c) => walk(c, true, sf));
      return;
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) { here = loc(sf, node); addFragment(node.text, false); }
    else if (ts.isTemplateExpression(node)) {
      here = loc(sf, node);
      const parts = [{ lit: node.head.text }];
      for (const sp of node.templateSpans) { parts.push({ expr: true }); parts.push({ lit: sp.literal.text }); }
      partsToPattern(parts);
    }
    const keepPlus = ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken;
    ts.forEachChild(node, (c) => walk(c, keepPlus && inPlus, sf));
  }
  // modules « techniques » : seulement { name: 'Herbe' }, { label: '…' }…
  function walkNames(node, sf) {
    if (ts.isPropertyAssignment(node) && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))) {
      const k = node.name && (node.name.text || (node.name.escapedText || ''));
      if (NAME_PROPS.has(String(k))) { here = loc(sf, node); addS(node.initializer.text); }
    }
    ts.forEachChild(node, (c) => walkNames(c, sf));
  }
  const loc = (sf, node) => sf.fileName + ':' + (sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1);

  const files = fs.readdirSync(src).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
  for (const f of files) {
    if (/^14-i18n/.test(f)) continue;
    const text = fs.readFileSync(path.join(src, f), 'utf8');
    const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    if (SKIP.test(f)) walkNames(sf, sf); else walk(sf, false, sf);
  }
  // la page : textes entre les balises (hors <style> et <script>), attributs title et placeholder, content: '…' des styles
  {
    let html = fs.readFileSync(path.join(src, 'shell.html'), 'utf8');
    here = 'shell.html';
    for (const m of html.matchAll(/<style[\s\S]*?<\/style>/g)) addCss(m[0]);
    html = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
    for (const m of html.matchAll(/\b(title|placeholder)="([^"]*)"/g)) addS(decode(m[2]));
    for (const part of html.split(/<[^>]*>/)) if (part.trim()) addS(decode(part));
  }
  if (opts.where) out.where = where;
  return out;
}

module.exports = { extract, norm, isText };

if (require.main === module) {
  const args = process.argv.slice(2);
  const dest = args.find((a) => !a.startsWith('--')) || path.join(root, 'tools', 'i18n-strings.json');
  const out = extract({ where: args.includes('--where') });
  fs.writeFileSync(dest, JSON.stringify(out, null, 1));
  const chars = out.strings.reduce((a, s) => a + s.length, 0) + out.patterns.reduce((a, s) => a + s.length, 0);
  console.log(`${out.strings.length} textes, ${out.patterns.length} modèles, ${(chars / 1024).toFixed(0)} Ko de texte -> ${dest}`);
}
