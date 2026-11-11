import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';
import type { Site } from './content';
import { editionPath, isPlaceholder } from './content';
import type { Edition } from './schema';

/**
 * Character pages. content/people.yaml lists who gets a page and which
 * `people[].name` entries in the editions refer to them. Everything shown on
 * a character page comes from the editions themselves.
 */

const text = z.string().trim().min(1);
const Entry = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase-words-with-hyphens'),
  name: text,
  ml: text.optional(),
  kind: z.enum(['person', 'angel', 'group']).default('person'),
  match: z.array(text).min(1),
  /** Words that find this character in a Sunday's scenes. Defaults from the name and matches. */
  keywords: z.array(text).optional(),
  /** An icon from Wikimedia Commons; files are public/people/{slug}-{240,480}.webp (4:5). */
  icon: z
    .object({
      title: text,
      artist: text.optional(),
      date: text.optional(),
      license: text,
      license_url: z.string().url().optional(),
      source: z.string().url(),
      /** Alt text: what the image shows. */
      alt: text,
    })
    .optional(),
});
const Registry = z.array(Entry);
export type PersonEntry = z.infer<typeof Entry>;
type EditionPerson = Edition['people'][number];

export interface Appearance {
  edition: Edition;
  /** The people entries on that Sunday that refer to this character (one may name several characters). */
  as: EditionPerson[];
  /** Permanent page of the edition. */
  path: string;
  /** Scenes of that Sunday's Gospel that mention this character, with their anchors. */
  scenes: { title: string; verses: string; href: string }[];
}

export interface Character extends PersonEntry {
  path: string;
  appearances: Appearance[];
  /** Distinct name meanings given under the character's own name(s). */
  meanings: { text: string; sunday: string }[];
}

export interface People {
  /** Characters with at least one published appearance, A–Z. */
  list: Character[];
  bySlug: Map<string, Character>;
  /** Character pages for one people entry on one Sunday. */
  linksFor(e: Pick<Edition, 'sunday_slug'>, name: string): Character[];
  warnings: string[];
  errors: string[];
}

export const peoplePath = (slug: string) => `/people/${slug}/`;
export const iconPath = (slug: string, w: 240 | 480) => `/people/${slug}-${w}.webp`;

/** "John the Baptist" → John the Baptist, John; "The Pharisees" → Pharisees. */
function defaultKeywords(p: PersonEntry): string[] {
  const names = [p.name, ...p.match.map((m) => m.replace(/^[a-z0-9-]+:\s*/, ''))].filter((n) => !/ and |, /.test(n) || n === p.name);
  const out = new Set<string>();
  for (const n of names) {
    out.add(n.replace(/^The /i, '').replace(/,.*$/, ''));
    if (p.kind !== 'group' && !/^The /i.test(n)) out.add(n.split(/[ ,]/)[0]);
  }
  return [...out];
}

const sortKey = (s: string) => s.replace(/^The /, '').toLowerCase();
const real = (v?: string): v is string => !!v && !isPlaceholder(v) && v.trim() !== '—';

const cache = new WeakMap<Site, People>();

export function loadPeople(site: Site, root = process.cwd()): People {
  const hit = cache.get(site);
  if (hit) return hit;
  const warnings: string[] = [];
  const errors: string[] = [];
  const file = path.resolve(root, site.tradition.contentDir, 'people.yaml');
  const rel = path.relative(root, file);
  let entries: PersonEntry[] = [];
  if (fs.existsSync(file)) {
    const res = Registry.safeParse(YAML.parse(fs.readFileSync(file, 'utf8'), { schema: 'core' }) ?? []);
    if (res.success) entries = res.data;
    else for (const i of res.error.issues) errors.push(`${rel}: ${i.path.join('.')}: ${i.message}`);
  }

  // "slug: Name" is scoped to one sunday_slug; "Name" matches everywhere.
  const scoped = new Map<string, PersonEntry[]>();
  const global = new Map<string, PersonEntry[]>();
  const seenSlug = new Set<string>();
  for (const p of entries) {
    if (seenSlug.has(p.slug)) errors.push(`${rel}: slug ${p.slug} is used twice`);
    seenSlug.add(p.slug);
    for (const m of p.match) {
      const at = m.match(/^([a-z0-9-]+):\s*(.+)$/);
      const [map, key] = at ? [scoped, `${at[1]}\u0000${at[2]}`] : [global, m];
      map.set(key, [...(map.get(key) ?? []), p]);
    }
  }
  const find = (sundaySlug: string, name: string) => scoped.get(`${sundaySlug}\u0000${name}`) ?? global.get(name) ?? [];

  // Every match should hit at least one edition (catches typos).
  const used = new Set<string>();
  for (const e of site.all) for (const pp of e.people) for (const c of find(e.sunday_slug, pp.name)) used.add(`${c.slug}\u0000${pp.name}`);
  for (const p of entries)
    for (const m of p.match) {
      const name = m.replace(/^[a-z0-9-]+:\s*/, '');
      if (!used.has(`${p.slug}\u0000${name}`)) warnings.push(`${rel}: ${p.slug}: "${m}" matches no one in any edition`);
    }

  const published = new Set(site.published.map((e) => e.date));
  const bySlug = new Map<string, Character>();
  for (const p of entries) {
    const appearances: Appearance[] = [];
    for (const e of site.all) {
      if (!published.has(e.date)) continue;
      const as = e.people.filter((pp) => find(e.sunday_slug, pp.name).includes(p));
      if (!as.length) continue;
      const words = (p.keywords ?? defaultKeywords(p)).map((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'));
      const scenes = e.scenes
        .map((s, i) => ({ title: s.title, verses: s.verses, href: `${editionPath(e)}#scene-${i + 1}`, hay: `${s.title} ${s.text}` }))
        .filter((s) => words.some((w) => w.test(s.hay)))
        .map(({ hay: _, ...s }) => s);
      appearances.push({ edition: e, as, path: editionPath(e), scenes });
    }
    if (!appearances.length) continue;
    // Name meanings: only from entries that name this character alone.
    const meanings: Character['meanings'] = [];
    for (const a of appearances)
      for (const as of a.as) {
        if (find(a.edition.sunday_slug, as.name).length !== 1 || !real(as.name_meaning)) continue;
        const t = as.name_meaning.trim();
        if (!meanings.some((m) => m.text === t)) meanings.push({ text: t, sunday: a.edition.name.en });
      }
    bySlug.set(p.slug, { ...p, path: peoplePath(p.slug), appearances, meanings });
  }
  const list = [...bySlug.values()].sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)));

  const people: People = {
    list,
    bySlug,
    linksFor(e, name) {
      return find(e.sunday_slug, name)
        .map((p) => bySlug.get(p.slug))
        .filter((c): c is Character => !!c);
    },
    warnings,
    errors,
  };
  cache.set(site, people);
  return people;
}
