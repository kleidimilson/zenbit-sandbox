---
name: db-migration
description: Regras para alterar o schema Prisma com segurança em produção (expand/contract), incluindo nomes, índices, testes e rollback.
---
1. Classifique a mudança:
   - Aditiva (tabela, coluna nullable, índice): uma migration só.
   - Destrutiva (remover, renomear, mudar tipo, NOT NULL em coluna existente):
     obrigatoriamente em 3 PRs separados — expand, migrar código/dados, contract.
2. Edite packages/db/prisma/schema.prisma e rode
   pnpm db:migrate:dev --name <verbo_objeto> (ex. add_invoice_due_date).
3. Leia o SQL gerado. Se houver DROP, ALTER TYPE ou lock longo, pare e reavalie.
4. Índice em tabela grande: CREATE INDEX CONCURRENTLY em migration manual.
5. Backfill de dados: script idempotente em packages/db/scripts/, em lotes,
   nunca dentro da migration. O script tem teste de integração (roda duas vezes,
   mesmo resultado).
6. Teste da migration: packages/db/tests/<migration>.integration.test.ts aplica
   as migrations num banco com seed e valida schema e dados.
7. No PR, preencha: tipo (aditiva/destrutiva), fase (expand/migrate/contract),
   impacto estimado, plano de rollback.
