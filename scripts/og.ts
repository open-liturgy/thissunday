/**
 * Social images, screenshotted from HTML in headless Chromium so Malayalam
 * shapes correctly (SVG-to-PNG libraries do not handle Indic conjuncts).
 *
 * Browser: CHROME_PATH, else Playwright's bundled Chromium, else system Chrome.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, type Browser } from 'playwright-core';

function findChrome(): string | undefined {
  const candidates = [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (!fs.existsSync(c)) continue;
    if (fs.statSync(c).isFile()) return c;
    // Playwright cache dir: find chrome binary inside.
    const hit = findIn(c, /^(chrome|headless_shell)$/);
    if (hit) return hit;
  }
  return undefined;
}
function findIn(dir: string, re: RegExp, depth = 4): string | undefined {
  if (depth < 0) return;
  for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, n.name);
    if (n.isFile() && re.test(n.name)) return p;
    if (n.isDirectory()) {
      const r = findIn(p, re, depth - 1);
      if (r) return r;
    }
  }
}

export interface Shot {
  html: string;
  out: string;
  width: number;
  height: number;
  scale: number;
}

/** Serves dist/ so the card HTML can load /fonts/*. */
function serve(root: string): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve) => {
    const pages = new Map<string, string>();
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent((req.url || '/').split('?')[0]);
      if (pages.has(u)) {
        res.setHeader('content-type', 'text/html; charset=utf-8');
        return res.end(pages.get(u));
      }
      const f = path.join(root, u);
      if (f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile()) {
        res.setHeader('content-type', f.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream');
        return res.end(fs.readFileSync(f));
      }
      res.statusCode = 404;
      res.end();
    });
    srv.listen(0, '127.0.0.1', () => {
      const port = (srv.address() as { port: number }).port;
      Object.assign(srv, { pages });
      resolve({ url: `http://127.0.0.1:${port}`, close: () => srv.close() });
      (globalThis as Record<string, unknown>).__ogPages = pages;
    });
  });
}

export async function shoot(distDir: string, shots: Shot[]): Promise<void> {
  if (!shots.length) return;
  const exe = findChrome();
  let browser: Browser;
  try {
    browser = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : { channel: 'chrome' });
  } catch (err) {
    throw new Error(`No Chromium found for social images. Set CHROME_PATH or run "npx playwright install chromium". (${(err as Error).message})`);
  }
  const { url, close } = await serve(path.resolve(distDir));
  const pages = (globalThis as Record<string, unknown>).__ogPages as Map<string, string>;
  try {
    for (const [i, s] of shots.entries()) {
      pages.set(`/__card${i}.html`, s.html);
      const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.scale });
      const page = await ctx.newPage();
      await page.goto(`${url}/__card${i}.html`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      fs.mkdirSync(path.dirname(s.out), { recursive: true });
      await page.screenshot({ path: s.out, type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: s.width, height: s.height } });
      await ctx.close();
    }
  } finally {
    close();
    await browser.close();
  }
}
