---
title: How to run
sidebar_position: 2
---

A Dextinity application consists of multiple processes, such as:

- [an API](packages-tools#apiPackage)
- [an admin application](packages-tools#adminPackage)
- [a frontend site application](packages-tools#sitePackage)
- type generators

We recommend using a process manager to avoid starting all these processes manually. Luckily, the steps in the [installation section](creating-a-project#installation) automatically installed the package: [dev-process-manager](https://dev-process-manager.com/).

Executing the following command starts all processes required to run a [Dextinity application](application-structure):

`npm run dev`

## That's it!

Your Dextinity application is up and running.

:::info

- Execute `npm run browser` to display your application in the browser
- Adding a custom process can be done in the file: _ecosystem.config.js_

:::

## Managing Your Processes

List the status of al processes:

`npx dev-pm status`

<br />

Display logs:

`npx dev-pm logs`

Display logs for a process:

`npx dev-pm logs <process_name>`

<br />

Stop all processes:

`npx dev-pm shutdown`

Start a process:

`npx dev-pm start <process_name>`

Restart a process:

`npx dev-pm restart <process_name>`
