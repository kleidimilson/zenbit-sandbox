#!/usr/bin/env bash
# Gate regression-proof: o teste de regressão novo precisa FALHAR (por asserção)
# contra o código da base e PASSAR contra o PR.
# Uso: bash scripts/regression-proof.sh <branch-base>   (ex.: main)
set -euo pipefail

base="${1:-main}"
ref="origin/$base"
git rev-parse --verify -q "$ref" >/dev/null || ref="$base"
dir=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("pipeline.config.json","utf8")).paths.regression)')

tests=(); while IFS= read -r _l; do if [ -n "$_l" ]; then tests+=("$_l"); fi; done < <(git diff --name-only --diff-filter=A "$ref"...HEAD -- "$dir" | grep -E '\.test\.[jt]sx?$' || true)
if [ "${#tests[@]}" -eq 0 ]; then
  echo "PR de bug sem teste novo em $dir/ (esperado $dir/issue-<N>.test.ts)"
  exit 1
fi
echo "Testes de regressão novos:"; printf '  %s\n' "${tests[@]}"

work=$(mktemp -d)
cleanup() { git worktree remove --force "$work" >/dev/null 2>&1 || rm -rf "$work"; }
trap cleanup EXIT
git worktree add --detach "$work" "$ref" >/dev/null
for t in "${tests[@]}"; do mkdir -p "$work/$(dirname "$t")"; cp "$t" "$work/$t"; done

echo "→ instalando dependências da base"
(cd "$work" && pnpm install --frozen-lockfile --prefer-offline >/dev/null)

echo "→ rodando contra a base ($ref): precisa falhar"
set +e
(cd "$work" && pnpm exec vitest run "${tests[@]}" --reporter=json --outputFile=/tmp/regression-base.json >/dev/null 2>&1)
set -e
test -f /tmp/regression-base.json || { echo "vitest não gerou relatório na base"; exit 1; }

node - "${tests[@]}" <<'JS'
const fs = require("fs");
const r = JSON.parse(fs.readFileSync("/tmp/regression-base.json", "utf8"));
const wanted = process.argv.slice(2);
let ok = true;
for (const t of wanted) {
  const res = r.testResults.find((x) => x.name.endsWith(t));
  if (!res) { console.log(`✗ ${t}: não executou na base`); ok = false; continue; }
  const failedAssertions = (res.assertionResults || []).filter((a) => a.status === "failed").length;
  if (failedAssertions > 0) { console.log(`✓ ${t}: falha na base por asserção (${failedAssertions})`); continue; }
  if ((res.assertionResults || []).length === 0)
    console.log(`✗ ${t}: não carregou na base (importa algo que não existe?) ${String(res.message || "").slice(0, 200)}`);
  else console.log(`✗ ${t}: PASSA na base — não reproduz o bug`);
  ok = false;
}
process.exit(ok ? 0 : 1);
JS
echo "falha na base: OK"

echo "→ rodando contra o PR: precisa passar"
pnpm exec vitest run "${tests[@]}"
echo "passa no PR: OK"
