---
name: release-brief
description: Como montar o release-brief.md que o responsável técnico lê para aprovar o deploy de produção.
---
Entrada: tag anterior (PREV) e tag nova (TAG).

Colete:
```bash
git log --oneline PREV..TAG
git diff --stat PREV..TAG
git diff --name-only PREV..TAG -- packages/db/prisma/migrations .env.example docker/ apps/api/src/modules/*/infrastructure/integrations
gh pr list --state merged --search "<sha>" --json number,title,labels   # para cada commit squash
```

Formato de release-brief.md (até ~40 linhas):

```markdown
## Brief da release TAG — recomendação: aprovar | aprovar com ressalva | segurar
<motivo em 1 frase>

### O que muda para o usuário
- <bullet por feature/bug, com #PR>

### Atenção
- **Migrations:** <lista ou "nenhuma"> — expand/contract: sim/não
- **Variáveis de ambiente novas:** <lista ou "nenhuma"> (precisam estar no .env do servidor)
- **Auth / pagamento / dado pessoal:** <o que mudou ou "nada">
- **Integrações externas:** <o que mudou ou "nada">
- **Feature flags:** <novas e o estado padrão>
- **PRs risk:high:** <lista ou "nenhum">

### Rollback
`bash scripts/deploy.sh production PREV` — <seguro | cuidado: o que não volta (ex. migration contract)>

### Checar depois do deploy
- <1-3 verificações manuais objetivas, se houver>
```

Recomende "segurar" quando houver migration destrutiva (drop/rename) sem a
fase expand já em produção, variável nova sem default, ou PR risk:high sem
aprovação humana registrada.
