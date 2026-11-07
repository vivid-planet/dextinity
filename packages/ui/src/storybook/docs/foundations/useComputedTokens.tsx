import { useLayoutEffect, useRef, useState } from "react";

import { brandSetting } from "../../brand";
import { useAppliedColorScheme } from "../../colorScheme";
import { densitySetting } from "../../density";
import { ToolbarThemed } from "../ThemedProbe";

/**
 * Resolves tokens to computed values in the toolbar's theme by applying each to `property` of a probe. Unlike the raw custom
 * property, the computed value has every `calc()` and `var()` evaluated, so it can be parsed and compared.
 */
export function useComputedTokens(tokens: string[], property: "color" | "borderTopLeftRadius") {
    const probeRef = useRef<HTMLSpanElement>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const colorScheme = useAppliedColorScheme();
    const brand = brandSetting.useValue();
    const density = densitySetting.useValue();
    const tokensKey = tokens.join(",");

    useLayoutEffect(() => {
        const probe = probeRef.current;
        if (!probe) {
            return;
        }
        const resolved: Record<string, string> = {};
        for (const token of tokensKey.split(",")) {
            probe.style[property] = `var(${token})`;
            resolved[token] = getComputedStyle(probe)[property];
        }
        setValues(resolved);
    }, [tokensKey, property, colorScheme, brand, density]);

    const probe = (
        <ToolbarThemed>
            <span ref={probeRef} hidden />
        </ToolbarThemed>
    );

    return { values, probe };
}

/**
 * Resolves color tokens to computed colors in the toolbar's theme.
 */
export function useResolvedColors(tokens: string[]) {
    const { values, probe } = useComputedTokens(tokens, "color");
    return { colors: values, probe };
}
