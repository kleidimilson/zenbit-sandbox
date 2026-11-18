---
name: planning
description: Como transformar um spec aprovado em plan.md, tasks.md e plan-brief.md, com tasks pequenas, testáveis e com risco definido.
---
## plan.md

Seções, nesta ordem:
1. **Resumo** — o que a feature entrega, em 3 linhas.
2. **Contexto técnico** — áreas afetadas (backend, frontend, mobile, database,
   devops), módulos e bounded contexts existentes que serão tocados.
3. **Abordagem** — como cada user story será construída, camada por camada
   (domain, application, infrastructure, interface / ui, model, api).
4. **Contratos** — schemas Zod novos ou alterados em packages/shared, rotas,
   eventos. Esboço de tipos, sem implementação.
5. **Dados** — mudança de schema e plano expand/contract (skill db-migration).
6. **Integrações externas** — novas ou alteradas; cada uma exige teste de
   contrato.
7. **Riscos** — o que pode dar errado e como os testes cobrem.
8. **Modelo de domínio** — deixe o título; o agente code-quality preenche.

## tasks.md

Uma linha por task, formato Spec Kit (lido por scripts/tasks-to-issues.ts):

```text
- [ ] T001 [US1] Criar value object Money em apps/api/src/modules/billing/domain/money.ts
- [ ] T002 [P] [US1] Endpoint POST /checkout em apps/api/src/modules/checkout/interface/http/
```

Logo abaixo de cada task, indentado, o detalhe que a triagem usa:

```text
  - área: backend · risco: low · tipo: feature
  - testes: unit, integração
  - depende de: T001
```

Regras de corte:
- Uma área por task. Feature full-stack vira, no mínimo: contrato (shared) →
  backend → frontend/mobile.
- Migration é uma task própria, antes do código que usa a coluna.
- Teste de aceite fica com o test-writer dentro de cada task; não crie task
  só de teste.
- Tasks de UI citam a tela e o componente do design system que usam.

## plan-brief.md

Máximo uma tela. É o corpo do PR do plano; o responsável técnico decide por ele.

```markdown
## Plano: <feature>
<resumo em 2 linhas> · <N> tasks (<low>/<med>/<high> por risco)

### Decisões para você
- [ ] <decisão>: recomendo <A> porque <motivo>. Alternativa: <B>.

### Perguntas para você
- <pergunta exata> (bloqueia T00X)

### Riscos altos
- T00X <título>: <por quê>
```

Sem decisões nem perguntas: escreva "Nada pendente: aprovar o PR libera as tasks."
