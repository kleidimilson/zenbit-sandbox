// Converte specs/<feature>/tasks.md (Spec Kit) em issues status:draft.
// Puxa os cenários Given/When/Then da user story correspondente em spec.md.
// Uso: node scripts/tasks-to-issues.ts specs/003-checkout/tasks.md [--milestone "Sprint 12"] [--dry-run]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const tasksPath = args[0];
const dry = args.includes("--dry-run");
const milestone = args.includes("--milestone") ? args[args.indexOf("--milestone") + 1] : "";
if (!tasksPath || !existsSync(tasksPath)) {
  console.error("uso: tasks-to-issues.ts <tasks.md> [--milestone X] [--dry-run]");
  process.exit(2);
}

const specPath = join(dirname(tasksPath), "spec.md");
const spec = existsSync(specPath) ? readFileSync(specPath, "utf8") : "";

// "- [ ] T014 [P] [US2] Criar endpoint de checkout em apps/api/src/routes/checkout.ts"
const TASK = /^\s*-\s*\[\s?\]\s*(T\d+)\s*((?:\[[^\]]+\]\s*)*)(.+)$/;

function scenarios(story: string): string[] {
  if (!spec || !story) return [];
  const n = story.replace(/\D/g, "");
  const start = spec.search(new RegExp(`^#{2,4}\\s*User Story ${n}\\b`, "mi"));
  if (start < 0) return [];
  const rest = spec.slice(start + 1);
  const end = rest.search(/^#{2,4}\s/m);
  const section = end >= 0 ? rest.slice(0, end) : rest;
  return section
    .split("\n")
    .filter((l) => /\bGiven\b/i.test(l))
    .map((l) =>
      l
        .replace(/^\s*\d+\.\s*/, "")
        .replace(/\*\*/g, "")
        .trim(),
    );
}

const area = (t: string) =>
  /apps\/api|backend|endpoint|rota|api\b/i.test(t)
    ? "backend"
    : /apps\/web|página|tela web|next/i.test(t)
      ? "frontend"
      : /apps\/mobile|react native|expo/i.test(t)
        ? "mobile"
        : /packages\/db|migration|schema|prisma/i.test(t)
          ? "database"
          : "devops";

function gh(...a: string[]): string {
  if (dry) {
    console.log("[dry-run] gh", a.map((x) => (x.length > 70 ? x.slice(0, 70) + "…" : x)).join(" "));
    return "";
  }
  return execFileSync("gh", a, { encoding: "utf8" }).trim();
}

// Detalhe opcional que o agente planner escreve indentado sob a task:
//   - área: backend · risco: low · tipo: feature
//   - testes: unit, integração
//   - depende de: T001
type Detail = { area?: string; risk?: string; type?: string; tests?: string; deps?: string };
function detail(lines: string[], from: number): Detail {
  const d: Detail = {};
  for (let j = from; j < lines.length && /^\s+-\s/.test(lines[j]) && !TASK.test(lines[j]); j++) {
    const l = lines[j].replace(/^\s+-\s*/, "");
    for (const part of l.split("·").map((p) => p.trim())) {
      const [k, ...v] = part.split(":");
      const key = k
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const val = v.join(":").trim();
      if (key === "area") d.area = val.toLowerCase();
      else if (key === "risco") d.risk = val.toLowerCase();
      else if (key === "tipo") d.type = val.toLowerCase();
      else if (key === "testes") d.tests = val;
      else if (key === "depende de") d.deps = val;
    }
  }
  return d;
}
const AREAS = ["backend", "frontend", "mobile", "database", "devops"];
const RISKS = ["low", "med", "high"];
const TYPES = ["feature", "bug", "security", "chore"];

let count = 0;
const lines = readFileSync(tasksPath, "utf8").split("\n");
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(TASK);
  if (!m) continue;
  const d = detail(lines, i + 1);
  const [, id, tags, text] = m;
  const story = (tags.match(/\[(US\d+)\]/) || [])[1] || "";
  const parallel = /\[P\]/.test(tags);
  const ref = `${tasksPath}#${id}`;

  if (
    !dry &&
    gh(
      "issue",
      "list",
      "--state",
      "all",
      "--search",
      `"${ref}" in:body`,
      "--json",
      "number",
      "-q",
      ".[0].number",
    )
  ) {
    console.log(`= ${id} já existe, pulando`);
    continue;
  }
  const sc = scenarios(story);
  const body = [
    `### Spec de origem\n${ref}${story ? ` (${story})` : ""}`,
    `### Objetivo\n${text.trim()}`,
    `### Critérios de aceite (Given/When/Then)\n${sc.length ? sc.map((s) => `- ${s}`).join("\n") : "- PREENCHER (sem cenários encontrados no spec.md)"}`,
    `### Testes esperados\n${d.tests || "PREENCHER: unit / integração / contrato / aceite / visual / a11y"}`,
    ...(d.deps ? [`### Depende de\n${d.deps} (${tasksPath})`] : []),
    `### Paralelizável\n${parallel ? "sim" : "não"}`,
    `### Definition of Ready\n- [ ] Cabe em um PR de até ~400 linhas\n- [ ] Critérios testáveis\n- [ ] Dependências em "blocked by"\n- [ ] Sem decisão de arquitetura em aberto\n- [ ] Label risk:* definido`,
  ].join("\n\n");

  const cmd = [
    "issue",
    "create",
    "--title",
    `${id}: ${text.trim()}`.slice(0, 250),
    "--body",
    body,
    "--label",
    [
      "status:draft",
      `type:${TYPES.includes(d.type ?? "") ? d.type : "feature"}`,
      `area:${AREAS.includes(d.area ?? "") ? d.area : area(text)}`,
      ...(RISKS.includes(d.risk ?? "") ? [`risk:${d.risk}`] : []),
    ].join(","),
  ];
  if (milestone) cmd.push("--milestone", milestone);
  gh(...cmd);
  count++;
}
console.log(
  `${count} issue(s) ${dry ? "seriam criadas" : "criadas"} como status:draft. A triagem (agent-triage.yml) classifica cada uma; risk:low pronta segue sozinha.`,
);
