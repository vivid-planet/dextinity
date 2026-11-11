import { useLayoutEffect, useRef, useState } from "react";

import { useToolbarBrand } from "../brand";
import { useToolbarColorScheme } from "../colorScheme";
import { ToolbarTheme } from "../themeDecorator";

/**
 * Resolves custom properties in the brand and the color scheme picked in the toolbar, and resolves them again when either changes.
 * Render the returned `probe` for the values to be read.
 */
export function useResolvedTokens(names: string[]) {
    const probeRef = useRef<HTMLSpanElement>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const colorScheme = useToolbarColorScheme();
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
        <ToolbarTheme>
            <span ref={probeRef} hidden />
        </ToolbarTheme>
    );

    return { values, probe };
}
