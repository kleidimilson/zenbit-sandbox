// Gate test-presence: todo arquivo de código novo/alterado tem teste, e toda
// integração externa tem teste de contrato + integração.
// Uso: node scripts/check-test-presence.ts --base origin/main | --all
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, appendFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

type Config = { paths: { source: string[]; integrations: string } };

const config: Config = JSON.parse(readFileSync("pipeline.config.json", "utf8"));
const args = process.argv.slice(2);
const all = args.includes("--all");
const base = args[args.indexOf("--base") + 1] || "origin/main";

const globToRegex = (g: string) =>
  new RegExp(
    "^" +
      g
        .split("*")
        .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
        .join("[^/]+") +
      "/",
  );
const sourceRoots = config.paths.source.map(globToRegex);

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);
const AUTO_EXEMPT = [
  /\.(test|spec)\.[jt]sx?$/,
  /\.d\.ts$/,
  /\.stories\.[jt]sx?$/,
  /\.config\.[jt]s$/,
  /\/(generated|__tests__|__mocks__|fixtures|test|tests)\//,
];

function git(...a: string[]): string {
  return execFileSync("git", a, { encoding: "utf8" }).trim();
}

const files = (all ? git("ls-files") : git("diff", "--name-only", "--diff-filter=AM", `${base}...HEAD`))
  .split("\n")
  .filter(Boolean);

function isBarrel(content: string): boolean {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));
  return lines.length > 0 && lines.every((l) => /^export (\*|\{[^}]*\}|type \{[^}]*\}) from /.test(l));
}

function hasTest(file: string): boolean {
  const dir = dirname(file);
  const ext = extname(file);
  const name = basename(file, ext);
  const suffixes = ["test", "spec", "integration.test", "acceptance.test", "contract.test"];
  const exts = [".ts", ".tsx", ".js", ".jsx"];
  for (const s of suffixes)
    for (const e of exts) {
      if (existsSync(join(dir, `${name}.${s}${e}`))) return true;
      if (existsSync(join(dir, "__tests__", `${name}.${s}${e}`))) return true;
    }
  return false;
}

const missing: string[] = [];
const exempted: string[] = [];
const integrationDirs = new Set<string>();
const marker = `/${config.paths.integrations.replace(/^\/|\/$/g, "")}/`;

for (const file of files) {
  if (!CODE_EXT.has(extname(file))) continue;
  if (!sourceRoots.some((r) => r.test(file))) continue;
  if (AUTO_EXEMPT.some((r) => r.test(file))) continue;
  if (!existsSync(file)) continue;
  const content = readFileSync(file, "utf8");
  const ignore = content.split("\n")[0].match(/test-presence:\s*ignore\s*(.*)/);
  if (ignore) {
    exempted.push(`${file} — ${ignore[1].trim() || "SEM MOTIVO"}`);
    if (!ignore[1].trim()) missing.push(`${file}: isenção sem motivo`);
    continue;
  }
  if (basename(file).startsWith("index.") && isBarrel(content)) continue;

  const idx = file.indexOf(marker);
  if (idx >= 0) {
    const rest = file.slice(idx + marker.length).split("/");
    if (rest.length > 1) integrationDirs.add(file.slice(0, idx + marker.length) + rest[0]);
  }
  if (!hasTest(file))
    missing.push(
      `${file}: sem teste (esperado ${basename(file, extname(file))}.test${extname(file)} ou variante)`,
    );
}

for (const dir of integrationDirs) {
  const names = existsSync(dir) ? readdirSync(dir, { recursive: true }).map(String) : [];
  if (!names.some((n) => /\.contract\.test\.[jt]sx?$/.test(n)))
    missing.push(`${dir}: integração sem *.contract.test.ts`);
  if (!names.some((n) => /\.integration\.test\.[jt]sx?$/.test(n)))
    missing.push(`${dir}: integração sem *.integration.test.ts`);
}

const report = [
  `### test-presence`,
  `Arquivos analisados: ${files.length}`,
  missing.length
    ? `\n**Faltando (${missing.length})**\n` + missing.map((m) => `- ${m}`).join("\n")
    : "\nNenhum teste faltando.",
  exempted.length ? `\n**Isenções (${exempted.length})**\n` + exempted.map((m) => `- ${m}`).join("\n") : "",
].join("\n");

console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n");
process.exit(missing.length ? 1 : 0);
