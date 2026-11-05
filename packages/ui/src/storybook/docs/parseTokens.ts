export type TokenDefinition = {
    name: string;
    definition: string;
    description?: string;
};

const declarationPattern = /^\s*--([a-z0-9-]+):\s*(.+?);\s*$/;
const commentPattern = /^\s*\/\/\s?(.*)$/;

/**
 * Reads the custom properties declared in a token partial, keeping a `//` comment directly above a declaration as its description.
 */
export function parseTokens(source: string): TokenDefinition[] {
    const tokens: TokenDefinition[] = [];
    let pendingComment: string[] = [];

    for (const line of source.split("\n")) {
        const comment = line.match(commentPattern);
        if (comment) {
            pendingComment.push(comment[1]);
            continue;
        }

        const declaration = line.match(declarationPattern);
        if (declaration) {
            tokens.push({
                name: `--${declaration[1]}`,
                definition: declaration[2],
                description: pendingComment.length > 0 ? pendingComment.join(" ") : undefined,
            });
        }
        pendingComment = [];
    }

    return tokens;
}
