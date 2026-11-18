---
name: regression-test
description: Como escrever o teste de regressão obrigatório de um bug, que precisa falhar contra a main e passar com a correção.
---
1. Leia a issue type:bug: passos para reproduzir e o critério de regressão.
2. Reproduza o bug pela interface pública que JÁ EXISTE na main (rota HTTP,
   caso de uso exportado, componente). Não importe nada que a correção vá criar:
   o CI roda este teste contra o código da main e ele precisa carregar.
3. Arquivo: tests/regression/issue-<N>.test.ts
   ```ts
   import { describe, it, expect } from "vitest";
   describe("regressão #<N>: <título da issue>", () => {
     it("<critério Then, em uma frase>", async () => {
       // Given: estado mínimo que dispara o bug
       // When: a ação dos passos para reproduzir
       // Then: o comportamento correto
     });
   });
   ```
4. Só reproduz na UI → tests/regression/e2e/issue-<N>.spec.ts (Playwright).
5. Rode localmente: bash scripts/regression-proof.sh main
   Esperado: "falha na base: OK" e depois "passa no PR: OK".
6. Commit: "test: regressão da issue #N". O teste nunca é apagado; se o
   comportamento mudar de propósito, atualize citando a issue original.
