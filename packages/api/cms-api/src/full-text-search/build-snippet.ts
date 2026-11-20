export const HIGHLIGHT_START_MARKER = "\u0002";
export const HIGHLIGHT_END_MARKER = "\u0003";

interface HighlightRange {
    start: number;
    end: number;
}

export interface MarkedText {
    text: string;
    highlights: HighlightRange[];
}

export interface HighlightedText extends MarkedText {
    truncatedStart: boolean;
    truncatedEnd: boolean;
}

/**
 * Removes the highlight markers inserted by ts_headline and returns the highlights as UTF-16 offsets (end exclusive).
 */
export function parseMarkedText(marked: string): MarkedText {
    let text = "";
    const highlights: HighlightRange[] = [];
    let openStart: number | undefined;

    for (const character of marked) {
        if (character === HIGHLIGHT_START_MARKER) {
            openStart = text.length;
        } else if (character === HIGHLIGHT_END_MARKER) {
            if (openStart !== undefined && openStart < text.length) {
                const previous = highlights[highlights.length - 1];
                if (previous && previous.end === openStart) {
                    previous.end = text.length;
                } else {
                    highlights.push({ start: openStart, end: text.length });
                }
            }
            openStart = undefined;
        } else {
            text += character;
        }
    }

    return { text, highlights };
}

interface BuildSnippetOptions {
    maxLength?: number;
    contextBefore?: number;
}

const sentenceSnapDistanceAtStart = 30;
const sentenceSnapDistanceAtEnd = 30;

/**
 * Cuts the text to a window of at most `maxLength` characters around the densest group of highlights.
 * The defaults keep the first hit within the three lines the admin search shows on a phone-sized screen.
 */
export function buildSnippet({ text, highlights }: MarkedText, { maxLength = 160, contextBefore = 30 }: BuildSnippetOptions = {}): HighlightedText {
    if (text.length <= maxLength) {
        return { text, highlights, truncatedStart: false, truncatedEnd: false };
    }

    const firstHit = findDensestWindowStart({ text, highlights, maxLength, contextBefore });

    let start = avoidSplittingHighlightOrSurrogatePairAtStart(text, highlights, firstHit ? findSnippetStart({ text, firstHit, contextBefore }) : 0);
    let end = avoidSplittingHighlightOrSurrogatePairAtEnd(
        text,
        highlights,
        findSnippetEnd({ text, start, maxLength, minimumEnd: firstHit?.end ?? start }),
    );

    while (start < end && /\s/.test(text[start])) {
        start++;
    }
    while (end > start && /\s/.test(text[end - 1])) {
        end--;
    }

    return {
        text: text.slice(start, end),
        highlights: highlights
            .filter((highlight) => highlight.start >= start && highlight.end <= end)
            .map((highlight) => ({ start: highlight.start - start, end: highlight.end - start })),
        truncatedStart: start > 0,
        truncatedEnd: end < text.length,
    };
}

function findDensestWindowStart({
    text,
    highlights,
    maxLength,
    contextBefore,
}: {
    text: string;
    highlights: HighlightRange[];
    maxLength: number;
    contextBefore: number;
}): HighlightRange | undefined {
    let best: { firstHit: HighlightRange; distinctTerms: number; hits: number } | undefined;

    for (const [index, firstHit] of highlights.entries()) {
        const windowEnd = Math.max(0, firstHit.start - contextBefore) + maxLength;
        const hitsInWindow = highlights.slice(index).filter((highlight) => highlight.end <= windowEnd);
        const distinctTerms = new Set(hitsInWindow.map((highlight) => text.slice(highlight.start, highlight.end).toLowerCase())).size;

        if (!best || distinctTerms > best.distinctTerms || (distinctTerms === best.distinctTerms && hitsInWindow.length > best.hits)) {
            best = { firstHit, distinctTerms, hits: hitsInWindow.length };
        }
    }

    return best?.firstHit;
}

function findSnippetStart({ text, firstHit, contextBefore }: { text: string; firstHit: HighlightRange; contextBefore: number }): number {
    const rawStart = Math.max(0, firstHit.start - contextBefore);
    if (rawStart === 0) {
        return 0;
    }

    const lookBehindStart = Math.max(0, rawStart - sentenceSnapDistanceAtStart);
    const sentenceBoundaries = [...text.slice(lookBehindStart, firstHit.start).matchAll(/[.!?]\s+/g)];
    const sentenceStarts = sentenceBoundaries.map((match) => lookBehindStart + (match.index ?? 0) + match[0].length);
    const sentenceStart = sentenceStarts.filter((position) => position <= rawStart).pop() ?? sentenceStarts.find((position) => position > rawStart);
    if (sentenceStart !== undefined) {
        return sentenceStart;
    }

    const nextWhitespace = text.slice(rawStart, firstHit.start).search(/\s/);
    if (nextWhitespace !== -1) {
        return rawStart + nextWhitespace + 1;
    }

    return rawStart;
}

function findSnippetEnd({ text, start, maxLength, minimumEnd }: { text: string; start: number; maxLength: number; minimumEnd: number }): number {
    const rawEnd = Math.min(text.length, start + maxLength);
    if (rawEnd === text.length) {
        return rawEnd;
    }

    for (let position = rawEnd - 1; position >= Math.max(minimumEnd, rawEnd - sentenceSnapDistanceAtEnd); position--) {
        if (/[.!?]/.test(text[position]) && /\s/.test(text[position + 1])) {
            return position + 1;
        }
    }

    for (let position = rawEnd; position > Math.max(minimumEnd, start); position--) {
        if (/\s/.test(text[position])) {
            return position;
        }
    }

    return Math.max(rawEnd, minimumEnd);
}

function avoidSplittingHighlightOrSurrogatePairAtStart(text: string, highlights: HighlightRange[], position: number): number {
    const splitHighlight = highlights.find((highlight) => highlight.start < position && position < highlight.end);
    if (splitHighlight) {
        return splitHighlight.start;
    }
    return isLowSurrogate(text.charCodeAt(position)) ? position - 1 : position;
}

function avoidSplittingHighlightOrSurrogatePairAtEnd(text: string, highlights: HighlightRange[], position: number): number {
    const splitHighlight = highlights.find((highlight) => highlight.start < position && position < highlight.end);
    if (splitHighlight) {
        return splitHighlight.end;
    }
    return isLowSurrogate(text.charCodeAt(position)) ? position - 1 : position;
}

function isLowSurrogate(charCode: number): boolean {
    return charCode >= 0xdc00 && charCode <= 0xdfff;
}
