#!/usr/bin/env bash
set -euo pipefail

# Installs the MCP servers used by this repository into the current user's Codex config.
# Existing servers with the same name are preserved instead of being overwritten.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
INSTALL_PLAYWRIGHT=false

if [[ "${1:-}" == "--with-playwright" ]]; then
  INSTALL_PLAYWRIGHT=true
elif [[ $# -gt 0 ]]; then
  echo "Usage: $0 [--with-playwright]" >&2
  exit 2
fi

for command_name in codex node npx; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
done

ORIGINS="$(node -e '
const fs = require("fs");
const path = require("path");
const environments = JSON.parse(fs.readFileSync(path.join(process.argv[1], "config/environments.json"), "utf8"));
const origins = [...new Set(Object.values(environments).map((environment) => environment.origin).filter(Boolean))];
process.stdout.write(origins.join(","));
' "$REPOSITORY_DIR")"

if [[ -z "$ORIGINS" ]]; then
  echo "No WebMCP origins found in config/environments.json" >&2
  exit 1
fi

install_if_missing() {
  local server_name="$1"
  shift

  if codex mcp get "$server_name" >/dev/null 2>&1; then
    echo "SKIP  $server_name already exists in this user's Codex configuration"
    return
  fi

  codex mcp add "$server_name" -- "$@"
  echo "OK    installed $server_name"
}

install_if_missing \
  "webmcp-local-relay" \
  npx -y "@mcp-b/webmcp-local-relay@5.1.0" --widget-origin "$ORIGINS"

if [[ "$INSTALL_PLAYWRIGHT" == true ]]; then
  install_if_missing "playwright" npx -y "@playwright/mcp@latest"
fi

echo
echo "Configured MCP servers:"
codex mcp get "webmcp-local-relay"
if [[ "$INSTALL_PLAYWRIGHT" == true ]]; then
  codex mcp get "playwright"
fi

echo
echo "Restart Codex, then open a page on test1 or dev."
