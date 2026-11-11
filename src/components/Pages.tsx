import type { CSSProperties } from 'react';
import type { Site } from '../lib/content';
import { editionPath } from '../lib/content';
import type { Edition } from '../lib/schema';
import { dayMonth, fullDate, longDate, shortDate, type Strings } from '../lib/i18n';
import { SundayArt } from './Art';
import { Footer, TopBar } from './Chrome';
import { gospelOf } from './Sunday';
import { quoted } from '../lib/quote';

/* ---------- All Sundays (/all-sundays/) ---------- */

/** A drafted "[LIKE THIS]" value is never shown in the archive, even in preview. */
const real = (v?: string) => (v && !/^\s*\[[^\]]*\]\s*$/.test(v) ? v : undefined);

interface SeasonRun {
  id: string;
  en: string;
  gloss?: string;
  syr?: string;
  colours: { ground: string; glow: string };
  eds: Edition[];
}

/** Consecutive editions that share a season, in calendar order. */
function seasonRuns(eds: Edition[], colours: (e: Edition) => { ground: string; glow: string }): SeasonRun[] {
  const runs: SeasonRun[] = [];
  const used = new Map<string, number>();
  for (const e of eds) {
    const last = runs.at(-1);
    if (last && last.en === e.season.en) {
      last.eds.push(e);
      continue;
    }
    const base = e.season.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    runs.push({
      id: n === 1 ? base : `${base}-${n}`,
      en: e.season.en,
      gloss: real(e.season.gloss),
      syr: real(e.season.syr),
      colours: colours(e),
      eds: [e],
    });
  }
  return runs;
}

const themeStyle = (c: { ground: string; glow: string }) => ({ '--ground': c.ground, '--glow': c.glow }) as CSSProperties;

/**
 * Each drawing is emitted once as a <symbol>, and every arch window points at
 * it with <use>, so a drawing shared by several Sundays costs one copy.
 * When per-Sunday art lands, key by sunday_slug and draw that Sunday's art.
 */
const artKey = (e: Edition) => e.sunday_slug;
const drawArt = (e: Edition) => <SundayArt e={e} detail="small" label="" />;

function ArtSymbols({ eds }: { eds: Edition[] }) {
  const byKey = new Map<string, Edition>();
  for (const e of eds) if (!byKey.has(artKey(e))) byKey.set(artKey(e), e);
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      {[...byKey].map(([k, e]) => (
        <symbol key={k} id={`art-${k}`} viewBox="0 0 440 580">
          {drawArt(e)}
        </symbol>
      ))}
    </svg>
  );
}

function ArchWindow({ e, big }: { e: Edition; big?: boolean }) {
  return (
    <span className={big ? 'arc-arch big' : 'arc-arch'} aria-hidden="true">
      <svg viewBox="0 0 440 580" preserveAspectRatio="xMidYMid slice" focusable="false">
        <use href={`#art-${artKey(e)}`} />
      </svg>
    </span>
  );
}

function rangeLabel(eds: Edition[]) {
  const a = eds[0].date;
  const b = eds.at(-1)!.date;
  if (a === b) return dayMonth(a);
  const [ya, ma] = a.split('-');
  const [yb, mb] = b.split('-');
  if (ya === yb && ma === mb) return `${Number(a.slice(8))}–${dayMonth(b)}`;
  return ya === yb ? `${dayMonth(a)} – ${dayMonth(b)}` : `${dayMonth(a)} ${ya} – ${dayMonth(b)} ${yb}`;
}

function SundayCard({ e, href, state, colours }: { e: Edition; href?: string; state: 'past' | 'now' | 'soon'; colours: { ground: string; glow: string } }) {
  const tagline = real(e.tagline);
  const ml = real(e.name.ml);
  const inner = (
    <>
      <span className="arc-top">
        <ArchWindow e={e} />
        <span className="arc-week">{`Week ${e.week_of_year}`}</span>
        {state === 'now' && <span className="arc-now">This Sunday</span>}
      </span>
      <span className="arc-body">
        <time className="arc-date" dateTime={e.date}>{dayMonth(e.date)}</time>
        <span className="arc-name">{e.name.en}</span>
        {ml && <span className="arc-ml" lang="ml">{ml}</span>}
        {tagline && <span className="arc-tag">{tagline}</span>}
        <span className="arc-g">
          <span className="sr-only">Gospel: </span>
          {gospelOf(e).ref}
        </span>
        {!href && <span className="arc-soon">Coming soon</span>}
      </span>
    </>
  );
  return (
    <li
      id={`sun-${e.date}`}
      className={`arc-card is-${state}`}
      style={themeStyle(colours)}
      data-full={fullDate(e.date)}
      data-meta={metaLine(e)}
      data-art={`#art-${artKey(e)}`}
    >
      {href ? (
        <a href={href} aria-current={state === 'now' ? 'date' : undefined}>
          {inner}
        </a>
      ) : (
        <div>{inner}</div>
      )}
    </li>
  );
}

type Colours = { ground: string; glow: string };

const metaLine = (e: Edition) => `${e.season.en} · Week ${e.week_of_year} · Gospel: ${gospelOf(e).ref}`;

/**
 * Picking an arch in the ribbon shows that Sunday in the feature card. Without
 * JavaScript each arch is a link to the Sunday's card further down the page.
 * Inline because it is this page's only script (about 1 KB).
 */
const pickerScript = `(()=>{const f=document.getElementById('arc-feature'),r=document.querySelector('.arc-ribbon');if(!f||!r)return;
const T=[...r.querySelectorAll('a')],q=s=>f.querySelector(s),now=f.dataset.now;
function show(d,first){const li=document.getElementById('sun-'+d);if(!li)return;const a=li.querySelector('a');
f.style.cssText=li.style.cssText;q('use').setAttribute('href',li.dataset.art);
q('[data-k]').textContent=d===now?'This Sunday':d<now?'Earlier Sunday':'Coming Sunday';
const t=q('time');t.dateTime=d;t.textContent=li.dataset.full;
q('h2').textContent=li.querySelector('.arc-name').textContent;
for(const k of['ml','tag']){const s=li.querySelector('.arc-'+k),p=q('.arc-'+k);p.hidden=!s;if(s)p.textContent=s.textContent}
q('.arc-meta').textContent=li.dataset.meta;
const b=q('.btn-glow');b.hidden=!a;if(a){b.href=d===now?'/':a.getAttribute('href');b.textContent=d===now?'Go to this Sunday':'Open this Sunday'}
let sel;for(const x of T){const on=x.dataset.d===d;x.tabIndex=on?0:-1;if(on){x.setAttribute('aria-current','true');sel=x}else x.removeAttribute('aria-current')}
if(sel)r.scrollTo({left:sel.offsetLeft-r.clientWidth/2+sel.offsetWidth/2,behavior:first?'auto':'smooth'});
if(!first){f.classList.remove('arc-swap');void f.offsetWidth;f.classList.add('arc-swap')}}
r.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();show(a.dataset.d);history.replaceState(null,'','#sun-'+a.dataset.d)});
r.addEventListener('keydown',e=>{const i=T.indexOf(document.activeElement);if(i<0)return;const j={ArrowLeft:i-1,ArrowRight:i+1,Home:0,End:T.length-1}[e.key];if(j==null||j<0||j>=T.length)return;e.preventDefault();T[j].focus();show(T[j].dataset.d);history.replaceState(null,'','#sun-'+T[j].dataset.d)});
const h=location.hash.match(/^#sun-(\\d{4}-\\d{2}-\\d{2})$/);show(h?h[1]:now,true)})()`;

export function Archive({ site, t, colours }: { site: Site; t: Strings; colours: (e: Edition) => Colours }) {
  const published = new Set(site.published.map((e) => e.date));
  const up = site.upcoming;
  // Show the whole church year around the upcoming Sunday: everything published, plus what is still to come.
  const runs = seasonRuns(site.all, colours);
  const total = site.all.length;
  const first = site.all[0];
  const last = site.all.at(-1);
  const yearLabel = first && last ? (first.date.slice(0, 4) === last.date.slice(0, 4) ? first.date.slice(0, 4) : `${first.date.slice(0, 4)}–${last.date.slice(2, 4)}`) : '';
  const state = (e: Edition): 'past' | 'now' | 'soon' => (e.date === up?.date ? 'now' : up && e.date > up.date ? 'soon' : 'past');
  const upTag = up && real(up.tagline);
  const upMl = up && real(up.name.ml);

  return (
    <>
      <ArtSymbols eds={site.all} />
      <header className="wrap hero simple-hero arc-hero">
        <TopBar t={t} tradition={site.tradition} lang="en" homeHref="/" />
        <div className="arc-intro">
          <p className="hero-date">{`The Church year ${yearLabel}`}</p>
          <h1>{t.archiveH}</h1>
          <p>{`${total} Sundays, from ${first ? longDate(first.date) : ''} to ${last ? longDate(last.date) : ''}, season by season. ${t.archiveIntro}`}</p>
        </div>
        <nav className="arc-ribbon" aria-label="Pick a Sunday">
          {runs.map((r) => (
            <span key={r.id} className="arc-seg" style={{ ...themeStyle(r.colours), flexGrow: r.eds.length }}>
              {r.eds.map((e) => (
                <a
                  key={e.date}
                  href={`#sun-${e.date}`}
                  className={`is-${state(e)}`}
                  data-d={e.date}
                  title={`${dayMonth(e.date)}: ${e.name.en}`}
                  aria-label={`${dayMonth(e.date)}: ${e.name.en}`}
                >
                  <i />
                </a>
              ))}
            </span>
          ))}
        </nav>
        <nav className="arc-seasons" aria-label="Seasons">
          <ol>
            {runs.map((r) => (
              <li key={r.id}>
                <a href={`#${r.id}`} style={themeStyle(r.colours)}>
                  <span className="sw" aria-hidden="true" />
                  {r.en}
                  <span className="ct">{r.eds.length}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>
      <main className="paper arc-main" id="main">
        <div className="wrap">
          {up && (
            <section id="arc-feature" className="arc-feature" aria-labelledby="arc-now-h" style={themeStyle(colours(up))} data-now={up.date}>
              <ArchWindow e={up} big />
              <div className="arc-feature-text">
                <p className="arc-kicker">
                  <span data-k="">This Sunday</span>
                  <time dateTime={up.date}>{fullDate(up.date)}</time>
                </p>
                <h2 id="arc-now-h" aria-live="polite">{up.name.en}</h2>
                <p className="arc-ml" lang="ml" hidden={!upMl}>{upMl}</p>
                <p className="arc-tag" hidden={!upTag}>{upTag}</p>
                <p className="arc-meta">{metaLine(up)}</p>
                <p>
                  <a className="pill-btn btn-glow" href="/">{t.goToThisSunday}</a>
                </p>
              </div>
            </section>
          )}
          {runs.map((r) => (
            <section key={r.id} id={r.id} className="arc-season" aria-labelledby={`${r.id}-h`} style={themeStyle(r.colours)}>
              <div className="arc-season-head">
                <h2 id={`${r.id}-h`}>
                  {r.en}
                  {r.syr && (
                    <span lang="syr" className="syr">
                      {r.syr}
                    </span>
                  )}
                </h2>
                {r.gloss && <p className="gloss">{r.gloss}</p>}
                <p className="range">{`${rangeLabel(r.eds)} · ${r.eds.length} ${r.eds.length === 1 ? 'Sunday' : 'Sundays'}`}</p>
              </div>
              <ol className="arc-grid">
                {r.eds.map((e) => (
                  <SundayCard key={e.date} e={e} href={published.has(e.date) ? editionPath(e) : undefined} state={state(e)} colours={colours(e)} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      </main>
      <Footer t={t} tradition={site.tradition} />
      {up && <script dangerouslySetInnerHTML={{ __html: pickerScript }} />}
    </>
  );
}

export function NotFound({ site, t }: { site: Site; t: Strings }) {
  return (
    <>
      <header className="wrap hero simple-hero">
        <TopBar t={t} tradition={site.tradition} lang="en" homeHref="/" />
        <h1>{t.notFoundH}</h1>
        <p>{t.notFoundText}</p>
        <p>
          <a className="pill-btn btn-glow" href="/" style={{ marginTop: 16 }}>
            {t.goToThisSunday}
          </a>
        </p>
      </header>
      <Footer t={t} tradition={site.tradition} />
    </>
  );
}

/**
 * Social images. Rendered to HTML, then screenshotted by headless Chromium so
 * Malayalam conjuncts shape correctly. `landscape` is the 1200×630 Open Graph
 * image; `portrait` is the 360×640 share card from the canvas, shot at 3×.
 */
export function ShareCard({ e, siteHost, variant }: { e: Edition; siteHost: string; variant: 'landscape' | 'portrait' }) {
  const date = shortDate(e.date).toUpperCase() + ' ' + e.date.slice(0, 4);
  if (variant === 'portrait') {
    return (
      <div className="sc sc-p">
        <div className="sc-top">
          <span className="sc-brand"><b>This Sunday</b><span lang="ml">ഈ ഞായറാഴ്ച</span></span>
          <span className="sc-date">{date}</span>
        </div>
        <div className="sc-art">
          <div className="sc-arch"><SundayArt e={e} detail="small" label="" /></div>
          <div className="sc-floor" />
        </div>
        <div className="sc-words">
          <div className="sc-name">{e.name.en}</div>
          {e.key_verse.ml && <div className="sc-ml" lang="ml">{quoted(e.key_verse.ml)}</div>}
          <div className="sc-en">{quoted(e.key_verse.en)}</div>
        </div>
        <div className="sc-foot">
          <span><b>{e.key_verse.ref}</b><span>Five minutes before Qurbana</span></span>
          <span className="sc-site">{siteHost}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="sc sc-l">
      <div className="sc-art">
        <div className="sc-arch"><SundayArt e={e} detail="small" label="" /></div>
      </div>
      <div className="sc-col">
        <div className="sc-top">
          <span className="sc-brand"><b>This Sunday</b><span lang="ml">ഈ ഞായറാഴ്ച</span></span>
          <span className="sc-date">{fullDate(e.date).toUpperCase()}</span>
        </div>
        <div className="sc-words">
          <div className="sc-name">{e.name.en}</div>
          {e.key_verse.ml && <div className="sc-ml" lang="ml">{quoted(e.key_verse.ml)}</div>}
          <div className="sc-en">{quoted(e.key_verse.en)}</div>
        </div>
        <div className="sc-foot">
          <span><b>{`Gospel: ${gospelOf(e).ref}`}</b><span>Readings, the Gospel explained and a question for the family</span></span>
          <span className="sc-site">{siteHost}</span>
        </div>
      </div>
    </div>
  );
}

export const shareCardCss = `
*{box-sizing:border-box;margin:0}
body{background:var(--ground)}
.sc{background:var(--ground);color:#fff;font-family:'Anek Malayalam',sans-serif;display:flex;overflow:hidden}
.sc-p{width:360px;height:640px;padding:26px 28px 24px;flex-direction:column;gap:20px}
.sc-l{width:1200px;height:630px;padding:56px 64px 48px;gap:64px;align-items:stretch}
.sc-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.sc-brand{display:flex;align-items:baseline;gap:8px}
.sc-brand b{font-size:15px;font-weight:700}.sc-brand span{font-size:13px;color:#C9CCE6}
.sc-date{font-size:12px;font-weight:650;letter-spacing:.12em;color:var(--glow)}
.sc-art{color:var(--glow)}
.sc-p .sc-art{align-self:center;width:150px}
.sc-arch{height:186px;overflow:hidden;border:1.5px solid currentColor;border-bottom:0;border-radius:75px 75px 0 0;background:rgba(0,0,0,.32)}
.sc-arch svg{display:block;width:100%;height:100%}
.sc-floor{height:1.5px;margin:0 -28px;background:currentColor;opacity:.5}
.sc-words{display:flex;flex-direction:column;gap:12px}
.sc-name{font-size:38px;line-height:.98;font-weight:750;font-stretch:82%;letter-spacing:-.02em}
.sc-ml{font-size:21px;line-height:1.45;font-weight:550;color:var(--glow)}
.sc-en{font-family:'Newsreader',serif;font-style:italic;font-size:16px;line-height:1.4}
.sc-foot{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding-top:14px;border-top:1px solid rgba(255,255,255,.22);font-size:13px;line-height:1.4;color:#C9CCE6}
.sc-foot>span:first-child{display:flex;flex-direction:column}.sc-foot b{font-weight:650;color:#fff}
.sc-site{text-align:right}
.sc-l .sc-art{flex:0 0 330px;display:flex;align-items:flex-end}
.sc-l .sc-arch{width:330px;height:526px;border-radius:165px 165px 0 0}
.sc-l .sc-col{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:28px}
.sc-l .sc-brand b{font-size:24px}.sc-l .sc-brand span{font-size:20px}
.sc-l .sc-date{font-size:18px}
.sc-l .sc-words{gap:18px;margin-top:8px}
.sc-l .sc-name{font-size:76px}
.sc-l .sc-ml{font-size:32px;line-height:1.4}
.sc-l .sc-en{font-size:26px}
.sc-l .sc-foot{font-size:19px;padding-top:20px}
`;
