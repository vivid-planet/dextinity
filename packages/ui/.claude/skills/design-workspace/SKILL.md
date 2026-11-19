---
name: design-workspace
description: Work with the design workspace of @dextinity/ui — the `Workspace/Shell` story that shows any story or clickable prototype like the app in the browser, with theme, color scheme, density, and viewport switchable around it. Use when a designer wants to see a change, look at a component or page in the workspace, get a shareable link to it, update that link after `next` moved, add or extend a clickable prototype, or put work in progress on the workspace's canvas. Also use when changing the workspace itself (`src/storybook/workspace/`).
---

# Design workspace

The workspace is a story of the `@dextinity/ui` Storybook: `Workspace/Shell` (`src/storybook/workspace/WorkspaceShell.tsx`). The [Design workspace](../../../README.md#design-workspace) section of the package README describes what it does. This skill covers how to work with it, mostly for a designer who reviews the result in a browser and doesn't run the repository.

## Where the work goes

| What                                           | Where                                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A page or component in progress, to look at it | A story in `src/storybook/workspace/__stories__/WorkspaceCanvas.stories.tsx`; the workspace lists `Workspace/Canvas` first                  |
| A clickable prototype of an app                | A story in `src/storybook/workspace/__stories__/WorkspacePrototypes.stories.tsx`, plus its entry in `src/storybook/workspace/prototypes.ts` |
| A change to a component the designer asked for | The component itself, in its own pull request, as any other change of the package                                                           |

Keep each change that is meant for review on its own branch from `next`, so it can become its own pull request. The designer's link shows a branch that merges all of them (see [The link](#the-link)).

## Prototypes

A prototype is one story whose pages are the live examples of the page types, so it shows what the design system documents. The career portal (`CareerPortal` in `WorkspacePrototypes.stories.tsx`) is the pattern to follow:

- `pages` maps navigation ids of `sideNavGroups` to composed stories (`composeStories` from `@storybook/react-vite`; importing `@storybook/react` breaks the lint).
- The page is the frame's location hash, so a reload keeps it and the workspace can open a page by setting the hash.
- `PrototypeNavigationContext` connects `PageTypeShell`'s navigation to the prototype.
- Navigation entries without a page show `PageNotInPrototype`.

To add a page, add it to `pages` and to `designedPageIds` in `prototypes.ts` — the workspace lists exactly those under the prototype. To add a prototype, add a story to `Workspace/Prototypes` and its `WorkspacePrototype` to `workspacePrototypes`; its `storyId` is the id in the story index (`workspace-prototypes--<story-name-in-kebab-case>`).

## The link

A designer without a local checkout sees the workspace as an Artifact: `launcher.html` from this skill as the page, with the static Storybook as its files. It is the user's own Artifact, so ask for its link, or create one when there is none.

The link shows one branch, usually `ui-design-workspace`: `next` with every branch of the ongoing work merged in. Keep it up to date after each change, without being asked:

1. Commit and push the change on its own branch.
2. Merge that branch into the workspace branch and push it.
3. Rebuild and publish:

    ```bash
    .claude/skills/design-workspace/scripts/rebuild.sh <build directory> ui-design-workspace
    ```

    Run it from `packages/ui` with the workspace branch checked out. It prints the files that changed as a JSON map. Publish `launcher.html` with the Artifact tool to the user's link, with `root` set to the build directory and `files` set to that map. A first publish has to send every file; the Artifact tool takes at most 255 files per publish, so send them over several publishes to the same link.

The build keeps the file names stable and bundles the stories into a few files, so an update sends only what changed. Use a build directory in the scratchpad, and reuse it between updates: `rebuild.sh` compares against the build that is there.

### When `next` moved

`rebuild.sh` also writes `status.json`, from which the launcher shows a banner with the commits `next` has that the workspace branch doesn't. When the user asks to update the workspace, merge `next` into the workspace branch, push it, and rebuild and publish as above. Resolve conflicts in favor of `next` unless a branch of the ongoing work changed the same lines on purpose.

## Checking a change

Look at every visual change before publishing it, at a desktop, a tablet, and a phone width: serve the build directory (`python3 -m http.server`) and take screenshots with Playwright of `iframe.html?id=workspace-shell--shell&viewMode=story`. In the build, the workspace keeps its settings in `localStorage`, so a fresh browser context starts from the defaults.
