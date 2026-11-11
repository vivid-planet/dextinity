import type { PropsWithChildren, ReactNode } from "react";

import styles from "./SpecGrid.module.scss";

/**
 * A grid of {@link Spec} cards, like a section of the design system draft's component pages.
 */
export function SpecGrid({ children }: PropsWithChildren) {
    return <div className={styles.grid}>{children}</div>;
}

/**
 * One example of a section: the component, its name, and an optional note on when to use it.
 */
export function Spec({ label, note, children }: PropsWithChildren<{ label: ReactNode; note?: ReactNode }>) {
    return (
        <div className={styles.spec}>
            <div className={styles.preview}>{children}</div>
            <div className={styles.caption}>
                <span className={styles.label}>{label}</span>
                {note != null && <span className={styles.note}>{note}</span>}
            </div>
        </div>
    );
}
