#!/usr/bin/env bash
# Gate "architecture": Arquitetura Limpa/DDD (dependency-cruiser), limites de
# Clean Code (ESLint) e duplicação (jscpd) — só reprova o que é NOVO no PR.
# Uso: bash scripts/check-quality.sh <ref-base>   (ex.: origin/main)  |  --all
set -uo pipefail
base="${1:-origin/main}"
mkdir -p quality-report
fail=0
summary() { echo "$1" | tee -a "${GITHUB_STEP_SUMMARY:-/dev/null}"; }

if [ "$base" = "--all" ]; then
  changed=(); while IFS= read -r _l; do if [ -n "$_l" ]; then changed+=("$_l"); fi; done < <(git ls-files -- '*.ts' '*.tsx' '*.js' '*.jsx' | grep -E '^(apps|packages)/' || true)
else
  changed=(); while IFS= read -r _l; do if [ -n "$_l" ]; then changed+=("$_l"); fi; done < <(git diff --name-only --diff-filter=AM "$base"...HEAD -- '*.ts' '*.tsx' '*.js' '*.jsx' | grep -E '^(apps|packages)/' || true)
fi
summary "### architecture"
summary "Arquivos de código analisados: ${#changed[@]}"

# 1) camadas e contextos (baseline = violações antigas toleradas)
targets=(); for d in apps packages; do [ -d "$d" ] && targets+=("$d"); done
if [ "${#targets[@]}" -gt 0 ]; then
  known=(); [ -f .dependency-cruiser-known-violations.json ] && known=(--ignore-known .dependency-cruiser-known-violations.json)
  if pnpm exec depcruise "${targets[@]}" -c .dependency-cruiser.cjs "${known[@]}" -T err-long > quality-report/depcruise.txt 2>&1; then
    summary "- Camadas e contextos: ok"
  else
    summary "- **Camadas e contextos: violação nova**"; sed -n '1,80p' quality-report/depcruise.txt; fail=1
  fi
fi

# 2) limites de Clean Code nos arquivos alterados
if [ "${#changed[@]}" -gt 0 ]; then
  if pnpm exec eslint -c eslint.quality.config.mjs --no-warn-ignored "${changed[@]}" > quality-report/eslint.txt 2>&1; then
    summary "- Limites de Clean Code: ok"
  else
    summary "- **Limites de Clean Code: excedidos**"; sed -n '1,80p' quality-report/eslint.txt; fail=1
  fi
fi

# 3) duplicação envolvendo arquivos alterados
if [ "${#changed[@]}" -gt 0 ] && [ "${#targets[@]}" -gt 0 ]; then
  pnpm exec jscpd . -c .jscpd.json --silent > /dev/null 2>&1 || true
  if node scripts/check-duplication.ts quality-report/jscpd/jscpd-report.json "${changed[@]}"; then
    summary "- Duplicação: ok"
  else
    summary "- **Duplicação nova**"; fail=1
  fi
fi
exit $fail
