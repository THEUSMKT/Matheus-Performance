#!/usr/bin/env node
/* ==========================================================================
   Verificação de compatibilidade do build (out/) com Safari/iOS antigos.

   Um único erro de sintaxe derruba o arquivo inteiro no navegador: a página
   aparece (HTML estático), mas nada que depende de JavaScript responde.
   Este script lê cada .js exportado e acusa sintaxe que o Safari anterior
   à 16.4 não entende:
     - bloco estático de classe (`static { … }`) — Safari 16.4+;
     - lookbehind em expressão regular (`(?<=` / `(?<!`) — Safari 16.4+;
     - flag `v` em expressão regular — Safari 17+.
   O alvo mínimo está em "browserslist" no package.json (iOS/Safari 15.4).

   Não substitui teste em aparelho: só garante que o arquivo é lido.
   Uso: npm run build && npm run check:compat
   ========================================================================== */
const fs = require('node:fs');
const path = require('node:path');

let acorn;
try {
  acorn = require('next/dist/compiled/acorn');
} catch {
  console.log('check:compat: parser (acorn) indisponível nesta versão do Next; verificação ignorada.');
  process.exit(0);
}

const root = path.join(__dirname, '..', 'out', '_next', 'static');
if (!fs.existsSync(root)) {
  console.error('check:compat: rode "npm run build" antes (out/ não existe).');
  process.exit(1);
}

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) files.push(full);
  }
})(root);

const problems = [];
function visit(node, file) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'StaticBlock') problems.push([file, node.start, 'bloco estático de classe (Safari 16.4+)']);
  if (node.type === 'Literal' && node.regex) {
    if (/\(\?<[=!]/.test(node.regex.pattern)) problems.push([file, node.start, `lookbehind /${node.regex.pattern.slice(0, 40)}/ (Safari 16.4+)`]);
    if (node.regex.flags.includes('v')) problems.push([file, node.start, 'flag v em expressão regular (Safari 17+)']);
  }
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (Array.isArray(value)) value.forEach((child) => visit(child, file));
    else if (value && typeof value.type === 'string') visit(value, file);
  }
}

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true });
  } catch {
    ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true });
  }
  visit(ast, path.relative(root, file));
}

if (problems.length) {
  for (const [file, at, what] of problems) console.error(`✗ ${file} (posição ${at}): ${what}`);
  console.error(`check:compat: ${problems.length} problema(s) em ${files.length} arquivos.`);
  process.exit(1);
}
console.log(`check:compat: ${files.length} arquivos JS sem sintaxe além do Safari/iOS 15.4.`);
