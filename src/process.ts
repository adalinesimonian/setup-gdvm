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

import { spawn } from "node:child_process";

export interface RunResult {
  readonly code: number;
  readonly stderr: string;
}

export type Runner = (
  command: string,
  args: readonly string[],
  silent?: boolean,
) => Promise<RunResult>;

export const run: Runner = (command, args, silent = false) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      if (!silent) {
        process.stdout.write(data);
      }
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
      if (!silent) {
        process.stderr.write(data);
      }
    });

    child.on("error", reject);

    child.on("close", (code) => {
      resolve({ code: code ?? 1, stderr });
    });
  });
