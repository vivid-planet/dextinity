import type { ThemeBrand } from "../../theme/types";
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

type PlaygroundToken = (typeof playgroundTokens)[number];

// The values `_brand.scss` sets for a brand apart from the ones of `dextinity`, which are the tokens' `initial`
const brandInitials: Record<ThemeBrand, Partial<Record<PlaygroundToken["name"], number>>> = {
    dextinity: {},
    "ai-hub": {
        "--dextinity-brand-primary-hue": 288,
        "--dextinity-brand-primary-chroma": 0.2,
        "--dextinity-brand-secondary-hue": 40,
    },
    comet: {
        "--dextinity-brand-primary-hue": 235,
        "--dextinity-brand-primary-chroma": 0.145,
        "--dextinity-brand-secondary-hue": 235,
        "--dextinity-brand-neutral-hue": 0,
        "--dextinity-brand-neutral-chroma": 0,
        "--dextinity-brand-font-size": 16,
        "--dextinity-brand-radius-control": 4,
        "--dextinity-brand-radius-factor": 0.3,
        "--dextinity-brand-display-font-weight": 200,
    },
    "groupcms-ai": {
        "--dextinity-brand-primary-hue": 197,
        "--dextinity-brand-primary-chroma": 0.11,
        "--dextinity-brand-secondary-hue": 190,
        "--dextinity-brand-neutral-hue": 258,
        "--dextinity-brand-neutral-chroma": 0.018,
    },
    "vivid-planet": {
        "--dextinity-brand-primary-hue": 235,
        "--dextinity-brand-primary-chroma": 0.15,
        "--dextinity-brand-secondary-hue": 200,
        "--dextinity-brand-neutral-hue": 258,
        "--dextinity-brand-neutral-chroma": 0.015,
        "--dextinity-brand-radius-control": 10,
        "--dextinity-brand-radius-factor": 1.15,
        "--dextinity-brand-display-font-weight": 700,
    },
};

/** The token's value in the brand, which the slider shows as long as the designer hasn't set one. */
export function getInitialValue(token: PlaygroundToken, brand: ThemeBrand) {
    return brandInitials[brand][token.name] ?? token.initial;
}

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
