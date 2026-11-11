declare module 'subset-font' { export default function subsetFont(buf: Buffer, text: string, opts?: { targetFormat?: 'woff2' | 'woff' | 'sfnt'; variationAxes?: unknown }): Promise<Buffer>; }
