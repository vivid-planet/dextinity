import type { JSX } from "react";

import { useBrevoScope } from "../common/useBrevoScope";
import { BrevoConfigForm } from "./BrevoConfigForm";

export function BrevoConfigPage(): JSX.Element {
    const { scope, scopeLabel } = useBrevoScope();
    return <BrevoConfigForm scope={scope} scopeLabel={scopeLabel} />;
}
