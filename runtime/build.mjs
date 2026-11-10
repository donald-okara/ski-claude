// Bundles the runtime into dist/ski/{ski.js,ski.css} and copies it into every example.
import { build } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const out = join(root, 'dist', 'ski');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

await build({
  entryPoints: [join(root, 'runtime/src/index.js')],
  outfile: join(out, 'ski.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  banner: { js: `/* ski-claude ${version} */` },
});
cpSync(join(root, 'runtime/src/ski.css'), join(out, 'ski.css'));

const examples = join(root, 'examples');
for (const name of readdirSync(examples)) {
  if (!statSync(join(examples, name)).isDirectory()) continue;
  const target = join(examples, name, 'ski');
  rmSync(target, { recursive: true, force: true });
  cpSync(out, target, { recursive: true });
}
