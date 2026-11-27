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
const sampleWords = (
    "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis " +
    "natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, " +
    "pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, " +
    "vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede " +
    "mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. " +
    "Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, " +
    "feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies " +
    "nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget " +
    "condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, " +
    "luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero " +
    "venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris " +
    "sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis " +
    "gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy " +
    "id, metus. Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis " +
    "in faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam pretium turpis " +
    "et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis, ipsum. Sed aliquam ultrices mauris. " +
    "Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum " +
    "rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl sagittis " +
    "vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis " +
    "hendrerit risus. Phasellus nec sem in justo pellentesque facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. " +
    "Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod " +
    "vitae, posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. " +
    "Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus et " +
    "ultrices posuere cubilia Curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci, ac placerat dolor " +
    "lectus quis orci. Phasellus consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non, " +
    "nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent turpis. Aenean posuere, " +
    "tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin urna dolor sagittis lacus. Donec elit libero, " +
    "sodales nec, volutpat a, suscipit non, turpis. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, " +
    "sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus " +
    "et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero. Phasellus dolor."
).split(" ");

function endsSentence(word: string) {
    return /[.;!?]$/.test(word);
}

// Where an addition may start: after a text that ends a sentence, at the start of one, else within one, so it reads on
const sampleIndices = Array.from(sampleWords.keys());
const sentenceStarts = sampleIndices.filter((index) => index === 0 || endsSentence(sampleWords[index - 1]));
const wordsWithinSentences = sampleIndices.filter((index) => index > 0 && !endsSentence(sampleWords[index - 1]));

/** A number that is the same for the same text, so that a text is lengthened the same way each time it's rendered. */
function hashText(text: string) {
    let hash = 0;
    for (let index = 0; index < text.length; index++) {
        hash = (Math.imul(hash, 31) + text.charCodeAt(index)) >>> 0;
    }
    return hash;
}

const keptValuePatterns = [
    // A short code, e.g. the initials of an avatar or a country code
    /^[^a-z]{1,3}$/,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i,
    /^\/[\w\-./]*$/,
    /^[^\s/]+\.[a-z0-9]{2,4}$/i,
    // Locale codes, e.g. "AT · de" or "de-AT"
    /^[A-Za-z]{2}(\s*[·\-_/|,]\s*[A-Za-z]{2})+$/,
    /^[\d\s.,:/+\-–%]*\d[\d\s.,:/+\-–%]*\s?(am|pm|h|min|s|ms|kb|mb|gb|px|%|€|\$)?$/i,
];

/**
 * Whether a text is a value that a translation keeps as it is, e.g. a URL, a path, a file name, an email address, a locale code, a
 * time, or a short code like the initials of an avatar.
 */
export function isKeptByTranslation(text: string) {
    const trimmed = text.trim();
    return !/[A-Za-z]/.test(trimmed) || keptValuePatterns.some((pattern) => pattern.test(trimmed));
}

/**
 * The text with whole sample words added, about `factor` times its length. Placeholder words rather than repeated
 * characters, so the lengthened text wraps and breaks like a real translation; each text starts at another word of the sample, so
 * the texts on a page don't all end alike. A text that ends a sentence gets whole sentences; a label gets lowercase words without
 * punctuation, so that it reads on as one label.
 */
export function lengthenText(text: string, factor: number) {
    const trimmed = text.trim();
    if (factor === 0 || trimmed.length < 2 || isKeptByTranslation(trimmed)) {
        return text;
    }
    const added = Math.ceil(trimmed.length * factor);
    const endsWithSentence = /[.!?]$/.test(trimmed);
    const starts = endsWithSentence ? sentenceStarts : wordsWithinSentences;
    const start = starts[hashText(trimmed) % starts.length];
    const toAddedWord = (word: string) => (endsWithSentence ? word : word.replace(/[.,;:]+$/, "").toLowerCase());
    let filler = toAddedWord(sampleWords[start]);
    for (let index = start + 1; filler.length + 1 < added; index++) {
        filler += ` ${toAddedWord(sampleWords[index % sampleWords.length])}`;
    }
    // A label ending in "," or ";" looks like a cut-off text rather than a longer one
    const lastWordTrimmed = filler.replace(/[.,;:]+$/, "");
    return `${text.trimEnd()} ${lastWordTrimmed}${text.endsWith(" ") ? " " : ""}`;
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
    return (
        node.parentElement?.closest('script, style, [contenteditable], code, kbd, samp, [data-text-length="fixed"], [class*="dextinityAvatar"]') !=
        null
    );
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
            const lengthened = lengthenText(original, factor);
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
