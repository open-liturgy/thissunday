import type { Lang } from './tradition';

/**
 * Interface wording. The Malayalam column was drafted for the /ml/ routes and
 * NEEDS REVIEW by a native speaker before the first Malayalam edition ships.
 * Strings marked "canvas" are taken from the approved design.
 */
const en = {
  skip: 'Skip to the readings',
  sections: 'Sections',
  navReadings: 'Readings',
  navGospel: 'The Gospel',
  navGospelShort: 'Gospel',
  navReflection: 'Reflection',
  navWeek: 'Into the week',
  navWeekShort: 'Week',
  language: 'Language',
  weekOfYear: (n: number) => `Week ${n} of the Church year`,
  weekShort: (n: number) => `Week ${n}`,
  listen: 'Listen',
  readGospel: 'Read the Gospel',
  readShort: 'Read · 5 min',
  fiveMinutes: 'About 5 minutes in all',
  season: 'Season',
  gospel: 'Gospel',
  alsoKeptAs: 'Also kept as',
  readingsCount: (n: number) => `${n} readings`,
  audioTitle: 'Start here: a three-minute audio preparation',
  audioMeta: (d: string, lang: string) => `Audio · ${d} · ${lang}`,
  audioPlay: 'Play the audio preparation',
  audioPause: 'Pause the audio preparation',
  audioShort: 'Audio preparation',
  transcript: 'Transcript',
  download: 'Download',
  oneMinute: 'In one minute',
  oneMinuteH: 'If you only read this much',
  whatHappens: 'What happens',
  whyThisSunday: 'Why this Sunday',
  takeWithYou: 'Take with you',
  readingsKicker: (name: string) => `Readings for the ${name}`,
  readingsH: (n: number, s: number) => `${numberWord(n)} passages across ${numberWord(s).toLowerCase()} services`,
  readingsMl: 'ഈ ഞായറാഴ്ചയുടെ വായനകൾ',
  service: 'Service',
  gospelOfDay: 'of the day',
  openScenes: 'Open in five scenes',
  thread: (n: number) => `The thread through all ${numberWord(n).toLowerCase()}`,
  source: 'Source',
  sourceText: (label: string, publisher: string) => [`References follow the `, label, ` of ${publisher}. Your parish may read them in a different order.`] as const,
  gospelKicker: (ref: string) => `${ref} explained`,
  gospelH: (ref: string, n: number) => `${ref} in ${numberWord(n).toLowerCase()} scenes`,
  scenesIntro: 'Pick a scene to see what happens in it and what is easy to miss.',
  scenes: 'Scenes',
  easyToMiss: 'Easy to miss',
  verseToKeep: 'The verse to keep',
  peopleH: 'Who is in the story, and what their names mean',
  phrasesH: (n: number) => `${numberWord(n)} phrases worth knowing`,
  reflection: 'Reflection',
  writtenBy: (a: string) => `Written by ${a}`,
  reviewedBy: (r: string) => `Reviewed by ${r}`,
  intoWeek: 'Into the week',
  intoWeekH: 'One question for the table',
  intoWeekMl: 'കുടുംബമായി സംസാരിക്കാം',
  smallAct: 'One small act',
  prayer: 'A short prayer',
  prayerMl: 'ഒരു ചെറിയ പ്രാർത്ഥന',
  shareH: 'Send this Sunday to your family group',
  shareText: 'A card with the verse, the question and a link back here.',
  shareBtn: 'Share the card',
  copyLink: 'Copy link',
  copied: 'Link copied',
  sermonLabel: 'A sermon on this Gospel',
  watch: 'Watch',
  otherSundays: 'Other Sundays',
  lastSunday: 'Last Sunday',
  nextSunday: 'Next Sunday',
  earlier: 'Earlier',
  later: 'Later',
  sources: 'Sources',
  sourcesText: (lect: string, ml: string, en: string) => `Readings: ${lect}. Malayalam verse: ${ml}. English verse: ${en}.`,
  prepared: (d: string) => `Edition prepared ${d}.`,
  openSource: 'Open source',
  reuse: 'Code, calendar and reading data are free to reuse:',
  licence: 'Licence',
  archive: 'All Sundays',
  allLabel: 'The whole year',
  allText: 'Every Sunday of the Church year, season by season: readings, the Gospel and a question for the family.',
  allCta: (n: number) => `See all ${n} Sundays`,
  allWhere: (k: number, n: number, season: string) => `Sunday ${k} of ${n} in ${season}`,
  archiveH: 'Every edition of This Sunday',
  archiveIntro: 'Each page stays at its own address, so you can go back to any Sunday.',
  home: 'This Sunday',
  notFoundH: 'That page is not here',
  notFoundText: 'The Sunday you are looking for may not be written yet.',
  goToThisSunday: 'Go to this Sunday',
  breadcrumb: 'Breadcrumb',
  langName: { en: 'English', ml: 'മലയാളം' } as Record<string, string>,
  langShort: { en: 'EN', ml: 'മല' } as Record<string, string>,
  audioLang: { ml: 'Malayalam', en: 'English' } as Record<string, string>,
  titleSuffix: (name: string, date: string) => `${name}: readings and Gospel for ${date}`,
};

export type Strings = typeof en;

const ml: Strings = {
  ...en,
  skip: 'വായനകളിലേക്ക് പോകുക',
  sections: 'ഭാഗങ്ങൾ',
  navReadings: 'വായനകൾ',
  navGospel: 'സുവിശേഷം',
  navGospelShort: 'സുവിശേഷം',
  navReflection: 'ധ്യാനം',
  navWeek: 'ഈ ആഴ്ചയിലേക്ക്',
  navWeekShort: 'ആഴ്ച',
  language: 'ഭാഷ',
  weekOfYear: (n) => `സഭാവർഷത്തിലെ ${n}-ാം ആഴ്ച`,
  weekShort: (n) => `${n}-ാം ആഴ്ച`,
  listen: 'കേൾക്കുക',
  readGospel: 'സുവിശേഷം വായിക്കുക',
  readShort: 'വായിക്കുക · 5 മിനിറ്റ്',
  fiveMinutes: 'ആകെ ഏകദേശം 5 മിനിറ്റ്',
  season: 'കാലം',
  gospel: 'സുവിശേഷം',
  alsoKeptAs: 'ഈ ദിവസം',
  readingsCount: (n) => `${n} വായനകൾ`,
  oneMinute: 'ഒരു മിനിറ്റിൽ',
  oneMinuteH: 'ഇത്രയെങ്കിലും വായിക്കുക',
  whatHappens: 'എന്തു സംഭവിക്കുന്നു',
  whyThisSunday: 'എന്തുകൊണ്ട് ഈ ഞായർ',
  takeWithYou: 'കൂടെ കൊണ്ടുപോകാൻ',
  readingsKicker: () => 'ഈ ഞായറാഴ്ചയുടെ വായനകൾ',
  readingsH: (n, s) => `${s} ശുശ്രൂഷകളിലായി ${n} വായനകൾ`,
  service: 'ശുശ്രൂഷ',
  gospelOfDay: '(ദിവസത്തിന്റെ)',
  easyToMiss: 'ശ്രദ്ധിക്കാതെ പോകാവുന്നത്',
  verseToKeep: 'ഓർത്തുവയ്ക്കാൻ ഒരു വാക്യം',
  reflection: 'ധ്യാനം',
  intoWeek: 'ഈ ആഴ്ചയിലേക്ക്',
  intoWeekH: 'കുടുംബമായി സംസാരിക്കാം',
  smallAct: 'ഒരു ചെറിയ പ്രവൃത്തി',
  prayer: 'ഒരു ചെറിയ പ്രാർത്ഥന',
  lastSunday: 'കഴിഞ്ഞ ഞായർ',
  nextSunday: 'അടുത്ത ഞായർ',
  sources: 'ഉറവിടങ്ങൾ',
  archive: 'എല്ലാ ഞായറുകളും',
  allLabel: 'സഭാവർഷം മുഴുവൻ',
  allText: 'സഭാവർഷത്തിലെ എല്ലാ ഞായറുകളും, കാലം തിരിച്ച്: വായനകൾ, സുവിശേഷം, കുടുംബത്തിനുള്ള ഒരു ചോദ്യം.',
  allCta: (n: number) => `എല്ലാ ${n} ഞായറുകളും കാണുക`,
  allWhere: (k: number, n: number, season: string) => `${season} · ${k} / ${n}`,
};

export const strings: Record<Lang, Strings> = { en, ml };

function numberWord(n: number): string {
  const w = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen'];
  return w[n] ?? String(n);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** 15 November 2026 */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
/** Sunday, 15 November 2026 */
export const fullDate = (iso: string) => `Sunday, ${longDate(iso)}`;
/** 15 November */
export const dayMonth = (iso: string) => longDate(iso).replace(/ \d{4}$/, '');
/** 15 Nov */
export const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)}`;
};
