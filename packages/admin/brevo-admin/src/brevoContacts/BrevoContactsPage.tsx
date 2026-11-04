import { type GridColDef, Stack, StackPage, StackSwitch, StackToolbar } from "@dextinity/admin";
import { ContentScopeIndicator, useContentScope } from "@dextinity/cms-admin";
import type { DocumentNode } from "graphql";
import type { JSX, ReactNode } from "react";
import { useIntl } from "react-intl";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { ConfigVerification } from "../configVerification/ConfigVerification";
import { BrevoContactsGrid } from "./BrevoContactsGrid";
import { BrevoContactForm, type EditBrevoContactFormValues } from "./form/BrevoContactForm";

interface CreateContactsPageOptions {
    additionalAttributesFragment?: { name: string; fragment: DocumentNode };
    additionalGridFields?: GridColDef[];
    additionalFormFields?: ReactNode;
    input2State?: (values?: EditBrevoContactFormValues) => EditBrevoContactFormValues;
}

function createBrevoContactsPage({
    additionalAttributesFragment,
    additionalFormFields,
    additionalGridFields,
    input2State,
}: CreateContactsPageOptions) {
    function BrevoContactsPage(): JSX.Element {
        const intl = useIntl();
        const { scopeParts } = useBrevoConfig();
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
                <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.brevoContacts.brevoContacts", defaultMessage: "Contacts" })}>
                    <StackSwitch>
                        <StackPage name="grid">
                            <StackToolbar scopeIndicator={<ContentScopeIndicator scope={scope} />} />
                            <BrevoContactsGrid
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
                                <BrevoContactForm
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
                            <BrevoContactForm
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

    return BrevoContactsPage;
}

export { createBrevoContactsPage };
