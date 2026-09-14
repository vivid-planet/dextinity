---
name: dextinity-core-admin-component-authoring
description: Authoring or changing a component in @dextinity/admin or a sibling package that uses its slot and theme machinery (admin-color-picker, admin-date-time, admin-rte) so it supports MUI-style customization: per-instance sx/className overrides, theme styleOverrides, and defaultProps. Use whenever adding a new component or editing an existing one's slots, props, class keys, overridable icons, or theme-type registration — even for small changes.
metadata:
    internal: true
---

# Authoring customizable @dextinity/admin components

Every component shipped from `@dextinity/admin` and its sibling packages must be
customizable the same way MUI components are: consumers can override a single
instance (`sx`/`className`), restyle every instance through the theme
(`styleOverrides`), and set default props through the theme (`defaultProps`). This
only works if the component is built with the slot/theme machinery. A component
that hardcodes its markup and styling looks fine in isolation but silently breaks all
three customization paths, and the gap is only found later, once someone tries to
customize it. Add the customization from the start.

This applies to any component built with the slot and theme machinery —
`createComponentSlot` and `ThemedComponentBaseProps`, both from `@dextinity/admin`. Today
that means components in `@dextinity/admin` and the sibling packages that use it:
`admin-color-picker`, `admin-date-time`, `admin-rte`. Other packages under
`packages/admin/`, such as `cms-admin`, don't use this pattern and are out of scope.

## How to use this skill

Read the reference doc for how to build the component, then use the checklist below as a
verification pass over what you wrote — it is the list of things that are easy to miss
and that otherwise get caught only in review. The reference doc is the single source for the
conventions and their worked code examples:

`docs/docs/8-dextinity-core-development/1-creating-customizable-admin-components.md`

Every item below points at a section of that doc. When an item here and the doc disagree,
follow the doc — and tell the user so this checklist can be corrected.

## When not to use this skill

If you are building admin UI in a **project that consumes** `@dextinity/admin` (pages,
dashboards, dialogs, composing existing components), use the **`dextinity-admin-ui`** skill
instead — that is a different job with different rules. This skill is only for authoring
the library's own components.

## Verification checklist

Each item names a rule and why it matters; the doc has the exact syntax for each.

1. **`index.ts` exports the component, its props type (`<Name>Props`), and its class-key
   type (`<Name>ClassKey`).** Consumers need the props and class-key types to type their
   theme overrides.

2. **The `ClassKey` type lists every visual slot and every modifier/variant state, with
   `root` as the outermost slot.** These become the stable, prefixed class names consumers
   target, so they belong in the public type.

3. **Each slot is built with `createComponentSlot`**, passing the base element/component,
   the `componentName`, and the `slotName`. This is what connects the slot to
   `styleOverrides` and produces the deterministic class name.

4. **The props type extends `ThemedComponentBaseProps`**, with a generic mapping each slot
   name to its base element/component. This is what gives consumers `slotProps` and the
   root `sx`/`className`. Each key's value type must be the same element or component
   passed to `createComponentSlot` for that slot — the two are declared separately, so a
   mismatch types that slot's `slotProps` against the wrong component.

5. **Props are read through `useThemeProps`, never the raw `inProps`, with the name
   prefixed `DextinityAdmin`.** This merges the theme's `defaultProps` with the passed props —
   skip it and `defaultProps` customization is dead.

6. **`slotProps?.<slot>` is spread into each slot, and `restProps` (carrying `sx` and
   `className`) into the `root` slot — after the slot's hardcoded props.** Spreading after
   is what lets consumers override; the exception is props that must never be overridden,
   which go last. This ordering is easy to get wrong.

7. **Style-affecting values are passed through `ownerState`** to the slots that need them,
   rather than writing conditional styling into the markup.

8. **Conditional modifier class names come from `classesResolver(ownerState)`**, returning
   the relevant class keys. This lets consumers target a state from outside the component.

9. **Icons are overridable via an `iconMapping` prop** — an object whose keys say what each
   icon is for. Destructure with an `Icon` suffix and a default, so the component works
   with no mapping but every icon can be replaced.

10. **The component is registered in MUI's theme types** — the `DextinityAdmin<Name>` key added
    to `ComponentsPropsList`, `ComponentNameToClassKey`, and `Components` (with
    `defaultProps?: Partial<...>` and `styleOverrides`). Without this, consumers get no type
    safety on their overrides.

Two final checks that catch the most frequent review findings: the `DextinityAdmin<Name>` name
is identical in `useThemeProps` and in all three theme-type interfaces, and the package
type-checks (`tsc`) — the theme-type augmentation is the usual failure point.
