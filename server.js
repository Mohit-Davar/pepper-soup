import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import compression from "compression";
import "dotenv/config";
import express from "express";
import yazl from "yazl";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(ROOT, "docs");
const FRONTEND = path.join(ROOT, "frontend");
const MAX_REQUEST_SIZE = "5mb";
const logger = console;

/** Published documentation: only these folders are ever served to readers. */
const PUBLISHED = ["gitbook", "confluence"];

/** Review material: served only to signed-in reviewers. */
const NEEDS_REVIEW = path.join(DOCS, "needs-review.md");
const EVIDENCE = path.join(DOCS, "evidence-map.json");
const REVIEW_STATE = path.join(DOCS, "review.json");
const REVIEW_STATE_REPO_PATH = "docs/review.json";

const SPACES = {
  "gitbook/user": { folder: "gitbook/user", overview: "README.md", nav: "SUMMARY.md" },
  "gitbook/developer": { folder: "gitbook/developer", overview: "README.md", nav: "SUMMARY.md" },
  "confluence/user": { folder: "confluence/user", overview: "index.md", nav: "index.md" },
  "confluence/developer": { folder: "confluence/developer", overview: "index.md", nav: "index.md" },
};

const SPACE_TITLES = {
  user: "User Guide",
  developer: "Developer Reference",
};

const AUDIENCE_SPACE = { end_user: "user", contributor: "developer" };

export function loadConfig(env = process.env) {
  function required(name) {
    const value = env[name]?.trim();
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
  }

  const portValue = required("PORT");
  if (!/^\d+$/.test(portValue)) {
    throw new Error("PORT must be an integer");
  }
  const port = Number(portValue);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be between 1 and 65535");
  }

  return {
    port,
    editPassword: required("EDIT_PASSWORD"),
    githubToken: required("GITHUB_TOKEN"),
    githubRepo: required("GITHUB_REPO"),
    githubBranch: required("GITHUB_BRANCH"),
  };
}

async function readText(filePath) {
  return (await fs.readFile(filePath, "utf8")).replace(/^﻿/, "");
}

async function readOptional(filePath) {
  try {
    return await readText(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return listFiles(entryPath);
        return entry.isFile() ? [entryPath] : [];
      }),
  );
  return nested.flat();
}

function toPlainText(markdown) {
  return markdown
    .replace(/<!--[\s\S]*?-->|```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>|[#*_`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------- navigation

/**
 * Reads a nested bullet list of links (SUMMARY.md or a Confluence index.md)
 * into a tree. Two spaces of indentation make one level. The root overview link
 * is left out: the site has its own overview page.
 */
export function parseTree(markdown) {
  const root = [];
  const stack = [{ depth: -1, children: root }];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^(\s*)[*-]\s+\[(.+?)\]\((.+?)\)\s*$/);
    if (!match) continue;
    const depth = Math.floor(match[1].replace(/\t/g, "  ").length / 2);
    const target = match[3];
    if (depth === 0 && /^(README|index)\.md$/.test(target)) continue;
    const node = { title: match[2].replace(/\\([[\]\\])/g, "$1"), path: target, children: [] };
    while (stack.at(-1).depth >= depth) stack.pop();
    stack.at(-1).children.push(node);
    stack.push({ depth, children: node.children });
  }
  return root;
}

let manifestCache = null;

export async function buildManifest() {
  if (manifestCache) return manifestCache;
  const spaces = {};
  const index = [];

  for (const [key, { folder, overview, nav }] of Object.entries(SPACES)) {
    const base = path.join(DOCS, folder);
    const navText = await readOptional(path.join(base, nav));
    const tree = navText ? parseTree(navText) : [];
    const space = key.split("/")[1];
    spaces[key] = { title: SPACE_TITLES[space], base: `docs/${folder}`, overview, tree };

    const visit = async (nodes, section) => {
      for (const node of nodes) {
        if (!node.children.length) {
          const content = (await readOptional(path.join(base, node.path))) ?? "";
          const withoutCode = content.replace(/```[\s\S]*?```/g, "");
          index.push({
            space: key,
            section,
            title: node.title,
            path: node.path,
            headings: [...withoutCode.matchAll(/^#{2,3}\s+(.+)$/gm)]
              .slice(0, 40)
              .map((match) => match[1]),
            text: toPlainText(content).slice(0, 2000),
          });
        }
        await visit(node.children, node.children.length ? node.title : section);
      }
    };
    await visit(tree, "");
  }

  manifestCache = { spaces, index };
  return manifestCache;
}

// ---------------------------------------------------------------- review data

/**
 * Parses needs-review.md. Each entry is a "### NR-<id> · <Kind>" heading followed
 * by "- key: value" lines and an optional "- sources:" list.
 */
export function parseNeedsReview(markdown) {
  const entries = [];
  const blocks = markdown.split(/^### /m).slice(1);
  for (const block of blocks) {
    const [heading, ...lines] = block.split(/\r?\n/);
    const head = heading.match(/^(NR-[0-9a-f]+)\s+·\s+(.+)$/);
    if (!head) continue;
    const entry = { id: head[1], kind: head[2].trim(), sources: [] };
    let inSources = false;
    for (const line of lines) {
      if (/^- sources:\s*$/.test(line)) {
        inSources = true;
        continue;
      }
      const field = line.match(/^- (\w+):\s*(.*)$/);
      if (field) {
        inSources = false;
        entry[field[1]] = field[2].trim();
        continue;
      }
      if (inSources) {
        const source = line.match(/^\s+-\s+`([^`]*)`\s*(?:"([\s\S]*)")?\s*$/);
        if (source) entry.sources.push({ where: source[1], quote: source[2] ?? "" });
        else if (line.trim().startsWith("- ")) {
          entry.sources.push({ where: line.trim().slice(2), quote: "" });
        }
      }
    }
    if (entry.published) entry.published = entry.published.replace(/^"([\s\S]*)"$/, "$1");
    if (entry.page) {
      entry.notPublished = /\(not published\)\s*$/.test(entry.page);
      // "gitbook/user/x.md" → "user/x.md": the same page exists in both outputs
      entry.page = entry.page
        .replace(/\s*\(not published\)\s*$/, "")
        .replace(/^(?:gitbook|confluence)\//, "");
    }
    entries.push(entry);
  }
  return entries;
}

let evidenceCache = null;

/**
 * Loads evidence-map.json once (and again when the file changes) and indexes it
 * by page: "user/loan-products/fees.md" → its sections and their blocks' facts.
 */
async function evidenceIndex() {
  let stat;
  try {
    stat = await fs.stat(EVIDENCE);
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }
  if (evidenceCache?.mtime === stat.mtimeMs) return evidenceCache.byPage;

  const raw = JSON.parse(await readText(EVIDENCE));
  const byPage = new Map();
  for (const [key, section] of Object.entries(raw)) {
    const match = key.match(/^(\w+):([^#]+)#(.+)$/);
    if (!match) continue;
    const space = AUDIENCE_SPACE[match[1]];
    if (!space) continue;
    const page = `${space}/${match[2]}.md`;
    const blocks = (section.blocks ?? []).map((block) => ({
      index: block.index,
      type: block.type,
      facts: (block.facts ?? []).map((fact) => ({
        id: fact.id,
        statement: fact.statement ?? "",
        status: fact.status ?? "",
        quote: String(fact.quote ?? "").slice(0, 900),
        source: {
          title: fact.unitTitle ?? "",
          file: fact.origin?.file ?? "",
          sheet: fact.origin?.sheet ?? "",
          headings: fact.origin?.headings ?? [],
          ticket: fact.origin?.nodeId ?? "",
          rows: fact.rowRefs ?? [],
        },
      })),
    }));
    if (!byPage.has(page)) byPage.set(page, []);
    byPage.get(page).push({ key, title: section.section ?? "", blocks });
  }
  evidenceCache = { mtime: stat.mtimeMs, byPage };
  return byPage;
}

async function readReviewState() {
  const text = await readOptional(REVIEW_STATE);
  if (!text) return { issues: {} };
  return { issues: JSON.parse(text).issues ?? {} };
}

const STATUSES = new Set(["open", "resolved", "ignored"]);
const clean = (value, max) =>
  String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);

/** Sets the status of one needs-review item; returns a commit summary or an error. */
function applyStatus(state, body, author) {
  const id = String(body?.id ?? "");
  if (!/^NR-[0-9a-f]{4,}$/.test(id)) return { error: "Unknown review item." };
  if (!STATUSES.has(body.status)) return { error: "Unknown status." };
  state.issues[id] = { status: body.status, by: author, at: new Date().toISOString() };
  return { summary: `${body.status} ${id}` };
}

// ---------------------------------------------------------------- files

function resolveDocPath(relativePath) {
  if (
    typeof relativePath !== "string" ||
    !/^docs\/(?:gitbook|confluence)\/[\w./-]+\.(?:md|xml)$/u.test(relativePath) ||
    relativePath.split(/[\\/]/).includes("..")
  ) {
    return null;
  }

  const resolved = path.resolve(ROOT, relativePath);
  return resolved.startsWith(`${DOCS}${path.sep}`) ? resolved : null;
}

function hash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function passwordsMatch(provided, expected) {
  const providedHash = crypto.createHash("sha256").update(provided).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(providedHash, expectedHash);
}

async function githubCommit(config, files, message) {
  const api = `https://api.github.com/repos/${config.githubRepo}`;

  async function call(method, endpoint, body) {
    const response = await fetch(`${api}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.githubToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "docs-editor",
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(25_000),
    });
    const responseText = await response.text();
    let result = {};
    if (responseText) {
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(`GitHub returned an invalid response (${response.status})`);
      }
    }
    if (!response.ok) {
      throw new Error(
        `GitHub API request failed (${response.status}): ${
          result.message || response.statusText
        }`,
      );
    }
    return result;
  }

  const branch = encodeURIComponent(config.githubBranch);
  const parent = await call("GET", `/git/ref/heads/${branch}`);
  const baseTree = await call("GET", `/git/commits/${parent.object.sha}`);
  const tree = await call("POST", "/git/trees", {
    base_tree: baseTree.tree.sha,
    tree: Object.entries(files).map(([filePath, content]) => ({
      path: filePath,
      mode: "100644",
      type: "blob",
      content,
    })),
  });
  const commit = await call("POST", "/git/commits", {
    message,
    tree: tree.sha,
    parents: [parent.object.sha],
  });
  await call("PATCH", `/git/refs/heads/${branch}`, { sha: commit.sha });
  return commit.sha;
}

async function commitOrWarn(config, files, message) {
  try {
    return { commit: await githubCommit(config, files, message), warning: null };
  } catch (error) {
    logger.error("Could not sync to GitHub:", error);
    return {
      commit: null,
      warning: `Saved on the server, but the GitHub commit failed: ${error.message}`,
    };
  }
}

function createSaveQueue() {
  let queue = Promise.resolve();
  return (operation) => {
    const result = queue.then(operation, operation);
    queue = result.catch(() => {});
    return result;
  };
}

function authorOf(request) {
  let name = request.get("X-Author") || "";
  try {
    name = decodeURIComponent(name);
  } catch {}
  return clean(name, 60).replace(/[^\p{L}\p{N} .'_-]/gu, "") || "Reviewer";
}

export function createApp(config) {
  const app = express();
  const save = createSaveQueue();

  app.disable("x-powered-by");
  app.use(compression());

  /** Reviewer-only routes: the edit password is sent in X-Password. */
  const requireReviewer = (request, response, next) => {
    if (!passwordsMatch(request.get("X-Password") || "", config.editPassword)) {
      setTimeout(() => response.status(401).json({ error: "Wrong password" }), 500);
      return;
    }
    next();
  };

  app.get("/api/manifest", async (request, response, next) => {
    try {
      response.json(await buildManifest());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/file", async (request, response, next) => {
    const filePath = resolveDocPath(request.query.path);
    if (!filePath) {
      response.status(404).json({ error: "Not found" });
      return;
    }

    try {
      const content = await fs.readFile(filePath);
      response.json({
        content: content.toString("utf8").replace(/^﻿/, ""),
        hash: hash(content),
      });
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "EISDIR") {
        response.status(404).json({ error: "Not found" });
        return;
      }
      next(error);
    }
  });

  app.get("/api/download", async (request, response, next) => {
    const scope = request.query.scope ?? "all";
    if (
      typeof scope !== "string" ||
      (scope !== "all" &&
        !/^(?:gitbook|confluence)(?:\/(?:user|developer))?$/.test(scope))
    ) {
      response.status(400).json({ error: "Bad scope" });
      return;
    }

    // review material never leaves the server in a download
    const targets = scope === "all" ? PUBLISHED.map((name) => path.join(DOCS, name)) : [path.join(DOCS, scope)];
    const name =
      scope === "all" ? "docs.zip" : `docs-${scope.replaceAll("/", "-")}.zip`;
    response.attachment(name);
    try {
      const archive = new yazl.ZipFile();
      for (const target of targets) {
        for (const filePath of await listFiles(target)) {
          archive.addFile(filePath, path.relative(ROOT, filePath));
        }
      }
      archive.outputStream.on("error", next);
      archive.outputStream.pipe(response);
      archive.end();
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", requireReviewer, (request, response) => {
    response.json({ ok: true });
  });

  app.get("/api/review", requireReviewer, async (request, response, next) => {
    try {
      const markdown = (await readOptional(NEEDS_REVIEW)) ?? "";
      response.json({
        entries: parseNeedsReview(markdown),
        state: await readReviewState(),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/evidence", requireReviewer, async (request, response, next) => {
    const page = String(request.query.page ?? "");
    if (!/^(user|developer)\/[\w./-]+\.md$/.test(page) || page.includes("..")) {
      response.status(400).json({ error: "Bad page" });
      return;
    }
    try {
      response.json({ sections: (await evidenceIndex()).get(page) ?? [] });
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/review/status",
    requireReviewer,
    express.json({ limit: "200kb" }),
    async (request, response, next) => {
      try {
        const author = authorOf(request);
        const result = await save(async () => {
          const state = await readReviewState();
          const outcome = applyStatus(state, request.body ?? {}, author);
          if (outcome.error) return { status: 400, body: { error: outcome.error } };

          const text = `${JSON.stringify(state, null, 2)}\n`;
          await fs.writeFile(REVIEW_STATE, text);
          const { commit, warning } = await commitOrWarn(
            config,
            { [REVIEW_STATE_REPO_PATH]: text },
            `Review: ${outcome.summary}\n\nBy ${author}`,
          );
          return { status: 200, body: { state, commit, warning } };
        });
        response.status(result.status).json(result.body);
      } catch (error) {
        next(error);
      }
    },
  );

  app.post(
    "/api/save",
    requireReviewer,
    express.json({ limit: MAX_REQUEST_SIZE }),
    async (request, response, next) => {
      const { files } = request.body ?? {};
      if (
        !Array.isArray(files) ||
        files.length === 0 ||
        files.some(
          (file) =>
            !file ||
            typeof file !== "object" ||
            typeof file.content !== "string",
        )
      ) {
        response.status(400).json({ error: "Bad request" });
        return;
      }

      try {
        const result = await save(async () => {
          const targets = [];
          for (const file of files) {
            const filePath = resolveDocPath(file.path);
            if (!filePath) {
              return {
                status: 400,
                body: { error: `Cannot save ${String(file.path)}` },
              };
            }

            let current;
            try {
              current = await fs.readFile(filePath);
            } catch (error) {
              if (error.code === "ENOENT" || error.code === "EISDIR") {
                return {
                  status: 400,
                  body: { error: `Cannot save ${String(file.path)}` },
                };
              }
              throw error;
            }

            if (file.hash && hash(current) !== file.hash) {
              return {
                status: 409,
                body: {
                  error:
                    "Someone else saved this page while you were editing. Copy your text, reload and try again.",
                },
              };
            }
            targets.push({ file, filePath, current });
          }

          const saved = {};
          const hashes = {};
          for (const { file, filePath, current } of targets) {
            const bom = current.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]));
            const content = file.content.replace(/\r\n/g, "\n");
            const data = Buffer.concat([
              bom ? Buffer.from([0xef, 0xbb, 0xbf]) : Buffer.alloc(0),
              Buffer.from(content, "utf8"),
            ]);
            await fs.writeFile(filePath, data);
            saved[file.path] = data.toString("utf8");
            hashes[file.path] = hash(data);
          }
          manifestCache = null;

          const author = authorOf(request);
          const { commit, warning } = await commitOrWarn(
            config,
            saved,
            `Edit ${Object.keys(saved).join(", ")}\n\nEdited by ${author}`,
          );
          return { status: 200, body: { hashes, commit, warning } };
        });
        response.status(result.status).json(result.body);
      } catch (error) {
        next(error);
      }
    },
  );

  // Only the published folders are reachable as static files.
  for (const name of PUBLISHED) {
    app.use(`/docs/${name}`, express.static(path.join(DOCS, name), { fallthrough: true, index: false }));
  }
  app.use(express.static(FRONTEND, { fallthrough: true }));
  app.use((request, response, next) => {
    if (request.path.startsWith("/docs/") || request.path.startsWith("/api/")) {
      response.status(404).json({ error: "Not found" });
      return;
    }
    response.sendFile(path.join(FRONTEND, "index.html"), (error) => {
      if (error) next(error);
    });
  });

  app.use((error, request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }
    if (error.type === "entity.too.large") {
      response.status(413).json({ error: "Request too large" });
      return;
    }
    if (error instanceof SyntaxError && "body" in error) {
      response.status(400).json({ error: "Bad request" });
      return;
    }
    logger.error("Request failed:", error);
    response.status(500).json({ error: "Internal server error" });
  });

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const config = loadConfig();
    createApp(config).listen(config.port, "0.0.0.0", () => {
      logger.info(`Documentation site listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error(error.message);
    process.exitCode = 1;
  }
}
