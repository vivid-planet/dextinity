export type TokenDefinition = {
    name: string;
    /** The declared value, for example a reference to another token. */
    definition: string;
    description?: string;
};

const declarationPattern = /^\s*--([a-z0-9-]+):\s*(.+?);\s*$/;
const commentPattern = /^\s*\/\/\s?(.*)$/;

/**
 * Reads the custom properties declared in a token file, keeping the `//` comment directly above a declaration as its description.
 * A token declared more than once, such as in each color scheme, is listed once, with the first description found.
 */
export function parseTokens(source: string): TokenDefinition[] {
    const tokens = new Map<string, TokenDefinition>();
    let pendingComment: string[] = [];

    for (const line of source.split("\n")) {
        const comment = line.match(commentPattern);
        if (comment) {
            pendingComment.push(comment[1]);
            continue;
        }

        const declaration = line.match(declarationPattern);
        if (declaration) {
            const name = `--${declaration[1]}`;
            const description = pendingComment.length > 0 ? pendingComment.join(" ") : undefined;
            const existing = tokens.get(name);
            if (existing === undefined) {
                tokens.set(name, { name, definition: declaration[2], description });
            } else if (existing.description === undefined) {
                existing.description = description;
            }
        }
        pendingComment = [];
    }

    return [...tokens.values()];
}
