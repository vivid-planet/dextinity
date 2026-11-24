import { type RefObject, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export const useObservedWidth = (ref: RefObject<HTMLElement | null>): number => {
    const [containerWidth, setContainerWidth] = useState(ref.current?.clientWidth ?? 0);

    const updateContainerWidth = useDebouncedCallback(() => {
        if (!ref.current) {
            return;
        }
        setContainerWidth(ref.current.clientWidth);
    }, 500);

    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const element = ref.current;

        const elementObserver = new ResizeObserver(updateContainerWidth);
        elementObserver.observe(element);
        setContainerWidth(element.clientWidth);

        return () => {
            elementObserver.disconnect();
            updateContainerWidth.cancel();
        };
    }, [ref, updateContainerWidth]);

    return containerWidth;
};
