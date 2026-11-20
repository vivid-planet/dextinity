import { type RefObject, useLayoutEffect, useRef, useState } from "react";

import { brandSetting } from "../../brand";
import { useAppliedColorScheme } from "../../colorScheme";
import { densitySetting } from "../../density";
import { ToolbarThemed } from "../ThemedProbe";

type ComputedProperty = "color" | "borderTopLeftRadius";

/**
 * Resolves tokens to computed values by applying each to `property` of the probe element of `probeRef`. Unlike the raw
 * custom property, the computed value has every `calc()` and `var()` evaluated, so it can be parsed and compared. The
 * values are read again whenever `refreshKey` changes.
 */
export function useComputedTokensIn(probeRef: RefObject<HTMLElement | null>, tokens: string[], property: ComputedProperty, refreshKey: string) {
    const [values, setValues] = useState<Record<string, string>>({});
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
    }, [probeRef, tokensKey, property, refreshKey]);

    return values;
}

/**
 * Resolves tokens to computed values in the toolbar's theme.
 */
export function useComputedTokens(tokens: string[], property: ComputedProperty) {
    const probeRef = useRef<HTMLSpanElement>(null);
    const colorScheme = useAppliedColorScheme();
    const brand = brandSetting.useValue();
    const density = densitySetting.useValue();
    const values = useComputedTokensIn(probeRef, tokens, property, [colorScheme, brand, density].join());

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
