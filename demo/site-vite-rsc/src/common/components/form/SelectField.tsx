import { Select } from "@base-ui/react/select";
import { SvgUse } from "@src/common/helpers/SvgUse";
import clsx from "clsx";
import { type ReactNode, useId } from "react";
import { Controller, type ControllerProps, type FieldValues } from "react-hook-form";
import { FormattedMessage } from "react-intl";

import { FieldContainer, type FieldContainerFieldProps } from "./FieldContainer";
import styles from "./SelectField.module.scss";

type Option = { value: string; label: ReactNode };

type SelectFieldProps<TFieldValues extends FieldValues> = Pick<ControllerProps<TFieldValues>, "name" | "control" | "rules"> &
    FieldContainerFieldProps & {
        options: Array<Option>;
        placeholder?: ReactNode;
    };

export const SelectField = <TFieldValues extends FieldValues>({
    label,
    helperText,
    name,
    control,
    rules,
    options,
    placeholder,
}: SelectFieldProps<TFieldValues>) => {
    const id = useId();
    const required = !!rules?.required;

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => {
                return (
                    <FieldContainer required={required} label={label} helperText={helperText} errorText={fieldState.error?.message} htmlFor={id}>
                        <div className={styles.container}>
                            <Select.Root
                                value={field.value ?? null}
                                onValueChange={(value: string | null) => field.onChange(value ?? undefined)}
                                name={field.name}
                            >
                                <Select.Trigger
                                    id={id}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                    className={clsx(styles.control, fieldState.error && styles["control--error"])}
                                >
                                    <Select.Value
                                        placeholder={
                                            placeholder ?? <FormattedMessage id="selectField.placeholder" defaultMessage="Select an option" />
                                        }
                                        className={styles.value}
                                    />
                                    <Select.Icon className={styles.icon}>
                                        <SvgUse href="/assets/icons/chevron-down.svg#root" width={16} height={16} className={styles.chevron} />
                                    </Select.Icon>
                                </Select.Trigger>
                                <Select.Portal>
                                    <Select.Positioner alignItemWithTrigger={false} sideOffset={-4}>
                                        <Select.Popup className={styles.menu}>
                                            {options.map((option) => (
                                                <Select.Item key={option.value} value={option.value} className={styles.option}>
                                                    <Select.ItemText>{option.label}</Select.ItemText>
                                                </Select.Item>
                                            ))}
                                        </Select.Popup>
                                    </Select.Positioner>
                                </Select.Portal>
                            </Select.Root>
                        </div>
                    </FieldContainer>
                );
            }}
        />
    );
};
