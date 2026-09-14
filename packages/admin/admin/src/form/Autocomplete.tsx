import { ChevronDown, Error } from "@dextinity/admin-icons";
import {
    Autocomplete,
    autocompleteClasses,
    type AutocompleteProps,
    type AutocompleteRenderInputParams,
    CircularProgress,
    InputAdornment,
    InputBase,
    Typography,
} from "@mui/material";
import { css, styled } from "@mui/material/styles";
import { type ReactNode, useCallback, useRef, useState } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { ClearInputAdornment } from "../common/ClearInputAdornment";
import type { AsyncAutocompleteOptionsProps } from "./useAsyncAutocompleteOptionsProps";

// In multi-select mode the chips and the input wrap onto multiple lines. The end adornment must never wrap below
// the chips, so it is removed from the flex flow (`MultipleEndAdornmentContainer` is absolutely positioned) and its
// measured width is reserved as padding instead, so the chips never render underneath it.
const MultipleInputBase = styled(InputBase, {
    shouldForwardProp: (prop) => prop !== "endAdornmentWidth",
})<{ endAdornmentWidth: number }>(
    ({ endAdornmentWidth }) => css`
        .${autocompleteClasses.root}
            &.${autocompleteClasses.inputRoot},
            .${autocompleteClasses.root}.${autocompleteClasses.hasPopupIcon}
            &.${autocompleteClasses.inputRoot} {
            padding-right: ${endAdornmentWidth}px;
        }
    `,
);

const MultipleEndAdornmentContainer = styled("div")(
    ({ theme }) => css`
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(2)};

        .${autocompleteClasses.endAdornment} {
            /* Reset MUI's absolute positioning (relative to the input root) so the popup icon stays in the
               container's flex flow next to the other adornments. */
            position: static;
            transform: none;
        }
    `,
);

export type FinalFormAutocompleteProps<
    T extends Record<string, any>,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined,
> = Partial<AsyncAutocompleteOptionsProps<T>> &
    Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, "renderInput"> & {
        errorText?: ReactNode;
        required?: boolean;
        disabled?: boolean;
        readOnly?: boolean;
    };

type FinalFormAutocompleteInternalProps<T extends Record<string, any>> = FieldRenderProps<T, HTMLInputElement | HTMLTextAreaElement>;

/**
 * Final Form-compatible Autocomplete component.
 *
 * @see {@link AutocompleteField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
export const FinalFormAutocomplete = <
    T extends Record<string, any>,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
>({
    input: { onChange, value: incomingValue, multiple, ...restInput },
    loading = false,
    loadingError,
    isAsync = false,
    disabled,
    readOnly,
    loadingText = <FormattedMessage id="dextinity.common.loading" defaultMessage="Loading ..." />,
    popupIcon = <ChevronDown />,
    noOptionsText = <FormattedMessage id="dextinity.finalFormAutocomplete.noOptions" defaultMessage="No options." />,
    errorText = <FormattedMessage id="dextinity.finalFormSelect.error" defaultMessage="Error loading options." />,
    required,
    ...rest
}: FinalFormAutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & FinalFormAutocompleteInternalProps<T>) => {
    const value = multiple ? (Array.isArray(incomingValue) ? incomingValue : []) : incomingValue;
    const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value);
    const clearable = !required && !disabled && !readOnly;

    const [endAdornmentWidth, setEndAdornmentWidth] = useState(0);
    const endAdornmentResizeObserver = useRef<ResizeObserver | undefined>(undefined);
    // The rendered adornments (loading, clear, error, popup icon) change at runtime, e.g. the clear button only
    // renders once a value is selected, so the reserved width must be measured, not hardcoded.
    const endAdornmentRef = useCallback((node: HTMLDivElement | null) => {
        endAdornmentResizeObserver.current?.disconnect();
        endAdornmentResizeObserver.current = undefined;

        if (node) {
            setEndAdornmentWidth(node.offsetWidth);
            endAdornmentResizeObserver.current = new ResizeObserver(() => {
                setEndAdornmentWidth(node.offsetWidth);
            });
            endAdornmentResizeObserver.current.observe(node);
        }
    }, []);

    return (
        <Autocomplete
            popupIcon={popupIcon}
            disableClearable
            // Opens the dropdown when the (multiple) end adornment container is clicked, which focuses the input
            // but swallows the click before it reaches the input root.
            openOnFocus
            noOptionsText={
                loadingError ? (
                    <Typography variant="body2" component="span">
                        {errorText}
                    </Typography>
                ) : (
                    <Typography variant="body2" component="span">
                        {noOptionsText}
                    </Typography>
                )
            }
            loading={loading}
            loadingText={
                <Typography variant="body2" component="span">
                    {loadingText}
                </Typography>
            }
            isOptionEqualToValue={(option: T, value: T) => {
                if (!value) {
                    return false;
                }
                return option === value;
            }}
            onChange={(_e, option) => {
                onChange(option);
            }}
            value={value ? (value as T) : (null as any)}
            {...rest}
            disabled={disabled}
            readOnly={readOnly}
            multiple={multiple as Multiple}
            renderInput={(params: AutocompleteRenderInputParams) => {
                const endAdornment = (
                    <>
                        {loading && <CircularProgress color="inherit" size={16} />}
                        {clearable && hasValue && <ClearInputAdornment position="end" onClick={() => onChange(multiple ? [] : "")} />}
                        {loadingError && <Error color="error" />}
                        {params.InputProps.endAdornment}
                    </>
                );

                if (multiple) {
                    return (
                        <MultipleInputBase
                            {...restInput}
                            {...params}
                            {...params.InputProps}
                            // Disable HTML required for multiple select as the input stays empty (values are shown for example as chips) and the input is used for the autocomplete input
                            required={false}
                            endAdornmentWidth={endAdornmentWidth}
                            endAdornment={<MultipleEndAdornmentContainer ref={endAdornmentRef}>{endAdornment}</MultipleEndAdornmentContainer>}
                        />
                    );
                }

                return (
                    <InputBase
                        {...restInput}
                        {...params}
                        {...params.InputProps}
                        required={required}
                        endAdornment={<InputAdornment position="end">{endAdornment}</InputAdornment>}
                    />
                );
            }}
        />
    );
};
