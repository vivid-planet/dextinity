"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const breakpoints = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1600,
};

interface AnimateGroupContextValue {
    visible: boolean;
    onVisible: () => void;
    disabled: boolean;
    /** False until the breakpoint has been measured on the client. Children must not report visibility before that. */
    initialized: boolean;
}

const AnimateGroupContext = createContext<AnimateGroupContextValue | null>(null);

export function useAnimateGroup() {
    return useContext(AnimateGroupContext);
}

type BreakpointKey = keyof typeof breakpoints;

function getDisabledRanges(disabledBreakpoints: BreakpointKey[]) {
    const keys = Object.keys(breakpoints) as BreakpointKey[];
    const sorted = [...disabledBreakpoints].sort((a, b) => breakpoints[a] - breakpoints[b]);
    const ranges: Array<[number, number]> = [];

    for (const breakpoint of sorted) {
        const idx = keys.indexOf(breakpoint);
        if (idx < keys.length - 1) {
            // Disable from this breakpoint up to the next one
            ranges.push([breakpoints[breakpoint], breakpoints[keys[idx + 1]]]);
        } else {
            // Last breakpoint: disable from its value to Infinity
            ranges.push([breakpoints[breakpoint], Infinity]);
        }
    }
    return ranges;
}

function isInDisabledRange(width: number, ranges: Array<[number, number]>) {
    return ranges.some(([min, max]) => width >= min && width < max);
}

export function AnimateGroup({ children, disabledBreakpoints = [] }: { children: ReactNode; disabledBreakpoints?: BreakpointKey[] }) {
    const [visible, setVisible] = useState(false);
    // null until measured: the width is only known on the client, and rendering it into the markup would break hydration.
    const [disabled, setDisabled] = useState<boolean | null>(null);
    const disabledRef = useRef<boolean | null>(null);

    const onVisible = useCallback(() => {
        // Ignore reports until the breakpoint is known, and while the group is disabled. Child effects run before the
        // effect below, so an initially visible child would otherwise force every sibling visible at a disabled breakpoint.
        if (disabledRef.current !== false) {
            return;
        }
        setVisible(true);
    }, []);

    // The prop defaults to a new array on every render, so key the effect on its content instead of its identity.
    const disabledBreakpointsKey = disabledBreakpoints.join(",");
    const ranges = useMemo(
        () => getDisabledRanges(disabledBreakpointsKey ? (disabledBreakpointsKey.split(",") as BreakpointKey[]) : []),
        [disabledBreakpointsKey],
    );

    useEffect(() => {
        function checkDisabledBreakpoints() {
            const isDisabled = isInDisabledRange(window.innerWidth, ranges);
            disabledRef.current = isDisabled;
            setDisabled(isDisabled);
        }
        checkDisabledBreakpoints();
        window.addEventListener("resize", checkDisabledBreakpoints);
        return () => window.removeEventListener("resize", checkDisabledBreakpoints);
    }, [ranges]);

    const value = useMemo(
        () => ({ visible, onVisible, disabled: disabled ?? false, initialized: disabled !== null }),
        [visible, onVisible, disabled],
    );

    return <AnimateGroupContext.Provider value={value}>{children}</AnimateGroupContext.Provider>;
}
