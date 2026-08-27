# @dextinity/mail-react

Single-package solution for building HTML emails with React and MJML. Consumers install only `@dextinity/mail-react` (plus `react`) — never `@faire/mjml-react` directly.

The package:

- re-exports all `@faire/mjml-react` MJML components (with prop types renamed to drop the `I` prefix);
- extends some of them with extra props and features;
- adds new components and utilities — block factories (`BlocksBlock`, `ListBlock`, `OneOfBlock`, `OptionalBlock`) for rendering Dextinity CMS block data, and a `css()` tagged template literal for IDE syntax highlighting.

Some components also ship in an `Html` variant for use inside MJML ending tags. These variants are additive — separate components alongside the `Mjml` versions, with their own API.

## Internal development

We extend `@faire/mjml-react` rather than fork it. A few rules keep that working:

- **Additive only.** A custom component must work everywhere the base did. Only add props — never remove or rename them, and don't require new providers or context. For theme access, prefer `useOptionalTheme()` over `useTheme()`.
- **Wrap, don't reimplement.** Custom components delegate to `@faire/mjml-react`. Less to maintain, and we stay close to upstream behaviour.
- **One export per name.** When we ship a custom version, it replaces the re-export. Consumers should never need to import from `@faire/mjml-react` directly.
- **Public-facing documentation doesn't reference `@faire/mjml-react`.** TSDoc, story descriptions, and changeset entries describe behavior in terms of this package only. Internal places (code comments, commit messages) can mention upstream when it adds maintainer context.

### Styling

- **Inline first.** Components must render correctly without any `<style>` block — clients like Outlook ignore them.
- **Media queries** via `registerStyles` are progressive enhancement for mobile, where modern CSS (flex, grid) is fine. Use `theme.breakpoints.*.belowMediaQuery` (max-width queries) to target viewports below a breakpoint.
- **BEM, camelCase blocks.** Block `mjmlSection`, element `mjmlSection__item`, modifier `mjmlSection--indented`. Every component applies its block class and merges any consumer-provided `className` with `clsx`: `clsx("mjmlSection", className)`.

### Theme variants

Themed components expose their styling through the theme: a flat base entry and an optional, consumer-extensible variants map.

- **Base theme entry covers the unstyled use.** Components render from `theme.<component>` when no variant is picked. The `variant` prop is optional; the package ships no built-in variants.
- **Variants are declared by the consumer.** Variant names are added via TypeScript module augmentation against the variant-name type for that component. A `defaultVariant` on the theme entry makes one of them the implicit pick.
- **Responsive values appear only inside variants.** Base entries use plain types per property. Variant entries can declare a `ResponsiveValue<T>` — a `{ default, ...overrides }` shape with override keys drawn from `theme.breakpoints`.

### File layout

- **Location.** Custom components live in `src/components/<concern>/` (e.g. `src/components/section/MjmlSection.tsx`).
- **File order.** Imports → types/props → component → styles. `registerStyles` calls go below the component.
- **Module format.** ESM only (`type: module`). Use `.js` extensions in imports.
- **TSDoc.** Short — one line where possible — on exported components and props.
- **Prop defaults.** Add `@defaultValue` when the default isn't obvious from the type — runtime defaults, and theme-derived ones the consumer can't see in the shipped types.
- **Phrasing a default.** Name where the value comes from, not the value itself. One theme token: name it in backticks, as in "The theme's `colors.background.content`". Computed from several: name what it depends on, as in "The theme's `divider` height for the active variant".
- **Defaults on inherited props.** Redeclare the prop locally (`Omit` it from the base, re-add it with the same type) so the tag is on the prop itself. Never document the default in the component's TSDoc.

### Storybook

Every custom component has a story in `src/components/<concern>/__stories__/<Component>.stories.tsx`. Wrap non-section stories in `<MjmlSection indent>` to show a realistic indented layout.

Placeholder images use the `picsum.photos` seed URL pattern — `https://picsum.photos/seed/<seed>/<width>/<height>` — so the same seed renders the same image on every build.

### Changesets

When a custom component replaces a re-export, describe the change against the previous re-export — the added props, features, or behavior. Consumers don't need to know the internal component is new; they only see what's different in the API they use.

## Usage documentation

Two artifacts document how to _use_ this package, for two readers:

- **Docs** — [docs/docs/3-features-modules/13-building-html-emails/](../../docs/docs/3-features-modules/13-building-html-emails/) — for people building emails with the package.
- **Agent skill** — [skills/dextinity-mail-react/SKILL.md](../../skills/dextinity-mail-react/SKILL.md) — the same guidance for AI agents working in a project that uses this package.

Both teach the same things: what the package is for, how to build emails with it, the patterns to reach for, and the email-client pitfalls — markup that's fine in a browser can render wrong in clients like Outlook. They differ in one respect — an agent already has the package's types and TSDoc in its project, so the skill doesn't restate type signatures, prop lists, or defaults; those live in the types and TSDoc, and it spends its words on everything they can't convey on their own.

When a change affects how the package is used — components added/removed/renamed, changed behavior, new usage patterns, or styling conventions — update both in the same PR; consider a separate docs commit so reviewers can take them on their own.
