import { Input as BaseInput } from "@base-ui/react/input";
import { clsx } from "clsx";
import {
    type ComponentPropsWithRef,
    type CSSProperties,
    type ElementType,
    type ForwardedRef,
    forwardRef,
    type JSXElementConstructor,
    type MouseEvent,
    type ReactNode,
    type RefAttributes,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Spinner } from "../spinner/Spinner";
import styles from "./Input.module.scss";

type InputStatus = "error" | "success" | "warning";
type InputSlotElement = "input" | JSXElementConstructor<ComponentPropsWithRef<"input">>;

type InputElementProps<InputElement extends InputSlotElement> = ComponentPropsWithRef<InputElement> & { className?: string };

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type InputOwnerState = {
    status: InputStatus | undefined;
    disabled: boolean;
    readOnly: boolean;
    loading: boolean;
};

interface InputSlots<InputElement extends InputSlotElement, LoadingSpinner extends ElementType> {
    /**
     * Element for the `input` slot.
     *
     * @defaultValue base-ui `Input`
     */
    input?: InputElement;
    /**
     * Element for the `loadingSpinner` slot.
     *
     * @defaultValue `Spinner`
     */
    loadingSpinner?: LoadingSpinner;
}

interface InputSlotProps<InputElement extends InputSlotElement, LoadingSpinner extends ElementType> {
    /** Props for the field around the input, other than `className` and `style`. */
    root?: SlotPropsValue<InputOwnerState, "div">;
    /** Props for the `input` slot. */
    input?: InputElementProps<InputElement> | ((ownerState: InputOwnerState) => InputElementProps<InputElement>);
    /** Props for the `loadingSpinner` slot. */
    loadingSpinner?: SlotPropsValue<InputOwnerState, LoadingSpinner>;
}

export interface InputProps<
    InputElement extends InputSlotElement = typeof BaseInput,
    LoadingSpinner extends ElementType = typeof Spinner,
> extends Omit<BaseInput.Props, "className" | "style" | "ref"> {
    /** Shows the result of validating the value. `error` also marks the input as invalid. */
    status?: InputStatus;
    /**
     * Prevents interaction with the input.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the value without letting the user change it.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /**
     * Shows a spinner after the value.
     *
     * @defaultValue `false`
     */
    loading?: boolean;
    /** Content before the value, such as an icon or a currency symbol. */
    startAdornment?: ReactNode;
    /** Content after the value, such as a unit or an icon button. */
    endAdornment?: ReactNode;
    /** Added alongside the component's own classes on the field around the input. */
    className?: string;
    /** Inline styles for the field around the input. */
    style?: CSSProperties;
    /** Sets which element a named inner part renders as. */
    slots?: InputSlots<InputElement, LoadingSpinner>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: InputSlotProps<InputElement, LoadingSpinner>;
}

const interactiveElementSelector = "input, textarea, select, button, a[href], [tabindex]";

function hasContent(node: ReactNode) {
    return node !== null && node !== undefined && typeof node !== "boolean" && node !== "";
}

function isClickOnInteractiveElementInField(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element)) {
        return false;
    }
    const interactiveElement = event.target.closest(interactiveElementSelector);
    return interactiveElement !== null && event.currentTarget.contains(interactiveElement);
}

function focusInputOnFieldClick(event: MouseEvent<HTMLDivElement>) {
    const input = event.currentTarget.querySelector("input");
    if (isClickOnInteractiveElementInField(event) || input === null) {
        return;
    }
    event.preventDefault();
    input.focus();
}

/**
 * The box of a single-line text field, without label or messages, to combine with `FormLabel` and `FormHelperText`.
 * For a complete field with label, helper text and validation message, use `TextField`.
 */
export const Input: <InputElement extends InputSlotElement = typeof BaseInput, LoadingSpinner extends ElementType = typeof Spinner>(
    props: InputProps<InputElement, LoadingSpinner> & RefAttributes<HTMLInputElement>,
) => ReactNode = forwardRef(function Input<
    InputElement extends InputSlotElement = typeof BaseInput,
    LoadingSpinner extends ElementType = typeof Spinner,
>(
    {
        status,
        disabled,
        readOnly,
        loading,
        startAdornment,
        endAdornment,
        className,
        style,
        slots,
        slotProps,
        ...restProps
    }: InputProps<InputElement, LoadingSpinner>,
    ref: ForwardedRef<HTMLInputElement>,
) {
    const ownerState: InputOwnerState = { status, disabled: disabled === true, readOnly: readOnly === true, loading: loading === true };

    const InputSlot: ElementType = slots?.input ?? BaseInput;
    const LoadingSpinnerSlot: ElementType = slots?.loadingSpinner ?? Spinner;

    const inputProps = resolveSlotProps<InputOwnerState, InputElement, typeof BaseInput>({
        ownProps: {
            ...restProps,
            ref,
            disabled: ownerState.disabled,
            readOnly: ownerState.readOnly,
            "aria-invalid": ownerState.status === "error" || restProps["aria-invalid"],
            "aria-busy": ownerState.loading || restProps["aria-busy"],
            className: styles.input,
        },
        slotProps: slotProps?.input,
        ownerState,
    });
    const loadingSpinnerProps = resolveSlotProps<InputOwnerState, LoadingSpinner, typeof Spinner>({
        ownProps: { className: styles.loadingSpinner },
        slotProps: slotProps?.loadingSpinner,
        ownerState,
    });

    const rootProps = resolveSlotProps<InputOwnerState, "div", "div">({
        ownProps: { className: clsx(styles.root, className), style, onMouseDown: focusInputOnFieldClick },
        slotProps: slotProps?.root,
        ownerState,
    });

    return (
        <div
            {...rootProps}
            data-status={ownerState.status}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-readonly={ownerState.readOnly ? "" : undefined}
            data-loading={ownerState.loading ? "" : undefined}
        >
            {hasContent(startAdornment) && <span className={styles.startAdornment}>{startAdornment}</span>}
            <InputSlot {...inputProps} />
            {hasContent(endAdornment) && <span className={styles.endAdornment}>{endAdornment}</span>}
            {ownerState.loading && <LoadingSpinnerSlot {...loadingSpinnerProps} />}
        </div>
    );
});
