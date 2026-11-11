import { defineTradition, type SeasonColours } from '../../src/lib/tradition';

/** Give each slug the next palette in turn. */
const rotate = (palettes: SeasonColours[], slugs: string[]) =>
  Object.fromEntries(slugs.map((s, i) => [s, palettes[i % palettes.length]]));

/** Malankara Orthodox Syrian Church. */
export default defineTradition({
  id: 'mosc',
  contentDir: 'content',
  site: {
    name: 'This Sunday',
    nameMl: 'ഈ ഞായറാഴ്ച',
    url: 'https://thissunday.example', // [SITE ADDRESS] set SITE_URL in CI
    about: 'One Sunday at a time, for the Malankara Orthodox Church. A new edition every week.',
    publisher: 'This Sunday',
    repository: '[REPOSITORY LINK]',
    codeLicence: '[CODE LICENCE]',
    contentLicence: '[CONTENT LICENCE]',
    timeZone: 'Asia/Kolkata',
  },
  services: [
    { id: 'evening', en: 'Evening prayer', short: 'Evening', ml: 'സന്ധ്യാപ്രാർത്ഥന' },
    { id: 'morning', en: 'Morning prayer', short: 'Morning', ml: 'പ്രഭാതപ്രാർത്ഥന' },
    { id: 'before_qurbana', en: 'Before Qurbana', short: 'Before', ml: 'കുർബാനയ്ക്കു മുമ്പ്' },
    { id: 'holy_qurbana', en: 'Holy Qurbana', short: 'Qurbana', ml: 'വിശുദ്ധ കുർബാന' },
  ],
  readingKinds: {
    'Gospel': 'സുവിശേഷം',
    'Old Testament': 'പഴയനിയമം',
    'General Epistle': 'പൊതുലേഖനം',
    'Pauline Epistle': 'പൗലോസിന്റെ ലേഖനം',
    'Acts': 'അപ്പൊസ്തലപ്രവൃത്തികൾ',
    'Prophets': 'പ്രവാചകന്മാർ',
  },
  bible: {
    ml: 'സത്യവേദപുസ്തകം, 1910',
    en: 'World English Bible',
  },
  lectionary: {
    label: 'official lectionary',
    publisher: 'the Malankara Orthodox Syrian Church',
  },
  colours: {
    // Every ground keeps white, the glow colour and the on-dark greys at 5.5:1 or
    // better, and works as --ink on paper. Check new pairs with `npm run check`.
    default: { ground: '#15183D', glow: '#F4B544' },
    bySeason: {
      'Koodosh Eetho': { ground: '#15183D', glow: '#F4B544' }, // ink and gold: the church year begins
      Suboro: { ground: '#0F2350', glow: '#F2C96B' }, // Marian blue
      Yeldho: { ground: '#3A0F22', glow: '#F4C65A' }, // Nativity wine and gold
      Denha: { ground: '#0A3340', glow: '#8EDBD6' }, // the Jordan
      'Remembrance of the departed': { ground: '#22252E', glow: '#D8CDB8' }, // slate and candlelight
      'Great Lent': { ground: '#2E1437', glow: '#F1E6C6' }, // approved on the canvas
      Kyomtho: { ground: '#13325B', glow: '#FFC48C' }, // dawn after the Resurrection
      Pentecost: { ground: '#0E3330', glow: '#F4B544' }, // approved on the canvas
      Sleeba: { ground: '#2A1712', glow: '#EDB97A' }, // the wood of the Cross
    },
    bySlug: {
      hosanna: { ground: '#4A1220', glow: '#F3A68C' }, // Passion, approved on the canvas
      easter: { ground: '#2F2410', glow: '#FFD98A' },
      pentecost: { ground: '#4A1414', glow: '#FFB36B' }, // tongues of fire
      shunoyo: { ground: '#102A5C', glow: '#F6D27A' },
      // The long Pentecost season turns through three greens, Sunday by Sunday.
      ...rotate(
        [
          { ground: '#0E3330', glow: '#F4B544' },
          { ground: '#133520', glow: '#E3D77A' },
          { ground: '#0C2F3B', glow: '#9FE0C8' },
        ],
        [
          'first-sunday-after-pentecost', 'second-sunday-after-pentecost', 'third-sunday-after-pentecost',
          'fourth-sunday-after-pentecost', 'fifth-sunday-after-pentecost', 'sixth-sunday-after-pentecost',
          'seventh-sunday-after-pentecost', 'eighth-sunday-after-pentecost', 'ninth-sunday-after-pentecost',
          'tenth-sunday-after-pentecost', 'eleventh-sunday-after-pentecost', 'twelfth-sunday-after-pentecost',
          'first-sunday-after-transfiguration', 'second-sunday-after-transfiguration',
          'first-sunday-after-shunoyo', 'second-sunday-after-shunoyo', 'third-sunday-after-shunoyo',
          'fourth-sunday-after-shunoyo', 'fifth-sunday-after-shunoyo',
        ],
      ),
    },
  },
  languages: ['en', 'ml'],
});
