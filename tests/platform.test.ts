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

import { executableName, normalizeArch, rustTarget } from "../src/platform.ts";

describe("rustTarget", () => {
  it("maps every supported runner to its Rust target", () => {
    assert.equal(rustTarget("linux", "x86_64"), "x86_64-unknown-linux-gnu");
    assert.equal(rustTarget("linux", "aarch64"), "aarch64-unknown-linux-gnu");
    assert.equal(rustTarget("linux", "i686"), "i686-unknown-linux-gnu");
    assert.equal(rustTarget("darwin", "x86_64"), "x86_64-apple-darwin");
    assert.equal(rustTarget("darwin", "aarch64"), "aarch64-apple-darwin");
    assert.equal(rustTarget("win32", "x86_64"), "x86_64-pc-windows-msvc");
    assert.equal(rustTarget("win32", "aarch64"), "aarch64-pc-windows-msvc");
    assert.equal(rustTarget("win32", "i686"), "i686-pc-windows-msvc");
  });

  it("names the unsupported pair and the supported ones", () => {
    assert.throws(
      () => rustTarget("freebsd", "x86_64"),
      /freebsd-x86_64[\s\S]*linux-x86_64/u,
    );
  });
});

describe("executableName", () => {
  it("gives Windows an .exe suffix but not linux", () => {
    assert.equal(executableName("win32"), "gdvm.exe");
    assert.equal(executableName("linux"), "gdvm");
  });
});

describe("normalizeArch", () => {
  it("maps Node arch names to Rust arch names", () => {
    assert.equal(normalizeArch("x64"), "x86_64");
    assert.equal(normalizeArch("arm64"), "aarch64");
    assert.equal(normalizeArch("ia32"), "i686");
  });

  it("maps common aliases to Rust arch names", () => {
    assert.equal(normalizeArch("amd64"), "x86_64");
    assert.equal(normalizeArch("x86_64"), "x86_64");
    assert.equal(normalizeArch("aarch64"), "aarch64");
    assert.equal(normalizeArch("x86"), "i686");
    assert.equal(normalizeArch("i386"), "i686");
  });

  it("is case-insensitive and trims whitespace", () => {
    assert.equal(normalizeArch("  X64 "), "x86_64");
    assert.equal(normalizeArch("ARM64"), "aarch64");
  });
});
