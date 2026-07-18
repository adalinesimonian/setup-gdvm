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

import { error, getInput, info, setOutput } from "./actions.ts";
import { installRelease, verifyInstallation } from "./install.ts";
import { gdvmReleaseUrl, fetchReleases, resolveVersion } from "./manifest.ts";
import { normalizeArch, rustTarget } from "./platform.ts";

export async function main(): Promise<void> {
  const requested = getInput("version") || "latest";
  const releasesUrl = getInput("releases-url") || gdvmReleaseUrl;
  const arch = normalizeArch(getInput("architecture") || process.arch);
  const target = rustTarget(process.platform, arch);
  const releases = await fetchReleases(releasesUrl);
  const release = resolveVersion(releases, requested);

  info(`Setting up gdvm ${release.version} (${target})`);

  const { binPath, cacheHit } = await installRelease(
    release,
    target,
    process.platform,
  );

  await verifyInstallation(binPath);
  await setOutput("gdvm-version", release.version);
  await setOutput("gdvm-path", binPath);
  await setOutput("cache-hit", cacheHit);
}

try {
  await main();
} catch (cause) {
  error(cause instanceof Error ? cause.message : String(cause));

  process.exitCode = 1;
}
