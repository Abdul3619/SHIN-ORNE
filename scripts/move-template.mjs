// Moves the built HTML template out of the static output (dist/) into build/. If dist/index.html were left
// in place, the host would serve it directly for "/" as an empty shell instead of the server-rendered
// storefront with live products.
import fs from 'fs';
import path from 'path';

const from = path.resolve('dist/index.html');
const to = path.resolve('build/template.html');
if (!fs.existsSync(from)) {
  console.error('move-template: dist/index.html not found. Run the client build first.');
  process.exit(1);
}
fs.mkdirSync(path.dirname(to), { recursive: true });
fs.renameSync(from, to);
console.log('move-template: dist/index.html -> build/template.html');
