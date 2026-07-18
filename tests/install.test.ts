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
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { verifySha256 } from "../src/install.ts";

describe("verifySha256", () => {
  it("accepts a matching digest case insensitively", async () => {
    const file = path.join(tmpdir(), `setup-gdvm-test-${crypto.randomUUID()}`);

    await writeFile(file, "hello");

    const digest =
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

    await verifySha256(file, digest.toUpperCase(), "test");
  });

  it("rejects a mismatch and says nothing was installed", async () => {
    const file = path.join(
      tmpdir(),
      `setup-gdvm-test-${crypto.randomUUID()}-bad`,
    );

    await writeFile(file, "tampered");
    await assert.rejects(
      verifySha256(file, "ab".repeat(32), "test"),
      /checksum mismatch[\s\S]*nothing was installed/u,
    );
  });
});
