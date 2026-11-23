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

export interface TokenLookup {
    color: (value: string) => string | undefined;
    length: (value: string) => string | undefined;
}

/**
 * Finds the tokens whose values match an element's colors and lengths, resolved where the element is, so that the brand,
 * color scheme, and density around it apply.
 */
export function createTokenLookup(element: Element): TokenLookup {
    const frameDocument = element.ownerDocument;
    const frameWindow = frameDocument.defaultView;
    const colors = new Map<string, string>();
    const lengths = new Map<string, string>();
    const parent = element.parentElement;
    if (frameWindow && parent) {
        const probe = frameDocument.createElement("div");
        probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;inset:0 auto auto 0";
        parent.appendChild(probe);
        const style = frameWindow.getComputedStyle(probe);
        for (const name of getTokenNames(frameDocument)) {
            const shortName = name.slice(tokenPrefix.length);
            if (colorName.test(name)) {
                probe.style.color = `var(${name})`;
                const color = toRgba(style.color);
                if (color && !colors.has(rgbaKey(color))) {
                    colors.set(rgbaKey(color), shortName);
                }
                probe.style.color = "";
            } else if (lengthName.test(name)) {
                probe.style.width = `var(${name})`;
                const width = style.width;
                if (width !== "0px" && !lengths.has(width)) {
                    lengths.set(width, shortName);
                }
                probe.style.width = "";
            }
        }
        probe.remove();
    }
    return {
        color: (value) => {
            const color = toRgba(value);
            return color && color[3] > 0 ? colors.get(rgbaKey(color)) : undefined;
        },
        length: (value) => lengths.get(value),
    };
}
