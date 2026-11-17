import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import {
    type ElementType,
    type ForwardedRef,
    forwardRef,
    type HTMLAttributes,
    type PropsWithChildren,
    type ReactNode,
    type RefAttributes,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import type { IconName } from "../icon/iconRegistry";
import styles from "./FieldValidationMessage.module.scss";

export type FieldValidationMessageState = "error" | "warning" | "success";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FieldValidationMessageOwnerState = {
    state: FieldValidationMessageState;
};

interface FieldValidationMessageSlots<IconSlot extends ElementType, Text extends ElementType> {
    /**
     * Element for the `icon` slot, which holds the icon of the `state`.
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

interface FieldValidationMessageSlotProps<IconSlot extends ElementType, Text extends ElementType> {
    /** Props for the `icon` slot. */
    icon?: SlotPropsValue<FieldValidationMessageOwnerState, IconSlot>;
    /** Props for the `text` slot. */
    text?: SlotPropsValue<FieldValidationMessageOwnerState, Text>;
}

export interface FieldValidationMessageProps<IconSlot extends ElementType = "span", Text extends ElementType = "span">
    extends Omit<HTMLAttributes<HTMLElement>, "className">, PropsWithChildren {
    /** The result of the validation, shown by the message's icon and color. */
    state: FieldValidationMessageState;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: FieldValidationMessageSlots<IconSlot, Text>;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldValidationMessageSlotProps<IconSlot, Text>;
}

const stateIcons: Record<FieldValidationMessageState, IconName> = {
    error: "alert",
    warning: "warning-triangle",
    success: "check",
};

/**
 * Says whether a form field's value is valid, e.g. why it is invalid and how to fix it, or an error about the whole form. For a control
 * without a `Field`; `Field` shows its own `validationMessage`.
 *
 * `children`: The message.
 */
export const FieldValidationMessage: <IconSlot extends ElementType = "span", Text extends ElementType = "span">(
    props: FieldValidationMessageProps<IconSlot, Text> & RefAttributes<HTMLElement>,
) => ReactNode = forwardRef(function FieldValidationMessage<IconSlot extends ElementType = "span", Text extends ElementType = "span">(
    { state, className, slots, slotProps, children, ...restProps }: FieldValidationMessageProps<IconSlot, Text>,
    ref: ForwardedRef<HTMLElement>,
) {
    const ownerState: FieldValidationMessageOwnerState = { state };

    const IconSlotElement: ElementType = slots?.icon ?? "span";
    const TextSlot: ElementType = slots?.text ?? "span";

    const iconProps = resolveSlotProps<FieldValidationMessageOwnerState, IconSlot, "span">({
        ownProps: { className: styles.icon },
        slotProps: slotProps?.icon,
        ownerState,
    });
    const textProps = resolveSlotProps<FieldValidationMessageOwnerState, Text, "span">({
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
                    <IconSlotElement {...iconProps}>
                        <Icon name={stateIcons[state]} />
                    </IconSlotElement>
                    <TextSlot {...textProps}>{children}</TextSlot>
                </>
            ),
        },
    });
});
