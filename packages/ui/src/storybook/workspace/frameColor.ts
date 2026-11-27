export type Rgba = [red: number, green: number, blue: number, alpha: number];

let context: CanvasRenderingContext2D | null = null;

/** Any CSS color the browser knows, e.g. `oklch()` or `color-mix()`, as sRGB channels from 0 to 255 and alpha from 0 to 1. */
export function toRgba(color: string): Rgba | null {
    context ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!context || color === "" || color === "transparent") {
        return color === "transparent" ? [0, 0, 0, 0] : null;
    }
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "#000";
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    return [red, green, blue, alpha / 255];
}

export function rgbaKey([red, green, blue, alpha]: Rgba) {
    return `${red},${green},${blue},${Math.round(alpha * 100)}`;
}

/** `top` over `bottom`, which is opaque. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
    const alpha = top[3];
    return [0, 1, 2].map((channel) => Math.round(top[channel] * alpha + bottom[channel] * (1 - alpha))).concat(1) as Rgba;
}

function luminance([red, green, blue]: Rgba) {
    const [r, g, b] = [red, green, blue].map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio of two opaque colors, from 1 to 21. */
export function contrastRatio(first: Rgba, second: Rgba) {
    const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The opaque color behind an element's text, from its own and its ancestors' backgrounds. `null` when an image or gradient is
 * behind it, where a single color can't tell the contrast.
 */
export function getBackgroundBehind(element: Element): Rgba | null {
    const layers: Rgba[] = [];
    let current: Element | null = element;
    while (current) {
        const style = current.ownerDocument.defaultView?.getComputedStyle(current);
        if (!style) {
            return null;
        }
        if (style.backgroundImage !== "none") {
            return null;
        }
        const color = toRgba(style.backgroundColor);
        if (color && color[3] > 0) {
            layers.push(color);
            if (color[3] >= 1) {
                break;
            }
        }
        current = current.parentElement;
    }
    return layers.reduceRight<Rgba>((below, layer) => composite(layer, below), [255, 255, 255, 1]);
}
