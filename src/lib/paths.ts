import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const ROOT = resolve(here, '../..');
export const CONTENT = resolve(ROOT, 'content');
export const TEMPLATES = resolve(ROOT, 'templates');
export const ASSETS = resolve(ROOT, 'assets');
export const DIST = resolve(ROOT, 'dist');
export const SITE_JSON = resolve(ROOT, 'site.json');
export const CLIENT_JS = resolve(ROOT, '.build/client');
