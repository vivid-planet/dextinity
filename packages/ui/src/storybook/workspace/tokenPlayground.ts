import { createStoredList } from "./workspaceNotes";

/** A brand token the designer sets for all prototype frames, in place of the theme's value. */
export interface TokenOverride {
    name: string;
    value: number;
}

export const tokenOverrideList = createStoredList<TokenOverride>("dextinity-ui-workspace-token-overrides");

/**
 * The brand tokens offered to change. Every other token derives from these, so a change shows throughout the page, e.g. the accent
 * hue in buttons, links, selection, and focus.
 */
export const playgroundTokens = [
    { name: "--dextinity-brand-primary-hue", label: "Accent hue", min: 0, max: 360, step: 1, initial: 275, unit: "" },
    { name: "--dextinity-brand-primary-chroma", label: "Accent strength", min: 0, max: 0.32, step: 0.005, initial: 0.255, unit: "" },
    { name: "--dextinity-brand-secondary-hue", label: "Gradient hue", min: 0, max: 360, step: 1, initial: 185, unit: "" },
    { name: "--dextinity-brand-neutral-hue", label: "Neutral hue", min: 0, max: 360, step: 1, initial: 285, unit: "" },
    { name: "--dextinity-brand-neutral-chroma", label: "Neutral tint", min: 0, max: 0.05, step: 0.001, initial: 0.014, unit: "" },
    { name: "--dextinity-brand-font-size", label: "Text size", min: 12, max: 18, step: 0.5, initial: 14, unit: "px" },
    { name: "--dextinity-brand-radius-control", label: "Control radius", min: 0, max: 24, step: 1, initial: 8, unit: "px" },
    { name: "--dextinity-brand-radius-factor", label: "Other radii", min: 0, max: 2, step: 0.05, initial: 1, unit: "×" },
    { name: "--dextinity-brand-display-font-weight", label: "Title weight", min: 300, max: 800, step: 50, initial: 500, unit: "" },
] as const;

function formatValue(name: string, value: number) {
    const token = playgroundTokens.find((candidate) => candidate.name === name);
    return token?.unit === "px" ? `${value}px` : String(value);
}

/** The overrides as a stylesheet, unlayered so that it wins over the theme's layer; also what the designer copies. */
export function getOverrideCss(overrides: TokenOverride[]) {
    if (overrides.length === 0) {
        return "";
    }
    const declarations = overrides.map(({ name, value }) => `    ${name}: ${formatValue(name, value)};`).join("\n");
    return `:root,\n[data-dextinity-brand] {\n${declarations}\n}`;
}
