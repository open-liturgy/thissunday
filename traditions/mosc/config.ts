import { defineTradition } from '../../src/lib/tradition';

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
    default: { ground: '#15183D', glow: '#F4B544' },
    // Alternatives approved on the canvas, for seasons that want them:
    // Great Lent { ground: '#2E1437', glow: '#F1E6C6' }, Passion { ground: '#4A1220', glow: '#F3A68C' },
    // Pentecost { ground: '#0E3330', glow: '#F4B544' }
    bySeason: {},
  },
  languages: ['en', 'ml'],
});
