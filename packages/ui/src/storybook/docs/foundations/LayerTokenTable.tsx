import { TokenTable } from "../TokenTable";
import { layerTokens } from "./layerTokens";

export interface LayerTokenTableProps {
    /** The partial's source, imported with `?raw`. */
    source: string;
    /** Lists only tokens whose name starts with one of these prefixes. */
    prefixes?: string[];
}

/**
 * Lists the tokens of a theme partial with their live values.
 */
export function LayerTokenTable({ source, prefixes }: LayerTokenTableProps) {
    const tokens = layerTokens(source).filter(({ name }) => !prefixes || prefixes.some((prefix) => name.startsWith(prefix)));
    return <TokenTable tokens={tokens} />;
}
