import { luminanceContrast, oklchToLinearSrgb, parseOklch, relativeLuminance, srgbToLinear } from "./oklch";

/** A color as linear-light sRGB channels (0–1) plus alpha. */
export type LinearColor = {
    channels: [number, number, number];
    alpha: number;
};

function clampUnit(value: number) {
    return Math.min(1, Math.max(0, value));
}

function parseAlpha(value: string | undefined, percent: string | undefined) {
    if (value === undefined) {
        return 1;
    }
    return Number(value) / (percent ? 100 : 1);
}

const rgbPattern = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+)(%?))?\s*\)$/;
const srgbPattern = /^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)$/;

/**
 * Parses a computed CSS color (`oklch()`, `rgb()`/`rgba()`, or `color(srgb …)`, as browsers serialize them). Returns `null` for anything else.
 */
export function parseColor(value: string): LinearColor | null {
    const color = value.trim();

    const oklch = parseOklch(color);
    if (oklch) {
        return { channels: oklchToLinearSrgb(oklch).map(clampUnit) as [number, number, number], alpha: oklch.alpha };
    }

    const rgb = color.match(rgbPattern);
    if (rgb) {
        return {
            channels: [rgb[1], rgb[2], rgb[3]].map((channel) => srgbToLinear(clampUnit(Number(channel) / 255))) as [number, number, number],
            alpha: parseAlpha(rgb[4], rgb[5]),
        };
    }

    const srgb = color.match(srgbPattern);
    if (srgb) {
        return {
            channels: [srgb[1], srgb[2], srgb[3]].map((channel) => srgbToLinear(clampUnit(Number(channel)))) as [number, number, number],
            alpha: parseAlpha(srgb[4], srgb[5]),
        };
    }

    return null;
}

/**
 * Blends a translucent color over an opaque one, in linear light.
 */
function composite(top: LinearColor, base: LinearColor): LinearColor {
    return {
        channels: top.channels.map((channel, index) => channel * top.alpha + base.channels[index] * (1 - top.alpha)) as [number, number, number],
        alpha: 1,
    };
}

/**
 * The WCAG 2 contrast ratio of a foreground over a background. A translucent background is first laid over `backdrop`, a
 * translucent foreground over the resulting background.
 */
export function contrastRatio(foreground: LinearColor, background: LinearColor, backdrop: LinearColor): number {
    const opaqueBackground = background.alpha < 1 ? composite(background, backdrop) : background;
    const opaqueForeground = foreground.alpha < 1 ? composite(foreground, opaqueBackground) : foreground;
    return luminanceContrast(relativeLuminance(opaqueForeground.channels), relativeLuminance(opaqueBackground.channels));
}

export type ContrastGrade = "AAA" | "AA" | "AA large" | "fail";

/**
 * Grades a contrast ratio: 7 : 1 for AAA, 4.5 : 1 for body text (AA), 3 : 1 for large text and icons.
 */
export function contrastGrade(ratio: number): ContrastGrade {
    if (ratio >= 7) {
        return "AAA";
    }
    if (ratio >= 4.5) {
        return "AA";
    }
    if (ratio >= 3) {
        return "AA large";
    }
    return "fail";
}
