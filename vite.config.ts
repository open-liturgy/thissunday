import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

/**
 * `npm run dev`: renders pages on request with the same React components the
 * build uses, so edits to YAML, components or CSS show on reload. Fonts are
 * served unsubset in dev. `npm run build` is the real static build.
 */
function prerenderDev(): Plugin {
  const require = createRequire(import.meta.url);
  return {
    name: 'this-sunday-dev',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(path.resolve('content'));
      server.watcher.on('change', (f) => {
        if (f.endsWith('.yaml') || f.endsWith('.css')) server.ws.send({ type: 'full-reload' });
      });
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '/').split('?')[0];
        if (url.startsWith('/@') || url.startsWith('/src/') || url.startsWith('/node_modules/') || /\.\w+$/.test(url) && !url.endsWith('.html')) {
          if (url.startsWith('/dev-fonts/')) {
            const { FACES } = await server.ssrLoadModule('/scripts/fonts.ts');
            const face = FACES.find((f: { id: string }) => `/dev-fonts/${f.id}.woff2` === url);
            if (face) {
              res.setHeader('content-type', 'font/woff2');
              return res.end(fs.readFileSync(require.resolve(face.src)));
            }
          }
          return next();
        }
        try {
          const { renderDev } = await server.ssrLoadModule('/src/dev.ts');
          const html: string | undefined = await renderDev(url);
          if (!html) return next();
          res.setHeader('content-type', 'text/html; charset=utf-8');
          res.end(await server.transformIndexHtml(url, html));
        } catch (e) {
          server.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
    },
  };
}

/**
 * `npm run preview`: appType 'custom' turns off Vite's index.html fallback, so
 * map directory URLs (/, /2026/foo/) to their index.html in dist/.
 */
function previewDirIndex(): Plugin {
  return {
    name: 'this-sunday-preview-index',
    configurePreviewServer(server) {
      const outDir = path.resolve(server.config.build.outDir);
      server.middlewares.use((req, _res, next) => {
        const [url, query] = (req.url || '/').split('?');
        if (!/\.\w+$/.test(url)) {
          const candidate = path.join(outDir, url, 'index.html');
          if (candidate.startsWith(outDir) && fs.existsSync(candidate)) {
            req.url = (url.endsWith('/') ? url : url + '/') + 'index.html' + (query ? '?' + query : '');
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  appType: 'custom',
  plugins: [prerenderDev(), previewDirIndex()],
});
