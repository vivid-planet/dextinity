import type { DataGridColumn } from "@dextinity/ui";
import type { DocumentNode } from "graphql";
import type { JSX, ReactNode } from "react";
import { Route, Switch, useRouteMatch } from "react-router";

import type { AdditionalAttributesFragment } from "../brevoContacts/additionalAttributesFragment";
import type { BrevoContactRow } from "../brevoContacts/BrevoContactsListPage";
import { useBrevoScope } from "../common/useBrevoScope";
import { ConfigVerification } from "../configVerification/ConfigVerification";
import { type EditTargetGroupFinalFormValues, TargetGroupEditPage } from "./TargetGroupEditPage";
import { TargetGroupsListPage } from "./TargetGroupsListPage";

export interface ExportTargetGroupOptions<AdditionalAttributes extends object = Record<string, unknown>> {
    additionalAttributesFragment: AdditionalAttributesFragment;
    /** Further columns of the exported CSV, after the Brevo ID, the email address and the blocked states. */
    exportFields: DataGridColumn<BrevoContactRow<AdditionalAttributes>>[];
}

interface CreateTargetGroupsPageOptions<AdditionalAttributes extends object> {
    /** Fields of `@dextinity/ui-react-final-form` for the filters that assign contacts to the target group by their attributes. */
    additionalFormFields?: ReactNode;
    exportTargetGroupOptions?: ExportTargetGroupOptions<AdditionalAttributes>;
    nodeFragment?: { name: string; fragment: DocumentNode };
    input2State?: (values?: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
    valuesToOutput?: (values: EditTargetGroupFinalFormValues) => EditTargetGroupFinalFormValues;
}

/**
 * Creates the page of the target groups: a list with a search and the export of a group's contacts, and an edit page per target group at
 * `<list URL>/<id>/edit` with its filters and contacts.
 */
export function createTargetGroupsPage<AdditionalAttributes extends object = Record<string, unknown>>({
    additionalFormFields,
    nodeFragment,
    input2State,
    valuesToOutput,
    exportTargetGroupOptions,
}: CreateTargetGroupsPageOptions<AdditionalAttributes>) {
    function TargetGroupsPage(): JSX.Element {
        const { scope, scopeLabel } = useBrevoScope();
        const routeMatch = useRouteMatch();

        return (
            <ConfigVerification scope={scope}>
                <Switch>
                    <Route path={`${routeMatch.path}/:targetGroupId/edit`}>
                        {({ match }) =>
                            match && (
                                <TargetGroupEditPage
                                    key={match.params.targetGroupId}
                                    id={match.params.targetGroupId}
                                    scope={scope}
                                    scopeLabel={scopeLabel}
                                    listUrl={routeMatch.url}
                                    additionalFormFields={additionalFormFields}
                                    nodeFragment={nodeFragment}
                                    input2State={input2State}
                                    valuesToOutput={valuesToOutput}
                                />
                            )
                        }
                    </Route>
                    <Route>
                        <TargetGroupsListPage<AdditionalAttributes>
                            scope={scope}
                            scopeLabel={scopeLabel}
                            listUrl={routeMatch.url}
                            exportTargetGroupOptions={exportTargetGroupOptions}
                        />
                    </Route>
                </Switch>
            </ConfigVerification>
        );
    }

    return TargetGroupsPage;
}
