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

import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import {
  chmod,
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { addPath, info } from "./actions.ts";
import type { Binary, Release } from "./manifest.ts";
import { executableName } from "./platform.ts";
import { run, type Runner } from "./process.ts";

export interface InstallResult {
  readonly binPath: string;
  readonly cacheHit: boolean;
}

export async function installRelease(
  release: Release,
  target: string,
  platform: string,
): Promise<InstallResult> {
  const binary = release.binaries.get(target);

  if (!binary) {
    const published = [...release.binaries.keys()].join(", ");

    throw new Error(
      `gdvm ${release.version} publishes no binary for ${target}. Published targets: ${published}`,
    );
  }

  const executable = executableName(platform);
  const { cachedPath, cacheHit } = await obtainBinary(
    release,
    binary,
    target,
    executable,
  );
  const binDir = path.join(homedir(), ".gdvm", "bin");

  await mkdir(binDir, { recursive: true });

  const binPath = path.join(binDir, executable);

  await copyFile(cachedPath, binPath);

  if (platform !== "win32") {
    await chmod(binPath, 0o755);
  }

  await addPath(binDir);

  return { binPath, cacheHit };
}

export async function verifyInstallation(
  binPath: string,
  runner: Runner = run,
): Promise<void> {
  const diagnose = await runner(binPath, ["diagnose"]);

  if (diagnose.code !== 0) {
    throw new Error(
      `gdvm diagnose reported problems (exit code ${diagnose.code})`,
    );
  }
}

async function obtainBinary(
  release: Release,
  binary: Binary,
  target: string,
  executable: string,
): Promise<{ cachedPath: string; cacheHit: boolean }> {
  const toolCache =
    process.env.RUNNER_TOOL_CACHE ??
    path.join(tmpdir(), "setup-gdvm-tool-cache");
  const cacheDir = path.join(toolCache, "gdvm", release.version, target);
  const cachedPath = path.join(cacheDir, executable);

  if (await isFile(cachedPath)) {
    info(`Using cached gdvm ${release.version} for ${target}`);
    return { cachedPath, cacheHit: true };
  }

  const url = binary.urls[0];

  if (url === undefined) {
    throw new Error(
      `gdvm ${release.version} lists no download URL for ${target}`,
    );
  }

  info(`Downloading gdvm ${release.version} (${target})`);

  const downloaded = await download(url);

  await verifySha256(downloaded, binary.sha256, binary.filename);
  await mkdir(cacheDir, { recursive: true });
  await moveFile(downloaded, cachedPath);

  return { cachedPath, cacheHit: false };
}

/** Download a URL to a temporary file and return its path. */
async function download(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": "setup-gdvm" },
  });

  if (!response.ok || response.body === null) {
    throw new Error(
      `downloading ${url} failed: ${response.status} ${response.statusText}`,
    );
  }

  const destination = path.join(
    process.env.RUNNER_TEMP ?? tmpdir(),
    `setup-gdvm-${crypto.randomUUID()}`,
  );

  await mkdir(path.dirname(destination), { recursive: true });

  try {
    await pipeline(
      Readable.fromWeb(response.body),
      createWriteStream(destination),
    );
  } catch (cause) {
    await rm(destination, { force: true });

    throw cause;
  }

  return destination;
}

export async function verifySha256(
  filePath: string,
  expected: string,
  subject: string,
): Promise<void> {
  const digest = createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");

  if (digest.toLowerCase() !== expected.toLowerCase()) {
    await rm(filePath, { force: true });

    throw new Error(
      `checksum mismatch for ${subject}: expected sha256 ${expected}, got ${digest}. ` +
        `The download may be corrupt or tampered with; nothing was installed.`,
    );
  }
}

async function isFile(candidate: string): Promise<boolean> {
  try {
    return (await stat(candidate)).isFile();
  } catch {
    return false;
  }
}

async function moveFile(source: string, destination: string): Promise<void> {
  try {
    await rename(source, destination);
  } catch (cause) {
    const code =
      typeof cause === "object" && cause !== null && "code" in cause
        ? cause.code
        : undefined;

    if (code !== "EXDEV") {
      throw cause;
    }

    await copyFile(source, destination);
    await rm(source, { force: true });
  }
}
