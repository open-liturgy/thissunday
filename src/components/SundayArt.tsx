/**
 * One hero illustration per Sunday, keyed by `sunday_slug`.
 *
 * Every picture shares the grammar of the original altar arch: a disc of
 * light with rings, a dark floor band, and one subject drawn in the season's
 * glow colour (currentColor) with white accents. All original line art,
 * inline SVG, no requests. A Sunday without its own motif falls back to the
 * altar of incense.
 */
import type { ReactNode } from 'react';
import { AltarArt } from './Art';

const W = '#FFFFFF';
const V = '#E4502E';

type Detail = 'full' | 'small';
interface Ctx {
  /** Stroke multiplier: 1 on the page, thicker on small share cards. */
  k: number;
  small: boolean;
}
interface Motif {
  label: string;
  /** Centre of the disc of light. */
  sun?: [number, number];
  /** Hide the solid disc (the motif draws its own light). */
  noDisc?: boolean;
  draw: (c: Ctx) => ReactNode;
}

/* ---------- small helpers ---------- */

const ln = (c: Ctx, w = 2, o = 1, col = 'currentColor') => ({
  fill: 'none',
  stroke: col,
  strokeWidth: w * c.k,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  opacity: o,
});
const wl = (c: Ctx, w = 2, o = 1) => ln(c, w, o, W);

/** n-pointed star path. */
function star(cx: number, cy: number, r1: number, r2: number, n = 8) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = (Math.PI * i) / n - Math.PI / 2;
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return d + 'Z';
}

const Flame = ({ x, y, s = 1, fill = W }: { x: number; y: number; s?: number; fill?: string }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 0C-10 -6 -12 -18 -6 -28C-4 -20 2 -20 0 -36C10 -26 12 -10 0 0Z" fill={fill} />
);

/** A standing figure: head plus robe, feet at y. */
const Figure = ({ x, y = 500, s = 1, fill = 'currentColor', o = 1, tilt = 0 }: { x: number; y?: number; s?: number; fill?: string; o?: number; tilt?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity={o}>
    <circle cx={tilt} cy={-178} r={18} />
    <path d="M-40 0C-40 -90 -30 -150 0 -158C30 -150 40 -90 40 0Z" />
  </g>
);

const Dove = ({ x, y, s = 1, fill = W }: { x: number; y: number; s?: number; fill?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <path d="M-34 6C-18 -4 4 -4 18 2L32 -6L28 6C18 16 -8 18 -34 6Z" />
    <path d="M-8 2C-14 -22 -6 -40 12 -50C10 -30 8 -14 4 2Z" />
    <path d="M-2 2C-26 -14 -40 -26 -46 -44C-26 -38 -12 -24 6 0Z" opacity="0.7" />
  </g>
);

const Fish = ({ x, y, s = 1, fill = 'currentColor', flip = false }: { x: number; y: number; s?: number; fill?: string; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M-30 0C-14 -16 14 -16 26 0L42 -13V13L26 0C14 16 -14 16 -30 0Z" fill={fill} />
    <circle cx={-16} cy={-3} r={2.6} fill="#000" opacity="0.5" />
  </g>
);

/** A round loaf with scored lines. */
const Loaf = ({ x, y, s = 1, c }: { x: number; y: number; s?: number; c: Ctx }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-40 0C-40 -26 -20 -36 0 -36C20 -36 40 -26 40 0Z" fill="currentColor" />
    <path d="M-18 -26L-10 -8M2 -30L6 -10M18 -24L16 -8" {...wl(c, 2 / s, 0.7)} />
  </g>
);

/** Open hand, palm up the page, wrist at origin. */
const Hand = ({ x, y, s = 1, r = 0, fill = 'currentColor', stroke }: { x: number; y: number; s?: number; r?: number; fill?: string; stroke?: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={fill} stroke={stroke} strokeWidth={stroke ? 2 : 0}>
    <path d="M-26 -50V-96a6.5 6.5 0 0 1 13 0V-104a6.5 6.5 0 0 1 13 0V-100a6.5 6.5 0 0 1 13 0V-88a6.5 6.5 0 0 1 13 0V-40L38 -64a7 7 0 0 1 12 7L28 -10C22 0 14 4 0 4H-10C-20 4 -26 -6 -26 -20Z" />
  </g>
);

/** Ear of wheat: stem from (x,y) up `h`, leaning by `lean`. */
function Wheat({ x, y, h, lean = 0, c, o = 1 }: { x: number; y: number; h: number; lean?: number; c: Ctx; o?: number }) {
  const tx = x + lean;
  const ty = y - h;
  const grains = [];
  for (let i = 0; i < 6; i++) {
    const gy = ty + 10 + i * 9;
    const gx = tx - lean * (i / 30);
    grains.push(<ellipse key={`l${i}`} cx={gx - 5} cy={gy} rx={3.6} ry={7} transform={`rotate(-24 ${gx - 5} ${gy})`} />);
    grains.push(<ellipse key={`r${i}`} cx={gx + 5} cy={gy} rx={3.6} ry={7} transform={`rotate(24 ${gx + 5} ${gy})`} />);
  }
  return (
    <g opacity={o}>
      <path d={`M${x} ${y}Q${x} ${y - h / 2} ${tx} ${ty}`} {...ln(c, 2)} />
      <g fill="currentColor">
        {grains}
        <ellipse cx={tx} cy={ty + 2} rx={3.4} ry={7} />
      </g>
    </g>
  );
}

/** Palm frond along a quadratic curve. */
function Frond({ p, c, n = 16, len = 46, o = 1 }: { p: [number, number, number, number, number, number]; c: Ctx; n?: number; len?: number; o?: number }) {
  const [x0, y0, cx, cy, x1, y1] = p;
  let d = `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`;
  for (let i = 2; i <= n; i++) {
    const t = i / (n + 1);
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    const m = Math.hypot(dx, dy);
    const ux = dx / m;
    const uy = dy / m;
    const L = len * Math.sin(Math.PI * t) + 8;
    for (const side of [1, -1]) {
      const ex = x + (-uy * side + ux * 0.7) * L;
      const ey = y + (ux * side + uy * 0.7) * L;
      d += `M${x.toFixed(1)} ${y.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
    }
  }
  return <path d={d} {...ln(c, 2.2, o)} />;
}

const FigLeaf = ({ x, y, s = 1, r = 0, fill = 'currentColor', o = 1 }: { x: number; y: number; s?: number; r?: number; fill?: string; o?: number }) => (
  <path
    transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
    d="M0 0C-10 -20 -34 -24 -40 -44C-24 -44 -16 -52 -14 -66C-6 -56 0 -62 0 -82C0 -62 6 -56 14 -66C16 -52 24 -44 40 -44C34 -24 10 -20 0 0Z"
    fill={fill}
    opacity={o}
  />
);

const Waves = ({ c, ys, o = 0.5 }: { c: Ctx; ys: number[]; o?: number }) => (
  <g {...wl(c, 2, o)}>
    {ys.map((y, i) => (
      <path key={y} d={`M${20 + (i % 2) * 30} ${y}c20 -8 40 -8 60 0s40 8 60 0s40 -8 60 0s40 8 60 0s40 -8 60 0s40 8 60 0`} />
    ))}
  </g>
);

const Jar = ({ x, y = 500, w = 50, h = 110, o = 1 }: { x: number; y?: number; w?: number; h?: number; o?: number }) => (
  <path
    opacity={o}
    fill="currentColor"
    d={`M${x - w * 0.32} ${y}C${x - w * 0.6} ${y - h * 0.3} ${x - w * 0.6} ${y - h * 0.75} ${x - w * 0.3} ${y - h * 0.9}V${y - h}H${x + w * 0.3}V${y - h * 0.9}C${x + w * 0.6} ${y - h * 0.75} ${x + w * 0.6} ${y - h * 0.3} ${x + w * 0.32} ${y}Z`}
  />
);

const Basket = ({ x, y, w = 110, c }: { x: number; y: number; w?: number; c: Ctx }) => (
  <g>
    <path d={`M${x - w / 2} ${y - 50}H${x + w / 2}L${x + w * 0.4} ${y}H${x - w * 0.4}Z`} fill="currentColor" opacity="0.35" />
    <path d={`M${x - w / 2} ${y - 50}H${x + w / 2}L${x + w * 0.4} ${y}H${x - w * 0.4}Z`} {...ln(c, 2)} />
    <path d={`M${x - w * 0.46} ${y - 34}H${x + w * 0.46}M${x - w * 0.43} ${y - 17}H${x + w * 0.43}`} {...ln(c, 1.5, 0.7)} />
  </g>
);

const Door = ({ c, ajar = false }: { c: Ctx; ajar?: boolean }) => (
  <g>
    <path d="M140 500V300a80 80 0 0 1 160 0V500" {...ln(c, 3)} />
    {ajar ? (
      <>
        <path d="M150 500V302a70 70 0 0 1 140 0V500Z" fill={W} opacity="0.85" />
        <path d="M150 500V300C150 268 168 244 190 232L196 470Z" fill="currentColor" />
        <path d="M150 500L290 500L420 580H0Z" fill={W} opacity="0.18" />
      </>
    ) : (
      <path d="M150 500V302a70 70 0 0 1 140 0V500Z" fill="currentColor" opacity="0.35" />
    )}
  </g>
);

/* ---------- the motifs ---------- */

const motifs: Record<string, Motif> = {
  'koodhosh-eetho': {
    label: 'A small church with a cross, built on a rock',
    sun: [220, 190],
    draw: (c) => (
      <>
        <path d="M30 500L90 446L160 456L220 430L290 452L350 438L410 500Z" fill="currentColor" opacity="0.3" />
        <path d="M30 500L90 446L160 456L220 430L290 452L350 438L410 500" {...ln(c, 2)} />
        <rect x="160" y="320" width="120" height="114" fill="currentColor" opacity="0.2" />
        <rect x="160" y="320" width="120" height="114" {...ln(c, 2)} />
        <path d="M148 322L220 262L292 322Z" fill="currentColor" />
        <path d="M204 434V396a16 16 0 0 1 32 0V434Z" fill="currentColor" />
        <circle cx="220" cy="352" r="10" fill={W} opacity="0.85" />
        <path d="M220 262V212M204 228H236" {...wl(c, 4)} />
      </>
    ),
  },
  'hoodhosh-eetho': {
    label: 'The colonnade of the Temple in winter, with a lamp burning between the pillars',
    sun: [220, 150],
    draw: (c) => (
      <>
        <path d="M60 250L220 196L380 250Z" fill="currentColor" opacity="0.25" />
        <path d="M60 250L220 196L380 250Z" {...ln(c, 2)} />
        <rect x="56" y="250" width="328" height="18" fill="currentColor" />
        {[88, 146, 294, 352].map((x) => (
          <g key={x}>
            <rect x={x - 12} y="268" width="24" height="200" fill="currentColor" opacity="0.22" />
            <rect x={x - 12} y="268" width="24" height="200" {...ln(c, 1.5)} />
          </g>
        ))}
        <rect x="50" y="468" width="340" height="14" fill="currentColor" />
        <path d="M220 268V350" {...ln(c, 1.5, 0.7)} />
        <path d="M194 362Q220 392 246 362Z" fill="currentColor" />
        <Flame x={220} y={360} s={1.2} />
      </>
    ),
  },
  'annunciation-to-st-mary': {
    label: 'A beam of light and a dove descending on a lily',
    sun: [110, 120],
    draw: (c) => (
      <>
        <path d="M60 0H150L260 500H210Z" fill={W} opacity="0.08" />
        <Dove x={150} y={150} s={0.9} />
        <path d="M240 500C240 420 234 360 240 268" {...ln(c, 3)} />
        <path d="M240 440C206 420 192 388 188 356C214 376 232 402 240 440Z" fill="currentColor" opacity="0.6" />
        <path d="M240 410C272 392 288 364 292 334C266 352 248 378 240 410Z" fill="currentColor" opacity="0.6" />
        <g fill="currentColor">
          <path d="M240 270C220 248 206 230 196 204C218 212 232 228 240 244C248 228 262 212 284 204C274 230 260 248 240 270Z" />
          <path d="M240 244C234 222 236 204 240 188C244 204 246 222 240 244Z" />
        </g>
        <path d="M240 320C220 316 206 300 200 284" {...ln(c, 2)} />
        <path d="M200 286C190 270 192 256 200 246C208 256 210 270 200 286Z" fill="currentColor" />
        <circle cx="240" cy="230" r="3" fill={W} />
      </>
    ),
  },
  'visitation-to-elizabeth': {
    label: 'Mary and Elizabeth, two expectant mothers, meeting and greeting each other',
    sun: [220, 220],
    draw: (c) => (
      <>
        <Figure x={168} tilt={10} />
        <Figure x={272} tilt={-10} o={0.55} />
        <path d="M210 360C220 350 230 350 236 362" {...wl(c, 3, 0.9)} />
        <path d={star(220, 270, 16, 5, 4)} fill={W} />
      </>
    ),
  },
  'birth-of-john-the-baptist': {
    label: 'A writing tablet with a stylus: his name is John',
    sun: [310, 170],
    draw: (c) => (
      <>
        <rect x="120" y="270" width="190" height="210" rx="10" fill="currentColor" opacity="0.22" />
        <rect x="120" y="270" width="190" height="210" rx="10" {...ln(c, 2.5)} />
        <rect x="140" y="290" width="150" height="170" rx="4" {...ln(c, 1.5, 0.5)} />
        <g {...wl(c, 3, 0.9)}>
          <path d="M160 330c10 -12 18 12 28 0s18 12 28 0s18 12 28 0s14 8 24 0" />
          <path d="M160 370c10 -12 18 12 28 0s18 12 28 0s14 8 22 0" />
          <path d="M160 410c10 -12 18 12 28 0s18 12 28 0s18 12 28 0" />
        </g>
        <path d="M318 214L266 344" {...wl(c, 5)} />
        <path d="M266 344L262 356L272 348" fill={W} />
      </>
    ),
  },
  'annunciation-to-st-joseph': {
    label: 'A crescent moon and stars over a carpenter’s square: Joseph’s dream',
    sun: [300, 170],
    noDisc: true,
    draw: (c) => (
      <>
        <path d="M300 106a66 66 0 1 0 54 104a54 54 0 1 1 -54 -104Z" fill="currentColor" />
        {[
          [120, 120, 9],
          [176, 196, 6],
          [90, 240, 6],
          [380, 290, 7],
        ].map(([x, y, r]) => (
          <path key={x} d={star(x, y, r, r / 3, 4)} fill={W} />
        ))}
        <path d="M110 476V320H140V446H300V476Z" fill="currentColor" />
        <path d="M120 340V438M150 456H290" {...ln(c, 1, 0.35, '#000')} />
        <rect x="90" y="476" width="260" height="14" fill="currentColor" opacity="0.6" />
        <path d="M240 446l20 -60 16 6 -20 54Z" fill={W} opacity="0.8" />
      </>
    ),
  },
  'sunday-before-christmas': {
    label: 'A family tree whose branches rise from Adam to a single bright point',
    sun: [220, 150],
    draw: (c) => (
      <>
        <g {...ln(c, 3)}>
          <path d="M220 500C216 440 224 400 220 340C222 260 220 200 220 166" />
          <path d="M220 420C180 400 150 360 130 310C112 280 100 256 96 226" />
          <path d="M220 400C260 380 290 340 310 290C328 260 340 236 346 206" />
          <path d="M220 330C210 300 200 270 186 226" />
          <path d="M220 316C236 290 250 260 262 214" />
          <path d="M220 500C200 486 172 488 150 500M220 500C240 486 268 488 290 500" />
        </g>
        <g fill="currentColor">
          {[
            [130, 310],
            [96, 226],
            [310, 290],
            [346, 206],
            [186, 226],
            [262, 214],
            [220, 400],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={9} />
          ))}
        </g>
        <circle cx="220" cy="150" r="16" fill={W} />
      </>
    ),
  },
  'first-sunday-after-christmas': {
    label: 'A star over three gifts: gold, frankincense and myrrh',
    sun: [220, 140],
    noDisc: true,
    draw: (c) => (
      <>
        <path d="M220 170V410" {...wl(c, 2, 0.35)} />
        <path d={star(220, 140, 54, 12, 8)} fill="currentColor" />
        <circle cx="220" cy="140" r="12" fill={W} />
        <rect x="96" y="440" width="70" height="60" fill="currentColor" />
        <rect x="90" y="428" width="82" height="16" fill="currentColor" />
        <path d="M131 428V500" {...ln(c, 2, 0.5, '#000')} />
        <Jar x={220} y={500} w={60} h={92} />
        <path d="M282 500V454C282 440 296 430 314 430C332 430 346 440 346 454V500Z" fill="currentColor" opacity="0.75" />
        <circle cx="314" cy="420" r="8" fill="currentColor" />
      </>
    ),
  },
  'second-sunday-after-christmas': {
    label: 'The boy Jesus in the Temple, between two pillars, beside an open scroll',
    sun: [220, 200],
    draw: (c) => (
      <>
        {[110, 330].map((x) => (
          <rect key={x} x={x - 14} y="200" width="28" height="260" fill="currentColor" opacity="0.4" />
        ))}
        <rect x="80" y="186" width="280" height="16" fill="currentColor" />
        <rect x="70" y="460" width="300" height="14" fill="currentColor" />
        <rect x="50" y="480" width="340" height="20" fill="currentColor" opacity="0.6" />
        <Figure x={220} y={460} s={0.62} />
        <path d="M150 440H290V420H150Z" fill={W} opacity="0.9" />
        <rect x="140" y="414" width="12" height="32" rx="6" fill="currentColor" />
        <rect x="288" y="414" width="12" height="32" rx="6" fill="currentColor" />
      </>
    ),
  },
  'first-sunday-after-denha': {
    label: 'A great light rising over the Sea of Galilee, and a fishing boat',
    sun: [300, 400],
    noDisc: true,
    draw: (c) => (
      <>
        <path d="M210 400a90 90 0 0 1 180 0Z" fill="currentColor" />
        <g {...ln(c, 2, 0.6)}>
          {[-60, -30, 0, 30, 60].map((a) => {
            const r = (a * Math.PI) / 180;
            return <path key={a} d={`M${300 + 110 * Math.sin(r)} ${400 - 110 * Math.cos(r)}L${300 + 170 * Math.sin(r)} ${400 - 170 * Math.cos(r)}`} />;
          })}
        </g>
        <rect x="0" y="400" width="440" height="100" fill="#000" opacity="0.2" />
        <Waves c={c} ys={[430, 460, 488]} />
        <path d="M60 436H220L196 466H84Z" fill="currentColor" />
        <path d="M140 436V330L196 420" {...ln(c, 2.5)} />
      </>
    ),
  },
  'second-sunday-after-denha': {
    label: 'A fig tree, and a path that says come and see',
    sun: [300, 200],
    draw: (c) => (
      <>
        <path d="M30 500C110 470 150 440 230 456" {...wl(c, 3, 0.5)} strokeDasharray={`${8 * c.k} ${10 * c.k}`} />
        <path d="M300 500C296 440 304 400 296 330M298 400C320 370 340 350 360 340M296 360C270 340 250 320 240 290" {...ln(c, 6)} />
        <FigLeaf x={296} y={330} s={1.1} />
        <FigLeaf x={360} y={340} s={0.9} r={40} />
        <FigLeaf x={240} y={290} s={0.9} r={-40} />
        <FigLeaf x={320} y={290} s={0.8} r={15} o={0.7} />
        <FigLeaf x={270} y={340} s={0.7} r={-80} o={0.7} />
        <Figure x={320} y={500} s={0.45} />
      </>
    ),
  },
  'all-departed-priests': {
    label: 'A censer hanging on its chains, with smoke rising',
    sun: [220, 200],
    draw: (c) => (
      <>
        <g {...ln(c, 1.5)}>
          <path d="M220 30L168 330M220 30V300M220 30L272 330" />
        </g>
        {[110, 180, 250].map((y) => (
          <g key={y} fill="currentColor">
            <circle cx={220 - ((y - 30) * 52) / 300} cy={y} r={4} />
            <circle cx={220 + ((y - 30) * 52) / 300} cy={y} r={4} />
          </g>
        ))}
        <path d="M172 334C180 296 260 296 268 334Z" fill="currentColor" opacity="0.5" />
        <path d="M220 300V284M212 290H228" {...ln(c, 2.5)} />
        <path d="M160 334H280C276 384 252 404 220 404C188 404 164 384 160 334Z" fill="currentColor" />
        <path d="M200 404L192 430H248L240 404" fill="currentColor" />
        <g {...wl(c, 2)}>
          <path d="M206 300C186 276 214 256 200 232S190 196 206 176" opacity="0.7" />
          <path d="M234 300C252 278 228 258 244 236S254 204 238 184" opacity="0.45" />
        </g>
      </>
    ),
  },
  'all-departed-faithful': {
    label: 'An oil lamp burning beneath the stars',
    sun: [318, 200],
    draw: (c) => (
      <>
        <path d="M110 452C110 410 260 400 320 432L364 418C356 450 316 474 240 476C160 478 110 472 110 452Z" fill="currentColor" />
        <path d="M150 428C190 414 250 414 290 428" {...ln(c, 2, 0.5, '#000')} />
        <circle cx="200" cy="420" r="9" fill="#000" opacity="0.4" />
        <rect x="150" y="476" width="140" height="12" rx="4" fill="currentColor" opacity="0.7" />
        <Flame x={360} y={414} s={2.2} />
        <Flame x={360} y={414} s={1} fill={V} />
      </>
    ),
  },
  kothne: {
    label: 'Six stone water jars at the wedding in Cana, the last one filled with wine',
    sun: [220, 190],
    draw: (c) => (
      <>
        {[90, 162, 234].map((x) => (
          <Jar key={x} x={x + 20} y={430} w={56} h={100} o={0.45} />
        ))}
        {[70, 150, 230, 310].slice(0, 3).map((x) => (
          <Jar key={x} x={x + 40} y={500} w={62} h={118} />
        ))}
        <Jar x={350} y={500} w={62} h={118} />
        <ellipse cx="350" cy="382" rx="18" ry="5" fill={V} />
        <path d="M350 382C350 340 330 320 300 300" {...wl(c, 3, 0.6)} />
      </>
    ),
  },
  'lepers-sunday': {
    label: 'Jesus reaching out to touch a man with leprosy who kneels before him',
    sun: [220, 230],
    draw: (c) => (
      <>
        <Figure x={290} />
        <path d="M276 360C250 352 226 344 206 336" {...ln(c, 12)} />
        <circle cx="160" cy="352" r="16" fill="none" stroke={W} strokeWidth={2.5 * c.k} />
        <path d="M110 500C112 446 128 396 160 380C190 392 204 440 210 500" fill="none" stroke={W} strokeWidth={2.5 * c.k} strokeLinejoin="round" />
        <g fill={W} opacity="0.7">
          <circle cx="146" cy="440" r="3" />
          <circle cx="170" cy="420" r="2.5" />
          <circle cx="180" cy="466" r="3" />
        </g>
        <path d={star(194, 336, 16, 4, 8)} fill={W} />
      </>
    ),
  },
  'palsy-sunday': {
    label: 'Four friends on a roof, lowering a man on his mat through an opening',
    sun: [220, 130],
    draw: (c) => (
      <>
        <rect x="100" y="300" width="240" height="200" fill="currentColor" opacity="0.2" />
        <rect x="100" y="300" width="240" height="200" {...ln(c, 2)} />
        <rect x="86" y="286" width="108" height="16" fill="currentColor" />
        <rect x="246" y="286" width="108" height="16" fill="currentColor" />
        <path d="M196 290V392M244 290V392" {...wl(c, 1.5, 0.9)} />
        <rect x="176" y="392" width="88" height="12" rx="3" fill={W} />
        <circle cx="186" cy="384" r="8" fill={W} />
        <path d="M196 386H252" {...wl(c, 6)} />
        {[120, 160, 280, 320].map((x) => (
          <g key={x} fill="currentColor">
            <circle cx={x} cy={246} r={11} />
            <path d={`M${x - 16} 286C${x - 16} 266 ${x - 10} 260 ${x} 258C${x + 10} 260 ${x + 16} 266 ${x + 16} 286Z`} />
          </g>
        ))}
      </>
    ),
  },
  'canaanite-woman-sunday': {
    label: 'Crumbs falling from the table, and a small dog waiting beneath',
    sun: [220, 200],
    draw: (c) => (
      <>
        <rect x="70" y="350" width="300" height="14" fill="currentColor" />
        <path d="M90 364V500M350 364V500" {...ln(c, 6)} />
        <Loaf x={200} y={350} s={1.1} c={c} />
        <path d="M262 350C262 330 280 320 296 320C312 320 320 330 320 350Z" fill="currentColor" opacity="0.7" />
        <g fill={W}>
          {[
            [372, 384, 3],
            [380, 410, 2.5],
            [366, 436, 2],
            [384, 448, 3],
          ].map(([x, y, r]) => (
            <circle key={y} cx={x} cy={y} r={r} />
          ))}
        </g>
        <path d="M250 500V470C250 456 262 448 280 448H326L338 426L350 434L356 448C362 454 360 466 350 468L344 500H334V476H272V500Z" fill="currentColor" />
        <path d="M250 466C236 460 232 448 236 436" {...ln(c, 4)} />
      </>
    ),
  },
  'kpiptho-sunday': {
    label: 'A woman who was bent double now standing straight, her arms raised in praise',
    sun: [220, 200],
    draw: (c) => (
      <>
        <path d="M150 500C150 440 160 400 200 380" {...wl(c, 3, 0.35)} strokeDasharray={`${6 * c.k} ${8 * c.k}`} />
        <circle cx="220" cy="252" r="18" fill="currentColor" />
        <path d="M180 500C182 400 196 300 220 284C244 300 258 400 260 500Z" fill="currentColor" />
        <path d="M206 300C182 278 168 246 158 210M234 300C258 278 272 246 282 210" {...ln(c, 12)} />
        <g {...wl(c, 2, 0.7)}>
          <path d="M150 180L136 160M220 200V176M290 180L304 160" />
        </g>
      </>
    ),
  },
  'sixth-sunday-of-great-lent': {
    label: 'An eye opened to the light, above the pool of Siloam',
    sun: [220, 290],
    noDisc: true,
    draw: (c) => (
      <>
        <path d="M70 290C150 200 290 200 370 290C290 380 150 380 70 290Z" fill="currentColor" opacity="0.18" />
        <path d="M70 290C150 200 290 200 370 290C290 380 150 380 70 290Z" {...ln(c, 3)} />
        <circle cx="220" cy="290" r="52" fill="currentColor" />
        <circle cx="220" cy="290" r="20" fill="#000" opacity="0.55" />
        <circle cx="234" cy="276" r="8" fill={W} />
        <g {...ln(c, 2, 0.6)}>
          <path d="M220 190V150M150 206L130 176M290 206L310 176M100 236L72 214M340 236L368 214" />
        </g>
        <Waves c={c} ys={[440, 466, 490]} />
      </>
    ),
  },
  hosanna: {
    label: 'Palm branches waved on the road into Jerusalem',
    sun: [220, 180],
    draw: (c) => (
      <>
        <Frond p={[120, 500, 120, 300, 260, 140]} c={c} />
        <Frond p={[320, 500, 330, 330, 170, 200]} c={c} o={0.7} />
        <Frond p={[220, 500, 230, 380, 360, 300]} c={c} len={30} n={12} o={0.85} />
        <path d="M60 500L180 470H260L380 500Z" fill={W} opacity="0.12" />
        <path d="M150 482H290" {...ln(c, 6, 0.6, V)} />
      </>
    ),
  },
  easter: {
    label: 'The empty tomb at sunrise, its stone rolled away',
    sun: [220, 170],
    draw: (c) => (
      <>
        <path d="M30 500C70 380 190 330 290 340C370 350 410 420 420 500Z" fill="currentColor" opacity="0.3" />
        <path d="M30 500C70 380 190 330 290 340C370 350 410 420 420 500" {...ln(c, 2)} />
        <path d="M170 500V440a44 44 0 0 1 88 0V500Z" fill="#000" opacity="0.5" />
        <path d="M184 488H244" {...wl(c, 4, 0.9)} />
        <circle cx="320" cy="456" r="44" fill="currentColor" />
        <circle cx="320" cy="456" r="30" {...ln(c, 2, 0.4, '#000')} />
      </>
    ),
  },
  'new-sunday': {
    label: 'An open hand showing its wound, and Thomas reaching out to it',
    sun: [240, 220],
    draw: (c) => (
      <>
        <Hand x={250} y={470} s={1.5} />
        <circle cx="250" cy="400" r="7" fill={V} />
        <g {...wl(c, 2, 0.6)}>
          <path d="M250 250V214M190 270L170 244M310 270L330 244M160 330L128 318M340 330L372 318" />
        </g>
      </>
    ),
  },
  'first-sunday-after-new-sunday': {
    label: 'A charcoal fire on the beach with fish and bread',
    sun: [300, 200],
    draw: (c) => (
      <>
        <Waves c={c} ys={[380, 404]} o={0.35} />
        <path d="M0 420H440V500H0Z" fill="currentColor" opacity="0.15" />
        <path d="M150 480L290 450M150 450L290 480" {...ln(c, 10)} />
        <Flame x={220} y={452} s={2.2} fill={V} />
        <Flame x={220} y={452} s={1.3} />
        <path d="M150 420H290" {...ln(c, 2, 0.6)} />
        <Fish x={190} y={412} s={0.8} />
        <Fish x={256} y={412} s={0.8} flip />
        <Loaf x={360} y={490} s={0.7} c={c} />
        <Loaf x={84} y={490} s={0.6} c={c} />
      </>
    ),
  },
  'second-sunday-after-new-sunday': {
    label: 'Three sheep and a shepherd’s crook: feed my sheep',
    sun: [300, 200],
    draw: (c) => (
      <>
        <path d="M330 500V230a28 28 0 0 0 -56 0" {...ln(c, 7)} />
        {[
          [120, 470, 1],
          [220, 480, 1.1],
          [170, 420, 0.8],
        ].map(([x, y, s]) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M-20 10V36M18 10V36" {...ln(c, 4)} />
            <g fill={W}>
              <circle cx="0" cy="0" r="26" />
              <circle cx="-22" cy="-4" r="20" />
              <circle cx="22" cy="-4" r="20" />
              <circle cx="-8" cy="-20" r="18" />
              <circle cx="12" cy="-20" r="16" />
            </g>
            <ellipse cx="40" cy="-8" rx="11" ry="15" fill="currentColor" />
          </g>
        ))}
      </>
    ),
  },
  'third-sunday-after-new-sunday': {
    label: 'The road to Emmaus at evening, leading to a house with a lit window',
    sun: [318, 230],
    draw: (c) => (
      <>
        <path d="M120 500C180 450 260 440 250 400C242 370 220 360 236 340H252C244 362 278 376 280 400C284 446 300 470 320 500Z" fill={W} opacity="0.14" />
        <rect x="200" y="290" width="76" height="52" fill="currentColor" />
        <path d="M192 292L238 260L284 292Z" fill="currentColor" />
        <rect x="246" y="304" width="16" height="18" fill={W} />
        {[170, 196, 222].map((x, i) => (
          <Figure key={x} x={x + i * 6} y={470 - i * 16} s={0.3 - i * 0.03} o={i === 2 ? 0.55 : 1} />
        ))}
      </>
    ),
  },
  'fourth-sunday-after-new-sunday': {
    label: 'A road climbing toward the walls of Jerusalem',
    sun: [220, 160],
    draw: (c) => (
      <>
        <path d="M40 330C110 290 330 290 400 330V360H40Z" fill="currentColor" opacity="0.3" />
        <g fill="currentColor">
          <rect x="120" y="270" width="200" height="60" />
          <rect x="110" y="240" width="34" height="90" />
          <rect x="296" y="240" width="34" height="90" />
          <path d="M190 270a30 30 0 0 1 60 0Z" />
        </g>
        <path d="M206 330V306a14 14 0 0 1 28 0V330Z" fill="#000" opacity="0.45" />
        <path d="M150 500L208 340H232L290 500Z" fill={W} opacity="0.14" />
        <Figure x={220} y={490} s={0.42} />
      </>
    ),
  },
  'sunday-before-pentecost': {
    label: 'One large candle surrounded by many small ones: Jesus prays for his friends',
    sun: [220, 200],
    draw: (c) => (
      <>
        <rect x="200" y="330" width="40" height="150" fill="currentColor" />
        <Flame x={220} y={322} s={1.8} />
        {[
          [100, 470],
          [140, 440],
          [300, 440],
          [340, 470],
          [70, 430],
          [370, 430],
        ].map(([x, y]) => (
          <g key={x}>
            <rect x={x - 7} y={y} width="14" height={500 - y} fill="currentColor" opacity="0.8" />
            <Flame x={x} y={y - 4} s={0.7} />
          </g>
        ))}
      </>
    ),
  },
  pentecost: {
    label: 'The dove of the Spirit and tongues of fire resting on the disciples',
    sun: [220, 150],
    draw: (c) => (
      <>
        <Dove x={220} y={170} s={1.2} />
        {[90, 155, 220, 285, 350].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={430 - (i % 2) * 20} r={18} fill="currentColor" />
            <path d={`M${x - 30} 500C${x - 30} ${474 - (i % 2) * 20} ${x - 18} ${458 - (i % 2) * 20} ${x} ${456 - (i % 2) * 20}C${x + 18} ${458 - (i % 2) * 20} ${x + 30} ${474 - (i % 2) * 20} ${x + 30} 500Z`} fill="currentColor" opacity="0.7" />
            <Flame x={x} y={400 - (i % 2) * 20} s={1.2} fill={V} />
            <Flame x={x} y={400 - (i % 2) * 20} s={0.6} />
          </g>
        ))}
      </>
    ),
  },
  'first-sunday-after-pentecost': {
    label: 'A round loaf of bread with ears of wheat behind it: the bread of life',
    sun: [220, 220],
    draw: (c) => (
      <>
        <Wheat x={150} y={420} h={200} lean={-30} c={c} o={0.7} />
        <Wheat x={220} y={420} h={230} c={c} o={0.7} />
        <Wheat x={290} y={420} h={200} lean={30} c={c} o={0.7} />
        <Loaf x={220} y={490} s={3.2} c={c} />
      </>
    ),
  },
  'second-sunday-after-pentecost': {
    label: 'A lamb standing among the watching eyes of wolves',
    sun: [220, 300],
    noDisc: true,
    draw: (c) => (
      <>
        <g transform="translate(220 440) scale(1.6)">
          <path d="M-20 10V36M18 10V36" {...ln(c, 4 / 1.6)} />
          <g fill={W}>
            <circle cx="0" cy="0" r="26" />
            <circle cx="-22" cy="-4" r="20" />
            <circle cx="22" cy="-4" r="20" />
            <circle cx="-8" cy="-20" r="18" />
            <circle cx="12" cy="-20" r="16" />
          </g>
          <ellipse cx="40" cy="-8" rx="11" ry="15" fill="currentColor" />
        </g>
        {[
          [80, 300],
          [360, 280],
          [110, 200],
          [330, 170],
          [60, 420],
          [390, 400],
        ].map(([x, y]) => (
          <g key={x} fill="currentColor">
            <path d={`M${x - 16} ${y}l10 -5l4 5l-4 4Z`} />
            <path d={`M${x + 16} ${y}l-10 -5l-4 5l4 4Z`} />
          </g>
        ))}
      </>
    ),
  },
  'third-sunday-after-pentecost': {
    label: 'An open door with light spilling out',
    sun: [220, 300],
    noDisc: true,
    draw: (c) => <Door c={c} ajar />,
  },
  'fourth-sunday-after-pentecost': {
    label: 'A field of wheat ready for harvest, and a sickle',
    sun: [318, 180],
    draw: (c) => (
      <>
        {[60, 100, 140, 180, 220, 260, 300, 340, 380].map((x, i) => (
          <Wheat key={x} x={x} y={500} h={170 + ((i * 37) % 60)} lean={(i % 3) * 8 - 8} c={c} o={i % 2 ? 0.6 : 1} />
        ))}
        <path d="M120 230C140 170 210 150 250 190C220 176 170 180 140 232Z" fill={W} />
        <path d="M140 232L120 270" {...wl(c, 6)} />
      </>
    ),
  },
  'fifth-sunday-after-pentecost': {
    label: 'A basket with five loaves and two fish',
    sun: [220, 200],
    draw: (c) => (
      <>
        <Loaf x={180} y={430} s={0.8} c={c} />
        <Loaf x={250} y={430} s={0.8} c={c} />
        <Loaf x={136} y={452} s={0.8} c={c} />
        <Loaf x={214} y={452} s={0.9} c={c} />
        <Loaf x={296} y={452} s={0.8} c={c} />
        <Fish x={170} y={360} s={1.2} fill={W} />
        <Fish x={270} y={340} s={1.2} fill={W} flip />
        <Basket x={220} y={500} w={240} c={c} />
      </>
    ),
  },
  'sixth-sunday-after-pentecost': {
    label: 'Seven baskets full of leftover bread',
    sun: [220, 180],
    draw: (c) => (
      <>
        {[120, 220, 320].map((x) => (
          <g key={x} opacity="0.6">
            <Loaf x={x} y={392} s={0.6} c={c} />
            <Basket x={x} y={430} w={90} c={c} />
          </g>
        ))}
        {[70, 170, 270, 370].map((x) => (
          <g key={x}>
            <Loaf x={x} y={452} s={0.6} c={c} />
            <Basket x={x} y={500} w={90} c={c} />
          </g>
        ))}
      </>
    ),
  },
  'seventh-sunday-after-pentecost': {
    label: 'A house split down the middle by a crack',
    sun: [220, 170],
    draw: (c) => (
      <>
        <g transform="rotate(-4 120 500)">
          <path d="M100 500V320L210 240L222 280L206 330L224 380L208 430L220 500Z" fill="currentColor" />
          <rect x="130" y="350" width="34" height="40" fill="#000" opacity="0.35" />
        </g>
        <g transform="rotate(4 320 500)">
          <path d="M340 500V320L230 240L242 280L226 330L244 380L228 430L240 500Z" fill="currentColor" opacity="0.7" />
          <rect x="276" y="350" width="34" height="40" fill="#000" opacity="0.35" />
        </g>
      </>
    ),
  },
  'eighth-sunday-after-pentecost': {
    label: 'A chalice and a loaf of bread',
    sun: [220, 200],
    draw: (c) => (
      <>
        <path d="M160 250H280C280 320 256 352 220 354C184 352 160 320 160 250Z" fill="currentColor" />
        <ellipse cx="220" cy="252" rx="56" ry="8" fill={V} />
        <path d="M212 354H228V440H212Z" fill="currentColor" />
        <circle cx="220" cy="396" r="12" fill="currentColor" />
        <path d="M170 474C170 450 196 438 220 438C244 438 270 450 270 474Z" fill="currentColor" />
        <rect x="160" y="474" width="120" height="10" rx="4" fill="currentColor" />
        <Loaf x={340} y={490} s={0.8} c={c} />
        <path d="M200 296H240M220 278V320" {...wl(c, 3, 0.75)} />
      </>
    ),
  },
  'ninth-sunday-after-pentecost': {
    label: 'A wedding table with one guest in the lowest seat, being called up higher',
    sun: [220, 180],
    draw: (c) => (
      <>
        <rect x="90" y="360" width="290" height="16" fill="currentColor" />
        <path d="M110 376V500M360 376V500" {...ln(c, 5)} />
        {[150, 210, 270, 330].map((x) => (
          <Figure key={x} x={x} y={360} s={0.38} o={0.6} />
        ))}
        <Figure x={60} y={500} s={0.5} fill={W} />
        <path d="M80 300C100 260 130 250 160 260" {...wl(c, 2.5, 0.8)} />
        <path d="M152 250L162 261L148 268" {...wl(c, 2.5, 0.8)} />
      </>
    ),
  },
  'tenth-sunday-after-pentecost': {
    label: 'A small child standing in the middle of a circle of grown-ups',
    sun: [220, 220],
    draw: (c) => (
      <>
        <Figure x={90} s={0.85} o={0.4} />
        <Figure x={350} s={0.85} o={0.4} />
        <Figure x={150} y={470} s={0.75} o={0.6} />
        <Figure x={290} y={470} s={0.75} o={0.6} />
        <Figure x={220} s={0.5} fill={W} />
      </>
    ),
  },
  'eleventh-sunday-after-pentecost': {
    label: 'Two walking staffs and a flask of oil for the sick',
    sun: [300, 180],
    draw: (c) => (
      <>
        <path d="M130 500L190 220M190 500L250 220" {...ln(c, 6)} />
        <path d="M190 220a10 10 0 0 0 -16 -4M250 220a10 10 0 0 0 -16 -4" {...ln(c, 6)} />
        <path d="M300 500C270 500 260 480 262 456C264 430 284 420 290 400V376H310V400C316 420 336 430 338 456C340 480 330 500 300 500Z" fill="currentColor" />
        <rect x="286" y="364" width="28" height="14" rx="3" fill={W} />
        <path d="M282 456C292 470 312 470 322 456" {...wl(c, 2, 0.6)} />
      </>
    ),
  },
  'first-sunday-after-transfiguration': {
    label: 'A grapevine in a vineyard, heavy with fruit',
    sun: [300, 200],
    draw: (c) => (
      <>
        <path d="M80 500C90 420 140 380 200 360C260 340 300 300 300 240C300 210 320 196 340 200" {...ln(c, 6)} />
        <path d="M200 360C186 330 196 300 220 290" {...ln(c, 2)} />
        <FigLeaf x={260} y={330} s={1} r={30} />
        <FigLeaf x={140} y={400} s={0.9} r={-30} o={0.7} />
        <FigLeaf x={320} y={240} s={0.8} r={60} o={0.8} />
        <g fill={W}>
          {[
            [200, 380],
            [216, 380],
            [192, 394],
            [208, 394],
            [224, 394],
            [200, 408],
            [216, 408],
            [208, 422],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={8} />
          ))}
        </g>
      </>
    ),
  },
  shunoyo: {
    label: 'A crown of twelve stars around a disc of light, with a crescent moon beneath',
    sun: [220, 250],
    draw: (c) => (
      <>
        <g fill={W}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <path key={i} d={star(220 + 130 * Math.cos(a), 250 + 130 * Math.sin(a), 9, 3.5, 5)} />;
          })}
        </g>
        <path d="M130 430C170 470 270 470 310 430C270 450 170 450 130 430Z" fill="currentColor" />
      </>
    ),
  },
  'first-sunday-after-shunoyo': {
    label: 'A good tree bearing fruit, with a log lying at its foot',
    sun: [318, 180],
    draw: (c) => (
      <>
        <circle cx="250" cy="250" r="104" fill="currentColor" opacity="0.4" />
        <circle cx="250" cy="250" r="104" {...ln(c, 2)} />
        <path d="M250 500V354" {...ln(c, 14)} />
        <g fill={W}>
          {[
            [210, 210],
            [280, 190],
            [240, 280],
            [300, 270],
            [190, 290],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r={10} />
          ))}
        </g>
        <rect x="40" y="478" width="160" height="22" rx="11" fill="currentColor" />
        <circle cx="52" cy="489" r="7" {...ln(c, 1.5, 0.5, '#000')} />
        <circle cx="330" cy="490" r="10" fill={W} />
      </>
    ),
  },
  'second-sunday-after-shunoyo': {
    label: 'A closed door with a ring knocker, and a key',
    sun: [220, 200],
    draw: (c) => (
      <>
        <Door c={c} />
        <circle cx="220" cy="380" r="16" {...wl(c, 4)} />
        <circle cx="220" cy="362" r="4" fill={W} />
        <circle cx="340" cy="440" r="16" {...ln(c, 5)} />
        <path d="M340 456V500M340 480H356M340 492H352" {...ln(c, 5)} />
      </>
    ),
  },
  'third-sunday-after-shunoyo': {
    label: 'A fish caught on a line, with a silver coin in its mouth',
    sun: [300, 160],
    draw: (c) => (
      <>
        <path d="M128 40V324a12 12 0 0 0 12 6" {...wl(c, 1.5, 0.8)} />
        <Fish x={210} y={340} s={2.4} />
        <circle cx="140" cy="344" r="14" fill={W} />
        <circle cx="140" cy="344" r="8" {...ln(c, 1.5)} />
        <Waves c={c} ys={[430, 460, 488]} />
      </>
    ),
  },
  'fourth-sunday-after-shunoyo': {
    label: 'The sun shining and rain falling on every field alike',
    sun: [130, 170],
    noDisc: true,
    draw: (c) => (
      <>
        <circle cx="130" cy="170" r="48" fill="currentColor" />
        <g {...ln(c, 2.5, 0.7)}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <path key={i} d={`M${130 + 60 * Math.cos(a)} ${170 + 60 * Math.sin(a)}L${130 + 84 * Math.cos(a)} ${170 + 84 * Math.sin(a)}`} />;
          })}
        </g>
        <path d="M250 260a30 30 0 0 1 40 -36a40 40 0 0 1 74 10a28 28 0 0 1 6 54H260a26 26 0 0 1 -10 -28Z" fill={W} />
        <g {...wl(c, 2, 0.7)}>
          {[270, 300, 330, 360].map((x) => (
            <path key={x} d={`M${x} 310l-8 22M${x - 10} 350l-8 22`} />
          ))}
        </g>
        <path d="M0 440C80 420 160 440 220 440S360 420 440 440V500H0Z" fill="currentColor" opacity="0.35" />
        <path d="M60 470H180M260 470H380" {...ln(c, 2, 0.6)} />
      </>
    ),
  },
  'first-sunday-after-holy-cross': {
    label: 'A fig branch putting out new leaves under the night sky: stay awake',
    sun: [320, 180],
    noDisc: true,
    draw: (c) => (
      <>
        <path d="M320 120a56 56 0 1 0 46 88a46 46 0 1 1 -46 -88Z" fill="currentColor" />
        <path d="M40 500C100 440 160 400 240 380" {...ln(c, 6)} />
        <FigLeaf x={240} y={380} s={1.1} r={70} />
        <FigLeaf x={160} y={420} s={0.8} r={20} o={0.8} />
        <FigLeaf x={110} y={456} s={0.6} r={-20} o={0.6} />
        <circle cx="300" cy="372" r="6" fill={W} />
      </>
    ),
  },
  'second-sunday-after-holy-cross': {
    label: 'A boat on the lake with only one loaf of bread aboard',
    sun: [300, 200],
    draw: (c) => (
      <>
        <path d="M70 420H370L330 470H110Z" fill="currentColor" />
        <Loaf x={220} y={420} s={0.8} c={c} />
        <path d="M120 420C120 400 130 390 150 390" {...ln(c, 2, 0.5)} />
        <Waves c={c} ys={[470, 494]} />
      </>
    ),
  },
  'third-sunday-after-holy-cross': {
    label: 'A path through standing grain on the Sabbath',
    sun: [220, 180],
    draw: (c) => (
      <>
        <path d="M190 500L214 300H226L250 500Z" fill={W} opacity="0.12" />
        {[50, 90, 130, 170].map((x, i) => (
          <Wheat key={x} x={x} y={500} h={160 + i * 14} lean={10} c={c} o={i % 2 ? 0.6 : 1} />
        ))}
        {[270, 310, 350, 390].map((x, i) => (
          <Wheat key={x} x={x} y={500} h={202 - i * 14} lean={-10} c={c} o={i % 2 ? 1 : 0.6} />
        ))}
      </>
    ),
  },
  'fourth-sunday-after-holy-cross': {
    label: 'A balance scale with a few coins on one side',
    sun: [220, 180],
    draw: (c) => (
      <>
        <path d="M220 160V480M180 480H260M100 230H340" {...ln(c, 5)} />
        <circle cx="220" cy="160" r="9" fill="currentColor" />
        <path d="M100 230L70 330M100 230L130 330M340 230L310 330M340 230L370 330" {...ln(c, 1.5)} />
        <path d="M60 330H140a40 40 0 0 1 -80 0Z" fill="currentColor" />
        <path d="M300 330H380a40 40 0 0 1 -80 0Z" fill="currentColor" />
        <g fill={W}>
          <ellipse cx="88" cy="324" rx="12" ry="4" />
          <ellipse cx="108" cy="318" rx="12" ry="4" />
          <ellipse cx="98" cy="312" rx="12" ry="4" />
        </g>
      </>
    ),
  },
  'fifth-sunday-after-holy-cross': {
    label: 'A jug pouring water into a basin, with a towel: the greatest serves',
    sun: [318, 200],
    draw: (c) => (
      <>
        <path d="M110 440H330C326 480 290 500 220 500C150 500 114 480 110 440Z" fill="currentColor" />
        <ellipse cx="220" cy="440" rx="110" ry="12" fill="currentColor" />
        <ellipse cx="220" cy="440" rx="94" ry="8" fill={W} opacity="0.5" />
        <g transform="rotate(-35 324 290)">
          <path d="M304 250V232H344V250C368 266 374 300 362 322C352 338 338 342 324 342C310 342 296 338 286 322C274 300 280 266 304 250Z" fill="currentColor" />
          <path d="M304 236L284 226" {...ln(c, 7)} />
          <path d="M362 270C384 270 388 300 364 312" {...ln(c, 5)} />
        </g>
        <path d="M236 282C230 330 226 380 224 432" {...wl(c, 4, 0.8)} />
        <path d="M80 340H140V430C120 420 100 430 80 420Z" fill={W} opacity="0.85" />
      </>
    ),
  },
  'sixth-sunday-after-holy-cross': {
    label: 'A camel beside a large needle, with its eye',
    sun: [300, 170],
    draw: (c) => (
      <>
        <path d="M330 80L250 470" {...wl(c, 8)} />
        <ellipse cx="324" cy="110" rx="5" ry="18" transform="rotate(11 324 110)" fill="#000" opacity="0.6" />
        <path
          d="M60 500L64 420C54 410 50 380 60 360C70 336 100 330 112 352C122 330 152 328 166 352C176 370 180 380 184 380L196 320C198 306 212 302 222 310L232 318L222 326L214 322L206 400C204 412 196 418 188 418L184 500H174L172 430H150L144 500H134L132 430H86L80 500Z"
          fill="currentColor"
        />
      </>
    ),
  },
};

/** Alt text for a Sunday's hero illustration. */
export const sundayArtLabel = (slug: string) => motifs[slug]?.label ?? 'An altar of incense with smoke rising, and a disc of light to its right';

/** Sundays whose own picture is the altar of incense itself. */
const ALTAR = new Set(['annunciation-to-zechariah']);

/** Whether a slug has its own illustration (anything else falls back to the altar). */
export const hasSundayArt = (slug: string) => slug in motifs || ALTAR.has(slug);
export const sundayArtSlugs = () => Object.keys(motifs);

export function SundayArt({ e, detail = 'full', label }: { e: { sunday_slug: string }; detail?: Detail; label?: string }) {
  const m = motifs[e.sunday_slug];
  const alt = label ?? sundayArtLabel(e.sunday_slug);
  if (!m) return <AltarArt detail={detail} label={alt} />;
  const small = detail === 'small';
  const c: Ctx = { k: small ? 2.2 : 1, small };
  const [cx, cy] = m.sun ?? [318, 200];
  return (
    <svg viewBox="0 0 440 580" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} preserveAspectRatio="xMidYMid slice">
      {!small && <circle cx={cx} cy={cy} r="280" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />}
      <circle cx={cx} cy={cy} r="230" fill="none" stroke="currentColor" strokeWidth={small ? 2 : 1} opacity="0.16" />
      {!small && <circle cx={cx} cy={cy} r="184" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.22" />}
      <circle cx={cx} cy={cy} r={small ? 150 : 132} fill="none" stroke="currentColor" strokeWidth={small ? 2 : 1.5} opacity="0.28" />
      {!m.noDisc && <circle cx={cx} cy={cy} r={small ? 90 : 84} fill="currentColor" opacity="0.09" />}
      {!small && (
        <g fill={W}>
          <circle cx="60" cy="120" r="2" opacity="0.6" />
          <circle cx="400" cy="70" r="1.5" opacity="0.5" />
          <circle cx="36" cy="300" r="1.5" opacity="0.4" />
        </g>
      )}
      <rect x="0" y="500" width="440" height="80" fill="#000000" opacity="0.3" />
      {m.draw(c)}
    </svg>
  );
}
