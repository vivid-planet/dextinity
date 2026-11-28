import type { TextMatch } from "../common/MarkedMatches";

interface Highlight {
    start: number;
    end: number;
}

export function toTextMatches(highlights: Highlight[]): TextMatch[] {
    // The API returns an exclusive end offset, MarkedMatches expects an inclusive one
    return highlights.map((highlight) => ({ start: highlight.start, end: highlight.end - 1, focused: false }));
}
