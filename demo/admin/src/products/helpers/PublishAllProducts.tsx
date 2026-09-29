import { gql, useApolloClient } from "@apollo/client";
import { Button, CancelButton, CrudMoreActionsMenuContext, Dialog } from "@dextinity/admin";
import { Online } from "@dextinity/admin-icons";
import { DialogActions, DialogContent, ListItemIcon, MenuItem } from "@mui/material";
import { useContext, useState } from "react";
import { FormattedMessage } from "react-intl";

import type { GQLPublishAllProductsMutation, GQLPublishAllProductsMutationVariables } from "./PublishAllProducts.generated";

export function PublishAllProducts() {
    const [open, setOpen] = useState(false);
    const client = useApolloClient();
    const { closeMenu } = useContext(CrudMoreActionsMenuContext);

    const handlePublishAll = async () => {
        await client.mutate<GQLPublishAllProductsMutation, GQLPublishAllProductsMutationVariables>({
            mutation: gql`
                mutation PublishAllProducts {
                    publishAllProducts
                }
            `,
        });

        client.cache.evict({ fieldName: "products" });

        handleClose();
    };

    const handleClose = () => {
        setOpen(false);
        closeMenu();
    };

    return (
        <>
            <MenuItem
                onClick={() => {
                    setOpen(true);
                }}
            >
                <ListItemIcon>
                    <Online color="success" />
                </ListItemIcon>
                <FormattedMessage id="products.publishAllProducts.menuItem" defaultMessage="Publish all..." />
            </MenuItem>
            <Dialog open={open} onClose={handleClose} title="Publish all products?">
                <DialogContent>
                    <FormattedMessage id="products.publishAllProducts.dialog.content" defaultMessage="You are about to publish all products." />
                </DialogContent>
                <DialogActions>
                    <CancelButton onClick={handleClose} />
                    <Button onClick={handlePublishAll} startIcon={<Online />} variant="success">
                        <FormattedMessage id="products.publishAllProducts.dialog.button" defaultMessage="You are about to publish all products." />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
