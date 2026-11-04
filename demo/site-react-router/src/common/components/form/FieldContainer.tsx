import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { ErrorText } from "./ErrorText";
import styles from "./FieldContainer.module.scss";
import { HelperText } from "./HelperText";

type FieldContainerProps = {
    label?: ReactNode;
    required?: boolean;
    errorText?: ReactNode;
    helperText?: ReactNode;
    children: ReactNode;
    htmlFor?: string;
};

export type FieldContainerFieldProps = Pick<FieldContainerProps, "label" | "helperText">;

export const FieldContainer: React.FC<FieldContainerProps> = ({ label, required, errorText, helperText, children, htmlFor }) => {
    return (
        <div>
            {label && (
                <div className={styles.labelWrapper}>
                    <label className={styles.label} htmlFor={htmlFor}>
                        {label}
                    </label>
                    {!required && (
                        <span className={styles.optionalText}>
                            <FormattedMessage id="fieldContainer.optional" defaultMessage="(optional)" />
                        </span>
                    )}
                </div>
            )}
            {children}
            {errorText ? <ErrorText>{errorText}</ErrorText> : helperText ? <HelperText>{helperText}</HelperText> : null}
        </div>
    );
};
