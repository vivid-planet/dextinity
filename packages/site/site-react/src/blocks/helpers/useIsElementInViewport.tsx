"use client";

import { type RefObject, useEffect } from "react";

export const useIsElementInViewport = (ref: RefObject<Element | null>, callback: (inView: boolean) => void) => {
    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                callback(entry.isIntersecting);
            },
            { threshold: 0.5 },
        );

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref, callback]);
};
