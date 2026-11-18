---
name: docker-image
description: Regras para criar ou alterar Dockerfiles, docker-bake.hcl e os arquivos compose do projeto, mantendo imagens reproduzíveis, seguras e promovíveis entre ambientes.
---
Imagens do projeto (buildadas só no GitHub Actions, publicadas no GHCR):
- api      docker/api.Dockerfile      porta 8080, healthcheck GET /health
- web      docker/web.Dockerfile      porta 3000, healthcheck GET /api/health
- migrate  docker/migrate.Dockerfile  roda prisma migrate deploy e sai

Tags: sha-<12 chars do commit> (todo build), staging (promovida), vX.Y.Z,
X.Y e latest (promovidas na release). Nunca rebuildar para produção: a release
reaproveita o digest que passou no CI.

Regras de Dockerfile:
1. Multi-stage: deps → build → runtime. Runtime só com o necessário para rodar.
2. Imagem base com versão fixa (node:22.x.y-bookworm-slim). Nada de :latest.
3. Usuário não-root (USER node), tini como PID 1, HEALTHCHECK obrigatório.
4. Cache do pnpm com --mount=type=cache; lockfile congelado.
5. Labels OCI: source, version, revision (vêm de ARG VERSION/REVISION).
6. Nenhum segredo em ARG, ENV ou COPY. Segredo de build = --mount=type=secret.
7. Nada específico de ambiente no build (URLs, chaves, NEXT_PUBLIC_* por
   ambiente). Configuração entra por variável em runtime.
8. Adicionou arquivo que a imagem não precisa? Atualize .dockerignore.

Ao mudar porta, variável, comando ou serviço:
- Atualize docker-compose.yml (dev), docker-compose.ci.yml (CI/e2e) e
  docker-compose.deploy.yml (servidor) no mesmo PR.
- Variável nova: .env.example com descrição; nunca valor real.
- Serviço novo: target no docker-bake.hcl, entrada no loop de Trivy e de
  provenance do ci.yml e no promote da release.yml (esses dois arquivos são
  editados pelo humano: proponha o diff no PR).

Testes:
- hadolint sem avisos (job quality).
- Trivy sem CRITICAL/HIGH corrigível (job images).
- container-smoke: compose sobe com --wait e os healthchecks respondem.
- Rode local antes do PR: TAG=dev docker buildx bake --load && \
  IMAGE_TAG=dev docker compose -f docker-compose.ci.yml up -d --wait
  (com REGISTRY apontando para o mesmo nome usado no compose).
