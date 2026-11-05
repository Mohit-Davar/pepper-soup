const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const state = {
  data: null,
  source: 'gitbook',
  space: 'user',
  path: '',
  raw: '',
  hash: '',
  pages: [],
  editing: false,
};

const spaceKey = () => `${state.source}/${state.space}`;
const space = () => state.data.spaces[spaceKey()];
const filePath = (rel = state.path) => `${space().base}/${rel}`;

// ---------------------------------------------------------------- markdown
marked.setOptions({ gfm: true });

function render(md, target) {
  const body = md.replace(/^﻿/, '').replace(/<!--[\s\S]*?-->/g, '');
  target.innerHTML = DOMPurify.sanitize(marked.parse(body));

  target.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    if (code.classList.contains('language-mermaid')) {
      const box = document.createElement('div');
      box.className = 'diagram mermaid';
      box.textContent = code.textContent;
      pre.replaceWith(box);
      return;
    }
    hljs.highlightElement(code);
    const wrap = document.createElement('div');
    wrap.className = 'code';
    const copy = document.createElement('button');
    copy.className = 'copy';
    copy.textContent = 'Copy';
    copy.onclick = () => navigator.clipboard.writeText(code.textContent).then(() => {
      copy.textContent = 'Copied';
      setTimeout(() => (copy.textContent = 'Copy'), 1500);
    });
    pre.replaceWith(wrap);
    wrap.append(pre, copy);
  });

  target.querySelectorAll('table').forEach((t) => {
    const wrap = document.createElement('div');
    wrap.className = 'table';
    t.replaceWith(wrap);
    wrap.append(t);
  });

  const used = {};
  target.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
    let id = h.textContent.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'section';
    if (used[id]) id += '-' + used[id]++; else used[id] = 1;
    h.id = id;
  });

  const diagrams = target.querySelectorAll('.mermaid');
  if (diagrams.length) {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: isDark() ? 'dark' : 'neutral', fontFamily: 'Inter' });
    mermaid.run({ nodes: diagrams, suppressErrors: true });
  }
}

// ---------------------------------------------------------------- data
async function api(url, options) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { status: res.status });
  return body;
}

async function loadManifest() {
  state.data = await api('/api/manifest');
}

// ---------------------------------------------------------------- routing
function go(source, spaceId, path) {
  location.hash = `/${source}/${spaceId}/${path || ''}`;
}

async function route() {
  if (state.editing && !leaveEditor()) return;
  const [source, spaceId, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  if (!state.data.spaces[`${source}/${spaceId}`]) return go(state.source, state.space, '');
  state.source = source;
  state.space = spaceId;
  state.path = rest.join('/') || space().overview;
  document.documentElement.dataset.source = source;

  document.querySelectorAll('#source-switch button').forEach((b) => b.classList.toggle('active', b.dataset.source === source));
  document.querySelectorAll('#space-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.space === spaceId));
  renderNav();
  closeSidebar();
  await loadPage();
}

// ---------------------------------------------------------------- sidebar
function renderNav() {
  const s = space();
  state.pages = [{ title: 'Overview', path: s.overview, section: '' }];
  let html = `<a class="nav-link nav-overview" href="#/${spaceKey()}/${s.overview}" data-path="${s.overview}">Overview</a>`;
  s.sections.forEach((sec) => {
    const links = sec.pages.map((p) => {
      state.pages.push({ ...p, section: sec.title });
      return `<a class="nav-link" href="#/${spaceKey()}/${esc(p.path)}" data-path="${esc(p.path)}">${esc(p.title)}</a>`;
    }).join('');
    html += `<div class="nav-section closed">
      <button class="nav-head">${esc(sec.title)}<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="nav-pages">${links}</div></div>`;
  });
  $('nav').innerHTML = html;
  $('filter').value = '';
}

function markActive() {
  document.querySelectorAll('.nav-link').forEach((a) => {
    const on = a.dataset.path === state.path;
    a.classList.toggle('active', on);
    if (on) {
      a.closest('.nav-section')?.classList.remove('closed');
      const sb = $('sidebar'), top = a.offsetTop - sb.offsetTop;
      if (top < sb.scrollTop || top > sb.scrollTop + sb.clientHeight - 40) sb.scrollTop = top - sb.clientHeight / 3;
    }
  });
}

function filterNav(q) {
  q = q.toLowerCase();
  document.querySelectorAll('.nav-section').forEach((sec) => {
    let any = false;
    sec.querySelectorAll('.nav-link').forEach((a) => {
      const hit = !q || a.textContent.toLowerCase().includes(q) || sec.querySelector('.nav-head').textContent.toLowerCase().includes(q);
      a.hidden = !hit;
      any = any || hit;
    });
    sec.hidden = !any;
    if (q) sec.classList.remove('closed');
  });
}

// ---------------------------------------------------------------- page
async function loadPage() {
  markActive();
  $('content').innerHTML = '<p class="muted">Loading…</p>';
  try {
    const file = await api(`/api/file?path=${encodeURIComponent(filePath())}`);
    state.raw = file.content;
    state.hash = file.hash;
  } catch {
    state.raw = '';
    $('content').innerHTML = `<h1>Page not found</h1><p class="muted">${esc(filePath())}</p>`;
    $('pager').innerHTML = '';
    $('toc').classList.add('empty');
    return;
  }
  render(state.raw, $('content'));
  const page = state.pages.find((p) => p.path === state.path);
  const h1 = $('content').querySelector('h1');
  document.title = `${h1 ? h1.textContent : page?.title || 'Docs'} · Pepper-Soup`;
  $('crumbs').innerHTML = [space().title, page?.section].filter(Boolean).map(esc).join(' / ');
  renderPager();
  renderToc();
  window.scrollTo(0, 0);
}

function renderPager() {
  const i = state.pages.findIndex((p) => p.path === state.path);
  const prev = state.pages[i - 1];
  const next = i >= 0 ? state.pages[i + 1] : null;
  const link = (p, cls, label) => `<a class="${cls}" href="#/${spaceKey()}/${esc(p.path)}"><small>${label}</small><span>${esc(p.title)}</span></a>`;
  $('pager').innerHTML = (prev ? link(prev, 'prev', 'Previous') : '') + (next ? link(next, 'next', 'Next') : '');
}

let tocObserver;
function renderToc() {
  const heads = [...$('content').querySelectorAll('h2, h3')];
  $('toc').classList.toggle('empty', heads.length === 0);
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
function onContentClick(e) {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; return; }
  if (href.startsWith('#')) {
    e.preventDefault();
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const [file] = href.split('#');
  if (file.endsWith('.md')) {
    e.preventDefault();
    const dir = state.path.includes('/') ? state.path.slice(0, state.path.lastIndexOf('/') + 1) : '';
    const parts = (dir + file).split('/');
    const out = [];
    parts.forEach((p) => (p === '..' ? out.pop() : p !== '.' && out.push(p)));
    go(state.source, state.space, out.join('/'));
  }
}

// ---------------------------------------------------------------- search
let hits = [], hitIndex = 0;

function openSearch() {
  $('search-modal').hidden = false;
  $('search-input').value = '';
  $('search-results').innerHTML = '';
  $('search-input').focus();
}
function closeSearch() { $('search-modal').hidden = true; }

function search(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) { $('search-results').innerHTML = ''; return; }
  hits = state.data.index.map((d) => {
    const title = d.title.toLowerCase(), heads = d.headings.join(' ').toLowerCase(), text = d.text.toLowerCase();
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
    const snippet = h.text.slice(Math.max(0, pos - 60), Math.max(0, pos - 60) + 180);
    const [src, sp] = h.space.split('/');
    const where = [src === 'gitbook' ? 'GitBook' : 'Confluence', state.data.spaces[h.space].title, h.section].filter(Boolean).join(' / ');
    return `<a class="hit${i ? '' : ' active'}" href="#/${h.space}/${esc(h.path)}">
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

// ---------------------------------------------------------------- downloads
function renderDownloadMenu() {
  const k = spaceKey();
  const srcName = state.source === 'gitbook' ? 'GitBook' : 'Confluence';
  $('download-menu').innerHTML = `
    <a href="#" data-dl="page">This page (.md)</a>
    ${state.source === 'confluence' && state.path !== space().overview ? '<a href="#" data-dl="xml">This page (.xml)</a>' : ''}
    <hr>
    <a href="/api/download?scope=${k}">${srcName} ${esc(space().title)} (.zip)</a>
    <a href="/api/download?scope=${state.source}">All ${srcName} docs (.zip)</a>
    <a href="/api/download?scope=all">All docs (.zip)</a>`;
}

async function downloadFile(path) {
  const { content } = await api(`/api/file?path=${encodeURIComponent(path)}`);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  a.download = path.split('/').pop();
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------------------------------------------------------------- editor
let xmlCompanion = null; // { path, hash } when a Confluence page has an .xml export

async function openEditor() {
  state.editing = true;
  document.body.classList.add('editing');
  $('page').hidden = true;
  $('editor').hidden = false;
  $('editor-path').textContent = filePath();
  $('editor-input').value = state.raw.replace(/^﻿/, '');
  render($('editor-input').value, $('editor-preview'));
  window.scrollTo(0, 0);
  $('editor-input').setSelectionRange(0, 0);
  $('editor-input').focus({ preventScroll: true });
  $('editor-input').scrollTop = 0;
  xmlCompanion = null;
  if (state.source === 'confluence') {
    const path = filePath().replace(/\.md$/, '.xml');
    try { xmlCompanion = { path, hash: (await api(`/api/file?path=${encodeURIComponent(path)}`)).hash }; } catch {}
  }
}

function closeEditor() {
  state.editing = false;
  document.body.classList.remove('editing');
  $('editor').hidden = true;
  $('page').hidden = false;
}

const isDirty = () => state.editing && $('editor-input').value !== state.raw.replace(/^﻿/, '');

function leaveEditor() {
  if (isDirty() && !confirm('Discard unsaved changes?')) {
    history.replaceState(null, '', `#/${spaceKey()}/${state.path}`);
    return false;
  }
  closeEditor();
  return true;
}

function toConfluenceXml(md) {
  const div = document.createElement('div');
  div.innerHTML = DOMPurify.sanitize(marked.parse(md.replace(/<!--[\s\S]*?-->/g, '')));
  const macros = [];
  div.querySelectorAll('pre > code').forEach((code) => {
    const lang = ([...code.classList].find((c) => c.startsWith('language-')) || '').replace('language-', '');
    macros.push('<ac:structured-macro ac:name="code">' +
      (lang ? `<ac:parameter ac:name="language">${lang}</ac:parameter>` : '') +
      `<ac:plain-text-body><![CDATA[${code.textContent.replace(/\n$/, '').replace(/]]>/g, ']]]]><![CDATA[>')}]]></ac:plain-text-body></ac:structured-macro>`);
    code.parentElement.replaceWith(`@@MACRO${macros.length - 1}@@`);
  });
  const html = div.innerHTML
    .replace(/<(br|hr|img)([^>]*?)\/?>/g, '<$1$2 />')
    .replace(/&nbsp;/g, '&#160;')
    .replace(/@@MACRO(\d+)@@/g, (_, i) => macros[i]);
  return '<?xml version="1.0" encoding="UTF-8"?>\n<ac:document xmlns:ac="http://www.atlassian.com/schema/confluence/4/ac/" ' +
    'xmlns:ri="http://www.atlassian.com/schema/confluence/4/ri/">\n' + html + '\n</ac:document>\n';
}

async function save() {
  const content = $('editor-input').value;
  const files = [{ path: filePath(), content, hash: state.hash }];
  if (xmlCompanion) files.push({ path: xmlCompanion.path, content: toConfluenceXml(content) });

  const headers = { 'Content-Type': 'application/json' };
  if (state.data.editing.passwordRequired) {
    let pw = sessionStorage.getItem('pw');
    if (!pw) pw = prompt('Edit password');
    if (!pw) return;
    sessionStorage.setItem('pw', pw);
    headers['X-Password'] = pw;
  }

  $('save-btn').disabled = true;
  $('save-btn').textContent = 'Saving…';
  try {
    const res = await api('/api/save', { method: 'POST', headers, body: JSON.stringify({ files }) });
    state.raw = content;
    state.hash = res.hashes[filePath()];
    closeEditor();
    await loadManifest();
    renderNav();
    await loadPage();
    toast(res.warning || 'Saved');
  } catch (err) {
    if (err.status === 401) sessionStorage.removeItem('pw');
    toast(err.message);
  } finally {
    $('save-btn').disabled = false;
    $('save-btn').textContent = 'Save';
  }
}

function toast(msg) {
  $('toast').textContent = msg;
  $('toast').hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => ($('toast').hidden = true), 5000);
}

// ---------------------------------------------------------------- theme / sidebar
const isDark = () => document.documentElement.dataset.theme === 'dark';
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('theme', theme); } catch {}
  $('hl-light').disabled = theme === 'dark';
  $('hl-dark').disabled = theme !== 'dark';
}
function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('backdrop').classList.remove('open');
}

// ---------------------------------------------------------------- events
function bind() {
  document.querySelectorAll('#source-switch button').forEach((b) => (b.onclick = () => go(b.dataset.source, state.space, '')));
  document.querySelectorAll('#space-tabs button').forEach((b) => (b.onclick = () => go(state.source, b.dataset.space, '')));

  $('nav').addEventListener('click', (e) => {
    const head = e.target.closest('.nav-head');
    if (head) head.parentElement.classList.toggle('closed');
  });
  $('filter').oninput = (e) => filterNav(e.target.value.trim());
  $('menu-btn').onclick = () => { $('sidebar').classList.add('open'); $('backdrop').classList.add('open'); };
  $('backdrop').onclick = closeSidebar;
  $('content').addEventListener('click', onContentClick);
  $('toc-list').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.id)?.scrollIntoView({ behavior: 'smooth' });
  });

  $('theme-btn').onclick = () => {
    applyTheme(isDark() ? 'light' : 'dark');
    if (!state.editing && state.raw) render(state.raw, $('content')), renderToc();
  };

  $('download-btn').onclick = (e) => {
    e.stopPropagation();
    renderDownloadMenu();
    $('download-menu').classList.toggle('open');
  };
  $('download-menu').onclick = (e) => {
    const kind = e.target.dataset.dl;
    if (kind) {
      e.preventDefault();
      downloadFile(kind === 'xml' ? filePath().replace(/\.md$/, '.xml') : filePath()).catch((err) => toast(err.message));
    }
    $('download-menu').classList.remove('open');
  };
  document.addEventListener('click', () => $('download-menu').classList.remove('open'));

  $('search-btn').onclick = openSearch;
  $('search-modal').onclick = (e) => { if (e.target.id === 'search-modal' || e.target.closest('.hit')) closeSearch(); };
  $('search-input').oninput = (e) => search(e.target.value.trim());
  $('search-input').onkeydown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveHit(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveHit(-1); }
    if (e.key === 'Enter') { const el = $('search-results').querySelectorAll('.hit')[hitIndex]; if (el) { location.hash = el.getAttribute('href'); closeSearch(); } }
  };

  $('edit-btn').onclick = openEditor;
  $('cancel-btn').onclick = () => { if (!isDirty() || confirm('Discard unsaved changes?')) closeEditor(); };
  $('save-btn').onclick = save;
  let timer;
  $('editor-input').oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => render($('editor-input').value, $('editor-preview')), 250);
  };
  $('editor-input').onkeydown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  };

  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (mod && e.key.toLowerCase() === 's' && state.editing) { e.preventDefault(); save(); }
    if (e.key === 'Escape') { closeSearch(); closeSidebar(); }
    if (e.key === '/' && !state.editing && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  window.addEventListener('beforeunload', (e) => { if (isDirty()) e.preventDefault(); });
  window.addEventListener('hashchange', route);
}

// ---------------------------------------------------------------- start
(async () => {
  applyTheme(isDark() ? 'dark' : 'light');
  bind();
  try {
    await loadManifest();
  } catch {
    $('content').innerHTML = '<h1>Server not running</h1><p>Start it with <code>python server.py</code>.</p>';
    return;
  }
  route();
})();
