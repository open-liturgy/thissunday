/** `npm run check`: validate every edition and list placeholders, without building. */
import { loadTradition } from '../src/lib/tradition';
import { loadSite } from '../src/lib/content';
import { hasSundayArt } from '../src/components/SundayArt';

const site = loadSite(await loadTradition());
for (const w of site.warnings) console.warn(`warn  ${w}`);
for (const e of site.errors) console.error(`error ${e}`);

// Colour themes: white, the glow and the on-dark greys sit on the ground, and the
// ground is used as ink on paper. Every pair must reach WCAG AA (4.5:1).
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const c = site.tradition.colours;
const themes: [string, { ground: string; glow: string }][] = [
  ['default', c.default],
  ...Object.entries(c.bySeason ?? {}).map(([k, v]) => [`season ${k}`, v] as [string, typeof v]),
  ...Object.entries(c.bySlug ?? {}).map(([k, v]) => [`sunday ${k}`, v] as [string, typeof v]),
  ...site.all.flatMap((e) => (e.season.colors ? [[`edition ${e.date}`, e.season.colors] as [string, typeof e.season.colors]] : [])),
];
let contrastErrors = 0;
for (const [name, t] of themes) {
  for (const [fg, on, what] of [
    ['#FFFFFF', t.ground, 'white on ground'],
    [t.glow, t.ground, 'glow on ground'],
    ['#A4A9D1', t.ground, 'on-dark grey on ground'],
    [t.ground, '#F5F6FA', 'ground as ink on paper'],
  ] as const) {
    const r = ratio(fg, on);
    if (r < 4.5) {
      contrastErrors++;
      console.error(`error ${name}: ${what} is ${r.toFixed(2)}:1, needs 4.5:1`);
    }
  }
}
for (const e of site.all) if (!hasSundayArt(e.sunday_slug)) console.warn(`warn  ${e.date} ${e.sunday_slug}: no hero illustration yet, showing the altar`);

const errors = site.errors.length + contrastErrors;
console.log(`${site.all.length} valid edition(s), ${themes.length} colour theme(s), ${errors} error(s), ${site.warnings.length} warning(s)`);
process.exit(errors ? 1 : 0);
