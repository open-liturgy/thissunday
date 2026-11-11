import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import type { Graph, Thing } from 'schema-dts';
import type { Page, Site } from './lib/content';
import { editionPath, isPlaceholder } from './lib/content';
import type { Edition } from './lib/schema';
import type { Lang } from './lib/tradition';
import { longDate, strings } from './lib/i18n';
import { Sunday, gospelOf } from './components/Sunday';
import { Archive, NotFound, ShareCard, shareCardCss } from './components/Pages';
import { PeopleIndex, PersonPage, peopleText } from './components/People';
import { iconPath, loadPeople, type Character } from './lib/people';

export interface Assets {
  /** Minified site CSS, inlined. */
  css: string;
  /** @font-face rules, inlined. */
  fontCss: string;
  /** Font URLs to preload. */
  preload: string[];
  /** Public path of the client script, if any. */
  script?: string;
}

export type Route =
  | { kind: 'sunday'; path: string; page: Page; isHome?: boolean }
  | { kind: 'archive'; path: string }
  | { kind: 'redirect'; path: string; to: string }
  | { kind: 'people'; path: string }
  | { kind: 'person'; path: string; character: Character }
  | { kind: 'notfound'; path: string };

export function routes(site: Site): Route[] {
  const out: Route[] = [];
  const home = site.pages.find((p) => p.lang === 'en' && p.edition.date === site.upcoming?.date);
  if (home) out.push({ kind: 'sunday', path: '/', page: home, isHome: true });
  for (const p of site.pages) out.push({ kind: 'sunday', path: p.path, page: p });
  out.push({ kind: 'archive', path: '/all-sundays/' });
  // The page used to live at /archive/; keep that address working.
  out.push({ kind: 'redirect', path: '/archive/', to: '/all-sundays/' });
  const people = loadPeople(site);
  if (people.list.length) {
    out.push({ kind: 'people', path: '/people/' });
    for (const c of people.list) out.push({ kind: 'person', path: c.path, character: c });
  }
  out.push({ kind: 'notfound', path: '/404.html' });
  return out;
}

export const ogPath = (e: Edition) => `/og/${e.date}.jpg`;
export const cardPath = (e: Edition) => `/og/${e.date}-card.jpg`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function coloursFor(site: Site, e?: Edition) {
  const c = site.tradition.colours;
  return e?.season.colors ?? (e && (c.bySlug?.[e.sunday_slug] ?? c.bySeason?.[e.season.en])) ?? c.default;
}

export function pageTitle(e: Edition, lang: Lang = 'en') {
  return `${strings[lang].titleSuffix(e.name.en, longDate(e.date))} | This Sunday`;
}

export function pageDescription(e: Edition) {
  if (e.description) return e.description;
  const g = gospelOf(e).ref;
  return `Readings for the ${e.name.en}, ${longDate(e.date)}: ${g} explained, with a reflection and a question for the family.`.slice(0, 154);
}

/** ISO 8601 duration from "2:59". */
const isoDuration = (d: string) => {
  const [m, s] = d.split(':').map(Number);
  return `PT${m}M${s}S`;
};

function jsonLd(site: Site, page: Page, canonical: string): Graph {
  const e = page.edition;
  const base = site.tradition.site.url;
  const abs = (p: string) => base + p;
  const r = e.reflection;
  const author = !isPlaceholder(r.author)
    ? { '@type': 'Person', name: r.author }
    : { '@id': `${base}/#org` };
  const reviewer = e.reviewed && r.reviewer && !isPlaceholder(r.reviewer) ? r.reviewer : undefined;
  const published = e.prepared ?? e.date;
  const audio = e.audio && !isPlaceholder(e.audio.src) ? e.audio : undefined;
  const people = loadPeople(site);
  const mentions = [...new Map(e.people.flatMap((p) => people.linksFor(e, p.name)).map((c) => [c.slug, c])).values()];
  const article: Thing = {
    '@type': 'Article',
    '@id': `${canonical}#article`,
    headline: strings[page.lang].titleSuffix(e.name.en, longDate(e.date)),
    description: pageDescription(e),
    datePublished: published,
    dateModified: e.updated ?? published,
    inLanguage: page.lang,
    author: author as never,
    publisher: { '@id': `${base}/#org` },
    image: [abs(ogPath(e))],
    mainEntityOfPage: { '@id': canonical },
    about: { '@type': 'Thing', name: `${gospelOf(e).ref}` },
    articleSection: e.season.en,
    ...(mentions.length ? { mentions: mentions.map((c) => ({ '@id': `${base}${c.path}#about` })) } : {}),
    ...(audio
      ? {
          audio: {
            '@type': 'AudioObject',
            name: `${e.name.en}: audio preparation`,
            contentUrl: new URL(audio.src, `${base}/`).href,
            encodingFormat: audio.src.endsWith('.mp3') ? 'audio/mpeg' : audio.src.endsWith('.m4a') ? 'audio/mp4' : 'audio/ogg',
            duration: isoDuration(audio.duration),
            inLanguage: audio.language,
            ...(audio.transcript ? { transcript: audio.transcript.join('\n\n') } : {}),
          },
        }
      : {}),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${base}/#org`, name: site.tradition.site.publisher, url: `${base}/` },
      { '@type': 'WebSite', '@id': `${base}/#website`, name: site.tradition.site.name, url: `${base}/`, inLanguage: site.tradition.languages },
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: pageTitle(e, page.lang),
        inLanguage: page.lang,
        isPartOf: { '@id': `${base}/#website` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        primaryImageOfPage: { '@type': 'ImageObject', url: abs(ogPath(e)), width: '1200', height: '630' },
        mainEntity: { '@id': `${canonical}#article` },
        ...(reviewer ? { reviewedBy: { '@type': 'Person', name: reviewer }, lastReviewed: e.updated ?? published } : {}),
      },
      article,
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site.tradition.site.name, item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: strings.en.archive, item: `${base}/all-sundays/` },
          { '@type': 'ListItem', position: 3, name: e.name.en, item: canonical },
        ],
      },
    ],
  } as Graph;
}

/**
 * On a non-English page the root is lang="ml", so any text that was not
 * translated (English names, Bible references, the English verse, untranslated
 * fields) would inherit the wrong language. Mark every leaf element whose text
 * has Latin letters and no Malayalam as lang="en". Elements that already carry
 * a lang attribute are left alone.
 */
export function markEnglish(html: string): string {
  return html.replace(/<([a-z][a-z0-9]*)((?:\s[^<>]*)?)>([^<>]+)<\/\1>/g, (m, tag: string, attrs: string, text: string) => {
    if (/\slang=/.test(attrs) || tag === 'script' || tag === 'style') return m;
    if (!/[A-Za-z]/.test(text) || /[ഀ-ൿ]/.test(text)) return m;
    return `<${tag}${attrs} lang="en">${text}</${tag}>`;
  });
}

function doc({
  lang,
  title,
  description,
  canonical,
  head,
  body,
  assets,
  colours,
  robots,
}: {
  lang: Lang;
  title: string;
  description: string;
  canonical?: string;
  head: string[];
  body: ReactElement;
  assets: Assets;
  colours: { ground: string; glow: string };
  robots?: string;
}) {
  const html = lang === 'en' ? renderToStaticMarkup(body) : markEnglish(renderToStaticMarkup(body));
  return `<!doctype html>
<html lang="${lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.className='js'</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
${robots ? `<meta name="robots" content="${robots}">` : ''}
<meta name="theme-color" content="${colours.ground}">
${assets.preload.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="This Sunday" href="/rss.xml">
${head.join('\n')}
<style>${assets.fontCss}${assets.css}:root{--ground:${colours.ground};--glow:${colours.glow};--ink:${colours.ground}}</style>
${assets.script ? `<script type="module" src="${assets.script}"></script>` : ''}
</head>
<body>
${html}
</body>
</html>
`;
}

/** Open Graph and Twitter tags. Every page shares a Sunday's own 1200x630 image. */
function socialMeta(
  site: Site,
  o: { type: 'article' | 'website' | 'profile'; title: string; description: string; url: string; image: Edition; lang?: Lang; alternateLocale?: boolean },
): string[] {
  const base = site.tradition.site.url;
  const e = o.image;
  const img = base + ogPath(e);
  const lang = o.lang ?? 'en';
  const locale = (l: Lang) => (l === 'ml' ? 'ml_IN' : 'en_IN');
  const other: Lang = lang === 'ml' ? 'en' : 'ml';
  const alt = esc(`${e.name.en}, ${longDate(e.date)}. ${e.key_verse.ref}: ${e.key_verse.en}`);
  return [
    `<meta property="og:type" content="${o.type}">`,
    `<meta property="og:site_name" content="${esc(site.tradition.site.name)}">`,
    `<meta property="og:title" content="${esc(o.title)}">`,
    `<meta property="og:description" content="${esc(o.description)}">`,
    `<meta property="og:url" content="${o.url}">`,
    `<meta property="og:locale" content="${locale(lang)}">`,
    ...(o.alternateLocale ? [`<meta property="og:locale:alternate" content="${locale(other)}">`] : []),
    `<meta property="og:image" content="${img}">`,
    `<meta property="og:image:secure_url" content="${img}">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${alt}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(o.title)}">`,
    `<meta name="twitter:description" content="${esc(o.description)}">`,
    `<meta name="twitter:image" content="${img}">`,
    `<meta name="twitter:image:alt" content="${alt}">`,
  ];
}

function nextAppearance(c: Character, upcoming?: Edition): Edition | undefined {
  const eds = c.appearances.map((a) => a.edition).filter((e) => e.date).sort((a, b) => a.date.localeCompare(b.date));
  return (upcoming && eds.find((e) => e.date >= upcoming.date)) ?? eds.at(-1) ?? upcoming;
}

/** Where an edition sits in the year: its place in its season's run of Sundays, and the total. */
function yearPlace(site: Site, e: Edition): { total: number; k: number; n: number; season: string } {
  // Runs are found on the English editions; `e` may be a translation, so only its season label is used.
  const i = site.all.findIndex((x) => x.date === e.date);
  const s = site.all[i].season.en;
  let a = i;
  let b = i;
  while (a > 0 && site.all[a - 1].season.en === s) a--;
  while (b < site.all.length - 1 && site.all[b + 1].season.en === s) b++;
  return { total: site.all.length, k: i - a + 1, n: b - a + 1, season: isPlaceholder(s) ? s : e.season.en };
}

export function renderRoute(site: Site, route: Route, assets: Assets): string {
  const { tradition } = site;
  const base = tradition.site.url;
  if (route.kind === 'sunday') {
    const { page } = route;
    const e = page.edition;
    const t = strings[page.lang];
    const canonical = base + page.path;
    const { prev, next } = site.neighbours(e);
    const head: string[] = [];
    // hreflang: every language version lists all versions plus x-default.
    if (Object.keys(page.alternates).length > 1) {
      for (const [l, p] of Object.entries(page.alternates)) head.push(`<link rel="alternate" hreflang="${l}" href="${base}${p}">`);
      head.push(`<link rel="alternate" hreflang="x-default" href="${base}${page.alternates.en}">`);
    }
    if (prev?.path) head.push(`<link rel="prev" href="${base}${prev.path}">`);
    if (next?.path) head.push(`<link rel="next" href="${base}${next.path}">`);
    const title = pageTitle(e, page.lang);
    const desc = pageDescription(e);
    head.push(
      ...socialMeta(site, {
        type: 'article',
        title: strings[page.lang].titleSuffix(e.name.en, longDate(e.date)),
        description: desc,
        url: canonical,
        image: e,
        lang: page.lang,
        alternateLocale: Object.keys(page.alternates).length > 1,
      }),
      `<meta property="article:published_time" content="${e.prepared ?? e.date}">`,
      ...(e.updated ? [`<meta property="article:modified_time" content="${e.updated}">`] : []),
      `<script type="application/ld+json">${JSON.stringify(jsonLd(site, page, canonical)).replace(/</g, '\\u003c')}</script>`,
    );
    return doc({
      lang: page.lang,
      title,
      description: desc,
      canonical,
      head,
      assets,
      colours: coloursFor(site, e),
      body: (
        <Sunday
          page={page}
          t={t}
          tradition={tradition}
          prev={prev}
          next={next}
          canonical={canonical}
          cardImage={cardPath(e)}
          homeHref="/"
          personLinks={(name) => loadPeople(site).linksFor(e, name)}
          year={yearPlace(site, e)}
        />
      ),
    });
  }
  if (route.kind === 'redirect') {
    const to = `${base}${route.to}`;
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moved to All Sundays | This Sunday</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${to}">
<meta http-equiv="refresh" content="0; url=${route.to}">
</head>
<body>
<p>This page has moved to <a href="${route.to}">All Sundays</a>.</p>
</body>
</html>
`;
  }
  if (route.kind === 'archive') {
    const t = strings.en;
    return doc({
      lang: 'en',
      title: `All Sundays: Malankara Orthodox readings for the whole year | This Sunday`,
      description: `Every edition of This Sunday: the readings, the Gospel explained and a family question for each Sunday of the Malankara Orthodox Church year.`,
      canonical: `${base}/all-sundays/`,
      head: site.upcoming
        ? socialMeta(site, {
            type: 'website',
            title: 'All Sundays | This Sunday',
            description: `Every edition of This Sunday: the readings, the Gospel explained and a family question for each Sunday of the Malankara Orthodox Church year.`,
            url: `${base}/all-sundays/`,
            image: site.upcoming,
          })
        : [],
      assets: { ...assets, script: undefined },
      colours: coloursFor(site),
      body: <Archive site={site} t={t} colours={(e) => coloursFor(site, e)} />,
    });
  }
  if (route.kind === 'people' || route.kind === 'person') {
    const t = strings.en;
    const people = loadPeople(site);
    const canonical = base + route.path;
    const crumbs = [
      { name: tradition.site.name, item: `${base}/` },
      { name: peopleText.index, item: `${base}/people/` },
    ];
    const ld = (extra: Thing[], name: string, page: Record<string, unknown> = {}) =>
      `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebPage', '@id': canonical, url: canonical, name, inLanguage: 'en', isPartOf: { '@id': `${base}/#website` }, breadcrumb: { '@id': `${canonical}#breadcrumb` }, ...page },
          ...extra,
        ],
      }).replace(/</g, '\\u003c')}</script>`;
    const social = (type: 'website' | 'profile', title: string, description: string, image = site.upcoming) =>
      image ? socialMeta(site, { type, title, description, url: canonical, image }) : [];
    if (route.kind === 'people') {
      const title = `${peopleText.indexTitle} | This Sunday`;
      const description = `Who is who in the Sunday readings of the Malankara Orthodox Church: ${people.list.length} people and groups, with every Sunday they appear in.`;
      const breadcrumb = { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, ...c })) };
      const list = { '@type': 'ItemList', itemListElement: people.list.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: base + c.path })) };
      return doc({
        lang: 'en',
        title,
        description,
        canonical,
        head: [...social('website', peopleText.indexTitle, description), ld([breadcrumb as Thing, list as Thing], peopleText.indexTitle)],
        assets: { ...assets, script: undefined },
        colours: coloursFor(site),
        body: <PeopleIndex site={site} people={people} t={t} />,
      });
    }
    const c = route.character;
    const n = c.appearances.length;
    const sundays = c.appearances.map((a) => a.edition.name.en);
    const title = c.life ? `${c.name}: life, Bible passages and Sundays | This Sunday` : `${c.name} in the Sunday readings | This Sunday`;
    const fromLife = c.life && (c.life.summary.length <= 155 ? c.life.summary : c.life.summary.slice(0, 154).replace(/\s+\S*$/, '') + '…');
    const description = fromLife || (
      n === 1
        ? `${c.name} in the Malankara Orthodox Sunday readings: the ${sundays[0]}, ${gospelOf(c.appearances[0].edition).ref}. What the Gospel says and what the name means.`
        : `${c.name} in the Malankara Orthodox Sunday readings: ${n} Sundays, including the ${sundays[0]} and the ${sundays.at(-1)}.`
    ).slice(0, 155);
    const breadcrumb = {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [...crumbs, { name: c.name, item: canonical }].map((x, i) => ({ '@type': 'ListItem', position: i + 1, ...x })),
    };
    const about = {
      '@type': c.kind === 'person' ? 'Person' : 'Thing',
      '@id': `${canonical}#about`,
      name: c.name,
      ...(c.ml ? { alternateName: c.ml } : {}),
      subjectOf: c.appearances.map((a) => ({ '@id': `${base}${a.path}#article` })),
      ...(c.icon ? { image: { '@type': 'ImageObject', contentUrl: base + iconPath(c.slug, 480), creditText: [c.icon.artist, c.icon.title].filter(Boolean).join(', '), license: c.icon.license_url ?? c.icon.source, acquireLicensePage: c.icon.source } } : {}),
    };
    return doc({
      lang: 'en',
      title,
      description,
      canonical,
      head: [
        // The person's next Sunday from the upcoming one on, else their most recent.
        ...social(c.kind === 'person' ? 'profile' : 'website', `${c.name} in the Sunday readings`, description, nextAppearance(c, site.upcoming)),
        ld([breadcrumb as Thing, about as Thing], title, { about: { '@id': `${canonical}#about` } }),
      ],
      assets: { ...assets, script: undefined },
      colours: coloursFor(site),
      body: <PersonPage site={site} people={people} c={c} t={t} />,
    });
  }
  return doc({
    lang: 'en',
    title: 'Page not found | This Sunday',
    description: 'This page does not exist.',
    head: [],
    robots: 'noindex',
    assets: { ...assets, script: undefined },
    colours: coloursFor(site),
    body: <NotFound site={site} t={strings.en} />,
  });
}

/** Standalone HTML for a social image, screenshotted at build. */
export function renderShareCard(site: Site, e: Edition, variant: 'landscape' | 'portrait', fontCss: string): string {
  const c = coloursFor(site, e);
  const host = isPlaceholder(site.tradition.site.url) ? '' : site.tradition.site.url.replace(/^https?:\/\//, '');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${fontCss}:root{--ground:${c.ground};--glow:${c.glow};--ink:${c.ground}}${shareCardCss}</style></head><body>${renderToStaticMarkup(
    <ShareCard e={e} siteHost={host} variant={variant} />,
  )}</body></html>`;
}

export { editionPath };
