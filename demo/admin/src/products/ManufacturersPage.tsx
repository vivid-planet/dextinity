import {
    FillSpace,
    SaveBoundary,
    SaveBoundarySaveButton,
    Stack,
    StackMainContent,
    StackPage,
    StackSwitch,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
} from "@comet/admin";
import { ActionLogButton, ContentScopeIndicator } from "@comet/cms-admin";
import type { GQLQuery } from "@src/graphql.generated";
import { ManufacturerForm } from "@src/products/ManufacturerForm";
import { ManufacturersGrid } from "@src/products/ManufacturersGrid";
import { useIntl } from "react-intl";

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
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />} />
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
            </StackSwitch>
        </Stack>
    );
}
