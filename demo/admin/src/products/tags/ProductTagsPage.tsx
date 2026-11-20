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

import { getProductTagDisplayName } from "./getProductTagDisplayName";
import { ProductTagForm } from "./ProductTagForm";
import { ProductTagsGrid } from "./ProductTagsGrid";

const FormToolbar = ({ id }: { id?: string }) => (
    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
        <ToolbarBackButton />
        <ToolbarAutomaticTitleItem />
        <FillSpace />
        <ToolbarActions>
            {id && <ActionLogButton entityId={id} entity="ProductTag" />}
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
                            <FormToolbar id={id} />
                            <StackMainContent>
                                <ProductTagForm id={id} />
                            </StackMainContent>
                        </SaveBoundary>
                    )}
                </StackPage>
                <StackPage name="action-log" title={intl.formatMessage({ id: "dextinity.actionLogButton.title", defaultMessage: "Action Log" })}>
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarBackButton />
                        <ToolbarAutomaticTitleItem />
                    </StackToolbar>
                    <ActionLogsGrid entity="ProductTag" getDisplayName={getProductTagDisplayName} />
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}
