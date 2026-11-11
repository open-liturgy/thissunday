import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { Edition } from './schema';
import type { Lang, TraditionConfig } from './tradition';

export interface Page {
  lang: Lang;
  edition: Edition;
  /** Path of the permanent page, e.g. /2026/annunciation-to-zechariah/ */
  path: string;
  /** Other-language versions of this page that exist, keyed by language. */
  alternates: Partial<Record<Lang, string>>;
}

export interface Neighbour {
  edition: Edition;
  /** Present only when the page is published. */
  path?: string;
}

export interface Site {
  tradition: TraditionConfig;
  /** All valid editions, oldest first. */
  all: Edition[];
  /** Editions that are published: everything up to and including the upcoming Sunday. */
  published: Edition[];
  upcoming: Edition | undefined;
  pages: Page[];
  warnings: string[];
  errors: string[];
  neighbours(e: Edition): { prev?: Neighbour; next?: Neighbour };
}

const PLACEHOLDER = /\[[A-Z][A-Z0-9 ,.'’/-]*\]/g;

/** PREVIEW_ALL=1: publish every edition and show placeholder blocks, for local review only. */
export const PREVIEW_ALL = process.env.PREVIEW_ALL === '1';

export const isPlaceholder = (v: unknown): boolean => !PREVIEW_ALL && typeof v === 'string' && /^\s*\[[A-Z][^\]]*\]\s*$/.test(v);

export function editionPath(e: Pick<Edition, 'date' | 'sunday_slug'>, lang: Lang = 'en'): string {
  const year = e.date.slice(0, 4);
  return `${lang === 'en' ? '' : `/${lang}`}/${year}/${e.sunday_slug}/`;
}

/** Objects merge key by key; arrays and scalars from `over` replace `base`. */
export function deepMerge<T>(base: unknown, over: unknown): T {
  if (over === undefined) return base as T;
  if (isObj(base) && isObj(over)) {
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(over)) out[k] = deepMerge(base[k], v);
    return out as T;
  }
  return over as T;
}
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

function readYaml(file: string): Record<string, unknown> {
  // YAML 1.2 core schema: dates stay strings.
  return YAML.parse(fs.readFileSync(file, 'utf8'), { schema: 'core' }) ?? {};
}

function walkStrings(v: unknown, at: string, fn: (s: string, at: string) => void) {
  if (typeof v === 'string') fn(v, at);
  else if (Array.isArray(v)) v.forEach((x, i) => walkStrings(x, `${at}[${i}]`, fn));
  else if (isObj(v)) for (const [k, x] of Object.entries(v)) walkStrings(x, at ? `${at}.${k}` : k, fn);
}

/** Today's date (YYYY-MM-DD) in the tradition's time zone. BUILD_DATE overrides it. */
export function today(tz: string): string {
  if (process.env.BUILD_DATE) return process.env.BUILD_DATE;
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function loadSite(tradition: TraditionConfig, root = process.cwd()): Site {
  const dir = path.resolve(root, tradition.contentDir);
  const warnings: string[] = [];
  const errors: string[] = [];
  const all: Edition[] = [];
  const raw = new Map<string, Record<string, unknown>>();

  const sundaysDir = path.join(dir, 'sundays');
  const files = fs.existsSync(sundaysDir) ? fs.readdirSync(sundaysDir).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
  for (const f of files) {
    const rel = path.relative(root, path.join(sundaysDir, f));
    let data: Record<string, unknown>;
    try {
      data = readYaml(path.join(sundaysDir, f));
    } catch (err) {
      errors.push(`${rel}: YAML error: ${(err as Error).message}`);
      continue;
    }
    const slug = data.sunday_slug;
    let merged: Record<string, unknown> = data;
    if (typeof slug === 'string') {
      const lect = path.join(dir, 'lectionary', `${slug}.yaml`);
      if (fs.existsSync(lect)) merged = deepMerge(readYaml(lect), data);
    }
    const res = Edition.safeParse(merged);
    if (!res.success) {
      for (const i of res.error.issues) errors.push(`${rel}: ${i.path.join('.') || '(root)'}: ${i.message}`);
      continue;
    }
    const e = res.data;
    if (`${e.date}.yaml` !== f && `${e.date}.yml` !== f) warnings.push(`${rel}: file name does not match date ${e.date}`);
    walkStrings(merged, '', (s, at) => {
      for (const m of s.match(PLACEHOLDER) ?? []) warnings.push(`${rel}: placeholder ${m} at ${at}`);
    });
    const gospel = Object.values(e.readings).flat().find((r) => r.main);
    if (!e.description) warnings.push(`${rel}: no description; a generated one is used`);
    else if (gospel && !e.description.includes(gospel.ref)) warnings.push(`${rel}: description should name the Gospel (${gospel.ref})`);
    if (!e.reviewed) warnings.push(`${rel}: reviewed is false; "Reviewed by" is hidden until a priest or editor signs off`);
    raw.set(e.date, merged);
    all.push(e);
  }

  // Duplicate dates or permanent URLs.
  const seen = new Map<string, string>();
  for (const e of all) {
    const p = editionPath(e);
    if (seen.has(p)) errors.push(`two editions map to ${p} (${seen.get(p)} and ${e.date})`);
    seen.set(p, e.date);
  }

  all.sort((a, b) => a.date.localeCompare(b.date));
  const now = today(tradition.site.timeZone);
  const upcoming = all.find((e) => e.date >= now) ?? all.at(-1);
  const published = PREVIEW_ALL ? all : upcoming ? all.filter((e) => e.date <= upcoming.date) : [];

  const pages: Page[] = [];
  for (const e of published) {
    const alternates: Partial<Record<Lang, string>> = { en: editionPath(e, 'en') };
    let ml: Edition | undefined;
    const tr = (raw.get(e.date)?.translations as Record<string, unknown> | undefined)?.ml;
    if (tr && tradition.languages.includes('ml')) {
      const res = Edition.safeParse(deepMerge(raw.get(e.date), { ...(tr as object), translations: undefined }));
      if (res.success) {
        ml = res.data;
        alternates.ml = editionPath(e, 'ml');
      } else {
        for (const i of res.error.issues) errors.push(`${e.date} translations.ml: ${i.path.join('.')}: ${i.message}`);
      }
    }
    pages.push({ lang: 'en', edition: e, path: alternates.en!, alternates });
    if (ml) pages.push({ lang: 'ml', edition: ml, path: alternates.ml!, alternates });
  }

  const publishedSet = new Set(published.map((e) => e.date));
  return {
    tradition,
    all,
    published,
    upcoming,
    pages,
    warnings,
    errors,
    neighbours(e) {
      const i = all.findIndex((x) => x.date === e.date);
      const wrap = (x: Edition | undefined): Neighbour | undefined =>
        x && { edition: x, path: publishedSet.has(x.date) ? editionPath(x) : undefined };
      return { prev: wrap(all[i - 1]), next: wrap(all[i + 1]) };
    },
  };
}
