---
name: dextinity-admin-browser-use
description: Control the admin UI of a Dextinity (formerly COMET) project with the Playwright MCP — log in on a local dev server, navigate the main menu, create/publish/delete pages in the page tree, add and fill content blocks, type in the Draft.js or TipTap rich text editor, and pick assets in the DAM. Use this whenever a task needs a running Dextinity admin in a browser: verifying a change in the real admin, reproducing a bug report, taking screenshots of the admin, or seeding content that no other tool can create. Use it even for a single step like "open the page tree" or "put a headline in that block".
---

# Controlling a Dextinity admin UI with Playwright

Don't use this skill just to add content when another tool, such as an MCP server for the admin, can add it directly.

Every instruction here is a starting point, not a guarantee. Projects add, rename, restyle and remove admin features freely: the page tree and the DAM exist almost everywhere and behave as described, rich text and image blocks are usually the stock ones but are often extended, and a project may ship neither. Block names, menu entries, page-tree categories and rich text options are project-specific in every case — the demo values below are examples.

So: try the instructions, and when they do not match, discover the real UI once (see [Finding selectors yourself](#finding-selectors-yourself)) and continue.

## Selector rules

Read this first — it is why the rest of the instructions work without snapshots.

Most Dextinity admin buttons have **no accessible name**, so the Playwright accessibility snapshot shows them as bare `button`, and `getByRole('button', { name: … })` fails. Form fields are not linked to their labels either, so `getByLabel` fails. Use these instead:

- **Fields by `name`** — final-form sets it on every field: `input[name="slug"]`.
- **Component classes, as a substring match** — `[class*="SaveButton-root"]`, `[class*="Rte-root"]`, `[class*="TipTapToolbar-root"]`, `[class*="Dialog-closeButton"]`. Match on the substring, never the full class: this repo emits `DextinityAdmin…`, older COMET projects emit `CometAdmin…`, and emotion appends a hash.
- **Visible text** — the label is in the DOM even when the accessible name is empty: `button:has-text("Upload files")`.
- **URLs** — routes are the most stable handle in the whole admin. Deep-link instead of clicking through menus.

`browser_click` accepts a CSS selector in `target`, so all of these go straight into a click. Prefer `browser_run_code_unsafe` and chain a whole flow into one call; use `browser_find` when you need to locate something, and `browser_snapshot` only as a last resort. Every snippet below is the body of one function: pass it to `browser_run_code_unsafe` as `async (page) => { … }`, with no semicolon after the closing brace. The tool rejects bare top-level `await` and a trailing semicolon alike, both with a syntax error. After `browser_navigate` the inline snapshot file is often empty because the page has not rendered yet — ignore it rather than reacting to it.

## Log in (local dev server only)

Only works against a local dev server, where the identity provider accepts any user without credentials. There is no equivalent on staging or production.

```js
await page.goto("http://localhost:8000/");
if (!page.url().startsWith("http://localhost:8000/")) {
    await page.click('button:has-text("Sign-in")');
}
```

The session outlives `browser_close`, so a login is needed only when the app redirects to the identity provider on another port.

The sign-in page has a user select, `select[name="login"]` (demo: `Admin`, `Non-Admin`). It defaults to `Admin`, which is the correct user unless the task asks for another one. For another user, select it before the click: `await page.selectOption('select[name="login"]', { label: "Non-Admin" })`.

The session is needed for every admin URL, so log in before opening any other URL.

## Routes

Admin routes are `/<scope>/<page-path>`, where the scope segments are the project's content-scope dimensions — `/main/en/pages/pagetree/main-navigation` in the demo. Take the scope prefix from the current URL and append the route.

Routes come from the project's `MasterMenu.tsx` (`MasterMenuData`), which is also the fastest way to learn what the admin contains. They are project-specific: the demo serves the DAM at `/assets`, not `/dam`.

## Page tree

Route: `<scope>/pages/pagetree/<category>`. The category URL parameter is the kebab-case form of the category defined in the project's `pageTreeCategories` (demo: `main-navigation`, `top-menu`). A wrong category silently redirects to a dashboard and shows an empty page, which is the usual reason a tree looks empty.

**Create a page** — deep-link the create dialog, no clicking:

```js
await page.goto("<pagetree-url>/add");
await page.fill('[role="dialog"] input[name="name"]', "My Page");
await page.click('[role="dialog"] [class*="SaveButton-root"]');
```

The slug is derived from the name. Other fields in the dialog: `input[name="slug"]`, `input[name="documentType"]`, `input[name="hideInMenu"]`.

**Open a page for editing** — `page.click('text=My Page')`, which goes to `<pagetree-url>/<page-id>/edit`.

**Publish, unpublish, archive, copy, paste, delete** — tick the row checkbox first; the toolbar is disabled without a selection. With a selection the toolbar actions are the first buttons in `main`, in this order:

| `main button` | Action    |
| ------------- | --------- |
| 0             | Publish   |
| 1             | Unpublish |
| 2             | Archive   |
| 3             | Copy      |
| 4             | Paste     |
| 5             | Delete    |

When the project enables content translation, a Translate button comes before Delete, and a project can turn off Delete. Check the tooltip (see [Finding selectors yourself](#finding-selectors-yourself)) before you click by index.

Copy and Paste act at once. The others open a confirmation dialog — `[role="dialog"] button:has-text("Confirm")` for publishing, `…:has-text("Delete Page")` for deleting. Verify the result by reading the panel text: the row's status reads `Published` or `Unpublished`.

```js
await page.locator('main [draggable="true"]:has-text("My Page") input[type="checkbox"]').check({ force: true });
await page.locator("main button").nth(0).click();
await page.click('[role="dialog"] button:has-text("Confirm")');
```

Each row is a `div[draggable="true"]`, so select the row by the page name, never by position. `:has-text` matches part of the name, so `My Page` also matches `My Page 2`. `force: true` is needed because the toolbar can cover the lower rows.

**Move a page to another category** — open the row's actions menu, its last button, then `Move page` and the category:

```js
const row = page.locator('main [draggable="true"]:has-text("My Page")');
await row.locator("button").last().click({ force: true });
await page.click('[role="menuitem"]:has-text("Move page")');
await page.click('[role="menuitem"]:has-text("Top menu")');
```

**Reordering or nesting pages does not work through Playwright.** Rows are native `draggable="true"` elements in a virtualized list, and neither a manual mouse drag nor `dragTo` moves them. Do not spend calls on it — tell the user this step needs a human.

## Page content and blocks

From `<pagetree-url>/<page-id>/edit`, the right-hand panel holds the block list under the `Blocks` tab.

```js
await page.click('button:has-text("Add block")');
await page.click('[role="dialog"] [role="button"]:text-is("Rich Text")');
```

Two things about the picker that are easy to get wrong: the entries are `div[role="button"]`, not `button`, and the text match has to be exact, or `Rich Text` also matches `Rich Text (TipTap)`. The picker lists every block the project offers, grouped by category, and has a search box — so it is its own discovery tool, no need to read the project's block registration. The picker's `add + edit` checkbox, on by default, opens the new block's editor right away. The browser remembers the last choice, so if the editor did not open, check the box: `[role="dialog"] input[type="checkbox"]`.

## Rich text

Both editors ship with Dextinity and a project uses one or the other; the available marks, text blocks and text styles are configured per project.

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

**TipTap** (`@dextinity/cms-admin`): the editor is `.tiptap.ProseMirror` — a TipTap class, so it is identical everywhere. Its toolbar has up to two selects in `[class*="TipTapToolbar-root"] [role="combobox"]`: the text block (demo: `Paragraph`, `Display`, `Heading 1` to `Heading 5`), shown only when the project configures more than one, then the text style (demo: `Default`, `Paragraph Small`, `Eyebrow 600`). Open one and read `[role="option"]` to get the project's list.

Keyboard shortcuts work in both editors, but they **toggle**, so a mark can silently come back off if the selection already had it. Apply, then assert — `(await editor.innerHTML()).includes('<strong>')` — rather than trusting the keypress.

## DAM and asset fields

Route: whatever the project maps `DamPage` to (demo: `<scope>/assets`). The grid is a MUI DataGrid that only renders the rows in view, so filter it with `input[name="searchText"]` before you look for an asset. The toolbar buttons carry visible text, so `button:has-text("Upload files")` works. Bulk actions for the selected rows live behind `button:has-text("More")` and are `[role="menuitem"]` entries (`Download`, `Move`, `Archive`, `Restore`, `Delete`), each with its own confirmation dialog — the delete one confirms with `button:has-text("Delete Now")`, not the page tree's `Delete Page`.

Upload a file with the `browser_file_upload` tool after clicking `Upload files`.

**Pick an asset in a block** — the field opens the same grid in a dialog:

```js
await page.click("text=Choose image");
await page.fill('[role="dialog"] input[name="searchText"]', "my-image");
await page.click('[role="dialog"] [role="gridcell"]:has-text("my-image.jpeg")');
```

## Saving

Click `[class*="SaveButton-root"]`, prefixed with `[role="dialog"] ` in a dialog. When the save fails, the button gets the class `Mui-error` for 5 s, and the page shows the reason. A disabled button does not mean saved, because the button is also disabled after a failed save. Check for `Mui-error` before you continue.

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
