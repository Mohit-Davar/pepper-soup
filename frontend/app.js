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
  sourcesFor: null,
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

// ---------------------------------------------------------------- markdown

const PURIFY = {
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|confluence-link):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};
marked.setOptions({ gfm: true });

/**
 * Renders markdown. With `blocks`, every top-level block becomes its own
 * `.tok` element that remembers its token index, so review mode can pin
 * review items to it and edit it in place.
 */
function renderMarkdown(md, target, { blocks = false } = {}) {
  const body = md.replace(/^﻿/, '');
  target.innerHTML = '';
  if (!blocks) {
    target.innerHTML = DOMPurify.sanitize(marked.parse(body.replace(/<!--[\s\S]*?-->/g, '')), PURIFY);
    enhance(target);
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
  enhance(target);
  return tokens;
}

function enhance(target) {
  target.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    if (code.classList.contains('language-mermaid')) {
      const box = document.createElement('div');
      box.className = 'diagram mermaid';
      box.textContent = code.textContent;
      pre.replaceWith(box);
      return;
    }
    try { hljs.highlightElement(code); } catch {}
    const wrap = document.createElement('div');
    wrap.className = 'code';
    const copy = document.createElement('button');
    copy.className = 'copy';
    copy.type = 'button';
    copy.textContent = 'Copy';
    copy.onclick = () => navigator.clipboard.writeText(code.textContent).then(() => {
      copy.textContent = 'Copied';
      setTimeout(() => (copy.textContent = 'Copy'), 1500);
    });
    pre.replaceWith(wrap);
    wrap.append(pre, copy);
  });

  target.querySelectorAll('table').forEach((table) => {
    const wrap = document.createElement('div');
    wrap.className = 'table';
    table.replaceWith(wrap);
    wrap.append(table);
  });

  const used = {};
  target.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
    let id = h.textContent.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-') || 'section';
    if (used[id]) id += `-${used[id]++}`; else used[id] = 1;
    h.id = id;
  });
}

async function runMermaid(target) {
  const nodes = target.querySelectorAll('.mermaid');
  if (!nodes.length) return;
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: isDark() ? 'dark' : 'neutral', fontFamily: 'Inter' });
  try { await mermaid.run({ nodes, suppressErrors: true }); } catch {}
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

async function route() {
  if (state.editing && !leaveEditor()) return;
  if (state.inline && !cancelInlineEdit(true)) return;
  closeSheet();
  closeSidebar();
  const { parts, params } = parseHash();

  if (parts[0] === 'review') {
    if (!isReview()) {
      const ok = await requireReview();
      if (!ok) { history.replaceState(null, '', linkTo(state.source, state.space, '')); return route(); }
    }
    updateHeader();
    renderNav();
    showDashboard();
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

function updateHeader() {
  document.documentElement.dataset.source = state.source;
  document.body.classList.toggle('mode-review', isReview());
  document.querySelectorAll('#source-switch button').forEach((b) => b.classList.toggle('active', b.dataset.source === state.source));
  document.querySelectorAll('#space-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.space === state.space && state.view !== 'dashboard'));
  document.querySelectorAll('#mode-switch button').forEach((b) => b.classList.toggle('active', b.dataset.mode === (isReview() ? 'review' : 'reader')));
  $('review-link').classList.toggle('active', state.view === 'dashboard');
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

function renderNav() {
  const s = space();
  state.pages = [{ title: 'Overview', path: '', section: '' }];
  state.nodeByPath = new Map();
  state.parentOf = new Map();
  const counts = isReview() ? openCounts() : new Map();
  const badge = (path) => {
    const n = counts.get(`${state.space}/${path}`);
    return n ? `<span class="nav-badge" title="${n} open">${n}</span>` : '';
  };
  const groupCount = (node) => node.children.reduce((sum, child) => sum + (child.children.length ? groupCount(child) : counts.get(`${state.space}/${child.path}`) || 0), 0);

  const walk = (nodes, parent) => nodes.map((node) => {
    state.nodeByPath.set(node.path, node);
    if (parent) state.parentOf.set(node.path, parent);
    if (node.children.length) {
      const inner = walk(node.children, node);
      const n = groupCount(node);
      return `<div class="nav-group closed" data-path="${esc(node.path)}">
        <button class="nav-head" type="button" aria-expanded="false"><span>${esc(node.title)}</span>${n ? `<span class="nav-badge">${n}</span>` : ''}<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>
        <div class="nav-pages">${inner}</div></div>`;
    }
    state.pages.push({ ...node, section: parent?.title || '' });
    const edited = state.showChanges && state.changes.has(`${s.base}/${node.path}`);
    return `<a class="nav-link" href="${linkTo(state.source, state.space, node.path)}" data-path="${esc(node.path)}"><span>${esc(node.title)}</span>${edited ? '<i class="nav-chg" title="Edited"></i>' : ''}${badge(node.path)}</a>`;
  }).join('');

  $('nav').innerHTML = `
    <a class="nav-link nav-overview" href="${linkTo(state.source, state.space, '')}" data-path="">
      <svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg><span>Overview</span></a>
    ${walk(s.tree, null)}`;
  if ($('filter').value) filterNav($('filter').value.trim());
}

function markActive() {
  document.querySelectorAll('.nav-link').forEach((a) => {
    const on = state.view === 'doc' && a.dataset.path === state.path;
    a.classList.toggle('active', on);
    if (on) {
      let group = a.closest('.nav-group');
      while (group) { group.classList.remove('closed'); group.querySelector('.nav-head')?.setAttribute('aria-expanded', 'true'); group = group.parentElement.closest('.nav-group'); }
      const sb = $('sidebar');
      const top = a.offsetTop - sb.offsetTop;
      if (top < sb.scrollTop || top > sb.scrollTop + sb.clientHeight - 60) sb.scrollTop = top - sb.clientHeight / 3;
    }
  });
  document.querySelectorAll('.nav-group').forEach((g) => {
    const on = state.view === 'doc' && g.dataset.path === state.path;
    g.classList.toggle('current', on);
    if (on) g.classList.remove('closed');
  });
}

function filterNav(q) {
  q = q.toLowerCase();
  const visit = (group) => {
    let any = false;
    const headHit = group.querySelector(':scope > .nav-head').textContent.toLowerCase().includes(q);
    group.querySelectorAll(':scope > .nav-pages > .nav-link, :scope > .nav-pages > .nav-group').forEach((child) => {
      const hit = child.classList.contains('nav-group') ? visit(child) : (!q || headHit || child.textContent.toLowerCase().includes(q));
      child.hidden = !hit;
      any = any || hit;
    });
    group.hidden = !!q && !any && !headHit;
    if (q) group.classList.remove('closed');
    return any || headHit;
  };
  document.querySelectorAll('#nav > .nav-group').forEach(visit);
}

// ---------------------------------------------------------------- pages

function showView(view) {
  state.view = view;
  $('page').hidden = view !== 'doc';
  $('dashboard').hidden = view !== 'dashboard';
  document.body.classList.toggle('view-dashboard', view === 'dashboard');
  if (view !== 'doc') $('threads-fab').hidden = true;
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
  $('changes-count').textContent = n;
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
    // a block that was reworded shows its word changes; anything else shows whole blocks
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
        state.tokens = renderMarkdown(state.raw, $('content'), { blocks: true });
      }
    } catch {
      if (token !== loadToken) return;
      $('content').innerHTML = `<div class="empty-state"><h1>This page is not published yet</h1>
        <p class="muted">No source describes it yet, so it was left out of the ${esc(SOURCE_LABEL[state.source])} output.</p>
        <a class="btn" href="${linkTo(state.source, state.space, '')}">Back to overview</a></div>`;
    }
  }

  const h1 = $('content').querySelector('h1');
  document.title = `${h1 ? h1.textContent : page?.title || space().title} · Pepper-Soup`;
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
  else if (state.params.a) document.getElementById(state.params.a)?.scrollIntoView();
  else window.scrollTo(0, 0);
}

function renderCrumbs(page, node) {
  const parts = [`<a href="${linkTo(state.source, state.space, '')}">${esc(space().title)}</a>`];
  const parent = state.parentOf.get(state.path);
  if (parent) parts.push(`<a href="${linkTo(state.source, state.space, parent.path)}">${esc(parent.title)}</a>`);
  if (state.path) parts.push(`<span>${esc(page?.title || node?.title || '')}</span>`);
  $('crumbs').innerHTML = `<span class="crumb-source">${esc(SOURCE_LABEL[state.source])}</span>${parts.join('<span class="sep">/</span>')}`;
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
      <a class="group-card-head" href="${linkTo(state.source, state.space, group.children.length ? group.path : group.path)}">
        <h3>${esc(group.title)}</h3>
        <span class="muted">${leaves.length} page${leaves.length === 1 ? '' : 's'}</span>
        ${issues ? `<span class="pill pill-open">${issues} open</span>` : ''}
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
        ${isReview() ? `<a href="#/review"><b>${spaceOpen}</b> open review items</a>` : ''}
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
      <div class="page-card-title">${esc(child.title)}${n ? `<span class="pill pill-open">${n} open</span>` : ''}</div>
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
  const heads = $('content').classList.contains('prose') ? [...$('content').querySelectorAll('h2, h3')] : [];
  $('toc').classList.toggle('empty', heads.length < 2);
  $('toc-list').innerHTML = heads.map((h) =>
    `<li><a href="#" data-id="${h.id}" class="${h.tagName === 'H3' ? 'sub' : ''}">${esc(h.textContent)}</a></li>`).join('');
  tocObserver?.disconnect();
  tocObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((e) => e.isIntersecting);
    if (!visible.length) return;
    const id = visible[0].target.id;
    document.querySelectorAll('#toc-list a').forEach((a) => a.classList.toggle('active', a.dataset.id === id));
  }, { rootMargin: '-80px 0px -70% 0px' });
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
  const a = e.target.closest('a');
  if (!a || a.closest('.card, .tok-tools')) return;
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
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const [file, anchor] = href.split('#');
  if (file.endsWith('.md')) {
    e.preventDefault();
    go(state.source, state.space, resolveRelative(file), anchor ? { a: anchor } : {});
  }
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
  }
  if (state.view === 'dashboard' && mode === 'reader') { go(state.source, state.space, ''); return; }
  updateHeader();
  renderNav();
  if (state.view === 'dashboard') showDashboard(); else await loadPage();
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
  $('rail').innerHTML = '';
  $('rail').style.minHeight = '';
  state.threads = [];
  state.active = null;
  state.sourcesFor = null;
  $('threads-fab').hidden = true;
  $('page-issues').hidden = true;
}

/** Splits the rendered page into sections: each h2 block and the blocks after it. */
function pageSections() {
  const sections = [];
  let current = null;
  for (const el of $('content').querySelectorAll(':scope > .tok')) {
    if (el.firstElementChild?.tagName === 'H2') {
      current = { title: el.firstElementChild.textContent, head: el, toks: [] };
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
      case 'diagram': return c.classList.contains('diagram');
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
    decorateBlocks();
  } else threads = [];
  state.threads = threads.sort((a, b) => a.anchor.el.offsetTop - b.anchor.el.offsetTop || a.rank - b.rank);
  renderThreads();
}

function decorateBlocks() {
  $('content').querySelectorAll(':scope > .tok').forEach((el) => {
    el.querySelector(':scope > .tok-tools')?.remove();
    if (el.firstElementChild?.tagName === 'H1') return;
    if (el._group && el._group[0] !== el) return;
    const facts = el._facts || [];
    const tools = document.createElement('div');
    tools.className = 'tok-tools';
    tools.innerHTML = `
      ${facts.length ? `<button type="button" data-tool="sources" title="Where this text comes from"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>${facts.length}</button>` : ''}
      <button type="button" data-tool="edit" title="Edit this block"><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>`;
    el.prepend(tools);
  });
}

// ---------------------------------------------------------------- threads: pins, rail, sheet

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

function sourcesHtml(sources) {
  if (!sources.length) return '';
  return `<details class="card-sources"><summary>${sources.length} source${sources.length === 1 ? '' : 's'}</summary>
    <ol>${sources.map((s) => `<li><div class="src-where">${esc(s.where)}</div>${s.quote ? `<blockquote>${esc(s.quote)}</blockquote>` : ''}</li>`).join('')}</ol></details>`;
}

/** One review item. `context` is where it shows: beside the text, in the phone sheet, or on the review list. */
function cardHtml(t, context = 'rail') {
  const closed = t.status !== 'open';
  const where = context !== 'rail'
    ? `<div class="card-where">${t.page ? `${esc(pageTitleOf(t.page))}${t.section ? ` <span class="sep">›</span> ${esc(t.section)}` : ''}` : esc(t.file || 'Not on a page')}${t.notPublished && t.page ? ' <span class="pill">Not published</span>' : ''}</div>`
    : '';
  const anchored = t.anchor ? t.anchor.exact : true;
  const fixable = (context === 'rail' || context === 'sheet') && t.anchor?.exact && state.raw;
  const statusNote = closed && t.by ? `<div class="status-note">${esc(STATUS_LABEL[t.status])} by ${esc(t.by)}, ${esc(relTime(t.at))}</div>` : '';

  return `<article class="card card-${t.kind} status-${t.status}${state.active === t.id ? ' active' : ''}" data-id="${esc(t.id)}" tabindex="0">
    <header class="card-head">
      <span class="kind kind-${t.kind}">${esc(t.kindLabel)}</span>
      <button type="button" class="card-id" data-act="copy" title="Copy id">${esc(t.id)}</button>
      <span class="status status-${t.status}">${esc(STATUS_LABEL[t.status])}</span>
    </header>
    ${where}
    ${t.published && (context !== 'rail' || !anchored) ? `<div class="card-quote">“${esc(mdText(t.published).slice(0, 220))}${t.published.length > 220 ? '…' : ''}”</div>` : ''}
    <div class="card-text">${textHtml(t.text)}</div>
    ${sourcesHtml(t.sources)}
    ${statusNote}
    <div class="card-actions">
      ${fixable ? '<button type="button" class="btn sm primary" data-act="fix">Fix text</button>' : ''}
      ${context === 'dash' && t.page && !t.notPublished ? '<button type="button" class="btn sm primary" data-act="open">Show on page</button>' : ''}
      ${closed
        ? '<button type="button" class="btn sm" data-act="reopen">Reopen</button>'
        : '<button type="button" class="btn sm" data-act="resolve">Resolve</button><button type="button" class="btn sm ghost" data-act="ignore">Won\'t fix</button>'}
    </div>
  </article>`;
}

function sourcesCardHtml(el) {
  const facts = el._facts || [];
  const where = (s) => [s.title, s.sheet && `sheet ${s.sheet}`, s.rows?.length && `rows ${s.rows.join(', ')}`, s.ticket].filter(Boolean).join(' · ');
  return `<article class="card card-evidence active" data-id="sources">
    <header class="card-head"><span class="kind kind-sources">Sources</span><span class="muted small">${facts.length} fact${facts.length === 1 ? '' : 's'}</span>
      <button type="button" class="icon-btn sm" data-act="close-sources" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></header>
    <ol class="facts">${facts.map((f) => `<li>
      <div class="fact-statement">${esc(f.statement)}</div>
      ${f.quote ? `<blockquote>${esc(f.quote)}</blockquote>` : ''}
      <div class="src-where">${esc(where(f.source))}${f.status && f.status !== 'confirmed' ? ` <span class="pill">${esc(f.status)}</span>` : ''}</div>
    </li>`).join('')}</ol>
  </article>`;
}

function renderThreads() {
  const content = $('content');
  content.querySelectorAll('.pin').forEach((p) => p.remove());
  content.querySelectorAll('.has-thread, .thread-active').forEach((el) => {
    el.classList.remove('has-thread', 'thread-active', ...[...el.classList].filter((c) => c.startsWith('hl-')));
  });

  const byAnchor = new Map();
  for (const t of state.threads) {
    if (!byAnchor.has(t.anchor.el)) byAnchor.set(t.anchor.el, []);
    byAnchor.get(t.anchor.el).push(t);
  }
  for (const [el, threads] of byAnchor) {
    const open = threads.filter((t) => t.status === 'open');
    const top = (open.length ? open : threads).reduce((a, b) => (a.rank <= b.rank ? a : b));
    const els = threads[0].anchor.els;
    if (open.length) els.forEach((x) => x.classList.add('has-thread', `hl-${top.kind}`));
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = `pin kind-${top.kind}${open.length ? '' : ' done'}`;
    pin.dataset.ids = threads.map((t) => t.id).join(',');
    pin.title = `${threads.length} review item${threads.length === 1 ? '' : 's'}`;
    pin.innerHTML = open.length ? `${open.length}` : '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
    el.append(pin);
  }

  const open = state.threads.filter((t) => t.status === 'open').length;
  $('page-issues').hidden = !state.threads.length;
  $('page-issues').innerHTML = state.threads.length
    ? `<span class="dot"></span>${open} open${state.threads.length > open ? ` · ${state.threads.length - open} closed` : ''}`
    : '';
  $('threads-fab').hidden = !state.threads.length;
  $('threads-fab-count').textContent = open;
  renderRail();
}

function renderRail() {
  const rail = $('rail');
  if (!isReview() || !isWide()) { rail.innerHTML = ''; return; }
  const items = state.threads.map((t) => cardHtml(t, 'rail'));
  if (state.sourcesFor) items.push(sourcesCardHtml(state.sourcesFor));
  rail.innerHTML = items.join('');
  layoutRail();
}

/** Places each card level with its block; the active card sits exactly beside it. */
function layoutRail() {
  const rail = $('rail');
  const cards = [...rail.querySelectorAll(':scope > .card')];
  if (!cards.length) { rail.style.minHeight = ''; return; }
  const railTop = rail.getBoundingClientRect().top;
  const anchorOf = (card) => {
    if (card.dataset.id === 'sources') return state.sourcesFor;
    return state.threads.find((t) => t.id === card.dataset.id)?.anchor.el;
  };
  const want = cards.map((card) => {
    const el = anchorOf(card);
    return el ? el.getBoundingClientRect().top - railTop : 0;
  });
  const order = cards.map((_, i) => i).sort((a, b) => want[a] - want[b]);
  const sorted = order.map((i) => ({ card: cards[i], want: want[i], h: cards[i].offsetHeight }));
  const gap = 10;
  let pivot = sorted.findIndex((c) => c.card.classList.contains('active'));
  if (pivot < 0) pivot = 0;
  sorted[pivot].top = sorted[pivot].want;
  for (let i = pivot + 1; i < sorted.length; i++) sorted[i].top = Math.max(sorted[i].want, sorted[i - 1].top + sorted[i - 1].h + gap);
  for (let i = pivot - 1; i >= 0; i--) sorted[i].top = Math.min(sorted[i].want, sorted[i + 1].top - sorted[i].h - gap);
  const shift = Math.min(0, ...sorted.map((c) => c.top));
  let bottom = 0;
  for (const c of sorted) {
    c.card.style.top = `${c.top - shift}px`;
    bottom = Math.max(bottom, c.top - shift + c.h);
  }
  rail.style.minHeight = `${bottom + 40}px`;
}

function setActive(id, { scroll = false } = {}) {
  state.active = id;
  $('content').querySelectorAll('.thread-active').forEach((el) => el.classList.remove('thread-active'));
  const t = state.threads.find((x) => x.id === id);
  if (t) t.anchor.els.forEach((el) => el.classList.add('thread-active'));
  document.querySelectorAll('#rail .card').forEach((c) => c.classList.toggle('active', c.dataset.id === id));
  layoutRail();
  if (scroll && t) t.anchor.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function focusThread(id) {
  const t = state.threads.find((x) => x.id === id);
  if (!t) { window.scrollTo(0, 0); return; }
  if (isWide()) setActive(id, { scroll: true });
  else {
    t.anchor.el.scrollIntoView({ block: 'center' });
    setActive(id);
    openSheet('Review', [t]);
  }
}

function openSheet(title, threads, extraHtml = '') {
  $('sheet-title').textContent = title;
  $('sheet-body').innerHTML = threads.map((t) => cardHtml(t, 'sheet')).join('') + extraHtml
    || '<p class="muted pad">Nothing to review on this page.</p>';
  $('sheet').hidden = false;
  $('sheet-backdrop').hidden = false;
  document.body.classList.add('sheet-open');
  $('sheet-body').querySelector('textarea')?.focus();
}

function closeSheet() {
  $('sheet').hidden = true;
  $('sheet-backdrop').hidden = true;
  document.body.classList.remove('sheet-open');
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

async function refreshThreads(keepActive = state.active) {
  renderNav();
  markActive();
  if (state.view === 'dashboard') { renderDashboardList(); return; }
  const anchors = new Map(state.threads.map((t) => [t.id, t.anchor]));
  const sections = pageSections();
  state.threads = threadsAll()
    .filter((t) => t.page === pageRel())
    .map((t) => ({ ...t, anchor: anchors.get(t.id) || findAnchor(t, sections) }))
    .filter((t) => t.anchor)
    .sort((a, b) => a.anchor.el.offsetTop - b.anchor.el.offsetTop || a.rank - b.rank);
  state.active = keepActive;
  renderThreads();
  if (!$('sheet').hidden) {
    const ids = [...$('sheet-body').querySelectorAll('.card')].map((c) => c.dataset.id);
    const shown = state.threads.filter((t) => ids.includes(t.id));
    if (shown.length) openSheet($('sheet-title').textContent, shown); else closeSheet();
  }
}

function threadById(id) {
  return state.threads.find((t) => t.id === id) || threadsAll().find((t) => t.id === id);
}

async function onCardAction(e) {
  const button = e.target.closest('[data-act]');
  const card = e.target.closest('.card');
  if (!card) return;
  if (!button) {
    if (card.closest('#rail') && card.dataset.id !== 'sources' && state.active !== card.dataset.id) setActive(card.dataset.id);
    return;
  }
  const id = card.dataset.id;
  const act = button.dataset.act;
  const t = threadById(id);
  const setStatus = async (status, message) => {
    button.disabled = true;
    try { const res = await reviewAction({ id, status }); if (!res.warning) toast(message); await refreshThreads(); }
    catch (error) { toast(error.message); button.disabled = false; }
  };

  switch (act) {
    case 'copy':
      navigator.clipboard?.writeText(id).then(() => toast(`Copied ${id}`));
      break;
    case 'resolve': await setStatus('resolved', 'Marked resolved'); break;
    case 'reopen': await setStatus('open', 'Reopened'); break;
    case 'ignore': await setStatus('ignored', "Marked won't fix"); break;
    case 'fix':
      closeSheet();
      startInlineEdit(t.anchor.el);
      break;
    case 'open':
      go(state.source, t.page.split('/')[0], t.page.split('/').slice(1).join('/'), { t: id });
      break;
    case 'close-sources':
      state.sourcesFor = null;
      closeSheet();
      renderRail();
      break;
  }
}

function showSources(el) {
  el = (el._group || [el])[0];
  state.sourcesFor = el;
  if (isWide()) { renderRail(); return; }
  $('sheet-title').textContent = 'Sources';
  $('sheet-body').innerHTML = sourcesCardHtml(el);
  $('sheet').hidden = false;
  $('sheet-backdrop').hidden = false;
  document.body.classList.add('sheet-open');
}

function onContentReviewClick(e) {
  if (!isReview()) return;
  const tool = e.target.closest('[data-tool]');
  const pin = e.target.closest('.pin');
  if (tool) {
    e.preventDefault();
    const el = tool.closest('.tok');
    if (tool.dataset.tool === 'edit') startInlineEdit(el);
    if (tool.dataset.tool === 'sources') showSources(el);
    return;
  }
  if (pin) {
    e.preventDefault();
    const ids = pin.dataset.ids.split(',');
    if (isWide()) setActive(ids[0]);
    else openSheet(ids.length > 1 ? `${ids.length} review items` : 'Review', state.threads.filter((t) => ids.includes(t.id)));
    return;
  }
  const tok = e.target.closest('.tok');
  if (tok && !isWide() && !e.target.closest('a')) {
    $('content').querySelectorAll('.tok.selected').forEach((x) => x !== tok && x.classList.remove('selected'));
    tok.classList.toggle('selected');
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
  const update = () => { grow(); clearTimeout(timer); timer = setTimeout(() => { renderMarkdown(input.value, preview); runMermaid(preview); layoutRail(); }, 200); };
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
  layoutRail();
}

function cancelInlineEdit(ask = false) {
  const edit = state.inline;
  if (!edit) return true;
  const dirty = edit.box.querySelector('.ie-input').value !== edit.original;
  if (dirty && !confirm(ask ? 'Leave without saving this edit?' : 'Discard this edit?')) return false;
  edit.box.remove();
  edit.group.forEach((g) => (g.hidden = false));
  state.inline = null;
  layoutRail();
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
  state.editing = true;
  document.body.classList.add('editing');
  $('page').hidden = true;
  $('editor').hidden = false;
  $('editor-path').textContent = filePath();
  $('editor-input').value = state.raw.replace(/^﻿/, '');
  setEditorPane('write');
  renderMarkdown($('editor-input').value, $('editor-preview'));
  runMermaid($('editor-preview'));
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
  document.querySelectorAll('#editor-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.pane === pane));
  if (pane === 'preview') { renderMarkdown($('editor-input').value, $('editor-preview')); runMermaid($('editor-preview')); }
}

const isDirty = () => state.editing && $('editor-input').value !== state.raw.replace(/^﻿/, '');

function leaveEditor() {
  if (isDirty() && !confirm('Discard unsaved changes?')) {
    history.replaceState(null, '', linkTo(state.source, state.space, state.path));
    return false;
  }
  closeEditor();
  return true;
}

async function saveEditor() {
  $('save-btn').disabled = true;
  $('save-btn').textContent = 'Saving…';
  try {
    await saveContent($('editor-input').value);
    closeEditor();
    renderNav();
    await loadPage();
  } catch (error) {
    toast(error.message);
  } finally {
    $('save-btn').disabled = false;
    $('save-btn').textContent = 'Save';
  }
}

// ---------------------------------------------------------------- review dashboard

function showDashboard() {
  showView('dashboard');
  document.title = 'Review · Pepper-Soup';
  markActive();
  const all = threadsAll();
  const count = (fn) => all.filter(fn).length;
  const open = count((t) => t.status === 'open');
  const resolved = count((t) => t.status === 'resolved');
  const ignored = count((t) => t.status === 'ignored');
  const done = resolved + ignored;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const kindOptions = Object.values(KINDS).map((k) => `<option value="${k.key}">${esc(k.label)}</option>`).join('');

  $('dashboard').innerHTML = `
    <div class="dash">
      <header class="dash-head">
        <div>
          <div class="eyebrow">Review</div>
          <h1>Review items</h1>
          <p class="lead">Places where the docs need a person: the sources disagree, a check still fails after the automatic fixes, or a topic has no source. Fix the text on the page, then mark the item resolved.</p>
        </div>
      </header>
      <div class="stats">
        <div class="stat"><span>Open</span><b>${open}</b></div>
        <div class="stat"><span>Resolved</span><b>${resolved}</b></div>
        <div class="stat"><span>Won't fix</span><b>${ignored}</b></div>
        <div class="stat wide"><span>Progress</span><b>${pct}%</b><div class="bar"><i style="width:${pct}%"></i></div></div>
      </div>
      <div class="dash-filters">
        <input type="search" id="dash-q" placeholder="Search problems, pages, sources" value="${esc(state.dash.q)}">
        <select id="dash-kind" aria-label="Kind"><option value="all">All kinds</option>${kindOptions}</select>
        <select id="dash-space" aria-label="Space"><option value="all">All spaces</option><option value="user">User Guide</option><option value="developer">Developer Reference</option></select>
        <div class="seg" id="dash-status">
          ${['open', 'resolved', 'ignored', 'all'].map((s) => `<button type="button" data-status="${s}">${s === 'all' ? 'All' : STATUS_LABEL[s]}</button>`).join('')}
        </div>
      </div>
      <div id="dash-list"></div>
    </div>`;
  $('dash-kind').value = state.dash.kind;
  $('dash-space').value = state.dash.space;
  $('dash-q').oninput = (e) => { state.dash.q = e.target.value; renderDashboardList(); };
  $('dash-kind').onchange = (e) => { state.dash.kind = e.target.value; renderDashboardList(); };
  $('dash-space').onchange = (e) => { state.dash.space = e.target.value; renderDashboardList(); };
  $('dash-status').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    state.dash.status = b.dataset.status;
    renderDashboardList();
  };
  renderDashboardList();
  window.scrollTo(0, 0);
}

function renderDashboardList() {
  if (state.view !== 'dashboard' || !$('dash-list')) return;
  document.querySelectorAll('#dash-status button').forEach((b) => b.classList.toggle('active', b.dataset.status === state.dash.status));
  const q = state.dash.q.trim().toLowerCase();
  const items = threadsAll()
    .filter((t) => state.dash.status === 'all' || t.status === state.dash.status)
    .filter((t) => state.dash.kind === 'all' || t.kind === state.dash.kind)
    .filter((t) => state.dash.space === 'all' || t.page.startsWith(`${state.dash.space}/`))
    .filter((t) => !q || [t.text, t.published, t.section, t.page, pageTitleOf(t.page || ''), t.id, ...(t.sources || []).map((s) => s.where)]
      .join(' ').toLowerCase().includes(q))
    .sort((a, b) => (a.page.startsWith('user/') ? 0 : 1) - (b.page.startsWith('user/') ? 0 : 1) || pageTitleOf(a.page || '').localeCompare(pageTitleOf(b.page || '')) || a.rank - b.rank);

  if (!items.length) {
    $('dash-list').innerHTML = '<div class="empty-state small"><h3>Nothing here</h3><p class="muted">No review items match these filters.</p></div>';
    return;
  }
  const groups = new Map();
  for (const t of items) {
    const key = t.page || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  $('dash-list').innerHTML = [...groups].map(([page, threads]) => {
    const [spaceId] = page.split('/');
    const title = page ? pageTitleOf(page) : 'Not on a page';
    const href = page && !threads[0].notPublished ? linkTo(state.source, spaceId, page.split('/').slice(1).join('/')) : '';
    return `<section class="dash-group">
      <header><div><span class="muted small">${esc(page ? (spaceId === 'user' ? 'User Guide' : 'Developer Reference') : 'Inputs')}</span>
        <h2>${href ? `<a href="${href}">${esc(title)}</a>` : esc(title)}</h2></div><span class="pill">${threads.length}</span></header>
      <div class="dash-cards">${threads.map((t) => cardHtml(t, 'dash')).join('')}</div>
    </section>`;
  }).join('');
}

// ---------------------------------------------------------------- search

let hits = [];
let hitIndex = 0;

function openSearch() {
  $('search-modal').hidden = false;
  $('search-input').value = '';
  $('search-results').innerHTML = '<div class="no-hits">Type to search page titles, headings and text.</div>';
  $('search-input').focus();
}
function closeSearch() { $('search-modal').hidden = true; }

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
  $('more-menu').innerHTML = `
    <button type="button" data-menu="theme"><svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>${isDark() ? 'Light theme' : 'Dark theme'}</button>
    <hr>
    <div class="menu-label">Download</div>
    ${onPage ? '<button type="button" data-menu="page">This page (.md)</button>' : ''}
    ${onPage && state.source === 'confluence' ? '<button type="button" data-menu="xml">This page (.xml)</button>' : ''}
    <a href="/api/download?scope=${spaceKey()}">${srcName} · ${esc(space().title)} (.zip)</a>
    <a href="/api/download?scope=${state.source}">All ${srcName} docs (.zip)</a>
    <a href="/api/download?scope=all">Everything (.zip)</a>
    ${isReview() ? `<hr><div class="menu-label">Signed in as ${esc(getAuthor() || 'Reviewer')}</div><button type="button" data-menu="signout">Sign out</button>` : ''}`;
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
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  store.set('localStorage', 'theme', theme);
  $('hl-light').disabled = theme === 'dark';
  $('hl-dark').disabled = theme !== 'dark';
}

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('backdrop').classList.remove('open');
}

function toast(msg) {
  $('toast').textContent = msg;
  $('toast').hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => ($('toast').hidden = true), 4500);
}

// ---------------------------------------------------------------- events

function bind() {
  document.querySelectorAll('#source-switch button').forEach((b) => (b.onclick = () => go(b.dataset.source, state.space, state.view === 'doc' ? state.path : '')));
  document.querySelectorAll('#space-tabs button').forEach((b) => (b.onclick = () => go(state.source, b.dataset.space, '')));
  document.querySelectorAll('#mode-switch button').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));

  $('nav').addEventListener('click', (e) => {
    const head = e.target.closest('.nav-head');
    if (!head) return;
    const group = head.parentElement;
    group.classList.toggle('closed');
    head.setAttribute('aria-expanded', String(!group.classList.contains('closed')));
  });
  $('filter').oninput = (e) => filterNav(e.target.value.trim());
  $('menu-btn').onclick = () => { $('sidebar').classList.add('open'); $('backdrop').classList.add('open'); };
  $('backdrop').onclick = closeSidebar;

  $('content').addEventListener('click', onContentClick);
  $('content').addEventListener('click', onContentReviewClick);
  $('toc-list').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.id)?.scrollIntoView({ behavior: 'smooth' });
  });

  for (const host of [$('rail'), $('sheet-body'), $('dashboard')]) {
    host.addEventListener('click', onCardAction);
  }
  $('rail').addEventListener('toggle', () => layoutRail(), true);
  $('threads-fab').onclick = () => openSheet('Review on this page', state.threads);
  $('sheet-close').onclick = closeSheet;
  $('sheet-backdrop').onclick = closeSheet;

  $('more-btn').onclick = (e) => {
    e.stopPropagation();
    renderMoreMenu();
    $('more-menu').classList.toggle('open');
  };
  $('more-menu').onclick = (e) => {
    const kind = e.target.closest('[data-menu]')?.dataset.menu;
    if (kind === 'theme') {
      applyTheme(isDark() ? 'light' : 'dark');
      if (state.view === 'doc' && !state.editing) loadPage();
    }
    if (kind === 'page' || kind === 'xml') downloadFile(kind === 'xml' ? filePath().replace(/\.md$/, '.xml') : filePath()).catch((err) => toast(err.message));
    if (kind === 'signout') signOut();
    $('more-menu').classList.remove('open');
  };
  document.addEventListener('click', (e) => { if (!e.target.closest('.dropdown')) $('more-menu').classList.remove('open'); });

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

  $('edit-btn').onclick = openEditor;
  $('cancel-btn').onclick = () => { if (!isDirty() || confirm('Discard unsaved changes?')) closeEditor(); };
  $('save-btn').onclick = saveEditor;
  $('editor-tabs').onclick = (e) => { const b = e.target.closest('button'); if (b) setEditorPane(b.dataset.pane); };
  let timer;
  $('editor-input').oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { renderMarkdown($('editor-input').value, $('editor-preview')); runMermaid($('editor-preview')); }, 300);
  };
  $('editor-input').onkeydown = (e) => {
    if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '  '); }
  };

  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (mod && e.key.toLowerCase() === 's' && state.editing) { e.preventDefault(); saveEditor(); }
    if (e.key === 'Escape') { closeSearch(); closeSidebar(); closeSheet(); $('more-menu').classList.remove('open'); }
    if (e.key === '/' && !state.editing && !typing) { e.preventDefault(); openSearch(); }
  });

  let wide = isWide();
  addEventListener('resize', () => {
    if (wide !== isWide()) { wide = isWide(); if (isReview() && state.view === 'doc') { closeSheet(); renderRail(); } }
    else layoutRail();
  });
  new ResizeObserver(() => layoutRail()).observe($('content'));
  addEventListener('beforeunload', (e) => { if (isDirty() || state.inline) e.preventDefault(); });
  addEventListener('hashchange', route);
}

// ---------------------------------------------------------------- start

(async () => {
  applyTheme(isDark() ? 'dark' : 'light');
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
  $('changes-btn').onclick = () => setShowChanges(!state.showChanges);
  if (store.get('localStorage', 'mode') === 'review' && getPassword()) {
    try { await loadReview(); state.mode = 'review'; } catch { state.mode = 'reader'; }
  }
  route();
})();
