---
title: Creating a project
sidebar_position: 1
---

## Requirements

- [Docker](https://www.docker.com/products/docker-desktop)
- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

:::tip

use [Deeper Shell Integration](https://github.com/nvm-sh/nvm#deeper-shell-integration) for automatically using nvm where
applicable

:::

Now, you are ready to create a new Dextinity project.

## Setup

To create a new Dextinity application, execute the following command in your OS command line:

`npx @dextinity/create-app <project-name>`

## Installation

To start the installation process, execute the command:

`./install.sh`

:::info

The _install.sh_ script executes several commands necessary for development, such as:

- Installing required packages
- Creation of folders
- Creation of shortcuts

And can be customized with other commands required for your application.

:::

Once installation is finished, you can start developing.
