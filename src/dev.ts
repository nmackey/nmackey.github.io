import { spawnSync } from 'node:child_process';
import { watch } from 'node:fs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DIST, ROOT } from './lib/paths.js';

const PORT = Number(process.env.PORT ?? 4173);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.xml': 'application/rss+xml; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function loadGenerate(): Promise<() => Promise<void>> {
  const url = `${pathToFileURL(join(ROOT, '.build/lib/generate.js')).href}?t=${Date.now()}`;
  const mod = (await import(url)) as { generateSite: () => Promise<void> };
  return mod.generateSite;
}

let building = false;
let queued = false;
let queuedRecompile = false;

async function rebuild(recompile = false): Promise<void> {
  if (building) {
    queued = true;
    queuedRecompile = queuedRecompile || recompile;
    return;
  }
  building = true;
  try {
    if (recompile) {
      runTsc();
    }
    const generateSite = await loadGenerate();
    await generateSite();
  } catch (error) {
    console.error(error);
  } finally {
    building = false;
    if (queued) {
      const again = queuedRecompile;
      queued = false;
      queuedRecompile = false;
      await rebuild(again);
    }
  }
}

function runTsc(): void {
  const tsc = join(ROOT, 'node_modules/.bin/tsc');
  for (const project of ['tsconfig.json', 'tsconfig.client.json']) {
    const result = spawnSync(tsc, ['-p', project], { cwd: ROOT, stdio: 'inherit' });
    if (result.status !== 0) {
      throw new Error(`tsc -p ${project} failed`);
    }
  }
}

function watchedPath(filename: string | null, rootName: string): string {
  return filename ? join(rootName, filename) : rootName;
}

const WATCH_TARGETS = ['content', 'templates', 'assets', 'src', 'site.json', 'CNAME'];

for (const name of WATCH_TARGETS) {
  watch(join(ROOT, name), { recursive: true }, (_event, filename) => {
    const rel = relative(ROOT, resolve(ROOT, watchedPath(filename, name)));
    if (rel.startsWith('dist') || rel.startsWith('.build') || rel.startsWith('node_modules')) {
      return;
    }
    const recompile = rel.endsWith('.ts');
    void rebuild(recompile);
  });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    let filePath = join(DIST, decodeURIComponent(url.pathname));
    let info = await stat(filePath).catch(() => undefined);
    if (info?.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath).catch(() => undefined);
    }
    if (!info?.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const body = await readFile(filePath);
    res.writeHead(200, {
      'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
    });
    res.end(body);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(error instanceof Error ? error.message : 'Server error');
  }
});

await (await loadGenerate())();
server.listen(PORT, () => {
  console.log(`Serving dist/ at http://127.0.0.1:${PORT}`);
});
