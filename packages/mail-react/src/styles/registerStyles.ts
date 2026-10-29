import type { IMjmlStyleProps } from "@faire/mjml-react";

import type { Theme } from "../theme/themeTypes.js";
import type { css } from "../utils/css.js";

export type StylesPayload = ReturnType<typeof css> | ((theme: Theme) => ReturnType<typeof css>);
type MjmlStyleOptions = Partial<Omit<IMjmlStyleProps, "children">>;

interface StyleRegistryEntry {
    styles: StylesPayload;
    mjmlStyleProps?: MjmlStyleOptions;
}

const registry = new Map<StylesPayload, StyleRegistryEntry>();

/**
 * Registers CSS styles that will be rendered in the email head as `<mj-style>` elements.
 *
 * Styles can be static CSS strings (via the `css` tagged template) or functions that
 * receive the theme and return a CSS string.
 */
export function registerStyles(styles: StylesPayload, mjmlStyleProps?: MjmlStyleOptions): void {
    registry.set(styles, { styles, mjmlStyleProps });
}

/** Returns all registered style entries. */
export function getRegisteredStyles(): ReadonlyMap<StylesPayload, StyleRegistryEntry> {
    return registry;
}
