import { describe, expect, it } from "vitest";

import { buildSnippet, parseMarkedText } from "./build-snippet";

const start = "\u0002";
const end = "\u0003";

function mark(text: string, highlights: Array<{ start: number; end: number }>): string {
    let marked = text;
    for (const highlight of [...highlights].reverse()) {
        marked = `${marked.slice(0, highlight.start)}[${marked.slice(highlight.start, highlight.end)}]${marked.slice(highlight.end)}`;
    }
    return marked;
}

function markedSource(text: string): string {
    return text.replaceAll("[", start).replaceAll("]", end);
}

describe("parseMarkedText", () => {
    it("returns text without marks unchanged", () => {
        expect(parseMarkedText("quick brown fox")).toEqual({ text: "quick brown fox", highlights: [] });
    });

    it("returns the offsets of several marks", () => {
        const parsed = parseMarkedText(markedSource("the [quick] brown [fox]"));

        expect(parsed.text).toBe("the quick brown fox");
        expect(parsed.highlights).toEqual([
            { start: 4, end: 9 },
            { start: 16, end: 19 },
        ]);
    });

    it("handles marks at the start and the end", () => {
        expect(parseMarkedText(markedSource("[quick] brown [fox]")).highlights).toEqual([
            { start: 0, end: 5 },
            { start: 12, end: 15 },
        ]);
    });

    it("merges adjacent marks", () => {
        expect(parseMarkedText(markedSource("[ab][cd] ef")).highlights).toEqual([{ start: 0, end: 4 }]);
    });

    it("drops stray markers", () => {
        expect(parseMarkedText(`a${end}b ${start}c`)).toEqual({ text: "ab c", highlights: [] });
    });

    it("keeps HTML as literal text", () => {
        const parsed = parseMarkedText(markedSource("<script>alert(1)</script> [abc]"));

        expect(parsed.text).toBe("<script>alert(1)</script> abc");
        expect(parsed.highlights).toEqual([{ start: 26, end: 29 }]);
    });

    it("returns UTF-16 offsets", () => {
        const parsed = parseMarkedText(markedSource("🦊 [fox]"));

        expect(parsed.text.slice(parsed.highlights[0].start, parsed.highlights[0].end)).toBe("fox");
        expect(parsed.highlights).toEqual([{ start: 3, end: 6 }]);
    });
});

describe("buildSnippet", () => {
    const filler = (word: string, count: number) => Array.from({ length: count }, () => word).join(" ");

    it("returns a short text as a whole", () => {
        const parsed = parseMarkedText(markedSource("the [fox] jumps"));

        expect(buildSnippet(parsed)).toEqual({ ...parsed, truncatedStart: false, truncatedEnd: false });
    });

    it("keeps context before the first hit and cuts at word boundaries", () => {
        const parsed = parseMarkedText(markedSource(`${filler("lorem", 40)} [fox] ${filler("ipsum", 40)}`));
        const snippet = buildSnippet(parsed, { maxLength: 100, contextBefore: 30 });

        expect(snippet.truncatedStart).toBe(true);
        expect(snippet.truncatedEnd).toBe(true);
        expect(snippet.text.startsWith("lorem")).toBe(true);
        expect(snippet.text.endsWith("ipsum")).toBe(true);
        expect(snippet.text.length).toBeLessThanOrEqual(100);
        expect(snippet.text.indexOf("fox")).toBeGreaterThanOrEqual(20);
        expect(mark(snippet.text, snippet.highlights)).toContain("[fox]");
    });

    it("snaps the start to a sentence start", () => {
        const parsed = parseMarkedText(markedSource(`${filler("lorem", 40)}. Then the quick [fox] ${filler("ipsum", 40)}`));
        const snippet = buildSnippet(parsed, { maxLength: 100, contextBefore: 30 });

        expect(snippet.text.startsWith("Then the quick fox")).toBe(true);
    });

    it("snaps the end to a sentence end", () => {
        const parsed = parseMarkedText(markedSource(`${filler("lorem", 40)} [fox] ${filler("ipsum", 12)}. ${filler("dolor", 40)}`));
        const snippet = buildSnippet(parsed, { maxLength: 120, contextBefore: 30 });

        expect(snippet.text.endsWith("ipsum.")).toBe(true);
        expect(snippet.truncatedEnd).toBe(true);
    });

    it("chooses the window with the most distinct terms over the first hit", () => {
        const parsed = parseMarkedText(markedSource(`[fox] ${filler("lorem", 60)} [quick] brown [fox] ${filler("ipsum", 60)}`));
        const snippet = buildSnippet(parsed, { maxLength: 100, contextBefore: 20 });

        expect(mark(snippet.text, snippet.highlights)).toContain("[quick] brown [fox]");
        expect(snippet.truncatedStart).toBe(true);
    });

    it("rebases the highlight offsets", () => {
        const parsed = parseMarkedText(markedSource(`${filler("lorem", 40)} [fox] ${filler("ipsum", 40)}`));
        const snippet = buildSnippet(parsed, { maxLength: 100, contextBefore: 30 });

        expect(snippet.highlights).toHaveLength(1);
        expect(snippet.text.slice(snippet.highlights[0].start, snippet.highlights[0].end)).toBe("fox");
    });

    it("never cuts through a highlight", () => {
        const text = `${"x".repeat(150)}[${"y".repeat(20)}]${"z".repeat(150)}`;
        const parsed = parseMarkedText(markedSource(text));
        const snippet = buildSnippet(parsed, { maxLength: 100, contextBefore: 90 });

        expect(snippet.highlights).toHaveLength(1);
        expect(snippet.text.slice(snippet.highlights[0].start, snippet.highlights[0].end)).toBe("y".repeat(20));
    });

    it("doesn't truncate the start when the first hit is close to it", () => {
        const parsed = parseMarkedText(markedSource(`the [fox] ${filler("ipsum", 60)}`));
        const snippet = buildSnippet(parsed, { maxLength: 100 });

        expect(snippet.truncatedStart).toBe(false);
        expect(snippet.truncatedEnd).toBe(true);
        expect(snippet.highlights).toEqual([{ start: 4, end: 7 }]);
    });
});
