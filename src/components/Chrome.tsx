import type { ReactNode } from 'react';
import type { Lang, TraditionConfig } from '../lib/tradition';
import { isPlaceholder } from '../lib/content';
import { longDate, type Strings } from '../lib/i18n';
import { ArchLogo } from './Art';

export function TopBar({
  t,
  tradition,
  lang,
  homeHref,
  sectionLinks,
  alternates,
}: {
  t: Strings;
  tradition: TraditionConfig;
  lang: Lang;
  homeHref: string;
  sectionLinks?: boolean;
  alternates?: Partial<Record<Lang, string>>;
}) {
  const langs = alternates ? (Object.keys(alternates) as Lang[]) : [];
  return (
    <div className="topbar">
      <a className="brand" href={homeHref}>
        <ArchLogo />
        <span className="brand-text">
          <b>{tradition.site.name}</b>
          <span lang="ml">{tradition.site.nameMl}</span>
        </span>
      </a>
      {sectionLinks ? (
        <nav className="topnav" aria-label={t.sections}>
          <a href="#readings">{t.navReadings}</a>
          <a href="#gospel">{t.navGospel}</a>
          <a href="#reflection">{t.navReflection}</a>
          <a href="#week">{t.navWeek}</a>
          <a href="/all-sundays/">{t.archive}</a>
        </nav>
      ) : (
        <nav className="topnav" aria-label={t.sections}>
          <a href={homeHref}>{t.home}</a>
          <a href="/all-sundays/">{t.archive}</a>
        </nav>
      )}
      {langs.length > 1 && (
        <nav className="lang" aria-label={t.language}>
          {langs.map((l) => (
            <a key={l} href={alternates![l]} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined}>
              <span className="full">{t.langName[l]}</span>
              <span className="short">{t.langShort[l]}</span>
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

const LICENCE_URLS: Record<string, string> = {
  MIT: 'https://opensource.org/license/mit',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

/** New issue from the content-correction form, optionally with a prefilled title. */
export function correctionUrl(repo: string, title?: string): string {
  return `${repo.replace(/\/$/, '')}/issues/new?template=content-correction.yml${title ? `&title=${encodeURIComponent(title)}` : ''}`;
}

export function Footer({ t, tradition, prepared, reviewer }: { t: Strings; tradition: TraditionConfig; prepared?: string; reviewer?: string }) {
  const s = tradition.site;
  const repo = !isPlaceholder(s.repository) ? s.repository : undefined;
  const lic = [s.codeLicence, s.contentLicence].filter((x) => !isPlaceholder(x));
  return (
    <footer className="wrap footer">
      <div>
        <p className="fn">
          {s.name} <span lang="ml">· {s.nameMl}</span>
        </p>
        <p>{s.about}</p>
        <p>
          <a href="/all-sundays/">{t.archive}</a> · <a href="/people/">People</a> · <a href="/rss.xml">RSS</a>
        </p>
      </div>
      <div>
        <h2>{t.sources}</h2>
        <p>{t.sourcesText(`${tradition.lectionary.label} of ${tradition.lectionary.publisher}`, tradition.bible.ml, tradition.bible.en)}</p>
        {(prepared || reviewer) && (
          <p>
            {prepared && t.prepared(longDate(prepared))} {reviewer && `${t.reviewedBy(reviewer)}.`}
          </p>
        )}
      </div>
      {(repo || lic.length > 0) && (
        <div>
          <h2>{t.contribute}</h2>
          {repo && (
            <>
              <p>{t.contributeText}</p>
              <p>
                <a href={repo}>{t.contributeLink}</a> · <a href={correctionUrl(repo)}>{t.reportCorrection}</a>
              </p>
            </>
          )}
          {lic.length > 0 && (
            <p>
              {`${t.licence}: `}
              {lic.map((l, i) => (
                <span key={l}>
                  {i > 0 && ' · '}
                  {LICENCE_URLS[l] ? <a href={LICENCE_URLS[l]}>{l}</a> : l}
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </footer>
  );
}

export function SectionHead({
  n,
  kicker,
  title,
  ml,
  children,
  id,
}: {
  n: string;
  kicker: string;
  title: string;
  ml?: string;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <div className="sec-head">
      <h2 id={id}>
        <span className="kicker">
          <span className="n" aria-hidden="true">{n}</span>
          <span className="bar" aria-hidden="true" />
          <span>{kicker}</span>
          <span className="sr-only">: </span>
        </span>
        <span className="h2">{title}</span>
      </h2>
      {ml && (
        <p lang="ml" className="sec-ml">
          {ml}
        </p>
      )}
      {children}
    </div>
  );
}
