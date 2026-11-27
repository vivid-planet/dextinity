import { type Ref, type RefObject, useCallback } from "react";

/**
 * A ref callback that sets the component's own ref and the ref a consumer passed through `slotProps`.
 */
export function useMergedRef<T>(ownRef: RefObject<T | null>, slotRef: Ref<T> | undefined) {
    return useCallback(
        (node: T | null) => {
            ownRef.current = node;
            if (typeof slotRef === "function") {
                slotRef(node);
            } else if (slotRef != null) {
                slotRef.current = node;
            }
        },
        [ownRef, slotRef],
    );
}
