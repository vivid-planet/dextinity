# Future UI

This sub-package is an **experimental**, UI-only React component library inside `@dextinity/admin`, consumed as `@dextinity/admin/future-ui`. It is self-contained: it keeps its own directory and contains no routing, forms, data fetching, or other non-UI logic. Whether it stays a separate sub-package or later becomes part of `@dextinity/admin`'s own UI layer is still open; the UI-only separation holds either way.

Future UI builds from an unstyled foundation rather than evolving the existing MUI-based components; `@base-ui/react` is the chosen foundation.

## Experimental

Any export may change or be removed at any time, without deprecation notice. Every export carries the `@experimental` TSDoc tag. Changesets are not created for changes within this sub-package.

## Non-goals

- **No non-UI logic.** Forms (`final-form`, `react-hook-form`), routing (`react-router`), data fetching (Apollo), and similar concerns stay out.
- **No dependency on `@mui/material`, `@mui/system`, Emotion, or any other part of the existing `@dextinity/admin` styling stack.** Future UI is a fresh foundation; cross-imports reintroduce the competing system it removes.

## Folder and file names

- **Feature folders** use camelCase (`button/`, `textField/`).
- **Component file**: `<ComponentName>.tsx` (PascalCase), one per component feature.
- **Non-component code file**: `<featureName>.ts(x)` (camelCase) for utilities and hooks.
- **Styles**: `<ComponentName>.module.scss` (CSS Modules with SCSS).

## Component conventions

### Exports

- Props are exported as an interface named `<ComponentName>Props`, never a type alias.
- The resolved configuration is exported as a type named `<ComponentName>OwnerState`.
- The component is exported as `<ComponentName>`.

### TSDoc

Components and utilities are documented in TSDoc on the export itself, so the docs ship with the package, get picked up by Storybook, and stay next to the code.

Keep each comment as close as possible to what it describes: the component comment says what the component is for, while a prop's description and its `@defaultValue` go on the prop. Say what a feature does, not how (leave out the rendered element, prop forwarding, the base-ui foundation) and not why (the commit carries that); don't merely restate the name. Keep it as short as the feature allows. The shared override-API members — `className`, `slots`, `slotProps`, and the `OwnerState` type — share the wording shown below, extended only where a component needs more detail.

```tsx
/**
 * Buttons allow users to take actions, and make choices, with a single tap.
 */
export function Button(props: ButtonProps) {
    // ...
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ButtonOwnerState = {
    variant: "primary" | "secondary";
    disabled: boolean;
};

export interface ButtonProps {
    /**
     * Use `primary` only for the single main action on a page, dialog, etc.
     *
     * @defaultValue `"primary"`
     */
    variant?: "primary" | "secondary";
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: ButtonSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ButtonSlotProps;
}
```

A change that makes a comment inaccurate updates it in the same change.

### Root element props

A component extends the props of its root element and passes the ones it doesn't handle itself to that element, so a consumer can set any attribute or event handler the root element accepts without us maintaining a dedicated prop for each. By default it doesn't re-declare or document them; they stay as the root element defines them. It may still re-declare one to support it as a documented feature.

### Override props

Future UI's exported components share one set of override props; each offers the ones that apply to it. The [styling contract](#styling-contract) is the primary way to style a component; these props do what it can't — place and swap inner parts, and set or vary their props.

- **`className`** — a string, merged with the contract classes, never replacing them. It is not a function: every value in `ownerState` already emits a `data-*` attribute, so an `ownerState`-dependent class would add nothing.
- **`slots`** — sets which element a named inner part renders as. The root is not a slot — it is the component's own outermost element, configured through the component's top-level props directly (`className`, event handlers, ARIA, …).
- **`slotProps`** — props for those same inner parts, as an object **or** a function of `ownerState`. Their type follows the element chosen for the slot in `slots`, and falls back to the slot's default element when `slots` is omitted. They are merged with the component's own props, so a contract class or handler is never dropped.
- **`ownerState`** — one object per component: the resolved configuration (`variant`, `disabled`, …) that influences the component's appearance or behavior; the root's `data-*` attributes are derived from it. It holds no transient interaction state (hover/press/focus).

A slot accepts any element only while the component injects nothing element-specific into it — a universal prop like `className` is fine, `href` is not. When the component injects an element-specific prop, the slot narrows to the elements that accept it — a minimum prop contract any intrinsic element or custom component can satisfy. A part limited for semantic reasons instead — a heading restricted to `h1`–`h6` — takes a fixed set of allowed elements.

### Styling contract

Every component emits a stable, predictable contract for consumer styling: a consumer writes plain CSS against it, with no React API involvement required. It is part of the public API — renaming an emitted class or `data-*` attribute is a breaking change.

The contract has two parts: **structural class names** for a component's elements, and **owner-state styling** for the resolved configuration, expressed as `data-*` attributes.

**Structural class names** identify a component's root and its parts:

- **Root** — `comet<Component>`. The outermost element of a component, camelCased. Examples: `cometButton`, `cometTextField`.
- **Parts** — `comet<Component>__<partName>`. A part is a named sub-element; the part name is camelCased. Examples: `cometButton__startIcon`, `cometTextField__label`.

**Owner-state styling** uses `data-*` attributes on the root element, following base-ui's own conversion of an owner-state object:

- **Enum state** → a single valued attribute: `data-variant="primary"`.
- **Boolean state** → presence only: `data-disabled` (absent when false).
- The attribute name is `data-` + the lowercased owner-state key. Owner-state keys are single lowercase words, so the name needs no kebab-casing.

**Emission.** These attributes cover owner-state values only; parts are class names. How a component emits them depends on its foundation: one rendered through `useRender` passes `state: ownerState` for base-ui to convert; one built on a base-ui primitive lets the primitive emit the state it owns and passes the rest inline (`data-variant={variant}`).

**Composition.** When a Future UI component is used as the root of another component, both root classes appear on the same element — a `CustomButton` rendering through `Button` produces `cometButton cometCustomButton`. Either layer is targetable.

**Authoring source.** The SCSS module's local class names match the public part names; the stylesheet's file name is the single source of a component's emitted name. The mapping:

| Source local | Emitted DOM class        |
| ------------ | ------------------------ |
| `root`       | `cometButton`            |
| `startIcon`  | `cometButton__startIcon` |

- A component with no single dominant element names no class `root`.
- Owner-state styles use attribute selectors nested under `.root` with `&` (`.root { &[data-variant="primary"] { … } }`).

### Stories

Stories live under the "Future UI" section. Each consumer-facing component has its own story file in an `__stories__/` directory next to its source; story-only helpers (decorators, the Figma-link builder) live in [`storybook/`](storybook). The component's TSDoc and prop table (see [TSDoc](#tsdoc)) drive its autodocs page, so stories don't restate it.

#### Main story

`__stories__/<ComponentName>.stories.tsx`, included in autodocs, is the component's consumer-facing documentation: a new variant, feature, or state gets a story in the same change, keeping the docs page current.

Stories use [Component Story Format 3](https://storybook.js.org/docs/api/csf), typed with `satisfies` so `meta` is checked against the component's props and each story inherits its args:

```tsx
const meta = {
    component: Button,
    args: { children: "Button", onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;
```

`meta.args` holds only what a practical example needs: required content such as `children`, and the event handlers that make it interactive. It omits any prop that has a component default — a defaulted prop is set in the story that demonstrates it instead.

The first story is `Default`, the autodocs example: it sets no args of its own, showing that smallest practical example. Each prop that changes the component visibly then gets one story per option; a prop that changes only semantics, such as `Typography`'s `element`, stays a control, since a story per value would look the same.

Each declared prop is exposed as a control through `argTypes`, by kind:

- **Boolean** — a toggle.
- **Enum** — `radio` for three options or fewer, `select` for more.
- **`ReactNode`** — a `select` whose `options` are labels and whose `mapping` resolves each to the node. The built-in empty choice covers the unset case.
- **Override-API props** (`className`, `slots`, `slotProps`, `ref`, `render`) — `control: false`, keeping the prop-table row without an unusable control.
- **Event handlers** — `fn()` from `storybook/test`, so calls show in the Actions panel and an interaction test can verify the handler ran.

#### Dev story

`__stories__/<name>.dev.stories.tsx`, optional, nests its title under a `Dev` segment (`Future UI/<Component>/Dev/<Name>`) and sets `tags: ["!autodocs"]` in its meta, keeping these out of the consumer docs. A dev story serves any development, testing, or debugging need, so add them freely — e.g. reproduce a bug in a dev story and use it to confirm the fix, rather than reaching for the Dextinity demo or a consuming project.

#### Figma

Linking the Figma design is strongly recommended: the main story's `meta` links it through [`@storybook/addon-designs`](https://storybook.js.org/addons/@storybook/addon-designs), so the design panel shows the frame across the component's stories. Every component lives in the same DDS Figma file and differs only by frame, so a story passes only its node id — the `node-id` from the frame's Figma link — to a shared helper:

```tsx
const meta = {
    // …
    parameters: {
        design: figmaDesign({ nodeId: "25-2" }),
    },
} satisfies Meta<typeof Button>;
```

## Testing

Test the behavior and contracts a consumer depends on, not the implementation. Each test protects one such behavior; anything written only for coverage, or that just restates the type checker or the implementation, is left out.

What to test, and with which kind of test:

- **Utility logic** — a unit test (`unit` project, `jsdom`) next to the utility, exercising it directly in isolation.
- **A component's render contract** — the class names and `data-*` attributes consumers style and target — a unit test next to the component. Assert the contract, not the styles it produces.
- **A type-only contract** — typing with no runtime behavior, such as slot-prop inference — a compile-time test (`@ts-expect-error` on what must not compile), caught by `tsc`.
- **Component behavior** — click, keyboard, focus, disabled — a Storybook interaction test (a story's `play` function), run in a real browser.

Not worth a test:

- **That a component renders** — every story already runs as a browser test, so a rendering story is the coverage.
- **Appearance** — colors, sizes, spacing — reviewed visually in the stories, never asserted.
- **Dev-local tooling** — CLI scripts, story-only helpers — a failure is loud and local. Exception: code whose regression is silent or reaches consumers, such as the class-name mapping in `cssModules/`.

Run from `packages/admin/admin`: `pnpm run test:unit`, `pnpm run test:storybook`, and `pnpm run test:watch`.

## Theme

Components read their colors and metrics from CSS custom properties (`var(--comet-button-…)`, `var(--comet-color-…)`, `var(--comet-typography-…)`) with **no fallback** — an unthemed component renders visibly unstyled rather than silently drifting to a default. There is no runtime JS theme object.

### Token layers

The tokens are defined in five SCSS partials under [`theme/`](theme), composed into the provider module with `@use` and wrapped in a single `@layer comet`: `_primitives.scss` (raw values, internal), `_brand.scss`, `_responsive.scss`, `_semantic.scss`, and `_components.scss`. [`generateThemeTokens.ts`](cli/generateThemeTokens.ts) generates them, along with the prop-value types ([`theme/types.ts`](theme/types.ts)).

### Regenerating the tokens

The partials and types are generated from a design-token export, not edited manually. To update them:

1. Open the [DDS Figma design](https://www.figma.com/design/xAe7acdpccDSRCrfeOdAg3/DDS---Dextinity-Admin-UI---V-0.1).
2. Install and run the [Design Token Exporter](https://www.figma.com/community/plugin/1590704268871516927) plugin.
3. In the plugin, click **Export Tokens**, then **Download as ZIP**.
4. Extract the ZIP outside the repository. It contains a `design-tokens` directory — a `manifest.json` plus one `*.tokens.json` file per collection and mode. The export itself is not committed.
5. From the repo root, run the generator, pointing it at that directory by absolute path:

    ```bash
    pnpm --filter @dextinity/admin run generate-future-ui-theme-tokens /absolute/path/to/design-tokens
    ```

### Selecting a color scheme

`Theme` selects the active color scheme. It stays a pure function of its props — reading no `window`, `localStorage`, or `matchMedia` — so it renders the same on server and client; switching, OS-scheme resolution, and preventing the first-paint flash on SSR stay in consumer code.

## CLI

Maintainer scripts, run through `pnpm --filter @dextinity/admin run …`:

- **`future-ui-figma list`** prints the DDS component inventory as JSON — every component or component set a designer has marked for development in Figma (dev status "Ready for development" or "Completed"), skipping non-public `_`-prefixed names. It reads the Figma file over the REST API, so `FIGMA_TOKEN` must be set to a Figma [personal access token](https://developers.figma.com/docs/rest-api/personal-access-tokens/), or `list` fails with an `auth_missing` error. The token needs only the `file_content:read` scope.
- **`future-ui-figma describe-target <component>`** prints the props one component's Figma design says it should have as JSON — each prop's type, an enum's options, and its default value.
- **`future-ui-figma describe-implemented <component>`** prints the props one component's source implements, in the same shape as `describe-target`, reading the source instead of Figma.
- **`generate-future-ui-theme-tokens`** regenerates the theme SCSS partials and types from a design-token export — see [Regenerating the tokens](#regenerating-the-tokens).

## Known issues

- Styles are not delivered by the package build yet. The Babel build compiles no CSS Modules, so the class-name mapping applies in Storybook but not in published output.
