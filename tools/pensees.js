// Inventaire des pensées du personnage et des autres messages, avec fichier:ligne
//   node tools/pensees.js [--json sortie.json] [--mod motif] [--brut] [--src dossier]
// Canaux :
//   pensee   ui.subtitle('', texte)          (la pensée proprement dite)
//   penseeU  penser.une(clé, texte)           (pensée « une fois par vie »)
//   penseeP  penser.pas(clé, s, texte)        (avertissement espacé d'au moins s secondes)
//   parole   ui.subtitle(nom, texte)          (un habitant qui parle ; compté à part)
//   lit      littéral « (…) » ailleurs (tables de pensées, helpers locaux)
//   toast / fade / read : autres canaux
const fs = require('fs');
const path = require('path');
let ts; try { ts = require('typescript'); } catch (e) { ts = require('/opt/node22/lib/node_modules/typescript'); }

const args = process.argv.slice(2);
const dir = args.includes('--src') ? args[args.indexOf('--src') + 1] : path.join(__dirname, '..', 'src');
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const modPat = args.includes('--mod') ? new RegExp(args[args.indexOf('--mod') + 1]) : null;
const brut = args.includes('--brut');

const out = [];
const isThoughtText = (t) => /^\s*\(/.test(t) && /[A-Za-zÀ-ÿœŒ…]/.test(t) && /\)[.!?…]?\s*$/.test(t) && t.trim().length > 3 && /\s/.test(t.trim());
function litText(sf, n) {
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
  if (ts.isTemplateExpression(n)) return n.head.text + n.templateSpans.map((s) => '${' + s.expression.getText(sf) + '}' + s.literal.text).join('');
  return null;
}
function ctxName(n) {
  let p = n.parent; const names = [];
  while (p && names.length < 2) {
    if ((ts.isMethodDeclaration(p) || ts.isFunctionDeclaration(p) || ts.isPropertyAssignment(p)) && p.name) names.push(p.name.getText());
    else if (ts.isVariableDeclaration(p) && p.name) names.push(p.name.getText());
    p = p.parent;
  }
  return names.join('<');
}
const files = fs.readdirSync(dir).filter((f) => /^\d\d-.*\.js$/.test(f) && !/^14-i18n/.test(f)).sort();
for (const f of files) {
  if (modPat && !modPat.test(f)) continue;
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const seen = new Set();
  const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const add = (kind, n, argNode, extra) => {
    const t = argNode ? (litText(sf, argNode) ?? '«expr» ' + argNode.getText(sf).replace(/\s+/g, ' ').slice(0, 220)) : '';
    out.push({ f, l: line(n), kind, t, ctx: ctxName(n), ...(extra || {}) });
  };
  function walk(n) {
    if (ts.isCallExpression(n)) {
      const c = n.expression.getText(sf);
      if ((/^ui\.subtitle$/.test(c) || /^_sub(title)?$/.test(c)) && !/-pensees\.js$/.test(f)) {
        const a0 = n.arguments[0], a1 = n.arguments[1];
        const who = a0 ? (litText(sf, a0) ?? a0.getText(sf)) : '';
        const kind = who === '' ? 'pensee' : 'parole';
        add(kind, n, a1, { who: kind === 'parole' ? who.slice(0, 40) : undefined, dur: n.arguments[2] ? n.arguments[2].getText(sf) : '' });
        if (a1) markLits(a1);
      } else if (/^penser\.une$/.test(c)) {
        add('penseeU', n, n.arguments[1]);
        if (n.arguments[1]) markLits(n.arguments[1]);
      } else if (/^penser\.pas$/.test(c)) {
        add('penseeP', n, n.arguments[2]);
        if (n.arguments[2]) markLits(n.arguments[2]);
      } else if (/^ui\.toast$/.test(c)) { add('toast', n, n.arguments[0]); if (n.arguments[0]) markLits(n.arguments[0]); }
      else if (/^ui\.fade$/.test(c) && n.arguments[1]) { add('fade', n, n.arguments[1]); markLits(n.arguments[1]); }
      else if (/^ui\.fadeMsg$/.test(c)) { add('fade', n, n.arguments[0]); if (n.arguments[0]) markLits(n.arguments[0]); }
      else if (/^ui\.read$/.test(c)) { add('read', n, n.arguments[0]); }
    }
    ts.forEachChild(n, walk);
  }
  function markLits(n) { const v = (x) => { if (ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x) || ts.isTemplateExpression(x)) seen.add(x.pos); ts.forEachChild(x, v); }; v(n); }
  walk(sf);
  function walkLits(n) {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) && !seen.has(n.pos)) {
      const t = litText(sf, n);
      if (t && isThoughtText(t)) add('lit', n, n);
    }
    ts.forEachChild(n, walkLits);
  }
  walkLits(sf);
}
out.sort((a, b) => (a.f < b.f ? -1 : a.f > b.f ? 1 : a.l - b.l));
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(out, null, 1));
const byKind = {}; const byMod = {};
for (const o of out) { byKind[o.kind] = (byKind[o.kind] || 0) + 1; if (o.kind === 'pensee' || o.kind === 'lit' || o.kind === 'penseeU' || o.kind === 'penseeP') byMod[o.f] = (byMod[o.f] || 0) + 1; }
if (brut) {
  for (const o of out) console.log(`${o.f}:${o.l}\t${o.kind}${o.who ? '[' + o.who + ']' : ''}\t${o.t.replace(/\n/g, '⏎')}${o.ctx ? '\t{' + o.ctx + '}' : ''}`);
} else {
  console.log('Par canal :', JSON.stringify(byKind));
  const pensees = out.filter((o) => o.kind === 'pensee');
  const penseesTxt = pensees.filter((o) => /^\s*\(/.test(o.t)).length;
  console.log(`Pensées ui.subtitle('', …) : ${pensees.length} (dont ${penseesTxt} littérales « (…) »), pensées une fois : ${byKind.penseeU || 0}, espacées : ${byKind.penseeP || 0}, littéraux « (…) » ailleurs : ${byKind.lit || 0}`);
  console.log('Par module (pensées + littéraux) :');
  for (const [m, k] of Object.entries(byMod).sort((a, b) => b[1] - a[1])) console.log('  ' + k + '\t' + m);
}
