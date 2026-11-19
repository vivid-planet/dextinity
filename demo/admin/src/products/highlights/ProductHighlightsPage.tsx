import {
    Button,
    FillSpace,
    MainContent,
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
import { FormattedMessage, useIntl } from "react-intl";

import { getProductHighlightDisplayName } from "./getProductHighlightDisplayName";
import { ProductHighlightForm } from "./ProductHighlightForm";
import { ProductHighlightsGrid } from "./ProductHighlightsGrid";

const FormToolbar = ({ id }: { id?: string }) => (
    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            {id && <ActionLogButton entityId={id} entity="ProductHighlight" />}
            <SaveBoundarySaveButton />
        </ToolbarActions>
    </StackToolbar>
);

export function ProductHighlightsPage() {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "products.productHighlights", defaultMessage: "Product Highlights" })}>
            <StackSwitch>
                <StackPage name="grid">
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarAutomaticTitleItem />
                        <FillSpace />
                        <ToolbarActions>
                            <Button variant="textDark" startIcon={<Time />} component={StackLink} pageName="action-log" payload="action-log">
                                <FormattedMessage id="dextinity.actionLogButton.title" defaultMessage="Action Log" />
                            </Button>
                        </ToolbarActions>
                    </StackToolbar>
                    <StackMainContent fullHeight>
                        <ProductHighlightsGrid />
                    </StackMainContent>
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "products.editProductHighlight", defaultMessage: "Edit Product Highlight" })}>
                    {(selectedProductId) => (
                        <SaveBoundary>
                            <>
                                <FormToolbar id={selectedProductId} />
                                <MainContent>
                                    <ProductHighlightForm id={selectedProductId} />
                                </MainContent>
                            </>
                        </SaveBoundary>
                    )}
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "products.addProductHighlight", defaultMessage: "Add Product Highlight" })}>
                    <SaveBoundary>
                        <FormToolbar />
                        <MainContent>
                            <ProductHighlightForm />
                        </MainContent>
                    </SaveBoundary>
                </StackPage>
                <StackPage name="action-log" title={intl.formatMessage({ id: "dextinity.actionLogButton.title", defaultMessage: "Action Log" })}>
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarBackButton />
                        <ToolbarAutomaticTitleItem />
                    </StackToolbar>
                    <ActionLogsGrid entity="ProductHighlight" getDisplayName={getProductHighlightDisplayName} />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
