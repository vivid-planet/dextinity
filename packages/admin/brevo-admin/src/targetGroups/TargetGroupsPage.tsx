import { Stack, StackPage, StackSwitch, Toolbar } from "@dextinity/admin";
import { ContentScopeIndicator, useContentScope } from "@dextinity/cms-admin";
import type { DocumentNode } from "graphql";
import type { JSX, ReactNode } from "react";
import { useIntl } from "react-intl";

import { useBrevoConfig } from "../common/BrevoConfigProvider";
import { ConfigVerification } from "../configVerification/ConfigVerification";
import { type EditTargetGroupFinalFormValues, TargetGroupForm } from "./TargetGroupForm";
import { type AdditionalContactAttributesType, TargetGroupsGrid } from "./TargetGroupsGrid";

interface CreateContactsPageOptions<
    TargetGroupValues extends EditTargetGroupFinalFormValues,
    ContactAttributes extends AdditionalContactAttributesType,
> {
    additionalFormFields?: ReactNode;
    exportTargetGroupOptions?: {
        additionalAttributesFragment: { name: string; fragment: DocumentNode };
        /**
         * Fields appended to the CSV export. Generic over the row so that consumers can type it according to
         * their `additionalAttributesFragment`.
         */
        exportFields: { renderValue: (row: ContactAttributes) => string; headerName: string }[];
    };
    nodeFragment?: { name: string; fragment: DocumentNode };
    /**
     * Maps the loaded data to the initial state of the `additionalFormFields`.
     * Generic over the values so that consumers can type them according to their additional attributes.
     */
    input2State?: (values?: TargetGroupValues) => EditTargetGroupFinalFormValues;
    valuesToOutput?: (values: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
}

export function createTargetGroupsPage<
    TargetGroupValues extends EditTargetGroupFinalFormValues = EditTargetGroupFinalFormValues,
    ContactAttributes extends AdditionalContactAttributesType = AdditionalContactAttributesType,
>({ additionalFormFields, nodeFragment, input2State, exportTargetGroupOptions }: CreateContactsPageOptions<TargetGroupValues, ContactAttributes>) {
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
