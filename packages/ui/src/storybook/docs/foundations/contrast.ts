/** A color as linear-light sRGB channels (0–1) plus alpha. */
export type LinearColor = {
    channels: [number, number, number];
    alpha: number;
};

function clampUnit(value: number) {
    return Math.min(1, Math.max(0, value));
}

function srgbToLinear(value: number) {
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function oklchToLinear(lightness: number, chroma: number, hue: number): [number, number, number] {
    const hueRadians = (hue * Math.PI) / 180;
    const a = chroma * Math.cos(hueRadians);
    const b = chroma * Math.sin(hueRadians);
    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        clampUnit(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        clampUnit(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        clampUnit(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ];
}

function parseAlpha(value: string | undefined, percent: string | undefined) {
    if (value === undefined) {
        return 1;
    }
    return Number(value) / (percent ? 100 : 1);
}

const oklchPattern = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.-]+|none)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/;
const rgbPattern = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+)(%?))?\s*\)$/;
const srgbPattern = /^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)$/;

/**
 * Parses a computed CSS color (`oklch()`, `rgb()`/`rgba()`, or `color(srgb …)`, as browsers serialize them). Returns `null` for anything else.
 */
export function parseColor(value: string): LinearColor | null {
    const color = value.trim();

    const oklch = color.match(oklchPattern);
    if (oklch) {
        const lightness = Number(oklch[1]) / (oklch[2] ? 100 : 1);
        const hue = oklch[4] === "none" ? 0 : Number(oklch[4]);
        return { channels: oklchToLinear(lightness, Number(oklch[3]), hue), alpha: parseAlpha(oklch[5], oklch[6]) };
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
export function composite(top: LinearColor, base: LinearColor): LinearColor {
    return {
        channels: top.channels.map((channel, index) => channel * top.alpha + base.channels[index] * (1 - top.alpha)) as [number, number, number],
        alpha: 1,
    };
}

function relativeLuminance({ channels }: LinearColor) {
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * The WCAG 2 contrast ratio of a foreground over a background. A translucent background is first laid over `backdrop`, a
 * translucent foreground over the resulting background.
 */
export function contrastRatio(foreground: LinearColor, background: LinearColor, backdrop: LinearColor): number {
    const opaqueBackground = background.alpha < 1 ? composite(background, backdrop) : background;
    const opaqueForeground = foreground.alpha < 1 ? composite(foreground, opaqueBackground) : foreground;
    const lighter = Math.max(relativeLuminance(opaqueForeground), relativeLuminance(opaqueBackground));
    const darker = Math.min(relativeLuminance(opaqueForeground), relativeLuminance(opaqueBackground));
    return (lighter + 0.05) / (darker + 0.05);
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
