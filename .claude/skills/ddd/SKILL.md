---
name: ddd
description: Domain-Driven Design no projeto — linguagem ubíqua, bounded contexts, context map, agregados, entidades, value objects, eventos e repositórios, e o passo a passo para modelar uma feature nova. Carregue ao criar ou alterar regra de negócio.
---
# Domain-Driven Design

## Estratégico (docs/domain/)
- `glossary.md` — linguagem ubíqua: termo · definição · contexto · nome no código.
  Código, testes, issues e UI usam esses termos. Termo novo entra aqui no mesmo PR.
- `context-map.md` — bounded contexts e como se relacionam (cliente/fornecedor,
  conformista, camada anticorrupção, shared kernel), com o diagrama Mermaid.
- `contexts/<contexto>.md` — propósito, agregados, eventos publicados e
  consumidos, invariantes, decisões.
- Um bounded context = um `apps/api/src/modules/<contexto>/`. O mesmo termo pode
  significar coisas diferentes em contextos diferentes (ex. "Cliente" em Vendas
  e em Cobrança): cada contexto tem seu modelo.
- Integração com sistema externo ou legado passa por camada anticorrupção
  (infrastructure/integrations + mapper): o modelo do terceiro nunca entra no domínio.

## Tático (modules/<contexto>/domain/)

**Value Object** — imutável, sem identidade, igualdade por valor, se valida na
criação (`Email.create(raw): Result<Email, EmailInvalido>`). Use para todo
conceito com regra: dinheiro (centavos + moeda), CPF/CNPJ, e-mail, período,
quantidade, status com transições.

**Entidade** — identidade estável, ciclo de vida, comportamento com nome de
negócio (`fatura.marcarComoPaga(pagamento)`, não `setStatus("paid")`).

**Agregado** — fronteira de consistência com uma entidade raiz.
1. Invariantes verdadeiras ao fim de cada método da raiz.
2. Agregados pequenos; referência a outro agregado só por ID.
3. Fora do agregado, só a raiz é acessível; nada de alterar filho direto.
4. Uma transação altera um agregado; o resto reage por evento (consistência eventual).
5. Construção com regra = factory (`Pedido.criar(...)`); reconstrução do banco
   = `Pedido.restaurar(...)` sem revalidar regras de criação.

**Evento de domínio** — fato no passado (`FaturaPaga`, `ContratoRescindido`),
imutável, com dados mínimos para quem reage. A raiz registra; o caso de uso
publica depois de salvar (outbox quando houver fila).

**Repositório** — um por agregado raiz; interface no domain, implementação
Prisma em infrastructure; métodos com nome de negócio (`buscarPorNumero`,
`salvar`), nunca CRUD genérico, nunca expõe tipos do Prisma.

**Serviço de domínio** — regra que não pertence a um agregado só (ex. cálculo
de frete entre Pedido e Tabela). Sem estado, sem I/O.

## Quando NÃO aplicar o tático
CRUD sem invariante (cadastro de categoria, configuração) pode ser caso de uso
+ repositório simples, sem agregado rico. Registre a escolha no contexts/<ctx>.md.
Não crie camadas vazias por cerimônia.

## Anti-padrões
- Modelo anêmico: entidade só com dados e a regra espalhada em casos de uso.
- Obsessão por primitivos: `amount: number`, `cpf: string` no domínio.
- Vazamento do ORM: tipo do Prisma ou decorator no domínio.
- Agregado gigante que carrega o banco inteiro.
- Import entre contextos por dentro (ignora o index.ts).
- Linguagem diferente entre código e negócio (`user` no código, "associado" no negócio).

## Modelar uma feature (antes de implementar)
1. Leia spec.md e plan.md. Liste substantivos e verbos do negócio.
2. Encaixe no context map: contexto existente ou novo? Justifique.
3. Atualize glossary.md com os termos novos.
4. Para cada agregado: raiz, filhos, VOs, invariantes (lista numerada),
   comandos (métodos) e eventos.
5. Casos de uso: commands e queries com input, output e erros de domínio.
6. Integrações: porta na application, adaptador + ACL em infrastructure.
7. Grave em docs/domain/contexts/<ctx>.md e acrescente a seção
   "Modelo de domínio" no plan.md. Cada invariante vira critério Given/When/Then
   nas tasks (vira teste de aceite).
