import fs from 'node:fs';
import { loadTradition } from './lib/tradition';
import { loadSite } from './lib/content';
import { renderRoute, routes } from './render';
import { FACES } from '../scripts/fonts';

/** Dev-server renderer: fresh content on every request. */
export async function renderDev(url: string): Promise<string | undefined> {
  const site = loadSite(await loadTradition());
  for (const e of site.errors) console.error(`content error: ${e}`);
  const path = url.endsWith('/') || url.endsWith('.html') ? url : `${url}/`;
  const all = routes(site);
  const route = all.find((r) => r.path === path) ?? all.find((r) => r.kind === 'notfound')!;
  const fontCss = FACES.map(
    (f) =>
      `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};${f.stretch ? `font-stretch:${f.stretch};` : ''}font-display:swap;src:url(/dev-fonts/${f.id}.woff2) format('woff2');unicode-range:${f.range.replace(/\s+/g, '')}}`,
  ).join('');
  return renderRoute(site, route, {
    css: fs.readFileSync('src/styles/site.css', 'utf8'),
    fontCss,
    preload: [],
    script: '/src/client/enhance.ts',
  });
}
