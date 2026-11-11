import { useLayoutEffect, useRef, useState } from "react";

import { useToolbarBrand } from "../brand";
import { useToolbarColorScheme } from "../colorScheme";
import { useToolbarDensity } from "../density";
import { ToolbarTheme } from "../themeDecorator";

/**
 * Resolves custom properties in the brand, the color scheme, and the density picked in the toolbar, and resolves them again when one of them changes.
 * Render the returned `probe` for the values to be read.
 */
export function useResolvedTokens(names: string[]) {
    const probeRef = useRef<HTMLSpanElement>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const colorScheme = useToolbarColorScheme();
    const brand = useToolbarBrand();
    const density = useToolbarDensity();
    const namesKey = names.join(",");

    useLayoutEffect(() => {
        if (!probeRef.current) {
            return;
        }
        const style = getComputedStyle(probeRef.current);
        setValues(Object.fromEntries(namesKey.split(",").map((name) => [name, style.getPropertyValue(name).trim()])));
    }, [namesKey, colorScheme, brand, density]);

    const probe = (
        <ToolbarTheme>
            <span ref={probeRef} hidden />
        </ToolbarTheme>
    );

    return { values, probe };
}
