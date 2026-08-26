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
} from "@dextinity/admin";
import { ContentScopeIndicator } from "@dextinity/cms-admin";
import { useIntl } from "react-intl";

import { ProductTagForm } from "./generated/ProductTagForm";
import { ProductTagsGrid } from "./generated/ProductTagsGrid";

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

export function ProductTagsPage() {
    const intl = useIntl();
    return (
        <Stack topLevelTitle={intl.formatMessage({ id: "products.productTags", defaultMessage: "Product Tags" })}>
            <StackSwitch>
                <StackPage name="grid">
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />} />
                    <StackMainContent fullHeight>
                        <ProductTagsGrid />
                    </StackMainContent>
                </StackPage>
                <StackPage name="add" title={intl.formatMessage({ id: "products.addProductTag", defaultMessage: "Add product tag" })}>
                    <SaveBoundary>
                        <FormToolbar />
                        <StackMainContent>
                            <ProductTagForm />
                        </StackMainContent>
                    </SaveBoundary>
                </StackPage>
                <StackPage name="edit" title={intl.formatMessage({ id: "products.editProductTag", defaultMessage: "Edit product tag" })}>
                    {(id) => (
                        <SaveBoundary>
                            <FormToolbar />
                            <StackMainContent>
                                <ProductTagForm id={id} />
                            </StackMainContent>
                        </SaveBoundary>
                    )}
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
