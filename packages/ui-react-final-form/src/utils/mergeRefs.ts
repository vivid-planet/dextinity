import type { Ref, RefCallback } from "react";

export function mergeRefs<Instance>(...refs: Array<Ref<Instance> | undefined>): RefCallback<Instance> {
    return (instance) => {
        for (const ref of refs) {
            if (typeof ref === "function") {
                ref(instance);
            } else if (ref != null) {
                ref.current = instance;
            }
        }
    };
}
