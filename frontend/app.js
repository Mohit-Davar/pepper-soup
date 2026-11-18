/* Pepper-Soup documentation site: reader mode for everyone, review mode for the team. */

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = encodeURIComponent;
/** Plain text from a markdown snippet, for matching published text against the page. */
const mdText = (s) => String(s ?? '')
  .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\\([\\`*_{}[\]()#+\-.!|])/g, '$1')
  .replace(/[`*_~]/g, '');
const norm = (s) => mdText(s).toLowerCase().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();

const store = {
  get(kind, key) { try { return window[kind].getItem(key); } catch { return null; } },
  set(kind, key, value) { try { value == null ? window[kind].removeItem(key) : window[kind].setItem(key, value); } catch {} },
};

const KINDS = {
  'Contradiction': { key: 'contradiction', label: 'Contradiction', rank: 0 },
  'Unfixed problem': { key: 'unfixed', label: 'Needs fix', rank: 1 },
  'Missing source': { key: 'missing', label: 'Missing source', rank: 2 },
  'Wrong UI map entry': { key: 'uimap', label: 'UI map', rank: 3 },
};
const STATUS_LABEL = { open: 'Open', resolved: 'Resolved', ignored: "Won't fix" };
const SOURCE_LABEL = { gitbook: 'GitBook', confluence: 'Confluence' };
const SPACE_INTRO = {
  user: 'How to set up and use Pepper-Soup lending: loan products, origination, interest, repayments, collections, recovery and accounting.',
  developer: 'How the loan engine, APIs, batch jobs and data layer work, for engineers who build on and operate Pepper-Soup.',
};

const state = {
  data: null,
  source: 'gitbook',
  space: 'user',
  path: '',
  params: {},
  raw: '',
  hash: '',
  tokens: [],
  pages: [],
  nodeByPath: new Map(),
  parentOf: new Map(),
  view: 'doc',
  editing: false,
  mode: 'reader',
  review: null,
  evidence: new Map(),
  threads: [],
  active: null,
  popover: null,
  drawerOpen: false,
  drawerExpanded: new Set(),
  inline: null,
  changes: new Map(),
  showChanges: false,
  dash: { q: '', kind: 'all', status: 'open', space: 'all' },
};

const spaceKey = () => `${state.source}/${state.space}`;
const space = () => state.data.spaces[spaceKey()];
const filePath = (rel = state.path) => `${space().base}/${rel}`;
const pageRel = () => (state.path ? `${state.space}/${state.path}` : '');
const isWide = () => matchMedia('(min-width: 1200px)').matches;
const isReview = () => state.mode === 'review' && !!state.review;
let loadToken = 0;

// ---------------------------------------------------------------- api

async function api(url, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { status: res.status });
  return body;
}

const getPassword = () => store.get('sessionStorage', 'pw');
const getAuthor = () => store.get('localStorage', 'author') || '';

async function authed(url, options = {}) {
  try {
    return await api(url, {
      ...options,
      headers: { ...(options.headers || {}), 'X-Password': getPassword() || '', 'X-Author': enc(getAuthor()) },
    });
  } catch (error) {
    if (error.status === 401) {
      store.set('sessionStorage', 'pw', null);
      setMode('reader');
      toast('Your review session ended. Sign in again.');
    }
    throw error;
  }
}

// ---------------------------------------------------------------- markdown & enhancements

const PURIFY = {
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|confluence-link):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};
marked.setOptions({ gfm: true });

const CALLOUT_ICONS = {
  note: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
  tip: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z"/></svg>',
  warning: '<svg viewBox="0 0 24 24"><path d="M10.3 3.9 1.8 18.5A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.5L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
};

/**
 * Renders markdown. With `blocks`, every top-level block becomes its own
 * `.tok` element that remembers its token index, so review mode can pin
 * review items to it and edit it in place.
 */
function renderMarkdown(md, target, { blocks = false, readerEnhance = false } = {}) {
  const body = md.replace(/^﻿/, '');
  target.innerHTML = '';
  if (!blocks) {
    target.innerHTML = DOMPurify.sanitize(marked.parse(body.replace(/<!--[\s\S]*?-->/g, '')), PURIFY);
    enhance(target, { readerEnhance });
    return [];
  }
  const tokens = marked.lexer(body);
  tokens.forEach((token, index) => {
    if (token.type === 'space' || (token.type === 'html' && /^\s*<!--/.test(token.raw))) return;
    const list = [token];
    list.links = tokens.links;
    const html = DOMPurify.sanitize(marked.parser(list), PURIFY);
    if (!html.trim()) return;
    const el = document.createElement('div');
    el.className = 'tok';
    el.dataset.tok = index;
    el.innerHTML = html;
    target.append(el);
  });
  enhance(target, { readerEnhance });
  return tokens;
}

/** Image paths in the markdown are relative to the .md file; point them at the static /docs route. */
function fixImages(root) {
  let dir;
  try { dir = `/${filePath().split('/').slice(0, -1).join('/')}/`; } catch { return; }
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || /^(?:[a-z]+:|\/\/|\/|data:)/i.test(src)) return;
    img.setAttribute('src', new URL(src, location.origin + dir).pathname);
    img.loading = 'lazy';
  });
}

function enhance(target, { readerEnhance = false } = {}) {
  fixImages(target);
  // 1. Code blocks & Mermaid diagram cards
  target.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    if (code.classList.contains('language-mermaid')) {
      const source = code.textContent.trim();
      const card = document.createElement('div');
      card.className = 'diagram-card';
      card.dataset.source = source;

      const actions = document.createElement('div');
      actions.className = 'diagram-actions';
      actions.setAttribute('role', 'toolbar');
      actions.setAttribute('aria-label', 'Diagram tools');
      actions.innerHTML = `
        <button type="button" class="diagram-act-btn" data-diagram-act="toggle-view" aria-pressed="false" aria-label="View as Mermaid diagram" title="View as Mermaid diagram" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="7" height="5" rx="1.5"/><rect x="14" y="15" width="7" height="5" rx="1.5"/><path d="M10 6.5h4.5a2 2 0 0 1 2 2V15"/></svg>
          <span>Diagram</span>
        </button>
        <button type="button" class="diagram-act-btn" data-diagram-act="expand" aria-label="Expand diagram" title="Expand diagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          <span>Expand</span>
        </button>
        <button type="button" class="diagram-act-btn" data-diagram-act="copy" aria-label="Copy Mermaid source" title="Copy Mermaid source">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy</span>
        </button>
        <button type="button" class="diagram-act-btn" data-diagram-act="download" aria-label="Download SVG" title="Download SVG">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span>SVG</span>
        </button>`;

      const box = document.createElement('div');
      box.className = 'diagram mermaid';
      box.dataset.source = source;
      box.textContent = source;

      card.append(actions, box);
      pre.replaceWith(card);
      return;
    }

    const langMatch = code.className.match(/language-([A-Za-z0-9_+#.-]+)/);
    const lang = langMatch ? langMatch[1] : '';
    try { hljs.highlightElement(code); } catch {}

    const wrap = document.createElement('div');
    wrap.className = 'code';
    if (lang) wrap.dataset.lang = lang;

    const head = document.createElement('div');
    head.className = 'code-head';
    if (lang) {
      const label = document.createElement('span');
      label.className = 'code-lang';
      label.textContent = lang;
      head.append(label);
    }

    const copy = document.createElement('button');
    copy.className = 'copy';
    copy.type = 'button';
    copy.textContent = 'Copy';
    copy.onclick = () => navigator.clipboard.writeText(code.textContent).then(() => {
      copy.textContent = 'Copied';
      setTimeout(() => (copy.textContent = 'Copy'), 1500);
    });
    head.append(copy);

    pre.replaceWith(wrap);
    wrap.append(head, pre);
  });

  // 2. Tables with horizontal scroll container
  target.querySelectorAll('table').forEach((table) => {
    const wrap = document.createElement('div');
    wrap.className = 'table';
    table.replaceWith(wrap);
    wrap.append(table);
  });

  // 3. Zoomable content images
  target.querySelectorAll('img').forEach((img) => {
    img.classList.add('zoomable');
  });

  // 4. Callouts (preserve <blockquote> tag for review evidence matching)
  target.querySelectorAll('blockquote').forEach((bq) => {
    if (bq.classList.contains('callout')) return;
    const text = bq.textContent.trim();
    const match = text.match(/^(Note|Tip|Warning|Caution|Important)\s*:/i);
    if (!match) return;
    const rawKind = match[1].toLowerCase();
    const kind = rawKind === 'warning' || rawKind === 'caution' ? 'warning' : rawKind === 'tip' || rawKind === 'important' ? 'tip' : 'note';
    bq.classList.add('callout', `callout-${kind}`);
    const body = document.createElement('div');
    body.className = 'callout-body';
    while (bq.firstChild) body.append(bq.firstChild);
    const icon = document.createElement('span');
    icon.className = 'callout-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = CALLOUT_ICONS[kind];
    bq.append(icon, body);
  });

  // 5. Heading IDs & hover-reveal anchor copy buttons
  const used = {};
  target.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
    const titleText = h.textContent.trim();
    h.dataset.headingTitle = titleText;
    let id = titleText.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-') || 'section';
    if (used[id]) id += `-${used[id]++}`; else used[id] = 1;
    h.id = id;
    if (h.tagName !== 'H1' && !h.querySelector('.heading-anchor')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'heading-anchor';
      btn.dataset.anchor = id;
      btn.setAttribute('aria-label', `Copy link to ${titleText}`);
      btn.title = 'Copy link';
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
      h.append(btn);
    }
  });

  // 6. Reader-mode progressive disclosures & variant/language tabs
  if (readerEnhance) {
    groupCodeBlocks(target);
    collapseConditionLists(target);
    groupFlagVariants(target);
  }
}

/** Groups consecutive multi-language code blocks into a single tabbed code switcher. */
function groupCodeBlocks(target) {
  const toks = [...target.children].filter((el) => el.classList.contains('tok'));
  let i = 0;
  while (i < toks.length) {
    const getCode = (tok) => {
      if (tok.children.length !== 1) return null;
      const c = tok.firstElementChild;
      return c?.classList.contains('code') && c.dataset.lang ? c : null;
    };
    const first = getCode(toks[i]);
    if (!first) { i++; continue; }
    const run = [{ tok: toks[i], code: first, lang: first.dataset.lang }];
    let j = i + 1;
    while (j < toks.length) {
      const next = getCode(toks[j]);
      if (!next || run.some((r) => r.lang.toLowerCase() === next.dataset.lang.toLowerCase())) break;
      run.push({ tok: toks[j], code: next, lang: next.dataset.lang });
      j++;
    }
    if (run.length < 2) { i++; continue; }

    const group = document.createElement('div');
    group.className = 'code-group';
    const tablist = document.createElement('div');
    tablist.className = 'code-tabs';
    tablist.setAttribute('role', 'tablist');

    run.forEach((item, idx) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(idx === 0));
      tab.setAttribute('tabindex', idx === 0 ? '0' : '-1');
      tab.textContent = item.lang;
      const activate = () => {
        tablist.querySelectorAll('button').forEach((b, k) => {
          b.setAttribute('aria-selected', String(k === idx));
          b.setAttribute('tabindex', k === idx ? '0' : '-1');
        });
        run.forEach((r, k) => { r.code.hidden = k !== idx; });
      };
      tab.onclick = activate;
      tab.onkeydown = (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const tabs = [...tablist.querySelectorAll('button')];
        const nextIdx = (idx + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[nextIdx].click();
        tabs[nextIdx].focus();
      };
      tablist.append(tab);
      item.code.hidden = idx !== 0;
    });

    group.append(tablist, ...run.map((r) => r.code));
    run[0].tok.before(group);
    run.forEach((r) => r.tok.remove());
    i = j;
  }
}

/** Collapses long condition lists into accessible disclosures (collapsed by default). */
function collapseConditionLists(target) {
  const toks = [...target.children].filter((el) => el.classList.contains('tok'));
  toks.forEach((tok, idx) => {
    const list = tok.firstElementChild;
    if (!list || (list.tagName !== 'UL' && list.tagName !== 'OL') || tok.children.length !== 1) return;
    const count = list.querySelectorAll(':scope > li').length;
    const prev = idx > 0 ? toks[idx - 1].textContent.trim().toLowerCase() : '';
    const isConditionLead = /(?:where|when|conditions|criteria|following|rules)\s*:$/i.test(prev) || prev.endsWith(':');
    if (count < 6 && !(isConditionLead && count >= 4)) return;

    const label = /query|delta|snapshot|filter|where\s*:$/i.test(prev) ? 'Show query conditions' : 'Show conditions';
    const wrap = document.createElement('div');
    wrap.className = 'disclosure';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'disclosure-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg><span>${label}</span><span class="disclosure-count">${count} items</span>`;

    const panel = document.createElement('div');
    panel.className = 'disclosure-panel';
    const inner = document.createElement('div');
    inner.className = 'disclosure-inner';
    inner.append(list);
    panel.append(inner);

    btn.onclick = () => {
      const open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    };

    wrap.append(btn, panel);
    tok.innerHTML = '';
    tok.append(wrap);
  });
}

/** Groups consecutive H2/H3 sections that differ only by flag variants ("with Y flag" / "with Y and Y flags") into tabs. */
function groupFlagVariants(target) {
  const parseVariant = (title) => {
    const m = title.match(/^(.+?)\s+((?:with|without)\s+(?:both\s+)?(?:[A-Za-z0-9]+\s+(?:and\s+[A-Za-z0-9]+\s+)?flags?|no\s+flags?))$/i);
    return m ? { base: m[1].trim(), label: m[2].trim() } : null;
  };

  const children = [...target.children];
  const sections = [];
  let current = null;
  for (const el of children) {
    const h = el.classList.contains('tok') ? el.firstElementChild : null;
    if (h && (h.tagName === 'H2' || h.tagName === 'H3')) {
      current = { level: h.tagName, headingEl: h, title: h.dataset.headingTitle || h.textContent.trim(), id: h.id, els: [el] };
      sections.push(current);
    } else if (current) {
      current.els.push(el);
    }
  }

  let i = 0;
  while (i < sections.length) {
    const s = sections[i];
    const next = sections[i + 1];
    const sVar = parseVariant(s.title);
    const nextVar = next && next.level === s.level ? parseVariant(next.title) : null;
    const base = sVar ? sVar.base : (nextVar && nextVar.base.toLowerCase() === s.title.toLowerCase() ? s.title : null);
    if (!base) { i++; continue; }

    const run = [];
    let j = i;
    while (j < sections.length && sections[j].level === s.level) {
      const sec = sections[j];
      const v = parseVariant(sec.title);
      if (sec.title.toLowerCase() === base.toLowerCase()) {
        run.push({ sec, label: 'Default' });
      } else if (v && v.base.toLowerCase() === base.toLowerCase()) {
        run.push({ sec, label: v.label });
      } else {
        break;
      }
      j++;
    }
    if (run.length < 2) { i++; continue; }

    const box = document.createElement('div');
    box.className = 'variant-tabs';

    const head = document.createElement('div');
    head.className = 'variant-head';
    const mainH = run[0].sec.headingEl.cloneNode(true);
    const anchorBtn = mainH.querySelector('.heading-anchor');
    mainH.textContent = base;
    if (anchorBtn) mainH.append(anchorBtn);
    mainH.dataset.headingTitle = base;

    const tablist = document.createElement('div');
    tablist.className = 'variant-tablist';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', `${base} variants`);

    const panels = [];
    const activate = (idx) => {
      tablist.querySelectorAll('button').forEach((b, k) => {
        b.setAttribute('aria-selected', String(k === idx));
        b.setAttribute('tabindex', k === idx ? '0' : '-1');
      });
      panels.forEach((p, k) => { p.hidden = k !== idx; });
    };

    run.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(idx === 0));
      btn.setAttribute('tabindex', idx === 0 ? '0' : '-1');
      btn.textContent = item.label;
      btn.onclick = () => activate(idx);
      btn.onkeydown = (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const tabs = [...tablist.querySelectorAll('button')];
        const nextIdx = (idx + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        activate(nextIdx);
        tabs[nextIdx].focus();
      };
      tablist.append(btn);

      const panel = document.createElement('div');
      panel.className = 'variant-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.dataset.variantId = item.sec.id;
      panel.hidden = idx !== 0;
      // Keep body blocks inside the panel (omit duplicate heading except anchor id on panel)
      item.sec.els.slice(1).forEach((el) => panel.append(el));
      panels.push(panel);
    });

    head.append(mainH, tablist);
    box.append(head, ...panels);

    const anchorEl = run[0].sec.els[0];
    anchorEl.before(box);
    run.forEach((item) => item.sec.els[0].remove());
    i = j;
  }
}

let mermaidModulePromise = null;
function getMermaidModule() {
  if (!mermaidModulePromise) mermaidModulePromise = import('/mermaid-init.js');
  return mermaidModulePromise;
}

async function runMermaid(target, options) {
  if (!target.querySelector('.mermaid')) return;
  try {
    const mod = await getMermaidModule();
    await mod.renderMermaidDiagrams(target, options);
  } catch (err) {
    console.warn('[mermaid] Failed to initialize mermaid module:', err);
  }
}

async function rerenderDiagrams() {
  try {
    const mod = await getMermaidModule();
    await mod.rerenderAllDiagrams();
  } catch (err) {
    console.warn('[mermaid] Failed to re-render diagrams:', err);
  }
}

/** The Confluence storage format the pipeline writes, rebuilt from edited markdown. */
function toConfluenceXml(md) {
  if (!marked.Marked) return null;
  const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const converter = new marked.Marked({ gfm: true });
  converter.use({
    renderer: {
      code(code, info) {
        const lang = String(info || '').trim().split(/\s+/)[0].replace(/[^A-Za-z0-9_+#.-]/g, '');
        const param = lang === 'mermaid'
          ? '<ac:parameter ac:name="title">Diagram (Mermaid)</ac:parameter>'
          : lang ? `<ac:parameter ac:name="language">${lang}</ac:parameter>` : '';
        return `<ac:structured-macro ac:name="code">${param}<ac:plain-text-body><![CDATA[${code.replace(/]]>/g, ']]]]><![CDATA[>')}]]></ac:plain-text-body></ac:structured-macro>\n`;
      },
      link(href, title, text) {
        if (!href || !href.startsWith('confluence-link:')) return false;
        const [page, anchor] = href.slice('confluence-link:'.length).split('#');
        return `<ac:link${anchor ? ` ac:anchor="${attr(anchor)}"` : ''}><ri:page ri:content-title="${attr(decodeURIComponent(page))}"/><ac:plain-text-link-body><![CDATA[${text.replace(/<[^>]*>/g, '')}]]></ac:plain-text-link-body></ac:link>`;
      },
      html(html) {
        return /^\s*<!--/.test(html) ? '' : html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      },
    },
  });
  return converter.parse(md.replace(/^﻿/, '').replace(/^# .*\n+/, ''))
    .replace(/<(br|hr|img)([^>]*?)\s*\/?>/g, '<$1$2 />')
    .replace(/&nbsp;/g, '&#160;')
    .trim();
}

// ---------------------------------------------------------------- routing

function linkTo(source, spaceId, path = '', params = {}) {
  const query = new URLSearchParams(params).toString();
  return `#/${source}/${spaceId}/${path}${query ? `?${query}` : ''}`;
}

function go(source, spaceId, path = '', params = {}) {
  location.hash = linkTo(source, spaceId, path, params);
}

function parseHash() {
  const [pathPart, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  return { parts: pathPart.split('/').filter(Boolean).map(decodeURIComponent), params: Object.fromEntries(new URLSearchParams(query)) };
}

async function renderMermaidTestPage() {
  showView('doc');
  clearReview();
  state.raw = '';
  state.hash = '';
  state.tokens = [];
  updateHeader();
  renderNav();
  markActive();
  $('edit-btn').hidden = true;
  $('crumbs').innerHTML = `<span>Mermaid ELK Routing Test</span>`;
  $('pager').innerHTML = '';
  document.title = 'Mermaid Routing Test · Pepper-Soup';

  const testMarkdown = [
    '# Mermaid ELK Routing Test',
    '',
    'Three reference topologies rendered with `theme: \'base\'`, `layout: \'elk\'`, orthogonal routing (`curve: \'linear\'`), and shared `.key` / `.muted` classes.',
    '',
    '## 1. Linear Chain (7 Nodes)',
    '',
    '```mermaid',
    'flowchart LR',
    '  n1["Loan Created"]:::key --> n2["Parameter Validation"]',
    '  n2 --> n3["Product Rules Check"]',
    '  n3 --> n4["Schedule Generated"]',
    '  n4 --> n5["Approved"]',
    '  n5 --> n6["Disbursed"]',
    '  n6 --> n7["Active Repayment"]:::muted',
    '```',
    '',
    '## 2. Branch-and-Merge',
    '',
    '```mermaid',
    'flowchart TD',
    '  start["Incoming Repayment"]:::key --> check{"Loan Status?"}',
    '  check -->|"Active"| alloc["Allocate Principal & Interest"]',
    '  check -->|"Delinquent"| fee["Apply Late Fee & Penalty"]',
    '  check -->|"Overpaid"| credit["Hold in Suspense"]:::muted',
    '  alloc --> ledger["Post Journal Entries"]',
    '  fee --> ledger',
    '  credit --> ledger',
    '  ledger --> done["Update Balances"]',
    '```',
    '',
    '## 3. Subgraph & Cross-Boundary Flow',
    '',
    '```mermaid',
    'flowchart TD',
    '  trigger["COB Trigger"]:::key --> part',
    '  subgraph part["Batch Partitioning"]',
    '    p1["Select Eligible Loans"] --> p2["Partition by Account ID"]',
    '    p2 --> p3["Acquire Partition Lock"]',
    '  end',
    '  subgraph exec["Sequential Execution"]',
    '    e1["Run Interest Accrual"] --> e2["Evaluate Delinquency"]',
    '    e2 --> e3["Persist Loan State"]',
    '  end',
    '  p3 --> e1',
    '  e3 --> finish["Update COB Watermark"]:::muted',
    '```',
  ].join('\n');

  $('content').classList.add('prose');
  renderMarkdown(testMarkdown, $('content'), { blocks: true, readerEnhance: false });
  $('content').querySelectorAll('.diagram-card').forEach((card) => { card.dataset.noStepper = 'true'; });
  animatePageEnter();
  await runMermaid($('content'), { stepper: false });
  renderToc();
  window.scrollTo(0, 0);
}

async function route() {
  if (state.editing && !leaveEditor()) return;
  if (state.inline && !cancelInlineEdit(true)) return;
  closePopover();
  closeDrawer();
  closeSidebar();
  const { parts, params } = parseHash();

  if (parts[0] === 'mermaid-test') {
    await renderMermaidTestPage();
    return;
  }

  if (parts[0] === 'review') {
    if (!isReview()) {
      const ok = await requireReview();
      if (!ok) { history.replaceState(null, '', linkTo(state.source, state.space, '')); return route(); }
    }
    updateHeader();
    renderNav();
    if (!$('content').innerHTML.trim()) await loadPage();
    openDrawer();
    return;
  }

  const [source, spaceId, ...rest] = parts;
  if (!state.data.spaces[`${source}/${spaceId}`]) {
    history.replaceState(null, '', linkTo(state.source, state.space, ''));
    return route();
  }
  state.source = source;
  state.space = spaceId;
  state.path = rest.join('/');
  state.params = params;
  updateHeader();
  renderNav();
  await loadPage();
}

// ---------------------------------------------------------------- header / nav

function updateTabsIndicator() {
  const indicator = $('tabs-indicator');
  const active = document.querySelector('#space-tabs button.active');
  if (!indicator) return;
  if (!active) {
    indicator.classList.remove('visible');
    return;
  }
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  indicator.classList.add('visible');
}

function updateHeader() {
  document.documentElement.dataset.source = state.source;
  document.body.classList.toggle('mode-review', isReview());
  document.querySelectorAll('#source-switch button').forEach((b) => {
    const on = b.dataset.source === state.source;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  document.querySelectorAll('#space-tabs button').forEach((b) => {
    b.classList.toggle('active', b.dataset.space === state.space);
  });
  updateTabsIndicator();
  document.querySelectorAll('#mode-switch button').forEach((b) => {
    const on = b.dataset.mode === (isReview() ? 'review' : 'reader');
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  $('issues-btn')?.setAttribute('aria-expanded', String(state.drawerOpen));
  updateChangesButton();
  updateCounts();
}

function threadsAll() {
  if (!state.review) return [];
  const { entries, state: saved } = state.review;
  return entries.map((entry) => {
    const kept = saved.issues[entry.id] || {};
    const kind = KINDS[entry.kind] || { key: 'unfixed', label: entry.kind, rank: 1 };
    return {
      id: entry.id, kind: kind.key, kindLabel: kind.label, rank: kind.rank,
      page: entry.page || '', section: entry.section || '', published: entry.published || '',
      text: entry.problem || '', sources: entry.sources || [], file: entry.file || '',
      notPublished: !!entry.notPublished || !entry.page,
      status: kept.status || 'open', by: kept.by, at: kept.at,
    };
  });
}

function openCounts() {
  const counts = new Map();
  for (const t of threadsAll()) if (t.status === 'open' && t.page) counts.set(t.page, (counts.get(t.page) || 0) + 1);
  return counts;
}

function updateCounts() {
  const open = threadsAll().filter((t) => t.status === 'open').length;
  $('open-count').textContent = open;
}

function getSavedOpenGroups() {
  const raw = store.get('localStorage', `navOpen:${spaceKey()}`);
  if (!raw) return null;
  try { return new Set(JSON.parse(raw)); } catch { return null; }
}

function saveOpenGroups() {
  const open = [...document.querySelectorAll('#nav .nav-group:not(.closed)')].map((g) => g.dataset.path);
  store.set('localStorage', `navOpen:${spaceKey()}`, JSON.stringify(open));
}

function renderNav() {
  const s = space();
  state.pages = [{ title: 'Overview', path: '', section: '' }];
  state.nodeByPath = new Map();
  state.parentOf = new Map();
  const counts = isReview() ? openCounts() : new Map();
  const savedOpen = getSavedOpenGroups();
  const dot = (path) => {
    const n = counts.get(`${state.space}/${path}`);
    return n
      ? `<span class="nav-dot-wrap" title="${n} open issue${n === 1 ? '' : 's'}"><span class="nav-dot-count">${n}</span><span class="nav-dot" aria-hidden="true"></span></span>`
      : '';
  };

  const walk = (nodes, parent) => nodes.map((node) => {
    state.nodeByPath.set(node.path, node);
    if (parent) state.parentOf.set(node.path, parent);
    if (node.children.length) {
      const inner = walk(node.children, node);
      const isOpen = savedOpen ? savedOpen.has(node.path) : false;
      return `<div class="nav-group${isOpen ? '' : ' closed'}" data-path="${esc(node.path)}">
        <button class="nav-head" type="button" aria-expanded="${isOpen ? 'true' : 'false'}"><span>${esc(node.title)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
        <div class="nav-pages"><div class="nav-pages-inner">${inner}</div></div></div>`;
    }
    state.pages.push({ ...node, section: parent?.title || '' });
    const edited = state.showChanges && state.changes.has(`${s.base}/${node.path}`);
    return `<a class="nav-link" href="${linkTo(state.source, state.space, node.path)}" data-path="${esc(node.path)}"><span>${esc(node.title)}</span>${edited ? '<i class="nav-chg" title="Edited"></i>' : ''}${dot(node.path)}</a>`;
  }).join('');

  $('nav').innerHTML = `
    <a class="nav-link nav-overview" href="${linkTo(state.source, state.space, '')}" data-path="">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg><span>Overview</span></a>
    ${walk(s.tree, null)}`;
}

function markActive() {
  document.querySelectorAll('.nav-link').forEach((a) => {
    const on = state.view === 'doc' && a.dataset.path === state.path;
    a.classList.toggle('active', on);
    if (on) {
      let group = a.closest('.nav-group');
      while (group) {
        group.classList.remove('closed');
        group.querySelector(':scope > .nav-head')?.setAttribute('aria-expanded', 'true');
        group = group.parentElement.closest('.nav-group');
      }
      const sb = $('sidebar');
      const top = a.offsetTop - sb.offsetTop;
      if (top < sb.scrollTop || top > sb.scrollTop + sb.clientHeight - 60) sb.scrollTop = top - sb.clientHeight / 3;
    }
  });
  document.querySelectorAll('.nav-group').forEach((g) => {
    const on = state.view === 'doc' && g.dataset.path === state.path;
    g.classList.toggle('current', on);
    if (on) {
      g.classList.remove('closed');
      g.querySelector(':scope > .nav-head')?.setAttribute('aria-expanded', 'true');
    }
  });
}

// ---------------------------------------------------------------- pages

function showView(view) {
  state.view = view;
  $('page').hidden = view !== 'doc';
  updateHeader();
}

function pageTitleOf(rel) {
  const [spaceId, ...rest] = rel.split('/');
  const path = rest.join('/');
  const tree = state.data.spaces[`gitbook/${spaceId}`]?.tree || [];
  const find = (nodes) => {
    for (const node of nodes) {
      if (node.path === path) return node.title;
      const hit = find(node.children);
      if (hit) return hit;
    }
    return null;
  };
  return find(tree) || path.split('/').pop().replace(/\.md$/, '').replace(/-/g, ' ');
}

// ---------------------------------------------------------------- changes (inline diff)

/** Changed files ("docs/gitbook/user/x.md" → { status, added, removed }) since the pipeline run. */
async function loadChanges() {
  try {
    const { files } = await api('/api/changes');
    state.changes = new Map(files.map((f) => [f.path, f]));
  } catch {
    state.changes = new Map();
  }
}

function setShowChanges(on) {
  state.showChanges = on;
  store.set('localStorage', 'changes', on ? '1' : null);
  updateChangesButton();
  renderNav();
  markActive();
  if (state.view === 'doc' && !state.editing) loadPage();
}

function updateChangesButton() {
  const n = [...state.changes.keys()].filter((p) => p.startsWith(`docs/${state.source}/`) && p.endsWith('.md')).length;
  $('changes-btn').classList.toggle('active', state.showChanges);
  $('changes-btn').setAttribute('aria-pressed', String(state.showChanges));
  $('changes-btn').setAttribute('aria-checked', String(state.showChanges));
  $('changes-count').textContent = n;
  $('more-dot').hidden = n === 0;
}

const DIFF_WORDS = new Set(['paragraph', 'heading', 'list', 'blockquote']);

/** Wraps changed words in <ins>/<del>, line by line so lists and line breaks keep their markdown. */
function mergeWords(before, after) {
  const wrap = (tag, text) => text.split('\n').map((line) => (line.trim() ? `<${tag}>${line}</${tag}>` : line)).join('\n');
  return Diff.diffWordsWithSpace(before, after)
    .map((part) => (part.added ? wrap('ins', part.value) : part.removed ? wrap('del', part.value) : part.value))
    .join('');
}

/** Renders the current page with its edits marked against the pipeline's version. */
function renderChanges(before, after, target) {
  const lex = (md) => (md == null ? [] : marked.lexer(md.replace(/^﻿/, '')))
    .filter((t) => t.type !== 'space' && !(t.type === 'html' && /^\s*<!--/.test(t.raw)));
  const old = lex(before);
  const now = lex(after);
  const toHtml = (tokens) => { const list = [...tokens]; list.links = {}; return DOMPurify.sanitize(marked.parser(list), PURIFY); };
  const blocks = [];
  const push = (cls, html) => blocks.push(`<div class="tok ${cls}">${html}</div>`);

  const parts = Diff.diffArrays(old.map((t) => t.raw.trim()), now.map((t) => t.raw.trim()));
  let i = 0;
  let j = 0;
  for (let k = 0; k < parts.length; k++) {
    const part = parts[k];
    if (!part.added && !part.removed) {
      now.slice(j, j + part.count).forEach((t) => push('', toHtml([t])));
      i += part.count; j += part.count;
      continue;
    }
    const removed = part.removed ? old.slice(i, i + part.count) : [];
    const next = part.removed && parts[k + 1]?.added ? parts[++k] : part.added ? part : null;
    const added = next ? now.slice(j, j + next.count) : [];
    i += removed.length; j += added.length;
    const pairs = Math.min(removed.length, added.length);
    for (let n = 0; n < Math.max(removed.length, added.length); n++) {
      const r = removed[n];
      const a = added[n];
      if (n < pairs && r.type === a.type && DIFF_WORDS.has(a.type)) {
        push('chg-mod', DOMPurify.sanitize(marked.parse(mergeWords(r.raw.trim(), a.raw.trim())), PURIFY));
      } else {
        if (r) push('chg-del', toHtml([r]));
        if (a) push('chg-add', toHtml([a]));
      }
    }
  }
  target.innerHTML = blocks.join('');
  enhance(target);
}

function animatePageEnter() {
  const page = $('page');
  page.classList.remove('page-enter');
  void page.offsetWidth;
  page.classList.add('page-enter');
}

function scrollToTarget(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    const panel = el.closest('.variant-panel');
    if (panel && panel.hidden) {
      const box = panel.closest('.variant-tabs');
      const idx = [...box.querySelectorAll('.variant-panel')].indexOf(panel);
      box.querySelectorAll('.variant-tablist button')[idx]?.click();
    }
    const disc = el.closest('.disclosure');
    if (disc && !disc.classList.contains('open')) disc.querySelector('.disclosure-btn')?.click();
    el.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const variantPanel = document.querySelector(`.variant-panel[data-variant-id="${CSS.escape(id)}"]`);
  if (variantPanel) {
    const box = variantPanel.closest('.variant-tabs');
    const idx = [...box.querySelectorAll('.variant-panel')].indexOf(variantPanel);
    box.querySelectorAll('.variant-tablist button')[idx]?.click();
    box.scrollIntoView({ behavior: 'smooth' });
  }
}

async function loadPage() {
  const token = ++loadToken;
  showView('doc');
  clearReview();
  state.raw = '';
  state.hash = '';
  state.tokens = [];
  const node = state.nodeByPath.get(state.path);
  const page = state.pages.find((p) => p.path === state.path);

  if (!state.path) renderHome();
  else if (node && node.children.length) renderGroup(node);
  else {
    $('content').classList.add('prose');
    $('content').innerHTML = '<div class="skeleton"><span></span><span></span><span></span><span></span></div>';
    try {
      const file = await api(`/api/file?path=${enc(filePath())}`);
      if (token !== loadToken) return;
      state.raw = file.content;
      state.hash = file.hash;
      const change = state.showChanges && state.changes.get(filePath());
      if (change) {
        const { content: before } = await api(`/api/baseline?path=${enc(filePath())}`);
        if (token !== loadToken) return;
        renderChanges(before, state.raw, $('content'));
        $('content').insertAdjacentHTML('afterbegin', `<div class="chg-banner">
          <span>${before == null ? 'New page' : 'Edited since the pipeline generated it'}</span>
          <span class="chg-counts"><b class="plus">+${change.added}</b> <b class="minus">−${change.removed}</b> lines</span>
          <span class="muted">Green is added, red is removed.</span></div>`);
      } else {
        state.tokens = renderMarkdown(state.raw, $('content'), { blocks: true, readerEnhance: !isReview() });
      }
    } catch {
      if (token !== loadToken) return;
      $('content').innerHTML = `<div class="empty-state"><h1>This page is not published yet</h1>
        <p class="muted">No source describes it yet, so it was left out of the ${esc(SOURCE_LABEL[state.source])} output.</p>
        <a class="btn" href="${linkTo(state.source, state.space, '')}">Back to overview</a></div>`;
    }
  }

  animatePageEnter();
  const h1 = $('content').querySelector('h1');
  document.title = `${h1 ? h1.dataset.headingTitle || h1.textContent : page?.title || space().title} · Pepper-Soup`;
  renderCrumbs(page, node);
  renderPager();
  markActive();
  $('edit-btn').hidden = !state.raw;
  await runMermaid($('content'));
  if (token !== loadToken) return;
  renderToc();
  // review pins attach to the plain page, not the marked-up diff
  if (isReview() && !(state.showChanges && state.changes.get(filePath()))) await annotate(token);
  if (token !== loadToken) return;

  if (state.params.t) focusThread(state.params.t);
  else if (state.params.a) scrollToTarget(state.params.a);
  else window.scrollTo(0, 0);
}

function renderCrumbs(page, node) {
  const parts = [
    `<span>${esc(SOURCE_LABEL[state.source])}</span>`,
    `<a href="${linkTo(state.source, state.space, '')}">${esc(space().title)}</a>`,
  ];
  const parent = state.parentOf.get(state.path);
  if (parent) parts.push(`<a href="${linkTo(state.source, state.space, parent.path)}">${esc(parent.title)}</a>`);
  if (state.path) parts.push(`<span>${esc(page?.title || node?.title || '')}</span>`);
  $('crumbs').innerHTML = parts.join('<span class="sep">/</span>');
}

function leafCount(nodes) {
  return nodes.reduce((sum, node) => sum + (node.children.length ? leafCount(node.children) : 1), 0);
}

function pageSummary(path) {
  const entry = state.data.index.find((d) => d.space === spaceKey() && d.path === path);
  return entry ? entry.headings.slice(0, 3).join(' · ') : '';
}

function renderHome() {
  $('content').classList.remove('prose');
  const s = space();
  const counts = isReview() ? openCounts() : new Map();
  const spaceOpen = [...counts].filter(([rel]) => rel.startsWith(`${state.space}/`)).reduce((n, [, c]) => n + c, 0);
  const groups = s.tree.map((group) => {
    const leaves = [];
    const collect = (nodes) => nodes.forEach((n) => (n.children.length ? collect(n.children) : leaves.push(n)));
    collect(group.children.length ? group.children : [group]);
    const issues = leaves.reduce((n, leaf) => n + (counts.get(`${state.space}/${leaf.path}`) || 0), 0);
    return `<section class="group-card">
      <a class="group-card-head" href="${linkTo(state.source, state.space, group.path)}">
        <h3>${esc(group.title)}</h3>
        <span class="muted">${leaves.length} page${leaves.length === 1 ? '' : 's'}</span>
        ${issues ? `<span class="page-issues"><span class="dot"></span>${issues} open</span>` : ''}
      </a>
      <ul>${leaves.slice(0, 6).map((leaf) => `<li><a href="${linkTo(state.source, state.space, leaf.path)}">${esc(leaf.title)}</a></li>`).join('')}
      ${leaves.length > 6 ? `<li class="more"><a href="${linkTo(state.source, state.space, group.path)}">${leaves.length - 6} more</a></li>` : ''}</ul>
    </section>`;
  }).join('');

  $('content').innerHTML = `
    <div class="hero">
      <div class="eyebrow">${esc(SOURCE_LABEL[state.source])} · Pepper-Soup</div>
      <h1>${esc(s.title)}</h1>
      <p class="lead">${esc(SPACE_INTRO[state.space] || '')}</p>
      <div class="hero-stats">
        <span><b>${s.tree.length}</b> topics</span>
        <span><b>${leafCount(s.tree)}</b> pages</span>
        ${isReview() ? `<button type="button" data-open-drawer="true"><b>${spaceOpen}</b> open review items</button>` : ''}
      </div>
    </div>
    <div class="group-grid">${groups}</div>`;
}

function renderGroup(node) {
  $('content').classList.remove('prose');
  const counts = isReview() ? openCounts() : new Map();
  const cards = node.children.map((child) => {
    const n = counts.get(`${state.space}/${child.path}`);
    return `<a class="page-card" href="${linkTo(state.source, state.space, child.path)}">
      <div class="page-card-title">${esc(child.title)}${n ? `<span class="page-issues"><span class="dot"></span>${n}</span>` : ''}</div>
      <div class="page-card-text">${esc(pageSummary(child.path)) || '&nbsp;'}</div>
    </a>`;
  }).join('');
  $('content').innerHTML = `<div class="hero small"><div class="eyebrow">${esc(space().title)}</div><h1>${esc(node.title)}</h1>
    <p class="lead">${node.children.length} page${node.children.length === 1 ? '' : 's'} in this topic.</p></div>
    <div class="page-grid">${cards}</div>`;
}

function renderPager() {
  const i = state.pages.findIndex((p) => p.path === state.path);
  const prev = i > 0 ? state.pages[i - 1] : null;
  const next = i >= 0 ? state.pages[i + 1] : null;
  const link = (p, cls, label) => `<a class="${cls}" href="${linkTo(state.source, state.space, p.path)}"><small>${label}</small><span>${esc(p.title)}</span></a>`;
  $('pager').innerHTML = (prev ? link(prev, 'prev', 'Previous') : '<span></span>') + (next ? link(next, 'next', 'Next') : '');
}

let tocObserver;
function renderToc() {
  const heads = $('content').classList.contains('prose')
    ? [...$('content').querySelectorAll('h2, h3')].filter((h) => !h.closest('.variant-panel[hidden]'))
    : [];
  const h2Count = heads.filter((h) => h.tagName === 'H2').length;
  $('toc').classList.toggle('empty', h2Count < 2 && heads.length < 2);

  // Build H2 -> nested H3 tree (H3s only expand under active H2)
  const items = [];
  let currentH2 = null;
  for (const h of heads) {
    const title = h.dataset.headingTitle || h.textContent.trim();
    if (h.tagName === 'H2' || !currentH2) {
      currentH2 = { id: h.id, title, children: [] };
      items.push(currentH2);
    } else {
      currentH2.children.push({ id: h.id, title, parentId: currentH2.id });
    }
  }

  $('toc-list').innerHTML = items.map((item, idx) => `
    <li class="toc-item${idx === 0 ? ' expanded' : ''}" data-h2="${esc(item.id)}">
      <a href="#${esc(item.id)}" data-id="${esc(item.id)}" title="${esc(item.title)}">${esc(item.title)}</a>
      ${item.children.length
        ? `<ul class="toc-sub">${item.children.map((c) => `<li><a href="#${esc(c.id)}" data-id="${esc(c.id)}" data-parent="${esc(item.id)}" title="${esc(c.title)}">${esc(c.title)}</a></li>`).join('')}</ul>`
        : ''}
    </li>`).join('');

  const setActiveToc = (id) => {
    let parentId = id;
    document.querySelectorAll('#toc-list a').forEach((a) => {
      const match = a.dataset.id === id;
      a.classList.toggle('active', match);
      if (match && a.dataset.parent) parentId = a.dataset.parent;
    });
    document.querySelectorAll('#toc-list .toc-item').forEach((li) => {
      li.classList.toggle('expanded', li.dataset.h2 === parentId);
    });
  };

  if (heads[0]) setActiveToc(heads[0].id);

  tocObserver?.disconnect();
  tocObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting);
    if (!visible.length) return;
    setActiveToc(visible[0].target.id);
  }, { rootMargin: '-76px 0px -68% 0px' });
  heads.forEach((h) => tocObserver.observe(h));
}

// ---------------------------------------------------------------- links inside docs

function resolveRelative(file) {
  const dir = state.path.includes('/') ? state.path.slice(0, state.path.lastIndexOf('/') + 1) : '';
  const out = [];
  (dir + file).split('/').forEach((p) => (p === '..' ? out.pop() : p && p !== '.' && out.push(p)));
  return out.join('/');
}

function onContentClick(e) {
  const anchorBtn = e.target.closest('.heading-anchor');
  if (anchorBtn) {
    e.preventDefault();
    const url = `${location.origin}${location.pathname}${linkTo(state.source, state.space, state.path, { a: anchorBtn.dataset.anchor })}`;
    navigator.clipboard?.writeText(url).then(() => toast('Link copied'));
    return;
  }

  const diagramAct = e.target.closest('[data-diagram-act]');
  if (diagramAct) {
    e.preventDefault();
    e.stopPropagation();
    const card = diagramAct.closest('.diagram-card');
    const act = diagramAct.dataset.diagramAct;
    const source = card?.dataset.source || '';
    const svg = card?.querySelector('.diagram svg');

    if (act === 'toggle-view' && card) {
      getMermaidModule().then((mod) => mod.toggleDiagramView(card)).catch((err) => toast(err.message));
    } else if (act === 'expand' && svg) {
      openLightbox(svg.cloneNode(true), svg.getAttribute('aria-label') || 'Diagram');
    } else if (act === 'copy') {
      navigator.clipboard?.writeText(source).then(() => toast('Copied Mermaid source'));
    } else if (act === 'download' && svg) {
      const serializer = new XMLSerializer();
      const xml = serializer.serializeToString(svg);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(state.path || 'diagram').split('/').pop().replace(/\.md$/, '')}-diagram.svg`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    return;
  }

  const diagramTarget = e.target.closest('.diagram');
  if (diagramTarget && !e.target.closest('.diagram-error, .diagram-stepper')) {
    e.preventDefault();
    const svg = diagramTarget.querySelector('svg');
    if (svg) openLightbox(svg.cloneNode(true), svg.getAttribute('aria-label') || 'Diagram');
    return;
  }

  const imgTarget = e.target.closest('img.zoomable');
  if (imgTarget && !e.target.closest('a')) {
    e.preventDefault();
    const clone = document.createElement('img');
    clone.src = imgTarget.src;
    clone.alt = imgTarget.alt || 'Image preview';
    openLightbox(clone, imgTarget.alt || 'Image');
    return;
  }

  const drawerTrigger = e.target.closest('[data-open-drawer]');
  if (drawerTrigger) {
    e.preventDefault();
    openDrawer();
    return;
  }

  const a = e.target.closest('a');
  if (!a || a.closest('.issue-popover')) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('#/')) return;
  if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; return; }
  if (href.startsWith('confluence-link:')) {
    e.preventDefault();
    const [title, anchor] = href.slice('confluence-link:'.length).split('#');
    const wanted = decodeURIComponent(title).toLowerCase();
    const page = state.pages.find((p) => p.title.toLowerCase() === wanted)
      || state.data.index.find((d) => d.space === spaceKey() && d.title.toLowerCase() === wanted);
    if (page) go(state.source, state.space, page.path, anchor ? { a: anchor } : {});
    else toast('That page is not in this space.');
    return;
  }
  if (href.startsWith('#')) {
    e.preventDefault();
    scrollToTarget(href.slice(1));
    return;
  }
  const [file, anchor] = href.split('#');
  if (file.endsWith('.md')) {
    e.preventDefault();
    go(state.source, state.space, resolveRelative(file), anchor ? { a: anchor } : {});
  }
}

// ---------------------------------------------------------------- lightbox (zoom & pan)

let lastLightboxFocus = null;
const lbView = { scale: 1, x: 0, y: 0, dragging: false, startX: 0, startY: 0 };

function updateLightboxTransform() {
  const stage = $('lightbox-stage');
  if (!stage) return;
  stage.style.transform = `translate(${lbView.x}px, ${lbView.y}px) scale(${lbView.scale})`;
  const pct = $('lightbox-zoom-reset');
  if (pct) pct.textContent = `${Math.round(lbView.scale * 100)}%`;
}

function setLightboxZoom(nextScale) {
  lbView.scale = Math.max(0.4, Math.min(4, nextScale));
  updateLightboxTransform();
}

function resetLightboxView() {
  lbView.scale = 1;
  lbView.x = 0;
  lbView.y = 0;
  updateLightboxTransform();
}

function openLightbox(node, title = 'Diagram') {
  lastLightboxFocus = document.activeElement;
  $('lightbox-title').textContent = title;
  const stage = $('lightbox-stage');
  stage.innerHTML = '';
  stage.append(node);
  resetLightboxView();
  $('lightbox-modal').hidden = false;
  requestAnimationFrame(() => $('lightbox-modal').classList.add('open'));
  document.body.classList.add('modal-open');
  $('lightbox-close').focus();
}

function closeLightbox() {
  if ($('lightbox-modal').hidden) return;
  $('lightbox-modal').classList.remove('open');
  $('lightbox-modal').hidden = true;
  $('lightbox-stage').innerHTML = '';
  $('lightbox-body').classList.remove('panning');
  lbView.dragging = false;
  document.body.classList.remove('modal-open');
  lastLightboxFocus?.focus?.();
  lastLightboxFocus = null;
}

// ---------------------------------------------------------------- review mode

async function requireReview() {
  if (getPassword()) {
    try { await loadReview(); state.mode = 'review'; store.set('localStorage', 'mode', 'review'); return true; } catch {}
  }
  return openSignin();
}

function openSignin() {
  return new Promise((resolve) => {
    $('signin-modal').hidden = false;
    $('signin-error').hidden = true;
    $('signin-name').value = getAuthor();
    $('signin-password').value = '';
    (getAuthor() ? $('signin-password') : $('signin-name')).focus();
    const close = (ok) => {
      $('signin-modal').hidden = true;
      $('signin-form').onsubmit = null;
      $('signin-cancel').onclick = null;
      resolve(ok);
    };
    $('signin-cancel').onclick = () => close(false);
    $('signin-form').onsubmit = async (e) => {
      e.preventDefault();
      $('signin-submit').disabled = true;
      $('signin-submit').textContent = 'Signing in…';
      store.set('localStorage', 'author', $('signin-name').value.trim().slice(0, 60));
      store.set('sessionStorage', 'pw', $('signin-password').value);
      try {
        await api('/api/login', { method: 'POST', headers: { 'X-Password': getPassword() } });
        await loadReview();
        state.mode = 'review';
        store.set('localStorage', 'mode', 'review');
        close(true);
      } catch (error) {
        store.set('sessionStorage', 'pw', null);
        $('signin-error').textContent = error.status === 401 ? 'That password is not right.' : error.message;
        $('signin-error').hidden = false;
      } finally {
        $('signin-submit').disabled = false;
        $('signin-submit').textContent = 'Sign in';
      }
    };
  });
}

async function loadReview() {
  state.review = await authed('/api/review');
  updateCounts();
}

async function setMode(mode) {
  if (mode === 'review') {
    if (!(await requireReview())) return;
  } else {
    state.mode = 'reader';
    store.set('localStorage', 'mode', 'reader');
    closeDrawer();
    closePopover();
  }
  updateHeader();
  renderNav();
  await loadPage();
}

function signOut() {
  store.set('sessionStorage', 'pw', null);
  state.review = null;
  setMode('reader');
  toast('Signed out');
}

async function getEvidence(rel) {
  if (!state.evidence.has(rel)) state.evidence.set(rel, authed(`/api/evidence?page=${enc(rel)}`).then((r) => r.sections).catch(() => []));
  return state.evidence.get(rel);
}

function clearReview() {
  closePopover();
  state.threads = [];
  state.active = null;
  $('page-issues').hidden = true;
}

/** Splits the rendered page into sections: each h2 block and the blocks after it. */
function pageSections() {
  const sections = [];
  let current = null;
  for (const el of $('content').querySelectorAll(':scope > .tok')) {
    if (el.firstElementChild?.tagName === 'H2') {
      current = { title: el.firstElementChild.dataset.headingTitle || el.firstElementChild.textContent, head: el, toks: [] };
      sections.push(current);
    } else if (current) current.toks.push(el);
  }
  return sections;
}

/**
 * Attaches evidence (cited facts) to rendered blocks. The pipeline renders each
 * block in order, and a list or table may carry a lead-in paragraph, so blocks
 * are matched to elements by type, in order.
 */
function attachEvidence(sections, evidence) {
  const is = (el, type) => {
    const c = el?.firstElementChild;
    if (!c) return false;
    switch (type) {
      case 'paragraph': return c.tagName === 'P';
      case 'note': return c.tagName === 'BLOCKQUOTE';
      case 'heading': return /^H[3-6]$/.test(c.tagName);
      case 'diagram': return c.classList.contains('diagram-card') || c.classList.contains('diagram');
      case 'bullets': case 'steps': return c.tagName === 'UL' || c.tagName === 'OL';
      case 'table': return c.classList.contains('table');
      default: return false;
    }
  };
  for (const section of sections) {
    const match = evidence.find((e) => norm(e.title) === norm(section.title));
    if (!match) continue;
    section.key = match.key;
    let i = 0;
    for (const block of match.blocks) {
      const el = section.toks[i];
      let group = null;
      if (is(el, block.type)) group = [el];
      else if (['bullets', 'steps', 'table'].includes(block.type) && is(el, 'paragraph') && is(section.toks[i + 1], block.type)) group = [el, section.toks[i + 1]];
      if (!group) continue;
      i += group.length;
      group.forEach((g) => { g._group = group; g._facts = block.facts; });
    }
  }
}

function findAnchor(thread, sections) {
  const all = [...$('content').querySelectorAll(':scope > .tok')];
  const section = sections.find((s) => norm(s.title) === norm(thread.section));
  const needle = norm(thread.published).slice(0, 70);
  let el = null;
  if (needle) {
    el = (section ? [section.head, ...section.toks] : []).find((t) => norm(t.textContent).includes(needle))
      || all.find((t) => norm(t.textContent).includes(needle));
  }
  if (el) return { el: (el._group || [el])[0], els: el._group || [el], exact: true };
  if (section) return { el: section.head, els: [section.head], exact: false };
  return all[0] ? { el: all[0], els: [all[0]], exact: false } : null;
}

async function annotate(token) {
  const rel = pageRel();
  let threads = threadsAll().filter((t) => t.page === rel && rel);
  if (state.raw) {
    const sections = pageSections();
    attachEvidence(sections, await getEvidence(rel));
    if (token !== loadToken) return;
    threads = threads.map((t) => ({ ...t, anchor: findAnchor(t, sections) })).filter((t) => t.anchor);
  } else threads = [];
  state.threads = threads.sort((a, b) => a.anchor.el.offsetTop - b.anchor.el.offsetTop || a.rank - b.rank);
  renderThreads();
}

// ---------------------------------------------------------------- threads: margin markers & anchored popover

function relTime(iso) {
  if (!iso) return '';
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const steps = [[60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.35, 'week'], [12, 'month'], [Infinity, 'year']];
  let value = diff;
  for (const [size, unit] of steps) {
    if (Math.abs(value) < size) return rtf.format(Math.round(value), unit);
    value /= size;
  }
  return '';
}

const textHtml = (s) => esc(s).replace(/\n/g, '<br>');

function issueSummary(t) {
  if (t.section) return t.section;
  const firstLine = (t.text || '').split(/\n|\.\s+/)[0].trim();
  return firstLine || t.kindLabel;
}

function popoverSourcesHtml(t, el) {
  const sources = t.sources || [];
  const facts = el?._facts || [];
  if (!sources.length && !facts.length) return '';
  const total = sources.length + facts.length;
  const where = (s) => [s.title, s.sheet && `sheet ${s.sheet}`, s.rows?.length && `rows ${s.rows.join(', ')}`, s.ticket].filter(Boolean).join(' · ');
  return `<div class="ip-sources">
    <button type="button" class="ip-sources-btn" id="ip-sources-toggle" aria-expanded="false" aria-controls="ip-sources-list">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      <span>Sources (${total})</span>
    </button>
    <ol class="ip-sources-list" id="ip-sources-list" hidden>
      ${sources.map((s) => `<li><div class="src-where">${esc(s.where)}</div>${s.quote ? `<blockquote>${esc(s.quote)}</blockquote>` : ''}</li>`).join('')}
      ${facts.map((f) => `<li><div class="src-where">${esc(where(f.source))}</div><div>${esc(f.statement)}</div>${f.quote ? `<blockquote>${esc(f.quote)}</blockquote>` : ''}</li>`).join('')}
    </ol>
  </div>`;
}

function renderThreads() {
  const content = $('content');
  content.querySelectorAll('.pin').forEach((p) => p.remove());
  content.querySelectorAll('.has-thread, .thread-active, .resolving').forEach((el) => {
    el.classList.remove('has-thread', 'thread-active', 'resolving');
    delete el.dataset.threadIds;
  });

  const byAnchor = new Map();
  for (const t of state.threads) {
    if (!byAnchor.has(t.anchor.el)) byAnchor.set(t.anchor.el, []);
    byAnchor.get(t.anchor.el).push(t);
  }

  let markerIndex = 0;
  for (const [el, threads] of byAnchor) {
    const open = threads.filter((t) => t.status === 'open');
    const els = threads[0].anchor.els;
    const ids = threads.map((t) => t.id).join(',');
    if (open.length) {
      markerIndex += 1;
      els.forEach((x) => {
        x.classList.add('has-thread');
        x.dataset.threadIds = ids;
      });
    }
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = `pin${open.length ? '' : ' done'}`;
    pin.dataset.ids = ids;
    pin.setAttribute('aria-label', open.length
      ? `Review issue ${markerIndex} (${open.length} open)`
      : `Resolved review item (${threads.length})`);
    pin.title = open.length
      ? `${open.length} open issue${open.length === 1 ? '' : 's'}`
      : `${threads.length} closed issue${threads.length === 1 ? '' : 's'}`;
    pin.innerHTML = open.length
      ? String(markerIndex)
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    el.append(pin);
  }

  const openCount = state.threads.filter((t) => t.status === 'open').length;
  const closedCount = state.threads.length - openCount;
  const pageIssues = $('page-issues');
  pageIssues.hidden = !state.threads.length;
  if (state.threads.length) {
    pageIssues.setAttribute('role', 'button');
    pageIssues.setAttribute('tabindex', '0');
    pageIssues.title = 'View issues for this page';
    pageIssues.innerHTML = `<span class="dot" aria-hidden="true"></span><span>${openCount} open${closedCount ? ` · ${closedCount} closed` : ''}</span>`;
  } else {
    pageIssues.innerHTML = '';
  }
}

function setActive(id, { scroll = false } = {}) {
  state.active = id;
  $('content').querySelectorAll('.thread-active').forEach((el) => el.classList.remove('thread-active'));
  $('content').querySelectorAll('.pin.active').forEach((p) => p.classList.remove('active'));
  const t = state.threads.find((x) => x.id === id);
  if (t) {
    t.anchor.els.forEach((el) => el.classList.add('thread-active'));
    t.anchor.el.querySelector(':scope > .pin')?.classList.add('active');
    if (scroll) {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      t.anchor.el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    }
  }
}

function renderPopoverContent() {
  const pop = $('issue-popover');
  if (!state.popover) return;
  const { threads, index } = state.popover;
  const t = threads[index] || threads[0];
  if (!t) { closePopover(); return; }

  const closed = t.status !== 'open';
  const chipLabel = closed ? STATUS_LABEL[t.status] : t.kindLabel;
  const chipClass = closed ? `status-${t.status}` : '';
  const anchored = t.anchor ? t.anchor.exact : false;
  const fixable = !!t.anchor?.exact && !!state.raw;
  const statusNote = closed && t.by ? `<div class="ip-status-note">${esc(STATUS_LABEL[t.status])} by ${esc(t.by)}, ${esc(relTime(t.at))}</div>` : '';
  const stepper = threads.length > 1
    ? `<div class="ip-stepper">
        <button type="button" class="icon-btn sm" data-act="prev-issue" aria-label="Previous issue on this block"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>
        <span>${index + 1} / ${threads.length}</span>
        <button type="button" class="icon-btn sm" data-act="next-issue" aria-label="Next issue on this block"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
      </div>`
    : '';

  pop.innerHTML = `
    <div class="ip-head">
      <span class="ip-chip ${chipClass}">${esc(chipLabel)}</span>
      <button type="button" class="ip-id" data-act="copy" title="Copy issue ID">${esc(t.id)}</button>
      ${stepper}
      <button type="button" class="icon-btn sm ip-close" data-act="close-popover" aria-label="Close issue popover">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="ip-summary">${esc(issueSummary(t))}</div>
    ${t.published && !anchored ? `<div class="ip-quote">“${esc(mdText(t.published).slice(0, 200))}${t.published.length > 200 ? '…' : ''}”</div>` : ''}
    <div class="ip-text">${textHtml(t.text)}</div>
    ${popoverSourcesHtml(t, t.anchor?.el)}
    ${statusNote}
    <div class="ip-actions">
      ${fixable ? '<button type="button" class="btn sm primary" data-act="fix">Fix text <kbd>F</kbd></button>' : (state.raw ? '<button type="button" class="btn sm primary" data-act="edit-page">Edit page <kbd>F</kbd></button>' : '')}
      ${closed
        ? '<button type="button" class="btn sm ghost" data-act="reopen">Reopen <kbd>R</kbd></button>'
        : '<button type="button" class="btn sm ghost" data-act="resolve">Resolve <kbd>R</kbd></button><button type="button" class="btn sm ghost" data-act="ignore">Won\'t fix <kbd>W</kbd></button>'}
    </div>`;
}

function positionPopover() {
  const pop = $('issue-popover');
  if (pop.hidden || !state.popover) return;
  const anchorEl = state.popover.anchorEl;
  const pin = anchorEl.querySelector(':scope > .pin') || anchorEl;
  const rect = pin.getBoundingClientRect();
  const blockRect = anchorEl.getBoundingClientRect();
  const margin = 12;
  const headerBottom = 56 + 8;
  const popWidth = Math.min(360, window.innerWidth - margin * 2);
  const popHeight = pop.offsetHeight || 260;

  let left;
  if (window.innerWidth - rect.right >= popWidth + 16) {
    left = rect.right + 10;
  } else if (rect.left >= popWidth + 16) {
    left = rect.left - popWidth - 10;
  } else {
    left = Math.max(margin, Math.min(window.innerWidth - popWidth - margin, blockRect.right - popWidth));
  }

  let top = Math.max(headerBottom, rect.top - 8);
  if (top + popHeight > window.innerHeight - margin) {
    top = Math.max(headerBottom, window.innerHeight - popHeight - margin);
  }

  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(top)}px`;
}

function openPopover(anchorEl, threads, initialIndex = 0) {
  if (!threads.length) return;
  const sorted = [...threads].sort((a, b) => (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1) || a.rank - b.rank);
  const idx = Math.max(0, Math.min(initialIndex, sorted.length - 1));
  state.popover = { anchorEl, threads: sorted, index: idx };
  setActive(sorted[idx].id);
  renderPopoverContent();
  const pop = $('issue-popover');
  pop.hidden = false;
  positionPopover();
  pop.querySelector('.ip-actions .btn.primary, #ip-sources-toggle, .ip-close')?.focus({ preventScroll: true });
}

function closePopover() {
  const pop = $('issue-popover');
  if (pop && !pop.hidden) pop.hidden = true;
  state.popover = null;
  state.active = null;
  $('content').querySelectorAll('.thread-active').forEach((el) => el.classList.remove('thread-active'));
  $('content').querySelectorAll('.pin.active').forEach((p) => p.classList.remove('active'));
}

function focusThread(id) {
  const t = state.threads.find((x) => x.id === id);
  if (!t) { window.scrollTo(0, 0); return; }
  const sameAnchor = state.threads.filter((x) => x.anchor.el === t.anchor.el);
  const sorted = [...sameAnchor].sort((a, b) => (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1) || a.rank - b.rank);
  const idx = Math.max(0, sorted.findIndex((x) => x.id === id));

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  t.anchor.el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });

  t.anchor.els.forEach((el) => {
    el.classList.remove('pulse-once');
    void el.offsetWidth;
    el.classList.add('pulse-once');
    setTimeout(() => el.classList.remove('pulse-once'), 750);
  });

  setTimeout(() => {
    openPopover(t.anchor.el, sameAnchor, idx);
  }, reduced ? 0 : 180);
}

// ---------------------------------------------------------------- review actions

async function reviewAction(body) {
  const res = await authed('/api/review/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  state.review.state = res.state;
  updateCounts();
  if (res.warning) toast(res.warning);
  return res;
}

async function refreshThreads() {
  renderNav();
  markActive();
  if (state.drawerOpen) renderDrawer();
  const anchors = new Map(state.threads.map((t) => [t.id, t.anchor]));
  const sections = pageSections();
  state.threads = threadsAll()
    .filter((t) => t.page === pageRel())
    .map((t) => ({ ...t, anchor: anchors.get(t.id) || findAnchor(t, sections) }))
    .filter((t) => t.anchor)
    .sort((a, b) => a.anchor.el.offsetTop - b.anchor.el.offsetTop || a.rank - b.rank);
  renderThreads();
}

function threadById(id) {
  return state.threads.find((t) => t.id === id) || threadsAll().find((t) => t.id === id);
}

async function setThreadStatusWithFade(t, status, message) {
  const prevStatus = t.status;
  const fadingOut = status !== 'open' && t.anchor;
  if (fadingOut) {
    t.anchor.els.forEach((el) => el.classList.add('resolving'));
    t.anchor.el.querySelector(':scope > .pin')?.classList.add('resolving');
  }
  closePopover();
  const fadeMs = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200;
  try {
    const [res] = await Promise.all([
      reviewAction({ id: t.id, status }),
      fadingOut ? new Promise((r) => setTimeout(r, fadeMs)) : Promise.resolve(),
    ]);
    await refreshThreads();
    if (!res.warning) {
      toast(message, status !== 'open' ? {
        undo: async () => {
          await reviewAction({ id: t.id, status: prevStatus });
          await refreshThreads();
          toast('Restored issue');
        },
      } : undefined);
    }
  } catch (error) {
    t.anchor?.els.forEach((el) => el.classList.remove('resolving'));
    t.anchor?.el.querySelector(':scope > .pin')?.classList.remove('resolving');
    toast(error.message);
  }
}

async function onPopoverClick(e) {
  const sourcesToggle = e.target.closest('#ip-sources-toggle');
  if (sourcesToggle) {
    const list = $('ip-sources-list');
    const open = list.hidden;
    list.hidden = !open;
    sourcesToggle.setAttribute('aria-expanded', String(open));
    positionPopover();
    return;
  }

  const btn = e.target.closest('[data-act]');
  if (!btn || !state.popover) return;
  const { threads, index } = state.popover;
  const t = threads[index];
  if (!t) return;
  const act = btn.dataset.act;

  switch (act) {
    case 'close-popover':
      closePopover();
      break;
    case 'prev-issue':
      state.popover.index = (index - 1 + threads.length) % threads.length;
      setActive(threads[state.popover.index].id);
      renderPopoverContent();
      positionPopover();
      break;
    case 'next-issue':
      state.popover.index = (index + 1) % threads.length;
      setActive(threads[state.popover.index].id);
      renderPopoverContent();
      positionPopover();
      break;
    case 'copy':
      navigator.clipboard?.writeText(t.id).then(() => toast(`Copied ${t.id}`));
      break;
    case 'fix':
      closePopover();
      startInlineEdit(t.anchor.el);
      break;
    case 'edit-page':
      closePopover();
      openEditor();
      break;
    case 'resolve':
      btn.disabled = true;
      await setThreadStatusWithFade(t, 'resolved', 'Marked resolved');
      break;
    case 'ignore':
      btn.disabled = true;
      await setThreadStatusWithFade(t, 'ignored', "Marked won't fix");
      break;
    case 'reopen':
      btn.disabled = true;
      await setThreadStatusWithFade(t, 'open', 'Reopened issue');
      break;
  }
}

function onContentReviewClick(e) {
  if (!isReview()) return;
  const pin = e.target.closest('.pin');
  if (pin) {
    e.preventDefault();
    e.stopPropagation();
    const el = pin.closest('.tok');
    if (state.popover && state.popover.anchorEl === el) {
      closePopover();
      return;
    }
    const ids = pin.dataset.ids.split(',');
    openPopover(el, state.threads.filter((t) => ids.includes(t.id)));
    return;
  }

  if (e.target.closest('a, button, .inline-editor')) return;
  const tok = e.target.closest('.tok.has-thread');
  if (tok && tok.dataset.threadIds) {
    e.preventDefault();
    const ids = tok.dataset.threadIds.split(',');
    const threads = state.threads.filter((t) => ids.includes(t.id));
    if (threads.length) openPopover(threads[0].anchor.el, threads);
  }
}

// ---------------------------------------------------------------- inline editing

/** Replaces one block (or a lead-in paragraph and its list) with an editor in place. */
function startInlineEdit(el) {
  if (!state.raw || !isReview()) return;
  if (state.inline && !cancelInlineEdit(true)) return;
  const group = el._group || [el];
  const indexes = group.map((g) => Number(g.dataset.tok));
  const from = Math.min(...indexes);
  const to = Math.max(...indexes);
  const segment = state.tokens.slice(from, to + 1).map((t) => t.raw).join('');
  const trail = segment.match(/\s*$/)[0];

  const box = document.createElement('div');
  box.className = 'inline-editor';
  box.innerHTML = `
    <div class="ie-head"><span><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> Editing block</span><span class="muted">Markdown · Ctrl+Enter to save · Esc to cancel</span></div>
    <textarea class="ie-input" spellcheck="true"></textarea>
    <div class="ie-preview-label">Preview</div>
    <div class="ie-preview prose"></div>
    <div class="ie-actions"><button type="button" class="btn" data-ie="cancel">Cancel</button><button type="button" class="btn primary" data-ie="save">Save change</button></div>`;
  const input = box.querySelector('.ie-input');
  const preview = box.querySelector('.ie-preview');
  input.value = segment.replace(/\s+$/, '');
  group[0].before(box);
  group.forEach((g) => (g.hidden = true));
  state.inline = { box, group, from, to, trail, original: input.value };

  const grow = () => { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight + 4, innerHeight * 0.6)}px`; };
  let timer;
  const update = () => { grow(); clearTimeout(timer); timer = setTimeout(() => { renderMarkdown(input.value, preview); runMermaid(preview); }, 200); };
  input.addEventListener('input', update);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); cancelInlineEdit(); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveInlineEdit(); }
  });
  box.querySelector('[data-ie=cancel]').onclick = () => cancelInlineEdit();
  box.querySelector('[data-ie=save]').onclick = saveInlineEdit;
  renderMarkdown(input.value, preview);
  runMermaid(preview);
  grow();
  box.scrollIntoView({ block: 'center', behavior: 'smooth' });
  input.focus({ preventScroll: true });
}

function cancelInlineEdit(ask = false) {
  const edit = state.inline;
  if (!edit) return true;
  const dirty = edit.box.querySelector('.ie-input').value !== edit.original;
  if (dirty && !confirm(ask ? 'Leave without saving this edit?' : 'Discard this edit?')) return false;
  edit.box.remove();
  edit.group.forEach((g) => (g.hidden = false));
  state.inline = null;
  return true;
}

async function saveInlineEdit() {
  const edit = state.inline;
  if (!edit) return;
  const value = edit.box.querySelector('.ie-input').value.replace(/\s+$/, '');
  if (value === edit.original) { cancelInlineEdit(); return; }
  const before = state.tokens.slice(0, edit.from).map((t) => t.raw).join('');
  const after = state.tokens.slice(edit.to + 1).map((t) => t.raw).join('');
  const content = before + value + edit.trail + after;
  const button = edit.box.querySelector('[data-ie=save]');
  button.disabled = true;
  button.textContent = 'Saving…';
  const y = scrollY;
  try {
    await saveContent(content);
    state.inline = null;
    state.params = {};
    await loadPage();
    window.scrollTo(0, y);
  } catch (error) {
    toast(error.message);
    button.disabled = false;
    button.textContent = 'Save change';
  }
}

async function saveContent(content) {
  const files = [{ path: filePath(), content, hash: state.hash }];
  if (state.source === 'confluence') {
    const xmlPath = filePath().replace(/\.md$/, '.xml');
    const xml = toConfluenceXml(content);
    if (xml) {
      try {
        const current = await api(`/api/file?path=${enc(xmlPath)}`);
        files.push({ path: xmlPath, content: `${xml}\n`, hash: current.hash });
      } catch {}
    }
  }
  const res = await authed('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  state.raw = content;
  state.hash = res.hashes[filePath()];
  state.data = await api('/api/manifest');
  await loadChanges();
  updateChangesButton();
  toast(res.warning || (res.commit ? 'Saved and committed' : 'Saved'));
}

// ---------------------------------------------------------------- page editor

function openEditor() {
  if (!state.raw) return;
  if (state.inline && !cancelInlineEdit(true)) return;
  closePopover();
  closeDrawer();
  state.editing = true;
  document.body.classList.add('editing');
  $('page').hidden = true;
  $('editor').hidden = false;
  $('editor-path').textContent = filePath();
  $('editor-input').value = state.raw.replace(/^﻿/, '');
  $('editor-input').scrollTop = 0;
  $('editor-preview').scrollTop = 0;
  const defaultPane = matchMedia('(max-width: 900px)').matches ? 'write' : 'split';
  setEditorPane(defaultPane);
  renderMarkdown($('editor-input').value, $('editor-preview'));
  runMermaid($('editor-preview'));
  updateEditorDirty();
  window.scrollTo(0, 0);
  $('editor-input').setSelectionRange(0, 0);
  $('editor-input').focus({ preventScroll: true });
}

function closeEditor() {
  state.editing = false;
  document.body.classList.remove('editing');
  $('editor').hidden = true;
  $('page').hidden = false;
}

function setEditorPane(pane) {
  $('editor-body').dataset.pane = pane;
  document.querySelectorAll('#editor-tabs button').forEach((b) => {
    const on = b.dataset.pane === pane;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  if (pane === 'preview' || pane === 'split') {
    renderMarkdown($('editor-input').value, $('editor-preview'));
    runMermaid($('editor-preview'));
  }
}

const isDirty = () => state.editing && $('editor-input').value !== state.raw.replace(/^﻿/, '');

function updateEditorDirty() {
  const dirty = isDirty();
  $('editor-dirty').hidden = !dirty;
  $('save-btn').disabled = !dirty;
}

function applyEditorFormat(fmt) {
  const input = $('editor-input');
  const val = input.value;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const sel = val.slice(start, end);

  if (fmt === 'bold') {
    const text = sel || 'bold text';
    input.setRangeText(`**${text}**`, start, end, 'select');
    if (!sel) input.setSelectionRange(start + 2, start + 2 + text.length);
  } else if (fmt === 'link') {
    const label = sel || 'link text';
    const inserted = `[${label}](url)`;
    input.setRangeText(inserted, start, end, 'end');
    const urlStart = start + label.length + 3;
    input.setSelectionRange(urlStart, urlStart + 3);
  } else if (fmt === 'heading') {
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEndIdx = val.indexOf('\n', start);
    const lineEnd = lineEndIdx === -1 ? val.length : lineEndIdx;
    const line = val.slice(lineStart, lineEnd);
    const nextLine = line.startsWith('## ') ? line.slice(3) : `## ${line.replace(/^#+\s*/, '')}`;
    input.setRangeText(nextLine, lineStart, lineEnd, 'end');
  } else if (fmt === 'list') {
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const block = val.slice(lineStart, end);
    const lines = block.split('\n').map((l) => (l.startsWith('- ') ? l : `- ${l}`));
    input.setRangeText(lines.join('\n'), lineStart, end, 'end');
  } else if (fmt === 'table') {
    const prefix = start > 0 && val[start - 1] !== '\n' ? '\n\n' : '';
    const table = `${prefix}| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Value | Value | Value |\n`;
    input.setRangeText(table, start, end, 'end');
  }

  input.dispatchEvent(new Event('input'));
  input.focus();
}

function leaveEditor() {
  if (isDirty() && !confirm('Discard unsaved changes?')) {
    history.replaceState(null, '', linkTo(state.source, state.space, state.path));
    return false;
  }
  closeEditor();
  return true;
}

async function saveEditor() {
  if (!isDirty()) return;
  $('save-btn').disabled = true;
  $('save-btn').textContent = 'Saving…';
  try {
    await saveContent($('editor-input').value);
    closeEditor();
    renderNav();
    await loadPage();
  } catch (error) {
    toast(error.message);
    $('save-btn').disabled = !isDirty();
  } finally {
    $('save-btn').textContent = 'Save';
  }
}

// ---------------------------------------------------------------- issues drawer

function initDrawerFilters() {
  const kindSel = $('dash-kind');
  if (!kindSel || kindSel.options.length) return;
  kindSel.innerHTML = `<option value="all">All types</option>${Object.values(KINDS).map((k) => `<option value="${k.key}">${esc(k.label)}</option>`).join('')}`;
  $('dash-q').value = state.dash.q;
  $('dash-space').value = state.dash.space;
  $('dash-kind').value = state.dash.kind;
  $('dash-status').value = state.dash.status;
}

function openDrawer() {
  if (!isReview()) return;
  closePopover();
  closeSidebar();
  initDrawerFilters();
  state.drawerOpen = true;
  $('drawer-backdrop').hidden = false;
  $('issues-drawer').hidden = false;
  requestAnimationFrame(() => $('issues-drawer').classList.add('open'));
  document.body.classList.add('drawer-open');
  $('issues-btn')?.setAttribute('aria-expanded', 'true');
  renderDrawer();
  $('dash-q')?.focus({ preventScroll: true });
}

function closeDrawer() {
  if (!state.drawerOpen) return;
  state.drawerOpen = false;
  $('issues-drawer').classList.remove('open');
  $('issues-drawer').hidden = true;
  $('drawer-backdrop').hidden = true;
  document.body.classList.remove('drawer-open');
  $('issues-btn')?.setAttribute('aria-expanded', 'false');
  if (location.hash.startsWith('#/review')) {
    history.replaceState(null, '', linkTo(state.source, state.space, state.path));
  }
}

function renderDrawer() {
  if (!state.drawerOpen || !$('dash-list')) return;
  const all = threadsAll();
  const totalOpen = all.filter((t) => t.status === 'open').length;
  const q = state.dash.q.trim().toLowerCase();
  const curRel = pageRel();

  const items = all
    .filter((t) => state.dash.status === 'all' || t.status === state.dash.status)
    .filter((t) => state.dash.kind === 'all' || t.kind === state.dash.kind)
    .filter((t) => {
      if (state.dash.space === 'all') return true;
      if (state.dash.space === 'current') return curRel && t.page === curRel;
      return t.page.startsWith(`${state.dash.space}/`);
    })
    .filter((t) => !q || [t.text, t.published, t.section, t.page, pageTitleOf(t.page || ''), t.id, ...(t.sources || []).map((s) => s.where)]
      .join(' ').toLowerCase().includes(q))
    .sort((a, b) => (a.page.startsWith('user/') ? 0 : 1) - (b.page.startsWith('user/') ? 0 : 1) || pageTitleOf(a.page || '').localeCompare(pageTitleOf(b.page || '')) || a.rank - b.rank);

  $('drawer-summary').textContent = `${items.length} shown · ${totalOpen} open`;

  if (!items.length) {
    $('dash-list').innerHTML = '<div class="empty-state small"><h3>Nothing matches</h3><p class="muted">Try adjusting the filters above.</p></div>';
    return;
  }

  const openByPage = openCounts();
  const groups = new Map();
  for (const t of items) {
    const key = t.page || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }

  $('dash-list').innerHTML = [...groups].map(([page, threads]) => {
    const [spaceId] = page.split('/');
    const title = page ? pageTitleOf(page) : 'Not on a page';
    const prefix = page ? (spaceId === 'user' ? 'User Guide' : 'Developer') : 'Inputs';
    const openCount = page ? (openByPage.get(page) || 0) : threads.filter((t) => t.status === 'open').length;
    const isExpanded = state.drawerExpanded.has(page);
    return `<section class="drawer-group${isExpanded ? ' open' : ''}" data-page="${esc(page)}">
      <button type="button" class="drawer-group-btn" aria-expanded="${isExpanded ? 'true' : 'false'}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        <span class="drawer-group-title">${esc(title)} <span class="muted small">· ${esc(prefix)}</span></span>
        <span class="drawer-group-count">${openCount} open</span>
      </button>
      <div class="drawer-group-panel">
        <div class="drawer-group-inner">
          ${threads.map((t) => `
            <button type="button" class="drawer-item" data-id="${esc(t.id)}" data-page="${esc(t.page)}">
              <div class="drawer-item-top">
                <span class="drawer-item-kind">${esc(t.kindLabel)}</span>
                <span class="drawer-item-id">${esc(t.id)}</span>
                <span class="drawer-item-status">${esc(STATUS_LABEL[t.status])}</span>
              </div>
              <div class="drawer-item-text">${esc(t.text)}</div>
            </button>`).join('')}
        </div>
      </div>
    </section>`;
  }).join('');
}

// ---------------------------------------------------------------- search command palette

let hits = [];
let hitIndex = 0;

function openSearch() {
  $('search-modal').hidden = false;
  document.body.classList.add('modal-open');
  $('search-input').value = '';
  $('search-results').innerHTML = '<div class="no-hits">Type to search page titles, headings and text.</div>';
  $('search-input').focus();
}

function closeSearch() {
  $('search-modal').hidden = true;
  if ($('lightbox-modal').hidden) document.body.classList.remove('modal-open');
}

function search(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) { $('search-results').innerHTML = ''; return; }
  hits = state.data.index.map((d) => {
    if (!d.space.startsWith(`${state.source}/`)) return null;
    const title = d.title.toLowerCase();
    const heads = d.headings.join(' ').toLowerCase();
    const text = d.text.toLowerCase();
    let score = 0;
    for (const t of terms) {
      const s = (title.includes(t) ? 10 : 0) + (heads.includes(t) ? 4 : 0) + (text.includes(t) ? 1 : 0);
      if (!s) return null;
      score += s;
    }
    if (d.space === spaceKey()) score += 2;
    return { ...d, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 20);

  if (!hits.length) { $('search-results').innerHTML = `<div class="no-hits">No results for “${esc(q)}”</div>`; return; }
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const mark = (s) => esc(s).replace(re, '<mark>$1</mark>');
  hitIndex = 0;
  $('search-results').innerHTML = hits.map((h, i) => {
    const pos = h.text.toLowerCase().indexOf(terms[0]);
    const start = Math.max(0, pos - 60);
    const snippet = h.text.slice(start, start + 180);
    const [src, sp] = h.space.split('/');
    const where = [state.data.spaces[h.space].title, h.section].filter(Boolean).join(' › ');
    return `<a class="hit${i ? '' : ' active'}" href="${linkTo(src, sp, h.path)}">
      <div class="hit-where">${esc(where)}</div>
      <div class="hit-title">${mark(h.title)}</div>
      <div class="hit-text">${mark(snippet)}</div></a>`;
  }).join('');
}

function moveHit(d) {
  const els = $('search-results').querySelectorAll('.hit');
  if (!els.length) return;
  hitIndex = (hitIndex + d + els.length) % els.length;
  els.forEach((el, i) => el.classList.toggle('active', i === hitIndex));
  els[hitIndex].scrollIntoView({ block: 'nearest' });
}

// ---------------------------------------------------------------- menu, downloads, theme

function renderMoreMenu() {
  const srcName = SOURCE_LABEL[state.source];
  const onPage = state.view === 'doc' && !!state.raw;
  $('more-dynamic').innerHTML = `
    <div class="menu-section">
      <div class="menu-label">Download</div>
      ${onPage ? '<button type="button" class="menu-action" data-menu="page" role="menuitem"><span>This page (.md)</span></button>' : ''}
      ${onPage && state.source === 'confluence' ? '<button type="button" class="menu-action" data-menu="xml" role="menuitem"><span>This page (.xml)</span></button>' : ''}
      <a class="menu-action" href="/api/download?scope=${spaceKey()}" role="menuitem"><span>${srcName} · ${esc(space().title)} (.zip)</span></a>
      <a class="menu-action" href="/api/download?scope=${state.source}" role="menuitem"><span>All ${srcName} docs (.zip)</span></a>
      <a class="menu-action" href="/api/download?scope=all" role="menuitem"><span>Everything (.zip)</span></a>
    </div>
    ${isReview() ? `<div class="menu-section"><div class="menu-label">Signed in as ${esc(getAuthor() || 'Reviewer')}</div><button type="button" class="menu-action" data-menu="signout" role="menuitem"><span>Sign out</span></button></div>` : ''}`;
}

async function downloadFile(path) {
  const { content } = await api(`/api/file?path=${enc(path)}`);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = path.split('/').pop();
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const isDark = () => document.documentElement.dataset.theme === 'dark';
function applyTheme(theme, { persist = true } = {}) {
  document.documentElement.dataset.theme = theme;
  if (persist) store.set('localStorage', 'theme', theme);
  $('hl-light').disabled = theme === 'dark';
  $('hl-dark').disabled = theme !== 'dark';
  $('theme-btn')?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

function closeMenu() {
  $('more-menu').classList.remove('open');
  $('more-btn').setAttribute('aria-expanded', 'false');
}

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('backdrop').classList.remove('open');
  $('menu-btn')?.setAttribute('aria-expanded', 'false');
}

function toast(msg, opts = {}) {
  const el = $('toast');
  el.innerHTML = '';
  const span = document.createElement('span');
  span.textContent = msg;
  el.append(span);
  if (typeof opts.undo === 'function') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-undo';
    btn.textContent = 'Undo';
    btn.onclick = async () => {
      el.hidden = true;
      clearTimeout(toast.t);
      try { await opts.undo(); } catch (err) { toast(err.message); }
    };
    el.append(btn);
  }
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.hidden = true; }, opts.undo ? 6500 : 4500);
}

// ---------------------------------------------------------------- events

function bind() {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
  if ($('search-kbd')) $('search-kbd').textContent = isMac ? '⌘K' : 'Ctrl K';

  document.querySelectorAll('#source-switch button').forEach((b) => (b.onclick = () => {
    closeMenu();
    go(b.dataset.source, state.space, state.view === 'doc' ? state.path : '');
  }));
  document.querySelectorAll('#space-tabs button').forEach((b) => (b.onclick = () => go(state.source, b.dataset.space, '')));
  document.querySelectorAll('#mode-switch button').forEach((b) => (b.onclick = () => {
    closeMenu();
    setMode(b.dataset.mode);
  }));

  $('theme-btn').onclick = () => {
    applyTheme(isDark() ? 'light' : 'dark', { persist: true });
    rerenderDiagrams();
  };

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (store.get('localStorage', 'theme')) return;
    applyTheme(e.matches ? 'dark' : 'light', { persist: false });
    rerenderDiagrams();
  });

  $('nav').addEventListener('click', (e) => {
    const head = e.target.closest('.nav-head');
    if (!head) return;
    const group = head.parentElement;
    group.classList.toggle('closed');
    head.setAttribute('aria-expanded', String(!group.classList.contains('closed')));
    saveOpenGroups();
  });

  $('menu-btn').onclick = () => {
    const opening = !$('sidebar').classList.contains('open');
    $('sidebar').classList.toggle('open', opening);
    $('backdrop').classList.toggle('open', opening);
    $('menu-btn').setAttribute('aria-expanded', String(opening));
  };
  $('backdrop').onclick = closeSidebar;

  $('content').addEventListener('click', onContentClick);
  $('content').addEventListener('click', onContentReviewClick);
  $('toc-list').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    scrollToTarget(a.dataset.id);
  });

  // Anchored issue popover & outside click dismiss
  $('issue-popover').addEventListener('click', onPopoverClick);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) closeMenu();
    if (state.popover && !e.target.closest('#issue-popover, .pin, .tok.has-thread')) {
      closePopover();
    }
  });

  // Page header issue summary opens drawer filtered to current page
  $('page-issues').onclick = () => {
    state.dash.space = 'current';
    if ($('dash-space')) $('dash-space').value = 'current';
    openDrawer();
  };
  $('page-issues').onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      $('page-issues').click();
    }
  };

  // Issues drawer events
  $('issues-btn').onclick = () => (state.drawerOpen ? closeDrawer() : openDrawer());
  $('drawer-close').onclick = closeDrawer;
  $('drawer-backdrop').onclick = closeDrawer;
  $('dash-q').oninput = (e) => { state.dash.q = e.target.value; renderDrawer(); };
  $('dash-space').onchange = (e) => { state.dash.space = e.target.value; renderDrawer(); };
  $('dash-kind').onchange = (e) => { state.dash.kind = e.target.value; renderDrawer(); };
  $('dash-status').onchange = (e) => { state.dash.status = e.target.value; renderDrawer(); };
  $('dash-list').addEventListener('click', (e) => {
    const groupBtn = e.target.closest('.drawer-group-btn');
    if (groupBtn) {
      const group = groupBtn.closest('.drawer-group');
      const key = group.dataset.page;
      const opening = !group.classList.contains('open');
      group.classList.toggle('open', opening);
      groupBtn.setAttribute('aria-expanded', String(opening));
      if (opening) state.drawerExpanded.add(key);
      else state.drawerExpanded.delete(key);
      return;
    }
    const item = e.target.closest('.drawer-item');
    if (!item) return;
    const id = item.dataset.id;
    const page = item.dataset.page;
    closeDrawer();
    if (!page) { toast('This item is not attached to a published page.'); return; }
    if (page === pageRel()) {
      focusThread(id);
    } else {
      const [sp, ...rest] = page.split('/');
      go(state.source, sp, rest.join('/'), { t: id });
    }
  });

  $('more-btn').onclick = (e) => {
    e.stopPropagation();
    const opening = !$('more-menu').classList.contains('open');
    if (opening) renderMoreMenu();
    $('more-menu').classList.toggle('open', opening);
    $('more-btn').setAttribute('aria-expanded', String(opening));
  };
  $('more-menu').onclick = (e) => {
    const item = e.target.closest('[data-menu]');
    if (!item) return;
    const kind = item.dataset.menu;
    if (kind === 'page' || kind === 'xml') downloadFile(kind === 'xml' ? filePath().replace(/\.md$/, '.xml') : filePath()).catch((err) => toast(err.message));
    if (kind === 'signout') signOut();
    closeMenu();
  };

  $('search-btn').onclick = openSearch;
  $('search-modal').onclick = (e) => { if (e.target.id === 'search-modal' || e.target.closest('.hit')) closeSearch(); };
  $('search-input').oninput = (e) => search(e.target.value.trim());
  $('search-input').onkeydown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveHit(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveHit(-1); }
    if (e.key === 'Enter') {
      const el = $('search-results').querySelectorAll('.hit')[hitIndex];
      if (el) { location.hash = el.getAttribute('href'); closeSearch(); }
    }
  };

  $('lightbox-close').onclick = closeLightbox;
  $('lightbox-modal').onclick = (e) => { if (e.target.id === 'lightbox-modal') closeLightbox(); };
  $('lightbox-zoom-in').onclick = () => setLightboxZoom(lbView.scale * 1.25);
  $('lightbox-zoom-out').onclick = () => setLightboxZoom(lbView.scale / 1.25);
  $('lightbox-zoom-reset').onclick = resetLightboxView;

  const lbBody = $('lightbox-body');
  lbBody.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setLightboxZoom(lbView.scale * factor);
  }, { passive: false });
  lbBody.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    lbView.dragging = true;
    lbView.startX = e.clientX - lbView.x;
    lbView.startY = e.clientY - lbView.y;
    lbBody.classList.add('panning');
    lbBody.setPointerCapture?.(e.pointerId);
  });
  lbBody.addEventListener('pointermove', (e) => {
    if (!lbView.dragging) return;
    lbView.x = e.clientX - lbView.startX;
    lbView.y = e.clientY - lbView.startY;
    updateLightboxTransform();
  });
  const endPan = () => {
    if (!lbView.dragging) return;
    lbView.dragging = false;
    lbBody.classList.remove('panning');
  };
  lbBody.addEventListener('pointerup', endPan);
  lbBody.addEventListener('pointercancel', endPan);
  lbBody.addEventListener('dblclick', () => (lbView.scale === 1 && lbView.x === 0 && lbView.y === 0 ? setLightboxZoom(1.6) : resetLightboxView()));

  // Focus-mode editor events: dirty state, formatting toolbar, split scroll sync
  $('edit-btn').onclick = openEditor;
  $('cancel-btn').onclick = () => { if (!isDirty() || confirm('Discard unsaved changes?')) closeEditor(); };
  $('save-btn').onclick = saveEditor;
  $('editor-tabs').onclick = (e) => { const b = e.target.closest('button'); if (b) setEditorPane(b.dataset.pane); };
  $('editor-toolbar').onclick = (e) => {
    const btn = e.target.closest('button[data-fmt]');
    if (btn) applyEditorFormat(btn.dataset.fmt);
  };

  let timer;
  const editorInput = $('editor-input');
  const editorPreview = $('editor-preview');
  editorInput.oninput = () => {
    updateEditorDirty();
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderMarkdown(editorInput.value, editorPreview);
      runMermaid(editorPreview);
    }, 240);
  };
  editorInput.onkeydown = (e) => {
    if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '  '); }
  };

  let syncingFrom = null;
  let syncRelease;
  const syncScroll = (src, dst, name) => {
    if (syncingFrom && syncingFrom !== name) return;
    if ($('editor-body').dataset.pane !== 'split') return;
    const maxSrc = src.scrollHeight - src.clientHeight;
    const maxDst = dst.scrollHeight - dst.clientHeight;
    if (maxSrc <= 0 || maxDst <= 0) return;
    syncingFrom = name;
    dst.scrollTop = (src.scrollTop / maxSrc) * maxDst;
    clearTimeout(syncRelease);
    syncRelease = setTimeout(() => { syncingFrom = null; }, 50);
  };
  editorInput.addEventListener('scroll', () => syncScroll(editorInput, editorPreview, 'input'));
  editorPreview.addEventListener('scroll', () => syncScroll(editorPreview, editorInput, 'preview'));

  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (mod && e.key.toLowerCase() === 's' && state.editing) {
      e.preventDefault();
      if (isDirty() && !$('save-btn').disabled) saveEditor();
    }
    if (e.key === 'Escape') {
      closePopover();
      closeDrawer();
      closeSearch();
      closeLightbox();
      closeSidebar();
      closeMenu();
    }
    if (!$('lightbox-modal').hidden && !typing && !mod && !e.altKey) {
      if (e.key === '+' || e.key === '=') { e.preventDefault(); setLightboxZoom(lbView.scale * 1.25); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); setLightboxZoom(lbView.scale / 1.25); }
      else if (e.key === '0') { e.preventDefault(); resetLightboxView(); }
    }
    if (state.popover && !typing && !mod && !e.altKey) {
      const k = e.key.toLowerCase();
      if (k === 'f') {
        e.preventDefault();
        ($('issue-popover').querySelector('[data-act="fix"]') || $('issue-popover').querySelector('[data-act="edit-page"]'))?.click();
      } else if (k === 'r') {
        e.preventDefault();
        ($('issue-popover').querySelector('[data-act="resolve"]') || $('issue-popover').querySelector('[data-act="reopen"]'))?.click();
      } else if (k === 'w') {
        e.preventDefault();
        $('issue-popover').querySelector('[data-act="ignore"]')?.click();
      } else if (e.key === 'ArrowLeft') {
        $('issue-popover').querySelector('[data-act="prev-issue"]')?.click();
      } else if (e.key === 'ArrowRight') {
        $('issue-popover').querySelector('[data-act="next-issue"]')?.click();
      }
    }
    if (e.key === '/' && !state.editing && !typing) { e.preventDefault(); openSearch(); }
  });

  addEventListener('scroll', () => { if (state.popover) positionPopover(); }, { passive: true });
  addEventListener('resize', () => {
    updateTabsIndicator();
    if (state.popover) positionPopover();
  });
  addEventListener('beforeunload', (e) => { if (isDirty() || state.inline) e.preventDefault(); });
  addEventListener('hashchange', route);
}

// ---------------------------------------------------------------- start

(async () => {
  const savedTheme = store.get('localStorage', 'theme');
  applyTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'), { persist: false });
  bind();
  try {
    state.data = await api('/api/manifest');
  } catch {
    $('content').innerHTML = '<div class="empty-state"><h1>The documentation server is not running</h1><p class="muted">Start it with <code>npm start</code>.</p></div>';
    return;
  }
  state.showChanges = store.get('localStorage', 'changes') === '1';
  await loadChanges();
  updateChangesButton();
  $('changes-btn').onclick = () => {
    setShowChanges(!state.showChanges);
    closeMenu();
  };
  if (store.get('localStorage', 'mode') === 'review' && getPassword()) {
    try { await loadReview(); state.mode = 'review'; } catch { state.mode = 'reader'; }
  }
  route();
})();
