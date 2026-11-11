# Contributing to This Sunday

This Sunday is one page for each Sunday of the Malankara Orthodox Church year: the readings, a short explanation of the Gospel, a reflection and one question for the family. It is a static website built from YAML files, and anyone can help: fix a reading note, translate a Sunday, review a draft, or improve the site.

Spotted a mistake on a page? The quickest way to help is to [report a correction](https://github.com/open-liturgy/thissunday/issues/new?template=content-correction.yml). Every Sunday page also has a "Suggest a correction for this Sunday" link that fills in the title for you.

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ground rules for content

These protect the people who read the site on a Saturday evening before Qurbana.

- **Never invent readings or liturgical text.** Readings, dates, feast names, prayers and quotations must come from a real source. If you do not know a value, leave a placeholder.
- **Placeholders are bracketed capitals**, such as `[REVIEWER NAME]` or `[TITLE ML]`. The build warns for each one and hides blocks whose key fields are still placeholders, so it is always safe to leave one.
- **Bible text must be public domain.** Use the 1910 Sathyavedapusthakam for Malayalam and the World English Bible for English. Do not paste text from copyrighted translations.
- **Readings follow the official lectionary** of the Malankara Orthodox Syrian Church, and `sources.lectionary` links to it.
- **`reviewed: false` stays false** until a priest or editor has checked the Sunday. Only the reviewer changes it to `true` and fills in `reflection.reviewer`.

## Run the site locally

You need Node 20 or newer.

```sh
npm install
npm run dev          # live dev server at http://localhost:5173; edits to YAML show on reload
npm run check        # validate all content and list placeholders
npm run build        # typecheck and full static build into dist/ (social images need Chrome or Chromium)
npm run build:fast   # same, without social images
npm run preview      # serve dist/ at http://localhost:4173
npm run preview:all  # build with placeholder blocks shown, then serve, for reviewing drafts
```

## Add or fix a Sunday

Each Sunday is built from two YAML files:

- `content/lectionary/{sunday_slug}.yaml` holds what repeats every year: the name, readings and notes, scenes, people, phrases and key verse.
- `content/sundays/{YYYY-MM-DD}.yaml` holds this year's edition: the date, week, standfirst, one-minute cards, reflection and the question for the week. Anything it repeats from the lectionary file overrides it.

To fix a typo or a note, edit the file and open a pull request. To add a Sunday, follow "Add a Sunday" in the [README](README.md). Every field is described in [docs/CONTENT.md](docs/CONTENT.md). Run `npm run check` before you push.

## Translations

Malayalam text lives in the same edition file under `translations.ml`. It has the same shape as the edition and only needs the fields you translate; anything missing falls back to English. When it is present, the build makes a Malayalam page at `/ml/{year}/{sunday_slug}/` and links the two versions to each other.

Translate meaning, not word for word, and keep Bible quotations to the 1910 Sathyavedapusthakam. Mark a translation as a draft in the pull request until a Malayalam reader has checked it.

## How review works

1. Open a pull request. Use the **content** label for changes under `content/`, and fill in the template: what changed, which Sundays, and your sources.
2. A priest or editor reads the change. For a new or reworked Sunday, they set `reviewed: true` and add their name as `reflection.reviewer` in the same pull request.
3. CI must pass: the content check, the typecheck, the build and Lighthouse.
4. A maintainer merges. Every edition is published as soon as it is merged.

## Code changes

The site is Vite and React rendered to static HTML at build time, with one small script for tabs, audio and sharing. See "How it works" in the [README](README.md).

Before you open a pull request:

```sh
npx tsc --noEmit
npm run build:fast
npm run lhci         # Lighthouse with the budgets in lighthouserc.json
```

CI fails below SEO 100, Accessibility 100 or Performance 95, or over the budgets for largest contentful paint, layout shift, JavaScript size and page weight. Keep pages working with JavaScript turned off.

## Licences

By contributing, you agree that your contribution is released under the project's licences:

- **Code** (everything outside `content/`): [MIT](LICENSE).
- **Content** (everything under `content/`): [CC BY-SA 4.0](LICENSE-CONTENT.md).

Bible text quoted on the site is public domain and stays that way.
