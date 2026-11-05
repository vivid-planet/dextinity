import { type PropsWithChildren, useLayoutEffect, useRef, useState } from "react";

import { Theme } from "../../components/theme/Theme";
import { brandSetting } from "../brand";
import { useAppliedColorScheme } from "../colorScheme";
import { densitySetting } from "../density";

/**
 * Renders its children inside a `Theme` with the toolbar settings, for docs pages that aren't wrapped by the theme decorator.
 */
export function ToolbarThemed({ children }: PropsWithChildren) {
    return (
        <Theme colorScheme={useAppliedColorScheme()} brand={brandSetting.useValue()} density={densitySetting.useValue()}>
            {children}
        </Theme>
    );
}

/**
 * Resolves the given custom properties in the toolbar's theme, re-reading them when brand, color scheme, or density change.
 */
export function useResolvedTokens(names: string[]) {
    const probeRef = useRef<HTMLSpanElement>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const colorScheme = useAppliedColorScheme();
    const brand = brandSetting.useValue();
    const density = densitySetting.useValue();
    const namesKey = names.join(",");

    useLayoutEffect(() => {
        if (!probeRef.current) {
            return;
        }
        const style = getComputedStyle(probeRef.current);
        setValues(Object.fromEntries(namesKey.split(",").map((name) => [name, style.getPropertyValue(name).trim()])));
    }, [namesKey, colorScheme, brand, density]);

    const probe = (
        <ToolbarThemed>
            <span ref={probeRef} hidden />
        </ToolbarThemed>
    );

    return { values, probe };
}
