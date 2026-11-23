import { rgbaKey, toRgba } from "./frameColor";

const tokenPrefix = "--dextinity-";
const tokenNamesByDocument = new WeakMap<Document, string[]>();

function collectNames(rules: CSSRuleList, names: Set<string>) {
    for (const rule of Array.from(rules)) {
        const style = (rule as CSSStyleRule).style as CSSStyleDeclaration | undefined;
        if (style) {
            for (const property of Array.from(style)) {
                if (property.startsWith(tokenPrefix)) {
                    names.add(property);
                }
            }
        }
        const childRules = (rule as CSSGroupingRule).cssRules as CSSRuleList | undefined;
        if (childRules) {
            collectNames(childRules, names);
        }
    }
}

/** The theme's custom properties that the frame's stylesheets define. */
function getTokenNames(frameDocument: Document) {
    let names = tokenNamesByDocument.get(frameDocument);
    if (!names) {
        const found = new Set<string>();
        for (const sheet of Array.from(frameDocument.styleSheets)) {
            try {
                collectNames(sheet.cssRules, found);
            } catch {
                // A stylesheet of another origin doesn't share its rules
            }
        }
        names = [...found];
        tokenNamesByDocument.set(frameDocument, names);
    }
    return names;
}

const colorName = /color/;
const lengthName = /space|spacing|gap|padding|margin|radius|size|width|height|inset|offset/;

/** Finds the token for a value; `prefer` picks among tokens of the same value, e.g. a spacing token for a padding. */
export interface TokenLookup {
    color: (value: string, prefer?: RegExp) => string | undefined;
    length: (value: string, prefer?: RegExp) => string | undefined;
}

function addName(map: Map<string, string[]>, key: string, name: string) {
    map.set(key, [...(map.get(key) ?? []), name]);
}

function pick(names: string[] | undefined, prefer?: RegExp) {
    return (prefer && names?.find((name) => prefer.test(name))) ?? names?.[0];
}

/**
 * Finds the tokens whose values match an element's colors and lengths, resolved where the element is, so that the brand,
 * color scheme, and density around it apply. A token that isn't defined there is left out.
 */
export function createTokenLookup(element: Element): TokenLookup {
    const frameDocument = element.ownerDocument;
    const frameWindow = frameDocument.defaultView;
    const colors = new Map<string, string[]>();
    const lengths = new Map<string, string[]>();
    const parent = element.parentElement;
    if (frameWindow && parent) {
        const probe = frameDocument.createElement("div");
        probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;inset:0 auto auto 0";
        parent.appendChild(probe);
        const style = frameWindow.getComputedStyle(probe);
        for (const name of getTokenNames(frameDocument)) {
            if (style.getPropertyValue(name).trim() === "") {
                continue;
            }
            const shortName = name.slice(tokenPrefix.length);
            if (colorName.test(name)) {
                probe.style.color = `var(${name})`;
                const color = toRgba(style.color);
                if (color) {
                    addName(colors, rgbaKey(color), shortName);
                }
                probe.style.color = "";
            } else if (lengthName.test(name)) {
                probe.style.width = `var(${name})`;
                if (style.width !== "0px") {
                    addName(lengths, style.width, shortName);
                }
                probe.style.width = "";
            }
        }
        probe.remove();
    }
    return {
        color: (value, prefer) => {
            const color = toRgba(value);
            return color && color[3] > 0 ? pick(colors.get(rgbaKey(color)), prefer) : undefined;
        },
        length: (value, prefer) => pick(lengths.get(value), prefer),
    };
}
