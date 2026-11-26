import { useEffect } from "react";

import { createToolbarSetting } from "./toolbarSetting";

export type TextLength = "normal" | "longer" | "longest";

/**
 * How long the texts of a prototype are: as written, or longer as translations often are, e.g. German, to check that labels,
 * buttons, and navigation still fit.
 */
export const textLengthSetting = createToolbarSetting<TextLength>({
    storageKey: "dextinity-ui-workspace-text-length",
    titles: { normal: "Texts as written", longer: "Texts 40 % longer", longest: "Texts twice as long" },
    defaultValue: "normal",
});

const growth: Record<TextLength, number> = { normal: 0, longer: 0.4, longest: 1 };
const loremIpsum =
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(
        " ",
    );

// Placeholder words rather than repeated characters, so the lengthened text wraps and breaks like a real translation
function lengthen(text: string, factor: number) {
    const trimmed = text.trim();
    if (trimmed.length < 2 || !/[A-Za-z]/.test(trimmed)) {
        return text;
    }
    const added = Math.ceil(trimmed.length * factor);
    let filler = loremIpsum[0];
    for (let index = 1; filler.length + 1 < added; index++) {
        filler += ` ${loremIpsum[index % loremIpsum.length]}`;
    }
    return `${text.trimEnd()} ${filler}${text.endsWith(" ") ? " " : ""}`;
}

type LengthenedTexts = WeakMap<Text, { original: string; lengthened: string }>;

// The texts as written, of the texts shown lengthened, for the tools that work with the written text, e.g. editing a text. Kept on
// the window of the document, since the workspace's tools run in another window, with their own copy of this module.
function getLengthenedTexts(view: Window | null): LengthenedTexts {
    const holder = (view ?? window) as Window & { dextinityLengthenedTexts?: LengthenedTexts };
    holder.dextinityLengthenedTexts ??= new WeakMap();
    return holder.dextinityLengthenedTexts;
}

/** An element's own text as written, also while it's shown lengthened. */
export function readWrittenText(element: Element) {
    const lengthenedTexts = getLengthenedTexts(element.ownerDocument.defaultView);
    return Array.from(element.childNodes)
        .filter((node): node is Text => node.nodeType === Node.TEXT_NODE)
        .map((node) => {
            const known = lengthenedTexts.get(node);
            return known && known.lengthened === node.nodeValue ? known.original : (node.nodeValue ?? "");
        })
        .join("");
}

function isSkipped(node: Text) {
    return node.parentElement?.closest("script, style, [contenteditable], code") != null;
}

/** Lengthens every text of the document while the setting asks for it, also the ones rendered later, and restores them after. */
export function useTextLength() {
    const textLength = textLengthSetting.useValue();
    useEffect(() => {
        const factor = growth[textLength];
        if (factor === 0) {
            return;
        }
        const lengthenedTexts = getLengthenedTexts(window);
        const lengthenedHere = new Set<Text>();
        const lengthenNode = (node: Text) => {
            const known = lengthenedTexts.get(node);
            if (known?.lengthened === node.nodeValue || isSkipped(node)) {
                return;
            }
            // A text the page rendered anew, or changed in place, is its new original
            const original = node.nodeValue ?? "";
            const lengthened = lengthen(original, factor);
            lengthenedTexts.set(node, { original, lengthened });
            lengthenedHere.add(node);
            node.nodeValue = lengthened;
        };
        const apply = (root: Node) => {
            // A text changed in place is the root of its own change, which a walker from it would skip
            if (root.nodeType === Node.TEXT_NODE) {
                lengthenNode(root as Text);
                return;
            }
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
                lengthenNode(node);
            }
        };
        apply(document.body);
        const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => apply(mutation.target)));
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
        return () => {
            observer.disconnect();
            lengthenedHere.forEach((node) => {
                const known = lengthenedTexts.get(node);
                if (known && node.nodeValue === known.lengthened) {
                    node.nodeValue = known.original;
                }
                lengthenedTexts.delete(node);
            });
        };
    }, [textLength]);
}
