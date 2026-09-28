// Assemble le jeu en un seul fichier HTML autonome : node build.js
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');
// --skip=motif1,motif2 : ignore les modules dont le nom contient un de ces motifs (tests)
const skipArg = process.argv.find((a) => a.startsWith('--skip='));
const skip = skipArg ? skipArg.slice(7).split(',').filter(Boolean) : [];
const files = fs.readdirSync(src).filter((f) => /^\d\d-.*\.js$/.test(f) && !skip.some((k) => f.includes(k))).sort();
const js = files.map((f) => `// ---- ${f}\n` + fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
if (/<\/script/i.test(js)) throw new Error('Le code JS contient "</script" : le fichier HTML serait cassé.');

const shell = fs.readFileSync(path.join(src, 'shell.html'), 'utf8');
const out = shell.replace('/*@@JS@@*/', () => js);
fs.writeFileSync(path.join(__dirname, 'Prairie.html'), out);

if (process.argv.includes('--check')) fs.writeFileSync(path.join(__dirname, '.check.js'), js);
console.log(`Prairie.html généré (${files.length} modules, ${(out.length / 1024).toFixed(0)} Ko)`);
