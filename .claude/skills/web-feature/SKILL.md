---
name: web-feature
description: Checklist para implementar uma tela ou fluxo no Next.js de apps/web dentro do design system.
---
1. Procure em design-system/components.md os componentes da tela. Componente
   que não existe = pare e comente na issue.
2. Código em src/features/<feature>/{ui,model,api} (skill clean-architecture);
   a rota em app/(grupo)/<rota>/page.tsx só compõe a feature, como Server Component.
3. Dados no servidor; mutações por Server Action que valida com o schema de
   packages/shared e chama a API.
4. Separe: page (dados) → componente de apresentação (props tipadas).
5. Implemente os 4 estados: loading.tsx, vazio, error.tsx, sucesso.
6. Formulário: react-hook-form + zodResolver; erro por campo + erro geral,
   no padrão de design-system/guidelines.md.
7. Só classes do preset de tokens. Nada de valor arbitrário (bg-[#...], p-[13px]).
8. Proteja com flag: if (!(await flags.<nome>())) notFound().
9. Testes obrigatórios:
   - componente com Testing Library (estados e interações);
   - e2e/visual/<tela>.spec.ts com toHaveScreenshot dos estados;
   - e2e/a11y/<tela>.spec.ts com @axe-core/playwright sem violações;
   - E2E do caminho feliz se o fluxo for crítico.
