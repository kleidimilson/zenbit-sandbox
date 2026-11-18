# Princípios de engenharia

Use este arquivo como entrada do `/speckit.constitution` para que specs e
planos já nasçam alinhados. Os detalhes ficam nas skills em `.claude/skills/`.

1. **Clean Code** — nomes da linguagem ubíqua, funções pequenas de uma coisa só,
   sem efeito colateral escondido, erros tipados, sem código morto (skill clean-code).
2. **Arquitetura limpa** — dependências só apontam para dentro; domínio puro,
   sem framework, ORM ou SDK; casos de uso orquestram, não decidem
   (skill clean-architecture).
3. **DDD** — bounded contexts explícitos, linguagem ubíqua no glossário,
   agregados pequenos que protegem invariantes, value objects para conceitos com
   regra, integração com terceiros por camada anticorrupção (skill ddd).
4. **Pragmatismo** — o design é do tamanho do problema; CRUD sem regra não
   ganha agregado; nenhuma abstração sem segundo uso.
5. **Testes como especificação** — todo critério de aceite, invariante,
   função exportada, integração e bug corrigido tem teste automatizado no CI.
6. **Design system é lei** — UI só com tokens e componentes da empresa.
7. **Tudo em container** — a mesma imagem testada no CI vai para produção.
8. **Melhoria contínua** — código novo segue as regras (ratchet); dívida antiga
   é paga aos poucos pela auditoria semanal.
