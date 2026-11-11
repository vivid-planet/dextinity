import type { ReactNode } from "react";

import { Icon } from "../../components/icon/Icon";
import { ToolbarTheme } from "../themeDecorator";
import styles from "./Rules.module.scss";

export type RulesDefinition = {
    /** What to do. */
    dos: string[];
    /** What not to do. */
    donts: string[];
};

function withInlineCode(rule: string): ReactNode[] {
    return rule.split("`").map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part));
}

/**
 * Lists the rules for using a component or a foundation: what to do, and what not to do.
 */
export function Rules({ dos, donts }: RulesDefinition) {
    return (
        <ToolbarTheme>
            <div className={styles.root}>
                <section className={styles.do}>
                    <h3 className={styles.heading}>
                        <Icon name="check" />
                        Do
                    </h3>
                    <ul className={styles.list}>
                        {dos.map((rule) => (
                            <li key={rule}>{withInlineCode(rule)}</li>
                        ))}
                    </ul>
                </section>
                <section className={styles.dont}>
                    <h3 className={styles.heading}>
                        <Icon name="close" />
                        Don't
                    </h3>
                    <ul className={styles.list}>
                        {donts.map((rule) => (
                            <li key={rule}>{withInlineCode(rule)}</li>
                        ))}
                    </ul>
                </section>
            </div>
        </ToolbarTheme>
    );
}
