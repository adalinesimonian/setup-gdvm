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

import {
  compareVersions,
  formatVersion,
  parseVersion,
  type Version,
} from "./semver.ts";

export const gdvmReleaseUrl = "https://registry.gdvm.io/gdvm/v1/releases.json";
export const supportedSchemaVersion = 1;
export const minimumGdvmVersion = "0.15.0";

export interface Binary {
  readonly filename: string;
  readonly urls: readonly string[];
  readonly sha256: string;
  readonly size?: number;
}

export interface Release {
  readonly version: string;
  readonly parsed: Version;
  readonly prerelease: boolean;
  readonly binaries: ReadonlyMap<string, Binary>;
}

/** Fetch and validate the manifest. Returns releases with the newest first. */
export async function fetchReleases(
  url: string,
  fetcher: typeof fetch = fetch,
): Promise<readonly Release[]> {
  const response = await fetcher(url, {
    headers: { accept: "application/json", "user-agent": "setup-gdvm" },
  });

  if (!response.ok) {
    throw new Error(
      `fetching the gdvm releases manifest failed: ${response.status} ${response.statusText} (${url})`,
    );
  }

  return parseManifest(await response.json(), url);
}

export function parseManifest(
  data: unknown,
  source: string,
): readonly Release[] {
  if (!isRecord(data)) {
    throw new Error(
      `the gdvm releases manifest at ${source} is not a JSON object`,
    );
  }

  if (data.schema !== supportedSchemaVersion) {
    throw new Error(
      `the gdvm releases manifest at ${source} declares schema ${String(data.schema)}; ` +
        `this action understands schema ${supportedSchemaVersion}. A newer setup-gdvm probably exists.`,
    );
  }

  const releases: Release[] = [];

  for (const entry of Array.isArray(data.releases) ? data.releases : []) {
    const release = parseRelease(entry);

    if (release) {
      releases.push(release);
    }
  }

  releases.sort((a, b) => compareVersions(b.parsed, a.parsed));

  return releases;
}

export function latestStable(
  releases: readonly Release[],
): Release | undefined {
  return releases.find(
    (release) => !release.prerelease && release.parsed.prerelease.length === 0,
  );
}

export function resolveVersion(
  releases: readonly Release[],
  requested: string,
): Release {
  const minimum = parseVersion(minimumGdvmVersion);

  if (!minimum) {
    throw new Error("unreachable: the minimum version constant must parse");
  }

  if (requested === "latest") {
    const latest = latestStable(releases);

    if (!latest) {
      throw new Error("the gdvm releases manifest contains no stable release");
    }

    return latest;
  }

  const parsed = parseVersion(requested);

  if (!parsed) {
    throw new Error(
      `"${requested}" is not a version; pass "latest" or a semantic version like "${minimumGdvmVersion}"`,
    );
  }

  if (compareVersions(parsed, minimum) < 0) {
    throw new Error(
      `gdvm ${formatVersion(parsed)} predates ${minimumGdvmVersion}, the oldest version this action supports`,
    );
  }

  const wanted = formatVersion(parsed);
  const release = releases.find((candidate) => candidate.version === wanted);

  if (!release) {
    const available = releases
      .slice(0, 8)
      .map((candidate) => candidate.version)
      .join(", ");

    throw new Error(
      `gdvm ${wanted} is not a published release; recent releases: ${available}`,
    );
  }

  return release;
}

function parseRelease(entry: unknown): Release | undefined {
  if (!isRecord(entry) || typeof entry.version !== "string") {
    return undefined;
  }

  const parsed = parseVersion(entry.version);

  if (!parsed) {
    return undefined;
  }

  const binaries = new Map<string, Binary>();

  if (isRecord(entry.binaries)) {
    for (const [target, binary] of Object.entries(entry.binaries)) {
      if (
        isRecord(binary) &&
        typeof binary.filename === "string" &&
        typeof binary.sha256 === "string" &&
        Array.isArray(binary.urls) &&
        binary.urls.every((url): url is string => typeof url === "string")
      ) {
        binaries.set(target, {
          filename: binary.filename,
          urls: binary.urls,
          sha256: binary.sha256,
          ...(typeof binary.size === "number" ? { size: binary.size } : {}),
        });
      }
    }
  }

  return {
    version: formatVersion(parsed),
    parsed,
    prerelease: entry.prerelease === true,
    binaries,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
