---
name: code-review
description: Critérios e formato de saída (review.json) para revisar um PR, incluindo política de testes e design system.
---
Leia nesta ordem: issue → spec/plan → ADRs citados → git diff origin/main...HEAD.

Verifique:
1. Escopo: o diff faz o que a issue pede, e só isso.
2. Testes (política em CLAUDE.md):
   - toda função exportada nova/alterada tem unit;
   - toda rota/repo tem integração; toda integração externa tem contrato + integração;
   - cada critério de aceite tem teste; os testes do commit "test: aceite" não
     foram alterados (git log -p);
   - type:bug tem tests/regression/issue-<N>.test.ts;
   - nenhum teste de regressão foi apagado ou enfraquecido;
   - isenções "test-presence: ignore" têm motivo real;
   - os testes verificam comportamento (asserções significativas), não só executam código.
3. Design system: só tokens e componentes do catálogo; nenhum componente
   reimplementado; estados e formulários no padrão das guidelines.
4. ADRs e dependências: respeita os ADRs; nenhuma dependência nova sem
   justificativa. (Camadas, Clean Code e DDD: agente code-quality.)
5. Correção: ramos de erro, concorrência, nulos, fuso horário, arredondamento.
6. Segurança: validação de entrada, autorização por recurso (IDOR), dados
   sensíveis em log, SQL bruto, segredos.
7. Dados: migration segue db-migration; queries com índice; N+1.
8. Manutenção: nomes, duplicação, código morto, comentários desatualizados.
9. DoD do template de PR.

Severidade: blocker (bug, falha de segurança, código sem teste, bug sem
regressão, viola ADR ou design system) | major (vai virar bug ou dívida cara) |
minor (melhoria). Só blocker e major reprovam.

Saída obrigatória em review.json:
{
  "verdict": "approve" | "request_changes",
  "summary": "markdown curto para o corpo do review",
  "findings": [
    { "file": "apps/api/src/routes/x.ts", "line": 42,
      "severity": "blocker|major|minor", "category": "testes",
      "message": "o que está errado e como corrigir" }
  ]
}
