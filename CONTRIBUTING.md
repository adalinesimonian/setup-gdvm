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

# Contributing to setup-gdvm

## Project setup

If you use [proto](https://moonrepo.dev/proto), run `proto use` in the repository root and you'll get the right versions of Node.js and Yarn automatically. For license checks, install the [`reuse`](https://reuse.software) tool.

Then install dependencies:

```sh
yarn --immutable
```

## Testing locally

Unit tests cover a lot of the functionality. For those just run:

```sh
yarn test
```

To manually run and test the action on your own machine, you'll need to provide some of the environment variables that GitHub Actions normally provides. `local-test.sh` does this for you and lets you then run commands with a simulated environment:

```sh
./local-test.sh
```
