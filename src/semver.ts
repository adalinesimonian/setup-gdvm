// SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
// SPDX-License-Identifier: GPL-3.0-or-later
//
// This file is part of gdvm.
//
// gdvm is free software: you can redistribute it and/or modify it under the
// terms of the GNU General Public License as published by the Free Software
// Foundation, either version 3 of the License, or (at your option) any later
// version.
//
// gdvm is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with
// this program. If not, see <https://www.gnu.org/licenses/>.

export interface Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  /** Any pre-release identifiers. Empty for a stable release. */
  readonly prerelease: readonly string[];
}

/** Parse a version in the format e.g. `0.15.0` or `1.2.3-pre.1`. */
export function parseVersion(input: string): Version | undefined {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/u.exec(
    input.trim(),
  );

  if (!match) {
    return undefined;
  }

  const [, major, minor, patch, pre] = match;

  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: pre?.split(".") ?? [],
  };
}

export function compareVersions(a: Version, b: Version): number {
  for (const key of ["major", "minor", "patch"] as const) {
    if (a[key] !== b[key]) {
      return a[key] - b[key];
    }
  }

  // Sort pre-releases before stable releases.
  if (a.prerelease.length === 0 || b.prerelease.length === 0) {
    return b.prerelease.length - a.prerelease.length;
  }

  for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
    const left = a.prerelease[i];
    const right = b.prerelease[i];

    if (left === undefined) {
      return -1;
    }

    if (right === undefined) {
      return 1;
    }

    const leftNum = /^\d+$/u.test(left) ? Number(left) : undefined;
    const rightNum = /^\d+$/u.test(right) ? Number(right) : undefined;

    if (leftNum !== undefined && rightNum !== undefined) {
      if (leftNum !== rightNum) {
        return leftNum - rightNum;
      }
    } else if (leftNum !== undefined) {
      return -1;
    } else if (rightNum !== undefined) {
      return 1;
    } else if (left !== right) {
      return left < right ? -1 : 1;
    }
  }

  return 0;
}

export function formatVersion(version: Version): string {
  const core = `${version.major}.${version.minor}.${version.patch}`;

  return version.prerelease.length > 0
    ? `${core}-${version.prerelease.join(".")}`
    : core;
}
