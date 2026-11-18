---
name: api-endpoint
description: Passo a passo para criar ou alterar uma rota HTTP em apps/api com contrato, validação, autorização e testes.
---
Caminhos relativos a apps/api/src/modules/<contexto>/ (skill clean-architecture).
1. Contrato: defina request/response em packages/shared/src/contracts/<recurso>.ts
   com Zod. Exporte os tipos inferidos.
2. Domínio: a regra nova vira método do agregado/VO em domain/ (skill ddd).
3. Caso de uso: application/commands/<acao>.ts ou application/queries/<consulta>.ts
   recebe input tipado e portas por parâmetro. Retorna Result<Ok, DomainError>.
4. Repositório: interface em domain/, implementação Prisma em
   infrastructure/persistence/. Método com nome de negócio, nunca genérico.
5. Rota: interface/http/<recurso>.routes.ts → parse Zod → checa permissão →
   caso de uso (injetado pelo main/) → presenter → status:
   Ok=200/201, NotFound=404, Forbidden=403, Validation=422, Conflict=409.
6. Erros nunca vazam stack ou mensagem interna; resposta = { code, message }.
7. Testes obrigatórios:
   - domain/**/<agregado>.test.ts: cada invariante e cada comando, sem banco.
   - application/**/<acao>.test.ts: todos os ramos do Result (portas fake).
   - infrastructure/persistence/<repo>.integration.test.ts: cada método contra Postgres real.
   - interface/http/<recurso>.integration.test.ts: 200/201, 401, 403, 422 no mínimo,
     e 404/409 quando aplicável.
8. Atualize o OpenAPI gerado (pnpm api:openapi) e confira o diff.
