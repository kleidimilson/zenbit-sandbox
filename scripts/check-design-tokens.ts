// Gate design-tokens: linhas novas de UI só usam tokens do design system.
// Uso: node scripts/check-design-tokens.ts --base origin/main | --all
// Escape pontual (exige motivo, o reviewer avalia): ... // ds-ignore: <motivo>
import { execFileSync } from "node:child_process";
import { readFileSync, appendFileSync } from "node:fs";
import { extname } from "node:path";

type Config = { paths: { ui: string[] } };
const config: Config = JSON.parse(readFileSync("pipeline.config.json", "utf8"));
const args = process.argv.slice(2);
const all = args.includes("--all");
const base = args[args.indexOf("--base") + 1] || "origin/main";

const globToRegex = (g: string) =>
  new RegExp(
    "^" +
      g
        .replace(/\/$/, "")
        .split("*")
        .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
        .join("[^/]+") +
      "/",
  );
const uiRoots = config.paths.ui.map(globToRegex);

const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".scss"]);
const EXCLUDE = [
  /^design-system\//,
  /\/tokens\//,
  /\.(test|spec)\.[jt]sx?$/,
  /-snapshots\//,
  /\/generated\//,
  /tailwind\.config\.[jt]s$/,
  /\.d\.ts$/,
];

const RULES: { id: string; re: RegExp; msg: string }[] = [
  {
    id: "hex",
    re: /(^|[^&\w/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/,
    msg: "cor hex literal; use um token de cor",
  },
  { id: "color-fn", re: /\b(rgba?|hsla?|oklch)\s*\(/, msg: "função de cor literal; use um token de cor" },
  {
    id: "tw-arbitrary",
    re: /(^|[\s"'`])[a-z][\w:-]*-\[[^\]\s]+\]/,
    msg: "classe Tailwind com valor arbitrário; use a escala do preset",
  },
  {
    id: "px",
    re: /(^|[^\w.-])[1-9]\d*(\.\d+)?px\b/,
    msg: "medida em px literal; use token de espaço/tamanho",
  },
  {
    id: "rn-number",
    re: /\b(margin|padding|gap|fontSize|lineHeight|borderRadius|borderWidth)\w*\s*:\s*[1-9]\d*\b/,
    msg: "número mágico em estilo; use o tema de tokens",
  },
  { id: "font", re: /(font-family\s*:|fontFamily\s*:\s*['"`])/, msg: "fonte literal; use o token de fonte" },
];

function git(...a: string[]): string {
  return execFileSync("git", a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

const inScope = (f: string) =>
  EXT.has(extname(f)) && uiRoots.some((r) => r.test(f)) && !EXCLUDE.some((r) => r.test(f));

type Line = { file: string; line: number; text: string };
const lines: Line[] = [];

if (all) {
  for (const file of git("ls-files").split("\n").filter(inScope)) {
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((text, i) => lines.push({ file, line: i + 1, text }));
  }
} else {
  let file = "";
  let n = 0;
  for (const raw of git("diff", "-U0", "--diff-filter=AM", `${base}...HEAD`).split("\n")) {
    if (raw.startsWith("+++ ")) {
      file = raw.startsWith("+++ b/") ? raw.slice(6) : "";
      continue;
    }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      n = Number(hunk[1]);
      continue;
    }
    if (raw.startsWith("+") && file && inScope(file)) {
      lines.push({ file, line: n, text: raw.slice(1) });
      n++;
    }
  }
}

const isComment = (t: string) => /^\s*(\/\/|\/\*|\*|<!--)/.test(t);
const violations: string[] = [];
const ignored: string[] = [];

for (const { file, line, text } of lines) {
  if (isComment(text)) continue;
  const esc = text.match(/ds-ignore:\s*(.*?)\s*(\*\/\}?|-->)?\s*$/);
  // ignora o conteúdo de comentários no fim da linha ({/* ... */}, /* ... */, // ...)
  const code = text.replace(/\/\*.*?\*\//g, "").replace(/(^|\s)\/\/.*$/, "");
  for (const rule of RULES) {
    if (!rule.re.test(code)) continue;
    if (esc && esc[1].trim()) {
      ignored.push(`${file}:${line} (${rule.id}) — ${esc[1].trim()}`);
      continue;
    }
    violations.push(`${file}:${line} [${rule.id}] ${rule.msg}\n    ${text.trim().slice(0, 140)}`);
  }
}

const report = [
  "### design-tokens",
  `Linhas analisadas: ${lines.length}`,
  violations.length
    ? `\n**Violações (${violations.length})**\n` + violations.map((v) => `- ${v}`).join("\n")
    : "\nNenhuma violação.",
  ignored.length
    ? `\n**Escapes ds-ignore (${ignored.length})**\n` + ignored.map((v) => `- ${v}`).join("\n")
    : "",
].join("\n");

console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n");
process.exit(violations.length ? 1 : 0);
