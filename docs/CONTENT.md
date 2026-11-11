# Content schema

The Zod schema in `src/lib/schema.ts` is the source of truth. This page explains it.

An edition is built from two files that are deep-merged:

| File | Holds | Required |
| --- | --- | --- |
| `content/lectionary/{sunday_slug}.yaml` | Text that repeats every year: name, readings and notes, scenes, people, phrases, key verse | No |
| `content/sundays/{YYYY-MM-DD}.yaml` | This year's edition: date, week, standfirst, one-minute cards, reflection, week, audio, sermon | Yes |

Objects merge key by key and the edition wins. Lists (readings, scenes, people…) are replaced whole, never merged item by item. A complete edition file with no lectionary file is also valid.

## Rules

- Never invent readings, dates or liturgical text. Unknown values are bracketed placeholders in capitals, such as `[REVIEWER NAME]`. The build prints a warning for each one and hides blocks whose key fields are placeholders (audio, sermon, author byline, repository and licence lines).
- `reviewed: true` only after a priest or editor has checked the edition. Until then "Reviewed by" is hidden on the page and in JSON-LD.
- Readings come from the official lectionary; `sources.lectionary` must link to it.
- Bible text must be public domain or licensed. Translations are named in the tradition config (`bible.ml`, `bible.en`) and printed under the verse.

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `date` | `YYYY-MM-DD` | Must be a Sunday. File name must match. |
| `sunday_slug` | `kebab-case` | Stable across years. Permanent URL is `/{year}/{sunday_slug}/`. |
| `name.en`, `name.ml` | text | `name.en` is the `<h1>` and starts the `<title>`. |
| `tagline` | text, optional | One line for previous/next cards. |
| `week_of_year` | integer | "Week 3 of the Church year". |
| `season.en`, `.gloss`, `.syr` | text | `syr` is shown with `lang="syr"`. |
| `season.colors.ground`, `.glow` | `#RRGGBB`, optional | Overrides the season palette. Keep 4.5:1 contrast. |
| `also_kept_as`, `also_kept_as_note` | text, optional | e.g. "Parents’ Day", "See Ephesians 6:1–4". |
| `description` | text, < 155 chars | Meta description. Must name the Gospel reference (warning if not). Generated if missing. |
| `standfirst` | text | Hero paragraph. |
| `hero_quote.text`, `.ref` | text, optional | Under the hero illustration. |
| `audio.src`, `.duration`, `.language`, `.transcript` | optional | `src` is a path like `/audio/2026-11-15.mp3` (put the file in `public/audio/`) or a full URL. `duration` is `m:ss`. Adds the player and `AudioObject`. |
| `one_minute.what_happens`, `.why_this_sunday`, `.take_with_you` | text | Section 01. |
| `readings.{service}[]` | list | Service keys come from the tradition config (`evening`, `morning`, `before_qurbana`, `holy_qurbana` for MOSC). |
| `readings.*[].kind`, `.kind_ml`, `.ref`, `.ml`, `.note`, `.main` | | Exactly one reading has `main: true` (the Gospel of the day). `kind_ml` defaults from the config. |
| `readings_thread` | text, optional | "The thread through all twelve". |
| `key_verse.ref`, `.ml`, `.en` | text | "The verse to keep" and the share card. |
| `scenes[]` | 1–8 items | `verses`, `title`, `text`, `easy_to_miss`. |
| `people[]` | list | `name`, `ml`, `role`, `name_meaning`. A name listed in `content/people.yaml` links to that character's page. |
| `phrases[]` | list | `term`, `explanation`. |
| `reflection.title_en`, `.title_ml`, `.read_time`, `.body`, `.author`, `.reviewer` | | `body` is a list of paragraphs or one string with blank lines between paragraphs. |
| `week.question`, `.question_note`, `.small_act`, `.prayer` | text | Section 05. |
| `sermon.title`, `.speaker`, `.parish`, `.length`, `.url` | optional | Hidden while title or url is a placeholder. |
| `sources.lectionary` | URL | Required. |
| `reviewed` | boolean | Default `false`. |
| `prepared`, `updated` | `YYYY-MM-DD`, optional | `datePublished` / `dateModified`. |
| `translations.ml` | partial edition, optional | Same shape, Malayalam text. When present, `/ml/{year}/{slug}/` is built with reciprocal `hreflang`. |

## Publishing

Every edition in the folder is published, past and future. The home page `/` shows the upcoming Sunday (in the tradition's time zone), with its canonical URL pointing at that Sunday's permanent page. To release week by week instead, build with `PUBLISH_UPCOMING_ONLY=1`: only editions up to and including the upcoming Sunday are published, and later ones show as "Coming soon" on the All Sundays page (`/all-sundays/`). `BUILD_DATE=YYYY-MM-DD` overrides "today" for testing.

Placeholder blocks stay hidden in a normal build. `PREVIEW_ALL=1` (or `npm run preview:all`) shows them, for local review only.

## Character pages

`content/people.yaml` lists the characters who get a page at `/people/{slug}/`, plus the index at `/people/`. Each entry has `slug`, `name`, optional `ml`, optional `kind` (`person`, `angel` or `group`) and `match`: the `people[].name` values that refer to this character. Write `"Peter"` to match that name on every Sunday, or `"koodhosh-eetho: Simon bar Jonah"` to match it on one Sunday only (use this when a name like John means different people). One entry such as `"Peter and Andrew"` can match several characters.

A character page shows only what the editions already say: the `role` written for each Sunday, and the distinct `name_meaning` values given under the character's own name. It lists published Sundays only: with `PUBLISH_UPCOMING_ONLY=1`, pages appear as their first Sunday comes round. The build warns when a `match` hits no edition. Names not listed stay plain text.

Optional `keywords` lists the words that find the character in a Sunday's scenes (shown under "In the story"); it defaults to the name and its matches. Optional `icon` credits a picture from Wikimedia Commons: `title`, optional `artist` and `date`, `license` (public domain, CC0, CC BY or CC BY-SA only), optional `license_url`, `source` (the Commons file page) and `alt` (what the icon shows). The files are `public/people/{slug}-480.webp` (480×600) and `{slug}-240.webp` (240×300), cropped 4:5 on the main figure; keep the 480 under about 70 KB. Without an icon the page shows the first letter in an arch.
