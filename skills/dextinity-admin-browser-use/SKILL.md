---
name: dextinity-admin-browser-use
description: Drive the admin UI of a Dextinity (formerly COMET) project in a browser through the Playwright MCP — log in on a local dev server, navigate the main menu, create/publish/delete pages in the page tree, add and fill content blocks, type in the Draft.js or TipTap rich text editor, and pick assets in the DAM. Use this whenever a task means clicking through a running Dextinity admin instead of reading its code: verifying a change in the real admin, reproducing a bug report, taking screenshots of the admin, or seeding content. It replaces the snapshot-look-think-click loop with direct selectors, so reach for it even for a single step like "open the page tree" or "put a headline in that block".
---

# Driving a Dextinity admin UI with Playwright

Every instruction here is a starting point, not a guarantee. Projects add, rename, restyle and remove admin features freely: the page tree and the DAM exist almost everywhere and behave as described, rich text and image blocks are usually the stock ones but are often extended, and a project may ship neither. Block names, menu entries, page-tree categories and rich text options are project-specific in every case — the demo values below are examples.

So: try the instructions, and when they do not match, discover the real UI once (see [Finding selectors yourself](#finding-selectors-yourself)) and continue. If what you find looks like a change in the packages rather than project customization, report it as described under [Reporting a wrong instruction](#reporting-a-wrong-instruction).

## Selector rules

Read this first — it is why the rest of the instructions work without snapshots.

Most Dextinity admin buttons have **no accessible name**, so the Playwright accessibility snapshot shows them as bare `button`, and `getByRole('button', { name: … })` fails. Form fields are not linked to their labels either, so `getByLabel` fails. Use these instead:

- **Fields by `name`** — final-form sets it on every field: `input[name="slug"]`.
- **Component classes, as a substring match** — `[class*="SaveButton-root"]`, `[class*="Rte-root"]`, `[class*="TipTapToolbar-root"]`, `[class*="Dialog-closeButton"]`. Match on the substring, never the full class: this repo emits `DextinityAdmin…`, older COMET projects emit `CometAdmin…`, and emotion appends a hash.
- **Visible text** — the label is in the DOM even when the accessible name is empty: `button:has-text("Upload files")`.
- **URLs** — routes are the most stable handle in the whole admin. Deep-link instead of clicking through menus.

`browser_click` accepts a CSS selector in `target`, so all of these go straight into a click. Prefer `browser_run_code_unsafe` and chain a whole flow into one call; use `browser_find` when you need to locate something, and `browser_snapshot` only as a last resort. Every snippet below is the body of one function: pass it to `browser_run_code_unsafe` as `async (page) => { … }`, with no semicolon after the closing brace. The tool rejects bare top-level `await` and a trailing semicolon alike, both with a syntax error. After `browser_navigate` the inline snapshot file is often empty because the page has not rendered yet — ignore it rather than reacting to it.

## Reporting a wrong instruction

When a route, class, field name or toolbar order here turns out to be wrong and the cause is not project customization — a renamed class key, a reordered core toolbar, a changed core route — end your reply with:

```
## What should be changed in the "dextinity-admin-browser-use" skill
```

Name the stale instruction and its replacement. A project-specific mismatch (a renamed block, a missing menu entry, a different category) is expected and needs no report.

## Updating this skill

**Goal.** Direct instructions, so an agent driving a Dextinity admin can act without a snapshot-look-think-click loop at every step. Only routes, `name` attributes, component class substrings, visible text and keyboard shortcuts belong here — those survive across projects and restyling. Never record emotion hashes, snapshot `ref` values or generated ids.

**How to explore.** Start the demo (`dev-pm start @demo-admin`, plus `@demo-api`), log in at `localhost:8000`, and drive it with the Playwright MCP. Use `browser_run_code_unsafe` to batch steps and keep the call count low. Look up the project-variable parts in the project's own source — `MasterMenu.tsx` for routes, `pageTreeCategories` for categories — and let the UI itself (the block picker, the option lists, the tooltip loop) supply the rest. Leave the demo as you found it: delete the pages and assets you created.

**How to write a new section.** One `###` headline per feature under `## Features`, direct instructions only, same shape as the sections already there. No reasoning, no background, nothing the reader does not act on. That keeps the file extendable by appending a single section — the admin-generator CRUD grids and dialogs are the obvious next one.

**The test an instruction has to pass.** It goes in only if it lets the agent act straight away. If a step still needs a snapshot or a discovery call to find its target, say so in the section instead of presenting it as a shortcut — as the page-tree drag limitation and the tooltip loop do. Verify every instruction against the running demo before writing it down; a plausible selector that was never clicked is worse than none.

## Features

### Log in (local dev server only)

Only works against a local dev server, where the identity provider accepts any role without credentials. There is no equivalent on staging or production.

```js
await page.goto("http://localhost:8000/");
if (!page.url().startsWith("http://localhost:8000/")) {
    await page.click('button:has-text("Sign-in")'); // role select defaults to Admin
}
```

The session outlives `browser_close`, so check the URL instead of clicking blind: a login is needed only when the app redirected to the identity provider on another port, and waiting for `Sign-in` on an existing session costs a 30 second timeout.

For a non-admin session, pick the role in the `select` before clicking. The session is needed for every admin URL, so log in before opening any other URL.

### Routes

Admin routes are `/<scope>/<page-path>`, where the scope segments are the project's content-scope dimensions — `/main/en/pages/pagetree/main-navigation` in the demo. Take the scope prefix from the current URL and append the route.

Routes come from the project's `MasterMenu.tsx` (`MasterMenuData`), which is also the fastest way to learn what the admin contains. They are project-specific: the demo serves the DAM at `/assets`, not `/dam`.

### Page tree

Route: `<scope>/pages/pagetree/<category>`. The category URL parameter is the kebab-case form of the category defined in the project's `pageTreeCategories` (demo: `main-navigation`, `top-menu`). A wrong category silently redirects to a dashboard and shows an empty page, which is the usual reason a tree looks empty.

**Create a page** — deep-link the create dialog, no clicking:

```js
await page.goto("<pagetree-url>/add");
await page.fill('[role="dialog"] input[name="name"]', "My Page");
await page.click('[role="dialog"] [class*="SaveButton-root"]');
```

The slug is derived from the name. Other fields in the dialog: `input[name="slug"]`, `input[name="documentType"]`, `input[name="hideInMenu"]`.

**Open a page for editing** — `page.click('text=My Page')`, which goes to `<pagetree-url>/<page-id>/edit`.

**Publish, unpublish, archive, copy, paste, delete** — tick the row checkbox first; the toolbar is disabled without a selection. With a selection the six toolbar actions are the first buttons in `main`, in this order:

| `main button` | Action    |
| ------------- | --------- |
| 0             | Publish   |
| 1             | Unpublish |
| 2             | Archive   |
| 3             | Copy      |
| 4             | Paste     |
| 5             | Delete    |

Each opens a confirmation dialog — `[role="dialog"] button:has-text("Confirm")` for publishing, `…:has-text("Delete Page")` for deleting. Verify the result by reading the panel text: the row's status reads `Published` or `Unpublished`.

```js
await page.locator('main input[type="checkbox"]').nth(1).check(); // nth(0) is "select all"
await page.locator("main button").nth(0).click();
await page.click('[role="dialog"] button:has-text("Confirm")');
```

**Moving or reordering pages does not work through Playwright.** Rows are native `draggable="true"` elements in a virtualized list; neither a manual mouse drag nor `dragTo` moves them, and the page-tree toolbar has no Move action. Do not spend calls on it — tell the user this step needs a human.

### Page content and blocks

From `<pagetree-url>/<page-id>/edit`, the right-hand panel holds the block list under the `Blocks` tab.

```js
await page.click('button:has-text("Add block")');
await page.click('[role="dialog"] [role="button"]:text-is("Rich Text")');
```

Two things about the picker that are easy to get wrong: the entries are `div[role="button"]`, not `button`, and the text match has to be exact, or `Rich Text` also matches `Rich Text (TipTap)`. The picker lists every block the project offers, grouped by category, and has a search box — so it is its own discovery tool, no need to read the project's block registration. With the `add + edit` checkbox left on (the default), adding a block opens its editor immediately.

### Rich text

Both editors ship with Dextinity and a project uses one or the other; the available marks, node types and text styles are configured per project.

**Draft.js** (`@dextinity/admin-rte`):

```js
const editor = page.locator('[class*="Rte-root"] [contenteditable="true"]');
await editor.click();
await editor.pressSequentially("Some text");
await page.keyboard.press("ControlOrMeta+a");
await page.keyboard.press("ControlOrMeta+b");
```

Block type goes through the toolbar select:

```js
await page.click('[class*="RteBlockTypeControls-select"]');
await page.locator('[role="option"]').allInnerTexts(); // the project's options
await page.click('[role="option"]:text-is("Heading 2")');
```

**TipTap** (`@dextinity/cms-admin`): the editor is `.tiptap.ProseMirror` — a TipTap class, so it is identical everywhere. Its toolbar has two selects in `[class*="TipTapToolbar-root"] [role="combobox"]`: `nth(0)` is the node type (`Paragraph`, `Heading 1` to `Heading 6`), `nth(1)` is the text style (demo: `Default`, `Paragraph Small`, `Eyebrow 600`). Open one and read `[role="option"]` to get the project's list.

Keyboard shortcuts work in both editors, but they **toggle**, so a mark can silently come back off if the selection already had it. Apply, then assert — `(await editor.innerHTML()).includes('<strong>')` — rather than trusting the keypress.

### DAM and asset fields

Route: whatever the project maps `DamPage` to (demo: `<scope>/assets`). The grid is a MUI DataGrid; the toolbar buttons carry visible text, so `button:has-text("Upload files")` works. Bulk actions for the selected rows live behind `button:has-text("More")` and are `[role="menuitem"]` entries (`Download`, `Move`, `Archive`, `Restore`, `Delete`), each with its own confirmation dialog — the delete one confirms with `button:has-text("Delete Now")`, not the page tree's `Delete Page`.

Upload a file with the `browser_file_upload` tool after clicking `Upload files`.

**Pick an asset in a block** — the field opens the same grid in a dialog:

```js
await page.click("text=Choose image");
await page.click('[role="dialog"] [role="gridcell"]:has-text("my-image.jpeg")');
```

### Saving

Exactly one `[class*="SaveButton-root"]` exists at a time. It is disabled while there is nothing to save, and goes back to disabled once the save completes — so wait for that instead of a fixed timeout:

```js
await page.click('[class*="SaveButton-root"]');
await page.waitForSelector('[class*="SaveButton-root"]:disabled');
```

## Finding selectors yourself

Icon-only buttons carry their label only in a MUI tooltip, which is not in the DOM until hover. One hover loop dumps the whole toolbar, which is far cheaper than a snapshot per button:

```js
const buttons = page.locator('[class*="TipTapToolbar-root"] button'); // or 'main button', '[role="toolbar"] button'
const labels = [];
for (let i = 0; i < (await buttons.count()); i++) {
    await page.mouse.move(2, 2);
    await page.waitForTimeout(150);
    await buttons
        .nth(i)
        .hover({ force: true })
        .catch(() => {});
    await page.waitForTimeout(400);
    labels.push(
        i +
            ": " +
            (await page
                .locator('[role="tooltip"]')
                .allInnerTexts()
                .catch(() => [])),
    );
}
return labels;
```

Two conditions, both found the hard way: move the mouse away between hovers or the tooltip lags a button behind, and run the loop right after a page load — after a lot of interaction the tooltips stop appearing at all, and a reload brings them back.

For dialogs and panels, one `evaluate` call listing `input[name]`, button text and `[class*="Dextinity"]`/`[class*="Comet"]` classes tells you everything needed to drive it.
