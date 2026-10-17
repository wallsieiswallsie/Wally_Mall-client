import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
const traverse = traverseModule.default;
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() && !['dist', 'node_modules'].includes(e.name) ? walk(`${d}/${e.name}`) : e.isFile() ? [`${d}/${e.name}`] : []);
const files = ['apps', 'packages', 'compat'].flatMap(walk).filter(f => /\.(js|jsx)$/.test(f));
const edges = new Map();
let failures = 0;
function fail(message) { console.error(message); failures++; }
for (const file of files) {
  const tree = parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  const imports = [];
  traverse(tree, {
    ImportDeclaration(p) {
      const spec = p.node.source.value;
      if (!spec.startsWith('.')) return;
      const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
      const target = [base, base + '.js', base + '.jsx'].find(f => fs.existsSync(f));
      if (!target) return fail(`Missing import: ${file} -> ${spec}`);
      if (file.startsWith('packages/') && target.startsWith('apps/')) fail(`Package imports application: ${file} -> ${target}`);
      if (file.startsWith('apps/') && target.startsWith('apps/') && file.split('/')[1] !== target.split('/')[1]) fail(`Cross-application import: ${file} -> ${target}`);
      imports.push(target);
    },
    Program(p) {
      for (const [name, binding] of Object.entries(p.scope.bindings)) {
        if (binding.path.isImportSpecifier() || binding.path.isImportDefaultSpecifier())
          if (!binding.referenced && name !== 'React') fail(`Unused import: ${file}: ${name}`);
      }
    },
  });
  edges.set(file, imports);
}
const done = new Set(), active = new Set();
function visit(file, chain = []) {
  if (active.has(file)) return fail(`Circular import: ${[...chain, file].join(' -> ')}`);
  if (done.has(file)) return;
  active.add(file);
  for (const target of edges.get(file) || []) visit(target, [...chain, file]);
  active.delete(file); done.add(file);
}
files.forEach(f => visit(f));
if (failures) process.exitCode = 1;
else console.log(`${files.length} modules: imports resolve; no application-boundary violations, unused imports or circular imports.`);
