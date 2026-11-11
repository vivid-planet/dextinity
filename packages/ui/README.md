# @dextinity/ui

An **experimental**, UI-only React component library. It contains no routing, forms, data fetching, or other non-UI logic, and it is not specific to the admin: any React application can use it.

It builds on an unstyled foundation rather than evolving the MUI-based components of `@dextinity/admin`; `@base-ui/react` is the chosen foundation.

## Documentation

- **This README** is for developers who work on `@dextinity/ui` itself.
- **[`AGENTS.md`](AGENTS.md)** adds only what AI agents need and people don't.
- **The [Storybook](https://next--6adb09e1f667e1e0e9a4a772.chromatic.com)** is for developers who use the package: its docs pages, and the component docs built from TSDoc and stories.

When this README needs something that the Storybook already explains, it links to the explanation instead of repeating it. A change to a convention updates this README in the same change.

## Experimental

Changesets are not created for changes within this package.

## Non-goals

- **No non-UI logic.** Forms (`final-form`, `react-hook-form`), routing (`react-router`), data fetching (Apollo), and similar concerns stay out.
- **No dependency on `@mui/material`, `@mui/system`, Emotion, or any other part of the existing `@dextinity/admin` styling stack.** This package is a fresh foundation; cross-imports reintroduce the competing system it removes.

## Folder and file names

- **Feature folders** use camelCase (`button/`, `textField/`).
- **Component file**: `<ComponentName>.tsx` (PascalCase), one per component feature.
- **Non-component code file**: `<featureName>.ts(x)` (camelCase) for utilities and hooks.
- **Styles**: `<ComponentName>.module.scss` (CSS Modules with SCSS).
- **Tokens**: `<ComponentName>.tokens.scss`, a `tokens` mixin with the component's CSS custom properties (see [Token layers](#token-layers)).

## Component conventions

### Exports

- Props are exported as an interface named `<ComponentName>Props`, never a type alias.
- The resolved configuration is exported as a type named `<ComponentName>OwnerState`.
- The component is exported as `<ComponentName>`, wrapped in `forwardRef`.

### TSDoc

Components and utilities are documented in TSDoc on the export itself, so the docs ship with the package, get picked up by Storybook, and stay next to the code.

Keep each comment as close as possible to what it describes: the component comment says what the component is for, while a prop's description and its `@defaultValue` go on the prop. Describe what a component is for in general, not only the place where it is used today, and mention that place at most as an example: "Shows a short status, such as the state of an order", not "Shows the state of an order". Only when the name itself names the place, such as `OrderStatus`, describe the component for that place. Say what a feature does, not how (leave out the rendered element, prop forwarding, the base-ui foundation) and not why (the commit carries that); don't merely restate the name. Keep it as short as the feature allows. Don't link to Storybook pages. The shared override-API members — `className`, `slots`, `slotProps`, and the `OwnerState` type — share the wording shown below, extended only where a component needs more detail.

```tsx
/**
 * Buttons allow users to take actions, and make choices, with a single tap.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
    // ...
});

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ButtonOwnerState = {
    variant: "contained" | "outlined" | "text";
    disabled: boolean;
};

export interface ButtonProps {
    /**
     * Visual emphasis: `contained` for the main action, `outlined` and `text` for less important ones.
     *
     * @defaultValue `"contained"`
     */
    variant?: "contained" | "outlined" | "text";
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: ButtonSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: ButtonSlotProps;
}
```

A change that makes a comment inaccurate updates it in the same change.

### Root and primary element props

A component's primary element is the native element that does its job — the `<button>` of a button, the `<input>` of a text field, the `<img>` of an image. A component extends the props of its primary element and passes the ones it doesn't handle itself to that element, so a consumer can set any attribute or event handler it accepts without us maintaining a dedicated prop for each. By default it doesn't re-declare or document them; they stay as the element defines them. It may still re-declare one to support it as a documented feature.

Usually the primary element is the root. When a component wraps it, for example to place adornments next to it, `className` and `style` go to the root, where they place and size the component, and `slotProps.root` sets the root's other props. The primary element is then a slot, so `slotProps` also reaches it like any other part.

### Override props

The exported components share one set of override props; each offers the ones that apply to it. The [styling contract](#styling-contract) is the primary way to style a component; these props do what it can't — place and swap inner parts, and set or vary their props.

- **`className`** — a string, merged with the contract classes, never replacing them. It is not a function: every value in `ownerState` already emits a `data-*` attribute, so an `ownerState`-dependent class would add nothing.
- **`slots`** — sets which element a named inner part renders as. Every inner part is a slot, so a consumer can reach it through `slots` and `slotProps`. A slot is named after its job, not after what it shows by default (`clearIcon`, not `crossIcon`). A part that appears in only one state also names that state (`errorIcon`). The root is not a slot — it is the component's own outermost element, configured through the component's top-level props (`className`, `style`, and, when the root is the primary element, event handlers, ARIA, …), and through `slotProps.root` when the component wraps its primary element.
- **`slotProps`** — props for those same inner parts, as an object **or** a function of `ownerState`. Their type follows the element chosen for the slot in `slots`, and falls back to the slot's default element when `slots` is omitted. They are merged with the component's own props, so a contract class or handler is never dropped.
- **`ownerState`** — one object per component: the resolved configuration (`variant`, `disabled`, …) that influences the component's appearance or behavior; the root's `data-*` attributes are derived from it. It holds no transient interaction state (hover/press/focus).

A slot accepts any element only while the component injects nothing element-specific into it — a universal prop like `className` is fine, `href` is not. When the component injects an element-specific prop, the slot narrows to the elements that accept it — a minimum prop contract any intrinsic element or custom component can satisfy. A part limited for semantic reasons instead — a heading restricted to `h1`–`h6` — takes a fixed set of allowed elements.

### Styling contract

Every component emits a stable, predictable contract for consumer styling: a consumer writes plain CSS against it, with no React API involvement required. It is part of the public API — renaming an emitted class or `data-*` attribute is a breaking change.

The contract has two parts: **structural class names** for a component's elements, and **owner-state styling** for the resolved configuration, expressed as `data-*` attributes.

**Structural class names** identify a component's root and its parts:

- **Root** — `dextinity<Component>`. The outermost element of a component, camelCased. Examples: `dextinityButton`, `dextinityTextField`.
- **Parts** — `dextinity<Component>__<partName>`. A part is a named sub-element; the part name is camelCased. Examples: `dextinityButton__startIcon`, `dextinityTextField__label`.

**Owner-state styling** uses `data-*` attributes on the root element, following base-ui's own conversion of an owner-state object:

- **Enum state** → a single valued attribute: `data-variant="contained"`.
- **Boolean state** → presence only: `data-disabled` (absent when false).
- The attribute name is `data-` + the owner-state key in lowercase: `readOnly` becomes `data-readonly`.

**Emission.** These attributes cover owner-state values only; parts are class names. How a component emits them depends on its foundation: one rendered through `useRender` passes `state: ownerState` for base-ui to convert; one built on a base-ui primitive lets the primitive emit the state it owns and passes the rest inline (`data-variant={variant}`).

**Composition.** When a component of this package is used as the root of another component, both root classes appear on the same element — a `CustomButton` rendering through `Button` produces `dextinityButton dextinityCustomButton`. Either layer is targetable.

**Authoring source.** The SCSS module's local class names match the public part names; the stylesheet's file name is the single source of a component's emitted name. The mapping:

| Source local | Emitted DOM class            |
| ------------ | ---------------------------- |
| `root`       | `dextinityButton`            |
| `startIcon`  | `dextinityButton__startIcon` |

- A component with no single dominant element names no class `root`.
- Owner-state styles use attribute selectors nested under `.root` with `&` (`.root { &[data-variant="contained"] { … } }`).

### Stories

The Storybook sidebar mirrors the design system's areas — Foundations, Building blocks, Shell, Patterns: a story title is `<Area>/<Page>/<Component>`, e.g. `Building blocks/Buttons/IconButton`. Each consumer-facing component has its own story file in an `__stories__/` directory next to its source; story-only helpers such as decorators live in [`src/storybook/`](src/storybook). The component's TSDoc and prop table (see [TSDoc](#tsdoc)) drive its autodocs page, so stories don't restate it. The page follows the draft's order: description, the component's sections, tokens, props, and rules. `parameters.tokens`, set to the component's `<ComponentName>.tokens.scss` imported with `?raw`, adds its token table with live values to the page; a `//` comment directly above a token becomes its description. `parameters.rules`, `{ do: string[]; dont: string[] }`, adds the component's do's and don'ts.

The docs show only the body of a story's `render` function, so everything the example needs goes inside it. A `render` function names its parameter `args`. To show a story's full source instead of its `render` body, set `parameters.docs.source.type` to `"code"`.

A story that needs styles, for example to show a customization, puts them in a `.module.scss` file next to the story file and uses it in its `render` function. The file contains only styles that belong to the example: the docs show it next to the story's code.

```tsx
import sizeStyles from "./iconSize.module.scss";

export const Size: Story = {
    render: (args) => <Icon {...args} className={sizeStyles.largeIcon} />,
};
```

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

The first story is `Default`: it sets no args of its own, showing the smallest practical example, and drives the controls on the canvas; the docs page leaves it out. The other stories mirror the sections of the component's page in the design system draft, in its order and with its names, e.g. `Variants`, `StatesPrimary`, `StatesSecondary` for `Button`, and lay out their examples as cards with [`SpecGrid` and `Spec`](src/storybook/docs/SpecGrid.tsx). A state that needs interaction, such as hover, is shown with the `pseudo` parameter of [`storybook-addon-pseudo-states`](https://github.com/chromaui/storybook-addon-pseudo-states). A story that only tests behavior, such as a click on a loading button, is a dev story.

Each declared prop is exposed as a control through `argTypes`, by kind:

- **Boolean** — a toggle.
- **Enum** — `radio` for three options or fewer, `select` for more.
- **`ReactNode`** — a `select` whose `options` are labels and whose `mapping` resolves each to the node. The built-in empty choice covers the unset case.
- **Override-API props** (`className`, `slots`, `slotProps`, `ref`, `render`) — `control: false`, keeping the prop-table row without an unusable control.
- **Event handlers** — `fn()` from `storybook/test`, so calls show in the Actions panel and an interaction test can verify the handler ran.

#### Dev story

`__stories__/<name>.dev.stories.tsx`, optional, shares the main story's title (e.g. `Building blocks/Buttons/Button`) and sets `tags: ["development", "!autodocs", "!manifest"]` in its meta. `!autodocs` and `!manifest` keep its stories out of the consumer docs and out of what the MCP server serves. `development` hides them from the sidebar by default — select the tag in the sidebar's tag filter to show them — and marks them with a "Dev" badge. Storybook merges files with the same title into one entry, so a dev story's export name must differ from the main story's and carry its context, e.g. `CustomizationViaSlotPropsClassName` in `customization.dev.stories.tsx`.

The tag is `development` rather than `dev` because Storybook already uses `dev` as a built-in tag on every story.

A dev story serves any development, testing, or debugging need, so add them freely — e.g. reproduce a bug in a dev story and use it to confirm the fix, rather than reaching for the Dextinity demo or a consuming project.

#### Pattern pages

A pattern page is an MDX page in `src/docs/patterns/` with the title `Patterns/<Name>`, named in sentence case after the part of an application it covers. It explains when to use which component and how to combine them, and links to the docs pages of the components it uses. It states what to do, not why. Its examples are stories in `src/docs/patterns/__stories__/`, tagged `["!dev", "!autodocs", "!manifest"]`.

## Development

The package has two dev-pm scripts:

| Name                     | What it does                                                      |
| ------------------------ | ----------------------------------------------------------------- |
| `dextinity-ui`           | `vite build --watch` and `tsc --watch` — rebuild `lib/` on change |
| `storybook-dextinity-ui` | `storybook dev -p 26648 --no-open`                                |

The `@dextinity-ui` group starts `dextinity-ui`. Start `storybook-dextinity-ui` on its own, or with the `@storybook` group. The Storybook then runs at `http://localhost:26648`.

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
- **Dev-local tooling** — story-only helpers — a failure is loud and local. Exception: code whose regression is silent or reaches consumers, such as the class-name mapping in `src/cssModules/`.

Run from `packages/ui`: `pnpm run test:unit`, `pnpm run test:storybook`, and `pnpm run test:watch`.

## Theme

Components read their colors, metrics, and font family from CSS custom properties (`var(--dextinity-button-…)`, `var(--dextinity-color-…)`, `var(--dextinity-typography-…)`, `var(--dextinity-font-family-text)`) with **no fallback** — an unthemed component renders visibly unstyled rather than silently drifting to a default. There is no runtime JS theme object. How applications use and override the tokens is in [Foundations → Theme → Overview](src/docs/theme/Overview.mdx).

### Token layers

The tokens live in SCSS partials under [`src/theme/`](src/theme), composed into the `Theme` module with `@use` and wrapped in a single `@layer dextinity`. Each layer references only the layers before it:

1. **Brand** (`_brand.scss`, one file per brand in `brands/`) — hues and chromas (primary, secondary, neutral tint, success, danger), font families, display weight and tracking, control radius, and the radius factor. The brands `dextinity` and `ai-hub` are built in.
2. **Primitives** (`_primitives.scss`) — 11-stop OKLCH scales on a fixed lightness curve, computed from the brand's hue and chroma; spacing and radii.
3. **Semantic** (`_semantic.scss`) — surfaces, text, lines, accent, status, material (glass, blur, grain, light fields), and shadows, per color scheme (light, dark, high contrast). High contrast turns light and glass off and lines on.
4. **Typography, motion, density** (`_typography.scss`, `_motion.scss`, `_density.scss`) — text styles, one easing with three durations (reduced motion keeps only short fades), and fixed metrics per density level.
5. **Component tokens** (`_components.scss`) — includes the `tokens` mixin of each component's `<ComponentName>.tokens.scss` in the `scope.component-tokens` block. A token is defined in the folder of the component its name starts with, and other components can read it: `IconButton` uses the `--dextinity-button-…` colors from `Button.tokens.scss`.

Components use semantic, material, motion, density, and their own component tokens — never primitives. The prop-value types live in [`src/theme/types.ts`](src/theme/types.ts).

Every derived token is declared on each theme boundary (`[data-dextinity-color-scheme]`), so a nested `Theme` with another brand, color scheme, or density resolves all tokens against its own values.

### Brands

Each built-in brand is a complete file in [`src/theme/brands/`](src/theme/brands), setting every brand token. A brand is a CSS block on `[data-dextinity-brand="<name>"]` that sets the `--dextinity-brand-*` tokens — and, optionally, replaces icons — selected through `Theme`'s `brand` prop:

```css
[data-dextinity-brand="acme"] {
    --dextinity-brand-primary-hue: 18;
    --dextinity-brand-primary-chroma: 0.21;
    --dextinity-brand-font-family-text: "Source Sans 3", sans-serif;
    --dextinity-brand-radius-control: 999px;
}
```

### Selecting a color scheme, brand, and density

`Theme` selects the color scheme, brand, and density. It stays a pure function of its props — reading no `window`, `localStorage`, or `matchMedia` — so it renders the same on server and client; switching, OS-scheme resolution, and preventing the first-paint flash on SSR stay in consumer code.

## Icons

`Icon` shows an SVG file from [`svg/`](svg) as a CSS mask, filled with the current text color. [`icons.css`](icons.css) defines one variable per icon, `--dextinity-icon-<name>`, and projects override these variables in their own stylesheet, like the other tokens. An icon that keeps its own colors, such as a logo, uses `--dextinity-colored-icon-<name>` instead, and `Icon` shows it as a background image. `Icon` reads no React context, so it also renders in React Server Components.

`icons.css` ships as it is, outside the Vite build: Vite's library mode puts every file that a `url()` refers to into the CSS as a `data:` URL, so all icons would be in every application's CSS. The application's bundler resolves the URLs instead, and the browser loads only the icons that it shows. Each URL ends in `#icon`, because the application's Vite doesn't inline a file whose URL has a fragment either.

### Adding an icon

1. Prepare the SVG file. Its root element is `<svg xmlns="http://www.w3.org/2000/svg" id="icon" viewBox="0 0 16 16" fill="none">`; for any other size, ask for a 16×16 version instead of scaling it.
2. Save it as `svg/<name>.svg`, with the name in kebab case, for example `arrow-right.svg`.
3. Add the name to `defaultIconNames` in [`iconRegistry.ts`](src/components/icon/iconRegistry.ts), and its variable to `icons.css`: `--dextinity-colored-icon-<name>` when the icon keeps its own colors, `--dextinity-icon-<name>` otherwise. [`iconSet.test.ts`](src/components/icon/iconSet.test.ts) fails when the SVG files, the variables, and the names don't match.
