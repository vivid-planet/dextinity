import debounce from "lodash.debounce";
import { type RefObject, useEffect, useMemo, useState } from "react";

export const useObservedWidth = (ref: RefObject<HTMLElement | null>): number => {
    const [containerWidth, setContainerWidth] = useState(ref.current?.clientWidth ?? 0);

    const elementObserver = useMemo(() => {
        return new ResizeObserver(() => {
            debounce(() => {
                if (!ref.current) {
                    return;
                }
                setContainerWidth(ref.current.clientWidth);
            }, 500)();
        });
    }, [ref]);

    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const element = ref.current;

        elementObserver.observe(element);
        setContainerWidth(element.clientWidth);

        return () => {
            elementObserver.unobserve(element);
        };
    }, [elementObserver, ref]);

    return containerWidth;
};
