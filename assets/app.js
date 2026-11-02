// State Management
const state = {
  manifest: null,
  searchIndex: [],
  currentSource: 'gitbook',       // 'gitbook' or 'confluence'
  currentSubspace: 'user',         // 'user' or 'developer'
  currentPath: '',
  currentDocTitle: '',
  allPagesInCurrentView: [],
  theme: localStorage.getItem('doc_theme') || 'light',
  skin: localStorage.getItem('doc_skin') || 'gitbook' // 'gitbook' or 'confluence'
};

// Metadata for the 4 spaces
const spaceMeta = {
  'gitbook/user': {
    name: 'User Guide',
    sub: 'GitBook Space',
    icon: '📘',
    crumb: 'User Guide'
  },
  'gitbook/developer': {
    name: 'Developer Reference',
    sub: 'GitBook Space',
    icon: '⚙️',
    crumb: 'Developer Reference'
  },
  'confluence/user': {
    name: 'User Knowledge Base',
    sub: 'Confluence Space',
    icon: '📑',
    crumb: 'User Wiki'
  },
  'confluence/developer': {
    name: 'Engineering Wiki',
    sub: 'Confluence Space',
    icon: '🛠️',
    crumb: 'Engineering Specs'
  }
};

// DOM References
const el = {
  spaceBtn: document.getElementById('space-selector-btn'),
  spaceDropdown: document.getElementById('space-dropdown-menu'),
  currentSpaceName: document.getElementById('current-space-name'),
  currentSpaceFormat: document.getElementById('current-space-format'),
  currentSpaceIcon: document.getElementById('current-space-icon'),
  navTree: document.getElementById('nav-tree'),
  sidebarFilter: document.getElementById('sidebar-filter'),
  docContent: document.getElementById('doc-content'),
  tocLinks: document.getElementById('toc-links'),
  paginationFooter: document.getElementById('pagination-footer'),
  gitbookBreadcrumbs: document.getElementById('gitbook-breadcrumbs'),
  confluenceHeader: document.getElementById('confluence-header'),
  confluenceSpaceCrumb: document.getElementById('confluence-space-crumb'),
  searchTrigger: document.getElementById('search-trigger'),
  searchModal: document.getElementById('search-modal'),
  modalSearchInput: document.getElementById('modal-search-input'),
  searchResultsBox: document.getElementById('search-results-box'),
  closeSearchBtn: document.getElementById('close-search-btn'),
  themeToggle: document.getElementById('theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  skinSwitch: document.getElementById('skin-switch'),
  readingPane: document.getElementById('reading-pane'),
  mobileToggleBtn: document.getElementById('mobile-toggle-btn'),
  sidebar: document.getElementById('sidebar')
};

// Boot
async function init() {
  applyTheme(state.theme);
  applySkin(state.skin);
  setupMarked();
  setupMermaid();
  setupEvents();

  // 1. First check if data is already loaded via <script src="data/data.js">
  if (window.__DOCS_MANIFEST__ && window.__DOCS_SEARCH_INDEX__) {
    state.manifest = window.__DOCS_MANIFEST__;
    state.searchIndex = window.__DOCS_SEARCH_INDEX__;
    handleRoute();
    return;
  }

  // 2. Fallback to fetch for web servers / APIs
  try {
    const [manifestRes, indexRes] = await Promise.all([
      fetch('data/manifest.json'),
      fetch('data/search-index.json')
    ]);
    state.manifest = await manifestRes.json();
    state.searchIndex = await indexRes.json();

    handleRoute();
  } catch (err) {
    console.error('Failed to load docs data:', err);
    el.docContent.innerHTML = `
      <div class="note">
        <div class="note-title">Documentation Server Required</div>
        <p>Browsers block local file requests (<code>fetch("data/...")</code>) when opened directly via <code>file://</code> due to CORS security.</p>
        <p>Run either of the following in your terminal:</p>
        <pre><code>python -m http.server 8080</code></pre>
        <p>Then open <a href="http://localhost:8080">http://localhost:8080</a></p>
      </div>
    `;
  }
}

function setupMarked() {
  marked.setOptions({
    gfm: true,
    breaks: false,
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (_) {}
      }
      return hljs.highlightAuto(code).value;
    }
  });
}

function setupMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: state.theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif'
  });
}

function setupEvents() {
  // Space Switcher Dropdown (ERPNext workspace style)
  el.spaceBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    el.spaceDropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    el.spaceDropdown.classList.remove('show');
  });

  el.spaceDropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      const sub = item.dataset.sub;
      switchSpace(src, sub);
      el.spaceDropdown.classList.remove('show');
    });
  });

  // Skin Switcher (GitBook vs Confluence)
  el.skinSwitch.querySelectorAll('.skin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applySkin(btn.dataset.skin);
    });
  });

  // Theme Toggle
  el.themeToggle.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // Sidebar Filter
  el.sidebarFilter.addEventListener('input', (e) => {
    filterNav(e.target.value.toLowerCase().trim());
  });

  // Mobile toggle
  el.mobileToggleBtn.addEventListener('click', () => {
    el.sidebar.classList.toggle('show');
  });

  // Search
  el.searchTrigger.addEventListener('click', openSearch);
  el.closeSearchBtn.addEventListener('click', closeSearch);
  el.searchModal.addEventListener('click', (e) => {
    if (e.target === el.searchModal) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && el.searchModal.classList.contains('show')) {
      closeSearch();
    }
  });

  el.modalSearchInput.addEventListener('input', (e) => {
    doSearch(e.target.value.trim());
  });

  // Hash Navigation
  window.addEventListener('hashchange', handleRoute);

  // Link intercept inside markdown
  el.docContent.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;

    if (href.startsWith('http://') || href.startsWith('https://')) {
      a.setAttribute('target', '_blank');
      return;
    }
    if (href.startsWith('#')) return;

    if (href.endsWith('.md')) {
      e.preventDefault();
      resolveDocLink(href);
    }
  });
}

function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('doc_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    el.themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>`;
  } else {
    el.themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
  }

  mermaid.initialize({
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose'
  });
}

function applySkin(skin) {
  state.skin = skin;
  localStorage.setItem('doc_skin', skin);
  document.body.setAttribute('data-mode', skin);

  el.skinSwitch.querySelectorAll('.skin-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.skin === skin);
  });

  // Toggle Confluence vs GitBook layout headers
  if (skin === 'confluence') {
    el.confluenceHeader.style.display = 'block';
    el.gitbookBreadcrumbs.style.display = 'none';
  } else {
    el.confluenceHeader.style.display = 'none';
    el.gitbookBreadcrumbs.style.display = 'flex';
  }
}

function switchSpace(source, subspace) {
  state.currentSource = source;
  state.currentSubspace = subspace;
  
  // If user picks confluence space, automatically switch to confluence skin for authenticity
  if (source === 'confluence' && state.skin !== 'confluence') {
    applySkin('confluence');
  } else if (source === 'gitbook' && state.skin !== 'gitbook') {
    applySkin('gitbook');
  }

  updateSpaceSelectorUI();
  renderSidebar();

  const defaultDoc = source === 'gitbook' ? 'README.md' : 'index.md';
  setRoute(source, subspace, defaultDoc);
}

function updateSpaceSelectorUI() {
  const key = `${state.currentSource}/${state.currentSubspace}`;
  const info = spaceMeta[key] || { name: 'Docs', sub: 'Space', icon: '📖' };

  el.currentSpaceName.textContent = info.name;
  el.currentSpaceFormat.textContent = info.sub;
  el.currentSpaceIcon.textContent = info.icon;

  el.spaceDropdown.querySelectorAll('.dropdown-item').forEach(item => {
    const isAct = item.dataset.src === state.currentSource && item.dataset.sub === state.currentSubspace;
    item.classList.toggle('active', isAct);
  });
}

function handleRoute() {
  const hash = window.location.hash.slice(1);
  if (!hash) {
    updateSpaceSelectorUI();
    renderSidebar();
    const defaultDoc = state.currentSource === 'gitbook' ? 'README.md' : 'index.md';
    setRoute(state.currentSource, state.currentSubspace, defaultDoc);
    return;
  }

  const parts = hash.split('/');
  if (parts.length >= 2) {
    const src = parts[0];
    const sub = parts[1];
    const path = parts.slice(2).join('/');

    if (state.manifest && state.manifest.sources[src]) {
      state.currentSource = src;
      state.currentSubspace = sub;
      updateSpaceSelectorUI();
      renderSidebar();
      loadDoc(path || (src === 'gitbook' ? 'README.md' : 'index.md'));
      return;
    }
  }

  updateSpaceSelectorUI();
  renderSidebar();
  loadDoc(state.currentSource === 'gitbook' ? 'README.md' : 'index.md');
}

function setRoute(src, sub, path) {
  window.location.hash = `#${src}/${sub}/${path}`;
}

function renderSidebar() {
  const subData = state.manifest.sources[state.currentSource]?.subspaces[state.currentSubspace];
  if (!subData) return;

  state.allPagesInCurrentView = [];
  const defaultDoc = state.currentSource === 'gitbook' ? 'README.md' : 'index.md';
  state.allPagesInCurrentView.push({
    title: 'Overview',
    path: defaultDoc,
    section: 'Overview'
  });

  let html = `
    <div class="nav-group">
      <ul class="nav-group-list">
        <li>
          <a class="nav-link ${state.currentPath === defaultDoc ? 'active' : ''}" data-path="${defaultDoc}">
            Overview
          </a>
        </li>
      </ul>
    </div>
  `;

  subData.sections.forEach(sec => {
    let itemsHtml = '';
    sec.items.forEach(item => {
      state.allPagesInCurrentView.push({
        title: item.title,
        path: item.path,
        section: sec.title
      });

      const isActive = state.currentPath === item.path;
      itemsHtml += `
        <li>
          <a class="nav-link ${isActive ? 'active' : ''}" data-path="${item.path}" title="${item.title}">
            ${item.title}
          </a>
        </li>
      `;
    });

    html += `
      <div class="nav-group" data-sec="${sec.title}">
        <div class="nav-group-header">
          <span>${sec.title}</span>
          <svg class="nav-group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
        <ul class="nav-group-list">
          ${itemsHtml}
        </ul>
      </div>
    `;
  });

  el.navTree.innerHTML = html;

  // Toggle collapsible sections
  el.navTree.querySelectorAll('.nav-group-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      hdr.closest('.nav-group').classList.toggle('collapsed');
    });
  });

  // Nav link click
  el.navTree.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setRoute(state.currentSource, state.currentSubspace, link.dataset.path);
      if (window.innerWidth <= 768) el.sidebar.classList.remove('show');
    });
  });
}

function filterNav(query) {
  el.navTree.querySelectorAll('.nav-group').forEach(grp => {
    const links = grp.querySelectorAll('.nav-link');
    let hasMatch = false;
    links.forEach(l => {
      const match = l.textContent.toLowerCase().includes(query);
      l.parentElement.style.display = match ? 'block' : 'none';
      if (match) hasMatch = true;
    });
    grp.style.display = hasMatch ? 'block' : 'none';
    if (query && hasMatch) grp.classList.remove('collapsed');
  });
}

async function loadDoc(relPath) {
  state.currentPath = relPath;

  el.navTree.querySelectorAll('.nav-link').forEach(l => {
    const isAct = l.dataset.path === relPath;
    l.classList.toggle('active', isAct);
    if (isAct) {
      const grp = l.closest('.nav-group');
      if (grp) grp.classList.remove('collapsed');
    }
  });

  const subData = state.manifest.sources[state.currentSource].subspaces[state.currentSubspace];
  const fullPath = `${subData.base}/${relPath}`;

  el.docContent.innerHTML = `<div style="padding: 2rem 0; color: var(--text-tertiary);">Loading...</div>`;

  try {
    const res = await fetch(fullPath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    renderDoc(text, relPath);
  } catch (err) {
    console.error('Error fetching file:', fullPath, err);
    el.docContent.innerHTML = `<div class="note"><div class="note-title">Document Not Found</div><p>Could not locate <code>${fullPath}</code>.</p></div>`;
  }
}

function renderDoc(rawMarkdown, relPath) {
  let content = rawMarkdown;

  // Extract Confluence labels
  const match = content.match(/<!--\s*Labels:\s*(.*?)\s*-->/i);
  if (match) {
    content = content.replace(match[0], '');
  }

  const html = marked.parse(content);
  el.docContent.innerHTML = html;

  const h1 = el.docContent.querySelector('h1');
  state.currentDocTitle = h1 ? h1.textContent : relPath;
  document.title = `${state.currentDocTitle} | Documentation`;

  // Breadcrumbs
  updateBreadcrumbs();

  // Code Toolbar
  enhanceCode();

  // Mermaid
  renderMermaid();

  // In-page TOC
  buildToc();

  // Next / Prev Footer
  buildPagination();

  // Scroll top
  el.readingPane.scrollTo(0, 0);
}

function updateBreadcrumbs() {
  const key = `${state.currentSource}/${state.currentSubspace}`;
  const info = spaceMeta[key];

  el.gitbookBreadcrumbs.innerHTML = `
    <span>${info.name}</span>
    <span>/</span>
    <span class="active">${state.currentDocTitle}</span>
  `;

  if (el.confluenceSpaceCrumb) {
    el.confluenceSpaceCrumb.innerHTML = `
      <span class="crumb-icon">${info.icon}</span>
      <span class="crumb-space-name">${info.name}</span> / <span>${state.currentDocTitle}</span>
    `;
  }
}

function enhanceCode() {
  el.docContent.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code || code.classList.contains('language-mermaid')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';

    let lang = 'code';
    code.classList.forEach(c => {
      if (c.startsWith('language-')) lang = c.replace('language-', '');
    });

    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    toolbar.innerHTML = `
      <span>${lang}</span>
      <button class="copy-btn">Copy</button>
    `;

    const copyBtn = toolbar.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(code.innerText).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1800);
      });
    });

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(pre);
  });
}

async function renderMermaid() {
  el.docContent.querySelectorAll('code.language-mermaid').forEach(async (code, idx) => {
    const raw = code.textContent.trim();
    const pre = code.closest('pre') || code;

    const box = document.createElement('div');
    box.className = 'mermaid-box';
    box.innerHTML = `
      <div class="mermaid-bar">
        <span>Diagram</span>
      </div>
      <div class="mermaid-content">
        <div id="diag-${idx}"></div>
      </div>
    `;

    pre.parentNode.replaceChild(box, pre);

    try {
      const target = box.querySelector(`#diag-${idx}`);
      const { svg } = await mermaid.render(`m_svg_${idx}_${Date.now()}`, raw);
      target.innerHTML = svg;
    } catch (err) {
      box.innerHTML += `<pre style="padding: 1rem; color: #ef4444; font-size: 0.8rem;">${raw}</pre>`;
    }
  });
}

function buildToc() {
  const headings = el.docContent.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    el.tocLinks.innerHTML = `<li style="font-size: 0.76rem; color: var(--text-tertiary);">No section links</li>`;
    return;
  }

  let html = '';
  headings.forEach((h, i) => {
    const id = h.id || `head-${i}`;
    h.id = id;
    const isH3 = h.tagName.toLowerCase() === 'h3';
    html += `
      <li>
        <a class="${isH3 ? 'h3' : ''}" href="#${id}">${h.textContent}</a>
      </li>
    `;
  });

  el.tocLinks.innerHTML = html;
}

function buildPagination() {
  const curIdx = state.allPagesInCurrentView.findIndex(p => p.path === state.currentPath);
  let prev = null;
  let next = null;

  if (curIdx > 0) prev = state.allPagesInCurrentView[curIdx - 1];
  if (curIdx >= 0 && curIdx < state.allPagesInCurrentView.length - 1) {
    next = state.allPagesInCurrentView[curIdx + 1];
  }

  let html = '';
  if (prev) {
    html += `
      <a class="page-btn prev" data-path="${prev.path}">
        <span class="dir">Previous</span>
        <span class="title">${prev.title}</span>
      </a>
    `;
  } else {
    html += `<div></div>`;
  }

  if (next) {
    html += `
      <a class="page-btn next" data-path="${next.path}">
        <span class="dir">Next</span>
        <span class="title">${next.title}</span>
      </a>
    `;
  }

  el.paginationFooter.innerHTML = html;

  el.paginationFooter.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setRoute(state.currentSource, state.currentSubspace, btn.dataset.path);
    });
  });
}

function resolveDocLink(href) {
  let clean = href.split('#')[0];
  if (clean.startsWith('./')) clean = clean.slice(2);

  const found = state.allPagesInCurrentView.find(p => p.path.endsWith(clean) || clean.endsWith(p.path));
  if (found) {
    setRoute(state.currentSource, state.currentSubspace, found.path);
  } else {
    setRoute(state.currentSource, state.currentSubspace, clean);
  }
}

// Search
function openSearch() {
  el.searchModal.classList.add('show');
  el.modalSearchInput.value = '';
  el.searchResultsBox.innerHTML = `<div class="search-empty-prompt">Type to search all topics across spaces...</div>`;
  setTimeout(() => el.modalSearchInput.focus(), 50);
}

function closeSearch() {
  el.searchModal.classList.remove('show');
}

function doSearch(query) {
  if (!query || query.length < 2) {
    el.searchResultsBox.innerHTML = `<div class="search-empty-prompt">Type at least 2 characters...</div>`;
    return;
  }

  const q = query.toLowerCase();
  const results = state.searchIndex.filter(item => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      item.snippet.toLowerCase().includes(q)
    );
  }).slice(0, 15);

  if (results.length === 0) {
    el.searchResultsBox.innerHTML = `<div class="search-empty-prompt">No results found for "${query}"</div>`;
    return;
  }

  el.searchResultsBox.innerHTML = results.map(r => `
    <div class="search-hit-row" data-src="${r.source}" data-sub="${r.subspace}" data-path="${r.path}">
      <div class="search-hit-meta">${r.source} / ${r.subspace} / ${r.section}</div>
      <div class="search-hit-title">${r.title}</div>
      <div class="search-hit-snippet">${r.snippet}</div>
    </div>
  `).join('');

  el.searchResultsBox.querySelectorAll('.search-hit-row').forEach(row => {
    row.addEventListener('click', () => {
      const { src, sub, path } = row.dataset;
      closeSearch();
      switchSpace(src, sub);
      setRoute(src, sub, path);
    });
  });
}

window.addEventListener('DOMContentLoaded', init);
