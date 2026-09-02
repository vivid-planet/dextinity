import type { CSSProperties } from "react";

import { showOnlyInOutlook } from "../../utils/outlookConditionalComment.js";

interface GenerateOutlookImageVmlOptions {
    src: string;
    width: string | number | undefined;
    height: string | number | undefined;
    borderRadius: CSSProperties["borderRadius"];
    alt?: string | null;
    href?: string | null;
}

type OutlookVmlShape = { name: "v:roundrect"; radius: number } | { name: "v:oval" };

/**
 * Builds the VML shape that rounds an image in classic Outlook, where CSS `border-radius` has no effect.
 *
 * Returns `null` when the radius or the dimensions cannot be turned into a VML shape. The caller then
 * renders the plain image, which classic Outlook shows with square corners.
 */
export function generateOutlookImageVml({ src, width, height, borderRadius, alt, href }: GenerateOutlookImageVmlOptions): string | null {
    const shape = resolveShape(borderRadius);
    const widthInPixels = parsePixelLength(width);
    const heightInPixels = parsePixelLength(height);

    if (shape === null || widthInPixels === null || heightInPixels === null) {
        return null;
    }

    const attributes = formatAttributes({
        "xmlns:v": "urn:schemas-microsoft-com:vml",
        arcsize: shape.name === "v:roundrect" ? calculateArcsize(shape.radius, widthInPixels, heightInPixels) : undefined,
        stroked: "f",
        style: `width:${widthInPixels}px;height:${heightInPixels}px;`,
        href,
        alt,
    });

    return `<${shape.name} ${attributes}><v:fill type="frame" src="${escapeAttributeValue(src)}" /></${shape.name}>`;
}

function resolveShape(borderRadius: CSSProperties["borderRadius"]): OutlookVmlShape | null {
    if (borderRadius === "50%") {
        return { name: "v:oval" };
    }

    const radius = parsePixelLength(borderRadius);

    return radius === null ? null : { name: "v:roundrect", radius };
}

/** Accepts `12` or `"12px"`. Returns `null` for values without a positive pixel length: `"100%"`, `"auto"`, `"1em"`, `0`. */
function parsePixelLength(value: string | number | undefined): number | null {
    let pixels: number | null = null;

    if (typeof value === "number") {
        pixels = value;
    } else if (typeof value === "string") {
        const match = /^(\d+(?:\.\d+)?)(?:px)?$/.exec(value.trim());

        pixels = match === null ? null : Number(match[1]);
    }

    return pixels !== null && Number.isFinite(pixels) && pixels > 0 ? pixels : null;
}

/**
 * Classic Outlook measures `arcsize` against the whole shorter side and draws no more than half of
 * it, although ECMA-376 Part 4 says half the shorter side.
 */
function calculateArcsize(radius: number, width: number, height: number): string {
    const fraction = Math.min(radius / Math.min(width, height), 0.5);

    return `${Math.round(fraction * 100)}%`;
}

interface GenerateOutlookImageVmlRowOptions {
    outlookImageVml: string;
    align?: "left" | "center" | "right";
    padding?: string | number;
    paddingTop?: string | number;
    paddingRight?: string | number;
    paddingBottom?: string | number;
    paddingLeft?: string | number;
}

/**
 * Puts the VML into the row and cell that `mj-image` renders for the other clients, so the column
 * table has the same structure in classic Outlook.
 */
export function generateOutlookImageVmlRow({ outlookImageVml, align = "center", ...padding }: GenerateOutlookImageVmlRowOptions): string {
    const attributes = formatAttributes({ align, style: generateCellStyle(padding) });

    return showOnlyInOutlook(`<tr><td ${attributes}>${outlookImageVml}</td></tr>`);
}

/** `MjmlMailRoot` starts every component at zero padding, so an image without a padding prop needs none here either. */
function generateCellStyle(padding: Omit<GenerateOutlookImageVmlRowOptions, "outlookImageVml" | "align">): string {
    const paddingDeclarations = joinDefinedEntries(
        {
            padding: formatPixels(padding.padding),
            "padding-top": formatPixels(padding.paddingTop),
            "padding-right": formatPixels(padding.paddingRight),
            "padding-bottom": formatPixels(padding.paddingBottom),
            "padding-left": formatPixels(padding.paddingLeft),
        },
        (property, value) => `${property}:${value}`,
        ";",
    );

    return `${paddingDeclarations === "" ? "padding:0" : paddingDeclarations};font-size:0`;
}

function formatPixels(value: string | number | undefined): string | undefined {
    return typeof value === "number" ? `${value}px` : value;
}

function formatAttributes(attributes: Record<string, string | null | undefined>): string {
    return joinDefinedEntries(attributes, (name, value) => `${name}="${escapeAttributeValue(value)}"`, " ");
}

function joinDefinedEntries(
    entries: Record<string, string | null | undefined>,
    format: (name: string, value: string) => string,
    separator: string,
): string {
    const formatted: string[] = [];

    for (const [name, value] of Object.entries(entries)) {
        if (value !== undefined && value !== null) {
            formatted.push(format(name, value));
        }
    }

    return formatted.join(separator);
}

/** This markup is a string, not JSX, so a quote in a value would end its attribute early. */
function escapeAttributeValue(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
