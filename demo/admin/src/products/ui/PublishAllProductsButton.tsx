import { gql, useApolloClient } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { Button, ConfirmDialog, Icon, type NewToast } from "@dextinity/ui";
import { useState } from "react";
import { useIntl } from "react-intl";

import type { GQLProductsUiPublishAllMutation, GQLProductsUiPublishAllMutationVariables } from "./PublishAllProductsButton.generated";

const publishAllProductsMutation = gql`
    mutation ProductsUiPublishAll {
        publishAllProducts
    }
`;

interface PublishAllProductsButtonProps {
    onNotify: (toast: NewToast) => void;
}

export function PublishAllProductsButton({ onNotify }: PublishAllProductsButtonProps) {
    const intl = useIntl();
    const client = useApolloClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const publishAll = async () => {
        setPublishing(true);
        try {
            await client.mutate<GQLProductsUiPublishAllMutation, GQLProductsUiPublishAllMutationVariables>({
                mutation: publishAllProductsMutation,
                context: LocalErrorScopeApolloContext,
            });
            client.cache.evict({ fieldName: "products" });
            onNotify({ message: intl.formatMessage({ id: "uiDemo.products.publishAll.done", defaultMessage: "All products are published" }) });
            setIsDialogOpen(false);
        } catch (error) {
            onNotify({
                tone: "error",
                message: intl.formatMessage(
                    { id: "uiDemo.products.publishAll.failed", defaultMessage: "Publishing failed: {reason}" },
                    { reason: error instanceof Error ? error.message : String(error) },
                ),
            });
        } finally {
            setPublishing(false);
        }
    };

    return (
        <>
            <Button variant="outlined" color="secondary" startIcon={<Icon name="bolt" />} onClick={() => setIsDialogOpen(true)}>
                {intl.formatMessage({ id: "uiDemo.products.publishAll", defaultMessage: "Publish all" })}
            </Button>
            <ConfirmDialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!publishing) {
                        setIsDialogOpen(open);
                    }
                }}
                title={intl.formatMessage({ id: "uiDemo.products.publishAll.title", defaultMessage: "Publish all products?" })}
                description={intl.formatMessage({
                    id: "uiDemo.products.publishAll.description",
                    defaultMessage: "Every product, also the unpublished and deleted ones, goes live on the site.",
                })}
                confirmLabel={intl.formatMessage({ id: "uiDemo.products.publishAll", defaultMessage: "Publish all" })}
                confirmIcon={<Icon name="bolt" />}
                onConfirm={() => void publishAll()}
                loading={publishing}
                labels={{ cancel: intl.formatMessage({ id: "uiDemo.productsCommon.cancel", defaultMessage: "Cancel" }) }}
            />
        </>
    );
}
