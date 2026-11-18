#!/usr/bin/env bash
# Uso: notify-discord.sh <feed|alert> "mensagem"
# Sem webhook configurado, só imprime (não quebra o job).
set -euo pipefail
channel="$1"; shift
msg="$*"
case "$channel" in
  feed)  url="${DISCORD_WEBHOOK_FEED:-}";   color=3447003  ;;
  alert) url="${DISCORD_WEBHOOK_ALERTS:-}"; color=15158332 ;;
  *) echo "canal inválido: $channel" >&2; exit 1 ;;
esac
if [ -z "$url" ]; then echo "[discord:$channel] $msg"; exit 0; fi
payload=$(jq -n --arg d "$msg" --arg repo "${GITHUB_REPOSITORY:-local}" --argjson c "$color" \
  '{username: "pipeline", embeds: [{description: $d, color: $c, footer: {text: $repo}}]}')
curl -fsS -H "Content-Type: application/json" -d "$payload" "$url" > /dev/null
