# This Sunday · ഈ ഞായറാഴ്ച

One page for the coming Sunday in the Malankara Orthodox Syrian Church: the readings, a short explanation of the Gospel, a reflection and one question for the family. Open it on Saturday evening and be ready for Qurbana in five minutes.

Static, SEO-first, and complete with JavaScript turned off.

This Sunday is open source and welcomes help: fix a reading note, translate a Sunday, or improve the site. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Found a mistake on a page? [Report a correction](https://github.com/open-liturgy/thissunday/issues/new?template=content-correction.yml).

## How it works

- **Vite + React, rendered at build time.** `scripts/build.ts` renders every page to full HTML with `react-dom/server`. No React ships to the browser.
- **One small script** (`src/client/enhance.ts`, about 2 KB gzipped) turns the service list and the five scenes into tabs, runs the audio player, highlights the phone section chips and opens the share sheet. Without it, everything is still on the page.
- **Content is YAML, validated with Zod** (`src/lib/schema.ts`, documented in [docs/CONTENT.md](docs/CONTENT.md)). The build fails on invalid content and warns for every `[PLACEHOLDER]`.
- **Fonts are self-hosted and subset at build** to the characters the pages use, with variable axes trimmed to the ranges the CSS uses (`scripts/fonts.ts`).
- **Social images** (1200×630 Open Graph and the portrait share card) are screenshots of an HTML card in headless Chromium, so Malayalam shapes correctly (`scripts/og.ts`). They are cached by content in `.cache/og`.
- **SEO**: one `<h1>`, ordered headings, `lang="ml"`/`lang="syr"`, canonical URLs, Open Graph and Twitter tags, JSON-LD (`WebPage` with `reviewedBy`, `Article`, `BreadcrumbList`, `AudioObject`), `sitemap.xml`, `robots.txt`, `rss.xml`, `hreflang` for Malayalam pages, previous/next links.

## URLs

| Path | What |
| --- | --- |
| `/` | The upcoming Sunday. Canonical points to its permanent page. |
| `/{year}/{sunday_slug}/` | Permanent page for one edition. |
| `/ml/{year}/{sunday_slug}/` | Malayalam edition, only when the edition has `translations.ml`. |
| `/all-sundays/` | All Sundays: every edition, season by season. Linked from the top nav, the phone section bar and the end of every Sunday page. `/archive/` redirects here. |
| `/og/{date}.jpg`, `/og/{date}-card.jpg` | Social image and share card. |

## Commands

```sh
npm install
npm run dev        # dev server with live content, http://localhost:5173
npm run check      # validate content and list placeholders
npm run build      # typecheck + full static build into dist/
npm run build:fast # skip social images
npm run preview    # serve dist/ on :4173
npm run preview:all # build with placeholder blocks shown, then serve, for local review
npm run lhci       # Lighthouse CI with the budgets in lighthouserc.json
```

Social images need Chromium. The build looks for `CHROME_PATH`, then Playwright's Chromium, then system Chrome. Run `npx playwright-core install chromium` if none is found.

The site lives at https://sunday.palli.site, set as `site.url` in `traditions/mosc/config.ts`. Set `SITE_URL` to build for another address (canonical, Open Graph and feed URLs all follow it).

## Add a Sunday

1. If this Sunday's year-independent text is not there yet, add `content/lectionary/{sunday_slug}.yaml` (readings with notes, scenes, people, phrases, key verse).
2. Add `content/sundays/{YYYY-MM-DD}.yaml` with the date, `sunday_slug`, `week_of_year`, standfirst, one-minute cards, reflection and week. Anything you repeat from the lectionary file overrides it.
3. Put any audio file in `public/audio/` and set `audio.src: /audio/{date}.mp3`.
4. Run `npm run check`, fix errors, and resolve each placeholder warning or leave it for review.
5. Set `reviewed: true` once a priest or editor has checked it. Open a pull request.

Every edition is published as soon as it is merged; the home page shows the upcoming Sunday. Build with `PUBLISH_UPCOMING_ONLY=1` to restore week-by-week release, where each page goes live in the week of its Sunday.

## Add another church tradition

Nothing in `src/` names a church. A tradition is a config file plus a content folder:

1. Copy `traditions/mosc/config.ts` to `traditions/{id}/config.ts`. Set the site name, `contentDir`, services (the keys used under `readings:`), reading-kind labels, Bible translations, lectionary name and season colours.
2. Create the content folder with `sundays/` and `lectionary/`.
3. Build with `TRADITION={id} SITE_URL=https://... npm run build` and deploy that `dist/` to its own host.

Interface wording lives in `src/lib/i18n.ts`. Add a language there and to the config's `languages`.

## Deploy

`dist/` is plain static files; any static host works (GitHub Pages, Cloudflare Pages, Netlify, S3). Serve `404.html` for missing pages.

`.github/workflows/site.yml` builds on every push and pull request, runs Lighthouse CI (fails below SEO 100, Accessibility 100, Performance 95, or over the LCP, CLS, JS and page-weight budgets) and deploys `main` to GitHub Pages. A weekly schedule (Monday 00:05 India time) rebuilds so `/` moves to the next Sunday. `SITE_URL` defaults to https://sunday.palli.site (override it with a repository variable), `public/CNAME` points Pages at that domain, and Pages must be enabled with "GitHub Actions" as the source.

### Deploy on Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `SITE_URL=https://sunday.palli.site`, `NODE_VERSION=22`

Social images need Chromium. If the Cloudflare build image lacks it, use `npx playwright-core install chromium && npm run build` as the build command, or `npm run build:fast` to skip social images; nothing else needs to change. `public/_headers` gives fonts, scripts and social images a one-year immutable cache.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run the site, add or fix a Sunday, translate, and get a change reviewed. Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Licence

- **Code** (everything outside `content/`): [MIT](LICENSE).
- **Content** (everything under `content/`: reading notes, reflections, questions, translations): [CC BY-SA 4.0](LICENSE-CONTENT.md).
- **Bible text** quoted on the pages is public domain: the 1910 Sathyavedapusthakam (Malayalam) and the World English Bible.
- **Fonts**: SIL Open Font License (Anek Malayalam, Newsreader, Noto Sans Syriac Western).
