import type { Page, Neighbour } from '../lib/content';
import { isPlaceholder } from '../lib/content';
import type { Edition, Reading } from '../lib/schema';
import type { TraditionConfig } from '../lib/tradition';
import { dayMonth, fullDate, shortDate, type Strings } from '../lib/i18n';
import { AltarArt, ArchLogo, PlayIcon, ShareIcon } from './Art';
import { Footer, SectionHead, TopBar } from './Chrome';

export interface SundayProps {
  page: Page;
  t: Strings;
  tradition: TraditionConfig;
  prev?: Neighbour;
  next?: Neighbour;
  /** Absolute URL of the permanent page (for share links). */
  canonical: string;
  /** Public path of the portrait share card image. */
  cardImage?: string;
  homeHref: string;
}

const real = (v?: string): v is string => !!v && !isPlaceholder(v);

export function gospelOf(e: Edition): Reading {
  return Object.values(e.readings).flat().find((r) => r.main)!;
}

export function Sunday({ page, t, tradition, prev, next, canonical, cardImage, homeHref }: SundayProps) {
  const e = page.edition;
  const gospel = gospelOf(e);
  const services = tradition.services.filter((s) => e.readings[s.id]?.length);
  const unknownServices = Object.keys(e.readings).filter((k) => !tradition.services.some((s) => s.id === k));
  if (unknownServices.length) throw new Error(`${e.date}: unknown service(s) ${unknownServices.join(', ')}; add them to traditions/${tradition.id}/config.ts`);
  const total = services.reduce((n, s) => n + e.readings[s.id].length, 0);
  const mainService = services.find((s) => e.readings[s.id].some((r) => r.main))?.id ?? services.at(-1)!.id;
  const audio = e.audio && real(e.audio.src) ? e.audio : undefined;
  const sermon = e.sermon && real(e.sermon.title) && real(e.sermon.url) ? e.sermon : undefined;
  const author = real(e.reflection.author) ? e.reflection.author : undefined;
  const reviewer = e.reviewed && real(e.reflection.reviewer) ? e.reflection.reviewer : undefined;
  const shareText = `${e.name.en}: ${e.week.question}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${e.name.en} · ${shortDate(e.date)}\n${canonical}`)}`;

  return (
    <>
      <a className="skip" href="#readings">{t.skip}</a>
      <header className={audio ? 'wrap hero' : 'wrap hero no-audio'} id="top">
        <TopBar t={t} tradition={tradition} lang={page.lang} homeHref={homeHref} sectionLinks alternates={page.alternates} />
        <div className="hero-grid">
          <p className="hero-kicker">
            <span className="hero-date">
              <time dateTime={e.date}>
                <span className="only-desk">{fullDate(e.date)}</span>
                <span className="only-phone">{`Sunday, ${dayMonth(e.date)} · ${t.weekShort(e.week_of_year)}`}</span>
              </time>
            </span>
            <span className="hero-week">{t.weekOfYear(e.week_of_year)}</span>
          </p>
          <h1>{e.name.en}</h1>
          {e.name.ml && <p className="hero-ml" lang="ml">{e.name.ml}</p>}
          <p className="standfirst">{e.standfirst}</p>
          <div className="hero-actions">
            {audio && (
              <a className="pill-btn btn-glow" href="#audio" data-play>
                <PlayIcon />
                <span>{`${t.listen} · ${audio.duration}`}</span>
              </a>
            )}
            <a className="pill-btn btn-ghost" href="#gospel">
              <span className="only-desk">{t.readGospel}</span>
              <span className="only-phone">{t.readShort}</span>
            </a>
            <span className="hero-time">{t.fiveMinutes}</span>
          </div>
          <dl className="facts">
            <div>
              <dt>{t.season}</dt>
              <dd className="v">
                <span>{e.season.en}</span>
                {e.season.syr && <span lang="syr" dir="rtl">{e.season.syr}</span>}
              </dd>
              {e.season.gloss && <dd className="s">{e.season.gloss}</dd>}
            </div>
            <div>
              <dt>{t.gospel}</dt>
              <dd className="v">{gospel.ref}</dd>
              {gospel.ml && <dd className="s" lang="ml">{gospel.ml}</dd>}
            </div>
            {e.also_kept_as && (
              <div>
                <dt>{t.alsoKeptAs}</dt>
                <dd className="v">{e.also_kept_as}</dd>
                {e.also_kept_as_note && <dd className="s">{e.also_kept_as_note}</dd>}
              </div>
            )}
          </dl>
          <ul className="chips">
            <li>{gospel.ref}</li>
            {e.also_kept_as && <li>{e.also_kept_as}</li>}
            <li>{t.readingsCount(total)}</li>
          </ul>
          <figure className="hero-art">
            <div className="arch-outer">
              <div className="arch">
                <AltarArt label="An altar of incense with smoke rising, and a disc of light to its right" />
              </div>
            </div>
            {e.hero_quote && (
              <figcaption className="hero-quote">
                <em>{`“${e.hero_quote.text}”`}</em> <cite>{e.hero_quote.ref}</cite>
              </figcaption>
            )}
          </figure>
        </div>
      </header>

      <div className="stickybar">
        <div className="row">
          <a href="#top">
            <ArchLogo size={18} stroke="#15183D" dot="#E4502E" width={2.4} />
            <span>{e.name.en}</span>
          </a>
          <span>{shortDate(e.date)}</span>
        </div>
        <nav aria-label={t.sections}>
          <ul>
            <li><a href="#readings" data-spy>{t.navReadings}</a></li>
            <li><a href="#gospel" data-spy>{t.navGospelShort}</a></li>
            <li><a href="#reflection" data-spy>{t.navReflection}</a></li>
            <li><a href="#week" data-spy>{t.navWeekShort}</a></li>
          </ul>
        </nav>
      </div>

      <main className="paper" id="main">
        <div className="wrap">
          {audio && (
            <section className="card audio-card" id="audio" aria-label={t.audioTitle} data-audio>
              <button type="button" className="play js-only" aria-label={t.audioPlay} data-label-play={t.audioPlay} data-label-pause={t.audioPause} data-toggle>
                <PlayIcon size={20} />
              </button>
              <div className="audio-title">
                <b>{t.audioTitle}</b>
                <span>{t.audioMeta(audio.duration, t.audioLang[audio.language] ?? audio.language)}</span>
              </div>
              <div className="audio-track js-only">
                <span data-cur>0:00</span>
                <span className="track">
                  <i data-fill />
                  <input type="range" min="0" max="1000" defaultValue="0" step="1" aria-label="Seek" data-seek />
                </span>
                <span>{audio.duration}</span>
              </div>
              <audio src={audio.src} preload="none" controls />
              <div className="audio-tools">
                <a className="pill-btn btn-line" href={audio.src} download>{t.download}</a>
              </div>
              {audio.transcript && (
                <details className="transcript">
                  <summary>{t.transcript}</summary>
                  <div>
                    {audio.transcript.map((p, i) => (
                      <p key={i} lang={audio.language}>{p}</p>
                    ))}
                  </div>
                </details>
              )}
            </section>
          )}

          <section className="section first" aria-labelledby="h-min">
            <SectionHead id="h-min" n="01" kicker={t.oneMinute} title={t.oneMinuteH} />
            <div className="grid3">
              <div className="card min-card">
                <h3>{t.whatHappens}</h3>
                <p>{e.one_minute.what_happens}</p>
              </div>
              <div className="card min-card">
                <h3>{t.whyThisSunday}</h3>
                <p>{e.one_minute.why_this_sunday}</p>
              </div>
              <div className="card min-card">
                <h3>{t.takeWithYou}</h3>
                <p>{e.one_minute.take_with_you}</p>
              </div>
            </div>
          </section>

          <section className="section" id="readings" aria-labelledby="h-readings">
            <SectionHead id="h-readings" n="02" kicker={t.readingsKicker(e.name.en)} title={t.readingsH(total, services.length)} ml={t.readingsMl} />
            <div className="readings" data-tabs>
              <div className="tabs js-only" role="tablist" aria-label={t.service}>
                {services.map((s) => (
                  <button key={s.id} type="button" className="tab" role="tab" id={`tab-${s.id}`} aria-controls={`svc-${s.id}`} aria-selected={s.id === mainService ? 'true' : 'false'} tabIndex={s.id === mainService ? 0 : -1}>
                    <span className="t">
                      <span className="en">{s.en}</span>
                      <span className="short">{s.short}</span>
                      <span lang="ml">{s.ml}</span>
                    </span>
                    <span className="c">{e.readings[s.id].length}</span>
                  </button>
                ))}
              </div>
              <div className="panels">
                {services.map((s) => (
                  <div key={s.id} className="card panel" id={`svc-${s.id}`} role="tabpanel" aria-labelledby={`tab-${s.id}`} hidden={s.id !== mainService} tabIndex={0}>
                    <h3 className="panel-h">
                      <span>{s.en}</span> <span lang="ml">{s.ml}</span>
                      <span className="c">{t.readingsCount(e.readings[s.id].length)}</span>
                    </h3>
                    <ol>
                      {e.readings[s.id].map((r, i) => (
                        <li key={i} className={r.main ? 'reading main' : 'reading'}>
                          <div className="r-kind">
                            <span className="k">
                              {r.kind}
                              {r.main && <span className="only-phone">{` ${t.gospelOfDay}`}</span>}
                            </span>
                            {(r.kind_ml ?? tradition.readingKinds[r.kind]) && <span lang="ml">{r.kind_ml ?? tradition.readingKinds[r.kind]}</span>}
                          </div>
                          <div className="r-ref">
                            <span className="ref">{r.ref}</span>
                            {r.ml && <span lang="ml">{r.ml}</span>}
                          </div>
                          {r.note && <p className="r-note">{r.note}</p>}
                          {r.main && (
                            <a className="r-open" href="#gospel">{t.openScenes}</a>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
            <div className="notes2">
              {e.readings_thread && (
                <div className="note-box tint">
                  <h3>{t.thread(total)}</h3>
                  <p>{e.readings_thread}</p>
                </div>
              )}
              <div className="note-box line">
                <h3>{t.source}</h3>
                <p>
                  {t.sourceText(tradition.lectionary.label, tradition.lectionary.publisher)[0]}
                  <a href={e.sources.lectionary}>{tradition.lectionary.label}</a>
                  {t.sourceText(tradition.lectionary.label, tradition.lectionary.publisher)[2]}
                </p>
              </div>
            </div>
          </section>

          <section className="section" id="gospel" aria-labelledby="h-gospel">
            <SectionHead id="h-gospel" n="03" kicker={t.gospelKicker(gospel.ref)} title={t.gospelH(gospel.ref, e.scenes.length)}>
              <p className="lead">{t.scenesIntro}</p>
            </SectionHead>
            <div className="scenes" data-scenes>
              <div className="picker" aria-label={t.scenes}>
                {e.scenes.map((s, i) => (
                  <a key={i} className="pick" href={`#scene-${i + 1}`} aria-current={i === 0 ? 'true' : undefined}>
                    <span className="n" aria-hidden="true">{i + 1}</span>
                    <span className="t">
                      <b>{s.title}</b>
                      <span>{s.verses}</span>
                    </span>
                  </a>
                ))}
              </div>
              <div className="stage">
                {e.scenes.map((s, i) => (
                  <article key={i} className="card scene" id={`scene-${i + 1}`} hidden={i !== 0} aria-labelledby={`scene-${i + 1}-h`}>
                    <div className="scene-top">
                      <span className="n" aria-hidden="true">{i + 1}</span>
                      <span className="v">{s.verses}</span>
                    </div>
                    <h3 id={`scene-${i + 1}-h`}>{s.title}</h3>
                    <p>{s.text}</p>
                    <div className="miss">
                      <h4 className="label">{t.easyToMiss}</h4>
                      <p>{s.easy_to_miss}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <figure className="verse">
              <p className="label">{t.verseToKeep}</p>
              {e.key_verse.ml && <blockquote lang="ml">{`“${e.key_verse.ml}”`}</blockquote>}
              <blockquote className="en">{`“${e.key_verse.en}”`}</blockquote>
              <figcaption>
                <span>{e.key_verse.ref}</span>
                {e.key_verse.ml && <span lang="ml">{tradition.bible.ml}</span>}
                <span>{tradition.bible.en}</span>
              </figcaption>
            </figure>

            {e.people.length > 0 && (
              <div className="sub">
                <h3>{t.peopleH}</h3>
                <ul className="people">
                  {e.people.map((p) => (
                    <li key={p.name} className="card person">
                      <p className="nm">
                        <b>{p.name}</b>
                        {p.ml && <span lang="ml">{p.ml}</span>}
                      </p>
                      <p className="role">{p.role}</p>
                      <p className="mean">{`“${p.name_meaning}”`}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {e.phrases.length > 0 && (
              <div className="sub">
                <h3>{t.phrasesH(e.phrases.length)}</h3>
                <dl className="phrases">
                  {e.phrases.map((p) => (
                    <div key={p.term}>
                      <dt>{p.term}</dt>
                      <dd>{p.explanation}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>

          <article className="section" id="reflection" aria-labelledby="h-refl">
            <div className="refl-head">
              <h2 id="h-refl" className="sec-head" style={{ gap: 14 }}>
                <span className="kicker">
                  <span className="n" aria-hidden="true">04</span>
                  <span className="bar" aria-hidden="true" />
                  <span>{t.reflection}</span>
                  <span className="sr-only">: </span>
                </span>
                <span className="h2">{e.reflection.title_en}</span>
              </h2>
              {e.reflection.title_ml && <p className="sec-ml" lang="ml">{e.reflection.title_ml}</p>}
              <p className="byline">
                {e.reflection.read_time && <span>{e.reflection.read_time}</span>}
                {author && <span>{t.writtenBy(author)}</span>}
                {reviewer && <span>{t.reviewedBy(reviewer)}</span>}
              </p>
            </div>
            <div className="refl-body">
              {e.reflection.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        </div>
      </main>

      <div className="paper-end">
        <div className="wrap">
          <section className="section" id="week" aria-labelledby="h-week">
            <SectionHead id="h-week" n="05" kicker={t.intoWeek} title={t.intoWeekH} ml={t.intoWeekMl} />
            <div className="week-grid">
              <div className="card question">
                <p>{e.week.question}</p>
                {e.week.question_note && <span>{e.week.question_note}</span>}
              </div>
              <div className="week-side">
                <div className="card act">
                  <h3 className="label">{t.smallAct}</h3>
                  <p>{e.week.small_act}</p>
                </div>
                <div className="prayer">
                  <h3 className="lh">
                    <span className="label">{t.prayer}</span>
                    <span lang="ml">{t.prayerMl}</span>
                  </h3>
                  <p>{e.week.prayer}</p>
                </div>
              </div>
            </div>
            <div className="share">
              <div>
                <h3>{t.shareH}</h3>
                <p>{t.shareText}</p>
              </div>
              <div className="share-btns">
                <a className="pill-btn btn-ink" href={wa} data-share data-title={e.name.en} data-text={shareText} data-url={canonical} data-card={cardImage}>
                  <ShareIcon />
                  <span>{t.shareBtn}</span>
                </a>
                <button type="button" className="pill-btn btn-line js-only" data-copy={canonical} data-done={t.copied}>
                  {t.copyLink}
                </button>
              </div>
            </div>
            {sermon && (
              <div className="card sermon">
                <span className="ic" aria-hidden="true">
                  <PlayIcon size={20} />
                </span>
                <div>
                  <span className="label">{t.sermonLabel}</span>
                  <b>{sermon.title}</b>
                  <span>{[sermon.speaker, sermon.parish].filter(real).join(', ') + (real(sermon.length) ? ` · ${sermon.length}` : '')}</span>
                </div>
                <a className="go" href={sermon.url}>
                  {t.watch}
                  <span className="sr-only">{`: ${sermon.title}`}</span>
                </a>
              </div>
            )}
          </section>

          {(prev || next) && (
            <nav className="others" aria-label={t.otherSundays}>
              {prev ? <Other n={prev} side="prev" t={t} from={e.date} /> : <span />}
              {next && <Other n={next} side="next" t={t} from={e.date} />}
            </nav>
          )}
        </div>
      </div>

      <Footer t={t} tradition={tradition} prepared={e.prepared} reviewer={reviewer} />

      {audio && (
        <div className="mini" hidden data-mini>
          <button type="button" className="play" aria-label={t.audioPlay} data-toggle data-label-play={t.audioPlay} data-label-pause={t.audioPause}>
            <PlayIcon size={16} />
          </button>
          <div className="mt">
            <b>{t.audioShort}</b>
            <span className="bar"><i data-fill /></span>
          </div>
          <span className="tm"><span data-cur>0:00</span>{` / ${audio.duration}`}</span>
        </div>
      )}
      <p className="toast" role="status" hidden data-toast />
    </>
  );
}

function Other({ n, side, t, from }: { n: Neighbour; side: 'prev' | 'next'; t: Strings; from: string }) {
  const e = n.edition;
  const days = Math.round((Date.parse(e.date) - Date.parse(from)) / 864e5);
  const label = side === 'prev' ? (days === -7 ? t.lastSunday : t.earlier) : days === 7 ? t.nextSunday : t.later;
  const inner = (
    <>
      <span className="when">{`${label} · ${dayMonth(e.date)}`}</span>
      <span className="nm">{e.name.en}</span>
      {e.tagline && <span className="tg">{e.tagline}</span>}
    </>
  );
  return n.path ? (
    <a className={`other ${side}`} href={n.path} rel={side}>
      {inner}
    </a>
  ) : (
    <div className={`other ${side}`}>{inner}</div>
  );
}
