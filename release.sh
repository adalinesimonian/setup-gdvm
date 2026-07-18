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
  cat <<'EOF'
Usage: release.sh [options] <tag_name>

Tag and publish a release.

Arguments:
  <tag_name>        Release tag to publish, e.g. v1.2.3

Options:
  -p, --prerelease  Mark the release as a pre-release
  -h, --help        Show this help and exit
EOF
}

prerelease=false
tag_name=""

while [[ $# -gt 0 ]]; do
  case "$1" in
  -p | --prerelease)
    prerelease=true
    shift
    ;;
  -h | --help)
    usage
    exit 0
    ;;
  --)
    shift
    break
    ;;
  -*)
    echo "Unknown option: $1" >&2
    usage >&2
    exit 1
    ;;
  *)
    if [[ -n "$tag_name" ]]; then
      echo "Unexpected argument: $1" >&2
      usage >&2
      exit 1
    fi
    tag_name="$1"
    shift
    ;;
  esac
done

if [[ $# -gt 0 ]]; then
  if [[ -n "$tag_name" ]]; then
    echo "Unexpected argument: $1" >&2
    usage >&2
    exit 1
  fi
  tag_name="$1"
fi

if [[ -z "$tag_name" ]]; then
  usage >&2
  exit 1
fi

git tag -a "$tag_name" -m "setup-gdvm $tag_name"
git push origin "$tag_name"
gh workflow run release.yml \
  -f release_tag="$tag_name" \
  -f prerelease="$prerelease"
