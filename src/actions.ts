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

import { appendFile } from "node:fs/promises";
import { EOL } from "node:os";

/** Get an input from the runner. */
export function getInput(name: string): string {
  const value = process.env[`INPUT_${name.replaceAll(" ", "_").toUpperCase()}`];
  return (value ?? "").trim();
}

/** Log an info line. */
export function info(message: string): void {
  process.stdout.write(`${message}${EOL}`);
}

/** Log an error. */
export function error(message: string): void {
  process.stdout.write(`::error::${escapeData(message)}${EOL}`);
}

/** Set a step output. */
export async function setOutput(
  name: string,
  value: string | boolean,
): Promise<void> {
  const file = process.env.GITHUB_OUTPUT;

  if (!file) {
    throw new Error(
      "GITHUB_OUTPUT is not set. Is this running outside a runner?",
    );
  }

  const delimiter = `ghadelimiter_${crypto.randomUUID()}`;

  await appendFile(
    file,
    `${name}<<${delimiter}${EOL}${String(value)}${EOL}${delimiter}${EOL}`,
  );
}

/** Prepend a directory to PATH for subsequent steps (and this process). */
export async function addPath(directory: string): Promise<void> {
  const file = process.env.GITHUB_PATH;

  if (!file) {
    throw new Error(
      "GITHUB_PATH is not set. Is this running outside a runner?",
    );
  }

  await appendFile(file, `${directory}${EOL}`);

  process.env.PATH = `${directory}${delimiterFor(process.platform)}${process.env.PATH ?? ""}`;
}

function delimiterFor(platform: string): string {
  return platform === "win32" ? ";" : ":";
}

function escapeData(value: string): string {
  return value
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A");
}
