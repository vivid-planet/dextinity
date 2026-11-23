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
const accented: Record<string, string> = { a: "á", e: "é", i: "í", o: "ö", u: "ü", A: "Á", E: "É", O: "Ö", U: "Ü", n: "ñ", c: "ç", s: "š" };

// Accented letters show at a glance that a text was lengthened, the dots how much was added
function lengthen(text: string, factor: number) {
    const trimmed = text.trim();
    if (trimmed.length < 2 || !/[A-Za-z]/.test(trimmed)) {
        return text;
    }
    const added = Math.ceil(trimmed.length * factor);
    return `${text.replace(/[aeiouAEOUncs]/g, (letter) => accented[letter] ?? letter).trimEnd()} ${"·".repeat(Math.max(1, added - 1))}${text.endsWith(" ") ? " " : ""}`;
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
        const originals = new Map<Text, { original: string; lengthened: string }>();
        const apply = (root: Node) => {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
                const known = originals.get(node);
                if (known?.lengthened === node.nodeValue || isSkipped(node)) {
                    continue;
                }
                // A text the page rendered anew is its new original
                const original = node.nodeValue ?? "";
                const lengthened = lengthen(original, factor);
                originals.set(node, { original, lengthened });
                node.nodeValue = lengthened;
            }
        };
        apply(document.body);
        const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => apply(mutation.target)));
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
        return () => {
            observer.disconnect();
            originals.forEach(({ original, lengthened }, node) => {
                if (node.nodeValue === lengthened) {
                    node.nodeValue = original;
                }
            });
        };
    }, [textLength]);
}
