import { parseTokens, type TokenDefinition } from "../parseTokens";

const interpolationPattern = /#\{(\$[a-z-]+)\}/g;

/**
 * The tokens of a theme partial, each listed once with its first definition — the default brand, light color scheme, and
 * standard density — and SCSS interpolations shown as variables.
 */
export function layerTokens(source: string): TokenDefinition[] {
    const tokens = new Map<string, TokenDefinition>();
    for (const token of parseTokens(source)) {
        if (!tokens.has(token.name)) {
            tokens.set(token.name, { ...token, definition: token.definition.replace(interpolationPattern, "$1") });
        }
    }
    return [...tokens.values()];
}
