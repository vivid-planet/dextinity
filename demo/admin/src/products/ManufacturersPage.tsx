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
import { ActionLogButton, ActionLogsGrid, ContentScopeIndicator } from "@dextinity/cms-admin";
import type { GQLQuery } from "@src/graphql.generated";
import { ManufacturerForm } from "@src/products/ManufacturerForm";
import { ManufacturersGrid } from "@src/products/ManufacturersGrid";
import { FormattedMessage, useIntl } from "react-intl";

const FormToolbar = ({ id }: { id?: string }) => (
    <StackToolbar>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            {id && <ActionLogButton<GQLQuery> entityId={id} queryName="manufacturerActionLogs" />}
            <SaveBoundarySaveButton />
        </ToolbarActions>
    </StackToolbar>
);

export function ManufacturersPage() {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "products.manufacturers", defaultMessage: "Manufacturers" })}>
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
                <StackPage name="edit" title={intl.formatMessage({ id: "products.editManufacturers", defaultMessage: "Edit Manufacturers" })}>
                    {(selectedId) => (
                        <SaveBoundary>
                            <FormToolbar id={selectedId} />
                            <StackMainContent>
                                <ManufacturerForm id={selectedId} />
                            </StackMainContent>
                        </SaveBoundary>
                    )}
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "products.addManufacturers", defaultMessage: "Add Manufacturers" })}>
                    <SaveBoundary>
                        <FormToolbar />
                        <StackMainContent>
                            <ManufacturerForm />
                        </StackMainContent>
                    </SaveBoundary>
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
