import { Theme } from "../../components/theme/Theme";
import styles from "./RulesTable.module.scss";

export type Rules = {
    do: string[];
    dont: string[];
};

export function isRules(value: unknown): value is Rules {
    return typeof value === "object" && value != null && Array.isArray((value as Rules).do) && Array.isArray((value as Rules).dont);
}

/**
 * The do's and don'ts of a component, side by side.
 */
export function RulesTable({ rules }: { rules: Rules }) {
    return (
        // The docs page stays light whatever the toolbar picks, so the rules' own colors do too
        <Theme colorScheme="light">
            <div className={styles.root}>
                <div className={styles.column} data-kind="do">
                    <strong>Do</strong>
                    <ul>
                        {rules.do.map((rule) => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ul>
                </div>
                <div className={styles.column} data-kind="dont">
                    <strong>Don&apos;t</strong>
                    <ul>
                        {rules.dont.map((rule) => (
                            <li key={rule}>{rule}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Theme>
    );
}
