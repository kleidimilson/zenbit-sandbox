# Testes de regressão

Um arquivo por bug corrigido: `issue-<N>.test.ts` (Vitest) ou
`e2e/issue-<N>.spec.ts` (Playwright, quando só reproduz na UI).

- Precisa falhar contra a `main` e passar com a correção (gate `regression-proof`).
- Usa só a interface pública que já existia antes da correção.
- Nunca é apagado. Mudança de comportamento intencional = atualizar citando a issue.
- Roda em todo PR e no nightly.

Skill: `.claude/skills/regression-test/SKILL.md`.
