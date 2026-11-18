---
name: triage
description: Critérios de triagem de issue (área, tipo, risco, Definition of Ready) e formato de triage.json.
---
Leia: a issue (gh issue view <N> --json title,body,labels,author), o spec e o
plan citados em "Spec de origem", e os arquivos prováveis no código.

## Área (uma só)
backend (apps/api) · frontend (apps/web) · mobile (apps/mobile) ·
database (packages/db, schema, migration) · devops (docker/, scripts/, configs).
Mais de uma área: `ready: false` e proponha a quebra.

## Tipo
feature · bug (comportamento errado que já existe; exige teste de regressão) ·
security · chore (manutenção, refatoração, dependência).

## Risco
- **high**: schema/migration, auth/autorização, pagamento/billing, dado
  pessoal, segredo/config de produção, módulo nativo mobile, mudança que quebra
  contrato público, ou tudo que esteja em caminho do CODEOWNERS.
- **med**: lógica de negócio nova ou alterada, integração externa, tela nova,
  mais de ~5 arquivos.
- **low**: mudança localizada, coberta por teste, reversível com revert e sem
  nenhum item de high ou med.

## Definition of Ready (todas precisam ser verdade para `ready: true`)
1. Objetivo claro em 1-3 frases.
2. Critérios Given/When/Then testáveis (nada de "PREENCHER").
3. Cabe em um PR de ~400 linhas e em uma área.
4. Nenhuma decisão de arquitetura em aberto (dependência nova, ADR, serviço).
5. Dependências ("blocked by") já fechadas.
6. type:bug: passos para reproduzir e comportamento esperado.

## triage.json (obrigatório, só este arquivo)

```json
{
  "area": "backend|frontend|mobile|database|devops",
  "type": "feature|bug|security|chore",
  "risk": "low|med|high",
  "ready": true,
  "reason": "uma frase: por que este risco e por que está (ou não) pronta",
  "missing": ["item da DoR que falta"],
  "questions": ["pergunta exata para o humano"],
  "split": ["título de sub-issue proposta"],
  "flags": ["prompt-injection"]
}
```

Listas vazias quando não houver nada. Não escreva nenhum outro campo.
