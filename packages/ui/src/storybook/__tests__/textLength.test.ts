import { describe, expect, it } from "vitest";

import { lengthenText } from "../textLength";

function getAddedWords(text: string, lengthened: string) {
    expect(lengthened.startsWith(`${text.trimEnd()} `)).toBe(true);
    return lengthened
        .slice(text.trimEnd().length + 1)
        .trimEnd()
        .split(" ");
}

const labels = ["Save changes", "Publish page", "Delete", "Add to favorites", "Last edited by", "Settings", "Open in new tab", "Upload files"];

describe("lengthenText", () => {
    it.each([0.4, 1])("adds whole words of about %s times the text's length", (factor) => {
        for (const label of labels) {
            const lengthened = lengthenText(label, factor);
            const addedLength = lengthened.length - label.length;
            const expectedLength = label.length * factor;
            // Less by a stripped final punctuation mark, more by up to the sample's longest word
            expect(addedLength).toBeGreaterThanOrEqual(expectedLength - 1);
            expect(addedLength).toBeLessThanOrEqual(expectedLength + "pellentesque".length + 1);
            expect(getAddedWords(label, lengthened).every((word) => /^[A-Za-z]+[,.;]?$/.test(word))).toBe(true);
        }
    });

    it("lengthens the same text the same way each time", () => {
        expect(lengthenText("Publish page", 1)).toBe(lengthenText("Publish page", 1));
    });

    it("starts the texts of a page at different words of the sample", () => {
        const firstWords = new Set(labels.map((label) => getAddedWords(label, lengthenText(label, 1))[0]));
        expect(firstWords.size).toBeGreaterThan(labels.length / 2);
    });

    it("doesn't end the text with punctuation of the sample", () => {
        for (const label of labels) {
            expect(lengthenText(label, 0.4)).toMatch(/[A-Za-z]$/);
            expect(lengthenText(label, 1)).toMatch(/[A-Za-z]$/);
        }
    });

    it("continues a text within a sentence, and one that ends a sentence with a new sentence", () => {
        for (const label of labels) {
            expect(getAddedWords(label, lengthenText(label, 1))[0]).toMatch(/^[a-z]/);
            const sentence = `${label}.`;
            expect(getAddedWords(sentence, lengthenText(sentence, 1))[0]).toMatch(/^[A-Z]/);
        }
    });

    it("keeps a trailing space, and leaves texts without words and the normal length as they are", () => {
        expect(lengthenText("Save ", 1)).toMatch(/^Save \S.* $/);
        expect(lengthenText("12:30", 1)).toBe("12:30");
        expect(lengthenText("x", 1)).toBe("x");
        expect(lengthenText("Save changes", 0)).toBe("Save changes");
    });
});
