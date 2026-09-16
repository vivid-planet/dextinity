import { type ContentScope, useContentScope } from "@dextinity/cms-admin";
import type { JSX } from "react";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { BrevoConfigForm } from "./BrevoConfigForm";

export function BrevoConfigPage(): JSX.Element {
    const { scopeParts } = useBrevoConfig();
    const { scope: completeScope } = useContentScope();

    const scope = scopeParts.reduce((acc, scopePart) => {
        acc[scopePart] = completeScope[scopePart];
        return acc;
    }, {} as ContentScope);

    return <BrevoConfigForm scope={scope} />;
}
