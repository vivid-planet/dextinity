import { Error } from "@dextinity/admin-icons";
import { InputAdornment, LinearProgress, MenuItem, Select, type SelectProps, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { ClearInputAdornment } from "../common/ClearInputAdornment";
import type { AsyncOptionsProps } from "../hooks/useAsyncOptionsProps";
import { LinearLoadingContainer, MenuItemDisabledOverrideOpacity } from "./FinalFormSelect.sc";

export interface FinalFormSelectProps<T> {
    noOptionsText?: ReactNode;
    errorText?: ReactNode;
    getOptionLabel?: (option: T) => string;
    getOptionValue?: (option: T) => string;
    children?: ReactNode;
    required?: boolean;
    loadingError?: Error | null;
}

type FinalFormSelectInternalProps<T> = FieldRenderProps<T, HTMLInputElement | HTMLTextAreaElement>;

/**
 * Final Form-compatible Select component.
 *
 * @see {@link SelectField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormSelect = <T,>({
    input: { checked, value: incomingValue, name, onChange, onFocus, onBlur, ...restInput },
    meta,
    isAsync = false,
    options = [],
    loading = false,
    loadingError,
    getOptionLabel = (option: T) => {
        if (typeof option === "object") {
            console.error(`The \`getOptionLabel\` method of FinalFormSelect returned an object instead of a string for${JSON.stringify(option)}.`);
        }
        return "";
    },
    getOptionValue = (option: T) => {
        if (typeof option === "object" && option !== null) {
            if ((option as any).id) {
                return String((option as any).id);
            }
            if ((option as any).value) {
                return String((option as any).value);
            }
            return JSON.stringify(option);
        } else {
            return String(option);
        }
    },

    noOptionsText = (
        <Typography variant="body2">
            <FormattedMessage id="dextinity.finalFormSelect.noOptions" defaultMessage="No options." />
        </Typography>
    ),
    errorText = (
        <Typography variant="body2">
            <FormattedMessage id="dextinity.finalFormSelect.error" defaultMessage="Error loading options." />
        </Typography>
    ),
    disabled,
    children,
    required,
    ...rest
}: FinalFormSelectProps<T> & FinalFormSelectInternalProps<T> & Partial<AsyncOptionsProps<T>> & Omit<SelectProps, "input" | "endAdornment">) => {
    // Depending on the usage, `multiple` is either a root prop or in the `input` prop.
    // 1. <Field component={FinalFormSelect} multiple /> -> multiple is in restInput
    // 2. <Field>{(props) => <FinalFormSelect {...props} multiple />}</Field> -> multiple is in rest
    const multiple = restInput.multiple ?? rest.multiple;

    const value = multiple ? (Array.isArray(incomingValue) ? incomingValue : []) : incomingValue;

    const hasClearableContent = !disabled && (multiple && Array.isArray(value) ? value.length > 0 : value !== undefined && value !== "");

    const endAdornment =
        !required && hasClearableContent ? <ClearInputAdornment position="end" onClick={() => onChange(multiple ? [] : undefined)} /> : null;

    const selectProps = {
        ...rest,
        multiple,
        disabled,
        endAdornment,
        name,
        onChange,
        onFocus,
        onBlur,
        required,
    };

    if (children) {
        return (
            <Select {...selectProps} value={value}>
                {children}
            </Select>
        );
    }

    const showLoadingMessage = loading === true && options.length === 0 && loadingError == null;
    const showLinearProgress = loading === true && !showLoadingMessage;
    const showOptions = options.length > 0 && loadingError == null;
    const showError = loadingError != null && !loading;
    const showNoOptions = loading === false && loadingError == null && options.length === 0;

    return (
        <Select
            {...selectProps}
            endAdornment={
                <InputAdornment position="end">
                    {loadingError && <Error color="error" />}

                    {endAdornment}
                </InputAdornment>
            }
            onChange={(event) => {
                const value = event.target.value;
                onChange(
                    Array.isArray(value)
                        ? value.map((v) => options.find((i) => getOptionValue(i) == v))
                        : options.find((i) => getOptionValue(i) == value),
                );
            }}
            value={Array.isArray(value) ? value.map((i) => getOptionValue(i)) : getOptionValue(value)}
            renderValue={() => {
                if (Array.isArray(value)) {
                    return value.map((i) => getOptionLabel(i)).join(", ");
                } else {
                    return getOptionLabel(value);
                }
            }}
        >
            <LinearLoadingContainer>{showLinearProgress && <LinearProgress />}</LinearLoadingContainer>
            {showLoadingMessage && (
                <MenuItemDisabledOverrideOpacity value="" disabled>
                    <FormattedMessage id="dextinity.common.loading" defaultMessage="Loading ..." />
                </MenuItemDisabledOverrideOpacity>
            )}

            {options.length === 0 &&
                value &&
                (Array.isArray(value) ? (
                    value.map((v) => (
                        <MenuItem value={getOptionValue(v)} key={getOptionValue(v)} sx={{ display: "none" }}>
                            {getOptionLabel(v)}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem value={getOptionValue(value)} key={getOptionValue(value)} sx={{ display: "none" }}>
                        {getOptionLabel(value)}
                    </MenuItem>
                ))}

            {showNoOptions && (
                <MenuItemDisabledOverrideOpacity value="" disabled>
                    {noOptionsText}
                </MenuItemDisabledOverrideOpacity>
            )}
            {showError && (
                <MenuItemDisabledOverrideOpacity value="" disabled>
                    {errorText}
                </MenuItemDisabledOverrideOpacity>
            )}

            {showOptions &&
                options.map((option: T) => (
                    <MenuItem value={getOptionValue(option)} key={getOptionValue(option)}>
                        {getOptionLabel(option)}
                    </MenuItem>
                ))}
        </Select>
    );
};
