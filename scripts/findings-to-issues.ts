// Converte o findings.json da skill security-audit em issues e agrupa clusters
// para o Wayfinder. Os nomes de campo variam entre versões da skill: o mapa
// FIELDS abaixo tenta os nomes mais comuns; confira contra o schema que vem em
// .claude/skills/security-audit/ e ajuste se preciso.
// Uso: node scripts/findings-to-issues.ts security-report/findings.json [--dry-run]
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

type Finding = Record<string, unknown>;
const FIELDS = {
  id: ["id", "finding_id", "key"],
  title: ["title", "name", "summary"],
  severity: ["severity", "risk", "level"],
  category: ["category", "type", "class", "cwe", "rule"],
  file: ["file", "path", "location.file", "location.path", "affected_file"],
  line: ["line", "location.line", "start_line"],
  description: ["description", "details", "explanation"],
  evidence: ["evidence", "proof", "trace", "data_flow"],
  impact: ["impact", "consequence"],
  fix: ["recommendation", "remediation", "fix", "suggested_fix"],
  refuted: ["refuted", "false_positive", "rejected"],
  verified: ["verified", "confirmed", "validated"],
  architectural: ["architectural", "systemic"],
};

const get = (o: Finding, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Finding)[k] : undefined), o);
const pick = (o: Finding, keys: string[]): unknown => {
  for (const k of keys) {
    const v = get(o, k);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
};
const str = (v: unknown) => (v === undefined ? "" : typeof v === "string" ? v : JSON.stringify(v, null, 2));

const file = process.argv[2];
const dry = process.argv.includes("--dry-run");
if (!file) {
  console.error("uso: findings-to-issues.ts <findings.json> [--dry-run]");
  process.exit(2);
}

const raw = JSON.parse(readFileSync(file, "utf8"));
const findings: Finding[] = Array.isArray(raw) ? raw : (raw.findings ?? raw.results ?? []);

const SEV: Record<string, string> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  moderate: "medium",
  low: "low",
  info: "low",
  informational: "low",
};
const area = (p: string) =>
  p.startsWith("apps/api")
    ? "backend"
    : p.startsWith("apps/web")
      ? "frontend"
      : p.startsWith("apps/mobile")
        ? "mobile"
        : p.startsWith("packages/db")
          ? "database"
          : p.startsWith("packages/ui")
            ? "frontend"
            : "devops";

function gh(...a: string[]): string {
  if (dry) {
    console.log("[dry-run] gh", a.map((x) => (x.length > 80 ? x.slice(0, 80) + "…" : x)).join(" "));
    return "";
  }
  return execFileSync("gh", a, { encoding: "utf8" }).trim();
}

type Created = { number: string; category: string; module: string; architectural: boolean; id: string };
const created: Created[] = [];

for (const f of findings) {
  if (pick(f, FIELDS.refuted) === true) continue;
  if (pick(f, FIELDS.verified) === false) continue;

  const id = str(pick(f, FIELDS.id));
  const title = str(pick(f, FIELDS.title)) || "achado de segurança";
  const severity = SEV[str(pick(f, FIELDS.severity)).toLowerCase()] ?? "medium";
  const category = str(pick(f, FIELDS.category)) || "geral";
  const path = str(pick(f, FIELDS.file));
  const line = str(pick(f, FIELDS.line));
  const fingerprint = createHash("sha1").update(`${path}|${category}|${title}`).digest("hex").slice(0, 12);

  const existing = dry
    ? ""
    : gh(
        "issue",
        "list",
        "--state",
        "open",
        "--search",
        `"Fingerprint: ${fingerprint}" in:body`,
        "--json",
        "number",
        "-q",
        ".[0].number",
      );
  if (existing) {
    gh(
      "issue",
      "comment",
      existing,
      "--body",
      `Achado reapareceu na auditoria de ${new Date().toISOString().slice(0, 10)}.`,
    );
    continue;
  }

  const body = [
    `**Severidade:** ${severity} · **Categoria:** ${category}${id ? ` · **ID:** ${id}` : ""}`,
    path ? `**Local:** \`${path}${line ? `:${line}` : ""}\`` : "",
    `\n### Descrição\n${str(pick(f, FIELDS.description)) || "—"}`,
    `\n### Evidência\n\`\`\`\n${str(pick(f, FIELDS.evidence)) || "—"}\n\`\`\``,
    `\n### Impacto\n${str(pick(f, FIELDS.impact)) || "—"}`,
    `\n### Correção sugerida\n${str(pick(f, FIELDS.fix)) || "—"}`,
    `\n### Critério do teste de regressão (preencher na triagem)\n- Given ...\n  When ...\n  Then ...`,
    `\nFingerprint: ${fingerprint}`,
  ]
    .filter(Boolean)
    .join("\n");

  const labels = ["type:security", `severity:${severity}`, `area:${area(path)}`, "status:draft"];
  if (severity === "critical" || severity === "high") labels.push("risk:high");
  const url = gh(
    "issue",
    "create",
    "--title",
    `security: ${title}`.slice(0, 250),
    "--body",
    body,
    "--label",
    labels.join(","),
  );
  const number = url.split("/").pop() || "?";
  created.push({
    number,
    category,
    module: path.split("/").slice(0, 3).join("/"),
    architectural: pick(f, FIELDS.architectural) === true,
    id,
  });

  if (severity === "critical") {
    try {
      execFileSync(
        "bash",
        ["scripts/notify-discord.sh", "alert", `🔴 Vulnerabilidade crítica: ${title} ${url}`],
        { stdio: "inherit" },
      );
    } catch {}
  }
}

// clusters para o Wayfinder: 3+ achados da mesma categoria ou módulo, ou marcados como arquiteturais
const groups = new Map<string, Created[]>();
for (const c of created) {
  for (const key of [`categoria:${c.category}`, `modulo:${c.module}`]) {
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
}
const seen = new Set<string>();
const clusters = [...groups.entries()]
  .filter(([, items]) => items.length >= 3)
  .map(([key, items]) => ({ key, issues: items.map((i) => i.number) }))
  .filter((c) => {
    const k = [...c.issues].sort().join(",");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
for (const c of created.filter((x) => x.architectural))
  clusters.push({ key: `arquitetural:${c.id || c.number}`, issues: [c.number] });

if (clusters.length) writeFileSync(join(dirname(file), "clusters.json"), JSON.stringify(clusters, null, 2));
console.log(`Issues criadas: ${created.length} · clusters para Wayfinder: ${clusters.length}`);
