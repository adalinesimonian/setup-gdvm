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

import {
  latestStable,
  parseManifest,
  resolveVersion,
} from "../src/manifest.ts";

const BINARY = {
  filename: "gdvm-x86_64-unknown-linux-gnu",
  urls: ["https://example.invalid/gdvm"],
  sha256: "ab".repeat(32),
};

function manifest(
  ...versions: [version: string, prerelease?: boolean][]
): unknown {
  return {
    schema: 1,
    releases: versions.map(([version, prerelease = false]) => ({
      version,
      prerelease,
      binaries: { "x86_64-unknown-linux-gnu": BINARY },
    })),
  };
}

describe("parseManifest", () => {
  it("rejects unknown schemas with guidance", () => {
    assert.throws(
      () => parseManifest({ schema: 2, releases: [] }, "test"),
      /schema 2[\s\S]*newer setup-gdvm/u,
    );
  });

  it("sorts releases newest first and skips broken entries", () => {
    const releases = parseManifest(
      {
        schema: 1,
        releases: [
          { version: "0.15.0", binaries: {} },
          { version: "not-a-version" },
          { version: "0.16.0", binaries: {} },
        ],
      },
      "test",
    );

    assert.deepEqual(
      releases.map((release) => release.version),
      ["0.16.0", "0.15.0"],
    );
  });
});

describe("latestStable", () => {
  it("skips pre-releases", () => {
    const releases = parseManifest(
      manifest(["0.16.0-pre.1", true], ["0.15.0"]),
      "test",
    );

    assert.equal(latestStable(releases)?.version, "0.15.0");
  });
});

describe("resolveVersion", () => {
  const releases = parseManifest(manifest(["0.16.0"], ["0.15.0"]), "test");

  it("resolves latest to the newest stable release", () => {
    assert.equal(resolveVersion(releases, "latest").version, "0.16.0");
  });

  it("resolves exact versions", () => {
    assert.equal(resolveVersion(releases, "0.15.0").version, "0.15.0");
    assert.equal(resolveVersion(releases, "v0.15.0").version, "0.15.0");
  });

  it("refuses versions older than the minimum", () => {
    assert.throws(
      () => resolveVersion(releases, "0.14.0"),
      /predates 0\.15\.0/u,
    );
  });

  it("names recent releases when the requested one does not exist", () => {
    assert.throws(
      () => resolveVersion(releases, "9.9.9"),
      /not a published release[\s\S]*0\.16\.0/u,
    );
  });

  it("rejects invalid versions", () => {
    assert.throws(() => resolveVersion(releases, "newest"), /pass "latest"/u);
  });
});
