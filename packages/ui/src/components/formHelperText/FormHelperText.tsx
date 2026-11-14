import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { type ElementType, type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./FormHelperText.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FormHelperTextOwnerState = {
    error: boolean;
};

interface FormHelperTextSlots<IconSlot extends ElementType, Text extends ElementType> {
    /**
     * Element for the `icon` slot.
     *
     * @defaultValue `span`
     */
    icon?: IconSlot;
    /**
     * Element for the `text` slot.
     *
     * @defaultValue `span`
     */
    text?: Text;
}

interface FormHelperTextSlotProps<IconSlot extends ElementType, Text extends ElementType> {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<FormHelperTextOwnerState, IconSlot>;
    /** Props for the `text` slot. */
    text?: SlotPropsValue<FormHelperTextOwnerState, Text>;
}

export interface FormHelperTextProps<IconSlot extends ElementType = "span", Text extends ElementType = "span"> extends Omit<
    HTMLAttributes<HTMLElement>,
    "className"
> {
    /** The help text or validation message. */
    children?: ReactNode;
    /**
     * Explains why the field's value is invalid, with an error icon.
     *
     * @defaultValue `false`
     */
    error?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: FormHelperTextSlots<IconSlot, Text>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FormHelperTextSlotProps<IconSlot, Text>;
}

/**
 * Gives additional information about a form field, or the reason its value is invalid.
 * `Field` already shows its own help and validation message; use `FormHelperText` below a control without a `Field`.
 */
export const FormHelperText: <IconSlot extends ElementType = "span", Text extends ElementType = "span">(
    props: FormHelperTextProps<IconSlot, Text> & RefAttributes<HTMLElement>,
) => ReactNode = forwardRef(function FormHelperText<IconSlot extends ElementType = "span", Text extends ElementType = "span">(
    { error, className, slots, slotProps, children, ...restProps }: FormHelperTextProps<IconSlot, Text>,
    ref: ForwardedRef<HTMLElement>,
) {
    const ownerState: FormHelperTextOwnerState = { error: error === true };

    const IconSlotElement: ElementType = slots?.icon ?? "span";
    const TextSlot: ElementType = slots?.text ?? "span";

    const iconProps = resolveSlotProps<FormHelperTextOwnerState, IconSlot, "span">({
        ownProps: { className: styles.icon },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const textProps = resolveSlotProps<FormHelperTextOwnerState, Text, "span">({
        ownProps: { className: styles.text },
        slotProps: slotProps?.text,
        ownerState,
    });

    return useRender({
        ref,
        state: ownerState,
        defaultTagName: "p",
        props: {
            ...restProps,
            className: clsx(styles.root, className),
            children: (
                <>
                    {ownerState.error && (
                        <IconSlotElement {...iconProps}>
                            <Icon name="alert" />
                        </IconSlotElement>
                    )}
                    <TextSlot {...textProps}>{children}</TextSlot>
                </>
            ),
        },
    });
});
