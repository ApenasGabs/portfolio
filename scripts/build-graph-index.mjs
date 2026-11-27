#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const OWNER = process.env.GITHUB_OWNER || "ApenasGabs";
const OUT_FILE = process.argv[2] || new URL("../src/data/graphIndex.json", import.meta.url).pathname;

/** Adds https:// to protocol-less homepages and drops non-http(s) values. */
const normalizeExternalUrl = (raw) => {
  const value = (raw || "").trim();
  if (!value) return null;
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, "")}`;
  try {
    const url = new URL(candidate);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname.includes(".")) return null;
    return candidate;
  } catch {
    return null;
  }
};

const QUERY = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    login
    name
    avatarUrl
    bio
    location
    websiteUrl
    url
    followers { totalCount }
    following { totalCount }
    repositories(first: 20, after: $cursor, ownerAffiliations: OWNER, orderBy: {field: UPDATED_AT, direction: DESC}) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        databaseId
        name
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        isFork
        isArchived
        updatedAt
        primaryLanguage { name color }
        languages(first: 8, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
        repositoryTopics(first: 12) {
          nodes { topic { name } }
        }
        packageJson: object(expression: "HEAD:package.json") { ... on Blob { text } }
        goMod: object(expression: "HEAD:go.mod") { ... on Blob { text } }
        pomXml: object(expression: "HEAD:pom.xml") { ... on Blob { text } }
        dockerfile: object(expression: "HEAD:Dockerfile") { ... on Blob { text } }
        readme: object(expression: "HEAD:README.md") { ... on Blob { text } }
      }
    }
  }
}
`;

async function queryGitHubGraphQL(cursor = null) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (token) {
        const res = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "apenasgabs-portfolio-indexer",
          },
          body: JSON.stringify({ query: QUERY, variables: { login: OWNER, cursor } }),
        });
        if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
        const json = await res.json();
        if (json.errors) throw new Error(JSON.stringify(json.errors));
        return json;
      }

      const args = ["api", "graphql", "-f", `query=${QUERY}`, "-f", `login=${OWNER}`];
      if (cursor) args.push("-f", `cursor=${cursor}`);
      const out = execFileSync("gh", args, { maxBuffer: 64 * 1024 * 1024, encoding: "utf8" });
      return JSON.parse(out);
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1200 * attempt));
    }
  }
}

function cleanDescription(raw) {
  if (!raw) return "";
  const cleaned = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.startsWith("http") || cleaned.length < 12) return "";
  return cleaned.slice(0, 160);
}

const TECH_RULES = [
  { id: "React", color: "#38bdf8", pkg: ["react", "react-dom"], rx: /\breact(?:\.js|js)?\b/i },
  { id: "Next.js", color: "#e2e8f0", pkg: ["next"], rx: /\bnext(?:\.js|js)\b/i },
  { id: "Vite", color: "#a78bfa", pkg: ["vite"], rx: /\bvite\b/i },
  { id: "Tailwind CSS", color: "#2dd4bf", pkg: ["tailwindcss", "@tailwindcss/vite"], rx: /\btailwind(?:css)?\b/i },
  { id: "Three.js", color: "#f472b6", pkg: ["three", "@react-three/fiber"], rx: /\bthree(?:\.js|js)?\b/i },
  { id: "Node.js", color: "#4ade80", pkg: ["express", "fastify", "@types/node", "tsx"], rx: /\bnode(?:\.js|js)?\b/i },
  { id: "Hono", color: "#fb923c", pkg: ["hono", "@hono/node-server"], rx: /\bhono\b/i },
  { id: "Express", color: "#94a3b8", pkg: ["express"], rx: /\bexpress(?:\.js)?\b/i },
  { id: "NestJS", color: "#f43f5e", pkg: ["@nestjs/core"], rx: /\bnestjs\b/i },
  { id: "Spring Boot", color: "#22c55e", xml: ["spring-boot"], rx: /\bspring\s*boot\b/i },
  { id: "Playwright", color: "#34d399", pkg: ["playwright", "playwright-core", "@playwright/test"], rx: /\bplaywright\b/i },
  { id: "Vitest", color: "#facc15", pkg: ["vitest"], rx: /\bvitest\b/i },
  { id: "Supabase", color: "#10b981", pkg: ["@supabase/supabase-js"], rx: /\bsupabase\b/i },
  { id: "SQLite", color: "#60a5fa", pkg: ["better-sqlite3", "sqlite3", "@libsql/client"], rx: /\bsqlite\b/i },
  { id: "Drizzle ORM", color: "#a3e635", pkg: ["drizzle-orm"], rx: /\bdrizzle\b/i },
  { id: "Prisma", color: "#818cf8", pkg: ["prisma", "@prisma/client"], rx: /\bprisma\b/i },
  { id: "Zustand", color: "#fbbf24", pkg: ["zustand"], rx: /\bzustand\b/i },
  { id: "GraphQL", color: "#e879f9", pkg: ["graphql", "@apollo/client"], rx: /\bgraphql\b/i },
  { id: "Docker", color: "#0ea5e9", hasDocker: true, rx: /\bdocker(?:-compose)?\b/i },
  { id: "Flask / FastAPI", color: "#2dd4bf", rx: /\b(?:flask|fastapi)\b/i },
];

const CONCEPT_RULES = [
  { id: "Agentes IA & LLM", color: "#c084fc", rx: /\b(agente?s?\s+ia|multi-agent|llm|gemini|claude|openai|anthropic|ai\s+agent|orquestrador)\b/i },
  { id: "MCP (Model Context)", color: "#e879f9", rx: /\b(model\s+context\s+protocol|\bmcp\b|@modelcontextprotocol)\b/i },
  { id: "Homelab & Self-Host", color: "#38bdf8", rx: /\b(homelab|zimaos|casaos|self-host|cloudflare\s+tunnel|tailscale|pihole)\b/i },
  { id: "Crawler & Scraping", color: "#fb923c", rx: /\b(crawler|scrap(?:er|ing)|ats\b|gupy|greenhouse|browserless|puppeteer)\b/i },
  { id: "Automação & Bots", color: "#f97316", rx: /\b(automa(?:ção|cao|tion)|bot\b|discord\.js|whatsapp|baileys|cron|sync-bot|webhook)\b/i },
  { id: "Vagas & Carreira", color: "#60a5fa", rx: /\b(vagas|jobs?finder|emprego|carreira|recrutamento|ats|curr[ií]culo|guia-ti)\b/i },
  { id: "Finanças & Preços", color: "#34d399", rx: /\b(pre[çc]os?|fiis?\b|investimento|infla[çc][ãa]o|livepix|pix\b|racha|despesas|financeiro|nfc-?e)\b/i },
  { id: "Compras & Estoque", color: "#4ade80", rx: /\b(estoque|wishlist|compras|mercado|despensa|querocomprar|meuestoque|ecommerce|e-commerce)\b/i },
  { id: "PWA & Mobile", color: "#f472b6", rx: /\b(pwa\b|vite-plugin-pwa|service\s+worker|mobile-first|react\s+native|flutter|android)\b/i },
  { id: "SDK & Design System", color: "#fbbf24", rx: /\b(sdk\b|design\s+system|template\b|component\s+library|storybook|npm\s+package)\b/i },
  { id: "Observabilidade & SRE", color: "#f43f5e", rx: /\b(telemetria|sre\b|grafana|uptime|status-hub|monitoramento|observability|healthcheck)\b/i },
  { id: "Jogos & Mídia", color: "#a78bfa", rx: /\b(ocarina|zelda|nintendo|pokopia|jkbox|ghibli|game|m[úu]sica|tabs)\b/i },
];

const LANG_COLORS = {
  TypeScript: "#38bdf8",
  JavaScript: "#fbbf24",
  Java: "#f97316",
  Python: "#2dd4bf",
  Go: "#00add8",
  Rust: "#fb7185",
  HTML: "#f43f5e",
  CSS: "#a78bfa",
  SCSS: "#ec4899",
  Shell: "#94a3b8",
  Dockerfile: "#0ea5e9",
  Kotlin: "#c084fc",
  Vue: "#4ade80",
  "C#": "#818cf8",
  C: "#64748b",
  "C++": "#60a5fa",
};

const FLAGSHIPS = new Set([
  "KrakenBridge-Web",
  "querovagas",
  "meuestoque",
  "querocomprar",
  "guia-ti",
  "portfolio",
  "livepix-react-sdk",
  "agent-standards",
  "JobsFinder",
  "status-hub",
]);

let cursor = null;
let userProfile = null;
const rawRepos = [];

while (true) {
  const res = await queryGitHubGraphQL(cursor);
  const u = res.data.user;
  if (!userProfile) {
    userProfile = {
      login: u.login,
      name: u.name,
      avatar_url: u.avatarUrl,
      bio: u.bio,
      location: u.location,
      blog: u.websiteUrl,
      html_url: u.url,
      public_repos: u.repositories.totalCount,
      followers: u.followers.totalCount,
      following: u.following.totalCount,
    };
  }
  rawRepos.push(...u.repositories.nodes);
  if (!u.repositories.pageInfo.hasNextPage || rawRepos.length >= 250) break;
  cursor = u.repositories.pageInfo.endCursor;
}

const nodesMap = new Map();
const edges = [];
const edgeSet = new Set();

function ensureNode(id, data) {
  if (!nodesMap.has(id)) nodesMap.set(id, { id, degree: 0, ...data });
  return nodesMap.get(id);
}

function addEdge(source, target, weight, kind) {
  const key = `${source}->${target}`;
  if (edgeSet.has(key)) return;
  edgeSet.add(key);
  edges.push({ source, target, weight, kind });
  const s = nodesMap.get(source);
  const t = nodesMap.get(target);
  if (s) s.degree += 1;
  if (t) t.degree += 1;
}

const enrichedRepos = [];

for (const r of rawRepos) {
  if (r.isFork && r.stargazerCount === 0 && !FLAGSHIPS.has(r.name)) continue;

  const repoNodeId = `repo:${r.name}`;
  const isFlagship = FLAGSHIPS.has(r.name);
  const langs = (r.languages?.edges || []).map((e) => ({
    name: e.node.name,
    color: LANG_COLORS[e.node.name] || e.node.color || "#94a3b8",
    size: e.size,
  }));

  const pkgDeps = new Set();
  if (r.packageJson?.text) {
    try {
      const pkg = JSON.parse(r.packageJson.text);
      for (const k of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
        pkgDeps.add(k.toLowerCase());
      }
    } catch {
      // ignore invalid package.json
    }
  }

  const readmeSnippet = (r.readme?.text || "").slice(0, 6000);
  const topics = (r.repositoryTopics?.nodes || []).map((n) => n.topic.name);
  const combinedText = [
    r.name,
    r.description || "",
    topics.join(" "),
    readmeSnippet,
    r.goMod?.text?.slice(0, 1500) || "",
  ].join("\n");

  const repoTechs = new Set();
  const repoConcepts = new Set();

  ensureNode(repoNodeId, {
    type: "repo",
    label: r.name,
    description: "",
    url: r.url,
    homepage: normalizeExternalUrl(r.homepageUrl) || "",
    stars: r.stargazerCount,
    forks: r.forkCount,
    updatedAt: r.updatedAt,
    primaryLanguage: r.primaryLanguage?.name || langs[0]?.name || null,
    flagship: isFlagship,
    color: isFlagship ? "#f8fafc" : "#cbd5e1",
  });

  const totalBytes = langs.reduce((acc, l) => acc + l.size, 0) || 1;
  langs.forEach((l, idx) => {
    const share = l.size / totalBytes;
    if (idx > 0 && ["HTML", "CSS", "Shell", "Dockerfile"].includes(l.name) && share < 0.05) {
      return;
    }
    const techId = `tech:${l.name}`;
    ensureNode(techId, {
      type: "tech",
      subtype: "language",
      label: l.name,
      color: LANG_COLORS[l.name] || l.color || "#38bdf8",
    });
    repoTechs.add(l.name);
    addEdge(repoNodeId, techId, idx === 0 ? 1.0 : 0.75, "language");
  });

  if (r.goMod?.text && !repoTechs.has("Go")) {
    ensureNode("tech:Go", { type: "tech", subtype: "language", label: "Go", color: "#00add8" });
    repoTechs.add("Go");
    addEdge(repoNodeId, "tech:Go", 0.9, "language");
  }

  for (const rule of TECH_RULES) {
    let matched = false;
    let weight = 0.65;
    if (rule.pkg && rule.pkg.some((p) => pkgDeps.has(p))) {
      matched = true;
      weight = 0.9;
    } else if (rule.xml && r.pomXml?.text && rule.xml.some((x) => r.pomXml.text.toLowerCase().includes(x))) {
      matched = true;
      weight = 0.9;
    } else if (rule.hasDocker && r.dockerfile?.text) {
      matched = true;
      weight = 0.85;
    } else if (rule.rx && rule.rx.test(combinedText)) {
      matched = true;
      weight = 0.6;
    }

    if (matched) {
      const techId = `tech:${rule.id}`;
      ensureNode(techId, {
        type: "tech",
        subtype: "framework",
        label: rule.id,
        color: rule.color,
      });
      repoTechs.add(rule.id);
      addEdge(repoNodeId, techId, weight, "tech");
    }
  }

  for (const c of CONCEPT_RULES) {
    if (c.rx.test(combinedText)) {
      const cid = `concept:${c.id}`;
      ensureNode(cid, { type: "concept", label: c.id, color: c.color });
      repoConcepts.add(c.id);
      addEdge(repoNodeId, cid, 0.7, "concept");
    }
  }

  let summary = cleanDescription(r.description || "");
  if (!summary && readmeSnippet) {
    const candidates = readmeSnippet
      .split("\n")
      .map((line) => cleanDescription(line))
      .filter((line) => line.length >= 24 && !line.startsWith("|"));
    if (candidates[0]) summary = candidates[0];
  }
  nodesMap.get(repoNodeId).description = summary;

  enrichedRepos.push({
    id: r.databaseId || r.name,
    nodeId: repoNodeId,
    name: r.name,
    description: summary || null,
    html_url: r.url,
    homepage: normalizeExternalUrl(r.homepageUrl),
    language: r.primaryLanguage?.name || langs[0]?.name || null,
    languages: langs.map((l) => l.name),
    techs: Array.from(repoTechs),
    concepts: Array.from(repoConcepts),
    stargazers_count: r.stargazerCount,
    forks_count: r.forkCount,
    fork: r.isFork,
    flagship: isFlagship,
    updated_at: r.updatedAt,
  });
}

const nodes = Array.from(nodesMap.values()).filter((n) =>
  n.type === "repo" ? n.degree > 0 || n.flagship : n.degree >= 1
);
const validIds = new Set(nodes.map((n) => n.id));
const validEdges = edges.filter((e) => validIds.has(e.source) && validIds.has(e.target));

const payload = {
  generatedAt: new Date().toISOString(),
  user: userProfile,
  stats: {
    totalNodes: nodes.length,
    repoNodes: nodes.filter((n) => n.type === "repo").length,
    techNodes: nodes.filter((n) => n.type === "tech").length,
    conceptNodes: nodes.filter((n) => n.type === "concept").length,
    totalEdges: validEdges.length,
  },
  nodes,
  edges: validEdges,
  repos: enrichedRepos.filter((r) => validIds.has(r.nodeId)),
};

fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
console.log("Graph index generated:", payload.stats);
