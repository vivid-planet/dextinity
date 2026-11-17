import clsx from "clsx";
import type { HTMLAttributes } from "react";

import styles from "./PageLayout.module.scss";

interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
    grid?: boolean;
}

export const PageLayout = ({ grid, className, ...restProps }: PageLayoutProps) => (
    <div className={clsx(styles.root, grid && styles.grid, className)} {...restProps} />
);
