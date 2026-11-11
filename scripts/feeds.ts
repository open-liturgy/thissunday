import { Feed } from 'feed';
import type { Site } from '../src/lib/content';
import { editionPath } from '../src/lib/content';
import { gospelOf } from '../src/components/Sunday';
import { ogPath, pageDescription } from '../src/render';
import { longDate } from '../src/lib/i18n';
import { loadPeople } from '../src/lib/people';

const x = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function sitemap(site: Site, lastmod: Record<string, string>): string {
  const base = site.tradition.site.url;
  const urls: string[] = [];
  const add = (loc: string, mod?: string, alts?: Record<string, string>) =>
    urls.push(
      `<url><loc>${base}${loc}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}${
        alts
          ? Object.entries(alts)
              .map(([l, p]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${base}${p}"/>`)
              .join('')
          : ''
      }</url>`,
    );
  // '/' is left out: it duplicates the upcoming edition and canonicalises to it.
  add('/archive/', site.upcoming && lastmod[site.upcoming.date]);
  for (const p of site.pages) {
    const alts = Object.keys(p.alternates).length > 1 ? { ...(p.alternates as Record<string, string>), 'x-default': p.alternates.en! } : undefined;
    add(p.path, lastmod[p.edition.date], alts);
  }
  const people = loadPeople(site);
  const latest = (dates: string[]) => dates.map((d) => lastmod[d]).filter(Boolean).sort().at(-1);
  if (people.list.length) add('/people/', latest(people.list.flatMap((c) => c.appearances.map((a) => a.edition.date))));
  for (const c of people.list) add(c.path, latest(c.appearances.map((a) => a.edition.date)));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

export function robots(site: Site): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${site.tradition.site.url}/sitemap.xml\n`;
}

export function rss(site: Site): string {
  const base = site.tradition.site.url;
  const t = site.tradition.site;
  const feed = new Feed({
    title: t.name,
    description: t.about,
    id: `${base}/`,
    link: `${base}/`,
    language: 'en',
    copyright: t.contentLicence.startsWith('[') ? `${t.publisher}` : t.contentLicence,
    feedLinks: { rss: `${base}/rss.xml` },
    updated: site.upcoming ? new Date(`${site.upcoming.prepared ?? site.upcoming.date}T00:00:00Z`) : undefined,
  });
  for (const e of [...site.published].reverse()) {
    const url = base + editionPath(e);
    feed.addItem({
      title: `${e.name.en} (${longDate(e.date)})`,
      id: url,
      link: url,
      description: pageDescription(e),
      content: `<p>${x(e.standfirst)}</p><p><strong>Gospel:</strong> ${x(gospelOf(e).ref)}</p><p><strong>Question for the family:</strong> ${x(e.week.question)}</p>`,
      date: new Date(`${e.prepared ?? e.date}T00:00:00Z`),
      image: base + ogPath(e),
    });
  }
  return feed.rss2();
}
