# Design system

Fonte da verdade visual do projeto, importada do design system da empresa.

| Arquivo | Conteúdo |
|---|---|
| `tokens.json` | tokens no formato W3C DTCG (gerado na importação) |
| `guidelines.md` | princípios, padrões de formulário, estados, tom de voz |
| `components.md` | catálogo dos componentes, quando usar e quando não usar |
| `style-dictionary.config.mjs` | compila os tokens para CSS, Tailwind e React Native |
| `tokens.example.json` | só referência de formato; não é usado no build |

Importar ou atualizar: peça ao Claude "importa o design system da empresa"
(skill `zenbit-pipeline`, modo 2). Alterações aqui exigem revisão do
responsável técnico (CODEOWNERS) e label `visual-change`.
