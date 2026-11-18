---
name: clean-code
description: Regras de Clean Code do projeto — nomes, funções, classes, comentários, erros, testes e code smells com a refatoração indicada. Carregue antes de escrever ou revisar qualquer código.
---
# Clean Code

Limites mecânicos (ESLint `eslint.quality.config.mjs`, aplicados ao código
novo/alterado): complexidade ciclomática ≤ 10, complexidade
cognitiva ≤ 15, função ≤ 40 linhas, arquivo ≤ 300 linhas,
≤ 3 parâmetros (mais que isso = objeto nomeado), aninhamento ≤ 3,
componente React ≤ 80 linhas, nenhuma duplicação nova (jscpd: 6+ linhas
ou 70+ tokens). O resto abaixo é julgamento.

## Nomes
- Revelam intenção e usam a linguagem ubíqua do domínio (docs/domain/glossary.md).
  `calcularMultaPorAtraso`, não `calc` nem `processData`.
- Classes e tipos são substantivos; funções e métodos são verbos.
- Booleanos leem como pergunta: `isActive`, `hasPermission`, `canCancel`.
- Sem abreviação, sem prefixo de tipo, sem número mágico (vira constante nomeada).
- Um conceito, uma palavra: não misture `fetch`/`get`/`retrieve` para a mesma coisa.

## Funções
- Fazem uma coisa, num único nível de abstração (regra do "descer um degrau").
- Sem argumento booleano que muda o comportamento: são duas funções.
- Sem efeito colateral escondido. Separe comando (muda estado) de consulta
  (retorna valor).
- Retorno cedo (guard clauses) em vez de if aninhado.
- Preferir funções puras; I/O nas bordas.

## Classes e módulos
- SOLID: uma razão para mudar (SRP); estender sem editar (OCP); subtipos
  substituíveis (LSP); interfaces pequenas por cliente (ISP); depender de
  abstrações, não de implementações (DIP).
- Alta coesão, baixo acoplamento. Lei de Demeter: não encadeie `a.b().c().d()`.
- Composição antes de herança.

## Comentários
- O código explica o quê; comentário só explica o porquê não óbvio (regra
  legal, decisão de negócio, workaround com link).
- Proibidos: código comentado, comentário que repete o código, TODO sem issue.

## Erros
- Erro de domínio esperado = `Result`/erro tipado, não exceção.
- Exceção só para o inesperado, tratada na borda.
- Nunca `catch` vazio; nunca retornar `null` para sinalizar erro.

## Testes (F.I.R.S.T.)
- Rápidos, independentes, repetíveis, autoverificáveis, escritos junto.
- Um conceito por teste; nome descreve o comportamento; padrão
  Arrange/Act/Assert; sem lógica (if/loop) no teste.

## Code smells → refatoração
| Smell | Sinal | Refatoração |
|---|---|---|
| Função longa | > limite, vários níveis de abstração | Extract Function |
| Lista longa de parâmetros | > limite | Introduce Parameter Object / Value Object |
| Obsessão por primitivos | CPF, dinheiro, e-mail como `string`/`number` | Value Object |
| Feature Envy | método usa mais dados de outro objeto | Move Function para o dono dos dados |
| Data Clumps | mesmos campos sempre juntos | Extrair tipo/VO |
| Switch por tipo | `switch(tipo)` repetido | Polimorfismo / Strategy |
| Cirurgia espingarda | uma mudança toca muitos arquivos | Mover para um módulo coeso |
| Mudança divergente | um módulo muda por vários motivos | Separar responsabilidades |
| Duplicação | blocos iguais ou quase iguais | Extract Function / módulo compartilhado (só após a 3ª ocorrência) |
| Código morto | export não usado, ramo inalcançável | Remover |
| Comentário desodorante | comentário explicando código confuso | Renomear / extrair até o comentário sobrar |
