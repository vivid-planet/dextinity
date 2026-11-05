/**
 * For pages without an own title. Renders a <title>, which React hoists into the <head>.
 * Only one title may be rendered at a time, React doesn't deduplicate them.
 */
export function DefaultTitle() {
    return <title>Dextinity Demo Site</title>;
}
