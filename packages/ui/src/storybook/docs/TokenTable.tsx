import { Theme } from "../../components/theme/Theme";
import { parseTokens, type TokenDefinition } from "./parseTokens";
import { useResolvedTokens } from "./ThemedProbe";
import styles from "./TokenTable.module.scss";

const colorPattern = /^(oklch|rgb|hsl|#|color-mix)/;

function Description({ text }: { text: string }) {
    return (
        <div className={styles.description}>{text.split("`").map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part))}</div>
    );
}

export interface TokenTableProps {
    /** Tokens to list, either parsed from a token partial (`?raw` import) or given explicitly. */
    tokens: string | TokenDefinition[];
}

/**
 * Lists tokens with their description and their live value in the brand and color scheme picked in the toolbar.
 */
export function TokenTable({ tokens }: TokenTableProps) {
    const definitions = typeof tokens === "string" ? parseTokens(tokens) : tokens;
    const { values, probe } = useResolvedTokens(definitions.map((token) => token.name));

    return (
        // The docs page stays light whatever the toolbar picks, so the table's own colors do too
        <Theme colorScheme="light">
            <div className={styles.wrapper}>
                {probe}
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Variable</th>
                            <th>Description</th>
                            <th>Value (live)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {definitions.map((token) => {
                            const value = values[token.name] ?? "";
                            return (
                                <tr key={token.name}>
                                    <td>
                                        <code className={styles.variable}>{token.name}</code>
                                    </td>
                                    <td>{token.description != null && <Description text={token.description} />}</td>
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
        </Theme>
    );
}
