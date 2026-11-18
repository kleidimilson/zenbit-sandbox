---
name: clean-architecture
description: Arquitetura limpa do projeto — camadas, regra de dependência, portas e adaptadores, onde cada coisa mora no backend, web e mobile. Carregue antes de criar arquivo novo ou mudar dependências entre módulos.
---
# Arquitetura limpa

**Regra de dependência:** dependências de código só apontam para dentro.
Domínio não conhece aplicação; aplicação não conhece infraestrutura nem
framework. Verificado pelo dependency-cruiser (`.dependency-cruiser.cjs`,
gate `architecture`).

## Backend (apps/api/src)

```text
modules/<contexto>/                 um bounded context (skill ddd)
  domain/                           regras de negócio puras
    <agregado>/<agregado>.ts        entidade raiz + invariantes
    <agregado>/<vo>.ts              value objects
    events/                         eventos de domínio
    <agregado>-repository.ts        INTERFACE do repositório (porta)
    services/                       serviços de domínio (regra entre agregados)
  application/                      casos de uso (orquestram o domínio)
    commands/<acao>.ts              muda estado: 1 caso de uso = 1 arquivo
    queries/<consulta>.ts           lê estado (pode usar read model direto)
    ports/                          interfaces de saída (e-mail, pagamento, clock)
  infrastructure/                   adaptadores (implementam as portas)
    persistence/prisma-<agregado>-repository.ts
    persistence/mappers/            Prisma ↔ domínio
    integrations/<servico>/         clientes de terceiros (skill integration-contract)
  interface/                        entrada
    http/<recurso>.routes.ts        rota → DTO (Zod) → caso de uso → presenter
    http/presenters/                domínio → JSON de resposta
  index.ts                          API pública do contexto (o que outros contextos podem usar)
shared/kernel/                      Result, Entity, AggregateRoot, ValueObject, DomainEvent, Clock
main/                               composition root: instancia adaptadores e injeta nos casos de uso
```

O que pode importar o quê:

| Camada | Pode importar | Não pode importar |
|---|---|---|
| domain | shared/kernel | application, infrastructure, interface, Prisma, Zod, HTTP, qualquer SDK |
| application | domain, shared/kernel, as próprias ports | infrastructure, interface, Prisma, framework HTTP |
| infrastructure | application (ports), domain, libs externas | interface |
| interface | application, shared/kernel, Zod, framework HTTP | infrastructure (injete pelo main/), domain direto para mutação |
| outro contexto | só `modules/<outro>/index.ts` | as camadas internas de outro contexto |

Comunicação entre contextos: por caso de uso público do `index.ts` (síncrono)
ou por evento de domínio publicado (assíncrono). Nunca por tabela compartilhada
nem import interno.

## Casos de uso
- Um arquivo por caso de uso, uma função/classe `execute(input): Promise<Result<Output, Erro>>`.
- Recebe dependências pelo construtor/parâmetro (portas), nunca importa adaptador.
- Fluxo: carrega agregado pelo repositório → chama método do domínio → salva →
  publica eventos. Sem regra de negócio no caso de uso: regra fica no domínio.
- Transação = um agregado por transação; consistência entre agregados por evento.

## Web (apps/web) e mobile (apps/mobile)
```text
features/<feature>/
  ui/          componentes de apresentação (props → JSX), sem fetch
  model/       estado e regras da feature (hooks, reducers, validação de tela)
  api/         acesso a dados (Server Actions, queries), tipado por packages/shared
app/ (rotas)   compõe features; não tem lógica
packages/ui    design system (sem regra de negócio)
```
- `ui/` não importa `api/` direto: recebe dados e callbacks por props ou via `model/`.
- Regra de negócio de verdade mora na API; o front só tem regra de tela.
- Feature não importa internals de outra feature; compartilhado vai para
  `packages/shared` ou `packages/ui`.

## Sinais de violação
- `import { prisma }` fora de infrastructure/.
- Caso de uso com `if` de regra de negócio que deveria ser método do agregado.
- Rota acessando repositório direto.
- Entidade com só getters/setters (modelo anêmico).
- DTO de HTTP circulando dentro do domínio.
