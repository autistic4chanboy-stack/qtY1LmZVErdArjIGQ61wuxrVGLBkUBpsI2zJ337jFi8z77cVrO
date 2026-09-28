// Extraction des textes du jeu (pour la traduction anglaise) : node tools/i18n-extract.js [sortie.json]
// Nécessite le paquet « typescript » (utilisé seulement comme analyseur syntaxique de JavaScript).
// Sortie : { strings: [texte…], patterns: [modèle avec {0}, {1}…] } — textes uniques, dans l'ordre d'apparition.
const fs = require('fs');
const path = require('path');
let ts;
try { ts = require('typescript'); } catch (e) { ts = require('/opt/node22/lib/node_modules/typescript'); }

const root = path.join(__dirname, '..');
const src = path.join(root, 'src');
const SKIP = /^(00-util|01-gl|02-|07-shaders|08-renderer|09-audio|14-i18n)/;
const out = { strings: [], patterns: [] };
const seenS = new Set(), seenP = new Set();

// Un texte lisible (et non un identifiant, un sélecteur, une couleur, du code…)
function isText(s) {
  const t = s.trim();
  if (t.length < 2 || !/[A-Za-zÀ-ÿŒœ]/.test(t)) return false;
  if (/^#|rgba?\(|\d+px|^\.[a-z]|\[data-|^\w+:\/\/|\.(js|png|html|json)$|=>|function\s*\(|;\s*$|^[a-z]+\([^)]*\)$/.test(t)) return false;
  if (/^[a-z0-9_:.-]+$/.test(t)) return false; // identifiants (un mot en minuscules sans accent)
  if (/^[a-z]+[A-Z][A-Za-z0-9]*$/.test(t)) return false; // camelCase
  if (/^(Key|Digit|Arrow|Shift|Control|Alt)[A-Z0-9]/.test(t)) return false;
  if (/^[a-z][a-z0-9]*(:[a-z0-9_]+)+$/.test(t)) return false; // bld:ferme, lieu:lac…
  if (/^[\w-]+(\s[\w-]+)*$/.test(t) && /^(bold|italic|normal)\b/.test(t)) return false; // polices
  if (/^M_[A-Z]+$|^TL\./.test(t)) return false;
  return true;
}
const norm = (s) => s.replace(/[ \t\u00a0]+/g, ' ').replace(/ *\n */g, '\n').trim();
const addS = (s) => { const t = norm(s); if (isText(t) && !seenS.has(t)) { seenS.add(t); out.strings.push(t); } };
const addP = (p) => { const t = norm(p); if (!/\{\d+\}/.test(t)) return addS(t); const lit = t.replace(/\{\d+\}/g, ''); if (!/[A-Za-zÀ-ÿ]{2,}/.test(lit) || !isText(lit)) return; if (!seenP.has(t)) { seenP.add(t); out.patterns.push(t); } };

// Découpe un fragment qui contient du HTML : seuls les textes entre les balises comptent
function addFragment(s, isPattern) {
  if (/<[a-zA-Z/][^>]*>/.test(s)) {
    for (const part of s.split(/<[^>]*>/)) { if (part.trim()) (isPattern ? addP : addS)(decode(part)); }
    // attributs title="…"
    for (const m of s.matchAll(/\btitle="([^"$]*)"/g)) addS(decode(m[1]));
    return;
  }
  (isPattern ? addP : addS)(decode(s));
}
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

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
  for (const m of full.matchAll(/\btitle="([^"\u0001]*)"/g)) addS(decode(m[1]));
  for (const seg of full.split(/<[^>]*>/)) {
    if (!seg.trim()) continue;
    let k = 0;
    const pat = decode(seg).replace(/\u0001/g, () => '{' + k++ + '}');
    if (/^[\s{}\d.,:;!?()«»—–-]*$/.test(pat)) continue;
    addP(pat);
  }
}

function walk(node, inPlus) {
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken && !inPlus) {
    const parts = []; flattenPlus(node, parts);
    if (parts.some((p) => p.lit !== undefined && /[A-Za-zÀ-ÿ]/.test(p.lit))) partsToPattern(parts);
    // les expressions internes peuvent contenir d'autres textes
    ts.forEachChild(node, (c) => walk(c, true));
    return;
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) addFragment(node.text, false);
  else if (ts.isTemplateExpression(node)) {
    const parts = [{ lit: node.head.text }];
    for (const sp of node.templateSpans) { parts.push({ expr: true }); parts.push({ lit: sp.literal.text }); }
    partsToPattern(parts);
  }
  const keepPlus = ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken;
  ts.forEachChild(node, (c) => walk(c, keepPlus && inPlus));
}

const files = fs.readdirSync(src).filter((f) => /^\d\d-.*\.js$/.test(f) && !SKIP.test(f)).sort();
for (const f of files) {
  const text = fs.readFileSync(path.join(src, f), 'utf8');
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  walk(sf, false);
}
// la page : textes entre les balises (hors <style> et <script>), attributs title et placeholder
{
  let html = fs.readFileSync(path.join(src, 'shell.html'), 'utf8');
  html = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  for (const m of html.matchAll(/\b(title|placeholder)="([^"]*)"/g)) addS(decode(m[2]));
  for (const part of html.split(/<[^>]*>/)) if (part.trim()) addS(decode(part));
}
const dest = process.argv[2] || path.join(root, 'tools', 'i18n-strings.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 1));
const chars = out.strings.reduce((a, s) => a + s.length, 0) + out.patterns.reduce((a, s) => a + s.length, 0);
console.log(`${out.strings.length} textes, ${out.patterns.length} modèles, ${(chars / 1024).toFixed(0)} Ko de texte -> ${dest}`);
