---
name: design-system
description: Regras do design system da empresa para qualquer UI web ou mobile deste projeto — tokens permitidos, componentes do catálogo e padrões. Carregue antes de criar ou revisar tela, componente ou estilo.
---
<!-- Gerado pela importação do design system (skill zenbit-pipeline, modo 2).
     Substitua cada bloco PREENCHER pelas regras concretas da empresa. -->

# Design system: <!-- PREENCHER: nome e versão -->

Fonte: <!-- PREENCHER: pacote npm / tokens.json / Figma / artefato, com versão -->
Tokens: design-system/tokens.json · Guidelines: design-system/guidelines.md ·
Catálogo: design-system/components.md

## Regras absolutas
- Cor, espaçamento, raio, sombra, fonte e breakpoint só por token. Web: classes
  do preset Tailwind ou var(--token). Mobile: tema de tokens.native.ts.
- Nunca valor literal (#hex, rgb(), 13px) nem classe arbitrária (bg-[#...]).
- Antes de criar componente, procure no catálogo. Não existe = pare e comente
  na issue; componente novo é decisão de design.
- Componente novo aprovado entra em packages/ui com story, teste visual e a11y.

## Tokens semânticos (use estes, não os primitivos)
<!-- PREENCHER: tabela token → uso. Ex.:
| Token | Uso |
|---|---|
| color.text.default | texto corrido |
| color.background.surface | cartões e painéis |
| color.feedback.danger | erro de formulário e ação destrutiva |
-->

## Componentes e quando usar
<!-- PREENCHER: para cada componente: quando usar, quando NÃO usar, variante padrão.
Ex.: Button — primary: uma ação principal por tela; secondary: demais; ghost: ações
em tabela. Nunca dois primary lado a lado. -->

## Padrões
- Formulário: <!-- PREENCHER: posição do label, texto de ajuda, mensagem de erro, obrigatório -->
- Estados: <!-- PREENCHER: skeleton x spinner, vazio com ilustração?, erro com retry -->
- Feedback: <!-- PREENCHER: toast x banner x inline; duração -->
- Densidade e grid: <!-- PREENCHER -->
- Ícones: <!-- PREENCHER: biblioteca, tamanhos permitidos -->
- Tom de voz: <!-- PREENCHER: tratamento (você), botões no infinitivo?, exemplos -->
- Dark mode: <!-- PREENCHER: suportado? como alternar -->
