import type { Site } from '../lib/content';
import type { Character, People } from '../lib/people';
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
  sundays: (n: number) => plural(n, 'Sunday'),
  intro: (n: number) => `In the readings on ${plural(n, 'Sunday')} so far.`,
  meaning: 'What the name means',
  meaningNote: 'Drafted with each edition and waiting for review by a priest or editor.',
  appearances: (name: string) => `Sundays with ${name}`,
  asPart: (entry: string) => `As one of “${entry}”`,
  thisSunday: 'This Sunday',
  also: 'Also in these readings',
  everyone: 'Everyone in the readings',
};

function Hero({ site, t, title, ml, intro, crumb }: { site: Site; t: Strings; title: string; ml?: string; intro: string; crumb?: boolean }) {
  return (
    <header className="wrap hero simple-hero">
      <TopBar t={t} tradition={site.tradition} lang="en" homeHref="/" />
      {crumb && (
        <nav className="pp-crumb" aria-label={t.breadcrumb}>
          <a href="/">{t.home}</a>
          <span aria-hidden="true"> / </span>
          <a href="/people/">{peopleText.index}</a>
        </nav>
      )}
      <h1>{title}</h1>
      {ml && (
        <p className="pp-ml" lang="ml">
          {ml}
        </p>
      )}
      <p>{intro}</p>
    </header>
  );
}

function NameList({ items }: { items: Character[] }) {
  return (
    <ul className="pp-list">
      {items.map((c) => (
        <li key={c.slug}>
          <a href={c.path}>
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
      <Hero site={site} t={t} title={peopleText.indexTitle} intro={peopleText.indexIntro} />
      <main className="paper pp-main" id="main">
        <div className="wrap">
          {individuals.length > 0 && (
            <section className="section first" aria-labelledby="pp-people">
              <h2 id="pp-people" className="pp-h2">{peopleText.individuals}</h2>
              <NameList items={individuals} />
            </section>
          )}
          {groups.length > 0 && (
            <section className="section" aria-labelledby="pp-groups">
              <h2 id="pp-groups" className="pp-h2">{peopleText.groups}</h2>
              <NameList items={groups} />
            </section>
          )}
        </div>
      </main>
      <Footer t={t} tradition={site.tradition} />
    </>
  );
}

export function PersonPage({ site, people, c, t }: { site: Site; people: People; c: Character; t: Strings }) {
  const apps = [...c.appearances].reverse();
  const unreviewed = c.appearances.some((a) => !a.edition.reviewed);
  // Others with a page who appear on the same Sundays.
  const others = new Map<string, Character>();
  for (const a of c.appearances)
    for (const p of a.edition.people)
      for (const o of people.linksFor(a.edition, p.name)) if (o.slug !== c.slug) others.set(o.slug, o);
  return (
    <>
      <Hero site={site} t={t} title={c.name} ml={c.ml} intro={peopleText.intro(c.appearances.length)} crumb />
      <main className="paper pp-main" id="main">
        <div className="wrap">
          {c.meanings.length > 0 && (
            <section className="section first" aria-labelledby="pp-meaning">
              <h2 id="pp-meaning" className="pp-h2">{peopleText.meaning}</h2>
              <ul className="pp-meanings">
                {c.meanings.map((m) => (
                  <li key={m.text}>{m.text}</li>
                ))}
              </ul>
              {unreviewed && <p className="pp-note">{peopleText.meaningNote}</p>}
            </section>
          )}
          <section className={`section${c.meanings.length ? '' : ' first'}`} aria-labelledby="pp-sundays">
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
                  </li>
                );
              })}
            </ol>
          </section>
          {others.size > 0 && (
            <section className="section" aria-labelledby="pp-also">
              <h2 id="pp-also" className="pp-h2">{peopleText.also}</h2>
              <NameList items={[...others.values()]} />
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
