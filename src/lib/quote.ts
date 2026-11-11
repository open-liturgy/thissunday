const DOUBLE = '"“”';
const SINGLE = "'‘’";
/** Curly double quotes open and close in order, and straight ones come in pairs. */
function balanced(s: string): boolean {
  let depth = 0;
  for (const ch of s) {
    if (ch === '“') depth++;
    else if (ch === '”' && --depth < 0) return false;
  }
  return depth === 0 && (s.split('"').length - 1) % 2 === 0;
}

/**
 * Wrap text in curly double quotes exactly once, whatever the content already has.
 * Strips outer quote pairs the content brought with it ("…", “…”, ‘…’), but only
 * when that leaves the inner quotes balanced, so “A” and “B” is not cut apart.
 * Text that still quotes part of itself (Probably “the separated ones”) is left
 * unwrapped rather than doubled.
 */
export function quoted(s: string): string {
  let t = s.trim();
  for (;;) {
    const a = t[0];
    const z = t.at(-1);
    if (t.length < 2 || !a || !z) break;
    const pair = (DOUBLE.includes(a) && DOUBLE.includes(z)) || (SINGLE.includes(a) && SINGLE.includes(z) && a !== '’');
    if (!pair) break;
    const inner = t.slice(1, -1);
    if (!balanced(inner)) break;
    t = inner.trim();
  }
  if (/[“”"]/.test(t)) return t;
  return `“${t}”`;
}
