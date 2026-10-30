import clsx from "clsx";
import { type InputHTMLAttributes, type ReactNode, useId } from "react";
import { Controller, type ControllerProps, type FieldValues } from "react-hook-form";

import styles from "./CheckboxField.module.scss";
import { ErrorText } from "./ErrorText";
import { HelperText } from "./HelperText";

type CheckboxFieldProps<TFieldValues extends FieldValues> = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> &
    Pick<ControllerProps<TFieldValues>, "name" | "control" | "rules"> & {
        label: ReactNode;
        helperText?: ReactNode;
    };

export const CheckboxField = <TFieldValues extends FieldValues>({
    label,
    helperText,
    name,
    control,
    rules,
    ...inputProps
}: CheckboxFieldProps<TFieldValues>) => {
    const id = useId();
    const descriptionId = useId();
    const required = !!rules?.required;

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { value, ...field }, fieldState }) => {
                return (
                    <div>
                        <label htmlFor={id} className={styles.wrapper}>
                            <input
                                type="checkbox"
                                {...inputProps}
                                {...field}
                                id={id}
                                checked={Boolean(value)}
                                aria-required={required}
                                aria-invalid={fieldState.error ? true : undefined}
                                aria-describedby={fieldState.error?.message || helperText ? descriptionId : undefined}
                                className={styles.input}
                            />
                            <span
                                className={clsx(
                                    styles.checkbox,
                                    Boolean(value) && styles["checkbox--checked"],
                                    fieldState.error && styles["checkbox--error"],
                                )}
                            />
                            <span className={styles.labelText}>{label}</span>
                        </label>
                        {fieldState.error?.message ? (
                            <ErrorText id={descriptionId} className={styles.description}>
                                {fieldState.error.message}
                            </ErrorText>
                        ) : helperText ? (
                            <HelperText id={descriptionId} className={styles.description}>
                                {helperText}
                            </HelperText>
                        ) : null}
                    </div>
                );
            }}
        />
    );
};
