import { type GridColDef, Stack, StackPage, StackSwitch, StackToolbar } from "@dextinity/admin";
import { ContentScopeIndicator, useContentScope } from "@dextinity/cms-admin";
import type { DocumentNode } from "graphql";
import type { JSX, ReactNode } from "react";
import { useIntl } from "react-intl";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { ConfigVerification } from "../configVerification/ConfigVerification";
import { BrevoTestContactsGrid } from "./BrevoTestContactsGrid";
import { BrevoTestContactForm, type EditBrevoContactFormValues } from "./form/BrevoTestContactForm";

interface CreateContactsPageOptions<ContactValues extends EditBrevoContactFormValues> {
    /** @deprecated Pass via BrevoConfigProvider instead */
    scopeParts?: string[];
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    additionalGridFields?: GridColDef[];
    additionalFormFields?: ReactNode;
    /**
     * Maps the loaded data to the initial state of the `additionalFormFields`.
     * Generic over the values so that consumers can type them according to their additional attributes.
     */
    input2State?: (values?: ContactValues) => EditBrevoContactFormValues;
}

function createBrevoTestContactsPage<ContactValues extends EditBrevoContactFormValues = EditBrevoContactFormValues>({
    scopeParts: passedScopeParts,
    additionalAttributesFragment,
    additionalFormFields,
    additionalGridFields,
    input2State,
}: CreateContactsPageOptions<ContactValues>) {
    function BrevoTestContactsPage(): JSX.Element {
        const intl = useIntl();
        const brevoConfig = useBrevoConfig();
        const scopeParts = passedScopeParts ?? brevoConfig.scopeParts;
        const { scope: completeScope } = useContentScope();

        const scope = scopeParts.reduce(
            (acc, scopePart) => {
                acc[scopePart] = completeScope[scopePart];
                return acc;
            },
            {} as { [key: string]: unknown },
        );

        return (
            <ConfigVerification scope={scope}>
                <Stack
                    topLevelTitle={intl.formatMessage({
                        id: "dextinity.brevoContacts.brevoTestContacts",
                        defaultMessage: "Test Contacts",
                    })}
                >
                    <StackSwitch>
                        <StackPage name="grid">
                            <StackToolbar scopeIndicator={<ContentScopeIndicator scope={scope} />} />
                            <BrevoTestContactsGrid
                                scope={scope}
                                additionalAttributesFragment={additionalAttributesFragment}
                                additionalGridFields={additionalGridFields}
                            />
                        </StackPage>
                        <StackPage
                            name="edit"
                            title={intl.formatMessage({ id: "dextinity.brevoContacts.editBrevoContact", defaultMessage: "Edit contact" })}
                        >
                            {(selectedId) => (
                                <BrevoTestContactForm
                                    additionalFormFields={additionalFormFields}
                                    additionalAttributesFragment={additionalAttributesFragment}
                                    input2State={input2State}
                                    id={Number(selectedId)}
                                    scope={scope}
                                />
                            )}
                        </StackPage>
                        <StackPage
                            name="add"
                            title={intl.formatMessage({ id: "dextinity.brevoContacts.addBrevoContact", defaultMessage: "Add contact" })}
                        >
                            <BrevoTestContactForm
                                additionalFormFields={additionalFormFields}
                                additionalAttributesFragment={additionalAttributesFragment}
                                input2State={input2State}
                                scope={scope}
                            />
                        </StackPage>
                    </StackSwitch>
                </Stack>
            </ConfigVerification>
        );
    }

    return BrevoTestContactsPage;
}

export { createBrevoTestContactsPage };
