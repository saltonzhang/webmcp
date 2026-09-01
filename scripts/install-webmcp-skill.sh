#!/usr/bin/env bash
set -euo pipefail

# Installs or updates this repository's explicit $webmcp skill for the current Codex user.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPOSITORY_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
SKILL_SOURCE="$REPOSITORY_DIR/skills/webmcp"
CODEX_SKILLS_DIRECTORY="${CODEX_HOME:-$HOME/.codex}/skills"
SKILL_DESTINATION="$CODEX_SKILLS_DIRECTORY/webmcp"

if [[ ! -f "$SKILL_SOURCE/SKILL.md" ]]; then
  echo "Missing skill source: $SKILL_SOURCE/SKILL.md" >&2
  exit 1
fi

mkdir -p "$SKILL_DESTINATION"
cp -R "$SKILL_SOURCE/." "$SKILL_DESTINATION/"

echo "Installed \$webmcp skill to $SKILL_DESTINATION"
echo "Restart Codex, then invoke it with: \$webmcp <your request>"
