<!--
SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
SPDX-License-Identifier: GPL-3.0-or-later

This file is part of gdvm.

gdvm is free software: you can redistribute it and/or modify it under the
terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

gdvm is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program. If not, see <https://www.gnu.org/licenses/>.
-->

# setup-gdvm

GitHub Action that sets up [gdvm](https://github.com/adalinesimonian/gdvm), the Godot version manager.

## Quick start

```yaml
steps:
  - uses: adalinesimonian/setup-gdvm@v1

  - run: gdvm install 4.5
  - run: godot --version
```

You can also pin a specific gdvm version:

```yaml
- uses: adalinesimonian/setup-gdvm@v1
  with:
    version: 0.15.0
```

## Inputs

| Input          | Default               | Description                                                                                                                |
| -------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `version`      | `latest`              | The gdvm version to install. Can be `latest` or an exact version like `0.15.0`. Versions before 0.15.0 are not supported.  |
| `architecture` | _(runner's arch)_     | The target architecture to install for, e.g. `i686`, `x86_64`, or `aarch64`. Useful to run 32-bit gdvm on a 64-bit runner. |
| `releases-url` | _(official registry)_ | Advanced usage only. Override the releases manifest URL, e.g. for a mirror or in tests.                                    |

## Outputs

| Output         | Description                                         |
| -------------- | --------------------------------------------------- |
| `gdvm-version` | The exact gdvm version that was installed.          |
| `gdvm-path`    | The absolute path to the installed gdvm binary.     |
| `cache-hit`    | Whether the binary came from the runner tool cache. |

## Licence

This project is licensed under the GNU General Public License v3.0 or later. See [COPYING](COPYING) for more information.
