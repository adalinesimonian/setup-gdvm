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

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { verifyInstallation } from "../src/install.ts";
import type { Runner } from "../src/process.ts";

function runnerFor(
  script: { code: number; stderr?: string },
  calls: string[][],
): Runner {
  return (_command, args) => {
    calls.push([...args]);
    return Promise.resolve({ code: script.code, stderr: script.stderr ?? "" });
  };
}

describe("verifyInstallation", () => {
  it("works when diagnose passes", async () => {
    const calls: string[][] = [];

    await verifyInstallation("/fake/gdvm", runnerFor({ code: 0 }, calls));

    assert.deepEqual(calls, [["diagnose"]]);
  });

  it("propagates diagnose failures with the exit code", async () => {
    await assert.rejects(
      verifyInstallation("/fake/gdvm", runnerFor({ code: 1 }, [])),
      /diagnose reported problems \(exit code 1\)/u,
    );
  });
});
