import type { PropsWithChildren } from "react";

import styles from "./TableScrollContainer.module.scss";

/** Scrolls a table sideways when it is wider than the page. Takes focus, so the keyboard can scroll it too. */
export const TableScrollContainer = ({ children }: PropsWithChildren) => (
    <div tabIndex={0} className={styles.scrollContainer}>
        {children}
    </div>
);
