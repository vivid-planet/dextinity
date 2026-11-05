import { useLayoutEffect, useRef, useState } from "react";

import { brandSetting } from "../../brand";
import { useAppliedColorScheme } from "../../colorScheme";
import { ToolbarThemed } from "../ThemedProbe";

/**
 * Resolves color tokens to computed colors in the toolbar's theme. Unlike the raw custom property, the computed color has every
 * `calc()` and `var()` evaluated, so it can be parsed and compared.
 */
export function useResolvedColors(tokens: string[]) {
    const probeRef = useRef<HTMLSpanElement>(null);
    const [colors, setColors] = useState<Record<string, string>>({});
    const colorScheme = useAppliedColorScheme();
    const brand = brandSetting.useValue();
    const tokensKey = tokens.join(",");

    useLayoutEffect(() => {
        const probe = probeRef.current;
        if (!probe) {
            return;
        }
        const resolved: Record<string, string> = {};
        for (const token of tokensKey.split(",")) {
            probe.style.color = `var(${token})`;
            resolved[token] = getComputedStyle(probe).color;
        }
        setColors(resolved);
    }, [tokensKey, colorScheme, brand]);

    const probe = (
        <ToolbarThemed>
            <span ref={probeRef} hidden />
        </ToolbarThemed>
    );

    return { colors, probe };
}
