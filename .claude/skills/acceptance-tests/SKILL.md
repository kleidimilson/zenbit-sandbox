---
name: acceptance-tests
description: Como transformar critérios Given/When/Then de uma issue em testes que falham antes da implementação.
---
1. Leia a issue (gh issue view N) e o spec referenciado.
2. Para cada critério, escolha o nível mais baixo que prova o comportamento:
   regra pura → unit do caso de uso; API → integração HTTP; fluxo de tela
   crítico → Playwright ou Maestro.
3. Arquivo: <mesma pasta do alvo>/<nome>.acceptance.test.ts (ou e2e/<fluxo>.spec.ts).
   describe("#N <título>"); nome de cada teste = texto do critério.
4. Arrange com factories (packages/shared/test/factories), nunca dados fixos
   copiados de produção.
5. Adicione casos de borda: sem permissão, entrada inválida, lista vazia,
   limite, falha do serviço externo.
6. Rode e confirme que cada teste falha por ausência do comportamento
   (asserção ou 404), não por erro de import ou sintaxe. Stubs mínimos de tipo
   são permitidos só para o arquivo compilar.
7. Commit: "test: aceite da issue #N".
