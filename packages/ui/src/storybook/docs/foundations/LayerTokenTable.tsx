import { TokenTable } from "../TokenTable";
import { layerTokens } from "./layerTokens";

export interface LayerTokenTableProps {
    /** The partial's source, imported with `?raw`. */
    source: string;
    /** Lists only tokens whose name starts with one of these prefixes. */
    prefixes?: string[];
    /** Descriptions by token name, for tokens without a comment in the partial. */
    descriptions?: Record<string, string>;
}

/**
 * Lists the tokens of a theme partial with their live values.
 */
export function LayerTokenTable({ source, prefixes, descriptions = {} }: LayerTokenTableProps) {
    const tokens = layerTokens(source)
        .filter(({ name }) => !prefixes || prefixes.some((prefix) => name.startsWith(prefix)))
        .map((token) => ({ ...token, description: token.description ?? descriptions[token.name] }));
    return <TokenTable tokens={tokens} />;
}
