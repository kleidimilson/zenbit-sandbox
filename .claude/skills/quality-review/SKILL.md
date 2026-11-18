---
name: quality-review
description: Procedimento e formato de saída (quality.json) da revisão de design de um PR pelo agente code-quality — Clean Code, Arquitetura Limpa e DDD.
---
Entrada: o diff (`git diff origin/main...HEAD`), a issue, o plan.md, docs/domain/
e os relatórios dos gates em quality-report/ (se existirem no workspace).

Verifique, nesta ordem, só no código que o PR adiciona ou altera:

1. **Camadas** (clean-architecture): regra de dependência, nada de Prisma/HTTP/SDK
   no domínio, rota sem regra de negócio, caso de uso sem acesso a adaptador
   concreto, import entre contextos só pelo index.ts.
2. **Domínio** (ddd): regra de negócio no agregado e não no caso de uso;
   invariantes protegidas; VO para conceitos com regra; referência entre
   agregados por ID; um agregado por transação; eventos com nome no passado;
   termos do glossário; termo novo adicionado ao glossary.md.
3. **Código** (clean-code): nomes, funções de uma coisa só, efeitos colaterais,
   tratamento de erro, smells da tabela com a refatoração indicada.
4. **Testes**: testam comportamento pelo domínio/caso de uso, sem lógica, um
   conceito por teste; agregado novo tem teste de cada invariante.
5. **Proporcionalidade**: a solução é do tamanho do problema? Abstração sem
   segundo uso, camada vazia ou padrão sem necessidade também é problema (major).

Severidade:
- **blocker**: viola a regra de dependência; regra de negócio fora do domínio
  em contexto com DDD tático; invariante não protegida; import interno entre
  contextos; vazamento do ORM no domínio.
- **major**: smell que vai encarecer a manutenção (modelo anêmico, obsessão por
  primitivos em conceito de negócio, Feature Envy, duplicação de regra,
  nome que contradiz o glossário, overengineering).
- **minor**: melhoria de legibilidade. Não reprova.

Saída obrigatória em quality.json:
{
  "verdict": "approve" | "request_changes",
  "summary": "markdown curto: o que está bom, o que bloqueia, notas fora do escopo",
  "findings": [
    { "file": "apps/api/src/modules/billing/application/commands/pay-invoice.ts",
      "line": 31, "severity": "blocker|major|minor",
      "principle": "clean-architecture|ddd|clean-code|tests|proporcionalidade",
      "smell": "regra de negócio no caso de uso",
      "message": "o que está errado",
      "refactor": "mova a verificação de vencimento para Invoice.pay(); o caso de uso só carrega, chama e salva" }
  ]
}
"request_changes" só se houver ao menos um blocker ou major.
