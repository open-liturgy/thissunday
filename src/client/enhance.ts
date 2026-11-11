/**
 * The only JavaScript on the site. Every feature here is an enhancement: the
 * page is complete without it. Keep it small (budget: 15 KB for all JS).
 */
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/**
 * Centre an item inside its own horizontal scroller (chip rows, the phone
 * scene strip) without touching the page scroll. scrollIntoView also moves the
 * page, which cancels a tap-to-section scroll halfway and fights momentum
 * scrolling on phones.
 */
function reveal(el: Element, row: Element | null) {
  if (!row || row.scrollWidth <= row.clientWidth) return;
  const r = el.getBoundingClientRect();
  const u = row.getBoundingClientRect();
  row.scrollTo({ left: row.scrollLeft + r.left - u.left - (u.width - r.width) / 2, behavior: 'smooth' });
}

/** Roving-focus tabs over existing markup. */
function tabs(tabsEls: HTMLElement[], panels: HTMLElement[], onSelect?: (i: number) => void) {
  const select = (i: number, focus = false, user = true) => {
    tabsEls.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) tabsEls[i].focus();
    if (user) onSelect?.(i);
  };
  tabsEls.forEach((t, i) => {
    t.addEventListener('click', (ev) => {
      ev.preventDefault();
      select(i);
    });
    t.addEventListener('keydown', (ev) => {
      const k = (ev as KeyboardEvent).key;
      const n = tabsEls.length;
      const to = k === 'ArrowRight' || k === 'ArrowDown' ? (i + 1) % n : k === 'ArrowLeft' || k === 'ArrowUp' ? (i - 1 + n) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
      if (to >= 0) {
        ev.preventDefault();
        select(to, true);
      }
    });
  });
  return select;
}

// Services: markup already has role=tab/tabpanel.
const tabWrap = $('[data-tabs]');
if (tabWrap) tabs($$('[role=tab]', tabWrap), $$('[role=tabpanel]', tabWrap));

// Scenes: links to #scene-n become tabs.
const sceneWrap = $('[data-scenes]');
if (sceneWrap) {
  const picks = $$('.pick', sceneWrap);
  const scenes = $$('.scene', sceneWrap);
  const list = $('.picker', sceneWrap)!;
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-orientation', 'vertical');
  picks.forEach((p, i) => {
    p.setAttribute('role', 'tab');
    p.removeAttribute('aria-current');
    p.id = `pick-${i + 1}`;
    p.setAttribute('aria-controls', scenes[i].id);
    scenes[i].setAttribute('role', 'tabpanel');
    scenes[i].setAttribute('aria-labelledby', p.id);
  });
  const select = tabs(picks, scenes, (i) => {
    history.replaceState(null, '', `#${scenes[i].id}`);
    reveal(picks[i], list);
  });
  const fromHash = () => {
    const m = /^#scene-(\d+)$/.exec(location.hash);
    if (m && scenes[+m[1] - 1]) {
      select(+m[1] - 1, false, false);
      reveal(picks[+m[1] - 1], list);
    }
  };
  fromHash();
  if (!/^#scene-/.test(location.hash)) select(0, false, false);
  addEventListener('hashchange', fromHash);
}

// Audio: custom controls over the native element.
const card = $('[data-audio]');
const audio = card ? $<HTMLAudioElement>('audio', card) : null;
if (card && audio) {
  audio.controls = false;
  const mini = $('[data-mini]');
  const toggles = $$<HTMLButtonElement>('[data-toggle]');
  const fills = $$('[data-fill]');
  const curs = $$('[data-cur]');
  const seek = $<HTMLInputElement>('[data-seek]', card);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const paint = () => {
    const d = audio.duration || 0;
    const r = d ? audio.currentTime / d : 0;
    fills.forEach((f) => (f.style.width = `${r * 100}%`));
    curs.forEach((c) => (c.textContent = fmt(audio.currentTime)));
    if (seek && document.activeElement !== seek) seek.value = String(Math.round(r * 1000));
  };
  const state = () => {
    const playing = !audio.paused;
    toggles.forEach((b) => {
      b.setAttribute('aria-label', (playing ? b.dataset.labelPause : b.dataset.labelPlay) || '');
      b.innerHTML = playing
        ? '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 2.5v13l11-6.5z" fill="currentColor"/></svg>';
    });
    if (mini && (playing || audio.currentTime > 0)) {
      mini.hidden = false;
      document.body.classList.add('has-mini');
    }
  };
  const toggle = () => (audio.paused ? audio.play() : audio.pause());
  toggles.forEach((b) => b.addEventListener('click', toggle));
  $$('[data-play]').forEach((a) =>
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      audio.play();
    }),
  );
  seek?.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (+seek.value / 1000) * audio.duration;
  });
  audio.addEventListener('timeupdate', paint);
  audio.addEventListener('play', state);
  audio.addEventListener('pause', state);
  audio.addEventListener('ended', state);
}

// Sticky chips: highlight the section in view.
const spies = $$<HTMLAnchorElement>('[data-spy]');
if (spies.length && 'IntersectionObserver' in window) {
  const byId = new Map(spies.map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        spies.forEach((a) => a.removeAttribute('aria-current'));
        const a = byId.get(en.target.id);
        if (a) {
          a.setAttribute('aria-current', 'true');
          reveal(a, a.closest('ul'));
        }
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  byId.forEach((_, id) => {
    const s = document.getElementById(id);
    if (s) io.observe(s);
  });
}

// Share and copy.
const toast = $('[data-toast]');
const say = (msg: string) => {
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 2400);
};
const shareA = $<HTMLAnchorElement>('[data-share]');
if (shareA && navigator.share) {
  shareA.addEventListener('click', async (ev) => {
    ev.preventDefault();
    const { title = '', text = '', url = location.href, card } = shareA.dataset;
    const data: ShareData = { title, text: `${text}\n`, url };
    try {
      if (card && navigator.canShare) {
        const blob = await (await fetch(card)).blob();
        const file = new File([blob], card.split('/').pop() || 'this-sunday.jpg', { type: blob.type });
        if (navigator.canShare({ files: [file] })) data.files = [file];
      }
      await navigator.share(data);
    } catch {
      /* cancelled */
    }
  });
}
$$<HTMLButtonElement>('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy || location.href);
      say(b.dataset.done || 'Copied');
    } catch {
      prompt('Copy this link', b.dataset.copy || location.href);
    }
  }),
);
