import {
    Button,
    FillSpace,
    SaveBoundary,
    SaveBoundarySaveButton,
    Stack,
    StackLink,
    StackMainContent,
    StackPage,
    StackSwitch,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
} from "@dextinity/admin";
import { Time } from "@dextinity/admin-icons";
import { ActionLogsGrid, ContentScopeIndicator } from "@dextinity/cms-admin";
import type { GQLQuery } from "@src/graphql.generated";
import { FormattedMessage, useIntl } from "react-intl";

import { ManufacturerForm } from "./generated/ManufacturerForm";
import { ManufacturersGrid } from "./generated/ManufacturersGrid";

const FormToolbar = () => (
    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            <SaveBoundarySaveButton />
        </ToolbarActions>
    </StackToolbar>
);

export function ManufacturersPage() {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "manufacturers.manufacturers", defaultMessage: "Manufacturers" })}>
            <StackSwitch>
                <StackPage name="grid">
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarAutomaticTitleItem />
                        <FillSpace />
                        <ToolbarActions>
                            <Button variant="textDark" startIcon={<Time />} component={StackLink} pageName="action-log" payload="action-log">
                                <FormattedMessage id="manufacturers.actionLog" defaultMessage="Action Log" />
                            </Button>
                        </ToolbarActions>
                    </StackToolbar>
                    <StackMainContent fullHeight>
                        <ManufacturersGrid />
                    </StackMainContent>
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "manufacturers.addManufacturer", defaultMessage: "Add Manufacturer" })}>
                    <SaveBoundary>
                        <FormToolbar />
                        <StackMainContent>
                            <ManufacturerForm />
                        </StackMainContent>
                    </SaveBoundary>
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "manufacturers.editManufacturer", defaultMessage: "Edit Manufacturer" })}>
                    {(selectedId) => (
                        <SaveBoundary>
                            <FormToolbar />
                            <StackMainContent>
                                <ManufacturerForm id={selectedId} />
                            </StackMainContent>
                        </SaveBoundary>
                    )}
                </StackPage>
                <StackPage name="action-log" title={intl.formatMessage({ id: "manufacturers.actionLog", defaultMessage: "Action Log" })}>
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarBackButton />
                        <ToolbarAutomaticTitleItem />
                    </StackToolbar>
                    <ActionLogsGrid<GQLQuery> queryName="manufacturerActionLogs" />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
