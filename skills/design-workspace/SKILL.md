---
name: design-workspace
description: Work with the design workspace of @dextinity/ui — the `Workspace/Shell` story that shows any story or clickable prototype like the app in the browser, with theme, color scheme, density, and viewport switchable around it. Use when a designer wants to see a change, look at a component or page in the workspace, get a shareable link to it, update that link after `next` moved, add or extend a clickable prototype, or put work in progress on the workspace's canvas. Also use when changing the workspace itself (`packages/ui/src/storybook/workspace/`).
metadata:
    internal: true
---

# Design workspace

The workspace is a story of the `@dextinity/ui` Storybook: `Workspace/Shell` (`packages/ui/src/storybook/workspace/WorkspaceShell.tsx`). The [Design workspace](../../packages/ui/README.md#design-workspace) section of the package README describes what it does. Paths below are relative to `packages/ui`. This skill covers how to work with it, mostly for a designer who reviews the result in a browser and doesn't run the repository.

## Where the work goes

| What                                           | Where                                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A page or component in progress, to look at it | A story in `src/storybook/workspace/__stories__/WorkspaceCanvas.stories.tsx`; the Storybook lists `Workspace` first                         |
| A clickable prototype of an app                | A story in `src/storybook/workspace/__stories__/WorkspacePrototypes.stories.tsx`, plus its entry in `src/storybook/workspace/prototypes.ts` |
| A change to a component the designer asked for | The component itself, in its own pull request, as any other change of the package                                                           |

Keep each change that is meant for review on its own branch, so it can become its own pull request (see [Pull requests](#pull-requests)). The designer's link shows a branch that merges all of them (see [The link](#the-link)).

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
3. Build the Storybook into the build directory, as described in [Building the static Storybook](#building-the-static-storybook).
4. Publish `launcher.html` from this skill with the Artifact tool to the user's link, with `root` set to the build directory and `files` set to the files that changed. A first publish has to send every file; the Artifact tool takes at most 255 files per publish, so send them over several publishes to the same link.

Use a build directory in the scratchpad, and reuse it between updates, so that you can tell which files changed.

### Building the static Storybook

The link needs a build with few files and stable file names, so that an update sends only the files whose content changed. Storybook's own build splits the stories into hundreds of chunks with hashed names, so build it with a changed copy of its config:

1. Before building, record a checksum of every file in the build directory (e.g. `md5sum`), to compare against afterwards.
2. In `packages/ui`, copy `.storybook` to `.storybook-static-build`. In the copy's `main.ts`, add to the Vite config's `build` options:

    ```ts
    assetsInlineLimit: 10_000_000,
    cssCodeSplit: false,
    ```

    and to its `rolldownOptions`:

    ```ts
    output: { inlineDynamicImports: true, entryFileNames: "assets/[name].js", chunkFileNames: "assets/[name].js", assetFileNames: "assets/[name][extname]" },
    ```

    Check that each option ended up in the config: if `main.ts` changed and an option went missing, the build still succeeds, but with hashed names and hundreds of files.

3. Build with `pnpm exec storybook build -c .storybook-static-build -o <build directory> --quiet`, empty the build directory first, and delete `.storybook-static-build` afterwards. The build should have about 330 files.
4. Rename `index.html` in the build to `storybook.html`: the launcher is the link's start page, and the workspace's Storybook tab embeds Storybook's own UI from `storybook.html`.
5. The Artifact upload refuses the character U+FFFD. Replace it in the build's `.js` files with the escape `\uFFFD`, which stands for the same character in a JavaScript string.
6. Write `status.json` into the build for the launcher's banner (see [When `next` moved](#when-next-moved)).
7. Compare the checksums with the ones from step 1: a changed or new file goes into `files` as `{"<path>": "<path>"}`, a removed one as `{"<path>": null}`.

### When `next` moved

The launcher reads `status.json` from the build and shows a banner with the commits `next` has that the workspace branch doesn't:

```json
{
    "base": "next",
    "checkedAt": "2026-11-20T12:40+00:00",
    "behind": 2,
    "commits": [{ "sha": "f1bf3d8f2", "subject": "ui: Mark the current navigation entry with a soft tint" }],
    "builtFrom": "1c3924c27"
}
```

`behind` is `git rev-list --count origin/<workspace branch>..origin/next`, `commits` the newest ten of that range (at most), and `builtFrom` the short commit of the workspace branch the build was made from. To refresh the banner without a rebuild, publish only `status.json`.

When the user asks to update the workspace, merge `next` into the workspace branch, push it, and build and publish as above. Resolve conflicts in favor of `next` unless a branch of the ongoing work changed the same lines on purpose.

When another session published to the link in the meantime, the publish is refused. Read the changed files, check with `git merge-base --is-ancestor <its builtFrom> HEAD` that your build contains that session's build, and publish again.

## Checking a change

Look at every visual change before publishing it, at a desktop, a tablet, and a phone width: serve the build directory (`python3 -m http.server`) and take screenshots with Playwright of `iframe.html?id=workspace-shell--shell&viewMode=story`. In the build, the workspace keeps its settings in `localStorage`, so a fresh browser context starts from the defaults.

## Pull requests

Open a pull request only when the designer asks for one. A designer usually doesn't read GitHub, so report what happens on it in the session.

- Branch from `next`. When the change builds on a branch whose pull request isn't merged yet, branch from that branch and open the pull request against it, so the diff shows only the new change. Once the pull request below is merged, change the base to `next`.
- Open it as a draft and set it to ready for review once CI is green, so Greptile reviews a finished change. Fix Greptile's findings until it scores 5/5, and reply to its threads.
- Add screenshots of every visual change, at the widths you checked it at. Upload them to the `pr-screenshots` branch, which has no shared history with the code, in a folder named after the pull request, and link them by commit, e.g. `https://raw.githubusercontent.com/vivid-planet/dextinity/<commit>/<pull request number>/<name>.png`, so a later push to the branch doesn't change the images.
- Changes to the workspace and the prototypes are Storybook-only and need no changeset; a change to a component does.
