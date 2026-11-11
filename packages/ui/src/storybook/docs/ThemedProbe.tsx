import { type PropsWithChildren, useLayoutEffect, useRef, useState } from "react";

import { Theme } from "../../components/theme/Theme";
import { useToolbarBrand } from "../brand";
import { useAppliedColorScheme } from "../colorScheme";

/**
 * Renders its children inside a `Theme` with the brand and color scheme picked in the toolbar, for docs pages that aren't wrapped by the theme decorator.
 */
function ToolbarThemed({ children }: PropsWithChildren) {
    return (
        <Theme colorScheme={useAppliedColorScheme()} brand={useToolbarBrand()}>
            {children}
        </Theme>
    );
}

/**
 * Resolves the given custom properties in the toolbar's theme, re-reading them when brand or color scheme change.
 */
export function useResolvedTokens(names: string[]) {
    const probeRef = useRef<HTMLSpanElement>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const colorScheme = useAppliedColorScheme();
    const brand = useToolbarBrand();
    const namesKey = names.join(",");

    useLayoutEffect(() => {
        if (!probeRef.current) {
            return;
        }
        const style = getComputedStyle(probeRef.current);
        setValues(Object.fromEntries(namesKey.split(",").map((name) => [name, style.getPropertyValue(name).trim()])));
    }, [namesKey, colorScheme, brand]);

    const probe = (
        <ToolbarThemed>
            <span ref={probeRef} hidden />
        </ToolbarThemed>
    );

    return { values, probe };
}
