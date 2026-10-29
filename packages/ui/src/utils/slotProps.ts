import { mergeProps } from "@base-ui/react/merge-props";
import type { ComponentPropsWithRef, ElementType } from "react";

export type SlotPropsValue<OwnerState, T extends ElementType> = ComponentPropsWithRef<T> | ((ownerState: OwnerState) => ComponentPropsWithRef<T>);

function isOwnerStateFunction<OwnerState, T extends ElementType>(
    value: SlotPropsValue<OwnerState, T> | undefined,
): value is (ownerState: OwnerState) => ComponentPropsWithRef<T> {
    return typeof value === "function";
}

/**
 * Merges a slot's consumer props with the component's own props, calling
 * `slotProps` with `ownerState` when it is a function.
 *
 * `ownProps` are typed for the slot's default element and `slotProps` for the
 * chosen element, so the result fits whichever element renders.
 */
export function resolveSlotProps<OwnerState, Slot extends ElementType, Default extends ElementType>({
    ownProps,
    slotProps,
    ownerState,
}: {
    ownProps: ComponentPropsWithRef<Default>;
    slotProps?: SlotPropsValue<OwnerState, Slot>;
    ownerState: OwnerState;
}) {
    const consumerProps = isOwnerStateFunction(slotProps) ? slotProps(ownerState) : slotProps;

    return mergeProps<Slot>(ownProps, consumerProps);
}
