import { type RefObject, useEffect, useState } from "react";

export const useElementIsOverflowing = (ref: RefObject<HTMLElement | null>) => {
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const element = ref.current;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setIsOverflowing(entry.target.clientWidth < entry.target.scrollWidth);
            }
        });

        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
            observer.disconnect();
        };
    }, [ref]);

    return isOverflowing;
};
