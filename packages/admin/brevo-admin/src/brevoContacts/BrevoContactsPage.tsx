import type { JSX } from "react";

import { useBrevoScope } from "../common/useBrevoScope";
import { ConfigVerification } from "../configVerification/ConfigVerification";
import { type BrevoContactsListOptions, BrevoContactsListPage } from "./BrevoContactsListPage";

/**
 * Creates the page of the newsletter contacts: a list with a search, a side panel to add and edit a contact, and the import from CSV.
 */
export function createBrevoContactsPage<AdditionalAttributes extends object = Record<string, unknown>>(
    options: BrevoContactsListOptions<AdditionalAttributes>,
) {
    function BrevoContactsPage(): JSX.Element {
        const { scope, scopeLabel } = useBrevoScope();
        return (
            <ConfigVerification scope={scope}>
                <BrevoContactsListPage<AdditionalAttributes> {...options} variant="contacts" scope={scope} scopeLabel={scopeLabel} />
            </ConfigVerification>
        );
    }

    return BrevoContactsPage;
}
