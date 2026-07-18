#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
# SPDX-License-Identifier: GPL-3.0-or-later
#
# This file is part of gdvm.
#
# gdvm is free software: you can redistribute it and/or modify it under the
# terms of the GNU General Public License as published by the Free Software
# Foundation, either version 3 of the License, or (at your option) any later
# version.
#
# gdvm is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with
# this program. If not, see <https://www.gnu.org/licenses/>.

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: local-test.sh [name=value ...]

Available inputs (see action.yml):
  version=<version>    gdvm version to install (default: latest)
  architecture=<arch>  target architecture, e.g. x86_64, aarch64
  releases-url=<url>   override the releases manifest URL

Examples:
  local-test.sh
  local-test.sh version=0.15.0
  local-test.sh version=latest architecture=aarch64
USAGE
}

input_env=("INPUT_VERSION=latest")

for arg in "$@"; do
  case "$arg" in
  -h | --help)
    usage
    exit 0
    ;;
  *=*)
    name="${arg%%=*}"
    value="${arg#*=}"
    var="INPUT_$(printf '%s' "$name" | tr ' a-z' '_A-Z')"
    input_env+=("$var=$value")
    ;;
  *)
    echo "Error: invalid input \"$arg\" (expected name=value)." >&2
    usage >&2
    exit 1
    ;;
  esac
done

tmpdir=$(mktemp -d "${TMPDIR:-/tmp}/setup-gdvm-test.XXXXXXXX")
export tmpdir
trap 'rm -rf "$tmpdir"' EXIT

touch "$tmpdir/path" "$tmpdir/out"

env "${input_env[@]}" bash --init-file <(
  cat <<'EOF'
if [ -f "$HOME/.bashrc" ]; then
  source "$HOME/.bashrc"
fi

export HOME="$tmpdir/home"
export RUNNER_TEMP="$tmpdir/temp"
export RUNNER_TOOL_CACHE="$tmpdir/toolcache"
export GITHUB_PATH="$tmpdir/path"
export GITHUB_OUTPUT="$tmpdir/out"
export PS1="(gdvm test) $PS1"

node src/main.ts

export PATH="$tmpdir/home/.gdvm/bin:$PATH"

echo "Opening a shell with the action's environment variables set."
echo "\"\$tmpdir/path\" and \"\$tmpdir/out\" are the GitHub Actions path and output files."
echo "Run \"exit\" to return to your normal shell."
EOF
)
