/**
 * Marks where the `children` arg goes in a `render` body: the children of each self-closing element that spreads `args`.
 */
export const childrenPlaceholder = "{argsChildrenPlaceholder}";

/**
 * Marks a JSX `{...args}` with the args that later attributes set, which the shown code leaves out.
 */
export function argsSpreadMarker(overriddenArgNames: string[]) {
    return `{...args /* without: ${overriddenArgNames.join(" ")} */}`;
}

/**
 * Matches an `argsSpreadMarker`. The first group holds the names of the args that it leaves out.
 */
export const argsSpreadMarkerPattern = /\s*\{\.\.\.args \/\* without:([^*]*)\*\/\}/g;
