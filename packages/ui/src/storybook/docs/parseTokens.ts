export type TokenDefinition = {
    name: string;
    definition: string;
    description?: string;
    /** The definition in the `dark-tokens` mixin, which replaces `definition` in the dark and high-contrast color schemes. */
    darkDefinition?: string;
    /** The definition in the `high-contrast-tokens` mixin, which replaces the others in the high-contrast color scheme. */
    highContrastDefinition?: string;
};

const declarationPattern = /^\s*--([a-z0-9-]+):\s*(.+?);\s*$/;
const declarationStartPattern = /^\s*--[a-z0-9-]+:/;
const commentPattern = /^\s*\/\/\s?(.*)$/;
const mixinPattern = /^\s*@mixin\s+([a-z-]+)/;

const colorSchemeMixins: Record<string, "darkDefinition" | "highContrastDefinition"> = {
    "dark-tokens": "darkDefinition",
    "high-contrast-tokens": "highContrastDefinition",
};

/**
 * Reads the custom properties declared in a token partial, keeping a `//` comment directly above a declaration as its description.
 * A declaration that spans several lines is joined into one line. A declaration in a `dark-tokens` or `high-contrast-tokens` mixin
 * becomes the color scheme's definition of the token of the same name.
 */
export function parseTokens(source: string): TokenDefinition[] {
    const tokens: TokenDefinition[] = [];
    let pendingComment: string[] = [];
    let colorSchemeField: "darkDefinition" | "highContrastDefinition" | undefined;
    let unfinishedDeclaration: string | undefined;

    for (const sourceLine of source.split("\n")) {
        let line = sourceLine;
        if (unfinishedDeclaration != null) {
            line = `${unfinishedDeclaration} ${sourceLine.trim()}`.replace(/\( /g, "(").replace(/ \)/g, ")");
            unfinishedDeclaration = undefined;
        }
        if (declarationStartPattern.test(line) && !line.trimEnd().endsWith(";")) {
            unfinishedDeclaration = line.trimEnd();
            continue;
        }

        const mixin = line.match(mixinPattern);
        if (mixin) {
            colorSchemeField = colorSchemeMixins[mixin[1]];
            pendingComment = [];
            continue;
        }

        const comment = line.match(commentPattern);
        if (comment) {
            pendingComment.push(comment[1]);
            continue;
        }

        const declaration = line.match(declarationPattern);
        if (declaration) {
            const name = `--${declaration[1]}`;
            const description = pendingComment.length > 0 ? pendingComment.join(" ") : undefined;
            if (colorSchemeField == null) {
                tokens.push({ name, definition: declaration[2], description });
            } else {
                const token = tokens.find((existing) => existing.name === name);
                if (token != null) {
                    token[colorSchemeField] = declaration[2];
                } else {
                    tokens.push({ name, definition: "", description, [colorSchemeField]: declaration[2] });
                }
            }
        }
        pendingComment = [];
    }

    return tokens;
}
