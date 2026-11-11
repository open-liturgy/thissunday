/** `npm run check`: validate every edition and list placeholders, without building. */
import { loadTradition } from '../src/lib/tradition';
import { loadSite } from '../src/lib/content';

const site = loadSite(await loadTradition());
for (const w of site.warnings) console.warn(`warn  ${w}`);
for (const e of site.errors) console.error(`error ${e}`);
console.log(`${site.all.length} valid edition(s), ${site.errors.length} error(s), ${site.warnings.length} warning(s)`);
process.exit(site.errors.length ? 1 : 0);
