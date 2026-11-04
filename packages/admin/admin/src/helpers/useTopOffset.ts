import { type RefObject, useEffect, useState } from "react";

export const useTopOffset = (ref: RefObject<HTMLElement | null>) => {
    const [topOffset, setTopOffset] = useState(0);

    useEffect(() => {
        const updateTopOffset = () => {
            if (ref.current) {
                setTopOffset(ref.current.getBoundingClientRect().top + window.scrollY);
            }
        };

        updateTopOffset();
        window.addEventListener("resize", updateTopOffset);

        return () => {
            window.removeEventListener("resize", updateTopOffset);
        };
    }, [ref]);

    return topOffset;
};
