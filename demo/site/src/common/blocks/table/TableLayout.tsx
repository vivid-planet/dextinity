import { PageLayout } from "@src/layout/PageLayout";
import { AnimateBoxInOnScroll } from "@src/util/animations/AnimateBoxInOnScroll";
import type { PropsWithChildren } from "react";

import styles from "./TableLayout.module.scss";

/** Places a table in the content column of the page grid. */
export const TableLayout = ({ children }: PropsWithChildren) => (
    <PageLayout grid>
        <div className={styles.pageLayoutContent}>
            <AnimateBoxInOnScroll direction="bottom" offset={300}>
                {children}
            </AnimateBoxInOnScroll>
        </div>
    </PageLayout>
);
