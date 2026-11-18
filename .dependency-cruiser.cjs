// Regras de arquitetura (Arquitetura Limpa + DDD), gate "architecture".
// Violações antigas ficam em .dependency-cruiser-known-violations.json (ratchet):
// só violação NOVA reprova. Gere/atualize a baseline com:
//   pnpm dlx dependency-cruiser apps packages -c .dependency-cruiser.cjs -T baseline > .dependency-cruiser-known-violations.json
const { existsSync } = require("node:fs");

const MOD = "^apps/api/src/modules/[^/]+";
const FRAMEWORKS =
  "node_modules/(@prisma|prisma|express|fastify|hono|next|@nestjs|axios|@aws-sdk|stripe|zod)(/|$)";

module.exports = {
  forbidden: [
    {
      name: "sem-ciclos",
      severity: "error",
      comment: "Dependência circular",
      from: {},
      to: { circular: true },
    },
    {
      name: "dominio-puro",
      severity: "error",
      comment: "Domínio não depende de application, infrastructure, interface nem main",
      from: { path: `${MOD}/domain/` },
      to: { path: [`${MOD}/(application|infrastructure|interface)/`, "^apps/api/src/main/"] },
    },
    {
      name: "dominio-sem-bibliotecas",
      severity: "error",
      comment: "Domínio não importa pacote npm (ORM, HTTP, validação, SDK)",
      from: { path: [`${MOD}/domain/`, "^apps/api/src/shared/kernel/"] },
      to: { dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-no-pkg", "npm-unknown"] },
    },
    {
      name: "aplicacao-sem-infra",
      severity: "error",
      comment: "Caso de uso depende de portas, não de adaptadores nem da camada HTTP",
      from: { path: `${MOD}/application/` },
      to: { path: [`${MOD}/(infrastructure|interface)/`, "^apps/api/src/main/"] },
    },
    {
      name: "aplicacao-sem-frameworks",
      severity: "error",
      comment: "Caso de uso não importa ORM nem framework",
      from: { path: `${MOD}/application/` },
      to: { path: FRAMEWORKS },
    },
    {
      name: "interface-sem-infra",
      severity: "error",
      comment: "Rota recebe adaptadores pelo composition root (main/), não importa infraestrutura",
      from: { path: `${MOD}/interface/` },
      to: { path: `${MOD}/infrastructure/` },
    },
    {
      name: "infra-sem-interface",
      severity: "error",
      from: { path: `${MOD}/infrastructure/` },
      to: { path: `${MOD}/interface/` },
    },
    {
      name: "contextos-pela-api-publica",
      severity: "error",
      comment: "Outro bounded context só pelo seu index.ts",
      from: { path: "^apps/api/src/modules/([^/]+)/" },
      to: {
        path: "^apps/api/src/modules/[^/]+/.+",
        pathNot: ["^apps/api/src/modules/$1/", "^apps/api/src/modules/[^/]+/index\\.ts$"],
      },
    },
    {
      name: "kernel-isolado",
      severity: "error",
      from: { path: "^apps/api/src/shared/kernel/" },
      to: { path: "^apps/api/src/", pathNot: "^apps/api/src/shared/kernel/" },
    },
    {
      name: "front-sem-backend",
      severity: "error",
      from: { path: "^apps/(web|mobile)/" },
      to: { path: "^apps/api/" },
    },
    { name: "pacotes-sem-apps", severity: "error", from: { path: "^packages/" }, to: { path: "^apps/" } },
    {
      name: "ui-sem-acesso-a-dados",
      severity: "error",
      comment: "Componente de apresentação recebe dados por props/model, não chama api/",
      from: { path: "^apps/(web|mobile)/src/features/[^/]+/ui/" },
      to: { path: "^apps/(web|mobile)/src/features/[^/]+/api/" },
    },
    {
      name: "features-isoladas",
      severity: "error",
      comment: "Feature não importa internals de outra feature",
      from: { path: "^apps/(web|mobile)/src/features/([^/]+)/" },
      to: { path: "^apps/(web|mobile)/src/features/[^/]+/", pathNot: "^apps/$1/src/features/$2/" },
    },
    {
      name: "producao-sem-teste",
      severity: "error",
      from: { pathNot: "\\.(test|spec)\\.[jt]sx?$|/tests?/|/e2e/" },
      to: { path: "\\.(test|spec)\\.[jt]sx?$" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    // node_modules NÃO entra em exclude: as regras precisam ver os pacotes npm importados
    exclude: { path: "(^|/)(dist|\\.next|generated|storybook-static|coverage)/" },
    tsPreCompilationDeps: true,
    ...(existsSync("tsconfig.json") ? { tsConfig: { fileName: "tsconfig.json" } } : {}),
    enhancedResolveOptions: { extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"] },
  },
};
