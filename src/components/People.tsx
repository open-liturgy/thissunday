import type { Site } from '../lib/content';
import { iconPath, type Character, type Life, type People } from '../lib/people';
import { longDate, type Strings } from '../lib/i18n';
import { Footer, TopBar } from './Chrome';
import { gospelOf } from './Sunday';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Wording for the character pages (English only for now). */
export const peopleText = {
  index: 'People',
  indexTitle: 'People in the Sunday readings',
  indexIntro: 'Everyone with a page of their own, and every Sunday they appear in. Pick a name to see what each Sunday says about them.',
  individuals: 'People',
  groups: 'Groups',
  kind: { person: 'Person', angel: 'Angel', group: 'Group' } as Record<string, string>,
  sundays: (n: number) => plural(n, 'Sunday'),
  intro: (n: number) => `In the readings on ${plural(n, 'Sunday')} so far.`,
  glance: 'At a glance',
  mlName: 'In Malayalam',
  meaning: 'What the name means',
  inReadings: 'In the readings',
  span: (first: string, last: string) => (first === last ? first : `${first} to ${last}`),
  passages: 'Gospel passages',
  meaningNote: 'Name meanings and role notes are drafted with each edition and waiting for review by a priest or editor.',
  appearances: (name: string) => `Sundays with ${name}`,
  asPart: (entry: string) => `As one of “${entry}”`,
  inStory: 'In the story',
  thisSunday: 'This Sunday',
  also: 'Also in these readings',
  everyone: 'Everyone in the readings',
  iconH: 'About the icon',
  credit: (c: NonNullable<Character['icon']>) => [c.artist, c.date].filter(Boolean).join(', '),
  caption: (c: NonNullable<Character['icon']>) => [c.artist ?? c.title, c.date].filter(Boolean).join(', '),
  source: 'Wikimedia Commons',
  lifeH: (name: string) => `The life of ${name}`,
  aboutH: (name: string) => `Who ${name.replace(/^The /, 'the ')} were`,
  born: 'Born',
  died: 'Died',
  origin: 'Origins',
  after: 'Afterwards',
  family: 'Family',
  remembered: 'Remembered in the Church year',
  readH: 'Read it in the Bible',
  sourcesH: 'Sources',
  from: { scripture: 'Scripture', tradition: 'Tradition', history: 'History' } as Record<string, string>,
  lifeNote: 'Drafted from the Bible and Church tradition. Each line says where it comes from; anything marked Tradition or History is not in Scripture itself. Waiting for review by a priest or editor.',
};

function Src({ from, refText }: { from: string; refText?: string }) {
  return (
    <span className={`pp-src pp-src-${from}`}>
      {peopleText.from[from]}
      {refText && <span className="r">{refText}</span>}
    </span>
  );
}

function LifeSection({ c, life }: { c: Character; life: Life }) {
  const group = c.kind === 'group';
  return (
    <section className="section" aria-labelledby="pp-life">
      <h2 id="pp-life" className="pp-h2">{group ? peopleText.aboutH(c.name) : peopleText.lifeH(c.name)}</h2>
      <p className="pp-summary">{life.summary}</p>
      {(life.born || life.died || life.family.length > 0) && (
        <dl className="pp-facts pp-vitals">
          {life.born && (
            <div>
              <dt>{group ? peopleText.origin : peopleText.born}</dt>
              <dd>
                {life.born.text} <Src from={life.born.from} refText={life.born.ref} />
              </dd>
            </div>
          )}
          {life.died && (
            <div>
              <dt>{group ? peopleText.after : peopleText.died}</dt>
              <dd>
                {life.died.text} <Src from={life.died.from} refText={life.died.ref} />
              </dd>
            </div>
          )}
          {life.family.length > 0 && (
            <div>
              <dt>{peopleText.family}</dt>
              <dd>
                <ul className="pp-family">
                  {life.family.map((f) => (
                    <li key={f.relation + f.name}>
                      <b>{f.relation}:</b> {f.name} <Src from={f.from} refText={f.ref} />
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      )}
      <ol className="pp-timeline">
        {life.events.map((ev, i) => (
          <li key={i}>
            <p>{ev.text}</p>
            <Src from={ev.from} refText={ev.ref} />
          </li>
        ))}
      </ol>
      {(life.remembered.length > 0 || life.read.length > 0) && (
        <div className="pp-life-more">
          {life.remembered.length > 0 && (
            <div>
              <h3>{peopleText.remembered}</h3>
              <ul>
                {life.remembered.map((r) => (
                  <li key={r.name}>
                    {r.name}
                    {r.date && <span className="d">{r.date}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {life.read.length > 0 && (
            <div>
              <h3>{peopleText.readH}</h3>
              <ul>
                {life.read.map((r) => (
                  <li key={r.ref}>
                    <b>{r.ref}</b> <span className="d">{r.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {life.sources.length > 0 && (
        <p className="pp-fine">
          {`${peopleText.sourcesH}: `}
          {life.sources.map((s, i) => (
            <span key={s.label}>
              {i > 0 && '; '}
              {s.url ? <a href={s.url}>{s.label}</a> : s.label}
            </span>
          ))}
          .
        </p>
      )}
      {!life.reviewed && <p className="pp-note">{peopleText.lifeNote}</p>}
    </section>
  );
}

/** Arched icon, or the first letter on the season colour when there is none yet. */
function Icon({ c, size, eager }: { c: Character; size: 'hero' | 'thumb'; eager?: boolean }) {
  if (!c.icon)
    return (
      <span className={`pp-icon pp-icon-${size} pp-icon-none`} aria-hidden="true">
        {c.name.replace(/^The /, '').charAt(0).toUpperCase()}
      </span>
    );
  const hero = size === 'hero';
  return (
    <img
      className={`pp-icon pp-icon-${size}`}
      src={iconPath(c.slug, hero ? 480 : 240)}
      srcSet={`${iconPath(c.slug, 240)} 240w, ${iconPath(c.slug, 480)} 480w`}
      sizes={hero ? '(max-width: 760px) 70vw, 340px' : '(max-width: 520px) 42vw, 180px'}
      width={240}
      height={300}
      alt={hero ? c.icon.alt : ''}
      loading={eager ? undefined : 'lazy'}
      decoding="async"
      {...(hero ? { fetchPriority: 'high' as const } : {})}
    />
  );
}

function Cards({ items }: { items: Character[] }) {
  return (
    <ul className="pp-cards">
      {items.map((c, i) => (
        <li key={c.slug}>
          <a href={c.path}>
            <Icon c={c} size="thumb" eager={i < 4} />
            <span className="nm">{c.name}</span>
            {c.ml && (
              <span className="ml" lang="ml">
                {c.ml}
              </span>
            )}
            <span className="n">{peopleText.sundays(c.appearances.length)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PeopleIndex({ site, people, t }: { site: Site; people: People; t: Strings }) {
  const individuals = people.list.filter((c) => c.kind !== 'group');
  const groups = people.list.filter((c) => c.kind === 'group');
  return (
    <>
      <header className="wrap hero simple-hero">
        <TopBar t={t} tradition={site.tradition} lang="en" homeHref="/" />
        <h1>{peopleText.indexTitle}</h1>
        <p>{peopleText.indexIntro}</p>
      </header>
      <main className="paper pp-main" id="main">
        <div className="wrap">
          {individuals.length > 0 && (
            <section className="section first" aria-labelledby="pp-people">
              <h2 id="pp-people" className="pp-h2">{peopleText.individuals}</h2>
              <Cards items={individuals} />
            </section>
          )}
          {groups.length > 0 && (
            <section className="section" aria-labelledby="pp-groups">
              <h2 id="pp-groups" className="pp-h2">{peopleText.groups}</h2>
              <Cards items={groups} />
            </section>
          )}
          <p className="pp-back pp-fine">Icons are public domain or openly licensed, from Wikimedia Commons. Each person’s page credits its icon.</p>
        </div>
      </main>
      <Footer t={t} tradition={site.tradition} />
    </>
  );
}

export function PersonPage({ site, people, c, t }: { site: Site; people: People; c: Character; t: Strings }) {
  const apps = [...c.appearances].reverse();
  const unreviewed = c.appearances.some((a) => !a.edition.reviewed);
  const others = new Map<string, Character>();
  for (const a of c.appearances)
    for (const p of a.edition.people)
      for (const o of people.linksFor(a.edition, p.name)) if (o.slug !== c.slug) others.set(o.slug, o);
  const passages = [...new Set(c.appearances.map((a) => gospelOf(a.edition).ref))];
  const first = c.appearances[0].edition;
  const last = c.appearances.at(-1)!.edition;
  return (
    <>
      <header className="wrap hero simple-hero pp-hero">
        <TopBar t={t} tradition={site.tradition} lang="en" homeHref="/" />
        <div className="pp-hero-grid">
          <div className="pp-hero-text">
            <nav className="pp-crumb" aria-label={t.breadcrumb}>
              <a href="/">{t.home}</a>
              <span aria-hidden="true"> / </span>
              <a href="/people/">{peopleText.index}</a>
            </nav>
            <p className="pp-kind">{`${peopleText.kind[c.kind]} · ${peopleText.sundays(c.appearances.length)}`}</p>
            <h1>{c.name}</h1>
            {c.ml && (
              <p className="pp-ml" lang="ml">
                {c.ml}
              </p>
            )}
            {c.meanings[0] && <p className="pp-mean">{c.meanings[0].text}</p>}
            <p>{peopleText.intro(c.appearances.length)}</p>
          </div>
          <figure className="pp-hero-icon">
            <Icon c={c} size="hero" eager />
            {c.icon && <figcaption>{peopleText.caption(c.icon)}</figcaption>}
          </figure>
        </div>
      </header>
      <main className="paper pp-main" id="main">
        <div className="wrap">
          <section className="section first" aria-labelledby="pp-glance">
            <h2 id="pp-glance" className="pp-h2">{peopleText.glance}</h2>
            <dl className="pp-facts">
              {c.ml && (
                <div>
                  <dt>{peopleText.mlName}</dt>
                  <dd lang="ml">{c.ml}</dd>
                </div>
              )}
              {c.meanings.length > 0 && (
                <div>
                  <dt>{peopleText.meaning}</dt>
                  <dd>
                    {c.meanings.map((m) => (
                      <span key={m.text} className="pp-m">
                        {m.text}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              <div>
                <dt>{peopleText.inReadings}</dt>
                <dd>{`${peopleText.sundays(c.appearances.length)}, ${peopleText.span(longDate(first.date), longDate(last.date))}`}</dd>
              </div>
              <div>
                <dt>{peopleText.passages}</dt>
                <dd>{passages.join(' · ')}</dd>
              </div>
            </dl>
            {unreviewed && <p className="pp-note">{peopleText.meaningNote}</p>}
          </section>
          {c.life && <LifeSection c={c} life={c.life} />}
          <section className="section" aria-labelledby="pp-sundays">
            <h2 id="pp-sundays" className="pp-h2">{peopleText.appearances(c.name)}</h2>
            <ol className="pp-apps" reversed>
              {apps.map((a) => {
                const current = a.edition.date === site.upcoming?.date;
                return (
                  <li key={a.edition.date} className="card">
                    <p className="when">
                      <time dateTime={a.edition.date}>{longDate(a.edition.date)}</time>
                      {current && <span className="now">{peopleText.thisSunday}</span>}
                    </p>
                    <h3>
                      <a href={a.path}>{a.edition.name.en}</a>
                    </h3>
                    <p className="g">{`${t.gospel}: ${gospelOf(a.edition).ref}`}</p>
                    {a.as.map((as) => (
                      <p key={as.name} className="role">
                        {as.name !== c.name && <span className="as">{`${peopleText.asPart(as.name)}: `}</span>}
                        {as.role}
                      </p>
                    ))}
                    {a.scenes.length > 0 && (
                      <div className="story">
                        <p className="label">{peopleText.inStory}</p>
                        <ul>
                          {a.scenes.map((s) => (
                            <li key={s.href}>
                              <a href={s.href}>{s.title}</a> <span>{s.verses}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
          {others.size > 0 && (
            <section className="section" aria-labelledby="pp-also">
              <h2 id="pp-also" className="pp-h2">{peopleText.also}</h2>
              <Cards items={[...others.values()]} />
            </section>
          )}
          {c.icon && (
            <section className="section" aria-labelledby="pp-icon">
              <h2 id="pp-icon" className="pp-h2">{peopleText.iconH}</h2>
              <p className="pp-credit">
                <cite>{c.icon.title}</cite>
                {peopleText.credit(c.icon) && `. ${peopleText.credit(c.icon)}`}.{' '}
                {c.icon.license_url ? <a href={c.icon.license_url}>{c.icon.license}</a> : c.icon.license}, via{' '}
                <a href={c.icon.source}>{peopleText.source}</a>.
              </p>
            </section>
          )}
          <p className="pp-back">
            <a href="/people/">{peopleText.everyone}</a>
          </p>
        </div>
      </main>
      <Footer t={t} tradition={site.tradition} />
    </>
  );
}

/** 1200×630 Open Graph image for a character page, screenshotted at build. */
export function PersonCard({ c, siteHost }: { c: Character; siteHost: string }) {
  const n = c.appearances.length;
  return (
    <div className="pc">
      <div className="pc-art">
        <div className="pc-arch">
          {c.icon ? <img src={iconPath(c.slug, 480)} alt="" /> : <span className="pc-letter">{c.name.replace(/^The /, '').charAt(0)}</span>}
        </div>
      </div>
      <div className="pc-col">
        <div className="pc-top">
          <span className="pc-brand"><b>This Sunday</b><span lang="ml">ഈ ഞായറാഴ്ച</span></span>
          <span className="pc-kind">{`${peopleText.kind[c.kind]} · ${peopleText.sundays(n)}`.toUpperCase()}</span>
        </div>
        <div className="pc-words">
          <div className="pc-name">{c.name}</div>
          {c.ml && <div className="pc-ml" lang="ml">{c.ml}</div>}
          {c.life && <div className="pc-sum">{c.life.summary}</div>}
        </div>
        <div className="pc-foot">
          <span><b>{c.life ? 'Life, Bible passages and Sundays' : 'In the Sunday readings'}</b><span>Malankara Orthodox Sunday readings</span></span>
          <span className="pc-site">{siteHost}</span>
        </div>
      </div>
    </div>
  );
}

export const personCardCss = `
*{box-sizing:border-box;margin:0}
body{background:var(--ground)}
.pc{width:1200px;height:630px;padding:56px 64px 48px;display:flex;gap:60px;background:var(--ground);color:#fff;font-family:'Anek Malayalam',sans-serif;overflow:hidden}
.pc-art{flex:0 0 330px;display:flex;align-items:flex-end;color:var(--glow)}
.pc-arch{width:330px;height:526px;overflow:hidden;border:2px solid currentColor;border-bottom:0;border-radius:165px 165px 0 0;background:rgba(0,0,0,.32);display:flex;align-items:center;justify-content:center}
.pc-arch img{width:100%;height:100%;object-fit:cover;display:block}
.pc-letter{font-family:'Newsreader',serif;font-style:italic;font-size:220px;line-height:1;color:var(--glow)}
.pc-col{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:26px}
.pc-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.pc-brand{display:flex;align-items:baseline;gap:8px}
.pc-brand b{font-size:24px;font-weight:700}.pc-brand span{font-size:20px;color:#C9CCE6}
.pc-kind{font-size:17px;font-weight:650;letter-spacing:.12em;color:var(--glow)}
.pc-words{display:flex;flex-direction:column;gap:14px;margin-top:6px}
.pc-name{font-size:76px;line-height:.98;font-weight:750;font-stretch:82%;letter-spacing:-.02em}
.pc-ml{font-size:32px;line-height:1.4;font-weight:550;color:var(--glow)}
.pc-sum{font-family:'Newsreader',serif;font-size:25px;line-height:1.38;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
.pc-foot{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding-top:20px;border-top:1px solid rgba(255,255,255,.22);font-size:19px;line-height:1.4;color:#C9CCE6}
.pc-foot>span:first-child{display:flex;flex-direction:column}.pc-foot b{font-weight:650;color:#fff}
.pc-site{text-align:right}
`;
