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
import { FormattedMessage, useIntl } from "react-intl";

import { ProductCategoriesGrid } from "./categories/ProductCategoriesGrid";
import { ProductCategoryForm } from "./categories/ProductCategoryForm";
import { getProductCategoryDisplayName } from "./getProductCategoryDisplayName";

const FormToolbar = ({ id }: { id?: string }) => (
    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            {id && <ActionLogButton entityId={id} entity="ProductCategory" />}
            <SaveBoundarySaveButton />
        </ToolbarActions>
    </StackToolbar>
);

export function ProductCategoriesPage() {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "products.productCategories", defaultMessage: "Product Categories" })}>
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
                        <ProductCategoriesGrid />
                    </StackMainContent>
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "products.addProductCategory", defaultMessage: "Add product category" })}>
                    <SaveBoundary>
                        <FormToolbar />
                        <StackMainContent>
                            <ProductCategoryForm />
                        </StackMainContent>
                    </SaveBoundary>
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "products.editProductCategory", defaultMessage: "Edit product category" })}>
                    {(id) => (
                        <SaveBoundary>
                            <FormToolbar id={id} />
                            <StackMainContent>
                                <ProductCategoryForm id={id} />
                            </StackMainContent>
                        </SaveBoundary>
                    )}
                </StackPage>
                <StackPage name="action-log" title={intl.formatMessage({ id: "dextinity.actionLogButton.title", defaultMessage: "Action Log" })}>
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarBackButton />
                        <ToolbarAutomaticTitleItem />
                    </StackToolbar>
                    <ActionLogsGrid entity="ProductCategory" getDisplayName={getProductCategoryDisplayName} />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
