import { z } from 'zod';

/**
 * Schema for one edition AFTER merging content/lectionary/{sunday_slug}.yaml
 * (year-independent text) with content/sundays/{date}.yaml (the dated edition).
 * Documented field by field in docs/CONTENT.md. Keep the two in sync.
 */

const text = z.string().trim().min(1);
const isoDate = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'));
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const Reading = z.object({
  kind: text,
  /** Malayalam label for the kind. Defaults from the tradition config. */
  kind_ml: text.optional(),
  ref: text,
  ml: text.optional(),
  /** One line on what to listen for. */
  note: text.optional(),
  /** Marks the Gospel of the day. Exactly one reading should have it. */
  main: z.boolean().optional(),
});

export const Scene = z.object({
  verses: text,
  title: text,
  text: text,
  easy_to_miss: text,
});

export const Person = z.object({
  name: text,
  ml: text.optional(),
  role: text,
  name_meaning: text,
});

export const Phrase = z.object({ term: text, explanation: text });

const paragraphs = z
  .union([text, z.array(text).min(1)])
  .transform((v) => (Array.isArray(v) ? v : v.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)));

export const Edition = z
  .object({
    date: isoDate,
    sunday_slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase-words-with-hyphens'),
    name: z.object({ en: text, ml: text.optional() }),
    /** One short line used on previous/next cards and in the archive. */
    tagline: text.optional(),
    week_of_year: z.number().int().min(1).max(60),
    season: z.object({
      en: text,
      gloss: text.optional(),
      syr: text.optional(),
      colors: z.object({ ground: hex, glow: hex }).optional(),
    }),
    also_kept_as: text.optional(),
    also_kept_as_note: text.optional(),
    /** Meta description: under 155 characters and naming the Gospel reference. */
    description: text.optional(),
    standfirst: text,
    hero_quote: z.object({ text: text, ref: text }).optional(),
    audio: z
      .object({
        src: text,
        duration: text,
        language: z.string().default('ml'),
        transcript: paragraphs.optional(),
      })
      .optional(),
    one_minute: z.object({ what_happens: text, why_this_sunday: text, take_with_you: text }),
    readings: z.record(z.string(), z.array(Reading).min(1)),
    readings_thread: text.optional(),
    key_verse: z.object({ ref: text, ml: text.optional(), en: text }),
    scenes: z.array(Scene).min(1).max(8),
    people: z.array(Person).default([]),
    phrases: z.array(Phrase).default([]),
    reflection: z.object({
      title_en: text,
      title_ml: text.optional(),
      read_time: text.optional(),
      body: paragraphs,
      author: text,
      reviewer: text.optional(),
    }),
    week: z.object({
      question: text,
      question_note: text.optional(),
      small_act: text,
      prayer: text,
    }),
    sermon: z
      .object({ title: text, speaker: text, parish: text.optional(), length: text.optional(), url: text })
      .optional(),
    sources: z.object({ lectionary: z.string().url() }),
    /** Show "Reviewed by" (and JSON-LD reviewedBy) only when true. */
    reviewed: z.boolean().default(false),
    prepared: isoDate.optional(),
    updated: isoDate.optional(),
    /**
     * Second-language page content, as a partial edition in the same shape.
     * A /ml/ page is built only when this block exists.
     */
    translations: z.object({ ml: z.record(z.string(), z.unknown()).optional() }).optional(),
  })
  .superRefine((e, ctx) => {
    const day = new Date(`${e.date}T12:00:00Z`).getUTCDay();
    if (day !== 0) ctx.addIssue({ code: 'custom', path: ['date'], message: `${e.date} is not a Sunday` });
    const mains = Object.values(e.readings).flat().filter((r) => r.main);
    if (mains.length !== 1)
      ctx.addIssue({ code: 'custom', path: ['readings'], message: `mark exactly one reading as main: true (found ${mains.length})` });
    if (e.description && e.description.length > 155)
      ctx.addIssue({ code: 'custom', path: ['description'], message: `${e.description.length} characters; keep it under 155` });
  });

export type Edition = z.infer<typeof Edition>;
export type Reading = z.infer<typeof Reading>;
