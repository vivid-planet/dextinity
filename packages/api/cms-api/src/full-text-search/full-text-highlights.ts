import { ANY_TERM_TSQUERY_SQL } from "./prefix-full-text-query.js";

const HIGHLIGHT_START_MARKER = "\u0002";
const HIGHLIGHT_END_MARKER = "\u0003";

interface Highlight {
    start: number;
    end: number;
}

interface Snippet {
    text: string;
    highlights: Highlight[];
    truncatedStart: boolean;
    truncatedEnd: boolean;
}

function headlineOptionsSql(options: string): string {
    return `'${options}, StartSel=' || chr(${HIGHLIGHT_START_MARKER.charCodeAt(0)}) || ', StopSel=' || chr(${HIGHLIGHT_END_MARKER.charCodeAt(0)})`;
}

// Includes the highlight markers, so a text can't fake a highlight. Replacing each character with a space keeps the
// offsets of the highlights valid for the original text. PostgreSQL rejects \u0000 in text.
// eslint-disable-next-line no-control-regex
const controlCharactersRegex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function stripControlCharacters(text: string): string {
    return text.replace(controlCharactersRegex, " ");
}

// ts_headline replaces HTML tags with a space in fragment mode, so a text with "<b>" wouldn't be found in the source text anymore.
// Replacing "<" with a space keeps the offsets valid for the source text and stops PostgreSQL from parsing tags.
function withoutTags(text: string): string {
    return text.replaceAll("<", " ");
}

/**
 * Marks any of the search terms in each name and in the best matching fragment of each text, as `markedName` and `markedText`.
 * The names and the texts are non-empty arrays of the same length, without control characters.
 * The texts are built from the entities in the application, so they can't be part of the search query.
 */
export function markedTextsQuery({ search, names, texts }: { search: string; names: string[]; texts: string[] }): { sql: string; params: unknown[] } {
    // ARRAY[?] because MikroORM expands an array parameter to a list of values
    const sql = `SELECT
            ts_headline('simple', x."name", q."query", ${headlineOptionsSql("HighlightAll=true")}) AS "markedName",
            ts_headline('simple', x."text", q."query", ${headlineOptionsSql("MaxFragments=1, MinWords=12, MaxWords=25")}) AS "markedText"
        FROM (SELECT ${ANY_TERM_TSQUERY_SQL} AS "query") AS q
        CROSS JOIN unnest(ARRAY[?]::text[], ARRAY[?]::text[]) WITH ORDINALITY AS x("name", "text", "index")
        ORDER BY x."index"`;
    return { sql, params: [search, names, texts.map(withoutTags)] };
}

/**
 * Removes the markers inserted by ts_headline and returns the highlights as UTF-16 offsets (end exclusive).
 */
export function parseMarkedText(marked: string): { text: string; highlights: Highlight[] } {
    let text = "";
    const highlights: Highlight[] = [];
    let openStart: number | undefined;

    for (const character of marked) {
        if (character === HIGHLIGHT_START_MARKER) {
            openStart = text.length;
        } else if (character === HIGHLIGHT_END_MARKER) {
            if (openStart !== undefined && openStart < text.length) {
                const previous = highlights.at(-1);
                if (previous?.end === openStart) {
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

const letterOrNumberRegex = /[\p{L}\p{N}]/u;
const leadingPunctuationRegex = /^[^\s\p{L}\p{N}]+/u;

/**
 * Returns undefined if the fragment has no highlights, because ts_headline returns the start of the text if the text doesn't match.
 */
export function toSnippet(markedFragment: string, source: string): Snippet | undefined {
    const { text, highlights } = parseMarkedText(markedFragment);
    if (highlights.length === 0) {
        return undefined;
    }

    const start = withoutTags(source).indexOf(text);
    if (start === -1) {
        return { text, highlights, truncatedStart: false, truncatedEnd: false };
    }

    // ts_headline ends the fragment at the last word and drops the punctuation after it
    const end = start + text.length + (source.slice(start + text.length).match(leadingPunctuationRegex)?.[0].length ?? 0);

    return {
        text: source.slice(start, end),
        highlights,
        truncatedStart: letterOrNumberRegex.test(source.slice(0, start)),
        truncatedEnd: letterOrNumberRegex.test(source.slice(end)),
    };
}
