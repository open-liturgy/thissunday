/**
 * A "tradition" is one church's calendar, wording and colours. The code never
 * mentions a specific church: everything church-specific lives in
 * traditions/<id>/config.ts and that tradition's content folder.
 *
 * Pick the tradition at build time with TRADITION=<id> (default: mosc).
 */
export type Lang = 'en' | 'ml';

export interface ServiceDef {
  /** Key used under `readings:` in the YAML. */
  id: string;
  en: string;
  /** Short label for phone tabs. */
  short: string;
  ml: string;
}

export interface SeasonColours {
  /** Dark ground colour (hero, verse panel, footer). */
  ground: string;
  /** Accent on dark ground. Must keep 4.5:1 contrast against `ground`. */
  glow: string;
}

export interface TraditionConfig {
  id: string;
  /** Folder (relative to the repo root) holding `sundays/` and `lectionary/`. */
  contentDir: string;
  site: {
    name: string;
    nameMl: string;
    /** Absolute origin with no trailing slash. Overridden by SITE_URL. */
    url: string;
    /** One line used in the footer, RSS and the home page description. */
    about: string;
    /** Who publishes. Used as JSON-LD publisher and default author. */
    publisher: string;
    repository: string;
    codeLicence: string;
    contentLicence: string;
    /** IANA time zone the church keeps Sunday in. Decides which Sunday is "upcoming". */
    timeZone: string;
  };
  /** Liturgical services, in the order they are kept on the day. */
  services: ServiceDef[];
  /** Malayalam (or other second-language) labels for reading kinds. */
  readingKinds: Record<string, string>;
  bible: {
    /** Translation used for the second-language verse. */
    ml: string;
    en: string;
  };
  lectionary: {
    /** Link text for the source note, e.g. "official lectionary". */
    label: string;
    /** Who publishes it. */
    publisher: string;
  };
  colours: {
    default: SeasonColours;
    /** Optional per-season override, keyed by `season.en`. */
    bySeason?: Record<string, SeasonColours>;
    /** Optional per-Sunday override, keyed by `sunday_slug`. Wins over bySeason. */
    bySlug?: Record<string, SeasonColours>;
  };
  /** Languages this tradition can publish. The first one is the default. */
  languages: Lang[];
}

export function defineTradition(c: TraditionConfig): TraditionConfig {
  return c;
}

export async function loadTradition(id = process.env.TRADITION || 'mosc'): Promise<TraditionConfig> {
  const mod = await import(`../../traditions/${id}/config.ts`);
  const cfg: TraditionConfig = mod.default;
  if (process.env.CONTENT_DIR) cfg.contentDir = process.env.CONTENT_DIR;
  if (process.env.SITE_URL) cfg.site.url = process.env.SITE_URL.replace(/\/$/, '');
  return cfg;
}
