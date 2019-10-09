[![Travis](https://img.shields.io/travis/prefixaut/splitterino.svg?style=for-the-badge&label=Travis%20Build&logo=travis-ci&logoColor=white)](https://travis-ci.org/prefixaut/splitterino)
[![Azure](https://img.shields.io/azure-devops/build/zwieback/7a11f53e-bc2c-478a-9378-dd40c708ead9/1?label=Azure%20Build&logo=azure-devops&style=for-the-badge&logoColor=white)](https://dev.azure.com/zwieback/splitterino/_build?definitionId=1)
[![Coverage](https://img.shields.io/codeclimate/coverage/prefixaut/splitterino.svg?style=for-the-badge&logo=code-climate&logoColor=white)](https://codeclimate.com/github/prefixaut/splitterino)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/prefixaut/splitterino?logo=code-climate&logoColor=white&style=for-the-badge)](https://codeclimate.com/github/prefixaut/splitterino)
[![Release Version](https://img.shields.io/github/release/prefixaut/splitterino.svg?style=for-the-badge)](https://github.com/prefixaut/splitterino/releases)
[![License](https://img.shields.io/github/license/prefixaut/splitterino.svg?style=for-the-badge)](https://github.com/prefixaut/splitterino/blob/master/LICENSE)

# Splitterino

Splitterino is an open-source multi-platform applications for speedrunners (gaming-speedrunners) to time their runs with! It's greatly insprired from existing splitters like [LiveSplit](http://livesplit.org/), but is build freshly from the ground up with customization in mind.

Splitterino is built untop [Electron](https://electronjs.org/) and [Vue](https://vuejs.org/), using [TypeScript](https://www.typescriptlang.org/) as the language for a more reliable and stable application.

## Usage

To install Splitterino to use it, you should use the installer for your operating system.
Download the appropiate installer from the [GitHub Releases](https://github.com/prefixaut/splitterino/releases) Page and follow the instructions.

## Installation

This installation is aimed for developers to work on and test the code.

Required Software:
* Node via [NodeJS](https://nodejs.org) or via [NVM - Node Version Manager](https://github.com/nvm-sh/nvm)
* [yarn](https://yarnpkg.com/) as the Package-Manager (instead of `npm`)

First, clone the repository to your local machine.
Instead of cloning the repository from GitHub, you should see the [CONTRIBUTING](https://github.com/prefixaut/splitterino/blob/master/CONTRIBUTING.md) File to get access to the developing GitLab-server.

Then install all packages via `yarn` and then serve the application.

```sh
yarn
yarn serve
```

Beware of possible zombie threads when the application is killed via `Ctrl+C`.