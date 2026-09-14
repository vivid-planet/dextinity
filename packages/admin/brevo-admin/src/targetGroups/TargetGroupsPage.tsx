import { Stack, StackPage, StackSwitch, Toolbar } from "@dextinity/admin";
import { ContentScopeIndicator, useContentScope } from "@dextinity/cms-admin";
import type { DocumentNode } from "graphql";
import type { JSX, ReactNode } from "react";
import { useIntl } from "react-intl";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { ConfigVerification } from "../configVerification/ConfigVerification";
import { type EditTargetGroupFinalFormValues, TargetGroupForm } from "./TargetGroupForm";
import { type AdditionalContactAttributesType, TargetGroupsGrid } from "./TargetGroupsGrid";

interface CreateContactsPageOptions {
    additionalFormFields?: ReactNode;
    exportTargetGroupOptions?: {
        additionalAttributesFragment: { name: string; fragment: DocumentNode };
        exportFields: { renderValue: (row: AdditionalContactAttributesType) => string; headerName: string }[];
    };
    nodeFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
    valuesToOutput?: (values: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
}

export function createTargetGroupsPage({ additionalFormFields, nodeFragment, input2State, exportTargetGroupOptions }: CreateContactsPageOptions) {
    function TargetGroupsPage(): JSX.Element {
        const { scopeParts } = useBrevoConfig();
        const { scope: completeScope } = useContentScope();
        const intl = useIntl();

        const scope = scopeParts.reduce(
            (acc, scopePart) => {
                acc[scopePart] = completeScope[scopePart];
                return acc;
            },
            {} as { [key: string]: unknown },
        );

        return (
            <ConfigVerification scope={scope}>
                <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.targetGroups.targetGroups", defaultMessage: "Target groups" })}>
                    <StackSwitch>
                        <StackPage name="grid">
                            <Toolbar scopeIndicator={<ContentScopeIndicator scope={scope} />} />
                            <TargetGroupsGrid scope={scope} exportTargetGroupOptions={exportTargetGroupOptions} />
                        </StackPage>
                        <StackPage
                            name="edit"
                            title={intl.formatMessage({
                                id: "dextinity.targetGroups.editTargetGroup",
                                defaultMessage: "Edit target group",
                            })}
                        >
                            {(selectedId) => (
                                <TargetGroupForm
                                    id={selectedId}
                                    scope={scope}
                                    additionalFormFields={additionalFormFields}
                                    nodeFragment={nodeFragment}
                                    input2State={input2State}
                                />
                            )}
                        </StackPage>
                    </StackSwitch>
                </Stack>
            </ConfigVerification>
        );
    }

    return TargetGroupsPage;
}
