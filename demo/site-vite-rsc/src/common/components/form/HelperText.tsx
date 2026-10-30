import clsx from "clsx";
import type { HTMLAttributes } from "react";

import styles from "./HelperText.module.scss";

export const HelperText = ({ children, className, ...restProps }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={clsx(styles.root, className)} {...restProps}>
            {children}
        </div>
    );
};
