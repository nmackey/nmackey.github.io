import { cpSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ASSETS, CLIENT_JS, DIST, ROOT } from './paths.js';

export function copyStaticAssets(): void {
  mkdirSync(join(DIST, 'assets/css'), { recursive: true });
  mkdirSync(join(DIST, 'assets/js'), { recursive: true });
  mkdirSync(join(DIST, 'assets/images'), { recursive: true });

  cpSync(join(ASSETS, 'css'), join(DIST, 'assets/css'), { recursive: true });
  cpSync(join(ASSETS, 'images'), join(DIST, 'assets/images'), { recursive: true });
  cpSync(join(ASSETS, 'favicon.ico'), join(DIST, 'favicon.ico'));
  cpSync(join(ROOT, 'CNAME'), join(DIST, 'CNAME'));
  cpSync(join(CLIENT_JS, 'main.js'), join(DIST, 'assets/js/main.js'));
}
