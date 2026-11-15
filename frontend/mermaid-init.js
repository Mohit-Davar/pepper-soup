/* Central Mermaid initialization, theme token configuration, ELK routing, and Dagre fallback.
 *
 * Versions: mermaid@12.3.0 + @mermaid-js/layout-elk@1.0.2
 *
 * Shared node styling classes (usable in diagrams via `class nodeId key` or `:::key`):
 *   - `.key`   : Accent fill (--accent) with high-contrast foreground text (--on-accent)
 *   - `.muted` : Low-contrast surface (--surface-2) with muted text (--text-muted)
 *
 * Look evaluation: Mermaid v12 supports `look: 'neo'`, which adds decorative gradients and
 * drop shadows to nodes. We tested it against our design tokens and kept the default
 * `look: 'classic'` so diagrams match the flat, 1px-hairline Apple/Linear surface style.
 */

import mermaid from '/vendor/mermaid/mermaid.esm.min.mjs';

export const MERMAID_VERSION = '12.3.0';
export const ELK_VERSION = '1.0.2';

const FONT_FAMILY = '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif';

let setupPromise = null;
let elkAvailable = false;
let renderSeq = 0;

function isDarkTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'dark') return true;
  if (explicit === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/** Hex-only theme variables derived from our design tokens in styles.css. */
export function getMermaidThemeConfig({ dark = isDarkTheme(), layout = 'elk' } = {}) {
  const useElk = layout === 'elk' && elkAvailable;

  const themeVariables = dark
    ? {
        darkMode: true,
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        background: '#000000',
        primaryColor: '#161618',
        primaryBorderColor: '#2c2c2e',
        primaryTextColor: '#f5f5f7',
        secondaryColor: '#111113',
        secondaryBorderColor: '#2c2c2e',
        secondaryTextColor: '#f5f5f7',
        tertiaryColor: '#161618',
        tertiaryBorderColor: '#2c2c2e',
        tertiaryTextColor: '#f5f5f7',
        mainBkg: '#161618',
        nodeBorder: '#2c2c2e',
        clusterBkg: '#0a0a0c',
        clusterBorder: '#2c2c2e',
        lineColor: '#98989d',
        textColor: '#f5f5f7',
        edgeLabelBackground: '#000000',
        labelBoxBkgColor: '#161618',
        labelBoxBorderColor: '#2c2c2e',
        labelTextColor: '#f5f5f7',
        actorBkg: '#161618',
        actorBorder: '#2c2c2e',
        actorTextColor: '#f5f5f7',
        actorLineColor: '#98989d',
        signalColor: '#98989d',
        signalTextColor: '#f5f5f7',
        noteBkgColor: '#161618',
        noteBorderColor: '#2c2c2e',
        noteTextColor: '#f5f5f7',
      }
    : {
        darkMode: false,
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        background: '#ffffff',
        primaryColor: '#f5f5f7',
        primaryBorderColor: '#e8e8ed',
        primaryTextColor: '#1d1d1f',
        secondaryColor: '#fafafa',
        secondaryBorderColor: '#e8e8ed',
        secondaryTextColor: '#1d1d1f',
        tertiaryColor: '#f5f5f7',
        tertiaryBorderColor: '#e8e8ed',
        tertiaryTextColor: '#1d1d1f',
        mainBkg: '#f5f5f7',
        nodeBorder: '#e8e8ed',
        clusterBkg: '#fafafa',
        clusterBorder: '#e8e8ed',
        lineColor: '#6e6e73',
        textColor: '#1d1d1f',
        edgeLabelBackground: '#ffffff',
        labelBoxBkgColor: '#f5f5f7',
        labelBoxBorderColor: '#e8e8ed',
        labelTextColor: '#1d1d1f',
        actorBkg: '#f5f5f7',
        actorBorder: '#e8e8ed',
        actorTextColor: '#1d1d1f',
        actorLineColor: '#6e6e73',
        signalColor: '#6e6e73',
        signalTextColor: '#1d1d1f',
        noteBkgColor: '#fafafa',
        noteBorderColor: '#e8e8ed',
        noteTextColor: '#1d1d1f',
      };

  return {
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
    theme: 'base',
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    layout: useElk ? 'elk' : 'dagre',
    elk: {
      mergeEdges: true,
    },
    flowchart: {
      curve: useElk ? 'linear' : 'step',
      nodeSpacing: 48,
      rankSpacing: 56,
      padding: 14,
      useMaxWidth: true,
      htmlLabels: true,
    },
    themeVariables,
  };
}

/** Registers @mermaid-js/layout-elk once. Falls back cleanly to Dagre if load fails. */
export async function ensureMermaidReady() {
  if (!setupPromise) {
    setupPromise = (async () => {
      try {
        const mod = await import('/vendor/mermaid-layout-elk/mermaid-layout-elk.esm.min.mjs');
        const layouts = mod.default || mod;
        if (typeof mermaid.registerLayoutLoaders === 'function') {
          mermaid.registerLayoutLoaders(layouts);
          elkAvailable = true;
        } else {
          console.warn('[mermaid] registerLayoutLoaders unavailable; using Dagre step routing.');
          elkAvailable = false;
        }
      } catch (err) {
        console.warn('[mermaid] Failed to load @mermaid-js/layout-elk; falling back to Dagre step routing:', err);
        elkAvailable = false;
      }
      mermaid.initialize(getMermaidThemeConfig({ layout: elkAvailable ? 'elk' : 'dagre' }));
    })();
  }
  await setupPromise;
}

/** Builds a concise, human-readable summary for screen readers from diagram source. */
export function summarizeDiagram(source) {
  const lines = String(source || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('%%'));
  const first = (lines[0] || '').toLowerCase();
  const kind = first.startsWith('sequence')
    ? 'Sequence diagram'
    : first.startsWith('state')
      ? 'State diagram'
      : first.startsWith('er')
        ? 'Entity relationship diagram'
        : 'Flowchart diagram';

  const labels = [];
  for (const line of lines.slice(1)) {
    for (const m of line.matchAll(/(?:\["([^"]+)"\]|\[([^\]]+)\]|\("([^"]+)"\)|state\s+"([^"]+)"|participant\s+\S+\s+as\s+(.+))/g)) {
      const text = (m[1] || m[2] || m[3] || m[4] || m[5] || '').replace(/<[^>]+>/g, '').trim();
      if (text && !labels.includes(text)) labels.push(text);
      if (labels.length >= 6) break;
    }
    if (labels.length >= 6) break;
  }

  return labels.length ? `${kind}: ${labels.join(', ')}` : kind;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function showSkeleton(box) {
  box.innerHTML = '<div class="diagram-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>';
}

function renderInlineError(box, source, error) {
  const rawMessage = error?.str || error?.message || 'Unable to render diagram.';
  const cleanMessage = String(rawMessage).split('\n')[0].trim();
  const card = box.closest('.diagram-card');
  if (card) card.classList.add('has-error');
  box.removeAttribute('role');
  box.innerHTML = `
    <div class="diagram-error" role="status">
      <div class="diagram-error-head">
        <span class="diagram-error-title">Diagram syntax error</span>
        <button type="button" class="diagram-error-toggle" aria-expanded="false">View source</button>
      </div>
      <p class="diagram-error-msg">${escapeHtml(cleanMessage)}</p>
      <pre class="diagram-error-src" hidden><code>${escapeHtml(source)}</code></pre>
    </div>`;

  const toggle = box.querySelector('.diagram-error-toggle');
  const pre = box.querySelector('.diagram-error-src');
  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = pre.hidden;
    pre.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Hide source' : 'View source';
  });
}

function decorateRenderedSvg(box, summary) {
  const svg = box.querySelector('svg');
  if (!svg) return;
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', summary);
  if (!svg.querySelector('title')) {
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = summary;
    svg.prepend(title);
  }
  svg.querySelectorAll('.node rect, g.stateGroup rect').forEach((r) => {
    r.setAttribute('rx', '8');
    r.setAttribute('ry', '8');
  });
}

function stripInlineTags(text) {
  return String(text || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNodeToken(rawToken) {
  let token = String(rawToken || '').trim();
  if (!token) return null;

  let inlineClass = '';
  const clsMatch = token.match(/:::([A-Za-z0-9_-]+)\s*$/);
  if (clsMatch) {
    inlineClass = clsMatch[1];
    token = token.slice(0, clsMatch.index).trim();
  }

  // Match id with common Mermaid shape brackets: ["..."], [...], ("..."), (["..."]), {"..."}, {{...}}
  const shapeMatch = token.match(/^([A-Za-z0-9_.-]+)\s*(?:\(\["([^"]+)"\]\)|\(\[([^\]]+)\]\)|\[\["([^"]+)"\]\]|\["([^"]+)"\]|\[([^\]]+)\]|\("([^"]+)"\)|\(([^)]+)\)|\{\{"([^"]+)"\}\}|\{"([^"]+)"\}|\{([^}]+)\})?$/);
  if (!shapeMatch) return null;

  const id = shapeMatch[1];
  const rawLabel = shapeMatch.slice(2).find((v) => v !== undefined);
  const label = rawLabel !== undefined ? stripInlineTags(rawLabel) : null;
  return { id, label, inlineClass };
}

/**
 * Detects plain linear flowcharts with 6+ nodes (no subgraphs, branches, or cycles)
 * so they can be rendered as a compact numbered stepper component instead of wide/tall SVGs.
 */
export function parseLinearChain(source) {
  const lines = String(source || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('%%'));
  if (!lines.length || !/^(?:flowchart|graph)\s+(?:TD|TB|LR|RL|BT)\b/i.test(lines[0])) return null;

  const nodes = new Map();
  const edges = [];
  const inDeg = new Map();
  const outDeg = new Map();
  const nodeClasses = new Map();

  const ensureNode = (info) => {
    if (!info || !info.id) return false;
    const prev = nodes.get(info.id) || { id: info.id, label: info.id };
    if (info.label) prev.label = info.label;
    nodes.set(info.id, prev);
    if (info.inlineClass) nodeClasses.set(info.id, info.inlineClass);
    return true;
  };

  for (const line of lines.slice(1)) {
    if (/^(?:subgraph|end|direction)\b/i.test(line)) return null;
    if (/^(?:classDef|style|linkStyle|click)\b/i.test(line)) continue;
    const classStmt = line.match(/^class\s+([^\s]+)\s+([A-Za-z0-9_-]+)\s*;?$/i);
    if (classStmt) {
      classStmt[1].split(',').map((s) => s.trim()).filter(Boolean).forEach((id) => nodeClasses.set(id, classStmt[2]));
      continue;
    }

    const cleanLine = line.replace(/;\s*$/, '');
    // Reject bidirectional/undirected arrows (multi-node `&` joins are rejected by parseNodeToken)
    if (/<-->|---|--[ox]|o--|x--/.test(cleanLine)) return null;

    // Split chained edges in a single line (e.g. `a -->|"yes"| b --> c`)
    const edgeParts = cleanLine.split(/\s*(?:-->|-.->|==>)\s*/);
    if (edgeParts.length === 1) {
      const info = parseNodeToken(cleanLine);
      if (!ensureNode(info)) return null;
      continue;
    }

    for (let i = 0; i < edgeParts.length - 1; i++) {
      const leftRaw = edgeParts[i];
      let rightRaw = edgeParts[i + 1];
      let guard = '';
      const guardMatch = rightRaw.match(/^\|\s*"?([^"|]+)"?\s*\|\s*(.+)$/);
      if (guardMatch) {
        guard = stripInlineTags(guardMatch[1]);
        rightRaw = guardMatch[2].trim();
      }
      // Strip optional edge label from leftRaw if chained
      const fromInfo = parseNodeToken(leftRaw.replace(/^\|\s*"?[^"|]+"?\s*\|\s*/, '').trim());
      const toInfo = parseNodeToken(rightRaw.split(/\s*\|/)[0].trim());
      if (!ensureNode(fromInfo) || !ensureNode(toInfo)) return null;
      if (fromInfo.id === toInfo.id) return null;

      edges.push({ from: fromInfo.id, to: toInfo.id, guard });
      outDeg.set(fromInfo.id, (outDeg.get(fromInfo.id) || 0) + 1);
      inDeg.set(toInfo.id, (inDeg.get(toInfo.id) || 0) + 1);
    }
  }

  if (nodes.size < 6 || edges.length !== nodes.size - 1) return null;
  for (const id of nodes.keys()) {
    if ((inDeg.get(id) || 0) > 1 || (outDeg.get(id) || 0) > 1) return null;
  }

  const starts = [...nodes.keys()].filter((id) => (inDeg.get(id) || 0) === 0);
  if (starts.length !== 1) return null;

  const nextOf = new Map(edges.map((e) => [e.from, e]));
  const ordered = [];
  const visited = new Set();
  let cur = starts[0];
  let incomingGuard = '';

  while (cur && !visited.has(cur)) {
    visited.add(cur);
    const n = nodes.get(cur);
    ordered.push({
      id: n.id,
      label: n.label,
      guard: incomingGuard,
      tone: nodeClasses.get(n.id) || '',
    });
    const edge = nextOf.get(cur);
    incomingGuard = edge ? edge.guard : '';
    cur = edge ? edge.to : null;
  }

  if (ordered.length !== nodes.size) return null;
  return ordered;
}

function renderStepperElement(box, steps, source) {
  const card = box.closest('.diagram-card');
  const summary = summarizeDiagram(source);
  if (card) {
    card.dataset.source = source;
    card.dataset.diagramView = 'stepper';
    card.classList.add('stepper-eligible', 'is-stepper');
    card.classList.remove('has-error');
    const toggleBtn = card.querySelector('[data-diagram-act="toggle-view"]');
    if (toggleBtn) {
      toggleBtn.hidden = false;
      toggleBtn.setAttribute('aria-pressed', 'false');
      toggleBtn.setAttribute('aria-label', 'View as Mermaid diagram');
      toggleBtn.title = 'View as Mermaid diagram';
      const span = toggleBtn.querySelector('span');
      if (span) span.textContent = 'Diagram';
    }
  }

  box.dataset.source = source;
  box.setAttribute('aria-label', summary);
  box.innerHTML = `
    <ol class="diagram-stepper" aria-label="${escapeHtml(summary)}">
      ${steps.map((step, idx) => {
        const tone = step.tone === 'key'
          ? ' is-key'
          : step.tone === 'muted'
            ? ' is-muted'
            : idx === 0
              ? ' is-start'
              : '';
        return `<li class="stepper-item${tone}">
          <span class="stepper-rail" aria-hidden="true">
            <span class="stepper-num">${idx + 1}</span>
          </span>
          <div class="stepper-body">
            ${step.guard ? `<span class="stepper-guard">${escapeHtml(step.guard)}</span>` : ''}
            <span class="stepper-label">${escapeHtml(step.label)}</span>
          </div>
        </li>`;
      }).join('')}
    </ol>`;
}

async function renderSingleDiagram(box, { stepper = true } = {}) {
  const source = (box.dataset.source || box.textContent || '').trim();
  if (!source) return;
  box.dataset.source = source;
  const card = box.closest('.diagram-card');
  if (card) {
    card.dataset.source = source;
    card.classList.remove('has-error');
  }

  const allowStepper = stepper && card?.dataset.noStepper !== 'true';
  const linearSteps = allowStepper ? parseLinearChain(source) : null;
  if (linearSteps) {
    card?.classList.add('stepper-eligible');
    if (card?.dataset.diagramView !== 'diagram') {
      renderStepperElement(box, linearSteps, source);
      return;
    }
  } else if (card) {
    card.classList.remove('stepper-eligible', 'is-stepper');
  }

  if (card) {
    card.classList.remove('is-stepper');
    card.dataset.diagramView = 'diagram';
    const toggleBtn = card.querySelector('[data-diagram-act="toggle-view"]');
    if (toggleBtn) {
      toggleBtn.hidden = !linearSteps;
      toggleBtn.setAttribute('aria-pressed', 'true');
      toggleBtn.setAttribute('aria-label', 'View as compact stepper');
      toggleBtn.title = 'View as compact stepper';
      const span = toggleBtn.querySelector('span');
      if (span) span.textContent = 'Stepper';
    }
  }

  await ensureMermaidReady();
  const summary = summarizeDiagram(source);
  box.setAttribute('aria-label', summary);
  showSkeleton(box);

  // 1. Validate syntax first so syntax errors never trigger a pointless fallback render.
  try {
    await mermaid.parse(source);
  } catch (syntaxErr) {
    renderInlineError(box, source, syntaxErr);
    return;
  }

  const id = `mermaid-svg-${++renderSeq}`;
  const dark = isDarkTheme();
  const isFlowchart = /^\s*(graph|flowchart)\b/i.test(source);

  // 2. Render with ELK (when available), or Dagre step fallback on failure.
  try {
    mermaid.initialize(getMermaidThemeConfig({ dark, layout: elkAvailable ? 'elk' : 'dagre' }));
    const { svg, bindFunctions } = await mermaid.render(id, source);
    box.innerHTML = svg;
    bindFunctions?.(box);
    decorateRenderedSvg(box, summary);
  } catch (err) {
    if (elkAvailable && isFlowchart) {
      console.warn('[mermaid] ELK layout failed; re-rendering diagram with Dagre step routing:', err);
      try {
        mermaid.initialize(getMermaidThemeConfig({ dark, layout: 'dagre' }));
        const fallbackId = `mermaid-svg-${++renderSeq}`;
        const { svg, bindFunctions } = await mermaid.render(fallbackId, source);
        box.innerHTML = svg;
        bindFunctions?.(box);
        decorateRenderedSvg(box, summary);
        mermaid.initialize(getMermaidThemeConfig({ dark, layout: 'elk' }));
        return;
      } catch (fallbackErr) {
        mermaid.initialize(getMermaidThemeConfig({ dark, layout: 'elk' }));
        renderInlineError(box, source, fallbackErr);
        return;
      }
    }
    renderInlineError(box, source, err);
  }
}

/** Toggles an eligible linear 6+ diagram card between compact stepper and Mermaid SVG view. */
export async function toggleDiagramView(card) {
  const box = card?.querySelector('.diagram');
  if (!box) return;
  const nextView = card.dataset.diagramView === 'diagram' ? 'stepper' : 'diagram';
  card.dataset.diagramView = nextView;
  await renderSingleDiagram(box, { stepper: true });
}

/** Renders all `.mermaid` containers within `target`. */
export async function renderMermaidDiagrams(target = document, { stepper = true } = {}) {
  const nodes = [...target.querySelectorAll('.mermaid')];
  if (!nodes.length) return;
  for (const node of nodes) {
    await renderSingleDiagram(node, { stepper });
  }
}

/** Re-initializes Mermaid for the active theme and re-renders all stored diagram SVGs. */
export async function rerenderAllDiagrams() {
  const nodes = [...document.querySelectorAll('.diagram-card .diagram')];
  if (!nodes.length) return;
  const diagramNodes = nodes.filter((n) => n.closest('.diagram-card')?.dataset.diagramView !== 'stepper');
  if (!diagramNodes.length) return;
  await ensureMermaidReady();
  mermaid.initialize(getMermaidThemeConfig({ dark: isDarkTheme(), layout: elkAvailable ? 'elk' : 'dagre' }));
  for (const node of diagramNodes) {
    await renderSingleDiagram(node, { stepper: node.closest('.diagram-card')?.dataset.noStepper !== 'true' });
  }
}
