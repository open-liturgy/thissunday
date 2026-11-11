import type { Site } from '../lib/content';
import { editionPath } from '../lib/content';
import type { Edition } from '../lib/schema';
import { fullDate, longDate, shortDate, type Strings } from '../lib/i18n';
import { AltarArt } from './Art';
import { Footer, TopBar } from './Chrome';
import { gospelOf } from './Sunday';

export function Archive({ site, t }: { site: Site; t: Strings }) {
  const eds = [...site.published].reverse();
  const years = [...new Set(eds.map((e) => e.date.slice(0, 4)))];
  return (
    <>
      <header className="wrap hero simple-hero">
        <TopBar t={t} tradition={site.tradition} lang="en" homeHref="/" />
        <h1>{t.archiveH}</h1>
        <p>{t.archiveIntro}</p>
      </header>
      <main className="paper" id="main" style={{ borderRadius: '28px' }}>
        <div className="wrap">
          {years.map((y) => (
            <section key={y} className="section year first" aria-labelledby={`y${y}`}>
              <h2 id={`y${y}`}>{y}</h2>
              <ol className="ed-list" reversed>
                {eds
                  .filter((e) => e.date.startsWith(y))
                  .map((e) => (
                    <li key={e.date}>
                      <a href={editionPath(e)}>
                        <time className="d" dateTime={e.date}>{longDate(e.date)}</time>
                        <span className="nm">{e.name.en}</span>
                        <span className="g">{`Gospel: ${gospelOf(e).ref}`}</span>
                      </a>
                    </li>
                  ))}
              </ol>
            </section>
          ))}
        </div>
      </main>
      <Footer t={t} tradition={site.tradition} />
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
          <div className="sc-arch"><AltarArt detail="small" label="" /></div>
          <div className="sc-floor" />
        </div>
        <div className="sc-words">
          <div className="sc-name">{e.name.en}</div>
          {e.key_verse.ml && <div className="sc-ml" lang="ml">{`“${e.key_verse.ml}”`}</div>}
          <div className="sc-en">{`“${e.key_verse.en}”`}</div>
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
        <div className="sc-arch"><AltarArt detail="small" label="" /></div>
      </div>
      <div className="sc-col">
        <div className="sc-top">
          <span className="sc-brand"><b>This Sunday</b><span lang="ml">ഈ ഞായറാഴ്ച</span></span>
          <span className="sc-date">{fullDate(e.date).toUpperCase()}</span>
        </div>
        <div className="sc-words">
          <div className="sc-name">{e.name.en}</div>
          {e.key_verse.ml && <div className="sc-ml" lang="ml">{`“${e.key_verse.ml}”`}</div>}
          <div className="sc-en">{`“${e.key_verse.en}”`}</div>
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
