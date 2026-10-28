import { mergeProps } from "@base-ui/react/merge-props";
import type { ComponentPropsWithRef, ElementType } from "react";

export type SlotPropsValue<OwnerState, T extends ElementType> = ComponentPropsWithRef<T> | ((ownerState: OwnerState) => ComponentPropsWithRef<T>);

function isOwnerStateFunction<OwnerState, T extends ElementType>(
    value: SlotPropsValue<OwnerState, T> | undefined,
): value is (ownerState: OwnerState) => ComponentPropsWithRef<T> {
    return typeof value === "function";
}

/**
 * Merges a slot's consumer props with the component's own props, resolving the
 * consumer value with `ownerState` when it is a function.
 *
 * `ownProps` are typed for the slot's default element and the consumer value
 * for the chosen element, so the result fits whichever element renders.
 */
export function resolveSlotProps<OwnerState, Slot extends ElementType, Default extends ElementType>(
    ownProps: ComponentPropsWithRef<Default>,
    value: SlotPropsValue<OwnerState, Slot> | undefined,
    ownerState: OwnerState,
) {
    const consumerProps = isOwnerStateFunction(value) ? value(ownerState) : value;

    return mergeProps<Slot>(ownProps, consumerProps);
}
