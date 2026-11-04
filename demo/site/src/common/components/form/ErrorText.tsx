import { SvgUse } from "@src/common/helpers/SvgUse";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

import styles from "./ErrorText.module.scss";

export const ErrorText = ({ children, className, ...restProps }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={clsx(styles.root, className)} {...restProps}>
            <SvgUse href="/assets/icons/error.svg#root" width={16} height={16} />
            {children}
        </div>
    );
};
