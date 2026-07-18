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

const targets = {
  "linux-x86_64": "x86_64-unknown-linux-gnu",
  "linux-aarch64": "aarch64-unknown-linux-gnu",
  "linux-i686": "i686-unknown-linux-gnu",
  "darwin-x86_64": "x86_64-apple-darwin",
  "darwin-aarch64": "aarch64-apple-darwin",
  "win32-x86_64": "x86_64-pc-windows-msvc",
  "win32-aarch64": "aarch64-pc-windows-msvc",
  "win32-i686": "i686-pc-windows-msvc",
} as const satisfies Record<string, string>;

export type RustTarget = (typeof targets)[keyof typeof targets];

/** Get the Rust target for a platform and architecture. */
export function rustTarget(platform: string, arch: string): RustTarget {
  const key = `${platform}-${arch}`;

  if (isSupported(key)) {
    return targets[key];
  }

  const supported = Object.keys(targets).join(", ");

  throw new Error(
    `gdvm has no published binary for ${key}; supported platforms are: ${supported}`,
  );
}

const archAliases: Record<string, string> = {
  x64: "x86_64",
  amd64: "x86_64",
  x86_64: "x86_64",
  arm64: "aarch64",
  aarch64: "aarch64",
  ia32: "i686",
  x86: "i686",
  i386: "i686",
  i686: "i686",
  "386": "i686",
};

export function normalizeArch(arch: string): string {
  const lower = arch.trim().toLowerCase();
  return archAliases[lower] ?? lower;
}

/** Get the gdvm executable name for a platform. */
export function executableName(platform: string): string {
  return platform === "win32" ? "gdvm.exe" : "gdvm";
}

function isSupported(key: string): key is keyof typeof targets {
  return key in targets;
}
