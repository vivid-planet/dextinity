import { type RefObject, useCallback, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";

interface UseScrollRestorationProps<Element> {
    ref: RefObject<Element | null>;
    onScroll: () => void;
}

export function useScrollRestoration<Element extends HTMLElement>(identifier: string): UseScrollRestorationProps<Element> {
    const location = useLocation();
    const identifierForRoute = `${location.pathname}-${identifier}`;

    const ref = useRef<Element>(null);

    const scrollPositionsRef = useRef<Record<string, number | undefined>>({});

    useLayoutEffect((): void => {
        if (ref.current) {
            ref.current.scrollTo(0, scrollPositionsRef.current[identifierForRoute] ?? 0);
        }
    }, [identifierForRoute]);

    const onScroll = useCallback(() => {
        if (ref.current) {
            scrollPositionsRef.current[identifierForRoute] = ref.current.scrollTop;
        }
    }, [identifierForRoute]);

    return { ref, onScroll };
}
