import type { PropsWithChildren } from "react";

import styles from "./TableScrollContainer.module.scss";

/** Takes focus, so that the keyboard can scroll the table. */
export const TableScrollContainer = ({ children }: PropsWithChildren) => (
    <div tabIndex={0} className={styles.scrollContainer}>
        {children}
    </div>
);
