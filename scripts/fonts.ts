/**
 * Self-hosted, subset fonts. Each build subsets every face to the characters
 * the built pages actually use (plus printable ASCII), and limits variable
 * axes to the ranges the CSS uses.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
const pkgFile = (p: string) => require.resolve(p);

const LATIN_RANGE = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const ML_RANGE = 'U+0307, U+0323, U+0951-0952, U+0964-0965, U+0D00-0D7F, U+1CDA, U+1CF2, U+200C-200D, U+20B9, U+25CC, U+A830-A832';
const SYR_RANGE = 'U+0700-074F, U+0860-086A, U+200C-200F, U+25CC';

const inRanges = (range: string) => {
  const rs = range.split(',').map((r) => {
    const [a, b] = r.trim().replace('U+', '').split('-');
    return [parseInt(a, 16), parseInt(b ?? a, 16)] as const;
  });
  return (cp: number) => rs.some(([a, b]) => cp >= a && cp <= b);
};

interface Face {
  id: string;
  family: string;
  style: 'normal' | 'italic';
  weight: string;
  stretch?: string;
  src: string;
  range: string;
  axes?: Record<string, number | { min: number; max: number; default?: number }>;
  preload?: boolean;
}

export const FACES: Face[] = [
  {
    id: 'anek-latin',
    family: 'Anek Malayalam',
    style: 'normal',
    weight: '400 750',
    stretch: '80% 100%',
    src: '@fontsource-variable/anek-malayalam/files/anek-malayalam-latin-standard-normal.woff2',
    range: LATIN_RANGE,
    axes: { wght: { min: 400, max: 750, default: 500 }, wdth: { min: 80, max: 100, default: 100 } },
    preload: true,
  },
  {
    id: 'anek-ml',
    family: 'Anek Malayalam',
    style: 'normal',
    weight: '400 750',
    stretch: '80% 100%',
    src: '@fontsource-variable/anek-malayalam/files/anek-malayalam-malayalam-standard-normal.woff2',
    range: ML_RANGE,
    axes: { wght: { min: 400, max: 600, default: 500 }, wdth: { min: 90, max: 100, default: 100 } },
  },
  {
    id: 'newsreader',
    family: 'Newsreader',
    style: 'normal',
    weight: '400 500',
    src: '@fontsource-variable/newsreader/files/newsreader-latin-standard-normal.woff2',
    range: LATIN_RANGE,
    axes: { wght: { min: 400, max: 500, default: 400 }, opsz: 16 },
  },
  {
    id: 'newsreader-italic',
    family: 'Newsreader',
    style: 'italic',
    weight: '400 500',
    src: '@fontsource-variable/newsreader/files/newsreader-latin-wght-italic.woff2',
    range: LATIN_RANGE,
    axes: { wght: { min: 400, max: 500, default: 400 } },
  },
  {
    id: 'syriac',
    family: 'Noto Sans Syriac Western',
    style: 'normal',
    weight: '500',
    src: '@fontsource/noto-sans-syriac-western/files/noto-sans-syriac-western-syriac-500-normal.woff2',
    range: SYR_RANGE,
  },
];

let ASCII = '';
for (let i = 32; i < 127; i++) ASCII += String.fromCharCode(i);
const EXTRA = '‘’“”–—…·•→←×';

/** Plain text of an HTML document (good enough for collecting characters). */
export function htmlText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

export interface FontBuild {
  css: string;
  preload: string[];
  files: { file: string; bytes: number }[];
}

/**
 * @param text  every character any page shows
 * @param outDir  dist directory; fonts land in outDir/fonts/
 * @param subset  false = copy full files (dev server)
 */
export async function buildFonts(text: string, outDir: string, subset = true): Promise<FontBuild> {
  const chars = [...new Set([...text, ...ASCII, ...EXTRA])];
  const dir = path.join(outDir, 'fonts');
  fs.mkdirSync(dir, { recursive: true });
  const css: string[] = [];
  const preload: string[] = [];
  const files: FontBuild['files'] = [];
  for (const f of FACES) {
    const has = inRanges(f.range);
    let use = chars.filter((c) => has(c.codePointAt(0)!)).join('');
    if (f.id === 'anek-ml') {
      use += '‌‍◌';
      if (!/[ഀ-ൿ]/.test(use)) continue;
    }
    if (f.id === 'syriac' && !/[܀-ݏ]/.test(use)) continue;
    const src = fs.readFileSync(pkgFile(f.src));
    const out = subset ? await subsetFont(src, use, { targetFormat: 'woff2', variationAxes: f.axes as never }) : src;
    const hash = crypto.createHash('sha256').update(out).digest('hex').slice(0, 8);
    const name = `${f.id}-${hash}.woff2`;
    fs.writeFileSync(path.join(dir, name), out);
    files.push({ file: `/fonts/${name}`, bytes: out.length });
    css.push(
      `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};${f.stretch ? `font-stretch:${f.stretch};` : ''}font-display:swap;src:url(/fonts/${name}) format('woff2');unicode-range:${f.range.replace(/\s+/g, '')}}`,
    );
    if (f.preload) preload.push(`/fonts/${name}`);
  }
  // Metric-matched fallback keeps CLS near zero while the web font loads.
  css.push(`@font-face{font-family:'Anek Fallback';src:local('Arial');size-adjust:94%;ascent-override:105%;descent-override:35%}`);
  return { css: css.join(''), preload, files };
}
