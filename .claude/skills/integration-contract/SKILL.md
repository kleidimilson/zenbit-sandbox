---
name: integration-contract
description: Estrutura e testes obrigatórios para toda integração externa (API de terceiro, webhook, fila, SDK) em modules/<contexto>/infrastructure/integrations/<nome>/, como camada anticorrupção.
---
Porta (interface) em modules/<contexto>/application/ports/<capacidade>.ts, com
tipos do domínio. Adaptador = camada anticorrupção em
modules/<contexto>/infrastructure/integrations/<nome>/:
- client.ts            chamadas HTTP/SDK, timeout e retry explícitos
- schemas.ts           schemas Zod das respostas e dos webhooks recebidos
- mapper.ts            tradução do formato do terceiro para o domínio (o modelo do
                       terceiro nunca passa daqui)
- adapter.ts           implementa a porta usando client + mapper
- fixtures/*.json      respostas reais gravadas (sem dados pessoais), uma por cenário
- <nome>.contract.test.ts
- <nome>.integration.test.ts
- <nome>.sandbox.test.ts   (opcional, só nightly)

Testes obrigatórios:
1. Contrato (<nome>.contract.test.ts): cada fixture passa no schema Zod; o
   mapper transforma cada fixture no objeto de domínio esperado. Quando o
   terceiro mudar o formato, este teste quebra primeiro.
2. Integração (<nome>.integration.test.ts) com MSW servindo as fixtures:
   sucesso, 4xx, 5xx, timeout, resposta fora do schema, retry e idempotência.
   Webhook recebido: assinatura válida, inválida e evento repetido.
3. Nunca chame o serviço real no CI do PR. Um teste opcional contra o sandbox do
   terceiro vai em <nome>.sandbox.test.ts, com
   describe.skipIf(!process.env.<NOME>_SANDBOX_KEY); o vitest.config.ts só
   inclui *.sandbox.test.ts quando RUN_SANDBOX=1, o que acontece no nightly.

Regras:
- Segredos só por variável de ambiente, listados em .env.example.
- Toda chamada loga duração e status, nunca o payload com dados pessoais.
- Fixture nova: grave a resposta real, anonimize e cite a data no nome
  (fixtures/charge-created.2026-11.json).
