/**
 * Static build:
 *   1. validate content (fails on errors, prints a warning per placeholder)
 *   2. bundle the client enhancement script with Vite
 *   3. prerender every page with React (no React in the browser)
 *   4. subset fonts to the characters used
 *   5. social images, sitemap, robots, RSS
 */
import fs from 'node:fs';
import path from 'node:path';
import { build as viteBuild, transformWithEsbuild } from 'vite';
import { loadTradition } from '../src/lib/tradition';
import { loadSite } from '../src/lib/content';
import { loadPeople } from '../src/lib/people';
import { renderRoute, renderShareCard, renderPersonCard, routes, ogPath, personOgPath, cardPath, type Assets } from '../src/render';
import { buildFonts, htmlText } from './fonts';
import { shoot, type Shot } from './og';
import { robots, rss, sitemap } from './feeds';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const args = new Set(process.argv.slice(2));
const t0 = Date.now();

const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

const tradition = await loadTradition();
const site = loadSite(tradition, ROOT);
for (const [k, v] of Object.entries(tradition.site)) if (typeof v === 'string' && /\[[A-Z]/.test(v)) site.warnings.push(`traditions/${tradition.id}/config.ts: placeholder ${v} at site.${k}`);
const people = loadPeople(site, ROOT);
site.warnings.push(...people.warnings);
site.errors.push(...people.errors);
for (const w of site.warnings) console.warn(yellow(`warn  ${w}`));
if (site.errors.length) {
  for (const e of site.errors) console.error(red(`error ${e}`));
  process.exit(1);
}
if (!site.upcoming) {
  console.error(red('error no editions found'));
  process.exit(1);
}
console.log(`${site.all.length} edition(s), ${site.published.length} published, upcoming ${site.upcoming.date} ${site.upcoming.sunday_slug}`);

// 2. client script
fs.rmSync(DIST, { recursive: true, force: true });
await viteBuild({
  configFile: false,
  logLevel: 'warn',
  publicDir: path.join(ROOT, 'public'),
  build: {
    outDir: DIST,
    emptyOutDir: false,
    target: 'es2020',
    modulePreload: false,
    rollupOptions: {
      input: path.join(ROOT, 'src/client/enhance.ts'),
      output: { entryFileNames: 'assets/[name]-[hash].js', format: 'es' },
    },
  },
});
const script = '/assets/' + fs.readdirSync(path.join(DIST, 'assets')).find((f) => f.startsWith('enhance-') && f.endsWith('.js'));

// 3. CSS + first render pass (to learn which characters are used)
const css = (await transformWithEsbuild(fs.readFileSync(path.join(ROOT, 'src/styles/site.css'), 'utf8'), 'site.css', { loader: 'css', minify: true })).code.trim();
const all = routes(site);
const draft: Assets = { css, fontCss: '', preload: [], script };
let text = all.map((r) => htmlText(renderRoute(site, r, draft))).join(' ');
const cardHtml = (fontCss: string) =>
  site.published.flatMap((e) => [renderShareCard(site, e, 'landscape', fontCss), renderShareCard(site, e, 'portrait', fontCss)]);
text += cardHtml('').map(htmlText).join(' ');

// 4. fonts
const fonts = await buildFonts(text, DIST);
const assets: Assets = { css, fontCss: fonts.css, preload: fonts.preload, script };

// 3b. final render
for (const r of all) {
  const html = renderRoute(site, r, assets);
  const file = r.path.endsWith('.html') ? path.join(DIST, r.path) : path.join(DIST, r.path, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// 5. feeds
const lastmod = Object.fromEntries(site.all.map((e) => [e.date, e.updated ?? e.prepared ?? e.date]));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap(site, lastmod));
fs.writeFileSync(path.join(DIST, 'robots.txt'), robots(site));
fs.writeFileSync(path.join(DIST, 'rss.xml'), rss(site));

// 5b. social images (cached by content: an edition's image is regenerated only when its card HTML changes)
if (!args.has('--skip-og')) {
  const cache = path.join(ROOT, '.cache/og');
  fs.mkdirSync(cache, { recursive: true });
  const shots: (Shot & { key: string; dest: string })[] = [];
  for (const e of site.published) {
    for (const [variant, out, w, h, scale] of [
      ['landscape', ogPath(e), 1200, 630, 1],
      ['portrait', cardPath(e), 360, 640, 3],
    ] as const) {
      const html = renderShareCard(site, e, variant, fonts.css);
      const key = (await import('node:crypto')).createHash('sha256').update(html.replace(/-[0-9a-f]{8}\.woff2/g, '')).digest('hex').slice(0, 16);
      shots.push({ html, out: path.join(cache, `${key}.jpg`), width: w, height: h, scale, key, dest: path.join(DIST, out) });
    }
  }
  for (const r of routes(site)) {
    if (r.kind !== 'person') continue;
    const html = renderPersonCard(site, r.character, fonts.css);
    const iconFile = r.character.icon ? path.join(ROOT, 'public/people', `${r.character.slug}-480.webp`) : '';
    const hash = (await import('node:crypto')).createHash('sha256').update(html.replace(/-[0-9a-f]{8}\.woff2/g, ''));
    if (iconFile && fs.existsSync(iconFile)) hash.update(fs.readFileSync(iconFile));
    const key = 'p-' + hash.digest('hex').slice(0, 16);
    shots.push({ html, out: path.join(cache, `${key}.jpg`), width: 1200, height: 630, scale: 1, key, dest: path.join(DIST, personOgPath(r.character.slug)) });
  }
  const todo = shots.filter((s) => !fs.existsSync(s.out));
  await shoot(DIST, todo);
  for (const s of shots) {
    fs.mkdirSync(path.dirname(s.dest), { recursive: true });
    fs.copyFileSync(s.out, s.dest);
  }
  console.log(`social images: ${shots.length} (${todo.length} rendered, ${shots.length - todo.length} cached)`);
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
console.log(`fonts: ${fonts.files.map((f) => `${path.basename(f.file)} ${kb(f.bytes)}`).join(', ')}`);
console.log(`script: ${script} ${kb(fs.statSync(path.join(DIST, script)).size)}`);
console.log(`${all.length} pages in ${((Date.now() - t0) / 1000).toFixed(1)}s, ${site.warnings.length} warning(s)`);
