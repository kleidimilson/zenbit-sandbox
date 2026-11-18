---
name: mobile-screen
description: Checklist para implementar uma tela ou fluxo em React Native (Expo) em apps/mobile dentro do design system.
---
1. Procure em design-system/components.md os componentes da tela.
2. Código em src/features/<feature>/{ui,model,api}; a rota app/<fluxo>/<tela>.tsx
   (expo-router) só compõe a feature.
3. Dados via hook useX() com TanStack Query em src/queries/; schema de
   packages/shared para validar a resposta.
4. Estados: carregando (skeleton), vazio, erro com retry, offline, sucesso.
5. Estilo só com o tema de tokens.native.ts. Nada de número mágico.
6. Listas com FlashList; imagens com expo-image.
7. Formulário: react-hook-form + zodResolver; teclado não cobre o botão.
8. Acessibilidade: accessibilityLabel em todo tocável, alvo mínimo de 44pt.
9. Testes obrigatórios: componente com @testing-library/react-native cobrindo
   os estados; hook de dados com teste unit (MSW); fluxo crítico em Maestro
   (e2e/mobile/<fluxo>.yaml).
