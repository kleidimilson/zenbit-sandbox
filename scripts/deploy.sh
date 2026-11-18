#!/usr/bin/env bash
# Deploy por imagem: bash scripts/deploy.sh <staging|production> <tag>
# Rollback = rodar de novo com a tag anterior (ex.: v1.4.2). O banco não volta:
# por isso toda migration é expand/contract.
# Requer: DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY (secrets do environment).
set -euo pipefail
env="$1"; tag="$2"
dir="/opt/zenbit-sandbox"
key=$(mktemp); trap 'rm -f "$key"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$key"; chmod 600 "$key"
ssh_opts=(-i "$key" -o StrictHostKeyChecking=accept-new)
target="$DEPLOY_USER@$DEPLOY_HOST"

scp "${ssh_opts[@]}" docker-compose.deploy.yml "$target:$dir/docker-compose.yml"
# shellcheck disable=SC2087  # expansão local de $tag/$dir é intencional
ssh "${ssh_opts[@]}" "$target" bash -s <<REMOTE
set -euo pipefail
cd "$dir"
export IMAGE_TAG="$tag"
if [ -f .current-tag ]; then cp .current-tag .previous-tag; fi
echo "$tag" > .current-tag
docker compose pull
docker compose --profile migrate run --rm migrate
docker compose up -d --wait --remove-orphans
docker image prune -f >/dev/null
echo "[$env] rodando $tag"
REMOTE
