import { parseTokens, type TokenDefinition } from "./parseTokens";
import { useResolvedTokens } from "./ThemedProbe";
import styles from "./TokenTable.module.scss";

const colorPattern = /^(oklch|rgb|hsl|#|color-mix)/;

export interface TokenTableProps {
    /** Tokens to list, either parsed from a token partial (`?raw` import) or given explicitly. */
    tokens: string | TokenDefinition[];
}

/**
 * Lists tokens with their description (the `//` comment above a token) and their live value in the brand, color scheme, and density
 * picked in the toolbar.
 */
export function TokenTable({ tokens }: TokenTableProps) {
    const definitions = typeof tokens === "string" ? parseTokens(tokens) : tokens;
    const { values, probe } = useResolvedTokens(definitions.map((token) => token.name));

    return (
        <div className={styles.wrapper}>
            {probe}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>Description</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {definitions.map((token) => {
                        const value = values[token.name] ?? "";
                        return (
                            <tr key={token.name}>
                                <td>
                                    <code>{token.name}</code>
                                </td>
                                <td>{token.description}</td>
                                <td>
                                    <span className={styles.value}>
                                        {colorPattern.test(value) && <span className={styles.swatch} style={{ background: value }} />}
                                        <code>{value}</code>
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
