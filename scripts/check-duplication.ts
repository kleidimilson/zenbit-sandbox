// Lê o relatório do jscpd e reprova duplicações que envolvem arquivos alterados.
// Uso: node scripts/check-duplication.ts <jscpd-report.json> <arquivos alterados...>
import { existsSync, readFileSync, appendFileSync } from "node:fs";

type Loc = { name: string; start: number; end: number };
type Dup = { lines: number; firstFile: Loc; secondFile: Loc };

const [reportPath, ...changed] = process.argv.slice(2);
if (!reportPath || !existsSync(reportPath)) {
  console.log("sem relatório do jscpd; nada a verificar");
  process.exit(0);
}
const report = JSON.parse(readFileSync(reportPath, "utf8"));
const dups: Dup[] = report.duplicates ?? [];
const set = new Set(changed);
const hits = dups.filter((d) => set.has(d.firstFile.name) || set.has(d.secondFile.name));
const pct = report.statistics?.total?.percentage ?? 0;

const lines = [
  `Duplicação total do repositório: ${Number(pct).toFixed(2)}%`,
  ...hits.map(
    (d) =>
      `- ${d.firstFile.name}:${d.firstFile.start}-${d.firstFile.end} ≡ ${d.secondFile.name}:${d.secondFile.start}-${d.secondFile.end} (${d.lines} linhas)`,
  ),
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
process.exit(hits.length ? 1 : 0);
