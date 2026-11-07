import { type ContentScope, useContentScope } from "@dextinity/cms-admin";
import { useMemo } from "react";

import { useBrevoConfig } from "./BrevoConfigProvider";

interface BrevoScope {
    /** The parts of the content scope that Brevo is configured for, see `BrevoConfig.scopeParts`. */
    scope: ContentScope;
    /** The scope as a label for the page header, e.g. "Main / English". */
    scopeLabel: string;
}

export function useBrevoScope(scopeParts?: string[]): BrevoScope {
    const brevoConfig = useBrevoConfig();
    const { scope: completeScope, values } = useContentScope();
    const parts = scopeParts ?? brevoConfig.scopeParts;
    const partsKey = parts.join(",");

    return useMemo(() => {
        const scope: ContentScope = {};
        const labels: string[] = [];
        for (const part of partsKey.split(",")) {
            scope[part] = completeScope[part];
            const label = values.find((value) => value.scope[part] === completeScope[part])?.label?.[part] ?? completeScope[part];
            if (typeof label === "string" && label !== "") {
                labels.push(label);
            }
        }
        return { scope, scopeLabel: labels.join(" / ") };
    }, [partsKey, completeScope, values]);
}
