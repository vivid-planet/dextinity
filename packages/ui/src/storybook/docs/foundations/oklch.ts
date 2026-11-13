/** A color in OKLCH: lightness 0–1, chroma from 0 (gray) upward, hue in degrees. */
export type Oklch = {
    lightness: number;
    chroma: number;
    hue: number;
};

/** Red, green, and blue, each 0–1. */
export type Rgb = [number, number, number];

/** How far a channel may leave 0–1 and still count as inside sRGB, to absorb rounding in the matrices. */
const gamutTolerance = 0.00001;

function clampUnit(value: number) {
    return Math.min(1, Math.max(0, value));
}

/** Decodes a gamma-encoded sRGB channel to linear light. */
export function srgbToLinear(value: number) {
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number) {
    return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
}

/**
 * Converts OKLCH to linear-light sRGB. Channels outside 0–1 are kept, they mark a color outside sRGB.
 */
export function oklchToLinearSrgb({ lightness, chroma, hue }: Oklch): Rgb {
    const hueRadians = (hue * Math.PI) / 180;
    const a = chroma * Math.cos(hueRadians);
    const b = chroma * Math.sin(hueRadians);
    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
}

/**
 * Whether sRGB can show the color. Outside it, a browser on an sRGB screen shows the nearest color it can.
 */
export function isInSrgbGamut(color: Oklch): boolean {
    return oklchToLinearSrgb(color).every((channel) => channel >= -gamutTolerance && channel <= 1 + gamutTolerance);
}

/**
 * Whether Display P3, the wider color space of most current screens, can show the color.
 */
export function isInDisplayP3Gamut(color: Oklch): boolean {
    const [red, green, blue] = oklchToLinearSrgb(color);
    return [0.8224621 * red + 0.177538 * green, 0.0331941 * red + 0.9668058 * green, 0.0170827 * red + 0.0723974 * green + 0.9105199 * blue].every(
        (channel) => channel >= -gamutTolerance && channel <= 1 + gamutTolerance,
    );
}

/**
 * Converts OKLCH to gamma-encoded sRGB, as in a hex value. A color outside sRGB is clipped per channel.
 */
export function oklchToSrgb(color: Oklch): Rgb {
    return oklchToLinearSrgb(color).map((channel) => clampUnit(linearToSrgb(clampUnit(channel)))) as Rgb;
}

/**
 * The highest chroma sRGB can show at the given lightness and hue.
 */
export function maxSrgbChroma(lightness: number, hue: number): number {
    let low = 0;
    let high = 0.4;
    for (let iteration = 0; iteration < 24; iteration++) {
        const middle = (low + high) / 2;
        if (isInSrgbGamut({ lightness, chroma: middle, hue })) {
            low = middle;
        } else {
            high = middle;
        }
    }
    return low;
}

/**
 * The OKLCH lightness of a gamma-encoded sRGB color: how light it looks.
 */
export function srgbToOklchLightness(rgb: Rgb): number {
    const [red, green, blue] = rgb.map(srgbToLinear);
    const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
    const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
    const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
    return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
}

/**
 * Converts HSL (hue in degrees, saturation and lightness in percent) to gamma-encoded sRGB.
 */
export function hslToSrgb(hue: number, saturation: number, lightness: number): Rgb {
    const s = saturation / 100;
    const l = lightness / 100;
    const amount = s * Math.min(l, 1 - l);
    const channel = (offset: number) => {
        const k = (offset + hue / 30) % 12;
        return l - amount * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [channel(0), channel(8), channel(4)];
}

/** Formats gamma-encoded sRGB as `#RRGGBB`. */
export function toHex(rgb: Rgb): string {
    return `#${rgb
        .map((channel) =>
            Math.round(channel * 255)
                .toString(16)
                .padStart(2, "0"),
        )
        .join("")
        .toUpperCase()}`;
}

/**
 * The WCAG relative luminance of linear-light sRGB.
 */
export function relativeLuminance([red, green, blue]: Rgb): number {
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * The WCAG 2 contrast ratio between two relative luminances, from 1 : 1 to 21 : 1.
 */
export function luminanceContrast(first: number, second: number): number {
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/**
 * The WCAG 2 contrast ratio between two gamma-encoded sRGB colors.
 */
export function srgbContrast(first: Rgb, second: Rgb): number {
    return luminanceContrast(relativeLuminance(first.map(srgbToLinear) as Rgb), relativeLuminance(second.map(srgbToLinear) as Rgb));
}

const oklchPattern = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.-]+|none)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/;

/**
 * Reads a computed `oklch()` color with its alpha (0–1). Returns `null` for anything else.
 */
export function parseOklch(value: string): (Oklch & { alpha: number }) | null {
    const match = value.trim().match(oklchPattern);
    if (!match) {
        return null;
    }
    return {
        lightness: Number(match[1]) / (match[2] ? 100 : 1),
        chroma: Number(match[3]),
        hue: match[4] === "none" ? 0 : Number(match[4]),
        alpha: match[5] === undefined ? 1 : Number(match[5]) / (match[6] ? 100 : 1),
    };
}

/** Formats a color as CSS `oklch()`, rounded for reading. */
export function formatOklch({ lightness, chroma, hue }: Oklch): string {
    return `oklch(${lightness.toFixed(2)} ${chroma.toFixed(3)} ${Math.round(hue)})`;
}
