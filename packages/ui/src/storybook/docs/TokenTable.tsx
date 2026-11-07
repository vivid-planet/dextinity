import { parseTokens, type TokenDefinition } from "./parseTokens";
import { useResolvedTokens } from "./ThemedProbe";
import styles from "./TokenTable.module.scss";

const colorPattern = /^(oklch|rgb|hsl|#|color-mix)/;

export interface TokenTableProps {
    /** Tokens to list, either parsed from a token partial (`?raw` import) or given explicitly. */
    tokens: string | TokenDefinition[];
}

/**
 * Lists tokens with their definition and their live value in the brand, color scheme, and density picked in the toolbar.
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
                        <th>Definition</th>
                        <th>Value (live)</th>
                    </tr>
                </thead>
                <tbody>
                    {definitions.map((token) => {
                        const value = values[token.name] ?? "";
                        return (
                            <tr key={token.name}>
                                <td>
                                    <code>{token.name}</code>
                                    {token.description != null && <div className={styles.description}>{token.description}</div>}
                                </td>
                                <td>
                                    <code className={styles.definition}>{token.definition}</code>
                                    {token.darkDefinition != null && (
                                        <div className={styles.description}>
                                            Dark and high contrast: <code className={styles.definition}>{token.darkDefinition}</code>
                                        </div>
                                    )}
                                    {token.highContrastDefinition != null && (
                                        <div className={styles.description}>
                                            High contrast: <code className={styles.definition}>{token.highContrastDefinition}</code>
                                        </div>
                                    )}
                                </td>
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
