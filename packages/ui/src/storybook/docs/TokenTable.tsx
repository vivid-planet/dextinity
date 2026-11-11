import { ToolbarTheme } from "../themeDecorator";
import { parseTokens, type TokenDefinition } from "./parseTokens";
import styles from "./TokenTable.module.scss";
import { useResolvedTokens } from "./useResolvedTokens";

const colorPattern = /^(rgb|oklch|hsl|#|color-mix|linear-gradient)/;

export interface TokenTableProps {
    /** The tokens to list: the source of a token file (imported with `?raw`), or a list of tokens. */
    tokens: string | Array<Pick<TokenDefinition, "name" | "description">>;
}

/**
 * Lists CSS variables with their description and their value in the brand and the color scheme picked in the toolbar.
 */
export function TokenTable({ tokens }: TokenTableProps) {
    const definitions: Array<Partial<TokenDefinition> & Pick<TokenDefinition, "name">> = typeof tokens === "string" ? parseTokens(tokens) : tokens;
    const { values, probe } = useResolvedTokens(definitions.map((token) => token.name));

    return (
        <ToolbarTheme>
            <div className={styles.root}>
                {probe}
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>CSS variable</th>
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
                                        {token.definition !== undefined && token.definition !== value && (
                                            <code className={styles.definition}>{token.definition}</code>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </ToolbarTheme>
    );
}
