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

import { compareVersions, formatVersion, parseVersion } from "../src/semver.ts";

function cmp(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);

  if (!left || !right) {
    throw new Error("test versions must parse");
  }

  return Math.sign(compareVersions(left, right));
}

describe("parseVersion", () => {
  it("parses stable and pre-release versions", () => {
    assert.partialDeepStrictEqual(parseVersion("0.15.0"), {
      major: 0,
      minor: 15,
      patch: 0,
    });
    assert.partialDeepStrictEqual(parseVersion("v1.2.3"), {
      major: 1,
      minor: 2,
      patch: 3,
    });
    assert.deepEqual(parseVersion("1.2.3-pre.1")?.prerelease, ["pre", "1"]);
  });

  it("rejects everything else", () => {
    for (const bad of [
      "",
      "1.2",
      "1.2.3.4",
      "latest",
      "1.2.x",
      "one.two.three",
    ]) {
      assert.equal(parseVersion(bad), undefined);
    }
  });
});

describe("compareVersions", () => {
  it("orders the numeric part numerically", () => {
    assert.equal(cmp("0.15.0", "0.9.9"), 1);
    assert.equal(cmp("0.15.0", "0.15.1"), -1);
    assert.equal(cmp("1.0.0", "1.0.0"), 0);
  });

  it("orders pre-releases before their stable release", () => {
    assert.equal(cmp("1.0.0-pre.1", "1.0.0"), -1);
    assert.equal(cmp("1.0.0-pre.2", "1.0.0-pre.10"), -1);
    assert.equal(cmp("1.0.0-alpha", "1.0.0-beta"), -1);
    assert.equal(cmp("1.0.0-1", "1.0.0-alpha"), -1);
  });
});

describe("formatVersion", () => {
  it("round trips", () => {
    for (const version of ["0.15.0", "1.2.3-pre.1"]) {
      const parsed = parseVersion(version);

      if (!parsed) {
        throw new Error("must parse");
      }

      assert.equal(formatVersion(parsed), version);
    }
  });
});
