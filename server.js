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

const SPACES = {
  gitbook: {
    user: ["gitbook/user", "README.md", "SUMMARY.md", "## "],
    developer: ["gitbook/developer", "README.md", "SUMMARY.md", "## "],
  },
  confluence: {
    user: ["confluence/user", "index.md", "index.md", "### "],
    developer: ["confluence/developer", "index.md", "index.md", "### "],
  },
};

const SPACE_TITLES = {
  user: "User Guide",
  developer: "Developer Reference",
};

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
  return (await fs.readFile(filePath, "utf8")).replace(/^\uFEFF/, "");
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

async function parseNavigation(filePath, marker) {
  const sections = [];

  for (const line of (await readText(filePath)).split(/\r?\n/)) {
    const stripped = line.trim();
    if (stripped.startsWith(marker)) {
      sections.push({
        title: stripped.slice(marker.length).replace(/[*_`]/g, "").trim(),
        pages: [],
      });
    }

    const match = stripped.match(/^[-*]\s+\[(.+?)\]\((.+?)\)/);
    if (match && !["README.md", "index.md"].includes(match[2])) {
      if (sections.length === 0) {
        sections.push({ title: "General", pages: [] });
      }
      sections.at(-1).pages.push({ title: match[1], path: match[2] });
    }
  }

  return sections.filter((section) => section.pages.length > 0);
}

export async function buildManifest() {
  const spaces = {};
  const index = [];

  for (const [source, sourceSpaces] of Object.entries(SPACES)) {
    for (const [space, [folder, overview, navigation, marker]] of Object.entries(
      sourceSpaces,
    )) {
      const base = path.join(DOCS, folder);
      const sections = await parseNavigation(path.join(base, navigation), marker);
      spaces[`${source}/${space}`] = {
        title: SPACE_TITLES[space],
        base: `docs/${folder}`,
        overview,
        sections,
      };

      const pages = [
        ["", "Overview", overview],
        ...sections.flatMap((section) =>
          section.pages.map((page) => [section.title, page.title, page.path]),
        ),
      ];

      for (const [section, title, relativePath] of pages) {
        const filePath = path.join(base, relativePath);
        const content = await fs
          .readFile(filePath, "utf8")
          .then((text) => text.replace(/^\uFEFF/, ""))
          .catch((error) => {
            if (error.code === "ENOENT") return "";
            throw error;
          });
        const withoutCode = content.replace(/```[\s\S]*?```/g, "");

        index.push({
          space: `${source}/${space}`,
          section,
          title,
          path: relativePath,
          headings: [...withoutCode.matchAll(/^#{2,3}\s+(.+)$/gm)]
            .slice(0, 30)
            .map((match) => match[1]),
          text: toPlainText(content).slice(0, 1500),
        });
      }
    }
  }

  return { spaces, index };
}

function resolveDocPath(relativePath) {
  if (
    typeof relativePath !== "string" ||
    !/^docs\/[\w./-]+\.(?:md|xml)$/u.test(relativePath) ||
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

function createSaveQueue() {
  let queue = Promise.resolve();
  return (operation) => {
    const result = queue.then(operation, operation);
    queue = result.catch(() => {});
    return result;
  };
}

export function createApp(config) {
  const app = express();
  const save = createSaveQueue();

  app.disable("x-powered-by");
  app.use(compression());

  app.get("/api/manifest", async (request, response, next) => {
    try {
      const manifest = await buildManifest();
      manifest.editing = { passwordRequired: true, github: true };
      response.json(manifest);
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
        content: content.toString("utf8").replace(/^\uFEFF/, ""),
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

    const target = scope === "all" ? DOCS : path.join(DOCS, scope);
    const name =
      scope === "all" ? "docs.zip" : `docs-${scope.replaceAll("/", "-")}.zip`;
    response.attachment(name);
    try {
      const archive = new yazl.ZipFile();
      for (const filePath of await listFiles(target)) {
        archive.addFile(filePath, path.relative(ROOT, filePath));
      }
      archive.outputStream.on("error", next);
      archive.outputStream.pipe(response);
      archive.end();
    } catch (error) {
      next(error);
    }
  });

  app.post(
    "/api/save",
    (request, response, next) => {
      if (!passwordsMatch(request.get("X-Password") || "", config.editPassword)) {
        setTimeout(() => response.status(401).json({ error: "Wrong password" }), 500);
        return;
      }
      next();
    },
    express.json({ limit: MAX_REQUEST_SIZE }),
    async (request, response, next) => {
      const { files, author } = request.body ?? {};
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

          let commit = null;
          let warning = null;
          try {
            const cleanAuthor = String(author || "").trim().slice(0, 60);
            const message = `Edit ${Object.keys(saved).join(", ")}` +
              (cleanAuthor ? `\n\nEdited by ${cleanAuthor}` : "");
            commit = await githubCommit(config, saved, message);
          } catch (error) {
            logger.error("Could not sync saved edits to GitHub:", error);
            warning = `Saved on the server, but the GitHub commit failed: ${error.message}`;
          }

          return { status: 200, body: { hashes, commit, warning } };
        });
        response.status(result.status).json(result.body);
      } catch (error) {
        next(error);
      }
    },
  );

  app.use("/docs", express.static(DOCS, { fallthrough: true, index: false }));
  app.use(express.static(FRONTEND, { fallthrough: true }));
  app.use((request, response, next) => {
    if (request.path.startsWith("/docs/")) {
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
