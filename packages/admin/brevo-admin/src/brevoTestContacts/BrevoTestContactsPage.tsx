import type { JSX } from "react";

import { type BrevoContactsListOptions, BrevoContactsListPage } from "../brevoContacts/BrevoContactsListPage";
import { useBrevoScope } from "../common/useBrevoScope";
import { ConfigVerification } from "../configVerification/ConfigVerification";

interface CreateTestContactsPageOptions<AdditionalAttributes extends object> extends BrevoContactsListOptions<AdditionalAttributes> {
    /** @deprecated Pass via BrevoConfigProvider instead */
    scopeParts?: string[];
}

/**
 * Creates the page of the test contacts, who receive the test emails of a campaign: the same list and side panel as the contacts page.
 */
export function createBrevoTestContactsPage<AdditionalAttributes extends object = Record<string, unknown>>({
    scopeParts,
    ...options
}: CreateTestContactsPageOptions<AdditionalAttributes>) {
    function BrevoTestContactsPage(): JSX.Element {
        const { scope, scopeLabel } = useBrevoScope(scopeParts);
        return (
            <ConfigVerification scope={scope}>
                <BrevoContactsListPage<AdditionalAttributes> {...options} variant="testContacts" scope={scope} scopeLabel={scopeLabel} />
            </ConfigVerification>
        );
    }

    return BrevoTestContactsPage;
}
